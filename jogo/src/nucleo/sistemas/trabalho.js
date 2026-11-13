// Animais de trabalho: o boi de arado, o cavalo de montaria e o jumento com a carroça e o barril de água.
// Existem para ALIVIAR o serviço: o boi ara uma fileira por toque, o cavalo cruza a fazenda sem gastar fôlego, o
// jumento leva a colheita e a água para o meio do campo. Nenhum deles pede manejo: ligou, eles acompanham.
// O contrato está em docs/jogo/ARQUITETURA.md, seção "Animais de trabalho e de estimação".
//
//   mundo.trabalho = {
//     aCavalo, levando        os dois botões: "ir a cavalo" e "levar o jumento" (gravados)
//     carroca: { item: n }    o que está na carroça (gravado)
//     barril                  regas que há no barril (gravado)
//     montada, viagem...      o que está acontecendo agora (não se grava: ao abrir o jogo ela está a pé) }
//
// O apetrecho de "exige" (arado, sela, carroça) não trava a COMPRA do bicho: trava o uso. Sem ele o modo "Arado" e os
// botões não aparecem, e a interface diz o que falta e onde comprar (evento "faltaApetrecho").
import { registrarSistema, registrarAcao, registrarModo, registrarEvento, ampliarEvento, ACOES, TIPOS } from '../registro.js';
import { PASSO, total, somar } from '../util.js';
import { GRAMA, ARADA } from '../local.js';
import { comprimento, cabe } from '../caminho.js';
import { DESLOCAMENTO, PREPAROS, filaTem } from './personagem.js';
import { AGUA_A_MAO } from './lavoura.js';
import './poco.js';
import { CARGAS, RECIPIENTES, espacoNoCesto, ferramentaNoCinto } from './posses.js';
import { VENDAVEL, jaTem } from './loja.js';
import { darXp } from './niveis.js';
import { registrarFamilia, estaTratado, defDoAnimal, abrigoDe } from './animais.js';
import { registrarGuia, guiaDoEvento } from '../guia.js';
import { soltar, recolher, bichoSolto, irAte, ficar, levar, portaDe, esperado } from './acompanhar.js';

const NAO = (motivo, dados, limpar) => ({ ok: false, motivo, dados, limpar });
const SIM = { ok: true };
const NA_FILA = { acao: null, texto: 'na-fila' };
const um = (v) => (Array.isArray(v) ? v[0] : v);

export const MONTAR_ACIMA_DE = 6; // casas: viagem mais longa que isto é feita a cavalo
const MONTA_SE_SOBRAR = 2.5; // casas que ainda faltam quando o cavalo a alcança: menos que isto, nem vale subir
const SEM_TRATO_ARA = 3; // casas por passada com o boi sem trato
const BOI_OCIOSO = 40; // segundos no modo "Arado" sem arar nada: o boi volta sozinho para o estábulo
const PERTO = 5; // casas: até aqui o jumento está "junto" (o cesto passa para a carroça)
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // a ordem de preferência das fileiras do arado, no empate
const ENTRA = 0.14; // fração da passada que o boi leva para chegar à ponta da fileira

// ---------- quem é quem ----------
const papel = (def) => (def && def.efeito ? def.efeito.tipo : null); // 'arar' | 'montaria' | 'carga'
// o bicho de trabalho deste papel (havendo mais de um, o que está tratado)
export function bichoDe(m, tipo) {
  let achou = null;
  for (const a of m.animais.lista) {
    if (a.familia !== 'trabalho' || papel(defDoAnimal(m, a)) !== tipo) continue;
    if (!achou || (!estaTratado(m, achou) && estaTratado(m, a))) achou = a;
  }
  return achou;
}
// o apetrecho que falta para este bicho trabalhar (id do item), ou null
export function faltaDe(m, a) {
  const d = defDoAnimal(m, a);
  if (d && Array.isArray(d.exige)) for (const id of d.exige) if (m.dados.itens[id] && !jaTem(m, id)) return id;
  return null;
}
// o bicho deste papel com tudo o que precisa para trabalhar, ou null
export function pronto(m, tipo) { const a = bichoDe(m, tipo); return a && !faltaDe(m, a) ? a : null; }
const temRecipiente = (m, funcao) => m.posses.recipientes.some((id) => m.dados.itens[id] && m.dados.itens[id].funcao === funcao);
const capacidadeDe = (m, funcao) => { let c = 0; for (const id of m.posses.recipientes) { const it = m.dados.itens[id]; if (it && it.funcao === funcao) c = Math.max(c, it.capacidade || 0); } return c; };
// sem trato, o jumento leva a metade (carga e água)
const fatorDoJumento = (m) => { const a = bichoDe(m, 'carga'); return a && !estaTratado(m, a) ? 0.5 : 1; };

