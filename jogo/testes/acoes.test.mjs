// As ações por toque (sistemas/acoes.js): o toque no alvo faz a ação natural dele, com a ferramenta certa, sem o
// jogador escolher modo. acoesDoAlvo dá a lista (a principal primeiro) para cada tipo de alvo; agirNoAlvo faz.
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, ateParar, ouvirTudo, pular, porConstrucao } from './apoio.mjs';
import { mundoDasTerras, porObstaculo, darFerramenta } from './apoio-terras.mjs';
import { mundoDosAnimais, porAbrigo, fartura, dar as darAnimais } from './apoio-animais.mjs';
import { mundoDoTrabalho, comBicho, dar as darTrabalho, passos } from './apoio-trabalho.mjs';
import { mundoDaIndustria, porIndustria, produzir, dar as darIndustria } from './apoio-industria.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { GRAMA, ARADA, CAMPO } from '../src/nucleo/local.js';
import { acoesDoAlvo, fileiraNatural, itemNaMao, itensParaAMao } from '../src/nucleo/sistemas/acoes.js';
import { plantaEm, estadoDaPlanta } from '../src/nucleo/sistemas/lavoura.js';
import { porAnimal } from '../src/nucleo/sistemas/animais.js';
import { bichoSolto } from '../src/nucleo/sistemas/acompanhar.js';
import { guiaDaMissao } from '../src/nucleo/guia.js';

const chao = (m, x, z) => m.local.chao[z * m.local.l + x];
const por = (m, x, z, c) => { m.local.chao[z * m.local.l + x] = c; };
const ids = (lista) => lista.map((o) => o.id);
const principal = (m, alvo) => acoesDoAlvo(m, alvo)[0] || null;
const agir = (m, c) => m.comando({ tipo: 'agirNoAlvo', ...c });
const fila = (m) => [m.personagem.tarefa, ...m.personagem.fila].filter(Boolean).map((t) => t.acao || t.tipo);

test('lavoura: sem campo nenhum a grama ara; depois, só a que encosta no campo (o campo cresce) e o resto só anda', () => {
  const m = novoMundo();
  assert.equal(m.modo.id, 'mao', 'o jogador não escolhe modo');
  let o = principal(m, { x: 12, z: 13 });
  assert.deepEqual([o.id, o.ok, o.modo], ['arar', true, 'enxada'], 'sem campo, a primeira casa arada começa um');
  assert.equal(agir(m, { x: 12, z: 13 }).ok, true);
  ateParar(m);
  assert.equal(chao(m, 12, 13), ARADA);
  assert.deepEqual(ids(acoesDoAlvo(m, { x: 13, z: 13 })), ['arar'], 'a grama encostada no campo ara');
  assert.deepEqual(acoesDoAlvo(m, { x: 17, z: 16 }), [], 'a grama longe do campo: o toque só anda');
  const p = m.personagem;
  assert.equal(agir(m, { x: 17, z: 16 }).ok, true); ateParar(m);
  assert.ok(Math.hypot(p.x - 17.5, p.z - 16.5) < 0.6, 'andou até lá');
  assert.equal(chao(m, 17, 16), GRAMA);
  // o campo sem sulco (colhido) ara de novo
  por(m, 14, 14, CAMPO);
  assert.deepEqual([principal(m, { x: 14, z: 14 }).id, principal(m, { x: 14, z: 14 }).modo], ['arar', 'enxada']);
  // terra dos outros
  assert.deepEqual(acoesDoAlvo(m, { x: 1, z: 1 }).map((x) => [x.id, x.ok, x.texto]), [['info', false, 'terra-a-venda']]);
});

