// O que a frente de construir desenha no quadro (render/cena.js: registrarCamada e v.desenhar):
//   fundo  o celeiro por dentro (fundo escuro, piso de tábuas, paredes do fundo, soleira) e o calçamento da fazenda
//   chao   a planta do que a personagem foi mandada erguer e as casas verdes ou vermelhas do fantasma
//   cima   o fantasma do que está sendo colocado, a barra e o relógio em cima de cada obra, a seta da saída
// e as figuras que não são uma peça só: a obra subindo com andaime, a cerca em trechos que se emendam (com mourão
// nos cantos) e a porteira, que abre quando alguém chega perto.
// Quem liga o fantasma é a interface (ui/colocacao.js), preenchendo FANTASMA.
import { registrarCamada, COR_DA_ACAO } from './cena.js';
import { KX, KY, KA } from './camera.js';
import { figuraDeReserva, desenharReserva, TRACO } from './reserva.js';
import { TIPOS } from '../nucleo/registro.js';
import { DESENHO, comportamento, defDe, casasDe, planejadas, andamentoDaObra, faltaDaObra, PISO, SOLEIRA } from '../nucleo/sistemas/construcao.js';

COR_DA_ACAO.colocarConstrucao = COR_DA_ACAO.montarMovel = COR_DA_ACAO.martelar = '#f0b765';
COR_DA_ACAO.entrarNoCeleiro = '#f6e3b5';

// o que está sendo colocado ou mudado de lugar (a interface preenche; o desenho só lê)
//   id = construção; x, z = canto da base; giro; ok = o lugar serve; ruins = casas [x, z, x, z...] que não servem;
//   mudando = a entidade que está sendo mudada (some do lugar antigo enquanto o fantasma anda);
//   cursor = só uma casa marcada, sem figura (modo de arrumar: escolher o que mudar)
export const FANTASMA = { ligado: false, id: '', x: 0, z: 0, giro: 0, ok: false, ruins: [], nRuins: 0, mudando: null, cursor: false, local: '' };

const VERDE = '#7be05a', VERMELHO = '#ff6a4d', MADEIRA = '#c98a45', MADEIRA_CLARA = '#e6b473';
const caixa = [0, 0, 0, 0];
const CHAVE = {};
const chaveDe = (id) => CHAVE[id] || (CHAVE[id] = 'objeto/' + id);
const ehCerca = (tipo) => tipo.startsWith('cerca');

// ---------- ajudantes ----------
// o contorno da base de l por p casas com o canto em (x, z), no chão
function base(g, cam, x, z, l, p, folga = 0) {
  const f = folga;
  g.moveTo(cam.telaX(x + f, z + f), cam.telaY(x + f, 0, z + f));
  g.lineTo(cam.telaX(x + l - f, z + f), cam.telaY(x + l - f, 0, z + f));
  g.lineTo(cam.telaX(x + l - f, z + p - f), cam.telaY(x + l - f, 0, z + p - f));
  g.lineTo(cam.telaX(x + f, z + p - f), cam.telaY(x + f, 0, z + p - f));
  g.closePath();
}
function reta(g, cam, x0, y0, z0, x1, y1, z1) { g.moveTo(cam.telaX(x0, z0), cam.telaY(x0, y0, z0)); g.lineTo(cam.telaX(x1, z1), cam.telaY(x1, y1, z1)); }
// madeira com contorno: um traço escuro grosso e um claro por cima
function madeira(g, S, tracar, grossura = 0.09) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); tracar(); g.lineWidth = Math.max(3, grossura * S); g.strokeStyle = TRACO; g.stroke();
  g.beginPath(); tracar(); g.lineWidth = Math.max(1.5, grossura * S * 0.55); g.strokeStyle = MADEIRA; g.stroke();
}
// a peça do catálogo com o apoio em (sx, sy); sem ela (ou enquanto não chega), a figura de reserva
function peca(g, cena, chave, sx, sy, S, espelhar, l = 1, p = 1) {
  if (!cena.atlas.desenhar(g, chave, 0, sx, sy, S, espelhar)) desenharReserva(g, figuraDeReserva(chave, 0, l, p, 0), sx, sy, S, espelhar);
}
// m:ss ou h:mm:ss
function relogio(seg) {
  const s = Math.ceil(seg), h = Math.floor(s / 3600), mi = Math.floor((s % 3600) / 60), ss = s % 60;
  return h > 0 ? `${h}:${mi < 10 ? '0' : ''}${mi}:${ss < 10 ? '0' : ''}${ss}` : `${mi}:${ss < 10 ? '0' : ''}${ss}`;
}

