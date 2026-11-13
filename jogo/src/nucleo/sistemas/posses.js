// O que o jogador tem: ouro, cash, a bolsa (sementes e miudezas), o cesto (colheita, com limite), as ferramentas
// (no cinto ou no suporte do celeiro) e o estoque do celeiro.
import { registrarSistema } from '../registro.js';
import { somar, total } from '../util.js';

// ---------- ouro e cash ----------
export function ganharOuro(m, n, origem) {
  if (!(n > 0)) return;
  m.posses.ouro += n; m.posses.conta.ganho += n;
  m.eventos.emitir('ganhouOuro', { n, origem });
}
export function gastarOuro(m, n, destino) {
  if (m.posses.ouro < n) return false;
  m.posses.ouro -= n; m.posses.conta.gasto += n;
  m.eventos.emitir('gastouOuro', { n, destino });
  return true;
}
export function ganharCash(m, n, origem) {
  if (!(n > 0)) return;
  m.posses.cash += n;
  m.eventos.emitir('ganhouCash', { n, origem });
}

// ---------- cesto ----------
// (o cesto gasto leva menos até o conserto: sistemas/desgaste.js)
export const capacidadeDoCesto = (m) => { const it = m.dados.itens[m.posses.cesto.item]; return m.desgaste && m.desgaste.gastas[it.id] ? Math.max(1, Math.floor(it.capacidade * m.dados.desgaste.rendeQuandoGasta)) : it.capacidade; };
export const noCesto = (m) => total(m.posses.cesto.itens);
// O produto que tem recipiente próprio (ovo na caixa, leite no balde: dados.recipienteDoProduto, da frente dos animais)
// viaja junto com o cesto e esvazia com ele, no celeiro ou na banca, mas não ocupa o lugar do cesto.
export function foraDoCesto(m) {
  const R = m.dados.recipienteDoProduto, c = m.posses.cesto.itens;
  let n = 0;
  if (R) for (const k in c) if (R[k]) n += c[k];
  return n;
}
export const espacoNoCesto = (m) => capacidadeDoCesto(m) - (noCesto(m) - foraDoCesto(m));
// põe até n; devolve quantos couberam
export function porNoCesto(m, item, n) {
  const cabe = Math.min(n, espacoNoCesto(m));
  if (cabe > 0) somar(m.posses.cesto.itens, item, cabe);
  return cabe;
}
// quanto vale na banca o que está no cesto
export function valorDoCesto(m) {
  let v = 0;
  const c = m.posses.cesto.itens;
  for (const k in c) v += c[k] * m.dados.itens[k].venda;
  return v;
}

// ---------- cargas que viajam com ela além do cesto (a carroça do jumento: sistemas/trabalho.js) ----------
// CARGAS.push((m) → { item: n } | null): o que há nelas descarrega no celeiro e vende na banca junto com o cesto
export const CARGAS = [];
export function cestoECargas(m) { const out = [m.posses.cesto.itens]; for (const f of CARGAS) { const c = f(m); if (c) out.push(c); } return out; }
export function naCarga(m) { let n = 0; for (const f of CARGAS) { const c = f(m); if (c) n += total(c); } return n; }
export function valorDaCarga(m) { let v = 0; for (const f of CARGAS) { const c = f(m); if (c) for (const k in c) v += c[k] * m.dados.itens[k].venda; } return v; }

// ---------- celeiro (estoque) ----------
export const noCeleiro = (m) => total(m.posses.celeiro.itens);
export const espacoNoCeleiro = (m) => m.posses.celeiro.capacidade - noCeleiro(m);

// ---------- o que há guardado, esteja onde estiver (obra e receita usam direto, sem a personagem carregar) ----------
// quanto o jogador tem de um item, somando a bolsa (sementes, materiais), o celeiro e o cesto
export const quantoTem = (m, item) => (m.posses.bolsa[item] || 0) + (m.posses.celeiro.itens[item] || 0) + (m.posses.cesto.itens[item] || 0);
// o primeiro item que falta para { item: n }, ou null se há tudo: { item, precisa, tem, falta }
export function oQueFalta(m, itens) {
  for (const k in itens) { const tem = quantoTem(m, k); if (tem < itens[k]) return { item: k, precisa: itens[k], tem, falta: itens[k] - tem }; }
  return null;
}
// tira { item: n } do que há guardado: primeiro da bolsa, depois do celeiro, por último do cesto. Devolve false (sem tirar nada) se faltar.
export function gastarItens(m, itens) {
  if (oQueFalta(m, itens)) return false;
  const P = m.posses;
  for (const k in itens) {
    let n = itens[k];
    for (const de of [P.bolsa, P.celeiro.itens, P.cesto.itens]) { const tira = Math.min(n, de[k] || 0); if (tira > 0) { somar(de, k, -tira); n -= tira; } }
  }
  return true;
}

