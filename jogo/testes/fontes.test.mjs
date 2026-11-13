// "Onde conseguir?" (nucleo/fontes.js) com os dados de verdade: as fontes de cada material e quando abrem, para que o
// material serve, o que a missão da vez pede, o validador das fontes (com dados quebrados de propósito), o Seu Tonho
// que explica cada material uma vez só e a nota dos prêmios ("+10 pregos: servem para o estábulo...").
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lerPasta, pular } from './apoio.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { prepararDados } from '../src/nucleo/dados.js';
import { adquirirFerramenta } from '../src/nucleo/sistemas/posses.js';
import { construcoesDe } from '../src/nucleo/sistemas/construcao.js';
import {
  fontesDoItem, faltasDe, temFontes, comoConseguir, paraQueServe, materialDaMissao, conferirFontes, nivelDaFonte,
  usosDoPremio, materialParaExplicar, jaExplicou, dicaDoMaterial, premiosCom, pedidosDeMaterial,
} from '../src/nucleo/fontes.js';
import { T } from '../src/ui/textos.js';
import '../src/ui/textos/fontes.js';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const BRUTO = lerPasta(path.join(aqui, '..', 'dados'));
const copia = (o) => JSON.parse(JSON.stringify(o));
function dadosDeVerdade(muda) {
  const b = copia(BRUTO);
  if (muda) muda(b);
  return prepararDados(b).dados;
}
const novo = (muda) => new Mundo(dadosDeVerdade(muda), { agora: 1_700_000_000_000 });
// o mundo no nível pedido, com o que o nível já teria (atalho de teste: 60 de cada material na bolsa)
function noNivel(nivel) {
  const m = novo();
  m.comando({ tipo: 'comecarChegada' });
  assert.equal(m.comando({ tipo: 'atalhoDeTeste', nivel }).ok, true);
  return m;
}
// constrói perto da personagem (pagando, no primeiro lugar livre) e espera a obra acabar
function construirPerto(m, id) {
  const p = m.personagem;
  for (let r = 3; r < 16; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
    if (m.comando({ tipo: 'construir', id, x: Math.floor(p.x) + dx, z: Math.floor(p.z) + dz, jaJa: true, quieto: true }).ok) { pular(m, 600); return true; }
  }
  return false;
}
const tipos = (l) => l.map((f) => f.tipo + (f.obstaculo ? ':' + f.obstaculo : ''));
const MATERIAIS = ['madeira', 'tabua', 'prego', 'pedra', 'fibra', 'racao', 'cartela-vazia', 'garrafa-vazia', 'saco-vazio'];

test('todo material que as obras e receitas pedem tem fontes e a fala do Seu Tonho nos dados', () => {
  const D = dadosDeVerdade(), m = new Mundo(D, { agora: 1 });
  for (const id of MATERIAIS) {
    assert.ok(temFontes(m, id), `${id}: tem "fontes"`);
    assert.ok(comoConseguir(m, id).length > 20, `${id}: tem "comoConseguir"`);
  }
  assert.deepEqual(conferirFontes(D), [], 'o validador não acha problema nos dados de verdade');
});

test('as fontes de um material: quando abrem, as que valem agora vêm primeiro', () => {
  const m = novo();
  // nível 1: madeira ainda não tem fonte aberta (machado e loja abrem no 3); só o presente do dia que vem
  let f = fontesDoItem(m, 'madeira');
  assert.deepEqual(tipos(f), ['premios', 'limpar:toco', 'loja', 'bicho', 'limpar:mata']);
  assert.equal(f[0].ok, true); assert.ok(f[0].dia && f[0].dia.n > 0, 'o presente do dia que traz madeira');
  assert.deepEqual(f.slice(1).map((x) => [x.ok, x.nivel]), [[false, 3], [false, 3], [false, 8], [false, 10]]);
  const toco = f[1];
  assert.equal(toco.da, 2); assert.equal(toco.ferramentaItem, 'machado-velho'); assert.equal(toco.temFerramenta, false);
  assert.ok(toco.restam > 0, 'tem tocos na terra da fazenda');
  assert.equal(f[4].forte, true, 'a árvore do mato pede o machado de ferro');
  assert.equal(nivelDaFonte(m.dados, 'madeira', { tipo: 'limpar', obstaculo: 'mata' }), 10);
  // com o machado na mão e no nível da loja: cortar tocos e comprar já valem, nessa ordem (a dos dados)
  adquirirFerramenta(m, 'machado-velho'); m.progresso.nivel = 3;
  f = fontesDoItem(m, 'madeira');
  assert.deepEqual(tipos(f).slice(0, 3), ['limpar:toco', 'loja', 'premios']);
  assert.ok(f[0].ok && f[1].ok);
  assert.equal(f[1].aba, 'materiais'); assert.equal(f[1].preco, m.dados.itens.madeira.compra);
  // os tocos acabaram na terra: a fonte some do "agora" e aponta o lote à venda que ainda tem
  const loc = m.locais.fazenda;
  for (const e of [...loc.entidades]) if (e.tipo === 'toco' && loc.ehPropria(e.x, e.z)) loc.tirar(e.id);
  f = fontesDoItem(m, 'madeira');
  const t2 = f.find((x) => x.obstaculo === 'toco');
  assert.equal(t2.ok, false); assert.equal(t2.restam, 0);
  assert.ok(t2.naTerraNova && t2.naTerraNova.n > 0 && t2.naTerraNova.nome, 'o lote à venda com tocos');
});

