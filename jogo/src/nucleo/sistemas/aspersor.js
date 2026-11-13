// O aspersor (construcoes.json: aspersor, efeito { tipo: 'regar', raio }): rega sozinho as casas em volta, também
// com o jogo fechado. Quem põe o aspersor no terreno é o sistema de construir (construcao.js); aqui só importa que
// exista no local uma entidade de tipo "aspersor" já pronta (sem obra em andamento).
// A planta ao alcance não espera pela rega: acabou um trecho de crescimento, o seguinte começa no mesmo instante
// (lavoura.js, REGA_SOZINHA). A que já estava com sede começa a crescer no segundo seguinte.
import { registrarSistema } from '../registro.js';
import { REGA_SOZINHA, molharCasa, resolver } from './lavoura.js';

export const TIPO_DO_ASPERSOR = 'aspersor';
// quantas casas o aspersor alcança para cada lado (2 = as 24 casas em volta)
export function raioDoAspersor(m) {
  const c = (m.dados.construcoes && m.dados.construcoes[TIPO_DO_ASPERSOR]) || (m.dados.bruto.construcoes || {})[TIPO_DO_ASPERSOR];
  const r = c && c.efeito && c.efeito.raio;
  return r >= 1 ? Math.round(r) : 2;
}
const pronto = (e) => e.tipo === TIPO_DO_ASPERSOR && !(e.obraAte > 0);

// os aspersores prontos de um local (a lista se refaz quando alguma entidade entra ou sai dele)
const listas = new WeakMap();
export function aspersoresDe(loc) {
  let g = listas.get(loc);
  if (!g) { g = { versao: -1, lista: [], emObra: [] }; listas.set(loc, g); }
  if (g.versao !== loc.versao) {
    g.versao = loc.versao; g.lista.length = 0; g.emObra.length = 0;
    for (const e of loc.entidades) if (e.tipo === TIPO_DO_ASPERSOR) (pronto(e) ? g.lista : g.emObra).push(e);
  } else if (g.emObra.length) {
    for (let k = g.emObra.length - 1; k >= 0; k--) if (pronto(g.emObra[k])) g.lista.push(g.emObra.splice(k, 1)[0]); // a obra acabou
  }
  return g.lista;
}
// as casas que um aspersor em (x, z) rega: [[x, z], ...] (para a interface mostrar a área antes de colocar)
export function casasDoAspersor(m, loc, x, z) {
  const r = raioDoAspersor(m), out = [];
  for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if ((dx || dz) && loc.dentro(x + dx, z + dz)) out.push([x + dx, z + dz]);
  return out;
}
// a casa de índice i está ao alcance de algum aspersor pronto?
export function regadaPorAspersor(m, loc, i) {
  const L = aspersoresDe(loc);
  if (!L.length) return false;
  const r = raioDoAspersor(m), x = i % loc.l, z = (i - x) / loc.l;
  for (let k = 0; k < L.length; k++) if (Math.abs(L[k].x - x) <= r && Math.abs(L[k].z - z) <= r) return true;
  return false;
}
REGA_SOZINHA.push(regadaPorAspersor);

// rega o que tem sede ao alcance; "desde" = instante (ms) em que a água começou a cair (na volta de uma ausência, o começo dela)
function regar(m, desde) {
  let n = 0;
  for (const id in m.locais) {
    const loc = m.locais[id];
    if (!aspersoresDe(loc).length) continue;
    const P = loc.plantadas;
    for (let k = 0; k < P.length; k++) {
      const i = P[k];
      resolver(m, loc, i);
      if (regadaPorAspersor(m, loc, i) && molharCasa(m, loc, i, desde)) n++;
    }
  }
  if (n) m.eventos.emitir('aspersorRegou', { n });
}

registrarSistema({
  id: 'aspersor',
  segundo(m) { regar(m, m.agora); },
  ausencia(m, seg) { regar(m, m.agora - seg * 1000); },
});
