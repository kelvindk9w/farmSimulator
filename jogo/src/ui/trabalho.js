// A interface dos animais de trabalho e de estimação:
//   dois botões no alto, à direita (antes dos painéis), que só existem para quem tem o bicho E o apetrecho:
//     "ir a cavalo" (tecla H) e "levar o jumento" (tecla J); ligado, o botão fica verde;
//   na linha do cesto, o que há na carroça (só quando tem alguma coisa) e a água do barril (com o jumento junto);
//   os botões do painel do estábulo (paineis/extras-do-abrigo.js): montar, levar o jumento, arar, e o que falta comprar;
//   o retorno de cada evento (corações do afago, o mimo subindo, "+4 na carroça") e o que o Seu Tonho explica na
//   primeira vez de cada coisa (arar com o boi, montar, levar o jumento, encher o barril, o afago).
import './textos/trabalho.js';
import { coracoes, mimoNoAr } from '../render/trabalho.js';
import { aoInstalarMundo } from './ligacoes.js';
import { el, icone, botao, por, classe } from './dom.js';
import { T } from './textos.js';
import { J } from '../contexto.js';
import { avisar } from './avisos.js';
import { ICONE_DA_ACAO } from './hud.js';
import { EXTRAS_DO_ABRIGO } from './paineis/extras-do-abrigo.js';
import { INFO_DO_ANIMAL } from './paineis/animais.js';
import { abrirPainel, fecharPainel, painelAberto } from './paineis/registro.js';
import { subidaAberta } from './subida.js';
import { foco } from '../entrada/foco.js';
import { som } from '../plataforma/som.js';
import { jaViuDica, estaTratado, defDoAnimal } from '../nucleo/sistemas/animais.js';
import { jaTem } from '../nucleo/sistemas/loja.js';
import { estadoDoTrabalho, bichoDe, faltaDe, casasPorPassada, capacidadeDaCarroca } from '../nucleo/sistemas/trabalho.js';
import { bichoSolto } from '../nucleo/sistemas/acompanhar.js';
import { TIPOS } from '../nucleo/registro.js';

Object.assign(ICONE_DA_ACAO, { ararComBoi: 'icone/arado', encherBarril: 'icone/barril-de-agua', encherNoBarril: 'icone/gota', afagar: 'ui/mao' });

// no cartão do bicho de trabalho, na aba "Animais" da loja: com o que ele trabalha (e se ainda falta comprar)
INFO_DO_ANIMAL.push((m, d) => {
  if (d.familia !== 'trabalho' || !Array.isArray(d.exige) || !d.exige.length) return null;
  const item = d.exige.find((id) => m.dados.itens[id]);
  return item ? `${d.descricao || ''} ${T.trabalho.info.precisa(m.dados, item, jaTem(m, item))}.`.trim() : null;
});

