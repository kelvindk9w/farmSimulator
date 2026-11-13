// Construir: custo, obra com relógio, mudar de lugar, guardar, ampliar, cercas e caminhos, gravação e o contrato
// que as outras frentes usam (comportamento, construcoesDe, estaPronta, o toque que abre painel).
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, dadosDeTeste, ateParar, ouvirTudo, tocarEm, tocar, modo, arar, pular, porConstrucao, rico } from './apoio.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { TIPOS } from '../src/nucleo/registro.js';
import { CAMINHO, GRAMA, ARADA } from '../src/nucleo/local.js';
import { CONCLUIVEIS } from '../src/nucleo/concluir.js';
import { darXp } from '../src/nucleo/sistemas/niveis.js';
import { missaoAtual } from '../src/nucleo/sistemas/missoes.js';
import { comportamento, construcoesDe, estaPronta, temPronta, construcaoPorId, valorDe, faltaDaObra, andamentoDaObra, lugarServe, podeConstruir, podePagar, planejadas, quantasGuardadas, darConstrucao, proximaAmpliacao, PISO, SOLEIRA } from '../src/nucleo/sistemas/construcao.js';

const construir = (m, id, x, z, mais = {}) => m.comando({ tipo: 'construir', id, x, z, ...mais });
const MAT = { madeira: 30, tabua: 30, prego: 30, pedra: 30 };
// um mundo com ouro, material e a bancada já pronta em (16, 16)
function comBancada(muda) { const m = rico(novoMundo(muda), MAT); porConstrucao(m, 'bancada-de-carpintaria', 16, 16); return m; }

test('os dados de construção chegam prontos e cada id ganha um tipo de entidade', () => {
  const m = novoMundo(), D = m.dados.construcoes;
  assert.deepEqual(D.galinheiro.casas, [3, 3]);
  assert.deepEqual(D.galinheiro.custo, { ouro: 20, cash: 0, itens: { tabua: 2, prego: 4 } });
  assert.equal(D['caminho-de-pedra'].bloqueia, false); assert.equal(D['caminho-de-pedra'].plano, true);
  assert.equal(D['cerca-de-madeira'].bloqueia, true); assert.equal(D['canteiro-de-flores'].limite, 0);
  for (const id in D) assert.ok(TIPOS[id], `tipo de entidade para "${id}"`);
  assert.deepEqual(TIPOS.galinheiro.casas, [3, 3]);
  assert.equal(TIPOS['caminho-de-pedra'].bloqueia, false);
});

test('o mundo novo já traz as construções da fazenda na lista e o celeiro por dentro com os móveis do começo', () => {
  const m = novoMundo();
  assert.deepEqual(m.construcao.todas.filter((e) => e.local === 'fazenda').map((e) => e.tipo).sort(), ['banca', 'casa', 'celeiro', 'poco']);
  assert.equal(construcoesDe(m, 'celeiro').length, 1);
  assert.ok(estaPronta(construcoesDe(m, 'celeiro')[0]));
  const dentro = m.locais.celeiro;
  assert.ok(dentro, 'o local "celeiro" existe');
  assert.deepEqual(dentro.piso, [6, 4]);
  assert.equal(dentro.chaoEm(0, 0), PISO); assert.equal(dentro.chaoEm(2, 4), SOLEIRA);
  assert.ok(!dentro.andavel(0, 4), 'fora da soleira, a fileira da porta não é chão');
  assert.deepEqual(dentro.entidades.map((e) => [e.tipo, e.x, e.z]), [['suporte-de-ferramentas', 0, 0], ['prateleira-simples', 2, 0], ['bau', 4, 0]]);
  for (const e of dentro.entidades) { assert.equal(e.local, 'celeiro'); assert.ok(estaPronta(e)); assert.equal(e.nivel, 1); }
});

