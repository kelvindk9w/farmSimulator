// O quadro de pedidos: quando abre, como os pedidos nascem (pelas regras de pedidos.json, com sorteio de semente),
// entregar, trocar, a espera das vagas, a gravação e a missão do primeiro pedido.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { novoMundo, lerPasta, ouvirTudo, pular, tocarEm, tocar, modo, ateParar, porConstrucao } from './apoio.mjs';
import { comIndustria, mundoDaIndustria, noNivel, dar, porIndustria, QUADRO_EM } from './apoio-industria.mjs';
import { comTerras } from './apoio-terras.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { prepararDados } from '../src/nucleo/dados.js';
import { quantoTem, capacidadeDoCesto } from '../src/nucleo/sistemas/posses.js';
import { darXp } from '../src/nucleo/sistemas/niveis.js';
import { construcaoPorId } from '../src/nucleo/sistemas/construcao.js';
import { missaoAtual, missaoPossivel } from '../src/nucleo/sistemas/missoes.js';
import { porAnimal } from '../src/nucleo/sistemas/animais.js';
import { guiaDaMissao } from '../src/nucleo/guia.js';
import { QUADRO, TEM, pedidosDe, quadroDePedidos, pedidosProntos, produzivel, vagasNoNivel, esperaDaVaga } from '../src/nucleo/sistemas/pedidos.js';

// mundo no nível dado, com o quadro já conferido (as vagas que o nível dá já têm pedido)
function noQuadro(nivel = 2, mais, opc) { const m = noNivel(mundoDaIndustria(mais, opc), nivel); pular(m, 1); return m; }
const pedidos = (m) => m.pedidos.vagas.map((v) => v.pedido);
const itensDe = (m, i) => Object.keys(m.pedidos.vagas[i].pedido.itens);
const entregar = (m, vaga) => m.comando({ tipo: 'entregarPedido', vaga });
const trocar = (m, vaga) => m.comando({ tipo: 'trocarPedido', vaga });
// dá ao jogador tudo o que o pedido da vaga pede
function darOPedido(m, i) { dar(m, m.pedidos.vagas[i].pedido.itens); }
// o que vale para todo pedido aberto, seja qual for o sorteio
function conferirQuadro(m, linhasMax = 3) {
  const cfg = pedidosDe(m.dados), vistos = new Set(), lotes = {};
  for (const x of produzivel(m)) lotes[x.item] = x.lote;
  for (const p of pedidos(m)) {
    if (!p) continue;
    const ks = Object.keys(p.itens);
    assert.ok(ks.length >= 1 && ks.length <= linhasMax, 'linhas: ' + ks.length);
    let valor = 0;
    for (const k of ks) {
      assert.ok(!vistos.has(k), `o item ${k} aparece em dois pedidos abertos`); vistos.add(k);
      assert.ok(!cfg.fora.has(k), `${k} está em "fora"`);
      const it = m.dados.itens[k];
      assert.ok(it.tipo === 'colheita' || it.tipo === 'produto', `${k} não é colheita nem produto`);
      assert.ok(p.itens[k] >= 1 && Number.isInteger(p.itens[k]));
      if (lotes[k]) assert.ok(p.itens[k] <= lotes[k], `${k}: ${p.itens[k]} passa do lote ${lotes[k]}`);
      valor += p.itens[k] * it.venda;
    }
    assert.equal(p.ouro, Math.round(valor * cfg.bonusOuro)); assert.equal(p.xp, Math.round(p.ouro * cfg.xpPorOuro));
    assert.ok(cfg.clientes.some((c) => c.id === p.cliente));
  }
}
// troca e espera até juntar n pedidos; confere o quadro a cada rodada e devolve todos os pedidos vistos
function muitos(m, n, linhasMax) {
  const vistos = [];
  const ver = () => { conferirQuadro(m, linhasMax); for (const p of pedidos(m)) if (p && !vistos.includes(p)) vistos.push(p); };
  ver();
  for (let k = 0; k < n * 4 && vistos.length < n; k++) {
    for (let i = 0; i < m.pedidos.vagas.length; i++) if (m.pedidos.vagas[i].pedido) { m.comando({ tipo: 'trocarPedido', vaga: i, quieto: true }); ver(); }
    pular(m, 5000); ver();
  }
  return vistos;
}
const itensPedidos = (lista) => { const s = new Set(); for (const p of lista) for (const k in p.itens) s.add(k); return [...s].sort(); };

