// Os painéis da frente de construir e a ligação dela com os eventos do mundo.
//   'construir'    o catálogo do que se constrói: por categoria, com custo, o que falta e o nível exigido. Abre pelo
//                  botão do HUD (é assim que se compra a primeira bancada) e dentro do painel da bancada (frente das
//                  indústrias monta este painel numa aba: PAINEIS.construir.montar(div, ctx, arg)).
//                  arg = { categoria?, id? (construção a mostrar) }. Com categoria 'enfeites' é a aba Enfeites da loja:
//                  cercas, caminhos e enfeites juntos, com o cabeçalho e as abas da loja (paineis/loja.js)
//   'construcao'   o cartão de uma construção colocada: obra (relógio e concluir), o que ela guarda, a próxima
//                  ampliação, Mudar de lugar e Guardar. É o que o toque abre quando o tipo não tem dono
//                  (acaoPossivel padrão de construcao.js). arg = { entidade }
// Para as outras frentes:
//   registrarAbaDeConstrucao({ id, titulo, serve(m, e), montar(div, ctx, { entidade }) → { atualizar, aoFechar } })
//       acrescenta uma aba ao cartão das construções em que serve() der true
//   linhaDeArrumar(idDaEntidade, ctx)  → <div> com os botões Mudar de lugar e Guardar, para pôr no painel próprio
//   iconeDaConstrucao(id, tamanho)     → o ícone de uma construção (a própria peça do cenário, reduzida)
// E mais: o botão "Entrar" que aparece no HUD quando ela chega ao celeiro ("Sair", lá dentro) e as seções do
// celeiro na mochila.
import { el, icone, botao, por } from '../dom.js';
import { T, frase, numero, tempo } from '../textos.js';
import '../textos/construcao.js';
import { J } from '../../contexto.js';
import { registrarPainel, abrirPainel, fecharPainel, painelAberto } from './registro.js';
import { SECOES } from './mochila.js';
import { ABAS_DE_FORA, faixaDaLoja } from './loja.js';
import { aoInstalarMundo } from '../ligacoes.js';
import { avisar } from '../avisos.js';
import { botaoConcluir } from '../concluir.js';
import { som } from '../../plataforma/som.js';
import { foco } from '../../entrada/foco.js';
import { registrarCamada } from '../../render/cena.js';
import { comecarColocacao, comecarMudanca, comecarArrumacao, colocando } from '../colocacao.js';
import { defDe, podePagar, quantasGuardadas, construcoesDe, construcaoPorId, faltaDaObra, andamentoDaObra, proximaAmpliacao, guardavel, valorDe } from '../../nucleo/sistemas/construcao.js';
import { quantoTem, listaDeFerramentas } from '../../nucleo/sistemas/posses.js';
import { capacidadeDe, ocupacaoDe, guardaDoItem, moveisDe, pertoDaPorta } from '../../nucleo/sistemas/celeiro-dentro.js';
import { reformas } from '../../nucleo/sistemas/comeco.js';
import { guiaDaMissao } from '../../nucleo/guia.js';
import '../textos/comeco.js';

const TRAVADAS_A_MOSTRA = 2;
// não há "icone/<id>" para construção: o ícone é a própria peça do cenário, encaixada na caixa (ui/dom.js já encaixa
// qualquer peça do catálogo). Para animal vale o mesmo com 'animal/<id>/parada-frente'.
export const iconeDaConstrucao = (id, tamanho = 48) => icone('objeto/' + (id.startsWith('cerca') ? 'cerca-x' : id), tamanho);

