// As ferramentas no sítio, com os dados de verdade: ela chega com a enxada na mão; o regador velho fica no chão ao lado
// do poço e a enxada, quando sai do cinto, fica escorada na estaca do canto do campo. Escolher na barra o modo de uma
// ferramenta que ela não leva (ou tocar numa planta com sede) faz ela ir buscar sozinha; o regador pego já vai encher.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lerPasta, ateParar, ouvirTudo, modo, tocar, tocarEm, porConstrucao } from './apoio.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { prepararDados } from '../src/nucleo/dados.js';
import { TIPOS } from '../src/nucleo/registro.js';
import { missaoAtual } from '../src/nucleo/sistemas/missoes.js';
import { guiaDaMissao } from '../src/nucleo/guia.js';
import { darItem, listaDeFerramentas } from '../src/nucleo/sistemas/posses.js';
import { ondeBuscar } from '../src/nucleo/sistemas/personagem.js';
import { entidadeDoLugar } from '../src/nucleo/sistemas/lugares.js';
import { GRAMA } from '../src/nucleo/local.js';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const BRUTO = lerPasta(path.join(aqui, '..', 'dados'));
const copia = (o) => JSON.parse(JSON.stringify(o));
function dadosDeVerdade(muda) {
  const b = copia(BRUTO);
  if (muda) muda(b);
  const { dados, problemas } = prepararDados(b);
  assert.deepEqual(problemas.filter((p) => p.grave), []);
  return dados;
}
const novo = (muda) => new Mundo(dadosDeVerdade(muda), { agora: 1_700_000_000_000 });
const F = (m, id) => m.posses.ferramentas[id];
// a missão "id" passa a ser a da vez (as de antes, feitas), no nível dela
function naMissao(m, id) {
  const lista = m.dados.missoes.vizinho, k = lista.findIndex((x) => x.id === id);
  m.missoes.feitas = lista.slice(0, k).map((x) => x.id); m.missoes.de = null; m.missoes.conta = 0;
  m.progresso.nivel = Math.max(m.progresso.nivel, lista[k].nivel); m.progresso.xp = Math.max(m.progresso.xp, m.dados.niveis.limiar[lista[k].nivel]);
  return missaoAtual(m);
}

test('o começo: a enxada no cinto; o regador no chão ao lado do poço; a estaca da enxada no canto do campo', () => {
  const m = novo(), D = m.dados, loc = m.locais.fazenda;
  assert.deepEqual(listaDeFerramentas(m, 'cinto'), ['enxada-velha']);
  assert.equal(F(m, 'regador-velho').onde, 'lugar');
  assert.equal(F(m, 'regador-velho').agua, 0);
  // o regador: encostado no poço (uma casa ao lado dele), na grama, sem bloquear nada
  const r = entidadeDoLugar(m, 'regador-velho'), poco = loc.porId.poco;
  assert.deepEqual([r.x, r.z], D.terras.lugares['regador-velho']);
  const encosta = r.x >= poco.x - 1 && r.x <= poco.x + poco.l && r.z >= poco.z - 1 && r.z <= poco.z + poco.p;
  assert.ok(encosta, `o regador (${r.x}, ${r.z}) fica ao lado do poço`);
  assert.equal(TIPOS[r.tipo].bloqueia, false);
  assert.equal(loc.chao[loc.i(r.x, r.z)], GRAMA);
  assert.ok(loc.andavel(r.x, r.z));
  // a estaca da enxada: no canto da frente do campo (encostada nele, na diagonal) e do lado do poço
  const e = entidadeDoLugar(m, 'enxada-velha'), c = D.terras.campo;
  assert.deepEqual([e.x, e.z], [c[2], c[3]]);
  assert.ok(e.x <= poco.x && e.z >= poco.z + poco.p - 1, 'entre o campo e o poço');
  // com a enxada na mão, a estaca não recebe toque (o toque vale para a casa); o regador, sim
  assert.equal(TIPOS[e.tipo].semToque(m, e), true);
  assert.equal(TIPOS[r.tipo].semToque(m, r), false);
  assert.equal(TIPOS[r.tipo].acaoPossivel(m, r).acao, 'pegarFerramenta');
});

