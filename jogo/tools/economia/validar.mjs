// Confere os dados do jogo (jogo/dados/*.json): formato, campos obrigatórios, tipos, referências cruzadas
// e algumas contas de bom senso da economia. Node puro, sem dependências.
//
//   node jogo/tools/economia/validar.mjs            confere jogo/dados
//   node jogo/tools/economia/validar.mjs <pasta>    confere outra pasta
//   --quieto                                        só mostra erros e o resumo
//
// ERRO  = o jogo pode quebrar ou travar o jogador (sai com código 1).
// aviso = conta estranha, coisa sem uso, nível vazio: vale olhar, mas não quebra.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const QUIETO = args.includes('--quieto');
const PASTA = args.find((a) => !a.startsWith('--')) || join(AQUI, '..', '..', 'dados');

const ARQUIVOS = ['regras', 'itens', 'culturas', 'arvores', 'animais', 'construcoes', 'receitas', 'terras', 'niveis', 'pedidos', 'missoes', 'loja'];
const TIPOS_ITEM = ['colheita', 'produto', 'semente', 'muda', 'material', 'racao', 'embalagem', 'ferramenta', 'recipiente', 'cosmetico'];
const TIPOS_CONSTRUCAO = ['abrigo', 'industria', 'armazem', 'util', 'movel', 'decoracao'];
const FAMILIAS = ['producao', 'trabalho', 'estimacao'];
const TIPOS_OFERTA = ['cosmetico', 'estimacao', 'tempo', 'vaga'];
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const erros = [], avisos = [];
const erro = (arq, txt) => erros.push(`ERRO  ${arq}.json: ${txt}`);
const aviso = (arq, txt) => avisos.push(`aviso ${arq}.json: ${txt}`);
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const int = (v) => Number.isInteger(v);
const obj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const txt = (v) => typeof v === 'string' && v.length > 0;
const entradas = (o) => Object.entries(o || {}).filter(([k]) => !k.startsWith('_') && k !== 'nota');

// ---------- leitura ----------
const D = {};
for (const a of ARQUIVOS) {
  const caminho = join(PASTA, a + '.json');
  if (!existsSync(caminho)) { erro(a, 'o arquivo não existe'); D[a] = {}; continue; }
  try { D[a] = JSON.parse(readFileSync(caminho, 'utf8')); } catch (e) { erro(a, 'JSON inválido: ' + e.message); D[a] = {}; continue; }
  if (!obj(D[a])) { erro(a, 'o arquivo tem de ser um objeto'); D[a] = {}; }
}
const { regras, itens, culturas, arvores, animais, construcoes, receitas, terras, niveis, pedidos, missoes, loja } = D;

// ---------- ajudas ----------
function conferirId(arq, id, oQue) { if (!ID.test(id)) erro(arq, `${oQue} "${id}": id tem de ser minúsculo, sem acento, com hífen`); }
function campo(arq, onde, o, nome, teste, esperado, obrigatorio = true) {
  if (o[nome] === undefined) { if (obrigatorio) erro(arq, `${onde}: falta "${nome}"`); return false; }
  if (!teste(o[nome])) { erro(arq, `${onde}: "${nome}" devia ser ${esperado}`); return false; }
  return true;
}
const positivo = (v) => num(v) && v > 0;
const naoNegativo = (v) => num(v) && v >= 0;
const inteiroPos = (v) => int(v) && v > 0;
function mapaDeItens(arq, onde, m, nome) { // { item: n }
  if (m === undefined) return;
  if (!obj(m)) { erro(arq, `${onde}: "${nome}" devia ser { item: quantidade }`); return; }
  for (const [k, n] of Object.entries(m)) {
    if (!itens[k]) erro(arq, `${onde}: ${nome} cita o item "${k}", que não existe em itens.json`);
    if (!positivo(n)) erro(arq, `${onde}: ${nome}.${k} devia ser um número maior que zero`);
  }
}
function custo(arq, onde, c) {
  if (!obj(c)) { erro(arq, `${onde}: "custo" devia ser { ouro, itens } ou { cash }`); return; }
  if (c.ouro !== undefined && !naoNegativo(c.ouro)) erro(arq, `${onde}: custo.ouro devia ser número`);
  if (c.cash !== undefined && !positivo(c.cash)) erro(arq, `${onde}: custo.cash devia ser número maior que zero`);
  if (c.ouro === undefined && c.cash === undefined && !c.itens) erro(arq, `${onde}: custo sem ouro, cash nem itens`);
  mapaDeItens(arq, onde, c.itens, 'custo.itens');
}
function recompensa(arq, onde, r) {
  if (r === undefined) return;
  if (!obj(r)) { erro(arq, `${onde}: "recompensa" devia ser um objeto`); return; }
  for (const k of ['ouro', 'cash', 'xp', 'ouroPorNivel']) if (r[k] !== undefined && !positivo(r[k])) erro(arq, `${onde}: recompensa.${k} devia ser número maior que zero`);
  mapaDeItens(arq, onde, r.itens, 'recompensa.itens');
  // bicho de presente (o boi do Seu Tonho): { animais: { especie: n } }
  if (r.animais !== undefined) {
    if (!obj(r.animais)) erro(arq, `${onde}: recompensa.animais devia ser { animal: n }`);
    else for (const [k, n] of Object.entries(r.animais)) { if (!animais[k]) erro(arq, `${onde}: recompensa.animais cita "${k}", que não existe`); if (!inteiroPos(n)) erro(arq, `${onde}: recompensa.animais.${k} devia ser um inteiro maior que zero`); }
  }
  for (const k of Object.keys(r)) if (!['ouro', 'cash', 'xp', 'ouroPorNivel', 'itens', 'animais'].includes(k)) aviso(arq, `${onde}: recompensa com campo desconhecido "${k}"`);
}
const funcoes = () => new Set(entradas(itens).filter(([, i]) => i.tipo === 'ferramenta' || i.tipo === 'recipiente').map(([id, i]) => i.funcao || id.split('-')[0]));
const nivelDe = (o) => (num(o && o.nivel) ? o.nivel : 1);

// =====================================================================
// itens
// =====================================================================
const porFuncao = {};
for (const [id, it] of entradas(itens)) {
  const onde = `item "${id}"`;
  conferirId('itens', id, 'item');
  if (!obj(it)) { erro('itens', `${onde} não é um objeto`); continue; }
  campo('itens', onde, it, 'nome', txt, 'um texto');
  if (!TIPOS_ITEM.includes(it.tipo)) erro('itens', `${onde}: tipo "${it.tipo}" não existe (use ${TIPOS_ITEM.join(', ')})`);
  campo('itens', onde, it, 'nivel', inteiroPos, 'um inteiro de 1 para cima');
  campo('itens', onde, it, 'descricao', txt, 'um texto');
  campo('itens', onde, it, 'venda', naoNegativo, 'um número', false);
  campo('itens', onde, it, 'compra', naoNegativo, 'um número', false);
  if (num(it.venda) && num(it.compra) && it.compra > 0 && it.venda >= it.compra) erro('itens', `${onde}: vende por ${it.venda} e compra por ${it.compra}: dá para fazer ouro comprando e vendendo`);
  if (['colheita', 'produto'].includes(it.tipo) && !(it.venda > 0)) erro('itens', `${onde}: colheita e produto precisam de "venda"`);
  if (it.tipo === 'semente') { if (!culturas[it.cultura]) erro('itens', `${onde}: semente sem "cultura" válida`); if (!(it.compra > 0)) erro('itens', `${onde}: semente precisa de "compra"`); }
  if (it.tipo === 'muda') { if (!arvores[it.arvore]) erro('itens', `${onde}: muda sem "arvore" válida`); if (!(it.compra > 0)) erro('itens', `${onde}: muda precisa de "compra"`); }
  if (it.tipo === 'cosmetico') campo('itens', onde, it, 'parte', txt, 'um texto (chapeu, roupa, calcado, pintura)');
  if (it.tipo === 'ferramenta' || it.tipo === 'recipiente') {
    campo('itens', onde, it, 'funcao', (v) => txt(v) && ID.test(v), 'um id (enxada, regador, cesto...)');
    campo('itens', onde, it, 'degrau', inteiroPos, 'um inteiro de 1 para cima');
    campo('itens', onde, it, 'usos', (v) => int(v) && v >= 0, 'um inteiro (0 = não gasta)');
    campo('itens', onde, it, 'conserto', naoNegativo, 'um número');
    if (it.tipo === 'recipiente') campo('itens', onde, it, 'capacidade', inteiroPos, 'um inteiro maior que zero');
    if (it.funcao === 'regador') campo('itens', onde, it, 'capacidade', inteiroPos, 'um inteiro maior que zero (regas)');
    if (it.usos > 0 && !(it.conserto > 0)) erro('itens', `${onde}: gasta (usos ${it.usos}) mas não tem preço de conserto`);
    if (it.usos > 0 && it.compra > 0 && it.conserto >= it.compra) erro('itens', `${onde}: o conserto (${it.conserto}) custa tanto quanto comprar outra (${it.compra})`);
    (porFuncao[it.funcao] = porFuncao[it.funcao] || []).push({ id, ...it });
  }
}
// degraus: sem buraco, sem repetir, e cada degrau melhor, mais caro e de nível maior que o anterior
for (const [f, lista] of Object.entries(porFuncao)) {
  lista.sort((a, b) => a.degrau - b.degrau);
  lista.forEach((it, k) => {
    if (it.degrau !== k + 1) erro('itens', `função "${f}": os degraus deviam ser 1, 2, 3... sem buraco (achei ${lista.map((x) => x.degrau).join(', ')})`);
    if (k === 0) return;
    const ant = lista[k - 1];
    if (it.nivel <= ant.nivel) erro('itens', `função "${f}": "${it.id}" (nível ${it.nivel}) devia pedir nível maior que "${ant.id}" (nível ${ant.nivel})`);
    if ((it.compra || 0) <= (ant.compra || 0)) erro('itens', `função "${f}": "${it.id}" devia custar mais que "${ant.id}"`);
    for (const c of ['capacidade', 'forca', 'area']) if (num(it[c]) && num(ant[c]) && it[c] < ant[c]) erro('itens', `função "${f}": "${it.id}" tem ${c} menor que "${ant.id}"`);
    if (num(it.rapidez) && num(ant.rapidez) && it.rapidez > ant.rapidez) erro('itens', `função "${f}": "${it.id}" é mais lenta que "${ant.id}" (rapidez multiplica o tempo: menor é melhor)`);
  });
}