// ---------- pedaços comuns ----------
const CATEGORIAS = ['abrigo', 'industria', 'armazem', 'util', 'cerca', 'decoracao'];
function categoriaDe(def) {
  if (def.tipo === 'movel' || def.tipo === 'armazem') return 'armazem';
  if (def.tipo === 'decoracao') return /^(cerca|porteira|caminho)/.test(def.id) ? 'cerca' : 'decoracao';
  return CATEGORIAS.includes(def.tipo) ? def.tipo : 'util';
}
const constroi = (def) => !def.inicial && !!def.custo;
// o preço em fichas: ouro e cada material, com o que há; vermelho no que falta
function custo(m, c) {
  const linha = el('div', 'cons-custo');
  if (c.ouro > 0) { const f = el('span', 'cons-ficha' + (m.posses.ouro < c.ouro ? ' falta' : '')); f.append(icone('icone/ouro', 18), el('span', '', numero(c.ouro))); linha.append(f); }
  for (const k in c.itens) {
    const tem = quantoTem(m, k), f = el('span', 'cons-ficha' + (tem < c.itens[k] ? ' falta' : ''));
    f.title = m.dados.itens[k].nome;
    f.append(icone('icone/' + k, 18), el('span', '', `${Math.min(tem, 999)}/${c.itens[k]}`));
    linha.append(f);
  }
  return linha;
}
function trava(texto) { const t = el('div', 'info trava'); t.append(icone('ui/cadeado', 18), el('span', '', texto)); return t; }

// ---------- as reformas (o começo humilde): o que já veio com a fazenda e fica melhor ----------
// r = um item de reformas(m) (nucleo/sistemas/comeco.js); o cartão mostra a figura da nova, o ganho e o preço
const guia = { tipo: null };
function cartaoDeReforma(m, r) {
  const travada = r.nivel > m.progresso.nivel, c = el('div', 'oferta cons-oferta' + (travada ? ' travada' : ''));
  c.dataset.item = 'reforma:' + r.de;
  c.append(iconeDaConstrucao(r.para, 52), el('div', 'nome', r.nome));
  if (travada) { c.append(trava(T.construir.nivel(r.nivel))); return c; }
  c.append(el('div', 'info', T.comeco.ganho[r.de] || ''));
  const pe = el('div', 'cons-pe');
  if (r.obra > 0) { c.append(el('div', 'info', T.comeco.emObra(r.obra))); c.append(pe); return c; }
  c.append(el('div', 'info', T.comeco.obra(r.obraSeg)));
  pe.append(custo(m, { ouro: r.custo.ouro || 0, itens: r.custo.itens || {} }));
  const b = botao({ texto: T.comeco.reformar, classe: 'verde' + (r.pode.ok ? '' : ' sem'), aoClicar: () => {
    const mm = J.mundo, res = mm.comando({ tipo: 'reformar', entidade: r.alvo, quieto: true });
    if (!res.ok) { som.tocar('erro'); avisar(frase(res.motivo, res.dados, mm.dados)); return; }
    som.tocar('toque'); fecharPainel();
  } });
  b.dataset.k = 'r-' + r.de;
  pe.append(b);
  c.append(pe);
  return c;
}

