// Lê animais.json e a parte de regras.json que fala de trato (tudo já em memória) e entrega no formato da lógica.
// Os números são da economia; aqui só se confere o formato e se preenche o que é opcional.
//   animais[id] = { id, nome, familia: 'producao' | 'trabalho' | 'estimacao', abrigo (id da construção, ou null),
//                   preco: { ouro, cash }, nivel, come: { item: n }, comida (o item que come, ou null),
//                   porcoes (quanto come por ciclo), bebe (porções de água por ciclo), cicloSeg, xp, descricao, especial,
//                   ...e o que mais vier no arquivo (efeito, exige: são da frente dos animais de trabalho e de estimação) }
//   os de produção trazem ainda: produto, rende, acumula, ferramenta (a FUNÇÃO da ferramenta ou do recipiente de
//                   recolher: 'caixa-de-ovos', 'balde', 'tesoura'), vidaProdutiva (0 = sem fim), fimDeVida: { frigorifico, fazendeiro }
//   trato = { semTratoRende, aguasPorRega }
//   comidaDoAbrigo[id da construção] = o item que enche o cocho daquele abrigo (o que os bichos dali comem)
//   recipienteDoProduto[item] = a função do recipiente em que aquele produto é recolhido ('ovo' → 'caixa-de-ovos')
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const obj = (v) => v && typeof v === 'object' && !Array.isArray(v);
export const FAMILIAS_DE_ANIMAL = ['producao', 'trabalho', 'estimacao'];

export function prepararAnimais(bruto, itens, construcoes, erro, aviso) {
  const animais = {}, comidaDoAbrigo = {};
  const R = obj(bruto.regras) && obj(bruto.regras.animais) ? bruto.regras.animais : {};
  const trato = {
    semTratoRende: R.semTratoRende >= 0 && R.semTratoRende <= 1 ? R.semTratoRende : 0.5,
    aguasPorRega: R.aguasPorRega >= 1 ? Math.round(R.aguasPorRega) : 4,
  };
  // a função de ferramenta que o nome pede: o próprio nome, se algum item faz esse papel; ou o papel do item com esse id
  const funcaoDe = (nome) => {
    if (!nome) return null;
    for (const it of Object.values(itens)) if (it.funcao === nome) return nome;
    return itens[nome] && itens[nome].funcao ? itens[nome].funcao : null;
  };

  if (obj(bruto.animais)) for (const [id, a] of Object.entries(bruto.animais)) {
    if (id.startsWith('_') || id === 'nota') continue;
    const onde = `animal "${id}"`;
    if (!obj(a)) { erro('animais.json', `${onde} não é um objeto`); continue; }
    if (!FAMILIAS_DE_ANIMAL.includes(a.familia)) aviso('animais.json', `${onde}: família desconhecida "${a.familia}"`);
    let abrigo = typeof a.abrigo === 'string' && a.abrigo ? a.abrigo : null;
    if (abrigo && !construcoes[abrigo]) { erro('animais.json', `${onde}: o abrigo "${abrigo}" não existe em construcoes.json`); abrigo = null; }
    else if (abrigo && construcoes[abrigo].tipo !== 'abrigo') aviso('animais.json', `${onde}: a construção "${abrigo}" não é do tipo "abrigo"`);
    const come = {};
    let comida = null, porcoes = 0;
    if (obj(a.come)) for (const [k, n] of Object.entries(a.come)) {
      if (!itens[k]) { erro('animais.json', `${onde}: come "${k}", que não existe em itens.json`); continue; }
      if (n > 0) { come[k] = n; porcoes += n; if (!comida) comida = k; }
    }
    if (Object.keys(come).length > 1) aviso('animais.json', `${onde}: come mais de um item; o cocho só leva "${comida}"`);
    const P = obj(a.preco) ? a.preco : {};
    const n = {
      ...a, id, nome: a.nome || id, familia: typeof a.familia === 'string' ? a.familia : '', abrigo,
      preco: { ouro: P.ouro > 0 ? P.ouro : 0, cash: P.cash > 0 ? P.cash : 0 },
      nivel: num(a.nivel) ? a.nivel : 1, come, comida, porcoes: comida ? come[comida] : 0, bebe: a.bebe > 0 ? a.bebe : 0,
      cicloSeg: a.cicloSeg > 0 ? a.cicloSeg : 0, xp: num(a.xp) ? a.xp : 0, descricao: a.descricao || '', especial: !!a.especial,
    };
    if (n.familia === 'producao') {
      if (!itens[a.produto]) { erro('animais.json', `${onde}: o produto "${a.produto}" não existe em itens.json`); continue; }
      if (!(n.cicloSeg > 0)) { erro('animais.json', `${onde}: animal de produção precisa de "cicloSeg" maior que zero`); continue; }
      n.rende = a.rende > 0 ? a.rende : 1;
      n.acumula = a.acumula >= 1 ? Math.round(a.acumula) : 1;
      n.ferramenta = funcaoDe(a.ferramenta);
      if (a.ferramenta && !n.ferramenta) aviso('animais.json', `${onde}: nenhum item de itens.json faz o papel de "${a.ferramenta}"; o produto se recolhe com a mão`);
      n.vidaProdutiva = a.vidaProdutiva >= 1 ? Math.round(a.vidaProdutiva) : 0;
      const F = obj(a.fimDeVida) ? a.fimDeVida : {};
      n.fimDeVida = { frigorifico: F.frigorifico > 0 ? F.frigorifico : 0, fazendeiro: F.fazendeiro > 0 ? F.fazendeiro : 0 };
    }
    animais[id] = n;
    if (abrigo && comida) {
      if (comidaDoAbrigo[abrigo] && comidaDoAbrigo[abrigo] !== comida) aviso('animais.json', `${onde}: come "${comida}", mas o cocho de "${abrigo}" já leva "${comidaDoAbrigo[abrigo]}" (vale o primeiro)`);
      else comidaDoAbrigo[abrigo] = comida;
    }
  }
  // o produto que se recolhe num recipiente próprio (ovo na caixa, leite no balde): produto → função do recipiente
  const recipienteDoProduto = {};
  for (const a of Object.values(animais)) {
    if (a.familia === 'producao' && a.ferramenta && Object.values(itens).some((it) => it.tipo === 'recipiente' && it.funcao === a.ferramenta)) recipienteDoProduto[a.produto] = a.ferramenta;
  }
  return { animais, trato, comidaDoAbrigo, recipienteDoProduto };
}
