// A lavoura: enxada (grama ou campo vira terra arada), semear, regar, crescer e colher.
// O campo de plantação: a fazenda já nasce com um (terras.json: inicial.campo). Arou uma vez, é campo para sempre:
// colheu, a casa vira CAMPO (terra de plantio sem sulco, nunca grama) e pede a enxada de novo antes de plantar.
// Arar grama livre aumenta o campo. podeArar() diz onde a enxada (ou o arado do boi) pode passar.
// Fileira: as casas de campo seguidas ao longo de X; o comando "fileira" enfileira a ação do modo em toda ela.
// Regra da água: a cultura pede "regas" regas até ficar pronta. Cada rega molha a terra e faz a planta crescer
// um trecho (tempoSeg / regas); acabou o trecho, a terra seca e a planta espera a próxima rega. Nunca morre.
// O crescimento guarda instantes absolutos (secaEm), então o tempo fora do jogo se resolve por conta, sem simular.
// Regador com "area" (crivo, cobre) molha várias casas em linha com uma rega só: casasDaRega() diz quais.
// Dois ganchos para as outras frentes, sem editar este arquivo:
//   PLANTIOS      o que o modo "semear" planta além de semente de cultura (as mudas de árvore entram por aqui)
//   REGA_SOZINHA  quem rega uma casa sem a personagem (o aspersor): a planta emenda um trecho no outro
import { registrarSistema, registrarAcao, registrarModo, registrarAutomatico, registrarEvento, MODOS } from '../registro.js';
import { GRAMA, ARADA, CAMPO, deLavoura } from '../local.js';
import { somar } from '../util.js';
import { espacoNoCesto, porNoCesto, ferramentaNoCinto, ferramentaNoSuporte } from './posses.js';
import { darXp } from './niveis.js';
import { filaTem, contarNaFila } from './personagem.js';
import { campoInicial } from './terras.js';

// dá para arar a casa (x, z)? Grama livre ou campo livre, em terra própria (sem entidade nem planta em cima).
// Não olha a fila de tarefas. Quem ara (a enxada, o arado do boi) usa esta mesma conta.
export function podeArar(m, x, z, loc = m.local) {
  if (!loc.dentro(x, z)) return false;
  const i = z * loc.l + x, c = loc.chao[i];
  return (c === GRAMA || c === CAMPO) && loc.propria[i] === 1 && !loc.ocupa[i] && !loc.plantas[i];
}

// planta = { cultura, feitas, secaEm }
//   feitas: regas cujo trecho de crescimento já terminou (0..regas); feitas = regas → pronta
//   secaEm: instante (ms) em que a rega atual acaba; 0 = terra seca (com sede, ou pronta)
const cult = (m, pl) => m.dados.culturas[pl.cultura];
const trechoMs = (c) => (c.tempoSeg * 1000) / c.regas;

// Quem rega sozinho: cada função responde (mundo, local, índice da casa) → true se a casa é regada sem a personagem.
// Com rega sozinha a planta não espera: acabou um trecho, o seguinte começa no mesmo instante (vale também fora do jogo).
export const REGA_SOZINHA = [];
function regadaSozinha(m, loc, i) { for (let k = 0; k < REGA_SOZINHA.length; k++) if (REGA_SOZINHA[k](m, loc, i)) return true; return false; }

// põe a planta em dia com o relógio; devolve true se mudou de estado
export function resolver(m, loc, i) {
  const pl = loc.plantas[i];
  if (!pl || pl.secaEm === 0 || m.agora < pl.secaEm) return false;
  const c = cult(m, pl);
  pl.feitas++;
  // regada sozinha: emenda os trechos que couberem até agora, cada um a partir do instante em que o anterior acabou
  if (pl.feitas < c.regas && REGA_SOZINHA.length && regadaSozinha(m, loc, i)) {
    let seca = pl.secaEm + trechoMs(c);
    while (seca <= m.agora && pl.feitas + 1 < c.regas) { pl.feitas++; seca += trechoMs(c); }
    if (seca > m.agora) { pl.secaEm = seca; return true; }
    pl.feitas++;
  }
  pl.secaEm = 0;
  const x = i % loc.l, z = (i - x) / loc.l;
  m.eventos.emitir('chaoMudou', { local: loc.id, x, z });
  m.eventos.emitir(pl.feitas >= c.regas ? 'amadureceu' : 'secou', { local: loc.id, x, z, cultura: pl.cultura });
  return true;
}
function resolverTudo(m) {
  for (const id in m.locais) { const loc = m.locais[id], L = loc.plantadas; for (let k = 0; k < L.length; k++) resolver(m, loc, L[k]); }
}