// ---------- o catálogo ----------
registrarPainel({
  id: 'construir', titulo: T.construir.titulo, icone: 'icone/martelo', ordem: 35,
  montar(corpo, ctx, arg) {
    let aba = (arg && arg.categoria) || null, pediu = arg && arg.id;
    const daLoja = aba === 'enfeites' && !!ctx.abas; // a aba Enfeites da loja (no painel da bancada, não)
    function escolher(id) {
      const m = J.mundo, def = defDe(m, id), r = podePagar(m, id);
      if (!r.ok) { som.tocar('erro'); avisar(frase(r.motivo, r.dados, m.dados)); return; }
      if (def.onde !== m.personagem.local) { som.tocar('erro'); avisar(frase(def.onde === 'celeiro' ? 'so-no-celeiro' : 'so-na-fazenda', null, m.dados)); return; }
      comecarColocacao(id); // fecha o painel e mostra o fantasma
    }
    function oferta(m, def) {
      const guardadas = quantasGuardadas(m, def.id), tem = construcoesDe(m, def.id).length + guardadas, r = podePagar(m, def.id);
      const travada = !guardadas && def.nivel > m.progresso.nivel, c = el('div', 'oferta cons-oferta' + (travada ? ' travada' : ''));
      c.dataset.item = def.id;
      const nome = el('div', 'nome', def.nome);
      if (guardadas) nome.append(el('small', '', ' ' + T.construir.guardada(guardadas))); else if (tem > 0 || def.limite > 1) nome.append(el('small', '', ' ' + T.construir.tem(tem, def.limite)));
      c.append(iconeDaConstrucao(def.id, 52), nome);
      if (travada) { c.append(trava(T.construir.nivel(def.nivel))); return c; }
      c.append(el('div', 'info', `${T.construir.casas(def.casas)} · ${def.obraSeg > 0 ? (def.tipo === 'movel' ? T.construir.montagem : T.construir.obra)(def.obraSeg) : T.construir.naHora}`));
      const pe = el('div', 'cons-pe');
      // na loja, o enfeite que custa só ouro tem o preço no próprio botão verde (como os outros cartões da loja)
      const soOuro = daLoja && !guardadas && !(def.custo.cash > 0) && def.custo.ouro > 0 && !Object.keys(def.custo.itens || {}).length;
      if (guardadas) pe.append(el('div', 'cons-custo'));
      else if (def.custo.cash > 0 && daLoja) {
        // enfeite de cash, na loja: o botão turquesa leva à loja de cash, onde a compra é feita
        const b = botao({ classe: 'cash', rotulo: T.construir.cash(def.custo.cash), aoClicar: () => { som.tocar('toque'); abrirPainel('cash', { de: 'loja' }); } });
        const p = el('span', 'preco'); p.append(icone('icone/cash', 22), el('span', '', numero(def.custo.cash))); b.append(p);
        b.dataset.k = 'cash-' + def.id;
        pe.append(b);
      }
      else if (def.custo.cash > 0) { const l = el('div', 'cons-custo'), f = el('span', 'cons-ficha'); f.append(icone('icone/cash', 18), el('span', '', T.construir.cash(def.custo.cash))); l.append(f); pe.append(l); }
      else if (!soOuro) pe.append(custo(m, def.custo));
      const fora = def.onde !== m.personagem.local;
      if (!r.ok && r.motivo === 'exige') c.append(trava(T.construir.precisaDe(defDe(m, r.dados.construcao).nome)));
      else if (!r.ok && r.motivo === 'limite') c.append(el('div', 'info', frase('limite', r.dados, m.dados)));
      else if (fora) c.append(el('div', 'info', def.onde === 'celeiro' ? T.construir.soDentro : T.construir.soFora));
      if (!(def.custo.cash > 0) || guardadas) {
        const b = botao({ texto: guardadas ? T.construir.colocar : def.tipo === 'movel' ? T.construir.montar : T.construir.escolher, classe: 'verde' + (r.ok && !fora ? '' : ' sem'), aoClicar: () => escolher(def.id) });
        b.dataset.k = 'c-' + def.id;
        if (soOuro) { const p = el('span', 'preco' + (m.posses.ouro < def.custo.ouro ? ' falta' : '')); p.append(icone('icone/ouro', 22), el('span', '', numero(def.custo.ouro))); b.append(p); }
        pe.append(b);
      }
      c.append(pe);
      return c;
    }
    function desenhar() {
      const m = J.mundo, D = m.dados.construcoes, dentro = m.personagem.local === 'celeiro';
      corpo.textContent = '';
      if (daLoja) faixaDaLoja(ctx, 'enfeites');
      else { ctx.saldo.textContent = ''; ctx.saldo.append(icone('icone/ouro', 20), el('span', '', numero(m.posses.ouro))); }
      const porAba = {};
      for (const def of Object.values(D)) if (constroi(def) || quantasGuardadas(m, def.id) > 0) (porAba[categoriaDe(def)] || (porAba[categoriaDe(def)] = [])).push(def);
      if (daLoja) porAba.enfeites = [...(porAba.cerca || []), ...(porAba.decoracao || [])];
      const abas = CATEGORIAS.filter((k) => porAba[k]);
      // a aba das reformas vem primeiro, enquanto houver o que reformar (só no painel Construir, não na loja)
      const lr = daLoja || dentro ? [] : reformas(m);
      if (lr.length) abas.unshift('reforma');
      const caixa = el('div', 'cons');
      if (!abas.length) { caixa.append(el('div', 'vazio', T.construir.vazio)); corpo.append(caixa); return; }
      if (!pediu && !aba && lr.length) { const g = guiaDaMissao(m, guia); if (g.tipo === 'painel' && g.painel === 'construir' && typeof g.item === 'string') pediu = g.item; }
      if (pediu && pediu.startsWith('reforma:') && lr.length && !daLoja) aba = 'reforma';
      else if (pediu && D[pediu] && !daLoja) { aba = categoriaDe(D[pediu]); }
      if (daLoja) { if (!porAba.enfeites.length) { caixa.append(el('div', 'vazio', T.construir.vazio)); corpo.append(caixa); return; } }
      // (sem pedido: a primeira aba com algo que dá para pagar agora; a das reformas conta quando há reforma possível)
      else if (!abas.includes(aba)) aba = dentro ? 'armazem' : abas.find((k) => (k === 'reforma' ? lr.some((r) => r.pode.ok) : (porAba[k] || []).some((d) => d.onde === 'fazenda' && podePagar(m, d.id).ok))) || abas.find((k) => k !== 'armazem') || abas[0];
      if (!daLoja && !abas.includes(aba)) aba = abas[0];
      const linha = el('div', 'abas'); linha.hidden = daLoja;
      for (const k of abas) {
        const b = botao({ texto: T.construir.categorias[k], classe: 'aba' + (k === aba ? ' ativo' : ''), aoClicar: () => { aba = k; pediu = null; som.tocar('toque'); desenhar(); const n = corpo.querySelector(`[data-k="aba-${k}"]`); if (n) n.focus({ preventScroll: true }); } });
        b.dataset.k = 'aba-' + k;
        linha.append(b);
      }
      caixa.append(linha);
      if (!daLoja && !dentro && aba !== 'reforma' && !construcoesDe(m, 'bancada-de-carpintaria').length && D['bancada-de-carpintaria']) caixa.append(el('div', 'nota', T.construir.semBancada));
      const grade = el('div', 'grade');
      if (aba === 'reforma') {
        caixa.append(el('div', 'nota', T.comeco.nota));
        for (const r of lr) grade.append(cartaoDeReforma(m, r));
        caixa.append(grade); corpo.append(caixa);
        return;
      }
      // primeiro o que está guardado, depois por nível e preço
      const lista = porAba[aba].slice().sort((a, b) => (quantasGuardadas(m, b.id) > 0) - (quantasGuardadas(m, a.id) > 0) || a.nivel - b.nivel || (a.custo ? a.custo.ouro : 0) - (b.custo ? b.custo.ouro : 0));
      let travadas = 0;
      for (const def of lista) {
        if (!quantasGuardadas(m, def.id) && def.nivel > m.progresso.nivel && ++travadas > TRAVADAS_A_MOSTRA) continue;
        grade.append(oferta(m, def));
      }
      caixa.append(grade);
      if (daLoja) { corpo.append(caixa); return; }
      // no pé: arrumar o que já está posto e a porta do celeiro
      const pe = el('div', 'cons-linha');
      const bA = botao({ icone: 'ui/mover', tamanho: 24, texto: T.construir.arrumar, aoClicar: () => comecarArrumacao() }); bA.dataset.k = 'arrumar';
      pe.append(bA);
      if (aba === 'armazem' || dentro) {
        const bE = botao({ icone: 'objeto/celeiro', tamanho: 24, texto: dentro ? T.construir.sair : T.construir.entrar, aoClicar: () => { fecharPainel(); m.comando({ tipo: dentro ? 'sair' : 'entrar' }); } });
        bE.dataset.k = 'porta';
        pe.append(bE);
      }
      caixa.append(pe);
      corpo.append(caixa);
    }
    desenhar();
    return { atualizar: desenhar };
  },
});