test('tábua: a bancada só vale depois de construída; prego: só loja e prêmios', () => {
  const m = noNivel(4);
  let rec = fontesDoItem(m, 'tabua').find((x) => x.tipo === 'receita');
  assert.equal(rec.onde, 'bancada-de-carpintaria'); assert.equal(rec.temConstrucao, false); assert.equal(rec.ok, false);
  assert.deepEqual(rec.entra, { madeira: 2 });
  assert.ok(construirPerto(m, 'bancada-de-carpintaria') && construcoesDe(m, 'bancada-de-carpintaria').length === 1, 'a bancada foi construída');
  rec = fontesDoItem(m, 'tabua').find((x) => x.tipo === 'receita');
  assert.equal(rec.temConstrucao, true); assert.equal(rec.ok, true);
  assert.equal(fontesDoItem(m, 'tabua')[0].tipo, 'receita', 'a bancada vem antes da loja');
  assert.deepEqual(tipos(fontesDoItem(m, 'prego')).sort(), ['loja', 'premios']);
});

test('os prêmios que ainda vêm com o material: a missão, o nível e o presente do dia', () => {
  const m = novo();
  const p = premiosCom(m, 'prego');
  assert.equal(p.missao.id, 'bancada-de-carpintaria'); assert.equal(p.missao.n, 30);
  assert.ok(p.nivel && p.nivel.nivel > 1 && p.nivel.n > 0);
  assert.deepEqual([p.dia.dia, p.dia.hoje], [1, true], 'o presente de hoje (dia 1) tem pregos');
  // a missão cumprida sai da lista: vem a próxima que dá prego
  m.missoes.feitas.push('bancada-de-carpintaria');
  assert.notEqual((premiosCom(m, 'prego').missao || {}).id, 'bancada-de-carpintaria');
});

test('para que o material serve: o que vem primeiro e o que o nível já deixa', () => {
  const m = novo();
  let u = paraQueServe(m, 'prego');
  assert.deepEqual(u.map((x) => x.id), ['estabulo', 'caixote-de-venda', 'galinheiro']);
  assert.ok(u.every((x) => !x.ja));
  assert.equal(u[1].tipo, 'reforma');
  m.progresso.nivel = 5;
  u = paraQueServe(m, 'prego', 5);
  assert.ok(u.slice(0, 3).every((x) => x.ja), 'o que já está aberto vem antes');
  // o que já foi construído sai da lista
  const m2 = noNivel(5);
  assert.ok(paraQueServe(m2, 'prego', 9).some((x) => x.id === 'estabulo'));
  assert.ok(construirPerto(m2, 'bancada-de-carpintaria') && construirPerto(m2, 'estabulo'), 'o estábulo (pede a bancada) foi construído');
  assert.ok(!paraQueServe(m2, 'prego', 9).some((x) => x.id === 'estabulo'));
});

test('o que a missão da vez pede de material', () => {
  const m = novo(), lista = m.dados.missoes.vizinho, ate = (id) => lista.slice(0, lista.findIndex((x) => x.id === id)).map((x) => x.id);
  assert.equal(materialDaMissao(m), null, 'falar com o Seu Tonho não pede material');
  // construir o galinheiro: o preço dele (no nível dele)
  m.missoes.feitas = ate('galinheiro'); m.progresso.nivel = 5;
  assert.deepEqual(materialDaMissao(m), { itens: m.dados.construcoes.galinheiro.custo.itens, nome: 'Galinheiro' });
  m.progresso.nivel = 4;
  assert.equal(materialDaMissao(m), null, 'a missão que espera o nível não pede nada ainda');
  // serrar 4 tábuas: 2 madeiras por tábua, só as que faltam
  m.missoes.feitas = ate('tabuas'); m.progresso.nivel = 4; m.missoes.de = 'tabuas'; m.missoes.conta = 1;
  assert.deepEqual(materialDaMissao(m).itens, { madeira: 6 });
  // reformar a banca: o custo da reforma
  m.missoes.feitas = ate('reformar-a-banca'); m.progresso.nivel = 5; m.missoes.de = null; m.missoes.conta = 0;
  assert.deepEqual(materialDaMissao(m).itens, m.dados.construcoes['caixote-de-venda'].reforma.custo.itens);
});

