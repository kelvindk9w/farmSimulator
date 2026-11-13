// Animais: a base comum (compra, abrigo, cocho e bebedouro, relógio com ausência, famílias) e os de produção
// (galinha, vaca, ovelha: produzir, recolher com a ferramenta certa, vida produtiva e as três saídas).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ateParar, ouvirTudo, tocarEm, pular, modo, dadosDeTeste, brutoDeTeste, porConstrucao } from './apoio.mjs';
import { comAnimais, mundoDosAnimais, porAbrigo, fartura, galinheiroCom, dar } from './apoio-animais.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { prepararDados } from '../src/nucleo/dados.js';
import { quantoTem, noCesto, espacoNoCesto, foraDoCesto, capacidadeDoCesto, noCeleiro } from '../src/nucleo/sistemas/posses.js';
import { COMPORTAMENTOS, construcaoPorId } from '../src/nucleo/sistemas/construcao.js';
import { ENTREGAS } from '../src/nucleo/sistemas/cash.js';
import { barraDeXp } from '../src/nucleo/sistemas/niveis.js';
import {
  registrarFamilia, animaisDe, vagasLivres, abrigoDe, estaTratado, nivelDoCocho, nivelDoBebedouro, porAnimal, tirarAnimal,
  estadoDoAbrigo, podeComprarAnimal, ofertasDeAnimais, cicloDoAnimal, comecarCiclo, animalPorId, faltaNoAbrigo, famintosDe,
} from '../src/nucleo/sistemas/animais.js';
import { vidaDoAnimal, prontosNoAbrigo, pedidoDoAbrigo, situacaoDoAnimal, podeRecolher, noRecipiente } from '../src/nucleo/sistemas/producao.js';

// ---------- uma família de mentira, para provar que a base serve a qualquer família ----------
const visto = [];
registrarFamilia('circo', {
  podeComprar: (m, d) => (d.id === 'urso' ? { ok: false, motivo: 'sem-lona', dados: { lona: 1 } } : { ok: true }),
  aoChegar: (m, a) => { a.truques = 0; a.ciclos = 0; visto.push('chegou ' + a.id); },
  aoCarregar: (m, a) => visto.push('carregou ' + a.id),
  aoSair: (m, a) => visto.push('saiu ' + a.id),
  aoCiclo: (m, a, tratado) => { a.ciclos++; if (tratado) a.truques++; return !(a.para > 0 && a.ciclos >= a.para); },
  toqueNoAbrigo: (m, e) => (e.circo ? { painel: 'picadeiro', arg: { entidade: e.id }, texto: 'ver-circo' } : null),
});
function comCirco(b) {
  comAnimais(b);
  Object.assign(b.animais, {
    pato: { nome: 'Pato', familia: 'circo', abrigo: 'galinheiro', preco: { ouro: 5 }, nivel: 1, come: { milho: 1 }, bebe: 1, cicloSeg: 100 },
    foca: { nome: 'Foca', familia: 'circo', abrigo: null, preco: { ouro: 7 }, nivel: 1 },
    urso: { nome: 'Urso', familia: 'circo', abrigo: null, preco: { ouro: 5 }, nivel: 1 },
    leao: { nome: 'Leão', familia: 'circo', abrigo: null, preco: { cash: 9 }, nivel: 1, especial: true },
    tigre: { nome: 'Tigre', familia: 'circo', abrigo: 'galinheiro', preco: { cash: 9 }, nivel: 2, especial: true },
    fantasma: { nome: 'Fantasma', familia: 'assombracao', abrigo: null, preco: { ouro: 1 }, nivel: 1 },
  });
}
const doCirco = (mais, opc) => mundoDosAnimais((b) => { comCirco(b); if (mais) mais(b); }, opc);
const comprar = (m, animal) => m.comando({ tipo: 'comprarAnimal', animal });
const encherCocho = (m, e) => { const r = m.comando({ tipo: 'encherCocho', entidade: e.id }); ateParar(m); return r; };
const encherBebedouro = (m, e) => { const r = m.comando({ tipo: 'encherBebedouro', entidade: e.id }); ateParar(m, 300); return r; };
const recolher = (m, e) => { const r = m.comando({ tipo: 'recolher', entidade: e.id }); ateParar(m, 300); return r; };
const soAnimais = (m) => JSON.parse(JSON.stringify(m.salvar().sistemas.animais));

// ====================================================================================================
// A BASE
// ====================================================================================================

test('mundo novo não tem bicho; o abrigo pronto nasce com vagas, cocho e bebedouro dos dados, vazios', () => {
  const m = mundoDosAnimais();
  assert.deepEqual(m.animais.lista, []);
  assert.equal(vagasLivres(m, 'galinheiro'), 0, 'sem galinheiro, sem vaga');
  const obra = porAbrigo(m, 'galinheiro', undefined, undefined, { obraSeg: 60 });
  assert.equal(vagasLivres(m, 'galinheiro'), 0, 'em obra ainda não abriga');
  pular(m, 61);
  assert.equal(vagasLivres(m, 'galinheiro'), 4);
  assert.deepEqual(estadoDoAbrigo(m, obra), { vagas: 4, ocupadas: 0, cocho: { nivel: 0, capacidade: 6, item: 'milho', tem: 0 }, bebedouro: { nivel: 0, capacidade: 8, porRega: 4 } });
  assert.equal(nivelDoCocho(m, obra), 0); assert.equal(nivelDoBebedouro(m, obra.id), 0);
});