// =====================================================================
// culturas e árvores
// =====================================================================
const produtoDeCultura = {}, frutoDeArvore = {};
for (const [id, c] of entradas(culturas)) {
  const onde = `cultura "${id}"`;
  conferirId('culturas', id, 'cultura');
  if (!obj(c)) { erro('culturas', `${onde} não é um objeto`); continue; }
  campo('culturas', onde, c, 'nome', txt, 'um texto');
  for (const k of ['rende', 'estagios', 'regas', 'nivel']) campo('culturas', onde, c, k, inteiroPos, 'um inteiro maior que zero');
  campo('culturas', onde, c, 'tempoSeg', positivo, 'um número maior que zero');
  campo('culturas', onde, c, 'xp', naoNegativo, 'um número');
  const s = itens[c.semente], p = itens[c.produto];
  if (!s) erro('culturas', `${onde}: a semente "${c.semente}" não existe em itens.json`);
  else {
    if (s.tipo !== 'semente') erro('culturas', `${onde}: "${c.semente}" não é do tipo semente`);
    if (s.cultura !== id) erro('culturas', `${onde}: a semente "${c.semente}" aponta para a cultura "${s.cultura}"`);
    if (s.nivel !== c.nivel) erro('culturas', `${onde}: a cultura é do nível ${c.nivel} e a semente do nível ${s.nivel}`);
  }
  if (!p) erro('culturas', `${onde}: o produto "${c.produto}" não existe em itens.json`);
  else if (p.tipo !== 'colheita') erro('culturas', `${onde}: o produto "${c.produto}" não é do tipo colheita`);
  if (c.estagios < 2) erro('culturas', `${onde}: precisa de 2 estágios ou mais`);
  if (c.regas > c.estagios) erro('culturas', `${onde}: pede ${c.regas} regas mas só tem ${c.estagios} estágios`);
  if (s && p && s.compra >= c.rende * p.venda) erro('culturas', `${onde}: a semente (${s.compra}) custa tanto quanto a colheita (${c.rende} × ${p.venda}): plantar dá prejuízo`);
  produtoDeCultura[c.produto] = id;
}
for (const [id, a] of entradas(arvores)) {
  const onde = `árvore "${id}"`;
  conferirId('arvores', id, 'árvore');
  if (!obj(a)) { erro('arvores', `${onde} não é um objeto`); continue; }
  campo('arvores', onde, a, 'nome', txt, 'um texto');
  for (const k of ['rende', 'nivel']) campo('arvores', onde, a, k, inteiroPos, 'um inteiro maior que zero');
  for (const k of ['cresceSeg', 'safraSeg']) campo('arvores', onde, a, k, positivo, 'um número maior que zero');
  campo('arvores', onde, a, 'xp', naoNegativo, 'um número');
  const mu = itens[a.muda], f = itens[a.fruto];
  if (!mu) erro('arvores', `${onde}: a muda "${a.muda}" não existe em itens.json`);
  else { if (mu.tipo !== 'muda') erro('arvores', `${onde}: "${a.muda}" não é do tipo muda`); if (mu.arvore !== id) erro('arvores', `${onde}: a muda aponta para "${mu.arvore}"`); if (mu.nivel !== a.nivel) erro('arvores', `${onde}: árvore do nível ${a.nivel} e muda do nível ${mu.nivel}`); }
  if (!f) erro('arvores', `${onde}: o fruto "${a.fruto}" não existe em itens.json`);
  else if (f.tipo !== 'colheita') erro('arvores', `${onde}: o fruto "${a.fruto}" não é do tipo colheita`);
  frutoDeArvore[a.fruto] = id;
}
if (!entradas(culturas).length) erro('culturas', 'não há nenhuma cultura');

// =====================================================================
// construções
// =====================================================================
for (const [id, c] of entradas(construcoes)) {
  const onde = `construção "${id}"`;
  conferirId('construcoes', id, 'construção');
  if (!obj(c)) { erro('construcoes', `${onde} não é um objeto`); continue; }
  campo('construcoes', onde, c, 'nome', txt, 'um texto');
  campo('construcoes', onde, c, 'descricao', txt, 'um texto');
  if (!TIPOS_CONSTRUCAO.includes(c.tipo)) erro('construcoes', `${onde}: tipo "${c.tipo}" não existe (use ${TIPOS_CONSTRUCAO.join(', ')})`);
  if (!['fazenda', 'celeiro'].includes(c.onde)) erro('construcoes', `${onde}: "onde" devia ser "fazenda" ou "celeiro"`);
  campo('construcoes', onde, c, 'casas', (v) => Array.isArray(v) && v.length === 2 && v.every(inteiroPos), '[largura, profundidade]');
  campo('construcoes', onde, c, 'nivel', inteiroPos, 'um inteiro de 1 para cima');
  if (c.inicial) { if (c.custo) aviso('construcoes', `${onde}: já vem no terreno e tem custo`); }
  else {
    if (campo('construcoes', onde, c, 'custo', obj, '{ ouro, itens } ou { cash }')) custo('construcoes', onde, c.custo);
    campo('construcoes', onde, c, 'obraSeg', naoNegativo, 'um número de segundos');
  }
  for (const e of c.exige || []) {
    if (!construcoes[e]) erro('construcoes', `${onde}: exige "${e}", que não existe`);
    else if (nivelDe(construcoes[e]) > c.nivel) erro('construcoes', `${onde} (nível ${c.nivel}) exige "${e}", que só libera no nível ${construcoes[e].nivel}`);
  }
  if (c.exige !== undefined && !Array.isArray(c.exige)) erro('construcoes', `${onde}: "exige" devia ser uma lista`);
  if (c.tipo === 'abrigo') for (const k of ['vagas', 'cocho', 'bebedouro']) campo('construcoes', onde, c, k, inteiroPos, 'um inteiro maior que zero');
  if (c.tipo === 'industria') campo('construcoes', onde, c, 'fila', inteiroPos, 'um inteiro maior que zero');
  if (c.tipo === 'movel') {
    campo('construcoes', onde, c, 'capacidade', inteiroPos, 'um inteiro maior que zero');
    campo('construcoes', onde, c, 'guarda', (v) => ['produtos', 'materiais', 'ferramentas'].includes(v), '"produtos", "materiais" ou "ferramentas"');
    if (c.onde !== 'celeiro') erro('construcoes', `${onde}: móvel fica no celeiro`);
  }
  if (c.limite !== undefined && !inteiroPos(c.limite)) erro('construcoes', `${onde}: "limite" devia ser um inteiro maior que zero`);
  if (c.interior) {
    campo('construcoes', onde + ' interior', c.interior, 'piso', (v) => Array.isArray(v) && v.length === 2 && v.every(inteiroPos), '[largura, profundidade]');
    for (const mv of c.interior.moveis || []) {
      const mo = construcoes[mv.id];
      if (!mo || mo.tipo !== 'movel') erro('construcoes', `${onde}: o móvel inicial "${mv.id}" não é um móvel de construcoes.json`);
      else if (c.interior.piso && (mv.x < 0 || mv.z < 0 || mv.x + mo.casas[0] > c.interior.piso[0] || mv.z + mo.casas[1] > c.interior.piso[1])) erro('construcoes', `${onde}: o móvel inicial "${mv.id}" não cabe no piso`);
    }
  }
  let nAnt = c.nivel, ouroAnt = -1, pisoAnt = c.interior && c.interior.piso, vagasAnt = c.vagas, filaAnt = c.fila;
  (c.ampliacoes || []).forEach((a, k) => {
    const o2 = `${onde}, ampliação ${k + 1}`;
    campo('construcoes', o2, a, 'nome', txt, 'um texto');
    campo('construcoes', o2, a, 'nivel', inteiroPos, 'um inteiro');
    campo('construcoes', o2, a, 'obraSeg', naoNegativo, 'um número de segundos');
    if (campo('construcoes', o2, a, 'custo', obj, '{ ouro, itens }')) custo('construcoes', o2, a.custo);
    if (a.nivel <= nAnt) erro('construcoes', `${o2}: o nível (${a.nivel}) devia ser maior que o do degrau anterior (${nAnt})`);
    if (a.custo && num(a.custo.ouro) && a.custo.ouro <= ouroAnt) erro('construcoes', `${o2}: devia custar mais que a anterior`);
    if (a.piso) { if (pisoAnt && (a.piso[0] < pisoAnt[0] || a.piso[1] < pisoAnt[1])) erro('construcoes', `${o2}: o piso encolheu`); pisoAnt = a.piso; }
    if (a.vagas !== undefined) { if (!(a.vagas > vagasAnt)) erro('construcoes', `${o2}: as vagas (${a.vagas}) deviam aumentar`); vagasAnt = a.vagas; }
    if (a.fila !== undefined) {
      if (!(a.fila > filaAnt)) erro('construcoes', `${o2}: a fila (${a.fila}) devia aumentar`); filaAnt = a.fila;
      if (!(a.custo && positivo(a.custo.ouro)) || !inteiroPos(a.cash)) erro('construcoes', `${o2}: vaga de fila tem de ter os dois preços, "custo.ouro" e "cash" (nada de útil é exclusivo do cash)`);
    } else if (a.cash !== undefined) erro('construcoes', `${o2}: só vaga de fila pode ter preço em cash`);
    nAnt = a.nivel; ouroAnt = (a.custo && a.custo.ouro) || 0;
  });
}

