// Rota 2D em Three.js: folhas de sprites quadro a quadro. Não carrega o GLB nem o código de animação 3D.
// O personagem é um quadrilátero texturizado; a direção escolhe a linha da folha e o espelhamento.
import {
  CircleGeometry, ClampToEdgeWrapping, Color, ColorManagement, CustomBlending, DoubleSide, Group, LinearFilter, LinearSRGBColorSpace, Mesh,
  MeshBasicMaterial, OneFactor, OneMinusSrcAlphaFactor, OrthographicCamera, PlaneGeometry, Scene, TextureLoader, WebGLRenderer,
} from 'three';
import { groundQuads, quadsGeometry } from './ground.js';
import { normalizeSpriteMeta, rowFor, frameAt } from './sprites.js';
import { DIRS } from './iso.js';

export class View {
  static label = 'Three.js · 2D';

  async init(canvas, cfg, iso, assets) {
    this.cfg = cfg; this.iso = iso; this.base = assets + '2d/';
    // 2D "de verdade": as cores das folhas vão para a tela como foram pintadas (sem conversão de espaço de cor)
    ColorManagement.enabled = false;
    const r = this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    r.outputColorSpace = LinearSRGBColorSpace;
    r.setClearColor(new Color(cfg.ground.background), 1);
    this.scene = new Scene();
    this.camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10);

    // "mundo" já projetado: filhos em unidades de mundo na tela; a escala do grupo é pixels por unidade
    const world = this.world = new Group();
    this.scene.add(world);
    const G = cfg.ground, q = groundQuads(G);
    const proj = ([x, z]) => [...iso.project(x, 0, z), 0];
    const flat = (quads, color, order) => {
      const m = new Mesh(quadsGeometry(quads, proj), new MeshBasicMaterial({ color, side: DoubleSide, depthTest: false }));
      m.renderOrder = order; world.add(m);
    };
    flat(q.base, G.color, 0); flat(q.lines, G.gridColor, 1); flat(q.border, G.borderColor, 2);

    this.shadow = new Mesh(new CircleGeometry(cfg.shadow.radius, 28), new MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: cfg.shadow.opacity, depthTest: false }));
    this.shadow.scale.y = iso.sinE; this.shadow.renderOrder = 3;
    world.add(this.shadow);

    // sprites.json + uma textura por animação
    let raw = {};
    try { raw = await (await fetch(this.base + cfg.sprites.json)).json(); } catch (e) { console.warn('[bancada] sprites.json não pôde ser lido:', e.message); }
    const meta = this.meta = normalizeSpriteMeta(raw, cfg.sprites, cfg.animations);
    this.loader = new TextureLoader();
    this.tex = {};
    this.textureBytes = 0;
    await Promise.all(Object.entries(meta.animations).map(async ([name, a]) => {
      const t = this.tex[name] = await this._texture(a.file);
      if (!a.frames) a.frames = Math.max(1, Math.round(t.image.width / meta.cell[0])); // sem contagem no JSON: deduz da largura
      a.cols = Math.max(1, Math.round(t.image.width / meta.cell[0]));
      a.rows = Math.max(1, Math.round(t.image.height / meta.cell[1]));
      if (a.rows !== meta.directions.length) console.warn(`[bancada] ${a.file}: ${a.rows} linhas, esperava ${meta.directions.length}`);
    }));
    this.durations = Object.fromEntries(Object.entries(meta.animations).map(([n, a]) => [n, a.frames / a.fps]));

    const [cw, ch] = meta.cell, [ax, ay] = meta.anchor;
    const geo = new PlaneGeometry(cw, ch).translate(cw / 2 - ax, ay - ch / 2, 0); // ponto de apoio na origem
    // textura pré-multiplicada (filtragem sem franja escura) => mistura ONE / ONE_MINUS_SRC_ALPHA
    this.mat = new MeshBasicMaterial({ map: this.tex.idle, transparent: true, depthTest: false, blending: CustomBlending, blendSrc: OneFactor, blendDst: OneMinusSrcAlphaFactor });
    this.sprite = new Mesh(geo, this.mat);
    this.sprite.scale.setScalar(1 / meta.pixelsPerUnit);
    this.sprite.renderOrder = 4;
    world.add(this.sprite);

    this.lookCount = 2;
    this.lookIndex = 0;
    this.varTex = null;
  }

  async _texture(file) {
    const t = await this.loader.loadAsync(this.base + file);
    t.premultiplyAlpha = true;
    t.generateMipmaps = false; t.minFilter = LinearFilter; t.magFilter = LinearFilter;
    t.wrapS = t.wrapT = ClampToEdgeWrapping;
    this.textureBytes += t.image.width * t.image.height * 4;
    return t;
  }

  lookLabel(i) { return i ? 'B (só no andar)' : 'A'; }
  async setLook(i) {
    this.lookIndex = i % 2;
    if (this.lookIndex && !this.varTex) this.varTex = await this._texture(this.cfg.sprites.variantWalk);
  }

  resize(w, h, dpr) {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    const C = this.cfg.camera, cam = this.camera;
    cam.left = -w / 2; cam.right = w / 2; cam.top = h / 2; cam.bottom = -h / 2; // unidades = px de CSS
    cam.updateProjectionMatrix();
    const ppu = Math.min(w, h) / C.viewUnits; // o menor lado da tela mostra viewUnits
    this.world.scale.set(ppu, ppu, 1);
    this.world.position.y = -C.lookAtY * this.iso.cosE * ppu; // mesmo enquadramento da câmera 3D
  }

  step() { /* nada: o quadro sai direto do relógio da simulação */ }

  render(sim) {
    const meta = this.meta, a = meta.animations[sim.anim];
    const tex = sim.anim === 'walk' && this.lookIndex === 1 && this.varTex ? this.varTex : this.tex[sim.anim];
    const col = frameAt(a, sim.animTime);
    const { row, flip } = rowFor(meta, DIRS[sim.dir]);
    tex.repeat.set((flip ? -1 : 1) / a.cols, 1 / a.rows);
    tex.offset.set((flip ? col + 1 : col) / a.cols, 1 - (row + 1) / a.rows);
    this.mat.map = tex;
    const [sx, sy] = this.iso.project(sim.x, 0, sim.z);
    const [cw] = meta.cell, [ax] = meta.anchor;
    this.sprite.position.set(sx + (flip ? (2 * ax - cw) / meta.pixelsPerUnit : 0), sy, 0);
    this.shadow.position.set(sx, sy, 0);
    this.renderer.render(this.scene, this.camera);
  }

  stats() {
    const i = this.renderer.info;
    return { drawCalls: i.render.calls, triangles: i.render.triangles, geometries: i.memory.geometries, textures: i.memory.textures, textureBytes: this.textureBytes, sheets: Object.keys(this.tex).length + (this.varTex ? 1 : 0) };
  }
}