// ---------- os dois botões e os dois contadores ----------
// Os dois botões ficam na fila do alto, à direita, antes dos painéis. Na tela estreita (celular deitado), onde a fila
// não cabe sem cobrir o ouro, eles descem para a direita, logo abaixo da fila (e do balão do vizinho, se houver).
const H = { pronto: false };
function prepararHud(hud) {
  if (!hud || H.hud === hud) return;
  H.hud = hud;
  const dir = hud.raiz.querySelector('.topo-dir'), linha = hud.raiz.querySelector('.topo-esq .linha:last-child');
  const tecla = (b, k) => { const t = el('span', 'tecla', k); t.setAttribute('aria-hidden', 'true'); b.append(t); return b; };
  H.cavalo = tecla(botao({ icone: 'icone/sela', tamanho: 30, classe: 'quadrado trab', rotulo: T.trabalho.cavalo.rotulo, aoClicar: () => alternar('cavalo') }), 'H');
  H.jumento = tecla(botao({ icone: 'icone/carroca', tamanho: 32, classe: 'quadrado trab', rotulo: T.trabalho.jumento.rotulo, aoClicar: () => alternar('jumento') }), 'J');
  H.cavalo.dataset.k = 'ir-a-cavalo'; H.jumento.dataset.k = 'levar-jumento';
  H.cavalo.hidden = H.jumento.hidden = true;
  dir.prepend(H.cavalo, H.jumento);
  H.dir = dir; H.l1 = hud.raiz.querySelector('.topo-esq .linha');
  H.lado = el('div', 'trab-lado');
  hud.raiz.append(H.lado);
  hud.paineis['ir-a-cavalo'] = H.cavalo; // (é por estes nomes que o guia das missões manda a seta para cá)
  hud.paineis['levar-jumento'] = H.jumento;
  H.carga = el('div', 'chip trab-carga'); H.nCarga = el('span');
  H.carga.append(icone('icone/carroca', 24), H.nCarga);
  H.agua = el('div', 'chip trab-agua'); H.nAgua = el('span');
  H.agua.append(icone('icone/barril-de-agua', 22), H.nAgua);
  H.carga.hidden = H.agua.hidden = true;
  if (linha) linha.append(H.carga, H.agua);
}
function atualizarHud() {
  const m = J.mundo;
  if (!H.hud || !m || !m.trabalho) return;
  const s = estadoDoTrabalho(m), raiz = H.hud.raiz;
  const cav = !!s.cavalo && !s.cavalo.falta, jum = !!s.jumento && !s.jumento.falta;
  if (H.cavalo.hidden !== !cav) H.cavalo.hidden = !cav;
  if (H.jumento.hidden !== !jum) H.jumento.hidden = !jum;
  if (cav) { classe(H.cavalo, 'ativo', s.cavalo.ligado); const r = s.cavalo.ligado ? T.trabalho.cavalo.ligado : T.trabalho.cavalo.rotulo; if (H.cavalo.title !== r) { H.cavalo.title = r; H.cavalo.setAttribute('aria-label', r); } }
  if (jum) { classe(H.jumento, 'ativo', s.jumento.ligado); const r = s.jumento.ligado ? T.trabalho.jumento.ligado : T.trabalho.jumento.rotulo; if (H.jumento.title !== r) { H.jumento.title = r; H.jumento.setAttribute('aria-label', r); } }
  // a carroça só aparece com alguma coisa dentro; a água do barril, com o jumento junto
  const j = s.jumento, temCarga = !!j && j.carga > 0, temAgua = !!j && j.ligado && !j.falta && !!j.barril;
  if (H.carga.hidden !== !temCarga) H.carga.hidden = !temCarga;
  if (temCarga) { por(H.nCarga, `${j.carga}/${j.capacidade}`); classe(H.carga, 'cheio', j.carga >= j.capacidade); H.carga.title = T.trabalho.carga(j.carga, j.capacidade); }
  if (H.agua.hidden !== !temAgua) H.agua.hidden = !temAgua;
  if (temAgua) { por(H.nAgua, `${j.barril.agua}/${j.barril.capacidade}`); classe(H.agua, 'vazio', j.barril.agua === 0); H.agua.title = T.trabalho.agua(j.barril.agua, j.barril.capacidade); }
  classe(raiz, 'a-cavalo', !!s.cavalo && s.cavalo.montada); // montada, a barra de fôlego some (ela não cansa)
  if (cav || jum) arrumar();
}
// cabem na fila do alto? (com folga, para não ficar indo e vindo quando o número do ouro cresce um dígito)
function arrumar() {
  const { dir, l1, lado } = H, ui = H.hud.raiz;
  if (!dir || !l1 || !dir.getClientRects().length) return;
  const r1 = l1.getBoundingClientRect(), rd = dir.getBoundingClientRect();
  if (H.cavalo.parentNode === dir) { if (rd.left < r1.right + 8) lado.append(H.cavalo, H.jumento); }
  else if (rd.left - 2 * 54 >= r1.right + 24) dir.prepend(H.cavalo, H.jumento);
  if (H.cavalo.parentNode !== lado) return;
  let embaixo = rd.bottom;
  const b = ui.querySelector('.balao:not(.esq):not([hidden])');
  if (b) { const rb = b.getBoundingClientRect(); if (rb.height > 0) embaixo = Math.max(embaixo, rb.bottom); }
  const t = Math.round(embaixo - ui.getBoundingClientRect().top + 6) + 'px';
  if (lado.style.top !== t) lado.style.top = t;
}
setInterval(() => { if (!document.hidden) atualizarHud(); }, 150);

function alternar(qual) {
  const m = J.mundo;
  som.tocar('toque');
  const r = m.comando({ tipo: qual === 'cavalo' ? 'irACavalo' : 'levarJumento' });
  atualizarHud();
  return r;
}

// teclas H (cavalo) e J (jumento): fora de painel, menu e caixa de texto
window.addEventListener('keydown', (e) => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || (e.code !== 'KeyH' && e.code !== 'KeyJ')) return;
  const a = e.target;
  if (a && (a.tagName === 'TEXTAREA' || a.tagName === 'INPUT') || painelAberto() || subidaAberta() || foco.menu || !J.mundo || !J.mundo.trabalho) return;
  e.preventDefault();
  alternar(e.code === 'KeyH' ? 'cavalo' : 'jumento');
});

