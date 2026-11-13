// A lavoura: arar, semear, regar, crescer pelo relógio (também com o jogo fechado) e colher.
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, ateParar, ouvirTudo, modo, tocar, arar, semear, encher, regar, colher, pular, plantarAtePronta, CAMPO } from './apoio.mjs';
import { GRAMA, ARADA, CAMPO as CHAO_CAMPO } from '../src/nucleo/local.js';
import { plantaEm, estadoDaPlanta, estagioDaPlanta, progressoDaPlanta, proximoAcontecimento } from '../src/nucleo/sistemas/lavoura.js';

const UMA = [[12, 13]];
const estado = (m, x = 12, z = 13) => { const pl = plantaEm(m, x, z); return pl ? estadoDaPlanta(m, pl) : null; };

test('semear gasta a semente e só vale em terra arada e vazia', () => {
  const m = novoMundo();
  modo(m, 'semear', 'semente-rabanete');
  let r = tocar(m, 12, 13);
  assert.equal(r.ok, false); assert.equal(r.motivo, 'arar-antes');
  arar(m, UMA); semear(m, UMA);
  assert.equal(m.posses.bolsa['semente-rabanete'], 2);
  assert.equal(plantaEm(m, 12, 13).cultura, 'rabanete');
  assert.equal(estado(m), 'sede');
  r = tocar(m, 12, 13);
  assert.equal(r.ok, false); assert.equal(r.motivo, 'ja-plantado');
});

test('cultura de nível mais alto não se planta antes da hora', () => {
  const m = novoMundo();
  arar(m, UMA);
  m.posses.bolsa['semente-milho'] = 1;
  const ev = ouvirTudo(m);
  semear(m, UMA, 'semente-milho');
  assert.equal(plantaEm(m, 12, 13), null);
  assert.equal(ev.de('faltou')[0].motivo, 'nivel-baixo');
  assert.equal(m.posses.bolsa['semente-milho'], 1);
});

test('uma rega: a planta cresce pelo relógio, passa pelos estágios e fica pronta', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  arar(m, UMA); semear(m, UMA); encher(m); regar(m, UMA);
  assert.equal(estado(m), 'crescendo');
  assert.equal(estagioDaPlanta(m, plantaEm(m, 12, 13)), 1);
  m.avancar(31);
  const meio = progressoDaPlanta(m, plantaEm(m, 12, 13));
  assert.ok(meio > 0.5 && meio < 0.6, `na metade do tempo o progresso é ${meio.toFixed(2)}`);
  assert.ok(estagioDaPlanta(m, plantaEm(m, 12, 13)) > 1);
  assert.equal(estado(m), 'crescendo');
  m.avancar(30);
  assert.equal(estado(m), 'pronta');
  assert.equal(estagioDaPlanta(m, plantaEm(m, 12, 13)), m.dados.culturas.rabanete.estagios);
  assert.equal(ev.de('amadureceu').length, 1);
});

test('duas regas: cresce metade, a terra seca e a planta espera a outra rega; nunca morre', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  m.progresso.nivel = 2; m.posses.bolsa['semente-milho'] = 1;
  arar(m, UMA); semear(m, UMA, 'semente-milho'); encher(m); regar(m, UMA);
  pular(m, 301);
  assert.equal(estado(m), 'sede');
  assert.equal(ev.de('secou').length, 1);
  assert.ok(Math.abs(progressoDaPlanta(m, plantaEm(m, 12, 13)) - 0.5) < 1e-9);
  // uma semana sem água: continua lá, com sede, no mesmo ponto
  pular(m, 7 * 86400);
  assert.equal(estado(m), 'sede');
  assert.ok(Math.abs(progressoDaPlanta(m, plantaEm(m, 12, 13)) - 0.5) < 1e-9);
  regar(m, UMA);
  pular(m, 301);
  assert.equal(estado(m), 'pronta');
});

