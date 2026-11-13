// Terras: limpar o terreno (mato, toco, pedra, árvore do mato) da beirada para dentro, comprar lote, plantar muda
// e colher fruta. O índice dos obstáculos e o alcance (de onde ela chega a pé) só se refazem quando alguma entidade
// entra ou sai do mapa (loc.versao) ou um lote é comprado: nada de varrer o mapa a cada decisão.
import { X, registro } from './jogo.mjs';
import { passo, emModo, nota, evitado, evitar, naFazenda, fazenda, filaTem, livre, nivel, comando, cmd } from './contexto.mjs';
import { zona, esvaziar, colheitaPrometida } from './lavoura.mjs';

const TIPOS = registro.TIPOS;
const frutaNaFila = (J, id) => { const p = J.p, s = (t) => t && t.tipo === 'agir' && t.acao === 'colherFruta' && t.entidade === id; return s(p.tarefa) || p.fila.some(s); };
const VIZ = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// ---------- índice dos obstáculos ----------
export function obstaculos(J) {
  const loc = fazenda(J), chave = loc.versao * 64 + J.m.terras.lotes.length;
  if (J.obstChave === chave) return J.obst;
  J.obstChave = chave;
  const n = loc.l * loc.p, A = J.alcance && J.alcance.length === n ? J.alcance : (J.alcance = new Uint8Array(n));
  A.fill(0);
  // de onde ela está (ou de onde nasce), por onde dá para andar
  const p = J.p, ini = p.local === 'fazenda' ? [Math.floor(p.x), Math.floor(p.z)] : J.D.terras.pontos.personagem.map(Math.floor);
  const pilha = [];
  if (loc.andavel(ini[0], ini[1])) { A[loc.i(ini[0], ini[1])] = 1; pilha.push(ini[0], ini[1]); }
  while (pilha.length) {
    const z = pilha.pop(), x = pilha.pop();
    for (const [dx, dz] of VIZ) { const nx = x + dx, nz = z + dz; if (loc.andavel(nx, nz) && !A[nz * loc.l + nx]) { A[nz * loc.l + nx] = 1; pilha.push(nx, nz); } }
  }
  J.obst = [];
  for (const e of loc.entidades) if (TIPOS[e.tipo] && TIPOS[e.tipo].obstaculo && loc.ehPropria(e.x, e.z)) J.obst.push(e);
  return J.obst;
}
// quantas casas ela alcança a pé de onde está (o alcance é refeito quando o mapa muda)
export function alcanceDela(J) {
  obstaculos(J);
  if (J.alcanceN !== undefined && J.alcanceChave === J.obstChave) return J.alcanceN;
  let n = 0;
  for (let i = 0; i < J.alcance.length; i++) n += J.alcance[i];
  J.alcanceChave = J.obstChave; J.alcanceN = n;
  return n;
}
// a árvore em (x, z) deixaria uma casa vizinha sem saída (beco de uma casa só)? (o jogo não confere: dá para se trancar)
function fazBeco(loc, x, z) {
  for (const [dx, dz] of VIZ) {
    const nx = x + dx, nz = z + dz;
    if (!loc.andavel(nx, nz)) continue;
    let saidas = 0;
    for (const [ex, ez] of VIZ) { const vx = nx + ex, vz = nz + ez; if ((vx !== x || vz !== z) && loc.andavel(vx, vz)) saidas++; }
    if (saidas <= 1) return true;
  }
  return false;
}
const alcanca = (J, loc, e) => VIZ.some(([dx, dz]) => loc.dentro(e.x + dx, e.z + dz) && J.alcance[(e.z + dz) * loc.l + e.x + dx] === 1);
const ferramentaDe = (J, funcao) => X.posses.ferramentaNoCinto(J.m, funcao) || X.posses.ferramentaNoSuporte(J.m, funcao);
// dá para limpar este tipo de obstáculo com o que ela tem?
export function limpavel(J, tipo) {
  const O = J.D.obstaculos[tipo];
  if (!O) return false;
  const f = ferramentaDe(J, O.ferramenta);
  return !!f && (J.I[f].forca > 0 ? J.I[f].forca : 1) >= O.forcaMinima;
}
// os materiais que saem de cada tipo: { madeira: ['toco', 'mata'], pedra: ['pedra'], fibra: ['mato'] }
export function fontesDe(J, item) { const out = []; for (const t in J.D.obstaculos) if (J.D.obstaculos[t].da && J.D.obstaculos[t].da[item] > 0) out.push(t); return out; }
// quantos obstáculos destes tipos ainda dá para limpar (alcançáveis ou não: o de dentro abre quando sai o da beirada)
export function quantosHa(J, tipos) { let n = 0; for (const e of obstaculos(J)) if (tipos.includes(e.tipo) && limpavel(J, e.tipo)) n++; return n; }