test('o quadro já vem na fazenda; antes do nível o toque explica que ele abre depois; no nível, abre com as vagas dos dados', () => {
  const m = mundoDaIndustria(), ev = ouvirTudo(m), q = m.local.porId[QUADRO];
  assert.ok(q, 'o quadro está no terreno'); assert.deepEqual([q.x, q.z], QUADRO_EM);
  assert.equal(construcaoPorId(m, QUADRO), q, 'a frente de construir conhece o quadro (para mudar de lugar e gravar)');
  let r = tocarEm(m, QUADRO);
  assert.equal(r.ok, false); assert.equal(r.motivo, 'quadro-fechado'); assert.deepEqual(r.dados, { nivel: 2 });
  assert.deepEqual(ev.de('informou').map((d) => d.motivo), ['quadro-fechado']); assert.equal(ev.de('faltou').length, 0, 'é só uma informação, sem som de erro');
  pular(m, 10);
  assert.deepEqual(quadroDePedidos(m), { aberto: false, nivel: 2, vagas: [], trancada: { nivel: 2, vagas: 2 }, trocaGratis: true, trocaGratisEm: 0, esperaDaTroca: 220 });
  assert.equal(m.comando({ tipo: 'entregarPedido', vaga: 0, quieto: true }).motivo, 'quadro-fechado');
  noNivel(m, 2); m.avancar(1.1);
  const Q = quadroDePedidos(m);
  assert.equal(Q.aberto, true); assert.equal(Q.vagas.length, 2); assert.ok(Q.vagas.every((v) => v.estado === 'pedido'));
  assert.deepEqual(Q.trancada, { nivel: 4, vagas: 3 });
  assert.deepEqual(ev.de('chegouPedido').map((d) => d.vaga), [0, 1]);
  r = tocarEm(m, QUADRO);
  assert.deepEqual(r, { ok: true, dados: { painel: 'pedidos', arg: null } });
  noNivel(m, 4); pular(m, 1);
  assert.equal(quadroDePedidos(m).vagas.length, 3); assert.equal(quadroDePedidos(m).trancada, null);
  const cfg = pedidosDe(m.dados);
  assert.deepEqual([1, 2, 3, 4].map((n) => vagasNoNivel(cfg, n)), [0, 2, 2, 3]);
});

test('subir de nível abre o quadro na hora; sem pedidos nos dados não há quadro nem comando de entregar', () => {
  const m = mundoDaIndustria();
  darXp(m, 10, 'teste');
  assert.equal(m.progresso.nivel, 2); assert.equal(pedidos(m).filter(Boolean).length, 2);
  const simples = novoMundo();
  assert.equal(pedidosDe(simples.dados), null); assert.equal(simples.local.porId[QUADRO], undefined);
  pular(simples, 100);
  assert.deepEqual(simples.pedidos.vagas, []);
  assert.equal(simples.comando({ tipo: 'entregarPedido', vaga: 0 }).motivo, 'nao-existe');
  assert.equal(simples.comando({ tipo: 'trocarPedido', vaga: 0 }).motivo, 'nao-existe');
  assert.equal(quadroDePedidos(simples).aberto, false);
});

