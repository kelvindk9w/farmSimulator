// De onde vem cada material e para que ele serve. O cartão "Onde conseguir?" da interface, o Seu Tonho que ensina,
// o aviso dos prêmios ("servem para o galinheiro") e o validador dos dados leem daqui. Só lê o mundo; não muda nada.
// As fontes ficam nos dados, no próprio item de itens.json ("fontes": [...], na ordem em que o cartão mostra):
//   { "tipo": "loja" }                          compra na loja de ouro (na aba do item), a partir do nível do item
//   { "tipo": "limpar", "obstaculo": "toco" }   limpar o obstáculo do terreno (terras.json → obstaculos) com a ferramenta
//   { "tipo": "receita", "receita": "tabua" }   fazer numa construção (receitas.json)
//   { "tipo": "bicho", "animal": "cachorro" }   o mimo do bicho de estimação (animais.json → efeito.sorteia)
//   { "tipo": "premios" }                       prêmios: missões do Seu Tonho, subida de nível e presente do dia
// e, no item, "comoConseguir": a fala curta do Seu Tonho na primeira vez que o jogador precisa dele e não tem.
import { quantoTem } from './sistemas/posses.js';
import { receitasDe } from './sistemas/industria.js';
import { defDe, construcoesDe, quantasGuardadas, proximaAmpliacao, temPronta } from './sistemas/construcao.js';
import { reformas } from './sistemas/comeco.js';
import { missaoAtual, missaoPossivel } from './sistemas/missoes.js';
import { progressoDe } from './premios.js';
import { temPresente } from './sistemas/diaria.js';
import { loteDaCasa, loteComprado } from './sistemas/terras.js';
import { regrasDoCampo, estadoDoCampo, custoDoPreparo, soNoCampo } from './sistemas/campo.js';

const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const TIPOS = ['loja', 'limpar', 'receita', 'bicho', 'premios'];
const fontesDe = (D, item) => (D.itens[item] && Array.isArray(D.itens[item].fontes) ? D.itens[item].fontes.filter(obj) : []);
export const temFontes = (m, item) => fontesDe(m.dados, item).length > 0;
export const comoConseguir = (m, item) => (m.dados.itens[item] && typeof m.dados.itens[item].comoConseguir === 'string' ? m.dados.itens[item].comoConseguir : '');

// ---------- o que falta ----------
// todos os itens que faltam para { item: n } (oQueFalta, de posses.js, dá só o primeiro): [{ item, precisa, tem, falta }]
export function faltasDe(m, itens) {
  const out = [];
  for (const k in itens || {}) { const tem = quantoTem(m, k); if (tem < itens[k]) out.push({ item: k, precisa: itens[k], tem, falta: itens[k] - tem }); }
  return out;
}

// ---------- o Seu Tonho explica cada material uma vez só ----------
// a marca fica nas dicas da indústria (industria.dicas, gravadas), com o comando viuDica { dica: dicaDoMaterial(item) }
export const dicaDoMaterial = (item) => 'fonte:' + item;
export const jaExplicou = (m, item) => !!(m.industria && m.industria.dicas[dicaDoMaterial(item)]);
// entre os que faltam de { item: n }: o primeiro que tem fonte e que o Seu Tonho ainda não explicou (ou null)
export function materialParaExplicar(m, itens) {
  for (const f of faltasDe(m, itens)) if (temFontes(m, f.item) && !jaExplicou(m, f.item)) return f.item;
  return null;
}