// ---------- a obra: o chão batido, a figura subindo de baixo para cima e o andaime em volta ----------
function desenharObra(g, cena, m, e, sx, sy, S) {
  const cam = cena.cam, v = cena.v, A = cena.atlas, alfa = g.globalAlpha, feito = andamentoDaObra(m, e);
  g.beginPath(); base(g, cam, e.x, e.z, e.l, e.p, 0.06);
  g.fillStyle = '#d9b98a'; g.fill(); g.lineWidth = Math.max(1.5, 0.03 * S); g.strokeStyle = 'rgba(58,36,18,.55)'; g.stroke();
  // a altura do andaime acompanha a da figura
  let alto = 1.4;
  const tem = A.pronta(v.chave) && A.caixa(v.chave, 0, sx, sy, S, caixa);
  if (tem) alto = Math.max(0.9, Math.min(2.6, ((sy - caixa[1]) / (KA * S)) * 0.72));
  const x0 = e.x + 0.1, z0 = e.z + 0.1, x1 = e.x + e.l - 0.1, z1 = e.z + e.p - 0.1;
  // as estacas e as travessas de trás
  madeira(g, S, () => { reta(g, cam, x0, 0, z0, x0, alto, z0); reta(g, cam, x0, alto, z0, x1, alto, z0); reta(g, cam, x0, alto, z0, x0, alto, z1); });
  if (tem) {
    g.globalAlpha = alfa * 0.28; A.desenhar(g, v.chave, 0, sx, sy, S, v.espelhar);
    const y = caixa[3] - (caixa[3] - caixa[1]) * (0.12 + 0.88 * feito);
    g.save(); g.beginPath(); g.rect(caixa[0] - S, y, caixa[2] - caixa[0] + 2 * S, caixa[3] - y + S); g.clip();
    g.globalAlpha = alfa; A.desenhar(g, v.chave, 0, sx, sy, S, v.espelhar);
    g.restore();
  } else { g.globalAlpha = alfa * 0.55; desenharReserva(g, figuraDeReserva(v.chave, 0, e.l, e.p, 0), sx, sy, S, v.espelhar); }
  g.globalAlpha = alfa;
  // as estacas dos lados e da frente, com as travessas e uma em diagonal
  madeira(g, S, () => {
    reta(g, cam, x1, 0, z0, x1, alto, z0); reta(g, cam, x0, 0, z1, x0, alto, z1); reta(g, cam, x1, 0, z1, x1, alto, z1);
    reta(g, cam, x0, alto, z1, x1, alto, z1); reta(g, cam, x1, alto, z0, x1, alto, z1);
    reta(g, cam, x0, alto * 0.5, z1, x1, alto * 0.5, z1); reta(g, cam, x1, alto * 0.5, z0, x1, alto * 0.5, z1);
  });
}
const NADA = () => {};
DESENHO.visual = (m, e, v) => {
  if (FANTASMA.ligado && FANTASMA.mudando === e) { v.desenhar = NADA; return; } // está na mão do jogador: aparece como fantasma
  if (e.obraAte > 0) v.desenhar = desenharObra;
};

