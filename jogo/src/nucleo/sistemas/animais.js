// Animais: a base comum das três famílias (produção, trabalho, estimação). Aqui ficam o que todo bicho tem
// (a lista, a compra, a vaga no abrigo, o relógio de comer e beber) e o abrigo genérico (cocho e bebedouro).
// O que cada família faz a mais entra por registrarFamilia(), no arquivo dela (producao.js é a de produção).
// O contrato inteiro está em docs/jogo/ARQUITETURA.md, seção "Animais".
//
//   mundo.animais = {
//     lista: [{ id, especie, familia, abrigo (id da ENTIDADE da construção, ou null), tratado, cicloDesde,
//               pronto, produzidos, ...o que a família guardar }],
//     abrigos: { [id da entidade]: { cocho, bebedouro } },     porções de comida e de água que há agora
//     seq, versao, proximo, entregues,
//     vistos: [chave] }                                        o que o vizinho já explicou (a primeira vez de cada mecânica)
//
// O relógio: bicho com "cicloSeg" e com abrigo vive em ciclos. No começo de cada ciclo ele come ("come") e bebe
// ("bebe") do cocho e do bebedouro do seu abrigo; se faltou um dos dois, não consome nada e o ciclo fica "sem trato"
// (tratado = false). Se o jogador abastece no meio de um ciclo sem trato, o bicho come na hora e o ciclo passa a
// valer como tratado. Os ciclos se resolvem em ordem de relógio (instantes exatos, não o momento em que a conta é
// feita), então dá o mesmo resultado com o jogo aberto ou depois de horas fechado. Nenhum bicho morre nem foge.
import { registrarSistema, registrarAcao, registrarEvento, ampliarEvento } from '../registro.js';
import { gastarOuro, quantoTem, gastarItens, ferramentaNoCinto, ferramentaNoSuporte } from './posses.js';
import { MOSTRA_LIBERADO } from './niveis.js';
import { JA_COMPROU, VENDAVEL } from './loja.js';
import { comportamento, COMPORTAMENTOS, construcaoPorId, estaPronta, valorDe } from './construcao.js';
import { ENTREGAS, animaisEspeciais } from './cash.js';
import { registrarGuia, guiaDoEvento } from '../guia.js';

const NAO = (motivo, dados, limpar) => ({ ok: false, motivo, dados, limpar });
const SIM = { ok: true };
const um = (v, serve) => v === undefined || (Array.isArray(v) ? v.some(serve) : serve(v));

// ---------- famílias ----------
// registrarFamilia(familia, {
//   podeComprar(m, def) → { ok, motivo, dados }   o que a família confere além do nível, do abrigo e do preço
//   aoChegar(m, animal)                           o bicho acabou de entrar na fazenda (compra, presente, cash)
//   aoCarregar(m, animal)                         o bicho voltou de uma gravação (confira os campos da família)
//   aoSair(m, animal)                             o bicho saiu (vendido, por exemplo)
//   aoCiclo(m, animal, tratado, quando) → false   um ciclo acabou no instante "quando" (ms); "tratado" diz se ele comeu
//                                                 e bebeu naquele ciclo. Devolver false PARA o relógio do bicho (ele não
//                                                 come mais) até alguém chamar comecarCiclo(); qualquer outra resposta segue
//   toqueNoAbrigo(m, e) → resposta | null         o que o toque no abrigo faz (como o acaoPossivel de um tipo); null = não é comigo
// })
// Tudo é opcional. Sem família registrada, a compra daquela família responde "ainda-nao".
export const FAMILIAS = {};
export function registrarFamilia(familia, f = {}) {
  if (!familia) throw new Error('família sem nome');
  if (FAMILIAS[familia] && FAMILIAS[familia] !== f) throw new Error(`família "${familia}" registrada duas vezes`);
  FAMILIAS[familia] = f;
  return f;
}
const gancho = (familia, nome) => { const f = FAMILIAS[familia]; return f && f[nome] ? f[nome] : null; };

