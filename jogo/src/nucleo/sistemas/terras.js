// O mapa: monta o local "fazenda" a partir de terras.json. A área inicial é do jogador; o resto é terra à venda,
// dividida em lotes (cada um com a sua placa) e coberta de mato, pedras, tocos e árvores do mato.
// As beiradas da área inicial também nascem com mato, pedra e toco (fora do miolo "limpo").
// Comprar lote e limpar a terra entram com as suas frentes; aqui o mapa já nasce grande e os lotes já existem.
import { registrarSistema, registrarTipo } from '../registro.js';
import { Local, CAMINHO } from '../local.js';
import { acaso } from '../util.js';

const OBSTACULOS = ['mata', 'mato', 'pedra', 'toco'];

// bloqueiam a casa; um dia serão limpos com foice, machado e picareta (rendem fibra, madeira e pedra)
for (const tipo of OBSTACULOS) {
  registrarTipo({
    tipo, casas: [1, 1], bloqueia: true, obstaculo: true,
    acaoPossivel: (m, e) => (m.local.ehPropria(e.x, e.z) ? { acao: null, texto: 'limpar-depois', dados: { obstaculo: e.tipo } } : { acao: null, texto: 'terra-a-venda' }),
  });
}
registrarTipo({
  tipo: 'placa', casas: [1, 1], bloqueia: true,
  acaoPossivel: (m, e) => { const l = loteDe(m, e.lote); return { acao: null, texto: 'lote-a-venda', dados: { preco: l ? l.preco : 0, nivel: l ? l.nivel : 1, nome: l ? l.nome || l.id : '' } }; },
});

export const loteDe = (m, id) => m.dados.terras.lotes.find((l) => l.id === id) || null;

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
    m.terras = { lotes: [] }; // lotes já comprados
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
  salvar(m) { return { lotes: [...m.terras.lotes] }; },
  carregar(m, d) { m.terras.lotes = Array.isArray(d.lotes) ? d.lotes.filter((id) => loteDe(m, id)) : []; },
});
