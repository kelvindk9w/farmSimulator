// Amigos: o convite (presente para os dois) e o compartilhar (um agrado pequeno, uma vez por dia).
import test from 'node:test';
import assert from 'node:assert/strict';
import { dadosDeTeste, ouvirTudo, pular, arar, CAMPO } from './apoio.mjs';
import { comProgresso, mundoComProgresso, DIA, MEIO_DIA_MS } from './apoio-progresso.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { darXp } from '../src/nucleo/sistemas/niveis.js';
import { estadoDosAmigos, presentesDeAmigos, limparCodigo } from '../src/nucleo/sistemas/amigos.js';
import { noCorreio } from '../src/nucleo/sistemas/correio.js';

test('cada fazenda tem um código de convite que cabe num endereço e não muda ao gravar', () => {
  const a = mundoComProgresso(), b = mundoComProgresso(null, { agora: MEIO_DIA_MS + 1234 });
  assert.match(a.amigos.codigo, /^[a-hjkmnp-z2-9]{6}$/);
  assert.notEqual(a.amigos.codigo, b.amigos.codigo);
  pular(a, 3 * DIA);
  const n = Mundo.carregar(dadosDeTeste(comProgresso), JSON.parse(JSON.stringify(a.salvar())));
  assert.equal(n.amigos.codigo, a.amigos.codigo);
  assert.equal(limparCodigo('  AbC-234 '), 'abc234');
  assert.equal(limparCodigo('<script>'), 'script');
  assert.equal(limparCodigo('a'), '');
});

test('quem abre o jogo pela primeira vez com um convite ganha o presente de convidado (uma vez)', () => {
  const m = mundoComProgresso(), ev = ouvirTudo(m);
  assert.equal(m.comando({ tipo: 'usarConvite', codigo: m.amigos.codigo }).motivo, 'convite-proprio');
  assert.equal(m.comando({ tipo: 'usarConvite', codigo: '!!' }).motivo, 'convite-invalido');
  assert.equal(m.comando({ tipo: 'receberConvite' }).motivo, 'sem-presente');
  assert.equal(m.comando({ tipo: 'usarConvite', codigo: 'ABC234' }).ok, true);
  assert.equal(estadoDosAmigos(m).presenteDeConvidado, 'espera');
  assert.equal(presentesDeAmigos(m), 1);
  assert.equal(noCorreio(m)[0].classe, 'convidado', 'espera no correio: não abre sozinho');
  assert.equal(m.posses.bolsa.tabua, undefined);
  const cash = m.posses.cash, r = m.comando({ tipo: 'receberConvite' });
  assert.deepEqual(r.dados.recompensa, { ouro: 0, cash: 5, xp: 0, itens: { tabua: 6, prego: 12 } });
  assert.equal(m.posses.cash, cash + 5); assert.equal(m.posses.bolsa.tabua, 6); assert.equal(m.posses.bolsa.prego, 12);
  assert.equal(ev.de('resgatou')[0].classe, 'convite');
  assert.equal(ev.de('recompensa')[0].classe, 'convidado');
  assert.equal(m.comando({ tipo: 'receberConvite' }).motivo, 'sem-presente');
  assert.equal(m.comando({ tipo: 'usarConvite', codigo: 'xyz789' }).motivo, 'convite-ja-usado');
  assert.equal(m.amigos.convidadoPor, 'abc234');
});

test('fazenda que já começou não usa convite; convite desligado nos dados não vale', () => {
  const m = mundoComProgresso();
  arar(m, [CAMPO[0], CAMPO[1]]); // cumpre a primeira missão
  assert.equal(m.comando({ tipo: 'usarConvite', codigo: 'abc234' }).motivo, 'convite-so-no-comeco');
  const d = mundoComProgresso((b) => { b.missoes.convite.ligado = false; });
  assert.equal(d.comando({ tipo: 'usarConvite', codigo: 'abc234' }).motivo, 'convite-desligado');
  assert.equal(d.comando({ tipo: 'amigoChegou', codigo: 'abc234' }).motivo, 'convite-desligado');
  assert.equal(estadoDosAmigos(d).ligado, false);
});

