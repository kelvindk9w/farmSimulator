#!/usr/bin/env node
// Peças de arte parada do jogo: recebe a imagem crua do Codex, confere, apara, põe na escala do
// catálogo (128 px por unidade de mundo), grava em jogo/arte/<grupo>/ e escreve a entrada em
// jogo/arte/catalogo/<grupo>.json. Também separa folhas com vários itens e faz folhas de contato.
//
// Uso (da raiz do repositório):
//   node jogo/tools/arte/peca.mjs conferir <cru.png> [...]
//   node jogo/tools/arte/peca.mjs medir <cru.png>
//   node jogo/tools/arte/peca.mjs separar <cru.png> <pasta> --grade CxL --nomes a,b,c [--vao N]
//   node jogo/tools/arte/peca.mjs peca <cru.png> <chave> <tamanho> [opções]
//   node jogo/tools/arte/peca.mjs serie <cru.png> <prefixo> --grade CxL --nomes 1,2,3,4 --ref 4 <tamanho> [opções]
//   node jogo/tools/arte/peca.mjs icones <cru.png> --grade CxL --nomes enxada,regador,... [--prefixo icone]
//   node jogo/tools/arte/peca.mjs situacao <chave> pronto|pendente ["observação"]
//   node jogo/tools/arte/peca.mjs remover <chave>
//   node jogo/tools/arte/peca.mjs folha [grupo ...]
//   node jogo/tools/arte/peca.mjs guia <saida.png> --bloco LxPxH [--telhado R] [--porta LxA] [--toldo H] [--copias N]
//                                      (bloco cinza na câmera do jogo, para anexar ao pedido de uma construção)
//
// <tamanho> (um só):
//   --casas LxP        o objeto ocupa L por P casas; a base (ou a caixa) fica com --ocupacao da largura do losango
//   --largura U        largura do desenho na tela, em unidades (U x 128 px); um círculo de diâmetro U no chão tem essa largura
//   --altura U         altura real em unidades, medida do apoio até o topo (U x 104,5 px na tela)
//   --largo-px N | --alto-px N | --fator F     tamanho final direto
//   --caixa N          cabe num quadrado de N px (ícone 128, retrato 256), centrado
// Opções:
//   --ocupacao F       fração da largura do losango (padrão 0,94)
//   --por caixa|base   com --casas: medir pela caixa do desenho (padrão) ou pelo V da base (parede sem beiral)
//   --base D           diâmetro em unidades do contato com o chão; o apoio fica D x 37 px acima do pé do desenho
//                      (padrão: (L+P) x 0,7071 x ocupação com --casas; senão medido na faixa de baixo do desenho)
//   --cx base|caixa|F  onde fica o apoio na horizontal: centro da faixa de baixo, centro da caixa ou fração da largura
//   --apoio-pe N       apoio a N px do pé do desenho (em vez de --base)
//   --ancora centro|frente|pe    "centro" (padrão) é o centro da base; "pe" põe o apoio no pé do desenho
//   --footprint LxP    só para a ficha e a folha (casas ocupadas), quando o tamanho não veio de --casas
//   --pedido nome.md   --pendente "motivo"   --obs "texto"   --cisco N (área mínima de parte solta)
//   --manter-soltas    não apaga partes soltas pequenas
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const JOGO = path.resolve(AQUI, '../..');
const RAIZ = path.resolve(JOGO, '..');
const ARTE = path.join(JOGO, 'arte');
const CATALOGO = path.join(ARTE, 'catalogo');
const REGISTRO = path.join(RAIZ, 'arte/jogo/pecas.json');
const FOLHAS = path.join(RAIZ, 'arte/jogo/folhas');

const ESCALA = 128;
const MEIA_L = ESCALA * 0.70710678; // meia largura do losango de uma casa (90,5 px)
const MEIA_A = ESCALA * 0.40824829; // meia altura do losango de uma casa (52,3 px)
const ALTURA_PX = ESCALA * 0.81649658; // uma unidade para cima na tela (104,5 px)
const MARGEM = 8;
const GRUPOS = { objeto: 'objetos', cultura: 'culturas', arvore: 'arvores', icone: 'icones', retrato: 'retratos', ui: 'interface' };

function acharSharp() {
  for (const base of [path.join(JOGO, 'package.json'), path.join(RAIZ, 'prototypes/sitio-minimo/package.json')]) {
    if (!fs.existsSync(base)) continue;
    try { return createRequire(base)('sharp'); } catch { /* tenta o próximo */ }
  }
  throw new Error('sharp não encontrado (nem em jogo/ nem em prototypes/sitio-minimo/)');
}
const sharp = acharSharp();

// ---------- argumentos ----------
function lerArgs(argv) {
  const pos = [], op = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const nome = a.slice(2);
      const prox = argv[i + 1];
      if (prox === undefined || prox.startsWith('--')) op[nome] = true; else { op[nome] = prox; i++; }
    } else pos.push(a);
  }
  return { pos, op };
}
const par = (txt) => { const m = /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/.exec(String(txt)); if (!m) throw new Error(`esperava LxP, veio "${txt}"`); return [+m[1], +m[2]]; };

