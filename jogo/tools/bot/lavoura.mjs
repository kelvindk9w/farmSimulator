// Lavoura: colher, regar, vender ou guardar o cesto, arar e semear, escolher a semente pela sessão, melhorar e
// consertar as ferramentas. A lavoura fica do lado oeste do poço (o lado do ponto "lavoura" de terras.json); se os
// dados demarcarem um campo de plantação (frente do campo), ele vem primeiro. O resto do terreno é para as obras.
import { X, precisa, registro } from './jogo.mjs';
import { passo, emModo, nota, evitado, evitar, naFazenda, fazenda, tem, filaTem, contarNaFila, livre, nivel, presenca, comando } from './contexto.mjs';
import { obstaculos } from './terras.mjs';

export const LIGADA = precisa('lavoura', {
  lavoura: ['estadoDaPlanta', 'proximoAcontecimento', 'regaPrometida'],
  personagem: ['filaTem', 'contarNaFila', 'ocupada'],
  posses: ['noCesto', 'espacoNoCesto', 'noCeleiro', 'espacoNoCeleiro', 'ferramentaNoCinto', 'ferramentaGuardada', 'quantoTem'],
  local: ['GRAMA', 'ARADA', 'CAMINHO'],
});
const L = X.lavoura, PO = X.posses, LO = X.local;
const GRAMA = LO.GRAMA, ARADA = LO.ARADA, CAMINHO = LO.CAMINHO, CAMPO = LO.CAMPO; // CAMPO: só depois da frente do campo
const TIPOS = registro.TIPOS;

// ---------- a zona da lavoura ----------
// o retângulo do campo de plantação, se os dados tiverem um (frente do campo): [x0, z0, x1, z1)
export function campoDemarcado(D) {
  const T = D.terras || {};
  return Array.isArray(T.campo) && T.campo.length === 4 && T.campo.every((v) => typeof v === 'number') ? T.campo : null;
}
const dentro = (r, x, z) => x >= r[0] && z >= r[1] && x < r[2] && z < r[3];
// As casas que a lavoura usa, das mais perto do ponto da lavoura para as mais longe (o campo demarcado primeiro).
// Refeita quando entra ou sai alguma entidade do mapa (obstáculo limpo, obra, árvore) ou quando um lote é comprado.
export function zona(J) {
  const loc = fazenda(J), chave = loc.versao * 64 + J.m.terras.lotes.length;
  if (J.zonaChave === chave) return J.zona;
  J.zonaChave = chave;
  const T = J.D.terras, poco = T.pontos.poco || T.pontos.lavoura, lv = T.pontos.lavoura || poco, campo = campoDemarcado(J.D);
  const pares = [], set = J.zonaSet || (J.zonaSet = new Uint8Array(loc.l * loc.p));
  set.fill(0);
  let obst = 0;
  for (let z = 0; z < loc.p; z++) for (let x = 0; x < loc.l; x++) {
    const i = z * loc.l + x;
    if (loc.propria[i] !== 1 || loc.chao[i] === CAMINHO) continue;
    const noCampo = !!campo && dentro(campo, x, z);
    if (!noCampo && !(x < poco[0])) continue;
    const e = loc.ocupa[i] ? loc.porNum[loc.ocupa[i]] : null;
    if (e && !(TIPOS && TIPOS[e.tipo] && TIPOS[e.tipo].obstaculo)) continue; // obra, árvore: não é lavoura
    if (e) obst++;
    set[i] = 1;
    pares.push([noCampo ? 0 : 1, Math.hypot(x - lv[0], z - lv[1]), i]);
  }
  pares.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  J.zona = pares.map((q) => q[2]);
  J.zonaObst = obst;
  return J.zona;
}
const podeArarFn = X.lavoura && typeof X.lavoura.podeArar === 'function' ? X.lavoura.podeArar : null;
function aravel(J, loc, i, x, z) {
  if (loc.ocupa[i] || loc.plantas[i]) return false;
  if (podeArarFn) { try { return !!podeArarFn(J.m, x, z, loc); } catch { /* reserva: o teste antigo */ } }
  return loc.chao[i] === GRAMA || (CAMPO !== undefined && loc.chao[i] === CAMPO);
}

