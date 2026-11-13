// Indústrias: toda construção pronta que tem receita em receitas.json (bancada de carpintaria, bancada de embalar,
// moinho, cozinha, laticínio) ganha uma FILA e uma SAÍDA.
//
//   mundo.industria = {
//     de: { [id da entidade]: { fila: [id da receita, ...], inicio, saida: [id da receita, ...] } },
//     dicas: { [nome]: 1 },      o que o Seu Tonho já explicou (a interface marca com o comando viuDica)
//     proxima }                  instante em que a próxima receita fica pronta (para não conferir à toa)
//
// A fila tem valorDe(m, e, 'fila') vagas (2 ao nascer; a 3ª, a 4ª e a 5ª são ampliações da construção, compradas
// com ouro ou com cash pelo comando "ampliar" da frente de construir). Os ingredientes saem do estoque na hora em que
// a receita entra na fila, estejam onde estiverem (bolsa, celeiro, cesto). A primeira da fila roda no relógio de
// verdade ("inicio" é o instante em que começou; as outras esperam). Cada receita começa no instante exato em que a
// anterior acabou, então com o jogo fechado a fila segue andando e várias terminam em ordem.
//
// Receita pronta vai para a SAÍDA e espera ser retirada: nunca se perde. A saída guarda tantas receitas prontas
// quantas são as vagas da fila; com a saída cheia, a próxima da fila não começa até o jogador retirar.
// Retirar põe o produto no estoque (colheita e produto no celeiro, se couber; material e ração na bolsa), dá a
// experiência da receita e emite "produziu". O que não cabe no celeiro continua na saída, esperando.
//
// Cancelar devolve os ingredientes (regras.industria.cancelarDevolve), tanto da receita que espera quanto da que
// está sendo feita: desta se perde só o tempo. Reordenar vale entre as que esperam.
//
// Comandos (todos agem na hora; o painel abre de qualquer lugar):
//   produzir { entidade, receita }          põe a receita na fila
//   retirar { entidade }                    tira tudo o que está pronto
//   cancelarReceita { entidade, vaga }      vaga = posição na fila (0 = a que está sendo feita)
//   reordenarFila { entidade, de, para }    muda a ordem das que esperam
//   viuDica { dica }                        o Seu Tonho já explicou isto (a interface não repete)
// (O nome "cancelar" já é da personagem; por isso "cancelarReceita" e "reordenarFila".)
// O toque: com o modo "mão" e coisa pronta, a personagem vai até a indústria e retira (ação retirarProduto);
// senão, abre o painel "industria". "Terminar agora" com cash é o concluível "fila" (alvo = a entidade).
// Eventos: enfileirou, receitaPronta, produziu { item, n, onde, receita, entidade }, retirouProduto, cancelouReceita.
import { registrarSistema, registrarAcao, registrarEvento } from '../registro.js';
import { registrarConcluivel } from '../concluir.js';
import { registrarGuia, guiaDoEvento } from '../guia.js';
import { somar } from '../util.js';
import { oQueFalta, gastarItens, darItem, espacoNoCeleiro } from './posses.js';
import { darXp, MOSTRA_LIBERADO } from './niveis.js';
import { comportamento, valorDe, proximaAmpliacao, estaPronta, construcaoPorId, faltaDaObra } from './construcao.js';
import { VENDAVEL } from './loja.js';

const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const um = (v, serve) => v === undefined || (Array.isArray(v) ? v.some(serve) : serve(v));
const primeiro = (v) => (Array.isArray(v) ? v[0] : v);

