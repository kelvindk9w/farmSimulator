// Lê os arquivos de jogo/dados/*.json (já em memória), confere e entrega num formato só para a lógica.
// Os números são da economia; aqui só se confere o formato e se preenche o que é opcional.
// prepararDados(bruto) → { dados, problemas: [{ grave, arquivo, texto }] }. Com problema grave o jogo não começa.
import { prepararConstrucoes } from './dados-construcao.js';
import { prepararTerras } from './dados-terras.js';
import { prepararAnimais } from './dados-animais.js';

const TIPOS_DE_ITEM = ['colheita', 'produto', 'semente', 'muda', 'material', 'racao', 'embalagem', 'ferramenta', 'recipiente', 'cosmetico'];
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const obj = (v) => v && typeof v === 'object' && !Array.isArray(v);

export function prepararDados(bruto) {
  const problemas = [];
  const erro = (arquivo, texto) => problemas.push({ grave: true, arquivo, texto });
  const aviso = (arquivo, texto) => problemas.push({ grave: false, arquivo, texto });
  const tem = (nome) => { if (!obj(bruto[nome])) { erro(nome + '.json', 'o arquivo não existe ou não é um objeto JSON'); return false; } return true; };

  // ---------- itens ----------
  const itens = {};
  if (tem('itens')) {
    for (const [id, it] of Object.entries(bruto.itens)) {
      if (id.startsWith('_')) continue;
      if (!obj(it)) { erro('itens.json', `"${id}" não é um objeto`); continue; }
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) aviso('itens.json', `o id "${id}" devia ser minúsculo, sem acento, com hífen`);
      if (!TIPOS_DE_ITEM.includes(it.tipo)) aviso('itens.json', `"${id}": tipo desconhecido "${it.tipo}"`);
      const n = { ...it, id, nome: it.nome || id, venda: num(it.venda) ? it.venda : 0, compra: num(it.compra) ? it.compra : 0, nivel: num(it.nivel) ? it.nivel : 1 };
      if (it.tipo === 'ferramenta' || it.tipo === 'recipiente') {
        n.funcao = it.funcao || id.split('-')[0]; // "regador-grande" faz o papel de "regador"
        n.capacidade = num(it.capacidade) ? it.capacidade : 0;
        n.degrau = num(it.degrau) ? it.degrau : 1; // entre duas da mesma função, vale a de degrau maior
        n.rapidez = it.rapidez > 0 ? it.rapidez : 1; // multiplica a duração da ação (0.75 = um quarto mais rápida)
        if (it.tipo === 'recipiente' && !(n.capacidade > 0)) erro('itens.json', `"${id}": recipiente precisa de "capacidade" maior que zero`);
        if (n.funcao === 'regador' && !(n.capacidade > 0)) erro('itens.json', `"${id}": o regador precisa de "capacidade" (quantas regas leva)`);
      }
      itens[id] = n;
    }
  }

  // ---------- culturas ----------
  const culturas = {}, culturaDaSemente = {};
  if (tem('culturas')) {
    for (const [id, c] of Object.entries(bruto.culturas)) {
      if (id.startsWith('_')) continue;
      if (!obj(c)) { erro('culturas.json', `"${id}" não é um objeto`); continue; }
      const onde = `cultura "${id}"`;
      if (!itens[c.semente]) erro('culturas.json', `${onde}: a semente "${c.semente}" não existe em itens.json`);
      else if (itens[c.semente].tipo !== 'semente') aviso('culturas.json', `${onde}: o item "${c.semente}" não é do tipo "semente"`);
      if (!itens[c.produto]) erro('culturas.json', `${onde}: o produto "${c.produto}" não existe em itens.json`);
      if (!(c.tempoSeg > 0)) erro('culturas.json', `${onde}: "tempoSeg" tem de ser maior que zero`);
      const n = {
        ...c, id, nome: c.nome || id,
        rende: c.rende > 0 ? Math.round(c.rende) : 1,
        estagios: c.estagios >= 2 ? Math.round(c.estagios) : 4,
        regas: c.regas >= 1 ? Math.round(c.regas) : 1,
        xp: num(c.xp) ? c.xp : 0, nivel: num(c.nivel) ? c.nivel : 1,
      };
      if (c.estagios !== undefined && !(c.estagios >= 2)) aviso('culturas.json', `${onde}: "estagios" devia ser 2 ou mais (usando ${n.estagios})`);
      culturas[id] = n;
      if (culturaDaSemente[c.semente]) aviso('culturas.json', `${onde}: a semente "${c.semente}" já é da cultura "${culturaDaSemente[c.semente]}"`);
      culturaDaSemente[c.semente] = id;
    }
    if (!Object.keys(culturas).length) erro('culturas.json', 'não há nenhuma cultura');
  }

  // ---------- regras ----------
  const R = obj(bruto.regras) ? bruto.regras : {};
  tem('regras');
  const pers = obj(R.personagem) ? R.personagem : {}, fol = obj(R.folego) ? R.folego : {}, ini = obj(R.inicio) ? R.inicio : {};
  const pos = (v, padrao, arquivo, nome) => { if (v === undefined) return padrao; if (!(v > 0)) { aviso(arquivo, `"${nome}" devia ser maior que zero (usando ${padrao})`); return padrao; } return v; };
  if (!obj(R.folego)) aviso('regras.json', 'falta "folego" (max, gastoPorSeg, recuperaAndando, recuperaParado): usando valores padrão');
  const regras = {
    andar: pos(pers.andar, 2.6, 'regras.json', 'personagem.andar'),
    correr: pos(pers.correr, 4.8, 'regras.json', 'personagem.correr'),
    correrAcimaDe: pos(pers.correrAcimaDe, 5, 'regras.json', 'personagem.correrAcimaDe'),
    alcance: pos(pers.alcance, 1.3, 'regras.json', 'personagem.alcance'),
    folego: {
      max: pos(fol.max, 100, 'regras.json', 'folego.max'),
      gastoPorSeg: pos(fol.gastoPorSeg, 12, 'regras.json', 'folego.gastoPorSeg'),
      recuperaAndando: pos(fol.recuperaAndando, 5, 'regras.json', 'folego.recuperaAndando'),
      recuperaParado: pos(fol.recuperaParado, 14, 'regras.json', 'folego.recuperaParado'),
    },
    acoes: {}, // segundos por ação; o que não vier aqui usa a duração padrão da própria ação
    xp: obj(R.xp) ? { ...R.xp } : {}, // experiência por ação (arar, semear, regar...); colher vem da cultura
    inicio: {
      ouro: num(ini.ouro) ? ini.ouro : 0, cash: num(ini.cash) ? ini.cash : 0,
      cesto: ini.cesto || null, cinto: Array.isArray(ini.cinto) ? [...ini.cinto] : [], suporte: Array.isArray(ini.suporte) ? [...ini.suporte] : [],
      vagasNoCinto: ini.vagasNoCinto >= 1 ? Math.round(ini.vagasNoCinto) : 2,
      itens: obj(ini.itens) ? { ...ini.itens } : {},
    },
    celeiro: { capacidade: obj(R.celeiro) && R.celeiro.capacidade > 0 ? R.celeiro.capacidade : 50 },
    filaMax: R.filaMax > 0 ? R.filaMax : 40,
    reararAposColher: !!(obj(R.lavoura) && R.lavoura.reararAposColher), // colheu, a casa volta a ser campo sem sulco (pede a enxada de novo)
    antiTrava: obj(R.antiTrava) && R.antiTrava.semente ? { semente: R.antiTrava.semente, quantidade: R.antiTrava.quantidade > 0 ? R.antiTrava.quantidade : 1 } : null,
  };
  if (regras.antiTrava && !itens[regras.antiTrava.semente]) { aviso('regras.json', `antiTrava.semente: "${regras.antiTrava.semente}" não existe em itens.json`); regras.antiTrava = null; }
  if (obj(R.acoes)) for (const [k, v] of Object.entries(R.acoes)) {
    const seg = num(v) ? v : obj(v) && num(v.seg) ? v.seg : obj(v) && num(v.dur) ? v.dur : null;
    if (seg === null || !(seg > 0)) aviso('regras.json', `acoes.${k}: esperava segundos (número maior que zero)`); else regras.acoes[k] = seg;
  }
  const I = regras.inicio;
  if (!I.cesto) erro('regras.json', 'falta "inicio.cesto" (o recipiente com que a personagem começa)');
  else if (!itens[I.cesto] || itens[I.cesto].tipo !== 'recipiente') erro('regras.json', `inicio.cesto: "${I.cesto}" não é um recipiente de itens.json`);
  for (const lista of ['cinto', 'suporte']) for (const f of I[lista]) if (!itens[f] || itens[f].tipo !== 'ferramenta') erro('regras.json', `inicio.${lista}: "${f}" não é uma ferramenta de itens.json`);
  if (I.cinto.length > I.vagasNoCinto) erro('regras.json', `inicio.cinto tem ${I.cinto.length} ferramentas, mas o cinto só tem ${I.vagasNoCinto} vagas`);
  for (const f of ['enxada', 'regador']) if (![...I.cinto, ...I.suporte].some((id) => itens[id] && itens[id].funcao === f)) aviso('regras.json', `a personagem começa sem ${f} (nem no cinto, nem no suporte)`);
  for (const k of Object.keys(I.itens)) if (!itens[k]) erro('regras.json', `inicio.itens: "${k}" não existe em itens.json`);

  // ---------- terras ----------
  const T = obj(bruto.terras) ? bruto.terras : {};
  tem('terras');
  const mapa = obj(T.mapa) ? T.mapa : {};
  const terras = {
    largura: Math.round(mapa.largura || 0), profundidade: Math.round(mapa.profundidade || 0),
    inicial: Array.isArray(T.inicial) ? T.inicial : obj(T.inicial) && Array.isArray(T.inicial.area) ? T.inicial.area : null,
    limpo: obj(T.inicial) && Array.isArray(T.inicial.limpo) ? T.inicial.limpo : null, // miolo da área inicial que nasce sem mato (sem isto, ela toda)
    naturezaInicial: obj(T.inicial) && obj(T.inicial.natureza) ? T.inicial.natureza : {}, // mato, pedra e toco nas beiradas da área inicial
    campo: obj(T.inicial) && Array.isArray(T.inicial.campo) ? T.inicial.campo : null, // o campo de plantação demarcado com que a fazenda começa: [x0, z0, x1, z1]
    lotes: Array.isArray(T.lotes) ? T.lotes.filter(obj) : [],
    pontos: obj(T.pontos) ? T.pontos : {}, // onde nascem poço, banca, celeiro, casa e a personagem: [x, z]
    caminhos: Array.isArray(T.caminhos) ? T.caminhos : [], // faixas de caminho de terra: [x0, z0, x1, z1]
    natureza: obj(T.natureza) ? T.natureza : {}, // o que cobre a terra fora dos lotes: { mata: 0.03, mato: 0.05, pedra: 0.02, toco: 0.01 } (chance por casa); cada lote pode ter a sua
    casas: {}, // tamanho da base de cada construção inicial, de construcoes.json: { celeiro: [5, 4], ... }
  };
  if (obj(bruto.construcoes)) for (const [id, c] of Object.entries(bruto.construcoes)) {
    if (obj(c) && Array.isArray(c.casas) && c.casas.length === 2 && c.casas[0] >= 1 && c.casas[1] >= 1) terras.casas[id] = [Math.round(c.casas[0]), Math.round(c.casas[1])];
  }
  const area = (a) => Array.isArray(a) && a.length === 4 && a.every(num) && a[2] > a[0] && a[3] > a[1];
  if (obj(bruto.terras)) {
    if (!(terras.largura >= 8 && terras.profundidade >= 8)) erro('terras.json', 'falta "mapa": { largura, profundidade } (8 ou mais casas)');
    else if (terras.largura * terras.profundidade > 65536) erro('terras.json', 'o mapa é grande demais (o limite é 65 536 casas)');
    if (terras.limpo && !area(terras.limpo)) { aviso('terras.json', '"inicial.limpo" ignorado: esperava [x0, z0, x1, z1]'); terras.limpo = null; }
    if (!area(terras.inicial)) erro('terras.json', 'falta "inicial": { area: [x0, z0, x1, z1] } (x1 e z1 ficam de fora)');
    else if (terras.inicial[0] < 0 || terras.inicial[1] < 0 || terras.inicial[2] > terras.largura || terras.inicial[3] > terras.profundidade) erro('terras.json', 'a área inicial sai do mapa');
    for (const l of terras.lotes) {
      if (!l.id) erro('terras.json', 'há um lote sem "id"');
      if (!area(l.area)) erro('terras.json', `lote "${l.id}": falta "area": [x0, z0, x1, z1]`);
    }
    for (const p of ['poco', 'banca', 'celeiro', 'casa', 'personagem']) {
      const v = terras.pontos[p];
      if (!(Array.isArray(v) && v.length >= 2 && num(v[0]) && num(v[1]))) erro('terras.json', `falta "pontos.${p}": [x, z]`);
      else if (area(terras.inicial) && (v[0] < terras.inicial[0] || v[1] < terras.inicial[1] || v[0] >= terras.inicial[2] || v[1] >= terras.inicial[3])) erro('terras.json', `"pontos.${p}" fica fora da área inicial`);
    }
    terras.caminhos = terras.caminhos.filter((c) => { if (area(c)) return true; aviso('terras.json', 'caminho ignorado: esperava [x0, z0, x1, z1]'); return false; });
    if (terras.campo) {
      const c = terras.campo, ini = terras.inicial;
      if (!area(c)) { aviso('terras.json', '"inicial.campo" ignorado: esperava [x0, z0, x1, z1]'); terras.campo = null; }
      else if (area(ini) && (c[0] < ini[0] || c[1] < ini[1] || c[2] > ini[2] || c[3] > ini[3])) { aviso('terras.json', '"inicial.campo" ignorado: o campo tem de caber na área inicial'); terras.campo = null; }
      else terras.campo = c.map(Math.round);
    }
  }

  // ---------- níveis ----------
  // limiar[n] = experiência total para chegar ao nível n (limiar[1] = 0)
  const niveis = { limiar: [0, 0], max: 1, recompensas: {} };
  if (tem('niveis')) {
    const xp = bruto.niveis.xp;
    let lista = null;
    if (Array.isArray(xp)) lista = xp[0] === 0 ? xp : [0, ...xp]; // aceita a lista começando no nível 1 (0) ou no nível 2
    else if (obj(xp)) { lista = [0]; for (let n = 2; xp[n] !== undefined; n++) lista.push(xp[n]); }
    if (!lista || lista.length < 2 || !lista.every(num)) erro('niveis.json', '"xp" tem de ser a lista da experiência total para chegar a cada nível');
    else {
      for (let k = 1; k < lista.length; k++) if (!(lista[k] > lista[k - 1])) { erro('niveis.json', `"xp" tem de crescer sempre (nível ${k + 1}: ${lista[k]} depois de ${lista[k - 1]})`); break; }
      niveis.limiar = [0, ...lista]; niveis.max = lista.length;
    }
    const rec = bruto.niveis.recompensas;
    if (obj(rec)) { for (const [n, r] of Object.entries(rec)) if (obj(r) && +n >= 1) niveis.recompensas[+n] = r; }
    else if (Array.isArray(rec)) rec.forEach((r, k) => { if (obj(r)) niveis.recompensas[num(r.nivel) ? r.nivel : k + 1] = r; });
    for (const [n, r] of Object.entries(niveis.recompensas)) for (const k of Object.keys(r.itens || {})) if (!itens[k]) aviso('niveis.json', `recompensa do nível ${n}: o item "${k}" não existe`);
  }

  // ---------- missões ----------
  const missoes = { vizinho: [], vizinhoNome: 'Seu Tonho', vizinhoId: 'vizinho' };
  if (tem('missoes')) {
    const v = bruto.missoes.vizinho;
    if (!Array.isArray(v)) aviso('missoes.json', 'falta a lista "vizinho" (as missões do Seu Tonho)');
    else for (const m of v) {
      if (!obj(m) || !m.id) { aviso('missoes.json', 'missão sem "id" ignorada'); continue; }
      if (!obj(m.objetivo) || !m.objetivo.evento) { aviso('missoes.json', `missão "${m.id}": falta "objetivo.evento" (ignorada)`); continue; }
      missoes.vizinho.push({ ...m, titulo: m.titulo || m.id, fala: m.fala || '', objetivo: { evento: m.objetivo.evento, filtro: obj(m.objetivo.filtro) ? m.objetivo.filtro : null, n: m.objetivo.n >= 1 ? m.objetivo.n : 1 }, recompensa: obj(m.recompensa) ? m.recompensa : {} });
      for (const k of Object.keys((obj(m.recompensa) && m.recompensa.itens) || {})) if (!itens[k]) aviso('missoes.json', `missão "${m.id}": o item "${k}" da recompensa não existe`);
      for (const k of Object.keys((obj(m.recompensa) && m.recompensa.animais) || {})) if (!obj(bruto.animais) || !obj(bruto.animais[k])) aviso('missoes.json', `missão "${m.id}": o animal "${k}" da recompensa não existe`);
      const pedido = obj(m.objetivo.filtro) ? m.objetivo.filtro.item : undefined;
      if (m.objetivo.evento === 'comprou' && typeof pedido === 'string' && itens[pedido] && (itens[pedido].tipo === 'ferramenta' || itens[pedido].tipo === 'recipiente') && !m.valeJaTer) aviso('missoes.json', `missão "${m.id}": pede comprar "${pedido}", que só se compra uma vez; sem "valeJaTer": true, quem já tem fica preso`);
    }
    missoes.vizinhoNome = (obj(bruto.missoes.quem) && bruto.missoes.quem.nome) || bruto.missoes.vizinhoNome || 'Seu Tonho';
    missoes.vizinhoId = (obj(bruto.missoes.quem) && bruto.missoes.quem.id) || 'vizinho'; // o retrato é a peça retrato/<id>
  }

  // ---------- loja de ouro ----------
  // vende tudo de itens.json que tem preço de compra; loja.json pode dar a ordem ou esconder itens (ouro.itens, ouro.fora)
  const L = obj(bruto.loja) ? bruto.loja : {};
  const lojaOuro = obj(L.ouro) ? L.ouro : {};
  const fora = new Set(Array.isArray(lojaOuro.fora) ? lojaOuro.fora : []);
  let ofertas = Object.values(itens).filter((it) => it.compra > 0 && !fora.has(it.id)).map((it) => it.id);
  if (Array.isArray(lojaOuro.itens)) {
    for (const id of lojaOuro.itens) if (!itens[id] || !(itens[id].compra > 0)) aviso('loja.json', `ouro.itens: "${id}" não existe ou não tem preço de compra`);
    const ordem = lojaOuro.itens.filter((id) => itens[id] && itens[id].compra > 0);
    ofertas = [...ordem, ...ofertas.filter((id) => !ordem.includes(id))];
  }
  // abas: as de loja.json que listam tipos de item; as que vêm de outro arquivo (animais, construções, terras) entram com as suas frentes
  const abas = [];
  if (Array.isArray(lojaOuro.abas)) for (const a of lojaOuro.abas) {
    if (!obj(a) || !a.id || !Array.isArray(a.tipos) || a.fonte) continue;
    abas.push({ id: a.id, nome: a.nome || a.id, tipos: a.tipos, soProximoDegrau: !!a.soProximoDegrau, itens: ofertas.filter((id) => a.tipos.includes(itens[id].tipo)) });
  }
  if (!abas.length) abas.push({ id: 'tudo', nome: 'Loja', tipos: TIPOS_DE_ITEM, soProximoDegrau: false, itens: ofertas });
  const loja = { ouro: ofertas, abas };

  const construcoes = prepararConstrucoes(bruto, itens, erro, aviso); // frente A: o que se constrói (dados-construcao.js)
  const dados = { regras, itens, culturas, culturaDaSemente, terras, niveis, missoes, loja, construcoes, bruto };
  Object.assign(dados, prepararTerras(bruto, itens, erro, aviso)); // frente E: obstaculos, arvores, arvoreDaMuda, desgaste (dados-terras.js)
  Object.assign(dados, prepararAnimais(bruto, itens, construcoes, erro, aviso)); // frente B: animais, trato, comidaDoAbrigo (dados-animais.js)
  return { dados, problemas };
}

