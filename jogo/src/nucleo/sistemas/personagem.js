// A personagem: anda por caminho (A*) com aceleração e freio, corre enquanto há fôlego, e cumpre uma fila de tarefas
// (andar até, agir numa casa ou numa entidade). Se a ação pede uma ferramenta que não está no cinto, ela mesma
// enfileira a ida ao suporte do celeiro: um toque faz a cadeia toda.
// Aqui ficam também o modo escolhido na barra (mão, enxada...) e os comandos de toque e de teclado.
import { PASSO, limitar, girarPara, rumoPara } from '../util.js';
import { registrarSistema, registrarModo, ACOES, TIPOS, MODOS, AUTOMATICOS, modosEmOrdem } from '../registro.js';
import { acharCaminho, comprimento, cabe } from '../caminho.js';
import { ferramentaNoCinto, ferramentaNoSuporte, usarFerramenta, noCesto } from './posses.js';
import { darXp } from './niveis.js';
import { rapidezDe } from './desgaste.js';

const ACEL = 13, FREIO = 15; // unidades/s²
const GIRO = 14; // rad/s
const VOLTA_A_CORRER = 0.25; // depois de cansar, só corre de novo com esta fração do fôlego
const PARADA_ABAIXO_DE = 0.35; // unidades/s: abaixo disto a figura é a parada (nunca um passo congelado)
const PASSADA = { andar: 1.5, correr: 2.3 }; // unidades de chão por ciclo do desenho (dois passos)

// Pontos de extensão (a montaria e o barril do jumento moram em sistemas/trabalho.js):
//   DESLOCAMENTO.velocidade(m, p) → unidades/s (> 0 = ela se desloca nesta velocidade SEM correr: não gasta fôlego)
//   DESLOCAMENTO.visual(m, out)   → ajusta a figura dela (montada, por exemplo), depois de visualDaPersonagem
//   PREPAROS.push((m, p, tarefa) → { acao, entidade | x, z } | null): um passo a fazer ANTES da tarefa (uma vez por tarefa)
export const DESLOCAMENTO = { velocidade: null, visual: null };
export const PREPAROS = [];

// ---------- fila ----------
const mesma = (a, b) => a && b && a.tipo === 'agir' && b.tipo === 'agir' && a.acao === b.acao && a.x === b.x && a.z === b.z && a.entidade === b.entidade;
// há na fila (ou em andamento) a ação "acao" para a casa (x, z)? Sem casa, qualquer uma serve.
export function filaTem(m, acao, x, z) {
  const p = m.personagem, serve = (t) => t && t.tipo === 'agir' && t.acao === acao && (x === undefined || (t.x === x && t.z === z));
  if (serve(p.tarefa)) return true;
  for (let i = 0; i < p.fila.length; i++) if (serve(p.fila[i])) return true;
  return false;
}
// quantas tarefas "acao" na fila passam no filtro (para descontar sementes já prometidas, por exemplo)
export function contarNaFila(m, acao, filtro) {
  const p = m.personagem;
  let n = 0;
  const serve = (t) => t && t.tipo === 'agir' && t.acao === acao && (!filtro || filtro(t));
  if (serve(p.tarefa) && !(p.acao && p.acao.feito)) n++;
  for (const t of p.fila) if (serve(t)) n++;
  return n;
}
export const ocupada = (m) => { const p = m.personagem; return !!(p.acao || p.rota || p.fila.length || p.rumando); };

function enfileirar(m, t) {
  const p = m.personagem;
  if (mesma(p.tarefa, t) || p.fila.some((q) => mesma(q, t))) return { ok: true, repetida: true };
  if (p.fila.length >= m.dados.regras.filaMax) return { ok: false, motivo: 'fila-cheia' };
  p.fila.push(t);
  p.rumando = false;
  return { ok: true };
}

