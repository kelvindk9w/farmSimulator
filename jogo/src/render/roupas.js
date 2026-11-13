// As roupas da personagem, por troca de cor. As folhas dela têm quatro faixas de cor que não se repetem no resto
// da figura: o lenço (vermelho), a camisa (amarelo), o macacão (azul) e as botas (marrom). Cada cosmético diz o que
// fazer com uma ou mais faixas (outra cor, xadrez, flores, remendos). A troca é feita uma vez, numa cópia das
// páginas da personagem, e fica guardada até ela trocar de roupa: o desenho de cada quadro continua sendo um
// drawImage, sem custo a mais.
// O que troca de FORMA (chapéu, vestido, boné) e a pintura das ferramentas não saem daqui: ficam "em breve" até
// haver arte. Quem está nas RECEITAS entra em VESTIVEL (a lógica só vende e veste o que está lá).
import { VESTIVEL } from '../nucleo/sistemas/roupas.js';

const LENCO = 1, CAMISA = 2, MACACAO = 3, BOTA = 4;
const mod = (a, n) => ((a % n) + n) % n;

// ---------- as receitas: (h, s, v, dx, dy, c) → preenche c = [h, s, v] ----------
// h em graus, s e v de 0 a 1 (a cor original do ponto); dx, dy = distância até o centro da faixa naquele quadro,
// em pontos da peça (o padrão anda junto com o corpo). Manter "v" proporcional guarda as dobras e as sombras.
function xadrez(passo, faixa, cores) {
  return (h, s, v, dx, dy, c) => {
    const fx = mod(dx, passo) < faixa, fy = mod(dy, passo) < faixa;
    const k = fx && fy ? cores.cruzado : fx || fy ? cores.faixa : cores.fundo;
    c[0] = k[0]; c[1] = k[1]; c[2] = Math.min(1, v * k[2]);
    if (cores.fio && (mod(dx + passo / 2, passo) < 1.3 || mod(dy + passo / 2, passo) < 1.3)) { c[0] = cores.fio[0]; c[1] = cores.fio[1]; c[2] = Math.min(1, v * cores.fio[2]); }
  };
}
const lisa = (h2, s2, kv, soma = 0) => (h, s, v, dx, dy, c) => { c[0] = h2; c[1] = s2; c[2] = Math.min(1, soma + v * kv); };

const REMENDOS = [[-16, 26, 15, 4, 0.8, 1.2], [15, 58, 14, 48, 0.85, 1.4], [-10, 92, 13, 130, 0.6, 1.05], [20, 4, 11, 30, 0.9, 1.4]];
function remendado(h, s, v, dx, dy, c) {
  c[0] = 214; c[1] = 0.78; c[2] = Math.min(1, v * 0.9);
  for (const r of REMENDOS) {
    const ax = Math.abs(dx - r[0]), ay = Math.abs(dy - r[1]), m = r[2] / 2;
    if (ax > m || ay > m) continue;
    const borda = ax > m - 1.8 || ay > m - 1.8;
    c[0] = r[3]; c[1] = r[4]; c[2] = Math.min(1, v * r[5] * (borda ? 0.6 : 1));
  }
}
function chita(h, s, v, dx, dy, c) {
  c[0] = 188; c[1] = 0.78; c[2] = Math.min(1, v * 0.95);
  // flores numa grade em que as fileiras se desencontram
  const fy = Math.floor(dy / 15), cx = mod(dx + (mod(fy, 2) ? 9 : 0), 18) - 9, cy = mod(dy, 15) - 7.5, d2 = cx * cx + cy * cy;
  if (d2 < 4.4) { c[0] = 48; c[1] = 0.9; c[2] = Math.min(1, v * 1.08); } else if (d2 < 24) { c[0] = 338; c[1] = 0.32; c[2] = Math.min(1, v * 1.1); }
}

export const RECEITAS = {
  'camisa-xadrez': { [CAMISA]: xadrez(15, 5, { fundo: [357, 0.8, 0.95], faixa: [357, 0.86, 0.7], cruzado: [357, 0.9, 0.5], fio: [20, 0.25, 1.05] }) },
  'roupa-de-festa-junina': { [CAMISA]: xadrez(13, 5, { fundo: [46, 0.95, 1], faixa: [22, 0.92, 0.98], cruzado: [6, 0.88, 0.85] }), [MACACAO]: remendado },
  'macacao-jeans': { [MACACAO]: (h, s, v, dx, dy, c) => { c[0] = 211; c[1] = s * 0.5; c[2] = Math.min(1, 0.1 + v * 1.12); } },
  'bota-de-borracha': { [BOTA]: lisa(218, 0.22, 0.34, 0.09) },
  'bota-de-couro': { [BOTA]: lisa(11, 0.74, 0.56) },
  'lenco-de-chita': { [LENCO]: chita },
};
for (const id in RECEITAS) VESTIVEL[id] = true;

