// O começo humilde (terras.json "comeco"): a fazenda nasce com a casa velha, o poço velho, o caixote de venda na
// entrada, o baú ao lado da casa e a cerca de arame caída em volta. Não tem celeiro, banca nem quadro de pedidos:
// o celeiro e o quadro se constroem (missões do Seu Tonho), e o que é velho se reforma (construcoes.json "reforma").
// Aqui ficam:
//   - o Seu Tonho na fazenda: a entidade "vizinho", que não bloqueia nada; tocar nele é ir conversar (evento
//     conversou). Se construírem em cima do lugar dele, ele dá um passo para o lado.
//   - a chegada (só no jogo novo, quando a interface pede: comando comecarChegada): ela entra pela porteira de costas
//     para a câmera, com a trouxa, até perto do Seu Tonho, que acena uma vez. Qualquer ordem do jogador (ou o comando
//     pularChegada) termina a cena na hora; nada fica preso. Com { espera: true } ela fica parada na porteira até o
//     comando soltarChegada (a interface solta quando a tela de carregando some).
//   - a cerca: trechos na beira da terra própria (a de arame, caída aqui e ali; depois da reforma, a de madeira),
//     com o vão da entrada. Não é entidade (não bloqueia nada): o desenho é de render/comeco.js.
//   - as reformas: comando reformar { entidade | 'cerca', jaJa } (ela vai até lá e martela; o preço sai na martelada).
//     A troca da construção é de construcao.js (reformarJa); a da cerca é daqui.
//   - a gravação de antes do começo humilde (sem "comeco" na gravação) abre com a fazenda de antes: casa, poço,
//     celeiro, banca e quadro prontos, sem cerca e sem as missões do começo humilde (antesDeCarregar).
//   - o atalho de teste: quem pula para um nível ganha o que um jogador daquele nível já teria construído e reformado.
//   mundo.comeco = { humilde, chegou, chegada (a cena em curso, ou null), cerca: { tipo, obraAte, obraDur } | null,
//                    esperaDosPedidos (fator da espera das vagas do quadro: a cerca nova encurta), acenouEm, conversas }
// Eventos: conversou { entidade, n, vez }, comecouChegada { seg }, chegou { pulou }, tonhoAcenou {}, reformou { construcao, para, entidade, n }
// (o de construções sai de construcao.js), comecouObra (da cerca: { entidade: 'cerca', ... }).
import { registrarSistema, registrarAcao, registrarTipo, registrarEvento } from '../registro.js';
import { PASSO, acaso, rumoPara } from '../util.js';
import { GRAMA, CAMINHO } from '../local.js';
import { colocar, adotar, defDe, construcoesDe, reformaDe, podeReformar, reformarJa, lugarServe, estaPronta } from './construcao.js';
import { gastarOuro, oQueFalta, gastarItens } from './posses.js';
import { darXp } from './niveis.js';
import { DESLOCAMENTO } from './personagem.js';
import { acertarCapacidade } from './celeiro-dentro.js';
import { registrarGuia } from '../guia.js';

export const VIZINHO = 'vizinho'; // o id (e o tipo) do Seu Tonho na fazenda
export const CERCA = 'cerca'; // o alvo da reforma da cerca (não é entidade)
const QUADRO = 'quadro-de-pedidos';
const um = (v) => (Array.isArray(v) ? v[0] : v);

export const ehHumilde = (m) => !!(m.comeco && m.comeco.humilde);
const dadosDoComeco = (m) => m.dados.terras.comeco;

