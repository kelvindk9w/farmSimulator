// A pergunta feita na própria página (sem janela do navegador): "Comprar por 30 de cash?", "Concluir agora?".
// Dois botões; o foco começa no "não", para um Enter distraído não gastar nada. Fecha com Esc, com o botão de
// voltar e tocando fora. Usa o mesmo véu das telas de recompensa (classe "subida"): as setas andam pelos botões.
//   perguntar({ titulo, texto, nota, icone, sim, nao, classeSim, aoSim, aoNao })
// (e, para um cartão que não é bem pergunta: conteudo (um elemento, antes dos botões), classe (a mais no véu) e
// foco (seletor do botão que recebe o foco, dentro do cartão). Ex.: o "Onde conseguir?" de ui/fontes.js)
import { el, icone, botao } from './dom.js';
import './textos/progresso.js';
import { T } from './textos.js';
import { som } from '../plataforma/som.js';
import { segurarAvisos } from './avisos.js';

let raiz = null, aberto = null;
export const aoFecharDialogo = []; // a tela de recompensa espera a pergunta fechar
export function prepararDialogo(ui) { raiz = ui; }
export const dialogoAberto = () => !!aberto;

export function perguntar(p) {
  if (!raiz) return false;
  if (aberto) fecharDialogo();
  const veu = el('div', 'subida dialogo' + (p.classe ? ' ' + p.classe : '')), cartao = el('div', 'cartao');
  if (p.icone) cartao.append(icone(p.icone, 52));
  if (p.titulo) cartao.append(el('div', 'faixa', p.titulo));
  if (p.texto) cartao.append(el('p', 'pergunta', p.texto));
  if (p.nota) cartao.append(el('p', 'nota', p.nota));
  if (p.conteudo) cartao.append(p.conteudo);
  const linha = el('div', 'linha');
  const nao = botao({ texto: p.nao || T.dialogo.nao, aoClicar: () => { fecharDialogo(); som.tocar('fechar'); if (p.aoNao) p.aoNao(); } });
  nao.dataset.k = 'nao';
  linha.append(nao);
  if (p.aoSim) {
    const sim = botao({ texto: p.sim || T.dialogo.sim, classe: p.classeSim || 'verde', aoClicar: () => { fecharDialogo(); p.aoSim(); } });
    sim.dataset.k = 'sim';
    linha.append(sim);
  }
  cartao.append(linha);
  veu.append(cartao);
  veu.addEventListener('pointerdown', (e) => { if (e.target === veu) fecharDialogo(); });
  segurarAvisos(true);
  raiz.append(veu);
  aberto = { veu, antes: document.activeElement };
  som.tocar('abrir');
  try { ((p.foco && cartao.querySelector(p.foco)) || nao).focus({ preventScroll: true }); } catch { /* sem foco */ }
  return true;
}

export function fecharDialogo() {
  if (!aberto) return false;
  const a = aberto;
  aberto = null;
  a.veu.remove();
  segurarAvisos(false);
  // o foco volta para onde estava (o botão do painel que abriu a pergunta), ou para o jogo
  const volta = a.antes && a.antes.isConnected ? a.antes : document.getElementById('tela');
  try { if (volta) volta.focus({ preventScroll: true }); } catch { /* sem foco */ }
  for (const f of aoFecharDialogo) f();
  return true;
}
