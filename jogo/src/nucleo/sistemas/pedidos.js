// O quadro de pedidos: clientes da vizinhança pedem o que a fazenda produz, pagam mais que a banca e dão experiência.
// O quadro (objeto "quadro-de-pedidos") já vem na fazenda, no ponto de terras.json, e abre no nível de pedidos.json.
//
//   mundo.pedidos = {
//     vagas: [{ pedido: { cliente, itens: { item: n }, ouro, xp, desde } | null, livreEm }],
//     semente,        estado do sorteio dos pedidos (um inteiro: a mesma gravação gera os mesmos pedidos)
//     trocaGratisEm,  instante em que a troca sem espera volta a valer
//     entregues, feitos }
//
// Quantas vagas: pedidos.vagas, pelo nível. Vaga vazia com "livreEm" no passado ganha um pedido novo (na hora em que
// o relógio é conferido: a cada segundo e na volta de uma ausência).
//
// Como nasce um pedido (tudo de pedidos.json):
//   valor-alvo   valorAlvo.base × nível^expoente, vezes um número sorteado dentro de valorAlvo.variacao
//   linhas       1 a 3 itens diferentes, sorteados pelos pesos de "linhas" para o nível; o valor-alvo se divide entre
//                as linhas (100%; 60% e 40%; 45%, 30% e 25%: a mesma divisão do simulador da economia)
//   categoria    sorteada pelos pesos de "categorias", só entre as que o jogador produz agora:
//                cultura (liberada pelo nível), fruta (tem a árvore adulta), animal (tem o bicho) e receita (tem a
//                indústria pronta, o nível da receita e de onde tirar cada ingrediente). Só entra colheita e produto
//                com preço de venda; o que está em "fora" nunca
//   item         sem repetir item entre os pedidos abertos; só o que tem lote que valha regras.fracaoMinimaDaLinha da
//                linha (item barato sai de cena nos níveis altos); em regras.viesDeEstoque das linhas, prefere o que
//                o jogador já tem guardado; o que liberou nos últimos regras.niveisDeNovidade níveis pesa
//                regras.pesoDaNovidade vezes mais
//   quantidade   valor da linha ÷ preço de venda, de 1 até o lote máximo ("loteMaximo", pelo tempo que o item leva)
//   paga         ouro = valor na banca × bonusOuro; experiência = ouro × xpPorOuro
// O primeiro pedido da fazenda é sempre simples: uma linha só, de uma cultura (de preferência a que o jogador já tem
// guardada), e nunca mais do que cabe no cesto.
//
// Comandos:
//   entregarPedido { vaga }   precisa ter tudo guardado (bolsa, celeiro ou cesto); paga, dá experiência e a vaga
//                             espera esperaSeg.base + porNivel × nível (até max) para trazer outro pedido
//   trocarPedido { vaga }     descarta: a vaga espera descartar.esperaVezes × a espera normal. A cada
//                             trocaGratisAposSeg há uma troca grátis, sem espera (o pedido novo chega na hora)
// A espera da vaga não se pula com cash (não há concluível para ela).
// Eventos: entregou { ouro, xp, cliente, n: 1, vaga, itens }, trocouPedido { vaga, gratis, seg }, chegouPedido { vaga, cliente }.
import { registrarSistema, registrarEvento } from '../registro.js';
import { registrarGuia } from '../guia.js';
import { Sorteio } from '../util.js';
import { quantoTem, oQueFalta, gastarItens, ganharOuro, capacidadeDoCesto } from './posses.js';
import { darXp } from './niveis.js';
import { comportamento, adotar, temPronta } from './construcao.js';
import { receitasDe, guiaDoItem } from './industria.js';

export const QUADRO = 'quadro-de-pedidos';
export const CATEGORIAS = ['cultura', 'fruta', 'animal', 'receita'];
const PARTES = [[1], [0.6, 0.4], [0.45, 0.3, 0.25]]; // a fatia do valor-alvo de cada linha
const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const um = (v, serve) => v === undefined || (Array.isArray(v) ? v.some(serve) : serve(v));

