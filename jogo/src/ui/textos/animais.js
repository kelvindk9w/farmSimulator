// Os textos da frente dos animais (a base e os de produção). Entram na tabela T de ui/textos.js.
import { T, tempo, numero } from '../textos.js';

const nomeI = (D, id) => (D && D.itens[id] ? D.itens[id].nome : id || '');
const nomeC = (D, id) => (D && D.construcoes && D.construcoes[id] ? D.construcoes[id].nome : id || 'abrigo');
const nomeA = (D, id) => (D && D.animais && D.animais[id] ? D.animais[id].nome : id || 'bicho');
const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
// "a galinha", "o boi": o artigo sai do fim da primeira palavra do nome (os nomes vêm dos dados)
const FEMININO = /a$|ã$|[çs]ão$|ade$/i;
export const artigo = (nome) => (FEMININO.test(String(nome || '').split(' ')[0]) ? 'a' : 'o');
const o = (nome) => `${artigo(nome)} ${minus(nome)}`; // "a galinha"
const O = (nome) => `${artigo(nome).toUpperCase()} ${minus(nome)}`; // "A galinha"
const do_ = (nome) => `d${artigo(nome)} ${minus(nome)}`; // "da galinha", "do curral"
const no = (nome) => `n${artigo(nome)} ${minus(nome)}`; // "no galinheiro"
const um = (nome) => `${artigo(nome) === 'a' ? 'uma' : 'um'} ${minus(nome)}`;
const ela = (nome) => (artigo(nome) === 'a' ? 'ela' : 'ele');
const plural = (n, um_, varios) => (n === 1 ? `1 ${um_}` : `${numero(n)} ${varios}`);

// como cada produto se recolhe: a chave é a função da ferramenta em animais.json ("ferramenta").
//   aviso(d)  o que o Seu Tonho diz quando o primeiro fica pronto;  cheio(d)  o cartão do bicho que espera a coleta
const pronta = (d) => (artigo(d && d.nome) === 'a' ? 'pronta' : 'pronto');
const JEITO = {
  'caixa-de-ovos': {
    recolher: 'Recolher os ovos', gesto: 'recolher', pronto: (n) => plural(n, 'ovo para recolher', 'ovos para recolher'), em: (t) => `Ovo em ${t}`, parou: 'parou de botar', da: 'bota', conta: (n) => plural(n, 'ovo', 'ovos'),
    aviso: () => 'Tem ovo no ninho!', cheio: (d) => `Ninho cheio: recolha os ovos e ${ela(d && d.nome)} volta a botar`,
  },
  balde: {
    recolher: 'Ordenhar', gesto: 'ordenhar', pronto: () => 'Leite para ordenhar', em: (t) => `Leite em ${t}`, parou: 'não dá mais leite', da: 'dá leite', conta: (n) => plural(n, 'balde de leite', 'baldes de leite'),
    aviso: (d) => `${O(d.nome)} está ${pronta(d)} para a ordenha!`, cheio: (d) => `${pronta(d) === 'pronta' ? 'Pronta' : 'Pronto'} para ordenhar`,
  },
  tesoura: {
    recolher: 'Tosquiar', gesto: 'tosquiar', pronto: () => 'Lã para tosquiar', em: (t) => `Lã em ${t}`, parou: 'não dá mais lã', da: 'dá lã', conta: (n) => plural(n, 'lã', 'lãs'),
    aviso: (d) => `A lã ${do_(d.nome)} cresceu!`, cheio: (d) => `Lã crescida: ${pronta(d)} para tosquiar`,
  },
};
const jeitoDe = (d, D) => JEITO[d && d.ferramenta] || {
  recolher: 'Recolher', gesto: 'recolher', pronto: (n) => `${n} × ${minus(nomeI(D, d && d.produto))} para recolher`, em: (t) => `${nomeI(D, d && d.produto)} em ${t}`,
  parou: 'parou de produzir', da: 'produz', conta: (n) => `${n} × ${minus(nomeI(D, d && d.produto))}`,
  aviso: (x) => `${O(x.nome)} tem ${minus(nomeI(D, x.produto))} para recolher!`, cheio: () => 'Esperando: recolha para voltar a produzir',
};
const maiuscula = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const defA = (D, id) => (D && D.animais ? D.animais[id] : null);

Object.assign(T.acoes, {
  abastecerCocho: () => 'Encher o cocho',
  abastecerBebedouro: () => 'Encher o bebedouro',
  recolherOvo: (d) => (d && d.n > 1 ? `Recolher os ${d.n} ovos` : 'Recolher o ovo'),
  ordenhar: () => 'Ordenhar a vaca',
  tosquiar: () => 'Tosquiar a ovelha',
});

