// Animais de estimação: o cachorro e o gato andam atrás da personagem, o toque é um afago e, uma vez por dia, o afago
// rende um mimo sorteado (com semente gravada: o mesmo jogo dá sempre os mesmos mimos).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ateParar, ouvirTudo, tocarEm, pular, arar, semear } from './apoio.mjs';
import { mundoDoTrabalho, passos } from './apoio-trabalho.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { EVENTOS } from '../src/nucleo/registro.js';
import { guiaDoEvento } from '../src/nucleo/guia.js';
import { descreverEntidade } from '../src/nucleo/sistemas/personagem.js';
import { podeComprarAnimal, porAnimal } from '../src/nucleo/sistemas/animais.js';
import { bichoSolto } from '../src/nucleo/sistemas/acompanhar.js';
import { temMimo, bichosDeEstimacao } from '../src/nucleo/sistemas/estimacao.js';

const copia = (o) => JSON.parse(JSON.stringify(o));
const recarregar = (m) => Mundo.carregar(m.dados, copia(m.salvar()));
const dist = (m, e) => Math.hypot(e.x + 0.5 - m.personagem.x, e.z + 0.5 - m.personagem.z);
function comprar(m, animal) {
  m.posses.ouro += 100;
  const r = m.comando({ tipo: 'comprarAnimal', animal });
  assert.equal(r.ok, true);
  m.passo();
  return m.animais.lista.find((a) => a.id === r.dados.id);
}

test('compra-se na loja sem abrigo; o especial do cash chega pela mesma família; a missão "companheiro" vale', () => {
  const m = mundoDoTrabalho(), ev = ouvirTudo(m);
  assert.equal(podeComprarAnimal(m, 'gato').ok, true);
  const gato = comprar(m, 'gato');
  assert.equal(gato.abrigo, null);
  assert.deepEqual(ev.de('comprou').map((d) => [d.animal, d.familia]), [['gato', 'estimacao']]);
  assert.equal(EVENTOS.comprou.aceita(m.dados, { familia: 'estimacao' }), true);
  assert.equal(EVENTOS.comprou.jaTem(m, { familia: 'estimacao' }, 1), true);
  const e = bichoSolto(m, gato.id);
  assert.ok(e && e.tipo === 'bicho' && dist(m, e) < 3, 'apareceu ao lado dela');
  // o siamês (entrega do cash): mesma família, figura do gato
  const s = porAnimal(m, 'gato-siames');
  m.passo();
  assert.equal(bichoSolto(m, s.id).figura, 'gato');
  assert.equal(bichosDeEstimacao(m).length, 2);
  // o guia da missão: a aba "Animais" da loja, no mais barato
  const out = {};
  guiaDoEvento(m, 'comprou', { familia: 'estimacao' }, out);
  assert.deepEqual([out.tipo, out.painel, out.item], ['painel', 'animais', 'gato']);
});

test('o bicho vai atrás dela, senta quando ela para e não entra na lavoura', () => {
  const m = mundoDoTrabalho();
  const gato = comprar(m, 'gato'), cao = comprar(m, 'cachorro');
  const g = bichoSolto(m, gato.id), c = bichoSolto(m, cao.id);
  m.comando({ tipo: 'irPara', x: 17.5, z: 17.5 }); ateParar(m);
  passos(m, 4);
  assert.ok(dist(m, g) < 3.2 && dist(m, c) < 3.2, `perto dela (${dist(m, g).toFixed(1)}, ${dist(m, c).toFixed(1)})`);
  assert.equal(g.estado, 'sentado'); assert.equal(c.estado, 'sentado');
  assert.ok(Math.hypot(g.x - c.x, g.z - c.z) > 0.3, 'um não fica em cima do outro');
  // uma lavoura entre ela e eles: ela atravessa, eles dão a volta (ou esperam na beira)
  const campo = [];
  for (let x = 11; x <= 15; x++) for (let z = 14; z <= 17; z++) campo.push([x, z]);
  m.posses.bolsa['semente-rabanete'] = 40;
  m.dados.regras.filaMax = 40;
  arar(m, campo); semear(m, campo);
  const loc = m.locais.fazenda, plantada = (e) => !!loc.plantas[Math.floor(e.z + 0.5) * loc.l + Math.floor(e.x + 0.5)];
  m.comando({ tipo: 'irPara', x: 16.5, z: 15.5 }); ateParar(m); passos(m, 2);
  const antes = [plantada(g), plantada(c)];
  m.comando({ tipo: 'irPara', x: 13.5, z: 15.5 });
  let pisou = 0;
  for (let n = 0; n < 60 * 8; n++) { m.passo(); if ((plantada(g) && !antes[0]) || (plantada(c) && !antes[1])) pisou++; }
  assert.equal(pisou, 0, 'não pisaram na lavoura');
});

