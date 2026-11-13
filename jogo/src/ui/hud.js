// O HUD: nível e experiência, ouro, cash, cesto, regador e fôlego (em cima, à esquerda); botões dos painéis (em cima,
// à direita); linha de dica e fila de tarefas (embaixo), e a fileira de baixo, onde fica a vaga "Na mão" (ui/acoes.js);
// alavanca e botão de agir (toque com alavanca, teclado e controle).
// É HTML por cima do canvas. atualizar() roda todo quadro, mas só mexe no DOM quando um valor muda.
import { el, icone, trocarIcone, botao, por, classe, encher } from './dom.js';
import { T, numero } from './textos.js';
import { prepararEstilo, ajustarEscala } from './estilo/index.js'; // o visual aprovado (molduras, escala, Menu)
import { criarMenu } from './menu.js';
import { J } from '../contexto.js';
import { barraDeXp } from '../nucleo/sistemas/niveis.js';
import { noCesto, foraDoCesto, capacidadeDoCesto, ferramentaNoCinto, ferramentaGuardada } from '../nucleo/sistemas/posses.js';
import { PAINEIS, abrirPainel, painelAberto } from './paineis/registro.js';
import { tela } from '../plataforma/tela.js';
import { som } from '../plataforma/som.js';

// (as frentes acrescentam as suas ações; o valor pode ser uma função da tarefa: (t) => 'icone/' + t.args.muda)
export const ICONE_DA_ACAO = { arar: 'ui/enxada', semear: 'ui/semear', regar: 'ui/regar', colher: 'ui/mao', encher: 'icone/gota', vender: 'icone/ouro', guardar: 'ui/mochila', pegar: 'ui/mochila', pegarFerramenta: 'ui/mochila', andar: 'ui/seta' };
const NA_FILA = 7; // ícones da fila à mostra; o resto vira "+N"

// número num elemento, sem refazer o texto quando não mudou
function num(e, v, texto) { if (e._v !== v) { e._v = v; e.textContent = texto === undefined ? numero(v) : texto; } }

