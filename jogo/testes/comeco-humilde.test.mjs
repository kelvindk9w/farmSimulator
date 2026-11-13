// O começo humilde com os dados de verdade: a fazenda nasce com a casa e o poço velhos, o caixote de venda, o baú e a
// cerca de arame (sem celeiro, banca nem quadro); a cena da chegada; o baú e o caixote; o celeiro e o quadro que se
// constroem; as reformas e o que cada uma melhora; a gravação de antes (testes/gravacoes, feitas com o código de
// antes do começo humilde) abrindo com a fazenda de antes; e o atalho de teste dando o que o nível já teria.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lerPasta, ateParar, ouvirTudo, modo, pular, tocarEm, porConstrucao } from './apoio.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { prepararDados } from '../src/nucleo/dados.js';
import { missaoAtual } from '../src/nucleo/sistemas/missoes.js';
import { noCaixote } from '../src/nucleo/sistemas/banca.js';
import { capacidadeDe } from '../src/nucleo/sistemas/celeiro-dentro.js';
import { reformas, trechosDaCerca, tipoDoTrecho, ehHumilde } from '../src/nucleo/sistemas/comeco.js';
import { construcoesDe, estaPronta } from '../src/nucleo/sistemas/construcao.js';
import { guiaDaMissao } from '../src/nucleo/guia.js';
import { TIPOS } from '../src/nucleo/registro.js';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const BRUTO = lerPasta(path.join(aqui, '..', 'dados'));
const copia = (o) => JSON.parse(JSON.stringify(o));
function dadosDeVerdade() {
  const { dados, problemas } = prepararDados(copia(BRUTO));
  assert.deepEqual(problemas.filter((p) => p.grave), []);
  return dados;
}
const novo = () => new Mundo(dadosDeVerdade(), { agora: 1_700_000_000_000 });
const velha = (nome) => JSON.parse(fs.readFileSync(path.join(aqui, 'gravacoes', nome + '.json'), 'utf8'));
const tipos = (m) => m.locais.fazenda.entidades.map((e) => e.tipo);
const naFazenda = (m, id) => m.locais.fazenda.porId[id] || null;
function naMissao(m, id) {
  const lista = m.dados.missoes.vizinho, k = lista.findIndex((x) => x.id === id);
  m.missoes.feitas = lista.slice(0, k).map((x) => x.id); m.missoes.de = null; m.missoes.conta = 0;
  m.progresso.nivel = Math.max(m.progresso.nivel, lista[k].nivel); m.progresso.xp = Math.max(m.progresso.xp, m.dados.niveis.limiar[lista[k].nivel]);
  return missaoAtual(m);
}
const visualDe = (m, e) => TIPOS[e.tipo].visual(m, e, {});
const rico = (m, ouro = 5000, itens = {}) => { m.posses.ouro += ouro; for (const k in itens) m.posses.bolsa[k] = (m.posses.bolsa[k] || 0) + itens[k]; };

// ---------------------------------------------------------------------------------------------------------------
test('jogo novo: casa velha, poço velho, caixote na entrada, baú ao lado da casa, cerca de arame e o Seu Tonho; nada de celeiro, banca ou quadro', () => {
  const m = novo(), t = tipos(m);
  assert.equal(ehHumilde(m), true);
  assert.equal(naFazenda(m, 'casa').tipo, 'casa-velha');
  assert.equal(naFazenda(m, 'poco').tipo, 'poco-velho');
  assert.equal(naFazenda(m, 'banca').tipo, 'caixote-de-venda');
  assert.equal(naFazenda(m, 'bau-da-casa').tipo, 'bau-da-casa');
  assert.ok(naFazenda(m, 'vizinho'), 'o Seu Tonho está na fazenda');
  for (const nao of ['celeiro', 'banca', 'quadro-de-pedidos', 'casa', 'poco']) assert.ok(!t.includes(nao), `nasceu ${nao}`);
  // a cerca: trechos em volta da terra própria, todos de arame, com o vão da entrada aberto
  const trechos = trechosDaCerca(m);
  assert.ok(trechos.length > 40, `${trechos.length} trechos`);
  assert.ok(trechos.every((tr) => tipoDoTrecho(m, tr) === 'cerca-de-arame'));
  for (const [x, z] of m.dados.terras.comeco.cerca.vao) assert.ok(!trechos.some((tr) => tr.eixo === 'x' && tr.cx === x && tr.cz === z), `trecho no vão (${x}, ${z})`);
  // a enxada vem no cinto; o regador velho está no chão ao lado do poço; o estoque é o do baú (40)
  assert.equal(m.posses.ferramentas['enxada-velha'].onde, 'cinto', 'a enxada na mão');
  assert.equal(m.posses.ferramentas['regador-velho'].onde, 'lugar', 'o regador no chão, ao lado do poço');
  assert.equal(capacidadeDe(m, 'produtos'), 40);
  // pedidos só depois do quadro
  assert.equal(m.pedidos.vagas.filter((v) => v.pedido).length, 0);
});

