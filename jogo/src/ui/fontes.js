// "Onde conseguir?": o jogador vê o material que falta e descobre de onde ele vem.
//   - fichaDeMaterial(m, item, precisa)  a ficha do custo (figura e "3/6"; a que falta fica vermelha, "falta 3", e o
//                                        toque nela abre o cartão). Usada nos painéis de construir, abrigo e indústria.
//   - botaoOndeConseguir(m, itens, k)    o botão "Onde conseguir?" (no lugar do Construir/Reformar/Ampliar apagado)
//   - abrirOndeConseguir(itens, opc)     o cartão: as fontes de cada material que falta (nucleo/fontes.js), em linhas
//                                        com um botão que leva até a fonte: a loja na aba certa, a seta do tutorial no
//                                        toco/pedra/mato mais perto ou no bicho, o painel da bancada, as missões...
// E mais, ligado aqui mesmo:
//   - o Seu Tonho ensina, uma vez por material (gravado em industria.dicas['fonte:<item>']), de onde ele vem: quando
//     a missão da vez pede um material que falta (depois de o jogador ler a missão) ou quando uma ação falha por falta;
//   - o prêmio que dá material diz para que ele serve: no aviso da missão cumprida e na tela de recompensa
//     (nível, presente do dia, convite, conquista);
//   - o cartão da missão da vez (painel Missões) mostra o material que a obra pede e o que falta.
import { el, icone, botao } from './dom.js';
import { T } from './textos.js';
import './textos/fontes.js';
import { J } from '../contexto.js';
import { abrirPainel, fecharPainel, painelAberto } from './paineis/registro.js';
import { perguntar, fecharDialogo } from './dialogo.js';
import { subidaAberta } from './subida.js';
import { avisar } from './avisos.js';
import { som } from '../plataforma/som.js';
import { aoInstalarMundo } from './ligacoes.js';
import { NOTAS_DA_RECOMPENSA } from './recompensa.js';
import { EXTRAS_DA_MISSAO } from './paineis/missoes.js';
import { mold } from './estilo/pecas.js';
import { registrarCamada } from '../render/cena.js';
import { TIPOS } from '../nucleo/registro.js';
import { quantoTem } from '../nucleo/sistemas/posses.js';
import { obstaculoPerto } from '../nucleo/sistemas/limpeza.js';
import { construcoesDe, estaPronta } from '../nucleo/sistemas/construcao.js';
import { animalPorId } from '../nucleo/sistemas/animais.js';
import { fontesDoItem, faltasDe, temFontes, comoConseguir, materialDaMissao, usosDoPremio, jaExplicou, dicaDoMaterial, materialParaExplicar } from '../nucleo/fontes.js';

const ESPERA_DA_MISSAO = 14; // segundos com a missão na tela antes de o Seu Tonho falar do material (a fala dela vem antes)
const RUMO_SEG = 45; // quanto tempo a seta fica no toco/pedra/bicho mostrado (some antes se ele sair do mapa)

// ---------- o que falta ----------
// os que faltam de { item: n } e que têm fonte nos dados (sem fonte, o cartão não teria o que dizer)
export const faltaComFonte = (m, itens) => faltasDe(m, itens).filter((f) => temFontes(m, f.item));
// o material da dica do Seu Tonho já foi explicado? (o mesmo lugar das dicas das indústrias: vai na gravação)
const viu = jaExplicou;
function marcar(m, item) { if (m.industria && !viu(m, item)) { m.comando({ tipo: 'viuDica', dica: dicaDoMaterial(item) }); if (J.gravarLogo) J.gravarLogo(); } }

