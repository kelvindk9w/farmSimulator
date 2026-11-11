// Cercas, porteira, lagoa, canteiros, caminhos e objetos de cena.
import { C, mix, shade } from '../lib/palette.js';
import { rng } from '../lib/rng.js';

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;

// ---------- Cerca de madeira ----------
export function mourao(b, o = {}) {
  b.group(o, () => {
    b.box(0.16, 0.95, 0.16, C.woodDark, { grad: C.wood });
    b.tbox(0.16, 0.16, 0.08, 0.08, 0.08, C.wood, { p: [0, 0.95, 0] });
  });
}
// trecho de cerca entre dois pontos (x,z); desenha os mourões e duas réguas
export function cerca(b, x0, z0, x1, z1, o = {}) {
  const r = rng(Math.round(x0 * 13 + z0 * 7 + x1 * 3 + z1) + 100);
  const L = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(1, Math.round(L / (o.step || 2)));
  const yaw = -Math.atan2(z1 - z0, x1 - x0) / DEG;
  for (let i = 0; i <= n; i++) {
    if (i === n && o.noEnd) break;
    if (i === 0 && o.noStart) continue;
    const t = i / n;
    mourao(b, { p: [x0 + (x1 - x0) * t, 0, z0 + (z1 - z0) * t], r: [r.range(-3, 3), yaw, r.range(-3, 3)] });
  }
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, seg = L / n;
    const cx = x0 + (x1 - x0) * t, cz = z0 + (z1 - z0) * t;
    b.box(seg + 0.1, 0.11, 0.05, i % 2 ? C.wood : C.woodLight, { p: [cx, 0.64 + r.range(-0.02, 0.02), cz], r: [0, yaw, r.range(-1.5, 1.5)] });
    b.box(seg + 0.1, 0.11, 0.05, i % 2 ? C.woodLight : C.wood, { p: [cx, 0.3 + r.range(-0.02, 0.02), cz], r: [0, yaw, r.range(-1.5, 1.5)] });
  }
}
// cerca de tela (galinheiro): mourões finos + fios
export function tela(b, x0, z0, x1, z1) {
  const L = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(1, Math.round(L / 1.5));
  const yaw = -Math.atan2(z1 - z0, x1 - x0) / DEG;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    b.box(0.09, 1.0, 0.09, C.woodLight, { p: [x0 + (x1 - x0) * t, 0, z0 + (z1 - z0) * t], r: [0, yaw, 0] });
  }
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  b.box(L, 0.05, 0.05, C.woodLight, { p: [cx, 0.95, cz], r: [0, yaw, 0] });
  for (const y of [0.2, 0.45, 0.7]) b.box(L, 0.018, 0.018, C.metalDark, { p: [cx, y, cz], r: [0, yaw, 0] });
  const m = Math.round(L / 0.3);
  for (let i = 1; i < m; i++) {
    const t = i / m;
    b.box(0.016, 0.85, 0.016, C.metalDark, { p: [x0 + (x1 - x0) * t, 0.08, z0 + (z1 - z0) * t] });
  }
}
export function porteira(b, o = {}) {
  b.group(o, () => {
    const W = 3.0;
    for (const sx of [-1, 1]) {
      b.box(0.24, 1.9, 0.24, C.woodDark, { p: [sx * (W / 2 + 0.12), 0, 0], grad: C.wood });
      b.tbox(0.24, 0.24, 0.1, 0.1, 0.12, C.wood, { p: [sx * (W / 2 + 0.12), 1.9, 0] });
    }
    b.box(W + 0.9, 0.16, 0.16, C.wood, { p: [0, 2.05, 0] });
    // folha aberta para dentro
    b.group({ p: [-W / 2, 0, 0], r: [0, -68, 0] }, () => {
      for (const y of [0.2, 0.55, 0.9]) b.box(W - 0.1, 0.1, 0.06, C.woodLight, { p: [W / 2, y, 0] });
      b.box(0.1, 1.0, 0.08, C.wood, { p: [0.08, 0.1, 0] });
      b.box(0.1, 1.0, 0.08, C.wood, { p: [W - 0.12, 0.1, 0] });
      b.box(0.09, W * 0.98, 0.05, C.wood, { p: [W / 2, 0.57, 0.01], r: [0, 0, 74], order: 'XYZ' });
    });
  });
}

