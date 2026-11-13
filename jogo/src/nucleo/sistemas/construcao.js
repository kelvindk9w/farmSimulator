// Construir: pôr no terreno (ou dentro do celeiro) o que está em construcoes.json, com ouro e material, mudar de
// lugar de graça, guardar o que é enfeite ou móvel, e ampliar. Toda construção colocada é uma entidade do local:
//   { id, tipo: <id de construcoes.json>, local, x, z, l, p, nivel, obraAte, ampliaAte }
// (nivel 1 = como nasceu, +1 a cada ampliação; obraAte = instante em ms em que a obra acaba, 0 = pronta.)
// O material sai direto do que está guardado (bolsa, celeiro, cesto): o jogador não carrega nada.
// Cada id de construcoes.json ganha um tipo de entidade padrão; outra frente dá vida a um tipo com
// comportamento(id, { ... }) no arquivo dela (galinheiro, moinho, estábulo, aspersor...), em qualquer ordem de import.
// O contrato inteiro está em docs/jogo/ARQUITETURA.md, seção "Construções colocadas".
//
// Este arquivo não importa personagem.js de propósito: o sistema tem de carregar a gravação ANTES dela, para o
// lugar onde ela estava (dentro do celeiro ampliado, por exemplo) já existir quando a personagem for posta.
import { registrarSistema, registrarAcao, registrarTipo, registrarEvento, TIPOS } from '../registro.js';
import { Local, GRAMA, ARADA, CAMINHO } from '../local.js';
import { registrarConcluivel } from '../concluir.js';
import { gastarOuro, oQueFalta, gastarItens } from './posses.js';
import { darXp, MOSTRA_LIBERADO } from './niveis.js';

export const PISO = 4, SOLEIRA = 5; // tipos de chão do celeiro por dentro (local.js tem GRAMA, ARADA e CAMINHO)
const RAIO = 0.22; // folga do corpo da personagem (a mesma de caminho.js)

// ---------- o que cada tipo faz além do padrão ----------
// comportamento(id, {
//   acaoPossivel(m, e) → resposta | null     o que o toque faz na construção PRONTA (null = o padrão: abre o cartão dela)
//   visual(m, e, v)                          muda a peça da construção pronta (v.chave, v.quadro, v.variante...)
//   pontos: { ficar: (e) => [[dx, dz]] }     onde a personagem para para agir (padrão: encostada em qualquer lado)
//   altura, suporte                          vão para o tipo (altura da seta do tutorial; suporte de ferramentas)
//   aoPronta(m, e)                           a obra acabou (ou a construção voltou de uma gravação já pronta)
//   aoTirar(m, e)                            saiu do terreno (foi guardada)
//   aoMover(m, e, antes)                     mudou de lugar; antes = { x, z }
//   aoAmpliar(m, e, ampliacao)               a ampliação ficou pronta (e.nivel já subiu)
//   podeTirar(m, e) → { ok, motivo, dados }  recusa guardar (prateleira em uso, por exemplo)
// })
export const COMPORTAMENTOS = {};
const DO_TIPO = ['pontos', 'altura', 'suporte'];
export function comportamento(id, c) {
  const atual = COMPORTAMENTOS[id] = { ...(COMPORTAMENTOS[id] || {}), ...c };
  if (TIPOS[id] && TIPOS[id].construcao) for (const k of DO_TIPO) if (atual[k] !== undefined) TIPOS[id][k] = atual[k];
  return atual;
}
const gancho = (e, nome) => { const c = COMPORTAMENTOS[e.tipo]; return c && c[nome] ? c[nome] : null; };

// ---------- consultas ----------
export const defDe = (m, id) => m.dados.construcoes[id] || null;
export const estaPronta = (e) => !!e && !(e.obraAte > 0);
// todas as construções colocadas de um id (em qualquer local), prontas ou em obra
export function construcoesDe(m, id) { const out = []; for (const e of m.construcao.todas) if (e.tipo === id) out.push(e); return out; }
export const temPronta = (m, id) => m.construcao.todas.some((e) => e.tipo === id && estaPronta(e));
export const construcaoPorId = (m, id) => m.construcao.todas.find((e) => e.id === id) || null;
// segundos que faltam para a obra (ou a ampliação) acabar
export const faltaDaObra = (m, e) => Math.max(0, ((e.obraAte || e.ampliaAte || 0) - m.agora) / 1000);
// fração já feita da obra em curso (0..1), para a barra em cima dela
export function andamentoDaObra(m, e) {
  const ate = e.obraAte || e.ampliaAte || 0, dur = e.obraDur || 0;
  return ate > 0 && dur > 0 ? Math.max(0, Math.min(1, 1 - (ate - m.agora) / (dur * 1000))) : 1;
}
// o valor em vigor de um campo que as ampliações mudam (vagas, cocho, bebedouro, fila, piso)
export function valorDe(m, e, campo) {
  const def = defDe(m, e.tipo);
  let v = def ? def[campo] : undefined;
  if (def) for (let k = 0; k < (e.nivel || 1) - 1 && k < def.ampliacoes.length; k++) if (def.ampliacoes[k][campo] !== undefined) v = def.ampliacoes[k][campo];
  return v;
}
// a próxima ampliação da construção, ou null
export function proximaAmpliacao(m, e) { const def = defDe(m, e.tipo); return (def && def.ampliacoes[(e.nivel || 1) - 1]) || null; }
// enfeite, cerca e móvel voltam para o depósito; o resto só muda de lugar
export const guardavel = (def) => !!def && !def.inicial && (def.tipo === 'decoracao' || def.tipo === 'movel');
export const quantasGuardadas = (m, id) => m.construcao.guardadas[id] || 0;
const quantasTem = (m, id) => construcoesDe(m, id).length + quantasGuardadas(m, id);
// o que a personagem já foi mandada erguer e ainda não martelou: [{ id, x, z, local }] (o desenho mostra a planta no chão)
const ERGUE = { colocarConstrucao: 1, montarMovel: 1 };
export function planejadas(m, out = []) {
  const p = m.personagem;
  out.length = 0;
  if (!p) return out;
  if (p.tarefa && ERGUE[p.tarefa.acao] && !(p.acao && p.acao.feito)) out.push(p.tarefa.args);
  for (const t of p.fila) if (ERGUE[t.acao]) out.push(t.args);
  return out;
}