// Limpa um obstáculo dos tipos pedidos (null = qualquer um). opc.perto = [x, z]: o mais perto daquele ponto (abrir
// espaço ali); sem ele, o mais perto dela. opc.ids = só estes. Devolve o passo, ou null (com a nota do porquê).
export function limpar(J, tipos, opc = {}) {
  if (!X.limpeza || !naFazenda(J)) return null;
  const loc = fazenda(J), L = obstaculos(J), p = J.p, c = opc.perto || [p.x, p.z];
  let melhor = null, dm = Infinity, semFerramenta = null, fechado = 0;
  for (const e of L) {
    if (tipos && !tipos.includes(e.tipo)) continue;
    if (opc.ids && !opc.ids.has(e.id)) continue;
    if (!limpavel(J, e.tipo)) { semFerramenta = e.tipo; continue; }
    if (X.limpeza.limpezaPrometida(J.m, e.id) || evitado(J, 'obst:' + e.id)) continue;
    if (!alcanca(J, loc, e)) { fechado++; continue; }
    const d = Math.abs(e.x + 0.5 - c[0]) + Math.abs(e.z + 0.5 - c[1]);
    if (d < dm) { dm = d; melhor = e; }
  }
  if (melhor) { evitar(J, 'obst:' + melhor.id, 8); return passo(J, 'entidade', { id: melhor.id, chave: 'limpar' }); }
  if (opc.quieto) return null;
  if (semFerramenta) return nota(J, `falta a ferramenta para limpar ${J.D.obstaculos[semFerramenta].nome.toLowerCase()}`);
  if (fechado) return nota(J, 'o obstáculo que falta limpar está cercado (limpa-se da beirada para dentro)');
  return null;
}

// ---------- lotes ----------
export function lotePossivel(J) {
  if (!X.lotes) return null;
  const l = X.lotes.proximoLote(J.m);
  if (!l) return null;
  return { lote: l, s: X.lotes.situacaoDoLote(J.m, l) };
}
export function comprarLote(J, id) {
  if (!comando(J, 'comprarLote')) return null;
  const l = J.D.terras.lotes.find((x) => x.id === id);
  if (!l) return null;
  const s = X.lotes.situacaoDoLote(J.m, l);
  if (s.estado === 'comprado') return null;
  if (s.estado === 'nivel') return nota(J, `o lote ${l.nome || l.id} pede o nível ${l.nivel}`);
  if (s.estado === 'exige') return nota(J, `o lote ${l.nome || l.id} pede outro lote antes`);
  if (s.estado === 'ouro') return nota(J, `juntando ouro para o lote ${l.nome || l.id} (${l.preco})`);
  // a placa abre o painel; o botão compra (2 toques)
  return cmd(J, { tipo: 'comprarLote', lote: l.id }, 2, 'lote');
}

