// Experiência, níveis e as missões do vizinho.
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, ateParar, ouvirTudo, arar, tocarEm, colher, plantarAtePronta, CAMPO } from './apoio.mjs';
import { darXp, barraDeXp } from '../src/nucleo/sistemas/niveis.js';
import { missaoAtual, missaoPossivel } from '../src/nucleo/sistemas/missoes.js';
import { guiaDaMissao } from '../src/nucleo/guia.js';

test('a experiência enche a barra e sobe o nível no limiar, com a recompensa do nível', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  assert.deepEqual(barraDeXp(m), { nivel: 1, feito: 0, precisa: 10, fracao: 0 });
  darXp(m, 9, 'teste');
  assert.equal(m.progresso.nivel, 1);
  assert.equal(barraDeXp(m).fracao, 0.9);
  darXp(m, 1, 'teste');
  assert.equal(m.progresso.nivel, 2);
  assert.equal(m.posses.ouro, 20 + 15); assert.equal(m.posses.cash, 3 + 1); assert.equal(m.posses.bolsa['semente-milho'], 2);
  const s = ev.de('subiuDeNivel');
  assert.equal(s.length, 1); assert.equal(s[0].nivel, 2);
  assert.deepEqual(s[0].recompensa, { ouro: 15, cash: 1, itens: { 'semente-milho': 2 } });
  assert.deepEqual(s[0].liberou.map((x) => x.id).sort(), ['milho', 'regador-grande'], 'o que tem "nivel": 2 nos dados');
  assert.deepEqual(barraDeXp(m), { nivel: 2, feito: 0, precisa: 20, fracao: 0 });
});

test('experiência de sobra sobe vários níveis de uma vez (um evento por nível) e para no último', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  darXp(m, 500, 'teste');
  assert.equal(m.progresso.nivel, 4);
  assert.deepEqual(ev.de('subiuDeNivel').map((d) => d.nivel), [2, 3, 4]);
  assert.equal(m.posses.ouro, 20 + 15 + 30);
  assert.equal(barraDeXp(m).fracao, 1);
  darXp(m, 500, 'teste');
  assert.equal(m.progresso.nivel, 4);
});

test('arar dá a experiência de regras.json; colher dá a da cultura', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  arar(m, [[12, 13]]);
  assert.deepEqual(ev.de('ganhouXp'), [{ n: 1, origem: 'arar' }]);
  assert.equal(m.progresso.xp, 1);
});

test('as missões vêm na ordem; cada uma conta o seu evento e paga a recompensa', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  let a = missaoAtual(m);
  assert.equal(a.missao.id, 'arar-2'); assert.equal(a.conta, 0); assert.equal(a.n, 2); assert.equal(a.total, 3);
  arar(m, [[12, 13]]);
  assert.equal(missaoAtual(m).conta, 1);
  assert.deepEqual(ev.de('missaoAndou'), [{ id: 'arar-2', conta: 1, n: 2 }]);
  arar(m, [[13, 13]]);
  assert.equal(m.posses.ouro, 25, 'a recompensa da primeira missão');
  const c = ev.de('missaoConcluida');
  assert.equal(c.length, 1); assert.equal(c[0].id, 'arar-2'); assert.equal(c[0].proxima, 'colher-rabanete');
  assert.deepEqual(m.missoes.feitas, ['arar-2']);
  // a segunda conta unidades colhidas (2 por pé), e só de rabanete
  a = missaoAtual(m);
  assert.equal(a.missao.id, 'colher-rabanete'); assert.equal(a.conta, 0);
  arar(m, [[12, 14]]);
  assert.equal(missaoAtual(m).conta, 0, 'arar não conta para a missão de colher');
  plantarAtePronta(m, CAMPO.slice(0, 2));
  const xp = m.progresso.xp;
  colher(m, CAMPO.slice(0, 2));
  assert.deepEqual(m.missoes.feitas, ['arar-2', 'colher-rabanete']);
  assert.equal(m.progresso.xp, xp + 3 + 3 + 6, 'a experiência da colheita e a da missão');
  assert.equal(m.posses.bolsa['semente-rabanete'], 1 + 2);
  // a terceira: vender
  tocarEm(m, 'banca'); ateParar(m);
  assert.deepEqual(m.missoes.feitas, ['arar-2', 'colher-rabanete', 'vender']);
  assert.equal(m.posses.cash, 3 + 1 + (m.progresso.nivel >= 2 ? 1 : 0));
  assert.equal(missaoAtual(m), null, 'acabaram as missões');
});