// junta o que cada peça vestida faz: { [faixa]: receita } (a de cada parte; duas peças não disputam a mesma faixa)
export function receitasDe(vestindo) {
  const out = {};
  let n = 0;
  for (const parte in vestindo || {}) { const r = RECEITAS[vestindo[parte]]; if (r) for (const k in r) { out[k] = r[k]; n++; } }
  return n ? out : null;
}
export const chaveDasRoupas = (vestindo) => Object.values(vestindo || {}).filter((id) => RECEITAS[id]).sort().join('+');

// ---------- a troca num quadro (só contas: roda também fora do navegador) ----------
// de que faixa é este ponto? (0 = de nenhuma: pele, cabelo, contorno, ferramenta...)
function faixaDe(h, s, v) {
  if (v < 0.2) return 0;
  if ((h >= 345 || h < 9) && s >= 0.66 && v >= 0.33) return LENCO;
  if (h >= 36 && h < 58 && s >= 0.93) return CAMISA;
  if (h >= 200 && h < 236 && s >= 0.7) return MACACAO;
  if (h >= 19 && h < 24.6 && s >= 0.6 && v <= 0.9) return BOTA;
  return 0;
}
// ilhas de pontos vizinhos da mesma faixa: as pequenas demais não são roupa (boca, sombra da pele, palha do cesto);
// uma ilha pequena colada numa grande aceita vai junto (a sola da bota, a ponta do nó do lenço)
const pilha = new Int32Array(1 << 16);
function ilhas(faixa, w, h, k, minimo, serve, folga) {
  const marca = new Int32Array(w * h), lista = [];
  let pil = pilha.length >= w * h ? pilha : new Int32Array(w * h);
  for (let i0 = 0; i0 < w * h; i0++) {
    if (faixa[i0] !== k || marca[i0]) continue;
    const id = lista.length + 1, il = { id, n: 0, x0: w, y0: h, x1: 0, y1: 0, sy: 0, ok: false };
    let topo = 0;
    pil[topo++] = i0; marca[i0] = id;
    while (topo) {
      const i = pil[--topo], x = i % w, y = (i - x) / w;
      il.n++; il.sy += y;
      if (x < il.x0) il.x0 = x; if (x > il.x1) il.x1 = x; if (y < il.y0) il.y0 = y; if (y > il.y1) il.y1 = y;
      if (x > 0 && faixa[i - 1] === k && !marca[i - 1]) { marca[i - 1] = id; pil[topo++] = i - 1; }
      if (x < w - 1 && faixa[i + 1] === k && !marca[i + 1]) { marca[i + 1] = id; pil[topo++] = i + 1; }
      if (y > 0 && faixa[i - w] === k && !marca[i - w]) { marca[i - w] = id; pil[topo++] = i - w; }
      if (y < h - 1 && faixa[i + w] === k && !marca[i + w]) { marca[i + w] = id; pil[topo++] = i + w; }
    }
    lista.push(il);
  }
  const grandes = lista.filter((il) => il.n >= minimo && (!serve || serve(il)));
  for (const il of grandes) il.ok = true;
  if (folga > 0) for (const il of lista) {
    if (il.ok) continue;
    const cx = (il.x0 + il.x1) / 2, cy = (il.y0 + il.y1) / 2;
    il.ok = grandes.some((g) => cx >= g.x0 - folga && cx <= g.x1 + folga && cy >= g.y0 - folga && cy <= g.y1 + folga);
  }
  for (let i = 0; i < w * h; i++) if (marca[i] && !lista[marca[i] - 1].ok) faixa[i] = 0;
}

