// A loja de cash: o saldo, os pacotes (COMPRA SIMULADA: nenhuma cobrança é feita, e isso fica escrito na tela) e o
// que o cash compra: roupa, enfeite de fazenda, bicho de estimação especial, tempo e vaga de fila. Nada de útil é
// exclusivo do cash: onde os dados têm os dois preços (vaga de fila), os dois aparecem.
import { el, icone, botao } from '../dom.js';
import { T, numero, tempo } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel, abrirPainel } from './registro.js';
import { ICONE, chaveOu, porVoltar, mandar, relogioEmTeste } from '../progresso.js';
import { perguntar } from '../dialogo.js';
import { botaoConcluir } from '../concluir.js';
import { som } from '../../plataforma/som.js';
import { lojaDeCash, precoDeConcluir } from '../../nucleo/sistemas/cash.js';
import { progressoDe } from '../../nucleo/premios.js';

const ESCADA = [60, 900, 3600, 28800]; // exemplos de preço de concluir: 1 min, 15 min, 1 h, 8 h
const cash = (n) => { const s = el('span', 'preco'); s.append(icone('icone/cash', 18), el('span', '', numero(n))); return s; };
const ouro = (n) => { const s = el('span', 'preco'); s.append(icone('icone/ouro', 18), el('span', '', numero(n))); return s; };

