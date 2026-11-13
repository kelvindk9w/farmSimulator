// Conjunto de arte "figuras": o cenário e os bichos são os do conjunto "contorno" (3D), e a personagem é uma figura 2D
// desenhada pelo Codex (personagem.js). É o primeiro teste de pôr no jogo o desenho do Codex como ele veio, em vez de
// refazê-lo em 3D. O que já funciona e o que falta: ver NOTAS.md.
import { registrarConjunto } from '../registro.js';
import { FABRICAS as CONTORNO, AMBIENTE } from '../contorno/index.js';
import { personagem } from './personagem.js';

registrarConjunto('figuras', 'figuras 2D', { ...CONTORNO, personagem }, { ambiente: AMBIENTE });