// ---------- as receitas, do jeito que a lógica usa ----------
// receitasDe(dados) → { todas: { id: receita }, porConstrucao: { construção: [receita] }, porItem: { item: [receita] } }
//   receita = { id, nome, onde, entra: { item: n }, sai: { item: n }, item (o principal que sai), n, tempoSeg, xp, nivel }
// Receita que cita construção ou item que não existe fica de fora (o validador dos dados é que reclama).
const guardado = new WeakMap();
export function receitasDe(dados) {
  let R = guardado.get(dados);
  if (R) return R;
  const bruto = dados.bruto && obj(dados.bruto.receitas) ? dados.bruto.receitas : {}, I = dados.itens, C = dados.construcoes || {};
  R = { todas: {}, porConstrucao: {}, porItem: {} };
  for (const [id, r] of Object.entries(bruto)) {
    if (!obj(r) || !C[r.onde] || !obj(r.sai) || !(r.tempoSeg > 0)) continue;
    const entra = {}, sai = {};
    let certo = true;
    for (const [k, n] of Object.entries(obj(r.entra) ? r.entra : {})) { if (!I[k] || !(n > 0)) certo = false; else entra[k] = Math.round(n); }
    for (const [k, n] of Object.entries(r.sai)) { if (!I[k] || !(n > 0)) certo = false; else sai[k] = Math.round(n); }
    const itens = Object.keys(sai);
    if (!certo || !itens.length) continue;
    const def = { id, nome: r.nome || I[itens[0]].nome, onde: r.onde, entra, sai, item: itens[0], n: sai[itens[0]], tempoSeg: r.tempoSeg, xp: r.xp > 0 ? r.xp : 0, nivel: r.nivel >= 1 ? r.nivel : 1 };
    R.todas[id] = def;
    (R.porConstrucao[def.onde] || (R.porConstrucao[def.onde] = [])).push(def);
    for (const k of itens) (R.porItem[k] || (R.porItem[k] = [])).push(def);
  }
  for (const k in R.porConstrucao) R.porConstrucao[k].sort((a, b) => a.nivel - b.nivel);
  guardado.set(dados, R);
  return R;
}
function regrasDe(m) {
  const R = m.dados.bruto && obj(m.dados.bruto.regras) && obj(m.dados.bruto.regras.industria) ? m.dados.bruto.regras.industria : {};
  return { filaInicial: R.filaInicial >= 1 ? Math.round(R.filaInicial) : 2, cancelarDevolve: R.cancelarDevolve !== false };
}

// ---------- consultas ----------
// a construção tem receita neste jogo? (sem receita, o toque nela é o da frente de construir)
export const ehIndustria = (m, e) => !!e && !!receitasDe(m.dados).porConstrucao[e.tipo];
export const receitasDaConstrucao = (m, tipo) => receitasDe(m.dados).porConstrucao[tipo] || [];
// quantas vagas a fila tem agora, e quantas receitas prontas a saída guarda (as mesmas)
export function vagasDaFila(m, e) { const v = valorDe(m, e, 'fila'); return v >= 1 ? Math.round(v) : regrasDe(m).filaInicial; }
export const limiteDaSaida = vagasDaFila;
// a vaga seguinte que se pode comprar (a ampliação da construção que aumenta a fila), ou null
export function proximaVaga(m, e) { const a = proximaAmpliacao(m, e); return a && a.fila > vagasDaFila(m, e) ? a : null; }
// o que a indústria guarda (só leitura; null = nunca foi usada)
export const estadoDaIndustria = (m, e) => (m.industria && m.industria.de[typeof e === 'string' ? e : e.id]) || null;
function estado(m, e) { const I = m.industria; return I.de[e.id] || (I.de[e.id] = { fila: [], inicio: 0, saida: [] }); }

