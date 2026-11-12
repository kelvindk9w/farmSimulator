// Abre o Chromium (Playwright já instalado na máquina) com a página de renderização.
// A página é servida num endereço de mentira, respondido direto dos arquivos desta pasta:
// assim as texturas são lidas por URL (como num jogo de verdade) sem precisar de servidor.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

export const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ORIGEM = 'http://molde-textura.local';
const TIPOS = { '.png': 'image/png', '.json': 'application/json', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.html': 'text/html' };
const PASTAS_SERVIDAS = ['dist', 'texturas', 'moldes'];

export async function abrirPagina({ largura = 1600, altura = 1000, raizDosArquivos = raiz } = {}) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  // O aviso "GPU stall due to ReadPixels" é normal com WebGL por software e não é mostrado.
  page.on('console', (m) => { const t = m.text(); if (((m.type() === 'error' || m.type() === 'warning') && !t.includes('GPU stall due to ReadPixels')) || process.env.MT_LOG) console.log(`[página ${m.type()}]`, t); });
  page.on('pageerror', (e) => console.log('[erro na página]', e.stack || e.message));
  await page.route(ORIGEM + '/**', (rota) => {
    const rel = decodeURIComponent(new URL(rota.request().url()).pathname).replace(/^\/+/, '');
    if (rel === '') return rota.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>molde x textura</title></head><body></body></html>' });
    const arquivo = path.resolve(raizDosArquivos, rel);
    const permitido = PASTAS_SERVIDAS.some((p) => arquivo.startsWith(path.join(raizDosArquivos, p) + path.sep));
    if (!permitido || !fs.existsSync(arquivo)) return rota.fulfill({ status: 404, body: 'não encontrado' });
    return rota.fulfill({ contentType: TIPOS[path.extname(arquivo)] || 'application/octet-stream', body: fs.readFileSync(arquivo) });
  });
  await page.goto(ORIGEM + '/');
  await page.addScriptTag({ url: ORIGEM + '/dist/pacote.js' });
  await page.evaluate(() => document.fonts.ready);
  return { browser, context, page };
}

// Renderiza um "shot" da página e grava o PNG. Devolve as medidas que a página informou.
export async function fotografar(page, nome, opts, arquivo) {
  const meta = await page.evaluate(([n, o]) => window.MT.shot(n, o), [nome, opts]);
  if (meta.width && meta.height) await page.setViewportSize({ width: Math.ceil(meta.width), height: Math.ceil(meta.height) });
  const buf = await page.screenshot({ type: 'png' });
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, buf);
  return meta;
}
