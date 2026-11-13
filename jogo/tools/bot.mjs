// Jogador automático: joga o jogo de verdade (os mesmos comandos do toque, a mesma lógica, os dados de dados/),
// sem tela, e imprime o ritmo: nível ao longo do tempo, ouro ganho e gasto, quanto tempo ela passou andando,
// quantas idas ao poço e ao celeiro, e onde o jogador ficou sem ter o que fazer.
//   node tools/bot.mjs --horas 2                     joga 2 horas sem parar (perfil "direto")
//   node tools/bot.mjs --horas 72 --perfil regular   três dias de quem joga 3 sessões de 15 min por dia
// Perfis: direto (não fecha o jogo), casual, regular, engajado (as mesmas sessões do modelo de tools/economia/ritmo.mjs).
// Segue as missões do vizinho pelo guia (src/nucleo/guia.js); sem missão valendo, planta o que mais rende.
import path from 'node:path';
import '../src/nucleo/sistemas/index.js';
import { Mundo } from '../src/nucleo/mundo.js';
import { GRAMA, ARADA } from '../src/nucleo/local.js';
import { guiaDaMissao } from '../src/nucleo/guia.js';
import { missaoAtual } from '../src/nucleo/sistemas/missoes.js';
import { estadoDaPlanta, proximoAcontecimento } from '../src/nucleo/sistemas/lavoura.js';
import { ocupada, filaTem, contarNaFila } from '../src/nucleo/sistemas/personagem.js';
import { noCesto, espacoNoCesto, noCeleiro, ferramentaNoCinto, ferramentaNoSuporte } from '../src/nucleo/sistemas/posses.js';
import { ofertasDaLoja } from '../src/nucleo/sistemas/loja.js';
import { raiz, lerDados, conferirDados } from './comum.mjs';

const PERFIS = {
  direto: { nome: 'direto', sessoes: null, aproveitamento: 0.8 },
  casual: { nome: 'casual', sessoes: [[8, 10], [20, 10]], aproveitamento: 0.65 },
  regular: { nome: 'regular', sessoes: [[7.5, 15], [12.5, 15], [20, 15]], aproveitamento: 0.7 },
  engajado: { nome: 'engajado', sessoes: [[7, 20], [9.5, 20], [12.5, 20], [16, 20], [19, 20], [22, 20]], aproveitamento: 0.75 },
};
const arg = (nome, padrao) => { const i = process.argv.indexOf('--' + nome); if (i >= 0 && process.argv[i + 1] !== undefined) return process.argv[i + 1]; const j = process.argv.find((a) => a.startsWith(`--${nome}=`)); return j ? j.split('=')[1] : padrao; };
const HORAS = Math.max(0.05, Number(arg('horas', 1)) || 1);
const perfil = PERFIS[arg('perfil', 'direto')];
if (!perfil) { console.error(`perfil desconhecido; use um destes: ${Object.keys(PERFIS).join(', ')}`); process.exit(2); }
const TOQUE = 0.4 / perfil.aproveitamento; // segundos entre um toque e o seguinte (o resto é olhar, ler, errar)
const ADIANTE = 5; // quantas tarefas o jogador deixa na fila antes de esperar

const { dados, problemas, texto } = conferirDados(lerDados(path.join(raiz, 'dados')));
if (problemas.some((p) => p.grave)) { console.error(texto); process.exit(1); }
const m = new Mundo(dados, { agora: 0 });
const loc = m.local, P = m.posses, p = m.personagem, I = dados.itens;

// ---------- o que se mede ----------
const S = {
  jogado: 0, ausente: 0, sessoes: 0,
  niveis: [[0, 1]], missoes: [], ganho: {}, gasto: {}, conta: {}, recusas: {}, parado: {}, colhido: {}, comprado: {},
  linha: [],
};
const soma = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
m.eventos.ouvir('*', (d, tipo) => {
  if (tipo === 'subiuDeNivel') S.niveis.push([m.agora, d.nivel]);
  else if (tipo === 'missaoConcluida') S.missoes.push([m.agora, d.id]);
  else if (tipo === 'ganhouOuro') soma(S.ganho, d.origem || '?', d.n);
  else if (tipo === 'gastouOuro') soma(S.gasto, d.destino || '?', d.n);
  else if (tipo === 'faltou') soma(S.recusas, d.motivo || '?');
  else if (tipo === 'colheu') soma(S.colhido, d.item, d.n);
  else if (tipo === 'comprou') soma(S.comprado, d.item, d.n);
  else if (tipo === 'encheu' || tipo === 'pegouFerramenta' || tipo === 'vendeuTudo' || tipo === 'guardou' || tipo === 'socorro' || tipo === 'arou' || tipo === 'plantou' || tipo === 'regou') soma(S.conta, tipo);
});

