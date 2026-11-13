// As ações por toque: o jogador toca no que quer e a personagem faz a ação natural daquele alvo, com a ferramenta
// certa, sem escolher modo. A regra mora aqui; a interface só desenha (o balãozinho, a roda, a vaga "na mão").
//   mato, toco, pedra → limpar | campo sem sulco → arar (com o boi, se ela tem: a fileira numa passada)
//   grama encostada no campo → arar (o campo cresce) | terra arada → plantar o que está na mão
//   planta com sede → regar | planta pronta → colher | bicho → o que ele mais precisa | árvore com fruta → colher
//   construção → abrir o painel dela (ou a ação que ela tem: vender na banca, guardar no celeiro...)
// Os modos da barra (personagem.js, lavoura.js...) continuam existindo por dentro: o arrastar e o segurar usam o modo
// da ação da primeira casa (arar, plantar ou regar a fileira; nunca colher, limpar nem abrir por acidente), e o
// jogador automático (tools/bot) ainda escolhe modos. O contrato está em docs/jogo/ARQUITETURA.md, "Ações por toque".
import { registrarSistema, TIPOS, MODOS } from '../registro.js';
import { GRAMA, ARADA, CAMPO, deLavoura } from '../local.js';
import { enfileirar, filaTem, alvoDaFrente } from './personagem.js';
import { resolver, itemNaMao, itensParaAMao, plantavel, sementesLivres, PLANTIOS, fileiraDe, podeSegurar } from './lavoura.js';
import { ferramentaNoCinto, ferramentaGuardada } from './posses.js';
import { estaPronta } from './construcao.js';
import { faltaNoAbrigo, podeEncherCocho, podeEncherBebedouro, comidaDoAbrigo, defDoAnimal } from './animais.js';
import { acaoDeRecolher, podeRecolher } from './producao.js';
import { ehIndustria } from './industria.js';

const NA_FILA = { acao: null, texto: 'na-fila' };
const naFilaNa = (m, acao, entidade) => { const p = m.personagem, s = (t) => t && t.tipo === 'agir' && t.acao === acao && t.entidade === entidade; return s(p.tarefa) || p.fila.some(s); };
const temFerramenta = (m, funcao) => !!(ferramentaNoCinto(m, funcao) || ferramentaGuardada(m, funcao));
const ehMuda = (m, item) => !!item && !m.dados.culturaDaSemente[item];

// Outras frentes acrescentam ações a um alvo sem editar este arquivo (a poda da árvore, quando existir):
//   OUTRAS_ACOES.push((mundo, entidade, lista) → void): põe opções na lista (a principal é a primeira)
export const OUTRAS_ACOES = [];

// ---------- a casa ----------
// há campo de plantação neste local? (sem campo nenhum, a primeira casa arada começa um; a conta vale por passo)
const semCampo = new WeakMap();
function temCampo(m, loc) {
  const c = semCampo.get(loc);
  if (c && c.n === m.n) return c.tem;
  let tem = false;
  for (let i = 0; i < loc.chao.length && !tem; i++) tem = deLavoura(loc.chao[i]);
  semCampo.set(loc, { n: m.n, tem });
  return tem;
}
const VIZINHAS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
// a grama (x, z) vira campo com um toque? A que encosta no campo (o campo cresce); sem campo nenhum, qualquer uma
function gramaQueAra(m, loc, x, z) {
  if (!temCampo(m, loc)) return true;
  for (const [dx, dz] of VIZINHAS) if (deLavoura(loc.chaoEm(x + dx, z + dz))) return true;
  return false;
}
// arar: com o boi pronto (no terreiro), quem ara é ele, a fileira numa passada; senão a enxada, casa por casa
function arar(m, x, z, c) {
  const A = MODOS.arado;
  if (A && m.personagem.local === 'fazenda' && (!A.disponivel || A.disponivel(m))) {
    const d = A.acaoNaCasa(m, x, z, c);
    if (d && (d.acao || d.texto === 'na-fila')) return { ...d, modo: 'arado' };
  }
  if (!temFerramenta(m, 'enxada')) return { acao: null, texto: 'sem-ferramenta', dados: { funcao: 'enxada' }, falta: true };
  const d = MODOS.enxada.acaoNaCasa(m, x, z);
  return d && { ...d, modo: 'enxada' };
}
// plantar na terra arada o que está na mão (s); sem semente, a falta diz para comprar
function semear(m, x, z, s) {
  if (filaTem(m, 'semear', x, z)) return NA_FILA;
  if (!s) return { acao: null, texto: 'sem-sementes-na-mao', falta: true };
  if (sementesLivres(m, s) <= 0) return { acao: null, texto: 'sem-sementes', dados: { item: s }, falta: true };
  return { acao: 'semear', args: { semente: s }, dados: { item: s }, item: s, modo: 'semear', arrasta: true };
}

