// Construções: casa com varanda, galpão, silo, galinheiro, barraca de feira.
import { C, mix, shade } from '../lib/palette.js';
import { rng } from '../lib/rng.js';

const DEG = Math.PI / 180;

// Água de telhado com "telhas" em faixas. Centro em (0,yRidge,0) no topo; desce para +Z local.
// run = projeção horizontal, rise = queda vertical, len = comprimento ao longo da cumeeira (X local)
function aguaTelhado(b, { run, rise, len, y, z0 = 0, yaw = 0, strip = 0.36, colorA, colorB, th = 0.1 }) {
  const ang = Math.atan2(rise, run) / DEG;
  const L = Math.hypot(run, rise);
  b.group({ p: [0, y, 0], r: [0, yaw, 0] }, () => {
    b.group({ p: [0, 0, z0], r: [ang, 0, 0] }, () => {
      b.box(len, th, L, colorA || C.roofDark, { p: [0, -th, L / 2] });
      const n = Math.max(2, Math.round(len / strip));
      const w = len / n;
      for (let i = 0; i < n; i++) {
        b.box(w * 0.56, 0.065, L + 0.04, i % 3 === 1 ? C.roofLight : colorB || C.roof, { p: [-len / 2 + (i + 0.5) * w, 0, L / 2] });
      }
    });
  });
}

function janela(b, { p, yaw = 0, w = 0.95, h = 1.05, shutters = true, lit = false }) {
  b.group({ p, r: [0, yaw, 0] }, () => {
    b.box(w + 0.16, h + 0.16, 0.08, C.trimDark, { p: [0, -0.08, 0] });
    b.glow = lit; b.box(w, h, 0.1, lit ? C.glassLit : C.glass, { p: [0, 0, 0] }); b.glow = false;
    b.box(0.05, h, 0.12, C.trimLight, { p: [0, 0, 0] });
    b.box(w, 0.05, 0.12, C.trimLight, { p: [0, h / 2 - 0.025, 0] });
    b.box(w + 0.3, 0.07, 0.2, C.wallShade, { p: [0, -0.13, 0.03] });
    if (shutters) {
      b.box(w / 2, h + 0.06, 0.05, C.trim, { p: [-(w * 0.75 + 0.1), -0.03, 0.02] });
      b.box(w / 2, h + 0.06, 0.05, C.trim, { p: [w * 0.75 + 0.1, -0.03, 0.02] });
    }
  });
}

function vaso(b, p, flower) {
  b.group({ p }, () => {
    b.cyl(0.17, 0.12, 0.26, 7, C.roof, { grad: C.roofLight });
    b.blob(0.22, 0, C.leaf, { p: [0, 0.4, 0], jit: 0.08, grad: C.leafLight });
    if (flower) for (let i = 0; i < 4; i++) b.ico(0.06, 0, flower, { p: [Math.cos(i * 1.7) * 0.15, 0.5 + (i % 2) * 0.08, Math.sin(i * 1.7) * 0.15] });
  });
}

export function rede(b, x0, x1, y, z, colors) {
  // rede de dormir: segmentos em catenária, listrada
  const n = 8;
  const sag = 0.55;
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    const yy = y - sag * 4 * t * (1 - t);
    if (prev) {
      const dx = x - prev[0], dy = yy - prev[1];
      const L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) / DEG;
      const wz = 0.18 + 0.62 * Math.sin(Math.PI * ((i - 0.5) / n)) ** 0.8;
      b.box(L + 0.02, 0.035, wz, colors[(i - 1) % colors.length], { p: [(x + prev[0]) / 2, (yy + prev[1]) / 2, z], r: [0, 0, ang], order: 'XYZ' });
    }
    prev = [x, yy];
  }
}