// ---------- olhar o mundo ----------
const lavoura = dados.terras.pontos.lavoura || dados.terras.pontos.poco || [p.x, p.z];
function casaPerto(cx, cz, raio, serve) {
  let melhor = Infinity, achou = null;
  for (let z = Math.floor(cz) - raio; z <= cz + raio; z++) for (let x = Math.floor(cx) - raio; x <= cx + raio; x++) {
    if (!loc.ehPropria(x, z)) continue;
    const d = (x + 0.5 - cx) ** 2 + (z + 0.5 - cz) ** 2;
    if (d < melhor && serve(loc.i(x, z), x, z)) { melhor = d; achou = [x, z]; }
  }
  return achou;
}
function plantaPerto(estado) {
  let melhor = Infinity, achou = null;
  for (const i of loc.plantadas) {
    if (estadoDaPlanta(m, loc.plantas[i]) !== estado) continue;
    const x = i % loc.l, z = (i - x) / loc.l;
    if (filaTem(m, estado === 'pronta' ? 'colher' : 'regar', x, z)) continue;
    const d = Math.hypot(x + 0.5 - p.x, z + 0.5 - p.z);
    if (d < melhor) { melhor = d; achou = [x, z]; }
  }
  return achou;
}
const aradas = () => { let n = 0; for (let i = 0; i < loc.chao.length; i++) if (loc.chao[i] === ARADA) n++; return n; };
const sementesDaLoja = () => dados.loja.ouro.map((id) => I[id]).filter((it) => it.tipo === 'semente' && dados.culturaDaSemente[it.id] && it.nivel <= m.progresso.nivel);
const culturaDe = (s) => dados.culturas[dados.culturaDaSemente[s]];
// quanto a semente rende por segundo de espera (ouro); "limite" = tempo que o jogador ainda fica (ou fica fora)
function melhorSemente(lista, limite) {
  let melhor = null, nota = -Infinity;
  for (const it of lista) {
    const c = culturaDe(it.id), lucro = c.rende * I[c.produto].venda - it.compra, trecho = c.tempoSeg / c.regas;
    let n = lucro / (c.tempoSeg + 25 * c.regas);
    if (foraSeg > 0 && limite < 150) n = trecho <= foraSeg ? lucro : lucro * 0.01; // vai fechar o jogo: planta o que rende mais até a volta
    else if (limite > 0 && trecho > limite) n *= 0.25; // não fica pronta a tempo: só se não houver outra
    if (n > nota) { nota = n; melhor = it; }
  }
  return melhor;
}
let foraSeg = 0; // quanto tempo o jogo fica fechado depois desta sessão (0 = não fecha)
const semAgua = () => { const r = ferramentaNoCinto(m, 'regador') || ferramentaNoSuporte(m, 'regador'); return !!r && P.ferramentas[r].agua - contarNaFila(m, 'regar') <= 0 && !filaTem(m, 'encher'); };
const campoAlvo = () => Math.min(36, 6 + 2 * (m.progresso.nivel - 1));

// ---------- decidir ----------
const naoCompra = new Set(); // o que a loja recusou vender: não insiste
const g = {};
const passo = (tipo, extra) => Object.assign(g, { tipo, x: 0, z: 0, id: null, modo: null, item: null, n: 0, seg: 0, porque: '' }, extra);
const emModo = (modo, semente) => (m.modo.id !== modo || (semente && m.modo.semente !== semente) ? passo('modo', { modo, item: semente || null }) : null);