// segundos que faltam para a primeira da fila ficar pronta (0 = nada em curso)
export function faltaDaFila(m, e) {
  const st = estadoDaIndustria(m, e), r = st && st.fila.length && st.inicio ? receitasDe(m.dados).todas[st.fila[0]] : null;
  return r ? Math.max(0, (st.inicio + r.tempoSeg * 1000 - m.agora) / 1000) : 0;
}
// fração já feita da primeira da fila (0..1)
export function andamentoDaFila(m, e) {
  const st = estadoDaIndustria(m, e), r = st && st.fila.length && st.inicio ? receitasDe(m.dados).todas[st.fila[0]] : null;
  return r ? Math.max(0, Math.min(1, (m.agora - st.inicio) / (r.tempoSeg * 1000))) : 0;
}
// para o balão em cima da construção: 'parada' | 'fazendo' | 'pronta' (pronta = há o que retirar), e o item a mostrar
const visao = { estado: 'parada', item: null, fracao: 0 };
export function visaoDaIndustria(m, e, out = visao) {
  const st = estadoDaIndustria(m, e), R = receitasDe(m.dados).todas;
  out.estado = 'parada'; out.item = null; out.fracao = 0;
  if (!st) return out;
  if (st.saida.length) { const r = R[st.saida[0]]; out.estado = 'pronta'; out.item = r ? r.item : null; return out; }
  if (st.fila.length) { const r = R[st.fila[0]]; out.estado = 'fazendo'; out.item = r ? r.item : null; out.fracao = andamentoDaFila(m, e); }
  return out;
}
// o que está pronto para retirar, somado por item: { item: n }
export function prontosNaSaida(m, e) {
  const st = estadoDaIndustria(m, e), R = receitasDe(m.dados).todas, out = {};
  if (st) for (const id of st.saida) { const r = R[id]; if (r) for (const k in r.sai) somar(out, k, r.sai[k]); }
  return out;
}
// dá para pôr esta receita na fila agora? { ok, motivo, dados }
export function podeProduzir(m, e, receita) {
  const r = receitasDe(m.dados).todas[receita];
  if (!e) return { ok: false, motivo: 'nao-existe' };
  if (!r || r.onde !== e.tipo) return { ok: false, motivo: 'receita-de-outro-lugar', dados: { receita, construcao: e.tipo } };
  if (!estaPronta(e)) return { ok: false, motivo: 'em-obra', dados: { construcao: e.tipo, seg: faltaDaObra(m, e) } };
  if (r.nivel > m.progresso.nivel) return { ok: false, motivo: 'nivel-baixo', dados: { nivel: r.nivel, receita: r.id } };
  const st = estadoDaIndustria(m, e), vagas = vagasDaFila(m, e);
  if (st && st.fila.length >= vagas) return { ok: false, motivo: 'sem-vaga-na-fila', dados: { vagas, construcao: e.tipo } };
  const f = oQueFalta(m, r.entra);
  if (f) return { ok: false, motivo: 'falta-ingrediente', dados: { ...f, receita: r.id } };
  return { ok: true };
}

// ---------- o relógio ----------
// resolve nesta indústria tudo o que o relógio já terminou, em ordem (vale igual para um passo e para horas fora)
function andar(m, e, st) {
  const R = receitasDe(m.dados).todas, limite = limiteDaSaida(m, e);
  while (st.fila.length) {
    const r = R[st.fila[0]];
    if (!r) { st.fila.shift(); st.inicio = 0; continue; } // a receita saiu dos dados
    if (!st.inicio) { if (st.saida.length >= limite) break; st.inicio = m.agora; } // a saída encheu: a fila espera
    const fim = st.inicio + r.tempoSeg * 1000;
    if (fim > m.agora) break;
    st.fila.shift(); st.saida.push(r.id);
    st.inicio = st.fila.length && st.saida.length < limite ? fim : 0; // a seguinte começa no instante em que esta acabou
    m.eventos.emitir('receitaPronta', { entidade: e.id, construcao: e.tipo, receita: r.id, item: r.item, n: r.n });
  }
}
function conferir(m) {
  const I = m.industria, R = receitasDe(m.dados).todas;
  let prox = Infinity;
  for (const id in I.de) {
    const st = I.de[id];
    if (!st.fila.length) continue;
    const e = construcaoPorId(m, id);
    if (!e || !estaPronta(e)) continue;
    andar(m, e, st);
    if (st.fila.length && st.inicio) prox = Math.min(prox, st.inicio + R[st.fila[0]].tempoSeg * 1000);
  }
  I.proxima = prox;
}

