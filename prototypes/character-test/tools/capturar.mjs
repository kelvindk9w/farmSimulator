// Gera as imagens de capturas/ a partir dos dois builds, no Chromium sem tela:
//   folha-<variante>.png      folha de contato do roteiro de demonstração (uma por variante)
//   comparacao-2x2.png        os mesmos momentos nas quatro variantes
//   telas-2x2.png             a tela inteira (com os controles) nas quatro variantes
//   telas-celular.png         idem, em formato de celular em pé
//   personalizacao.png        o teste de troca de visual (cabelos/barba no 3D, folha B no 2D)
//   comparacao-2x2.webm/.gif  o roteiro inteiro, as quatro variantes lado a lado
// Uso: node tools/capturar.mjs [--sem-video] [--so=folhas,telas,personalizacao,video]
// As quatro variantes rodam no modo "passo" (a ferramenta manda avançar N passos da simulação),
// então cada imagem mostra exatamente o mesmo instante em todas.
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { raiz, cfg, playwright, GL_ARGS } from './comum.mjs';
import { VARIANTES, conferirBuilds, subirServidores, abrir } from './variantes.mjs';
import { Iso } from '../threejs/src/iso.js';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const args = process.argv.slice(2);
const so = (args.find((a) => a.startsWith('--so=')) || '').slice(5).split(',').filter(Boolean);
const quer = (nome) => (so.length ? so.includes(nome) : !(nome === 'video' && args.includes('--sem-video')));
const saida = path.join(raiz, 'capturas');
fs.mkdirSync(saida, { recursive: true });

// momentos do roteiro (número de passos já dados), uma linha por assunto
const LINHAS = [
  [20, 71, 131, 191, 251, 311, 371, 431, 491], // parado + andar nas 8 direções
  [580, 634, 692, 749, 757, 764, 770, 778, 786], // correr (3) + pular (6 fases)
  [808, 853, 893, 926, 987, 1055, 1067, 1153, 1201], // agachar, levantar, sentar, deitar, levantar
];
const DESTAQUES = [20, 191, 311, 580, 764, 853, 987, 1153]; // para a comparação 2x2
const iso = new Iso(cfg.camera);
const FUNDO = cfg.ground.background;

// recorte em volta do personagem: 1,9 x 2,3 unidades de mundo, com o ponto de apoio perto da base
const LADRILHO = { esq: 0.95, cima: 1.95, larg: 1.9, alt: 2.3 };
async function recortar(png, info, { largura, altura, dsf }) {
  const s = (Math.min(largura, altura) / cfg.camera.viewUnits) * dsf; // pixels por unidade de mundo
  const [px, py] = iso.project(info.x, 0, info.z);
  const cx = (largura * dsf) / 2 + px * s, cy = (altura * dsf) / 2 - (py - cfg.camera.lookAtY * iso.cosE) * s;
  const W = Math.round(LADRILHO.larg * s), H = Math.round(LADRILHO.alt * s);
  let x = Math.round(cx - LADRILHO.esq * s), y = Math.round(cy - LADRILHO.cima * s);
  const x0 = Math.max(0, x), y0 = Math.max(0, y), x1 = Math.min(largura * dsf, x + W), y1 = Math.min(altura * dsf, y + H);
  return sharp(png).extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 })
    .extend({ left: x0 - x, top: y0 - y, right: x + W - x1, bottom: y + H - y1, background: FUNDO }).png().toBuffer();
}

