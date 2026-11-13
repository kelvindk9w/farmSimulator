// O que a frente das terras desenha no quadro, em duas camadas da cena (render/cena.js: registrarCamada):
//   no chão:  as casas que uma ferramenta de área alcança (antes do toque e na fila), as casas onde a muda escolhida
//             pode ser plantada (o espaçamento entre árvores) e a área que um aspersor rega;
//   por cima: a etiqueta de cada lote à venda (preço, ou o que falta), o aviso de fruta no pé e a barra de golpes do
//             obstáculo que está sendo cortado ou quebrado.
// Os textos das etiquetas vêm da interface (ROTULOS), para todo texto continuar em ui/textos.
import { registrarCamada, COR_DA_ACAO, GESTO_PARECIDO, ALVOS_DE_CIMA } from './cena.js';
import { TRACO } from './reserva.js';
import { TIPOS } from '../nucleo/registro.js';
import { loteDe } from '../nucleo/sistemas/terras.js';
import { situacaoDoLote } from '../nucleo/sistemas/lotes.js';
import { podePlantarArvore, safrasProntas } from '../nucleo/sistemas/arvores.js';
import { TIPO_DO_ASPERSOR, raioDoAspersor } from '../nucleo/sistemas/aspersor.js';
import { planejadas } from '../nucleo/sistemas/construcao.js';
import { itemNaMao } from '../nucleo/sistemas/lavoura.js';

Object.assign(COR_DA_ACAO, { rocar: '#9bd04a', cortar: '#e0a05a', quebrar: '#c9c8c0', plantarMuda: '#74b83a', colherFruta: '#f6c12c' });
// gestos ainda sem peça no catálogo usam o de um gesto parecido
Object.assign(GESTO_PARECIDO, { foice: 'enxadar', 'plantar-muda': 'semear', 'colher-fruta': 'colher' });

// a interface diz o texto de cada etiqueta de lote: ROTULOS.lote(situacao) → texto curto
export const ROTULOS = { lote: (s) => String(s.lote.preco || 0) };
const COR_DO_LOTE = { pode: '#8fe04a', ouro: '#ffd84a', nivel: '#d9d2c4', exige: '#d9d2c4' };

// ---------- a área do aspersor: fica à mostra por uns segundos depois de colocado ou mudado de lugar ----------
const areaAte = new Map(); // id da entidade → instante da cena em que a área some
let relogioDaCena = 0;
export function mostrarAreaDoAspersor(id, seg = 6) { areaAte.set(id, relogioDaCena + seg); }

// ---------- o que muda devagar se confere umas vezes por segundo, não a cada quadro ----------
const RAIO_DAS_MUDAS = 9; // casas em volta do centro da tela em que se marcam os lugares da muda
const livres = new Int16Array((2 * RAIO_DAS_MUDAS + 1) * (2 * RAIO_DAS_MUDAS + 1) * 2);
let nLivres = 0, relogioLivres = 0, mudaDosLivres = null;
const placas = []; // { e, estado, texto, cx: [x0, y0, x1, y1] (a etiqueta na tela, com folga para o dedo) }
let relogioPlacas = 0, versaoPlacas = -1, localPlacas = null;
const planos = [];

function conferirLivres(m, cam) {
  const id = m.dados.arvoreDaMuda[m.modo.semente], cx = Math.floor(cam.x), cz = Math.floor(cam.z);
  nLivres = 0;
  if (!id || !(m.posses.bolsa[m.modo.semente] > 0)) return;
  for (let z = cz - RAIO_DAS_MUDAS; z <= cz + RAIO_DAS_MUDAS; z++) for (let x = cx - RAIO_DAS_MUDAS; x <= cx + RAIO_DAS_MUDAS; x++) {
    if (podePlantarArvore(m, x, z, id).ok) { livres[nLivres * 2] = x; livres[nLivres * 2 + 1] = z; nLivres++; }
  }
}
function conferirPlacas(m, loc) {
  placas.length = 0;
  for (const e of loc.entidades) {
    if (e.tipo !== 'placa') continue;
    const l = loteDe(m, e.lote);
    if (!l) continue;
    const s = situacaoDoLote(m, l);
    placas.push({ e, estado: s.estado, texto: ROTULOS.lote(s), cx: [0, 0, -1, -1] });
  }
}