// ---------- consultas ----------
export const defDoAnimal = (m, a) => m.dados.animais[typeof a === 'string' ? a : a.especie] || null;
export const animalPorId = (m, id) => m.animais.lista.find((a) => a.id === id) || null;
// os bichos que passam no filtro { familia, especie, abrigo (id da entidade) }; sem filtro, todos
export function animaisDe(m, f = {}) {
  const out = [];
  for (const a of m.animais.lista) if ((f.familia === undefined || a.familia === f.familia) && (f.especie === undefined || a.especie === f.especie) && (f.abrigo === undefined || a.abrigo === f.abrigo)) out.push(a);
  return out;
}
export function quantosNoAbrigo(m, idDaEntidade) { let n = 0; for (const a of m.animais.lista) if (a.abrigo === idDaEntidade) n++; return n; }
// a entidade da construção onde o bicho mora (ou null)
export const abrigoDe = (m, a) => (a && a.abrigo ? construcaoPorId(m, a.abrigo) : null);
const ehAbrigo = (m, e) => !!e && !!m.dados.construcoes[e.tipo] && m.dados.construcoes[e.tipo].tipo === 'abrigo';
// os abrigos PRONTOS de um tipo (id de construcoes.json); sem tipo, todos
export function abrigosProntos(m, tipo) {
  const out = [];
  for (const e of m.construcao.todas) if (ehAbrigo(m, e) && estaPronta(e) && (tipo === undefined || e.tipo === tipo)) out.push(e);
  return out;
}
export const vagasDoAbrigo = (m, e) => Math.max(0, Math.round(valorDe(m, e, 'vagas') || 0));
// quantas vagas livres há nos abrigos prontos de um tipo
export function vagasLivres(m, tipo) { let n = 0; for (const e of abrigosProntos(m, tipo)) n += Math.max(0, vagasDoAbrigo(m, e) - quantosNoAbrigo(m, e.id)); return n; }
// o primeiro abrigo pronto do tipo com vaga, ou null
export function abrigoComVaga(m, tipo) { for (const e of abrigosProntos(m, tipo)) if (quantosNoAbrigo(m, e.id) < vagasDoAbrigo(m, e)) return e; return null; }

// o cocho e o bebedouro de um abrigo: o estado nasce quando a obra fica pronta (aoPronta)
function estadoDe(m, idDaEntidade) { return m.animais.abrigos[idDaEntidade] || null; }
function criarEstado(m, e) { return m.animais.abrigos[e.id] || (m.animais.abrigos[e.id] = { cocho: 0, bebedouro: 0 }); }
const idDe = (e) => (typeof e === 'string' ? e : e ? e.id : null);
export const capacidadeDoCocho = (m, e) => Math.max(0, Math.round(valorDe(m, e, 'cocho') || 0));
export const capacidadeDoBebedouro = (m, e) => Math.max(0, Math.round(valorDe(m, e, 'bebedouro') || 0));
// porções de comida e de água que há agora (aceitam a entidade ou o id dela)
export const nivelDoCocho = (m, e) => { const s = estadoDe(m, idDe(e)); return s ? s.cocho : 0; };
export const nivelDoBebedouro = (m, e) => { const s = estadoDe(m, idDe(e)); return s ? s.bebedouro : 0; };
// o item que enche o cocho deste abrigo (milho no galinheiro, ração nos outros), ou null
export const comidaDoAbrigo = (m, e) => m.dados.comidaDoAbrigo[typeof e === 'string' ? e : e.tipo] || null;
// o bicho comeu e bebeu no ciclo em que está? (bicho sem ciclo ou sem abrigo não depende de trato)
export function estaTratado(m, a) {
  const d = defDoAnimal(m, a);
  return !d || !(d.cicloSeg > 0) || !a.abrigo ? true : !!a.tratado;
}
// o relógio do bicho: { rodando, fracao (0..1 do ciclo), falta (segundos até o fim do ciclo) }
export function cicloDoAnimal(m, a, out = {}) {
  const d = defDoAnimal(m, a), dur = d ? d.cicloSeg * 1000 : 0;
  out.rodando = dur > 0 && a.cicloDesde > 0;
  out.fracao = out.rodando ? Math.max(0, Math.min(1, (m.agora - a.cicloDesde) / dur)) : 0;
  out.falta = out.rodando ? Math.max(0, (a.cicloDesde + dur - m.agora) / 1000) : 0;
  return out;
}
// tudo o que o painel do abrigo mostra de cocho, bebedouro e vagas, de uma vez
export function estadoDoAbrigo(m, e) {
  const item = comidaDoAbrigo(m, e);
  return {
    vagas: vagasDoAbrigo(m, e), ocupadas: quantosNoAbrigo(m, e.id),
    cocho: { nivel: nivelDoCocho(m, e), capacidade: capacidadeDoCocho(m, e), item, tem: item ? quantoTem(m, item) : 0 },
    bebedouro: { nivel: nivelDoBebedouro(m, e), capacidade: capacidadeDoBebedouro(m, e), porRega: m.dados.trato.aguasPorRega },
  };
}
// os bichos deste abrigo que estão num ciclo sem trato (com fome ou com sede)
export function famintosDe(m, idDaEntidade) { let n = 0; for (const a of m.animais.lista) if (a.abrigo === idDaEntidade && a.cicloDesde > 0 && !a.tratado) n++; return n; }
// falta comida (ou água) para o próximo bicho deste abrigo comer? { comida, agua }
export function faltaNoAbrigo(m, e, out = {}) {
  const s = estadoDe(m, e.id);
  let come = 0, bebe = 0;
  for (const a of m.animais.lista) { if (a.abrigo !== e.id) continue; const d = defDoAnimal(m, a); if (d && d.cicloSeg > 0) { come = Math.max(come, d.porcoes); bebe = Math.max(bebe, d.bebe); } }
  out.comida = come > 0 && (!s || s.cocho < come);
  out.agua = bebe > 0 && (!s || s.bebedouro < bebe);
  return out;
}

