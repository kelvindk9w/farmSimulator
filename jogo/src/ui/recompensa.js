// A tela de recompensa: o baú abre, os prêmios pulam um a um, raios e confete, e o botão "Receber" já com o foco.
// É a tela de subida de nível do M1, generalizada. Variantes (campo "tipo"):
//   nivel      o número do nível novo, o que ganhou e o que liberou
//   conquista  o troféu, o nome da conquista e o marco
//   presente   o presente do dia (dia N)
//   missao     missão com prêmio grande (ferramenta, recipiente, cash)
//   convite    o presente de quem entrou por um convite          amigo   o presente por um amigo que chegou
//   compra     o cash de uma compra simulada
// Só aparece quando algo foi ganho (recompensa vazia não abre nada, a não ser o nível). Várias ao mesmo tempo
// entram na fila e saem uma depois da outra. Fecha no botão, com Enter, Espaço ou Esc.
//   mostrarRecompensa({ tipo, faixa, titulo, sub, numero, icone, recompensa: { ouro, cash, xp, itens, animais }, liberou: [...], rodape })
import { el, icone, botao } from './dom.js';
import './textos/progresso.js';
import { T, numero } from './textos.js';
import { J } from '../contexto.js';
import { som } from '../plataforma/som.js';
import { segurarAvisos } from './avisos.js';
import { prepararDialogo, dialogoAberto, aoFecharDialogo } from './dialogo.js';

const CORES = ['#f6c12c', '#41a85c', '#4aa9e6', '#e2452f', '#fff9ec'];
const SEM_BAU = { nivel: 1 };
let raiz = null, aberta = null;
const fila = [], relogios = [];

export function prepararRecompensa(ui) { raiz = ui; prepararDialogo(ui); }
// linhas a mais embaixo dos prêmios: cada frente põe (d) → texto | null (ui/fontes.js: para que serve o material ganho)
export const NOTAS_DA_RECOMPENSA = [];
export const recompensaAberta = () => !!aberta;
export const recompensasNaFila = () => fila.length + (aberta ? 1 : 0);

const temAlgo = (r) => !!r && (r.ouro > 0 || r.cash > 0 || r.xp > 0 || (!!r.itens && Object.keys(r.itens).length > 0) || (!!r.animais && Object.keys(r.animais).length > 0));

export function mostrarRecompensa(d) {
  if (!d || (d.tipo !== 'nivel' && !temAlgo(d.recompensa))) return false; // nunca cobre o jogo sem ter ganhado nada
  fila.push(d);
  if (!aberta && !dialogoAberto()) proxima();
  return true;
}
aoFecharDialogo.push(() => { if (!aberta && fila.length) proxima(); });

// os prêmios em fichas, uma por vez: ouro, cash, experiência e cada item
function fichas(r, atraso) {
  const D = J.dados, caixa = el('div', 'itens lista premios');
  let i = 0;
  const ficha = (ic, texto) => { const e = el('div', 'item premio'); e.style.animationDelay = atraso + i++ * 0.16 + 's'; e.append(icone(ic, 30), el('span', '', texto)); caixa.append(e); };
  if (r.ouro > 0) ficha('icone/ouro', numero(r.ouro));
  if (r.cash > 0) ficha('icone/cash', numero(r.cash));
  if (r.xp > 0) ficha('icone/xp', `${numero(r.xp)} ${T.subida.xp}`);
  for (const k in r.animais || {}) if (D.animais && D.animais[k]) ficha('animal/' + k + '/parada-frente', `${r.animais[k] > 1 ? r.animais[k] + ' × ' : ''}${D.animais[k].nome}`);
  for (const k in r.itens || {}) ficha('icone/' + k, `${r.itens[k] > 1 ? r.itens[k] + ' × ' : ''}${D.itens[k] ? D.itens[k].nome : k}`);
  return caixa;
}

