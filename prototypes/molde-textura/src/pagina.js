// Ponto de entrada do pacote que roda dentro do Chromium (via Playwright).
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SLOTS, SLOTS_QUE_REPETEM, DENSIDADE } from './config.js';
import { adicionarLuzes, enquadrar, renderizar, getRenderer } from './palco.js';
import { montarCena, adicionarArestas, geometrias, POSICOES, LADO_DO_CHAO } from './cena.js';
import { materiaisDoMolde, carregarConjunto } from './materiais.js';
import { ROTULOS } from './moldes/index.js';

const FUNDO = '#f6efe2', CARTAO = '#fffaf0', BORDA = '#e4d8c4', TINTA = '#3b2a1e', TINTA_FRACA = '#6b5a4c';
const FONTE = "Inter, 'Helvetica Neue', Arial, sans-serif";
const RAIO_DA_LUZ = LADO_DO_CHAO * 0.85;

// `estado` é 'molde' (cinza, sem textura) ou o nome de uma pasta de texturas/.
async function materiaisDe(estado) {
  return estado === 'molde' ? materiaisDoMolde() : (await carregarConjunto(estado)).materiais;
}

// ---------- moldes lidos de volta dos arquivos .glb (só para conferir a exportação) ----------

// No glTF a origem do UV fica no canto de cima da imagem; por isso as texturas entram sem a inversão vertical
// que o three.js faz por padrão. Se o resultado ficar igual ao da cena montada direto do código, o .glb está certo.
const materiaisGLB = new Map();
async function materiaisParaGLB(estado) {
  if (estado === 'molde') return materiaisDoMolde();
  if (!materiaisGLB.has(estado)) {
    const { materiais } = await carregarConjunto(estado);
    const out = {};
    for (const slot of SLOTS) {
      const m = materiais[slot].clone();
      m.map = materiais[slot].map.clone();
      m.map.flipY = false;
      m.map.offset.y = 1 - m.map.repeat.y; // com o V invertido, a escala de tamanhoNoMundo parte do alto da imagem
      m.map.needsUpdate = true;
      out[slot] = m;
    }
    materiaisGLB.set(estado, out);
  }
  return materiaisGLB.get(estado);
}

const glbs = new Map();
async function cenaDosGLB(materiais) {
  const cena = new THREE.Scene();
  for (const [nome, lugares] of Object.entries(POSICOES)) {
    if (!glbs.has(nome)) glbs.set(nome, (await new GLTFLoader().loadAsync(`moldes/${nome}.glb`)).scene);
    for (const [x, z] of lugares) {
      const g = glbs.get(nome).clone(true);
      g.traverse((o) => {
        if (!o.isMesh) return;
        const slot = o.material.name;
        if (!SLOTS.includes(slot)) throw new Error(`material sem slot conhecido em ${nome}.glb: "${slot}"`);
        o.material = materiais[slot];
        o.castShadow = SLOTS_QUE_REPETEM.includes(slot);
        o.receiveShadow = true;
      });
      g.position.set(x, 0, z);
      cena.add(g);
    }
  }
  return cena;
}

// ---------- renderização ----------

// Renderiza a cena inteira num canvas. Todos os estados passam por aqui com os mesmos números;
// a câmera é calculada só a partir da geometria.
// `giro` e `elevacao` só mudam nas imagens de conferência; o padrão é a câmera do jogo.
async function quadroDaCena(estado, { w, h, ss = 2, arestas = estado === 'molde', origem = 'codigo', giro, elevacao } = {}) {
  const cena = origem === 'glb' ? await cenaDosGLB(await materiaisParaGLB(estado)) : montarCena(await materiaisDe(estado));
  const cam = enquadrar(montarCena(materiaisDoMolde()), w / h, { giro, elevacao });
  if (arestas) adicionarArestas(cena);
  adicionarLuzes(cena, { raio: RAIO_DA_LUZ });
  return renderizar(cena, cam, w, h, { ss });
}

// Renderiza um molde sozinho, sem chão, numa escala fixa (pixels por unidade de mundo).
async function quadroDoMolde(nome, estado, { pxPorUnidade = 120, ss = 2, margem = 0.6, giro } = {}) {
  const cena = montarCena(await materiaisDe(estado), { so: nome });
  const medida = enquadrar(cena, 1, { margem: 0, giro }).userData;
  const w = Math.ceil((medida.larguraNoMundo + margem) * pxPorUnidade), h = Math.ceil((medida.alturaNoMundo + margem) * pxPorUnidade);
  const cam = enquadrar(cena, w / h, { largura: w / pxPorUnidade, giro });
  adicionarLuzes(cena, { raio: RAIO_DA_LUZ, sombras: false });
  return renderizar(cena, cam, w, h, { ss });
}

// ---------- páginas (cada "shot" monta a página que o Playwright fotografa) ----------