// ---------- o relógio: comer, beber e os ciclos ----------
// o bicho come e bebe agora, se houver os dois; devolve true se comeu
function comer(m, a) {
  const d = defDoAnimal(m, a), s = estadoDe(m, a.abrigo);
  if (!d) return false;
  if (!(d.porcoes > 0) && !(d.bebe > 0)) return true; // não come nem bebe: está sempre tratado
  if (!s || s.cocho < d.porcoes || s.bebedouro < d.bebe) return false;
  s.cocho -= d.porcoes; s.bebedouro -= d.bebe;
  return true;
}
// começa um ciclo do bicho no instante "desde" (ms): é aí que ele come e bebe
export function comecarCiclo(m, a, desde = m.agora) {
  const d = defDoAnimal(m, a);
  m.animais.proximo = 0;
  if (!d || !(d.cicloSeg > 0) || !a.abrigo) { a.cicloDesde = 0; a.tratado = true; return; }
  a.cicloDesde = Math.max(1, desde);
  a.tratado = comer(m, a);
}
// para o relógio do bicho (ele não come mais) até comecarCiclo()
export function pararCiclo(m, a) { a.cicloDesde = 0; m.animais.proximo = 0; }
const fimDoCiclo = (m, a) => { const d = defDoAnimal(m, a); return d && d.cicloSeg > 0 && a.cicloDesde > 0 && a.abrigo ? a.cicloDesde + d.cicloSeg * 1000 : Infinity; };

// Põe todos os bichos em dia com o relógio: encerra, em ordem de instante, cada ciclo que já acabou (no empate,
// vale a ordem da lista) e começa o seguinte no mesmo instante. É o que roda a cada segundo e na volta de uma ausência.
export function resolver(m) {
  const A = m.animais, L = A.lista;
  if (m.agora < A.proximo) return;
  for (let guarda = 0; guarda < 500000; guarda++) {
    let quem = null, quando = Infinity;
    for (let k = 0; k < L.length; k++) { const f = fimDoCiclo(m, L[k]); if (f <= m.agora && f < quando) { quando = f; quem = L[k]; } }
    if (!quem) break;
    const tratado = quem.tratado, f = gancho(quem.familia, 'aoCiclo');
    quem.cicloDesde = 0;
    if (!f || f(m, quem, tratado, quando) !== false) comecarCiclo(m, quem, quando);
  }
  let prox = Infinity;
  for (let k = 0; k < L.length; k++) { const f = fimDoCiclo(m, L[k]); if (f < prox) prox = f; }
  A.proximo = prox;
}
// chegou comida ou água: quem estava num ciclo sem trato come agora, na ordem da lista
function alimentarFamintos(m, idDaEntidade) {
  let n = 0;
  for (const a of m.animais.lista) if (a.abrigo === idDaEntidade && a.cicloDesde > 0 && !a.tratado && comer(m, a)) { a.tratado = true; n++; }
  return n;
}

// ---------- pôr e tirar ----------
// Põe um bicho na fazenda sem conferir nem cobrar (testes, presentes, entrega do cash). opc = { abrigo (id da
// entidade; padrão: o primeiro abrigo pronto do tipo com vaga), quieto (sem evento), ...campos a mais do bicho }.
// Devolve o bicho.
export function porAnimal(m, especie, opc = {}) {
  const d = m.dados.animais[especie], A = m.animais;
  if (!d) throw new Error(`animal desconhecido: "${especie}"`);
  const { abrigo: pedido, quieto, ...mais } = opc;
  const e = d.abrigo ? (pedido ? construcaoPorId(m, pedido) : abrigoComVaga(m, d.abrigo)) : null;
  let id;
  do { id = `${especie}-${++A.seq}`; } while (animalPorId(m, id));
  const a = { id, especie, familia: d.familia, abrigo: e ? e.id : null, tratado: true, cicloDesde: 0, pronto: 0, produzidos: 0, ...mais };
  if (e) criarEstado(m, e);
  A.lista.push(a); A.versao++;
  if (d.especial && !A.entregues.includes(especie)) A.entregues.push(especie);
  comecarCiclo(m, a);
  const f = gancho(a.familia, 'aoChegar');
  if (f) f(m, a);
  if (!quieto) m.eventos.emitir('animalChegou', { id: a.id, animal: especie, familia: a.familia, abrigo: e ? e.tipo : null, entidade: a.abrigo });
  return a;
}
// tira o bicho da fazenda (a vaga fica livre); devolve o bicho, ou null
export function tirarAnimal(m, id) {
  const A = m.animais, i = A.lista.findIndex((a) => a.id === id);
  if (i < 0) return null;
  const a = A.lista.splice(i, 1)[0];
  A.versao++; A.proximo = 0;
  const f = gancho(a.familia, 'aoSair');
  if (f) f(m, a);
  m.eventos.emitir('animalSaiu', { id: a.id, animal: a.especie, familia: a.familia, entidade: a.abrigo });
  return a;
}