// quantas casas a lavoura quer ter aradas ou plantadas agora. Jogando, o campo é o que ela dá conta de cuidar; nos
// últimos minutos da sessão, a terra toda: o que ela plantar agora cresce com o jogo fechado e é colhido na volta
export const FIM_DA_SESSAO = 4 * 60000;
const campoBase = (J) => Math.min(zona(J).length, 6 + 2 * (nivel(J) - 1) + J.campoExtra, 1000);
export function campoAlvo(J) {
  const Z = zona(J), base = campoBase(J);
  if (J.fimSessao && J.fimSessao - J.m.agora < FIM_DA_SESSAO) return Math.max(base, Math.min(Z.length - (J.zonaObst || 0), 400));
  return base;
}

// ---------- sementes ----------
const culturaDe = (J, s) => J.D.culturas[J.D.culturaDaSemente[s]];
export function sementesLiberadas(J) {
  const out = [];
  for (const id of J.D.loja.ouro) { const it = J.I[id]; if (it && it.tipo === 'semente' && J.D.culturaDaSemente[id] && it.nivel <= nivel(J) && culturaDe(J, id).nivel <= nivel(J)) out.push(it); }
  return out;
}
const livresNaBolsa = (J, s) => (J.P.bolsa[s] || 0) - contarNaFila(J, 'semear', (t) => t.args && t.args.semente === s);
// quanto tempo (s) a casa fica ocupada se a semente for plantada agora: rega na hora e a cada vez que secar com ela
// jogando; com o jogo fechado, a planta espera a volta (a agenda das sessões do perfil)
function ocupacao(J, c) {
  const tr = (c.tempoSeg * 1000) / c.regas;
  let t = J.m.agora;
  for (let k = 0; k < c.regas; k++) t = presenca(J, t + tr);
  return (t - J.m.agora) / 1000;
}
// nota de uma semente: o que rende (ouro na banca menos a semente, mais a experiência) por segundo de trabalho dela,
// pesando o tempo que a casa fica presa (pesa mais quando a lavoura não tem mais para onde crescer)
function notaDaSemente(J, it, apertado) {
  const c = culturaDe(J, it.id), valor = c.rende * J.I[c.produto].venda - it.compra + c.xp;
  const trabalho = 7 + 1.5 * c.regas;
  // com terra sobrando, o que limita é o trabalho dela: a casa presa quase não pesa (a cultura longa rende mais por toque)
  return apertado ? valor / (trabalho + 0.1 * ocupacao(J, c)) : valor / trabalho;
}
// quanto de cada produto de cultura já vem (plantado ou prometido na fila)
function vindo(J) {
  const loc = fazenda(J), out = {};
  for (const i of loc.plantadas) { const c = J.D.culturas[loc.plantas[i].cultura]; out[c.produto] = (out[c.produto] || 0) + c.rende; }
  const p = J.p, conta = (t) => { if (t && t.tipo === 'agir' && t.acao === 'semear' && t.args) { const c = culturaDe(J, t.args.semente); if (c) out[c.produto] = (out[c.produto] || 0) + c.rende; } };
  conta(p.tarefa); for (const t of p.fila) conta(t);
  return out;
}
// a semente da vez: a que a missão pede; senão a cultura que falta para pedido, trato ou receita; senão a que rende mais
export function escolherSemente(J, so) {
  let lista = sementesLiberadas(J);
  if (so) lista = lista.filter(so);
  if (!lista.length) return null;
  if (J.metaSemente && lista.some((it) => it.id === J.metaSemente)) return J.I[J.metaSemente];
  const v = vindo(J);
  let falta = null, maior = 0;
  // o que pedido, trato, obra e missão pedem (a receita "por conta" das indústrias não escolhe a semente)
  const Q = J.querBase || J.quer;
  for (const it of lista) {
    const c = culturaDe(J, it.id), q = Q[c.produto] || 0;
    if (!q) continue;
    const f = (q - tem(J, c.produto) - (v[c.produto] || 0)) * J.I[c.produto].venda;
    if (f > maior) { maior = f; falta = it; }
  }
  if (falta) { if (J.S) J.S.porqueSemente['falta ' + falta.id] = (J.S.porqueSemente['falta ' + falta.id] || 0) + 1; return falta; }
  const apertado = zona(J).length - J.zonaObst <= campoBase(J) + 2;
  let melhor = null, n = -Infinity;
  for (const it of lista) { const x = notaDaSemente(J, it, apertado); if (x > n) { n = x; melhor = it; } }
  if (J.S && melhor) { const k = (apertado ? 'apertado ' : 'rende ') + melhor.id; J.S.porqueSemente[k] = (J.S.porqueSemente[k] || 0) + 1; }
  return melhor;
}

