// Os textos de "Onde conseguir?": o cartão das fontes de um material, a ficha do que falta, a fala do Seu Tonho e o
// aviso dos prêmios que dizem para que o material serve. Entram na tabela T de ui/textos.js.
import { T, numero } from '../textos.js';

const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
// "o galinheiro", "a bancada": o artigo sai do fim da primeira palavra do nome
const FEMININO = /a$|ã$|[çs]ão$|ade$/i;
const art = (nome) => (FEMININO.test(String(nome || '').split(' ')[0]) ? 'a' : 'o');
const o = (nome) => `${art(nome)} ${minus(nome)}`;
const de = (nome) => `d${o(nome)}`; // "do cachorro", "da bancada"
// o plural do nome do item: "tábuas", "pregos", "cartelas vazias", "rações"
function plural(nome) {
  const pl = (s) => (/ão$/.test(s) ? s.slice(0, -2) + 'ões' : /[aeiouáéíóú]$/.test(s) ? s + 's' : /[rz]$/.test(s) ? s + 'es' : /l$/.test(s) ? s.slice(0, -1) + 'is' : s + 's');
  const p = minus(nome).split(' ');
  return p.length === 2 && /[ao]$/.test(p[1]) ? `${pl(p[0])} ${pl(p[1])}` : [pl(p[0]), ...p.slice(1)].join(' ');
}
const qtd = (n, nome) => `${numero(n)} ${n === 1 ? minus(nome) : plural(nome)}`;
// o nome da reforma já é um verbo ("Reformar a casa", "Montar a banca"); se não for ("Cerca nova"), leva artigo
const ehVerbo = (nome) => /^[a-zà-ú]+(ar|er|ir)$/i.test(String(nome || '').split(' ')[0]);
const juntar = (l) => (l.length <= 1 ? l.join('') : `${l.slice(0, -1).join(', ')} e ${l[l.length - 1]}`);
const nomeI = (D, id) => (D && D.itens[id] ? D.itens[id].nome : id || '');
const nomeC = (D, id) => (D && D.construcoes[id] ? D.construcoes[id].nome : id || '');
const LIMPAR = {
  toco: 'Cortar tocos com o machado',
  mata: 'Derrubar árvores do mato',
  pedra: 'Quebrar pedras com a picareta',
  mato: 'Roçar o mato com a foice',
};
const UM = { toco: 'cada toco', mata: 'cada árvore', pedra: 'cada pedra', mato: 'uma moita sim, outra não' };

T.fontes = {
  onde: 'Onde conseguir?',
  titulo: (D, item) => (item ? `Onde conseguir ${minus(nomeI(D, item))}` : 'Onde conseguir os materiais'),
  pede: 'A missão pede',
  falta: (n) => `falta ${numero(n)}`,
  temEFalta: (tem, falta) => `Você tem ${numero(tem)}. Falta${falta > 1 ? 'm' : ''} ${numero(falta)}.`,
  ficha: (D, item, tem, precisa) => `${nomeI(D, item)}: tem ${numero(tem)} de ${numero(precisa)}`,
  fechar: 'Fechar',
  abre: (n) => `abre no nível ${n}`,
  // uma linha por fonte: { titulo, info, botao }
  loja: { titulo: (aba) => `Loja → ${aba}`, info: (preco) => `${numero(preco)} de ouro cada`, botao: 'Comprar' },
  limpar: {
    titulo: (f) => LIMPAR[f.obstaculo] || `Limpar ${minus(f.nome)}`,
    da: (f, D, item) => `${UM[f.obstaculo] || 'cada um'} dá ${qtd(f.da, nomeI(D, item))}`,
    restam: (n) => (n === 1 ? 'resta 1 na sua terra' : `${numero(n)} na sua terra`),
    semFerramenta: (D, f, nivel) => `precisa ${de(nomeI(D, f.ferramentaItem) || f.ferramenta)}${nivel ? ` (nível ${nivel})` : ''}`,
    acabou: 'acabaram na sua terra',
    terraNova: (t) => `acabaram na sua terra; há ${numero(t.n)} no lote ${t.nome}${t.nivel ? ` (nível ${t.nivel})` : ''}`,
    botao: 'Mostrar', terras: 'Terras',
  },
  receita: {
    titulo: (D, f) => nomeC(D, f.onde),
    info: (D, f, item) => `${juntar(Object.entries(f.entra).map(([k, n]) => qtd(n, nomeI(D, k))))} viram ${qtd(f.sai, nomeI(D, item))}`,
    construa: (D, f, nivel) => `construa ${o(nomeC(D, f.onde))}${nivel ? ` (nível ${nivel})` : ''}`,
    abrir: 'Abrir', construir: 'Construir',
  },
  bicho: {
    titulo: (D, f) => `Mimo ${de(String(D.animais[f.animal].nome).replace(/ caramelo$/i, ''))}`,
    tem: 'um afago por dia; às vezes ele traz',
    adote: (D, f, nivel) => `adote ${o(String(D.animais[f.animal].nome).replace(/ caramelo$/i, '')).replace(/^o /, 'um ').replace(/^a /, 'uma ')}${nivel ? ` (nível ${nivel})` : ''}`,
    mostrar: 'Mostrar', adotar: 'Adotar',
  },
  premios: {
    titulo: 'Prêmios',
    missao: (mi, agora) => `missão “${mi.titulo}”: +${numero(mi.n)}${mi.nivel > agora ? ` (nível ${mi.nivel})` : ''}`,
    nivel: (p) => `nível ${p.nivel}: +${numero(p.n)}`,
    dia: (d) => `presente do dia ${d.dia}: +${numero(d.n)}${d.hoje ? ' (hoje!)' : d.daqui === 1 ? ' (amanhã)' : ` (em ${d.daqui} dias)`}`,
    missoes: 'Missões', abrir: 'Abrir',
  },
  // a fala do Seu Tonho na primeira vez que falta o material (sem "comoConseguir" nos dados: esta, montada)
  tonho: (D, item) => `Precisa de ${minus(nomeI(D, item))}?`,
  falaPadrao: (D, item, fontes) => `${nomeI(D, item)} se consegue assim: ${juntar(fontes.map((f) => minus(f)))}.`,
  saiaDoCeleiro: 'Saia do celeiro para ver',
  semAlvo: 'Não achei nenhum perto agora',
  // para que o material do prêmio serve: "+10 pregos e +4 tábuas: servem para o estábulo e o galinheiro"
  uso: (x) => (x.tipo === 'construcao' ? o(x.nome) : x.tipo === 'reforma' ? (ehVerbo(x.nome) ? minus(x.nome) : o(x.nome)) : x.tipo === 'ampliacao' ? `ampliar ${o(x.nome)}` : x.tipo === 'campo' ? 'ampliar o campo' : `fazer ${minus(x.nome)}`),
  nota: (D, itens, usos) => {
    const partes = Object.entries(itens).map(([k, n]) => `+${qtd(n, nomeI(D, k))}`), um = partes.length === 1 && Object.values(itens)[0] === 1;
    return `${juntar(partes)}: ${um ? 'serve' : 'servem'} para ${juntar(usos.map(T.fontes.uso))}`;
  },
};
