// Exporta o projeto Godot para a Web (sem threads) em godot/build/web.
// Uso: GODOT=/caminho/para/o/godot node tools/build-godot.mjs
//   GODOT  binário do Godot 4 (padrão: "godot" no PATH). Os modelos de exportação ("export templates")
//          da mesma versão precisam estar instalados na pasta de dados do Godot do usuário.
// Passos: copia assets/ e config/ para dentro do projeto, importa os arquivos e exporta o preset "Web".
// Também gera dois pacotes só para medição (godot/build/medida/so-3d.pck e so-2d.pck), cada um com
// os arquivos de uma única rota, para saber quanto pesaria um jogo que usasse só aquela rota.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { raiz } from './comum.mjs';

const godot = process.env.GODOT || 'godot';
const projeto = path.join(raiz, 'godot');

function rodar(args, { tolerar = false } = {}) {
  console.log('>', path.basename(godot), args.join(' '));
  const r = spawnSync(godot, ['--headless', '--path', projeto, ...args], { encoding: 'utf8', maxBuffer: 64 << 20 });
  if (r.error) { console.error(`Não consegui rodar o Godot ("${godot}"): ${r.error.message}\nDefina GODOT=/caminho/para/o/binário.`); process.exit(1); }
  const saida = (r.stdout || '') + (r.stderr || '');
  const linhas = saida.split('\n').filter((l) => /ERROR|WARNING|SCRIPT|error|Cannot|não/.test(l));
  if (linhas.length) console.log(linhas.slice(0, 40).map((l) => '   ' + l).join('\n'));
  if (r.status !== 0 && !tolerar) { console.error(saida.slice(-3000)); console.error(`Godot saiu com código ${r.status}`); process.exit(1); }
  return saida;
}

const v = spawnSync(godot, ['--version'], { encoding: 'utf8' });
if (v.error) { console.error(`Não consegui rodar o Godot ("${godot}"). Defina GODOT=/caminho/para/o/binário.`); process.exit(1); }
console.log('Godot', v.stdout.trim());

// 1. arte e configuração para dentro do projeto
const s = spawnSync(process.execPath, [path.join(raiz, 'tools/sync.mjs')], { stdio: 'inherit' });
if (s.status !== 0) process.exit(1);

// 2. importação (cria/atualiza godot/.godot); o .gdignore impede o Godot de importar o próprio build
fs.mkdirSync(path.join(projeto, 'build'), { recursive: true });
fs.writeFileSync(path.join(projeto, 'build/.gdignore'), '');
fs.writeFileSync(path.join(projeto, 'build/versao.txt'), v.stdout.trim() + '\n'); // para as medições saberem a versão usada
for (const sub of ['web', 'medida']) fs.rmSync(path.join(projeto, 'build', sub), { recursive: true, force: true });
rodar(['--import'], { tolerar: true });

// 3. exportação para a Web
const web = path.join(projeto, 'build/web');
fs.rmSync(web, { recursive: true, force: true });
fs.mkdirSync(web, { recursive: true });
rodar(['--export-release', 'Web', 'build/web/index.html']);
if (!fs.existsSync(path.join(web, 'index.wasm'))) { console.error('A exportação não gerou index.wasm — os modelos de exportação desta versão estão instalados?'); process.exit(1); }

// 4. pacotes só para medição (não são usados pelo build)
const medida = path.join(projeto, 'build/medida');
fs.rmSync(medida, { recursive: true, force: true });
fs.mkdirSync(medida, { recursive: true });
rodar(['--export-pack', 'Medida so 3D', 'build/medida/so-3d.pck'], { tolerar: true });
rodar(['--export-pack', 'Medida so 2D', 'build/medida/so-2d.pck'], { tolerar: true });

for (const pasta of [web, medida]) for (const f of fs.readdirSync(pasta)) console.log(path.relative(raiz, path.join(pasta, f)), (fs.statSync(path.join(pasta, f)).size / 1024).toFixed(1) + ' KB');
console.log('ok ->', path.relative(process.cwd(), web));
