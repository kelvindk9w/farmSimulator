// Animais de trabalho: o boi ara cinco casas por passada, o cavalo leva a personagem sem gastar fôlego, o jumento
// puxa a carroça (o cesto esvazia nela) e leva o barril (o regador se enche no meio do campo).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ateParar, ouvirTudo, tocar, tocarEm, modo, pular, arar, semear, plantarAtePronta, colher, dadosDeTeste } from './apoio.mjs';
import { comTrabalho, mundoDoTrabalho, comBicho, porEstabulo, dar, ate, passos, ESTABULO } from './apoio-trabalho.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { EVENTOS, MODOS } from '../src/nucleo/registro.js';
import { GRAMA, ARADA } from '../src/nucleo/local.js';
import { guiaDoEvento } from '../src/nucleo/guia.js';
import { descreverCasa, visualDaPersonagem } from '../src/nucleo/sistemas/personagem.js';
import { plantaEm, estadoDaPlanta, fileiraDe } from '../src/nucleo/sistemas/lavoura.js';
import { ofertasDaLoja } from '../src/nucleo/sistemas/loja.js';
import { podeComprarAnimal, porAnimal } from '../src/nucleo/sistemas/animais.js';
import { bichoSolto } from '../src/nucleo/sistemas/acompanhar.js';
import { estadoDoTrabalho, casasPorPassada, naCarroca, capacidadeDaCarroca, capacidadeDoBarril } from '../src/nucleo/sistemas/trabalho.js';

const novo = (mais) => mundoDoTrabalho((b) => { comTrabalho(b); if (mais) mais(b); });
const copia = (o) => JSON.parse(JSON.stringify(o));
const recarregar = (m) => Mundo.carregar(m.dados, copia(m.salvar()));
const chao = (m, x, z) => m.locais.fazenda.chao[z * m.locais.fazenda.l + x];
const semTrato = (a) => { a.tratado = false; return a; };
const bichoDo = (m) => m.animais.lista.find((a) => a.especie === 'boi');

// ---------------------------------------------------------------------------------------------------------------
test('o apetrecho não trava a compra do bicho: trava o uso, e a loja vende arado, sela, carroça e barril', () => {
  const m = mundoDoTrabalho();
  porEstabulo(m);
  m.posses.ouro += 1000;
  assert.equal(podeComprarAnimal(m, 'boi').ok, true);
  const ev = ouvirTudo(m);
  assert.equal(m.comando({ tipo: 'comprarAnimal', animal: 'boi' }).ok, true);
  assert.deepEqual(ev.de('faltaApetrecho').map((d) => [d.animal, d.item]), [['boi', 'arado']]);
  // sem arado: o modo "Arado" não aparece
  assert.equal(MODOS.arado.disponivel(m), false);
  assert.equal(estadoDoTrabalho(m).boi.falta, 'arado');
  // o cavalo sem sela: comprar pode; "ir a cavalo" diz o que falta
  m.comando({ tipo: 'comprarAnimal', animal: 'cavalo' });
  const r = m.comando({ tipo: 'irACavalo', ligado: true });
  assert.equal(r.ok, false); assert.equal(r.motivo, 'falta-apetrecho'); assert.deepEqual(r.dados, { animal: 'cavalo', item: 'sela' });
  assert.equal(m.comando({ tipo: 'levarJumento' }).motivo, 'sem-jumento');
  // a loja vende os quatro
  const vende = ofertasDaLoja(m).flatMap((a) => a.ofertas.map((o) => o.item));
  for (const id of ['arado', 'sela', 'carroca', 'barril-de-agua']) assert.ok(vende.includes(id), id);
  assert.equal(m.comando({ tipo: 'comprar', item: 'arado' }).ok, true);
  assert.equal(m.posses.ferramentas.arado.onde, 'suporte'); // o arado nunca ocupa vaga no cinto
  assert.equal(MODOS.arado.disponivel(m), true);
  // as missões de comprar o barril e o jumento existem para este jogo
  assert.equal(EVENTOS.comprou.aceita(m.dados, { item: 'barril-de-agua' }), true);
  assert.equal(EVENTOS.comprou.aceita(m.dados, { animal: 'jumento' }), true);
});