// o elemento responde ao toque (e ao Enter) como botão, sem ser um: a ficha do custo continua pequena
export function tocavel(e, fazer) {
  e.classList.add('fonte-toque');
  e.setAttribute('role', 'button');
  e.tabIndex = 0;
  e.addEventListener('click', (ev) => { ev.stopPropagation(); som.tocar('toque'); fazer(); });
  e.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.stopPropagation(); fazer(); } });
}
// a ficha de um material do custo: figura e "tem/precisa"; faltando, vermelha com "falta N" (tocar abre o cartão)
export function fichaDeMaterial(m, item, precisa, classe = 'cons-ficha') {
  const tem = quantoTem(m, item), falta = Math.max(0, precisa - tem), f = el('span', classe + (falta ? ' falta' : ''));
  f.title = T.fontes.ficha(m.dados, item, tem, precisa);
  f.dataset.item = item;
  f.append(icone('icone/' + item, 18), el('span', '', falta ? T.fontes.falta(falta) : `${Math.min(tem, 999)}/${precisa}`));
  if (falta && temFontes(m, item)) tocavel(f, () => abrirOndeConseguir({ [item]: precisa }));
  return f;
}
// o botão "Onde conseguir?" para o custo { item: n } (k = o data-k do botão)
export function botaoOndeConseguir(m, itens, k) {
  const b = botao({ icone: 'ui/loja', tamanho: 24, texto: T.fontes.onde, classe: 'onde', aoClicar: () => { som.tocar('toque'); abrirOndeConseguir(itens); } });
  b.dataset.k = k;
  return b;
}

// ---------- o cartão ----------
const ICONE = { loja: () => 'ui/loja', limpar: (f) => 'objeto/' + f.obstaculo, receita: (f) => 'objeto/' + f.onde, bicho: (f) => `animal/${f.animal}/parada-frente`, premios: () => 'ui/presente' };
// cada fonte vira { titulo, info, botao: { texto, fazer } | null }
function linhaDaFonte(m, item, f) {
  const D = m.dados, F = T.fontes, agora = m.progresso.nivel, depois = f.nivel > agora ? f.nivel : 0;
  const ir = (fazer) => () => { fecharDialogo(); fazer(); };
  if (f.tipo === 'loja') {
    const aba = D.loja.abas.find((a) => a.id === f.aba);
    return { titulo: F.loja.titulo(aba ? aba.nome : ''), info: depois ? F.abre(depois) : F.loja.info(f.preco), botao: depois ? null : { texto: F.loja.botao, k: 'fonte-loja', fazer: ir(() => irParaLoja(f.aba, item)) } };
  }
  if (f.tipo === 'limpar') {
    let info, b = null;
    if (!f.temFerramenta) info = F.limpar.semFerramenta(D, f, depois);
    else if (f.restam > 0) { info = `${F.limpar.da(f, D, item)} · ${F.limpar.restam(f.restam)}`; b = { texto: F.limpar.botao, k: 'fonte-' + f.obstaculo, fazer: ir(() => mostrarObstaculo(f.obstaculo)) }; }
    else if (f.naTerraNova) { info = F.limpar.terraNova({ ...f.naTerraNova, nivel: f.naTerraNova.nivel > agora ? f.naTerraNova.nivel : 0 }); b = { texto: F.limpar.terras, k: 'fonte-terras', fazer: ir(() => abrirPainel('terras', { lote: f.naTerraNova.id })) }; }
    else info = F.limpar.acabou;
    return { titulo: F.limpar.titulo(f), info, botao: b };
  }
  if (f.tipo === 'receita') {
    if (f.temConstrucao && !depois) return { titulo: F.receita.titulo(D, f), info: F.receita.info(D, f, item), botao: { texto: F.receita.abrir, k: 'fonte-' + f.onde, fazer: ir(() => abrirIndustria(f.onde)) } };
    const pode = !depois && D.construcoes[f.onde] && D.construcoes[f.onde].nivel <= agora;
    return { titulo: F.receita.titulo(D, f), info: F.receita.construa(D, f, depois), botao: pode ? { texto: F.receita.construir, k: 'fonte-construir', fazer: ir(() => abrirPainel('construir', { id: f.onde })) } : null };
  }
  if (f.tipo === 'bicho') {
    if (f.temBicho) return { titulo: F.bicho.titulo(D, f), info: F.bicho.tem, botao: { texto: F.bicho.mostrar, k: 'fonte-bicho', fazer: ir(() => mostrarBicho(f.animal)) } };
    return { titulo: F.bicho.titulo(D, f), info: F.bicho.adote(D, f, depois), botao: depois ? null : { texto: F.bicho.adotar, k: 'fonte-adotar', fazer: ir(() => abrirPainel('animais')) } };
  }
  // os prêmios: o que vem primeiro de cada tipo
  const partes = [];
  if (f.missao) partes.push(F.premios.missao(f.missao, agora));
  if (f.nivelDoPremio) partes.push(F.premios.nivel(f.nivelDoPremio));
  if (f.dia) partes.push(F.premios.dia(f.dia));
  const b = f.missao ? { texto: F.premios.missoes, k: 'fonte-missoes', fazer: ir(() => abrirPainel('missoes')) } : f.dia && f.dia.hoje ? { texto: F.premios.abrir, k: 'fonte-presente', fazer: ir(() => abrirPainel('presentes')) } : null;
  return { titulo: F.premios.titulo, info: partes, botao: b }; // uma linha por prêmio
}

