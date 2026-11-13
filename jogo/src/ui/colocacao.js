// O modo de escolher o lugar: um fantasma da construção anda pela malha, com as casas da base verdes (serve) ou
// vermelhas (não serve), e uma barra com Confirmar e Cancelar sempre à vista.
//   toque e mouse   o fantasma vai para onde o dedo toca e segue o dedo; perto da borda, a tela anda junto;
//                   dois dedos (ou a roda do mouse) dão zoom, o botão direito arrasta a tela
//   teclado e TV    as setas movem uma casa por vez (a tela acompanha), Enter confirma, Esc cancela, R gira
//   controle        direcional ou alavanca movem, A confirma, B cancela, os ombros giram
// Três usos:
//   comecarColocacao(id)        construção nova (ou guardada). Cerca, porteira, calçamento e enfeite sem obra ficam
//                               "em sequência": cada toque coloca um e arrastar pinta vários; "Pronto" encerra
//   comecarMudanca(idEntidade)  mudar de lugar uma construção que já existe (e guardar, quando ela se guarda)
//   comecarArrumacao()          escolher, com um toque, o que mudar de lugar (alcança também o calçamento)
// Nada aqui muda o mundo por conta própria: confirmar manda os comandos construir e moverConstrucao.
import { J } from '../contexto.js';
import { el, icone, trocarIcone, botao, por, classe } from './dom.js';
import { T, frase, numero } from './textos.js';
import './textos/construcao.js';
import { avisar } from './avisos.js';
import { aoInstalarMundo } from './ligacoes.js';
import { som } from '../plataforma/som.js';
import { tela } from '../plataforma/tela.js';
import { foco } from '../entrada/foco.js';
import { fecharPainel } from './paineis/registro.js';
import { registrarCamada } from '../render/cena.js';
import { FANTASMA } from '../render/construcao.js';
import { TIPOS } from '../nucleo/registro.js';
import { defDe, casasDe, lugarServe, podeConstruir, guardavel, quantasGuardadas, construcaoPorId, SOLEIRA } from '../nucleo/sistemas/construcao.js';

const F = FANTASMA;
let modo = null; // { tipo: 'novo' | 'mover' | 'arrumar', id, def, e, seq, postas, volta, motivo }
let hud = null, raiz = null, camada = null, toque = null, barra = null, aviso = null;
let ic = null, tNome = null, tInfo = null, bGirar = null, bGuardar = null, bCancelar = null, bConfirmar = null;
let seguirFantasma = false, relogio = 0;
export const colocando = () => !!modo;
export const modoDeColocacao = () => (modo ? { tipo: modo.tipo, id: modo.id, x: F.x, z: F.z, giro: F.giro, ok: F.ok, seq: !!modo.seq, postas: modo.postas || 0, motivo: modo.motivo ? modo.motivo.motivo : null } : null);

// enfeite sem obra nasce na hora: dá para colocar vários de uma vez (cerca, porteira, calçamento, canteiro...)
const emSequencia = (def) => def.tipo === 'decoracao' && !(def.obraSeg > 0) && !(def.limite === 1);

// ---------- a barra e a camada que recebe os toques ----------
function montar() {
  if (camada) return;
  raiz = document.getElementById('ui');
  camada = el('div', 'cons-modo');
  toque = el('div', 'cons-toque');
  aviso = el('div', 'cons-dica');
  barra = el('div', 'cons-barra');
  const info = el('div', 'cons-info'), textos = el('div');
  ic = icone('ui/mover', 44); tNome = el('b'); tInfo = el('span');
  textos.append(tNome, tInfo); info.append(ic, textos);
  const largar = (f) => (ev) => { ev.currentTarget.blur(); f(); }; // o foco não fica no botão: Enter é sempre "confirmar"
  bGirar = botao({ icone: 'ui/mover', tamanho: 24, texto: T.colocar.girar, classe: 'cons-bt', aoClicar: largar(girar) }); bGirar.dataset.k = 'girar';
  bGuardar = botao({ icone: 'ui/mochila', tamanho: 24, texto: T.colocar.guardar, classe: 'cons-bt', aoClicar: largar(guardar) }); bGuardar.dataset.k = 'guardar';
  bCancelar = botao({ icone: 'ui/fechar', tamanho: 20, texto: T.colocar.cancelar, classe: 'cons-bt ruim', aoClicar: largar(cancelar) }); bCancelar.dataset.k = 'cancelar';
  bConfirmar = botao({ icone: 'icone/martelo', tamanho: 26, texto: T.colocar.confirmar, classe: 'cons-bt verde', aoClicar: largar(confirmar) }); bConfirmar.dataset.k = 'confirmar';
  barra.append(info, bGirar, bGuardar, bCancelar, bConfirmar);
  camada.append(toque, aviso, barra);
  ligarToques();
}

