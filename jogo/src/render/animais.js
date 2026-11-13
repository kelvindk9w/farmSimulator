// O que a frente dos animais desenha no terreno:
//   os bichos de produção passeando perto do abrigo: galinhas e ovelhas soltas em volta do galinheiro e do aprisco
//   (entram na ordem de profundidade da cena: SOLTAS) e as vacas dentro do curral, entre as camadas dele
//   (fundo, vacas debaixo da sombra, a sombra, vacas da frente, a cerca da frente);
//   o balão em cima do abrigo com o que ele pede: produto pronto, falta comida, falta água, bicho esperando o destino.
// Os bichos no terreno são só enfeite: não são gravados, não bloqueiam e não mudam a lógica. O custo por quadro é
// uma conta de passo por bicho que está no lugar da personagem (29 no máximo: 12 galinhas, 8 vacas, 9 ovelhas);
// as listas só se refazem quando a lista de bichos muda (mundo.animais.versao) ou o lugar muda (local.versao).
import { SOLTAS, ALVOS_DE_CIMA, registrarCamada, COR_DA_ACAO } from './cena.js';
import { TRACO, figuraDeReserva, desenharReserva } from './reserva.js';
import { pintarIconeDeReserva } from './icones.js';
import { TIPOS } from '../nucleo/registro.js';
import { ARADA } from '../nucleo/local.js';
import { comportamento } from '../nucleo/sistemas/construcao.js';
import { pedidoDoAbrigo } from '../nucleo/sistemas/producao.js';

COR_DA_ACAO.abastecerCocho = '#f6c12c';
COR_DA_ACAO.abastecerBebedouro = '#4aa9e6';
COR_DA_ACAO.recolherOvo = COR_DA_ACAO.ordenhar = COR_DA_ACAO.tosquiar = '#fff9ec';

const DUAS_PI = 6.2832;
// como cada espécie anda (casas por segundo), o raio da sombra e o que faz parada além de olhar em volta
const JEITO = {
  galinha: { vel: 0.85, raio: 0.17, pausa: [1.2, 3.5] },
  vaca: { vel: 0.42, raio: 0.5, pausa: [3, 8] },
  ovelha: { vel: 0.5, raio: 0.34, pausa: [2.5, 6] },
};
const PADRAO = { vel: 0.55, raio: 0.3, pausa: [2, 5] };
const DISTRACOES = ['ciscar', 'pastar']; // o que a espécie tiver no catálogo (animal/<id>/ciscar-frente...)
// abrigo em que os bichos ficam DENTRO da base, entre camadas de desenho. As zonas são retângulos [x0, z0, x1, z1]
// em casas, a partir do canto da base; "atras" = quem está com z menor que isto é desenhado antes da sombra.
const CERCADOS = {
  curral: {
    fundo: 'objeto/curral-fundo', frente: 'objeto/curral-frente', sombra: 'objeto/sombra-do-curral', sombraEm: [1.75, 1.3], atras: 2.5,
    zonas: [[0.9, 3.0, 5.2, 4.2], [1.1, 1.0, 2.6, 3.0]],
  },
};
const FOLGA = 2; // casas em volta da base por onde andam os bichos soltos

// ---------- o estado do desenho (nada disto é gravado) ----------
const V = { mundo: null, versao: -1, local: null, locVersao: -1, porId: new Map(), soltos: [], cercados: new Map(), abrigos: [] };
const chaves = {}; // 'animal/<base>/<estado>-<lado>', montadas uma vez
function chaveDe(base, estado, frente) {
  const b = chaves[base] || (chaves[base] = {}), k = estado + (frente ? 'f' : 'c');
  return b[k] || (b[k] = 'animal/' + base + '/' + estado + '-' + (frente ? 'frente' : 'costas'));
}
// sorteio próprio de cada bicho (igual a cada vez que o jogo abre, para o mesmo bicho)
function semente(texto) { let h = 2166136261; for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619); return h | 0; }
function r(b) { b.s = (Math.imul(b.s, 1664525) + 1013904223) | 0; return (b.s >>> 8) / 16777216; }