// =====================================================================
// animais
// =====================================================================
const produtoDeAnimal = {};
const fs = funcoes();
for (const [id, a] of entradas(animais)) {
  const onde = `animal "${id}"`;
  conferirId('animais', id, 'animal');
  if (!obj(a)) { erro('animais', `${onde} não é um objeto`); continue; }
  campo('animais', onde, a, 'nome', txt, 'um texto');
  campo('animais', onde, a, 'descricao', txt, 'um texto');
  if (!FAMILIAS.includes(a.familia)) erro('animais', `${onde}: família "${a.familia}" não existe (use ${FAMILIAS.join(', ')})`);
  campo('animais', onde, a, 'nivel', inteiroPos, 'um inteiro de 1 para cima');
  if (!obj(a.preco) || !(positivo(a.preco.ouro) || positivo(a.preco.cash))) erro('animais', `${onde}: "preco" devia ser { ouro } ou { cash }`);
  if (a.preco && a.preco.cash && a.familia === 'producao') erro('animais', `${onde}: animal de produção não pode ser vendido por cash`);
  if (a.abrigo !== null && a.abrigo !== undefined) {
    const ab = construcoes[a.abrigo];
    if (!ab) erro('animais', `${onde}: o abrigo "${a.abrigo}" não existe em construcoes.json`);
    else { if (ab.tipo !== 'abrigo') erro('animais', `${onde}: "${a.abrigo}" não é do tipo abrigo`); if (ab.nivel > a.nivel) erro('animais', `${onde} (nível ${a.nivel}) precisa do abrigo "${a.abrigo}", que só libera no nível ${ab.nivel}`); }
  } else if (a.familia !== 'estimacao') erro('animais', `${onde}: animal de ${a.familia} precisa de abrigo`);
  mapaDeItens('animais', onde, a.come, 'come');
  if (a.familia === 'producao') {
    if (!itens[a.produto]) erro('animais', `${onde}: o produto "${a.produto}" não existe em itens.json`);
    else { if (itens[a.produto].tipo !== 'produto') erro('animais', `${onde}: "${a.produto}" não é do tipo produto`); produtoDeAnimal[a.produto] = id; }
    for (const k of ['rende', 'acumula', 'vidaProdutiva']) campo('animais', onde, a, k, inteiroPos, 'um inteiro maior que zero');
    campo('animais', onde, a, 'cicloSeg', positivo, 'um número maior que zero');
    campo('animais', onde, a, 'xp', naoNegativo, 'um número');
    campo('animais', onde, a, 'come', obj, '{ item: n }');
    campo('animais', onde, a, 'bebe', naoNegativo, 'um número');
    if (!fs.has(a.ferramenta)) erro('animais', `${onde}: a ferramenta "${a.ferramenta}" não é função de nenhum item (itens.json, campo "funcao")`);
    else { const minimo = Math.min(...porFuncao[a.ferramenta].map((x) => x.nivel)); if (minimo > a.nivel) erro('animais', `${onde} (nível ${a.nivel}): a ferramenta "${a.ferramenta}" só libera no nível ${minimo}`); }
    if (!obj(a.fimDeVida) || !positivo(a.fimDeVida.frigorifico) || !positivo(a.fimDeVida.fazendeiro)) erro('animais', `${onde}: falta "fimDeVida": { frigorifico, fazendeiro }`);
    else if (a.preco && a.preco.ouro && Math.max(a.fimDeVida.frigorifico, a.fimDeVida.fazendeiro) >= a.preco.ouro) erro('animais', `${onde}: vende no fim da vida por mais do que custa`);
    // conta: o ciclo tem de pagar a comida
    const comida = Object.entries(a.come || {}).reduce((s, [k, n]) => s + n * custoDeFazer(k), 0);
    if (itens[a.produto] && comida >= a.rende * itens[a.produto].venda) erro('animais', `${onde}: a comida de um ciclo (${comida.toFixed(1)}) custa tanto quanto o produto`);
  } else {
    if (!obj(a.efeito) || !txt(a.efeito.tipo)) erro('animais', `${onde}: animal de ${a.familia} precisa de "efeito": { tipo, ... }`);
    if (a.familia === 'trabalho') { campo('animais', onde, a, 'come', obj, '{ item: n }'); campo('animais', onde, a, 'cicloSeg', positivo, 'um número maior que zero'); }
  }
  for (const e of a.exige || []) {
    if (!itens[e]) erro('animais', `${onde}: exige o item "${e}", que não existe`);
    else if (itens[e].nivel > a.nivel) erro('animais', `${onde} (nível ${a.nivel}) exige "${e}", que só libera no nível ${itens[e].nivel}`);
  }
  if (a.efeito && a.efeito.sorteia) for (const s of a.efeito.sorteia) mapaDeItens('animais', onde, s, 'efeito.sorteia');
  if (a.efeito && a.efeito.recipiente && !fs.has(a.efeito.recipiente)) erro('animais', `${onde}: efeito.recipiente "${a.efeito.recipiente}" não é função de nenhum item`);
}
// quanto custa fazer uma unidade de um item (para as contas): o mais barato entre comprar e produzir
function custoDeFazer(id, fundo = 0) {
  const it = itens[id];
  if (!it || fundo > 6) return Infinity;
  let melhor = it.compra > 0 ? it.compra : Infinity;
  if (produtoDeCultura[id] || frutoDeArvore[id] || it.tipo === 'colheita' || it.tipo === 'produto') melhor = Math.min(melhor, it.venda || Infinity);
  for (const [, r] of entradas(receitas)) {
    if (!r.sai || !r.sai[id]) continue;
    const c = Object.entries(r.entra || {}).reduce((s, [k, n]) => s + n * custoDeFazer(k, fundo + 1), 0) / r.sai[id];
    melhor = Math.min(melhor, c);
  }
  return melhor;
}

