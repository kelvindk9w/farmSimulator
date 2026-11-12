// Conjunto de arte "brinquedo": o visual de brinquedo de vinil da imagem de referência do estilo A
// (arte/estilo/rodada-01/estilo-a.png e as folhas de arte/estilo/rodada-02/).
// Os esqueletos, as poses e a animação são os do conjunto "codigo": cada fábrica de lá roda aqui dentro de comEstilo(),
// que troca o construtor de formas, o material, as cores e as sombras pelos deste conjunto (kit.js).
import { registrarConjunto } from '../registro.js';
import { comEstilo } from '../codigo/base.js';
import { ESTILO, AMBIENTE } from './kit.js';
import { personagem } from '../codigo/personagem.js';
import { canteiro, poco, celeiro, ninho, arvore } from '../codigo/objetos.js';
import { vaca } from '../codigo/vaca.js';
import { galinha } from '../codigo/galinha.js';
import { chao, cerca } from '../codigo/cenario.js';

const vestir = (fabrica) => (ctx) => comEstilo(ESTILO, () => fabrica(ctx));
const fabricas = { personagem, canteiro, poco, celeiro, vaca, galinha, ninho, arvore, chao, cerca };
registrarConjunto('brinquedo', 'brinquedo', Object.fromEntries(Object.entries(fabricas).map(([k, f]) => [k, vestir(f)])), { ambiente: AMBIENTE });
