// Os textos da frente de construção (construir, mudar de lugar, celeiro por dentro). Entram na tabela T de ui/textos.js.
import { T, tempo, numero } from '../textos.js';

const nomeC = (D, id) => (D && D.construcoes && D.construcoes[id] ? D.construcoes[id].nome : id || '');
const nomeI = (D, id) => (D && D.itens[id] ? D.itens[id].nome : id || '');
const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

Object.assign(T.acoes, {
  colocarConstrucao: (d, D) => 'Construir',
  montarMovel: () => 'Montar o móvel',
  martelar: () => 'Dar o acabamento',
});

Object.assign(T.motivos, {
  'ver-construcao': (d, D) => nomeC(D, d && d.construcao),
  'em-obra': (d, D) => `${nomeC(D, d && d.construcao)} em obra${d && d.seg > 0 ? ': falta ' + tempo(d.seg) : ''}`,
  'nao-existe': () => 'Isso não existe mais',
  'nao-constroi': () => 'Isso já vem com a fazenda',
  'so-no-celeiro': () => 'Móvel se monta dentro do celeiro: entre nele',
  'so-na-fazenda': () => 'Isso se constrói lá fora, na fazenda',
  exige: (d, D) => `Precisa ter ${minus(nomeC(D, d && d.construcao))} pronta antes`,
  limite: (d) => (d && d.limite === 1 ? 'Você já tem uma: só cabe uma na fazenda' : `Você já tem o máximo (${d ? d.limite : ''})`),
  'so-com-cash': () => 'Este enfeite é da loja de cash',
  'sem-cash': (d) => `Falta cash${d && d.falta ? ' (' + numero(d.falta) + ')' : ''}`,
  'falta-material': (d, D) => `Falta ${minus(nomeI(D, d && d.item))}: tem ${d ? d.tem : 0} de ${d ? d.precisa : 0}`,
  'lugar-ocupado': () => 'Este lugar está ocupado',
  'tem-planta': () => 'Tem planta aqui: colha antes',
  'na-porta': () => 'Na frente da porta não',
  'fecha-caminho': (d, D) => (d && d.construcao ? `Assim não daria mais para chegar em ${minus(nomeC(D, d.construcao))}` : 'Assim fecharia a passagem: deixe um vão ou ponha uma porteira'),
  'sem-acesso': () => 'Não daria para chegar até ela aí',
  'nao-guarda': () => 'Isso não se guarda: só muda de lugar',
  'sem-ampliacao': () => 'Não há mais o que ampliar',
});
T.motivos['fora-do-mapa'] = T.motivos['fora-do-mapa'] || (() => '');

// ---------- o celeiro por dentro ----------
T.acoes.entrarNoCeleiro = () => 'Entrar no celeiro';
Object.assign(T.motivos, {
  // (troca a frase do M1: agora o celeiro cheio tem duas saídas)
  'celeiro-cheio': () => 'As prateleiras estão cheias: venda na banca ou monte outra prateleira dentro do celeiro',
  'movel-em-uso': (d) => (d && d.guarda === 'ferramentas' ? 'Tem ferramenta pendurada: este suporte fica' : 'O que está guardado não cabe nos outros móveis: esvazie antes'),
  'bau-cheio': (d) => `Os baús estão cheios${d ? ' (' + d.tem + ' de ' + d.cabe + ')' : ''}: monte outro baú dentro do celeiro`,
});

// ---------- os painéis de construir e o modo de escolher o lugar ----------
T.botoes.construir = 'Construir';
T.construir = {
  titulo: 'Construir',
  categorias: { abrigo: 'Abrigos', industria: 'Indústrias', armazem: 'Armazém', util: 'Úteis', cerca: 'Cercas', decoracao: 'Decoração' },
  vazio: 'Nada para construir aqui ainda.',
  escolher: 'Escolher o lugar', colocar: 'Colocar', guardada: (n) => `guardada: ${n}`, tem: (n, lim) => (lim ? `tem ${n} de ${lim}` : `tem ${n}`),
  nivel: (n) => `Nível ${n}`, obra: (seg) => `obra de ${tempo(seg)}`, naHora: 'fica pronto na hora',
  casas: (c) => `${c[0]} × ${c[1]} casas`,
  precisaDe: (nome) => `Precisa da ${minus(nome)}`,
  soDentro: 'Monte dentro do celeiro', soFora: 'Só lá fora, na fazenda', entrar: 'Entrar no celeiro', sair: 'Sair do celeiro',
  cash: (n) => `${numero(n)} cash, na loja de cash`,
  arrumar: 'Mudar coisas de lugar', arrumarInfo: 'Toque no que quer mudar',
  semBancada: 'Comece pela bancada de carpintaria: é nela que se constrói o resto.',
};
T.colocar = {
  arraste: 'Arraste para o lugar e confirme', arrasteSeq: 'Toque ou arraste para colocar vários', bom: 'Aqui serve',
  confirmar: 'Confirmar', cancelar: 'Cancelar', pronto: 'Pronto', girar: 'Girar', guardar: 'Guardar', mover: 'Mudar de lugar',
  escolha: 'Toque no que quer mudar de lugar', nadaAqui: 'Aqui não há nada seu para mudar', naoMuda: 'Isso não muda de lugar',
  teclas: 'Setas movem · Enter confirma · Esc cancela', teclasGira: 'Setas movem · R gira · Enter confirma · Esc cancela',
  cada: (n) => `${numero(n)} cada`, postas: (n) => (n === 1 ? '1 colocada' : `${n} colocadas`), gratis: 'de graça',
};
T.cartao = {
  titulo: 'Construção', sobre: 'Sobre', emObra: 'Em obra', falta: (seg) => `Falta ${tempo(seg)}`, ampliando: (nome) => `Ampliando: ${nome}`,
  ampliar: 'Ampliar', proxima: 'Próxima ampliação', mover: 'Mudar de lugar', guardar: 'Guardar', nivel: (n) => `nível ${n}`,
  guarda: { produtos: (n) => `Guarda ${numero(n)} produtos`, materiais: (n) => `Guarda ${numero(n)} materiais`, ferramentas: (n) => `${n} ganchos de ferramenta` },
  vagas: (n) => `${n} vagas`, fila: (n) => `Fila de ${n}`, guardou: (nome) => `${nome} foi para o depósito: recoloque quando quiser, sem pagar`,
  celeiro: 'Toque no celeiro para guardar o cesto. Entre para montar prateleiras e baús.',
};
T.ganhos.construiu = (d, D) => `${nomeC(D, d.construcao)}: ${d.classe === 'movel' ? 'montagem concluída' : 'obra concluída'}!`;
T.ganhos.ampliou = (d) => `${d.nome}: pronto!`;
T.celeiro = {
  titulo: 'O celeiro por dentro', produtos: 'Produtos nas prateleiras', materiais: 'Materiais nos baús', ferramentas: 'Ferramentas no suporte',
  cheio: 'cheio', semMovel: (o) => `sem ${o}: vale o espaço do começo`,
  dica: 'Toque no celeiro para guardar o cesto. Entre nele para montar prateleiras (produtos), baús (materiais) e suportes (ferramentas).',
  entrar: 'Entrar', sair: 'Sair',
};