// a aba Enfeites da loja é o catálogo de cercas, caminhos e enfeites (o resto do catálogo abre no botão Construir)
ABAS_DE_FORA.push({ id: 'enfeites', nome: T.construir.enfeites, painel: 'construir', arg: { categoria: 'enfeites', de: 'loja' } });

// ---------- o cartão de uma construção ----------
const ABAS = [];
export function registrarAbaDeConstrucao(aba) { ABAS.push(aba); }
// os botões de arrumar uma construção (o painel fecha e o fantasma aparece)
export function linhaDeArrumar(idDaEntidade, ctx) {
  const m = J.mundo, e = construcaoPorId(m, idDaEntidade), def = e && defDe(m, e.tipo), linha = el('div', 'cons-linha');
  if (!e || !def || def.inicial) return linha;
  const bM = botao({ icone: 'ui/mover', tamanho: 24, texto: T.cartao.mover, aoClicar: () => { if (ctx && ctx.fechar) ctx.fechar(); comecarMudanca(e.id); } });
  bM.dataset.k = 'mover';
  linha.append(bM);
  if (guardavel(def)) {
    const bG = botao({ icone: 'ui/mochila', tamanho: 24, texto: T.cartao.guardar, aoClicar: () => {
      const r = m.comando({ tipo: 'guardarConstrucao', entidade: e.id });
      if (!r.ok) return;
      avisar(T.cartao.guardou(def.nome), 'bom', 3600); som.tocar('guardar');
      if (ctx && ctx.fechar) ctx.fechar();
    } });
    bG.dataset.k = 'guardar';
    linha.append(bG);
  }
  return linha;
}
function oQueGuarda(m, e, def) {
  const out = [];
  if (def.guarda && T.cartao.guarda[def.guarda]) out.push(T.cartao.guarda[def.guarda](valorDe(m, e, 'capacidade') || 0));
  if (def.vagas) out.push(T.cartao.vagas(valorDe(m, e, 'vagas')));
  if (def.fila) out.push(T.cartao.fila(valorDe(m, e, 'fila')));
  return out.join(' · ');
}
registrarPainel({
  id: 'construcao', titulo: T.cartao.titulo, icone: 'icone/martelo', botao: false,
  montar(corpo, ctx, arg) {
    const id = arg && arg.entidade;
    let aba = 'sobre', api = null, assinatura = '', barra = null, tFalta = null;
    function sobre(m, e, def, caixa) {
      const obra = e.obraAte > 0, ampliando = e.ampliaAte > 0;
      if (obra || ampliando) {
        const bloco = el('div', 'cons-obra'), b = el('div', 'barra'), fio = el('i');
        b.append(fio); barra = fio; tFalta = el('span', 'cons-falta');
        const linha = el('div', 'cons-linha');
        linha.append(el('b', '', obra ? T.cartao.emObra : T.cartao.ampliando(proximaAmpliacao(m, e) ? proximaAmpliacao(m, e).nome : '')), b, tFalta);
        bloco.append(linha, botaoConcluir('obra', { entidade: e.id }, { k: 'concluir' }));
        caixa.append(bloco);
      }
      const amp = !obra && !ampliando ? proximaAmpliacao(m, e) : null;
      if (amp) {
        const bloco = el('div', 'cons-ampliar');
        bloco.append(el('div', 'secao', T.cartao.proxima), el('div', 'nome', amp.nome));
        if (amp.nivel > m.progresso.nivel) bloco.append(trava(T.construir.nivel(amp.nivel)));
        else {
          bloco.append(custo(m, amp.custo));
          const b = botao({ icone: 'icone/martelo', tamanho: 22, texto: T.cartao.ampliar + (amp.obraSeg > 0 ? ' · ' + tempo(amp.obraSeg) : ''), classe: 'verde', aoClicar: () => { const r = m.comando({ tipo: 'ampliar', entidade: e.id }); if (r.ok) som.tocar('martelo'); } });
          b.dataset.k = 'ampliar';
          bloco.append(b);
        }
        caixa.append(bloco);
      }
      caixa.append(linhaDeArrumar(e.id, ctx));
    }
    function desenhar() {
      const m = J.mundo, e = construcaoPorId(m, id), def = e && defDe(m, e.tipo);
      if (!e || !def) { ctx.fechar(); return; }
      const abas = ABAS.filter((a) => !(e.obraAte > 0) && a.serve(m, e));
      if (aba !== 'sobre' && !abas.some((a) => a.id === aba)) aba = 'sobre';
      // só refaz quando muda o que o cartão mostra (o relógio da obra anda sem refazer)
      const amp = proximaAmpliacao(m, e), sinal = [aba, e.obraAte > 0, e.ampliaAte > 0, e.nivel, m.posses.ouro, m.progresso.nivel, abas.length, amp ? Object.keys(amp.custo.itens).map((k) => quantoTem(m, k)).join(',') : ''].join('|');
      if (sinal === assinatura) { relogio(m, e); if (api && api.atualizar) api.atualizar(); return; }
      assinatura = sinal;
      if (api && api.aoFechar) api.aoFechar();
      api = null; barra = null; tFalta = null;
      corpo.textContent = '';
      const caixa = el('div', 'cons cons-cartao'), topo = el('div', 'cons-topo'), textos = el('div');
      const nome = el('div', 'nome', def.nome);
      if ((e.nivel || 1) > 1) nome.append(el('small', '', ' ' + T.cartao.nivel(e.nivel)));
      textos.append(nome);
      const guarda = oQueGuarda(m, e, def);
      if (guarda) textos.append(el('div', 'info', guarda));
      if (def.descricao) textos.append(el('div', 'info', def.descricao));
      topo.append(iconeDaConstrucao(def.id, 64), textos);
      caixa.append(topo);
      if (abas.length) {
        const linha = el('div', 'abas');
        for (const a of [{ id: 'sobre', titulo: T.cartao.sobre }, ...abas]) {
          const b = botao({ texto: a.titulo, classe: 'aba' + (a.id === aba ? ' ativo' : ''), aoClicar: () => { aba = a.id; som.tocar('toque'); desenhar(); const n = corpo.querySelector(`[data-k="aba-${a.id}"]`); if (n) n.focus({ preventScroll: true }); } });
          b.dataset.k = 'aba-' + a.id;
          linha.append(b);
        }
        caixa.append(linha);
      }
      if (aba === 'sobre') sobre(m, e, def, caixa);
      else { const div = el('div', 'cons-aba'); caixa.append(div); api = abas.find((a) => a.id === aba).montar(div, ctx, { entidade: e.id }) || {}; }
      corpo.append(caixa);
      relogio(m, e);
    }
    function relogio(m, e) {
      if (!barra) return;
      const v = Math.round(andamentoDaObra(m, e) * 200) / 200;
      barra.style.transform = `scaleX(${v})`;
      por(tFalta, T.cartao.falta(faltaDaObra(m, e)));
    }
    desenhar();
    // o relógio da obra anda mesmo sem evento nenhum
    const tique = setInterval(() => { const m = J.mundo, e = construcaoPorId(m, id); if (e) relogio(m, e); }, 250);
    return { atualizar: desenhar, aoFechar() { clearInterval(tique); if (api && api.aoFechar) api.aoFechar(); } };
  },
});

