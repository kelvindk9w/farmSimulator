// Uso: node scripts/shot.mjs <shot> [saida.png] [--w=1920 --h=1080 --dpr=1 --opts='{"k":1}']
// Ferramenta de iteração: renderiza um "shot" e salva o PNG.
import { openPage, root } from './browser.mjs';
import path from 'node:path';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, ...v] = a.slice(2).split('='); return [k, v.join('=')]; }));
const pos = args.filter((a) => !a.startsWith('--'));
const name = pos[0];
const out = pos[1] || path.join(root, 'dist', name + '.png');
const width = +(flags.w || 1920), height = +(flags.h || 1080), dpr = +(flags.dpr || 1);
const opts = flags.opts ? JSON.parse(flags.opts) : {};

const { browser, page } = await openPage({ width, height, dpr });
const t0 = Date.now();
const meta = await page.evaluate(([n, o]) => window.VR.shot(n, o), [name, opts]);
if (meta.width && meta.height) await page.setViewportSize({ width: Math.ceil(meta.width), height: Math.ceil(meta.height) });
await page.screenshot({ path: out });
console.log('ok', out, JSON.stringify({ ...meta, ms: Date.now() - t0 }));
await browser.close();
