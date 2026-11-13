// Ícones e retratos de reserva, desenhados por código numa caixa de 100 por 100 (a interface escala para o tamanho
// que quiser). Quando a peça "icone/...", "ui/..." ou "retrato/..." existir no catálogo, a interface usa a peça.
import { TRACO, corDoItem } from './reserva.js';

const T = TRACO;
function comeco(g) { g.lineWidth = 5; g.strokeStyle = T; g.lineJoin = 'round'; g.lineCap = 'round'; }
function forma(g, cor, f) { g.beginPath(); f(); if (cor) { g.fillStyle = cor; g.fill(); } g.stroke(); }
const circ = (g, x, y, r, cor) => forma(g, cor, () => g.arc(x, y, r, 0, 6.2832));
const ret = (g, x, y, w, h, r, cor) => forma(g, cor, () => g.roundRect(x, y, w, h, r));

function enxada(g) {
  g.save(); g.translate(50, 50); g.rotate(-0.75);
  ret(g, -5, -40, 10, 82, 4, '#c98a45');
  forma(g, '#b9bcc4', () => { g.moveTo(-4, -42); g.lineTo(30, -42); g.lineTo(30, -22); g.lineTo(8, -26); g.lineTo(-4, -30); g.closePath(); });
  g.restore();
}
function regador(g, cor = '#5aa7e0') {
  forma(g, cor, () => { g.moveTo(26, 40); g.lineTo(66, 40); g.lineTo(70, 84); g.lineTo(22, 84); g.closePath(); });
  forma(g, cor, () => { g.moveTo(66, 52); g.lineTo(90, 30); g.lineTo(96, 36); g.lineTo(69, 66); g.closePath(); });
  forma(g, '#d9ecfa', () => g.ellipse(46, 40, 20, 6, 0, 0, 6.2832));
  forma(g, null, () => { g.moveTo(26, 48); g.quadraticCurveTo(4, 50, 14, 72); g.lineTo(23, 74); });
  for (const [x, y] of [[88, 46], [94, 54], [84, 56]]) { g.fillStyle = '#3f9ad6'; g.beginPath(); g.arc(x, y + 6, 3, 0, 6.2832); g.fill(); }
}
function cesto(g) {
  forma(g, null, () => { g.moveTo(22, 46); g.quadraticCurveTo(50, -4, 78, 46); });
  forma(g, '#d9a05a', () => { g.moveTo(12, 44); g.lineTo(88, 44); g.lineTo(78, 86); g.lineTo(22, 86); g.closePath(); });
  g.save(); g.lineWidth = 3; g.strokeStyle = '#8a5626';
  g.beginPath(); g.moveTo(16, 58); g.lineTo(84, 58); g.moveTo(19, 72); g.lineTo(81, 72);
  for (let x = 28; x <= 72; x += 11) { g.moveTo(x, 46); g.lineTo(x + (x - 50) * -0.12, 84); }
  g.stroke(); g.restore();
}
function gota(g, x = 50, y = 54, s = 1, cor = '#3f9ad6') {
  forma(g, cor, () => { g.moveTo(x, y - 40 * s); g.bezierCurveTo(x + 34 * s, y - 2 * s, x + 26 * s, y + 32 * s, x, y + 32 * s); g.bezierCurveTo(x - 26 * s, y + 32 * s, x - 34 * s, y - 2 * s, x, y - 40 * s); });
  g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(x - 9 * s, y + 8 * s, 5 * s, 9 * s, 0.5, 0, 6.2832); g.fill();
}
function fruto(g, id) {
  const cor = corDoItem(id), b = id.replace(/^semente-/, '');
  if (b === 'milho') {
    forma(g, '#74b83a', () => { g.moveTo(50, 92); g.quadraticCurveTo(14, 70, 26, 34); g.quadraticCurveTo(44, 60, 50, 92); });
    forma(g, '#74b83a', () => { g.moveTo(50, 92); g.quadraticCurveTo(86, 70, 74, 34); g.quadraticCurveTo(56, 60, 50, 92); });
    forma(g, cor, () => g.ellipse(50, 46, 17, 38, 0, 0, 6.2832));
    g.save(); g.lineWidth = 2; g.strokeStyle = '#c99a1c'; g.beginPath(); for (let y = 20; y < 76; y += 10) { g.moveTo(36, y); g.lineTo(64, y); } g.moveTo(50, 10); g.lineTo(50, 80); g.stroke(); g.restore();
  } else if (b === 'cenoura' || b === 'rabanete' || b === 'beterraba' || b === 'mandioca') {
    for (const a of [-0.5, 0, 0.5]) forma(g, '#74b83a', () => { g.save(); g.translate(50, 36); g.rotate(a); g.ellipse(0, -16, 7, 18, 0, 0, 6.2832); g.restore(); });
    forma(g, cor, () => { g.moveTo(30, 36); g.quadraticCurveTo(50, 26, 70, 36); g.quadraticCurveTo(64, 74, 50, 94); g.quadraticCurveTo(36, 74, 30, 36); });
  } else if (b === 'trigo') {
    for (const [x, a] of [[38, -0.25], [50, 0], [62, 0.25]]) { g.save(); g.translate(x, 60); g.rotate(a); forma(g, null, () => { g.moveTo(0, 34); g.lineTo(0, -10); }); forma(g, cor, () => g.ellipse(0, -26, 8, 20, 0, 0, 6.2832)); g.restore(); }
  } else if (b === 'alface' || b === 'couve' || b === 'repolho') {
    circ(g, 50, 56, 36, '#5fae45'); circ(g, 50, 56, 22, cor);
    forma(g, null, () => { g.moveTo(50, 34); g.quadraticCurveTo(60, 56, 50, 78); });
  } else {
    circ(g, 50, 58, 32, cor);
    forma(g, '#74b83a', () => { g.moveTo(50, 28); g.quadraticCurveTo(70, 6, 84, 22); g.quadraticCurveTo(66, 34, 50, 28); });
    forma(g, null, () => { g.moveTo(50, 30); g.lineTo(48, 16); });
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(38, 48, 7, 11, 0.6, 0, 6.2832); g.fill();
  }
}
function saquinho(g, id) {
  forma(g, '#f6e3b5', () => { g.moveTo(22, 26); g.lineTo(78, 26); g.lineTo(84, 90); g.lineTo(16, 90); g.closePath(); });
  forma(g, '#e0c48a', () => { g.moveTo(18, 12); g.lineTo(82, 12); g.lineTo(78, 28); g.lineTo(22, 28); g.closePath(); });
  g.save(); g.translate(50, 60); g.scale(0.42, 0.42); g.translate(-50, -54); g.lineWidth = 9; fruto(g, id); g.restore();
}