test('o primeiro pedido é simples: uma linha, de uma cultura, que cabe no cesto, de preferência do que já está guardado', () => {
  for (let s = 1; s <= 40; s++) {
    const m = noNivel(mundoDaIndustria(null, { agora: 1_000_000, semente: s }), 4);
    porIndustria(m, 'moinho'); dar(m, { fuba: 5 });
    if (s % 2) dar(m, { milho: 2 });
    pular(m, 1);
    const p = pedidos(m)[0], ks = Object.keys(p.itens);
    assert.equal(ks.length, 1);
    assert.ok(ks[0] === 'rabanete' || ks[0] === 'milho', 'pediu ' + ks[0]);
    if (s % 2) assert.equal(ks[0], 'milho', 'com milho guardado, é milho');
    assert.ok(p.itens[ks[0]] <= capacidadeDoCesto(m));
    conferirQuadro(m);
  }
});

test('a mesma semente dá os mesmos pedidos; outra semente, outros; e a gravação continua a mesma sequência', () => {
  const fazer = (semente) => { const m = noQuadro(3, null, { agora: 1_000_000, semente }); porIndustria(m, 'moinho'); return m; };
  const jogar = (m) => { const out = []; for (let k = 0; k < 12; k++) { trocar(m, k % 2); pular(m, 700); out.push(JSON.stringify(pedidos(m))); } return out; };
  const a = fazer(7), b = fazer(7), c = fazer(8);
  assert.deepEqual(pedidos(a), pedidos(b));
  const g = JSON.parse(JSON.stringify(a.salvar()));
  const ja = jogar(a), jb = jogar(b), jc = jogar(c);
  assert.deepEqual(ja, jb);
  assert.notDeepEqual(ja, jc);
  const d = Mundo.carregar(a.dados, g);
  assert.deepEqual(jogar(d), ja, 'o jogo gravado gera os mesmos pedidos');
});

test('o quadro só pede o que o jogador produz: cultura do nível, e receita só com a indústria pronta', () => {
  let m = noQuadro(1);
  assert.deepEqual(produzivel(m).map((x) => x.item), ['rabanete']);
  m = noQuadro(2);
  assert.deepEqual(produzivel(m).map((x) => [x.item, x.cat, x.lote]), [['rabanete', 'cultura', 8], ['milho', 'cultura', 4]]);
  assert.deepEqual(itensPedidos(muitos(m, 40, 1)), ['milho', 'rabanete']);
  const e = porIndustria(m, 'moinho', { obraSeg: 50, quieto: false });
  assert.deepEqual(produzivel(m).map((x) => x.item), ['rabanete', 'milho'], 'em obra ainda não conta');
  pular(m, 60);
  assert.ok(e.obraAte === 0);
  assert.deepEqual(produzivel(m).map((x) => [x.item, x.cat, x.lote]), [['rabanete', 'cultura', 8], ['milho', 'cultura', 4], ['fuba', 'receita', 2]], 'nem ração (fora) nem tábua (material)');
  assert.deepEqual(itensPedidos(muitos(m, 60, 1)), ['fuba', 'milho', 'rabanete']);
});

test('produto de animal só com o bicho; receita só com de onde tirar cada ingrediente e no nível dela', () => {
  const m = noQuadro(2);
  porIndustria(m, 'moinho'); porIndustria(m, 'cozinha');
  assert.ok(!produzivel(m).some((x) => x.item === 'ovo' || x.item === 'duzia' || x.item === 'bolo'), 'sem galinha não há ovo, nem dúzia, nem bolo');
  porConstrucao(m, 'galinheiro', 6, 9);
  porAnimal(m, 'galinha', { quieto: true });
  assert.ok(TEM.animal(m, 'galinha'));
  assert.deepEqual(produzivel(m).map((x) => [x.item, x.cat, x.lote]), [['rabanete', 'cultura', 8], ['milho', 'cultura', 4], ['ovo', 'animal', 4], ['fuba', 'receita', 2], ['duzia', 'receita', 3]]);
  noNivel(m, 3);
  assert.ok(produzivel(m).some((x) => x.item === 'bolo'), 'no nível 3, com cozinha, moinho e galinha, entra o bolo');
  assert.deepEqual(itensPedidos(muitos(m, 120, 2)), ['bolo', 'duzia', 'fuba', 'milho', 'ovo', 'rabanete']);
});

