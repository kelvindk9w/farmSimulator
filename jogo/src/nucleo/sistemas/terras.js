// O mapa: monta o local "fazenda" a partir de terras.json. A área inicial é do jogador; o resto é terra à venda,
// dividida em lotes (cada um com a sua placa) e coberta de mato, pedras, tocos e árvores do mato.
// As beiradas da área inicial também nascem com mato, pedra e toco (fora do miolo "limpo").
// Aqui ficam o mapa e o que a gravação guarda dele: os lotes já comprados e os obstáculos já tirados.
// A compra de lote está em lotes.js; limpar a terra (foice, machado, picareta), em limpeza.js.
import { registrarSistema } from '../registro.js';
import { Local, CAMINHO } from '../local.js';
import { acaso } from '../util.js';

export const OBSTACULOS = ['mata', 'mato', 'pedra', 'toco']; // os tipos de entidade estão em limpeza.js; a placa, em lotes.js

export const loteDe = (m, id) => m.dados.terras.lotes.find((l) => l.id === id) || null;
export const idDaPlaca = (lote) => 'placa-' + lote;
export const loteComprado = (m, id) => m.terras.lotes.includes(id);
// o lote à venda em que a casa (x, z) fica, ou null (terra própria e terra fora dos lotes não são de lote nenhum)
export function loteDaCasa(m, x, z) {
  for (const l of m.dados.terras.lotes) if (dentroDe(l.area, x, z)) return l;
  return null;
}

// a terra do lote passa a ser do jogador: some a placa, some o escurecido (o desenho do chão ouve "chaoMudou")
export function liberarLote(m, id, calado) {
  const l = loteDe(m, id), loc = m.locais.fazenda;
  if (!l || loteComprado(m, id)) return false;
  marcar(loc, l.area, 'propria', 1);
  loc.tirar(idDaPlaca(id));
  m.terras.lotes.push(id);
  if (!calado) m.eventos.emitir('chaoMudou', { tudo: true, local: loc.id });
  return true;
}

// tira do mapa um obstáculo nascido com ele e anota a casa (o mapa renasce igual: a gravação guarda o que saiu)
export function tirarObstaculo(m, e) {
  const loc = m.locais.fazenda;
  if (!loc.porId[e.id] || !OBSTACULOS.includes(e.tipo)) return false;
  loc.tirar(e.id);
  m.terras.limpos.push(loc.i(e.x, e.z));
  return true;
}

function marcar(loc, a, campo, valor) {
  for (let z = Math.max(0, a[1]); z < Math.min(loc.p, a[3]); z++) for (let x = Math.max(0, a[0]); x < Math.min(loc.l, a[2]); x++) loc[campo][z * loc.l + x] = valor;
}
const dentroDe = (a, x, z) => !!a && x >= a[0] && z >= a[1] && x < a[2] && z < a[3];

// sorteio fixo por casa (não entra na gravação: o mapa sempre nasce igual)
function semear(loc, x, z, chances) {
  let r = acaso(x, z, 11);
  for (const t of OBSTACULOS) {
    const c = chances[t];
    if (!(c > 0)) continue;
    if (r < c) { loc.por({ id: `${t}-${x}-${z}`, tipo: t, x, z, v: Math.floor(acaso(x, z, 23) * 4) }); return; }
    r -= c;
  }
}

// de onde a personagem nasce, dá para chegar ao lado de cada construção? (o mato da área inicial não pode fechar o caminho)
function tudoAlcancavel(loc, ini, construcoes) {
  const visto = new Uint8Array(loc.l * loc.p), pilha = [];
  const sx = Math.floor(ini[0]), sz = Math.floor(ini[1]);
  if (!loc.andavel(sx, sz)) return false;
  pilha.push(sx, sz); visto[loc.i(sx, sz)] = 1;
  while (pilha.length) {
    const z = pilha.pop(), x = pilha.pop();
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, nz = z + dz;
      if (!loc.andavel(nx, nz) || visto[loc.i(nx, nz)]) continue;
      visto[loc.i(nx, nz)] = 1; pilha.push(nx, nz);
    }
  }
  for (const e of construcoes) {
    let ok = false;
    for (let x = e.x - 1; x <= e.x + e.l && !ok; x++) for (let z = e.z - 1; z <= e.z + e.p && !ok; z++) if (loc.dentro(x, z) && visto[loc.i(x, z)]) ok = true;
    if (!ok) return false;
  }
  return true;
}