// ---------- cerca e porteira ----------
// com quem a cerca da casa (x, z) se emenda: 1 = -X, 2 = +X, 4 = -Z, 8 = +Z (outra cerca, ou a ponta de uma porteira)
const portas = { loc: null, versao: -1, eixo: new Map() }; // casa → 'x' | 'z' das porteiras do local
function conferirPorteiras(m, loc) {
  if (portas.loc === loc && portas.versao === loc.versao) return;
  portas.loc = loc; portas.versao = loc.versao; portas.eixo.clear();
  for (const e of m.construcao.todas) {
    if (e.tipo !== 'porteira' || e.local !== loc.id) continue;
    for (let z = e.z; z < e.z + e.p; z++) for (let x = e.x; x < e.x + e.l; x++) portas.eixo.set(z * loc.l + x, e.giro ? 'z' : 'x');
  }
}
function emenda(m, loc, x, z, eixo) {
  const o = loc.entidadeEm(x, z);
  if (o && ehCerca(o.tipo)) return true;
  return loc.dentro(x, z) && portas.eixo.get(z * loc.l + x) === eixo;
}
function vizinhasDaCerca(m, e) {
  const loc = m.locais[e.local];
  if (e._cv === loc.versao && e._cl === loc) return e._cm;
  conferirPorteiras(m, loc);
  let n = 0;
  if (emenda(m, loc, e.x - 1, e.z, 'x')) n |= 1;
  if (emenda(m, loc, e.x + 1, e.z, 'x')) n |= 2;
  if (emenda(m, loc, e.x, e.z - 1, 'z')) n |= 4;
  if (emenda(m, loc, e.x, e.z + 1, 'z')) n |= 8;
  e._cv = loc.versao; e._cl = loc; e._cm = n;
  return n;
}
// metade de um trecho: recorta a figura pela vertical do meio da casa (na tela, -X e +Z ficam à esquerda)
function meia(g, cena, chave, sx, sy, S, esquerda) {
  g.save(); g.beginPath();
  if (esquerda) g.rect(sx - 2 * S, sy - 3 * S, 2 * S, 5 * S); else g.rect(sx, sy - 3 * S, 2 * S, 5 * S);
  g.clip();
  peca(g, cena, chave, sx, sy, S, false);
  g.restore();
}
function desenharCerca(g, cena, m, e, sx, sy, S) {
  const n = vizinhasDaCerca(m, e), emX = n & 3, emZ = n & 12;
  if (!emZ) { peca(g, cena, 'objeto/cerca-x', sx, sy, S, false); return; }
  if (!emX) { peca(g, cena, 'objeto/cerca-z', sx, sy, S, false); return; }
  // canto ou encontro: de trás para a frente, as metades que há e o mourão no meio
  if (n & 1) meia(g, cena, 'objeto/cerca-x', sx, sy, S, true);
  if (n & 4) meia(g, cena, 'objeto/cerca-z', sx, sy, S, false);
  peca(g, cena, 'objeto/mourao', sx, sy, S, false);
  if (n & 2) meia(g, cena, 'objeto/cerca-x', sx, sy, S, false);
  if (n & 8) meia(g, cena, 'objeto/cerca-z', sx, sy, S, true);
}
function visualDaCerca(m, e, v) {
  const n = vizinhasDaCerca(m, e);
  v.chave = (n & 12) && !(n & 3) ? 'objeto/cerca-z' : 'objeto/cerca-x';
  v.desenhar = desenharCerca;
}
// a porteira abre quando a personagem chega perto
function visualDaPorteira(m, e, v) {
  const p = m.personagem;
  if (p.local === e.local && Math.abs(p.x - (e.x + e.l / 2)) < e.l / 2 + 0.9 && Math.abs(p.z - (e.z + e.p / 2)) < e.p / 2 + 0.9) v.chave = 'objeto/porteira-aberta';
}
let ligou = null;
function ligarTipos(m) {
  if (ligou === m.dados) return;
  ligou = m.dados;
  for (const def of Object.values(m.dados.construcoes)) {
    if (ehCerca(def.id)) comportamento(def.id, { visual: visualDaCerca });
    else if (def.id === 'porteira') comportamento(def.id, { visual: visualDaPorteira });
  }
}

