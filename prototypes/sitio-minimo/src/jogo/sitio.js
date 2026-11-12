// A planta do sítio: onde fica cada objeto no terreno. Dados puros.
// Eixos: a câmera olha de (+X, +Z). Na tela, +X vai para baixo-direita e +Z para baixo-esquerda;
// o canto (-X, -Z) é o fundo (alto da tela). Coisa alta fica no fundo, coisa baixa na frente,
// e o personagem age sempre do lado de cá do objeto (ou ao lado), para a câmera não o perder de vista.

export const SITIO = {
  terreno: 5.5, // meia-largura do quadrado de terra
  inicio: { x: 2.5, z: 1.9, rumo: 0.6 },
  objetos: {
    celeiro: { tipo: 'celeiro', nome: 'Celeiro', x: -3.2, z: -3.7 },
    arvore: { tipo: 'arvore', nome: 'Laranjeira', x: 0.1, z: -4.0 },
    poco: { tipo: 'poco', nome: 'Poço', x: 4.3, z: 1.7 },
    canteiro1: { tipo: 'canteiro', nome: 'Canteiro 1', x: -2.2, z: 4.3 },
    canteiro2: { tipo: 'canteiro', nome: 'Canteiro 2', x: 0.3, z: 4.3 },
    ninho: { tipo: 'ninho', nome: 'Ninho', x: -4.1, z: 1.5 },
    vaca: { tipo: 'vaca', nome: 'Vaca', x: 3.9, z: -4.0, rumo: -2.2 },
    galinha1: { tipo: 'galinha', nome: 'Galinha', x: -3.0, z: 1.9, rumo: 2.0, variante: 'branca', poedeira: true },
    galinha2: { tipo: 'galinha', nome: 'Galinha', x: -4.6, z: 0.4, rumo: 0.5, variante: 'caramelo' },
  },
  // pasto cercado: retângulo, com a porteira (um vão) no lado da frente (z1)
  pasto: {
    x0: 1.6, z0: -5.2, x1: 5.2, z1: -1.8,
    porteira: { x0: 2.25, x1: 3.55 },
    ordenha: { x: 3.45, z: -3.05, rumo: Math.PI / 2 }, // onde a vaca espera a ordenha, olhando para +X
    folga: 0.9, // a vaca passeia a esta distância da cerca
  },
  // área por onde as galinhas ciscam
  terreiro: { x0: -5.1, z0: -0.1, x1: -2.1, z1: 2.7 },
  // caminho de terra (só desenho): listas de pontos [x, z]
  caminhos: [
    [[-3.2, -2.1], [-3.2, -0.7], [-1.4, 0.3], [0.4, 0.5]],
    [[0.4, 0.5], [1.9, -0.2], [2.9, -1.0], [2.9, -1.9]],
    [[0.4, 0.5], [2.2, 1.8], [3.4, 2.7]],
    [[0.4, 0.5], [0.0, 1.8], [0.2, 2.9]],
  ],
  larguraCaminho: 0.95,
};
