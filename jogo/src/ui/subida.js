// A tela de subida de nível: raios girando, o número pulando, o que foi ganho e o que foi liberado.
// Fecha no botão, com Enter, Espaço ou Esc. Se subir mais de um nível de uma vez, mostra um depois do outro.
import { el, icone, botao } from './dom.js';
import { T } from './textos.js';
import { J } from '../contexto.js';
import { fichasDaRecompensa } from './paineis/missoes.js';
import { som } from '../plataforma/som.js';
import { segurarAvisos } from './avisos.js';

const CORES = ['#f6c12c', '#41a85c', '#4aa9e6', '#e2452f', '#fff9ec'];
let raiz = null, aberta = null;
const fila = [];

export function prepararSubida(ui) { raiz = ui; }
export const subidaAberta = () => !!aberta;

export function mostrarSubida(d) {
  fila.push(d);
  if (!aberta) proxima();
}
function proxima() {
  const d = fila.shift();
  if (!d || !raiz) return;
  const D = J.dados;
  const veu = el('div', 'subida'), cartao = el('div', 'cartao');
  veu.append(el('div', 'raios'));
  for (let i = 0; i < 26; i++) {
    const c = el('i', 'confete');
    c.style.left = ((i * 37 + 11) % 100) + '%'; c.style.background = CORES[i % CORES.length];
    c.style.animationDuration = 2.4 + ((i * 7) % 10) / 5 + 's'; c.style.animationDelay = -((i * 13) % 30) / 10 + 's';
    veu.append(c);
  }
  cartao.append(el('div', 'faixa', T.subida.faixa), el('div', 'numero', String(d.nivel)));
  const r = d.recompensa;
  if (r && (r.ouro > 0 || r.cash > 0 || (r.itens && Object.keys(r.itens).length))) {
    cartao.append(el('div', 'rotulo', T.subida.ganhou));
    const fichas = fichasDaRecompensa(D, r); fichas.classList.add('lista');
    cartao.append(fichas);
  }
  if (d.liberou && d.liberou.length) {
    cartao.append(el('div', 'rotulo', T.subida.liberou));
    const lista = el('div', 'itens lista');
    d.liberou.slice(0, 8).forEach((x, i) => {
      const e = el('div', 'item'); e.style.animationDelay = 0.5 + i * 0.12 + 's';
      e.append(icone(x.item ? 'icone/' + (x.tipo === 'cultura' ? x.item : x.id) : 'icone/xp', 28), el('span', '', x.nome));
      lista.append(e);
    });
    cartao.append(lista);
  }
  const ok = botao({ texto: T.subida.continuar, classe: 'verde', aoClicar: fechar });
  ok.dataset.k = 'continuar';
  cartao.append(ok);
  veu.append(cartao);
  segurarAvisos(true); // os avisos esperam a tela fechar (não caem por cima do título)
  raiz.append(veu);
  aberta = veu;
  som.tocar('nivel');
  try { ok.focus({ preventScroll: true }); } catch { /* sem foco */ }
}
export function fecharSubida() { return fechar(); }
function fechar() {
  if (!aberta) return false;
  aberta.remove(); aberta = null;
  if (fila.length) proxima();
  else { segurarAvisos(false); const cv = document.getElementById('tela'); try { if (cv) cv.focus({ preventScroll: true }); } catch { /* sem foco */ } }
  return true;
}