// abre o cartão para o custo { item: n } (só os que faltam e têm fonte); opc.item = o material que vem aberto
export function abrirOndeConseguir(itens, opc = {}) {
  const m = J.mundo;
  if (!m) return false;
  const faltas = faltaComFonte(m, itens);
  if (!faltas.length) return false;
  let atual = (opc.item && faltas.some((f) => f.item === opc.item) ? opc.item : faltas[0].item);
  const corpo = el('div', 'fontes-corpo');
  function desenhar() {
    const D = m.dados, x = faltas.find((f) => f.item === atual);
    corpo.textContent = '';
    // vários materiais faltando: uma ficha para cada (a acesa é a que está aberta embaixo)
    if (faltas.length > 1) {
      const chips = el('div', 'fontes-chips');
      for (const f of faltas) {
        const b = botao({ icone: 'icone/' + f.item, tamanho: 26, texto: T.fontes.falta(f.falta), classe: 'chip-fonte' + (f.item === atual ? ' ativo' : ''), rotulo: T.fontes.ficha(D, f.item, f.tem, f.precisa), aoClicar: () => { if (atual === f.item) return; atual = f.item; som.tocar('toque'); desenhar(); const n = corpo.querySelector(`[data-k="chip-${f.item}"]`); if (n) n.focus({ preventScroll: true }); } });
        b.dataset.k = 'chip-' + f.item;
        chips.append(b);
      }
      corpo.append(chips);
    }
    const topo = el('div', 'fontes-topo'), txt = el('div');
    txt.append(el('b', '', D.itens[atual].nome), el('span', '', T.fontes.temEFalta(x.tem, x.falta)));
    topo.append(icone('icone/' + atual, 40), txt);
    corpo.append(topo);
    const lista = el('div', 'fontes-lista');
    for (const f of fontesDoItem(m, atual)) {
      if (f.tipo === 'premios' && !f.ok) continue;
      const l = linhaDaFonte(m, atual, f), linha = el('div', 'fonte' + (f.ok ? ' agora' : ' depois')), meio = el('div', 'fonte-meio');
      linha.dataset.fonte = f.tipo + (f.obstaculo ? '-' + f.obstaculo : '');
      meio.append(el('b', '', l.titulo), ...[].concat(l.info).map((t) => el('span', '', t)));
      const ic = icone(ICONE[f.tipo](f), 38);
      linha.append(ic, meio);
      if (l.botao) { const b = botao({ texto: l.botao.texto, classe: f.ok ? 'verde' : '', aoClicar: () => { som.tocar('toque'); l.botao.fazer(); } }); b.dataset.k = l.botao.k; linha.append(b); }
      else if (f.nivel > m.progresso.nivel) linha.append(icone('ui/cadeado', 26));
      lista.append(linha);
    }
    corpo.append(lista);
  }
  desenhar();
  perguntar({ titulo: T.fontes.titulo(m.dados, faltas.length > 1 ? null : atual), conteudo: corpo, classe: 'fontes', nao: T.fontes.fechar, foco: '.fonte.agora .bt, .fonte .bt' });
  // quem abriu o cartão já viu de onde vem: o Seu Tonho não repete
  for (const f of faltas) marcar(m, f.item);
  return true;
}

