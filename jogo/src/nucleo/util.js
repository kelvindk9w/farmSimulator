// Utilidades da lógica. Nada em src/nucleo conhece DOM, canvas, Date.now() ou Math.random().

export const PASSO = 1 / 60; // a simulação anda sempre em passos fixos de 1/60 s
export const PASSO_MS = 1000 / 60;
export const TAU = Math.PI * 2;

export const limitar = (v, a, b) => (v < a ? a : v > b ? b : v);
// curva suave 0..1 (entra e sai devagar)
export const suave = (t) => { t = limitar(t, 0, 1); return t * t * (3 - 2 * t); };

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

// Sorteio com semente (mulberry32). O estado é um inteiro, então entra na gravação.
export class Sorteio {
  constructor(semente) { this.a = semente >>> 0; }
  prox() {
    this.a = (this.a + 0x6d2b79f5) | 0;
    let t = Math.imul(this.a ^ (this.a >>> 15), 1 | this.a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  entre(lo, hi) { return lo + (hi - lo) * this.prox(); }
  inteiro(lo, hi) { return lo + Math.floor((hi - lo + 1) * this.prox()); }
}

// número fixo em 0..1 para uma casa (x, z) e um sal: serve para espalhar detalhe sem guardar nada
export function acaso(x, z, sal = 0) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(z | 0, 668265263) ^ Math.imul(sal | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// resumo curto (FNV-1a) de um texto: usado para comparar estados e para nomear arquivos
export function resumo(texto) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// soma n ao campo k de um objeto de contagem ({ milho: 3 }); apaga o campo quando zera
export function somar(obj, k, n) {
  const v = (obj[k] || 0) + n;
  if (v > 0) obj[k] = v; else delete obj[k];
  return v > 0 ? v : 0;
}
export function total(obj) { let s = 0; for (const k in obj) s += obj[k]; return s; }