// a casa serve para um bicho solto pisar? (terra do jogador, sem construção, sem lavoura)
function livre(loc, x, z) {
  const cx = Math.floor(x), cz = Math.floor(z);
  if (!loc.andavel(cx, cz)) return false;
  const i = loc.i(cx, cz);
  return !loc.plantas[i] && loc.chao[i] !== ARADA;
}
// (x, z) serve para o bicho b? solto: em volta da base do abrigo, sem entrar nela; cercado: dentro de uma zona
function serve(m, b, x, z) {
  const e = b.e;
  if (b.cercado) {
    const lx = x - e.x, lz = z - e.z, Z = b.cercado.zonas;
    for (let k = 0; k < Z.length; k++) if (lx >= Z[k][0] && lx <= Z[k][2] && lz >= Z[k][1] && lz <= Z[k][3]) return true;
    return false;
  }
  if (x < e.x - FOLGA || z < e.z - FOLGA || x > e.x + e.l + FOLGA || z > e.z + e.p + FOLGA) return false;
  if (x > e.x - 0.35 && z > e.z - 0.35 && x < e.x + e.l + 0.35 && z < e.z + e.p + 0.35) return false;
  return livre(m.locais[e.local], x, z);
}
// dá para ir em linha reta de onde está até (x, z)?
function caminhoServe(m, b, x, z) {
  for (let k = 1; k <= 4; k++) if (!serve(m, b, b.x + ((x - b.x) * k) / 4, b.z + ((z - b.z) * k) / 4)) return false;
  return true;
}
// longe o bastante dos outros do mesmo abrigo (para não ficarem um em cima do outro)
function folgado(b, x, z) {
  const L = b.vizinhos, d = b.j.raio * 1.7;
  for (let k = 0; k < L.length; k++) { const o = L[k]; if (o !== b && Math.abs(o.ax - x) < d && Math.abs(o.az - z) < d) return false; }
  return true;
}
// põe o bicho num lugar que serve (ao nascer, ou quando o lugar onde estava foi ocupado)
function assentar(m, b) {
  const e = b.e;
  for (let k = 0; k < 40; k++) {
    let x, z;
    if (b.cercado) { const Z = b.cercado.zonas[k % 3 === 2 ? b.cercado.zonas.length - 1 : 0]; x = e.x + Z[0] + r(b) * (Z[2] - Z[0]); z = e.z + Z[1] + r(b) * (Z[3] - Z[1]); }
    else { x = e.x - FOLGA + r(b) * (e.l + 2 * FOLGA); z = e.z - FOLGA + r(b) * (e.p + 2 * FOLGA); }
    if (serve(m, b, x, z) && (k > 25 || folgado(b, x, z))) { b.x = b.ax = x; b.z = b.az = z; b.fora = false; return; }
  }
  // não há chão livre em volta (abrigo todo cercado): fica na frente da base, só para não sumir
  b.x = b.ax = e.x + e.l * (0.25 + 0.5 * r(b)); b.z = b.az = e.z + e.p + 0.3; b.fora = true;
}
function parar(b) {
  const D = b.distracoes, p = b.j.pausa;
  b.estado = D.length && r(b) < 0.55 ? D[Math.floor(r(b) * D.length)] : 'parada';
  b.t = p[0] + r(b) * (p[1] - p[0]);
}
function escolher(m, b) {
  if (b.fora) { b.t = 3; return; }
  for (let k = 0; k < 5; k++) {
    let x, z;
    if (b.cercado) { const Z = b.cercado.zonas[r(b) < 0.72 ? 0 : b.cercado.zonas.length - 1]; x = b.e.x + Z[0] + r(b) * (Z[2] - Z[0]); z = b.e.z + Z[1] + r(b) * (Z[3] - Z[1]); }
    else { const a = r(b) * DUAS_PI, d = 0.8 + r(b) * 2.2; x = b.x + Math.cos(a) * d; z = b.z + Math.sin(a) * d; }
    if (!serve(m, b, x, z) || !folgado(b, x, z) || !caminhoServe(m, b, x, z)) continue;
    const dx = x - b.x, dz = z - b.z;
    if (Math.abs(dx) + Math.abs(dz) < 0.3) continue;
    b.ax = x; b.az = z; b.estado = 'andar';
    b.frente = dx + dz > 0; b.direita = dx - dz > 0;
    return;
  }
  b.estado = 'parada'; b.t = 1 + r(b) * 2;
}
function andar(m, b, dt) {
  b.fase += dt;
  if (b.estado === 'andar') {
    const dx = b.ax - b.x, dz = b.az - b.z, d = Math.hypot(dx, dz), passo = b.j.vel * dt;
    if (d <= passo || d < 0.02) { b.x = b.ax; b.z = b.az; parar(b); } else { b.x += (dx / d) * passo; b.z += (dz / d) * passo; }
  } else if ((b.t -= dt) <= 0) escolher(m, b);
}

