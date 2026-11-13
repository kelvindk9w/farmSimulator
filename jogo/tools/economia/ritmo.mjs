#!/usr/bin/env node
// ritmo.mjs: modelo de CONTA do ritmo e da economia. Lê jogo/dados/*.json e estima, para três perfis de jogador,
// o tempo até cada nível, o ouro que entra e sai, o cash grátis, os toques e as viagens ao poço.
//
// ATENÇÃO: isto é CONTA, não medição. Um "jogador de planilha" segue regras simples (colhe o que está pronto,
// trata os bichos, entrega pedidos, compra o que pode, planta o que rende mais por segundo de trabalho).
// O tempo de cada ação e o de andar saem de regras.json. Quem MEDE o jogo de verdade é o jogador automático
// do próprio jogo (jogo/tools/bot.mjs), que joga com as mesmas regras do código.
//
// Uso:  node jogo/tools/economia/ritmo.mjs [pasta-dos-dados] [--dias=90] [--perfil=regular] [--sem-rearar]
//       --calibrar           ajusta a curva de níveis às metas (só mostra)
//       --calibrar --gravar  ajusta e grava a linha "xp" de niveis.json
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const tem = (n) => args.includes('--' + n);
const valor = (n, p) => { const a = args.find((x) => x.startsWith('--' + n + '=')); return a ? a.slice(n.length + 3) : p; };
const PASTA = args.find((a) => !a.startsWith('--')) || join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dados');
const D = {};
for (const a of ['regras', 'itens', 'culturas', 'arvores', 'animais', 'construcoes', 'receitas', 'terras', 'niveis', 'pedidos', 'missoes', 'loja']) D[a] = JSON.parse(readFileSync(join(PASTA, a + '.json'), 'utf8'));
const R = D.regras, A = R.acoes, DIA = 86400;
const REARAR = tem('sem-rearar') ? false : !!(R.lavoura && R.lavoura.reararAposColher);

// ---------- os três perfis (hipóteses do modelo) ----------
// sessoes: [hora do dia, minutos]. aproveitamento: parte da sessão que vira ação (o resto é olhar, ler, errar o toque).
const PERFIS = {
  casual: { nome: 'casual', minutos: 20, sessoes: [[8, 10], [20, 10]], aproveitamento: 0.65, compartilhaACada: 0 },
  regular: { nome: 'regular', minutos: 45, sessoes: [[7.5, 15], [12.5, 15], [20, 15]], aproveitamento: 0.7, compartilhaACada: 7 },
  engajado: { nome: 'engajado', minutos: 120, sessoes: [[7, 20], [9.5, 20], [12.5, 20], [16, 20], [19, 20], [22, 20]], aproveitamento: 0.75, compartilhaACada: 2 },
};
// metas do perfil regular: nível no fim da 1ª sessão (dia 0) e no fim de cada dia
const METAS = [{ dia: 0, nivel: 4 }, { dia: 1, nivel: 6 }, { dia: 3, nivel: 8 }, { dia: 7, nivel: 11 }, { dia: 14, nivel: 14 }, { dia: 30, nivel: 19 }, { dia: 60, nivel: 23 }, { dia: 90, nivel: 26 }];
const DIA_DO_NIVEL_50 = 365;
const PRIMEIRA = [20, 60, 130]; // experiência dos níveis 2, 3 e 4, fixada à mão para a 1ª sessão: primeira colheita, meio da sessão, antes do fim

// ---------- índices ----------
const culturaDoItem = {}, arvoreDoItem = {}, animalDoItem = {}, receitasDoItem = {}, porFuncao = {};
for (const [id, c] of Object.entries(D.culturas)) culturaDoItem[c.produto] = id;
for (const [id, a] of Object.entries(D.arvores)) arvoreDoItem[a.fruto] = id;
for (const [id, a] of Object.entries(D.animais)) if (a.produto && a.preco.ouro) animalDoItem[a.produto] = id;
for (const [id, r] of Object.entries(D.receitas)) for (const k of Object.keys(r.sai)) (receitasDoItem[k] = receitasDoItem[k] || []).push(id);
for (const [id, x] of Object.entries(D.itens)) if (x.funcao) (porFuncao[x.funcao] = porFuncao[x.funcao] || []).push({ id, ...x });
for (const l of Object.values(porFuncao)) l.sort((a, b) => a.degrau - b.degrau);

