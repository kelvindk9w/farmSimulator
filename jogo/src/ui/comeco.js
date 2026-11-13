// A interface do começo humilde (a lógica está em nucleo/sistemas/comeco.js; o desenho, em render/comeco.js):
//   - a chegada, no jogo novo: a cena começa sozinha (menos no modo #teste das ferramentas), com o botão "Pular" no
//     canto; o balão do vizinho fica escondido até o Seu Tonho acenar, e aí ele dá as boas-vindas. Qualquer toque na
//     tela também termina a cena (a lógica cuida disso: o jogo nunca fica preso).
//   - o caixote de venda: "6 no caixote" quando ela põe, "+4 ouro" sobre ele a cada coisa que o freguês leva (na
//     volta de uma ausência, um "+ouro" só, com a soma).
//   - o Seu Tonho: depois da primeira conversa, tocar nele abre o painel de missões (para reler o que ele pediu).
//   - a reforma pronta: um aviso.
// A aba "Reformas" do painel Construir fica em paineis/construcao.js.
import '../render/comeco.js';
import './textos/comeco.js';
import { aoInstalarMundo } from './ligacoes.js';
import { botao } from './dom.js';
import { T } from './textos.js';
import { J } from '../contexto.js';
import { avisar } from './avisos.js';
import { som } from '../plataforma/som.js';

const DOURADO = '#ffe07a';
let pular = null;

function esconderBalao(ctx, esconder) {
  const t = ctx && ctx.tutorial;
  if (!t) return;
  t.balao.style.visibility = esconder ? 'hidden' : '';
  t.seta.style.visibility = esconder ? 'hidden' : '';
}
function tirarPular() { if (pular) { pular.remove(); pular = null; } }

aoInstalarMundo((m, ctx) => {
  const ev = m.eventos, part = J.cena.part;
  const centro = (id) => { const e = m.locais.fazenda.porId[id]; return e ? [e.x + e.l / 2, e.z + e.p / 2] : [m.personagem.x, m.personagem.z]; };
  tirarPular();
  esconderBalao(ctx, false);

  ev.ouvir('tonhoAcenou', () => {
    esconderBalao(ctx, false);
    if (ctx && ctx.tutorial) ctx.tutorial.dizer(T.comeco.boasVindas.titulo, T.comeco.boasVindas.fala, 7);
  });
  ev.ouvir('chegou', (d) => {
    tirarPular();
    esconderBalao(ctx, false);
    if (d.pulou && ctx && ctx.tutorial && !ctx.tutorial.falando()) ctx.tutorial.dizer(T.comeco.boasVindas.titulo, T.comeco.boasVindas.fala, 7);
  });
  ev.ouvir('conversou', (d) => { if (d.vez > 1 && ctx && ctx.tutorial) ctx.tutorial.abrirMissoes(); });
  ev.ouvir('encheuCaixote', (d) => { const c = centro(d.entidade); if (d.n > 0) part.texto(T.comeco.noCaixote(d.n), c[0], 1.6, c[1]); });
  // (na volta de uma ausência os fregueses levam tudo de uma vez: um "+ouro" só, com a soma)
  let somaVendida = 0, agendado = false;
  ev.ouvir('caixoteVendeu', (d) => {
    somaVendida += d.ouro;
    if (agendado) return;
    agendado = true;
    setTimeout(() => { const c = centro('banca'); part.brilho(c[0], 0.9, c[1], 4); part.texto(T.comeco.vendeu(somaVendida), c[0], 1.5, c[1], DOURADO); somaVendida = 0; agendado = false; }, 0);
  });
  ev.ouvir('reformou', (d) => { avisar(d.entidade === 'cerca' ? T.comeco.reformouCerca : T.comeco.reformou(d, m.dados), 'bom', 4000); som.tocar('martelo'); });

  // durante a cena: o botão Pular no canto, e o balão do vizinho escondido até ele acenar
  ev.ouvir('comecouChegada', () => {
    tirarPular();
    esconderBalao(ctx, true);
    pular = botao({ texto: T.comeco.pular, classe: 'verde pular-chegada', aoClicar: (e) => { e.stopPropagation(); m.comando({ tipo: 'pularChegada' }); } });
    // no canto de baixo, à direita; no celular, logo acima do botão redondo de agir (sem tapar nada)
    const agir = document.querySelector('#ui .bt.agir'), baixo = agir && agir.offsetParent ? agir.offsetHeight + 26 : 18;
    Object.assign(pular.style, { position: 'absolute', right: 'max(16px, env(safe-area-inset-right))', bottom: `max(${baixo}px, env(safe-area-inset-bottom))`, zIndex: '30', minWidth: '112px' });
    document.getElementById('ui').append(pular);
  });
  // a chegada começa sozinha no jogo novo do começo humilde (no modo #teste, quem pede é a ferramenta)
  const C = m.comeco;
  if (!J.teste && C && C.humilde && !C.chegou && !C.chegada) m.comando({ tipo: 'comecarChegada' });
});
