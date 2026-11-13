// Árvores frutíferas (arvores.json). A muda se compra na loja e se planta pelo modo "semear" (ela aparece na barra
// de sementes) numa casa própria e livre, respeitando o espaçamento entre árvores. Cresce em "cresceSeg" (muda,
// jovem, adulta) e depois dá fruta a cada "safraSeg": a safra pronta espera no pé (guarda uma) e um toque colhe
// para o cesto. Não pede rega nem replantio e nunca morre. Tudo é instante absoluto: o tempo fora do jogo se
// resolve por conta.
//   entidade: { id, tipo: 'arvore', arvore: <id de arvores.json>, x, z, plantada (ms), colhida (ms; 0 = nunca) }
import { registrarSistema, registrarAcao, registrarTipo, registrarEvento } from '../registro.js';
import { registrarConcluivel } from '../concluir.js';
import { somar } from '../util.js';
import { CAMINHO, ARADA, GRAMA } from '../local.js';
import { cabe } from '../caminho.js';
import { espacoNoCesto, porNoCesto } from './posses.js';
import { darXp } from './niveis.js';
import { VENDAVEL } from './loja.js';
import { PLANTIOS } from './lavoura.js';
import { filaTem, contarNaFila } from './personagem.js';
import { registrarGuia } from '../guia.js';

const NAO = (motivo, dados, limpar) => ({ ok: false, motivo, dados, limpar });
const SIM = { ok: true };
const def = (m, e) => m.dados.arvores[e.arvore];

// ---------- o relógio da árvore ----------
export const adultaEm = (m, e) => e.plantada + def(m, e).cresceSeg * 1000;
// quanto já cresceu, de 0 a 1 (1 = adulta)
export const crescimento = (m, e) => Math.max(0, Math.min(1, (m.agora - e.plantada) / (def(m, e).cresceSeg * 1000)));
// quantas safras esperam no pé (0 = nenhuma; no máximo "acumula")
export function safrasProntas(m, e) {
  const a = def(m, e), desde = Math.max(adultaEm(m, e), e.colhida || 0);
  return m.agora < desde ? 0 : Math.min(a.acumula, Math.floor((m.agora - desde) / (a.safraSeg * 1000)));
}
// 'muda' | 'jovem' | 'adulta' | 'fruta' (adulta com safra no pé)
export function faseDaArvore(m, e) {
  const c = crescimento(m, e);
  if (c < 0.5) return 'muda';
  if (c < 1) return 'jovem';
  return safrasProntas(m, e) > 0 ? 'fruta' : 'adulta';
}
// segundos até a próxima mudança: até ficar adulta ou, adulta, até a próxima safra (0 = já tem fruta)
export function esperaDaArvore(m, e) {
  const a = def(m, e), adulta = adultaEm(m, e);
  if (m.agora < adulta) return (adulta - m.agora) / 1000;
  if (safrasProntas(m, e) > 0) return 0;
  return (Math.max(adulta, e.colhida || 0) + a.safraSeg * 1000 - m.agora) / 1000;
}
export const arvoresDe = (m) => m.arvores.todas;

// ---------- onde dá para plantar ----------
// a casa (x, z) serve para a árvore "id"? Conta as árvores de pé e as mudas já prometidas na fila.
//   { ok } | { ok: false, motivo: 'terra-a-venda' | 'casa-ocupada' | 'no-caminho' | 'ja-plantado' | 'muito-perto', dados }
export function podePlantarArvore(m, x, z, id, semFila) {
  const loc = m.local, a = m.dados.arvores[id];
  if (!a || !loc.dentro(x, z)) return NAO('nao-da');
  const i = loc.i(x, z);
  if (!loc.propria[i]) return NAO('terra-a-venda');
  if (loc.ocupa[i]) return NAO('casa-ocupada');
  if (loc.chao[i] === CAMINHO) return NAO('no-caminho');
  if (loc.plantas[i]) return NAO('ja-plantado');
  if (loc.chao[i] !== GRAMA && loc.chao[i] !== ARADA) return NAO('casa-ocupada'); // piso de construção, por exemplo
  for (const e of m.arvores.todas) {
    if (e.local !== loc.id) continue;
    const d = Math.max(Math.abs(e.x - x), Math.abs(e.z - z)), pede = Math.max(a.espacamento, def(m, e).espacamento);
    if (d < pede) return NAO('muito-perto', { casas: pede, arvore: id });
  }
  if (!semFila) {
    const p = m.personagem, perto = (t) => t && t.tipo === 'agir' && t.acao === 'plantarMuda' && !(t.x === x && t.z === z) && Math.max(Math.abs(t.x - x), Math.abs(t.z - z)) < Math.max(a.espacamento, (m.dados.arvores[m.dados.arvoreDaMuda[t.args.muda]] || a).espacamento);
    if (perto(p.tarefa) || p.fila.some(perto)) return NAO('muito-perto', { casas: a.espacamento, arvore: id });
  }
  return SIM;
}
// as mudas deste item que ainda não estão prometidas na fila
export const mudasLivres = (m, muda) => (m.posses.bolsa[muda] || 0) - contarNaFila(m, 'plantarMuda', (t) => t.args && t.args.muda === muda);

