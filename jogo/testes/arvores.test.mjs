// Árvores frutíferas: a muda se compra e se planta respeitando o espaçamento, cresce pelo relógio (também fora do
// jogo), dá fruta que espera no pé (guarda uma) e se colhe de novo e de novo, sem replantar.
import test from 'node:test';
import assert from 'node:assert/strict';
import { dadosDeTeste, ateParar, ouvirTudo, modo, tocar, tocarEm, arar, pular } from './apoio.mjs';
import { comTerras, mundoDasTerras, porObstaculo } from './apoio-terras.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { ARADA, GRAMA } from '../src/nucleo/local.js';
import { descreverCasa, descreverEntidade } from '../src/nucleo/sistemas/personagem.js';
import { plantavel } from '../src/nucleo/sistemas/lavoura.js';
import { faseDaArvore, safrasProntas, esperaDaArvore, podePlantarArvore, arvoresComFruta, casaParaArvore, crescimento } from '../src/nucleo/sistemas/arvores.js';
import { missaoPossivel } from '../src/nucleo/sistemas/missoes.js';
import { guiaDaMissao } from '../src/nucleo/guia.js';
import { CONCLUIVEIS } from '../src/nucleo/concluir.js';
import { ofertasDaLoja } from '../src/nucleo/sistemas/loja.js';
import { capacidadeDoCesto } from '../src/nucleo/sistemas/posses.js';

const MUDA = 'muda-bananeira';
const POMAR = { id: 'pomar', titulo: 'Pomar', fala: 'Plante uma bananeira.', objetivo: { evento: 'plantou', filtro: { item: MUDA }, n: 1 }, recompensa: { ouro: 5 } };
const CACHO = { id: 'cacho', titulo: 'Cacho', fala: 'Colha banana.', objetivo: { evento: 'colheu', filtro: { item: 'banana' }, n: 3 }, recompensa: { ouro: 5 } };
// planta uma bananeira em (x, z) pelos mesmos comandos do toque e devolve a entidade
function plantar(m, x, z) {
  if (!(m.posses.bolsa[MUDA] > 0)) m.posses.bolsa[MUDA] = 1;
  modo(m, 'semear', MUDA);
  const r = tocar(m, x, z);
  assert.equal(r.ok, true, 'o toque devia plantar: ' + r.motivo);
  ateParar(m);
  return m.local.entidadeEm(x, z);
}

test('a muda se compra na loja, aparece como coisa de plantar e o toque no modo semear planta a árvore', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m);
  m.posses.ouro = 100;
  assert.ok(ofertasDaLoja(m).some((a) => a.ofertas.some((o) => o.item === MUDA)), 'a loja vende a muda');
  assert.equal(plantavel(m.dados, MUDA), true); assert.equal(plantavel(m.dados, 'semente-rabanete'), true); assert.equal(plantavel(m.dados, 'banana'), false);
  assert.equal(m.comando({ tipo: 'comprar', item: MUDA, n: 2 }).ok, true);
  assert.equal(m.posses.bolsa[MUDA], 2);
  assert.equal(modo(m, 'semear', MUDA).ok, true);
  assert.equal(m.modo.semente, MUDA);
  const d = descreverCasa(m, 12, 12);
  assert.equal(d.acao, 'plantarMuda'); assert.deepEqual(d.args, { muda: MUDA });
  const e = plantar(m, 12, 12);
  assert.equal(e.tipo, 'arvore'); assert.equal(e.arvore, 'bananeira');
  assert.equal(m.posses.bolsa[MUDA], 1);
  assert.equal(m.local.andavel(12, 12), false, 'a árvore ocupa a casa');
  const p = ev.de('plantou')[0];
  assert.equal(p.item, MUDA); assert.equal(p.arvore, 'bananeira'); assert.equal(p.x, 12); assert.equal(p.z, 12);
  assert.equal(faseDaArvore(m, e), 'muda');
  // em terra arada também se planta (a casa volta a ser grama)
  arar(m, [[12, 15]]);
  assert.equal(m.local.chao[m.local.i(12, 15)], ARADA);
  plantar(m, 12, 15);
  assert.equal(m.local.chao[m.local.i(12, 15)], GRAMA);
  // acabou a muda: o modo volta para as sementes
  modo(m, 'semear');
  assert.equal(m.modo.semente, 'semente-rabanete');
});

