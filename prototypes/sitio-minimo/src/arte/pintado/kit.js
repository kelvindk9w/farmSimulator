// Kit do conjunto de arte "pintado": o que dá a cara de 3D pintado à mão da imagem-alvo
// (arte/estilo/rodada-03/var-3-pintado.png). As formas são as roliças do conjunto "brinquedo"; por cima delas vai:
//   1. textura pintada: um atlas só (texturas/atlas-info.json), com as texturas que o Codex pintou. Cada peça ganha as
//      coordenadas de textura na hora em que é construída (projeção em caixa, em cilindro, pela câmera ou as da própria peça);
//   2. cor por vértice multiplicando a textura: dá o tom de cada peça e o claro-escuro pintado (mais escuro perto do chão
//      e por baixo, mais claro por cima), que a luz do jogo sozinha não dá;
//   3. luz quente com sombra fria (o sol amarelo e o céu azulado deste conjunto) e um mapa de sombra só.
// O material é o Lambert comum do three, com mapa e cor por vértice: nada de shader próprio nem de efeito em tela cheia.
// Os esqueletos e a animação são os do conjunto "codigo" (ver comEstilo em ../codigo/base.js).
import * as THREE from 'three';
import { matFrom } from '../../../../../tools/visual-refs/src/lib/builder.js';
import { BuilderBrinquedo, decalque, ovalDe, projetorDeSombra } from '../brinquedo/kit.js';
import INFO from './texturas/atlas-info.json';

export { decalque, ovalDe, projetorDeSombra };

// ---------------- atlas de texturas ----------------
const ATLAS = INFO.tamanho, CASA = INFO.casa, MARGEM = INFO.margem, MIOLO = CASA - 2 * MARGEM, POR_LADO = ATLAS / CASA, K = MIOLO / ATLAS;
const ARQUIVO = './pintado-atlas.png'; // vai para dist/ pelo build (src/arte/pintado/publico/)
// canto de baixo, à esquerda, do miolo de uma textura, em coordenadas do atlas (v cresce para cima)
const origem = (nome) => { const t = INFO.texturas[nome] || INFO.texturas.liso; return [(t.c * CASA + MARGEM) / ATLAS, ((POR_LADO - 1 - t.l) * CASA + MARGEM) / ATLAS]; };

// O atlas só é pedido ao servidor quando o conjunto é usado pela primeira vez. Até ele chegar (e se não chegar), vale
// uma textura provisória de 4 x 4 pontos com a cor média de cada textura: o jogo começa na hora, só sem a pintura.
let _tex = null;
export const estado = { atlas: 'não pedido' }; // 'não pedido' | 'carregando' | 'pronto' | 'falhou' (para quem for depurar)
function texturaDoAtlas() {
  if (_tex) return _tex;
  const c = document.createElement('canvas'); c.width = c.height = POR_LADO;
  const x = c.getContext('2d'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, POR_LADO, POR_LADO);
  for (const t of Object.values(INFO.texturas)) { x.fillStyle = t.cor; x.fillRect(t.c, t.l, 1, 1); }
  _tex = new THREE.Texture(c);
  _tex.colorSpace = THREE.SRGBColorSpace; _tex.magFilter = _tex.minFilter = THREE.NearestFilter; _tex.generateMipmaps = false; _tex.needsUpdate = true;
  const img = new Image();
  estado.atlas = 'carregando';
  img.onload = () => {
    _tex.dispose(); // a imagem muda de tamanho: a textura da placa de vídeo é refeita no próximo desenho
    _tex.image = img; _tex.magFilter = THREE.LinearFilter; _tex.minFilter = THREE.LinearMipmapLinearFilter; _tex.generateMipmaps = true; _tex.anisotropy = 2; _tex.needsUpdate = true;
    estado.atlas = 'pronto';
  };
  img.onerror = () => { estado.atlas = 'falhou'; console.warn('conjunto "pintado": o atlas de texturas não carregou; as peças ficam com a cor média de cada textura'); };
  img.src = ARQUIVO;
  return _tex;
}

