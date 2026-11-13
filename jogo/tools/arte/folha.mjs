#!/usr/bin/env node
// Prepara para o jogo uma folha de animação desenhada pelo Codex.
//
// Entra: a folha crua (figuras separadas por vãos transparentes, em uma ou duas linhas), quantas figuras ela
// deve ter e a altura da figura em pé, em pontos do catálogo (128 por unidade de mundo).
// Sai: a folha normalizada em jogo/arte/ (uma linha só, casas iguais, pés na mesma linha, eixo do corpo alinhado),
// a entrada em jogo/arte/catalogo/<grupo>.json, a tira de conferência e a animação em arte/jogo/folhas/, e as
// medidas em arte/jogo/folhas/medidas-animacoes.json.
//
// Uso (da raiz do repositório):
//   node jogo/tools/arte/folha.mjs <folha-crua.png> --chave personagem/andar-frente --quadros 8 --altura 294 [opções]
//
// Opções:
//   --ref                 a primeira figura da folha crua é a figura parada em pé: dá a escala e não entra na animação
//   --alinhar ciclo|molde ciclo (padrão): cada quadro é posto pelo próprio eixo e pelo ponto mais baixo (andar, correr, parada).
//                         molde: os quadros são casados com um pedaço de um quadro de partida (pés plantados: enxadar, colher,
//                         regar; bichos). Serve quando a ferramenta ou a cabeça descem abaixo dos pés.
//   --eixo cabeca|massa|caixa   no ciclo, de onde sai o eixo do corpo (padrão cabeca: o quarto de cima da figura)
//   --base quadro|linha   no ciclo: o chão é o ponto mais baixo de cada quadro (padrão) ou o mais baixo da linha inteira
//                         (corrida e pulo, em que há quadros com os dois pés no ar)
//   --molde a-b           no molde: faixa do quadro de partida usada para casar, em fração da altura (padrão 0.80-1: as botas)
//   --molde-quadro k|ref  quadro de partida do molde (padrão 1; "ref" usa a figura de referência)
//   --faixa-pes f         faixa de baixo do quadro de partida que dá o meio dos pés (padrão 0.08; bichos de 4 patas: 0.25)
//   --chao f              quanto o ponto de apoio fica acima do ponto mais baixo, em fração da altura (padrão 0.035)
//   --apoio-dx n          desloca o ponto de apoio na horizontal, em pontos de saída (padrão: calculado)
//   --qps n  --laco sim|nao     vão para o catálogo (padrão 10 e sim)
//   --sequencia 1,1,2,3   monta a folha final repetindo ou reordenando quadros (a piscada só de vez em quando)
//   --altura-fonte n      altura da figura em pé na folha crua, quando não há referência nem serve o quadro mais alto
//   --em-pe-quadro k      sem referência: o quadro k é a figura em pé (parada: o quadro 1)
//   --fator-max f         sem referência: o quadro mais alto vale f vezes a figura em pé (padrão 1)
//   --ajuste f            multiplica a escala (acerto fino depois de comparar com outra folha)
//   --altura-livre        a altura muda de propósito (agachar, erguer a ferramenta): a variação é só informada
//   --soltas juntar|apagar  peças soltas da figura (padrão juntar ao quadro mais próximo; ciscos sempre saem)
//   --grade CxL           corta por grade regular em vez de procurar os vãos (último recurso)
//   --espelhar            vira cada quadro na horizontal
//   --cor-ref r,g,b       cor que mede o tamanho da figura entre quadros (padrão da personagem: o vermelho do lenço)
//   --casa LxA            força o tamanho da casa
//   --ensaio <pasta>      grava tudo nessa pasta e não toca no jogo nem no catálogo
//
// Confere por código: número de figuras, alfa de verdade, nada cortado na borda da folha crua, nada fora da casa,
// variação de altura entre quadros (acusa acima de 3%) e, com --cor-ref, variação de tamanho pela cor.
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(aqui, '../../..');
const sharp = acharSharp();
const ESCALA = 128; // pontos por unidade de mundo no catálogo
const LIMIAR = 24; // alfa acima disto é tinta
const MARGEM = 6, BASE = 12; // folga em volta da figura e embaixo dos pés, em pontos de saída
const FUNDO = { r: 244, g: 240, b: 230 };

function acharSharp() {
  for (const pacote of ['jogo/package.json', 'prototypes/sitio-minimo/package.json']) {
    try { return createRequire(path.join(RAIZ, pacote))('sharp'); } catch { /* tenta o próximo */ }
  }
  throw new Error('sharp não encontrado: rode npm install em jogo/ ou em prototypes/sitio-minimo/');
}