// ---------- imagem crua ----------
async function ler(arquivo) {
  const meta = await sharp(arquivo).metadata();
  const { data, info } = await sharp(arquivo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height, temAlfa: !!meta.hasAlpha, arquivo };
}
const alfa = (img, x, y) => img.data[(y * img.W + x) * 4 + 3];

function caixaDe(img, limiar = 24, x0 = 0, y0 = 0, x1 = img.W, y1 = img.H) {
  let a = x1, b = y1, c = -1, d = -1;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (alfa(img, x, y) > limiar) { if (x < a) a = x; if (x > c) c = x; if (y < b) b = y; if (y > d) d = y; }
  if (c < 0) return null;
  return { x0: a, y0: b, x1: c + 1, y1: d + 1, w: c + 1 - a, h: d + 1 - b };
}

// Partes ligadas (vizinhança de 8) com alfa acima do limiar.
function partes(img, limiar = 40) {
  const { W, H } = img, rot = new Int32Array(W * H), lista = [], pilha = [];
  for (let i = 0; i < W * H; i++) {
    if (rot[i] || img.data[i * 4 + 3] <= limiar) continue;
    const id = lista.length + 1; let area = 0, x0 = W, y0 = H, x1 = 0, y1 = 0;
    pilha.push(i); rot[i] = id;
    while (pilha.length) {
      const p = pilha.pop(), px = p % W, py = (p - px) / W; area++;
      if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = px + dx, ny = py + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx; if (!rot[q] && img.data[q * 4 + 3] > limiar) { rot[q] = id; pilha.push(q); }
      }
    }
    lista.push({ id, area, x0, y0, x1: x1 + 1, y1: y1 + 1 });
  }
  return { rot, lista };
}

// Apaga poeira (alfa quase zero) e ciscos (partes soltas pequenas). Devolve quantos ciscos saíram.
function limpar(img, { cisco = null, manter = false } = {}) {
  const d = img.data; let poeira = 0;
  for (let i = 3; i < d.length; i += 4) {
    if (d[i] > 0 && d[i] < 10) { d[i] = 0; poeira++; }
    if (d[i] === 0) { d[i - 3] = 0; d[i - 2] = 0; d[i - 1] = 0; } // sem cor escondida no transparente
    else if (d[i] >= 248) d[i] = 255; // o Codex às vezes entrega 254 no lugar de 255
  }
  const { rot, lista } = partes(img);
  if (!lista.length) return { ciscos: 0, soltas: 0, poeira };
  const total = lista.reduce((s, p) => s + p.area, 0);
  const minimo = cisco ?? Math.max(16, Math.round(total * 0.0004));
  const fora = new Set(manter ? [] : lista.filter((p) => p.area < minimo).map((p) => p.id));
  if (fora.size) for (let i = 0; i < rot.length; i++) if (fora.has(rot[i])) d[i * 4 + 3] = 0;
  return { ciscos: fora.size, soltas: lista.length - fora.size - 1, poeira, minimo };
}

// Confere a imagem crua. Devolve erros (não serve) e avisos (olhar).
function conferir(img) {
  const erros = [], avisos = [], { W, H } = img;
  if (!img.temAlfa) erros.push('sem canal alfa');
  const canto = (cx, cy) => { let m = 0; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) m = Math.max(m, alfa(img, cx ? W - 1 - x : x, cy ? H - 1 - y : y)); return m; };
  const cantos = [canto(0, 0), canto(1, 0), canto(0, 1), canto(1, 1)];
  if (cantos.some((c) => c > 8)) erros.push(`canto não transparente (alfa ${cantos.join(', ')})`);
  let cheio = 0, meio = 0, vazio = 0;
  for (let i = 3; i < img.data.length; i += 4) { const a = img.data[i]; if (a >= 160) cheio++; else if (a >= 10) meio++; else vazio++; }
  if (vazio / (W * H) < 0.12) erros.push(`quase não há transparência (${(100 * vazio / (W * H)).toFixed(0)}%)`);
  const cx = caixaDe(img);
  if (!cx) { erros.push('imagem vazia'); return { erros, avisos }; }
  const toca = [];
  if (cx.x0 <= 1) toca.push('esquerda'); if (cx.y0 <= 1) toca.push('cima'); if (cx.x1 >= W - 1) toca.push('direita'); if (cx.y1 >= H - 1) toca.push('baixo');
  if (toca.length) erros.push(`o desenho toca a borda (${toca.join(', ')}): pode estar cortado`);
  const nevoa = meio / Math.max(1, cheio);
  if (nevoa > 0.12) avisos.push(`muita meia-transparência (${(100 * nevoa).toFixed(0)}% do desenho): sombra ou brilho?`);
  return { erros, avisos, caixa: cx, nevoa };
}

