// Limpar a terra: mato (foice → fibra), toco e árvore do mato (machado → madeira), pedra (picareta → pedra).
// Os números vêm de terras.json (obstaculos: resistencia, forcaMinima, da, chance, xp) e da ferramenta (forca, area).
// Um toque faz a cadeia toda: ela busca a ferramenta certa, vai até lá e bate quantas vezes for preciso
// (golpes = resistência / força). A foice com "area" leva junto o mato vizinho, numa passada só.
// O material vai direto para a bolsa (o estoque de materiais), nunca para o cesto da colheita.
import { registrarAcao, registrarTipo, registrarModo, registrarEvento, TIPOS } from '../registro.js';
import { ferramentaNoCinto, ferramentaNoSuporte, darItem } from './posses.js';
import { darXp } from './niveis.js';
import { OBSTACULOS, tirarObstaculo } from './terras.js';
import { cabe, acharCaminho } from '../caminho.js';
import { registrarGuia } from '../guia.js';

const ACAO_DA = { foice: 'rocar', machado: 'cortar', picareta: 'quebrar' };
const VIZINHAS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
const NAO = (motivo, dados, limpar) => ({ ok: false, motivo, dados, limpar });

const obst = (m, e) => m.dados.obstaculos[e.tipo];
// a ferramenta que a personagem usaria: a do cinto; sem ela, a do suporte (ela busca)
const ferramentaDe = (m, funcao) => ferramentaNoCinto(m, funcao) || ferramentaNoSuporte(m, funcao);
const forcaDe = (m, id) => (id && m.dados.itens[id].forca > 0 ? m.dados.itens[id].forca : 1);
const areaDe = (m, id) => (id && m.dados.itens[id].area >= 1 ? Math.round(m.dados.itens[id].area) : 1);
// quantos golpes ainda faltam para o obstáculo sair, com a ferramenta que ela tem
export function golpesQueFaltam(m, e) {
  const O = obst(m, e), f = forcaDe(m, ferramentaDe(m, O.ferramenta));
  return Math.max(1, Math.ceil((O.resistencia - (e.dano || 0)) / f));
}

// já há na fila uma limpeza que leva este obstáculo (ele mesmo ou de carona na foice de outro)?
export function limpezaPrometida(m, id) {
  const p = m.personagem, serve = (t) => t && t.tipo === 'agir' && ACAO_DA_FILA[t.acao] && (t.entidade === id || (t.args && t.args.junto && t.args.junto.includes(id)));
  if (serve(p.tarefa)) return true;
  for (let i = 0; i < p.fila.length; i++) if (serve(p.fila[i])) return true;
  return false;
}
const ACAO_DA_FILA = { rocar: 1, cortar: 1, quebrar: 1 };

// os obstáculos que saem junto com "e" numa passada: os vizinhos do mesmo tipo, em terra própria, até a "area" da ferramenta
export function levaJunto(m, e) {
  const O = obst(m, e), area = areaDe(m, ferramentaDe(m, O.ferramenta)), out = [];
  if (area <= 1 || O.resistencia > 1) return out; // só o que sai com um golpe (o mato)
  const loc = m.local;
  for (let k = 0; k < VIZINHAS.length && out.length < area - 1; k++) {
    const x = e.x + VIZINHAS[k][0], z = e.z + VIZINHAS[k][1], o = loc.entidadeEm(x, z);
    if (o && o.tipo === e.tipo && loc.ehPropria(x, z) && !limpezaPrometida(m, o.id)) out.push(o.id);
  }
  return out;
}

// A personagem chega a algum lado do obstáculo? Num lote recém-comprado quase tudo está fechado por outros
// obstáculos: limpa-se da beirada para dentro.
const LADOS = [[0.5, -0.5], [0.5, 1.5], [-0.5, 0.5], [1.5, 0.5]];
export function alcancaObstaculo(m, e) {
  const loc = m.local, p = m.personagem;
  for (let k = 0; k < LADOS.length; k++) {
    const x = e.x + LADOS[k][0], z = e.z + LADOS[k][1];
    if (cabe(loc, x, z) && (Math.hypot(x - p.x, z - p.z) < 0.3 || acharCaminho(loc, p.x, p.z, x, z))) return true;
  }
  return false;
}

// o que o toque num obstáculo faz
function acaoNoObstaculo(m, e) {
  const O = obst(m, e), dados = { obstaculo: e.tipo, nome: O.nome, funcao: O.ferramenta };
  if (!m.local.ehPropria(e.x, e.z)) return { acao: null, texto: 'terra-a-venda' };
  const fer = ferramentaDe(m, O.ferramenta);
  if (!fer) return { acao: null, texto: 'sem-ferramenta-de-limpar', dados, falta: true };
  if (forcaDe(m, fer) < O.forcaMinima) return { acao: null, texto: 'ferramenta-fraca', dados: { ...dados, item: fer }, falta: true };
  if (limpezaPrometida(m, e.id)) return { acao: null, texto: 'na-fila' };
  const junto = levaJunto(m, e), casas = [[e.x, e.z]];
  for (const id of junto) { const o = m.local.porId[id]; casas.push([o.x, o.z]); }
  dados.golpes = golpesQueFaltam(m, e); dados.n = casas.length;
  return { acao: ACAO_DA[O.ferramenta], args: junto.length ? { junto } : null, dados, casas };
}

for (const tipo of OBSTACULOS) {
  registrarTipo({
    tipo, casas: [1, 1], bloqueia: true, obstaculo: true,
    acaoPossivel: acaoNoObstaculo,
  });
}

