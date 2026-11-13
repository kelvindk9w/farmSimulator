// Monta o jogo em dist/ (ou na pasta da variável JOGO_DIST): um main.js (esbuild), o index.html e as páginas de arte (atlas).
// Os dados (dados/*.json) e a descrição do atlas entram no próprio main.js; em dist/ só há .html, .js, .json e .png.
//   node build.mjs            monta
//   node build.mjs --legivel  sem minificar (para depurar)
//   JOGO_DIST=dist-minha-frente node build.mjs   monta noutra pasta (para não apagar o dist/ de quem trabalha ao lado)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import { montarAtlas } from './tools/atlas.mjs';
import { lerDados, conferirDados, pastaDist } from './tools/comum.mjs';

const raiz = path.dirname(fileURLToPath(import.meta.url));
const dist = pastaDist;
const legivel = process.argv.includes('--legivel');
const t0 = Date.now();

// 1. dados: lê, completa o que faltar com um arquivo provisório e confere
const bruto = lerDados(path.join(raiz, 'dados'), { criarProvisorios: true });
const { problemas, texto } = conferirDados(bruto);
if (problemas.length) console.log(texto);
if (problemas.some((p) => p.grave)) console.log('\nATENÇÃO: há erro nos dados. O jogo abre mostrando a lista em vez de começar.\n');

// 2. arte
fs.mkdirSync(dist, { recursive: true });
const atlas = await montarAtlas(path.join(raiz, 'arte'), path.join(dist, 'arte'));
for (const a of atlas.avisos) console.log('arte: ' + a);

// 3. código
const virtuais = {
  'virtual:dados': 'export default ' + JSON.stringify(bruto) + ';',
  'virtual:atlas': 'export default ' + JSON.stringify({ paginas: atlas.def.paginas, pecas: atlas.def.pecas }) + ';',
};
for (const f of fs.readdirSync(dist)) if (f !== 'arte') fs.rmSync(path.join(dist, f), { recursive: true, force: true });
await esbuild.build({
  entryPoints: [path.join(raiz, 'src/main.js')],
  outfile: path.join(dist, 'main.js'),
  bundle: true, format: 'iife', target: ['es2020'], minify: !legivel, legalComments: 'none', logLevel: 'warning',
  plugins: [{
    name: 'virtuais',
    setup(b) {
      b.onResolve({ filter: /^virtual:/ }, (a) => ({ path: a.path, namespace: 'virtual' }));
      b.onLoad({ filter: /.*/, namespace: 'virtual' }, (a) => ({ contents: virtuais[a.path], loader: 'js' }));
    },
  }],
});
fs.copyFileSync(path.join(raiz, 'index.html'), path.join(dist, 'index.html'));

// 4. confere a saída: só os tipos de arquivo que a hospedagem aceita
const PERMITIDOS = new Set(['.html', '.js', '.json', '.png']);
let total = 0;
const linhas = [];
(function andar(pasta) {
  for (const f of fs.readdirSync(pasta)) {
    const c = path.join(pasta, f), st = fs.statSync(c);
    if (st.isDirectory()) { andar(c); continue; }
    if (!PERMITIDOS.has(path.extname(f))) { console.error(`ERRO: ${path.relative(dist, c)} não é .html, .js, .json nem .png`); process.exitCode = 1; }
    total += st.size; linhas.push(`  ${path.relative(dist, c).padEnd(44)} ${(st.size / 1024).toFixed(0).padStart(6)} kB`);
  }
})(dist);
console.log(linhas.join('\n'));
console.log(`${path.relative(raiz, dist) || '.'}/: ${linhas.length} arquivos, ${(total / 1024).toFixed(0)} kB, ${atlas.def.paginas.length} páginas de arte${atlas.reaproveitado ? ' (reaproveitadas)' : ''}, ${Object.keys(atlas.def.pecas).length} peças. ${((Date.now() - t0) / 1000).toFixed(1)} s`);