// Mede o V da base de uma construção: o canto da frente é o ponto mais baixo; os dois braços sobem
// para os lados com a inclinação da câmera (0,577 na isométrica verdadeira).
function medirBase(img, cx = caixaDe(img, 128)) {
  if (!cx) return null;
  const baixo = new Int32Array(img.W).fill(-1);
  for (let x = cx.x0; x < cx.x1; x++) for (let y = cx.y1 - 1; y >= cx.y0; y--) if (alfa(img, x, y) >= 128) { baixo[x] = y; break; }
  let yb = -1; for (let x = cx.x0; x < cx.x1; x++) if (baixo[x] > yb) yb = baixo[x];
  const noFundo = []; for (let x = cx.x0; x < cx.x1; x++) if (baixo[x] >= yb - 1) noFundo.push(x);
  const xb = noFundo[Math.floor(noFundo.length / 2)];
  const tol = Math.max(5, cx.w * 0.014), falhas = Math.max(6, Math.round(cx.w * 0.03));
  const braco = (sentido) => {
    const razoes = [];
    for (let k = Math.round(cx.w * 0.04); k <= Math.round(cx.w * 0.22); k++) { const x = xb + sentido * k; if (x < cx.x0 || x >= cx.x1 || baixo[x] < 0) break; razoes.push((yb - baixo[x]) / k); }
    if (razoes.length < 8) return null;
    razoes.sort((a, b) => a - b); const m = razoes[Math.floor(razoes.length / 2)];
    let fim = xb, ruins = 0;
    for (let k = 1; ; k++) { const x = xb + sentido * k; if (x < cx.x0 || x >= cx.x1) break; if (baixo[x] >= 0 && Math.abs(baixo[x] - (yb - m * k)) <= tol) { fim = x; ruins = 0; } else if (++ruins > falhas) break; }
    return { m, fim };
  };
  const e = braco(-1), d = braco(1);
  if (!e || !d) return { ok: false, xb, yb };
  const largura = d.fim - e.fim;
  const ok = e.m > 0.42 && e.m < 0.75 && d.m > 0.42 && d.m < 0.75 && (xb - e.fim) > cx.w * 0.12 && (d.fim - xb) > cx.w * 0.12;
  return { ok, xb, yb, xe: e.fim, xd: d.fim, largura, inclEsq: e.m, inclDir: d.m };
}

// Faixa de baixo do desenho (os 10% de baixo): onde ele encosta no chão.
function faixaDeBaixo(img, cx) {
  const alto = Math.max(6, Math.round(cx.h * 0.1));
  let a = img.W, b = -1;
  for (let y = cx.y1 - alto; y < cx.y1; y++) for (let x = cx.x0; x < cx.x1; x++) if (alfa(img, x, y) >= 128) { if (x < a) a = x; if (x > b) b = x; }
  if (b < 0) return { x0: cx.x0, x1: cx.x1, w: cx.w };
  return { x0: a, x1: b + 1, w: b + 1 - a };
}

// Separa uma grade de C colunas por L linhas pelos maiores vãos transparentes.
function separarGrade(img, colunas, linhas, vaoMinimo = 6) {
  const tudo = caixaDe(img); if (!tudo) throw new Error('imagem vazia');
  const cortes = (ini, fim, tem, quantos, eixo) => {
    const vaos = []; let a = -1;
    for (let i = ini; i <= fim; i++) { const cheio = i < fim && tem(i); if (!cheio && i < fim) { if (a < 0) a = i; } else if (a >= 0) { if (a > ini && i < fim) vaos.push([a, i]); a = -1; } }
    vaos.sort((p, q) => (q[1] - q[0]) - (p[1] - p[0]));
    if (vaos.length < quantos) throw new Error(`faltam vãos ${eixo}: achei ${vaos.length}, preciso de ${quantos}`);
    const usados = vaos.slice(0, quantos), menor = quantos ? usados[quantos - 1][1] - usados[quantos - 1][0] : Infinity;
    const sobra = vaos[quantos] ? vaos[quantos][1] - vaos[quantos][0] : 0;
    if (menor < vaoMinimo) throw new Error(`vão ${eixo} pequeno demais (${menor} px)`);
    usados.sort((p, q) => p[0] - q[0]);
    const faixas = []; let c = ini; for (const [p, q] of usados) { faixas.push([c, p]); c = q; } faixas.push([c, fim]);
    return { faixas, menor, sobra };
  };
  const temLinha = (y) => { for (let x = tudo.x0; x < tudo.x1; x++) if (alfa(img, x, y) > 24) return true; return false; };
  const lin = cortes(tudo.y0, tudo.y1, temLinha, linhas - 1, 'entre linhas');
  const celulas = [], notas = [];
  if (linhas > 1) notas.push(`linhas: menor vão usado ${lin.menor} px, maior vão de dentro ${lin.sobra} px`);
  for (const [ya, yb] of lin.faixas) {
    const temColuna = (x) => { for (let y = ya; y < yb; y++) if (alfa(img, x, y) > 24) return true; return false; };
    const col = cortes(tudo.x0, tudo.x1, temColuna, colunas - 1, 'entre colunas');
    notas.push(`colunas: menor vão usado ${col.menor} px, maior vão de dentro ${col.sobra} px${col.sobra > col.menor * 0.6 ? '  <-- conferir' : ''}`);
    for (const [xa, xb] of col.faixas) celulas.push(caixaDe(img, 24, xa, ya, xb, yb));
  }
  return { celulas, notas };
}

function recorte(img, c) {
  const data = Buffer.alloc(c.w * c.h * 4);
  for (let y = 0; y < c.h; y++) img.data.copy(data, y * c.w * 4, ((c.y0 + y) * img.W + c.x0) * 4, ((c.y0 + y) * img.W + c.x1) * 4);
  return { data, W: c.w, H: c.h, temAlfa: true, arquivo: img.arquivo };
}
const paraPng = (img) => sharp(img.data, { raw: { width: img.W, height: img.H, channels: 4 } }).png();