function opcoes(argv) {
  const o = { _: [] }; const semValor = new Set(['ref', 'altura-livre', 'espelhar']);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const nome = a.slice(2);
    if (semValor.has(nome)) o[nome] = true; else o[nome] = argv[++i];
  }
  return o;
}

// ---------- leitura e separação ----------

// O Codex entrega o corpo com alfa 253 ou 254 e um véu de alfa 1 a 7 em volta: estica o alfa para 0 e 255 de verdade.
function limparAlfa(d) {
  for (let i = 3; i < d.length; i += 4) { const a = d[i]; d[i] = a <= 10 ? 0 : a >= 246 ? 255 : Math.round(((a - 10) * 255) / 236); }
}

function rotular(d, W, H) {
  const rot = new Int32Array(W * H), pilha = new Int32Array(W * H), comps = [null];
  for (let i = 0; i < W * H; i++) {
    if (rot[i] || d[i * 4 + 3] <= LIMIAR) continue;
    const id = comps.length; let topo = 0; pilha[topo++] = i; rot[i] = id;
    let area = 0, x0 = W, y0 = H, x1 = 0, y1 = 0, sx = 0, sy = 0;
    while (topo) {
      const p = pilha[--topo], x = p % W, y = (p - x) / W; area++; sx += x; sy += y;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy; if (yy < 0 || yy >= H) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx; if (xx < 0 || xx >= W) continue;
          const q = yy * W + xx; if (!rot[q] && d[q * 4 + 3] > LIMIAR) { rot[q] = id; pilha[topo++] = q; }
        }
      }
    }
    comps.push({ id, area, x0, y0, x1: x1 + 1, y1: y1 + 1, cx: sx / area, cy: sy / area });
  }
  return { rot, comps };
}

const distCaixas = (a, b) => Math.hypot(Math.max(0, a.x0 - b.x1, b.x0 - a.x1), Math.max(0, a.y0 - b.y1, b.y0 - a.y1));

// Agrupa as ilhas de tinta em figuras. Devolve [{ ids:Set, caixa }] em ordem de leitura e os avisos.
function agrupar(comps, W, H, o, avisos) {
  const ilhas = comps.slice(1), maior = Math.max(...ilhas.map((c) => c.area));
  let figuras;
  if (o.grade) {
    const [C, L] = o.grade.split('x').map(Number);
    figuras = Array.from({ length: C * L }, () => ({ ids: new Set(), linha: 0 }));
    for (const c of ilhas) {
      if (c.area < maior * 0.006) continue;
      const k = Math.min(L - 1, Math.floor((c.cy / H) * L)) * C + Math.min(C - 1, Math.floor((c.cx / W) * C));
      figuras[k].ids.add(c.id); figuras[k].linha = Math.floor(k / C);
    }
    figuras = figuras.filter((f) => f.ids.size);
  } else {
    const corpos = ilhas.filter((c) => c.area >= maior * 0.2);
    figuras = corpos.map((c) => ({ ids: new Set([c.id]), corpo: c }));
    let ciscos = 0;
    for (const c of ilhas) {
      if (c.area >= maior * 0.2) continue;
      if (c.area < maior * 0.006) { ciscos++; continue; }
      let perto = null, dMin = Infinity;
      for (const f of figuras) { const dd = distCaixas(c, f.corpo); if (dd < dMin) { dMin = dd; perto = f; } }
      const alt = perto.corpo.y1 - perto.corpo.y0;
      if (o.soltas === 'apagar' || dMin > alt * 0.25) { avisos.push(`peça solta apagada (${c.area} pontos em ${c.x0},${c.y0})`); continue; }
      perto.ids.add(c.id); avisos.push(`peça solta juntada a uma figura (${c.area} pontos em ${c.x0},${c.y0}): confira se faz parte do desenho`);
    }
    if (ciscos) avisos.push(`${ciscos} cisco(s) apagado(s)`);
    // linhas: junta por altura do centro
    const med = corpos.map((c) => c.y1 - c.y0).sort((a, b) => a - b)[corpos.length >> 1];
    figuras.sort((a, b) => a.corpo.cy - b.corpo.cy);
    let linha = 0, ref = figuras[0].corpo.cy;
    for (const f of figuras) { if (f.corpo.cy - ref > med * 0.5) { linha++; ref = f.corpo.cy; } f.linha = linha; }
    figuras.sort((a, b) => a.linha - b.linha || a.corpo.cx - b.corpo.cx);
  }
  return figuras;
}

