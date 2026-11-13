import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, ateParar, ouvirTudo } from './apoio.mjs';

test('o mundo de teste nasce e a personagem ara uma casa', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  assert.equal(m.comando({ tipo: 'escolherModo', modo: 'enxada' }).ok, true);
  assert.equal(m.comando({ tipo: 'tocarCasa', x: 12, z: 13 }).ok, true);
  ateParar(m);
  assert.deepEqual(ev.de('arou'), [{ x: 12, z: 13 }]);
});