// ---------- ferramentas ----------
// cada ferramenta é um objeto só: m.posses.ferramentas[id] = { onde: 'cinto' | 'suporte', agua, usos, vez }
function melhor(m, funcao, onde) {
  let achou = null;
  const F = m.posses.ferramentas, I = m.dados.itens;
  for (const id in F) {
    if (F[id].onde !== onde || I[id].funcao !== funcao) continue;
    if (!achou || I[id].degrau > I[achou].degrau || (I[id].degrau === I[achou].degrau && I[id].capacidade > I[achou].capacidade)) achou = id;
  }
  return achou;
}
export const ferramentaNoCinto = (m, funcao) => melhor(m, funcao, 'cinto');
export const ferramentaNoSuporte = (m, funcao) => melhor(m, funcao, 'suporte');
export function listaDeFerramentas(m, onde) { const out = []; for (const id in m.posses.ferramentas) if (m.posses.ferramentas[id].onde === onde) out.push(id); return out; }
export function usarFerramenta(m, id) { const f = m.posses.ferramentas[id]; if (f) { f.usos++; f.vez = ++m.posses.vez; } }

// tira do suporte e põe no cinto; com o cinto cheio, a ferramenta usada há mais tempo volta para o suporte
export function pegarDoSuporte(m, id) {
  const P = m.posses, f = P.ferramentas[id];
  if (!f || f.onde !== 'suporte') return null;
  let guardou = null;
  const noCinto = listaDeFerramentas(m, 'cinto');
  if (noCinto.length >= P.vagasNoCinto) {
    guardou = noCinto.reduce((a, b) => (P.ferramentas[a].vez <= P.ferramentas[b].vez ? a : b));
    P.ferramentas[guardou].onde = 'suporte';
  }
  f.onde = 'cinto'; f.vez = ++P.vez;
  return { item: id, guardou };
}

// ferramenta nova: vai para o cinto se houver vaga ou se trocar uma pior do mesmo papel; senão, para o suporte
export function adquirirFerramenta(m, id) {
  const P = m.posses, it = m.dados.itens[id];
  if (P.ferramentas[id]) return false;
  const f = P.ferramentas[id] = { onde: 'suporte', agua: 0, usos: 0, vez: 0 };
  const velha = ferramentaNoCinto(m, it.funcao);
  if (velha && m.dados.itens[velha].degrau <= it.degrau) {
    f.agua = Math.min(it.capacidade, P.ferramentas[velha].agua); // a água do regador velho passa para o novo
    P.ferramentas[velha].agua = 0;
    P.ferramentas[velha].onde = 'suporte'; f.onde = 'cinto'; f.vez = ++P.vez;
  } else if (!velha && listaDeFerramentas(m, 'cinto').length < P.vagasNoCinto) { f.onde = 'cinto'; f.vez = ++P.vez; }
  return true;
}

// ---------- recipientes ----------
// o que cada função de recipiente faz ao chegar; as frentes novas (caixa de ovos, balde...) registram a sua aqui
export const RECIPIENTES = {
  cesto(m, it) { if (it.capacidade > capacidadeDoCesto(m)) m.posses.cesto.item = it.id; }, // o que já está no cesto continua nele
  cinto(m, it) { if (it.capacidade > m.posses.vagasNoCinto) m.posses.vagasNoCinto = it.capacidade; },
};
function equiparRecipiente(m, it) { const f = RECIPIENTES[it.funcao]; if (f) f(m, it); }

// ---------- dar um item qualquer (compra, recompensa) ----------
// semente e miudeza vão para a bolsa; colheita e produto, para o celeiro; ferramenta e recipiente são equipados
export function darItem(m, id, n = 1, origem = '') {
  const it = m.dados.itens[id], P = m.posses;
  if (!it || !(n > 0)) return false;
  if (it.tipo === 'ferramenta') adquirirFerramenta(m, id);
  else if (it.tipo === 'recipiente') { if (!P.recipientes.includes(id)) P.recipientes.push(id); equiparRecipiente(m, it); }
  else if (it.tipo === 'colheita' || it.tipo === 'produto') somar(P.celeiro.itens, id, n);
  else somar(P.bolsa, id, n);
  m.eventos.emitir('ganhouItem', { item: id, n, origem });
  return true;
}

