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
// A cor do pelo é medida em cada folha (o Codex não repete o tom exato de uma folha para outra).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const sharp = createRequire(path.join(AQUI, '../../package.json'))('sharp');
const ARTE = path.join(AQUI, '../../arte');

const BRANCO = [252, 242, 232], BRANCO_SOMBRA = [215, 191, 182], TRACO = [25, 10, 3];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const luz = (c) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
const hsl = (c) => { const mx = Math.max(...c), mn = Math.min(...c), l = (mx + mn) / 510, s = mx === mn ? 0 : (mx - mn) / (l > 0.5 ? 510 - mx - mn : mx + mn);
  let h = 0; if (mx !== mn) { h = mx === c[0] ? ((c[1] - c[2]) / (mx - mn)) % 6 : mx === c[1] ? (c[2] - c[0]) / (mx - mn) + 2 : (c[0] - c[1]) / (mx - mn) + 4; h = (h * 60 + 360) % 360; } return [h, s, l]; };
const familia = (cor, C, satMin = 0.55) => { const [h, s] = hsl(cor), [hC] = hsl(C); return Math.abs(h - hC) <= 7 && s >= satMin; };

// Receita: "base" é a cor de origem esperada (a de cada folha é medida: a maior região a até "raioBase" dela);
// "para" é a cor nova. Cada classe diz que regiões entram: serve(região, cor do pelo na folha). A primeira que
// serve fica com a região. Classe com "sombra": a cor de origem é a da própria região e a nova é a cor nova
// escurecida na mesma proporção (pernas do lado de lá, partes na sombra).
const RECEITAS = {
  // Cavalo mangalarga: pelagem baia (dourada) no lugar da alazã; crina, rabo, meias brancas e arreios iguais.
  // O couro dos arreios e das botas tem cor parecida com a do pelo na sombra: separa-se por ser mais apagado
  // (mais azul para o mesmo vermelho) e por não ter branco dentro (a perna do lado de lá tem a meia).
  mangalarga: { base: [194, 86, 36], raioBase: 40, para: [232, 182, 104], classes: [
    { nome: 'pelo', serve: (r, C) => dist(r.cor, C) <= 16 || (dist(r.cor, C) <= 30 && r.cor[0] >= C[0] + 3 && familia(r.cor, C, 0.6)) }, // um pouco mais claro também é pelo (orelha do lado de lá); o couro é sempre mais escuro
    { nome: 'pelo-escuro', sombra: true, serve: (r, C) => r.cor[0] >= 105 && r.cor[0] <= 142 && familia(r.cor, C) },
    { nome: 'pelo-na-meia-sombra', sombra: true, serve: (r, C) => r.cor[0] > 142 && familia(r.cor, C) && dist(r.cor, C) <= 62 && (r.colorido <= 0.85 || r.cor[2] / r.cor[0] <= C[2] / C[0] - 0.025) },
  ] },
};

const o = {}; const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) if (args[i].startsWith('--')) { const k = args[i].slice(2); o[k] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true; }
if (!o.de || !o.receita || (!o.para && !o.listar && !o.ensaio)) { console.error('uso: recolorir.mjs --de <chave> --para <chave> --receita <nome> [--listar] [--ensaio arquivo.png] [--verboso]'); process.exit(1); }
const receita = RECEITAS[o.receita]; if (!receita) { console.error('receita desconhecida:', o.receita, '(há:', Object.keys(RECEITAS).join(', ') + ')'); process.exit(1); }
const arqCat = (k) => path.join(ARTE, 'catalogo', k.startsWith('personagem/') ? 'personagem.json' : 'animais.json');
const cat = JSON.parse(fs.readFileSync(arqCat(o.de), 'utf8')); const ent = cat.pecas[o.de];
if (!ent) { console.error('não está no catálogo:', o.de); process.exit(1); }