Object.assign(T.motivos, {
  'ver-abrigo': (d, D) => `${nomeC(D, d && d.construcao)}: ${d && d.n ? `${d.n} de ${d.vagas} vagas` : 'vazio'}. Toque para cuidar`,
  'ainda-nao': (d, D) => `${O(nomeA(D, d && d.animal))} ainda não chegou ao jogo`,
  'sem-abrigo': (d, D) => `${O(nomeA(D, d && d.animal))} precisa de ${um(nomeC(D, d && d.abrigo))} pronto: construa antes`,
  'abrigo-cheio': (d, D) => `Não há vaga ${no(nomeC(D, d && d.abrigo))}: amplie para caber mais`,
  'sem-cocho': () => 'Este abrigo não tem cocho',
  'cocho-cheio': () => 'O cocho já está cheio',
  'sem-comida': (d, D) => `Falta ${minus(nomeI(D, d && d.item))} para pôr no cocho${D && D.itens[d && d.item] && D.itens[d.item].tipo === 'colheita' ? ': plante e colha' : ': compre na loja'}`,
  'sem-bebedouro': () => 'Este abrigo não tem bebedouro',
  'bebedouro-cheio': () => 'O bebedouro já está cheio',
  'nada-para-recolher': () => 'Ainda não há nada para recolher aqui',
  'falta-de-recolher': (d, D) => `Você precisa de ${um(nomeI(D, d && d.item))} para ${jeitoDe(defA(D, d && d.animal), D).gesto}: compre na loja, em Ferramentas`,
  'recipiente-cheio': (d, D) => `${O(nomeI(D, d && d.item))} está ${artigo(nomeI(D, d && d.item)) === 'a' ? 'cheia' : 'cheio'}: venda na banca ou guarde no celeiro`,
  'abrigo-com-bicho': (d) => (d && d.n === 1 ? 'Tem um bicho morando aqui: não dá para guardar' : 'Tem bichos morando aqui: não dá para guardar'),
  'ainda-produz': (d, D) => `${O(nomeA(D, d && d.animal))} ainda produz: não está na hora`,
  'destino-desconhecido': () => 'Escolha um dos três destinos',
});
// a tesoura de tosquia é ferramenta de cinto: a frase de quem não tem diz onde comprar
{
  const antes = T.motivos['sem-ferramenta'];
  T.motivos['sem-ferramenta'] = (d, D) => (d && d.funcao === 'tesoura' ? 'Você não tem uma tesoura de tosquia: compre na loja, em Ferramentas' : antes(d, D));
}

// bicho especial é da loja de cash (o resto do "so-com-cash" é da frente de construir)
{
  const antes = T.motivos['so-com-cash'];
  T.motivos['so-com-cash'] = (d, D) => (d && d.animal ? `${O(nomeA(D, d.animal))} é da loja de cash` : antes ? antes(d, D) : 'É da loja de cash');
}
// o aviso de compra passa a saber de bicho
{
  const antes = T.ganhos.comprou;
  T.ganhos.comprou = (d, D) => (d && d.animal ? `${nomeA(D, d.animal)} ${artigo(nomeA(D, d.animal)) === 'a' ? 'nova' : 'novo'} na fazenda!` : antes(d, D));
}
Object.assign(T.ganhos, {
  recolheu: (d, D) => `+${d.n} ${nomeI(D, d.item)}`,
  cocho: (d, D) => (d.porcoes > 0 ? `+${d.porcoes} ${minus(nomeI(D, d.item))} no cocho` : 'Cocho cheio'),
  bebedouro: (d) => (d.porcoes > 0 ? 'Água no bebedouro' : 'Bebedouro cheio'),
  temProduto: (d, D) => { const a = defA(D, d.animal); return `${nomeC(D, a && a.abrigo)}: ${minus(jeitoDe(a, D).pronto(d.n))}`; },
  vendeuAnimal: (d, D) => `${O(nomeA(D, d.animal))} foi para ${d.destino === 'frigorifico' ? 'o frigorífico' : 'um fazendeiro'}: +${numero(d.ouro)} ouro${d.sobra > 0 ? `. O que estava no ninho foi para o celeiro` : ''}`,
  aposentou: (d, D) => `${O(nomeA(D, d.animal))} agora é de estimação`,
  fimDeVida: (d, D) => `${O(nomeA(D, d.animal))} ${jeitoDe(defA(D, d.animal), D).parou}. Toque ${no(nomeC(D, (defA(D, d.animal) || {}).abrigo))} para escolher o que fazer`,
  fimDeVidaPerto: (d, D) => `${O(nomeA(D, d.animal))} está ficando ${artigo(nomeA(D, d.animal)) === 'a' ? 'velhinha' : 'velhinho'}: só mais ${jeitoDe(defA(D, d.animal), D).conta(d.restam)}`,
});