// ---------- o Seu Tonho na fazenda ----------
// ela para na frente dele (de qualquer lado), para conversar
const AO_LADO = [[0.5, 1.3], [1.3, 0.5], [-0.3, 0.5], [0.5, -0.3]];
// o desenho (render/comeco.js) preenche: (m, e, v) → a figura parada ou acenando
export const DESENHO = { vizinho: null };
registrarTipo({
  tipo: VIZINHO, casas: [1, 1], bloqueia: false, semVeu: true, altura: 2.3,
  pontos: { ficar: AO_LADO },
  acaoPossivel: (m) => (m.comeco && m.comeco.chegada ? { acao: null, texto: null } : { acao: 'conversar', dados: {} }),
  visual(m, e, v) { v.chave = 'animal/seu-tonho/parado-frente'; v.variante = 0; if (DESENHO.vizinho) DESENHO.vizinho(m, e, v); return v; },
});
registrarAcao({
  id: 'conversar', dur: 1.1, efeitoEm: 0.5, estadoVisual: 'parada',
  aoEfeito(m, alvo) {
    const C = m.comeco;
    C.conversas = (C.conversas || 0) + 1; C.acenouEm = m.agora;
    m.eventos.emitir('conversou', { entidade: alvo.entidade, n: 1, vez: C.conversas });
  },
});
// a casa (x, z) serve para ele ficar: terra própria, grama ou caminho, sem nada em cima, sem planta
function servePara(m, loc, x, z) {
  if (!loc.ehPropria(x, z)) return false;
  const i = loc.i(x, z);
  if (loc.ocupa[i] || loc.plantas[i] || (loc.chao[i] !== GRAMA && loc.chao[i] !== CAMINHO)) return false;
  for (const e of m.construcao.todas) if (e.local === loc.id && x >= e.x && x < e.x + e.l && z >= e.z && z < e.z + e.p) return false;
  return true;
}
// põe o Seu Tonho no ponto dele (ou na casa livre mais perto); devolve a entidade
function arrumarVizinho(m) {
  const loc = m.locais.fazenda, C = dadosDoComeco(m), e = loc.porId[VIZINHO];
  if (!ehHumilde(m) || !C || !C.vizinho) { if (e) loc.tirar(VIZINHO); return null; }
  if (e && servePara(m, loc, e.x, e.z)) return e;
  const [px, pz] = C.vizinho;
  let melhor = null, dm = Infinity;
  for (let r = 0; r <= 8 && !melhor; r++) for (let z = pz - r; z <= pz + r; z++) for (let x = px - r; x <= px + r; x++) {
    if (Math.max(Math.abs(x - px), Math.abs(z - pz)) !== r || !servePara(m, loc, x, z)) continue;
    const d = Math.hypot(x - px, z - pz);
    if (d < dm) { dm = d; melhor = [x, z]; }
  }
  const [x, z] = melhor || [px, pz];
  if (e && e.x === x && e.z === z) return e;
  if (e) loc.tirar(VIZINHO);
  return loc.por({ id: VIZINHO, tipo: VIZINHO, x, z });
}

