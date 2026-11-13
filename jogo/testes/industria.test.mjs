// Indústrias: a fila de receitas, o relógio (com o jogo aberto e fechado), a saída, cancelar, reordenar, a vaga
// a mais, terminar com cash, a gravação e as missões de produzir.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { novoMundo, lerPasta, ouvirTudo, pular, tocarEm, ateParar, modo, porConstrucao } from './apoio.mjs';
import { mundoDaIndustria, noNivel, dar, porIndustria, produzir, retirar } from './apoio-industria.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { prepararDados } from '../src/nucleo/dados.js';
import { TIPOS } from '../src/nucleo/registro.js';
import { quantoTem } from '../src/nucleo/sistemas/posses.js';
import { colocar } from '../src/nucleo/sistemas/construcao.js';
import { missaoAtual, missaoPossivel } from '../src/nucleo/sistemas/missoes.js';
import { consultaDeConcluir } from '../src/nucleo/sistemas/cash.js';
import { ofertasDaLoja } from '../src/nucleo/sistemas/loja.js';
import { guiaDaMissao } from '../src/nucleo/guia.js';
import { darXp } from '../src/nucleo/sistemas/niveis.js';
import { receitasDe, ehIndustria, vagasDaFila, proximaVaga, estadoDaIndustria, faltaDaFila, andamentoDaFila, visaoDaIndustria, prontosNaSaida, podeProduzir } from '../src/nucleo/sistemas/industria.js';

const filaDe = (m, e) => (estadoDaIndustria(m, e) || { fila: [] }).fila;
const saidaDe = (m, e) => (estadoDaIndustria(m, e) || { saida: [] }).saida;
// uma bancada pronta e madeira para serrar
function comBancada(madeira = 10) { const m = mundoDaIndustria(); const b = porIndustria(m, 'bancada-de-carpintaria'); dar(m, { madeira }); return { m, b }; }
function comMoinho(milho = 12, nivel = 1) { const m = noNivel(mundoDaIndustria(), nivel); const e = porIndustria(m, 'moinho'); dar(m, { milho }); return { m, e }; }

test('as receitas vêm dos dados; receita de construção ou item que não existe fica de fora', () => {
  const m = mundoDaIndustria((b) => { b.receitas.fantasma = { onde: 'usina', entra: { milho: 1 }, sai: { fuba: 1 }, tempoSeg: 5 }; b.receitas.torta = { onde: 'moinho', entra: { jaca: 1 }, sai: { fuba: 1 }, tempoSeg: 5 }; });
  const R = receitasDe(m.dados);
  assert.deepEqual(Object.keys(R.todas).sort(), ['bolo', 'duzia', 'fuba', 'racao', 'tabua']);
  assert.deepEqual(R.porConstrucao.moinho.map((r) => r.id), ['fuba', 'racao', 'duzia'], 'por nível, na ordem do arquivo');
  assert.deepEqual(R.todas.racao, { id: 'racao', nome: 'Ração', onde: 'moinho', entra: { milho: 3 }, sai: { racao: 2 }, item: 'racao', n: 2, tempoSeg: 60, xp: 2, nivel: 1 });
  assert.equal(R.porItem.bolo[0].id, 'bolo');
});

