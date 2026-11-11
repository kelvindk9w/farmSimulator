// Animais: galinhas (três pelagens), galo, pintinho, vacas (nelore com cupim e malhada leiteira).
import { C, mix, shade } from '../lib/palette.js';

export function galinha(b, o = {}) {
  const body = o.color || C.henWhite;
  const dark = shade(body, 0.86);
  const peck = !!o.peck;
  const rooster = !!o.rooster;
  b.group({ s: o.scale || 1 }, () => {
    for (const sx of [-1, 1]) {
      b.cyl(0.018, 0.018, 0.17, 4, C.beak, { p: [sx * 0.07, 0, 0] });
      b.box(0.07, 0.02, 0.11, C.beak, { p: [sx * 0.07, 0, 0.03] });
    }
    b.group({ p: [0, 0.3, 0], r: [peck ? 38 : 0, 0, 0] }, () => {
      b.sph(0.2, 8, 6, body, { s: [0.86, 0.84, 1.18], smooth: true, grad: mix(body, C.white, 0.2) });
      for (const sx of [-1, 1]) b.sph(0.13, 6, 5, dark, { p: [sx * 0.155, 0.0, -0.03], s: [0.35, 0.7, 1.15], smooth: true });
      // cauda
      const tc = rooster ? C.henBlack : dark;
      b.cone(0.1, rooster ? 0.4 : 0.26, 5, tc, { p: [0, 0.05, -0.2], r: [-38, 0, 0] });
      if (rooster) { b.cone(0.07, 0.36, 5, C.trimDark, { p: [0.04, 0.02, -0.22], r: [-58, 8, 0] }); b.cone(0.07, 0.34, 5, C.clothGreen, { p: [-0.04, 0.0, -0.2], r: [-72, -8, 0] }); }
      // pescoço e cabeça
      b.group({ p: [0, 0.1, 0.17], r: [peck ? 30 : -8, 0, 0] }, () => {
        b.cyl(0.07, 0.1, 0.2, 6, rooster ? C.henCaramel : body, { smooth: true });
        b.sph(0.095, 8, 6, body, { p: [0, 0.24, 0.02], smooth: true });
        b.cone(0.035, 0.09, 4, C.beak, { p: [0, 0.23, 0.1], r: [90, 0, 0] });
        const ch = rooster ? 1.5 : 1;
        b.box(0.03, 0.06 * ch, 0.05, C.comb, { p: [0, 0.32, 0.05] });
        b.box(0.03, 0.08 * ch, 0.05, C.comb, { p: [0, 0.32, 0.0] });
        b.box(0.03, 0.05 * ch, 0.04, C.comb, { p: [0, 0.31, -0.05] });
        b.sph(0.03 * ch, 5, 4, C.comb, { p: [0, 0.17, 0.09], s: [0.7, 1.2, 0.8] });
        for (const sx of [-1, 1]) b.sph(0.016, 4, 3, C.eye, { p: [sx * 0.078, 0.26, 0.055] });
      });
    });
  });
}

export function pintinho(b) {
  b.sph(0.085, 7, 5, C.chick, { p: [0, 0.1, 0], s: [0.95, 0.9, 1.1], smooth: true });
  b.sph(0.062, 7, 5, C.chick, { p: [0, 0.2, 0.06], smooth: true });
  b.cone(0.02, 0.05, 4, C.beak, { p: [0, 0.19, 0.115], r: [90, 0, 0] });
  for (const sx of [-1, 1]) { b.sph(0.011, 4, 3, C.eye, { p: [sx * 0.045, 0.215, 0.1] }); b.cyl(0.01, 0.01, 0.05, 3, C.beak, { p: [sx * 0.03, 0, 0] }); }
}

// tipo: 'nelore' (branca, com cupim e orelhas caídas) ou 'malhada' (leiteira preta e branca)
export function vaca(b, o = {}) {
  const DEG = Math.PI / 180;
  const nel = (o.tipo || 'nelore') === 'nelore';
  const graze = !!o.graze;
  const body = C.cowWhite, sh = C.cowShade, patch = C.cowDark;
  const S = { smooth: true };
  b.group({ s: o.scale || 1 }, () => {
    for (const [x, z] of [[0.21, 0.5], [-0.21, 0.5], [0.21, -0.52], [-0.21, -0.52]]) {
      b.cyl(0.105, 0.08, 0.72, 6, sh, { p: [x, 0.08, z], ...S, grad: body });
      b.cyl(0.09, 0.095, 0.1, 6, C.hoof, { p: [x, 0, z] });
    }
    b.sph(0.5, 10, 7, body, { p: [0, 1.0, 0], s: [0.82, 0.76, 1.62], ...S, ao: 0.22 });
    if (nel) {
      b.sph(0.22, 8, 6, sh, { p: [0, 1.4, 0.42], s: [0.85, 0.85, 1.2], ...S, grad: body }); // cupim
    } else {
      b.sph(0.34, 8, 6, patch, { p: [0.13, 1.14, -0.3], s: [1.05, 0.84, 1.25], ...S });
      b.sph(0.27, 8, 6, patch, { p: [-0.2, 1.06, 0.36], s: [1.0, 0.9, 1.1], ...S });
      b.sph(0.2, 8, 6, patch, { p: [0.24, 0.93, 0.42], s: [0.9, 0.9, 1.0], ...S });
      b.sph(0.17, 7, 5, C.cowPink, { p: [0, 0.66, -0.4], s: [1.1, 0.9, 1.2], ...S }); // úbere
    }
    // rabo
    b.cyl(0.03, 0.022, 0.62, 4, sh, { p: [0, 1.22, -0.8], r: [190, 0, 0] });
    b.sph(0.06, 5, 4, patch, { p: [0, 0.56, -0.9], s: [1, 1.7, 1] });
    // pescoço + cabeça
    const na = graze ? 122 : 46, nl = graze ? 0.62 : 0.52;
    const n0 = [0, 1.12, 0.6];
    b.cyl(0.18, 0.27, nl, 7, body, { p: n0, r: [na, 0, 0], ...S });
    if (nel && !graze) b.box(0.05, 0.34, 0.42, sh, { p: [0, 0.72, 0.66], r: [-28, 0, 0] }); // barbela
    const hy = n0[1] + Math.cos(na * DEG) * nl, hz = n0[2] + Math.sin(na * DEG) * nl;
    b.group({ p: [0, hy, hz - 0.06], r: [graze ? 62 : 16, o.look || 0, 0] }, () => {
      b.box(0.34, 0.31, 0.3, body, { p: [0, -0.15, -0.02] });
      b.tbox(0.32, 0.29, 0.23, 0.2, 0.3, body, { p: [0, 0.0, 0.12], r: [90, 0, 0] });
      b.box(0.24, 0.17, 0.1, nel ? patch : C.cowPink, { p: [0, -0.1, 0.4] });
      if (!nel) b.box(0.36, 0.2, 0.2, patch, { p: [0, 0.0, -0.06] });
      for (const sx of [-1, 1]) {
        b.sph(0.03, 5, 4, C.eye, { p: [sx * 0.165, 0.04, 0.12] });
        b.box(0.22, 0.045, 0.12, sh, { p: [sx * 0.27, nel ? -0.02 : 0.06, -0.08], r: [0, 0, sx * (nel ? -40 : -6)] });
        b.cone(0.04, 0.17, 5, C.horn, { p: [sx * 0.12, 0.13, -0.1], r: [-18, 0, sx * -38] });
      }
    });
  });
}