// ---------- pomar ----------
const arvoreDaMuda = (J, muda) => J.D.arvoreDaMuda && J.D.arvoreDaMuda[muda];
// onde vai a muda: na ponta mais longe da lavoura (o fim da lista da zona), na grama, com o espaçamento da árvore
function casaDoPomar(J, id) {
  obstaculos(J); // refaz o alcance se o mapa mudou
  const Z = zona(J), loc = fazenda(J), m = J.m;
  for (let k = Z.length - 1; k >= Math.floor(Z.length * 0.45); k--) {
    const i = Z[k], x = i % loc.l, z = (i - x) / loc.l;
    if (loc.chao[i] !== X.local.GRAMA || loc.ocupa[i] || loc.plantas[i] || filaTem(J, 'plantarMuda', x, z) || !alcanca(J, loc, { x, z }) || fazBeco(loc, x, z)) continue;
    if (X.arvores.podePlantarArvore(m, x, z, id).ok) return [x, z];
  }
  // a zona não tem lugar: qualquer grama própria fora dela, perto da casa
  const casa = J.D.terras.pontos.casa || J.D.terras.pontos.personagem;
  let melhor = null, dm = Infinity;
  for (let z = 0; z < loc.p; z++) for (let x = 0; x < loc.l; x++) {
    const i = z * loc.l + x;
    if (!loc.propria[i] || loc.ocupa[i] || loc.chao[i] !== X.local.GRAMA || J.zonaSet[i] || !alcanca(J, loc, { x, z }) || fazBeco(loc, x, z)) continue;
    const d = Math.abs(x - casa[0]) + Math.abs(z - casa[1]);
    if (d < dm && X.arvores.podePlantarArvore(m, x, z, id).ok) { dm = d; melhor = [x, z]; }
  }
  return melhor;
}
// planta uma muda que já está na bolsa (ou compra uma, se "comprar")
export function plantarMuda(J, muda, comprar) {
  if (!X.arvores || !naFazenda(J)) return null;
  const id = arvoreDaMuda(J, muda);
  if (!id) return null;
  if (X.arvores.mudasLivres(J.m, muda) <= 0) {
    if (!comprar) return null;
    const it = J.I[muda];
    if (it.nivel > nivel(J)) return nota(J, `a muda ${it.nome} pede o nível ${it.nivel}`);
    if (it.compra > J.P.ouro) return nota(J, `juntando ouro para a muda ${it.nome} (${it.compra})`);
    if (evitado(J, 'compra:' + muda)) return null;
    return passo(J, 'comprar', { item: muda, n: 1 });
  }
  if (evitado(J, 'pomar:' + muda)) return null;
  const c = casaDoPomar(J, id);
  if (!c) { evitar(J, 'pomar:' + muda, 60); return nota(J, 'não há grama livre para a muda'); }
  return emModo(J, 'semear', muda) || passo(J, 'casa', { x: c[0], z: c[1] });
}
// a árvore com fruta pronta mais perto (e cabe no cesto)
export function colherFruta(J) {
  if (!X.arvores || !naFazenda(J)) return null;
  const T = J.m.arvores.todas;
  if (!T.length) return null;
  if (J.m.agora < (J.proxFruta || 0)) return null;
  const p = J.p;
  let melhor = null, dm = Infinity, espera = Infinity;
  for (const e of T) {
    const s = X.arvores.safrasProntas(J.m, e);
    if (s <= 0) { const w = X.arvores.esperaDaFruta ? X.arvores.esperaDaFruta(J.m, e) : 60; if (w > 0 && w < espera) espera = w; continue; }
    if (frutaNaFila(J, e.id)) continue;
    const d = Math.abs(e.x - p.x) + Math.abs(e.z - p.z);
    if (d < dm) { dm = d; melhor = e; }
  }
  if (!melhor) { J.proxFruta = J.m.agora + Math.min(60, Math.max(1, espera)) * 1000; return null; }
  const n = X.arvores.safrasProntas(J.m, melhor) * J.D.arvores[melhor.arvore].rende;
  const naFila = colheitaPrometida(J);
  if (X.posses.espacoNoCesto(J.m) - naFila < n) return naFila ? null : esvaziar(J, true);
  return passo(J, 'entidade', { id: melhor.id });
}
// quantas árvores desta espécie ela tem (de pé ou prometidas na fila)
export function arvoresDe(J, id) {
  if (!X.arvores) return 0;
  let n = 0;
  for (const e of J.m.arvores.todas) if (e.arvore === id) n++;
  const muda = J.D.arvores[id] && J.D.arvores[id].muda;
  return n + (muda ? (J.P.bolsa[muda] || 0) : 0);
}
