// Monta o atlas de texturas do conjunto "pintado" a partir das folhas pintadas pelo Codex (pasta fontes/).
// Uso (na pasta prototypes/sitio-minimo):  node src/arte/pintado/texturas/montar-atlas.mjs
// Saída:  src/arte/pintado/publico/pintado-atlas.png   (o build copia para dist/; o jogo só baixa quando o conjunto é usado)
//         src/arte/pintado/texturas/atlas-info.json    (onde fica cada textura e a cor média de cada uma)
// O atlas tem 1024 x 1024 pontos: 16 casas de 256. Cada casa guarda uma textura de 224 pontos com 16 de margem em volta.
// A margem repete a própria textura (ou a borda dela), para o filtro e os mipmaps não puxarem a cor da casa vizinha.
// Cada folha do Codex tem 4 texturas de 512 pontos (grade 2 x 2). As que repetem lado a lado ganham aqui a emenda:
// uma faixa da borda é fundida com a faixa do outro lado. As que são usadas peça por peça ficam como vieram.
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)('sharp');

const aqui = path.dirname(fileURLToPath(import.meta.url));
const FONTES = path.join(aqui, 'fontes'), SAIDA = path.join(aqui, '..', 'publico', 'pintado-atlas.png');
const ATLAS = 1024, CASA = 256, MARGEM = 16, MIOLO = CASA - 2 * MARGEM, POR_LADO = ATLAS / CASA;
const CHEIO = process.env.MODO === 'cheio';
const RECUO = 6; // pontos cortados de cada lado do quadrado da folha (a divisa entre as texturas nem sempre é exata)

// nome, folha, coluna e linha na folha, eixos em que a textura repete ('xy', 'x' ou ''), e de qual outra ela deriva.
// "alvo" é a cor média que a textura tem de ter no jogo. As folhas vieram pintadas já com a luz quente da imagem-alvo
// (madeira e terra muito alaranjadas); no jogo a luz entra de novo por cima, então aqui a cor de cada textura é levada
// para a cor "sem luz" medida na imagem-alvo. Modo "gama" (padrão): uma curva por canal, que mantém o preto e o branco
// e leva a média para o alvo. Modo "ganho": multiplica (para as texturas quase brancas, que no jogo são tingidas).
// "contraste" menor que 1 aproxima a pintura da sua média (a grama, que no chão inteiro ficava riscada demais).
// "cores": quantas das 255 cores da paleta do PNG ficam para esta textura (ver o fim deste arquivo).
const TEXTURAS = [
  { nome: 'madeira', cores: 22, folha: 1, c: 0, l: 0, repete: '', alvo: '#de7a2e' },
  { nome: 'telha', cores: 22, folha: 1, c: 1, l: 0, repete: '', alvo: '#e2502a' },
  { nome: 'pedra', cores: 18, folha: 1, c: 0, l: 1, repete: '', alvo: '#cfa884' },
  { nome: 'palha', cores: 18, folha: 1, c: 1, l: 1, repete: 'xy', alvo: '#eca824' },
  { nome: 'grama', cores: 26, folha: 2, c: 0, l: 0, repete: 'xy', alvo: '#97b820', contraste: 0.8 },
  { nome: 'areia', cores: 22, folha: 2, c: 1, l: 0, repete: 'xy', alvo: '#fbae5c' },
  { nome: 'arada', cores: 20, folha: 2, c: 0, l: 1, repete: 'xy', alvo: '#a85428' },
  { nome: 'folhagem', cores: 26, folha: 2, c: 1, l: 1, repete: 'xy', alvo: '#6f9c22' },
  { nome: 'barranco', cores: 30, folha: 3, c: 0, l: 0, repete: 'x', alvo: '#9c552c', medirDe: 0.3 }, // a média é medida só na terra (abaixo da franja de grama)
  { nome: 'casca', cores: 16, folha: 3, c: 1, l: 0, repete: 'x', alvo: '#b85c26' },
  { nome: 'liso', cores: 12, folha: 3, c: 0, l: 1, repete: 'xy', alvo: '#f6f2ec', modo: 'ganho' },
  { nome: 'penugem', cores: 14, folha: 3, c: 1, l: 1, repete: 'xy', alvo: '#f4f0ea', modo: 'ganho' },
  // tábuas sem cor (só o claro-escuro da madeira), para tingir no jogo: portas verdes, travessas creme
  { nome: 'tabua', cores: 8, de: 'madeira', repete: '' },
  { nome: 'branco', cores: 1, liso: [255, 255, 255], repete: 'xy' },
];