// ---------- quando cada fonte abre (servem ao jogo e ao validador; só dados) ----------
const forcaDe = (it) => (it && it.forca > 0 ? it.forca : 1);
const ferramentaServe = (D, id, funcao, forca) => { const it = D.itens[id]; return !!it && it.tipo === 'ferramenta' && it.funcao === funcao && forcaDe(it) >= forca; };
// o nível em que dá para ter uma ferramenta da função (e força): começa com ela, prêmio de missão ou loja
export function nivelDaFerramenta(D, funcao, forca = 1) {
  let n = Infinity;
  const I = D.regras && D.regras.inicio;
  if (I) for (const id of [...(I.cinto || []), ...(I.suporte || []), ...(I.noLugar || [])]) if (ferramentaServe(D, id, funcao, forca)) n = 1;
  for (const mi of (D.missoes && D.missoes.vizinho) || []) for (const k in (mi.recompensa && mi.recompensa.itens) || {}) if (ferramentaServe(D, k, funcao, forca)) n = Math.min(n, mi.nivel || 1);
  for (const id of (D.loja && D.loja.ouro) || []) if (ferramentaServe(D, id, funcao, forca)) n = Math.min(n, D.itens[id].nivel || 1);
  return n;
}
// a ferramenta mais fácil de ter que limpa (a de menor nível entre as que se ganham ou compram): id ou null
export function ferramentaQueServe(D, funcao, forca = 1) {
  let melhor = null, nv = Infinity;
  const ver = (id, n) => { if (ferramentaServe(D, id, funcao, forca) && n < nv) { melhor = id; nv = n; } };
  const I = D.regras && D.regras.inicio;
  if (I) for (const id of [...(I.cinto || []), ...(I.suporte || []), ...(I.noLugar || [])]) ver(id, 1);
  for (const mi of (D.missoes && D.missoes.vizinho) || []) for (const k in (mi.recompensa && mi.recompensa.itens) || {}) ver(k, mi.nivel || 1);
  for (const id of (D.loja && D.loja.ouro) || []) ver(id, D.itens[id].nivel || 1);
  return melhor;
}
const naLoja = (D, item) => !!D.itens[item] && D.itens[item].compra > 0 && !!D.loja && D.loja.ouro.includes(item);
const abaDaLoja = (D, item) => { const a = D.loja && D.loja.abas.find((x) => x.itens.includes(item)); return a ? a.id : null; };
// o nível em que a fonte abre (Infinity = nunca: dado errado); premios: null (depende do que ainda vem)
export function nivelDaFonte(D, item, f) {
  if (f.tipo === 'loja') return naLoja(D, item) ? D.itens[item].nivel || 1 : Infinity;
  if (f.tipo === 'limpar') { const O = D.obstaculos && D.obstaculos[f.obstaculo]; return O && O.da && O.da[item] > 0 ? nivelDaFerramenta(D, O.ferramenta, O.forcaMinima || 1) : Infinity; }
  if (f.tipo === 'receita') { const r = receitasDe(D).todas[f.receita], c = r && D.construcoes[r.onde]; return r && r.sai[item] > 0 && c ? Math.max(r.nivel, c.nivel || 1) : Infinity; }
  if (f.tipo === 'bicho') { const a = D.animais && D.animais[f.animal], s = a && a.efeito && a.efeito.sorteia; return Array.isArray(s) && s.some((x) => obj(x) && x[item] > 0) && !a.especial ? a.nivel || 1 : Infinity; }
  return null;
}

// ---------- os prêmios que ainda vêm com o item ----------
// { missao: { id, titulo, nivel, n, daVez } | null, nivel: { nivel, n } | null, dia: { dia, n, hoje } | null }
export function premiosCom(m, item) {
  const D = m.dados, out = { missao: null, nivel: null, dia: null };
  const a = missaoAtual(m), daVez = a && a.missao ? a.missao.id : null;
  for (const mi of D.missoes.vizinho) {
    if (m.missoes.feitas.includes(mi.id) || !missaoPossivel(m, mi)) continue;
    const n = mi.recompensa && mi.recompensa.itens && mi.recompensa.itens[item];
    if (n > 0) { out.missao = { id: mi.id, titulo: mi.titulo, nivel: mi.nivel || 1, n, daVez: mi.id === daVez }; break; }
  }
  const R = D.niveis.recompensas, agora = m.progresso.nivel;
  for (let n = agora + 1; n <= D.niveis.max; n++) { const r = R[n], q = r && r.itens && r.itens[item]; if (q > 0) { out.nivel = { nivel: n, n: q }; break; } }
  const dias = progressoDe(D).dias, Dd = m.diaria;
  if (dias.length && Dd) {
    const hoje = temPresente(m);
    for (let k = 0; k < dias.length; k++) {
      const i = (Dd.proximo + k) % dias.length, r = dias[i].recompensa, q = r && r.itens && r.itens[item];
      if (q > 0) { out.dia = { dia: i + 1, n: q, daqui: hoje ? k : k + 1, hoje: hoje && k === 0 }; break; }
    }
  }
  return out;
}