const UI = {
  mao(g) {
    for (const [x, y, h] of [[30, 30, 34], [43, 20, 44], [56, 22, 42], [69, 30, 34]]) ret(g, x - 6, y, 12, h, 6, '#f1c089');
    forma(g, '#f1c089', () => { g.moveTo(24, 56); g.lineTo(76, 56); g.quadraticCurveTo(78, 90, 50, 90); g.quadraticCurveTo(28, 90, 24, 70); g.closePath(); });
    forma(g, '#f1c089', () => { g.moveTo(26, 70); g.quadraticCurveTo(6, 62, 12, 46); g.quadraticCurveTo(22, 46, 30, 60); });
  },
  enxada,
  semear(g) {
    forma(g, '#b0703c', () => g.ellipse(50, 80, 38, 13, 0, 0, 6.2832));
    forma(g, null, () => { g.moveTo(50, 78); g.lineTo(50, 40); });
    forma(g, '#74b83a', () => { g.moveTo(50, 46); g.quadraticCurveTo(22, 44, 18, 18); g.quadraticCurveTo(46, 18, 50, 46); });
    forma(g, '#4f9c33', () => { g.moveTo(50, 52); g.quadraticCurveTo(78, 50, 84, 26); g.quadraticCurveTo(56, 26, 50, 52); });
  },
  regar: (g) => regador(g),
  loja(g) {
    ret(g, 16, 46, 68, 44, 4, '#f6e3b5');
    ret(g, 42, 60, 18, 30, 2, '#c98a45');
    for (let k = 0; k < 4; k++) forma(g, k % 2 ? '#f6f1e4' : '#e2452f', () => { const x = 10 + k * 20; g.moveTo(x, 20); g.lineTo(x + 20, 20); g.lineTo(x + 20, 44); g.quadraticCurveTo(x + 10, 54, x, 44); g.closePath(); });
  },
  mochila: cesto,
  missoes(g) {
    ret(g, 20, 16, 60, 74, 6, '#f6e3b5');
    ret(g, 36, 8, 28, 16, 5, '#c98a45');
    g.save(); g.lineWidth = 6; g.strokeStyle = '#3f9b3b'; g.beginPath(); g.moveTo(32, 54); g.lineTo(45, 68); g.lineTo(68, 40); g.stroke(); g.restore();
  },
  config(g) {
    g.save(); g.translate(50, 50);
    forma(g, '#b9bcc4', () => { for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.2832; g.save(); g.rotate(a); g.rect(-8, -42, 16, 20); g.restore(); } });
    circ(g, 0, 0, 30, '#b9bcc4'); circ(g, 0, 0, 12, '#fff9ec');
    g.restore();
  },
  'tela-cheia'(g) {
    g.save(); g.lineWidth = 9;
    g.beginPath(); for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const x = 50 + sx * 30, y = 50 + sy * 30; g.moveTo(x - sx * 20, y); g.lineTo(x, y); g.lineTo(x, y - sy * 20); } g.stroke();
    g.restore();
  },
  fechar(g) { g.save(); g.lineWidth = 12; g.beginPath(); g.moveTo(26, 26); g.lineTo(74, 74); g.moveTo(74, 26); g.lineTo(26, 74); g.stroke(); g.restore(); },
  seta(g) { forma(g, '#f6c12c', () => { g.moveTo(50, 92); g.lineTo(16, 50); g.lineTo(38, 50); g.lineTo(38, 10); g.lineTo(62, 10); g.lineTo(62, 50); g.lineTo(84, 50); g.closePath(); }); },
  cadeado(g) { forma(g, null, () => { g.moveTo(32, 48); g.lineTo(32, 34); g.quadraticCurveTo(50, 6, 68, 34); g.lineTo(68, 48); }); ret(g, 22, 46, 56, 42, 8, '#c9c2b4'); circ(g, 50, 66, 6, T); },
  som(g) { forma(g, '#f6e3b5', () => { g.moveTo(14, 38); g.lineTo(34, 38); g.lineTo(56, 18); g.lineTo(56, 82); g.lineTo(34, 62); g.lineTo(14, 62); g.closePath(); }); forma(g, null, () => g.arc(58, 50, 16, -0.9, 0.9)); forma(g, null, () => g.arc(58, 50, 30, -0.9, 0.9)); },
};
const ICONE = {
  ouro(g) { circ(g, 50, 50, 38, '#f6c12c'); g.save(); g.lineWidth = 3; g.strokeStyle = '#c9901c'; g.beginPath(); g.arc(50, 50, 27, 0, 6.2832); g.stroke(); g.restore(); g.fillStyle = '#c9901c'; g.font = '900 40px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 50, 53); },
  cash(g) { forma(g, '#4fd08a', () => { g.moveTo(50, 8); g.lineTo(88, 40); g.lineTo(50, 92); g.lineTo(12, 40); g.closePath(); }); forma(g, '#8ae8b6', () => { g.moveTo(50, 8); g.lineTo(68, 40); g.lineTo(32, 40); g.closePath(); }); forma(g, null, () => { g.moveTo(12, 40); g.lineTo(88, 40); g.moveTo(32, 40); g.lineTo(50, 92); g.lineTo(68, 40); }); },
  xp(g) { forma(g, '#f6c12c', () => { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 19 : 42; g[k ? 'lineTo' : 'moveTo'](50 + Math.cos(a) * r, 52 + Math.sin(a) * r); } g.closePath(); }); },
  folego(g) { forma(g, '#ff7b5a', () => { g.moveTo(50, 88); g.bezierCurveTo(-10, 46, 26, 2, 50, 30); g.bezierCurveTo(74, 2, 110, 46, 50, 88); }); },
  gota: (g) => gota(g),
  cesto, regador: (g) => regador(g), enxada,
};