// O que o toque na casa livre (x, z) faz, sem fazer nada: como o acaoNaCasa de um modo ({ acao, args, texto, dados,
// falta, info, casas }), mais "modo" (o modo interno que o segurar repete na fileira), "arrasta" (arrastar o dedo a
// partir daqui repete a ação: só do campo e das plantas; da grama, o arrasto anda) e "item" (a semente usada).
// null = nada a fazer (o toque só anda até lá). c = o comando do toque (o boi quer saber se o dedo está pintando).
export function acaoNaturalNaCasa(m, x, z, c) {
  const loc = m.local;
  if (!loc.dentro(x, z) || !loc.ehPropria(x, z) || loc.entidadeEm(x, z)) return null;
  const i = z * loc.l + x;
  resolver(m, loc, i);
  if (loc.plantas[i]) { // a planta: colher a pronta, regar a com sede; crescendo, só informa
    const d = MODOS.mao.acaoNaCasa(m, x, z);
    if (d && d.acao === 'regar' && !temFerramenta(m, 'regador')) return { acao: null, texto: 'sem-ferramenta', dados: { funcao: 'regador' }, falta: true };
    if (d && d.acao === 'regar') return { ...d, modo: 'regar', arrasta: true };
    // colher: segurar colhe a fileira (o modo "mão" dela); arrastar o dedo nunca colhe (sem "arrasta": o arrasto anda)
    return d && d.acao === 'colher' ? { ...d, modo: 'mao' } : d;
  }
  const chao = loc.chao[i], item = itemNaMao(m), muda = ehMuda(m, item);
  if (chao === ARADA || filaTem(m, 'arar', x, z)) { // (a casa que a enxada vai arar já aceita a semente)
    // a muda vai na grama: no campo, só sementes
    return muda ? { acao: null, texto: 'muda-na-grama', info: true, dados: { item } } : semear(m, x, z, item);
  }
  if (chao === CAMPO) { const a = arar(m, x, z, c); return a && a.modo ? { ...a, arrasta: true } : a; }
  if (chao !== GRAMA) return null;
  if (muda) { // a muda escolhida na mão: planta na grama tocada
    const p = PLANTIOS.find((k) => k.serve(m.dados, item));
    return p ? { ...p.acaoNaCasa(m, x, z, item), item } : null;
  }
  return gramaQueAra(m, loc, x, z) ? arar(m, x, z, c) : null;
}