// 'sede' | 'crescendo' | 'pronta'
export function estadoDaPlanta(m, pl) {
  const c = cult(m, pl);
  if (pl.feitas >= c.regas) return 'pronta';
  if (pl.secaEm === 0) return 'sede';
  return m.agora < pl.secaEm ? 'crescendo' : (pl.feitas + 1 >= c.regas ? 'pronta' : 'sede'); // já venceu, falta só o "segundo" registrar
}
// quanto já cresceu, de 0 a 1
export function progressoDaPlanta(m, pl) {
  const c = cult(m, pl);
  if (pl.feitas >= c.regas) return 1;
  const parte = pl.secaEm === 0 ? 0 : Math.min(1, 1 - (pl.secaEm - m.agora) / trechoMs(c));
  return (pl.feitas + parte) / c.regas;
}
// estágio do desenho: 1 (semente) .. estagios (pronta)
export function estagioDaPlanta(m, pl) {
  const c = cult(m, pl), p = progressoDaPlanta(m, pl);
  return p >= 1 ? c.estagios : Math.min(c.estagios - 1, 1 + Math.floor(p * (c.estagios - 1)));
}
// segundos até a rega atual acabar (0 se está seca ou pronta)
export function segundosDeAgua(m, pl) { return pl.secaEm > m.agora ? (pl.secaEm - m.agora) / 1000 : 0; }
export function plantaEm(m, x, z) { const loc = m.local; return loc.dentro(x, z) ? loc.plantas[z * loc.l + x] : null; }
// a terra desta casa está molhada agora?
export function molhada(m, loc, i) { const pl = loc.plantas[i]; return !!pl && pl.secaEm > m.agora; }
// a semente escolhida que a personagem ainda tem (descontando as já prometidas na fila)
export function sementesLivres(m, semente) { return (m.posses.bolsa[semente] || 0) - contarNaFila(m, 'semear', (t) => t.args && t.args.semente === semente); }
// o instante (ms) do próximo acontecimento da lavoura (uma planta secar ou amadurecer), ou null
export function proximoAcontecimento(m) {
  let menor = null;
  for (const id in m.locais) { const loc = m.locais[id]; for (const i of loc.plantadas) { const s = loc.plantas[i].secaEm; if (s > 0 && (menor === null || s < menor)) menor = s; } }
  return menor;
}

// molha a casa a partir do instante "desde" (ms): a planta com sede começa mais um trecho. Devolve true se molhou.
export function molharCasa(m, loc, i, desde) {
  const pl = loc.plantas[i];
  if (!pl || pl.secaEm !== 0 || pl.feitas >= cult(m, pl).regas) return false;
  pl.secaEm = desde + trechoMs(cult(m, pl));
  const x = i % loc.l, z = (i - x) / loc.l;
  m.eventos.emitir('chaoMudou', { local: loc.id, x, z });
  resolver(m, loc, i); // se o trecho já venceu (rega contada desde o passado), a planta segue em frente
  return true;
}

// ---------- o que mais o modo "semear" planta ----------
// { serve(dados, item) → bool, acaoNaCasa(mundo, x, z, item) → como a de um modo, aoEscolher(mundo, item), produz(dados, item) → bool }
//   "serve" diz se o item escolhido na barra de sementes é deste plantio (uma muda); "produz", se um item é fruto dele
export const PLANTIOS = [];
const plantioDe = (D, item) => { for (let k = 0; k < PLANTIOS.length; k++) if (PLANTIOS[k].serve(D, item)) return PLANTIOS[k]; return null; };
// o item se planta pelo modo "semear"? (semente de cultura ou o que um plantio registrado aceita)
export const plantavel = (D, item) => !!item && (!!D.culturaDaSemente[item] || !!plantioDe(D, item));

