// Painel das terras: os lotes do mapa, na ordem em que se compram. Cada um diz o preço, o tamanho e o que falta
// (nível, outro lote antes, ouro). A compra pergunta na própria página antes de gastar. Abre pelo toque na placa
// de um lote (chega com { lote }) e pela aba "Terras" da loja.
import { el, icone, botao } from '../dom.js';
import '../terras.js'; // os textos, o desenho e o retorno desta frente
import { T, numero, frase } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel, fecharPainel } from './registro.js';
import { ABAS_DE_FORA } from './loja.js';
import { situacaoDosLotes } from '../../nucleo/sistemas/lotes.js';
import { perguntar } from '../dialogo.js';
import { avisar } from '../avisos.js';
import { som } from '../../plataforma/som.js';

function preco(n) { const s = el('span', 'preco'); s.append(icone('icone/ouro', 18), el('span', '', numero(n))); return s; }

registrarPainel({
  id: 'terras', titulo: T.terras.titulo, icone: 'ui/lote', ordem: 35, botao: false,
  montar(corpo, ctx, arg) {
    let pedido = (arg && arg.lote) || null; // o lote da placa tocada: vai para o alto da lista, em destaque
    function comprar(l) {
      const fazer = () => {
        const r = J.mundo.comando({ tipo: 'comprarLote', lote: l.id });
        if (!r.ok) { som.tocar('erro'); if (r.motivo !== 'sem-ouro') avisar(frase(r.motivo, r.dados, J.dados)); return; }
        fecharPainel(true); // a festa é no mapa: o painel sai da frente
      };
      if (!perguntar({ icone: 'ui/lote', titulo: l.nome, texto: T.terras.pergunta(l), nota: T.terras.tamanho(l), sim: T.terras.confirmar(l.preco), nao: T.terras.desistir, aoSim: fazer })) fazer();
    }
    function verNoMapa(l) {
      const a = l.area, cam = J.cena.cam;
      fecharPainel();
      cam.seguindo = false; cam.pular((a[0] + a[2]) / 2, (a[1] + a[3]) / 2); // a câmera volta a seguir na próxima ordem
    }
    function desenhar() {
      const m = J.mundo, lista = situacaoDosLotes(m);
      corpo.textContent = '';
      ctx.saldo.textContent = '';
      ctx.saldo.append(icone('icone/ouro', 20), el('span', '', numero(m.posses.ouro)));
      if (pedido) lista.sort((a, b) => (b.lote.id === pedido) - (a.lote.id === pedido));
      const grade = el('div', 'grade lotes');
      for (const s of lista) {
        const l = s.lote, c = el('div', 'oferta lote ' + s.estado + (l.id === pedido ? ' pedido' : ''));
        c.dataset.lote = l.id;
        c.append(icone('ui/lote', 44), el('div', 'nome', l.nome));
        c.append(el('div', 'info', T.terras.tamanho(l) + (l.descricao ? '. ' + l.descricao : '')));
        const bs = el('div', 'botoes');
        if (s.estado === 'comprado') {
          const info = el('div', 'info dono'); info.append(el('span', '', T.terras.comprado));
          c.append(info);
        } else if (s.estado === 'nivel' || s.estado === 'exige') {
          const info = el('div', 'info trava'); info.append(icone('ui/cadeado', 18), el('span', '', s.estado === 'nivel' ? T.terras.nivel(l.nivel) : T.terras.exige(s.exige)), preco(l.preco));
          c.append(info);
        } else {
          if (s.estado === 'ouro') c.append(el('div', 'info falta', T.terras.falta(s.falta)));
          const b = botao({ classe: 'verde', aoClicar: () => comprar(l) });
          b.append(el('span', '', T.terras.comprar), preco(l.preco)); b.dataset.k = 'lote-' + l.id;
          if (s.estado === 'ouro') b.classList.add('sem');
          bs.append(b);
        }
        const ver = botao({ texto: T.terras.ver, aoClicar: () => verNoMapa(l) });
        ver.dataset.k = 'ver-' + l.id;
        bs.append(ver);
        c.append(bs);
        grade.append(c);
      }
      corpo.append(grade);
    }
    desenhar();
    return { atualizar: desenhar };
  },
});

// a aba "Terras" da loja leva a este painel
ABAS_DE_FORA.push({ id: 'terras', nome: T.terras.aba, painel: 'terras' });