// ---------- pedidos.json, conferido uma vez por conjunto de dados (null = este jogo não tem quadro de pedidos) ----------
const guardado = new WeakMap();
export function pedidosDe(dados) {
  if (guardado.has(dados)) return guardado.get(dados);
  const B = dados.bruto && obj(dados.bruto.pedidos) ? dados.bruto.pedidos : null;
  let P = null;
  if (B && dados.construcoes && dados.construcoes[QUADRO]) {
    const V = obj(B.valorAlvo) ? B.valorAlvo : {}, E = obj(B.esperaSeg) ? B.esperaSeg : {}, G = obj(B.regras) ? B.regras : {}, C = obj(B.categorias) ? B.categorias : {};
    const vagas = (Array.isArray(B.vagas) ? B.vagas : []).filter((v) => obj(v) && v.nivel >= 1 && v.vagas >= 1).map((v) => ({ nivel: v.nivel, vagas: Math.round(v.vagas) })).sort((a, b) => a.nivel - b.nivel);
    const nivel = B.nivel >= 1 ? B.nivel : vagas.length ? vagas[0].nivel : 1;
    if (!vagas.length) vagas.push({ nivel, vagas: 2 });
    const linhas = (Array.isArray(B.linhas) ? B.linhas : []).filter((l) => obj(l) && Array.isArray(l.pesos) && l.pesos.length).map((l) => ({ ateNivel: num(l.ateNivel) ? l.ateNivel : Infinity, pesos: l.pesos.slice(0, PARTES.length).map((p) => (p > 0 ? p : 0)) }));
    if (!linhas.length) linhas.push({ ateNivel: Infinity, pesos: [1] });
    const clientes = (Array.isArray(B.clientes) ? B.clientes : []).filter((c) => obj(c) && c.id).map((c) => ({ id: c.id, nome: c.nome || c.id }));
    if (!clientes.length) clientes.push({ id: 'vizinhanca', nome: 'Vizinhança' });
    const categorias = {};
    for (const c of CATEGORIAS) categorias[c] = C[c] > 0 ? C[c] : 0;
    if (!CATEGORIAS.some((c) => categorias[c] > 0)) for (const c of CATEGORIAS) categorias[c] = 1;
    P = {
      nivel, vagas, linhas, clientes, categorias,
      valorAlvo: { base: V.base > 0 ? V.base : 10, expoente: num(V.expoente) ? V.expoente : 1, variacao: Array.isArray(V.variacao) && V.variacao.length === 2 && V.variacao[0] > 0 && V.variacao[1] >= V.variacao[0] ? V.variacao : [1, 1] },
      bonusOuro: B.bonusOuro > 0 ? B.bonusOuro : 1, xpPorOuro: B.xpPorOuro >= 0 ? B.xpPorOuro : 0,
      esperaSeg: { base: E.base >= 0 ? E.base : 0, porNivel: E.porNivel >= 0 ? E.porNivel : 0, max: E.max > 0 ? E.max : Infinity },
      esperaVezes: obj(B.descartar) && B.descartar.esperaVezes >= 0 ? B.descartar.esperaVezes : 1,
      trocaGratisAposSeg: B.trocaGratisAposSeg > 0 ? B.trocaGratisAposSeg : 0,
      loteMaximo: obj(B.loteMaximo) ? B.loteMaximo : {},
      regras: {
        fracaoMinimaDaLinha: G.fracaoMinimaDaLinha >= 0 ? G.fracaoMinimaDaLinha : 0, viesDeEstoque: G.viesDeEstoque >= 0 ? G.viesDeEstoque : 0,
        pesoDaNovidade: G.pesoDaNovidade > 0 ? G.pesoDaNovidade : 1, niveisDeNovidade: G.niveisDeNovidade >= 0 ? G.niveisDeNovidade : 0,
      },
      fora: new Set(Array.isArray(B.fora) ? B.fora : []),
    };
  }
  guardado.set(dados, P);
  return P;
}