test('a chegada: ela entra pela porteira até perto do Seu Tonho, ele acena quando ela passa da cerca, e a cena acaba sozinha', () => {
  const m = novo(), ev = ouvirTudo(m), p = m.personagem, loc = m.locais.fazenda;
  const r = m.comando({ tipo: 'comecarChegada' });
  assert.equal(r.ok, true); assert.ok(r.dados.seg > 3 && r.dados.seg < 9, `${r.dados.seg} s`);
  assert.equal(loc.ehPropria(Math.floor(p.x), Math.floor(p.z)), false, 'começa do lado de fora');
  assert.equal(m.comando({ tipo: 'comecarChegada' }).ok, false, 'uma cena por vez');
  // nenhuma seta durante a cena
  assert.equal(guiaDaMissao(m).tipo, null);
  let passos = 0;
  while (m.comeco.chegada && passos < 60 * 20) { m.passo(); passos++; }
  assert.ok(!m.comeco.chegada && m.comeco.chegou);
  assert.ok(Math.abs(passos / 60 - r.dados.seg) < 0.2, `${passos / 60} s, prometido ${r.dados.seg}`);
  assert.deepEqual(ev.tipos().filter((x) => ['comecouChegada', 'tonhoAcenou', 'chegou'].includes(x)), ['comecouChegada', 'tonhoAcenou', 'chegou']);
  assert.deepEqual(ev.de('chegou'), [{ pulou: false }]);
  const P = m.dados.terras.pontos.personagem;
  assert.ok(Math.hypot(p.x - P[0], p.z - P[1]) < 0.01, 'termina no ponto dela');
  const v = naFazenda(m, 'vizinho');
  assert.ok(Math.hypot(p.x - v.x - 0.5, p.z - v.z - 0.5) < 3, 'perto do Seu Tonho');
  // não tem bis, e a seta agora aponta o Seu Tonho
  assert.equal(m.comando({ tipo: 'comecarChegada' }).ok, false);
  assert.deepEqual([guiaDaMissao(m).tipo, guiaDaMissao(m).id], ['entidade', 'vizinho']);
});

test('a chegada nunca prende: pular, ou qualquer toque, termina a cena na hora; uma ordem de verdade segue valendo', () => {
  const a = novo();
  a.comando({ tipo: 'comecarChegada' }); a.passo();
  assert.equal(a.comando({ tipo: 'pularChegada' }).ok, true);
  assert.ok(a.comeco.chegou && !a.comeco.chegada);
  // um toque no chão: só termina a cena (o toque seguinte já anda)
  const b = novo(), ev = ouvirTudo(b);
  b.comando({ tipo: 'comecarChegada' }); for (let k = 0; k < 30; k++) b.passo();
  const r = b.comando({ tipo: 'tocarCasa', x: 28.5, z: 53.5 });
  assert.equal(r.ok, true); assert.equal(r.dados.pulouChegada, true);
  assert.deepEqual(ev.de('chegou'), [{ pulou: true }]);
  assert.equal(b.personagem.fila.length, 0);
  b.comando({ tipo: 'tocarCasa', x: 28.5, z: 53.5 }); ateParar(b);
  assert.ok(Math.hypot(b.personagem.x - 28.5, b.personagem.z - 53.5) < 1.2, 'o segundo toque anda');
  // uma ordem que não é toque (ex.: escolher a ferramenta) termina a cena e vale
  const c = novo();
  c.comando({ tipo: 'comecarChegada' }); c.passo();
  assert.equal(modo(c, 'enxada').ok, true);
  assert.ok(c.comeco.chegou); assert.equal(c.modo.id, 'enxada');
  // gravar no meio da cena: abre com ela já chegada (a cena não volta)
  const d = novo();
  d.comando({ tipo: 'comecarChegada' }); for (let k = 0; k < 30; k++) d.passo();
  const n = Mundo.carregar(d.dados, copia(d.salvar()));
  assert.ok(n.comeco.chegou && !n.comeco.chegada);
  assert.equal(n.comando({ tipo: 'comecarChegada' }).ok, false);
});

