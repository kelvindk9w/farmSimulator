// O retorno da frente de progresso na interface: a caixa de correio e o ponto de "tem prêmio" no HUD, as telas de
// recompensa (conquista, presente do dia, convite, missão com prêmio grande, compra de teste), os avisos, a roupa
// da personagem, o fuso do aparelho e o convite que veio no endereço. Tudo se liga a cada mundo instalado
// (ui/ligacoes.js); nada daqui mexe em main.js.
import defAtlas from 'virtual:atlas';
import './textos/progresso.js';
import { aoInstalarMundo } from './ligacoes.js';
import { el, botao, classe } from './dom.js';
import { T, frase } from './textos.js';
import { J } from '../contexto.js';
import { avisar } from './avisos.js';
import { som } from '../plataforma/som.js';
import { abrirPainel, sujarPainel } from './paineis/registro.js';
import { ABAS_DE_FORA } from './paineis/loja.js';
import { mostrarRecompensa, recompensaAberta, recompensasNaFila } from './recompensa.js';
import { dialogoAberto } from './dialogo.js';
import { atualizarBotoesDeConcluir } from './concluir.js';
import { resolver } from '../nucleo/premios.js';
import { CONCLUIVEIS } from '../nucleo/concluir.js';
import { conquistasProntas, listaDeConquistas } from '../nucleo/sistemas/conquistas.js';
import { estadoDaDiaria } from '../nucleo/sistemas/diaria.js';
import { estadoDosAmigos } from '../nucleo/sistemas/amigos.js';
import { noCorreio, quantosNoCorreio } from '../nucleo/sistemas/correio.js';
import { lojaDeCash } from '../nucleo/sistemas/cash.js';
import { guardaRoupa, temCosmetico, PARTES } from '../nucleo/sistemas/roupas.js';
import { vestirNoAtlas, chaveDasRoupas } from '../render/roupas.js';
import { conviteDoEndereco } from '../plataforma/foto.js';

// ---------- arte: a peça pedida pelo nome do catálogo; enquanto ela não existe, uma parecida que já existe ----------
const naArte = (chave) => !!(defAtlas && defAtlas.pecas && defAtlas.pecas[chave]);
export const chaveOu = (chave, ...reservas) => { for (const k of [chave, ...reservas]) if (naArte(k)) return k; return chave; };
export const ICONE = {
  fazenda: chaveOu('ui/fazenda', 'ui/trofeu'), correio: chaveOu('ui/correio', 'ui/presente'), conquistas: 'ui/trofeu', presentes: 'ui/presente',
  amigos: chaveOu('ui/amigos', 'icone/convite'), roupas: chaveOu('ui/guarda-roupa', 'icone/camisa-xadrez'), cash: 'icone/cash',
  caderno: chaveOu('ui/caderno', 'ui/missoes'), voltar: chaveOu('ui/voltar', 'ui/seta'), foto: chaveOu('ui/foto', 'ui/compartilhar'),
};

// o que a conquista pede, em frase ("Colha 50 produtos")
export function metaDaConquista(id, alvo) { const f = T.conquistas.meta[id]; return f ? f(alvo) : T.conquistas.evento(alvo); }

// o botão de voltar no cabeçalho de um painel que se abre por dentro de outro (padrão: "Minha fazenda")
export function porVoltar(corpo, arg) {
  const cab = corpo.parentNode && corpo.parentNode.querySelector('header');
  if (!cab) return;
  const b = botao({ icone: ICONE.voltar, tamanho: 24, classe: 'quadrado voltar' + (ICONE.voltar === 'ui/seta' ? ' de-seta' : ''), rotulo: T.fazenda.voltar, aoClicar: () => { som.tocar('toque'); abrirPainel((arg && arg.de) || 'fazenda'); } });
  b.dataset.k = 'voltar';
  cab.prepend(b);
}
// comando que pode falhar: o motivo vira aviso
export function mandar(c) {
  const r = J.mundo.comando(c);
  if (!r.ok) { som.tocar('erro'); const t = frase(r.motivo, r.dados, J.dados); if (t) avisar(t); }
  return r;
}

// na loja de ouro, duas abas que levam ao guarda-roupa e à loja de cash
ABAS_DE_FORA.push({ id: 'roupas', nome: T.roupas.aba, painel: 'guarda-roupa', arg: { de: 'loja' } }, { id: 'cash', nome: T.cash.aba, painel: 'cash', arg: { de: 'loja' } });

