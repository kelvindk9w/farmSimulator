// O desenho do começo humilde (a lógica está em nucleo/sistemas/comeco.js):
//   - o Seu Tonho na fazenda: parado (animal/seu-tonho/parado-frente, em laço) e, quando ela chega e quando conversam,
//     acenando uma vez (animal/seu-tonho/acenar-frente); virado para o lado dela.
//   - a cerca da beira da terra própria, trecho por trecho, entre as casas (o apoio é o meio do trecho, no chão; os
//     vizinhos se encontram no mourão): a de arame (objeto/arame-x, -z; caída aqui e ali: objeto/arame-caido-x, -z),
//     com mourão velho nos cantos e nas pontas da entrada (objeto/mourao-velho) e um mourão caído no chão de vez em
//     quando (objeto/mourao-caido, desenhado ao longo de X: espelhado para os trechos em Z). Depois da reforma, a de
//     madeira (objeto/cerca-x, -z); durante a obra, os trechos novos vão aparecendo a partir da entrada.
// Tudo entra na ordem de profundidade como figura solta (render/cena.js: SOLTAS). Nada aqui é sorteado a cada quadro:
// o que está caído é sempre o mesmo trecho (o sorteio é o da casa, em comeco.js).
import { SOLTAS, GESTO_PARECIDO } from './cena.js';
import { figuraDeReserva, desenharReserva } from './reserva.js';
import { DESENHO, trechosDaCerca, tipoDoTrecho } from '../nucleo/sistemas/comeco.js';

GESTO_PARECIDO['parada-trouxa'] = 'parada';

const CAIDO = 0.16; // dos trechos de arame, quantos estão caídos
const MOURAO_NO_CHAO = 0.05; // e, desses, em quantos o mourão também caiu (fica deitado ao lado)
const ARAME = 'cerca-de-arame';

function peca(g, cena, chave, sx, sy, S, espelhar, quadro = 0) {
  if (!cena.atlas.desenhar(g, chave, quadro, sx, sy, S, espelhar)) desenharReserva(g, figuraDeReserva(chave, quadro, 1, 1, 0), sx, sy, S, espelhar);
}

// ---------- o Seu Tonho ----------
const ACENAR = 'animal/seu-tonho/acenar-frente', PARADO = 'animal/seu-tonho/parado-frente';
function quadroDe(cena, chave, seg, laco, qpsPadrao) {
  const def = cena.atlas.peca(chave), n = def ? def.q.length : 1, qps = (def && def.qps) || qpsPadrao;
  const q = Math.floor(seg * qps);
  return laco ? q % n : q < n ? q : -1;
}
function desenharTonho(g, cena, m, e, sx, sy, S) {
  const C = m.comeco, p = m.personagem;
  // virado para ela: a figura olha para a direita de quem vê; com ela à esquerda, espelha
  const esq = p.x - p.z < e.x - e.z - 0.2;
  const desde = C && C.acenouEm ? (m.agora - C.acenouEm) / 1000 : Infinity;
  const qa = desde >= 0 && desde < 30 ? quadroDe(cena, ACENAR, desde, false, 8) : -1;
  if (qa >= 0) peca(g, cena, ACENAR, sx, sy, S, esq, qa);
  else peca(g, cena, PARADO, sx, sy, S, esq, quadroDe(cena, PARADO, m.agora / 1000, true, 4));
}
DESENHO.vizinho = (m, e, v) => { v.chave = PARADO; v.desenhar = desenharTonho; };

// ---------- a cerca ----------
// as figuras soltas da cerca, refeitas quando a lista de trechos muda (comprou terra) — os objetos ficam os mesmos
const cache = { lista: null, soltas: [], m: null };
function chaveDoTrecho(m, t) {
  const tipo = tipoDoTrecho(m, t);
  if (tipo !== ARAME) return t.eixo === 'x' ? 'objeto/cerca-x' : 'objeto/cerca-z';
  return t.sorte < CAIDO ? (t.eixo === 'x' ? 'objeto/arame-caido-x' : 'objeto/arame-caido-z') : t.eixo === 'x' ? 'objeto/arame-x' : 'objeto/arame-z';
}
function soltaDoTrecho(m, t) {
  return {
    x: t.x, z: t.z, raio: 0,
    desenhar(g, cena, sx, sy, S) { peca(g, cena, chaveDoTrecho(cache.m, t), sx, sy, S, false); },
  };
}
// o mourão caído: deitado do lado de fora do trecho caído (só enquanto a cerca é a de arame)
function soltaDoMouraoCaido(m, t) {
  const fora = 0.32, dx = t.eixo === 'z' ? t.lado * fora : 0, dz = t.eixo === 'x' ? t.lado * fora : 0;
  return {
    x: t.x + dx, z: t.z + dz, raio: 0,
    desenhar(g, cena, sx, sy, S) { if (tipoDoTrecho(cache.m, t) === ARAME) peca(g, cena, 'objeto/mourao-caido', sx, sy, S, t.eixo === 'z'); },
  };
}
// o mourão velho de um canto (ou de uma ponta da entrada): só na cerca de arame (a de madeira já traz o seu)
function soltaDoMourao(m, x, z, t) {
  return { x, z, raio: 0, desenhar(g, cena, sx, sy, S) { if (tipoDoTrecho(cache.m, t) === ARAME) peca(g, cena, 'objeto/mourao-velho', sx, sy, S, false); } };
}
function montar(m, lista) {
  const loc = m.locais.fazenda, out = [], pontas = new Map();
  const ponta = (x, z, eixo, t) => { const k = x * 4096 + z; const p = pontas.get(k) || { x, z, x0: 0, z0: 0, t }; if (eixo === 'x') p.x0++; else p.z0++; pontas.set(k, p); };
  for (const t of lista) {
    // de que lado fica a terra própria (o de dentro): o mourão caído vai para o outro
    t.lado = t.eixo === 'x' ? (loc.ehPropria(Math.floor(t.x), t.z) ? -1 : 1) : (loc.ehPropria(t.x, Math.floor(t.z)) ? -1 : 1);
    out.push(soltaDoTrecho(m, t));
    if (t.sorte < MOURAO_NO_CHAO) out.push(soltaDoMouraoCaido(m, t));
    if (t.eixo === 'x') { ponta(t.x - 0.5, t.z, 'x', t); ponta(t.x + 0.5, t.z, 'x', t); } else { ponta(t.x, t.z - 0.5, 'z', t); ponta(t.x, t.z + 0.5, 'z', t); }
  }
  // canto = onde um trecho em X encontra um em Z; ponta = onde só chega um trecho (a beira da entrada)
  for (const p of pontas.values()) if ((p.x0 && p.z0) || p.x0 + p.z0 === 1) out.push(soltaDoMourao(m, p.x, p.z, p.t));
  return out;
}
SOLTAS.push((m) => {
  if (m.local !== m.locais.fazenda) return null;
  const lista = trechosDaCerca(m);
  if (!lista) return null;
  if (cache.lista !== lista || cache.m !== m) { cache.lista = lista; cache.m = m; cache.soltas = montar(m, lista); }
  return cache.soltas;
});