test('construir confere material, ouro, nível, o que exige, limite e o lugar, com um motivo claro para cada recusa', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  let r = construir(m, 'bancada-de-carpintaria', 12, 12);
  assert.equal(r.motivo, 'falta-material'); assert.deepEqual(r.dados, { item: 'madeira', precisa: 2, tem: 0, falta: 2, construcao: 'bancada-de-carpintaria' });
  assert.equal(ev.de('faltou')[0].motivo, 'falta-material');
  m.posses.bolsa.madeira = 2; m.posses.ouro = 5;
  r = construir(m, 'bancada-de-carpintaria', 12, 12);
  assert.equal(r.motivo, 'sem-ouro'); assert.equal(r.dados.falta, 7);
  rico(m, MAT);
  assert.equal(construir(m, 'galinheiro', 12, 12).motivo, 'nivel-baixo');
  assert.equal(construir(m, 'galinheiro', 12, 12).dados.nivel, 3);
  darXp(m, 30, 'teste');
  r = construir(m, 'galinheiro', 12, 12);
  assert.equal(r.motivo, 'exige'); assert.equal(r.dados.construcao, 'bancada-de-carpintaria');
  assert.equal(construir(m, 'nao-ha', 12, 12).motivo, 'nao-existe');
  assert.equal(construir(m, 'celeiro', 12, 12).motivo, 'nao-constroi');
  assert.equal(construir(m, 'fonte-de-pedra', 12, 12).motivo, 'so-com-cash');
  assert.equal(construir(m, 'prateleira-simples', 12, 12).motivo, 'so-no-celeiro', 'móvel é só dentro do celeiro');
  assert.equal(construir(m, 'canteiro-de-flores', 2, 2, { local: 'celeiro' }).motivo, 'so-na-fazenda');
  // o lugar
  assert.equal(construir(m, 'bancada-de-carpintaria', 9, 5).motivo, 'lugar-ocupado'); assert.equal(construir(m, 'bancada-de-carpintaria', 9, 5).dados.por, 'celeiro');
  assert.equal(construir(m, 'bancada-de-carpintaria', 19, 12).motivo, 'terra-a-venda', 'metade em terra à venda');
  assert.equal(construir(m, 'bancada-de-carpintaria', 24, 12).motivo, 'fora-do-mapa');
  assert.equal(construir(m, 'bancada-de-carpintaria', 12.5, 12).motivo, 'fora-do-mapa', 'só casas inteiras');
  assert.equal(m.construcao.todas.length, 7, 'nada foi construído');
  assert.equal(m.posses.ouro, 1005 + 15 + 30, 'só entrou o ouro dos níveis: nada foi gasto');
});

test('um toque manda construir: ela vai até lá, martela, paga na martelada e a obra corre no relógio', () => {
  const m = rico(novoMundo(), MAT), ev = ouvirTudo(m);
  const r = construir(m, 'bancada-de-carpintaria', 12, 12);
  assert.ok(r.ok); assert.ok(r.dados.naFila);
  assert.deepEqual(planejadas(m), [{ id: 'bancada-de-carpintaria', x: 12, z: 12, local: 'fazenda', giro: 0 }]);
  assert.equal(m.posses.ouro, 1020, 'ainda não pagou');
  assert.ok(construir(m, 'bancada-de-carpintaria', 12, 12).repetida, 'o mesmo pedido de novo não muda nada');
  assert.equal(construir(m, 'canteiro-de-flores', 13, 12).motivo, 'lugar-ocupado', 'o lugar já está prometido');
  ateParar(m);
  assert.equal(ev.de('comecouAcao')[0].acao, 'colocarConstrucao');
  assert.equal(m.posses.ouro, 1020 - 12); assert.equal(m.posses.bolsa.madeira, 28);
  const e = construcoesDe(m, 'bancada-de-carpintaria')[0];
  assert.ok(e, 'a obra nasceu'); assert.equal(e.x, 12); assert.equal(e.z, 12); assert.equal(e.l, 2); assert.equal(e.p, 1); assert.equal(e.local, 'fazenda'); assert.equal(e.nivel, 1);
  assert.ok(!estaPronta(e)); assert.ok(!temPronta(m, 'bancada-de-carpintaria'));
  assert.equal(m.locais.fazenda.entidadeEm(13, 12), e, 'em obra já ocupa o lugar');
  assert.deepEqual(ev.de('comecouObra').map((x) => [x.construcao, x.seg]), [['bancada-de-carpintaria', 20]]);
  const p = m.personagem;
  assert.ok(Math.abs(p.x - 12.5) <= 1.5 && Math.abs(p.z - 12.5) <= 1.5 && m.locais.fazenda.andavel(Math.floor(p.x), Math.floor(p.z)), 'ela ficou encostada na obra, do lado de fora');
  assert.equal(ev.de('construiu').length, 0);
  assert.equal(TIPOS[e.tipo].visual(m, e, {}).chave, 'objeto/bancada-de-carpintaria', 'a peça é a mesma: quem mostra a obra é o desenho (DESENHO.visual)');
  m.avancar(10);
  assert.ok(Math.abs(andamentoDaObra(m, e) - 0.5) < 0.1, 'a barra da obra vai pela metade');
  m.avancar(faltaDaObra(m, e) + 0.05);
  assert.ok(estaPronta(e)); assert.ok(temPronta(m, 'bancada-de-carpintaria'));
  assert.deepEqual(ev.de('construiu').map((x) => [x.construcao, x.entidade, x.classe, x.onde, x.n]), [['bancada-de-carpintaria', e.id, 'industria', 'fazenda', 1]]);
  assert.equal(m.progresso.xp, 4, 'a experiência da construção');
  assert.equal(TIPOS[e.tipo].visual(m, e, {}).chave, 'objeto/bancada-de-carpintaria');
  assert.equal(construir(m, 'bancada-de-carpintaria', 12, 15).motivo, 'limite');
});