// ---------- a roupa da personagem ----------
let roupaPosta = false;
// (a posse é conferida aqui: uma gravação mexida não veste o que não tem)
export function roupaDeAgora(m) {
  const v = {};
  for (const p of PARTES) { const id = m.roupas.vestindo[p]; v[p] = id && temCosmetico(m, id) ? id : null; }
  return v;
}

// ---------- um relógio de teste, para a ferramenta de verificação concluir com cash sem depender de obra nenhuma ----------
const teste = { tipo: null, ate: 0 };
const ALVO_DE_TESTE = { teste: true };
function relogioDeTeste(seg) {
  const m = J.mundo, vale = (m.dados.bruto.regras && m.dados.bruto.regras.concluir && m.dados.bruto.regras.concluir.vale) || [];
  if (!teste.tipo) {
    const tipo = vale[0] || 'obra', antigo = CONCLUIVEIS[tipo];
    // o tipo continua servindo a quem o registrou; só o alvo de teste cai aqui
    CONCLUIVEIS[tipo] = {
      tipo,
      falta: (mm, alvo) => (alvo && alvo.teste ? Math.max(0, (teste.ate - mm.agora) / 1000) : antigo ? antigo.falta(mm, alvo) : 0),
      terminar: (mm, alvo) => { if (alvo && alvo.teste) teste.ate = 0; else if (antigo) antigo.terminar(mm, alvo); },
      nome: (mm, alvo) => (alvo && alvo.teste ? T.concluir.teste : antigo ? antigo.nome(mm, alvo) : ''),
    };
    teste.tipo = tipo;
  }
  teste.ate = m.agora + seg * 1000;
  sujarPainel();
  return { tipo: teste.tipo, alvo: ALVO_DE_TESTE };
}
// para o painel da loja de cash: há um relógio de teste andando?
export const relogioEmTeste = () => (teste.tipo && teste.ate > 0 ? { tipo: teste.tipo, alvo: ALVO_DE_TESTE } : null);

// ---------- no HUD: a caixa de correio (só aparece com presente dentro) e o ponto no botão "Minha fazenda" ----------
let caixa = null, pontoFazenda = null, sujo = true, quadros = 0;
function abrirCorreio() { som.tocar('toque'); mandar({ tipo: 'abrirCorreio' }); }
function prepararHud(hud) {
  if (!hud || hud._progresso) return;
  hud._progresso = true;
  const dir = hud.raiz.querySelector('.topo-dir');
  if (dir) {
    caixa = botao({ icone: ICONE.correio, tamanho: 30, classe: 'quadrado correio', rotulo: T.botoes.correio, aoClicar: abrirCorreio });
    caixa.dataset.k = 'correio';
    caixa.append(el('span', 'ponto'));
    caixa.hidden = true;
    dir.prepend(caixa);
  }
  const b = hud.paineis.fazenda;
  if (b) { pontoFazenda = el('span', 'ponto'); pontoFazenda.hidden = true; b.append(pontoFazenda); }
  // todo quadro, junto com o HUD
  const antes = hud.atualizar;
  hud.atualizar = function () { antes.call(hud); quadro(); };
}

const GANCHOS = {
  recompensaAberta, recompensasNaFila, dialogoAberto, relogioDeTeste,
  correio: () => noCorreio(J.mundo), conquistas: () => listaDeConquistas(J.mundo), diaria: () => estadoDaDiaria(J.mundo), amigos: () => estadoDosAmigos(J.mundo),
  cash: () => lojaDeCash(J.mundo), roupas: () => guardaRoupa(J.mundo), vestida: () => (roupaPosta ? chaveDasRoupas(roupaDeAgora(J.mundo)) : null),
};

