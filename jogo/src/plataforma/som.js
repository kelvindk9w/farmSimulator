// Sons do jogo, feitos na hora com WebAudio: nenhum arquivo de áudio.
//
// Cada som de SONS é uma função (c, saida, t) que agenda os nós de áudio a partir do instante t
// no contexto c. Assim o mesmo código toca no jogo e é conferido fora dele (tools/conferir-som.mjs).
//
// Uso no jogo:
//   som.destravar()            dentro do primeiro toque, clique ou tecla (o navegador exige)
//   som.ouvir(mundo.eventos)   liga os eventos do jogo aos sons
//   som.tocar('toque')         sons da interface
//   som.ligar(false)           opção das configurações
// Nada aqui lança erro: sem áudio, o jogo segue mudo.

const NADA = 0.0001;

// uma nota: oscilador com ataque curto e queda suave; "ate" desliza a altura
function nota(c, saida, t, freq, dur, o = {}) {
  const { tipo = 'sine', vol = 0.2, ataque = 0.005, ate = 0, atraso = 0 } = o;
  const t0 = t + atraso;
  const osc = c.createOscillator(), g = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t0);
  if (ate) osc.frequency.exponentialRampToValueAtTime(ate, t0 + dur);
  g.gain.setValueAtTime(NADA, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + ataque);
  g.gain.exponentialRampToValueAtTime(NADA, t0 + dur);
  osc.connect(g);
  g.connect(saida);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// um segundo de chiado, igual toda vez (sorteio com semente), guardado por contexto
const ruidos = new WeakMap();
function ruidoDe(c) {
  let b = ruidos.get(c);
  if (b) return b;
  b = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const d = b.getChannelData(0);
  let s = 12345;
  for (let i = 0; i < d.length; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    d[i] = (s / 0x3fffffff) - 1;
  }
  ruidos.set(c, b);
  return b;
}

// um sopro de chiado filtrado: terra, água, folha, madeira
function chiado(c, saida, t, dur, o = {}) {
  const { vol = 0.2, tipo = 'lowpass', freq = 800, ate = 0, q = 0.7, ataque = 0.005, atraso = 0, de = 0 } = o;
  const t0 = t + atraso;
  const fonte = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  fonte.buffer = ruidoDe(c);
  fonte.loop = true;
  f.type = tipo;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t0);
  if (ate) f.frequency.exponentialRampToValueAtTime(ate, t0 + dur);
  g.gain.setValueAtTime(NADA, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + ataque);
  g.gain.exponentialRampToValueAtTime(NADA, t0 + dur);
  fonte.connect(f);
  f.connect(g);
  g.connect(saida);
  fonte.start(t0, de);
  fonte.stop(t0 + dur + 0.02);
}

// notas da escala usadas nas melodias curtas
const DO5 = 523.25, MI5 = 659.25, SOL5 = 783.99, SI5 = 987.77, DO6 = 1046.5, RE6 = 1174.66, MI6 = 1318.51, SOL6 = 1567.98, DO7 = 2093;

