// Monta o atlas da personagem 2D a partir das folhas que o Codex desenhou (arte/estilo/rodada-04/codex/).
// Uso (na pasta do protótipo): node src/arte/figuras/texturas/montar-atlas.mjs
// Saída: src/arte/figuras/publico/figuras-personagem-<resumo>.png (o que o jogo baixa) e src/arte/figuras/atlas.json (onde está cada quadro).
// Cada quadro vai para uma casa de mesmo tamanho, com os pés na mesma linha e o corpo no mesmo eixo, e todas as folhas
// são postas na mesma escala (a altura da personagem em pé).
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)('sharp');
const aqui = path.dirname(fileURLToPath(import.meta.url));
const FONTES = path.join(aqui, '../../../../../../arte/estilo/rodada-04/codex');
const CASA = [256, 341], COLUNAS = 8, LINHAS = 3; // atlas de 2048 x 1023
const EM_PE = 317; // altura da personagem em pé, em pontos do atlas
const BASE = 12; // margem embaixo dos pés
const CHAO = 0.035; // o ponto de apoio no chão fica um pouco acima do ponto mais baixo da bota (a câmera olha de cima)

// separa os quadros de uma folha pelos vãos transparentes e mede cada um
async function quadrosDe(arq) {
  const { data, info } = await sharp(arq).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, A = (x, y) => data[(y * W + x) * 4 + 3];
  const col = new Array(W).fill(0);
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) if (A(x, y) > 24) { col[x] = 1; break; }
  const faixas = []; let ini = -1, vazio = 0;
  for (let x = 0; x <= W; x++) {
    if (x < W && col[x]) { if (ini < 0) ini = x; vazio = 0; } else if (ini >= 0) { vazio++; if (vazio >= 12 || x === W) { faixas.push([ini, x - vazio + 1]); ini = -1; vazio = 0; } }
  }
  const out = [];
  for (const [x0, x1] of faixas) {
    if (x1 - x0 < 20) continue;
    let y0 = H, y1 = 0;
    for (let y = 0; y < H; y++) for (let x = x0; x < x1; x++) if (A(x, y) > 24) { if (y < y0) y0 = y; if (y > y1) y1 = y; break; }
    y1++;
    const centro = (ya, yb) => { let s = 0, n = 0; for (let y = ya; y < yb; y++) for (let x = x0; x < x1; x++) if (A(x, y) > 24) { s += x; n++; } return n ? s / n : (x0 + x1) / 2; };
    out.push({ arq, x0, x1, y0, y1, h: y1 - y0, cabeca: centro(y0, y0 + Math.round((y1 - y0) * 0.28)), pes: centro(y1 - Math.round((y1 - y0) * 0.06), y1) });
  }
  return out;
}

// recorta um quadro e apaga os ciscos: ilhas de tinta soltas, muito menores que a figura, que às vezes vêm na imagem gerada
async function semCiscos(f) {
  const { data, info } = await sharp(f.arq).extract({ left: f.x0, top: f.y0, width: f.x1 - f.x0, height: f.h }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, ilha = new Int32Array(W * H), area = [0];
  for (let i = 0; i < W * H; i++) {
    if (ilha[i] || data[i * 4 + 3] <= 24) continue;
    const id = area.length, pilha = [i]; ilha[i] = id; let n = 0;
    while (pilha.length) {
      const p = pilha.pop(), x = p % W, y = (p - x) / W; n++;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const q = yy * W + xx; if (!ilha[q] && data[q * 4 + 3] > 24) { ilha[q] = id; pilha.push(q); }
      }
    }
    area.push(n);
  }
  const maior = Math.max(...area);
  for (let i = 0; i < W * H; i++) if (!ilha[i] ? data[i * 4 + 3] <= 24 && false : area[ilha[i]] < maior * 0.01) data[i * 4 + 3] = 0;
  // o halo quase transparente em volta de um cisco apagado também sai: fica só o que encosta numa ilha que ficou
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (ilha[i] || data[i * 4 + 3] === 0) continue;
    let perto = false;
    for (let dy = -3; dy <= 3 && !perto; dy++) for (let dx = -3; dx <= 3; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) { const q = yy * W + xx; if (ilha[q] && area[ilha[q]] >= maior * 0.01) { perto = true; break; } } }
    if (!perto) data[i * 4 + 3] = 0;
  }
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