// ---------- a chegada ----------
const VELOCIDADE = 2.3; // unidades/s (um pouco mais devagar que o passo normal: ela chega olhando tudo)
const PARADA = 1.4; // segundos parada no fim, com a trouxa, antes de a cena acabar
const PASSADA = 1.5; // unidades de chão por ciclo do desenho (a mesma da personagem)
function caminhoDaChegada(m) {
  const C = dadosDoComeco(m), P = m.dados.terras.pontos.personagem;
  if (!C || !C.chegada) return null;
  const pts = C.chegada.map((p) => [p[0], p[1]]), fim = pts[pts.length - 1];
  if (P && (Math.abs(fim[0] - P[0]) > 0.01 || Math.abs(fim[1] - P[1]) > 0.01)) pts.push([P[0], P[1]]);
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return { pts, total };
}
// o ponto do caminho a "d" unidades do começo, e para onde ela olha
function noCaminho(c, d, out) {
  let resta = d;
  for (let i = 1; i < c.pts.length; i++) {
    const a = c.pts[i - 1], b = c.pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (resta <= L || i === c.pts.length - 1) {
      const f = L > 0 ? Math.min(1, resta / L) : 1;
      out.x = a[0] + (b[0] - a[0]) * f; out.z = a[1] + (b[1] - a[1]) * f; out.rumo = rumoPara(a[0], a[1], b[0], b[1]);
      return out;
    }
    resta -= L;
  }
  return out;
}
const ponto = { x: 0, z: 0, rumo: 0 };
// a cena acabou (andou tudo, pulou, ou o jogador deu uma ordem): ela fica no fim do caminho, olhando o Seu Tonho
function terminarChegada(m, pulou) {
  const C = m.comeco, c = C.chegada, p = m.personagem;
  if (!c) return;
  C.chegada = null; C.chegou = true;
  const fim = c.caminho.pts[c.caminho.pts.length - 1];
  p.x = fim[0]; p.z = fim[1]; p.vel = 0; p.rota = null; p.tarefa = null; p.acao = null; p.rumando = false;
  const v = m.locais.fazenda.porId[VIZINHO];
  if (v) p.rumo = rumoPara(p.x, p.z, v.x + 0.5, v.z + 0.5);
  if (!C.acenouEm) C.acenouEm = m.agora;
  m.eventos.emitir('chegou', { pulou: !!pulou });
}
function andarNaChegada(m) {
  const C = m.comeco, c = C.chegada, p = m.personagem;
  if (!c) return;
  // (parada na porteira enquanto a interface espera a tela de carregando sumir: comecarChegada { espera })
  if (c.espera) { noCaminho(c.caminho, c.d, ponto); p.local = 'fazenda'; p.x = ponto.x; p.z = ponto.z; p.rumo = ponto.rumo; p.vel = 0; p.fila.length = 0; p.rota = null; p.tarefa = null; return; }
  c.t += PASSO;
  const antes = c.d;
  c.d = Math.min(c.caminho.total, c.d + VELOCIDADE * PASSO);
  noCaminho(c.caminho, c.d, ponto);
  p.local = 'fazenda'; p.x = ponto.x; p.z = ponto.z; p.fila.length = 0; p.rota = null; p.tarefa = null;
  if (c.d > antes) { p.rumo = ponto.rumo; p.vel = VELOCIDADE; p.fase += (VELOCIDADE * PASSO) / PASSADA; } else p.vel = 0;
  // o Seu Tonho acena quando ela passa da porteira (entra na terra própria)
  if (!c.acenou && m.locais.fazenda.ehPropria(Math.floor(p.x), Math.floor(p.z))) { c.acenou = true; C.acenouEm = m.agora; m.eventos.emitir('tonhoAcenou', {}); }
  if (c.d >= c.caminho.total) { c.parada += PASSO; if (c.parada >= PARADA) terminarChegada(m, false); }
}
// com a trouxa nas costas: a figura de andar e a de parada trocam pelas da trouxa (render/cena.js)
const visualAntes = DESLOCAMENTO.visual;
DESLOCAMENTO.visual = (m, out) => {
  if (visualAntes) visualAntes(m, out);
  if (m.comeco && m.comeco.chegada) out.estado = out.vel > 0.35 ? 'andar-trouxa' : 'parada-trouxa';
};
// as ordens que não terminam a cena (a hora do aparelho, a própria cena, o atalho da versão de teste)
const NAO_TERMINA = { fuso: 1, comecarChegada: 1, pularChegada: 1, soltarChegada: 1 };
// as que são só um toque: terminam a cena e não fazem mais nada (o toque seguinte já vale)
const SO_TOQUE = { tocarCasa: 1, tocarEntidade: 1, irPara: 1, agir: 1, rumar: 1 };

// o caminho dela, de fora até a porteira, fica livre: tira o mato, o toco, a pedra e a árvore do mato que estão na
// terra de fora (a estrada) em volta do caminho da chegada (só a figura: ninguém limpou nada)
const DO_MATO = { mato: 1, toco: 1, pedra: 1, mata: 1 };
function abrirTrilha(m) {
  const C = dadosDoComeco(m), loc = m.locais.fazenda;
  if (!C || !C.chegada) return;
  const pts = C.chegada, perto = (x, z) => {
    for (let i = 1; i < pts.length; i++) {
      const [ax, az] = pts[i - 1], [bx, bz] = pts[i], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
      const t = L2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)) : 0;
      if (Math.hypot(x - ax - dx * t, z - az - dz * t) < 1.6) return true;
    }
    return false;
  };
  for (const e of [...loc.entidades]) if (DO_MATO[e.tipo] && !loc.ehPropria(e.x, e.z) && perto(e.x + 0.5, e.z + 0.5)) loc.tirar(e.id);
}