// =====================================================================
// receitas
// =====================================================================
const saiDeReceita = {}, entraEmReceita = {};
for (const [id, r] of entradas(receitas)) {
  const onde = `receita "${id}"`;
  conferirId('receitas', id, 'receita');
  if (!obj(r)) { erro('receitas', `${onde} não é um objeto`); continue; }
  const ind = construcoes[r.onde];
  if (!ind) erro('receitas', `${onde}: a construção "${r.onde}" não existe`);
  else { if (ind.tipo !== 'industria') erro('receitas', `${onde}: "${r.onde}" não é do tipo industria`); if (ind.nivel > r.nivel) erro('receitas', `${onde} (nível ${r.nivel}) é feita em "${r.onde}", que só libera no nível ${ind.nivel}`); }
  campo('receitas', onde, r, 'entra', (v) => obj(v) && Object.keys(v).length > 0, '{ item: n }');
  campo('receitas', onde, r, 'sai', (v) => obj(v) && Object.keys(v).length > 0, '{ item: n }');
  mapaDeItens('receitas', onde, r.entra, 'entra');
  mapaDeItens('receitas', onde, r.sai, 'sai');
  campo('receitas', onde, r, 'tempoSeg', positivo, 'um número maior que zero');
  campo('receitas', onde, r, 'xp', naoNegativo, 'um número');
  campo('receitas', onde, r, 'nivel', inteiroPos, 'um inteiro de 1 para cima');
  // (o item que a loja vende antes da receita pode ser de nível menor: a ração do boi se compra desde o nível 4 e o
  // moinho, no 7, só a faz mais barata)
  for (const k of Object.keys(r.sai || {})) { (saiDeReceita[k] = saiDeReceita[k] || []).push(id); if (itens[k] && itens[k].nivel !== r.nivel && !(itens[k].nivel < r.nivel && itens[k].compra > 0)) aviso('receitas', `${onde}: a receita é do nível ${r.nivel} e o item "${k}" do nível ${itens[k].nivel}`); }
  for (const k of Object.keys(r.entra || {})) (entraEmReceita[k] = entraEmReceita[k] || []).push(id);
}

// =====================================================================
// de onde vem e para onde vai cada item
// =====================================================================
const nivelDaOrigem = {}; // menor nível em que o jogador consegue o item
const origem = (id, n) => { if (nivelDaOrigem[id] === undefined || n < nivelDaOrigem[id]) nivelDaOrigem[id] = n; };
for (const [id, it] of entradas(itens)) if (it.compra > 0) origem(id, it.nivel);
for (const [, c] of entradas(culturas)) origem(c.produto, c.nivel);
for (const [, a] of entradas(arvores)) origem(a.fruto, a.nivel);
for (const [, a] of entradas(animais)) if (a.produto) origem(a.produto, a.nivel);
for (const [, o] of entradas(terras.obstaculos)) for (const k of Object.keys(o.da || {})) { const f = porFuncao[o.ferramenta]; origem(k, f ? Math.min(...f.filter((x) => (x.forca || 1) >= (o.forcaMinima || 1)).map((x) => x.nivel)) : 1); }
for (let volta = 0; volta < 6; volta++) for (const [, r] of entradas(receitas)) {
  const ins = Object.keys(r.entra || {});
  if (ins.some((k) => nivelDaOrigem[k] === undefined)) continue;
  const n = Math.max(r.nivel, ...ins.map((k) => nivelDaOrigem[k]));
  for (const k of Object.keys(r.sai || {})) origem(k, n);
}
const dado = new Set(); // itens que só chegam de presente (missão, início, diária)
for (const k of Object.keys((regras.inicio || {}).itens || {})) dado.add(k);
for (const k of [(regras.inicio || {}).cesto, ...((regras.inicio || {}).cinto || []), ...((regras.inicio || {}).suporte || [])]) if (k) dado.add(k);
for (const mi of missoes.vizinho || []) { for (const k of Object.keys((mi.recompensa || {}).itens || {})) dado.add(k); }
for (const r of Object.values(niveis.recompensas || {})) for (const k of Object.keys((r && r.itens) || {})) dado.add(k);
for (const d of (missoes.diaria || {}).dias || []) for (const r of [d.recompensa, d.primeiraVolta]) for (const k of Object.keys((r && r.itens) || {})) dado.add(k);
for (const c of missoes.conquistas || []) for (const r of c.recompensas || []) for (const k of Object.keys((r && r.itens) || {})) dado.add(k);
const usado = new Set();
for (const k of Object.keys(entraEmReceita)) usado.add(k);
for (const [, a] of entradas(animais)) { for (const k of Object.keys(a.come || {})) usado.add(k); for (const k of a.exige || []) usado.add(k); }
for (const [, c] of entradas(construcoes)) { for (const k of Object.keys((c.custo || {}).itens || {})) usado.add(k); for (const a of c.ampliacoes || []) for (const k of Object.keys((a.custo || {}).itens || {})) usado.add(k); }
for (const [id, it] of entradas(itens)) {
  const temOrigem = nivelDaOrigem[id] !== undefined || dado.has(id) || (loja.cash && (loja.cash.ofertas || []).some((o) => o.item === id));
  if (!temOrigem) erro('itens', `item "${id}": não há como conseguir (não se compra, não se planta, não se produz, não vem de presente)`);
  const temUso = usado.has(id) || it.venda > 0 || ['ferramenta', 'recipiente', 'cosmetico', 'semente', 'muda'].includes(it.tipo);
  if (!temUso) erro('itens', `item "${id}": não serve para nada (não se vende, não entra em receita, construção nem trato)`);
  if (nivelDaOrigem[id] !== undefined && nivelDaOrigem[id] > it.nivel && !dado.has(id)) aviso('itens', `item "${id}" diz nível ${it.nivel}, mas só dá para conseguir no nível ${nivelDaOrigem[id]}`);
  if (['colheita', 'produto'].includes(it.tipo) && !usado.has(id) && !(pedidos.fora || []).includes(id) && it.venda > 0) { /* só vende e entra em pedido: tudo bem */ }
}
// insumo de receita, comida e material de obra têm de existir no nível em que são pedidos
for (const [id, r] of entradas(receitas)) for (const k of Object.keys(r.entra || {})) if (nivelDaOrigem[k] !== undefined && nivelDaOrigem[k] > r.nivel) erro('receitas', `receita "${id}" (nível ${r.nivel}) pede "${k}", que só existe no nível ${nivelDaOrigem[k]}`);
for (const [id, a] of entradas(animais)) for (const k of Object.keys(a.come || {})) if (nivelDaOrigem[k] !== undefined && nivelDaOrigem[k] > a.nivel) erro('animais', `animal "${id}" (nível ${a.nivel}) come "${k}", que só existe no nível ${nivelDaOrigem[k]}`);
for (const [id, c] of entradas(construcoes)) {
  for (const k of Object.keys((c.custo || {}).itens || {})) if (nivelDaOrigem[k] > c.nivel) erro('construcoes', `construção "${id}" (nível ${c.nivel}) pede "${k}", que só existe no nível ${nivelDaOrigem[k]}`);
  for (const a of c.ampliacoes || []) for (const k of Object.keys((a.custo || {}).itens || {})) if (nivelDaOrigem[k] > a.nivel) erro('construcoes', `ampliação de "${id}" (nível ${a.nivel}) pede "${k}", que só existe no nível ${nivelDaOrigem[k]}`);
}
// conta: a receita tem de valer mais que os insumos (senão é melhor vender cru)
for (const [id, r] of entradas(receitas)) {
  const ent = Object.entries(r.entra || {}).reduce((s, [k, n]) => s + n * Math.max((itens[k] || {}).venda || 0, 0), 0);
  const entCusto = Object.entries(r.entra || {}).reduce((s, [k, n]) => { const it = itens[k] || {}; return s + n * (it.venda > 0 ? it.venda : it.compra || 0); }, 0);
  const sai = Object.entries(r.sai || {}).reduce((s, [k, n]) => s + n * ((itens[k] || {}).venda || 0), 0);
  const soMaterial = Object.keys(r.sai || {}).every((k) => itens[k] && ['material', 'racao'].includes(itens[k].tipo));
  if (soMaterial) {
    const comprar = Object.entries(r.sai).reduce((s, [k, n]) => s + n * (itens[k].compra || 0), 0);
    const comprarInsumos = Object.entries(r.entra).reduce((s, [k, n]) => s + n * ((itens[k] || {}).compra || (itens[k] || {}).venda || 0), 0);
    if (comprar && comprar <= ent) erro('receitas', `receita "${id}": comprar pronto (${comprar}) sai mais barato que o valor de venda dos insumos (${ent})`);
    if (comprar && comprarInsumos && comprar < comprarInsumos * 0.9) aviso('receitas', `receita "${id}": comprar pronto (${comprar}) sai mais barato que comprar os insumos (${comprarInsumos})`);
  } else if (sai < entCusto * 1.1) erro('receitas', `receita "${id}": o que sai vale ${sai} e o que entra vale ${entCusto}: tem de valer pelo menos 10% a mais`);
  else if (sai > entCusto * 2.5 && entCusto > 20) aviso('receitas', `receita "${id}": o que sai vale ${sai}, mais de 2,5 vezes o que entra (${entCusto})`);
  void ent;
}

