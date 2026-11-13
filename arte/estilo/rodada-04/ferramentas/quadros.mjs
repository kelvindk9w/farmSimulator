// Separa os quadros de uma folha de animação com fundo transparente e alinha todos numa casa de mesmo tamanho
// (pés na mesma linha de base, cabeça no mesmo eixo). Uso: node quadros.mjs <folha.png> <pasta de saída> [altura da casa]
import { createRequire } from 'node:module';
import fs from 'node:fs';
const sharp = createRequire('/home/user/farmSimulator/prototypes/sitio-minimo/package.json')('sharp');
const [folha, saida, alturaCasa = '512'] = process.argv.slice(2);
fs.mkdirSync(saida, { recursive: true });
const { data, info } = await sharp(folha).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, A = (x, y) => data[(y * W + x) * 4 + 3];
// colunas com tinta -> faixas separadas por vãos transparentes de pelo menos 12 colunas
const col = new Array(W).fill(0);
for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) if (A(x, y) > 24) { col[x] = 1; break; }
const faixas = []; let ini = -1, vazio = 0;
for (let x = 0; x <= W; x++) {
  if (x < W && col[x]) { if (ini < 0) ini = x; vazio = 0; }
  else if (ini >= 0) { vazio++; if (vazio >= 12 || x === W) { faixas.push([ini, x - vazio + 1]); ini = -1; vazio = 0; } }
}
const quadros = [];
for (const [x0, x1] of faixas) {
  if (x1 - x0 < 20) continue;
  let y0 = H, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = x0; x < x1; x++) if (A(x, y) > 24) { if (y < y0) y0 = y; if (y > y1) y1 = y; break; }
  // eixo da cabeça: centro de massa do quarto de cima
  let sx = 0, n = 0; const yc = y0 + Math.round((y1 - y0) * 0.28);
  for (let y = y0; y < yc; y++) for (let x = x0; x < x1; x++) if (A(x, y) > 24) { sx += x; n++; }
  quadros.push({ x0, x1, y0, y1: y1 + 1, eixo: sx / n });
}
const alt = Math.max(...quadros.map((q) => q.y1 - q.y0));
const meia = Math.max(...quadros.map((q) => Math.max(q.eixo - q.x0, q.x1 - q.eixo)));
const esc = (+alturaCasa - 16) / alt, LW = Math.ceil(meia * 2 * esc) + 16, LH = +alturaCasa;
console.log(`${quadros.length} quadros; alturas ${quadros.map((q) => q.y1 - q.y0).join(', ')} px; casa ${LW} x ${LH}`);
const nomes = [];
for (let i = 0; i < quadros.length; i++) {
  const q = quadros[i], w = q.x1 - q.x0, h = q.y1 - q.y0;
  const peca = await sharp(folha).extract({ left: q.x0, top: q.y0, width: w, height: h }).resize(Math.round(w * esc), Math.round(h * esc)).png().toBuffer();
  const left = Math.round(LW / 2 - (q.eixo - q.x0) * esc), top = LH - 8 - Math.round(h * esc);
  const nome = `${saida}/quadro-${i + 1}.png`;
  await sharp({ create: { width: LW, height: LH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: peca, left: Math.max(0, left), top }]).png().toFile(nome);
  nomes.push(nome);
}
fs.writeFileSync(`${saida}/quadros.json`, JSON.stringify({ largura: LW, altura: LH, quadros: nomes.length }));