// ---------- o tipo de entidade padrão de uma construção ----------
const CHAVES = {}, CHAVES_OBRA = {};
function tipoPadrao(def) {
  const id = def.id, c = COMPORTAMENTOS[id] || {};
  return {
    tipo: id, casas: def.casas, bloqueia: def.bloqueia, construcao: true, plano: def.plano,
    pontos: c.pontos || null, altura: c.altura, suporte: !!c.suporte,
    // o toque: em obra ou sem nada a fazer, abre o cartão da construção (painel "construcao"); pronta, quem decide
    // primeiro é o comportamento registrado pela frente dona do tipo
    acaoPossivel(m, e) {
      if (e.obraAte > 0) return { painel: 'construcao', arg: { entidade: e.id }, texto: 'em-obra', dados: { construcao: e.tipo, seg: faltaDaObra(m, e) } };
      const f = gancho(e, 'acaoPossivel'), r = f ? f(m, e) : null;
      return r || { painel: 'construcao', arg: { entidade: e.id }, texto: 'ver-construcao', dados: { construcao: e.tipo } };
    },
    visual(m, e, v) {
      v.variante = e.v || 0;
      if (e.obraAte > 0) { v.chave = CHAVES_OBRA[e.tipo] || (CHAVES_OBRA[e.tipo] = 'objeto/' + e.tipo + '-obra'); return v; }
      v.chave = CHAVES[e.tipo] || (CHAVES[e.tipo] = 'objeto/' + e.tipo);
      const f = gancho(e, 'visual');
      if (f) f(m, e, v);
      return v;
    },
  };
}

// ---------- o celeiro por dentro: um local próprio, do tamanho do piso ----------
// piso de L por P casas, mais uma fileira na frente (z = P) só com a soleira da porta, de duas casas, no meio
function fazerInterior(piso) {
  const L = piso[0], P = piso[1], loc = new Local('celeiro', L, P + 1);
  for (let z = 0; z < P; z++) for (let x = 0; x < L; x++) { loc.propria[loc.i(x, z)] = 1; loc.chao[loc.i(x, z)] = PISO; }
  const px = Math.max(0, Math.floor(L / 2) - 1);
  for (let x = px; x < px + 2 && x < L; x++) { loc.propria[loc.i(x, P)] = 1; loc.chao[loc.i(x, P)] = SOLEIRA; }
  loc.interior = true;
  loc.piso = [L, P];
  loc.porta = [px, P]; // a soleira: casas (px, P) e (px + 1, P)
  loc.entrada = [px + 1, P - 0.5]; // onde a personagem aparece ao entrar: logo depois da soleira
  return loc;
}
// o piso que o celeiro tem no nível dado (construcoes.json: celeiro.interior.piso e o "piso" de cada ampliação)
function pisoDoNivel(m, nivel) {
  const def = defDe(m, 'celeiro');
  if (!def || !def.interior || !Array.isArray(def.interior.piso)) return null;
  let piso = def.interior.piso;
  for (let k = 0; k < nivel - 1 && k < def.ampliacoes.length; k++) if (Array.isArray(def.ampliacoes[k].piso)) piso = def.ampliacoes[k].piso;
  return piso;
}
// refaz o interior no tamanho que o nível do celeiro dá (os móveis ficam onde estavam)
function refazerInterior(m, nivel) {
  const cel = m.construcao.todas.find((e) => e.tipo === 'celeiro' && e.local === 'fazenda');
  const piso = pisoDoNivel(m, nivel || (cel && cel.nivel) || 1), velho = m.locais.celeiro;
  if (!piso || (velho && velho.piso[0] === piso[0] && velho.piso[1] === piso[1])) return;
  const novo = m.locais.celeiro = fazerInterior(piso);
  if (velho) {
    novo.versao = velho.versao + 1; // o desenho compara a versão para refazer as suas listas
    for (const e of [...velho.entidades]) { velho.tirar(e.id); novo.por(e); }
  }
  const p = m.personagem;
  if (p && p.local === 'celeiro') { p.x = novo.entrada[0]; p.z = novo.entrada[1]; p.rota = null; p.tarefa = null; p.acao = null; p.fila.length = 0; }
  m.eventos.emitir('chaoMudou', { tudo: true, local: 'celeiro' });
}

// ---------- o chão debaixo da construção ----------
// Terra arada (sem planta) volta a ser grama debaixo do que se constrói; calçamento e porteira deixam o chão
// batido ("chao": "caminho" na construção), e aí a enxada não ara. Tirou, o chão volta a ser o do mapa.
const sobrepoe = (a, x, z, l, p) => a.x < x + l && x < a.x + a.l && a.z < z + p && z < a.z + a.p;
const pisa = (def) => !!def && def.chao === 'caminho';
function assentar(m, e) {
  const loc = m.locais[e.local], def = defDe(m, e.tipo);
  for (let z = e.z; z < e.z + e.p; z++) for (let x = e.x; x < e.x + e.l; x++) {
    if (!loc.dentro(x, z)) continue;
    const i = loc.i(x, z), c = loc.chao[i];
    const novo = (c === GRAMA || c === ARADA) && !loc.plantas[i] ? (pisa(def) ? CAMINHO : GRAMA) : c;
    if (novo !== c) { loc.chao[i] = novo; m.eventos.emitir('chaoMudou', { local: loc.id, x, z }); }
  }
}
// a construção já saiu de (x0, z0): o chão batido que só ela cobria volta a ser o do mapa
function desassentar(m, e, x0, z0) {
  const loc = m.locais[e.local], base = m.construcao.chaoBase[e.local];
  if (!base || !pisa(defDe(m, e.tipo))) return;
  for (let z = z0; z < z0 + e.p; z++) for (let x = x0; x < x0 + e.l; x++) {
    if (!loc.dentro(x, z)) continue;
    const i = loc.i(x, z);
    if (loc.chao[i] !== CAMINHO || base[i] === CAMINHO) continue;
    if (m.construcao.todas.some((o) => o.local === e.local && pisa(defDe(m, o.tipo)) && sobrepoe(o, x, z, 1, 1))) continue;
    loc.chao[i] = GRAMA;
    m.eventos.emitir('chaoMudou', { local: loc.id, x, z });
  }
}

