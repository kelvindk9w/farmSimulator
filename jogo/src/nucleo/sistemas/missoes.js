// As missões do vizinho (Seu Tonho): uma sequência que serve de tutorial. Cada uma espera um evento do jogo
// ({ evento, filtro, n }); cumprida, dá a recompensa e passa para a próxima. A sequência vem de missoes.json.
import { registrarSistema } from '../registro.js';
import { darRecompensa } from './posses.js';
import { darXp } from './niveis.js';

// a missão em andamento: { missao, conta, n, indice, total } ou null quando acabaram
export function missaoAtual(m) {
  const lista = m.dados.missoes.vizinho, i = m.missoes.indice;
  if (i >= lista.length) return null;
  return { missao: lista[i], conta: m.missoes.conta, n: lista[i].objetivo.n, indice: i, total: lista.length };
}

// o evento serve para o objetivo? Todo campo do filtro tem de bater com o do evento (lista = qualquer um dos valores).
function serve(objetivo, tipo, dados) {
  if (objetivo.evento !== tipo) return false;
  const f = objetivo.filtro;
  if (!f) return true;
  for (const k in f) {
    const v = dados ? dados[k] : undefined;
    if (Array.isArray(f[k]) ? !f[k].includes(v) : f[k] !== v) return false;
  }
  return true;
}

function ouvir(m, dados, tipo) {
  const M = m.missoes, lista = m.dados.missoes.vizinho;
  if (M.indice >= lista.length || M.ocupado) return;
  const mi = lista[M.indice];
  if (!serve(mi.objetivo, tipo, dados)) return;
  // conta unidades quando o evento diz quantas ("n"); senão, uma por evento
  M.conta += dados && typeof dados.n === 'number' ? dados.n : 1;
  if (M.conta < mi.objetivo.n) { m.eventos.emitir('missaoAndou', { id: mi.id, conta: M.conta, n: mi.objetivo.n }); return; }
  M.ocupado = true; // a recompensa emite eventos (ganhouOuro, subiuDeNivel...): eles não contam para a missão seguinte
  M.feitas.push(mi.id); M.indice++; M.conta = 0;
  darRecompensa(m, mi.recompensa, 'missao');
  m.eventos.emitir('missaoConcluida', { id: mi.id, titulo: mi.titulo, recompensa: mi.recompensa, proxima: M.indice < lista.length ? lista[M.indice].id : null });
  if (mi.recompensa.xp > 0) darXp(m, mi.recompensa.xp, 'missao');
  M.ocupado = false;
}

registrarSistema({
  id: 'missoes',
  iniciar(m) {
    m.missoes = { indice: 0, conta: 0, feitas: [], ocupado: false };
    m.eventos.ouvir('*', (dados, tipo) => ouvir(m, dados, tipo));
  },
  salvar(m) { return { feitas: [...m.missoes.feitas], conta: m.missoes.conta }; },
  carregar(m, d) {
    // retoma na primeira missão ainda não feita (a lista pode ter mudado entre versões)
    const lista = m.dados.missoes.vizinho, feitas = new Set(d.feitas || []);
    let i = 0;
    while (i < lista.length && feitas.has(lista[i].id)) i++;
    m.missoes.feitas = lista.slice(0, i).map((x) => x.id);
    m.missoes.indice = i;
    m.missoes.conta = i < lista.length ? Math.min(d.conta || 0, lista[i].objetivo.n - 1) : 0;
  },
});