const { data, info } = await sharp(path.join(ARTE, ent.arquivo)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;

// regiões: pixels opacos e não escuros, ligados em 4
const barreira = (p) => data[p * 4 + 3] < 128 || Math.max(data[p * 4], data[p * 4 + 1], data[p * 4 + 2]) < 70;
const rot = new Int32Array(N), regioes = [], pilha = [];
for (let p = 0; p < N; p++) {
  if (rot[p] || barreira(p)) continue; const id = regioes.length + 1, px = [p]; rot[p] = id; pilha.push(p);
  while (pilha.length) { const q = pilha.pop(), x = q % W;
    for (const r of [x > 0 ? q - 1 : -1, x < W - 1 ? q + 1 : -1, q - W, q + W]) if (r >= 0 && r < N && !rot[r] && !barreira(r)) { rot[r] = id; pilha.push(r); px.push(r); } }
  regioes.push({ px });
}
const mediana = (v) => { v.sort((a, b) => a - b); return v[v.length >> 1]; };
for (const r of regioes) { const passo = Math.max(1, Math.floor(r.px.length / 4000)), am = r.px.filter((_, i) => i % passo === 0);
  const cor = am.filter((p) => Math.min(data[p * 4], data[p * 4 + 1], data[p * 4 + 2]) <= 150); // sem os brancos
  r.colorido = cor.length / am.length; const base = cor.length >= am.length * 0.1 ? cor : am;
  r.cor = [0, 1, 2].map((ch) => mediana(base.map((p) => data[p * 4 + ch]))); }

// a cor do pelo nesta folha: a da maior região perto da cor de base
const maior = regioes.filter((r) => dist(r.cor, receita.base) <= receita.raioBase).sort((a, b) => b.px.length - a.px.length)[0];
if (!maior) { console.error('nenhuma região com a cor de base', receita.base.join(',')); process.exit(1); }
const C = maior.cor;
for (const r of regioes) r.classe = receita.classes.find((c) => c.serve(r, C)) || null;

if (o.listar) {
  console.log('cor do pelo na folha:', C.join(','));
  const lista = regioes.filter((r) => r.px.length >= 60 && r.px[0] % W < ent.casa[0]).sort((a, b) => b.px.length - a.px.length);
  for (const r of lista) { const x = r.px.map((p) => p % W), y = r.px.map((p) => (p - (p % W)) / W);
    console.log(`${String(r.px.length).padStart(6)} px  cor ${r.cor.join(',').padEnd(12)} branco ${(1 - r.colorido).toFixed(2)}  x ${Math.min(...x)}-${Math.max(...x)} y ${Math.min(...y)}-${Math.max(...y)}  ${r.classe ? r.classe.nome : '-'}  dist ${Math.round(dist(r.cor, C))}`); }
  process.exit(0);
}

// regiões com cara de pelo que ficaram de fora (arreios, botas): conta e, se pedido, lista para olhar
let fora = 0; const porQuadro = {};
for (const r of regioes) { if (r.classe || r.px.length < 150 || !familia(r.cor, C, 0.5) || dist(r.cor, C) > 70 || r.cor[0] < 105) continue;
  fora++; const q = Math.floor((r.px[0] % W) / ent.casa[0]) + 1; (porQuadro[q] = porQuadro[q] || []).push(`${r.cor.join(',')} (${r.px.length} px${r.colorido < 0.85 ? ', com branco' : ''})`); }
if (o.verboso) for (const [q, l] of Object.entries(porQuadro)) console.log(`  quadro ${q}: de fora ${l.join('; ')}`);

let mudados = 0; const lT = luz(TRACO);
for (const r of regioes) { if (!r.classe) continue;
  const de = r.classe.sombra ? r.cor : C, para = r.classe.sombra ? receita.para.map((v) => v * luz(r.cor) / luz(C)) : receita.para;
  const claro = r.classe.sombra ? BRANCO_SOMBRA : BRANCO, lC = luz(de), lB = Math.max(luz(claro), lC + 20);
  for (const p of r.px) { const i = p * 4, l = luz([data[i], data[i + 1], data[i + 2]]);
    const [a, b, t] = l <= lC ? [TRACO, para, Math.max(0, (l - lT) / (lC - lT))] : [para, claro, Math.min(1, (l - lC) / (lB - lC))];
    for (let ch = 0; ch < 3; ch++) data[i + ch] = Math.round(a[ch] + (b[ch] - a[ch]) * t); mudados++; } }

const imagem = () => sharp(Buffer.from(data.buffer, data.byteOffset, data.length), { raw: { width: W, height: H, channels: 4 } });
if (o.ensaio) { await imagem().png().toFile(o.ensaio); console.log(`ensaio: pelo ${C.join(',')}; ${mudados} pontos recoloridos; ${fora} região(ões) parecidas de fora; ${o.ensaio}`); process.exit(0); }
const nomeArq = o.para.startsWith('personagem/') ? `personagem/${o.para.slice(11)}.png` : `animais/${o.para.slice(7)}.png`;
fs.mkdirSync(path.dirname(path.join(ARTE, nomeArq)), { recursive: true });
await imagem().png({ compressionLevel: 9 }).toFile(path.join(ARTE, nomeArq));
const catPara = JSON.parse(fs.readFileSync(arqCat(o.para), 'utf8'));
catPara.pecas[o.para] = { ...ent, arquivo: nomeArq };
// mesma forma de escrever do folha.mjs: uma peça por linha, em ordem
const linhas = Object.keys(catPara.pecas).sort().map((k) => {
  const campos = Object.entries(catPara.pecas[k]).map(([c, v]) => `${JSON.stringify(c)}: ${JSON.stringify(v).replace(/,/g, ', ')}`);
  return `    ${JSON.stringify(k)}: { ${campos.join(', ')} }`;
});
fs.writeFileSync(arqCat(o.para), `{\n  "escala": ${catPara.escala},\n  "pecas": {\n${linhas.join(',\n')}\n  }\n}\n`);
console.log(`${o.para}: pelo ${C.join(',')} na folha; ${mudados} pontos recoloridos (${(100 * mudados / N).toFixed(1)}%) de ${o.de}; ${fora} região(ões) de cor parecida ficaram de fora (arreios, botas); gravado ${nomeArq}`);