// ---------- a entidade ----------
// a resposta de um acaoPossivel (ou de acaoNaturalNaCasa) vira uma opção da lista
function opcao(d) {
  const o = { id: d.acao || (d.painel ? 'abrir' : 'info'), ok: !!(d.acao || d.painel), ...d };
  return o;
}
const ehAbrigo = (m, e) => { const d = m.dados.construcoes[e.tipo]; return !!d && d.tipo === 'abrigo' && estaPronta(e) && !!m.animais && !!m.animais.abrigos[e.id]; };
// o abrigo: recolher o que está pronto, dar ração, dar água e abrir o painel. A principal é o que os bichos mais
// precisam: comida ou água que falta; depois, o que está pronto para recolher; sem nada disso, abrir o painel.
function acoesDoAbrigo(m, e) {
  const falta = faltaNoAbrigo(m, e), out = [];
  let come = false, bebe = false; // alguém ali come, alguém bebe (no abrigo vazio, o trato não aparece)
  for (const x of m.animais.lista) { if (x.abrigo !== e.id) continue; const dx = defDoAnimal(m, x); if (dx && dx.cicloSeg > 0) { come = come || dx.porcoes > 0; bebe = bebe || dx.bebe > 0; } }
  let recolher = null, racao = null, agua = null;
  const a = m.animais.lista.find((x) => x.abrigo === e.id && x.pronto > 0);
  const d = a && defDoAnimal(m, a);
  if (d && d.produto) {
    const acao = acaoDeRecolher(d), r = podeRecolher(m, d);
    if (r.ok && !naFilaNa(m, acao, e.id)) recolher = { id: acao, acao, ok: true, comando: { tipo: 'recolher', entidade: e.id }, dados: { animal: d.id, item: d.produto, construcao: e.tipo } };
  }
  if (come && podeEncherCocho(m, e).ok && !naFilaNa(m, 'abastecerCocho', e.id)) racao = { id: 'abastecerCocho', acao: 'abastecerCocho', ok: true, comando: { tipo: 'encherCocho', entidade: e.id }, item: comidaDoAbrigo(m, e), dados: { construcao: e.tipo } };
  if (bebe && podeEncherBebedouro(m, e).ok && !naFilaNa(m, 'abastecerBebedouro', e.id)) agua = { id: 'abastecerBebedouro', acao: 'abastecerBebedouro', ok: true, comando: { tipo: 'encherBebedouro', entidade: e.id }, dados: { construcao: e.tipo } };
  const abrir = { id: 'abrir', ok: true, painel: 'abrigo', arg: { entidade: e.id }, texto: 'ver-abrigo', dados: { construcao: e.tipo } };
  const principal = (falta.comida && racao) || (falta.agua && agua) || recolher || abrir;
  out.push(principal);
  for (const o of [recolher, racao, agua, abrir]) if (o && o !== principal) out.push(o);
  return out;
}

// a entidade não responde a toque? (o bicho de trabalho; o bicho de estimação fora do modo mão)
const semToque = (m, e) => { const s = TIPOS[e.tipo].semToque; return typeof s === 'function' ? !!s(m, e) : !!s; };
export function acoesDaEntidade(m, e) {
  if (!e || !TIPOS[e.tipo] || semToque(m, e)) return [];
  let out;
  if (ehAbrigo(m, e)) out = acoesDoAbrigo(m, e);
  else {
    const d = TIPOS[e.tipo].acaoPossivel(m, e);
    out = d && (d.acao || d.painel || d.texto) ? [opcao(d)] : [];
    // a indústria com produto na saída: retirar é a principal, e abrir o painel fica ao lado
    if (ehIndustria(m, e) && d && d.acao) out.push({ id: 'abrir', ok: true, painel: 'industria', arg: { entidade: e.id }, texto: 'ver-industria', dados: { construcao: e.tipo } });
  }
  for (let k = 0; k < OUTRAS_ACOES.length; k++) OUTRAS_ACOES[k](m, e, out);
  return out;
}

// O que dá para fazer no alvo, a principal primeiro. alvo = { x, z } (uma casa; a entidade que estiver nela vale) ou
// { entidade: id }. Cada opção: { id, ok, acao?, args?, comando?, painel?, arg?, texto?, dados?, falta?, info?,
// casas?, modo?, item? }:
//   id      o nome da ação (o id da ação registrada, "abrir" para painel, "info" quando não há o que fazer)
//   ok      false = não dá agora (texto diz por quê; "na-fila" = já prometida)
//   acao    a ação que entra na fila (na casa ou na entidade), com args; comando = o comando que a pede em vez disso
//   painel  o painel que abre (arg), sem andar
//   modo    o modo interno que o segurar repete na fileira a partir desta casa (só arar, plantar e regar)
//   arrasta o arrastar a partir desta casa repete a ação nas casas por onde o dedo passa (campo e plantas)
// [] = nada a fazer (o toque na casa só anda até lá).
export function acoesDoAlvo(m, alvo) {
  const loc = m.local;
  let id = alvo.entidade;
  if (id === undefined || id === null) {
    const x = Math.floor(alvo.x), z = Math.floor(alvo.z);
    if (!loc.dentro(x, z)) return [];
    const e = loc.entidadeEm(x, z);
    if (e) id = e.id;
    else if (!loc.ehPropria(x, z)) return [{ id: 'info', ok: false, texto: 'terra-a-venda' }];
    else { const d = acaoNaturalNaCasa(m, x, z); return d && (d.acao || d.texto) ? [opcao(d)] : []; }
  }
  return acoesDaEntidade(m, loc.porId[id]);
}

