// Painel da loja de ouro: abas de loja.json, uma oferta por item, compra com um toque.
// A família da loja (este painel, "animais", "cash" e os enfeites do "construir") divide o mesmo cabeçalho (Loja, ouro
// e cash) e a fileira de seis abas: Sementes, Ferramentas, Materiais, Animais, Enfeites e Cash (faixaDaLoja).
import { el, icone, botao } from '../dom.js';
import { T, numero, frase } from '../textos.js';
import '../textos/interface.js';
import { J } from '../../contexto.js';
import { registrarPainel, abrirPainel, PAINEIS } from './registro.js';
import { ofertasDaLoja } from '../../nucleo/sistemas/loja.js';
import { avisar } from '../avisos.js';
import { som } from '../../plataforma/som.js';

const TRAVADAS_A_MOSTRA = 2; // das ofertas que o nível ainda não libera, mostra só as próximas
// abas que levam a outro painel (animais, enfeites, cash...): cada frente acrescenta a sua { id, nome, painel, arg }.
// Só as de NA_LOJA aparecem (construir e terras têm botão próprio: o do alto e o de "Minha fazenda"; as roupas ficam
// em "Minha fazenda").
export const ABAS_DE_FORA = [];
const NA_LOJA = ['animais', 'enfeites', 'cash']; // (nesta ordem, depois das abas de loja.json)
const ICONE_DA_ABA = { sementes: 'icone/semente-milho', ferramentas: 'icone/martelo', materiais: 'icone/madeira', animais: 'animal/galinha/parada-frente', enfeites: 'objeto/canteiro-de-flores', cash: 'icone/cash' };
// a linha de informação de uma oferta: cada frente acrescenta (mundo, item) → texto | null para o que é dela
export const INFO_DA_OFERTA = [];

function preco(n) { const s = el('span', 'preco'); s.append(icone('icone/ouro', 22), el('span', '', numero(n))); return s; }

// o cabeçalho e as abas da família da loja; "atual" é a aba acesa; escolher(id) troca de aba sem reabrir (só a loja)
export function faixaDaLoja(ctx, atual, escolher) {
  const m = J.mundo;
  if (!ctx.abas) return;
  ctx.veu.classList.add('da-loja');
  ctx.titulo(T.loja.titulo, 'ui/loja');
  ctx.saldo.textContent = '';
  ctx.saldo.classList.add('duas');
  for (const [ic, v, t] of [['icone/ouro', m.posses.ouro, T.hud.ouro], ['icone/cash', m.posses.cash, T.hud.cash]]) { const p = el('span', 'moeda'); p.title = t; p.append(icone(ic, 26), el('span', '', numero(v))); ctx.saldo.append(p); }
  const linha = ctx.abas;
  linha.textContent = '';
  linha.hidden = false;
  const abas = [...ofertasDaLoja(m).map((a) => ({ id: a.id, nome: a.nome })), ...NA_LOJA.map((id) => ABAS_DE_FORA.find((a) => a.id === id)).filter((a) => a && PAINEIS[a.painel])];
  for (const a of abas) {
    const b = botao({ icone: ICONE_DA_ABA[a.id] || 'ui/loja', tamanho: 26, texto: (T.loja.abasCurtas && T.loja.abasCurtas[a.id]) || a.nome, classe: 'aba' + (a.id === atual ? ' ativo' : ''), rotulo: a.nome, aoClicar: () => {
      som.tocar('toque');
      if (a.painel) abrirPainel(a.painel, a.arg); else if (escolher) escolher(a.id); else abrirPainel('loja', { aba: a.id });
    } });
    b.dataset.k = 'aba-' + a.id;
    linha.append(b);
  }
}

function infoDe(m, it) {
  const D = m.dados;
  for (const f of INFO_DA_OFERTA) { const t = f(m, it); if (t) return t; }
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
      if (!abas.length) { faixaDaLoja(ctx, null); corpo.append(el('div', 'vazio', T.loja.vazio)); return; }
      if (!abas.some((a) => a.id === aba)) aba = (arg && arg.item && (abas.find((a) => a.ofertas.some((o) => o.item === arg.item)) || {}).id) || abas[0].id;
      faixaDaLoja(ctx, aba, (id) => { aba = id; desenhar(); const n = ctx.abas.querySelector(`[data-k="aba-${id}"]`); if (n) n.focus({ preventScroll: true }); });
      const grade = el('div', 'grade');
      let travadas = 0;
      for (const o of abas.find((a) => a.id === aba).ofertas) {
        if (!o.liberado && ++travadas > TRAVADAS_A_MOSTRA) continue;
        const it = D.itens[o.item], c = el('div', 'oferta' + (o.liberado ? '' : ' travada'));
        c.dataset.item = o.item;
        const nome = el('div', 'nome', it.nome);
        if (!o.unico && o.tem > 0) nome.append(el('small', '', ' ' + T.loja.tem(o.tem)));
        c.append(icone('icone/' + o.item, 48), nome);
        if (!o.liberado) {
          // travada: o cadeado no canto e o botão marrom (que não é botão) com o nível
          const info = el('div', 'info trava'); info.title = T.loja.nivel(o.nivel); info.append(icone('ui/cadeado', 24), el('span', '', T.loja.nivelCurto(o.nivel)));
          c.append(info);
        } else {
          c.append(el('div', 'info', infoDe(m, it)));
          const bs = el('div', 'botoes');
          // o botão verde mostra só a moeda e o preço ("Comprar" fica para o leitor de tela)
          const b1 = botao({ classe: 'verde', rotulo: T.loja.comprarPor(it.nome, 1, numero(o.preco)), aoClicar: () => comprar(o.item, 1) });
          b1.append(el('span', '', T.loja.comprar), preco(o.preco)); b1.dataset.k = 'c1-' + o.item;
          if (m.posses.ouro < o.preco) b1.classList.add('sem');
          bs.append(b1);
          if (!o.unico) {
            const b5 = botao({ classe: 'mais', rotulo: T.loja.comprarPor(it.nome, 5, numero(o.preco * 5)), aoClicar: () => comprar(o.item, 5) });
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
