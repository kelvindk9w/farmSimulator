// Renderizador compartilhado, presets de luz e câmeras.
import * as THREE from 'three';

let renderer = null;
export function getRenderer() {
  if (renderer) return renderer;
  const canvas = document.createElement('canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 0);
  renderer.info.autoReset = false;
  return renderer;
}

export const LUZ = {
  dia: {
    sun: { color: '#fff1d6', intensity: 2.75, az: -48, el: 50 },
    hemi: { sky: '#d4e8ff', ground: '#c9d6a0', intensity: 1.55 },
    shadowRadius: 2.2,
    fog: null,
  },
  // direção de arte "vibrante tropical": sol forte, sombras roxas mais profundas
  tropical: {
    sun: { color: '#fff3c4', intensity: 3.05, az: -48, el: 54 },
    hemi: { sky: '#bcd9ff', ground: '#b6e08a', intensity: 1.35 },
    shadowRadius: 1.8,
    fog: null,
  },
  // "pastel aconchegante": luz difusa, contraste baixo
  pastel: {
    sun: { color: '#fff0e2', intensity: 1.75, az: -48, el: 52 },
    hemi: { sky: '#fff3ea', ground: '#f1dfd0', intensity: 2.2 },
    shadowRadius: 3.5,
    fog: null,
  },
  // fim de tarde: sol baixo e quente, céu arroxeado
  dourada: {
    sun: { color: '#ffbe78', intensity: 3.5, az: -62, el: 25 },
    hemi: { sky: '#b5a6f2', ground: '#eaa87a', intensity: 1.8 },
    shadowRadius: 2.6,
    fog: null,
    golden: true,
  },
  // luz simétrica (vinda de cima/da câmera) usada nos sprites de personagem,
  // para que o espelhamento horizontal não inverta o lado iluminado
  sprite: {
    sun: { color: '#fff4e0', intensity: 2.3, az: 0, el: 58 },
    hemi: { sky: '#dfeaff', ground: '#cfd3b0', intensity: 1.75 },
    shadowRadius: 2,
    fog: null,
  },
  // folha de personagem (estúdio)
  estudio: {
    sun: { color: '#fff4e4', intensity: 2.4, az: -35, el: 48 },
    hemi: { sky: '#e6eeff', ground: '#d8ccb8', intensity: 1.7 },
    shadowRadius: 2.5,
    fog: null,
  },
};

export function sunDir(p) {
  const el = (p.sun.el * Math.PI) / 180, az = (p.sun.az * Math.PI) / 180;
  return new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
}

// Adiciona sol (com sombra) + luz hemisférica à cena.
export function addLights(scene, presetName, { center = new THREE.Vector3(), radius = 30, mapSize = 4096, shadows = true } = {}) {
  const p = typeof presetName === 'string' ? LUZ[presetName] : presetName;
  const hemi = new THREE.HemisphereLight(p.hemi.sky, p.hemi.ground, p.hemi.intensity);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(p.sun.color, p.sun.intensity);
  const dir = sunDir(p);
  sun.position.copy(center).addScaledVector(dir, radius * 2.5);
  sun.target.position.copy(center);
  scene.add(sun.target);
  sun.castShadow = shadows;
  if (shadows) {
    const cam = sun.shadow.camera;
    cam.left = -radius; cam.right = radius; cam.top = radius; cam.bottom = -radius;
    cam.near = 0.5; cam.far = radius * 5.5;
    cam.updateProjectionMatrix();
    sun.shadow.mapSize.set(mapSize, mapSize);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    sun.shadow.radius = p.shadowRadius;
  }
  scene.add(sun);
  return { sun, hemi, preset: p };
}

// Câmera ortográfica "isométrica" fixa: yaw 45°, elevação configurável.
// viewW = largura visível em unidades de mundo.
export function isoCamera({ target = [0, 0, 0], viewW = 40, aspect = 16 / 9, elev = 35.264, yaw = 45, dist = 120 }) {
  const viewH = viewW / aspect;
  const cam = new THREE.OrthographicCamera(-viewW / 2, viewW / 2, viewH / 2, -viewH / 2, 1, dist * 2.5);
  const e = (elev * Math.PI) / 180, y = (yaw * Math.PI) / 180;
  const t = new THREE.Vector3(...target);
  cam.position.set(t.x + Math.cos(e) * Math.sin(y) * dist, t.y + Math.sin(e) * dist, t.z + Math.cos(e) * Math.cos(y) * dist);
  cam.lookAt(t);
  cam.updateMatrixWorld(true);
  cam.userData = { viewW, viewH, elev, yaw };
  return cam;
}

// Renderiza uma cena num canvas 2D novo (com alfa). ss = fator de superamostragem.
export function renderToCanvas(scene, camera, w, h, { ss = 2, clear = null } = {}) {
  const r = getRenderer();
  r.setPixelRatio(1);
  r.setSize(w * ss, h * ss, false);
  if (clear) r.setClearColor(clear, 1); else r.setClearColor(0x000000, 0);
  r.info.reset();
  r.render(scene, camera);
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const ctx = out.getContext('2d');
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(r.domElement, 0, 0, w, h);
  return out;
}

export function disposeScene(scene) {
  scene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
  });
}
