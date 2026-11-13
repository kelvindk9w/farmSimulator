// O painel de uma indústria (bancadas, moinho, cozinha, laticínio) e a ligação da frente com os eventos do mundo.
//   'industria'   arg = { entidade, aba? }. De cima para baixo: o que está pronto para retirar, a fila (o que está
//                 sendo feito, com barra, tempo e "Terminar agora"; as que esperam, com tirar da fila e mudar a ordem;
//                 as vagas livres e a vaga a mais, com cadeado e os dois preços) e as receitas daquela construção.
//                 Na bancada de carpintaria há duas abas: "Produzir" (esta) e "Construir" (o catálogo da frente de
//                 construir, montado aqui dentro: PAINEIS.construir.montar).
// O toque que abre este painel (ou retira direto, no modo mão) é decidido em nucleo/sistemas/industria.js.
// Também daqui: a dica do Seu Tonho na primeira vez de cada coisa (dicaDoTonho, usada também pelo quadro de pedidos).
import { el, icone, trocarIcone, botao, por, fracao } from '../dom.js';
import { T, numero, tempo } from '../textos.js';
import '../textos/industria.js';
import { J } from '../../contexto.js';
import { registrarPainel, PAINEIS, painelAberto } from './registro.js';
import { linhaDeArrumar } from './construcao.js';
import { aoInstalarMundo } from '../ligacoes.js';
import { avisar } from '../avisos.js';
import { perguntar } from '../dialogo.js';
import { botaoConcluir } from '../concluir.js';
import { ICONE_DA_ACAO } from '../hud.js';
import { som } from '../../plataforma/som.js';
import '../../render/industria.js';
import { construcaoPorId, defDe, estaPronta } from '../../nucleo/sistemas/construcao.js';
import { quantoTem } from '../../nucleo/sistemas/posses.js';
import { missaoAtual } from '../../nucleo/sistemas/missoes.js';
import { receitasDe, receitasDaConstrucao, ehIndustria, vagasDaFila, proximaVaga, estadoDaIndustria, faltaDaFila, andamentoDaFila, prontosNaSaida, podeProduzir } from '../../nucleo/sistemas/industria.js';
import { pedidosDe, QUADRO } from '../../nucleo/sistemas/pedidos.js';

const BANCADA = 'bancada-de-carpintaria';
const VAZIA = { fila: [], inicio: 0, saida: [] };
ICONE_DA_ACAO.retirarProduto = 'ui/mao';

// ---------- a dica do Seu Tonho ----------
// uma faixa com o retrato, a fala e o botão "Entendi"; some quando o jogador entende ou faz o que ela ensina
export function dicaDoTonho(id, aoEntender) {
  const caixa = el('div', 'ind-dica'), retrato = el('div', 'retrato'), fala = el('div', 'fala');
  retrato.append(icone('retrato/' + J.dados.missoes.vizinhoId, 40));
  fala.append(el('b', '', J.dados.missoes.vizinhoNome), el('span', '', T.dicas[id]));
  const b = botao({ texto: T.dicas.entendi, aoClicar: () => { som.tocar('toque'); aoEntender(); } });
  b.dataset.k = 'dica-ok';
  caixa.append(retrato, fala, b);
  caixa.dataset.dica = id;
  return caixa;
}
// a dica "id" já foi vista? marcar grava no mundo (vai junto na gravação)
export const viuDica = (m, id) => !!(m.industria && m.industria.dicas[id]);
export function marcarDica(m, id) { if (m.industria && !m.industria.dicas[id]) { m.comando({ tipo: 'viuDica', dica: id }); J.gravarLogo(); } }

// o item que a missão da vez manda produzir (o botão dele ganha o contorno do tutorial)
function itemDaMissao(m) {
  const a = missaoAtual(m), o = a && !a.esperaNivel ? a.missao.objetivo : null;
  if (!o || o.evento !== 'produziu' || !o.filtro) return null;
  return Array.isArray(o.filtro.item) ? o.filtro.item[0] : o.filtro.item || null;
}
// ingrediente em ficha: figura, nome e "tem/precisa", verde ou vermelho
function ficha(m, item, precisa) {
  const tem = quantoTem(m, item), f = el('span', 'ind-ficha ' + (tem >= precisa ? 'tem' : 'falta'));
  f.append(icone('icone/' + item, 22), el('span', '', m.dados.itens[item].nome), el('b', '', `${Math.min(tem, 999)}/${precisa}`));
  return f;
}
function preco(chave, n) { const s = el('span', 'preco'); s.append(icone(chave, 18), el('span', '', numero(n))); return s; }

