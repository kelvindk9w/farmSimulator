// O começo do jogo com os dados de verdade (dados/*.json): o campo pequeno ao lado do poço, o terreiro livre em volta
// da casa, do poço e do campo, o boi do Seu Tonho no nível 4 e a fileira do boi. Os testes dos números pequenos
// (testes/dados) estão em campo.test.mjs e trabalho.test.mjs; aqui se confere o que o jogador de verdade encontra.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lerPasta, ateParar, ouvirTudo, modo, pular, porConstrucao } from './apoio.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { prepararDados } from '../src/nucleo/dados.js';
import { CAMPO, ARADA, deLavoura } from '../src/nucleo/local.js';
import { missaoAtual } from '../src/nucleo/sistemas/missoes.js';
import { podeComprarAnimal, animaisDe, nivelDoCocho, nivelDoBebedouro, capacidadeDoCocho } from '../src/nucleo/sistemas/animais.js';
import { casasPorPassada, estadoDoTrabalho } from '../src/nucleo/sistemas/trabalho.js';
import { fileiraDe, podeSegurar } from '../src/nucleo/sistemas/lavoura.js';
import { MODOS } from '../src/nucleo/registro.js';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const BRUTO = lerPasta(path.join(aqui, '..', 'dados'));
const copia = (o) => JSON.parse(JSON.stringify(o));
function dadosDeVerdade(muda) {
  const b = copia(BRUTO);
  if (muda) muda(b);
  const { dados, problemas } = prepararDados(b);
  assert.deepEqual(problemas.filter((p) => p.grave), []);
  return dados;
}
const novo = (muda) => new Mundo(dadosDeVerdade(muda), { agora: 1_700_000_000_000 });
const chao = (m, x, z) => m.locais.fazenda.chao[z * m.locais.fazenda.l + x];
const OBST = ['mato', 'toco', 'pedra', 'mata'];
const obstaculos = (m) => m.locais.fazenda.entidades.filter((e) => OBST.includes(e.tipo));
const dentro = (a, x, z) => x >= a[0] && z >= a[1] && x < a[2] && z < a[3];
// a missão "id" passa a ser a da vez (as de antes, feitas), no nível dela
function naMissao(m, id) {
  const lista = m.dados.missoes.vizinho, k = lista.findIndex((x) => x.id === id);
  m.missoes.feitas = lista.slice(0, k).map((x) => x.id); m.missoes.de = null; m.missoes.conta = 0;
  m.progresso.nivel = Math.max(m.progresso.nivel, lista[k].nivel); m.progresso.xp = Math.max(m.progresso.xp, m.dados.niveis.limiar[lista[k].nivel]);
  return missaoAtual(m);
}
// o primeiro canto livre do terreiro para uma construção (l x p), com folga de uma casa em volta
function lugarPara(m, l, p) {
  const loc = m.locais.fazenda, a = m.dados.terras.inicial;
  for (let z = a[1] + 1; z < a[3] - p; z++) for (let x = a[0] + 1; x < a[2] - l; x++) {
    let ok = true;
    for (let zz = z - 1; zz <= z + p && ok; zz++) for (let xx = x - 1; xx <= x + l && ok; xx++) { const i = zz * loc.l + xx; if (loc.ocupa[i] || deLavoura(loc.chao[i]) || loc.chao[i] === 2) ok = false; }
    if (ok) return [x, z];
  }
  throw new Error('sem lugar');
}
// o estábulo pede a bancada de carpintaria: ela já está no terreiro, e o estábulo vai para a obra (e fica pronto)
function fazerEstabulo(m) {
  m.posses.ouro += 1000; m.posses.bolsa.tabua = 20; m.posses.bolsa.prego = 40;
  const [bx, bz] = lugarPara(m, 2, 1);
  porConstrucao(m, 'bancada-de-carpintaria', bx, bz);
  const [x, z] = lugarPara(m, 4, 4);
  const r = m.comando({ tipo: 'construir', id: 'estabulo', x, z, jaJa: true });
  assert.equal(r.ok, true, JSON.stringify(r));
  pular(m, m.dados.construcoes.estabulo.obraSeg + 5);
  m.passo();
}

// ---------------------------------------------------------------------------------------------------------------
test('o campo do começo: 12 casas, duas fileiras de 6 ao longo de X, ao lado do poço; o guia aponta a primeira fileira', () => {
  const m = novo(), loc = m.locais.fazenda, poco = loc.porId.poco;
  const casas = [];
  for (let i = 0; i < loc.chao.length; i++) if (deLavoura(loc.chao[i])) casas.push([i % loc.l, Math.floor(i / loc.l)]);
  assert.equal(casas.length, 12);
  const zs = [...new Set(casas.map(([, z]) => z))].sort();
  assert.equal(zs.length, 2, 'duas fileiras');
  for (const z of zs) assert.equal(casas.filter(([, cz]) => cz === z).length, 6, `fileira z = ${z} com 6`);
  // perto do poço: a casa do campo mais perto fica a uma ou duas casas da beira do poço
  const dist = Math.min(...casas.map(([x, z]) => Math.max(poco.x - x, x - (poco.x + poco.l - 1), 0) + Math.max(poco.z - z, z - (poco.z + poco.p - 1), 0)));
  assert.ok(dist <= 2, `a ${dist} casas do poço`);
  // as duas fileiras ficam ao lado do poço (na mesma faixa de z)
  for (const z of zs) assert.ok(z >= poco.z && z < poco.z + poco.p);
  const L = m.dados.terras.pontos.lavoura;
  assert.equal(chao(m, L[0], L[1]), CAMPO, 'o ponto da lavoura é do campo');
  // a primeira missão: are a primeira fileira (6 casas)
  const a = missaoAtual(m);
  assert.equal(a.missao.id, 'preparar-a-terra'); assert.equal(a.n, 6);
  // e dá para arar a grama em volta (o campo cresce)
  modo(m, 'enxada');
  assert.equal(podeSegurar(m, L[0], L[1]), true);
});