// ---------- retirar ----------
// o que vai para o celeiro (colheita e produto) só sai da indústria se couber; o resto (material, ração) sempre sai
function cabe(m, sai) {
  let n = 0;
  for (const k in sai) { const t = m.dados.itens[k].tipo; if (t === 'colheita' || t === 'produto') n += sai[k]; }
  return n <= 0 || espacoNoCeleiro(m) >= n;
}
function retirarDe(m, e) {
  const st = estadoDaIndustria(m, e), R = receitasDe(m.dados).todas;
  if (!st || !st.saida.length) return { ok: false, motivo: 'nada-pronto', dados: { construcao: e.tipo } };
  const itens = {}, ficam = [];
  let xp = 0, receitas = 0, n = 0;
  for (const id of st.saida) {
    const r = R[id];
    if (!r) continue;
    if (!cabe(m, r.sai)) { ficam.push(id); continue; }
    for (const k in r.sai) {
      darItem(m, k, r.sai[k], 'industria');
      somar(itens, k, r.sai[k]); n += r.sai[k];
      m.eventos.emitir('produziu', { item: k, n: r.sai[k], onde: e.tipo, receita: r.id, entidade: e.id });
    }
    xp += r.xp; receitas++;
  }
  st.saida = ficam;
  if (receitas) m.eventos.emitir('retirouProduto', { entidade: e.id, construcao: e.tipo, itens, n, receitas, xp });
  if (xp > 0) darXp(m, xp, 'receita');
  conferir(m); // abriu lugar na saída: a fila volta a andar
  if (!receitas) return { ok: false, motivo: 'celeiro-cheio', dados: { construcao: e.tipo } };
  return { ok: true, dados: { entidade: e.id, itens, n, receitas, sobrou: ficam.length } };
}

const falha = (m, motivo, dados, emite = true) => { if (emite) m.eventos.emitir('faltou', { motivo, dados }); return { ok: false, motivo, dados }; };
const recusa = (m, r, emite) => falha(m, r.motivo, r.dados, emite);

// ---------- a personagem retira com um toque ----------
registrarAcao({
  id: 'retirarProduto', dur: 0.9, efeitoEm: 0.5, estadoVisual: 'entregar',
  pode(m, alvo) {
    const st = estadoDaIndustria(m, alvo.entidade);
    return st && st.saida.length ? { ok: true } : { ok: false, motivo: 'nada-pronto' };
  },
  aoEfeito(m, alvo) {
    const e = construcaoPorId(m, alvo.entidade), r = e ? retirarDe(m, e) : null;
    if (r && (!r.ok || r.dados.sobrou)) m.eventos.emitir('faltou', { motivo: 'celeiro-cheio', entidade: alvo.entidade });
  },
});
const jaVaiRetirar = (m, id) => { const p = m.personagem, serve = (t) => t && t.tipo === 'agir' && t.acao === 'retirarProduto' && t.entidade === id; return !!p && (serve(p.tarefa) || p.fila.some(serve)); };

// o toque numa indústria pronta (o padrão da frente de construir continua valendo para a que está em obra)
function toque(m, e) {
  if (!ehIndustria(m, e)) return null;
  const st = estadoDaIndustria(m, e);
  if (st && st.saida.length && m.modo && m.modo.id === 'mao' && !jaVaiRetirar(m, e.id)) return { acao: 'retirarProduto', dados: { construcao: e.tipo, itens: prontosNaSaida(m, e) } };
  return { painel: 'industria', arg: { entidade: e.id }, texto: 'ver-industria', dados: { construcao: e.tipo } };
}

