// Painel do abrigo (galinheiro, curral, aprisco, estábulo): abre no toque na construção ou num bicho dela.
//   em cima      a figura, as vagas e o botão de recolher o que estiver pronto
//   cocho e água cada um com a barra, o que há para pôr e o botão "Encher" (a personagem vai lá e enche)
//   quem mora    um cartão por bicho: figura, nome, a barra do ciclo e o que falta
//   vagas        "Comprar galinha" (com o preço) enquanto houver vaga
//   ampliação    a próxima, com o custo (o comando é o da frente de construir)
//   fim de vida  o bicho que parou de produzir traz o botão "Escolher o destino": uma tela só dele, com as três
//                saídas (frigorífico, fazendeiro, ficar de estimação) e "Decidir depois". Sem pressa.
// arg = { entidade (id da construção), animal? (abre direto na tela do destino desse bicho) }
// As outras frentes põem botões seus aqui por paineis/extras-do-abrigo.js (o estábulo: "Ir a cavalo").
import { el, icone, botao, por } from '../dom.js';
import '../animais.js'; // os textos, o desenho no terreno e o retorno desta frente
import { T, numero, tempo } from '../textos.js';
import { J } from '../../contexto.js';
import { registrarPainel, abrirPainel } from './registro.js';
import { linhaDeArrumar, iconeDaConstrucao } from './construcao.js';
import { extrasDoAbrigo } from './extras-do-abrigo.js';
import { umBasta } from './animais.js';
import { perguntar } from '../dialogo.js';
import { botaoConcluir } from '../concluir.js';
import { som } from '../../plataforma/som.js';
import { construcaoPorId, defDe, proximaAmpliacao, faltaDaObra, andamentoDaObra } from '../../nucleo/sistemas/construcao.js';
import { fichaDeMaterial, botaoOndeConseguir, faltaComFonte } from '../fontes.js';
import { quantoTem, ferramentaNoCinto, ferramentaGuardada } from '../../nucleo/sistemas/posses.js';
import { animaisDe, animalPorId, defDoAnimal, estadoDoAbrigo, faltaNoAbrigo, ofertasDeAnimais, podeEncherCocho, podeEncherBebedouro, estaTratado } from '../../nucleo/sistemas/animais.js';
import { situacaoDoAnimal, vidaDoAnimal, prontosNoAbrigo, podeRecolher } from '../../nucleo/sistemas/producao.js';
import { missaoAtual } from '../../nucleo/sistemas/missoes.js';

function preco(n) { const s = el('span', 'preco'); s.append(icone('icone/ouro', 18), el('span', '', numero(n))); return s; }
const figuraDoBicho = (id, tamanho) => icone('animal/' + id + '/parada-frente', tamanho);
const naFila = (m, acao, entidade) => { const p = m.personagem, s = (t) => t && t.tipo === 'agir' && t.acao === acao && t.entidade === entidade; return s(p.tarefa) || p.fila.some(s); };
// o que a missão da vez pede (o botão que resolve ganha o contorno do tutorial)
function pedidoDaMissao(m) {
  const a = missaoAtual(m), o = a && !a.esperaNivel ? a.missao.objetivo : null;
  if (!o) return {};
  const f = o.filtro || {}, um = (v) => (Array.isArray(v) ? v[0] : v);
  return { evento: o.evento, animal: um(f.animal), abrigo: um(f.abrigo), item: um(f.item) };
}
// o custo de uma ampliação em fichas (as classes são as do cartão de construção)
function custo(m, c) {
  const linha = el('div', 'cons-custo');
  if (c.ouro > 0) { const f = el('span', 'cons-ficha' + (m.posses.ouro < c.ouro ? ' falta' : '')); f.append(icone('icone/ouro', 18), el('span', '', numero(c.ouro))); linha.append(f); }
  for (const k in c.itens) linha.append(fichaDeMaterial(m, k, c.itens[k])); // (o que falta: vermelho, "falta N", toque abre o "Onde conseguir?")
  return linha;
}
const sit = {}, vida = {}, falta = {};

