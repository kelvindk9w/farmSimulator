// Moldes do canteiro (caixa baixa de terra arada com borda de tábuas) e do chão que fica por baixo de tudo.
import { Molde } from './malha.js';

export const LADO_DO_CANTEIRO = 3;

export function canteiro() {
  const m = new Molde('canteiro');
  const h = LADO_DO_CANTEIRO / 2, t = 0.12, alto = 0.24, terra = 0.16;
  // borda: duas tábuas inteiras ao longo de x e duas entre elas ao longo de z; o veio acompanha o comprimento
  for (const s of [1, -1]) {
    const za = s > 0 ? h - t : -h, xa = s > 0 ? h - t : -h;
    m.caixa('madeira', [-h, 0, za], [h, alto, za + t], { veio: 'x', sem: ['-y'] });
    m.caixa('madeira', [xa, 0, -h + t], [xa + t, alto, h - t], { veio: 'z', sem: ['-y', '+z', '-z'] });
  }
  // terra: só a face de cima, um pouco abaixo do topo da borda
  m.poligono('terra-arada', [[-h + t, terra, h - t], [h - t, terra, h - t], [h - t, terra, -h + t], [-h + t, terra, -h + t]], { normal: [0, 1, 0] });
  return m;
}

export function chao(lado = 24) {
  const m = new Molde('chao');
  const h = lado / 2;
  m.poligono('grama', [[-h, 0, h], [h, 0, h], [h, 0, -h], [-h, 0, -h]], { normal: [0, 1, 0] });
  return m;
}