function losango(g, cam, x, z, S, folga) {
  const cx = cam.telaX(x + 0.5, z + 0.5), cy = cam.telaY(x + 0.5, 0, z + 0.5), ux = 0.70711 * S * (1 - folga), uy = 0.408248 * S * (1 - folga);
  g.moveTo(cx, cy - uy); g.lineTo(cx + ux, cy); g.lineTo(cx, cy + uy); g.lineTo(cx - ux, cy); g.closePath();
}
function pintar(g, cor, S, alfa = 0.32) {
  g.globalAlpha = alfa; g.fillStyle = cor; g.fill();
  g.globalAlpha = 0.95; g.lineWidth = Math.max(2, 0.05 * S); g.strokeStyle = cor; g.stroke();
  g.globalAlpha = 1;
}
// o quadrado de casas em volta de (x, z) que o aspersor rega, com a borda marcada
function areaDoAspersor(g, cam, loc, x, z, r, S, tempo) {
  const x0 = Math.max(0, x - r), z0 = Math.max(0, z - r), x1 = Math.min(loc.l, x + r + 1), z1 = Math.min(loc.p, z + r + 1);
  g.beginPath();
  g.moveTo(cam.telaX(x0, z0), cam.telaY(x0, 0, z0)); g.lineTo(cam.telaX(x1, z0), cam.telaY(x1, 0, z0));
  g.lineTo(cam.telaX(x1, z1), cam.telaY(x1, 0, z1)); g.lineTo(cam.telaX(x0, z1), cam.telaY(x0, 0, z1)); g.closePath();
  g.globalAlpha = 0.16 + 0.05 * Math.sin(tempo * 4); g.fillStyle = '#4aa9e6'; g.fill();
  g.globalAlpha = 0.9; g.lineWidth = Math.max(2, 0.05 * S); g.strokeStyle = '#bfe6ff'; g.setLineDash([0.22 * S, 0.14 * S]); g.stroke(); g.setLineDash([]);
  g.globalAlpha = 1;
}

// ---------- no chão ----------
registrarCamada('chao', (g, cam, m, S, cena, dt) => {
  const loc = m.local, p = m.personagem, d = cena.destaque;
  relogioDaCena = cena.tempo;
  g.lineJoin = 'round';

  // onde a muda escolhida pode ser plantada
  const naMao = itemNaMao(m), muda = m.dados.arvoreDaMuda[naMao] ? naMao : null; // (a muda na vaga "Na mão")
  if (muda) {
    relogioLivres -= dt;
    if (relogioLivres <= 0 || mudaDosLivres !== muda) { relogioLivres = 0.3; mudaDosLivres = muda; conferirLivres(m, cam); }
    if (nLivres) {
      g.beginPath();
      for (let k = 0; k < nLivres; k++) losango(g, cam, livres[k * 2], livres[k * 2 + 1], S, 0.42);
      g.globalAlpha = 0.55; g.fillStyle = '#b8f070'; g.fill();
      g.globalAlpha = 0.8; g.lineWidth = Math.max(1.5, 0.03 * S); g.strokeStyle = '#3f7a1e'; g.stroke();
      g.globalAlpha = 1;
    }
  } else mudaDosLivres = null;

  // fila de tarefas: as outras casas que a rega de área molha e o mato que sai de carona na foice
  if (cena.mostrarFila && (p.fila.length || p.tarefa)) {
    for (let k = -1; k < p.fila.length; k++) {
      const t = k < 0 ? p.tarefa : p.fila[k], a = t && t.tipo === 'agir' && t.args;
      if (!a || !(a.casas || a.junto)) continue;
      g.beginPath();
      if (a.casas) for (let j = 1; j < a.casas.length; j++) losango(g, cam, a.casas[j][0], a.casas[j][1], S, 0.16);
      if (a.junto) for (let j = 0; j < a.junto.length; j++) { const e = loc.porId[a.junto[j]]; if (e) losango(g, cam, e.x, e.z, S, 0.16); }
      pintar(g, COR_DA_ACAO[t.acao] || '#ffffff', S);
    }
  }

  // antes do toque: as outras casas que a ação alcança (a primeira é a destacada pela cena)
  const c = d.casas;
  if (c && c.length > 1 && (d.entidade !== null || d.x >= 0)) {
    const e = d.entidade !== null ? loc.porId[d.entidade] : null, x0 = e ? e.x : d.x, z0 = e ? e.z : d.z;
    if (c[0][0] === x0 && c[0][1] === z0) {
      g.beginPath();
      for (let j = 1; j < c.length; j++) losango(g, cam, c[j][0], c[j][1], S, 0.06);
      g.lineWidth = Math.max(3, 0.075 * S); g.strokeStyle = 'rgba(58,36,18,.6)'; g.stroke();
      g.lineWidth = Math.max(1.5, 0.04 * S); g.strokeStyle = d.cor; g.stroke();
    }
  }

  // aspersor: a área aparece enquanto ele é colocado (planta no chão), logo depois, e quando está destacado
  const r = raioDoAspersor(m);
  planejadas(m, planos);
  for (let k = 0; k < planos.length; k++) { const q = planos[k]; if (q && q.id === TIPO_DO_ASPERSOR && (q.local || 'fazenda') === loc.id) areaDoAspersor(g, cam, loc, q.x, q.z, r, S, cena.tempo); }
  if (areaAte.size || d.entidade !== null) {
    const e = d.entidade !== null ? loc.porId[d.entidade] : null;
    if (e && e.tipo === TIPO_DO_ASPERSOR) areaDoAspersor(g, cam, loc, e.x, e.z, r, S, cena.tempo);
    for (const [id, ate] of areaAte) {
      const a = loc.porId[id];
      if (ate < cena.tempo || !a) { areaAte.delete(id); continue; }
      if (a !== e) areaDoAspersor(g, cam, loc, a.x, a.z, r, S, cena.tempo);
    }
  }
});