test('cancelar antes da martelada não custa nada', () => {
  const m = rico(novoMundo(), MAT);
  construir(m, 'bancada-de-carpintaria', 16, 16);
  m.avancar(0.5);
  m.comando({ tipo: 'cancelar' });
  ateParar(m);
  assert.equal(m.posses.ouro, 1020); assert.equal(m.posses.bolsa.madeira, 30);
  assert.equal(construcoesDe(m, 'bancada-de-carpintaria').length, 0);
  assert.equal(planejadas(m).length, 0);
});

test('o material sai de onde estiver: bolsa, celeiro e cesto', () => {
  const m = novoMundo();
  m.posses.ouro = 100; m.posses.bolsa.madeira = 1; m.posses.celeiro.itens.madeira = 1;
  assert.ok(construir(m, 'bancada-de-carpintaria', 12, 12, { jaJa: true }).ok);
  assert.equal(m.posses.bolsa.madeira, undefined); assert.equal(m.posses.celeiro.itens.madeira, undefined);
});

test('a obra se resolve pelo relógio: fechar o jogo e voltar depois dá a construção pronta, sem simular', () => {
  const m = rico(novoMundo(), MAT);
  const id = construir(m, 'bancada-de-carpintaria', 12, 12, { jaJa: true }).dados.entidade;
  assert.ok(!estaPronta(construcaoPorId(m, id)));
  const gravado = JSON.parse(JSON.stringify(m.salvar()));
  const ev = ouvirTudo(m);
  pular(m, 3600);
  assert.ok(estaPronta(construcaoPorId(m, id)));
  assert.equal(ev.de('construiu').length, 1);
  // a gravação feita no meio da obra: abre ainda em obra e termina ao acertar o relógio
  const m2 = Mundo.carregar(dadosDeTeste(), gravado), ev2 = ouvirTudo(m2);
  const e2 = construcaoPorId(m2, id);
  assert.ok(e2 && !estaPronta(e2)); assert.equal(Math.round(faltaDaObra(m2, e2)), 20);
  m2.acertarRelogio(m2.agora + 21000);
  assert.ok(estaPronta(e2)); assert.equal(ev2.de('construiu').length, 1); assert.equal(m2.progresso.xp, 4);
});

test('concluir com cash: a obra está registrada como concluível', () => {
  const m = rico(novoMundo(), MAT), ev = ouvirTudo(m), c = CONCLUIVEIS.obra;
  const id = construir(m, 'bancada-de-carpintaria', 12, 12, { jaJa: true }).dados.entidade;
  assert.equal(Math.round(c.falta(m, id)), 20); assert.equal(c.nome(m, id), 'Bancada de carpintaria');
  assert.equal(c.falta(m, 'celeiro'), 0, 'o que está pronto não tem o que concluir');
  assert.equal(c.terminar(m, 'celeiro'), false);
  assert.equal(c.terminar(m, id), true);
  assert.ok(estaPronta(construcaoPorId(m, id))); assert.equal(ev.de('construiu').length, 1); assert.equal(c.falta(m, id), 0);
});

test('as missões de construir e de montar se cumprem; "valeJaTer" vale para quem já construiu', () => {
  const missoes = (b) => { b.missoes.vizinho = [
    { id: 'bancada', titulo: 'A bancada', objetivo: { evento: 'construiu', filtro: { construcao: 'bancada-de-carpintaria' }, n: 1 }, valeJaTer: true, recompensa: { ouro: 7 } },
    { id: 'prateleira', titulo: 'Prateleiras', objetivo: { evento: 'montou', filtro: { construcao: 'prateleira-simples' }, n: 1 }, recompensa: { ouro: 9 } },
    { id: 'curral', titulo: 'Coisa que não existe', objetivo: { evento: 'construiu', filtro: { construcao: 'curral' }, n: 1 }, recompensa: {} },
  ]; };
  const m = rico(novoMundo(missoes), MAT), ev = ouvirTudo(m);
  assert.equal(missaoAtual(m).missao.id, 'bancada');
  construir(m, 'bancada-de-carpintaria', 12, 12);
  ateParar(m); m.avancar(21);
  assert.deepEqual(ev.de('missaoConcluida').map((x) => x.id), ['bancada']);
  assert.equal(missaoAtual(m).missao.id, 'prateleira', 'a prateleira do começo não conta: é para montar mais uma');
  assert.ok(construir(m, 'prateleira-simples', 0, 2, { local: 'celeiro' }).ok);
  pular(m, 31);
  assert.deepEqual(ev.de('montou').map((x) => [x.construcao, x.onde]), [['prateleira-simples', 'celeiro']]);
  assert.equal(ev.de('construiu').length, 2, 'móvel montado também é construção pronta');
  assert.deepEqual(ev.de('missaoConcluida').map((x) => x.id), ['bancada', 'prateleira']);
  assert.equal(missaoAtual(m), null, 'missão de construção que este jogo não tem fica para depois, sem travar');
  // quem construiu antes de o vizinho pedir
  const m2 = rico(novoMundo(missoes), MAT);
  porConstrucao(m2, 'bancada-de-carpintaria', 12, 12);
  m2.avancar(1.1);
  assert.deepEqual(m2.missoes.feitas, ['bancada']);
});

