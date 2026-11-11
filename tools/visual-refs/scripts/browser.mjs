// Abre o Chromium (Playwright já instalado na máquina) com a página de renderização.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const outDir = path.resolve(root, '../../docs/referencias-visuais');

// O Chromium headless desta máquina já expõe WebGL2 via ANGLE/SwiftShader sem opções;
// as flags abaixo só tornam isso explícito e estável em outras máquinas sem GPU.
export const GL_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

export async function openPage({ width = 1920, height = 1080, dpr = 2 } = {}) {
  const browser = await chromium.launch({ args: GL_ARGS });
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr });
  const page = await context.newPage();
  page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' || m.type() === 'warning' || process.env.VR_LOG) console.log(`[page ${m.type()}]`, t); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.stack || e.message));
  const html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>refs</title></head><body></body></html>';
  const htmlPath = path.join(root, 'dist/page.html');
  fs.writeFileSync(htmlPath, html);
  await page.goto('file://' + htmlPath);
  await page.addScriptTag({ path: path.join(root, 'dist/bundle.js') });
  await page.evaluate(() => document.fonts.ready);
  return { browser, context, page };
}
