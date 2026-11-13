// O chão, desenhado por código no estilo de contorno e guardado em blocos (canvas fora da tela, alinhados à tela).
// Cada bloco só é refeito quando uma casa dele muda (ou quando o zoom muda); a cada quadro o chão é só colar blocos.
// Grama com detalhe leve, terra arada seca e molhada com sulcos e contorno só na borda da mancha, caminho de terra,
// terra à venda escurecida e a beirada do mapa.
import { KX, KY, KA } from './camera.js';
import { GRAMA, ARADA, CAMINHO } from '../nucleo/local.js';
import { acaso } from '../nucleo/util.js';

const T = 256; // lado do bloco, em pontos do canvas
const COR = {
  ceu: '#a5def5',
  grama: '#86c63f', gramaClara: '#97d24b', gramaEscura: '#5f9f2c',
  terra: '#b0703c', terraSulco: '#8a5228', terraLuz: '#c98a52', terraLado: '#7d4a25',
  molhada: '#70421f', molhadaSulco: '#54301a', molhadaLuz: '#8b5630', molhadaLado: '#4f2c16',
  caminho: '#f0b765', caminhoClaro: '#f8d08c', caminhoBorda: '#c98a3a',
  traco: '#3a2412', barranco: '#8a5630', barrancoEscuro: '#6c4124', flor: '#fff6d8', miolo: '#f6c12c',
  venda: 'rgba(24, 52, 46, 0.34)', divisa: 'rgba(58, 36, 18, 0.6)',
};
export const COR_DO_CEU = COR.ceu;

class Conjunto {
  constructor(S) { this.S = S; this.blocos = new Map(); this.completo = false; }
}
const chave = (i, j) => (i + 32768) + (j + 32768) * 65536;

export class Chao {
  constructor() {
    this.atual = null; // blocos na escala em uso
    this.velho = null; // blocos da escala anterior: tapam o buraco enquanto os novos não ficam prontos
    this.sobras = []; // canvas para reaproveitar
    this.quadro = 0;
    this.escalaVista = 0; this.estavel = 0;
    this.completo = false; // todos os blocos visíveis estão em dia?
    this.pintados = 0; // quantos blocos foram refeitos desde o começo (para as ferramentas medirem)
  }

