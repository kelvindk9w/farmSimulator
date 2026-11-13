// As metas: a missão do vizinho vira um "projeto" (construir, comprar bicho, produzir, limpar...), e os projetos
// sabem conseguir o que falta: material (limpar o terreno, a bancada, a loja), ouro (a reserva: a fazenda trabalha
// enquanto junta), construção exigida, vaga no abrigo. Sem missão valendo (ou esperando o nível), a fazenda investe
// no que mais rende: bicho para encher o abrigo, a indústria seguinte, prateleira, pomar, lote, vaga de fila.
// Também aqui: o "quer" (o que guardar em vez de vender, e o que plantar), refeito a cada 2 segundos.
import { X } from './jogo.mjs';
import { passo, nota, evitado, evitar, naFazenda, nivel, comando, cmd, livre, tem, querer, fazenda, filaTem } from './contexto.mjs';
import { zona, campoAlvo, sementesLiberadas } from './lavoura.mjs';
import { fontesDe, limpavel, quantosHa, limpar, lotePossivel, comprarLote, plantarMuda, arvoresDe } from './terras.mjs';
import { def, temPronta, quantas, emObra, obraFalta, construir, ampliar, montarMovel } from './construir.mjs';
import { abrigos, querDosAnimais, comprarAnimal, encherAbrigos, quantosAnimais } from './animais.mjs';
import { planejar, industrias, comprarVaga, receitas, conseguivel } from './industria.mjs';
import { querDosPedidos } from './pedidos.mjs';
import { especieDoPapel, bicho, apetrechoQueFalta, ararComBoi, cavalgar } from './trabalho.mjs';

const um = (v) => (Array.isArray(v) ? v[0] : v);
const culturaDoItem = (J, item) => Object.values(J.D.culturas).find((c) => c.produto === item) || null;
const daLoja = (J, item) => { const it = J.I[item]; return !!it && it.compra > 0 && it.nivel <= nivel(J) && J.D.loja.ouro.includes(item); };
export const margem = (J) => 40 + 15 * nivel(J);

// quanto deste item já vem das indústrias (na fila ou na saída)
function naIndustria(J, item) {
  let n = 0;
  if (!X.industria) return 0;
  for (const e of industrias(J)) {
    const st = X.industria.estadoDaIndustria(J.m, e);
    if (st) for (const id of [...st.fila, ...st.saida]) { const r = receitas(J).todas[id]; if (r && r.sai[item]) n += r.sai[item]; }
  }
  return n;
}
const receitaPara = (J, item) => (receitas(J).porItem[item] || []).find((r) => r.nivel <= nivel(J)) || null;
const industriaDe = (J, tipo) => industrias(J).find((e) => e.tipo === tipo && X.construcao.estaPronta(e)) || null;