test('o terreiro do começo: nada de mato, toco ou pedra em volta da casa, do celeiro, do poço e do campo; a beirada tem o que as missões pedem', () => {
  const m = novo(), loc = m.locais.fazenda, T = m.dados.terras, ini = T.inicial;
  const proprios = obstaculos(m).filter((e) => loc.propria[loc.i(e.x, e.z)]);
  // só na beirada de fora da área inicial (a fileira de trás, a coluna do leste e a fileira da porteira)
  for (const e of proprios) assert.ok(e.x === ini[0] || e.x === ini[2] - 1 || e.z === ini[1] || e.z === ini[3] - 1, `${e.id} fora da beirada`);
  // nada a até 1 casa da casa, do poço e do campo (fora a beirada de trás da casa, que já é a cerca do sítio)
  const perto = (x, z) => proprios.some((e) => Math.abs(e.x - x) <= 1 && Math.abs(e.z - z) <= 1 && !(e.z === ini[1] || e.x === ini[0]));
  for (const id of ['casa', 'poco', 'celeiro']) {
    const c = loc.porId[id];
    for (let z = c.z; z < c.z + c.p; z++) for (let x = c.x; x < c.x + c.l; x++) assert.ok(!perto(x, z), `${id}: obstáculo colado em (${x}, ${z})`);
  }
  for (let z = T.campo[1]; z < T.campo[3]; z++) for (let x = T.campo[0]; x < T.campo[2]; x++) assert.ok(!perto(x, z), `campo: obstáculo colado em (${x}, ${z})`);
  // o bastante para as missões de antes do primeiro lote (nível 5): roçar 6 matos, tirar 3 tocos, quebrar 3 pedras
  const conta = (t) => proprios.filter((e) => e.tipo === t).length;
  assert.ok(conta('mato') >= 6, `matos: ${conta('mato')}`);
  assert.ok(conta('toco') >= 3, `tocos: ${conta('toco')}`);
  assert.ok(conta('pedra') >= 3, `pedras: ${conta('pedra')}`);
  // a gravação de antes não ganha obstáculo novo: o miolo limpo de antes e o campo grande de antes seguem limpos
  for (const a of [[25, 49, 39, 59], [24, 50, 30, 58]]) assert.ok(!proprios.some((e) => dentro(a, e.x, e.z)), `algo nasceu em ${a}`);
  // e os lotes seguem com o mato deles
  assert.ok(obstaculos(m).filter((e) => !loc.propria[loc.i(e.x, e.z)]).length > 500);
});

test('gravação de quem já tinha o campo grande (6 por 8) abre com ele, arado e plantado', () => {
  // o jogo de antes: o campo grande de 6 por 8 do lado do poço
  const velho = novo((b) => { b.terras.inicial.campo = [24, 50, 30, 58]; b.terras.inicial.limpo = [25, 49, 39, 59]; });
  const loc = velho.locais.fazenda;
  loc.chao[loc.i(26, 56)] = ARADA;
  const g = copia(velho.salvar());
  const n = Mundo.carregar(dadosDeVerdade(), g);
  for (let z = 50; z < 58; z++) for (let x = 24; x < 30; x++) assert.ok(deLavoura(chao(n, x, z)), `(${x}, ${z}) segue campo`);
  assert.equal(chao(n, 26, 56), ARADA);
  // e nada de obstáculo novo no meio dele
  assert.ok(!obstaculos(n).some((e) => dentro([24, 50, 30, 58], e.x, e.z)));
});