function falhar(m, p, t, r) {
  m.eventos.emitir('faltou', { motivo: r.motivo || 'nao-da', dados: r.dados, acao: t.acao, x: t.x, z: t.z, entidade: t.entidade });
  if (r.limpar) for (let i = p.fila.length - 1; i >= 0; i--) if (p.fila[i].acao === t.acao) p.fila.splice(i, 1); // as outras iguais falhariam do mesmo jeito
}

// ---------- onde parar para agir ----------
const LADOS = [[0.74, 0], [-0.74, 0], [0, 0.74], [0, -0.74]];
const cand = [];
// devolve { rota } (rota = null quando já está no lugar) ou null se não dá para chegar
function pontoDeParada(m, p, t) {
  const loc = m.locais[p.local];
  cand.length = 0;
  if (t.entidade !== undefined) {
    const e = loc.porId[t.entidade], tipo = TIPOS[e.tipo];
    const ficar = tipo.pontos && tipo.pontos.ficar ? (typeof tipo.pontos.ficar === 'function' ? tipo.pontos.ficar(e) : tipo.pontos.ficar) : null;
    if (ficar) for (const [dx, dz] of ficar) cand.push([e.x + dx, e.z + dz]);
    else {
      for (let x = e.x; x < e.x + e.l; x++) cand.push([x + 0.5, e.z - 0.5], [x + 0.5, e.z + e.p + 0.5]);
      for (let z = e.z; z < e.z + e.p; z++) cand.push([e.x - 0.5, z + 0.5], [e.x + e.l + 0.5, z + 0.5]);
    }
    for (const c of cand) if (Math.hypot(c[0] - p.x, c[1] - p.z) < 0.3) return { rota: null };
  } else {
    const cx = t.x + 0.5, cz = t.z + 0.5;
    if (Math.hypot(cx - p.x, cz - p.z) <= m.dados.regras.alcance) return { rota: null };
    for (const [dx, dz] of LADOS) cand.push([cx + dx, cz + dz]);
    cand.push([cx, cz]);
  }
  cand.sort((a, b) => Math.hypot(a[0] - p.x, a[1] - p.z) - Math.hypot(b[0] - p.x, b[1] - p.z));
  for (const c of cand) {
    if (!cabe(loc, c[0], c[1])) continue;
    const rota = acharCaminho(loc, p.x, p.z, c[0], c[1]);
    if (rota) return { rota };
  }
  return null;
}
function centroDoAlvo(m, p, t, out) {
  if (t.entidade !== undefined) { const e = m.locais[p.local].porId[t.entidade]; out[0] = e.x + e.l / 2; out[1] = e.z + e.p / 2; } else { out[0] = t.x + 0.5; out[1] = t.z + 0.5; }
  return out;
}
const centro = [0, 0];

// ---------- tarefas ----------
function comecarAcao(m, p, t) {
  const a = ACOES[t.acao], r = a.pode(m, t, t.args);
  p.rota = null; p.vel = 0; p.correndo = false;
  if (!r.ok) { falhar(m, p, t, r); p.tarefa = null; return; }
  // a ferramenta da ação e a ajudante (se estiver no cinto) mudam a duração: "rapidez" 0.75 = um quarto mais rápida
  let dur = m.dados.regras.acoes[a.id] || a.dur;
  if (a.duracao) dur = a.duracao(m, t, t.args, dur); // a ação que muda com o tamanho (a passada do boi: por casa)
  const fer = a.ferramenta && ferramentaNoCinto(m, a.ferramenta), aju = a.ajudante && ferramentaNoCinto(m, a.ajudante);
  if (fer) dur *= rapidezDe(m, fer); // a ferramenta gasta trabalha mais devagar (sistemas/desgaste.js)
  if (aju) dur *= rapidezDe(m, aju);
  const efeito = (a.efeitoEm === null ? 0.6 : a.efeitoEm / a.dur) * dur;
  centroDoAlvo(m, p, t, centro);
  if (Math.hypot(centro[0] - p.x, centro[1] - p.z) > 0.05) p.rumo = rumoPara(p.x, p.z, centro[0], centro[1]);
  p.acao = { id: a.id, t: 0, dur, efeito, feito: false };
  m.eventos.emitir('comecouAcao', { acao: a.id, x: t.x, z: t.z, entidade: t.entidade, dur });
}

