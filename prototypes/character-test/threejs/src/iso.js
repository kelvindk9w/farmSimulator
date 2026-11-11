// Projeção da câmera do jogo (ortográfica, yaw 45°, elevação ~35°) e as 8 direções de tela.
// Usado pelas duas rotas: no 3D monta a câmera; no 2D converte posição de mundo em posição de tela.

export const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']; // sentido horário a partir do norte da tela
export const DIR_LABEL = { N: 'N', NE: 'NE', E: 'L', SE: 'SE', S: 'S', SW: 'SO', W: 'O', NW: 'NO' };
const RAD = Math.PI / 180;

export class Iso {
  constructor(cam) {
    this.yaw = cam.yawDeg * RAD;
    this.elev = cam.elevDeg * RAD;
    this.sinE = Math.sin(this.elev); this.cosE = Math.cos(this.elev);
    this.sinY = Math.sin(this.yaw); this.cosY = Math.cos(this.yaw);
  }
  // direção de tela k (0 = N ... 7 = NW) -> vetor unitário no chão do mundo [x, z]
  dirVec(k) {
    const a = k * 45 * RAD;
    const e = Math.sin(a), n = Math.cos(a);
    return this.enToWorld(e, n);
  }
  // coordenadas "leste/norte de tela" (em unidades de mundo, medidas no chão) -> mundo [x, z]
  enToWorld(e, n) { return [e * this.cosY - n * this.sinY, -e * this.sinY - n * this.cosY]; }
  worldToEn(x, z) { return [x * this.cosY - z * this.sinY, -x * this.sinY - z * this.cosY]; }
  // giro em Y (graus) que faz o personagem (frente em +Z) olhar para a direção k
  dirYawDeg(k) { const [x, z] = this.dirVec(k); return Math.atan2(x, z) / RAD; }
  // mundo -> tela, em unidades de mundo (x para a direita, y para cima), relativo ao ponto (0,0,0)
  project(x, y, z) {
    return [x * this.cosY - z * this.sinY, y * this.cosE - (x * this.sinY + z * this.cosY) * this.sinE];
  }
  // vetor do alvo até a câmera
  camDir() { return [this.cosE * this.sinY, this.sinE, this.cosE * this.cosY]; }
}