test('enfeite nasce na hora, sem obra, e tem o seu próprio evento (não conta como construção)', () => {
  const m = rico(novoMundo(), MAT), ev = ouvirTudo(m);
  const r = construir(m, 'canteiro-de-flores', 12, 12);
  assert.ok(r.ok && r.dados.entidade, 'sem bancada e sem esperar');
  assert.ok(estaPronta(construcaoPorId(m, r.dados.entidade)));
  assert.equal(m.posses.ouro, 1015);
  assert.deepEqual(ev.de('enfeitou').map((x) => x.construcao), ['canteiro-de-flores']);
  assert.equal(ev.de('construiu').length, 0);
  assert.equal(construir(m, 'cerca-de-madeira', 14, 12).motivo, 'exige', 'a cerca pede a bancada');
});

test('mudar de lugar é de graça e a qualquer hora; lugar ruim é recusado e nada muda', () => {
  const m = comBancada(), ev = ouvirTudo(m), ouro = m.posses.ouro;
  const b = construcoesDe(m, 'bancada-de-carpintaria')[0];
  assert.equal(m.comando({ tipo: 'moverConstrucao', entidade: b.id, x: 9, z: 5 }).motivo, 'lugar-ocupado');
  assert.equal(m.comando({ tipo: 'moverConstrucao', entidade: b.id, x: 19, z: 16 }).motivo, 'terra-a-venda');
  assert.deepEqual([b.x, b.z], [16, 16]);
  assert.ok(m.comando({ tipo: 'moverConstrucao', entidade: b.id, x: 17, z: 16 }).ok, 'pode ficar por cima de onde ela mesma estava');
  assert.ok(m.comando({ tipo: 'moverConstrucao', entidade: b.id, x: 5, z: 14 }).ok);
  assert.deepEqual([b.x, b.z], [5, 14]);
  const loc = m.locais.fazenda;
  assert.equal(loc.entidadeEm(5, 14), b); assert.equal(loc.entidadeEm(6, 14), b); assert.equal(loc.entidadeEm(17, 16), null); assert.equal(loc.entidadeEm(18, 16), null);
  assert.equal(m.posses.ouro, ouro);
  assert.deepEqual(ev.de('moveuConstrucao').at(-1).antes, { x: 17, z: 16, l: 2, p: 1 });
  // as que já vêm na fazenda também mudam de lugar, e em obra também
  assert.ok(m.comando({ tipo: 'moverConstrucao', entidade: 'poco', x: 14, z: 14 }).ok);
  assert.equal(loc.entidadeEm(15, 15).id, 'poco');
  rico(m, {}, 0); darXp(m, 30, 'teste');
  const g = construcaoPorId(m, construir(m, 'galinheiro', 6, 16, { jaJa: true }).dados.entidade);
  assert.ok(m.comando({ tipo: 'moverConstrucao', entidade: g.id, x: 9, z: 16 }).ok);
  assert.ok(!estaPronta(g), 'continua em obra no lugar novo');
  // se ela estiver no caminho da construção, sai de baixo
  const p = m.personagem;
  assert.ok(m.comando({ tipo: 'moverConstrucao', entidade: b.id, x: 10, z: 10 }).ok);
  assert.ok(loc.andavel(Math.floor(p.x), Math.floor(p.z)), 'a personagem não ficou dentro da bancada');
});

test('enfeite e móvel se guardam e voltam sem pagar de novo; o resto só muda de lugar', () => {
  const m = comBancada(), ev = ouvirTudo(m);
  const id = construir(m, 'canteiro-de-flores', 12, 12).dados.entidade, ouro = m.posses.ouro;
  assert.equal(m.comando({ tipo: 'guardarConstrucao', entidade: 'celeiro' }).motivo, 'nao-guarda');
  assert.equal(m.comando({ tipo: 'guardarConstrucao', entidade: construcoesDe(m, 'bancada-de-carpintaria')[0].id }).motivo, 'nao-guarda');
  assert.ok(m.comando({ tipo: 'guardarConstrucao', entidade: id }).ok);
  assert.equal(quantasGuardadas(m, 'canteiro-de-flores'), 1);
  assert.equal(construcaoPorId(m, id), null); assert.equal(m.locais.fazenda.entidadeEm(12, 12), null);
  assert.ok(podePagar(m, 'canteiro-de-flores').dados.guardada);
  const r = construir(m, 'canteiro-de-flores', 14, 14);
  assert.ok(r.ok); assert.equal(m.posses.ouro, ouro, 'recolocar não custa'); assert.equal(quantasGuardadas(m, 'canteiro-de-flores'), 0);
  assert.equal(ev.de('enfeitou').length, 1, 'recolocar não conta como enfeite novo'); assert.equal(ev.de('recolocou').length, 1);
  // móvel: sai do celeiro e volta, sem obra de novo
  const bau = construcoesDe(m, 'bau')[0];
  assert.ok(m.comando({ tipo: 'guardarConstrucao', entidade: bau.id }).ok);
  assert.equal(m.locais.celeiro.entidades.length, 2);
  const de = construir(m, 'bau', 0, 3, { local: 'celeiro' });
  assert.ok(de.ok && estaPronta(construcaoPorId(m, de.dados.entidade)));
  assert.equal(ev.de('montou').length, 0);
  // em obra não se guarda
  const pr = construir(m, 'prateleira-simples', 4, 2, { local: 'celeiro' }).dados.entidade;
  assert.equal(m.comando({ tipo: 'guardarConstrucao', entidade: pr }).motivo, 'em-obra');
  // presente (loja de cash): cai no depósito e se põe sem pagar
  assert.equal(construir(m, 'fonte-de-pedra', 6, 12).motivo, 'so-com-cash');
  darConstrucao(m, 'fonte-de-pedra');
  assert.ok(construir(m, 'fonte-de-pedra', 6, 12).ok);
  assert.equal(m.posses.cash, 3);
});