// ---------- o painel do estábulo ----------
const abrigoDeTrabalho = (m, e) => Object.values(m.dados.animais).some((d) => d.familia === 'trabalho' && d.abrigo === e.tipo);
EXTRAS_DO_ABRIGO.push((m, e) => {
  if (!m.trabalho || !abrigoDeTrabalho(m, e)) return null;
  const A = T.trabalho.abrigo, D = m.dados, out = [];
  const falta = (a, id) => {
    const item = faltaDe(m, a);
    if (!item) return false;
    out.push({ id: id + '-falta', texto: A.falta(D, item), icone: 'icone/' + item, dica: A.faltaDica(D, a.especie, item), aoClicar() { abrirPainel('loja', { item }); } });
    return true;
  };
  const semTrato = (a) => (estaTratado(m, a) ? null : A.semTrato(D, a.especie));
  const boi = bichoDe(m, 'arar'), cav = bichoDe(m, 'montaria'), jum = bichoDe(m, 'carga');
  if (boi && !falta(boi, 'boi')) out.push({ id: 'arar', texto: A.arar, icone: 'icone/arado', ligado: m.modo.id === 'arado', dica: semTrato(boi) || A.ararDica(casasPorPassada(m, boi)), aoClicar() { m.comando({ tipo: 'escolherModo', modo: 'arado' }); fecharPainel(); } });
  if (cav && !falta(cav, 'cavalo')) out.push({ id: 'cavalo', texto: m.trabalho.aCavalo ? A.aPe : A.montar, icone: 'icone/sela', ligado: m.trabalho.aCavalo, dica: semTrato(cav) || A.montarDica, aoClicar() { alternar('cavalo'); } });
  if (jum && !falta(jum, 'jumento')) out.push({ id: 'jumento', texto: m.trabalho.levando ? A.deixar : A.levar, icone: 'icone/carroca', ligado: m.trabalho.levando, dica: semTrato(jum) || A.levarDica(capacidadeDaCarroca(m)), aoClicar() { alternar('jumento'); } });
  return out;
});

// ---------- a figura do cartão na loja ----------
// O cartão da aba "Animais" (e o da loja de cash) mostra animal/<id>/parada-frente. Os bichos desta frente têm
// "parado" (boi, cavalo, jumento) ou só "sentado" e "andar" (o siamês): a figura do cartão passa a ser a que existe,
// do próprio bicho ou, no especial sem figura, do comum que faz o mesmo.
function figurasDoCartao(m) {
  const A = J.cena && J.cena.atlas, D = m.dados.animais || {};
  if (!A) return;
  for (const [id, d] of Object.entries(D)) {
    if (d.familia !== 'trabalho' && d.familia !== 'estimacao') continue;
    const chave = `animal/${id}/parada-frente`;
    if (A.tem(chave)) continue;
    const efeito = JSON.stringify(d.efeito || 1);
    const comum = Object.keys(D).find((k) => k !== id && !D[k].especial && D[k].familia === d.familia && JSON.stringify(D[k].efeito || 1) === efeito);
    achar: for (const quem of comum ? [id, comum] : [id]) {
      for (const est of ['parado', 'sentado', 'parada', 'andar']) { const c = `animal/${quem}/${est}-frente`; if (A.tem(c)) { A.pecas[chave] = A.peca(c); break achar; } }
    }
  }
}

// ---------- o que o Seu Tonho explica na primeira vez de cada mecânica ----------
function explicar(m, tutorial, chave, titulo, fala) {
  const k = 'trabalho:' + chave;
  if (jaViuDica(m, k)) return false;
  m.comando({ tipo: 'viuDicaDeAnimal', dica: k });
  if (tutorial && tutorial.dizer) tutorial.dizer(titulo, fala, 12); else avisar(fala, 'bom', 6000);
  J.gravarLogo();
  return true;
}