test('amigo que chega ao nível pedido deixa um presente para quem convidou, até o limite', () => {
  const m = mundoComProgresso(), ev = ouvirTudo(m);
  darXp(m, 10, 'teste'); // nível 2
  assert.equal(m.comando({ tipo: 'receberDeAmigo' }).motivo, 'sem-presente');
  assert.equal(m.comando({ tipo: 'amigoChegou', codigo: 'amigo1' }).ok, true);
  assert.equal(m.comando({ tipo: 'amigoChegou', codigo: 'AMIGO1' }).motivo, 'amigo-repetido');
  assert.equal(m.comando({ tipo: 'amigoChegou', codigo: m.amigos.codigo }).motivo, 'convite-invalido');
  assert.equal(m.comando({ tipo: 'amigoChegou', codigo: 'amigo2' }).ok, true);
  assert.deepEqual(noCorreio(m).find((c) => c.classe === 'amigo'), { classe: 'amigo', n: 2, comando: 'receberDeAmigo' });
  const ouro = m.posses.ouro, cash = m.posses.cash;
  const r = m.comando({ tipo: 'receberDeAmigo' });
  assert.deepEqual(r.dados.recompensa, { ouro: 100, cash: 10, xp: 0, itens: {} }, '10 de cash e 50 de ouro por nível');
  assert.equal(r.dados.restam, 1);
  assert.equal(m.posses.ouro, ouro + 100); assert.equal(m.posses.cash, cash + 10);
  assert.equal(ev.de('recompensa')[0].classe, 'amigo');
  assert.equal(m.comando({ tipo: 'amigoChegou', codigo: 'amigo3' }).ok, true);
  assert.deepEqual(m.comando({ tipo: 'amigoChegou', codigo: 'amigo4' }), { ok: false, motivo: 'convite-limite', dados: { limite: 3 } });
  const e = estadoDosAmigos(m);
  assert.equal(e.chegaram, 3); assert.equal(e.aReceber, 2); assert.equal(e.recebidos, 1);
  // gravar e carregar
  const g = JSON.parse(JSON.stringify(m.salvar())), n = Mundo.carregar(dadosDeTeste(comProgresso), g);
  assert.deepEqual(n.salvar(), g);
  assert.equal(presentesDeAmigos(n), 2);
});

test('compartilhar dá um agrado de ouro uma vez por dia; desligado nos dados, não dá nada (e não reclama)', () => {
  const m = mundoComProgresso(), ev = ouvirTudo(m);
  const ouro = m.posses.ouro;
  const a = m.comando({ tipo: 'compartilhar', modo: 'foto' });
  assert.deepEqual(a.dados, { modo: 'foto', recompensa: { ouro: 10, cash: 0, xp: 0, itens: {} } });
  assert.equal(m.posses.ouro, ouro + 10);
  assert.equal(estadoDosAmigos(m).compartilhar.ganhouHoje, true);
  const b = m.comando({ tipo: 'compartilhar', modo: 'convite' });
  assert.equal(b.ok, true); assert.equal(b.dados.recompensa, null);
  assert.equal(m.posses.ouro, ouro + 10);
  assert.equal(ev.de('compartilhou').length, 2);
  pular(m, DIA);
  assert.equal(estadoDosAmigos(m).compartilhar.ganhouHoje, false);
  assert.equal(m.comando({ tipo: 'compartilhar', modo: 'foto' }).dados.recompensa.ouro, 10);

  const d = mundoComProgresso((x) => { x.missoes.compartilhar.ligado = false; });
  const r = d.comando({ tipo: 'compartilhar', modo: 'foto' });
  assert.equal(r.ok, true); assert.equal(r.dados.recompensa, null);
  assert.equal(d.posses.ouro, 20);
});

test('o nome da fazenda é limpo e cortado', () => {
  const m = mundoComProgresso();
  assert.equal(m.comando({ tipo: 'nomearFazenda', nome: '  Sítio   <b>Boa</b> Vista\n' }).dados.nome, 'Sítio b Boa /b Vista');
  assert.equal(m.comando({ tipo: 'nomearFazenda', nome: 'x'.repeat(80) }).dados.nome.length, 24);
  assert.equal(m.comando({ tipo: 'nomearFazenda', nome: 'Fazenda Esperança' }).dados.nome, 'Fazenda Esperança');
  const n = Mundo.carregar(dadosDeTeste(comProgresso), JSON.parse(JSON.stringify(m.salvar())));
  assert.equal(estadoDosAmigos(n).nome, 'Fazenda Esperança');
  assert.equal(m.comando({ tipo: 'nomearFazenda', nome: '' }).dados.nome, '');
});
