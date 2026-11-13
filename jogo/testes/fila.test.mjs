// A fila de tarefas: cada toque enfileira; um toque faz a cadeia toda (inclusive buscar a ferramenta no suporte).
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, ateParar, ouvirTudo, modo, tocar, tocarEm, arar, semear, encher, regar, CAMPO } from './apoio.mjs';
import { filaTem, ocupada } from '../src/nucleo/sistemas/personagem.js';
import { listaDeFerramentas } from '../src/nucleo/sistemas/posses.js';

test('os toques são cumpridos na ordem; toque repetido na mesma casa não duplica', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  modo(m, 'enxada');
  for (const [x, z] of CAMPO) assert.equal(tocar(m, x, z).ok, true);
  const r = tocar(m, 12, 13);
  assert.equal(r.ok, true); assert.equal(r.repetida, true);
  assert.equal(m.personagem.fila.length, 4);
  assert.equal(filaTem(m, 'arar', 13, 14), true);
  ateParar(m);
  assert.deepEqual(ev.de('arou').map((d) => [d.x, d.z]), CAMPO);
  assert.equal(ocupada(m), false);
});

test('a fila tem tamanho máximo e avisa quando enche', () => {
  const m = novoMundo((b) => { b.regras.filaMax = 3; });
  modo(m, 'enxada');
  assert.equal(tocar(m, 6, 12).ok, true); assert.equal(tocar(m, 7, 12).ok, true); assert.equal(tocar(m, 8, 12).ok, true);
  const r = tocar(m, 9, 12);
  assert.equal(r.ok, false); assert.equal(r.motivo, 'fila-cheia');
});

test('cancelar e tocar no chão (modo mão) largam a fila; a ação que já fez efeito não é desfeita', () => {
  const m = novoMundo(), p = m.personagem, ev = ouvirTudo(m);
  modo(m, 'enxada');
  for (const [x, z] of CAMPO) tocar(m, x, z);
  // espera a primeira casa ser arada e, no meio do gesto, manda andar para outro lado
  while (ev.de('arou').length < 1) m.passo();
  assert.ok(p.acao && p.acao.feito);
  modo(m, 'mao');
  assert.equal(tocar(m, 7, 17).ok, true);
  assert.equal(p.fila.length, 1); assert.equal(p.fila[0].tipo, 'andar');
  ateParar(m);
  assert.equal(ev.de('arou').length, 1, 'as outras casas ficaram para depois');
  assert.ok(Math.hypot(p.x - 7.5, p.z - 17.5) < 1e-6);
  modo(m, 'enxada');
  for (const [x, z] of CAMPO) tocar(m, x, z);
  m.comando({ tipo: 'cancelar' });
  assert.equal(ocupada(m), false);
});

test('a ação pede ferramenta que está no suporte: ela mesma vai buscar no celeiro e volta', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  arar(m, [[12, 13]]); semear(m, [[12, 13]]);
  assert.deepEqual(listaDeFerramentas(m, 'cinto'), ['enxada']);
  // um toque só: buscar o regador (o cinto tem uma vaga: a enxada volta ao suporte) e encher no poço
  assert.equal(tocarEm(m, 'poco').ok, true);
  ateParar(m);
  assert.deepEqual(ev.de('pegouFerramenta').map((d) => [d.item, d.guardou]), [['regador', 'enxada']]);
  assert.deepEqual(listaDeFerramentas(m, 'cinto'), ['regador']);
  assert.equal(m.posses.ferramentas.regador.agua, 3);
  assert.deepEqual(ev.tipos().filter((t) => t === 'pegouFerramenta' || t === 'encheu'), ['pegouFerramenta', 'encheu']);
  // e para arar de novo ela troca sozinha outra vez
  arar(m, [[13, 13]]);
  assert.deepEqual(listaDeFerramentas(m, 'cinto'), ['enxada']);
  assert.equal(ev.de('arou').length, 2);
});

test('com duas vagas no cinto ninguém volta ao celeiro', () => {
  const m = novoMundo((b) => { b.regras.inicio.vagasNoCinto = 2; b.regras.inicio.cinto = ['enxada', 'regador']; b.regras.inicio.suporte = []; }), ev = ouvirTudo(m);
  arar(m, [[12, 13]]); semear(m, [[12, 13]]); encher(m); regar(m, [[12, 13]]);
  assert.equal(ev.de('pegouFerramenta').length, 0);
  assert.equal(ev.de('regou').length, 1);
});

test('quando falta o material, as tarefas iguais saem da fila de uma vez (um aviso só)', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  arar(m, CAMPO);
  // três sementes para quatro casas: a quarta nem entra na fila
  modo(m, 'semear', 'semente-rabanete');
  const rs = CAMPO.map(([x, z]) => tocar(m, x, z));
  assert.deepEqual(rs.map((r) => r.ok), [true, true, true, false]);
  assert.equal(rs[3].motivo, 'sem-sementes');
  // alguém tira as sementes da bolsa no meio do caminho: a primeira falha e leva as outras
  m.posses.bolsa['semente-rabanete'] = 0;
  ev.limpar();
  ateParar(m);
  assert.equal(ev.de('faltou').length, 1);
  assert.equal(ev.de('plantou').length, 0);
});

test('planta crescendo: o toque só informa e não desmancha a fila', () => {
  const m = novoMundo((b) => { b.regras.inicio.vagasNoCinto = 2; b.regras.inicio.cinto = ['enxada', 'regador']; b.regras.inicio.suporte = []; }), ev = ouvirTudo(m);
  arar(m, CAMPO); m.posses.bolsa['semente-rabanete'] = 4; semear(m, CAMPO); encher(m); regar(m, [CAMPO[0]]);
  modo(m, 'mao');
  tocar(m, ...CAMPO[1]); tocar(m, ...CAMPO[2]);
  const r = tocar(m, ...CAMPO[0]);
  assert.equal(r.ok, false); assert.equal(r.motivo, 'crescendo');
  assert.equal(ev.de('informou').length, 1);
  assert.equal(m.personagem.fila.length + (m.personagem.tarefa ? 1 : 0), 2);
  ateParar(m);
  assert.equal(ev.de('regou').length, 3);
});

test('andar pelas teclas larga a fila na hora', () => {
  const m = novoMundo();
  modo(m, 'enxada');
  for (const [x, z] of CAMPO) tocar(m, x, z);
  m.avancar(0.2);
  m.comando({ tipo: 'rumar', dx: 1, dz: 0 });
  assert.equal(m.personagem.fila.length, 0);
  m.comando({ tipo: 'frear' });
  ateParar(m);
});

test('a tecla de ação age na casa à frente dela, sem andar', () => {
  const m = novoMundo(), p = m.personagem, ev = ouvirTudo(m);
  modo(m, 'enxada');
  p.x = 12.5; p.z = 12.5; p.rumo = 0; // virada para +Z
  assert.equal(m.comando({ tipo: 'agir' }).ok, true);
  ateParar(m);
  assert.deepEqual(ev.de('arou'), [{ x: 12, z: 13 }]);
  assert.ok(Math.hypot(p.x - 12.5, p.z - 12.5) < 1e-6);
  const r = m.comando({ tipo: 'agir' });
  assert.equal(r.ok, false); assert.equal(r.motivo, 'ja-arado');
});
