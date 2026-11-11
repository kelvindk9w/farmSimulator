// Gera TODAS as imagens finais em docs/referencias-visuais (2x: deviceScaleFactor 2).
// Uso: node scripts/render.mjs [filtro]   (ex.: node scripts/render.mjs A1)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { openPage, root, outDir } from './browser.mjs';

const filtro = process.argv[2] || '';
fs.mkdirSync(outDir, { recursive: true });
const medidasPath = path.join(root, 'dist/medidas.json');
const M = fs.existsSync(medidasPath) ? JSON.parse(fs.readFileSync(medidasPath, 'utf8')) : null;

const br = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
function medidasAvatar() {
  const a = M.avatar, vis = Object.entries(a.visuais).filter(([k]) => k !== 'base').map(([, v]) => v.otimizadoGzipKB);
  return { tri: a.info.triangulos.toLocaleString('pt-BR'), malha: br(a.soMalha.otimizadoGzipKB), anim: br(a.animacoesOtimizadasGzipKB), min: br(Math.min(...vis)), max: br(Math.max(...vis)) };
}

// arquivo, shot, viewport (css px), opções, título e legenda (pt-BR) usados na visão geral e no README
export const IMAGENS = [
  { g: 'A', arquivo: 'A1-3d-isometrica-paisagem.png', shot: 'cenaA', w: 1920, h: 1080, titulo: 'A1 · 3D, câmera fixa isométrica (paisagem)', legenda: 'A fazenda em 3D low-poly com câmera ortográfica fixa e HUD. É a opção recomendada.' },
  { g: 'A', arquivo: 'A2-3d-isometrica-retrato.png', shot: 'cenaA', w: 1080, h: 1920, titulo: 'A2 · 3D isométrica (retrato)', legenda: 'A mesma cena no celular em pé, com o HUD reorganizado.' },
  { g: 'B', arquivo: 'B1-3d-perspectiva-paisagem.png', shot: 'cenaB', w: 1920, h: 1080, titulo: 'B1 · 3D, câmera próxima em perspectiva (paisagem)', legenda: 'A mesma fazenda vista de cima e de trás da Bia, com céu e horizonte.' },
  { g: 'B', arquivo: 'B2-3d-perspectiva-retrato.png', shot: 'cenaB', w: 1080, h: 1920, titulo: 'B2 · 3D em perspectiva (retrato)', legenda: 'A câmera próxima no celular em pé, com controle por alavanca virtual.' },
  { g: 'C', arquivo: 'C1-2d-folha-de-sprites.png', shot: 'folhaSprites', w: 1920, h: 1080, auto: true, titulo: 'C1 · Folha de sprites: 8 direções × caminhada', legenda: 'O avatar pré-renderizado; indica o que é render de verdade e o que é cópia espelhada.' },
  { g: 'C', arquivo: 'C2-2d-cena-por-sprites.png', shot: 'cena2D', w: 1920, h: 1080, titulo: 'C2 · Cena 2D montada só com sprites', legenda: 'Ladrilhos, objetos e personagens pré-renderizados, compostos em 2D por ordem de profundidade.' },
  { g: 'C', arquivo: 'C3-2d-atlas-do-cenario.png', shot: 'atlas2D', w: 1920, h: 1080, auto: true, opts: () => ({ pngMB: M?.cena2D?.pngMB }), titulo: 'C3 · Atlas do cenário 2D', legenda: 'Todas as imagens que a cena C2 precisou guardar.' },
  { g: 'C', arquivo: 'C4-comparacao-zoom-3d-x-2d.png', shot: 'comparacaoZoom', w: 1920, h: 1080, titulo: 'C4 · Zoom de 3×: 3D ao lado de 2D', legenda: 'O 3D continua nítido; os sprites, feitos para um zoom só, borram.' },
  { g: 'D', arquivo: 'D1-personagem-poses.png', shot: 'folhaPoses', w: 1920, h: 1080, auto: true, titulo: 'D1 · Personagem: 10 poses em 4 vistas', legenda: 'Parado, andar, correr, pular, agachar, sentar, deitar, regar, colher e carregar caixa.' },
  { g: 'D', arquivo: 'D2-personagem-animacoes.png', shot: 'folhaCiclos', w: 1920, h: 1080, auto: true, titulo: 'D2 · Personagem: animações quadro a quadro', legenda: 'Ciclos de andar e correr, pulo, regar, colher e deitar.' },
  { g: 'D', arquivo: 'D3-personagem-visuais.png', shot: 'folhaVisuais', w: 1920, h: 1080, auto: true, opts: () => (M ? { m: medidasAvatar() } : {}), titulo: 'D3 · Personagem: um corpo, seis visuais', legenda: 'Esqueleto único e cosméticos (chapéu, cabelo, pele, roupa, calçado) como peças encaixáveis.' },
  { g: 'E', arquivo: 'E1-arte-vibrante-tropical.png', shot: 'cenaA', w: 1920, h: 1080, opts: () => ({ paleta: 'tropical' }), titulo: 'E1 · Direção de arte "vibrante tropical"', legenda: 'Cores saturadas, casa colorida, água turquesa, sol forte.' },
  { g: 'E', arquivo: 'E2-arte-pastel-aconchegante.png', shot: 'cenaA', w: 1920, h: 1080, opts: () => ({ paleta: 'pastel' }), titulo: 'E2 · Direção de arte "pastel aconchegante"', legenda: 'Tons claros e quentes, luz difusa, sombras suaves.' },
  { g: 'E', arquivo: 'E3-luz-hora-dourada.png', shot: 'cenaA', w: 1920, h: 1080, opts: () => ({ luz: 'dourada' }), titulo: 'E3 · Luz de fim de tarde (hora dourada)', legenda: 'A cena A com sol baixo, sombras longas e janelas acesas, sem refazer modelos.' },
  { g: 'X', arquivo: 'extra-catalogo-de-modelos.png', shot: 'catalogoGeral', w: 1920, h: 1080, auto: true, titulo: 'Extra · Catálogo dos modelos provisórios', legenda: 'Cada modelo isolado, com a contagem de triângulos.' },
];

