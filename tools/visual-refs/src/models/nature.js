// Vegetação: árvores frutíferas brasileiras, mata, culturas em estágios e miudezas.
import { C, mix, shade } from '../lib/palette.js';
import { rng } from '../lib/rng.js';

const TAU = Math.PI * 2;

// ---------- Árvores frutíferas ----------
export function laranjeira(b, o = {}) {
  const r = rng(o.seed || 11);
  const s = o.scale || 1;
  b.group({ s }, () => {
    b.cyl(0.16, 0.24, 1.25, 6, C.trunkDark, { grad: C.trunk });
    b.cyl(0.07, 0.11, 0.7, 5, C.trunk, { p: [0.05, 1.05, 0], r: [0, 0, -32] });
    b.cyl(0.07, 0.11, 0.7, 5, C.trunk, { p: [-0.05, 1.0, 0.05], r: [20, 0, 30] });
    const blobs = [[0, 2.25, 0, 1.2], [0.75, 1.95, 0.3, 0.85], [-0.7, 1.9, -0.25, 0.9], [0.1, 2.0, -0.75, 0.8], [-0.15, 1.95, 0.75, 0.8], [0.15, 2.95, 0.05, 0.75]];
    for (const [x, y, z, rad] of blobs) {
      b.blob(rad, 1, C.orangeLeaf, { p: [x, y, z], s: [1, 0.88, 1], jit: 0.07, grad: C.orangeLeafLight, rough: 0.12 });
    }
    // laranjas na superfície da copa
    const n = o.fruits === undefined ? 16 : o.fruits;
    for (let i = 0; i < n; i++) {
      const a = r() * TAU, e = r.range(-0.35, 0.9);
      const R = 1.22 + r.range(-0.05, 0.1);
      const x = Math.cos(a) * Math.cos(e) * R * 1.12, z = Math.sin(a) * Math.cos(e) * R * 1.12, y = 2.2 + Math.sin(e) * R * 0.92;
      b.ico(0.115, 1, C.orange, { p: [x, y, z], smooth: true });
    }
  });
}

export function bananeira(b, o = {}) {
  const r = rng(o.seed || 23);
  const s = o.scale || 1;
  b.group({ s }, () => {
    b.cyl(0.13, 0.22, 2.1, 7, mix(C.trunk, C.bananaStem, 0.45), { grad: C.bananaStem, r: [0, 0, 3] });
    // filhote ao lado ("touceira")
    b.cyl(0.07, 0.11, 0.9, 6, mix(C.trunk, C.bananaStem, 0.5), { grad: C.bananaStem, p: [0.38, 0, 0.18], r: [0, 0, -6] });
    for (let i = 0; i < 3; i++) b.leaf(0.9, 0.34, 70, C.bananaLeaf, { p: [0.38, 0.85, 0.18], r: [28, i * 120 + 40, 0], steps: 3, grad: C.bananaLeafDark });
    const n = 8;
    for (let i = 0; i < n; i++) {
      const yaw = (i / n) * 360 + r.range(-14, 14);
      const tilt = i % 2 ? r.range(30, 42) : r.range(48, 62);
      const len = r.range(1.75, 2.15);
      b.leaf(len, 0.66, r.range(70, 95), i % 2 ? C.bananaLeaf : C.bananaLeafDark, {
        p: [0, 2.02, 0], r: [tilt, yaw, 0], steps: 5, fold: 0.3, grad: C.bananaLeaf,
        profile: (t) => Math.min(1, 0.25 + t * 3.2) * Math.min(1, (1 - t) * 3 + 0.12),
      });
    }
    // folha nova enrolada no centro
    b.cone(0.07, 0.9, 5, C.bananaLeaf, { p: [0, 2.0, 0], r: [6, 0, 4] });
    // cacho + coração
    b.group({ p: [0.1, 1.98, 0.14], r: [0, 35, 0] }, () => {
      b.cyl(0.03, 0.035, 0.55, 5, C.bananaStem, { r: [118, 0, 0] });
      b.group({ p: [0, -0.3, 0.46] }, () => {
        for (let k = 0; k < 3; k++) for (let j = 0; j < 6; j++) {
          const a = (j / 6) * TAU + k * 0.5;
          b.cyl(0.035, 0.045, 0.2, 5, C.banana, { p: [Math.cos(a) * 0.1, -k * 0.13, Math.sin(a) * 0.1], r: [Math.sin(a) * -28, 0, Math.cos(a) * 28] });
        }
        b.cone(0.07, 0.2, 6, C.bananaHeart, { p: [0, -0.42, 0], r: [180, 0, 0] });
        b.cyl(0.02, 0.02, 0.2, 4, C.bananaStem, { p: [0, -0.45, 0] });
      });
    });
  });
}

