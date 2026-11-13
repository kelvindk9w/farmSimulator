// O retorno da frente dos animais na interface: os textos, o desenho no terreno, o que cada evento mostra (bicho
// comprado, cocho cheio, ovo recolhido, fim de vida), o que há na caixa de ovos e no balde (HUD), o resumo da volta
// de uma ausência e o que o Seu Tonho explica na primeira vez de cada coisa. Tudo se liga a cada mundo instalado.
import './textos/animais.js';
import { bichosNoTerreno } from '../render/animais.js';
import { aoInstalarMundo } from './ligacoes.js';
import { el, icone, por, classe } from './dom.js';
import { T } from './textos.js';
import { J } from '../contexto.js';
import { avisar } from './avisos.js';
import { ICONE_DA_ACAO } from './hud.js';
import { INFO_DA_OFERTA } from './paineis/loja.js';
import { construcaoPorId } from '../nucleo/sistemas/construcao.js';
import { abrigosProntos, comidaDoAbrigo, defDoAnimal, faltaNoAbrigo, quantosNoAbrigo, jaViuDica } from '../nucleo/sistemas/animais.js';
import { recipienteDe, capacidadeDoRecipiente, noRecipiente, podeRecolher, prontosNoAbrigo } from '../nucleo/sistemas/producao.js';

const comidaDaTarefa = (t) => { const e = J.mundo && J.mundo.local.porId[t.entidade], item = e ? comidaDoAbrigo(J.mundo, e) : null; return item ? 'icone/' + item : 'icone/racao'; };
Object.assign(ICONE_DA_ACAO, { abastecerCocho: comidaDaTarefa, abastecerBebedouro: 'icone/gota', recolherOvo: 'icone/ovo', ordenhar: 'icone/leite', tosquiar: 'icone/la' });

// na loja: o recipiente de recolher diz quanto leva; a comida de bicho diz quem come
INFO_DA_OFERTA.push((m, it) => {
  const D = m.dados;
  if (it.tipo === 'recipiente') { for (const k in D.recipienteDoProduto) if (D.recipienteDoProduto[k] === it.funcao) return `Leva ${it.capacidade} × ${D.itens[k].nome.toLowerCase()}`; }
  if (it.tipo === 'racao') { const quem = Object.values(D.animais).filter((a) => a.comida === it.id && a.preco.ouro > 0).map((a) => a.nome.toLowerCase()); if (quem.length) return `Comida de ${quem.slice(0, 3).join(', ')}`; }
  return null;
});

const VERDE = '#d9ffb0', AZUL = '#bfe6ff', DOURADO = '#ffe07a';
const GRAVA_LOGO = { tratou: 1, recolheu: 1, vendeuAnimal: 1, aposentou: 1, animalChegou: 1, fimDeVida: 1 };

// ---------- HUD: o que há na caixa de ovos e no balde (aparece quando tem alguma coisa dentro) ----------
const chips = {}; // produto → { chip, conta }
let linhaDoHud = null;
function prepararChips(hud) {
  const linha = hud && hud.raiz && hud.raiz.querySelector('.topo-esq .linha:last-child');
  if (!linha || linha === linhaDoHud) return;
  linhaDoHud = linha;
  for (const k in chips) { chips[k].chip.remove(); delete chips[k]; }
  const R = J.dados.recipienteDoProduto || {};
  for (const produto in R) {
    const chip = el('div', 'chip recipiente'), conta = el('span');
    chip.append(icone('icone/' + produto, 22), conta);
    chip.title = J.dados.itens[produto].nome;
    chip.dataset.produto = produto;
    chip.hidden = true;
    linha.append(chip);
    chips[produto] = { chip, conta };
  }
}
function atualizarChips() {
  const m = J.mundo;
  if (!m || !m.animais) return;
  const R = m.dados.recipienteDoProduto;
  for (const produto in chips) {
    const c = chips[produto], n = m.posses.cesto.itens[produto] || 0, some = !(n > 0);
    if (c.chip.hidden !== some) c.chip.hidden = some;
    if (some) continue;
    const rec = recipienteDe(m, R[produto]), cap = rec ? capacidadeDoRecipiente(m, rec) : n;
    por(c.conta, `${n}/${cap}`);
    classe(c.chip, 'cheio', noRecipiente(m, R[produto]) >= cap);
  }
}
setInterval(() => { if (!document.hidden) atualizarChips(); }, 500);

// ---------- o que o Seu Tonho explica na primeira vez de cada mecânica ----------
function explicar(m, tutorial, chave, titulo, fala) {
  if (!tutorial || !tutorial.dizer || jaViuDica(m, chave)) return false;
  m.comando({ tipo: 'viuDicaDeAnimal', dica: chave });
  tutorial.dizer(titulo, fala);
  J.gravarLogo();
  return true;
}