// ---------- o celeiro por dentro ----------
const FUNDO = '#26211d', PISO_COR = '#d98f33', PISO_BORDA = '#8a5220';
function desenharInterior(g, cam, m, S, cena) {
  const loc = m.local, L = loc.piso[0], P = loc.piso[1], A = cena.atlas, W = cena.cv.width, H = cena.cv.height;
  g.fillStyle = FUNDO; g.fillRect(0, 0, W, H);
  // a espessura do piso, na frente
  const esp = 0.16;
  g.beginPath();
  g.moveTo(cam.telaX(0, P), cam.telaY(0, 0, P)); g.lineTo(cam.telaX(L, P), cam.telaY(L, 0, P)); g.lineTo(cam.telaX(L, 0), cam.telaY(L, 0, 0));
  g.lineTo(cam.telaX(L, 0), cam.telaY(L, -esp, 0)); g.lineTo(cam.telaX(L, P), cam.telaY(L, -esp, P)); g.lineTo(cam.telaX(0, P), cam.telaY(0, -esp, P)); g.closePath();
  g.fillStyle = PISO_BORDA; g.fill();
  // o piso: uma peça por casa (de trás para a frente); sem a peça, um losango liso
  const temPiso = A.pronta('objeto/piso-tabuas');
  if (!temPiso) { g.beginPath(); base(g, cam, 0, 0, L, P); g.fillStyle = PISO_COR; g.fill(); }
  else for (let s = 0; s <= L + P - 2; s++) for (let x = Math.max(0, s - P + 1); x <= Math.min(L - 1, s); x++) {
    const z = s - x;
    A.desenhar(g, 'objeto/piso-tabuas', 0, cam.telaX(x + 0.5, z + 0.5), cam.telaY(x + 0.5, 0, z + 0.5), S, false);
  }
  // a soleira: a luz do dia entrando pela porta
  const px = loc.porta[0];
  g.beginPath(); base(g, cam, px, P, 2, 1);
  g.fillStyle = '#f6d98a'; g.fill();
  g.beginPath(); base(g, cam, px + 0.12, P + 0.14, 1.76, 0.72);
  g.fillStyle = '#9fd36a'; g.fill(); g.lineWidth = Math.max(1.5, 0.035 * S); g.strokeStyle = TRACO; g.lineJoin = 'round'; g.stroke();
  g.beginPath(); base(g, cam, 0, 0, L, P);
  g.lineWidth = Math.max(2, 0.04 * S); g.strokeStyle = TRACO; g.stroke();
  // as paredes do fundo: em z = 0 (ao longo de X) e em x = 0 (ao longo de Z)
  if (A.pronta('objeto/parede-x') && A.pronta('objeto/parede-z')) {
    for (let z = P - 1; z >= 0; z--) A.desenhar(g, 'objeto/parede-z', 0, cam.telaX(0, z + 0.5), cam.telaY(0, 0, z + 0.5), S, false);
    for (let x = L - 1; x >= 0; x--) A.desenhar(g, 'objeto/parede-x', 0, cam.telaX(x + 0.5, 0), cam.telaY(x + 0.5, 0, 0), S, false);
  } else {
    const alto = 2.6;
    g.beginPath();
    g.moveTo(cam.telaX(0, P), cam.telaY(0, 0, P)); g.lineTo(cam.telaX(0, 0), cam.telaY(0, 0, 0)); g.lineTo(cam.telaX(L, 0), cam.telaY(L, 0, 0));
    g.lineTo(cam.telaX(L, 0), cam.telaY(L, alto, 0)); g.lineTo(cam.telaX(0, 0), cam.telaY(0, alto, 0)); g.lineTo(cam.telaX(0, P), cam.telaY(0, alto, P)); g.closePath();
    g.fillStyle = '#e0a13c'; g.fill(); g.lineWidth = Math.max(2, 0.04 * S); g.strokeStyle = TRACO; g.stroke();
  }
}
// a seta da saída, pulando em cima da soleira
function setaDaSaida(g, cam, m, S, cena) {
  const loc = m.local, px = loc.porta[0] + 1, pz = loc.piso[1] + 0.5;
  const sx = cam.telaX(px, pz), sy = cam.telaY(px, 0, pz) + (0.06 + 0.05 * Math.sin(cena.tempo * 4)) * S, a = Math.max(9 * cam.dpr, 0.2 * S);
  // aponta para baixo e para a esquerda: é para onde fica +Z na tela
  g.save(); g.translate(sx, sy); g.rotate(Math.atan2(KY, -KX) - Math.PI / 2);
  g.beginPath(); g.moveTo(0, a * 1.3); g.lineTo(-a, 0); g.lineTo(-a * 0.4, 0); g.lineTo(-a * 0.4, -a); g.lineTo(a * 0.4, -a); g.lineTo(a * 0.4, 0); g.lineTo(a, 0); g.closePath();
  g.fillStyle = '#fff9ec'; g.fill(); g.lineWidth = Math.max(2, a * 0.2); g.lineJoin = 'round'; g.strokeStyle = TRACO; g.stroke();
  g.restore();
}