// ---------- catálogo e registro ----------
function grupoDe(chave) {
  const [tipo, ...resto] = chave.split('/'); const grupo = GRUPOS[tipo];
  if (!grupo || !resto.length) throw new Error(`chave fora do padrão: ${chave} (use ${Object.keys(GRUPOS).join(', ')})`);
  return { grupo, nome: resto.join('-') };
}
function lerCatalogo(grupo) {
  const arq = path.join(CATALOGO, `${grupo}.json`);
  return fs.existsSync(arq) ? JSON.parse(fs.readFileSync(arq, 'utf8')) : { escala: ESCALA, pecas: {} };
}
function gravarCatalogo(grupo, cat) {
  fs.mkdirSync(CATALOGO, { recursive: true });
  const chaves = Object.keys(cat.pecas).sort((a, b) => a.localeCompare(b, 'pt', { numeric: true }));
  const linhas = chaves.map((k) => `    ${JSON.stringify(k)}: ${JSON.stringify(cat.pecas[k]).replace(/:/g, ': ').replace(/,/g, ', ').replace(/^\{/, '{ ').replace(/\}$/, ' }')}`);
  fs.writeFileSync(path.join(CATALOGO, `${grupo}.json`), `{\n  "escala": ${cat.escala ?? ESCALA},\n  "pecas": {\n${linhas.join(',\n')}\n  }\n}\n`);
}
const lerRegistro = () => (fs.existsSync(REGISTRO) ? JSON.parse(fs.readFileSync(REGISTRO, 'utf8')) : {});
function gravarRegistro(reg) {
  fs.mkdirSync(path.dirname(REGISTRO), { recursive: true });
  const ord = {}; for (const k of Object.keys(reg).sort((a, b) => a.localeCompare(b, 'pt', { numeric: true }))) ord[k] = reg[k];
  fs.writeFileSync(REGISTRO, `{\n${Object.entries(ord).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')}\n}\n`);
}