const soma = (o, k, n) => { o[k] = (o[k] || 0) + n; };
function sorteador(semente) { let a = semente >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- estado ----------
function novoEstado(perfil) {
  const I = R.inicio, T = D.terras, a = T.inicial.area, lim = T.inicial.limpo;
  const area = (a[2] - a[0]) * (a[3] - a[1]), limpa = (lim[2] - lim[0]) * (lim[3] - lim[1]);
  let predios = 0; for (const c of Object.values(D.construcoes)) if (c.inicial) predios += c.casas[0] * c.casas[1];
  const caminhos = (T.caminhos || []).reduce((s, c) => s + (c[2] - c[0]) * (c[3] - c[1]), 0);
  const borda = Math.max(0, area - limpa - 32); // a casa e o celeiro ficam na beirada, fora do miolo limpo
  const S = {
    perfil, ap: perfil.aproveitamento, t: 0, fim: 0, nivel: 1, xp: 0, ouro: I.ouro, cash: I.cash,
    ferr: {}, usos: {}, est: { ...I.itens }, campo: [], aradas: 0, pico: 30, picoEst: 0,
    terra: area - predios - caminhos, obst: {}, construido: 0, pomar: 0, lotes: 0,
    constr: {}, obras: [], filas: {}, abr: {}, trab: {}, pets: {}, arv: [], ped: [],
    mi: 0, miConta: 0, conq: {}, conqMarco: {}, diaria: { casa: 0, dia: -1 }, repos: 0, alvoMat: null, apertado: false,
    nivelEm: { 1: 0 }, quando: {}, log: [], porDia: [], primeira: false, sorte: sorteador(11),
    c: { ouroDe: {}, ouroPara: {}, xpDe: {}, cashDe: {}, tempo: {}, toques: 0, poco: 0, colhidas: 0 },
  };
  for (const [k, f] of Object.entries(T.inicial.natureza || {})) S.obst[k] = Math.round(borda * f);
  for (const id of [...I.cinto, ...I.suporte, ...(I.noLugar || []), I.cesto]) S.ferr[D.itens[id].funcao] = id;
  for (const [id, c] of Object.entries(D.construcoes)) if (c.inicial) { S.constr[id] = { n: 1, degrau: 0 }; for (const mv of (c.interior || {}).moveis || []) S.constr[mv.id] = { n: 1, degrau: 0 }; }
  return S;
}

// ---------- relógio, ouro, experiência ----------
const rest = (S) => Math.max(0, (S.fim - S.t) * S.ap); // segundos de ação que ainda cabem na sessão
function usar(S, seg, tarefa, toques = 0) { S.t += seg / S.ap; soma(S.c.tempo, tarefa, seg); S.c.toques += toques; }
function ganhar(S, n, de) { if (n > 0) { S.ouro += n; soma(S.c.ouroDe, de, n); } }
function gastar(S, n, para) { if (n > 0) { S.ouro -= n; soma(S.c.ouroPara, para, n); } }
function registrar(S, texto) { if (S.primeira) S.log.push({ t: S.t - S.inicio, texto: `${texto}  [xp ${Math.round(S.xp)}, ouro ${Math.round(S.ouro)}]` }); }
function darXp(S, n, de) {
  if (!(n > 0)) return;
  S.xp += n; soma(S.c.xpDe, de, n);
  const lim = D.niveis.xp;
  while (S.nivel < lim.length && S.xp >= lim[S.nivel]) {
    S.nivel++; S.nivelEm[S.nivel] = S.t; registrar(S, `NÍVEL ${S.nivel}`);
    recompensar(S, D.niveis.recompensas[S.nivel], 'níveis'); emitir(S, 'subiuDeNivel', { nivel: S.nivel });
  }
}
function darItem(S, id, n) {
  const x = D.itens[id];
  if (x.tipo === 'ferramenta' || x.tipo === 'recipiente') { const atual = S.ferr[x.funcao] ? D.itens[S.ferr[x.funcao]].degrau : 0; if (x.degrau > atual) { S.ferr[x.funcao] = id; S.usos[x.funcao] = 0; } return; }
  soma(S.est, id, n);
}
function recompensar(S, r, de) {
  if (!r) return;
  if (r.ouro) ganhar(S, r.ouro, de);
  if (r.ouroPorNivel) ganhar(S, r.ouroPorNivel * S.nivel, de);
  if (r.cash) { S.cash += r.cash; soma(S.c.cashDe, de, r.cash); }
  for (const [k, n] of Object.entries(r.itens || {})) darItem(S, k, n);
  if (r.xp) darXp(S, r.xp, de);
}

// ---------- eventos: missões do vizinho e conquistas (mesma regra de filtro do jogo) ----------
function serve(evento, filtro, ev, dados) {
  if (evento !== ev) return false;
  for (const k in filtro || {}) { const v = dados[k]; if (Array.isArray(filtro[k]) ? !filtro[k].includes(v) : filtro[k] !== v) return false; }
  return true;
}
function emitir(S, ev, dados = {}) {
  const n = typeof dados.n === 'number' ? dados.n : 1, lista = D.missoes.vizinho;
  if (S.mi < lista.length && !S.emMissao) {
    const mi = lista[S.mi];
    if (serve(mi.objetivo.evento, mi.objetivo.filtro, ev, dados)) {
      S.miConta += n;
      if (S.miConta >= mi.objetivo.n) { S.emMissao = true; S.mi++; S.miConta = 0; S.quando['missão ' + mi.id] = S.t; registrar(S, `missão cumprida: ${mi.titulo}`); recompensar(S, mi.recompensa, 'missões'); S.emMissao = false; }
    }
  }
  for (const c of D.missoes.conquistas) {
    if (!serve(c.evento, c.filtro, ev, dados)) continue;
    const v = c.conta === 'nivel' ? S.nivel : (S.conq[c.id] || 0) + (c.soma ? dados[c.soma] || 0 : n);
    S.conq[c.id] = v;
    let k = S.conqMarco[c.id] || 0;
    while (k < c.marcos.length && v >= c.marcos[k]) { recompensar(S, c.recompensas[k], 'conquistas'); k++; registrar(S, `conquista: ${c.nome} (marco ${k})`); }
    S.conqMarco[c.id] = k;
  }
}

function jaTem(S, mi) { // "valeJaTer": o jogador se adiantou e já tem o que a missão pede
  const o = mi.objetivo, f = o.filtro || {};
  if (!mi.valeJaTer || mi.nivel > S.nivel) return false;
  if (o.evento === 'construiu') return !!S.constr[f.construcao];
  if (o.evento !== 'comprou') return false;
  if (f.item) { const x = D.itens[f.item]; return !!x.funcao && !!S.ferr[x.funcao] && D.itens[S.ferr[x.funcao]].degrau >= x.degrau; }
  if (f.animal) return !!S.trab[f.animal] || Object.values(S.abr).some((a) => a.animal === f.animal && a.n >= o.n);
  if (f.lote) return S.lotes > D.terras.lotes.findIndex((l) => l.id === f.lote);
  if (f.familia === 'estimacao') return Object.keys(S.pets).length > 0;
  return false;
}
function conferirMissao(S) {
  for (let mi = D.missoes.vizinho[S.mi]; mi && jaTem(S, mi); mi = D.missoes.vizinho[S.mi]) { S.mi++; S.miConta = 0; S.quando['missão ' + mi.id] = S.t; registrar(S, `missão cumprida (já tinha): ${mi.titulo}`); recompensar(S, mi.recompensa, 'missões'); }
}

// ---------- terreno, andar, ferramentas ----------
const it = (S, f) => (S.ferr[f] ? D.itens[S.ferr[f]] : null);
const noCampo = (S) => S.campo.reduce((s, b) => s + b.casas, 0);
const obstaculos = (S) => Object.values(S.obst).reduce((s, n) => s + n, 0);
const usavel = (S) => Math.max(0, S.terra - S.construido - S.pomar - obstaculos(S));
const trabAtivo = (S, id) => !!(S.trab[id] && S.trab[id].tratado);
function grau(S, id, campo) { const c = D.construcoes[id]; let v = c[campo]; const g = S.constr[id] ? S.constr[id].degrau : 0; for (let k = 0; k < g; k++) if (c.ampliacoes[k][campo] !== undefined) v = c.ampliacoes[k][campo]; return v; }
const vagasLivres = (S, ab) => grau(S, ab, 'vagas') - (ab === 'estabulo' ? Object.keys(S.trab).length : S.abr[ab] ? S.abr[ab].n : 0);
function geo(S) { // distâncias médias do campo ao poço e à banca: o campo é um quadrado que cresce a partir de pontos.lavoura
  const P = D.terras.pontos, lado = Math.sqrt(Math.max(16, S.pico)), c = [P.lavoura[0] + lado / 2, P.lavoura[1] + lado / 2];
  const d = (p) => Math.hypot(c[0] - p[0], c[1] - p[1]) + lado / 3;
  return { poco: d(P.poco), banca: (d(P.banca) + d(P.celeiro)) / 2, celeiro: d(P.celeiro) };
}
function trajeto(S, d) { // segundos para andar d casas: corre nos trechos longos enquanto tem fôlego; o cavalo dispensa o fôlego
  if (trabAtivo(S, 'cavalo') && S.ferr.sela && d > 14) return d / D.animais.cavalo.efeito.velocidade + (A.montar || 1) + (A.apear || 1);
  if (d <= R.personagem.correrAcimaDe) return d / R.personagem.andar;
  const tCorre = R.folego.max / R.folego.gastoPorSeg, dCorre = tCorre * R.personagem.correr;
  return d <= dCorre ? d / R.personagem.correr : tCorre + (d - dCorre) / R.personagem.andar;
}
function desgaste(S, f, n) { const x = it(S, f); if (!x || !(x.usos > 0) || !(n > 0)) return; S.usos[f] = (S.usos[f] || 0) + n; while (S.usos[f] >= x.usos) { S.usos[f] -= x.usos; if (S.ouro >= x.conserto) gastar(S, x.conserto, 'consertos'); } }
function trocaDeFerramenta(S, f) { // a ferramenta que não cabe no cinto pede uma ida ao suporte do celeiro, uma vez por sessão
  if (S.usadas.has(f)) return 0; S.usadas.add(f);
  const vagas = it(S, 'cinto') ? it(S, 'cinto').capacidade : R.inicio.vagasNoCinto;
  return S.usadas.size <= vagas - 2 ? 0 : 2 * trajeto(S, geo(S).celeiro) + 2 * A.pegarFerramenta;
}

// custo, em segundos de ação por casa, de cada passo da lavoura com as ferramentas de agora
function custos(S, c) {
  const passo = 1 / R.personagem.andar, G = geo(S);
  let arar = A.arar * ((it(S, 'enxada') || {}).rapidez || 1) + passo, tArar = 1, boi = false;
  if (trabAtivo(S, 'boi') && S.ferr.arado) { const e = D.animais.boi.efeito, tb = (e.seg + 2 * passo) / e.casas; if (tb < arar) { arar = tb; tArar = 1 / e.casas; boi = true; } }
  const pl = it(S, 'plantadeira'), semear = A.semear * (pl ? pl.rapidez || 1 : 1) + passo;
  const rg = it(S, 'regador'), ar = rg.area || 1, porEnchida = rg.capacidade * ar;
  const barril = trabAtivo(S, 'jumento') && S.ferr.carroca && S.ferr.barril ? it(S, 'barril') : null;
  const idaAoPoco = 2 * trajeto(S, G.poco);
  const encher = barril ? (2 * trajeto(S, 3) + (A.encherNoBarril || A.encher)) / porEnchida + (idaAoPoco + (A.encherBarril || A.encher)) / (barril.capacidade * ar) : (idaAoPoco + A.encher) / porEnchida;
  const asp = S.constr.aspersor ? S.constr.aspersor.n : 0, raio = D.construcoes.aspersor ? D.construcoes.aspersor.efeito.raio : 0;
  const seco = 1 - Math.min(1, asp * ((2 * raio + 1) ** 2 - 1) / Math.max(S.pico, 1)); // parte do campo sem irrigação fixa
  const regar = (A.regar / ar + passo + encher) * seco;
  const carga = trabAtivo(S, 'jumento') && S.ferr.carroca ? it(S, 'carroca').capacidade : it(S, 'cesto').capacidade;
  const colher = A.colher + passo + c.rende * (2 * trajeto(S, G.banca) + A.vender) / carga;
  return {
    arar, semear, regar, colher, boi, tArar, total: (REARAR ? arar : 0) + semear + c.regas * regar + colher,
    tRegar: (1 / ar + 1 / porEnchida) * seco, poco: (barril ? 1 / (barril.capacidade * ar) : 1 / porEnchida) * seco, viagens: c.rende / carga,
  };
}

// ---------- lavoura ----------
function plantarLote(S, cid, casas, segMax) {
  const c = D.culturas[cid], K = custos(S, c), sem = D.itens[c.semente], campo = noCampo(S);
  const ara = REARAR || campo >= S.aradas, porCasa = K.semear + K.regar + (ara ? K.arar : 0);
  let n = Math.min(casas, Math.max(0, Math.floor(usavel(S) - campo)), Math.floor(Math.min(segMax, rest(S)) / porCasa));
  const tenho = S.est[c.semente] || 0;
  if (n > tenho) {
    n = Math.min(n, tenho + Math.floor(Math.max(0, S.ouro) / sem.compra));
    const compra = n - tenho;
    if (compra > 0) { gastar(S, compra * sem.compra, 'sementes'); S.est[c.semente] = tenho + compra; emitir(S, 'comprou', { item: c.semente, n: compra, ouro: compra * sem.compra, classe: 'semente' }); }
  }
  if (n <= 0) return 0;
  S.est[c.semente] -= n;
  const nAr = REARAR ? n : Math.max(0, campo + n - S.aradas);
  usar(S, nAr * K.arar + n * (K.semear + K.regar), 'lavoura', nAr * K.tArar + n + n * K.tRegar);
  S.c.poco += n * K.poco; S.aradas = Math.max(S.aradas, campo + n);
  if (nAr) { emitir(S, 'arou', K.boi ? { n: nAr, com: 'boi' } : { n: nAr }); if (!K.boi) desgaste(S, 'enxada', nAr); }
  emitir(S, 'plantou', { cultura: cid, item: c.semente, n }); emitir(S, 'encheu', { n: Math.max(1, Math.round(n * K.poco)) }); emitir(S, 'regou', { cultura: cid, n });
  desgaste(S, 'regador', n); desgaste(S, 'plantadeira', n);
  S.campo.push({ c: cid, casas: n, feitas: 0, regada: S.t });
  S.pico = Math.max(S.pico * 0.999, noCampo(S));
  return n;
}
function cuidarDaLavoura(S) {
  for (const b of [...S.campo]) {
    const c = D.culturas[b.c];
    if (b.regada !== null && S.t >= b.regada + c.tempoSeg / c.regas) { b.feitas++; b.regada = null; }
    if (b.regada !== null) continue;
    const K = custos(S, c);
    if (b.feitas >= c.regas) { // pronta: colher
      const n = Math.min(b.casas, Math.floor(rest(S) / K.colher)); if (n <= 0) continue;
      usar(S, n * K.colher, 'lavoura', n + n * K.viagens); soma(S.est, c.produto, n * c.rende); S.c.colhidas += n;
      desgaste(S, 'cesto', n * K.viagens);
      emitir(S, 'colheu', { cultura: b.c, item: c.produto, n: n * c.rende }); darXp(S, n * c.xp, 'colheita');
      b.casas -= n; if (!b.casas) S.campo.splice(S.campo.indexOf(b), 1);
    } else { // seca: a planta espera a próxima rega
      const n = Math.min(b.casas, Math.floor(rest(S) / Math.max(K.regar, 0.01))); if (n <= 0) continue;
      usar(S, n * K.regar, 'lavoura', n * K.tRegar); S.c.poco += n * K.poco; desgaste(S, 'regador', n); emitir(S, 'regou', { cultura: b.c, n });
      if (n < b.casas) { b.casas -= n; S.campo.push({ c: b.c, casas: n, feitas: b.feitas, regada: S.t }); } else b.regada = S.t;
    }
  }
}
function melhorCultura(S) { // a que rende mais (ouro líquido + experiência) por segundo de trabalho
  let melhor = null, mv = 0;
  for (const [id, c] of Object.entries(D.culturas)) { if (c.nivel > S.nivel) continue; const v = (c.rende * D.itens[c.produto].venda - D.itens[c.semente].compra + c.xp) / custos(S, c).total; if (v > mv) { mv = v; melhor = id; } }
  return melhor;
}
const crescendo = (S, cid) => S.campo.reduce((s, b) => s + (b.c === cid ? b.casas : 0), 0);
function plantar(S, plano) {
  let seg = 60; const t0 = S.t, gasto = () => (S.t - t0) * S.ap;
  const alvo = alvoDaMissao(S);
  const pedidosDe = {}; for (const [k, n] of Object.entries(plano.quer)) if (culturaDoItem[k]) pedidosDe[culturaDoItem[k]] = n;
  if (alvo.ev === 'colheu' && alvo.f.item && culturaDoItem[alvo.f.item]) soma(pedidosDe, culturaDoItem[alvo.f.item], alvo.falta + (S.est[alvo.f.item] || 0));
  if (alvo.ev === 'plantou' && alvo.f.cultura) { const c = D.culturas[alvo.f.cultura]; soma(pedidosDe, alvo.f.cultura, (alvo.falta + crescendo(S, alvo.f.cultura)) * c.rende + (S.est[c.produto] || 0)); }
  for (const [cid, n] of Object.entries(pedidosDe)) {
    const c = D.culturas[cid]; if (c.nivel > S.nivel) continue;
    const falta = n - (S.est[c.produto] || 0) - crescendo(S, cid) * c.rende;
    if (falta > 0) plantarLote(S, cid, Math.ceil(falta / c.rende), seg - gasto());
    if (gasto() >= seg) return;
  }
  const m = melhorCultura(S); if (m) plantarLote(S, m, Infinity, seg - gasto());
  // ninguém fica travado: sem ouro, sem semente e sem planta no chão, o vizinho dá sementes
  if (!S.campo.length && S.ouro < 1 && R.antiTrava && !(S.est[R.antiTrava.semente] > 0)) soma(S.est, R.antiTrava.semente, R.antiTrava.quantidade);
}

// ---------- limpar a terra ----------
function limpar(S, tipo, n, segMax) {
  const o = D.terras.obstaculos[tipo], f = it(S, o.ferramenta);
  if (!f || (f.forca || 1) < (o.forcaMinima || 1)) return 0;
  const golpes = Math.ceil(o.resistencia / (f.forca || 1)), acao = { foice: A.rocar, machado: A.cortar, picareta: A.quebrar }[o.ferramenta] || 1, porGolpe = tipo === 'mato' ? f.area || 1 : 1;
  const custo = (golpes * acao + 2 / R.personagem.andar) / porGolpe, troca = S.usadas.has(o.ferramenta) ? 0 : 6;
  n = Math.min(n, S.obst[tipo] || 0, Math.floor((Math.min(segMax, rest(S)) - troca) / custo)); if (n <= 0) return 0;
  usar(S, n * custo + trocaDeFerramenta(S, o.ferramenta), 'limpar terra', n * golpes / porGolpe); S.obst[tipo] -= n;
  for (const [k, q] of Object.entries(o.da)) soma(S.est, k, Math.round(n * q * (o.chance ?? 1)));
  emitir(S, 'limpou', { obstaculo: tipo, n }); darXp(S, n * o.xp, 'limpar terra'); desgaste(S, o.ferramenta, n * golpes / porGolpe);
  return n;
}
const FONTE = { madeira: ['toco', 'mata'], pedra: ['pedra'], fibra: ['mato'] };
function daParaJuntar(S, k, n) { // a terra que o jogador já tem dá este material?
  if (k === 'tabua') return !!S.constr['bancada-de-carpintaria'] && daParaJuntar(S, 'madeira', Math.max(0, 2 * n - (S.est.madeira || 0)));
  if (!FONTE[k]) return false;
  if (n <= 0) return true;
  let d = 0; for (const tp of FONTE[k]) { const o = D.terras.obstaculos[tp], f = it(S, o.ferramenta); if (f && (f.forca || 1) >= (o.forcaMinima || 1)) d += (S.obst[tp] || 0) * Object.values(o.da)[0] * (o.chance ?? 1); }
  return d >= n;
}
function limparTerra(S, plano, ocioso) {
  const alvo = alvoDaMissao(S), seg = ocioso || 30;
  if (alvo.ev === 'limpou') limpar(S, alvo.f.obstaculo, alvo.falta, seg);
  for (const [k, tipos] of Object.entries(FONTE)) {
    let falta = (plano.quer[k] || 0) - (S.est[k] || 0);
    for (const tp of tipos) { if (falta <= 0) break; const o = D.terras.obstaculos[tp], rende = Object.values(o.da)[0] * (o.chance ?? 1); falta -= limpar(S, tp, Math.ceil(falta / rende), seg) * rende; }
  }
  if (S.apertado || usavel(S) - noCampo(S) < 8) limpar(S, 'mato', 20, seg);
  if (ocioso) for (const tp of Object.keys(S.obst)) limpar(S, tp, 999, ocioso);
}

// ---------- animais, pomar ----------
function comprarRacao(S, item, n) { const x = D.itens[item]; if (!(x.compra > 0) || n <= 0) return 0; const q = Math.min(n, Math.floor(Math.max(0, S.ouro) / x.compra)); if (q > 0) { gastar(S, q * x.compra, 'ração comprada'); soma(S.est, item, q); } return q; }
function cuidarDosAnimais(S) {
  for (const [ab, a] of Object.entries(S.abr)) {
    const an = D.animais[a.animal], gap = S.t - a.visita;
    if (!a.n || gap < an.cicloSeg || !S.ferr[an.ferramenta] || rest(S) < 12) continue;
    const porBicho = Math.min(an.acumula || 1, Math.floor(gap / an.cicloSeg)), ciclos = a.n * porBicho, tratados = Math.min(ciclos, a.comida, a.agua);
    const produtos = Math.floor((tratados + (ciclos - tratados) * R.animais.semTratoRende) * an.rende);
    const acao = { ovo: A.recolherOvo, leite: A.ordenhar, la: A.tosquiar }[an.produto] || 1;
    usar(S, 2 * trajeto(S, 10) + trocaDeFerramenta(S, an.ferramenta) + produtos * (acao + 0.4), 'animais', produtos);
    soma(S.est, an.produto, produtos); desgaste(S, an.ferramenta, produtos);
    if (produtos) { emitir(S, 'recolheu', { item: an.produto, n: produtos, animal: a.animal }); darXp(S, produtos * (an.xp || 0), 'animais'); }
    S.repos += produtos * (an.preco.ouro - an.fimDeVida.fazendeiro) / an.vidaProdutiva; // a vida produtiva acaba: troca-se o bicho aos poucos
    if (S.repos >= 1 && S.ouro >= S.repos) { gastar(S, Math.floor(S.repos), 'troca de animais'); S.repos -= Math.floor(S.repos); }
    a.comida = Math.max(0, a.comida - tratados); a.agua = Math.max(0, a.agua - tratados);
    // repor comida e água para a próxima visita
    const [racao, q] = Object.entries(an.come)[0], querCocho = Math.min(grau(S, ab, 'cocho'), a.n * (an.acumula || 1)) - a.comida;
    if ((S.est[racao] || 0) < querCocho * q) comprarRacao(S, racao, querCocho * q - (S.est[racao] || 0));
    const pos = Math.min(querCocho, Math.floor((S.est[racao] || 0) / q));
    if (pos > 0) { S.est[racao] -= pos * q; a.comida += pos; usar(S, A.abastecerCocho + 2 * trajeto(S, 8), 'animais', 1); emitir(S, 'tratou', { abrigo: ab, parte: 'cocho' }); }
    const querAgua = Math.min(grau(S, ab, 'bebedouro'), a.n * (an.acumula || 1) * (an.bebe || 1)) - a.agua, regas = Math.ceil(querAgua / R.animais.aguasPorRega);
    if (regas > 0) { a.agua += querAgua; usar(S, A.abastecerBebedouro + regas * A.regar + 2 * trajeto(S, 8), 'animais', regas); emitir(S, 'tratou', { abrigo: ab, parte: 'bebedouro' }); }
    a.visita = S.t;
  }
  // animais de trabalho: comem ração; sem trato não ajudam nesta sessão
  for (const [id, w] of Object.entries(S.trab)) {
    const an = D.animais[id], gap = S.t - w.visita; if (gap < 3600) continue;
    const q = Math.min(4, Math.ceil(gap / an.cicloSeg)) * Object.values(an.come)[0];
    if ((S.est.racao || 0) < q) comprarRacao(S, 'racao', q - (S.est.racao || 0));
    w.tratado = (S.est.racao || 0) >= q; if (w.tratado) S.est.racao -= q;
    w.visita = S.t; usar(S, A.abastecerCocho + A.abastecerBebedouro + 2 * trajeto(S, 10), 'animais', 2); emitir(S, 'tratou', { abrigo: 'estabulo', parte: 'cocho' });
    if (id === 'cavalo' && w.tratado && S.ferr.sela) emitir(S, 'cavalgou', {});
  }
  for (const [id, p] of Object.entries(S.pets)) { const dia = Math.floor(S.t / DIA); if (p.afago === dia) continue; p.afago = dia; usar(S, A.afagar || 1, 'animais', 1); emitir(S, 'afagou', {}); for (const [k, n] of Object.entries(D.animais[id].efeito.sorteia[dia % D.animais[id].efeito.sorteia.length])) soma(S.est, k, n); }
}
function cuidarDoPomar(S) {
  for (const g of S.arv) {
    const a = D.arvores[g.id], adulta = g.plantada + a.cresceSeg;
    if (S.t < adulta || S.t - Math.max(adulta, g.colhida) < a.safraSeg) continue;
    const custo = g.n * (A.colherFruta + (a.espacamento + 1) / R.personagem.andar) + 2 * trajeto(S, 12); if (rest(S) < custo) continue;
    usar(S, custo, 'pomar', g.n); soma(S.est, a.fruto, g.n * a.rende); g.colhida = S.t;
    emitir(S, 'colheu', { arvore: g.id, item: a.fruto, n: g.n * a.rende }); darXp(S, g.n * a.xp, 'pomar');
  }
}

// ---------- indústrias ----------
const naFila = (S, item) => { let n = 0; for (const q of Object.values(S.filas)) for (const e of q) n += D.receitas[e.r].sai[item] || 0; return n; };
const receitaPara = (S, item) => (receitasDoItem[item] || []).find((rid) => S.constr[D.receitas[rid].onde] && D.receitas[rid].nivel <= S.nivel);
const lucro = (r) => Object.entries(r.sai).reduce((s, [k, n]) => s + n * D.itens[k].venda, 0) - Object.entries(r.entra).reduce((s, [k, n]) => s + n * (D.itens[k].venda || D.itens[k].compra || 0), 0);
function possivel(S, item, fundo = 0) { // dá para conseguir este item com o que a fazenda tem agora?
  if ((S.est[item] || 0) > 0) return true;
  if (culturaDoItem[item]) return D.culturas[culturaDoItem[item]].nivel <= S.nivel;
  if (arvoreDoItem[item]) return S.arv.some((g) => g.id === arvoreDoItem[item] && S.t >= g.plantada + D.arvores[g.id].cresceSeg);
  if (animalDoItem[item]) { const an = D.animais[animalDoItem[item]]; return !!(S.abr[an.abrigo] && S.abr[an.abrigo].n > 0 && S.ferr[an.ferramenta]); }
  if (D.itens[item].compra > 0 && ['embalagem', 'material'].includes(D.itens[item].tipo)) return true;
  if (fundo < 2) for (const rid of receitasDoItem[item] || []) { const r = D.receitas[rid]; if (S.constr[r.onde] && r.nivel <= S.nivel && Object.keys(r.entra).every((e) => possivel(S, e, fundo + 1))) return true; }
  return false;
}
function retirarProntos(S) {
  for (const q of Object.values(S.filas)) {
    let tirou = 0;
    while (q.length && q[0].pronto <= S.t && rest(S) > 2) { const rid = q.shift().r, r = D.receitas[rid]; for (const [k, n] of Object.entries(r.sai)) { soma(S.est, k, n); emitir(S, 'produziu', { item: k, n, onde: r.onde }); } darXp(S, r.xp, 'receitas'); usar(S, A.retirarProduto, 'indústrias', 1); tirou++; }
    if (tirou) usar(S, 2 * trajeto(S, 8), 'indústrias');
  }
}
function abastecerFilas(S, plano) {
  for (const [rid, vezes] of Object.entries(plano.rec)) {
    const r = D.receitas[rid], q = S.filas[r.onde]; if (!q) continue;
    let k = vezes, pos = 0;
    while (k-- > 0 && q.length < grau(S, r.onde, 'fila') && rest(S) > 3) {
      for (const [e, n] of Object.entries(r.entra)) { const x = D.itens[e], falta = n - (S.est[e] || 0); if (falta > 0 && x.tipo === 'embalagem' && S.ouro >= falta * x.compra) { gastar(S, falta * x.compra, 'embalagens'); soma(S.est, e, falta); } }
      if (!Object.entries(r.entra).every(([e, n]) => (S.est[e] || 0) >= n)) break;
      for (const [e, n] of Object.entries(r.entra)) S.est[e] -= n;
      q.push({ r: rid, pronto: Math.max(S.t, q.length ? q[q.length - 1].pronto : 0) + r.tempoSeg }); usar(S, A.abastecerFila, 'indústrias', 1); pos++;
    }
    if (pos) usar(S, 2 * trajeto(S, 8), 'indústrias');
  }
}

// ---------- o plano da vez: o que guardar, o que plantar e o que pôr nas filas ----------
function planejar(S) {
  const quer = {}, rec = {}, pend = [];
  const add = (k, n) => { quer[k] = (quer[k] || 0) + n; if (!pend.includes(k)) pend.push(k); };
  const forcar = (rid, n) => { rec[rid] = (rec[rid] || 0) + n; for (const [e, q] of Object.entries(D.receitas[rid].entra)) add(e, q * n); };
  for (const p of S.ped) if (p.itens) for (const [k, n] of Object.entries(p.itens)) add(k, n);
  const mi = D.missoes.vizinho[S.mi];
  if (mi && mi.nivel <= S.nivel && mi.objetivo.evento === 'produziu' && (mi.objetivo.filtro || {}).item) {
    const item = mi.objetivo.filtro.item, rid = receitaPara(S, item);
    if (rid) { const n = Math.ceil((mi.objetivo.n - S.miConta - naFila(S, item)) / D.receitas[rid].sai[item]); if (n > 0) forcar(rid, n); }
  }
  for (const a of Object.values(S.abr)) { const an = D.animais[a.animal]; for (const [k, q] of Object.entries(an.come || {})) add(k, a.n * (an.acumula || 1) * q * 2); }
  if (Object.keys(S.trab).length) add('racao', Object.keys(S.trab).length * 4);
  for (const [k, n] of Object.entries(S.alvoMat || {})) add(k, n);
  for (const [ind, st] of Object.entries(S.constr)) { // nas vagas que sobram, a receita que mais rende entre as que dá para fazer
    if (D.construcoes[ind].tipo !== 'industria' || !st.n) continue;
    const livres = grau(S, ind, 'fila') - (S.filas[ind] || []).length - Object.entries(rec).reduce((s, [rid, n]) => s + (D.receitas[rid].onde === ind ? n : 0), 0);
    if (livres <= 0) continue;
    let melhor = null, mv = 0;
    for (const [rid, r] of Object.entries(D.receitas)) { if (r.onde !== ind || r.nivel > S.nivel || rid === 'tabua' || rid === 'racao' || !Object.keys(r.entra).every((e) => possivel(S, e))) continue; const v = lucro(r) + r.xp; if (v > mv) { mv = v; melhor = rid; } }
    if (melhor) forcar(melhor, livres);
  }
  for (let i = 0; i < pend.length && i < 80; i++) { // o que falta e vem de receita puxa os insumos
    const k = pend[i], rid = receitaPara(S, k); if (!rid) continue;
    const r = D.receitas[rid], falta = quer[k] - (S.est[k] || 0) - naFila(S, k) - (rec[rid] || 0) * r.sai[k];
    if (falta > 0) forcar(rid, Math.ceil(falta / r.sai[k]));
  }
  return { quer, rec };
}

// ---------- pedidos ----------
function produzivel(S) {
  const L = S.nivel, out = { cultura: [], fruta: [], animal: [], receita: [] }, fora = new Set(D.pedidos.fora || []);
  for (const c of Object.values(D.culturas)) if (c.nivel <= L) out.cultura.push({ item: c.produto, seg: c.tempoSeg, nivel: c.nivel });
  for (const [id, a] of Object.entries(D.arvores)) if (possivel(S, a.fruto) && S.arv.some((g) => g.id === id)) out.fruta.push({ item: a.fruto, seg: a.safraSeg, nivel: a.nivel });
  for (const a of Object.values(S.abr)) { const an = D.animais[a.animal]; if (a.n && S.ferr[an.ferramenta]) out.animal.push({ item: an.produto, seg: an.cicloSeg, nivel: an.nivel }); }
  for (const [rid, r] of Object.entries(D.receitas)) if (rid !== 'tabua' && S.constr[r.onde] && r.nivel <= L && Object.keys(r.entra).every((e) => possivel(S, e))) for (const k of Object.keys(r.sai)) if (!fora.has(k)) out.receita.push({ item: k, seg: r.tempoSeg, nivel: r.nivel });
  return out;
}
function novoPedido(S) {
  const P = D.pedidos, L = S.nivel, V = P.valorAlvo, alvo = V.base * L ** V.expoente * (V.variacao[0] + S.sorte() * (V.variacao[1] - V.variacao[0]));
  const prod = produzivel(S), cats = Object.keys(P.categorias).filter((k) => prod[k].length);
  const sortear = (lista, peso) => { let tot = 0; for (const x of lista) tot += peso(x); let r = S.sorte() * tot; for (const x of lista) { r -= peso(x); if (r <= 0) return x; } return lista[lista.length - 1]; };
  const pesos = P.linhas.find((x) => L <= x.ateNivel).pesos, nLin = sortear(pesos.map((p, i) => ({ p, i })), (x) => x.p).i + 1;
  const partes = [[1], [0.6, 0.4], [0.45, 0.3, 0.25]][nLin - 1], itens = {}; let valorTotal = 0;
  const teto = (cat, seg) => { const m = P.loteMaximo[cat]; return Array.isArray(m) ? m.find((x) => seg <= x.ateSeg).n : m; };
  for (let i = 0; i < nLin; i++) {
    const cat = sortear(cats, (k) => P.categorias[k]), lista = prod[cat].filter((x) => !itens[x.item]); if (!lista.length) continue;
    const x = sortear(lista, (y) => (y.nivel >= L - P.regras.niveisDeNovidade ? P.regras.pesoDaNovidade : 1)), venda = D.itens[x.item].venda;
    const q = Math.max(1, Math.min(teto(cat, x.seg), Math.round(alvo * partes[i] / venda)));
    itens[x.item] = q; valorTotal += q * venda;
  }
  const ouro = Math.round(valorTotal * P.bonusOuro);
  return { itens, ouro, banca: valorTotal, xp: Math.round(ouro * P.xpPorOuro), desde: S.t };
}
function cuidarDosPedidos(S) {
  const P = D.pedidos; if (S.nivel < P.nivel) return;
  const vagas = [...P.vagas].reverse().find((v) => S.nivel >= v.nivel).vagas;
  while (S.ped.length < vagas) S.ped.push({ livreEm: S.t });
  for (let i = 0; i < S.ped.length; i++) {
    let p = S.ped[i];
    if (!p.itens) { if (p.livreEm > S.t) continue; p = S.ped[i] = novoPedido(S); }
    if (S.t - p.desde > P.trocaGratisAposSeg) p = S.ped[i] = novoPedido(S);
    if (!Object.entries(p.itens).every(([k, n]) => (S.est[k] || 0) >= n) || rest(S) < 4) continue;
    for (const [k, n] of Object.entries(p.itens)) S.est[k] -= n;
    ganhar(S, p.banca, 'pedidos (valor de banca)'); ganhar(S, p.ouro - p.banca, 'pedidos (bônus)'); darXp(S, p.xp, 'pedidos');
    emitir(S, 'entregou', { ouro: p.ouro, xp: p.xp }); usar(S, A.entregarPedido + trajeto(S, 6), 'pedidos', 1);
    S.ped[i] = { livreEm: S.t + Math.min(P.esperaSeg.max, P.esperaSeg.base + P.esperaSeg.porNivel * S.nivel) };
  }
}

// ---------- compras ----------
function alvoDaMissao(S) { // o que a missão do vizinho pede agora (vira prioridade nas compras)
  const mi = D.missoes.vizinho[S.mi], P = new Set(), out = { prio: P, f: {} };
  if (!mi || mi.nivel > S.nivel) return out;
  const o = mi.objetivo, f = o.filtro || {}; out.ev = o.evento; out.f = f; out.falta = o.n - S.miConta;
  const animal = (id) => { const a = D.animais[id]; P.add(id); if (a.abrigo) { P.add(a.abrigo); P.add('vaga:' + a.abrigo); } for (const x of porFuncao[a.ferramenta] || []) P.add(x.id); for (const e of a.exige || []) P.add(e); };
  if (o.evento === 'comprou') { for (const k of ['item', 'lote']) for (const v of [].concat(f[k] || [])) P.add(v); for (const v of [].concat(f.animal || [])) animal(v); if (f.familia) for (const [id, a] of Object.entries(D.animais)) if (a.familia === f.familia && a.preco.ouro) P.add(id); }
  if (o.evento === 'construiu' || o.evento === 'montou') P.add(f.construcao);
  if (o.evento === 'produziu' && f.item) for (const rid of receitasDoItem[f.item] || []) { P.add(D.receitas[rid].onde); for (const e of Object.keys(D.receitas[rid].entra)) { if (animalDoItem[e]) animal(animalDoItem[e]); for (const r2 of receitasDoItem[e] || []) P.add(D.receitas[r2].onde); } }
  if (o.evento === 'recolheu' && animalDoItem[f.item]) animal(animalDoItem[f.item]);
  if (o.evento === 'arou' && f.com === 'boi') animal('boi');
  if (o.evento === 'cavalgou') animal('cavalo');
  if (o.evento === 'plantou' && f.item && D.itens[f.item].tipo === 'muda') P.add(f.item);
  return out;
}
function serveAgora(S, f) { // ferramenta de trato ou de animal de trabalho só faz sentido com o bicho ou o abrigo
  const pede = { 'caixa-de-ovos': () => S.constr.galinheiro, balde: () => S.constr.curral, tesoura: () => S.constr.aprisco, arado: () => S.constr.estabulo, carroca: () => S.trab.boi, barril: () => S.trab.jumento, sela: () => S.trab.jumento }[f];
  return !pede || !!pede();
}
function quantasQuero(S, id, c) {
  if (id === 'aspersor') return Math.ceil(S.pico / 24);
  const moveis = Object.entries(S.constr).reduce((s, [k, v]) => s + (D.construcoes[k].tipo === 'movel' ? v.n : 0), 0), piso = grau(S, 'celeiro', 'interior') || {};
  const p = (() => { let v = D.construcoes.celeiro.interior.piso; const g = S.constr.celeiro.degrau; for (let k = 0; k < g; k++) if (D.construcoes.celeiro.ampliacoes[k].piso) v = D.construcoes.celeiro.ampliacoes[k].piso; return v; })();
  if (c.tipo === 'movel') {
    S.querPiso = moveis >= Math.floor(p[0] * p[1] / 6); if (S.querPiso) return 0;
    const cap = (k) => (S.constr[k] ? S.constr[k].n : 0) * D.construcoes[k].capacidade, tenho = S.constr[id] ? S.constr[id].n : 0;
    if (c.guarda === 'produtos') { const falta = S.picoEst * 1.3 - cap('prateleira-simples') - cap('prateleira-reforcada'); const melhor = S.nivel >= D.construcoes['prateleira-reforcada'].nivel ? 'prateleira-reforcada' : 'prateleira-simples'; return falta > 0 && id === melhor ? tenho + 1 : 0; }
    if (c.guarda === 'ferramentas') return Math.ceil(Object.keys(S.ferr).length / c.capacidade);
    return 1;
  }
  return 1;
}
function candidatos(S) {
  const L = S.nivel, alvo = alvoDaMissao(S), P = alvo.prio, out = [], pr = (id, base) => (P.has(id) ? 0 : base);
  for (const [f, lista] of Object.entries(porFuncao)) { // o próximo degrau de cada ferramenta
    const atual = S.ferr[f] ? D.itens[S.ferr[f]].degrau : 0, x = lista.find((y) => y.degrau === atual + 1);
    if (!x || !(x.compra > 0) || x.nivel > L || !(P.has(x.id) || serveAgora(S, f))) continue;
    out.push({ id: x.id, prio: pr(x.id, 2), ouro: x.compra, para: 'ferramentas', fazer: () => { S.ferr[f] = x.id; S.usos[f] = 0; emitir(S, 'comprou', { item: x.id, n: 1, ouro: x.compra, classe: x.tipo }); } });
  }
  for (const [id, c] of Object.entries(D.construcoes)) {
    if (c.inicial || !c.custo || c.custo.cash || c.nivel > L || (c.exige || []).some((e) => !S.constr[e])) continue;
    const tenho = (S.constr[id] ? S.constr[id].n : 0) + S.obras.filter((o) => o.id === id && o.degrau === undefined).length, enfeite = c.tipo === 'decoracao';
    const quero = P.has(id) ? (S.constr[id] && c.tipo !== 'movel' ? S.constr[id].n : tenho + 1) : enfeite ? 1 : quantasQuero(S, id, c);
    if (tenho >= Math.min(c.limite || 9999, quero)) continue;
    out.push({ id, prio: pr(id, enfeite ? 6 : 3), ouro: c.custo.ouro || 0, itens: c.custo.itens, casas: c.onde === 'fazenda' ? (c.casas[0] + 1) * (c.casas[1] + 1) : 0, folga: enfeite ? 4 : 1, para: enfeite ? 'enfeites' : c.tipo === 'movel' ? 'prateleiras e móveis' : id === 'aspersor' ? 'irrigação' : 'construções', fazer: () => obra(S, id) });
  }
  for (const [id, st] of Object.entries(S.constr)) { // ampliações
    const c = D.construcoes[id], a = (c.ampliacoes || [])[st.degrau]; if (!a || a.nivel > L || S.obras.some((o) => o.id === id && o.degrau !== undefined)) continue;
    const cheio = c.tipo === 'abrigo' && vagasLivres(S, id) <= 0;
    const prio = P.has('vaga:' + id) && cheio ? 0 : id === 'casa' ? 6 : c.tipo === 'abrigo' ? (cheio ? 3 : 9) : id === 'celeiro' ? (S.querPiso ? 3 : 6) : 4;
    if (prio < 9) out.push({ id: `${id}+${st.degrau + 1}`, prio, ouro: a.custo.ouro || 0, itens: a.custo.itens, folga: prio === 6 ? 3 : 1, para: a.fila ? 'vagas de fila' : id === 'casa' ? 'reforma da casa' : 'ampliações', fazer: () => obra(S, id, st.degrau) });
  }
  const comprou = (id, a) => emitir(S, 'comprou', { animal: id, n: 1, ouro: a.preco.ouro, classe: 'animal', familia: a.familia });
  for (const [id, a] of Object.entries(D.animais)) {
    if (!a.preco.ouro || a.nivel > L) continue;
    if (a.familia === 'estimacao') { const quer0 = P.has(id) && !Object.keys(S.pets).length; if (!S.pets[id]) out.push({ id, prio: quer0 ? 0 : 5, ouro: a.preco.ouro, folga: quer0 ? 1 : 3, para: 'animais', fazer: () => { S.pets[id] = { afago: -1 }; comprou(id, a); } }); continue; }
    if (!S.constr[a.abrigo] || vagasLivres(S, a.abrigo) <= 0) continue;
    if (a.familia === 'trabalho') { if (!S.trab[id] && !(a.exige || []).some((e) => !S.ferr[D.itens[e].funcao])) out.push({ id, prio: pr(id, 3), ouro: a.preco.ouro, para: 'animais', fazer: () => { S.trab[id] = { tratado: true, visita: S.t }; comprou(id, a); } }); continue; }
    out.push({ id, prio: pr(id, 3), ouro: a.preco.ouro, para: 'animais', fazer: () => { const ab = S.abr[a.abrigo] = S.abr[a.abrigo] || { animal: id, n: 0, visita: S.t, comida: 0, agua: 0 }; ab.n++; comprou(id, a); } });
  }
  const lote = D.terras.lotes[S.lotes];
  if (lote && lote.nivel <= L) out.push({ id: lote.id, prio: pr(lote.id, S.apertado ? 1 : 3), ouro: lote.preco, para: 'terras', fazer: () => { S.lotes++; const ar = (lote.area[2] - lote.area[0]) * (lote.area[3] - lote.area[1]); S.terra += ar; for (const [k, f] of Object.entries(lote.natureza || {})) soma(S.obst, k, Math.round(ar * f)); S.apertado = false; emitir(S, 'comprou', { lote: lote.id, n: 1, ouro: lote.preco, classe: 'lote' }); darXp(S, lote.xp || 0, 'terras'); } });
  for (const [id, a] of Object.entries(D.arvores)) {
    const tenho = S.arv.reduce((s, g) => s + (g.id === id ? g.n : 0), 0), m = D.itens[a.muda];
    if (a.nivel > L || (tenho >= 6 && !P.has(a.muda))) continue;
    out.push({ id: a.muda, prio: pr(a.muda, 4), ouro: m.compra, casas: (a.espacamento + 1) ** 2, para: 'mudas', repete: true, fazer: () => { const g = S.arv.find((x) => x.id === id && S.t - x.plantada < 3600); if (g) g.n++; else S.arv.push({ id, n: 1, plantada: S.t, colhida: 0 }); S.pomar += (a.espacamento + 1) ** 2; usar(S, (A.plantarMuda || 1) + 3, 'pomar', 1); emitir(S, 'comprou', { item: a.muda, n: 1, ouro: m.compra, classe: 'muda' }); emitir(S, 'plantou', { arvore: id, item: a.muda, n: 1 }); } });
  }
  for (const [id, x] of Object.entries(D.itens)) if (x.tipo === 'cosmetico' && x.compra > 0 && x.nivel <= L && !S.est[id]) out.push({ id, prio: 6, ouro: x.compra, folga: 4, para: 'enfeites', fazer: () => { S.est[id] = 1; emitir(S, 'comprou', { item: id, n: 1, ouro: x.compra, classe: 'cosmetico' }); } });
  return out.sort((a, b) => a.prio - b.prio || a.ouro - b.ouro);
}
function obra(S, id, degrau) {
  const c = D.construcoes[id], a = degrau === undefined ? c : c.ampliacoes[degrau];
  S.obras.push({ id, degrau, pronto: S.t + (a.obraSeg || 0) });
  if (degrau === undefined && c.onde === 'fazenda') S.construido += (c.casas[0] + 1) * (c.casas[1] + 1);
  usar(S, degrau === undefined ? (c.tipo === 'movel' ? A.montarMovel : A.colocarConstrucao) || 2 : 1, 'construir', 2); concluirObras(S);
}
function concluirObras(S) {
  for (const o of [...S.obras]) {
    if (o.pronto > S.t) continue;
    S.obras.splice(S.obras.indexOf(o), 1);
    const c = D.construcoes[o.id];
    if (o.degrau === undefined) { const st = S.constr[o.id] = S.constr[o.id] || { n: 0, degrau: 0 }; st.n++; if (c.tipo === 'industria') S.filas[o.id] = S.filas[o.id] || []; emitir(S, c.tipo === 'movel' ? 'montou' : 'construiu', { construcao: o.id }); darXp(S, c.xp || 0, 'construções'); } else { S.constr[o.id].degrau = o.degrau + 1; emitir(S, 'ampliou', { construcao: o.id, degrau: o.degrau + 1 }); darXp(S, c.ampliacoes[o.degrau].xp || 0, 'construções'); }
  }
}
function comprar(S) {
  const m = melhorCultura(S), reserva = m ? 12 * D.itens[D.culturas[m].semente].compra : 0;
  S.alvoMat = null; let poupando = false;
  for (const c of candidatos(S)) {
    if (rest(S) < 3) break;
    if (c.casas && usavel(S) - c.casas < 24) { S.apertado = true; continue; }
    if (S.ouro < c.ouro * (c.folga || 1) + reserva) { if (c.prio === 0) poupando = true; continue; }
    if (poupando && c.prio > 0 && c.ouro > S.ouro * 0.15) continue;
    const falta = {}; for (const [k, n] of Object.entries(c.itens || {})) if ((S.est[k] || 0) < n) falta[k] = n - (S.est[k] || 0);
    if (Object.keys(falta).length) { // material: junta na própria terra o que dá; o resto compra, se o ouro cobre a obra inteira
      if (S.alvoMat) continue;
      S.alvoMat = { ...c.itens };
      const compra = Object.entries(falta).filter(([k, n]) => !daParaJuntar(S, k, n)), preco = compra.reduce((s, [k, n]) => s + n * D.itens[k].compra, 0);
      if (S.ouro < c.ouro * (c.folga || 1) + preco + reserva) continue;
      if (preco) { gastar(S, preco, 'materiais comprados'); for (const [k, n] of compra) { soma(S.est, k, n); emitir(S, 'comprou', { item: k, n, ouro: n * D.itens[k].compra, classe: 'material' }); } }
      if (compra.length < Object.keys(falta).length) continue; // o resto está sendo juntado ou serrado
      S.alvoMat = null;
    }
    for (const [k, n] of Object.entries(c.itens || {})) S.est[k] -= n;
    gastar(S, c.ouro, c.para); c.fazer(); usar(S, 2, 'painéis', 2);
    if (S.quando[c.id] === undefined) S.quando[c.id] = S.t; registrar(S, `comprou: ${c.id} (${c.ouro} de ouro)`);
  }
}
function vender(S, plano) {
  let ouro = 0, n = 0, guardado = 0; const mi = D.missoes.vizinho[S.mi], guardar = mi && mi.objetivo.evento === 'guardou' ? mi.objetivo.n - S.miConta : 0;
  for (const [k, q] of Object.entries(S.est)) {
    const x = D.itens[k]; if (!(q > 0) || !(x.venda > 0) || !['colheita', 'produto'].includes(x.tipo)) continue;
    let sobra = Math.floor(q - (plano.quer[k] || 0)); if (sobra <= 0) continue;
    if (guardado < guardar) { const g = Math.min(sobra, guardar - guardado); guardado += g; sobra -= g; }
    if (sobra <= 0) continue;
    S.est[k] -= sobra; ouro += sobra * x.venda; n += sobra; emitir(S, 'vendeu', { item: k, n: sobra, ouro: sobra * x.venda });
  }
  if (guardado) { emitir(S, 'guardou', { n: guardado }); usar(S, A.guardar, 'vender e guardar', 1); }
  if (n) { ganhar(S, ouro, 'banca'); usar(S, A.vender, 'vender e guardar', 1); }
  S.picoEst = Math.max(S.picoEst * 0.999, Object.entries(S.est).reduce((s, [k, q]) => s + (['colheita', 'produto'].includes(D.itens[k].tipo) ? q : 0), 0));
}

// ---------- a sessão ----------
function proximoEvento(S) {
  let p = Infinity; const ve = (t) => { if (t > S.t && t < p) p = t; };
  for (const b of S.campo) if (b.regada !== null) ve(b.regada + D.culturas[b.c].tempoSeg / D.culturas[b.c].regas);
  for (const q of Object.values(S.filas)) if (q.length) ve(q[0].pronto);
  for (const o of S.obras) ve(o.pronto);
  for (const x of S.ped) if (!x.itens) ve(x.livreEm);
  for (const a of Object.values(S.abr)) ve(a.visita + D.animais[a.animal].cicloSeg);
  return p;
}
function passo(S) {
  conferirMissao(S); concluirObras(S); retirarProntos(S); cuidarDaLavoura(S); cuidarDosAnimais(S); cuidarDoPomar(S); cuidarDosPedidos(S);
  comprar(S);
  const plano = planejar(S);
  abastecerFilas(S, plano); limparTerra(S, plano); plantar(S, plano); vender(S, plano);
  return plano;
}
function sessao(S, inicio, segundos) {
  S.t = S.inicio = inicio; S.fim = inicio + segundos; S.usadas = new Set();
  const dia = Math.floor(inicio / DIA);
  if (S.diaria.dia !== dia) { // o presente do dia: avança a cada dia jogado
    S.diaria.dia = dia; const dias = D.missoes.diaria.dias, d = dias[S.diaria.casa % dias.length];
    recompensar(S, d.recompensa, 'diária'); if (S.diaria.casa < dias.length && d.primeiraVolta) recompensar(S, d.primeiraVolta, 'diária');
    S.diaria.casa++; emitir(S, 'resgatou', { classe: 'diaria' }); usar(S, 3, 'painéis', 2);
    const cp = D.missoes.compartilhar; if (cp.ligado && S.perfil.compartilhaACada && dia % S.perfil.compartilhaACada === 0 && dia > 0) { recompensar(S, cp.recompensa, 'compartilhar'); emitir(S, 'compartilhou', {}); }
  }
  for (let guarda = 0; rest(S) > 2 && guarda < 600; guarda++) {
    const antes = S.t, plano = passo(S);
    if (S.t - antes > 0.5) continue;
    const prox = Math.min(proximoEvento(S), S.fim); // nada a fazer agora: limpa terra enquanto espera; se não há o que limpar, fica à toa
    limparTerra(S, plano, (prox - S.t) * S.ap);
    if (S.t < prox) { soma(S.c.tempo, 'à toa (esperando)', (prox - S.t) * S.ap); S.t = prox + 0.01; }
  }
}
function simular(perfilId, dias) {
  const perfil = PERFIS[perfilId], S = novoEstado(perfil);
  for (let d = 0; d < dias; d++) {
    const antes = { g: totalDe(S.c.ouroDe), p: totalDe(S.c.ouroPara), c: totalDe(S.c.cashDe), tq: S.c.toques, po: S.c.poco, co: S.c.colhidas, tm: totalDe(S.c.tempo) - (S.c.tempo['à toa (esperando)'] || 0), at: S.c.tempo['à toa (esperando)'] || 0 };
    perfil.sessoes.forEach(([hora, min], k) => { S.primeira = d === 0 && k === 0; sessao(S, d * DIA + hora * 3600, min * 60); if (S.primeira) { S.fimDaPrimeira = { nivel: S.nivel, xp: S.xp, ouro: S.ouro }; } S.primeira = false; });
    S.porDia.push({ dia: d + 1, nivel: S.nivel, xp: S.xp, ouro: Math.round(S.ouro), ganho: totalDe(S.c.ouroDe) - antes.g, gasto: totalDe(S.c.ouroPara) - antes.p, cash: totalDe(S.c.cashDe) - antes.c, toques: S.c.toques - antes.tq, poco: S.c.poco - antes.po, colhidas: S.c.colhidas - antes.co, campo: Math.round(S.pico), atoa: (S.c.tempo['à toa (esperando)'] || 0) - antes.at, ativo: totalDe(S.c.tempo) - (S.c.tempo['à toa (esperando)'] || 0) - antes.tm, missao: S.mi });
  }
  return S;
}
const totalDe = (o) => Object.values(o).reduce((s, n) => s + n, 0);

// ---------- calibrar a curva de níveis (ponto fixo: simula, acerta a curva nas âncoras, repete) ----------
function arred(x) { if (x <= 0) return 0; const alg = x >= 1000 ? 3 : 2, p = 10 ** Math.max(0, Math.floor(Math.log10(x)) - (alg - 1)); return Math.round(x / p) * p; }
function calibrar() {
  const max = D.niveis.maximo || D.niveis.xp.length;
  for (let volta = 0; volta < 10; volta++) {
    const S = simular('regular', METAS[METAS.length - 1].dia);
    // a 1ª sessão é acertada à mão: nível 2 logo depois da primeira colheita, 3 perto da metade e 4 antes do fim
    const anc = [{ nivel: 2, xp: PRIMEIRA[0] }, { nivel: 3, xp: PRIMEIRA[1] }, { nivel: 4, xp: PRIMEIRA[2] }, ...METAS.filter((m) => m.dia > 0).map((m) => ({ nivel: m.nivel, xp: 0.92 * S.porDia[m.dia - 1].xp }))];
    const nova = [0];
    for (let L = 2; L <= anc[anc.length - 1].nivel; L++) {
      const k = anc.findIndex((a) => a.nivel >= L), a = anc[Math.max(0, k - 1)], b = anc[k];
      const alvo = b.nivel === L ? b.xp : a.xp * (b.xp / a.xp) ** ((L - a.nivel) / (b.nivel - a.nivel));
      const velha = D.niveis.xp[L - 1] || alvo; nova.push(L <= 4 ? alvo : Math.sqrt(velha * alvo)); // meio caminho: evita que a conta oscile
    }
    // depois do último nível com meta: cada nível pede um pouco mais, de modo que o 50 caia perto de um ano
    const ult = METAS[METAS.length - 1], ritmo = (S.porDia[ult.dia - 1].xp - S.porDia[ult.dia - 15].xp) / 14, inc0 = nova[ult.nivel - 1] - nova[ult.nivel - 2], falta = ritmo * (DIA_DO_NIVEL_50 - ult.dia);
    let lo = 1, hi = 1.5; for (let i = 0; i < 40; i++) { const g = (lo + hi) / 2; let s = 0, inc = inc0; for (let L = ult.nivel + 1; L <= 50; L++) { inc *= g; s += inc; } if (s > falta) hi = g; else lo = g; }
    let inc = inc0; for (let L = ult.nivel + 1; L <= max; L++) { inc *= lo; nova.push(nova[nova.length - 1] + inc); }
    // cada nível pede pelo menos o mesmo que o anterior: onde a conta dá um degrau para baixo, tira-se a média dos vizinhos (o total não muda)
    const incs = nova.slice(1).map((v, i) => v - nova[i]), blocos = [];
    incs.forEach((v, i) => { blocos.push({ soma: v, n: 1 }); while (i >= 4 && blocos.length > 4 && blocos[blocos.length - 2].soma / blocos[blocos.length - 2].n > blocos[blocos.length - 1].soma / blocos[blocos.length - 1].n) { const b = blocos.pop(); blocos[blocos.length - 1].soma += b.soma; blocos[blocos.length - 1].n += b.n; } });
    const lisos = blocos.flatMap((b) => Array(b.n).fill(b.soma / b.n));
    const lista = [0]; for (let L = 2; L <= max; L++) lista.push(lista[L - 2] + Math.max(1, arred(lisos[L - 2])));
    const mudou = lista.reduce((s, v, i) => Math.max(s, D.niveis.xp[i] ? Math.abs(v / D.niveis.xp[i] - 1) : 0), 0);
    D.niveis.xp = lista;
    console.log(`volta ${volta + 1}: maior mudança ${(mudou * 100).toFixed(1)}%   crescimento por nível depois do ${ult.nivel}: ${((lo - 1) * 100).toFixed(1)}%`);
    if (mudou < 0.02) break;
  }
  if (tem('gravar')) {
    const arq = join(PASTA, 'niveis.json'), txt = readFileSync(arq, 'utf8'), novo = txt.replace(/"xp": \[[^\]]*\]/, '"xp": [' + D.niveis.xp.join(', ') + ']');
    if (novo === txt && !txt.includes('"xp": [' + D.niveis.xp.join(', ') + ']')) throw new Error('não achei a linha "xp" em niveis.json');
    writeFileSync(arq, novo); console.log('curva gravada em', arq);
  } else console.log('curva (não gravada; use --gravar):\n' + D.niveis.xp.join(', '));
}