function limparPagina(largura, padding = 0) {
  document.body.innerHTML = '';
  document.body.style.cssText = `margin:0;background:${FUNDO};font-family:${FONTE};color:${TINTA};width:${largura}px;box-sizing:border-box;padding:${padding}px`;
}
function el(tag, css, texto) {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (texto !== undefined) e.textContent = texto;
  return e;
}
function cabecalho(titulo, sub) {
  const c = el('div', 'margin-bottom:30px');
  c.appendChild(el('div', 'font-size:64px;font-weight:800;letter-spacing:-1px', titulo));
  if (sub) c.appendChild(el('div', `font-size:31px;line-height:1.4;color:${TINTA_FRACA};margin-top:10px;max-width:3300px`, sub));
  return c;
}
// Cartão com a imagem em cima e o rótulo embaixo. A imagem fica no tamanho exato do canvas (1 pixel do canvas = 1 pixel da página).
function cartao(conteudo, titulo, legenda) {
  const c = el('div', `background:${CARTAO};border:2px solid ${BORDA};border-radius:18px;overflow:hidden;flex:none;width:${conteudo.width}px`);
  conteudo.style.cssText = `display:block;width:${conteudo.width}px;height:${conteudo.height}px`;
  c.appendChild(conteudo);
  const t = el('div', `padding:18px 24px 24px;border-top:2px solid ${BORDA}`);
  t.appendChild(el('div', 'font-size:40px;font-weight:700', titulo));
  if (legenda) t.appendChild(el('div', `font-size:28px;line-height:1.35;color:${TINTA_FRACA};margin-top:6px`, legenda));
  c.appendChild(t);
  return c;
}
const tamanhoDaPagina = () => ({ width: document.body.offsetWidth, height: Math.ceil(document.body.getBoundingClientRect().height) });

const shots = {};

// Uma imagem só, com a cena num estado. `origem: 'glb'` monta a cena a partir dos arquivos exportados.
shots.estado = async ({ estado, w = 2400, h = 1500, ss = 2, origem = 'codigo', arestas, giro, elevacao }) => {
  limparPagina(w);
  const c = await quadroDaCena(estado, { w, h, ss, origem, arestas, giro, elevacao });
  c.style.display = 'block';
  document.body.appendChild(c);
  return { width: w, height: h };
};

// A comparação: a mesma cena lado a lado, uma vez por estado.
shots.comparacao = async ({ paineis, w = 1280, h = 860, titulo, sub, rodape }) => {
  const P = 44, G = 28;
  limparPagina(paineis.length * w + (paineis.length - 1) * G + 2 * P + paineis.length * 4, P);
  document.body.appendChild(cabecalho(titulo, sub));
  const linha = el('div', `display:flex;gap:${G}px;align-items:stretch`);
  for (const p of paineis) linha.appendChild(cartao(await quadroDaCena(p.estado, { w, h }), p.titulo, p.legenda));
  document.body.appendChild(linha);
  if (rodape) document.body.appendChild(el('div', `font-size:31px;line-height:1.4;color:${TINTA};margin-top:28px;max-width:3300px`, rodape));
  return tamanhoDaPagina();
};

// Os moldes isolados com o xadrez numerado, todos na mesma escala: uma fileira por vista.
shots.uv = async ({ conjunto = 'teste-uv', moldes = ['casa', 'celeiro', 'canteiro'], pxPorUnidade = 120, titulo, sub, vistas }) => {
  const P = 44, G = 28;
  const fileiras = [];
  for (const vista of vistas) {
    const quadros = [];
    for (const nome of moldes) quadros.push([nome, await quadroDoMolde(nome, conjunto, { pxPorUnidade, giro: vista.giro })]);
    fileiras.push([vista, quadros]);
  }
  const largura = Math.max(...fileiras.map(([, q]) => q.reduce((s, [, c]) => s + c.width + 4, 0) + (q.length - 1) * G));
  limparPagina(largura + 2 * P, P);
  document.body.appendChild(cabecalho(titulo, sub));
  for (const [vista, quadros] of fileiras) {
    document.body.appendChild(el('div', 'font-size:44px;font-weight:700;margin:34px 0 16px', vista.titulo));
    const linha = el('div', `display:flex;gap:${G}px;align-items:flex-end`);
    for (const [nome, c] of quadros) linha.appendChild(cartao(c, ROTULOS[nome], (vista.legendas || {})[nome]));
    document.body.appendChild(linha);
  }
  return tamanhoDaPagina();
};