// ---------- conseguir um item (material, embalagem, produto de receita, colheita) ----------
// Devolve um passo ou null (com a nota do que espera). "fundo" limita a receita dentro de receita.
export function obter(J, item, n, fundo = 0) {
  const it = J.I[item];
  if (!it) return null;
  querer(J.querExtra, item, n); // o que a obra (ou a receita) vai usar fica guardado
  const falta = n - tem(J, item) - naIndustria(J, item);
  if (falta <= 0) return null;
  if (culturaDoItem(J, item)) return nota(J, `esperando colher ${it.nome.toLowerCase()}`);
  const compra = daLoja(J, item);
  const rico = compra && J.P.ouro - J.reserva >= 4 * falta * it.compra + margem(J);
  // do terreno (madeira, pedra, fibra): de graça e com experiência
  const fontes = fontesDe(J, item).filter((t) => limpavel(J, t));
  if (fontes.length && !rico) { const s = limpar(J, fontes); if (s) return s; }
  // de receita (tábua da bancada...)
  const r = receitaPara(J, item);
  if (r && !(rico && it.compra > 0)) {
    const e = industriaDe(J, r.onde);
    if (e) {
      const st = X.industria.estadoDaIndustria(J.m, e), vagas = X.industria.vagasDaFila(J.m, e);
      const livres = Math.max(0, vagas - (st ? st.fila.length : 0));
      const vezes = Math.min(Math.ceil(falta / r.n), Math.max(1, livres));
      for (const i in r.entra) { const s = obter(J, i, r.entra[i] * vezes, fundo + 1); if (s) return s; }
      if (livres > 0) {
        const p = X.industria.podeProduzir(J.m, e, r.id);
        if (p.ok && !evitado(J, 'produzir:' + e.id)) { evitar(J, 'produzir:' + e.id, 2); return cmd(J, { tipo: 'produzir', entidade: e.id, receita: r.id }, 2, 'produzir'); }
      }
      if (!compra) return nota(J, `esperando a ${def(J, r.onde).nome.toLowerCase()} fazer ${it.nome.toLowerCase()}`);
    } else if (fundo < 2 && !compra) {
      const s = projetoConstrucao(J, r.onde);
      if (s) return s;
    }
  }
  if (compra) {
    if (evitado(J, 'compra:' + item)) return null;
    const q = Math.min(falta, Math.floor((J.P.ouro - (fundo ? 0 : 0)) / it.compra));
    if (q > 0) return passo(J, 'comprar', { item, n: q });
    return nota(J, `juntando ouro para comprar ${it.nome.toLowerCase()}`);
  }
  // fruta, produto de bicho: vem com o tempo
  return nota(J, `esperando ter ${it.nome.toLowerCase()}`);
}
// quanto custaria em ouro comprar o material que falta (para a reserva); o que sai do terreno conta só se acabou lá
function custoDoQueFalta(J, itens) {
  let v = 0;
  for (const k in itens || {}) {
    const falta = itens[k] - tem(J, k);
    if (falta <= 0) continue;
    const fontes = fontesDe(J, k).filter((t) => limpavel(J, t));
    if (fontes.length && quantosHa(J, fontes) > 0) continue;
    if (k === 'tabua' && quantosHa(J, fontesDe(J, 'madeira').filter((t) => limpavel(J, t))) > 0) continue;
    v += falta * (J.I[k].compra || 0);
  }
  return v;
}

