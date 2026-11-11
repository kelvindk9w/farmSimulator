// Monta a fazenda em 3D a partir da planta (layout): terreno, lote estático, instâncias, avatares.
import * as THREE from 'three';
import { Builder, MAT } from '../lib/builder.js';
import { C, mix } from '../lib/palette.js';
import { rng, fbm2 } from '../lib/rng.js';
import { gerarLayout, mascara, FARM, AVATARES } from './layout.js';
import { KINDS, chave } from './kinds.js';
import { criarAvatar } from '../avatar/rig.js';
import { aplicarPose, ANIMS } from '../avatar/poses.js';

const DEG = Math.PI / 180;
export const ESCALA_AVATAR = 1.25; // personagens um pouco maiores que a escala real, para leitura

// cor do gramado a partir do ruído n (0..1) e da distância além da cerca (edge 0..1; -1 = dentro)
export function corGramaN(n, edge) {
  const c = new THREE.Color();
  if (edge < 0) {
    c.copy(C.grass);
    if (n > 0.5) c.lerp(C.grassLight, Math.min(1, (n - 0.5) * 3.2)); else c.lerp(C.grassDark, Math.min(1, (0.5 - n) * 2.6));
  } else {
    c.copy(C.grass).lerp(C.grassOuter, 0.45 + 0.55 * edge);
    c.lerp(n > 0.5 ? C.grassDark : C.forestLight, Math.abs(n - 0.5) * 1.2);
  }
  return c;
}
export function ruidoGrama(x, z) { return fbm2(x * 0.11 + 40, z * 0.11 + 40, 3); }
export function bordaGrama(x, z) {
  const inside = Math.abs(x) < FARM && Math.abs(z) < FARM;
  return inside ? -1 : Math.min(1, (Math.max(Math.abs(x), Math.abs(z)) - FARM) / 6);
}
// cor do gramado num ponto (a montagem 2D usa a mesma função, mas quantizada em poucos ladrilhos)
export function corGrama(x, z) { return corGramaN(ruidoGrama(x, z), bordaGrama(x, z)); }