// ---------- as fontes de um item, para o cartão ----------
// [{ tipo, ok (dá para usar agora), nivel (quando abre), ...o da fonte }], as que já valem primeiro (na ordem dos dados)
//   loja     { preco, aba }
//   limpar   { obstaculo, nome, da, chance, ferramenta (a função), ferramentaItem, forte, temFerramenta, restam (na terra dela),
//              naTerraNova: { id, nome, nivel, n } (o lote à venda de menor nível que tem desse obstáculo) | null }
//   receita  { receita, onde, entra, sai, temConstrucao }
//   bicho    { animal, temBicho }
//   premios  { missao, nivel: (o prêmio de nível), dia }  (premiosCom; "nivel" aqui é o do prêmio, não o da fonte)
export function fontesDoItem(m, item) {
  const D = m.dados, agora = m.progresso.nivel, out = [];
  for (const f of fontesDe(D, item)) {
    if (!TIPOS.includes(f.tipo)) continue;
    if (f.tipo === 'premios') {
      const p = premiosCom(m, item);
      out.push({ tipo: 'premios', ok: !!(p.missao || p.nivel || p.dia), nivelDoPremio: p.nivel, missao: p.missao, dia: p.dia, nivel: 1 });
      continue;
    }
    const nivel = nivelDaFonte(D, item, f);
    if (nivel === Infinity) continue; // dado que não fecha (o validador avisa): o jogador não vê
    if (f.tipo === 'loja') out.push({ tipo: 'loja', nivel, ok: nivel <= agora, preco: D.itens[item].compra, aba: abaDaLoja(D, item) });
    else if (f.tipo === 'limpar') {
      const O = D.obstaculos[f.obstaculo], loc = m.locais.fazenda, F = m.posses.ferramentas;
      let temFerramenta = false, restam = 0;
      const lotes = {};
      for (const id in F) if (ferramentaServe(D, id, O.ferramenta, O.forcaMinima || 1)) temFerramenta = true;
      if (loc) for (const e of loc.entidades) {
        if (e.tipo !== f.obstaculo) continue;
        if (loc.ehPropria(e.x, e.z)) { restam++; continue; }
        const l = loteDaCasa(m, e.x, e.z);
        if (l && !loteComprado(m, l.id)) lotes[l.id] = (lotes[l.id] || 0) + 1;
      }
      // o lote à venda mais fácil (o de menor nível) que tem desse obstáculo: { id, nome, nivel, n }
      let naTerraNova = null;
      for (const id in lotes) { const l = D.terras.lotes.find((x) => x.id === id); if (!naTerraNova || l.nivel < naTerraNova.nivel) naTerraNova = { id, nome: l.nome, nivel: l.nivel, n: lotes[id] }; }
      out.push({ tipo: 'limpar', nivel, ok: temFerramenta && restam > 0, obstaculo: f.obstaculo, nome: O.nome, da: O.da[item], chance: O.chance, ferramenta: O.ferramenta, ferramentaItem: ferramentaQueServe(D, O.ferramenta, O.forcaMinima || 1), forte: (O.forcaMinima || 1) > 1, temFerramenta, restam, naTerraNova });
    } else if (f.tipo === 'receita') {
      const r = receitasDe(D).todas[f.receita], tem = temPronta(m, r.onde);
      out.push({ tipo: 'receita', nivel, ok: nivel <= agora && tem, receita: r.id, onde: r.onde, entra: r.entra, sai: r.sai[item], temConstrucao: tem });
    } else if (f.tipo === 'bicho') {
      const tem = m.animais ? m.animais.lista.some((a) => a.especie === f.animal) : false;
      out.push({ tipo: 'bicho', nivel, ok: tem, animal: f.animal, temBicho: tem });
    }
  }
  // as que valem agora vêm primeiro; entre as outras, a que abre antes
  return out.map((f, i) => ({ f, i })).sort((a, b) => (b.f.ok - a.f.ok) || (a.f.ok ? a.i - b.i : (a.f.nivel - b.f.nivel) || a.i - b.i)).map((x) => x.f);
}