// ---------- o fantasma ----------
const casas = () => (modo && modo.def ? casasDe(modo.def, F.giro) : [1, 1]);
function conferir() {
  const m = J.mundo, loc = m.locais[F.local], cs = casas();
  F.nRuins = 0;
  if (modo.tipo === 'arrumar') { F.ok = true; modo.motivo = null; pintarBarra(); return; }
  const r = modo.tipo === 'mover' ? lugarServe(m, modo.id, F.x, F.z, { local: F.local, mudando: modo.e, giro: F.giro }) : podeConstruir(m, modo.id, F.x, F.z, { local: F.local, giro: F.giro });
  F.ok = r.ok; modo.motivo = r.ok ? null : r;
  if (!r.ok) {
    // as casas que, sozinhas, já não servem (fora da terra, ocupadas, com planta, na porta)
    const num = modo.e ? modo.e.num : -1;
    for (let z = F.z; z < F.z + cs[1]; z++) for (let x = F.x; x < F.x + cs[0]; x++) {
      const i = loc.dentro(x, z) ? loc.i(x, z) : -1;
      if (i < 0 || loc.propria[i] !== 1 || loc.chao[i] === SOLEIRA || (loc.ocupa[i] && loc.ocupa[i] !== num) || loc.plantas[i]) { F.ruins[F.nRuins * 2] = x; F.ruins[F.nRuins * 2 + 1] = z; F.nRuins++; }
    }
  }
  pintarBarra();
}
function levar(x, z) {
  const loc = J.mundo.locais[F.local], cs = casas();
  x = Math.max(0, Math.min(loc.l - cs[0], x)); z = Math.max(0, Math.min(loc.p - cs[1], z));
  if (x === F.x && z === F.z) return false;
  F.x = x; F.z = z;
  conferir();
  return true;
}
// o primeiro lugar que serve, em volta de (x, z), do mais perto para o mais longe; se nenhum serve, fica em (x, z)
function lugarPerto(x, z) {
  const m = J.mundo, cs = casas(), loc = m.locais[F.local];
  for (let r = 0; r < 9; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
    const cx = x + dx, cz = z + dz;
    if (cx < 0 || cz < 0 || cx + cs[0] > loc.l || cz + cs[1] > loc.p) continue;
    if (lugarServe(m, modo.id, cx, cz, { local: F.local, giro: F.giro }).ok) return [cx, cz];
  }
  return [x, z];
}

function custoEmTexto(m, def) {
  if (quantasGuardadas(m, def.id) > 0) return T.colocar.gratis;
  const c = def.custo, partes = [];
  if (!c) return '';
  if (c.ouro > 0) partes.push(numero(c.ouro) + ' ouro');
  for (const k in c.itens) partes.push(c.itens[k] + ' ' + m.dados.itens[k].nome.toLowerCase());
  return partes.join(' + ');
}
function pintarBarra() {
  if (!modo || !barra) return;
  const m = J.mundo, def = modo.def, arrumar = modo.tipo === 'arrumar';
  trocarIcone(ic, arrumar ? 'ui/mover' : 'objeto/' + (modo.id.startsWith('cerca') ? 'cerca-x' : modo.id));
  por(tNome, arrumar ? T.construir.arrumar : def.nome);
  let info = '', ruim = false;
  if (arrumar) info = T.colocar.escolha;
  else if (modo.motivo) { info = frase(modo.motivo.motivo, modo.motivo.dados, m.dados) || T.motivos['lugar-ocupado'](); ruim = true; }
  else if (modo.tipo === 'mover') info = T.colocar.bom;
  else info = (modo.seq && modo.postas ? T.colocar.postas(modo.postas) + ' · ' : '') + (modo.seq ? T.colocar.cada(def.custo ? def.custo.ouro : 0) + ' · ' : '') + custoEmTexto(m, def);
  por(tInfo, info); classe(tInfo, 'ruim', ruim);
  const gira = !arrumar && !!def.gira, guarda = modo.tipo === 'mover' && guardavel(def) && !(modo.e.obraAte > 0);
  if (bGirar.hidden !== !gira) bGirar.hidden = !gira;
  if (bGuardar.hidden !== !guarda) bGuardar.hidden = !guarda;
  if (bConfirmar.hidden !== arrumar) bConfirmar.hidden = arrumar;
  classe(bConfirmar, 'sem', !arrumar && !F.ok);
  por(bCancelar.lastChild, arrumar || (modo.seq && modo.postas > 0) ? T.colocar.pronto : T.colocar.cancelar);
  por(aviso, J.meio === 'teclas' ? (gira ? T.colocar.teclasGira : T.colocar.teclas) : arrumar ? T.colocar.escolha : modo.seq ? T.colocar.arrasteSeq : T.colocar.arraste);
}

