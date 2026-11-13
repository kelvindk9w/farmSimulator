// O guia: para a missão da vez, qual é o próximo passo do jogador? A interface usa para apontar a seta do tutorial
// e o jogador automático usa para saber o que fazer. Só lê o mundo; não muda nada.
// Devolve em "out": { tipo: 'casa', x, z } | { tipo: 'entidade', id } | { tipo: 'modo', modo } | { tipo: 'semente', item }
//                 | { tipo: 'painel', painel, item } | { tipo: 'esperar', seg } | { tipo: null }
// No campo de plantação, o passo de 'casa' também traz "casas": [[x, z]...] as da mesma fileira que pedem o mesmo
// (a interface marca a fileira toda; null quando é uma casa só).
import { GRAMA, ARADA, CAMPO, deLavoura } from './local.js';
import { missaoAtual } from './sistemas/missoes.js';
import { noCesto, espacoNoCesto, noCeleiro, ferramentaNoCinto, ferramentaGuardada } from './sistemas/posses.js';
import { estadoDaPlanta, segundosDeAgua, sementesLivres, regaPrometida, podeArar, casasDaFileira } from './sistemas/lavoura.js';
import { filaTem, contarNaFila } from './sistemas/personagem.js';

// As frentes novas ensinam o guia a apontar o passo dos seus eventos, cada uma no seu arquivo:
//   registrarGuia(evento, (mundo, filtro, out) → out | null)     null = "não é comigo": vale o passo padrão
// Ex.: o guia de "limpou" aponta o mato mais perto; o de "comprou" com filtro de lote aponta a placa do lote.
const GUIAS = {};
export function registrarGuia(evento, fn) { (GUIAS[evento] || (GUIAS[evento] = [])).push(fn); }

const casa = (out, x, z) => { out.tipo = 'casa'; out.x = x; out.z = z; return out; };
const entidade = (out, id) => { out.tipo = 'entidade'; out.id = id; return out; };
const modo = (out, id) => { out.tipo = 'modo'; out.modo = id; return out; };
const nada = (out) => { out.tipo = null; return out; };
const um = (v) => (Array.isArray(v) ? v[0] : v);

// a casa mais perto de (cx, cz) que passa no teste, dentro de "raio" casas
function casaPerto(m, cx, cz, raio, serve, out) {
  const loc = m.local, x0 = Math.floor(cx), z0 = Math.floor(cz);
  let melhor = Infinity, achou = false;
  for (let z = z0 - raio; z <= z0 + raio; z++) for (let x = x0 - raio; x <= x0 + raio; x++) {
    if (!loc.ehPropria(x, z)) continue;
    const d = (x + 0.5 - cx) * (x + 0.5 - cx) + (z + 0.5 - cz) * (z + 0.5 - cz);
    if (d < melhor && serve(loc, loc.i(x, z), x, z)) { melhor = d; out.x = x; out.z = z; achou = true; }
  }
  if (achou) out.tipo = 'casa';
  return achou;
}
const lavoura = (m) => m.dados.terras.pontos.lavoura || m.dados.terras.pontos.poco || [m.personagem.x, m.personagem.z];

// as casas da fileira de (x, z) que passam no teste vão em out.casas (casa fora do campo: só ela)
function naFileira(m, x, z, serve, out) {
  const loc = m.local, casas = [];
  for (const [cx, cz] of casasDaFileira(m, x, z)) if (serve(loc, loc.i(cx, cz), cx, cz)) casas.push([cx, cz]);
  out.casas = casas.length > 1 ? casas : null;
}
// A fileira do campo que o guia aponta: das casas perto do ponto da lavoura que passam no teste, as da linha mais
// perto da primeira fileira (a linha do ponto da lavoura); dela, a casa mais perto da personagem.
function fileiraPerto(m, c, raio, serve, out) {
  const loc = m.local, p = m.personagem, x0 = Math.floor(c[0]), z0 = Math.floor(c[1]);
  let melhor = Infinity, achou = false;
  for (let z = z0 - raio; z <= z0 + raio; z++) for (let x = x0 - raio; x <= x0 + raio; x++) {
    if (!loc.ehPropria(x, z) || !serve(loc, loc.i(x, z), x, z)) continue;
    const d = Math.abs(z - z0) * 1000 + Math.hypot(x + 0.5 - p.x, z + 0.5 - p.z);
    if (d < melhor) { melhor = d; out.x = x; out.z = z; achou = true; }
  }
  if (!achou) return false;
  out.tipo = 'casa';
  naFileira(m, out.x, out.z, serve, out);
  return true;
}
// a casa (x, z) encosta no campo de plantação? (arar ali aumenta o campo)
const encostaNoCampo = (loc, x, z) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => deLavoura(loc.chaoEm(x + dx, z + dz)));