// ---------- o calçamento: rente ao chão, antes de tudo ----------
const planos = { loc: null, versao: -1, lista: [] };
function conferirPlanos(loc) {
  if (planos.loc === loc && planos.versao === loc.versao) return;
  planos.loc = loc; planos.versao = loc.versao; planos.lista.length = 0;
  for (const e of loc.entidades) if (TIPOS[e.tipo].plano) planos.lista.push(e);
  planos.lista.sort((a, b) => a.x + a.z - b.x - b.z);
}

registrarCamada('fundo', (g, cam, m, S, cena) => {
  const loc = m.local;
  ligarTipos(m);
  if (FANTASMA.ligado) { const d = cena.destaque; d.x = -1; d.entidade = null; d.casas = null; } // escolhendo o lugar, só o fantasma fica marcado
  if (loc.interior) desenharInterior(g, cam, m, S, cena);
  conferirPlanos(loc);
  const W = cena.cv.width, H = cena.cv.height;
  for (let k = 0; k < planos.lista.length; k++) {
    const e = planos.lista[k];
    if (FANTASMA.ligado && FANTASMA.mudando === e) continue;
    const sx = cam.telaX(e.x + e.l / 2, e.z + e.p / 2), sy = cam.telaY(e.x + e.l / 2, 0, e.z + e.p / 2);
    if (sx < -2 * S || sx > W + 2 * S || sy < -2 * S || sy > H + 2 * S) continue;
    peca(g, cena, chaveDe(e.tipo), sx, sy, S, !!e.giro, e.l, e.p);
  }
});

// ---------- no chão: a planta do que vai ser erguido e as casas do fantasma ----------
const plantas = [];
registrarCamada('chao', (g, cam, m, S, cena) => {
  const loc = m.local;
  g.lineJoin = 'round';
  // o que a personagem foi mandada erguer e ainda não martelou: o contorno da base, tracejado
  planejadas(m, plantas);
  for (let k = 0; k < plantas.length; k++) {
    const a = plantas[k], def = defDe(m, a.id);
    if (!def || a.local !== loc.id) continue;
    const cs = casasDe(def, a.giro);
    g.beginPath(); base(g, cam, a.x, a.z, cs[0], cs[1], 0.05);
    g.globalAlpha = 0.3; g.fillStyle = COR_DA_ACAO.colocarConstrucao; g.fill();
    g.globalAlpha = 1; g.lineWidth = Math.max(2, 0.05 * S); g.strokeStyle = TRACO; g.setLineDash([0.2 * S, 0.14 * S]); g.stroke(); g.setLineDash([]);
  }
  const F = FANTASMA;
  if (!F.ligado || F.local !== loc.id) return;
  const def = F.cursor ? null : defDe(m, F.id), cs = def ? casasDe(def, F.giro) : [1, 1], pulso = 0.5 + 0.5 * Math.sin(cena.tempo * 6);
  // as casas da base: verdes quando o lugar serve; vermelhas as que não servem (ou todas, se o motivo é do conjunto)
  for (let z = F.z; z < F.z + cs[1]; z++) for (let x = F.x; x < F.x + cs[0]; x++) {
    let ruim = !F.ok && F.nRuins === 0;
    for (let k = 0; k < F.nRuins && !ruim; k++) if (F.ruins[k * 2] === x && F.ruins[k * 2 + 1] === z) ruim = true;
    g.beginPath(); base(g, cam, x, z, 1, 1, 0.04);
    g.globalAlpha = F.cursor ? 0.25 : 0.5 + 0.12 * pulso; g.fillStyle = F.cursor ? '#ffe07a' : ruim ? VERMELHO : VERDE; g.fill();
    g.globalAlpha = 1;
  }
  g.beginPath(); base(g, cam, F.x, F.z, cs[0], cs[1], 0.02);
  g.lineWidth = Math.max(3, 0.08 * S); g.strokeStyle = 'rgba(58,36,18,.7)'; g.stroke();
  g.lineWidth = Math.max(1.5, 0.045 * S); g.strokeStyle = F.cursor ? '#ffe07a' : F.ok ? '#eaffd8' : '#ffd9d0'; g.stroke();
});