export const podeArarComBoi = (m) => !!pronto(m, 'arar');
export const podeMontar = (m) => !!pronto(m, 'montaria');
export const podeLevar = (m) => !!pronto(m, 'carga');
export const temBarril = (m) => temRecipiente(m, 'barril');
export const capacidadeDaCarroca = (m) => Math.floor(capacidadeDe(m, 'carroca') * fatorDoJumento(m));
export const capacidadeDoBarril = (m) => Math.floor(capacidadeDe(m, 'barril') * fatorDoJumento(m));
export const naCarroca = (m) => total(m.trabalho.carroca);
// quantas casas o boi ara por passada agora (5; sem trato, 3)
export function casasPorPassada(m, a = bichoDe(m, 'arar')) {
  const d = a && defDoAnimal(m, a), n = d && d.efeito && d.efeito.casas >= 1 ? Math.round(d.efeito.casas) : 5;
  return a && !estaTratado(m, a) ? Math.min(n, SEM_TRATO_ARA) : n;
}
// a velocidade montada: a do cavalo; sem trato, a dela correndo (e continua sem gastar fôlego)
export function velocidadeMontada(m) {
  const a = bichoDe(m, 'montaria'), d = a && defDoAnimal(m, a), R = m.dados.regras;
  return a && estaTratado(m, a) && d.efeito.velocidade > 0 ? d.efeito.velocidade : R.correr;
}
// tudo o que a interface mostra, de uma vez
export function estadoDoTrabalho(m) {
  const T = m.trabalho, boi = bichoDe(m, 'arar'), cav = bichoDe(m, 'montaria'), jum = bichoDe(m, 'carga');
  return {
    boi: boi ? { animal: boi.especie, falta: faltaDe(m, boi), tratado: estaTratado(m, boi), casas: casasPorPassada(m, boi) } : null,
    cavalo: cav ? { animal: cav.especie, falta: faltaDe(m, cav), tratado: estaTratado(m, cav), ligado: T.aCavalo, montada: T.montada } : null,
    jumento: jum ? { animal: jum.especie, falta: faltaDe(m, jum), tratado: estaTratado(m, jum), ligado: T.levando, carga: naCarroca(m), capacidade: capacidadeDaCarroca(m), barril: temBarril(m) ? { agua: T.barril, capacidade: capacidadeDoBarril(m) } : null } : null,
  };
}

// ---------- a loja vende os apetrechos ----------
// arado e sela são "ferramenta" que nenhuma ação leva no cinto: vendem-se porque um bicho deste jogo os exige
const exigido = (dados, id) => !!dados.animais && Object.values(dados.animais).some((d) => d.familia === 'trabalho' && Array.isArray(d.exige) && d.exige.includes(id));
const eraVendavel = VENDAVEL.ferramenta;
VENDAVEL.ferramenta = (m, it) => exigido(m.dados, it.id) || eraVendavel(m, it);
// carroça e barril: recipientes que não mudam o cesto (a carga e a água deles moram em mundo.trabalho)
if (!RECIPIENTES.carroca) RECIPIENTES.carroca = () => {};
if (!RECIPIENTES.barril) RECIPIENTES.barril = () => {};
// a carroça descarrega e vende junto com o cesto (celeiro.js e banca.js perguntam a CARGAS)
CARGAS.push((m) => (m.trabalho && m.trabalho.levando && pronto(m, 'carga') ? m.trabalho.carroca : null));

// =====================================================================================================
// O BOI DE ARADO
// =====================================================================================================
const aravel = (loc, x, z) => { if (!loc.ehPropria(x, z)) return false; const i = z * loc.l + x; return loc.chao[i] === GRAMA && !loc.ocupa[i]; };
// a casa (x, z) já vai ser arada por uma tarefa da fila (enxada ou boi)?
function prometida(m, x, z) {
  if (filaTem(m, 'arar', x, z)) return true;
  const p = m.personagem;
  const serve = (t) => {
    if (!t || t.tipo !== 'agir' || t.acao !== 'ararComBoi') return false;
    const c = t.args.casas;
    for (let k = 0; k < c.length; k++) if (c[k][0] === x && c[k][1] === z) return true;
    return false;
  };
  if (serve(p.tarefa)) return true;
  for (let i = 0; i < p.fila.length; i++) if (serve(p.fila[i])) return true;
  return false;
}
// As casas de uma passada que começa em (x, z) e segue para "dir": a tocada e, das n - 1 seguintes, as que dá para
// arar (planta, caminho, construção, terra dos outros e casa já prometida ficam de fora, sem erro).
export function casasDaPassada(m, x, z, dir, n = casasPorPassada(m)) {
  const loc = m.local, out = [[x, z]], d = DIRS[dir];
  for (let k = 1; k < n; k++) { const cx = x + d[0] * k, cz = z + d[1] * k; if (aravel(loc, cx, cz) && !prometida(m, cx, cz)) out.push([cx, cz]); }
  return out;
}
// Para onde vai a fileira num toque simples: das quatro que saem da casa tocada, a que tem mais casas para arar;
// no empate vale a ordem fixa (+X, +Z, -X, -Z), para o toque dar sempre no mesmo.
export function direcaoDaPassada(m, x, z, n = casasPorPassada(m)) {
  let melhor = 0, conta = -1;
  for (let dir = 0; dir < 4; dir++) { const c = casasDaPassada(m, x, z, dir, n).length; if (c > conta) { conta = c; melhor = dir; } }
  return melhor;
}
// O dedo pintando: a direção é a do arrasto. A passada posta pela casa anterior do dedo, se ainda não começou,
// vira para o lado em que ele foi. Devolve a direção (ou -1 se o dedo acabou de pousar).
function arrastar(m, x, z) {
  const A = m.trabalho.arrasto, dx = x - A.x, dz = z - A.z;
  let dir = -1;
  if (m.n - A.n < 150) { if (dx === 0 && dz === 0) dir = A.dir; else if (Math.abs(dx) + Math.abs(dz) === 1) dir = DIRS.findIndex((d) => d[0] === dx && d[1] === dz); }
  if (dir >= 0 && (dx || dz)) {
    const t = m.personagem.fila.find((q) => q.tipo === 'agir' && q.acao === 'ararComBoi' && q.x === A.x && q.z === A.z);
    if (t && t.args.dir !== dir) { t.args = { casas: [[A.x, A.z]], dir }; t.args.casas = casasDaPassada(m, A.x, A.z, dir); }
  }
  A.x = x; A.z = z; A.n = m.n; A.dir = dir;
  return dir;
}