test('produzir confere a receita, o nível, a vaga e os ingredientes; os ingredientes saem na hora de pôr na fila', () => {
  const { m, b } = comBancada(5), ev = ouvirTudo(m);
  assert.equal(produzir(m, b, 'fuba').motivo, 'receita-de-outro-lugar');
  assert.equal(m.comando({ tipo: 'produzir', entidade: 'nada', receita: 'tabua' }).motivo, 'nao-existe');
  let r = produzir(m, b, 'tabua');
  assert.deepEqual(r, { ok: true, dados: { entidade: b.id, receita: 'tabua', vaga: 0 } });
  assert.equal(quantoTem(m, 'madeira'), 3, 'duas madeiras saíram do estoque');
  assert.ok(produzir(m, b, 'tabua').ok);
  r = produzir(m, b, 'tabua');
  assert.equal(r.motivo, 'sem-vaga-na-fila'); assert.deepEqual(r.dados, { vagas: 2, construcao: 'bancada-de-carpintaria' });
  assert.equal(quantoTem(m, 'madeira'), 1, 'a que não entrou não gastou nada');
  assert.deepEqual(ev.de('enfileirou').map((d) => [d.receita, d.item, d.vaga]), [['tabua', 'tabua', 0], ['tabua', 'tabua', 1]]);
  assert.deepEqual(ev.de('faltou').map((d) => d.motivo), ['receita-de-outro-lugar', 'sem-vaga-na-fila']);

  const { m: m2, e } = comMoinho(2);
  r = produzir(m2, e, 'fuba');
  assert.equal(r.motivo, 'falta-ingrediente'); assert.deepEqual(r.dados, { item: 'milho', precisa: 3, tem: 2, falta: 1, receita: 'fuba' });
  r = produzir(m2, e, 'duzia');
  assert.equal(r.motivo, 'nivel-baixo'); assert.equal(r.dados.nivel, 2);
  assert.equal(podeProduzir(m2, e, 'duzia').motivo, 'nivel-baixo');
});

test('os ingredientes saem de onde estiverem: bolsa, celeiro ou cesto', () => {
  const m = noNivel(mundoDaIndustria(), 2), e = porIndustria(m, 'moinho');
  m.posses.celeiro.itens.ovo = 5; m.posses.cesto.itens.ovo = 7; m.posses.bolsa.cartela = 1;
  assert.ok(produzir(m, e, 'duzia').ok);
  assert.equal(quantoTem(m, 'ovo'), 0); assert.equal(quantoTem(m, 'cartela'), 0);
});

test('a primeira da fila roda no relógio e as outras esperam; a seguinte começa quando a anterior acaba', () => {
  const { m, b } = comBancada(), ev = ouvirTudo(m);
  produzir(m, b, 'tabua'); produzir(m, b, 'tabua');
  assert.equal(Math.round(faltaDaFila(m, b)), 20);
  m.avancar(10);
  assert.ok(Math.abs(andamentoDaFila(m, b) - 0.5) < 0.01);
  assert.deepEqual(visaoDaIndustria(m, b, {}).estado, 'fazendo');
  assert.equal(saidaDe(m, b).length, 0);
  m.avancar(10.1);
  assert.deepEqual(saidaDe(m, b), ['tabua']); assert.deepEqual(filaDe(m, b), ['tabua']);
  assert.ok(Math.abs(faltaDaFila(m, b) - 19.9) < 0.05, 'a segunda começou no instante exato em que a primeira acabou');
  assert.equal(visaoDaIndustria(m, b, {}).estado, 'pronta');
  m.avancar(20);
  assert.deepEqual(saidaDe(m, b), ['tabua', 'tabua']); assert.deepEqual(filaDe(m, b), []);
  assert.deepEqual(ev.de('receitaPronta').map((d) => [d.entidade, d.receita, d.item, d.n]), [[b.id, 'tabua', 'tabua', 1], [b.id, 'tabua', 'tabua', 1]]);
  assert.equal(quantoTem(m, 'tabua'), 0, 'pronto não é retirado: espera na saída');
});

test('com o jogo fechado a fila segue: várias receitas terminam em ordem, e o que sobra continua de onde estaria', () => {
  const { m, e } = comMoinho(12);
  produzir(m, e, 'racao'); produzir(m, e, 'fuba'); // 60 s e 120 s
  pular(m, 100);
  assert.deepEqual(saidaDe(m, e), ['racao']); assert.deepEqual(filaDe(m, e), ['fuba']);
  assert.equal(Math.round(faltaDaFila(m, e)), 80, 'o fubá começou aos 60 s, não na volta');
  pular(m, 3600 * 5);
  assert.deepEqual(saidaDe(m, e), ['racao', 'fuba']); assert.deepEqual(filaDe(m, e), []);
  assert.deepEqual(prontosNaSaida(m, e), { racao: 2, fuba: 1 });
});