test('a primeira missão é conversar com o Seu Tonho; depois, tocar nele de novo é conversa (abre as missões na interface)', () => {
  const m = novo(), ev = ouvirTudo(m);
  m.comando({ tipo: 'pularChegada' });
  assert.equal(missaoAtual(m).missao.id, 'falar-com-tonho');
  tocarEm(m, 'vizinho'); ateParar(m);
  assert.equal(missaoAtual(m).missao.id, 'preparar-a-terra');
  tocarEm(m, 'vizinho'); ateParar(m);
  assert.deepEqual(ev.de('conversou').map((d) => d.vez), [1, 2]);
});

// ---------------------------------------------------------------------------------------------------------------
test('o baú: guarda 40; cheio, avisa e a colheita fica no cesto (nada se perde) e dá para vender no caixote', () => {
  const m = novo(), ev = ouvirTudo(m);
  m.comando({ tipo: 'pularChegada' });
  m.posses.celeiro.itens.milho = 38;
  m.posses.cesto.itens.alface = 6;
  tocarEm(m, 'bau-da-casa'); ateParar(m);
  assert.equal(m.posses.celeiro.itens.alface, 2, 'coube o que dava');
  assert.equal(m.posses.cesto.itens.alface, 4, 'o resto ficou no cesto');
  assert.ok(ev.de('faltou').some((f) => f.motivo === 'bau-sem-espaco'), 'avisou que o baú encheu');
  // e o caixote leva o que sobrou
  tocarEm(m, 'banca'); ateParar(m);
  assert.equal(m.posses.cesto.itens.alface || 0, 0);
  assert.equal(noCaixote(m), 4);
});

test('o caixote: cabem 12; os fregueses levam um a cada 0,8 s pelo preço base; a figura é a do caixote cheio enquanto há coisa', () => {
  const m = novo(), ev = ouvirTudo(m), e = naFazenda(m, 'banca');
  m.comando({ tipo: 'pularChegada' });
  const figura = () => visualDe(m, e).chave;
  assert.equal(figura(), 'objeto/caixote-de-venda');
  m.posses.cesto.itens.alface = 14;
  const ouro0 = m.posses.ouro;
  tocarEm(m, 'banca'); ateParar(m);
  assert.ok(noCaixote(m) >= 10, 'o caixote encheu (e o primeiro freguês já pode ter passado)');
  assert.equal(m.posses.cesto.itens.alface, 2, 'o que não coube fica no cesto');
  assert.ok(ev.de('faltou').some((f) => f.motivo === 'caixote-cheio'));
  assert.deepEqual(ev.de('encheuCaixote').map((d) => d.n), [12]);
  assert.equal(figura(), 'objeto/caixote-de-venda-cheio');
  // um freguês a cada 0,8 s
  const vendidas0 = ev.de('caixoteVendeu').length;
  for (let k = 0; k < 60 * 2.5; k++) m.passo();
  const vendidas = ev.de('caixoteVendeu').length - vendidas0;
  assert.ok(vendidas >= 2 && vendidas <= 4, `${vendidas} em 2,5 s`);
  // fechado o jogo, o resto se vende
  pular(m, 60);
  assert.equal(noCaixote(m), 0);
  assert.equal(figura(), 'objeto/caixote-de-venda');
  assert.equal(m.posses.ouro - ouro0, 12 * m.dados.itens.alface.venda);
  assert.equal(ev.de('vendeu').reduce((s, d) => s + d.n, 0), 12, 'cada freguês conta para a missão de vender');
});