function ararCasa(m, loc, x, z) {
  if (!aravel(loc, x, z)) return false;
  loc.chao[z * loc.l + x] = ARADA; // o chão fica igual ao da enxada
  m.eventos.emitir('chaoMudou', { local: loc.id, x, z });
  m.eventos.emitir('arou', { x, z, com: 'boi' });
  const xp = m.dados.regras.xp.arar;
  if (xp > 0) darXp(m, xp, 'arar');
  return true;
}

registrarAcao({
  id: 'ararComBoi', dur: 2.5, efeitoEm: 2.4, estadoVisual: 'conduzir',
  pode(m, alvo, args) {
    if (m.personagem.local !== 'fazenda') return NAO('so-no-terreiro', null, true);
    const a = bichoDe(m, 'arar');
    if (!a) return NAO('sem-boi', null, true);
    const falta = faltaDe(m, a);
    if (falta) return NAO('falta-apetrecho', { animal: a.especie, item: falta }, true);
    const c = args && args.casas;
    if (!c || !c.length) return NAO('nao-da-para-arar');
    if (args.passada) return SIM; // a passada já começou: as casas vão sendo aradas uma a uma
    for (let k = 0; k < c.length; k++) if (aravel(m.local, c[k][0], c[k][1])) return SIM;
    return NAO('ja-arado');
  },
  // o fim da passada: o que o boi ainda não virou (a última casa) vira agora
  aoEfeito(m, alvo, args) { const c = args.casas; for (let k = 0; k < c.length; k++) ararCasa(m, m.local, c[k][0], c[k][1]); },
});

registrarModo({
  id: 'arado', ordem: 12, icone: 'icone/arado',
  disponivel: (m) => !!pronto(m, 'arar'),
  aoEscolher(m) { m.trabalho.boiOcioso = 0; },
  // c = o comando do toque (c.arrasto: o dedo está pintando); a dica e o destaque chamam sem ele
  acaoNaCasa(m, x, z, c) {
    const loc = m.local, i = z * loc.l + x;
    let dir = c && c.arrasto ? arrastar(m, x, z) : -1;
    if (loc.chao[i] === ARADA) return { acao: null, texto: 'ja-arado' };
    if (loc.chao[i] !== GRAMA || loc.ocupa[i]) return null; // caminho: só anda
    if (prometida(m, x, z)) return NA_FILA;
    const a = pronto(m, 'arar');
    if (!a) return { acao: null, texto: 'sem-boi', falta: true };
    const n = casasPorPassada(m, a);
    if (dir < 0) dir = direcaoDaPassada(m, x, z, n);
    const casas = casasDaPassada(m, x, z, dir, n);
    return { acao: 'ararComBoi', args: { casas, dir }, casas, dados: { n: casas.length, animal: a.especie } };
  },
});