// ---------- comprar ----------
// O jogador pode comprar (ou receber) este animal agora? opc.semPreco = não olha o ouro (entrega do cash, presente).
// Motivos, na ordem: nao-existe { animal }, so-com-cash { cash, animal } (só quando se olha o preço),
// nivel-baixo { nivel, animal }, ainda-nao { familia, animal } (ninguém registrou a família),
// sem-abrigo { abrigo, animal }, abrigo-cheio { abrigo, vagas, animal }, o que a família disser, sem-ouro { falta, animal }.
export function podeComprarAnimal(m, id, opc = {}) {
  const d = m.dados.animais[id];
  if (!d) return NAO('nao-existe', { animal: id });
  if (!opc.semPreco && d.preco.cash > 0) return NAO('so-com-cash', { cash: d.preco.cash, animal: id });
  if (!opc.semPreco && !(d.preco.ouro > 0)) return NAO('nao-vende', { animal: id });
  if (d.nivel > m.progresso.nivel) return NAO('nivel-baixo', { nivel: d.nivel, animal: id });
  const F = FAMILIAS[d.familia];
  if (!F) return NAO('ainda-nao', { familia: d.familia, animal: id });
  if (d.abrigo) {
    const prontos = abrigosProntos(m, d.abrigo);
    if (!prontos.length) return NAO('sem-abrigo', { abrigo: d.abrigo, animal: id });
    if (!abrigoComVaga(m, d.abrigo)) return NAO('abrigo-cheio', { abrigo: d.abrigo, vagas: prontos.reduce((s, e) => s + vagasDoAbrigo(m, e), 0), animal: id });
  }
  if (F.podeComprar) { const r = F.podeComprar(m, d); if (r && !r.ok) return { ok: false, motivo: r.motivo, dados: { animal: id, ...(r.dados || {}) } }; }
  if (!opc.semPreco && m.posses.ouro < d.preco.ouro) return NAO('sem-ouro', { falta: d.preco.ouro - m.posses.ouro, animal: id });
  return SIM;
}
// para a aba "Animais" da loja: os bichos que se compram com ouro e cuja família já existe no jogo, por nível e preço
//   [{ animal, nome, familia, abrigo, preco, nivel, liberado, tem (quantos o jogador tem), pode: { ok, motivo, dados } }]
export function ofertasDeAnimais(m) {
  const out = [];
  for (const d of Object.values(m.dados.animais)) {
    if (!(d.preco.ouro > 0) || !FAMILIAS[d.familia]) continue;
    out.push({ animal: d.id, nome: d.nome, familia: d.familia, abrigo: d.abrigo, preco: d.preco.ouro, nivel: d.nivel, liberado: d.nivel <= m.progresso.nivel, tem: animaisDe(m, { especie: d.id }).length, pode: podeComprarAnimal(m, d.id) });
  }
  return out.sort((a, b) => a.nivel - b.nivel || a.preco - b.preco);
}

// ---------- entrega dos animais comprados com cash (cash.js cobra e guarda a posse; aqui o bicho ganha vida) ----------
ENTREGAS.animal = {
  // as mesmas conferências da compra, sem o preço. Família que ainda não existe no jogo: a compra vale (a posse fica
  // guardada em cash.js) e o bicho aparece sozinho quando a família existir e houver lugar (entregarPendentes)
  pode(m, id) {
    const d = m.dados.animais[id];
    if (d && d.nivel <= m.progresso.nivel && !FAMILIAS[d.familia]) return SIM;
    return podeComprarAnimal(m, id, { semPreco: true });
  },
  entregar(m, id) { const d = m.dados.animais[id]; if (d && FAMILIAS[d.familia] && !m.animais.entregues.includes(id)) porAnimal(m, id); },
};
// o que foi pago com cash e ainda não está na fazenda (a família não existia, ou a gravação é de antes dela)
function entregarPendentes(m) {
  const esp = animaisEspeciais(m), A = m.animais;
  for (let k = 0; k < esp.length; k++) {
    const id = esp[k];
    if (A.entregues.includes(id) || !m.dados.animais[id] || !podeComprarAnimal(m, id, { semPreco: true }).ok) continue;
    porAnimal(m, id);
  }
}
// bicho que ficou sem abrigo (a construção saiu do lugar gravado, por exemplo) volta para o primeiro com vaga
function realojar(m) {
  for (const a of m.animais.lista) {
    const d = defDoAnimal(m, a);
    if (!d || !d.abrigo || (a.abrigo && estadoDe(m, a.abrigo))) continue;
    const e = abrigoComVaga(m, d.abrigo);
    a.abrigo = e ? e.id : null;
    if (e) { criarEstado(m, e); comecarCiclo(m, a); m.animais.versao++; }
  }
}
function conferir(m) { realojar(m); entregarPendentes(m); resolver(m); }

