// Monta dist/: um único main.js (three + jogo + os dois conjuntos de arte) e o index.html.
// Uso: node build.mjs            (ou: npm run build)
// A saída só tem .html e .js: a hospedagem recusa .glb e descarta o que vem depois de "?".
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(aqui, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const r = await build({
  entryPoints: [path.join(aqui, 'src/main.js')],
  bundle: true, format: 'iife', minify: true, treeShaking: true, legalComments: 'none',
  outfile: path.join(dist, 'main.js'),
  target: ['es2020'], metafile: true, logLevel: 'warning',
  // o código reaproveitado de tools/visual-refs também importa "three": tem de ser a mesma cópia
  alias: { three: path.join(aqui, 'node_modules/three') },
});
fs.copyFileSync(path.join(aqui, 'index.html'), path.join(dist, 'index.html'));

let total = 0, gz = 0, br = 0;
for (const f of fs.readdirSync(dist).sort()) {
  const buf = fs.readFileSync(path.join(dist, f));
  const g = zlib.gzipSync(buf, { level: 9 }).length, b = zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length;
  total += buf.length; gz += g; br += b;
  console.log(`${f.padEnd(12)} ${(buf.length / 1024).toFixed(1).padStart(7)} KB   gzip ${(g / 1024).toFixed(1).padStart(6)} KB   brotli ${(b / 1024).toFixed(1).padStart(6)} KB`);
}
console.log(`${'total'.padEnd(12)} ${(total / 1024).toFixed(1).padStart(7)} KB   gzip ${(gz / 1024).toFixed(1).padStart(6)} KB   brotli ${(br / 1024).toFixed(1).padStart(6)} KB`);
// de onde vem o peso (para o README)
const porOrigem = {};
for (const [f, i] of Object.entries(r.metafile.outputs[Object.keys(r.metafile.outputs)[0]].inputs)) {
  const k = f.includes('node_modules/three') ? 'three' : f.includes('visual-refs') ? 'tools/visual-refs (avatar, construtor de malhas)' : 'src e config deste protótipo';
  porOrigem[k] = (porOrigem[k] || 0) + i.bytesInOutput;
}
for (const [k, v] of Object.entries(porOrigem)) console.log(`  ${k}: ${(v / 1024).toFixed(1)} KB`);
console.log('ok -> dist/');