// sem missão valendo (ou enquanto junta ouro para ela): colhe, rega, vende, melhora, planta, ara, espera
function livre(resta) {
  let c = plantaPerto('pronta');
  if (c) {
    const rende = dados.culturas[loc.plantas[loc.i(c[0], c[1])].cultura].rende;
    if (espacoNoCesto(m) - contarNaFila(m, 'colher') * rende < rende) return filaTem(m, 'vender') ? passo('aguardar') : passo('entidade', { id: 'banca' });
    return emModo('mao') || passo('casa', { x: c[0], z: c[1] });
  }
  c = plantaPerto('sede');
  if (c) return semAgua() ? passo('entidade', { id: 'poco' }) : emModo('mao') || passo('casa', { x: c[0], z: c[1] });
  if (noCesto(m) > 0 && !contarNaFila(m, 'colher')) return filaTem(m, 'vender') ? passo('aguardar') : passo('entidade', { id: 'banca' });
  // melhoria que cabe no bolso (deixando ouro para as sementes)
  const sementes = sementesDaLoja(), barata = sementes.reduce((a, b) => (!a || b.compra < a.compra ? b : a), null);
  const melhorias = ofertasDaLoja(m).flatMap((a) => a.ofertas).filter((o) => o.unico && o.liberado && !o.tem).sort((a, b) => a.preco - b.preco);
  if (melhorias.length && barata && P.ouro >= melhorias[0].preco + 8 * barata.compra && !naoCompra.has(melhorias[0].item)) return passo('comprar', { item: melhorias[0].item, n: 1 });
  // semear o que está arado e vazio
  c = casaPerto(lavoura[0] + 0.5, lavoura[1] + 0.5, 10, (i, x, z) => loc.chao[i] === ARADA && !loc.plantas[i] && !filaTem(m, 'semear', x, z));
  const naBolsa = sementes.filter((it) => (P.bolsa[it.id] || 0) - contarNaFila(m, 'semear', (t) => t.args.semente === it.id) > 0);
  if (c) {
    const s = melhorSemente(naBolsa, resta);
    if (s) return emModo('semear', s.id) || passo('casa', { x: c[0], z: c[1] });
    const q = melhorSemente(sementes.filter((it) => it.compra <= P.ouro), resta);
    if (q) { const vazias = aradas() - loc.plantadas.length - contarNaFila(m, 'semear'); return passo('comprar', { item: q.id, n: Math.max(1, Math.min(vazias, Math.floor(P.ouro / q.compra))) }); }
    if (noCeleiro(m) > 0) return passo('entidade', { id: 'celeiro' });
    return passo('esperar', { seg: 5, porque: 'sem semente e sem ouro para comprar (espera o socorro do vizinho)' });
  }
  // arar mais, até o tamanho de campo deste nível, se houver semente (ou ouro para ela)
  const cabeMais = aradas() + contarNaFila(m, 'arar') < campoAlvo();
  const temSemente = naBolsa.length > 0 || (barata && P.ouro >= barata.compra);
  if (cabeMais && temSemente) {
    c = casaPerto(lavoura[0] + 0.5, lavoura[1] + 0.5, 8, (i, x, z) => loc.chao[i] === GRAMA && !loc.ocupa[i] && !filaTem(m, 'arar', x, z));
    if (c) return emModo('enxada') || passo('casa', { x: c[0], z: c[1] });
    return passo('esperar', { seg: 10, porque: 'não há mais grama livre perto da lavoura para arar' });
  }
  if (ocupada(m)) return passo('aguardar');
  const quando = proximoAcontecimento(m);
  if (quando !== null) return passo('esperar', { seg: Math.max(0.5, (quando - m.agora) / 1000), porque: cabeMais ? 'esperando a lavoura crescer (sem semente nem ouro para plantar mais)' : 'esperando a lavoura crescer (campo cheio)' });
  return passo('esperar', { seg: 5, porque: 'sem nada plantado e sem o que fazer' });
}

