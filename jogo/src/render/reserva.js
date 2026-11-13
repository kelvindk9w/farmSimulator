// Figuras de reserva: o que o jogo desenha por código quando a peça do catálogo ainda não existe (ou não chegou).
// Formas simples no estilo de contorno (cor chapada e traço escuro), boas o bastante para jogar.
// Cada figura é desenhada uma vez num canvas próprio, a 96 pontos por unidade, e depois é só colada.
import { KX, KY, KA } from './camera.js';
import { acaso } from '../nucleo/util.js';

export const E0 = 96; // pontos por unidade das figuras de reserva
export const TRACO = '#3a2412';
const LW = 3;
const X = (x, z) => (x - z) * KX * E0, Y = (x, y, z) => (x + z) * KY * E0 - y * KA * E0;

// polígono com vértices [x, y, z, x, y, z, ...] no espaço da figura (origem no apoio, no chão)
function poli(g, cor, pts, traco = true) {
  g.beginPath();
  for (let i = 0; i < pts.length; i += 3) { const x = X(pts[i], pts[i + 2]), y = Y(pts[i], pts[i + 1], pts[i + 2]); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
  g.closePath();
  if (cor) { g.fillStyle = cor; g.fill(); }
  if (traco) g.stroke();
}
function linha(g, pts, cor, lw) {
  g.beginPath();
  for (let i = 0; i < pts.length; i += 3) { const x = X(pts[i], pts[i + 2]), y = Y(pts[i], pts[i + 1], pts[i + 2]); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
  g.save(); if (cor) g.strokeStyle = cor; if (lw) g.lineWidth = lw; g.stroke(); g.restore();
}
// caixa de (x0, z0) a (x1, z1), do chão y0 até y1: as duas faces que a câmera vê e o tampo
function prisma(g, x0, z0, x1, z1, y0, y1, topo, faceZ, faceX) {
  poli(g, faceZ, [x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1]);
  poli(g, faceX, [x1, y0, z0, x1, y0, z1, x1, y1, z1, x1, y1, z0]);
  if (topo) poli(g, topo, [x0, y1, z0, x1, y1, z0, x1, y1, z1, x0, y1, z1]);
}
// telhado de duas águas com a cumeeira ao longo de Z: a água de +X aparece inteira; a empena fica na face de +Z
function telhado(g, x0, z0, x1, z1, y, alto, beiral, cor, corEscura, parede) {
  const xm = (x0 + x1) / 2, yb = y - beiral * 0.5;
  poli(g, corEscura, [xm, y + alto, z0 - beiral, xm, y + alto, z1 + beiral, x0 - beiral, yb, z1 + beiral, x0 - beiral, yb, z0 - beiral]);
  if (parede) poli(g, parede, [x0, y, z1, x1, y, z1, xm, y + alto, z1]);
  poli(g, cor, [xm, y + alto, z0 - beiral, xm, y + alto, z1 + beiral, x1 + beiral, yb, z1 + beiral, x1 + beiral, yb, z0 - beiral]);
  // fiadas de telha
  for (let k = 1; k < 4; k++) { const t = k / 4, xx = xm + (x1 + beiral - xm) * t, yy = y + alto + (yb - y - alto) * t; linha(g, [xx, yy, z0 - beiral, xx, yy, z1 + beiral], corEscura, 2); }
}
function elipse(g, cx, cy, rx, ry, cor, traco = true) { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 6.2832); if (cor) { g.fillStyle = cor; g.fill(); } if (traco) g.stroke(); }
// várias bolas juntas com um contorno só por fora (copa de árvore, moita)
function bolas(g, lista, cor, luz) {
  g.save(); g.lineWidth = LW * 2; g.beginPath();
  for (const [x, y, r] of lista) { g.moveTo(x + r, y); g.arc(x, y, r, 0, 6.2832); }
  g.stroke(); g.fillStyle = cor; g.fill();
  if (luz) { g.fillStyle = luz; g.beginPath(); for (const [x, y, r] of lista) { g.moveTo(x - r * 0.25 + r * 0.45, y - r * 0.3); g.arc(x - r * 0.25, y - r * 0.3, r * 0.45, 0, 6.2832); } g.fill(); }
  g.restore();
}
function folha(g, x, y, comp, larg, ang, cor) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(comp * 0.5, -larg, comp, 0); g.quadraticCurveTo(comp * 0.5, larg, 0, 0); g.closePath();
  g.fillStyle = cor; g.fill(); g.stroke(); g.restore();
}