// ---------- o abrigo genérico: toda construção de tipo "abrigo" ganha cocho e bebedouro ----------
const tocar = (m, e) => {
  for (const k in FAMILIAS) { const f = FAMILIAS[k].toqueNoAbrigo, r = f ? f(m, e) : null; if (r) return r; }
  return { painel: 'abrigo', arg: { entidade: e.id }, texto: 'ver-abrigo', dados: { construcao: e.tipo, n: quantosNoAbrigo(m, e.id), vagas: vagasDoAbrigo(m, e) } };
};
const DO_ABRIGO = {
  acaoPossivel: tocar,
  aoPronta(m, e) { criarEstado(m, e); m.animais.proximo = 0; },
  // a ampliação aumenta vagas, cocho e bebedouro (valorDe já devolve os números novos; o que havia continua lá)
  aoAmpliar(m, e) { m.animais.versao++; m.eventos.emitir('abrigoMudou', { entidade: e.id, construcao: e.tipo }); },
  // os bichos são do abrigo, não do lugar: mudou de lugar, vão junto
  aoMover(m, e) { m.animais.versao++; m.eventos.emitir('abrigoMudou', { entidade: e.id, construcao: e.tipo }); },
  podeTirar(m, e) { const n = quantosNoAbrigo(m, e.id); return n ? NAO('abrigo-com-bicho', { n, construcao: e.tipo }) : SIM; },
  aoTirar(m, e) { delete m.animais.abrigos[e.id]; m.animais.versao++; },
};
// Se outra frente já deu comportamento a um abrigo (comportamento('estabulo', {...}) no arquivo dela), os dois valem:
// o toque dela responde primeiro (e o daqui só se ela devolver null), os avisos correm os dois (o daqui antes) e
// guardar só pode se os dois deixarem. O jeito recomendado de responder ao toque continua sendo toqueNoAbrigo.
for (const k in DO_ABRIGO) DO_ABRIGO[k].daBase = true;
const JUNTA = {
  acaoPossivel: (meu, dela) => (m, e) => dela(m, e) || meu(m, e),
  podeTirar: (meu, dela) => (m, e) => { const r = meu(m, e); return r.ok ? dela(m, e) || r : r; },
};
const emSerie = (meu, dela) => (m, e, x) => { meu(m, e, x); dela(m, e, x); };
function darVidaAoAbrigo(id) {
  const c = COMPORTAMENTOS[id] || {}, novo = {};
  for (const k in DO_ABRIGO) {
    const dela = c[k];
    if (dela && dela.daBase) continue; // já está no lugar
    novo[k] = dela ? (JUNTA[k] || emSerie)(DO_ABRIGO[k], dela) : DO_ABRIGO[k];
    novo[k].daBase = true;
  }
  comportamento(id, novo);
}

// ---------- abastecer: ações da personagem ----------
const abrigoDoAlvo = (m, alvo) => { const e = m.local.porId[alvo.entidade]; return ehAbrigo(m, e) && estaPronta(e) ? e : null; };
// motivos: nao-existe, cocho-cheio, sem-comida { item, abrigo }
export function podeEncherCocho(m, e) {
  if (!e || !ehAbrigo(m, e) || !estaPronta(e)) return NAO('nao-existe');
  const item = comidaDoAbrigo(m, e), cap = capacidadeDoCocho(m, e);
  if (!item || !(cap > 0)) return NAO('sem-cocho', { construcao: e.tipo });
  if (nivelDoCocho(m, e) >= cap) return NAO('cocho-cheio', { construcao: e.tipo });
  if (!(quantoTem(m, item) > 0)) return NAO('sem-comida', { item, abrigo: e.tipo }, true);
  return SIM;
}
// motivos: nao-existe, bebedouro-cheio, sem-ferramenta { funcao: 'regador' }, regador-vazio (só se não houver poço para ir encher)
export function podeEncherBebedouro(m, e) {
  if (!e || !ehAbrigo(m, e) || !estaPronta(e)) return NAO('nao-existe');
  const cap = capacidadeDoBebedouro(m, e);
  if (!(cap > 0)) return NAO('sem-bebedouro', { construcao: e.tipo });
  if (nivelDoBebedouro(m, e) >= cap) return NAO('bebedouro-cheio', { construcao: e.tipo });
  if (!ferramentaNoCinto(m, 'regador') && !ferramentaNoSuporte(m, 'regador')) return NAO('sem-ferramenta', { funcao: 'regador' }, true);
  return SIM;
}
// quantas regas faltam para encher o bebedouro
export const regasParaEncher = (m, e) => Math.ceil(Math.max(0, capacidadeDoBebedouro(m, e) - nivelDoBebedouro(m, e)) / m.dados.trato.aguasPorRega);
const pocoDe = (m, loc) => loc.entidades.find((e) => e.tipo === 'poco') || null;
const naFila = (m, acao, entidade) => { const p = m.personagem, s = (t) => t && t.tipo === 'agir' && t.acao === acao && t.entidade === entidade; return s(p.tarefa) || p.fila.some(s); };

