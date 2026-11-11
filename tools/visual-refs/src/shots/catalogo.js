// Catálogo de modelos: cada modelo renderizado sozinho (serve para revisar a modelagem).
import * as THREE from 'three';
import { Builder, MAT } from '../lib/builder.js';
import { C } from '../lib/palette.js';
import { addLights, isoCamera, renderToCanvas } from '../lib/stage.js';

export function renderModel(fn, { w = 300, h = 300, light = 'dia', elev = 35.264, yaw = 45, ground = true, pad = 1.12, ss = 2 } = {}) {
  const scene = new THREE.Scene();
  const b = new Builder(3);
  fn(b);
  const mesh = b.mesh(MAT());
  scene.add(mesh);
  const box = new THREE.Box3().setFromObject(mesh);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const rad = Math.max(size.x, size.z) * 0.75 + 0.6;
  if (ground) {
    const g = new THREE.Mesh(new THREE.CircleGeometry(rad, 40).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: C.grass }));
    g.receiveShadow = true; g.position.set(center.x, -0.001, center.z);
    scene.add(g);
  }
  addLights(scene, light, { center, radius: Math.max(rad, size.y) * 1.3 + 1, mapSize: 1024 });
  // enquadra pela projeção da caixa
  const cam = isoCamera({ target: [center.x, center.y, center.z], viewW: 10, aspect: w / h, elev, yaw });
  const pts = [];
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) pts.push(new THREE.Vector3(x, y, z));
  if (ground) for (let i = 0; i < 8; i++) pts.push(new THREE.Vector3(center.x + Math.cos(i * 0.785) * rad, 0, center.z + Math.sin(i * 0.785) * rad));
  let maxX = 0, maxY = 0;
  for (const p of pts) { const q = p.clone().applyMatrix4(cam.matrixWorldInverse); maxX = Math.max(maxX, Math.abs(q.x)); maxY = Math.max(maxY, Math.abs(q.y)); }
  const viewW = Math.max(maxX * 2, maxY * 2 * (w / h)) * pad;
  const cam2 = isoCamera({ target: [center.x, center.y, center.z], viewW, aspect: w / h, elev, yaw });
  const canvas = renderToCanvas(scene, cam2, w, h, { ss });
  const tris = b.triangles;
  mesh.geometry.dispose();
  return { canvas, tris };
}

export function catalogo(items, { cols = 6, cell = 300, titulo = '', sub = '' } = {}) {
  const k = window.devicePixelRatio || 1;
  document.body.innerHTML = '';
  document.body.style.cssText = 'margin:0;background:#f6efe2;font-family:Inter,sans-serif;color:#4a2f1b';
  const W = cols * (cell + 10) + 70;
  const pg = document.createElement('div');
  pg.style.cssText = `width:${W}px;padding:34px 40px 30px;box-sizing:border-box`;
  if (titulo) pg.innerHTML = `<h1 style="font-size:40px;font-weight:900;margin:0 0 4px">${titulo}</h1><p style="font-size:19px;font-weight:600;opacity:.78;margin:0 0 20px;line-height:1.35;max-width:1600px">${sub}</p>`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `display:grid;grid-template-columns:repeat(${cols},${cell}px);gap:10px`;
  for (const it of items) {
    const px = Math.round(cell * k);
    const { canvas, tris } = renderModel(it.fn, { w: px, h: Math.round(px * 0.86), ...(it.opts || {}) });
    canvas.style.cssText = `width:${cell}px;height:${Math.round(cell * 0.86)}px;display:block`;
    const d = document.createElement('div');
    d.style.cssText = 'background:#fffaf0;border:2px solid #e3d5bb;border-radius:14px;overflow:hidden;text-align:center;padding-bottom:9px';
    d.appendChild(canvas);
    const l = document.createElement('div');
    l.innerHTML = `<span style="font-size:16.5px;font-weight:800">${it.name}</span><br><span style="font-size:13.5px;font-weight:600;opacity:.7">${tris.toLocaleString('pt-BR')} triângulos</span>`;
    d.appendChild(l);
    wrap.appendChild(d);
  }
  pg.appendChild(wrap);
  document.body.appendChild(pg);
  return { width: W, height: Math.ceil(pg.getBoundingClientRect().height) };
}
