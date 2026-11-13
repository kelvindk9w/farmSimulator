// Lê construcoes.json (já em memória) e entrega no formato que a lógica usa: dados.construcoes[id].
// Os números são da economia; aqui só se confere o formato e se preenche o que é opcional.
//   { id, nome, tipo, onde, casas: [l, p], nivel, descricao, inicial, bloqueia, plano,
//     custo: { ouro, cash, itens } | null, obraSeg, exige: [id], limite (0 = sem limite), xp,
//     ampliacoes: [{ nome, nivel, custo: { ouro, cash, itens }, cash, obraSeg, xp, ...o que muda }],
//     ...e o que mais vier no arquivo (vagas, cocho, bebedouro, fila, guarda, capacidade, interior, efeito) }

export const TIPOS_DE_CONSTRUCAO = ['abrigo', 'industria', 'armazem', 'util', 'movel', 'decoracao'];
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const obj = (v) => v && typeof v === 'object' && !Array.isArray(v);

function custoDe(c, itens, erro, onde) {
  if (!obj(c)) return null;
  const out = { ouro: c.ouro > 0 ? c.ouro : 0, cash: c.cash > 0 ? c.cash : 0, itens: {} };
  if (obj(c.itens)) for (const [k, n] of Object.entries(c.itens)) {
    if (!itens[k]) { erro('construcoes.json', `${onde}: o material "${k}" não existe em itens.json`); continue; }
    if (n > 0) out.itens[k] = Math.round(n);
  }
  return out;
}

export function prepararConstrucoes(bruto, itens, erro, aviso) {
  const out = {};
  if (!obj(bruto.construcoes)) return out; // sem o arquivo o jogo abre; só não há o que construir
  for (const [id, c] of Object.entries(bruto.construcoes)) {
    if (id.startsWith('_') || id === 'nota') continue;
    const onde = `construção "${id}"`;
    if (!obj(c)) { erro('construcoes.json', `${onde} não é um objeto`); continue; }
    if (!TIPOS_DE_CONSTRUCAO.includes(c.tipo)) aviso('construcoes.json', `${onde}: tipo desconhecido "${c.tipo}"`);
    const casas = Array.isArray(c.casas) && c.casas.length === 2 && c.casas[0] >= 1 && c.casas[1] >= 1 ? [Math.round(c.casas[0]), Math.round(c.casas[1])] : [1, 1];
    const n = {
      ...c, id, nome: c.nome || id, tipo: c.tipo || 'util', onde: c.onde === 'celeiro' ? 'celeiro' : 'fazenda', casas,
      nivel: num(c.nivel) ? c.nivel : 1, descricao: c.descricao || '', inicial: !!c.inicial,
      bloqueia: c.bloqueia !== false, plano: !!c.plano, // plano = calçamento: fica rente ao chão e não tapa nada
      custo: custoDe(c.custo, itens, erro, onde), obraSeg: c.obraSeg > 0 ? c.obraSeg : 0,
      exige: Array.isArray(c.exige) ? c.exige.filter((x) => typeof x === 'string') : [],
      limite: c.limite >= 1 ? Math.round(c.limite) : 0, xp: num(c.xp) ? c.xp : 0,
      ampliacoes: [],
    };
    if (Array.isArray(c.ampliacoes)) c.ampliacoes.forEach((a, k) => {
      if (!obj(a)) return;
      n.ampliacoes.push({ ...a, nome: a.nome || `${n.nome} ${k + 2}`, nivel: num(a.nivel) ? a.nivel : 1, custo: custoDe(a.custo, itens, erro, `${onde}, ampliação ${k + 1}`) || { ouro: 0, cash: 0, itens: {} }, cash: a.cash > 0 ? a.cash : 0, obraSeg: a.obraSeg > 0 ? a.obraSeg : 0, xp: num(a.xp) ? a.xp : 0 });
    });
    out[id] = n;
  }
  for (const c of Object.values(out)) {
    for (const e of c.exige) if (!out[e]) erro('construcoes.json', `construção "${c.id}": exige "${e}", que não existe`);
    if (c.interior && obj(c.interior)) for (const mv of c.interior.moveis || []) if (!out[mv.id]) erro('construcoes.json', `construção "${c.id}": o móvel inicial "${mv.id}" não existe`);
  }
  return out;
}