// ---------------- cores ----------------
// Uma cor do conjunto diz também qual textura a peça usa: a cor multiplica a textura (branco = a textura como foi pintada).
// As texturas "liso", "penugem" e "tabua" são quase brancas, e a cor é quem manda.
// k > 1 clareia além da pintura (a cor por vértice pode passar de 1)
const T = (tex, cor = '#ffffff', uv = null, k = 1) => { const c = new THREE.Color(cor).multiplyScalar(k); c.tex = tex; c.uv = uv; return c; };
export const tom = (cor, k) => { const c = cor.clone().multiplyScalar(k); c.tex = cor.tex; c.uv = cor.uv; return c; }; // a mesma textura, mais clara ou mais escura
export const P = {
  // chão
  grama: T('grama'), gramaSeca: T('grama', '#f6eeb8'), barranco: T('barranco'),
  caminho: T('areia', '#f8e6d2'), terreiro: T('areia', '#f6f8fa'), pedrinha: T('areia', '#fff4e4', null, 1.16),
  tufo: T('grama', '#b8d890'), tufoEscuro: T('grama', '#86b070'), flor: T('liso', '#fff3d6'), florRosa: T('liso', '#ffc4d8'), miolo: T('liso', '#f8c62c'),
  // madeira, telha, pedra
  madeira: T('madeira'), madeiraClara: T('madeira', '#fff6e4', null, 1.18), madeiraEscura: T('madeira', '#b89488'), madeiraFunda: T('madeira', '#72544e'),
  cerca: T('madeira', '#f2ece4'), casca: T('casca'), cascaClara: T('casca', '#fff4e0', null, 1.2),
  telha: T('telha'), telhaEscura: T('telha', '#b89a94'), pedra: T('pedra'), pedraClara: T('pedra', '#fffaf2', null, 1.08), pedraEscura: T('pedra', '#c8bcbc'), junta: T('liso', '#5e4c46'),
  portaVerde: T('tabua', '#62b040', null, 1.15), portaVerdeEscuro: T('tabua', '#3f8430'), creme: T('tabua', '#fff0c4', null, 1.4), cremeEscuro: T('tabua', '#f0dca6', null, 1.25),
  interior: T('liso', '#3a2418'), chaoDoCeleiro: T('areia', '#8a6248'), ferro: T('liso', '#5a5560'), ferroClaro: T('liso', '#8a8794'),
  // terra, palha, plantas
  terra: T('arada'), terraClara: T('arada', '#ffd9b4'), terraEscura: T('arada', '#b8a09a'), palha: T('palha'), palhaClara: T('palha', '#fff0c0'), palhaEscura: T('palha', '#c8a070'),
  folha: T('folhagem'), folhaClara: T('folhagem', '#f4ffc0'), folhaEscura: T('folhagem', '#a8c4a0'),
  laranja: T('liso', '#f58a1c'), laranjaClara: T('liso', '#ffb238'),
  milhoCaule: T('liso', '#86b62e'), milhoFolha: T('liso', '#5f9a26'), milhoFolhaClara: T('liso', '#9cc83a'), milhoEspiga: T('liso', '#f4b81a'), milhoPalha: T('liso', '#cfdc72'), milhoPendao: T('liso', '#e8cf80'), semente: T('liso', '#f6cb3a'),
  // água, metal, pano
  agua: T('liso', '#3fa4c8'), aguaClara: T('liso', '#8fd4e8'), aguaFunda: T('liso', '#256e8e'),
  metal: T('liso', '#b4c0c8'), metalEscuro: T('liso', '#7f8e9a'), regador: T('liso', '#3d8fd0'), regadorEscuro: T('liso', '#2c6fae'), crivo: T('liso', '#e8dcc0'),
  corda: T('palha', '#e8d0a0'), cordaEscura: T('palha', '#b89a70'), saco: T('penugem', '#e2c890'), sacoEscuro: T('penugem', '#bfa068'),
  leite: T('liso', '#fff6e6'), tampa: T('liso', '#3d8fd0'), ovo: T('liso', '#fff4e0'),
  // bichos
  vacaCreme: T('penugem', '#fff0d8'), vacaEscuro: T('penugem', '#4a3c34'), focinho: T('liso', '#f6a4a0'), focinhoEscuro: T('liso', '#d47c78'), chifre: T('liso', '#f2e2be'), casco: T('liso', '#544034'),
  sino: T('liso', '#f0b428'), coleira: T('liso', '#d23a28'),
  galinhaBranca: T('penugem', '#fff6e2'), galinhaCaramelo: T('penugem', '#e8963a'), crista: T('liso', '#dc3226'), bico: T('liso', '#f5a41c'), pe: T('liso', '#ee9418'),
  // personagem
  pele: T('liso', '#d48a4e'), peleClara: T('liso', '#e69c60'), cabelo: T('penugem', '#3a2418'), lenco: T('liso', '#d8382a'), lencoEscuro: T('liso', '#ac281e'),
  camisa: T('liso', '#f2b422'), jardineira: T('liso', '#2f6fb2'), jardineiraEscura: T('liso', '#24568e'), jardineiraClara: T('liso', '#4a8ccc'),
  bota: T('liso', '#7a4424'), botaEscura: T('liso', '#55301a'), olho: T('branco', '#2a1a12'), boca: T('branco', '#8c3526'), bochecha: T('liso', '#ef8f6a'), lingua: T('branco', '#ec7a62'), branco: T('branco', '#ffffff'),
};
// As cores de C (paleta de tools/visual-refs) trocadas enquanto uma fábrica do "codigo" roda dentro deste conjunto:
// valem para o que não foi redesenhado aqui (as partículas de água, de semente e de folha).
export const PALETA_DE_C = {
  water: '#4fb4d8', waterLight: '#a8e0f0', cornEar: '#f6c42c', cornHusk: '#cfdc72', orangeLeafLight: '#8cc02c', orangeLeaf: '#5f9a26', white: '#ffffff',
  soilLight: '#a85a2c', hay: '#e8a422', straw: '#f0b83a',
};

