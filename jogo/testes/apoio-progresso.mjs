// Apoio dos testes da frente de progresso: os dados pequenos de testes/dados não têm conquistas, presente do dia,
// convite nem cash; aqui entram os de teste (números redondos, independentes da economia).
import { novoMundo } from './apoio.mjs';

export const DIA = 86400; // segundos
export const MEIO_DIA_MS = 1_000 * DIA * 20000 + 12 * 3600 * 1000; // um meio-dia qualquer (relógio universal)

export function comProgresso(b) {
  Object.assign(b.itens, {
    prego: { nome: 'Prego', tipo: 'material' },
    tabua: { nome: 'Tábua', tipo: 'material' },
    'chapeu-de-palha': { nome: 'Chapéu de palha', tipo: 'cosmetico', parte: 'chapeu' },
    'camisa-xadrez': { nome: 'Camisa xadrez', tipo: 'cosmetico', parte: 'roupa', nivel: 2, compra: 12 },
    'bota-de-couro': { nome: 'Bota de couro', tipo: 'cosmetico', parte: 'calcado' },
    'pintura-azul': { nome: 'Pintura azul', tipo: 'cosmetico', parte: 'pintura' },
  });
  Object.assign(b.missoes, {
    conquistas: [
      { id: 'terra-arada', nome: 'Terra arada', evento: 'arou', marcos: [2, 4], recompensas: [{ ouro: 5, cash: 1 }, { ouro: 20, cash: 2 }] },
      { id: 'so-rabanete', nome: 'Só rabanete', evento: 'colheu', filtro: { item: ['rabanete', 'nabo'] }, marcos: [3], recompensas: [{ ouro: 7 }] },
      { id: 'bom-de-venda', nome: 'Bom de venda', evento: 'vendeu', soma: 'ouro', marcos: [10, 100], recompensas: [{ ouro: 5 }, { cash: 3 }] },
      { id: 'fazendeiro', nome: 'Fazendeiro', evento: 'subiuDeNivel', conta: 'nivel', marcos: [2, 3], recompensas: [{ ouro: 50, cash: 1 }, { ouro: 250, cash: 2 }] },
      { id: 'todo-dia', nome: 'Todo santo dia', evento: 'resgatou', filtro: { classe: 'diaria' }, marcos: [2], recompensas: [{ cash: 1 }] },
      { id: 'tosquiador', nome: 'Tosquiador', evento: 'tosou', filtro: { item: 'la' }, marcos: [5], recompensas: [{ ouro: 9 }] },
    ],
    diaria: {
      avancaPor: 'dia-jogado', zeraAoFaltar: false,
      dias: [
        { dia: 1, recompensa: { itens: { prego: 10 } } }, { dia: 2, recompensa: { ouroPorNivel: 20 } }, { dia: 3, recompensa: { itens: { tabua: 3 } } },
        { dia: 4, recompensa: { cash: 2 } }, { dia: 5, recompensa: { itens: { prego: 4, tabua: 4 } } }, { dia: 6, recompensa: { ouroPorNivel: 40 } },
        { dia: 7, recompensa: { cash: 5 }, primeiraVolta: { itens: { 'chapeu-de-palha': 1 } } },
      ],
    },
    convite: { ligado: true, amigoChegaAoNivel: 5, recompensaPorAmigo: { cash: 10, ouroPorNivel: 50 }, limite: 3, convidado: { cash: 5, itens: { tabua: 6, prego: 12 } } },
    compartilhar: { ligado: true, recompensa: { ouroPorNivel: 10 }, limitePorDia: 1 },
  });
  b.loja.cash = {
    compraSimulada: true, cashPorReal: 10,
    pacotes: [{ id: 'punhado', nome: 'Punhado de cash', cash: 70, precoBRL: 6.9 }, { id: 'saco', nome: 'Saco de cash', cash: 230, precoBRL: 19.9 }],
    ofertas: [
      { id: 'concluir-relogio', nome: 'Concluir na hora', tipo: 'tempo', cash: null },
      { id: 'vaga-de-fila', nome: 'Vaga na fila', tipo: 'vaga', cash: null },
      { id: 'bota-de-couro', nome: 'Bota de couro', tipo: 'cosmetico', cash: 6, item: 'bota-de-couro' },
      { id: 'pintura-azul', nome: 'Ferramentas azuis', tipo: 'cosmetico', cash: 8, item: 'pintura-azul' },
      { id: 'gato-siames', nome: 'Gato siamês', tipo: 'estimacao', cash: 20, animal: 'gato-siames' },
      { id: 'cavalo-mangalarga', nome: 'Cavalo mangalarga', tipo: 'estimacao', cash: 50, animal: 'cavalo-mangalarga' },
    ],
  };
  b.animais = { ...(b.animais || {}), 'gato-siames': { nome: 'Gato siamês', familia: 'estimacao', preco: { cash: 20 }, nivel: 1, especial: true }, 'cavalo-mangalarga': { nome: 'Cavalo mangalarga', familia: 'trabalho', preco: { cash: 50 }, nivel: 3, especial: true } };
  b.regras.concluir = { coef: 0.28, expoente: 0.7, gratisAteSeg: 30, vale: ['relogio-de-teste', 'obra'], limitePorDia: 2 };
}

// um mundo com os dados de progresso; "muda" ainda pode trocar alguma coisa depois
export function mundoComProgresso(muda, opc = { agora: MEIO_DIA_MS }) {
  return novoMundo((b) => { comProgresso(b); if (muda) muda(b); }, opc);
}
