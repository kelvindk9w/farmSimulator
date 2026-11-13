// Cash: concluir um relógio, a compra simulada de pacotes e as ofertas (roupa, enfeite, animal especial).
import test from 'node:test';
import assert from 'node:assert/strict';
import { dadosDeTeste, ouvirTudo, pular } from './apoio.mjs';
import { comProgresso, mundoComProgresso, DIA } from './apoio-progresso.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { registrarConcluivel } from '../src/nucleo/concluir.js';
import { darXp } from '../src/nucleo/sistemas/niveis.js';
import { precoDeConcluir, consultaDeConcluir, gastarCash, lojaDeCash, animaisEspeciais, ENTREGAS } from '../src/nucleo/sistemas/cash.js';
import { VESTIVEL } from '../src/nucleo/sistemas/roupas.js';

// um relógio só destes testes: m.teste.ate = instante em que acaba
registrarConcluivel({
  tipo: 'relogio-de-teste',
  falta: (m, alvo) => (m.teste && m.teste[alvo] ? Math.max(0, (m.teste[alvo] - m.agora) / 1000) : 0),
  terminar: (m, alvo) => { m.teste[alvo] = 0; m.teste.terminou = (m.teste.terminou || 0) + 1; return true; },
  nome: (m, alvo) => 'o relógio ' + alvo,
});
const comRelogio = (seg, cash = 50) => { const m = mundoComProgresso(); m.teste = { a: m.agora + seg * 1000 }; m.posses.cash = cash; return m; };
const concluir = (m, alvo = 'a') => m.comando({ tipo: 'concluir', relogio: 'relogio-de-teste', alvo });

test('o preço de concluir segue a fórmula de regras.concluir (a escada do documento de economia)', () => {
  const m = mundoComProgresso();
  assert.equal(precoDeConcluir(m, 0), 0);
  assert.equal(precoDeConcluir(m, 30), 0, 'até 30 s é de graça');
  assert.equal(precoDeConcluir(m, 31), 1);
  assert.equal(precoDeConcluir(m, 5 * 60), 1);
  assert.equal(precoDeConcluir(m, 3600), 5);
  assert.equal(precoDeConcluir(m, 6 * 3600), 18);
  assert.equal(precoDeConcluir(m, 24 * 3600), 46);
});

test('concluir cobra o cash, termina o relógio e avisa; de graça quando falta pouco', () => {
  const m = comRelogio(3600), ev = ouvirTudo(m);
  assert.deepEqual(consultaDeConcluir(m, 'relogio-de-teste', 'a'), { ok: true, dados: { relogio: 'relogio-de-teste', seg: 3600, preco: 5, gratis: false, nome: 'o relógio a' } });
  const r = concluir(m);
  assert.deepEqual(r, { ok: true, dados: { relogio: 'relogio-de-teste', seg: 3600, cash: 5, nome: 'o relógio a' } });
  assert.equal(m.posses.cash, 45); assert.equal(m.teste.terminou, 1);
  assert.deepEqual(ev.de('gastouCash'), [{ n: 5, destino: 'concluir' }]);
  assert.equal(ev.de('concluiu')[0].cash, 5);
  assert.equal(m.cash.gasto, 5);
  assert.equal(concluir(m).motivo, 'nada-a-concluir');

  m.teste.a = m.agora + 20_000;
  assert.equal(consultaDeConcluir(m, 'relogio-de-teste', 'a').dados.gratis, true);
  assert.equal(concluir(m).dados.cash, 0);
  assert.equal(m.posses.cash, 45); assert.equal(m.teste.terminou, 2);
});

test('sem cash não conclui (e diz quanto falta); relógio que as regras não listam não vale', () => {
  const m = comRelogio(6 * 3600, 10);
  const r = concluir(m);
  assert.equal(r.ok, false); assert.equal(r.motivo, 'sem-cash'); assert.equal(r.dados.falta, 8); assert.equal(r.dados.preco, 18);
  assert.equal(m.posses.cash, 10); assert.equal(m.teste.terminou, undefined);
  assert.equal(m.comando({ tipo: 'concluir', relogio: 'cultura', alvo: 'a' }).motivo, 'concluir-nao-vale');
  assert.equal(m.comando({ tipo: 'concluir', relogio: 'fila-que-ninguem-registrou', alvo: 'a' }).motivo, 'concluir-nao-vale');
  const semRegra = mundoComProgresso((b) => { b.regras.concluir.vale = ['obra']; });
  semRegra.teste = { a: semRegra.agora + 60_000 };
  assert.equal(concluir(semRegra).motivo, 'concluir-nao-vale');
});

test('o limite por dia conta só as conclusões pagas e volta no dia seguinte', () => {
  const m = comRelogio(600, 50);
  m.teste.b = m.agora + 600_000; m.teste.c = m.agora + 600_000; m.teste.d = m.agora + 10_000;
  assert.equal(concluir(m, 'a').ok, true); assert.equal(concluir(m, 'b').ok, true);
  const r = concluir(m, 'c');
  assert.equal(r.motivo, 'concluir-limite'); assert.equal(r.dados.limite, 2);
  assert.equal(concluir(m, 'd').ok, true, 'a de graça não entra no limite');
  pular(m, DIA);
  m.teste.c = m.agora + 600_000;
  assert.equal(concluir(m, 'c').ok, true);
  const livre = mundoComProgresso((b) => { delete b.regras.concluir.limitePorDia; });
  livre.teste = {}; livre.posses.cash = 99;
  for (let k = 0; k < 6; k++) { livre.teste.a = livre.agora + 600_000; assert.equal(concluir(livre).ok, true, 'sem "limitePorDia" não há limite'); }
});

