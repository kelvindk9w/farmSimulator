// Partículas simples do mundo: gotas de água, torrões de terra, folhas, moedas, o anel do toque e os avisos que sobem
// ("+3 Milho"). Tudo em listas de tamanho fixo: nada é alocado enquanto o jogo roda.
import { KA } from './camera.js';

const N = 220;
const GOTA = 0, TERRA = 1, FOLHA = 2, BRILHO = 3;
const COR = [['#4aa9e6', '#8fd0f5'], ['#8a5228', '#b0703c'], ['#5fae45', '#8fd04a'], ['#f6c12c', '#fff2a8']];
const GRAVIDADE = [9, 9, 3.5, -0.4];
const NT = 14; // avisos de texto ao mesmo tempo
const NA = 8; // anéis de toque

export class Particulas {
  constructor() {
    this.x = new Float32Array(N); this.y = new Float32Array(N); this.z = new Float32Array(N);
    this.vx = new Float32Array(N); this.vy = new Float32Array(N); this.vz = new Float32Array(N);
    this.vida = new Float32Array(N); this.dur = new Float32Array(N); this.tipo = new Uint8Array(N); this.tam = new Float32Array(N);
    this.prox = 0; this.vivas = 0;
    this.textos = [];
    for (let i = 0; i < NT; i++) this.textos.push({ texto: '', x: 0, y: 0, z: 0, t: -1, cor: '#fff9ec', larg: 0 });
    this.aneis = [];
    for (let i = 0; i < NA; i++) this.aneis.push({ x: 0, z: 0, t: -1, cor: '#ffffff' });
    this.semente = 12345;
  }
  _r() { this.semente = (Math.imul(this.semente, 1664525) + 1013904223) | 0; return (this.semente >>> 8) / 16777216; }

  _uma(tipo, x, y, z, vx, vy, vz, dur, tam, atraso = 0) {
    const i = this.prox; this.prox = (this.prox + 1) % N;
    this.tipo[i] = tipo; this.x[i] = x; this.y[i] = y; this.z[i] = z; this.vx[i] = vx; this.vy[i] = vy; this.vz[i] = vz;
    this.dur[i] = dur; this.vida[i] = dur + atraso; this.tam[i] = tam;
  }
  // água caindo do regador sobre a casa
  regar(x, z) { for (let k = 0; k < 16; k++) this._uma(GOTA, x + 0.5 + (this._r() - 0.5) * 0.7, 0.75 + this._r() * 0.25, z + 0.5 + (this._r() - 0.5) * 0.7, 0, -0.5, 0, 0.42, 0.05 + this._r() * 0.03, this._r() * 0.45); }
  // água espirrando do poço
  espirrar(x, z) { for (let k = 0; k < 14; k++) this._uma(GOTA, x, 1.0, z, (this._r() - 0.5) * 1.6, 1.5 + this._r() * 1.5, (this._r() - 0.5) * 1.6, 0.6, 0.05 + this._r() * 0.03, this._r() * 0.2); }
  // terra pulando da enxada
  terra(x, z, n = 12) { for (let k = 0; k < n; k++) this._uma(TERRA, x + 0.5 + (this._r() - 0.5) * 0.5, 0.05, z + 0.5 + (this._r() - 0.5) * 0.5, (this._r() - 0.5) * 2.2, 1.6 + this._r() * 1.6, (this._r() - 0.5) * 2.2, 0.5 + this._r() * 0.2, 0.05 + this._r() * 0.04); }
  // folhas da colheita
  folhas(x, z) { for (let k = 0; k < 10; k++) this._uma(FOLHA, x + 0.5 + (this._r() - 0.5) * 0.4, 0.4 + this._r() * 0.4, z + 0.5 + (this._r() - 0.5) * 0.4, (this._r() - 0.5) * 2, 1 + this._r() * 1.5, (this._r() - 0.5) * 2, 0.8 + this._r() * 0.3, 0.06 + this._r() * 0.04); }
  // brilho subindo (planta que ficou pronta, moeda)
  brilho(x, y, z, n = 8) { for (let k = 0; k < n; k++) this._uma(BRILHO, x + (this._r() - 0.5) * 0.7, y + this._r() * 0.5, z + (this._r() - 0.5) * 0.7, 0, 0.5 + this._r() * 0.6, 0, 0.7 + this._r() * 0.4, 0.05 + this._r() * 0.04, this._r() * 0.25); }

  // aviso que nasce num ponto do mundo e sobe
  texto(texto, x, y, z, cor = '#fff9ec') {
    let livre = this.textos[0];
    for (const t of this.textos) { if (t.t < 0) { livre = t; break; } if (t.t > livre.t) livre = t; }
    // os que nascem juntos no mesmo lugar sobem em fila
    let juntos = 0;
    for (const t of this.textos) if (t !== livre && t.t >= 0 && t.t < 0.35 && Math.abs(t.x - x) < 0.6 && Math.abs(t.z - z) < 0.6) juntos++;
    livre.texto = texto; livre.x = x; livre.y = y + juntos * 0.42; livre.z = z; livre.t = 0; livre.cor = cor; livre.larg = 0;
  }
  // anel no ponto tocado do chão
  anel(x, z, cor = '#ffffff') {
    let livre = this.aneis[0];
    for (const a of this.aneis) { if (a.t < 0) { livre = a; break; } if (a.t > livre.t) livre = a; }
    livre.x = x; livre.z = z; livre.t = 0; livre.cor = cor;
  }