export function casa(b, o = {}) {
  const W = 7.2, D = 5.0, H = 2.9, base = 0.35;
  const lit = !!o.lit;
  // base e paredes caiadas com barrado colorido
  b.box(W + 0.3, base, D + 0.3, C.wallBase, { jit: 0.02 });
  b.box(W, H, D, C.wall, { p: [0, base, 0] });
  b.box(W + 0.05, 0.55, D + 0.05, C.trim, { p: [0, base, 0] });
  // empenas
  const rise = 1.75, run = D / 2;
  for (const sx of [-1, 1]) {
    b.ext([[-run, 0], [run, 0], [0, rise]], 0.2, C.wall, { p: [sx * (W / 2 - 0.1), base + H, 0], r: [0, 90, 0] });
    b.cyl(0.22, 0.22, 0.06, 8, C.trim, { p: [sx * (W / 2 + 0.01), base + H + 0.55, 0], r: [0, 0, 90] });
  }
  // telhado principal (cumeeira ao longo de X)
  const oh = 0.5, ohx = 0.4;
  const yR = base + H + rise + 0.06;
  const k = (run + oh) / run;
  aguaTelhado(b, { run: run + oh, rise: rise * k, len: W + ohx * 2, y: yR, yaw: 0 });
  aguaTelhado(b, { run: run + oh, rise: rise * k, len: W + ohx * 2, y: yR, yaw: 180 });
  b.box(W + ohx * 2 + 0.1, 0.14, 0.34, C.roofDark, { p: [0, yR - 0.03, 0] });
  // chaminé do fogão a lenha + fumaça
  b.box(0.55, 1.5, 0.55, mix(C.roof, C.wallBase, 0.45), { p: [-2.2, yR - 1.25, -1.3], jit: 0.04 });
  b.box(0.7, 0.14, 0.7, C.roofDark, { p: [-2.2, yR + 0.25, -1.3] });
  if (o.smoke !== false) {
    const sm = [[0, 0.75, 0.2], [0.18, 1.2, 0.27], [0.45, 1.75, 0.34], [0.85, 2.3, 0.4]];
    for (const [dx, dy, rad] of sm) b.blob(rad, 0, C.white, { p: [-2.2 + dx, yR + dy, -1.3 - dx * 0.5], rough: 0.12 });
  }
  // varanda (alpendre) na frente
  const vz = D / 2, vd = 2.3;
  b.box(W + 0.7, 0.3, vd, C.woodLight, { p: [0, 0.05, vz + vd / 2], jit: 0.03 });
  for (let i = 0; i < 9; i++) b.box(0.03, 0.31, vd, C.wood, { p: [-W / 2 - 0.2 + i * ((W + 0.4) / 8), 0.05, vz + vd / 2] });
  const px = [-3.7, -1.85, -0.85, 0.85, 1.85, 3.7];
  const pz = vz + vd - 0.18;
  for (const x of px) {
    b.box(0.17, 2.1, 0.17, C.wood, { p: [x, 0.35, pz], grad: C.woodLight });
    b.box(0.3, 0.08, 0.3, C.woodDark, { p: [x, 2.36, pz] });
  }
  b.box(W + 0.7, 0.12, 0.18, C.woodDark, { p: [0, 2.43, pz] });
  // telhado da varanda (inclinação menor, saindo sob o beiral)
  aguaTelhado(b, { run: 2.18, rise: 0.45, len: W + 1.1, y: 3.0, z0: 2.92, yaw: 0, th: 0.08 });
  // guarda-corpo (menos no vão central)
  for (let i = 0; i < px.length - 1; i++) {
    if (i === 2) continue;
    const xa = px[i], xb = px[i + 1], xm = (xa + xb) / 2, L = xb - xa;
    b.box(L, 0.07, 0.08, C.woodDark, { p: [xm, 1.05, pz] });
    b.box(L, 0.05, 0.06, C.wood, { p: [xm, 0.55, pz] });
    const nb = Math.round(L / 0.33);
    for (let j = 1; j < nb; j++) b.box(0.05, 0.7, 0.05, C.woodLight, { p: [xa + (j * L) / nb, 0.36, pz] });
  }
  for (const sx of [-1, 1]) { // laterais da varanda
    b.box(0.08, 0.07, vd - 0.3, C.woodDark, { p: [sx * 3.7, 1.05, vz + vd / 2 - 0.05] });
    b.box(0.06, 0.05, vd - 0.3, C.wood, { p: [sx * 3.7, 0.55, vz + vd / 2 - 0.05] });
    for (let j = 1; j < 6; j++) b.box(0.05, 0.7, 0.05, C.woodLight, { p: [sx * 3.7, 0.36, vz + 0.1 + j * 0.34] });
  }
  // degraus
  b.box(1.7, 0.18, 0.45, C.wallBase, { p: [0, 0, vz + vd + 0.2] });
  b.box(1.7, 0.1, 0.4, C.wallBase, { p: [0, 0, vz + vd + 0.62] });
  // porta e janelas da frente
  b.box(1.15, 2.2, 0.08, C.trimDark, { p: [0, base, vz + 0.02] });
  b.box(0.95, 2.05, 0.1, C.trim, { p: [0, base, vz + 0.04] });
  b.glow = lit; b.box(0.4, 0.4, 0.12, lit ? C.glassLit : C.glass, { p: [0, base + 1.45, vz + 0.04] }); b.glow = false;
  b.sph(0.045, 5, 4, C.clothYellow, { p: [0.33, base + 1.0, vz + 0.12] });
  janela(b, { p: [-2.25, base + 1.0, vz + 0.02], lit });
  janela(b, { p: [2.25, base + 1.0, vz + 0.02], lit });
  // janelas laterais e dos fundos
  for (const sx of [-1, 1]) for (const z of [-1.2, 1.2]) janela(b, { p: [sx * (W / 2 + 0.02), base + 1.0, z], yaw: sx * 90, lit });
  for (const x of [-2.2, 0, 2.2]) janela(b, { p: [x, base + 1.0, -D / 2 - 0.02], yaw: 180, shutters: false });
  // rede, banco e vasos na varanda
  rede(b, px[0] + 0.1, px[1] - 0.1, 1.75, pz - 0.75, [C.clothRed, C.clothYellow, C.clothWhite, C.clothTeal]);
  b.cyl(0.012, 0.012, 0.9, 3, C.rope, { p: [px[0] + 0.1, 1.75, pz - 0.75], r: [50, 0, 0] });
  b.cyl(0.012, 0.012, 0.9, 3, C.rope, { p: [px[1] - 0.1, 1.75, pz - 0.75], r: [50, 0, 0] });
  banco(b, { p: [2.75, 0.35, vz + 0.45], r: [0, 0, 0], s: 0.85 });
  vaso(b, [0.85 + 0.45, 0.35, pz - 0.15], C.flowerB);
  vaso(b, [-0.85 - 0.45, 0.35, pz - 0.15], C.clothYellow);
  vaso(b, [1.25, 0, vz + vd + 0.45], C.clothRed);
  vaso(b, [-1.25, 0, vz + vd + 0.45], C.flowerC);
}