// ---------- a mochila: o que está no celeiro, por móvel, com a ocupação de cada um ----------
SECOES.guardado = (m, item) => guardaDoItem(m, item) === 'materiais'; // material aparece no baú, não em "outras coisas"
SECOES.celeiro = (m, caixa, a) => {
  const P = m.posses, materiais = {};
  for (const k in P.bolsa) if (guardaDoItem(m, k) === 'materiais') materiais[k] = P.bolsa[k];
  const ocupa = (g) => { const tem = ocupacaoDe(m, g), cabe = capacidadeDe(m, g); return `${tem}/${cabe}${tem >= cabe ? ' · ' + T.celeiro.cheio : ''}`; };
  const s1 = a.secao(rotuloDosProdutos(m), ocupa('produtos')); if (ocupacaoDe(m, 'produtos') >= capacidadeDe(m, 'produtos')) s1.classList.add('cons-cheio');
  caixa.append(s1, a.itens(m, P.celeiro.itens));
  const s2 = a.secao(T.celeiro.materiais, ocupa('materiais')); if (ocupacaoDe(m, 'materiais') >= capacidadeDe(m, 'materiais')) s2.classList.add('cons-cheio');
  caixa.append(s2, a.itens(m, materiais));
  caixa.append(a.secao(T.celeiro.ferramentas, moveisDe(m, 'ferramentas').length ? ocupa('ferramentas') : ''), a.ferramentas(m, listaDeFerramentas(m, 'suporte')));
};
// no começo humilde, antes do celeiro ficar pronto, quem guarda é o baú da casa
const celeiroPronto = (m) => construcoesDe(m, 'celeiro').some((e) => !(e.obraAte > 0));
const temBau = (m) => !!m.locais.fazenda.porId['bau-da-casa'];
function rotuloDosProdutos(m) { return !celeiroPronto(m) && temBau(m) ? T.celeiro.produtosNoBau : temBau(m) ? T.celeiro.produtosGuardados : T.celeiro.produtos; }
Object.defineProperty(T.mochila, 'dica', { configurable: true, enumerable: true, get: () => (J.mundo && !celeiroPronto(J.mundo) && temBau(J.mundo) ? T.celeiro.dicaDoBau : T.celeiro.dica) });