// ---------- para que o item serve ----------
// o que o jogador ainda vai construir, reformar, ampliar ou fazer com o item, o mais perto primeiro:
// [{ tipo: 'construcao' | 'reforma' | 'ampliacao' | 'receita' | 'campo', id, nome, nivel, precisa, ja (o nível já deixa) }]
export function paraQueServe(m, item, quantos = 3) {
  const D = m.dados, agora = m.progresso.nivel, out = [], vistos = new Set();
  const por = (x) => { const k = x.tipo + ':' + x.id; if (vistos.has(k)) return; vistos.add(k); x.ja = x.nivel <= agora; out.push(x); };
  for (const r of reformas(m)) { const q = r.custo.itens && r.custo.itens[item]; if (q > 0 && !(r.obra > 0)) por({ tipo: 'reforma', id: r.de, nome: r.nome, nivel: r.nivel, precisa: q }); }
  for (const def of Object.values(D.construcoes)) {
    const q = def.custo && def.custo.itens && def.custo.itens[item];
    if (!(q > 0) || def.inicial || def.tipo === 'decoracao' || def.custo.cash > 0) continue;
    const tem = construcoesDe(m, def.id).length + quantasGuardadas(m, def.id);
    if (tem > 0 && !(def.limite === 0 && def.tipo === 'movel')) continue; // a que já tem fica de fora (móvel sem limite ainda serve)
    por({ tipo: 'construcao', id: def.id, nome: def.nome, nivel: def.nivel, precisa: q });
  }
  if (m.construcao) for (const e of m.construcao.todas) {
    if (e.obraAte > 0 || e.ampliaAte > 0) continue;
    const a = proximaAmpliacao(m, e), q = a && a.custo && a.custo.itens && a.custo.itens[item];
    if (q > 0) por({ tipo: 'ampliacao', id: e.tipo, nome: defDe(m, e.tipo).nome, nivel: a.nivel, precisa: q });
  }
  for (const r of Object.values(receitasDe(D).todas)) {
    if (!(r.entra[item] > 0)) continue;
    por({ tipo: 'receita', id: r.id, nome: r.nome, nivel: Math.max(r.nivel, (D.construcoes[r.onde] || {}).nivel || 1), precisa: r.entra[item] });
  }
  // preparar terra nova no campo (enquanto o nível de agora ou um que vem deixa o campo crescer)
  if (m.campo && soNoCampo(m)) {
    const C = estadoDoCampo(m), q = C.item === item && C.porCasa.adubo > 0 ? Math.ceil(C.porCasa.adubo * C.fileira.n - 1e-9) : 0;
    if (q > 0 && (C.restam > 0 || C.proximo)) por({ tipo: 'campo', id: 'campo', nome: 'Campo', nivel: C.restam > 0 ? agora : C.proximo.nivel, precisa: q });
  }
  out.sort((a, b) => (b.ja - a.ja) || a.nivel - b.nivel);
  return out.slice(0, quantos);
}