// ---------------------------------------------------------------------------------------------------------------
test('o boi ara cinco casas em linha numa passada, com o mesmo chão da enxada e "arou" com o boi', () => {
  const m = mundoDoTrabalho(), ev = ouvirTudo(m);
  const boi = comBicho(m, 'boi', 'arado');
  modo(m, 'arado');
  // antes do toque, a dica já mostra as cinco casas que vão ser aradas
  const d = descreverCasa(m, 12, 12);
  assert.equal(d.acao, 'ararComBoi');
  assert.deepEqual(d.casas, [[12, 12], [13, 12], [14, 12], [15, 12], [16, 12]]);
  // o boi sai do estábulo assim que o modo é escolhido
  passos(m, 0.5);
  assert.ok(bichoSolto(m, boi.id), 'o boi saiu');
  assert.equal(tocar(m, 12, 12).ok, true);
  const t0 = m.n;
  ateParar(m);
  const arou = ev.de('arou');
  assert.deepEqual(arou.map((a) => [a.x, a.z, a.com]), [[12, 12, 'boi'], [13, 12, 'boi'], [14, 12, 'boi'], [15, 12, 'boi'], [16, 12, 'boi']]);
  for (let x = 12; x <= 16; x++) assert.equal(chao(m, x, 12), ARADA);
  // uma passada só: a ida até lá e os 2,5 s da passada
  const comecou = ev.lista.findIndex((e) => e.tipo === 'comecouAcao');
  assert.equal(ev.lista[comecou].dados.acao, 'ararComBoi');
  assert.ok(Math.abs(ev.lista[comecou].dados.dur - 2.5) < 0.01);
  assert.ok((m.n - t0) / 60 < 6);
  // missão "boi-de-arado" e conquista "junta-de-boi" filtram pelo boi
  assert.equal(EVENTOS.arou.aceita(m.dados, { com: 'boi' }), true);
  assert.equal(EVENTOS.arou.aceita(m.dados, {}), true);
  // a enxada continua arando sem "com"
  modo(m, 'enxada'); tocar(m, 12, 15); ateParar(m);
  assert.equal(ev.de('arou').pop().com, undefined);
});

test('o toque na grama: o eixo com mais casas para arar, a janela cresce para o lado mais comprido; o que não se ara fica de fora; o dedo escolhe a direção dele', () => {
  const m = mundoDoTrabalho(), ev = ouvirTudo(m);
  comBicho(m, 'boi', 'arado');
  // uma planta em (14, 14)
  arar(m, [[14, 14]]); semear(m, [[14, 14]]);
  modo(m, 'arado');
  // em (14, 12): para +Z a grama acaba na planta (z = 13 só), para -Z o caminho (z = 9) corta: 3 casas em Z; em X, 5
  let d = descreverCasa(m, 14, 12);
  assert.deepEqual(d.casas, [[14, 12], [15, 12], [16, 12], [17, 12], [18, 12]]);
  // em (14, 13), colada na planta: em X são 5; em Z, para -Z até o caminho (z = 10..13): 4 → X, para o lado mais comprido
  d = descreverCasa(m, 14, 13);
  assert.equal(d.casas.length, 5);
  assert.ok(d.casas.every(([, z]) => z === 13));
  // perto da cerca da terra própria (x = 19 é a última casa): para +X só 1, para -X 4: a janela vai para -X
  d = descreverCasa(m, 18, 16);
  assert.deepEqual(d.casas.map(([x]) => x).sort((a, b) => a - b), [14, 15, 16, 17, 18]);
  // a fileira pelo caminho (z = 9 é caminho): as casas do caminho ficam de fora
  const c = descreverCasa(m, 15, 7);
  assert.ok(c.casas.every(([x, z]) => z !== 9), 'nada do caminho');
  // com o dedo: arrastando de (12, 14) para (13, 14), a fileira é +X (e pula a planta)
  m.comando({ tipo: 'tocarCasa', x: 12.5, z: 14.5, arrasto: true });
  m.comando({ tipo: 'tocarCasa', x: 13.5, z: 14.5, arrasto: true });
  const t = m.personagem.fila.find((q) => q.acao === 'ararComBoi' && q.x === 12);
  assert.deepEqual(t.args.casas, [[12, 14], [13, 14], [15, 14], [16, 14]]);
  ateParar(m);
  assert.equal(ev.de('faltou').length, 0);
  assert.ok(plantaEm(m, 14, 14), 'a planta ficou');
  for (const [x, z] of [[12, 14], [13, 14], [15, 14], [16, 14]]) assert.equal(chao(m, x, z), ARADA);
  // a casa já arada responde como a enxada
  assert.equal(descreverCasa(m, 12, 14).texto, 'ja-arado');
});