// a figura do bicho com o apoio em (sx, sy)
function desenharBicho(g, cena, sx, sy, S) {
  const b = this, A = cena.atlas;
  // a ovelha tosquiada fica pelada até a lã crescer de novo
  const a = b.a, base = b.pelada && a.produzidos > 0 && !(a.pronto > 0) && !a.fim ? b.pelada : b.especie;
  let chave = chaveDe(base, b.estado, b.frente);
  if (!A.tem(chave)) chave = chaveDe(base, b.estado === 'andar' ? 'andar' : 'parada', b.frente);
  if (!A.tem(chave)) chave = chaveDe(base, 'parada', true);
  const p = A.peca(chave), espelhar = b.frente ? b.direita : !b.direita;
  const quadro = p ? Math.floor(b.fase * (p.qps || 6)) % p.q.length : 0;
  if (!A.desenhar(g, chave, quadro, sx, sy, S, espelhar)) desenharReserva(g, figuraDeReserva(chave), sx, sy, S, espelhar);
}

// ---------- as listas: quem aparece, onde mora ----------
function novoBicho(m, a, atlas) {
  const j = JEITO[a.especie] || PADRAO;
  const b = {
    id: a.id, a, especie: a.especie, j, e: null, cercado: null, vizinhos: V.soltos, s: semente(a.id) || 1,
    x: 0, z: 0, ax: 0, az: 0, raio: j.raio, estado: 'parada', t: 0, fase: 0, frente: true, direita: false, fora: false,
    pelada: atlas.tem('animal/' + a.especie + '-tosquiada/parada-frente') ? a.especie + '-tosquiada' : null,
    distracoes: DISTRACOES.filter((d) => atlas.tem('animal/' + a.especie + '/' + d + '-frente')),
    desenhar: desenharBicho,
  };
  b.fase = r(b) * 4; b.t = r(b) * 3; b.frente = r(b) < 0.7; b.direita = r(b) < 0.5;
  return b;
}
function conferir(m, cena) {
  const A = m.animais, loc = m.local;
  if (!A) { V.soltos.length = 0; V.cercados.clear(); V.abrigos.length = 0; return; }
  const mudouMundo = V.mundo !== m, mudouLista = mudouMundo || V.versao !== A.versao, mudouLugar = mudouLista || V.local !== loc || V.locVersao !== loc.versao;
  if (!mudouLugar) return;
  if (mudouMundo) V.porId.clear();
  V.mundo = m; V.versao = A.versao; V.local = loc; V.locVersao = loc.versao;
  V.soltos.length = 0; V.cercados.clear(); V.abrigos.length = 0;
  for (let k = 0; k < loc.entidades.length; k++) { const e = loc.entidades[k]; if (A.abrigos[e.id] && !(e.obraAte > 0)) V.abrigos.push(e); }
  const vivos = new Set();
  for (const a of A.lista) {
    if (a.familia !== 'producao' || !a.abrigo) continue;
    const e = loc.porId[a.abrigo];
    if (!e || e.obraAte > 0) continue;
    vivos.add(a.id);
    let b = V.porId.get(a.id);
    const novo = !b;
    if (novo) { b = novoBicho(m, a, cena.atlas); V.porId.set(a.id, b); }
    b.a = a;
    const cercado = CERCADOS[e.tipo] || null, mudou = novo || b.e !== e || b.ex !== e.x || b.ez !== e.z;
    b.e = e; b.ex = e.x; b.ez = e.z; b.cercado = cercado;
    if (cercado) { let L = V.cercados.get(e.id); if (!L) V.cercados.set(e.id, L = []); L.push(b); b.vizinhos = L; } else { V.soltos.push(b); b.vizinhos = V.soltos; }
    b.novo = mudou;
  }
  for (const id of V.porId.keys()) if (!vivos.has(id)) V.porId.delete(id);
  // quem é novo, mudou de abrigo ou ficou num lugar que não serve mais (construíram em cima) ganha um lugar
  for (const b of V.porId.values()) {
    if (!vivos.has(b.id)) continue;
    if (b.novo || !serve(m, b, b.x, b.z)) { assentar(m, b); b.estado = 'parada'; }
    else if (b.estado === 'andar' && !caminhoServe(m, b, b.ax, b.az)) { b.ax = b.x; b.az = b.z; b.estado = 'parada'; b.t = 1; }
    b.novo = false;
  }
}

