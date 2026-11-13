// Bichos soltos no terreiro: a base comum dos animais de trabalho (boi, cavalo, jumento: trabalho.js) e de estimação
// (cachorro, gato: estimacao.js). Cada bicho solto é uma entidade da fazenda que NÃO bloqueia nada, não é gravada e
// anda por conta: quem manda é a família dele, a cada passo, com irAte() (vai para perto de um ponto, desviando das
// construções) ou levar() (posição dada na mão, como o boi puxando o arado).
//   tipo "bicho"            recebe toque (o afago do cachorro e do gato)
//   tipo "bichoDeTrabalho"  o toque passa por ele e vale para a casa de trás (ele anda colado nela o dia inteiro)
// A entidade: { id: 'bicho:<id do animal>', tipo, x, z (canto da casa: o centro é x + 0.5, z + 0.5), animal, especie,
//               familia, figura (a espécie cuja arte ele usa se a dele não existir), rumo, vel, fase (casas andadas),
//               estado ('parado' | 'andar' | 'correr' | 'sentado' | 'puxar'...), parado (segundos sem sair do lugar) }
// O desenho (render/trabalho.js) preenche DESENHO.bicho; a lógica não sabe como o bicho é pintado.
import { registrarTipo } from '../registro.js';
import { PASSO, limitar, girarPara } from '../util.js';
import { acharCaminho, cabe } from '../caminho.js';

const ACEL = 10, FREIO = 13; // unidades/s²
const GIRO = 9; // rad/s
const REPLANEJA = 24; // passos entre uma procura de caminho e a outra (o alvo anda)
const SEM_ROTA = 40; // passos de espera depois de uma procura que não achou caminho

// (m, e, v): o desenho ajusta a chave, o quadro e o lado da figura
export const DESENHO = { bicho: null };
// por família: o que o toque no bicho faz, como o acaoPossivel de um tipo: (m, e) → resposta | null
export const TOQUE = {};

function visual(m, e, v) {
  v.chave = 'animal/' + e.especie + '/parado-frente'; v.variante = 0;
  if (DESENHO.bicho) DESENHO.bicho(m, e, v);
  return v;
}
const tocar = (m, e) => (TOQUE[e.familia] ? TOQUE[e.familia](m, e) : null) || { acao: null, texto: null };
// ela para pertinho do bicho (de qualquer lado) para o afago ou para encher o regador no barril
const AO_LADO = [[1.2, 0.5], [-0.2, 0.5], [0.5, 1.2], [0.5, -0.2]], AO_LARGO = [[1.6, 0.5], [-0.6, 0.5], [0.5, 1.6], [0.5, -0.6]];
registrarTipo({ tipo: 'bicho', casas: [1, 1], bloqueia: false, semVeu: true, altura: 1, pontos: { ficar: AO_LADO }, acaoPossivel: tocar, visual });
registrarTipo({ tipo: 'bichoDeTrabalho', casas: [1, 1], bloqueia: false, semVeu: true, semToque: true, altura: 2, pontos: { ficar: AO_LARGO }, acaoPossivel: tocar, visual });

export const idDoBicho = (animalId) => 'bicho:' + animalId;
// a entidade do bicho solto (ou null se ele não está no terreiro)
export const bichoSolto = (m, animalId) => m.locais.fazenda.porId['bicho:' + animalId] || null;

// põe o bicho no terreiro com o centro em (cx, cz); se já está solto, devolve o que há
export function soltar(m, a, cx, cz, campos) {
  const loc = m.locais.fazenda, id = idDoBicho(a.id);
  if (loc.porId[id]) return loc.porId[id];
  return loc.por({
    id, tipo: 'bichoDeTrabalho', x: cx - 0.5, z: cz - 0.5, l: 1, p: 1, animal: a.id, especie: a.especie, familia: a.familia, figura: a.especie,
    rumo: 0.6, vel: 0, fase: 0, estado: 'parado', parado: 0, indo: false, rota: null, rotaI: 0, metaX: 0, metaZ: 0, plano: 0, semRota: 0, ...campos,
  });
}
export function recolher(m, animalId) { return m.locais.fazenda.tirar(idDoBicho(animalId)); }

// há tarefa (em curso ou na fila) que tem este bicho como alvo? Enquanto houver, ele espera parado.
export function esperado(m, e) {
  const p = m.personagem;
  if (p.tarefa && p.tarefa.entidade === e.id) return true;
  for (let i = 0; i < p.fila.length; i++) if (p.fila[i].entidade === e.id) return true;
  return false;
}

