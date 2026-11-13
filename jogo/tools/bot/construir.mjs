// Construir: achar um lugar livre perto do miolo da fazenda (fora da lavoura e longe dos caminhos), limpar o que
// estiver no meio, mandar construir (ela vai até lá e martela; o preço sai na martelada), ampliar, e montar móvel
// dentro do celeiro (ela entra, monta e sai). O que falta de ouro e de material é com metas.mjs (obter).
import { X, registro } from './jogo.mjs';
import { passo, nota, evitado, evitar, naFazenda, fazenda, nivel, comando, cmd, ocupada } from './contexto.mjs';
import { zona } from './lavoura.mjs';
import { obstaculos, limpavel, limpar } from './terras.mjs';

const C = X.construcao;
export const def = (J, id) => J.D.construcoes[id] || null;
export const temPronta = (J, id) => !!C && C.temPronta(J.m, id);
// quantas desta construção ela tem (prontas, em obra ou já mandadas fazer)
export function quantas(J, id) {
  if (!C) return 0;
  let n = C.construcoesDe(J.m, id).length;
  for (const a of C.planejadas(J.m)) if (a.id === id) n++;
  return n;
}
// em obra ou na fila para martelar?
export function emObra(J, id) {
  if (!C) return false;
  for (const a of C.planejadas(J.m)) if (a.id === id) return true;
  return C.construcoesDe(J.m, id).some((e) => !C.estaPronta(e));
}
export function obraFalta(J, id) {
  let s = 0;
  for (const e of C.construcoesDe(J.m, id)) if (!C.estaPronta(e)) s = Math.max(s, C.faltaDaObra(J.m, e));
  return s;
}

// ---------- o lugar ----------
// Pontos de referência: o miolo é o ponto da personagem ao nascer (entre poço, celeiro e banca)
function miolo(J) { const P = J.D.terras.pontos; return P.personagem || P.celeiro || [J.p.x, J.p.z]; }
// Candidatos para uma base l×p: só terra própria, fora da zona da lavoura, sem construção, árvore nem planta.
// Casa com obstáculo vale, se dá para limpar (conta como "a limpar"). Caminho de terra custa (melhor não tapar).
function candidatos(J, l, p) {
  const loc = fazenda(J), Z = J.zonaSet, M = miolo(J), out = [];
  zona(J); obstaculos(J);
  const T = registro.TIPOS;
  for (let z = 0; z + p <= loc.p; z++) for (let x = 0; x + l <= loc.l; x++) {
    let limpa = 0, caminho = 0, serve = true;
    for (let cz = z; cz < z + p && serve; cz++) for (let cx = x; cx < x + l; cx++) {
      const i = cz * loc.l + cx;
      if (loc.propria[i] !== 1 || Z[i] || loc.plantas[i]) { serve = false; break; }
      if (loc.chao[i] === X.local.CAMINHO) caminho++;
      const oc = loc.ocupa[i];
      if (oc) { const e = loc.porNum[oc]; if (!e || !T[e.tipo] || !T[e.tipo].obstaculo || !limpavel(J, e.tipo)) { serve = false; break; } limpa++; }
    }
    if (!serve) continue;
    const d = Math.hypot(x + l / 2 - M[0], z + p / 2 - M[1]);
    out.push([d + 3 * caminho + 1.5 * limpa, x, z, limpa]);
  }
  out.sort((a, b) => a[0] - b[0]);
  return out;
}

// O lugar para "id" na fazenda: { x, z } pronto, ou { limpar: Set de ids, perto } (o melhor lugar tem obstáculo),
// ou null. Guardado por (versão do mapa, lotes) enquanto serve.
export function lugarPara(J, id) {
  const d = def(J, id), loc = fazenda(J), chave = `${id}:${loc.versao}:${J.m.terras.lotes.length}`;
  if (!d) return null;
  if (J.lugar && J.lugar.chave === chave) return J.lugar.r;
  const cs = d.casas, giros = d.gira && cs[0] !== cs[1] ? [0, 1] : [0];
  let r = null;
  // o lugar de sempre (terras.json pontos: o celeiro e o quadro do começo humilde), se está livre: é onde o jogo sugere
  const P = J.D.terras.pontos[id];
  if (P && C.lugarServe(J.m, id, Math.floor(P[0]), Math.floor(P[1]), { local: 'fazenda' }).ok) { J.lugar = { chave, r: { x: Math.floor(P[0]), z: Math.floor(P[1]), giro: 0, nota: 0 } }; return J.lugar.r; }
  for (const giro of giros) {
    const l = giro ? cs[1] : cs[0], p = giro ? cs[0] : cs[1];
    let testados = 0;
    for (const [nota0, x, z, limpa] of candidatos(J, l, p)) {
      if (r && nota0 >= r.nota) break;
      if (limpa) { if (!r || !r.limpar) { const ids = new Set(); for (let cz = z; cz < z + p; cz++) for (let cx = x; cx < x + l; cx++) { const e = loc.entidadeEm(cx, cz); if (e) ids.add(e.id); } r = r || { limpar: ids, perto: [x + l / 2, z + p / 2], nota: nota0 + 50 }; } continue; }
      if (++testados > 40) break;
      const s = C.lugarServe(J.m, id, x, z, { local: 'fazenda', giro });
      if (s.ok) { if (!r || r.limpar || nota0 < r.nota) r = { x, z, giro, nota: nota0 }; break; }
    }
  }
  J.lugar = { chave, r };
  return r;
}