test('a saída guarda tantas receitas quantas são as vagas; cheia, a fila espera e nada se perde', () => {
  const { m, b } = comBancada(20);
  produzir(m, b, 'tabua'); produzir(m, b, 'tabua');
  pular(m, 100);
  assert.equal(saidaDe(m, b).length, 2);
  assert.ok(produzir(m, b, 'tabua').ok, 'a fila aceita mais receitas');
  produzir(m, b, 'tabua');
  pular(m, 1000);
  assert.equal(saidaDe(m, b).length, 2); assert.equal(filaDe(m, b).length, 2, 'com a saída cheia, a próxima não começa');
  assert.equal(faltaDaFila(m, b), 0); assert.equal(estadoDaIndustria(m, b).inicio, 0);
  assert.equal(visaoDaIndustria(m, b, {}).estado, 'pronta');
  assert.ok(retirar(m, b).ok);
  assert.equal(quantoTem(m, 'tabua'), 2);
  assert.equal(Math.round(faltaDaFila(m, b)), 20, 'retirou: a fila volta a andar a partir de agora');
  pular(m, 100);
  assert.equal(saidaDe(m, b).length, 2);
  retirar(m, b);
  assert.equal(quantoTem(m, 'tabua'), 4);
});

test('retirar põe o produto no estoque, dá a experiência da receita e emite "produziu" com item, n, onde e receita', () => {
  const { m, e } = comMoinho(12), ev = ouvirTudo(m);
  assert.equal(retirar(m, e).motivo, 'nada-pronto');
  produzir(m, e, 'racao'); produzir(m, e, 'fuba');
  pular(m, 500); ev.limpar();
  const xp = m.progresso.xp, r = retirar(m, e);
  assert.deepEqual(r, { ok: true, dados: { entidade: e.id, itens: { racao: 2, fuba: 1 }, n: 3, receitas: 2, sobrou: 0 } });
  assert.equal(m.posses.bolsa.racao, 2, 'ração vai para a bolsa'); assert.equal(m.posses.celeiro.itens.fuba, 1, 'produto vai para o celeiro');
  assert.equal(m.progresso.xp, xp + 6);
  assert.deepEqual(ev.de('produziu'), [
    { item: 'racao', n: 2, onde: 'moinho', receita: 'racao', entidade: e.id },
    { item: 'fuba', n: 1, onde: 'moinho', receita: 'fuba', entidade: e.id },
  ]);
  assert.deepEqual(ev.de('retirouProduto').map((d) => [d.construcao, d.n, d.receitas]), [['moinho', 3, 2]]);
  assert.deepEqual(saidaDe(m, e), []);
});

test('produto só sai da indústria se couber no celeiro: o que não cabe fica na saída, esperando', () => {
  const { m, e } = comMoinho(12), ev = ouvirTudo(m);
  produzir(m, e, 'fuba'); produzir(m, e, 'racao');
  pular(m, 500);
  m.posses.celeiro.itens.rabanete = m.posses.celeiro.capacidade - quantoTem(m, 'milho'); // enche o celeiro
  const r = retirar(m, e);
  assert.ok(r.ok); assert.equal(r.dados.sobrou, 1); assert.deepEqual(r.dados.itens, { racao: 2 }, 'a ração (bolsa) sai; o fubá (celeiro) espera');
  assert.deepEqual(saidaDe(m, e), ['fuba']);
  assert.ok(ev.de('faltou').some((d) => d.motivo === 'celeiro-cheio'));
  assert.equal(retirar(m, e).motivo, 'celeiro-cheio');
  delete m.posses.celeiro.itens.rabanete;
  assert.ok(retirar(m, e).ok); assert.equal(m.posses.celeiro.itens.fuba, 1);
});

