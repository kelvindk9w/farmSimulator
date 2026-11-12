// Molde do celeiro: caixa de tábuas, telhado de duas águas, porta dupla grande e um alçapão no oitão.
// A frente (o oitão com a porta) olha para +z.
import { Molde } from './malha.js';

export function celeiro() {
  const m = new Molde('celeiro');
  const W = 5.0, D = 6.4, H = 3.2;
  const hx = W / 2, hz = D / 2;
  const subida = 2.2, k = subida / hx;
  const beiral = 0.35, oitao = 0.3, folgaTelhado = 0.06;

  // paredes de tábua em pé: laterais retangulares, frente e fundo com o oitão na mesma face
  m.poligono('madeira', [[hx, 0, hz], [hx, 0, -hz], [hx, H, -hz], [hx, H, hz]], { normal: [1, 0, 0] });
  m.poligono('madeira', [[-hx, 0, -hz], [-hx, 0, hz], [-hx, H, hz], [-hx, H, -hz]], { normal: [-1, 0, 0] });
  for (const sz of [1, -1]) {
    m.poligono('madeira', [[-hx, 0, sz * hz], [hx, 0, sz * hz], [hx, H, sz * hz], [0, H + subida, sz * hz], [-hx, H, sz * hz]], { normal: [0, 0, sz] });
  }

  // telhado: cumeeira ao longo de z
  const yCume = H + folgaTelhado + subida, yBeiral = H + folgaTelhado - k * beiral;
  for (const sx of [1, -1]) {
    m.agua([[hx + beiral, yBeiral], [0, yCume]], -hz - oitao, hz + oitao, { ao: [0, 0, 1], fora: [sx, 0, 0] });
  }

  // porta dupla: duas folhas com a mesma imagem, a da direita espelhada (os puxadores se encontram no meio)
  const lf = 1.2, af = 2.4;
  m.quadro('porta', [-lf / 2, af / 2, hz], lf, af, [0, 0, 1]);
  m.quadro('porta', [lf / 2, af / 2, hz], lf, af, [0, 0, 1], { espelhar: true });
  // alçapão do paiol, no oitão
  m.quadro('janela', [0, 3.6, hz], 0.9, 0.9, [0, 0, 1]);
  return m;
}
