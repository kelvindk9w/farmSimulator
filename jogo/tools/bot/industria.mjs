// Indústrias: retirar o que ficou pronto, pôr receita na fila (a da missão, a do pedido, a do trato, a do material
// da obra; sem nada disso, a que mais rende com o que dá para conseguir), e comprar vaga de fila com ouro quando sobra.
// O que cada receita planejada consome entra no "quer" (o que guardar em vez de vender, e o que plantar).
import { X } from './jogo.mjs';
import { passo, nota, evitado, evitar, nivel, comando, cmd, livre, tem, querer } from './contexto.mjs';

const IN = X.industria;
export const LIGADA = !!(IN && IN.receitasDe && IN.podeProduzir);
const R = (J) => IN.receitasDe(J.D);

export function industrias(J) {
  if (!LIGADA) return [];
  const out = [];
  for (const e of J.m.construcao.todas) if (e.local === 'fazenda' && IN.ehIndustria(J.m, e)) out.push(e);
  return out;
}
const pronta = (e) => X.construcao.estaPronta(e);
const doCultivo = (J, item) => Object.values(J.D.culturas).some((c) => c.produto === item && c.nivel <= nivel(J));
const daArvore = (J, item) => !!X.arvores && J.m.arvores.todas.some((e) => J.D.arvores[e.arvore] && J.D.arvores[e.arvore].fruto === item);
const doBicho = (J, item) => !!J.m.animais && J.m.animais.lista.some((a) => J.D.animais[a.especie] && J.D.animais[a.especie].produto === item);
const daLoja = (J, item) => { const it = J.I[item]; return !!it && it.compra > 0 && it.nivel <= nivel(J) && J.D.loja.ouro.includes(item) && (it.tipo === 'material' || it.tipo === 'embalagem' || it.tipo === 'racao'); };
// dá para conseguir este item (para ser ingrediente)? fundo = quantas receitas abaixo
export function conseguivel(J, item, fundo = 0) {
  if (doCultivo(J, item) || daArvore(J, item) || doBicho(J, item) || daLoja(J, item)) return true;
  if (fundo < 3) for (const r of R(J).porItem[item] || []) if (r.nivel <= nivel(J) && X.construcao.temPronta(J.m, r.onde) && Object.keys(r.entra).every((k) => conseguivel(J, k, fundo + 1))) return true;
  return false;
}
const valor = (J, itens) => { let v = 0; for (const k in itens) v += itens[k] * (J.I[k].venda || J.I[k].compra || 0); return v; };
// o que custa a entrada: o que já tem (ou vem da lavoura, do pomar, dos bichos) vale o preço de venda; o resto, o da loja
function custoDaEntrada(J, itens) {
  let v = 0;
  for (const k in itens) {
    const it = J.I[k], proprio = tem(J, k) >= itens[k] || doCultivo(J, k) || daArvore(J, k) || doBicho(J, k);
    v += itens[k] * (proprio ? it.venda || it.compra || 0 : it.compra || it.venda || 0);
  }
  return v;
}

// ---------- o plano: que receita cada indústria faz em seguida ----------
// pedidos = [{ item, n, prio }] (missão 3, pedido 2, trato e obra 2): o que se quer que as indústrias façam.
// Devolve { [entidade]: receita } e soma no Q o que as receitas planejadas consomem.
export function planejar(J, pedidos, Q) {
  const plano = {}, prio = {};
  J.planoPrio = prio;
  if (!LIGADA) return plano;
  const lista = industrias(J).filter(pronta);
  if (!lista.length) return plano;
  const porTipo = {};
  for (const e of lista) (porTipo[e.tipo] || (porTipo[e.tipo] = [])).push(e);
  // o que já está na fila ou na saída conta como "vindo"
  const vindo = {};
  for (const e of lista) { const st = IN.estadoDaIndustria(J.m, e); if (st) for (const id of [...st.fila, ...st.saida]) { const r = R(J).todas[id]; if (r) for (const k in r.sai) vindo[k] = (vindo[k] || 0) + r.sai[k]; } }
  const fila = [...pedidos].sort((a, b) => b.prio - a.prio);
  const usado = new Set();
  for (let k = 0; k < fila.length && k < 40; k++) {
    const p = fila[k];
    const falta = p.n - tem(J, p.item) - (vindo[p.item] || 0);
    if (falta <= 0) continue;
    const r = (R(J).porItem[p.item] || []).find((x) => x.nivel <= nivel(J) && porTipo[x.onde]);
    if (!r) continue;
    const e = porTipo[r.onde].find((x) => !usado.has(x.id)) || porTipo[r.onde][0];
    if (!plano[e.id]) { plano[e.id] = r; prio[e.id] = p.prio; usado.add(e.id); }
    const vezes = Math.ceil(falta / r.n);
    for (const i in r.entra) {
      querer(Q, i, r.entra[i] * vezes);
      if (!doCultivo(J, i) && !daLoja(J, i) && R(J).porItem[i]) fila.push({ item: i, n: r.entra[i] * vezes, prio: p.prio });
    }
  }
  // as que ficaram sem plano: a receita que mais rende por minuto com o que dá para conseguir (embalagem se compra),
  // sem mexer no que está guardado para outra coisa (J.querBase: pedido, trato, obra, missão)
  const base = { ...Q };
  J.querBase = base;
  const sobra = (i, n) => tem(J, i) - n >= (base[i] || 0);
  for (const e of lista) {
    if (plano[e.id]) continue;
    let melhor = null, nm = 0;
    for (const r of IN.receitasDaConstrucao(J.m, e.tipo)) {
      if (r.nivel > nivel(J)) continue;
      if (!Object.keys(r.entra).every((i) => conseguivel(J, i))) continue;
      // material (tábua) não se vende na banca: só se faz quando alguma obra pede
      if (Object.keys(r.sai).some((k) => J.I[k] && J.I[k].tipo === 'material') && !Object.keys(r.sai).some((k) => (base[k] || 0) > tem(J, k))) continue;
      if (!Object.keys(r.entra).every((i) => doCultivo(J, i) || daArvore(J, i) || doBicho(J, i) || J.I[i].tipo === 'embalagem' || sobra(i, r.entra[i]))) continue;
      // o lucro é sobre o que se venderia cru (ou o que custa na loja, se só vem de lá); a experiência conta como ouro
      const ganho = valor(J, r.sai) - custoDaEntrada(J, r.entra) + r.xp;
      if (ganho <= 0) continue;
      const n = ganho / (r.tempoSeg + 60);
      if (n > nm) { nm = n; melhor = r; }
    }
    if (melhor) { plano[e.id] = melhor; prio[e.id] = 1; for (const i in melhor.entra) querer(Q, i, melhor.entra[i]); }
  }
  return plano;
}

