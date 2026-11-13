// O caderno do vizinho: as lições que o Seu Tonho já deu, para reler quando quiser (o título, a fala e o que ela
// ensina). São as missões cumpridas e a da vez; nenhuma delas pede para gastar cash.
import { el, icone } from '../dom.js';
import { T } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel } from './registro.js';
import { ICONE, porVoltar } from '../progresso.js';
import { missaoAtual } from '../../nucleo/sistemas/missoes.js';

registrarPainel({
  id: 'caderno', titulo: T.caderno.titulo, icone: ICONE.caderno, ordem: 41, botao: false,
  montar(corpo, ctx, arg) {
    porVoltar(corpo, arg);
    function licao(x, agora) {
      const c = el('div', 'licao' + (agora ? ' agora' : '')), cab = el('div', 'linha');
      c.dataset.id = x.id;
      cab.append(el('b', '', x.titulo));
      if (x.ensina) cab.append(el('span', 'ensina', `${T.caderno.ensina}: ${x.ensina}`));
      cab.append(el('span', 'quando', agora ? T.caderno.agora : '✓'));
      c.append(cab, el('p', '', x.fala));
      return c;
    }
    function desenhar() {
      const m = J.mundo, D = m.dados, a = missaoAtual(m), nome = D.missoes.vizinhoNome;
      corpo.textContent = '';
      const topo = el('div', 'linha topo-do-caderno'), ret = el('div', 'retrato');
      ret.append(icone('retrato/' + D.missoes.vizinhoId, 44));
      topo.append(ret, el('div', 'nota', T.caderno.info(nome)));
      corpo.append(topo);
      const feitas = D.missoes.vizinho.filter((x) => m.missoes.feitas.includes(x.id));
      if (a && !a.esperaNivel) corpo.append(licao(a.missao, true));
      if (!feitas.length && !(a && !a.esperaNivel)) corpo.append(el('div', 'vazio', T.caderno.vazio(nome)));
      for (const x of feitas.reverse()) corpo.append(licao(x, false));
    }
    desenhar();
    // (não se refaz a cada evento: quem está lendo não perde o lugar; a lista é a de quando o caderno abriu)
    return {};
  },
});