test('fruta só com a árvore adulta', () => {
  const m = noNivel(mundoDaIndustria(comTerras), 2);
  pular(m, 1);
  assert.ok(!produzivel(m).some((x) => x.item === 'banana'));
  m.posses.bolsa['muda-bananeira'] = 1;
  modo(m, 'semear', 'muda-bananeira');
  assert.ok(tocar(m, 12, 12).ok); ateParar(m);
  assert.equal(m.arvores.todas.length, 1);
  assert.ok(!TEM.arvore(m, 'bananeira'), 'a muda ainda não é árvore adulta');
  assert.ok(!produzivel(m).some((x) => x.item === 'banana'));
  pular(m, 101);
  assert.ok(TEM.arvore(m, 'bananeira'));
  assert.deepEqual(produzivel(m).find((x) => x.item === 'banana'), { item: 'banana', cat: 'fruta', seg: 50, nivel: 1, lote: 4 });
  assert.ok(itensPedidos(muitos(m, 60, 1)).includes('banana'));
});

test('quantas linhas e quanto de cada item: pelos pesos do nível, pelo valor-alvo e pelo lote máximo', () => {
  const m = noQuadro(2);
  for (const p of muitos(m, 60, 1)) {
    const k = Object.keys(p.itens)[0];
    // valor-alvo de 16 a 24: rabanete (4 de ouro) de 4 a 6; milho (9 de ouro) 2 ou 3 (o primeiro pedido pode ser menor: cabe no cesto)
    if (k === 'rabanete') assert.ok(p.itens[k] >= 4 && p.itens[k] <= 6, 'rabanete: ' + p.itens[k]); else assert.ok(p.itens[k] >= 2 && p.itens[k] <= 3, 'milho: ' + p.itens[k]);
  }
  // uma vaga só e sem troca grátis: cada pedido novo escolhe entre tudo o que a fazenda produz
  const m3 = noQuadro(3, (b) => { b.pedidos.vagas = [{ nivel: 2, vagas: 1 }]; b.pedidos.trocaGratisAposSeg = 0; });
  porIndustria(m3, 'moinho');
  const linhas = muitos(m3, 200, 2).map((p) => Object.keys(p.itens).length), duas = linhas.filter((n) => n === 2).length / linhas.length;
  assert.ok(duas > 0.25 && duas < 0.75, 'no nível 3, metade dos pedidos tem duas linhas (deu ' + duas.toFixed(2) + ')');
});

test('item barato sai de cena: só entra o que tem lote que valha a fração mínima da linha; se nada vale, o lote mais valioso', () => {
  const caro = (b) => { b.pedidos.valorAlvo = { base: 100, expoente: 1, variacao: [1, 1] }; b.pedidos.linhas = [{ ateNivel: 99, pesos: [1] }]; b.pedidos.vagas = [{ nivel: 2, vagas: 1 }]; b.pedidos.trocaGratisAposSeg = 0; };
  // valor-alvo 200: a linha pede lote de 80 ou mais. Sem galinha, nada chega lá: vem o lote mais valioso (4 milhos = 36)
  let m = noQuadro(2, caro);
  porIndustria(m, 'moinho');
  for (const p of muitos(m, 12, 1).slice(1)) assert.deepEqual(p.itens, { milho: 4 });
  // com a galinha, a dúzia (3 × 70 = 210) vale: é só ela
  m = noQuadro(2, caro);
  porIndustria(m, 'moinho'); porConstrucao(m, 'galinheiro', 6, 9); porAnimal(m, 'galinha', { quieto: true });
  for (const p of muitos(m, 12, 1).slice(1)) assert.deepEqual(p.itens, { duzia: 3 }); // (o primeiro pedido da fazenda é sempre de cultura)
});