// ---------- Canteiro ----------
export function canteiro(b, w, d, o = {}) {
  const wet = o.wet || 0; // fração (em X) já regada
  const h = 0.14;
  b.tbox(w + 0.25, d + 0.25, w + 0.05, d + 0.05, h, C.soilDark, { jit: 0.03 });
  const rows = o.rows || Math.round(d / 0.9);
  const rw = d / rows;
  for (let i = 0; i < rows; i++) {
    const z = -d / 2 + (i + 0.5) * rw;
    if (wet > 0) {
      const ww = w * wet;
      b.tbox(ww, rw * 0.78, ww - 0.04, rw * 0.42, 0.11, C.soilWet, { p: [-w / 2 + ww / 2, h - 0.01, z], jit: 0.03 });
      if (wet < 1) b.tbox(w - ww, rw * 0.78, w - ww - 0.04, rw * 0.42, 0.11, C.soil, { p: [w / 2 - (w - ww) / 2, h - 0.01, z], jit: 0.03, grad: C.soilLight });
    } else {
      b.tbox(w - 0.05, rw * 0.78, w - 0.12, rw * 0.42, 0.11, C.soil, { p: [0, h - 0.01, z], jit: 0.03, grad: C.soilLight });
    }
  }
}
// plaquinha do canteiro (cor identifica a cultura)
export function plaquinha(b, color, o = {}) {
  b.group(o, () => {
    b.box(0.06, 0.55, 0.06, C.woodDark, {});
    b.box(0.5, 0.36, 0.05, C.woodPale, { p: [0, 0.5, 0.02] });
    b.box(0.3, 0.2, 0.03, color, { p: [0, 0.58, 0.05] });
  });
}

// ---------- Lagoa ----------
export function lagoaForma(rx, rz, seed = 4, n = 22, wob = 0.14) {
  const r = rng(seed);
  const pts = [];
  const ph = [r() * TAU, r() * TAU, r() * TAU];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const k = 1 + wob * (Math.sin(a * 2 + ph[0]) * 0.55 + Math.sin(a * 3 + ph[1]) * 0.35 + Math.sin(a * 5 + ph[2]) * 0.2);
    pts.push([Math.cos(a) * rx * k, Math.sin(a) * rz * k]);
  }
  return pts;
}
const scalePts = (pts, k) => pts.map(([x, z]) => [x * k, z * k]);