// ---------- colher, regar ----------
function plantaPerto(J, estado) {
  const loc = fazenda(J), p = J.p, m = J.m;
  let melhor = Infinity, achou = null;
  for (const i of loc.plantadas) {
    const pl = loc.plantas[i];
    if (L.estadoDaPlanta(m, pl) !== estado) continue;
    const x = i % loc.l, z = (i - x) / loc.l;
    if (estado === 'pronta' ? filaTem(J, 'colher', x, z) : L.regaPrometida(m, x, z)) continue;
    const d = Math.abs(x + 0.5 - p.x) + Math.abs(z + 0.5 - p.z);
    if (d < melhor) { melhor = d; achou = [x, z, pl]; }
  }
  return achou;
}
export function colher(J) {
  if (!LIGADA || !naFazenda(J)) return null;
  const c = plantaPerto(J, 'pronta');
  if (!c) return null;
  const rende = J.D.culturas[c[2].cultura].rende, naFila = colheitaPrometida(J);
  if (PO.espacoNoCesto(J.m) - naFila < rende) return naFila ? null : esvaziar(J, true);
  return emModo(J, 'mao') || passo(J, 'casa', { x: c[0], z: c[1] });
}
// o que as colheitas (da lavoura e do pomar) já na fila vão pôr no cesto
export function colheitaPrometida(J) {
  const loc = fazenda(J), p = J.p;
  let n = 0;
  const conta = (t) => {
    if (!t || t.tipo !== 'agir') return;
    if (t.acao === 'colher') { const pl = loc.plantas[t.z * loc.l + t.x]; n += pl ? J.D.culturas[pl.cultura].rende : 1; }
    else if (t.acao === 'colherFruta' && X.arvores) { const e = loc.porId[t.entidade]; n += e && J.D.arvores[e.arvore] ? Math.max(1, X.arvores.safrasProntas(J.m, e)) * J.D.arvores[e.arvore].rende : 1; }
  };
  conta(p.tarefa); for (const t of p.fila) conta(t);
  return n;
}
function semAgua(J) {
  const r = PO.ferramentaNoCinto(J.m, 'regador') || PO.ferramentaGuardada(J.m, 'regador');
  return !!r && J.P.ferramentas[r].agua - contarNaFila(J, 'regar') <= 0;
}
export function regar(J) {
  if (!LIGADA || !naFazenda(J)) return null;
  const c = plantaPerto(J, 'sede');
  if (!c) return null;
  if (semAgua(J)) return filaTem(J, 'encher') ? null : passo(J, 'entidade', { id: 'poco' });
  if (J.m.modo.id !== 'mao' && J.m.modo.id !== 'regar') return emModo(J, 'mao');
  return passo(J, 'casa', { x: c[0], z: c[1] });
}
// segundos até a próxima planta mudar (secar ou amadurecer), ou null
export function esperaDaLavoura(J) { const t = L.proximoAcontecimento(J.m); return t === null ? null : Math.max(0.5, (t - J.m.agora) / 1000); }