export function cajueiro(b, o = {}) {
  const r = rng(o.seed || 37);
  const s = o.scale || 1;
  b.group({ s }, () => {
    // tronco tortuoso e baixo
    b.cyl(0.2, 0.3, 0.8, 6, C.trunkDark, { grad: C.trunk, r: [0, 0, 10] });
    b.cyl(0.15, 0.2, 0.95, 6, C.trunk, { p: [-0.13, 0.72, 0], r: [0, 0, -38] });
    b.cyl(0.12, 0.17, 1.0, 6, C.trunk, { p: [-0.1, 0.72, 0.02], r: [-18, 0, 46] });
    b.cyl(0.1, 0.14, 0.9, 5, C.trunk, { p: [0.0, 0.8, 0], r: [42, 20, 6] });
    const blobs = [[0, 2.15, 0, 1.25], [1.25, 1.75, 0.2, 1.05], [-1.3, 1.8, -0.1, 1.05], [0.2, 1.75, 1.2, 0.95], [-0.2, 1.8, -1.2, 0.95], [0.95, 2.3, -0.8, 0.8], [-0.9, 2.25, 0.85, 0.8]];
    for (const [x, y, z, rad] of blobs) {
      b.blob(rad, 1, C.cajuLeafDark, { p: [x, y, z], s: [1.12, 0.62, 1.12], jit: 0.07, grad: C.cajuLeaf, rough: 0.14 });
    }
    // cajus: pedúnculo (vermelho/amarelo) com a castanha embaixo
    const n = o.fruits === undefined ? 14 : o.fruits;
    for (let i = 0; i < n; i++) {
      const a = r() * TAU, rad = r.range(1.1, 2.15);
      const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
      const y = 1.55 - (rad - 1.1) * 0.12 + r.range(-0.05, 0.12);
      const c = r() < 0.6 ? C.cajuRed : C.cajuYellow;
      b.cone(0.085, 0.2, 6, c, { p: [x, y, z], r: [180, 0, 0], grad: mix(c, C.cajuYellow, 0.4) });
      b.sph(0.045, 5, 4, C.cajuNut, { p: [x + 0.02, y - 0.235, z], s: [1.3, 0.9, 0.9] });
    }
  });
}

