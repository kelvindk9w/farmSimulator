// Comprar lote e limpar a terra: a placa abre a compra, o lote vira terra própria; foice, machado e picareta tiram
// mato, toco e pedra com a força e a área dos dados; a gravação guarda o que foi comprado e o que foi limpo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, dadosDeTeste, ateParar, ouvirTudo, modo, tocar, tocarEm } from './apoio.mjs';
import { comTerras, mundoDasTerras, darFerramenta, porObstaculo } from './apoio-terras.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { ARADA } from '../src/nucleo/local.js';
import { descreverEntidade } from '../src/nucleo/sistemas/personagem.js';
import { situacaoDoLote, situacaoDosLotes } from '../src/nucleo/sistemas/lotes.js';
import { loteDe } from '../src/nucleo/sistemas/terras.js';
import { golpesQueFaltam, obstaculoPerto, temFerramentaDeLimpar, alcancaObstaculo } from '../src/nucleo/sistemas/limpeza.js';
import { missaoPossivel, missaoAtual } from '../src/nucleo/sistemas/missoes.js';
import { guiaDaMissao } from '../src/nucleo/guia.js';
import { EVENTOS } from '../src/nucleo/registro.js';

const TERRA_NOVA = { id: 'terra-nova', titulo: 'Terra nova', fala: 'Compre o lote do leste.', objetivo: { evento: 'comprou', filtro: { lote: 'lote-leste' }, n: 1 }, valeJaTer: true, recompensa: { ouro: 3 } };
const ROCAR = { id: 'rocar', titulo: 'Roçar', fala: 'Roce dois matos.', objetivo: { evento: 'limpou', filtro: { obstaculo: 'mato' }, n: 2 }, recompensa: { ouro: 4 } };

// ---------- lotes ----------
test('comprar lote: pede nível e ouro; pago, a terra vira própria, a placa some e ela anda lá', () => {
  const m = mundoDasTerras(), loc = m.local, ev = ouvirTudo(m), lote = loteDe(m, 'lote-leste');
  assert.equal(situacaoDoLote(m, lote).estado, 'nivel', 'o lote pede o nível 2');
  let r = m.comando({ tipo: 'comprarLote', lote: 'lote-leste' });
  assert.equal(r.ok, false); assert.equal(r.motivo, 'nivel-baixo'); assert.equal(r.dados.nivel, 2);
  m.progresso.nivel = 2;
  assert.equal(situacaoDoLote(m, lote).estado, 'ouro'); assert.equal(situacaoDoLote(m, lote).falta, 80);
  r = m.comando({ tipo: 'comprarLote', lote: 'lote-leste' });
  assert.equal(r.motivo, 'sem-ouro'); assert.equal(r.dados.falta, 80);
  assert.equal(ev.de('faltou').at(-1).motivo, 'sem-ouro');
  assert.equal(loc.ehPropria(21, 10), false);
  m.posses.ouro = 130;
  assert.equal(situacaoDoLote(m, lote).estado, 'pode');
  ev.limpar();
  r = m.comando({ tipo: 'comprarLote', lote: 'lote-leste' });
  assert.equal(r.ok, true);
  assert.equal(m.posses.ouro, 30);
  assert.equal(loc.ehPropria(21, 10), true); assert.equal(loc.ehPropria(23, 19), true);
  assert.equal(loc.porId['placa-lote-leste'], undefined, 'a placa sai');
  const c = ev.de('comprou')[0];
  assert.equal(c.lote, 'lote-leste'); assert.equal(c.classe, 'lote'); assert.equal(c.ouro, 100); assert.equal(c.n, 1);
  assert.ok(ev.de('chaoMudou').some((d) => d.tudo), 'o chão é redesenhado');
  assert.equal(situacaoDosLotes(m)[0].estado, 'comprado');
  assert.equal(m.comando({ tipo: 'comprarLote', lote: 'lote-leste' }).motivo, 'lote-ja-comprado');
  assert.equal(m.comando({ tipo: 'comprarLote', lote: 'nao-existe' }).motivo, 'lote-desconhecido');
  // anda até uma casa livre do lote novo (o caminho passa a valer lá)
  let livre = null;
  for (let z = 5; z < 19 && !livre; z++) for (let x = 21; x < 23 && !livre; x++) if (loc.andavel(x, z)) livre = [x, z];
  assert.ok(livre, 'devia haver casa livre no lote');
  assert.equal(m.comando({ tipo: 'irPara', x: livre[0] + 0.5, z: livre[1] + 0.5 }).ok, true);
  ateParar(m);
  assert.ok(Math.hypot(m.personagem.x - livre[0] - 0.5, m.personagem.z - livre[1] - 0.5) < 0.05, 'ela chegou ao lote');
});

