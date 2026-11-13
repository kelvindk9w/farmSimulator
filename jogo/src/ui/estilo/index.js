// O visual aprovado da interface (arte/mockups/interface/APROVADO.md), por cima do CSS antigo do index.html:
//   - põe o CSS de estilo/hud.js, estilo/paineis.js e estilo/telas.js numa <style> só (o build só leva .js);
//   - as molduras vêm de dist/molduras/ (inteiras) ou dist/molduras/m/ (pela metade, na qualidade "leve");
//   - a escala: o celular deitado (844 x 390) é a medida do desenho; no computador, no tablet grande e na TV o #ui
//     inteiro cresce pelo zoom (--esc), para os botões não ficarem miúdos. J.esc guarda o fator: quem põe coisa
//     dentro do #ui a partir de pontos da tela (a alavanca, o balão) divide por ele;
//   - #ui.compacto: tela baixa ou estreita (celular deitado). Só Mochila, Loja, Construir e Menu ficam à vista.
import { J } from '../../contexto.js';
import { tela } from '../../plataforma/tela.js';
import { variaveis } from './pecas.js';
import { CSS_HUD } from './hud.js';
import { CSS_PAINEIS } from './paineis.js';
import { CSS_TELAS } from './telas.js';

// a tela do desenho tem 1100 x 560 pontos "de computador" (cabem as pílulas e os oito botões do alto numa fila só);
// abaixo disso não encolhe (o celular é a medida certa)
const BASE_L = 1100, BASE_A = 560, MAX = 2.4;
// abaixo disto (em pontos já divididos pela escala) o alto direito vira Menu
const COMPACTO_A = 500, COMPACTO_L = 1000;

let raiz = null, ultW = -1, ultH = -1;

export function escalaPara(w, h) { return Math.round(Math.max(1, Math.min(w / BASE_L, h / BASE_A, MAX)) * 100) / 100; }

export function prepararEstilo(ui) {
  raiz = ui;
  if (!document.getElementById('estilo-interface')) {
    const s = document.createElement('style');
    s.id = 'estilo-interface';
    s.textContent = variaveis() + CSS_HUD + CSS_PAINEIS + CSS_TELAS;
    document.head.append(s);
  }
  document.body.classList.toggle('leve', !!(J.atlas && J.atlas.leve));
  J.esc = 1;
  ajustarEscala(true);
}

// confere o tamanho da tela (o HUD chama a cada quadro; só mexe quando mudou)
export function ajustarEscala(forcar) {
  if (!raiz) return false;
  let w = tela.w, h = tela.h;
  if (!w || !h) { w = window.innerWidth; h = window.innerHeight; if (h > w) [w, h] = [h, w]; }
  if (!forcar && w === ultW && h === ultH) return false;
  ultW = w; ultH = h;
  const e = escalaPara(w, h);
  J.esc = e;
  raiz.style.setProperty('--esc', String(e));
  const compacto = h / e < COMPACTO_A || w / e < COMPACTO_L;
  raiz.classList.toggle('compacto', compacto);
  for (const f of aoMudarEscala) f(e, compacto);
  return true;
}
export const aoMudarEscala = [];
export const compacto = () => !!raiz && raiz.classList.contains('compacto');