// ---------- consultas ----------
export function vagasNoNivel(cfg, nivel) { let n = 0; for (const v of cfg.vagas) if (nivel >= v.nivel) n = v.vagas; return nivel >= cfg.nivel ? n : 0; }
// segundos que a vaga espera depois de uma entrega, no nível dado
export const esperaDaVaga = (cfg, nivel) => Math.min(cfg.esperaSeg.max, cfg.esperaSeg.base + cfg.esperaSeg.porNivel * nivel);
const loteDe = (cfg, cat, seg) => { const mx = cfg.loteMaximo[cat]; if (num(mx)) return Math.max(1, Math.round(mx)); if (!Array.isArray(mx) || !mx.length) return 99; const f = mx.find((x) => seg <= x.ateSeg) || mx[mx.length - 1]; return f.n >= 1 ? Math.round(f.n) : 1; };

// O jogador tem de onde tirar isto? Cada frente responde pelo que é dela; estas respostas leem só o estado do mundo
// e valem mesmo se o sistema de árvores ou de animais não existir (aí a categoria fica de fora).
export const TEM = {
  // uma árvore adulta desta espécie
  arvore(m, id) {
    const A = m.arvores && Array.isArray(m.arvores.todas) ? m.arvores.todas : null, def = m.dados.arvores && m.dados.arvores[id];
    return !!A && !!def && A.some((e) => e && e.arvore === id && m.agora >= e.plantada + def.cresceSeg * 1000);
  },
  // um bicho desta espécie na fazenda
  animal(m, id) { const L = m.animais && Array.isArray(m.animais.lista) ? m.animais.lista : null; return !!L && L.some((a) => a && a.especie === id); },
};
const animaisDe = (D) => (obj(D.animais) ? D.animais : {});
const arvoresDe = (D) => (obj(D.arvores) ? D.arvores : {});

// dá para o jogador conseguir este item agora (para ser ingrediente de uma receita pedida)?
function possivel(m, item, fundo = 0) {
  const D = m.dados, it = D.itens[item];
  if (!it) return false;
  for (const c of Object.values(D.culturas)) if (c.produto === item && c.nivel <= m.progresso.nivel) return true;
  for (const [id, a] of Object.entries(arvoresDe(D))) if (a.fruto === item && TEM.arvore(m, id)) return true;
  for (const [id, a] of Object.entries(animaisDe(D))) if (a.produto === item && TEM.animal(m, id)) return true;
  if (it.compra > 0 && it.nivel <= m.progresso.nivel && D.loja.ouro.includes(item) && (it.tipo === 'material' || it.tipo === 'embalagem')) return true;
  if (fundo < 3) for (const r of receitasDe(D).porItem[item] || []) if (receitaPossivel(m, r, fundo + 1)) return true;
  return false;
}
function receitaPossivel(m, r, fundo = 0) {
  if (r.nivel > m.progresso.nivel || !temPronta(m, r.onde)) return false;
  for (const k in r.entra) if (!possivel(m, k, fundo)) return false;
  return true;
}

// o que o quadro pode pedir agora: [{ item, cat, seg, nivel, lote }] (um item entra uma vez só, na primeira categoria que o dá)
export function produzivel(m) {
  const cfg = pedidosDe(m.dados), D = m.dados, L = m.progresso.nivel, out = [], vistos = new Set();
  if (!cfg) return out;
  const entra = (item, cat, seg, nivel) => {
    const it = D.itens[item];
    if (!it || vistos.has(item) || cfg.fora.has(item) || !(it.venda > 0) || (it.tipo !== 'colheita' && it.tipo !== 'produto')) return;
    vistos.add(item);
    out.push({ item, cat, seg, nivel, lote: loteDe(cfg, cat, seg) });
  };
  for (const c of Object.values(D.culturas)) if (c.nivel <= L) entra(c.produto, 'cultura', c.tempoSeg, c.nivel);
  for (const [id, a] of Object.entries(arvoresDe(D))) if (TEM.arvore(m, id)) entra(a.fruto, 'fruta', a.safraSeg, a.nivel || 1);
  for (const [id, a] of Object.entries(animaisDe(D))) if (a.produto && TEM.animal(m, id)) entra(a.produto, 'animal', a.cicloSeg || 0, a.nivel || 1);
  for (const r of Object.values(receitasDe(D).todas)) if (receitaPossivel(m, r)) for (const k in r.sai) entra(k, 'receita', r.tempoSeg, r.nivel);
  return out;
}

