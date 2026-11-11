// As quatro variantes da bancada e como as ferramentas (captura, medição, verificação) falam com cada uma.
// Three.js expõe window.__bench; o build do Godot expõe window.__bench* (ver godot/scripts/runner.gd).
import path from 'node:path';
import fs from 'node:fs';
import { raiz, servir } from './comum.mjs';

export const VARIANTES = [
  { id: 'three-3d', nome: 'Three.js · 3D', motor: 'three', modo: '3d' },
  { id: 'three-2d', nome: 'Three.js · 2D', motor: 'three', modo: '2d' },
  { id: 'godot-3d', nome: 'Godot · 3D', motor: 'godot', modo: '3d' },
  { id: 'godot-2d', nome: 'Godot · 2D', motor: 'godot', modo: '2d' },
];
export const PASTAS = { three: path.join(raiz, 'threejs/dist'), godot: path.join(raiz, 'godot/build/web') };

export function conferirBuilds() {
  const falta = [];
  if (!fs.existsSync(path.join(PASTAS.three, 'main.js'))) falta.push('threejs/dist (rode: node threejs/build.mjs)');
  if (!fs.existsSync(path.join(PASTAS.godot, 'index.wasm'))) falta.push('godot/build/web (rode: GODOT=... node tools/build-godot.mjs)');
  if (falta.length) { console.error('Faltam builds:\n  ' + falta.join('\n  ')); process.exit(1); }
}

// sobe um servidor para cada motor; onRequest(motor, caminho, bytes)
export async function subirServidores(onRequest = null) {
  const s = {};
  for (const motor of Object.keys(PASTAS)) s[motor] = await servir(PASTAS[motor], 0, { onRequest: onRequest ? (p, n) => onRequest(motor, p, n) : null });
  return { url: (v, params = {}) => s[v.motor].url + '?' + new URLSearchParams({ modo: v.modo, ...params }).toString(), fechar: async () => { for (const k of Object.keys(s)) await s[k].fechar(); } };
}

const doisQuadros = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

// Abre uma variante e espera o primeiro quadro desenhado.
// Devolve { page, ctx, primeiroQuadroMs, passoPara(n), info(), stats(), fechar() }.
export async function abrir(browser, servidores, v, { largura = 640, altura = 400, dsf = 1, params = {}, contexto = {}, aoLog = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: dsf, ...contexto });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => { erros.push(String(e.message || e)); });
  page.on('console', (m) => { const t = m.text(); if (/SCRIPT ERROR|^ERROR|Uncaught/.test(t) || m.type() === 'error') { if (!/2D MSAA|GPU stall/.test(t)) erros.push(t.slice(0, 300)); } if (aoLog) aoLog(m.type(), t); });
  await page.goto(servidores.url(v, params));
  if (v.motor === 'three') await page.waitForFunction(() => window.__bench && (window.__bench.ready || window.__bench.error), null, { timeout: 120000 });
  else await page.waitForFunction(() => window.__benchPronto === true, null, { timeout: 240000 });
  const erro = v.motor === 'three' ? await page.evaluate(() => window.__bench.error) : null;
  if (erro) throw new Error(`${v.id}: ${erro}`);
  const primeiroQuadroMs = await page.evaluate(v.motor === 'three' ? () => window.__bench.firstFrameMs : () => window.__benchPrimeiroQuadro);

  const passoPara = async (n) => {
    if (v.motor === 'three') { const info = await page.evaluate((k) => window.__bench.stepTo(k), n); await doisQuadros(page); return info; }
    await page.evaluate((k) => { window.__benchAlvo = k; }, n);
    await page.waitForFunction((k) => window.__benchQuadro >= k, n, { timeout: 120000 });
    await doisQuadros(page);
    return page.evaluate(() => window.__benchInfo);
  };
  const stats = async () => {
    if (v.motor === 'three') return page.evaluate(() => ({ ...window.__bench.stats(), info: window.__bench.info() }));
    // o Godot publica os números a cada meio segundo
    await page.evaluate(() => { window.__benchStats = null; });
    await page.waitForFunction(() => window.__benchStats, null, { timeout: 30000 });
    return page.evaluate(() => window.__benchStats);
  };
  const info = async () => (await stats()).info;
  return { page, ctx, v, erros, primeiroQuadroMs, passoPara, stats, info, fechar: () => ctx.close() };
}