// ---------------- coordenadas de textura ----------------
// O jeito padrão de cada textura: modo de projeção e quantas unidades de mundo uma cópia cobre ([ao longo de u, de v]).
//   caixa    cada face usa os dois eixos da própria peça que correm nela; "veio" (x, y ou z) diz que eixo acompanha o v da
//            textura (o comprido da tábua); "passo" faz a largura da peça pegar um número inteiro de tábuas
//   cil      em volta do eixo y da peça (troncos e esteios)
//   camera   pelo plano da tela: como a câmera do jogo nunca gira, a pintura aparece de frente e sem emenda (copas)
//   proprio  as coordenadas que a própria geometria traz, de 0 a 1 (telhas, chão)
// "rect" [u0, v0, u1, v1] prende a peça num pedaço da textura. Nenhuma peça sai da sua textura: a que é maior que uma
// cópia estica a pintura. As texturas que repetem de verdade (grama, areia) são postas em ladrilhos pelo desenho do chão.
const JEITO = {
  madeira: { modo: 'caixa', m: [2.5, 3.0], passo: 1 / 6 }, tabua: { modo: 'caixa', m: [2.5, 3.0], passo: 1 / 6 },
  telha: { modo: 'caixa', m: [2, 2] }, pedra: { modo: 'caixa', m: [2.2, 2.2] }, palha: { modo: 'caixa', m: [1.3, 1.3] },
  grama: { modo: 'caixa', m: [2.2, 2.2] }, areia: { modo: 'caixa', m: [2.2, 2.2] }, arada: { modo: 'caixa', m: [1.8, 1.8] },
  folhagem: { modo: 'camera', m: [2.3, 2.3] }, barranco: { modo: 'caixa', m: [1.2, 1.2] }, casca: { modo: 'cil', m: [2, 2.4] },
  liso: { modo: 'caixa', m: [1.5, 1.5] }, penugem: { modo: 'caixa', m: [1.1, 1.1] }, branco: { modo: 'caixa', m: [4, 4] },
};
const TUDO = [0, 0, 1, 1], TAU = Math.PI * 2;
// a câmera do jogo (src/cena/cena.js): giro de 45 graus e inclinação de 35,264 graus
const CAM_D = new THREE.Vector3(Math.SQRT1_2, 0, -Math.SQRT1_2), CAM_C = new THREE.Vector3(-0.40825, 0.8165, -0.40825);
const _inv = new THREE.Matrix4(), _p = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();

