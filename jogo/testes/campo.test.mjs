// O campo de plantação: a fazenda nasce com um campo demarcado (terra de plantio sem sulco); arou uma vez, é campo
// para sempre; podeArar; a fileira (segurar numa casa do campo enfileira a ação do modo na fileira toda); gravação.
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, dadosDeTeste, ateParar, ouvirTudo, modo, tocar, arar, semear, encher, colher, pular, plantarAtePronta, porConstrucao } from './apoio.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { GRAMA, ARADA, CAMINHO, CAMPO, deLavoura } from '../src/nucleo/local.js';
import { podeArar, casasDaFileira, fileiraDe, plantaEm, estadoDaPlanta, FORMATO_DA_LAVOURA } from '../src/nucleo/sistemas/lavoura.js';
import { guiaDaMissao } from '../src/nucleo/guia.js';
import { gravacao } from '../src/plataforma/gravacao.js';

// o campo dos testes: x 8..13, z 12..13 (duas fileiras de 6 ao longo de X, como o do jogo)
const RET = [8, 12, 14, 14];
// o campo grande de antes (6 por 4): as gravações feitas com ele abrem com ele
const GRANDE = [8, 12, 14, 16];
const comCampo = (mais) => (b) => { b.terras.inicial.campo = [...RET]; if (mais) mais(b); };
const novo = (mais) => novoMundo(comCampo(mais));
const dados = (mais) => dadosDeTeste(comCampo(mais));
const rearar = (b) => { b.regras.lavoura = { reararAposColher: true }; };
const chao = (m, x, z) => m.local.chao[m.local.i(x, z)];
const fileira = (z, x0 = 8, x1 = 13) => Array.from({ length: x1 - x0 + 1 }, (_, k) => [x0 + k, z]);
const copia = (o) => JSON.parse(JSON.stringify(o));

test('a fazenda nasce com o campo de plantação demarcado: terra sem sulco, sem mato, com o caminho de fora', () => {
  const m = novo();
  for (let z = 12; z < 14; z++) for (let x = 8; x < 14; x++) assert.equal(chao(m, x, z), CAMPO, `(${x}, ${z})`);
  assert.equal(chao(m, 7, 12), GRAMA);
  assert.equal(chao(m, 14, 12), GRAMA);
  assert.equal(chao(m, 8, 14), GRAMA);
  // por cima do caminho e de construção o campo não passa
  const n = novoMundo((b) => { b.terras.inicial.campo = [13, 5, 19, 11]; });
  assert.equal(chao(n, 15, 9), CAMINHO, 'o caminho segue caminho');
  assert.equal(chao(n, 15, 5), GRAMA, 'debaixo do poço fica grama');
  assert.equal(chao(n, 14, 8), CAMPO);
  assert.equal(chao(n, 13, 7), GRAMA, 'debaixo do celeiro também');
  // sem "campo" nos dados, nada muda (o mapa dos outros testes)
  assert.equal(chao(novoMundo(), 12, 13), GRAMA);
  // campo que sai da área inicial é ignorado com aviso
  const D = dadosDeTeste((b) => { b.terras.inicial.campo = [18, 12, 22, 16]; });
  assert.equal(D.terras.campo, null);
});

test('podeArar: grama livre e campo livre, em terra própria; não a terra arada, o caminho, a construção, a terra à venda', () => {
  const m = novo();
  assert.equal(podeArar(m, 10, 13), true, 'campo');
  assert.equal(podeArar(m, 16, 13), true, 'grama');
  assert.equal(podeArar(m, 10, 9), false, 'caminho');
  assert.equal(podeArar(m, 15, 5), false, 'poço');
  assert.equal(podeArar(m, 21, 13), false, 'terra à venda');
  assert.equal(podeArar(m, -1, 3), false, 'fora do mapa');
  arar(m, [[10, 13]]);
  assert.equal(podeArar(m, 10, 13), false, 'já arada');
  assert.ok(deLavoura(chao(m, 10, 13)) && deLavoura(chao(m, 11, 13)) && !deLavoura(chao(m, 16, 13)));
});

