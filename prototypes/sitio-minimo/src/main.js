// Sítio mínimo: ponto de entrada. Junta a lógica (src/jogo), a arte (src/arte), a cena e a interface.
// Opções vêm depois do "#" (a hospedagem descarta o que vem depois de "?"), separadas por vírgula:
//   #demo          começa na demonstração        #arte-molde / #arte-codigo   conjunto de arte inicial
//   #perto / #tudo enquadramento inicial          #sem-hud                     esconde a interface
//   #passo         a simulação só anda quando a ferramenta manda (window.__sitio.avancarAte(n))
import arteCfg from '../config/arte.json';
import './arte/codigo/index.js';
import './arte/molde/index.js';
import './arte/brinquedo/index.js';
import './arte/lowpoly/index.js';
import './arte/contorno/index.js';
import './arte/pintado/index.js';
import { listarConjuntos, rotuloDoConjunto } from './arte/registro.js';
import { PASSO } from './jogo/util.js';
import { NOME_ITEM, TIPOS } from './jogo/contrato.js';
import { Mundo } from './jogo/mundo.js';
import { Roteiro } from './jogo/roteiro.js';
import { Cena } from './cena/cena.js';
import { Vista } from './cena/vista.js';
import { Hud } from './ui/hud.js';

const sitio = window.__sitio = { pronto: false, erro: null };

function opcoes() {
  const o = { demo: false, arte: null, passo: false, semHud: false, modo: null };
  for (const p of decodeURIComponent(location.hash.slice(1)).split(/[,&;]/)) {
    if (p === 'demo') o.demo = true;
    else if (p === 'passo') o.passo = true;
    else if (p === 'sem-hud') o.semHud = true;
    else if (p === 'perto' || p === 'tudo') o.modo = p;
    else if (p.startsWith('arte-') && listarConjuntos().includes(p.slice(5))) o.arte = p.slice(5);
  }
  return o;
}

