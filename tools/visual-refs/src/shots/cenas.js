// Tomadas da fazenda em 3D: opção A (ortográfica isométrica) e opção B (perspectiva atrás do avatar).
import * as THREE from 'three';
import { setPalette, C } from '../lib/palette.js';
import { resetMat } from '../lib/builder.js';
import { getRenderer, addLights, isoCamera, LUZ } from '../lib/stage.js';
import { montarFazenda, medir } from '../farm/scene3d.js';
import { BONE_INDEX } from '../avatar/rig.js';
import { montarHUD, etiquetas } from '../hud/hud.js';

export const ELEV = 35.264; // isométrica verdadeira

function palco() {
  document.body.innerHTML = '';
  document.body.style.cssText = 'margin:0;overflow:hidden;background:#000';
  const r = getRenderer();
  const w = window.innerWidth, h = window.innerHeight;
  r.setPixelRatio(window.devicePixelRatio || 1);
  r.setSize(w, h, false);
  const cv = r.domElement;
  cv.style.cssText = `position:fixed;left:0;top:0;width:${w}px;height:${h}px;display:block`;
  document.body.appendChild(cv);
  return { r, w, h };
}

function tagsDe(avatars, camera, w, h) {
  return avatars.map((av) => {
    const head = av.bones[BONE_INDEX.head];
    const v = new THREE.Vector3(0, 0.62, 0).applyMatrix4(head.matrixWorld);
    // usa um ponto fixo acima do corpo para a etiqueta não "dançar" com a pose
    const base = new THREE.Vector3().setFromMatrixPosition(av.group.matrixWorld);
    const top = new THREE.Vector3(base.x, Math.max(v.y, 1.9), base.z).lerp(v, 0.5);
    const p = top.project(camera);
    return { nome: av.outfit.nome, cor: av.outfit.tag, x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h };
  });
}

// ---------- Opção A ----------
export function cenaA(o = {}) {
  const portrait = window.innerHeight > window.innerWidth;
  const paleta = o.paleta || 'base';
  const luz = o.luz || (paleta === 'base' ? 'dia' : paleta);
  setPalette(paleta); resetMat();
  const { r, w, h } = palco();
  const { scene, avatars } = montarFazenda({ avatarSet: 'A', lit: !!LUZ[luz].golden });
  const viewW = o.viewW || (portrait ? 24.5 : 41);
  const target = o.target || (portrait ? [0.2, 0, 0.6] : [-0.4, 0, -0.2]);
  const camera = isoCamera({ target, viewW, aspect: w / h, elev: ELEV });
  const vh = viewW / (w / h) / Math.sin((ELEV * Math.PI) / 180);
  const radius = Math.max(viewW, vh) * 0.62 + 6;
  addLights(scene, luz, { center: new THREE.Vector3(target[0], 0, target[2]), radius, mapSize: o.mapSize || 4096 });
  r.setClearColor(C.grassOuter, 1);
  const stats = o.medir ? medir(r, scene, camera) : null;
  r.info.reset();
  r.render(scene, camera);
  if (LUZ[luz].golden) veu('linear-gradient(205deg, rgba(255,186,110,0.16) 0%, rgba(255,160,100,0.04) 50%, rgba(80,60,150,0.14) 100%)');
  if (o.hud !== false) {
    etiquetas(tagsDe(avatars, camera, w, h), { portrait });
    montarHUD({ portrait, modo: 'A', tema: paleta });
  }
  return { stats, tris: r.info.render.triangles, calls: r.info.render.calls };
}

function veu(css) {
  const d = document.createElement('div');
  d.style.cssText = `position:fixed;inset:0;pointer-events:none;background:${css};mix-blend-mode:normal`;
  document.body.appendChild(d);
}

// ---------- Opção B ----------
export function cenaB(o = {}) {
  const portrait = window.innerHeight > window.innerWidth;
  const paleta = o.paleta || 'base';
  const luz = o.luz || 'dia';
  setPalette(paleta); resetMat();
  const { r, w, h } = palco();
  const { scene, avatars } = montarFazenda({ avatarSet: 'B', sky: true });
  const bia = avatars.find((a) => a.outfit.nome === 'Bia');
  const p = bia.group.position;
  // câmera acima e atrás do avatar (ela anda para -X, rumo ao curral e à casa)
  const fov = portrait ? 58 : 40;
  const camera = new THREE.PerspectiveCamera(fov, w / h, 0.3, 600);
  const cp = o.cam || (portrait ? [6.4, 5.0, 0.9] : [7.2, 4.5, 1.9]);
  const lk = o.look || (portrait ? [-6, 0.4, -0.6] : [-6, 0.3, -1.5]);
  camera.position.set(p.x + cp[0], cp[1], p.z + cp[2]);
  camera.lookAt(p.x + lk[0], lk[1], p.z + lk[2]);
  camera.updateMatrixWorld(true);
  scene.fog = new THREE.Fog(C.skyHorizon, 55, 150);
  addLights(scene, luz, { center: new THREE.Vector3(p.x - 12, 0, p.z - 2), radius: 32, mapSize: o.mapSize || 4096 });
  r.setClearColor(C.skyHorizon, 1);
  const stats = o.medir ? medir(r, scene, camera) : null;
  r.info.reset();
  r.render(scene, camera);
  if (o.hud !== false) {
    etiquetas(tagsDe(avatars, camera, w, h), { portrait, big: true });
    montarHUD({ portrait, modo: 'B', tema: paleta });
  }
  return { stats, tris: r.info.render.triangles, calls: r.info.render.calls };
}