export function lagoa(b, o = {}) {
  const rx = o.rx || 4.6, rz = o.rz || 3.3;
  const r = rng(51);
  const shape = lagoaForma(rx, rz, 4);
  b.slab(scalePts(shape, 1.1), 0.06, C.sand, { jit: 0.03 });
  b.slab(shape, 0.03, C.waterLight, { p: [0, 0.045, 0] });
  b.slab(scalePts(shape, 0.86), 0.03, C.water, { p: [0, 0.06, 0] });
  b.slab(scalePts(shape, 0.58), 0.03, C.waterDeep, { p: [0, 0.075, 0], r: [0, 14, 0] });
  // brilhos
  for (let i = 0; i < 5; i++) {
    const a = r() * TAU, d = r.range(0.15, 0.6);
    b.box(r.range(0.5, 0.9), 0.012, 0.06, C.foam, { p: [Math.cos(a) * rx * d, 0.108, Math.sin(a) * rz * d], r: [0, r.range(-12, 12), 0] });
  }
  // vitórias-régias
  const pads = [[-1.6, 0.9, 0.42], [-0.9, 1.5, 0.3], [1.2, -1.0, 0.38], [2.0, -0.4, 0.26], [0.6, 1.6, 0.24]];
  pads.forEach(([x, z, rad], i) => {
    b.cyl(rad, rad * 0.94, 0.035, 9, C.lily, { p: [x, 0.1, z], grad: mix(C.lily, C.white, 0.12) });
    b.cyl(rad * 1.02, rad * 0.98, 0.07, 9, mix(C.lily, C.leafDark, 0.4), { p: [x, 0.1, z], open: true });
    if (i % 2 === 0) { b.cone(0.11, 0.14, 6, C.lilyFlower, { p: [x + rad * 0.3, 0.13, z], r: [180, 0, 0] }); b.ico(0.05, 0, C.clothYellow, { p: [x + rad * 0.3, 0.15, z] }); }
  });
  // taboas na margem
  for (let i = 0; i < 16; i++) {
    const a = r.pick([0.3, 0.5, 2.6, 2.9, 3.4, 4.9, 5.2]) + r.range(-0.18, 0.18);
    const k = r.range(0.93, 1.06);
    const x = Math.cos(a) * rx * k, z = Math.sin(a) * rz * k;
    const h = r.range(0.7, 1.15);
    b.leaf(h, 0.07, 18, C.reed, { p: [x, 0.05, z], r: [r.range(2, 10), r() * 360, 0], steps: 2, fold: 0.3 });
    if (i % 2) { b.cyl(0.012, 0.012, h, 3, C.reed, { p: [x + 0.06, 0.05, z + 0.04] }); b.cyl(0.04, 0.04, 0.2, 5, C.trunkDark, { p: [x + 0.06, h - 0.12, z + 0.04] }); }
  }
  // pedras da margem
  for (let i = 0; i < 9; i++) {
    const a = r() * TAU, x = Math.cos(a) * rx * 1.04, z = Math.sin(a) * rz * 1.04;
    b.blob(r.range(0.18, 0.34), 0, i % 3 ? C.stone : C.stoneDark, { p: [x, 0.1, z], s: [1.2, 0.7, 1], jit: 0.06, grad: C.stoneLight, rough: 0.22 });
  }
  // trapiche
  if (o.pier !== false) {
    b.group({ p: [rx * 0.86, 0, rz * 0.25], r: [0, 18, 0] }, () => {
      for (let i = 0; i < 7; i++) b.box(0.3, 0.06, 1.1, i % 2 ? C.woodLight : C.wood, { p: [-0.35 * i, 0.34, 0] });
      for (const i of [0, 3, 6]) for (const sz of [-1, 1]) b.cyl(0.07, 0.08, 0.62, 6, C.woodDark, { p: [-0.35 * i, 0, sz * 0.48] });
    });
  }
}

export function pato(b, o = {}) {
  b.group(o, () => {
    b.sph(0.17, 7, 5, C.henWhite, { p: [0, 0.12, 0], s: [0.9, 0.75, 1.35], smooth: true });
    b.cone(0.09, 0.16, 5, C.henWhite, { p: [0, 0.12, -0.2], r: [-60, 0, 0] });
    b.cyl(0.05, 0.065, 0.2, 6, C.henWhite, { p: [0, 0.17, 0.14], r: [12, 0, 0], smooth: true });
    b.sph(0.075, 7, 5, C.henWhite, { p: [0, 0.4, 0.19], smooth: true });
    b.box(0.07, 0.03, 0.1, C.beak, { p: [0, 0.37, 0.25] });
    for (const sx of [-1, 1]) b.sph(0.014, 4, 3, C.eye, { p: [sx * 0.055, 0.42, 0.23] });
  });
}