test('espaçamento: perto demais de outra árvore não planta, e o motivo diz quantas casas', () => {
  const m = mundoDasTerras();
  m.posses.bolsa[MUDA] = 5;
  plantar(m, 12, 12);
  modo(m, 'semear', MUDA);
  for (const [x, z] of [[13, 12], [12, 13], [13, 13], [11, 11]]) {
    const d = descreverCasa(m, x, z);
    assert.equal(d.acao, null); assert.equal(d.texto, 'muito-perto'); assert.equal(d.dados.casas, 2);
    assert.equal(tocar(m, x, z).ok, false);
  }
  assert.equal(podePlantarArvore(m, 14, 12, 'bananeira').ok, true, 'a duas casas já pode');
  assert.equal(podePlantarArvore(m, 12, 12, 'bananeira').motivo, 'casa-ocupada');
  assert.equal(podePlantarArvore(m, 21, 10, 'bananeira').motivo, 'terra-a-venda');
  // duas mudas na mesma arrastada: a segunda respeita a que ainda está na fila
  assert.equal(tocar(m, 14, 12).ok, true);
  assert.equal(descreverCasa(m, 15, 12).texto, 'muito-perto');
  assert.equal(tocar(m, 16, 12).ok, true);
  ateParar(m);
  assert.equal(m.arvores.todas.length, 3);
  // sem muda na bolsa
  m.posses.bolsa[MUDA] = 0;
  assert.equal(descreverCasa(m, 12, 16).texto, 'sem-mudas');
  // a casa sugerida pelo guia respeita o espaçamento
  const c = casaParaArvore(m, 'bananeira');
  assert.ok(c && podePlantarArvore(m, c[0], c[1], 'bananeira').ok);
});

test('a muda não tranca nada: casa que fecharia a passagem é recusada (a árvore não se arranca)', () => {
  const m = mundoDasTerras();
  m.posses.bolsa[MUDA] = 5;
  // um vão de uma casa em (12, 12): mato a leste e a oeste, bananeira ao norte
  porObstaculo(m, 'mato', 11, 12); porObstaculo(m, 'mato', 13, 12);
  plantar(m, 12, 11);
  const p = m.personagem; p.x = 16.5; p.z = 16.5; // ela longe dali
  assert.equal(podePlantarArvore(m, 12, 13, 'bananeira').motivo, 'arvore-fecha-caminho', 'ao sul, a casa (12, 12) ficaria isolada');
  modo(m, 'semear', MUDA);
  assert.equal(tocar(m, 12, 13).ok, false);
  assert.equal(podePlantarArvore(m, 12, 14, 'bananeira').ok, true, 'uma casa adiante, o vão continua aberto');
  // ela mesma não fica presa: com ela no vão, a muda que a fecharia é recusada
  p.x = 12.5; p.z = 12.5;
  assert.equal(podePlantarArvore(m, 12, 13, 'bananeira').motivo, 'arvore-fecha-caminho');
});

test('cresce pelo relógio: muda, jovem, adulta; a primeira safra vem depois, espera no pé e guarda uma só', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m);
  const e = plantar(m, 12, 12);
  assert.equal(descreverEntidade(m, e.id).texto, 'arvore-crescendo');
  assert.ok(Math.abs(descreverEntidade(m, e.id).dados.seg - 100) < 1);
  m.avancar(49); assert.equal(faseDaArvore(m, e), 'muda');
  m.avancar(2); assert.equal(faseDaArvore(m, e), 'jovem');
  m.avancar(50); assert.equal(faseDaArvore(m, e), 'adulta'); assert.equal(crescimento(m, e), 1);
  assert.equal(descreverEntidade(m, e.id).texto, 'fruta-crescendo');
  assert.equal(safrasProntas(m, e), 0);
  assert.equal(ev.de('deuFruta').length, 0);
  m.avancar(50);
  assert.equal(faseDaArvore(m, e), 'fruta'); assert.equal(safrasProntas(m, e), 1);
  assert.equal(ev.de('deuFruta').length, 1, 'avisa uma vez');
  m.avancar(500);
  assert.equal(safrasProntas(m, e), 1, 'guarda uma safra só');
  assert.equal(ev.de('deuFruta').length, 1);
  assert.equal(arvoresComFruta(m), 1);
  assert.equal(esperaDaArvore(m, e), 0);
});

