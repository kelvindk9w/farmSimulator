// O caminho: a personagem contorna o que bloqueia, para no lugar certo e avisa quando não há como chegar.
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, ateParar, ouvirTudo, tocar, tocarEm } from './apoio.mjs';
import { acharCaminho, cabe, comprimento } from '../src/nucleo/caminho.js';

test('a rota contorna a construção e todo ponto dela é lugar onde ela cabe', () => {
  const m = novoMundo(), loc = m.local, cel = loc.porId.celeiro;
  // de um lado do celeiro ao outro
  const ax = cel.x - 0.5, az = cel.z + 1.5, bx = cel.x + cel.l + 0.5, bz = cel.z + 1.5;
  const rota = acharCaminho(loc, ax, az, bx, bz);
  assert.ok(rota && rota.length >= 2);
  assert.ok(rota.every(([x, z]) => cabe(loc, x, z)));
  assert.deepEqual(rota[rota.length - 1], [bx, bz]);
  assert.ok(comprimento(ax, az, rota) > cel.l + 1, 'não atravessa o celeiro em linha reta');
});

test('em campo aberto a rota é reta (sem ziguezague de grade)', () => {
  const m = novoMundo(), rota = acharCaminho(m.local, 6.5, 12.5, 14.5, 17.5);
  assert.equal(rota.length, 1);
  assert.ok(Math.abs(comprimento(6.5, 12.5, rota) - Math.hypot(8, 5)) < 1e-6);
});

test('irPara anda até o ponto pedido e para exatamente nele', () => {
  const m = novoMundo(), p = m.personagem;
  assert.equal(m.comando({ tipo: 'irPara', x: 15.25, z: 16.75 }).ok, true);
  ateParar(m);
  assert.ok(Math.abs(p.x - 15.25) < 1e-6 && Math.abs(p.z - 16.75) < 1e-6);
  assert.equal(p.vel, 0);
});

test('irPara num ponto bloqueado vai para a casa livre mais perto', () => {
  const m = novoMundo(), p = m.personagem, cel = m.local.porId.celeiro;
  assert.equal(m.comando({ tipo: 'irPara', x: cel.x + 1.5, z: cel.z + 1.5 }).ok, true);
  ateParar(m);
  assert.ok(cabe(m.local, p.x, p.z));
  assert.ok(Math.hypot(p.x - (cel.x + 1.5), p.z - (cel.z + 1.5)) < 3.2);
});

test('para agir numa construção ela para encostada, virada para ela', () => {
  const m = novoMundo(), p = m.personagem, poco = m.local.porId.poco;
  m.posses.ferramentas.regador.onde = 'cinto';
  tocarEm(m, 'poco');
  // anda até começar a ação
  for (let k = 0; k < 3000 && !p.acao; k++) m.passo();
  assert.equal(p.acao.id, 'encher');
  const cx = poco.x + poco.l / 2, cz = poco.z + poco.p / 2;
  assert.ok(Math.hypot(p.x - cx, p.z - cz) < Math.max(poco.l, poco.p) / 2 + 1.2);
  assert.ok(Math.abs(Math.atan2(cx - p.x, cz - p.z) - p.rumo) < 0.01, 'fica virada para o poço');
  ateParar(m);
});

test('sem caminho até a casa, ela não fica presa: avisa e segue com o resto', () => {
  const m = novoMundo(), loc = m.local, ev = ouvirTudo(m);
  // cerca a casa (12, 16) de pedras
  for (let z = 14; z <= 18; z++) for (let x = 10; x <= 14; x++) if (Math.max(Math.abs(x - 12), Math.abs(z - 16)) === 2) loc.por({ id: `p-${x}-${z}`, tipo: 'pedra', x, z });
  assert.equal(acharCaminho(loc, m.personagem.x, m.personagem.z, 12.5, 16.5), null);
  m.comando({ tipo: 'escolherModo', modo: 'enxada' });
  tocar(m, 12, 16); tocar(m, 6, 13);
  ateParar(m);
  assert.equal(ev.de('faltou').some((d) => d.motivo === 'sem-caminho'), true);
  assert.deepEqual(ev.de('arou'), [{ x: 6, z: 13 }], 'a tarefa seguinte da fila é feita');
});
