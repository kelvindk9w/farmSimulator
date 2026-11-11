// Copia os pacotes de arte (assets/) e a configuração (config/) para dentro do projeto Godot,
// que só enxerga arquivos da própria pasta. Rode sempre que trocar a arte ou o bench.json.
// Os arquivos .import que o Godot cria ao lado de cada arquivo são preservados.
// Uso: node tools/sync.mjs
import fs from 'node:fs';
import path from 'node:path';
import { raiz } from './comum.mjs';

function espelhar(de, para) {
  fs.mkdirSync(para, { recursive: true });
  const origem = new Set(fs.readdirSync(de));
  for (const nome of fs.readdirSync(para)) {
    const alvo = path.join(para, nome);
    const dono = nome.endsWith('.import') ? nome.slice(0, -'.import'.length) : nome;
    if (!origem.has(dono)) fs.rmSync(alvo, { recursive: true, force: true }); // sobrou de uma versão anterior
  }
  for (const nome of origem) {
    const a = path.join(de, nome), b = path.join(para, nome);
    if (fs.statSync(a).isDirectory()) espelhar(a, b);
    else if (!fs.existsSync(b) || !fs.readFileSync(a).equals(fs.readFileSync(b))) fs.copyFileSync(a, b);
  }
}

espelhar(path.join(raiz, 'assets'), path.join(raiz, 'godot/assets'));
espelhar(path.join(raiz, 'config'), path.join(raiz, 'godot/config'));
console.log('ok: assets/ e config/ copiados para godot/');
