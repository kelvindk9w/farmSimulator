// O terreno: o mapa nasce de terras.json, com a área do jogador, as construções, os lotes à venda e a natureza.
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, ateParar, ouvirTudo, modo, tocar, tocarEm } from './apoio.mjs';
import { GRAMA, ARADA, CAMINHO } from '../src/nucleo/local.js';
import { descreverCasa, descreverEntidade } from '../src/nucleo/sistemas/personagem.js';
import { prepararDados } from '../src/nucleo/dados.js';
import { brutoDeTeste } from './apoio.mjs';

test('o mapa nasce com o tamanho, a área inicial e as construções de terras.json', () => {
  const m = novoMundo(), loc = m.local;
  assert.equal(loc.l, 24); assert.equal(loc.p, 24);
  assert.equal(loc.ehPropria(4, 4), true);
  assert.equal(loc.ehPropria(19, 19), true);
  assert.equal(loc.ehPropria(20, 10), false, 'o lote do leste ainda não é dela');
  assert.equal(loc.ehPropria(3, 10), false);
  for (const id of ['casa', 'celeiro', 'poco', 'banca']) assert.ok(loc.porId[id], `falta ${id}`);
  const cel = loc.porId.celeiro;
  assert.equal(loc.entidadeEm(cel.x, cel.z).id, 'celeiro');
  assert.equal(loc.entidadeEm(cel.x + cel.l - 1, cel.z + cel.p - 1).id, 'celeiro', 'a construção ocupa a base inteira');
  assert.equal(loc.andavel(cel.x, cel.z), false);
  assert.equal(loc.chao[loc.i(10, 9)], CAMINHO);
  assert.equal(loc.chao[loc.i(12, 13)], GRAMA);
});

test('fora da área inicial há mato, pedra, toco e árvore; dentro dela (sem natureza pedida), nada', () => {
  const m = novoMundo(), loc = m.local;
  const obst = loc.entidades.filter((e) => ['mata', 'mato', 'pedra', 'toco'].includes(e.tipo));
  assert.ok(obst.length > 10, 'o mato de fora devia existir');
  assert.ok(obst.every((e) => !loc.ehPropria(e.x, e.z)));
  assert.ok(obst.every((e) => !loc.andavel(e.x, e.z)), 'obstáculo bloqueia a casa');
  // o mapa nasce sempre igual (não depende de sorteio de relógio)
  const m2 = novoMundo();
  assert.deepEqual(m2.local.entidades.map((e) => e.id), loc.entidades.map((e) => e.id));
});

test('cada lote à venda tem a sua placa, com preço e nível', () => {
  const m = novoMundo(), placa = m.local.porId['placa-lote-leste'];
  assert.ok(placa);
  assert.equal(m.local.ehPropria(placa.x, placa.z), false);
  // o toque na placa pede o painel da compra (a compra em si está em terras.test.mjs)
  const ev = ouvirTudo(m), r = tocarEm(m, 'placa-lote-leste'), d = descreverEntidade(m, 'placa-lote-leste');
  assert.equal(r.ok, true);
  assert.deepEqual(ev.de('pediuPainel')[0], { painel: 'terras', arg: { lote: 'lote-leste' }, entidade: 'placa-lote-leste' });
  assert.equal(d.texto, 'lote-a-venda');
  assert.equal(d.dados.preco, 100); assert.equal(d.dados.nivel, 2); assert.equal(d.dados.nome, 'Lote do leste');
});

test('a natureza da área inicial fica fora do miolo limpo e nunca fecha o caminho', () => {
  const m = novoMundo((b) => { b.terras.inicial.limpo = [8, 8, 16, 16]; b.terras.inicial.natureza = { mato: 0.5, pedra: 0.2, toco: 0.2 }; }), loc = m.local;
  const dentro = loc.entidades.filter((e) => ['mato', 'pedra', 'toco'].includes(e.tipo) && loc.ehPropria(e.x, e.z));
  if (m.terras.aviso) assert.equal(dentro.length, 0, 'com o caminho fechado, a área inicial nasce limpa');
  else {
    assert.ok(dentro.length > 20);
    assert.ok(dentro.every((e) => !(e.x >= 8 && e.x < 16 && e.z >= 8 && e.z < 16)), 'o miolo limpo não tem mato');
    assert.equal(descreverCasa(m, dentro[0].x, dentro[0].z).texto, 'sem-ferramenta-de-limpar', 'sem foice, machado nem picareta, o toque diz o que falta');
  }
});

test('mato demais na área inicial: o jogo abre a área limpa e avisa, em vez de prender a personagem', () => {
  const m = novoMundo((b) => { b.terras.inicial.limpo = [10, 10, 11, 11]; b.terras.inicial.natureza = { mato: 1 }; });
  assert.match(m.terras.aviso, /limpa/);
  assert.equal(m.local.entidades.filter((e) => e.tipo === 'mato' && m.local.ehPropria(e.x, e.z)).length, 0);
});

test('terra à venda não se ara: o toque avisa e nada muda', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  modo(m, 'enxada');
  // acha uma casa livre fora da área
  let alvo = null;
  for (let z = 4; z < 20 && !alvo; z++) if (!m.local.entidadeEm(21, z)) alvo = [21, z];
  const r = tocar(m, alvo[0], alvo[1]);
  assert.equal(r.ok, false); assert.equal(r.motivo, 'terra-a-venda');
  assert.equal(ev.de('faltou')[0].motivo, 'terra-a-venda');
  assert.equal(m.personagem.fila.length, 0);
});

test('a enxada vira grama em terra arada; caminho e construção não se aram', () => {
  const m = novoMundo(), loc = m.local;
  modo(m, 'enxada');
  assert.equal(tocar(m, 12, 13).ok, true);
  ateParar(m);
  assert.equal(loc.chao[loc.i(12, 13)], ARADA);
  const r = tocar(m, 12, 13);
  assert.equal(r.ok, false); assert.equal(r.motivo, 'ja-arado');
  assert.equal(descreverCasa(m, 10, 9), null, 'no caminho o toque só anda');
  tocar(m, 10, 9); ateParar(m);
  assert.equal(loc.chao[loc.i(10, 9)], CAMINHO);
});

test('dados com erro são recusados com explicação (o jogo mostra a lista em vez de começar)', () => {
  const b = brutoDeTeste();
  delete b.terras.mapa;
  b.culturas.rabanete.semente = 'semente-que-nao-existe';
  const { problemas } = prepararDados(b);
  assert.ok(problemas.some((p) => p.grave && /mapa/.test(p.texto)));
  assert.ok(problemas.some((p) => /semente-que-nao-existe/.test(p.texto)));
});
