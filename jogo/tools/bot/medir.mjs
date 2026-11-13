// O que se mede e o relato: ouve os eventos do jogo e soma; no fim imprime (texto, tabela curta ou JSON).
import { X } from './jogo.mjs';

const soma = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };

export function criarMedidas() {
  return {
    jogado: 0, ausente: 0, sessoes: 0, toques: 0,
    niveis: [], missoes: [], ganho: {}, gasto: {}, cash: {}, cashGasto: {}, recusas: {}, parado: {}, colhido: {}, comprado: {},
    conta: {}, construido: [], ampliado: [], animais: { comprou: {}, vendeu: {} }, produziu: {}, limpou: {}, pedidos: { entregues: 0, ouro: 0, trocados: 0, trocasPagas: 0 },
    idas: { poco: 0, celeiro: 0, banca: 0 }, dias: [], linha: [], projetos: {}, semOuro: 0, semOuroPor: {}, xpPor: {}, preso: [], porqueSemente: {},
    material: { abertas: {}, feitas: {}, lista: [] }, // a espera de material de cada obra (querObra em metas.mjs)
  };
}

// t(): o relógio relativo (s) do bot; agora(): o dia do jogo
export function ouvir(m, S, rel) {
  m.eventos.ouvir('*', (d, tipo) => {
    d = d || {};
    switch (tipo) {
      case 'subiuDeNivel': S.niveis.push([rel(), d.nivel, S.jogado]); break;
      case 'missaoConcluida': S.missoes.push([rel(), d.id, S.jogado]); break;
      case 'ganhouOuro': soma(S.ganho, d.origem || '?', d.n); break;
      case 'gastouOuro': soma(S.gasto, d.destino || '?', d.n); break;
      case 'ganhouCash': soma(S.cash, d.origem || '?', d.n); break;
      case 'gastouCash': soma(S.cashGasto, d.destino || '?', d.n); break;
      case 'ganhouXp': soma(S.xpPor, d.origem || '?', d.n); break;
      case 'faltou': soma(S.recusas, `falta: ${d.motivo || '?'}${d.acao ? ` (${d.acao})` : ''}`); break;
      case 'colheu': soma(S.colhido, d.item, d.n); break;
      case 'comprou':
        if (d.animal) soma(S.animais.comprou, d.animal, 1);
        else if (d.lote) S.construido.push([rel(), 'lote ' + d.lote]);
        else if (d.item) soma(S.comprado, d.item, d.n || 1);
        break;
      case 'construiu': S.construido.push([rel(), d.construcao]); break; // o móvel também emite "montou": conta uma vez
      case 'comecouObra': soma(S.conta, 'obras começadas'); break;
      case 'ampliou': S.ampliado.push([rel(), `${d.construcao} (degrau ${d.degrau || '?'})`]); break;
      case 'produziu': soma(S.produziu, d.item, d.n); break;
      case 'entregou': S.pedidos.entregues++; S.pedidos.ouro += d.ouro || 0; break;
      case 'trocouPedido': S.pedidos.trocados++; if (!d.gratis) S.pedidos.trocasPagas++; break;
      case 'vendeuAnimal': soma(S.animais.vendeu, d.animal, 1); break;
      case 'limpou': soma(S.limpou, d.obstaculo, 1); break;
      case 'encheu': if (!d.doBarril) S.idas.poco++; break;
      case 'guardou': S.idas.celeiro++; soma(S.conta, 'guardou'); break;
      case 'pegou': S.idas.celeiro++; soma(S.conta, 'pegou'); break;
      case 'pegouFerramenta': soma(S.conta, 'pegouFerramenta'); break;
      case 'vendeuTudo': S.idas.banca++; break;
      case 'arou': soma(S.conta, d.com === 'boi' ? 'arou com o boi' : 'arou'); break;
      case 'plantou': soma(S.conta, d.arvore ? 'plantou muda' : 'plantou'); break;
      case 'regou': soma(S.conta, 'regou'); break;
      case 'aspersorRegou': soma(S.conta, 'aspersor regou'); break;
      case 'socorro': soma(S.conta, 'socorro do vizinho'); break;
      case 'tratou': soma(S.conta, 'tratou ' + (d.parte || '')); break;
      case 'recolheu': soma(S.conta, 'recolheu'); soma(S.colhido, d.item, d.n || 1); break;
      case 'deuFruta': break;
      case 'consertou': soma(S.conta, 'consertou'); break;
      case 'ferramentaGasta': soma(S.conta, 'ferramenta gastou'); break;
      case 'recompensa': soma(S.conta, 'presente do dia'); break;
      case 'conquista': soma(S.conta, 'conquista recebida'); break;
      case 'cavalgou': soma(S.conta, 'cavalgou'); break;
      case 'afagou': soma(S.conta, 'afagou'); break;
      case 'ganhouMimo': soma(S.conta, 'mimo'); break;
      case 'entregou ': break;
      default: break;
    }
  });
}

