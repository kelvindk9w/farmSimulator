// O celeiro por dentro: entrar e sair, o espaço que vem dos móveis, a figura de cada móvel e a gravação.
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, dadosDeTeste, ateParar, ouvirTudo, tocarEm, tocar, pular, porConstrucao, rico, plantarAtePronta, colher, arar, semear, encher, CAMPO } from './apoio.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { TIPOS } from '../src/nucleo/registro.js';
import { guiaDaMissao } from '../src/nucleo/guia.js';
import { construcoesDe, construcaoPorId } from '../src/nucleo/sistemas/construcao.js';
import { capacidadeDe, ocupacaoDe, espacoPara, guardaDoItem, enchimento, celeiroDe, portaDoCeleiro } from '../src/nucleo/sistemas/celeiro-dentro.js';
import { noCeleiro, espacoNoCeleiro, ferramentaNoCinto } from '../src/nucleo/sistemas/posses.js';

const MAT = { madeira: 30, tabua: 30, prego: 30, pedra: 30 };
const DUAS = CAMPO.slice(0, 2); // (o mundo de teste começa com três sementes)
const dentro = (m) => { assert.ok(m.comando({ tipo: 'entrar', jaJa: true }).ok); return m.locais.celeiro; };
const visual = (m, e) => TIPOS[e.tipo].visual(m, e, {}).chave;

test('entrar: ela vai até a porta do celeiro e passa para dentro; sair: pisa na soleira e volta para a frente dele', () => {
  const m = novoMundo(), ev = ouvirTudo(m), p = m.personagem;
  assert.equal(p.local, 'fazenda');
  assert.ok(m.comando({ tipo: 'entrar' }).ok);
  ateParar(m);
  assert.equal(p.local, 'celeiro'); assert.ok(m.local.interior);
  assert.deepEqual(ev.de('mudouDeLocal'), [{ de: 'fazenda', para: 'celeiro' }]);
  assert.deepEqual([p.x, p.z], m.local.entrada, 'aparece logo depois da soleira');
  assert.ok(m.comando({ tipo: 'entrar' }).repetida, 'já está dentro');
  // sair pelo comando
  assert.ok(m.comando({ tipo: 'sair' }).ok);
  ateParar(m);
  assert.equal(p.local, 'fazenda');
  const porta = portaDoCeleiro(m);
  assert.ok(Math.hypot(p.x - porta[0], p.z - porta[1]) < 1.01, 'sai diante da porta');
  assert.ok(m.local.andavel(Math.floor(p.x), Math.floor(p.z)));
  assert.deepEqual(ev.de('mudouDeLocal').at(-1), { de: 'celeiro', para: 'fazenda' });
  assert.ok(m.comando({ tipo: 'sair' }).repetida);
});

test('tocar na soleira com o dedo também sai; e a fila do outro lugar não vem junto', () => {
  const m = novoMundo(), p = m.personagem, loc = dentro(m);
  tocar(m, 1, 2); tocar(m, loc.porta[0], loc.porta[1]);
  ateParar(m);
  assert.equal(p.local, 'fazenda');
  assert.equal(p.fila.length, 0);
  // com alguma coisa bem na frente da porta, ela sai na casa livre mais perto
  m.comando({ tipo: 'entrar', jaJa: true });
  const porta = portaDoCeleiro(m);
  porConstrucao(m, 'canteiro-de-flores', Math.floor(porta[0]), Math.floor(porta[1]));
  m.comando({ tipo: 'sair', jaJa: true });
  assert.equal(p.local, 'fazenda');
  assert.ok(m.local.andavel(Math.floor(p.x), Math.floor(p.z)), 'não nasce dentro do canteiro');
});

test('empurrar a porta com as teclas entra; andar ao lado do celeiro, não', () => {
  const m = novoMundo(), p = m.personagem, porta = portaDoCeleiro(m);
  p.x = porta[0]; p.z = porta[1];
  m.comando({ tipo: 'rumar', dx: 1, dz: 0 });
  m.avancar(0.3);
  assert.equal(p.local, 'fazenda', 'passar na frente não entra');
  m.comando({ tipo: 'frear' });
  p.x = porta[0]; p.z = porta[1];
  m.comando({ tipo: 'rumar', dx: 0, dz: -1 });
  m.avancar(0.6);
  assert.equal(p.local, 'celeiro');
  assert.ok(!p.rumando, 'chega parada');
});