test('a compra de cash é simulada: soma o cash e avisa; sem "compraSimulada" não há compra', () => {
  const m = mundoComProgresso(), ev = ouvirTudo(m);
  const r = m.comando({ tipo: 'comprarCash', pacote: 'punhado' });
  assert.deepEqual(r, { ok: true, dados: { pacote: 'punhado', cash: 70, simulada: true } });
  assert.equal(m.posses.cash, 3 + 70);
  assert.equal(ev.de('comprouCash')[0].simulada, true);
  assert.equal(m.cash.comprado, 70); assert.equal(m.cash.compras, 1);
  assert.equal(m.comando({ tipo: 'comprarCash', pacote: 'nao-ha' }).motivo, 'nao-existe');
  const real = mundoComProgresso((b) => { b.loja.cash.compraSimulada = false; });
  assert.equal(real.comando({ tipo: 'comprarCash', pacote: 'punhado' }).motivo, 'compra-indisponivel');
  assert.equal(real.posses.cash, 3);
});

test('oferta de roupa: só o que o desenho mostra; vai para a bolsa; não se compra duas vezes', () => {
  const m = mundoComProgresso(), ev = ouvirTudo(m);
  m.posses.cash = 10;
  assert.equal(m.comando({ tipo: 'comprarOferta', oferta: 'bota-de-couro' }).motivo, 'em-breve');
  VESTIVEL['bota-de-couro'] = true;
  try {
    const r = m.comando({ tipo: 'comprarOferta', oferta: 'bota-de-couro' });
    assert.equal(r.ok, true); assert.equal(r.dados.item, 'bota-de-couro'); assert.equal(r.dados.classe, 'cosmetico');
    assert.equal(m.posses.cash, 4); assert.equal(m.posses.bolsa['bota-de-couro'], 1);
    assert.equal(ev.de('comprouComCash')[0].cash, 6);
    assert.equal(m.comando({ tipo: 'comprarOferta', oferta: 'bota-de-couro' }).motivo, 'ja-tem');
    assert.equal(m.comando({ tipo: 'comprarOferta', oferta: 'concluir-relogio' }).motivo, 'nao-vende');
    assert.equal(m.comando({ tipo: 'comprarOferta', oferta: 'vaga-de-fila' }).motivo, 'nao-vende');
    assert.equal(m.comando({ tipo: 'comprarOferta', oferta: 'nada' }).motivo, 'nao-existe');
    const of = lojaDeCash(m).ofertas.find((o) => o.id === 'bota-de-couro');
    assert.equal(of.tem, true); assert.equal(of.pode.motivo, 'ja-tem');
    assert.equal(lojaDeCash(m).ofertas.find((o) => o.id === 'pintura-azul').pode.motivo, 'em-breve');
  } finally { delete VESTIVEL['bota-de-couro']; }
});

test('animal especial: a posse fica registrada, o evento sai e a frente de animais pode dar vida a ele', () => {
  const m = mundoComProgresso(), ev = ouvirTudo(m);
  m.posses.cash = 100;
  assert.equal(m.comando({ tipo: 'comprarOferta', oferta: 'cavalo-mangalarga' }).motivo, 'nivel-baixo');
  const antes = ENTREGAS.animal, entregues = [];
  ENTREGAS.animal = { pode: antes.pode, entregar: (mundo, id) => entregues.push(id) };
  try {
    assert.equal(m.comando({ tipo: 'comprarOferta', oferta: 'gato-siames' }).ok, true);
    assert.deepEqual(entregues, ['gato-siames']);
  } finally { ENTREGAS.animal = antes; }
  assert.equal(m.posses.cash, 80);
  assert.deepEqual(animaisEspeciais(m), ['gato-siames']);
  assert.deepEqual(ev.de('ganhouAnimalEspecial'), [{ animal: 'gato-siames' }]);
  assert.equal(ev.de('comprouComCash')[0].animal, 'gato-siames');
  assert.equal(m.comando({ tipo: 'comprarOferta', oferta: 'gato-siames' }).motivo, 'ja-tem');
  m.posses.cash = 10; darXp(m, 35, 'teste');
  const r = m.comando({ tipo: 'comprarOferta', oferta: 'cavalo-mangalarga' });
  assert.equal(r.motivo, 'sem-cash'); assert.ok(r.dados.falta > 0);
  // gravar e carregar
  const g = JSON.parse(JSON.stringify(m.salvar())), n = Mundo.carregar(dadosDeTeste(comProgresso), g);
  assert.deepEqual(n.salvar(), g);
  assert.deepEqual(animaisEspeciais(n), ['gato-siames']);
});

test('gastarCash é o caixa das outras frentes: recusa sem saldo e soma no gasto', () => {
  const m = mundoComProgresso();
  assert.equal(gastarCash(m, 4, 'teste'), false);
  assert.equal(m.posses.cash, 3);
  assert.equal(gastarCash(m, 2, 'teste'), true);
  assert.equal(m.posses.cash, 1); assert.equal(m.cash.gasto, 2);
  m.eventos.emitir('gastouCash', { n: 7, destino: 'ampliacao' }); // quem cobra por conta (a ampliação da construção) também entra
  assert.equal(m.cash.gasto, 9);
});