function iniciarTarefa(m, p, t) {
  const loc = m.locais[p.local];
  if (t.tipo === 'andar') {
    const rota = acharCaminho(loc, p.x, p.z, t.x, t.z);
    if (!rota) { falhar(m, p, t, { motivo: 'sem-caminho' }); return; }
    p.tarefa = t; p.rota = rota; p.rotaI = 0;
    p.correndo = false; p.rotaLonga = comprimento(p.x, p.z, rota) > m.dados.regras.correrAcimaDe;
    return;
  }
  const a = ACOES[t.acao];
  if (!a) { falhar(m, p, t, { motivo: 'acao-desconhecida', dados: { acao: t.acao } }); return; }
  if (t.entidade !== undefined && !loc.porId[t.entidade]) return; // a entidade sumiu
  if (!t.preparada) for (let i = 0; i < PREPAROS.length; i++) {
    const antes = PREPAROS[i](m, p, t);
    if (antes) { t.preparada = true; p.fila.unshift({ tipo: 'agir', args: null, auto: true, ...antes }, t); return; }
  }
  const r = a.pode(m, t, t.args);
  if (!r.ok) { falhar(m, p, t, r); return; }
  if (a.ferramenta && !ferramentaNoCinto(m, a.ferramenta)) {
    // a ferramenta está no suporte: vai buscar antes (custa tempo, não toques)
    const suporte = ferramentaNoSuporte(m, a.ferramenta) && loc.entidades.find((e) => TIPOS[e.tipo].suporte);
    if (!suporte) { falhar(m, p, t, { motivo: 'sem-ferramenta', dados: { funcao: a.ferramenta }, limpar: true }); return; }
    p.fila.unshift({ tipo: 'agir', acao: 'pegarFerramenta', entidade: suporte.id, args: { funcao: a.ferramenta }, auto: true }, t);
    return;
  }
  const onde = pontoDeParada(m, p, t);
  if (!onde) { falhar(m, p, t, { motivo: 'sem-caminho' }); return; }
  p.tarefa = t;
  if (!onde.rota) comecarAcao(m, p, t);
  else { p.rota = onde.rota; p.rotaI = 0; p.correndo = false; p.rotaLonga = comprimento(p.x, p.z, onde.rota) > m.dados.regras.correrAcimaDe; }
}

function avancarAcao(m, p) {
  const ac = p.acao, a = ACOES[ac.id], t = p.tarefa;
  ac.t += PASSO;
  if (!ac.feito && ac.t >= ac.efeito) {
    const r = a.pode(m, t, t.args);
    if (!r.ok) { falhar(m, p, t, r); p.acao = null; p.tarefa = null; return; }
    if (a.ferramenta) usarFerramenta(m, ferramentaNoCinto(m, a.ferramenta));
    if (a.ajudante && ferramentaNoCinto(m, a.ajudante)) usarFerramenta(m, ferramentaNoCinto(m, a.ajudante));
    ac.feito = true;
    a.aoEfeito(m, t, t.args);
    const xp = m.dados.regras.xp[a.id];
    if (xp > 0) darXp(m, xp, a.id);
  }
  if (ac.t >= ac.dur) {
    p.acao = null; p.tarefa = null;
    m.eventos.emitir('terminouAcao', { acao: a.id, x: t.x, z: t.z, entidade: t.entidade });
  }
}

// ---------- movimento ----------
function podeCorrer(p) { return !p.cansada && p.folego > 0; }