test('cerca bloqueia e porteira não; nunca se fecha o caminho até uma construção nem se prende a personagem', () => {
  const m = comBancada(), loc = m.locais.fazenda, p = m.personagem;
  const cerca = (x, z) => construir(m, 'cerca-de-madeira', x, z);
  // um cercado de 3 por 3 em volta de (6, 13), com a personagem do lado de fora
  for (const [x, z] of [[5, 12], [6, 12], [7, 12], [5, 13], [7, 13], [5, 14], [7, 14]]) assert.ok(cerca(x, z).ok, `cerca em ${x},${z}`);
  assert.ok(!loc.andavel(6, 12));
  const r = cerca(6, 14);
  assert.equal(r.motivo, 'fecha-caminho', 'o último trecho isolaria o miolo do cercado');
  assert.ok(construir(m, 'porteira', 6, 14).ok, 'com porteira fecha');
  assert.ok(loc.andavel(6, 14), 'pela porteira se passa');
  assert.equal(loc.chaoEm(6, 14), CAMINHO, 'debaixo da porteira o chão é batido');
  // não dá para emparedar a personagem
  p.x = 15.5; p.z = 13.5;
  for (const [x, z] of [[14, 13], [16, 13], [15, 12]]) assert.ok(cerca(x, z).ok);
  assert.equal(cerca(15, 14).motivo, 'fecha-caminho');
  // nem tapar a porta do celeiro (a casa de onde se chega nele)
  const cel = loc.porId.celeiro, porta = [Math.floor(cel.x + cel.l / 2), cel.z + cel.p];
  assert.equal(cerca(porta[0], porta[1]).motivo, 'fecha-caminho');
  assert.equal(cerca(porta[0], porta[1]).dados.construcao, 'celeiro');
  // construção grande num beco: ela mesma ficaria sem acesso
  assert.equal(lugarServe(m, 'cerca-de-madeira', 6, 13).ok, true, 'dentro do cercado com porteira pode');
});

test('calçamento não bloqueia, não tapa a porteira e a enxada não ara em cima dele; tirado, a grama volta', () => {
  const m = comBancada(), loc = m.locais.fazenda, ev = ouvirTudo(m);
  arar(m, [[12, 12]]);
  assert.equal(loc.chaoEm(12, 12), ARADA);
  const id = construir(m, 'caminho-de-pedra', 12, 12).dados.entidade;
  assert.ok(id); assert.ok(loc.andavel(12, 12)); assert.equal(loc.entidadeEm(12, 12), null);
  assert.equal(loc.chaoEm(12, 12), CAMINHO, 'a terra arada vira chão batido debaixo da pedra');
  assert.ok(ev.de('chaoMudou').some((c) => c.x === 12 && c.z === 12));
  assert.equal(construir(m, 'caminho-de-pedra', 12, 12).motivo, 'lugar-ocupado', 'calçamento sobre calçamento não');
  assert.equal(construir(m, 'canteiro-de-flores', 12, 12).motivo, 'lugar-ocupado', 'nem coisa que bloqueia em cima dele');
  assert.ok(construir(m, 'porteira', 12, 12).ok, 'a porteira pode ficar sobre o calçamento');
  modo(m, 'enxada');
  tocar(m, 12, 12); ateParar(m);
  assert.equal(loc.chaoEm(12, 12), CAMINHO, 'não se ara o calçamento');
  // plantação não se cobre
  arar(m, [[14, 14]]); modo(m, 'semear', 'semente-rabanete'); tocar(m, 14, 14); ateParar(m);
  assert.equal(construir(m, 'caminho-de-pedra', 14, 14).motivo, 'tem-planta');
  // guardar: o chão só volta a ser grama quando a porteira também sai
  assert.ok(m.comando({ tipo: 'guardarConstrucao', entidade: id }).ok);
  assert.equal(loc.chaoEm(12, 12), CAMINHO);
  assert.ok(m.comando({ tipo: 'guardarConstrucao', entidade: construcoesDe(m, 'porteira')[0].id }).ok);
  assert.equal(loc.chaoEm(12, 12), GRAMA);
  // sobre o caminho de terra do mapa, tirar o calçamento deixa o caminho como era
  assert.equal(loc.chaoEm(6, 9), CAMINHO);
  const c2 = construir(m, 'caminho-de-pedra', 6, 9).dados.entidade;
  m.comando({ tipo: 'guardarConstrucao', entidade: c2 });
  assert.equal(loc.chaoEm(6, 9), CAMINHO);
  // construção sobre terra arada: a terra volta a ser grama (não fica canteiro escondido debaixo dela)
  arar(m, [[8, 16]]);
  construir(m, 'canteiro-de-flores', 8, 16);
  assert.equal(loc.chaoEm(8, 16), GRAMA);
});