// Manda construir "id" (já com ouro e material: quem confere é metas.mjs). Devolve o passo, ou null com a nota.
export function construir(J, id) {
  if (!C || !comando(J, 'construir')) return nota(J, 'construir: o sistema não está no jogo');
  const d = def(J, id);
  if (!d) return null;
  if (d.onde === 'celeiro') return montarMovel(J, id);
  if (!naFazenda(J)) return null;
  if (emObra(J, id)) return null;
  const pg = C.podePagar(J.m, id);
  if (!pg.ok) return nota(J, `${d.nome}: ${pg.motivo}`);
  const L = lugarPara(J, id);
  if (!L) { J.semLugar = id; return nota(J, `não há lugar para ${d.nome} (falta terra: comprar lote)`); }
  J.semLugar = null;
  if (L.limpar) return limpar(J, null, { ids: L.limpar, perto: L.perto }) || nota(J, `o lugar de ${d.nome} tem obstáculo que ela não alcança`);
  if (evitado(J, 'construir:' + id)) return null;
  return cmd(J, { tipo: 'construir', id, x: L.x, z: L.z, giro: L.giro || 0 }, 3, 'construir:' + id);
}

// ---------- móvel do celeiro: entra, monta e sai ----------
function lugarNoCeleiro(J, id) {
  const loc = J.m.locais.celeiro, d = def(J, id);
  if (!loc) return null;
  for (let z = 0; z + d.casas[1] <= loc.p; z++) for (let x = 0; x + d.casas[0] <= loc.l; x++) if (C.lugarServe(J.m, id, x, z, { local: 'celeiro' }).ok) return [x, z];
  return null;
}
export function montarMovel(J, id) {
  const d = def(J, id), m = J.m;
  if (!m.locais.celeiro || !comando(J, 'entrar')) return nota(J, 'o celeiro por dentro não está no jogo');
  if (emObra(J, id)) return null;
  const pg = C.podePagar(m, id);
  if (!pg.ok) return nota(J, `${d.nome}: ${pg.motivo}`);
  const c = lugarNoCeleiro(J, id);
  if (!c) { J.celeiroSemLugar = true; return nota(J, `não cabe mais ${d.nome} no celeiro (ampliar o celeiro)`); }
  if (J.p.local !== 'celeiro') {
    // entrar limpa a fila dela: para de pôr tarefa nova e espera a fila acabar (decidir.mjs olha J.vaiEntrar)
    if (ocupada(J)) { if (!J.vaiEntrar) J.vaiEntrar = m.agora; return nota(J, `terminando a fila para entrar no celeiro (${d.nome.toLowerCase()})`); }
    J.vaiEntrar = 0;
    J.dentroPara = id;
    return cmd(J, { tipo: 'entrar' }, 2, 'entrar');
  }
  if (evitado(J, 'construir:' + id)) return null;
  J.dentroPara = null; J.sairDepois = true;
  return cmd(J, { tipo: 'construir', id, x: c[0], z: c[1], local: 'celeiro' }, 3, 'construir:' + id);
}

// ---------- ampliar ----------
export function ampliacao(J, e) { return C ? C.proximaAmpliacao(J.m, e) : null; }
export function ampliar(J, e) {
  if (!C || !comando(J, 'ampliar')) return null;
  const a = C.proximaAmpliacao(J.m, e);
  if (!a || e.obraAte > 0 || e.ampliaAte > 0) return null;
  if (a.nivel > nivel(J)) return nota(J, `${def(J, e.tipo).nome}: a ampliação pede o nível ${a.nivel}`);
  if (evitado(J, 'ampliar:' + e.id)) return null;
  return cmd(J, { tipo: 'ampliar', entidade: e.id }, 2, 'ampliar:' + e.id);
}