// A cada segundo: as obras que ela quer e que já têm todo o material em mãos saem da lista de espera.
// "ultimo" é o material que chegou por último (o que segurou a obra).
export function esperaDeMaterial(m, S, rel) {
  const E = S.material;
  for (const k in E.abertas) {
    const a = E.abertas[k];
    let falta = null;
    for (const i in a.itens) if ((m.posses.bolsa[i] || 0) + (m.posses.celeiro.itens[i] || 0) + (m.posses.cesto.itens[i] || 0) < a.itens[i]) { falta = i; break; }
    if (falta) { a.ultimo = falta; continue; }
    delete E.abertas[k];
    E.feitas[k] = 1;
    E.lista.push({ obra: a.nome, nivel: a.nivel, jogado: Math.round(S.jogado - a.desde), relogio: Math.round(rel() - a.desdeRel), dia: Math.floor(a.desdeRel / 86400) + 1, faltavam: a.faltam, ultimo: Object.keys(a.faltam).length ? a.ultimo || Object.keys(a.faltam)[0] : null });
  }
}
// o resumo da espera de material: soma, as maiores e as que ainda esperam no fim
export function relatoDoMaterial(S, rel) {
  const E = S.material, out = [];
  const L = E.lista.slice(), soma = L.reduce((s, x) => s + x.jogado, 0), com = L.filter((x) => x.jogado > 0);
  out.push(`Espera de material (do "quer construir" ao "tem o material", em tempo jogado): ${L.length} obras, ${com.length} esperaram; soma ${hm(soma)}.`);
  for (const x of L.slice().sort((a, b) => b.jogado - a.jogado).slice(0, 10)) if (x.jogado > 0) out.push(`  ${hm(x.jogado).padStart(14)} jogado, ${hm(x.relogio).padStart(12)} de relógio  ${x.obra} (nível ${x.nivel}, dia ${x.dia}; faltava ${Object.entries(x.faltavam).map(([k, v]) => v + ' ' + k).join(', ')}; segurou: ${x.ultimo || '-'})`);
  const ab = Object.values(E.abertas);
  if (ab.length) out.push('  ainda esperando no fim: ' + ab.map((a) => `${a.nome} (falta ${a.ultimo || Object.keys(a.faltam)[0] || '?'}, desde ${hm(S.jogado - a.desde)} jogados)`).join('; '));
  return out.join('\n');
}

// ---------- o relato ----------
const hm = (s) => { s = Math.round(s); const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), mi = Math.floor((s % 3600) / 60); return d ? `${d}d ${String(h).padStart(2, '0')}h${String(mi).padStart(2, '0')}` : h ? `${h} h ${String(mi).padStart(2, '0')} min` : mi ? `${mi} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`; };
const pc = (a, b) => (b > 0 ? ((100 * a) / b).toFixed(0) + '%' : '-');
const lista = (o, f = (k, v) => `${k} ${Math.round(v)}`) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => f(k, v)).join(', ') || 'nada';
const total = (o) => Object.values(o).reduce((x, y) => x + y, 0);
export { hm };