test('ampliar: cobra, corre no relógio e muda o que a construção oferece', () => {
  const m = comBancada(), ev = ouvirTudo(m);
  darXp(m, 30, 'teste');
  const g = porConstrucao(m, 'galinheiro', 6, 12), ouro = m.posses.ouro;
  assert.equal(valorDe(m, g, 'vagas'), 4); assert.equal(proximaAmpliacao(m, g).nome, 'Galinheiro para 8');
  m.posses.bolsa.tabua = 3;
  assert.equal(m.comando({ tipo: 'ampliar', entidade: g.id }).motivo, 'falta-material');
  m.posses.bolsa.tabua = 10;
  const r = m.comando({ tipo: 'ampliar', entidade: g.id });
  assert.ok(r.ok); assert.equal(r.dados.seg, 200);
  assert.equal(m.posses.ouro, ouro - 50); assert.equal(m.posses.bolsa.tabua, 6);
  assert.equal(valorDe(m, g, 'vagas'), 4, 'só muda quando a ampliação fica pronta');
  assert.ok(estaPronta(g), 'a construção continua valendo durante a ampliação');
  assert.equal(m.comando({ tipo: 'ampliar', entidade: g.id }).motivo, 'em-obra');
  assert.equal(Math.round(CONCLUIVEIS.obra.falta(m, g.id)), 200, 'ampliação também se conclui com cash');
  pular(m, 201);
  assert.equal(g.nivel, 2); assert.equal(valorDe(m, g, 'vagas'), 8);
  assert.deepEqual(ev.de('ampliou').map((x) => [x.construcao, x.degrau]), [['galinheiro', 1]]);
  assert.equal(m.comando({ tipo: 'ampliar', entidade: g.id }).motivo, 'sem-ampliacao');
  // ampliação sem obra, paga com cash (vaga de fila da bancada)
  const b = construcoesDe(m, 'bancada-de-carpintaria')[0];
  assert.equal(valorDe(m, b, 'fila'), 2);
  const cash = m.posses.cash;
  assert.ok(m.comando({ tipo: 'ampliar', entidade: b.id, cash: true }).ok);
  assert.equal(m.posses.cash, cash - 2); assert.equal(valorDe(m, b, 'fila'), 3);
  // nível baixo
  const m2 = comBancada();
  assert.equal(m2.comando({ tipo: 'ampliar', entidade: 'celeiro' }).motivo, 'nivel-baixo');
});

test('ampliar o celeiro aumenta o piso de dentro e os móveis ficam onde estavam', () => {
  const m = comBancada();
  darXp(m, 10, 'teste');
  const antes = m.locais.celeiro.entidades.map((e) => [e.id, e.x, e.z]);
  assert.ok(m.comando({ tipo: 'ampliar', entidade: 'celeiro' }).ok);
  assert.deepEqual(m.locais.celeiro.piso, [6, 4]);
  pular(m, 101);
  const dentro = m.locais.celeiro;
  assert.deepEqual(dentro.piso, [8, 5]);
  assert.deepEqual(dentro.entidades.map((e) => [e.id, e.x, e.z]), antes);
  assert.equal(dentro.entidadeEm(2, 0).tipo, 'prateleira-simples');
  assert.ok(lugarServe(m, 'bau', 6, 4).ok, 'o piso novo já serve');
  assert.equal(lugarServe(m, 'bau', 3, 5).motivo, 'na-porta');
  // grava e carrega com o celeiro ampliado e um móvel no pedaço novo
  porConstrucao(m, 'bau', 6, 4);
  const m2 = Mundo.carregar(dadosDeTeste(), JSON.parse(JSON.stringify(m.salvar())));
  assert.deepEqual(m2.locais.celeiro.piso, [8, 5]);
  assert.equal(m2.locais.celeiro.entidadeEm(7, 4).tipo, 'bau');
  assert.equal(m2.locais.fazenda.porId.celeiro.nivel, 2);
});