// ---------- fazer ----------
// a muda na mão é de uma vez: plantou, a mão volta para a semente de antes (para o próximo toque na grama só andar)
function largarMuda(m) {
  if (!ehMuda(m, m.modo.semente)) return;
  m.modo.semente = m.modo.voltar && m.posses.bolsa[m.modo.voltar] > 0 ? m.modo.voltar : null;
  m.modo.voltar = null;
  m.eventos.emitir('naMaoMudou', { item: itemNaMao(m) });
}
// a semente que o toque usou passa a ser a da mão (a escolhida acabou e veio outra)
function fixarNaMao(m, item) {
  if (!item || m.modo.semente === item) return;
  m.modo.semente = item;
  m.eventos.emitir('naMaoMudou', { item });
}
function avisar(m, o, onde) {
  if (!o.texto || o.texto === 'na-fila') return;
  m.eventos.emitir(o.info ? 'informou' : 'faltou', { motivo: o.texto, dados: o.dados, ...onde });
}
function fazer(m, o, onde) {
  if (o.texto === 'na-fila' && !o.ok) return { ok: true, repetida: true };
  if (!o.ok) { avisar(m, o, onde); return { ok: false, motivo: o.texto || null, dados: o.dados }; }
  if (o.painel) { m.eventos.emitir('pediuPainel', { painel: o.painel, arg: o.arg, entidade: onde.entidade }); return { ok: true, dados: { painel: o.painel, arg: o.arg } }; }
  if (o.comando) return m.comando(o.comando);
  const t = { tipo: 'agir', acao: o.acao, args: o.args || null };
  if (onde.entidade !== undefined) t.entidade = onde.entidade; else { t.x = onde.x; t.z = onde.z; }
  const r = enfileirar(m, t);
  if (r.ok) {
    m.personagem.rumando = false;
    if (o.acao === 'plantarMuda') largarMuda(m); else if (o.acao === 'semear') fixarNaMao(m, o.item);
  }
  return r;
}

