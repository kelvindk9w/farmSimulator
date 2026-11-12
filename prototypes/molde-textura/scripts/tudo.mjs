// Refaz tudo a partir do código: pacote, texturas provisórias, moldes .glb, capturas e medidas.
// Uso: npm run tudo
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
for (const script of ['build.mjs', 'gerar-texturas.mjs', 'exportar-moldes.mjs', 'capturar.mjs', 'medir.mjs']) {
  console.log(`\n== ${script} ==`);
  const r = spawnSync(process.execPath, [path.join(aqui, script)], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
}
