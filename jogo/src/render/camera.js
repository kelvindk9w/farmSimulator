// A câmera isométrica: a mesma das imagens da arte (45° de giro, 35,264° de inclinação).
// Na tela, +X desce para a direita e +Z desce para a esquerda; Y sobe.
//   tx = (x - z) · 0,7071 · E        ty = (x + z) · 0,4082 · E - y · 0,8165 · E        (E = pixels por unidade)
import { limitar } from '../nucleo/util.js';

export const KX = Math.SQRT1_2, KY = 0.408248, KA = 0.816497;

export class Camera {
  constructor() {
    this.x = 0; this.z = 0; // ponto do chão no centro da tela
    this.E = 64; this.alvoE = 64; // zoom, em pontos de CSS por unidade
    this.base = 64; this.minE = 28; this.maxE = 140;
    this.w = 1; this.h = 1; // tamanho da tela em pontos de CSS (já deitada)
    this.dpr = 1; // pontos do canvas por ponto de CSS
    this.S = 64; // pontos do canvas por unidade (E · dpr)
    this.ox = 0; this.oy = 0; // onde cai, no canvas, o ponto (0, 0, 0) do mundo (arredondado: o chão não treme)
    this.seguindo = true;
    this.limites = [0, 0, 1, 1];
    this.mexeuNoZoom = false;
  }

  // tela mudou de tamanho: recalcula o zoom padrão
  ajustar(w, h, dpr) {
    const antes = this.base;
    this.w = w; this.h = h; this.dpr = dpr;
    // zoom padrão: mundo grande à vista. No computador a personagem fica com uns 14% da altura da tela;
    // no celular deitado, uns 21% (ela tem 2,33 unidades de altura no desenho). O jogador aproxima se quiser.
    const pelaAltura = h >= 720 ? h * 0.06 : 34 + (h - 390) * (9 / 330);
    this.base = limitar(Math.min(pelaAltura, w / 13), 28, 110);
    this.minE = this.base * 0.55; this.maxE = this.base * 2.8;
    if (!this.mexeuNoZoom) this.E = this.alvoE = this.base; else { const k = this.base / antes; this.E = limitar(this.E * k, this.minE, this.maxE); this.alvoE = limitar(this.alvoE * k, this.minE, this.maxE); }
    this.preparar();
  }

  // chamar uma vez por quadro, antes de desenhar
  preparar() {
    this.S = this.E * this.dpr;
    this.ox = Math.round((this.w * this.dpr) / 2 - (this.x - this.z) * KX * this.S);
    this.oy = Math.round((this.h * this.dpr) / 2 - (this.x + this.z) * KY * this.S);
  }

  // mundo → canvas (pontos do canvas)
  telaX(x, z) { return this.ox + (x - z) * KX * this.S; }
  telaY(x, y, z) { return this.oy + (x + z) * KY * this.S - y * KA * this.S; }
  // mundo → pontos de CSS (para pôr elementos da interface em cima do mundo)
  cssX(x, z) { return this.telaX(x, z) / this.dpr; }
  cssY(x, y, z) { return this.telaY(x, y, z) / this.dpr; }
  // pontos de CSS → chão (y = 0); devolve em out[0], out[1]
  chao(cx, cy, out) {
    const a = (cx * this.dpr - this.ox) / (KX * this.S), b = (cy * this.dpr - this.oy) / (KY * this.S);
    out[0] = (a + b) / 2; out[1] = (b - a) / 2;
    return out;
  }

  // segue o ponto (x, z) com suavidade; dt em segundos
  seguir(x, z, dt) {
    if (!this.seguindo) return;
    const k = 1 - Math.exp(-dt * 5.5);
    this.x += (x - this.x) * k; this.z += (z - this.z) * k;
    if (Math.abs(x - this.x) < 0.002) this.x = x;
    if (Math.abs(z - this.z) < 0.002) this.z = z;
  }
  pular(x, z) { this.x = x; this.z = z; this.prender(); }

  // arrastar a tela (dx, dy em pontos de CSS): a câmera para de seguir até a personagem andar de novo
  arrastar(dx, dy) {
    const a = -dx / (KX * this.E), b = -dy / (KY * this.E);
    this.x += (a + b) / 2; this.z += (b - a) / 2;
    this.seguindo = false;
    this.prender();
  }

  // muda o zoom mantendo parado o ponto do chão que está sob (cx, cy), em pontos de CSS
  zoomEm(fator, cx, cy, direto = false) {
    const novo = limitar((direto ? this.E : this.alvoE) * fator, this.minE, this.maxE);
    this.mexeuNoZoom = true;
    if (!direto) { this.alvoE = novo; return; }
    const antes = this.chao(cx, cy, tmp), ax = antes[0], az = antes[1];
    this.E = this.alvoE = novo;
    this.preparar();
    if (!this.seguindo) { const d = this.chao(cx, cy, tmp); this.x += ax - d[0]; this.z += az - d[1]; this.prender(); }
  }
  // aproxima o zoom do alvo (roda do mouse e teclas); devolve true enquanto muda
  animar(dt) {
    if (Math.abs(this.alvoE - this.E) < 0.01) { this.E = this.alvoE; return false; }
    this.E += (this.alvoE - this.E) * (1 - Math.exp(-dt * 12));
    return true;
  }

  prender() {
    const L = this.limites;
    this.x = limitar(this.x, L[0], L[2]); this.z = limitar(this.z, L[1], L[3]);
  }
}
const tmp = [0, 0];