// ---------- rega com área ----------
// quantas casas em linha o regador da personagem molha numa rega (1 = só a casa tocada)
export function areaDaRega(m) {
  const reg = ferramentaNoCinto(m, 'regador') || ferramentaNoSuporte(m, 'regador'), a = reg ? m.dados.itens[reg].area : 1;
  return a >= 1 ? Math.round(a) : 1;
}
// a casa (x, z) já vai ser molhada por uma rega da fila (a dela mesma ou a de uma vizinha, com regador de área)?
export function regaPrometida(m, x, z) {
  const p = m.personagem;
  const serve = (t) => {
    if (!t || t.tipo !== 'agir' || t.acao !== 'regar') return false;
    if (t.x === x && t.z === z) return true;
    const c = t.args && t.args.casas;
    if (c) for (let k = 0; k < c.length; k++) if (c[k][0] === x && c[k][1] === z) return true;
    return false;
  };
  if (serve(p.tarefa) && !(p.acao && p.acao.feito)) return true;
  for (let i = 0; i < p.fila.length; i++) if (serve(p.fila[i])) return true;
  return false;
}
const temSede = (m, loc, x, z) => { if (!loc.dentro(x, z)) return false; const pl = loc.plantas[z * loc.l + x]; return !!pl && estadoDaPlanta(m, pl) === 'sede'; };
// As casas que uma rega em (x, z) molha: a própria e, com regador de área, as vizinhas com sede na mesma linha.
// Das linhas possíveis (ao longo de X ou de Z, com a casa tocada em qualquer posição), vale a que molha mais casas;
// no empate, a mais centrada, ao longo de X. Devolve [[x, z], ...] com a casa tocada primeiro.
export function casasDaRega(m, x, z, area = areaDaRega(m)) {
  const out = [[x, z]];
  if (area <= 1) return out;
  const loc = m.local, meio = (area - 1) / 2;
  let melhor = 0, bx = 1, bk = 0, bd = Infinity;
  for (let eixo = 0; eixo < 2; eixo++) for (let k = 0; k < area; k++) {
    let n = 0;
    for (let j = 0; j < area; j++) {
      const cx = x + (eixo ? 0 : j - k), cz = z + (eixo ? j - k : 0);
      if ((cx !== x || cz !== z) && temSede(m, loc, cx, cz) && !regaPrometida(m, cx, cz)) n++;
    }
    const d = Math.abs(k - meio);
    if (n > melhor || (n === melhor && n > 0 && d < bd)) { melhor = n; bx = eixo ? 0 : 1; bk = k; bd = d; }
  }
  if (!melhor) return out;
  for (let j = 0; j < area; j++) {
    const cx = x + (bx ? j - bk : 0), cz = z + (bx ? 0 : j - bk);
    if ((cx !== x || cz !== z) && temSede(m, loc, cx, cz) && !regaPrometida(m, cx, cz)) out.push([cx, cz]);
  }
  return out;
}

const idx = (m, alvo) => alvo.z * m.local.l + alvo.x;
const NAO = (motivo, dados, limpar) => ({ ok: false, motivo, dados, limpar });
const SIM = { ok: true };

registrarAcao({
  id: 'arar', ferramenta: 'enxada', dur: 1.1, efeitoEm: 0.7, estadoVisual: 'enxadar',
  pode(m, alvo) {
    const loc = m.local, i = idx(m, alvo);
    if (!loc.ehPropria(alvo.x, alvo.z)) return NAO('terra-a-venda');
    if (!podeArar(m, alvo.x, alvo.z, loc)) return NAO(loc.chao[i] === ARADA ? 'ja-arado' : 'nao-da-para-arar');
    return SIM;
  },
  aoEfeito(m, alvo) {
    const loc = m.local;
    loc.chao[idx(m, alvo)] = ARADA;
    m.eventos.emitir('chaoMudou', { local: loc.id, x: alvo.x, z: alvo.z });
    m.eventos.emitir('arou', { x: alvo.x, z: alvo.z });
  },
});