test('colher a fruta: um toque, vai para o cesto, dá experiência, e a árvore dá de novo sem replantar', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m);
  const e = plantar(m, 12, 12);
  pular(m, 151); m.avancar(1);
  const d = descreverEntidade(m, e.id);
  assert.equal(d.acao, 'colherFruta'); assert.equal(d.dados.n, 3); assert.equal(d.dados.item, 'banana');
  const xp = m.progresso.xp;
  modo(m, 'mao');
  assert.equal(tocarEm(m, e.id).ok, true);
  assert.equal(tocarEm(m, e.id).repetida, true);
  ateParar(m);
  assert.deepEqual(m.posses.cesto.itens, { banana: 3 });
  assert.equal(m.progresso.xp, xp + 4);
  const c = ev.de('colheu')[0];
  assert.equal(c.item, 'banana'); assert.equal(c.n, 3); assert.equal(c.arvore, 'bananeira');
  assert.equal(m.local.porId[e.id], e, 'a árvore continua lá');
  assert.equal(faseDaArvore(m, e), 'adulta');
  assert.equal(tocarEm(m, e.id).ok, false, 'sem fruta, o toque só informa');
  assert.equal(ev.de('informou').at(-1).motivo, 'fruta-crescendo');
  assert.ok(Math.abs(esperaDaArvore(m, e) - 50) < 2, 'a safra seguinte conta da colheita');
  m.avancar(51);
  assert.equal(safrasProntas(m, e), 1);
  assert.equal(ev.de('deuFruta').length, 2);
  tocarEm(m, e.id); ateParar(m);
  assert.deepEqual(m.posses.cesto.itens, { banana: 6 });
  // cesto cheio: a fruta fica no pé esperando
  m.avancar(51);
  assert.equal(capacidadeDoCesto(m), 6);
  const r = tocarEm(m, e.id);
  assert.equal(r.ok, false); assert.equal(r.motivo, 'cesto-cheio');
  assert.equal(safrasProntas(m, e), 1);
});

test('com "acumula" maior, as safras se juntam no pé e a colheita leva todas', () => {
  const m = mundoDasTerras((b) => { b.arvores.bananeira.acumula = 2; b.arvores.bananeira.rende = 2; });
  const e = plantar(m, 12, 12);
  pular(m, 100 + 50 * 5); m.avancar(1);
  assert.equal(safrasProntas(m, e), 2);
  const xp = m.progresso.xp;
  tocarEm(m, e.id); ateParar(m);
  assert.deepEqual(m.posses.cesto.itens, { banana: 4 });
  assert.equal(m.progresso.xp, xp + 8);
});

test('fora do jogo a árvore cresce e dá fruta; ao voltar, avisa uma vez', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m);
  const e = plantar(m, 12, 12);
  const texto = JSON.stringify(m.salvar());
  const m2 = Mundo.carregar(dadosDeTeste(comTerras), JSON.parse(texto)), ev2 = ouvirTudo(m2);
  const e2 = m2.arvores.todas[0];
  assert.equal(e2.x, 12); assert.equal(e2.z, 12); assert.equal(e2.arvore, 'bananeira'); assert.equal(e2.plantada, Math.round(e.plantada));
  assert.equal(m2.local.entidadeEm(12, 12), e2);
  assert.equal(faseDaArvore(m2, e2), 'muda');
  pular(m2, 3600);
  assert.equal(faseDaArvore(m2, e2), 'fruta');
  assert.equal(ev2.de('deuFruta').length, 1);
  // gravada com fruta no pé: ao abrir de novo não avisa outra vez, e a fruta continua lá
  const m3 = Mundo.carregar(dadosDeTeste(comTerras), JSON.parse(JSON.stringify(m2.salvar()))), ev3 = ouvirTudo(m3);
  m3.avancar(2);
  assert.equal(ev3.de('deuFruta').length, 0);
  assert.equal(safrasProntas(m3, m3.arvores.todas[0]), 1);
  // colhida, a data da colheita também se grava
  tocarEm(m3, m3.arvores.todas[0].id); ateParar(m3);
  const m4 = Mundo.carregar(dadosDeTeste(comTerras), JSON.parse(JSON.stringify(m3.salvar())));
  assert.equal(safrasProntas(m4, m4.arvores.todas[0]), 0);
  assert.ok(m4.arvores.todas[0].colhida > 0);
  assert.equal(ev.de('deuFruta').length, 0);
});

