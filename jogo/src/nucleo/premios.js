// O que as recompensas têm em comum (conquistas, presente do dia, convite, compartilhar, cash):
// ler a parte delas nos dados (missoes.json, loja.json, regras.json) e transformar uma recompensa dos dados
// ({ ouro, ouroPorNivel, cash, xp, itens, animais }) nos números que o jogador recebe agora.
// Tudo é opcional: com os dados pequenos dos testes (sem conquistas, sem diária, sem cash) as listas vêm vazias.
import { darRecompensa } from './sistemas/posses.js';
import { darXp } from './sistemas/niveis.js';

const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const guardado = new WeakMap();

// a parte dos dados que esta frente usa, conferida uma vez por conjunto de dados
export function progressoDe(dados) {
  let P = guardado.get(dados);
  if (P) return P;
  const B = dados.bruto || {}, M = obj(B.missoes) ? B.missoes : {}, C = obj(B.loja) && obj(B.loja.cash) ? B.loja.cash : {}, R = obj(B.regras) && obj(B.regras.concluir) ? B.regras.concluir : {};

  // conquistas: { id, nome, evento, filtro, soma, conta, marcos: [crescentes], recompensas: [uma por marco] }
  const conquistas = [], porEvento = {};
  for (const c of Array.isArray(M.conquistas) ? M.conquistas : []) {
    if (!obj(c) || !c.id || !c.evento || !Array.isArray(c.marcos)) continue;
    const marcos = c.marcos.filter((v, i, l) => num(v) && v > 0 && (i === 0 || v > l[i - 1]));
    if (!marcos.length || conquistas.some((x) => x.id === c.id)) continue;
    const def = { id: c.id, nome: c.nome || c.id, evento: c.evento, filtro: obj(c.filtro) ? c.filtro : null, soma: typeof c.soma === 'string' ? c.soma : null, conta: c.conta === 'nivel' ? 'nivel' : null, marcos, recompensas: marcos.map((_, i) => (Array.isArray(c.recompensas) && obj(c.recompensas[i]) ? c.recompensas[i] : {})) };
    conquistas.push(def);
    (porEvento[def.evento] || (porEvento[def.evento] = [])).push(def);
  }

  // presente do dia: uma lista de dias, cada um com a recompensa (e o extra da primeira volta)
  const dias = [];
  if (obj(M.diaria) && Array.isArray(M.diaria.dias)) for (const d of M.diaria.dias) if (obj(d) && obj(d.recompensa)) dias.push({ recompensa: d.recompensa, primeiraVolta: obj(d.primeiraVolta) ? d.primeiraVolta : null });

  const cv = obj(M.convite) ? M.convite : {}, cp = obj(M.compartilhar) ? M.compartilhar : {};
  const convite = { ligado: !!cv.ligado, nivel: cv.amigoChegaAoNivel >= 1 ? Math.round(cv.amigoChegaAoNivel) : 5, porAmigo: obj(cv.recompensaPorAmigo) ? cv.recompensaPorAmigo : {}, limite: cv.limite >= 0 ? Math.round(cv.limite) : 10, convidado: obj(cv.convidado) ? cv.convidado : {} };
  const compartilhar = { ligado: !!cp.ligado, recompensa: obj(cp.recompensa) ? cp.recompensa : {}, limitePorDia: cp.limitePorDia >= 0 ? Math.round(cp.limitePorDia) : 1 };

  // cash: pacotes (compra simulada), ofertas e o preço de concluir um relógio
  const pacotes = (Array.isArray(C.pacotes) ? C.pacotes : []).filter((p) => obj(p) && p.id && p.cash > 0).map((p) => ({ id: p.id, nome: p.nome || p.id, cash: Math.round(p.cash), precoBRL: num(p.precoBRL) ? p.precoBRL : 0 }));
  const ofertas = (Array.isArray(C.ofertas) ? C.ofertas : []).filter((o) => obj(o) && o.id && o.tipo).map((o) => ({ id: o.id, nome: o.nome || o.id, tipo: o.tipo, cash: o.cash > 0 ? Math.round(o.cash) : 0, item: o.item || null, animal: o.animal || null, construcao: o.construcao || null }));
  const cash = { compraSimulada: !!C.compraSimulada, cashPorReal: C.cashPorReal > 0 ? C.cashPorReal : 10, pacotes, ofertas };
  const concluir = { coef: R.coef > 0 ? R.coef : 0, expoente: R.expoente > 0 ? R.expoente : 1, gratisAteSeg: R.gratisAteSeg >= 0 ? R.gratisAteSeg : 0, vale: Array.isArray(R.vale) ? R.vale.filter((v) => typeof v === 'string') : [], limitePorDia: R.limitePorDia > 0 ? Math.round(R.limitePorDia) : 0 };

  // vagas de fila: as ampliações de construcoes.json que têm preço em cash (e em ouro): { construcao: [{ fila, nome, nivel, ouro, cash }] }
  const vagas = {};
  if (obj(B.construcoes)) for (const [id, c] of Object.entries(B.construcoes)) {
    if (!obj(c) || !Array.isArray(c.ampliacoes)) continue;
    const lista = c.ampliacoes.filter((a) => obj(a) && a.cash > 0 && a.fila > 0).map((a) => ({ fila: a.fila, nome: a.nome || '', nivel: a.nivel >= 1 ? a.nivel : 1, ouro: obj(a.custo) && a.custo.ouro > 0 ? a.custo.ouro : 0, cash: Math.round(a.cash) }));
    if (lista.length) vagas[id] = { nome: c.nome || id, nivel: c.nivel >= 1 ? c.nivel : 1, lista };
  }

  P = { conquistas, porEvento, dias, convite, compartilhar, cash, concluir, vagas };
  guardado.set(dados, P);
  return P;
}

// o evento serve para o filtro? Todo campo do filtro tem de bater com o do evento (lista = qualquer um dos valores)
export function bate(filtro, dados) {
  if (!filtro) return true;
  for (const k in filtro) {
    const v = dados ? dados[k] : undefined;
    if (Array.isArray(filtro[k]) ? !filtro[k].includes(v) : filtro[k] !== v) return false;
  }
  return true;
}

// a recompensa dos dados (mais um extra, se houver) em números de agora: "ouroPorNivel" vezes o nível do jogador
export function resolver(m, r, extra) {
  const out = { ouro: 0, cash: 0, xp: 0, itens: {} };
  for (const p of [r, extra]) {
    if (!obj(p)) continue;
    if (obj(p.animais)) for (const k in p.animais) if (m.dados.animais && m.dados.animais[k] && p.animais[k] > 0) (out.animais || (out.animais = {}))[k] = (out.animais[k] || 0) + p.animais[k];
    if (p.ouro > 0) out.ouro += p.ouro;
    if (p.ouroPorNivel > 0) out.ouro += p.ouroPorNivel * m.progresso.nivel;
    if (p.cash > 0) out.cash += p.cash;
    if (p.xp > 0) out.xp += p.xp;
    if (obj(p.itens)) for (const k in p.itens) if (m.dados.itens[k] && p.itens[k] > 0) out.itens[k] = (out.itens[k] || 0) + p.itens[k];
  }
  return out;
}
export const temPremio = (r) => !!r && (r.ouro > 0 || r.cash > 0 || r.xp > 0 || (!!r.itens && Object.keys(r.itens).length > 0) || (!!r.animais && Object.keys(r.animais).length > 0));

// põe a recompensa (já resolvida) nas posses do jogador
export function entregar(m, r, origem) {
  darRecompensa(m, r, origem);
  if (r.xp > 0) darXp(m, r.xp, origem);
}