test('comprarAnimal confere, nesta ordem: existe, só com cash, nível, família, abrigo pronto, vaga, a família e o ouro', () => {
  const m = doCirco((b) => { b.animais.vaca.nivel = 3; b.construcoes.galinheiro.vagas = 2; }), ev = ouvirTudo(m);
  m.posses.ouro = 0;
  assert.equal(comprar(m, 'dragao').motivo, 'nao-existe');
  assert.deepEqual(comprar(m, 'leao'), { ok: false, motivo: 'so-com-cash', dados: { cash: 9, animal: 'leao' } });
  assert.deepEqual(comprar(m, 'vaca'), { ok: false, motivo: 'nivel-baixo', dados: { nivel: 3, animal: 'vaca' } });
  assert.deepEqual(comprar(m, 'fantasma'), { ok: false, motivo: 'ainda-nao', dados: { familia: 'assombracao', animal: 'fantasma' } });
  assert.deepEqual(comprar(m, 'galinha'), { ok: false, motivo: 'sem-abrigo', dados: { abrigo: 'galinheiro', animal: 'galinha' } });
  assert.deepEqual(comprar(m, 'urso'), { ok: false, motivo: 'sem-lona', dados: { animal: 'urso', lona: 1 } }, 'a família também opina');
  assert.deepEqual(comprar(m, 'foca'), { ok: false, motivo: 'sem-ouro', dados: { falta: 7, animal: 'foca' } });
  assert.deepEqual(ev.de('faltou').map((d) => d.motivo), ['nao-existe', 'so-com-cash', 'nivel-baixo', 'ainda-nao', 'sem-abrigo', 'sem-lona', 'sem-ouro'], 'cada recusa avisa a interface');
  const e = porAbrigo(m, 'galinheiro');
  assert.equal(comprar(m, 'galinha').motivo, 'sem-ouro');
  m.posses.ouro = 100; ev.limpar();
  const r = comprar(m, 'galinha');
  assert.ok(r.ok); assert.equal(m.posses.ouro, 90);
  const a = animalPorId(m, r.dados.id);
  assert.equal(a.especie, 'galinha'); assert.equal(a.familia, 'producao'); assert.equal(a.abrigo, e.id); assert.equal(abrigoDe(m, a), e);
  assert.deepEqual(ev.de('comprou'), [{ animal: 'galinha', classe: 'animal', familia: 'producao', n: 1, ouro: 10, id: a.id, entidade: e.id }]);
  assert.ok(comprar(m, 'pato').ok, 'famílias diferentes dividem o mesmo abrigo');
  assert.deepEqual(comprar(m, 'galinha'), { ok: false, motivo: 'abrigo-cheio', dados: { abrigo: 'galinheiro', vagas: 2, animal: 'galinha' } });
  assert.equal(m.posses.ouro, 85, 'compra recusada não cobra');
  assert.equal(vagasLivres(m, 'galinheiro'), 0);
  // bicho sem abrigo (gato, cachorro) não pede vaga
  assert.ok(comprar(m, 'foca').ok);
  assert.equal(animaisDe(m, { especie: 'foca' })[0].abrigo, null);
});

test('famílias: os ganchos correm na chegada, na saída e ao carregar; o que a família guarda no bicho vai na gravação', () => {
  const m = doCirco();
  m.posses.ouro = 100; visto.length = 0;
  const id = comprar(m, 'foca').dados.id, a = animalPorId(m, id);
  assert.deepEqual(visto, ['chegou ' + id]); assert.equal(a.truques, 0);
  a.truques = 7;
  const m2 = Mundo.carregar(dadosDeTeste(comCirco), JSON.parse(JSON.stringify(m.salvar())));
  assert.deepEqual(visto, ['chegou ' + id, 'carregou ' + id]);
  assert.equal(animalPorId(m2, id).truques, 7);
  assert.equal(tirarAnimal(m2, id).id, id);
  assert.equal(visto.at(-1), 'saiu ' + id); assert.equal(m2.animais.lista.length, 0);
  assert.equal(tirarAnimal(m2, id), null);
  // o id do próximo bicho não repete o de um que já saiu
  assert.notEqual(porAnimal(m2, 'foca').id, id);
  assert.throws(() => registrarFamilia('circo', {}), /duas vezes/);
});

test('consultas: animaisDe filtra por família, espécie e abrigo; vagasLivres soma os abrigos prontos do tipo', () => {
  const m = doCirco((b) => { b.construcoes.galinheiro.limite = 2; });
  const g1 = porAbrigo(m, 'galinheiro'), g2 = porAbrigo(m, 'galinheiro', 6, 16), c = porAbrigo(m, 'curral');
  assert.equal(vagasLivres(m, 'galinheiro'), 8); assert.equal(vagasLivres(m, 'curral'), 2); assert.equal(vagasLivres(m, 'aprisco'), 0);
  for (let k = 0; k < 5; k++) porAnimal(m, 'galinha');
  porAnimal(m, 'pato', { abrigo: g2.id }); porAnimal(m, 'vaca'); porAnimal(m, 'foca');
  assert.equal(animaisDe(m).length, 8);
  assert.equal(animaisDe(m, { familia: 'producao' }).length, 6);
  assert.equal(animaisDe(m, { especie: 'galinha' }).length, 5);
  assert.equal(animaisDe(m, { abrigo: g1.id }).length, 4, 'o primeiro abrigo enche antes');
  assert.deepEqual(animaisDe(m, { abrigo: g2.id }).map((a) => a.especie), ['galinha', 'pato']);
  assert.equal(animaisDe(m, { familia: 'circo', abrigo: null }).length, 1);
  assert.equal(vagasLivres(m, 'galinheiro'), 2); assert.equal(vagasLivres(m, 'curral'), 1);
  assert.equal(abrigoDe(m, animaisDe(m, { especie: 'vaca' })[0]), c);
  assert.equal(abrigoDe(m, animaisDe(m, { especie: 'foca' })[0]), null);
  assert.throws(() => porAnimal(m, 'dragao'), /desconhecido/);
  // a aba da loja: só bicho de ouro e de família que existe, por nível e preço, com o porquê de não poder
  m.posses.ouro = 6;
  const of = ofertasDeAnimais(m);
  assert.deepEqual(of.map((o) => o.animal), ['pato', 'urso', 'foca', 'galinha', 'vaca', 'ovelha']);
  assert.deepEqual(of.map((o) => o.pode.ok || o.pode.motivo), [true, 'sem-lona', 'sem-ouro', 'sem-ouro', 'sem-ouro', 'sem-abrigo']);
  assert.equal(of.find((o) => o.animal === 'galinha').tem, 5);
});