// ---------- entrar e sair do modo ----------
function entrar(novo) {
  const m = J.mundo, p = m.personagem, cam = J.cena.cam;
  montar();
  fecharPainel(true);
  foco.sairDoMenu();
  m.comando({ tipo: 'frear' });
  const primeira = !modo;
  modo = novo;
  F.ligado = true; F.local = p.local; F.id = modo.id || ''; F.giro = modo.e ? modo.e.giro || 0 : 0; F.mudando = modo.e || null; F.cursor = modo.tipo === 'arrumar';
  if (modo.e) { F.x = modo.e.x; F.z = modo.e.z; }
  else if (modo.tipo === 'arrumar' && !primeira) { /* o cursor fica onde estava */ }
  else {
    // na frente dela (para o lado da câmera), no primeiro lugar que serve
    const cs = casas(), x = Math.round(p.x - cs[0] / 2), z = Math.round(p.z + 1);
    F.x = x; F.z = z;
    if (modo.tipo === 'novo') { const q = lugarPerto(x, z); F.x = q[0]; F.z = q[1]; }
  }
  const loc = m.locais[F.local], cs = casas();
  F.x = Math.max(0, Math.min(loc.l - cs[0], F.x)); F.z = Math.max(0, Math.min(loc.p - cs[1], F.z));
  if (primeira) {
    raiz.append(camada);
    document.body.classList.add('colocando');
    cam.seguindo = false; cam.fixa = true;
    J.cena.destaque.x = -1; J.cena.destaque.entidade = null;
  }
  seguirFantasma = true;
  conferir();
  som.tocar('abrir');
}
export function sairDaColocacao() {
  if (!modo) return;
  const cam = J.cena.cam;
  modo = null;
  F.ligado = false; F.mudando = null; F.cursor = false;
  camada.remove();
  document.body.classList.remove('colocando');
  cam.fixa = false; cam.seguindo = true;
  try { document.getElementById('tela').focus({ preventScroll: true }); } catch { /* sem foco */ }
}
export function comecarColocacao(id) {
  const m = J.mundo, def = defDe(m, id);
  if (!def) return false;
  if (def.onde !== m.personagem.local) { avisar(frase(def.onde === 'celeiro' ? 'so-no-celeiro' : 'so-na-fazenda', null, m.dados)); som.tocar('erro'); return false; }
  entrar({ tipo: 'novo', id, def, e: null, seq: emSequencia(def), postas: 0, volta: null, motivo: null });
  return true;
}
export function comecarMudanca(idEntidade, volta = null) {
  const m = J.mundo, e = construcaoPorId(m, idEntidade), def = e && defDe(m, e.tipo);
  if (!e || !def || e.local !== m.personagem.local) return false;
  if (def.inicial) { avisar(T.colocar.naoMuda); som.tocar('erro'); return false; }
  entrar({ tipo: 'mover', id: e.tipo, def, e, seq: false, postas: 0, volta, motivo: null });
  return true;
}
export function comecarArrumacao() {
  entrar({ tipo: 'arrumar', id: '', def: null, e: null, seq: false, postas: 0, volta: null, motivo: null });
  return true;
}