// segue a rota; devolve true enquanto anda
function seguirRota(m, p) {
  const R = m.dados.regras, rota = p.rota;
  const resto = comprimento(p.x, p.z, rota, p.rotaI);
  const outra = DESLOCAMENTO.velocidade ? DESLOCAMENTO.velocidade(m, p) : 0; // a cavalo: outra velocidade, sem fôlego
  p.correndo = !outra && (p.rotaLonga || p.querCorrer) && podeCorrer(p) && (p.correndo || resto > 1.5);
  const vmax = outra || (p.correndo ? R.correr : R.andar);
  const vAlvo = Math.min(vmax, Math.max(0.5, Math.sqrt(2 * FREIO * 0.8 * resto)));
  p.vel += limitar(vAlvo - p.vel, -FREIO * PASSO, ACEL * PASSO);
  let anda = p.vel * PASSO;
  p.fase += anda / (p.correndo ? PASSADA.correr : PASSADA.andar);
  p.conta.distancia += anda;
  while (anda > 0) {
    const alvo = rota[p.rotaI], dx = alvo[0] - p.x, dz = alvo[1] - p.z, d = Math.hypot(dx, dz);
    if (d > 0.02) p.rumo = girarPara(p.rumo, Math.atan2(dx, dz), GIRO * PASSO);
    if (d <= anda) {
      p.x = alvo[0]; p.z = alvo[1]; anda -= d; p.rotaI++;
      if (p.rotaI >= rota.length) {
        p.rota = null; p.vel = 0; p.correndo = false;
        const t = p.tarefa;
        if (t && t.tipo === 'agir') comecarAcao(m, p, t); else p.tarefa = null;
        return true;
      }
    } else { p.x += (dx / d) * anda; p.z += (dz / d) * anda; anda = 0; }
  }
  return true;
}

// teclado, controle e alavanca: anda na direção pedida, deslizando no que esbarrar; devolve true se saiu do lugar
function andarDireto(m, p) {
  const R = m.dados.regras, loc = m.locais[p.local];
  const outra = DESLOCAMENTO.velocidade ? DESLOCAMENTO.velocidade(m, p) : 0;
  p.correndo = !outra && p.querCorrer && podeCorrer(p);
  const vmax = (outra || (p.correndo ? R.correr : R.andar)) * p.forca;
  p.vel += limitar(vmax - p.vel, -FREIO * PASSO, ACEL * PASSO);
  const anda = p.vel * PASSO, nx = p.x + p.dx * anda, nz = p.z + p.dz * anda;
  p.rumo = girarPara(p.rumo, Math.atan2(p.dx, p.dz), GIRO * PASSO);
  let andou = 0;
  if (cabe(loc, nx, nz)) { p.x = nx; p.z = nz; andou = anda; }
  else if (p.dx !== 0 && cabe(loc, nx, p.z)) { p.x = nx; andou = Math.abs(p.dx) * anda; }
  else if (p.dz !== 0 && cabe(loc, p.x, nz)) { p.z = nz; andou = Math.abs(p.dz) * anda; }
  else p.vel = Math.min(p.vel, 0.6);
  p.fase += andou / (p.correndo ? PASSADA.correr : PASSADA.andar);
  p.conta.distancia += andou;
  return andou > 0.0005;
}

// larga o que estava fazendo (a ação em curso só é desfeita se o efeito ainda não aconteceu)
function largar(p) {
  p.fila.length = 0;
  if (p.acao) { p.acao = null; p.tarefa = null; } else if (p.tarefa) { p.tarefa = null; p.rota = null; }
}

// a casa ou entidade em que a tecla de ação agiria: a que está logo à frente dela
export function alvoDaFrente(m, out = {}) {
  const p = m.personagem, loc = m.locais[p.local];
  const x = Math.floor(p.x + Math.sin(p.rumo) * 0.85), z = Math.floor(p.z + Math.cos(p.rumo) * 0.85);
  const e = loc.entidadeEm(x, z);
  out.x = x; out.z = z; out.entidade = e ? e.id : undefined;
  return out;
}

// o que um toque na casa faria agora, sem fazer nada: { acao, args, texto, dados, falta } | null
export function descreverCasa(m, x, z) {
  const loc = m.local;
  if (!loc.dentro(x, z)) return null;
  const e = loc.entidadeEm(x, z);
  if (e) return descreverEntidade(m, e.id);
  if (!loc.ehPropria(x, z)) return { acao: null, texto: 'terra-a-venda' };
  return MODOS[m.modo.id].acaoNaCasa(m, x, z);
}
export function descreverEntidade(m, id) {
  const e = m.local.porId[id];
  return e ? TIPOS[e.tipo].acaoPossivel(m, e) : null;
}

