// O Menu do alto, à direita. No celular deitado (#ui.compacto) só Mochila, Loja, Construir e Menu ficam à vista;
// o Menu abre uma lista com Correio, Missões, Minha fazenda, Configurações e Tela cheia, e ganha a bolinha vermelha
// quando algum deles tem novidade. No computador, no tablet e na TV a lista vira uma fileira de botões ao lado
// (os oito à vista) e o botão Menu some. Os botões são os mesmos nos dois jeitos (mesmos data-painel e data-k).
//   hud.menu.por(botao, rotulo, primeiro)  põe um botão na lista (com o nome por extenso, que só a lista mostra)
//   hud.alvo(botao)                          o que a seta do tutorial aponta: o próprio botão, ou o Menu se ele
//                                            está dentro da lista fechada
// Teclado, controle e TV: o Menu é um botão como os outros; aberta a lista, as setas andam só nela e "voltar" fecha.
import { el, botao } from './dom.js';
import './textos/interface.js';
import { T } from './textos.js';
import { som } from '../plataforma/som.js';
import { foco } from '../entrada/foco.js';
import { aoMudarPainel } from './paineis/registro.js';
import { aoMudarEscala, compacto } from './estilo/index.js';

export function criarMenu(hud, dir) {
  const lista = el('div', 'menu-lista');
  lista.id = 'menu-lista';
  const bMenu = botao({ icone: 'ui/menu', tamanho: 32, texto: T.menu.botao, classe: 'quadrado menu', rotulo: T.menu.abrir, aoClicar: () => { som.tocar(aberto() ? 'fechar' : 'toque'); abrir(!aberto()); } });
  bMenu.dataset.k = 'menu';
  bMenu.setAttribute('aria-haspopup', 'true'); bMenu.setAttribute('aria-expanded', 'false'); bMenu.setAttribute('aria-controls', 'menu-lista');
  const ponto = el('span', 'ponto'); ponto.hidden = true; bMenu.append(ponto);
  dir.append(bMenu, lista);

  const aberto = () => dir.classList.contains('menu-aberto');
  function abrir(sim) {
    if (sim && !compacto()) sim = false;
    if (aberto() === sim) return;
    dir.classList.toggle('menu-aberto', sim);
    bMenu.setAttribute('aria-expanded', String(sim));
    // quem chegou pelo teclado ou pelo controle continua nele: o foco entra na lista (e volta ao Menu ao fechar)
    if (sim && foco.menu) { const b = foco.candidatos(lista)[0]; if (b) foco.focar(b); }
    else if (!sim && lista.contains(document.activeElement)) foco.focar(bMenu);
  }
  // escolheu um item: a lista fecha (o painel abre por cima)
  lista.addEventListener('click', (e) => { if (e.target.closest('button')) abrir(false); });
  // tocar fora fecha (e o toque no chão não vira ordem para a personagem)
  document.addEventListener('pointerdown', (e) => {
    if (!aberto() || dir.contains(e.target)) return;
    abrir(false);
    if (e.target && e.target.id === 'tela') { e.stopPropagation(); e.preventDefault(); }
  }, true);
  aoMudarPainel.push(() => abrir(false));
  aoMudarEscala.push((esc, comp) => { if (!comp) abrir(false); });

  // a bolinha do Menu: alguma bolinha acesa lá dentro
  function conferirPonto() {
    const tem = !!lista.querySelector('.ponto:not([hidden])');
    if (ponto.hidden === tem) { ponto.hidden = !tem; bMenu.setAttribute('aria-label', tem ? T.menu.novidade : T.menu.abrir); bMenu.title = bMenu.getAttribute('aria-label'); }
  }
  new MutationObserver(conferirPonto).observe(lista, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden'] });

  // o teclado e o controle (entrada/foco.js): com a lista aberta, as setas andam só nela; "voltar" fecha
  foco.listaAberta = () => (aberto() ? lista : null);
  foco.fecharLista = () => { if (!aberto()) return false; abrir(false); foco.focar(bMenu); return true; };

  hud.menu = {
    botao: bMenu, lista, aberto, abrir: () => abrir(true), fechar: () => abrir(false),
    por(b, rotulo, primeiro) {
      if (!b.querySelector('.rotulo-menu')) b.append(el('span', 'rotulo-menu', rotulo));
      if (primeiro) lista.prepend(b); else lista.append(b);
      conferirPonto();
    },
  };
  hud.alvo = (e) => (e && lista.contains(e) && compacto() && !aberto() ? bMenu : e);
  return hud.menu;
}