// ---------- o que os botões e as teclas fazem ----------
function girar() {
  if (!modo || !modo.def || !modo.def.gira) return;
  F.giro = F.giro ? 0 : 1;
  const loc = J.mundo.locais[F.local], cs = casas();
  F.x = Math.max(0, Math.min(loc.l - cs[0], F.x)); F.z = Math.max(0, Math.min(loc.p - cs[1], F.z));
  som.tocar('toque');
  conferir();
}
// o que há de seu na casa (x, z): primeiro o que tem altura, depois o calçamento
function construcaoEm(m, x, z) {
  let achou = null;
  for (const e of m.construcao.todas) {
    if (e.local !== F.local || x < e.x || z < e.z || x >= e.x + e.l || z >= e.z + e.p) continue;
    if (!achou || TIPOS[achou.tipo].plano) achou = e;
  }
  return achou;
}
function pegar(e) {
  if (!e) { avisar(T.colocar.nadaAqui); som.tocar('erro'); return; }
  comecarMudanca(e.id, 'arrumar');
}
function confirmar() {
  if (!modo) return;
  const m = J.mundo;
  if (modo.tipo === 'arrumar') { pegar(construcaoEm(m, F.x, F.z)); return; }
  if (modo.tipo === 'mover') {
    const r = m.comando({ tipo: 'moverConstrucao', entidade: modo.e.id, x: F.x, z: F.z, giro: F.giro });
    if (!r.ok) { conferir(); return; }
    som.tocar('guardar');
    if (modo.volta === 'arrumar') comecarArrumacao(); else sairDaColocacao();
    return;
  }
  const r = m.comando({ tipo: 'construir', id: modo.id, x: F.x, z: F.z, giro: F.giro });
  if (!r.ok) { conferir(); return; }
  if (!modo.seq) { sairDaColocacao(); return; }
  modo.postas++;
  conferir();
}
function cancelar() {
  if (!modo) return;
  som.tocar('fechar');
  if (modo.tipo === 'mover' && modo.volta === 'arrumar') comecarArrumacao(); else sairDaColocacao();
}
function guardar() {
  if (!modo || modo.tipo !== 'mover') return;
  const m = J.mundo, nome = modo.def.nome, r = m.comando({ tipo: 'guardarConstrucao', entidade: modo.e.id });
  if (!r.ok) return;
  avisar(T.cartao.guardou(nome), 'bom', 3600);
  som.tocar('guardar');
  if (modo.volta === 'arrumar') comecarArrumacao(); else sairDaColocacao();
}

