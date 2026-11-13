// Todo texto do jogo que não vem dos dados (jogo/dados/*.json) fica aqui. A lógica devolve códigos
// ("regador-vazio") e esta tabela faz a frase; assim a tradução, quando vier, mexe num arquivo só.

const nomeDe = (D, id) => (D && D.itens[id] ? D.itens[id].nome : id || '');
const culturaDe = (D, id) => (D && D.culturas[id] ? D.culturas[id].nome : id || '');
const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const FERRAMENTA = { enxada: 'uma enxada', regador: 'um regador' };

export function tempo(seg) {
  seg = Math.max(0, Math.ceil(seg));
  if (seg < 60) return seg + ' s';
  if (seg < 3600) { const m = Math.floor(seg / 60), s = seg % 60; return s && m < 10 ? `${m} min ${s} s` : `${m} min`; }
  const h = Math.floor(seg / 3600), m = Math.round((seg % 3600) / 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}
export const numero = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const T = {
  titulo: 'Fazenda',
  modos: { mao: 'Mão', enxada: 'Enxada', semear: 'Semear', regar: 'Regar' },
  dicaDoModo: {
    mao: 'Toque no chão para andar. Toque numa planta para regar ou colher.',
    enxada: 'Toque ou arraste na grama para arar.',
    semear: 'Toque ou arraste na terra arada para semear.',
    regar: 'Toque ou arraste nas plantas com sede para regar.',
  },
  // o que o toque vai fazer
  acoes: {
    arar: () => 'Arar esta casa',
    semear: (d, D) => `Semear ${minus(nomeDe(D, d && d.item).replace(/^semente de /i, ''))}`,
    regar: () => 'Regar',
    colher: (d, D) => `Colher ${minus(culturaDe(D, d && d.cultura))}`,
    encher: (d) => (d ? `Encher o regador (${d.agua}/${d.capacidade})` : 'Encher o regador'),
    vender: (d) => (d && d.n ? `Vender o que está no cesto por ${numero(d.ouro)} de ouro` : 'Vender a colheita na banca'),
    guardar: () => 'Guardar no celeiro o que está no cesto',
    pegar: () => 'Pegar do celeiro para vender',
    pegarFerramenta: () => 'Buscar a ferramenta no celeiro',
  },
  // por que não deu, ou o que há ali
  motivos: {
    'regador-vazio': () => 'O regador está vazio: toque no poço',
    'regador-cheio': () => 'O regador já está cheio',
    'sem-sementes': (d, D) => `Precisa de ${minus(nomeDe(D, d && d.item))}: compre na loja`,
    'sem-semente-escolhida': () => 'Precisa de sementes: compre na loja',
    'sem-ferramenta': (d) => `Você não tem ${FERRAMENTA[d && d.funcao] || 'essa ferramenta'}: compre na loja`,
    'cesto-cheio': () => 'O cesto está cheio: guarde no celeiro ou venda na banca',
    'cesto-vazio': () => 'O cesto está vazio: colha algo antes',
    'celeiro-cheio': () => 'O celeiro está cheio: venda na banca',
    'celeiro-vazio': () => 'O celeiro está vazio',
    'ja-arado': () => 'Aqui já está arado: é só semear',
    'arar-antes': () => 'Passe a enxada aqui antes de semear',
    'ja-plantado': () => 'Aqui já tem planta',
    'ja-regada': (d) => (d && d.seg > 0 ? `Já está regada (cresce por mais ${tempo(d.seg)})` : 'Esta planta já está regada'),
    'ja-pronta': () => 'Já está pronta: colha com a mão',
    'nada-para-regar': () => 'Não há planta com sede aqui',
    'nada-para-colher': () => 'Não há o que colher aqui',
    'ainda-crescendo': () => 'Ainda está crescendo',
    crescendo: (d, D) => `${culturaDe(D, d && d.cultura)} crescendo${d && d.seg > 0 ? ': água por mais ' + tempo(d.seg) : ''}`,
    'terra-arada-vazia': () => 'Terra arada: escolha Semear para plantar',
    'na-fila': () => 'Já está na fila',
    'terra-a-venda': () => 'Esta terra ainda não é sua',
    'lote-a-venda': (d) => `${d && d.nome ? d.nome + ': ' : 'Lote à venda: '}${numero(d ? d.preco : 0)} de ouro${d && d.nivel > 1 ? ', nível ' + d.nivel : ''}. A compra de terras chega em breve.`,
    'sua-casa': () => 'Sua casa',
    'sem-caminho': () => 'Não dá para chegar lá',
    'fila-cheia': () => 'Tarefas demais na fila: espere um pouco',
    'nivel-baixo': (d) => `Isso libera no nível ${d ? d.nivel : '?'}`,
    'sem-ouro': (d) => `Falta ouro${d && d.falta ? ' (' + numero(d.falta) + ')' : ''}: venda a colheita na banca`,
    'ja-tem': () => 'Você já tem',
    'nao-vende': () => 'A loja não vende isso',
    'nada-aqui': () => 'Nada para fazer aqui',
    'nao-da-para-arar': () => 'Não dá para arar aqui',
    'fora-do-mapa': () => '',
    'nao-da': () => 'Não deu',
  },
  hud: { nivel: 'Nível', ouro: 'Ouro', cash: 'Cash', folego: 'Fôlego', cesto: 'Cesto', regador: 'Regador', fila: (n) => (n === 1 ? '1 tarefa na fila' : `${n} tarefas na fila`), cansada: 'Sem fôlego: ela anda até recuperar', semRegador: 'no celeiro' },
  botoes: { loja: 'Loja', mochila: 'Mochila e celeiro', missoes: 'Missões', config: 'Configurações', telaCheia: 'Tela cheia', fechar: 'Fechar', agir: 'Agir' },
  ganhos: {
    colheu: (d, D) => `+${d.n} ${nomeDe(D, d.item)}`,
    vendeu: (d) => `+${numero(d.ouro)} ouro`,
    encheu: () => 'Regador cheio',
    guardou: (d) => `Guardou ${d.n}`,
    pegou: (d) => `Pegou ${d.n}`,
    xp: (n) => `+${n} xp`,
    pegouFerramenta: (d, D) => (d.guardou ? `Pegou ${minus(nomeDe(D, d.item))} e guardou ${minus(nomeDe(D, d.guardou))}` : `Pegou ${minus(nomeDe(D, d.item))}`),
    comprou: (d, D) => `Comprou ${d.n > 1 ? d.n + ' × ' : ''}${nomeDe(D, d.item)}`,
    missao: (d) => `Missão cumprida: ${d.titulo}`,
    ausencia: (seg) => `Você ficou fora por ${tempo(seg)}. A lavoura seguiu o relógio.`,
  },
  loja: {
    titulo: 'Loja', abas: { semente: 'Sementes', ferramenta: 'Ferramentas', recipiente: 'Recipientes', outros: 'Outros' },
    comprar: 'Comprar', mais5: '+5', tem: (n) => `Você tem ${n}`, jaTem: 'Você já tem', nivel: (n) => `Libera no nível ${n}`,
    cultura: (c) => `Cresce em ${tempo(c.tempoSeg)} · ${c.regas} ${c.regas === 1 ? 'rega' : 'regas'} · rende ${c.rende}`,
    capacidadeRegador: (n) => `${n} regas por enchida`, capacidadeCesto: (n) => `Leva ${n} itens`, vazio: 'Nada à venda aqui ainda.',
  },
  mochila: {
    titulo: 'Mochila e celeiro', comVoce: 'Com você', cesto: 'Cesto', sementes: 'Sementes', cinto: 'Cinto de ferramentas', vagas: (n, t) => `${n}/${t} vagas`,
    celeiro: 'No celeiro', estoque: 'Estoque', suporte: 'Suporte de ferramentas', vazio: 'Vazio', agua: (a, c) => `água ${a}/${c}`,
    dica: 'Toque no celeiro para guardar o cesto. Com o cesto vazio, o toque pega de volta o que dá para vender.',
  },
  missoes: {
    titulo: 'Missões', atual: 'Agora', feitas: 'Cumpridas', fim: 'Você cumpriu todas as missões do Seu Tonho por enquanto. Vêm mais por aí!',
    recompensa: 'Recompensa', nenhuma: 'Nenhuma ainda.',
  },
  config: {
    titulo: 'Configurações', som: 'Som', somInfo: 'Efeitos do jogo', alavanca: 'Alavanca na tela', alavancaInfo: 'Para andar com o polegar, como num controle',
    telaCheia: 'Tela cheia', telaCheiaInfo: 'Esconde as barras do navegador', ligado: 'Ligado', desligado: 'Desligado', entrar: 'Entrar', sair: 'Sair',
    gravacao: 'Gravação', gravacaoInfo: 'O jogo grava sozinho neste aparelho.', semGravacao: 'Este navegador não deixa gravar: copie o texto de exportar para não perder o progresso.',
    exportar: 'Exportar', exportarInfo: 'Copie este texto e guarde. Ele é a sua fazenda inteira.', copiar: 'Copiar', copiado: 'Copiado!', naoCopiou: 'Não deu para copiar sozinho: selecione o texto e copie.',
    importar: 'Importar', importarInfo: 'Cole aqui um texto exportado e toque em Carregar. A fazenda atual é trocada por ele.', carregar: 'Carregar', importou: 'Fazenda carregada!',
    recomecar: 'Recomeçar do zero', recomecarInfo: 'Apaga a fazenda deste aparelho.', certeza: 'Tem certeza? Tudo será apagado.', sim: 'Sim, apagar tudo', nao: 'Não',
    versao: 'Versão de teste do marco M1.',
  },
  subida: { faixa: 'Subiu de nível!', ganhou: 'Você ganhou', liberou: 'Liberou', continuar: 'Continuar', xp: 'xp' },
  tutorial: { progresso: (a, n) => `${a}/${n}`, feita: 'Muito bem!' },
  deitar: 'Deite o celular para jogar',
  erroDeGravacao: (e) => `A gravação não serve: ${e}`,
  erroDeDados: 'Os dados do jogo têm erro e ele não pode começar:',
};

// código da lógica → frase. Código desconhecido aparece como veio (para ninguém deixar de ver que falta o texto).
export function frase(codigo, dados, D) {
  if (!codigo) return '';
  const f = T.motivos[codigo];
  return f ? f(dados, D) : codigo;
}
export function fraseDaAcao(acao, dados, D) {
  const f = T.acoes[acao];
  return f ? f(dados, D) : acao;
}
export const nomeDoItem = nomeDe;