test('arar campo leva o mesmo tempo, dá o mesmo xp e o mesmo "arou" que arar grama', () => {
  const a = novo(), b = novoMundo();
  const ea = ouvirTudo(a), eb = ouvirTudo(b);
  assert.equal(chao(a, 12, 13), CAMPO); assert.equal(chao(b, 12, 13), GRAMA);
  const ta = arar(a, [[12, 13]]), tb = arar(b, [[12, 13]]);
  assert.equal(ta, tb);
  assert.equal(a.progresso.xp, b.progresso.xp);
  assert.deepEqual(ea.de('arou'), eb.de('arou'));
  assert.equal(chao(a, 12, 13), ARADA);
});

test('arou uma vez, é campo para sempre: colheu, a casa vira campo e pede a enxada; arar grama aumenta o campo', () => {
  const m = novo(rearar);
  m.posses.bolsa['semente-rabanete'] = 4;
  plantarAtePronta(m, [[10, 13], [16, 13]]); // uma no campo, uma na grama do lado
  colher(m, [[10, 13], [16, 13]]);
  assert.equal(chao(m, 10, 13), CAMPO);
  assert.equal(chao(m, 16, 13), CAMPO, 'a grama arada virou campo também');
  modo(m, 'semear', 'semente-rabanete');
  assert.equal(tocar(m, 16, 13).motivo, 'arar-antes');
  modo(m, 'mao');
  assert.equal(tocar(m, 10, 13).ok, true, 'na mão, o campo vazio só faz andar');
  ateParar(m);
  modo(m, 'enxada');
  assert.equal(tocar(m, 16, 13).ok, true);
  ateParar(m);
  assert.equal(chao(m, 16, 13), ARADA);
});

test('fileira: as casas de campo seguidas ao longo de X, da ponta mais perto da personagem', () => {
  const m = novo();
  assert.deepEqual(casasDaFileira(m, 11, 12), fileira(12));
  m.personagem.x = 14.5;
  assert.deepEqual(casasDaFileira(m, 11, 12), fileira(12).reverse());
  assert.deepEqual(casasDaFileira(m, 16, 12), [], 'grama não é fileira');
  arar(m, [[11, 13]]);
  assert.equal(casasDaFileira(m, 9, 13).length, 6, 'a arada continua a fileira');
  porConstrucao(m, 'cerca-de-madeira', 10, 13);
  assert.equal(chao(m, 10, 13), GRAMA, 'construção no campo vazio: a casa volta a ser grama');
  assert.equal(casasDaFileira(m, 12, 13).length, 3, 'a cerca corta a fileira');
});

test('segurar numa casa do campo, no modo enxada, ara a fileira toda', () => {
  const m = novo(), ev = ouvirTudo(m);
  modo(m, 'enxada');
  const antes = copia(m.salvar());
  const f = fileiraDe(m, 11, 12);
  assert.equal(f.n, 6); assert.equal(f.acao, 'arar');
  assert.deepEqual(copia(m.salvar()), antes, 'mostrar a fileira não mexe em nada');
  const r = m.comando({ tipo: 'fileira', x: 11.5, z: 12.5 });
  assert.equal(r.ok, true); assert.equal(r.dados.n, 6);
  assert.deepEqual(ev.de('fileira').map((d) => d.n), [6]);
  // de novo: tudo já está na fila
  const r2 = m.comando({ tipo: 'fileira', x: 9.5, z: 12.5 });
  assert.equal(r2.ok, false); assert.equal(r2.motivo, 'fileira-em-dia');
  ateParar(m);
  assert.equal(ev.de('arou').length, 6);
  for (const [x, z] of fileira(12)) assert.equal(chao(m, x, z), ARADA);
  // fora do campo, segurar não faz nada
  assert.equal(m.comando({ tipo: 'fileira', x: 16.5, z: 12.5 }).motivo, 'fora-do-campo');
});