test('o toque: com a mão e coisa pronta, a personagem vai lá e retira; senão, abre o painel da indústria', () => {
  const { m, b } = comBancada(), ev = ouvirTudo(m);
  const desc = (e) => TIPOS[e.tipo].acaoPossivel(m, e);
  assert.deepEqual(desc(b), { painel: 'industria', arg: { entidade: b.id }, texto: 'ver-industria', dados: { construcao: b.tipo } });
  assert.deepEqual(tocarEm(m, b.id), { ok: true, dados: { painel: 'industria', arg: { entidade: b.id } } });
  assert.deepEqual(ev.de('pediuPainel'), [{ painel: 'industria', arg: { entidade: b.id }, entidade: b.id }]);
  produzir(m, b, 'tabua'); pular(m, 30);
  assert.equal(desc(b).acao, 'retirarProduto'); assert.deepEqual(desc(b).dados.itens, { tabua: 1 });
  modo(m, 'enxada');
  assert.equal(desc(b).painel, 'industria', 'com outra ferramenta na mão, o toque abre o painel');
  modo(m, 'mao');
  assert.ok(tocarEm(m, b.id).ok);
  assert.equal(desc(b).painel, 'industria', 'ela já está indo retirar: o segundo toque abre o painel');
  ateParar(m);
  assert.equal(quantoTem(m, 'tabua'), 1); assert.deepEqual(saidaDe(m, b), []);
  assert.deepEqual(ev.de('terminouAcao').map((d) => d.acao), ['retirarProduto']);
});

test('em obra, o toque é o cartão da construção; sem receita nos dados, a bancada continua sendo da frente de construir', () => {
  const m = mundoDaIndustria(), e = porIndustria(m, 'moinho', { obraSeg: 30, quieto: false });
  assert.equal(TIPOS.moinho.acaoPossivel(m, e).painel, 'construcao');
  assert.equal(produzir(m, e, 'fuba').motivo, 'em-obra');
  pular(m, 31);
  assert.equal(TIPOS.moinho.acaoPossivel(m, e).painel, 'industria');
  const simples = novoMundo(), b = porConstrucao(simples, 'bancada-de-carpintaria', 12, 16);
  assert.ok(!ehIndustria(simples, b));
  assert.equal(TIPOS[b.tipo].acaoPossivel(simples, b).painel, 'construcao');
});

test('cancelar devolve os ingredientes: da que espera e da que está sendo feita (desta, perde-se só o tempo)', () => {
  const { m, e } = comMoinho(9), ev = ouvirTudo(m);
  produzir(m, e, 'fuba'); produzir(m, e, 'racao');
  assert.equal(quantoTem(m, 'milho'), 3);
  assert.equal(m.comando({ tipo: 'cancelarReceita', entidade: e.id, vaga: 5 }).motivo, 'vaga-vazia');
  let r = m.comando({ tipo: 'cancelarReceita', entidade: e.id, vaga: 1 });
  assert.deepEqual(r, { ok: true, dados: { entidade: e.id, receita: 'racao', devolveu: true } });
  assert.equal(quantoTem(m, 'milho'), 6); assert.deepEqual(filaDe(m, e), ['fuba']);
  produzir(m, e, 'racao');
  m.avancar(50);
  r = m.comando({ tipo: 'cancelarReceita', entidade: e.id, vaga: 0 });
  assert.ok(r.ok); assert.equal(r.dados.receita, 'fuba');
  assert.equal(quantoTem(m, 'milho'), 6, 'o milho do fubá voltou');
  assert.deepEqual(filaDe(m, e), ['racao']);
  assert.equal(Math.round(faltaDaFila(m, e)), 60, 'a seguinte começa do zero, agora');
  assert.deepEqual(ev.de('cancelouReceita').map((d) => [d.receita, d.vaga, d.devolveu]), [['racao', 1, true], ['fuba', 0, true]]);
  assert.equal(saidaDe(m, e).length, 0);
});

test('com regras.industria.cancelarDevolve desligado, cancelar não devolve nada', () => {
  const m = mundoDaIndustria((b) => { b.regras.industria.cancelarDevolve = false; }), e = porIndustria(m, 'moinho');
  dar(m, { milho: 6 });
  produzir(m, e, 'fuba'); produzir(m, e, 'racao');
  assert.equal(m.comando({ tipo: 'cancelarReceita', entidade: e.id, vaga: 1 }).dados.devolveu, false);
  assert.equal(quantoTem(m, 'milho'), 0);
});