// ---------- por cima das figuras ----------
// etiqueta com um sinal na frente do texto (moeda: tem preço; cadeado: ainda não dá); devolve a largura dela
function etiqueta(g, cam, sx, sy, texto, cor, S, cadeado) {
  const px = Math.max(14 * cam.dpr, Math.min(0.34 * S, 22 * cam.dpr));
  g.font = `800 ${Math.round(px)}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  g.textAlign = 'left'; g.textBaseline = 'middle';
  const r = px * 0.48, tw = g.measureText(texto).width, w = tw + r * 2 + px * 1.25, h = px * 1.7, x0 = sx - w / 2, ix = x0 + px * 0.45 + r;
  g.beginPath(); g.roundRect(x0, sy - h / 2, w, h, h / 2);
  g.fillStyle = cor; g.fill(); g.lineWidth = Math.max(2, px * 0.14); g.strokeStyle = TRACO; g.stroke();
  g.lineWidth = Math.max(1.5, px * 0.1);
  if (cadeado) {
    g.beginPath(); g.arc(ix, sy - r * 0.25, r * 0.55, Math.PI, 0); g.stroke();
    g.beginPath(); g.roundRect(ix - r * 0.85, sy - r * 0.25, r * 1.7, r * 1.25, r * 0.25); g.fillStyle = '#a89f8d'; g.fill(); g.stroke();
  } else {
    g.beginPath(); g.arc(ix, sy, r, 0, 6.2832); g.fillStyle = '#f6c12c'; g.fill(); g.stroke();
  }
  g.fillStyle = TRACO; g.fillText(texto, ix + r + px * 0.3, sy + px * 0.04);
  return w;
}

registrarCamada('cima', (g, cam, m, S, cena, dt) => {
  const loc = m.local, p = m.personagem, W = cena.cv.width, H = cena.cv.height;
  g.lineJoin = 'round';

  // lotes à venda: a etiqueta em cima da placa diz o preço (verde: dá para comprar) ou o que falta
  relogioPlacas -= dt;
  if (relogioPlacas <= 0 || versaoPlacas !== loc.versao || localPlacas !== loc) { relogioPlacas = 0.5; versaoPlacas = loc.versao; localPlacas = loc; conferirPlacas(m, loc); }
  for (let k = 0; k < placas.length; k++) {
    const q = placas[k], e = q.e, sx = cam.telaX(e.x + 0.5, e.z + 0.5), sy = cam.telaY(e.x + 0.5, 1.95, e.z + 0.5);
    if (sx < -S * 2 || sx > W + S * 2 || sy < -S || sy > H + S) { q.cx[2] = -1; continue; }
    const pulo = q.estado === 'pode' ? Math.abs(Math.sin(cena.tempo * 3)) * 0.08 * S : 0;
    const w = etiqueta(g, cam, sx, sy - pulo, q.texto, COR_DO_LOTE[q.estado] || '#d9d2c4', S, q.estado === 'nivel' || q.estado === 'exige');
    // a etiqueta também recebe o toque (a placa pode estar atrás de uma árvore): alvo de 44 pontos de altura, no mínimo
    const meia = Math.max(w / 2, 24 * cam.dpr), alto = 24 * cam.dpr;
    q.cx[0] = sx - meia; q.cx[1] = sy - alto; q.cx[2] = sx + meia; q.cx[3] = sy + alto;
  }

  // fruta no pé: uma bolinha da cor da fruta pulando em cima da árvore
  const A = m.arvores.todas, r = Math.max(7 * cam.dpr, 0.17 * S), pula = Math.abs(Math.sin(cena.tempo * 3.2));
  for (let k = 0; k < A.length; k++) {
    const e = A[k];
    if (e.local !== loc.id || safrasProntas(m, e) <= 0) continue;
    const sx = cam.telaX(e.x + 0.5, e.z + 0.5), sy = cam.telaY(e.x + 0.5, (TIPOS.arvore.altura || 2.3) + 0.2, e.z + 0.5) - pula * r * 0.5;
    if (sx < -S || sx > W + S || sy < -S || sy > H + S) continue;
    const R = r * 1.25;
    g.beginPath();
    for (let q = 0; q < 8; q++) { const a = -Math.PI / 2 + (q * Math.PI) / 4, rr = q % 2 ? R * 0.42 : R; if (q) g.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); else g.moveTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); }
    g.closePath(); g.fillStyle = '#ffd84a'; g.fill(); g.lineWidth = Math.max(1.5, r * 0.2); g.strokeStyle = TRACO; g.stroke();
  }

  // obstáculo que pede vários golpes: a barra do quanto já foi
  const t = p.tarefa, alvo = t && t.tipo === 'agir' && t.entidade !== undefined ? loc.porId[t.entidade] : null;
  if (alvo && alvo.dano > 0 && TIPOS[alvo.tipo].obstaculo) {
    const O = m.dados.obstaculos[alvo.tipo], f = Math.min(1, alvo.dano / O.resistencia);
    const sx = cam.telaX(alvo.x + 0.5, alvo.z + 0.5), sy = cam.telaY(alvo.x + 0.5, alvo.tipo === 'mata' ? 3.2 : 1.15, alvo.z + 0.5), w = Math.max(44 * cam.dpr, 0.9 * S), h = Math.max(8 * cam.dpr, 0.14 * S);
    g.beginPath(); g.roundRect(sx - w / 2, sy - h / 2, w, h, h / 2); g.fillStyle = '#fff9ec'; g.fill();
    g.beginPath(); g.roundRect(sx - w / 2, sy - h / 2, Math.max(h, w * f), h, h / 2); g.fillStyle = '#e0a05a'; g.fill();
    g.beginPath(); g.roundRect(sx - w / 2, sy - h / 2, w, h, h / 2); g.lineWidth = Math.max(2, h * 0.22); g.strokeStyle = TRACO; g.stroke();
  }
});

// o toque numa etiqueta de lote vale como o toque na placa dela
ALVOS_DE_CIMA.push((m, px, py) => {
  if (localPlacas !== m.local) return null;
  for (let k = 0; k < placas.length; k++) { const c = placas[k].cx; if (px >= c[0] && px <= c[2] && py >= c[1] && py <= c[3] && m.local.porId[placas[k].e.id]) return placas[k].e.id; }
  return null;
});
