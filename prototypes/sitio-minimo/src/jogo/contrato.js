// O CONTRATO entre a lógica e a arte, em dados puros (o texto explicado está em CONTRATO-DE-ARTE.md).
// A lógica usa estes números para andar e agir; cada visual tem de declarar os mesmos pontos (pontos "de jogo").
// Tudo em unidades de mundo (1 unidade ~ 1 m na escala do cenário), no espaço LOCAL do objeto:
// origem no chão, no centro do objeto; +Y para cima; a "frente" dos bichos e do personagem é +Z.

export const ESCALA_PERSONAGEM = 1.25; // o avatar de tools/visual-refs tem 1,6 de altura; aqui fica com 2,0

// quanto o personagem avança em UM ciclo completo do clipe (dois passos). A arte tem de respeitar isto,
// senão o pé escorrega. A lógica entrega "fase" = distância andada / passada.
export const PASSADA = { andar: 1.66, correr: 2.45, vaca: 0.92, galinha: 0.34 };
export const VELOCIDADE = { andar: 2.1, correr: 3.6, vaca: 0.55, galinha: 0.9, galinhaFugindo: 2.3 };

export const ITENS = ['milho', 'leite', 'ovo', 'laranja'];
export const NOME_ITEM = { milho: 'milho', leite: 'leite', ovo: 'ovo', laranja: 'laranja', agua: 'água' };
export const AGUA_MAX = 3;

// Ações do personagem: duração (s) e o instante (s) em que o efeito acontece na lógica
// (a semente cai, o ovo sai do ninho, a fruta solta...). "linha" lista os trechos que a arte pode usar para se sincronizar.
export const ACOES = {
  plantar: { dur: 1.6, efeito: 0.95, verbo: 'plantar milho' },
  regar: { dur: 1.9, efeito: 1.1, verbo: 'regar' },
  colher: { dur: 1.7, efeito: 0.95, verbo: 'colher o milho' },
  tirarAgua: { dur: 2.8, efeito: 2.05, verbo: 'tirar água' },
  ordenhar: { dur: 2.7, efeito: 2.25, verbo: 'ordenhar' },
  pegarOvo: { dur: 1.4, efeito: 0.75, verbo: 'pegar o ovo' },
  colherFruta: { dur: 2.2, efeito: 1.3, verbo: 'colher laranja' },
};
// "tirar água": trechos (s) dentro da ação
export const TIRAR_AGUA = { alcanca: 0.3, gira: 1.3, voltas: 2.5, despejaDe: 1.7, despejaAte: 2.38, solta: 0.4 };
// celeiro: tempos (s) da porta e de ficar lá dentro
export const CELEIRO = { abrir: 0.6, fechar: 0.6, dentro: 0.7, deposito: 0.3 };

// Tempos do sítio (s)
export const TEMPOS = {
  canteiro: { semeado: 4, broto: 7, crescendo: 8 }, // só correm com o canteiro molhado; soma = 19 s
  leite: { primeiro: 6, depois: 25 },
  ovo: { primeiro: 2, depois: 15, botando: 2.4 },
  laranja: 12,
};

// Pontos e tamanhos por tipo. "pontos" são os pontos DE JOGO (onde o personagem fica, para onde olha, onde é a porta):
// a lógica usa estes valores e o visual tem de expor os mesmos nomes com os mesmos valores (tolerância de 5 cm).
// "ancoras" são pontos DE MÃO: só a arte usa (a mão do personagem vai até lá); cada conjunto de arte põe onde quiser
// e pode movê-los durante a animação. Os valores abaixo são o padrão usado quando um visual não declara a âncora.
// "toque" é a caixa (largura X, altura, profundidade Z; opcionalmente deslocada) usada para saber em que objeto o dedo tocou.
export const TIPOS = {
  personagem: {
    estados: ['parado', 'andar', 'correr', 'plantar', 'regar', 'colher', 'girarManivela', 'ordenhar', 'pegarOvo', 'colherFruta', 'dentro'],
    pontos: {},
    ancoras: { maoD: [-0.3, 1.0, 0.15], maoE: [0.3, 1.0, 0.15] },
    toque: null,
  },
  canteiro: {
    estados: ['vazio', 'semeado', 'broto', 'crescendo', 'pronto'],
    tamanho: [1.8, 1.8],
    // ele fica na beira do fundo, perto do canto direito, olhando para a câmera: as plantas nunca o escondem
    pontos: { ficar: [0.55, 0, -1.25], olhar: [0.45, 0, 0] },
    ancoras: { centro: [0, 0.2, 0] },
    toque: [2.0, 0.7, 2.0],
  },
  poco: {
    estados: ['ocioso', 'tirando'],
    raio: 0.8,
    pontos: { ficar: [-0.5, 0, 1.15], olhar: [0.6, 0, 1.15] },
    ancoras: { manivela: [0, 1.2, 1.15], borda: [-0.62, 0.8, 0.45] },
    toque: [1.9, 2.3, 2.4],
  },
  celeiro: {
    estados: ['fechado', 'abrindo', 'aberto', 'fechando'],
    tamanho: [3.6, 3.0],
    porta: { largura: 1.7, altura: 2.45 },
    pontos: { porta: [0, 0, 2.7], soleira: [0, 0, 1.5], dentro: [0, 0, 0.5] },
    ancoras: {},
    toque: [3.6, 3.6, 3.0],
  },
  vaca: {
    estados: ['parada', 'pastando', 'andando', 'esperandoOrdenha', 'ordenhada'],
    escala: 1.1,
    // com a vaca olhando para +Z: o personagem fica do lado direito dela (-X), perto das patas de trás
    pontos: { ficar: [-0.7, 0, -0.54], olhar: [0, 0, -0.28] },
    ancoras: { ubere: [0, 0.74, -0.28], balde: [-0.12, 0, -0.28] },
    toque: [1.5, 1.7, 2.6],
  },
  galinha: {
    estados: ['parada', 'andando', 'bicando', 'batendoAsas', 'botando', 'fugindo'],
    pontos: {},
    ancoras: {},
    toque: [0.7, 0.8, 0.7],
  },
  ninho: {
    estados: ['vazio', 'comOvo'],
    raio: 0.38,
    pontos: { ficar: [0.3, 0, -0.78], olhar: [0, 0, 0] },
    ancoras: { ovo: [0, 0.2, 0] },
    toque: [0.95, 0.6, 0.95],
  },
  arvore: {
    estados: ['ociosa', 'colhendo'],
    raioTronco: 0.3,
    frutasMax: 3,
    pontos: { ficar: [-0.45, 0, 1.3], olhar: [0.6, 0, 1.3] },
    ancoras: { fruta: [0, 2.2, 1.28] },
    toque: [2.6, 4.0, 2.6, [0, 0, 0.2]],
  },
  chao: { estados: ['normal'], pontos: {}, ancoras: {}, toque: null },
  cerca: { estados: ['normal'], pontos: {}, ancoras: {}, toque: null },
};