function retratoVizinho(g) {
  // Seu Tonho: chapéu de palha, bigode branco e camisa xadrez
  forma(g, '#d2553a', () => { g.moveTo(14, 100); g.quadraticCurveTo(18, 74, 50, 72); g.quadraticCurveTo(82, 74, 86, 100); g.closePath(); });
  circ(g, 50, 52, 27, '#d99a6c');
  forma(g, '#e9c46a', () => g.ellipse(50, 34, 46, 12, 0, 0, 6.2832));
  forma(g, '#f2d58a', () => { g.moveTo(26, 34); g.quadraticCurveTo(28, 4, 50, 4); g.quadraticCurveTo(72, 4, 74, 34); g.closePath(); });
  forma(g, '#c0392b', () => { g.moveTo(27, 26); g.lineTo(73, 26); g.lineTo(74, 34); g.lineTo(26, 34); g.closePath(); });
  g.fillStyle = T; g.beginPath(); g.arc(40, 52, 3.5, 0, 6.2832); g.arc(60, 52, 3.5, 0, 6.2832); g.fill();
  forma(g, '#f6f1e4', () => { g.moveTo(50, 60); g.quadraticCurveTo(34, 58, 30, 70); g.quadraticCurveTo(44, 72, 50, 66); g.quadraticCurveTo(56, 72, 70, 70); g.quadraticCurveTo(66, 58, 50, 60); });
  forma(g, '#c98a5a', () => g.ellipse(50, 58, 5, 4, 0, 0, 6.2832));
}