// ---------- projetos ----------
// construção: as exigidas antes, depois material, ouro e lugar. "prep" = ainda espera o nível: só junta material.
export function projetoConstrucao(J, id, prep) {
  const d = def(J, id);
  if (!d || !X.construcao) return null;
  if (temPronta(J, id) && d.limite === 1) return null;
  if (emObra(J, id)) return nota(J, `obra de ${d.nome.toLowerCase()}: falta ${Math.ceil(obraFalta(J, id) / 60)} min`);
  for (const ex of d.exige || []) if (!temPronta(J, ex)) return emObra(J, ex) ? nota(J, `obra de ${def(J, ex).nome.toLowerCase()}`) : projetoConstrucao(J, ex, prep);
  const espera = d.nivel > nivel(J);
  const custo = d.custo || {};
  J.reserva = Math.max(J.reserva, (custo.ouro || 0) + custoDoQueFalta(J, custo.itens));
  J.reservaPara = d.nome;
  for (const k in custo.itens || {}) { const s = obter(J, k, custo.itens[k]); if (s) return s; }
  if (espera || prep) return nota(J, `${d.nome}: espera o nível ${d.nivel}`);
  if (J.P.ouro < (custo.ouro || 0)) return nota(J, `juntando ouro para ${d.nome.toLowerCase()} (${custo.ouro})`);
  if (X.posses.oQueFalta(J.m, custo.itens || {})) return nota(J, `juntando material para ${d.nome.toLowerCase()}`);
  return construir(J, id);
}
// ampliação de uma construção (vaga no abrigo, baia do estábulo, celeiro maior)
export function projetoAmpliacao(J, e) {
  const a = X.construcao.proximaAmpliacao(J.m, e), d = def(J, e.tipo);
  if (!a) return null;
  if (e.obraAte > 0 || e.ampliaAte > 0) return nota(J, `ampliação de ${d.nome.toLowerCase()} em obra`);
  if (a.cash > 0 && !(a.custo && a.custo.ouro > 0)) return nota(J, `${d.nome}: a ampliação só sai com cash`);
  J.reserva = Math.max(J.reserva, (a.custo.ouro || 0) + custoDoQueFalta(J, a.custo.itens));
  J.reservaPara = `${d.nome} (${a.nome})`;
  for (const k in a.custo.itens || {}) { const s = obter(J, k, a.custo.itens[k]); if (s) return s; }
  if (a.nivel > nivel(J)) return nota(J, `${d.nome}: a ampliação pede o nível ${a.nivel}`);
  if (J.P.ouro < a.custo.ouro) return nota(J, `juntando ouro para ${a.nome.toLowerCase()} (${a.custo.ouro})`);
  return ampliar(J, e);
}
// reforma do que veio com a fazenda (o começo humilde: poço, caixote, casa, cerca): o nível, o material, o ouro;
// depois ela vai até lá e martela (o preço sai na martelada)
export function projetoReforma(J, de, prep) {
  if (!X.comeco || !comando(J, 'reformar')) return null;
  const r = X.comeco.reformas(J.m).find((x) => x.de === de);
  if (!r) return null;
  if (r.obra > 0) return nota(J, `obra de ${r.nome.toLowerCase()}: falta ${Math.ceil(r.obra / 60)} min`);
  const custo = r.custo || {};
  J.reserva = Math.max(J.reserva, (custo.ouro || 0) + custoDoQueFalta(J, custo.itens));
  J.reservaPara = r.nome;
  for (const k in custo.itens || {}) { const s = obter(J, k, custo.itens[k]); if (s) return s; }
  if (prep || r.nivel > nivel(J)) return nota(J, `${r.nome}: espera o nível ${r.nivel}`);
  if (J.P.ouro < (custo.ouro || 0)) return nota(J, `juntando ouro para ${r.nome.toLowerCase()} (${custo.ouro})`);
  if (X.posses.oQueFalta(J.m, custo.itens || {})) return nota(J, `juntando material para ${r.nome.toLowerCase()}`);
  if (filaTem(J, 'reformarConstrucao') || evitado(J, 'reformar:' + de)) return null;
  return cmd(J, { tipo: 'reformar', entidade: r.alvo }, 3, 'reformar:' + de);
}
// bicho: o abrigo (construir ou ampliar), o ouro, a compra
export function projetoAnimal(J, especie) {
  const d = J.D.animais[especie];
  if (!d || !X.animais) return null;
  if (d.nivel > nivel(J)) return nota(J, `${d.nome}: pede o nível ${d.nivel}`);
  if (d.abrigo) {
    const prontos = X.animais.abrigosProntos(J.m, d.abrigo);
    if (!prontos.length) return projetoConstrucao(J, d.abrigo);
    if (!X.animais.abrigoComVaga(J.m, d.abrigo)) return projetoAmpliacao(J, prontos[0]);
  }
  J.reserva = Math.max(J.reserva, d.preco.ouro); J.reservaPara = d.nome;
  if (J.P.ouro < d.preco.ouro) return nota(J, `juntando ouro para ${d.nome.toLowerCase()} (${d.preco.ouro})`);
  return comprarAnimal(J, especie) || (J.porqueAnimal ? nota(J, `${d.nome}: ${J.porqueAnimal.motivo}`) : null);
}
// item da loja (ferramenta, recipiente, muda): junta o ouro e compra
export function projetoItem(J, item, n = 1) {
  const it = J.I[item];
  if (!it) return null;
  if (it.nivel > nivel(J)) return nota(J, `${it.nome}: pede o nível ${it.nivel}`);
  if (X.loja && X.loja.jaTem && (it.tipo === 'ferramenta' || it.tipo === 'recipiente') && X.loja.jaTem(J.m, item)) return null;
  J.reserva = Math.max(J.reserva, it.compra * n); J.reservaPara = it.nome;
  if (J.P.ouro < it.compra * n) return nota(J, `juntando ouro para ${it.nome.toLowerCase()} (${it.compra * n})`);
  if (evitado(J, 'compra:' + item)) return null;
  return passo(J, 'comprar', { item, n });
}