// a planta mais perto da personagem no estado pedido (e da cultura pedida, se houver)
function plantaPerto(m, estado, cultura, out) {
  const loc = m.local, p = m.personagem;
  let melhor = Infinity, achou = false;
  for (const i of loc.plantadas) {
    const pl = loc.plantas[i];
    if ((cultura && pl.cultura !== cultura) || estadoDaPlanta(m, pl) !== estado) continue;
    const x = i % loc.l, z = (i - x) / loc.l;
    if (estado === 'pronta' ? filaTem(m, 'colher', x, z) : regaPrometida(m, x, z)) continue; // com regador de área, a rega da vizinha já molha esta
    const d = Math.hypot(x + 0.5 - p.x, z + 0.5 - p.z);
    if (d < melhor) { melhor = d; out.x = x; out.z = z; achou = true; }
  }
  if (achou) out.tipo = 'casa';
  return achou;
}
function menorEspera(m, cultura) {
  const loc = m.local;
  let menor = Infinity;
  for (const i of loc.plantadas) { const pl = loc.plantas[i]; if ((!cultura || pl.cultura === cultura) && estadoDaPlanta(m, pl) === 'crescendo') menor = Math.min(menor, segundosDeAgua(m, pl)); }
  return menor;
}
const sementeDa = (m, cultura) => (m.dados.culturas[cultura] ? m.dados.culturas[cultura].semente : null);
function algumaSemente(m) {
  const B = m.posses.bolsa;
  for (const k in B) if (B[k] > 0 && m.dados.culturaDaSemente[k] && m.dados.culturas[m.dados.culturaDaSemente[k]].nivel <= m.progresso.nivel) return k;
  return null;
}

// arar: primeiro o campo sem sulco, fileira por fileira; campo todo arado, a grama colada nele (o campo cresce);
// sem campo nenhum, a grama livre mais perto do ponto da lavoura
function passoArar(m, out) {
  if (m.modo.id !== 'enxada') return modo(out, 'enxada');
  const c = lavoura(m), p = m.personagem;
  const livre = (loc, i, x, z) => podeArar(m, x, z) && !filaTem(m, 'arar', x, z);
  if (fileiraPerto(m, c, 12, (loc, i, x, z) => loc.chao[i] === CAMPO && livre(loc, i, x, z), out)) return out;
  const beira = (loc, i, x, z) => loc.chao[i] === GRAMA && livre(loc, i, x, z) && encostaNoCampo(loc, x, z);
  if (casaPerto(m, p.x, p.z, 12, beira, out)) { out.casas = null; return out; }
  if (casaPerto(m, c[0] + 0.5, c[1] + 0.5, 8, livre, out)) { out.casas = null; return out; }
  return nada(out);
}
function passoPlantar(m, semente, out) {
  const s = semente || algumaSemente(m);
  if (!s || !(m.posses.bolsa[s] > 0)) { out.tipo = 'painel'; out.painel = 'loja'; out.item = s || null; return out; }
  if (sementesLivres(m, s) <= 0) return nada(out); // as que há já estão prometidas na fila: é esperar
  const c = lavoura(m);
  const vazia = (l, i, x, z) => l.chao[i] === ARADA && !l.plantas[i] && !filaTem(m, 'semear', x, z);
  // a fileira arada vazia mais perto da primeira; fora do campo, a terra arada vazia mais perto da personagem
  if (!fileiraPerto(m, c, 12, vazia, out) && !casaPerto(m, m.personagem.x, m.personagem.z, 12, vazia, out)) return passoArar(m, out);
  if (m.modo.id !== 'semear') return modo(out, 'semear');
  if (m.modo.semente !== s) { out.tipo = 'semente'; out.item = s; return out; }
  return casa(out, out.x, out.z);
}
function passoRegar(m, cultura, out) {
  if (!plantaPerto(m, 'sede', cultura, out)) return null;
  const x = out.x, z = out.z, reg = ferramentaNoCinto(m, 'regador') || ferramentaGuardada(m, 'regador');
  if (reg && m.posses.ferramentas[reg].agua - contarNaFila(m, 'regar') <= 0 && !filaTem(m, 'encher')) return entidade(out, 'poco'); // a água que há já está prometida
  if (m.modo.id !== 'mao' && m.modo.id !== 'regar') return modo(out, 'mao');
  naFileira(m, x, z, (l, i, cx, cz) => !!l.plantas[i] && estadoDaPlanta(m, l.plantas[i]) === 'sede' && (!cultura || l.plantas[i].cultura === cultura) && !regaPrometida(m, cx, cz), out);
  return casa(out, x, z);
}
function passoColher(m, cultura, out) {
  if (plantaPerto(m, 'pronta', cultura, out)) {
    const x = out.x, z = out.z;
    if (espacoNoCesto(m) < m.dados.culturas[m.local.plantas[m.local.i(x, z)].cultura].rende) return entidade(out, 'banca');
    if (m.modo.id !== 'mao') return modo(out, 'mao');
    naFileira(m, x, z, (l, i, cx, cz) => !!l.plantas[i] && estadoDaPlanta(m, l.plantas[i]) === 'pronta' && (!cultura || l.plantas[i].cultura === cultura) && !filaTem(m, 'colher', cx, cz), out);
    return casa(out, x, z);
  }
  if (passoRegar(m, cultura, out)) return out;
  const espera = menorEspera(m, cultura);
  if (espera < Infinity) { out.tipo = 'esperar'; out.seg = espera; return out; }
  return passoPlantar(m, cultura ? sementeDa(m, cultura) : null, out);
}