test('as missões do começo: guardar no baú e vender no caixote; o celeiro (nível 2) e o quadro (nível 3) são obras', () => {
  const m = novo(), ids = m.dados.missoes.vizinho.filter((x) => x.comeco !== 'classico').map((x) => x.id);
  const ordem = ['falar-com-tonho', 'preparar-a-terra', 'plantar-alface', 'agua-do-poco', 'regar', 'primeira-colheita', 'guardar-no-bau', 'vender-no-caixote', 'comprar-sementes', 'plantar-milho', 'celeiro'];
  assert.deepEqual(ids.slice(0, ordem.length), ordem);
  assert.ok(ids.indexOf('quadro') > ids.indexOf('celeiro'));
  assert.ok(ids.indexOf('primeiro-pedido') > ids.indexOf('quadro'));
  assert.ok(ids.indexOf('baia-do-boi') > 0);
  assert.equal(m.dados.missoes.vizinho.find((x) => x.id === 'baia-do-boi').nivel, 4, 'o boi segue no nível 4');
  // guardar no baú
  m.comando({ tipo: 'pularChegada' });
  naMissao(m, 'guardar-no-bau');
  m.posses.cesto.itens.alface = 6;
  tocarEm(m, 'bau-da-casa'); ateParar(m);
  assert.equal(missaoAtual(m).missao.id, 'vender-no-caixote');
  // vender no caixote: conta cada coisa que o freguês leva
  m.posses.cesto.itens.alface = 6;
  tocarEm(m, 'banca'); ateParar(m);
  pular(m, 10); m.passo();
  assert.equal(missaoAtual(m).missao.id, 'comprar-sementes');
  // o celeiro: obra de verdade, sai do Construir
  const a = naMissao(m, 'celeiro');
  assert.equal(a.missao.id, 'celeiro');
  const g = guiaDaMissao(m);
  assert.equal(g.tipo, 'painel'); assert.equal(g.painel, 'construir');
  rico(m);
  const P = m.dados.terras.pontos.celeiro;
  const r = m.comando({ tipo: 'construir', id: 'celeiro', x: P[0], z: P[1], jaJa: true });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(capacidadeDe(m, 'produtos'), 40, 'em obra ainda não guarda');
  pular(m, m.dados.construcoes.celeiro.obraSeg + 1); m.passo();
  assert.ok(estaPronta(naFazenda(m, 'celeiro')));
  assert.ok(capacidadeDe(m, 'produtos') > 40, 'o celeiro pronto guarda mais que o baú');
  assert.notEqual(missaoAtual(m).missao.id, 'celeiro');
});

test('o quadro de pedidos: obra do nível 3; os pedidos só aparecem com ele pronto', () => {
  const m = novo();
  m.comando({ tipo: 'pularChegada' });
  naMissao(m, 'quadro');
  rico(m);
  pular(m, 600); m.passo();
  assert.equal(m.pedidos.vagas.filter((v) => v.pedido).length, 0, 'sem quadro, sem pedido');
  const P = m.dados.terras.pontos['quadro-de-pedidos'];
  const r = m.comando({ tipo: 'construir', id: 'quadro-de-pedidos', x: Math.floor(P[0]), z: Math.floor(P[1]), jaJa: true });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.ok(naFazenda(m, 'quadro-de-pedidos'), 'o id é o de sempre (idFixo)');
  pular(m, m.dados.construcoes['quadro-de-pedidos'].obraSeg + 1); m.passo();
  pular(m, 5); m.passo();
  assert.ok(m.pedidos.vagas.some((v) => v.pedido), 'com o quadro pronto, chegam pedidos');
});