test('o toque no celeiro continua guardando o cesto; sem nada para guardar nem para pegar, o toque entra', () => {
  const m = novoMundo(), p = m.personagem, cel = celeiroDe(m);
  assert.equal(TIPOS.celeiro.acaoPossivel(m, cel).acao, 'entrarNoCeleiro');
  plantarAtePronta(m, DUAS); colher(m, DUAS);
  assert.equal(TIPOS.celeiro.acaoPossivel(m, cel).acao, 'guardar');
  tocarEm(m, cel.id); ateParar(m);
  assert.equal(p.local, 'fazenda'); assert.ok(noCeleiro(m) > 0);
  assert.equal(TIPOS.celeiro.acaoPossivel(m, cel).acao, 'pegar', 'com estoque, o segundo toque pega de volta (M1)');
  m.posses.celeiro.itens = {};
  tocarEm(m, cel.id); ateParar(m);
  assert.equal(p.local, 'celeiro');
});

test('a capacidade do celeiro vem das prateleiras prontas; sem prateleira, vale a de regras.json', () => {
  const m = rico(novoMundo(), MAT), ev = ouvirTudo(m);
  porConstrucao(m, 'bancada-de-carpintaria', 16, 16);
  assert.equal(capacidadeDe(m, 'produtos'), 10); assert.equal(m.posses.celeiro.capacidade, 10);
  dentro(m);
  // a prateleira nova só conta depois de montada
  assert.ok(m.comando({ tipo: 'construir', id: 'prateleira-simples', x: 0, z: 2 }).ok);
  ateParar(m);
  const nova = construcoesDe(m, 'prateleira-simples').at(-1);
  assert.ok(nova.obraAte > 0); assert.equal(m.posses.celeiro.capacidade, 10);
  pular(m, 31);
  assert.equal(m.posses.celeiro.capacidade, 20); assert.equal(espacoNoCeleiro(m), 20);
  assert.equal(ev.de('montou').length, 1);
  // cheia além do que a outra guarda, não sai do lugar; com folga, sai e o espaço diminui
  m.posses.celeiro.itens = { rabanete: 14 };
  const r = m.comando({ tipo: 'guardarConstrucao', entidade: nova.id });
  assert.equal(r.motivo, 'movel-em-uso'); assert.equal(m.posses.celeiro.capacidade, 20);
  m.posses.celeiro.itens = { rabanete: 6 };
  assert.ok(m.comando({ tipo: 'guardarConstrucao', entidade: nova.id }).ok);
  assert.equal(m.posses.celeiro.capacidade, 10);
  // sem prateleira nenhuma: a capacidade inicial
  for (const e of construcoesDe(m, 'prateleira-simples')) assert.ok(m.comando({ tipo: 'guardarConstrucao', entidade: e.id }).ok);
  assert.equal(construcoesDe(m, 'prateleira-simples').length, 0);
  assert.equal(m.posses.celeiro.capacidade, m.dados.regras.celeiro.capacidade);
});