// ---------- sortear um pedido ----------
// evita = itens que não devem vir (os do pedido que acabou de ser trocado). Devolve null se não há o que pedir;
// a semente só anda quando sai um pedido.
function novoPedido(m, cfg, evita) {
  const D = m.dados, L = m.progresso.nivel, P = m.pedidos, primeiro = P.feitos === 0;
  const usados = new Set(evita || []), clientesNoQuadro = new Set();
  for (const v of P.vagas) if (v.pedido) { clientesNoQuadro.add(v.pedido.cliente); for (const k in v.pedido.itens) usados.add(k); }
  let cand = produzivel(m).filter((x) => !usados.has(x.item));
  if (primeiro && cand.some((x) => x.cat === 'cultura')) cand = cand.filter((x) => x.cat === 'cultura');
  if (!cand.length) return null;
  const s = new Sorteio(P.semente);
  const sortear = (lista, peso) => { let tot = 0; for (const x of lista) tot += peso(x); let r = s.prox() * tot; for (const x of lista) { r -= peso(x); if (r <= 0) return x; } return lista[lista.length - 1]; };
  const V = cfg.valorAlvo, alvo = V.base * Math.pow(L, V.expoente) * s.entre(V.variacao[0], V.variacao[1]);
  const pesos = primeiro ? [1] : (cfg.linhas.find((x) => L <= x.ateNivel) || cfg.linhas[cfg.linhas.length - 1]).pesos;
  const nLin = sortear(pesos.map((p, i) => ({ p, i })), (x) => x.p).i + 1, partes = PARTES[nLin - 1];
  const itens = {};
  let valor = 0;
  for (let i = 0; i < nLin; i++) {
    const daLinha = alvo * partes[i], vies = s.prox() < cfg.regras.viesDeEstoque || primeiro;
    const livres = cand.filter((x) => !itens[x.item]);
    if (!livres.length) break;
    const valem = livres.filter((x) => x.lote * D.itens[x.item].venda >= cfg.regras.fracaoMinimaDaLinha * daLinha);
    let lista;
    if (valem.length) {
      const cats = CATEGORIAS.filter((c) => cfg.categorias[c] > 0 && valem.some((x) => x.cat === c));
      const cat = cats.length ? sortear(cats, (c) => cfg.categorias[c]) : null;
      lista = cat ? valem.filter((x) => x.cat === cat) : valem;
    } else {
      // nenhum lote vale a fração mínima da linha: pede o lote mais valioso que houver (melhor que vaga vazia)
      let melhor = livres[0];
      for (const x of livres) if (x.lote * D.itens[x.item].venda > melhor.lote * D.itens[melhor.item].venda) melhor = x;
      lista = [melhor];
    }
    if (vies) { const tem = lista.filter((x) => quantoTem(m, x.item) > 0); if (tem.length) lista = tem; }
    const x = sortear(lista, (y) => (y.nivel >= L - cfg.regras.niveisDeNovidade ? cfg.regras.pesoDaNovidade : 1)), venda = D.itens[x.item].venda;
    let q = Math.max(1, Math.min(x.lote, Math.round(daLinha / venda)));
    if (primeiro) q = Math.max(1, Math.min(q, capacidadeDoCesto(m)));
    itens[x.item] = q; valor += q * venda;
  }
  if (!(valor > 0)) return null;
  const livresC = cfg.clientes.filter((c) => !clientesNoQuadro.has(c.id)), cliente = sortear(livresC.length ? livresC : cfg.clientes, () => 1);
  const ouro = Math.max(1, Math.round(valor * cfg.bonusOuro));
  P.semente = s.a;
  P.feitos++;
  return { cliente: cliente.id, itens, ouro, xp: Math.round(ouro * cfg.xpPorOuro), desde: Math.round(m.agora) };
}

