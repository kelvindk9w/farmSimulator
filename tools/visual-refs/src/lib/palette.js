// Paletas (direções de arte). Todas as cores do jogo saem daqui: trocar a paleta
// muda a direção de arte sem tocar em nenhum modelo.
import * as THREE from 'three';

const BASE = {
  // terreno
  grass: '#7cc257', grassLight: '#93d06a', grassDark: '#62ad49', grassOuter: '#58a045',
  grassTuft: '#56a53e', flowerA: '#fff3b0', flowerB: '#ff9ec4', flowerC: '#ffffff',
  soil: '#93543a', soilDark: '#7b4330', soilLight: '#ab6846', soilWet: '#6d3a2a',
  path: '#d99a62', pathLight: '#e7b07a', pathDark: '#c2814e',
  water: '#4cb8d8', waterDeep: '#3a9fc6', waterLight: '#8fdbec', foam: '#dff6f8', sand: '#e9cf9a',
  stone: '#aaa59b', stoneDark: '#8c877e', stoneLight: '#c4bfb4',
  // madeira e construção
  wood: '#a9713f', woodDark: '#7c4d2b', woodLight: '#cb9963', woodPale: '#dcb98a', woodGrey: '#9d8a74',
  wall: '#f8f1e2', wallShade: '#eadfc8', wallBase: '#d9c7a6',
  trim: '#2f7fc0', trimDark: '#225f93', trimLight: '#6fb0e0',
  roof: '#cb623c', roofDark: '#aa4d2d', roofLight: '#df7f55',
  barnWall: '#f3ead6', barnDoor: '#3f8f6b', barnDoorDark: '#2f7355',
  metal: '#c3ced6', metalDark: '#93a1ab', metalLight: '#e1e8ec', siloRoof: '#d6583f',
  glass: '#5d86a8', glassLit: '#ffe9a3',
  rope: '#c9a777', hay: '#e6c45c', hayDark: '#caa646', sack: '#d9c29a', sackDark: '#bfa67b',
  // vegetação
  leaf: '#4fa043', leafDark: '#3b8536', leafLight: '#70bb50',
  trunk: '#7d5538', trunkDark: '#5f3f29',
  forest: '#3f8e42', forestDark: '#2f7739', forestLight: '#5aa64b',
  orangeLeaf: '#2f8140', orangeLeafLight: '#44994a', orange: '#f58d27',
  bananaLeaf: '#73bf43', bananaLeafDark: '#56a436', bananaStem: '#9bb45a', banana: '#f6d648', bananaHeart: '#8e3b5e',
  cajuLeaf: '#55a045', cajuLeafDark: '#3f8739', cajuRed: '#e4472f', cajuYellow: '#f4b730', cajuNut: '#6f5f50',
  cornStalk: '#8cc046', cornLeaf: '#6fb23b', cornEar: '#f4c532', cornHusk: '#cfe08a', cornTassel: '#ecd98e',
  coffeeLeaf: '#2e7c3e', coffeeLeafLight: '#3f9148', coffeeCherry: '#d8283f', coffeeGreen: '#a9c43f',
  cassavaStem: '#a65a37', cassavaLeaf: '#4fa54b', cassavaLeafLight: '#68b955', cassavaRoot: '#8a5a3c',
  caneStalk: '#b9c552', caneNode: '#8f9f3d', caneLeaf: '#7fbe47', caneLeafDark: '#63a53b', canePurple: '#8a5a86',
  reed: '#6da04a', lily: '#5fb257', lilyFlower: '#f7b6d2',
  // animais
  henWhite: '#f6f2e7', henBrown: '#b6723c', henCaramel: '#dba050', henBlack: '#3d3836',
  comb: '#da3530', beak: '#f3a92f', chick: '#f9dc5c',
  cowWhite: '#efe9dc', cowShade: '#d2cabb', cowDark: '#3d3533', cowBrown: '#a8683f', cowPink: '#e8a9a0', horn: '#e7dcc0', hoof: '#4b423c',
  // tecidos / feira / festa
  clothRed: '#e24a3d', clothWhite: '#fbf6ea', clothYellow: '#f6c73d', clothGreen: '#41a85c', clothBlue: '#3e8cda',
  clothPink: '#f27aa6', clothOrange: '#f6923a', clothPurple: '#8e68c9', clothTeal: '#2fb5a8',
  denim: '#4a77b4', denimDark: '#365a8c', leather: '#8b5a33', leatherDark: '#66401f', straw: '#ebcf7a', strawDark: '#cfae55',
  boot: '#5a4636', bootRubber: '#33443f', black: '#2b2523', white: '#ffffff',
  crate: '#c79a62', crateDark: '#a57a45', basket: '#c99a52',
  can: '#6f9fb0', canDark: '#557f90',
  // personagem
  skin1: '#f7d3b1', skin2: '#e5b084', skin3: '#c8875b', skin4: '#9d6440', skin5: '#6f452b',
  hairBlack: '#2c1e18', hairBrown: '#5b3b23', hairCaramel: '#b9792f', hairBlond: '#e2b65b', hairRed: '#a8452b', hairGrey: '#cfcac4',
  eye: '#2a1c16', mouth: '#a8433f', blush: '#f29a8a',
  // céu
  skyTop: '#5fb4ea', skyHorizon: '#cfeefc', cloud: '#ffffff', hill: '#7fbf7a', hillFar: '#a3d1b5',
};