test('produto, material e ferramenta não disputam lugar; baú cheio só avisa, nunca perde material', () => {
  const m = novoMundo(), ev = ouvirTudo(m);
  assert.equal(guardaDoItem(m, 'rabanete'), 'produtos'); assert.equal(guardaDoItem(m, 'madeira'), 'materiais');
  assert.equal(guardaDoItem(m, 'regador'), 'ferramentas'); assert.equal(guardaDoItem(m, 'semente-rabanete'), null);
  assert.equal(capacidadeDe(m, 'materiais'), 40); assert.equal(capacidadeDe(m, 'ferramentas'), 4);
  assert.equal(ocupacaoDe(m, 'materiais'), 0, 'semente não é material');
  assert.equal(ocupacaoDe(m, 'ferramentas'), 1, 'o regador começa no suporte');
  rico(m, { madeira: 30 }, 0);
  assert.equal(ocupacaoDe(m, 'materiais'), 30); assert.equal(espacoPara(m, 'materiais'), 10);
  assert.equal(espacoNoCeleiro(m), 10, 'material não ocupa prateleira');
  m.posses.celeiro.itens = { rabanete: 10 };
  assert.equal(espacoPara(m, 'materiais'), 10, 'produto não ocupa baú');
  // passou do baú: fica tudo, e sai um aviso (um só, não um por item)
  m.comando({ tipo: 'comprar', item: 'semente-rabanete', n: 1 });
  assert.equal(ev.de('informou').length, 0);
  m.posses.bolsa.madeira = 45;
  m.eventos.emitir('ganhouItem', { item: 'madeira', n: 15 }); m.eventos.emitir('ganhouItem', { item: 'madeira', n: 1 });
  assert.deepEqual(ev.de('informou').map((d) => d.motivo), ['bau-cheio']);
  assert.equal(m.posses.bolsa.madeira, 45);
});

test('a prateleira aparece vazia, meia ou cheia; o suporte mostra as ferramentas fora do cinto', () => {
  const m = novoMundo(), loc = m.locais.celeiro;
  const prat = loc.entidades.find((e) => e.tipo === 'prateleira-simples'), sup = loc.entidades.find((e) => e.tipo === 'suporte-de-ferramentas');
  assert.equal(visual(m, prat), 'objeto/prateleira-simples'); assert.equal(enchimento(m, prat), 0);
  m.posses.celeiro.itens = { rabanete: 4 };
  assert.equal(visual(m, prat), 'objeto/prateleira-simples-meia');
  m.posses.celeiro.itens = { rabanete: 9 };
  assert.equal(visual(m, prat), 'objeto/prateleira-simples-cheia');
  // com duas, a primeira enche antes
  const outra = porConstrucao(m, 'prateleira-simples', 0, 2, { local: 'celeiro' });
  assert.equal(m.posses.celeiro.capacidade, 20);
  assert.equal(visual(m, outra), 'objeto/prateleira-simples');
  m.posses.celeiro.itens = { rabanete: 13 };
  assert.equal(visual(m, prat), 'objeto/prateleira-simples-cheia'); assert.equal(visual(m, outra), 'objeto/prateleira-simples-meia');
  // o suporte
  assert.equal(visual(m, sup), 'objeto/suporte-de-ferramentas');
  assert.equal(m.comando({ tipo: 'guardarConstrucao', entidade: sup.id, quieto: true }).motivo, 'movel-em-uso', 'o único suporte não sai com ferramenta pendurada');
  dentro(m);
  m.personagem.fila.push({ tipo: 'agir', acao: 'pegarFerramenta', entidade: sup.id, args: { funcao: 'regador' } });
  ateParar(m);
  assert.ok(ferramentaNoCinto(m, 'regador') || ferramentaNoCinto(m, 'enxada'));
  assert.equal(ocupacaoDe(m, 'ferramentas'), 1, 'cinto de uma vaga: a enxada foi para o suporte no lugar do regador');
  m.posses.ferramentas.enxada.onde = 'cinto';
  assert.equal(visual(m, sup), 'objeto/suporte-de-ferramentas-vazio');
});

test('a ferramenta que não está no cinto continua sendo buscada sozinha: no celeiro lá fora, no suporte lá dentro', () => {
  const m = novoMundo(), p = m.personagem;
  assert.ok(TIPOS['suporte-de-ferramentas'].suporte, 'lá dentro, quem tem as ferramentas é o móvel');
  assert.equal(m.posses.ferramentas.regador.onde, 'suporte');
  // lá fora, como no M1: regar sem o regador no cinto passa antes no celeiro
  arar(m, [DUAS[0]]); semear(m, [DUAS[0]]);
  const ev = ouvirTudo(m);
  encher(m);
  assert.equal(ev.de('pegouFerramenta').length, 1);
  assert.ok(ferramentaNoCinto(m, 'regador'));
  assert.equal(p.local, 'fazenda', 'buscar a ferramenta não é entrar');
  // lá dentro, a enxada que ficou pendurada sai do suporte do mesmo jeito
  const loc = dentro(m), sup = loc.entidades.find((e) => e.tipo === 'suporte-de-ferramentas');
  assert.equal(loc.entidades.find((e) => TIPOS[e.tipo].suporte), sup);
  p.fila.push({ tipo: 'agir', acao: 'pegarFerramenta', entidade: sup.id, args: { funcao: 'enxada' } });
  ateParar(m);
  assert.ok(ferramentaNoCinto(m, 'enxada'));
});

