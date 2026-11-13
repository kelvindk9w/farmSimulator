// Conjunto de arte "contorno": desenho animado de traço escuro e cor chapada (alvo: arte/estilo/rodada-03/var-2-contorno.png).
// O chão e a cerca são feitos aqui do zero. Nos outros tipos, os esqueletos, as poses e a animação são os do conjunto
// "codigo": a fábrica de lá roda dentro de comEstilo(), que troca o construtor de formas, o material, as cores e as
// sombras pelos deste conjunto (kit.js) e o desenho de cada osso pelos de objetos.js, bichos.js e boneco.js.
// Como o conjunto foi feito e onde ele fica longe do alvo: ver NOTAS.md.
import { registrarConjunto } from '../registro.js';
import { comEstilo } from '../codigo/base.js';
import { criarEstilo, AMBIENTE } from './kit.js';
import { personagem } from '../codigo/personagem.js';
import { canteiro, poco, celeiro, ninho, arvore } from '../codigo/objetos.js';
import { vaca } from '../codigo/vaca.js';
import { galinha } from '../codigo/galinha.js';
import { chao, cerca } from './cenario.js';
import * as D from './objetos.js';
import * as B from './bichos.js';
import { avatar } from './boneco.js';

const DESENHOS = {
  'celeiro.articulado0': D.celeiro, 'poco.articulado0': D.poco, 'ninho.articulado0': D.ninho, 'arvore.articulado0': D.arvore,
  'canteiro.malha0': D.canteiroTerra, 'canteiro.articulado0': D.canteiroPlantas,
  'vaca.articulado0': B.vaca, 'vaca.malha0': B.sinalDeLeite, 'galinha.articulado0': B.galinha,
};
const EXTRAS = { personagem: { objetosDeMao: D.OBJETOS_DE_MAO, avatar } };
const vestir = (tipo, fabrica) => (ctx) => comEstilo(criarEstilo(tipo, DESENHOS, EXTRAS[tipo], ctx), () => fabrica(ctx));
const vestidas = Object.fromEntries(Object.entries({ personagem, canteiro, poco, celeiro, vaca, galinha, ninho, arvore }).map(([tipo, f]) => [tipo, vestir(tipo, f)]));
const semVestir = (tipo, fabrica) => (ctx) => comEstilo(criarEstilo(tipo, {}), () => fabrica(ctx));
// as fábricas são exportadas para o conjunto "figuras", que usa este cenário e troca só a personagem
export const FABRICAS = { ...vestidas, chao: semVestir('chao', chao), cerca: semVestir('cerca', cerca) };
export { AMBIENTE };
registrarConjunto('contorno', 'contorno', FABRICAS, { ambiente: AMBIENTE });