// ---------- fazer uma peça ----------
// img: imagem crua já limpa (um item só). Devolve o resumo do que gravou.
async function fazerPeca(img, chave, op, fatorDado = null) {
  const { grupo, nome } = grupoDe(chave);
  const cx = caixaDe(img); if (!cx) throw new Error(`${chave}: imagem vazia`);
  const casas = op.casas ? par(op.casas) : null;
  const ocup = op.ocupacao ? +op.ocupacao : 0.94;
  const base = medirBase(img, caixaDe(img, 128));
  const faixa = faixaDeBaixo(img, cx);
  const notas = [];
  let fator, final;

  if (op.caixa) {
    // ícone ou retrato: cabe no quadrado, centrado (retrato: encostado embaixo)
    const N = +op.caixa, util = N - 2 * MARGEM;
    fator = Math.min(util / cx.w, util / cx.h);
    const w = Math.max(1, Math.round(cx.w * fator)), h = Math.max(1, Math.round(cx.h * fator));
    const pe = op.ancora === 'pe';
    const left = Math.round((N - w) / 2), top = pe ? N - MARGEM - h : Math.round((N - h) / 2);
    const peca = await paraPng(recorte(img, cx)).resize(w, h, { kernel: 'lanczos3' }).toBuffer();
    final = { buf: await sharp({ create: { width: N, height: N, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: peca, left, top }]).png().toBuffer(), w: N, h: N, apoio: pe ? [N / 2, N - MARGEM] : [N / 2, N / 2] };
  } else {
    // contato com o chão, em px da imagem crua, e o fator de escala
    let baseCrua = null; // largura do contato com o chão na imagem crua
    if (fatorDado) fator = fatorDado;
    else if (op.fator) fator = +op.fator;
    else if (casas) {
      const alvo = (casas[0] + casas[1]) * MEIA_L * ocup;
      if (op.por === 'base') { if (!base?.ok) throw new Error(`${chave}: não achei o V da base; use --por caixa`); fator = alvo / base.largura; baseCrua = base.largura; } else fator = alvo / cx.w;
    } else if (op.largura) fator = (+op.largura * ESCALA) / cx.w;
    else if (op['largo-px']) fator = +op['largo-px'] / cx.w;
    else if (op['alto-px']) fator = +op['alto-px'] / cx.h;
    else if (op.altura) {
      // altura do apoio ao topo = U x 104,5; o apoio fica (base x 37 px) acima do pé
      if (op['apoio-pe'] !== undefined) fator = (+op.altura * ALTURA_PX + +op['apoio-pe']) / cx.h;
      else if (op.base) fator = (+op.altura * ALTURA_PX + +op.base * ESCALA * 0.288675) / cx.h;
      else fator = (+op.altura * ALTURA_PX) / (cx.h - faixa.w * 0.288675);
    } else throw new Error(`${chave}: faltou o tamanho (--casas, --largura, --altura, --largo-px, --alto-px, --fator ou --caixa)`);

    const w = Math.max(1, Math.round(cx.w * fator)), h = Math.max(1, Math.round(cx.h * fator));
    // apoio
    let sobe; // px do pé do desenho até o apoio, já na escala final
    if (op.ancora === 'pe') sobe = 0;
    else if (op['apoio-pe'] !== undefined) sobe = +op['apoio-pe'];
    else if (op.base) sobe = +op.base * ESCALA * 0.288675;
    else if (casas) sobe = (baseCrua ? baseCrua * fator : (casas[0] + casas[1]) * MEIA_L * (base?.ok && op.por !== 'caixa-cheia' ? Math.min(ocup, (base.largura * fator) / ((casas[0] + casas[1]) * MEIA_L)) : ocup)) * 0.288675;
    else sobe = faixa.w * fator * 0.288675;
    if (op.ancora === 'frente') sobe = 0;
    let fx;
    const modoCx = op.cx ?? (casas ? (base?.ok ? 'vbase' : 'caixa') : 'base');
    if (modoCx === 'caixa') fx = 0.5;
    else if (modoCx === 'vbase' && base?.ok) fx = ((base.xe + base.xd) / 2 - cx.x0) / cx.w;
    else if (modoCx === 'base' || modoCx === 'vbase') fx = ((faixa.x0 + faixa.x1) / 2 - cx.x0) / cx.w;
    else fx = +modoCx;
    const peca = await paraPng(recorte(img, cx)).resize(w, h, { kernel: 'lanczos3' }).toBuffer();
    const W2 = w + 2 * MARGEM, H2 = h + 2 * MARGEM;
    final = { buf: await sharp({ create: { width: W2, height: H2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: peca, left: MARGEM, top: MARGEM }]).png().toBuffer(), w: W2, h: H2, apoio: [Math.round(MARGEM + fx * w), Math.round(MARGEM + h - sobe)] };
    if (base?.ok) notas.push(`base em V: ${Math.round(base.largura * fator)} px, inclinação ${base.inclEsq.toFixed(2)} / ${base.inclDir.toFixed(2)} (câmera certa: 0,58)`);
    if (casas) notas.push(`losango de ${casas[0]}x${casas[1]}: ${Math.round((casas[0] + casas[1]) * MEIA_L)} px; desenho com ${w} px`);
  }
  if (fator > 1.25) notas.push(`ATENÇÃO: ampliada ${fator.toFixed(2)}x (a crua é pequena)`);

  const rel = `${grupo}/${nome}.png`;
  fs.mkdirSync(path.join(ARTE, grupo), { recursive: true });
  fs.writeFileSync(path.join(ARTE, rel), final.buf);
  const cat = lerCatalogo(grupo);
  const entrada = { arquivo: rel, quadros: 1, casa: [final.w, final.h], apoio: final.apoio };
  if (op.ancora && op.ancora !== 'centro' && !op.caixa) entrada.ancora = op.ancora;
  cat.pecas[chave] = entrada; gravarCatalogo(grupo, cat);
  const reg = lerRegistro();
  const fp = op.footprint ? par(op.footprint) : casas;
  reg[chave] = { situacao: op.pendente ? 'pendente' : 'pronto', ...(fp ? { casas: fp } : {}), tamanho: tamanhoDito(op), pedido: op.pedido ?? reg[chave]?.pedido ?? '', cru: path.relative('/root/arte-codex', img.arquivo), fator: +fator.toFixed(3), ...(op.pendente ? { obs: String(op.pendente) } : op.obs ? { obs: String(op.obs) } : {}) };
  gravarRegistro(reg);
  console.log(`  ${chave}: ${final.w}x${final.h}, apoio ${final.apoio.join(',')}, fator ${fator.toFixed(3)}${notas.length ? '\n    ' + notas.join('\n    ') : ''}`);
  return { chave, fator, ...final };
}
function tamanhoDito(op) {
  for (const k of ['casas', 'largura', 'altura', 'largo-px', 'alto-px', 'fator', 'caixa']) if (op[k] !== undefined) return `${k} ${op[k]}`;
  return '';
}

// Fator para o item de referência de uma série (os outros usam o mesmo).
function fatorDaReferencia(img, op) {
  const cx = caixaDe(img), faixa = faixaDeBaixo(img, cx);
  let f;
  if (op.casas) { const c = par(op.casas); f = ((c[0] + c[1]) * MEIA_L * (op.ocupacao ? +op.ocupacao : 0.94)) / cx.w; }
  else if (op.largura) f = (+op.largura * ESCALA) / cx.w;
  else if (op['largo-px']) f = +op['largo-px'] / cx.w;
  else if (op['alto-px']) f = +op['alto-px'] / cx.h;
  else if (op.altura) f = op['apoio-pe'] !== undefined ? (+op.altura * ALTURA_PX + +op['apoio-pe']) / cx.h : op.base ? (+op.altura * ALTURA_PX + +op.base * ESCALA * 0.288675) / cx.h : (+op.altura * ALTURA_PX) / (cx.h - faixa.w * 0.288675);
  else if (op.fator) f = +op.fator;
  else throw new Error('série: faltou o tamanho da referência');
  if (op['max-largura']) f = Math.min(f, (+op['max-largura'] * ESCALA) / cx.w);
  return f;
}

