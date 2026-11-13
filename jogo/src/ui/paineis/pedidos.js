// O painel do quadro de pedidos: cada pedido é um bilhete preso no quadro, com o nome de quem pede, o que pede
// (figura e "tem/precisa"), o que paga (ouro e experiência), "Entregar" (aceso só com tudo em mãos) e "Trocar".
// Vaga que espera mostra o tempo que falta; vaga trancada mostra o nível que a abre.
// Abre pelo toque no quadro (nucleo/sistemas/pedidos.js); não tem botão no HUD.
import { el, icone, botao, por } from '../dom.js';
import { T, numero, tempo } from '../textos.js';
import '../textos/industria.js';
import { J } from '../../contexto.js';
import { registrarPainel } from './registro.js';
import { perguntar } from '../dialogo.js';
import { som } from '../../plataforma/som.js';
import { dicaDoTonho, viuDica, marcarDica } from './industria.js';
import { missaoAtual } from '../../nucleo/sistemas/missoes.js';
import { quadroDePedidos } from '../../nucleo/sistemas/pedidos.js';

registrarPainel({
  id: 'pedidos', titulo: T.pedidos.titulo, icone: 'ui/pedidos', botao: false,
  montar(corpo, ctx) {
    let sinal = '', esperas = [], tTroca = null;
    // a primeira vez no quadro: o Seu Tonho explica (e o guia da missão deixa de apontar o quadro)
    let dica = !viuDica(J.mundo, 'quadro') ? 'quadro' : null;
    marcarDica(J.mundo, 'quadro');
    const mandar = (c) => J.mundo.comando(c); // o que não dá certo vira aviso sozinho (evento "faltou")
    const primeiroBotao = () => { const b = corpo.querySelector('button'); if (b) try { b.focus({ preventScroll: true }); } catch { /* sem foco */ } };

    function trocar(v) {
      const m = J.mundo, Q = quadroDePedidos(m);
      perguntar({
        icone: 'ui/pedidos', titulo: T.pedidos.tituloTroca, texto: Q.trocaGratis ? T.pedidos.perguntaTrocaGratis(v.nome) : T.pedidos.perguntaTroca(v.nome, Q.esperaDaTroca),
        sim: T.pedidos.simTroca, nao: T.pedidos.naoTroca, aoSim: () => { if (mandar({ tipo: 'trocarPedido', vaga: v.vaga }).ok) som.tocar('toque'); },
      });
    }
    function bilhete(m, v, daMissao) {
      const c = el('div', 'ped-bilhete' + (v.pode ? ' pode' : ''));
      c.dataset.vaga = v.vaga;
      c.append(el('i', 'ped-pino'), el('div', 'ped-cliente', v.nome));
      const linhas = el('div', 'ped-linhas');
      for (const l of v.linhas) {
        const d = el('div', 'ped-linha ' + (l.tem >= l.precisa ? 'tem' : 'falta'));
        d.append(icone('icone/' + l.item, 28), el('span', 'nome', m.dados.itens[l.item].nome), el('b', '', `${Math.min(l.tem, 999)}/${l.precisa}`));
        linhas.append(d);
      }
      const paga = el('div', 'ped-paga');
      paga.append(el('span', '', T.pedidos.paga), icone('icone/ouro', 20), el('b', '', numero(v.ouro)), icone('icone/xp', 20), el('b', '', numero(v.xp)));
      const bs = el('div', 'ped-botoes');
      const bE = botao({ texto: T.pedidos.entregar, classe: 'verde' + (v.pode ? (daMissao ? ' alvo-tutorial' : '') : ' sem'), aoClicar: () => mandar({ tipo: 'entregarPedido', vaga: v.vaga }) });
      bE.dataset.k = 'entregar-' + v.vaga;
      const bT = botao({ texto: T.pedidos.trocar, aoClicar: () => trocar(v) });
      bT.dataset.k = 'trocar-' + v.vaga;
      bs.append(bE, bT);
      c.append(linhas, paga, bs);
      return c;
    }

    function desenhar() {
      const m = J.mundo, Q = quadroDePedidos(m);
      if (!Q.aberto) { ctx.fechar(); return; }
      // depois da primeira entrega, a dica seguinte
      if (dica !== 'entregar' && m.pedidos.entregues > 0 && !viuDica(m, 'entregar')) dica = 'entregar'; // (quem já entregou não precisa mais da dica do quadro)
      if (dica === 'entregar' && viuDica(m, 'entregar')) dica = null;
      const a = missaoAtual(m), daMissao = !!a && !a.esperaNivel && a.missao.objetivo.evento === 'entregou';
      // só refaz quando muda o que o quadro mostra (os relógios andam sem refazer)
      const novo = JSON.stringify([Q.vagas.map((v) => (v.estado === 'pedido' ? [v.cliente, v.linhas, v.ouro] : 0)), Q.trancada, Q.trocaGratis, dica, daMissao]);
      if (novo === sinal) { relogio(); return; }
      sinal = novo; esperas = []; tTroca = null;
      corpo.textContent = '';
      ctx.saldo.textContent = '';
      ctx.saldo.append(icone('icone/ouro', 20), el('span', '', numero(m.posses.ouro)));
      const caixa = el('div', 'ped');
      if (dica) {
        const qual = dica;
        caixa.append(dicaDoTonho(qual, () => { if (qual === 'entregar') marcarDica(J.mundo, 'entregar'); dica = null; desenhar(); primeiroBotao(); }));
      }
      const quadro = el('div', 'ped-quadro');
      for (const v of Q.vagas) {
        if (v.estado === 'pedido') { quadro.append(bilhete(m, v, daMissao)); continue; }
        const c = el('div', 'ped-bilhete espera'), t = el('b');
        c.dataset.vaga = v.vaga;
        c.append(icone('ui/relogio', 34), el('span', '', T.pedidos.esperando), t);
        esperas.push({ t, vaga: v.vaga });
        quadro.append(c);
      }
      if (Q.trancada) {
        const c = el('div', 'ped-bilhete trancada');
        c.append(icone('ui/cadeado', 30), el('span', '', Q.trancada.vagas - Q.vagas.length > 1 ? T.pedidos.maisVagas(Q.trancada.vagas, Q.trancada.nivel) : T.pedidos.trancada(Q.trancada.nivel)));
        quadro.append(c);
      }
      if (!Q.vagas.length) quadro.append(el('div', 'vazio', T.pedidos.vazio));
      caixa.append(quadro);
      tTroca = el('div', 'nota ped-troca');
      caixa.append(tTroca);
      corpo.append(caixa);
      relogio();
    }
    function relogio() {
      if (!tTroca || !tTroca.isConnected) return;
      const Q = quadroDePedidos(J.mundo);
      for (const e of esperas) { const v = Q.vagas[e.vaga]; if (v) por(e.t, tempo(v.falta)); }
      por(tTroca, Q.trocaGratis ? T.pedidos.trocaGratis : T.pedidos.trocaEm(Q.trocaGratisEm));
    }
    desenhar();
    const tique = setInterval(relogio, 500); // as esperas andam mesmo sem evento nenhum
    return { atualizar: desenhar, aoFechar() { clearInterval(tique); if (dica === 'entregar') marcarDica(J.mundo, 'entregar'); } };
  },
});