// os soltos entram na ordem de profundidade da cena
SOLTAS.push((m, cena, dt) => {
  conferir(m, cena);
  const L = V.soltos;
  if (dt > 0) for (let k = 0; k < L.length; k++) andar(m, L[k], dt);
  return L;
});

// ---------- o curral: as vacas entre as camadas ----------
const ordem = [];
function sombraNoChao(g, sx, sy, raio, S) { g.beginPath(); g.ellipse(sx, sy + 0.04 * S, raio * S, raio * S * 0.55, 0, 0, DUAS_PI); g.fill(); }
function desenharCercado(g, cena, m, e, sx, sy, S) {
  const A = cena.atlas, cam = cena.cam, C = CERCADOS[e.tipo], L = V.cercados.get(e.id) || ordem, dt = cena.dtDosBichos || 0;
  const emCamadas = A.pronta(C.fundo) && A.pronta(C.frente);
  if (emCamadas) A.desenhar(g, C.fundo, 0, sx, sy, S, false);
  else if (!A.desenhar(g, 'objeto/' + e.tipo, 0, sx, sy, S, false)) desenharReserva(g, figuraDeReserva('objeto/' + e.tipo, 0, e.l, e.p, 0), sx, sy, S, false);
  // de trás para a frente (são poucas: ordenação por inserção, sem lista nova)
  for (let k = 1; k < L.length; k++) { const b = L[k]; let i = k - 1; while (i >= 0 && L[i].x + L[i].z > b.x + b.z) { L[i + 1] = L[i]; i--; } L[i + 1] = b; }
  const corte = e.z + C.atras, alfa = g.globalAlpha;
  g.fillStyle = 'rgba(34, 52, 20, 0.22)';
  for (let k = 0; k < L.length; k++) { const b = L[k]; if (dt > 0) andar(m, b, dt); sombraNoChao(g, cam.telaX(b.x, b.z), cam.telaY(b.x, 0, b.z), b.raio, S); }
  for (let k = 0; k < L.length; k++) { const b = L[k]; if (b.z < corte) b.desenhar(g, cena, cam.telaX(b.x, b.z), cam.telaY(b.x, 0, b.z), S); }
  // a sombra (o telhado) por cima de quem está debaixo dela
  if (emCamadas && C.sombra && A.pronta(C.sombra)) A.desenhar(g, C.sombra, 0, cam.telaX(e.x + C.sombraEm[0], e.z + C.sombraEm[1]), cam.telaY(e.x + C.sombraEm[0], 0, e.z + C.sombraEm[1]), S, false);
  for (let k = 0; k < L.length; k++) { const b = L[k]; if (b.z >= corte) b.desenhar(g, cena, cam.telaX(b.x, b.z), cam.telaY(b.x, 0, b.z), S); }
  if (emCamadas) A.desenhar(g, C.frente, 0, sx, sy, S, false);
  g.globalAlpha = alfa;
}
for (const tipo in CERCADOS) comportamento(tipo, { visual(m, e, v) { v.desenhar = desenharCercado; } });