// lê um quadrado da folha como RGB cru
async function quadrado(folha, c, l) {
  const arq = path.join(FONTES, `folha-${folha}.png`), m = await sharp(arq).metadata(), q = Math.round(m.width / 2), lado = q - 2 * RECUO;
  const { data } = await sharp(arq).extract({ left: c * q + RECUO, top: l * q + RECUO, width: lado, height: lado }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { px: data, w: lado, h: lado };
}
// emenda: as primeiras B colunas viram uma mistura delas com as B colunas que ficam logo depois do fim da imagem nova
function emendar(img, eixo, parte = 0.14) {
  const { px, w, h } = img, B = Math.round((eixo === 'x' ? w : h) * parte), W = eixo === 'x' ? w - B : w, H = eixo === 'y' ? h - B : h, out = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = eixo === 'x' ? x : y, o = (y * W + x) * 3, a = (y * w + x) * 3;
    if (t >= B) { out[o] = px[a]; out[o + 1] = px[a + 1]; out[o + 2] = px[a + 2]; continue; }
    let k = (t + 0.5) / B; k = k * k * (3 - 2 * k);
    const b = eixo === 'x' ? (y * w + x + W) * 3 : ((y + H) * w + x) * 3;
    for (let i = 0; i < 3; i++) out[o + i] = Math.round(px[a + i] * k + px[b + i] * (1 - k));
  }
  return { px: out, w: W, h: H };
}
const reduzir = async (img) => ({ px: await sharp(img.px, { raw: { width: img.w, height: img.h, channels: 3 } }).resize(MIOLO, MIOLO, { fit: 'fill', kernel: 'lanczos3' }).raw().toBuffer(), w: MIOLO, h: MIOLO });
// só o claro-escuro, com o tom claro mais comum levado para perto do branco
function semCor(img) {
  const n = img.w * img.h, lum = new Float32Array(n);
  for (let i = 0; i < n; i++) lum[i] = 0.299 * img.px[i * 3] + 0.587 * img.px[i * 3 + 1] + 0.114 * img.px[i * 3 + 2];
  const ord = Float32Array.from(lum).sort(), claro = ord[Math.floor(n * 0.8)], out = Buffer.alloc(n * 3);
  for (let i = 0; i < n; i++) { const v = Math.max(0, Math.min(255, Math.round((lum[i] / claro) * 236))); out[i * 3] = out[i * 3 + 1] = out[i * 3 + 2] = v; }
  return { px: out, w: img.w, h: img.h };
}

// leva a cor média da textura para o alvo (ver TEXTURAS)
function acertarCor(img, t) {
  const n = img.w * img.h, alvo = [1, 3, 5].map((i) => parseInt(t.alvo.slice(i, i + 2), 16) / 255), de = Math.floor((t.medirDe || 0) * img.h) * img.w, out = Buffer.alloc(n * 3);
  for (let k = 0; k < 3; k++) {
    const media = (f) => { let s = 0; for (let i = de; i < n; i++) s += f(img.px[i * 3 + k] / 255); return s / (n - de); };
    let f;
    if (t.modo === 'ganho') { const g = alvo[k] / media((v) => v); f = (v) => Math.min(1, v * g); }
    else {
      let a = 0.2, b = 5; // a média de v^g cai quando g cresce: busca o g por bisseção
      for (let i = 0; i < 40; i++) { const g = (a + b) / 2; if (media((v) => Math.pow(v, g)) > alvo[k]) a = g; else b = g; }
      const g = (a + b) / 2; f = (v) => Math.pow(v, g);
    }
    const c = t.contraste === undefined ? 1 : t.contraste;
    for (let i = 0; i < n; i++) out[i * 3 + k] = Math.max(0, Math.min(255, Math.round((alvo[k] + (f(img.px[i * 3 + k] / 255) - alvo[k]) * c) * 255)));
  }
  return { px: out, w: img.w, h: img.h };
}

