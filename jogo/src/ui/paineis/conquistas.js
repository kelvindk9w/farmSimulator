// Painel das conquistas: uma barra por marco, o próximo prêmio e o botão de receber quando o marco foi alcançado.
// O prêmio só entra nas posses quando o jogador recebe; aí aparece a tela de recompensa.
import { el, icone, botao } from '../dom.js';
import { T } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel } from './registro.js';
import { ICONE, porVoltar, mandar, metaDaConquista } from '../progresso.js';
import { fichasDaRecompensa } from './missoes.js';
import { listaDeConquistas } from '../../nucleo/sistemas/conquistas.js';

registrarPainel({
  id: 'conquistas', titulo: T.conquistas.titulo, icone: ICONE.conquistas, ordem: 36, botao: false,
  montar(corpo, ctx, arg) {
    porVoltar(corpo, arg);
    function desenhar() {
      const m = J.mundo, D = m.dados, lista = listaDeConquistas(m), C = T.conquistas;
      corpo.textContent = '';
      if (!lista.length) { corpo.append(el('div', 'vazio', C.vazio)); return; }
      const grade = el('div', 'grade conquistas');
      for (const e of lista) {
        const c = el('div', 'conquista' + (e.prontas > 0 ? ' pronta' : e.completa ? ' completa' : ''));
        c.dataset.id = e.id;
        const cab = el('div', 'linha');
        cab.append(icone(ICONE.conquistas, 32), el('div', 'nome', e.nome), el('span', 'marcos', C.marcos(e.recebidos, e.marcos.length)));
        c.append(cab);
        if (e.proximo) {
          const p = e.proximo, anda = el('div', 'anda'), barra = el('div', 'barra'), fio = el('i');
          fio.style.transform = `scaleX(${Math.max(0, Math.min(1, e.valor / p.alvo))})`;
          barra.append(fio); anda.append(barra, el('span', '', C.anda(e.valor, p.alvo)));
          const pe = el('div', 'pe');
          pe.append(fichasDaRecompensa(D, p.recompensa));
          if (p.pronta) { const b = botao({ texto: C.receber, classe: 'verde', aoClicar: () => mandar({ tipo: 'receberConquista', id: e.id }) }); b.dataset.k = 'receber-' + e.id; pe.append(b); }
          c.append(el('div', 'info', metaDaConquista(e.id, p.alvo)), anda, pe);
        } else c.append(el('div', 'info feita', C.completa));
        grade.append(c);
      }
      corpo.append(grade);
    }
    desenhar();
    return { atualizar: desenhar };
  },
});