function porArvore(m, loc, id, x, z, plantada, colhida) {
  const A = m.arvores;
  let nome;
  do { nome = 'arvore-' + (++A.n); } while (loc.porId[nome]);
  const e = loc.por({ id: nome, tipo: 'arvore', arvore: id, x, z, plantada, colhida: colhida || 0, local: loc.id, deu: false });
  A.todas.push(e);
  return e;
}
// se a personagem ficou dentro da casa que a árvore ocupou, dá um passo para o lado livre mais perto
function afastar(m, x, z) {
  const p = m.personagem, loc = m.local;
  if (cabe(loc, p.x, p.z)) return;
  let melhor = Infinity, bx = p.x, bz = p.z;
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dz) continue;
    const cx = x + 0.5 + dx * 0.78, cz = z + 0.5 + dz * 0.78, d = Math.hypot(cx - p.x, cz - p.z);
    if (d < melhor && cabe(loc, cx, cz)) { melhor = d; bx = cx; bz = cz; }
  }
  p.x = bx; p.z = bz;
}

// ---------- ações ----------
registrarAcao({
  id: 'plantarMuda', dur: 1.2, efeitoEm: 0.75, estadoVisual: 'plantar-muda',
  pode(m, alvo, args) {
    const muda = args && args.muda, id = m.dados.arvoreDaMuda[muda], a = m.dados.arvores[id];
    if (!a) return NAO('sem-semente-escolhida', null, true);
    if (a.nivel > m.progresso.nivel) return NAO('nivel-baixo', { nivel: a.nivel, item: muda }, true);
    if (!(m.posses.bolsa[muda] > 0)) return NAO('sem-mudas', { item: muda }, true);
    return podePlantarArvore(m, alvo.x, alvo.z, id, true);
  },
  aoEfeito(m, alvo, args) {
    const loc = m.local, i = loc.i(alvo.x, alvo.z), id = m.dados.arvoreDaMuda[args.muda];
    somar(m.posses.bolsa, args.muda, -1);
    if (loc.chao[i] === ARADA) loc.chao[i] = GRAMA; // a árvore fica na grama
    const e = porArvore(m, loc, id, alvo.x, alvo.z, m.agora, 0);
    afastar(m, alvo.x, alvo.z);
    m.eventos.emitir('chaoMudou', { local: loc.id, x: alvo.x, z: alvo.z });
    m.eventos.emitir('plantou', { item: args.muda, arvore: id, x: alvo.x, z: alvo.z, entidade: e.id });
  },
});

registrarAcao({
  id: 'colherFruta', dur: 1.2, efeitoEm: 0.7, estadoVisual: 'colher-fruta',
  pode(m, alvo) {
    const e = m.local.porId[alvo.entidade];
    if (!e || e.tipo !== 'arvore') return NAO('nada-para-colher');
    const n = safrasProntas(m, e) * def(m, e).rende;
    if (!n) return NAO('ainda-crescendo');
    if (espacoNoCesto(m) < n) return NAO('cesto-cheio', null, true);
    return SIM;
  },
  aoEfeito(m, alvo) {
    const e = m.local.porId[alvo.entidade], a = def(m, e), safras = safrasProntas(m, e), n = safras * a.rende;
    porNoCesto(m, a.fruto, n);
    e.colhida = m.agora; e.deu = false;
    m.eventos.emitir('colheu', { item: a.fruto, n, arvore: a.id, x: e.x, z: e.z, entidade: e.id });
    darXp(m, a.xp * safras, 'colher');
  },
});

