// A interface das ações por toque (a regra está em nucleo/sistemas/acoes.js; aqui só se desenha):
//   - a vaga "Na mão", embaixo, no meio: o que ela tem para plantar (Alface ×6). Tocar abre a fileira de escolha
//     (as sementes e mudas da bolsa e um "Comprar", que leva à aba Sementes da loja); sem nada, "Comprar sementes".
//   - o balãozinho: em cima do alvo apontado (o dedo apertando, o mouse por cima, ou o que está à frente dela nas
//     teclas e no controle), o desenho da ação que o toque vai fazer. O contorno dourado do alvo é da cena.
//   - a roda de ações: quando o alvo tem mais de uma ação (o curral: ordenhar, dar ração, dar água, abrir), dois a
//     quatro botões redondos em volta dele, a principal maior e com brilho dourado. Tocar fora fecha.
//   - o botão redondo de agir (embaixo, à direita): mostra o desenho da ação do alvo à frente dela.
// As setas do teclado e do controle andam pelos botões da roda e da fileira da vaga (entrada/foco.js: popup).
import { el, icone, trocarIcone, por, classe } from './dom.js';
import { T, frase, fraseDaAcao } from './textos.js';
import { nomeCurto, nomeDaAcao } from './textos/acoes.js';
import { ICONE_DA_ACAO } from './hud.js';
import { abrirPainel, painelAberto } from './paineis/registro.js';
import { subidaAberta } from './subida.js';
import { aoInstalarMundo } from './ligacoes.js';
import { J } from '../contexto.js';
import { TIPOS } from '../nucleo/registro.js';
import { acoesDoAlvo, itemNaMao, itensParaAMao } from '../nucleo/sistemas/acoes.js';
import { quantoTem } from '../nucleo/sistemas/posses.js';
import { foco } from '../entrada/foco.js';
import { som } from '../plataforma/som.js';

// o desenho de cada ação no balão e na roda (o que não estiver aqui vem do ICONE_DA_ACAO do HUD, o da fila)
const ICONE_DO_TOQUE = {
  colher: 'ui/colher', colherFruta: 'ui/colher', afagar: 'ui/afagar', rocar: 'ui/limpar', ordenhar: 'icone/leite',
  abastecerCocho: (o) => (o.item ? 'icone/' + o.item : 'icone/racao'),
  semear: (o) => 'icone/' + (o.item || (o.args && o.args.semente)),
  plantarMuda: (o) => 'icone/' + (o.item || (o.args && o.args.muda)),
  abrir: 'ui/mao',
};
// a peça existe no catálogo? (sem ela, a figura de reserva do dom.js; aqui se prefere a seguinte da lista)
const tem = (k) => !J.cena || !J.cena.atlas || !J.cena.atlas.tem || J.cena.atlas.tem(k);
export function iconeDaOpcao(o, alvo) {
  if (!o) return 'ui/mao';
  try {
    let f = ICONE_DO_TOQUE[o.id];
    if (typeof f === 'function') f = f(o);
    if (f && tem(f)) return f;
    const g = ICONE_DA_ACAO[o.acao || o.id];
    const k = typeof g === 'function' ? g({ acao: o.acao, args: o.args || {}, entidade: alvo && alvo.entidade, x: alvo && alvo.x, z: alvo && alvo.z }) : g;
    return k || f || 'ui/mao';
  } catch { return 'ui/mao'; }
}
const nomeDaOpcao = (o, D) => nomeDaAcao(o.id, { ...(o.dados || {}), item: o.item || (o.dados && o.dados.item) }, D);
// a frase da linha de dica para a opção
export function fraseDaOpcao(o, D) {
  if (!o) return '';
  if (o.acao) return fraseDaAcao(o.acao, o.dados, D);
  return frase(o.texto, o.dados, D);
}
const valem = (lista) => lista.filter((o) => o.ok);