// o obstáculo sai: rende o material (com a chance dos dados), dá a experiência e avisa
function derrubar(m, e) {
  const O = obst(m, e), itens = {};
  if (!tirarObstaculo(m, e)) return;
  if (O.chance >= 1 || m.sorteio.prox() < O.chance) for (const k in O.da) { itens[k] = O.da[k]; darItem(m, k, O.da[k], 'limpeza'); }
  m.eventos.emitir('limpou', { obstaculo: e.tipo, x: e.x, z: e.z, itens, n: 1 });
  if (O.xp > 0) darXp(m, O.xp, 'limpar');
}

function registrarLimpeza(id, ferramenta, visual, dur) {
  registrarAcao({
    id, ferramenta, dur, efeitoEm: dur * 0.6, estadoVisual: visual,
    pode(m, alvo) {
      const e = m.local.porId[alvo.entidade], O = e && m.dados.obstaculos[e.tipo];
      if (!O || O.ferramenta !== ferramenta) return NAO('nada-para-limpar');
      if (!m.local.ehPropria(e.x, e.z)) return NAO('terra-a-venda');
      const fer = ferramentaDe(m, ferramenta);
      if (fer && forcaDe(m, fer) < O.forcaMinima) return NAO('ferramenta-fraca', { obstaculo: e.tipo, nome: O.nome, funcao: ferramenta, item: fer }, true);
      // fechado por outros obstáculos: diz o que fazer, em vez de um "não dá para chegar lá"
      if (!alcancaObstaculo(m, e)) return NAO('caminho-fechado', { obstaculo: e.tipo, nome: O.nome });
      return { ok: true };
    },
    aoEfeito(m, alvo, args) {
      const loc = m.local, e = loc.porId[alvo.entidade], O = obst(m, e);
      e.dano = (e.dano || 0) + forcaDe(m, ferramentaNoCinto(m, ferramenta));
      if (e.dano < O.resistencia) {
        // ainda não saiu: mais um golpe, sem o jogador tocar de novo (a tarefa volta para a frente da fila)
        m.eventos.emitir('golpeou', { obstaculo: e.tipo, x: e.x, z: e.z, entidade: e.id, falta: golpesQueFaltam(m, e) });
        m.personagem.fila.unshift({ tipo: 'agir', acao: id, entidade: e.id, args: args || null, auto: true });
        return;
      }
      derrubar(m, e);
      if (args && args.junto) for (const outro of args.junto) { const o = loc.porId[outro]; if (o && o.tipo === e.tipo && loc.ehPropria(o.x, o.z)) derrubar(m, o); }
    },
  });
}
registrarLimpeza('rocar', 'foice', 'foice', 0.8);
registrarLimpeza('cortar', 'machado', 'machado', 0.9);
registrarLimpeza('quebrar', 'picareta', 'picareta', 1);

// tem alguma ferramenta de limpar? (o botão "Limpar" só aparece para quem tem)
export function temFerramentaDeLimpar(m) {
  const F = m.posses.ferramentas, I = m.dados.itens;
  for (const id in F) if (ACAO_DA[I[id].funcao]) return true;
  return false;
}

// modo "limpar": o toque num obstáculo já limpa em qualquer modo; neste, arrastar o dedo pinta vários de uma vez
registrarModo({
  id: 'limpar', ordem: 40, icone: 'icone/foice-velha', // (até existir a peça "ui/limpar")
  disponivel: temFerramentaDeLimpar,
  pintaEntidade: (m, e) => !!TIPOS[e.tipo].obstaculo,
  acaoNaCasa: () => null, // casa livre: só anda
});

registrarEvento('limpou', { campos: ['obstaculo', 'x', 'z', 'itens', 'n'], aceita: (dados, f) => f.obstaculo === undefined || (Array.isArray(f.obstaculo) ? f.obstaculo : [f.obstaculo]).some((o) => !!dados.obstaculos[o]) });
registrarEvento('golpeou', { campos: ['obstaculo', 'x', 'z', 'entidade', 'falta'] });

// o obstáculo mais perto da personagem que dá para limpar agora (em terra própria, com a ferramenta que ela tem,
// ainda fora da fila e com um lado livre aonde ela chega); tipos = lista de tipos que servem (null = qualquer um)
const pertos = [];
export function obstaculoPerto(m, tipos) {
  const loc = m.local, p = m.personagem;
  pertos.length = 0;
  for (const e of loc.entidades) {
    if (!TIPOS[e.tipo].obstaculo || (tipos && !tipos.includes(e.tipo)) || !loc.ehPropria(e.x, e.z)) continue;
    if (!(loc.andavel(e.x + 1, e.z) || loc.andavel(e.x - 1, e.z) || loc.andavel(e.x, e.z + 1) || loc.andavel(e.x, e.z - 1))) continue;
    pertos.push(e);
  }
  pertos.sort((a, b) => Math.hypot(a.x + 0.5 - p.x, a.z + 0.5 - p.z) - Math.hypot(b.x + 0.5 - p.x, b.z + 0.5 - p.z));
  // (o caminho só se confere nos mais próximos: o que está perto e fechado não esconde o resto, mas a conta fica curta)
  for (let k = 0, n = 0; k < pertos.length && n < 12; k++) {
    const e = pertos[k];
    if (!acaoNoObstaculo(m, e).acao) continue;
    n++;
    if (alcancaObstaculo(m, e)) return e;
  }
  return null;
}
// missão de limpar: o guia aponta o obstáculo mais perto do tipo pedido
registrarGuia('limpou', (m, f, out) => {
  const e = obstaculoPerto(m, f.obstaculo === undefined ? null : Array.isArray(f.obstaculo) ? f.obstaculo : [f.obstaculo]);
  if (!e) return null;
  out.tipo = 'entidade'; out.id = e.id;
  return out;
});