registrarAcao({
  id: 'abastecerCocho', dur: 1.2, efeitoEm: 0.75, estadoVisual: 'alimentar',
  pode: (m, alvo) => podeEncherCocho(m, abrigoDoAlvo(m, alvo)),
  aoEfeito(m, alvo) {
    const e = abrigoDoAlvo(m, alvo), s = criarEstado(m, e), item = comidaDoAbrigo(m, e);
    resolver(m);
    // enche; quem estava com fome come na hora; e completa de novo, para o cocho ficar cheio de verdade
    let posto = 0;
    for (let vez = 0; vez < 2; vez++) {
      const n = Math.min(capacidadeDoCocho(m, e) - s.cocho, quantoTem(m, item));
      if (n > 0) { gastarItens(m, { [item]: n }); s.cocho += n; posto += n; }
      if (!alimentarFamintos(m, e.id)) break;
    }
    m.animais.proximo = 0;
    m.eventos.emitir('tratou', { abrigo: e.tipo, parte: 'cocho', n: 1, item, porcoes: posto, entidade: e.id });
  },
});
registrarAcao({
  id: 'abastecerBebedouro', ferramenta: 'regador', dur: 1.2, efeitoEm: 0.75, estadoVisual: 'regar',
  pode(m, alvo) {
    const e = abrigoDoAlvo(m, alvo), r = podeEncherBebedouro(m, e);
    if (!r.ok) return r;
    const reg = ferramentaNoCinto(m, 'regador');
    if (reg && !(m.posses.ferramentas[reg].agua > 0)) return NAO('regador-vazio', null, true);
    return SIM;
  },
  aoEfeito(m, alvo) {
    const e = abrigoDoAlvo(m, alvo), s = criarEstado(m, e), reg = m.posses.ferramentas[ferramentaNoCinto(m, 'regador')];
    resolver(m);
    // despeja o que falta (ou o que há no regador); quem estava com sede bebe, e come, na hora
    const cap = capacidadeDoBebedouro(m, e), regas = Math.min(reg.agua, regasParaEncher(m, e)), antes = s.bebedouro;
    reg.agua -= regas;
    s.bebedouro = Math.min(cap, s.bebedouro + regas * m.dados.trato.aguasPorRega);
    const posto = s.bebedouro - antes, faltou = s.bebedouro < cap;
    alimentarFamintos(m, e.id);
    m.animais.proximo = 0;
    m.eventos.emitir('tratou', { abrigo: e.tipo, parte: 'bebedouro', n: 1, regas, porcoes: posto, agua: reg.agua, entidade: e.id });
    // a água acabou antes de encher: ela mesma vai ao poço e volta (custa tempo, não toques)
    const poco = pocoDe(m, m.local);
    if (faltou && reg.agua <= 0 && poco && !m.personagem.fila.some((t) => t.tipo === 'agir' && t.acao === 'abastecerBebedouro' && t.entidade === e.id)) m.personagem.fila.unshift({ tipo: 'agir', acao: 'encher', entidade: poco.id, args: null, auto: true }, { tipo: 'agir', acao: 'abastecerBebedouro', entidade: e.id, args: null, auto: true });
  },
});

// ---------- eventos que missões e conquistas escutam ----------
registrarEvento('tratou', { campos: ['abrigo', 'parte', 'n', 'entidade'], aceita: (dados, f) => um(f.abrigo, (id) => !!dados.construcoes[id] && dados.construcoes[id].tipo === 'abrigo') && um(f.parte, (p) => p === 'cocho' || p === 'bebedouro') });
// o "comprou" da loja passa a levar o animal e a família (missões "galinhas", "companheiro", "jumento"; conquista "criador")
ampliarEvento('comprou', {
  campos: ['animal', 'familia'],
  aceita(dados, f) {
    if (f.animal === undefined && f.familia === undefined && f.classe !== 'animal') return undefined;
    return Object.values(dados.animais).some((a) => a.preco.ouro > 0 && !!FAMILIAS[a.familia] && um(f.animal, (id) => id === a.id) && um(f.familia, (x) => x === a.familia));
  },
});
JA_COMPROU.animal = (m, id, n) => animaisDe(m, { especie: id }).length >= (n || 1);
JA_COMPROU.familia = (m, familia, n) => animaisDe(m, { familia }).length >= (n || 1);
// na tela de subida de nível aparece o bicho que já dá para comprar com ouro
MOSTRA_LIBERADO.animais = (m, x) => { const d = m.dados.animais[x.id]; return !!d && d.preco.ouro > 0 && !!FAMILIAS[d.familia]; };
// a loja vende a ração se algum bicho do jogo come ração
VENDAVEL.racao = (m, it) => Object.values(m.dados.animais).some((a) => a.comida === it.id);

