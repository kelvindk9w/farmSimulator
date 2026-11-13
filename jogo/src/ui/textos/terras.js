// Os textos da frente das terras (comprar lote, limpar, ferramentas com desgaste e conserto, árvores frutíferas,
// aspersor). Entram na tabela T de ui/textos.js.
import { T, tempo, numero } from '../textos.js';

const nomeI = (D, id) => (D && D.itens[id] ? D.itens[id].nome : id || '');
const nomeA = (D, id) => (D && D.arvores && D.arvores[id] ? D.arvores[id].nome : id || '');
const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const lista = (nomes) => (nomes.length > 1 ? nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1] : nomes[0] || '');
const FERRAMENTA = { foice: 'a foice', machado: 'o machado', picareta: 'a picareta' };
const OBSTACULO = { mato: 'o mato', toco: 'o toco', pedra: 'a pedra', mata: 'a árvore do mato' };
const ONDE_GANHA = { foice: 'o Seu Tonho dá uma numa missão', machado: 'o Seu Tonho dá um numa missão', picareta: 'o Seu Tonho dá uma numa missão' };

T.modos.limpar = 'Limpar';
T.dicaDoModo.limpar = 'Toque ou arraste no mato, nos tocos e nas pedras para limpar a terra.';

Object.assign(T.acoes, {
  rocar: (d) => (d && d.n > 1 ? `Roçar ${d.n} casas de mato` : 'Roçar o mato'),
  cortar: (d) => `Cortar ${OBSTACULO[d && d.obstaculo] || 'isto'}${d && d.golpes > 1 ? ` (${d.golpes} golpes)` : ''}`,
  quebrar: (d) => `Quebrar a pedra${d && d.golpes > 1 ? ` (${d.golpes} golpes)` : ''}`,
  plantarMuda: (d, D) => `Plantar ${minus(nomeI(D, d && d.item))}`,
  colherFruta: (d, D) => `Colher ${d && d.n ? d.n + ' × ' : ''}${minus(nomeI(D, d && d.item))}`,
});
// a rega de área diz quantas casas molha
const regarAntes = T.acoes.regar;
T.acoes.regar = (d, D) => (d && d.n > 1 ? `Regar ${d.n} casas de uma vez` : regarAntes(d, D));

Object.assign(T.motivos, {
  'sem-ferramenta-de-limpar': (d) => `Para tirar ${OBSTACULO[d && d.obstaculo] || 'isto'} precisa d${FERRAMENTA[d && d.funcao] || 'a ferramenta certa'}: ${ONDE_GANHA[d && d.funcao] || 'veja na loja'}`,
  'ferramenta-fraca': (d, D) => `${nomeI(D, d && d.item) || 'Esta ferramenta'} não dá conta d${OBSTACULO[d && d.obstaculo] || 'isto'}: a loja tem melhor`,
  'nada-para-limpar': () => 'Não há o que limpar aqui',
  'caminho-fechado': () => 'Não dá para chegar lá ainda: limpe antes o que está no caminho',
  // a placa do lote (a dica antes do toque)
  'lote-a-venda': (d) => {
    if (!d) return 'Lote à venda';
    const base = `${d.nome}: ${numero(d.preco)} de ouro`;
    if (d.estado === 'exige') return `${base}. Compre antes ${minus(lista(d.exige))}`;
    if (d.estado === 'nivel') return `${base}. Libera no nível ${d.nivel}`;
    if (d.estado === 'ouro') return `${base} (faltam ${numero(d.falta)}). Toque para ver`;
    return `${base}. Toque para comprar`;
  },
  'lote-exige': (d) => `Compre antes ${minus(lista((d && d.exige) || []))}`,
  'lote-ja-comprado': () => 'Este lote já é seu',
  'lote-desconhecido': () => 'Este lote não existe',
  // árvores
  'sem-mudas': (d, D) => `Precisa de ${minus(nomeI(D, d && d.item))}: compre na loja`,
  'arvore-fecha-caminho': () => 'Aqui a árvore fecharia a passagem: plante numa casa mais aberta',
  'muito-perto': (d) => `Perto demais de outra árvore: deixe ${d && d.casas > 2 ? d.casas - 1 + ' casas' : 'uma casa'} entre elas`,
  'casa-ocupada': () => 'Aqui não cabe: a casa está ocupada',
  'no-caminho': () => 'No caminho não se planta',
  'arvore-crescendo': (d) => `${d && d.nome ? d.nome : 'Árvore'} crescendo: fica adulta em ${tempo(d ? d.seg : 0)}`,
  'fruta-crescendo': (d, D) => `${d && d.nome ? d.nome : 'Árvore'}: ${minus(nomeI(D, d && d.item))} em ${tempo(d ? d.seg : 0)}`,
  // conserto
  'nada-a-consertar': () => 'Não precisa de conserto',
});
if (!T.motivos['nao-tem']) T.motivos['nao-tem'] = () => 'Você ainda não tem isso';