registrarSistema({
  id: 'acoes',
  comandos: {
    // agirNoAlvo: o toque das ações por toque. Alvo: { x, z } (a casa; a entidade nela vale), { entidade } ou
    // { frente: true } (a casa ou entidade à frente dela: teclado e controle). opcao = o id de uma opção da roda (sem
    // ela, a principal). Na casa sem nada a fazer, anda até lá (de frente, avisa "nada-aqui").
    //   arrasto + modo: o dedo pintando: repete nesta casa o modo da primeira (acoesDoAlvo(...)[0].modo)
    //   fileira: segurou o dedo na casa: a ação dela vai para a fileira toda (a do modo da ação: o boi, se ara com ele)
    agirNoAlvo(m, c) {
      const loc = m.local;
      let x = c.x, z = c.z, id = c.entidade;
      if (c.frente) { const a = alvoDaFrente(m); x = a.x; z = a.z; id = a.entidade; }
      if (id === undefined || id === null) {
        x = Math.floor(x); z = Math.floor(z);
        if (!loc.dentro(x, z)) return { ok: false, motivo: 'fora-do-mapa' };
        if (c.arrasto) {
          if (!MODOS[c.modo]) return { ok: false, motivo: null };
          if (c.modo === 'semear') fixarNaMao(m, itemNaMao(m));
          return m.comando({ tipo: 'tocarCasa', x: x + 0.5, z: z + 0.5, arrasto: true, modo: c.modo });
        }
        const e = loc.entidadeEm(x, z);
        if (e) id = e.id;
      }
      if (id !== undefined && id !== null) {
        if (c.arrasto || c.fileira) return { ok: false, motivo: null };
        const lista = acoesDaEntidade(m, loc.porId[id]), o = c.opcao ? lista.find((k) => k.id === c.opcao) : lista[0];
        if (!o) return { ok: false, motivo: lista.length ? 'opcao-desconhecida' : null };
        return fazer(m, o, { entidade: id });
      }
      if (!loc.ehPropria(x, z)) {
        if (!c.arrasto) m.eventos.emitir('faltou', { motivo: 'terra-a-venda', x, z });
        return { ok: false, motivo: 'terra-a-venda' };
      }
      const d = acaoNaturalNaCasa(m, x, z, c);
      if (c.fileira) {
        // (o modo de quando o dedo ou o botão apertou: a primeira casa já pode estar na fila, e aí a ação dela mudou)
        const modo = c.modo && MODOS[c.modo] ? c.modo : d && d.modo;
        if (!modo) return { ok: false, motivo: 'fora-do-campo' };
        if (modo === 'semear') fixarNaMao(m, (d && d.item) || itemNaMao(m));
        return m.comando({ tipo: 'fileira', x: x + 0.5, z: z + 0.5, modo });
      }
      if (d && (d.acao || d.texto)) {
        const r = fazer(m, opcao(d), { x, z });
        if (r.ok || d.falta || d.info || !d.texto || c.frente) return r;
        // a muda que não cabe ali (perto de outra árvore, no caminho...): diz por quê e anda até lá
      }
      if (c.frente) { m.eventos.emitir('faltou', { motivo: 'nada-aqui', x, z }); return { ok: false, motivo: 'nada-aqui' }; }
      return m.comando({ tipo: 'irPara', x: x + 0.5, z: z + 0.5 });
    },
    // naMao { item }: o que fica na mão para plantar (semente ou muda; null = a primeira semente que houver). A muda
    // vale um plantio: depois a mão volta para a semente de antes. A escolha fica gravada (com o modo, em personagem.js).
    naMao(m, c) {
      const item = c.item || null;
      if (item && !plantavel(m.dados, item)) return { ok: false, motivo: 'nao-se-planta' };
      if (item && !(m.posses.bolsa[item] > 0)) return { ok: false, motivo: 'sem-sementes', dados: { item } };
      if (ehMuda(m, item) && !ehMuda(m, m.modo.semente)) m.modo.voltar = m.modo.semente;
      m.modo.semente = item;
      m.eventos.emitir('naMaoMudou', { item: itemNaMao(m) });
      return { ok: true, dados: { item: itemNaMao(m) } };
    },
    // trocarNaMao { passo: 1 | -1 }: passa para o próximo item da vaga (teclado Q/E, ombros do controle)
    trocarNaMao(m, c) {
      const lista = itensParaAMao(m);
      if (!lista.length) return { ok: false, motivo: 'sem-sementes-na-mao' };
      const i = lista.indexOf(itemNaMao(m)), prox = lista[(i + (c.passo < 0 ? -1 : 1) + lista.length) % lista.length];
      return m.comando({ tipo: 'naMao', item: prox });
    },
  },
});

// ---------- para a interface (só leem) ----------
// a fileira que segurar o dedo na casa (x, z) faria, com o modo da ação natural dela (ou o modo dado: o de quando
// apertou): { modo, ...fileiraDe } ou null
export function fileiraNatural(m, x, z, modoDado) {
  let modo = modoDado && MODOS[modoDado] ? modoDado : null, item = null;
  if (!modo) {
    const d = acaoNaturalNaCasa(m, x, z);
    if (!d || !d.modo) return null;
    modo = d.modo; item = d.item || null;
  } else if (modo === 'semear') item = itemNaMao(m);
  if (!podeSegurar(m, x, z, modo)) return null;
  const antes = m.modo.semente;
  if (item) m.modo.semente = item; // a conta com a semente da mão (o comando a fixa antes de plantar)
  try {
    const f = fileiraDe(m, x, z, modo);
    return f ? { ...f, modo } : null;
  } finally { m.modo.semente = antes; }
}
export { itemNaMao, itensParaAMao };