// =====================================================================
// terras
// =====================================================================
const area = (a) => Array.isArray(a) && a.length === 4 && a.every(int) && a[2] > a[0] && a[3] > a[1];
const dentro = (a, b) => a[0] >= b[0] && a[1] >= b[1] && a[2] <= b[2] && a[3] <= b[3];
const cruza = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
const encosta = (a, b) => (a[0] <= b[2] && b[0] <= a[2] && a[1] < b[3] && b[1] < a[3]) || (a[1] <= b[3] && b[1] <= a[3] && a[0] < b[2] && b[0] < a[2]);
{
  const mp = terras.mapa || {};
  if (!inteiroPos(mp.largura) || !inteiroPos(mp.profundidade)) erro('terras', 'falta "mapa": { largura, profundidade }');
  const tudo = [0, 0, mp.largura || 0, mp.profundidade || 0];
  const ini = terras.inicial || {};
  if (!area(ini.area)) erro('terras', 'falta "inicial.area": [x0, z0, x1, z1]');
  else if (!dentro(ini.area, tudo)) erro('terras', 'a área inicial sai do mapa');
  if (ini.limpo && (!area(ini.limpo) || (area(ini.area) && !dentro(ini.limpo, ini.area)))) erro('terras', '"inicial.limpo" tem de ser uma área dentro da área inicial');
  const obst = terras.obstaculos || {};
  for (const [id, o] of entradas(obst)) {
    const onde = `obstáculo "${id}"`;
    conferirId('terras', id, 'obstáculo');
    campo('terras', onde, o, 'nome', txt, 'um texto');
    if (!fs.has(o.ferramenta)) erro('terras', `${onde}: a ferramenta "${o.ferramenta}" não é função de nenhum item`);
    else if (!porFuncao[o.ferramenta].some((x) => (x.forca || 1) >= (o.forcaMinima || 1))) erro('terras', `${onde}: nenhuma ferramenta "${o.ferramenta}" tem força ${o.forcaMinima}`);
    campo('terras', onde, o, 'resistencia', inteiroPos, 'um inteiro maior que zero');
    campo('terras', onde, o, 'chance', (v) => num(v) && v > 0 && v <= 1, 'um número entre 0 e 1');
    campo('terras', onde, o, 'xp', naoNegativo, 'um número');
    mapaDeItens('terras', onde, o.da, 'da');
  }
  const natureza = (onde, n) => { if (!obj(n)) { erro('terras', `${onde}: falta "natureza": { obstáculo: fração das casas }`); return; } let soma = 0; for (const [k, v] of Object.entries(n)) { if (!obst[k]) erro('terras', `${onde}: natureza cita "${k}", que não está em "obstaculos"`); if (!(num(v) && v >= 0 && v <= 1)) erro('terras', `${onde}: natureza.${k} devia ser uma fração entre 0 e 1`); soma += v; } if (soma > 0.8) aviso('terras', `${onde}: ${Math.round(soma * 100)}% das casas com obstáculo é muito`); };
  natureza('área inicial', ini.natureza);
  if (terras.natureza) natureza('terra à venda (padrão)', terras.natureza);
  const lotes = Array.isArray(terras.lotes) ? terras.lotes : [];
  if (!Array.isArray(terras.lotes)) erro('terras', '"lotes" devia ser uma lista');
  const ids = new Set();
  let precoAnt = 0, nivelAnt = 0;
  const posse = area(ini.area) ? [ini.area] : [];
  lotes.forEach((l, k) => {
    const onde = `lote "${l.id}"`;
    if (!txt(l.id)) { erro('terras', `o lote ${k + 1} não tem "id"`); return; }
    conferirId('terras', l.id, 'lote');
    if (ids.has(l.id)) erro('terras', `${onde}: id repetido`);
    ids.add(l.id);
    campo('terras', onde, l, 'nome', txt, 'um texto');
    campo('terras', onde, l, 'nivel', inteiroPos, 'um inteiro');
    if (!area(l.area)) { erro('terras', `${onde}: falta "area": [x0, z0, x1, z1]`); return; }
    if (!dentro(l.area, tudo)) erro('terras', `${onde}: sai do mapa`);
    if (area(ini.area) && cruza(l.area, ini.area)) erro('terras', `${onde}: está por cima da área inicial`);
    lotes.forEach((o, j) => { if (j < k && area(o.area) && cruza(l.area, o.area)) erro('terras', `${onde}: está por cima do lote "${o.id}"`); });
    const p = l.preco;
    if (!positivo(p)) erro('terras', `${onde}: "preco" devia ser um número (ouro); terra não se vende por cash`);
    if (p <= precoAnt) erro('terras', `${onde}: o preço (${p}) devia ser maior que o do lote anterior (${precoAnt})`);
    if (l.nivel < nivelAnt) erro('terras', `${onde}: o nível (${l.nivel}) devia ser igual ou maior que o do lote anterior (${nivelAnt})`);
    for (const e of l.exige || []) if (!lotes.some((o, j) => o.id === e && j < k)) erro('terras', `${onde}: exige "${e}", que não é um lote anterior`);
    if (!posse.some((a) => encosta(a, l.area))) erro('terras', `${onde}: não encosta em terra que o jogador já tem quando chega a vez dele`);
    posse.push(l.area);
    natureza(onde, l.natureza);
    precoAnt = p; nivelAnt = l.nivel;
  });
  if (lotes.length < 8 || lotes.length > 12) aviso('terras', `são ${lotes.length} lotes; o plano pede de 8 a 12`);
  const pontos = terras.pontos || {};
  for (const p of ['poco', 'banca', 'celeiro', 'casa', 'personagem']) {
    const v = pontos[p];
    if (!(Array.isArray(v) && v.length >= 2 && num(v[0]) && num(v[1]))) { erro('terras', `falta "pontos.${p}": [x, z]`); continue; }
    const c = construcoes[p] ? construcoes[p].casas : [1, 1];
    if (area(ini.area) && !dentro([v[0], v[1], v[0] + c[0], v[1] + c[1]], ini.area)) erro('terras', `o ponto "${p}" (${v}) fica fora da área inicial`);
  }
  // construções que já vêm no terreno: têm ponto, não se sobrepõem
  const postas = [];
  for (const [id, c] of entradas(construcoes)) {
    if (!c.inicial) continue;
    const v = pontos[id];
    if (!v) { erro('terras', `a construção inicial "${id}" não tem ponto em "pontos"`); continue; }
    const a = [v[0], v[1], v[0] + c.casas[0], v[1] + c.casas[1]];
    for (const o of postas) if (cruza(a, o.a)) erro('terras', `"${id}" e "${o.id}" nascem uma em cima da outra`);
    if (ini.limpo && !dentro(a, ini.area)) erro('terras', `"${id}" nasce fora da área inicial`);
    postas.push({ id, a });
  }
  for (const pn of ['personagem', 'vizinho']) { const v = pontos[pn]; if (v) for (const o of postas) if (v[0] >= o.a[0] && v[0] < o.a[2] && v[1] >= o.a[1] && v[1] < o.a[3]) erro('terras', `o ponto "${pn}" cai dentro de "${o.id}"`); }
  for (const c of terras.caminhos || []) if (!area(c)) erro('terras', 'caminho inválido: esperava [x0, z0, x1, z1]');
}

// =====================================================================
// níveis
// =====================================================================
{
  const xp = niveis.xp;
  if (!Array.isArray(xp) || xp.length < 2 || !xp.every(num)) erro('niveis', '"xp" devia ser a lista da experiência total para chegar a cada nível');
  else {
    if (xp[0] !== 0) erro('niveis', 'xp[0] devia ser 0 (o nível 1 começa do zero)');
    for (let k = 1; k < xp.length; k++) if (!(xp[k] > xp[k - 1])) { erro('niveis', `"xp" tem de crescer sempre (nível ${k + 1})`); break; }
    for (let k = 2; k < xp.length; k++) if (xp[k] - xp[k - 1] < xp[k - 1] - xp[k - 2]) { aviso('niveis', `o nível ${k + 1} pede menos experiência que o nível ${k} (${xp[k] - xp[k - 1]} contra ${xp[k - 1] - xp[k - 2]})`); }
    if (xp.length < 50) erro('niveis', `a curva tem ${xp.length} níveis; o plano pede pelo menos 50`);
    if (inteiroPos(niveis.maximo) && niveis.maximo !== xp.length) erro('niveis', `"maximo" diz ${niveis.maximo} e a lista "xp" tem ${xp.length} níveis`);
  }
  const rec = niveis.recompensas || {};
  const max = Array.isArray(xp) ? xp.length : 0;
  for (let n = 2; n <= max; n++) {
    const r = rec[n];
    if (!obj(r)) { erro('niveis', `falta a recompensa do nível ${n}`); continue; }
    if (!positivo(r.ouro)) erro('niveis', `recompensa do nível ${n}: todo nível dá ouro`);
    recompensa('niveis', `recompensa do nível ${n}`, r);
  }
  for (const n of Object.keys(rec)) if (!(+n >= 2 && +n <= max)) erro('niveis', `há recompensa para o nível ${n}, que não existe`);
  // todo nível até o fim do conteúdo libera alguma coisa
  const ate = niveis.conteudoAte || 25;
  const libera = {};
  const marca = (n, oQue) => { (libera[n] = libera[n] || []).push(oQue); };
  for (const [id, it] of entradas(itens)) if (it.compra > 0 && !['semente', 'muda'].includes(it.tipo)) marca(it.nivel, id);
  for (const [id, c] of entradas(culturas)) marca(c.nivel, id);
  for (const [id, a] of entradas(arvores)) marca(a.nivel, id);
  for (const [id, a] of entradas(animais)) if (a.preco && a.preco.ouro) marca(a.nivel, id);
  for (const [id, c] of entradas(construcoes)) { if (!(c.custo && c.custo.cash)) marca(c.nivel, id); for (const a of c.ampliacoes || []) marca(a.nivel, id + '+'); }
  for (const [id, r] of entradas(receitas)) marca(r.nivel, id);
  for (const l of terras.lotes || []) marca(l.nivel, l.id);
  for (const v of pedidos.vagas || []) marca(v.nivel, 'pedidos');
  for (let n = 2; n <= ate; n++) if (!libera[n]) erro('niveis', `o nível ${n} não libera nada (o conteúdo vai até o nível ${ate})`);
  D._libera = libera;
}