const folha = (n) => path.join(FONTES, n);
const grupos = {}; // nome -> [{ quadro, esc, eixo }]
// andando: o eixo é o da cabeça (os braços e as pernas balançam, a cabeça não)
for (const [nome, arq] of [['andarFrente', 'andando-frente.png'], ['andarCostas', 'andando-costas.png']]) {
  const q = await quadrosDe(folha(arq)); if (q.length !== 6) throw new Error(`${arq}: esperava 6 quadros, achei ${q.length}`);
  const esc = EM_PE / Math.max(...q.map((f) => f.h));
  grupos[nome] = q.map((f) => ({ quadro: f, esc, eixo: f.cabeca }));
}
for (const [nome, arq] of [['paradaFrente', 'personagem-frente.png'], ['paradaCostas', 'parada-costas.png']]) {
  const q = await quadrosDe(folha(arq)); if (q.length !== 1) throw new Error(`${arq}: esperava 1 figura, achei ${q.length}`);
  grupos[nome] = [{ quadro: q[0], esc: EM_PE / q[0].h, eixo: q[0].cabeca }];
}
{ // trabalhando: o primeiro quadro é ela em pé e só dá a escala; nos outros o eixo é o dos pés do primeiro quadro agachado,
  // e os seguintes acompanham a cabeça (as mãos descem até o chão e enganariam a conta dos pés)
  const q = await quadrosDe(folha('trabalhando-frente.png')); if (q.length !== 5) throw new Error(`trabalhando-frente.png: esperava 5 quadros, achei ${q.length}`);
  const esc = EM_PE / q[0].h, ag = q.slice(1), d = ag[0].pes - ag[0].cabeca;
  grupos.trabalhar = ag.map((f) => ({ quadro: f, esc, eixo: f.cabeca + d * 0.6 }));
}

const casas = {}, pecas = []; let k = 0;
for (const [nome, lista] of Object.entries(grupos)) {
  casas[nome] = [];
  for (const { quadro: f, esc, eixo } of lista) {
    const cx = (k % COLUNAS) * CASA[0], cy = Math.floor(k / COLUNAS) * CASA[1];
    const w = Math.round((f.x1 - f.x0) * esc), h = Math.round(f.h * esc);
    const left = Math.round(cx + CASA[0] / 2 - (eixo - f.x0) * esc), top = cy + CASA[1] - BASE - h;
    if (left < cx + 2 || left + w > cx + CASA[0] - 2 || top < cy + 2) throw new Error(`${nome}: o quadro ${casas[nome].length + 1} não cabe na casa (${w} x ${h}, esquerda ${left - cx}, topo ${top - cy})`);
    pecas.push({ input: await sharp(await semCiscos(f)).resize(w, h).png().toBuffer(), left, top });
    casas[nome].push(k); k++;
  }
}
if (k > COLUNAS * LINHAS) throw new Error('quadros demais para o atlas');
const L = COLUNAS * CASA[0], A = LINHAS * CASA[1];
// O nome do arquivo leva um pedaço do resumo do conteúdo: quando o desenho muda, o nome muda, e nenhum navegador
// mostra a figura antiga que tinha guardado.
const png = await sharp({ create: { width: L, height: A, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(pecas).png({ compressionLevel: 9, palette: true, quality: 95, effort: 10 }).toBuffer();
const arquivo = `figuras-personagem-${crypto.createHash('sha256').update(png).digest('hex').slice(0, 8)}.png`;
const publico = path.join(aqui, '../publico'), saida = path.join(publico, arquivo);
fs.mkdirSync(publico, { recursive: true });
for (const f of fs.readdirSync(publico)) if (/^figuras-personagem.*\.png$/.test(f)) fs.rmSync(path.join(publico, f));
fs.writeFileSync(saida, png);
const info = { arquivo, largura: L, altura: A, casa: CASA, colunas: COLUNAS, emPe: EM_PE, apoio: [CASA[0] / 2, BASE + Math.round(EM_PE * CHAO)], quadros: casas };
fs.writeFileSync(path.join(aqui, '../atlas.json'), JSON.stringify(info, null, 2) + '\n');
console.log(`atlas ${L} x ${A}, ${k} quadros, ${(fs.statSync(saida).size / 1024).toFixed(1)} KB`, JSON.stringify(casas));
