// A aba "Animais" da loja: os bichos de todas as famílias que se compram com ouro (os especiais são da loja de cash).
// Cada cartão traz a figura (o primeiro quadro de animal/<id>/parada-frente), o preço, o que o bicho dá e o que
// falta para comprar: nível, o abrigo pronto (com o atalho para construir), vaga (com o atalho para o abrigo), ouro.
// As outras famílias dizem o que o bicho delas faz por INFO_DO_ANIMAL: (mundo, def) → texto | null.
import { el, icone, botao } from '../dom.js';
import '../animais.js'; // os textos, o desenho no terreno e o retorno desta frente
import { T, numero } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel, abrirPainel } from './registro.js';
import { ABAS_DE_FORA } from './loja.js';
import { porVoltar } from '../progresso.js';
import { som } from '../../plataforma/som.js';
import { ofertasDeAnimais, abrigosProntos } from '../../nucleo/sistemas/animais.js';

const TRAVADAS_A_MOSTRA = 2; // dos bichos que o nível ainda não libera, mostra só os próximos
export const INFO_DO_ANIMAL = [];
function infoDe(m, d) {
  for (const f of INFO_DO_ANIMAL) { const t = f(m, d); if (t) return t; }
  return T.animais.resumo(d, m.dados) || d.descricao || '';
}
function preco(n) { const s = el('span', 'preco'); s.append(icone('icone/ouro', 18), el('span', '', numero(n))); return s; }

registrarPainel({
  id: 'animais', titulo: T.animais.titulo, icone: 'animal/galinha/parada-frente', ordem: 31, botao: false,
  montar(corpo, ctx, arg) {
    porVoltar(corpo, { de: (arg && arg.de) || 'loja' });
    function desenhar() {
      const m = J.mundo, D = m.dados, lista = ofertasDeAnimais(m);
      corpo.textContent = '';
      ctx.saldo.textContent = '';
      ctx.saldo.append(icone('icone/ouro', 20), el('span', '', numero(m.posses.ouro)));
      if (!lista.length) { corpo.append(el('div', 'vazio', T.animais.vazio)); return; }
      const grade = el('div', 'grade animais');
      let travadas = 0;
      for (const o of lista) {
        if (!o.liberado && ++travadas > TRAVADAS_A_MOSTRA) continue;
        const d = D.animais[o.animal], c = el('div', 'oferta animal' + (o.liberado ? '' : ' travada'));
        c.dataset.item = o.animal;
        const nome = el('div', 'nome', o.nome);
        if (o.tem > 0) nome.append(el('small', '', ' ' + T.animais.tem(o.tem)));
        c.append(icone('animal/' + o.animal + '/parada-frente', 52), nome);
        if (!o.liberado) {
          const info = el('div', 'info trava'); info.append(icone('ui/cadeado', 18), el('span', '', T.animais.nivel(o.nivel)), preco(o.preco));
          c.append(info);
          grade.append(c);
          continue;
        }
        c.append(el('div', 'info', infoDe(m, d)));
        const bs = el('div', 'botoes'), motivo = o.pode.ok ? null : o.pode.motivo;
        if (motivo === 'sem-abrigo') {
          // falta o abrigo: o cartão diz qual e leva ao catálogo de construir
          c.append(el('div', 'info falta', T.animais.precisaDe(D, o.abrigo)));
          const b = botao({ icone: 'icone/martelo', tamanho: 22, texto: T.animais.construirAbrigo(D, o.abrigo), aoClicar: () => { som.tocar('toque'); abrirPainel('construir', { id: o.abrigo, categoria: 'abrigo' }); } });
          b.dataset.k = 'construir-' + o.animal;
          nome.append(preco(o.preco)); // (o preço fica no nome: o botão é o da obra, não o do bicho)
          bs.append(b);
        } else if (motivo === 'abrigo-cheio') {
          // sem vaga: leva ao abrigo, onde está a ampliação
          c.append(el('div', 'info falta', T.animais.semVaga(D, o.abrigo)));
          const e = abrigosProntos(m, o.abrigo)[0];
          const b = botao({ texto: T.animais.verOAbrigo(D, o.abrigo), aoClicar: () => { som.tocar('toque'); if (e) abrirPainel('abrigo', { entidade: e.id }); } });
          b.dataset.k = 'ver-' + o.animal;
          nome.append(preco(o.preco));
          bs.append(b);
        } else {
          if (motivo && motivo !== 'sem-ouro') c.append(el('div', 'info falta', T.motivos[motivo] ? T.motivos[motivo](o.pode.dados, D) : motivo));
          const b = botao({ classe: 'verde', aoClicar: () => { const r = m.comando({ tipo: 'comprarAnimal', animal: o.animal }); som.tocar(r.ok ? 'moeda' : 'erro'); } });
          b.append(el('span', '', T.animais.comprar), preco(o.preco));
          b.dataset.k = 'comprar-' + o.animal;
          if (motivo) b.classList.add('sem');
          bs.append(b);
        }
        c.append(bs);
        grade.append(c);
      }
      corpo.append(grade);
    }
    desenhar();
    return { atualizar: desenhar };
  },
});

// a aba "Animais" da loja leva a este painel
ABAS_DE_FORA.push({ id: 'animais', nome: T.animais.aba, painel: 'animais' });