// ---------- toque e mouse ----------
function ligarToques() {
  const cam = J.cena.cam, pt = { x: 0, y: 0 }, chao = [0, 0];
  const d1 = { id: -1, x: 0, y: 0, x0: 0, y0: 0 }, d2 = { id: -1, x: 0, y: 0 };
  let gesto = null, pincaDist = 0, pincaX = 0, pincaY = 0, pintou = false, andou = false;
  // a casa do canto da base para o centro do fantasma ficar debaixo do dedo
  const casaDoDedo = (x, y) => { const cs = casas(); cam.chao(x, y, chao); return [Math.round(chao[0] - cs[0] / 2), Math.round(chao[1] - cs[1] / 2)]; };
  function pintar(x, z) {
    // dedo rápido pula casas: preenche o caminho entre a última e esta
    const x0 = F.x, z0 = F.z, n = Math.max(Math.abs(x - x0), Math.abs(z - z0));
    for (let k = 1; k <= n; k++) { if (levar(Math.round(x0 + ((x - x0) * k) / n), Math.round(z0 + ((z - z0) * k) / n)) && F.ok) confirmar(); if (!modo) return; }
  }
  toque.addEventListener('pointerdown', (e) => {
    if (!modo) return;
    som.destravar(); e.preventDefault();
    tela.doPalco(e.clientX, e.clientY, pt);
    const mouse = e.pointerType === 'mouse';
    J.meio = mouse ? 'mouse' : 'toque';
    if (d1.id >= 0 && !mouse && d2.id < 0 && e.pointerId !== d1.id) {
      d2.id = e.pointerId; d2.x = pt.x; d2.y = pt.y; gesto = 'pinca';
      pincaDist = Math.hypot(d2.x - d1.x, d2.y - d1.y) || 1; pincaX = (d1.x + d2.x) / 2; pincaY = (d1.y + d2.y) / 2;
      return;
    }
    if (d1.id >= 0) return;
    d1.id = e.pointerId; d1.x = d1.x0 = pt.x; d1.y = d1.y0 = pt.y;
    try { toque.setPointerCapture(e.pointerId); } catch { /* sem captura */ }
    seguirFantasma = false; pintou = false; andou = false;
    if (mouse && e.button !== 0) { gesto = 'camera'; return; }
    if (modo.tipo === 'arrumar') { gesto = 'toque'; return; }
    gesto = 'fantasma';
    const c = casaDoDedo(pt.x, pt.y);
    levar(c[0], c[1]);
    pintarBarra();
  });
  toque.addEventListener('pointermove', (e) => {
    if (!modo) return;
    tela.doPalco(e.clientX, e.clientY, pt);
    if (gesto === 'pinca') {
      const d = e.pointerId === d1.id ? d1 : e.pointerId === d2.id ? d2 : null;
      if (!d) return;
      d.x = pt.x; d.y = pt.y;
      const dist = Math.hypot(d2.x - d1.x, d2.y - d1.y) || 1, mx = (d1.x + d2.x) / 2, my = (d1.y + d2.y) / 2;
      cam.arrastar(mx - pincaX, my - pincaY); cam.zoomEm(dist / pincaDist, mx, my, true);
      pincaDist = dist; pincaX = mx; pincaY = my;
      return;
    }
    if (e.pointerId !== d1.id) return;
    const dx = pt.x - d1.x, dy = pt.y - d1.y;
    d1.x = pt.x; d1.y = pt.y;
    if (Math.hypot(pt.x - d1.x0, pt.y - d1.y0) > 8) andou = true;
    if (gesto === 'camera' || (gesto === 'toque' && andou)) { gesto = 'camera'; cam.arrastar(dx, dy); return; }
    if (gesto !== 'fantasma') return;
    const c = casaDoDedo(pt.x, pt.y);
    if (modo.seq && andou) {
      if (!pintou) { pintou = true; if (F.ok) confirmar(); } // a casa onde o dedo começou
      if (modo) pintar(c[0], c[1]);
    } else levar(c[0], c[1]);
  });
  function soltar(e, cancelou) {
    if (e.pointerId === d2.id) { d2.id = -1; gesto = 'nada'; return; }
    if (e.pointerId !== d1.id) return;
    try { toque.releasePointerCapture(e.pointerId); } catch { /* sem captura */ }
    d1.id = -1;
    if (d2.id >= 0) { d1.id = d2.id; d1.x = d2.x; d1.y = d2.y; d2.id = -1; gesto = 'nada'; return; }
    const g = gesto;
    gesto = null;
    if (!modo || cancelou) return;
    if (g === 'toque' && !andou) {
      // modo de arrumar: o toque escolhe o que está debaixo do dedo (a figura; senão, a casa)
      const m = J.mundo, id = J.cena.entidadeEm(m, d1.x, d1.y);
      cam.chao(d1.x, d1.y, chao);
      const x = Math.floor(chao[0]), z = Math.floor(chao[1]);
      F.x = Math.max(0, Math.min(m.local.l - 1, x)); F.z = Math.max(0, Math.min(m.local.p - 1, z));
      pegar((id !== null && construcaoPorId(m, id)) || construcaoEm(m, x, z));
    } else if (g === 'fantasma' && modo.seq && !pintou && !andou && F.ok) confirmar(); // em sequência, um toque coloca um
  }
  toque.addEventListener('pointerup', (e) => soltar(e, false));
  toque.addEventListener('pointercancel', (e) => soltar(e, true));
  toque.addEventListener('contextmenu', (e) => e.preventDefault());
  toque.addEventListener('wheel', (e) => { e.preventDefault(); tela.doPalco(e.clientX, e.clientY, pt); cam.zoomEm(e.deltaY < 0 ? 1.14 : 1 / 1.14, pt.x, pt.y); }, { passive: false });

  // todo quadro: o dedo perto da borda leva a tela junto; nas teclas, a tela acompanha o fantasma
  registrarCamada('cima', (g, c, m, S, cena, dt) => {
    if (!modo) return;
    if (F.local !== m.personagem.local) { sairDaColocacao(); return; }
    relogio -= dt;
    if (relogio <= 0) { relogio = 0.25; conferir(); } // o mundo anda enquanto se escolhe (uma obra acaba, ela passa)
    const W = cam.w, H = cam.h, mg = 46;
    if (gesto === 'fantasma' && d1.id >= 0) {
      const vx = d1.x < mg ? 1 : d1.x > W - mg ? -1 : 0, vy = d1.y < mg + 30 ? 1 : d1.y > H - mg - 60 ? -1 : 0;
      if (vx || vy) {
        cam.arrastar(vx * 420 * dt, vy * 420 * dt);
        const q = casaDoDedo(d1.x, d1.y);
        if (modo.seq && pintou) pintar(q[0], q[1]); else levar(q[0], q[1]);
      }
    } else if (seguirFantasma) {
      const cs = casas(), fx = cam.cssX(F.x + cs[0] / 2, F.z + cs[1] / 2), fy = cam.cssY(F.x + cs[0] / 2, 0, F.z + cs[1] / 2);
      const ex = fx < W * 0.2 ? W * 0.2 - fx : fx > W * 0.8 ? W * 0.8 - fx : 0, ey = fy < H * 0.3 ? H * 0.3 - fy : fy > H * 0.62 ? H * 0.62 - fy : 0;
      if (ex || ey) { const k = Math.min(1, dt * 8 + (dt === 0 ? 1 : 0)); cam.arrastar(ex * k, ey * k); }
    }
  });
}

