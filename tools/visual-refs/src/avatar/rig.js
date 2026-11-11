// Avatar: humanoide low-poly articulado. Um esqueleto (17 ossos) + UMA malha com skinning rígido
// (cada vértice segue um osso). Roupas e cosméticos são "módulos" de geometria presos aos mesmos ossos.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Builder } from '../lib/builder.js';
import { C, mix, shade } from '../lib/palette.js';

// nome, pai, posição de repouso relativa ao pai
export const BONES = [
  ['root', null, [0, 0, 0]],
  ['hips', 'root', [0, 0.66, 0]],
  ['spine', 'hips', [0, 0.07, 0]],
  ['chest', 'spine', [0, 0.16, 0]],
  ['neck', 'chest', [0, 0.24, 0]],
  ['head', 'neck', [0, 0.05, 0]],
  ['upperArmL', 'chest', [0.225, 0.175, 0]],
  ['lowerArmL', 'upperArmL', [0, -0.24, 0]],
  ['handL', 'lowerArmL', [0, -0.21, 0]],
  ['upperArmR', 'chest', [-0.225, 0.175, 0]],
  ['lowerArmR', 'upperArmR', [0, -0.24, 0]],
  ['handR', 'lowerArmR', [0, -0.21, 0]],
  ['upperLegL', 'hips', [0.1, -0.03, 0]],
  ['lowerLegL', 'upperLegL', [0, -0.3, 0]],
  ['footL', 'lowerLegL', [0, -0.27, 0]],
  ['upperLegR', 'hips', [-0.1, -0.03, 0]],
  ['lowerLegR', 'upperLegR', [0, -0.3, 0]],
  ['footR', 'lowerLegR', [0, -0.27, 0]],
];
export const BONE_INDEX = Object.fromEntries(BONES.map((b, i) => [b[0], i]));

export const OUTFITS = {
  ana: {
    nome: 'Ana', skin: 'skin3', hair: { style: 'coque', color: 'hairBlack' }, hat: 'palha',
    top: { color: 'clothYellow', sleeves: 'curta', bib: 'denim' }, bottom: { color: 'denim' }, shoes: { type: 'bota', color: 'boot' },
    extras: [], tag: '#f6c73d',
  },
  leo: {
    nome: 'Léo', skin: 'skin5', hair: { style: 'curto', color: 'hairBlack' }, hat: 'bone', hatColor: 'clothRed',
    top: { color: 'clothTeal', sleeves: 'curta' }, bottom: { color: 'sack', shorts: true }, shoes: { type: 'tenis', color: 'clothWhite' },
    extras: [], tag: '#2fb5a8',
  },
  bia: {
    nome: 'Bia', skin: 'skin1', hair: { style: 'trancas', color: 'hairRed' }, hat: 'lenco', hatColor: 'clothPink',
    top: { color: 'clothWhite', sleeves: 'curta', bib: 'clothPink' }, bottom: { color: 'clothPink' }, shoes: { type: 'galocha', color: 'clothBlue' },
    extras: [], tag: '#f27aa6',
  },
  junino: {
    nome: 'Festa junina', skin: 'skin2', hair: { style: 'curto', color: 'hairBrown' }, hat: 'palha',
    top: { color: 'clothRed', sleeves: 'longa', patches: true }, bottom: { color: 'denimDark', patches: true }, shoes: { type: 'bota', color: 'leather' },
    extras: ['lenco', 'bigode'], tag: '#e24a3d',
  },
  boiadeira: {
    nome: 'Boiadeira', skin: 'skin4', hair: { style: 'rabo', color: 'hairBrown' }, hat: 'boiadeiro', hatColor: 'leather',
    top: { color: 'clothWhite', sleeves: 'longa', vest: 'leather' }, bottom: { color: 'denimDark' }, shoes: { type: 'bota', color: 'leatherDark' },
    extras: ['cinto'], tag: '#8b5a33',
  },
  chuva: {
    nome: 'Dia de chuva', skin: 'skin2', hair: { style: 'cacheado', color: 'hairCaramel' }, hat: 'capuz', hatColor: 'clothYellow',
    top: { color: 'clothYellow', sleeves: 'longa', coat: true }, bottom: { color: 'clothGreen' }, shoes: { type: 'galocha', color: 'clothRed' },
    extras: ['mochila'], tag: '#41a85c',
  },
  base: {
    nome: 'Corpo base', skin: 'skin2', hair: { style: 'careca', color: 'hairBrown' }, hat: null,
    top: { color: 'wallShade', sleeves: 'curta' }, bottom: { color: 'woodGrey', shorts: true }, shoes: { type: 'descalco', color: 'skin2' },
    extras: [], tag: '#999999',
  },
};