function proxima() {
  const d = fila.shift();
  if (!d || !raiz) return;
  const tipo = d.tipo || 'presente', R = T.recompensa;
  const veu = el('div', 'subida recompensa tipo-' + tipo), cartao = el('div', 'cartao');
  veu.append(el('div', 'raios'));
  for (let i = 0; i < 26; i++) {
    const c = el('i', 'confete');
    c.style.left = ((i * 37 + 11) % 100) + '%'; c.style.background = CORES[i % CORES.length];
    c.style.animationDuration = 2.4 + ((i * 7) % 10) / 5 + 's'; c.style.animationDelay = -((i * 13) % 30) / 10 + 's';
    veu.append(c);
  }
  cartao.append(el('div', 'faixa', d.faixa || R.faixa[tipo] || R.ganhou));
  const r = d.recompensa, tem = temAlgo(r);
  let atraso = 0.5;
  if (tipo === 'nivel') {
    // o selo do nível novo, com quatro estrelas em volta (e os raios atrás: estilo/telas.js)
    const n = el('div', 'numero', String(d.numero));
    for (let i = 1; i <= 4; i++) { const e = icone('ui/estrela', i % 2 ? 40 : 28); e.classList.add('e' + i); n.append(e); }
    cartao.append(n);
  }
  else {
    // o baú: fechado, treme e abre; os prêmios saem dele
    const bau = el('div', 'bau'), fechado = icone('ui/bau-fechado', 84), abertoIc = icone('ui/bau-aberto', 84);
    fechado.classList.add('fechado'); abertoIc.classList.add('aberto');
    bau.append(el('i', 'brilho'), fechado, abertoIc);
    if (d.icone) { const selo = icone(d.icone, 40); selo.classList.add('selo'); bau.append(selo); }
    cartao.append(bau);
    atraso = 0.75;
  }
  if (d.titulo) cartao.append(el('div', 'titulo', d.titulo));
  if (d.sub) cartao.append(el('div', 'sub', d.sub));
  if (tem) {
    if (tipo === 'nivel') cartao.append(el('div', 'rotulo', R.ganhou));
    cartao.append(fichas(r, atraso));
    for (const f of NOTAS_DA_RECOMPENSA) { const t = f(d); if (t) cartao.append(el('div', 'sub para-que-serve', t)); }
  }
  if (d.liberou && d.liberou.length) {
    cartao.append(el('div', 'rotulo', R.liberou));
    const lista = el('div', 'itens lista');
    d.liberou.slice(0, 8).forEach((x, i) => {
      const e = el('div', 'item'); e.style.animationDelay = 0.5 + i * 0.12 + 's';
      e.append(icone(x.item ? 'icone/' + (x.tipo === 'cultura' ? x.item : x.id) : x.icone || 'icone/xp', 28), el('span', '', x.nome));
      lista.append(e);
    });
    cartao.append(lista);
  }
  if (d.rodape) cartao.append(el('div', 'sub rodape-da-recompensa', d.rodape));
  const ok = botao({ texto: tipo === 'nivel' ? R.continuar : R.receber, classe: 'verde', aoClicar: fechar });
  ok.dataset.k = 'continuar';
  cartao.append(ok);
  veu.append(cartao);
  segurarAvisos(true); // os avisos esperam a tela fechar (não caem por cima do título)
  raiz.append(veu);
  aberta = veu;
  if (tipo === 'nivel') som.tocar('nivel');
  else { som.tocar('abrir'); relogios.push(setTimeout(() => som.tocar('recompensa'), 560)); }
  try { ok.focus({ preventScroll: true }); } catch { /* sem foco */ }
}

export function fecharRecompensa() { return fechar(); }
function fechar() {
  if (!aberta) return false;
  for (const t of relogios) clearTimeout(t);
  relogios.length = 0;
  aberta.remove(); aberta = null;
  if (fila.length) proxima();
  else {
    segurarAvisos(false);
    // o foco volta para o painel que estiver aberto por baixo (quem navega pelas setas continua nele), ou para o jogo
    const volta = document.querySelector('#ui .veu .corpo button:not([disabled])') || document.querySelector('#ui .veu .fechar') || document.getElementById('tela');
    try { if (volta) volta.focus({ preventScroll: true }); } catch { /* sem foco */ }
  }
  return true;
}