test('a muda crescendo é um relógio que o cash conclui (tipo "muda")', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m), c = CONCLUIVEIS.muda;
  assert.ok(c, 'registrado em nucleo/concluir.js');
  const e = plantar(m, 12, 12);
  assert.ok(Math.abs(c.falta(m, e.id) - 100) < 2);
  assert.equal(c.nome(m, e.id), 'Bananeira');
  assert.equal(c.falta(m, { entidade: e.id }), c.falta(m, e));
  assert.equal(c.terminar(m, e.id), true);
  assert.equal(faseDaArvore(m, e), 'adulta');
  assert.equal(c.falta(m, e.id), 0);
  assert.equal(c.terminar(m, e.id), false, 'adulta: nada a concluir');
  assert.equal(ev.de('arvoreCresceu')[0].entidade, e.id);
  assert.equal(safrasProntas(m, e), 0, 'a primeira safra vem no tempo dela');
  m.avancar(51);
  assert.equal(safrasProntas(m, e), 1);
  assert.equal(c.falta(m, 'nao-existe'), 0);
});

test('missões de pomar: "plantou" com a muda e "colheu" com a fruta valem, e o guia leva até lá', () => {
  const dados = dadosDeTeste((b) => { comTerras(b); b.missoes.vizinho = [POMAR, CACHO]; });
  const m = new Mundo(dados, { agora: 1 }), ev = ouvirTudo(m);
  assert.equal(missaoPossivel(m, POMAR), true); assert.equal(missaoPossivel(m, CACHO), true);
  assert.equal(missaoPossivel(m, { objetivo: { evento: 'plantou', filtro: { item: 'muda-de-nada' } } }), false);
  let g = guiaDaMissao(m, {});
  assert.equal(g.tipo, 'painel'); assert.equal(g.painel, 'loja'); assert.equal(g.item, MUDA);
  m.posses.ouro = 100; m.comando({ tipo: 'comprar', item: MUDA });
  g = guiaDaMissao(m, {}); assert.equal(g.tipo, 'modo'); assert.equal(g.modo, 'semear');
  modo(m, 'semear', 'semente-rabanete');
  g = guiaDaMissao(m, {}); assert.equal(g.tipo, 'semente'); assert.equal(g.item, MUDA);
  modo(m, 'semear', MUDA);
  g = guiaDaMissao(m, {}); assert.equal(g.tipo, 'casa');
  tocar(m, g.x, g.z); ateParar(m);
  assert.equal(ev.de('missaoConcluida')[0].id, 'pomar');
  g = guiaDaMissao(m, {}); assert.equal(g.tipo, 'esperar'); assert.ok(g.seg > 100);
  pular(m, 200); m.avancar(1);
  g = guiaDaMissao(m, {}); assert.equal(g.tipo, 'entidade'); assert.equal(g.id, m.arvores.todas[0].id);
  tocarEm(m, g.id); ateParar(m);
  assert.equal(ev.de('missaoConcluida')[1].id, 'cacho');
});

test('a personagem não fica presa dentro da árvore que plantou, e a árvore pede o nível dos dados', () => {
  const m = mundoDasTerras((b) => { b.arvores.bananeira.nivel = 2; });
  m.posses.bolsa[MUDA] = 1;
  modo(m, 'semear', MUDA);
  assert.equal(descreverCasa(m, 12, 12).texto, 'nivel-baixo');
  m.progresso.nivel = 2;
  const e = plantar(m, 12, 12), p = m.personagem;
  assert.ok(Math.floor(p.x) !== e.x || Math.floor(p.z) !== e.z, 'ela está fora da casa da árvore');
  assert.equal(m.comando({ tipo: 'irPara', x: 15.5, z: 15.5 }).ok, true);
  ateParar(m);
  assert.ok(Math.hypot(p.x - 15.5, p.z - 15.5) < 0.05, 'e consegue sair andando');
});