// c.arrasto = o dedo está pintando (modo com "pintaEntidade"): enfileira o que der, sem avisos nem painéis
function tocarEntidade(m, c) {
  const e = m.local.porId[c.id];
  if (!e) return { ok: false, motivo: 'nao-existe' };
  const d = TIPOS[e.tipo].acaoPossivel(m, e);
  if (d && d.texto === 'na-fila') return { ok: true, repetida: true }; // já prometida: o toque repetido não muda nada
  if (d && d.acao) return enfileirar(m, { tipo: 'agir', acao: d.acao, entidade: e.id, args: d.args || null });
  if (c.arrasto) return { ok: false, motivo: d ? d.texto : null };
  // a entidade abre um painel (bancada, galinheiro, obra...): abre na hora, sem andar; a interface ouve "pediuPainel"
  if (d && d.painel) { m.eventos.emitir('pediuPainel', { painel: d.painel, arg: d.arg, entidade: e.id }); return { ok: true, dados: { painel: d.painel, arg: d.arg } }; }
  if (d && d.texto) m.eventos.emitir(d.info ? 'informou' : 'faltou', { motivo: d.texto, dados: d.dados, entidade: e.id }); // "info" = só uma informação (árvore crescendo)
  return { ok: false, motivo: d ? d.texto : null, dados: d ? d.dados : undefined };
}

function irPara(m, c) {
  const p = m.personagem, loc = m.local;
  let x = c.x, z = c.z;
  if (!cabe(loc, x, z)) {
    // o ponto não serve: vai para o centro da casa livre mais perto dele
    let melhor = Infinity, bx = null, bz = null;
    const cx = Math.floor(x), cz = Math.floor(z);
    for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) {
      if (!loc.andavel(cx + dx, cz + dz)) continue;
      const d = Math.hypot(cx + dx + 0.5 - x, cz + dz + 0.5 - z);
      if (d < melhor) { melhor = d; bx = cx + dx + 0.5; bz = cz + dz + 0.5; }
    }
    if (bx === null) return { ok: false, motivo: 'sem-caminho' };
    x = bx; z = bz;
  }
  // substitui a fila; a ação em curso termina antes
  p.fila.length = 0; p.rumando = false;
  if (p.tarefa && !p.acao) { p.tarefa = null; p.rota = null; }
  p.fila.push({ tipo: 'andar', x, z });
  return { ok: true };
}

function escolherModo(m, c) {
  const modo = MODOS[c.modo];
  if (!modo) return { ok: false, motivo: 'modo-desconhecido' };
  m.modo.id = c.modo;
  if (c.semente !== undefined) m.modo.semente = c.semente;
  if (modo.aoEscolher) modo.aoEscolher(m);
  m.eventos.emitir('modoMudou', { modo: m.modo.id, semente: m.modo.semente });
  return { ok: true };
}

registrarModo({
  id: 'mao', ordem: 0,
  // automático: pergunta a cada sistema o que há para fazer nesta casa (regar o que tem sede, colher o que está pronto...)
  acaoNaCasa(m, x, z) {
    for (let i = 0; i < AUTOMATICOS.length; i++) { const d = AUTOMATICOS[i](m, x, z); if (d) return d; }
    return null;
  },
});