test('encher o cocho gasta do estoque o que os bichos dali comem, até encher ou acabar, e avisa "tratou"', () => {
  const m = mundoDosAnimais(), e = porAbrigo(m, 'galinheiro'), ev = ouvirTudo(m);
  assert.deepEqual(encherCocho(m, e), { ok: false, motivo: 'sem-comida', dados: { item: 'milho', abrigo: 'galinheiro' } });
  assert.equal(ev.de('faltou')[0].motivo, 'sem-comida');
  dar(m, { milho: 4 });
  assert.ok(encherCocho(m, e).ok);
  assert.equal(nivelDoCocho(m, e), 4); assert.equal(quantoTem(m, 'milho'), 0, 'pôs tudo o que havia');
  assert.deepEqual(ev.de('tratou'), [{ abrigo: 'galinheiro', parte: 'cocho', n: 1, item: 'milho', porcoes: 4, entidade: e.id }]);
  dar(m, { milho: 10 });
  encherCocho(m, e);
  assert.equal(nivelDoCocho(m, e), 6, 'enche só até a capacidade'); assert.equal(quantoTem(m, 'milho'), 8);
  assert.equal(encherCocho(m, e).motivo, 'cocho-cheio');
  assert.equal(ev.de('tratou').length, 2);
  // a comida de cada abrigo é a dos bichos dele: o curral leva ração
  const c = porAbrigo(m, 'curral');
  assert.equal(encherCocho(m, c).dados.item, 'racao');
  dar(m, { racao: 3 }); encherCocho(m, c);
  assert.equal(nivelDoCocho(m, c), 3); assert.equal(quantoTem(m, 'milho'), 8);
  assert.equal(m.comando({ tipo: 'encherCocho', entidade: 'celeiro' }).motivo, 'nao-existe');
});

test('encher o bebedouro usa o regador: busca no suporte, passa no poço e volta quantas vezes for preciso', () => {
  const m = mundoDosAnimais((b) => { b.construcoes.galinheiro.bebedouro = 20; }), e = porAbrigo(m, 'galinheiro'), ev = ouvirTudo(m);
  assert.equal(m.posses.ferramentas.regador.onde, 'suporte'); assert.equal(m.posses.ferramentas.regador.agua, 0);
  assert.ok(encherBebedouro(m, e).ok);
  assert.equal(nivelDoBebedouro(m, e), 20, 'cada rega vale 4 porções: cinco regas, duas idas ao poço');
  assert.equal(m.posses.ferramentas.regador.onde, 'cinto');
  assert.equal(m.posses.ferramentas.regador.agua, 1, 'a segunda ida usou só duas das três regas');
  assert.deepEqual(ev.de('tratou').map((d) => [d.abrigo, d.parte, d.n, d.regas, d.porcoes]), [['galinheiro', 'bebedouro', 1, 3, 12], ['galinheiro', 'bebedouro', 1, 2, 8]]);
  assert.equal(ev.de('encheu').length, 2, 'foi ao poço duas vezes');
  assert.equal(encherBebedouro(m, e).motivo, 'bebedouro-cheio');
  // com água no regador, vai direto; e despeja só o que falta
  m.animais.abrigos[e.id].bebedouro = 17; ev.limpar();
  encherBebedouro(m, e);
  assert.equal(nivelDoBebedouro(m, e), 20); assert.equal(m.posses.ferramentas.regador.agua, 0); assert.equal(ev.de('encheu').length, 0);
  // sem regador nenhum, a dica diz o que falta
  const m2 = mundoDosAnimais((b) => { b.regras.inicio.suporte = []; }), e2 = porAbrigo(m2, 'galinheiro');
  assert.deepEqual(encherBebedouro(m2, e2), { ok: false, motivo: 'sem-ferramenta', dados: { funcao: 'regador' } });
});

test('o relógio: no começo de cada ciclo o bicho come e bebe; faltando um dos dois, o ciclo é sem trato e nada se gasta', () => {
  const m = doCirco(), e = porAbrigo(m, 'galinheiro'), s = m.animais.abrigos[e.id];
  s.cocho = 3; s.bebedouro = 8;
  const a = porAnimal(m, 'pato'), b = porAnimal(m, 'pato');
  assert.equal(s.cocho, 1, 'os dois comeram ao chegar'); assert.equal(s.bebedouro, 6);
  assert.ok(estaTratado(m, a) && estaTratado(m, b));
  assert.deepEqual(cicloDoAnimal(m, a), { rodando: true, fracao: 0, falta: 100 });
  m.avancar(50);
  assert.ok(Math.abs(cicloDoAnimal(m, a).fracao - 0.5) < 0.01);
  m.avancar(51);
  assert.equal(s.cocho, 0); assert.equal(s.bebedouro, 5, 'no segundo ciclo só havia comida para um');
  assert.ok(estaTratado(m, a)); assert.ok(!estaTratado(m, b));
  assert.equal(famintosDe(m, e.id), 1);
  assert.deepEqual(faltaNoAbrigo(m, e), { comida: true, agua: false });
  m.avancar(100);
  assert.ok(!estaTratado(m, a) && !estaTratado(m, b));
  assert.equal(s.bebedouro, 5, 'sem comida também não bebe');
  assert.deepEqual([a.ciclos, a.truques, b.ciclos, b.truques], [2, 2, 2, 1], 'a família soube de cada ciclo e se foi tratado');
  // sede: comida há, água não
  s.cocho = 6; s.bebedouro = 0;
  m.avancar(100);
  assert.equal(s.cocho, 6); assert.ok(!estaTratado(m, a));
  assert.deepEqual(faltaNoAbrigo(m, e), { comida: false, agua: true });
  assert.equal(m.animais.lista.length, 2, 'ninguém morre nem foge');
  // bicho sem ciclo ou sem abrigo não depende de trato
  assert.ok(estaTratado(m, porAnimal(m, 'foca')));
});

