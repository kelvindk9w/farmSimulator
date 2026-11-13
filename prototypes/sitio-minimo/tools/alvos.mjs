// Prepara as imagens-alvo que o botão "Ver alvo" mostra por cima do jogo: uma por conjunto de arte que tem alvo,
// reduzida para 960 x 540 e com poucas cores, para pesar pouco. A lista de conjuntos está em config/alvos.json.
// Uso: node tools/alvos.mjs      (grava em alvos/, que o build copia para dist/alvos/)
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { raiz } from './comum.mjs';
const sharp = createRequire(import.meta.url)('sharp');

const ORIGEM = {
  brinquedo: 'arte/estilo/rodada-02/cena-a.png',
  lowpoly: 'arte/estilo/rodada-03/var-1-low-poly.png',
  contorno: 'arte/estilo/rodada-03/var-2-contorno.png',
  pintado: 'arte/estilo/rodada-03/var-3-pintado.png',
};
const repo = path.resolve(raiz, '../..'), saida = path.join(raiz, 'alvos');
fs.mkdirSync(saida, { recursive: true });
for (const [conjunto, arq] of Object.entries(ORIGEM)) {
  const i = await sharp(path.join(repo, arq)).resize(960, 540, { fit: 'cover' }).png({ palette: true, colours: 160, effort: 10 }).toFile(path.join(saida, conjunto + '.png'));
  console.log(`alvos/${conjunto}.png  ${(i.size / 1024).toFixed(0)} KB  (de ${arq})`);
}
