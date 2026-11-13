// As missões do vizinho (Seu Tonho): uma sequência que serve de tutorial. Cada uma espera um evento do jogo
// ({ evento, filtro, n }); cumprida, dá a recompensa e a seguinte aparece. A sequência vem de missoes.json.
// A missão da vez é a primeira da lista que ainda não foi feita e que este jogo sabe cumprir (o evento está
// registrado e leva os campos do filtro): as que dependem de coisa que ainda não existe ficam para depois,
// sem travar a fila. Missão de nível mais alto que o do jogador espera ele subir. Missão com "valeJaTer" se cumpre
// na hora se o jogador já tem o que ela pede.
import { registrarSistema, registrarEvento, EVENTOS } from '../registro.js';
import { darRecompensa } from './posses.js';
import { darXp } from './niveis.js';

export function missaoPossivel(m, mi) {
  const ev = EVENTOS[mi.objetivo.evento], f = mi.objetivo.filtro;
  if (!ev) return false;
  if (f) { for (const k in f) if (!ev.campos.includes(k)) return false; if (ev.aceita && !ev.aceita(m.dados, f)) return false; }
  return true;
}
function daVez(m) {
  const M = m.missoes, lista = m.dados.missoes.vizinho;
  for (let i = 0; i < lista.length; i++) if (!M.feitas.includes(lista[i].id) && missaoPossivel(m, lista[i])) return lista[i];
  return null;
}

// a missão da vez: { missao, conta, n, esperaNivel (0 = já vale), feitas, total } ou null quando acabaram
const atual = { missao: null, conta: 0, n: 0, esperaNivel: 0, feitas: 0, total: 0 };
export function missaoAtual(m) {
  const mi = daVez(m);
  if (!mi) return null;
  const M = m.missoes;
  atual.missao = mi; atual.n = mi.objetivo.n; atual.conta = M.de === mi.id ? M.conta : 0;
  atual.esperaNivel = (mi.nivel || 1) > m.progresso.nivel ? mi.nivel : 0;
  atual.feitas = M.feitas.length; atual.total = m.dados.missoes.vizinho.length;
  return atual;
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

// cumpre a missão: marca, paga a recompensa e avisa (jaTinha = cumprida por "valeJaTer", sem o evento acontecer)
function concluir(m, mi, jaTinha) {
  const M = m.missoes;
  // a recompensa emite eventos (ganhouOuro, subiuDeNivel...): eles não contam para a missão seguinte, que só
  // começa depois de todos ouvirem o "missaoConcluida" desta (os avisos saem na ordem certa)
  M.ocupado = true;
  M.feitas.push(mi.id); M.de = null; M.conta = 0;
  darRecompensa(m, mi.recompensa, 'missao');
  if (mi.recompensa.xp > 0) darXp(m, mi.recompensa.xp, 'missao');
  const prox = daVez(m);
  m.eventos.emitir('missaoConcluida', { id: mi.id, titulo: mi.titulo, recompensa: mi.recompensa, proxima: prox ? prox.id : null, jaTinha: !!jaTinha });
  M.ocupado = false;
}

// "valeJaTer": a missão da vez pede uma coisa que o jogador já tem (comprou o regador antes de o vizinho pedir)?
// Então ela se cumpre na hora, e a seguinte também, se for o caso. Quem sabe se "já tem" é o evento do objetivo.
function conferir(m) {
  const M = m.missoes;
  for (let k = 0; k < 100 && !M.ocupado; k++) {
    const mi = daVez(m);
    if (!mi || !mi.valeJaTer || (mi.nivel || 1) > m.progresso.nivel) return;
    const ev = EVENTOS[mi.objetivo.evento];
    if (!ev.jaTem || !ev.jaTem(m, mi.objetivo.filtro || {}, mi.objetivo.n)) return;
    concluir(m, mi, true);
  }
}

function ouvir(m, dados, tipo) {
  const M = m.missoes;
  if (M.ocupado || !EVENTOS[tipo]) return;
  const mi = daVez(m);
  if (mi && (mi.nivel || 1) <= m.progresso.nivel && serve(mi.objetivo, tipo, dados)) {
    if (M.de !== mi.id) { M.de = mi.id; M.conta = 0; }
    // conta unidades quando o evento diz quantas ("n"); senão, uma por evento
    M.conta += dados && typeof dados.n === 'number' ? dados.n : 1;
    if (M.conta < mi.objetivo.n) m.eventos.emitir('missaoAndou', { id: mi.id, conta: M.conta, n: mi.objetivo.n });
    else concluir(m, mi, false);
  }
  conferir(m); // a missão que passou a valer (a seguinte, ou a que esperava o nível) pode já estar cumprida
}

registrarEvento('missaoAndou', { campos: ['id', 'conta', 'n'] });
registrarEvento('missaoConcluida', { campos: ['id', 'titulo', 'recompensa', 'proxima', 'jaTinha'] });

registrarSistema({
  id: 'missoes',
  iniciar(m) {
    m.missoes = { feitas: [], de: null, conta: 0, ocupado: false };
    m.eventos.ouvir('*', (dados, tipo) => ouvir(m, dados, tipo));
  },
  // ao abrir o jogo (novo ou gravado) e na volta de uma ausência não há evento: confere pelo relógio
  segundo: conferir,
  ausencia: conferir,
  salvar(m) { return { feitas: [...m.missoes.feitas], de: m.missoes.de, conta: m.missoes.conta }; },
  carregar(m, d) {
    const ids = new Set(m.dados.missoes.vizinho.map((x) => x.id)); // a lista pode ter mudado entre versões
    m.missoes.feitas = (d.feitas || []).filter((id) => ids.has(id));
    const mi = daVez(m);
    if (mi && d.de === mi.id) { m.missoes.de = mi.id; m.missoes.conta = Math.max(0, Math.min(d.conta || 0, mi.objetivo.n - 1)); }
  },
});