function texturizar(g, total, nome, cfg, rand, uvDaPeca) {
  const pos = g.attributes.position, n = pos.count, uv = new Float32Array(n * 2), [ox, oy] = origem(nome);
  const [r0, s0, r1, s1] = cfg.rect || TUDO, rw = r1 - r0, rh = s1 - s0;
  const mu = Array.isArray(cfg.m) ? cfg.m[0] : cfg.m || 1.5, mv = Array.isArray(cfg.m) ? cfg.m[1] : cfg.m || 1.5;
  const por = (i, fu, fv) => { uv[i * 2] = ox + fu * K; uv[i * 2 + 1] = oy + fv * K; };
  if (cfg.modo === 'proprio' && uvDaPeca) {
    for (let i = 0; i < n; i++) por(i, r0 + uvDaPeca[i * 2] * rw, s0 + uvDaPeca[i * 2 + 1] * rh);
  } else if (cfg.modo === 'camera') {
    let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
    const U = new Float32Array(n), V = new Float32Array(n);
    for (let i = 0; i < n; i++) { _p.fromBufferAttribute(pos, i); U[i] = _p.dot(CAM_D); V[i] = _p.dot(CAM_C); u0 = Math.min(u0, U[i]); u1 = Math.max(u1, U[i]); v0 = Math.min(v0, V[i]); v1 = Math.max(v1, V[i]); }
    const eu = Math.min((u1 - u0) / mu, rw), ev = Math.min((v1 - v0) / mv, rh), du = r0 + rand() * (rw - eu), dv = s0 + rand() * (rh - ev);
    for (let i = 0; i < n; i++) por(i, du + ((U[i] - u0) / (u1 - u0 || 1)) * eu, dv + ((V[i] - v0) / (v1 - v0 || 1)) * ev);
  } else {
    // posições no espaço da própria peça (antes de girar e de mudar de tamanho) e o tamanho de cada eixo dela no mundo
    const e = total.elements, esc = [Math.hypot(e[0], e[1], e[2]), Math.hypot(e[4], e[5], e[6]), Math.hypot(e[8], e[9], e[10])];
    _inv.copy(total).invert();
    const L = new Float32Array(n * 3), min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < n; i++) { _p.fromBufferAttribute(pos, i).applyMatrix4(_inv); L[i * 3] = _p.x; L[i * 3 + 1] = _p.y; L[i * 3 + 2] = _p.z; for (let k = 0; k < 3; k++) { const v = L[i * 3 + k]; if (v < min[k]) min[k] = v; if (v > max[k]) max[k] = v; } }
    const vao = [0, 1, 2].map((k) => max[k] - min[k] || 1), tam = vao.map((v, k) => v * esc[k]);
    if (cfg.modo === 'cil') {
      // em volta do eixo y da peça, no sentido do torno do three (ângulo 0 em +z); "fase" é o ângulo onde u começa e
      // "voltas" quantas cópias cabem na volta inteira. Nas faces deitadas (o alto de um anel) o v corre pelo raio.
      const voltas = cfg.voltas || 1, fase = cfg.fase || 0, ev = Math.min(tam[1] / mv, rh), dv = s0 + rand() * (rh - ev), th = [0, 0, 0];
      let ra = Infinity, rb = -Infinity;
      for (let i = 0; i < n; i++) { const r = Math.hypot(L[i * 3], L[i * 3 + 2]); if (r < ra) ra = r; if (r > rb) rb = r; }
      for (let f = 0; f < n; f += 3) {
        _a.set(L[f * 3], L[f * 3 + 1], L[f * 3 + 2]); _b.set(L[f * 3 + 3], L[f * 3 + 4], L[f * 3 + 5]).sub(_a); _c.set(L[f * 3 + 6], L[f * 3 + 7], L[f * 3 + 8]).sub(_a);
        _b.cross(_c).normalize();
        const deitada = Math.abs(_b.y) > 0.75;
        for (let k = 0; k < 3; k++) {
          let t = (((Math.atan2(L[(f + k) * 3], L[(f + k) * 3 + 2]) - fase) % TAU) + TAU) % TAU;
          if (t > TAU - 1e-3) t -= TAU;
          th[k] = t;
          if (k) { while (th[k] - th[0] > Math.PI) th[k] -= TAU; while (th[k] - th[0] < -Math.PI) th[k] += TAU; }
        }
        const uu = th.map((t) => (t / TAU) * voltas), base = Math.floor(Math.min(uu[0], uu[1], uu[2]) + 1e-4);
        for (let k = 0; k < 3; k++) {
          const i = f + k, fv = deitada ? (Math.hypot(L[i * 3], L[i * 3 + 2]) - ra) / (rb - ra || 1) : (L[i * 3 + 1] - min[1]) / vao[1];
          por(i, r0 + Math.max(0, Math.min(1, uu[k] - base)) * rw, dv + fv * ev);
        }
      }
    } else {
      const veio = cfg.veio ? 'xyz'.indexOf(cfg.veio) : tam.indexOf(Math.max(...tam));
      // para cada direção de face (x, y, z): que eixos da peça viram u e v, quanto da textura a face pega e onde começa
      const faces = [0, 1, 2].map((a) => {
        const [b, c] = [0, 1, 2].filter((k) => k !== a), V = veio !== a ? veio : tam[b] >= tam[c] ? b : c, U = 3 - a - V;
        let eu = tam[U] / mu, ev = Math.min(tam[V] / mv, rh);
        if (cfg.passo) eu = Math.max(1, Math.round(eu / cfg.passo)) * cfg.passo;
        eu = Math.min(eu, rw);
        let du = r0 + rand() * (rw - eu);
        if (cfg.passo) du = r0 + Math.min(Math.round((du - r0) / cfg.passo), Math.round((rw - eu) / cfg.passo)) * cfg.passo;
        if (cfg.fixo) return { U, V, eu, ev, du: r0 + cfg.fixo[0] * (rw - eu), dv: s0 + cfg.fixo[1] * (rh - ev) };
        return { U, V, eu, ev, du, dv: s0 + rand() * (rh - ev) };
      });
      for (let f = 0; f < n; f += 3) {
        _a.set(L[f * 3], L[f * 3 + 1], L[f * 3 + 2]); _b.set(L[f * 3 + 3], L[f * 3 + 4], L[f * 3 + 5]).sub(_a); _c.set(L[f * 3 + 6], L[f * 3 + 7], L[f * 3 + 8]).sub(_a);
        _b.cross(_c);
        const nx = Math.abs(_b.x / esc[0]), ny = Math.abs(_b.y / esc[1]), nz = Math.abs(_b.z / esc[2]), F = faces[nx >= ny && nx >= nz ? 0 : ny >= nz ? 1 : 2];
        for (let k = 0; k < 3; k++) { const i = f + k; por(i, F.du + ((L[i * 3 + F.U] - min[F.U]) / vao[F.U]) * F.eu, F.dv + ((L[i * 3 + F.V] - min[F.V]) / vao[F.V]) * F.ev); }
      }
    }
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

// ---------------- construtor ----------------
// O construtor roliço do "brinquedo", mais as coordenadas de textura de cada peça. Opções a mais em cada peça:
//   o.t   nome da textura (senão vale a da cor; cor sem textura fica com "liso")
//   o.uv  { modo, m, veio, passo, rect, fixo, voltas } por cima do jeito padrão da textura
//   o.pintar(geometria) retoca a cor por vértice da peça depois de pronta (manchas da grama, escuro do barranco)
//   o.grad (cor no alto da peça) e o.ao (quanto escurece no pé) já existiam no construtor de tools/visual-refs
export class BuilderPintado extends BuilderBrinquedo {
  add(geo, color, o = {}) {
    const lista = this.glow ? this.glowParts : this.parts, local = matFrom(o), total = this.M.clone().multiply(local);
    const nome = o.t || (color && color.tex) || 'liso', cfg = { ...(JEITO[nome] || JEITO.liso), ...((color && color.uv) || null), ...(o.uv || null) };
    let uvDaPeca = null;
    if (cfg.modo === 'proprio' && geo.attributes.uv) {
      const fonte = geo.index ? geo.toNonIndexed() : geo;
      uvDaPeca = Float32Array.from(fonte.attributes.uv.array);
      if (local.determinant() * this.M.determinant() < 0) for (let i = 0; i < uvDaPeca.length; i += 6) for (let k = 0; k < 2; k++) { const t = uvDaPeca[i + 2 + k]; uvDaPeca[i + 2 + k] = uvDaPeca[i + 4 + k]; uvDaPeca[i + 4 + k] = t; }
    }
    super.add(geo, color, o);
    texturizar(lista[lista.length - 1], total, nome, cfg, this.rand, uvDaPeca);
    if (o.pintar) o.pintar(lista[lista.length - 1]); // retoque da cor por vértice, com a peça já no lugar
    return this;
  }
  // malha solta com posição, coordenada de textura (0 a 1 dentro da textura) e índice: para as peças que o desenho calcula
  // ponto a ponto (ladrilhos do chão, telhas). cor pode ser uma função (x, y, z) -> THREE.Color para variar por vértice.
  solta(pos, uvs, idx, color, o = {}) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx);
    g.computeVertexNormals();
    return this.add(g, color, { ...o, uv: { modo: 'proprio', ...(o.uv || null) } });
  }
}

