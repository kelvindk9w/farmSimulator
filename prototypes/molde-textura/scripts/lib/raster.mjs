// Pintura de texturas por código, sem navegador: tudo é conta com números, então a saída é sempre a mesma.
// Convenção: u cresce para a direita e v cresce PARA CIMA (v = 0 é a base da imagem), igual ao UV dos moldes.
import sharp from 'sharp';

export const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const vezes = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
export const limitar = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const degrau = (a, b, x) => { const t = limitar((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const mod = (a, n) => ((a % n) + n) % n;

// Número pseudoaleatório em [0, 1) a partir de inteiros (sempre o mesmo para a mesma entrada).
export function sorte(ix, iy = 0, semente = 0) {
  let h = Math.imul(ix | 0, 0x27d4eb2d) ^ Math.imul(iy | 0, 0x165667b1) ^ Math.imul(semente | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Gerador sequencial com semente (para espalhar folhinhas, pedrinhas etc.).
export function sequencia(semente) {
  let n = 0;
  return () => sorte(n++, 7919, semente);
}

// Ruído suave que se repete a cada (px, py) unidades: é o que deixa a emenda invisível.
export function ruido(x, y, px, py, semente = 0) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = sorte(mod(x0, px), mod(y0, py), semente), b = sorte(mod(x0 + 1, px), mod(y0, py), semente);
  const c = sorte(mod(x0, px), mod(y0 + 1, py), semente), d = sorte(mod(x0 + 1, px), mod(y0 + 1, py), semente);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

// Soma de oitavas de ruído (cada uma com o dobro da frequência); devolve um valor em [0, 1].
export function fbm(u, v, fx, fy, oitavas = 4, semente = 0) {
  let soma = 0, peso = 1, total = 0;
  for (let o = 0; o < oitavas; o++) {
    soma += peso * ruido(u * fx, v * fy, fx, fy, semente + o * 101);
    total += peso; peso *= 0.5; fx *= 2; fy *= 2;
  }
  return soma / total;
}

// Tela de pintura com superamostragem. `repete` faz os carimbos darem a volta nas bordas.
export class Tela {
  constructor(largura, altura, { ss = 3, repete = true } = {}) {
    this.w = largura; this.h = altura; this.ss = ss; this.repete = repete;
    this.W = largura * ss; this.H = altura * ss;
    this.d = new Float32Array(this.W * this.H * 4);
  }

  // fn(u, v) devolve [r, g, b] ou [r, g, b, a], tudo de 0 a 1.
  preencher(fn) {
    const { W, H, d } = this;
    for (let j = 0; j < H; j++) {
      const v = 1 - (j + 0.5) / H;
      for (let i = 0; i < W; i++) {
        const c = fn((i + 0.5) / W, v);
        const k = (j * W + i) * 4;
        d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = c.length > 3 ? c[3] : 1;
      }
    }
    return this;
  }

  _pintar(i, j, cor, alfa) {
    const { W, H, d } = this;
    if (this.repete) { i = mod(i, W); j = mod(j, H); } else if (i < 0 || j < 0 || i >= W || j >= H) return;
    const k = (j * W + i) * 4;
    d[k] += (cor[0] - d[k]) * alfa; d[k + 1] += (cor[1] - d[k + 1]) * alfa; d[k + 2] += (cor[2] - d[k + 2]) * alfa;
  }

  // Carimbos em pixels da imagem final, com a origem embaixo à esquerda (y para cima).
  disco(cx, cy, raio, cor, alfa = 1) { return this.elipse(cx, cy, raio, raio, cor, alfa); }

  elipse(cx, cy, rx, ry, cor, alfa = 1) {
    const s = this.ss, X = cx * s, Y = this.H - cy * s, RX = rx * s, RY = ry * s;
    for (let j = Math.floor(Y - RY); j <= Math.ceil(Y + RY); j++) {
      for (let i = Math.floor(X - RX); i <= Math.ceil(X + RX); i++) {
        const dx = (i + 0.5 - X) / RX, dy = (j + 0.5 - Y) / RY;
        if (dx * dx + dy * dy <= 1) this._pintar(i, j, cor, alfa);
      }
    }
    return this;
  }

  // Traço reto com largura que pode afinar da ponta 0 para a ponta 1.
  traco(x0, y0, x1, y1, largura0, largura1, cor, alfa = 1) {
    const comp = Math.hypot(x1 - x0, y1 - y0), passos = Math.max(1, Math.ceil(comp * this.ss * 1.5));
    for (let p = 0; p <= passos; p++) {
      const t = p / passos;
      this.disco(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, Math.max(0.2, (largura0 + (largura1 - largura0) * t) / 2), cor, alfa);
    }
    return this;
  }

  // Reduz a superamostragem e devolve os bytes (RGB ou RGBA) da imagem final.
  bytes({ alfa = false } = {}) {
    const { w, h, ss, W, d } = this;
    const canais = alfa ? 4 : 3;
    const out = new Uint8Array(w * h * canais);
    const cor = new Float32Array(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let j = 0; j < ss; j++) for (let i = 0; i < ss; i++) {
        const k = ((y * ss + j) * W + x * ss + i) * 4, al = alfa ? d[k + 3] : 1;
        r += d[k] * al; g += d[k + 1] * al; b += d[k + 2] * al; a += al;
      }
      const o = (y * w + x) * 4;
      if (a > 0) { cor[o] = r / a; cor[o + 1] = g / a; cor[o + 2] = b / a; }
      cor[o + 3] = a / (ss * ss);
    }
    if (alfa) sangrar(cor, w, h);
    const byte = (x) => Math.round(limitar(x) * 255);
    for (let p = 0; p < w * h; p++) {
      out[p * canais] = byte(cor[p * 4]); out[p * canais + 1] = byte(cor[p * 4 + 1]); out[p * canais + 2] = byte(cor[p * 4 + 2]);
      if (alfa) out[p * canais + 3] = byte(cor[p * 4 + 3]);
    }
    return { dados: out, largura: w, altura: h, canais };
  }

  async png(arquivo, opts) { return gravarPNG(arquivo, this.bytes(opts)); }
}

// Estende a cor da borda para dentro da área transparente. Sem isto, o filtro da placa de vídeo mistura
// a cor "escondida" dos pixels transparentes e aparece um contorno escuro em volta da porta e da janela.
function sangrar(cor, w, h) {
  let vazio = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) vazio[p] = cor[p * 4 + 3] === 0 ? 1 : 0;
  for (let passo = 0; passo < 24; passo++) {
    const prox = vazio.slice();
    let mudou = false;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (!vazio[p]) continue;
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const q = yy * w + xx;
        if (!vazio[q]) { r += cor[q * 4]; g += cor[q * 4 + 1]; b += cor[q * 4 + 2]; n++; }
      }
      if (n) { cor[p * 4] = r / n; cor[p * 4 + 1] = g / n; cor[p * 4 + 2] = b / n; prox[p] = 0; mudou = true; }
    }
    vazio = prox;
    if (!mudou) break;
  }
  let r = 0, g = 0, b = 0, n = 0;
  for (let p = 0; p < w * h; p++) if (!vazio[p]) { r += cor[p * 4]; g += cor[p * 4 + 1]; b += cor[p * 4 + 2]; n++; }
  for (let p = 0; p < w * h; p++) if (vazio[p]) { cor[p * 4] = r / n; cor[p * 4 + 1] = g / n; cor[p * 4 + 2] = b / n; }
}

// Grava o PNG sem metadados e com opções fixas de compressão (mesmos bytes a cada execução).
export async function gravarPNG(arquivo, { dados, largura, altura, canais }) {
  await sharp(Buffer.from(dados.buffer, dados.byteOffset, dados.byteLength), { raw: { width: largura, height: altura, channels: canais } })
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
    .toFile(arquivo);
}

// Algarismos 5x7 para a textura de teste de UV.
const ALGARISMOS = {
  0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110',
  2: '01110 10001 00001 00010 00100 01000 11111', 3: '11111 00010 00100 00010 00001 10001 01110',
  4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110', 9: '01110 10001 10001 01111 00001 00010 01100',
};
// Diz se o ponto (x, y), medido do canto de cima à esquerda do texto e em "pontos" da fonte, cai sobre tinta.
export function tintaDoNumero(texto, x, y) {
  const i = Math.floor(x / 6), cx = Math.floor(x - i * 6), cy = Math.floor(y);
  if (i < 0 || i >= texto.length || cx < 0 || cx > 4 || cy < 0 || cy > 6) return false;
  return ALGARISMOS[texto[i]].split(' ')[cy][cx] === '1';
}