// ---------- esvaziar o cesto: guardar o que se quer ter, vender o resto ----------
// onde guardar: o celeiro pronto; antes dele (o começo humilde), o baú ao lado da casa
export function armazem(J) {
  const loc = fazenda(J), C = X.construcao, c = loc.porId.celeiro;
  if (c && (!C || C.estaPronta(c))) return 'celeiro';
  return loc.porId['bau-da-casa'] ? 'bau-da-casa' : 'celeiro';
}
// a banca ainda é o caixote de venda (começo humilde) e está cheio: os fregueses ainda não levaram
function caixoteCheio(J) {
  const e = fazenda(J).porId.banca, d = e && J.D.construcoes[e.tipo];
  return !!(d && d.vagas > 0 && X.banca && X.banca.espacoNoCaixote(J.m, d) <= 0);
}
export function cestoTemQuerido(J) {
  const c = J.P.cesto.itens;
  for (const k in c) if (c[k] > 0 && (J.quer[k] || 0) > (J.P.celeiro.itens[k] || 0) + (J.P.bolsa[k] || 0)) return true;
  return false;
}
// quanto do cesto não serve a nada guardado (pedido, trato, receita, missão)
function sobraNoCesto(J) {
  const c = J.P.cesto.itens;
  let n = 0;
  for (const k in c) n += Math.max(0, c[k] - Math.max(0, (J.quer[k] || 0) - (J.P.celeiro.itens[k] || 0) - (J.P.bolsa[k] || 0)));
  return n;
}
// forcar = o cesto está cheio (ou a missão pede); senão só esvazia se não estiver colhendo
export function esvaziar(J, forcar) {
  if (!LIGADA || !naFazenda(J)) return null;
  const m = J.m, n = PO.noCesto(m);
  if (n <= 0) { J.vendaDoCeleiro = false; return null; }
  if (!forcar && contarNaFila(J, 'colher') > 0) return null;
  if (filaTem(J, 'vender') || filaTem(J, 'guardar')) return null;
  // o cocho na fila vai comer do cesto (ou do celeiro): vender agora o deixaria sem comida
  const cocho = contarNaFila(J, 'abastecerCocho') > 0;
  if (cocho && PO.espacoNoCesto(m) > 0) return null;
  let guardar = J.metaCesto === 'guardar' || (cocho && PO.espacoNoCeleiro(m) > 0) || (J.metaCesto !== 'vender' && !J.vendaDoCeleiro && cestoTemQuerido(J));
  // carga misturada (o que se quer e o que sobra): guarda tudo só se o celeiro tem folga; senão vende tudo
  // (a banca e o celeiro levam o cesto inteiro: não dá para escolher item)
  // o que a missão pede (os 12 ovos da dúzia) vai para o celeiro mesmo com carga misturada, se couber tudo
  const daMissao = Object.keys(J.reservados || {}).some((k) => (J.P.cesto.itens[k] || 0) > 0);
  if (guardar && J.metaCesto !== 'guardar' && !cocho && !(daMissao && PO.espacoNoCeleiro(m) >= n)) { const sobra = sobraNoCesto(J); if (sobra > 0 && PO.espacoNoCeleiro(m) < sobra + 0.25 * J.P.celeiro.capacidade) guardar = false; }
  if (guardar && !(PO.espacoNoCeleiro(m) > 0)) { guardar = false; nota(J, 'celeiro cheio: vendeu o que queria guardar'); J.S && (J.S.celeiroCheio = (J.S.celeiroCheio || 0) + 1); }
  // o caixote cheio: guarda (se cabe) ou espera os fregueses levarem
  if (!guardar && caixoteCheio(J)) {
    if (J.metaCesto !== 'vender' && PO.espacoNoCeleiro(m) > 0) guardar = true;
    else { J.S && (J.S.caixoteCheio = (J.S.caixoteCheio || 0) + 1); return nota(J, 'o caixote está cheio: esperando os fregueses'); }
  }
  return passo(J, 'entidade', { id: guardar ? armazem(J) : 'banca' });
}
// o celeiro tem coisa a mais (o que não serve a pedido, trato, receita nem missão) e está enchendo: pega para vender
export function venderDoCeleiro(J, forcar) {
  if (!LIGADA || !naFazenda(J) || PO.noCesto(J.m) > 0 || J.metaCesto === 'guardar' || contarNaFila(J, 'abastecerCocho') > 0) return null;
  const C = J.P.celeiro.itens;
  let sobra = 0;
  for (const k in C) if (J.I[k] && J.I[k].venda > 0) sobra += Math.max(0, C[k] - (J.quer[k] || 0));
  const espaco = PO.espacoNoCeleiro(J.m);
  const cap = J.P.celeiro.capacidade;
  // o que a missão guarda (a banca levaria junto): só com o celeiro cheio
  const daMissao = Object.keys(J.reservados || {}).some((k) => (C[k] || 0) > 0);
  if (daMissao && forcar !== 'cheio') return null;
  if (forcar === 'cheio') { if (espaco > 0.1 * cap || sobra < Math.min(20, 0.1 * cap)) return null; }
  else if (sobra <= 0 || (!forcar && espaco > 0.25 * cap && sobra < 0.3 * cap)) return null;
  if (evitado(J, 'pegar') || caixoteCheio(J)) return null;
  evitar(J, 'pegar', 20);
  J.vendaDoCeleiro = true; // o que vier no cesto vai para a banca
  return passo(J, 'entidade', { id: armazem(J) });
}