test('novidade pesa mais, e em parte das linhas o sorteio prefere o que já está guardado', () => {
  const um = (vies) => (b) => { b.pedidos.linhas = [{ ateNivel: 99, pesos: [1] }]; b.pedidos.vagas = [{ nivel: 2, vagas: 1 }]; b.pedidos.regras.viesDeEstoque = vies; b.pedidos.trocaGratisAposSeg = 0; };
  // nível 3: o milho (nível 2) é novidade e pesa 3; o rabanete (nível 1), 1
  let m = noQuadro(3, um(0));
  let lista = muitos(m, 300, 1).slice(1), milho = lista.filter((p) => p.itens.milho).length / lista.length;
  assert.ok(milho > 0.62 && milho < 0.88, 'perto de 75% de milho (deu ' + milho.toFixed(2) + ')');
  // com viés em todas as linhas e só rabanete guardado, é sempre rabanete
  m = noNivel(mundoDaIndustria(um(1)), 3); dar(m, { rabanete: 30 }); pular(m, 1);
  lista = muitos(m, 40, 1);
  assert.ok(lista.every((p) => p.itens.rabanete), 'só rabanete');
});

test('entregar: precisa ter tudo; paga o valor da banca com o bônus, dá experiência, avisa e a vaga espera', () => {
  const m = noQuadro(2), ev = ouvirTudo(m), p = pedidos(m)[0], item = Object.keys(p.itens)[0], n = p.itens[item];
  let r = entregar(m, 0);
  assert.equal(r.motivo, 'falta-para-o-pedido'); assert.deepEqual(r.dados, { item, precisa: n, tem: 0, falta: n, vaga: 0 });
  assert.equal(entregar(m, 7).motivo, 'sem-pedido');
  assert.equal(pedidosProntos(m), 0);
  m.posses.cesto.itens[item] = 1; dar(m, { [item]: n - 1 }); // parte no cesto, parte no celeiro
  assert.equal(pedidosProntos(m), 1); assert.equal(quadroDePedidos(m).vagas[0].pode, true);
  const ouro = m.posses.ouro, xp = m.progresso.xp, valor = n * m.dados.itens[item].venda;
  assert.equal(p.ouro, Math.round(valor * 1.5)); assert.equal(p.xp, Math.round(p.ouro * 0.5));
  ev.limpar();
  r = entregar(m, 0);
  assert.deepEqual(r, { ok: true, dados: { vaga: 0, ouro: p.ouro, xp: p.xp, cliente: p.cliente, seg: 120 } });
  assert.equal(m.posses.ouro, ouro + p.ouro); assert.equal(m.progresso.xp, xp + p.xp); assert.equal(quantoTem(m, item), 0);
  assert.deepEqual(ev.de('entregou'), [{ ouro: p.ouro, xp: p.xp, cliente: p.cliente, n: 1, vaga: 0, itens: p.itens }]);
  assert.deepEqual(ev.de('ganhouOuro'), [{ n: p.ouro, origem: 'pedido' }]);
  const v = quadroDePedidos(m).vagas[0];
  assert.equal(v.estado, 'espera'); assert.equal(Math.round(v.falta), 120, '100 + 10 por nível');
  assert.equal(entregar(m, 0).motivo, 'sem-pedido');
  assert.equal(m.pedidos.entregues, 1);
});

