// Painel da mochila e do celeiro: o que está com a personagem (cesto, sementes, cinto) e o que está guardado.
import { el, icone, botao } from '../dom.js';
import { T } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel, abrirPainel, PAINEIS } from './registro.js';
import { noCesto, foraDoCesto, capacidadeDoCesto, noCeleiro, listaDeFerramentas } from '../../nucleo/sistemas/posses.js';

function secao(titulo, direita) { const s = el('div', 'secao'); s.append(el('span', '', titulo)); if (direita) s.append(el('span', '', direita)); return s; }
function itens(m, obj) {
  const caixa = el('div', 'itens'), ids = Object.keys(obj);
  if (!ids.length) { caixa.append(el('div', 'vazio', T.mochila.vazio)); return caixa; }
  for (const id of ids) { const e = el('div', 'item'); e.append(icone('icone/' + id, 30), el('span', '', `${obj[id]} × ${m.dados.itens[id].nome}`)); caixa.append(e); }
  return caixa;
}
function ferramentas(m, lista) {
  const caixa = el('div', 'itens');
  if (!lista.length) { caixa.append(el('div', 'vazio', T.mochila.vazio)); return caixa; }
  for (const id of lista) {
    const it = m.dados.itens[id], e = el('div', 'item'), t = el('span', '', it.nome);
    if (it.funcao === 'regador') t.append(el('small', '', ' ' + T.mochila.agua(m.posses.ferramentas[id].agua, it.capacidade)));
    e.append(icone('icone/' + id, 30), t);
    caixa.append(e);
  }
  return caixa;
}
// a frente de construir troca a coluna do que está guardado: SECOES.celeiro(m, coluna, { secao, itens, ferramentas })
// desenha o celeiro por móvel, e SECOES.guardado(m, item) diz o que da bolsa aparece lá (e some de "outras coisas")
export const SECOES = { celeiro: null, guardado: null };
const PECAS = { secao, itens, ferramentas };

registrarPainel({
  id: 'mochila', titulo: T.mochila.titulo, icone: 'ui/mochila', ordem: 20,
  montar(corpo) {
    function desenhar() {
      const m = J.mundo, P = m.posses;
      corpo.textContent = '';
      const col = el('div', 'colunas'), a = el('div'), b = el('div');
      const sementes = {}, outros = {};
      for (const k in P.bolsa) if (!SECOES.guardado || !SECOES.guardado(m, k)) (m.dados.itens[k].tipo === 'semente' ? sementes : outros)[k] = P.bolsa[k];
      a.append(secao(`${T.mochila.cesto}: ${m.dados.itens[P.cesto.item].nome}`, `${noCesto(m) - foraDoCesto(m)}/${capacidadeDoCesto(m)}`), itens(m, P.cesto.itens));
      a.append(secao(T.mochila.sementes), itens(m, sementes));
      if (Object.keys(outros).length) a.append(secao(T.mochila.outros), itens(m, outros));
      a.append(secao(T.mochila.cinto, T.mochila.vagas(listaDeFerramentas(m, 'cinto').length, P.vagasNoCinto)), ferramentas(m, listaDeFerramentas(m, 'cinto')));
      if (SECOES.celeiro) SECOES.celeiro(m, b, PECAS);
      else {
        b.append(secao(T.mochila.estoque, `${noCeleiro(m)}/${P.celeiro.capacidade}`), itens(m, P.celeiro.itens));
        b.append(secao(T.mochila.suporte), ferramentas(m, listaDeFerramentas(m, 'suporte')));
      }
      const noSitio = listaDeFerramentas(m, 'lugar'); // a enxada na estaca do campo, o regador ao lado do poço
      if (noSitio.length) b.append(secao(T.mochila.lugar), ferramentas(m, noSitio));
      col.append(a, b);
      corpo.append(col, el('div', 'nota', T.mochila.dica));
      // o desgaste e o conserto das ferramentas têm painel próprio
      if (PAINEIS.ferramentas) { const bf = botao({ icone: PAINEIS.ferramentas.icone, tamanho: 24, texto: T.ferramentas.abrir, aoClicar: () => abrirPainel('ferramentas') }); bf.dataset.k = 'ferramentas'; corpo.append(bf); }
    }
    desenhar();
    return { atualizar: desenhar };
  },
});