const cor = [0, 0, 0];
// px = RGBA (Uint8ClampedArray) de uma imagem de "largura" pontos; troca as cores do retângulo (x0, y0, w, h).
// quadro = { d (pontos da imagem por ponto da peça: 1 ou 0,5), topo (o y do retângulo dentro da casa da peça), apoio (o y dos pés) }
export function tingir(px, largura, x0, y0, w, h, quadro, receitas) {
  const d = quadro.d || 1, faixa = new Uint8Array(w * h), H = new Float32Array(w * h), S = new Float32Array(w * h), V = new Float32Array(w * h);
  const tem = [0, 0, 0, 0, 0];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = ((y0 + y) * largura + x0 + x) * 4;
    if (px[i + 3] < 24) continue;
    const r = px[i] / 255, g = px[i + 1] / 255, b = px[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), df = mx - mn;
    if (mx < 0.2 || df < 0.05) continue;
    let hh = mx === r ? ((g - b) / df) % 6 : mx === g ? (b - r) / df + 2 : (r - g) / df + 4;
    hh *= 60; if (hh < 0) hh += 360;
    const k = faixaDe(hh, df / mx, mx);
    if (!k || !receitas[k]) continue;
    const j = y * w + x;
    faixa[j] = k; H[j] = hh; S[j] = df / mx; V[j] = mx; tem[k]++;
  }
  const area = d * d, pes = (quadro.apoio - quadro.topo) * d; // a linha dos pés dentro do retângulo
  if (tem[LENCO]) ilhas(faixa, w, h, LENCO, 120 * area, null, 34 * d);
  if (tem[CAMISA]) ilhas(faixa, w, h, CAMISA, 60 * area, null, 12 * d);
  if (tem[MACACAO]) ilhas(faixa, w, h, MACACAO, 60 * area, null, 8 * d);
  // bota: ilha na metade de baixo da figura (a sombra da pele tem a mesma cor, mas é pequena ou fica em cima)
  if (tem[BOTA]) ilhas(faixa, w, h, BOTA, 170 * area, (il) => il.sy / il.n >= pes - quadro.apoio * d * 0.5, 9 * d);
  // o centro de cada faixa, para o padrão andar com o corpo
  const sx = [0, 0, 0, 0, 0], sy = [0, 0, 0, 0, 0], n = [0, 0, 0, 0, 0];
  for (let j = 0; j < w * h; j++) { const k = faixa[j]; if (k) { sx[k] += j % w; sy[k] += (j - (j % w)) / w; n[k]++; } }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const j = y * w + x, k = faixa[j];
    if (!k) continue;
    receitas[k](H[j], S[j], V[j], (x - sx[k] / n[k]) / d, (y - sy[k] / n[k]) / d, cor);
    // HSV → RGB
    const hh = mod(cor[0], 360) / 60, s = Math.max(0, Math.min(1, cor[1])), v = Math.max(0, Math.min(1, cor[2])), c = v * s, q = c * (1 - Math.abs((hh % 2) - 1)), m0 = v - c;
    let r = 0, g = 0, b = 0;
    if (hh < 1) { r = c; g = q; } else if (hh < 2) { r = q; g = c; } else if (hh < 3) { g = c; b = q; } else if (hh < 4) { g = q; b = c; } else if (hh < 5) { r = q; b = c; } else { r = c; b = q; }
    const i = ((y0 + y) * largura + x0 + x) * 4;
    px[i] = (r + m0) * 255; px[i + 1] = (g + m0) * 255; px[i + 2] = (b + m0) * 255;
  }
}

// ---------- no navegador: as páginas vestidas dentro do atlas ----------
const GRUPO = 'personagem';
const guarda = { chave: '', originais: null, extras: {} }; // extras: índice da página original → índice da página vestida
const pecasDaPersonagem = (atlas) => Object.keys(atlas.pecas).filter((k) => atlas.pecas[k].g === GRUPO);
const quadroOriginal = (atlas, chave, i) => (guarda.originais && guarda.originais[chave] ? guarda.originais[chave] : atlas.pecas[chave].q)[i];

function tela(l, a) { const c = document.createElement('canvas'); c.width = l; c.height = a; return c; }