// ---------------- material ----------------
let _mat = null;
export function material() {
  if (!_mat) _mat = new THREE.MeshLambertMaterial({ vertexColors: true, map: texturaDoAtlas() });
  return _mat;
}
const _particulas = new Map();
function matParticula(cor) {
  const k = new THREE.Color(cor).getHexString();
  if (!_particulas.has(k)) _particulas.set(k, new THREE.MeshLambertMaterial({ color: new THREE.Color(cor) }));
  return _particulas.get(k);
}

// ---------------- claro-escuro pintado ----------------
// Passa por todos os vértices de uma malha pronta e multiplica a cor: mais clara e quente nas faces viradas para cima,
// mais escura e fria nas viradas para baixo e perto do chão. É o "escuro nos vincos" que o pintor põe à mão; a luz do jogo
// só dá a luz direta e a sombra projetada. Vale para qualquer giro em torno do eixo vertical (os bichos andam para todo lado).
//   opt = { cima, baixo, chao, altura, extra(x, y, z, nx, ny, nz) -> fator }
const BANHO = { cima: 0.07, baixo: 0.3, chao: 0.22, altura: 0.22 };
export function banhar(geo, opt = {}) {
  const { cima, baixo, chao, altura, extra } = { ...BANHO, ...opt }, pos = geo.attributes.position, nor = geo.attributes.normal, cor = geo.attributes.color;
  if (!pos || !nor || !cor) return geo;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i), ny = nor.getY(i);
    let k = 1 + (ny > 0 ? cima * ny : baixo * ny);
    k *= 1 - chao * Math.exp(-Math.max(0, y) / altura);
    if (extra) k *= extra(pos.getX(i), y, pos.getZ(i), nor.getX(i), ny, nor.getZ(i));
    // o escuro puxa para o frio (o azul cai menos, o verde cai mais); o claro puxa para o amarelo
    const r = k, g = k < 1 ? Math.pow(k, 1.12) : k, b = k < 1 ? Math.pow(k, 0.72) : 2 - k;
    cor.setXYZ(i, cor.getX(i) * r, cor.getY(i) * g, cor.getZ(i) * b);
  }
  return geo;
}