T.animais = {
  aba: 'Animais', titulo: 'Animais', vazio: 'Nenhum bicho à venda ainda.',
  abrigo: 'Abrigo',
  // o cartão do bicho na loja
  tem: (n) => `Você tem ${n}`, comprar: 'Comprar', nivel: (n) => `Libera no nível ${n}`,
  precisaDe: (D, abrigo) => `Precisa de ${um(nomeC(D, abrigo))}`, construir: 'Construir', construirAbrigo: (D, abrigo) => `Construir ${o(nomeC(D, abrigo))}`,
  semVaga: (D, abrigo) => `${nomeC(D, abrigo)} sem vaga: amplie`, verAbrigo: 'Ver', verOAbrigo: (D, abrigo) => `Ver ${o(nomeC(D, abrigo))}`,
  soCash: 'Na loja de cash',
  resumo: (d, D) => {
    if (!d || d.familia !== 'producao') return (d && d.descricao) || '';
    const j = jeitoDe(d, D), come = d.comida ? `come ${minus(nomeI(D, d.comida))}` : '';
    return `${j.em(tempo(d.cicloSeg)).replace(' em ', ' a cada ')}${come ? ' · ' + come : ''}`;
  },
  mora: (D, abrigo) => `Mora ${no(nomeC(D, abrigo))}`,

  // o painel do abrigo
  vagas: (n, t) => `${n} de ${t} vagas`, semBicho: (D, d) => `Ainda não mora ninguém aqui. Compre ${um(d ? d.nome : 'bicho')} para começar.`,
  cocho: 'Cocho', bebedouro: 'Água', encher: 'Encher', cheio: 'Cheio',
  nivelDe: (n, cap) => `${n}/${cap}`,
  temComida: (D, item, n) => `Você tem ${numero(n)} × ${minus(nomeI(D, item))}`,
  semComida: (D, item) => `Você não tem ${minus(nomeI(D, item))}${D.itens[item] && D.itens[item].tipo === 'colheita' ? ': plante e colha' : ': compre na loja, em Materiais'}`,
  comRegador: (agua, cap) => `Regador: ${agua}/${cap}`, semRegador: 'Você precisa de um regador',
  recolher: (d, D, n) => `${jeitoDe(d, D).recolher}${n > 1 ? ` (${n})` : ''}`,
  recolherTudo: (n) => `Recolher tudo${n > 0 ? ` (${n})` : ''}`,
  faltaDeRecolher: (D, d, item) => `Para ${jeitoDe(d, D).gesto} falta ${um(nomeI(D, item))}`,
  irComprar: 'Comprar na loja',
  recipienteCheio: (D, item) => `${O(nomeI(D, item))} está ${artigo(nomeI(D, item)) === 'a' ? 'cheia' : 'cheio'}: venda na banca ou guarde no celeiro`,
  cestoCheio: 'O cesto está cheio: venda na banca ou guarde no celeiro',
  comprarBicho: (nome) => `Comprar ${minus(nome)}`,
  semVagas: 'Não há vaga: amplie para caber mais',
  bichos: 'Quem mora aqui', numero: (nome, k) => `${nome} ${k}`,
  // como o bicho está
  em: (d, D, seg) => jeitoDe(d, D).em(tempo(seg)),
  pronto: (d, D, n) => jeitoDe(d, D).pronto(n),
  ninhoCheio: (d, D) => jeitoDe(d, D).cheio(d),
  semTrato: (falta, D, item) => `${falta.comida && falta.agua ? `Sem ${minus(nomeI(D, item))} e sem água` : falta.comida ? `Sem ${minus(nomeI(D, item))}` : 'Sem água'}: produz a metade`,
  semTratoCurto: 'Com fome ou com sede: produz a metade',
  semTratoTrabalho: 'Com fome ou com sede: trabalha pela metade',
  // bicho de trabalho: um de cada basta (só um trabalha)
  umBasta: (nome) => `Você já tem ${um(nome)}: um basta para o serviço`,
  parou: (d, D) => maiuscula(jeitoDe(d, D).parou),
  estimacao: 'De estimação: não produz mais',
  velhinha: (d, D, n) => `Só mais ${jeitoDe(d, D).conta(n)} e ${ela(d ? d.nome : '')} para`,
  destino: 'Escolher o destino', vender: 'Vender',
  aviso: { fome: 'Falta comida no cocho', sede: 'Falta água no bebedouro', fim: 'Um bicho espera você escolher o destino dele' },

  // a próxima ampliação (o cartão é o mesmo da frente de construir)
  ampliar: 'Ampliar', proxima: 'Próxima ampliação', ampliando: (nome) => `Ampliando: ${nome}`, falta: (seg) => `Falta ${tempo(seg)}`,
  cabem: (n) => `passa a caber ${n}`,

  // o fim da vida produtiva: três saídas, sem pressa
  fim: {
    titulo: (d, D) => `${O(d.nome)} ${jeitoDe(d, D).parou}`,
    texto: (d, D, n) => `Ela já deu ${jeitoDe(d, D).conta(n)} e agora descansa. O que você quer fazer? Não tem pressa: ${ela(d.nome)} espera aqui o tempo que for.`.replace(/^Ela/, artigo(d.nome) === 'a' ? 'Ela' : 'Ele'),
    textoEstimacao: (d) => `${O(d.nome)} é de estimação: mora aqui, come e bebe, e não produz mais. Se quiser, ainda pode vender.`,
    frigorifico: 'Vender ao frigorífico', frigorificoInfo: 'Vai embora da fazenda. A vaga fica livre.',
    fazendeiro: 'Vender a um fazendeiro', fazendeiroInfo: 'Vai morar em outra fazenda. A vaga fica livre.',
    estimacao: (d) => `Ficar com ${ela(d.nome)}`, estimacaoInfo: 'Vira bicho de estimação: continua aqui, ocupando a vaga e comendo, sem produzir.',
    depois: 'Decidir depois', manter: (d) => `Continuar com ${ela(d.nome)}`,
    pergunta: (d, destino, ouro) => `Vender ${o(d.nome)} ${destino === 'frigorifico' ? 'ao frigorífico' : 'a um fazendeiro'} por ${numero(ouro)} de ouro?`,
    nota: 'Não dá para desfazer.', sim: (ouro) => `Vender por ${numero(ouro)}`, nao: 'Não vender',
  },

  // o HUD: o que há na caixa de ovos e no balde
  noRecipiente: (D, item) => nomeI(D, item),

  // a volta de uma ausência
  volta: (prontos, semTrato) => {
    const partes = [];
    if (prontos.length) partes.push(`Os bichos trabalharam: ${prontos.join(', ')} esperando você.`);
    if (semTrato.length) partes.push(`${semTrato.map((n, k) => (k ? o(n) : O(n))).join(' e ')} ${semTrato.length > 1 ? 'estão' : 'está'} sem comida ou sem água.`);
    return partes.join(' ');
  },
  esperando: (d, D, n) => jeitoDe(d, D).conta(n),

  // o que o Seu Tonho explica na primeira vez de cada coisa (uma ou duas frases curtas)
  tonho: {
    titulo: { animal: 'Bicho novo!', trato: 'Bem tratado', recolher: 'Tem produto!', levar: 'Muito bem!', 'fim-perto': 'Está ficando velhinha', fim: 'Hora de descansar' },
    animal: (d, D) => `${O(d.nome)} come ${minus(nomeI(D, d.comida))} e bebe água. Toque ${no(nomeC(D, d.abrigo))} e encha o cocho e o bebedouro.`,
    trato: (d, D) => `Com comida e água, ${o(d.nome)} ${jeitoDe(d, D).da} no tempo certo. Se faltar um dos dois, rende só a metade.`,
    recolher: (d, D, tem, item) => (tem
      ? `${jeitoDe(d, D).aviso(d)} Com a Mão, toque ${no(nomeC(D, d.abrigo))} para ${jeitoDe(d, D).gesto}.`
      : `${jeitoDe(d, D).aviso(d)} Para ${jeitoDe(d, D).gesto}, você precisa de ${um(nomeI(D, item))}: compre na loja, em Ferramentas.`),
    levar: (d, D) => `${nomeI(D, d.produto)} se vende na banca ou se guarda no celeiro, junto com a colheita.`,
    'fim-perto': (d, D, n) => `${O(d.nome)} está ficando ${artigo(d.nome) === 'a' ? 'velhinha' : 'velhinho'}: só mais ${jeitoDe(d, D).conta(n)}. Quando parar, você escolhe o que fazer, sem pressa.`,
    fim: (d, D) => `${O(d.nome)} ${jeitoDe(d, D).parou}. Toque ${no(nomeC(D, d.abrigo))} e escolha: vender, ou ficar com ${ela(d.nome)} de estimação.`,
  },
};
export { o as oBicho, O as OBicho, do_ as doBicho, no as noLugar, um as umBicho, jeitoDe };