registrarAcao({
  id: 'semear', ajudante: 'plantadeira', dur: 0.7, efeitoEm: 0.45, estadoVisual: 'semear',
  pode(m, alvo, args) {
    const loc = m.local, i = idx(m, alvo), s = args && args.semente, c = m.dados.culturas[m.dados.culturaDaSemente[s]];
    if (!c) return NAO('sem-semente-escolhida', null, true);
    if (loc.chao[i] !== ARADA) return NAO('arar-antes');
    if (loc.plantas[i]) return NAO('ja-plantado');
    if (c.nivel > m.progresso.nivel) return NAO('nivel-baixo', { nivel: c.nivel, item: s }, true);
    if (!(m.posses.bolsa[s] > 0)) return NAO('sem-sementes', { item: s }, true);
    return SIM;
  },
  aoEfeito(m, alvo, args) {
    const loc = m.local, i = idx(m, alvo), c = m.dados.culturaDaSemente[args.semente];
    somar(m.posses.bolsa, args.semente, -1);
    loc.plantas[i] = { cultura: c, feitas: 0, secaEm: 0 };
    loc.plantadas.push(i);
    m.eventos.emitir('plantou', { cultura: c, item: args.semente, x: alvo.x, z: alvo.z });
  },
});

registrarAcao({
  id: 'regar', ferramenta: 'regador', dur: 0.8, efeitoEm: 0.4, estadoVisual: 'regar',
  // args.casas (opcional) = as casas que esta rega molha, escolhidas na hora do toque; vale o que ainda tiver sede
  pode(m, alvo, args) {
    const loc = m.local, i = idx(m, alvo);
    resolver(m, loc, i);
    const pl = loc.plantas[i], c = args && args.casas;
    let sede = !!pl && estadoDaPlanta(m, pl) === 'sede';
    // a casa tocada já não tem sede (outra rega de área passou por ela): vale se alguma das outras ainda tem
    if (!sede && c) for (let k = 1; k < c.length && !sede; k++) { if (loc.dentro(c[k][0], c[k][1])) resolver(m, loc, c[k][1] * loc.l + c[k][0]); sede = temSede(m, loc, c[k][0], c[k][1]); }
    if (!sede) return NAO(!pl ? 'nada-para-regar' : estadoDaPlanta(m, pl) === 'pronta' ? 'ja-pronta' : 'ja-regada');
    const reg = ferramentaNoCinto(m, 'regador');
    if (reg && !(m.posses.ferramentas[reg].agua > 0)) return NAO('regador-vazio', null, true);
    return SIM;
  },
  aoEfeito(m, alvo, args) {
    const loc = m.local, reg = m.posses.ferramentas[ferramentaNoCinto(m, 'regador')];
    const casas = (args && args.casas) || [[alvo.x, alvo.z]];
    reg.agua--; // uma rega só, quantas casas ela molhar
    let n = 0;
    for (let k = 0; k < casas.length; k++) {
      const x = casas[k][0], z = casas[k][1];
      if (!temSede(m, loc, x, z)) continue;
      const i = z * loc.l + x, pl = loc.plantas[i];
      pl.secaEm = m.agora + trechoMs(cult(m, pl));
      m.eventos.emitir('chaoMudou', { local: loc.id, x, z });
      m.eventos.emitir('regou', { cultura: pl.cultura, x, z, agua: reg.agua, junto: n++ });
    }
  },
});

registrarAcao({
  id: 'colher', dur: 0.7, efeitoEm: 0.45, estadoVisual: 'colher',
  pode(m, alvo) {
    const loc = m.local, i = idx(m, alvo);
    resolver(m, loc, i);
    const pl = loc.plantas[i];
    if (!pl) return NAO('nada-para-colher');
    if (estadoDaPlanta(m, pl) !== 'pronta') return NAO('ainda-crescendo');
    if (espacoNoCesto(m) < cult(m, pl).rende) return NAO('cesto-cheio', null, true);
    return SIM;
  },
  aoEfeito(m, alvo) {
    const loc = m.local, i = idx(m, alvo), pl = loc.plantas[i], c = cult(m, pl);
    porNoCesto(m, c.produto, c.rende);
    loc.plantas[i] = null;
    loc.plantadas.splice(loc.plantadas.indexOf(i), 1);
    if (m.dados.regras.reararAposColher) loc.chao[i] = CAMPO; // segue campo (nunca grama), mas pede a enxada antes de plantar de novo
    m.eventos.emitir('chaoMudou', { local: loc.id, x: alvo.x, z: alvo.z });
    m.eventos.emitir('colheu', { cultura: c.id, item: c.produto, n: c.rende, x: alvo.x, z: alvo.z });
    darXp(m, c.xp, 'colher');
  },
});