// ---------- construções e natureza ----------
const OBJETOS = {
  celeiro: {
    altura: 4.2,
    pintar(g, l, p) {
      const x0 = -l / 2 + 0.15, x1 = l / 2 - 0.15, z0 = -p / 2 + 0.15, z1 = p / 2 - 0.15, hw = 2.1;
      prisma(g, x0, z0, x1, z1, 0, 0.22, null, '#b9b4a8', '#9f9a8e');
      prisma(g, x0, z0, x1, z1, 0.22, hw, null, '#c98a45', '#a96f33');
      for (let k = 1; k < 6; k++) { const zz = z0 + ((z1 - z0) * k) / 6; linha(g, [x1, 0.22, zz, x1, hw, zz], '#8a5626', 2); }
      telhado(g, x0, z0, x1, z1, hw, 1.35, 0.3, '#e2562a', '#b83f1c', '#c98a45');
      // porta dupla verde com X branco, na face de +Z
      const xm = (x0 + x1) / 2, pl = Math.min(1.1, (x1 - x0) * 0.3), ph = 1.7;
      poli(g, '#f4f1e6', [xm - pl - 0.08, 0.22, z1, xm + pl + 0.08, 0.22, z1, xm + pl + 0.08, ph + 0.3, z1, xm - pl - 0.08, ph + 0.3, z1]);
      for (const [a, b] of [[xm - pl, xm - 0.03], [xm + 0.03, xm + pl]]) {
        poli(g, '#3f9b3b', [a, 0.26, z1, b, 0.26, z1, b, ph + 0.22, z1, a, ph + 0.22, z1]);
        linha(g, [a, 0.26, z1, b, ph + 0.22, z1], '#f4f1e6', 4); linha(g, [b, 0.26, z1, a, ph + 0.22, z1], '#f4f1e6', 4);
      }
      poli(g, '#4a2c16', [xm - 0.3, hw + 0.25, z1, xm + 0.3, hw + 0.25, z1, xm + 0.3, hw + 0.7, z1, xm - 0.3, hw + 0.7, z1]);
    },
  },
  casa: {
    altura: 3.9,
    pintar(g, l, p) {
      const x0 = -l / 2 + 0.3, x1 = l / 2 - 0.3, z0 = -p / 2 + 0.3, z1 = p / 2 - 0.3, hw = 1.9;
      prisma(g, x0, z0, x1, z1, 0, 0.2, null, '#b9b4a8', '#9f9a8e');
      prisma(g, x0, z0, x1, z1, 0.2, hw, null, '#fbe7b8', '#e6c98e');
      telhado(g, x0, z0, x1, z1, hw, 1.2, 0.28, '#d9643a', '#a94a26', '#fbe7b8');
      const xm = (x0 + x1) / 2;
      poli(g, '#3c78c2', [xm - 0.38, 0.2, z1, xm + 0.38, 0.2, z1, xm + 0.38, 1.5, z1, xm - 0.38, 1.5, z1]);
      elipse(g, X(xm + 0.22, z1), Y(xm + 0.22, 0.85, z1), 4, 4, '#f6c12c');
      const zm = (z0 + z1) / 2;
      poli(g, '#bfe6f5', [x1, 0.85, zm - 0.5, x1, 0.85, zm + 0.5, x1, 1.5, zm + 0.5, x1, 1.5, zm - 0.5]);
      linha(g, [x1, 0.85, zm, x1, 1.5, zm], null, 2); linha(g, [x1, 1.17, zm - 0.5, x1, 1.17, zm + 0.5], null, 2);
      // chaminé
      prisma(g, x1 - 0.9, z0 + 0.5, x1 - 0.45, z0 + 0.95, hw + 0.5, hw + 1.45, '#c9c2b4', '#b0a898', '#978f80');
    },
  },
  poco: {
    altura: 2.6,
    pintar(g, l, p) {
      const r = Math.min(l, p) * 0.36 * E0;
      // corpo de pedra: um cilindro
      g.beginPath(); g.ellipse(0, 0, r * 1.22, r * 0.72, 0, 0, Math.PI); g.lineTo(-r * 1.22, -0.55 * E0 * KA); g.ellipse(0, -0.55 * E0 * KA, r * 1.22, r * 0.72, 0, Math.PI, 0, true); g.closePath();
      g.fillStyle = '#b9b4a8'; g.fill(); g.stroke();
      elipse(g, 0, -0.55 * E0 * KA, r * 1.22, r * 0.72, '#cfcabf');
      elipse(g, 0, -0.55 * E0 * KA, r * 0.86, r * 0.5, '#3f9ad6');
      // dois esteios e o telhadinho
      for (const s of [-1, 1]) { g.fillStyle = '#b06a2c'; g.beginPath(); g.rect(s * r * 1.05 - 6, -2.0 * E0 * KA, 12, 1.5 * E0 * KA); g.fill(); g.stroke(); }
      g.beginPath(); g.moveTo(-r * 1.5, -1.95 * E0 * KA); g.lineTo(0, -2.6 * E0 * KA); g.lineTo(r * 1.5, -1.95 * E0 * KA); g.closePath(); g.fillStyle = '#e2562a'; g.fill(); g.stroke();
      linha(g, [0, 0, 0], null, 1);
      g.beginPath(); g.moveTo(-r * 1.05, -1.55 * E0 * KA); g.lineTo(r * 1.05, -1.55 * E0 * KA); g.save(); g.lineWidth = 7; g.stroke(); g.strokeStyle = '#d9a23a'; g.lineWidth = 3; g.stroke(); g.restore();
    },
  },
  banca: {
    altura: 2.5,
    pintar(g, l, p) {
      const x0 = -l / 2 + 0.1, x1 = l / 2 - 0.1, z0 = -p / 2 + 0.15, z1 = p / 2 - 0.15;
      prisma(g, x0, z0, x1, z1, 0, 0.85, '#d9a05a', '#c98a45', '#a96f33');
      // frutas no balcão
      for (let k = 0; k < 3; k++) { const xx = x0 + ((x1 - x0) * (k + 0.5)) / 3; elipse(g, X(xx, 0), Y(xx, 0.95, 0), 13, 10, ['#f4c532', '#e2452f', '#7cc23a'][k]); }
      for (const [xx, zz] of [[x0, z1], [x1, z1], [x1, z0]]) linha(g, [xx, 0.85, zz, xx, 2.0, zz], '#8a5626', 7);
      // toldo listrado
      const n = 6;
      for (let k = 0; k < n; k++) {
        const a = x0 - 0.1 + ((x1 - x0 + 0.2) * k) / n, b = x0 - 0.1 + ((x1 - x0 + 0.2) * (k + 1)) / n;
        poli(g, k % 2 ? '#f6f1e4' : '#e2452f', [a, 2.3, z0 - 0.1, b, 2.3, z0 - 0.1, b, 1.95, z1 + 0.2, a, 1.95, z1 + 0.2]);
      }
    },
  },
  placa: {
    altura: 1.5,
    pintar(g) {
      g.fillStyle = '#b06a2c'; g.beginPath(); g.rect(-5, -1.15 * E0 * KA, 10, 1.15 * E0 * KA); g.fill(); g.stroke();
      g.beginPath(); g.roundRect(-44, -1.5 * E0 * KA, 88, 44, 6); g.fillStyle = '#f6e3b5'; g.fill(); g.stroke();
      g.fillStyle = TRACO; g.font = '800 15px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('À VENDA', 0, -1.5 * E0 * KA + 23);
    },
  },
  mata: {
    altura: 3.3,
    pintar(g, l, p, v) {
      const k = 0.85 + (v % 4) * 0.08, tom = ['#3f9b3b', '#4aa63c', '#35893a', '#57ad3f'][v % 4], luz = ['#5cb64a', '#66c04a', '#4ba046', '#73c452'][v % 4];
      g.fillStyle = '#9a5a2b'; g.beginPath(); g.moveTo(-11, 0); g.lineTo(-8, -1.3 * E0 * k); g.lineTo(8, -1.3 * E0 * k); g.lineTo(12, 0); g.quadraticCurveTo(0, 7, -11, 0); g.closePath(); g.fill(); g.stroke();
      const r = 0.52 * E0 * k, y = -1.75 * E0 * k;
      bolas(g, [[-r * 0.85, y + r * 0.35, r * 0.8], [r * 0.85, y + r * 0.3, r * 0.82], [0, y - r * 0.5, r], [0, y + r * 0.5, r * 0.85]], tom, luz);
    },
  },
  mato: {
    altura: 0.9,
    pintar(g, l, p, v) {
      if (v % 2) {
        // capim alto
        for (let k = 0; k < 7; k++) folha(g, (k - 3) * 6, 0, (0.45 + ((k * 37) % 5) * 0.06) * E0, 7, -Math.PI / 2 + (k - 3) * 0.2, k % 2 ? '#5fa02c' : '#74b83a');
      } else {
        const r = 0.24 * E0;
        bolas(g, [[-r * 0.9, -r * 0.6, r * 0.8], [r * 0.9, -r * 0.6, r * 0.8], [0, -r * 1.1, r]], '#4f9c33', '#6cb845');
      }
    },
  },
  pedra: {
    altura: 0.8,
    pintar(g, l, p, v) {
      const s = (0.8 + (v % 3) * 0.15) * E0 * 0.5;
      g.beginPath(); g.moveTo(-s, 0); g.lineTo(-s * 0.75, -s * 0.75); g.lineTo(-s * 0.1, -s * 1.05); g.lineTo(s * 0.7, -s * 0.8); g.lineTo(s, -s * 0.1); g.lineTo(s * 0.6, s * 0.2); g.lineTo(-s * 0.6, s * 0.2); g.closePath();
      g.fillStyle = '#a9a8a2'; g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-s * 0.75, -s * 0.75); g.lineTo(-s * 0.1, -s * 1.05); g.lineTo(s * 0.7, -s * 0.8); g.lineTo(s * 0.1, -s * 0.45); g.closePath(); g.fillStyle = '#c9c8c0'; g.fill(); g.stroke();
    },
  },
  toco: {
    altura: 0.7,
    pintar(g) {
      const r = 0.27 * E0, h = 0.36 * E0;
      g.beginPath(); g.ellipse(0, 0, r, r * 0.55, 0, 0, Math.PI); g.lineTo(-r, -h); g.ellipse(0, -h, r, r * 0.55, 0, Math.PI, 0, true); g.closePath(); g.fillStyle = '#9a5a2b'; g.fill(); g.stroke();
      elipse(g, 0, -h, r, r * 0.55, '#e0b77c');
      g.save(); g.lineWidth = 2; g.strokeStyle = '#b58a52'; elipse(g, 0, -h, r * 0.55, r * 0.3, null); g.restore();
    },
  },
};