// ---------- o boi no arado: a fileira inteira de uma passada ----------
// Com o boi pronto (o do Seu Tonho chega no nível 4, com o arado simples), ela ara com ele em vez da enxada sempre que
// a passada que sai da casa tem pelo menos 3 casas e cabe toda na lavoura (a fileira do boi pega o lado com mais casas
// e poderia sair da zona da lavoura, para a terra das obras). Uma passada de cada vez na fila: o boi é um só.
const TB = X.trabalho;
const BOI = !!(TB && typeof TB.podeArarComBoi === 'function' && typeof TB.fileiraDoBoi === 'function');
const PASSADA_MINIMA = 3;
// as casas (índices) que as passadas do boi na fila vão arar
function casasDoBoiNaFila(J, loc) {
  const p = J.p, out = new Set();
  const conta = (t) => { if (t && t.tipo === 'agir' && t.acao === 'ararComBoi' && t.args && t.args.casas) for (const c of t.args.casas) out.add(c[1] * loc.l + c[0]); };
  conta(p.tarefa); for (const t of p.fila) conta(t);
  return out;
}
function passadaDoBoi(J, loc, x, z) {
  if (!BOI || !TB.podeArarComBoi(J.m) || contarNaFila(J, 'ararComBoi') > 0) return null;
  const f = TB.fileiraDoBoi(J.m, x, z);
  if (!f || f.aArar.length < PASSADA_MINIMA) return null;
  for (const c of f.aArar) if (!J.zonaSet[c[1] * loc.l + c[0]]) return null;
  return f;
}

