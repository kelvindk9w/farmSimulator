// Ferramentas com degraus e área (regador de crivo molha casas em linha com uma rega só), troca pela melhor,
// desgaste leve (nunca quebra: gasta, rende menos) e conserto com um toque.
import test from 'node:test';
import assert from 'node:assert/strict';
import { dadosDeTeste, ateParar, ouvirTudo, modo, tocar, arar, semear, encher, pular } from './apoio.mjs';
import { comTerras, mundoDasTerras, darFerramenta, porObstaculo } from './apoio-terras.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { descreverCasa } from '../src/nucleo/sistemas/personagem.js';
import { plantaEm, estadoDaPlanta, areaDaRega, casasDaRega, regaPrometida } from '../src/nucleo/sistemas/lavoura.js';
import { capacidadeDoCesto, ferramentaNoCinto } from '../src/nucleo/sistemas/posses.js';
import { estadoDoItem, estaGasta, rendeDe, rapidezDe, precoDoConserto, itensGastando, gastar } from '../src/nucleo/sistemas/desgaste.js';
import { ofertasDaLoja } from '../src/nucleo/sistemas/loja.js';

const LINHA = [[10, 13], [11, 13], [12, 13], [13, 13], [14, 13]];
const sede = (m, x, z) => { const pl = plantaEm(m, x, z); return !!pl && estadoDaPlanta(m, pl) === 'sede'; };
// lavoura de cinco casas em linha, semeada, e o regador de crivo cheio no cinto
function comLinha(mais) {
  const m = mundoDasTerras(mais);
  m.posses.bolsa['semente-rabanete'] = 9;
  arar(m, LINHA); semear(m, LINHA);
  return m;
}

// ---------- área ----------
test('regador de crivo: um toque molha três casas em linha e gasta uma rega só', () => {
  const m = comLinha(), ev = ouvirTudo(m);
  darFerramenta(m, 'regador-de-crivo'); m.posses.ferramentas.regador.onde = 'suporte';
  assert.equal(areaDaRega(m), 3);
  encher(m);
  assert.equal(m.posses.ferramentas['regador-de-crivo'].agua, 4);
  modo(m, 'regar');
  const d = descreverCasa(m, 12, 13);
  assert.equal(d.acao, 'regar');
  assert.deepEqual(d.casas, [[12, 13], [11, 13], [13, 13]], 'as casas que a rega vai molhar vêm marcadas antes');
  assert.equal(tocar(m, 12, 13).ok, true);
  assert.equal(regaPrometida(m, 11, 13), true); assert.equal(regaPrometida(m, 13, 13), true); assert.equal(regaPrometida(m, 14, 13), false);
  assert.equal(descreverCasa(m, 13, 13).texto, 'na-fila', 'a vizinha já vai ser molhada');
  ateParar(m);
  assert.equal(m.posses.ferramentas['regador-de-crivo'].agua, 3, 'uma rega só');
  assert.equal(ev.de('regou').length, 3);
  assert.deepEqual([10, 11, 12, 13, 14].map((x) => sede(m, x, 13)), [true, false, false, false, true]);
  // na ponta, a linha se ajusta: a casa tocada pode ser a primeira da fileira
  assert.deepEqual(casasDaRega(m, 14, 13), [[14, 13]], 'sem vizinha com sede ao alcance, rega só a tocada');
  tocar(m, 14, 13); tocar(m, 10, 13); ateParar(m);
  assert.equal(m.posses.ferramentas['regador-de-crivo'].agua, 1);
  assert.equal(LINHA.some(([x, z]) => sede(m, x, z)), false);
});

test('a linha da rega segue a fileira plantada (ao longo de X ou de Z) e a casa tocada pode estar na ponta', () => {
  const m = mundoDasTerras();
  m.posses.bolsa['semente-rabanete'] = 9;
  const col = [[12, 12], [12, 13], [12, 14]];
  arar(m, col); semear(m, col);
  darFerramenta(m, 'regador-de-crivo'); m.posses.ferramentas.regador.onde = 'suporte';
  assert.deepEqual(casasDaRega(m, 12, 12), [[12, 12], [12, 13], [12, 14]], 'tocou a ponta: leva as duas seguintes');
  assert.deepEqual(casasDaRega(m, 12, 13), [[12, 13], [12, 12], [12, 14]], 'tocou o meio: uma de cada lado');
  assert.deepEqual(casasDaRega(m, 12, 13, 1), [[12, 13]], 'regador comum: só a casa tocada');
  assert.deepEqual(casasDaRega(m, 12, 13, 5).length, 3, 'área maior que a fileira: só o que tem sede');
});

test('modo mão: arrastar o dedo por uma fileira com o regador de área não gasta água à toa', () => {
  const m = comLinha(), ev = ouvirTudo(m);
  darFerramenta(m, 'regador-de-crivo'); m.posses.ferramentas.regador.onde = 'suporte';
  encher(m); modo(m, 'mao');
  for (const [x, z] of LINHA) m.comando({ tipo: 'tocarCasa', x: x + 0.5, z: z + 0.5 });
  assert.equal(m.personagem.fila.length + (m.personagem.tarefa ? 1 : 0), 2, 'cinco casas, duas regas');
  ateParar(m);
  assert.equal(ev.de('regou').length, 5);
  assert.equal(m.posses.ferramentas['regador-de-crivo'].agua, 2);
});