test('abastecer no meio de um ciclo sem trato: o bicho come na hora e o ciclo passa a valer como tratado', () => {
  const m = doCirco(), e = porAbrigo(m, 'galinheiro'), s = m.animais.abrigos[e.id];
  const a = porAnimal(m, 'pato');
  assert.ok(!estaTratado(m, a));
  dar(m, { milho: 5 });
  encherCocho(m, e);
  assert.ok(!estaTratado(m, a), 'só comida não basta'); assert.equal(s.cocho, 5);
  encherBebedouro(m, e);
  assert.ok(estaTratado(m, a)); assert.equal(s.cocho, 4); assert.equal(s.bebedouro, 7);
  pular(m, 100);
  assert.equal(a.truques, 1, 'o ciclo em que comeu atrasado contou como tratado');
});

test('fechado ou aberto dá no mesmo: horas de ausência resolvem os ciclos nos instantes exatos, em ordem', () => {
  const montar = () => {
    const m = doCirco(), e = porAbrigo(m, 'galinheiro'), c = fartura(m, porAbrigo(m, 'curral')), s = m.animais.abrigos[e.id];
    s.cocho = 5; s.bebedouro = 8;
    porAnimal(m, 'pato'); porAnimal(m, 'galinha');
    m.avancar(30);
    porAnimal(m, 'pato', { para: 4 }); porAnimal(m, 'galinha'); porAnimal(m, 'vaca');
    return { m, e, c };
  };
  const aberto = montar(), fechado = montar();
  aberto.m.avancar(1250);
  pular(fechado.m, 1250);
  const A = soAnimais(aberto.m), F = soAnimais(fechado.m);
  assert.deepEqual(A, F);
  // e não é um resultado vazio: houve fome, houve produção e houve quem parou
  const L = fechado.m.animais.lista;
  assert.equal(nivelDoCocho(fechado.m, fechado.e), 0);
  assert.deepEqual(L.map((a) => a.ciclos || 0), [12, 0, 4, 0, 0]);
  assert.deepEqual(L.map((a) => a.truques || 0), [2, 0, 1, 0, 0], 'a comida acabou na ordem do relógio');
  assert.equal(L[2].cicloDesde, 0, 'quem a família mandou parar, parou');
  assert.ok(L[1].pronto > 0 && L[4].pronto === 1);
  // em pedaços (abre, fecha, abre) também
  const picado = montar();
  pular(picado.m, 400); picado.m.avancar(3); pular(picado.m, 600); picado.m.avancar(2); pular(picado.m, 245);
  assert.deepEqual(soAnimais(picado.m).lista.map((a) => [a.id, a.pronto, a.produzidos, a.ciclos, a.truques, a.tratado]), F.lista.map((a) => [a.id, a.pronto, a.produzidos, a.ciclos, a.truques, a.tratado]));
});

test('gravar e carregar devolve os bichos, o cocho e o bebedouro; gravação de antes dos animais abre normalmente', () => {
  const m = doCirco(), e = porAbrigo(m, 'galinheiro');
  fartura(m, e);
  porAnimal(m, 'galinha'); porAnimal(m, 'pato'); porAnimal(m, 'foca');
  pular(m, 250);
  const g = JSON.parse(JSON.stringify(m.salvar()));
  const m2 = Mundo.carregar(dadosDeTeste(comCirco), g);
  assert.deepEqual(soAnimais(m2), soAnimais(m));
  assert.equal(nivelDoCocho(m2, e.id), nivelDoCocho(m, e)); assert.equal(nivelDoBebedouro(m2, e.id), nivelDoBebedouro(m, e));
  assert.equal(abrigoDe(m2, m2.animais.lista[0]).id, e.id);
  // os dois mundos seguem iguais
  pular(m, 500); pular(m2, 500);
  assert.deepEqual(soAnimais(m2), soAnimais(m));
  // gravação antiga (sem o sistema de animais): nenhum bicho, e o abrigo que já existia ganha cocho e bebedouro
  delete g.sistemas.animais; delete g.sistemas.producao;
  const m3 = Mundo.carregar(dadosDeTeste(comCirco), g);
  assert.deepEqual(m3.animais.lista, []);
  assert.equal(vagasLivres(m3, 'galinheiro'), 4);
  assert.deepEqual([nivelDoCocho(m3, e.id), nivelDoBebedouro(m3, e.id)], [0, 0]);
  m3.posses.ouro = 50;
  assert.ok(comprar(m3, 'galinha').ok);
  // bicho cuja espécie saiu dos dados fica de fora, sem quebrar
  const g2 = JSON.parse(JSON.stringify(m.salvar()));
  const m4 = Mundo.carregar(dadosDeTeste(comAnimais), g2);
  assert.deepEqual(m4.animais.lista.map((a) => a.especie), ['galinha']);
});