test('lavoura: terra arada planta o que está na mão; sem semente, a falta; a planta com sede rega; a pronta colhe', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  por(m, 12, 13, ARADA); por(m, 13, 13, ARADA);
  assert.equal(itemNaMao(m), 'semente-rabanete', 'sem escolha, a primeira semente que houver');
  let o = principal(m, { x: 12, z: 13 });
  assert.deepEqual([o.id, o.item, o.modo], ['semear', 'semente-rabanete', 'semear']);
  agir(m, { x: 12, z: 13 }); ateParar(m);
  assert.equal(principal(m, { entidade: 'poco' }).id, 'encher'); // o regador velho vem vazio: ela busca e enche no poço
  agir(m, { entidade: 'poco' }); ateParar(m);
  assert.equal(plantaEm(m, 12, 13).cultura, 'rabanete');
  assert.equal(m.modo.semente, 'semente-rabanete', 'a semente usada fica na mão');
  // a planta com sede: regar (o regador está no suporte: ela busca sozinha)
  o = principal(m, { x: 12, z: 13 });
  assert.deepEqual([o.id, o.modo], ['regar', 'regar']);
  agir(m, { x: 12, z: 13 }); ateParar(m);
  assert.equal(estadoDaPlanta(m, plantaEm(m, 12, 13)), 'crescendo');
  o = principal(m, { x: 12, z: 13 });
  assert.deepEqual([o.id, o.ok, o.info, o.texto], ['info', false, true, 'crescendo'], 'crescendo: só informa');
  ev.limpar();
  assert.equal(agir(m, { x: 12, z: 13 }).ok, false);
  assert.equal(ev.de('informou')[0].motivo, 'crescendo');
  assert.equal(fila(m).length, 0, 'o toque na planta crescendo não anda nem desmancha a fila');
  pular(m, 61);
  o = principal(m, { x: 12, z: 13 });
  assert.deepEqual([o.id, o.modo, o.arrasta], ['colher', 'mao', undefined], 'colher não se repete arrastando (segurar colhe a fileira: o modo "mão")');
  agir(m, { x: 12, z: 13 }); ateParar(m);
  assert.equal(m.posses.cesto.itens.rabanete, 2);
  // as sementes acabaram: a terra arada diz que falta semente (a vaga vira "Comprar sementes")
  m.posses.bolsa['semente-rabanete'] = 0;
  assert.equal(itemNaMao(m), null);
  o = principal(m, { x: 13, z: 13 });
  assert.deepEqual([o.id, o.ok, o.falta, o.texto], ['info', false, true, 'sem-sementes-na-mao']);
  ev.limpar();
  assert.equal(agir(m, { x: 13, z: 13 }).ok, false);
  assert.equal(ev.de('faltou')[0].motivo, 'sem-sementes-na-mao');
});

test('a vaga "na mão": escolher, trocar com Q/E, gravar; a muda vale um plantio e só vai na grama', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m);
  m.progresso.nivel = 2;
  m.posses.bolsa['semente-milho'] = 4; m.posses.bolsa['muda-bananeira'] = 2;
  assert.deepEqual(itensParaAMao(m), ['semente-rabanete', 'semente-milho', 'muda-bananeira'], 'sementes antes, mudas depois');
  assert.equal(m.comando({ tipo: 'naMao', item: 'semente-milho' }).ok, true);
  assert.equal(itemNaMao(m), 'semente-milho');
  assert.equal(ev.de('naMaoMudou').at(-1).item, 'semente-milho');
  m.comando({ tipo: 'trocarNaMao', passo: 1 }); assert.equal(itemNaMao(m), 'muda-bananeira');
  m.comando({ tipo: 'trocarNaMao', passo: 1 }); assert.equal(itemNaMao(m), 'semente-rabanete', 'dá a volta');
  m.comando({ tipo: 'trocarNaMao', passo: -1 }); assert.equal(itemNaMao(m), 'muda-bananeira');
  assert.equal(m.comando({ tipo: 'naMao', item: 'enxada' }).ok, false, 'só o que se planta');
  // gravou com a escolha: abre com ela
  m.comando({ tipo: 'naMao', item: 'semente-milho' });
  const n = Mundo.carregar(m.dados, JSON.parse(JSON.stringify(m.salvar())));
  assert.equal(itemNaMao(n), 'semente-milho');
  // a muda: no campo não (é para a grama); na grama, planta e a mão volta para a semente de antes
  m.comando({ tipo: 'naMao', item: 'muda-bananeira' });
  por(m, 12, 13, ARADA);
  const o = principal(m, { x: 12, z: 13 });
  assert.deepEqual([o.id, o.info, o.texto], ['info', true, 'muda-na-grama']);
  assert.equal(principal(m, { x: 15, z: 15 }).id, 'plantarMuda');
  assert.equal(agir(m, { x: 15, z: 15 }).ok, true);
  assert.equal(itemNaMao(m), 'semente-milho', 'a muda é de uma vez: a mão volta para o milho');
  ateParar(m);
  assert.equal(m.arvores.todas.length, 1);
  assert.equal(principal(m, { x: 17, z: 17 }), null, 'com a semente na mão, a grama longe do campo só anda');
});

