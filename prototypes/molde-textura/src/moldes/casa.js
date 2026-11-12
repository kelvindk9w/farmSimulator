// Molde da casa de sítio: corpo retangular, telhado de duas águas com beiral, varanda na frente (telhado sobre postes),
// uma porta e três janelas. A frente olha para +z. Medidas em unidades de mundo (1 unidade ~ 1 metro).
import { Molde } from './malha.js';

export function casa() {
  const m = new Molde('casa');
  const W = 6.4, D = 4.6, H = 3.2; // largura (x), fundo (z) e altura das paredes
  const hx = W / 2, hz = D / 2;
  const subida = 1.6; // altura da cumeeira acima do topo da parede
  const k = subida / hz; // inclinação das águas principais
  const beiral = 0.35, oitao = 0.3, folgaTelhado = 0.06;
  const varanda = 1.2, quedaVaranda = 0.15; // alcance do telhado da varanda e a inclinação dele (mais deitado que o principal)

  // paredes: frente e fundo retangulares, laterais com o triângulo do oitão na mesma face
  m.poligono('parede', [[-hx, 0, hz], [hx, 0, hz], [hx, H, hz], [-hx, H, hz]], { normal: [0, 0, 1] });
  m.poligono('parede', [[hx, 0, -hz], [-hx, 0, -hz], [-hx, H, -hz], [hx, H, -hz]], { normal: [0, 0, -1] });
  for (const sx of [1, -1]) {
    m.poligono('parede', [[sx * hx, 0, hz], [sx * hx, 0, -hz], [sx * hx, H, -hz], [sx * hx, H + subida, 0], [sx * hx, H, hz]], { normal: [sx, 0, 0] });
  }

  // telhado: cumeeira ao longo de x. A água da frente desce até a parede e continua, mais deitada, por cima da varanda.
  const yCume = H + folgaTelhado + subida, yParede = H + folgaTelhado;
  const s0 = -hx - oitao, s1 = hx + oitao;
  m.agua([[hz + beiral, yParede - k * beiral], [0, yCume]], s0, s1, { ao: [1, 0, 0], fora: [0, 0, -1] });
  m.agua([[hz + varanda, yParede - quedaVaranda * varanda], [hz, yParede], [0, yCume]], s0, s1, { ao: [1, 0, 0], fora: [0, 0, 1] });

  // varanda: assoalho, quatro postes e a viga que recebe o telhado
  const piso = 0.15, zPoste = hz + 0.98, lado = 0.16;
  const yViga = yParede - quedaVaranda * 0.98 - 0.12; // face de baixo do telhado na linha dos postes
  m.caixa('madeira', [-hx, 0, hz], [hx, piso, hz + 1.1], { veio: 'x', sem: ['-y', '-z'] });
  m.caixa('madeira', [-0.7, 0, hz + 1.1], [0.7, 0.07, hz + 1.42], { veio: 'x', sem: ['-y', '-z'] }); // degrau
  for (const x of [-3.1, -1.73, 1.73, 3.1]) {
    m.caixa('madeira', [x - lado / 2, piso, zPoste - lado / 2], [x + lado / 2, yViga - 0.14, zPoste + lado / 2], { sem: ['+y', '-y'] });
  }
  m.caixa('madeira', [-hx - 0.05, yViga - 0.14, zPoste - 0.07], [hx + 0.05, yViga, zPoste + 0.07], { veio: 'x', sem: ['+y'] });

  // porta e janelas: quadros de imagem única, um fio à frente da parede.
  // As posições foram escolhidas para que, vistos pela câmera do jogo, os postes não passem na frente deles.
  m.quadro('porta', [0, piso + 0.95, hz], 0.95, 1.9, [0, 0, 1]);
  for (const x of [-1.45, 1.45]) m.quadro('janela', [x, 1.3, hz], 0.9, 0.9, [0, 0, 1]);
  m.quadro('janela', [hx, 1.6, 0], 1.0, 1.0, [1, 0, 0]);
  return m;
}
