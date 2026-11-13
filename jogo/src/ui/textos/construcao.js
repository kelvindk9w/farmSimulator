// Os textos da frente de construção (construir, mudar de lugar, celeiro por dentro). Entram na tabela T de ui/textos.js.
import { T, tempo, numero } from '../textos.js';

const nomeC = (D, id) => (D && D.construcoes && D.construcoes[id] ? D.construcoes[id].nome : id || '');
const nomeI = (D, id) => (D && D.itens[id] ? D.itens[id].nome : id || '');
const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

Object.assign(T.acoes, {
  colocarConstrucao: (d, D) => 'Construir',
  montarMovel: () => 'Montar o móvel',
  martelar: () => 'Dar o acabamento',
});

Object.assign(T.motivos, {
  'ver-construcao': (d, D) => nomeC(D, d && d.construcao),
  'em-obra': (d, D) => `${nomeC(D, d && d.construcao)} em obra${d && d.seg > 0 ? ': falta ' + tempo(d.seg) : ''}`,
  'nao-existe': () => 'Isso não existe mais',
  'nao-constroi': () => 'Isso já vem com a fazenda',
  'so-no-celeiro': () => 'Móvel se monta dentro do celeiro: entre nele',
  'so-na-fazenda': () => 'Isso se constrói lá fora, na fazenda',
  exige: (d, D) => `Precisa ter ${minus(nomeC(D, d && d.construcao))} pronta antes`,
  limite: (d) => (d && d.limite === 1 ? 'Você já tem uma: só cabe uma na fazenda' : `Você já tem o máximo (${d ? d.limite : ''})`),
  'so-com-cash': () => 'Este enfeite é da loja de cash',
  'sem-cash': (d) => `Falta cash${d && d.falta ? ' (' + numero(d.falta) + ')' : ''}`,
  'falta-material': (d, D) => `Falta ${minus(nomeI(D, d && d.item))}: tem ${d ? d.tem : 0} de ${d ? d.precisa : 0}`,
  'lugar-ocupado': () => 'Este lugar está ocupado',
  'tem-planta': () => 'Tem planta aqui: colha antes',
  'na-porta': () => 'Na frente da porta não',
  'fecha-caminho': (d, D) => (d && d.construcao ? `Assim não daria mais para chegar em ${minus(nomeC(D, d.construcao))}` : 'Assim fecharia a passagem: deixe um vão ou ponha uma porteira'),
  'sem-acesso': () => 'Não daria para chegar até ela aí',
  'nao-guarda': () => 'Isso não se guarda: só muda de lugar',
  'sem-ampliacao': () => 'Não há mais o que ampliar',
});
T.motivos['fora-do-mapa'] = T.motivos['fora-do-mapa'] || (() => '');