test('comportamento: outra frente dá vida a um tipo no arquivo dela, em qualquer ordem', () => {
  const visto = [];
  comportamento('galinheiro', {
    acaoPossivel: (m, e) => ({ painel: 'galinheiro', arg: { entidade: e.id }, texto: 'ver-galinheiro' }),
    visual: (m, e, v) => { v.chave = 'objeto/galinheiro-cheio'; },
    pontos: { ficar: (e) => [[e.l / 2, e.p + 0.5]] },
    aoPronta: (m, e) => visto.push('pronta ' + e.id),
    aoMover: (m, e, antes) => visto.push(`moveu de ${antes.x},${antes.z}`),
    aoAmpliar: (m, e, amp) => visto.push('ampliou ' + amp.nome),
  });
  comportamento('canteiro-de-flores', { aoTirar: (m, e) => visto.push('tirou ' + e.tipo), podeTirar: (m, e) => (e.preso ? { ok: false, motivo: 'em-uso' } : { ok: true }) });
  try {
    const m = comBancada(), ev = ouvirTudo(m);
    darXp(m, 30, 'teste');
    const g = construcaoPorId(m, construir(m, 'galinheiro', 6, 12, { jaJa: true }).dados.entidade);
    assert.deepEqual(TIPOS.galinheiro.pontos.ficar(g), [[1.5, 3.5]], 'os pontos de parada passam para o tipo');
    // em obra, o toque e a figura são os da obra, não os do comportamento
    assert.equal(TIPOS.galinheiro.acaoPossivel(m, g).texto, 'em-obra');
    assert.equal(TIPOS.galinheiro.visual(m, g, {}).chave, 'objeto/galinheiro');
    assert.deepEqual(visto, []);
    pular(m, 61);
    assert.deepEqual(visto, ['pronta ' + g.id]);
    assert.equal(TIPOS.galinheiro.visual(m, g, {}).chave, 'objeto/galinheiro-cheio');
    // o toque abre o painel da frente dona do tipo, na hora, sem a personagem andar
    const r = tocarEm(m, g.id);
    assert.ok(r.ok); assert.equal(r.dados.painel, 'galinheiro');
    assert.deepEqual(ev.de('pediuPainel'), [{ painel: 'galinheiro', arg: { entidade: g.id }, entidade: g.id }]);
    assert.equal(m.personagem.fila.length, 0, 'não anda');
    m.comando({ tipo: 'moverConstrucao', entidade: g.id, x: 6, z: 13 });
    m.posses.bolsa.tabua = 10; m.comando({ tipo: 'ampliar', entidade: g.id }); pular(m, 201);
    assert.deepEqual(visto.slice(1), ['moveu de 6,12', 'ampliou Galinheiro para 8']);
    const c = construcaoPorId(m, construir(m, 'canteiro-de-flores', 14, 14).dados.entidade);
    c.preso = true;
    assert.equal(m.comando({ tipo: 'guardarConstrucao', entidade: c.id }).motivo, 'em-uso');
    c.preso = false;
    assert.ok(m.comando({ tipo: 'guardarConstrucao', entidade: c.id }).ok);
    assert.equal(visto.at(-1), 'tirou canteiro-de-flores');
    // sem comportamento, o toque abre o cartão da própria construção
    const b = construcoesDe(m, 'bancada-de-carpintaria')[0];
    assert.deepEqual(TIPOS[b.tipo].acaoPossivel(m, b), { painel: 'construcao', arg: { entidade: b.id }, texto: 'ver-construcao', dados: { construcao: b.tipo } });
    // ao carregar, a construção pronta avisa de novo (o estado da outra frente se refaz)
    visto.length = 0;
    Mundo.carregar(dadosDeTeste(), JSON.parse(JSON.stringify(m.salvar())));
    assert.deepEqual(visto, ['pronta ' + g.id]);
  } finally {
    comportamento('galinheiro', { acaoPossivel: null, visual: null, pontos: null, aoPronta: null, aoMover: null, aoAmpliar: null });
    comportamento('canteiro-de-flores', { aoTirar: null, podeTirar: null });
    TIPOS.galinheiro.pontos = null;
  }
});

