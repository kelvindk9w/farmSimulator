// Os painéis do jogo (loja, mochila, missões, configurações...). Cada um se registra no seu arquivo:
//   registrarPainel({ id, titulo, icone, ordem, botao, montar(corpo, ctx, arg) → { atualizar(), aoFechar() } })
//   ctx = { saldo (elemento do cabeçalho para mostrar ouro, por exemplo), fechar() }
// Um painel aberto por vez. Fecha no botão, tocando fora, com Esc e com o botão de voltar.
import { el, botao, icone } from '../dom.js';
import { T } from '../textos.js';
import { som } from '../../plataforma/som.js';

export const PAINEIS = {};
export function registrarPainel(p) {
  if (PAINEIS[p.id]) throw new Error(`painel "${p.id}" registrado duas vezes`);
  PAINEIS[p.id] = { ordem: 50, botao: true, ...p };
}

let raiz = null, aberto = null, sujo = false;
export const aoMudarPainel = []; // quem quer saber que abriu ou fechou (o tutorial esconde a seta, por exemplo)
export function prepararPaineis(ui) { raiz = ui; }
export const painelAberto = () => (aberto ? aberto.id : null);

export function abrirPainel(id, arg) {
  const p = PAINEIS[id];
  if (!p || !raiz) return false;
  if (aberto) fecharPainel(true);
  const veu = el('div', 'veu'), cartao = el('div', 'cartao'), cab = el('header'), corpo = el('div', 'corpo');
  const saldo = el('span', 'saldo');
  const fechar = botao({ icone: 'ui/fechar', tamanho: 22, classe: 'quadrado fechar', rotulo: T.botoes.fechar, aoClicar: () => fecharPainel() });
  cab.append(icone(p.icone, 28), el('span', 'titulo', p.titulo), saldo, fechar);
  cartao.append(cab, corpo); veu.append(cartao);
  veu.dataset.painel = id;
  veu.addEventListener('pointerdown', (e) => { if (e.target === veu) fecharPainel(); });
  raiz.append(veu);
  aberto = { id, veu, corpo, api: null };
  document.body.classList.add('com-painel');
  aberto.api = p.montar(corpo, { saldo, fechar: fecharPainel }, arg) || {};
  // o foco entra no painel (TV e teclado andam pelos botões com as setas)
  const primeiro = corpo.querySelector('button:not([disabled])') || fechar;
  try { primeiro.focus({ preventScroll: true }); } catch { /* sem foco */ }
  som.tocar('abrir');
  for (const f of aoMudarPainel) f(id);
  return true;
}

export function fecharPainel(semSom) {
  if (!aberto) return false;
  const a = aberto;
  aberto = null;
  if (a.api.aoFechar) a.api.aoFechar();
  a.veu.remove();
  document.body.classList.remove('com-painel');
  if (semSom !== true) som.tocar('fechar');
  const cv = document.getElementById('tela');
  try { if (cv) cv.focus({ preventScroll: true }); } catch { /* sem foco */ }
  for (const f of aoMudarPainel) f(null);
  return true;
}

// o mundo mudou: o painel aberto se refaz no próximo quadro (uma vez só, por mais eventos que cheguem)
export function sujarPainel() { sujo = true; }
export function atualizarPainel() {
  if (!sujo) return;
  sujo = false;
  if (!aberto || !aberto.api.atualizar) return;
  // refazer a lista não pode perder o foco de quem navega pelas setas
  const ativo = document.activeElement, chave = ativo && aberto.veu.contains(ativo) ? ativo.dataset.k : null;
  aberto.api.atualizar();
  if (chave) { const b = aberto.corpo.querySelector(`[data-k="${chave}"]`); try { if (b) b.focus({ preventScroll: true }); else aberto.veu.querySelector('.fechar').focus({ preventScroll: true }); } catch { /* sem foco */ } }
}