test('o afago: "afagou" sempre; o mimo do dia uma vez só; no dia seguinte, de novo', () => {
  const m = mundoDoTrabalho(), ev = ouvirTudo(m);
  const gato = comprar(m, 'gato'), e = bichoSolto(m, gato.id);
  assert.equal(temMimo(m, gato), true);
  assert.deepEqual(descreverEntidade(m, e.id), { acao: 'afagar', dados: { animal: 'gato', mimo: true } });
  const milho = m.posses.bolsa['semente-milho'] || 0, rab = m.posses.bolsa['semente-rabanete'] || 0;
  tocarEm(m, e.id); ateParar(m);
  assert.deepEqual(ev.de('afagou').map((d) => d.animal), ['gato']);
  const [mimo] = ev.de('ganhouMimo');
  assert.ok(mimo && mimo.animal === 'gato');
  assert.ok((mimo.item === 'semente-milho' && mimo.n === 4) || (mimo.item === 'semente-rabanete' && mimo.n === 3));
  assert.equal((m.posses.bolsa['semente-milho'] || 0) + (m.posses.bolsa['semente-rabanete'] || 0), milho + rab + mimo.n);
  assert.equal(temMimo(m, gato), false);
  // o segundo afago do dia: só carinho
  tocarEm(m, e.id); ateParar(m);
  assert.equal(ev.de('afagou').length, 2); assert.equal(ev.de('ganhouMimo').length, 1);
  // amanhã
  pular(m, 24 * 3600);
  assert.equal(temMimo(m, gato), true);
  tocarEm(m, e.id); ateParar(m);
  assert.equal(ev.de('ganhouMimo').length, 2);
  // a regra geral manda: com mimosPorDia 0 ninguém dá mimo
  const n = mundoDoTrabalho((b) => { b.regras.estimacao.mimosPorDia = 0; });
  assert.equal(temMimo(n, comprar(n, 'gato')), false);
});

test('o sorteio do mimo é o mesmo para o mesmo jogo, e a semente vai na gravação', () => {
  const mimos = (m, dias) => {
    const ev = ouvirTudo(m), a = m.animais.lista.find((x) => x.familia === 'estimacao'), e = bichoSolto(m, a.id);
    for (let d = 0; d < dias; d++) { tocarEm(m, e.id); ateParar(m); pular(m, 24 * 3600); }
    return ev.de('ganhouMimo').map((x) => x.item);
  };
  const a = mundoDoTrabalho(), b = mundoDoTrabalho();
  comprar(a, 'cachorro'); comprar(b, 'cachorro');
  const la = mimos(a, 6), lb = mimos(b, 6);
  assert.deepEqual(la, lb);
  assert.ok(new Set(la).size > 1, 'o sorteio varia: ' + la.join(', '));
  // gravou no meio: a continuação é a mesma
  const c = mundoDoTrabalho();
  comprar(c, 'cachorro');
  const l1 = mimos(c, 3), d = recarregar(c);
  d.passo();
  assert.deepEqual([...l1, ...mimos(d, 3)], la);
});

test('gravar e abrir: só quais bichos e o dia do último mimo; eles voltam ao lado dela', () => {
  const m = mundoDoTrabalho();
  const gato = comprar(m, 'gato');
  tocarEm(m, bichoSolto(m, gato.id).id); ateParar(m);
  const g = copia(m.salvar());
  assert.deepEqual(Object.keys(g.sistemas.estimacao), ['semente']);
  const salvo = g.sistemas.animais.lista.find((a) => a.id === gato.id);
  assert.equal(typeof salvo.mimoDia, 'number'); assert.equal(salvo.mimoN, 1);
  assert.ok(!JSON.stringify(g).includes('bicho:'), 'o passeio não é gravado');
  const n = Mundo.carregar(m.dados, g);
  n.passo();
  const e = bichoSolto(n, gato.id);
  assert.ok(e && dist(n, e) < 3);
  assert.equal(temMimo(n, n.animais.lista[0]), false, 'o mimo de hoje já foi');
  // o bicho que sai da fazenda some do terreiro
  n.animais.lista.length = 0; n.animais.versao++;
  n.passo();
  assert.equal(bichoSolto(n, gato.id), null);
});

test('o guia do afago aponta o bicho que ainda tem mimo hoje', () => {
  const m = mundoDoTrabalho();
  const gato = comprar(m, 'gato'), cao = comprar(m, 'cachorro'), out = {};
  tocarEm(m, bichoSolto(m, gato.id).id); ateParar(m);
  guiaDoEvento(m, 'ganhouMimo', {}, out);
  assert.deepEqual([out.tipo, out.id], ['entidade', 'bicho:' + cao.id]);
  assert.equal(EVENTOS.afagou.aceita(m.dados, { animal: 'gato' }), true);
});