test('lote que exige outro só libera depois dele; o lote dá a experiência dos dados', () => {
  const m = mundoDasTerras((b) => { b.terras.lotes[0].xp = 7; b.terras.lotes.push({ id: 'lote-norte', nome: 'Norte', area: [4, 0, 20, 4], preco: 50, nivel: 1, exige: ['lote-leste'] }); });
  m.posses.ouro = 500; m.progresso.nivel = 2;
  const norte = loteDe(m, 'lote-norte');
  assert.deepEqual(situacaoDoLote(m, norte).exige, ['Lote do leste']);
  const r = m.comando({ tipo: 'comprarLote', lote: 'lote-norte' });
  assert.equal(r.motivo, 'lote-exige'); assert.deepEqual(r.dados.exige, ['Lote do leste']);
  const xp = m.progresso.xp;
  assert.equal(m.comando({ tipo: 'comprarLote', lote: 'lote-leste' }).ok, true);
  assert.equal(m.progresso.xp, xp + 7);
  assert.equal(m.comando({ tipo: 'comprarLote', lote: 'lote-norte' }).ok, true);
  assert.equal(m.local.ehPropria(10, 1), true);
});

test('a missão de comprar o lote vale, cumpre com a compra e com "valeJaTer"; o guia aponta a placa', () => {
  const dados = dadosDeTeste((b) => { comTerras(b); b.missoes.vizinho = [TERRA_NOVA, ...b.missoes.vizinho]; });
  const m = new Mundo(dados, { agora: 1 }), ev = ouvirTudo(m);
  assert.ok(EVENTOS.comprou.campos.includes('lote'));
  assert.equal(missaoPossivel(m, TERRA_NOVA), true, 'o filtro por lote passou a ser aceito');
  assert.equal(missaoPossivel(m, { objetivo: { evento: 'comprou', filtro: { lote: 'lote-da-lua' } } }), false, 'lote que não existe não vale');
  assert.equal(missaoPossivel(m, { objetivo: { evento: 'comprou', filtro: { classe: 'lote' } } }), true);
  assert.equal(missaoAtual(m).missao.id, 'terra-nova');
  const g = guiaDaMissao(m, {});
  assert.equal(g.tipo, 'entidade'); assert.equal(g.id, 'placa-lote-leste');
  m.posses.ouro = 200; m.progresso.nivel = 2;
  m.comando({ tipo: 'comprarLote', lote: 'lote-leste' });
  assert.equal(ev.de('missaoConcluida')[0].id, 'terra-nova');
  // quem comprou antes de o vizinho pedir não fica preso
  const m2 = new Mundo(dadosDeTeste((b) => { comTerras(b); b.missoes.vizinho = [b.missoes.vizinho[0], TERRA_NOVA]; }), { agora: 1 }), ev2 = ouvirTudo(m2);
  m2.posses.ouro = 200; m2.progresso.nivel = 2;
  m2.comando({ tipo: 'comprarLote', lote: 'lote-leste' });
  assert.equal(ev2.de('missaoConcluida').length, 0);
  m2.missoes.feitas.push('arar-2');
  m2.avancar(1.1);
  assert.equal(ev2.de('missaoConcluida')[0].id, 'terra-nova'); assert.equal(ev2.de('missaoConcluida')[0].jaTinha, true);
});

// ---------- limpar ----------
test('sem a ferramenta, o toque no mato diz o que falta; em terra à venda, que a terra não é dela', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m);
  porObstaculo(m, 'mato', 12, 12);
  assert.equal(temFerramentaDeLimpar(m), false);
  const r = tocarEm(m, 'mato-12-12');
  assert.equal(r.ok, false); assert.equal(r.motivo, 'sem-ferramenta-de-limpar'); assert.equal(r.dados.funcao, 'foice');
  assert.equal(ev.de('faltou')[0].motivo, 'sem-ferramenta-de-limpar');
  const fora = m.local.entidades.find((e) => e.tipo === 'mato' && !m.local.ehPropria(e.x, e.z));
  assert.equal(descreverEntidade(m, fora.id).texto, 'terra-a-venda');
});