export function banco(b, o = {}) {
  b.group(o, () => {
    b.box(1.5, 0.07, 0.42, C.woodLight, { p: [0, 0.42, 0] });
    b.box(1.5, 0.3, 0.06, C.woodLight, { p: [0, 0.62, -0.2], r: [-8, 0, 0] });
    for (const x of [-0.65, 0.65]) {
      b.box(0.08, 0.42, 0.08, C.woodDark, { p: [x, 0, 0.15] });
      b.box(0.08, 0.95, 0.08, C.woodDark, { p: [x, 0, -0.18], r: [-5, 0, 0] });
    }
  });
}

export function galpao(b, o = {}) {
  const W = 7.0, D = 6.2, H = 3.3, base = 0.4;
  const r = rng(77);
  b.box(W + 0.3, base, D + 0.3, C.stone, { jit: 0.05 });
  // paredes de tábuas verticais
  const plank = (x, z, yaw, h) => b.box(0.5, h, 0.14, r() < 0.5 ? C.wood : mix(C.wood, C.woodLight, 0.45), { p: [x, base, z], r: [0, yaw, 0] });
  const nx = Math.round(W / 0.5), nz = Math.round(D / 0.5);
  for (let i = 0; i < nx; i++) { const x = -W / 2 + 0.25 + i * 0.5; plank(x, D / 2 - 0.07, 0, H); plank(x, -D / 2 + 0.07, 0, H); }
  for (let i = 0; i < nz; i++) { const z = -D / 2 + 0.25 + i * 0.5; plank(W / 2 - 0.07, z, 90, H); plank(-W / 2 + 0.07, z, 90, H); }
  b.box(W - 0.3, H - 0.1, D - 0.3, C.woodDark, { p: [0, base, 0] }); // miolo (evita ver através)
  // empenas (frente/fundo em Z)
  const rise = 2.3, run = W / 2;
  for (const sz of [-1, 1]) b.ext([[-run, 0], [run, 0], [0, rise]], 0.16, mix(C.wood, C.woodLight, 0.6), { p: [0, base + H, sz * (D / 2 - 0.08)] });
  // telhado: cumeeira ao longo de Z -> águas para ±X
  const oh = 0.55, k = (run + oh) / run, yR = base + H + rise + 0.05;
  aguaTelhado(b, { run: run + oh, rise: rise * k, len: D + 0.9, y: yR, yaw: 90 });
  aguaTelhado(b, { run: run + oh, rise: rise * k, len: D + 0.9, y: yR, yaw: -90 });
  b.box(0.34, 0.14, D + 1.0, C.roofDark, { p: [0, yR - 0.03, 0] });
  // portão duplo na frente (+Z), uma folha entreaberta
  const fz = D / 2 + 0.02;
  b.box(3.2, 2.9, 0.06, C.black, { p: [0, base, fz - 0.05] });
  b.box(3.5, 0.2, 0.14, C.woodDark, { p: [0, base + 2.9, fz] });
  b.box(0.18, 2.9, 0.14, C.woodDark, { p: [-1.68, base, fz] });
  b.box(0.18, 2.9, 0.14, C.woodDark, { p: [1.68, base, fz] });
  const folha = (yaw, sx) => b.group({ p: [sx * 1.58, base, fz + 0.06], r: [0, yaw, 0] }, () => {
    const dx = -sx * 0.78;
    b.box(1.55, 2.8, 0.09, C.barnDoor, { p: [dx, 0, 0] });
    for (const zz of [0.06, -0.06]) {
      b.box(1.55, 0.14, 0.03, C.clothWhite, { p: [dx, 0.05, zz] });
      b.box(1.55, 0.14, 0.03, C.clothWhite, { p: [dx, 2.62, zz] });
      b.box(0.14, 2.8, 0.03, C.clothWhite, { p: [dx - 0.7, 0, zz] });
      b.box(0.14, 2.8, 0.03, C.clothWhite, { p: [dx + 0.7, 0, zz] });
      for (const ang of [28, -28]) b.group({ p: [dx, 1.4, zz], r: [0, 0, ang] }, () => b.box(0.13, 2.95, 0.03, C.clothWhite, { p: [0, -1.475, 0] }));
    }
  });
  folha(0, 1);
  folha(-62, -1);
  // feno visível lá dentro
  fardo(b, { p: [-0.5, base, D / 2 - 0.7] });
  fardo(b, { p: [-0.35, base + 0.52, D / 2 - 0.75], r: [0, 12, 0] });
  // janela do paiol + roldana
  b.box(1.0, 0.9, 0.1, C.black, { p: [0, base + H + 0.35, fz - 0.05] });
  b.box(1.2, 0.1, 0.16, C.woodDark, { p: [0, base + H + 0.28, fz] });
  b.box(1.2, 0.1, 0.16, C.woodDark, { p: [0, base + H + 1.25, fz] });
  b.box(0.1, 1.0, 0.16, C.woodDark, { p: [-0.55, base + H + 0.3, fz] });
  b.box(0.1, 1.0, 0.16, C.woodDark, { p: [0.55, base + H + 0.3, fz] });
  b.box(0.12, 0.12, 1.0, C.woodDark, { p: [0, base + H + 1.6, fz + 0.4] });
  // janelinhas laterais
  for (const z of [-1.6, 1.6]) {
    b.box(0.1, 0.8, 0.9, C.black, { p: [W / 2 - 0.02, base + 1.7, z] });
    b.box(0.14, 0.08, 1.05, C.woodDark, { p: [W / 2, base + 1.62, z] });
    b.box(0.14, 0.08, 1.05, C.woodDark, { p: [W / 2, base + 2.5, z] });
    b.box(0.12, 0.8, 0.07, C.woodDark, { p: [W / 2, base + 1.7, z] });
  }
}