// A passada, a cada passo da ação: o boi chega à ponta mais perto da fileira, puxa o arado até a outra ponta e as
// casas viram terra arada uma a uma, atrás dele. A personagem conduz de onde parou.
function passada(m, T, p, e, ac) {
  const t = p.tarefa, A = t.args, c = A.casas, d = DIRS[A.dir];
  let P = A.passada;
  if (!P) {
    const ult = c[c.length - 1], L = Math.abs(ult[0] - c[0][0]) + Math.abs(ult[1] - c[0][1]);
    const x0 = c[0][0] + 0.5, z0 = c[0][1] + 0.5, x1 = ult[0] + 0.5, z1 = ult[1] + 0.5, ex = e.x + 0.5, ez = e.z + 0.5;
    const inv = Math.hypot(ex - x1, ez - z1) < Math.hypot(ex - x0, ez - z0) - 0.01;
    P = A.passada = { L, inv, bx: ex, bz: ez, feitas: 0 };
  }
  const s = P.inv ? -1 : 1, ox = (P.inv ? c[0][0] + d[0] * P.L : c[0][0]) + 0.5, oz = (P.inv ? c[0][1] + d[1] * P.L : c[0][1]) + 0.5;
  const f = ac.t / ac.dur, rumo = Math.atan2(d[0] * s, d[1] * s);
  if (f < ENTRA) {
    const k = f / ENTRA, px = ox - d[0] * s * 0.6, pz = oz - d[1] * s * 0.6;
    levar(e, P.bx + (px - P.bx) * k, P.bz + (pz - P.bz) * k, k > 0.6 ? rumo : Math.atan2(px - P.bx, pz - P.bz));
  } else {
    const u = -0.6 + ((f - ENTRA) / (1 - ENTRA)) * (P.L + 1.6);
    levar(e, ox + d[0] * s * u, oz + d[1] * s * u, rumo);
    // a casa vira quando o boi passou dela (o arado vem logo atrás)
    while (P.feitas <= P.L && u >= P.feitas + 0.9) {
      const k = P.inv ? P.L - P.feitas : P.feitas, x = c[0][0] + d[0] * k, z = c[0][1] + d[1] * k;
      for (let j = 0; j < c.length; j++) if (c[j][0] === x && c[j][1] === z) { ararCasa(m, m.locais.fazenda, x, z); break; }
      P.feitas++;
    }
  }
  e.estado = 'puxar'; e.indo = false;
}

// =====================================================================================================
// O CAVALO
// =====================================================================================================
// A viagem a cavalo não para a personagem em momento nenhum. Ao sair para longe ela já vai correndo (sem gastar
// fôlego); o cavalo a alcança em regras.acoes.montar segundos e ela segue montada; chegou, apeia na hora e faz o que
// foi fazer, com o cavalo ao lado. regras.acoes.apear é o descanso antes de montar de novo.
const tempoDe = (m, acao, padrao) => { const v = m.dados.regras.acoes[acao]; return v > 0 ? v : padrao; };
DESLOCAMENTO.velocidade = (m) => { const T = m.trabalho; return T && T.viagem ? (T.montada ? velocidadeMontada(m) : m.dados.regras.correr) : 0; };
DESLOCAMENTO.visual = (m, out) => {
  const T = m.trabalho;
  if (!T || !T.viagem) return;
  if (T.montada) { out.estado = out.vel > 4 ? 'montada-galope' : 'montada-andar'; out.t = T.tMontada; out.p = 0; out.montada = T.figura; } else if (out.estado === 'andar' || out.estado === 'carregar') out.estado = 'correr';
};

function subir(m, T, cav) {
  T.montada = true; T.cavalgado = 0; T.tMontada = 0; T.figura = cav.especie;
  recolher(m, cav.id);
  m.eventos.emitir('montouNoCavalo', { animal: cav.especie });
}
// apeia (se estava montada) e encerra a viagem; o cavalo fica ao lado dela
function apear(m, T, p, cav) {
  const estava = T.montada;
  T.montada = false; T.viagem = false; T.embarque = 0; T.direto = 0;
  if (!estava) return;
  T.descanso = tempoDe(m, 'apear', 0.8);
  if (cav && p.local === 'fazenda') {
    // ao lado dela, do lado que couber
    const loc = m.locais.fazenda, lx = Math.cos(p.rumo), lz = -Math.sin(p.rumo);
    let x = p.x, z = p.z;
    for (const k of [0.9, -0.9]) if (cabe(loc, p.x + lx * k, p.z + lz * k)) { x = p.x + lx * k; z = p.z + lz * k; break; }
    const e = soltar(m, cav, x, z, { figura: figuraDe(m, cav) });
    e.rumo = p.rumo;
  }
  const n = Math.max(1, Math.round(T.cavalgado));
  m.eventos.emitir('apeou', { animal: cav ? cav.especie : null, n });
  m.eventos.emitir('cavalgou', { n, animal: cav ? cav.especie : null });
}