const S = { smooth: true };

// Desenha as partes de UM osso, em coordenadas locais do osso.
function partes(b, bone, o) {
  const skin = C[o.skin];
  const top = C[o.top.color];
  const bottom = C[o.bottom.color];
  const bib = o.top.bib ? C[o.top.bib] : null;
  const longSleeve = o.top.sleeves === 'longa';
  const coat = !!o.top.coat;
  const side = bone.endsWith('L') ? 1 : -1;
  const shoe = C[o.shoes.color];
  const hairC = C[o.hair.color];
  switch (bone) {
    case 'hips': {
      b.cyl(0.172, 0.15, 0.19, 8, bib || bottom, { p: [0, -0.11, 0], s: [1, 1, 0.74], ...S });
      b.sph(0.15, 8, 4, bib || bottom, { p: [0, -0.1, 0], s: [1, 0.45, 0.74], ...S });
      if (coat) b.cyl(0.19, 0.215, 0.2, 8, top, { p: [0, -0.16, 0], s: [1, 1, 0.8], ...S, open: true });
      if (o.extras.includes('cinto')) { b.cyl(0.178, 0.178, 0.045, 8, C.leatherDark, { p: [0, 0.03, 0], s: [1, 1, 0.76], ...S, open: true }); b.box(0.06, 0.055, 0.02, C.clothYellow, { p: [0, 0.025, 0.13] }); }
      break;
    }
    case 'spine': {
      b.cyl(0.168, 0.172, 0.17, 8, bib || top, { p: [0, 0, 0], s: [1, 1, 0.74], ...S, open: true });
      if (coat) b.cyl(0.185, 0.192, 0.17, 8, top, { s: [1, 1, 0.8], ...S, open: true });
      break;
    }
    case 'chest': {
      b.cyl(0.2, 0.168, 0.2, 8, top, { s: [1, 1, 0.74], ...S, open: true });
      b.sph(0.2, 8, 5, top, { p: [0, 0.2, 0], s: [1, 0.36, 0.74], ...S });
      if (coat) { b.cyl(0.212, 0.186, 0.2, 8, top, { s: [1, 1, 0.8], ...S, open: true }); for (let i = 0; i < 3; i++) b.sph(0.018, 5, 4, C.black, { p: [0, 0.02 + i * 0.075, 0.165] }); }
      if (bib) { // jardineira: peitilho + alças
        b.box(0.2, 0.17, 0.03, bib, { p: [0, -0.005, 0.135] });
        b.box(0.11, 0.07, 0.035, shade(bib, 0.85), { p: [0, 0.04, 0.14] });
        for (const sx of [-1, 1]) {
          b.box(0.045, 0.16, 0.03, bib, { p: [sx * 0.085, 0.12, 0.128], r: [-14, 0, sx * 8] });
          b.box(0.045, 0.3, 0.03, bib, { p: [sx * 0.085, -0.02, -0.135], r: [8, 0, sx * -6] });
          b.sph(0.02, 5, 4, C.clothYellow, { p: [sx * 0.08, 0.14, 0.152] });
        }
      }
      if (o.top.vest) {
        const v = C[o.top.vest];
        b.add(new THREE.CylinderGeometry(0.215, 0.19, 0.27, 10, 1, true, 0.42, Math.PI * 2 - 0.84), v, { p: [0, 0.1, 0], s: [1, 1, 0.8], ...S });
        b.add(new THREE.CylinderGeometry(0.19, 0.215, 0.27, 10, 1, true, 0.42, Math.PI * 2 - 0.84), shade(v, 0.8), { p: [0, 0.1, 0], s: [-0.99, 1, 0.79], ...S });
      }
      if (o.top.patches) { b.box(0.07, 0.07, 0.02, C.clothYellow, { p: [0.08, 0.03, 0.145], r: [0, 0, 12] }); b.box(0.06, 0.06, 0.02, C.clothBlue, { p: [-0.09, 0.1, 0.143], r: [0, 0, -8] }); }
      if (o.extras.includes('lenco')) { // lenço no pescoço
        b.cone(0.11, 0.15, 4, C.clothBlue, { p: [0, 0.07, 0.13], r: [180, 45, 0], s: [1, 1, 0.5] });
        b.cyl(0.085, 0.1, 0.05, 8, C.clothBlue, { p: [0, 0.215, 0], ...S, open: true });
      }
      if (o.extras.includes('mochila')) {
        b.box(0.26, 0.3, 0.13, C.clothBlue, { p: [0, -0.05, -0.215] });
        b.box(0.2, 0.12, 0.04, shade(C.clothBlue, 0.8), { p: [0, -0.02, -0.29] });
        for (const sx of [-1, 1]) b.box(0.04, 0.26, 0.3, shade(C.clothBlue, 0.85), { p: [sx * 0.12, -0.02, -0.03] });
      }
      break;
    }
    case 'neck':
      b.cyl(0.062, 0.07, 0.09, 7, skin, { p: [0, -0.03, 0], ...S, open: true });
      break;
    case 'head':
      cabeca(b, o, skin, hairC);
      break;
    case 'upperArmL': case 'upperArmR': {
      const sleeveC = coat || longSleeve ? top : top;
      b.sph(0.074, 7, 5, sleeveC, { ...S });
      if (longSleeve || coat) b.cyl(0.062, 0.07, 0.24, 7, top, { p: [0, -0.24, 0], ...S, open: true });
      else {
        b.cyl(0.066, 0.074, 0.13, 7, top, { p: [0, -0.13, 0], ...S });
        b.cyl(0.05, 0.056, 0.24, 7, skin, { p: [0, -0.24, 0], ...S, open: true });
      }
      break;
    }
    case 'lowerArmL': case 'lowerArmR': {
      const c = longSleeve || coat ? top : skin;
      const r0 = longSleeve || coat ? 0.062 : 0.05;
      b.sph(r0 + 0.002, 7, 5, c, { ...S });
      b.cyl(r0 - 0.006, r0, 0.21, 7, c, { p: [0, -0.21, 0], ...S, open: true });
      if (longSleeve || coat) b.cyl(r0, r0, 0.035, 7, shade(top, 0.86), { p: [0, -0.205, 0], ...S, open: true });
      break;
    }
    case 'handL': case 'handR':
      b.sph(0.058, 7, 5, o.extras.includes('luvas') ? C.clothOrange : skin, { p: [0, -0.035, 0.005], s: [0.82, 1.1, 1], ...S });
      b.sph(0.022, 5, 4, o.extras.includes('luvas') ? C.clothOrange : skin, { p: [side * -0.012, -0.03, 0.05], ...S }); // polegar
      break;
    case 'upperLegL': case 'upperLegR': {
      b.sph(0.088, 7, 5, bib || bottom, { ...S });
      if (o.bottom.shorts) {
        b.cyl(0.082, 0.088, 0.2, 7, bottom, { p: [0, -0.2, 0], ...S });
        b.cyl(0.064, 0.07, 0.3, 7, skin, { p: [0, -0.3, 0], ...S, open: true });
      } else {
        b.cyl(0.072, 0.088, 0.3, 7, bottom, { p: [0, -0.3, 0], ...S, open: true });
        if (o.bottom.patches && side > 0) b.box(0.07, 0.07, 0.02, C.clothRed, { p: [0.0, -0.2, 0.075], r: [0, 0, 10] });
      }
      break;
    }
    case 'lowerLegL': case 'lowerLegR': {
      const tall = o.shoes.type === 'bota' || o.shoes.type === 'galocha';
      const legC = o.bottom.shorts ? skin : bottom;
      const r0 = o.bottom.shorts ? 0.064 : 0.072;
      b.sph(r0 + 0.002, 7, 5, legC, { ...S });
      b.cyl(r0 - 0.012, r0, 0.27, 7, legC, { p: [0, -0.27, 0], ...S, open: true });
      if (tall) {
        const hh = o.shoes.type === 'galocha' ? 0.19 : 0.15;
        b.cyl(0.074, 0.08, hh, 7, shoe, { p: [0, -0.27, 0], ...S, open: true });
        b.cyl(0.084, 0.084, 0.03, 7, shade(shoe, 0.82), { p: [0, -0.27 + hh - 0.015, 0], ...S, open: true });
      } else if (o.shoes.type === 'tenis') {
        b.cyl(0.062, 0.066, 0.07, 7, C.clothWhite, { p: [0, -0.24, 0], ...S, open: true }); // meia
      }
      break;
    }
    case 'footL': case 'footR': {
      if (o.shoes.type === 'descalco') {
        b.sph(0.07, 7, 5, skin, { p: [0, -0.015, 0.05], s: [0.95, 0.64, 1.75], ...S });
      } else {
        const sole = o.shoes.type === 'tenis' ? C.clothWhite : shade(shoe, 0.7);
        b.box(0.15, 0.025, 0.26, sole, { p: [0, -0.06, 0.05] });
        b.sph(0.078, 7, 5, shoe, { p: [0, -0.01, 0.03], s: [0.95, 0.7, 1.25], ...S });
        b.sph(0.07, 7, 5, shoe, { p: [0, -0.02, 0.105], s: [0.98, 0.56, 1.0], ...S });
        if (o.shoes.type === 'tenis') b.box(0.1, 0.02, 0.07, C.clothRed, { p: [0, 0.025, 0.07], r: [18, 0, 0] });
      }
      break;
    }
  }
}