function relatar(arquivo, r, limpeza) {
  const partes2 = [];
  if (limpeza?.ciscos) partes2.push(`${limpeza.ciscos} cisco(s) apagado(s)`);
  if (limpeza?.soltas) partes2.push(`${limpeza.soltas} parte(s) solta(s) mantida(s)`);
  console.log(`${path.basename(arquivo)}: ${r.erros.length ? 'REPROVADA' : 'ok'}${r.caixa ? ` (desenho ${r.caixa.w}x${r.caixa.h})` : ''}${partes2.length ? '; ' + partes2.join('; ') : ''}`);
  for (const e of r.erros) console.log(`  ERRO: ${e}`);
  for (const a of r.avisos) console.log(`  aviso: ${a}`);
}

async function abrir(arquivo, op) {
  const img = await ler(arquivo);
  const r = conferir(img);
  const limpeza = limpar(img, { cisco: op.cisco ? +op.cisco : null, manter: !!op['manter-soltas'] });
  relatar(arquivo, r, limpeza);
  if (r.erros.length && !op.forcar) throw new Error(`${arquivo}: não passou na conferência (use --forcar para gravar assim mesmo)`);
  return img;
}

// ---------- folhas de contato ----------
const escXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
async function folha(grupo) {
  const cat = lerCatalogo(grupo), reg = lerRegistro();
  const chaves = Object.keys(cat.pecas).sort((a, b) => a.localeCompare(b, 'pt', { numeric: true }));
  if (!chaves.length) { console.log(`${grupo}: catálogo vazio`); return; }
  const esc = { objetos: 0.5, culturas: 0.75, arvores: 0.5, icones: 0.75, retratos: 0.75, interface: 0.5 }[grupo] ?? 0.5;
  const mini = grupo === 'icones' ? 0.25 : esc / 2;
  const itens = [];
  for (const k of chaves) {
    const e = cat.pecas[k], arq = path.join(ARTE, e.arquivo); if (!fs.existsSync(arq)) continue;
    const w = Math.max(1, Math.round(e.casa[0] * esc)), h = Math.max(1, Math.round(e.casa[1] * esc));
    const w2 = Math.max(1, Math.round(e.casa[0] * mini)), h2 = Math.max(1, Math.round(e.casa[1] * mini));
    itens.push({ k, e, w, h, w2, h2, buf: await sharp(arq).resize(w, h).png().toBuffer(), buf2: await sharp(arq).resize(w2, h2).png().toBuffer(), casas: reg[k]?.casas ?? (grupo === 'culturas' || grupo === 'arvores' ? [1, 1] : null), pend: reg[k]?.situacao === 'pendente' });
  }
  // paginação: linhas de até 1560 px, páginas de até ~1000 px de altura por painel
  const LARG = 1600, PAD = 14, ROT = 30, paginas = [[]]; let x = PAD, y = PAD, altoLinha = 0;
  for (const it of itens) {
    const cw = Math.max(it.w + it.w2 + 10, Math.min(260, it.k.length * 8 + 10)) + PAD, ch = it.h + ROT + PAD;
    if (x + cw > LARG) { x = PAD; y += altoLinha; altoLinha = 0; }
    if (y + ch > 1050 && paginas[paginas.length - 1].length) { paginas.push([]); x = PAD; y = PAD; altoLinha = 0; }
    paginas[paginas.length - 1].push({ ...it, x, y, cw, ch }); x += cw; altoLinha = Math.max(altoLinha, ch);
  }
  fs.mkdirSync(FOLHAS, { recursive: true });
  for (const f of fs.readdirSync(FOLHAS)) if (new RegExp(`^${grupo}(-\\d+)?\\.png$`).test(f)) fs.unlinkSync(path.join(FOLHAS, f));
  for (let p = 0; p < paginas.length; p++) {
    const pag = paginas[p], alto = Math.max(...pag.map((c) => c.y + c.ch)) + PAD;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARG}" height="${alto * 2}"><rect width="${LARG}" height="${alto}" fill="#7fc23c"/><rect y="${alto}" width="${LARG}" height="${alto}" fill="#f4ecd8"/>`;
    const comp = [];
    for (const c of pag) for (const painel of [0, 1]) {
      const ox = c.x, oy = c.y + painel * alto;
      if (c.casas && painel === 0) {
        const [L, P] = c.casas, ax = ox + c.e.apoio[0] * esc, ay = oy + c.e.apoio[1] * esc;
        const pt = (i, j) => `${(ax + ((i - L / 2) - (j - P / 2)) * MEIA_L * esc).toFixed(1)},${(ay + ((i - L / 2) + (j - P / 2)) * MEIA_A * esc).toFixed(1)}`;
        const cor = grupo === 'culturas' ? '#8a5a2b' : '#5fa52c';
        svg += `<polygon points="${pt(0, 0)} ${pt(L, 0)} ${pt(L, P)} ${pt(0, P)}" fill="${cor}" stroke="#2f5d17" stroke-width="1.5"/>`;
        for (let i = 1; i < L; i++) svg += `<polyline points="${pt(i, 0)} ${pt(i, P)}" stroke="#2f5d17" stroke-width="0.6" fill="none"/>`;
        for (let j = 1; j < P; j++) svg += `<polyline points="${pt(0, j)} ${pt(L, j)}" stroke="#2f5d17" stroke-width="0.6" fill="none"/>`;
      }
      comp.push({ input: c.buf, left: ox, top: oy });
      comp.push({ input: c.buf2, left: ox + c.w + 10, top: oy + c.h - c.h2 });
      svg += `<text x="${ox}" y="${oy + c.h + 20}" font-family="DejaVu Sans, sans-serif" font-size="14" fill="${c.pend ? '#b00020' : '#1c1c1c'}">${escXml(c.k.replace(/^[a-z]+\//, ''))}${c.pend ? ' (pendente)' : ''}</text>`;
    }
    svg += '</svg>';
    const nome = path.join(FOLHAS, paginas.length > 1 ? `${grupo}-${p + 1}.png` : `${grupo}.png`);
    await sharp(Buffer.from(svg)).composite(comp).png().toFile(nome);
    console.log(`folha: ${path.relative(RAIZ, nome)} (${pag.length} peças)`);
  }
}

