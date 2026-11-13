// Lê o que a frente das terras usa: os obstáculos de terras.json, as árvores de arvores.json e o desgaste de
// regras.json (tudo já em memória), e entrega no formato da lógica. Os números são da economia; aqui só se confere
// o formato e se preenche o que é opcional.
//   obstaculos[tipo]   = { id, nome, ferramenta, resistencia, forcaMinima, da: { item: n }, chance, xp }
//   arvores[id]        = { id, nome, muda, fruto, cresceSeg, safraSeg, rende, xp, nivel, espacamento, acumula }
//   arvoreDaMuda[item] = id da árvore que a muda planta
//   desgaste           = { rendeQuandoGasta, avisoEm, consertoFracao }
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const obj = (v) => v && typeof v === 'object' && !Array.isArray(v);

// o que vale quando terras.json não diz nada sobre um obstáculo (os dados pequenos dos testes, por exemplo)
const PADRAO = {
  mato: { nome: 'Mato', ferramenta: 'foice', resistencia: 1, forcaMinima: 1 },
  toco: { nome: 'Toco', ferramenta: 'machado', resistencia: 3, forcaMinima: 1 },
  pedra: { nome: 'Pedra', ferramenta: 'picareta', resistencia: 3, forcaMinima: 1 },
  mata: { nome: 'Árvore do mato', ferramenta: 'machado', resistencia: 8, forcaMinima: 2 },
};

export function prepararTerras(bruto, itens, erro, aviso) {
  // ---------- obstáculos ----------
  const obstaculos = {}, O = obj(bruto.terras) && obj(bruto.terras.obstaculos) ? bruto.terras.obstaculos : {};
  for (const id of Object.keys(PADRAO)) {
    const o = obj(O[id]) ? O[id] : {}, p = PADRAO[id], da = {};
    if (obj(o.da)) for (const [k, n] of Object.entries(o.da)) {
      if (!itens[k]) { aviso('terras.json', `obstáculo "${id}": o item "${k}" não existe em itens.json`); continue; }
      if (n > 0) da[k] = Math.round(n);
    }
    obstaculos[id] = {
      id, nome: o.nome || p.nome, ferramenta: o.ferramenta || p.ferramenta,
      resistencia: o.resistencia >= 1 ? Math.round(o.resistencia) : p.resistencia,
      forcaMinima: o.forcaMinima >= 1 ? o.forcaMinima : p.forcaMinima,
      da, chance: num(o.chance) ? Math.max(0, Math.min(1, o.chance)) : 1, xp: num(o.xp) ? o.xp : 0,
    };
  }

  // ---------- árvores ----------
  const arvores = {}, arvoreDaMuda = {};
  if (obj(bruto.arvores)) for (const [id, a] of Object.entries(bruto.arvores)) {
    if (id.startsWith('_') || id === 'nota' || !obj(a)) continue;
    const onde = `árvore "${id}"`;
    if (!itens[a.muda]) { erro('arvores.json', `${onde}: a muda "${a.muda}" não existe em itens.json`); continue; }
    if (!itens[a.fruto]) { erro('arvores.json', `${onde}: o fruto "${a.fruto}" não existe em itens.json`); continue; }
    if (!(a.cresceSeg > 0) || !(a.safraSeg > 0)) { erro('arvores.json', `${onde}: "cresceSeg" e "safraSeg" têm de ser maiores que zero`); continue; }
    if (itens[a.muda].tipo !== 'muda') aviso('arvores.json', `${onde}: o item "${a.muda}" não é do tipo "muda"`);
    arvores[id] = {
      ...a, id, nome: a.nome || id, rende: a.rende >= 1 ? Math.round(a.rende) : 1, xp: num(a.xp) ? a.xp : 0,
      nivel: num(a.nivel) ? a.nivel : 1, espacamento: a.espacamento >= 1 ? Math.round(a.espacamento) : 1,
      acumula: a.acumula >= 1 ? Math.round(a.acumula) : 1,
    };
    if (arvoreDaMuda[a.muda]) aviso('arvores.json', `${onde}: a muda "${a.muda}" já é da árvore "${arvoreDaMuda[a.muda]}"`);
    arvoreDaMuda[a.muda] = id;
  }

  // ---------- desgaste ----------
  const G = obj(bruto.regras) && obj(bruto.regras.desgaste) ? bruto.regras.desgaste : {};
  const desgaste = {
    rendeQuandoGasta: G.rendeQuandoGasta > 0 && G.rendeQuandoGasta <= 1 ? G.rendeQuandoGasta : 0.67,
    avisoEm: G.avisoEm > 0 && G.avisoEm < 1 ? G.avisoEm : 0.1,
    consertoFracao: G.consertoFracao > 0 ? G.consertoFracao : 0.3,
  };
  return { obstaculos, arvores, arvoreDaMuda, desgaste };
}