export function relato(J, S, cfg) {
  const m = J.m, P = m.posses, p = m.personagem, C = p.conta, out = [];
  const L = (s = '') => out.push(s);
  const ativo = C.andando + C.correndo + C.agindo + C.parada;
  L(`Jogador automático: perfil ${cfg.perfil}, ${cfg.horas} h de relógio (${hm(S.jogado)} jogando em ${S.sessoes} sessão(ões), ${hm(S.ausente)} com o jogo fechado). Rodou em ${cfg.rodou.toFixed(1)} s.`);
  L(`Nível ${m.progresso.nivel} (xp ${m.progresso.xp}), ouro ${P.ouro}, cash ${P.cash} (o bot não gasta cash).`);
  L('');
  L('Por dia (fim do dia):');
  L('  dia  nível    xp    ouro  missões  jogado');
  for (const d of S.dias) L(`  ${String(d.dia).padStart(3)}  ${String(d.nivel).padStart(5)} ${String(d.xp).padStart(5)} ${String(d.ouro).padStart(7)} ${String(d.missoes).padStart(8)}  ${hm(d.jogado)}`);
  L('');
  L('Níveis (relógio desde o começo · tempo jogado): ' + (S.niveis.map(([t, n, j]) => `${n} aos ${hm(t)} (${hm(j)})`).join(' · ') || 'nenhum'));
  L(`Missões cumpridas (${S.missoes.length}): ` + (S.missoes.map(([t, id, j]) => `${id} ${hm(t)} (${hm(j)})`).join(' · ') || 'nenhuma'));
  const a = X.missoes ? X.missoes.missaoAtual(m) : null;
  L('Missão no fim: ' + (a ? `${a.missao.id} (${a.conta}/${a.n}${a.esperaNivel ? `, espera o nível ${a.esperaNivel}` : ''})` + (J.notas.length ? ` · ${J.notas[0]}` : '') : 'nenhuma (acabaram as que o jogo sabe cumprir)'));
  if (J.reservaPara) L(`Juntando ouro para: ${J.reservaPara} (reserva ${J.reserva}).`);
  L('');
  L(`Ouro: ganhou ${total(S.ganho)} (${lista(S.ganho)}); gastou ${total(S.gasto)} (${lista(S.gasto)}).`);
  L(`  por hora jogada: ganhou ${(total(S.ganho) / Math.max(1e-9, S.jogado / 3600)).toFixed(0)}, gastou ${(total(S.gasto) / Math.max(1e-9, S.jogado / 3600)).toFixed(0)}`);
  L(`Cash: ganhou ${total(S.cash)} (${lista(S.cash)}); gastou ${total(S.cashGasto)}.`);
  L(`Experiência por origem: ${lista(S.xpPor)}.`);
  L('');
  L('Construiu: ' + (S.construido.map(([t, id]) => `${id} (${hm(t)})`).join(', ') || 'nada') + (S.ampliado.length ? '. Ampliou: ' + S.ampliado.map(([t, id]) => `${id} (${hm(t)})`).join(', ') : '') + '.');
  L(`Animais: comprou ${lista(S.animais.comprou)}; vendeu no fim da vida ${lista(S.animais.vendeu)}; tem ${m.animais ? m.animais.lista.length : 0}.`);
  L(`Receitas (itens retirados): ${lista(S.produziu)}.`);
  L(`Pedidos: entregou ${S.pedidos.entregues} (${S.pedidos.ouro} de ouro); trocou ${S.pedidos.trocados} (${S.pedidos.trocasPagas} sem ser a grátis).`);
  L(`Colheu e recolheu: ${lista(S.colhido)}. Comprou: ${lista(S.comprado)}.`);
  L(`Limpou: ${lista(S.limpou)}.`);
  if (J.zona) { const loc = J.m.locais.fazenda; let pl = 0; for (const i of J.zona) if (loc.plantas[i]) pl++; L(`Lavoura no fim: ${J.aradas || 0} casas aradas, ${pl} plantadas (a terra própria que serve de lavoura: ${J.zona.length - (J.zonaObst || 0)} casas). Lotes: ${J.m.terras.lotes.length}. Árvores: ${J.m.arvores ? J.m.arvores.todas.length : 0}.`); }
  L('');
  L(`O tempo dela (${hm(ativo)}): andando ${pc(C.andando, ativo)}, correndo ${pc(C.correndo, ativo)}, trabalhando ${pc(C.agindo, ativo)}, parada ${pc(C.parada, ativo)}. Andou ${Math.round(C.distancia)} casas. Toques: ${S.toques} (${(S.toques / Math.max(1, S.jogado / 60)).toFixed(1)} por minuto jogado).`);
  L(`Idas ao poço: ${S.idas.poco} (${S.conta.regou ? (S.conta.regou / Math.max(1, S.idas.poco)).toFixed(1) : 0} regas por ida). Idas ao celeiro: ${S.idas.celeiro}. Vendas na banca: ${S.idas.banca}.`);
  L(`Contas: ${lista(S.conta)}.`);
  const parado = Object.entries(S.parado).filter(([, v]) => v >= 1).sort((x, y) => y[1] - x[1]);
  L('');
  L('Onde o jogador ficou sem ter o que fazer' + (parado.length ? ` (${pc(parado.reduce((s, [, v]) => s + v, 0), S.jogado)} do tempo jogado):` : ': em nenhum momento.'));
  for (const [k, v] of parado.slice(0, 20)) L(`  ${hm(v).padStart(14)}  ${k}`);
  if (S.semOuro > 1) L(`Tempo jogado com a meta da vez travada por ouro: ${hm(S.semOuro)} (${lista(S.semOuroPor, (k, v) => `${k} ${hm(v)}`)}).`);
  L(relatoDoMaterial(S));
  const rec = Object.entries(S.recusas).sort((x, y) => y[1] - x[1]);
  if (rec.length) { L(''); L('Recusas do jogo (toques que não valeram e faltas no meio da fila): ' + rec.slice(0, 25).map(([k, v]) => `${k} ×${v}`).join(', ')); }
  if (S.preso.length) { L(''); L('Presos (o bicho que não segue mais; ela cercada): ' + S.preso.map(([t, txt]) => `${txt} (visto aos ${hm(t)})`).join(' · ')); }
  const des = Object.entries(J.desligou);
  if (des.length || cfg.fora.length || cfg.desligadas.length) {
    L('');
    L('Habilidades fora:');
    for (const f of cfg.fora) L('  ' + f);
    for (const f of cfg.desligadas) L('  ' + f);
    for (const [k, v] of des) L(`  ${k}: quebrou (${v})`);
  }
  if (cfg.grave) { L(''); L('GRAVE: ' + cfg.grave); }
  return out.join('\n');
}

export function resumo(S, fim = '') {
  const out = ['dia  nível     ouro  missões'];
  for (const d of S.dias) out.push(`${String(d.dia).padStart(3)}  ${String(d.nivel).padStart(5)} ${String(d.ouro).padStart(8)} ${String(d.missoes).padStart(8)}`);
  if (fim) out.push(fim);
  return out.join('\n');
}