registrarPainel({
  id: 'industria', titulo: T.industria.titulo, icone: 'icone/martelo', botao: false,
  montar(corpo, ctx, arg) {
    const id = arg && arg.entidade;
    let aba = arg && arg.aba === 'construir' ? 'construir' : 'produzir', sinal = '', api = null, fio = null, tFalta = null;
    // o cabeçalho leva o nome e a figura da construção
    const cab = corpo.parentNode && corpo.parentNode.querySelector('header');
    {
      const m = J.mundo, e = construcaoPorId(m, id), def = e && defDe(m, e.tipo);
      if (cab && def) { por(cab.querySelector('.titulo'), def.nome); const ic = cab.querySelector('canvas.ic'); if (ic) trocarIcone(ic, 'objeto/' + def.id); }
    }
    const mandar = (c) => J.mundo.comando(c); // o que não dá certo vira aviso sozinho (evento "faltou")
    const focar = (k) => { const n = corpo.querySelector(`[data-k="${k}"]`); if (n) try { n.focus({ preventScroll: true }); } catch { /* sem foco */ } };
    function saldo(m) { ctx.saldo.textContent = ''; ctx.saldo.append(icone('icone/ouro', 20), el('span', '', numero(m.posses.ouro))); }

    function cancelar(i) {
      const m = J.mundo, st = estadoDaIndustria(m, id), r = st && receitasDe(m.dados).todas[st.fila[i]];
      if (!r) return;
      // a que já está sendo feita perde o tempo passado: pergunta antes
      if (i === 0 && st.inicio) perguntar({ icone: 'icone/' + r.item, titulo: T.industria.cancelar, texto: T.industria.perguntaCancelar(r.nome), sim: T.industria.simCancelar, nao: T.industria.nao, classeSim: 'ruim', aoSim: () => mandar({ tipo: 'cancelarReceita', entidade: id, vaga: 0 }) });
      else mandar({ tipo: 'cancelarReceita', entidade: id, vaga: i });
    }
    function mover(de, para) { if (mandar({ tipo: 'reordenarFila', entidade: id, de, para }).ok) { som.tocar('toque'); desenhar(); focar((para < de ? 'subir-' : 'descer-') + para); if (!corpo.contains(document.activeElement)) focar('cancelar-' + para); } }
    function abrirVaga(cash) {
      const m = J.mundo, e = construcaoPorId(m, id), amp = e && proximaVaga(m, e);
      if (!amp) return;
      const valor = cash ? amp.cash : amp.custo.ouro, tem = cash ? m.posses.cash : m.posses.ouro;
      const fazer = () => { if (mandar({ tipo: 'ampliar', entidade: id, cash: !!cash }).ok) marcarDica(m, 'vaga'); };
      if (tem < valor) { fazer(); return; } // falta ouro ou cash: o próprio comando explica
      perguntar({ icone: 'ui/vaga', titulo: T.industria.tituloVaga, texto: T.industria.perguntaVaga(amp.nome, valor, cash ? T.hud.cash.toLowerCase() : T.hud.ouro.toLowerCase()), sim: T.industria.simVaga, aoSim: fazer });
    }

    // qual dica do Seu Tonho cabe agora (uma por vez, na ordem em que as coisas aparecem)
    function dicaDaVez(m, e, st) {
      if (!viuDica(m, 'fila') && !st.fila.length && !st.saida.length) return 'fila';
      if (!viuDica(m, 'retirar') && (st.fila.length || st.saida.length)) return 'retirar';
      if (!viuDica(m, 'cancelar') && st.fila.length >= 2) return 'cancelar';
      const amp = proximaVaga(m, e);
      if (!viuDica(m, 'vaga') && amp && amp.nivel <= m.progresso.nivel) return 'vaga';
      return null;
    }

    function produzir(m, e, caixa) {
      const st = estadoDaIndustria(m, e) || VAZIA, R = receitasDe(m.dados).todas, vagas = vagasDaFila(m, e), daMissao = itemDaMissao(m);
      const dica = dicaDaVez(m, e, st);
      if (dica) caixa.append(dicaDoTonho(dica, () => { marcarDica(J.mundo, dica); desenhar(); const b = corpo.querySelector('.ind-pronto button, .ind-receita button, button'); if (b) try { b.focus({ preventScroll: true }); } catch { /* sem foco */ } }));

      // pronto para retirar
      if (st.saida.length) {
        const bloco = el('div', 'ind-pronto'), itens = el('div', 'itens'), P = prontosNaSaida(m, e);
        for (const k in P) { const c = el('div', 'item'); c.append(icone('icone/' + k, 30), el('span', '', m.dados.itens[k].nome), el('small', '', '×' + P[k])); itens.append(c); }
        const b = botao({ icone: 'ui/mao', tamanho: 24, texto: T.industria.retirar, classe: 'verde' + (daMissao && P[daMissao] ? ' alvo-tutorial' : ''), aoClicar: () => mandar({ tipo: 'retirar', entidade: id }) });
        b.dataset.k = 'retirar';
        bloco.append(el('div', 'secao', T.industria.pronto), itens, b);
        caixa.append(bloco);
      }

      // a fila
      const titulo = el('div', 'secao'); titulo.append(el('span', '', T.industria.fila), el('span', '', T.industria.vagas(st.fila.length, vagas)));
      caixa.append(titulo);
      const fila = el('div', 'ind-fila');
      st.fila.forEach((rid, i) => {
        const r = R[rid];
        if (!r) return;
        const linha = el('div', i === 0 ? 'ind-fazendo' : 'ind-espera'), meio = el('div', 'ind-meio'), nome = el('div', 'nome', r.nome);
        if (r.n > 1) nome.append(el('small', '', ' ×' + r.n));
        linha.dataset.receita = r.id;
        if (i === 0 && st.inicio) {
          const anda = el('div', 'ind-anda'), b = el('div', 'barra'); fio = el('i'); b.append(fio); tFalta = el('span', 'ind-falta');
          anda.append(b, tFalta); meio.append(nome, anda);
          linha.append(icone('icone/' + r.item, 40), meio, botaoConcluir('fila', id, { texto: T.industria.terminar, k: 'concluir' }));
        } else {
          meio.append(nome, el('div', 'info', i === 0 ? T.industria.parada : T.industria.esperaAVez));
          linha.append(icone('icone/' + r.item, i === 0 ? 40 : 32), meio);
          // mudar a ordem: só entre as que esperam (a que está sendo feita não sai do lugar)
          const piso = st.inicio ? 1 : 0;
          if (i > piso) { const b = botao({ icone: 'ui/seta', tamanho: 20, classe: 'quadrado ind-sobe', rotulo: T.industria.subir, aoClicar: () => mover(i, i - 1) }); b.dataset.k = 'subir-' + i; linha.append(b); }
          if (i >= piso && i < st.fila.length - 1) { const b = botao({ icone: 'ui/seta', tamanho: 20, classe: 'quadrado', rotulo: T.industria.descer, aoClicar: () => mover(i, i + 1) }); b.dataset.k = 'descer-' + i; linha.append(b); }
        }
        const x = botao({ icone: 'ui/fechar', tamanho: 20, classe: 'quadrado', rotulo: T.industria.cancelar, aoClicar: () => cancelar(i) });
        x.dataset.k = 'cancelar-' + i;
        linha.append(x);
        fila.append(linha);
      });
      // as vagas livres e a vaga a mais
      const livres = el('div', 'ind-vagas');
      for (let k = st.fila.length; k < vagas; k++) { const v = el('div', 'ind-vaga'); v.append(icone('ui/vaga', 26), el('span', '', T.industria.vagaLivre)); livres.append(v); }
      const amp = proximaVaga(m, e);
      if (amp) {
        const v = el('div', 'ind-vaga trancada'), rot = el('div', 'rot');
        rot.append(el('b', '', T.industria.vagaAMais));
        v.append(icone('ui/cadeado', 22), rot);
        if (amp.nivel > m.progresso.nivel) rot.append(el('small', '', T.industria.vagaNoNivel(amp.nivel)));
        else {
          const bO = botao({ classe: m.posses.ouro < amp.custo.ouro ? 'sem' : '', rotulo: T.industria.comOuro(amp.custo.ouro), aoClicar: () => abrirVaga(false) });
          bO.append(preco('icone/ouro', amp.custo.ouro)); bO.dataset.k = 'vaga-ouro';
          v.append(bO);
          if (amp.cash > 0) {
            const bC = botao({ classe: m.posses.cash < amp.cash ? 'sem' : '', rotulo: T.industria.comCash(amp.cash), aoClicar: () => abrirVaga(true) });
            bC.append(preco('icone/cash', amp.cash)); bC.dataset.k = 'vaga-cash';
            v.append(bC);
          }
        }
        livres.append(v);
      }
      if (st.fila.length) caixa.append(fila);
      if (livres.firstChild) caixa.append(livres);

      // as receitas desta construção: primeiro as que o nível já deixa, depois as que vêm mais tarde
      caixa.append(el('div', 'secao', T.industria.receitas));
      const lista = receitasDaConstrucao(m, e.tipo).slice().sort((a, b) => a.nivel - b.nivel), grade = el('div', 'grade ind-receitas');
      if (!lista.length) caixa.append(el('div', 'vazio', T.industria.semReceita));
      for (const r of lista) {
        const travada = r.nivel > m.progresso.nivel, c = el('div', 'oferta ind-receita' + (travada ? ' travada' : ''));
        c.dataset.item = r.item; c.dataset.receita = r.id;
        const nome = el('div', 'nome', r.nome);
        if (r.n > 1) nome.append(el('small', '', ' ' + T.industria.da(r.n)));
        c.append(icone('icone/' + r.item, travada ? 36 : 44), nome);
        if (travada) { const t = el('div', 'info trava'); t.append(icone('ui/cadeado', 18), el('span', '', T.industria.nivel(r.nivel))); c.append(t); grade.append(c); continue; }
        const info = el('div', 'info ind-tempo'); info.append(icone('ui/relogio', 18), el('span', '', tempo(r.tempoSeg)));
        const p = podeProduzir(m, e, r.id);
        const b = botao({ texto: T.industria.fazer, classe: 'verde' + (p.ok ? '' : ' sem') + (p.ok && daMissao === r.item ? ' alvo-tutorial' : ''), aoClicar: () => mandar({ tipo: 'produzir', entidade: id, receita: r.id }) });
        b.dataset.k = 'fazer-' + r.id;
        const ing = el('div', 'ind-ingredientes');
        for (const k in r.entra) ing.append(ficha(m, k, r.entra[k]));
        c.append(info, b, ing);
        grade.append(c);
      }
      caixa.append(grade);
      // no pé: mudar a construção de lugar (os botões são da frente de construir)
      const pe = linhaDeArrumar(e.id, ctx);
      if (pe.firstChild) { pe.classList.add('ind-pe'); caixa.append(pe); }
    }

    function desenhar() {
      const m = J.mundo, e = construcaoPorId(m, id), def = e && defDe(m, e.tipo);
      if (!e || !def || !estaPronta(e) || !ehIndustria(m, e)) { ctx.fechar(); return; }
      const duas = e.tipo === BANCADA && !!PAINEIS.construir;
      if (!duas) aba = 'produzir';
      if (aba === 'construir' && api) { if (api.atualizar) api.atualizar(); return; }
      // só refaz quando muda o que o painel mostra (o relógio da receita anda sem refazer)
      const st = estadoDaIndustria(m, e) || VAZIA, amp = proximaVaga(m, e), tem = {};
      for (const r of receitasDaConstrucao(m, e.tipo)) for (const k in r.entra) tem[k] = quantoTem(m, k);
      const novo = JSON.stringify([aba, st.fila, st.inicio > 0, st.saida, vagasDaFila(m, e), m.progresso.nivel, m.posses.ouro, amp ? m.posses.cash >= amp.cash : 0, tem, dicaDaVez(m, e, st), itemDaMissao(m)]);
      if (novo === sinal) { relogio(); return; }
      sinal = novo;
      if (api && api.aoFechar) api.aoFechar();
      api = null; fio = null; tFalta = null;
      corpo.textContent = '';
      saldo(m);
      const caixa = el('div', 'ind');
      if (duas) {
        const linha = el('div', 'abas');
        for (const a of ['produzir', 'construir']) {
          const b = botao({ texto: a === 'produzir' ? T.industria.abaProduzir : T.industria.abaConstruir, classe: 'aba' + (a === aba ? ' ativo' : ''), aoClicar: () => { if (aba === a) return; aba = a; sinal = ''; som.tocar('toque'); desenhar(); focar('ind-aba-' + a); } });
          b.dataset.k = 'ind-aba-' + a;
          linha.append(b);
        }
        caixa.append(linha);
      }
      corpo.append(caixa);
      if (aba === 'construir') { const div = el('div', 'ind-construir'); caixa.append(div); api = PAINEIS.construir.montar(div, ctx, null) || {}; return; }
      produzir(m, e, caixa);
      relogio();
    }
    function relogio() {
      if (!fio || !fio.isConnected) return;
      const m = J.mundo, e = construcaoPorId(m, id);
      if (!e) return;
      fracao(fio, andamentoDaFila(m, e));
      por(tFalta, T.industria.falta(faltaDaFila(m, e)));
    }
    desenhar();
    const tique = setInterval(relogio, 250); // o relógio da receita anda mesmo sem evento nenhum
    return { atualizar: desenhar, aoFechar() { clearInterval(tique); if (api && api.aoFechar) api.aoFechar(); } };
  },
});