test('arrastar repete a ação da primeira casa (arar, plantar, regar) e nunca colhe por acidente', () => {
  const m = novoMundo();
  for (const x of [12, 13, 14, 15]) por(m, x, 13, ARADA);
  m.posses.bolsa['semente-rabanete'] = 10;
  // a primeira casa é de plantar: o arrasto planta nas outras aradas e pula a que já tem planta
  assert.equal(principal(m, { x: 12, z: 13 }).modo, 'semear');
  for (const x of [12, 13, 14]) agir(m, { x, z: 13, arrasto: true, modo: 'semear' });
  ateParar(m);
  assert.deepEqual([12, 13, 14, 15].map((x) => !!plantaEm(m, x, 13)), [true, true, true, false]);
  // tudo pronto, menos uma com sede: arrastar a partir da que tem sede só rega, não colhe as prontas
  agir(m, { x: 15, z: 13 }); ateParar(m);
  for (const x of [12, 13, 14]) { const pl = plantaEm(m, x, 13); pl.feitas = 1; pl.secaEm = 0; }
  assert.equal(principal(m, { x: 15, z: 13 }).modo, 'regar');
  for (const x of [15, 14, 13, 12]) agir(m, { x, z: 13, arrasto: true, modo: 'regar' });
  assert.deepEqual(fila(m).filter((a) => a !== 'pegarFerramenta'), ['regar'], 'só a que tinha sede');
  ateParar(m);
  assert.equal([12, 13, 14].filter((x) => plantaEm(m, x, 13)).length, 3, 'as prontas continuam no pé');
  // começar o arrasto numa casa pronta não pinta (colher não tem "arrasta"): a interface vira alavanca ou câmera
  assert.equal(principal(m, { x: 12, z: 13 }).arrasta, undefined);
  assert.equal(agir(m, { x: 12, z: 13, arrasto: true }).ok, false);
  assert.equal(m.personagem.fila.length, 0);
  // segurar na planta pronta colhe a fileira toda (as prontas dela)
  const cesto = m.posses.cesto.itens.rabanete || 0;
  assert.equal(agir(m, { x: 12, z: 13, fileira: true }).ok, true);
  ateParar(m);
  assert.equal([12, 13, 14].filter((x) => plantaEm(m, x, 13)).length, 0, 'segurar colheu a fileira');
  assert.ok((m.posses.cesto.itens.rabanete || 0) > cesto);
});

test('o arrasto só começa no campo e nas plantas; da grama encostada no campo, o toque ara mas o arrasto anda', () => {
  const m = novoMundo();
  por(m, 12, 13, CAMPO); por(m, 13, 13, ARADA);
  const campo = principal(m, { x: 12, z: 13 }), arada = principal(m, { x: 13, z: 13 }), grama = principal(m, { x: 11, z: 13 });
  assert.deepEqual([campo.id, campo.arrasta], ['arar', true]);
  assert.deepEqual([arada.id, arada.arrasta], ['semear', true]);
  assert.deepEqual([grama.id, grama.modo, !!grama.arrasta], ['arar', 'enxada', false], 'a grama ara no toque, mas arrastar dela anda');
  agir(m, { x: 13, z: 13 }); ateParar(m);
  const pl = plantaEm(m, 13, 13); pl.secaEm = 0;
  assert.equal(principal(m, { x: 13, z: 13 }).arrasta, true, 'a planta com sede: arrastar rega');
});