test('ampliar aumenta vagas, cocho e bebedouro; mudar o abrigo de lugar leva os bichos; abrigo com bicho não se guarda', () => {
  const m = mundoDosAnimais(), e = fartura(m, porAbrigo(m, 'galinheiro')), ev = ouvirTudo(m);
  for (let k = 0; k < 4; k++) porAnimal(m, 'galinha');
  m.posses.ouro = 200; m.posses.bolsa.tabua = 10; m.progresso.nivel = 3;
  assert.equal(comprar(m, 'galinha').motivo, 'abrigo-cheio');
  const antes = [nivelDoCocho(m, e), nivelDoBebedouro(m, e)];
  assert.ok(m.comando({ tipo: 'ampliar', entidade: e.id }).ok);
  pular(m, 201);
  assert.equal(e.nivel, 2);
  const est = estadoDoAbrigo(m, e);
  assert.deepEqual([est.vagas, est.cocho.capacidade, est.bebedouro.capacidade], [8, 12, 16]);
  assert.ok(nivelDoCocho(m, e) <= antes[0], 'o que havia no cocho continua lá (menos o que comeram na obra)');
  assert.equal(vagasLivres(m, 'galinheiro'), 4);
  assert.ok(comprar(m, 'galinha').ok);
  assert.ok(ev.de('abrigoMudou').length >= 1);
  dar(m, { milho: 20 }); encherCocho(m, e);
  assert.equal(nivelDoCocho(m, e), 12);
  // mudar de lugar: os bichos são do abrigo, não do lugar
  assert.ok(m.comando({ tipo: 'moverConstrucao', entidade: e.id, x: 6, z: 15 }).ok);
  assert.equal(animaisDe(m, { abrigo: e.id }).length, 5); assert.equal(nivelDoCocho(m, e), 12);
  // guardar: recusado enquanto houver bicho
  assert.deepEqual(COMPORTAMENTOS.galinheiro.podeTirar(m, e), { ok: false, motivo: 'abrigo-com-bicho', dados: { n: 5, construcao: 'galinheiro' }, limpar: undefined });
  for (const a of [...m.animais.lista]) tirarAnimal(m, a.id);
  assert.ok(COMPORTAMENTOS.galinheiro.podeTirar(m, e).ok);
});

test('o toque no abrigo abre o painel do abrigo; uma família pode responder antes (toqueNoAbrigo)', () => {
  const m = doCirco(), e = porAbrigo(m, 'galinheiro'), ev = ouvirTudo(m);
  const r = tocarEm(m, e.id);
  assert.ok(r.ok); assert.equal(r.dados.painel, 'abrigo');
  assert.deepEqual(ev.de('pediuPainel'), [{ painel: 'abrigo', arg: { entidade: e.id }, entidade: e.id }]);
  assert.equal(m.personagem.fila.length, 0, 'abre na hora, sem andar');
  e.circo = true;
  assert.equal(tocarEm(m, e.id).dados.painel, 'picadeiro');
});

test('animal comprado com cash: a entrega confere nível, abrigo e vaga (sem preço) e põe o bicho pela família', () => {
  const m = doCirco();
  assert.ok(ENTREGAS.animal.pode(m, 'leao').ok);
  assert.equal(ENTREGAS.animal.pode(m, 'tigre').motivo, 'nivel-baixo');
  m.progresso.nivel = 2;
  assert.deepEqual(ENTREGAS.animal.pode(m, 'tigre'), { ok: false, motivo: 'sem-abrigo', dados: { abrigo: 'galinheiro', animal: 'tigre' }, limpar: undefined });
  const e = porAbrigo(m, 'galinheiro');
  assert.ok(ENTREGAS.animal.pode(m, 'tigre').ok);
  visto.length = 0;
  ENTREGAS.animal.entregar(m, 'tigre'); ENTREGAS.animal.entregar(m, 'leao');
  assert.deepEqual(animaisDe(m, { familia: 'circo' }).map((a) => [a.especie, a.abrigo]), [['tigre', e.id], ['leao', null]]);
  assert.equal(visto.length, 2, 'a família recebeu os dois');
  ENTREGAS.animal.entregar(m, 'leao');
  assert.equal(animaisDe(m, { especie: 'leao' }).length, 1, 'o especial é um só');
  // família que ainda não existe no jogo: a compra vale e o bicho chega quando a família chegar (não trava a loja de cash)
  assert.ok(ENTREGAS.animal.pode(m, 'fantasma').ok);
  ENTREGAS.animal.entregar(m, 'fantasma');
  assert.equal(animaisDe(m, { especie: 'fantasma' }).length, 0);
  // especial pago que ainda não está na fazenda (gravação antiga) aparece sozinho
  const m2 = doCirco();
  m2.cash.animais.push('leao');
  m2.avancar(1.1);
  assert.equal(animaisDe(m2, { especie: 'leao' }).length, 1);
});