// O lugar do celeiro (terras.json pontos.celeiro, o mesmo da fazenda de antes) fica pronto para a obra: se a casa
// grande do celeiro ali deixasse um bolsão de grama sem saída na beirada de trás (entre o mato e a cerca), o bolsão
// nasce com mato também — senão o lugar de sempre seria recusado ("fecha o caminho"). Sorteio nenhum: o mapa nasce
// sempre igual, e o mato posto aqui é como o outro (roça-se, e a gravação guarda o que saiu).
function alagar(loc, x0, z0, area) {
  const visto = new Uint8Array(loc.l * loc.p), pilha = [];
  const pode = (x, z) => loc.andavel(x, z) && !(area && x >= area[0] && z >= area[1] && x < area[2] && z < area[3]);
  if (!pode(x0, z0)) return visto;
  visto[loc.i(x0, z0)] = 1; pilha.push(x0, z0);
  while (pilha.length) {
    const z = pilha.pop(), x = pilha.pop();
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, nz = z + dz;
      if (!pode(nx, nz) || visto[loc.i(nx, nz)]) continue;
      visto[loc.i(nx, nz)] = 1; pilha.push(nx, nz);
    }
  }
  return visto;
}
function prepararLugarDoCeleiro(m) {
  const T = m.dados.terras, P = T.pontos.celeiro, casas = T.casas.celeiro, loc = m.locais.fazenda;
  if (!P || !casas || !defDe(m, 'celeiro')) return;
  const x = Math.floor(P[0]), z = Math.floor(P[1]), area = [x, z, x + casas[0], z + casas[1]];
  if (lugarServe(m, 'celeiro', x, z).motivo !== 'fecha-caminho') return;
  const ex = Math.floor(loc.entrada[0]), ez = Math.floor(loc.entrada[1]), antes = alagar(loc, ex, ez, null), depois = alagar(loc, ex, ez, area);
  for (let i = 0; i < antes.length; i++) {
    if (!antes[i] || depois[i]) continue;
    const cx = i % loc.l, cz = Math.floor(i / loc.l);
    if (cx >= area[0] && cz >= area[1] && cx < area[2] && cz < area[3]) continue;
    loc.por({ id: `mato-${cx}-${cz}`, tipo: 'mato', x: cx, z: cz, v: Math.floor(acaso(cx, cz, 23) * 4) });
  }
}