// ---------- o guia das missões (a seta do tutorial e o jogador automático): comprar bicho e tratar ----------
const primeiro = (v) => (Array.isArray(v) ? v[0] : v);
const paraEntidade = (out, id) => { out.tipo = 'entidade'; out.id = id; return out; };
const aqui = (m, e) => e.local === m.personagem.local;
// o vizinho já explicou esta mecânica? (a chave é de quem pergunta: 'cocho', 'recolher:ovo', 'fim'...)
export const jaViuDica = (m, dica) => m.animais.vistos.includes(dica);
// comprar um bicho: sem abrigo pronto, o passo é construir o abrigo; com abrigo, é tocar nele (o painel vende o bicho
// e, se estiver cheio, oferece a ampliação). Bicho sem abrigo se compra na aba "Animais" da loja.
registrarGuia('comprou', (m, f, out) => {
  const d = m.dados.animais[primeiro(f.animal)];
  if (!d || !FAMILIAS[d.familia] || !(d.preco.ouro > 0)) return null;
  if (!d.abrigo) { out.tipo = 'painel'; out.painel = 'animais'; out.item = d.id; return out; }
  const e = abrigoComVaga(m, d.abrigo) || abrigosProntos(m, d.abrigo)[0];
  if (!e) return guiaDoEvento(m, 'construiu', { construcao: d.abrigo }, out);
  return aqui(m, e) ? paraEntidade(out, e.id) : null;
});
// tratar: o abrigo que tem cocho ou bebedouro para encher; faltando a comida, o passo é consegui-la
registrarGuia('tratou', (m, f, out) => {
  const tipo = primeiro(f.abrigo), parte = primeiro(f.parte), lista = abrigosProntos(m, tipo).filter((e) => aqui(m, e));
  if (!lista.length) return tipo ? guiaDoEvento(m, 'construiu', { construcao: tipo }, out) : null;
  for (const e of lista) if ((parte !== 'bebedouro' && podeEncherCocho(m, e).ok) || (parte !== 'cocho' && podeEncherBebedouro(m, e).ok)) return paraEntidade(out, e.id);
  for (const e of lista) {
    const r = parte === 'bebedouro' ? SIM : podeEncherCocho(m, e);
    if (r.motivo !== 'sem-comida') continue;
    const it = m.dados.itens[r.dados.item];
    if (it && it.tipo === 'colheita') return guiaDoEvento(m, 'colheu', { item: it.id }, out);
    out.tipo = 'painel'; out.painel = 'loja'; out.item = r.dados.item;
    return out;
  }
  // tudo cheio: é esperar os bichos comerem
  let seg = Infinity;
  for (const a of m.animais.lista) if (a.cicloDesde > 0 && lista.some((e) => e.id === a.abrigo)) seg = Math.min(seg, cicloDoAnimal(m, a).falta);
  if (seg === Infinity) return paraEntidade(out, lista[0].id);
  out.tipo = 'esperar'; out.seg = seg;
  return out;
});

const falha = (m, r, quieto) => { if (!quieto) m.eventos.emitir('faltou', { motivo: r.motivo, dados: r.dados }); return { ok: false, motivo: r.motivo, dados: r.dados }; };