test('gravar e carregar: tudo o que foi colocado volta para o lugar, com nível, obra e depósito', () => {
  const m = comBancada();
  darXp(m, 30, 'teste');
  const g = porConstrucao(m, 'galinheiro', 6, 12, { nivel: 2 });
  for (const [x, z] of [[11, 14], [12, 14], [13, 14]]) construir(m, 'cerca-de-madeira', x, z);
  construir(m, 'caminho-de-pedra', 11, 15); construir(m, 'porteira', 14, 14);
  const flor = construir(m, 'canteiro-de-flores', 18, 18).dados.entidade;
  m.comando({ tipo: 'guardarConstrucao', entidade: flor });
  m.comando({ tipo: 'moverConstrucao', entidade: 'banca', x: 16, z: 12 });
  m.comando({ tipo: 'guardarConstrucao', entidade: construcoesDe(m, 'bau')[0].id });
  const obra = construir(m, 'prateleira-simples', 0, 2, { local: 'celeiro' }).dados.entidade;
  const gravado = JSON.parse(JSON.stringify(m.salvar()));
  const m2 = Mundo.carregar(dadosDeTeste(), gravado);
  const resumo = (w) => w.construcao.todas.map((e) => [e.id, e.tipo, e.local, e.x, e.z, e.l, e.p, e.nivel, e.obraAte, e.ampliaAte]).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  assert.deepEqual(resumo(m2), resumo(m));
  assert.deepEqual(m2.construcao.guardadas, { 'canteiro-de-flores': 1, bau: 1 });
  const loc = m2.locais.fazenda;
  assert.equal(loc.entidadeEm(7, 13).id, g.id); assert.equal(loc.porId[g.id].nivel, 2);
  assert.equal(loc.entidadeEm(12, 14).tipo, 'cerca-de-madeira');
  assert.equal(loc.entidadeEm(17, 12).id, 'banca'); assert.equal(loc.entidadeEm(17, 9), null, 'a banca mudou de lugar');
  assert.equal(loc.chaoEm(11, 15), CAMINHO); assert.equal(loc.chaoEm(14, 14), CAMINHO); assert.ok(loc.andavel(14, 14));
  assert.equal(m2.locais.celeiro.entidades.length, 3); assert.ok(!estaPronta(construcaoPorId(m2, obra)));
  assert.deepEqual(m2.salvar().sistemas.construcao, gravado.sistemas.construcao, 'gravar de novo dá o mesmo');
  // o que é construído depois de carregar não repete id
  const nova = construir(m2, 'canteiro-de-flores', 18, 18).dados.entidade;
  assert.ok(!m.construcao.todas.some((e) => e.id === nova) || nova === flor);
  assert.equal(new Set(m2.construcao.todas.map((e) => e.id)).size, m2.construcao.todas.length);
});

test('uma gravação do M1 (sem construções) abre: fazenda como era e o celeiro com os móveis do começo', () => {
  const m = novoMundo();
  arar(m, [[12, 13]]);
  const gravado = JSON.parse(JSON.stringify(m.salvar()));
  delete gravado.sistemas.construcao; // o M1 não tinha este sistema
  const m2 = Mundo.carregar(dadosDeTeste(), gravado);
  assert.deepEqual(m2.construcao.todas.filter((e) => e.local === 'fazenda').map((e) => e.id).sort(), ['banca', 'casa', 'celeiro', 'poco']);
  assert.deepEqual(m2.locais.celeiro.entidades.map((e) => e.tipo), ['suporte-de-ferramentas', 'prateleira-simples', 'bau']);
  assert.equal(m2.locais.fazenda.chaoEm(12, 13), ARADA);
  assert.ok(rico(m2, MAT) && construir(m2, 'bancada-de-carpintaria', 12, 15, { jaJa: true }).ok, 'e dá para construir nela');
});

test('se os dados mudaram e o lugar gravado não serve mais, a construção vai para o depósito (nada se perde)', () => {
  const m = comBancada();
  construir(m, 'canteiro-de-flores', 12, 12);
  const gravado = JSON.parse(JSON.stringify(m.salvar()));
  gravado.sistemas.construcao.lista.push({ id: 'canteiro-de-flores-99', tipo: 'canteiro-de-flores', local: 'fazenda', x: 12, z: 12, nivel: 1 }, { id: 'sumiu-1', tipo: 'coisa-que-saiu-dos-dados', local: 'fazenda', x: 13, z: 13 }, { id: 'canteiro-de-flores-98', tipo: 'canteiro-de-flores', local: 'fazenda', x: 2, z: 2 });
  const m2 = Mundo.carregar(dadosDeTeste(), gravado);
  assert.equal(m2.construcao.guardadas['canteiro-de-flores'], 2, 'um em lugar repetido e um em terra que não é mais dela');
  assert.equal(construcoesDe(m2, 'canteiro-de-flores').length, 1);
});

test('podeConstruir responde sem mexer em nada (a interface pinta o fantasma de verde ou vermelho com ela)', () => {
  const m = comBancada(), antes = JSON.stringify(m.salvar());
  assert.ok(podeConstruir(m, 'canteiro-de-flores', 12, 12).ok);
  assert.equal(podeConstruir(m, 'canteiro-de-flores', 9, 5).motivo, 'lugar-ocupado');
  assert.equal(podeConstruir(m, 'galinheiro', 12, 12).motivo, 'nivel-baixo');
  assert.equal(lugarServe(m, 'galinheiro', 12, 12).ok, true, 'lugarServe só olha o lugar');
  assert.equal(JSON.stringify(m.salvar()), antes);
});