test('segurar o botão de agir: a fileira fica com a ação de quando apertou (a primeira casa já entrou na fila)', () => {
  const m = novoMundo();
  for (const x of [12, 13, 14, 15]) por(m, x, 14, CAMPO);
  const f = fileiraNatural(m, 12, 14);
  assert.equal(f.modo, 'enxada');
  // o botão age na hora: a primeira casa vai para a fila de arar, e a ação natural dela vira "plantar"
  agir(m, { x: 12, z: 14 });
  assert.equal(principal(m, { x: 12, z: 14 }).modo, 'semear');
  // soltando, a fileira ainda é de arar (o modo de quando apertou)
  assert.equal(fileiraNatural(m, 12, 14, f.modo).modo, 'enxada');
  assert.equal(agir(m, { x: 12, z: 14, fileira: true, modo: f.modo }).ok, true);
  ateParar(m);
  assert.deepEqual([12, 13, 14, 15].map((x) => chao(m, x, 14)), [ARADA, ARADA, ARADA, ARADA]);
  assert.equal(m.local.plantas[14 * m.local.l + 12], null, 'e nada foi plantado');
});

test('segurar o dedo: a fileira toda com a ação da casa; com o boi, o toque e o segurar aram com ele', () => {
  const m = mundoDoTrabalho();
  for (const x of [12, 13, 14, 15, 16]) por(m, x, 14, CAMPO);
  const f = fileiraNatural(m, 12, 14);
  assert.deepEqual([f.modo, f.n], ['enxada', 5]);
  assert.equal(agir(m, { x: 12, z: 14, fileira: true }).ok, true);
  ateParar(m);
  assert.deepEqual([12, 13, 14, 15, 16].map((x) => chao(m, x, 14)), [ARADA, ARADA, ARADA, ARADA, ARADA]);
  // a fileira arada: segurar planta todas (3 sementes: as que há)
  assert.deepEqual([fileiraNatural(m, 12, 14).modo, fileiraNatural(m, 12, 14).n], ['semear', 3]);
  // com o boi pronto (e o arado), o campo sem sulco ara com ele: a fileira numa passada
  comBicho(m, 'boi', 'arado');
  for (const x of [12, 13, 14, 15, 16]) por(m, x, 16, CAMPO);
  const o = principal(m, { x: 12, z: 16 });
  assert.deepEqual([o.id, o.modo, o.casas.length], ['ararComBoi', 'arado', 5]);
  const ev = ouvirTudo(m);
  assert.equal(agir(m, { x: 12, z: 16 }).ok, true);
  ateParar(m, 200);
  assert.equal(ev.de('arou').length, 5);
  assert.ok(ev.de('arou').every((d) => d.com === 'boi'));
  // o boi fica um tempo com ela à espera da próxima e depois volta sozinho para o estábulo
  const boi = m.animais.lista.find((a) => a.especie === 'boi');
  assert.ok(bichoSolto(m, boi.id), 'ainda no terreiro');
  passos(m, 45);
  assert.equal(bichoSolto(m, boi.id), null, 'voltou');
});

