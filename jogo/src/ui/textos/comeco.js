// Os textos do começo humilde (a chegada, o Seu Tonho na fazenda, o baú, o caixote e as reformas).
// Entram na tabela T de ui/textos.js.
import { T, numero, tempo } from '../textos.js';

const nomeC = (D, id) => (D && D.construcoes && D.construcoes[id] ? D.construcoes[id].nome : id || '');
const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
// "semente de alface" → "sementes de alface" (o plural da primeira palavra, quando ela acaba em vogal)
const plural = (s) => s.replace(/^(\S*[aeiouáéíóú])(?=\s|$)/i, '$1s');

Object.assign(T.acoes, {
  conversar: () => 'Conversar com o Seu Tonho',
  reformarConstrucao: () => 'Reformar',
});

Object.assign(T.motivos, {
  'casa-velha': () => 'Sua casa (velha, mas é sua): dá para reformar em Construir',
  'bau-sem-espaco': () => 'O baú está cheio: venda no caixote da porteira, ou construa o celeiro',
  'bau-vazio': () => 'O baú está vazio',
  'caixote-cheio': (d) => `O caixote está cheio${d && d.vagas ? ' (' + d.vagas + ' coisas)' : ''}: espere os fregueses levarem, ou guarde no baú`,
  'sem-reforma': () => 'Isso não tem reforma',
  'sem-lugar': (d, D) => `Não há lugar livre para ${minus(nomeC(D, d && d.construcao))}: tire o que está em volta`,
  'ja-chegou': () => '',
});

// o aviso da reforma pronta (a chave é a construção velha)
const PRONTA = {
  'poco-velho': 'O poço está consertado!',
  'caixote-de-venda': 'A banca está montada!',
  'casa-velha': 'A casa está reformada!',
};

T.comeco = {
  pular: 'Pular',
  // na chegada ela fala primeiro (o nome e o retrato vêm de missoes.json "ela"); depois o Seu Tonho responde
  fala: 'Vim tentar a vida aqui. Trouxe minha enxada e umas sementes para começar.',
  daTrouxa: (n, nome) => `+${numero(n)} ${n === 1 ? minus(nome) : plural(minus(nome))}`,
  boasVindas: { titulo: 'Seu Tonho', fala: 'Seja bem-vinda! A fazenda é sua: está velhinha, mas a terra é boa. Vou te ajudando.' },
  // só na versão de teste: a gravação é de um começo mais antigo que o desta versão (pergunta uma vez)
  comecoNovo: {
    titulo: 'Começo novo',
    texto: 'Esta versão tem um começo novo. Quer começar de novo para ver?',
    nota: '(a fazenda deste aparelho será apagada)',
    sim: 'Sim, começar de novo',
    nao: 'Agora não',
  },
  noCaixote: (n) => `${n} no caixote`,
  vendeu: (ouro) => `+${numero(ouro)} ouro`,
  // o painel Construir: a aba das reformas
  aba: 'Reformas',
  reformar: 'Reformar',
  emObra: (seg) => `Em obra: falta ${tempo(seg)}`,
  obra: (seg) => (seg > 0 ? `obra de ${tempo(seg)}` : 'na hora'),
  nota: 'O que já vem com a fazenda se reforma aqui: a obra é como a de uma construção, e cada reforma deixa uma coisa melhor.',
  // o que cada reforma melhora (a chave é a construção velha)
  ganho: {
    'poco-velho': 'Enche o regador na metade do tempo e até o regador grande, de uma vez',
    'caixote-de-venda': 'A banca leva o cesto inteiro na hora, sem esperar freguês',
    'casa-velha': 'Casa nova, com despensa: guarda mais 40 coisas',
    'cerca-de-arame': 'Cerca de madeira em volta de tudo: os pedidos do quadro voltam mais depressa',
  },
  reformou: (d, D) => PRONTA[d.construcao] || `Reforma pronta: ${nomeC(D, d.para)}`,
  reformouCerca: 'Cerca nova pronta!',
};