// ---------- degraus ----------
test('ferramenta melhor comprada toma o lugar da velha no cinto, e a velha vai para o suporte; a loja deixa de oferecer a pior', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m);
  m.posses.ouro = 200;
  m.posses.ferramentas.regador.agua = 2;
  assert.ok(ofertasDaLoja(m).some((a) => a.ofertas.some((o) => o.item === 'regador-de-crivo')));
  assert.equal(m.comando({ tipo: 'comprar', item: 'regador-de-crivo' }).ok, true);
  assert.equal(ferramentaNoCinto(m, 'regador'), 'regador-de-crivo');
  assert.equal(m.posses.ferramentas.regador.onde, 'suporte');
  assert.equal(m.posses.ferramentas['regador-de-crivo'].agua, 2, 'a água passa para o novo');
  assert.equal(ev.de('ganhouItem').at(-1).item, 'regador-de-crivo');
  assert.equal(m.comando({ tipo: 'comprar', item: 'regador-grande' }).ok, false, 'degrau menor que o que já tem não se vende');
  // a enxada de ferro é mais rápida: a ação dura menos
  assert.equal(rapidezDe(m, 'enxada'), 1);
  m.comando({ tipo: 'comprar', item: 'enxada-de-ferro' });
  assert.equal(ferramentaNoCinto(m, 'enxada'), 'enxada-de-ferro');
  modo(m, 'enxada'); tocar(m, 12, 13);
  let seg = 0; while (!m.personagem.acao && seg < 600) { m.passo(); seg++; }
  assert.equal(m.personagem.acao.id, 'arar');
  assert.ok(Math.abs(m.personagem.acao.dur - 0.5) < 1e-9, 'metade do tempo da enxada velha');
});

// ---------- desgaste ----------
test('desgaste: avisa antes, fica gasta sem quebrar (trabalha mais devagar) e nunca interrompe a tarefa', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m);
  darFerramenta(m, 'enxada-de-ferro'); m.posses.ferramentas.enxada.onde = 'suporte';
  assert.deepEqual(estadoDoItem(m, 'enxada-de-ferro'), { usos: 4, total: 4, fracao: 1 });
  assert.deepEqual(estadoDoItem(m, 'enxada'), { usos: 0, total: 0, fracao: 1 }, 'a enxada velha não gasta');
  assert.equal(precoDoConserto(m, 'enxada-de-ferro'), 0, 'nova: nada a consertar');
  // seis casas numa fila só: as quatro primeiras gastam a ferramenta, as duas últimas saem do mesmo jeito
  const casas = [[10, 13], [11, 13], [12, 13], [13, 13], [14, 13], [15, 13]];
  modo(m, 'enxada'); for (const [x, z] of casas) tocar(m, x, z);
  ateParar(m);
  assert.equal(ev.de('arou').length, 6, 'a tarefa foi até o fim');
  assert.equal(ev.de('ferramentaGastando').length, 1, 'um aviso só, antes de gastar');
  assert.deepEqual(ev.de('ferramentaGastando')[0], { item: 'enxada-de-ferro', usos: 1, total: 4 });
  assert.equal(ev.de('ferramentaGasta').length, 1);
  assert.equal(ev.de('ferramentaGasta')[0].preco, 6);
  const tipos = ev.tipos().filter((t) => t === 'arou' || t.startsWith('ferramentaGast'));
  assert.deepEqual(tipos, ['arou', 'arou', 'arou', 'ferramentaGastando', 'arou', 'ferramentaGasta', 'arou', 'arou']);
  assert.equal(estaGasta(m, 'enxada-de-ferro'), true);
  assert.equal(rendeDe(m, 'enxada-de-ferro'), 0.5);
  assert.equal(rapidezDe(m, 'enxada-de-ferro'), 1, 'gasta, a de ferro (0,5) trabalha no passo da velha (0,5 ÷ 0,5)');
  assert.deepEqual(itensGastando(m).map((g) => [g.item, g.gasta, g.preco]), [['enxada-de-ferro', true, 6]]);
});