// ---------------------------------------------------------------------------------------------------------------
test('as reformas: a lista do painel, na ordem do nível, com o que falta; a obra troca a figura e mantém o id', () => {
  const m = novo();
  m.comando({ tipo: 'pularChegada' });
  const lista = reformas(m);
  assert.deepEqual(lista.map((r) => r.de), ['poco-velho', 'caixote-de-venda', 'casa-velha', 'cerca-de-arame']);
  assert.deepEqual(lista.map((r) => r.nivel), [2, 5, 7, 9]);
  assert.ok(lista.every((r) => !r.pode.ok && r.pode.motivo === 'nivel-baixo'));
  // o poço: nível 2, 40 de ouro, obra de 40 s
  m.progresso.nivel = 2; rico(m, 0);
  m.posses.ouro = 39;
  assert.equal(m.comando({ tipo: 'reformar', entidade: 'poco', jaJa: true }).motivo, 'sem-ouro');
  m.posses.ouro = 100;
  const ev = ouvirTudo(m);
  assert.equal(m.comando({ tipo: 'reformar', entidade: 'poco', jaJa: true }).ok, true);
  assert.equal(m.posses.ouro, 60);
  const e = naFazenda(m, 'poco');
  assert.equal(e.tipo, 'poco'); assert.equal(e.reforma, 'poco-velho'); assert.ok(e.obraAte > m.agora, 'em obra');
  assert.equal(reformas(m).find((r) => r.alvo === 'poco').obra > 0, true);
  pular(m, 41); m.passo();
  assert.ok(estaPronta(naFazenda(m, 'poco')));
  assert.deepEqual(ev.de('reformou').map((d) => [d.construcao, d.para]), [['poco-velho', 'poco']]);
  assert.ok(!reformas(m).some((r) => r.alvo === 'poco'));
});

test('a reforma vai a pé: ela anda até lá e martela; o preço sai na martelada', () => {
  const m = novo();
  m.comando({ tipo: 'pularChegada' });
  m.progresso.nivel = 2; m.posses.ouro = 100;
  const r = m.comando({ tipo: 'reformar', entidade: 'poco' });
  assert.equal(r.ok, true); assert.equal(r.dados.naFila, true);
  assert.equal(m.posses.ouro, 100, 'ainda não pagou');
  ateParar(m);
  assert.equal(m.posses.ouro, 60);
  assert.equal(naFazenda(m, 'poco').tipo, 'poco');
});

test('o que cada reforma melhora: o poço enche mais depressa e mais água; a banca vende na hora; a casa guarda mais; a cerca encurta a espera dos pedidos', () => {
  const m = novo();
  m.comando({ tipo: 'pularChegada' });
  m.progresso.nivel = 9; rico(m, 50000, { tabua: 100, prego: 100, pedra: 100, madeira: 100 });
  // o poço velho: demora o dobro e enche no máximo 8 regas
  const D = m.dados.construcoes;
  assert.equal(D['poco-velho'].demora, 2); assert.equal(D['poco-velho'].aguaMax, 8);
  // a casa: +40 de estoque
  const cap0 = capacidadeDe(m, 'produtos');
  for (const alvo of ['poco', 'banca', 'casa', 'cerca']) assert.equal(m.comando({ tipo: 'reformar', entidade: alvo, jaJa: true }).ok, true, alvo);
  pular(m, 3600); m.passo();
  assert.deepEqual(['casa', 'poco', 'banca'].map((id) => naFazenda(m, id).tipo), ['casa', 'poco', 'banca']);
  assert.ok(['casa', 'poco', 'banca'].every((id) => estaPronta(naFazenda(m, id))));
  assert.equal(capacidadeDe(m, 'produtos'), cap0 + 40);
  assert.equal(m.comeco.cerca.tipo, 'cerca-de-madeira');
  assert.ok(trechosDaCerca(m).every((t) => tipoDoTrecho(m, t) === 'cerca-de-madeira'));
  assert.equal(m.comeco.esperaDosPedidos, 0.8);
  assert.deepEqual(reformas(m), []);
  // a banca: o cesto inteiro, na hora
  m.posses.cesto.itens.alface = 20;
  const ouro0 = m.posses.ouro;
  tocarEm(m, 'banca'); ateParar(m);
  assert.equal(m.posses.ouro - ouro0, 20 * m.dados.itens.alface.venda);
  assert.equal(noCaixote(m), 0);
  // tudo volta igual da gravação
  const n = Mundo.carregar(m.dados, copia(m.salvar()));
  assert.equal(n.comeco.cerca.tipo, 'cerca-de-madeira'); assert.equal(n.comeco.esperaDosPedidos, 0.8);
  assert.equal(capacidadeDe(n, 'produtos'), cap0 + 40);
  assert.equal(naFazenda(n, 'vizinho') !== null, true);
});

