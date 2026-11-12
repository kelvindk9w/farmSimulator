// Desvio mínimo: o personagem anda em linha reta sempre que dá; quando há algo no meio,
// contorna pelos cantos dos obstáculos (grafo de visibilidade pequeno + Dijkstra). Determinístico.
import { TIPOS } from './contrato.js';

export const FOLGA = 0.3; // "raio" do personagem: distância mínima até um obstáculo
const MARGEM_NO = 0.16; // os cantos de contorno ficam um pouco além da folga

export class Navegacao {
  constructor(sitio) {
    this.lim = sitio.terreno - 0.35;
    this.obst = [];
    this.nos = [];
    for (const [id, o] of Object.entries(sitio.objetos)) {
      const t = TIPOS[o.tipo];
      if (o.tipo === 'celeiro' || o.tipo === 'canteiro') this.obst.push({ id, ret: true, x0: o.x - t.tamanho[0] / 2, z0: o.z - t.tamanho[1] / 2, x1: o.x + t.tamanho[0] / 2, z1: o.z + t.tamanho[1] / 2 });
      else if (o.tipo === 'poco') this.obst.push({ id, x: o.x, z: o.z, r: t.raio });
      else if (o.tipo === 'arvore') this.obst.push({ id, x: o.x, z: o.z, r: t.raioTronco });
      else if (o.tipo === 'ninho') this.obst.push({ id, x: o.x, z: o.z, r: t.raio });
    }
    // cerca do pasto: quatro lados finos, com o vão da porteira no lado da frente (z1)
    const p = sitio.pasto, e = 0.05;
    this.pasto = p;
    const lado = (x0, z0, x1, z1) => this.obst.push({ id: 'cerca', ret: true, x0: Math.min(x0, x1) - e, z0: Math.min(z0, z1) - e, x1: Math.max(x0, x1) + e, z1: Math.max(z0, z1) + e });
    lado(p.x0, p.z0, p.x1, p.z0); lado(p.x0, p.z0, p.x0, p.z1); lado(p.x1, p.z0, p.x1, p.z1);
    lado(p.x0, p.z1, p.porteira.x0, p.z1); lado(p.porteira.x1, p.z1, p.x1, p.z1);
    const xc = (p.porteira.x0 + p.porteira.x1) / 2;
    this.porteiraFora = [xc, p.z1 + 0.65];
    this.porteiraDentro = [xc, p.z1 - 0.65];
    // nós de contorno
    const k = FOLGA + MARGEM_NO;
    for (const o of this.obst) {
      if (o.ret) for (const [x, z] of [[o.x0 - k, o.z0 - k], [o.x1 + k, o.z0 - k], [o.x1 + k, o.z1 + k], [o.x0 - k, o.z1 + k]]) this._no(x, z);
      else for (let i = 0; i < 8; i++) { const a = (i + 0.5) * Math.PI / 4, r = (o.r + k) / Math.cos(Math.PI / 8); this._no(o.x + Math.cos(a) * r, o.z + Math.sin(a) * r); }
    }
    this._no(...this.porteiraFora); this._no(...this.porteiraDentro);
  }

  _no(x, z) {
    if (Math.abs(x) > this.lim || Math.abs(z) > this.lim) return;
    if (this.bloqueado(x, z, FOLGA)) return;
    this.nos.push([x, z]);
  }

  // o ponto está dentro de algum obstáculo (inflado de "folga")?
  bloqueado(x, z, folga = FOLGA) {
    for (const o of this.obst) {
      if (o.ret) { if (x > o.x0 - folga && x < o.x1 + folga && z > o.z0 - folga && z < o.z1 + folga) return true; }
      else if (Math.hypot(x - o.x, z - o.z) < o.r + folga) return true;
    }
    return false;
  }