test('o celeiro de fora: a figura do nível, e a porta aberta quando ela chega', () => {
  const m = novoMundo(), cel = celeiroDe(m), p = m.personagem, porta = portaDoCeleiro(m);
  assert.equal(visual(m, cel), 'objeto/celeiro');
  p.x = porta[0]; p.z = porta[1];
  assert.equal(visual(m, cel), 'objeto/celeiro-aberto');
  cel.nivel = 2;
  assert.equal(visual(m, cel), 'objeto/celeiro-2-aberto');
  p.x = porta[0] + 6;
  assert.equal(visual(m, cel), 'objeto/celeiro-2');
});

test('o guia da missão de montar aponta o celeiro, e lá dentro o painel de construir', () => {
  const missoes = (b) => { b.missoes.vizinho = [{ id: 'prateleira', titulo: 'Prateleiras', objetivo: { evento: 'montou', filtro: { construcao: 'prateleira-simples' }, n: 1 }, recompensa: { ouro: 9 } }]; };
  const m = rico(novoMundo(missoes), MAT);
  porConstrucao(m, 'bancada-de-carpintaria', 16, 16);
  let g = guiaDaMissao(m);
  assert.equal(g.tipo, 'entidade'); assert.equal(g.id, celeiroDe(m).id);
  dentro(m);
  g = guiaDaMissao(m);
  assert.equal(g.tipo, 'painel'); assert.equal(g.painel, 'construir'); assert.equal(g.item, 'prateleira-simples');
  m.comando({ tipo: 'construir', id: 'prateleira-simples', x: 0, z: 2 });
  assert.equal(guiaDaMissao(m).tipo, null, 'ela já está indo montar');
  ateParar(m);
  assert.equal(guiaDaMissao(m).tipo, 'esperar');
});

test('gravar lá dentro e voltar: ela continua no celeiro, com o espaço dos móveis; a gravação do M1 abre', () => {
  const m = rico(novoMundo(), MAT);
  porConstrucao(m, 'prateleira-simples', 0, 2, { local: 'celeiro' });
  dentro(m);
  tocar(m, 3, 2); ateParar(m);
  const g = JSON.parse(JSON.stringify(m.salvar()));
  const m2 = Mundo.carregar(dadosDeTeste(), g);
  assert.equal(m2.personagem.local, 'celeiro'); assert.ok(m2.local.interior);
  assert.deepEqual([m2.personagem.x, m2.personagem.z], [m.personagem.x, m.personagem.z]);
  assert.equal(m2.posses.celeiro.capacidade, 20);
  assert.ok(m2.comando({ tipo: 'sair' }).ok); ateParar(m2);
  assert.equal(m2.personagem.local, 'fazenda');
  // gravação de antes de o celeiro ter lado de dentro: sem os sistemas novos
  const velho = JSON.parse(JSON.stringify(novoMundo().salvar()));
  delete velho.sistemas.construcao; delete velho.sistemas.celeiroDentro;
  const m3 = Mundo.carregar(dadosDeTeste(), velho);
  assert.equal(m3.personagem.local, 'fazenda'); assert.equal(m3.posses.celeiro.capacidade, 10);
  assert.ok(m3.comando({ tipo: 'entrar', jaJa: true }).ok);
  assert.equal(m3.locais.celeiro.entidades.length, 3);
  assert.ok(construcaoPorId(m3, m3.locais.celeiro.entidades[0].id));
});
