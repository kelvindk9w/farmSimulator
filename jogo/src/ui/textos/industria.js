// Os textos da frente das indústrias e dos pedidos (receitas com fila, quadro de pedidos e as dicas do Seu Tonho).
// Entram na tabela T de ui/textos.js.
import { T, tempo, numero } from '../textos.js';

const nomeC = (D, id) => (D && D.construcoes && D.construcoes[id] ? D.construcoes[id].nome : id || '');
const nomeI = (D, id) => (D && D.itens[id] ? D.itens[id].nome : id || '');
const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
// "2 tábuas e 1 fubá" vira "2 × tábua, 1 × fubá" (sem plural: os nomes vêm dos dados)
const lista = (itens, D) => Object.keys(itens || {}).map((k) => `${itens[k]} × ${minus(nomeI(D, k))}`).join(', ');

Object.assign(T.acoes, {
  retirarProduto: (d, D) => (d && d.itens && Object.keys(d.itens).length ? `Retirar o que ficou pronto: ${lista(d.itens, D)}` : 'Retirar o que ficou pronto'),
});

Object.assign(T.motivos, {
  'ver-industria': (d, D) => `${nomeC(D, d && d.construcao)}: toque para produzir`,
  'receita-de-outro-lugar': () => 'Essa receita não se faz aqui',
  'sem-vaga-na-fila': (d) => `A fila está cheia${d && d.vagas ? ' (' + d.vagas + ' vagas)' : ''}: espere uma receita ficar pronta`,
  'falta-ingrediente': (d, D) => `Falta ${minus(nomeI(D, d && d.item))}: tem ${d ? d.tem : 0} de ${d ? d.precisa : 0}`,
  'nada-pronto': () => 'Ainda não há nada pronto para retirar',
  'vaga-vazia': () => 'Essa receita já saiu da fila',
  'quadro-fechado': (d) => `O quadro de pedidos abre no nível ${d ? d.nivel : '?'}`,
  'ver-pedidos': (d) => (d && d.prontos ? 'Quadro de pedidos: tem pedido pronto para entregar' : 'Quadro de pedidos: toque para ver'),
  'sem-pedido': () => 'Esse pedido não está mais no quadro',
  'falta-para-o-pedido': (d, D) => `Falta ${minus(nomeI(D, d && d.item))} para este pedido: tem ${d ? d.tem : 0} de ${d ? d.precisa : 0}`,
});

T.industria = {
  titulo: 'Produzir', abaProduzir: 'Produzir', abaConstruir: 'Construir',
  fila: 'Fila', vagas: (n, t) => `${n} de ${t} vagas`,
  fazendo: 'Fazendo agora', falta: (seg) => `falta ${tempo(seg)}`, esperaAVez: 'Espera a vez', parada: 'Parada: retire o que está pronto',
  terminar: 'Terminar agora', cancelar: 'Tirar da fila', subir: 'Passar para a frente', descer: 'Passar para trás',
  vagaLivre: 'Vaga livre', vagaAMais: 'Vaga a mais', vagaNoNivel: (n) => `Abre no nível ${n}`, comOuro: (n) => `Abrir com ${numero(n)} de ouro`, comCash: (n) => `Abrir com ${numero(n)} de cash`,
  pronto: 'Pronto para retirar', retirar: 'Retirar tudo',
  receitas: 'Receitas', fazer: 'Fazer', nivel: (n) => `Nível ${n}`, da: (n) => `dá ${n}`, semReceita: 'Esta construção ainda não tem receita.',
  filaCheia: 'Fila cheia', mover: 'Mudar de lugar',
  perguntaCancelar: (nome) => `Tirar ${minus(nome)} da fila? Os ingredientes voltam para você, mas o tempo que já passou se perde.`,
  simCancelar: 'Tirar da fila', nao: 'Deixar como está',
  perguntaVaga: (nome, preco, moeda) => `${nome}: abrir por ${numero(preco)} de ${moeda}? A fila passa a guardar mais uma receita esperando.`,
  simVaga: 'Abrir a vaga', tituloVaga: 'Vaga a mais na fila',
};
T.ganhos.retirouProduto = (d, D) => '+' + lista(d.itens, D);
T.ganhos.receitaPronta = (d, D) => `${nomeI(D, d.item)}: ficou pronto! Toque em ${minus(nomeC(D, d.construcao))} para retirar`;
T.ganhos.cancelouReceita = (d) => (d.devolveu ? 'Saiu da fila: os ingredientes voltaram' : 'Saiu da fila');

T.pedidos = {
  titulo: 'Quadro de pedidos',
  paga: 'Paga', entregar: 'Entregar', trocar: 'Trocar', trocarGratis: 'Trocar (grátis)',
  esperando: 'Pedido novo em', trancada: (n) => `Mais uma vaga no nível ${n}`, maisVagas: (n, nivel) => `${n} vagas no nível ${nivel}`,
  trocaGratis: 'Você tem uma troca grátis: o pedido novo chega na hora.', trocaEm: (seg) => `Próxima troca grátis em ${tempo(seg)}.`,
  perguntaTrocaGratis: (nome) => `Trocar o pedido de ${nome}? Com a troca grátis, outro pedido chega na hora.`,
  perguntaTroca: (nome, seg) => `Trocar o pedido de ${nome}? A vaga fica vazia por ${tempo(seg)} até chegar outro.`,
  simTroca: 'Trocar', naoTroca: 'Ficar com este', tituloTroca: 'Trocar o pedido',
  entregou: (nome) => `Pedido entregue: ${nome}`, chegou: 'Chegou pedido novo no quadro', trocou: 'Pedido trocado',
  vazio: 'Ainda não há pedido: plante e colha, que a vizinhança logo pede.',
};

// as dicas do Seu Tonho, na primeira vez de cada coisa (uma ou duas frases curtas)
T.dicas = {
  entendi: 'Entendi',
  fila: 'Escolha uma receita e toque em Fazer. Os ingredientes saem do seu estoque e a receita entra na fila.',
  retirar: 'Agora é só esperar o relógio. Quando ficar pronto, toque em Retirar tudo, ou toque na construção lá fora.',
  cancelar: 'Mudou de ideia? O X tira a receita da fila e devolve os ingredientes. As setas mudam quem vem primeiro.',
  vaga: 'Dá para abrir mais uma vaga na fila e deixar mais receitas esperando. Paga-se com ouro ou com cash.',
  quadro: 'A vizinhança deixa os pedidos aqui. Entregar paga mais que a banca e ainda dá experiência.',
  entregar: 'Boa entrega! Essa vaga descansa um pouco e logo traz outro pedido. Se um pedido não servir, toque em Trocar.',
};
