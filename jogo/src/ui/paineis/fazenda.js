// Painel "Minha fazenda": a porta de entrada do progresso. Em cima, o que está esperando para receber (presente do
// dia, presentes de amigos, prêmios de conquista); depois os atalhos (conquistas, presente do dia, amigos,
// guarda-roupa, loja de cash, caderno do vizinho, terras) e o nome da fazenda, que aparece na foto e no convite.
import { el, botao } from '../dom.js';
import { T, numero } from '../textos.js';
import '../textos/interface.js';
import { J } from '../../contexto.js';
import { registrarPainel, abrirPainel, PAINEIS } from './registro.js';
import { ICONE, mandar } from '../progresso.js';
import { avisar } from '../avisos.js';
import { som } from '../../plataforma/som.js';
import { listaDeConquistas, conquistasProntas } from '../../nucleo/sistemas/conquistas.js';
import { estadoDaDiaria } from '../../nucleo/sistemas/diaria.js';
import { estadoDosAmigos } from '../../nucleo/sistemas/amigos.js';
import { guardaRoupa } from '../../nucleo/sistemas/roupas.js';

registrarPainel({
  id: 'fazenda', titulo: T.fazenda.titulo, icone: ICONE.fazenda, ordem: 35,
  montar(corpo) {
    const F = T.fazenda, receber = el('div', 'para-receber'), atalhos = el('div', 'atalhos'), nome = el('div', 'nome-da-fazenda');
    corpo.append(receber, atalhos, nome);

    // o nome: montado uma vez só (redesenhar o painel não apaga o que está sendo digitado)
    const area = el('textarea');
    area.rows = 1; area.maxLength = 24; area.spellcheck = false; area.id = 'nome-da-fazenda';
    area.placeholder = F.nomeVazio; area.setAttribute('aria-label', F.nome);
    area.value = J.mundo.amigos.nome;
    const guardar = () => { const r = mandar({ tipo: 'nomearFazenda', nome: area.value }); if (r.ok) { area.value = r.dados.nome; som.tocar('toque'); avisar(F.guardado, 'bom'); } };
    area.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); guardar(); } });
    const bt = botao({ texto: F.guardar, aoClicar: guardar }); bt.dataset.k = 'guardar-nome';
    const rot = el('div', 'rotulo'); rot.append(el('span', '', F.nome), el('small', '', F.nomeInfo));
    const linha = el('div', 'linha'); linha.append(area, bt);
    nome.append(rot, linha);

    function atalho(id, ic, titulo, resumo, ponto) {
      const b = botao({ icone: ic, tamanho: 40, classe: 'atalho', aoClicar: () => { som.tocar('toque'); abrirPainel(id); } });
      const t = el('span', 'rot'); t.append(el('b', '', titulo), el('small', '', resumo));
      b.append(t);
      if (ponto) b.append(el('span', 'ponto'));
      b.dataset.k = 'ir-' + id;
      atalhos.append(b);
    }
    function desenhar() {
      const m = J.mundo, D = m.dados, dia = estadoDaDiaria(m), A = estadoDosAmigos(m), prontas = conquistasProntas(m);
      // ---- para receber
      receber.textContent = '';
      const lista = el('div', 'itens');
      const pedir = (k, ic, texto, f) => { const b = botao({ icone: ic, tamanho: 28, texto, classe: 'verde', aoClicar: f }); b.dataset.k = k; lista.append(b); };
      if (A.presenteDeConvidado === 'espera') pedir('receber-convite', ICONE.amigos, F.presenteDeConvite, () => mandar({ tipo: 'receberConvite' }));
      if (A.aReceber > 0) pedir('receber-amigo', ICONE.amigos, F.presentesDeAmigos(A.aReceber), () => mandar({ tipo: 'receberDeAmigo' }));
      if (dia.tem) pedir('receber-presente', ICONE.presentes, F.presenteDoDia, () => mandar({ tipo: 'abrirPresente' }));
      if (prontas > 0) pedir('receber-conquistas', ICONE.conquistas, F.conquistasProntas(prontas), () => { som.tocar('toque'); abrirPainel('conquistas'); });
      if (lista.childNodes.length) receber.append(el('div', 'secao', F.esperando), lista);
      // ---- os atalhos
      atalhos.textContent = '';
      let feitos = 0, total = 0;
      for (const c of listaDeConquistas(m)) { feitos += c.recebidos; total += c.marcos.length; }
      let pecas = 0;
      for (const g of guardaRoupa(m)) for (const p of g.itens) if (p.tem) pecas++;
      const licoes = D.missoes.vizinho.filter((x) => m.missoes.feitas.includes(x.id)).length;
      atalho('conquistas', ICONE.conquistas, F.conquistas, prontas > 0 ? F.conquistasProntas(prontas) : F.resumo.conquistas(feitos, total), prontas > 0);
      atalho('presentes', ICONE.presentes, F.presentes, dia.tem ? F.resumo.presenteHoje : F.resumo.presenteAmanha, dia.tem);
      atalho('amigos', ICONE.amigos, F.amigos, A.aReceber > 0 ? F.presentesDeAmigos(A.aReceber) : F.resumo.amigos, A.aReceber > 0 || A.presenteDeConvidado === 'espera');
      atalho('guarda-roupa', ICONE.roupas, F.roupas, F.resumo.roupas(pecas), false);
      atalho('cash', ICONE.cash, F.cash, F.resumo.cash(numero(m.posses.cash)), false);
      atalho('caderno', ICONE.caderno, F.caderno, F.resumo.caderno(licoes), false);
      if (PAINEIS.terras) atalho('terras', 'ui/lote', F.terras, F.resumo.terras, false); // (as terras saíram da loja)
    }
    desenhar();
    return { atualizar: desenhar };
  },
});