test('a espera da vaga: acaba no relógio (aberto ou fechado), tem teto e não se pula com cash', () => {
  const m = noQuadro(2);
  darOPedido(m, 0); entregar(m, 0);
  m.avancar(60);
  assert.equal(pedidos(m)[0], null);
  pular(m, 59);
  assert.equal(pedidos(m)[0], null); assert.equal(Math.round(quadroDePedidos(m).vagas[0].falta), 1);
  pular(m, 2);
  assert.ok(pedidos(m)[0], 'chegou outro pedido');
  const cfg = pedidosDe(m.dados);
  assert.deepEqual([2, 3, 4].map((n) => esperaDaVaga(cfg, n)), [120, 125, 125], 'o teto é de 125 s');
  darOPedido(m, 0); entregar(m, 0);
  m.posses.cash = 100;
  assert.equal(m.comando({ tipo: 'concluir', relogio: 'pedido', alvo: 0 }).motivo, 'concluir-nao-vale');
  assert.equal(m.comando({ tipo: 'concluir', relogio: 'fila', alvo: QUADRO }).motivo, 'nada-a-concluir');
  assert.equal(m.posses.cash, 100); assert.equal(pedidos(m)[0], null);
  pular(m, 3600 * 8);
  assert.ok(pedidos(m)[0], 'depois de horas fora, a vaga tem pedido');
});

test('trocar: a troca grátis traz outro pedido na hora (sem repetir o item); sem ela, a vaga espera o dobro', () => {
  const m = noNivel(mundoDaIndustria(), 2);
  porIndustria(m, 'moinho'); pular(m, 1); // com o moinho há um terceiro item (fubá) para o pedido novo não repetir
  const ev = ouvirTudo(m), antes = itensDe(m, 0)[0];
  assert.equal(quadroDePedidos(m).trocaGratis, true);
  let r = trocar(m, 0);
  assert.deepEqual(r, { ok: true, dados: { vaga: 0, gratis: true, seg: 0 } });
  assert.ok(pedidos(m)[0], 'o pedido novo já chegou'); assert.notEqual(itensDe(m, 0)[0], antes);
  let Q = quadroDePedidos(m);
  assert.equal(Q.trocaGratis, false); assert.equal(Math.round(Q.trocaGratisEm), 1000); assert.equal(Q.esperaDaTroca, 240);
  r = trocar(m, 1);
  assert.deepEqual(r, { ok: true, dados: { vaga: 1, gratis: false, seg: 240 } });
  assert.equal(pedidos(m)[1], null); assert.equal(Math.round(quadroDePedidos(m).vagas[1].falta), 240);
  assert.equal(trocar(m, 1).motivo, 'sem-pedido');
  pular(m, 239); assert.equal(pedidos(m)[1], null);
  pular(m, 2); assert.ok(pedidos(m)[1]);
  assert.deepEqual(ev.de('trocouPedido'), [{ vaga: 0, gratis: true, seg: 0 }, { vaga: 1, gratis: false, seg: 240 }]);
  pular(m, 800);
  assert.equal(quadroDePedidos(m).trocaGratis, true, 'a cada 1000 s a troca grátis volta');
  assert.equal(trocar(m, 1).dados.gratis, true);
});

test('a gravação guarda os pedidos, as esperas, a semente e a troca grátis', () => {
  const m = noQuadro(2);
  trocar(m, 0); darOPedido(m, 1); entregar(m, 1);
  m.avancar(30);
  const g = JSON.parse(JSON.stringify(m.salvar()));
  const m2 = Mundo.carregar(m.dados, g);
  assert.deepEqual(m2.salvar().sistemas.pedidos, g.sistemas.pedidos);
  assert.ok(m2.local.porId[QUADRO], 'o quadro volta com a gravação');
  assert.deepEqual(pedidos(m2)[0], pedidos(m)[0]); assert.equal(pedidos(m2)[1], null);
  assert.equal(Math.round(quadroDePedidos(m2).vagas[1].falta), 90);
  assert.equal(quadroDePedidos(m2).trocaGratis, false);
  assert.equal(m2.pedidos.entregues, 1);
  m2.acertarRelogio(m2.agora + 3600 * 1000);
  assert.ok(pedidos(m2)[1], 'a espera acabou com o jogo fechado');
  // pedido de item que saiu dos dados some, e a vaga traz outro
  g.sistemas.pedidos.vagas[0].pedido.itens = { jaca: 3 };
  const m3 = Mundo.carregar(m.dados, g);
  assert.equal(pedidos(m3)[0], null);
  pular(m3, 1);
  assert.ok(pedidos(m3)[0]); conferirQuadro(m3);
});