// Recorta uma figura sozinha: só as ilhas dela e a beirada macia que encosta nelas.
function recortar(d, rot, comps, W, H, fig) {
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (const id of fig.ids) { const c = comps[id]; x0 = Math.min(x0, c.x0); y0 = Math.min(y0, c.y0); x1 = Math.max(x1, c.x1); y1 = Math.max(y1, c.y1); }
  const X0 = Math.max(0, x0 - 3), Y0 = Math.max(0, y0 - 3), X1 = Math.min(W, x1 + 3), Y1 = Math.min(H, y1 + 3);
  const w = X1 - X0, h = Y1 - Y0, px = new Uint8ClampedArray(w * h * 4);
  for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
    const i = y * W + x, a = d[i * 4 + 3]; if (!a) continue;
    let fica = fig.ids.has(rot[i]);
    if (!fica && !rot[i]) { // beirada macia: fica se encosta numa ilha da figura
      for (let dy = -2; dy <= 2 && !fica; dy++) for (let dx = -2; dx <= 2; dx++) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        if (fig.ids.has(rot[yy * W + xx])) { fica = true; break; }
      }
    }
    if (fica) { const k = ((y - Y0) * w + (x - X0)) * 4; px[k] = d[i * 4]; px[k + 1] = d[i * 4 + 1]; px[k + 2] = d[i * 4 + 2]; px[k + 3] = a; }
  }
  // caixa da tinta dentro do recorte (as medidas usam a tinta, não a beirada macia)
  return { px, w, h, X0, Y0, tx0: x0 - X0, ty0: y0 - Y0, tw: x1 - x0, th: y1 - y0, linha: fig.linha, baixoFonte: y1, tocaBorda: x0 <= 0 || y0 <= 0 || x1 >= W || y1 >= H };
}

function espelhar(f) {
  const { px, w, h } = f, n = new Uint8ClampedArray(px.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const a = (y * w + x) * 4, b = (y * w + (w - 1 - x)) * 4; n[b] = px[a]; n[b + 1] = px[a + 1]; n[b + 2] = px[a + 2]; n[b + 3] = px[a + 3]; }
  f.px = n; f.tx0 = w - (f.tx0 + f.tw);
}

// ---------- medidas (em pontos do recorte) ----------

const tinta = (f, x, y) => f.px[(y * f.w + x) * 4 + 3] > LIMIAR;
// centro de massa em x da tinta entre as frações ya e yb da altura da tinta
function centroX(f, ya, yb) {
  const y0 = f.ty0 + Math.floor(f.th * ya), y1 = f.ty0 + Math.ceil(f.th * yb); let s = 0, n = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < f.w; x++) if (tinta(f, x, y)) { s += x; n++; }
  return n ? s / n : f.tx0 + f.tw / 2;
}
// caixa da tinta entre as frações ya e yb
function caixa(f, ya, yb) {
  const y0 = f.ty0 + Math.floor(f.th * ya), y1 = f.ty0 + Math.ceil(f.th * yb); let x0 = f.w, x1 = 0, yy0 = f.h, yy1 = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < f.w; x++) if (tinta(f, x, y)) { if (x < x0) x0 = x; if (x + 1 > x1) x1 = x + 1; if (y < yy0) yy0 = y; if (y + 1 > yy1) yy1 = y + 1; }
  return { x0, x1, y0: yy0, y1: yy1 };
}
function areaDaCor(f, cor, tol) {
  let n = 0; const p = f.px;
  for (let i = 0; i < p.length; i += 4) if (p[i + 3] > 200 && Math.hypot(p[i] - cor[0], p[i + 1] - cor[1], p[i + 2] - cor[2]) < tol) n++;
  return n;
}

// ---------- casamento por molde ----------