  // a casa (x, z) mudou: os blocos que a mostram (e a borda das vizinhas) têm de ser refeitos
  sujar(x, z) {
    const c = this.atual;
    if (!c) return;
    const S = c.S, m = 0.4 * S;
    const i0 = Math.floor(((x - z - 1) * KX * S - m) / T), i1 = Math.floor(((x - z + 1) * KX * S + m) / T);
    const j0 = Math.floor(((x + z) * KY * S - m) / T), j1 = Math.floor(((x + z + 2) * KY * S + m) / T);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const b = c.blocos.get(chave(i, j)); if (b) b.sujo = true; }
  }
  sujarTudo() { if (this.atual) for (const b of this.atual.blocos.values()) b.sujo = true; }

  _novoBloco(i, j) {
    let cv = this.sobras.pop();
    if (!cv) { cv = document.createElement('canvas'); cv.width = T; cv.height = T; }
    return { i, j, cv, g: cv.getContext('2d', { alpha: false }), sujo: true, pintado: false, visto: this.quadro };
  }
  _largar(conj) { if (conj) for (const b of conj.blocos.values()) if (this.sobras.length < 96) this.sobras.push(b.cv); }

  // cola os blocos visíveis no canvas da tela. orcamento = quantos blocos podem ser refeitos neste quadro (0 = todos).
  desenhar(g, cam, mundo, dt, orcamento = 3) {
    const loc = mundo.local, S = cam.S, W = cam.w * cam.dpr, H = cam.h * cam.dpr;
    this.quadro++;
    // o zoom parou de mudar? só então refaz os blocos na escala nova (durante a pinça, estica os antigos)
    if (S !== this.escalaVista) { this.escalaVista = S; this.estavel = 0; } else this.estavel += dt;
    if (!this.atual) this.atual = new Conjunto(S);
    else if (this.atual.S !== S && (this.estavel > 0.14 || orcamento === 0)) {
      if (!this.velho || this.atual.completo) { this._largar(this.velho); this.velho = this.atual; } else this._largar(this.atual);
      this.atual = new Conjunto(S);
    }
    g.fillStyle = COR.ceu;
    g.fillRect(0, 0, W, H);
    if (this.velho) this._colar(g, cam, this.velho, W, H, null, 0, false);
    const emDia = this.atual.S === S;
    const falta = this._colar(g, cam, this.atual, W, H, emDia ? { loc, mundo } : null, orcamento, true);
    this.completo = emDia && falta === 0;
    if (this.completo) this.atual.completo = true;
    if (this.completo && this.velho) { this._largar(this.velho); this.velho = null; }
    // esquece os blocos que saíram da tela há tempo
    if (this.quadro % 90 === 0 && this.atual.blocos.size > 80) {
      for (const [k, b] of this.atual.blocos) if (this.quadro - b.visto > 240) { this.atual.blocos.delete(k); if (this.sobras.length < 96) this.sobras.push(b.cv); }
    }
  }

  // devolve quantos blocos visíveis ficaram por refazer
  _colar(g, cam, conj, W, H, pintar, orcamento, criar) {
    const r = cam.S / conj.S; // 1 quando o conjunto está na escala da tela
    // a origem do mundo, na escala do conjunto
    const ox = cam.ox / r, oy = cam.oy / r;
    const i0 = Math.floor(-ox / T), i1 = Math.floor((W / r - ox) / T), j0 = Math.floor(-oy / T), j1 = Math.floor((H / r - oy) / T);
    let falta = 0, feitos = 0;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const k = chave(i, j);
      let b = conj.blocos.get(k);
      if (!b) { if (!criar || !pintar) continue; b = this._novoBloco(i, j); conj.blocos.set(k, b); }
      b.visto = this.quadro;
      if (b.sujo && pintar) {
        if (orcamento === 0 || feitos < orcamento) { this._pintar(b, conj.S, pintar.loc, pintar.mundo); feitos++; } else falta++;
      }
      if (!b.pintado) continue;
      if (r === 1) g.drawImage(b.cv, i * T + cam.ox, j * T + cam.oy);
      else g.drawImage(b.cv, Math.floor(i * T * r + cam.ox), Math.floor(j * T * r + cam.oy), Math.ceil(T * r) + 1, Math.ceil(T * r) + 1);
    }
    return falta;
  }

  // ---------- desenho de um bloco ----------
  _pintar(b, S, loc, mundo) {
    const g = b.g, x0 = b.i * T, y0 = b.j * T, L = loc.l, P = loc.p;
    b.sujo = false; b.pintado = true; this.pintados++;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = COR.ceu;
    g.fillRect(0, 0, T, T);
    g.translate(-x0, -y0);
    const ux = KX * S, uy = KY * S; // meia largura e meia altura do losango de uma casa
    const M = 0.9 * S; // folga: o barranco e as faixas da frente saem da casa
    const a0 = (x0 - M) / ux, a1 = (x0 + T + M) / ux, b0 = (y0 - M) / uy, b1 = (y0 + T + M) / uy;
    const xi = Math.max(0, Math.floor((a0 + b0) / 2) - 1), xf = Math.min(L - 1, Math.ceil((a1 + b1) / 2));
    const zi = Math.max(0, Math.floor((b0 - a1) / 2) - 1), zf = Math.min(P - 1, Math.ceil((b1 - a0) / 2));
    const fora = (x, z) => { const a = x - z, s = x + z; return a + 1 < a0 || a - 1 > a1 || s + 2 < b0 || s > b1; };
    const agora = mundo.agora;
    const tipo = (x, z) => {
      if (x < 0 || z < 0 || x >= L || z >= P) return -1;
      const i = z * L + x, c = loc.chao[i];
      if (c !== ARADA) return c;
      const pl = loc.plantas[i];
      return pl && pl.secaEm > agora ? 3 : ARADA; // 3 = arada e molhada
    };
    const losango = (x, z, f = 0) => {
      const cx = (x - z) * ux, cy = (x + z) * uy;
      g.moveTo(cx, cy - f); g.lineTo(cx + ux + f * 1.7, cy + uy); g.lineTo(cx, cy + 2 * uy + f); g.lineTo(cx - ux - f * 1.7, cy + uy); g.closePath();
    };
    // canto (x, z) da malha, na tela
    const px = (x, z) => (x - z) * ux, py = (x, z) => (x + z) * uy;

    // 1. base de cada tipo de chão (um preenchimento por cor)
    const bases = [[GRAMA, COR.grama], [CAMINHO, COR.caminho], [ARADA, COR.terra], [3, COR.molhada]];
    for (const [qual, cor] of bases) {
      g.beginPath();
      let ha = false;
      for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) if (!fora(x, z) && tipo(x, z) === qual) { losango(x, z, 0.6); ha = true; }
      if (ha) { g.fillStyle = cor; g.fill(); }
    }

    // 2. detalhe leve
    // grama: manchas claras, tufos e uma flor de vez em quando
    g.beginPath();
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
      if (fora(x, z) || tipo(x, z) !== GRAMA || acaso(x, z, 1) > 0.3) continue;
      const cx = (x - z + (acaso(x, z, 2) - 0.5) * 0.6) * ux, cy = (x + z + 1 + (acaso(x, z, 3) - 0.5) * 0.6) * uy;
      g.moveTo(cx + 0.34 * S, cy); g.ellipse(cx, cy, 0.34 * S, 0.17 * S, 0, 0, 6.2832);
    }
    g.fillStyle = COR.gramaClara; g.fill();
    g.beginPath();
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
      if (fora(x, z) || tipo(x, z) !== GRAMA) continue;
      const n = acaso(x, z, 4) < 0.5 ? 1 : acaso(x, z, 4) < 0.62 ? 2 : 0;
      for (let k = 0; k < n; k++) {
        const cx = (x - z + (acaso(x, z, 5 + k) - 0.5) * 1.0) * ux, cy = (x + z + 1 + (acaso(x, z, 8 + k) - 0.5) * 1.0) * uy, h = 0.11 * S;
        g.moveTo(cx - h * 0.7, cy - h * 0.7); g.lineTo(cx - h * 0.25, cy); g.moveTo(cx, cy - h); g.lineTo(cx, cy); g.moveTo(cx + h * 0.7, cy - h * 0.7); g.lineTo(cx + h * 0.25, cy);
      }
    }
    g.strokeStyle = COR.gramaEscura; g.lineWidth = Math.max(1, 0.028 * S); g.lineCap = 'round'; g.stroke();
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
      if (fora(x, z) || tipo(x, z) !== GRAMA || acaso(x, z, 12) > 0.045) continue;
      for (let k = 0; k < 3; k++) {
        const cx = (x - z + (acaso(x, z, 13 + k) - 0.5) * 0.9) * ux, cy = (x + z + 1 + (acaso(x, z, 16 + k) - 0.5) * 0.9) * uy, r = Math.max(1.2, 0.05 * S);
        g.beginPath(); g.arc(cx, cy, r, 0, 6.2832); g.fillStyle = k === 1 ? COR.miolo : COR.flor; g.fill();
      }
    }
    // caminho: pedrinhas claras
    g.beginPath();
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
      if (fora(x, z) || tipo(x, z) !== CAMINHO) continue;
      for (let k = 0; k < 3; k++) {
        if (acaso(x, z, 20 + k) > 0.7) continue;
        const cx = (x - z + (acaso(x, z, 23 + k) - 0.5) * 1.0) * ux, cy = (x + z + 1 + (acaso(x, z, 26 + k) - 0.5) * 1.0) * uy, r = (0.05 + acaso(x, z, 29 + k) * 0.05) * S;
        g.moveTo(cx + r * 1.5, cy); g.ellipse(cx, cy, r * 1.5, r * 0.8, 0, 0, 6.2832);
      }
    }
    g.fillStyle = COR.caminhoClaro; g.fill();
    // terra arada: três sulcos ao longo de X, com um fio de luz ao lado
    for (const [qual, sulco, luz] of [[ARADA, COR.terraSulco, COR.terraLuz], [3, COR.molhadaSulco, COR.molhadaLuz]]) {
      for (let passe = 0; passe < 2; passe++) {
        g.beginPath();
        let ha = false;
        for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
          if (fora(x, z) || tipo(x, z) !== qual) continue;
          ha = true;
          for (let k = 1; k <= 3; k++) {
            const zz = z + k * 0.25 + (passe ? -0.07 : 0);
            g.moveTo(px(x + 0.1, zz), py(x + 0.1, zz)); g.lineTo(px(x + 0.9, zz), py(x + 0.9, zz));
          }
        }
        if (ha) { g.strokeStyle = passe ? luz : sulco; g.lineWidth = Math.max(1, (passe ? 0.03 : 0.055) * S); g.lineCap = 'round'; g.stroke(); }
      }
    }

    // 3. terra à venda: escurecida
    g.beginPath();
    let haVenda = false;
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) if (!fora(x, z) && !loc.propria[z * L + x]) { losango(x, z, 0.6); haVenda = true; }
    if (haVenda) { g.fillStyle = COR.venda; g.fill(); }

    // 4. bordas: contorno só onde a mancha acaba
    const lw = Math.max(1.5, 0.034 * S), alto = 0.085 * S; // espessura do canteiro, vista de frente
    const arada = (t) => t === ARADA || t === 3;
    // faixas da frente da terra arada (ela é um pouco mais alta que a grama)
    for (const molh of [false, true]) {
      g.beginPath();
      let ha = false;
      for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
        if (fora(x, z)) continue;
        const t = tipo(x, z);
        if (!arada(t) || (t === 3) !== molh) continue;
        if (!arada(tipo(x + 1, z))) { g.moveTo(px(x + 1, z), py(x + 1, z)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1) + alto); g.lineTo(px(x + 1, z), py(x + 1, z) + alto); g.closePath(); ha = true; }
        if (!arada(tipo(x, z + 1))) { g.moveTo(px(x, z + 1), py(x, z + 1)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1) + alto); g.lineTo(px(x, z + 1), py(x, z + 1) + alto); g.closePath(); ha = true; }
      }
      if (ha) { g.fillStyle = molh ? COR.molhadaLado : COR.terraLado; g.fill(); g.strokeStyle = COR.traco; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); }
    }
    // contorno da mancha de terra arada e da beira do caminho
    g.beginPath();
    const gCam = new Path2D();
    let haCam = false, haTerra = false;
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
      if (fora(x, z)) continue;
      const t = tipo(x, z);
      if (arada(t)) {
        if (!arada(tipo(x, z - 1))) { g.moveTo(px(x, z), py(x, z)); g.lineTo(px(x + 1, z), py(x + 1, z)); haTerra = true; }
        if (!arada(tipo(x - 1, z))) { g.moveTo(px(x, z), py(x, z)); g.lineTo(px(x, z + 1), py(x, z + 1)); haTerra = true; }
        if (!arada(tipo(x + 1, z))) { g.moveTo(px(x + 1, z), py(x + 1, z)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); haTerra = true; }
        if (!arada(tipo(x, z + 1))) { g.moveTo(px(x, z + 1), py(x, z + 1)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); haTerra = true; }
      } else if (t === CAMINHO) {
        const v = (xx, zz) => { const o = tipo(xx, zz); return o !== CAMINHO && o !== -1 && !arada(o); };
        if (v(x, z - 1)) { gCam.moveTo(px(x, z), py(x, z)); gCam.lineTo(px(x + 1, z), py(x + 1, z)); haCam = true; }
        if (v(x - 1, z)) { gCam.moveTo(px(x, z), py(x, z)); gCam.lineTo(px(x, z + 1), py(x, z + 1)); haCam = true; }
        if (v(x + 1, z)) { gCam.moveTo(px(x + 1, z), py(x + 1, z)); gCam.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); haCam = true; }
        if (v(x, z + 1)) { gCam.moveTo(px(x, z + 1), py(x, z + 1)); gCam.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); haCam = true; }
      }
    }
    g.lineCap = 'round'; g.lineJoin = 'round';
    if (haCam) { g.strokeStyle = COR.caminhoBorda; g.lineWidth = Math.max(1.5, 0.045 * S); g.stroke(gCam); }
    if (haTerra) { g.strokeStyle = COR.traco; g.lineWidth = lw; g.stroke(); }
    // divisa da terra própria
    g.beginPath();
    let haDiv = false;
    const minha = (x, z) => x >= 0 && z >= 0 && x < L && z < P && loc.propria[z * L + x] === 1;
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
      if (fora(x, z) || !minha(x, z)) continue;
      if (!minha(x, z - 1)) { g.moveTo(px(x, z), py(x, z)); g.lineTo(px(x + 1, z), py(x + 1, z)); haDiv = true; }
      if (!minha(x - 1, z)) { g.moveTo(px(x, z), py(x, z)); g.lineTo(px(x, z + 1), py(x, z + 1)); haDiv = true; }
      if (!minha(x + 1, z)) { g.moveTo(px(x + 1, z), py(x + 1, z)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); haDiv = true; }
      if (!minha(x, z + 1)) { g.moveTo(px(x, z + 1), py(x, z + 1)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); haDiv = true; }
    }
    if (haDiv) { g.strokeStyle = COR.divisa; g.lineWidth = Math.max(2, 0.05 * S); g.setLineDash([0.16 * S, 0.14 * S]); g.stroke(); g.setLineDash([]); }

    // 5. a beirada do mapa: barranco de terra nas duas faces que olham para a câmera, e o traço em volta
    const fundo = 0.75 * KA * S;
    if (xf === L - 1 || zf === P - 1) {
      g.lineWidth = lw; g.strokeStyle = COR.traco; g.lineJoin = 'round';
      if (xf === L - 1) {
        g.beginPath(); g.moveTo(px(L, 0), py(L, 0)); g.lineTo(px(L, P), py(L, P)); g.lineTo(px(L, P), py(L, P) + fundo); g.lineTo(px(L, 0), py(L, 0) + fundo); g.closePath();
        g.fillStyle = COR.barranco; g.fill(); g.stroke();
      }
      if (zf === P - 1) {
        g.beginPath(); g.moveTo(px(0, P), py(0, P)); g.lineTo(px(L, P), py(L, P)); g.lineTo(px(L, P), py(L, P) + fundo); g.lineTo(px(0, P), py(0, P) + fundo); g.closePath();
        g.fillStyle = COR.barrancoEscuro; g.fill(); g.stroke();
      }
    }
    if (xi === 0 || zi === 0) {
      g.beginPath();
      if (zi === 0) { g.moveTo(px(0, 0), py(0, 0)); g.lineTo(px(L, 0), py(L, 0)); }
      if (xi === 0) { g.moveTo(px(0, 0), py(0, 0)); g.lineTo(px(0, P), py(0, P)); }
      g.strokeStyle = COR.traco; g.lineWidth = lw; g.stroke();
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
  }
}