test('a cerca em obra: os trechos novos vão aparecendo a partir da entrada; gravada no meio, a obra continua', () => {
  const m = novo();
  m.comando({ tipo: 'pularChegada' });
  m.progresso.nivel = 9; rico(m, 5000, { madeira: 30, prego: 30 });
  assert.equal(m.comando({ tipo: 'reformar', entidade: 'cerca', jaJa: true }).ok, true);
  const seg = m.dados.construcoes['cerca-de-arame'].reforma.obraSeg;
  pular(m, seg / 2);
  const novos = trechosDaCerca(m).filter((t) => tipoDoTrecho(m, t) === 'cerca-de-madeira').length, todos = trechosDaCerca(m).length;
  assert.ok(novos > todos * 0.3 && novos < todos * 0.7, `${novos} de ${todos}`);
  assert.equal(m.comeco.esperaDosPedidos, 1, 'o ganho só vem com a obra pronta');
  const n = Mundo.carregar(m.dados, copia(m.salvar()));
  pular(n, seg / 2 + 1); n.passo();
  assert.equal(n.comeco.cerca.tipo, 'cerca-de-madeira'); assert.equal(n.comeco.esperaDosPedidos, 0.8);
});

test('a missão de reforma vale para quem já reformou, e o guia leva ao cartão dela no Construir', () => {
  const m = novo();
  m.comando({ tipo: 'pularChegada' });
  naMissao(m, 'reformar-o-poco');
  const g = guiaDaMissao(m);
  assert.deepEqual([g.tipo, g.painel, g.item], ['painel', 'construir', 'reforma:poco-velho']);
  m.posses.ouro += 100;
  m.comando({ tipo: 'reformar', entidade: 'poco', jaJa: true });
  assert.equal(guiaDaMissao(m).tipo, 'esperar');
  pular(m, 60); m.passo(); pular(m, 2); m.passo();
  assert.ok(m.missoes.feitas.includes('reformar-o-poco'));
});

// ---------------------------------------------------------------------------------------------------------------
test('gravação de antes do começo humilde (nível 1): abre com a fazenda de antes, sem Tonho na fazenda, sem cerca e sem missões novas', () => {
  const g = velha('antes-nivel-1');
  assert.equal(g.sistemas.comeco, undefined, 'é mesmo de antes');
  const m = Mundo.carregar(dadosDeVerdade(), g), t = tipos(m);
  for (const id of ['casa', 'poco', 'celeiro', 'banca', 'quadro-de-pedidos']) assert.ok(t.includes(id), `falta ${id}`);
  for (const nao of ['casa-velha', 'poco-velho', 'caixote-de-venda', 'bau-da-casa', 'vizinho']) assert.ok(!t.includes(nao), `sobrou ${nao}`);
  assert.equal(ehHumilde(m), false);
  assert.equal(trechosDaCerca(m), null);
  assert.deepEqual(reformas(m), []);
  assert.ok(['casa', 'poco', 'celeiro', 'banca'].every((id) => estaPronta(naFazenda(m, id))));
  // as mesmas posições de antes
  for (const e of g.sistemas.construcao.lista.filter((x) => x.local === 'fazenda')) assert.deepEqual([naFazenda(m, e.id).x, naFazenda(m, e.id).z], [e.x, e.z], e.id);
  // a missão segue de onde estava, e nenhuma das do começo humilde aparece
  assert.equal(missaoAtual(m).missao.id, 'preparar-a-terra');
  assert.equal(missaoAtual(m).conta, 3);
  const vistas = m.dados.missoes.vizinho.filter((x) => x.comeco === 'humilde').map((x) => x.id);
  m.missoes.feitas = m.dados.missoes.vizinho.slice(0, 8).map((x) => x.id).filter((id) => !vistas.includes(id));
  assert.equal(missaoAtual(m).missao.id, 'vender-na-banca');
  // vender: a banca leva o cesto inteiro na hora, como antes
  const ev = ouvirTudo(m);
  m.posses.cesto.itens.alface = 6;
  tocarEm(m, 'banca'); ateParar(m);
  assert.deepEqual(ev.de('vendeuTudo'), [{ n: 6, ouro: 6 * m.dados.itens.alface.venda, entidade: 'banca' }]);
  assert.ok(m.missoes.feitas.includes('vender-na-banca'));
  // e gravando de novo, continua a fazenda de antes
  const n = Mundo.carregar(m.dados, copia(m.salvar()));
  assert.equal(ehHumilde(n), false);
  assert.ok(!tipos(n).includes('vizinho') && tipos(n).includes('celeiro') && tipos(n).includes('quadro-de-pedidos'));
});