// reduz por s (média com alfa) para a busca grossa
function reduzir(px, w, h, s) {
  const W = Math.ceil(w / s), H = Math.ceil(h / s), r = new Float32Array(W * H * 4);
  for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
    let sr = 0, sg = 0, sb = 0, sa = 0;
    for (let y = Y * s; y < Math.min(h, Y * s + s); y++) for (let x = X * s; x < Math.min(w, X * s + s); x++) { const k = (y * w + x) * 4, a = px[k + 3]; sr += px[k] * a; sg += px[k + 1] * a; sb += px[k + 2] * a; sa += a; }
    const k = (Y * W + X) * 4; r[k] = sa ? sr / sa : 0; r[k + 1] = sa ? sg / sa : 0; r[k + 2] = sa ? sb / sa : 0; r[k + 3] = sa / (s * s);
  }
  return { px: r, w: W, h: H };
}
// custo de pôr o molde T em (ox, oy) do quadro F: diferença de cor onde há tinta nos dois, multa onde só o molde tem
function custo(T, F, ox, oy, passo, teto) {
  let soma = 0, n = 0;
  for (let y = 0; y < T.h; y += passo) for (let x = 0; x < T.w; x += passo) {
    const kt = (y * T.w + x) * 4; if (T.px[kt + 3] < 128) continue;
    const fx = x + ox, fy = y + oy; n++;
    if (fx < 0 || fy < 0 || fx >= F.w || fy >= F.h) { soma += 380; continue; }
    const kf = (fy * F.w + fx) * 4;
    if (F.px[kf + 3] < 128) soma += 380; else soma += Math.abs(T.px[kt] - F.px[kf]) + Math.abs(T.px[kt + 1] - F.px[kf + 1]) + Math.abs(T.px[kt + 2] - F.px[kf + 2]);
    if (soma > teto) return Infinity;
  }
  return n ? soma / n : Infinity;
}
// Acha onde o molde (um retângulo do quadro de partida) cai no quadro F. Devolve o canto do molde em F e o custo médio.
function casar(molde, F, emPeFonte) {
  const s = 4, Tg = reduzir(molde.px, molde.w, molde.h, s), Fg = reduzir(F.px, F.w, F.h, s);
  let nT = 0; for (let i = 3; i < Tg.px.length; i += 4) if (Tg.px[i] >= 128) nT++;
  // o pé do molde fica perto do pé do quadro
  const baixoF = F.ty0 + F.th, oyMin = Math.floor((baixoF - molde.h - emPeFonte * 0.4) / s), oyMax = Math.ceil((baixoF - molde.h + emPeFonte * 0.12) / s);
  let melhor = { c: Infinity, ox: 0, oy: 0 };
  for (let oy = oyMin; oy <= oyMax; oy++) for (let ox = -Math.floor(Tg.w * 0.3); ox <= Fg.w - Math.floor(Tg.w * 0.7); ox++) {
    const c = custo(Tg, Fg, ox, oy, 1, melhor.c * nT);
    if (c < melhor.c) melhor = { c, ox, oy };
  }
  const T1 = { px: molde.px, w: molde.w, h: molde.h }, F1 = { px: F.px, w: F.w, h: F.h };
  let fino = { c: Infinity, ox: melhor.ox * s, oy: melhor.oy * s };
  for (let oy = melhor.oy * s - s - 1; oy <= melhor.oy * s + s + 1; oy++) for (let ox = melhor.ox * s - s - 1; ox <= melhor.ox * s + s + 1; ox++) {
    const c = custo(T1, F1, ox, oy, 2, Infinity);
    if (c < fino.c) fino = { c, ox, oy };
  }
  return fino;
}

// ---------- saída ----------

function chaveParaCaminhos(chave) {
  const p = chave.split('/');
  if (p[0] === 'personagem' && p.length === 2) return { grupo: 'personagem', arquivo: `personagem/${p[1]}.png`, nome: `personagem-${p[1]}` };
  if (p[0] === 'animal' && p.length === 3) return { grupo: 'animais', arquivo: `animais/${p[1]}/${p[2]}.png`, nome: `animal-${p[1]}-${p[2]}` };
  throw new Error(`chave fora do padrão: ${chave} (use personagem/<acao>-<frente|costas> ou animal/<bicho>/<acao>-<frente|costas>)`);
}

function gravarCatalogo(arq, chave, entrada) {
  let cat = { escala: ESCALA, pecas: {} };
  if (fs.existsSync(arq)) cat = JSON.parse(fs.readFileSync(arq, 'utf8'));
  cat.pecas[chave] = entrada;
  const linhas = Object.keys(cat.pecas).sort().map((k) => {
    const e = cat.pecas[k], campos = Object.entries(e).map(([c, v]) => `${JSON.stringify(c)}: ${JSON.stringify(v).replace(/,/g, ', ')}`);
    return `    ${JSON.stringify(k)}: { ${campos.join(', ')} }`;
  });
  fs.mkdirSync(path.dirname(arq), { recursive: true });
  fs.writeFileSync(arq, `{\n  "escala": ${cat.escala},\n  "pecas": {\n${linhas.join(',\n')}\n  }\n}\n`);
}