export const SONS = {
  // interface
  toque(c, s, t) { nota(c, s, t, 720, 0.06, { tipo: 'triangle', vol: 0.14, ate: 960 }); },
  abrir(c, s, t) {
    nota(c, s, t, 392, 0.09, { tipo: 'triangle', vol: 0.13 });
    nota(c, s, t, 587, 0.13, { tipo: 'triangle', vol: 0.13, atraso: 0.06 });
  },
  fechar(c, s, t) {
    nota(c, s, t, 587, 0.08, { tipo: 'triangle', vol: 0.12 });
    nota(c, s, t, 392, 0.12, { tipo: 'triangle', vol: 0.12, atraso: 0.06 });
  },
  erro(c, s, t) {
    nota(c, s, t, 196, 0.12, { tipo: 'triangle', vol: 0.2 });
    nota(c, s, t, 147, 0.2, { tipo: 'triangle', vol: 0.2, atraso: 0.1 });
  },

  // lavoura
  enxada(c, s, t) {
    nota(c, s, t, 120, 0.13, { vol: 0.34, ate: 58 });
    chiado(c, s, t, 0.15, { vol: 0.3, freq: 520, ate: 160 });
    chiado(c, s, t, 0.05, { vol: 0.08, tipo: 'bandpass', freq: 1800, q: 2 });
  },
  semente(c, s, t) {
    chiado(c, s, t, 0.04, { vol: 0.12, tipo: 'highpass', freq: 3000 });
    nota(c, s, t, 520, 0.08, { vol: 0.14, ate: 330, atraso: 0.02 });
  },
  agua(c, s, t) {
    chiado(c, s, t, 0.5, { vol: 0.5, tipo: 'bandpass', freq: 1500, ate: 700, q: 1.2, ataque: 0.05 });
    for (let i = 0; i < 4; i++) nota(c, s, t, 900 + i * 130, 0.05, { vol: 0.08, ate: 1400 + i * 110, atraso: 0.06 + i * 0.09 });
  },
  encher(c, s, t) {
    chiado(c, s, t, 0.75, { vol: 0.2, freq: 900, ate: 1500, ataque: 0.08 });
    for (let i = 0; i < 6; i++) nota(c, s, t, 300 + i * 70, 0.08, { vol: 0.11, ate: 520 + i * 90, atraso: 0.05 + i * 0.1 });
  },
  colher(c, s, t) {
    nota(c, s, t, 380, 0.1, { vol: 0.22, ate: 820 });
    chiado(c, s, t, 0.06, { vol: 0.07, tipo: 'highpass', freq: 2500 });
  },
  guardar(c, s, t) {
    nota(c, s, t, 180, 0.11, { vol: 0.24, ate: 105 });
    chiado(c, s, t, 0.07, { vol: 0.1, freq: 600 });
  },
  cortar(c, s, t) {
    chiado(c, s, t, 0.05, { vol: 0.26, tipo: 'bandpass', freq: 1100, q: 2.5 });
    nota(c, s, t, 240, 0.07, { tipo: 'triangle', vol: 0.2, ate: 150 });
  },
  martelo(c, s, t) {
    for (let i = 0; i < 3; i++) {
      chiado(c, s, t, 0.045, { vol: 0.26, tipo: 'bandpass', freq: 950, q: 3, atraso: i * 0.17 });
      nota(c, s, t, 230, 0.06, { tipo: 'triangle', vol: 0.16, ate: 160, atraso: i * 0.17 });
    }
  },
  cansou(c, s, t) { chiado(c, s, t, 0.4, { vol: 0.36, freq: 750, ate: 300, ataque: 0.1 }); },

  // dinheiro e avisos
  moeda(c, s, t) {
    nota(c, s, t, SI5, 0.07, { tipo: 'triangle', vol: 0.16 });
    nota(c, s, t, MI6, 0.26, { tipo: 'triangle', vol: 0.16, atraso: 0.07 });
    nota(c, s, t, MI6 * 2, 0.2, { vol: 0.04, atraso: 0.07 });
  },
  compra(c, s, t) {
    chiado(c, s, t, 0.03, { vol: 0.08, tipo: 'highpass', freq: 4000 });
    nota(c, s, t, MI5, 0.08, { tipo: 'triangle', vol: 0.15 });
    nota(c, s, t, 880, 0.18, { tipo: 'triangle', vol: 0.15, atraso: 0.08 });
  },
  pronto(c, s, t) {
    nota(c, s, t, 880, 0.12, { vol: 0.13 });
    nota(c, s, t, RE6, 0.24, { vol: 0.13, atraso: 0.1 });
  },

  // conquistas
  missao(c, s, t) {
    nota(c, s, t, SOL5, 0.14, { tipo: 'triangle', vol: 0.16 });
    nota(c, s, t, SI5, 0.14, { tipo: 'triangle', vol: 0.16, atraso: 0.1 });
    nota(c, s, t, RE6, 0.4, { tipo: 'triangle', vol: 0.16, atraso: 0.2 });
    nota(c, s, t, RE6 * 2, 0.3, { vol: 0.04, atraso: 0.2 });
  },
  recompensa(c, s, t) {
    const brilho = [MI6, SOL6, DO7, SOL6, DO7 * 1.26];
    for (let i = 0; i < brilho.length; i++) nota(c, s, t, brilho[i], 0.16, { vol: 0.09, atraso: i * 0.06 });
    nota(c, s, t, DO6, 0.45, { tipo: 'triangle', vol: 0.12, atraso: 0.05 });
  },
  nivel(c, s, t) {
    const sobe = [DO5, MI5, SOL5, DO6];
    for (let i = 0; i < sobe.length; i++) nota(c, s, t, sobe[i], 0.16, { tipo: 'triangle', vol: 0.17, atraso: i * 0.09 });
    for (const f of [DO5, MI5, SOL5, DO6]) nota(c, s, t, f, 0.7, { vol: 0.07, atraso: 0.38, ataque: 0.02 });
    nota(c, s, t, DO7, 0.3, { vol: 0.05, atraso: 0.42 });
    nota(c, s, t, DO7 * 1.26, 0.35, { vol: 0.05, atraso: 0.5 });
    chiado(c, s, t, 0.5, { vol: 0.03, tipo: 'highpass', freq: 6000, atraso: 0.38, ataque: 0.02 });
  },
};