  // o segmento A-B passa livre de todos os obstáculos (inflados de "folga")?
  livre(ax, az, bx, bz, folga = FOLGA - 0.02) {
    const dx = bx - ax, dz = bz - az;
    for (const o of this.obst) {
      if (o.ret) {
        // recorte do segmento contra a caixa inflada
        let t0 = 0, t1 = 1, fora = false;
        for (const [p, d, lo, hi] of [[ax, dx, o.x0 - folga, o.x1 + folga], [az, dz, o.z0 - folga, o.z1 + folga]]) {
          if (Math.abs(d) < 1e-9) { if (p <= lo || p >= hi) { fora = true; break; } } else {
            let u0 = (lo - p) / d, u1 = (hi - p) / d;
            if (u0 > u1) [u0, u1] = [u1, u0];
            t0 = Math.max(t0, u0); t1 = Math.min(t1, u1);
            if (t0 >= t1) { fora = true; break; }
          }
        }
        if (!fora) return false;
      } else {
        const l2 = dx * dx + dz * dz;
        const t = l2 > 0 ? Math.max(0, Math.min(1, ((o.x - ax) * dx + (o.z - az) * dz) / l2)) : 0;
        if (Math.hypot(ax + dx * t - o.x, az + dz * t - o.z) < o.r + folga) return false;
      }
    }
    return true;
  }

  dentroDoPasto(x, z, margem = 0) {
    const p = this.pasto;
    return x > p.x0 - margem && x < p.x1 + margem && z > p.z0 - margem && z < p.z1 + margem;
  }

  // Ponto de chão tocado -> ponto válido mais próximo para o personagem parar (ou null se não achar).
  ajustar(x, z) {
    x = Math.max(-this.lim, Math.min(this.lim, x)); z = Math.max(-this.lim, Math.min(this.lim, z));
    if (this.dentroDoPasto(x, z, FOLGA)) return [...this.porteiraFora];
    const f = FOLGA + 0.04;
    for (let passada = 0; passada < 4; passada++) {
      let mexeu = false;
      for (const o of this.obst) {
        if (o.ret) {
          if (x > o.x0 - f && x < o.x1 + f && z > o.z0 - f && z < o.z1 + f) {
            // sai pelo lado mais perto
            const d = [x - (o.x0 - f), (o.x1 + f) - x, z - (o.z0 - f), (o.z1 + f) - z];
            const i = d.indexOf(Math.min(...d));
            if (i === 0) x = o.x0 - f; else if (i === 1) x = o.x1 + f; else if (i === 2) z = o.z0 - f; else z = o.z1 + f;
            mexeu = true;
          }
        } else {
          const d = Math.hypot(x - o.x, z - o.z);
          if (d < o.r + f) { const k = (o.r + f) / (d || 1); x = o.x + (d ? (x - o.x) * k : o.r + f); z = o.z + (z - o.z) * k; mexeu = true; }
        }
      }
      if (!mexeu) break;
    }
    if (Math.abs(x) > this.lim || Math.abs(z) > this.lim || this.bloqueado(x, z) || this.dentroDoPasto(x, z, FOLGA)) return null;
    return [x, z];
  }

  // Menor caminho de A até B: lista de pontos [x, z] (sem A, com B). Linha reta quando dá.
  rota(ax, az, bx, bz) {
    if (this.livre(ax, az, bx, bz)) return [[bx, bz]];
    const pts = [[ax, az], [bx, bz], ...this.nos];
    const n = pts.length;
    const dist = new Array(n).fill(Infinity), ant = new Array(n).fill(-1), feito = new Array(n).fill(false);
    dist[0] = 0;
    for (;;) {
      let u = -1;
      for (let i = 0; i < n; i++) if (!feito[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
      if (u < 0 || u === 1) break;
      feito[u] = true;
      for (let v = 1; v < n; v++) {
        if (feito[v]) continue;
        const d = dist[u] + Math.hypot(pts[v][0] - pts[u][0], pts[v][1] - pts[u][1]);
        if (d < dist[v] && this.livre(pts[u][0], pts[u][1], pts[v][0], pts[v][1])) { dist[v] = d; ant[v] = u; }
      }
    }
    if (dist[1] === Infinity) return [[bx, bz]]; // sem saída: vai reto (o teste de planta garante que não acontece)
    const rota = [];
    for (let i = 1; i > 0; i = ant[i]) rota.unshift(pts[i]);
    return rota;
  }

  static comprimento(ax, az, rota) {
    let s = 0, x = ax, z = az;
    for (const [px, pz] of rota) { s += Math.hypot(px - x, pz - z); x = px; z = pz; }
    return s;
  }
}