// ---------- bloco-guia ----------
// Desenha por código um bloco cinza na câmera exata do jogo, para anexar ao pedido: o Codex desenha a
// construção em cima dele e a base sai no losango certo. Não é arte: é só a régua.
//   guia <saida.png> --bloco LxPxH [--telhado R] [--beiral B] [--porta LxA] [--toldo H] [--copias N] [--tela LxA] [--casas LxP]
async function guia(saida, op) {
  const [L, P, H] = String(op.bloco).split('x').map(Number);
  const R = op.telhado ? +op.telhado : 0, B = op.beiral ? +op.beiral : 0.18, copias = op.copias ? +op.copias : 1;
  const [TW, TH] = op.tela ? par(op.tela) : copias > 1 ? [1536, 1024] : [1254, 1254];
  const toldo = op.toldo ? +op.toldo : 0, topo = Math.max(H + R, toldo + 0.15);
  // escala: o bloco (com beiral) ocupa 78% da largura da sua parte ou 80% da altura
  const largU = (L + P + 2 * B) * 0.70710678, altU = (L + P) * 0.40824829 + topo * 0.81649658 + 0.2;
  const parte = TW / copias, E = Math.min((parte * 0.78) / largU, (TH * 0.8) / altU);
  const k = E * 0.70710678, m = E * 0.40824829, v = E * 0.81649658;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${TH}">`;
  for (let c = 0; c < copias; c++) {
    // origem: o centro da base cai no centro da parte, um pouco abaixo do meio
    const cx = parte * (c + 0.5), cy = TH / 2 + (topo * v) / 2;
    const pj = (x, y, z) => `${(cx + ((x - L / 2) - (z - P / 2)) * k).toFixed(1)},${(cy + ((x - L / 2) + (z - P / 2)) * m - y * v).toFixed(1)}`;
    const pol = (pts, cor, extra = '') => { svg += `<polygon points="${pts.map((p) => pj(...p)).join(' ')}" fill="${cor}" stroke="#4a4a4a" stroke-width="3" stroke-linejoin="round" ${extra}/>`; };
    if (op.casas) { const [cl, cp] = par(op.casas), dx = (cl - L) / 2, dz = (cp - P) / 2; pol([[-dx, 0, -dz], [L + dx, 0, -dz], [L + dx, 0, P + dz], [-dx, 0, P + dz]], 'none', 'stroke-dasharray="10 8"'); }
    if (R) {
      const cai = (B * R) / (L / 2); // quanto o beiral desce
      pol([[0, 0, P], [L, 0, P], [L, H, P], [L / 2, H + R, P], [0, H, P]], '#d6d6d6'); // fachada (empena), face da esquerda
      pol([[L, 0, P], [L, 0, 0], [L, H, 0], [L, H, P]], '#a9a9a9'); // parede da direita
      pol([[L / 2, H + R, P + B], [L / 2, H + R, -B], [-B, H - cai, -B], [-B, H - cai, P + B]], '#8a8a8a'); // água de trás
      pol([[L / 2, H + R, P + B], [L / 2, H + R, -B], [L + B, H - cai, -B], [L + B, H - cai, P + B]], '#bdbdbd'); // água da frente
    } else {
      pol([[0, 0, P], [L, 0, P], [L, H, P], [0, H, P]], '#d6d6d6');
      pol([[L, 0, P], [L, 0, 0], [L, H, 0], [L, H, P]], '#a9a9a9');
      pol([[0, H, 0], [L, H, 0], [L, H, P], [0, H, P]], '#eaeaea');
    }
    if (op.porta) { const [pl, pa] = par(op.porta); const x0 = (L - pl) / 2; pol([[x0, 0, P], [x0 + pl, 0, P], [x0 + pl, pa, P], [x0, pa, P]], '#f4f4f4'); }
    if (toldo) {
      for (const [x, z] of [[0, 0], [L, 0], [0, P], [L, P]]) svg += `<polyline points="${pj(x, H, z)} ${pj(x, toldo, z)}" stroke="#4a4a4a" stroke-width="7" stroke-linecap="round"/>`;
      pol([[-B, toldo, -B], [L + B, toldo, -B], [L + B, toldo, P + B], [-B, toldo, P + B]], '#c4c4c4');
      pol([[-B, toldo, P + B], [L + B, toldo, P + B], [L + B, toldo - 0.3, P + B], [-B, toldo - 0.3, P + B]], '#dedede');
      pol([[L + B, toldo, P + B], [L + B, toldo, -B], [L + B, toldo - 0.3, -B], [L + B, toldo - 0.3, P + B]], '#b0b0b0');
    }
  }
  svg += '</svg>';
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(saida);
  console.log(`guia: ${saida} (${TW}x${TH}, ${E.toFixed(0)} px por unidade)`);
}