function montaria(m, T, p, fora, cav) {
  if (!cav || !fora) { if (T.viagem || T.montada) apear(m, T, p, cav); return; }
  if (T.descanso > 0) T.descanso -= PASSO;
  if (!T.viagem) {
    if (p.rota) { if (T.descanso <= 0 && comprimento(p.x, p.z, p.rota, p.rotaI) > MONTAR_ACIMA_DE) { T.viagem = true; T.embarque = tempoDe(m, 'montar', 1.2); } }
    else if (p.rumando && p.movendo) { T.direto += p.vel * PASSO; if (T.direto > MONTAR_ACIMA_DE && T.descanso <= 0) { T.viagem = true; T.embarque = 0; } } // teclas e alavanca: depois de umas casas seguidas
    else T.direto = 0;
  }
  if (T.viagem) {
    if (!p.rota && !p.rumando) apear(m, T, p, cav); // chegou (ou parou): apeia sozinha
    else if (!T.montada) {
      T.embarque -= PASSO;
      if (T.embarque <= 0) { if (p.rumando || comprimento(p.x, p.z, p.rota, p.rotaI) > MONTA_SE_SOBRAR) subir(m, T, cav); else T.embarque = 9; } // viagem quase no fim: segue a pé mesmo
    } else if (p.movendo) { T.cavalgado += p.vel * PASSO; T.tMontada += PASSO; }
  }
  if (T.montada) return;
  // a pé: o cavalo vai com ela (e corre para alcançá-la quando a viagem começa)
  const e = bichoSolto(m, cav.id) || sair(m, cav, p);
  seguir(m, e, p, T.viagem ? 0.7 : 1.5, T.viagem ? 0.9 : 2.8, 2.8, T.viagem ? 9.5 : 6.2);
  e.estado = e.vel > 3.8 ? 'galope' : e.vel > 0.3 ? 'andar' : 'parado';
}

// =====================================================================================================
// O JUMENTO: A CARROÇA E O BARRIL
// =====================================================================================================
// o barril está junto e tem água: o ponto de água mais perto é ele (lavoura.js pergunta antes de dizer "regador vazio")
function aguaAMao(m) {
  const T = m.trabalho;
  return !!T && T.levando && T.barril > 0 && m.personagem.local === 'fazenda' && temBarril(m) && !!pronto(m, 'carga');
}
AGUA_A_MAO.push(aguaAMao);
// o barril está junto e cabe mais água
function barrilPedeAgua(m) {
  const T = m.trabalho;
  return !!T && T.levando && temBarril(m) && T.barril < capacidadeDoBarril(m) && !!pronto(m, 'carga');
}
// antes de regar com o regador vazio: enche no barril (um passo a mais na fila, sem toque nenhum)
PREPAROS.push((m, p, t) => {
  if (t.acao !== 'regar' || !aguaAMao(m)) return null;
  const reg = ferramentaNoCinto(m, 'regador');
  if (!reg || m.posses.ferramentas[reg].agua > 0) return null;
  const e = bichoSolto(m, pronto(m, 'carga').id);
  return e ? { acao: 'encherNoBarril', entidade: e.id } : null;
});

registrarAcao({
  id: 'encherNoBarril', ferramenta: 'regador', dur: 1.2, efeitoEm: 0.8, estadoVisual: 'encher-no-barril',
  pode(m) {
    if (!aguaAMao(m)) return NAO('barril-vazio', null, true);
    const id = ferramentaNoCinto(m, 'regador');
    if (id && m.posses.ferramentas[id].agua >= m.dados.itens[id].capacidade) return NAO('regador-cheio');
    return SIM;
  },
  aoEfeito(m, alvo) {
    const T = m.trabalho, id = ferramentaNoCinto(m, 'regador'), f = m.posses.ferramentas[id];
    const n = Math.min(m.dados.itens[id].capacidade - f.agua, T.barril);
    f.agua += n; T.barril -= n;
    m.eventos.emitir('encheu', { item: id, n, agua: f.agua, entidade: alvo.entidade, doBarril: true, barril: T.barril });
  },
});
registrarAcao({
  id: 'encherBarril', dur: 4, efeitoEm: 3.4, estadoVisual: 'manivela',
  pode(m) {
    const T = m.trabalho;
    if (!temBarril(m)) return NAO('sem-barril', null, true);
    if (!T.levando || !pronto(m, 'carga')) return NAO('sem-jumento-junto', null, true);
    if (T.barril >= capacidadeDoBarril(m)) return NAO('barril-cheio', null, true);
    return SIM;
  },
  aoEfeito(m, alvo) {
    const T = m.trabalho, cap = capacidadeDoBarril(m), n = cap - T.barril;
    T.barril = cap;
    m.eventos.emitir('encheuBarril', { n, agua: cap, entidade: alvo.entidade });
  },
});
// o toque no poço com o regador já cheio enche o barril (com o regador vazio, enche os dois: ver "encheu" em iniciar)
if (TIPOS.poco) {
  const antes = TIPOS.poco.acaoPossivel;
  TIPOS.poco.acaoPossivel = (m, e) => {
    const r = antes(m, e);
    if (r && !r.acao && barrilPedeAgua(m)) return filaTem(m, 'encherBarril') ? NA_FILA : { acao: 'encherBarril', dados: { agua: m.trabalho.barril, capacidade: capacidadeDoBarril(m) } };
    return r;
  };
}

