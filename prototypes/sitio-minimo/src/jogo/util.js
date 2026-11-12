// Utilidades da lógica do jogo. Nada aqui (nem em nenhum arquivo de src/jogo) conhece three.js ou desenho.

export const PASSO = 1 / 60; // a simulação anda sempre em passos fixos de 1/60 s
export const TAU = Math.PI * 2;

export const limitar = (v, a, b) => Math.max(a, Math.min(b, v));
// curva suave 0..1 (entra e sai devagar)
export const suave = (t) => { t = limitar(t, 0, 1); return t * t * (3 - 2 * t); };
// 0 fora de [a,b]; sobe suave em "sobe" segundos e desce suave em "desce" segundos
export const janela = (t, a, b, sobe = 0.15, desce = 0.15) => suave((t - a) / sobe) * (1 - suave((t - (b - desce)) / desce));

// menor diferença de ângulo (para - de) em (-PI, PI]
export function difAngulo(de, para) {
  let d = (para - de) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d <= -Math.PI) d += TAU;
  return d;
}
// gira "atual" em direção a "alvo" no máximo "max" radianos
export function girarPara(atual, alvo, max) {
  const d = difAngulo(atual, alvo);
  return Math.abs(d) <= max ? alvo : atual + Math.sign(d) * max;
}
// rumo (radianos) de quem está em (x0,z0) olhando para (x1,z1). Rumo 0 = +Z; PI/2 = +X.
export const rumoPara = (x0, z0, x1, z1) => Math.atan2(x1 - x0, z1 - z0);

// ponto local (x, z) de um objeto em (ox, oz) girado de "giro" -> mundo
export function localParaMundo(ox, oz, giro, lx, lz) {
  const s = Math.sin(giro), c = Math.cos(giro);
  return [ox + lx * c + lz * s, oz - lx * s + lz * c];
}

// Sorteio com semente (mulberry32). O estado é um inteiro, então entra no retrato da simulação.
export class Sorteio {
  constructor(semente) { this.a = semente >>> 0; }
  prox() {
    this.a = (this.a + 0x6d2b79f5) | 0;
    let t = Math.imul(this.a ^ (this.a >>> 15), 1 | this.a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  entre(lo, hi) { return lo + (hi - lo) * this.prox(); }
}

// resumo curto (FNV-1a) de um texto: usado para comparar retratos da simulação
export function resumo(texto) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