// ---------- levar até a fonte ----------
let alvoDaLoja = null; // { item, resta } a oferta da loja que pisca um pouco depois de aberta
function irParaLoja(aba, item) {
  abrirPainel('loja', { aba, item });
  alvoDaLoja = { item, resta: 3, rolou: false };
}
function abrirIndustria(tipo) {
  const m = J.mundo, p = m.personagem;
  const lista = construcoesDe(m, tipo).filter((e) => estaPronta(e));
  if (!lista.length) { abrirPainel('construir', { id: tipo }); return; }
  lista.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z));
  abrirPainel('industria', { entidade: lista[0].id });
}
// a seta do tutorial passa a apontar o alvo por uns segundos; a câmera vai até ele se estiver fora da tela
let rumo = null; // { mundo, id, resta, pan }
function apontar(m, e) {
  if (painelAberto()) fecharPainel();
  rumo = { mundo: m, id: e.id, resta: RUMO_SEG, pan: 0 };
  const cam = J.cena && J.cena.cam;
  if (cam) {
    const x = cam.cssX(e.x + e.l / 2, e.z + e.p / 2), y = cam.cssY(e.x + e.l / 2, 1, e.z + e.p / 2), mg = 60;
    if (x < mg || y < mg || x > cam.w - mg || y > cam.h - mg) { cam.seguindo = false; rumo.pan = 1.6; }
  }
}
function mostrarObstaculo(tipo) {
  const m = J.mundo;
  if (m.personagem.local !== 'fazenda') { avisar(T.fontes.saiaDoCeleiro); return; }
  const e = obstaculoPerto(m, [tipo]);
  if (!e) { avisar(T.fontes.semAlvo); return; }
  apontar(m, e);
}
function mostrarBicho(especie) {
  const m = J.mundo;
  if (m.personagem.local !== 'fazenda') { avisar(T.fontes.saiaDoCeleiro); return; }
  const e = m.locais.fazenda.entidades.find((x) => x.tipo === 'bicho' && x.familia === 'estimacao' && (animalPorId(m, x.animal) || {}).especie === especie);
  if (!e) { avisar(T.fontes.semAlvo); return; }
  apontar(m, e);
}

// ---------- o Seu Tonho ensina ----------
let ctxAtual = null, relogioTonho = 0, missaoVista = null, desde = 0;
function ensinar(m, item) {
  const ctx = ctxAtual;
  if (!ctx || !ctx.tutorial || ctx.mundo !== m || !temFontes(m, item) || viu(m, item)) return false;
  const D = m.dados, fala = comoConseguir(m, item) || T.fontes.falaPadrao(D, item, fontesDoItem(m, item).filter((f) => f.ok).map((f) => linhaDaFonte(m, item, f).titulo));
  ctx.tutorial.dizer(T.fontes.tonho(D, item), fala, 12);
  marcar(m, item);
  return true;
}
// uma vez por segundo: a missão da vez pede material que falta? (depois de ela ficar uns segundos de jogo na tela:
// o relógio é o do mundo, que no modo de teste só anda quando a ferramenta manda)
function conferirMissao(m) {
  const ctx = ctxAtual;
  if (!ctx || ctx.mundo !== m || !ctx.tutorial) return;
  const a = materialDaMissao(m), id = m.missoes && m.missoes.feitas.length;
  if (id !== missaoVista) { missaoVista = id; desde = m.agora; }
  if (!a || m.agora - desde < ESPERA_DA_MISSAO * 1000 || painelAberto() || subidaAberta() || ctx.tutorial.falando()) return;
  const item = materialParaExplicar(m, a.itens);
  if (item) ensinar(m, item);
}