registrarPainel({
  id: 'abrigo', titulo: T.animais.abrigo, icone: 'animal/galinha/parada-frente', ordem: 36, botao: false,
  montar(corpo, ctx, arg) {
    const id = arg && arg.entidade;
    let destinoDe = (arg && arg.animal) || null; // o bicho cuja tela de destino está aberta
    let assinatura = '', relogios = [], barraObra = null, tObra = null, montado = false;
    const cab = corpo.parentNode && corpo.parentNode.querySelector('header .titulo');
    const mandar = (c) => { const r = J.mundo.comando(c); if (!r.ok) som.tocar('erro'); return r; };
    const focar = (k) => { const b = corpo.querySelector(`[data-k="${k}"]`) || corpo.querySelector('button'); try { if (b) b.focus({ preventScroll: true }); } catch { /* sem foco */ } };

    // ---------- a tela do destino: três saídas, sem pressa ----------
    function telaDoDestino(m, e, a) {
      const d = defDoAnimal(m, a), D = m.dados, F = T.animais.fim, deEstimacao = a.fim === 'estimacao';
      const caixa = el('div', 'abr abr-fim'), topo = el('div', 'abr-fim-topo'), textos = el('div');
      textos.append(el('b', '', deEstimacao ? d.nome : F.titulo(d, D)), el('p', '', deEstimacao ? F.textoEstimacao(d) : F.texto(d, D, a.produzidos || 0)));
      topo.append(figuraDoBicho(d.id, 76), textos);
      const saidas = el('div', 'abr-saidas');
      const saida = (k, chaveDoIcone, titulo, info, ouro, aoClicar) => {
        const b = botao({ classe: 'abr-saida', aoClicar });
        const t = el('span', 'abr-saida-texto'); t.append(el('b', '', titulo), el('small', '', info));
        b.append(icone(chaveDoIcone, chaveDoIcone.startsWith('animal/') ? 52 : 40), t);
        if (ouro > 0) { const p = el('span', 'preco'); p.append(el('span', '', '+'), icone('icone/ouro', 18), el('span', '', numero(ouro))); b.append(p); }
        b.dataset.k = 'destino-' + k;
        saidas.append(b);
      };
      const vender = (destino) => perguntar({
        icone: 'icone/ouro', titulo: destino === 'frigorifico' ? F.frigorifico : F.fazendeiro, texto: F.pergunta(d, destino, d.fimDeVida[destino]), nota: F.nota,
        sim: F.sim(d.fimDeVida[destino]), nao: F.nao,
        aoSim: () => { const r = mandar({ tipo: 'destinoDoAnimal', id: a.id, destino }); if (r.ok) { som.tocar('moeda'); destinoDe = null; assinatura = ''; desenhar(); focar('recolher'); } },
      });
      saida('frigorifico', 'icone/ouro', F.frigorifico, F.frigorificoInfo, d.fimDeVida.frigorifico, () => vender('frigorifico'));
      saida('fazendeiro', 'icone/ouro', F.fazendeiro, F.fazendeiroInfo, d.fimDeVida.fazendeiro, () => vender('fazendeiro'));
      if (!deEstimacao) saida('estimacao', 'animal/' + d.id + '/parada-frente', F.estimacao(d), F.estimacaoInfo, 0, () => { const r = mandar({ tipo: 'destinoDoAnimal', id: a.id, destino: 'estimacao' }); if (r.ok) { som.tocar('pronto'); destinoDe = null; assinatura = ''; desenhar(); focar('recolher'); } });
      const pe = el('div', 'abr-pe');
      const depois = botao({ texto: deEstimacao ? F.manter(d) : F.depois, aoClicar: () => { som.tocar('toque'); destinoDe = null; assinatura = ''; desenhar(); focar('destino-' + a.id); } });
      depois.dataset.k = 'depois';
      pe.append(depois);
      caixa.append(topo, saidas, pe);
      return caixa;
    }

    // ---------- cocho e bebedouro ----------
    function medida(m, e, parte, st, pedido) {
      const D = m.dados, eCocho = parte === 'cocho', s = eCocho ? st.cocho : st.bebedouro, caixa = el('div', 'abr-medida ' + parte), textos = el('div', 'abr-medida-texto');
      const pode = eCocho ? podeEncherCocho(m, e) : podeEncherBebedouro(m, e), acao = eCocho ? 'abastecerCocho' : 'abastecerBebedouro';
      const cheio = s.nivel >= s.capacidade, vazio = falta[eCocho ? 'comida' : 'agua'];
      const titulo = el('div', 'abr-medida-titulo'); titulo.append(el('b', '', eCocho ? T.animais.cocho : T.animais.bebedouro), el('span', vazio ? 'ruim' : '', T.animais.nivelDe(s.nivel, s.capacidade)));
      const barra = el('div', 'barra' + (vazio ? ' pouco' : '')), fio = el('i'); barra.append(fio);
      fio.style.transform = `scaleX(${s.capacidade ? Math.min(1, s.nivel / s.capacidade) : 0})`;
      let nota = '', ruim = false;
      if (eCocho) { if (s.tem > 0) nota = T.animais.temComida(D, s.item, s.tem); else if (!cheio) { nota = T.animais.semComida(D, s.item); ruim = true; } }
      else {
        const reg = ferramentaNoCinto(m, 'regador') || ferramentaGuardada(m, 'regador');
        if (reg) nota = T.animais.comRegador(m.posses.ferramentas[reg].agua, D.itens[reg].capacidade); else { nota = T.animais.semRegador; ruim = true; }
      }
      textos.append(titulo, barra);
      if (nota) textos.append(el('small', ruim ? 'ruim' : '', nota));
      const indo = naFila(m, acao, e.id);
      const b = botao({ texto: cheio ? T.animais.cheio : T.animais.encher, classe: !cheio && pode.ok && !indo ? 'verde' : '', aoClicar: () => { const r = mandar({ tipo: eCocho ? 'encherCocho' : 'encherBebedouro', entidade: e.id }); if (r.ok) { som.tocar('toque'); desenhar(); } } });
      b.dataset.k = 'encher-' + parte;
      if (cheio || indo) b.disabled = true; else if (!pode.ok) b.classList.add('sem');
      if (!cheio && pode.ok && !indo && pedido.evento === 'tratou' && (!pedido.abrigo || pedido.abrigo === e.tipo)) b.classList.add('alvo-tutorial');
      caixa.append(icone(eCocho ? 'icone/' + (s.item || 'racao') : 'icone/gota', 34), textos, b);
      return caixa;
    }

    // ---------- um bicho ----------
    function cartaoDoBicho(m, e, a, k, st) {
      const d = defDoAnimal(m, a), D = m.dados, c = el('div', 'oferta abr-bicho'), nome = el('div', 'nome', T.animais.numero(d.nome, k + 1)), info = el('div', 'info');
      c.dataset.animal = a.id;
      c.append(figuraDoBicho(d.id, 44), nome);
      if (a.familia !== 'producao') {
        // bicho de outra família (trabalho): aqui só se vê se está tratado
        const tratado = estaTratado(m, a);
        if (!tratado) c.classList.add('fome');
        info.append(el('span', tratado ? '' : 'ruim', tratado ? d.descricao || '' : a.familia === 'trabalho' ? T.animais.semTratoTrabalho : T.animais.semTratoCurto));
        c.append(info);
        return c;
      }
      const s = situacaoDoAnimal(m, a, sit), v = vidaDoAnimal(m, a, vida);
      if (s.pronto > 0) { const tem = el('small', 'abr-tem'); tem.append(icone('icone/' + d.produto, 18), el('span', '', '× ' + s.pronto)); nome.append(tem); }
      c.classList.add(s.estado);
      if (s.estado === 'fim' || s.estado === 'estimacao') {
        info.append(el('span', '', s.estado === 'fim' ? T.animais.parou(d, D) : T.animais.estimacao));
        c.append(info);
        const bs = el('div', 'botoes'), b = botao({ texto: s.estado === 'fim' ? T.animais.destino : T.animais.vender, classe: s.estado === 'fim' ? 'verde' : '', aoClicar: () => { som.tocar('toque'); destinoDe = a.id; assinatura = ''; desenhar(); focar('depois'); } });
        b.dataset.k = 'destino-' + a.id;
        bs.append(b); c.append(bs);
        return c;
      }
      if (s.estado === 'pronto') info.append(el('span', 'bom', T.animais.ninhoCheio(d, D)));
      else {
        const barra = el('div', 'barra ciclo' + (s.estado === 'sem-trato' ? ' pouco' : '')), fio = el('i'), t = el('span', s.estado === 'sem-trato' ? 'ruim' : '');
        barra.append(fio); info.append(barra, t);
        relogios.push({ a, d, fio, t, semTrato: s.estado === 'sem-trato' });
      }
      if (v.perto) info.append(el('small', 'abr-velha', T.animais.velhinha(d, D, v.restam)));
      c.append(info);
      return c;
    }

    // ---------- o painel ----------
    function desenhar() {
      const m = J.mundo, D = m.dados, e = construcaoPorId(m, id), def = e && defDe(m, e.tipo);
      if (!e || !def || !m.animais.abrigos[e.id]) { if (montado) ctx.fechar(); else corpo.append(el('div', 'vazio', T.motivos['nao-existe'] ? T.motivos['nao-existe']() : '')); return; }
      const bichos = animaisDe(m, { abrigo: e.id }), st = estadoDoAbrigo(m, e), pedido = pedidoDaMissao(m);
      faltaNoAbrigo(m, e, falta);
      const alvo = destinoDe ? animalPorId(m, destinoDe) : null;
      if (destinoDe && (!alvo || alvo.abrigo !== e.id || !alvo.fim)) destinoDe = null;
      const prontos = prontosNoAbrigo(m, e.id), comProduto = bichos.find((a) => a.familia === 'producao' && a.pronto > 0);
      const rec = comProduto ? podeRecolher(m, defDoAnimal(m, comProduto)) : null;
      const ofertas = ofertasDeAnimais(m).filter((o) => o.abrigo === e.tipo), amp = proximaAmpliacao(m, e), extras = extrasDoAbrigo(m, e);
      const reg = ferramentaNoCinto(m, 'regador') || ferramentaGuardada(m, 'regador');
      // só refaz quando muda o que o painel mostra (os relógios andam sem refazer)
      const sinal = [destinoDe, e.nivel, e.ampliaAte > 0, st.vagas, st.cocho.nivel, st.cocho.capacidade, st.cocho.tem, st.bebedouro.nivel, st.bebedouro.capacidade, reg ? m.posses.ferramentas[reg].agua : -1,
        m.posses.ouro, m.progresso.nivel, prontos, rec ? rec.motivo || 'ok' : '', naFila(m, 'abastecerCocho', e.id), naFila(m, 'abastecerBebedouro', e.id),
        bichos.map((a) => `${a.id}:${a.pronto}:${a.fim || ''}:${a.tratado ? 1 : 0}:${a.cicloDesde > 0 ? 1 : 0}:${a.familia === 'producao' && vidaDoAnimal(m, a, vida).perto ? 1 : 0}`).join(','),
        extras.map((x) => `${x.id}:${x.texto}:${x.ligado ? 1 : 0}:${x.dica || ''}`).join(','), pedido.evento, pedido.animal, pedido.abrigo,
        amp ? Object.keys(amp.custo.itens).map((k) => quantoTem(m, k)).join(',') : ''].join('|');
      if (sinal === assinatura) { relogio(m, e); return; }
      assinatura = sinal; relogios = []; barraObra = null; tObra = null;
      // refazer não pode perder o foco de quem anda pelas setas (o relógio também refaz, sem evento nenhum)
      const ativo = document.activeElement, chave = montado && ativo && corpo.contains(ativo) ? ativo.dataset.k : null;
      if (chave) queueMicrotask(() => {
        if (corpo.contains(document.activeElement)) return;
        const todos = [...corpo.querySelectorAll('button')], i = todos.findIndex((x) => x.dataset.k === chave);
        const b = i >= 0 && !todos[i].disabled ? todos[i] : todos.slice(Math.max(0, i + 1)).find((x) => !x.disabled) || todos.find((x) => !x.disabled);
        try { if (b) b.focus({ preventScroll: true }); } catch { /* sem foco */ }
      });
      corpo.textContent = '';
      if (cab) {
        cab.textContent = def.nome;
        // o ícone do cabeçalho é o do próprio abrigo (o registrado é o de uma galinha)
        const ic = cab.previousElementSibling;
        if (ic && ic.tagName === 'CANVAS' && ic.dataset.chave !== 'objeto/' + def.id) ic.replaceWith(iconeDaConstrucao(def.id, 28));
      }
      ctx.saldo.textContent = '';
      ctx.saldo.append(icone('icone/ouro', 20), el('span', '', numero(m.posses.ouro)));
      if (alvo) { corpo.append(telaDoDestino(m, e, alvo)); return; }

      const caixa = el('div', 'abr'), topo = el('div', 'abr-topo'), textos = el('div');
      const nome = el('div', 'nome', def.nome);
      if ((e.nivel || 1) > 1) nome.append(el('small', '', ' ' + T.cartao.nivel(e.nivel)));
      textos.append(nome, el('div', 'info', T.animais.vagas(st.ocupadas, st.vagas)));
      topo.append(iconeDaConstrucao(def.id, 56), textos);
      // recolher: o que estiver pronto, com a ferramenta certa (ou o que falta para poder)
      if (comProduto) {
        const d = defDoAnimal(m, comProduto);
        const b = botao({ icone: 'icone/' + d.produto, tamanho: 26, texto: T.animais.recolher(d, D, prontos), classe: rec.ok ? 'verde' : 'sem', aoClicar: () => { const r = mandar({ tipo: 'recolher', entidade: e.id }); if (r.ok) { som.tocar('toque'); ctx.fechar(); } } });
        b.dataset.k = 'recolher';
        if (rec.ok && pedido.evento === 'recolheu') b.classList.add('alvo-tutorial');
        topo.append(b);
      }
      caixa.append(topo);
      if (rec && !rec.ok) {
        const aviso = el('div', 'abr-aviso');
        if (rec.motivo === 'falta-de-recolher') {
          aviso.append(icone('icone/' + rec.dados.item, 30), el('span', '', T.animais.faltaDeRecolher(D, defDoAnimal(m, comProduto), rec.dados.item)));
          const b = botao({ texto: T.animais.irComprar, aoClicar: () => { som.tocar('toque'); abrirPainel('loja', { item: rec.dados.item }); } });
          b.dataset.k = 'ir-comprar';
          aviso.append(b);
        } else aviso.append(icone(rec.motivo === 'recipiente-cheio' ? 'icone/' + rec.dados.item : 'icone/cesto', 30), el('span', '', rec.motivo === 'recipiente-cheio' ? T.animais.recipienteCheio(D, rec.dados.item) : T.animais.cestoCheio));
        caixa.append(aviso);
      }
      // cocho e bebedouro
      if (st.cocho.capacidade > 0 || st.bebedouro.capacidade > 0) {
        const trato = el('div', 'abr-trato');
        if (st.cocho.capacidade > 0 && st.cocho.item) trato.append(medida(m, e, 'cocho', st, pedido));
        if (st.bebedouro.capacidade > 0) trato.append(medida(m, e, 'bebedouro', st, pedido));
        caixa.append(trato);
      }
      // quem mora aqui
      if (bichos.length) {
        const grade = el('div', 'grade abr-bichos');
        const conta = {};
        for (const a of bichos) { const k = conta[a.especie] = (conta[a.especie] || 0) + 1; grade.append(cartaoDoBicho(m, e, a, k - 1, st)); }
        caixa.append(grade);
      } else if (ofertas.length) caixa.append(el('div', 'nota', T.animais.semBicho(D, D.animais[ofertas[0].animal])));
      // o que as outras frentes oferecem neste abrigo (o estábulo: "Ir a cavalo", "Levar o jumento")
      if (extras.length) {
        const linha = el('div', 'abr-extras');
        for (const x of extras) {
          const item = el('div', 'abr-extra');
          const b = botao({ icone: x.icone || undefined, tamanho: 26, texto: x.texto, classe: x.ligado ? 'ativo' : '', aoClicar: () => { x.aoClicar(); assinatura = ''; desenhar(); focar('extra-' + x.id); } });
          b.dataset.k = 'extra-' + x.id;
          item.append(b);
          if (x.dica) item.append(el('small', '', x.dica));
          linha.append(item);
        }
        caixa.append(linha);
      }
      // comprar: um botão por espécie que mora neste abrigo, enquanto houver vaga (bicho de trabalho: um de cada basta)
      const aVenda = ofertas.filter((o) => !umBasta(o));
      if (aVenda.length) {
        const linha = el('div', 'abr-comprar');
        if (st.ocupadas >= st.vagas) linha.append(el('span', 'nota', T.animais.semVagas));
        else for (const o of aVenda) {
          if (!o.liberado) { const t = el('span', 'abr-trava'); t.append(icone('ui/cadeado', 18), figuraDoBicho(o.animal, 28), el('span', '', `${o.nome}: ${T.animais.nivel(o.nivel).toLowerCase()}`)); linha.append(t); continue; }
          const b = botao({ classe: 'verde', aoClicar: () => { const r = mandar({ tipo: 'comprarAnimal', animal: o.animal, abrigo: e.id }); if (r.ok) som.tocar('moeda'); } });
          b.append(figuraDoBicho(o.animal, 30), el('span', '', T.animais.comprarBicho(o.nome)), preco(o.preco));
          b.dataset.k = 'comprar-' + o.animal;
          if (m.posses.ouro < o.preco || (!o.pode.ok && o.pode.motivo !== 'sem-ouro')) b.classList.add('sem');
          if (pedido.evento === 'comprou' && pedido.animal === o.animal) b.classList.add('alvo-tutorial');
          linha.append(b);
        }
        caixa.append(linha);
      }
      // a ampliação: em andamento (relógio e concluir) ou a próxima (custo e botão)
      if (e.ampliaAte > 0) {
        const bloco = el('div', 'cons-obra'), b = el('div', 'barra'), fio = el('i'), linha = el('div', 'cons-linha');
        b.append(fio); barraObra = fio; tObra = el('span', 'cons-falta');
        linha.append(el('b', '', T.animais.ampliando(amp ? amp.nome : '')), b, tObra);
        bloco.append(linha, botaoConcluir('obra', { entidade: e.id }, { k: 'concluir' }));
        caixa.append(bloco);
      } else if (amp) {
        const bloco = el('div', 'cons-ampliar');
        bloco.append(el('div', 'secao', T.animais.proxima), el('div', 'nome', amp.nome));
        if (amp.nivel > m.progresso.nivel) { const t = el('div', 'info trava'); t.append(icone('ui/cadeado', 18), el('span', '', T.animais.nivel(amp.nivel))); bloco.append(t); }
        else {
          bloco.append(custo(m, amp.custo));
          if (faltaComFonte(m, amp.custo.itens).length) bloco.append(botaoOndeConseguir(m, amp.custo.itens, 'onde-ampliar'));
          else {
            const b = botao({ icone: 'icone/martelo', tamanho: 22, texto: T.animais.ampliar + (amp.obraSeg > 0 ? ' · ' + tempo(amp.obraSeg) : ''), classe: 'verde', aoClicar: () => { const r = mandar({ tipo: 'ampliar', entidade: e.id }); if (r.ok) som.tocar('martelo'); } });
            b.dataset.k = 'ampliar';
            bloco.append(b);
          }
        }
        caixa.append(bloco);
      }
      caixa.append(linhaDeArrumar(e.id, ctx));
      corpo.append(caixa);
      relogio(m, e);
    }
    // o que anda com o tempo: a barra e o texto do ciclo de cada bicho, e o relógio da ampliação
    function relogio(m, e) {
      const D = m.dados;
      for (const r of relogios) {
        const s = situacaoDoAnimal(m, r.a, sit);
        r.fio.style.transform = `scaleX(${Math.round(s.fracao * 200) / 200})`;
        por(r.t, r.semTrato ? T.animais.semTrato(falta.comida || falta.agua ? falta : { comida: true, agua: true }, D, m.dados.comidaDoAbrigo[e.tipo]) : T.animais.em(r.d, D, s.falta));
      }
      if (barraObra) { barraObra.style.transform = `scaleX(${Math.round(andamentoDaObra(m, e) * 200) / 200})`; por(tObra, T.animais.falta(faltaDaObra(m, e))); }
    }
    desenhar();
    montado = true;
    // os relógios andam mesmo sem evento nenhum (e um ciclo que vira muda o cartão do bicho)
    const tique = setInterval(() => { if (J.mundo && construcaoPorId(J.mundo, id)) desenhar(); }, 400);
    return { atualizar: desenhar, aoFechar() { clearInterval(tique); } };
  },
});
