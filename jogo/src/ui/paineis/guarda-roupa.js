// O guarda-roupa: as peças por parte (cabeça, roupa, pés, ferramentas), a prova na personagem antes de comprar,
// o que é dela, o que se compra (com ouro ou com cash) e o que ela está vestindo. A peça que ainda não tem desenho
// aparece como "em breve" e não se vende.
import { el, icone, botao } from '../dom.js';
import { T, numero } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel } from './registro.js';
import { ICONE, porVoltar, mandar, roupaDeAgora } from '../progresso.js';
import { perguntar } from '../dialogo.js';
import { som } from '../../plataforma/som.js';
import { guardaRoupa } from '../../nucleo/sistemas/roupas.js';
import { desenharProva, chaveDasRoupas } from '../../render/roupas.js';

const preco = (ic, n) => { const s = el('span', 'preco'); s.append(icone(ic, 18), el('span', '', numero(n))); return s; };

registrarPainel({
  id: 'guarda-roupa', titulo: T.roupas.titulo, icone: ICONE.roupas, ordem: 40, botao: false,
  montar(corpo, ctx, arg) {
    porVoltar(corpo, arg);
    const R = T.roupas, caixa = el('div', 'guarda-roupa'), prova = el('div', 'prova'), lista = el('div', 'pecas-por-parte');
    const tela = el('canvas'); tela.width = 300; tela.height = 380;
    const legenda = el('div', 'legenda'), acao = el('div', 'acao');
    prova.append(tela, legenda, acao);
    caixa.append(prova, lista); corpo.append(caixa);
    let escolhida = null, desenhada = null, tentar = 0;

    const achar = (m, id) => { for (const g of guardaRoupa(m)) for (const p of g.itens) if (p.id === id) return p; return null; };
    // a personagem com a peça escolhida por cima do que ela veste (só o que o desenho sabe mostrar)
    function provar() {
      const m = J.mundo, v = roupaDeAgora(m), p = escolhida && achar(m, escolhida);
      if (p && p.pronto) v[p.parte] = p.id;
      const chave = chaveDasRoupas(v);
      if (chave === desenhada) return;
      if (desenharProva(J.atlas, tela, v)) desenhada = chave;
      else if (tentar++ < 40) setTimeout(provar, 150); // a arte ainda está chegando
    }
    function comprarComCash(p) {
      const fazer = () => { const r = mandar({ tipo: 'comprarOferta', oferta: p.oferta }); if (r.ok) J.mundo.comando({ tipo: 'vestir', item: p.id }); };
      if (J.mundo.posses.cash < p.cash) { fazer(); return; }
      perguntar({ icone: 'icone/' + p.id, titulo: R.titulo, texto: R.perguntaCash(p.nome, p.cash), nota: T.cash.saldo(J.mundo.posses.cash), sim: R.comprarCash, aoSim: fazer });
    }
    function desenhar() {
      const m = J.mundo, grupos = guardaRoupa(m);
      ctx.saldo.textContent = '';
      ctx.saldo.append(icone('icone/ouro', 20), el('span', '', numero(m.posses.ouro)), icone('icone/cash', 20), el('span', '', numero(m.posses.cash)));
      // ---- as peças
      lista.textContent = '';
      for (const g of grupos) {
        lista.append(el('div', 'secao', R.partes[g.parte] || g.parte));
        const fila = el('div', 'pecas');
        for (const p of g.itens) {
          const b = botao({ icone: 'icone/' + p.id, tamanho: 44, classe: 'peca' + (p.id === escolhida ? ' ativo' : '') + (p.vestindo ? ' vestindo' : '') + (p.tem ? ' tem' : '') + (p.pronto ? '' : ' em-breve'), rotulo: p.nome, aoClicar: () => { escolhida = p.id; som.tocar('toque'); desenhar(); } });
          b.dataset.k = 'peca-' + p.id; b.dataset.item = p.id;
          const pe = el('span', 'pe');
          if (p.vestindo) pe.textContent = R.usando;
          else if (p.tem) pe.textContent = R.tem;
          else if (!p.pronto) pe.textContent = T.cash.emBreve;
          else if (p.ouro > 0) pe.append(preco('icone/ouro', p.ouro));
          else if (p.cash > 0) pe.append(preco('icone/cash', p.cash));
          else pe.textContent = R.premioCurto;
          b.append(pe);
          fila.append(b);
        }
        lista.append(fila);
      }
      // ---- a peça escolhida: o nome e o que dá para fazer com ela
      const p = escolhida && achar(m, escolhida);
      legenda.textContent = ''; acao.textContent = '';
      if (!p) legenda.append(el('div', 'nota', R.escolha));
      else {
        legenda.append(el('b', '', p.nome), el('div', 'nota', p.descricao));
        const bt = (k, texto, classe, f, extra) => { const b = botao({ texto, classe, aoClicar: f }); if (extra) b.append(extra); b.dataset.k = k; acao.append(b); };
        if (p.vestindo) bt('tirar', R.tirar, '', () => mandar({ tipo: 'tirar', parte: p.parte }));
        else if (p.tem && p.pronto) bt('vestir', R.vestir, 'verde', () => mandar({ tipo: 'vestir', item: p.id }));
        else if (!p.pronto) acao.append(el('div', 'nota', R.emBreve));
        else if (!p.liberado) acao.append(el('div', 'nota', R.nivel(p.nivel)));
        else if (p.ouro > 0 || p.cash > 0) {
          if (p.ouro > 0) { bt('comprar-ouro', R.comprarOuro, 'verde' + (m.posses.ouro < p.ouro ? ' sem' : ''), () => mandar({ tipo: 'comprarCosmetico', item: p.id }), preco('icone/ouro', p.ouro)); }
          if (p.cash > 0) bt('comprar-cash', R.comprarCash, 'verde' + (m.posses.cash < p.cash ? ' sem' : ''), () => comprarComCash(p), preco('icone/cash', p.cash));
        } else acao.append(el('div', 'nota', R.premio));
      }
      provar();
    }
    desenhar();
    return { atualizar: desenhar };
  },
});