// ---------- por cima: o fantasma, a barra das obras e a seta da saída ----------
function barraDaObra(g, cam, m, S, cena, e) {
  const cx = e.x + e.l / 2, cz = e.z + e.p / 2, sx = cam.telaX(cx, cz), sy0 = cam.telaY(cx, 0, cz), W = cena.cv.width, H = cena.cv.height;
  if (sx < -S || sx > W + S || sy0 < -S || sy0 > H + 4 * S) return;
  let topo = sy0 - 1.6 * S;
  const chave = chaveDe(e.tipo);
  if (cena.atlas.pronta(chave) && cena.atlas.caixa(chave, 0, sx, sy0, S, caixa)) topo = Math.min(caixa[1] + (sy0 - caixa[1]) * 0.18, sy0 - 1.1 * S);
  const d = cam.dpr, px = Math.max(14 * d, 0.2 * S), w = Math.max(70 * d, 1.3 * S), h = Math.max(11 * d, 0.16 * S), x = sx - w / 2, y = Math.max(topo - h, 64 * d);
  const feito = andamentoDaObra(m, e);
  g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.fillStyle = '#fff9ec'; g.fill();
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.clip();
  g.fillStyle = '#74b83a'; g.fillRect(x, y, w * feito, h);
  g.restore();
  g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.lineWidth = Math.max(2, 2.5 * d); g.strokeStyle = TRACO; g.stroke();
  // o relógio, em cima da barra
  const texto = relogio(faltaDaObra(m, e));
  g.font = `800 ${Math.round(px)}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.lineWidth = Math.max(3, px * 0.28); g.lineJoin = 'round'; g.strokeStyle = TRACO; g.strokeText(texto, sx, y - px * 0.35);
  g.fillStyle = '#fff9ec'; g.fillText(texto, sx, y - px * 0.35);
}
registrarCamada('cima', (g, cam, m, S, cena) => {
  const loc = m.local, T = m.construcao.todas;
  for (let k = 0; k < T.length; k++) { const e = T[k]; if ((e.obraAte > 0 || e.ampliaAte > 0) && e.local === loc.id && !(FANTASMA.ligado && FANTASMA.mudando === e)) barraDaObra(g, cam, m, S, cena, e); }
  if (loc.interior && !FANTASMA.ligado) setaDaSaida(g, cam, m, S, cena);
  const F = FANTASMA;
  if (!F.ligado || F.cursor || F.local !== loc.id) return;
  const def = defDe(m, F.id);
  if (!def) return;
  const cs = casasDe(def, F.giro), sx = cam.telaX(F.x + cs[0] / 2, F.z + cs[1] / 2), sy = cam.telaY(F.x + cs[0] / 2, 0, F.z + cs[1] / 2) - (0.05 + 0.03 * Math.sin(cena.tempo * 5)) * S;
  g.globalAlpha = F.ok ? 0.85 : 0.5;
  peca(g, cena, ehCerca(F.id) ? 'objeto/cerca-x' : chaveDe(F.id), sx, sy, S, !!F.giro, cs[0], cs[1]);
  g.globalAlpha = 1;
});