// ---------------- sombra de contato ----------------
// A mesma mancha esfumada do "brinquedo", com a cor da sombra deste conjunto (verde-azulada escura, e não cinza).
let _texMancha = null, _matMancha = null;
const GEO_MANCHA = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
GEO_MANCHA.userData.compartilhada = true;
function matMancha() {
  if (_matMancha) return _matMancha;
  const n = 64, dados = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const d = Math.hypot((x + 0.5) / n - 0.5, (y + 0.5) / n - 0.5) * 2, a = Math.max(0, 1 - d), i = (y * n + x) * 4;
    dados[i] = dados[i + 1] = dados[i + 2] = 255; dados[i + 3] = Math.round(255 * a * a * (3 - 2 * a));
  }
  _texMancha = new THREE.DataTexture(dados, n, n, THREE.RGBAFormat);
  _texMancha.magFilter = _texMancha.minFilter = THREE.LinearFilter; _texMancha.needsUpdate = true;
  return (_matMancha = new THREE.MeshBasicMaterial({ color: 0x14301c, map: _texMancha, transparent: true, opacity: 0.42, depthWrite: false }));
}
export function sombra(rx, rz, x = 0, z = 0, y = 0.03) {
  const m = new THREE.Mesh(GEO_MANCHA, matMancha());
  m.scale.set(rx * 1.15, 1, rz * 1.15); m.position.set(x, y, z); m.renderOrder = 2;
  return m;
}
export const sombraRet = (w, d, x = 0, z = 0, y = 0.03) => sombra(w * 0.62, d * 0.62, x, z, y);

