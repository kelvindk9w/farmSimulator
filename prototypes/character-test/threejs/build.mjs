// Monta threejs/dist: módulos ES empacotados com esbuild (um pedaço por modo) + cópia dos pacotes de arte.
// Uso: node threejs/build.mjs
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, '..');
const dist = path.join(aqui, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const r = await build({
  entryPoints: [path.join(aqui, 'src/main.js')],
  bundle: true, format: 'esm', splitting: true, minify: true, treeShaking: true, legalComments: 'none',
  outdir: dist, entryNames: '[name]', chunkNames: 'pedaco-[name]-[hash]',
  target: ['es2020'], metafile: true, logLevel: 'warning',
});
fs.writeFileSync(path.join(dist, 'meta.json'), JSON.stringify(r.metafile));
fs.copyFileSync(path.join(aqui, 'index.html'), path.join(dist, 'index.html'));
fs.cpSync(path.join(raiz, 'assets'), path.join(dist, 'assets'), { recursive: true });

for (const [f, o] of Object.entries(r.metafile.outputs)) console.log(path.relative(raiz, path.resolve(f)), (o.bytes / 1024).toFixed(1) + ' KB');
console.log('ok ->', path.relative(process.cwd(), dist) || '.');