// ---------- o lugar serve? ----------
let visto0 = new Uint8Array(0), visto1 = new Uint8Array(0);
const pilha = [];
function reservar(loc) { const n = loc.l * loc.p; if (visto0.length < n) { visto0 = new Uint8Array(n); visto1 = new Uint8Array(n); } }
// marca em "visto" as casas livres alcançáveis a partir de (ax, az); "tapa" = área a tratar como ocupada;
// "solta" = entidade a tratar como se não estivesse lá (a que está sendo mudada de lugar)
function alagar(loc, ax, az, visto, tapa, solta) {
  visto.fill(0);
  const L = loc.l, livre = (x, z) => {
    if (x < 0 || z < 0 || x >= L || z >= loc.p) return false;
    const i = z * L + x;
    if (loc.propria[i] !== 1) return false;
    if (tapa && x >= tapa.x && z >= tapa.z && x < tapa.x + tapa.l && z < tapa.z + tapa.p) return false;
    return loc.ocupa[i] === 0 || (!!solta && loc.ocupa[i] === solta.num);
  };
  if (!livre(ax, az)) return false;
  pilha.length = 0; pilha.push(ax, az); visto[az * L + ax] = 1;
  while (pilha.length) {
    const z = pilha.pop(), x = pilha.pop();
    if (livre(x + 1, z) && !visto[z * L + x + 1]) { visto[z * L + x + 1] = 1; pilha.push(x + 1, z); }
    if (livre(x - 1, z) && !visto[z * L + x - 1]) { visto[z * L + x - 1] = 1; pilha.push(x - 1, z); }
    if (livre(x, z + 1) && !visto[(z + 1) * L + x]) { visto[(z + 1) * L + x] = 1; pilha.push(x, z + 1); }
    if (livre(x, z - 1) && !visto[(z - 1) * L + x]) { visto[(z - 1) * L + x] = 1; pilha.push(x, z - 1); }
  }
  return true;
}
// de onde se mede o alcance: a casa da personagem (se ela está neste local) ou a entrada dele; se essa casa
// cai dentro da área nova, a casa livre mais perto que fica de fora
function ancora(m, loc, tapa, out) {
  const p = m.personagem, aqui = p && p.local === loc.id;
  const cx = Math.floor(aqui ? p.x : loc.entrada[0]), cz = Math.floor(aqui ? p.z : loc.entrada[1]);
  for (let r = 0; r < Math.max(loc.l, loc.p); r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
    const x = cx + dx, z = cz + dz;
    if (!loc.andavel(x, z) || (tapa && x >= tapa.x && z >= tapa.z && x < tapa.x + tapa.l && z < tapa.z + tapa.p)) continue;
    out[0] = x; out[1] = z;
    return true;
  }
  return false;
}
// as casas de onde se alcança a entidade (ou a área): os pontos de "ficar" do tipo, ou o anel em volta
const acesso = [];
function casasDeAcesso(e) {
  acesso.length = 0;
  const t = TIPOS[e.tipo], ficar = t && t.pontos && t.pontos.ficar ? (typeof t.pontos.ficar === 'function' ? t.pontos.ficar(e) : t.pontos.ficar) : null;
  if (ficar) for (const [dx, dz] of ficar) acesso.push(Math.floor(e.x + dx), Math.floor(e.z + dz));
  else {
    for (let x = e.x; x < e.x + e.l; x++) acesso.push(x, e.z - 1, x, e.z + e.p);
    for (let z = e.z; z < e.z + e.p; z++) acesso.push(e.x - 1, z, e.x + e.l, z);
  }
  return acesso;
}
const tem = (loc, visto, lista) => { for (let k = 0; k < lista.length; k += 2) { const x = lista[k], z = lista[k + 1]; if (loc.dentro(x, z) && visto[z * loc.l + x]) return true; } return false; };
const anc = [0, 0], area = { x: 0, z: 0, l: 1, p: 1, tipo: '' };