// ---------- para que o material ganho serve ----------
// { item: n } → "+10 pregos: servem para o estábulo e o galinheiro" (só os materiais; null se não há o que dizer)
export function notaDeUso(m, itens) {
  const u = usosDoPremio(m, itens, 2);
  return u ? T.fontes.nota(m.dados, u.mats, u.usos) : null;
}
NOTAS_DA_RECOMPENSA.push((d) => (d.tipo !== 'missao' && J.mundo && d.recompensa ? notaDeUso(J.mundo, d.recompensa.itens) : null));

// ---------- o cartão da missão da vez: o material da obra ----------
EXTRAS_DA_MISSAO.push((m) => {
  const a = materialDaMissao(m);
  if (!a) return null;
  const caixa = el('div', 'fontes-missao'), custo = el('div', 'cons-custo');
  for (const k in a.itens) custo.append(fichaDeMaterial(m, k, a.itens[k]));
  caixa.append(el('div', 'secao', T.fontes.pede), custo);
  if (faltaComFonte(m, a.itens).length) caixa.append(botaoOndeConseguir(m, a.itens, 'onde-missao'));
  return caixa;
});

// ---------- a seta, a oferta da loja e o relógio do Seu Tonho andam com o desenho ----------
registrarCamada('cima', (g, cam, m, S, cena, dt) => {
  if ((relogioTonho += dt) >= 1) { relogioTonho = 0; conferirMissao(m); }
  if (alvoDaLoja) {
    alvoDaLoja.resta -= dt;
    const o = document.querySelector(`#ui .veu .oferta[data-item="${alvoDaLoja.item}"]`);
    if (o) {
      if (!o.classList.contains('fonte-alvo')) o.classList.add('fonte-alvo');
      if (!alvoDaLoja.rolou) { alvoDaLoja.rolou = true; try { o.scrollIntoView({ block: 'nearest' }); } catch { /* sem rolar */ } }
    }
    if (alvoDaLoja.resta <= 0 || painelAberto() !== 'loja') { if (o) o.classList.remove('fonte-alvo'); alvoDaLoja = null; }
  }
  if (!rumo) return;
  const e = rumo.mundo === m && m.local === m.locais.fazenda ? m.local.porId[rumo.id] : null;
  if (!e || (rumo.resta -= dt) <= 0) { rumo = null; cena.seta.ligada = false; return; }
  const x = e.x + e.l / 2, z = e.z + e.p / 2;
  cena.seta.ligada = true; cena.seta.x = x; cena.seta.z = z; cena.seta.casas = null;
  cena.seta.alto = (TIPOS[e.tipo] && TIPOS[e.tipo].altura) || 1.6 + Math.min(e.l, e.p) * 0.5;
  if (rumo.pan > 0 && !cam.seguindo && !cam.fixa) { // (a câmera presa, como ao escolher lugar, fica onde está)
    rumo.pan -= dt;
    const k = 1 - Math.exp(-dt * 4);
    cam.x += (x - cam.x) * k; cam.z += (z - cam.z) * k; cam.prender();
  } else rumo.pan = 0;
});

// ---------- ligado a cada mundo ----------
aoInstalarMundo((m, ctx) => {
  ctxAtual = { mundo: m, tutorial: ctx.tutorial };
  rumo = null; alvoDaLoja = null; missaoVista = null; desde = 0;
  const ev = m.eventos;
  // faltou material numa ação (montar, reformar, ampliar...): o Seu Tonho explica de onde vem, se ainda não explicou
  ev.ouvir('faltou', (d) => { if (d && d.dados && (d.motivo === 'falta-material' || d.motivo === 'falta-ingrediente') && d.dados.item) ensinar(m, d.dados.item); });
  // a missão que dá material diz para que ele serve
  ev.ouvir('missaoConcluida', (d) => { const t = notaDeUso(m, d.recompensa && d.recompensa.itens); if (t) avisar(t, 'bom', 5200); });
  // o bicho mostrado foi afagado: a seta já cumpriu o papel
  ev.ouvir('afagou', (d) => { if (rumo && d && d.entidade === rumo.id) { rumo = null; if (J.cena) J.cena.seta.ligada = false; } });
});