async function salvar(page, file) {
  const buf = await page.screenshot({ type: 'png' });
  const out = await sharp(buf).png({ compressionLevel: 9, effort: 10 }).toBuffer(); // recompressão sem perda
  fs.writeFileSync(file, out.length < buf.length ? out : buf);
  const meta = await sharp(file).metadata();
  return { bytes: fs.statSync(file).size, w: meta.width, h: meta.height };
}

const feitos = [];
for (const im of IMAGENS) {
  if (filtro && !im.arquivo.includes(filtro)) continue;
  const t0 = Date.now();
  const { browser, page } = await openPage({ width: im.w, height: im.h, dpr: 2 });
  const meta = await page.evaluate(([n, o]) => window.VR.shot(n, o), [im.shot, im.opts ? im.opts() : {}]);
  if (im.auto && meta.width) await page.setViewportSize({ width: Math.ceil(meta.width), height: Math.ceil(meta.height) });
  const r = await salvar(page, path.join(outDir, im.arquivo));
  await browser.close();
  console.log(`${im.arquivo}  ${r.w}x${r.h}  ${(r.bytes / 1048576).toFixed(2)} MB  ${Date.now() - t0} ms`);
  feitos.push(im.arquivo);
}

// F: visão geral, a partir dos arquivos já gravados
if (!filtro || 'F-visao-geral.png'.includes(filtro)) {
  const grupos = [
    { ids: ['A', 'B'], titulo: 'Opções A e B — 3D em tempo real', nota: 'A: câmera fixa isométrica (recomendada) · B: câmera próxima em perspectiva. Mesmos modelos, só muda a câmera.' },
    { ids: ['C'], titulo: 'Opção C — 2D com sprites pré-renderizados', nota: 'Com a câmera parada fica igual ao 3D; o custo aparece nas animações, nos visuais, no zoom e na memória.' },
    { ids: ['D', 'X'], titulo: 'Folha do personagem e catálogo de modelos', nota: 'Um esqueleto, 10 animações, cosméticos por peças. Tudo modelado em código.' },
    { ids: ['E'], titulo: 'Direções de arte e luz sobre a cena A', nota: 'Trocas de paleta e de iluminação, sem refazer nenhum modelo.' },
  ];
  for (const g of grupos) {
    g.itens = [];
    for (const im of IMAGENS.filter((i) => g.ids.includes(i.g))) {
      const f = path.join(outDir, im.arquivo);
      if (!fs.existsSync(f)) continue;
      const m = await sharp(f).metadata();
      g.itens.push({ url: 'file://' + f, w: m.width, h: m.height, titulo: im.curto || im.titulo, legenda: im.legenda, arquivo: im.arquivo });
    }
  }
  const { browser, page } = await openPage({ width: 1920, height: 1080, dpr: 2 });
  const sub = 'Imagens geradas por código para comparar 3D em tempo real com 2D por sprites antes de escrever o jogo. Os modelos são provisórios (sem artista e sem pacotes de arte). Detalhes e medições no README.md desta pasta.';
  const meta = await page.evaluate(([n, o]) => window.VR.shot(n, o), ['visaoGeral', { grupos: grupos.filter((g) => g.itens.length), sub }]);
  await page.setViewportSize({ width: Math.ceil(meta.width), height: Math.ceil(meta.height) });
  const r = await salvar(page, path.join(outDir, 'F-visao-geral.png'));
  await browser.close();
  console.log(`F-visao-geral.png  ${r.w}x${r.h}  ${(r.bytes / 1048576).toFixed(2)} MB`);
}