// evento do jogo → som. Evento que o jogo não emite simplesmente nunca toca.
export const POR_EVENTO = {
  arou: 'enxada',
  plantou: 'semente',
  regou: 'agua',
  encheu: 'encher',
  colheu: 'colher',
  recolheu: 'colher',
  tratou: 'guardar',
  vendeuAnimal: 'moeda',
  guardou: 'guardar',
  retirou: 'guardar',
  limpou: 'cortar',
  construiu: 'martelo',
  montou: 'martelo',
  vendeu: 'moeda',
  comprou: 'compra',
  produziu: 'pronto',
  cansou: 'cansou',
  faltou: 'erro',
  missaoConcluida: 'missao',
  conquista: 'recompensa',
  recompensa: 'recompensa',
  subiuDeNivel: 'nivel',
  // indústrias e pedidos
  enfileirou: 'guardar',
  receitaPronta: 'pronto',
  cancelouReceita: 'fechar',
  entregou: 'moeda',
};

// intervalo mínimo entre duas vezes do mesmo som, em segundos (o resto usa PADRAO)
const PADRAO = 0.06;
const ESPERA = { erro: 0.5, cansou: 2, moeda: 0.12, agua: 0.2, nivel: 1, missao: 0.6, recompensa: 0.4 };

let ctx = null, mestre = null, ligado = true;
const ultimo = new Map();

function criar() {
  if (ctx) return ctx;
  try {
    const C = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    mestre = ctx.createGain();
    mestre.gain.value = 0.8;
    const limite = ctx.createDynamicsCompressor();
    mestre.connect(limite);
    limite.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

export const som = {
  get ligado() { return ligado; },
  ligar(v) { ligado = !!v; },

  // o navegador só deixa o áudio começar dentro de um gesto do jogador
  destravar() {
    try {
      const c = criar();
      if (c && c.state === 'suspended') c.resume().catch(() => {});
    } catch { /* sem áudio */ }
  },

  tocar(nome) {
    try {
      const f = SONS[nome];
      if (!f || !ligado || !ctx || ctx.state !== 'running') return false;
      const agora = ctx.currentTime;
      if (agora - (ultimo.get(nome) ?? -10) < (ESPERA[nome] ?? PADRAO)) return false;
      ultimo.set(nome, agora);
      f(ctx, mestre, agora + 0.005);
      return true;
    } catch {
      return false;
    }
  },

  ouvir(eventos) {
    for (const [evento, nome] of Object.entries(POR_EVENTO)) {
      try { eventos.ouvir(evento, () => { this.tocar(nome); }); } catch { /* barramento sem esse evento */ }
    }
  },
};