aoInstalarMundo((m, ctx) => {
  if (!m.trabalho) return;
  const tutorial = ctx && ctx.tutorial, ev = m.eventos, D = m.dados, F = T.trabalho.tonho;
  prepararHud(ctx && ctx.hud);
  atualizarHud();
  figurasDoCartao(m);
  const part = () => J.cena && J.cena.part;
  const noBicho = (id) => { const e = id ? bichoSolto(m, id) : null; return e ? [e.x + 0.5, e.z + 0.5] : null; };
  const doPapel = (tipo) => { const a = bichoDe(m, tipo); return a ? noBicho(a.id) : null; };

  for (const tipo of ['montariaMudou', 'jumentoMudou', 'carregouCarroca', 'encheuBarril', 'ganhouItem', 'animalChegou', 'animalSaiu', 'carregou', 'vendeuTudo', 'guardou', 'encheu', 'montouNoCavalo', 'apeou']) ev.ouvir(tipo, atualizarHud);

  // o bicho chegou sem o apetrecho: o que falta e onde se compra
  ev.ouvir('faltaApetrecho', (d) => { avisar(T.trabalho.chegouSemApetrecho(D, d.animal, d.item), '', 6000); });
  ev.ouvir('comprou', (d) => {
    if (d.item === 'barril-de-agua' || (D.itens[d.item] && D.itens[d.item].funcao === 'barril')) explicar(m, tutorial, 'barril', F.titulo.barril, F.barril);
  });

  // o boi: na primeira vez do modo "Arado"
  ev.ouvir('modoMudou', (d) => { if (d.modo === 'arado') explicar(m, tutorial, 'boi', F.titulo.boi, F.boi(casasPorPassada(m))); });
  // os dois botões
  // (na primeira vez quem fala é o Seu Tonho; o aviso curto fica para as outras)
  ev.ouvir('montariaMudou', (d) => {
    if (!(d.ligado && explicar(m, tutorial, 'cavalo', F.titulo.cavalo, F.cavalo))) avisar(d.ligado ? T.trabalho.ligou.cavalo : T.trabalho.desligou.cavalo, 'bom', 1800);
    J.gravarLogo();
  });
  ev.ouvir('jumentoMudou', (d) => {
    if (!(d.ligado && explicar(m, tutorial, 'jumento', F.titulo.jumento, F.jumento))) avisar(d.ligado ? T.trabalho.ligou.jumento : T.trabalho.desligou.jumento, 'bom', 1800);
    J.gravarLogo();
  });
  ev.ouvir('montouNoCavalo', () => { const p = m.personagem, P = part(); if (P) P.brilho(p.x, 0.6, p.z, 6); });
  ev.ouvir('apeou', () => { const p = m.personagem, P = part(); if (P) P.terra(Math.floor(p.x), Math.floor(p.z), 6); });

  // a carroça e o barril
  ev.ouvir('carregouCarroca', (d) => { const c = doPapel('carga'), P = part(); if (c && P) P.texto(T.ganhos.carroca(d), c[0], 1.6, c[1], '#ffe07a'); J.gravarLogo(); });
  ev.ouvir('encheuBarril', (d) => {
    const c = doPapel('carga'), P = part();
    if (c && P) { P.espirrar(c[0], c[1]); P.texto(T.ganhos.barril(d), c[0], 1.7, c[1], '#bfe6ff'); }
    explicar(m, tutorial, 'barril-cheio', F.titulo.barrilCheio, F.barrilCheio);
    J.gravarLogo();
  });
  ev.ouvir('encheu', (d) => { if (!d.doBarril) return; const c = doPapel('carga'), P = part(); if (c && P) P.espirrar(c[0], c[1]); });

  // os bichos de estimação: o afago e o mimo
  const pet = (d) => { const e = d.entidade && m.local.porId[d.entidade]; return e ? [e.x + 0.5, e.z + 0.5] : null; };
  ev.ouvir('afagou', (d) => { const c = pet(d); if (c) coracoes(c[0], c[1]); });
  ev.ouvir('ganhouMimo', (d) => {
    const c = pet(d);
    if (c) mimoNoAr(c[0], c[1], d.item, d.n);
    avisar(T.ganhos.mimo(d, D), 'bom', 3600);
    J.gravarLogo();
  });
  const chegou = (d) => {
    const def = defDoAnimal(m, d.animal);
    if (def && def.familia === 'estimacao') setTimeout(() => explicar(m, tutorial, 'afago', F.titulo.afago, F.afago(D, d.animal)), 600);
  };
  ev.ouvir('animalChegou', chegou);
  ev.ouvir('ganhouAnimalEspecial', chegou);
});

// para as ferramentas de conferência
// (obstaculo: árvore, mato e pedra na frente não tapam o toque na casa de trás; é o que a entrada faz)
if (typeof window !== 'undefined') window.__trabalho = { estado: () => (J.mundo ? estadoDoTrabalho(J.mundo) : null), botoes: () => H, obstaculo: (id) => { const e = J.mundo && J.mundo.local.porId[id]; return !!e && !!TIPOS[e.tipo] && !!TIPOS[e.tipo].obstaculo; } };