// ---------- eventos ----------
registrarEvento('produziu', {
  campos: ['item', 'n', 'onde', 'receita', 'entidade'],
  aceita: (dados, f) => { const R = receitasDe(dados); return um(f.item, (id) => !!R.porItem[id]) && um(f.onde, (id) => !!R.porConstrucao[id]) && um(f.receita, (id) => !!R.todas[id]); },
});
registrarEvento('enfileirou', { campos: ['entidade', 'construcao', 'receita', 'item', 'n', 'vaga'] });
registrarEvento('receitaPronta', { campos: ['entidade', 'construcao', 'receita', 'item', 'n'] });
registrarEvento('retirouProduto', { campos: ['entidade', 'construcao', 'itens', 'n', 'receitas'] });
registrarEvento('cancelouReceita', { campos: ['entidade', 'construcao', 'receita', 'vaga', 'devolveu'] });

// na tela de subida de nível aparece a receita nova, com a figura do que ela faz
MOSTRA_LIBERADO.receitas = (m, x) => {
  const r = receitasDe(m.dados).todas[x.id], it = r && m.dados.itens[r.item];
  if (!r || !it) return false;
  // o que a loja passa a vender no mesmo nível já aparece como item: não mostra duas vezes (a ração, por exemplo)
  const comoItem = MOSTRA_LIBERADO[it.tipo] || MOSTRA_LIBERADO.item;
  if (it.nivel === r.nivel && it.compra > 0 && comoItem && comoItem(m, { tipo: it.tipo, id: it.id })) return false;
  x.icone = 'icone/' + r.item;
  return true;
};

// a loja passa a vender o que as receitas e as obras gastam: material (madeira, prego...) e embalagem (cartela, garrafa, saco)
const gasta = new WeakMap();
function oQueSeGasta(dados) {
  let S = gasta.get(dados);
  if (S) return S;
  S = new Set();
  for (const r of Object.values(receitasDe(dados).todas)) for (const k in r.entra) S.add(k);
  for (const c of Object.values(dados.construcoes || {})) {
    if (c.custo) for (const k in c.custo.itens) S.add(k);
    for (const a of c.ampliacoes || []) if (a.custo) for (const k in a.custo.itens) S.add(k);
  }
  gasta.set(dados, S);
  return S;
}
if (!VENDAVEL.material) VENDAVEL.material = (m, it) => oQueSeGasta(m.dados).has(it.id);
if (!VENDAVEL.embalagem) VENDAVEL.embalagem = (m, it) => oQueSeGasta(m.dados).has(it.id);

// ---------- terminar agora com cash (o preço, o comando "concluir" e o botão são do sistema de cash) ----------
// alvo = o id da entidade (ou a própria entidade, ou { entidade: id }); conclui a receita que está sendo feita
const alvoDe = (m, alvo) => (typeof alvo === 'string' ? construcaoPorId(m, alvo) : alvo && alvo.tipo && alvo.id ? alvo : alvo && alvo.entidade ? construcaoPorId(m, alvo.entidade) : null);
registrarConcluivel({
  tipo: 'fila',
  falta(m, alvo) { const e = alvoDe(m, alvo); return e ? faltaDaFila(m, e) : 0; },
  terminar(m, alvo) {
    const e = alvoDe(m, alvo), st = e && estadoDaIndustria(m, e), r = st && st.fila.length && st.inicio ? receitasDe(m.dados).todas[st.fila[0]] : null;
    if (!r) return false;
    st.inicio = m.agora - r.tempoSeg * 1000;
    conferir(m);
    return true;
  },
  nome(m, alvo) { const e = alvoDe(m, alvo), st = e && estadoDaIndustria(m, e), r = st && st.fila.length ? receitasDe(m.dados).todas[st.fila[0]] : null; return r ? r.nome : ''; },
});