  atualizar(dt) {
    let vivas = 0;
    for (let i = 0; i < N; i++) {
      if (this.vida[i] <= 0) continue;
      this.vida[i] -= dt;
      vivas++;
      if (this.vida[i] > this.dur[i]) continue; // ainda no atraso
      const t = this.tipo[i];
      this.vy[i] -= GRAVIDADE[t] * dt;
      this.x[i] += this.vx[i] * dt; this.y[i] += this.vy[i] * dt; this.z[i] += this.vz[i] * dt;
      if (this.y[i] < 0 && t !== BRILHO) { this.y[i] = 0; this.vy[i] = 0; this.vx[i] *= 0.5; this.vz[i] *= 0.5; if (t === GOTA) this.vida[i] = Math.min(this.vida[i], 0.08); }
    }
    this.vivas = vivas;
    for (const t of this.textos) if (t.t >= 0) { t.t += dt; if (t.t > 1.5) t.t = -1; }
    for (const a of this.aneis) if (a.t >= 0) { a.t += dt; if (a.t > 0.45) a.t = -1; }
  }

  // anéis ficam no chão: desenhar antes das figuras
  desenharNoChao(g, cam) {
    for (const a of this.aneis) {
      if (a.t < 0) continue;
      const k = a.t / 0.45, r = (0.15 + 0.45 * k) * cam.S, sx = cam.telaX(a.x, a.z), sy = cam.telaY(a.x, 0, a.z);
      g.globalAlpha = 1 - k;
      g.beginPath(); g.ellipse(sx, sy, r, r * 0.577, 0, 0, 6.2832);
      g.lineWidth = Math.max(2, 0.07 * cam.S); g.strokeStyle = 'rgba(58,36,18,.55)'; g.stroke();
      g.lineWidth = Math.max(1.5, 0.045 * cam.S); g.strokeStyle = a.cor; g.stroke();
    }
    g.globalAlpha = 1;
  }

  desenhar(g, cam) {
    if (this.vivas > 0) {
      for (let i = 0; i < N; i++) {
        if (this.vida[i] <= 0 || this.vida[i] > this.dur[i]) continue;
        const t = this.tipo[i], k = this.vida[i] / this.dur[i], r = this.tam[i] * cam.S * (t === BRILHO ? 0.6 + 0.6 * Math.sin(k * 3.14) : 1);
        const sx = cam.telaX(this.x[i], this.z[i]), sy = cam.telaY(this.x[i], this.y[i], this.z[i]);
        g.globalAlpha = k < 0.3 ? k / 0.3 : 1;
        g.fillStyle = COR[t][i & 1];
        g.beginPath();
        if (t === GOTA) g.ellipse(sx, sy, r * 0.7, r * 1.3, 0, 0, 6.2832);
        else if (t === BRILHO) { g.moveTo(sx, sy - r * 2); g.lineTo(sx + r * 0.6, sy - r * 0.6); g.lineTo(sx + r * 2, sy); g.lineTo(sx + r * 0.6, sy + r * 0.6); g.lineTo(sx, sy + r * 2); g.lineTo(sx - r * 0.6, sy + r * 0.6); g.lineTo(sx - r * 2, sy); g.lineTo(sx - r * 0.6, sy - r * 0.6); g.closePath(); }
        else g.rect(sx - r, sy - r, r * 2, r * 2);
        g.fill();
      }
      g.globalAlpha = 1;
    }
    // avisos que sobem
    let fonte = false;
    for (const t of this.textos) {
      if (t.t < 0) continue;
      if (!fonte) { g.font = `800 ${Math.round(15 * cam.dpr)}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; fonte = true; }
      const k = Math.min(1, t.t / 1.5), sobe = 1 - (1 - k) * (1 - k);
      const sx = cam.telaX(t.x, t.z), sy = cam.telaY(t.x, t.y + sobe * 1.0, t.z);
      const esc = t.t < 0.12 ? 0.6 + (0.5 * t.t) / 0.12 : t.t < 0.22 ? 1.1 - (0.1 * (t.t - 0.12)) / 0.1 : 1;
      g.globalAlpha = t.t < 1.1 ? 1 : 1 - (t.t - 1.1) / 0.4;
      g.save(); g.translate(sx, sy); g.scale(esc, esc);
      g.lineWidth = 4.5 * cam.dpr; g.strokeStyle = '#3a2412'; g.strokeText(t.texto, 0, 0);
      g.fillStyle = t.cor; g.fillText(t.texto, 0, 0);
      g.restore();
    }
    g.globalAlpha = 1;
  }
}
export const ALTURA_DO_TEXTO = KA;