// o cesto encheu e o jumento está perto: passa tudo para a carroça (o que couber)
function passarParaACarroca(m, T, p, e) {
  if (espacoNoCesto(m) >= T.folgaDoCesto) return;
  if (Math.hypot(p.x - e.x - 0.5, p.z - e.z - 0.5) > PERTO) return;
  let livre = capacidadeDaCarroca(m) - total(T.carroca);
  if (livre <= 0) return;
  const c = m.posses.cesto.itens, R = m.dados.recipienteDoProduto, itens = {};
  let n = 0;
  for (const k in c) {
    if (R && R[k]) continue; // ovo e leite viajam no recipiente deles, não no cesto
    const vai = Math.min(c[k], livre);
    if (vai <= 0) break;
    somar(c, k, -vai); somar(T.carroca, k, vai);
    itens[k] = vai; livre -= vai; n += vai;
  }
  if (n > 0) m.eventos.emitir('carregouCarroca', { itens, n, total: total(T.carroca), capacidade: capacidadeDaCarroca(m) });
}

// =====================================================================================================
// ANDAR JUNTO, SAIR DO ESTÁBULO E VOLTAR
// =====================================================================================================
const pt = [0, 0];
// a espécie cuja figura o bicho usa se a dele não existir: o comum que faz o mesmo (o mangalarga usa a do cavalo)
function figuraDe(m, a) {
  const D = m.dados.animais, d = D[a.especie];
  if (!d || !d.especial) return a.especie;
  const efeito = JSON.stringify(d.efeito || 1);
  return Object.keys(D).find((k) => k !== a.especie && !D[k].especial && JSON.stringify(D[k].efeito || 1) === efeito) || a.especie.split('-')[0];
}
// o bicho aparece na porta do estábulo (sem estábulo no mapa, ao lado dela)
function sair(m, a, p) {
  const abrigo = abrigoDe(m, a);
  if (abrigo && abrigo.local === 'fazenda') portaDe(abrigo, pt); else { pt[0] = p.x; pt[1] = p.z; }
  return soltar(m, a, pt[0], pt[1], { figura: figuraDe(m, a) });
}
// vai com ela: parado, só sai do lugar quando ela se afasta mais que "larga"; andando, para a "folga" dela
function seguir(m, e, p, folga, larga, vAnda, vCorre) {
  if (esperado(m, e)) { ficar(e); e.indo = false; return; }
  const d = Math.hypot(p.x - e.x - 0.5, p.z - e.z - 0.5);
  if (!e.indo && d < larga) { ficar(e); return; }
  e.indo = irAte(m, e, p.x, p.z, folga, d > 4.5 ? vCorre : vAnda, null, true);
}
// volta sozinho para o estábulo e some lá dentro
function voltar(m, e, a) {
  const abrigo = abrigoDe(m, a);
  if (!abrigo || abrigo.local !== 'fazenda') { recolher(m, a.id); return; }
  portaDe(abrigo, pt);
  if (!irAte(m, e, pt[0], pt[1], 0.3, 3, null, true)) recolher(m, a.id);
  else e.estado = papel(defDoAnimal(m, a)) === 'arar' ? 'puxar' : 'andar';
}

// a lista de bichos mudou (compra, venda, gravação aberta): refaz as contas e desliga o que ficou sem bicho
function conferir(m) {
  const T = m.trabalho;
  T.versao = m.animais.versao;
  T.bichos = m.animais.lista.filter((a) => a.familia === 'trabalho' && papel(defDoAnimal(m, a)));
  if (T.aCavalo && !bichoDe(m, 'montaria')) T.aCavalo = false;
  if (T.levando && !bichoDe(m, 'carga')) T.levando = false;
  if (m.modo.id === 'arado' && !bichoDe(m, 'arar')) m.comando({ tipo: 'escolherModo', modo: 'mao' });
  // entidade de bicho que já não existe sai do terreiro
  for (const e of [...m.locais.fazenda.entidades]) if (e.tipo === 'bichoDeTrabalho' && !T.bichos.some((a) => a.id === e.animal)) m.locais.fazenda.tirar(e.id);
}
// o bicho que acabou de chegar não tem o apetrecho: a interface diz o que falta e onde se compra
function avisarFalta(m, a) { const falta = faltaDe(m, a); if (falta) m.eventos.emitir('faltaApetrecho', { animal: a.especie, item: falta, id: a.id }); }

registrarFamilia('trabalho', {
  // "exige" não trava a compra: o bicho pode vir antes do arado, da sela ou da carroça
  podeComprar: () => SIM,
  aoChegar(m, a) { if (m.trabalho) { m.trabalho.versao = -1; avisarFalta(m, a); } },
  aoCarregar(m) { if (m.trabalho) m.trabalho.versao = -1; },
  aoSair(m, a) { if (m.trabalho) m.trabalho.versao = -1; recolher(m, a.id); },
});