test('a fileira respeita a fila (filaMax), as sementes e a água', () => {
  // fila curta: entra só o que cabe
  const m = novo((b) => { b.regras.filaMax = 4; });
  modo(m, 'enxada');
  const f = fileiraDe(m, 8, 12);
  assert.equal(f.n, 4); assert.equal(f.motivo, 'fila-cheia');
  assert.equal(m.comando({ tipo: 'fileira', x: 8, z: 12 }).dados.n, 4);
  assert.equal(m.personagem.fila.length + (m.personagem.tarefa ? 1 : 0) <= 5, true);
  ateParar(m);
  // três sementes para seis casas aradas: três entram, o resto avisa
  const n = novo();
  arar(n, fileira(13));
  n.posses.bolsa['semente-rabanete'] = 3;
  modo(n, 'semear', 'semente-rabanete');
  const s = fileiraDe(n, 8, 13);
  assert.equal(s.n, 3); assert.equal(s.motivo, 'sem-sementes');
  assert.equal(n.comando({ tipo: 'fileira', x: 8, z: 13 }).dados.n, 3);
  ateParar(n);
  assert.equal(fileira(13).filter(([x, z]) => plantaEm(n, x, z)).length, 3);
  // regador de 3 regas para três plantas com sede e mais
  n.posses.bolsa['semente-rabanete'] = 3; semear(n, fileira(13));
  encher(n);
  modo(n, 'regar');
  const r = fileiraDe(n, 8, 13);
  assert.equal(r.n, 3); assert.equal(r.acao, 'regar'); assert.equal(r.motivo, 'regador-vazio');
  n.comando({ tipo: 'fileira', x: 8, z: 13 }); ateParar(n);
  assert.equal(fileira(13).filter(([x, z]) => estadoDaPlanta(n, plantaEm(n, x, z)) === 'crescendo').length, 3);
});

test('na mão, a fileira colhe o que está pronto e rega o que tem sede', () => {
  const m = novo();
  m.posses.bolsa['semente-rabanete'] = 6;
  const prontas = fileira(13, 8, 10), sede = fileira(13, 11, 13);
  plantarAtePronta(m, prontas);
  arar(m, sede); semear(m, sede); encher(m);
  modo(m, 'mao');
  const f = fileiraDe(m, 10, 13);
  assert.equal(f.n, 6);
  assert.deepEqual(f.alvo.map((a) => a[2]).sort(), ['colher', 'colher', 'colher', 'regar', 'regar', 'regar']);
  m.comando({ tipo: 'fileira', x: 10, z: 13 }); ateParar(m);
  for (const [x, z] of prontas) assert.equal(plantaEm(m, x, z), null);
  for (const [x, z] of sede) assert.equal(estadoDaPlanta(m, plantaEm(m, x, z)), 'crescendo');
});

test('o guia da primeira missão aponta a primeira fileira do campo, com as casas em linha', () => {
  const m = novo((b) => { b.terras.pontos.lavoura = [8, 12]; });
  modo(m, 'enxada');
  const g = guiaDaMissao(m);
  assert.equal(g.tipo, 'casa'); assert.equal(g.z, 12);
  assert.deepEqual(g.casas.map((c) => c.join(',')).sort(), fileira(12).map((c) => c.join(',')).sort());
  arar(m, fileira(12));
  const h = guiaDaMissao(m);
  if (h.tipo === 'casa' && h.casas) assert.ok(h.casas.every(([, z]) => z === h.z));
});

test('gravar e carregar guarda o campo: terra sem sulco, arada, plantada e o campo que cresceu', () => {
  const m = novo(rearar);
  m.posses.bolsa['semente-rabanete'] = 4;
  plantarAtePronta(m, [[16, 13]]); colher(m, [[16, 13]]); // o campo cresceu para a grama
  arar(m, [[8, 12], [9, 12]]); semear(m, [[8, 12]]);
  const g = copia(m.salvar());
  assert.equal(g.sistemas.lavoura.formato, FORMATO_DA_LAVOURA);
  const n = Mundo.carregar(dados(rearar), g);
  assert.deepEqual(copia(n.salvar()), g);
  assert.equal(chao(n, 16, 13), CAMPO);
  assert.equal(chao(n, 9, 12), ARADA);
  assert.equal(plantaEm(n, 8, 12).cultura, 'rabanete');
  assert.equal(chao(n, 13, 13), CAMPO);
  // casa do campo inicial que deixou de ser campo (uma construção passou por ali) segue grama
  const k = novo();
  k.local.chao[k.local.i(13, 13)] = GRAMA;
  const q = Mundo.carregar(dados(), copia(k.salvar()));
  assert.equal(chao(q, 13, 13), GRAMA);
  assert.equal(chao(q, 12, 13), CAMPO);
});