registrarSistema({
  id: 'personagem',
  iniciar(m) {
    const T = m.dados.terras, ini = T.pontos.personagem || [1, 1];
    m.personagem = {
      local: 'fazenda', x: ini[0], z: ini[1], rumo: 0.6, vel: 0,
      folego: m.dados.regras.folego.max, cansada: false, correndo: false, querCorrer: false,
      rumando: false, dx: 0, dz: 0, forca: 1, // teclado, controle e alavanca
      fila: [], tarefa: null, rota: null, rotaI: 0, rotaLonga: false, acao: null,
      fase: 0, movendo: false,
      conta: { andando: 0, correndo: 0, agindo: 0, parada: 0, distancia: 0 }, // segundos em cada coisa (o jogador automático lê)
    };
    m.modo = { id: 'mao', semente: null };
  },

  passo(m) {
    const p = m.personagem, F = m.dados.regras.folego;
    let movendo = false;
    if (p.acao) avancarAcao(m, p);
    else if (p.rumando) movendo = andarDireto(m, p);
    else {
      for (let k = 0; k < 8 && !p.rota && !p.acao && p.fila.length; k++) iniciarTarefa(m, p, p.fila.shift());
      if (p.rota) movendo = seguirRota(m, p);
      else if (p.vel > 0) p.vel = Math.max(0, p.vel - FREIO * PASSO);
    }
    p.movendo = movendo;
    // fôlego: correr gasta, andar e parar recuperam
    if (movendo && p.correndo) {
      p.folego -= F.gastoPorSeg * PASSO;
      if (p.folego <= 0) { p.folego = 0; p.cansada = true; p.correndo = false; m.eventos.emitir('cansou', null); }
      p.conta.correndo += PASSO;
    } else {
      if (p.folego < F.max) p.folego = Math.min(F.max, p.folego + (movendo ? F.recuperaAndando : F.recuperaParado) * PASSO);
      if (p.cansada && p.folego >= F.max * VOLTA_A_CORRER) p.cansada = false;
      if (movendo) p.conta.andando += PASSO; else if (p.acao) p.conta.agindo += PASSO; else p.conta.parada += PASSO;
    }
  },

  ausencia(m, seg) {
    const p = m.personagem, F = m.dados.regras.folego;
    p.folego = Math.min(F.max, p.folego + F.recuperaParado * seg);
    if (p.folego >= F.max * VOLTA_A_CORRER) p.cansada = false;
  },

  comandos: {
    // toque numa casa: no modo ativo, enfileira a ação que couber; sem ação, anda até lá.
    // arrasto = true quando o dedo está pintando casas: aí nunca anda, só enfileira o que der.
    tocarCasa(m, c) {
      const loc = m.local, x = Math.floor(c.x), z = Math.floor(c.z);
      if (!loc.dentro(x, z)) return { ok: false, motivo: 'fora-do-mapa' };
      const e = loc.entidadeEm(x, z);
      // pintando com o dedo, as entidades ficam de fora, a não ser as que o modo diz que pinta (o mato, no modo "limpar")
      if (e) return c.arrasto && !(MODOS[m.modo.id].pintaEntidade && MODOS[m.modo.id].pintaEntidade(m, e)) ? { ok: false, motivo: null } : tocarEntidade(m, { id: e.id, arrasto: c.arrasto });
      if (!loc.ehPropria(x, z)) {
        if (!c.arrasto) m.eventos.emitir('faltou', { motivo: 'terra-a-venda', x, z });
        return { ok: false, motivo: 'terra-a-venda' };
      }
      const modo = MODOS[m.modo.id], d = modo.acaoNaCasa(m, x, z, c); // c: o modo pode querer saber se o dedo está pintando
      if (d && d.texto === 'na-fila') return { ok: true, repetida: true }; // já prometida: o toque repetido não muda nada
      if (d && d.acao) return enfileirar(m, { tipo: 'agir', acao: d.acao, x, z, args: d.args || null });
      if (d && d.info) { // só uma informação (planta crescendo): diz e não mexe na fila
        if (!c.arrasto) m.eventos.emitir('informou', { motivo: d.texto, dados: d.dados, x, z });
        return { ok: false, motivo: d.texto, dados: d.dados };
      }
      if (d && d.texto && (d.falta || (modo.id !== 'mao' && !c.arrasto))) {
        m.eventos.emitir('faltou', { motivo: d.texto, dados: d.dados, x, z });
        return { ok: false, motivo: d.texto, dados: d.dados };
      }
      if (c.arrasto) return { ok: false, motivo: d ? d.texto : null };
      return irPara(m, { x: x + 0.5, z: z + 0.5 });
    },
    tocarEntidade,
    irPara,
    // direção em vez de toque (teclado, controle, alavanca): dx e dz no chão; forca 0..1; correr opcional
    rumar(m, c) {
      const p = m.personagem, d = Math.hypot(c.dx, c.dz);
      if (!(d > 0.001)) { p.rumando = false; return { ok: true }; }
      if (!p.rumando) largar(p);
      p.rumando = true; p.dx = c.dx / d; p.dz = c.dz / d;
      p.forca = c.forca === undefined ? 1 : limitar(c.forca, 0.3, 1);
      if (c.correr !== undefined) p.querCorrer = !!c.correr;
      return { ok: true };
    },
    frear(m) { m.personagem.rumando = false; return { ok: true }; },
    correr(m, c) { m.personagem.querCorrer = !!c.ligado; return { ok: true }; },
    cancelar(m) { largar(m.personagem); m.personagem.rumando = false; return { ok: true }; },
    // tecla de ação: faz na casa ou entidade à frente dela o que o toque faria, sem andar
    agir(m) {
      const a = alvoDaFrente(m);
      if (a.entidade !== undefined) return tocarEntidade(m, { id: a.entidade });
      const d = descreverCasa(m, a.x, a.z);
      if (d && d.acao) { m.personagem.rumando = false; return enfileirar(m, { tipo: 'agir', acao: d.acao, x: a.x, z: a.z, args: d.args || null }); }
      const motivo = (d && d.texto) || 'nada-aqui';
      m.eventos.emitir('faltou', { motivo, dados: d ? d.dados : undefined, x: a.x, z: a.z });
      return { ok: false, motivo };
    },
    escolherModo,
    trocarModo(m, c) {
      const lista = modosEmOrdem().filter((x) => !x.disponivel || x.disponivel(m)), i = lista.findIndex((x) => x.id === m.modo.id); // modo que ainda não está disponível fica fora da roda
      const prox = lista[(i + (c.passo < 0 ? -1 : 1) + lista.length) % lista.length];
      return escolherModo(m, { modo: prox.id });
    },
  },

  salvar(m) {
    const p = m.personagem;
    return { local: p.local, x: +p.x.toFixed(3), z: +p.z.toFixed(3), rumo: +p.rumo.toFixed(3), folego: +p.folego.toFixed(2), modo: { ...m.modo }, conta: { ...p.conta } };
  },
  carregar(m, d) {
    const p = m.personagem;
    if (m.locais[d.local]) p.local = d.local;
    if (cabe(m.locais[p.local], d.x, d.z)) { p.x = d.x; p.z = d.z; } // se o mapa mudou e o lugar não serve mais, fica no começo
    p.rumo = d.rumo || 0; p.folego = Math.min(m.dados.regras.folego.max, d.folego === undefined ? p.folego : d.folego);
    if (d.modo && MODOS[d.modo.id]) m.modo = { id: d.modo.id, semente: m.dados.itens[d.modo.semente] ? d.modo.semente : null };
    if (d.conta) Object.assign(p.conta, d.conta);
  },
});

// o que o desenho precisa saber dela, sem alocar: preenche "out"
export function visualDaPersonagem(m, out) {
  const p = m.personagem, a = p.acao;
  out.x = p.x; out.z = p.z; out.rumo = p.rumo; out.vel = p.vel; out.fase = p.fase;
  // andando com colheita no cesto, a figura é a de carregar
  out.estado = a ? ACOES[a.id].estadoVisual : p.vel > PARADA_ABAIXO_DE ? (p.correndo ? 'correr' : noCesto(m) > 0 ? 'carregar' : 'andar') : 'parada';
  out.t = a ? a.t : 0; out.p = a ? a.t / a.dur : 0; out.acao = a ? a.id : null;
  if (DESLOCAMENTO.visual) DESLOCAMENTO.visual(m, out);
  return out;
}
