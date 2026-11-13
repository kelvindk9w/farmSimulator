// A lavoura: enxada (grama vira terra arada), semear, regar, crescer e colher.
// Regra da água: a cultura pede "regas" regas até ficar pronta. Cada rega molha a terra e faz a planta crescer
// um trecho (tempoSeg / regas); acabou o trecho, a terra seca e a planta espera a próxima rega. Nunca morre.
// O crescimento guarda instantes absolutos (secaEm), então o tempo fora do jogo se resolve por conta, sem simular.
import { registrarSistema, registrarAcao, registrarModo, registrarAutomatico } from '../registro.js';
import { GRAMA, ARADA } from '../local.js';
import { somar } from '../util.js';
import { espacoNoCesto, porNoCesto, ferramentaNoCinto } from './posses.js';
import { darXp } from './niveis.js';
import { filaTem, contarNaFila } from './personagem.js';

// planta = { cultura, feitas, secaEm }
//   feitas: regas cujo trecho de crescimento já terminou (0..regas); feitas = regas → pronta
//   secaEm: instante (ms) em que a rega atual acaba; 0 = terra seca (com sede, ou pronta)
const cult = (m, pl) => m.dados.culturas[pl.cultura];
const trechoMs = (c) => (c.tempoSeg * 1000) / c.regas;