// Reduz uma imagem RGB a n cores: as cores são escolhidas por agrupamento (k-médias, a partir de tons espalhados do escuro
// ao claro) e cada ponto vai para a cor mais próxima, com o erro espalhado pelos vizinhos (pontilhado de Floyd-Steinberg).
// Devolve o índice da cor de cada ponto e a lista das cores.
function reduzirCores(px, w, h, n) {
  const N = w * h, lum = (i) => 0.299 * px[i * 3] + 0.587 * px[i * 3 + 1] + 0.114 * px[i * 3 + 2];
  if (n <= 1) return { indices: new Uint8Array(N), cores: [[px[0], px[1], px[2]]] };
  const ordem = Array.from({ length: Math.ceil(N / 3) }, (_, i) => i * 3).sort((a, b) => lum(a) - lum(b));
  let cores = Array.from({ length: n }, (_, k) => { const i = ordem[Math.floor(((k + 0.5) / n) * ordem.length)]; return [px[i * 3], px[i * 3 + 1], px[i * 3 + 2]]; });
  const perto = (r, g, b) => { let m = Infinity, q = 0; for (let k = 0; k < n; k++) { const c = cores[k], d = (r - c[0]) ** 2 * 0.9 + (g - c[1]) ** 2 * 1.2 + (b - c[2]) ** 2 * 0.7; if (d < m) { m = d; q = k; } } return q; };
  for (let volta = 0; volta < 14; volta++) {
    const soma = cores.map(() => [0, 0, 0, 0]);
    for (const i of ordem) { const s = soma[perto(px[i * 3], px[i * 3 + 1], px[i * 3 + 2])]; s[0] += px[i * 3]; s[1] += px[i * 3 + 1]; s[2] += px[i * 3 + 2]; s[3]++; }
    cores = cores.map((c, k) => (soma[k][3] ? [soma[k][0] / soma[k][3], soma[k][1] / soma[k][3], soma[k][2] / soma[k][3]] : c));
  }
  cores = cores.map((c) => c.map((v) => Math.max(0, Math.min(255, Math.round(v)))));
  const erro = new Float32Array(N * 3), indices = new Uint8Array(N), FORCA = 0.85;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, v = [0, 1, 2].map((k) => px[i * 3 + k] + erro[i * 3 + k]), q = perto(v[0], v[1], v[2]);
    indices[i] = q;
    for (let k = 0; k < 3; k++) {
      const e = Math.max(-40, Math.min(40, v[k] - cores[q][k])) * FORCA;
      if (x + 1 < w) erro[(i + 1) * 3 + k] += (e * 7) / 16;
      if (y + 1 < h) { if (x > 0) erro[(i + w - 1) * 3 + k] += (e * 3) / 16; erro[(i + w) * 3 + k] += (e * 5) / 16; if (x + 1 < w) erro[(i + w + 1) * 3 + k] += e / 16; }
    }
  }
  return { indices, cores };
}
// Grava um PNG de paleta (um byte por ponto): o sharp não deixa escolher a paleta, então o arquivo é montado aqui.
const TABELA_CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc(buf) { let c = 0xffffffff; for (const b of buf) c = TABELA_CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function pngDePaleta(w, h, indices, paleta) {
  const pedaco = (tipo, dados) => { const b = Buffer.alloc(12 + dados.length); b.writeUInt32BE(dados.length, 0); b.write(tipo, 4, 'latin1'); dados.copy(b, 8); b.writeUInt32BE(crc(b.subarray(4, 8 + dados.length)), 8 + dados.length); return b; };
  const cab = Buffer.alloc(13); cab.writeUInt32BE(w, 0); cab.writeUInt32BE(h, 4); cab[8] = 8; cab[9] = 3;
  const linhas = Buffer.alloc((w + 1) * h); for (let y = 0; y < h; y++) Buffer.from(indices.buffer, indices.byteOffset + y * w, w).copy(linhas, y * (w + 1) + 1);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), pedaco('IHDR', cab), pedaco('PLTE', Buffer.from(paleta.flat())), pedaco('IDAT', zlib.deflateSync(linhas, { level: 9, memLevel: 9 })), pedaco('IEND', Buffer.alloc(0))]);
}