test('com o jogo fechado o relógio resolve tudo de uma vez, sem simular passo a passo', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  arar(m, CAMPO); m.posses.bolsa['semente-rabanete'] = 4; semear(m, CAMPO); encher(m); regar(m, CAMPO.slice(0, 3));
  const quando = proximoAcontecimento(m);
  assert.ok(quando > m.agora && quando <= m.agora + 60000);
  const passos = m.n;
  assert.equal(pular(m, 8 * 3600), 8 * 3600);
  assert.equal(m.n, passos, 'nenhum passo de simulação');
  assert.deepEqual(CAMPO.map(([x, z]) => estado(m, x, z)), ['pronta', 'pronta', 'pronta', 'sede']);
  assert.equal(ev.de('relogioAcertado')[0].seg, 8 * 3600);
  assert.equal(proximoAcontecimento(m), null);
  assert.equal(pular(m, -50), 0, 'relógio para trás não desfaz nada');
});

test('o regador tem as suas regas: acabou a água, avisa e manda ao poço', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  arar(m, CAMPO); m.posses.bolsa['semente-rabanete'] = 4; semear(m, CAMPO); encher(m);
  modo(m, 'regar');
  const rs = CAMPO.map(([x, z]) => tocar(m, x, z));
  assert.deepEqual(rs.map((r) => r.ok), [true, true, true, false], 'a quarta rega nem entra na fila (são três regas)');
  assert.equal(rs[3].motivo, 'regador-vazio');
  ateParar(m);
  assert.equal(m.posses.ferramentas.regador.agua, 0);
  assert.equal(ev.de('regou').length, 3);
  // com a ida ao poço na fila, a rega seguinte já vale
  ev.limpar();
  m.comando({ tipo: 'tocarEntidade', id: 'poco' });
  assert.equal(tocar(m, ...CAMPO[3]).ok, true);
  ateParar(m);
  assert.deepEqual(ev.tipos().filter((t) => t === 'encheu' || t === 'regou'), ['encheu', 'regou']);
  assert.equal(m.posses.ferramentas.regador.agua, 2);
});

test('regar o que já está regado ou pronto não gasta água', () => {
  const m = novoMundo();
  arar(m, UMA); semear(m, UMA); encher(m); regar(m, UMA);
  modo(m, 'regar');
  let r = tocar(m, 12, 13);
  assert.equal(r.ok, false); assert.equal(r.motivo, 'ja-regada');
  pular(m, 61);
  r = tocar(m, 12, 13);
  assert.equal(r.ok, false); assert.equal(r.motivo, 'ja-pronta');
  assert.equal(m.posses.ferramentas.regador.agua, 2);
});

test('colher põe o produto no cesto, dá experiência e libera a casa', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  plantarAtePronta(m, UMA);
  const xp = m.progresso.xp;
  colher(m, UMA);
  assert.deepEqual(m.posses.cesto.itens, { rabanete: 2 });
  assert.equal(m.progresso.xp, xp + 3);
  assert.equal(plantaEm(m, 12, 13), null);
  assert.equal(m.local.chao[m.local.i(12, 13)], ARADA, 'a terra continua arada (regra padrão)');
  assert.deepEqual(ev.de('colheu'), [{ cultura: 'rabanete', item: 'rabanete', n: 2, x: 12, z: 13 }]);
});

test('com a regra de rearar ligada, a casa colhida vira campo (nunca grama) e pede a enxada de novo', () => {
  const m = novoMundo((b) => { b.regras.lavoura = { reararAposColher: true }; });
  plantarAtePronta(m, UMA); colher(m, UMA);
  assert.equal(m.local.chao[m.local.i(12, 13)], CHAO_CAMPO);
  modo(m, 'semear', 'semente-rabanete');
  assert.equal(tocar(m, 12, 13).motivo, 'arar-antes');
});

test('modo mão: um toque rega o que tem sede e colhe o que está pronto', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  arar(m, UMA); semear(m, UMA); encher(m);
  modo(m, 'mao');
  assert.equal(tocar(m, 12, 13).ok, true); ateParar(m);
  assert.equal(ev.de('regou').length, 1);
  pular(m, 61);
  assert.equal(tocar(m, 12, 13).ok, true); ateParar(m);
  assert.equal(ev.de('colheu').length, 1);
});