test('reordenar vale entre as que esperam; a que está sendo feita não muda de lugar', () => {
  const m = noNivel(mundoDaIndustria(), 3), e = porIndustria(m, 'moinho', { nivel: 3 }); // já com 4 vagas
  dar(m, { milho: 12 });
  assert.equal(vagasDaFila(m, e), 4);
  for (const r of ['fuba', 'racao', 'fuba', 'racao']) assert.ok(produzir(m, e, r).ok);
  assert.equal(m.comando({ tipo: 'reordenarFila', entidade: e.id, de: 0, para: 2 }).motivo, 'vaga-vazia');
  assert.equal(m.comando({ tipo: 'reordenarFila', entidade: e.id, de: 3, para: 0 }).motivo, 'vaga-vazia');
  assert.ok(m.comando({ tipo: 'reordenarFila', entidade: e.id, de: 3, para: 1 }).ok);
  assert.deepEqual(filaDe(m, e), ['fuba', 'racao', 'racao', 'fuba']);
  assert.ok(m.comando({ tipo: 'reordenarFila', entidade: e.id, de: 1, para: 2 }).ok);
  assert.deepEqual(filaDe(m, e), ['fuba', 'racao', 'racao', 'fuba']);
  assert.ok(m.comando({ tipo: 'reordenarFila', entidade: e.id, de: 1, para: 3 }).ok);
  assert.deepEqual(filaDe(m, e), ['fuba', 'racao', 'fuba', 'racao']);
  assert.equal(Math.round(faltaDaFila(m, e)), 120, 'o relógio da primeira não mudou');
});

test('a vaga a mais é a ampliação da construção: compra-se com ouro ou com cash, no nível certo', () => {
  const { m, e } = comMoinho(12);
  assert.equal(vagasDaFila(m, e), 2);
  assert.deepEqual([proximaVaga(m, e).fila, proximaVaga(m, e).custo.ouro, proximaVaga(m, e).cash, proximaVaga(m, e).nivel], [3, 20, 2, 2]);
  assert.equal(m.comando({ tipo: 'ampliar', entidade: e.id }).motivo, 'nivel-baixo');
  noNivel(m, 3); m.posses.ouro = 25;
  assert.ok(m.comando({ tipo: 'ampliar', entidade: e.id }).ok);
  assert.equal(m.posses.ouro, 5); assert.equal(vagasDaFila(m, e), 3);
  const cash = m.posses.cash;
  assert.ok(m.comando({ tipo: 'ampliar', entidade: e.id, cash: true }).ok);
  assert.equal(m.posses.cash, cash - 3); assert.equal(vagasDaFila(m, e), 4);
  assert.equal(proximaVaga(m, e), null);
  for (const r of ['racao', 'racao', 'racao', 'racao']) assert.ok(produzir(m, e, r).ok);
  assert.equal(produzir(m, e, 'racao').motivo, 'sem-vaga-na-fila');
  pular(m, 1000);
  assert.equal(saidaDe(m, e).length, 4, 'a saída cresce com a fila');
});

test('terminar agora com cash conclui a receita que está sendo feita (de graça quando falta pouco)', () => {
  const { m, e } = comMoinho(12), ev = ouvirTudo(m);
  assert.equal(consultaDeConcluir(m, 'fila', e.id).motivo, 'nada-a-concluir');
  produzir(m, e, 'fuba'); produzir(m, e, 'racao');
  const c = consultaDeConcluir(m, 'fila', e.id);
  assert.ok(c.ok); assert.equal(c.dados.seg, 120); assert.equal(c.dados.preco, 1); assert.equal(c.dados.nome, 'Fubá');
  const cash = m.posses.cash;
  assert.ok(m.comando({ tipo: 'concluir', relogio: 'fila', alvo: e.id }).ok);
  assert.equal(m.posses.cash, cash - 1);
  assert.deepEqual(saidaDe(m, e), ['fuba']); assert.deepEqual(filaDe(m, e), ['racao']);
  assert.equal(Math.round(faltaDaFila(m, e)), 60, 'a seguinte começa agora');
  assert.equal(ev.de('receitaPronta').length, 1);
  m.avancar(35);
  assert.equal(consultaDeConcluir(m, 'fila', { entidade: e.id }).dados.preco, 0);
  assert.ok(m.comando({ tipo: 'concluir', relogio: 'fila', alvo: { entidade: e.id } }).ok);
  assert.equal(m.posses.cash, cash - 1);
  assert.deepEqual(saidaDe(m, e), ['fuba', 'racao']);
});

