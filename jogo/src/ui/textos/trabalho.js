// Os textos dos animais de trabalho (boi de arado, cavalo, jumento com carroça e barril) e de estimação (cachorro,
// gato). Entram na tabela T de ui/textos.js.
import { T, numero } from '../textos.js';

const nomeI = (D, id) => (D && D.itens[id] ? D.itens[id].nome : id || '');
const nomeA = (D, id) => (D && D.animais && D.animais[id] ? D.animais[id].nome : id || 'bicho');
const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
// "o boi", "a sela": o artigo sai do fim da primeira palavra do nome
const FEMININO = /a$|ã$|[çs]ão$|ade$/i;
const art = (nome) => (FEMININO.test(String(nome || '').split(' ')[0]) ? 'a' : 'o');
const o = (nome) => `${art(nome)} ${minus(nome)}`;
const O = (nome) => `${art(nome).toUpperCase()} ${minus(nome)}`;
const um = (nome) => `${art(nome) === 'a' ? 'uma' : 'um'} ${minus(nome)}`;
// o nome curto do bicho no meio da frase: "o boi", "o gato", "o cachorro" (sem "de arado", "caramelo")
const curto = (D, id) => o(String(nomeA(D, id)).replace(/ de arado$| caramelo$/i, ''));
const Curto = (D, id) => O(String(nomeA(D, id)).replace(/ de arado$| caramelo$/i, ''));

T.modos.arado = 'Arado';
T.dicaDoModo.arado = 'Toque na grama: o boi ara uma fileira inteira. Arraste o dedo para escolher a direção.';

Object.assign(T.acoes, {
  ararComBoi: (d) => (d && d.n > 1 ? `Arar ${d.n} casas com o boi` : 'Arar com o boi'),
  encherBarril: (d) => (d ? `Encher o barril (${numero(d.agua)}/${numero(d.capacidade)})` : 'Encher o barril'),
  encherNoBarril: () => 'Encher o regador no barril',
  afagar: (d, D) => `Fazer carinho n${art(nomeA(D, d && d.animal))} ${minus(String(nomeA(D, d && d.animal)).replace(/ caramelo$/i, ''))}${d && d.mimo ? ' (tem mimo hoje)' : ''}`,
});

Object.assign(T.motivos, {
  'sem-boi': () => 'Precisa do boi e do arado',
  'sem-cavalo': () => 'Você ainda não tem cavalo: compre no estábulo',
  'sem-jumento': () => 'Você ainda não tem jumento: compre no estábulo',
  'falta-apetrecho': (d, D) => `${Curto(D, d && d.animal)} precisa de ${um(nomeI(D, d && d.item))}: compre na loja, em Ferramentas`,
  'so-no-terreiro': () => 'Isso é lá fora, no terreiro',
  'sem-barril': () => 'Falta o barril de água: compre na loja, em Ferramentas',
  'sem-jumento-junto': () => 'Para encher o barril, leve o jumento junto (botão do jumento)',
  'barril-cheio': () => 'O barril já está cheio',
  'barril-vazio': () => 'O barril está vazio: toque no poço com o jumento junto',
});

Object.assign(T.ganhos, {
  carroca: (d) => `+${d.n} na carroça`,
  barril: (d) => `Barril cheio: ${numero(d.agua)} regas`,
  mimo: (d, D) => `${Curto(D, d.animal)} trouxe ${d.n} × ${minus(nomeI(D, d.item))}`,
});

T.trabalho = {
  // os botões do alto da tela (só aparecem para quem tem o bicho e o apetrecho)
  cavalo: { rotulo: 'Ir a cavalo (tecla H)', ligado: 'A cavalo: viagens longas montada, sem gastar fôlego (tecla H desliga)' },
  jumento: { rotulo: 'Levar o jumento com a carroça (tecla J)', ligado: 'O jumento vai junto com a carroça (tecla J deixa ele no estábulo)' },
  carga: (n, cap) => `Carroça: ${n} de ${cap}`,
  agua: (n, cap) => `Barril: ${n} de ${cap} regas`,
  ligou: { cavalo: 'Ir a cavalo: ligado', jumento: 'O jumento vai com você' },
  desligou: { cavalo: 'Ir a cavalo: desligado', jumento: 'O jumento voltou para o estábulo' },
  // o painel do estábulo
  abrigo: {
    montar: 'Ir a cavalo', aPe: 'Ir a pé',
    montarDica: 'Viagem longa vai a cavalo, sem gastar fôlego. Tecla H.',
    levar: 'Levar o jumento', deixar: 'Deixar o jumento aqui',
    levarDica: (cap) => `Ele vai atrás com a carroça: leva ${cap} coisas. Tecla J.`,
    arar: 'Arar com o boi', ararDica: (n) => `O boi ara ${n} casas por passada.`,
    falta: (D, item) => `Comprar ${o(nomeI(D, item))}`,
    faltaDica: (D, animal, item) => `${Curto(D, animal)} só trabalha com ${o(nomeI(D, item))}. Está na loja, em Ferramentas.`,
    semTrato: (D, animal) => `${Curto(D, animal)} está sem trato: trabalha pela metade. Encha o cocho e o bebedouro.`,
  },
  chegouSemApetrecho: (D, animal, item) => `${Curto(D, animal)} chegou! Falta ${o(nomeI(D, item))}: compre na loja, em Ferramentas`,
  // a loja
  info: {
    carroca: (cap) => `Leva ${numero(cap)} coisas, atrás do jumento`,
    barril: (cap) => `Leva ${numero(cap)} regas, na carroça do jumento`,
    precisa: (D, item, tem) => `Trabalha com ${o(nomeI(D, item))}${tem ? '' : ' (vende na loja, em Ferramentas)'}`,
  },
  // o que o Seu Tonho explica na primeira vez de cada coisa
  tonho: {
    titulo: { boi: 'O boi de arado', cavalo: 'A cavalo', jumento: 'O jumento', barril: 'O barril de água', barrilCheio: 'Água no campo', afago: 'Um companheiro', falta: 'Falta um apetrecho' },
    boi: (n) => `Toque na grama e o boi ara ${n} casas de uma vez, em fila. Arraste o dedo para escolher a direção.`,
    cavalo: 'Com o cavalo ligado, toda viagem longa é montada, sem gastar fôlego. Chegou, ela apeia sozinha e o cavalo espera do lado.',
    jumento: 'O jumento vai atrás de você com a carroça. Cesto cheio, a colheita passa para ela; a banca e o celeiro levam tudo junto.',
    barril: 'Leve o jumento até o poço e toque nele: o barril enche junto com o regador.',
    barrilCheio: 'Barril cheio! Quando o regador secar no meio do campo, ela enche ali mesmo, na carroça.',
    afago: (D, animal) => `Toque n${art(nomeA(D, animal))} ${minus(String(nomeA(D, animal)).replace(/ caramelo$/i, ''))} para fazer um carinho. Uma vez por dia ${art(nomeA(D, animal)) === 'a' ? 'ela' : 'ele'} traz um mimo.`,
  },
};