test('gravação de antes, mais adiante (nível 5): o celeiro com os móveis, o quadro com os pedidos, a banca; o estoque é o de antes', () => {
  const g = velha('antes-nivel-5');
  const m = Mundo.carregar(dadosDeVerdade(), g);
  assert.equal(m.progresso.nivel, 5);
  assert.ok(estaPronta(naFazenda(m, 'celeiro')));
  assert.deepEqual(m.construcao.todas.filter((e) => e.local === 'celeiro').map((e) => e.tipo).sort(), ['bau', 'prateleira-simples', 'suporte-de-ferramentas']);
  assert.equal(m.pedidos.vagas.filter((v) => v.pedido).length, g.sistemas.pedidos.vagas.filter((v) => v.pedido).length);
  assert.equal(naFazenda(m, 'banca').tipo, 'banca');
  assert.equal(m.posses.cesto.itens.alface, 3);
  assert.ok(capacidadeDe(m, 'produtos') >= 60 + 40, 'a prateleira e a despensa da casa');
  assert.equal(m.comeco.esperaDosPedidos, 1);
});

// ---------------------------------------------------------------------------------------------------------------
test('o atalho de teste: pular de nível dá o que um jogador daquele nível já teria construído e reformado', () => {
  const casos = [
    [5, { celeiro: true, quadro: true, poco: 'poco', banca: 'banca', casa: 'casa-velha', cerca: 'cerca-de-arame' }],
    [9, { celeiro: true, quadro: true, poco: 'poco', banca: 'banca', casa: 'casa', cerca: 'cerca-de-madeira' }],
    [12, { celeiro: true, quadro: true, poco: 'poco', banca: 'banca', casa: 'casa', cerca: 'cerca-de-madeira' }],
    [16, { celeiro: true, quadro: true, poco: 'poco', banca: 'banca', casa: 'casa', cerca: 'cerca-de-madeira' }],
  ];
  for (const [nivel, quer] of casos) {
    const m = novo();
    m.comando({ tipo: 'comecarChegada' });
    const r = m.comando({ tipo: 'atalhoDeTeste', nivel });
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.ok(m.comeco.chegou && !m.comeco.chegada, `nível ${nivel}: a cena acabou`);
    assert.equal(construcoesDe(m, 'celeiro').length === 1, quer.celeiro, `nível ${nivel}: celeiro`);
    assert.equal(construcoesDe(m, 'quadro-de-pedidos').length === 1, quer.quadro, `nível ${nivel}: quadro`);
    for (const id of ['poco', 'banca', 'casa']) assert.equal(naFazenda(m, id).tipo, quer[id], `nível ${nivel}: ${id}`);
    assert.ok(['celeiro', 'quadro-de-pedidos', 'poco', 'banca', 'casa'].every((id) => estaPronta(naFazenda(m, id))), `nível ${nivel}: tudo pronto`);
    assert.equal(m.comeco.cerca.tipo, quer.cerca, `nível ${nivel}: cerca`);
    // nada se sobrepõe
    const loc = m.locais.fazenda, vistos = new Map();
    for (const e of m.construcao.todas.filter((x) => x.local === 'fazenda')) for (let z = e.z; z < e.z + e.p; z++) for (let x = e.x; x < e.x + e.l; x++) {
      const k = loc.i(x, z);
      assert.ok(!vistos.has(k), `nível ${nivel}: ${e.id} em cima de ${vistos.get(k)}`); vistos.set(k, e.id);
    }
  }
  // nível 2: só o celeiro e o poço
  const m = novo();
  m.comando({ tipo: 'atalhoDeTeste', nivel: 2 });
  assert.equal(construcoesDe(m, 'celeiro').length, 1); assert.equal(construcoesDe(m, 'quadro-de-pedidos').length, 0);
  assert.equal(naFazenda(m, 'poco').tipo, 'poco'); assert.equal(naFazenda(m, 'banca').tipo, 'caixote-de-venda');
});