function decidir(resta) {
  const a = missaoAtual(m);
  if (!a || a.esperaNivel) return livre(resta);
  const o = a.missao.objetivo;
  if (o.evento === 'comprou') {
    const f = o.filtro || {}, pedido = Array.isArray(f.item) ? f.item[0] : f.item;
    if (pedido) return P.ouro >= I[pedido].compra && !naoCompra.has(pedido) ? passo('comprar', { item: pedido, n: 1 }) : livre(resta);
    const s = melhorSemente(sementesDaLoja().filter((it) => it.compra <= P.ouro && (!f.classe || it.tipo === f.classe)), resta);
    return s ? passo('comprar', { item: s.id, n: Math.max(1, Math.min(a.n - a.conta, Math.floor(P.ouro / s.compra))) }) : livre(resta);
  }
  guiaDaMissao(m, g);
  if (g.tipo === 'semente') return passo('modo', { modo: 'semear', item: g.item });
  if (g.tipo === 'painel') return g.item && P.ouro >= I[g.item].compra && !naoCompra.has(g.item) ? passo('comprar', { item: g.item, n: 1 }) : livre(resta);
  if (g.tipo === 'esperar') { // enquanto a missão espera a planta, o jogador cuida do resto da fazenda
    const seg = g.seg, missao = a.missao.id;
    livre(resta);
    if (g.tipo === 'esperar') { g.seg = Math.min(g.seg, seg); g.porque = `missão "${missao}": ` + g.porque; }
    return g;
  }
  if (g.tipo === null) return livre(resta);
  g.porque = ''; g.n = 0;
  return g;
}

// faz o passo decidido; devolve quantos segundos o jogador fica sem tocar em nada (0 = já pode tocar de novo)
function fazer() {
  let r;
  switch (g.tipo) {
    case 'modo': m.comando({ tipo: 'escolherModo', modo: g.modo, semente: g.item || undefined }); return 0;
    case 'casa': r = m.comando({ tipo: 'tocarCasa', x: g.x + 0.5, z: g.z + 0.5 }); break;
    case 'entidade': r = m.comando({ tipo: 'tocarEntidade', id: g.id }); break;
    case 'comprar': r = m.comando({ tipo: 'comprar', item: g.item, n: g.n }); if (!r.ok) { soma(S.recusas, 'compra: ' + r.motivo); naoCompra.add(g.item); } return r.ok ? 0 : 1;
    case 'esperar': soma(S.parado, g.porque, 0); return -Math.min(g.seg, 20);
    default: return 0.5; // aguardar a fila andar
  }
  if (!r.ok) soma(S.recusas, 'toque: ' + (r.motivo || '?'));
  return r.ok && !r.repetida ? 0 : 1;
}

// ---------- jogar ----------
const FIM = HORAS * 3600 * 1000;
const cadaLinha = Math.max(60, Math.round((HORAS * 3600) / 16 / 60) * 60) * 1000;
let proximaLinha = 0;
function linha() {
  while (m.agora >= proximaLinha && proximaLinha <= FIM) {
    S.linha.push([proximaLinha, m.progresso.nivel, m.progresso.xp, P.ouro, aradas(), loc.plantadas.length, S.missoes.length]);
    proximaLinha += cadaLinha;
  }
}
function sessao(ate) {
  S.sessoes++;
  let livreEm = 0, motivo = null; // livreEm: instante em que o jogador toca de novo; motivo: por que está parado
  while (m.agora < ate) {
    if (m.agora >= livreEm) {
      motivo = null;
      if (p.fila.length < ADIANTE) {
        decidir((ate - m.agora) / 1000);
        const espera = fazer();
        if (espera < 0) { motivo = g.porque; livreEm = m.agora + -espera * 1000; } else livreEm = m.agora + (espera || TOQUE) * 1000;
      } else livreEm = m.agora + 300;
    }
    m.passo();
    S.jogado += 1 / 60;
    if (motivo && !ocupada(m)) S.parado[motivo] += 1 / 60;
    linha();
  }
}
linha();
if (!perfil.sessoes) sessao(FIM);
else {
  // o relógio do bot começa na primeira sessão do dia
  const h0 = perfil.sessoes[0][0];
  for (let dia = 0; m.agora < FIM; dia++) {
    for (let k = 0; k < perfil.sessoes.length; k++) {
      const [hora, minutos] = perfil.sessoes[k], prox = perfil.sessoes[k + 1] ? perfil.sessoes[k + 1][0] : perfil.sessoes[0][0] + 24;
      const comeca = (dia * 24 + hora - h0) * 3600 * 1000;
      foraSeg = (prox - hora) * 3600 - minutos * 60;
      if (comeca >= FIM) break;
      if (comeca > m.agora) { S.ausente += (comeca - m.agora) / 1000; m.acertarRelogio(comeca); linha(); }
      sessao(Math.min(FIM, comeca + minutos * 60 * 1000));
    }
    if ((dia + 1) * 24 * 3600 * 1000 >= FIM + h0 * 3600 * 1000) break;
  }
  if (m.agora < FIM) { S.ausente += (FIM - m.agora) / 1000; m.acertarRelogio(FIM); linha(); }
}