test('um toque no mato faz a cadeia: busca a foice no suporte, roça, rende fibra na bolsa (não no cesto) e dá experiência', () => {
  const m = mundoDasTerras((b) => { b.regras.inicio.vagasNoCinto = 2; }), ev = ouvirTudo(m);
  m.posses.ferramentas.foice = { onde: 'suporte', agua: 0, usos: 0, vez: 0 };
  porObstaculo(m, 'mato', 12, 12);
  const d = descreverEntidade(m, 'mato-12-12');
  assert.equal(d.acao, 'rocar'); assert.equal(d.dados.golpes, 1);
  assert.equal(tocarEm(m, 'mato-12-12').ok, true);
  assert.equal(tocarEm(m, 'mato-12-12').repetida, true, 'o toque repetido não enfileira de novo');
  ateParar(m);
  assert.deepEqual(ev.tipos().filter((t) => ['pegouFerramenta', 'limpou'].includes(t)), ['pegouFerramenta', 'limpou']);
  assert.equal(m.local.porId['mato-12-12'], undefined);
  assert.equal(m.local.andavel(12, 12), true, 'a casa fica livre');
  assert.deepEqual(m.posses.bolsa.fibra, 1);
  assert.deepEqual(m.posses.cesto.itens, {}, 'material não ocupa o cesto da colheita');
  const l = ev.de('limpou')[0];
  assert.equal(l.obstaculo, 'mato'); assert.equal(l.x, 12); assert.equal(l.z, 12); assert.deepEqual(l.itens, { fibra: 1 });
  assert.equal(m.progresso.xp, 1);
  // a casa limpa pode ser arada
  modo(m, 'enxada'); tocar(m, 12, 12); ateParar(m);
  assert.equal(m.local.chao[m.local.i(12, 12)], ARADA);
});

test('toco e pedra pedem vários golpes (resistência / força) num toque só; ferramenta mais forte bate menos', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m);
  darFerramenta(m, 'machado'); darFerramenta(m, 'picareta');
  porObstaculo(m, 'toco', 12, 12); porObstaculo(m, 'pedra', 14, 12);
  assert.equal(golpesQueFaltam(m, m.local.porId['toco-12-12']), 3);
  tocarEm(m, 'toco-12-12'); tocarEm(m, 'pedra-14-12');
  ateParar(m);
  assert.equal(ev.de('golpeou').length, 4, 'dois golpes antes do último, em cada um');
  assert.deepEqual(ev.de('limpou').map((d) => d.obstaculo), ['toco', 'pedra']);
  assert.equal(m.posses.bolsa.madeira, 2); assert.equal(m.posses.bolsa.pedra, 2);
  assert.equal(m.posses.ferramentas.machado.usos, 3, 'cada golpe é um uso da ferramenta');
  assert.equal(m.progresso.xp, 6);
  // com o machado de ferro (força 2), dois golpes
  m.posses.ouro = 100;
  assert.equal(m.comando({ tipo: 'comprar', item: 'machado-de-ferro' }).ok, true);
  porObstaculo(m, 'toco', 12, 14);
  assert.equal(golpesQueFaltam(m, m.local.porId['toco-12-14']), 2);
  ev.limpar(); tocarEm(m, 'toco-12-14'); ateParar(m);
  assert.equal(ev.de('golpeou').length, 1); assert.equal(ev.de('limpou').length, 1);
});

test('árvore do mato pede machado mais forte (forcaMinima): com o velho, o toque explica', () => {
  const m = mundoDasTerras();
  darFerramenta(m, 'machado');
  porObstaculo(m, 'mata', 12, 12);
  const r = tocarEm(m, 'mata-12-12');
  assert.equal(r.ok, false); assert.equal(r.motivo, 'ferramenta-fraca'); assert.equal(r.dados.funcao, 'machado');
  darFerramenta(m, 'machado-de-ferro');
  assert.equal(descreverEntidade(m, 'mata-12-12').acao, 'cortar');
  assert.equal(descreverEntidade(m, 'mata-12-12').dados.golpes, 4);
  tocarEm(m, 'mata-12-12'); ateParar(m);
  assert.equal(m.posses.bolsa.madeira, 6);
});