test('a gravação guarda a fila, a saída e as dicas; horas depois de gravar, a fila andou', () => {
  const { m, e } = comMoinho(12);
  produzir(m, e, 'racao'); produzir(m, e, 'fuba');
  m.comando({ tipo: 'viuDica', dica: 'fila' });
  m.avancar(70);
  const g = JSON.parse(JSON.stringify(m.salvar()));
  assert.deepEqual(g.sistemas.industria.de[e.id].fila, ['fuba']); assert.deepEqual(g.sistemas.industria.de[e.id].saida, ['racao']);
  const m2 = Mundo.carregar(m.dados, g), e2 = m2.construcao.todas.find((x) => x.id === e.id);
  assert.deepEqual(m2.salvar().sistemas.industria, g.sistemas.industria);
  assert.deepEqual(m2.industria.dicas, { fila: 1 });
  assert.equal(Math.round(faltaDaFila(m2, e2)), 110);
  m2.acertarRelogio(m2.agora + 3 * 3600 * 1000);
  assert.deepEqual(saidaDe(m2, e2), ['racao', 'fuba']);
  assert.ok(retirar(m2, e2).ok); assert.equal(m2.posses.celeiro.itens.fuba, 1);
  // receita que saiu dos dados some da fila gravada sem quebrar nada
  g.sistemas.industria.de[e.id].fila = ['pudim', 'fuba']; g.sistemas.industria.de.fantasma = { fila: ['fuba'], inicio: 5, saida: [] };
  const m3 = Mundo.carregar(m.dados, g), e3 = m3.construcao.todas.find((x) => x.id === e.id);
  assert.deepEqual(filaDe(m3, e3), ['fuba']); assert.equal(m3.industria.de.fantasma, undefined);
  m3.avancar(1);
  assert.equal(Math.round(faltaDaFila(m3, e3)), 119, 'a que ficou em primeiro começa do zero');
});

test('missão de produzir: conta pelo item e pela construção; filtro de coisa que o jogo não faz fica para depois', () => {
  const missoes = [
    { id: 'pamonha', titulo: 'Pamonha', objetivo: { evento: 'produziu', filtro: { item: 'pamonha' }, n: 1 }, recompensa: {} },
    { id: 'fubas', titulo: 'Fubá', objetivo: { evento: 'produziu', filtro: { item: 'fuba' }, n: 2 }, recompensa: { ouro: 9 } },
    { id: 'no-moinho', titulo: 'No moinho', objetivo: { evento: 'produziu', filtro: { onde: 'moinho' }, n: 2 }, recompensa: { ouro: 5 } },
  ];
  const m = mundoDaIndustria((b) => { b.missoes.vizinho = missoes; }), e = porIndustria(m, 'moinho'), ev = ouvirTudo(m);
  dar(m, { milho: 12 });
  assert.ok(!missaoPossivel(m, m.dados.missoes.vizinho[0]), 'ninguém faz pamonha neste jogo');
  assert.equal(missaoAtual(m).missao.id, 'fubas');
  produzir(m, e, 'fuba'); produzir(m, e, 'racao'); pular(m, 500); retirar(m, e);
  assert.equal(missaoAtual(m).conta, 1, 'a ração não conta para a missão do fubá');
  produzir(m, e, 'fuba'); pular(m, 500); retirar(m, e);
  assert.deepEqual(ev.de('missaoConcluida').map((d) => d.id), ['fubas']);
  produzir(m, e, 'racao'); pular(m, 500); retirar(m, e);
  assert.deepEqual(ev.de('missaoConcluida').map((d) => d.id), ['fubas', 'no-moinho'], 'duas rações de uma receita só contam 2');
});

