// Empacota src/main.js (+ three) num único arquivo que a página de renderização carrega.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await build({
  entryPoints: [path.join(root, 'src/main.js')],
  bundle: true,
  format: 'iife',
  outfile: path.join(root, 'dist/bundle.js'),
  sourcemap: 'inline',
  logLevel: 'warning',
  loader: { '.css': 'text' },
});
console.log('bundle ok');