// abre as vagas que o nível dá e traz pedido novo para as vagas cuja espera acabou
function conferir(m, evita) {
  const cfg = pedidosDe(m.dados), P = m.pedidos;
  if (!cfg) return;
  const n = vagasNoNivel(cfg, m.progresso.nivel);
  while (P.vagas.length < n) P.vagas.push({ pedido: null, livreEm: m.agora });
  for (let i = 0; i < P.vagas.length; i++) {
    const v = P.vagas[i];
    if (v.pedido || v.livreEm > m.agora) continue;
    const p = novoPedido(m, cfg, evita) || (evita ? novoPedido(m, cfg, null) : null);
    if (!p) continue;
    v.pedido = p;
    m.eventos.emitir('chegouPedido', { vaga: i, cliente: p.cliente });
  }
}

// ---------- para o painel e para o balão do quadro ----------
// { aberto, nivel, vagas: [{ vaga, estado: 'pedido' | 'espera', cliente, nome, linhas: [{ item, precisa, tem }], pode,
//   ouro, xp, falta (segundos de espera) }], trancada: { nivel, vagas } | null, trocaGratis, trocaGratisEm (segundos),
//   esperaDaTroca (segundos que a vaga esperaria se o jogador trocasse sem a grátis) }
export function quadroDePedidos(m) {
  const cfg = pedidosDe(m.dados), P = m.pedidos, L = m.progresso.nivel;
  if (!cfg) return { aberto: false, nivel: 0, vagas: [], trancada: null, trocaGratis: false, trocaGratisEm: 0, esperaDaTroca: 0 };
  const vagas = P.vagas.map((v, i) => {
    if (!v.pedido) return { vaga: i, estado: 'espera', falta: Math.max(0, (v.livreEm - m.agora) / 1000) };
    const c = cfg.clientes.find((x) => x.id === v.pedido.cliente), linhas = [];
    let pode = true;
    for (const k in v.pedido.itens) { const tem = quantoTem(m, k); if (tem < v.pedido.itens[k]) pode = false; linhas.push({ item: k, precisa: v.pedido.itens[k], tem }); }
    return { vaga: i, estado: 'pedido', cliente: v.pedido.cliente, nome: c ? c.nome : v.pedido.cliente, linhas, pode, ouro: v.pedido.ouro, xp: v.pedido.xp, falta: 0 };
  });
  const prox = cfg.vagas.find((v) => v.nivel > L && v.vagas > P.vagas.length);
  return {
    aberto: L >= cfg.nivel, nivel: cfg.nivel, vagas, trancada: prox ? { nivel: prox.nivel, vagas: prox.vagas } : null,
    trocaGratis: cfg.trocaGratisAposSeg > 0 && P.trocaGratisEm <= m.agora, trocaGratisEm: Math.max(0, (P.trocaGratisEm - m.agora) / 1000),
    esperaDaTroca: cfg.esperaVezes * esperaDaVaga(cfg, L),
  };
}
// quantos pedidos dá para entregar agora
export function pedidosProntos(m) {
  let n = 0;
  if (m.pedidos) for (const v of m.pedidos.vagas) if (v.pedido && !oQueFalta(m, v.pedido.itens)) n++;
  return n;
}

// ---------- o toque no quadro ----------
function toque(m) {
  const cfg = pedidosDe(m.dados);
  if (!cfg) return null;
  if (m.progresso.nivel < cfg.nivel) return { acao: null, texto: 'quadro-fechado', dados: { nivel: cfg.nivel }, info: true };
  return { painel: 'pedidos', arg: null, texto: 'ver-pedidos', dados: { prontos: pedidosProntos(m) } };
}