function cabeca(b, o, skin, hairC) {
  const R = 0.235, cy = 0.2;
  b.sph(R, 12, 9, skin, { p: [0, cy, 0], s: [1, 0.95, 0.96], ...S });
  // orelhas e nariz
  for (const sx of [-1, 1]) b.sph(0.045, 6, 5, skin, { p: [sx * 0.232, cy - 0.02, 0.0], s: [0.5, 1, 0.8], ...S });
  b.sph(0.026, 6, 5, shade(skin, 0.93), { p: [0, cy - 0.035, 0.228], ...S });
  // olhos, sobrancelhas, bochechas, boca
  for (const sx of [-1, 1]) {
    b.sph(0.034, 8, 6, C.eye, { p: [sx * 0.092, cy + 0.005, 0.205], s: [0.82, 1.18, 0.45], ...S });
    b.sph(0.011, 5, 4, C.white, { p: [sx * 0.092 + 0.012, cy + 0.022, 0.221] });
    b.box(0.062, 0.014, 0.012, shade(hairC, 0.9), { p: [sx * 0.095, cy + 0.068, 0.208], r: [0, sx * 20, sx * -7] });
    b.sph(0.036, 6, 4, C.blush, { p: [sx * 0.148, cy - 0.062, 0.168], s: [1, 0.62, 0.3], ...S });
  }
  b.box(0.07, 0.016, 0.012, C.mouth, { p: [0, cy - 0.105, 0.208] });
  for (const sx of [-1, 1]) b.box(0.022, 0.016, 0.012, C.mouth, { p: [sx * 0.043, cy - 0.097, 0.202], r: [0, sx * 22, sx * 28] });
  if (o.extras.includes('bigode')) for (const sx of [-1, 1]) b.box(0.075, 0.03, 0.02, hairC, { p: [sx * 0.04, cy - 0.072, 0.222], r: [0, sx * 14, sx * -14] });

  const hat = o.hat;
  const hatC = o.hatColor ? C[o.hatColor] : C.straw;
  const style = o.hair.style;
  const HR = R * 1.07;
  const coberto = hat === 'bone' || hat === 'lenco';
  const capaCabelo = (thetaLen) => {
    // topo + parte de trás (deixa o rosto livre)
    b.add(new THREE.SphereGeometry(HR, 12, 5, 0, Math.PI * 2, 0, Math.PI * 0.36), hairC, { p: [0, cy + 0.012, -0.004], s: [1, 0.97, 1], ...S });
    b.add(new THREE.SphereGeometry(HR, 10, 5, Math.PI * 0.95, Math.PI * 1.1, Math.PI * 0.33, Math.PI * thetaLen), hairC, { p: [0, cy + 0.012, -0.004], s: [1, 0.97, 1], ...S });
    if (coberto) {
      // com boné/lenço: só uma franjinha baixa, colada na testa
      for (const sx of [-1, 1]) b.sph(0.07, 6, 4, hairC, { p: [sx * 0.085, cy + 0.118, 0.172], s: [1.25, 0.42, 0.6], r: [0, 0, sx * -14], ...S });
    } else {
      b.sph(0.1, 7, 5, hairC, { p: [-0.07, cy + 0.165, 0.15], s: [1.4, 0.55, 0.8], ...S });
      b.sph(0.09, 7, 5, hairC, { p: [0.09, cy + 0.16, 0.14], s: [1.2, 0.5, 0.8], ...S });
    }
  };
  if (style !== 'careca' && hat !== 'capuz') {
    if (style === 'curto') capaCabelo(0.3);
    else if (style === 'coque') { capaCabelo(0.34); if (!hat || hat === 'lenco') b.sph(0.1, 8, 6, hairC, { p: [0, cy + 0.27, -0.06], ...S }); else b.sph(0.085, 8, 6, hairC, { p: [0, cy - 0.02, -0.26], ...S }); }
    else if (style === 'rabo') { capaCabelo(0.36); b.sph(0.075, 7, 5, hairC, { p: [0, cy + 0.06, -0.26], ...S }); b.cone(0.085, 0.36, 7, hairC, { p: [0, cy + 0.07, -0.27], r: [180 + 22, 0, 0], ...S }); }
    else if (style === 'trancas') {
      capaCabelo(0.38);
      for (const sx of [-1, 1]) {
        for (let i = 0; i < 4; i++) b.sph(0.052 - i * 0.004, 6, 5, hairC, { p: [sx * (0.2 + i * 0.012), cy - 0.12 - i * 0.075, -0.02 + i * 0.012], s: [1, 1.15, 1], ...S });
        b.sph(0.03, 5, 4, C.clothYellow, { p: [sx * 0.243, cy - 0.4, 0.022] });
      }
    } else if (style === 'cacheado') {
      const pts = [[0, 0.2, -0.04, 0.2], [0.15, 0.13, 0.02, 0.14], [-0.15, 0.13, 0.02, 0.14], [0.18, 0.02, -0.1, 0.13], [-0.18, 0.02, -0.1, 0.13], [0, 0.08, -0.19, 0.16], [0.08, 0.19, 0.1, 0.11], [-0.08, 0.19, 0.1, 0.11], [0, -0.06, -0.2, 0.12]];
      for (const [x, y, z, rad] of pts) b.sph(rad, 7, 5, hairC, { p: [x, cy + y, z], ...S });
    }
  }
  // chapéus e afins (módulos cosméticos)
  if (hat === 'palha' || hat === 'boiadeiro') {
    const wide = hat === 'palha' ? 0.47 : 0.42;
    b.group({ p: [0, cy + 0.125, 0], r: [-7, 0, 0] }, () => {
      b.cyl(wide * 0.62, wide, 0.05, 12, hatC, { ...S, grad: mix(hatC, C.white, 0.18) });
      b.cyl(wide, wide, 0.012, 12, shade(hatC, 0.86), { p: [0, -0.012, 0], open: true });
      b.cyl(0.19, 0.235, hat === 'palha' ? 0.17 : 0.2, 10, hatC, { p: [0, 0.03, 0], ...S });
      b.cyl(0.238, 0.24, 0.045, 10, hat === 'palha' ? C.clothRed : C.leatherDark, { p: [0, 0.045, 0], ...S, open: true });
      if (hat === 'boiadeiro') b.cyl(0.14, 0.19, 0.06, 10, shade(hatC, 0.9), { p: [0, 0.225, 0], ...S });
    });
  } else if (hat === 'bone') {
    b.add(new THREE.SphereGeometry(HR * 1.03, 12, 5, 0, Math.PI * 2, 0, Math.PI * 0.4), hatC, { p: [0, cy + 0.02, 0], ...S });
    b.cyl(0.17, 0.17, 0.022, 10, shade(hatC, 0.85), { p: [0, cy + 0.085, 0.2], s: [1, 1, 0.9], r: [8, 0, 0] });
    b.sph(0.025, 5, 4, shade(hatC, 0.85), { p: [0, cy + 0.268, 0] });
  } else if (hat === 'lenco') {
    b.add(new THREE.SphereGeometry(HR * 1.035, 12, 5, 0, Math.PI * 2, 0, Math.PI * 0.34), hatC, { p: [0, cy + 0.016, -0.005], ...S });
    b.cyl(HR * 0.95, HR * 0.98, 0.04, 12, shade(hatC, 0.88), { p: [0, cy + 0.11, -0.005], s: [1, 1, 1], ...S, open: true });
    b.cone(0.06, 0.13, 4, hatC, { p: [0.03, cy + 0.1, -0.25], r: [-120, 0, 20] });
    b.cone(0.06, 0.13, 4, hatC, { p: [-0.03, cy + 0.1, -0.25], r: [-120, 0, -20] });
  } else if (hat === 'capuz') {
    b.add(new THREE.SphereGeometry(HR * 1.1, 12, 7, Math.PI * 0.72, Math.PI * 1.56, 0, Math.PI * 0.72), hatC, { p: [0, cy + 0.01, -0.01], ...S });
    b.sph(0.1, 7, 5, hairC, { p: [-0.05, cy + 0.165, 0.15], s: [1.5, 0.5, 0.8], ...S });
    b.sph(0.09, 7, 5, hairC, { p: [0.09, cy + 0.16, 0.14], s: [1.2, 0.5, 0.8], ...S });
  }
}

