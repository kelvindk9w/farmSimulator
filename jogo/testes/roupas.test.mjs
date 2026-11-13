// O guarda-roupa: comprar com ouro, vestir e tirar; só o que o desenho sabe mostrar.
import test from 'node:test';
import assert from 'node:assert/strict';
import { dadosDeTeste, ouvirTudo } from './apoio.mjs';
import { comProgresso, mundoComProgresso } from './apoio-progresso.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { darXp } from '../src/nucleo/sistemas/niveis.js';
import { darItem } from '../src/nucleo/sistemas/posses.js';
import { VESTIVEL, guardaRoupa, temCosmetico } from '../src/nucleo/sistemas/roupas.js';

const prontos = (...ids) => { for (const k in VESTIVEL) delete VESTIVEL[k]; for (const id of ids) VESTIVEL[id] = true; };
const item = (m, id) => guardaRoupa(m).flatMap((g) => g.itens).find((x) => x.id === id);

test('comprar roupa com ouro: pede o nível, cobra, guarda na bolsa e já veste', () => {
  prontos('camisa-xadrez');
  const m = mundoComProgresso(), ev = ouvirTudo(m);
  const comprar = () => m.comando({ tipo: 'comprarCosmetico', item: 'camisa-xadrez' });
  assert.deepEqual(comprar(), { ok: false, motivo: 'nivel-baixo', dados: { nivel: 2, item: 'camisa-xadrez' } });
  darXp(m, 10, 'teste'); // nível 2: ouro 20 + 15
  m.posses.ouro = 5;
  assert.deepEqual(comprar(), { ok: false, motivo: 'sem-ouro', dados: { falta: 7, item: 'camisa-xadrez' } });
  m.posses.ouro = 30;
  assert.deepEqual(comprar(), { ok: true, dados: { item: 'camisa-xadrez', ouro: 12 } });
  assert.equal(m.posses.ouro, 18);
  assert.equal(temCosmetico(m, 'camisa-xadrez'), true);
  assert.equal(m.roupas.vestindo.roupa, 'camisa-xadrez');
  assert.deepEqual(ev.de('comprou').pop(), { item: 'camisa-xadrez', n: 1, ouro: 12, classe: 'cosmetico' });
  assert.deepEqual(ev.de('vestiu'), [{ item: 'camisa-xadrez', parte: 'roupa' }]);
  assert.equal(comprar().motivo, 'ja-tem');
  assert.equal(m.comando({ tipo: 'comprarCosmetico', item: 'enxada' }).motivo, 'nao-existe');
  assert.equal(m.comando({ tipo: 'comprarCosmetico', item: 'chapeu-de-palha' }).motivo, 'em-breve');
  prontos();
});

test('vestir e tirar: só o que ela tem e o que o desenho mostra; uma peça por parte', () => {
  prontos('chapeu-de-palha', 'camisa-xadrez');
  const m = mundoComProgresso();
  assert.equal(m.comando({ tipo: 'vestir', item: 'chapeu-de-palha' }).motivo, 'nao-tem');
  darItem(m, 'chapeu-de-palha', 1, 'diaria'); // prêmio do sétimo dia
  darItem(m, 'bota-de-couro', 1, 'teste');
  assert.equal(item(m, 'chapeu-de-palha').tem, true);
  assert.equal(m.comando({ tipo: 'vestir', item: 'chapeu-de-palha' }).ok, true);
  assert.equal(item(m, 'chapeu-de-palha').vestindo, true);
  assert.equal(m.comando({ tipo: 'vestir', item: 'bota-de-couro' }).motivo, 'em-breve', 'tem, mas ainda não há desenho');
  assert.equal(item(m, 'bota-de-couro').pronto, false);
  assert.equal(m.comando({ tipo: 'tirar', parte: 'chapeu' }).ok, true);
  assert.equal(m.roupas.vestindo.chapeu, null);
  assert.equal(m.comando({ tipo: 'tirar', parte: 'asa' }).motivo, 'nao-existe');
  prontos();
});

test('o guarda-roupa mostra os dois preços quando há (ouro da loja, cash da oferta) e o que é prêmio', () => {
  prontos('camisa-xadrez', 'bota-de-couro');
  const m = mundoComProgresso();
  const g = guardaRoupa(m);
  assert.deepEqual(g.map((x) => x.parte), ['chapeu', 'roupa', 'calcado', 'pintura']);
  assert.deepEqual([item(m, 'camisa-xadrez').ouro, item(m, 'camisa-xadrez').cash, item(m, 'camisa-xadrez').liberado], [12, 0, false]);
  assert.deepEqual([item(m, 'bota-de-couro').ouro, item(m, 'bota-de-couro').cash, item(m, 'bota-de-couro').oferta], [0, 6, 'bota-de-couro']);
  assert.deepEqual([item(m, 'chapeu-de-palha').ouro, item(m, 'chapeu-de-palha').cash], [0, 0], 'sem preço: é prêmio');
  prontos();
});

test('gravar e carregar guarda o que ela veste', () => {
  prontos('chapeu-de-palha');
  const m = mundoComProgresso();
  darItem(m, 'chapeu-de-palha', 1, 'teste');
  m.comando({ tipo: 'vestir', item: 'chapeu-de-palha' });
  const g = JSON.parse(JSON.stringify(m.salvar())), n = Mundo.carregar(dadosDeTeste(comProgresso), g);
  assert.deepEqual(n.salvar(), g);
  assert.equal(n.roupas.vestindo.chapeu, 'chapeu-de-palha');
  g.sistemas.roupas.vestindo.roupa = 'enxada'; // gravação estragada: não é roupa
  assert.equal(Mundo.carregar(dadosDeTeste(comProgresso), g).roupas.vestindo.roupa, null);
  prontos();
});