// ---------- eventos que missões e conquistas escutam ----------
// "arou" passa a dizer com quem: { com: 'boi' } (missão "boi-de-arado", conquista "junta-de-boi")
ampliarEvento('arou', { campos: ['com'], aceita: (dados, f) => (f.com === undefined ? undefined : [].concat(f.com).some((c) => c === 'boi' && !!dados.animais && Object.values(dados.animais).some((d) => papel(d) === 'arar'))) });
registrarEvento('cavalgou', { campos: ['n', 'animal'], aceita: (dados) => !!dados.animais && Object.values(dados.animais).some((d) => papel(d) === 'montaria') });
registrarEvento('carregouCarroca', { campos: ['itens', 'n', 'total'] });
registrarEvento('encheuBarril', { campos: ['n', 'agua', 'entidade'] });

// ---------- o guia das missões ----------
const idDoPapel = (dados, tipo) => { const d = Object.values(dados.animais).find((x) => papel(x) === tipo && x.preco.ouro > 0); return d ? d.id : null; };
// falta o bicho ou o apetrecho: aponta a compra. Devolve true se apontou.
function guiaDeTer(m, tipo, out) {
  const a = bichoDe(m, tipo);
  if (!a) { const id = idDoPapel(m.dados, tipo); if (!id) { out.tipo = null; return true; } guiaDoEvento(m, 'comprou', { animal: id }, out); return true; }
  const falta = faltaDe(m, a);
  if (falta) { guiaDoEvento(m, 'comprou', { item: falta }, out); return true; }
  return false;
}
// arar com o boi: comprar o que falta, escolher o modo "Arado" e tocar na grama mais perto
registrarGuia('arou', (m, f, out) => {
  if (um(f.com) !== 'boi') return null;
  if (guiaDeTer(m, 'arar', out)) return out;
  const p = m.personagem, loc = m.local;
  if (p.local !== 'fazenda') { out.tipo = null; return out; }
  if (m.modo.id !== 'arado') { out.tipo = 'modo'; out.modo = 'arado'; return out; }
  const x0 = Math.floor(p.x), z0 = Math.floor(p.z);
  let melhor = Infinity;
  out.tipo = null;
  for (let z = z0 - 9; z <= z0 + 9; z++) for (let x = x0 - 9; x <= x0 + 9; x++) {
    if (!aravel(loc, x, z) || prometida(m, x, z)) continue;
    const d = Math.hypot(x + 0.5 - p.x, z + 0.5 - p.z);
    if (d < melhor) { melhor = d; out.tipo = 'casa'; out.x = x; out.z = z; }
  }
  return out;
});
// montar: comprar o que falta, ligar "ir a cavalo" (o botão do HUD se registra como painel "ir-a-cavalo") e ir longe
registrarGuia('cavalgou', (m, f, out) => {
  if (guiaDeTer(m, 'montaria', out)) return out;
  const T = m.trabalho, p = m.personagem, loc = m.local;
  if (p.local !== 'fazenda') { out.tipo = null; return out; }
  if (!T.aCavalo) { out.tipo = 'painel'; out.painel = 'ir-a-cavalo'; out.item = null; return out; }
  if (T.viagem) { out.tipo = null; return out; }
  // uma casa livre a umas dez casas dela: a viagem até lá já é a cavalo
  const x0 = Math.floor(p.x), z0 = Math.floor(p.z);
  let melhor = Infinity;
  out.tipo = null;
  for (let z = z0 - 14; z <= z0 + 14; z++) for (let x = x0 - 14; x <= x0 + 14; x++) {
    if (!loc.andavel(x, z) || loc.plantas[z * loc.l + x]) continue;
    const d = Math.abs(Math.hypot(x + 0.5 - p.x, z + 0.5 - p.z) - 10);
    if (d < melhor) { melhor = d; out.tipo = 'casa'; out.x = x; out.z = z; }
  }
  return out;
});

const falha = (m, r, quieto) => { if (!quieto) m.eventos.emitir('faltou', { motivo: r.motivo, dados: r.dados }); return { ok: false, motivo: r.motivo, dados: r.dados }; };
// liga ou desliga um dos dois botões; c.ligado diz qual dos dois (sem ele, troca)
function botao(m, c, campo, tipo, semBicho, evento) {
  const T = m.trabalho, a = bichoDe(m, tipo), quer = c.ligado === undefined ? !T[campo] : !!c.ligado;
  if (quer) {
    if (!a) return falha(m, NAO(semBicho), c.quieto);
    const falta = faltaDe(m, a);
    if (falta) return falha(m, NAO('falta-apetrecho', { animal: a.especie, item: falta }), c.quieto);
  }
  if (T[campo] === quer) return { ok: true, repetida: true, dados: { ligado: quer } };
  T[campo] = quer;
  m.eventos.emitir(evento, { ligado: quer, animal: a ? a.especie : null });
  return { ok: true, dados: { ligado: quer } };
}

