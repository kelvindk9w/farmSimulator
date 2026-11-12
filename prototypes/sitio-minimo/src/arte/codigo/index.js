// Conjunto de arte "codigo": modelos feitos por código (formas simples, cores chapadas por vértice) e animados por código.
// É o conjunto de verdade do protótipo. Para trocar a arte de UM tipo de objeto, basta registrar outra fábrica para ele
// noutro conjunto e apontar esse tipo para lá em config/arte.json (ver CONTRATO-DE-ARTE.md).
import { registrarConjunto } from '../registro.js';
import { personagem } from './personagem.js';
import { canteiro, poco, celeiro, ninho, arvore } from './objetos.js';
import { vaca } from './vaca.js';
import { galinha } from './galinha.js';
import { chao, cerca } from './cenario.js';

registrarConjunto('codigo', 'código', { personagem, canteiro, poco, celeiro, vaca, galinha, ninho, arvore, chao, cerca });
