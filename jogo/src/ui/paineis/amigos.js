// Painel dos amigos: o convite (código e link para copiar) e a foto da fazenda. Não há servidor: o jogo não fica
// sabendo sozinho que o amigo chegou, e por isso há um botão de teste que simula a chegada. Nada é publicado em
// nome do jogador: o convite é um texto copiado e a foto é uma imagem mostrada na tela, para ele guardar se quiser.
import { el, icone, botao } from '../dom.js';
import { T } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel } from './registro.js';
import { ICONE, porVoltar, mandar } from '../progresso.js';
import { fichasDaRecompensa } from './missoes.js';
import { avisar } from '../avisos.js';
import { som } from '../../plataforma/som.js';
import { tirarFoto, copiarTexto, enderecoDoConvite } from '../../plataforma/foto.js';
import { estadoDosAmigos } from '../../nucleo/sistemas/amigos.js';

registrarPainel({
  id: 'amigos', titulo: T.amigos.titulo, icone: ICONE.amigos, ordem: 38, botao: false,
  montar(corpo, ctx, arg) {
    porVoltar(corpo, arg);
    const A = T.amigos, m0 = J.mundo, D = m0.dados, e0 = estadoDosAmigos(m0);
    // as partes que mudam com o jogo; o resto é montado uma vez (o texto selecionado e a foto não se perdem)
    const conta = el('div', 'chegaram'), agrado = el('div', 'agrado');
    const textoDoConvite = () => { const e = estadoDosAmigos(J.mundo); return A.texto(e.nome, enderecoDoConvite(e.codigo)); };

    // ---------- convidar ----------
    corpo.append(el('div', 'secao', A.convidar));
    if (!e0.ligado) corpo.append(el('div', 'nota', A.desligado));
    else {
      corpo.append(el('div', 'nota', A.comoFunciona(e0.nivel)));
      const ganhos = el('div', 'colunas ganhos'), c1 = el('div'), c2 = el('div');
      c1.append(el('div', 'quem', A.voceGanha), fichasDaRecompensa(D, e0.porAmigo));
      c2.append(el('div', 'quem', A.amigoGanha), fichasDaRecompensa(D, e0.convidado));
      ganhos.append(c1, c2);
      const linha = el('div', 'linha convite'), cod = el('div', 'codigo');
      cod.append(el('small', '', A.codigo), el('b', '', e0.codigo.toUpperCase()));
      const area = el('textarea'); area.readOnly = true; area.rows = 3; area.id = 'texto-do-convite'; area.value = textoDoConvite();
      const nota = el('div', 'nota bom'); nota.id = 'nota-do-convite'; nota.hidden = true;
      const copiar = botao({ icone: ICONE.amigos, tamanho: 28, texto: A.copiar, classe: 'verde', aoClicar: () => {
        area.value = textoDoConvite(); // o nome da fazenda pode ter mudado
        const ok = copiarTexto(area.value, area);
        nota.hidden = false; nota.textContent = ok ? A.copiado : A.naoCopiou; nota.className = 'nota ' + (ok ? 'bom' : 'ruim');
        som.tocar(ok ? 'toque' : 'erro');
        if (ok) try { copiar.focus({ preventScroll: true }); } catch { /* o texto fica selecionado */ }
      } });
      copiar.dataset.k = 'copiar-convite';
      linha.append(cod, copiar);
      corpo.append(ganhos, linha, area, nota, conta);
      // sem servidor: o botão de teste
      const sim = botao({ texto: A.simular(e0.nivel), aoClicar: () => { const e = estadoDosAmigos(J.mundo); mandar({ tipo: 'amigoChegou', codigo: 'amigo' + (e.chegaram + 1) }); } });
      sim.dataset.k = 'simular-amigo';
      const teste = el('div', 'caixa-de-teste'); teste.append(el('div', 'nota', A.semServidor), sim);
      corpo.append(teste);
    }

    // ---------- a foto da fazenda ----------
    corpo.append(el('div', 'secao', A.compartilhar), el('div', 'nota', A.fotoInfo), agrado);
    const moldura = el('div', 'foto'); moldura.hidden = true;
    const img = el('img'); img.alt = A.legenda; img.id = 'foto-da-fazenda';
    const areaFoto = el('textarea'); areaFoto.readOnly = true; areaFoto.rows = 2; areaFoto.id = 'texto-da-foto';
    const notaFoto = el('div', 'nota bom');
    moldura.append(img, el('div', 'nota', A.guardarFoto), areaFoto, notaFoto);
    const tirar = botao({ icone: ICONE.foto, tamanho: 28, texto: A.foto, classe: 'verde', aoClicar: () => {
      const m = J.mundo, e = estadoDosAmigos(m);
      const url = tirarFoto(document.getElementById('tela'), { titulo: T.titulo, nome: e.nome });
      if (!url) { som.tocar('erro'); avisar(A.semFoto); return; }
      img.src = url; moldura.hidden = false;
      areaFoto.value = A.textoDaFoto(e.nome, e.ligado ? enderecoDoConvite(e.codigo) : '');
      const ok = copiarTexto(areaFoto.value, areaFoto);
      notaFoto.textContent = ok ? A.textoCopiado : A.naoCopiou; notaFoto.className = 'nota ' + (ok ? 'bom' : 'ruim');
      som.tocar('toque');
      const r = m.comando({ tipo: 'compartilhar', modo: 'foto' });
      if (r.ok && r.dados.recompensa && r.dados.recompensa.ouro > 0) avisar(A.ganhouAgrado(r.dados.recompensa.ouro), 'bom');
      try { tirar.focus({ preventScroll: true }); if (moldura.scrollIntoView) moldura.scrollIntoView({ block: 'nearest' }); } catch { /* sem foco */ }
    } });
    tirar.dataset.k = 'tirar-foto';
    corpo.append(tirar, moldura);

    function atualizar() {
      const m = J.mundo, e = estadoDosAmigos(m);
      conta.textContent = '';
      conta.append(el('span', '', A.chegaram(e.chegaram, e.limite)));
      if (e.presenteDeConvidado === 'espera') { const b = botao({ icone: ICONE.presentes, tamanho: 26, texto: T.fazenda.presenteDeConvite, classe: 'verde', aoClicar: () => mandar({ tipo: 'receberConvite' }) }); b.dataset.k = 'receber-convite'; conta.append(b); }
      if (e.aReceber > 0) { const b = botao({ icone: ICONE.presentes, tamanho: 26, texto: A.abrir(e.aReceber), classe: 'verde', aoClicar: () => mandar({ tipo: 'receberDeAmigo' }) }); b.dataset.k = 'receber-amigo'; conta.append(b); }
      if (e.convidadoPor) conta.append(el('small', '', A.convidadoPor(e.convidadoPor.toUpperCase())));
      agrado.textContent = '';
      const S = e.compartilhar;
      if (S.ligado && S.recompensa.ouro > 0) {
        if (S.ganhouHoje) agrado.append(el('span', 'nota', A.agradoHoje));
        else { const p = el('span', 'preco'); p.append(icone('icone/ouro', 18), el('span', '', String(S.recompensa.ouro))); agrado.append(el('span', 'nota', A.agrado), p); }
      }
    }
    atualizar();
    return { atualizar };
  },
});
