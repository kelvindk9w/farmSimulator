// Monta threejs/dist: módulos ES empacotados com esbuild (um pedaço por modo) + cópia dos pacotes de arte.
// Uso: node threejs/build.mjs
//      node threejs/build.mjs --embutido   -> threejs/dist-embutido: os .glb vão dentro de um .js,
//                                             para hospedagens que não servem arquivos .glb
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, '..');
const embutido = process.argv.includes('--embutido');
const dist = path.join(aqui, embutido ? 'dist-embutido' : 'dist');
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

if (embutido) {
  // troca cada assets/3d/*.glb por uma entrada num script comum, carregado antes do módulo principal
  const pasta = path.join(dist, 'assets/3d'), mapa = {};
  for (const f of fs.readdirSync(pasta).filter((n) => n.endsWith('.glb')).sort()) {
    mapa['assets/3d/' + f] = fs.readFileSync(path.join(pasta, f)).toString('base64');
    fs.rmSync(path.join(pasta, f));
  }
  fs.writeFileSync(path.join(dist, 'glb-embutidos.js'), 'window.__benchEmbutidos = ' + JSON.stringify(mapa) + ';\n');
  const html = path.join(dist, 'index.html'), marca = '<script type="module" src="./main.js"></script>';
  const texto = fs.readFileSync(html, 'utf8');
  if (!texto.includes(marca)) throw new Error('index.html mudou: não achei a linha do script principal');
  fs.writeFileSync(html, texto.replace(marca, '<script src="./glb-embutidos.js"></script>\n' + marca));
}

for (const [f, o] of Object.entries(r.metafile.outputs)) console.log(path.relative(raiz, path.resolve(f)), (o.bytes / 1024).toFixed(1) + ' KB');
console.log('ok ->', path.relative(process.cwd(), dist) || '.');