// texto dos problemas, para o terminal e para a tela de erro
export function listarProblemas(problemas) {
  return problemas.map((p) => `${p.grave ? 'ERRO ' : 'aviso'} ${p.arquivo}: ${p.texto}`).join('\n');
}

// o que o nível n libera: tudo que tem "nivel": n nos dados (itens que se compram, culturas...)
export function liberaNoNivel(dados, n) {
  const out = [];
  for (const c of Object.values(dados.culturas)) if (c.nivel === n) out.push({ tipo: 'cultura', id: c.id, nome: c.nome, item: c.produto });
  for (const it of Object.values(dados.itens)) {
    if (it.nivel !== n || !(it.compra > 0)) continue;
    if (it.tipo === 'semente' && dados.culturaDaSemente[it.id] && dados.culturas[dados.culturaDaSemente[it.id]].nivel === n) continue; // já entrou como cultura
    out.push({ tipo: it.tipo, id: it.id, nome: it.nome, item: it.id });
  }
  for (const arq of ['arvores', 'animais', 'construcoes', 'receitas']) {
    const t = dados.bruto[arq];
    if (obj(t)) for (const [id, v] of Object.entries(t)) if (obj(v) && v.nivel === n) out.push({ tipo: arq, id, nome: v.nome || id, item: null });
  }
  return out;
}