// As imagens de cada conjunto: as que repetem em ladrilho 2x2, porta e janela sobre quadriculado (para ver a transparência).
shots.texturas = async ({ conjuntos, titulo, sub, lado = 440 }) => {
  const P = 44, G = 18;
  limparPagina(2 * P + 5 * (lado + G) + lado / 2 + G + lado / 2 + 8, P);
  document.body.appendChild(cabecalho(titulo, sub));
  const xadrez = 'background-color:#fff;background-image:linear-gradient(45deg,#d8d8d8 25%,transparent 25%,transparent 75%,#d8d8d8 75%),linear-gradient(45deg,#d8d8d8 25%,transparent 25%,transparent 75%,#d8d8d8 75%);background-size:28px 28px;background-position:0 0,14px 14px';
  for (const pasta of conjuntos) {
    const { def } = await carregarConjunto(pasta);
    document.body.appendChild(el('div', 'font-size:40px;font-weight:700;margin:34px 0 16px', `${def.nome} — texturas/${pasta}/`));
    const linha = el('div', `display:flex;gap:${G}px;align-items:flex-start`);
    for (const slot of SLOTS) {
      const s = def.slots[slot], url = `texturas/${pasta}/${s.arquivo}`;
      const caixa = el('div', '');
      let img;
      if (s.repete) {
        img = el('div', `width:${lado}px;height:${lado}px;background:url(${url});background-size:${lado / 2}px ${lado / 2}px;border-radius:6px`);
      } else {
        img = el('div', `${xadrez};border-radius:6px;line-height:0`);
        const i = el('img', `width:${lado / 2}px;display:block`);
        i.src = url;
        await new Promise((ok, erro) => { i.onload = ok; i.onerror = erro; });
        img.appendChild(i);
      }
      caixa.appendChild(img);
      caixa.appendChild(el('div', 'font-size:30px;font-weight:700;margin-top:10px', slot));
      caixa.appendChild(el('div', `font-size:23px;color:${TINTA_FRACA}`, s.repete ? `repete a cada ${s.tamanhoNoMundo} unidades` : 'imagem única'));
      linha.appendChild(caixa);
    }
    document.body.appendChild(linha);
  }
  return tamanhoDaPagina();
};

// ---------- exportação e medição ----------

// Exporta um molde como .glb: uma malha, uma primitiva por slot, material com o nome do slot, sem textura.
async function exportarGLB(nome) {
  const geos = geometrias()[nome], slots = Object.keys(geos);
  const copias = slots.map((s) => {
    const g = geos[s].clone();
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i)); // convenção do glTF: V = 0 no alto da imagem
    return g;
  });
  const malha = new THREE.Mesh(
    mergeGeometries(copias, true),
    slots.map((s) => new THREE.MeshStandardMaterial({ name: s, color: 0xcccccc, roughness: 1, metalness: 0, transparent: !SLOTS_QUE_REPETEM.includes(s) })),
  );
  malha.name = nome;
  const cena = new THREE.Scene();
  cena.name = nome;
  cena.add(malha);
  const buf = new Uint8Array(await new GLTFExporter().parseAsync(cena, { binary: true }));
  let bin = '';
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return btoa(bin);
}

// Triângulos, vértices e chamadas de desenho de cada molde (medidas no renderizador, com o molde sozinho em cena).
async function medir(conjunto) {
  const materiais = await materiaisDe(conjunto);
  const r = getRenderer();
  const out = {};
  for (const nome of Object.keys(POSICOES)) {
    const geos = geometrias()[nome];
    const porSlot = Object.fromEntries(Object.entries(geos).map(([s, g]) => [s, g.index.count / 3]));
    // duas cenas iguais: uma sem sombra (só a passada de cor) e uma com o sol projetando sombra
    const contar = (sombras) => {
      const cena = montarCena(materiais, { so: nome });
      const cam = enquadrar(cena, 1);
      adicionarLuzes(cena, { raio: RAIO_DA_LUZ, sombras });
      r.setSize(256, 256, false);
      r.info.reset();
      r.render(cena, cam);
      return { chamadas: r.info.render.calls, triangulos: r.info.render.triangles };
    };
    const cor = contar(false), total = contar(true).chamadas;
    out[nome] = {
      triangulos: Object.values(porSlot).reduce((a, b) => a + b, 0),
      vertices: Object.values(geos).reduce((a, g) => a + g.attributes.position.count, 0),
      slots: Object.keys(geos),
      triangulosPorSlot: porSlot,
      chamadasDeDesenho: cor.chamadas,
      triangulosDesenhados: cor.triangulos,
      chamadasComSombra: total,
    };
  }
  return out;
}

// Resumo do canal alfa (a silhueta) da cena num estado. Se o resumo é igual em todos os estados,
// o enquadramento é idêntico: mesma câmera, mesma geometria, mesmos pixels cobertos.
async function silhueta(estado, { w = 1280, h = 860 } = {}) {
  const c = await quadroDaCena(estado, { w, h, arestas: false });
  const d = c.getContext('2d').getImageData(0, 0, w, h).data;
  let hash = 0x811c9dc5, cobertos = 0;
  for (let i = 3; i < d.length; i += 4) {
    hash = Math.imul(hash ^ d[i], 0x01000193) >>> 0;
    if (d[i]) cobertos++;
  }
  return { hash, cobertos };
}

window.MT = {
  THREE,
  async shot(nome, opts = {}) {
    const fn = shots[nome];
    if (!fn) throw new Error(`shot desconhecido: ${nome} (${Object.keys(shots).join(', ')})`);
    return (await fn(opts)) || {};
  },
  exportarGLB,
  medir,
  silhueta,
  moldes: () => Object.keys(POSICOES),
  densidade: DENSIDADE,
};