// o que outras frentes sabem dar além de ouro, cash e itens: RECOMPENSAS.push((m, r, origem) => ...) lê a parte dela
// da recompensa (os animais: { animais: { especie: n } }, em animais.js)
export const RECOMPENSAS = [];
// aplica uma recompensa { ouro, cash, xp, itens: { id: n }, ...o que RECOMPENSAS souber }; o xp fica com quem chamou (niveis.js)
export function darRecompensa(m, r, origem) {
  if (!r) return;
  if (r.ouro > 0) ganharOuro(m, r.ouro, origem);
  if (r.cash > 0) ganharCash(m, r.cash, origem);
  if (r.itens) for (const k in r.itens) darItem(m, k, r.itens[k], origem);
  for (let i = 0; i < RECOMPENSAS.length; i++) RECOMPENSAS[i](m, r, origem);
}

registrarSistema({
  id: 'posses',
  iniciar(m) {
    const I = m.dados.regras.inicio;
    m.posses = {
      ouro: I.ouro, cash: I.cash,
      bolsa: {},
      cesto: { item: I.cesto, itens: {} },
      recipientes: [I.cesto],
      ferramentas: {}, vagasNoCinto: I.vagasNoCinto, vez: 0,
      celeiro: { itens: {}, capacidade: m.dados.regras.celeiro.capacidade },
      conta: { ganho: 0, gasto: 0 },
    };
    const P = m.posses;
    for (const id of I.cinto) P.ferramentas[id] = { onde: 'cinto', agua: 0, usos: 0, vez: ++P.vez };
    for (const id of I.suporte) P.ferramentas[id] = { onde: 'suporte', agua: 0, usos: 0, vez: 0 };
    for (const k in I.itens) {
      const it = m.dados.itens[k];
      if (it.tipo === 'colheita' || it.tipo === 'produto') somar(P.celeiro.itens, k, I.itens[k]); else somar(P.bolsa, k, I.itens[k]);
    }
  },
  salvar(m) { return JSON.parse(JSON.stringify(m.posses)); },
  carregar(m, d) {
    const P = m.posses, I = m.dados.itens;
    const soExistentes = (o) => { const out = {}; for (const k in o || {}) if (I[k] && o[k] > 0) out[k] = o[k]; return out; }; // um item pode ter saído dos dados
    P.ouro = d.ouro || 0; P.cash = d.cash || 0;
    P.bolsa = soExistentes(d.bolsa);
    P.recipientes = (d.recipientes || []).filter((k) => I[k] && I[k].tipo === 'recipiente');
    if (d.cesto && I[d.cesto.item] && I[d.cesto.item].tipo === 'recipiente') P.cesto = { item: d.cesto.item, itens: soExistentes(d.cesto.itens) };
    if (!P.recipientes.includes(P.cesto.item)) P.recipientes.push(P.cesto.item);
    if (d.ferramentas) {
      P.ferramentas = {};
      for (const k in d.ferramentas) if (I[k] && I[k].tipo === 'ferramenta') { const f = d.ferramentas[k]; P.ferramentas[k] = { onde: f.onde === 'cinto' ? 'cinto' : 'suporte', agua: Math.min(f.agua || 0, I[k].capacidade), usos: f.usos || 0, vez: f.vez || 0 }; }
    }
    P.vez = d.vez || 0;
    P.vagasNoCinto = m.dados.regras.inicio.vagasNoCinto;
    for (const k of P.recipientes) if (I[k].funcao === 'cinto') P.vagasNoCinto = Math.max(P.vagasNoCinto, I[k].capacidade);
    // se sobrou ferramenta demais no cinto (os dados mudaram), as usadas há mais tempo voltam para o suporte
    for (let c = listaDeFerramentas(m, 'cinto'); c.length > P.vagasNoCinto; c = listaDeFerramentas(m, 'cinto')) P.ferramentas[c.reduce((a, b) => (P.ferramentas[a].vez <= P.ferramentas[b].vez ? a : b))].onde = 'suporte';
    if (d.celeiro) P.celeiro.itens = soExistentes(d.celeiro.itens);
    if (d.conta) P.conta = { ganho: d.conta.ganho || 0, gasto: d.conta.gasto || 0 };
  },
});