// ---------- a cerca ----------
// Os trechos: na beira entre a terra própria e a que não é, um trecho por lado de casa ({ x, z, eixo }: o apoio do
// trecho, no meio do lado; eixo 'x' corre em X, na linha z; 'z' corre em Z, na linha x), menos os do vão da entrada
// (terras.json comeco.cerca.vao: [x, z] dos trechos em X da entrada). Guardado enquanto os lotes não mudam.
const TRECHOS = new WeakMap();
export function trechosDaCerca(m) {
  const loc = m.locais.fazenda, C = dadosDoComeco(m);
  if (!C || !C.cerca || !m.comeco || !m.comeco.cerca) return null;
  const chave = m.terras.lotes.length, guardado = TRECHOS.get(m);
  if (guardado && guardado.chave === chave) return guardado.lista;
  const vao = new Set(C.cerca.vao.map((v) => v[0] + ',' + v[1])), lista = [];
  const dono = (x, z) => loc.ehPropria(x, z);
  for (let z = 0; z < loc.p; z++) for (let x = 0; x < loc.l; x++) {
    if (!dono(x, z)) continue;
    if (!dono(x, z - 1)) lista.push({ x: x + 0.5, z, eixo: 'x', cx: x, cz: z });
    if (!dono(x, z + 1) && !vao.has(x + ',' + (z + 1))) lista.push({ x: x + 0.5, z: z + 1, eixo: 'x', cx: x, cz: z + 1 });
    if (!dono(x - 1, z)) lista.push({ x, z: z + 0.5, eixo: 'z', cx: x, cz: z });
    if (!dono(x + 1, z)) lista.push({ x: x + 1, z: z + 0.5, eixo: 'z', cx: x + 1, cz: z });
  }
  // a ordem da obra da reforma: da entrada para longe (os trechos novos vão aparecendo a partir da porteira)
  const ent = C.cerca.vao.length ? C.cerca.vao[0] : [loc.entrada[0], loc.entrada[1]];
  lista.sort((a, b) => Math.hypot(a.x - ent[0], a.z - ent[1]) - Math.hypot(b.x - ent[0], b.z - ent[1]));
  lista.forEach((t, i) => { t.ordem = (i + 0.5) / lista.length; t.sorte = acaso(t.cx * 2 + (t.eixo === 'x' ? 0 : 1), t.cz, 37); });
  TRECHOS.set(m, { chave, lista });
  return lista;
}
// quanto da obra da cerca já foi feito (0..1); 1 = sem obra
export function andamentoDaCerca(m) {
  const c = m.comeco && m.comeco.cerca;
  if (!c || !(c.obraAte > 0) || !(c.obraDur > 0)) return 1;
  return Math.max(0, Math.min(1, 1 - (c.obraAte - m.agora) / (c.obraDur * 1000)));
}
// a cerca de que tipo o trecho é agora (no meio da obra, os da frente já são novos)
export function tipoDoTrecho(m, t) {
  const c = m.comeco.cerca;
  if (!(c.obraAte > 0)) return c.tipo;
  return t.ordem <= andamentoDaCerca(m) ? c.para : c.tipo;
}
const ganhoDa = (m, de) => { const r = reformaDe(m, de); return (r && r.ganho) || {}; };
function cercaPronta(m, quieto) {
  const c = m.comeco.cerca, de = c.tipo;
  c.tipo = c.para || c.tipo; c.obraAte = 0; c.obraDur = 0; c.para = null;
  aplicarGanhos(m);
  if (quieto) return;
  const r = reformaDe(m, de);
  if (r && r.xp > 0) darXp(m, r.xp, 'reformar');
  m.eventos.emitir('reformou', { construcao: de, para: c.tipo, entidade: CERCA, n: 1 });
}
function conferirCerca(m) { const c = m.comeco.cerca; if (c && c.obraAte > 0 && c.obraAte <= m.agora) cercaPronta(m, false); }
// o que a cerca reformada dá: a espera dos pedidos encolhe (construcoes.json: reforma.ganho.esperaDosPedidos)
function aplicarGanhos(m) {
  const c = m.comeco.cerca, C = dadosDoComeco(m);
  m.comeco.esperaDosPedidos = 1;
  if (c && C && C.cerca && c.tipo !== C.cerca.de) { const g = ganhoDa(m, C.cerca.de); if (g.esperaDosPedidos > 0) m.comeco.esperaDosPedidos = g.esperaDosPedidos; }
}
// dá para reformar a cerca agora? (os mesmos motivos de podeReformar)
export function podeReformarCerca(m) {
  const c = m.comeco && m.comeco.cerca, C = dadosDoComeco(m);
  if (!c || !C || !C.cerca || c.tipo !== C.cerca.de) return { ok: false, motivo: 'sem-reforma', dados: { construcao: c ? c.tipo : null } };
  const r = reformaDe(m, c.tipo);
  if (!r) return { ok: false, motivo: 'sem-reforma', dados: { construcao: c.tipo } };
  if (c.obraAte > 0) return { ok: false, motivo: 'em-obra', dados: { construcao: r.para, seg: Math.max(0, (c.obraAte - m.agora) / 1000) } };
  if ((r.nivel || 1) > m.progresso.nivel) return { ok: false, motivo: 'nivel-baixo', dados: { nivel: r.nivel, construcao: c.tipo } };
  const custo = r.custo || {};
  if (m.posses.ouro < (custo.ouro || 0)) return { ok: false, motivo: 'sem-ouro', dados: { falta: custo.ouro - m.posses.ouro, construcao: c.tipo } };
  const f = oQueFalta(m, custo.itens || {});
  if (f) return { ok: false, motivo: 'falta-material', dados: { ...f, construcao: c.tipo } };
  return { ok: true };
}
function reformarCercaJa(m, opc = {}) {
  const c = m.comeco.cerca, r = reformaDe(m, c.tipo);
  if (!r) return false;
  if (!opc.gratis) { const k = r.custo || {}; if (k.ouro > 0) gastarOuro(m, k.ouro, 'reforma'); gastarItens(m, k.itens || {}); }
  c.para = r.para;
  if (opc.pronta || !(r.obraSeg > 0)) { cercaPronta(m, !!opc.pronta); return true; }
  c.obraAte = m.agora + r.obraSeg * 1000; c.obraDur = r.obraSeg;
  m.eventos.emitir('comecouObra', { entidade: CERCA, construcao: r.para, local: 'fazenda', seg: r.obraSeg, reforma: c.tipo });
  return true;
}
// onde ela martela a reforma da cerca: a casa de dentro da entrada (ou a entrada dela no mapa)
function casaDaCerca(m) {
  const C = dadosDoComeco(m), loc = m.locais.fazenda;
  const v = C && C.cerca && C.cerca.vao.length ? C.cerca.vao[0] : null;
  if (v && loc.andavel(v[0], v[1] - 1)) return [v[0], v[1] - 1];
  return [Math.floor(loc.entrada[0]), Math.floor(loc.entrada[1])];
}