// ---------- o guia: o próximo passo de uma missão de produzir ----------
// tem a indústria? senão, é construir. Pronto na saída: tocar nela. Na fila: esperar. Tem os ingredientes: tocar nela.
// Falta ingrediente: o passo de quem o faz (colher, produzir noutra indústria, comprar na loja).
function guiaDeProduzir(m, f, out, fundo = 0) {
  const R = receitasDe(m.dados), item = primeiro(f.item), onde = primeiro(f.onde);
  const lista = f.receita && R.todas[primeiro(f.receita)] ? [R.todas[primeiro(f.receita)]] : item ? R.porItem[item] : onde ? R.porConstrucao[onde] : null;
  if (!lista || !lista.length) return null;
  const r = lista.find((x) => x.nivel <= m.progresso.nivel) || lista[0];
  const e = m.construcao.todas.find((x) => x.tipo === r.onde && x.local === m.personagem.local);
  if (!e) return guiaDoEvento(m, 'construiu', { construcao: r.onde }, out);
  if (!estaPronta(e)) { out.tipo = 'esperar'; out.seg = faltaDaObra(m, e); return out; }
  const st = estadoDaIndustria(m, e), faz = (id) => { const x = R.todas[id]; return !!x && (item ? x.sai[item] > 0 : true); };
  if (st && st.saida.some(faz)) { out.tipo = 'entidade'; out.id = e.id; return out; }
  if (st && st.fila.some(faz)) {
    if (!st.inicio) { out.tipo = 'entidade'; out.id = e.id; return out; } // a saída encheu: é retirar
    out.tipo = 'esperar'; out.seg = faltaDaFila(m, e); return out;
  }
  const falta = oQueFalta(m, r.entra);
  if (!falta || fundo > 2) { out.tipo = 'entidade'; out.id = e.id; return out; }
  return guiaDoItem(m, falta.item, out, fundo + 1) || ((out.tipo = 'entidade'), (out.id = e.id), out);
}
// o passo para conseguir um item: colher (cultura), produzir (receita) ou comprar (loja). null = não sei
export function guiaDoItem(m, item, out, fundo = 0) {
  const D = m.dados, it = D.itens[item];
  if (!it) return null;
  for (const c of Object.values(D.culturas)) if (c.produto === item) return guiaDoEvento(m, 'colheu', { item }, out);
  if (receitasDe(D).porItem[item]) return guiaDeProduzir(m, { item }, out, fundo);
  if (it.compra > 0 && D.loja.ouro.includes(item)) { out.tipo = 'painel'; out.painel = 'loja'; out.item = item; return out; }
  return null;
}
registrarGuia('produziu', (m, f, out) => guiaDeProduzir(m, f, out));

