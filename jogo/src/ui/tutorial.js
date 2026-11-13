// O vizinho (Seu Tonho): balão com retrato e a missão da vez, e a seta que aponta o próximo passo, no mundo
// (uma casa, o poço) ou na interface (a vaga "Na mão", a loja). O passo vem de nucleo/guia.js.
// As falas avulsas podem ser de outra pessoa (a dela, na chegada): o balão troca o nome e o retrato enquanto dura.
import { el, icone, trocarIcone, por, classe, encher } from './dom.js';
import { T } from './textos.js';
import { J } from '../contexto.js';
import { missaoAtual } from '../nucleo/sistemas/missoes.js';
import { guiaDaMissao } from '../nucleo/guia.js';
import { TIPOS } from '../nucleo/registro.js';
import { painelAberto, abrirPainel } from './paineis/registro.js';
import { subidaAberta } from './subida.js';

export function criarTutorial(ui, hud) {
  const balao = el('button', 'balao'); balao.type = 'button';
  const quem = el('div', 'quem'), retrato = el('div', 'retrato'), nome = el('div');
  const retratoDoVizinho = 'retrato/' + J.dados.missoes.vizinhoId, rosto = icone(retratoDoVizinho, 58);
  retrato.append(rosto); quem.append(retrato, nome);
  const texto = el('div', 'texto'), titulo = el('b'), fala = el('div', 'fala'), anda = el('div', 'anda'), barra = el('div', 'barra hud'), fio = el('i'), conta = el('span');
  barra.append(fio); anda.append(barra, conta); texto.append(titulo, fala, anda);
  balao.append(quem, texto);
  balao.hidden = true;
  // tocar no balão encolhe ou abre a fala; a missão inteira está sempre no painel de missões
  balao.addEventListener('click', () => { if (dito) { dito = null; return; } pequeno = !pequeno; fixo = true; }); // (a fala avulsa some no toque)
  ui.append(balao);
  const seta = el('div', 'seta-ui'); seta.append(icone('ui/seta', 34)); seta.hidden = true; ui.append(seta);

  let pequeno = true, fixo = false, ultima = null, relogio = 0, feitaAte = 0, aberto = 0, marcado = null, esq = false;
  // falas avulsas do vizinho (a primeira vez de uma mecânica): tomam o balão por uns segundos, uma de cada vez
  let dito = null;
  const falas = [];
  const proxima = () => { dito = falas.shift(); if (dito.aoMostrar) dito.aoMostrar(); };
  const baixa = () => J.cena.cam.h < 500; // celular deitado: o balão já nasce compacto
  const passo = { tipo: null };

  // centro de um elemento em pontos do palco (offsetLeft não se confunde com o palco girado)
  function centro(e, out) {
    let x = e.offsetWidth / 2, y = 0;
    for (let n = e; n && n !== ui; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
    out.x = x; out.y = y; out.h = e.offsetHeight;
    return out;
  }
  const pt = { x: 0, y: 0, h: 0 };
  function marcar(e) {
    if (marcado === e) return;
    if (marcado) marcado.classList.remove('alvo-tutorial');
    marcado = e;
    if (e) e.classList.add('alvo-tutorial');
  }
  function apontarUi(e) {
    if (!e || e.hidden || !e.offsetParent) { seta.hidden = true; marcar(null); hud.esconderDica(false); return; }
    marcar(e);
    hud.esconderDica(hud.rodape.contains(e)); // a seta e a linha de dica não ficam uma em cima da outra
    centro(e, pt);
    const cima = pt.y < 90; // botão no alto da tela: a seta fica embaixo dele, apontando para cima
    seta.style.transform = `translate(${Math.round(pt.x)}px, ${Math.round(cima ? pt.y + pt.h : pt.y)}px)`;
    classe(seta, 'cima', cima);
    seta.hidden = false;
  }

  function atualizar(dt) {
    const m = J.mundo, a = missaoAtual(m), cena = J.cena;
    relogio -= dt; aberto += dt;
    if (!dito && falas.length) proxima();
    // com um painel na frente, a fala espera; acabada, a seguinte entra no mesmo quadro (sem piscar a missão no meio)
    if (dito && !painelAberto() && !subidaAberta() && (dito.resta -= dt) <= 0) { dito = null; if (falas.length) proxima(); }
    classe(balao, 'avulsa', !!dito);
    if (!a && !dito) { if (!balao.hidden) balao.hidden = true; apontarUi(null); cena.seta.ligada = false; return; }
    if (balao.hidden) balao.hidden = false;
    // quem fala: o vizinho, ou quem a fala avulsa disser ({ nome, retrato })
    const q = dito && dito.quem;
    por(nome, q && q.nome ? q.nome : m.dados.missoes.vizinhoNome);
    trocarIcone(rosto, q && q.retrato ? q.retrato : retratoDoVizinho);
    if (!a) { por(titulo, dito.titulo); por(fala, dito.fala); classe(balao, 'pequeno', false); if (!anda.hidden) anda.hidden = true; apontarUi(null); cena.seta.ligada = false; return; }
    // missão nova: o balão abre com a fala; depois de um tempo encolhe sozinho (a não ser que o jogador tenha mexido)
    if (ultima !== a.missao.id) { ultima = a.missao.id; pequeno = baixa(); fixo = false; aberto = 0; relogio = 0; }
    if (!fixo && !pequeno && aberto > 12) pequeno = true;
    por(titulo, dito ? dito.titulo : a.missao.titulo);
    por(fala, dito ? dito.fala : a.esperaNivel ? T.missoes.espera(a.esperaNivel) : a.missao.fala);
    classe(balao, 'pequeno', pequeno && !dito);
    classe(balao, 'feita', feitaAte > 0);
    if (feitaAte > 0) feitaAte -= dt;
    if (anda.hidden !== (!!a.esperaNivel || !!dito)) anda.hidden = !!a.esperaNivel || !!dito;
    if (!a.esperaNivel) { encher(fio, a.conta / a.n); por(conta, T.tutorial.progresso(Math.min(a.conta, a.n), a.n)); }

    // a seta: recalcula umas vezes por segundo
    if (relogio > 0) return;
    relogio = 0.3;
    cena.seta.ligada = false;
    if (a.esperaNivel || subidaAberta()) { apontarUi(null); return; }
    const g = guiaDaMissao(m, passo), painel = painelAberto();
    if (painel) {
      // com a loja aberta, a seta aponta a oferta pedida (ou a primeira que dá para comprar)
      let alvo = null;
      if (g.tipo === 'painel' && painel === g.painel) alvo = (g.item && ui.querySelector(`.oferta[data-item="${g.item}"] .bt`)) || ui.querySelector('.oferta:not(.travada) .bt');
      else if (g.tipo === 'painel') alvo = ui.querySelector(`.aba[data-k="aba-${g.painel}"]`) || ui.querySelector('.veu .fechar'); // o painel pedido é uma aba da loja; se não for, primeiro fechar este
      apontarUi(alvo);
      return;
    }
    cena.seta.casas = g.tipo === 'casa' && g.casas ? g.casas.map((c) => [c[0], c[1]]) : null; // no campo: a fileira toda (render/campo.js)
    if (g.tipo === 'casa') { apontarUi(null); cena.seta.ligada = true; cena.seta.x = g.x + 0.5; cena.seta.z = g.z + 0.5; cena.seta.alto = 0.9; }
    else if (g.tipo === 'entidade') {
      const e = m.local.porId[g.id];
      apontarUi(null);
      if (e) { cena.seta.ligada = true; cena.seta.x = e.x + e.l / 2; cena.seta.z = e.z + e.p / 2; cena.seta.alto = TIPOS[e.tipo].altura || 1.6 + Math.min(e.l, e.p) * 0.5; }
    } else if (g.tipo === 'modo') apontarUi(hud.vaga); // (passo antigo de escolher modo: as ações por toque não pedem)
    else if (g.tipo === 'semente') apontarUi(hud.alvoDaMao ? hud.alvoDaMao(g.item) : hud.vaga); // a vaga "Na mão" (aberta: a semente pedida)
    else if (g.tipo === 'painel') apontarUi(hud.alvo ? hud.alvo(hud.paineis[g.painel]) : hud.paineis[g.painel]); // dentro do Menu fechado: primeiro o Menu
    else apontarUi(null);
    // o balão nunca fica em cima do alvo apontado no mundo: se ficaria, muda de lado
    if (cena.seta.ligada) {
      // (em pontos do #ui: no computador ele cresce pelo zoom, J.esc)
      const cam = cena.cam, k = J.esc || 1, tx = cam.cssX(cena.seta.x, cena.seta.z) / k, ty = cam.cssY(cena.seta.x, cena.seta.alto, cena.seta.z) / k, mg = 46;
      const dentro = (lado) => { const l = lado ? 8 : cam.w / k - 8 - balao.offsetWidth, t = balao.offsetTop; return tx > l - mg && tx < l + balao.offsetWidth + mg && ty > t - mg && ty < t + balao.offsetHeight + mg + 60; };
      if (dentro(esq) && !dentro(!esq)) esq = !esq;
      classe(balao, 'esq', esq);
    }
  }

  return {
    atualizar,
    concluiu() { feitaAte = 1.6; pequeno = false; fixo = false; aberto = 0; relogio = 0; },
    abrirMissoes() { abrirPainel('missoes'); },
    // o vizinho diz uma coisa fora da missão (título curto e uma ou duas frases); fica "seg" segundos ou até o toque.
    // quem = { nome, retrato (a chave da peça) }: a fala é de outra pessoa (ou dele com outra cara); aoMostrar: chamada
    // quando a fala aparece no balão (depois das que estavam na frente)
    dizer(tituloDaFala, textoDaFala, seg = 11, quem = null, aoMostrar = null) { if (textoDaFala && falas.length < 3 && !(dito && dito.fala === textoDaFala) && !falas.some((f) => f.fala === textoDaFala)) falas.push({ titulo: tituloDaFala || '', fala: textoDaFala, resta: seg, quem, aoMostrar }); },
    falando: () => (dito ? dito.fala : falas.length ? falas[0].fala : null),
    balao, seta,
  };
}