// =====================================================================
// pedidos
// =====================================================================
{
  campo('pedidos', 'pedidos', pedidos, 'nivel', inteiroPos, 'um inteiro');
  campo('pedidos', 'pedidos', pedidos, 'bonusOuro', (v) => num(v) && v >= 1, 'um número de 1 para cima');
  campo('pedidos', 'pedidos', pedidos, 'xpPorOuro', positivo, 'um número maior que zero');
  const va = pedidos.valorAlvo || {};
  if (!positivo(va.base) || !positivo(va.expoente)) erro('pedidos', 'falta "valorAlvo": { base, expoente }');
  if (!Array.isArray(va.variacao) || va.variacao.length !== 2 || !(va.variacao[0] <= va.variacao[1])) erro('pedidos', 'valorAlvo.variacao devia ser [mínimo, máximo]');
  const es = pedidos.esperaSeg || {};
  if (!naoNegativo(es.base) || !naoNegativo(es.porNivel) || !positivo(es.max)) erro('pedidos', 'falta "esperaSeg": { base, porNivel, max }');
  if (!Array.isArray(pedidos.vagas) || !pedidos.vagas.length) erro('pedidos', 'falta a lista "vagas"');
  else { let n0 = 0, v0 = 0; for (const v of pedidos.vagas) { if (!(v.nivel > n0) || !(v.vagas > v0)) erro('pedidos', 'em "vagas", nível e vagas têm de crescer'); n0 = v.nivel; v0 = v.vagas; } if (pedidos.vagas[0].nivel !== pedidos.nivel) erro('pedidos', 'a primeira linha de "vagas" devia ser a do nível em que o quadro abre'); }
  for (const l of pedidos.linhas || []) { const s = (l.pesos || []).reduce((a, b) => a + b, 0); if (Math.abs(s - 1) > 0.001) erro('pedidos', `em "linhas", os pesos até o nível ${l.ateNivel} somam ${s}, não 1`); }
  const cat = pedidos.categorias || {};
  const sc = Object.values(cat).reduce((a, b) => a + b, 0);
  if (Math.abs(sc - 1) > 0.001) erro('pedidos', `as "categorias" somam ${sc}, não 1`);
  for (const k of Object.keys(cat)) if (!['cultura', 'fruta', 'animal', 'receita'].includes(k)) erro('pedidos', `categoria desconhecida "${k}"`);
  for (const k of pedidos.fora || []) if (!itens[k]) erro('pedidos', `"fora" cita "${k}", que não existe`);
  for (const c of pedidos.clientes || []) { if (!txt(c.id) || !txt(c.nome)) erro('pedidos', 'cliente sem id ou nome'); else conferirId('pedidos', c.id, 'cliente'); }
  const q = construcoes['quadro-de-pedidos'];
  if (q && q.nivel !== pedidos.nivel) erro('pedidos', `o quadro de pedidos libera no nível ${q.nivel} e os pedidos no nível ${pedidos.nivel}`);
}