// ---------- as reformas, para o painel Construir e para o guia ----------
// [{ alvo (id da entidade ou 'cerca'), de, para, nome, nivel, custo, obraSeg, xp, ganho, pode: { ok, motivo, dados },
//    obra (segundos que faltam, 0 = sem obra) }], na ordem do nível. Só as que ainda dá para fazer (ou em obra).
export function reformas(m) {
  const out = [];
  if (!m.construcao) return out;
  for (const e of m.construcao.todas) {
    if (e.local !== 'fazenda') continue;
    const r = reformaDe(m, e.tipo);
    if (r) out.push({ alvo: e.id, de: e.tipo, para: r.para, nome: r.nome || defDe(m, r.para).nome, nivel: r.nivel || 1, custo: r.custo || {}, obraSeg: r.obraSeg || 0, xp: r.xp || 0, ganho: r.ganho || {}, pode: podeReformar(m, e), obra: 0 });
    else if (e.reforma && e.obraAte > 0) { const rv = reformaDe(m, e.reforma) || {}; out.push({ alvo: e.id, de: e.reforma, para: e.tipo, nome: rv.nome || defDe(m, e.tipo).nome, nivel: rv.nivel || 1, custo: rv.custo || {}, obraSeg: rv.obraSeg || 0, xp: rv.xp || 0, ganho: rv.ganho || {}, pode: { ok: false, motivo: 'em-obra' }, obra: Math.max(0, (e.obraAte - m.agora) / 1000) }); }
  }
  const c = m.comeco && m.comeco.cerca, C = dadosDoComeco(m);
  if (c && C && C.cerca) {
    const de = c.obraAte > 0 ? C.cerca.de : c.tipo, r = reformaDe(m, de);
    if (r && (c.tipo === C.cerca.de)) out.push({ alvo: CERCA, de, para: r.para, nome: r.nome || defDe(m, r.para).nome, nivel: r.nivel || 1, custo: r.custo || {}, obraSeg: r.obraSeg || 0, xp: r.xp || 0, ganho: r.ganho || {}, pode: podeReformarCerca(m), obra: c.obraAte > 0 ? Math.max(0, (c.obraAte - m.agora) / 1000) : 0 });
  }
  out.sort((a, b) => a.nivel - b.nivel);
  return out;
}
const podeDoAlvo = (m, alvo) => (alvo === CERCA ? podeReformarCerca(m) : podeReformar(m, m.locais.fazenda.porId[alvo]));

registrarAcao({
  id: 'reformarConstrucao', dur: 2, efeitoEm: 1.5, estadoVisual: 'martelar',
  pode: (m, alvo, args) => podeDoAlvo(m, args.alvo),
  aoEfeito(m, alvo, args) { if (args.alvo === CERCA) reformarCercaJa(m); else reformarJa(m, m.locais.fazenda.porId[args.alvo]); },
});

// ---------- a fazenda de antes do começo humilde ----------
// troca o que nasceu humilde pelo que a fazenda tinha antes (casa, celeiro, poço, banca, quadro), sem cerca nem Tonho
function tornarClassica(m) {
  const loc = m.locais.fazenda, T = m.dados.terras, C = m.construcao, M = m.comeco;
  for (const c of (T.comeco ? T.comeco.construcoes : [])) {
    const e = loc.porId[c.id];
    if (!e) continue;
    const i = C.todas.indexOf(e);
    if (i >= 0) C.todas.splice(i, 1);
    loc.tirar(c.id);
  }
  if (loc.porId[VIZINHO]) loc.tirar(VIZINHO);
  for (const c of T.classicas) if (!loc.porId[c.id] && loc.areaLivre(c.x, c.z, c.x + T.casas[c.tipo][0], c.z + T.casas[c.tipo][1])) adotar(m, loc.por({ id: c.id, tipo: c.tipo, x: c.x, z: c.z }), 'fazenda');
  const q = T.pontos[QUADRO], dq = defDe(m, QUADRO);
  if (q && dq && !loc.porId[QUADRO] && lugarServe(m, QUADRO, Math.floor(q[0]), Math.floor(q[1])).ok) colocar(m, QUADRO, Math.floor(q[0]), Math.floor(q[1]), { id: QUADRO, quieto: true });
  M.humilde = false; M.cerca = null; M.chegou = true; M.chegada = null;
  aplicarGanhos(m);
  acertarCapacidade(m);
}