// ---------- o balão em cima do abrigo ----------
const pedido = { produto: null, fim: false, comida: false, agua: false }, caixa = [0, 0, 0, 0];
const vis = { chave: '', quadro: 0, espelhar: false, variante: 0, desenhar: null };
const icones = {};
const iconeDe = (item) => icones[item] || (icones[item] = 'icone/' + item);
let tempo = 0;
// um ícone do catálogo (ou o de reserva) numa caixa de lado t com centro em (cx, cy)
function icone(g, A, chave, cx, cy, t, dados) {
  const p = A.peca(chave);
  if (p && A.pronta(chave)) {
    const k = Math.min(t / p.casa[0], t / p.casa[1]);
    A.desenhar(g, chave, 0, cx - t / 2 + (t - p.casa[0] * k) / 2 + p.apoio[0] * k, cy - t / 2 + (t - p.casa[1] * k) / 2 + p.apoio[1] * k, k * p.e, false);
  } else { g.save(); g.translate(cx - t / 2, cy - t / 2); pintarIconeDeReserva(g, chave, t, dados); g.restore(); }
}
// um balão redondo com bico: "bom" (há produto: dourado, brilha e pula) ou "falta" (rosado, com um ponto de exclamação)
function balao(g, sx, sy, raio, bom) {
  g.lineJoin = 'round';
  if (bom) { const a = 0.5 + 0.5 * Math.sin(tempo * 4.4); g.beginPath(); g.arc(sx, sy, raio * (1.34 + 0.14 * a), 0, DUAS_PI); g.fillStyle = `rgba(255, 216, 74, ${0.32 + 0.22 * a})`; g.fill(); }
  g.lineWidth = Math.max(2, raio * 0.13); g.strokeStyle = TRACO; g.fillStyle = bom ? '#fff3c4' : '#ffe6de';
  g.beginPath(); g.moveTo(sx - raio * 0.34, sy + raio * 0.86); g.lineTo(sx, sy + raio * 1.42); g.lineTo(sx + raio * 0.34, sy + raio * 0.86); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.arc(sx, sy, raio, 0, DUAS_PI); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(sx - raio * 0.3, sy + raio * 0.9); g.lineTo(sx, sy + raio * 1.3); g.lineTo(sx + raio * 0.3, sy + raio * 0.9); g.closePath(); g.fill();
}
function exclamacao(g, x, y, raio) {
  g.beginPath(); g.arc(x, y, raio, 0, DUAS_PI); g.fillStyle = '#e2452f'; g.fill(); g.lineWidth = Math.max(1.5, raio * 0.22); g.strokeStyle = TRACO; g.stroke();
  g.fillStyle = '#fff'; g.fillRect(x - raio * 0.16, y - raio * 0.6, raio * 0.32, raio * 0.72); g.fillRect(x - raio * 0.16, y + raio * 0.3, raio * 0.32, raio * 0.3);
}
// onde ficam os balões de um abrigo na tela (para o toque neles valer como toque no abrigo)
const alvos = [];
let nAlvos = 0;
registrarCamada('cima', (g, cam, m, S, cena, dt) => {
  cena.dtDosBichos = dt; // (as vacas do curral andam no desenho da própria construção, no quadro seguinte)
  nAlvos = 0;
  if (!m.animais) return;
  conferir(m, cena);
  tempo += dt;
  const L = V.abrigos, W = cena.cv.width, H = cena.cv.height, A = cena.atlas;
  for (let k = 0; k < L.length; k++) {
    const e = L[k], P = pedidoDoAbrigo(m, e, pedido);
    const n = (P.produto ? 1 : 0) + (P.comida ? 1 : 0) + (P.agua ? 1 : 0) + (P.fim ? 1 : 0);
    if (!n) continue;
    const cx = e.x + e.l / 2, cz = e.z + e.p / 2, sx = cam.telaX(cx, cz), chao = cam.telaY(cx, 0, cz);
    if (sx < -3 * S || sx > W + 3 * S || chao < -S || chao > H + 6 * S) continue;
    const raio = Math.max(15 * cam.dpr, 0.36 * S);
    let topo = cam.telaY(cx, TIPOS[e.tipo].altura || 1.6 + Math.min(e.l, e.p) * 0.5, cz);
    vis.quadro = 0; vis.variante = 0; vis.desenhar = null;
    TIPOS[e.tipo].visual(m, e, vis);
    if (A.pronta(vis.chave) && A.caixa(vis.chave, 0, sx, chao, S, caixa)) topo = caixa[1] + (caixa[3] - caixa[1]) * 0.06;
    const passo = raio * 2.25, comida = m.dados.comidaDoAbrigo[e.tipo];
    let x = sx - ((n - 1) * passo) / 2;
    const um = (chave, bom, aviso) => {
      const y = topo - raio * 1.15 - (bom ? Math.abs(Math.sin(tempo * 3.2)) * raio * 0.28 : 0);
      balao(g, x, y, raio, bom);
      icone(g, A, chave, x, y, raio * (bom ? 1.5 : 1.3), m.dados);
      if (aviso) exclamacao(g, x + raio * 0.72, y - raio * 0.72, raio * 0.36);
      if (nAlvos >= alvos.length) alvos.push({ id: '', x: 0, y: 0, r: 0 });
      const t = alvos[nAlvos++]; t.id = e.id; t.x = x; t.y = y; t.r = raio * 1.25;
      x += passo;
    };
    if (P.produto) um(iconeDe(P.produto), true, false);
    if (P.comida && comida) um(iconeDe(comida), false, true);
    if (P.agua) um('icone/gota', false, true);
    if (P.fim) um('ui/relogio', false, true);
  }
});

