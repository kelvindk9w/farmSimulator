// Cena: renderizador, luz e a câmera isométrica fixa (ortográfica, giro 45°, elevação 35,264°).
// A câmera nunca gira; só enquadra: "tudo" mostra o sítio inteiro, "perto" acompanha o personagem.
import * as THREE from 'three';

const RAD = Math.PI / 180;
const GIRO = 45 * RAD, ELEV = 35.264 * RAD;
// vetores da câmera no mundo
const DIR = new THREE.Vector3(Math.cos(ELEV) * Math.sin(GIRO), Math.sin(ELEV), Math.cos(ELEV) * Math.cos(GIRO)); // do alvo para a câmera
const DIREITA = new THREE.Vector3(Math.cos(GIRO), 0, -Math.sin(GIRO));
const CIMA = new THREE.Vector3().crossVectors(DIR, DIREITA).normalize();
const CEU = 0xcfeaf7;

export class Cena {
  constructor(canvas, sitio) {
    this.canvas = canvas;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NoToneMapping;
    r.setClearColor(CEU, 1);
    this.scene = new THREE.Scene();
    // luz do dia de tools/visual-refs, sem mapas de sombra (as sombras são manchas simples no chão)
    this.scene.add(new THREE.HemisphereLight('#d4e8ff', '#c9d6a0', 1.55));
    const sol = new THREE.DirectionalLight('#fff1d6', 2.75);
    const el = 50 * RAD, az = -48 * RAD;
    sol.position.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).multiplyScalar(40);
    this.scene.add(sol);
    this.arte = new THREE.Group(); // todos os visuais entram aqui
    this.scene.add(this.arte);
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 200);
    this.camera.position.copy(DIR).multiplyScalar(80);
    this.camera.lookAt(0, 0, 0);
    this.orientacao = this.camera.quaternion.clone();
    // pontos que têm de caber na tela no enquadramento "tudo"
    const L = sitio.terreno;
    this.cantos = [];
    for (const [x, z] of [[-L, -L], [L, -L], [L, L], [-L, L]]) this.cantos.push(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, -0.6, z));
    const ALTURA = { celeiro: 4.4, arvore: 4.4, poco: 2.5 };
    for (const o of Object.values(sitio.objetos)) if (ALTURA[o.tipo]) this.cantos.push(new THREE.Vector3(o.x, ALTURA[o.tipo], o.z));
    this.modo = 'tudo'; // 'tudo' | 'perto'
    this.fixo = null;
    this.w = 1; this.h = 1; this.dpr = 1; this.escala = 30; // px (CSS) por unidade de mundo
    this.margens = { cima: 0, baixo: 0, esq: 0, dir: 0 };
    this.centro = new THREE.Vector2(); // centro da vista no plano da câmera (u = direita, v = cima)
    this.foco = new THREE.Vector3(); // ponto que a vista "perto" acompanha
    this.arrasto = new THREE.Vector2(); // deslocamento manual da vista "perto"
    this._caixa = { u0: 0, u1: 0, v0: 0, v1: 0 };
    for (const p of this.cantos) {
      const u = p.dot(DIREITA), v = p.dot(CIMA), c = this._caixa;
      if (p === this.cantos[0]) { c.u0 = c.u1 = u; c.v0 = c.v1 = v; }
      c.u0 = Math.min(c.u0, u); c.u1 = Math.max(c.u1, u); c.v0 = Math.min(c.v0, v); c.v1 = Math.max(c.v1, v);
    }
  }

  redimensionar(w, h, dpr, margens) {
    this.w = w; this.h = h; this.dpr = Math.min(dpr || 1, 2); // no máximo 2 pixels de tela por pixel de CSS
    if (margens) this.margens = margens;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h, false);
    this._enquadrar(true);
  }
  definirModo(modo) { this.modo = modo; this.arrasto.set(0, 0); this._enquadrar(true); }
  // escala do enquadramento "tudo" (px por unidade): a interface usa para decidir se vale começar de perto
  escalaTudo() {
    const c = this._caixa, m = this.margens;
    return Math.min((this.w - m.esq - m.dir) / (c.u1 - c.u0), (this.h - m.cima - m.baixo) / (c.v1 - c.v0));
  }
  seguir(x, z, dt) { this.foco.set(x, 1.0, z); this._enquadrar(false, dt); }
  // para as ferramentas de captura: prende a vista num ponto do mundo, com uma escala dada (px por unidade); null solta
  fixar(ponto, escala) { this.fixo = ponto ? { p: new THREE.Vector3(ponto[0], ponto[1], ponto[2]), escala } : null; this._enquadrar(true); }
  // até onde o centro da vista "de perto" pode ir sem sair do sítio
  _limites() {
    const c = this._caixa, m = this.margens;
    const mu = (this.w - m.esq - m.dir) / 2 / this.escala, mv = (this.h - m.cima - m.baixo) / 2 / this.escala;
    const cu = (c.u0 + c.u1) / 2, cv = (c.v0 + c.v1) / 2, su = c.u1 - c.u0 <= 2 * mu, sv = c.v1 - c.v0 <= 2 * mv;
    return { u0: su ? cu : c.u0 + mu, u1: su ? cu : c.u1 - mu, v0: sv ? cv : c.v0 + mv, v1: sv ? cv : c.v1 - mv };
  }
  // arrastar o dedo (só de perto): a vista acompanha o dedo na hora e para na beira do sítio, sem "sobra" para desfazer
  arrastar(dxPx, dyPx) {
    if (this.modo !== 'perto' || this.fixo) return;
    const L = this._limites(), fu = this.foco.dot(DIREITA), fv = this.foco.dot(CIMA);
    const u = Math.max(L.u0, Math.min(L.u1, fu + this.arrasto.x)) - dxPx / this.escala, v = Math.max(L.v0, Math.min(L.v1, fv + this.arrasto.y)) + dyPx / this.escala;
    this.arrasto.set(Math.max(L.u0, Math.min(L.u1, u)) - fu, Math.max(L.v0, Math.min(L.v1, v)) - fv);
    this._enquadrar(true);
  }
  soltarArrasto() { this.arrasto.set(0, 0); }

  _enquadrar(direto, dt = 0) {
    const c = this._caixa, m = this.margens, w = this.w, h = this.h;
    const util = { w: w - m.esq - m.dir, h: h - m.cima - m.baixo };
    const tudo = this.escalaTudo();
    let u, v;
    if (this.fixo) {
      this.escala = this.fixo.escala;
      u = this.fixo.p.dot(DIREITA); v = this.fixo.p.dot(CIMA);
      direto = true;
    } else if (this.modo === 'tudo') {
      this.escala = tudo;
      u = (c.u0 + c.u1) / 2; v = (c.v0 + c.v1) / 2;
    } else {
      this.escala = Math.max(tudo * 1.15, Math.min(62, Math.max(40, tudo * 2)));
      u = this.foco.dot(DIREITA) + this.arrasto.x; v = this.foco.dot(CIMA) + this.arrasto.y;
      // não deixa a vista sair do sítio
      const L = this._limites();
      u = Math.max(L.u0, Math.min(L.u1, u)); v = Math.max(L.v0, Math.min(L.v1, v));
    }
    // o ponto (u, v) tem de aparecer no centro da área útil (a tela menos as margens da interface)
    const alvoU = u - (m.esq + util.w / 2 - w / 2) / this.escala, alvoV = v + (m.cima + util.h / 2 - h / 2) / this.escala;
    if (direto) this.centro.set(alvoU, alvoV);
    else { const k = 1 - Math.exp(-5 * dt); this.centro.x += (alvoU - this.centro.x) * k; this.centro.y += (alvoV - this.centro.y) * k; }
    const cam = this.camera, mw = w / 2 / this.escala, mh = h / 2 / this.escala;
    cam.left = -mw; cam.right = mw; cam.top = mh; cam.bottom = -mh;
    cam.updateProjectionMatrix();
    cam.quaternion.copy(this.orientacao);
    cam.position.copy(DIR).multiplyScalar(80).addScaledVector(DIREITA, this.centro.x).addScaledVector(CIMA, this.centro.y);
    cam.updateMatrixWorld(true);
  }

  renderizar() { this.renderer.render(this.scene, this.camera); }

  // ponto do mundo -> pixel de CSS
  paraTela(x, y, z, out = [0, 0]) {
    const u = x * DIREITA.x + z * DIREITA.z, v = x * CIMA.x + y * CIMA.y + z * CIMA.z;
    out[0] = this.w / 2 + (u - this.centro.x) * this.escala;
    out[1] = this.h / 2 - (v - this.centro.y) * this.escala;
    return out;
  }
  // pixel de CSS -> raio no mundo (a direção é sempre a mesma: câmera ortográfica)
  raio(px, py) {
    const u = this.centro.x + (px - this.w / 2) / this.escala, v = this.centro.y - (py - this.h / 2) / this.escala;
    const o = new THREE.Vector3().copy(DIR).multiplyScalar(80).addScaledVector(DIREITA, u).addScaledVector(CIMA, v);
    return { o, d: DIR.clone().negate() };
  }
  // em que caixa de toque o pixel cai (a mais próxima da câmera); folga em unidades de mundo
  objetoEm(px, py, caixas, folga = 0.12) {
    const { o, d } = this.raio(px, py);
    let melhor = null, tMelhor = Infinity;
    for (const c of caixas) {
      let t0 = -Infinity, t1 = Infinity, fora = false;
      for (const e of ['x', 'y', 'z']) {
        const i = e === 'x' ? 0 : e === 'y' ? 1 : 2, lo = c.min[i] - folga, hi = c.max[i] + folga;
        let a = (lo - o[e]) / d[e], b = (hi - o[e]) / d[e];
        if (a > b) [a, b] = [b, a];
        t0 = Math.max(t0, a); t1 = Math.min(t1, b);
        if (t0 > t1) { fora = true; break; }
      }
      if (!fora && t0 < tMelhor) { tMelhor = t0; melhor = c.id; }
    }
    return melhor;
  }
  // ponto do chão (y = 0) debaixo do pixel
  chaoEm(px, py) { const { o, d } = this.raio(px, py); const t = -o.y / d.y; return [o.x + d.x * t, o.z + d.z * t]; }

  // chamadas de desenho e triângulos do último quadro
  estatisticas() { const i = this.renderer.info.render; return { chamadas: i.calls, triangulos: i.triangles }; }
}
