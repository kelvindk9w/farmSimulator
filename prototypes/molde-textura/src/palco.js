// Renderizador, luz e câmera da demonstração. A câmera é a mesma de `isoCamera()` em
// tools/visual-refs/src/lib/stage.js (ortográfica, giro de 45°, inclinação de 35,264°).
import * as THREE from 'three';

let renderer = null;
export function getRenderer() {
  if (renderer) return renderer;
  const canvas = document.createElement('canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.info.autoReset = false;
  return renderer;
}

// Luz suave vinda de cima e da esquerda da tela: um sol com sombra de borda macia e uma luz de céu que clareia as faces na sombra.
export const LUZ = {
  sol: { cor: '#fff3df', intensidade: 2.2, azimute: -40, elevacao: 42 },
  ceu: { cima: '#e4ecff', baixo: '#d9d2bf', intensidade: 1.75 },
  raioDaSombra: 3,
};

export function direcaoDoSol() {
  const el = (LUZ.sol.elevacao * Math.PI) / 180, az = (LUZ.sol.azimute * Math.PI) / 180;
  return new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
}

export function adicionarLuzes(cena, { centro = new THREE.Vector3(), raio = 20, sombras = true, mapa = 4096 } = {}) {
  cena.add(new THREE.HemisphereLight(LUZ.ceu.cima, LUZ.ceu.baixo, LUZ.ceu.intensidade));
  const sol = new THREE.DirectionalLight(LUZ.sol.cor, LUZ.sol.intensidade);
  sol.position.copy(centro).addScaledVector(direcaoDoSol(), raio * 2.5);
  sol.target.position.copy(centro);
  cena.add(sol.target);
  sol.castShadow = sombras;
  if (sombras) {
    const c = sol.shadow.camera;
    c.left = -raio; c.right = raio; c.top = raio; c.bottom = -raio;
    c.near = 0.5; c.far = raio * 5.5;
    c.updateProjectionMatrix();
    sol.shadow.mapSize.set(mapa, mapa);
    sol.shadow.bias = -0.0004;
    sol.shadow.normalBias = 0.03;
    sol.shadow.radius = LUZ.raioDaSombra;
  }
  cena.add(sol);
  return sol;
}

// Câmera do jogo. `largura` é a largura visível em unidades de mundo.
export function cameraIso({ alvo = [0, 0, 0], largura = 40, aspecto = 16 / 9, elevacao = 35.264, giro = 45, distancia = 120 } = {}) {
  const altura = largura / aspecto;
  const cam = new THREE.OrthographicCamera(-largura / 2, largura / 2, altura / 2, -altura / 2, 1, distancia * 2.5);
  const e = (elevacao * Math.PI) / 180, y = (giro * Math.PI) / 180;
  const t = new THREE.Vector3(...alvo);
  cam.position.set(t.x + Math.cos(e) * Math.sin(y) * distancia, t.y + Math.sin(e) * distancia, t.z + Math.cos(e) * Math.cos(y) * distancia);
  cam.lookAt(t);
  cam.updateMatrixWorld(true);
  return cam;
}

// Câmera do jogo ajustada para o objeto caber inteiro num quadro de proporção `aspecto`.
// O ajuste usa os vértices de verdade (não a caixa envolvente) e depende só da geometria:
// por isso o enquadramento é idêntico em todos os estados da comparação.
// `largura` (em unidades de mundo) fixa a escala em vez de ajustar ao objeto.
export function enquadrar(objeto, aspecto, { margem = 0.03, elevacao, giro, largura = null } = {}) {
  objeto.updateMatrixWorld(true);
  const cam = cameraIso({ elevacao, giro });
  const inv = cam.matrixWorld.clone().invert();
  const lim = new THREE.Box3(), v = new THREE.Vector3();
  objeto.traverse((o) => {
    if (!o.isMesh) return;
    const pos = o.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) lim.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv));
  });
  const cx = (lim.min.x + lim.max.x) / 2, cy = (lim.min.y + lim.max.y) / 2;
  let w = (lim.max.x - lim.min.x) * (1 + margem * 2), h = (lim.max.y - lim.min.y) * (1 + margem * 2);
  if (largura) { w = largura; h = largura / aspecto; } else if (w / h < aspecto) w = h * aspecto; else h = w / aspecto;
  cam.left = cx - w / 2; cam.right = cx + w / 2; cam.top = cy + h / 2; cam.bottom = cy - h / 2;
  cam.updateProjectionMatrix();
  cam.userData = { larguraNoMundo: lim.max.x - lim.min.x, alturaNoMundo: lim.max.y - lim.min.y };
  return cam;
}

// Renderiza a cena num canvas 2D novo. `ss` é o fator de superamostragem.
export function renderizar(cena, camera, w, h, { ss = 2, fundo = null } = {}) {
  const r = getRenderer();
  r.setPixelRatio(1);
  r.setSize(w * ss, h * ss, false);
  if (fundo) r.setClearColor(fundo, 1); else r.setClearColor(0x000000, 0);
  r.info.reset();
  r.render(cena, camera);
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const ctx = out.getContext('2d');
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(r.domElement, 0, 0, w, h);
  return out;
}
