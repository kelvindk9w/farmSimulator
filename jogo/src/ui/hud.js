// O HUD: nível e experiência, ouro, cash, cesto, regador e fôlego (em cima, à esquerda); botões dos painéis (em cima,
// à direita); linha de dica, fila de tarefas, sementes e barra de modo (embaixo); alavanca e botão de ação (toque).
// É HTML por cima do canvas. atualizar() roda todo quadro, mas só mexe no DOM quando um valor muda.
import { el, icone, trocarIcone, botao, por, classe, fracao } from './dom.js';
import { T, numero } from './textos.js';
import { J } from '../contexto.js';
import { modosEmOrdem } from '../nucleo/registro.js';
import { barraDeXp } from '../nucleo/sistemas/niveis.js';
import { noCesto, capacidadeDoCesto, ferramentaNoCinto, ferramentaNoSuporte } from '../nucleo/sistemas/posses.js';
import { plantavel } from '../nucleo/sistemas/lavoura.js';
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

  // ---------- em cima, à esquerda ----------
  const esq = el('div', 'topo-esq');
  const l1 = el('div', 'linha'), l2 = el('div', 'linha');
  const nivel = el('div', 'chip nivel'), selo = el('span', 'selo', '1'), barraXp = el('div', 'barra'), fioXp = el('i'), txtXp = el('span', 'xp');
  barraXp.append(fioXp); nivel.append(selo, barraXp, txtXp); nivel.title = T.hud.nivel;
  const ouro = el('div', 'chip'), nOuro = el('span'); ouro.append(icone('icone/ouro', 22), nOuro); ouro.title = T.hud.ouro;
  const cash = el('div', 'chip'), nCash = el('span'); cash.append(icone('icone/cash', 22), nCash); cash.title = T.hud.cash;
  l1.append(nivel, ouro, cash);
  const cesto = el('div', 'chip'), nCesto = el('span'); cesto.append(icone('icone/cesto', 22), nCesto); cesto.title = T.hud.cesto;
  const reg = el('div', 'chip'), nReg = el('span'); reg.append(icone('icone/regador', 22), nReg); reg.title = T.hud.regador;
  const folego = el('div', 'chip folego'), barraF = el('div', 'barra folego'), fioF = el('i'); barraF.append(fioF); folego.append(icone('icone/folego', 20), barraF); folego.title = T.hud.folego;
  folego.hidden = true;
  l2.append(cesto, reg, folego);
  esq.append(l1, l2);

  // ---------- em cima, à direita: um botão por painel registrado, mais a tela cheia ----------
  const dir = el('div', 'topo-dir');
  for (const p of Object.values(PAINEIS).sort((a, b) => a.ordem - b.ordem)) {
    if (!p.botao) continue;
    const b = botao({ icone: p.icone, tamanho: 30, classe: 'quadrado', rotulo: p.titulo, aoClicar: () => { som.tocar('toque'); abrirPainel(p.id); } });
    b.dataset.painel = p.id;
    hud.paineis[p.id] = b;
    dir.append(b);
  }
  if (tela.podeTelaCheia()) dir.append(botao({ icone: 'ui/tela-cheia', tamanho: 28, classe: 'quadrado', rotulo: T.botoes.telaCheia, aoClicar: () => tela.alternarTelaCheia() }));

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
  const sementes = el('div', 'sementes'); sementes.hidden = true;
  const modos = el('div', 'modos');
  for (const md of modosEmOrdem()) {
    const b = botao({ icone: md.icone || 'ui/' + md.id, tamanho: 30, texto: T.modos[md.id] || md.id, classe: 'modo', aoClicar: () => { som.tocar('toque'); J.mundo.comando({ tipo: 'escolherModo', modo: md.id }); } });
    b.dataset.modo = md.id; b._modo = md;
    const conta = el('span', 'conta'); conta.hidden = true; b.append(conta); b._conta = conta;
    hud.modos[md.id] = b;
    modos.append(b);
  }
  rodape.append(info, sementes, modos);

  // ---------- toque: alavanca e botão de ação ----------
  const alavanca = el('div', 'alavanca toca'), pino = el('i'); alavanca.append(pino); alavanca.hidden = true;
  const agir = botao({ icone: 'ui/mao', tamanho: 40, classe: 'agir', rotulo: T.botoes.agir }); agir.hidden = true;
  agir.addEventListener('pointerdown', (e) => { e.preventDefault(); J.meio = 'teclas'; J.mundo.comando({ tipo: 'agir' }); });
  hud.alavanca = alavanca; hud.pino = pino; hud.agir = agir; hud.dicaEl = dica; hud.rodape = rodape;

  ui.append(esq, dir, rodape, alavanca, agir);

  // ---------- sementes: um botão por semente que há na bolsa ----------
  let assinatura = '';
  function refazerSementes(m) {
    sementes.textContent = '';
    hud.sementes = {};
    const B = m.posses.bolsa, lista = [];
    for (const id of m.dados.loja.ouro) if (plantavel(m.dados, id) && (B[id] > 0 || id === m.modo.semente)) lista.push(id);
    for (const id of lista.slice(0, 8)) {
      const b = botao({ icone: 'icone/' + id, tamanho: 34, classe: 'semente', rotulo: m.dados.itens[id].nome, aoClicar: () => { som.tocar('toque'); J.mundo.comando({ tipo: 'escolherModo', modo: 'semear', semente: id }); } });
      b.dataset.semente = id;
      const conta = el('span', 'conta'); b.append(conta); b._conta = conta;
      hud.sementes[id] = b;
      sementes.append(b);
    }
  }

  let ultFila = -1;
  hud.atualizar = function () {
    const m = J.mundo, P = m.posses, p = m.personagem, D = m.dados;
    // nível e experiência
    const bx = barraDeXp(m);
    num(selo, bx.nivel);
    fracao(fioXp, bx.fracao);
    num(txtXp, bx.feito * 100000 + bx.precisa, bx.precisa ? `${bx.feito}/${bx.precisa}` : '');
    num(nOuro, P.ouro); num(nCash, P.cash);
    // cesto
    const nc = noCesto(m), cap = capacidadeDoCesto(m);
    num(nCesto, nc * 1000 + cap, `${nc}/${cap}`);
    classe(cesto, 'cheio', nc >= cap);
    // regador: quanta água leva; se está no suporte do celeiro, avisa
    const rc = ferramentaNoCinto(m, 'regador'), rs = rc || ferramentaNoSuporte(m, 'regador');
    if (rs) { const f = P.ferramentas[rs], c = D.itens[rs].capacidade; num(nReg, (rc ? 0 : 1e6) + f.agua * 1000 + c, rc ? `${f.agua}/${c}` : T.hud.semRegador); classe(reg, 'vazio', f.agua === 0); }
    if (reg.hidden !== !rs) reg.hidden = !rs;
    // fôlego: a barra some quando está cheia
    const F = D.regras.folego, cheio = p.folego >= F.max - 0.01;
    if (folego.hidden !== cheio) folego.hidden = cheio;
    if (!cheio) { fracao(fioF, p.folego / F.max); classe(barraF, 'cansada', p.cansada); }

    // modo ativo e os números da barra
    for (const id in hud.modos) { const b = hud.modos[id], some = !!b._modo.disponivel && !b._modo.disponivel(m); classe(b, 'ativo', m.modo.id === id); if (b.hidden !== some) b.hidden = some; } // modo que ainda não vale (sem a ferramenta) não aparece
    const bReg = hud.modos.regar;
    if (bReg && rs) { const c = bReg._conta; if (c.hidden) c.hidden = false; num(c, P.ferramentas[rs].agua); classe(c, 'zero', P.ferramentas[rs].agua === 0); }
    const bSem = hud.modos.semear;
    if (bSem) { const s = m.modo.semente, n = s ? P.bolsa[s] || 0 : 0, c = bSem._conta; if (c.hidden !== !s) c.hidden = !s; if (s) { num(c, n); classe(c, 'zero', n === 0); } }

    // sementes (só no modo semear)
    const mostra = m.modo.id === 'semear';
    if (sementes.hidden !== !mostra) sementes.hidden = !mostra;
    classe(rodape, 'com-sementes', mostra);
    if (mostra) {
      let a = '';
      for (const id of D.loja.ouro) if (plantavel(D, id) && (P.bolsa[id] > 0 || id === m.modo.semente)) a += id + ',';
      if (a !== assinatura) { assinatura = a; refazerSementes(m); }
      for (const id in hud.sementes) { const b = hud.sementes[id], n = P.bolsa[id] || 0; classe(b, 'ativo', m.modo.semente === id); classe(b, 'vazia', n === 0); num(b._conta, n); }
    }

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

  // linha de dica: o que o toque ou o botão de ação vai fazer; sem nada a dizer, a dica do modo
  let dicaOculta = false;
  hud.dica = function (texto, fraca) {
    const m = J.mundo;
    const t = texto || T.dicaDoModo[m.modo.id] || '';
    por(dica, t);
    classe(dica, 'fraca', !texto || !!fraca);
    const some = !t || dicaOculta;
    if (dica.hidden !== some) dica.hidden = some;
  };
  // o tutorial pede a linha de dica escondida enquanto aponta um botão da barra
  hud.esconderDica = function (sim) { if (dicaOculta !== sim) { dicaOculta = sim; const some = sim || !dica.textContent; if (dica.hidden !== some) dica.hidden = some; } };

  // alavanca e botão de ação conforme o esquema escolhido (só em aparelho de toque)
  hud.aplicarPrefs = function () {
    const e = J.prefs.esquema, comAlavanca = J.toque && (e === 'alavanca' || e === 'os-dois');
    alavanca.hidden = !comAlavanca; agir.hidden = !comAlavanca;
    document.body.classList.toggle('grande', J.prefs.botoes === 'grande');
    document.body.classList.toggle('com-alavanca', comAlavanca);
  };
  hud.esconder = function (some) { for (const e of [esq, dir, rodape]) e.style.visibility = some ? 'hidden' : ''; };
  hud.painelAberto = painelAberto;
  return hud;
}