// ---------- o sistema ----------
registrarSistema({
  id: 'industria',
  iniciar(m) {
    m.industria = { de: {}, dicas: {}, proxima: Infinity };
    // toda construção que tem receita passa a responder ao toque por aqui
    for (const id in receitasDe(m.dados).porConstrucao) comportamento(id, { acaoPossivel: toque });
  },
  passo(m) { if (m.agora >= m.industria.proxima) conferir(m); },
  ausencia: conferir,

  comandos: {
    produzir(m, c) {
      const e = construcaoPorId(m, c.entidade), q = !c.quieto;
      if (!e) return falha(m, 'nao-existe', undefined, false);
      conferir(m);
      const p = podeProduzir(m, e, c.receita);
      if (!p.ok) return recusa(m, p, q);
      const r = receitasDe(m.dados).todas[c.receita], st = estado(m, e);
      gastarItens(m, r.entra);
      st.fila.push(r.id);
      conferir(m); // se é a primeira, começa agora
      m.eventos.emitir('enfileirou', { entidade: e.id, construcao: e.tipo, receita: r.id, item: r.item, n: r.n, vaga: st.fila.length - 1 });
      return { ok: true, dados: { entidade: e.id, receita: r.id, vaga: st.fila.length - 1 } };
    },

    retirar(m, c) {
      const e = construcaoPorId(m, c.entidade);
      if (!e) return falha(m, 'nao-existe', undefined, false);
      conferir(m);
      const r = retirarDe(m, e);
      if (!r.ok) return recusa(m, r, !c.quieto);
      if (r.dados.sobrou && !c.quieto) m.eventos.emitir('faltou', { motivo: 'celeiro-cheio', entidade: e.id });
      return r;
    },

    cancelarReceita(m, c) {
      const e = construcaoPorId(m, c.entidade);
      if (!e) return falha(m, 'nao-existe', undefined, false);
      conferir(m);
      const st = estadoDaIndustria(m, e), i = Math.floor(c.vaga);
      if (!st || !(i >= 0 && i < st.fila.length)) return falha(m, 'vaga-vazia', undefined, !c.quieto);
      const r = receitasDe(m.dados).todas[st.fila[i]], devolve = regrasDe(m).cancelarDevolve && !!r;
      st.fila.splice(i, 1);
      if (i === 0) st.inicio = 0; // a que estava sendo feita saiu: a seguinte começa do zero, agora
      if (devolve) for (const k in r.entra) darItem(m, k, r.entra[k], 'cancelou');
      conferir(m);
      m.eventos.emitir('cancelouReceita', { entidade: e.id, construcao: e.tipo, receita: r ? r.id : null, item: r ? r.item : null, vaga: i, devolveu: devolve });
      return { ok: true, dados: { entidade: e.id, receita: r ? r.id : null, devolveu: devolve } };
    },

    reordenarFila(m, c) {
      const e = construcaoPorId(m, c.entidade);
      if (!e) return falha(m, 'nao-existe', undefined, false);
      conferir(m);
      const st = estadoDaIndustria(m, e), de = Math.floor(c.de), para = Math.floor(c.para), piso = st && st.inicio ? 1 : 0; // a que está sendo feita não muda de lugar
      if (!st || !(de >= piso && de < st.fila.length) || !(para >= piso && para < st.fila.length)) return falha(m, 'vaga-vazia', undefined, !c.quieto);
      if (de !== para) { const [x] = st.fila.splice(de, 1); st.fila.splice(para, 0, x); }
      m.eventos.emitir('reordenouFila', { entidade: e.id, de, para });
      return { ok: true, dados: { entidade: e.id } };
    },

    viuDica(m, c) { if (typeof c.dica === 'string' && c.dica) m.industria.dicas[c.dica] = 1; return { ok: true }; },
  },

  salvar(m) {
    const de = {};
    for (const id in m.industria.de) { const st = m.industria.de[id]; if (st.fila.length || st.saida.length) de[id] = { fila: [...st.fila], inicio: Math.round(st.inicio), saida: [...st.saida] }; }
    return { de, dicas: { ...m.industria.dicas } };
  },
  // a fila só volta para a construção que ainda existe e para a receita que ainda é dela; o relógio (instantes
  // absolutos) resolve sozinho o que acabou enquanto o jogo estava fechado
  carregar(m, d) {
    const I = m.industria, R = receitasDe(m.dados).todas;
    I.de = {}; I.dicas = {};
    for (const k in obj(d.dicas) ? d.dicas : {}) if (d.dicas[k]) I.dicas[k] = 1;
    for (const id in obj(d.de) ? d.de : {}) {
      const g = d.de[id], e = construcaoPorId(m, id);
      if (!obj(g) || !e) continue;
      const serve = (rid) => !!R[rid] && R[rid].onde === e.tipo;
      const fila = (Array.isArray(g.fila) ? g.fila : []).filter(serve), saida = (Array.isArray(g.saida) ? g.saida : []).filter(serve);
      // se a primeira da fila gravada não serve mais, a que ficou em primeiro começa do zero
      const inicio = fila.length && Array.isArray(g.fila) && g.fila[0] === fila[0] && g.inicio > 0 ? Math.min(g.inicio, m.agora) : 0;
      if (fila.length || saida.length) I.de[id] = { fila, inicio, saida };
    }
    I.proxima = 0; // a primeira conferência resolve o que ficou pronto com o jogo fechado
  },
});