// ---------------------------------------------------------------------------------------------------------------
test('o boi no nível 4: depois das tábuas e das pedras (que rendem 4 tábuas), o Seu Tonho pede a baia; o estábulo simples cabe no bolso do nível 4', () => {
  const m = novo(), D = m.dados, ids = D.missoes.vizinho.map((x) => x.id);
  const k = ids.indexOf('baia-do-boi');
  assert.equal(ids[k - 2], 'tabuas'); assert.equal(ids[k - 1], 'pedras'); assert.equal(ids[k + 1], 'boi-de-arado');
  // as pedras vêm antes da baia: a obra do estábulo não gasta as pedras do começo antes da missão delas
  assert.equal(D.missoes.vizinho[k - 1].recompensa.itens.tabua, 4);
  assert.equal(D.missoes.vizinho[k].nivel, 4); assert.equal(D.missoes.vizinho[k + 1].nivel, 4);
  const E = D.construcoes.estabulo;
  assert.equal(E.nivel, 4);
  assert.ok(E.custo.ouro <= 200, `custa ${E.custo.ouro} de ouro`);
  assert.ok(Object.keys(E.custo.itens).every((i) => ['tabua', 'prego', 'madeira'].includes(i)), 'só tábua, prego e madeira');
  // as baias seguintes e os outros bichos seguem onde estavam
  assert.deepEqual(E.ampliacoes.map((a) => a.nivel), [14, 16]);
  assert.equal(D.animais.boi.nivel, 12); assert.equal(D.animais.jumento.nivel, 14); assert.equal(D.animais.cavalo.nivel, 16);
  // no nível 4, comprar outro boi não dá: só o do Seu Tonho
  m.progresso.nivel = 4;
  assert.equal(podeComprarAnimal(m, 'boi').motivo, 'nivel-baixo');
});

test('a baia pronta: o boi velho chega com o arado simples, o cocho e o bebedouro cheios; segurar no campo, o boi ara a fileira (6) e a missão anda', () => {
  const m = novo(), ev = ouvirTudo(m);
  assert.equal(naMissao(m, 'baia-do-boi').missao.id, 'baia-do-boi');
  fazerEstabulo(m);
  assert.ok(ev.de('missaoConcluida').some((d) => d.id === 'baia-do-boi'), 'a baia cumpriu a missão');
  const bois = animaisDe(m, { especie: 'boi' });
  assert.equal(bois.length, 1, 'chegou um boi');
  assert.ok(m.posses.ferramentas.arado, 'com o arado simples');
  assert.equal(m.posses.bolsa.racao, 4, 'e quatro rações');
  const e = m.locais.fazenda.porId[bois[0].abrigo];
  assert.equal(nivelDoCocho(m, e) + 1, capacidadeDoCocho(m, e), 'o cocho cheio (ele já comeu uma)');
  assert.ok(nivelDoBebedouro(m, e) > 0);
  assert.equal(estadoDoTrabalho(m).boi.tratado, true);
  assert.equal(casasPorPassada(m), 6);
  assert.equal(MODOS.arado.disponivel(m), true);
  assert.equal(missaoAtual(m).missao.id, 'boi-de-arado');
  // segurar o dedo numa casa do campo no modo Arado: a fileira inteira de 6, numa passada
  modo(m, 'arado');
  const L = m.dados.terras.pontos.lavoura, f = fileiraDe(m, L[0] + 2, L[1]);
  assert.equal(f.n, 6); assert.equal(f.acao, 'ararComBoi');
  assert.ok(f.casas.every(([, cz]) => cz === L[1]), 'ao longo da fileira (X: 6 casas; em Z o campo só tem 2)');
  assert.equal(m.comando({ tipo: 'fileira', x: L[0] + 2.5, z: L[1] + 0.5 }).ok, true);
  ateParar(m, 300);
  assert.equal(ev.de('arou').filter((d) => d.com === 'boi').length, 6);
  // a segunda fileira e a missão
  assert.equal(m.comando({ tipo: 'fileira', x: L[0] + 0.5, z: L[1] + 1.5 }).ok, true);
  ateParar(m, 300);
  assert.ok(ev.de('missaoConcluida').some((d) => d.id === 'boi-de-arado'), 'arou 12 com o boi');
  assert.equal(missaoAtual(m).missao.id, 'galinheiro');
});

test('quem já tinha boi (comprado antes, gravação de antes) não ganha outro; quem tem o estábulo cheio também não', () => {
  const m = novo();
  naMissao(m, 'baia-do-boi');
  fazerEstabulo(m);
  assert.equal(animaisDe(m, { especie: 'boi' }).length, 1);
  // a gravação de antes (o boi do nível 12, comprado, e a missão "boi-de-arado" feita) abre com a baia já cumprida
  const g = copia(m.salvar());
  g.sistemas.missoes.feitas = g.sistemas.missoes.feitas.filter((id) => id !== 'baia-do-boi' && id !== 'boi-de-arado').concat(['boi-de-arado']);
  const n = Mundo.carregar(m.dados, g);
  n.passo(); pular(n, 2);
  assert.ok(n.missoes.feitas.includes('baia-do-boi'), 'a baia vale (valeJaTer)');
  assert.equal(animaisDe(n, { especie: 'boi' }).length, 1, 'e nada de segundo boi');
});

test('gravação de antes, no meio do caminho (nível 8, sem estábulo): a próxima missão é a baia do boi', () => {
  const m = novo();
  naMissao(m, 'cozinha');
  const g = copia(m.salvar());
  g.sistemas.missoes.feitas = g.sistemas.missoes.feitas.filter((id) => id !== 'baia-do-boi' && id !== 'boi-de-arado');
  const n = Mundo.carregar(m.dados, g);
  assert.equal(missaoAtual(n).missao.id, 'baia-do-boi');
});
