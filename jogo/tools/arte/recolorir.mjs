#!/usr/bin/env node
// Faz uma figura nova trocando as cores de uma folha de animação já pronta (mesmo desenho, outra pelagem).
// Serve para os bichos especiais, que "fazem o mesmo, muda a figura": a casa, o apoio e os quadros ficam iguais.
//
//   node jogo/tools/arte/recolorir.mjs --de animal/cavalo/andar-frente --para animal/cavalo-mangalarga/andar-frente --receita mangalarga
//   ... --listar     só mostra as regiões do primeiro quadro (área, cor do meio, classe), para acertar a receita
//   ... --ensaio <arquivo.png>   grava só a imagem nesse arquivo, sem mexer no jogo nem no catálogo
//   ... --verboso    lista, quadro a quadro, as regiões de cor parecida com o pelo que ficaram de fora
//
// Como funciona: o traço escuro divide a figura em regiões de cor chapada. Cada região é classificada pela cor
// do meio (mediana dos pontos coloridos, sem contar os brancos); nas regiões de uma classe da receita, cada ponto
// é levado pela sua claridade: do traço até a cor de origem vira do traço até a cor nova, e da cor de origem até
// o branco vira da cor nova até o branco. Assim a sombra, o serrilhado da borda e a passagem para as manchas
// brancas acompanham a cor nova. O que não é da classe (sela, botas, pele, roupa) não muda.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const sharp = createRequire(path.join(AQUI, '../../package.json'))('sharp');
const ARTE = path.join(AQUI, '../../arte');

const BRANCO = [252, 242, 232], TRACO = [25, 10, 3];
// Cada classe: de (cor de origem), raio (distância máxima da mediana da região à cor de origem), para (cor nova),
// claro (o branco daquela parte; por padrão o branco comum). A primeira classe que serve fica com a região.
// "brancoMin": a região só entra se tiver ao menos essa parte de pontos brancos (separa a perna com meia do couro).
// "so"/"nao" limitam a classe por vizinhança: {perto: [r,g,b], raio, dist} vale (ou não vale) se a região encosta numa cor dessas.
const RECEITAS = {
  // Cavalo mangalarga: pelagem baia (dourada) no lugar da alazã; crina, rabo, meias brancas e arreios iguais.
  mangalarga: { classes: [
    { nome: 'pelo', de: [194, 86, 36], raio: 16, para: [232, 182, 104] },
    { nome: 'pelo-na-sombra', de: [127, 62, 26], raio: 22, para: [164, 122, 66], claro: [215, 191, 182] }, // as pernas do lado de lá
    { nome: 'perna-com-meia', de: [158, 66, 24], raio: 14, para: [188, 146, 82], claro: [215, 191, 182], brancoMin: 0.15 }, // perna do lado de lá com a meia branca (o couro, de cor parecida, não tem branco)
  ] },
};

const o = {}; const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) if (args[i].startsWith('--')) { const k = args[i].slice(2); o[k] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true; }
if (!o.de || !o.receita || (!o.para && !o.listar && !o.ensaio)) { console.error('uso: recolorir.mjs --de <chave> --para <chave> --receita <nome> [--listar]'); process.exit(1); }
const receita = RECEITAS[o.receita]; if (!receita) { console.error('receita desconhecida:', o.receita, '(há:', Object.keys(RECEITAS).join(', ') + ')'); process.exit(1); }
const arqCat = (k) => path.join(ARTE, 'catalogo', k.startsWith('personagem/') ? 'personagem.json' : 'animais.json');
const cat = JSON.parse(fs.readFileSync(arqCat(o.de), 'utf8')); const ent = cat.pecas[o.de];
if (!ent) { console.error('não está no catálogo:', o.de); process.exit(1); }

const { data, info } = await sharp(path.join(ARTE, ent.arquivo)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;

const luz = (c) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];