// A área de (x, z) serve para a construção "tipo"? Não olha preço, nível nem limite: só o lugar.
//   opc.local   (padrão: o "onde" da construção)       opc.mudando = a entidade que está sendo mudada de lugar
// Motivos: fora-do-mapa, terra-a-venda, na-porta, lugar-ocupado { por }, tem-planta, fecha-caminho { construcao },
// sem-acesso (não daria para chegar até ela).
export function lugarServe(m, tipo, x, z, opc = {}) {
  const def = defDe(m, tipo);
  if (!def) return { ok: false, motivo: 'nao-existe', dados: { construcao: tipo } };
  const loc = m.locais[opc.local || def.onde], solta = opc.mudando || null, l = def.casas[0], p = def.casas[1];
  if (!loc) return { ok: false, motivo: 'nao-existe', dados: { construcao: tipo } };
  if (!Number.isInteger(x) || !Number.isInteger(z)) return { ok: false, motivo: 'fora-do-mapa' };
  for (let cz = z; cz < z + p; cz++) for (let cx = x; cx < x + l; cx++) {
    if (!loc.dentro(cx, cz)) return { ok: false, motivo: 'fora-do-mapa' };
    const i = loc.i(cx, cz);
    if (loc.chao[i] === SOLEIRA) return { ok: false, motivo: 'na-porta' };
    if (loc.propria[i] !== 1) return { ok: false, motivo: loc.interior ? 'fora-do-mapa' : 'terra-a-venda' };
    const oc = loc.ocupa[i];
    if (oc && !(solta && oc === solta.num)) return { ok: false, motivo: 'lugar-ocupado', dados: { por: loc.porNum[oc] ? loc.porNum[oc].tipo : '' } };
    if (loc.plantas[i]) return { ok: false, motivo: 'tem-planta' };
  }
  // o que não bloqueia (calçamento, porteira, bandeirinhas) não aparece em loc.ocupa: confere pela lista.
  // Calçamento só não fica debaixo de outro calçamento nem de coisa que bloqueia; a porteira pode ficar sobre ele.
  for (const o of m.construcao.todas) {
    if (o === solta || o.local !== loc.id || TIPOS[o.tipo].bloqueia || !sobrepoe(o, x, z, l, p)) continue;
    const od = defDe(m, o.tipo), plano = !!(od && od.plano);
    if (def.bloqueia || plano === def.plano) return { ok: false, motivo: 'lugar-ocupado', dados: { por: o.tipo } };
  }
  if (!def.bloqueia) return { ok: true };
  // nada do que se alcançava pode ficar isolado: nem um pedaço de terra, nem uma construção, nem a personagem
  reservar(loc);
  area.x = x; area.z = z; area.l = l; area.p = p; area.tipo = tipo;
  if (!ancora(m, loc, area, anc)) return { ok: false, motivo: 'fecha-caminho' };
  if (!alagar(loc, anc[0], anc[1], visto0, null, null)) return { ok: true }; // a âncora já estava isolada: não há o que comparar
  alagar(loc, anc[0], anc[1], visto1, area, solta);
  for (let cz = 0; cz < loc.p; cz++) for (let cx = 0; cx < loc.l; cx++) {
    const i = cz * loc.l + cx;
    if (visto0[i] && !visto1[i] && !(cx >= x && cz >= z && cx < x + l && cz < z + p)) return { ok: false, motivo: 'fecha-caminho' };
  }
  for (const o of m.construcao.todas) {
    if (o === solta || o.local !== loc.id || !TIPOS[o.tipo].bloqueia) continue;
    const c = casasDeAcesso(o);
    if (tem(loc, visto0, c) && !tem(loc, visto1, c)) return { ok: false, motivo: 'fecha-caminho', dados: { construcao: o.tipo } };
  }
  if (!tem(loc, visto1, casasDeAcesso(area))) return { ok: false, motivo: 'sem-acesso' };
  return { ok: true };
}

// O jogador pode pagar por "tipo" agora (sem olhar o lugar)? Motivos: nao-existe, nao-constroi (já vem na fazenda),
// nivel-baixo { nivel }, exige { construcao }, limite { limite }, so-com-cash { cash }, sem-ouro { falta },
// falta-material { item, precisa, tem, falta }. Com uma guardada do mesmo tipo, recolocar não custa nada.
export function podePagar(m, tipo) {
  const def = defDe(m, tipo);
  if (!def) return { ok: false, motivo: 'nao-existe', dados: { construcao: tipo } };
  if (quantasGuardadas(m, tipo) > 0) return { ok: true, dados: { guardada: true } };
  if (def.inicial || !def.custo) return { ok: false, motivo: 'nao-constroi', dados: { construcao: tipo } };
  if (def.nivel > m.progresso.nivel) return { ok: false, motivo: 'nivel-baixo', dados: { nivel: def.nivel, construcao: tipo } };
  for (const e of def.exige) if (!temPronta(m, e)) return { ok: false, motivo: 'exige', dados: { construcao: e, para: tipo } };
  if (def.limite > 0 && quantasTem(m, tipo) >= def.limite) return { ok: false, motivo: 'limite', dados: { limite: def.limite, construcao: tipo } };
  if (def.custo.cash > 0) return { ok: false, motivo: 'so-com-cash', dados: { cash: def.custo.cash, construcao: tipo } };
  if (m.posses.ouro < def.custo.ouro) return { ok: false, motivo: 'sem-ouro', dados: { falta: def.custo.ouro - m.posses.ouro, construcao: tipo } };
  const f = oQueFalta(m, def.custo.itens);
  if (f) return { ok: false, motivo: 'falta-material', dados: { ...f, construcao: tipo } };
  return { ok: true };
}
// tudo junto: preço, nível, limite e lugar
export function podeConstruir(m, tipo, x, z, opc = {}) {
  const def = defDe(m, tipo);
  if (!def) return { ok: false, motivo: 'nao-existe', dados: { construcao: tipo } };
  if (opc.local && opc.local !== def.onde) return { ok: false, motivo: def.onde === 'celeiro' ? 'so-no-celeiro' : 'so-na-fazenda', dados: { construcao: tipo } };
  const r = podePagar(m, tipo);
  return r.ok ? lugarServe(m, tipo, x, z, opc) : r;
}

// ---------- pôr, tirar, obra ----------
// se a personagem ficou dentro da área que passou a bloquear, vai para a casa livre mais perto; e o caminho que
// ela seguia é refeito (a construção nova pode estar no meio dele)
function desviarPersonagem(m, e) {
  const p = m.personagem;
  if (!p || p.local !== e.local || !TIPOS[e.tipo].bloqueia) return;
  if (p.rota && p.tarefa && !p.acao) { p.fila.unshift(p.tarefa); p.tarefa = null; p.rota = null; }
  if (p.x + RAIO <= e.x || p.x - RAIO >= e.x + e.l || p.z + RAIO <= e.z || p.z - RAIO >= e.z + e.p) return;
  const loc = m.locais[e.local];
  let melhor = Infinity, bx = null, bz = null;
  for (let z = e.z - 1; z <= e.z + e.p; z++) for (let x = e.x - 1; x <= e.x + e.l; x++) {
    if (!loc.andavel(x, z)) continue;
    const d = Math.hypot(x + 0.5 - p.x, z + 0.5 - p.z);
    if (d < melhor) { melhor = d; bx = x + 0.5; bz = z + 0.5; }
  }
  if (bx !== null) { p.x = bx; p.z = bz; }
}
function marcarProxima(m, ate) { const C = m.construcao; if (ate > 0 && ate < C.proxima) C.proxima = ate; }