// ---------- eventos ----------
registrarEvento('entregou', {
  campos: ['ouro', 'xp', 'cliente', 'n', 'vaga'],
  aceita: (dados, f) => { const cfg = pedidosDe(dados); return !!cfg && um(f.cliente, (id) => cfg.clientes.some((c) => c.id === id)); },
});
registrarEvento('trocouPedido', { campos: ['vaga', 'gratis', 'seg'] });
registrarEvento('chegouPedido', { campos: ['vaga', 'cliente'] });

// o guia de uma missão de entregar: antes de o jogador ver o quadro, é ele; com um pedido completo, também;
// senão, o passo para conseguir o que falta no pedido mais adiantado
registrarGuia('entregou', (m, f, out) => {
  const cfg = pedidosDe(m.dados), P = m.pedidos;
  if (!cfg || m.progresso.nivel < cfg.nivel || !m.local.porId[QUADRO]) return null;
  const quadro = () => { out.tipo = 'entidade'; out.id = QUADRO; return out; };
  if (!(m.industria && m.industria.dicas.quadro)) return quadro();
  let melhor = null, menos = Infinity, espera = Infinity;
  for (const v of P.vagas) {
    if (!v.pedido) { espera = Math.min(espera, (v.livreEm - m.agora) / 1000); continue; }
    let falta = 0;
    for (const k in v.pedido.itens) falta += Math.max(0, v.pedido.itens[k] - quantoTem(m, k)) * m.dados.itens[k].venda;
    if (falta <= 0) return quadro();
    if (falta < menos) { menos = falta; melhor = v.pedido; }
  }
  if (!melhor) { if (espera < Infinity) { out.tipo = 'esperar'; out.seg = Math.max(0, espera); return out; } return quadro(); }
  const f1 = oQueFalta(m, melhor.itens);
  return (f1 && guiaDoItem(m, f1.item, out)) || quadro();
});

const falha = (m, motivo, dados, emite = true) => { if (emite) m.eventos.emitir('faltou', { motivo, dados }); return { ok: false, motivo, dados }; };

