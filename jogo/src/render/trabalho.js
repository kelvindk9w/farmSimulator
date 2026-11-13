// O que a frente dos animais de trabalho e de estimação desenha:
//   os bichos soltos no terreiro (boi puxando o arado, cavalo, jumento com a carroça, cachorro, gato): a figura de
//   animal/<espécie>/<estado>-<frente|costas>; sem ela, a da espécie comum que faz o mesmo (o siamês usa a do gato);
//   sem nenhuma, a figura de reserva com o nome;
//   o sinal discreto em cima do bicho de estimação que ainda tem o mimo do dia; os corações do afago; o mimo subindo.
// A personagem montada é desenhada pela cena (personagem/montada-<andar|galope>-...): a lógica troca o estado dela.
// Custo por quadro: uma busca em mapa por bicho solto (a chave da figura é resolvida uma vez só).
import { registrarCamada, COR_DA_ACAO, GESTO_PARECIDO, ALVOS_DE_CIMA } from './cena.js';
import { TRACO } from './reserva.js';
import { DESENHO } from '../nucleo/sistemas/acompanhar.js';
import { temMimo } from '../nucleo/sistemas/estimacao.js';

COR_DA_ACAO.ararComBoi = '#c98a45';
COR_DA_ACAO.afagar = '#ff8fb1';
COR_DA_ACAO.encherBarril = COR_DA_ACAO.encherNoBarril = '#4aa9e6';
// os gestos dela que não têm figura própria
Object.assign(GESTO_PARECIDO, { afagar: 'alimentar', 'encher-no-barril': 'alimentar', conduzir: 'parada' });

let CENA = null, relogio = 0, montadas = false;
const RESOLVIDO = new Map();
// o estado que vale no lugar quando a figura dele não existe
const PARECIDO = { correr: ['andar'], galope: ['andar'], 'andar-barril': ['andar'], 'parado-barril': ['parado'], puxar: ['andar', 'parado'], sentado: ['parada', 'parado'], parada: ['parado'], parado: ['parada'] };
// casas andadas por volta inteira da animação (o passo acompanha o chão)
const CICLO = { andar: 1.5, 'andar-barril': 1.5, correr: 2.2, galope: 3.6, puxar: 1.2 };
const CICLO_PEQUENO = { andar: 0.75, correr: 1.4 }; // gato e cachorro

function resolver(atlas, especie, figura, estado, costas) {
  const k = especie + '|' + figura + '|' + estado + (costas ? '|c' : '|f');
  let r = RESOLVIDO.get(k);
  if (r) return r;
  const dirs = costas ? ['costas', 'frente'] : ['frente', 'costas'], estados = [estado, ...(PARECIDO[estado] || [])];
  achar: for (const quem of figura && figura !== especie ? [especie, figura] : [especie]) {
    for (const d of dirs) for (const est of estados) {
      const c = `animal/${quem}/${est}-${d}`;
      if (atlas.tem(c)) { r = { chave: c, deFrente: d === 'frente', estado: est }; break achar; }
    }
  }
  if (!r) r = { chave: `animal/${especie}/${estado}-${costas ? 'costas' : 'frente'}`, deFrente: !costas, estado };
  RESOLVIDO.set(k, r);
  return r;
}

const FOLGA = 0.22;
DESENHO.bicho = (m, e, v) => {
  if (!CENA) return;
  const atlas = CENA.atlas, fx = Math.sin(e.rumo), fz = Math.cos(e.rumo), praCa = fx + fz, praDireita = fx - fz;
  if (e.vf === undefined) { e.vf = praCa > 0; e.vd = praDireita > 0; }
  if (praCa > FOLGA) e.vf = true; else if (praCa < -FOLGA) e.vf = false;
  if (praDireita > FOLGA) e.vd = true; else if (praDireita < -FOLGA) e.vd = false;
  let estado = e.estado || 'parado';
  if (e.barril && (estado === 'andar' || estado === 'parado')) estado += '-barril';
  const r = resolver(atlas, e.especie, e.figura, estado, !e.vf);
  v.chave = r.chave;
  v.espelhar = r.deFrente ? e.vd : !e.vd;
  const def = atlas.peca(r.chave), nq = def ? def.q.length : 1;
  if (nq > 1) {
    const ciclo = (e.familia === 'estimacao' ? CICLO_PEQUENO : CICLO)[r.estado];
    v.quadro = ciclo && e.vel > 0.2 ? Math.floor((e.fase / ciclo) * nq) % nq : Math.floor(relogio * ((def && def.qps) || 5) + (e.num || 0) * 0.37) % nq;
  }
};

// ---------- corações do afago e o mimo que sobe ----------
const CORACOES = [], MIMOS = [];
export function coracoes(x, z) { for (let k = 0; k < 4; k++) CORACOES.push({ x: x + (Math.random() - 0.5) * 0.6, z: z + (Math.random() - 0.5) * 0.6, t: -k * 0.12, lado: Math.random() - 0.5 }); }
export function mimoNoAr(x, z, item, n) { MIMOS.push({ x, z, item, n, t: 0 }); }

function coracao(g, x, y, r, cor) {
  g.beginPath();
  g.moveTo(x, y + r * 0.9);
  g.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.75, y - r * 1.25, x, y - r * 0.45);
  g.bezierCurveTo(x + r * 0.75, y - r * 1.25, x + r * 1.5, y - r * 0.1, x, y + r * 0.9);
  g.closePath();
  g.fillStyle = cor; g.fill();
  g.lineWidth = Math.max(1.2, r * 0.22); g.strokeStyle = TRACO; g.stroke();
}