test('missões e conquistas: "comprou" com animal, família e classe, "tratou" com abrigo e "recolheu" com item são aceitos', () => {
  const missoes = (b) => {
    comAnimais(b);
    b.missoes.vizinho = [
      { id: 'galinhas', titulo: 'As galinhas', objetivo: { evento: 'comprou', filtro: { animal: 'galinha' }, n: 2 }, valeJaTer: true, recompensa: { ouro: 1 } },
      { id: 'trato', titulo: 'O trato', objetivo: { evento: 'tratou', filtro: { abrigo: 'galinheiro' }, n: 2 }, recompensa: { itens: { 'caixa-de-ovos': 1 } } },
      { id: 'ovos', titulo: 'Os ovos', objetivo: { evento: 'recolheu', filtro: { item: 'ovo' }, n: 4 }, recompensa: { ouro: 2 } },
      { id: 'leite', titulo: 'O leite', objetivo: { evento: 'recolheu', filtro: { item: 'leite' }, n: 1 }, recompensa: { ouro: 3 } },
      { id: 'ovelhas', titulo: 'As ovelhas', objetivo: { evento: 'recolheu', filtro: { item: 'la' }, n: 1 }, recompensa: { ouro: 4 } },
    ];
    b.missoes.conquistas = [
      { id: 'criador', nome: 'Criador', evento: 'comprou', filtro: { classe: 'animal' }, marcos: [2], recompensas: [{ ouro: 5 }] },
      { id: 'bom-trato', nome: 'Bom trato', evento: 'tratou', marcos: [2], recompensas: [{ ouro: 5 }] },
      { id: 'ovos-frescos', nome: 'Ovos frescos', evento: 'recolheu', filtro: { item: 'ovo' }, marcos: [4], recompensas: [{ ouro: 5 }] },
    ];
  };
  const b = brutoDeTeste(); missoes(b);
  assert.deepEqual(prepararDados(b).problemas.map((p) => p.texto), [], 'os dados não reclamam de nenhum filtro');
  const m = mundoDosAnimais(missoes), e = porAbrigo(m, 'galinheiro'), ev = ouvirTudo(m);
  m.posses.ouro = 500;
  comprar(m, 'galinha');
  assert.deepEqual(m.missoes.feitas, []);
  comprar(m, 'galinha');
  assert.deepEqual(m.missoes.feitas, ['galinhas']);
  assert.deepEqual(ev.de('conquistaPronta').map((d) => d.id), ['criador'], 'a conquista de comprar animal andou junto');
  dar(m, { milho: 6 });
  encherCocho(m, e); encherBebedouro(m, e);
  assert.deepEqual(m.missoes.feitas, ['galinhas', 'trato']);
  assert.ok(m.posses.recipientes.includes('caixa-de-ovos'), 'a caixa veio de recompensa');
  pular(m, 201);
  recolher(m, e);
  assert.deepEqual(m.missoes.feitas, ['galinhas', 'trato', 'ovos']);
  const c = fartura(m, porAbrigo(m, 'curral')), a = fartura(m, porAbrigo(m, 'aprisco'));
  dar(m, { balde: 1, 'tesoura-de-tosquia': 1 });
  comprar(m, 'vaca'); comprar(m, 'ovelha');
  pular(m, 601);
  recolher(m, c); recolher(m, a);
  assert.deepEqual(m.missoes.feitas, ['galinhas', 'trato', 'ovos', 'leite', 'ovelhas']);
  // quem já tinha as galinhas antes de o vizinho pedir não fica preso
  const m2 = mundoDosAnimais(missoes);
  porAbrigo(m2, 'galinheiro'); porAnimal(m2, 'galinha'); porAnimal(m2, 'galinha');
  m2.avancar(1.1);
  assert.deepEqual(m2.missoes.feitas, ['galinhas']);
});

// ====================================================================================================
// OS DE PRODUÇÃO
// ====================================================================================================

test('bem tratada, a galinha rende 1 por ciclo; sem trato, a metade (dois ciclos para um ovo); o ninho guarda até 3 e ela para', () => {
  const { m, e, bichos: [a] } = galinheiroCom(1), s = m.animais.abrigos[e.id], ev = ouvirTudo(m);
  pular(m, 101);
  assert.equal(a.pronto, 1); assert.equal(prontosNoAbrigo(m, e.id), 1);
  assert.deepEqual(ev.de('animalProduziu').map((d) => [d.animal, d.item, d.n]), [['galinha', 'ovo', 1]]);
  s.cocho = 0; // acabou a comida: o ciclo que começa agora já está garantido; os seguintes não
  pular(m, 100);
  assert.equal(a.pronto, 2);
  pular(m, 100);
  assert.equal(a.pronto, 2, 'meio ovo não aparece'); assert.equal(a.resto, 0.5);
  assert.equal(situacaoDoAnimal(m, a).estado, 'sem-trato');
  pular(m, 100);
  assert.equal(a.pronto, 3, 'as duas metades fizeram um ovo'); assert.equal(a.resto, 0);
  // ninho cheio: ela para de produzir e de comer, e nada se perde
  s.cocho = 6;
  const sit = situacaoDoAnimal(m, a);
  assert.equal(sit.estado, 'pronto'); assert.ok(sit.cheio); assert.ok(!sit.rodando);
  pular(m, 5000);
  assert.equal(a.pronto, 3); assert.equal(s.cocho, 6, 'parada, não come');
  assert.deepEqual(pedidoDoAbrigo(m, e), { produto: 'ovo', fim: false, comida: false, agua: false });
});

test('recolher pede a ferramenta certa; a dica diz qual falta; com a caixa, um pedido recolhe de todas e dá experiência', () => {
  const { m, e, bichos } = galinheiroCom(3), ev = ouvirTudo(m);
  pular(m, 201);
  assert.equal(prontosNoAbrigo(m, e.id), 6);
  assert.deepEqual(recolher(m, e), { ok: false, motivo: 'falta-de-recolher', dados: { item: 'caixa-de-ovos', funcao: 'caixa-de-ovos', animal: 'galinha' } });
  assert.equal(ev.de('faltou')[0].motivo, 'falta-de-recolher');
  dar(m, { 'caixa-de-ovos': 1 });
  const xp = barraDeXp(m).feito;
  assert.ok(recolher(m, e).ok);
  // a caixa leva 4: recolheu 2 + 2 e parou; o resto fica no ninho, sem se perder
  assert.deepEqual(ev.de('recolheu').map((d) => [d.item, d.n, d.animal]), [['ovo', 2, 'galinha'], ['ovo', 2, 'galinha']]);
  assert.equal(m.posses.cesto.itens.ovo, 4); assert.equal(noRecipiente(m, 'caixa-de-ovos'), 4);
  assert.equal(prontosNoAbrigo(m, e.id), 2);
  assert.equal(barraDeXp(m).feito - xp, 8, 'a experiência do bicho, por produto');
  assert.deepEqual(recolher(m, e), { ok: false, motivo: 'recipiente-cheio', dados: { item: 'caixa-de-ovos', produto: 'ovo' } });
  // o ovo viaja na caixa: não ocupa o cesto
  assert.equal(noCesto(m), 4); assert.equal(foraDoCesto(m), 4); assert.equal(espacoNoCesto(m), capacidadeDoCesto(m));
  // quem foi recolhida volta a produzir
  assert.ok(situacaoDoAnimal(m, bichos[0]).rodando);
  // a caixa esvazia junto com o cesto, no celeiro
  tocarEm(m, 'celeiro'); ateParar(m);
  assert.equal(m.posses.cesto.itens.ovo || 0, 0); assert.equal(m.posses.celeiro.itens.ovo, 4);
  assert.ok(recolher(m, e).ok);
  assert.equal(m.posses.cesto.itens.ovo, 2); assert.equal(prontosNoAbrigo(m, e.id), 0);
  assert.deepEqual(recolher(m, e), { ok: false, motivo: 'nada-para-recolher', dados: { construcao: 'galinheiro' } });
  // ...ou na banca, vendendo
  const ouro = m.posses.ouro;
  tocarEm(m, 'banca'); ateParar(m);
  assert.equal(m.posses.ouro, ouro + 2 * 3); assert.equal(noCesto(m), 0);
  // a caixa maior leva mais
  dar(m, { 'caixa-de-ovos-grande': 1 });
  assert.equal(podeRecolher(m, m.dados.animais.galinha).cabe, 9);
});