// ---------- Mata ao redor (genérica + ipês + palmeiras + araucária) ----------
export function arvoreMata(b, o = {}) {
  const r = rng(o.seed || 5);
  const s = o.scale || 1;
  const kind = o.kind || 'redonda';
  b.group({ s }, () => {
    if (kind === 'redonda') {
      const h = r.range(1.3, 2.0);
      b.cyl(0.16, 0.26, h, 6, C.trunkDark, { grad: C.trunk });
      const c = r() < 0.5 ? C.forest : C.forestDark;
      b.blob(1.35, 1, c, { p: [0, h + 0.9, 0], s: [1, 0.95, 1], jit: 0.08, grad: C.forestLight, rough: 0.16 });
      b.blob(0.95, 1, c, { p: [r.range(0.5, 0.8), h + 0.45, r.range(-0.4, 0.4)], jit: 0.08, grad: C.forestLight, rough: 0.16 });
      b.blob(0.85, 1, c, { p: [-r.range(0.5, 0.8), h + 0.6, r.range(-0.5, 0.5)], jit: 0.08, grad: C.forestLight, rough: 0.16 });
    } else if (kind === 'ipe') {
      const flower = o.color || C.clothYellow;
      const h = r.range(2.0, 2.6);
      b.cyl(0.13, 0.22, h, 6, C.trunkDark, { grad: C.trunk, r: [0, 0, 4] });
      b.cyl(0.07, 0.1, 1.0, 5, C.trunk, { p: [0, h - 0.3, 0], r: [0, 0, 40] });
      b.cyl(0.07, 0.1, 1.0, 5, C.trunk, { p: [0, h - 0.4, 0], r: [10, 0, -44] });
      const blobs = [[0, h + 1.0, 0, 1.15], [0.95, h + 0.5, 0.2, 0.85], [-0.95, h + 0.55, -0.1, 0.85], [0.1, h + 0.55, 0.9, 0.75], [0, h + 0.5, -0.9, 0.75]];
      for (const [x, y, z, rad] of blobs) b.blob(rad, 1, shade(flower, 0.88), { p: [x, y, z], s: [1, 0.8, 1], jit: 0.06, grad: mix(flower, C.white, 0.08), rough: 0.2 });
    } else if (kind === 'palmeira') {
      const h = r.range(3.6, 4.6);
      // tronco levemente curvo em 4 segmentos
      let x = 0, y = 0;
      for (let i = 0; i < 4; i++) {
        const ang = 4 + i * 3.5;
        b.cyl(0.11 - i * 0.008, 0.14 - i * 0.008, h / 4 + 0.04, 6, i % 2 ? C.trunk : mix(C.trunk, C.woodGrey, 0.5), { p: [x, y, 0], r: [0, 0, -ang] });
        x += Math.sin((ang * Math.PI) / 180) * (h / 4); y += Math.cos((ang * Math.PI) / 180) * (h / 4);
      }
      for (let i = 0; i < 9; i++) {
        b.leaf(r.range(1.7, 2.1), 0.5, r.range(95, 125), i % 2 ? C.leaf : C.leafLight, {
          p: [x, y, 0], r: [r.range(18, 40), (i / 9) * 360 + r.range(-10, 10), 0], steps: 5, fold: 0.5,
          profile: (t) => Math.min(1, 0.3 + t * 2.5) * Math.min(1, (1 - t) * 2.2 + 0.05), grad: C.leafDark,
        });
      }
      for (let i = 0; i < 3; i++) b.ico(0.13, 0, C.trunkDark, { p: [x + Math.cos(i * 2.1) * 0.14, y - 0.12, Math.sin(i * 2.1) * 0.14] });
    } else if (kind === 'araucaria') {
      const h = r.range(4.8, 5.8);
      b.cyl(0.12, 0.24, h, 6, C.trunkDark, { grad: C.trunk });
      // copa em candelabro: discos achatados no alto
      const tiers = [[h + 0.1, 1.5], [h - 0.55, 1.75], [h - 1.25, 1.35]];
      for (const [y, rad] of tiers) {
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU + y;
          b.cyl(0.04, 0.06, rad, 4, C.trunk, { p: [0, y - 0.25, 0], r: [72, (a * 180) / Math.PI, 0] });
          b.blob(0.48, 0, C.forestDark, { p: [Math.cos(-a + Math.PI / 2) * rad * 0.95, y + 0.08, Math.sin(-a + Math.PI / 2) * rad * 0.95], s: [1.2, 0.55, 1.2], jit: 0.08, grad: C.forest });
        }
      }
      b.blob(0.6, 0, C.forestDark, { p: [0, h + 0.35, 0], s: [1.2, 0.6, 1.2], grad: C.forest });
    }
  });
}

export function arbusto(b, o = {}) {
  const r = rng(o.seed || 3);
  const c = o.color || C.leaf;
  b.blob(0.5, 0, c, { p: [0, 0.32, 0], s: [1.1, 0.8, 1.1], jit: 0.08, grad: C.leafLight });
  b.blob(0.36, 0, c, { p: [0.42, 0.24, 0.12], jit: 0.08, grad: C.leafLight });
  b.blob(0.32, 0, c, { p: [-0.36, 0.22, -0.16], jit: 0.08, grad: C.leafLight });
  if (o.flowers) for (let i = 0; i < 6; i++) b.ico(0.07, 0, o.flowers, { p: [r.range(-0.55, 0.6), r.range(0.35, 0.68), r.range(-0.4, 0.4)] });
}