function hslShift(hex, { sat = 1, light = 0, hue = 0, lmul = 1 }) {
  const c = new THREE.Color(hex);
  const h = {};
  c.getHSL(h, THREE.SRGBColorSpace);
  const s = Math.min(1, h.s * sat);
  const l = Math.min(0.97, Math.max(0.03, h.l * lmul + light));
  c.setHSL((h.h + hue + 1) % 1, s, l, THREE.SRGBColorSpace);
  return '#' + c.getHexString(THREE.SRGBColorSpace);
}

function derive(xf, over = {}) {
  const out = {};
  for (const k of Object.keys(BASE)) out[k] = over[k] || hslShift(BASE[k], xf);
  return out;
}

// "Vibrante tropical": saturação alta, verdes-limão, água turquesa, casas coloridas.
const TROPICAL = derive({ sat: 1.28, lmul: 1.0, light: 0.0 }, {
  grass: '#6fd04a', grassLight: '#93e35a', grassDark: '#4fb93f', grassOuter: '#3fa83b', grassTuft: '#3fae36',
  water: '#22c3d6', waterDeep: '#0fa3c4', waterLight: '#86ecee',
  path: '#ef9a4e', pathLight: '#fbb469', pathDark: '#d67c38',
  soil: '#9a4a2c', soilDark: '#7d3721', soilLight: '#b85f38', soilWet: '#6d2d1c',
  wall: '#ffd75e', wallShade: '#f6bf3f', wallBase: '#e99a3a',
  trim: '#00a6a6', trimDark: '#007f86', trimLight: '#5fd6cf',
  roof: '#e8502c', roofDark: '#c23a1d', roofLight: '#ff7a4d',
  barnWall: '#ff8f6b', barnDoor: '#1f9d8b', barnDoorDark: '#13786c',
  siloRoof: '#ff5fa2', metal: '#bfe3ea', metalDark: '#86bccb', metalLight: '#e4f6f8',
  leaf: '#33b24a', leafDark: '#1f9242', leafLight: '#6fd64f',
  forest: '#1f9a4a', forestDark: '#15803f', forestLight: '#48bd54',
  skyTop: '#22a7f0', skyHorizon: '#bdf3ff', hill: '#56c46a', hillFar: '#8fe0b5',
  hay: '#ffd23f', hayDark: '#e6ac27',
});

// "Pastel aconchegante": pouca saturação, tons claros e quentes, sombras suaves.
const PASTEL = derive({ sat: 0.62, lmul: 0.9, light: 0.14 }, {
  grass: '#b4dba0', grassLight: '#c6e6b1', grassDark: '#9fcd90', grassOuter: '#95c48b', grassTuft: '#8fbf83',
  water: '#a5d8e6', waterDeep: '#8cc7dc', waterLight: '#cdeef3',
  path: '#efd6b6', pathLight: '#f7e4c9', pathDark: '#e0c09c',
  soil: '#b98f7a', soilDark: '#a67c69', soilLight: '#caa38d', soilWet: '#9a7362',
  wall: '#fff6ea', wallShade: '#f5e6d3', wallBase: '#e8d3bb',
  trim: '#8fb8d8', trimDark: '#7099bd', trimLight: '#bcd8ec',
  roof: '#e6a092', roofDark: '#d38577', roofLight: '#f2b9ab',
  barnWall: '#fbe9d7', barnDoor: '#9fcdb8', barnDoorDark: '#80b39c',
  siloRoof: '#f0a9b8', skyTop: '#bfdcf2', skyHorizon: '#fdf1e7', hill: '#bfe0b6', hillFar: '#d9ecd9',
});

const PALETTES = { base: BASE, tropical: TROPICAL, pastel: PASTEL };

// C é o objeto "vivo" que os modelos consultam (C.grass, C.wood, ...).
export const C = {};
export let paletteName = 'base';
export function setPalette(name) {
  const p = PALETTES[name];
  if (!p) throw new Error('paleta desconhecida: ' + name);
  paletteName = name;
  for (const k of Object.keys(C)) delete C[k];
  for (const k of Object.keys(p)) C[k] = new THREE.Color(p[k]);
  return C;
}
export function paletteHex(name) { return PALETTES[name]; }
setPalette('base');

export function mix(a, b, t) { return new THREE.Color(a).lerp(new THREE.Color(b), t); }
export function shade(a, k) { return new THREE.Color(a).multiplyScalar(k); }