// ---------- a missão da vez ----------
// J.meta = { id, evento, f, falta, espera (nível), semente, arar, cesto, tratar, recolher, reservados, receitas }
export function lerMissao(J) {
  const a = X.missoes ? X.missoes.missaoAtual(J.m) : null;
  if (!a) return (J.meta = null);
  const o = a.missao.objetivo, f = o.filtro || {};
  const M = { id: a.missao.id, evento: o.evento, f, falta: a.n - a.conta, espera: a.esperaNivel || 0, receitas: [], reservados: {} };
  if (!M.espera) {
    if (o.evento === 'plantou' && !um(f.item)) { const c = J.D.culturas[um(f.cultura)]; if (c) M.semente = c.semente; }
    if (o.evento === 'plantou' && um(f.item) && J.D.culturaDaSemente[um(f.item)]) M.semente = um(f.item);
    if (o.evento === 'regou' && f.cultura) { const c = J.D.culturas[um(f.cultura)]; if (c) M.semente = c.semente; }
    if (o.evento === 'colheu') { const c = f.item ? culturaDoItem(J, um(f.item)) : J.D.culturas[um(f.cultura)]; if (c) M.semente = c.semente; }
    if (o.evento === 'arou' && f.com === undefined) M.arar = true;
    if (o.evento === 'guardou') M.cesto = 'guardar';
    if (o.evento === 'vendeu') M.cesto = 'vender';
    if (o.evento === 'tratou') M.tratar = true;
    if (o.evento === 'recolheu') M.recolher = true;
  }
  if (o.evento === 'produziu' && f.item) {
    M.receitas.push({ item: um(f.item), n: M.falta + tem(J, um(f.item)), prio: 3 }); M.reservados[um(f.item)] = M.falta;
    // os ingredientes também ficam guardados (os 12 ovos da dúzia não vão para a banca junto com o resto do cesto)
    const r = receitaPara(J, um(f.item)) || (receitas(J).porItem[um(f.item)] || [])[0];
    if (r) for (const i in r.entra) M.reservados[i] = (M.reservados[i] || 0) + r.entra[i] * Math.max(1, Math.ceil(M.falta / r.n));
  }
  return (J.meta = M);
}

