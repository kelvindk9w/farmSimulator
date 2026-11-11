// Chão simples: um quadrado liso com grade clara e borda, descrito como quadriláteros no plano do mundo.
// A rota 3D usa os pontos como estão (y = 0); a rota 2D projeta cada ponto com a câmera do jogo.
import { BufferGeometry, Float32BufferAttribute } from 'three';

export function groundQuads(G) {
  const h = G.size / 2, w = G.lineWidth / 2, b = G.borderWidth;
  const base = [[[-h, -h], [h, -h], [h, h], [-h, h]]];
  const lines = [];
  for (let i = -h + G.gridStep; i < h - 1e-6; i += G.gridStep) {
    lines.push([[i - w, -h], [i + w, -h], [i + w, h], [i - w, h]]);
    lines.push([[-h, i - w], [h, i - w], [h, i + w], [-h, i + w]]);
  }
  const border = [
    [[-h, -h], [h, -h], [h, -h + b], [-h, -h + b]], [[-h, h - b], [h, h - b], [h, h], [-h, h]],
    [[-h, -h], [-h + b, -h], [-h + b, h], [-h, h]], [[h - b, -h], [h, -h], [h, h], [h - b, h]],
  ];
  return { base, lines, border };
}

// map([x, z]) -> [X, Y, Z] do vértice
export function quadsGeometry(quads, map) {
  const pos = [];
  for (const q of quads) {
    const p = q.map(map);
    pos.push(...p[0], ...p[1], ...p[2], ...p[0], ...p[2], ...p[3]);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  return g;
}