// ---------- Caminho de terra: célula com cantos arredondados conforme vizinhos ----------
// mask: bits N(−z)=1, L(+x)=2, S(+z)=4, O(−x)=8
export function celulaCaminho(b, mask, seed = 1) {
  const r = rng(seed * 31 + mask);
  const h = 0.035, m = 0.2; // margem onde não há vizinho
  const N = mask & 1, E = mask & 2, S = mask & 4, W = mask & 8;
  const x0 = W ? -0.5 : -0.5 + m, x1 = E ? 0.5 : 0.5 - m, z0 = N ? -0.5 : -0.5 + m, z1 = S ? 0.5 : 0.5 - m;
  const cr = 0.16;
  const pts = [];
  const corner = (cx, cz, a0, round) => {
    if (!round) { pts.push([cx + Math.cos(a0 + Math.PI / 4) * cr * Math.SQRT2, cz + Math.sin(a0 + Math.PI / 4) * cr * Math.SQRT2]); return; }
    for (let i = 0; i <= 3; i++) { const a = a0 + (i / 3) * (Math.PI / 2); pts.push([cx + Math.cos(a) * cr, cz + Math.sin(a) * cr]); }
  };
  corner(x1 - cr, z1 - cr, 0, !E && !S);
  corner(x0 + cr, z1 - cr, Math.PI / 2, !W && !S);
  corner(x0 + cr, z0 + cr, Math.PI, !W && !N);
  corner(x1 - cr, z0 + cr, Math.PI * 1.5, !E && !N);
  b.slab(pts, h, C.path, { jit: 0.025 });
  // manchas claras e pedrinhas
  if (r() < 0.6) b.disc(r.range(0.1, 0.18), r.range(0.07, 0.12), 6, 0.012, C.pathLight, { p: [r.range(-0.2, 0.2), h, r.range(-0.2, 0.2)], r: [0, r() * 180, 0] });
  if (r() < 0.35) b.disc(r.range(0.06, 0.12), r.range(0.05, 0.09), 5, 0.012, C.pathDark, { p: [r.range(-0.22, 0.22), h, r.range(-0.22, 0.22)], r: [0, r() * 180, 0] });
  if (r() < 0.22) b.ico(0.045, 0, C.stoneLight, { p: [r.range(-0.25, 0.25), h + 0.01, r.range(-0.25, 0.25)] });
}

// ---------- Objetos ----------
export function poco(b) {
  b.cyl(0.75, 0.8, 0.75, 10, C.stone, { jit: 0.07, grad: C.stoneLight });
  b.cyl(0.6, 0.6, 0.05, 10, C.waterDeep, { p: [0, 0.6, 0] });
  b.cyl(0.8, 0.8, 0.1, 10, C.stoneDark, { p: [0, 0.72, 0], open: true });
  for (const sx of [-1, 1]) b.box(0.12, 1.75, 0.12, C.woodDark, { p: [sx * 0.72, 0, 0] });
  b.cyl(0.06, 0.06, 1.5, 6, C.wood, { p: [-0.75, 1.35, 0], r: [0, 0, -90], order: 'XYZ' });
  b.cyl(0.012, 0.012, 0.45, 3, C.rope, { p: [0, 0.9, 0] });
  b.cyl(0.13, 0.1, 0.2, 7, C.wood, { p: [0, 0.75, 0] });
  // telhadinho
  for (const s of [-1, 1]) b.box(1.9, 0.06, 0.75, C.roof, { p: [0, 1.75, s * 0.3], r: [s * 32, 0, 0] });
  b.box(1.95, 0.08, 0.14, C.roofDark, { p: [0, 1.98, 0] });
}

export function carrinho(b, o = {}) { // carrinho de mão
  b.group(o, () => {
    b.cyl(0.2, 0.2, 0.09, 10, C.black, { p: [-0.045, 0.2, 0.55], r: [0, 0, 90], order: 'XYZ' });
    b.tbox(0.5, 0.75, 0.72, 1.0, 0.32, C.clothGreen, { p: [0, 0.3, -0.05], grad: mix(C.clothGreen, C.white, 0.2) });
    b.tbox(0.4, 0.6, 0.62, 0.9, 0.05, C.hay, { p: [0, 0.6, -0.05] });
    for (const sx of [-1, 1]) {
      b.box(0.045, 0.045, 1.6, C.woodDark, { p: [sx * 0.27, 0.3, -0.25], r: [-9, sx * -6, 0] });
      b.box(0.045, 0.3, 0.045, C.woodDark, { p: [sx * 0.26, 0, -0.42] });
    }
  });
}

export function cocho(b, o = {}) {
  b.group(o, () => {
    b.tbox(1.9, 0.5, 2.05, 0.7, 0.4, C.wood, { p: [0, 0.15, 0], grad: C.woodLight });
    b.box(1.8, 0.04, 0.5, C.water, { p: [0, 0.5, 0] });
    for (const sx of [-1, 1]) b.box(0.14, 0.2, 0.7, C.woodDark, { p: [sx * 0.75, 0, 0] });
  });
}