// o passo da missão; null = nada a fazer por ela agora (a fazenda segue)
export function passoDaMissao(J) {
  const M = J.meta;
  if (!M) return null;
  const f = M.f, prep = !!M.espera;
  switch (M.evento) {
    case 'construiu': case 'montou': return projetoConstrucao(J, um(f.construcao), prep);
    case 'comprou': {
      if (prep) {
        // adianta o que não pede nível: a obra do abrigo do bicho, o material
        if (f.animal) { const d = J.D.animais[um(f.animal)]; if (d && d.abrigo && !temPronta(J, d.abrigo)) return projetoConstrucao(J, d.abrigo, true); }
        return null;
      }
      if (f.classe === 'semente') {
        const s = sementesLiberadas(J).sort((a, b) => a.compra - b.compra)[0];
        if (!s) return null;
        const n = Math.min(M.falta, Math.floor(J.P.ouro / s.compra));
        return n > 0 && !evitado(J, 'compra:' + s.id) ? passo(J, 'comprar', { item: s.id, n }) : nota(J, 'juntando ouro para as sementes da missão');
      }
      if (f.item) { const it = J.I[um(f.item)]; return it && it.tipo === 'muda' ? plantarOuComprarMuda(J, it.id) : projetoItem(J, um(f.item)); }
      if (f.animal) return projetoAnimal(J, um(f.animal));
      if (f.familia) {
        const lista = Object.values(J.D.animais).filter((d) => d.familia === um(f.familia) && d.preco.ouro > 0 && d.nivel <= nivel(J)).sort((a, b) => a.preco.ouro - b.preco.ouro);
        return lista.length ? projetoAnimal(J, lista[0].id) : nota(J, 'nenhum bicho dessa família à venda neste nível');
      }
      if (f.lote) { const l = J.D.terras.lotes.find((x) => x.id === um(f.lote)); if (l) { J.reserva = Math.max(J.reserva, l.preco); J.reservaPara = l.nome || l.id; } return comprarLote(J, um(f.lote)); }
      return null;
    }
    case 'limpou': {
      if (prep) return null;
      const tipos = f.obstaculo === undefined ? null : [].concat(f.obstaculo);
      const s = limpar(J, tipos);
      if (s) return s;
      // sem a ferramenta: compra
      if (tipos) for (const t of tipos) {
        const O = J.D.obstaculos[t];
        if (O && !limpavel(J, t)) { const item = ferramentaParaComprar(J, O.ferramenta, O.forcaMinima); if (item) return projetoItem(J, item); }
      }
      if (tipos && quantosHa(J, tipos) === 0) { J.faltaObstaculo = tipos.join(','); return nota(J, `não há mais ${tipos.join('/')} na terra dela: comprar lote`); }
      return null;
    }
    case 'produziu': {
      const item = um(f.item);
      const r = receitaPara(J, item) || (receitas(J).porItem[item] || [])[0];
      if (!r) return null;
      if (!industriaDe(J, r.onde)) return projetoConstrucao(J, r.onde, prep || r.nivel > nivel(J));
      if (prep) return null;
      // os ingredientes: o "quer" já leva a lavoura; o resto (embalagem, produto de outra receita) vem por obter
      for (const i in r.entra) { const s = obter(J, i, r.entra[i] * Math.max(1, Math.ceil(M.falta / r.n))); if (s) return s; }
      return null; // o plano das indústrias põe na fila quando houver
    }
    case 'tratou': {
      const tipo = um(f.abrigo);
      if (tipo && !temPronta(J, tipo)) return projetoConstrucao(J, tipo, prep);
      if (prep) return null;
      const esp = Object.values(J.D.animais).find((d) => d.abrigo === tipo && d.preco.ouro > 0 && d.nivel <= nivel(J));
      if (esp && !J.m.animais.lista.some((a) => a.especie === esp.id)) return projetoAnimal(J, esp.id);
      return null; // animais.tratar enche (com a meta, enche mesmo pela metade)
    }
    case 'recolheu': {
      const item = um(f.item), d = Object.values(J.D.animais).find((x) => x.produto === item && x.preco.ouro > 0);
      if (!d) return null;
      if (prep) return d.abrigo && !temPronta(J, d.abrigo) ? projetoConstrucao(J, d.abrigo, true) : null;
      const tem0 = quantosAnimais(J, d.id);
      if (tem0 === 0 || (tem0 < M.falta && X.animais.abrigoComVaga(J.m, d.abrigo) && J.P.ouro >= d.preco.ouro + margem(J))) { const s = projetoAnimal(J, d.id); if (s || tem0 === 0) return s; }
      // o recipiente ou a ferramenta de recolher
      const it = X.producao ? X.producao.itemDaFuncao(J.m, d.ferramenta) : null;
      if (it && !X.loja.jaTem(J.m, it)) return projetoItem(J, it);
      return null;
    }
    case 'plantou': {
      const item = um(f.item);
      if (item && J.D.arvoreDaMuda && J.D.arvoreDaMuda[item]) return prep ? null : plantarOuComprarMuda(J, item);
      return null; // a lavoura planta a semente da meta
    }
    case 'entregou': return null; // pedidos.mjs (o "quer" já guarda o que o quadro pede)
    case 'conversou': {
      // o Seu Tonho: tocar nele (ela vai até ele e conversam)
      if (prep || !J.m.locais.fazenda.porId.vizinho || filaTem(J, 'conversar') || evitado(J, 'conversar')) return null;
      evitar(J, 'conversar', 5);
      return passo(J, 'entidade', { id: 'vizinho' });
    }
    case 'reformou': return projetoReforma(J, um(f.construcao), prep);
    case 'arou': {
      if (f.com !== 'boi') return null;
      const esp = especieDoPapel(J, 'arar');
      if (!esp) return null;
      if (!bicho(J, 'arar')) return projetoAnimal(J, esp);
      const falta = apetrechoQueFalta(J, 'arar');
      if (falta) return projetoItem(J, falta);
      return prep ? null : ararComBoi(J);
    }
    case 'cavalgou': {
      const esp = especieDoPapel(J, 'montaria');
      if (!esp) return null;
      if (!bicho(J, 'montaria')) return projetoAnimal(J, esp);
      const falta = apetrechoQueFalta(J, 'montaria');
      if (falta) return projetoItem(J, falta);
      return prep ? null : cavalgar(J, true);
    }
    default: return null; // arou, encheu, regou, colheu, vendeu, guardou: a lavoura cuida (com a meta)
  }
}
function plantarOuComprarMuda(J, muda) {
  const it = J.I[muda];
  if (it.nivel > nivel(J)) return nota(J, `${it.nome}: pede o nível ${it.nivel}`);
  if ((J.P.bolsa[muda] || 0) <= 0) J.reserva = Math.max(J.reserva, it.compra);
  return plantarMuda(J, muda, true);
}
// a ferramenta mais barata da função com força bastante (para limpar)
function ferramentaParaComprar(J, funcao, forca) {
  let melhor = null;
  for (const it of Object.values(J.I)) if (it.funcao === funcao && (it.forca || 1) >= forca && it.compra > 0 && (!melhor || it.compra < melhor.compra)) melhor = it;
  return melhor ? melhor.id : null;
}

