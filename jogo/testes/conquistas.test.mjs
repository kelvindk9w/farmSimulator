// Conquistas: contam qualquer evento, ficam prontas para receber e entregam o prêmio quando o jogador recebe.
import test from 'node:test';
import assert from 'node:assert/strict';
import { dadosDeTeste, ouvirTudo, ateParar, arar, tocarEm, colher, plantarAtePronta, CAMPO } from './apoio.mjs';
import { comProgresso, mundoComProgresso } from './apoio-progresso.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { darXp } from '../src/nucleo/sistemas/niveis.js';
import { listaDeConquistas, conquistasProntas, estadoDaConquista } from '../src/nucleo/sistemas/conquistas.js';
import { progressoDe } from '../src/nucleo/premios.js';

const de = (m, id) => estadoDaConquista(m, progressoDe(m.dados).conquistas.find((c) => c.id === id));
const copia = (o) => JSON.parse(JSON.stringify(o));

test('a conquista conta o evento, fica pronta no marco e só paga quando o jogador recebe', () => {
  const m = mundoComProgresso(), ev = ouvirTudo(m);
  arar(m, [CAMPO[0]]);
  assert.equal(de(m, 'terra-arada').valor, 1);
  assert.equal(conquistasProntas(m), 0);
  assert.deepEqual(de(m, 'terra-arada').proximo, { marco: 0, alvo: 2, de: 0, recompensa: { ouro: 5, cash: 1, xp: 0, itens: {} }, pronta: false });
  arar(m, [CAMPO[1]]);
  assert.equal(conquistasProntas(m), 1);
  assert.deepEqual(ev.de('conquistaPronta'), [{ id: 'terra-arada', nome: 'Terra arada', marco: 0, alvo: 2 }]);
  const ouro = m.posses.ouro, cash = m.posses.cash;
  assert.equal(m.posses.ouro, ouro, 'pronta não é paga: espera o jogador');

  const r = m.comando({ tipo: 'receberConquista', id: 'terra-arada' });
  assert.equal(r.ok, true);
  assert.deepEqual(r.dados.recompensa, { ouro: 5, cash: 1, xp: 0, itens: {} });
  assert.equal(m.posses.ouro, ouro + 5); assert.equal(m.posses.cash, cash + 1);
  assert.equal(ev.de('conquista').length, 1);
  assert.equal(ev.de('resgatou')[0].classe, 'conquista');
  assert.equal(conquistasProntas(m), 0);
  assert.equal(m.comando({ tipo: 'receberConquista', id: 'terra-arada' }).motivo, 'conquista-ainda-nao');
  assert.equal(m.comando({ tipo: 'receberConquista', id: 'nao-existe' }).motivo, 'conquista-desconhecida');
  // o marco seguinte: a barra começa no marco anterior
  assert.equal(de(m, 'terra-arada').proximo.alvo, 4); assert.equal(de(m, 'terra-arada').proximo.de, 2);
  arar(m, [CAMPO[2], CAMPO[3]]);
  assert.equal(ev.de('conquistaPronta').length, 2);
  assert.equal(m.comando({ tipo: 'receberConquista', id: 'terra-arada' }).dados.marco, 1);
  assert.equal(de(m, 'terra-arada').completa, true);
  assert.equal(de(m, 'terra-arada').proximo, null);
});

test('o filtro escolhe os eventos, "soma" soma um campo e "conta: nivel" vale o nível', () => {
  const m = mundoComProgresso(), ev = ouvirTudo(m);
  m.posses.bolsa['semente-rabanete'] = 8;
  plantarAtePronta(m, CAMPO.slice(0, 2));
  colher(m, CAMPO.slice(0, 2));
  const colhidos = ev.de('colheu').reduce((s, d) => s + d.n, 0);
  assert.ok(colhidos >= 3);
  assert.equal(de(m, 'so-rabanete').valor, colhidos, 'colheu { item: rabanete, n }: soma as unidades');
  assert.equal(de(m, 'so-rabanete').prontas, 1);
  m.eventos.emitir('colheu', { item: 'milho', n: 50 });
  assert.equal(de(m, 'so-rabanete').valor, colhidos, 'milho não está no filtro');
  tocarEm(m, 'banca'); ateParar(m);
  const vendido = ev.de('vendeu').reduce((s, d) => s + d.ouro, 0);
  assert.ok(vendido >= 10);
  assert.equal(de(m, 'bom-de-venda').valor, vendido, 'vendeu { ouro }: soma o ouro, não as unidades');
  assert.equal(de(m, 'bom-de-venda').prontas, 1);

  assert.equal(de(m, 'fazendeiro').valor, m.progresso.nivel);
  darXp(m, 200, 'teste'); // do nível que estiver até o 4: os dois marcos (2 e 3) de uma vez
  assert.equal(de(m, 'fazendeiro').prontas, 2);
  const a = m.comando({ tipo: 'receberConquista', id: 'fazendeiro' }), b = m.comando({ tipo: 'receberConquista', id: 'fazendeiro' });
  assert.equal(a.dados.alvo, 2); assert.equal(a.dados.restam, 1);
  assert.equal(b.dados.alvo, 3); assert.equal(b.dados.restam, 0);
});

