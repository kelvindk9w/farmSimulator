// Painel das ferramentas: o que está no cinto, no suporte do celeiro e pelo sítio (no lugar delas), o quanto cada uma ainda aguenta e o conserto
// com um toque (de qualquer lugar). Abre pelo aviso de ferramenta gasta do HUD e pelo botão da mochila.
import { el, icone, botao } from '../dom.js';
import '../terras.js';
import { T, numero, frase } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel } from './registro.js';
import { listaDeFerramentas } from '../../nucleo/sistemas/posses.js';
import { estadoDoItem, precoDoConserto, itensGastando } from '../../nucleo/sistemas/desgaste.js';
import { avisar } from '../avisos.js';
import { som } from '../../plataforma/som.js';

function preco(n) { const s = el('span', 'preco'); s.append(icone('icone/ouro', 18), el('span', '', numero(n))); return s; }
function secao(titulo, direita) { const s = el('div', 'secao'); s.append(el('span', '', titulo)); if (direita) s.append(el('span', '', direita)); return s; }

registrarPainel({
  id: 'ferramentas', titulo: T.ferramentas.titulo, icone: 'icone/martelo', ordem: 25, botao: false,
  montar(corpo, ctx) {
    function consertar(c) {
      const r = J.mundo.comando({ tipo: 'consertar', ...c });
      if (r.ok) som.tocar('moeda'); else { som.tocar('erro'); if (r.motivo !== 'sem-ouro') avisar(frase(r.motivo, r.dados, J.dados)); }
    }
    function cartao(m, id) {
      // (o conserto só se oferece para o que está gasto ou quase: antes disso não há o que decidir)
      const it = m.dados.itens[id], e = estadoDoItem(m, id), pede = e.total > 0 && e.fracao <= m.dados.desgaste.avisoEm, custo = pede ? precoDoConserto(m, id) : 0, c = el('div', 'oferta ferramenta' + (e.total && e.usos <= 0 ? ' gasta' : ''));
      c.dataset.item = id;
      const nome = el('div', 'nome', it.nome), f = m.posses.ferramentas[id];
      if (f && it.funcao === 'regador') nome.append(el('small', '', ' ' + T.ferramentas.agua(f.agua, it.capacidade)));
      c.append(icone('icone/' + id, 44), nome);
      const info = el('div', 'info');
      if (!e.total) info.textContent = T.ferramentas.nova;
      else {
        const barra = el('div', 'barra uso' + (e.usos <= 0 ? ' gasta' : e.fracao <= m.dados.desgaste.avisoEm ? ' pouco' : '')), fio = el('i');
        fio.style.transform = `scaleX(${Math.max(0.03, e.fracao)})`; barra.append(fio);
        info.append(barra, el('span', '', e.usos <= 0 ? T.ferramentas.gasta : T.ferramentas.boa(e.usos)));
      }
      c.append(info);
      if (custo > 0) {
        const bs = el('div', 'botoes'), b = botao({ classe: e.usos <= 0 ? 'verde' : '', aoClicar: () => consertar({ item: id }) });
        b.append(el('span', '', T.ferramentas.consertar), preco(custo)); b.dataset.k = 'conserto-' + id;
        if (m.posses.ouro < custo) b.classList.add('sem');
        bs.append(b); c.append(bs);
      }
      return c;
    }
    function grade(m, lista) {
      const g = el('div', 'grade');
      if (!lista.length) { g.append(el('div', 'vazio', T.mochila.vazio)); return g; }
      for (const id of lista) g.append(cartao(m, id));
      return g;
    }
    function desenhar() {
      const m = J.mundo, P = m.posses;
      corpo.textContent = '';
      ctx.saldo.textContent = '';
      ctx.saldo.append(icone('icone/ouro', 20), el('span', '', numero(P.ouro)));
      const aConsertar = itensGastando(m).filter((g) => g.preco > 0), total = aConsertar.reduce((s, g) => s + g.preco, 0);
      if (aConsertar.length > 1) {
        const linha = el('div', 'abas'), b = botao({ classe: 'verde', aoClicar: () => consertar({ tudo: true }) });
        b.append(el('span', '', T.ferramentas.tudo(total))); b.dataset.k = 'conserto-tudo';
        if (P.ouro < total) b.classList.add('sem');
        linha.append(b); corpo.append(linha);
      }
      const cinto = listaDeFerramentas(m, 'cinto'), suporte = listaDeFerramentas(m, 'suporte'), noSitio = listaDeFerramentas(m, 'lugar');
      corpo.append(secao(T.ferramentas.cinto, T.ferramentas.vagas(cinto.length, P.vagasNoCinto)), grade(m, cinto));
      if (suporte.length) corpo.append(secao(T.ferramentas.suporte), grade(m, suporte));
      if (noSitio.length) corpo.append(secao(T.ferramentas.lugar), grade(m, noSitio));
      corpo.append(secao(T.ferramentas.recipientes), grade(m, P.recipientes));
      corpo.append(el('div', 'nota', aConsertar.length ? T.ferramentas.nota : T.ferramentas.emDia + ' ' + T.ferramentas.nota));
    }
    desenhar();
    return { atualizar: desenhar };
  },
});