export function criarHud(ui) {
  const hud = { raiz: ui, modos: {}, sementes: {}, paineis: {}, dicaFixa: '' };
  prepararEstilo(ui);

  // ---------- em cima, à esquerda ----------
  const esq = el('div', 'topo-esq');
  const l1 = el('div', 'linha'), l2 = el('div', 'linha');
  const nivel = el('div', 'chip nivel'), selo = el('span', 'selo', '1'), barraXp = el('div', 'barra hud'), fioXp = el('i'), txtXp = el('span', 'xp');
  barraXp.append(fioXp); nivel.append(selo, barraXp, txtXp); nivel.title = T.hud.nivel;
  const ouro = el('div', 'chip'), nOuro = el('span'); ouro.append(icone('icone/ouro', 30), nOuro); ouro.title = T.hud.ouro;
  const cash = el('div', 'chip cash'), nCash = el('span'); cash.append(icone('icone/cash', 30), nCash); cash.title = T.hud.cash;
  // o "+" do cash abre a loja de cash (se ela existir)
  const maisCash = botao({ icone: 'ui/mais', tamanho: 28, classe: 'mais-cash', rotulo: T.hud.maisCash, aoClicar: () => { som.tocar('toque'); abrirPainel('cash', { de: 'loja' }); } });
  maisCash.dataset.k = 'mais-cash'; maisCash.hidden = !PAINEIS.cash; cash.append(maisCash);
  l1.append(nivel, ouro, cash);
  const cesto = el('div', 'chip'), nCesto = el('span'); cesto.append(icone('icone/cesto', 30), nCesto); cesto.title = T.hud.cesto;
  const reg = el('div', 'chip'), nReg = el('span'); reg.append(icone('icone/regador', 30), nReg); reg.title = T.hud.regador;
  const folego = el('div', 'chip folego'), barraF = el('div', 'barra hud folego'), fioF = el('i'); barraF.append(fioF); folego.append(icone('icone/folego', 26), barraF); folego.title = T.hud.folego;
  folego.hidden = true;
  l2.append(cesto, reg, folego);
  esq.append(l1, l2);

  // ---------- em cima, à direita: um botão por painel registrado, mais a tela cheia ----------
  // Mochila, Loja e Construir sempre à vista; os outros entram no Menu (no celular, uma lista; no computador, à vista)
  const dir = el('div', 'topo-dir'), A_VISTA = { mochila: 1, loja: 1, construir: 1 }, noMenu = [];
  for (const p of Object.values(PAINEIS).sort((a, b) => a.ordem - b.ordem)) {
    if (!p.botao) continue;
    const b = botao({ icone: p.icone, tamanho: 40, classe: 'quadrado', rotulo: p.titulo, aoClicar: () => { som.tocar('toque'); abrirPainel(p.id); } });
    b.dataset.painel = p.id;
    hud.paineis[p.id] = b;
    if (A_VISTA[p.id]) dir.append(b); else noMenu.push([b, T.menu[p.id] || p.titulo]);
  }
  const menu = criarMenu(hud, dir);
  for (const [b, r] of noMenu) menu.por(b, r);
  if (tela.podeTelaCheia()) { const b = botao({ icone: 'ui/tela-cheia', tamanho: 36, classe: 'quadrado', rotulo: T.botoes.telaCheia, aoClicar: () => tela.alternarTelaCheia() }); b.dataset.k = 'tela-cheia'; menu.por(b, T.menu.telaCheia); }

  // ---------- embaixo ----------
  const rodape = el('div', 'rodape');
  const info = el('div', 'linha-info');
  const fila = el('button', 'fila bt'), filaIc = [], filaMais = el('span', 'mais'), filaX = icone('ui/fechar', 14);
  fila.type = 'button'; fila.title = T.hud.cancelarFila; fila.setAttribute('aria-label', T.hud.cancelarFila);
  for (let i = 0; i < NA_FILA; i++) { const c = icone('ui/mao', 22); c.hidden = true; filaIc.push(c); fila.append(c); }
  fila.append(filaMais, filaX); fila.hidden = true;
  fila.addEventListener('click', () => { J.mundo.comando({ tipo: 'cancelar' }); som.tocar('fechar'); });
  const dica = el('div', 'dica');
  info.append(fila, dica);
  // a fileira de baixo: a vaga "Na mão" (ui/acoes.js) e o que as frentes põem ao lado (a porta do celeiro). (O nome
  // .modos ficou da barra de modos, que as ações por toque aposentaram.)
  const modos = el('div', 'modos');
  rodape.append(info, modos);

  // ---------- toque: alavanca e botão de ação ----------
  const alavanca = el('div', 'alavanca toca'), pino = el('i'); alavanca.append(pino); alavanca.hidden = true;
  const agir = botao({ icone: 'ui/mao', tamanho: 54, classe: 'agir', rotulo: T.botoes.agir }); agir.hidden = true; // (o apertar e o segurar: entrada/agir.js)
  hud.alavanca = alavanca; hud.pino = pino; hud.agir = agir; hud.dicaEl = dica; hud.rodape = rodape;

  ui.append(esq, dir, rodape, alavanca, agir);

  let ultFila = -1;
  hud.atualizar = function () {
    const m = J.mundo, P = m.posses, p = m.personagem, D = m.dados;
    ajustarEscala(); // a tela mudou de tamanho: o zoom do #ui e o Menu do celular (estilo/index.js)
    // nível e experiência
    const bx = barraDeXp(m);
    num(selo, bx.nivel);
    encher(fioXp, bx.fracao);
    num(txtXp, bx.feito * 100000 + bx.precisa, bx.precisa ? `${bx.feito}/${bx.precisa}` : '');
    num(nOuro, P.ouro); num(nCash, P.cash);
    // cesto
    const nc = noCesto(m) - foraDoCesto(m), cap = capacidadeDoCesto(m); // (ovo e leite vão na caixa e no balde: não ocupam o cesto)
    num(nCesto, nc * 1000 + cap, `${nc}/${cap}`);
    classe(cesto, 'cheio', nc >= cap);
    // regador: quanta água leva; se está guardado (ao lado do poço ou no suporte do celeiro), avisa onde
    const rc = ferramentaNoCinto(m, 'regador'), rs = rc || ferramentaGuardada(m, 'regador');
    if (rs) { const f = P.ferramentas[rs], c = D.itens[rs].capacidade, noLugar = !rc && f.onde === 'lugar'; num(nReg, (rc ? 0 : noLugar ? 2e6 : 1e6) + f.agua * 1000 + c, rc ? `${f.agua}/${c}` : noLugar ? T.hud.regadorNoLugar : T.hud.semRegador); classe(reg, 'vazio', f.agua === 0); }
    if (reg.hidden !== !rs) reg.hidden = !rs;
    // fôlego: a barra some quando está cheia
    const F = D.regras.folego, cheio = p.folego >= F.max - 0.01;
    if (folego.hidden !== cheio) folego.hidden = cheio;
    if (!cheio) { encher(fioF, p.folego / F.max); classe(barraF, 'cansada', p.cansada); }

    // o botão de agir: com a alavanca na tela, e sempre que se joga pelas teclas ou pelo controle (o desenho dele
    // é o da ação do alvo à frente: entrada/index.js)
    const mostraAgir = comAlavanca || J.meio === 'teclas';
    if (agir.hidden !== !mostraAgir) agir.hidden = !mostraAgir;

    // fila de tarefas: os próximos passos, em ícones
    const nf = p.fila.length + (p.tarefa ? 1 : 0);
    let sinal = nf;
    for (let i = -1; i < p.fila.length && i < NA_FILA - 1; i++) { const t = i < 0 ? p.tarefa : p.fila[i]; if (t) sinal = (sinal * 31 + (t.acao ? t.acao.length * 7 + t.acao.charCodeAt(0) : 3)) | 0; }
    if (sinal !== ultFila) {
      ultFila = sinal;
      const mostraFila = nf >= 1 && !(nf === 1 && p.tarefa && p.tarefa.tipo === 'andar');
      if (fila.hidden !== !mostraFila) fila.hidden = !mostraFila;
      if (mostraFila) {
        let k = 0;
        for (let i = -1; i < p.fila.length && k < NA_FILA; i++) {
          const t = i < 0 ? p.tarefa : p.fila[i];
          if (!t) continue;
          const c = filaIc[k++];
          const ic = ICONE_DA_ACAO[t.acao || 'andar'] || 'ui/mao';
          trocarIcone(c, t.acao === 'semear' && t.args ? 'icone/' + t.args.semente : typeof ic === 'function' ? ic(t) : ic);
          if (c.hidden) c.hidden = false;
        }
        for (; k < NA_FILA; k++) if (!filaIc[k].hidden) filaIc[k].hidden = true;
        por(filaMais, nf > NA_FILA ? '+' + (nf - NA_FILA) : '');
      }
    }
  };

  // linha de dica: o que o toque ou o botão de ação vai fazer; sem nada a dizer, a dica geral (T.dicaDoModo.mao)
  let dicaOculta = false;
  hud.dica = function (texto, fraca) {
    const t = texto || T.dicaDoModo.mao || '';
    por(dica, t);
    classe(dica, 'fraca', !texto || !!fraca);
    const some = !t || dicaOculta;
    if (dica.hidden !== some) dica.hidden = some;
  };
  // o tutorial pede a linha de dica escondida enquanto aponta um botão da barra
  hud.esconderDica = function (sim) { if (dicaOculta !== sim) { dicaOculta = sim; const some = sim || !dica.textContent; if (dica.hidden !== some) dica.hidden = some; } };

  // alavanca e botão de ação conforme o esquema escolhido (só em aparelho de toque)
  let comAlavanca = false;
  hud.aplicarPrefs = function () {
    const e = J.prefs.esquema;
    comAlavanca = !!J.toque && (e === 'alavanca' || e === 'os-dois');
    alavanca.hidden = !comAlavanca; agir.hidden = !(comAlavanca || J.meio === 'teclas');
    document.body.classList.toggle('grande', J.prefs.botoes === 'grande');
    document.body.classList.toggle('com-alavanca', comAlavanca);
  };
  hud.esconder = function (some) { for (const e of [esq, dir, rodape]) e.style.visibility = some ? 'hidden' : ''; };
  hud.painelAberto = painelAberto;
  return hud;
}