// ---------- modos da barra ----------
registrarModo({
  id: 'enxada', ordem: 10, ferramenta: 'enxada',
  acaoNaCasa(m, x, z) {
    const loc = m.local, i = z * loc.l + x;
    if (podeArar(m, x, z)) return filaTem(m, 'arar', x, z) ? { acao: null, texto: 'na-fila' } : { acao: 'arar' };
    if (loc.chao[i] === ARADA) return { acao: null, texto: 'ja-arado' };
    return null; // caminho, casa ocupada: só anda
  },
});

registrarModo({
  id: 'semear', ordem: 20,
  // escolheu o modo sem semente (ou a escolhida acabou): fica com a primeira que houver na bolsa
  aoEscolher(m) {
    const B = m.posses.bolsa, outro = plantioDe(m.dados, m.modo.semente);
    if (outro && B[m.modo.semente] > 0) { if (outro.aoEscolher) outro.aoEscolher(m, m.modo.semente); return; }
    if (outro) m.modo.semente = null; // a muda acabou: volta para as sementes
    if (m.modo.semente && B[m.modo.semente] > 0) return;
    const tem = m.dados.loja.ouro.find((id) => m.dados.culturaDaSemente[id] && B[id] > 0) || Object.keys(B).find((id) => m.dados.culturaDaSemente[id]);
    if (tem) m.modo.semente = tem;
    else if (!m.modo.semente) m.modo.semente = m.dados.loja.ouro.find((id) => m.dados.culturaDaSemente[id] && m.dados.itens[id].nivel <= m.progresso.nivel) || null;
  },
  acaoNaCasa(m, x, z) {
    const loc = m.local, i = z * loc.l + x, s = m.modo.semente, outro = plantioDe(m.dados, s);
    if (outro) return outro.acaoNaCasa(m, x, z, s); // muda de árvore: quem responde é o plantio dela
    if (loc.plantas[i]) return { acao: null, texto: 'ja-plantado' };
    if (filaTem(m, 'semear', x, z)) return { acao: null, texto: 'na-fila' };
    if (loc.chao[i] !== ARADA && !filaTem(m, 'arar', x, z)) return podeArar(m, x, z) ? { acao: null, texto: 'arar-antes' } : null;
    if (!s || !m.dados.culturaDaSemente[s]) return { acao: null, texto: 'sem-semente-escolhida', falta: true };
    if (sementesLivres(m, s) <= 0) return { acao: null, texto: 'sem-sementes', dados: { item: s }, falta: true };
    return { acao: 'semear', args: { semente: s }, dados: { item: s } };
  },
});

// a rega de um toque em (x, z): as casas que ela molha vão em args (a fila sabe o que já está prometido) e em "casas"
// (a interface marca todas antes de a ação acontecer)
function rega(m, x, z, dados) {
  const casas = casasDaRega(m, x, z);
  return casas.length > 1 ? { acao: 'regar', args: { casas }, casas, dados: { ...dados, n: casas.length } } : { acao: 'regar', dados };
}

registrarModo({
  id: 'regar', ordem: 30, ferramenta: 'regador',
  acaoNaCasa(m, x, z) {
    const loc = m.local, i = z * loc.l + x;
    resolver(m, loc, i);
    const pl = loc.plantas[i];
    if (!pl) return filaTem(m, 'semear', x, z) ? { acao: 'regar' } : deLavoura(loc.chao[i]) ? { acao: null, texto: 'nada-para-regar' } : null;
    const e = estadoDaPlanta(m, pl);
    if (e === 'sede') return regaPrometida(m, x, z) ? { acao: null, texto: 'na-fila' } : semAgua(m) ? { acao: null, texto: 'regador-vazio', falta: true } : rega(m, x, z, { cultura: pl.cultura });
    return { acao: null, texto: e === 'pronta' ? 'ja-pronta' : 'ja-regada', dados: { cultura: pl.cultura, seg: segundosDeAgua(m, pl) } };
  },
});