// ---------- o atalho de teste: o que um jogador do nível já teria ----------
function lugarPara(m, tipo) {
  const P = m.dados.terras.pontos[tipo], loc = m.locais.fazenda, cx = P ? Math.floor(P[0]) : Math.floor(loc.entrada[0]), cz = P ? Math.floor(P[1]) : Math.floor(loc.entrada[1]);
  for (let r = 0; r < 20; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
    if (lugarServe(m, tipo, cx + dx, cz + dz, { local: 'fazenda' }).ok) return [cx + dx, cz + dz];
  }
  return null;
}
function darONivel(m, nivel) {
  if (!ehHumilde(m)) return;
  for (const tipo of ['celeiro', QUADRO]) {
    const d = defDe(m, tipo);
    if (!d || d.inicial || !d.custo || (d.nivel || 1) > nivel || construcoesDe(m, tipo).length) continue;
    const pt = lugarPara(m, tipo);
    if (pt) colocar(m, tipo, pt[0], pt[1], { quieto: true });
  }
  for (const e of [...m.construcao.todas]) { const r = reformaDe(m, e.tipo); if (r && (r.nivel || 1) <= nivel && !(e.obraAte > 0)) reformarJa(m, e, { gratis: true, pronta: true }); }
  const c = m.comeco.cerca, r = c && reformaDe(m, c.tipo);
  if (r && (r.nivel || 1) <= nivel && !(c.obraAte > 0)) reformarCercaJa(m, { gratis: true, pronta: true });
  if (m.comeco.chegada) terminarChegada(m, true);
  acertarCapacidade(m);
}

// ---------- eventos e guia ----------
registrarEvento('conversou', { campos: ['entidade', 'n', 'vez'] });
registrarEvento('chegou', { campos: ['pulou'] });
registrarEvento('comecouChegada', { campos: ['seg'] });
registrarEvento('tonhoAcenou', { campos: [] });
registrarEvento('trouxeConstrucao', { campos: ['entidade', 'de', 'para'] });
// "valeJaTer": a reforma já foi feita (não há mais a velha; a cerca já é a nova)
registrarEvento('reformou', {
  campos: ['construcao', 'para', 'entidade', 'n'],
  aceita: (dados, f) => f.construcao === undefined || [].concat(f.construcao).every((id) => !!dados.construcoes[id] && !!dados.construcoes[id].reforma),
  jaTem(m, f) {
    const de = um(f.construcao);
    if (!de) return false;
    const C = dadosDoComeco(m);
    if (C && C.cerca && C.cerca.de === de) return !!(m.comeco.cerca && m.comeco.cerca.tipo !== de && !(m.comeco.cerca.obraAte > 0));
    const r = reformaDe(m, de);
    return !!r && !construcoesDe(m, de).length && m.construcao.todas.some((e) => e.tipo === r.para && estaPronta(e));
  },
});
registrarGuia('conversou', (m, f, out) => {
  if (m.comeco.chegada) { out.tipo = null; return out; } // (durante a cena, nada de seta)
  if (!m.locais.fazenda.porId[VIZINHO] || m.personagem.local !== 'fazenda') return null;
  out.tipo = 'entidade'; out.id = VIZINHO; return out;
});
// a reforma: com obra, esperar; senão, o painel Construir com o cartão dela (data-item = "reforma:<de>")
registrarGuia('reformou', (m, f, out) => {
  const de = um(f.construcao), r = reformas(m).find((x) => x.de === de);
  if (!r) return null;
  if (r.obra > 0) { out.tipo = 'esperar'; out.seg = r.obra; return out; }
  out.tipo = 'painel'; out.painel = 'construir'; out.item = 'reforma:' + de;
  return out;
});