export function fardo(b, o = {}) {
  b.group(o, () => {
    b.box(0.95, 0.5, 0.55, C.hay, { jit: 0.05, grad: mix(C.hay, C.white, 0.15) });
    b.box(0.97, 0.04, 0.57, C.hayDark, { p: [0, 0.22, 0] });
    b.box(0.06, 0.52, 0.57, C.rope, { p: [-0.25, 0, 0] });
    b.box(0.06, 0.52, 0.57, C.rope, { p: [0.25, 0, 0] });
  });
}

export function silo(b) {
  const R = 1.35, H = 5.0, seg = 14;
  b.cyl(R + 0.15, R + 0.2, 0.3, seg, C.stone, { jit: 0.04 });
  b.cyl(R, R, H, seg, C.metal, { p: [0, 0.3, 0], grad: C.metalLight, jit: 0.025 });
  for (let i = 1; i <= 4; i++) b.cyl(R + 0.04, R + 0.04, 0.09, seg, C.metalDark, { p: [0, 0.3 + i * 1.0 - 0.05, 0], open: true });
  b.cone(R + 0.22, 1.25, seg, C.siloRoof, { p: [0, 0.3 + H, 0], grad: mix(C.siloRoof, C.white, 0.2) });
  b.cyl(0.14, 0.2, 0.22, 8, C.metalDark, { p: [0, 0.3 + H + 1.2, 0] });
  // escada (lado +X/+Z, visível da câmera)
  b.group({ r: [0, 20, 0] }, () => {
    for (const s of [-1, 1]) b.box(0.05, H + 0.1, 0.05, C.metalDark, { p: [s * 0.22, 0.3, R + 0.08] });
    for (let y = 0.6; y < H + 0.2; y += 0.38) b.box(0.44, 0.04, 0.04, C.metalDark, { p: [0, y, R + 0.08] });
  });
  // bica de descarga
  b.cyl(0.12, 0.16, 1.1, 6, C.metalDark, { p: [-R * 0.7, 1.6, R * 0.7], r: [140, -45, 0] });
  b.box(0.7, 0.9, 0.08, C.metalDark, { p: [R * 0.72, 0.3, -R * 0.72 + 0.02], r: [0, 135, 0] });
}

