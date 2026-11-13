// Foco navegável pelas setas (teclado, controle de videogame e controle remoto de TV).
// Com painel ou tela de subida abertos, as setas andam pelos botões deles. Sem nada aberto, as setas andam com a
// personagem; "voltar" (Esc) ou Tab passam o foco para os botões do HUD (o "menu"), e voltar de novo devolve ao jogo.
import { J } from '../contexto.js';

export const foco = {
  menu: false,

  // onde as setas navegam agora: a tela de subida, o painel aberto, ou o HUD inteiro (no menu)
  escopo() {
    const ui = document.getElementById('ui');
    return ui.querySelector('.subida') || ui.querySelector('.veu') || (this.menu ? ui : null);
  },
  candidatos(raiz) {
    const out = [];
    for (const e of raiz.querySelectorAll('button, textarea')) if (!e.disabled && !e.hidden && e.offsetParent !== null && !e.closest('[hidden]')) out.push(e);
    return out;
  },
  // anda para o botão mais próximo na direção pedida; devolve true se achou para onde ir
  mover(dx, dy) {
    const raiz = this.escopo();
    if (!raiz) return false;
    const lista = this.candidatos(raiz);
    if (!lista.length) return false;
    const atual = document.activeElement && raiz.contains(document.activeElement) && lista.includes(document.activeElement) ? document.activeElement : null;
    if (!atual) { this.focar(lista[0]); return true; }
    const a = atual.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let melhor = null, nota = Infinity;
    for (const e of lista) {
      if (e === atual) continue;
      const r = e.getBoundingClientRect(), ex = r.left + r.width / 2, ey = r.top + r.height / 2;
      const frente = (ex - ax) * dx + (ey - ay) * dy, lado = Math.abs((ex - ax) * dy) + Math.abs((ey - ay) * dx);
      if (frente < 4) continue;
      // quem se sobrepõe na direção perpendicular (mesma linha ou coluna) tem preferência
      const alinhado = dx ? r.top < a.bottom && r.bottom > a.top : r.left < a.right && r.right > a.left;
      const n = frente + lado * (alinhado ? 0.6 : 2.4);
      if (n < nota) { nota = n; melhor = e; }
    }
    if (melhor) this.focar(melhor);
    return !!melhor;
  },
  focar(e) {
    try { e.focus({ preventScroll: true }); e.classList.add('foco-teclas'); if (e.scrollIntoView) e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch { /* sem foco */ }
  },
  clicar() {
    const e = document.activeElement;
    if (e && e.tagName === 'BUTTON' && this.escopo() && this.escopo().contains(e)) { e.click(); return true; }
    return false;
  },
  entrarNoMenu() {
    this.menu = true;
    document.body.classList.add('menu');
    const ui = document.getElementById('ui'), ativo = ui.querySelector('.modo.ativo') || this.candidatos(ui)[0];
    if (ativo) this.focar(ativo);
    J.mundo.comando({ tipo: 'frear' });
  },
  sairDoMenu() {
    if (!this.menu) return false;
    this.menu = false;
    document.body.classList.remove('menu');
    const cv = document.getElementById('tela');
    try { cv.focus({ preventScroll: true }); } catch { /* sem foco */ }
    return true;
  },
};
