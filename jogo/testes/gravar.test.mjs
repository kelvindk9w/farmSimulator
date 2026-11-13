// Gravar e carregar: o mundo inteiro vai e volta por JSON; o texto de exportar acusa quando foi cortado.
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, dadosDeTeste, ateParar, modo, tocar, tocarEm, arar, semear, encher, regar, colher, pular, plantarAtePronta, CAMPO } from './apoio.mjs';
import { Mundo, VERSAO } from '../src/nucleo/mundo.js';
import { ARADA } from '../src/nucleo/local.js';
import { plantaEm, estadoDaPlanta } from '../src/nucleo/sistemas/lavoura.js';
import { missaoAtual } from '../src/nucleo/sistemas/missoes.js';
import { gravacao, CHAVE } from '../src/plataforma/gravacao.js';

function jogado() {
  const m = novoMundo();
  m.posses.bolsa['semente-rabanete'] = 6;
  plantarAtePronta(m, CAMPO.slice(0, 2));
  colher(m, [CAMPO[0]]);
  arar(m, [CAMPO[2], CAMPO[3]]); semear(m, [CAMPO[2]]); encher(m); regar(m, [CAMPO[2]]);
  m.comando({ tipo: 'comprar', item: 'semente-rabanete', n: 2 });
  m.avancar(3);
  return m;
}
const copia = (obj) => JSON.parse(JSON.stringify(obj));

test('gravar, passar por JSON e carregar devolve o mesmo mundo', () => {
  const m = jogado(), g = copia(m.salvar());
  assert.equal(g.versao, VERSAO);
  const n = Mundo.carregar(dadosDeTeste(), g);
  assert.deepEqual(n.salvar(), g);
  assert.equal(n.agora, g.agora);
  assert.equal(n.posses.ouro, m.posses.ouro);
  assert.deepEqual(n.posses.cesto.itens, { rabanete: 2 });
  assert.deepEqual(n.posses.bolsa, m.posses.bolsa);
  assert.equal(n.progresso.xp, m.progresso.xp);
  assert.deepEqual(n.missoes.feitas, m.missoes.feitas);
  assert.equal(missaoAtual(n).conta, missaoAtual(m).conta);
  assert.equal(n.local.chao[n.local.i(13, 14)], ARADA);
  assert.equal(estadoDaPlanta(n, plantaEm(n, 13, 13)), 'pronta');
  assert.equal(estadoDaPlanta(n, plantaEm(n, 12, 14)), 'crescendo');
  assert.ok(Math.abs(n.personagem.x - m.personagem.x) < 0.001);
  assert.equal(n.modo.id, m.modo.id);
  assert.equal(n.posses.ferramentas.regador.agua, m.posses.ferramentas.regador.agua);
});

test('depois de carregar, o tempo fora do jogo conta: a planta regada amadurece', () => {
  const m = jogado(), n = Mundo.carregar(dadosDeTeste(), copia(m.salvar()));
  pular(n, 3600);
  assert.equal(estadoDaPlanta(n, plantaEm(n, 12, 14)), 'pronta');
  colher(n, [CAMPO[2]]);
  assert.equal(n.posses.cesto.itens.rabanete, 4);
});

test('o mundo carregado segue igual ao original: mesmos comandos, mesma gravação', () => {
  const a = jogado(), b = Mundo.carregar(dadosDeTeste(), copia(a.salvar()));
  for (const m of [a, b]) { modo(m, 'enxada'); tocar(m, 7, 15); tocar(m, 8, 15); tocarEm(m, 'banca'); ateParar(m); m.avancar(2); }
  assert.deepEqual(b.salvar(), a.salvar());
});

test('gravação que não é deste jogo, ou de versão mais nova, é recusada com explicação', () => {
  const D = dadosDeTeste();
  assert.throws(() => Mundo.carregar(D, null), /gravação inválida/);
  assert.throws(() => Mundo.carregar(D, { qualquer: 'coisa' }), /gravação inválida/);
  const g = jogado().salvar(); g.versao = VERSAO + 1;
  assert.throws(() => Mundo.carregar(D, g), /versão mais nova/);
});

test('se os dados mudaram entre versões, a gravação antiga ainda abre (o que não serve é deixado de lado)', () => {
  const g = copia(jogado().salvar());
  // a cultura plantada deixou de existir, uma missão saiu da lista e a gravação traz uma casa que não cabe no mapa
  const D = dadosDeTeste((b) => { delete b.culturas.milho; b.itens['semente-milho'].tipo = 'miudeza'; b.missoes.vizinho.shift(); });
  g.sistemas.lavoura.locais.fazenda.arada.push([999999], [13 + 16 * 24, 'milho', 0, 0]); // (formato 2 da lavoura: com o campo de plantação)
  const n = Mundo.carregar(D, g);
  assert.deepEqual(n.missoes.feitas, ['colher-rabanete'].filter((id) => g.sistemas.missoes.feitas.includes(id)));
  assert.equal(n.local.chao[n.local.i(13, 16)], ARADA);
  assert.equal(plantaEm(n, 13, 16), null, 'a cultura que não existe mais não é plantada');
  n.avancar(2);
});

test('exportar e importar por texto: vai e volta, e texto cortado ou alterado é acusado', () => {
  const m = jogado(), g = m.salvar(), texto = gravacao.exportar(g);
  assert.match(texto, /^FAZENDA1\.[A-Za-z0-9+/=_-]+\.[0-9a-z]+$/);
  assert.deepEqual(gravacao.importar(texto), copia(g));
  assert.deepEqual(gravacao.importar('  ' + texto.slice(0, 40) + '\n' + texto.slice(40) + '  '), copia(g), 'espaços e quebras de linha não atrapalham');
  assert.deepEqual(Mundo.carregar(dadosDeTeste(), gravacao.importar(texto)).salvar(), copia(g));
  assert.throws(() => gravacao.importar(texto.slice(0, texto.length - 30)), /cortado|alterado|não é uma gravação/);
  const meio = Math.floor(texto.length / 2), trocado = texto.slice(0, meio) + (texto[meio] === 'A' ? 'B' : 'A') + texto.slice(meio + 1);
  assert.throws(() => gravacao.importar(trocado), /cortado ou foi alterado/);
  assert.throws(() => gravacao.importar('bom dia'), /não é uma gravação/);
  assert.throws(() => gravacao.importar(''), /cole o texto/);
});

test('sem localStorage o jogo segue: gravar devolve falso e ler devolve nada, sem erro', () => {
  assert.equal(typeof CHAVE, 'string'); assert.equal(CHAVE, 'fazenda.jogo.v1');
  if (gravacao.disponivel) return; // este Node tem localStorage: nada a conferir aqui
  assert.equal(gravacao.gravar({ a: 1 }), false);
  assert.equal(gravacao.ler(), null);
  assert.deepEqual(gravacao.lerPrefs(), {});
  gravacao.apagar();
});