test('gravação de antes do campo abre: ganha o campo nas casas livres e a terra arada volta', () => {
  // o mundo velho: sem campo nos dados, uma casa arada dentro do retângulo, uma fora, e uma cerca no meio dele
  const velho = novoMundo();
  velho.posses.bolsa['semente-rabanete'] = 3;
  arar(velho, [[9, 13], [17, 13]]); semear(velho, [[9, 13]]);
  porConstrucao(velho, 'cerca-de-madeira', 12, 13);
  const g = copia(velho.salvar());
  // a lavoura no formato 1: { local: [[índice, cultura, feitas, secaEm] | [índice]] }
  const v = velho.local, antiga = [];
  for (let i = 0; i < v.chao.length; i++) if (v.chao[i] === ARADA) { const pl = v.plantas[i]; antiga.push(pl ? [i, pl.cultura, pl.feitas, pl.secaEm] : [i]); }
  g.sistemas.lavoura = { fazenda: antiga };
  const n = Mundo.carregar(dados(), g);
  assert.equal(chao(n, 9, 13), ARADA); assert.equal(plantaEm(n, 9, 13).cultura, 'rabanete');
  assert.equal(chao(n, 17, 13), ARADA, 'a arada de fora do campo volta');
  assert.equal(chao(n, 10, 13), CAMPO, 'as casas livres do retângulo viram campo');
  assert.equal(chao(n, 12, 13), GRAMA, 'debaixo da cerca fica grama');
  assert.equal(copia(n.salvar()).sistemas.lavoura.formato, FORMATO_DA_LAVOURA, 'e grava no formato novo');
  n.avancar(2);
});

test('gravação feita com o campo grande de antes abre com o campo grande (e o jogo novo nasce com o pequeno)', () => {
  // o jogo de antes: campo de 6 por 4, uma fileira de baixo arada e plantada, o resto sem sulco
  const velho = novoMundo((b) => { b.terras.inicial.campo = [...GRANDE]; });
  velho.posses.bolsa['semente-rabanete'] = 2;
  arar(velho, [[9, 15], [10, 15]]); semear(velho, [[9, 15]]);
  const g = copia(velho.salvar());
  // abre com os dados de agora (campo de 6 por 2): quem já tinha o campo grande fica com ele
  const n = Mundo.carregar(dados(), g);
  for (let z = 12; z < 16; z++) for (let x = 8; x < 14; x++) assert.ok(deLavoura(chao(n, x, z)), `(${x}, ${z}) segue campo`);
  assert.equal(chao(n, 9, 15), ARADA); assert.equal(plantaEm(n, 9, 15).cultura, 'rabanete');
  assert.equal(chao(n, 8, 14), CAMPO);
  assert.equal(casasDaFileira(n, 11, 15).length, 6, 'a fileira de baixo segue inteira');
  // o jogo novo, com os mesmos dados, nasce só com as duas fileiras
  const novoJogo = novo();
  let casas = 0;
  for (let i = 0; i < novoJogo.local.chao.length; i++) if (deLavoura(novoJogo.local.chao[i])) casas++;
  assert.equal(casas, 12);
  assert.equal(chao(novoJogo, 8, 14), GRAMA);
  // e o campo cresce arando a grama do lado (a fileira de baixo de antes)
  assert.equal(podeArar(novoJogo, 8, 14), true);
  arar(novoJogo, [[8, 14]]);
  assert.equal(casasDaFileira(novoJogo, 8, 14).length, 1);
});

test('exportar e importar por texto leva o campo junto', () => {
  const m = novo(rearar);
  arar(m, [[8, 12], [16, 12]]);
  const g = m.salvar(), texto = gravacao.exportar(g);
  const n = Mundo.carregar(dados(rearar), gravacao.importar(texto));
  assert.deepEqual(copia(n.salvar()), copia(g));
  assert.equal(chao(n, 16, 12), ARADA); assert.equal(chao(n, 11, 12), CAMPO);
});