test('não há lista fixa: evento que outra frente emitir já conta; o que ninguém emite não aparece', () => {
  const m = mundoComProgresso();
  const ids = () => listaDeConquistas(m).map((e) => e.id);
  assert.ok(!ids().includes('tosquiador'), 'ninguém registrou "tosou": a conquista fica escondida');
  assert.ok(ids().includes('terra-arada'));
  m.eventos.emitir('tosou', { item: 'la', n: 3 });
  m.eventos.emitir('tosou', { item: 'pelo', n: 9 });
  assert.equal(de(m, 'tosquiador').valor, 3);
  assert.ok(ids().includes('tosquiador'), 'andou, aparece');
  m.eventos.emitir('tosou', { item: 'la', n: 2 });
  assert.equal(conquistasProntas(m), 1);
  // as que têm prêmio vêm primeiro
  assert.equal(ids()[0], 'tosquiador');
});

test('gravar e carregar guarda o andamento e não anuncia de novo o que já estava pronto', () => {
  const m = mundoComProgresso();
  arar(m, [CAMPO[0], CAMPO[1], CAMPO[2]]);
  const g = copia(m.salvar());
  assert.deepEqual(g.sistemas.conquistas, { conta: { 'terra-arada': 3 }, recebidos: {}, avisadas: { 'terra-arada': 1 } });
  const n = Mundo.carregar(dadosDeTeste(comProgresso), g), ev = ouvirTudo(n);
  assert.deepEqual(n.salvar(), g);
  n.avancar(2);
  assert.equal(ev.de('conquistaPronta').length, 0);
  assert.equal(conquistasProntas(n), 1);
  assert.equal(n.comando({ tipo: 'receberConquista', id: 'terra-arada' }).ok, true);
});

test('uma gravação do M1 (sem o estado desta frente) abre, e o nível que ela já tinha conta', () => {
  const m = mundoComProgresso();
  arar(m, [CAMPO[0]]);
  darXp(m, 35, 'teste'); // nível 3
  const g = copia(m.salvar());
  for (const k of ['conquistas', 'diaria', 'amigos', 'roupas', 'cash', 'correio']) delete g.sistemas[k];
  const n = Mundo.carregar(dadosDeTeste(comProgresso), g), ev = ouvirTudo(n);
  assert.equal(n.progresso.nivel, 3);
  assert.deepEqual(n.conquistas.conta, {});
  assert.deepEqual(n.roupas.vestindo, { chapeu: null, roupa: null, calcado: null, pintura: null });
  assert.equal(n.cash.comprado, 0);
  assert.equal(n.amigos.codigo.length, 6);
  assert.equal(n.diaria.ultimoDia, null);
  n.avancar(1.1);
  assert.deepEqual(ev.de('conquistaPronta').map((d) => d.alvo), [3], 'o nível já alcançado fica pronto para receber (um aviso só)');
  assert.equal(de(n, 'fazendeiro').prontas, 2);
  assert.equal(ev.de('presenteChegou').length, 1, 'e o presente do dia espera no correio');
  // e os dados pequenos, sem conquistas nem cash, também abrem
  const p = Mundo.carregar(dadosDeTeste(), g);
  assert.deepEqual(listaDeConquistas(p), []);
  p.avancar(1.1);
  assert.equal(p.comando({ tipo: 'abrirPresente' }).motivo, 'sem-presente');
});
