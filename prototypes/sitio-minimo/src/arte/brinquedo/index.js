// Conjunto de arte "brinquedo": o visual de brinquedo de vinil das imagens de referência do estilo A
// (arte/estilo/rodada-01/estilo-a.png e as folhas de arte/estilo/rodada-02/).
// O chão e a cerca são feitos aqui do zero. Nos outros tipos, os esqueletos, as poses e a animação são os do conjunto
// "codigo": a fábrica de lá roda dentro de comEstilo(), que troca o construtor de formas, o material, as cores e as
// sombras pelos deste conjunto (kit.js) e o desenho de cada osso pelos de objetos.js, bichos.js e boneco.js.
import { registrarConjunto } from '../registro.js';
import { comEstilo } from '../codigo/base.js';
import { criarEstilo, projetorDeSombra, AMBIENTE } from './kit.js';
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
const vestir = (tipo, fabrica) => (ctx) => {
  const v = comEstilo(criarEstilo(tipo, DESENHOS, EXTRAS[tipo], ctx), () => fabrica(ctx));
  if (D.PROJETORES[tipo]) v.raiz.add(projetorDeSombra(D.PROJETORES[tipo])); // a sombra das peças grandes vem de uma forma simples
  return v;
};
const vestidas = Object.fromEntries(Object.entries({ personagem, canteiro, poco, celeiro, vaca, galinha, ninho, arvore }).map(([tipo, f]) => [tipo, vestir(tipo, f)]));
const semVestir = (tipo, fabrica) => (ctx) => comEstilo(criarEstilo(tipo, {}), () => fabrica(ctx));
registrarConjunto('brinquedo', 'brinquedo', { ...vestidas, chao: semVestir('chao', chao), cerca: semVestir('cerca', cerca) }, { ambiente: AMBIENTE });
