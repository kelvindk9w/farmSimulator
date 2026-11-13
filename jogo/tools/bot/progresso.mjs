// Progresso: o presente do dia, o prêmio das conquistas e o correio (o que espera para abrir). Coisa de um ou dois
// toques que o jogador faz ao abrir o jogo. O cash grátis que vem daí fica guardado (o bot não gasta cash).
import { X } from './jogo.mjs';
import { comando, cmd, evitado, evitar } from './contexto.mjs';

export function progresso(J) {
  const m = J.m;
  if (m.agora < (J.proxProgresso || 0)) return null;
  if (X.diaria && comando(J, 'abrirPresente') && X.diaria.temPresente(m) && !evitado(J, 'presente')) { evitar(J, 'presente', 60); return cmd(J, { tipo: 'abrirPresente' }, 2, 'presente'); }
  if (X.conquistas && comando(J, 'receberConquista') && X.conquistas.conquistasProntas(m) > 0) {
    for (const e of X.conquistas.listaDeConquistas(m)) if (e.prontas > 0 && !evitado(J, 'conquista:' + e.id)) { evitar(J, 'conquista:' + e.id, 30); return cmd(J, { tipo: 'receberConquista', id: e.id }, 2, 'conquista'); }
  }
  if (X.correio && comando(J, 'abrirCorreio') && X.correio.quantosNoCorreio(m) > 0 && !evitado(J, 'correio')) { evitar(J, 'correio', 30); return cmd(J, { tipo: 'abrirCorreio' }, 2, 'correio'); }
  J.proxProgresso = m.agora + 20000;
  return null;
}