test('missão que depende do que ainda não existe no jogo é pulada, sem travar a fila', () => {
  const m = novoMundo((b) => {
    b.missoes.vizinho.unshift({ id: 'ordenhar', titulo: 'Leite', fala: '...', objetivo: { evento: 'ordenhou', n: 1 }, recompensa: {} });
    b.missoes.vizinho.splice(2, 0, { id: 'colher-jaca', titulo: 'Jaca', fala: '...', objetivo: { evento: 'colheu', filtro: { item: 'jaca' }, n: 1 }, recompensa: {} });
    b.missoes.vizinho.splice(3, 0, { id: 'arar-na-chuva', titulo: 'Chuva', fala: '...', objetivo: { evento: 'arou', filtro: { clima: 'chuva' }, n: 1 }, recompensa: {} });
  });
  const V = m.dados.missoes.vizinho;
  assert.deepEqual(V.map((x) => missaoPossivel(m, x)), [false, true, false, false, true, true]);
  assert.equal(missaoAtual(m).missao.id, 'arar-2');
  arar(m, [[12, 13], [13, 13]]);
  assert.equal(missaoAtual(m).missao.id, 'colher-rabanete');
});

test('missão de nível mais alto espera o jogador subir (e não conta antes)', () => {
  const m = novoMundo((b) => { b.missoes.vizinho[0].nivel = 2; });
  assert.equal(missaoAtual(m).esperaNivel, 2);
  arar(m, [[12, 13], [13, 13]]);
  assert.equal(missaoAtual(m).conta, 0);
  assert.deepEqual(m.missoes.feitas, []);
  darXp(m, 10, 'teste');
  assert.equal(missaoAtual(m).esperaNivel, 0);
  arar(m, [[12, 14], [13, 14]]);
  assert.deepEqual(m.missoes.feitas, ['arar-2']);
});

test('o guia leva um jogador obediente por todas as missões', () => {
  const m = novoMundo(), g = {};
  let voltas = 0;
  while (missaoAtual(m) && voltas++ < 200) {
    guiaDaMissao(m, g);
    if (g.tipo === 'modo') m.comando({ tipo: 'escolherModo', modo: g.modo });
    else if (g.tipo === 'semente') m.comando({ tipo: 'escolherModo', modo: 'semear', semente: g.item });
    else if (g.tipo === 'casa') assert.equal(m.comando({ tipo: 'tocarCasa', x: g.x + 0.5, z: g.z + 0.5 }).ok, true, `o guia mandou tocar em (${g.x}, ${g.z}) e não valeu`);
    else if (g.tipo === 'entidade') assert.equal(m.comando({ tipo: 'tocarEntidade', id: g.id }).ok, true, `o guia mandou tocar em ${g.id} e não valeu`);
    else if (g.tipo === 'painel') assert.equal(m.comando({ tipo: 'comprar', item: g.item || 'semente-rabanete', n: 1 }).ok, true);
    else if (g.tipo === 'esperar') m.acertarRelogio(m.agora + (g.seg + 1) * 1000);
    else assert.fail(`o guia ficou sem saber o que fazer na missão ${missaoAtual(m).missao.id}`);
    ateParar(m);
  }
  assert.equal(missaoAtual(m), null, `parou na missão ${missaoAtual(m) && missaoAtual(m).missao.id}`);
  assert.ok(voltas < 60, `demorou ${voltas} passos`);
});