// ---------- a ligação com os eventos do mundo ----------
const GRAVA = ['enfileirou', 'receitaPronta', 'retirouProduto', 'cancelouReceita', 'reordenouFila', 'entregou', 'trocouPedido', 'chegouPedido'];
const VERDE = '#d9ffb0';
aoInstalarMundo((m) => {
  const ev = m.eventos, part = J.cena.part, D = m.dados;
  const aVista = (idDaEntidade) => { const e = construcaoPorId(m, idDaEntidade) || m.local.porId[idDaEntidade]; return e && (e.local || 'fazenda') === m.personagem.local && !painelAberto() ? e : null; };
  for (const k of GRAVA) ev.ouvir(k, () => J.gravarLogo());
  ev.ouvir('enfileirou', () => marcarDica(m, 'fila'));
  ev.ouvir('receitaPronta', (d) => {
    const e = aVista(d.entidade);
    if (e) part.brilho(e.x + e.l / 2, 1.2, e.z + e.p / 2, 10);
    if (painelAberto() !== 'industria') avisar(T.ganhos.receitaPronta(d, D), 'bom', 3600);
  });
  ev.ouvir('retirouProduto', (d) => {
    marcarDica(m, 'retirar');
    const e = aVista(d.entidade);
    if (e) { part.brilho(e.x + e.l / 2, 1.2, e.z + e.p / 2, 12); part.texto(T.ganhos.retirouProduto(d, D), e.x + e.l / 2, 2.2, e.z + e.p / 2, VERDE); }
    else avisar(T.ganhos.retirouProduto(d, D), 'bom');
  });
  ev.ouvir('cancelouReceita', (d) => { marcarDica(m, 'cancelar'); avisar(T.ganhos.cancelouReceita(d), 'bom'); });
  ev.ouvir('reordenouFila', () => marcarDica(m, 'cancelar'));
  ev.ouvir('ampliou', (d) => { const e = construcaoPorId(m, d.entidade); if (e && ehIndustria(m, e)) marcarDica(m, 'vaga'); });
  // o quadro de pedidos
  ev.ouvir('entregou', (d) => {
    const cfg = pedidosDe(D), c = cfg && cfg.clientes.find((x) => x.id === d.cliente), e = aVista(QUADRO);
    if (e) part.brilho(e.x + e.l / 2, 1.2, e.z + e.p / 2, 14);
    avisar(T.pedidos.entregou(c ? c.nome : ''), 'bom', 3600);
  });
  ev.ouvir('chegouPedido', () => { if (painelAberto() !== 'pedidos') avisar(T.pedidos.chegou, 'bom'); });
});
