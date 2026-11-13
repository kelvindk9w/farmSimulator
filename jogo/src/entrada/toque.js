// Toque e mouse no canvas. Tocar = a ação natural do alvo (nucleo/sistemas/acoes.js: arar, plantar o que está na
// mão, regar, colher, limpar, abrir...), ou andar até lá; anel no ponto tocado. Apertando, a casa fica marcada e o
// balãozinho mostra a ação (ui/acoes.js); ela acontece ao soltar. Alvo com mais de uma ação: abre a roda de ações.
// Arrastar a partir do campo ou de uma planta repete a ação da primeira casa nas casas por onde o dedo passa (arar,
// plantar, regar; nunca colher, limpar nem abrir); de outro lugar, o dedo vira alavanca (anda para onde arrasta) e o
// mouse move a câmera. Dois dedos: pinça dá zoom e desloca a câmera. Roda do mouse: zoom.
// O esquema das configurações muda o toque: "só toque" (sem alavanca: arrastar fora do campo move a câmera),
// "alavanca" (o chão não recebe ordens: só a alavanca e o botão de ação) ou "os dois".
import { J } from '../contexto.js';
import { KX, KY } from '../render/camera.js';
import { TIPOS } from '../nucleo/registro.js';
import { acoesDoAlvo } from '../nucleo/sistemas/acoes.js';
import { acoesUi, pedeRoda } from '../ui/acoes.js';
import { foco } from './foco.js';
import { tela } from '../plataforma/tela.js';
import { som } from '../plataforma/som.js';
import { el } from '../ui/dom.js';

const RAIO = 46; // curso da alavanca, em pontos de CSS
const SOLTA = 10; // quanto o dedo anda antes de o toque virar arrasto