// a roda abre quando o alvo tem duas ou mais ações que dão agora (no máximo quatro)
export function pedeRoda(lista) { return valem(lista).length >= 2; }

// lugares dos botões da roda (o centro de cada um, em pontos do #ui), a principal primeiro: em cima do alvo (como no
// desenho aprovado); sem lugar em cima (o alvo perto do alto da tela), embaixo dele; sem os dois, numa fileira no meio
const LUGARES = {
  2: [[46, -74], [-62, -38]],
  3: [[0, -84], [-92, -42], [92, -42]],
  4: [[0, -88], [-104, -50], [104, -50], [-200, 4]],
};
const FILEIRA_DA_RODA = [[0, 0], [-100, 8], [100, 8], [-200, 8]];
const MARGEM = { cima: 52, baixo: 92, lado: 6 }; // o que fica livre: as pílulas do alto e a vaga embaixo

export const acoesUi = {
  raiz: null, hud: null,
  vaga: null, lista: null, balao: null, roda: null,
  rodaAlvo: null, rodaOpcoes: null, rodaAberta: false, listaAberta: false,
  apontado: null, opcoesApontadas: null, // o alvo destacado agora (entrada/index.js) e as opções dele
};

export function criarAcoes(ui, hud) {
  const A = acoesUi;
  A.raiz = ui; A.hud = hud;
  // o desenho das ações que mudou com as ações por toque (vale também para a fila de tarefas)
  Object.assign(ICONE_DA_ACAO, { colher: 'ui/colher', colherFruta: 'ui/colher', afagar: 'ui/afagar', rocar: 'ui/limpar' });

  // ---------- a vaga "Na mão" ----------
  const mao = el('div', 'mao');
  const vaga = el('button', 'bt vaga-mao'); vaga.type = 'button';
  const aba = el('span', 'aba-mao', T.mao.rotulo), ic = icone('ui/comprar-sementes', 46), txt = el('span', 'txt-mao'), nome = el('b'), conta = el('span', 'conta-mao');
  txt.append(nome, conta); vaga.append(aba, ic, txt);
  vaga.dataset.k = 'vaga-mao';
  const lista = el('div', 'lista-mao'); lista.hidden = true;
  mao.append(lista, vaga);
  A.vaga = vaga; A.lista = lista;
  hud.vaga = vaga;
  // a fileira de baixo (a do antigo seletor de modos): a vaga, e o que as frentes põem ao lado (a porta do celeiro)
  const linha = hud.rodape.querySelector('.modos') || hud.rodape;
  linha.prepend(mao);

  vaga.addEventListener('click', () => {
    som.tocar('toque');
    fecharRoda();
    if (A.listaAberta) { fecharLista(); return; }
    if (!itensParaAMao(J.mundo).length) { abrirPainel('loja', { aba: 'sementes' }); return; }
    abrirLista();
  });

  let assinaturaLista = '';
  function montarLista() {
    const m = J.mundo, D = m.dados, itens = itensParaAMao(m), naMao = itemNaMao(m);
    const a = itens.map((id) => id + ':' + (m.posses.bolsa[id] || 0)).join(',') + '|' + naMao;
    if (a === assinaturaLista && lista.childElementCount) return;
    assinaturaLista = a;
    lista.textContent = '';
    for (const id of itens) {
      const b = el('button', 'bt carta-mao'); b.type = 'button';
      b.dataset.item = id;
      const c = el('span', 'conta-carta', T.mao.conta(m.posses.bolsa[id] || 0));
      b.append(icone('icone/' + id, 40), el('span', 'nome-carta', nomeCurto(D, id)), c);
      b.setAttribute('aria-label', `${nomeCurto(D, id)} ${T.mao.conta(m.posses.bolsa[id] || 0)}`);
      classe(b, 'ativo', id === naMao);
      b.addEventListener('click', () => {
        const r = J.mundo.comando({ tipo: 'naMao', item: id });
        som.tocar(r.ok ? 'toque' : 'erro');
        fecharLista();
      });
      lista.append(b);
    }
    const comprar = el('button', 'bt carta-mao comprar'); comprar.type = 'button';
    comprar.dataset.k = 'comprar-sementes';
    comprar.append(icone('ui/mais', 40), el('span', 'nome-carta', T.mao.comprar));
    comprar.addEventListener('click', () => { som.tocar('toque'); fecharLista(); abrirPainel('loja', { aba: 'sementes' }); });
    lista.append(comprar);
  }
  function abrirLista() {
    montarLista();
    lista.hidden = false; A.listaAberta = true;
    classe(vaga, 'aberta', true);
    foco.abrirPopup(lista, fecharLista);
    if (J.meio === 'teclas') { const b = lista.querySelector('.carta-mao.ativo') || lista.querySelector('.carta-mao'); if (b) foco.focar(b); }
  }
  function fecharLista() {
    if (!A.listaAberta) return false;
    lista.hidden = true; A.listaAberta = false;
    classe(vaga, 'aberta', false);
    foco.fecharPopup(lista);
    return true;
  }
  A.abrirLista = abrirLista; A.fecharLista = fecharLista;

  // a vaga: o que está na mão (ou, com a roda de um abrigo aberta, a comida que ela vai dar)
  function atualizarVaga(m) {
    const D = m.dados, comida = A.rodaAberta && A.rodaOpcoes && A.rodaOpcoes.find((o) => o.id === 'abastecerCocho' && o.item);
    let chave, n1, n2, n = 0, vazia = false;
    if (comida) { chave = 'icone/' + comida.item; n1 = D.itens[comida.item] ? D.itens[comida.item].nome : comida.item; n = quantoTem(m, comida.item); n2 = T.mao.conta(n); }
    else {
      const item = itemNaMao(m);
      if (item) { chave = 'icone/' + item; n1 = nomeCurto(D, item); n = m.posses.bolsa[item] || 0; n2 = T.mao.conta(n); }
      else { chave = 'ui/comprar-sementes'; n1 = T.mao.comprarSementes; n2 = ''; vazia = true; }
    }
    trocarIcone(ic, chave);
    por(nome, n1); por(conta, n2);
    if (conta.hidden !== !n2) conta.hidden = !n2;
    classe(vaga, 'vazia', vazia);
    const rot = vazia ? T.mao.dica('', 0) : T.mao.dica(n1, n);
    if (vaga._rot !== rot) { vaga._rot = rot; vaga.title = rot; vaga.setAttribute('aria-label', rot); }
    if (A.listaAberta) {
      montarLista();
      for (const b of lista.querySelectorAll('.carta-mao[data-item]')) classe(b, 'ativo', b.dataset.item === itemNaMao(m));
    }
  }

  // ---------- o balãozinho ----------
  const balao = el('div', 'balao-acao'), bic = icone('ui/mao', 40);
  balao.append(bic); balao.hidden = true;
  A.balao = balao;

  // ---------- a roda ----------
  const roda = el('div', 'roda-acoes'); roda.hidden = true;
  A.roda = roda;
  ui.append(balao, roda);

  let abertaEm = 0;
  function abrirRoda(alvo, opcoes, porTeclas) {
    const m = J.mundo, D = m.dados, lista2 = valem(opcoes).slice(0, 4);
    if (lista2.length < 2) return false;
    fecharLista();
    roda.textContent = '';
    A.rodaAlvo = { ...alvo }; A.rodaOpcoes = lista2; A.rodaAberta = true; abertaEm = performance.now();
    lista2.forEach((o, k) => {
      const b = el('button', 'bt-roda' + (k === 0 ? ' principal' : '')); b.type = 'button';
      const circ = el('i', 'roda-circ');
      circ.append(icone(iconeDaOpcao(o, alvo), k === 0 ? 54 : 42));
      const rot = nomeDaOpcao(o, D);
      b.append(circ, el('span', 'roda-nome', rot));
      b.dataset.opcao = o.id;
      b.setAttribute('aria-label', fraseDaOpcao(o, D) || rot);
      // (o clique que o navegador inventa logo depois do toque que abriu a roda não vale: o dedo nem saiu do lugar)
      b.addEventListener('click', (e) => { e.stopPropagation(); if (e.detail > 0 && performance.now() - abertaEm < 400) return; escolher(o.id); });
      roda.append(b);
    });
    roda.hidden = false;
    posicionarRoda();
    foco.abrirPopup(roda, fecharRoda);
    if (porTeclas === true) focarRoda();
    som.tocar('toque');
    return true;
  }
  function focarRoda() { const b = roda.querySelector('.bt-roda'); if (b && A.rodaAberta) foco.focar(b); }
  function escolher(id) {
    const alvo = A.rodaAlvo;
    fecharRoda();
    if (!alvo) return;
    const r = J.mundo.comando({ tipo: 'agirNoAlvo', ...alvo, opcao: id });
    som.tocar(r.ok ? 'toque' : 'erro');
    const c = centroDoAlvo(alvo);
    if (c && J.cena.part) J.cena.part.anel(c[0], c[1], r.ok ? '#ffffff' : '#ffb39a');
  }
  function fecharRoda() {
    if (!A.rodaAberta) return false;
    A.rodaAberta = false; A.rodaAlvo = null; A.rodaOpcoes = null;
    roda.hidden = true; roda.textContent = '';
    foco.fecharPopup(roda);
    return true;
  }
  A.abrirRoda = abrirRoda; A.fecharRoda = fecharRoda; A.focarRoda = focarRoda; A.escolher = escolher;

  // tocar fora da roda (ou da fileira da vaga) fecha; o toque no chão que fechou não vira ordem
  window.addEventListener('pointerdown', (e) => {
    const t = e.target;
    if (A.rodaAberta && !roda.contains(t)) { fecharRoda(); if (t && t.id === 'tela') { e.stopPropagation(); e.preventDefault(); } }
    if (A.listaAberta && !lista.contains(t) && !vaga.contains(t)) { fecharLista(); if (t && t.id === 'tela') { e.stopPropagation(); e.preventDefault(); } }
  }, true);

  // ---------- onde fica cada coisa na tela ----------
  function centroDoAlvo(alvo) {
    const m = J.mundo;
    if (alvo.entidade !== undefined && alvo.entidade !== null) { const e = m.local.porId[alvo.entidade]; return e ? [e.x + e.l / 2, e.z + e.p / 2, TIPOS[e.tipo].altura || 1.6 + Math.min(e.l, e.p) * 0.5] : null; } // (o alto: o da seta do tutorial)
    return [alvo.x + 0.5, alvo.z + 0.5, 0.45];
  }
  // o ponto do #ui (x, y) em cima do alvo
  const pt = [0, 0];
  function noUi(c) {
    const cam = J.cena.cam, k = J.esc || 1;
    pt[0] = cam.cssX(c[0], c[1]) / k; pt[1] = cam.cssY(c[0], c[2], c[1]) / k;
    return pt;
  }
  // a roda em volta do alvo: tenta em cima dele, embaixo, e no meio; fica o jeito que menos sai da área livre
  const g = [0, 0], t = [0, 0];
  function posicionarRoda() {
    const c = A.rodaAlvo && centroDoAlvo(A.rodaAlvo);
    if (!c) { fecharRoda(); return; }
    const cam = J.cena.cam, k = J.esc || 1, W = cam.w / k, H = cam.h / k;
    noUi(c); t[0] = pt[0]; t[1] = pt[1];
    noUi([c[0], c[1], 0]); g[0] = pt[0]; g[1] = pt[1];
    const bs = roda.children, n = bs.length, L = LUGARES[n] || LUGARES[4];
    const jeitos = [
      (i) => [t[0] + L[i][0], t[1] + L[i][1]],
      (i) => [g[0] + L[i][0], g[1] + 34 - L[i][1]],
      (i) => [(t[0] + g[0]) / 2 + FILEIRA_DA_RODA[i][0], (t[1] + g[1]) / 2 + FILEIRA_DA_RODA[i][1]],
    ];
    let melhor = null, nota = Infinity;
    for (const f of jeitos) {
      let fora = 0;
      for (let i = 0; i < n; i++) {
        const [x, y] = f(i), w = bs[i].offsetWidth || 80, h = bs[i].offsetHeight || 96;
        fora += Math.max(0, MARGEM.lado - (x - w / 2)) + Math.max(0, x + w / 2 - (W - MARGEM.lado)) + Math.max(0, MARGEM.cima - (y - h / 2)) + Math.max(0, y + h / 2 - (H - MARGEM.baixo));
      }
      if (fora < nota - 0.5) { nota = fora; melhor = f; }
      if (fora < 0.5) break;
    }
    for (let i = 0; i < n; i++) {
      const b = bs[i], w = b.offsetWidth || 80, h = b.offsetHeight || 96, [x, y] = melhor(i);
      const bx = Math.max(MARGEM.lado, Math.min(W - w - MARGEM.lado, x - w / 2)), by = Math.max(MARGEM.cima, Math.min(H - h - MARGEM.baixo, y - h / 2));
      const tr = `translate(${Math.round(bx)}px, ${Math.round(by)}px)`;
      if (b._tr !== tr) { b._tr = tr; b.style.transform = tr; }
    }
  }

  let ultimoMundo = null;
  A.atualizar = function () {
    const m = J.mundo;
    if (m !== ultimoMundo) { ultimoMundo = m; fecharRoda(); fecharLista(); }
    const chegando = !!(m.comeco && m.comeco.chegada);
    classe(document.body, 'na-chegada', chegando);
    atualizarVaga(m);
    // com painel ou tela de subida na frente, a roda e a fileira da vaga fecham
    if ((painelAberto() || subidaAberta()) && (A.rodaAberta || A.listaAberta)) { fecharRoda(); fecharLista(); }
    if (A.rodaAberta) posicionarRoda();
    // o balão: só com ação que dá, e sem a roda aberta
    const o = A.opcoesApontadas && A.opcoesApontadas[0], alvo = A.apontado;
    const mostra = !!(o && o.ok && alvo && !A.rodaAberta && !chegando && !painelAberto() && !document.body.classList.contains('colocando'));
    if (mostra) {
      const c = centroDoAlvo(alvo);
      if (c) {
        trocarIcone(bic, iconeDaOpcao(o, alvo));
        const [x, y] = noUi(c), tr = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
        if (balao._tr !== tr) { balao._tr = tr; balao.style.transform = tr; }
      }
      if (balao.hidden !== !c) balao.hidden = !c;
    } else if (!balao.hidden) balao.hidden = true;
  };

  // o alvo destacado (entrada/index.js, umas vezes por segundo): alvo = { x, z } | { entidade } | null
  A.apontar = function (alvo, opcoes) { A.apontado = alvo; A.opcoesApontadas = opcoes; };

  // o tutorial: para onde a seta aponta quando o passo é escolher o que vai na mão
  hud.alvoDaMao = (item) => (A.listaAberta ? lista.querySelector(`.carta-mao[data-item="${item}"]`) || lista.querySelector('.carta-mao.comprar') : vaga);

  return A;
}

// o mundo instalado: a interface fica sempre no jeito das ações por toque (o modo "mão" por dentro); a escolha da
// vaga fica gravada
aoInstalarMundo((m) => {
  if (m.modo.id !== 'mao') m.comando({ tipo: 'escolherModo', modo: 'mao' });
  m.eventos.ouvir('naMaoMudou', () => { J.gravarLogo(); });
});