// ---------- o relato ----------
const hm = (ms) => { const s = Math.round(ms / 1000), h = Math.floor(s / 3600), mi = Math.floor((s % 3600) / 60); return h ? `${h} h ${String(mi).padStart(2, '0')} min` : mi ? `${mi} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`; };
const pc = (a, b) => (b > 0 ? ((100 * a) / b).toFixed(0) + '%' : '-');
const lista = (o, f = (k, v) => `${k} ${Math.round(v)}`) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => f(k, v)).join(', ') || 'nada';
const C = p.conta, ativo = C.andando + C.correndo + C.agindo + C.parada;
console.log(`Jogador automático: perfil ${perfil.nome}, ${HORAS} h de relógio (${hm(S.jogado * 1000)} jogando em ${S.sessoes} sessão(ões), ${hm(S.ausente * 1000)} com o jogo fechado).`);
console.log('\nAo longo do tempo:');
console.log('  relógio        nível    xp   ouro  aradas  plantadas  missões');
for (const [t, nivel, xp, ouro, ar, pl, mi] of S.linha) console.log(`  ${hm(t).padEnd(13)} ${String(nivel).padStart(5)} ${String(xp).padStart(5)} ${String(ouro).padStart(6)} ${String(ar).padStart(7)} ${String(pl).padStart(10)} ${String(mi).padStart(8)}`);
console.log('\nNíveis: ' + S.niveis.map(([t, n]) => `${n} aos ${hm(t)}`).join(' · '));
console.log(`Missões cumpridas (${S.missoes.length}): ` + (S.missoes.map(([t, id]) => `${id} (${hm(t)})`).join(' · ') || 'nenhuma'));
const a = missaoAtual(m);
console.log('Missão no fim: ' + (a ? `${a.missao.id} (${a.conta}/${a.n}${a.esperaNivel ? `, espera o nível ${a.esperaNivel}` : ''})` : 'nenhuma (acabaram as que este marco sabe cumprir)'));
const ganho = Object.values(S.ganho).reduce((x, y) => x + y, 0), gasto = Object.values(S.gasto).reduce((x, y) => x + y, 0);
console.log(`\nOuro: ganhou ${ganho} (${lista(S.ganho)}); gastou ${gasto} (${lista(S.gasto)}); tem ${P.ouro}. Cash: ${P.cash}.`);
console.log(`  por hora jogada: ganhou ${(ganho / (S.jogado / 3600)).toFixed(0)}, gastou ${(gasto / (S.jogado / 3600)).toFixed(0)}`);
console.log('Colheu: ' + lista(S.colhido) + '. Comprou: ' + lista(S.comprado) + '.');
console.log(`\nO tempo dela (${hm(ativo * 1000)}): andando ${pc(C.andando, ativo)}, correndo ${pc(C.correndo, ativo)}, trabalhando ${pc(C.agindo, ativo)}, parada ${pc(C.parada, ativo)}. Andou ${Math.round(C.distancia)} casas.`);
console.log(`Trabalho: arou ${S.conta.arou || 0}, semeou ${S.conta.plantou || 0}, regou ${S.conta.regou || 0}. Idas ao poço: ${S.conta.encheu || 0} (${S.conta.regou ? (S.conta.regou / Math.max(1, S.conta.encheu)).toFixed(1) : 0} regas por ida). Trocas de ferramenta no celeiro: ${S.conta.pegouFerramenta || 0}. Vendas na banca: ${S.conta.vendeuTudo || 0}. Socorros do vizinho: ${S.conta.socorro || 0}.`);
const parado = Object.entries(S.parado).filter(([, v]) => v >= 1).sort((x, y) => y[1] - x[1]);
console.log('\nOnde o jogador ficou sem ter o que fazer' + (parado.length ? ` (${pc(parado.reduce((s, [, v]) => s + v, 0), S.jogado)} do tempo jogado):` : ': em nenhum momento.'));
for (const [k, v] of parado) console.log(`  ${hm(v * 1000).padStart(12)}  ${k}`);
const rec = Object.entries(S.recusas).sort((x, y) => y[1] - x[1]);
if (rec.length) console.log('\nRecusas do jogo (toques que não valeram e faltas no meio da fila): ' + rec.map(([k, v]) => `${k} ×${v}`).join(', '));