// regiões: pixels opacos e não escuros, ligados em 4
const barreira = (p) => data[p * 4 + 3] < 128 || Math.max(data[p * 4], data[p * 4 + 1], data[p * 4 + 2]) < 70;
const rot = new Int32Array(N), regioes = [null], pilha = [];
for (let p = 0; p < N; p++) {
  if (rot[p] || barreira(p)) continue; const id = regioes.length, px = [p]; rot[p] = id; pilha.push(p);
  while (pilha.length) { const q = pilha.pop(), x = q % W;
    for (const r of [x > 0 ? q - 1 : -1, x < W - 1 ? q + 1 : -1, q - W, q + W]) if (r >= 0 && r < N && !rot[r] && !barreira(r)) { rot[r] = id; pilha.push(r); px.push(r); } }
  regioes.push({ px });
}
const mediana = (v) => { v.sort((a, b) => a - b); return v[v.length >> 1]; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
for (const r of regioes) { if (!r) continue; const passo = Math.max(1, Math.floor(r.px.length / 4000)), am = r.px.filter((_, i) => i % passo === 0);
  const cor = am.filter((p) => Math.min(data[p * 4], data[p * 4 + 1], data[p * 4 + 2]) <= 150); // sem os brancos
  r.colorido = cor.length / am.length; const base = cor.length >= am.length * 0.1 ? cor : am;
  r.cor = [0, 1, 2].map((ch) => mediana(base.map((p) => data[p * 4 + ch]))); }
// vizinhança: cores do meio das regiões que ficam a até "alcance" pixels (atravessando o traço)
function encosta(r, cor, raio, alcance) {
  const passo = Math.max(1, Math.floor(r.px.length / 1500));
  for (let i = 0; i < r.px.length; i += passo) { const p = r.px[i], x = p % W, y = (p - x) / W;
    for (const [dx, dy] of [[alcance, 0], [-alcance, 0], [0, alcance], [0, -alcance]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const id = rot[ny * W + nx]; if (id && regioes[id] !== r && dist(regioes[id].cor, cor) <= raio) return true; } }
  return false;
}
for (const r of regioes) { if (!r) continue; r.classe = null;
  for (const c of receita.classes) { if (dist(r.cor, c.de) > c.raio) continue;
    if (c.brancoMin && 1 - r.colorido < c.brancoMin) continue;
    if (c.so && !encosta(r, c.so.perto, c.so.raio, c.so.dist || 12)) continue;
    if (c.nao && encosta(r, c.nao.perto, c.nao.raio, c.nao.dist || 12)) continue;
    r.classe = c; break; } }

if (o.listar) {
  const larg = ent.casa[0];
  const lista = regioes.filter((r) => r && r.px.length >= 60 && r.px[0] % W < larg).sort((a, b) => b.px.length - a.px.length);
  for (const r of lista) { const x = r.px.map((p) => p % W), y = r.px.map((p) => (p - (p % W)) / W);
    console.log(`${String(r.px.length).padStart(6)} px  cor ${r.cor.join(',').padEnd(12)} x ${Math.min(...x)}-${Math.max(...x)} y ${Math.min(...y)}-${Math.max(...y)}  ${r.classe ? r.classe.nome : '-'}  ${receita.classes.map((c) => `${c.nome}:${Math.round(dist(r.cor, c.de))}`).join(' ')}`); }
  process.exit(0);
}

// regiões com cara de pelo (mesma família de cor da primeira classe) que ficaram de fora: avisa, para olhar
const matizSat = (c) => { const mx = Math.max(...c), mn = Math.min(...c), l = (mx + mn) / 510, s = mx === mn ? 0 : (mx - mn) / (l > 0.5 ? 510 - mx - mn : mx + mn);
  let h = 0; if (mx !== mn) { h = mx === c[0] ? ((c[1] - c[2]) / (mx - mn)) % 6 : mx === c[1] ? (c[2] - c[0]) / (mx - mn) + 2 : (c[0] - c[1]) / (mx - mn) + 4; h = (h * 60 + 360) % 360; } return [h, s, l]; };
const [h0] = matizSat(receita.classes[0].de); let fora = 0; const porQuadro = {};
for (const r of regioes) { if (!r || r.classe || r.px.length < 150) continue; const [h, s, l] = matizSat(r.cor);
  if (Math.abs(h - h0) <= 6 && s >= 0.6 && l >= 0.2 && l <= 0.5 && dist(r.cor, receita.classes[0].de) <= 60) { fora++; const q = Math.floor((r.px[0] % W) / ent.casa[0]) + 1; (porQuadro[q] = porQuadro[q] || []).push(`${r.cor.join(',')} (${r.px.length} px${r.colorido < 0.85 ? ', com branco' : ''})`); } }
if (o.verboso) for (const [q, l] of Object.entries(porQuadro)) console.log(`  quadro ${q}: de fora ${l.join('; ')}`);

let mudados = 0;
for (const r of regioes) { if (!r || !r.classe) continue; const c = r.classe, claro = c.claro || BRANCO, lT = luz(TRACO), lC = luz(c.de), lB = luz(claro);
  for (const p of r.px) { const i = p * 4, l = luz([data[i], data[i + 1], data[i + 2]]);
    const [a, b, t] = l <= lC ? [TRACO, c.para, Math.max(0, (l - lT) / (lC - lT))] : [c.para, claro, Math.min(1, (l - lC) / (lB - lC))];
    for (let ch = 0; ch < 3; ch++) data[i + ch] = Math.round(a[ch] + (b[ch] - a[ch]) * t); mudados++; } }

if (o.ensaio) { await sharp(Buffer.from(data.buffer, data.byteOffset, data.length), { raw: { width: W, height: H, channels: 4 } }).png().toFile(o.ensaio); console.log(`ensaio: ${mudados} pontos recoloridos em ${o.ensaio}`); process.exit(0); }
const nomeArq = o.para.startsWith('personagem/') ? `personagem/${o.para.slice(11)}.png` : `animais/${o.para.slice(7)}.png`;
fs.mkdirSync(path.dirname(path.join(ARTE, nomeArq)), { recursive: true });
await sharp(Buffer.from(data.buffer, data.byteOffset, data.length), { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile(path.join(ARTE, nomeArq));
const catPara = JSON.parse(fs.readFileSync(arqCat(o.para), 'utf8'));
catPara.pecas[o.para] = { ...ent, arquivo: nomeArq };
// mesma forma de escrever do folha.mjs: uma peça por linha, em ordem
const linhas = Object.keys(catPara.pecas).sort().map((k) => {
  const campos = Object.entries(catPara.pecas[k]).map(([c, v]) => `${JSON.stringify(c)}: ${JSON.stringify(v).replace(/,/g, ', ')}`);
  return `    ${JSON.stringify(k)}: { ${campos.join(', ')} }`;
});
fs.writeFileSync(arqCat(o.para), `{\n  "escala": ${catPara.escala},\n  "pecas": {\n${linhas.join(',\n')}\n  }\n}\n`);
console.log(`${o.para}: ${mudados} pontos recoloridos (${(100 * mudados / N).toFixed(1)}% da folha) de ${o.de}; ${fora} região(ões) de cor parecida ficaram de fora (arreios, botas); gravado ${nomeArq}`);