// AGUA_A_MAO.push((m) → bool): há água ao alcance sem ir ao poço (o barril na carroça do jumento: sistemas/trabalho.js)
export const AGUA_A_MAO = [];
// o regador do cinto não tem água para mais uma rega além das que já estão na fila? (com ida ao poço na fila, tem)
function semAgua(m) {
  const reg = ferramentaNoCinto(m, 'regador');
  for (let i = 0; i < AGUA_A_MAO.length; i++) if (AGUA_A_MAO[i](m)) return false;
  if (!reg || filaTem(m, 'encher')) return false; // sem regador no cinto ela vai buscar; a conta se faz lá
  return m.posses.ferramentas[reg].agua - contarNaFila(m, 'regar') <= 0;
}

// modo "mão": rega o que tem sede, colhe o que está pronto
registrarAutomatico((m, x, z) => {
  const loc = m.local, i = z * loc.l + x;
  resolver(m, loc, i);
  const pl = loc.plantas[i];
  if (!pl) return loc.chao[i] === ARADA ? { acao: null, texto: 'terra-arada-vazia' } : loc.chao[i] === CAMPO ? { acao: null, texto: 'campo-sem-sulco' } : null;
  const e = estadoDaPlanta(m, pl);
  if (e === 'pronta') return { acao: 'colher', dados: { cultura: pl.cultura } };
  if (e === 'sede') return regaPrometida(m, x, z) ? { acao: null, texto: 'na-fila' } : semAgua(m) ? { acao: null, texto: 'regador-vazio', falta: true } : rega(m, x, z, { cultura: pl.cultura });
  // crescendo: o toque só informa (não anda até lá nem desmancha a fila)
  return { acao: null, texto: 'crescendo', info: true, dados: { cultura: pl.cultura, seg: segundosDeAgua(m, pl) } };
});

// ---------- a fileira ----------
// As casas de campo (arada ou sem sulco) seguidas na linha z, ao longo de X, que passam pela casa (x, z), em ordem a
// partir da ponta mais perto da personagem. Casa que não é de campo: lista vazia.
// segurar o dedo na casa (x, z) faz alguma fileira no modo ativo? (na lavoura, sempre; o modo com a fileira dele decide)
export function podeSegurar(m, x, z) {
  const modo = MODOS[m.modo.id];
  if (!m.local.dentro(x, z)) return false;
  return modo && modo.fileira ? !!modo.fileira(m, x, z) : deLavoura(m.local.chao[z * m.local.l + x]);
}
export function casasDaFileira(m, x, z, loc = m.local) {
  const serve = (cx) => loc.dentro(cx, z) && loc.propria[z * loc.l + cx] === 1 && !loc.ocupa[z * loc.l + cx] && deLavoura(loc.chao[z * loc.l + cx]);
  if (!serve(x)) return [];
  let a = x, b = x;
  while (serve(a - 1)) a--;
  while (serve(b + 1)) b++;
  const out = [], p = m.personagem, daPontaA = p.local !== loc.id || Math.abs(p.x - (a + 0.5)) <= Math.abs(p.x - (b + 0.5));
  for (let k = 0; k <= b - a; k++) out.push([daPontaA ? a + k : b - k, z]);
  return out;
}
// O que segurar o dedo na casa (x, z) faria na fileira dela, no modo ativo, sem mexer em nada:
//   { casas: [[x, z]...] toda a fileira, alvo: [[x, z, acao]...] as que entram na fila, n, acao (a mais comum),
//     molha: [[x, z]...] casas que as regas de área molham junto, motivo (por que parou antes do fim, ou por que nada) }
// A conta é a mesma do toque arrastando casa por casa: cada ação escolhida entra numa fila de mentira, para que a
// próxima casa já desconte a semente, a água e a vaga da fila; no fim a fila volta a ser a de antes.
// O modo que tem a fileira dele (registrarModo({ fileira(m, x, z) })) responde por ela: o Arado mostra a fileira do boi
// (até o limite do arado, no eixo com mais casas para arar, também na grama) e a faz numa tarefa só ("umaTarefa").
export function fileiraDe(m, x, z) {
  const modo = MODOS[m.modo.id];
  if (modo && modo.fileira) return modo.fileira(m, x, z);
  const casas = casasDaFileira(m, x, z);
  if (!casas.length) return null;
  const p = m.personagem, fila = p.fila, n0 = fila.length, max = m.dados.regras.filaMax;
  const alvo = [], molha = [], conta = {};
  let motivo = null, acao = null;
  if (!modo) return { casas, alvo, molha, n: 0, acao, motivo: 'nada-aqui' };
  try {
    for (const [cx, cz] of casas) {
      const d = modo.acaoNaCasa(m, cx, cz, { x: cx + 0.5, z: cz + 0.5, arrasto: true });
      if (!d || d.texto === 'na-fila') continue;
      if (d.acao) {
        if (fila.length >= max) { motivo = 'fila-cheia'; break; }
        fila.push({ tipo: 'agir', acao: d.acao, x: cx, z: cz, args: d.args || null });
        alvo.push([cx, cz, d.acao]);
        if (d.casas) for (let k = 1; k < d.casas.length; k++) molha.push(d.casas[k]);
        conta[d.acao] = (conta[d.acao] || 0) + 1;
        if (!acao || conta[d.acao] > conta[acao]) acao = d.acao;
      } else if (d.falta && !motivo) motivo = d.texto;
    }
  } finally { fila.length = n0; }
  return { casas, alvo, molha, n: alvo.length, acao, motivo: alvo.length ? motivo : motivo || 'fileira-em-dia' };
}