test('segurar o dedo numa casa do campo: o boi ara a fileira no eixo com mais casas, até o limite do arado (6 no simples, 10 no de ferro)', () => {
  const m = novo((b) => {
    b.itens.arado.fileira = 6;
    b.itens['arado-de-ferro'] = { nome: 'Arado de ferro', tipo: 'ferramenta', funcao: 'arado', degrau: 2, nivel: 1, compra: 40, fileira: 10 };
    b.loja.ouro.itens.push('arado-de-ferro');
  }), loc = m.locais.fazenda, ev = ouvirTudo(m);
  comBicho(m, 'boi', 'arado');
  modo(m, 'arado');
  assert.equal(casasPorPassada(m), 6);
  // o campo: uma fileira de 12 ao longo de X (z = 12, x 6..17) e uma coluna de 4 ao longo de Z (x = 11, z 14..17)
  const CAMPO = 6;
  for (let x = 6; x <= 17; x++) loc.chao[12 * loc.l + x] = CAMPO;
  for (let z = 14; z <= 17; z++) loc.chao[z * loc.l + 11] = CAMPO;
  // segurando em (8, 12): em X a fileira tem 12 casas; em Z, 1 (a coluna não encosta): X, 6 casas, para o lado mais comprido
  let f = fileiraDe(m, 8, 12);
  assert.equal(f.acao, 'ararComBoi'); assert.equal(f.n, 6);
  assert.deepEqual(f.casas, [[8, 12], [9, 12], [10, 12], [11, 12], [12, 12], [13, 12]]);
  assert.deepEqual(f.alvo.map(([x, z]) => [x, z]), f.casas, 'as seis entram na passada');
  // mostrar não mexe em nada
  assert.equal(m.personagem.fila.length, 0);
  // segurando em (11, 15), na coluna: em Z são 4 (o campo), em X 1: o boi vai ao longo de Z, só no campo
  f = fileiraDe(m, 11, 15);
  assert.deepEqual(f.casas, [[11, 14], [11, 15], [11, 16], [11, 17]]);
  // soltou: uma passada só, com as seis casas
  const r = m.comando({ tipo: 'fileira', x: 8.5, z: 12.5 });
  assert.equal(r.ok, true); assert.equal(r.dados.n, 6); assert.equal(r.dados.acao, 'ararComBoi');
  assert.equal(m.personagem.fila.filter((t) => t.acao === 'ararComBoi').length + (m.personagem.tarefa && m.personagem.tarefa.acao === 'ararComBoi' ? 1 : 0), 1);
  ateParar(m, 200);
  for (let x = 8; x <= 13; x++) assert.equal(chao(m, x, 12), ARADA, `(${x}, 12) arada`);
  for (const x of [6, 7, 14, 15, 16, 17]) assert.equal(chao(m, x, 12), CAMPO, `(${x}, 12) ficou para a próxima`);
  // a passada de 6 casas leva o mesmo por casa que a de 5 (2,5 s): 2,5 × 7 / 6
  const dur = ev.de('comecouAcao').find((d) => d.acao === 'ararComBoi').dur;
  assert.ok(Math.abs(dur - 2.5 * 7 / 6) < 0.01, `durou ${dur}`);
  // de novo na mesma casa: o resto da fileira (x 14..17 de um lado, 6..7 do outro): 6 casas, as que faltam
  f = fileiraDe(m, 13, 12);
  assert.deepEqual(f.alvo.map(([x]) => x).sort((a, b) => a - b), [14, 15, 16, 17]);
  // o arado de ferro: 10 casas; vale pelo simples (o boi não pede o simples de volta)
  m.posses.ouro += 100;
  assert.equal(m.comando({ tipo: 'comprar', item: 'arado-de-ferro' }).ok, true);
  assert.equal(casasPorPassada(m), 10);
  delete m.posses.ferramentas.arado;
  assert.equal(estadoDoTrabalho(m).boi.falta, null);
  assert.equal(MODOS.arado.disponivel(m), true);
  f = fileiraDe(m, 17, 12);
  assert.deepEqual(f.casas.map(([x]) => x), [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  assert.deepEqual(f.alvo.map(([x]) => x), [14, 15, 16, 17]);
  // sem trato, no máximo 3
  bichoDo(m).tratado = false;
  assert.equal(casasPorPassada(m), 3);
  // segurar na grama também vale no Arado (o campo cresce); fora da terra própria, não
  assert.equal(fileiraDe(m, 12, 17).n, 3);
  assert.equal(fileiraDe(m, 21, 12), null);
});

test('sem trato o boi ara três casas; trinta casas em passadas de cinco', () => {
  const m = mundoDoTrabalho(), ev = ouvirTudo(m);
  const boi = comBicho(m, 'boi', 'arado');
  modo(m, 'arado');
  semTrato(boi);
  assert.equal(casasPorPassada(m), 3);
  assert.equal(descreverCasa(m, 12, 12).casas.length, 3);
  tocar(m, 12, 12); ateParar(m);
  assert.equal(ev.de('arou').length, 3);
  boi.tratado = true;
  ev.limpar();
  // seis fileiras de cinco (x de 12 a 16, z de 13 a 18): um toque por fileira
  for (let z = 13; z <= 18; z++) tocar(m, 12, z);
  assert.equal(m.personagem.fila.length, 6);
  ateParar(m, 200);
  assert.equal(ev.de('arou').filter((a) => a.com === 'boi').length, 30);
});

test('o boi volta sozinho para o estábulo quando o modo muda', () => {
  const m = mundoDoTrabalho();
  const boi = comBicho(m, 'boi', 'arado');
  modo(m, 'arado'); passos(m, 1);
  assert.ok(bichoSolto(m, boi.id));
  modo(m, 'mao');
  ate(m, () => !bichoSolto(m, boi.id), 30);
  // e fora do modo ele não sai
  passos(m, 2);
  assert.equal(bichoSolto(m, boi.id), null);
});

test('o guia da missão do boi: comprar o boi, o arado, escolher o modo e tocar na grama', () => {
  const m = mundoDoTrabalho();
  porEstabulo(m);
  const out = {};
  guiaDoEvento(m, 'arou', { com: 'boi' }, out);
  assert.equal(out.tipo, 'entidade'); // o estábulo (o painel do abrigo vende o boi)
  porAnimal(m, 'boi', { quieto: true });
  guiaDoEvento(m, 'arou', { com: 'boi' }, out);
  assert.equal(out.tipo, 'painel'); assert.equal(out.item, 'arado');
  dar(m, { arado: 1 });
  guiaDoEvento(m, 'arou', { com: 'boi' }, out);
  assert.deepEqual([out.tipo, out.modo], ['modo', 'arado']);
  modo(m, 'arado');
  guiaDoEvento(m, 'arou', { com: 'boi' }, out);
  assert.equal(out.tipo, 'casa');
  assert.equal(chao(m, out.x, out.z), GRAMA);
});

// ---------------------------------------------------------------------------------------------------------------
// a viagem de (5.5, 18.5) a (18.5, 18.5): 13 casas em linha reta, sem nada no meio
function viajar(m) {
  const p = m.personagem;
  p.x = 5.5; p.z = 18.5;
  passos(m, 3); // o cavalo chega perto dela
  const fol = p.folego, out = {}, figuras = new Set();
  let vmax = 0;
  m.comando({ tipo: 'irPara', x: 18.5, z: 18.5 });
  const t0 = m.n;
  while ((p.rota || p.fila.length) && m.n - t0 < 1200) { m.passo(); vmax = Math.max(vmax, p.vel); figuras.add(visualDaPersonagem(m, out).estado); }
  return { seg: (m.n - t0) / 60, vmax, gasto: fol - p.folego, figuras };
}

test('a cavalo: a viagem longa é montada, mais rápida, sem gastar fôlego; chegou, apeia e o cavalo fica ao lado', () => {
  const m = mundoDoTrabalho(), ev = ouvirTudo(m);
  const cav = comBicho(m, 'cavalo', 'sela');
  // a pé, correndo: gasta fôlego
  const ape = viajar(mundoDoTrabalho());
  assert.ok(ape.gasto > 0);
  assert.equal(m.comando({ tipo: 'irACavalo', ligado: true }).ok, true);
  const r = viajar(m);
  assert.equal(r.gasto, 0, 'não gastou fôlego');
  assert.ok(Math.abs(r.vmax - 7) < 0.01, 'galopou a 7 casas/s');
  assert.ok(r.seg < ape.seg, `mais rápido (${r.seg} s contra ${ape.seg} s)`);
  assert.ok(r.figuras.has('montada-galope'));
  assert.equal(m.trabalho.montada, false);
  const c = ev.de('cavalgou');
  assert.equal(c.length, 1);
  assert.ok(c[0].n >= 6 && c[0].n <= 13, 'casas a cavalo: ' + c[0].n);
  const e = bichoSolto(m, cav.id);
  assert.ok(e && Math.hypot(e.x + 0.5 - m.personagem.x, e.z + 0.5 - m.personagem.z) < 1.5, 'o cavalo ficou ao lado');
  assert.equal(EVENTOS.cavalgou.aceita(m.dados, { n: 1 }), true);
  // viagem curta: a pé mesmo
  ev.limpar();
  m.comando({ tipo: 'irPara', x: 16.5, z: 18.5 }); ateParar(m);
  assert.equal(ev.de('cavalgou').length, 0);
});

test('a cavalo sem trato: no passo dela correndo, ainda sem fôlego; o mangalarga faz o mesmo com a figura do cavalo', () => {
  const m = mundoDoTrabalho();
  semTrato(comBicho(m, 'cavalo', 'sela'));
  m.comando({ tipo: 'irACavalo', ligado: true });
  const r = viajar(m);
  assert.equal(r.gasto, 0);
  assert.ok(Math.abs(r.vmax - m.dados.regras.correr) < 0.01);
  // o mangalarga (chegou pelo cash)
  const n = mundoDoTrabalho();
  const g = comBicho(n, 'cavalo-mangalarga', 'sela');
  n.comando({ tipo: 'irACavalo', ligado: true });
  passos(n, 1);
  assert.equal(bichoSolto(n, g.id).figura, 'cavalo');
  const s = viajar(n);
  assert.equal(s.gasto, 0); assert.ok(Math.abs(s.vmax - 7) < 0.01);
});

test('a cavalo pelas teclas: monta depois de umas casas seguidas e apeia ao parar; no celeiro não se monta', () => {
  const m = mundoDoTrabalho(), ev = ouvirTudo(m);
  comBicho(m, 'cavalo', 'sela');
  m.comando({ tipo: 'irACavalo', ligado: true });
  const p = m.personagem;
  p.x = 5.5; p.z = 18.5; passos(m, 3);
  m.comando({ tipo: 'rumar', dx: 1, dz: 0 });
  ate(m, () => m.trabalho.montada, 8);
  m.comando({ tipo: 'frear' });
  ate(m, () => !m.trabalho.montada, 2);
  assert.equal(ev.de('cavalgou').length, 1);
  // dentro do celeiro: nada de cavalo
  m.trabalho.viagem = false;
  p.local = 'celeiro';
  m.passo();
  assert.equal(m.trabalho.montada, false);
  assert.equal(m.trabalho.viagem, false);
});

// ---------------------------------------------------------------------------------------------------------------
// colhe rabanete (rende 2) de "casas" com o jumento junto
function colheita(m, casas) {
  dar(m, { 'semente-rabanete': 40 });
  plantarAtePronta(m, casas);
  colher(m, casas);
}
const CAMPO8 = [[12, 12], [13, 12], [14, 12], [15, 12], [12, 13], [13, 13], [14, 13], [15, 13]];

test('o jumento leva a carroça: o cesto cheio passa para ela; a banca vende tudo junto', () => {
  const m = mundoDoTrabalho(), ev = ouvirTudo(m);
  const jum = comBicho(m, 'jumento', 'carroca');
  assert.equal(m.comando({ tipo: 'levarJumento', ligado: true }).ok, true);
  passos(m, 1);
  assert.ok(bichoSolto(m, jum.id), 'o jumento saiu do estábulo');
  colheita(m, CAMPO8); // 16 rabanetes: o cesto (6) enche duas vezes e passa para a carroça
  assert.ok(ev.de('carregouCarroca').length >= 1);
  assert.equal(naCarroca(m) + m.posses.cesto.itens.rabanete, 16);
  assert.equal(naCarroca(m), 10);
  const ouro = m.posses.ouro;
  tocarEm(m, 'banca'); ateParar(m);
  assert.equal(naCarroca(m), 0); assert.equal(m.posses.cesto.itens.rabanete, undefined);
  assert.equal(m.posses.ouro - ouro, 16 * m.dados.itens.rabanete.venda);
  // desligou: volta para o estábulo
  m.comando({ tipo: 'levarJumento', ligado: false });
  ate(m, () => !bichoSolto(m, jum.id), 40);
});

test('a carroça descarrega no celeiro; sem trato leva a metade; longe do jumento o cesto não passa', () => {
  const m = mundoDoTrabalho((b) => { b.regras.celeiro.capacidade = 50; });
  const jum = comBicho(m, 'jumento', 'carroca');
  m.comando({ tipo: 'levarJumento', ligado: true });
  semTrato(jum);
  assert.equal(capacidadeDaCarroca(m), 5);
  colheita(m, CAMPO8);
  assert.equal(naCarroca(m), 5);
  const tinha = m.posses.cesto.itens.rabanete;
  tocarEm(m, 'celeiro'); ateParar(m);
  assert.equal(naCarroca(m), 0);
  assert.equal(m.posses.celeiro.itens.rabanete, tinha + 5);
  // jumento longe (desligado): o cesto enche e fica cheio
  jum.tratado = true;
  m.comando({ tipo: 'levarJumento', ligado: false });
  const n = mundoDoTrabalho();
  comBicho(n, 'jumento', 'carroca');
  colheita(n, CAMPO8);
  assert.equal(naCarroca(n), 0);
});

test('o barril: enche no poço com o jumento junto e o regador se enche nele, no meio do campo', () => {
  const m = mundoDoTrabalho(), ev = ouvirTudo(m);
  comBicho(m, 'jumento', 'carroca');
  m.comando({ tipo: 'levarJumento', ligado: true });
  dar(m, { 'barril-de-agua': 1 });
  assert.equal(capacidadeDoBarril(m), 8);
  // um toque no poço: enche o regador e, na mesma ida, o barril
  tocarEm(m, 'poco'); ateParar(m);
  assert.equal(m.trabalho.barril, 8);
  assert.deepEqual(ev.de('encheuBarril').map((d) => d.n), [8]);
  // com o regador cheio, o toque no poço ainda enche o barril
  m.trabalho.barril = 2;
  assert.equal(descreverCasa(m, 15, 5).acao, 'encherBarril');
  tocarEm(m, 'poco'); ateParar(m);
  assert.equal(m.trabalho.barril, 8);
  // um campo de 16 casas, com o regador vazio: rega tudo sem ir ao poço
  const campo = [];
  for (let x = 12; x < 16; x++) for (let z = 14; z < 18; z++) campo.push([x, z]);
  dar(m, { 'semente-rabanete': 20 });
  arar(m, campo); semear(m, campo);
  m.posses.ferramentas.regador.agua = 0;
  ev.limpar();
  modo(m, 'regar');
  for (const [x, z] of campo.slice(0, 8)) assert.equal(tocar(m, x, z).ok, true);
  ateParar(m);
  assert.equal(ev.de('regou').length, 8);
  assert.equal(ev.de('comecouAcao').filter((d) => d.acao === 'encher').length, 0, 'nunca foi ao poço');
  assert.ok(ev.de('encheu').length >= 2 && ev.de('encheu').every((d) => d.doBarril));
  assert.equal(m.trabalho.barril, 8 - (ev.de('encheu').reduce((s, d) => s + d.n, 0)));
  // sem o jumento junto, o barril não serve: volta a regra do poço
  m.comando({ tipo: 'levarJumento', ligado: false });
  m.posses.ferramentas.regador.agua = 0;
  assert.equal(descreverCasa(m, 15, 17).texto, 'regador-vazio');
});

// ---------------------------------------------------------------------------------------------------------------
test('gravar e abrir: botões, carroça e barril voltam; a viagem e o bicho solto, não', () => {
  const m = mundoDoTrabalho();
  comBicho(m, 'jumento', 'carroca');
  comBicho(m, 'cavalo', 'sela');
  dar(m, { 'barril-de-agua': 1 });
  m.comando({ tipo: 'levarJumento', ligado: true });
  m.comando({ tipo: 'irACavalo', ligado: true });
  m.trabalho.carroca = { rabanete: 4 }; m.trabalho.barril = 5;
  passos(m, 1);
  const n = recarregar(m);
  assert.deepEqual(n.salvar().sistemas.trabalho, { aCavalo: true, levando: true, carroca: { rabanete: 4 }, barril: 5 });
  assert.equal(n.locais.fazenda.entidades.filter((e) => e.tipo === 'bichoDeTrabalho').length, 0);
  passos(n, 1);
  assert.equal(n.locais.fazenda.entidades.filter((e) => e.tipo === 'bichoDeTrabalho').length, 2, 'os dois saem de novo');
  // gravação de antes desta frente (sem o sistema): abre com tudo desligado
  const g = copia(m.salvar());
  delete g.sistemas.trabalho;
  const v = Mundo.carregar(m.dados, g);
  assert.equal(v.trabalho.levando, false); assert.equal(naCarroca(v), 0);
  // o bicho vendido: o botão desliga sozinho
  const um = m.animais.lista.find((a) => a.especie === 'jumento');
  m.comando({ tipo: 'levarJumento', ligado: true });
  m.animais.lista.splice(m.animais.lista.indexOf(um), 1); m.animais.versao++;
  m.passo();
  assert.equal(m.trabalho.levando, false);
});

test('o estábulo do teste fica onde não atrapalha', () => {
  const m = mundoDoTrabalho();
  const e = porEstabulo(m);
  assert.deepEqual([e.x, e.z], ESTABULO);
  assert.ok(dadosDeTeste());
});
