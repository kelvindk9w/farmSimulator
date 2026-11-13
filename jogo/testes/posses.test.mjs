// O cesto, a venda na banca, o celeiro e a compra na loja.
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, ateParar, ouvirTudo, modo, tocar, tocarEm, colher, plantarAtePronta, encher, pular } from './apoio.mjs';
import { plantaEm } from '../src/nucleo/sistemas/lavoura.js';
import { noCesto, espacoNoCesto, capacidadeDoCesto, valorDoCesto, noCeleiro, ferramentaNoCinto } from '../src/nucleo/sistemas/posses.js';
import { ofertasDaLoja } from '../src/nucleo/sistemas/loja.js';

const QUATRO = [[12, 13], [13, 13], [12, 14], [13, 14]];
function comColheita(muda) {
  const m = novoMundo(muda);
  m.posses.bolsa['semente-rabanete'] = 4;
  plantarAtePronta(m, QUATRO);
  return m;
}

test('o cesto tem capacidade: cheio, a colheita para, a planta fica no pé e o jogo avisa', () => {
  const m = comColheita(), ev = ouvirTudo(m);
  assert.equal(capacidadeDoCesto(m), 6);
  colher(m, QUATRO);
  assert.equal(noCesto(m), 6); assert.equal(espacoNoCesto(m), 0);
  assert.equal(ev.de('colheu').length, 3);
  assert.equal(ev.de('faltou').filter((d) => d.motivo === 'cesto-cheio').length, 1);
  assert.ok(plantaEm(m, 13, 14), 'a quarta planta continua lá');
  assert.equal(valorDoCesto(m), 6 * 4);
});

test('a banca compra tudo do cesto pelo preço de tabela', () => {
  const m = comColheita(), ev = ouvirTudo(m);
  colher(m, QUATRO);
  const ouro = m.posses.ouro;
  assert.equal(tocarEm(m, 'banca').ok, true);
  ateParar(m);
  assert.equal(m.posses.ouro, ouro + 24);
  assert.equal(noCesto(m), 0);
  assert.deepEqual(ev.de('vendeu').map((d) => [d.item, d.n, d.ouro]), [['rabanete', 6, 24]]);
  assert.deepEqual(ev.de('vendeuTudo').map((d) => [d.n, d.ouro]), [[6, 24]]);
  const r = tocarEm(m, 'banca');
  assert.equal(r.ok, false); assert.equal(r.motivo, 'cesto-vazio');
});

test('colher e vender num gesto só: o toque na banca vale com a colheita ainda na fila', () => {
  const m = comColheita();
  modo(m, 'mao');
  const ouro = m.posses.ouro;
  tocar(m, 12, 13);
  assert.equal(tocarEm(m, 'banca').ok, true);
  ateParar(m);
  assert.equal(m.posses.ouro, ouro + 8);
});

test('o celeiro guarda o cesto e devolve para vender; tem limite', () => {
  const m = comColheita(), ev = ouvirTudo(m);
  colher(m, QUATRO);
  tocarEm(m, 'celeiro'); ateParar(m);
  assert.equal(noCesto(m), 0); assert.equal(noCeleiro(m), 6);
  assert.deepEqual(ev.de('guardou')[0].itens, { rabanete: 6 });
  colher(m, [QUATRO[3]]);
  m.posses.celeiro.itens.milho = 3; // 9 de 10
  tocarEm(m, 'celeiro'); ateParar(m);
  assert.equal(noCeleiro(m), 10); assert.equal(noCesto(m), 1, 'o que não coube fica no cesto');
  assert.ok(ev.de('faltou').some((d) => d.motivo === 'celeiro-cheio'));
  // esvazia o cesto e pega de volta
  tocarEm(m, 'banca'); ateParar(m);
  tocarEm(m, 'celeiro'); ateParar(m);
  assert.equal(noCesto(m), 6);
  assert.equal(noCeleiro(m), 4);
});