// =====================================================================
// missões, conquistas, diária, convite
// =====================================================================
{
  const eventos = (missoes.eventos || {}).lista || {};
  if (!Object.keys(eventos).length) erro('missoes', 'falta "eventos.lista" (os eventos que missões e conquistas escutam)');
  const classes = new Set([...TIPOS_ITEM, 'animal', 'lote', 'construcao', 'diaria', 'conquista', 'convite']);
  const presente = {}; // bicho que uma missão anterior deu de presente: { especie: nível da missão }
  // devolve o menor nível em que o filtro pode ser cumprido. Uma lista no filtro vale por "qualquer um destes".
  function filtro(onde, f) {
    let n = 1;
    if (f === undefined || f === null) return n;
    if (!obj(f)) { erro('missoes', `${onde}: "filtro" devia ser um objeto`); return n; }
    for (const [k, valor] of Object.entries(f)) {
      const lista = Array.isArray(valor) ? valor : [valor];
      if (!lista.length) { erro('missoes', `${onde}: filtro "${k}" com lista vazia`); continue; }
      const niveisK = [];
      for (const v of lista) {
        if (k === 'item') { if (!itens[v]) erro('missoes', `${onde}: filtro cita o item "${v}", que não existe`); else niveisK.push(dado.has(v) ? 1 : nivelDaOrigem[v] || itens[v].nivel); }
        else if (k === 'cultura') { if (!culturas[v]) erro('missoes', `${onde}: filtro cita a cultura "${v}", que não existe`); else niveisK.push(culturas[v].nivel); }
        else if (k === 'arvore') { if (!arvores[v]) erro('missoes', `${onde}: filtro cita a árvore "${v}", que não existe`); else niveisK.push(arvores[v].nivel); }
        else if (k === 'animal') { if (!animais[v]) erro('missoes', `${onde}: filtro cita o animal "${v}", que não existe`); else niveisK.push(animais[v].nivel); }
        else if (k === 'construcao' || k === 'onde' || k === 'abrigo') { if (!construcoes[v]) erro('missoes', `${onde}: filtro cita a construção "${v}", que não existe`); else niveisK.push(construcoes[v].nivel); }
        else if (k === 'lote') { const l = (terras.lotes || []).find((x) => x.id === v); if (!l) erro('missoes', `${onde}: filtro cita o lote "${v}", que não existe`); else niveisK.push(l.nivel); }
        else if (k === 'familia') { if (!FAMILIAS.includes(v)) erro('missoes', `${onde}: família "${v}" não existe`); else niveisK.push(Math.min(...entradas(animais).filter(([, a]) => a.familia === v && a.preco.ouro).map(([, a]) => a.nivel))); }
        else if (k === 'classe') { if (!classes.has(v)) erro('missoes', `${onde}: filtro classe "${v}" desconhecido`); }
        else if (k === 'obstaculo') { if (!(terras.obstaculos || {})[v]) erro('missoes', `${onde}: filtro cita o obstáculo "${v}", que não está em terras.obstaculos`); }
        else if (k === 'com') { if (v !== 'boi') erro('missoes', `${onde}: filtro com "${v}" desconhecido (só "boi")`); else if (animais.boi) niveisK.push(Math.min(animais.boi.nivel, presente.boi || Infinity)); }
        else if (k === 'parte') { if (!['cocho', 'bebedouro'].includes(v)) erro('missoes', `${onde}: filtro parte "${v}" desconhecido`); }
        else erro('missoes', `${onde}: campo de filtro desconhecido "${k}"`);
      }
      if (niveisK.length) n = Math.max(n, Math.min(...niveisK));
    }
    return n;
  }
  function objetivo(onde, o) {
    if (!obj(o)) { erro('missoes', `${onde}: falta "objetivo"`); return 1; }
    if (!eventos[o.evento]) erro('missoes', `${onde}: o evento "${o.evento}" não está em eventos.lista`);
    if (!inteiroPos(o.n)) erro('missoes', `${onde}: objetivo.n devia ser um inteiro maior que zero`);
    return filtro(onde, o.filtro);
  }
  const ids = new Set();
  const viz = Array.isArray(missoes.vizinho) ? missoes.vizinho : [];
  if (!viz.length) erro('missoes', 'falta a lista "vizinho"');
  let nivelAnt = 1;
  const jaTem = new Set([...(regras.inicio || {}).cinto || [], ...(regras.inicio || {}).suporte || []].map((id) => (itens[id] || {}).funcao));
  viz.forEach((mi, k) => {
    const onde = `missão "${mi.id}"`;
    if (!txt(mi.id)) { erro('missoes', `a missão ${k + 1} não tem "id"`); return; }
    conferirId('missoes', mi.id, 'missão');
    if (ids.has(mi.id)) erro('missoes', `${onde}: id repetido`); ids.add(mi.id);
    for (const c of ['titulo', 'fala', 'ensina']) campo('missoes', onde, mi, c, txt, 'um texto');
    campo('missoes', onde, mi, 'nivel', inteiroPos, 'um inteiro');
    if (txt(mi.fala) && mi.fala.length > 240) aviso('missoes', `${onde}: a fala tem ${mi.fala.length} letras; no celular o balão fica grande (até 240)`);
    const nMin = objetivo(onde, mi.objetivo);
    if (nMin > mi.nivel) erro('missoes', `${onde} é do nível ${mi.nivel}, mas o objetivo só dá para cumprir no nível ${nMin}`);
    if (mi.nivel < nivelAnt) erro('missoes', `${onde}: o nível (${mi.nivel}) é menor que o da missão anterior (${nivelAnt}); a sequência tem de seguir a ordem em que as coisas liberam`);
    nivelAnt = Math.max(nivelAnt, mi.nivel || 1);
    if (!obj(mi.recompensa) || !Object.keys(mi.recompensa).length) erro('missoes', `${onde}: toda missão tem recompensa`);
    recompensa('missoes', onde, mi.recompensa);
    if (mi.entrega !== undefined) erro('missoes', `${onde}: "entrega" não existe mais; a ferramenta vem na recompensa (itens) da missão anterior`);
    // o objetivo pede uma ferramenta que o jogador ainda não ganhou nem pode comprar?
    const precisa = { arou: 'enxada', regou: 'regador', encheu: 'regador' }[mi.objetivo && mi.objetivo.evento];
    const obs = mi.objetivo && mi.objetivo.evento === 'limpou' && mi.objetivo.filtro && (terras.obstaculos || {})[mi.objetivo.filtro.obstaculo];
    const recolhe = mi.objetivo && mi.objetivo.evento === 'recolheu' && mi.objetivo.filtro && entradas(animais).find(([, a]) => a.produto === mi.objetivo.filtro.item);
    const func = obs ? obs.ferramenta : recolhe && recolhe[1].ferramenta ? recolhe[1].ferramenta : precisa;
    if (func && !jaTem.has(func) && !(porFuncao[func] || []).some((x) => x.compra > 0 && x.nivel <= mi.nivel)) erro('missoes', `${onde}: pede "${func}", que o jogador ainda não ganhou nem pode comprar no nível ${mi.nivel}`);
    // a ferramenta dada nesta recompensa vale para as missões seguintes
    for (const f of Object.keys((mi.recompensa || {}).itens || {})) if (itens[f] && ['ferramenta', 'recipiente'].includes(itens[f].tipo)) jaTem.add(itens[f].funcao);
    // o bicho dado nesta recompensa também (o boi do nível 4, antes de se poder comprar outro)
    for (const a of Object.keys((mi.recompensa || {}).animais || {})) if (animais[a] && !(presente[a] <= mi.nivel)) presente[a] = mi.nivel;
  });
  if (viz.length < 25 || viz.length > 40) aviso('missoes', `são ${viz.length} missões do vizinho; o plano fala em cerca de 30`);
  // conquistas
  const cqs = Array.isArray(missoes.conquistas) ? missoes.conquistas : [];
  if (!cqs.length) erro('missoes', 'falta a lista "conquistas"');
  const idsC = new Set();
  for (const c of cqs) {
    const onde = `conquista "${c.id}"`;
    if (!txt(c.id)) { erro('missoes', 'conquista sem "id"'); continue; }
    conferirId('missoes', c.id, 'conquista');
    if (idsC.has(c.id)) erro('missoes', `${onde}: id repetido`); idsC.add(c.id);
    campo('missoes', onde, c, 'nome', txt, 'um texto');
    if (!eventos[c.evento]) erro('missoes', `${onde}: o evento "${c.evento}" não está em eventos.lista`);
    filtro(onde, c.filtro);
    if (!Array.isArray(c.marcos) || c.marcos.length < 3 || c.marcos.length > 5) erro('missoes', `${onde}: precisa de 3 a 5 marcos`);
    else for (let k = 1; k < c.marcos.length; k++) if (!(c.marcos[k] > c.marcos[k - 1])) erro('missoes', `${onde}: os marcos têm de crescer`);
    if (!Array.isArray(c.recompensas) || !Array.isArray(c.marcos) || c.recompensas.length !== c.marcos.length) erro('missoes', `${onde}: uma recompensa por marco`);
    else c.recompensas.forEach((r, k) => recompensa('missoes', `${onde}, marco ${k + 1}`, r));
  }
  if (cqs.length < 15 || cqs.length > 25) aviso('missoes', `são ${cqs.length} conquistas; o plano fala em cerca de 20`);
  // diária
  const dias = (missoes.diaria || {}).dias;
  if (!Array.isArray(dias) || dias.length !== 7) erro('missoes', 'a diária tem de ter 7 dias');
  else dias.forEach((d, k) => { if (d.dia !== k + 1) erro('missoes', `diária: o dia ${k + 1} está marcado como ${d.dia}`); if (!obj(d.recompensa) || !Object.keys(d.recompensa).length) erro('missoes', `diária, dia ${k + 1}: sem recompensa`); recompensa('missoes', `diária, dia ${k + 1}`, d.recompensa); if (d.primeiraVolta) recompensa('missoes', `diária, dia ${k + 1}, primeira volta`, d.primeiraVolta); });
  if (Array.isArray(dias)) for (const d of dias) for (const r of [d.recompensa, d.primeiraVolta]) for (const k of Object.keys((r && r.itens) || {})) if (itens[k] && ['semente', 'muda', 'colheita', 'produto', 'racao'].includes(itens[k].tipo)) erro('missoes', `diária, dia ${d.dia}: "${k}" sai da lavoura; o presente da diária é material de obra, ouro, cash ou cosmético`);
  if ((missoes.diaria || {}).zeraAoFaltar !== false) erro('missoes', 'diária: "zeraAoFaltar" tem de ser false (quem falta um dia continua de onde parou)');
  const cv = missoes.convite;
  if (!obj(cv)) erro('missoes', 'falta "convite"');
  else { recompensa('missoes', 'convite', cv.recompensaPorAmigo); recompensa('missoes', 'convite (convidado)', cv.convidado); campo('missoes', 'convite', cv, 'limite', inteiroPos, 'um inteiro'); campo('missoes', 'convite', cv, 'amigoChegaAoNivel', inteiroPos, 'um inteiro'); }
  const cp = missoes.compartilhar;
  if (!obj(cp)) erro('missoes', 'falta "compartilhar"');
  else {
    recompensa('missoes', 'compartilhar', cp.recompensa);
    if (typeof cp.ligado !== 'boolean') erro('missoes', 'compartilhar: falta a chave "ligado" (true ou false)');
    if (cp.limitePorDia !== 1) erro('missoes', 'compartilhar: "limitePorDia" tem de ser 1');
    for (const k of Object.keys(cp.recompensa || {})) if (!['ouro', 'ouroPorNivel'].includes(k)) erro('missoes', `compartilhar: o agrado é só em ouro (achei "${k}")`);
  }
  if (obj(cv) && typeof cv.ligado !== 'boolean') erro('missoes', 'convite: falta a chave "ligado" (true ou false)');
  // nenhuma missão manda gastar cash
  for (const mi of viz) { const f = (mi.objetivo || {}).filtro || {}; if ((mi.objetivo || {}).evento !== 'comprou') continue;
    for (const v of [].concat(f.item || [])) if (itens[v] && !(itens[v].compra > 0)) erro('missoes', `missão "${mi.id}": manda comprar "${v}", que não se vende por ouro`);
    for (const v of [].concat(f.animal || [])) if (animais[v] && !(animais[v].preco || {}).ouro) erro('missoes', `missão "${mi.id}": manda comprar "${v}", que só se vende por cash`);
  }
  if (!obj(missoes.quem) || !txt(missoes.quem.nome)) erro('missoes', 'falta "quem": { nome } (o vizinho)');
}

