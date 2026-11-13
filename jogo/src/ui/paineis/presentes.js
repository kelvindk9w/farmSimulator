// Painel do presente do dia: a cartela dos sete dias e o botão de abrir o de hoje. A casa avança por dia JOGADO:
// quem falta um dia continua de onde parou. Sem contador de sequência e sem aviso de perda.
import { el, icone, botao } from '../dom.js';
import { T, numero } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel } from './registro.js';
import { ICONE, porVoltar, mandar } from '../progresso.js';
import { estadoDaDiaria } from '../../nucleo/sistemas/diaria.js';

// o prêmio de um dia em miniatura: até três ícones com a quantidade
function miniatura(r) {
  const caixa = el('div', 'mini'), lista = [];
  if (r.ouro > 0) lista.push(['icone/ouro', numero(r.ouro)]);
  if (r.cash > 0) lista.push(['icone/cash', numero(r.cash)]);
  if (r.xp > 0) lista.push(['icone/xp', numero(r.xp)]);
  for (const k in r.itens || {}) lista.push(['icone/' + k, r.itens[k] > 1 ? '×' + r.itens[k] : '']);
  for (const [ic, n] of lista.slice(0, 3)) { const p = el('span', 'par'); p.append(icone(ic, lista.length > 1 ? 26 : 34)); if (n) p.append(el('span', '', n)); caixa.append(p); }
  return caixa;
}

registrarPainel({
  id: 'presentes', titulo: T.presentes.titulo, icone: ICONE.presentes, ordem: 37, botao: false,
  montar(corpo, ctx, arg) {
    porVoltar(corpo, arg);
    function desenhar() {
      const P = T.presentes, e = estadoDaDiaria(J.mundo);
      corpo.textContent = '';
      corpo.append(el('div', 'nota', P.info));
      const cartela = el('div', 'cartela');
      for (const d of e.dias) {
        const c = el('div', 'dia ' + d.estado);
        c.dataset.dia = d.dia;
        c.append(el('div', 'rot', P.dia(d.dia)), miniatura(d.recompensa), el('div', 'estado', d.estado === 'aberto' ? '✓ ' + P.aberto : d.estado === 'hoje' ? P.hoje : d.estado === 'amanha' ? P.amanha : ''));
        cartela.append(c);
      }
      corpo.append(cartela);
      const pe = el('div', 'pe');
      if (e.tem) { const b = botao({ icone: ICONE.presentes, tamanho: 30, texto: P.abrir, classe: 'verde', aoClicar: () => mandar({ tipo: 'abrirPresente' }) }); b.dataset.k = 'abrir-presente'; pe.append(b); }
      else pe.append(el('div', 'nota bom', e.completa ? P.completa : P.volta));
      corpo.append(pe);
    }
    desenhar();
    return { atualizar: desenhar };
  },
});