// um passo em direção a (tx, tz), no máximo a vmax; "freia" = chega parando a "folga" do ponto. Devolve o que falta.
function passoAte(e, tx, tz, vmax, folga, freia) {
  const cx = e.x + 0.5, cz = e.z + 0.5, dx = tx - cx, dz = tz - cz, d = Math.hypot(dx, dz), resto = d - folga;
  if (!(resto > 0.02)) return 0;
  const vAlvo = freia ? Math.min(vmax, Math.max(0.7, Math.sqrt(2 * FREIO * 0.7 * resto))) : vmax;
  e.vel += limitar(vAlvo - e.vel, -FREIO * PASSO, ACEL * PASSO);
  const anda = Math.min(resto, e.vel * PASSO);
  e.x += (dx / d) * anda; e.z += (dz / d) * anda;
  e.rumo = girarPara(e.rumo, Math.atan2(dx, dz), GIRO * PASSO);
  e.fase += anda;
  return resto - anda;
}
// parado no lugar: perde a velocidade e conta o tempo
export function ficar(e) {
  if (e.vel > 0) e.vel = Math.max(0, e.vel - FREIO * PASSO);
  e.parado += PASSO;
  e.rota = null;
}

// Leva o bicho para perto de (gx, gz): ele para a "folga" casas do ponto. O caminho desvia do que bloqueia (o mesmo
// A* da personagem); "chao" troca o chão da conta (o dos bichos de estimação não deixa pisar em planta). Se não há
// caminho, "aTodoCusto" manda ir em linha reta assim mesmo (o bicho não esbarra em nada); sem ele, fica onde está.
// Devolve true enquanto anda.
export function irAte(m, e, gx, gz, folga, vmax, chao, aTodoCusto) {
  const loc = chao || m.locais.fazenda, cx = e.x + 0.5, cz = e.z + 0.5;
  if (Math.hypot(gx - cx, gz - cz) <= folga + 0.03) { ficar(e); return false; }
  if (e.plano > 0) e.plano--;
  if (e.semRota > 0) { e.semRota--; ficar(e); return false; } // não achou caminho há pouco: espera antes de procurar de novo
  const dx = gx - e.metaX, dz = gz - e.metaZ;
  if (!e.rota || (e.plano <= 0 && dx * dx + dz * dz > 0.5)) {
    e.metaX = gx; e.metaZ = gz; e.plano = REPLANEJA; e.rotaI = 0;
    e.rota = (cabe(loc, cx, cz) ? acharCaminho(loc, cx, cz, gx, gz) : null) || (aTodoCusto ? [[gx, gz]] : null);
    if (!e.rota) { e.semRota = SEM_ROTA; ficar(e); return false; }
  }
  const r = e.rota, ultimo = e.rotaI >= r.length - 1;
  // no último trecho o alvo é o ponto de agora (ele se mexe); nos outros, o canto do caminho
  const falta = ultimo ? passoAte(e, gx, gz, vmax, folga, true) : passoAte(e, r[e.rotaI][0], r[e.rotaI][1], vmax, 0, false);
  if (!ultimo && falta <= 0.03) e.rotaI++;
  e.parado = 0;
  return true;
}

// põe o bicho no ponto (cx, cz) olhando para "rumo" (quem chama cuida do caminho: o boi puxando o arado)
export function levar(e, cx, cz, rumo) {
  const d = Math.hypot(cx - 0.5 - e.x, cz - 0.5 - e.z);
  e.x = cx - 0.5; e.z = cz - 0.5; e.fase += d; e.vel = d / PASSO; e.parado = 0; e.rota = null;
  if (rumo !== undefined) e.rumo = girarPara(e.rumo, rumo, GIRO * 1.6 * PASSO);
}

// o ponto diante da porta de uma construção (a face de +Z, a que olha para a câmera), para o bicho sair e voltar
export function portaDe(e, out = [0, 0]) { out[0] = e.x + e.l / 2; out[1] = e.z + e.p + 0.6; return out; }

// o chão em que os bichos de estimação andam: o da fazenda, menos as casas plantadas (não pisam na lavoura)
export function chaoSemPlanta(m) {
  const loc = m.locais.fazenda, c = m._chaoSemPlanta;
  if (c && c.loc === loc) return c; // (a fazenda é trocada por outra quando a terra cresce)
  return (m._chaoSemPlanta = { loc, l: loc.l, p: loc.p, dentro: (x, z) => loc.dentro(x, z), andavel: (x, z) => loc.andavel(x, z) && !loc.plantas[z * loc.l + x] });
}
