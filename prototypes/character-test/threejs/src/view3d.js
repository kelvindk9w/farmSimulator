// Rota 3D em Three.js: GLB com esqueleto, AnimationMixer e transições suaves entre clipes.
import {
  CircleGeometry, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, OrthographicCamera, Scene, SRGBColorSpace, WebGLRenderer,
} from 'three';
import { Character3D } from './character3d.js';
import { addBenchLights } from './lights.js';
import { groundQuads, quadsGeometry } from './ground.js';

const LOOKS = [['A', false], ['B', false], ['C', false], ['A', true], ['B', true], ['C', true]];

export class View {
  static label = 'Three.js · 3D';

  async init(canvas, cfg, iso, assets) {
    this.cfg = cfg; this.iso = iso;
    const r = this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    r.outputColorSpace = SRGBColorSpace;
    const scene = this.scene = new Scene();
    scene.background = new Color(cfg.ground.background);

    // chão sem iluminação: fica exatamente na cor configurada, igual às outras variantes
    const G = cfg.ground, q = groundQuads(G);
    const flat = (color, y, order) => {
      const m = new Mesh(quadsGeometry(order === 0 ? q.base : order === 1 ? q.lines : q.border, ([x, z]) => [x, y, z]), new MeshBasicMaterial({ color, side: DoubleSide }));
      m.renderOrder = order; scene.add(m); return m;
    };
    flat(G.color, 0, 0); flat(G.gridColor, 0.002, 1); flat(G.borderColor, 0.003, 2);

    // sombra de contato simples (um disco escuro), igual nas quatro variantes
    this.shadow = new Mesh(new CircleGeometry(cfg.shadow.radius, 28).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: cfg.shadow.opacity, depthWrite: false }));
    this.shadow.position.y = 0.006; this.shadow.renderOrder = 3;
    scene.add(this.shadow);

    addBenchLights(scene, cfg.light);
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);

    this.character = await Character3D.load(assets + '3d/', cfg.model, cfg.animations);
    this.holder = new Group();
    this.holder.add(this.character.root);
    scene.add(this.holder);
    this.durations = { ...this.character.durations };
    this.serial = -1;
    this.lookCount = LOOKS.length;
    this.lookIndex = 0;
  }

  lookLabel(i) { const [hair, beard] = LOOKS[i]; return `cabelo ${hair}${beard ? ' + barba' : ''}`; }
  async setLook(i) { this.lookIndex = i % LOOKS.length; await this.character.setLook(...LOOKS[this.lookIndex]); }

  resize(w, h, dpr) {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    const C = this.cfg.camera, cam = this.camera;
    const viewH = w >= h ? C.viewUnits : (C.viewUnits * h) / w, viewW = (viewH * w) / h; // o menor lado da tela mostra viewUnits
    cam.left = -viewW / 2; cam.right = viewW / 2; cam.top = viewH / 2; cam.bottom = -viewH / 2;
    const d = this.iso.camDir();
    cam.position.set(d[0] * 30, C.lookAtY + d[1] * 30, d[2] * 30);
    cam.lookAt(0, C.lookAtY, 0);
    cam.updateProjectionMatrix();
  }

  // chamado a cada passo da simulação
  step(sim, dt) {
    if (sim.serial !== this.serial) {
      this.serial = sim.serial;
      this.character.play(sim.anim, sim.animFade, sim.animStart);
    }
    this.character.update(dt);
  }

  render(sim) {
    this.holder.position.set(sim.x, 0, sim.z);
    this.holder.rotation.y = (sim.yawDeg * Math.PI) / 180;
    this.shadow.position.x = sim.x; this.shadow.position.z = sim.z;
    this.renderer.render(this.scene, this.camera);
  }

  stats() {
    const i = this.renderer.info;
    // bytes de vértices/índices e de texturas do que está na cena (personagem + peças carregadas)
    let geometryBytes = 0, textureBytes = 0;
    const vistos = new Set();
    this.scene.traverse((o) => {
      if (!o.isMesh) return;
      if (!vistos.has(o.geometry)) {
        vistos.add(o.geometry);
        for (const a of Object.values(o.geometry.attributes)) geometryBytes += a.array.byteLength;
        if (o.geometry.index) geometryBytes += o.geometry.index.array.byteLength;
      }
      for (const m of [].concat(o.material)) for (const v of Object.values(m)) if (v && v.isTexture && v.image && !vistos.has(v)) { vistos.add(v); textureBytes += (v.image.width || 0) * (v.image.height || 0) * 4; }
    });
    return { drawCalls: i.render.calls, triangles: i.render.triangles, geometries: i.memory.geometries, textures: i.memory.textures, textureBytes, geometryBytes, character: this.character.info() };
  }
}