// =====================================================================
// loja
// =====================================================================
{
  const o = loja.ouro || {};
  for (const id of [...(o.itens || []), ...(o.fora || [])]) if (!itens[id]) erro('loja', `ouro: cita o item "${id}", que não existe`);
  for (const ab of o.abas || []) { if (!txt(ab.id) || !txt(ab.nome)) erro('loja', 'aba sem id ou nome'); else conferirId('loja', ab.id, 'aba'); for (const t of ab.tipos || []) if (!TIPOS_ITEM.includes(t)) erro('loja', `aba "${ab.id}": tipo de item "${t}" não existe`); if (ab.fonte && !['animais', 'construcoes', 'terras'].includes(ab.fonte)) erro('loja', `aba "${ab.id}": fonte "${ab.fonte}" desconhecida`); }
  const c = loja.cash;
  if (!obj(c)) erro('loja', 'falta "cash"');
  else {
    if (!Array.isArray(c.pacotes) || !c.pacotes.length) erro('loja', 'cash: falta a lista "pacotes"');
    let ant = null;
    for (const p of c.pacotes || []) {
      if (!txt(p.id)) { erro('loja', 'pacote sem id'); continue; }
      conferirId('loja', p.id, 'pacote');
      if (!inteiroPos(p.cash) || !positivo(p.precoBRL)) erro('loja', `pacote "${p.id}": precisa de "cash" (inteiro) e "precoBRL"`);
      if (ant && !(p.cash > ant.cash && p.precoBRL > ant.precoBRL)) erro('loja', `pacote "${p.id}": cash e preço têm de crescer em relação ao anterior`);
      if (ant && p.cash / p.precoBRL < ant.cash / ant.precoBRL) erro('loja', `pacote "${p.id}": dá menos cash por real que o pacote menor`);
      ant = p;
    }
    const idsO = new Set();
    for (const of of c.ofertas || []) {
      const onde = `oferta "${of.id}"`;
      if (!txt(of.id)) { erro('loja', 'oferta sem id'); continue; }
      conferirId('loja', of.id, 'oferta');
      if (idsO.has(of.id)) erro('loja', `${onde}: id repetido`); idsO.add(of.id);
      campo('loja', onde, of, 'nome', txt, 'um texto');
      if (!TIPOS_OFERTA.includes(of.tipo)) erro('loja', `${onde}: tipo "${of.tipo}" não existe (use ${TIPOS_OFERTA.join(', ')})`);
      if (of.tipo !== 'tempo' && of.tipo !== 'vaga' && !inteiroPos(of.cash)) erro('loja', `${onde}: precisa de "cash" (inteiro maior que zero)`);
      if (of.tipo === 'vaga' && !entradas(construcoes).some(([, co]) => (co.ampliacoes || []).some((a) => a.fila && inteiroPos(a.cash)))) erro('loja', `${onde}: nenhuma ampliação de fila tem preço em cash em construcoes.json`);
      if (of.item) { const it = itens[of.item]; if (!it) erro('loja', `${onde}: o item "${of.item}" não existe`); else if (it.tipo !== 'cosmetico') erro('loja', `${onde}: cash só compra item cosmético, e "${of.item}" é ${it.tipo}`); }
      if (of.construcao) { const co = construcoes[of.construcao]; if (!co) erro('loja', `${onde}: a construção "${of.construcao}" não existe`); else if (co.tipo !== 'decoracao') erro('loja', `${onde}: cash só compra decoração, e "${of.construcao}" é ${co.tipo}`); else if (!(co.custo && co.custo.cash === of.cash)) erro('loja', `${onde}: o preço (${of.cash}) não bate com o custo em cash da construção`); }
      if (of.animal) { const an = animais[of.animal]; if (!an) erro('loja', `${onde}: o animal "${of.animal}" não existe`); else { if (an.familia === 'producao') erro('loja', `${onde}: cash não compra animal de produção`); if (!(an.preco && an.preco.cash === of.cash)) erro('loja', `${onde}: o preço (${of.cash}) não bate com o do animal`); } }
      if (of.tipo === 'cosmetico' && !of.item && !of.construcao) erro('loja', `${onde}: oferta de cosmético sem "item" nem "construcao"`);
      if (of.tipo === 'estimacao' && !of.animal) erro('loja', `${onde}: oferta de estimação sem "animal"`);
    }
    // tudo que custa cash tem de estar numa oferta
    for (const [id, an] of entradas(animais)) if (an.preco && an.preco.cash && !(c.ofertas || []).some((x) => x.animal === id)) erro('loja', `o animal "${id}" custa cash e não está em nenhuma oferta`);
    for (const [id, co] of entradas(construcoes)) if (co.custo && co.custo.cash && !(c.ofertas || []).some((x) => x.construcao === id)) erro('loja', `a construção "${id}" custa cash e não está em nenhuma oferta`);
    for (const [id, co] of entradas(construcoes)) if (co.custo && co.custo.cash && co.tipo !== 'decoracao') erro('loja', `a construção "${id}" (${co.tipo}) custa cash: só decoração pode`);
  }
}

// =====================================================================
// regras
// =====================================================================
{
  const ini = regras.inicio || {};
  if (!naoNegativo(ini.ouro) || !naoNegativo(ini.cash)) erro('regras', 'inicio: faltam "ouro" e "cash"');
  if (!itens[ini.cesto] || itens[ini.cesto].tipo !== 'recipiente') erro('regras', `inicio.cesto "${ini.cesto}" não é um recipiente`);
  for (const l of ['cinto', 'suporte']) for (const f of ini[l] || []) if (!itens[f] || itens[f].tipo !== 'ferramenta') erro('regras', `inicio.${l}: "${f}" não é uma ferramenta`);
  if ((ini.cinto || []).length > (ini.vagasNoCinto || 0)) erro('regras', 'inicio.cinto tem mais ferramentas que vagas');
  mapaDeItens('regras', 'inicio', ini.itens, 'itens');
  const pe = regras.personagem || {}, fo = regras.folego || {};
  for (const k of ['andar', 'correr']) if (!positivo(pe[k])) erro('regras', `personagem.${k} devia ser maior que zero`);
  if (pe.correr <= pe.andar) erro('regras', 'correr tem de ser mais rápido que andar');
  for (const k of ['max', 'gastoPorSeg', 'recuperaAndando', 'recuperaParado']) if (!positivo(fo[k])) erro('regras', `folego.${k} devia ser maior que zero`);
  if (fo.max / fo.recuperaAndando > 8) aviso('regras', `fôlego: leva ${Math.round(fo.max / fo.recuperaAndando)} s para encher andando; o plano pede "poucos segundos"`);
  if (!obj(regras.acoes)) erro('regras', 'falta "acoes" (segundos por ação)');
  else for (const [k, v] of Object.entries(regras.acoes)) if (!positivo(v)) erro('regras', `acoes.${k} devia ser um número de segundos maior que zero`);
  for (const k of ['arar', 'semear', 'regar', 'colher', 'encher']) if (!regras.acoes || regras.acoes[k] === undefined) erro('regras', `falta acoes.${k}`);
  const co = regras.concluir || {};
  if (!positivo(co.coef) || !positivo(co.expoente)) erro('regras', 'falta "concluir": { coef, expoente }');
  const de = regras.desgaste || {};
  if (!(de.rendeQuandoGasta > 0 && de.rendeQuandoGasta <= 1)) erro('regras', 'desgaste.rendeQuandoGasta devia ficar entre 0 e 1');
  const at = regras.antiTrava || {};
  if (!itens[at.semente] || itens[at.semente].tipo !== 'semente') erro('regras', `antiTrava.semente "${at.semente}" não é uma semente`);
  else if (itens[at.semente].nivel !== 1) erro('regras', 'a semente do antiTrava tem de ser do nível 1');
  // o começo é jogável: há cultura de nível 1 e semente para ela
  if (!entradas(culturas).some(([, c]) => c.nivel === 1)) erro('culturas', 'não há cultura de nível 1: o jogo não começa');
}

// =====================================================================
// resumo
// =====================================================================
const conta = (o) => entradas(o).length;
if (!QUIETO) for (const a of avisos) console.log(a);
for (const e of erros) console.log(e);
console.log(`\n${conta(itens)} itens, ${conta(culturas)} culturas, ${conta(arvores)} árvores, ${conta(animais)} animais, ${conta(construcoes)} construções, ${conta(receitas)} receitas, ${(terras.lotes || []).length} lotes, ${(niveis.xp || []).length} níveis, ${(missoes.vizinho || []).length} missões, ${(missoes.conquistas || []).length} conquistas, ${((loja.cash || {}).ofertas || []).length} ofertas de cash.`);
if (!QUIETO && D._libera) {
  console.log('\nO que cada nível libera:');
  const ate = Math.max(...Object.keys(D._libera).map(Number));
  for (let n = 1; n <= ate; n++) if (D._libera[n]) console.log(String(n).padStart(3) + '  ' + D._libera[n].join(', '));
}
console.log(erros.length ? `\n${erros.length} erro(s), ${avisos.length} aviso(s).` : `\nDados válidos. ${avisos.length} aviso(s).`);
process.exit(erros.length ? 1 : 0);