registrarCamada('fundo', (g, cam, m, S, cena, dt) => {
  CENA = cena; relogio = cena.tempo;
  // a figura montada de um cavalo especial (personagem/montada-<nome>-galope) cai na do cavalo comum se não existir
  if (!montadas && m.dados.animais) {
    montadas = true;
    for (const d of Object.values(m.dados.animais)) {
      if (!d.efeito || d.efeito.tipo !== 'montaria') continue;
      const s = d.id.replace(/^cavalo-?/, '');
      if (s) for (const a of ['andar', 'galope']) GESTO_PARECIDO[`montada-${s}-${a}`] = `montada-${a}`;
    }
  }
});

registrarCamada('cima', (g, cam, m, S, cena, dt) => {
  const E = m.estimacao, p = m.personagem;
  if (!E || p.local !== 'fazenda') { CORACOES.length = 0; MIMOS.length = 0; return; }
  const loc = m.local;
  // o sinal do mimo do dia: um coraçãozinho num círculo, pulando de leve em cima do bicho
  if (E.bichos.length) {
    const r = Math.max(6 * cam.dpr, 0.13 * S), pula = Math.abs(Math.sin(cena.tempo * 2.6)) * r * 0.35;
    for (const a of E.bichos) {
      const e = loc.porId['bicho:' + a.id];
      if (!e || !temMimo(m, a)) continue;
      const alto = e.estado === 'sentado' ? 0.95 : 0.85, sx = cam.telaX(e.x + 0.5, e.z + 0.5), sy = cam.telaY(e.x + 0.5, alto + (a.especie.startsWith('cach') || a.especie.startsWith('cao') ? 0.25 : 0), e.z + 0.5) - pula;
      g.beginPath(); g.arc(sx, sy, r * 1.2, 0, 6.2832); g.fillStyle = '#fff9ec'; g.fill(); g.lineWidth = Math.max(1.5, r * 0.2); g.strokeStyle = TRACO; g.stroke();
      coracao(g, sx, sy + r * 0.05, r * 0.62, '#ff6f9c');
    }
  }
  // corações do afago
  for (let k = CORACOES.length - 1; k >= 0; k--) {
    const c = CORACOES[k];
    c.t += dt;
    if (c.t > 1.3) { CORACOES.splice(k, 1); continue; }
    if (c.t < 0) continue;
    const sx = cam.telaX(c.x, c.z) + c.lado * c.t * 0.6 * S, sy = cam.telaY(c.x, 0.7 + c.t * 0.9, c.z);
    g.globalAlpha = Math.min(1, (1.3 - c.t) * 2.5);
    coracao(g, sx, sy, Math.max(5 * cam.dpr, 0.12 * S) * (0.8 + 0.4 * Math.min(1, c.t * 4)), '#ff6f9c');
    g.globalAlpha = 1;
  }
  // o mimo: o ícone do item sobe de cima do bicho, com quantos vieram
  for (let k = MIMOS.length - 1; k >= 0; k--) {
    const q = MIMOS[k];
    q.t += dt;
    if (q.t > 2.2) { MIMOS.splice(k, 1); continue; }
    const sx = cam.telaX(q.x, q.z), sy = cam.telaY(q.x, 1.1 + Math.min(1, q.t) * 0.7, q.z), a = Math.min(1, (2.2 - q.t) * 2);
    g.globalAlpha = a;
    const tam = Math.max(26 * cam.dpr, 0.55 * S);
    if (!cena.atlas.desenhar(g, 'icone/' + q.item, 0, sx, sy, tam, false)) { g.beginPath(); g.arc(sx, sy, tam * 0.3, 0, 6.2832); g.fillStyle = '#ffd84a'; g.fill(); g.strokeStyle = TRACO; g.lineWidth = 2; g.stroke(); }
    const fs = Math.max(14 * cam.dpr, 0.3 * S);
    g.font = `800 ${Math.round(fs)}px system-ui, sans-serif`; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.lineWidth = Math.max(3, fs * 0.22); g.strokeStyle = TRACO; g.strokeText('+' + q.n, sx + tam * 0.42, sy);
    g.fillStyle = '#fff9ec'; g.fillText('+' + q.n, sx + tam * 0.42, sy);
    g.globalAlpha = 1;
  }
});

// o toque no bicho de estimação vale num círculo de pelo menos 48 pontos (o gato é pequeno para o dedo); só com a
// Mão: com enxada, regador ou semente na mão, o toque perto dele é na terra (ele não atrapalha o serviço)
ALVOS_DE_CIMA.push((m, px, py, cena) => {
  const E = m.estimacao;
  if (!E || !E.bichos.length || m.personagem.local !== 'fazenda' || m.modo.id !== 'mao') return null;
  const cam = cena.cam, raio = Math.max(0.45 * cam.S, 24 * cam.dpr);
  let melhor = null, d0 = Infinity;
  for (const a of E.bichos) {
    const e = m.local.porId['bicho:' + a.id];
    if (!e) continue;
    const d = Math.hypot(px - cam.telaX(e.x + 0.5, e.z + 0.5), py - cam.telaY(e.x + 0.5, 0.35, e.z + 0.5));
    if (d < raio && d < d0) { d0 = d; melhor = e.id; }
  }
  return melhor;
});