function quadro() {
  const m = J.mundo;
  if (!m) return;
  if (!roupaPosta) roupaPosta = vestirNoAtlas(J.atlas, roupaDeAgora(m));
  atualizarBotoesDeConcluir();
  // o correio e o ponto: confere quando algo aconteceu, e de tempos em tempos (o dia vira sem evento nenhum)
  if (sujo || ++quadros >= 30) {
    sujo = false; quadros = 0;
    const nCorreio = quantosNoCorreio(m), espera = nCorreio + conquistasProntas(m);
    if (caixa && caixa.hidden !== !nCorreio) { caixa.hidden = !nCorreio; if (nCorreio) { caixa.classList.remove('chegou'); void caixa.offsetWidth; caixa.classList.add('chegou'); } }
    if (pontoFazenda && pontoFazenda.hidden !== !espera) pontoFazenda.hidden = !espera;
    if (pontoFazenda) classe(pontoFazenda.parentNode, 'tem-premio', espera > 0);
  }
  if (window.__jogo && !window.__jogo.progresso) window.__jogo.progresso = GANCHOS; // ganchos das ferramentas de verificação
}

const GRAVA_LOGO = { conquista: 1, recompensa: 1, comprouCash: 1, comprouComCash: 1, concluiu: 1, vestiu: 1, nomeouFazenda: 1, conviteAceito: 1, amigoChegou: 1, compartilhou: 1 };
const PREMIO_GRANDE = { ferramenta: 1, recipiente: 1, cosmetico: 1 };

aoInstalarMundo((m, ctx) => {
  const ev = m.eventos, D = m.dados;
  prepararHud(ctx && ctx.hud);
  roupaPosta = false; sujo = true;

  // o dia do presente sai do relógio do mundo mais o fuso do aparelho
  m.comando({ tipo: 'fuso', minutos: -new Date().getTimezoneOffset() });
  // o jogo foi aberto por um convite: a fazenda nova ganha o presente de boas-vindas (espera na caixa de correio)
  const codigo = conviteDoEndereco();
  if (codigo && m.comando({ tipo: 'usarConvite', codigo }).ok) J.gravarLogo();

  ev.ouvir('*', (d, tipo) => { sujo = true; if (GRAVA_LOGO[tipo]) J.gravarLogo(); });
  ev.ouvir('vestiu', () => { roupaPosta = false; });
  ev.ouvir('carregou', () => { roupaPosta = false; });

  const restam = () => { const n = quantosNoCorreio(m); return n > 0 ? T.recompensa.faltam(n) : ''; };
  ev.ouvir('conquistaPronta', (d) => avisar(T.conquistas.pronta(d), 'bom', 4200));
  ev.ouvir('conquista', (d) => mostrarRecompensa({ tipo: 'conquista', icone: ICONE.conquistas, titulo: d.nome, sub: metaDaConquista(d.id, d.alvo), recompensa: d.recompensa }));
  ev.ouvir('recompensa', (d) => {
    if (d.classe === 'diaria') mostrarRecompensa({ tipo: 'presente', icone: ICONE.presentes, titulo: T.recompensa.dia(d.dia), recompensa: d.recompensa, rodape: restam() });
    else if (d.classe === 'convidado') mostrarRecompensa({ tipo: 'convite', icone: ICONE.amigos, sub: T.recompensa.convite, recompensa: d.recompensa, rodape: restam() });
    else if (d.classe === 'amigo') mostrarRecompensa({ tipo: 'amigo', icone: ICONE.amigos, sub: T.recompensa.amigo(estadoDosAmigos(m).nivel), recompensa: d.recompensa, rodape: restam() });
  });
  ev.ouvir('comprouCash', (d) => mostrarRecompensa({ tipo: 'compra', icone: ICONE.cash, titulo: d.nome, sub: T.recompensa.compra, recompensa: { cash: d.cash } }));
  // missão com prêmio grande (ferramenta, recipiente, roupa ou cash): a tela inteira; as outras ficam no aviso de sempre
  ev.ouvir('missaoConcluida', (d) => {
    const r = d.recompensa || {};
    let grande = r.cash > 0 || (!!r.animais && Object.keys(r.animais).length > 0); // bicho de presente também
    for (const k in r.itens || {}) if (D.itens[k] && PREMIO_GRANDE[D.itens[k].tipo]) grande = true;
    if (grande) mostrarRecompensa({ tipo: 'missao', icone: 'ui/missoes', titulo: d.titulo, recompensa: resolver(m, r) });
  });
  ev.ouvir('amigoChegou', () => avisar(T.amigos.chegou, 'bom', 4200));
  ev.ouvir('comprouComCash', (d) => { som.tocar('compra'); avisar(T.cash.comprou(d), 'bom'); });
  ev.ouvir('concluiu', (d) => { som.tocar('pronto'); avisar(T.concluir.concluiu(d), 'bom'); });
});