// Constrói esqueleto + malha com skinning para um visual (outfit).
export function criarAvatar(outfitName = 'ana', { material } = {}) {
  const o = typeof outfitName === 'string' ? OUTFITS[outfitName] : outfitName;
  const bones = BONES.map(([name]) => { const b = new THREE.Bone(); b.name = name; return b; });
  BONES.forEach(([name, parent, pos], i) => {
    bones[i].position.set(...pos);
    if (parent) bones[BONE_INDEX[parent]].add(bones[i]);
  });
  const root = bones[0];
  root.updateMatrixWorld(true);
  // geometria: cada osso desenha suas partes no espaço de repouso
  const b = new Builder(5);
  const probes = {}; // caixa local por osso (para apoiar o corpo no chão)
  BONES.forEach(([name], i) => {
    if (name === 'root') return;
    const start = b.parts.length;
    const local = new Builder(5);
    partes(local, name, o);
    if (!local.parts.length) return;
    const box = new THREE.Box3();
    for (const g of local.parts) { g.computeBoundingBox(); box.union(g.boundingBox); }
    probes[name] = box;
    const m = bones[i].matrixWorld;
    for (const g of local.parts) { g.applyMatrix4(m); g.userData.bone = i; b.parts.push(g); }
  });
  const geos = b.parts;
  const merged = mergeGeometries(geos, false);
  const n = merged.attributes.position.count;
  const skinIndex = new Uint16Array(n * 4), skinWeight = new Float32Array(n * 4);
  let off = 0;
  for (const g of geos) {
    const c = g.attributes.position.count;
    for (let k = 0; k < c; k++) { skinIndex[(off + k) * 4] = g.userData.bone; skinWeight[(off + k) * 4] = 1; }
    off += c;
  }
  merged.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
  merged.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
  const mat = material || new THREE.MeshLambertMaterial({ vertexColors: true });
  const mesh = new THREE.SkinnedMesh(merged, mat);
  mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.add(root);
  group.add(mesh);
  const skeleton = new THREE.Skeleton(bones);
  mesh.bind(skeleton);
  const avatar = { group, root, mesh, bones, skeleton, probes, outfit: o, props: [], triangles: n / 3 };
  return avatar;
}