export function pedra(b, o = {}) {
  const s = o.scale || 1;
  b.blob(0.42 * s, 0, C.stone, { p: [0, 0.16 * s, 0], s: [1.2, 0.7, 1], jit: 0.06, grad: C.stoneLight, rough: 0.22 });
  if (o.pair) b.blob(0.24 * s, 0, C.stoneDark, { p: [0.45 * s, 0.1 * s, 0.2 * s], s: [1.1, 0.7, 1], jit: 0.06, grad: C.stone, rough: 0.22 });
}

export function tufo(b) { // tufo de capim (instanciado)
  for (let i = 0; i < 4; i++) b.leaf(0.3 + (i % 2) * 0.08, 0.09, 45, C.grassTuft, { r: [18, i * 90 + 20, 0], steps: 2, fold: 0.1, grad: C.grassLight });
}
export function flor(b, o = {}) { // florzinha (instanciada)
  b.cyl(0.012, 0.012, 0.2, 3, C.grassTuft);
  b.ico(0.055, 0, o.color || C.flowerA, { p: [0, 0.22, 0] });
}

// ---------- Culturas (uma planta por geometria; desenhadas por instanciamento) ----------
// Formas exageradas de propósito: precisam ser lidas a 40-60 px de altura.
export function milho(b, stage) {
  if (stage === 0) { // broto
    for (let i = 0; i < 3; i++) b.leaf(0.36, 0.15, 60, C.cornLeaf, { r: [24, i * 120, 0], steps: 2, grad: C.cornStalk });
    return;
  }
  const h = stage === 1 ? 0.9 : 1.8;
  b.cyl(0.04, 0.06, h, 5, C.cornStalk, { grad: C.cornLeaf, open: true });
  const nl = stage === 1 ? 4 : 6;
  for (let i = 0; i < nl; i++) {
    const y = h * (0.2 + (i / nl) * 0.66);
    b.leaf(stage === 1 ? 0.56 : 0.8, 0.2, 105, i % 2 ? C.cornLeaf : C.cornStalk, { p: [0, y, 0], r: [38, i * 137, 0], steps: 3, fold: 0.3 });
  }
  if (stage === 2) {
    // espigas e pendão
    b.cyl(0.07, 0.085, 0.3, 5, C.cornHusk, { p: [0.06, h * 0.48, 0.02], r: [0, 0, -24] });
    b.cone(0.075, 0.2, 5, C.cornEar, { p: [0.18, h * 0.48 + 0.27, 0.02], r: [0, 0, -24] });
    b.cyl(0.07, 0.085, 0.3, 5, C.cornHusk, { p: [-0.05, h * 0.66, -0.03], r: [-10, 0, 26] });
    b.cone(0.075, 0.2, 5, C.cornEar, { p: [-0.18, h * 0.66 + 0.26, -0.08], r: [-10, 0, 26] });
    for (let i = 0; i < 4; i++) b.cyl(0.01, 0.02, 0.32, 3, C.cornTassel, { p: [0, h - 0.02, 0], r: [i ? 30 : 0, i * 120, 0], open: true });
  }
}

export function cafe(b, stage) {
  if (stage === 0) { // muda
    b.cyl(0.02, 0.025, 0.2, 4, C.trunk, { open: true });
    for (let i = 0; i < 4; i++) b.leaf(0.24, 0.14, 30, C.coffeeLeafLight, { p: [0, 0.14 + (i >> 1) * 0.06, 0], r: [62, i * 90 + (i >> 1) * 45, 0], steps: 2 });
    return;
  }
  const s = stage === 1 ? 0.68 : 1;
  b.group({ s }, () => {
    b.cyl(0.035, 0.05, 0.5, 5, C.trunk, { open: true });
    b.blob(0.42, 0, C.coffeeLeaf, { p: [0, 0.5, 0], s: [1.15, 0.8, 1.15], jit: 0.07, grad: C.coffeeLeafLight });
    b.blob(0.33, 0, C.coffeeLeaf, { p: [0.04, 0.88, -0.02], s: [1.1, 0.85, 1.1], jit: 0.07, grad: C.coffeeLeafLight });
    b.blob(0.2, 0, C.coffeeLeafLight, { p: [0, 1.16, 0.02], s: [1, 0.9, 1], jit: 0.07 });
    if (stage === 2) {
      const r = rng(91);
      for (let i = 0; i < 14; i++) {
        const a = r() * TAU, y = r.range(0.38, 1.02);
        const rad = 0.52 - Math.abs(y - 0.55) * 0.42;
        const c = r() < 0.8 ? C.coffeeCherry : C.coffeeGreen;
        b.ico(0.06, 0, c, { p: [Math.cos(a) * rad, y, Math.sin(a) * rad] });
      }
    }
  });
}