// ---------- o sistema ----------
registrarSistema({
  id: 'pedidos',
  iniciar(m) {
    // a semente dos pedidos nasce da semente do mundo e da hora em que a fazenda começou (cada fazenda, os seus pedidos)
    m.pedidos = { vagas: [], semente: (m.sorteio.a ^ Math.imul(Math.floor(m.agora / 1000) | 0, 0x9e3779b1) ^ 0x5bd1e995) >>> 0, trocaGratisEm: 0, entregues: 0, feitos: 0 };
    const D = m.dados, cfg = pedidosDe(D), pt = D.terras.pontos[QUADRO], loc = m.locais.fazenda;
    if (!cfg) return;
    comportamento(QUADRO, { acaoPossivel: toque });
    // o quadro já vem na fazenda, no ponto de terras.json (a frente de construir cuida dele dali em diante)
    if (Array.isArray(pt) && loc && !loc.porId[QUADRO]) {
      const x = Math.floor(pt[0]), z = Math.floor(pt[1]), c = D.construcoes[QUADRO].casas;
      if (loc.areaLivre(x, z, x + c[0], z + c[1])) adotar(m, loc.por({ id: QUADRO, tipo: QUADRO, x, z }), 'fazenda');
    }
    m.eventos.ouvir('subiuDeNivel', () => conferir(m)); // o quadro abre (ou ganha vaga) na hora em que o nível chega
  },
  segundo: (m) => conferir(m),
  ausencia: (m) => conferir(m),

  comandos: {
    entregarPedido(m, c) {
      const cfg = pedidosDe(m.dados), P = m.pedidos, q = !c.quieto;
      if (!cfg) return falha(m, 'nao-existe', undefined, false);
      if (m.progresso.nivel < cfg.nivel) return falha(m, 'quadro-fechado', { nivel: cfg.nivel }, q);
      conferir(m);
      const i = Math.floor(c.vaga), v = P.vagas[i];
      if (!v || !v.pedido) return falha(m, 'sem-pedido', { vaga: i }, q);
      const f = oQueFalta(m, v.pedido.itens);
      if (f) return falha(m, 'falta-para-o-pedido', { ...f, vaga: i }, q);
      const p = v.pedido, seg = esperaDaVaga(cfg, m.progresso.nivel);
      gastarItens(m, p.itens);
      v.pedido = null; v.livreEm = m.agora + seg * 1000;
      P.entregues++;
      ganharOuro(m, p.ouro, 'pedido');
      m.eventos.emitir('entregou', { ouro: p.ouro, xp: p.xp, cliente: p.cliente, n: 1, vaga: i, itens: p.itens });
      darXp(m, p.xp, 'pedido');
      return { ok: true, dados: { vaga: i, ouro: p.ouro, xp: p.xp, cliente: p.cliente, seg } };
    },

    trocarPedido(m, c) {
      const cfg = pedidosDe(m.dados), P = m.pedidos, q = !c.quieto;
      if (!cfg) return falha(m, 'nao-existe', undefined, false);
      if (m.progresso.nivel < cfg.nivel) return falha(m, 'quadro-fechado', { nivel: cfg.nivel }, q);
      conferir(m);
      const i = Math.floor(c.vaga), v = P.vagas[i];
      if (!v || !v.pedido) return falha(m, 'sem-pedido', { vaga: i }, q);
      const gratis = cfg.trocaGratisAposSeg > 0 && P.trocaGratisEm <= m.agora, velhos = Object.keys(v.pedido.itens);
      const seg = gratis ? 0 : cfg.esperaVezes * esperaDaVaga(cfg, m.progresso.nivel);
      v.pedido = null; v.livreEm = m.agora + seg * 1000;
      if (gratis) P.trocaGratisEm = m.agora + cfg.trocaGratisAposSeg * 1000;
      m.eventos.emitir('trocouPedido', { vaga: i, gratis, seg });
      if (gratis) conferir(m, velhos); // o pedido novo chega na hora, e não repete o que saiu
      return { ok: true, dados: { vaga: i, gratis, seg } };
    },
  },

  salvar(m) {
    const P = m.pedidos;
    return {
      semente: P.semente >>> 0, trocaGratisEm: Math.round(P.trocaGratisEm), entregues: P.entregues, feitos: P.feitos,
      vagas: P.vagas.map((v) => ({ livreEm: Math.round(v.livreEm), pedido: v.pedido ? { cliente: v.pedido.cliente, itens: { ...v.pedido.itens }, ouro: v.pedido.ouro, xp: v.pedido.xp, desde: v.pedido.desde } : null })),
    };
  },
  carregar(m, d) {
    const P = m.pedidos, cfg = pedidosDe(m.dados), I = m.dados.itens;
    if (num(d.semente)) P.semente = d.semente >>> 0;
    P.trocaGratisEm = d.trocaGratisEm > 0 ? d.trocaGratisEm : 0;
    P.entregues = d.entregues > 0 ? Math.floor(d.entregues) : 0; P.feitos = d.feitos > 0 ? Math.floor(d.feitos) : 0;
    P.vagas = [];
    if (!cfg) return; // sem quadro nos dados, só a semente e as contas voltam
    for (const g of Array.isArray(d.vagas) ? d.vagas : []) {
      const v = { pedido: null, livreEm: obj(g) && g.livreEm > 0 ? g.livreEm : m.agora };
      const p = obj(g) && obj(g.pedido) ? g.pedido : null;
      if (p && obj(p.itens)) {
        const itens = {};
        for (const k in p.itens) if (I[k] && p.itens[k] > 0) itens[k] = Math.round(p.itens[k]);
        // pedido de item que saiu dos dados some: a vaga traz outro
        if (Object.keys(itens).length === Object.keys(p.itens).length && Object.keys(itens).length) v.pedido = { cliente: cfg.clientes.some((c) => c.id === p.cliente) ? p.cliente : cfg.clientes[0].id, itens, ouro: p.ouro > 0 ? Math.round(p.ouro) : 1, xp: p.xp > 0 ? Math.round(p.xp) : 0, desde: p.desde > 0 ? p.desde : m.agora };
        else v.livreEm = m.agora;
      }
      P.vagas.push(v);
    }
  },
});