test('obstáculos: mato, toco e pedra limpam com a ferramenta de cada um; sem ela, a falta', () => {
  const m = mundoDasTerras();
  const mato = porObstaculo(m, 'mato', 14, 14), toco = porObstaculo(m, 'toco', 15, 15), pedra = porObstaculo(m, 'pedra', 16, 16);
  assert.deepEqual([principal(m, { entidade: mato.id }).ok, principal(m, { entidade: mato.id }).texto], [false, 'sem-ferramenta-de-limpar']);
  darFerramenta(m, 'foice'); darFerramenta(m, 'machado'); darFerramenta(m, 'picareta');
  assert.deepEqual(ids(acoesDoAlvo(m, { entidade: mato.id })), ['rocar']);
  assert.deepEqual(ids(acoesDoAlvo(m, { x: 15, z: 15 })), ['cortar'], 'a casa do toco vale o toco');
  assert.deepEqual(ids(acoesDoAlvo(m, { entidade: pedra.id })), ['quebrar']);
  assert.equal(agir(m, { entidade: mato.id }).ok, true);
  ateParar(m);
  assert.equal(m.local.porId[mato.id], undefined, 'roçou');
  assert.ok(m.local.porId[toco.id]);
  // arrastar nunca limpa por acidente
  assert.equal(agir(m, { x: 15, z: 15, arrasto: true, modo: 'enxada' }).ok, false);
  assert.equal(m.personagem.fila.length, 0);
});

test('bicho no abrigo: o que ele mais precisa é a principal; a roda tem recolher, ração, água e abrir', () => {
  const m = mundoDosAnimais(), c = porAbrigo(m, 'curral');
  darAnimais(m, { racao: 10 });
  assert.deepEqual(ids(acoesDoAlvo(m, { entidade: c.id })), ['abrir'], 'o abrigo vazio só abre (para comprar o bicho): sem trato, sem roda');
  m.posses.bolsa.racao = 0; m.posses.celeiro.itens.racao = 0;
  porAnimal(m, 'vaca');
  // sem comida nem água e sem ração no celeiro: dar água (o regador está no suporte) e abrir (o painel explica o resto)
  assert.deepEqual(ids(acoesDoAlvo(m, { entidade: c.id })), ['abastecerBebedouro', 'abrir']);
  const ev = ouvirTudo(m);
  assert.equal(agir(m, { entidade: c.id, opcao: 'abrir' }).dados.painel, 'abrigo');
  assert.equal(ev.de('pediuPainel')[0].painel, 'abrigo');
  // com ração: dar ração é a principal (a vaca está com fome); a água pede o regador (no suporte): dá
  darAnimais(m, { racao: 10 });
  assert.deepEqual(ids(acoesDoAlvo(m, { entidade: c.id })), ['abastecerCocho', 'abastecerBebedouro', 'abrir']);
  assert.equal(principal(m, { entidade: c.id }).item, 'racao', 'a vaga mostra a ração');
  // a opção da roda: dar água primeiro
  assert.equal(agir(m, { entidade: c.id, opcao: 'abastecerBebedouro' }).ok, true);
  assert.ok(fila(m).includes('abastecerBebedouro'));
  ateParar(m);
  agir(m, { entidade: c.id }); ateParar(m);
  // tratada, deu leite: ordenhar é a principal (com o balde)
  fartura(m, c); pular(m, 301);
  assert.equal(principal(m, { entidade: c.id }).id, 'abrir', 'sem o balde não ordenha: o painel diz o que falta');
  darAnimais(m, { balde: 1 });
  assert.deepEqual(ids(acoesDoAlvo(m, { entidade: c.id })), ['ordenhar', 'abrir']);
  assert.equal(agir(m, { entidade: c.id }).ok, true);
  ateParar(m);
  assert.ok(ev.de('recolheu').some((d) => d.item === 'leite'));
});

test('bicho de estimação: afagar; bicho de trabalho não responde ao toque', () => {
  const m = mundoDoTrabalho();
  const r = m.comando({ tipo: 'comprarAnimal', animal: 'gato' }); m.passo();
  const g = bichoSolto(m, r.dados.id);
  assert.deepEqual(ids(acoesDoAlvo(m, { entidade: g.id })), ['afagar']);
  assert.equal(agir(m, { entidade: g.id }).ok, true);
  const boi = comBicho(m, 'boi', 'arado');
  m.comando({ tipo: 'agirNoAlvo', x: 12, z: 13 }); // a passada põe o boi no terreiro
  passos(m, 1);
  const eb = bichoSolto(m, boi.id);
  assert.ok(eb);
  assert.deepEqual(acoesDoAlvo(m, { entidade: eb.id }), []);
});