test('no modo mão, tocar no abrigo com produto pronto recolhe direto; sem produto (ou sem a ferramenta), abre o painel', () => {
  const { m, e } = galinheiroCom(2), ev = ouvirTudo(m);
  modo(m, 'mao');
  assert.equal(tocarEm(m, e.id).dados.painel, 'abrigo', 'nada pronto: painel');
  pular(m, 101);
  assert.equal(tocarEm(m, e.id).dados.painel, 'abrigo', 'sem a caixa: o painel explica o que falta');
  dar(m, { 'caixa-de-ovos': 1 }); ev.limpar();
  assert.ok(tocarEm(m, e.id).ok);
  assert.equal(ev.de('pediuPainel').length, 0);
  assert.ok(tocarEm(m, e.id).repetida, 'o toque repetido não empilha');
  ateParar(m);
  assert.equal(m.posses.cesto.itens.ovo, 2);
  assert.equal(tocarEm(m, e.id).dados.painel, 'abrigo');
  // noutro modo o toque abre sempre o painel
  pular(m, 101); modo(m, 'enxada');
  assert.equal(tocarEm(m, e.id).dados.painel, 'abrigo');
});

test('vaca e balde, ovelha e tesoura: o leite vai no balde; a tesoura é ferramenta de cinto e a lã vai para o cesto', () => {
  const m = mundoDosAnimais(), c = fartura(m, porAbrigo(m, 'curral')), ap = fartura(m, porAbrigo(m, 'aprisco')), ev = ouvirTudo(m);
  const v1 = porAnimal(m, 'vaca'), v2 = porAnimal(m, 'vaca'), o1 = porAnimal(m, 'ovelha');
  porAnimal(m, 'ovelha');
  assert.equal(nivelDoCocho(m, c), 2); assert.equal(nivelDoBebedouro(m, c), 4, 'a vaca bebe 2');
  pular(m, 301);
  assert.equal(v1.pronto, 1); assert.ok(!situacaoDoAnimal(m, v1).rodando, 'a vaca espera a ordenha (acumula 1)');
  assert.equal(o1.pronto, 0);
  assert.equal(recolher(m, c).dados.item, 'balde');
  dar(m, { balde: 1 });
  recolher(m, c);
  assert.equal(m.posses.cesto.itens.leite, 2); assert.equal(ev.de('recolheu').length, 2);
  assert.equal(ev.de('recolheu')[0].animal, 'vaca');
  assert.ok(situacaoDoAnimal(m, v2).rodando);
  assert.equal(espacoNoCesto(m), capacidadeDoCesto(m), 'o leite vai no balde');
  pular(m, 301);
  assert.equal(recolher(m, c).motivo, 'recipiente-cheio');
  // ovelha: sem tesoura, a dica; com ela no suporte, a personagem busca sozinha
  assert.deepEqual(recolher(m, ap), { ok: false, motivo: 'falta-de-recolher', dados: { item: 'tesoura-de-tosquia', funcao: 'tesoura', animal: 'ovelha' } });
  dar(m, { 'tesoura-de-tosquia': 1 });
  m.posses.ferramentas['tesoura-de-tosquia'].onde = 'suporte';
  ev.limpar();
  assert.ok(recolher(m, ap).ok);
  assert.equal(m.posses.ferramentas['tesoura-de-tosquia'].onde, 'cinto');
  assert.deepEqual(ev.de('recolheu').map((d) => [d.item, d.n, d.animal]), [['la', 1, 'ovelha'], ['la', 1, 'ovelha']]);
  assert.equal(m.posses.cesto.itens.la, 2);
  assert.equal(espacoNoCesto(m), capacidadeDoCesto(m) - 2, 'a lã ocupa o cesto');
  // cesto cheio: a lã espera na ovelha
  pular(m, 601); m.posses.cesto.itens.rabanete = 4;
  assert.equal(recolher(m, ap).motivo, 'cesto-cheio');
});