test('o quadro pode mudar de lugar e a gravação lembra onde ele ficou', () => {
  const m = noQuadro(2);
  assert.ok(m.comando({ tipo: 'moverConstrucao', entidade: QUADRO, x: 8, z: 14 }).ok);
  const m2 = Mundo.carregar(m.dados, JSON.parse(JSON.stringify(m.salvar()))), q = m2.local.porId[QUADRO];
  assert.deepEqual([q.x, q.z], [8, 14]);
  assert.equal(m2.local.entidadeEm(QUADRO_EM[0], QUADRO_EM[1]), null, 'não ficou um segundo quadro no lugar de origem');
  assert.equal(tocarEm(m2, QUADRO).dados.painel, 'pedidos');
});

test('missão de entregar: o guia aponta o quadro, depois o que falta, e a entrega cumpre a missão', () => {
  const m = noNivel(mundoDaIndustria((b) => { b.missoes.vizinho = [{ id: 'primeiro-pedido', nivel: 2, titulo: 'O quadro', objetivo: { evento: 'entregou', n: 1 }, recompensa: { ouro: 7 } }]; }), 2), ev = ouvirTudo(m);
  pular(m, 1);
  const passo = () => { const g = guiaDaMissao(m, {}); return g.tipo === 'entidade' ? g.id : g.tipo; };
  assert.equal(missaoAtual(m).missao.id, 'primeiro-pedido');
  assert.equal(passo(), QUADRO, 'antes de ver o quadro, é ele');
  m.comando({ tipo: 'viuDica', dica: 'quadro' });
  assert.notEqual(passo(), QUADRO, 'já viu o quadro e não tem o que ele pede: o passo é plantar ou colher');
  darOPedido(m, 1);
  assert.equal(passo(), QUADRO, 'com um pedido completo, é entregar');
  assert.ok(entregar(m, 1).ok);
  assert.deepEqual(ev.de('missaoConcluida').map((d) => d.id), ['primeiro-pedido']);
});

// ---------- com os dados de verdade (jogo/dados) ----------
const aqui = path.dirname(fileURLToPath(import.meta.url));
function dadosDeVerdade() {
  const { dados, problemas } = prepararDados(lerPasta(path.join(aqui, '..', 'dados')));
  assert.deepEqual(problemas.filter((p) => p.grave), []);
  return dados;
}
function mundoDeVerdade(dados, nivel, semente) {
  const m = new Mundo(dados, { agora: 1_700_000_000_000, semente });
  m.progresso.nivel = nivel; m.progresso.xp = dados.niveis.limiar[nivel];
  m.posses.celeiro.capacidade = 5000;
  return m;
}

test('dados de verdade: o quadro está na fazenda, abre no nível 3 com 2 vagas e o primeiro pedido é de alface ou milho', () => {
  const dados = dadosDeVerdade(), cfg = pedidosDe(dados);
  assert.ok(cfg); assert.equal(cfg.nivel, 3);
  for (let s = 1; s <= 30; s++) {
    const m = mundoDeVerdade(dados, 2, s), q = m.local.porId[QUADRO];
    assert.ok(q, 'o quadro está no terreno');
    assert.deepEqual([q.x, q.z], dados.terras.pontos[QUADRO].map(Math.floor));
    assert.equal(tocarEm(m, QUADRO).motivo, 'quadro-fechado');
    m.progresso.nivel = 3; pular(m, 1);
    assert.equal(pedidos(m).length, 2);
    for (const p of pedidos(m)) {
      const ks = Object.keys(p.itens);
      assert.equal(ks.length, 1, 'até o nível 5, uma linha só');
      assert.ok(ks[0] === 'alface' || ks[0] === 'milho', 'pediu ' + ks[0]);
      assert.ok(p.itens[ks[0]] <= 16);
    }
    assert.ok(Object.values(pedidos(m)[0].itens)[0] <= capacidadeDoCesto(m), 'o primeiro pedido cabe no cesto');
    conferirQuadro(m, 1);
  }
});