// ---------- o botão da porta do celeiro: "Entrar" quando ela está perto dele, "Sair" lá dentro ----------
// Fica na fileira dos modos, embaixo, com a cara deles: não tapa o celeiro (o toque nele continua guardando o cesto),
// o dedo alcança e, no teclado e no controle remoto, o foco cai nele assim que o menu abre.
let bPorta = null, tPorta = null, noMenu = false;
function montarPorta(hud) {
  if (!bPorta) {
    bPorta = botao({ icone: 'objeto/celeiro-aberto', tamanho: 30, texto: T.celeiro.entrar, classe: 'modo cons-porta', aoClicar: () => { const m = J.mundo; som.tocar('toque'); foco.sairDoMenu(); m.comando({ tipo: m.personagem.local === 'celeiro' ? 'sair' : 'entrar' }); bPorta.blur(); } });
    bPorta.dataset.k = 'porta-do-celeiro';
    tPorta = bPorta.lastChild;
    bPorta.hidden = true;
  }
  const linha = hud.rodape.querySelector('.modos') || hud.rodape;
  if (bPorta.parentNode !== linha) linha.append(bPorta);
  hud.paineis['porta-do-celeiro'] = bPorta; // (é por este nome que o guia das missões manda a seta para cá)
}
registrarCamada('cima', (g, cam, m) => {
  if (!bPorta) return;
  const dentro = !!m.local.interior, mostra = dentro || pertoDaPorta(m);
  if (bPorta.hidden !== !mostra) bPorta.hidden = !mostra;
  if (mostra) por(tPorta, dentro ? T.celeiro.sair : T.celeiro.entrar);
  // teclado e controle remoto: ao abrir o menu (voltar) perto da porta, o foco já cai neste botão
  if (foco.menu !== noMenu) { noMenu = foco.menu; if (noMenu && mostra) foco.focar(bPorta); }
});