test('o validador das fontes acha dado quebrado', () => {
  const graves = (muda) => conferirFontes(dadosDeVerdade(muda)).filter((p) => p.grave).map((p) => p.texto);
  assert.match(graves((b) => { b.itens.prego.fontes = [{ tipo: 'achar' }]; }).join('\n'), /tipo desconhecido/);
  assert.match(graves((b) => { b.itens.prego.fontes = 'loja'; }).join('\n'), /devia ser uma lista/);
  assert.match(graves((b) => { b.itens['saco-vazio'].fontes.push({ tipo: 'receita', receita: 'tabua' }); }).join('\n'), /não faz saco-vazio/);
  assert.match(graves((b) => { b.itens.prego.fontes.push({ tipo: 'limpar', obstaculo: 'toco' }); }).join('\n'), /não dá prego/);
  assert.match(graves((b) => { b.itens.prego.fontes.push({ tipo: 'limpar', obstaculo: 'cupinzeiro' }); }).join('\n'), /não existe em terras/);
  assert.match(graves((b) => { b.itens.prego.fontes.push({ tipo: 'bicho', animal: 'galinha' }); }).join('\n'), /não traz prego/);
  // sem fontes: a obra que pede prego fica sem saída
  assert.match(graves((b) => { delete b.itens.prego.fontes; }).join('\n'), /não diz de onde prego vem/);
  // a única fonte abre depois do pedido
  assert.match(graves((b) => { b.itens.prego.fontes = [{ tipo: 'loja' }]; b.itens.prego.nivel = 9; }).join('\n'), /só abre no nível 9/);
  // a loja que não vende o item
  assert.match(graves((b) => { delete b.itens.prego.compra; }).join('\n'), /não está à venda/);
  // sem a fala do Seu Tonho é só aviso
  const p = conferirFontes(dadosDeVerdade((b) => { delete b.itens.prego.comoConseguir; }));
  assert.ok(p.length === 1 && !p[0].grave && /comoConseguir/.test(p[0].texto));
});

test('o Seu Tonho explica cada material uma vez só, e isso fica gravado', () => {
  const m = novo();
  m.posses.bolsa.prego = 2;
  const custo = { prego: 5, tabua: 3, 'semente-milho': 9 };
  assert.deepEqual(faltasDe(m, custo).map((f) => [f.item, f.falta]), [['prego', 3], ['tabua', 3], ['semente-milho', 9]]);
  assert.equal(materialParaExplicar(m, custo), 'prego');
  assert.equal(m.comando({ tipo: 'viuDica', dica: dicaDoMaterial('prego') }).ok, true);
  assert.ok(jaExplicou(m, 'prego'));
  assert.equal(materialParaExplicar(m, custo), 'tabua', 'o prego já foi; agora a tábua');
  m.comando({ tipo: 'viuDica', dica: dicaDoMaterial('tabua') });
  assert.equal(materialParaExplicar(m, custo), null, 'semente não tem fonte de material: o Seu Tonho não fala dela');
  assert.equal(materialParaExplicar(m, { madeira: 1 }), 'madeira');
  m.posses.bolsa.madeira = 1;
  assert.equal(materialParaExplicar(m, { madeira: 1 }), null, 'não falta: não explica');
  const n = Mundo.carregar(m.dados, copia(m.salvar()));
  assert.ok(jaExplicou(n, 'prego') && jaExplicou(n, 'tabua') && !jaExplicou(n, 'madeira'), 'gravado');
});

test('o prêmio com material diz para que ele serve', () => {
  const m = novo();
  assert.equal(usosDoPremio(m, { 'semente-milho': 3 }), null, 'semente não é material');
  const u = usosDoPremio(m, { prego: 10, 'semente-milho': 3 });
  assert.deepEqual(u.mats, { prego: 10 });
  assert.deepEqual(u.usos.map((x) => x.id), ['estabulo', 'caixote-de-venda']);
  assert.equal(T.fontes.nota(m.dados, u.mats, u.usos), '+10 pregos: servem para o estábulo e montar a banca');
  const v = usosDoPremio(m, { tabua: 1, fibra: 8 });
  assert.equal(T.fontes.nota(m.dados, v.mats, v.usos.slice(0, 1)), `+1 tábua e +8 fibras: servem para ${T.fontes.uso(v.usos[0])}`);
  assert.equal(T.fontes.nota(m.dados, { tabua: 1 }, [{ tipo: 'construcao', nome: 'Galinheiro' }]), '+1 tábua: serve para o galinheiro');
  assert.equal(T.fontes.nota(m.dados, { 'cartela-vazia': 5 }, [{ tipo: 'receita', nome: 'Dúzia de ovos' }]), '+5 cartelas vazias: servem para fazer dúzia de ovos');
  assert.equal(T.fontes.nota(m.dados, { prego: 4 }, [{ tipo: 'ampliacao', nome: 'Bancada de carpintaria' }, { tipo: 'reforma', nome: 'Cerca nova' }]), '+4 pregos: servem para ampliar a bancada de carpintaria e a cerca nova');
});

