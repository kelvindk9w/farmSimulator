// Animais de produção: comprar até encher o abrigo, encher cocho e bebedouro (as idas ao poço ela faz sozinha),
// recolher com o recipiente certo e, no fim da vida produtiva, vender ao fazendeiro. Animais de trabalho e de
// estimação: trabalho.mjs.
import { X } from './jogo.mjs';
import { passo, nota, evitado, evitar, naFazenda, nivel, comando, cmd, livre, tem, querer, contarNaFila } from './contexto.mjs';
import { esvaziar } from './lavoura.mjs';

const A = X.animais, PR = X.producao;
export const LIGADA = !!(A && A.abrigosProntos && A.estadoDoAbrigo);

// os abrigos prontos da fazenda: [{ e, def, est }] (refeito a cada chamada: são poucos)
export function abrigos(J) {
  if (!LIGADA) return [];
  const out = [];
  for (const e of J.m.construcao.todas) {
    const d = J.D.construcoes[e.tipo];
    if (!d || d.tipo !== 'abrigo' || e.local !== 'fazenda' || !X.construcao.estaPronta(e)) continue;
    out.push({ e, def: d, est: A.estadoDoAbrigo(J.m, e) });
  }
  return out;
}
const daProducao = (J, a) => a.familia === 'producao';
const bichosDe = (J, idAbrigo) => J.m.animais.lista.filter((a) => a.abrigo === idAbrigo);

// o que os bichos vão comer: o cocho cheio e mais um tanto (para o milho e a ração irem para o celeiro, não à banca)
export function querDosAnimais(J, Q) {
  for (const { e, est } of abrigos(J)) {
    const n = bichosDe(J, e.id).length;
    if (!n || !est.cocho.item) continue;
    querer(Q, est.cocho.item, Math.max(0, est.cocho.capacidade - est.cocho.nivel) + n * 3);
  }
}

// ---------- tratar ----------
export function tratar(J) {
  if (!LIGADA || !naFazenda(J) || (J.m.agora < (J.proxTrato || 0) && !J.metaTratar)) return null;
  let espera = 30;
  for (const { e, est } of abrigos(J)) {
    const bichos = bichosDe(J, e.id);
    if (!bichos.length) continue;
    const famintos = A.famintosDe(J.m, e.id);
    const c = est.cocho, b = est.bebedouro;
    // enche quando passou da metade (ou quando alguém está sem comer)
    if (c.capacidade > 0 && (c.nivel <= c.capacidade / 2 || famintos || J.metaTratar) && c.nivel < c.capacidade) {
      // um cocho de cada vez: o outro na fila pode levar a comida toda
      if (c.tem > 0 && contarNaFila(J, 'abastecerCocho') > 0) continue;
      if (c.tem > 0 && !evitado(J, 'cocho:' + e.id)) { evitar(J, 'cocho:' + e.id, 15); return cmd(J, { tipo: 'encherCocho', entidade: e.id }, 2, 'cocho'); }
      if (c.tem <= 0) {
        // sem comida: a ração se compra (o milho se planta: o "quer" já leva a lavoura para ele)
        const it = J.I[c.item];
        if (it && it.compra > 0 && it.nivel <= nivel(J) && !J.D.culturas[J.D.culturaDaSemente[it.id]] && !Object.values(J.D.culturas).some((cu) => cu.produto === it.id)) {
          const n = Math.min(c.capacidade - c.nivel, Math.floor((J.P.ouro - 20) / it.compra));
          if (n > 0 && !evitado(J, 'compra:' + it.id) && !J.fazRacao) return passo(J, 'comprar', { item: it.id, n });
        }
        nota(J, `o cocho do ${J.D.construcoes[e.tipo].nome.toLowerCase()} está sem ${it ? it.nome.toLowerCase() : c.item}`);
      }
    }
    // o bebedouro depois das regas da fila (o jogo só confere a água do regador na hora do toque)
    if (b.capacidade > 0 && (b.nivel <= b.capacidade / 2 || famintos || J.metaTratar) && b.nivel < b.capacidade && !evitado(J, 'bebedouro:' + e.id) && !contarNaFila(J, 'regar') && !contarNaFila(J, 'abastecerBebedouro')) {
      evitar(J, 'bebedouro:' + e.id, 15);
      return cmd(J, { tipo: 'encherBebedouro', entidade: e.id }, 2, 'bebedouro');
    }
  }
  J.proxTrato = J.m.agora + espera * 1000;
  return null;
}

