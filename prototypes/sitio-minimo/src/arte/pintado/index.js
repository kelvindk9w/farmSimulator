// Conjunto de arte "pintado": o visual de 3D pintado à mão da imagem-alvo arte/estilo/rodada-03/var-3-pintado.png.
// Formas roliças e sem contorno (as do conjunto "brinquedo"), e cada superfície com pintura de pincel: um atlas de
// texturas pintadas (texturas/), cor por vértice por cima e luz quente com sombra fria. Ver NOTAS.md nesta pasta.
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
// O claro-escuro pintado de cada malha (ver banhar no kit). O tampo do chão não leva (as manchas dele são feitas no
// desenho); o que anda na mão ou flutua não escurece "perto do chão".
const BANHOS = {
  chao: false,
  personagem: { chao: 0 }, 'vaca.malha0': { chao: 0 },
  canteiro: { cima: 0.1, baixo: 0.3, chao: 0.3, altura: 0.1 }, 'canteiro.articulado0': { cima: 0.06, baixo: 0.2, chao: 0.16, altura: 0.12 },
  // a copa é sombreada como uma massa só (clara do lado do sol, no alto; escura embaixo e do lado de lá), e cada cacho
  // ainda escurece por baixo: é o claro-escuro que o pintor dá à árvore inteira, e não bola por bola
  arvore: { cima: 0.12, baixo: 0.46, chao: 0.2, altura: 0.25, extra: (x, y, z) => { const t = (-0.3 * x + 0.78 * (y - 2.9) + 0.5 * z) / 1.9; return 0.84 + 0.3 * Math.max(-1, Math.min(1, t)); } },
  // celeiro: a parede da direita fica no escuro do beiral, e as paredes escurecem para o alto, debaixo do telhado
  celeiro: { cima: 0.05, baixo: 0.3, chao: 0.24, altura: 0.3, extra: (x, y, z, nx, ny) => (Math.abs(ny) < 0.5 && y < 2.8 ? (nx > 0.6 ? 0.76 : 1) * (1 - 0.22 * Math.max(0, Math.min(1, (y - 1.9) / 0.85))) : 1) },
  galinha: { cima: 0.05, baixo: 0.26, chao: 0.12, altura: 0.08 }, vaca: { cima: 0.05, baixo: 0.3, chao: 0.1, altura: 0.15 },
};
const EXTRAS = { personagem: { objetosDeMao: D.OBJETOS_DE_MAO, avatar } };
const vestir = (tipo, fabrica, desenhos = DESENHOS) => (ctx) => {
  const v = comEstilo(criarEstilo(tipo, desenhos, EXTRAS[tipo], ctx, BANHOS), () => fabrica(ctx));
  // a sombra das peças grandes e da cerca vem de uma forma simples, e não da malha detalhada
  if (D.PROJETORES[tipo]) v.raiz.add(projetorDeSombra((b) => D.PROJETORES[tipo](b, ctx)));
  return v;
};
const vestidas = Object.fromEntries(Object.entries({ personagem, canteiro, poco, celeiro, vaca, galinha, ninho, arvore }).map(([tipo, f]) => [tipo, vestir(tipo, f)]));
registrarConjunto('pintado', 'pintado', { ...vestidas, chao: vestir('chao', chao, {}), cerca: vestir('cerca', cerca, {}) }, { ambiente: AMBIENTE });
