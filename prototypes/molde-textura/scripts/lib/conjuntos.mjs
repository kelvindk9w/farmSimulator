// Descobre os conjuntos de texturas: toda pasta de texturas/ que tenha um texturas.json.
import fs from 'node:fs';
import path from 'node:path';

export function listarConjuntos(raiz) {
  const dir = path.join(raiz, 'texturas');
  const out = [];
  for (const pasta of fs.readdirSync(dir).sort()) {
    const json = path.join(dir, pasta, 'texturas.json');
    if (!fs.existsSync(json)) continue;
    const def = JSON.parse(fs.readFileSync(json, 'utf8'));
    let bytes = 0;
    const arquivos = {};
    for (const [slot, s] of Object.entries(def.slots)) {
      const f = path.join(dir, pasta, s.arquivo);
      if (!fs.existsSync(f)) throw new Error(`${pasta}: falta o arquivo ${s.arquivo} do slot ${slot}`);
      arquivos[slot] = fs.statSync(f).size;
      bytes += arquivos[slot];
    }
    out.push({ pasta, def, teste: def.uso === 'teste', bytes, arquivos });
  }
  return out;
}