// o prêmio { item: n } traz material? { mats: { item: n } (só os materiais), usos: [até "quantos" de paraQueServe, sem
// repetir, o mais perto primeiro] } ou null. É o que a nota "+10 pregos: servem para o estábulo" diz.
const MATERIAL = { material: 1, embalagem: 1, racao: 1 };
export function usosDoPremio(m, itens, quantos = 2) {
  const D = m.dados, mats = {};
  for (const k in itens || {}) if (D.itens[k] && MATERIAL[D.itens[k].tipo] && itens[k] > 0) mats[k] = itens[k];
  if (!Object.keys(mats).length) return null;
  const usos = [], vistos = new Set();
  for (const k in mats) for (const u of paraQueServe(m, k, 3)) { const c = u.tipo + ':' + u.id; if (!vistos.has(c)) { vistos.add(c); usos.push(u); } }
  usos.sort((a, b) => (b.ja - a.ja) || a.nivel - b.nivel);
  return usos.length ? { mats, usos: usos.slice(0, quantos) } : null;
}

// ---------- o que a missão da vez pede de material ----------
// { itens: { item: n }, nome } ou null: construir/montar (o preço), reformar (o da reforma), preparar a terra (o adubo
// das casas que faltam), produzir (os ingredientes)
export function materialDaMissao(m) {
  const a = missaoAtual(m);
  if (!a || a.esperaNivel) return null;
  const o = a.missao.objetivo, f = o.filtro || {}, um = (v) => (Array.isArray(v) ? v[0] : v);
  if ((o.evento === 'construiu' || o.evento === 'montou') && f.construcao) {
    const def = defDe(m, um(f.construcao));
    if (def && def.custo && def.custo.itens && !construcoesDe(m, def.id).length) return { itens: def.custo.itens, nome: def.nome };
  }
  if (o.evento === 'reformou' && f.construcao) {
    const r = reformas(m).find((x) => x.de === um(f.construcao) && !(x.obra > 0));
    if (r && r.custo.itens) return { itens: r.custo.itens, nome: r.nome };
  }
  if (o.evento === 'preparou' && m.campo && soNoCampo(m)) {
    const c = custoDoPreparo(m, Math.max(1, o.n - (a.conta || 0)));
    if (Object.keys(c.itens).length) return { itens: c.itens, nome: 'Campo' };
  }
  if (o.evento === 'produziu' && f.item) {
    const lista = receitasDe(m.dados).porItem[um(f.item)], r = lista && (lista.find((x) => x.nivel <= m.progresso.nivel) || lista[0]);
    if (r) { const itens = {}; for (const k in r.entra) itens[k] = r.entra[k] * Math.max(1, Math.ceil((o.n - (a.conta || 0)) / r.n)); return { itens, nome: r.nome }; }
  }
  return null;
}