// o toque num balão, ou num bicho solto, vale como o toque no abrigo dele
ALVOS_DE_CIMA.push((m, px, py, cena) => {
  for (let k = 0; k < nAlvos; k++) { const t = alvos[k]; if (Math.abs(px - t.x) <= t.r && Math.abs(py - t.y) <= t.r && m.local.porId[t.id]) return t.id; }
  if (V.mundo !== m || V.local !== m.local) return null;
  const cam = cena.cam, S = cam.S, L = V.soltos;
  let achou = null, prof = -Infinity;
  for (let k = 0; k < L.length; k++) {
    const b = L[k], sx = cam.telaX(b.x, b.z), sy = cam.telaY(b.x, 0, b.z), meia = Math.max(b.raio * 1.9, 0.4) * S;
    if (px < sx - meia || px > sx + meia || py > sy + 0.15 * S || py < sy - Math.max(b.raio * 3.4, 0.95) * S) continue;
    if (b.x + b.z > prof && m.local.porId[b.e.id]) { prof = b.x + b.z; achou = b.e.id; }
  }
  return achou;
});

// para as ferramentas de conferência: onde está cada bicho desenhado
export function bichosNoTerreno() { const out = []; for (const b of V.porId.values()) out.push({ id: b.id, especie: b.especie, x: b.x, z: b.z, estado: b.estado, abrigo: b.e ? b.e.id : null, cercado: !!b.cercado, fora: b.fora }); return out; }