// ---------- comandos ----------
const [comando, ...resto] = process.argv.slice(2);
const { pos, op } = lerArgs(resto);
try {
  if (comando === 'conferir') {
    let ruim = 0;
    for (const arq of pos) { const img = await ler(arq); const r = conferir(img); const l = limpar(img, { manter: true }); relatar(arq, r, l); if (r.erros.length) ruim++; }
    process.exitCode = ruim ? 1 : 0;
  } else if (comando === 'medir') {
    for (const arq of pos) {
      const img = await ler(arq); limpar(img); const cx = caixaDe(img), b = medirBase(img, caixaDe(img, 128)), f = faixaDeBaixo(img, cx);
      console.log(`${path.basename(arq)}: imagem ${img.W}x${img.H}, desenho ${cx.w}x${cx.h}, faixa de baixo ${f.w} px` + (b?.ok ? `, base em V ${b.largura} px (inclinação ${b.inclEsq.toFixed(2)} / ${b.inclDir.toFixed(2)}), canto da frente a ${((b.xb - b.xe) / b.largura).toFixed(2)} da largura` : ', sem V de base'));
    }
  } else if (comando === 'separar') {
    const [arq, pasta] = pos; const [C, L] = par(op.grade); const nomes = String(op.nomes).split(',');
    const img = await abrir(arq, op); const { celulas, notas } = separarGrade(img, C, L, op.vao ? +op.vao : 6);
    notas.forEach((n) => console.log('  ' + n));
    fs.mkdirSync(pasta, { recursive: true });
    for (let i = 0; i < celulas.length; i++) { if (!nomes[i] || nomes[i] === '-') continue; const c = celulas[i], m = 12; const sub = recorte(img, c); await paraPng(sub).extend({ top: m, bottom: m, left: m, right: m, background: { r: 0, g: 0, b: 0, alpha: 0 } }).toFile(path.join(pasta, `${nomes[i]}.png`)); console.log(`  ${nomes[i]}.png: ${c.w}x${c.h}`); }
  } else if (comando === 'peca') {
    const [arq, chave] = pos; const img = await abrir(arq, op); await fazerPeca(img, chave, op);
  } else if (comando === 'serie') {
    const [arq, prefixo] = pos; const [C, L] = par(op.grade); const nomes = String(op.nomes).split(',');
    const img = await abrir(arq, op); const { celulas, notas } = separarGrade(img, C, L, op.vao ? +op.vao : 6);
    notas.forEach((n) => console.log('  ' + n));
    const iRef = Math.max(0, nomes.indexOf(String(op.ref ?? nomes[nomes.length - 1])));
    const subs = celulas.map((c) => recorte(img, c));
    const fator = fatorDaReferencia(subs[iRef], op);
    for (let i = 0; i < subs.length; i++) { if (!nomes[i] || nomes[i] === '-') continue; await fazerPeca(subs[i], `${prefixo}-${nomes[i]}`, op, fator); }
  } else if (comando === 'icones') {
    const [arq] = pos; const [C, L] = par(op.grade); const nomes = String(op.nomes).split(','); const prefixo = op.prefixo ?? 'icone';
    const img = await abrir(arq, op); const { celulas, notas } = separarGrade(img, C, L, op.vao ? +op.vao : 6);
    notas.forEach((n) => console.log('  ' + n));
    for (let i = 0; i < celulas.length; i++) { if (!nomes[i] || nomes[i] === '-') continue; await fazerPeca(recorte(img, celulas[i]), `${prefixo}/${nomes[i]}`, { ...op, caixa: op.caixa ?? 128 }); }
  } else if (comando === 'situacao') {
    const [chave, situacao, obs] = pos; const reg = lerRegistro(); if (!reg[chave]) throw new Error(`não há ${chave} no registro`);
    reg[chave].situacao = situacao; if (obs) reg[chave].obs = obs; else delete reg[chave].obs; gravarRegistro(reg); console.log(`${chave}: ${situacao}`);
  } else if (comando === 'remover') {
    for (const chave of pos) { const { grupo } = grupoDe(chave); const cat = lerCatalogo(grupo); const e = cat.pecas[chave]; if (e) { fs.rmSync(path.join(ARTE, e.arquivo), { force: true }); delete cat.pecas[chave]; gravarCatalogo(grupo, cat); } const reg = lerRegistro(); delete reg[chave]; gravarRegistro(reg); console.log(`removida: ${chave}`); }
  } else if (comando === 'guia') {
    await guia(pos[0], op);
  } else if (comando === 'folha') {
    const grupos = pos.length ? pos : Object.values(GRUPOS).filter((g) => fs.existsSync(path.join(CATALOGO, `${g}.json`)));
    for (const g of grupos) await folha(g);
  } else {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 35).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    process.exitCode = comando ? 2 : 0;
  }
} catch (e) { console.error(`ERRO: ${e.message}`); process.exitCode = 1; }