// ---------- a árvore no terreno ----------
const CHAVES = {};
const chaveDe = (id, fase) => { const c = CHAVES[id] || (CHAVES[id] = {}); return c[fase] || (c[fase] = 'arvore/' + id + '-' + fase); };
registrarTipo({
  tipo: 'arvore', casas: [1, 1], bloqueia: true, altura: 2.3,
  acaoPossivel(m, e) {
    const a = def(m, e), safras = safrasProntas(m, e), dados = { arvore: a.id, nome: a.nome, item: a.fruto, n: safras * a.rende, seg: esperaDaArvore(m, e), fase: faseDaArvore(m, e) };
    if (safras > 0) {
      if (colheitaNaFila(m, e.id)) return { acao: null, texto: 'na-fila' };
      if (espacoNoCesto(m) - frutaPrometida(m) < dados.n) return { acao: null, texto: 'cesto-cheio', falta: true };
      return { acao: 'colherFruta', dados };
    }
    return { acao: null, texto: crescimento(m, e) < 1 ? 'arvore-crescendo' : 'fruta-crescendo', info: true, dados };
  },
  visual(m, e, v) { v.chave = chaveDe(e.arvore, faseDaArvore(m, e)); v.variante = 0; return v; },
});
// a colheita desta árvore já está na fila?
function colheitaNaFila(m, id) {
  const p = m.personagem, serve = (t) => t && t.tipo === 'agir' && t.acao === 'colherFruta' && t.entidade === id;
  return serve(p.tarefa) || p.fila.some(serve);
}
// as frutas que as colheitas já na fila vão pôr no cesto
function frutaPrometida(m) {
  const p = m.personagem, loc = m.local;
  let n = 0;
  const soma = (t) => { if (t && t.tipo === 'agir' && t.acao === 'colherFruta') { const e = loc.porId[t.entidade]; if (e) n += safrasProntas(m, e) * def(m, e).rende; } };
  if (!(p.acao && p.acao.feito)) soma(p.tarefa);
  for (const t of p.fila) soma(t);
  return n;
}

// ---------- o modo "semear" com uma muda escolhida ----------
PLANTIOS.push({
  serve: (D, item) => !!D.arvoreDaMuda[item],
  produz: (D, item) => Object.values(D.arvores).some((a) => a.fruto === item),
  acaoNaCasa(m, x, z, muda) {
    const id = m.dados.arvoreDaMuda[muda], a = m.dados.arvores[id], dados = { item: muda, arvore: id, casas: a.espacamento };
    if (filaTem(m, 'plantarMuda', x, z)) return { acao: null, texto: 'na-fila' };
    if (a.nivel > m.progresso.nivel) return { acao: null, texto: 'nivel-baixo', dados: { nivel: a.nivel, item: muda }, falta: true };
    if (mudasLivres(m, muda) <= 0) return { acao: null, texto: 'sem-mudas', dados, falta: true };
    const r = podePlantarArvore(m, x, z, id);
    if (!r.ok) return { acao: null, texto: r.motivo, dados: r.dados || dados };
    return { acao: 'plantarMuda', args: { muda }, dados };
  },
});
VENDAVEL.muda = (m, it) => !!m.dados.arvoreDaMuda[it.id];

// ---------- avisos pelo relógio ----------
// a árvore que acabou de dar fruta avisa uma vez (som, brilho); vale também na volta de uma ausência
function conferir(m) {
  for (const e of m.arvores.todas) {
    if (e.deu || safrasProntas(m, e) <= 0) continue;
    e.deu = true;
    m.eventos.emitir('deuFruta', { arvore: e.arvore, item: def(m, e).fruto, x: e.x, z: e.z, entidade: e.id, local: e.local });
  }
}
// quantas árvores têm fruta para colher agora
export function arvoresComFruta(m) { let n = 0; for (const e of m.arvores.todas) if (safrasProntas(m, e) > 0) n++; return n; }

// ---------- concluir a muda com cash (o comando, o preço e o botão são do sistema de cash) ----------
const alvoDe = (m, alvo) => { const id = typeof alvo === 'string' ? alvo : alvo && alvo.tipo === 'arvore' ? alvo.id : alvo && alvo.entidade; return m.arvores.todas.find((e) => e.id === id) || null; };
registrarConcluivel({
  tipo: 'muda',
  falta(m, alvo) { const e = alvoDe(m, alvo); return e ? Math.max(0, (adultaEm(m, e) - m.agora) / 1000) : 0; },
  terminar(m, alvo) {
    const e = alvoDe(m, alvo);
    if (!e || m.agora >= adultaEm(m, e)) return false;
    e.plantada = m.agora - def(m, e).cresceSeg * 1000; // fica adulta agora; a primeira safra vem no tempo dela
    m.eventos.emitir('arvoreCresceu', { arvore: e.arvore, x: e.x, z: e.z, entidade: e.id });
    return true;
  },
  nome(m, alvo) { const e = alvoDe(m, alvo); return e ? def(m, e).nome : ''; },
});