// ---------------- o estilo entregue às fábricas ----------------
// Malhas que não entram no mapa de sombra (ficam só com a mancha de contato, ou têm projetor de sombra): as mesmas do "brinquedo".
// A cerca também tem projetor aqui (são muitas peças pequenas para desenhar duas vezes).
const SEM_SOMBRA = new Set(['chao.malha0', 'cerca.malha0', 'canteiro.malha0', 'canteiro.articulado0', 'galinha.articulado0', 'ninho.articulado0', 'vaca.malha0', 'celeiro.articulado0', 'poco.articulado0', 'arvore.articulado0']);
// desenhos: { 'tipo.articulado0': (b, osso, padrao, ctx) => ..., 'tipo.malha0': ... } troca o desenho de uma malha de uma
// fábrica do "codigo" (ver "Vestir um conjunto com outro estilo" no contrato de arte). banhos: o claro-escuro pintado de
// cada malha ('tipo.malha0') ou de todas as malhas de um tipo ('tipo'); false = não banhar.
export function criarEstilo(tipo, desenhos, extras = {}, ctx = null, banhos = {}) {
  const conta = { articulado: 0, malha: 0 };
  let ultima = '';
  return {
    nome: 'pintado', Builder: BuilderPintado, material, paleta: PALETA_DE_C, sombra, sombraRet,
    aoCriar(mesh) {
      mesh.castShadow = !SEM_SOMBRA.has(ultima); mesh.receiveShadow = true;
      const banho = banhos[ultima] !== undefined ? banhos[ultima] : banhos[tipo];
      if (banho !== false && mesh.geometry.attributes.color) banhar(mesh.geometry, banho || undefined);
    },
    geoParticula: (raio) => new THREE.SphereGeometry(raio, 7, 5), matParticula,
    redesenhar(qual, padrao) { ultima = `${tipo}.${qual}${conta[qual]++}`; const f = desenhos[ultima]; return f ? (b, nome) => f(b, nome, padrao, ctx) : padrao; },
    ...extras,
  };
}

// Luz e fundo deste conjunto (a cena aplica quando o chão é deste conjunto; ver Cena.definirAmbiente).
// Sol amarelo de cima, da esquerda e um pouco de frente (ilumina as faces viradas para a câmera pela esquerda, como a
// frente do celeiro); céu azul-esverdeado enchendo a sombra: a parte iluminada fica quente e a sombra fica fria e colorida,
// como na imagem-alvo. As contas: numa face virada para cima a soma do sol e do céu dá 1 nos três canais (a textura
// aparece como foi pintada); na sombra sobra (0,28 0,40 0,57), a mesma relação medida na grama da imagem-alvo. A cor "do
// chão" da luz do céu é clara e quente (a luz que a terra devolve): uma parede de frente para o sol fica com perto de 0,9
// e uma parede em sombra com perto de 0,37, e o que olha para baixo recebe um rebatido quente.
export const AMBIENTE = {
  fundo: '#379c9c',
  ceu: { cor: '#b8d9ff', chao: '#e8c8a0', intensidade: 1.8 },
  sol: { cor: '#ffe9c9', intensidade: 3.07, direcao: [-0.22, 0.74, 0.63] },
  sombra: { tamanho: 1024, raio: 1.75, intensidade: 0.95 },
  // o que tem de caber na vista "tudo" além dos cantos do terreno: as pontas do telhado do celeiro e o pé do barranco
  // no canto da frente (dado a partir do poço, que é o objeto mais perto dele)
  cabe: { celeiro: [[0, 4.75, -2.0], [-2.2, 3.1, -2.0]], poco: [[1.2, -0.9, 3.8]] },
};
