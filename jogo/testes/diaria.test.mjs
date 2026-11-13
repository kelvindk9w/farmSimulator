// O presente do dia: sete presentes que avançam por dia jogado; faltar um dia não zera nada.
import test from 'node:test';
import assert from 'node:assert/strict';
import { dadosDeTeste, ouvirTudo, pular } from './apoio.mjs';
import { comProgresso, mundoComProgresso, DIA, MEIO_DIA_MS } from './apoio-progresso.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { darXp } from '../src/nucleo/sistemas/niveis.js';
import { temPresente, estadoDaDiaria, diaDoMundo } from '../src/nucleo/sistemas/diaria.js';
import { noCorreio, quantosNoCorreio } from '../src/nucleo/sistemas/correio.js';
import { conquistasProntas } from '../src/nucleo/sistemas/conquistas.js';

const abrir = (m) => m.comando({ tipo: 'abrirPresente' });
const estados = (m) => estadoDaDiaria(m).dias.map((d) => d.estado[0]).join('');

test('o presente espera no correio, abre uma vez por dia e avança a casa', () => {
  const m = mundoComProgresso(), ev = ouvirTudo(m);
  assert.equal(temPresente(m), true);
  assert.deepEqual(noCorreio(m), [{ classe: 'diaria', n: 1, comando: 'abrirPresente' }]);
  assert.equal(estados(m), 'hdddddd');
  assert.equal(m.posses.bolsa.prego, undefined, 'nada abre sozinho');
  m.avancar(1.1);
  assert.deepEqual(ev.de('presenteChegou'), [{ dia: 1 }]);

  const r = abrir(m);
  assert.equal(r.ok, true); assert.equal(r.dados.dia, 1);
  assert.deepEqual(r.dados.recompensa, { ouro: 0, cash: 0, xp: 0, itens: { prego: 10 } });
  assert.equal(m.posses.bolsa.prego, 10);
  assert.equal(ev.de('resgatou')[0].classe, 'diaria');
  assert.equal(ev.de('recompensa').length, 1);
  assert.equal(temPresente(m), false);
  assert.equal(abrir(m).motivo, 'presente-amanha');
  assert.equal(estados(m), 'aaddddd', 'aberto, amanhã, depois...');
  assert.equal(quantosNoCorreio(m), 0);

  pular(m, DIA);
  assert.equal(temPresente(m), true);
  assert.equal(ev.de('presenteChegou').length, 2);
  darXp(m, 10, 'teste'); // nível 2
  const ouro = m.posses.ouro;
  assert.deepEqual(estadoDaDiaria(m).dias[1].recompensa, { ouro: 40, cash: 0, xp: 0, itens: {} }, 'ouroPorNivel vezes o nível');
  assert.equal(abrir(m).dados.dia, 2);
  assert.equal(m.posses.ouro, ouro + 40);
});

test('faltar dias não zera: o próximo presente é o seguinte ao último aberto', () => {
  const m = mundoComProgresso();
  abrir(m); pular(m, DIA); abrir(m);
  pular(m, 9 * DIA); // nove dias sem jogar
  assert.equal(estados(m), 'aahdddd');
  assert.equal(abrir(m).dados.dia, 3);
  assert.equal(m.posses.bolsa.tabua, 3);
  pular(m, 3 * 3600); // mais tarde no mesmo dia
  assert.equal(abrir(m).motivo, 'presente-amanha');
});

test('o sétimo presente traz o extra só na primeira volta, e a volta seguinte recomeça do um', () => {
  const m = mundoComProgresso();
  for (let d = 1; d <= 6; d++) { assert.equal(abrir(m).dados.dia, d); pular(m, DIA); }
  assert.deepEqual(estadoDaDiaria(m).dias[6].recompensa.itens, { 'chapeu-de-palha': 1 });
  const r = abrir(m);
  assert.equal(r.dados.dia, 7);
  assert.deepEqual(r.dados.recompensa, { ouro: 0, cash: 5, xp: 0, itens: { 'chapeu-de-palha': 1 } });
  assert.equal(m.posses.bolsa['chapeu-de-palha'], 1);
  assert.equal(estados(m), 'aaaaaaa', 'o cartão fica todo marcado até o dia seguinte');
  assert.equal(estadoDaDiaria(m).completa, true);
  pular(m, DIA);
  assert.equal(estados(m), 'hdddddd');
  assert.deepEqual(estadoDaDiaria(m).dias[6].recompensa.itens, {}, 'na segunda volta o sétimo não repete o chapéu');
  for (let d = 1; d <= 7; d++) { assert.equal(abrir(m).dados.dia, d); pular(m, DIA); }
  assert.equal(m.posses.bolsa['chapeu-de-palha'], 1);
  assert.equal(m.diaria.voltas, 2);
  assert.equal(conquistasProntas(m), 1, 'cada presente aberto conta para a conquista "todo-dia"');
});

test('o dia vira à meia-noite do aparelho (o fuso vem da plataforma), não do relógio universal', () => {
  const m = mundoComProgresso(null, { agora: MEIO_DIA_MS + 11 * 3600 * 1000 }); // 23h no relógio universal
  assert.equal(m.comando({ tipo: 'fuso', minutos: -180 }).ok, true); // Brasília: 20h
  const dia = diaDoMundo(m);
  abrir(m);
  pular(m, 2 * 3600); // 01h universal do dia seguinte; em Brasília ainda são 22h
  assert.equal(diaDoMundo(m), dia);
  assert.equal(temPresente(m), false);
  pular(m, 2 * 3600 + 60); // passou da meia-noite de Brasília
  assert.equal(diaDoMundo(m), dia + 1);
  assert.equal(temPresente(m), true);
  assert.equal(m.comando({ tipo: 'fuso', minutos: 'abc' }).motivo, 'fuso-invalido');
  assert.equal(m.comando({ tipo: 'fuso', minutos: 5000 }).motivo, 'fuso-invalido');
});

test('relógio do aparelho mexido para trás não prende o presente para sempre', () => {
  const m = mundoComProgresso();
  pular(m, 30 * DIA); abrir(m); // abriu com o relógio um mês à frente
  const g = JSON.parse(JSON.stringify(m.salvar()));
  g.agora -= 30 * DIA * 1000; // o relógio voltou ao normal
  const n = Mundo.carregar(dadosDeTeste(comProgresso), g);
  assert.equal(temPresente(n), false);
  n.avancar(1.1);
  pular(n, DIA);
  assert.equal(temPresente(n), true, 'no dia seguinte já há presente');
});

test('gravar e carregar guarda a casa, a volta, o dia e o fuso', () => {
  const m = mundoComProgresso();
  m.comando({ tipo: 'fuso', minutos: -180 });
  abrir(m); pular(m, DIA); abrir(m);
  const g = JSON.parse(JSON.stringify(m.salvar()));
  assert.deepEqual(g.sistemas.diaria, { fuso: -180, proximo: 2, voltas: 0, ultimoDia: diaDoMundo(m), abertos: 2 });
  const n = Mundo.carregar(dadosDeTeste(comProgresso), g);
  assert.deepEqual(n.salvar(), g);
  assert.equal(temPresente(n), false);
  pular(n, DIA);
  assert.equal(abrir(n).dados.dia, 3);
});