// Põe a construção no local, sem conferir nem cobrar (quem confere é o comando). Para testes, presentes e gravação.
//   opc = { local, id, nivel, obraSeg (0 ou ausente = já pronta), quieto (pronta sem evento nem experiência) }
export function colocar(m, tipo, x, z, opc = {}) {
  const def = defDe(m, tipo), C = m.construcao;
  if (!def) throw new Error(`construção desconhecida: "${tipo}"`);
  const local = opc.local || def.onde, loc = m.locais[local];
  if (!loc) throw new Error(`a construção "${tipo}" pede o local "${local}", que não existe`);
  const e = loc.por({ id: opc.id || `${tipo}-${++C.seq}`, tipo, local, x, z, l: def.casas[0], p: def.casas[1], nivel: opc.nivel || 1, obraAte: 0, ampliaAte: 0, obraDur: 0 });
  C.todas.push(e);
  assentar(m, e);
  desviarPersonagem(m, e);
  if (opc.obraSeg > 0) {
    e.obraAte = m.agora + opc.obraSeg * 1000; e.obraDur = opc.obraSeg;
    marcarProxima(m, e.obraAte);
    m.eventos.emitir('comecouObra', { entidade: e.id, construcao: tipo, local, seg: opc.obraSeg, x: e.x, z: e.z });
  } else ficarPronta(m, e, !!opc.quieto);
  return e;
}
// construção que outro sistema pôs no local por conta própria (o quadro de pedidos, por exemplo) entra na lista
export function adotar(m, e, local = 'fazenda') {
  const C = m.construcao;
  if (C.todas.includes(e)) return e;
  e.local = local; e.nivel = e.nivel || 1; e.obraAte = e.obraAte || 0; e.ampliaAte = e.ampliaAte || 0; e.obraDur = e.obraDur || 0;
  C.todas.push(e);
  return e;
}
// uma construção de presente (loja de cash, prêmio): vai para o depósito e o jogador escolhe o lugar sem pagar
export function darConstrucao(m, id, n = 1) {
  if (!defDe(m, id) || !(n > 0)) return false;
  m.construcao.guardadas[id] = quantasGuardadas(m, id) + n;
  m.eventos.emitir('ganhouConstrucao', { construcao: id, n });
  return true;
}

function ficarPronta(m, e, quieto) {
  const def = defDe(m, e.tipo);
  e.obraAte = 0;
  if (!(e.ampliaAte > 0)) e.obraDur = 0;
  const f = gancho(e, 'aoPronta');
  if (f) f(m, e);
  if (quieto) return;
  if (def.xp > 0) darXp(m, def.xp, 'construir');
  const dados = { construcao: e.tipo, entidade: e.id, classe: def.tipo, onde: e.local, n: 1, x: e.x, z: e.z };
  // enfeite (cerca, calçamento, canteiro) não é obra: tem o seu próprio evento, para a conquista de carpinteiro
  // não se cumprir com cem trechos de cerca
  m.eventos.emitir(def.tipo === 'decoracao' ? 'enfeitou' : 'construiu', dados);
  if (def.tipo === 'movel') m.eventos.emitir('montou', dados);
}
function ampliacaoPronta(m, e) {
  const amp = proximaAmpliacao(m, e);
  e.ampliaAte = 0; e.obraDur = 0;
  if (!amp) return;
  e.nivel = (e.nivel || 1) + 1;
  const f = gancho(e, 'aoAmpliar');
  if (f) f(m, e, amp);
  if (e.tipo === 'celeiro') refazerInterior(m);
  if (amp.xp > 0) darXp(m, amp.xp, 'ampliar');
  m.eventos.emitir('ampliou', { construcao: e.tipo, entidade: e.id, degrau: e.nivel - 1, nome: amp.nome, n: 1 });
}
// o relógio passou do fim de alguma obra ou ampliação? (instantes absolutos: a ausência se resolve do mesmo jeito)
function conferirObras(m) {
  const C = m.construcao, T = C.todas;
  if (m.agora < C.proxima) return;
  for (let k = 0; k < T.length; k++) {
    const e = T[k];
    if (e.obraAte > 0 && e.obraAte <= m.agora) ficarPronta(m, e, false);
    if (e.ampliaAte > 0 && e.ampliaAte <= m.agora && !(e.obraAte > 0)) ampliacaoPronta(m, e);
  }
  C.proxima = Infinity;
  for (const e of T) { marcarProxima(m, e.obraAte); marcarProxima(m, e.ampliaAte); }
}

function tirarDoLocal(m, e) {
  const C = m.construcao, i = C.todas.indexOf(e);
  if (i >= 0) C.todas.splice(i, 1);
  m.locais[e.local].tirar(e.id);
  desassentar(m, e, e.x, e.z);
}

// cobra e ergue: usa uma guardada do mesmo tipo, se houver; senão, ouro e material
function erguer(m, def, x, z, local) {
  const C = m.construcao;
  let guardada = false;
  if (quantasGuardadas(m, def.id) > 0) { guardada = true; if (--C.guardadas[def.id] <= 0) delete C.guardadas[def.id]; }
  else { if (def.custo.ouro > 0) gastarOuro(m, def.custo.ouro, 'construcao'); gastarItens(m, def.custo.itens); }
  // o que volta do depósito já está montado: não tem obra de novo, nem conta como construção nova
  const e = colocar(m, def.id, x, z, { local, obraSeg: guardada ? 0 : def.obraSeg, quieto: guardada });
  if (guardada) m.eventos.emitir('recolocou', { entidade: e.id, construcao: e.tipo, local, x, z });
  return e;
}

// onde a personagem para para martelar: a casa livre encostada na área, a mais perto dela (e aonde ela chega
// andando), e a casa da obra que fica à sua frente. Devolve { sx, sz, fx, fz } ou null.
function pontoDeObra(m, loc, x, z, l, p) {
  const pe = m.personagem;
  reservar(loc);
  const chega = alagar(loc, Math.floor(pe.x), Math.floor(pe.z), visto0, null, null);
  let melhor = Infinity, r = null;
  const ve = (sx, sz, fx, fz) => {
    if (!loc.andavel(sx, sz) || (chega && !visto0[sz * loc.l + sx])) return;
    const d = Math.hypot(sx + 0.5 - pe.x, sz + 0.5 - pe.z);
    if (d < melhor) { melhor = d; r = { sx, sz, fx, fz }; }
  };
  for (let cx = x; cx < x + l; cx++) { ve(cx, z - 1, cx, z); ve(cx, z + p, cx, z + p - 1); }
  for (let cz = z; cz < z + p; cz++) { ve(x - 1, cz, x, cz); ve(x + l, cz, x + l - 1, cz); }
  return r;
}