// ---------- retirar ----------
export function retirar(J) {
  if (!LIGADA || !comando(J, 'retirar')) return null;
  for (const e of industrias(J)) {
    const st = IN.estadoDaIndustria(J.m, e);
    if (!st || !st.saida.length || evitado(J, 'retirar:' + e.id)) continue;
    const sai = IN.prontosNaSaida(J.m, e);
    let n = 0, soCeleiro = 0;
    for (const k in sai) { n += sai[k]; const t = J.I[k].tipo; if (t === 'colheita' || t === 'produto') soCeleiro += sai[k]; }
    if (soCeleiro > X.posses.espacoNoCeleiro(J.m)) { J.celeiroApertado = true; nota(J, 'o celeiro está cheio para retirar da indústria'); continue; }
    evitar(J, 'retirar:' + e.id, 5);
    return cmd(J, { tipo: 'retirar', entidade: e.id }, 2, 'retirar');
  }
  return null;
}

// ---------- enfileirar ----------
export function enfileirar(J) {
  if (!LIGADA || !comando(J, 'produzir')) return null;
  const plano = J.plano || {};
  for (const e of industrias(J)) {
    if (!pronta(e) || evitado(J, 'produzir:' + e.id)) continue;
    const r = plano[e.id];
    if (!r) continue;
    const st = IN.estadoDaIndustria(J.m, e);
    if (st && st.fila.length >= IN.vagasDaFila(J.m, e)) continue;
    if (st && st.saida.length >= IN.vagasDaFila(J.m, e)) continue; // a saída está cheia: retirar antes
    // a receita "por conta" (sem pedido) só usa o que sobra
    if (!((J.planoPrio || {})[e.id] >= 2) && J.querBase && !Object.keys(r.entra).every((i) => tem(J, i) - r.entra[i] >= (J.querBase[i] || 0))) continue;
    const pode = IN.podeProduzir(J.m, e, r.id);
    if (pode.ok) { evitar(J, 'produzir:' + e.id, 2); return cmd(J, { tipo: 'produzir', entidade: e.id, receita: r.id }, 2, 'produzir'); }
    if (pode.motivo === 'falta-ingrediente') {
      // embalagem e material da loja: compra o que falta para esta e a próxima
      const f = pode.dados, it = J.I[f.item];
      // compra o que falta só para missão, pedido e trato (prio 2+), ou a embalagem quando o resto já está lá
      const resto = Object.keys(r.entra).every((k) => k === f.item || tem(J, k) >= r.entra[k]);
      if (daLoja(J, f.item) && ((J.planoPrio || {})[e.id] >= 2 || (it.tipo === 'embalagem' && resto)) && !evitado(J, 'compra:' + f.item)) {
        const n = Math.max(f.falta, Math.min(f.precisa * 2, 30));
        if (it.compra * f.falta <= J.P.ouro - 10) return passo(J, 'comprar', { item: f.item, n: Math.min(n, Math.floor((J.P.ouro - 10) / it.compra)) });
      }
    }
  }
  return null;
}

// ---------- vaga na fila, com ouro ----------
export function comprarVaga(J, margem) {
  if (!LIGADA || !comando(J, 'ampliar')) return null;
  for (const e of industrias(J)) {
    if (!pronta(e) || e.ampliaAte > 0) continue;
    const a = IN.proximaVaga(J.m, e);
    if (!a || a.nivel > nivel(J) || !a.custo || !(a.custo.ouro > 0) || X.posses.oQueFalta(J.m, a.custo.itens || {})) continue;
    const st = IN.estadoDaIndustria(J.m, e);
    if (!st || st.fila.length < IN.vagasDaFila(J.m, e)) continue; // só quando a fila anda cheia
    if (livre(J) - a.custo.ouro < margem || evitado(J, 'ampliar:' + e.id)) continue;
    return cmd(J, { tipo: 'ampliar', entidade: e.id }, 2, 'ampliar:' + e.id);
  }
  return null;
}
// segundos até alguma indústria terminar a primeira da fila (para a espera)
export function esperaDasIndustrias(J) {
  let s = Infinity;
  for (const e of industrias(J)) { const f = IN.faltaDaFila(J.m, e); if (f > 0 && f < s) s = f; }
  return s === Infinity ? null : s;
}
export const receitas = (J) => (LIGADA ? R(J) : { todas: {}, porConstrucao: {}, porItem: {} });