registrarPainel({
  id: 'cash', titulo: T.cash.titulo, icone: ICONE.cash, ordem: 39, botao: false,
  montar(corpo, ctx, arg) {
    porVoltar(corpo, arg);
    const C = T.cash;
    function comprarPacote(p) {
      perguntar({ icone: 'icone/cash', titulo: C.titulo, texto: C.perguntaPacote(p.nome, p.cash, p.precoBRL), nota: C.teste, sim: C.comprar, aoSim: () => mandar({ tipo: 'comprarCash', pacote: p.id }) });
    }
    function comprarOferta(o) {
      perguntar({ icone: 'icone/cash', titulo: C.titulo, texto: C.perguntaOferta(o.nome, o.cash), nota: C.saldo(J.mundo.posses.cash), sim: C.comprar, aoSim: () => mandar({ tipo: 'comprarOferta', oferta: o.id }) });
    }
    // uma oferta de loja.json: ícone, nome, uma linha de informação e o botão com o preço (ou por que não dá)
    function cartao(m, o, ic, info) {
      const D = m.dados, c = el('div', 'oferta'), p = o.pode;
      c.dataset.oferta = o.id;
      c.append(icone(ic, 44), el('div', 'nome', o.nome));
      const trava = (texto, cadeado) => { const i = el('div', 'info trava'); if (cadeado) i.append(icone('ui/cadeado', 18)); i.append(el('span', '', texto), cash(o.cash)); c.append(i); c.classList.add('travada'); };
      if (o.tem && (p.motivo === 'ja-tem' || p.motivo === 'limite')) { const i = el('div', 'info dono', C.tem); c.append(i); c.classList.add('comprada'); }
      else if (p.motivo === 'em-breve') trava(C.emBreve, false);
      else if (p.motivo === 'nivel-baixo') trava(C.nivel(p.dados.nivel), true);
      else if (p.motivo === 'nao-existe' || p.motivo === 'nao-vende') trava(C.emBreve, false);
      else {
        c.append(el('div', 'info', info || (D.itens[o.alvo] && D.itens[o.alvo].descricao) || ''));
        const bs = el('div', 'botoes'), b = botao({ classe: 'verde', aoClicar: () => { if (J.mundo.posses.cash < o.cash) mandar({ tipo: 'comprarOferta', oferta: o.id }); else comprarOferta(o); } });
        b.append(el('span', '', C.comprar), cash(o.cash)); b.dataset.k = 'oferta-' + o.id;
        if (p.motivo === 'sem-cash') b.classList.add('sem');
        bs.append(b); c.append(bs);
      }
      return c;
    }
    function desenhar() {
      const m = J.mundo, D = m.dados, L = lojaDeCash(m), R = progressoDe(D).concluir;
      corpo.textContent = '';
      ctx.saldo.textContent = '';
      ctx.saldo.append(icone('icone/cash', 20), el('span', '', numero(m.posses.cash)));

      // ---- pacotes (compra simulada)
      if (L.compraSimulada && L.pacotes.length) {
        corpo.append(el('div', 'secao', C.pacotes), el('div', 'nota aviso-de-teste', C.teste));
        const grade = el('div', 'grade pacotes');
        for (const p of L.pacotes) {
          const c = el('div', 'oferta pacote');
          c.dataset.pacote = p.id;
          c.append(icone('icone/cash', 44), el('div', 'nome', p.nome));
          const i = el('div', 'info'); i.append(cash(p.cash)); c.append(i);
          const bs = el('div', 'botoes'), b = botao({ texto: C.reais(p.precoBRL), classe: 'verde', aoClicar: () => comprarPacote(p) });
          b.dataset.k = 'pacote-' + p.id; bs.append(b); c.append(bs);
          grade.append(c);
        }
        corpo.append(grade);
      }
      corpo.append(el('div', 'nota', C.soEnfeita));

      // ---- o que o cash compra
      const secao = (titulo, classe, f) => {
        const lista = L.ofertas.filter((o) => o.classe === classe);
        if (!lista.length) return;
        corpo.append(el('div', 'secao', titulo));
        const grade = el('div', 'grade');
        for (const o of lista) grade.append(f(o));
        corpo.append(grade);
      };
      secao(C.roupas, 'cosmetico', (o) => cartao(m, o, 'icone/' + o.alvo, C.vaiParaOGuardaRoupa));
      if (L.ofertas.some((o) => o.classe === 'cosmetico')) {
        const b = botao({ icone: ICONE.roupas, tamanho: 26, texto: C.verRoupas, aoClicar: () => { som.tocar('toque'); abrirPainel('guarda-roupa', { de: 'cash' }); } });
        b.dataset.k = 'ver-roupas';
        const l = el('div', 'linha atalho-da-secao'); l.append(b); corpo.append(l);
      }
      secao(C.enfeites, 'construcao', (o) => cartao(m, o, chaveOu('icone/' + o.alvo, 'objeto/' + o.alvo), C.guardado));
      secao(C.animais, 'animal', (o) => {
        const def = (D.bruto.animais && D.bruto.animais[o.alvo]) || {}, comum = o.alvo.split('-')[0];
        return cartao(m, o, chaveOu('icone/' + o.alvo, 'icone/' + comum, `animal/${comum}/parado-frente`), C.especial(def.familia));
      });

      // ---- tempo: o botão de concluir aparece onde há relógio; aqui, só a explicação e a tabela de preços
      if (R.vale.length && R.coef > 0) {
        corpo.append(el('div', 'secao', C.tempo));
        const info = el('div', 'linha tempo'); info.append(icone('ui/relogio', 36), el('div', 'nota', C.tempoInfo(R.gratisAteSeg)));
        corpo.append(info);
        const escada = el('div', 'itens escada');
        for (const seg of ESCADA) { const e = el('div', 'item'); e.append(el('span', '', tempo(seg)), cash(precoDeConcluir(m, seg))); escada.append(e); }
        corpo.append(escada);
        const t = relogioEmTeste();
        if (t) { const l = el('div', 'linha relogio-de-teste'); l.append(el('span', '', T.concluir.teste), botaoConcluir(t.tipo, t.alvo, { k: 'concluir-teste' })); corpo.append(l); }
      }

      // ---- vaga de fila: os dois preços, lado a lado (compra-se na própria bancada)
      const vagas = Object.values(L.vagas);
      if (vagas.length) {
        corpo.append(el('div', 'secao', C.vaga));
        const info = el('div', 'linha tempo'); info.append(icone('ui/vaga', 36), el('div', 'nota', C.vagaInfo));
        corpo.append(info);
        // as bancadas que o nível já libera; antes disso, a primeira, de exemplo
        const liberadas = vagas.filter((v) => v.nivel <= m.progresso.nivel), mostra = liberadas.length ? liberadas : vagas.slice(0, 1);
        const tabela = el('div', 'vagas');
        for (const v of mostra) {
          tabela.append(el('div', 'de', v.nome));
          for (const a of v.lista) {
            const l = el('div', 'vaga' + (a.nivel > m.progresso.nivel ? ' travada' : ''));
            l.append(el('span', 'qual', a.nome || C.vaga), el('span', 'nivel', C.nivel(a.nivel)));
            const p = el('span', 'precos'); if (a.ouro > 0) p.append(ouro(a.ouro), el('span', 'ou', C.ou)); p.append(cash(a.cash));
            l.append(p); tabela.append(l);
          }
        }
        corpo.append(tabela);
      }
    }
    desenhar();
    return { atualizar: desenhar };
  },
});