test('foice com área leva o mato vizinho na mesma passada; o que vai de carona não entra duas vezes na fila', () => {
  const m = mundoDasTerras(), ev = ouvirTudo(m);
  darFerramenta(m, 'foice-de-ferro');
  for (const x of [11, 12, 13, 14]) porObstaculo(m, 'mato', x, 12);
  const d = descreverEntidade(m, 'mato-12-12');
  assert.equal(d.acao, 'rocar');
  assert.deepEqual(d.casas, [[12, 12], [13, 12], [11, 12]], 'a foice de ferro alcança 3 casas');
  assert.equal(tocarEm(m, 'mato-12-12').ok, true);
  assert.equal(tocarEm(m, 'mato-13-12').repetida, true, 'o vizinho já vai junto');
  assert.equal(tocarEm(m, 'mato-14-12').ok, true);
  ateParar(m);
  assert.equal(ev.de('limpou').length, 4);
  assert.equal(m.posses.bolsa.fibra, 4);
  assert.equal(m.posses.ferramentas['foice-de-ferro'].usos, 2, 'duas passadas para quatro matos');
});

test('mato fechado por outros obstáculos: o toque diz para limpar antes o caminho; aberto o caminho, ele sai', () => {
  const m = mundoDasTerras(), loc = m.local, ev = ouvirTudo(m);
  darFerramenta(m, 'foice'); darFerramenta(m, 'picareta');
  const meio = porObstaculo(m, 'mato', 14, 16);
  const cerca = [[13, 16], [15, 16], [14, 15], [14, 17]].map(([x, z]) => porObstaculo(m, 'pedra', x, z));
  assert.equal(alcancaObstaculo(m, meio), false); assert.equal(alcancaObstaculo(m, cerca[0]), true);
  // o guia não aponta o que está fechado
  assert.equal(obstaculoPerto(m, ['mato']), null);
  tocarEm(m, meio.id); ateParar(m);
  assert.ok(loc.porId[meio.id], 'fechado, o mato fica');
  assert.equal(ev.de('faltou').at(-1).motivo, 'caminho-fechado');
  assert.equal(ev.de('faltou').filter((d) => d.motivo === 'sem-caminho').length, 0);
  // uma pedra a menos e o mato fica ao alcance: na mesma fila, um depois do outro
  tocarEm(m, cerca[0].id); tocarEm(m, meio.id); ateParar(m);
  assert.ok(!loc.porId[cerca[0].id] && !loc.porId[meio.id]);
  assert.equal(obstaculoPerto(m, ['mato']), null);
});

test('modo limpar: arrastar o dedo pinta vários obstáculos; nos outros modos o arrasto não mexe neles', () => {
  const m = mundoDasTerras();
  darFerramenta(m, 'foice');
  for (const x of [11, 12, 13]) porObstaculo(m, 'mato', x, 12);
  modo(m, 'enxada');
  assert.equal(m.comando({ tipo: 'tocarCasa', x: 11.5, z: 12.5, arrasto: true }).ok, false);
  assert.equal(m.personagem.fila.length, 0);
  assert.equal(modo(m, 'limpar').ok, true);
  for (const x of [11, 12, 13]) assert.equal(m.comando({ tipo: 'tocarCasa', x: x + 0.5, z: 12.5, arrasto: true }).ok, true);
  assert.equal(m.personagem.fila.length, 3);
  ateParar(m);
  assert.equal(m.posses.bolsa.fibra, 3);
  // o botão do modo só existe para quem tem ferramenta de limpar, e a roda de modos pula o que não está disponível
  const m2 = mundoDasTerras();
  modo(m2, 'regar'); m2.comando({ tipo: 'trocarModo', passo: 1 });
  assert.equal(m2.modo.id, 'mao', 'sem foice, depois de regar a roda volta para a mão');
  darFerramenta(m2, 'foice');
  modo(m2, 'regar'); m2.comando({ tipo: 'trocarModo', passo: 1 });
  assert.equal(m2.modo.id, 'limpar');
});