test('escolher Regar sem o regador: ela vai ao poço, pega e enche; o regador fica no cinto (sem volta depois de usar)', () => {
  const m = novo(), ev = ouvirTudo(m);
  modo(m, 'regar');
  const t = ateParar(m, 30);
  assert.ok(t < 12, `levou ${t} s`);
  assert.equal(F(m, 'regador-velho').onde, 'cinto');
  assert.equal(F(m, 'regador-velho').agua, m.dados.itens['regador-velho'].capacidade, 'cheio');
  assert.deepEqual(ev.tipos().filter((k) => k === 'pegouFerramenta' || k === 'encheu'), ['pegouFerramenta', 'encheu']);
  assert.equal(ev.de('pegouFerramenta')[0].lugar, true);
  assert.equal(F(m, 'enxada-velha').onde, 'cinto', 'a enxada continua com ela (o cinto tem 2 vagas)');
  // trocar de modo e voltar não manda buscar de novo
  modo(m, 'enxada'); modo(m, 'regar');
  assert.equal(m.personagem.fila.length, 0);
});

test('trocou de modo antes de pegar: a busca sai da fila; escolher Enxada com a enxada na mão não faz nada', () => {
  const m = novo();
  modo(m, 'enxada');
  assert.equal(m.personagem.fila.length, 0);
  modo(m, 'regar');
  assert.equal(m.personagem.fila.length, 1);
  m.passo();
  modo(m, 'mao');
  ateParar(m, 10);
  assert.equal(F(m, 'regador-velho').onde, 'lugar', 'o regador ficou no chão');
});

test('a missão do poço: a seta aponta o regador no chão; tocar nele pega e enche, e a missão anda', () => {
  const m = novo(), ev = ouvirTudo(m);
  assert.equal(naMissao(m, 'agua-do-poco').missao.id, 'agua-do-poco');
  assert.match(m.dados.missoes.vizinho.find((x) => x.id === 'agua-do-poco').fala, /regador ao lado do poço/);
  const g = guiaDaMissao(m);
  assert.equal(g.tipo, 'entidade'); assert.equal(g.id, 'lugar:regador-velho');
  assert.equal(tocarEm(m, g.id).ok, true);
  ateParar(m, 30);
  assert.equal(F(m, 'regador-velho').onde, 'cinto');
  assert.ok(ev.de('missaoConcluida').some((d) => d.id === 'agua-do-poco'));
  // com o regador no cinto, a seta volta a apontar o poço
  m.posses.ferramentas['regador-velho'].agua = 0;
  m.missoes.feitas = m.missoes.feitas.filter((id) => id !== 'agua-do-poco'); m.missoes.de = null;
  assert.equal(guiaDaMissao(m).id, 'poco');
});

test('planta com sede no modo Mão, sem o regador: ela busca no poço, enche e rega, num toque só', () => {
  const m = novo(), ev = ouvirTudo(m), loc = m.locais.fazenda, L = m.dados.terras.pontos.lavoura;
  modo(m, 'enxada'); tocar(m, L[0], L[1]); ateParar(m, 30); // a casa do campo pede a enxada antes de semear
  modo(m, 'semear', 'semente-alface'); tocar(m, L[0], L[1]); ateParar(m, 30);
  assert.ok(loc.plantas[loc.i(L[0], L[1])], 'plantou');
  assert.equal(F(m, 'regador-velho').onde, 'lugar');
  modo(m, 'mao');
  assert.equal(tocar(m, L[0], L[1]).ok, true);
  ateParar(m, 40);
  assert.deepEqual(ev.tipos().filter((k) => ['pegouFerramenta', 'encheu', 'regou'].includes(k)), ['pegouFerramenta', 'encheu', 'regou']);
  assert.equal(F(m, 'regador-velho').agua, m.dados.itens['regador-velho'].capacidade - 1);
});