test('o guia de uma missão de produzir: construir, tocar na indústria, esperar, retirar; e o ingrediente que falta', () => {
  const m = mundoDaIndustria((b) => { b.missoes.vizinho = [{ id: 'fubas', titulo: 'Fubá', objetivo: { evento: 'produziu', filtro: { item: 'fuba' }, n: 1 }, recompensa: {} }]; });
  const passo = () => { const g = guiaDaMissao(m, {}); return g.tipo === 'entidade' ? 'entidade:' + g.id : g.tipo === 'painel' ? 'painel:' + g.painel + ':' + g.item : g.tipo; };
  assert.notEqual(passo(), 'entidade:moinho', 'sem o moinho, o passo é de quem ensina a construir');
  const e = porIndustria(m, 'moinho');
  assert.notEqual(passo(), 'entidade:' + e.id, 'sem milho, o passo é plantar ou colher');
  dar(m, { milho: 3 });
  assert.equal(passo(), 'entidade:' + e.id);
  produzir(m, e, 'fuba');
  assert.equal(passo(), 'esperar');
  pular(m, 200);
  assert.equal(passo(), 'entidade:' + e.id);
});

test('subir de nível mostra a receita nova, com a figura do que ela faz; a loja vende a embalagem que alguma receita gasta', () => {
  const m = mundoDaIndustria(), ev = ouvirTudo(m);
  m.progresso.xp = 9; m.comando({ tipo: 'viuDica', dica: 'x' });
  m.posses.celeiro.itens.rabanete = 1;
  // 1 de experiência leva ao nível 2, que libera a receita "duzia"
  porIndustria(m, 'bancada-de-carpintaria'); dar(m, { madeira: 2 });
  const b = m.construcao.todas.find((x) => x.tipo === 'bancada-de-carpintaria');
  produzir(m, b, 'tabua'); pular(m, 30); retirar(m, b);
  const lib = ev.de('subiuDeNivel')[0].liberou.find((x) => x.tipo === 'receitas');
  assert.deepEqual([lib.id, lib.nome, lib.icone], ['duzia', 'Dúzia de ovos', 'icone/duzia']);
  assert.ok(ofertasDaLoja(m).some((a) => a.ofertas.some((o) => o.item === 'cartela')), 'a loja vende a cartela');
  assert.ok(m.comando({ tipo: 'comprar', item: 'cartela', n: 2 }).ok);
  assert.equal(m.posses.bolsa.cartela, 2);
});

// ---------- com os dados de verdade (jogo/dados): as missões de indústria se cumprem ----------
const aqui = path.dirname(fileURLToPath(import.meta.url));
function mundoDeVerdade(nivel) {
  const { dados, problemas } = prepararDados(lerPasta(path.join(aqui, '..', 'dados')));
  assert.deepEqual(problemas.filter((p) => p.grave), []);
  const m = new Mundo(dados, { agora: 1_700_000_000_000 });
  m.progresso.nivel = nivel; m.progresso.xp = dados.niveis.limiar[nivel];
  m.posses.celeiro.capacidade = 500;
  return m;
}
test('dados de verdade: a subida para o nível 7 mostra o fubá como receita nova e a ração uma vez só (é item da loja)', () => {
  const m = mundoDeVerdade(6), ev = ouvirTudo(m);
  darXp(m, m.dados.niveis.limiar[7] - m.progresso.xp);
  assert.equal(m.progresso.nivel, 7);
  const lib = ev.de('subiuDeNivel')[0].liberou;
  assert.deepEqual(lib.filter((x) => x.tipo === 'receitas').map((x) => [x.id, x.icone]), [['fuba', 'icone/fuba']]);
  assert.equal(lib.filter((x) => x.id === 'racao' || x.item === 'racao').length, 1, 'a ração aparece uma vez');
});