function retratoDela(g, alegre) {
  // ela: lenço vermelho com o coque castanho atrás, camisa amarela e o macacão azul (enquanto o retrato não chega)
  circ(g, 64, 20, 15, '#6b3f2a');
  forma(g, '#f2c531', () => { g.moveTo(14, 100); g.quadraticCurveTo(18, 74, 50, 72); g.quadraticCurveTo(82, 74, 86, 100); g.closePath(); });
  forma(g, '#2f6fd6', () => { g.moveTo(32, 100); g.lineTo(34, 84); g.lineTo(66, 84); g.lineTo(68, 100); g.closePath(); });
  circ(g, 50, 50, 26, '#d99a6c');
  forma(g, '#6b3f2a', () => { g.moveTo(26, 48); g.quadraticCurveTo(28, 32, 50, 32); g.quadraticCurveTo(72, 32, 74, 48); g.quadraticCurveTo(60, 40, 50, 42); g.quadraticCurveTo(38, 40, 26, 48); });
  forma(g, '#e8392f', () => { g.moveTo(24, 40); g.quadraticCurveTo(26, 16, 50, 16); g.quadraticCurveTo(74, 16, 76, 40); g.quadraticCurveTo(50, 30, 24, 40); });
  forma(g, '#e8392f', () => { g.moveTo(74, 34); g.lineTo(90, 28); g.lineTo(84, 42); g.closePath(); });
  g.fillStyle = T; g.beginPath();
  if (alegre) { g.lineWidth = 3; g.strokeStyle = T; g.arc(40, 54, 4, Math.PI, 0); g.moveTo(56, 54); g.arc(60, 54, 4, Math.PI, 0); g.stroke(); }
  else { g.arc(40, 52, 3.5, 0, 6.2832); g.arc(60, 52, 3.5, 0, 6.2832); g.fill(); }
  g.beginPath(); g.lineWidth = 3; g.strokeStyle = T; g.arc(50, 60, alegre ? 9 : 7, 0.2, Math.PI - 0.2); g.stroke();
}

// pinta o ícone de reserva de "chave" numa caixa de t por t pontos, com a origem em (0, 0)
export function pintarIconeDeReserva(g, chave, t, dados) {
  const [grupo, nome = ''] = chave.split('/');
  g.save(); g.scale(t / 100, t / 100); comeco(g);
  if (grupo === 'ui' && UI[nome]) UI[nome](g);
  else if (grupo === 'retrato' && nome.startsWith('personagem')) retratoDela(g, nome.endsWith('-alegre'));
  else if (grupo === 'retrato') retratoVizinho(g);
  else if (grupo === 'icone' && ICONE[nome]) ICONE[nome](g);
  else if (grupo === 'icone') {
    const it = dados && dados.itens[nome];
    if (it && it.tipo === 'semente') saquinho(g, nome);
    else if (it && it.tipo === 'ferramenta') (it.funcao === 'regador' ? regador(g, it.capacidade > 6 ? '#e0a03a' : '#5aa7e0') : it.funcao === 'enxada' ? enxada(g) : UI.config(g));
    else if (it && it.tipo === 'recipiente') cesto(g);
    else fruto(g, nome);
  } else { ret(g, 14, 14, 72, 72, 12, '#f6e3b5'); g.fillStyle = T; g.font = '700 16px system-ui, sans-serif'; g.textAlign = 'center'; g.fillText(nome.slice(0, 7), 50, 56); }
  g.restore();
}
