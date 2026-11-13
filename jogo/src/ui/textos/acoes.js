// Os textos das ações por toque (a vaga "Na mão", a roda de ações, o balãozinho). Entram na tabela T de ui/textos.js.
import { T, numero } from '../textos.js';

const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const maius = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// sem nada apontado: o que a linha de dica diz
T.dicaDoModo.mao = 'Toque no que quiser fazer: ela pega a ferramenta certa.';

Object.assign(T.motivos, {
  'sem-sementes-na-mao': () => 'Sem sementes na mão: compre na loja',
  'muda-na-grama': (d, D) => `${maius(nomeCurto(D, d && d.item))}: a muda vai na grama, fora do campo`,
  'terra-arada-vazia': () => 'Terra arada: toque para plantar o que está na mão',
  'opcao-desconhecida': () => 'Isso não dá agora',
  'nao-se-planta': () => 'Isso não se planta',
});

// o nome curto do que vai na mão: "Alface" (da semente de alface), "Cana" (do tolete), "Laranjeira" (da muda)
export function nomeCurto(D, id) {
  if (!D || !id) return '';
  const c = D.culturas[D.culturaDaSemente[id]];
  if (c) return c.nome;
  const it = D.itens[id];
  return it ? maius(String(it.nome).replace(/^muda de /i, '')) : id;
}

T.mao = {
  rotulo: 'Na mão',
  comprar: 'Comprar',
  comprarSementes: 'Comprar sementes',
  conta: (n) => `×${numero(n)}`,
  // o rótulo da vaga para quem lê a tela (leitor de tela, title)
  dica: (nome, n) => (nome ? `Na mão: ${nome} (${numero(n)}). Toque para trocar` : 'Sem sementes: toque para comprar'),
  trocou: (nome) => `Na mão: ${nome}`,
};

// o nome curto de cada ação, embaixo do botão da roda (as frentes novas acrescentam o seu; sem nome, vale a frase)
T.acaoCurta = {
  arar: 'Arar', ararComBoi: 'Arar', semear: 'Plantar', regar: 'Regar', colher: 'Colher', encher: 'Encher',
  vender: 'Vender', guardar: 'Guardar', pegar: 'Pegar', pegarFerramenta: 'Pegar',
  rocar: 'Limpar', cortar: 'Cortar', quebrar: 'Quebrar', plantarMuda: 'Plantar', colherFruta: 'Colher',
  abastecerCocho: (d, D) => (d && d.item && d.item !== 'racao' && D && D.itens[d.item] ? `Dar ${minus(D.itens[d.item].nome)}` : 'Dar ração'),
  abastecerBebedouro: 'Dar água', recolherOvo: 'Pegar ovos', ordenhar: 'Ordenhar', tosquiar: 'Tosquiar',
  retirarProduto: 'Retirar', afagar: 'Afagar', conversar: 'Conversar', reformarConstrucao: 'Reformar',
  encherBarril: 'Encher', encherNoBarril: 'Encher', abrir: 'Abrir',
};
export function nomeDaAcao(id, dados, D) {
  const f = T.acaoCurta[id];
  return typeof f === 'function' ? f(dados, D) : f || id;
}

T.roda = { fechar: 'Fechar' };