registrarEvento('deuFruta', { campos: ['arvore', 'item', 'x', 'z', 'entidade'] });
registrarEvento('arvoreCresceu', { campos: ['arvore', 'x', 'z', 'entidade'] });

registrarSistema({
  id: 'arvores',
  iniciar(m) { m.arvores = { todas: [], n: 0 }; },
  segundo: conferir,
  ausencia: conferir,
  // [árvore, x, z, plantada, colhida] por árvore (só a fazenda tem árvores)
  salvar(m) { return { n: m.arvores.n, lista: m.arvores.todas.map((e) => [e.arvore, e.x, e.z, Math.round(e.plantada), Math.round(e.colhida || 0)]) }; },
  carregar(m, d) {
    const loc = m.locais.fazenda;
    m.arvores.n = d.n || 0;
    for (const [id, x, z, plantada, colhida] of d.lista || []) {
      // a árvore saiu dos dados, ou o mapa mudou e a casa não serve mais: fica de fora
      if (!m.dados.arvores[id] || !loc.dentro(x, z) || loc.ocupa[loc.i(x, z)] || !loc.propria[loc.i(x, z)]) continue;
      porArvore(m, loc, id, x, z, plantada || 0, colhida || 0);
    }
    for (const e of m.arvores.todas) e.deu = safrasProntas(m, e) > 0; // o que já estava pronto ao gravar não avisa de novo
  },
});

// ---------- o guia das missões de pomar ----------
const um = (v) => (Array.isArray(v) ? v[0] : v);
// a casa livre mais perto da personagem onde a árvore cabe (dentro de "raio" casas), ou null
export function casaParaArvore(m, id, raio = 8) {
  const p = m.personagem, x0 = Math.floor(p.x), z0 = Math.floor(p.z);
  let melhor = Infinity, achou = null;
  for (let z = z0 - raio; z <= z0 + raio; z++) for (let x = x0 - raio; x <= x0 + raio; x++) {
    const d = Math.hypot(x + 0.5 - p.x, z + 0.5 - p.z);
    if (d >= melhor || d < 1 || m.local.chaoEm(x, z) !== GRAMA || filaTem(m, 'plantarMuda', x, z) || !podePlantarArvore(m, x, z, id).ok) continue;
    melhor = d; achou = [x, z];
  }
  return achou;
}
function passoPlantarMuda(m, muda, out) {
  const id = m.dados.arvoreDaMuda[muda];
  if (!(m.posses.bolsa[muda] > 0)) { out.tipo = 'painel'; out.painel = 'loja'; out.item = muda; return out; }
  if (mudasLivres(m, muda) <= 0) { out.tipo = null; return out; } // as que há já estão prometidas na fila
  if (m.modo.id !== 'semear') { out.tipo = 'modo'; out.modo = 'semear'; return out; }
  if (m.modo.semente !== muda) { out.tipo = 'semente'; out.item = muda; return out; }
  const c = casaParaArvore(m, id);
  if (!c) { out.tipo = null; return out; }
  out.tipo = 'casa'; out.x = c[0]; out.z = c[1];
  return out;
}
registrarGuia('plantou', (m, f, out) => { const muda = um(f.item); return m.dados.arvoreDaMuda[muda] ? passoPlantarMuda(m, muda, out) : null; });
registrarGuia('colheu', (m, f, out) => {
  const fruto = um(f.item), a = Object.values(m.dados.arvores).find((x) => x.fruto === fruto);
  if (!a) return null;
  const p = m.personagem;
  let perto = null, melhor = Infinity, espera = Infinity;
  for (const e of m.arvores.todas) {
    if (e.arvore !== a.id) continue;
    if (safrasProntas(m, e) > 0) { const d = Math.hypot(e.x - p.x, e.z - p.z); if (d < melhor && !colheitaNaFila(m, e.id)) { melhor = d; perto = e; } } else espera = Math.min(espera, esperaDaArvore(m, e));
  }
  if (perto) {
    if (espacoNoCesto(m) - frutaPrometida(m) < a.rende) { out.tipo = 'entidade'; out.id = 'banca'; return out; }
    out.tipo = 'entidade'; out.id = perto.id; return out;
  }
  if (espera < Infinity) { out.tipo = 'esperar'; out.seg = espera; return out; }
  return passoPlantarMuda(m, a.muda, out);
});