// o que a loja diz de cada coisa desta frente (uma linha debaixo do nome)
Object.assign(T.loja, {
  arvore: (a, fruto) => `Adulta em ${tempo(a.cresceSeg)} · fruta a cada ${tempo(a.safraSeg)} · dá ${a.rende}${fruto && fruto.venda ? ' (vende a ' + fruto.venda + ')' : ''}`,
  area: (n) => `molha ${n} casas em linha`,
  areaDaFoice: (n) => (n > 1 ? `Roça ${n} casas num golpe` : 'Roça uma casa por vez'),
  forca: (n) => `Força ${n}`,
  rapida: (r) => `${Math.round((1 / r - 1) * 100)}% mais rápida`,
  usos: (n) => (n > 0 ? `conserto a cada ${numero(n)} usos` : 'não gasta'),
});

T.ganhos.limpou = (d, D) => { const k = Object.keys(d.itens || {}); return k.length ? k.map((id) => `+${d.itens[id]} ${minus(nomeI(D, id))}`).join(' ') : ''; };
T.ganhos.deuFruta = (n) => (n === 1 ? 'Uma árvore deu fruta: é só colher' : `${n} árvores deram fruta: é só colher`);
T.ganhos.arvoreCresceu = (d, D) => `${nomeA(D, d.arvore)} ficou adulta`;
T.ganhos.consertou = (d, D) => `${nomeI(D, d.item)}: como nova`;
T.ganhos.gastando = (d, D) => `${nomeI(D, d.item)} está quase gasta: o conserto custa pouco`;
T.ganhos.gasta = (d, D) => `${nomeI(D, d.item)} ficou gasta e rende menos: conserte com um toque`;
T.ganhos.trocou = (nova, velha, D, onde) => `${nomeI(D, nova)} no cinto. ${nomeI(D, velha)} ${onde === 'lugar' ? 'voltou para o lugar dela no sítio' : 'foi para o suporte do celeiro'}`;
T.ganhos.aspersor = (n) => `O aspersor rega ${n} casas em volta, sozinho`;
// a compra de um lote não é a de um item: o aviso é outro (o resto continua com a frase da loja)
const comprouAntes = T.ganhos.comprou;
T.ganhos.comprou = (d, D) => (d.lote ? `Terra nova! ${d.nome || 'O lote'} agora é seu` : comprouAntes(d, D));

T.terras = {
  titulo: 'Terras', aba: 'Terras',
  comprado: 'É seu', comprar: 'Comprar', confirmar: (n) => `Sim, comprar por ${numero(n)}`, desistir: 'Agora não',
  pergunta: (l) => `Comprar ${l.nome} por ${numero(l.preco)} de ouro?`,
  tamanho: (l) => `${l.area[2] - l.area[0]} por ${l.area[3] - l.area[1]} casas`,
  nivel: (n) => `Libera no nível ${n}`,
  exige: (nomes) => `Compre antes: ${lista(nomes)}`,
  falta: (n) => `Faltam ${numero(n)} de ouro`,
  ver: 'Ver no mapa',
  festa: (d) => `${d.nome} é seu!`,
  // a etiqueta em cima da placa, no mapa (curta)
  rotulo: (s) => (s.estado === 'nivel' ? `Nível ${s.lote.nivel}` : numero(s.lote.preco || 0)),
};

T.ferramentas = {
  titulo: 'Ferramentas', cinto: 'No cinto', suporte: 'No suporte do celeiro', lugar: 'Pelo sítio (ela busca sozinha)', recipientes: 'Cestos e cintos', vagas: (n, t) => `${n}/${t} vagas`,
  nova: 'Não gasta', boa: (u) => `Aguenta mais ${numero(u)} usos`, gasta: 'Gasta: rende menos',
  consertar: 'Consertar', tudo: (n) => `Consertar tudo por ${numero(n)}`, emDia: 'Tudo em ordem: nada a consertar.',
  nota: 'Ferramenta gasta não quebra: só trabalha mais devagar até o conserto. As velhas, do Seu Tonho, e as de aço não gastam nunca.',
  aviso: (n) => (n === 1 ? 'Consertar' : `Consertar ${n}`),
  agua: (a, c) => `água ${a}/${c}`,
  abrir: 'Ferramentas e conserto',
};
T.botoes.ferramentas = 'Ferramentas';