// ---------- arar e semear ----------
// opc: { semente (a missão pede esta), arar (arar mesmo sem semente: missão "preparar a terra"), tudo (fim da sessão) }
export function plantar(J, opc = {}) {
  if (!LIGADA || !naFazenda(J)) return null;
  const m = J.m, loc = fazenda(J), Z = zona(J), p = J.p;
  obstaculos(J); // o alcance a pé: a casa cercada de mato (lote novo) fica para depois de limpar
  const A = J.alcance, doBoi = BOI ? casasDoBoiNaFila(J, loc) : null;
  let vazia = null, dv = Infinity, vazias = 0, aradas = 0, araveis = 0, arar = null;
  for (const i of Z) {
    if (A && !A[i]) continue;
    const x = i % loc.l, z = (i - x) / loc.l;
    if (loc.chao[i] === ARADA) {
      aradas++;
      if (!loc.plantas[i] && !filaTem(J, 'semear', x, z)) { vazias++; const d = Math.abs(x + 0.5 - p.x) + Math.abs(z + 0.5 - p.z); if (d < dv) { dv = d; vazia = [x, z]; } }
    } else if (aravel(J, loc, i, x, z)) { araveis++; if (!arar && !filaTem(J, 'arar', x, z) && !(doBoi && doBoi.has(i))) arar = [x, z]; }
  }
  J.aradas = aradas;
  if (arar) J.campoSemEspaco = false;
  const so = opc.semente ? (it) => it.id === opc.semente : null;
  if (vazia) {
    const naBolsa = sementesLiberadas(J).filter((it) => livresNaBolsa(J, it.id) > 0 && (!so || so(it)));
    let s = escolherSemente(J, (it) => naBolsa.includes(it) || (it.compra <= J.P.ouro && (!so || so(it))));
    if (s && livresNaBolsa(J, s.id) > 0) return emModo(J, 'semear', s.id) || passo(J, 'casa', { x: vazia[0], z: vazia[1] });
    if (s && comando(J, 'comprar') && !evitado(J, 'compra:' + s.id)) {
      const quer = vazias + Math.max(0, campoAlvo(J) - aradas - contarNaFila(J, 'arar'));
      const n = Math.max(1, Math.min(quer, Math.floor(J.P.ouro / s.compra)));
      return passo(J, 'comprar', { item: s.id, n });
    }
    if (naBolsa.length) { s = naBolsa[0]; return emModo(J, 'semear', s.id) || passo(J, 'casa', { x: vazia[0], z: vazia[1] }); }
    return venderDoCeleiro(J, true) || nota(J, 'sem semente e sem ouro para comprar (espera o socorro do vizinho)');
  }
  const alvo = opc.arar ? Infinity : campoAlvo(J);
  if (aradas + contarNaFila(J, 'arar') + (doBoi ? doBoi.size : 0) >= alvo) return null;
  const temSemente = sementesLiberadas(J).some((it) => livresNaBolsa(J, it.id) > 0 || it.compra <= J.P.ouro);
  if (!temSemente && !opc.arar) return nota(J, 'sem semente e sem ouro para plantar mais');
  if (!arar) { J.campoSemEspaco = araveis === 0; return J.zonaObst > 0 ? nota(J, 'a lavoura não tem casa livre para arar (falta limpar o mato em volta)') : nota(J, 'a lavoura não tem mais para onde crescer'); }
  if (passadaDoBoi(J, loc, arar[0], arar[1])) { if (J.S) J.S.passadasDoBoi = (J.S.passadasDoBoi || 0) + 1; return emModo(J, 'arado') || passo(J, 'casa', { x: arar[0], z: arar[1] }); }
  return emModo(J, 'enxada') || passo(J, 'casa', { x: arar[0], z: arar[1] });
}

// ---------- ferramentas: comprar o degrau seguinte e consertar ----------
const ORDEM = { regador: 1, cesto: 2, enxada: 3, cinto: 4, foice: 6, picareta: 7, machado: 8, plantadeira: 9 };
function serve(J, it) {
  const f = it.funcao;
  if (ORDEM[f]) return true;
  const A = J.m.animais ? J.m.animais.lista : [];
  const temBicho = (prod) => A.some((a) => { const d = J.D.animais[a.especie]; return d && d.ferramenta === f && (!prod || d.produto === prod); });
  if (f === 'caixa-de-ovos' || f === 'balde' || f === 'tesoura') return temBicho();
  return false; // barril, carroça, sela, arado: só com o bicho de trabalho (trabalho.mjs)
}
export function ferramentas(J) {
  if (!LIGADA || !X.loja || !comando(J, 'comprar') || J.m.agora < (J.proxFerramenta || 0)) return null;
  J.proxFerramenta = J.m.agora + 15000;
  const ofertas = X.loja.ofertasDaLoja(J.m).flatMap((a) => a.ofertas).filter((o) => o.unico && o.liberado && !o.tem && J.I[o.item] && serve(J, J.I[o.item]) && !evitado(J, 'compra:' + o.item));
  ofertas.sort((a, b) => (ORDEM[J.I[a.item].funcao] || 5) - (ORDEM[J.I[b.item].funcao] || 5) || a.preco - b.preco);
  for (const o of ofertas) if (livre(J) - o.preco >= 40 + 4 * nivel(J)) { J.proxFerramenta = 0; return passo(J, 'comprar', { item: o.item, n: 1 }); }
  return null;
}
export function consertar(J) {
  if (!X.desgaste || !comando(J, 'consertar') || J.m.agora < (J.proxConserto || 0)) return null;
  J.proxConserto = J.m.agora + 20000;
  for (const g of X.desgaste.itensGastando(J.m)) if (g.gasta && g.preco > 0 && g.preco <= J.P.ouro - 10 && !evitado(J, 'conserto:' + g.item)) return passo(J, 'cmd', { cmd: { tipo: 'consertar', item: g.item }, n: 2, chave: 'conserto:' + g.item });
  return null;
}