// ---------- teclado e controle remoto ----------
const PASSO = { ArrowRight: [1, 0], KeyD: [1, 0], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowDown: [0, 1], KeyS: [0, 1], ArrowUp: [0, -1], KeyW: [0, -1] };
const LIVRES = { Equal: 1, NumpadAdd: 1, Minus: 1, NumpadSubtract: 1, KeyF: 1, F5: 1, F11: 1, F12: 1 };
window.addEventListener('keydown', (e) => {
  if (!modo || e.ctrlKey || e.metaKey || e.altKey) return;
  if (LIVRES[e.code]) return; // zoom e tela cheia continuam valendo
  e.stopPropagation();
  const voltar = e.code === 'Escape' || e.code === 'Backspace' || e.key === 'BrowserBack' || e.key === 'GoBack' || e.keyCode === 461 || e.keyCode === 10009;
  J.meio = 'teclas';
  if (PASSO[e.code]) { e.preventDefault(); seguirFantasma = true; if (levar(F.x + PASSO[e.code][0], F.z + PASSO[e.code][1])) som.tocar('toque'); pintarBarra(); return; }
  if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') { e.preventDefault(); if (!e.repeat) confirmar(); return; }
  if (voltar) { e.preventDefault(); if (!e.repeat) cancelar(); return; }
  if ((e.code === 'KeyR' || e.code === 'KeyQ' || e.code === 'KeyE') && !e.repeat) { girar(); return; }
  if (e.code === 'KeyG' && !e.repeat) guardar();
}, true);

// ---------- controle de videogame, alavanca e botão de ação: os comandos de andar viram passos do fantasma ----------
let ultimoPasso = 0;
function passoDoRumo(c) {
  const agora = performance.now();
  if (agora - ultimoPasso < 170) return;
  const ax = Math.abs(c.dx), az = Math.abs(c.dz);
  let dx = 0, dz = 0;
  // na tela, direita é +X-Z e baixo é +X+Z: o direcional para o lado anda em X; para cima ou para baixo, em Z
  if (ax > az * 1.5) dx = Math.sign(c.dx); else if (az > ax * 1.5) dz = Math.sign(c.dz); else if (Math.sign(c.dx) !== Math.sign(c.dz)) dx = Math.sign(c.dx); else dz = Math.sign(c.dz);
  ultimoPasso = agora; seguirFantasma = true; J.meio = 'teclas';
  if (levar(F.x + dx, F.z + dz)) som.tocar('toque');
  pintarBarra();
}
const DESVIA = {
  rumar(c) { passoDoRumo(c); }, frear() { ultimoPasso = 0; }, correr() {},
  agir() { confirmar(); }, cancelar() { cancelar(); }, trocarModo() { girar(); },
  tocarCasa() {}, tocarEntidade() {}, irPara() {}, escolherModo() {},
};
aoInstalarMundo((m, ctx) => {
  hud = ctx.hud;
  if (modo) sairDaColocacao(); // o mundo foi trocado (gravação importada) no meio da escolha
  const mandar = m.comando.bind(m);
  m.comando = (c) => { if (modo && DESVIA[c.tipo]) { DESVIA[c.tipo](c); return { ok: true, desviado: true }; } return mandar(c); };
});
export { hud as hudDaColocacao };