// ---------- o sistema ----------
registrarSistema({
  id: 'trabalho',
  iniciar(m) {
    let folga = 1;
    for (const c of Object.values(m.dados.culturas)) if (c.rende > folga) folga = c.rende;
    for (const a of Object.values(m.dados.arvores || {})) if (a && a.rende > folga) folga = a.rende;
    m.trabalho = {
      aCavalo: false, levando: false, carroca: {}, barril: 0,
      montada: false, viagem: false, embarque: 0, descanso: 0, direto: 0, cavalgado: 0, tMontada: 0, figura: null,
      boiOcioso: 0, arrasto: { x: -9, z: -9, n: -9999, dir: -1 }, folgaDoCesto: folga, versao: -1, bichos: [],
    };
    // a duração da passada é a do boi (animais.json: efeito.seg), se regras.json não disser outra
    const boi = Object.values(m.dados.animais).find((d) => papel(d) === 'arar');
    if (boi && boi.efeito.seg > 0) { const k = boi.efeito.seg / ACOES.ararComBoi.dur; ACOES.ararComBoi.dur *= k; ACOES.ararComBoi.efeitoEm *= k; }
    // arado e sela nunca ocupam vaga no cinto: ficam pendurados no suporte
    m.eventos.ouvir('ganhouItem', (d) => { const f = m.posses.ferramentas[d.item]; if (f && f.onde === 'cinto' && exigido(m.dados, d.item)) f.onde = 'suporte'; });
    // encheu o regador no poço com o jumento junto: o barril enche na mesma ida
    m.eventos.ouvir('encheu', (d) => {
      if (d.doBarril || !barrilPedeAgua(m) || filaTem(m, 'encherBarril') || !m.local.porId[d.entidade]) return;
      m.personagem.fila.unshift({ tipo: 'agir', acao: 'encherBarril', entidade: d.entidade, args: null, auto: true });
    });
  },

  passo(m) {
    const T = m.trabalho, p = m.personagem;
    if (T.versao !== m.animais.versao) conferir(m);
    const B = T.bichos;
    if (!B.length) return;
    const fora = p.local === 'fazenda';
    const boi = pronto(m, 'arar'), cav = T.aCavalo ? pronto(m, 'montaria') : null, jum = T.levando ? pronto(m, 'carga') : null;
    montaria(m, T, p, fora, cav);

    // o boi: fora do estábulo enquanto o modo é "Arado" ou há passada na fila
    const ac = p.acao && p.acao.id === 'ararComBoi' ? p.acao : null;
    let boiFora = false;
    if (boi && fora) {
      const naFila = !!ac || filaTem(m, 'ararComBoi');
      if (naFila) T.boiOcioso = 0; else if (m.modo.id === 'arado') T.boiOcioso += PASSO;
      boiFora = naFila || (m.modo.id === 'arado' && T.boiOcioso < BOI_OCIOSO);
      if (boiFora) {
        const e = bichoSolto(m, boi.id) || sair(m, boi, p);
        if (ac) passada(m, T, p, e, ac);
        else { seguir(m, e, p, 2.1, 3.4, 2.4, 5.2); e.estado = e.vel > 0.3 ? 'puxar' : 'parado'; }
      }
    }
    // o jumento: vai atrás dela com a carroça
    if (jum && fora) {
      const e = bichoSolto(m, jum.id) || sair(m, jum, p);
      seguir(m, e, p, 2, 3.1, 2.8, T.viagem ? 9 : 6);
      e.estado = e.vel > 0.3 ? 'andar' : 'parado';
      e.barril = temBarril(m);
      passarParaACarroca(m, T, p, e);
    }
    // quem não está em serviço e ainda está no terreiro volta para o estábulo
    for (let k = 0; k < B.length; k++) {
      const a = B[k];
      if ((a === boi && boiFora) || a === cav || a === jum) continue;
      const e = bichoSolto(m, a.id);
      if (!e) continue;
      if (fora) voltar(m, e, a); else ficar(e);
    }
  },

  comandos: {
    // irACavalo { ligado }: liga ou desliga "ir a cavalo" (sem "ligado", troca)
    irACavalo: (m, c) => botao(m, c, 'aCavalo', 'montaria', 'sem-cavalo', 'montariaMudou'),
    // levarJumento { ligado }: o jumento sai do estábulo e vai atrás dela com a carroça
    levarJumento: (m, c) => botao(m, c, 'levando', 'carga', 'sem-jumento', 'jumentoMudou'),
  },

  salvar(m) { const T = m.trabalho; return { aCavalo: T.aCavalo, levando: T.levando, carroca: { ...T.carroca }, barril: T.barril }; },
  // gravação de antes desta frente não traz este sistema: vale o que iniciar() montou
  carregar(m, d) {
    const T = m.trabalho, I = m.dados.itens;
    T.aCavalo = !!d.aCavalo; T.levando = !!d.levando;
    T.carroca = {};
    for (const k in d.carroca || {}) if (I[k] && d.carroca[k] > 0) T.carroca[k] = d.carroca[k];
    T.barril = d.barril > 0 ? d.barril : 0;
    T.versao = -1;
  },
});