test('dados de verdade: a missão "primeiro-pedido" se cumpre no nível 3 com o que o jogador tem (alface e milho)', () => {
  const dados = dadosDeVerdade(), m = mundoDeVerdade(dados, 3, 5), ev = ouvirTudo(m);
  const mi = dados.missoes.vizinho.find((x) => x.id === 'primeiro-pedido');
  assert.ok(missaoPossivel(m, mi));
  m.missoes.feitas = dados.missoes.vizinho.map((x) => x.id).filter((x) => x !== 'primeiro-pedido');
  pular(m, 1);
  assert.equal(missaoAtual(m).missao.id, 'primeiro-pedido'); assert.equal(missaoAtual(m).esperaNivel, 0);
  const p = pedidos(m)[0], item = Object.keys(p.itens)[0];
  m.posses.cesto.itens[item] = p.itens[item]; // direto do cesto, como quem acabou de colher
  const r = entregar(m, 0);
  assert.ok(r.ok);
  assert.equal(r.dados.seg, 900 + 150 * 3, 'a vaga espera 15 min + 2,5 min por nível');
  assert.ok(ev.de('missaoConcluida').some((d) => d.id === 'primeiro-pedido'));
  assert.equal(p.ouro, Math.round(p.itens[item] * dados.itens[item].venda * 1.25));
});

test('dados de verdade: com tudo produzindo, os pedidos respeitam as regras em todos os níveis', () => {
  const dados = dadosDeVerdade(), cfg = pedidosDe(dados), arvore = TEM.arvore, animal = TEM.animal;
  // faz de conta que o jogador tem toda árvore e todo bicho que o nível dele já libera
  TEM.arvore = (m, id) => (m.dados.arvores[id].nivel || 1) <= m.progresso.nivel; TEM.animal = (m, id) => (m.dados.animais[id].nivel || 1) <= m.progresso.nivel;
  try {
    for (const nivel of [3, 6, 10, 15, 20, 25]) {
      const m = mundoDeVerdade(dados, nivel, nivel);
      // todas as indústrias prontas (postas direto na lista da frente de construir, sem ocupar o terreno)
      for (const id of ['bancada-de-carpintaria', 'bancada-de-embalar', 'moinho', 'cozinha', 'laticinio']) m.construcao.todas.push({ id: id + '-t', tipo: id, local: 'fazenda', x: -9, z: -9, l: 1, p: 1, nivel: 1, obraAte: 0, ampliaAte: 0 });
      pular(m, 1);
      assert.equal(pedidos(m).length, vagasNoNivel(cfg, nivel));
      const P = produzivel(m);
      assert.ok(!P.some((x) => x.item === 'racao' || x.item === 'tabua'));
      for (const x of P) assert.ok(x.nivel <= nivel, `${x.item} é do nível ${x.nivel}`);
      const lista = muitos(m, 150, nivel <= 5 ? 1 : nivel <= 13 ? 2 : 3);
      assert.ok(lista.length >= 100);
      const alvo = cfg.valorAlvo.base * Math.pow(nivel, cfg.valorAlvo.expoente);
      for (const p of lista.slice(1)) { // (o primeiro pedido da fazenda é o simples)
        const valor = Object.keys(p.itens).reduce((s, k) => s + p.itens[k] * dados.itens[k].venda, 0);
        assert.ok(valor <= alvo * cfg.valorAlvo.variacao[1] * 1.6 + 300, `nível ${nivel}: pedido de ${valor} para um alvo de ${Math.round(alvo)}`);
      }
      if (nivel >= 20) assert.ok(!itensPedidos(lista.slice(1)).includes('alface'), 'alface crua sai de cena nos níveis altos');
    }
  } finally { TEM.arvore = arvore; TEM.animal = animal; }
});