// ---------- a aparência (no visual aprovado: as molduras de estilo/pecas.js) ----------
const CSS = `
#ui .fonte-toque{cursor:pointer;border-radius:8px}
#ui .fonte-toque.falta>span{text-decoration:underline dotted;text-underline-offset:3px}
#ui .fonte-toque:focus-visible{outline:3px solid #f6c12c;outline-offset:1px}
#ui .ind-ficha.fonte-toque{cursor:pointer}
#ui .veu .bt.onde{gap:4px;padding:0 10px;white-space:nowrap;flex:none;margin-left:auto}
#ui .veu .bt.onde>canvas.ic{width:24px!important;height:24px!important}
#ui .fontes-missao{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;margin:6px 0 2px}
#ui .fontes-missao .secao{flex:1 0 100%}
#ui .fontes-missao .bt.onde{margin-left:auto}
#ui .veu .oferta.fonte-alvo{animation:fonte-pisca .9s ease-in-out 3;outline:4px solid #f6c12c;outline-offset:-2px;border-radius:14px}
@keyframes fonte-pisca{50%{outline-color:#fff4c2}}
#ui .subida.fontes .cartao{width:min(520px,96%);max-height:calc(100% - 12px);overflow:hidden auto;padding:2px 12px 10px;text-align:left;align-items:stretch}
#ui .subida.fontes .faixa{text-align:center;justify-content:center}
#ui .fontes-corpo{display:flex;flex-direction:column;gap:6px;width:100%}
#ui .fontes-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
#ui .subida .bt.chip-fonte{min-height:44px;padding:0 10px 0 4px;gap:4px;font-size:16px;color:#c0392b}
#ui .subida .bt.chip-fonte.ativo{color:#fff}
#ui .fontes-topo{display:flex;align-items:center;gap:8px;padding:0 4px}
#ui .fontes-topo b{display:block;font-size:19px;font-weight:900}
#ui .fontes-topo span{display:block;font-size:15px;font-weight:700;color:#c0392b}
#ui .fontes-lista{display:flex;flex-direction:column;gap:5px}
#ui .fonte{${mold('cartao-item-normal', '21px 20px 20px 20px')}border-width:5px;border-radius:12px;display:flex;align-items:center;gap:8px;min-height:52px;padding:7px 6px 7px 2px}
#ui .fonte.depois{${mold('cartao-item-travado', '21px 20px 20px 20px')}border-width:5px}
#ui .fonte.depois .fonte-meio{opacity:.8}
#ui .fonte>canvas.ic{flex:none}
#ui .fonte-meio{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.15}
#ui .fonte-meio b{font-size:16px;font-weight:900}
#ui .fonte-meio span{font-size:14px;font-weight:700;color:#8a5a2b}
#ui .fonte .bt{flex:none;min-width:96px;min-height:44px;padding:0 10px;font-size:16px}
#ui .subida.fontes .linha{justify-content:center;margin-top:4px}
#ui .recompensa .para-que-serve{font-size:15px;font-weight:800;color:#2f6b1e;margin:2px 6px 0;max-width:420px}
@media (max-height:430px){
  #ui .fonte{min-height:48px}
  #ui .fontes-topo>canvas.ic{width:32px!important;height:32px!important}
  #ui .fontes-topo b{font-size:17px;display:inline;margin-right:8px}
  #ui .fontes-topo span{display:inline}
  #ui .fonte>canvas.ic{width:32px!important;height:32px!important}
}
`;
if (typeof document !== 'undefined' && !document.getElementById('estilo-fontes')) {
  const s = document.createElement('style');
  s.id = 'estilo-fontes';
  s.textContent = CSS;
  document.head.append(s);
}
