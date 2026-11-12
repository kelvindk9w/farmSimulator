// Empacota src/pagina.js (+ three) num único arquivo que a página de renderização carrega.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await build({
  entryPoints: [path.join(raiz, 'src/pagina.js')],
  bundle: true,
  format: 'iife',
  outfile: path.join(raiz, 'dist/pacote.js'),
  sourcemap: 'inline',
  logLevel: 'warning',
});
console.log('pacote ok');
