// O chão, desenhado por código no estilo de contorno e guardado em blocos (canvas fora da tela, alinhados à tela).
// Cada bloco só é refeito quando uma casa dele muda (ou quando o zoom muda); a cada quadro o chão é só colar blocos.
// Grama com detalhe leve, caminho de terra, terra à venda escurecida. O campo de plantação é uma mancha só: terra de
// plantio sem sulco (clara, com grãos e torrões), terra arada com sulcos compridos ao longo de X (sem emenda entre as
// casas) e terra molhada, mais escura; contorno só na borda da mancha, com um degrau de terra onde ela encontra a grama,
// e estacas baixas nos quatro cantos do campo inicial (terras.json: inicial.campo). Tudo isto fica nos blocos: não
// custa nada por quadro. Fora do mapa o chão segue no mesmo verde escuro, sem detalhe.
import { KX, KY } from './camera.js';
import { GRAMA, ARADA, CAMINHO, CAMPO } from '../nucleo/local.js';
import { acaso } from '../nucleo/util.js';

const T = 256; // lado do bloco, em pontos do canvas
const COR = {
  ceu: '#619439', // fora do mapa: o mesmo verde da terra à venda, sem detalhe (o mundo não acaba num barranco)
  grama: '#86c63f', gramaClara: '#97d24b', gramaEscura: '#5f9f2c',
  campo: '#d98c4a', campoGrao: '#a35d2a', campoLuz: '#eeb070', torrao: '#bb733b', // terra de plantio sem sulco
  terra: '#b86a30', terraSulco: '#7f3e16', terraLuz: '#d68d4f', terraLado: '#8a4a1f', // arada
  molhada: '#723b1b', molhadaSulco: '#4a230d', molhadaLuz: '#9a5a2e', molhadaLado: '#4f2a14', brilho: 'rgba(255, 232, 196, 0.32)',
  estaca: '#a8743f', estacaLuz: '#d29a5e',
  caminho: '#f0b765', caminhoClaro: '#f8d08c', caminhoBorda: '#c98a3a',
  traco: '#3a2412', flor: '#fff6d8', miolo: '#f6c12c',
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
    const M = 0.9 * S; // folga: as faixas da frente da terra arada saem da casa
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
    const bases = [[GRAMA, COR.grama], [CAMINHO, COR.caminho], [CAMPO, COR.campo], [ARADA, COR.terra], [3, COR.molhada]];
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
    // campo de plantação: terra sem sulco com grãos escuros e claros e uns torrões
    g.beginPath();
    const gr = Math.max(0.8, 0.026 * S);
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
      if (fora(x, z) || tipo(x, z) !== CAMPO) continue;
      for (let k = 0; k < 7; k++) {
        const cx = (x - z + (acaso(x, z, 40 + k) - 0.5) * 1.5) * ux, cy = (x + z + 1 + (acaso(x, z, 50 + k) - 0.5) * 1.5) * uy;
        g.moveTo(cx + gr, cy); g.arc(cx, cy, gr * (0.7 + acaso(x, z, 60 + k) * 0.6), 0, 6.2832);
      }
    }
    g.fillStyle = COR.campoGrao; g.fill();
    g.beginPath();
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
      if (fora(x, z) || tipo(x, z) !== CAMPO) continue;
      for (let k = 0; k < 4; k++) {
        const cx = (x - z + (acaso(x, z, 70 + k) - 0.5) * 1.5) * ux, cy = (x + z + 1 + (acaso(x, z, 75 + k) - 0.5) * 1.5) * uy;
        g.moveTo(cx + gr, cy); g.arc(cx, cy, gr * 0.8, 0, 6.2832);
      }
    }
    g.fillStyle = COR.campoLuz; g.fill();
    // torrões: um ou dois por casa, com contorno e luz em cima
    const torroes = new Path2D(), luzes = new Path2D();
    let haTorrao = false;
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
      if (fora(x, z) || tipo(x, z) !== CAMPO) continue;
      const n = acaso(x, z, 80) < 0.55 ? 2 : 1;
      for (let k = 0; k < n; k++) {
        const cx = (x - z + (acaso(x, z, 81 + k) - 0.5) * 1.1) * ux, cy = (x + z + 1 + (acaso(x, z, 84 + k) - 0.5) * 1.1) * uy, r = (0.055 + acaso(x, z, 87 + k) * 0.035) * S;
        torroes.moveTo(cx + r * 1.3, cy); torroes.ellipse(cx, cy, r * 1.3, r * 0.85, 0, 0, 6.2832);
        luzes.moveTo(cx + r * 0.6, cy - r * 0.3); luzes.ellipse(cx - r * 0.15, cy - r * 0.3, r * 0.65, r * 0.32, 0, 0, 6.2832);
        haTorrao = true;
      }
    }
    if (haTorrao) { g.fillStyle = COR.torrao; g.fill(torroes); g.strokeStyle = 'rgba(58, 36, 18, 0.55)'; g.lineWidth = Math.max(1, 0.018 * S); g.stroke(torroes); g.fillStyle = COR.campoLuz; g.fill(luzes); }

    // terra arada: sulcos compridos ao longo de X, três por casa e espaçados por igual também de uma fileira à
    // outra; cada sulco corre a fileira inteira de uma vez (sem emenda entre as casas), com um fio de luz na crista
    const arada = (t) => t === ARADA || t === 3;
    for (const [qual, sulco, luz] of [[ARADA, COR.terraSulco, COR.terraLuz], [3, COR.molhadaSulco, COR.molhadaLuz]]) {
      for (let passe = 0; passe < 2; passe++) {
        g.beginPath();
        let ha = false;
        for (let z = zi; z <= zf; z++) {
          let x = xi;
          while (x <= xf) {
            if (tipo(x, z) !== qual) { x++; continue; }
            let b = x;
            while (b + 1 <= L - 1 && tipo(b + 1, z) === qual) b++;
            // a corrida [x, b]: as pontas só recuam onde a terra arada acaba (encostada noutra arada, segue reto)
            const a0 = arada(tipo(x - 1, z)) ? x : x + 0.1, a1 = arada(tipo(b + 1, z)) ? b + 1 : b + 0.9;
            ha = true;
            for (let k = 0; k < 3; k++) {
              const zz = z + (passe ? k / 3 + 0.04 : (k + 0.5) / 3);
              if (passe && k === 0) continue; // a crista de cima da fileira é a borda dela
              g.moveTo(px(a0, zz), py(a0, zz)); g.lineTo(px(a1, zz), py(a1, zz));
            }
            x = b + 1;
          }
        }
        if (ha) { g.strokeStyle = passe ? luz : sulco; g.lineWidth = Math.max(1, (passe ? 0.035 : 0.07) * S); g.lineCap = 'butt'; g.stroke(); }
      }
    }
    // terra molhada: uns reflexos de água nos sulcos
    g.beginPath();
    let haBrilho = false;
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
      if (fora(x, z) || tipo(x, z) !== 3) continue;
      for (let k = 0; k < 2; k++) {
        if (acaso(x, z, 90 + k) > 0.7) continue;
        const zz = z + (Math.floor(acaso(x, z, 92 + k) * 3) + 0.5) / 3, xa = x + 0.1 + acaso(x, z, 94 + k) * 0.5;
        g.moveTo(px(xa, zz - 0.02), py(xa, zz - 0.02)); g.lineTo(px(xa + 0.28, zz - 0.02), py(xa + 0.28, zz - 0.02));
        haBrilho = true;
      }
    }
    if (haBrilho) { g.strokeStyle = COR.brilho; g.lineWidth = Math.max(1, 0.03 * S); g.lineCap = 'round'; g.stroke(); }

    // 3. terra à venda: escurecida
    g.beginPath();
    let haVenda = false;
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) if (!fora(x, z) && !loc.propria[z * L + x]) { losango(x, z, 0.6); haVenda = true; }
    if (haVenda) { g.fillStyle = COR.venda; g.fill(); }

    // 4. bordas: contorno só onde a mancha acaba
    const lw = Math.max(1.5, 0.034 * S), alto = 0.06 * S; // o degrau do campo, visto de frente
    const doCampo = (t) => t === ARADA || t === 3 || t === CAMPO; // campo sem sulco, arada e molhada: uma mancha só
    // degrau na frente do campo (ele fica um pouco acima da grama), na cor da terra da casa da beirada
    for (const molh of [false, true]) {
      g.beginPath();
      let ha = false;
      for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
        if (fora(x, z)) continue;
        const t = tipo(x, z);
        if (!doCampo(t) || (t === 3) !== molh) continue;
        if (!doCampo(tipo(x + 1, z))) { g.moveTo(px(x + 1, z), py(x + 1, z)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1) + alto); g.lineTo(px(x + 1, z), py(x + 1, z) + alto); g.closePath(); ha = true; }
        if (!doCampo(tipo(x, z + 1))) { g.moveTo(px(x, z + 1), py(x, z + 1)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1) + alto); g.lineTo(px(x, z + 1), py(x, z + 1) + alto); g.closePath(); ha = true; }
      }
      if (ha) { g.fillStyle = molh ? COR.molhadaLado : COR.terraLado; g.fill(); g.strokeStyle = COR.traco; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); }
    }
    // contorno da mancha do campo e da beira do caminho
    g.beginPath();
    const gCam = new Path2D(), tufos = new Path2D();
    let haCam = false, haTerra = false, haTufo = false;
    // tufos de grama que caem por cima da borda de trás do campo (a grama fica mais alta que a terra)
    const tufo = (xa, za, xb, zb, sx, sz) => {
      for (let k = 0; k < 2; k++) {
        const f = 0.25 + k * 0.5 + (acaso(xa * 3 + sx, za * 3 + sz, 96 + k) - 0.5) * 0.2, qx = xa + (xb - xa) * f, qz = za + (zb - za) * f;
        if (acaso(xa * 5 + sx, za * 5 + sz, 98 + k) > 0.6) continue;
        const cx = px(qx, qz), cy = py(qx, qz), h = 0.1 * S;
        tufos.moveTo(cx - h * 0.6, cy - h * 0.5); tufos.lineTo(cx - h * 0.1, cy + h * 0.35); tufos.moveTo(cx, cy - h * 0.8); tufos.lineTo(cx + h * 0.05, cy + h * 0.4); tufos.moveTo(cx + h * 0.6, cy - h * 0.5); tufos.lineTo(cx + h * 0.15, cy + h * 0.35);
        haTufo = true;
      }
    };
    for (let z = zi; z <= zf; z++) for (let x = xi; x <= xf; x++) {
      if (fora(x, z)) continue;
      const t = tipo(x, z);
      if (doCampo(t)) {
        const nz = tipo(x, z - 1), nx = tipo(x - 1, z);
        if (!doCampo(nz)) { g.moveTo(px(x, z), py(x, z)); g.lineTo(px(x + 1, z), py(x + 1, z)); haTerra = true; if (nz === GRAMA) tufo(x, z, x + 1, z, 1, 0); }
        if (!doCampo(nx)) { g.moveTo(px(x, z), py(x, z)); g.lineTo(px(x, z + 1), py(x, z + 1)); haTerra = true; if (nx === GRAMA) tufo(x, z, x, z + 1, 0, 1); }
        if (!doCampo(tipo(x + 1, z))) { g.moveTo(px(x + 1, z), py(x + 1, z)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); haTerra = true; }
        if (!doCampo(tipo(x, z + 1))) { g.moveTo(px(x, z + 1), py(x, z + 1)); g.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); haTerra = true; }
      } else if (t === CAMINHO) {
        const v = (xx, zz) => { const o = tipo(xx, zz); return o !== CAMINHO && o !== -1 && !doCampo(o); };
        if (v(x, z - 1)) { gCam.moveTo(px(x, z), py(x, z)); gCam.lineTo(px(x + 1, z), py(x + 1, z)); haCam = true; }
        if (v(x - 1, z)) { gCam.moveTo(px(x, z), py(x, z)); gCam.lineTo(px(x, z + 1), py(x, z + 1)); haCam = true; }
        if (v(x + 1, z)) { gCam.moveTo(px(x + 1, z), py(x + 1, z)); gCam.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); haCam = true; }
        if (v(x, z + 1)) { gCam.moveTo(px(x, z + 1), py(x, z + 1)); gCam.lineTo(px(x + 1, z + 1), py(x + 1, z + 1)); haCam = true; }
      }
    }
    g.lineCap = 'round'; g.lineJoin = 'round';
    if (haCam) { g.strokeStyle = COR.caminhoBorda; g.lineWidth = Math.max(1.5, 0.045 * S); g.stroke(gCam); }
    if (haTerra) { g.strokeStyle = COR.traco; g.lineWidth = lw; g.stroke(); }
    if (haTufo) { g.strokeStyle = COR.gramaEscura; g.lineWidth = Math.max(1, 0.03 * S); g.stroke(tufos); }
    // estacas baixas nos cantos do campo inicial (de enfeite: não ocupam a casa)
    const C = loc.id === 'fazenda' && mundo.dados.terras.campo;
    if (C) {
      const h = 0.36 * S, w = 0.055 * S, corpo = new Path2D(), topos = new Path2D(), sombras = new Path2D();
      let ha = false;
      for (const [cx0, cz0, ox, oz] of [[C[0], C[1], -1, -1], [C[2], C[1], 1, -1], [C[0], C[3], -1, 1], [C[2], C[3], 1, 1]]) {
        const qx = cx0 + ox * 0.14, qz = cz0 + oz * 0.14, sx = px(qx, qz), sy = py(qx, qz);
        if (sx + 3 * w < x0 || sx - 3 * w > x0 + T || sy + 2 * w < y0 || sy - h > y0 + T) continue;
        sombras.moveTo(sx + w * 2.4, sy); sombras.ellipse(sx, sy, w * 2.4, w * 1.2, 0, 0, 6.2832);
        corpo.moveTo(sx - w, sy); corpo.lineTo(sx - w, sy - h + w); corpo.lineTo(sx, sy - h); corpo.lineTo(sx + w, sy - h + w); corpo.lineTo(sx + w, sy); corpo.closePath();
        topos.moveTo(sx - w, sy - h + w); topos.lineTo(sx, sy - h); topos.lineTo(sx + w, sy - h + w); topos.lineTo(sx, sy - h + 2 * w); topos.closePath();
        ha = true;
      }
      if (ha) {
        g.fillStyle = 'rgba(34, 52, 20, 0.25)'; g.fill(sombras);
        g.fillStyle = COR.estaca; g.fill(corpo); g.strokeStyle = COR.traco; g.lineWidth = Math.max(1, 0.025 * S); g.lineJoin = 'round'; g.stroke(corpo);
        g.fillStyle = COR.estacaLuz; g.fill(topos);
      }
    }
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

    g.setTransform(1, 0, 0, 1, 0, 0);
  }
}