// ---------- culturas ----------
const COR_DE_FRUTO = { milho: '#f4c532', trigo: '#e3b94a', tomate: '#e2452f', cenoura: '#f08a24', alface: '#8fd04a', abobora: '#f08a24', feijao: '#7a4a2a', batata: '#d6b074', rabanete: '#e2457a', morango: '#e2452f', couve: '#5fae45', cebola: '#e8d7a8', beterraba: '#9a2f5a', mandioca: '#c9a36a', melancia: '#3f9b3b', cana: '#b9d86a', cafe: '#b3261e', algodao: '#f6f1e4', soja: '#c9c05a', pimentao: '#e2452f', repolho: '#a9d86a', girassol: '#f4c532' };
const PORTE = { milho: 'alto', trigo: 'espiga', cana: 'alto', girassol: 'alto', alface: 'moita', couve: 'moita', repolho: 'moita', cenoura: 'raiz', rabanete: 'raiz', beterraba: 'raiz', batata: 'raiz', mandioca: 'raiz', cebola: 'raiz', abobora: 'rasteira', melancia: 'rasteira', morango: 'rasteira' };
const PORTES = ['arbusto', 'alto', 'moita', 'raiz', 'rasteira', 'espiga'];
let DADOS = null;
export function prepararReserva(dados) { DADOS = dados; cache.clear(); }
export function corDoItem(id) {
  const it = DADOS && DADOS.itens[id];
  if (it && it.cor) return it.cor;
  const base = String(id).replace(/^semente-/, '');
  if (COR_DE_FRUTO[base]) return COR_DE_FRUTO[base];
  let h = 0; for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 70% 52%)`;
}
function porteDe(id) {
  const c = DADOS && DADOS.culturas[id];
  if (c && PORTES.includes(c.porte)) return c.porte;
  if (PORTE[id]) return PORTE[id];
  let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PORTES[h % 3 === 0 ? 0 : h % 3 === 1 ? 2 : 3];
}

// planta da cultura "id" no estágio e (1..n)
function pintarCultura(g, id, e, n) {
  const t = n > 1 ? (e - 1) / (n - 1) : 1, pronta = e >= n, cor = corDoItem(DADOS && DADOS.culturas[id] ? DADOS.culturas[id].produto : id), porte = porteDe(id);
  const verde = '#4f9c33', claro = '#74b83a', U = E0;
  if (e <= 1) {
    // semente recém-plantada: montinho de terra com um broto mínimo
    elipse(g, 0, 0, 0.2 * U, 0.1 * U, '#8a5228');
    folha(g, 0, -0.04 * U, 0.12 * U, 4, -Math.PI / 2 - 0.5, claro); folha(g, 0, -0.04 * U, 0.12 * U, 4, -Math.PI / 2 + 0.5, claro);
    return;
  }
  if (porte === 'alto' || porte === 'arbusto' || porte === 'espiga') {
    const h = (porte === 'alto' ? 0.3 + 1.05 * t : porte === 'espiga' ? 0.25 + 0.7 * t : 0.25 + 0.75 * t) * U;
    const pes = porte === 'espiga' ? [-0.2, 0, 0.2] : [0];
    for (const dx of pes) {
      const x = dx * U;
      g.save(); g.lineWidth = 7; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -h); g.stroke(); g.strokeStyle = verde; g.lineWidth = 3.5; g.stroke(); g.restore();
      const pares = Math.max(1, Math.round(1 + t * (porte === 'espiga' ? 1.5 : 3)));
      for (let k = 0; k < pares; k++) {
        const y = -h * (0.25 + (0.6 * k) / Math.max(1, pares - 1 || 1)), c = (0.2 + 0.2 * t) * U * (porte === 'espiga' ? 0.6 : 1);
        folha(g, x, y, c, 6 + 3 * t, -0.5, k % 2 ? verde : claro); folha(g, x, y, c, 6 + 3 * t, Math.PI + 0.5, k % 2 ? claro : verde);
      }
      if (porte === 'espiga' && t > 0.5) { g.fillStyle = pronta ? cor : claro; g.beginPath(); g.ellipse(x, -h - 8, 5, 12, 0, 0, 6.2832); g.fill(); g.stroke(); }
    }
    if (porte === 'alto' && t > 0.6) {
      for (const s of [-1, 1]) { g.save(); g.translate(s * 7, -h * (0.5 + s * 0.08)); g.rotate(s * 0.35); g.fillStyle = pronta ? cor : claro; g.beginPath(); g.ellipse(0, 0, 7, 15, 0, 0, 6.2832); g.fill(); g.stroke(); g.restore(); if (!pronta) break; }
    }
    if (porte === 'arbusto' && t > 0.6) {
      const frutos = pronta ? [[-0.16, -0.45], [0.17, -0.55], [-0.05, -0.75], [0.12, -0.3]] : [[-0.14, -0.45], [0.15, -0.55]];
      for (const [fx, fy] of frutos) elipse(g, fx * U, fy * h / 0.75 * 0.75, pronta ? 8 : 5, pronta ? 8 : 5, pronta ? cor : claro);
    }
    return;
  }
  if (porte === 'moita') {
    const r = (0.12 + 0.22 * t) * U;
    const cm = pronta ? cor : claro;
    for (let k = 0; k < 6; k++) folha(g, 0, -r * 0.3, r * 1.25, r * 0.5, -Math.PI / 2 + (k - 2.5) * 0.55, k % 2 ? verde : cm);
    if (t > 0.4) elipse(g, 0, -r * 0.65, r * 0.55, r * 0.5, pronta ? cor : claro);
    return;
  }
  if (porte === 'raiz') {
    const h = (0.18 + 0.4 * t) * U;
    if (pronta) { g.fillStyle = cor; g.beginPath(); g.ellipse(0, -2, 0.13 * U, 0.09 * U, 0, Math.PI, 0); g.lineTo(0.13 * U, -2); g.closePath(); g.fill(); g.stroke(); }
    for (let k = 0; k < 5; k++) folha(g, 0, -4, h, 5 + 3 * t, -Math.PI / 2 + (k - 2) * 0.38, k % 2 ? verde : claro);
    return;
  }
  // rasteira: folhas baixas e o fruto no chão
  const r = (0.14 + 0.2 * t) * U;
  for (let k = 0; k < 5; k++) folha(g, 0, -3, r * 1.3, r * 0.5, Math.PI + 0.25 + k * 0.62, k % 2 ? verde : claro);
  if (t > 0.5) { const fr = (pronta ? 0.2 : 0.11) * U; elipse(g, r * 0.35, -fr * 0.75, fr, fr * 0.85, pronta ? cor : claro); if (pronta) { g.save(); g.lineWidth = 2; g.beginPath(); g.moveTo(r * 0.35, -fr * 1.55); g.lineTo(r * 0.35, -fr * 0.1); g.stroke(); g.restore(); } }
}

// ---------- personagem (só aparece se não houver nenhuma arte dela) ----------
function pintarPersonagem(g, estado, costas, q) {
  const U = E0, passo = estado === 'andar' || estado === 'correr' ? Math.sin((q / 6) * 6.2832) : 0, baixa = estado !== 'parada' && estado !== 'andar' && estado !== 'correr';
  const hc = baixa ? 1.25 : 1.75; // altura do ombro
  for (const s of [-1, 1]) { g.fillStyle = '#2f62b8'; g.beginPath(); g.roundRect(s * 0.13 * U - 9 + s * passo * 6, -0.8 * U, 18, 0.7 * U - Math.max(0, s * passo) * 10, 6); g.fill(); g.stroke(); g.fillStyle = '#9a5a2b'; g.beginPath(); g.roundRect(s * 0.13 * U - 11 + s * passo * 6, -0.18 * U - Math.max(0, s * passo) * 10, 22, 0.18 * U, 5); g.fill(); g.stroke(); }
  g.fillStyle = '#f4c532'; g.beginPath(); g.roundRect(-0.3 * U, -hc * U * 0.82, 0.6 * U, 0.75 * U, 12); g.fill(); g.stroke();
  g.fillStyle = '#2f62b8'; g.beginPath(); g.roundRect(-0.22 * U, -hc * U * 0.82 + 0.25 * U, 0.44 * U, 0.5 * U, 8); g.fill(); g.stroke();
  const yc = -hc * U * 0.82 - 0.36 * U;
  elipse(g, costas ? 6 : -6, yc - 0.36 * U, 0.2 * U, 0.2 * U, '#5a3420');
  elipse(g, 0, yc, 0.42 * U, 0.4 * U, costas ? '#5a3420' : '#c98a5a');
  g.fillStyle = '#e2362f'; g.beginPath(); g.ellipse(0, yc - 0.12 * U, 0.43 * U, 0.3 * U, 0, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
  if (!costas) { g.fillStyle = TRACO; g.beginPath(); g.arc(-0.14 * U, yc + 0.05 * U, 4, 0, 6.2832); g.arc(0.12 * U, yc + 0.05 * U, 4, 0, 6.2832); g.fill(); }
}

// ---------- fábrica ----------
const cache = new Map();
function novaFigura(larg, cima, baixo, pintar) {
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(larg); cv.height = Math.ceil(cima + baixo);
  const g = cv.getContext('2d');
  g.translate(cv.width / 2, cima);
  g.lineWidth = LW; g.strokeStyle = TRACO; g.lineJoin = 'round'; g.lineCap = 'round';
  pintar(g);
  return { cv, ax: cv.width / 2, ay: cima, e: E0 };
}

// devolve a figura de reserva da peça "chave" (um canvas já pintado e o ponto de apoio dele)
//   quadro: quadro da animação (personagem)   l, p: tamanho da base (construções)   variante: 0..3 (natureza)
export function figuraDeReserva(chave, quadro = 0, l = 1, p = 1, variante = 0) {
  const k = chave + '|' + quadro + '|' + l + '|' + p + '|' + variante;
  let f = cache.get(k);
  if (f) return f;
  const [grupo, nome = ''] = chave.split('/');
  if (grupo === 'objeto' && OBJETOS[nome.split('-')[0]]) {
    const o = OBJETOS[nome.split('-')[0]], m = 0.6 * E0;
    f = novaFigura((l + p) * KX * E0 + 2 * m, o.altura * KA * E0 + ((l + p) / 2) * KY * E0 + m, ((l + p) / 2) * KY * E0 + m, (g) => o.pintar(g, l, p, variante));
  } else if (grupo === 'cultura') {
    const m = /^(.*)-(\d+)$/.exec(nome), id = m ? m[1] : nome, e = m ? +m[2] : 1, n = DADOS && DADOS.culturas[id] ? DADOS.culturas[id].estagios : 4;
    f = novaFigura(1.5 * E0, 1.7 * E0, 0.35 * E0, (g) => pintarCultura(g, id, e, n));
  } else if (grupo === 'personagem') {
    const m = /^(.*)-(frente|costas)$/.exec(nome) || [null, nome, 'frente'];
    f = novaFigura(1.6 * E0, 2.7 * E0, 0.3 * E0, (g) => pintarPersonagem(g, m[1], m[2] === 'costas', quadro));
  } else {
    // peça desconhecida: uma caixa com o nome, para ninguém deixar de ver que falta
    f = novaFigura(1.5 * E0, 1.2 * E0, 0.3 * E0, (g) => {
      g.beginPath(); g.roundRect(-0.45 * E0, -0.9 * E0, 0.9 * E0, 0.9 * E0, 10); g.fillStyle = '#f6e3b5'; g.fill(); g.stroke();
      g.fillStyle = TRACO; g.font = '700 12px system-ui, sans-serif'; g.textAlign = 'center'; g.fillText(nome.slice(0, 12), 0, -0.4 * E0);
    });
  }
  cache.set(k, f);
  return f;
}

export function desenharReserva(g, f, sx, sy, S, espelhar, escalaY = 1) {
  const k = S / E0, w = f.cv.width * k, h = f.cv.height * k * escalaY;
  if (espelhar) { g.save(); g.translate(sx, sy); g.scale(-1, 1); g.drawImage(f.cv, -f.ax * k, -f.ay * k * escalaY, w, h); g.restore(); } else g.drawImage(f.cv, sx - f.ax * k, sy - f.ay * k * escalaY, w, h);
}
// quantos quadros a reserva tem para a peça (a personagem andando tem 6)
export const quadrosDaReserva = (chave) => (/^personagem\/(andar|correr)/.test(chave) ? 6 : 1);
export { acaso };