function terreno(size = 64, step = 2) {
  const pos = [], col = [];
  const r = rng(77);
  for (let x = -size; x < size; x += step) for (let z = -size; z < size; z += step) {
    const quads = [[[x, z], [x, z + step], [x + step, z + step]], [[x, z], [x + step, z + step], [x + step, z]]];
    for (const tri of quads) {
      const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cz = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
      const c = corGrama(cx, cz).multiplyScalar(1 + (r() - 0.5) * 0.035);
      for (const [px, pz] of tri) { pos.push(px, 0, pz); col.push(c.r, c.g, c.b); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

function ceu(scene) {
  // domo com gradiente + morros + nuvens (só aparece na câmera em perspectiva)
  const g = new THREE.SphereGeometry(300, 24, 12);
  const p = g.attributes.position, colors = [];
  for (let i = 0; i < p.count; i++) {
    const t = Math.max(0, Math.min(1, p.getY(i) / 150));
    const c = C.skyHorizon.clone().lerp(C.skyTop, Math.pow(t, 0.6));
    colors.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const dome = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  dome.renderOrder = -10;
  scene.add(dome);
  const b = new Builder(99);
  const r = rng(314);
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2 + r() * 0.1, d = r.range(72, 96);
    const h = r.range(7, 17), w = r.range(16, 30);
    b.cone(w, h, 7, d > 84 ? C.hillFar : C.hill, { p: [Math.cos(a) * d, -0.5, Math.sin(a) * d], s: [1, 1, r.range(0.7, 1.2)], r: [0, r() * 360, 0], jit: 0.03, grad: mix(d > 84 ? C.hillFar : C.hill, C.skyHorizon, 0.25) });
  }
  const hills = b.mesh(new THREE.MeshLambertMaterial({ vertexColors: true }));
  hills.castShadow = false; hills.receiveShadow = false;
  scene.add(hills);
  const cb = new Builder(5);
  for (let i = 0; i < 16; i++) {
    const a = r() * Math.PI * 2, d = r.range(60, 150), y = r.range(26, 44), s = r.range(2.2, 4.5);
    cb.group({ p: [Math.cos(a) * d, y, Math.sin(a) * d], s, r: [0, r() * 360, 0] }, () => {
      cb.blob(1.5, 1, C.cloud, { s: [1.5, 0.7, 1], rough: 0.1 });
      cb.blob(1.1, 1, C.cloud, { p: [1.7, -0.15, 0.2], s: [1.3, 0.7, 1], rough: 0.1 });
      cb.blob(1.0, 1, C.cloud, { p: [-1.6, -0.2, -0.1], s: [1.3, 0.65, 1], rough: 0.1 });
    });
  }
  const clouds = cb.mesh(new THREE.MeshLambertMaterial({ vertexColors: true, fog: false, emissive: 0x666666 }));
  clouds.castShadow = false; clouds.receiveShadow = false;
  scene.add(clouds);
}

// Devolve { scene, avatars, layout, focus } pronta para receber luz e câmera.
export function montarFazenda({ avatarSet = 'A', sky = false, lit = false } = {}) {
  const layout = gerarLayout();
  const scene = new THREE.Scene();
  const mat = MAT();

  const ground = new THREE.Mesh(terreno(), mat);
  ground.receiveShadow = true; ground.name = 'terreno';
  scene.add(ground);

  const lote = new Builder(1), chao = new Builder(2);
  // caminhos
  for (const key of layout.paths) {
    const [x, z] = key.split(',').map(Number);
    const mask = mascara(layout.paths, x, z);
    chao.group({ p: [x + 0.5, 0, z + 0.5] }, () => KINDS.caminho.draw(chao, { mask, seed: (x * 7 + z * 13) & 255 }));
  }
  const inst = new Map();
  for (const e of layout.E) {
    const k = KINDS[e.k];
    if (!k) throw new Error('tipo desconhecido: ' + e.k);
    if (e.k === 'casa') e.lit = lit;
    if (k.cat === 'inst') {
      const key = chave(e);
      if (!inst.has(key)) inst.set(key, { e, list: [] });
      inst.get(key).list.push(e);
    } else {
      const b = k.cat === 'chao' ? chao : lote;
      if (k.abs) k.draw(b, e);
      else b.group({ p: [e.x, e.y || 0, e.z], r: [0, e.r || 0, 0], s: e.s || 1 }, () => k.draw(b, e));
    }
  }
  const mLote = lote.mesh(mat); mLote.name = 'lote-estatico'; scene.add(mLote);
  const brilho = lote.glowMesh(); if (brilho) scene.add(brilho);
  const mChao = chao.mesh(mat); mChao.name = 'chao'; mChao.castShadow = false; scene.add(mChao);

  const dummy = new THREE.Object3D();
  for (const [key, { e, list }] of inst) {
    const k = KINDS[e.k];
    const b = new Builder(3);
    k.draw(b, e);
    const im = new THREE.InstancedMesh(b.build(), mat, list.length);
    im.name = 'inst:' + key;
    list.forEach((it, i) => {
      dummy.position.set(it.x, it.y || 0, it.z);
      dummy.rotation.set(0, (it.r || 0) * DEG, 0);
      dummy.scale.setScalar(it.s || 1);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    });
    im.castShadow = !k.noShadow; im.receiveShadow = true;
    im.frustumCulled = false;
    scene.add(im);
  }

  // avatares
  const avatars = [];
  for (const a of AVATARES[avatarSet]) {
    const av = criarAvatar(a.outfit);
    av.group.position.set(a.x, 0, a.z);
    av.group.rotation.y = a.r * DEG;
    av.group.scale.setScalar(ESCALA_AVATAR);
    scene.add(av.group);
    aplicarPose(av, ANIMS[a.anim].fn(a.t));
    av.info = a;
    avatars.push(av);
  }
  if (sky) ceu(scene);
  return { scene, avatars, layout };
}

// estatísticas de um quadro: triângulos e draw calls (com e sem o passe de sombra)
export function medir(renderer, scene, camera) {
  const info = renderer.info;
  const lights = [];
  scene.traverse((o) => { if (o.isDirectionalLight) lights.push(o); });
  info.reset(); renderer.render(scene, camera);
  const total = { calls: info.render.calls, triangles: info.render.triangles };
  for (const l of lights) l.castShadow = false;
  info.reset(); renderer.render(scene, camera);
  const main = { calls: info.render.calls, triangles: info.render.triangles };
  for (const l of lights) { l.castShadow = true; l.shadow.needsUpdate = true; }
  info.reset(); renderer.render(scene, camera);
  let meshes = 0, instanced = 0, instances = 0;
  scene.traverse((o) => { if (o.isMesh) { meshes++; if (o.isInstancedMesh) { instanced++; instances += o.count; } } });
  return { comSombra: total, semSombra: main, meshes, instanced, instances, geometries: info.memory.geometries, textures: info.memory.textures };
}