function folhaMandioca(b, p, tiltYaw, size) {
  // folha palmada: 5 folíolos em leque, pendentes
  b.group({ p, r: [tiltYaw[0], tiltYaw[1], 0] }, () => {
    b.cyl(0.012, 0.014, 0.24 * size, 3, C.cajuRed, { open: true });
    for (let i = 0; i < 5; i++) {
      b.leaf(0.36 * size, 0.15 * size, 50, i % 2 ? C.cassavaLeaf : C.cassavaLeafLight, { p: [0, 0.23 * size, 0], r: [76, i * 72, 0], steps: 2, fold: 0.2 });
    }
  });
}
export function mandioca(b, stage) {
  if (stage === 0) { // maniva brotando
    b.cyl(0.03, 0.035, 0.22, 4, C.cassavaStem, { r: [0, 0, 8], open: true });
    folhaMandioca(b, [0.03, 0.2, 0], [20, 0], 0.7);
    return;
  }
  if (stage === 1) {
    b.cyl(0.03, 0.04, 0.55, 4, C.cassavaStem, { open: true });
    folhaMandioca(b, [0, 0.5, 0], [30, 0], 0.95);
    folhaMandioca(b, [0, 0.4, 0], [44, 130], 0.9);
    folhaMandioca(b, [0, 0.3, 0], [48, 250], 0.85);
    return;
  }
  // adulta: haste que se bifurca
  b.cyl(0.035, 0.05, 0.75, 4, C.cassavaStem, { open: true });
  const tips = [[24, 20], [26, 140], [22, 260]];
  for (const [tilt, yaw] of tips) {
    b.group({ p: [0, 0.72, 0], r: [tilt, yaw, 0] }, () => {
      b.cyl(0.025, 0.035, 0.6, 4, C.cassavaStem, { open: true });
      folhaMandioca(b, [0, 0.58, 0], [14, 0], 1.15);
      folhaMandioca(b, [0, 0.42, 0], [54, 150], 1.05);
    });
  }
}

export function cana(b, stage) {
  const r = rng(stage * 13 + 5);
  if (stage === 0) { // perfilhos
    for (let i = 0; i < 5; i++) b.leaf(r.range(0.34, 0.5), 0.1, 40, C.caneLeaf, { p: [r.range(-0.08, 0.08), 0, r.range(-0.08, 0.08)], r: [r.range(8, 26), i * 72, 0], steps: 2, fold: 0.3 });
    return;
  }
  const n = 3;
  const H = stage === 1 ? 1.05 : 2.15;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * TAU + 0.4, rad = 0.14;
    const h = H * r.range(0.85, 1.08);
    const tilt = r.range(2, 8);
    b.group({ p: [Math.cos(a) * rad, 0, Math.sin(a) * rad], r: [tilt, (a * 180) / Math.PI + 90, 0] }, () => {
      const segs = stage === 1 ? 2 : 4;
      const sh = (h * 0.72) / segs;
      for (let i = 0; i < segs; i++) {
        const c = i % 2 ? C.caneStalk : mix(C.caneStalk, C.canePurple, stage === 2 ? 0.4 : 0.12);
        b.cyl(0.05, 0.056, sh, 5, c, { p: [0, i * sh, 0], open: true });
      }
      const top = h * 0.72;
      for (let i = 0; i < 4; i++) {
        b.leaf(stage === 1 ? 0.66 : 1.0, 0.13, 85, i % 2 ? C.caneLeaf : C.caneLeafDark, { p: [0, top - (i > 2 ? 0.2 : 0), 0], r: [r.range(14, 34), i * 90 + k * 33, 0], steps: 3, fold: 0.35 });
      }
    });
  }
}

export const CULTURAS = { milho, cafe, mandioca, cana };
export const NOME_CULTURA = { milho: 'Milho', cafe: 'Café', mandioca: 'Mandioca', cana: 'Cana' };