aoInstalarMundo((m, ctx) => {
  if (!m.animais) return;
  const cena = J.cena, part = cena.part, D = m.dados, ev = m.eventos, tutorial = ctx && ctx.tutorial, F = T.animais.tonho;
  prepararChips(ctx && ctx.hud);
  atualizarChips();
  const centro = (id) => { const e = id ? construcaoPorId(m, id) : null; return e && e.local === m.personagem.local ? [e.x + e.l / 2, e.z + e.p / 2, e] : null; };
  const deProducao = (id) => { const d = D.animais[id]; return d && d.familia === 'producao' ? d : null; };

  ev.ouvir('*', (d, tipo) => { if (GRAVA_LOGO[tipo]) J.gravarLogo(); });
  ev.ouvir('carregou', atualizarChips);

  // bicho novo: festa em cima do abrigo (o aviso do alto da tela é o de "comprou": T.ganhos.comprou)
  ev.ouvir('comprou', (d) => {
    if (!d.animal) return;
    const c = centro(d.entidade), a = deProducao(d.animal);
    if (c) part.brilho(c[0], 1.2, c[1], 14);
    if (a) explicar(m, tutorial, 'animal', F.titulo.animal, F.animal(a, D));
  });

  // cocho e bebedouro: o que entrou sobe do abrigo
  ev.ouvir('tratou', (d) => {
    const c = centro(d.entidade);
    if (c) {
      if (d.parte === 'bebedouro') { part.espirrar(c[0], c[1]); part.texto(T.ganhos.bebedouro(d), c[0], 1.9, c[1], AZUL); }
      else part.texto(T.ganhos.cocho(d, D), c[0], 1.9, c[1], DOURADO);
    }
    // a explicação vem quando o bicho de fato comeu (os dois estão servidos)
    const e = d.entidade && construcaoPorId(m, d.entidade);
    if (!e || !quantosNoAbrigo(m, e.id)) return;
    const falta = faltaNoAbrigo(m, e), a = m.animais.lista.find((x) => x.abrigo === e.id && x.familia === 'producao');
    if (a && !falta.comida && !falta.agua) explicar(m, tutorial, 'trato', F.titulo.trato, F.trato(defDoAnimal(m, a), D));
  });

  // produto pronto: um aviso só por abrigo (vários bichos produzem juntos, e na volta de uma ausência vêm muitos)
  const avisados = new Map(); // abrigo → relógio
  ev.ouvir('animalProduziu', (d) => {
    const a = deProducao(d.animal);
    if (!a) return;
    const r = podeRecolher(m, a);
    explicar(m, tutorial, 'recolher:' + a.produto, F.titulo.recolher, F.recolher(a, D, r.ok || r.motivo !== 'falta-de-recolher', r.dados && r.dados.item));
    clearTimeout(avisados.get(d.entidade));
    avisados.set(d.entidade, setTimeout(() => {
      avisados.delete(d.entidade);
      if (voltando) return; // o resumo da volta já diz
      const n = prontosNoAbrigo(m, d.entidade);
      if (n > 0) avisar(T.ganhos.temProduto({ animal: d.animal, n }, D), 'bom', 3600);
    }, 80));
  });

  ev.ouvir('recolheu', (d) => {
    const c = centro(d.entidade), a = deProducao(d.animal);
    if (c) { part.brilho(c[0], 1.0, c[1], 6); part.texto(T.ganhos.recolheu(d, D), c[0], 1.6, c[1], VERDE); }
    atualizarChips();
    if (a) explicar(m, tutorial, 'levar', F.titulo.levar, F.levar(a, D));
  });
  for (const tipo of ['guardou', 'vendeuTudo', 'ganhouItem']) ev.ouvir(tipo, atualizarChips);

  // fim da vida produtiva: avisa antes (últimos 10%) e quando o bicho para; a escolha é no painel do abrigo, sem pressa
  ev.ouvir('fimDeVidaPerto', (d) => {
    const a = deProducao(d.animal);
    if (!a) return;
    if (!explicar(m, tutorial, 'fim-perto', F.titulo['fim-perto'], F['fim-perto'](a, D, d.restam)) && !voltando) avisar(T.ganhos.fimDeVidaPerto(d, D), '', 5000);
  });
  ev.ouvir('fimDeVida', (d) => {
    const a = deProducao(d.animal);
    if (!a) return;
    if (!explicar(m, tutorial, 'fim', F.titulo.fim, F.fim(a, D)) && !voltando) avisar(T.ganhos.fimDeVida(d, D), '', 6000);
  });
  ev.ouvir('vendeuAnimal', (d) => { avisar(T.ganhos.vendeuAnimal(d, D), 'bom', 4200); });
  ev.ouvir('aposentou', (d) => { const c = centro(d.entidade); if (c) part.brilho(c[0], 1.2, c[1], 10); avisar(T.ganhos.aposentou(d, D), 'bom', 4200); });

  // de volta depois de um tempo fora: o que os bichos fizeram e quem ficou sem trato (um aviso só)
  let voltando = false;
  ev.ouvir('relogioAcertado', (d) => {
    if (!(d.seg >= 60)) return;
    voltando = true;
    setTimeout(() => { voltando = false; }, 200);
    const porProduto = {}, semTrato = [];
    for (const a of m.animais.lista) { if (a.familia !== 'producao' || !(a.pronto > 0)) continue; porProduto[a.especie] = (porProduto[a.especie] || 0) + a.pronto; }
    for (const e of abrigosProntos(m)) { if (!quantosNoAbrigo(m, e.id)) continue; const f = faltaNoAbrigo(m, e); if (f.comida || f.agua) semTrato.push(`${D.construcoes[e.tipo].nome}`); }
    const prontos = Object.keys(porProduto).map((id) => T.animais.esperando(D.animais[id], D, porProduto[id]));
    const texto = T.animais.volta(prontos, semTrato);
    if (texto) avisar(texto, prontos.length ? 'bom' : '', 6500);
  });
});

// para as ferramentas de conferência
if (typeof window !== 'undefined') window.__bichos = bichosNoTerreno;