// ---------- recolher ----------
export function recolher(J) {
  if (!LIGADA || !PR || !naFazenda(J) || J.m.agora < (J.proxRecolher || 0)) return null;
  let algum = false;
  for (const { e } of abrigos(J)) {
    const bichos = bichosDe(J, e.id).filter((a) => daProducao(J, a));
    if (!bichos.length) continue;
    const prontos = PR.prontosNoAbrigo(J.m, e.id);
    if (!prontos) continue;
    algum = true;
    const d = J.D.animais[bichos[0].especie], cheio = bichos.some((a) => a.pronto >= d.acumula);
    // recolhe quando há um por bicho, ou quando algum parou de produzir (ninho cheio)
    if (prontos < bichos.length && !cheio && !J.metaRecolher) continue;
    const r = PR.podeRecolher(J.m, d);
    if (!r.ok) {
      if (r.motivo === 'falta-de-recolher') {
        const it = J.I[r.dados.item];
        if (it && it.compra <= J.P.ouro && it.nivel <= nivel(J) && !evitado(J, 'compra:' + it.id)) return passo(J, 'comprar', { item: it.id, n: 1 });
        nota(J, `falta ${it ? it.nome.toLowerCase() : 'o recipiente'} para recolher ${J.I[d.produto].nome.toLowerCase()}`);
        continue;
      }
      return esvaziar(J, true); // recipiente ou cesto cheio
    }
    if (evitado(J, 'recolher:' + e.id)) continue;
    evitar(J, 'recolher:' + e.id, 10);
    return cmd(J, { tipo: 'recolher', entidade: e.id }, 2, 'recolher');
  }
  if (!algum) J.proxRecolher = J.m.agora + 20000;
  return null;
}

// ---------- fim da vida produtiva: vender ao fazendeiro ----------
export function fimDeVida(J) {
  if (!LIGADA || !comando(J, 'destinoDoAnimal')) return null;
  for (const a of J.m.animais.lista) if (a.fim === 'espera' && !evitado(J, 'fim:' + a.id)) { evitar(J, 'fim:' + a.id, 30); return cmd(J, { tipo: 'destinoDoAnimal', id: a.id, destino: 'fazendeiro' }, 3, 'fim'); }
  return null;
}

// ---------- comprar ----------
// compra um bicho desta espécie (o abrigo com vaga; sem vaga ou sem abrigo, devolve o motivo em "J.porqueAnimal")
export function comprarAnimal(J, especie) {
  if (!LIGADA || !comando(J, 'comprarAnimal')) return null;
  const r = A.podeComprarAnimal(J.m, especie);
  J.porqueAnimal = r.ok ? null : r;
  if (!r.ok) return null;
  if (evitado(J, 'animal:' + especie)) return null;
  return cmd(J, { tipo: 'comprarAnimal', animal: especie }, 2, 'animal:' + especie);
}
// sem missão pedindo: completa os abrigos com o bicho de produção deles, se sobra ouro
export function encherAbrigos(J, margem) {
  if (!LIGADA) return null;
  for (const { e, est } of abrigos(J)) {
    if (est.ocupadas >= est.vagas) continue;
    const esp = Object.values(J.D.animais).find((d) => d.abrigo === e.tipo && d.familia === 'producao' && d.preco.ouro > 0 && d.nivel <= nivel(J));
    if (!esp || livre(J) - esp.preco.ouro < margem) continue;
    const s = comprarAnimal(J, esp.id);
    if (s) return s;
  }
  return null;
}
// quantos bichos desta espécie ela tem
export const quantosAnimais = (J, especie) => (LIGADA ? J.m.animais.lista.filter((a) => a.especie === especie).length : 0);
// segundos até algum bicho ter produto (para a espera)
export function esperaDosAnimais(J) {
  if (!LIGADA) return null;
  let s = Infinity;
  for (const a of J.m.animais.lista) if (a.cicloDesde > 0) { const c = A.cicloDoAnimal(J.m, a); if (c.falta < s) s = c.falta; }
  return s === Infinity ? null : Math.max(1, s);
}