test('cinto cheio: a foice vem do celeiro e a enxada, usada há mais tempo, volta para a estaca do campo; escolher Enxada busca lá', () => {
  const m = novo(), ev = ouvirTudo(m), loc = m.locais.fazenda;
  modo(m, 'regar'); ateParar(m, 30); // regador no cinto (o cinto de 2 vagas fica cheio)
  darItem(m, 'foice-velha', 1, 'teste');
  assert.equal(F(m, 'foice-velha').onde, 'suporte', 'sem vaga: a foice nova vai para o suporte do celeiro');
  // um mato da beirada: a foice vem do celeiro; sai do cinto a usada há mais tempo (a enxada: o regador acabou de encher)
  const mato = loc.entidades.find((e) => e.tipo === 'mato' && loc.ehPropria(e.x, e.z));
  assert.equal(tocarEm(m, mato.id).ok, true);
  ateParar(m, 60);
  assert.ok(ev.de('limpou').length >= 1);
  assert.equal(F(m, 'foice-velha').onde, 'cinto');
  assert.equal(F(m, 'enxada-velha').onde, 'lugar', 'a enxada foi para a estaca do campo');
  assert.equal(ev.de('pegouFerramenta').at(-1).guardou, 'enxada-velha');
  // escolher Enxada: ela vai à estaca do campo buscar (e não ao celeiro)
  const b = ondeBuscar(m, 'enxada');
  assert.deepEqual(b, { item: 'enxada-velha', entidade: 'lugar:enxada-velha' });
  modo(m, 'enxada');
  ateParar(m, 30);
  assert.equal(F(m, 'enxada-velha').onde, 'cinto');
  assert.equal(ev.de('pegouFerramenta').at(-1).lugar, true);
  assert.equal(ev.de('encheu').length, 1, 'pegar a enxada não manda encher nada');
});

test('gravação de antes: o regador velho que estava no suporte do celeiro abre no chão ao lado do poço; o do cinto segue no cinto', () => {
  const m = novo();
  const g = copia(m.salvar());
  g.sistemas.posses.ferramentas = {
    'enxada-velha': { onde: 'cinto', agua: 0, usos: 3, vez: 2 },
    'regador-velho': { onde: 'suporte', agua: 2, usos: 5, vez: 1 },
    'foice-velha': { onde: 'suporte', agua: 0, usos: 0, vez: 0 },
  };
  const n = Mundo.carregar(m.dados, g);
  assert.equal(F(n, 'regador-velho').onde, 'lugar');
  assert.equal(F(n, 'regador-velho').agua, 2);
  assert.equal(F(n, 'foice-velha').onde, 'suporte', 'ferramenta sem lugar no sítio segue no celeiro');
  // e a gravação mais antiga, com as duas no cinto, abre igual
  g.sistemas.posses.ferramentas['regador-velho'].onde = 'cinto';
  const n2 = Mundo.carregar(m.dados, g);
  assert.deepEqual(listaDeFerramentas(n2, 'cinto').sort(), ['enxada-velha', 'regador-velho']);
});

test('construção em cima do lugar do regador: ele muda para a grama livre mais perto; tirada a construção, volta', () => {
  const m = novo(), loc = m.locais.fazenda, [rx, rz] = m.dados.terras.lugares['regador-velho'];
  const e = porConstrucao(m, 'banco-de-madeira', rx, rz);
  assert.ok(e, 'o banco coube');
  m.passo(); for (let k = 0; k < 61; k++) m.passo();
  const r = entidadeDoLugar(m, 'regador-velho');
  assert.notDeepEqual([r.x, r.z], [rx, rz]);
  assert.ok(Math.hypot(r.x - rx, r.z - rz) < 2.5, `foi para perto (${r.x}, ${r.z})`);
  assert.equal(loc.chao[loc.i(r.x, r.z)], GRAMA);
  // gravar e abrir com o banco ali: o regador já nasce no lugar novo
  const n = Mundo.carregar(m.dados, copia(m.salvar()));
  const r2 = entidadeDoLugar(n, 'regador-velho');
  assert.deepEqual([r2.x, r2.z], [r.x, r.z]);
  // sem o banco, ele volta para o lado do poço
  loc.tirar(e.id); m.construcao.todas.splice(m.construcao.todas.indexOf(e), 1);
  for (let k = 0; k < 61; k++) m.passo();
  const r3 = entidadeDoLugar(m, 'regador-velho');
  assert.deepEqual([r3.x, r3.z], [rx, rz]);
});