// o adubo (frente da área de plantio): preparar terra nova no campo pede adubo; os números aqui são de teste
function comAdubo(b) {
  if (!b.itens.adubo) b.itens.adubo = { nome: 'Adubo', tipo: 'material', compra: 3, venda: 1, nivel: 3, descricao: 'teste' };
  b.itens.adubo.fontes = [{ tipo: 'loja' }, { tipo: 'premios' }];
  b.itens.adubo.comoConseguir = 'Adubo se compra na loja, em Materiais.';
  b.regras.campo = { limite: [{ nivel: 1, casas: 12 }, { nivel: 3, casas: 18 }, { nivel: 6, casas: 30 }], preparo: { ouroPorCasa: 2, aduboPorCasa: 1 } };
  const r = b.missoes.vizinho.find((x) => x.id === 'regador-novo').recompensa;
  r.itens = { ...(r.itens || {}), adubo: 6 };
  if (!b.missoes.vizinho.some((x) => x.objetivo.evento === 'preparou')) b.missoes.vizinho.unshift({ id: 'teste-preparar', nivel: 1, titulo: 'Preparar', fala: 'Prepare a terra.', objetivo: { evento: 'preparou', n: 6 }, recompensa: { xp: 1 } });
}

test('adubo: o validador pede fonte para ele, e o prêmio diz que serve para ampliar o campo', () => {
  const D = dadosDeVerdade(comAdubo);
  assert.deepEqual(conferirFontes(D).filter((p) => p.grave), []);
  const p = pedidosDeMaterial(D).find((x) => x.item === 'adubo');
  assert.deepEqual([p.n, p.nivel], [6, 3], 'uma fileira de 6 casas, no nível em que o campo pode crescer');
  assert.match(conferirFontes(dadosDeVerdade((b) => { comAdubo(b); delete b.itens.adubo.fontes; })).map((x) => x.texto).join('\n'), /não diz de onde adubo vem/);
  assert.match(conferirFontes(dadosDeVerdade((b) => { comAdubo(b); b.itens.adubo.fontes = [{ tipo: 'loja' }]; b.itens.adubo.nivel = 5; })).map((x) => x.texto).join('\n'), /pede adubo no nível 3, mas a primeira fonte de adubo só abre no nível 5/);
  const m = new Mundo(D, { agora: 1_700_000_000_000 });
  let u = paraQueServe(m, 'adubo');
  assert.deepEqual(u.map((x) => [x.tipo, x.nivel, x.ja, x.precisa]), [['campo', 3, false, 6]]);
  m.progresso.nivel = 3;
  assert.deepEqual(paraQueServe(m, 'adubo').map((x) => [x.tipo, x.ja]), [['campo', true]]);
  u = usosDoPremio(m, { adubo: 6 });
  assert.equal(T.fontes.nota(m.dados, u.mats, u.usos), '+6 adubos: servem para ampliar o campo');
  // o campo no maior tamanho que os dados deixam: o adubo não serve para mais nada
  m.progresso.nivel = 6; m.campo.tamanho = 30;
  assert.deepEqual(paraQueServe(m, 'adubo'), []);
  // as fontes no cartão: a loja (nível 3) e a missão do regador
  m.progresso.nivel = 1; m.campo.tamanho = -1;
  const f = fontesDoItem(m, 'adubo');
  assert.deepEqual(tipos(f), ['premios', 'loja']);
  assert.equal(f[0].missao.id, 'regador-novo'); assert.equal(f[1].nivel, 3);
});

test('adubo: a missão de preparar a terra mostra o adubo das casas que faltam', () => {
  const m = new Mundo(dadosDeVerdade(comAdubo), { agora: 1_700_000_000_000 });
  const lista = m.dados.missoes.vizinho, i = lista.findIndex((x) => x.objetivo.evento === 'preparou');
  m.missoes.feitas = lista.slice(0, i).map((x) => x.id); m.progresso.nivel = Math.max(1, lista[i].nivel || 1);
  assert.deepEqual(materialDaMissao(m), { itens: { adubo: lista[i].objetivo.n }, nome: 'Campo' });
  m.missoes.de = lista[i].id; m.missoes.conta = 2;
  assert.deepEqual(materialDaMissao(m).itens, { adubo: lista[i].objetivo.n - 2 });
});