export function latao(b, o = {}) { // latão de leite
  b.group(o, () => {
    b.lathe([[0.001, 0], [0.19, 0], [0.2, 0.42], [0.13, 0.55], [0.12, 0.66], [0.15, 0.7], [0.001, 0.7]], 9, C.metal, { grad: C.metalLight });
    for (const sx of [-1, 1]) b.box(0.03, 0.14, 0.06, C.metalDark, { p: [sx * 0.2, 0.36, 0] });
  });
}

export function espantalho(b, o = {}) {
  b.group(o, () => {
    b.box(0.09, 1.9, 0.09, C.woodDark, {});
    b.box(1.5, 0.08, 0.08, C.woodDark, { p: [0, 1.3, 0] });
    b.tbox(0.62, 0.3, 0.5, 0.26, 0.7, C.clothRed, { p: [0, 0.75, 0], jit: 0.03 });
    b.box(1.3, 0.2, 0.2, C.clothRed, { p: [0, 1.24, 0] });
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) b.cone(0.03, 0.22, 3, C.straw, { p: [sx * 0.68, 1.34, (i - 1) * 0.06], r: [0, 0, sx * -90 + (i - 1) * 14], order: 'XYZ' });
    b.sph(0.25, 8, 6, C.sack, { p: [0, 1.72, 0], smooth: true });
    for (const sx of [-1, 1]) b.sph(0.04, 5, 4, C.black, { p: [sx * 0.09, 1.76, 0.22] });
    b.box(0.14, 0.03, 0.03, C.black, { p: [0, 1.65, 0.24] });
    b.cyl(0.52, 0.56, 0.04, 10, C.straw, { p: [0, 1.88, 0], r: [-6, 0, 4] });
    b.cyl(0.2, 0.25, 0.24, 9, C.strawDark, { p: [0, 1.9, 0], r: [-6, 0, 4], grad: C.straw });
    for (let i = 0; i < 5; i++) b.cone(0.035, 0.2, 3, C.straw, { p: [(i - 2) * 0.12, 0.76, 0.05], r: [180, 0, (i - 2) * 6], order: 'XYZ' });
  });
}

export function trator(b, o = {}) {
  b.group(o, () => {
    const body = C.clothOrange, dark = shade(C.clothOrange, 0.75);
    const roda = (x, y, z, R, w) => {
      b.cyl(R, R, w, 12, C.black, { p: [x - w / 2, y, z], r: [0, 0, -90], order: 'XYZ' });
      b.cyl(R * 0.5, R * 0.5, w + 0.04, 8, C.clothYellow, { p: [x - w / 2 - 0.02, y, z], r: [0, 0, -90], order: 'XYZ' });
    };
    roda(-0.62, 0.62, -0.55, 0.62, 0.36); roda(0.98, 0.62, -0.55, 0.62, 0.36);
    roda(-0.5, 0.36, 1.15, 0.36, 0.24); roda(0.74, 0.36, 1.15, 0.36, 0.24);
    b.box(0.72, 0.5, 2.2, body, { p: [0, 0.55, 0.25], grad: mix(body, C.white, 0.15) });
    b.box(0.62, 0.42, 1.15, body, { p: [0, 1.05, 0.72] });
    b.box(0.66, 0.06, 1.2, dark, { p: [0, 1.47, 0.72] });
    b.box(0.5, 0.3, 0.05, C.black, { p: [0, 1.1, 1.31] });
    b.cyl(0.045, 0.045, 0.65, 6, C.metalDark, { p: [0.2, 1.5, 0.95] });
    // assento, volante, para-lamas
    b.box(0.5, 0.12, 0.45, C.black, { p: [0, 1.05, -0.45] });
    b.box(0.5, 0.42, 0.1, C.black, { p: [0, 1.12, -0.7], r: [-12, 0, 0] });
    b.cyl(0.02, 0.02, 0.5, 5, C.metalDark, { p: [0, 1.25, 0.12], r: [-38, 0, 0] });
    b.cyl(0.2, 0.2, 0.04, 9, C.black, { p: [0, 1.64, -0.19], r: [52, 0, 0] });
    for (const sx of [-1, 1]) b.box(0.42, 0.07, 1.1, dark, { p: [sx * 0.6, 1.26, -0.55] });
    // toldo
    for (const sx of [-1, 1]) for (const z of [-0.95, 0.1]) b.box(0.05, 1.15, 0.05, C.metalDark, { p: [sx * 0.4, 1.3, z] });
    b.box(1.0, 0.07, 1.35, C.clothWhite, { p: [0, 2.45, -0.42] });
  });
}

