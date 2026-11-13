// A interface do começo humilde (a lógica está em nucleo/sistemas/comeco.js; o desenho, em render/comeco.js):
//   - a chegada, no jogo novo: a cena começa sozinha (menos no modo #teste das ferramentas), com o botão "Pular" no
//     canto; o balão fica escondido enquanto ela anda. No fim do caminho ela fala primeiro, em dois balões com o nome
//     e o retrato dela (retrato/personagem, depois retrato/personagem-alegre, quando "+6 sementes de alface" sai da
//     trouxa); depois o Seu Tonho acena e dá as boas-vindas (com o retrato alegre dele).
//     Qualquer toque na tela também termina a cena (a lógica cuida disso: o jogo nunca fica preso).
//   - só na versão de teste (regras.json versaoDeTeste): ao abrir uma gravação de um começo mais antigo que o desta
//     versão, pergunta uma vez se quer começar de novo (a fazenda deste aparelho é apagada).
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
import { perguntar } from './dialogo.js';
import { nomeDoItem } from './textos.js';
import { som } from '../plataforma/som.js';
import { querComecoNovo } from '../nucleo/sistemas/comeco.js';

const DOURADO = '#ffe07a', VERDE = '#c8f08c';
const ESPERA_MAX = 12000; // ms: nada espera a tela de carregando mais do que isso
const carregando = () => !!document.documentElement.dataset.carregando;
let pular = null;
let abriu = false; // a primeira instalação de mundo é a abertura do jogo (importar e recomeçar não perguntam nada)

// chama f quando a tela de carregando sumir (<html data-carregando> sai e vem o evento "jogo-carregou"; se o sinal se
// perder, depois de ESPERA_MAX); sem a tela, na hora
function depoisDoCarregando(f) {
  if (!carregando()) { f(); return; }
  let feito = false, olho = 0;
  const ir = () => { if (feito) return; feito = true; clearInterval(olho); window.removeEventListener('jogo-carregou', ir); f(); };
  const t0 = Date.now();
  window.addEventListener('jogo-carregou', ir);
  olho = setInterval(() => { if (!carregando() || Date.now() - t0 > ESPERA_MAX) ir(); }, 200);
}

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
  const D = m.dados.missoes;
  tirarPular();
  esconderBalao(ctx, false);

  // a chegada: ela fala primeiro (as sementes saem da trouxa); o Seu Tonho responde com as boas-vindas (uma vez só)
  const daTrouxa = (itens) => {
    const p = m.personagem;
    for (const id in itens) part.texto(T.comeco.daTrouxa(itens[id], nomeDoItem(m.dados, id)), p.x, 1.9, p.z, VERDE);
    part.brilho(p.x, 1.0, p.z, 4);
  };
  ev.ouvir('elaFalou', (d) => {
    esconderBalao(ctx, false);
    const partes = T.comeco.fala, seg = d.seg || 5.5, letras = partes.reduce((s, f) => s + f.texto.length, 0);
    let trouxe = false, usado = 0;
    const abrir = () => { if (!trouxe) { trouxe = true; daTrouxa(d.itens); } };
    partes.forEach((f, i) => {
      // (cada balão fica o tempo do tamanho dele, no mínimo 2 s; o último fecha a conta da fala, quando ele responde)
      const t = i < partes.length - 1 ? Math.max(2, (seg * f.texto.length) / letras) : Math.max(2, seg - usado);
      usado += t;
      const quem = { nome: D.elaNome, retrato: 'retrato/' + D.elaId + (f.cara ? '-' + f.cara : '') };
      if (ctx && ctx.tutorial) ctx.tutorial.dizer(D.elaNome, f.texto, t, quem, f.trouxa ? abrir : null);
    });
    if (!ctx || !ctx.tutorial) abrir();
  });
  let deuBoasVindas = false;
  const boasVindas = () => {
    if (deuBoasVindas || !ctx || !ctx.tutorial) return;
    deuBoasVindas = true;
    ctx.tutorial.dizer(T.comeco.boasVindas.titulo, T.comeco.boasVindas.fala, 7, { nome: D.vizinhoNome, retrato: 'retrato/' + D.vizinhoId + '-alegre' });
  };
  ev.ouvir('tonhoAcenou', () => { esconderBalao(ctx, false); boasVindas(); });
  ev.ouvir('chegou', (d) => {
    tirarPular();
    esconderBalao(ctx, false);
    if (d.pulou) boasVindas(); // (pulando, ele não chegou a acenar: as boas-vindas vêm depois da fala dela)
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
  // a chegada começa sozinha no jogo novo do começo humilde (no modo #teste, quem pede é a ferramenta). Com a tela de
  // carregando à vista (<html data-carregando>), ela já aparece na porteira, parada, e só anda quando a tela some.
  const C = m.comeco;
  if (!J.teste && C && C.humilde && !C.chegou && !C.chegada) {
    const espera = carregando();
    m.comando({ tipo: 'comecarChegada', espera });
    if (espera) depoisDoCarregando(() => { if (m.comeco.chegada) m.comando({ tipo: 'soltarChegada' }); });
  }
  // a versão de teste, ao abrir o jogo com a gravação de um começo mais antigo: pergunta uma vez (já fica marcado ao
  // perguntar, responda ou não), depois que a tela de carregando some. Sim: a fazenda nova, com a chegada.
  const primeira = !abriu;
  abriu = true;
  if (primeira && !J.teste && querComecoNovo(m)) depoisDoCarregando(() => {
    if (J.mundo !== m || !querComecoNovo(m)) return;
    const P = T.comeco.comecoNovo;
    if (!perguntar({ titulo: P.titulo, texto: P.texto, nota: P.nota, sim: P.sim, nao: P.nao, classeSim: 'ruim', aoSim: () => J.trocarMundo(null) })) return;
    m.comando({ tipo: 'perguntouComecoNovo' });
    J.gravarLogo();
  });
});