// põe a construção pronta no primeiro lugar livre do terreiro
function erguer(m, id) {
  const loc = m.locais.fazenda, c = m.dados.construcoes[id].casas, a = m.dados.terras.limpo || m.dados.terras.inicial;
  for (let z = a[1] + 1; z < a[3] - c[1] - 1; z++) for (let x = a[0] + 1; x < a[2] - c[0] - 1; x++) {
    if (loc.areaLivre(x - 1, z - 1, x + c[0] + 1, z + c[1] + 1)) return colocar(m, id, x, z, { quieto: true });
  }
  throw new Error('sem lugar para ' + id);
}
// faz a missão "id" ser a da vez
function naMissao(m, id) { m.missoes.feitas = m.dados.missoes.vizinho.map((x) => x.id).filter((x) => x !== id); m.missoes.de = null; m.missoes.conta = 0; return missaoAtual(m); }

const CASOS = [
  { missao: 'tabuas', nivel: 4, onde: 'bancada-de-carpintaria', receita: 'tabua', vezes: 4 },
  { missao: 'embalar', nivel: 6, onde: 'bancada-de-embalar', receita: 'duzia-de-ovos', vezes: 1 },
  { missao: 'moinho', nivel: 7, onde: 'moinho', receita: 'fuba', vezes: 2 },
  { missao: 'cozinha', nivel: 8, onde: 'cozinha', receita: 'bolo-de-fuba', vezes: 1 },
  { missao: 'queijo', nivel: 11, onde: 'laticinio', receita: 'queijo-minas', vezes: 1 },
];
for (const c of CASOS) {
  test(`dados de verdade: a missão "${c.missao}" se cumpre produzindo ${c.receita}`, () => {
    const m = mundoDeVerdade(c.nivel), ev = ouvirTudo(m), R = receitasDe(m.dados).todas[c.receita];
    assert.ok(R, 'a receita existe'); assert.equal(R.onde, c.onde);
    const mi = m.dados.missoes.vizinho.find((x) => x.id === c.missao);
    assert.ok(missaoPossivel(m, mi), 'o filtro da missão é aceito');
    const a = naMissao(m, c.missao);
    assert.equal(a.missao.id, c.missao); assert.equal(a.esperaNivel, 0, 'a missão vale no nível dela');
    const e = erguer(m, c.onde);
    const itens = {};
    for (const k in R.entra) itens[k] = R.entra[k] * c.vezes;
    dar(m, itens);
    for (let k = 0; k < c.vezes; k++) {
      if (!produzir(m, e, c.receita).ok) { pular(m, R.tempoSeg * 3 + 1); assert.ok(retirar(m, e).ok); assert.ok(produzir(m, e, c.receita).ok, 'coube na fila depois de retirar'); }
    }
    pular(m, R.tempoSeg * (c.vezes + 1));
    retirar(m, e);
    pular(m, R.tempoSeg * (c.vezes + 1));
    retirar(m, e);
    assert.ok(ev.de('missaoConcluida').some((d) => d.id === c.missao), 'a missão se cumpriu');
    assert.ok(quantoTem(m, R.item) >= R.n * c.vezes, 'o produto está no estoque');
  });
}

test('dados de verdade: toda indústria tem receitas, duas vagas ao nascer e três vagas a mais com preço em ouro e em cash', () => {
  let m, R;
  for (const id of ['bancada-de-carpintaria', 'bancada-de-embalar', 'moinho', 'cozinha', 'laticinio']) {
    m = mundoDeVerdade(30); R = receitasDe(m.dados);
    assert.ok(R.porConstrucao[id] && R.porConstrucao[id].length, id + ' tem receita');
    const e = erguer(m, id);
    assert.equal(vagasDaFila(m, e), 2);
    for (const n of [3, 4, 5]) {
      const v = proximaVaga(m, e);
      assert.ok(v && v.fila === n && v.custo.ouro > 0 && v.cash > 0, `${id}: a ${n}ª vaga tem os dois preços`);
      m.posses.cash += v.cash;
      assert.ok(m.comando({ tipo: 'ampliar', entidade: e.id, cash: true }).ok);
    }
    assert.equal(vagasDaFila(m, e), 5); assert.equal(proximaVaga(m, e), null);
  }
  assert.equal(Object.keys(R.todas).length, Object.keys(m.dados.bruto.receitas).filter((k) => typeof m.dados.bruto.receitas[k] === 'object').length, 'nenhuma receita dos dados ficou de fora');
});