registrarEvento('fileira', { campos: ['acao', 'n', 'z'] });
registrarEvento('arou', { campos: ['x', 'z'] });
// "plantou" e "colheu" valem também para o que os plantios registrados plantam e dão (muda e fruta de árvore levam "arvore")
registrarEvento('plantou', { campos: ['cultura', 'item', 'x', 'z', 'arvore'], aceita: (dados, f) => naLista(f.item, (s) => plantavel(dados, s)) && naLista(f.cultura, (c) => !!dados.culturas[c]) });
registrarEvento('regou', { campos: ['cultura', 'x', 'z', 'agua'] });
registrarEvento('colheu', { campos: ['cultura', 'item', 'n', 'x', 'z', 'arvore'], aceita: (dados, f) => naLista(f.item, (it) => Object.values(dados.culturas).some((c) => c.produto === it) || PLANTIOS.some((p) => p.produz && p.produz(dados, it))) && naLista(f.cultura, (c) => !!dados.culturas[c]) });
// o valor pedido pelo filtro (um só ou uma lista de "qualquer um destes") existe para este jogo?
function naLista(v, existe) { return v === undefined || (Array.isArray(v) ? v.some(existe) : existe(v)); }

// Gravação, formato 2: { formato: 2, locais: { fazenda: { campo: [índice...], arada: [[índice, cultura, feitas, secaEm] | [índice]...] } } }
// (o formato 1, das gravações de antes do campo de plantação, era { fazenda: [[índice, ...]...] }: só a terra arada).
export const FORMATO_DA_LAVOURA = 2;
// a casa gravada ainda serve para campo? (o mapa pode ter mudado: construção, árvore ou caminho em cima)
const servePara = (loc, i) => i >= 0 && i < loc.chao.length && (loc.chao[i] === GRAMA || loc.chao[i] === CAMPO) && !loc.ocupa[i];
function arada(m, loc, [i, cultura, feitas, secaEm]) {
  if (!servePara(loc, i)) return;
  loc.chao[i] = ARADA;
  if (cultura && m.dados.culturas[cultura]) { loc.plantas[i] = { cultura, feitas: Math.min(feitas || 0, m.dados.culturas[cultura].regas), secaEm: secaEm || 0 }; loc.plantadas.push(i); }
}