// ---------- a ligação com os eventos do mundo ----------
const GRAVA = ['comecouObra', 'construiu', 'enfeitou', 'ampliou', 'recolocou', 'moveuConstrucao', 'guardouConstrucao', 'ganhouConstrucao', 'mudouDeLocal'];
aoInstalarMundo((m, ctx) => {
  const cena = J.cena, part = cena.part, ev = m.eventos, D = m.dados;
  montarPorta(ctx.hud);
  const aqui = (d) => (d.local || d.onde || 'fazenda') === m.personagem.local;
  const centro = (d) => { const e = construcaoPorId(m, d.entidade); return e ? [e.x + e.l / 2, e.z + e.p / 2] : [(d.x || 0) + 0.5, (d.z || 0) + 0.5]; };
  // a entidade tocada abre um painel (obra, bancada, galinheiro...): quem pede é o toque, na lógica
  ev.ouvir('pediuPainel', (d) => {
    const e = d.entidade ? construcaoPorId(m, d.entidade) : null;
    // o painel pedido ainda não existe (a frente dona não o registrou): vale o cartão da construção
    if (!abrirPainel(d.painel, d.arg)) { if (e) abrirPainel('construcao', { entidade: e.id }); return; }
    // painel de outra frente (abrigo, indústria) que não trouxe o "Mudar de lugar": vai um botão no cabeçalho,
    // para que toda construção do jogador ofereça a mudança no toque
    if (!e || d.painel === 'construcao' || e.obraAte > 0 || defDe(m, e.tipo).inicial) return;
    const veu = document.querySelector('#ui .veu'), x = veu && veu.querySelector('header .fechar');
    if (!x || veu.querySelector('[data-k="mover"]')) return;
    const b = botao({ icone: 'ui/mover', tamanho: 24, classe: 'quadrado', rotulo: T.cartao.mover, aoClicar: () => { fecharPainel(true); comecarMudanca(e.id); } });
    b.dataset.k = 'mover';
    x.before(b);
  });
  for (const k of GRAVA) ev.ouvir(k, () => J.gravarLogo());
  // entrou ou saiu do celeiro: a câmera vale para o lugar novo e o chão é refeito
  const acertarCamera = () => { const loc = m.local, p = m.personagem, cam = cena.cam; cam.limites = [0, 0, loc.l, loc.p]; cam.seguindo = true; cam.pular(p.x, p.z); cena.chao.sujarTudo(); cena.destaque.x = -1; cena.destaque.entidade = null; };
  ev.ouvir('mudouDeLocal', () => { acertarCamera(); som.tocar('abrir'); });
  if (m.local.interior) acertarCamera(); // a gravação abriu com ela lá dentro
  ev.ouvir('comecouObra', (d) => { if (!aqui(d)) return; const c = centro(d); if (!m.local.interior) part.terra(c[0] - 0.5, c[1] - 0.5, 14); som.tocar('martelo'); });
  ev.ouvir('construiu', (d) => { if (aqui(d)) { const c = centro(d); part.brilho(c[0], 0.9, c[1], 16); } avisar(T.ganhos.construiu(d, D), 'bom', 3600); som.tocar('pronto'); });
  ev.ouvir('enfeitou', (d) => { if (!aqui(d)) return; if (!m.local.interior) part.terra(d.x, d.z, 6); som.tocar('martelo'); });
  ev.ouvir('recolocou', (d) => { if (!aqui(d)) return; if (!m.local.interior) part.terra(d.x, d.z, 6); som.tocar('guardar'); });
  ev.ouvir('ampliou', (d) => { const e = construcaoPorId(m, d.entidade); if (e && e.local === m.personagem.local) part.brilho(e.x + e.l / 2, 1.2, e.z + e.p / 2, 18); avisar(T.ganhos.ampliou(d), 'bom', 3600); som.tocar('pronto'); });
});