test('conserto: um comando, de qualquer lugar; custa o ouro dos dados e a ferramenta volta a render tudo', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m);
  darFerramenta(m, 'enxada-de-ferro'); m.posses.ferramentas.enxada.onde = 'suporte';
  assert.equal(m.comando({ tipo: 'consertar', item: 'enxada-de-ferro' }).motivo, 'nada-a-consertar');
  assert.equal(m.comando({ tipo: 'consertar', item: 'picareta' }).motivo, 'nao-tem');
  arar(m, [[10, 13], [11, 13], [12, 13], [13, 13]]);
  assert.equal(estaGasta(m, 'enxada-de-ferro'), true);
  m.posses.ouro = 2;
  const r = m.comando({ tipo: 'consertar', item: 'enxada-de-ferro' });
  assert.equal(r.motivo, 'sem-ouro'); assert.equal(r.dados.falta, 4);
  m.posses.ouro = 20;
  assert.equal(m.comando({ tipo: 'consertar', item: 'enxada-de-ferro' }).ok, true);
  assert.equal(m.posses.ouro, 14);
  assert.deepEqual(ev.de('consertou')[0], { item: 'enxada-de-ferro', ouro: 6 });
  assert.equal(estaGasta(m, 'enxada-de-ferro'), false);
  assert.equal(estadoDoItem(m, 'enxada-de-ferro').usos, 4);
  assert.equal(rapidezDe(m, 'enxada-de-ferro'), 0.5);
  assert.deepEqual(itensGastando(m), []);
  // conserto pela metade do caminho também vale, e custa só a parte gasta (um uso de quatro: um quarto de 6, para cima)
  arar(m, [[14, 13]]);
  assert.equal(precoDoConserto(m, 'enxada-de-ferro'), 2);
  // "tudo" só mexe no que está gasto ou quase: com três quartos por gastar, não há o que consertar
  assert.equal(m.comando({ tipo: 'consertar', tudo: true }).motivo, 'nada-a-consertar');
  // sem "conserto" nos dados, vale a fração do preço de compra
  m.dados.itens['enxada-de-ferro'].conserto = 0;
  arar(m, [[15, 13], [14, 14]]);
  assert.equal(precoDoConserto(m, 'enxada-de-ferro'), 5, '30% de 20, vezes os três quartos gastos, para cima');
  // "tudo": conserta o que estiver gasto ou quase, do pior para o melhor
  darFerramenta(m, 'foice-de-ferro'); m.posses.ferramentas['foice-de-ferro'].usos = 5;
  m.posses.ouro = 100;
  const t = m.comando({ tipo: 'consertar', tudo: true });
  assert.equal(t.ok, true); assert.equal(t.dados.n, 2); assert.equal(t.dados.ouro, 14);
  assert.equal(m.comando({ tipo: 'consertar', tudo: true }).motivo, 'nada-a-consertar');
});

test('cesto gasto leva menos até o conserto; o desgaste conta por colheita', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m);
  m.posses.ouro = 100;
  m.comando({ tipo: 'comprar', item: 'cesto-grande' });
  const cheia = capacidadeDoCesto(m);
  assert.equal(m.posses.cesto.item, 'cesto-grande');
  gastar(m, 'cesto-grande', 2);
  assert.equal(estadoDoItem(m, 'cesto-grande').usos, 1);
  assert.equal(ev.de('ferramentaGastando').at(-1).item, 'cesto-grande');
  m.eventos.emitir('colheu', { item: 'rabanete', n: 1 }); // uma colheita = um uso
  assert.equal(estaGasta(m, 'cesto-grande'), true);
  assert.equal(capacidadeDoCesto(m), Math.floor(cheia * 0.5));
  assert.equal(m.comando({ tipo: 'consertar', item: 'cesto-grande' }).ok, true);
  assert.equal(capacidadeDoCesto(m), cheia);
  gastar(m, 'cesto', 5);
  assert.equal(estadoDoItem(m, 'cesto').total, 0, 'o cesto de palha não gasta');
});

test('gravar e carregar: o desgaste e o conserto voltam; a foice gasta bate do mesmo jeito', () => {
  const m = mundoDasTerras();
  darFerramenta(m, 'foice-de-ferro');
  for (const x of [8, 10, 12, 14, 16]) porObstaculo(m, 'mato', x, 9);
  for (const x of [8, 10, 12, 14, 16]) m.comando({ tipo: 'tocarEntidade', id: `mato-${x}-9` });
  ateParar(m);
  assert.equal(estaGasta(m, 'foice-de-ferro'), true);
  m.posses.ouro = 50; gastar(m, 'cesto-grande', 1); // não tem o cesto grande: não conta
  assert.equal(m.desgaste.usos['cesto-grande'], undefined);
  const dados = () => dadosDeTeste(comTerras);
  let m2 = Mundo.carregar(dados(), JSON.parse(JSON.stringify(m.salvar())));
  assert.equal(estaGasta(m2, 'foice-de-ferro'), true);
  assert.equal(rendeDe(m2, 'foice-de-ferro'), 0.5, 'a conta se refaz ao carregar');
  m2.comando({ tipo: 'consertar', item: 'foice-de-ferro' });
  m2 = Mundo.carregar(dados(), JSON.parse(JSON.stringify(m2.salvar())));
  assert.equal(estaGasta(m2, 'foice-de-ferro'), false);
  assert.equal(estadoDoItem(m2, 'foice-de-ferro').usos, 5);
  // gasta, ainda roça (não quebra)
  m2.posses.ferramentas['foice-de-ferro'].usos += 5;
  porObstaculo(m2, 'mato', 12, 9);
  pular(m2, 1);
  m2.comando({ tipo: 'tocarEntidade', id: 'mato-12-9' }); ateParar(m2);
  assert.equal(m2.local.porId['mato-12-9'], undefined);
});
