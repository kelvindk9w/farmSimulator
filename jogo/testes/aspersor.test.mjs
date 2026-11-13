// O aspersor rega sozinho as casas em volta, também com o jogo fechado. Quem o coloca no terreno é o sistema de
// construir; aqui a entidade é posta à mão (basta existir uma de tipo "aspersor", pronta).
import test from 'node:test';
import assert from 'node:assert/strict';
import { dadosDeTeste, ouvirTudo, arar, semear, pular, modo, tocar, ateParar } from './apoio.mjs';
import { comTerras, mundoDasTerras } from './apoio-terras.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { TIPOS, registrarTipo } from '../src/nucleo/registro.js';
import { plantaEm, estadoDaPlanta } from '../src/nucleo/sistemas/lavoura.js';
import { raioDoAspersor, casasDoAspersor, regadaPorAspersor, aspersoresDe } from '../src/nucleo/sistemas/aspersor.js';

if (!TIPOS.aspersor) registrarTipo({ tipo: 'aspersor', casas: [1, 1], bloqueia: true }); // nos dados pequenos não há a construção
const estado = (m, x, z) => { const pl = plantaEm(m, x, z); return pl ? estadoDaPlanta(m, pl) : null; };
// milho (2 regas, 600 s) perto e longe do lugar do aspersor
const PERTO = [[11, 13], [12, 14]], LONGE = [[16, 13]];
function comMilho(mais) {
  const m = mundoDasTerras(mais);
  m.progresso.nivel = 2; m.posses.bolsa['semente-milho'] = 5;
  arar(m, [...PERTO, ...LONGE]); semear(m, [...PERTO, ...LONGE], 'semente-milho');
  return m;
}
const porAspersor = (m, x, z, mais) => m.local.por({ id: 'aspersor-1', tipo: 'aspersor', x, z, ...mais });

test('o alcance vem dos dados (padrão 2: as 24 casas em volta)', () => {
  const m = mundoDasTerras();
  assert.equal(raioDoAspersor(m), 2);
  assert.equal(casasDoAspersor(m, m.local, 12, 12).length, 24);
  assert.equal(casasDoAspersor(m, m.local, 0, 0).length, 8, 'na quina do mapa, só o que existe');
  const m2 = mundoDasTerras((b) => { b.construcoes.aspersor = { nome: 'Aspersor', tipo: 'util', onde: 'fazenda', casas: [1, 1], custo: { ouro: 5 }, obraSeg: 0, nivel: 1, efeito: { tipo: 'regar', raio: 1 } }; });
  assert.equal(raioDoAspersor(m2), 1);
  assert.equal(casasDoAspersor(m2, m2.local, 12, 12).length, 8);
});

test('rega sozinho o que tem sede ao alcance, e a planta emenda um trecho no outro até ficar pronta', () => {
  const m = comMilho(), ev = ouvirTudo(m);
  assert.equal(estado(m, 11, 13), 'sede');
  porAspersor(m, 12, 13);
  assert.equal(regadaPorAspersor(m, m.local, m.local.i(11, 13)), true);
  assert.equal(regadaPorAspersor(m, m.local, m.local.i(16, 13)), false);
  m.avancar(1.1);
  assert.equal(ev.de('aspersorRegou')[0].n, 2);
  assert.equal(estado(m, 11, 13), 'crescendo'); assert.equal(estado(m, 12, 14), 'crescendo');
  assert.equal(estado(m, 16, 13), 'sede', 'fora do alcance continua com sede');
  m.avancar(301);
  assert.equal(estado(m, 11, 13), 'crescendo', 'a segunda rega veio sozinha');
  assert.equal(plantaEm(m, 11, 13).feitas, 1);
  m.avancar(300);
  assert.equal(estado(m, 11, 13), 'pronta'); assert.equal(estado(m, 12, 14), 'pronta');
  assert.equal(ev.de('amadureceu').length, 2);
  assert.equal(estado(m, 16, 13), 'sede');
});

test('com o jogo fechado também: na volta, o que estava ao alcance cresceu o tempo todo', () => {
  const m = comMilho();
  porAspersor(m, 12, 13);
  pular(m, 3600);
  assert.equal(estado(m, 11, 13), 'pronta', 'as duas regas couberam na ausência');
  assert.equal(estado(m, 16, 13), 'sede');
  // ausência curta: cresce só o que coube
  const m2 = comMilho();
  porAspersor(m2, 12, 13);
  pular(m2, 400);
  assert.equal(estado(m2, 11, 13), 'crescendo'); assert.equal(plantaEm(m2, 11, 13).feitas, 1);
  m2.avancar(201);
  assert.equal(estado(m2, 11, 13), 'pronta');
});

test('aspersor em obra ainda não rega; pronta a obra, começa', () => {
  const m = comMilho();
  const e = porAspersor(m, 12, 13, { obraAte: m.agora + 10_000 });
  m.avancar(3);
  assert.equal(aspersoresDe(m.local).length, 0);
  assert.equal(estado(m, 11, 13), 'sede');
  e.obraAte = 0; // (o sistema de construir zera ao terminar a obra)
  m.avancar(2);
  assert.equal(aspersoresDe(m.local).length, 1);
  assert.equal(estado(m, 11, 13), 'crescendo');
  // tirado o aspersor, a planta volta a pedir rega no fim do trecho
  m.local.tirar(e.id);
  m.avancar(301);
  assert.equal(estado(m, 11, 13), 'sede');
});

test('o que se planta depois, ao alcance, é regado no segundo seguinte; a rega à mão continua valendo fora dele', () => {
  const m = mundoDasTerras();
  porAspersor(m, 12, 12);
  arar(m, [[12, 13], [16, 16]]); semear(m, [[12, 13], [16, 16]]);
  m.avancar(1.1);
  assert.equal(estado(m, 12, 13), 'crescendo');
  assert.equal(estado(m, 16, 16), 'sede');
  modo(m, 'regar');
  assert.equal(tocar(m, 12, 13).ok, false, 'a que o aspersor rega não pede a personagem');
  m.avancar(61);
  assert.equal(estado(m, 12, 13), 'pronta');
});

test('gravar e carregar com aspersor: a lavoura ao alcance continua crescendo sozinha', () => {
  const m = comMilho();
  porAspersor(m, 12, 13);
  m.avancar(2);
  const g = JSON.parse(JSON.stringify(m.salvar()));
  const m2 = Mundo.carregar(dadosDeTeste(comTerras), g);
  porAspersor(m2, 12, 13); // (quem regrava a entidade é o sistema de construir; aqui, à mão)
  pular(m2, 3600);
  assert.equal(estado(m2, 11, 13), 'pronta');
});