// põe a planta em dia com o relógio; devolve true se mudou de estado
function resolver(m, loc, i) {
  const pl = loc.plantas[i];
  if (!pl || pl.secaEm === 0 || m.agora < pl.secaEm) return false;
  const c = cult(m, pl);
  pl.feitas++; pl.secaEm = 0;
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

const idx = (m, alvo) => alvo.z * m.local.l + alvo.x;
const NAO = (motivo, dados, limpar) => ({ ok: false, motivo, dados, limpar });
const SIM = { ok: true };

registrarAcao({
  id: 'arar', ferramenta: 'enxada', dur: 1.1, efeitoEm: 0.7, estadoVisual: 'arar',
  pode(m, alvo) {
    const loc = m.local, i = idx(m, alvo);
    if (!loc.ehPropria(alvo.x, alvo.z)) return NAO('terra-a-venda');
    if (loc.chao[i] !== GRAMA || loc.ocupa[i]) return NAO(loc.chao[i] === ARADA ? 'ja-arado' : 'nao-da-para-arar');
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
  id: 'semear', dur: 0.7, efeitoEm: 0.45, estadoVisual: 'semear',
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
  pode(m, alvo) {
    const loc = m.local, i = idx(m, alvo);
    resolver(m, loc, i);
    const pl = loc.plantas[i];
    if (!pl) return NAO('nada-para-regar');
    const e = estadoDaPlanta(m, pl);
    if (e !== 'sede') return NAO(e === 'pronta' ? 'ja-pronta' : 'ja-regada');
    const reg = ferramentaNoCinto(m, 'regador');
    if (reg && !(m.posses.ferramentas[reg].agua > 0)) return NAO('regador-vazio', null, true);
    return SIM;
  },
  aoEfeito(m, alvo) {
    const loc = m.local, i = idx(m, alvo), pl = loc.plantas[i], reg = m.posses.ferramentas[ferramentaNoCinto(m, 'regador')];
    reg.agua--;
    pl.secaEm = m.agora + trechoMs(cult(m, pl));
    m.eventos.emitir('chaoMudou', { local: loc.id, x: alvo.x, z: alvo.z });
    m.eventos.emitir('regou', { cultura: pl.cultura, x: alvo.x, z: alvo.z, agua: reg.agua });
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
    if (loc.chao[i] === GRAMA) return loc.ocupa[i] ? null : filaTem(m, 'arar', x, z) ? { acao: null, texto: 'na-fila' } : { acao: 'arar' };
    if (loc.chao[i] === ARADA) return { acao: null, texto: 'ja-arado' };
    return null; // caminho: só anda
  },
});

registrarModo({
  id: 'semear', ordem: 20,
  // escolheu o modo sem semente (ou a escolhida acabou): fica com a primeira que houver na bolsa
  aoEscolher(m) {
    const B = m.posses.bolsa;
    if (m.modo.semente && B[m.modo.semente] > 0) return;
    const tem = m.dados.loja.ouro.find((id) => m.dados.culturaDaSemente[id] && B[id] > 0) || Object.keys(B).find((id) => m.dados.culturaDaSemente[id]);
    if (tem) m.modo.semente = tem;
    else if (!m.modo.semente) m.modo.semente = m.dados.loja.ouro.find((id) => m.dados.culturaDaSemente[id] && m.dados.itens[id].nivel <= m.progresso.nivel) || null;
  },
  acaoNaCasa(m, x, z) {
    const loc = m.local, i = z * loc.l + x, s = m.modo.semente;
    if (loc.plantas[i]) return { acao: null, texto: 'ja-plantado' };
    if (filaTem(m, 'semear', x, z)) return { acao: null, texto: 'na-fila' };
    if (loc.chao[i] !== ARADA && !filaTem(m, 'arar', x, z)) return loc.chao[i] === GRAMA && !loc.ocupa[i] ? { acao: null, texto: 'arar-antes' } : null;
    if (!s || !m.dados.culturaDaSemente[s]) return { acao: null, texto: 'sem-semente-escolhida', falta: true };
    if (sementesLivres(m, s) <= 0) return { acao: null, texto: 'sem-sementes', dados: { item: s }, falta: true };
    return { acao: 'semear', args: { semente: s }, dados: { item: s } };
  },
});

registrarModo({
  id: 'regar', ordem: 30, ferramenta: 'regador',
  acaoNaCasa(m, x, z) {
    const loc = m.local, i = z * loc.l + x;
    resolver(m, loc, i);
    const pl = loc.plantas[i];
    if (!pl) return filaTem(m, 'semear', x, z) ? { acao: 'regar' } : loc.chao[i] === ARADA ? { acao: null, texto: 'nada-para-regar' } : null;
    const e = estadoDaPlanta(m, pl);
    if (e === 'sede') return filaTem(m, 'regar', x, z) ? { acao: null, texto: 'na-fila' } : { acao: 'regar' };
    return { acao: null, texto: e === 'pronta' ? 'ja-pronta' : 'ja-regada', dados: { cultura: pl.cultura, seg: segundosDeAgua(m, pl) } };
  },
});

// modo "mão": rega o que tem sede, colhe o que está pronto
registrarAutomatico((m, x, z) => {
  const loc = m.local, i = z * loc.l + x;
  resolver(m, loc, i);
  const pl = loc.plantas[i];
  if (!pl) return loc.chao[i] === ARADA ? { acao: null, texto: 'terra-arada-vazia' } : null;
  const e = estadoDaPlanta(m, pl);
  if (e === 'pronta') return { acao: 'colher', dados: { cultura: pl.cultura } };
  if (e === 'sede') return { acao: 'regar', dados: { cultura: pl.cultura } };
  return { acao: null, texto: 'crescendo', dados: { cultura: pl.cultura, seg: segundosDeAgua(m, pl) } };
});

registrarSistema({
  id: 'lavoura',
  segundo: resolverTudo,
  ausencia: resolverTudo,
  // grava só o que não é grama: [índice, cultura | 0, feitas, secaEm]
  salvar(m) {
    const out = {};
    for (const id in m.locais) {
      const loc = m.locais[id], casas = [];
      for (let i = 0; i < loc.chao.length; i++) if (loc.chao[i] === ARADA) { const pl = loc.plantas[i]; casas.push(pl ? [i, pl.cultura, pl.feitas, Math.round(pl.secaEm)] : [i]); }
      out[id] = casas;
    }
    return out;
  },
  carregar(m, d) {
    for (const id in d) {
      const loc = m.locais[id];
      if (!loc) continue;
      for (const [i, cultura, feitas, secaEm] of d[id]) {
        if (!(i >= 0 && i < loc.chao.length) || loc.chao[i] !== GRAMA || loc.ocupa[i]) continue; // o mapa mudou: a casa não serve mais
        loc.chao[i] = ARADA;
        if (cultura && m.dados.culturas[cultura]) { loc.plantas[i] = { cultura, feitas: Math.min(feitas || 0, m.dados.culturas[cultura].regas), secaEm: secaEm || 0 }; loc.plantadas.push(i); }
      }
    }
    m.eventos.emitir('chaoMudou', { tudo: true });
  },
});
