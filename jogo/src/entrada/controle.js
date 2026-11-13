// Controle de videogame: alavanca ou direcional andam, A age (segurar: a fileira do campo, ou a roda de ações do alvo
// com mais de uma), B fecha ou cancela, X ou gatilho correm, os ombros trocam o que está na mão, Y ou Start abrem o
// menu (foco nos botões da tela), a alavanca direita dá zoom.
import { J } from '../contexto.js';
import { foco } from './foco.js';
import { painelAberto, fecharPainel } from '../ui/paineis/registro.js';
import { subidaAberta, fecharSubida } from '../ui/subida.js';
import { som } from '../plataforma/som.js';

const MORTA = 0.28;

export function ligarControle(entrada) {
  let ligados = 0, rumando = false, repete = 0;
  const antes = new Uint8Array(20);
  const cmd = { tipo: 'rumar', dx: 0, dz: 0, forca: 1, correr: false };
  window.addEventListener('gamepadconnected', () => { ligados++; });
  window.addEventListener('gamepaddisconnected', () => { ligados = Math.max(0, ligados - 1); });

  // chamado todo quadro; sem controle ligado, não faz nada
  return function ler(dt) {
    if (!ligados || !navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    let pad = null;
    for (let i = 0; i < pads.length; i++) if (pads[i] && pads[i].connected) { pad = pads[i]; break; }
    if (!pad) return;
    const b = pad.buttons, ap = (i) => !!(b[i] && b[i].pressed);
    const deu = (i) => { const agora = ap(i) ? 1 : 0, foi = agora && !antes[i]; antes[i] = agora; return foi; };
    let sx = pad.axes[0] || 0, sy = pad.axes[1] || 0;
    if (ap(14)) sx = -1; else if (ap(15)) sx = 1;
    if (ap(12)) sy = -1; else if (ap(13)) sy = 1;
    const forca = Math.hypot(sx, sy);
    const segurava = !!antes[0], A = deu(0), B = deu(1), Y = deu(3) || deu(9), L = deu(4), R = deu(5);
    if (segurava && !ap(0)) entrada.agir.soltou('controle'); // soltou o A (também com a roda já aberta)
    if (A || B || Y || L || R || forca > MORTA) { J.meio = 'teclas'; entrada.usouTeclas(); som.destravar(); }

    if (subidaAberta() || painelAberto() || foco.menu || foco.popup) {
      if (rumando) { rumando = false; J.mundo.comando({ tipo: 'frear' }); }
      repete -= dt;
      if (forca > 0.6) { if (repete <= 0) { repete = 0.22; if (Math.abs(sx) > Math.abs(sy)) foco.mover(Math.sign(sx), 0); else foco.mover(0, Math.sign(sy)); } } else repete = 0;
      if (A) { if (!foco.clicar()) foco.mover(0, 1); }
      if (B || Y) { if (!fecharSubida() && !fecharPainel() && !foco.fecharPopup()) foco.sairDoMenu(); }
      return;
    }
    if (forca > MORTA) {
      cmd.dx = sx / 0.7071 + sy / 0.4082; cmd.dz = sy / 0.4082 - sx / 0.7071; // o mesmo rumo na tela que a alavanca aponta
      cmd.forca = Math.min(1, (forca - MORTA) / (0.9 - MORTA)); cmd.correr = ap(2) || ap(7);
      rumando = true;
      J.mundo.comando(cmd);
    } else if (rumando) { rumando = false; J.mundo.comando({ tipo: 'frear' }); }
    if (A) entrada.agir.apertou('controle'); // segurar o A: a fileira do campo, ou a roda
    if (B) J.mundo.comando({ tipo: 'cancelar' });
    if (L) J.mundo.comando({ tipo: 'trocarNaMao', passo: -1 });
    if (R) J.mundo.comando({ tipo: 'trocarNaMao', passo: 1 });
    if (Y) foco.entrarNoMenu();
    const zy = pad.axes[3] || 0;
    if (Math.abs(zy) > 0.4) entrada.zoom(1 - zy * dt * 1.2, true);
  };
}