function rotulo(texto, x, y, tam = 13, cor = '#5a5040') {
  return `<text x="${x}" y="${y}" font-family="DejaVu Sans, sans-serif" font-size="${tam}" fill="${cor}">${texto.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
}

// ---------- principal ----------

async function principal() {
  const o = opcoes(process.argv.slice(2));
  const crua = o._[0], nEsperado = Number(o.quadros), emPe = Number(o.altura);
  if (!crua || !o.chave || !nEsperado || !emPe) { console.error('Uso: node jogo/tools/arte/folha.mjs <folha-crua.png> --chave <chave> --quadros <n> --altura <pontos> [opções]'); process.exit(2); }
  const cam = chaveParaCaminhos(o.chave), avisos = [], falhas = [];
  const modo = o.alinhar || 'ciclo';

  // 1. leitura e alfa
  const meta = await sharp(crua).metadata();
  const { data: d, info } = await sharp(crua).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  let vazios = 0; for (let i = 3; i < d.length; i += 4) if (d[i] < 8) vazios++;
  const cantos = [0, W - 1, (H - 1) * W, H * W - 1].every((i) => d[i * 4 + 3] < 8);
  if (!meta.hasAlpha || vazios / (W * H) < 0.2 || !cantos) falhas.push(`sem fundo transparente de verdade (alfa: ${meta.hasAlpha}, vazio: ${((100 * vazios) / (W * H)).toFixed(0)}%, cantos vazios: ${cantos})`);
  limparAlfa(d);

  // 2. figuras
  const { rot, comps } = rotular(d, W, H);
  if (comps.length < 2) { console.error('FALHA: a folha não tem tinta'); process.exit(1); }
  const figuras = agrupar(comps, W, H, o, avisos);
  if (figuras.length !== nEsperado) {
    console.error(`FALHA: esperava ${nEsperado} figura(s), achei ${figuras.length}.`);
    for (const f of figuras) { const c = f.corpo; if (c) console.error(`  figura em x ${c.x0}-${c.x1}, y ${c.y0}-${c.y1} (${c.area} pontos)`); }
    process.exit(1);
  }
  const recortes = figuras.map((f) => recortar(d, rot, comps, W, H, f));
  if (recortes.some((r) => r.tocaBorda)) falhas.push(`figura cortada na borda da folha crua (figuras ${recortes.map((r, i) => (r.tocaBorda ? i + 1 : 0)).filter(Boolean).join(', ')})`);
  if (o.espelhar) recortes.forEach(espelhar);
  const nLinhas = new Set(recortes.map((r) => r.linha)).size;

  // 3. escala
  const ref = o.ref ? recortes[0] : null, quadros = o.ref ? recortes.slice(1) : recortes;
  const maiorAltura = Math.max(...quadros.map((f) => f.th));
  const emPeFonte = o['altura-fonte'] ? Number(o['altura-fonte']) : ref ? ref.th : o['em-pe-quadro'] ? quadros[Number(o['em-pe-quadro']) - 1].th : maiorAltura / Number(o['fator-max'] || 1);
  const esc = (emPe / emPeFonte) * Number(o.ajuste || 1);
  if (esc > 1.02) avisos.push(`a folha crua é menor que a saída (figura em pé com ${emPeFonte.toFixed(0)} pontos para ${emPe}): a figura foi ampliada ${esc.toFixed(2)} vezes`);

  // 4. alinhamento: para cada quadro, o ponto de apoio em x (ax) e a linha do chão (by), em pontos do recorte
  const custos = [];
  if (modo === 'molde') {
    const [fa, fb] = (o.molde || '0.80-1').split('-').map(Number);
    const part = o['molde-quadro'] === 'ref' ? ref : quadros[Number(o['molde-quadro'] || 1) - 1];
    if (!part) throw new Error('quadro de partida do molde não existe');
    const pes = caixa(part, 1 - Number(o['faixa-pes'] || 0.08), 1);
    part.ax = (pes.x0 + pes.x1) / 2; part.by = part.ty0 + part.th;
    const cx = caixa(part, fa, fb), molde = { w: cx.x1 - cx.x0, h: cx.y1 - cx.y0, px: new Uint8ClampedArray((cx.x1 - cx.x0) * (cx.y1 - cx.y0) * 4) };
    for (let y = 0; y < molde.h; y++) for (let x = 0; x < molde.w; x++) for (let c = 0; c < 4; c++) molde.px[(y * molde.w + x) * 4 + c] = part.px[((y + cx.y0) * part.w + x + cx.x0) * 4 + c];
    for (const f of quadros) {
      if (f === part) { custos.push(0); continue; }
      const m = casar(molde, f, emPeFonte);
      f.ax = m.ox + (part.ax - cx.x0); f.by = m.oy + (part.by - cx.y0); custos.push(Math.round(m.c));
    }
    const ruins = custos.map((c, i) => (c > 150 ? i + 1 : 0)).filter(Boolean);
    if (ruins.length) avisos.push(`alinhamento incerto pelo molde nos quadros ${ruins.join(', ')} (custos ${custos.join(' ')}): olhe a sobreposição na tira`);
  } else {
    const eixo = o.eixo || 'cabeca';
    const baseLinha = {}; for (const f of quadros) baseLinha[f.linha] = Math.max(baseLinha[f.linha] || 0, f.baixoFonte);
    let soma = 0;
    for (const f of quadros) {
      f.eixo = eixo === 'massa' ? centroX(f, 0, 1) : eixo === 'caixa' ? f.tx0 + f.tw / 2 : centroX(f, 0, 0.28);
      f.by = o.base === 'linha' ? baseLinha[f.linha] - f.Y0 : f.ty0 + f.th;
      const pes = caixa(f, 0.8, 1); soma += (pes.x0 + pes.x1) / 2 - f.eixo;
    }
    const dx = o['apoio-dx'] !== undefined ? Number(o['apoio-dx']) / esc : soma / quadros.length;
    for (const f of quadros) f.ax = f.eixo + dx;
  }

  // 5. casa: cabe todo quadro, com o ponto de apoio no meio da largura
  let esq = 0, dir = 0, cima = 0, baixo = 0;
  for (const f of quadros) {
    esq = Math.max(esq, (f.ax - f.tx0) * esc); dir = Math.max(dir, (f.tx0 + f.tw - f.ax) * esc);
    cima = Math.max(cima, (f.by - f.ty0) * esc); baixo = Math.max(baixo, (f.ty0 + f.th - f.by) * esc);
  }
  const mult = (v, m) => Math.ceil(v / m) * m;
  let cw = mult(2 * (Math.ceil(Math.max(esq, dir)) + MARGEM), 8), embaixo = Math.max(BASE, Math.ceil(baixo) + MARGEM), ch = mult(MARGEM + Math.ceil(cima) + embaixo, 8);
  if (o.casa) { const [l, a] = o.casa.split('x').map(Number); if (l < cw || a < ch) falhas.push(`a casa pedida (${l}x${a}) é menor que a necessária (${cw}x${ch})`); cw = l; ch = a; }
  const chaoY = ch - embaixo; // linha do chão dentro da casa
  const apoio = [cw / 2, chaoY - Math.round(Number(o.chao ?? 0.035) * emPe)];

  // 6. quadros na escala de saída
  const pecas = [];
  for (const f of quadros) {
    const w = Math.max(1, Math.round(f.w * esc)), h = Math.max(1, Math.round(f.h * esc));
    const buf = await sharp(Buffer.from(f.px.buffer), { raw: { width: f.w, height: f.h, channels: 4 } }).resize(w, h, { kernel: 'lanczos3', fit: 'fill' }).raw().toBuffer();
    const left = Math.round(cw / 2 - f.ax * esc), top = Math.round(chaoY - f.by * esc);
    if (left < 0 || top < 0 || left + w > cw || top + h > ch) falhas.push(`quadro ${pecas.length + 1} não cabe na casa`);
    pecas.push({ buf, w, h, left, top });
  }
  const seq = o.sequencia ? o.sequencia.split(',').map((v) => Number(v) - 1) : pecas.map((_, i) => i);
  if (seq.some((i) => !pecas[i])) throw new Error('--sequencia aponta para quadro que não existe');
  const montar = (lista, fundo) => sharp({ create: { width: cw * lista.length, height: ch, channels: 4, background: fundo || { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(lista.map((i, k) => ({ input: pecas[i].buf, raw: { width: pecas[i].w, height: pecas[i].h, channels: 4 }, left: k * cw + pecas[i].left, top: pecas[i].top })));
  const folha = await montar(seq).png({ compressionLevel: 9, palette: true, quality: 95, effort: 10, dither: 0 }).toBuffer();

  // 7. conferências
  const alturas = quadros.map((f) => f.th * esc), aMax = Math.max(...alturas), aMin = Math.min(...alturas), varAlt = (aMax - aMin) / aMax;
  if (varAlt > 0.03) (o['altura-livre'] ? avisos : falhas).push(`altura varia ${(varAlt * 100).toFixed(1)}% entre quadros (${alturas.map((a) => a.toFixed(0)).join(' ')})${o['altura-livre'] ? ', esperado nesta ação' : ''}`);
  const cor = o['cor-ref'] ? o['cor-ref'].split(',').map(Number) : cam.grupo === 'personagem' ? [236, 40, 40] : null;
  let tamCor = null;
  if (cor) {
    tamCor = quadros.map((f) => Math.sqrt(areaDaCor(f, cor, 80)) * esc);
    const ord = [...tamCor].sort((a, b) => a - b), med = ord[ord.length >> 1], v = (ord[ord.length - 1] - ord[0]) / med;
    if (v > 0.12) avisos.push(`tamanho pela cor de referência varia ${(v * 100).toFixed(0)}% entre quadros (${tamCor.map((t) => t.toFixed(0)).join(' ')}): confira se a figura muda de tamanho`);
  }

  // 8. gravação
  const pastaFolhas = o.ensaio || path.join(RAIZ, 'arte/jogo/folhas');
  const saida = o.ensaio ? path.join(o.ensaio, `${cam.nome}.folha.png`) : path.join(RAIZ, 'jogo/arte', cam.arquivo);
  fs.mkdirSync(pastaFolhas, { recursive: true }); fs.mkdirSync(path.dirname(saida), { recursive: true });
  const entrada = { arquivo: cam.arquivo, quadros: seq.length, casa: [cw, ch], apoio, qps: Number(o.qps || 10), laco: (o.laco || 'sim') !== 'nao' };
  const ok = falhas.length === 0;
  if (ok || o.ensaio) fs.writeFileSync(saida, folha);
  if (ok && !o.ensaio) gravarCatalogo(path.join(RAIZ, 'jogo/arte/catalogo', `${cam.grupo}.json`), o.chave, entrada);

  // tira de conferência: os quadros lado a lado sobre fundo claro, com a linha do chão, o ponto de apoio e, no fim, todos sobrepostos
  const n = pecas.length, topo = 38, larg = cw * (n + 1), alt = ch + topo;
  const transl = await Promise.all(pecas.map(async (p) => { // cada quadro com alfa dividido, para a sobreposição
    const b = Buffer.from(p.buf); for (let i = 3; i < b.length; i += 4) b[i] = Math.round(b[i] * Math.max(0.22, 1.4 / n)); return b;
  }));
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${larg}" height="${alt}">`;
  for (let k = 0; k <= n; k++) {
    svg += `<rect x="${k * cw + 0.5}" y="${topo + 0.5}" width="${cw - 1}" height="${ch - 1}" fill="none" stroke="#d8cfbc"/>`;
    svg += `<line x1="${k * cw}" x2="${(k + 1) * cw}" y1="${topo + chaoY + 0.5}" y2="${topo + chaoY + 0.5}" stroke="#e08a6a" stroke-width="1"/>`;
    svg += `<line x1="${k * cw + apoio[0] + 0.5}" x2="${k * cw + apoio[0] + 0.5}" y1="${topo}" y2="${topo + ch}" stroke="#9cc3e0" stroke-width="1" stroke-dasharray="3 5"/>`;
    svg += rotulo(k < n ? String(k + 1) : 'todos', k * cw + 6, 33);
  }
  svg += rotulo(`${o.chave}  casa ${cw}x${ch}  apoio ${apoio.join(',')}  ${ok ? 'OK' : 'COM FALHA'}`, 6, 14, 12);
  svg += '</svg>';
  const marcas = `<svg xmlns="http://www.w3.org/2000/svg" width="${larg}" height="${alt}">` + Array.from({ length: n + 1 }, (_, k) => `<circle cx="${k * cw + apoio[0]}" cy="${topo + apoio[1]}" r="3.5" fill="#e0457a" stroke="#fff" stroke-width="1"/>`).join('') + '</svg>';
  let tira = sharp({ create: { width: larg, height: alt, channels: 4, background: { ...FUNDO, alpha: 1 } } }).composite([
    { input: Buffer.from(svg), left: 0, top: 0 },
    ...pecas.map((p, k) => ({ input: p.buf, raw: { width: p.w, height: p.h, channels: 4 }, left: k * cw + p.left, top: topo + p.top })),
    ...pecas.map((p, k) => ({ input: transl[k], raw: { width: p.w, height: p.h, channels: 4 }, left: n * cw + p.left, top: topo + p.top })),
    { input: Buffer.from(marcas), left: 0, top: 0 },
  ]);
  let tiraBuf = await tira.png().toBuffer();
  if (larg > 2600) tiraBuf = await sharp(tiraBuf).resize({ width: 2600 }).toBuffer();
  const arqTira = path.join(pastaFolhas, `${cam.nome}.png`);
  fs.writeFileSync(arqTira, await sharp(tiraBuf).flatten({ background: FUNDO }).png({ compressionLevel: 9, palette: true, colours: 64, dither: 0, effort: 10 }).toBuffer());

  // animação de conferência (GIF sobre fundo claro, na velocidade do catálogo)
  let arqGif = null;
  try {
    const pilha = Buffer.alloc(cw * ch * 4 * seq.length);
    for (let k = 0; k < seq.length; k++) {
      const q = await montar([seq[k]], { ...FUNDO, alpha: 1 }).raw().toBuffer();
      q.copy(pilha, k * cw * ch * 4);
    }
    arqGif = path.join(pastaFolhas, `${cam.nome}.gif`);
    await sharp(pilha, { raw: { width: cw, height: ch * seq.length, channels: 4, pageHeight: ch } }).gif({ delay: Math.round(1000 / entrada.qps), loop: 0, effort: 10, colours: 48, dither: 0, interFrameMaxError: 6 }).toFile(arqGif);
  } catch (e) { arqGif = null; avisos.push(`não deu para gravar a animação de conferência: ${e.message}`); }

  // medidas
  const medidas = {
    chave: o.chave, crua: path.basename(crua), cruaTamanho: [W, H], linhasNaCrua: nLinhas, figurasNaCrua: recortes.length, referencia: !!ref, modo,
    emPe, emPeFonte: Math.round(emPeFonte), escala: Number(esc.toFixed(4)), casa: [cw, ch], apoio, quadros: seq.length, desenhos: n, qps: entrada.qps, laco: entrada.laco,
    alturas: alturas.map((a) => Math.round(a)), variacaoAltura: Number((varAlt * 100).toFixed(1)), tamanhoPelaCor: tamCor ? tamCor.map((t) => Number(t.toFixed(1))) : undefined,
    custosDoMolde: custos.length ? custos : undefined, bytes: folha.length, avisos, falhas, ok,
    opcoes: Object.fromEntries(Object.entries(o).filter(([k]) => k !== '_' && k !== 'ensaio')),
  };
  const arqMed = path.join(pastaFolhas, 'medidas-animacoes.json');
  let todas = {}; if (fs.existsSync(arqMed)) todas = JSON.parse(fs.readFileSync(arqMed, 'utf8'));
  todas[o.chave] = medidas;
  fs.writeFileSync(arqMed, JSON.stringify(Object.fromEntries(Object.keys(todas).sort().map((k) => [k, todas[k]])), null, 1) + '\n');

  // relato
  console.log(`${o.chave}: ${recortes.length} figura(s) em ${nLinhas} linha(s) na folha crua de ${W}x${H}${ref ? ', a primeira é a referência em pé' : ''}`);
  console.log(`  figura em pé: ${emPeFonte.toFixed(0)} pontos na crua -> ${emPe} (escala ${esc.toFixed(3)}); casa ${cw}x${ch}; apoio ${apoio.join(',')}; ${seq.length} quadro(s) de ${n} desenho(s); ${(folha.length / 1024).toFixed(0)} KB`);
  console.log(`  alturas: ${alturas.map((a) => a.toFixed(0)).join(' ')} (variação ${(varAlt * 100).toFixed(1)}%)`);
  if (tamCor) console.log(`  tamanho pela cor: ${tamCor.map((t) => t.toFixed(1)).join(' ')}`);
  if (custos.length) console.log(`  custos do molde: ${custos.join(' ')}`);
  for (const a of avisos) console.log(`  AVISO: ${a}`);
  for (const f of falhas) console.log(`  FALHA: ${f}`);
  console.log(`  tira: ${path.relative(RAIZ, arqTira)}${arqGif ? `, animação: ${path.relative(RAIZ, arqGif)}` : ''}`);
  console.log(ok ? (o.ensaio ? `  ensaio: ${saida}` : `  gravado: jogo/arte/${cam.arquivo} e a entrada em jogo/arte/catalogo/${cam.grupo}.json`) : '  NÃO gravado no jogo.');
  process.exit(ok ? 0 : 1);
}

principal().catch((e) => { console.error('FALHA:', e.message); process.exit(1); });