// ---------- o validador (tools/validar.mjs) ----------
// Confere as fontes de itens.json e se cada material que alguma obra pede tem fonte aberta até o nível dela.
// Devolve [{ grave, texto }] (grave = o jogador pode ficar sem saída).
export function conferirFontes(D) {
  const out = [], erro = (texto) => out.push({ grave: true, texto }), aviso = (texto) => out.push({ grave: false, texto });
  const R = receitasDe(D);
  // 1) o formato e as referências
  for (const [id, it] of Object.entries(D.itens)) {
    if (it.fontes === undefined) continue;
    if (!Array.isArray(it.fontes)) { erro(`itens.json "${id}": "fontes" devia ser uma lista`); continue; }
    for (const f of it.fontes) {
      if (!obj(f) || !TIPOS.includes(f.tipo)) { erro(`itens.json "${id}": fonte de tipo desconhecido ${JSON.stringify(f)} (vale: ${TIPOS.join(', ')})`); continue; }
      if (f.tipo === 'loja' && !naLoja(D, id)) erro(`itens.json "${id}": fonte "loja", mas o item não está à venda na loja de ouro`);
      if (f.tipo === 'limpar') { const O = D.obstaculos && D.obstaculos[f.obstaculo]; if (!O) erro(`itens.json "${id}": fonte "limpar" cita o obstáculo "${f.obstaculo}", que não existe em terras.json`); else if (!(O.da && O.da[id] > 0)) erro(`itens.json "${id}": o obstáculo "${f.obstaculo}" não dá ${id}`); else if (nivelDaFonte(D, id, f) === Infinity) erro(`itens.json "${id}": ninguém dá a ferramenta que limpa "${f.obstaculo}"`); }
      if (f.tipo === 'receita') { const r = R.todas[f.receita]; if (!r) erro(`itens.json "${id}": fonte "receita" cita "${f.receita}", que não existe em receitas.json`); else if (!(r.sai[id] > 0)) erro(`itens.json "${id}": a receita "${f.receita}" não faz ${id}`); }
      if (f.tipo === 'bicho' && nivelDaFonte(D, id, f) === Infinity) erro(`itens.json "${id}": o bicho "${f.animal}" não existe, é especial ou não traz ${id} de mimo`);
      if (f.tipo === 'premios' && !premioExiste(D, id)) aviso(`itens.json "${id}": fonte "premios", mas nenhuma missão, nível ou presente do dia dá ${id}`);
    }
    if (!it.comoConseguir) aviso(`itens.json "${id}": tem "fontes" mas não tem "comoConseguir" (a fala do Seu Tonho)`);
  }
  // 2) o que as obras e as receitas pedem: cada material tem de ter fonte que abre até o nível do pedido
  for (const p of pedidosDeMaterial(D)) {
    const it = D.itens[p.item];
    if (!it || !['material', 'embalagem', 'racao'].includes(it.tipo)) continue;
    const fs = fontesDe(D, p.item);
    if (!fs.length) { erro(`${p.onde} pede ${p.item} (nível ${p.nivel}), e itens.json não diz de onde ${p.item} vem ("fontes")`); continue; }
    const abre = Math.min(...fs.map((f) => nivelDaFonte(D, p.item, f)).filter((n) => n !== null));
    if (!(abre <= p.nivel)) erro(`${p.onde} pede ${p.item} no nível ${p.nivel}, mas a primeira fonte de ${p.item} só abre no nível ${abre === Infinity ? '(nunca)' : abre}`);
  }
  return out;
}
function premioExiste(D, item) {
  const tem = (r) => obj(r) && obj(r.itens) && r.itens[item] > 0;
  return D.missoes.vizinho.some((mi) => tem(mi.recompensa)) || Object.values(D.niveis.recompensas).some(tem) || progressoDe(D).dias.some((d) => tem(d.recompensa) || tem(d.primeiraVolta));
}
// tudo que pede material nos dados: [{ item, n, nivel, onde (para a mensagem) }]
export function pedidosDeMaterial(D) {
  const out = [];
  const de = (itens, nivel, onde) => { for (const k in itens || {}) if (itens[k] > 0) out.push({ item: k, n: itens[k], nivel, onde }); };
  for (const c of Object.values(D.construcoes)) {
    if (c.custo && !c.inicial) de(c.custo.itens, c.nivel || 1, `construcoes.json "${c.id}"`);
    for (const a of c.ampliacoes || []) if (a && a.custo) de(a.custo.itens, a.nivel || 1, `construcoes.json "${c.id}" (ampliação "${a.nome}")`);
    const r = c.reforma;
    if (obj(r) && obj(r.custo)) de(r.custo.itens, r.nivel || 1, `construcoes.json "${c.id}" (reforma)`);
  }
  for (const r of Object.values(receitasDe(D).todas)) de(r.entra, Math.max(r.nivel, (D.construcoes[r.onde] || {}).nivel || 1), `receitas.json "${r.id}"`);
  // preparar terra nova no campo (regras.json "campo", sistemas/campo.js): o adubo de uma fileira, a partir do nível em
  // que o limite do campo passa do inicial
  const C = regrasDoCampo(D), cresce = C.limite.find((e) => C.limite.length && e.casas > C.limite[0].casas);
  if (C.item && C.aduboPorCasa > 0 && cresce) de({ [C.item]: Math.ceil(C.aduboPorCasa * C.fileira - 1e-9) }, cresce.nivel, 'regras.json "campo" (preparar a terra)');
  return out;
}
