// Foco navegável pelas setas (teclado, controle de videogame e controle remoto de TV).
// Com painel ou tela de subida abertos, as setas andam pelos botões deles. Sem nada aberto, as setas andam com a
// personagem; "voltar" (Esc) ou Tab passam o foco para os botões do HUD (o "menu"), e voltar de novo devolve ao jogo.
// A roda de ações e a fileira da vaga "Na mão" (ui/acoes.js) são um "popup": enquanto abertos, as setas andam pelos
// botões deles e voltar fecha.
import { J } from '../contexto.js';

export const foco = {
  menu: false,
  popup: null, // o elemento aberto por cima do jogo (a roda, a fileira da vaga)
  fecharDoPopup: null,
  abrirPopup(e, fechar) { this.popup = e; this.fecharDoPopup = fechar; },
  // fecha o popup aberto (ou só esquece, se e não for ele); devolve true se havia um
  fecharPopup(e) {
    if (!this.popup || (e && e !== this.popup)) return false;
    const f = this.fecharDoPopup;
    this.popup = null; this.fecharDoPopup = null;
    if (!e && f) f();
    return true;
  },

  // onde as setas navegam agora: a tela de subida, o painel aberto, ou o HUD inteiro (no menu)
  escopo() {
    const ui = document.getElementById('ui');
    return ui.querySelector('.subida') || ui.querySelector('.veu') || this.popup || (this.menu ? (this.listaAberta && this.listaAberta()) || ui : null);
  },
  // o Menu do celular (ui/menu.js): a lista aberta, e fechar a lista (devolve true se estava aberta)
  listaAberta: null,
  fecharLista: null,
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
    const ui = document.getElementById('ui'), lista = this.listaAberta && this.listaAberta();
    const ativo = (lista && this.candidatos(lista)[0]) || ui.querySelector('.vaga-mao') || this.candidatos(ui)[0];
    if (ativo) this.focar(ativo);
    J.mundo.comando({ tipo: 'frear' });
  },
  sairDoMenu() {
    if (this.fecharLista && this.fecharLista()) return true; // a lista do Menu fecha primeiro
    if (!this.menu) return false;
    this.menu = false;
    document.body.classList.remove('menu');
    const cv = document.getElementById('tela');
    try { cv.focus({ preventScroll: true }); } catch { /* sem foco */ }
    return true;
  },
};