export function galinheiro(b) {
  const W = 2.6, D = 2.1, legs = 0.55, H = 1.45;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.14, legs + 0.1, 0.14, C.woodDark, { p: [sx * (W / 2 - 0.12), 0, sz * (D / 2 - 0.12)] });
  b.box(W + 0.1, 0.1, D + 0.1, C.woodDark, { p: [0, legs, 0] });
  // paredes de tábuas horizontais
  for (let i = 0; i < 5; i++) {
    const c = i % 2 ? C.woodLight : mix(C.woodLight, C.woodPale, 0.5);
    b.box(W, H / 5 + 0.005, D, c, { p: [0, legs + 0.1 + (i * H) / 5, 0] });
  }
  const rise = 0.95, run = D / 2, yR = legs + 0.1 + H + rise + 0.04;
  for (const sx of [-1, 1]) b.ext([[-run, 0], [run, 0], [0, rise]], 0.12, C.woodPale, { p: [sx * (W / 2 - 0.06), legs + 0.1 + H, 0], r: [0, 90, 0] });
  const oh = 0.35, k = (run + oh) / run;
  aguaTelhado(b, { run: run + oh, rise: rise * k, len: W + 0.6, y: yR, yaw: 0, strip: 0.3, th: 0.07 });
  aguaTelhado(b, { run: run + oh, rise: rise * k, len: W + 0.6, y: yR, yaw: 180, strip: 0.3, th: 0.07 });
  b.box(W + 0.7, 0.1, 0.24, C.roofDark, { p: [0, yR - 0.02, 0] });
  // portinha + rampa (frente = +Z)
  b.box(0.6, 0.75, 0.06, C.black, { p: [0.45, legs + 0.1, D / 2 + 0.005] });
  b.box(0.76, 0.08, 0.1, C.woodDark, { p: [0.45, legs + 0.85, D / 2 + 0.02] });
  b.group({ p: [0.45, legs + 0.08, D / 2], r: [26, 0, 0] }, () => {
    b.box(0.55, 0.05, 1.5, C.wood, { p: [0, 0, 0.75] });
    for (let i = 0; i < 5; i++) b.box(0.55, 0.035, 0.05, C.woodDark, { p: [0, 0.05, 0.2 + i * 0.28] });
  });
  // janela com tela e caixa de ninhos na lateral +X
  b.box(0.7, 0.5, 0.06, C.black, { p: [-0.6, legs + 0.65, D / 2 + 0.005] });
  for (let i = 0; i < 3; i++) b.box(0.03, 0.5, 0.07, C.woodPale, { p: [-0.83 + i * 0.23, legs + 0.65, D / 2 + 0.012] });
  b.box(0.55, 0.5, 1.5, C.woodLight, { p: [W / 2 + 0.27, legs + 0.3, 0] });
  b.box(0.7, 0.06, 1.65, C.roof, { p: [W / 2 + 0.3, legs + 0.82, 0], r: [0, 0, -14], order: 'XYZ' });
}