registrarSistema({
  id: 'lavoura',
  segundo: resolverTudo,
  ausencia: resolverTudo,
  // grava só o que é campo: as casas sem sulco e as aradas, com a planta [índice, cultura, feitas, secaEm]
  salvar(m) {
    const locais = {};
    for (const id in m.locais) {
      const loc = m.locais[id], campo = [], arada = [];
      for (let i = 0; i < loc.chao.length; i++) {
        if (loc.chao[i] === CAMPO) campo.push(i);
        else if (loc.chao[i] === ARADA) { const pl = loc.plantas[i]; arada.push(pl ? [i, pl.cultura, pl.feitas, Math.round(pl.secaEm)] : [i]); }
      }
      if (campo.length || arada.length || id === 'fazenda') locais[id] = { campo, arada };
    }
    return { formato: FORMATO_DA_LAVOURA, locais };
  },
  // roda depois das terras (o campo inicial já está marcado) e das construções (debaixo delas o campo já virou grama)
  carregar(m, d) {
    if (d && d.formato >= 2 && d.locais && typeof d.locais === 'object') {
      for (const id in d.locais) {
        const loc = m.locais[id], g = d.locais[id];
        if (!loc || !g) continue;
        // o campo gravado manda: casa do campo inicial que não está na gravação deixou de ser campo (vira grama)
        if (id === 'fazenda' && campoInicial(m)) {
          const fica = new Set(Array.isArray(g.campo) ? g.campo : []);
          if (Array.isArray(g.arada)) for (const c of g.arada) if (Array.isArray(c)) fica.add(c[0]);
          for (let i = 0; i < loc.chao.length; i++) if (loc.chao[i] === CAMPO && !fica.has(i)) loc.chao[i] = GRAMA;
        }
        if (Array.isArray(g.campo)) for (const i of g.campo) if (servePara(loc, i)) loc.chao[i] = CAMPO;
        if (Array.isArray(g.arada)) for (const c of g.arada) if (Array.isArray(c)) arada(m, loc, c);
      }
    } else if (d && typeof d === 'object') {
      // formato 1 (antes do campo de plantação): a fazenda fica com o campo inicial que as terras marcaram nas casas
      // livres (debaixo das construções ele já virou grama); a terra arada gravada volta por cima
      for (const id in d) {
        const loc = m.locais[id];
        if (!loc || !Array.isArray(d[id])) continue;
        for (const c of d[id]) if (Array.isArray(c)) arada(m, loc, c);
      }
    }
    m.eventos.emitir('chaoMudou', { tudo: true });
  },
  comandos: {
    // segurou o dedo (ou a tecla) numa casa do campo: a ação do modo vai para a fileira toda, como se o dedo
    // tivesse arrastado casa por casa (o que não cabe na fila, ou falta semente ou água, fica de fora)
    fileira(m, c) {
      const x = Math.floor(c.x), z = Math.floor(c.z), f = fileiraDe(m, x, z);
      if (!f) return { ok: false, motivo: 'fora-do-campo' };
      let n = 0, motivo = f.motivo;
      if (f.umaTarefa) { // a fileira toda numa tarefa só (a passada do boi): o toque na casa segurada, como fileira
        const r = f.n ? m.comando({ tipo: 'tocarCasa', x: x + 0.5, z: z + 0.5, fileira: true }) : null;
        if (r && r.ok && !r.repetida) n = f.n;
        else if (r && r.motivo) motivo = r.motivo;
      } else for (const [cx, cz] of f.alvo) {
        const r = m.comando({ tipo: 'tocarCasa', x: cx + 0.5, z: cz + 0.5, arrasto: true });
        if (r.ok && !r.repetida) n++;
        else if (r.motivo === 'fila-cheia') { motivo = 'fila-cheia'; break; }
      }
      if (!n) { m.eventos.emitir('faltou', { motivo: motivo || 'fileira-em-dia', x, z }); return { ok: false, motivo: motivo || 'fileira-em-dia' }; }
      m.eventos.emitir('fileira', { acao: f.acao, n, x, z });
      return { ok: true, dados: { n, acao: f.acao, motivo } };
    },
  },
});