// ---------- o sistema ----------
registrarSistema({
  id: 'animais',
  iniciar(m) {
    m.animais = { lista: [], abrigos: {}, seq: 0, versao: 0, proximo: Infinity, entregues: [], vistos: [] };
    for (const def of Object.values(m.dados.construcoes)) if (def.tipo === 'abrigo') darVidaAoAbrigo(def.id);
  },
  segundo: conferir,
  ausencia: conferir,

  comandos: {
    // comprarAnimal { animal, abrigo? }: paga em ouro e o bicho vai para o abrigo pedido (id da entidade: o do painel
    // aberto), se for do tipo dele e tiver vaga; senão, para o primeiro abrigo pronto do tipo dele com vaga
    comprarAnimal(m, c) {
      const r = podeComprarAnimal(m, c.animal);
      if (!r.ok) return falha(m, r, c.quieto);
      const d = m.dados.animais[c.animal], e = c.abrigo ? construcaoPorId(m, c.abrigo) : null;
      const cabe = !!e && e.tipo === d.abrigo && estaPronta(e) && quantosNoAbrigo(m, e.id) < vagasDoAbrigo(m, e);
      gastarOuro(m, d.preco.ouro, 'animal');
      const a = porAnimal(m, d.id, cabe ? { abrigo: e.id } : {});
      m.eventos.emitir('comprou', { animal: d.id, classe: 'animal', familia: d.familia, n: 1, ouro: d.preco.ouro, id: a.id, entidade: a.abrigo });
      return { ok: true, dados: { animal: d.id, id: a.id, ouro: d.preco.ouro, entidade: a.abrigo } };
    },
    // encherCocho { entidade }: a personagem vai até o abrigo e põe no cocho o que houver guardado, até encher
    encherCocho(m, c) {
      const e = construcaoPorId(m, c.entidade), p = m.personagem;
      if (!e || e.local !== p.local) return falha(m, NAO('nao-existe'), true);
      const r = podeEncherCocho(m, e);
      if (!r.ok) return falha(m, r, c.quieto);
      if (naFila(m, 'abastecerCocho', e.id)) return { ok: true, repetida: true };
      if (p.fila.length + 1 > m.dados.regras.filaMax) return falha(m, NAO('fila-cheia'), c.quieto);
      p.rumando = false;
      p.fila.push({ tipo: 'agir', acao: 'abastecerCocho', entidade: e.id, args: null });
      return { ok: true };
    },
    // encherBebedouro { entidade }: despeja o regador no bebedouro; sem água, ela passa antes no poço; se uma
    // regada não encher, volta ao poço sozinha quantas vezes for preciso
    encherBebedouro(m, c) {
      const e = construcaoPorId(m, c.entidade), p = m.personagem;
      if (!e || e.local !== p.local) return falha(m, NAO('nao-existe'), true);
      const r = podeEncherBebedouro(m, e);
      if (!r.ok) return falha(m, r, c.quieto);
      if (naFila(m, 'abastecerBebedouro', e.id)) return { ok: true, repetida: true };
      if (p.fila.length + 2 > m.dados.regras.filaMax) return falha(m, NAO('fila-cheia'), c.quieto);
      const reg = ferramentaNoCinto(m, 'regador') || ferramentaNoSuporte(m, 'regador'), poco = pocoDe(m, m.local);
      if (!(m.posses.ferramentas[reg].agua > 0)) {
        if (!poco) return falha(m, NAO('regador-vazio'), c.quieto);
        if (!naFila(m, 'encher', poco.id)) p.fila.push({ tipo: 'agir', acao: 'encher', entidade: poco.id, args: null });
      }
      p.rumando = false;
      p.fila.push({ tipo: 'agir', acao: 'abastecerBebedouro', entidade: e.id, args: null });
      return { ok: true };
    },
    // viuDicaDeAnimal { dica }: o vizinho já explicou esta mecânica (a interface pergunta com jaViuDica e marca aqui); fica gravado
    viuDicaDeAnimal(m, c) {
      if (typeof c.dica !== 'string' || !c.dica) return { ok: false, motivo: 'nao-existe' };
      if (m.animais.vistos.includes(c.dica)) return { ok: true, repetida: true };
      m.animais.vistos.push(c.dica);
      return { ok: true };
    },
  },

  // cada bicho vai inteiro (a família guarda os seus campos nele); os instantes, arredondados
  salvar(m) {
    const A = m.animais, abrigos = {};
    for (const id in A.abrigos) abrigos[id] = [A.abrigos[id].cocho, A.abrigos[id].bebedouro];
    return { seq: A.seq, entregues: [...A.entregues], vistos: [...A.vistos], abrigos, lista: A.lista.map((a) => ({ ...a, cicloDesde: Math.round(a.cicloDesde || 0) })) };
  },
  // Gravação de antes dos animais não traz este sistema: vale o que iniciar() montou (nenhum bicho).
  // O bicho cuja espécie saiu dos dados fica de fora; o que perdeu o abrigo espera um com vaga (realojar).
  carregar(m, d) {
    const A = m.animais, D = m.dados.animais, vistos = new Set();
    A.lista = []; A.seq = Math.round(d.seq) || 0;
    A.entregues = Array.isArray(d.entregues) ? d.entregues.filter((id) => D[id]) : [];
    A.vistos = Array.isArray(d.vistos) ? d.vistos.filter((k) => typeof k === 'string') : [];
    for (const id in d.abrigos || {}) {
      const e = construcaoPorId(m, id), g = d.abrigos[id];
      if (!ehAbrigo(m, e) || !Array.isArray(g)) continue;
      const s = criarEstado(m, e);
      s.cocho = Math.max(0, Math.min(capacidadeDoCocho(m, e), +g[0] || 0)); s.bebedouro = Math.max(0, Math.min(capacidadeDoBebedouro(m, e), +g[1] || 0));
    }
    for (const g of Array.isArray(d.lista) ? d.lista : []) {
      if (!g || typeof g.id !== 'string' || !D[g.especie] || vistos.has(g.id)) continue;
      vistos.add(g.id);
      const def = D[g.especie], e = def.abrigo && g.abrigo ? construcaoPorId(m, g.abrigo) : null;
      A.lista.push({ ...g, familia: def.familia, abrigo: ehAbrigo(m, e) ? e.id : null, tratado: !!g.tratado, cicloDesde: g.cicloDesde > 0 ? g.cicloDesde : 0, pronto: g.pronto > 0 ? g.pronto : 0, produzidos: g.produzidos > 0 ? g.produzidos : 0 });
    }
    for (const a of A.lista) { if (a.abrigo) criarEstado(m, construcaoPorId(m, a.abrigo)); else a.cicloDesde = 0; const f = gancho(a.familia, 'aoCarregar'); if (f) f(m, a); }
    A.seq = Math.max(A.seq, ...A.lista.map((a) => +(/-(\d+)$/.exec(a.id) || [0, 0])[1]));
    A.versao++; A.proximo = 0;
  },
});