const falha = (m, r, emite = true) => { if (emite) m.eventos.emitir('faltou', { motivo: r.motivo, dados: r.dados }); return { ok: false, motivo: r.motivo, dados: r.dados }; };

// ---------- as ações da personagem ----------
// martelar no lugar escolhido: é no efeito que o preço é cobrado e a obra nasce (cancelar antes não custa nada)
for (const id of ['colocarConstrucao', 'montarMovel']) {
  registrarAcao({
    id, dur: id === 'montarMovel' ? 2.5 : 2, efeitoEm: id === 'montarMovel' ? 1.9 : 1.5, estadoVisual: 'martelar',
    pode: (m, alvo, args) => podeConstruir(m, args.id, args.x, args.z, { local: args.local }),
    aoEfeito(m, alvo, args) { erguer(m, defDe(m, args.id), args.x, args.z, args.local); },
  });
}
// uma martelada de acabamento, sem efeito (a personagem dá um jeito no que acabou de ser posto)
registrarAcao({ id: 'martelar', dur: 0.7, efeitoEm: 0.4, estadoVisual: 'martelar', aoEfeito() {} });

// ---------- eventos que missões e conquistas escutam ----------
const um = (v, serve) => v === undefined || (Array.isArray(v) ? v.some(serve) : serve(v));
const constroi = (dados, id) => { const d = dados.construcoes[id]; return !!d && !d.inicial && !!d.custo; };
const prontas = (m, f, soMovel) => m.construcao.todas.filter((e) => {
  const d = defDe(m, e.tipo);
  return estaPronta(e) && !d.inicial && d.tipo !== 'decoracao' && (!soMovel || d.tipo === 'movel') && um(f.construcao, (id) => id === e.tipo) && um(f.onde, (l) => l === e.local) && um(f.classe, (c) => c === d.tipo);
}).length;
const CAMPOS = ['construcao', 'entidade', 'classe', 'onde', 'n'];
registrarEvento('construiu', {
  campos: CAMPOS,
  aceita: (dados, f) => um(f.construcao, (id) => constroi(dados, id) && dados.construcoes[id].tipo !== 'decoracao'),
  jaTem: (m, f, n) => prontas(m, f, false) >= n,
});
registrarEvento('montou', {
  campos: CAMPOS,
  aceita: (dados, f) => um(f.construcao, (id) => constroi(dados, id) && dados.construcoes[id].tipo === 'movel'),
  jaTem: (m, f, n) => prontas(m, f, true) >= n,
});
registrarEvento('enfeitou', { campos: CAMPOS, aceita: (dados, f) => um(f.construcao, (id) => constroi(dados, id) && dados.construcoes[id].tipo === 'decoracao') });
registrarEvento('ampliou', { campos: ['construcao', 'entidade', 'degrau', 'n'], aceita: (dados, f) => um(f.construcao, (id) => !!dados.construcoes[id] && dados.construcoes[id].ampliacoes.length > 0) });

// na tela de subida de nível aparece a construção que já dá para erguer com ouro
MOSTRA_LIBERADO.construcoes = (m, x) => { const d = defDe(m, x.id); return !!d && !d.inicial && !!d.custo && !(d.custo.cash > 0); };

// ---------- concluir a obra com cash (o comando, o preço e o botão são do sistema de cash) ----------
// alvo = o id da entidade (ou a própria entidade, ou { entidade: id })
const alvoDe = (m, alvo) => (typeof alvo === 'string' ? construcaoPorId(m, alvo) : alvo && alvo.tipo && alvo.id ? alvo : alvo && alvo.entidade ? construcaoPorId(m, alvo.entidade) : null);
registrarConcluivel({
  tipo: 'obra',
  falta(m, alvo) { const e = alvoDe(m, alvo); return e ? faltaDaObra(m, e) : 0; },
  terminar(m, alvo) {
    const e = alvoDe(m, alvo);
    if (!e) return false;
    if (e.obraAte > 0) e.obraAte = m.agora; else if (e.ampliaAte > 0) e.ampliaAte = m.agora; else return false;
    m.construcao.proxima = 0;
    conferirObras(m);
    return true;
  },
  nome(m, alvo) { const e = alvoDe(m, alvo), d = e && defDe(m, e.tipo); return d ? d.nome : ''; },
});

// ---------- gravação ----------
// a área está dentro do mapa, em terra própria e sem nada em cima? (só para repor o que veio de uma gravação)
function lugarLivre(m, def, x, z, local) {
  const loc = m.locais[local];
  if (!loc || !Number.isInteger(x) || !Number.isInteger(z)) return false;
  for (let cz = z; cz < z + def.casas[1]; cz++) for (let cx = x; cx < x + def.casas[0]; cx++) if (!loc.dentro(cx, cz) || loc.propria[loc.i(cx, cz)] !== 1 || loc.ocupa[loc.i(cx, cz)] !== 0) return false;
  return true;
}
// o lugar livre mais perto de (x, z) para a construção, ou null
function lugarPerto(m, def, x, z, local) {
  const loc = m.locais[local];
  for (let r = 0; r < Math.max(loc.l, loc.p); r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dz)) === r && lugarLivre(m, def, x + dx, z + dz, local)) return [x + dx, z + dz];
  }
  return null;
}