// Deixa a personagem do atlas vestida com "vestindo" ({ parte: item }). Devolve false enquanto as páginas dela
// ainda não chegaram (quem chama tenta de novo no quadro seguinte) e true quando está pronto.
export function vestirNoAtlas(atlas, vestindo) {
  const chave = chaveDasRoupas(vestindo);
  if (chave === guarda.chave) return true;
  const pecas = pecasDaPersonagem(atlas);
  if (!pecas.length) { guarda.chave = chave; return true; }
  if (!guarda.originais) { guarda.originais = {}; for (const k of pecas) guarda.originais[k] = atlas.pecas[k].q; }
  // sem roupa nenhuma: volta ao desenho original e solta as cópias
  if (!chave) {
    for (const k of pecas) atlas.pecas[k].q = guarda.originais[k];
    for (const i in guarda.extras) { const pg = atlas.paginas[guarda.extras[i]]; pg.img = tela(1, 1); pg.pequena = null; }
    guarda.chave = chave;
    return true;
  }
  const usadas = new Set();
  for (const k of pecas) for (const f of guarda.originais[k]) usadas.add(f[0]);
  for (const i of usadas) {
    const pg = atlas.paginas[i];
    if (pg.estado === 'falhou') { guarda.chave = chave; return true; } // sem a arte não há o que vestir
    if (pg.estado !== 'pronta') { atlas.pronta(pecas[0]); return false; }
  }
  const receitas = receitasDe(vestindo), copias = {};
  try {
    for (const i of usadas) {
      const pg = atlas.paginas[i], c = tela(pg.img.width, pg.img.height), g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(pg.img, 0, 0);
      copias[i] = { c, g, d: pg.d || 1, dados: g.getImageData(0, 0, c.width, c.height) };
    }
    for (const k of pecas) {
      const p = atlas.pecas[k];
      for (const f of guarda.originais[k]) {
        const cp = copias[f[0]], d = cp.d;
        const x0 = Math.max(0, Math.floor(f[1] * d)), y0 = Math.max(0, Math.floor(f[2] * d)), w = Math.min(cp.c.width - x0, Math.ceil(f[3] * d)), h = Math.min(cp.c.height - y0, Math.ceil(f[4] * d));
        if (w > 0 && h > 0) tingir(cp.dados.data, cp.c.width, x0, y0, w, h, { d, topo: f[6], apoio: p.apoio[1] }, receitas);
      }
    }
    for (const i of usadas) {
      const cp = copias[i], orig = atlas.paginas[i];
      cp.g.putImageData(cp.dados, 0, 0);
      let pequena = null;
      if (orig.pequena) { pequena = tela(Math.max(1, cp.c.width >> 1), Math.max(1, cp.c.height >> 1)); const gp = pequena.getContext('2d'); gp.imageSmoothingQuality = 'high'; gp.drawImage(cp.c, 0, 0, pequena.width, pequena.height); }
      if (guarda.extras[i] === undefined) { guarda.extras[i] = atlas.paginas.length; atlas.paginas.push({ arquivo: orig.arquivo + '#vestida', grupo: GRUPO + '-vestida', l: orig.l, a: orig.a, estado: 'pronta', img: cp.c, d: cp.d, pequena }); }
      else { const pg = atlas.paginas[guarda.extras[i]]; pg.img = cp.c; pg.d = cp.d; pg.pequena = pequena; }
    }
    for (const k of pecas) atlas.pecas[k].q = guarda.originais[k].map((f) => [guarda.extras[f[0]], f[1], f[2], f[3], f[4], f[5], f[6]]);
  } catch (e) {
    // navegador que não deixa ler os pontos da imagem: ela fica com a roupa de sempre
    console.warn('roupas: não deu para trocar as cores (' + (e && e.message) + ')');
    for (const k of pecas) atlas.pecas[k].q = guarda.originais[k];
  }
  guarda.chave = chave;
  return true;
}

// Desenha num canvas a personagem parada, de frente, com "vestindo" (para o guarda-roupa provar uma peça antes de
// comprar). Devolve false se a arte ainda não chegou.
export function desenharProva(atlas, canvas, vestindo, peca = 'personagem/parada-frente') {
  const p = atlas.pecas[peca], g = canvas.getContext('2d');
  g.clearRect(0, 0, canvas.width, canvas.height);
  if (!p) return false;
  const f = quadroOriginal(atlas, peca, 0), pg = atlas.paginas[f[0]];
  if (pg.estado !== 'pronta') { atlas.pronta(peca); return false; }
  const d = pg.d || 1, w = Math.max(1, Math.round(f[3] * d)), h = Math.max(1, Math.round(f[4] * d)), c = tela(w, h), gc = c.getContext('2d', { willReadFrequently: true });
  gc.drawImage(pg.img, f[1] * d, f[2] * d, f[3] * d, f[4] * d, 0, 0, w, h);
  const receitas = receitasDe(vestindo);
  if (receitas) {
    try { const dados = gc.getImageData(0, 0, w, h); tingir(dados.data, w, 0, 0, w, h, { d, topo: f[6], apoio: p.apoio[1] }, receitas); gc.putImageData(dados, 0, 0); } catch { /* fica a roupa de sempre */ }
  }
  const k = Math.min(canvas.width / w, canvas.height / h) * 0.96;
  g.imageSmoothingQuality = 'high';
  g.drawImage(c, (canvas.width - w * k) / 2, (canvas.height - h * k) / 2, w * k, h * k);
  return true;
}
