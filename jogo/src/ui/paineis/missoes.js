// Painel das missões: a da vez (dá para reler a fala do vizinho) e as já cumpridas.
import { el, icone } from '../dom.js';
import { T, numero } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel } from './registro.js';
import { missaoAtual } from '../../nucleo/sistemas/missoes.js';

// o que mais o cartão da missão da vez mostra: cada frente põe (mundo, missaoAtual) → elemento | null
// (ui/fontes.js: o material que a obra da missão pede, o que falta e o "Onde conseguir?")
export const EXTRAS_DA_MISSAO = [];

// a recompensa em fichas: ouro, cash, xp, o bicho de presente e os itens
export function fichasDaRecompensa(D, r) {
  const caixa = el('div', 'itens');
  const ficha = (ic, texto) => { const e = el('div', 'item'); e.append(icone(ic, 26), el('span', '', texto)); caixa.append(e); };
  if (!r) return caixa;
  if (r.ouro > 0) ficha('icone/ouro', numero(r.ouro));
  if (r.cash > 0) ficha('icone/cash', numero(r.cash));
  if (r.xp > 0) ficha('icone/xp', `${numero(r.xp)} ${T.subida.xp}`);
  for (const k in r.animais || {}) if (D.animais && D.animais[k]) ficha('animal/' + k + '/parada-frente', `${r.animais[k] > 1 ? r.animais[k] + ' × ' : ''}${D.animais[k].nome}`);
  for (const k in r.itens || {}) ficha('icone/' + k, `${r.itens[k] > 1 ? r.itens[k] + ' × ' : ''}${D.itens[k] ? D.itens[k].nome : k}`);
  return caixa;
}

registrarPainel({
  id: 'missoes', titulo: T.missoes.titulo, icone: 'ui/missoes', ordem: 10,
  montar(corpo) {
    function desenhar() {
      const m = J.mundo, D = m.dados, a = missaoAtual(m);
      corpo.textContent = '';
      corpo.append(el('div', 'secao', T.missoes.atual));
      if (!a) corpo.append(el('div', 'nota', T.missoes.fim));
      else {
        const c = el('div', 'missao'), cab = el('div', 'linha');
        const ret = el('div', 'retrato'); ret.append(icone('retrato/' + D.missoes.vizinhoId, 44));
        const tit = el('div'); tit.append(el('b', '', a.missao.titulo), el('div', 'quem', D.missoes.vizinhoNome));
        cab.append(ret, tit);
        c.append(cab, el('p', '', a.esperaNivel ? T.missoes.espera(a.esperaNivel) : a.missao.fala));
        if (!a.esperaNivel) {
          const anda = el('div', 'anda'), barra = el('div', 'barra'), fio = el('i');
          fio.style.transform = `scaleX(${Math.min(1, a.conta / a.n)})`; barra.append(fio);
          anda.append(barra, el('span', '', T.tutorial.progresso(Math.min(a.conta, a.n), a.n)));
          c.append(anda);
          for (const f of EXTRAS_DA_MISSAO) { const x = f(m, a); if (x) c.append(x); }
          c.append(el('div', 'secao', T.missoes.recompensa), fichasDaRecompensa(D, a.missao.recompensa));
        }
        corpo.append(c);
      }
      corpo.append(el('div', 'secao', T.missoes.feitas));
      const feitas = D.missoes.vizinho.filter((x) => m.missoes.feitas.includes(x.id));
      if (!feitas.length) corpo.append(el('div', 'vazio', T.missoes.nenhuma));
      for (const x of feitas.reverse()) { const c = el('div', 'missao feita'); c.append(el('b', '', '✓ ' + x.titulo)); corpo.append(c); }
    }
    desenhar();
    return { atualizar: desenhar };
  },
});
