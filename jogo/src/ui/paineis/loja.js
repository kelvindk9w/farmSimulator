// Painel da loja de ouro: abas de loja.json, uma oferta por item, compra com um toque.
import { el, icone, botao } from '../dom.js';
import { T, numero, frase } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel } from './registro.js';
import { ofertasDaLoja } from '../../nucleo/sistemas/loja.js';
import { avisar } from '../avisos.js';
import { som } from '../../plataforma/som.js';

const TRAVADAS_A_MOSTRA = 2; // das ofertas que o nível ainda não libera, mostra só as próximas

function preco(n) { const s = el('span', 'preco'); s.append(icone('icone/ouro', 18), el('span', '', numero(n))); return s; }

function infoDe(m, it) {
  const D = m.dados;
  if (it.tipo === 'semente') { const c = D.culturas[D.culturaDaSemente[it.id]]; return c ? T.loja.cultura(c, D.itens[c.produto]) : ''; }
  if (it.funcao === 'regador') return T.loja.capacidadeRegador(it.capacidade);
  if (it.funcao === 'cesto') return T.loja.capacidadeCesto(it.capacidade);
  if (it.funcao === 'cinto') return T.loja.capacidadeCinto(it.capacidade);
  return it.descricao || '';
}

registrarPainel({
  id: 'loja', titulo: T.loja.titulo, icone: 'ui/loja', ordem: 30,
  montar(corpo, ctx, arg) {
    let aba = (arg && arg.aba) || null;
    function comprar(id, n) {
      const r = J.mundo.comando({ tipo: 'comprar', item: id, n });
      if (r.ok) som.tocar('moeda'); else { som.tocar('erro'); if (r.motivo !== 'sem-ouro') avisar(frase(r.motivo, r.dados, J.dados)); }
    }
    function desenhar() {
      const m = J.mundo, D = m.dados, abas = ofertasDaLoja(m);
      corpo.textContent = '';
      ctx.saldo.textContent = '';
      ctx.saldo.append(icone('icone/ouro', 20), el('span', '', numero(m.posses.ouro)));
      if (!abas.length) { corpo.append(el('div', 'vazio', T.loja.vazio)); return; }
      if (!abas.some((a) => a.id === aba)) aba = (arg && arg.item && (abas.find((a) => a.ofertas.some((o) => o.item === arg.item)) || {}).id) || abas[0].id;
      if (abas.length > 1) {
        const linha = el('div', 'abas');
        for (const a of abas) {
          const b = botao({ texto: a.nome, classe: 'aba' + (a.id === aba ? ' ativo' : ''), aoClicar: () => { aba = a.id; som.tocar('toque'); desenhar(); const n = corpo.querySelector(`[data-k="aba-${a.id}"]`); if (n) n.focus({ preventScroll: true }); } });
          b.dataset.k = 'aba-' + a.id;
          linha.append(b);
        }
        corpo.append(linha);
      }
      const grade = el('div', 'grade');
      let travadas = 0;
      for (const o of abas.find((a) => a.id === aba).ofertas) {
        if (!o.liberado && ++travadas > TRAVADAS_A_MOSTRA) continue;
        const it = D.itens[o.item], c = el('div', 'oferta' + (o.liberado ? '' : ' travada'));
        c.dataset.item = o.item;
        const nome = el('div', 'nome', it.nome);
        if (!o.unico && o.tem > 0) nome.append(el('small', '', ' ' + T.loja.tem(o.tem)));
        c.append(icone('icone/' + o.item, 44), nome);
        if (!o.liberado) {
          const info = el('div', 'info trava'); info.append(icone('ui/cadeado', 18), el('span', '', T.loja.nivel(o.nivel)));
          c.append(info);
        } else {
          c.append(el('div', 'info', infoDe(m, it)));
          const bs = el('div', 'botoes');
          const b1 = botao({ classe: 'verde', aoClicar: () => comprar(o.item, 1) });
          b1.append(el('span', '', T.loja.comprar), preco(o.preco)); b1.dataset.k = 'c1-' + o.item;
          if (m.posses.ouro < o.preco) b1.classList.add('sem');
          bs.append(b1);
          if (!o.unico) {
            const b5 = botao({ aoClicar: () => comprar(o.item, 5) });
            b5.append(el('span', '', '×5'), preco(o.preco * 5)); b5.dataset.k = 'c5-' + o.item;
            if (m.posses.ouro < o.preco * 5) b5.classList.add('sem');
            bs.append(b5);
          }
          c.append(bs);
        }
        grade.append(c);
      }
      corpo.append(grade);
    }
    desenhar();
    return { atualizar: desenhar };
  },
});
