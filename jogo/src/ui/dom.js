// Ajudas da interface em HTML: criar elementos, ícones (peça do catálogo ou figura de reserva) e botões.
import { pintarIconeDeReserva } from '../render/icones.js';

export const el = (tag, cls, texto) => { const e = document.createElement(tag); if (cls) e.className = cls; if (texto !== undefined) e.textContent = texto; return e; };

// o que os ícones precisam: o catálogo de arte e os dados (cores e tipos dos itens)
const ctx = { atlas: null, dados: null };
const vivos = new Set(); // ícones na tela, para repintar quando a página de arte chegar
export function prepararIcones(atlas, dados) { ctx.atlas = atlas; ctx.dados = dados; }
export function repintarIcones() { for (const c of vivos) { if (!c.isConnected) vivos.delete(c); else pintar(c); } }

// peças que ainda não estão no catálogo e têm um substituto dele: o retrato dela é o busto da figura parada de frente
const BUSTO = { 'retrato/personagem': 'personagem/parada-frente', 'retrato/personagem-alegre': 'personagem/parada-frente' };

function pintar(c) {
  const g = c.getContext('2d'), t = c.width, chave = c.dataset.chave, A = ctx.atlas;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, t, t);
  const p = A && A.peca(chave), sub = !p && A && BUSTO[chave], ps = sub && A.peca(sub);
  if (p && A.pronta(chave)) {
    // encaixa o quadro inteiro da peça na caixa do ícone
    const k = Math.min(t / p.casa[0], t / p.casa[1]), S = k * p.e;
    A.desenhar(g, chave, 0, (t - p.casa[0] * k) / 2 + p.apoio[0] * k, (t - p.casa[1] * k) / 2 + p.apoio[1] * k, S, false);
  } else if (ps && A.pronta(sub)) {
    // o busto: os 60% de cima da figura (do alto da cabeça ao peito), centrado; o resto fica fora da caixa
    const alto = ps.apoio[1] - ps.q[0][6], k = t / (alto * 0.6);
    A.desenhar(g, sub, 0, t / 2, alto * k + t * 0.04, k * ps.e, false);
  } else pintarIconeDeReserva(g, chave, t, ctx.dados);
}

// ícone de "tamanho" pontos de CSS (desenhado com o dobro de pontos, para telas densas)
export function icone(chave, tamanho = 28) {
  const c = el('canvas', 'ic');
  c.width = c.height = tamanho * 2;
  c.style.width = c.style.height = tamanho + 'px';
  c.dataset.chave = chave;
  vivos.add(c);
  pintar(c);
  return c;
}
export function trocarIcone(c, chave) { if (c.dataset.chave !== chave) { c.dataset.chave = chave; pintar(c); } }

// botão: opc = { icone, tamanho, texto, classe, rotulo (para leitor de tela), aoClicar }
export function botao(opc) {
  const b = el('button', 'bt' + (opc.classe ? ' ' + opc.classe : ''));
  b.type = 'button';
  if (opc.icone) b.append(icone(opc.icone, opc.tamanho || 28));
  if (opc.texto !== undefined) b.append(el('span', '', opc.texto));
  if (opc.rotulo) { b.setAttribute('aria-label', opc.rotulo); b.title = opc.rotulo; }
  if (opc.aoClicar) b.addEventListener('click', opc.aoClicar);
  return b;
}

// só mexe no DOM quando o valor muda (o HUD chama isto a cada quadro)
export function por(e, texto) { if (e._t !== texto) { e._t = texto; e.textContent = texto; } }
export function classe(e, nome, liga) { const k = '_c' + nome; if (e[k] !== liga) { e[k] = liga; e.classList.toggle(nome, liga); } }
export function fracao(barra, f) { const v = Math.round(Math.max(0, Math.min(1, f)) * 200) / 200; if (barra._f !== v) { barra._f = v; barra.style.transform = `scaleX(${v})`; } }
// barra de 9 fatias do HUD (estilo/hud.js): o enchimento muda de largura (scaleX amassaria as pontas redondas)
export function encher(fio, f) { const v = Math.round(Math.max(0, Math.min(1, f)) * 200) / 200; if (fio._f !== v) { fio._f = v; fio.style.width = v * 100 + '%'; fio.style.visibility = v > 0 ? '' : 'hidden'; } }