test('árvore com fruta: colher (uma ação só: podar ainda não existe); crescendo, só informa', () => {
  const m = mundoDasTerras();
  m.posses.bolsa['muda-bananeira'] = 1;
  m.comando({ tipo: 'naMao', item: 'muda-bananeira' });
  agir(m, { x: 15, z: 15 }); ateParar(m);
  const e = m.arvores.todas[0];
  let o = acoesDoAlvo(m, { entidade: e.id });
  assert.deepEqual([o.length, o[0].id, o[0].info, o[0].texto], [1, 'info', true, 'arvore-crescendo']);
  pular(m, 151); m.avancar(1);
  o = acoesDoAlvo(m, { entidade: e.id });
  assert.deepEqual(ids(o), ['colherFruta']);
  assert.equal(agir(m, { entidade: e.id }).ok, true);
  ateParar(m);
  assert.equal(m.posses.cesto.itens.banana, 3);
});

test('construções: a obra e o abrigo abrem o painel; a indústria com produto pronto retira, e abre ao lado', () => {
  const m = mundoDaIndustria(), ev = ouvirTudo(m);
  const b = porIndustria(m, 'bancada-de-carpintaria');
  assert.deepEqual(acoesDoAlvo(m, { entidade: b.id }).map((o) => [o.id, o.painel]), [['abrir', 'industria']]);
  darIndustria(m, { madeira: 4 });
  produzir(m, b, 'tabua'); m.avancar(21);
  assert.deepEqual(ids(acoesDoAlvo(m, { entidade: b.id })), ['retirarProduto', 'abrir']);
  assert.equal(agir(m, { entidade: b.id, opcao: 'abrir' }).dados.painel, 'industria');
  assert.equal(agir(m, { entidade: b.id }).ok, true);
  ateParar(m);
  assert.equal(ev.de('retirouProduto').length, 1);
  // a obra: abre o painel da construção
  const g = porConstrucao(m, 'galinheiro', 6, 12, { obraSeg: 60 });
  assert.deepEqual(acoesDoAlvo(m, { entidade: g.id }).map((o) => [o.id, o.painel]), [['abrir', 'construcao']]);
  // o poço enche o regador
  assert.equal(principal(m, { entidade: 'poco' }).id, 'encher');
});

test('teclado e controle: agir na casa ou entidade à frente dela; sem nada, "nada-aqui"', () => {
  const m = novoMundo(), p = m.personagem, ev = ouvirTudo(m);
  p.x = 12.5; p.z = 12.5; p.rumo = 0; // olhando para +Z: a casa à frente é (12, 13)
  assert.equal(agir(m, { frente: true }).ok, true);
  ateParar(m);
  assert.equal(chao(m, 12, 13), ARADA, 'sem campo, a grama da frente ara');
  p.x = 17.5; p.z = 16.5; p.rumo = 0;
  assert.equal(agir(m, { frente: true }).ok, false);
  assert.equal(ev.de('faltou').at(-1).motivo, 'nada-aqui');
  assert.ok(Math.hypot(p.x - 17.5, p.z - 16.5) < 0.01, 'de frente, não anda');
});

test('o guia nunca pede modo: aponta a casa, a entidade, a loja ou a vaga', () => {
  const m = novoMundo(), g = {};
  for (let k = 0; k < 40; k++) {
    guiaDaMissao(m, g);
    assert.notEqual(g.tipo, 'modo');
    if (g.tipo === 'casa') agir(m, { x: g.x, z: g.z });
    else if (g.tipo === 'entidade') agir(m, { entidade: g.id });
    else if (g.tipo === 'semente') m.comando({ tipo: 'naMao', item: g.item });
    else if (g.tipo === 'painel') m.comando({ tipo: 'comprar', item: g.item || 'semente-rabanete', n: 1 });
    else if (g.tipo === 'esperar') pular(m, g.seg + 1);
    else break;
    ateParar(m);
  }
});
