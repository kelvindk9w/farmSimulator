// Painel das configurações: som, esquema de controle no toque, tamanho dos botões, tela cheia, cópia de segurança
// por texto (exportar e importar) e recomeçar. A confirmação é feita aqui mesmo, sem janela do navegador.
import { el, botao } from '../dom.js';
import { T } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel } from './registro.js';
import { gravacao } from '../../plataforma/gravacao.js';
import { tela } from '../../plataforma/tela.js';
import { som } from '../../plataforma/som.js';

function opcao(titulo, info, ...controles) {
  const o = el('div', 'opcao'), r = el('div', 'rotulo'), c = el('div', 'escolha');
  r.append(el('span', '', titulo)); if (info) r.append(el('small', '', info));
  c.append(...controles); o.append(r, c);
  return o;
}
// vários botões, um só ativo
function escolha(chave, opcoes, atual, aoEscolher) {
  return opcoes.map(([valor, texto]) => {
    const b = botao({ texto, classe: valor === atual ? 'ativo' : '', aoClicar: () => { som.tocar('toque'); aoEscolher(valor); } });
    b.dataset.k = `${chave}-${valor}`;
    return b;
  });
}

registrarPainel({
  id: 'config', titulo: T.config.titulo, icone: 'ui/config', ordem: 40,
  montar(corpo, ctx) {
    let aberta = null, nota = null; // 'exportar' | 'importar' | 'recomecar'
    const C = T.config;
    function mudar(chave, valor) { J.prefs[chave] = valor; J.gravarPrefs(); desenhar(chave + '-' + valor); }
    function desenhar(foco) {
      corpo.textContent = '';
      corpo.append(opcao(C.som, C.somInfo, ...escolha('som', [[true, C.ligado], [false, C.desligado]], !!J.prefs.som, (v) => { som.ligar(v); mudar('som', v); if (v) som.tocar('toque'); })));
      corpo.append(opcao(C.esquema, C.esquemaInfo, ...escolha('esquema', [['toque', C.soToque], ['alavanca', C.alavanca], ['os-dois', C.osDois]], J.prefs.esquema, (v) => mudar('esquema', v))));
      corpo.append(opcao(C.botoes, C.botoesInfo, ...escolha('botoes', [['normal', C.normal], ['grande', C.grande]], J.prefs.botoes, (v) => mudar('botoes', v))));
      corpo.append(opcao(C.imagem, C.imagemInfo(!!(J.atlas && J.atlas.leve)), ...escolha('imagem', [['auto', C.imagemAuto], ['nitida', C.imagemNitida], ['leve', C.imagemLeve]], J.prefs.imagem || 'auto', (v) => mudar('imagem', v))));
      if (tela.podeTelaCheia()) {
        const b = botao({ texto: tela.emTelaCheia() ? C.sair : C.entrar, aoClicar: () => { tela.alternarTelaCheia(); setTimeout(() => desenhar('tela-cheia'), 350); } });
        b.dataset.k = 'tela-cheia';
        corpo.append(opcao(C.telaCheia, C.telaCheiaInfo, b));
      }
      // gravação e cópia de segurança
      corpo.append(el('div', 'secao', C.gravacao));
      corpo.append(el('div', 'nota' + (gravacao.disponivel ? '' : ' ruim'), gravacao.disponivel ? C.gravacaoInfo : C.semGravacao));
      const linha = el('div', 'linha botoes-config');
      const bt = (id, texto, classe) => { const b = botao({ texto, classe: (classe || '') + (aberta === id ? ' ativo' : ''), aoClicar: () => { som.tocar('toque'); aberta = aberta === id ? null : id; nota = null; desenhar('abre-' + id); } }); b.dataset.k = 'abre-' + id; return b; };
      linha.append(bt('exportar', C.exportar), bt('importar', C.importar), bt('recomecar', C.recomecar));
      corpo.append(linha);
      if (aberta === 'exportar') {
        const area = el('textarea'); area.readOnly = true; area.value = gravacao.exportar(J.mundo.salvar());
        area.addEventListener('focus', () => area.select());
        const copiar = botao({ texto: C.copiar, classe: 'verde', aoClicar: () => {
          // a área de transferência só funciona dentro do clique, e nem sempre: sem ela, fica o texto selecionado
          let ok = false;
          try { area.focus(); area.select(); ok = document.execCommand && document.execCommand('copy'); } catch { ok = false; }
          try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(area.value).then(() => {}, () => {}); } catch { /* fica o texto selecionado */ }
          nota = { texto: ok ? C.copiado : C.naoCopiou, bom: !!ok }; mostrarNota();
        } });
        copiar.dataset.k = 'copiar';
        corpo.append(el('div', 'nota', C.exportarInfo), area, copiar);
      } else if (aberta === 'importar') {
        const area = el('textarea'); area.placeholder = C.colar; area.id = 'importar-texto';
        const carregar = botao({ texto: C.carregar, classe: 'verde', aoClicar: () => {
          try {
            const obj = gravacao.importar(area.value);
            J.trocarMundo(obj); // lança erro com frase se a gravação não servir
            aberta = null; nota = { texto: C.importou, bom: true }; desenhar('abre-importar');
          } catch (e) { som.tocar('erro'); nota = { texto: T.erroDeGravacao(e.message), bom: false }; mostrarNota(); }
        } });
        carregar.dataset.k = 'carregar';
        corpo.append(el('div', 'nota', C.importarInfo), area, carregar);
      } else if (aberta === 'recomecar') {
        const sim = botao({ texto: C.sim, classe: 'ruim', aoClicar: () => { J.trocarMundo(null); ctx.fechar(); } }); sim.dataset.k = 'sim';
        const nao = botao({ texto: C.nao, aoClicar: () => { aberta = null; desenhar('abre-recomecar'); } }); nao.dataset.k = 'nao';
        const l = el('div', 'linha botoes-config'); l.append(nao, sim);
        corpo.append(el('div', 'nota ruim', C.certeza), l);
      }
      const n = el('div', 'nota'); n.id = 'nota-config'; n.hidden = true; corpo.append(n);
      mostrarNota();
      corpo.append(el('div', 'nota versao', C.versao));
      if (foco) { const b = corpo.querySelector(`[data-k="${foco}"]`); try { if (b) b.focus({ preventScroll: true }); } catch { /* sem foco */ } }
    }
    function mostrarNota() {
      const n = corpo.querySelector('#nota-config');
      if (!n) return;
      n.hidden = !nota;
      if (nota) { n.textContent = nota.texto; n.className = 'nota ' + (nota.bom ? 'bom' : 'ruim'); }
    }
    desenhar();
    return {};
  },
});