test('a missão de limpar vale e conta por obstáculo; o guia aponta o mato mais perto', () => {
  const dados = dadosDeTeste((b) => { comTerras(b); b.missoes.vizinho = [ROCAR]; });
  const m = new Mundo(dados, { agora: 1 }), ev = ouvirTudo(m);
  assert.equal(missaoPossivel(m, ROCAR), true);
  darFerramenta(m, 'foice');
  porObstaculo(m, 'mato', 12, 12); porObstaculo(m, 'mato', 16, 16); porObstaculo(m, 'toco', 11, 11);
  assert.equal(obstaculoPerto(m, ['mato']).id, 'mato-12-12');
  const g = guiaDaMissao(m, {});
  assert.equal(g.tipo, 'entidade'); assert.equal(g.id, 'mato-12-12');
  tocarEm(m, g.id);
  assert.equal(guiaDaMissao(m, {}).id, 'mato-16-16', 'o que já está na fila não é apontado de novo');
  tocarEm(m, 'mato-16-16'); ateParar(m);
  assert.equal(ev.de('missaoConcluida')[0].id, 'rocar');
});

// ---------- gravação ----------
test('gravar e carregar: lote comprado e casas limpas voltam; o resto do mapa renasce igual', () => {
  const muda = (b) => { b.terras.inicial.limpo = [8, 8, 16, 16]; b.terras.inicial.natureza = { mato: 0.5 }; };
  const m = mundoDasTerras(muda), loc = m.local;
  if (m.terras.aviso) return; // o sorteio fechou o caminho e a área nasceu limpa: nada a testar aqui
  darFerramenta(m, 'foice');
  m.posses.ouro = 500; m.progresso.nivel = 2;
  m.comando({ tipo: 'comprarLote', lote: 'lote-leste' });
  const alvo = obstaculoPerto(m, ['mato']);
  tocarEm(m, alvo.id); ateParar(m);
  assert.equal(loc.porId[alvo.id], undefined);
  const antes = loc.entidades.filter((e) => e.tipo === 'mato').length;
  const texto = JSON.stringify(m.salvar());
  const m2 = Mundo.carregar(dadosDeTeste((b) => { comTerras(b); muda(b); }), JSON.parse(texto));
  assert.deepEqual(m2.terras.lotes, ['lote-leste']);
  assert.equal(m2.local.ehPropria(21, 10), true, 'o lote continua dela');
  assert.equal(m2.local.porId['placa-lote-leste'], undefined);
  assert.equal(m2.local.porId[alvo.id], undefined, 'o mato roçado não volta');
  assert.equal(m2.local.andavel(alvo.x, alvo.z), true);
  assert.equal(m2.local.entidades.filter((e) => e.tipo === 'mato').length, antes);
  assert.deepEqual(m2.salvar().sistemas.terras, m.salvar().sistemas.terras);
});

test('uma gravação do marco M1 (sem lotes, sem limpeza, sem árvores, sem desgaste) abre e joga', () => {
  const m = novoMundo();
  modo(m, 'enxada'); tocar(m, 12, 13); ateParar(m);
  const g = m.salvar();
  // como o M1 gravava: terras só com a lista de lotes, e nada dos sistemas novos
  g.sistemas.terras = { lotes: [] };
  for (const id of ['lotes', 'limpeza', 'desgaste', 'arvores', 'aspersor']) delete g.sistemas[id];
  const m2 = Mundo.carregar(dadosDeTeste(comTerras), JSON.parse(JSON.stringify(g)));
  assert.equal(m2.local.chao[m2.local.i(12, 13)], ARADA, 'a lavoura gravada voltou');
  assert.deepEqual(m2.terras, { lotes: [], limpos: [] });
  assert.deepEqual(m2.arvores.todas, []);
  assert.ok(m2.local.porId['placa-lote-leste'], 'o lote continua à venda');
  // e os sistemas novos funcionam nela
  m2.posses.ouro = 500; m2.progresso.nivel = 2;
  assert.equal(m2.comando({ tipo: 'comprarLote', lote: 'lote-leste' }).ok, true);
  darFerramenta(m2, 'foice'); porObstaculo(m2, 'mato', 12, 11);
  tocarEm(m2, 'mato-12-11'); ateParar(m2);
  assert.equal(m2.posses.bolsa.fibra, 1);
  assert.doesNotThrow(() => Mundo.carregar(dadosDeTeste(comTerras), JSON.parse(JSON.stringify(m2.salvar()))));
});