// Barraca de feira com toldo listrado, caixotes de produtos e placa "FEIRA" em letras de bloco.
const FONT = {
  F: ['#####', '#....', '####.', '#....', '#....'],
  E: ['#####', '#....', '####.', '#....', '#####'],
  I: ['#####', '..#..', '..#..', '..#..', '#####'],
  R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  A: ['.###.', '#...#', '#####', '#...#', '#...#'],
};
export function letreiro(b, text, px, color, o = {}) {
  b.group(o, () => {
    const total = text.length * 6 * px - px;
    let x0 = -total / 2;
    for (const ch of text) {
      const g = FONT[ch];
      for (let row = 0; row < 5; row++) {
        let col = 0;
        while (col < 5) {
          if (g[row][col] === '#') {
            let end = col;
            while (end + 1 < 5 && g[row][end + 1] === '#') end++;
            const w = (end - col + 1) * px;
            b.box(w, px, px * 0.6, color, { p: [x0 + col * px + w / 2, (4 - row) * px, 0] });
            col = end + 1;
          } else col++;
        }
      }
      x0 += 6 * px;
    }
  });
}

export function caixote(b, o = {}, fill = null) {
  b.group(o, () => {
    const w = 0.62, d = 0.44, h = 0.3;
    b.box(w, 0.04, d, C.crateDark, {});
    for (const sz of [-1, 1]) for (let i = 0; i < 2; i++) b.box(w, 0.1, 0.035, i ? C.crate : C.woodPale, { p: [0, 0.03 + i * 0.15, sz * (d / 2 - 0.018)] });
    for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) b.box(0.035, 0.1, d, i ? C.woodPale : C.crate, { p: [sx * (w / 2 - 0.018), 0.03 + i * 0.15, 0] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.05, h, 0.05, C.crateDark, { p: [sx * (w / 2 - 0.03), 0, sz * (d / 2 - 0.03)] });
    if (fill) {
      const r = rng(o.seed || 9);
      if (fill === 'laranja' || fill === 'caju' || fill === 'cafe') {
        const c = fill === 'laranja' ? C.orange : fill === 'caju' ? C.cajuRed : C.coffeeCherry;
        const rad = fill === 'cafe' ? 0.05 : 0.085;
        const nx = fill === 'cafe' ? 5 : 3, nz = fill === 'cafe' ? 4 : 2;
        for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
          b.ico(rad, 0, fill === 'caju' && (i + j) % 2 ? C.cajuYellow : c, { p: [-w / 2 + 0.12 + (i * (w - 0.24)) / (nx - 1), 0.25 + r() * 0.04, -d / 2 + 0.12 + (j * (d - 0.24)) / Math.max(1, nz - 1)] });
        }
      } else if (fill === 'banana') {
        for (let i = 0; i < 5; i++) b.cyl(0.04, 0.05, 0.36, 5, C.banana, { p: [-0.2 + i * 0.1, 0.24, -0.16], r: [84, i * 6 - 12, 0] });
      } else if (fill === 'milho') {
        for (let i = 0; i < 5; i++) b.cyl(0.045, 0.06, 0.4, 5, i % 2 ? C.cornEar : C.cornHusk, { p: [-0.22 + i * 0.11, 0.25, -0.18], r: [86, i * 8 - 16, 0] });
      } else if (fill === 'mandioca') {
        for (let i = 0; i < 4; i++) b.cyl(0.035, 0.06, 0.48, 5, C.cassavaRoot, { p: [-0.2 + i * 0.13, 0.24, -0.2], r: [84, i * 10 - 15, 0] });
      } else if (fill === 'cana') {
        for (let i = 0; i < 5; i++) b.cyl(0.03, 0.03, 0.6, 5, i % 2 ? C.caneStalk : C.caneNode, { p: [-0.26, 0.24 + (i % 2) * 0.05, -0.16 + i * 0.08], r: [0, 0, -90], order: 'XYZ' });
      }
    }
  });
}