function iniciar() {
  const op = opcoes();
  document.body.classList.toggle('sem-hud', op.semHud);
  const canvas = document.getElementById('tela');
  const hud = new Hud(document.getElementById('hud'));
  let mundo = new Mundo();
  const cena = new Cena(canvas, mundo.sitio);
  const cfg = op.arte ? { padrao: op.arte, porTipo: {} } : arteCfg;
  let vista = new Vista(cena, mundo, cfg);
  let roteiro = null;
  let dicaFixa = mundo.dica;
  let passosDemo = 0; // passos dados desde que a demonstração começou (as ferramentas de captura contam por aqui)

  const lerArte = () => { const a = vista.conjuntoAtual(); hud.definirArte(a === 'misto' ? 'misto' : rotuloDoConjunto(a)); };
  const redimensionar = () => { cena.redimensionar(innerWidth, innerHeight, devicePixelRatio || 1, hud.margens()); };

  function recomecar(comDemo) {
    const conjuntos = { ...vista.conjuntoPorTipo };
    for (const e of vista.entidades) e.visual.descartar();
    mundo = new Mundo();
    vista = new Vista(cena, mundo, { padrao: arteCfg.padrao, porTipo: conjuntos });
    roteiro = comDemo ? new Roteiro() : null;
    passosDemo = 0;
    hud.limparAvisos();
    hud.definirDemo(comDemo);
    dicaFixa = comDemo ? '' : mundo.dica;
    vista.atualizar(0);
    cena.seguir(mundo.personagem.x, mundo.personagem.z, 0);
    cena._enquadrar(true);
  }

  // avisos da lógica -> rótulos que sobem
  function avisos() {
    for (const ev of mundo.eventos) {
      const o = mundo.objetos[ev.de], p = mundo.personagem;
      if (ev.tipo === 'item') hud.aviso(`+${ev.n} ${NOME_ITEM[ev.item]}`, p.x, 2.5, p.z, mundo.n);
      else if (ev.tipo === 'agua') hud.aviso(`${ev.n > 0 ? '+' : ''}${ev.n} ${NOME_ITEM.agua}`, p.x, 2.5, p.z, mundo.n, '#d9f3fb');
      else if (ev.tipo === 'guardou') {
        const [x, z] = mundo.local(o, TIPOS.celeiro.pontos.soleira);
        const itens = Object.entries(ev.itens);
        if (!itens.length) hud.aviso('nada para guardar', x, 2.6, z, mundo.n);
        for (const [item, n] of itens) hud.aviso(`celeiro +${n} ${NOME_ITEM[item]}`, x, 2.6, z, mundo.n, '#e7f6d9');
      }
    }
    mundo.eventos.length = 0;
  }

  function umPasso() {
    if (roteiro) {
      roteiro.passo(mundo);
      passosDemo++;
    }
    mundo.passo();
    avisos();
    vista.atualizar(PASSO);
    cena.seguir(mundo.personagem.x, mundo.personagem.z, PASSO);
    if (roteiro && roteiro.fim && mundo.n - roteiro.fimEm > 90 && !op.passo) { roteiro = null; hud.definirDemo(false); dicaFixa = 'Fim da demonstração. Agora é com você: toque num objeto ou no chão.'; }
  }

  function desenhar() {
    hud.contadores(mundo.contadores());
    if (roteiro) hud.definirDica('Demonstração: ' + roteiro.legenda);
    else if (!previa) hud.definirDica(mundo.dica !== dicaAntiga ? (dicaFixa = dicaAntiga = mundo.dica) : dicaFixa);
    hud.avisos(mundo.n, cena);
    cena.renderizar();
  }
  let dicaAntiga = mundo.dica, previa = false;

  // ---- toque e mouse ----
  let dedo = null; // { id, x, y, x0, y0, arrastou }
  const objetoEm = (x, y) => cena.objetoEm(x, y, mundo.alvosDeToque());
  function tocar(x, y) {
    if (roteiro) return; // durante a demonstração a tela não comanda
    hud.anel(x, y);
    const id = objetoEm(x, y);
    previa = false;
    cena.soltarArrasto(); // um comando novo: a câmera volta a acompanhar o personagem
    if (id) { mundo.tocar(id); return id; }
    const [gx, gz] = cena.chaoEm(x, y), L = mundo.sitio.terreno;
    if (Math.abs(gx) <= L && Math.abs(gz) <= L) mundo.tocarChao(gx, gz); else mundo.dica = 'Fora do sítio.';
    return null;
  }
  canvas.addEventListener('pointerdown', (e) => { if (dedo) return; dedo = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, arrastou: false }; try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* sem captura */ } });
  canvas.addEventListener('pointermove', (e) => {
    if (dedo && e.pointerId === dedo.id) {
      if (!dedo.arrastou && Math.hypot(e.clientX - dedo.x0, e.clientY - dedo.y0) > 12 && cena.modo === 'perto') dedo.arrastou = true;
      if (dedo.arrastou) cena.arrastar(e.clientX - dedo.x, e.clientY - dedo.y);
      dedo.x = e.clientX; dedo.y = e.clientY;
    } else if (!dedo && e.pointerType === 'mouse' && !roteiro) {
      // com mouse, passar por cima mostra o que o clique faria
      const id = objetoEm(e.clientX, e.clientY);
      previa = !!id;
      if (id) hud.definirDica(mundo.descrever(id).texto, true);
      canvas.style.cursor = id ? 'pointer' : 'default';
    }
  });
  const soltar = (e, vale) => {
    if (!dedo || e.pointerId !== dedo.id) return;
    const d = dedo; dedo = null;
    if (vale && !d.arrastou) tocar(d.x, d.y);
  };
  canvas.addEventListener('pointerup', (e) => soltar(e, true));
  canvas.addEventListener('pointercancel', (e) => soltar(e, false));
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // ---- botões ----
  hud.btDemo.addEventListener('click', () => recomecar(!roteiro));
  hud.btArte.addEventListener('click', () => { vista.definirConjunto(vista.proximoConjunto()); lerArte(); });
  hud.btZoom.addEventListener('click', () => { cena.definirModo(cena.modo === 'perto' ? 'tudo' : 'perto'); hud.definirZoom(cena.modo === 'perto'); });
  addEventListener('hashchange', () => { const o = opcoes(); if (o.arte) { vista.definirConjunto(o.arte); lerArte(); } if (o.demo && !roteiro) recomecar(true); });
  addEventListener('resize', redimensionar);

  // ---- começo ----
  lerArte();
  hud.definirDemo(false);
  hud.definirDica(mundo.dica);
  hud.contadores(mundo.contadores());
  redimensionar();
  // em tela pequena o sítio inteiro fica miúdo: começa de perto, acompanhando o personagem
  cena.definirModo(op.modo || (cena.escalaTudo() < 26 ? 'perto' : 'tudo'));
  hud.definirZoom(cena.modo === 'perto');
  if (op.demo) recomecar(true); else { vista.atualizar(0); cena.seguir(mundo.personagem.x, mundo.personagem.z, 0); cena._enquadrar(true); }

  // laço: passos fixos de simulação, um desenho por quadro do navegador
  let ultimo = performance.now(), sobra = 0;
  const quadro = (agora) => {
    requestAnimationFrame(quadro);
    if (!op.passo) {
      sobra += Math.min(0.1, (agora - ultimo) / 1000);
      let n = 0;
      while (sobra >= PASSO && n < 6) { umPasso(); sobra -= PASSO; n++; }
      if (n === 6) sobra = 0;
    }
    ultimo = agora;
    desenhar();
    sitio.pronto = true;
  };
  requestAnimationFrame(quadro);

  // ---- ganchos para as ferramentas (tools/) ----
  Object.assign(sitio, {
    info: () => {
      const p = mundo.personagem;
      return { passo: mundo.n, passosDemo, estado: p.estado, arte: p.visual().estado, x: +p.x.toFixed(4), z: +p.z.toFixed(4), concluidas: p.concluidas, dica: mundo.dica, conjunto: vista.conjuntoAtual(), modo: cena.modo, escala: cena.escala, demo: roteiro ? { i: roteiro.i, fim: roteiro.fim, fimEm: roteiro.fimEm, legenda: roteiro.legenda } : null, contadores: mundo.contadores() };
    },
    // modo passo: avança até a simulação ter dado n passos e desenha
    avancarAte: (n) => { while (mundo.n < n) umPasso(); desenhar(); return sitio.info(); },
    resumo: () => mundo.resumo(),
    retrato: () => mundo.retrato(),
    marcas: () => (roteiro ? roteiro.marcas : []),
    registro: () => mundo.registro,
    objetos: () => Object.fromEntries(Object.entries(mundo.objetos).map(([id, o]) => [id, { tipo: o.tipo, estado: o.estado, x: o.x, z: o.z }])),
    // centro da caixa de toque de um objeto, em pixels de CSS (para os testes tocarem de verdade)
    telaDe: (id) => { const c = mundo.alvosDeToque().find((a) => a.id === id); return c ? cena.paraTela((c.min[0] + c.max[0]) / 2, (c.min[1] + c.max[1]) / 2, (c.min[2] + c.max[2]) / 2) : null; },
    telaDoChao: (x, z) => cena.paraTela(x, 0, z),
    telaDoPonto: (x, y, z) => cena.paraTela(x, y, z),
    objetoEm: (x, y) => objetoEm(x, y),
    definirArte: (nome, tipo) => { if (tipo) vista.definirConjuntoDoTipo(tipo, nome); else vista.definirConjunto(nome); lerArte(); desenhar(); return vista.conjuntoAtual(); },
    conjuntos: () => ({ ...vista.conjuntoPorTipo }),
    problemasDeArte: () => vista.problemas(),
    definirModo: (m) => { cena.definirModo(m); hud.definirZoom(m === 'perto'); desenhar(); },
    demonstrar: (liga = true) => { recomecar(liga); desenhar(); },
    estatisticas: () => { desenhar(); return cena.estatisticas(); },
    visual: (id) => vista.porId.get(id).visual,
    // prende a câmera num ponto do mundo ([x, y, z]) ou num objeto (id), com escala em px por unidade; sem argumentos, solta
    fixar: (onde, escala = 100, altura = 1.0) => {
      let p = onde || null;
      if (typeof onde === 'string') { const o = onde === 'personagem' ? mundo.personagem : mundo.objetos[onde]; p = [o.x, altura, o.z]; }
      cena.fixar(p, escala); desenhar();
      return p;
    },
    posicao: (id) => { const o = id === 'personagem' ? mundo.personagem : mundo.objetos[id]; return [o.x, o.z, o.rumo || 0]; },
    cena, tocar: (id) => mundo.tocar(id),
  });
}

try { iniciar(); } catch (e) {
  console.error(e);
  sitio.erro = String((e && e.message) || e);
  const m = document.createElement('div'); m.className = 'erro'; m.textContent = 'Erro ao iniciar: ' + sitio.erro; document.body.append(m);
}