test('vida produtiva: avisa nos últimos 10%, para no fim e espera a escolha entre as três saídas, sem pressa', () => {
  const fartos = (x) => { comAnimais(x); x.animais.galinha.vidaProdutiva = 20; x.construcoes.galinheiro.cocho = 30; x.construcoes.galinheiro.bebedouro = 40; };
  const { m, e, bichos: [a, b, c] } = galinheiroCom(3, fartos), ev = ouvirTudo(m), s = m.animais.abrigos[e.id];
  dar(m, { 'caixa-de-ovos-grande': 1 });
  const rodada = () => { s.cocho = 30; s.bebedouro = 40; pular(m, 301); recolher(m, e); tocarEm(m, 'banca'); ateParar(m); };
  for (let k = 0; k < 5; k++) rodada();
  assert.equal(a.produzidos, 15);
  assert.deepEqual(vidaDoAnimal(m, a), { total: 20, feitos: 15, restam: 5, fracao: 0.25, acabou: false, perto: false });
  assert.equal(ev.de('fimDeVidaPerto').length, 0);
  rodada();
  assert.equal(a.produzidos, 18);
  assert.ok(vidaDoAnimal(m, a).perto);
  assert.deepEqual(ev.de('fimDeVidaPerto').map((d) => [d.animal, d.restam]), [['galinha', 2], ['galinha', 2], ['galinha', 2]], 'um aviso por bicho, uma vez só');
  assert.equal(m.comando({ tipo: 'destinoDoAnimal', id: a.id, destino: 'frigorifico' }).motivo, 'ainda-produz');
  s.cocho = 30; s.bebedouro = 40;
  pular(m, 5000);
  assert.deepEqual([a.produzidos, a.pronto, a.fim], [20, 2, 'espera'], 'não passa da vida produtiva');
  assert.equal(ev.de('fimDeVida').length, 3); assert.equal(ev.de('fimDeVidaPerto').length, 3);
  assert.equal(situacaoDoAnimal(m, a).estado, 'fim'); assert.ok(pedidoDoAbrigo(m, e).fim);
  const comida = s.cocho;
  pular(m, 100000);
  assert.equal(s.cocho, comida, 'esperando a escolha, não come nem produz: pode demorar o quanto quiser');
  // 1) frigorífico: sai, paga, a vaga abre e o que estava no ninho vai para o celeiro
  const ouro = m.posses.ouro, ovos = m.posses.celeiro.itens.ovo || 0;
  assert.deepEqual(m.comando({ tipo: 'destinoDoAnimal', id: a.id, destino: 'frigorifico' }).dados, { id: a.id, animal: 'galinha', destino: 'frigorifico', ouro: 4, sobra: 2 });
  assert.equal(m.posses.ouro, ouro + 4); assert.equal(m.posses.celeiro.itens.ovo, ovos + 2);
  assert.equal(animalPorId(m, a.id), null); assert.equal(vagasLivres(m, 'galinheiro'), 2);
  // 2) fazendeiro: paga mais
  recolher(m, e);
  assert.equal(m.comando({ tipo: 'destinoDoAnimal', id: b.id, destino: 'fazendeiro' }).dados.ouro, 6);
  assert.equal(m.posses.ouro, ouro + 10);
  assert.deepEqual(ev.de('vendeuAnimal').map((d) => [d.animal, d.destino, d.ouro]), [['galinha', 'frigorifico', 4], ['galinha', 'fazendeiro', 6]]);
  // 3) de estimação: fica, ocupa a vaga, volta a comer e não produz mais
  assert.ok(m.comando({ tipo: 'destinoDoAnimal', id: c.id, destino: 'estimacao' }).ok);
  assert.equal(c.fim, 'estimacao'); assert.equal(situacaoDoAnimal(m, c).estado, 'estimacao');
  assert.equal(vagasLivres(m, 'galinheiro'), 3, 'a vaga dela continua ocupada');
  s.cocho = 6; s.bebedouro = 8;
  pular(m, 250);
  assert.equal(s.cocho, 4, 'come a cada ciclo'); assert.equal(c.produzidos, 20); assert.equal(c.pronto, 0);
  assert.ok(!pedidoDoAbrigo(m, e).fim);
  // grava e volta do mesmo jeito; e quem ficou de estimação ainda pode ser vendido depois
  const m2 = Mundo.carregar(dadosDeTeste(fartos), JSON.parse(JSON.stringify(m.salvar())));
  assert.deepEqual(soAnimais(m2), soAnimais(m));
  assert.equal(m2.comando({ tipo: 'destinoDoAnimal', id: c.id, destino: 'fazendeiro' }).dados.ouro, 6);
  assert.equal(m2.animais.lista.length, 0);
  assert.equal(m.comando({ tipo: 'destinoDoAnimal', id: c.id, destino: 'churrasco' }).motivo, 'destino-desconhecido');
});

test('gravar no meio da produção: o ninho, a metade de produto e a espera pela coleta voltam iguais', () => {
  const { m, e, bichos: [a, b] } = galinheiroCom(2), s = m.animais.abrigos[e.id];
  s.cocho = 1; // só a primeira come no segundo ciclo
  pular(m, 250);
  assert.deepEqual([a.pronto, a.resto, b.pronto, b.resto], [2, 0, 1, 0.5]);
  const dados = () => dadosDeTeste(comAnimais);
  const m2 = Mundo.carregar(dados(), JSON.parse(JSON.stringify(m.salvar())));
  assert.deepEqual(soAnimais(m2), soAnimais(m));
  pular(m, 1000); pular(m2, 1000);
  assert.deepEqual(soAnimais(m2), soAnimais(m));
  assert.deepEqual(m2.animais.lista.map((x) => x.pronto), [3, 3]);
  // gravado com o ninho cheio: carrega parada e volta a produzir quando recolhem
  const m3 = Mundo.carregar(dados(), JSON.parse(JSON.stringify(m2.salvar())));
  assert.ok(!situacaoDoAnimal(m3, m3.animais.lista[0]).rodando);
  dar(m3, { 'caixa-de-ovos-grande': 1 });
  recolher(m3, construcaoPorId(m3, e.id));
  assert.equal(m3.posses.cesto.itens.ovo, 6);
  assert.ok(situacaoDoAnimal(m3, m3.animais.lista[0]).rodando);
  assert.equal(noCeleiro(m3), noCeleiro(m2));
});

test('os dados: produção sem produto é erro; ferramenta desconhecida vira aviso e o produto se recolhe com a mão', () => {
  const b = brutoDeTeste(); comAnimais(b);
  b.animais.galinha.produto = 'pena';
  assert.ok(prepararDados(b).problemas.some((p) => p.grave && /pena/.test(p.texto)));
  const m = mundoDosAnimais((x) => { x.animais.galinha.ferramenta = 'luva'; }), e = fartura(m, porAbrigo(m, 'galinheiro'));
  porAnimal(m, 'galinha');
  pular(m, 101);
  assert.ok(recolher(m, e).ok);
  assert.equal(m.posses.cesto.itens.ovo, 1); assert.equal(espacoNoCesto(m), capacidadeDoCesto(m) - 1);
  void porConstrucao; void comecarCiclo; void podeComprarAnimal;
});