// ---------- tabelas ----------
const f0 = (n) => Math.round(n).toLocaleString('pt-BR');
const col = (v, w) => String(v).padStart(w);
function tabela(titulo, cab, linhas) {
  const w = cab.map((c, i) => Math.max(String(c).length, ...linhas.map((l) => String(l[i]).length)));
  console.log('\n' + titulo); console.log(cab.map((c, i) => (i ? col(c, w[i]) : String(c).padEnd(w[0]))).join('  ')); console.log(w.map((x) => '-'.repeat(x)).join('  '));
  for (const l of linhas) console.log(l.map((c, i) => (i ? col(c, w[i]) : String(c).padEnd(w[0]))).join('  '));
}
const diaDe = (S, t) => (t === undefined ? null : Math.floor(t / DIA) + 1);
function relatorio(dias) {
  const ids = valor('perfil', '') ? [valor('perfil')] : Object.keys(PERFIS), Ss = {};
  for (const id of ids) Ss[id] = simular(id, dias);
  console.log('RITMO E ECONOMIA: conta feita a partir de jogo/dados (não é medição do jogo).');
  console.log(`Regra de arar: ${REARAR ? 'a casa volta a pedir enxada depois de cada colheita' : 'a casa fica arada depois da colheita (--sem-rearar)'}.  Dias simulados: ${dias}.`);
  tabela('Perfis (hipóteses)', ['perfil', 'min/dia', 'sessões', 'aproveitamento'], ids.map((id) => [id, PERFIS[id].minutos, PERFIS[id].sessoes.map(([h, m]) => `${Math.floor(h)}h${h % 1 ? '30' : ''} (${m} min)`).join(', '), Math.round(PERFIS[id].aproveitamento * 100) + '%']));
  const ref = Ss.regular || Ss[ids[0]];
  if (Ss.regular) {
    console.log(`\nPrimeira sessão (regular, ${PERFIS.regular.sessoes[0][1]} min): termina no nível ${ref.fimDaPrimeira.nivel}, com ${f0(ref.fimDaPrimeira.ouro)} de ouro.`);
    for (const l of ref.log) console.log(`  ${String(Math.floor(l.t / 60)).padStart(2)}:${String(Math.floor(l.t % 60)).padStart(2, '0')}  ${l.texto}`);
  }
  const marcos = [1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60, 75, 90, 120, 180].filter((d) => d <= dias);
  tabela('Nível no fim do dia', ['dia', ...ids, ...(Ss.regular ? ['meta (regular)'] : [])], marcos.map((d) => [d, ...ids.map((id) => Ss[id].porDia[d - 1].nivel), ...(Ss.regular ? [(METAS.find((m) => m.dia === d) || {}).nivel || ''] : [])]));
  const niveis = []; for (let L = 2; L <= 30; L++) niveis.push(L); niveis.push(35, 40, 50);
  const quando = (S, L) => { if (S.nivelEm[L] !== undefined) return 'dia ' + diaDe(S, S.nivelEm[L]); const u = S.porDia[dias - 1], r = (u.xp - S.porDia[Math.max(0, dias - 15)].xp) / Math.min(14, dias - 1); return '~dia ' + Math.round(dias + (D.niveis.xp[L - 1] - u.xp) / r); };
  tabela('Dia em que chega a cada nível ("~" = projeção pelo ritmo dos últimos 14 dias)', ['nível', 'xp total', ...ids], niveis.map((L) => [L, f0(D.niveis.xp[L - 1]), ...ids.map((id) => quando(Ss[id], L))]));
  const faixas = [[1, 1], [2, 3], [4, 7], [8, 14], [15, 30], [31, 60], [61, 90], [91, 180]].filter(([a]) => a <= dias).map(([a, b]) => [a, Math.min(b, dias)]);
  const media = (S, a, b, k) => S.porDia.slice(a - 1, b).reduce((s, d) => s + d[k], 0) / (b - a + 1);
  for (const id of ids) {
    const S = Ss[id], ns = PERFIS[id].sessoes.length;
    tabela(`Ouro por dia, perfil ${id} (média de cada faixa de dias)`, ['dias', 'ganho/dia', 'gasto/dia', 'saldo no fim', 'nível', 'cash grátis/dia'], faixas.map(([a, b]) => [a === b ? a : `${a}-${b}`, f0(media(S, a, b, 'ganho')), f0(media(S, a, b, 'gasto')), f0(S.porDia[b - 1].ouro), S.porDia[b - 1].nivel, media(S, a, b, 'cash').toFixed(1)]));
    tabela(`Rega e toques, perfil ${id} (por sessão; "toques" = ações, sem contar arrastar)`, ['dias', 'campo (casas)', 'casas colhidas', 'toques', 'toques por casa', 'idas ao poço', 'à toa (min)'], faixas.map(([a, b]) => { const co = media(S, a, b, 'colhidas') / ns, tq = media(S, a, b, 'toques') / ns; return [a === b ? a : `${a}-${b}`, S.porDia[b - 1].campo, f0(co), f0(tq), co ? (tq / co).toFixed(1) : '-', (media(S, a, b, 'poco') / ns).toFixed(1), (media(S, a, b, 'atoa') / ns / 60 / PERFIS[id].aproveitamento).toFixed(1)]; }));
  }
  const pct = (o) => { const t = totalDe(o) || 1; return Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) => [k, f0(n), Math.round(100 * n / t) + '%']); };
  for (const id of ids) {
    const S = Ss[id];
    tabela(`De onde vem o ouro em ${dias} dias, perfil ${id}`, ['fonte', 'ouro', 'parte'], pct(S.c.ouroDe));
    tabela(`Para onde vai o ouro em ${dias} dias, perfil ${id}`, ['destino', 'ouro', 'parte'], pct(S.c.ouroPara));
  }
  tabela(`De onde vem a experiência em ${dias} dias`, ['fonte', ...ids], Object.keys(ref.c.xpDe).sort((a, b) => ref.c.xpDe[b] - ref.c.xpDe[a]).map((k) => [k, ...ids.map((id) => Math.round(100 * (Ss[id].c.xpDe[k] || 0) / totalDe(Ss[id].c.xpDe)) + '%')]));
  tabela(`Cash grátis em ${dias} dias (sem contar convite; começa com ${R.inicio.cash})`, ['fonte', ...ids], [...Object.keys(ref.c.cashDe).map((k) => [k, ...ids.map((id) => Ss[id].c.cashDe[k] || 0)]), ['TOTAL', ...ids.map((id) => totalDe(Ss[id].c.cashDe))], ['por dia', ...ids.map((id) => (totalDe(Ss[id].c.cashDe) / dias).toFixed(2))], ['nos 30 primeiros dias', ...ids.map((id) => Ss[id].porDia.slice(0, 30).reduce((s, d) => s + d.cash, 0))]]);
  tabela('Para onde vai o tempo de ação', ['tarefa', ...ids], Object.keys(ref.c.tempo).sort((a, b) => ref.c.tempo[b] - ref.c.tempo[a]).map((k) => [k, ...ids.map((id) => Math.round(100 * (Ss[id].c.tempo[k] || 0) / totalDe(Ss[id].c.tempo)) + '%')]));
  // quando cada coisa libera e quando o jogador consegue comprar (mede se o preço está no lugar)
  const coisas = [];
  const linha = (rot, nivel, chave) => coisas.push([rot, nivel, ...ids.map((id) => { const S = Ss[id], lib = S.nivelEm[nivel], c = S.quando[chave]; return lib === undefined ? '-' : c === undefined ? `libera dia ${diaDe(S, lib)}, não comprou` : `dia ${diaDe(S, c)} (+${diaDe(S, c) - diaDe(S, lib)})`; })]);
  for (const [id, x] of Object.entries(D.itens)) if (x.compra >= 300 && (x.tipo === 'ferramenta' || x.tipo === 'recipiente')) linha(x.nome, x.nivel, id);
  for (const [id, c] of Object.entries(D.construcoes)) { if (!c.inicial && c.custo && !c.custo.cash && c.tipo !== 'decoracao' && c.tipo !== 'movel') linha(c.nome, c.nivel, id); (c.ampliacoes || []).forEach((a, k) => linha(`${c.nome}: ${a.nome}`, a.nivel, `${id}+${k + 1}`)); }
  for (const [id, a] of Object.entries(D.animais)) if (a.preco.ouro) linha(a.nome, a.nivel, id);
  for (const l of D.terras.lotes) linha(`Lote: ${l.nome} (${f0(l.preco)})`, l.nivel, l.id);
  coisas.sort((a, b) => a[1] - b[1]);
  tabela('Compras: dia da compra (+ dias depois de liberar)', ['o quê', 'nível', ...ids], coisas);
  tabela('Missões do vizinho e conquistas', ['perfil', 'missões cumpridas', 'última missão no dia', 'marcos de conquista'], ids.map((id) => { const S = Ss[id], ult = D.missoes.vizinho[S.mi - 1]; return [id, `${S.mi} de ${D.missoes.vizinho.length}`, ult ? `${diaDe(S, S.quando['missão ' + ult.id])} (${ult.id})` : '-', Object.values(S.conqMarco).reduce((s, n) => s + n, 0) + ' de ' + D.missoes.conquistas.reduce((s, c) => s + c.marcos.length, 0)]; }));
  const fim = ref.porDia[dias - 1];
  console.log(`\nResumo (regular): dia ${dias} no nível ${fim.nivel}, saldo de ${f0(fim.ouro)} de ouro; ganha ${f0(media(ref, Math.max(1, dias - 13), dias, 'ganho'))} por dia e gasta ${f0(media(ref, Math.max(1, dias - 13), dias, 'gasto'))}.`);
}

if (tem('calibrar')) { calibrar(); if (!tem('quieto')) relatorio(+valor('dias', 90)); } else relatorio(+valor('dias', 90));