test('comprar semente gasta ouro e enche a bolsa; sem ouro, avisa quanto falta', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  let r = m.comando({ tipo: 'comprar', item: 'semente-rabanete', n: 5 });
  assert.equal(r.ok, true);
  assert.equal(m.posses.ouro, 10); assert.equal(m.posses.bolsa['semente-rabanete'], 8);
  assert.deepEqual(ev.de('comprou'), [{ item: 'semente-rabanete', n: 5, ouro: 10, classe: 'semente' }]);
  r = m.comando({ tipo: 'comprar', item: 'semente-rabanete', n: 6 });
  assert.equal(r.ok, false); assert.equal(r.motivo, 'sem-ouro'); assert.equal(r.dados.falta, 2);
  assert.equal(m.posses.ouro, 10);
});

test('a loja respeita o nível e não vende o que não está nela', () => {
  const m = novoMundo();
  let r = m.comando({ tipo: 'comprar', item: 'semente-milho', n: 1 });
  assert.equal(r.ok, false); assert.equal(r.motivo, 'nivel-baixo'); assert.equal(r.dados.nivel, 2);
  r = m.comando({ tipo: 'comprar', item: 'rabanete', n: 1 });
  assert.equal(r.ok, false); assert.equal(r.motivo, 'nao-vende');
  const ofertas = ofertasDaLoja(m).flatMap((a) => a.ofertas);
  assert.equal(ofertas.find((o) => o.item === 'semente-milho').liberado, false);
  assert.equal(ofertas.find((o) => o.item === 'semente-rabanete').liberado, true);
  assert.equal(ofertas.find((o) => o.item === 'semente-rabanete').preco, 2);
});

test('cesto maior: compra uma vez só, a capacidade cresce e o que estava no cesto continua', () => {
  const m = comColheita();
  colher(m, QUATRO.slice(0, 2));
  m.posses.ouro = 60;
  assert.equal(m.comando({ tipo: 'comprar', item: 'cesto-grande' }).ok, true);
  assert.equal(capacidadeDoCesto(m), 12);
  assert.equal(noCesto(m), 4);
  const r = m.comando({ tipo: 'comprar', item: 'cesto-grande' });
  assert.equal(r.ok, false); assert.equal(r.motivo, 'ja-tem');
  assert.equal(m.posses.ouro, 35);
});

test('regador melhor: toma o lugar do velho no cinto e leva a água junto', () => {
  const m = novoMundo();
  m.progresso.nivel = 2; m.posses.ouro = 50;
  encher(m);
  assert.equal(ferramentaNoCinto(m, 'regador'), 'regador');
  assert.equal(m.comando({ tipo: 'comprar', item: 'regador-grande' }).ok, true);
  assert.equal(ferramentaNoCinto(m, 'regador'), 'regador-grande');
  assert.equal(m.posses.ferramentas['regador-grande'].agua, 3);
  assert.equal(m.posses.ferramentas.regador.onde, 'suporte');
  encher(m);
  assert.equal(m.posses.ferramentas['regador-grande'].agua, 8);
});

test('ninguém fica travado: sem semente, sem planta e sem ouro, o vizinho dá sementes', () => {
  const m = novoMundo((b) => { b.regras.antiTrava = { semente: 'semente-rabanete', quantidade: 4 }; }), ev = ouvirTudo(m);
  m.avancar(2);
  assert.equal(ev.de('socorro').length, 0, 'com sementes na bolsa não há socorro');
  m.posses.bolsa['semente-rabanete'] = 0; m.posses.ouro = 1;
  m.avancar(2);
  assert.deepEqual(ev.de('socorro'), [{ item: 'semente-rabanete', n: 4 }]);
  assert.equal(m.posses.bolsa['semente-rabanete'], 4);
  // e também na volta de uma ausência
  m.posses.bolsa['semente-rabanete'] = 0;
  pular(m, 600);
  assert.equal(m.posses.bolsa['semente-rabanete'], 4);
});