const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const img = (png, extra = '') => `<img ${extra} src="data:image/png;base64,${png.toString('base64')}">`;
const CSS = `
  body { margin: 0; background: #fff; font: 15px/1.3 system-ui, "Segoe UI", Roboto, "Noto Sans", sans-serif; color: #1f2a30; }
  #folha { display: inline-block; padding: 18px; background: #fff; }
  h1 { font-size: 26px; margin: 0 0 4px; } h2 { font-size: 20px; margin: 0 0 8px; }
  p { margin: 0 0 12px; color: #4a5a63; }
  .linha { display: flex; gap: 6px; margin-bottom: 6px; }
  figure { margin: 0; background: ${FUNDO}; border-radius: 6px; overflow: hidden; }
  figure img { display: block; }
  figcaption { background: #1f2a30; color: #fff; padding: 4px 8px; font-size: 14px; white-space: nowrap; overflow: hidden; display: flex; justify-content: space-between; }
  figcaption span { opacity: .65; }
  .grade { display: grid; grid-template-columns: auto auto; gap: 18px; }
  .painel { border: 2px solid #1f2a30; border-radius: 10px; padding: 10px; }
  .telas { display: grid; gap: 8px; }
  .telas img { display: block; border-radius: 6px; }
  .rot { font-weight: 700; margin: 10px 0 4px; }
`;
async function fotografar(browser, html, arquivo) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.setContent(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><style>${CSS}</style><body><div id="folha">${html}</div></body></html>`);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
  await page.locator('#folha').screenshot({ path: arquivo });
  await ctx.close();
  console.log('  ->', path.relative(raiz, arquivo), (fs.statSync(arquivo).size / 1024).toFixed(0) + ' KB');
}
const figura = (t) => `<figure>${img(t.png)}<figcaption>${esc(t.legenda)}<span>${esc(t.nota || '')}</span></figcaption></figure>`;

const { chromium } = playwright();
conferirBuilds();
const servidores = await subirServidores();
const browser = await chromium.launch({ args: GL_ARGS });
const problemas = [];

try {
  // ---------- folhas de contato + comparação ----------
  if (quer('folhas')) {
    console.log('Folhas de contato');
    const tam = { largura: 520, altura: 400, dsf: 2 };
    const quadros = [...new Set(LINHAS.flat().concat(DESTAQUES))].sort((a, b) => a - b);
    const tudo = {}; // id -> quadro -> { png, info }
    for (const v of VARIANTES) {
      const a = await abrir(browser, servidores, v, { ...tam, params: { demo: 1, passo: 1, hud: 0 } });
      tudo[v.id] = {};
      for (const q of quadros) {
        const info = await a.passoPara(q);
        tudo[v.id][q] = { info, png: await recortar(await a.page.screenshot(), info, tam) };
      }
      if (a.erros.length) problemas.push(`${v.id}: ${a.erros.join(' | ')}`);
      await a.fechar();
      console.log('  ', v.id, 'ok');
    }
    // as quatro variantes têm de estar no mesmo estado em cada momento
    let fora = 0;
    for (const q of quadros) {
      const ref = tudo[VARIANTES[0].id][q].info;
      for (const v of VARIANTES.slice(1)) {
        const i = tudo[v.id][q].info;
        if (i.anim !== ref.anim || i.dir !== ref.dir || Math.abs(i.x - ref.x) > 2e-3 || Math.abs(i.z - ref.z) > 2e-3 || Math.abs(i.animTime - ref.animTime) > 2e-3) { fora++; problemas.push(`fora de sincronia no passo ${q}: ${v.id} ${JSON.stringify(i)} x ${JSON.stringify(ref)}`); }
      }
    }
    console.log(fora ? `  ATENÇÃO: ${fora} momentos fora de sincronia` : `  sincronia: os ${quadros.length} momentos têm o mesmo estado (animação, direção, posição, tempo) nas 4 variantes`);
    const leg = (v, q) => ({ png: tudo[v.id][q].png, legenda: tudo[v.id][q].info.label, nota: `passo ${q}` });
    for (const v of VARIANTES) {
      const html = `<h1>${esc(v.nome)} — roteiro de demonstração</h1><p>Arte provisória. Cada quadro é o mesmo instante da simulação nas quatro variantes (passo = 1/60 s).</p>`
        + LINHAS.map((l) => `<div class="linha">${l.map((q) => figura(leg(v, q))).join('')}</div>`).join('');
      await fotografar(browser, html, path.join(saida, `folha-${v.id}.png`));
    }
    const painel = (v) => `<div class="painel"><h2>${esc(v.nome)}</h2>${[0, 4].map((k) => `<div class="linha">${DESTAQUES.slice(k, k + 4).map((q) => figura(leg(v, q))).join('')}</div>`).join('')}</div>`;
    await fotografar(browser, `<h1>Os mesmos momentos nas quatro variantes</h1><p>Arte provisória: as folhas 2D foram renderizadas a partir do mesmo modelo 3D, por isso as quatro ficam tão parecidas.</p><div class="grade">${VARIANTES.map(painel).join('')}</div>`, path.join(saida, 'comparacao-2x2.png'));
  }

  // ---------- tela inteira, com os controles ----------
  if (quer('telas')) {
    console.log('Telas inteiras');
    for (const [nome, tam, contexto, cols] of [['telas-2x2.png', { largura: 640, altura: 400, dsf: 2 }, {}, 2], ['telas-celular.png', { largura: 390, altura: 760, dsf: 2 }, { hasTouch: true, isMobile: true }, 4]]) {
      const fotos = [];
      for (const v of VARIANTES) {
        const a = await abrir(browser, servidores, v, { ...tam, contexto, params: { demo: 1, passo: 1 } });
        await a.passoPara(131);
        fotos.push(await a.page.screenshot());
        if (a.erros.length) problemas.push(`${v.id}: ${a.erros.join(' | ')}`);
        await a.fechar();
      }
      await fotografar(browser, `<div class="telas" style="grid-template-columns: repeat(${cols}, auto)">${fotos.map((f) => img(f)).join('')}</div>`, path.join(saida, nome));
    }
  }

  // ---------- teste de personalização ----------
  if (quer('personalizacao')) {
    console.log('Personalização');
    const tam = { largura: 520, altura: 400, dsf: 2 };
    let html = '<h1>Teste de personalização</h1><p>3D: o cabelo A vem dentro do personagem.glb; os cabelos B e C e a barba são arquivos avulsos presos ao osso da cabeça. 2D: troca a folha do andar pela variante B (as outras animações continuam com o visual A).</p>';
    for (const v of VARIANTES) {
      const tiles = [];
      if (v.modo === '3d') {
        for (let i = 0; i < 6; i++) {
          const a = await abrir(browser, servidores, v, { ...tam, params: { demo: 1, passo: 1, hud: 0, visual: i } });
          const q = i < 3 ? 20 : 131;
          const info = await a.passoPara(q);
          tiles.push({ png: await recortar(await a.page.screenshot(), info, tam), legenda: `cabelo ${'ABC'[i % 3]}${i >= 3 ? ' + barba' : ''}`, nota: info.label });
          if (a.erros.length) problemas.push(`${v.id} visual ${i}: ${a.erros.join(' | ')}`);
          await a.fechar();
        }
      } else {
        for (const i of [0, 1]) {
          const a = await abrir(browser, servidores, v, { ...tam, params: { demo: 1, passo: 1, hud: 0, visual: i } });
          for (const q of [71, 191, 311]) {
            const info = await a.passoPara(q);
            tiles.push({ png: await recortar(await a.page.screenshot(), info, tam), legenda: `visual ${'AB'[i]}`, nota: info.label });
          }
          if (a.erros.length) problemas.push(`${v.id} visual ${i}: ${a.erros.join(' | ')}`);
          await a.fechar();
        }
      }
      html += `<div class="rot">${esc(v.nome)}</div><div class="linha">${tiles.map(figura).join('')}</div>`;
      console.log('  ', v.id, 'ok');
    }
    await fotografar(browser, html, path.join(saida, 'personalizacao.png'));
  }

  // ---------- vídeo 2x2 do roteiro inteiro ----------
  if (quer('video')) {
    console.log('Vídeo 2x2');
    const tam = { largura: 480, altura: 400, dsf: 1 };
    const cada = 3, fps = 60 / cada; // um quadro de vídeo a cada 3 passos = 20 qps
    const abertas = [];
    for (const v of VARIANTES) abertas.push(await abrir(browser, servidores, v, { ...tam, params: { demo: 1, passo: 1, ui: 0 } }));
    const total = Math.floor(cfg.demo.steps.reduce((s, p) => s + p.frames, 0) / cada);
    const W = tam.largura * 2, H = tam.altura * 2;
    const webm = path.join(saida, 'comparacao-2x2.webm');
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(fps), '-i', '-',
      '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuv420p', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-cpu-used', '3', '-g', '120', webm], { stdio: ['pipe', 'inherit', 'inherit'] });
    const fim = new Promise((res, rej) => { ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg saiu com ' + c)))); ff.on('error', rej); });
    for (let k = 1; k <= total; k++) {
      const fotos = await Promise.all(abertas.map(async (a) => { await a.passoPara(k * cada); return a.page.screenshot(); }));
      const quadro = await sharp({ create: { width: W, height: H, channels: 3, background: '#1f2a30' } })
        .composite(fotos.map((f, i) => ({ input: f, left: (i % 2) * tam.largura, top: Math.floor(i / 2) * tam.altura }))).removeAlpha().raw().toBuffer();
      if (!ff.stdin.write(quadro)) await new Promise((r) => ff.stdin.once('drain', r));
      if (k % 60 === 0) console.log(`   ${k}/${total}`);
    }
    ff.stdin.end();
    await fim;
    for (const a of abertas) { if (a.erros.length) problemas.push(`${a.v.id}: ${a.erros.join(' | ')}`); await a.fechar(); }
    console.log('  ->', path.relative(raiz, webm), (fs.statSync(webm).size / 1024).toFixed(0) + ' KB');
    // GIF menor (abre em qualquer lugar): metade da resolução, 10 qps
    const gif = path.join(saida, 'comparacao-2x2.gif');
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-vf', 'fps=10,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle', gif], { stdio: 'inherit' });
    if (r.status === 0) console.log('  ->', path.relative(raiz, gif), (fs.statSync(gif).size / 1024).toFixed(0) + ' KB');
    else problemas.push('não foi possível gerar o GIF');
  }
} finally {
  await browser.close();
  await servidores.fechar();
}
if (problemas.length) { console.log('\nProblemas:\n  ' + [...new Set(problemas)].join('\n  ')); process.exitCode = 1; } else console.log('\nSem erros no console das páginas.');