// ---------- o "quer": o que guardar e o que plantar ----------
export function atualizarQuer(J) {
  if (J.m.agora < J.querEm) return;
  J.querEm = J.m.agora + 2000;
  const Q = {}, R = [];
  const M = J.meta;
  if (M) for (const r of M.receitas) R.push(r);
  querDosPedidos(J, Q, R);
  querDosAnimais(J, Q);
  // material de obra que sai de receita (tábua): a bancada faz. O que a missão pediu fica guardado por 2 min
  // (ela só passa pela missão de tempos em tempos; sem isso a receita "por conta" come a madeira comprada para a obra)
  const V = (J.querVelho = J.querVelho || {});
  for (const k in J.querExtra) V[k] = { n: J.querExtra[k], ate: J.m.agora + 120000 };
  for (const k in V) { if (V[k].ate < J.m.agora) delete V[k]; else querer(Q, k, V[k].n); }
  J.plano = planejar(J, R, Q);
  // a missão de colher e a de plantar: a semente dela
  J.metaSemente = M && !M.espera ? M.semente || null : null;
  J.metaArar = !!(M && !M.espera && M.arar);
  J.metaCesto = M && !M.espera ? M.cesto || null : null;
  J.metaTratar = !!(M && !M.espera && M.tratar);
  J.metaRecolher = !!(M && !M.espera && M.recolher);
  J.reservados = M ? M.reservados : {};
  J.quer = Q;
  J.querExtra = {};
}