const prontas = {}, info = { tamanho: ATLAS, casa: CASA, margem: MARGEM, texturas: {} };
const atlas = Buffer.alloc(ATLAS * ATLAS * 3, 255); // cor inteira (MODO=cheio)
const paleta = [[255, 255, 255]], indices = new Uint8Array(ATLAS * ATLAS); // de paleta: a cor 0 é o branco das casas vazias
let casa = 0;
for (const t of TEXTURAS) {
  let img;
  if (t.liso) img = { px: Buffer.alloc(MIOLO * MIOLO * 3, 0).map((_, i) => t.liso[i % 3]), w: MIOLO, h: MIOLO };
  else if (t.de) img = semCor(prontas[t.de]);
  else {
    img = await quadrado(t.folha, t.c, t.l);
    if (t.repete.includes('x')) img = emendar(img, 'x');
    if (t.repete.includes('y')) img = emendar(img, 'y');
    img = await reduzir(img);
  }
  prontas[t.nome] = img; // a "tabua" deriva da madeira como foi pintada, antes de acertar a cor
  if (t.alvo) img = acertarCor(img, t);
  // a casa inteira (miolo e margem), já reduzida às cores que cabem a esta textura
  const cc = casa % POR_LADO, cl = Math.floor(casa / POR_LADO), soma = [0, 0, 0], cel = Buffer.alloc(CASA * CASA * 3);
  const pega = (v, repete) => (repete ? ((v % MIOLO) + MIOLO) % MIOLO : Math.max(0, Math.min(MIOLO - 1, v)));
  for (let y = 0; y < CASA; y++) for (let x = 0; x < CASA; x++) {
    const sx = pega(x - MARGEM, t.repete.includes('x')), sy = pega(y - MARGEM, t.repete.includes('y')), a = (sy * MIOLO + sx) * 3, o = (y * CASA + x) * 3;
    cel[o] = img.px[a]; cel[o + 1] = img.px[a + 1]; cel[o + 2] = img.px[a + 2];
  }
  if (CHEIO) for (let y = 0; y < CASA; y++) cel.copy(atlas, ((cl * CASA + y) * ATLAS + cc * CASA) * 3, y * CASA * 3, (y + 1) * CASA * 3);
  else {
    const r = reduzirCores(cel, CASA, CASA, t.cores), base = paleta.length;
    paleta.push(...r.cores);
    for (let y = 0; y < CASA; y++) for (let x = 0; x < CASA; x++) indices[(cl * CASA + y) * ATLAS + cc * CASA + x] = base + r.indices[y * CASA + x];
  }
  for (let i = 0; i < MIOLO * MIOLO; i++) for (let k = 0; k < 3; k++) soma[k] += img.px[i * 3 + k];
  info.texturas[t.nome] = { c: cc, l: cl, cor: '#' + soma.map((s) => Math.round(s / (MIOLO * MIOLO)).toString(16).padStart(2, '0')).join('') };
  casa++;
}
fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
// PNG de paleta (a hospedagem só aceita .png, e de cor inteira o atlas pesa quatro vezes mais). Uma paleta só, tirada da
// imagem inteira, deixava as texturas claras e lisas (pelo, pele, areia) com meia dúzia de tons e manchas à vista; por
// isso cada textura é reduzida sozinha ao seu punhado de cores ("cores" em TEXTURAS; 255 ao todo), e a paleta junta todas.
// MODO=cheio grava o PNG de cor inteira, para comparar.
if (CHEIO) await sharp(atlas, { raw: { width: ATLAS, height: ATLAS, channels: 3 } }).png({ compressionLevel: 9 }).toFile(SAIDA);
else {
  if (paleta.length > 256) throw new Error(`a paleta tem ${paleta.length} cores: o máximo é 256`);
  fs.writeFileSync(SAIDA, pngDePaleta(ATLAS, ATLAS, indices, paleta));
}
fs.writeFileSync(path.join(aqui, 'atlas-info.json'), JSON.stringify(info, null, 1) + '\n');
console.log(`${path.relative(process.cwd(), SAIDA)}: ${ATLAS} x ${ATLAS}, ${(fs.statSync(SAIDA).size / 1024).toFixed(0)} KB, ${casa} texturas${CHEIO ? '' : `, ${paleta.length} cores`}`);