export function saca(b, o = {}) {
  b.group(o, () => {
    b.sph(0.3, 7, 5, C.sack, { p: [0, 0.3, 0], s: [1, 1.05, 0.72], grad: mix(C.sack, C.white, 0.2) });
    b.cyl(0.07, 0.11, 0.12, 6, C.sackDark, { p: [0, 0.58, 0] });
    b.box(0.3, 0.14, 0.02, C.clothGreen, { p: [0, 0.24, 0.215] });
  });
}

export function barraca(b) {
  const W = 3.4, D = 1.5;
  // bancada
  b.box(W, 0.1, D * 0.75, C.woodLight, { p: [0, 0.85, 0.1] });
  b.box(W - 0.1, 0.8, 0.07, C.wood, { p: [0, 0.05, 0.6] });
  for (let i = 0; i < 6; i++) b.box(0.03, 0.8, 0.09, C.woodDark, { p: [-W / 2 + 0.3 + i * ((W - 0.6) / 5), 0.05, 0.6] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const h = sz > 0 ? 2.25 : 2.75;
    b.box(0.12, h, 0.12, C.woodDark, { p: [sx * (W / 2 - 0.06), 0, sz * (D / 2 - 0.06) + 0.05] });
  }
  // toldo listrado (cai para a frente, +Z)
  const n = 8, sw = (W + 0.5) / n;
  const run = D + 0.7, rise = 0.62, ang = Math.atan2(rise, run) / DEG, L = Math.hypot(run, rise);
  b.group({ p: [0, 2.82, -D / 2 - 0.2], r: [ang, 0, 0] }, () => {
    for (let i = 0; i < n; i++) {
      const c = i % 2 ? C.clothWhite : C.clothRed;
      b.box(sw, 0.05, L, c, { p: [-(W + 0.5) / 2 + (i + 0.5) * sw, 0, L / 2] });
      // barrado em bico
      b.ext([[-sw / 2, 0], [sw / 2, 0], [0, -0.26]], 0.04, c, { p: [-(W + 0.5) / 2 + (i + 0.5) * sw, 0.0, L + 0.0], r: [-ang, 0, 0] });
    }
  });
  // placa FEIRA
  b.box(2.0, 0.5, 0.08, C.woodPale, { p: [0, 2.95, D / 2 + 0.42], r: [8, 0, 0] });
  b.box(2.12, 0.07, 0.1, C.woodDark, { p: [0, 2.92, D / 2 + 0.43], r: [8, 0, 0] });
  letreiro(b, 'FEIRA', 0.058, C.trimDark, { p: [0, 3.06, D / 2 + 0.5], r: [8, 0, 0] });
  // produtos na bancada
  const fills = ['laranja', 'banana', 'milho', 'caju', 'mandioca'];
  fills.forEach((f, i) => caixote(b, { p: [-W / 2 + 0.42 + i * 0.64, 0.95, 0.12], r: [-14, 0, 0], s: 0.95, seed: i + 3 }, f));
  // caixotes e sacas no chão
  caixote(b, { p: [-W / 2 - 0.55, 0, 0.5], r: [0, 18, 0] }, 'laranja');
  caixote(b, { p: [-W / 2 - 0.6, 0.32, 0.45], r: [0, -8, 0] }, 'cana');
  caixote(b, { p: [W / 2 + 0.55, 0, 0.6], r: [0, -20, 0] }, 'cafe');
  saca(b, { p: [W / 2 + 0.5, 0, -0.25], r: [0, 30, 0] });
  saca(b, { p: [W / 2 + 0.95, 0, 0.05], r: [8, -40, 0] });
  // balança
  b.box(0.3, 0.06, 0.22, C.metalDark, { p: [W / 2 - 0.35, 0.95, -0.15] });
  b.box(0.05, 0.3, 0.05, C.metalDark, { p: [W / 2 - 0.35, 1.0, -0.15] });
  b.cyl(0.17, 0.12, 0.05, 8, C.metal, { p: [W / 2 - 0.35, 1.28, -0.15] });
}
