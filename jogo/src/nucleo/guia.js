// O guia: para a missão da vez, qual é o próximo passo do jogador? A interface usa para apontar a seta do tutorial
// e o jogador automático usa para saber o que fazer. Só lê o mundo; não muda nada.
// Devolve em "out": { tipo: 'casa', x, z } | { tipo: 'entidade', id } | { tipo: 'modo', modo } | { tipo: 'semente', item }
//                 | { tipo: 'painel', painel, item } | { tipo: 'esperar', seg } | { tipo: null }
import { GRAMA, ARADA } from './local.js';
import { missaoAtual } from './sistemas/missoes.js';
import { noCesto, espacoNoCesto, noCeleiro, ferramentaNoCinto, ferramentaNoSuporte } from './sistemas/posses.js';
import { estadoDaPlanta, segundosDeAgua } from './sistemas/lavoura.js';
import { filaTem } from './sistemas/personagem.js';

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

// a planta mais perto da personagem no estado pedido (e da cultura pedida, se houver)
function plantaPerto(m, estado, cultura, out) {
  const loc = m.local, p = m.personagem;
  let melhor = Infinity, achou = false;
  for (const i of loc.plantadas) {
    const pl = loc.plantas[i];
    if ((cultura && pl.cultura !== cultura) || estadoDaPlanta(m, pl) !== estado) continue;
    const x = i % loc.l, z = (i - x) / loc.l;
    if (filaTem(m, estado === 'pronta' ? 'colher' : 'regar', x, z)) continue;
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

function passoArar(m, out) {
  if (m.modo.id !== 'enxada') return modo(out, 'enxada');
  const c = lavoura(m);
  return casaPerto(m, c[0] + 0.5, c[1] + 0.5, 8, (loc, i, x, z) => loc.chao[i] === GRAMA && !loc.ocupa[i] && !filaTem(m, 'arar', x, z), out) ? out : nada(out);
}
function passoPlantar(m, semente, out) {
  const s = semente || algumaSemente(m);
  if (!s || !(m.posses.bolsa[s] > 0)) { out.tipo = 'painel'; out.painel = 'loja'; out.item = s || null; return out; }
  const c = lavoura(m), loc = m.local;
  const vazia = (l, i, x, z) => l.chao[i] === ARADA && !l.plantas[i] && !filaTem(m, 'semear', x, z);
  if (!casaPerto(m, c[0] + 0.5, c[1] + 0.5, 10, vazia, out)) return passoArar(m, out);
  if (m.modo.id !== 'semear') return modo(out, 'semear');
  if (m.modo.semente !== s) { out.tipo = 'semente'; out.item = s; return out; }
  return casaPerto(m, m.personagem.x, m.personagem.z, 12, vazia, out) ? out : casa(out, out.x, out.z);
}
function passoRegar(m, cultura, out) {
  if (!plantaPerto(m, 'sede', cultura, out)) return null;
  const x = out.x, z = out.z, reg = ferramentaNoCinto(m, 'regador') || ferramentaNoSuporte(m, 'regador');
  if (reg && !(m.posses.ferramentas[reg].agua > 0) && !filaTem(m, 'encher')) return entidade(out, 'poco');
  if (m.modo.id !== 'mao' && m.modo.id !== 'regar') return modo(out, 'mao');
  return casa(out, x, z);
}
function passoColher(m, cultura, out) {
  if (plantaPerto(m, 'pronta', cultura, out)) {
    const x = out.x, z = out.z;
    if (espacoNoCesto(m) < m.dados.culturas[m.local.plantas[m.local.i(x, z)].cultura].rende) return entidade(out, 'banca');
    if (m.modo.id !== 'mao') return modo(out, 'mao');
    return casa(out, x, z);
  }
  if (passoRegar(m, cultura, out)) return out;
  const espera = menorEspera(m, cultura);
  if (espera < Infinity) { out.tipo = 'esperar'; out.seg = espera; return out; }
  return passoPlantar(m, cultura ? sementeDa(m, cultura) : null, out);
}

const passo = { tipo: null, x: 0, z: 0, id: null, modo: null, item: null, painel: null, seg: 0 };
export function guiaDaMissao(m, out = passo) {
  out.tipo = null; out.item = null;
  const a = missaoAtual(m);
  if (!a || a.esperaNivel) return guiaLivre(m, out);
  const o = a.missao.objetivo, f = o.filtro || {};
  const culturaDoItem = (it) => { for (const c of Object.values(m.dados.culturas)) if (c.produto === it) return c.id; return null; };
  switch (o.evento) {
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
  if (espacoNoCesto(m) <= 0) return entidade(out, 'banca');
  return passoColher(m, null, out);
}