const passo = { tipo: null, x: 0, z: 0, id: null, modo: null, item: null, painel: null, seg: 0, casas: null };
export function guiaDaMissao(m, out = passo) {
  out.tipo = null; out.item = null; out.casas = null;
  const a = missaoAtual(m);
  if (!a || a.esperaNivel) return guiaLivre(m, out);
  return guiaDoEvento(m, a.missao.objetivo.evento, a.missao.objetivo.filtro || {}, out);
}
// O próximo passo para fazer acontecer o evento "evento" com o filtro "f". O guia de um evento pode pedir o de outro:
// o de "entregou" pede o de "colheu" do item que falta no pedido; o de "produziu", o do ingrediente que falta.
export function guiaDoEvento(m, evento, f = {}, out = passo) {
  out.casas = null;
  const culturaDoItem = (it) => { for (const c of Object.values(m.dados.culturas)) if (c.produto === it) return c.id; return null; };
  const outros = GUIAS[evento];
  if (outros) for (let k = 0; k < outros.length; k++) { const r = outros[k](m, f, out); if (r) return r; }
  switch (evento) {
    case 'arou': return passoArar(m, out);
    case 'plantou': return passoPlantar(m, um(f.item) || sementeDa(m, um(f.cultura)), out);
    case 'encheu': return entidade(out, 'poco');
    case 'regou': return passoRegar(m, um(f.cultura), out) || passoPlantar(m, sementeDa(m, um(f.cultura)), out);
    case 'colheu': return passoColher(m, um(f.cultura) || culturaDoItem(um(f.item)), out);
    case 'vendeu': return noCesto(m) > 0 ? entidade(out, 'banca') : noCeleiro(m) > 0 ? entidade(out, 'celeiro') : passoColher(m, null, out);
    case 'guardou': return noCesto(m) > 0 ? entidade(out, 'celeiro') : passoColher(m, null, out);
    case 'comprou': out.tipo = 'painel'; out.painel = 'loja'; out.item = um(f.item) || null; out.classe = um(f.classe) || null; return out;
    default: return nada(out);
  }
}
// sem missão valendo: o que rende agora (colher, regar, vender o cesto cheio, plantar)
export function guiaLivre(m, out = passo) {
  out.casas = null;
  if (espacoNoCesto(m) <= 0) return entidade(out, 'banca');
  return passoColher(m, null, out);
}
