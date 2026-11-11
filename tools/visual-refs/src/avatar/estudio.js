// "Estúdio": renderiza o avatar isolado (fundo transparente + sombra suave) para folhas e sprites.
import * as THREE from 'three';
import { addLights, getRenderer, LUZ } from '../lib/stage.js';
import { criarAvatar } from './rig.js';
import { aplicarPose, cenarioPose } from './poses.js';

export class Estudio {
  constructor({ light = 'estudio', shadow = true, shadowOpacity = 0.26 } = {}) {
    this.scene = new THREE.Scene();
    this.lights = addLights(this.scene, light, { center: new THREE.Vector3(0, 0.8, 0), radius: 2.6, mapSize: 1024, shadows: shadow });
    if (shadow) {
      const g = new THREE.Mesh(new THREE.PlaneGeometry(12, 12).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: shadowOpacity, color: 0x2a2440 }));
      g.receiveShadow = true;
      this.scene.add(g);
      this.floor = g;
    }
    this.holder = new THREE.Group();
    this.scene.add(this.holder);
    this.avatars = new Map();
    this.extras = [];
  }
  avatar(outfit) {
    const key = typeof outfit === 'string' ? outfit : outfit.nome;
    if (!this.avatars.has(key)) this.avatars.set(key, criarAvatar(outfit));
    return this.avatars.get(key);
  }
  // Renderiza e devolve um canvas 2D (w x h px). ppu = pixels por unidade de mundo.
  // chao = fração da altura onde fica a linha do chão. elev = elevação da câmera (graus).
  render({ outfit = 'ana', pose, yaw = 0, w = 256, h = 256, ppu = 120, elev = 12, chao = 0.86, ss = 2, extras = [], centerX = 0, bones = false }) {
    const av = this.avatar(outfit);
    for (const c of [...this.holder.children]) this.holder.remove(c);
    this.holder.add(av.group);
    av.group.rotation.set(0, (yaw * Math.PI) / 180, 0);
    aplicarPose(av, pose);
    for (const e of extras) {
      const m = cenarioPose(e.type);
      m.position.set(...(e.p || [0, 0, 0]));
      const g = new THREE.Group(); g.rotation.y = (yaw * Math.PI) / 180; g.add(m);
      this.holder.add(g);
    }
    const viewW = w / ppu, viewH = h / ppu;
    const cam = new THREE.OrthographicCamera(-viewW / 2, viewW / 2, viewH / 2, -viewH / 2, 0.1, 50);
    const e = (elev * Math.PI) / 180;
    // alvo: ponto do chão deslocado para que y=0 caia na linha "chao"
    const up = (chao - 0.5) * viewH; // quanto o chão fica abaixo do centro, em unidades de tela
    const dir = new THREE.Vector3(0, Math.sin(e), Math.cos(e));
    const upVec = new THREE.Vector3(0, Math.cos(e), -Math.sin(e));
    const target = new THREE.Vector3(centerX, 0, 0).addScaledVector(upVec, up);
    cam.position.copy(target).addScaledVector(dir, 20);
    cam.up.set(0, 1, 0);
    cam.lookAt(target);
    cam.updateMatrixWorld(true);
    this.holder.updateMatrixWorld(true);
    const r = getRenderer();
    r.setPixelRatio(1);
    r.setSize(w * ss, h * ss, false);
    r.setClearColor(0x000000, 0);
    r.render(this.scene, cam);
    const out = document.createElement('canvas');
    out.width = w; out.height = h;
    const ctx = out.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(r.domElement, 0, 0, w, h);
    if (bones) desenharOssos(ctx, av, cam, w, h);
    return out;
  }
}

// desenha o esqueleto (juntas e ossos) por cima do render
export function desenharOssos(ctx, av, cam, w, h) {
  const P = (bone) => { const v = new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld).project(cam); return [(v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * h]; };
  ctx.lineWidth = Math.max(2, w / 110); ctx.lineCap = 'round';
  for (const b of av.bones) {
    if (!b.parent || !b.parent.isBone) continue;
    const a = P(b.parent), c = P(b);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(4, w / 70); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...c); ctx.stroke();
    ctx.strokeStyle = '#1e6fd9'; ctx.lineWidth = Math.max(2, w / 130); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...c); ctx.stroke();
  }
  for (const b of av.bones) {
    const a = P(b);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(a[0], a[1], Math.max(4, w / 60), 0, 7); ctx.fill();
    ctx.fillStyle = '#ff5a3c'; ctx.beginPath(); ctx.arc(a[0], a[1], Math.max(2.5, w / 95), 0, 7); ctx.fill();
  }
}