registrarSistema({
  id: 'terras',
  iniciar(m) {
    const T = m.dados.terras;
    const loc = m.locais.fazenda = new Local('fazenda', T.largura, T.profundidade);
    m.terras = { lotes: [], limpos: [] }; // lotes já comprados; casas (índices) de onde o mato, a pedra ou o toco já saiu
    marcar(loc, T.inicial, 'propria', 1);
    for (const c of T.caminhos) marcar(loc, c, 'chao', CAMINHO);
    const construcoes = [];
    for (const tipo of ['casa', 'celeiro', 'poco', 'banca']) {
      const p = T.pontos[tipo], casas = T.casas[tipo];
      if (p) construcoes.push(loc.por({ id: tipo, tipo, x: Math.round(p[0]), z: Math.round(p[1]), l: casas ? casas[0] : 0, p: casas ? casas[1] : 0 }));
    }
    loc.entrada = T.pontos.personagem ? [T.pontos.personagem[0], T.pontos.personagem[1]] : [T.inicial[0] + 0.5, T.inicial[1] + 0.5];
    // uma placa por lote, na casa do lote mais perto do meio da área inicial
    const cx = (T.inicial[0] + T.inicial[2]) / 2, cz = (T.inicial[1] + T.inicial[3]) / 2;
    for (const l of T.lotes) {
      const a = l.area, px = Math.max(a[0], Math.min(a[2] - 1, Math.round(l.placa ? l.placa[0] : cx))), pz = Math.max(a[1], Math.min(a[3] - 1, Math.round(l.placa ? l.placa[1] : cz)));
      if (loc.dentro(px, pz) && !loc.ocupa[loc.i(px, pz)] && !loc.propria[loc.i(px, pz)]) loc.por({ id: 'placa-' + l.id, tipo: 'placa', x: px, z: pz, lote: l.id });
    }
    // natureza: cada lote tem a sua mistura; fora dos lotes vale a geral; na área inicial, só fora do miolo limpo
    const limpo = T.limpo || T.inicial, daCasa = (x, z) => (loc.propria[loc.i(x, z)] ? T.naturezaInicial : (T.lotes.find((l) => dentroDe(l.area, x, z)) || T).natureza || T.natureza);
    const perto = [Math.floor(loc.entrada[0]), Math.floor(loc.entrada[1])];
    for (let z = 0; z < loc.p; z++) for (let x = 0; x < loc.l; x++) {
      const i = loc.i(x, z);
      if (loc.ocupa[i] || loc.chao[i] === CAMINHO) continue;
      if (loc.propria[i] && (dentroDe(limpo, x, z) || (Math.abs(x - perto[0]) <= 1 && Math.abs(z - perto[1]) <= 1))) continue;
      semear(loc, x, z, daCasa(x, z));
    }
    // se o mato da área inicial fechou o caminho até alguma construção, a área inicial nasce toda limpa
    if (!tudoAlcancavel(loc, loc.entrada, construcoes)) {
      for (const e of [...loc.entidades]) if (OBSTACULOS.includes(e.tipo) && loc.propria[loc.i(e.x, e.z)]) loc.tirar(e.id);
      m.terras.aviso = 'o mato da área inicial fechava o caminho: ela nasceu limpa (confira terras.json: inicial.limpo)';
    }
  },
  salvar(m) { return { lotes: [...m.terras.lotes], limpos: [...m.terras.limpos] }; },
  // roda antes da lavoura e das árvores: quando elas voltam, a terra comprada já é própria e as casas limpas já estão livres
  carregar(m, d) {
    const loc = m.locais.fazenda;
    if (Array.isArray(d.lotes)) for (const id of d.lotes) liberarLote(m, id, true); // lote que saiu dos dados é ignorado
    if (Array.isArray(d.limpos)) for (const i of d.limpos) {
      const e = i >= 0 && i < loc.ocupa.length ? loc.porNum[loc.ocupa[i]] : null;
      if (e && OBSTACULOS.includes(e.tipo)) tirarObstaculo(m, e); // se o mapa mudou e ali não há mais obstáculo, nada a fazer
    }
  },
});