// ---------- o sistema ----------
registrarSistema({
  id: 'construcao',
  iniciar(m) {
    const D = m.dados.construcoes;
    m.construcao = { seq: 0, guardadas: {}, todas: [], proxima: Infinity, chaoBase: {} };
    for (const def of Object.values(D)) {
      const t = TIPOS[def.id];
      if (!t) registrarTipo(tipoPadrao(def));
      else if (t.construcao) { t.casas = def.casas; t.bloqueia = def.bloqueia; t.plano = def.plano; } // outro mundo, outros dados (testes)
    }
    m.construcao.chaoBase.fazenda = Uint8Array.from(m.locais.fazenda.chao); // o chão do mapa, antes de qualquer calçamento
    // as construções que já vêm na fazenda (casa, celeiro, poço, banca) entram na lista como estão
    for (const e of m.locais.fazenda.entidades) if (D[e.tipo]) adotar(m, e, 'fazenda');
    // o celeiro por dentro, com os móveis do começo
    const cel = D.celeiro;
    if (cel && cel.interior && Array.isArray(cel.interior.piso)) {
      m.locais.celeiro = fazerInterior(cel.interior.piso);
      for (const mv of cel.interior.moveis || []) if (D[mv.id]) colocar(m, mv.id, mv.x, mv.z, { local: 'celeiro', quieto: true });
    }
  },
  passo: conferirObras,
  ausencia: conferirObras,

  comandos: {
    // construir { id, x, z, local, jaJa }: (x, z) é o canto de menor X e Z da base; local = onde a personagem está.
    // Enfeite sem obra e o que volta do depósito nascem na hora; o resto, a personagem vai até lá e martela (o preço
    // sai na martelada: cancelar antes não custa nada). jaJa: true ergue na hora, sem ela (ferramentas e testes).
    // Devolve dados.entidade (nasceu na hora) ou dados.naFila.
    construir(m, c) {
      const def = defDe(m, c.id), p = m.personagem;
      if (!def) return falha(m, { motivo: 'nao-existe', dados: { construcao: c.id } }, false);
      const local = c.local || (c.jaJa ? def.onde : p.local), q = !c.quieto;
      const r = podeConstruir(m, c.id, c.x, c.z, { local });
      if (!r.ok) return falha(m, r, q);
      for (const a of planejadas(m)) {
        const ad = defDe(m, a.id);
        if (a.local !== local || !(a.x < c.x + def.casas[0] && c.x < a.x + ad.casas[0] && a.z < c.z + def.casas[1] && c.z < a.z + ad.casas[1])) continue;
        return a.id === c.id && a.x === c.x && a.z === c.z ? { ok: true, repetida: true, dados: { naFila: true } } : falha(m, { motivo: 'lugar-ocupado', dados: { por: a.id } }, q);
      }
      const naHora = c.jaJa || p.local !== local || quantasGuardadas(m, c.id) > 0 || (def.tipo === 'decoracao' && !(def.obraSeg > 0));
      if (naHora) return { ok: true, dados: { entidade: erguer(m, def, c.x, c.z, local).id } };
      if (p.fila.length + 2 > m.dados.regras.filaMax) return falha(m, { motivo: 'fila-cheia' }, q);
      const onde = pontoDeObra(m, m.locais[local], c.x, c.z, def.casas[0], def.casas[1]);
      if (!onde) return falha(m, { motivo: 'sem-acesso' }, q);
      p.rumando = false;
      p.fila.push({ tipo: 'andar', x: onde.sx + 0.5, z: onde.sz + 0.5 }, { tipo: 'agir', acao: def.tipo === 'movel' ? 'montarMovel' : 'colocarConstrucao', x: onde.fx, z: onde.fz, args: { id: c.id, x: c.x, z: c.z, local } });
      return { ok: true, dados: { naFila: true } };
    },

    // moverConstrucao { entidade, x, z }: de graça, a qualquer hora (regra 8 do plano), em obra ou pronta
    moverConstrucao(m, c) {
      const e = construcaoPorId(m, c.entidade);
      if (!e) return falha(m, { motivo: 'nao-existe' }, false);
      if (e.x === c.x && e.z === c.z) return { ok: true, dados: { entidade: e.id } };
      const r = lugarServe(m, e.tipo, c.x, c.z, { local: e.local, mudando: e });
      if (!r.ok) return falha(m, r, !c.quieto);
      const loc = m.locais[e.local], antes = { x: e.x, z: e.z };
      loc.tirar(e.id); e.x = c.x; e.z = c.z; loc.por(e);
      desassentar(m, e, antes.x, antes.z);
      assentar(m, e);
      desviarPersonagem(m, e);
      const f = gancho(e, 'aoMover');
      if (f) f(m, e, antes);
      m.eventos.emitir('moveuConstrucao', { entidade: e.id, construcao: e.tipo, local: e.local, x: e.x, z: e.z, antes });
      return { ok: true, dados: { entidade: e.id } };
    },

    // guardarConstrucao { entidade }: enfeite, cerca e móvel voltam para o depósito e se recolocam sem pagar de novo
    guardarConstrucao(m, c) {
      const e = construcaoPorId(m, c.entidade), def = e && defDe(m, e.tipo), q = !c.quieto;
      if (!e) return falha(m, { motivo: 'nao-existe' }, false);
      if (!guardavel(def)) return falha(m, { motivo: 'nao-guarda', dados: { construcao: e.tipo } }, q);
      if (e.obraAte > 0) return falha(m, { motivo: 'em-obra', dados: { construcao: e.tipo, seg: faltaDaObra(m, e) } }, q);
      const pode = gancho(e, 'podeTirar'), r = pode ? pode(m, e) : null;
      if (r && !r.ok) return falha(m, r, q);
      const f = gancho(e, 'aoTirar');
      tirarDoLocal(m, e);
      if (f) f(m, e);
      m.construcao.guardadas[e.tipo] = quantasGuardadas(m, e.tipo) + 1;
      m.eventos.emitir('guardouConstrucao', { entidade: e.id, construcao: e.tipo, local: e.local, x: e.x, z: e.z });
      return { ok: true, dados: { construcao: e.tipo, guardadas: m.construcao.guardadas[e.tipo] } };
    },

    // ampliar { entidade, cash }: a próxima ampliação da lista. cash: true paga com cash a que tem os dois preços (vaga de fila)
    ampliar(m, c) {
      const e = construcaoPorId(m, c.entidade);
      if (!e) return falha(m, { motivo: 'nao-existe' }, false);
      const amp = proximaAmpliacao(m, e), q = !c.quieto;
      if (!amp) return falha(m, { motivo: 'sem-ampliacao', dados: { construcao: e.tipo } }, q);
      if (e.obraAte > 0 || e.ampliaAte > 0) return falha(m, { motivo: 'em-obra', dados: { construcao: e.tipo, seg: faltaDaObra(m, e) } }, q);
      if (amp.nivel > m.progresso.nivel) return falha(m, { motivo: 'nivel-baixo', dados: { nivel: amp.nivel, construcao: e.tipo } }, q);
      if (c.cash && amp.cash > 0) {
        if (m.posses.cash < amp.cash) return falha(m, { motivo: 'sem-cash', dados: { falta: amp.cash - m.posses.cash } }, q);
        m.posses.cash -= amp.cash;
        m.eventos.emitir('gastouCash', { n: amp.cash, destino: 'ampliacao' });
      } else {
        if (m.posses.ouro < amp.custo.ouro) return falha(m, { motivo: 'sem-ouro', dados: { falta: amp.custo.ouro - m.posses.ouro } }, q);
        const f = oQueFalta(m, amp.custo.itens);
        if (f) return falha(m, { motivo: 'falta-material', dados: { ...f, construcao: e.tipo } }, q);
        if (amp.custo.ouro > 0) gastarOuro(m, amp.custo.ouro, 'ampliacao');
        gastarItens(m, amp.custo.itens);
      }
      if (amp.obraSeg > 0) {
        e.ampliaAte = m.agora + amp.obraSeg * 1000; e.obraDur = amp.obraSeg;
        marcarProxima(m, e.ampliaAte);
        m.eventos.emitir('comecouObra', { entidade: e.id, construcao: e.tipo, local: e.local, seg: amp.obraSeg, ampliacao: amp.nome, x: e.x, z: e.z });
      } else ampliacaoPronta(m, e);
      return { ok: true, dados: { entidade: e.id, seg: amp.obraSeg } };
    },
  },

  salvar(m) {
    const C = m.construcao;
    return {
      seq: C.seq, guardadas: { ...C.guardadas },
      lista: C.todas.map((e) => ({ id: e.id, tipo: e.tipo, local: e.local, x: e.x, z: e.z, nivel: e.nivel || 1, obraAte: Math.round(e.obraAte || 0), ampliaAte: Math.round(e.ampliaAte || 0), obraDur: e.obraDur || 0 })),
    };
  },
  // Uma gravação do M1 não traz este sistema: aí vale o que iniciar() montou (o celeiro com os móveis do começo).
  // Com a gravação, tudo sai do lugar e volta para onde ela diz; o que não couber mais (o mapa ou os dados mudaram)
  // vai para o depósito, e o que já vem na fazenda (casa, celeiro...) fica no lugar livre mais perto. Nada se perde.
  carregar(m, d) {
    const C = m.construcao, D = m.dados.construcoes;
    const lista = Array.isArray(d.lista) ? d.lista.filter((g) => g && typeof g.id === 'string' && D[g.tipo] && m.locais[g.local]) : [];
    C.guardadas = {};
    for (const k in d.guardadas || {}) if (D[k] && d.guardadas[k] > 0) C.guardadas[k] = Math.round(d.guardadas[k]);
    const antes = new Map(C.todas.map((e) => [e.id, e])), eram = new Map(C.todas.map((e) => [e.id, [e.x, e.z]]));
    for (const e of [...C.todas]) tirarDoLocal(m, e);
    const cel = lista.find((g) => g.tipo === 'celeiro' && g.local === 'fazenda');
    refazerInterior(m, Math.max(1, Math.min(D.celeiro ? D.celeiro.ampliacoes.length + 1 : 1, (cel && Math.round(cel.nivel)) || 1)));
    const repor = (g, x, z) => {
      const def = D[g.tipo], e = antes.get(g.id) || { id: g.id, tipo: g.tipo };
      e.local = g.local; e.x = x; e.z = z; e.l = def.casas[0]; e.p = def.casas[1];
      e.nivel = Math.max(1, Math.min(def.ampliacoes.length + 1, Math.round(g.nivel) || 1));
      e.obraAte = g.obraAte > 0 ? g.obraAte : 0; e.ampliaAte = g.ampliaAte > 0 && e.nivel <= def.ampliacoes.length ? g.ampliaAte : 0; e.obraDur = g.obraDur > 0 ? g.obraDur : 0;
      m.locais[g.local].por(e);
      C.todas.push(e);
      assentar(m, e);
    };
    const sobrou = [], postas = new Set();
    for (const g of lista) {
      if (postas.has(g.id)) continue;
      postas.add(g.id);
      if (lugarLivre(m, D[g.tipo], g.x, g.z, g.local)) repor(g, g.x, g.z); else sobrou.push(g);
    }
    for (const g of sobrou) {
      const def = D[g.tipo], pt = def.inicial && g.local === 'fazenda' ? lugarPerto(m, def, g.x, g.z, g.local) : null;
      if (pt) repor(g, pt[0], pt[1]); else if (!def.inicial) C.guardadas[g.tipo] = quantasGuardadas(m, g.tipo) + 1;
    }
    // o que já vem na fazenda e a gravação não trouxe (gravação de antes de a construção existir) volta para o seu lugar
    for (const [id, e] of antes) {
      if (postas.has(id) || !D[e.tipo].inicial) continue;
      const pt = lugarPerto(m, D[e.tipo], eram.get(id)[0], eram.get(id)[1], e.local);
      if (pt) repor({ id, tipo: e.tipo, local: e.local, nivel: 1 }, pt[0], pt[1]);
    }
    C.seq = Math.max(Math.round(d.seq) || 0, ...C.todas.map((e) => +(/-(\d+)$/.exec(e.id) || [0, 0])[1]));
    C.proxima = 0; // a primeira conferência resolve as obras que acabaram enquanto o jogo estava fechado
    for (const e of C.todas) if (estaPronta(e)) { const f = gancho(e, 'aoPronta'); if (f) f(m, e); }
  },
});
