// Pedidos do quadro: abrir o quadro (a primeira vez o vizinho explica: é o "viuDica" que o painel manda), entregar o
// pedido completo, e trocar o pedido que ela não tem como fazer (só a troca grátis; a paga, só se ficar parado demais).
// O que os pedidos pedem entra no "quer" (guardar em vez de vender) e na lista de receitas a fazer.
import { X } from './jogo.mjs';
import { nota, evitado, evitar, comando, cmd, querer } from './contexto.mjs';
import { conseguivel } from './industria.mjs';

const PE = X.pedidos;
export const LIGADA = !!(PE && PE.quadroDePedidos);

// soma no Q tudo o que os pedidos abertos pedem; devolve a lista de receitas a fazer ([{ item, n, prio }])
export function querDosPedidos(J, Q, receitas) {
  if (!LIGADA) return;
  const q = PE.quadroDePedidos(J.m);
  if (!q.aberto) return;
  const R = X.industria ? X.industria.receitasDe(J.D) : null;
  for (const v of q.vagas) {
    if (v.estado !== 'pedido') continue;
    for (const l of v.linhas) {
      querer(Q, l.item, l.precisa);
      if (R && R.porItem[l.item]) receitas.push({ item: l.item, n: l.precisa, prio: 2 });
    }
  }
}

// abrir o quadro, entregar, trocar
export function pedidos(J, reservados) {
  if (!LIGADA || !comando(J, 'entregarPedido')) return null;
  const m = J.m, q = PE.quadroDePedidos(m);
  if (!q.aberto || !m.locais.fazenda.porId[PE.QUADRO]) return null;
  // a primeira vez: tocar no quadro (o painel abre, o vizinho explica)
  if (X.industria && !m.industria.dicas.quadro) return cmd(J, { tipo: 'viuDica', dica: 'quadro' }, 2, 'quadro');
  for (const v of q.vagas) {
    if (v.estado !== 'pedido') continue;
    if (v.pode) {
      // não entrega o que a missão da vez precisa guardado
      if (reservados && v.linhas.some((l) => reservados[l.item] > 0 && l.tem - l.precisa < reservados[l.item])) continue;
      if (evitado(J, 'entregar:' + v.vaga)) continue;
      evitar(J, 'entregar:' + v.vaga, 3);
      return cmd(J, { tipo: 'entregarPedido', vaga: v.vaga }, 2, 'entregar');
    }
    // pedido que ela não tem como fazer: troca (a grátis; a paga só depois de muito tempo parado)
    const impossivel = v.linhas.some((l) => l.tem < l.precisa && !conseguivel(J, l.item));
    const desde = (J.pedidoDesde || (J.pedidoDesde = {}));
    const chave = v.vaga + ':' + v.cliente + ':' + v.linhas.map((l) => l.item + l.precisa).join(',');
    if (!desde[chave]) desde[chave] = J.jogadoSeg || 0;
    const parado = (J.jogadoSeg || 0) - desde[chave];
    if ((impossivel && q.trocaGratis) || (impossivel && parado > 3 * 3600) || (q.trocaGratis && parado > 2 * 3600)) {
      if (evitado(J, 'trocar:' + v.vaga)) continue;
      evitar(J, 'trocar:' + v.vaga, 60);
      delete desde[chave];
      return cmd(J, { tipo: 'trocarPedido', vaga: v.vaga }, 3, 'trocar');
    }
  }
  return null;
}
export const prontos = (J) => (LIGADA ? PE.pedidosProntos(J.m) : 0);