// ---------- investir, sem missão (ou enquanto ela espera o nível) ----------
const OBRAS = ['bancada-de-carpintaria', 'galinheiro', 'bancada-de-embalar', 'moinho', 'cozinha', 'curral', 'laticinio', 'aprisco'];
const POMAR = { bananeira: 4, laranjeira: 4, goiabeira: 3 };
export function investir(J) {
  const mg = margem(J), m = J.m;
  // o projeto livre em andamento continua até sair (ou dar 20 min sem andar)
  if (J.projeto && m.agora - J.projeto.desde < 1200000) {
    const s = J.projeto.fazer();
    if (s) return s;
    if (J.projeto.feito()) J.projeto = null;
    else return null;
  }
  J.projeto = null;
  const novo = (rotulo, fazer, feito) => { J.projeto = { rotulo, fazer, feito, desde: m.agora }; J.S && (J.S.projetos[rotulo] = (J.S.projetos[rotulo] || 0) + 1); return fazer(); };
  // 1. completar os abrigos com bicho de produção
  let s = encherAbrigos(J, mg);
  if (s) return s;
  // 2. a obra seguinte que já dá para pagar (ouro e o que falta de material comprado), com folga
  for (const id of OBRAS) {
    const d = def(J, id);
    if (!d || d.nivel > nivel(J) || quantas(J, id) >= (d.limite || 1) || (d.exige || []).some((e) => !temPronta(J, e))) continue;
    const custo = (d.custo.ouro || 0) + custoDoQueFalta(J, d.custo.itens);
    if (livre(J) < custo + mg) continue;
    return novo('obra: ' + d.nome, () => projetoConstrucao(J, id), () => quantas(J, id) > 0);
  }
  // 2b. a reforma seguinte (o começo humilde: poço, caixote, casa, cerca), quando o bolso deixa com folga
  if (X.comeco) for (const r of X.comeco.reformas(m)) {
    if (r.obra > 0 || r.nivel > nivel(J)) continue;
    const custo = (r.custo.ouro || 0) + custoDoQueFalta(J, r.custo.itens);
    if (livre(J) < custo + mg) continue;
    return novo('reforma: ' + r.nome, () => projetoReforma(J, r.de), () => !X.comeco.reformas(m).some((x) => x.de === r.de && !(x.obra > 0)));
  }
  // 3. prateleira quando o celeiro anda cheio
  const cap = J.P.celeiro.capacidade, ocup = X.posses.noCeleiro(m);
  if (temPronta(J, 'bancada-de-carpintaria') && (ocup >= cap * 0.8 || J.celeiroApertado) && !J.celeiroSemLugar) {
    const id = nivel(J) >= (def(J, 'prateleira-reforcada') || { nivel: 99 }).nivel ? 'prateleira-reforcada' : 'prateleira-simples', d = def(J, id);
    if (d && livre(J) >= d.custo.ouro + custoDoQueFalta(J, d.custo.itens) + mg / 2) { const antes = quantas(J, id); J.celeiroApertado = false; return novo('prateleira', () => projetoConstrucao(J, id), () => quantas(J, id) > antes); }
  }
  // 4. pomar
  if (X.arvores) for (const id in POMAR) {
    const a = J.D.arvores[id];
    if (!a) continue;
    const it = J.I[a.muda];
    if (!it || it.nivel > nivel(J) || arvoresDe(J, id) >= POMAR[id] || livre(J) < it.compra * 3 + mg) continue;
    s = plantarMuda(J, a.muda, true);
    if (s) return s;
  }
  // 5. lote: quando a lavoura ou as obras pedem terra, ou quando sobra muito ouro
  const lp = lotePossivel(J);
  if (lp && lp.s.estado !== 'nivel' && lp.s.estado !== 'exige') {
    const precisa = !!J.semLugar || !!J.faltaObstaculo || zona(J).length - J.zonaObst < campoAlvo(J) + 4;
    if (livre(J) >= lp.lote.preco + mg * (precisa ? 1 : 4)) return comprarLote(J, lp.lote.id);
  }
  // 6. vaga de fila nas indústrias que andam cheias
  s = comprarVaga(J, mg * 3);
  if (s) return s;
  // 7. ampliar abrigo cheio (mais vagas), com muita folga
  for (const { e, est } of abrigos(J)) {
    if (est.ocupadas < est.vagas) continue;
    const a = X.construcao.proximaAmpliacao(m, e);
    if (!a || a.nivel > nivel(J) || !(a.custo && a.custo.ouro > 0)) continue;
    if (e.tipo === 'estabulo') continue; // as baias do estábulo são para os bichos de trabalho (missões)
    if (livre(J) < a.custo.ouro * 2 + custoDoQueFalta(J, a.custo.itens) + mg) continue;
    return novo('ampliar: ' + def(J, e.tipo).nome, () => projetoAmpliacao(J, e), () => X.construcao.proximaAmpliacao(m, e) !== a);
  }
  return null;
}