// varal de bandeirinhas entre dois pontos 3D
export function bandeirinhas(b, a, c, o = {}) {
  const cols = [C.clothRed, C.clothYellow, C.clothBlue, C.clothGreen, C.clothPink, C.clothOrange, C.clothWhite];
  const dx = c[0] - a[0], dy = c[1] - a[1], dz = c[2] - a[2];
  const L = Math.hypot(dx, dz);
  const n = Math.max(3, Math.round(L / 0.56));
  const sag = o.sag === undefined ? L * 0.09 : o.sag;
  const yaw = -Math.atan2(dz, dx) / DEG;
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = [a[0] + dx * t, a[1] + dy * t - sag * 4 * t * (1 - t), a[2] + dz * t];
    if (prev) {
      const sx = p[0] - prev[0], sy = p[1] - prev[1], sz = p[2] - prev[2];
      const sl = Math.hypot(sx, sy, sz);
      const pitch = Math.atan2(sy, Math.hypot(sx, sz)) / DEG;
      const m = [(p[0] + prev[0]) / 2, (p[1] + prev[1]) / 2, (p[2] + prev[2]) / 2];
      b.box(sl, 0.014, 0.014, C.rope, { p: m, r: [0, yaw, pitch] });
      const col = cols[(i + (o.offset || 0)) % cols.length];
      // bandeirinha de rabo de andorinha (dupla face)
      for (const side of [0, 180]) {
        b.ext([[-0.19, 0], [0.19, 0], [0.19, -0.48], [0, -0.34], [-0.19, -0.48]], 0.014, col, { p: [m[0], m[1] - 0.01, m[2]], r: [0, yaw + side, 0] });
        break;
      }
    }
    prev = p;
  }
}

export function poste(b, o = {}) {
  b.group(o, () => {
    b.cyl(0.06, 0.09, o.h || 3.4, 6, C.woodDark, { grad: C.wood });
  });
}

export function lenha(b, o = {}) {
  b.group(o, () => {
    const rows = [4, 3, 2];
    rows.forEach((n, j) => { for (let i = 0; i < n; i++) b.cyl(0.11, 0.11, 0.9, 6, (i + j) % 2 ? C.wood : C.woodLight, { p: [-0.45, 0.11 + j * 0.2, (i - (n - 1) / 2) * 0.23], r: [0, 0, -90], order: 'XYZ' }); });
  });
}

export function monteFeno(b, o = {}) {
  b.group(o, () => {
    b.lathe([[0.001, 0], [0.9, 0], [0.95, 0.35], [0.7, 0.95], [0.3, 1.35], [0.001, 1.45]], 9, C.hayDark, { grad: C.hay, jit: 0.05 });
  });
}

export function vasoGrande(b) {
  b.cyl(0.34, 0.24, 0.5, 8, C.roof, { grad: C.roofLight });
  b.cyl(0.37, 0.37, 0.07, 8, C.roofDark, { p: [0, 0.46, 0], open: true });
  b.blob(0.4, 0, C.leaf, { p: [0, 0.78, 0], jit: 0.08, grad: C.leafLight });
  for (let i = 0; i < 6; i++) b.ico(0.085, 0, i % 2 ? C.flowerB : C.clothYellow, { p: [Math.cos(i * 1.1) * 0.3, 0.86 + (i % 3) * 0.08, Math.sin(i * 1.1) * 0.3] });
}

export function comedouro(b) {
  b.cyl(0.3, 0.36, 0.1, 8, C.woodDark, {});
  b.cyl(0.26, 0.26, 0.03, 8, C.cornEar, { p: [0, 0.08, 0] });
}