export function ligarToque(entrada, hud) {
  const cv = J.cena.cv, cam = J.cena.cam;
  const pt = { x: 0, y: 0 }, chao = [0, 0];
  const d1 = { id: -1, x: 0, y: 0, x0: 0, y0: 0 }, d2 = { id: -1, x: 0, y: 0 };
  let gesto = null; // null | 'toque' | 'pintar' | 'alavanca' | 'camera' | 'pinca' | 'nada'
  let pincaDist = 0, pincaX = 0, pincaY = 0, ultX = -1, ultZ = -1, botao = 0, mouse = false;
  let modoArrasto = null; // o modo que o arrasto repete (o da ação da casa onde o dedo apertou), ou null: o arrasto anda
  const cmd = { tipo: 'rumar', dx: 0, dz: 0, forca: 1, correr: false }, cmdCasa = { tipo: 'agirNoAlvo', x: 0, z: 0, arrasto: true, modo: null };

  // alavanca solta: aparece onde o dedo começou a arrastar
  const solta = el('div', 'alavanca solta'), pinoSolto = el('i'); solta.append(pinoSolto); solta.hidden = true; hud.raiz.append(solta);
  let pino = null;

  function rumar(dx, dy) {
    const len = Math.hypot(dx, dy), f = Math.min(1, len / (RAIO * (J.esc || 1))); // (o #ui cresce pelo zoom no computador: J.esc)
    if (pino) pino.style.transform = len > 0 ? `translate(${(dx / len) * f * RAIO}px, ${(dy / len) * f * RAIO}px)` : '';
    if (f < 0.2) { J.mundo.comando({ tipo: 'frear' }); return; }
    // o mesmo rumo na tela que o dedo aponta
    cmd.dx = dx / KX + dy / KY; cmd.dz = dy / KY - dx / KX; cmd.forca = Math.max(0.35, f); cmd.correr = f > 0.92;
    J.mundo.comando(cmd);
  }
  function soltarAlavanca() {
    if (pino) pino.style.transform = '';
    pino = null; solta.hidden = true;
    J.mundo.comando({ tipo: 'frear' });
    J.mundo.comando({ tipo: 'correr', ligado: false });
  }

  // a entidade (construção) ou a casa sob o ponto
  function alvoEm(x, y, out) {
    const m = J.mundo;
    cam.chao(x, y, chao);
    out.x = Math.floor(chao[0]); out.z = Math.floor(chao[1]); out.fx = chao[0]; out.fz = chao[1];
    let id = J.cena.entidadeEm(m, x, y);
    if (id !== null && TIPOS[m.local.porId[id].tipo].obstaculo) id = null; // mato e árvore não tapam o toque na casa de trás
    if (id === null) { const e = m.local.entidadeEm(out.x, out.z); if (e) id = e.id; }
    out.entidade = id;
    return out;
  }
  const alvo = { x: 0, z: 0, fx: 0, fz: 0, entidade: null };

  function tocar(x, y) {
    const m = J.mundo;
    alvoEm(x, y, alvo);
    if (!m.local.dentro(alvo.x, alvo.z) && alvo.entidade === null) return;
    const a = alvo.entidade !== null ? { entidade: alvo.entidade } : { x: alvo.x, z: alvo.z };
    // mais de uma ação (o curral, a indústria com produto pronto): a roda, e a escolha é no botão dela
    const lista = alvo.entidade !== null && !document.body.classList.contains('colocando') ? acoesDoAlvo(m, a) : null;
    if (lista && pedeRoda(lista) && acoesUi.abrirRoda(a, lista)) return;
    const r = m.comando({ tipo: 'agirNoAlvo', ...a });
    J.cena.part.anel(alvo.fx, alvo.fz, r.ok ? '#ffffff' : '#ffb39a');
    som.tocar(r.ok ? 'toque' : 'erro');
  }
  function pintar(x, y) {
    cam.chao(x, y, chao);
    const cx = Math.floor(chao[0]), cz = Math.floor(chao[1]);
    if (cx === ultX && cz === ultZ) return;
    // dedo rápido pula casas: preenche o caminho entre a última e esta
    const n = ultX < 0 ? 1 : Math.max(Math.abs(cx - ultX), Math.abs(cz - ultZ));
    for (let k = 1; k <= n; k++) {
      cmdCasa.x = ultX < 0 ? cx : Math.round(ultX + ((cx - ultX) * k) / n); cmdCasa.z = ultX < 0 ? cz : Math.round(ultZ + ((cz - ultZ) * k) / n); cmdCasa.modo = modoArrasto;
      const r = J.mundo.comando(cmdCasa);
      if (r.ok && !r.repetida) som.tocar('toque');
    }
    ultX = cx; ultZ = cz;
    entrada.destacar(cx, cz, null);
  }

  cv.addEventListener('pointerdown', (e) => {
    som.destravar();
    foco.sairDoMenu();
    try { cv.focus({ preventScroll: true }); } catch { /* sem foco */ }
    tela.doPalco(e.clientX, e.clientY, pt);
    mouse = e.pointerType === 'mouse';
    J.meio = mouse ? 'mouse' : 'toque';
    entrada.usouPonteiro();
    if (d1.id >= 0 && !mouse && d2.id < 0 && e.pointerId !== d1.id) {
      // segundo dedo: pinça
      if (gesto === 'alavanca') soltarAlavanca();
      d2.id = e.pointerId; d2.x = pt.x; d2.y = pt.y;
      gesto = 'pinca';
      pincaDist = Math.hypot(d2.x - d1.x, d2.y - d1.y) || 1; pincaX = (d1.x + d2.x) / 2; pincaY = (d1.y + d2.y) / 2;
      entrada.destacar(-1, -1, null);
      entrada.fileira.cancelar('dedo');
      return;
    }
    if (d1.id >= 0) return;
    d1.id = e.pointerId; d1.x = d1.x0 = pt.x; d1.y = d1.y0 = pt.y;
    botao = e.button;
    try { cv.setPointerCapture(e.pointerId); } catch { /* sem captura */ }
    if (mouse && botao !== 0) { gesto = 'camera'; e.preventDefault(); return; }
    gesto = 'toque'; ultX = ultZ = -1; modoArrasto = null;
    if (mouse || J.prefs.esquema !== 'alavanca') {
      alvoEm(pt.x, pt.y, alvo); entrada.destacar(alvo.x, alvo.z, alvo.entidade);
      if (alvo.entidade === null) {
        const o = acoesDoAlvo(J.mundo, alvo)[0];
        if (o && o.ok && o.arrasta && o.modo) modoArrasto = o.modo; // arrastar daqui repete esta ação (o campo, as plantas)
        entrada.fileira.apertou('dedo', alvo.x, alvo.z); // segurar parado numa casa do campo: a fileira
      }
    }
  });

  cv.addEventListener('pointermove', (e) => {
    tela.doPalco(e.clientX, e.clientY, pt);
    if (e.pointerType === 'mouse' && d1.id < 0) { J.meio = 'mouse'; entrada.usouPonteiro(); alvoEm(pt.x, pt.y, alvo); entrada.destacar(alvo.x, alvo.z, alvo.entidade); return; }
    if (gesto === 'pinca') {
      const d = e.pointerId === d1.id ? d1 : e.pointerId === d2.id ? d2 : null;
      if (!d) return;
      d.x = pt.x; d.y = pt.y;
      const dist = Math.hypot(d2.x - d1.x, d2.y - d1.y) || 1, mx = (d1.x + d2.x) / 2, my = (d1.y + d2.y) / 2;
      cam.arrastar(mx - pincaX, my - pincaY);
      cam.zoomEm(dist / pincaDist, mx, my, true);
      pincaDist = dist; pincaX = mx; pincaY = my;
      return;
    }
    if (e.pointerId !== d1.id) return;
    const dx = pt.x - d1.x, dy = pt.y - d1.y;
    d1.x = pt.x; d1.y = pt.y;
    if (gesto === 'toque' && Math.hypot(pt.x - d1.x0, pt.y - d1.y0) > (mouse ? 6 : SOLTA)) {
      entrada.fileira.cancelar('dedo'); // mexeu: não é mais segurar
      const ferramenta = !!modoArrasto, esquema = J.prefs.esquema;
      if (mouse) gesto = ferramenta ? 'pintar' : 'camera';
      else if (esquema === 'alavanca') gesto = 'alavanca';
      else if (ferramenta) gesto = 'pintar';
      else gesto = esquema === 'toque' ? 'camera' : 'alavanca';
      if (gesto === 'pintar') pintar(d1.x0, d1.y0);
      if (gesto === 'alavanca') { solta.style.transform = `translate(${d1.x0 / (J.esc || 1)}px, ${d1.y0 / (J.esc || 1)}px)`; solta.hidden = false; pino = pinoSolto; entrada.destacar(-1, -1, null); }
      if (gesto === 'camera') entrada.destacar(-1, -1, null);
    }
    if (gesto === 'pintar') pintar(pt.x, pt.y);
    else if (gesto === 'alavanca') rumar(pt.x - d1.x0, pt.y - d1.y0);
    else if (gesto === 'camera') cam.arrastar(dx, dy);
  });

  function soltar(e, cancelou) {
    if (e.pointerId === d2.id) { d2.id = -1; gesto = 'nada'; entrada.guardarZoom(); return; }
    if (e.pointerId !== d1.id) return;
    try { cv.releasePointerCapture(e.pointerId); } catch { /* sem captura */ }
    d1.id = -1;
    if (d2.id >= 0) { d1.id = d2.id; d1.x = d2.x; d1.y = d2.y; d2.id = -1; gesto = 'nada'; entrada.guardarZoom(); return; }
    const g = gesto;
    gesto = null;
    if (g === 'alavanca') soltarAlavanca();
    else if (g === 'toque' && !cancelou && (mouse || J.prefs.esquema !== 'alavanca')) { if (!entrada.fileira.soltou('dedo')) tocar(d1.x, d1.y); }
    entrada.fileira.cancelar('dedo');
    if (!mouse) entrada.destacar(-1, -1, null, 0.3);
  }
  cv.addEventListener('pointerup', (e) => soltar(e, false));
  cv.addEventListener('pointercancel', (e) => soltar(e, true));
  cv.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && d1.id < 0) entrada.destacar(-1, -1, null); });
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  cv.addEventListener('wheel', (e) => {
    e.preventDefault();
    tela.doPalco(e.clientX, e.clientY, pt);
    cam.zoomEm(e.deltaY < 0 ? 1.14 : 1 / 1.14, pt.x, pt.y);
    entrada.guardarZoom();
  }, { passive: false });

  // alavanca fixa (canto de baixo, à esquerda): o dedo que começa nela anda com a personagem em qualquer modo
  const fixa = hud.alavanca;
  let dedoFixo = -1, fx = 0, fy = 0;
  fixa.addEventListener('pointerdown', (e) => {
    som.destravar(); e.preventDefault();
    J.meio = 'teclas'; entrada.usouTeclas();
    dedoFixo = e.pointerId; pino = hud.pino;
    try { fixa.setPointerCapture(e.pointerId); } catch { /* sem captura */ }
    tela.doPalco(e.clientX, e.clientY, pt);
    // o centro da alavanca, em pontos do palco
    let x = fixa.offsetWidth / 2, y = fixa.offsetHeight / 2;
    for (let n = fixa; n && n.id !== 'palco'; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
    fx = x * (J.esc || 1); fy = y * (J.esc || 1); // (offsetLeft é em pontos do #ui, que cresce pelo zoom)
    rumar(pt.x - fx, pt.y - fy);
  });
  fixa.addEventListener('pointermove', (e) => { if (e.pointerId !== dedoFixo) return; tela.doPalco(e.clientX, e.clientY, pt); pino = hud.pino; rumar(pt.x - fx, pt.y - fy); });
  const soltarFixa = (e) => { if (e.pointerId !== dedoFixo) return; dedoFixo = -1; pino = hud.pino; soltarAlavanca(); };
  fixa.addEventListener('pointerup', soltarFixa);
  fixa.addEventListener('pointercancel', soltarFixa);
}