// ---------- o sistema ----------
registrarSistema({
  id: 'comeco',
  iniciar(m) {
    const C = dadosDoComeco(m);
    m.comeco = { humilde: !!C, chegou: !C, chegada: null, cerca: C && C.cerca ? { tipo: C.cerca.de, para: null, obraAte: 0, obraDur: 0 } : null, esperaDosPedidos: 1, acenouEm: 0, conversas: 0 };
    arrumarVizinho(m);
    abrirTrilha(m);
    if (C) prepararLugarDoCeleiro(m);
    m.eventos.ouvir('usouAtalhoDeTeste', (d) => darONivel(m, d.nivel));
  },
  passo(m) { if (m.comeco.chegada) andarNaChegada(m); conferirCerca(m); },
  segundo(m) { if (ehHumilde(m)) arrumarVizinho(m); },
  ausencia(m) { conferirCerca(m); },
  antesDoComando(m, c) {
    if (!m.comeco.chegada || NAO_TERMINA[c.tipo]) return null;
    terminarChegada(m, true);
    return SO_TOQUE[c.tipo] ? { ok: true, repetida: true, dados: { pulouChegada: true } } : null;
  },
  comandos: {
    // a interface pede no jogo novo: a cena da chegada (só uma vez, só no começo humilde)
    comecarChegada(m, c = {}) {
      const C = m.comeco, caminho = caminhoDaChegada(m);
      if (!C.humilde || C.chegou || C.chegada || !caminho) return { ok: false, motivo: 'ja-chegou' };
      const p = m.personagem;
      p.fila.length = 0; p.rota = null; p.tarefa = null; p.acao = null; p.rumando = false; p.local = 'fazenda';
      C.chegada = { t: 0, d: 0, parada: 0, acenou: false, caminho, espera: !!c.espera };
      andarNaChegada(m);
      const seg = caminho.total / VELOCIDADE + PARADA;
      m.eventos.emitir('comecouChegada', { seg });
      return { ok: true, dados: { seg } };
    },
    pularChegada(m) { if (!m.comeco.chegada) return { ok: false, motivo: 'ja-chegou' }; terminarChegada(m, true); return { ok: true }; },
    // a cena pedida com { espera: true } fica parada na porteira até este comando (a tela de carregando sumiu)
    soltarChegada(m) { const c = m.comeco.chegada; if (!c || !c.espera) return { ok: false, motivo: 'sem-espera' }; c.espera = false; return { ok: true }; },
    // reformar { entidade, jaJa }: entidade = o id da construção velha ("casa", "poco", "banca") ou "cerca"
    reformar(m, c) {
      const alvo = c.entidade, loc = m.locais.fazenda, p = m.personagem, q = !c.quieto;
      const r = podeDoAlvo(m, alvo);
      if (!r.ok) { if (q) m.eventos.emitir('faltou', { motivo: r.motivo, dados: r.dados }); return { ok: false, motivo: r.motivo, dados: r.dados }; }
      if (c.jaJa || p.local !== 'fazenda') { if (alvo === CERCA) reformarCercaJa(m); else reformarJa(m, loc.porId[alvo]); return { ok: true, dados: { naHora: true } }; }
      if (p.fila.some((t) => t.acao === 'reformarConstrucao' && t.args && t.args.alvo === alvo) || (p.tarefa && p.tarefa.acao === 'reformarConstrucao')) return { ok: true, repetida: true, dados: { naFila: true } };
      if (p.fila.length + 1 > m.dados.regras.filaMax) return { ok: false, motivo: 'fila-cheia' };
      p.rumando = false;
      if (alvo === CERCA) { const [x, z] = casaDaCerca(m); p.fila.push({ tipo: 'agir', acao: 'reformarConstrucao', x, z, args: { alvo } }); }
      else p.fila.push({ tipo: 'agir', acao: 'reformarConstrucao', entidade: alvo, args: { alvo } });
      return { ok: true, dados: { naFila: true } };
    },
  },
  antesDeCarregar(m, obj) {
    // a gravação de antes do começo humilde (ou de uma fazenda que já abriu como antes): a fazenda de antes
    const g = obj.sistemas.comeco;
    if (ehHumilde(m) && (!g || !g.humilde)) tornarClassica(m);
  },
  salvar(m) {
    const C = m.comeco, c = C.cerca;
    return { v: 1, humilde: C.humilde, chegou: true, conversas: C.conversas || 0, cerca: c ? { tipo: c.tipo, para: c.para || null, obraAte: Math.round(c.obraAte || 0), obraDur: c.obraDur || 0 } : null };
  },
  carregar(m, d) {
    const C = m.comeco;
    C.chegou = true; C.chegada = null; C.conversas = d.conversas > 0 ? Math.floor(d.conversas) : 0;
    if (C.humilde && C.cerca && d.cerca && typeof d.cerca === 'object') {
      const D = m.dados.construcoes;
      if (D[d.cerca.tipo]) C.cerca.tipo = d.cerca.tipo;
      C.cerca.para = d.cerca.para && D[d.cerca.para] ? d.cerca.para : null;
      C.cerca.obraAte = C.cerca.para && d.cerca.obraAte > 0 ? d.cerca.obraAte : 0; C.cerca.obraDur = C.cerca.obraAte ? d.cerca.obraDur || 0 : 0;
    }
    aplicarGanhos(m);
    arrumarVizinho(m);
    acertarCapacidade(m);
  },
});
