// Planta da fazenda: uma lista de "entidades" (tipo + posição + parâmetros).
// A MESMA lista alimenta a cena 3D (opções A e B) e a montagem 2D por sprites (opção C).
// Eixos: câmera isométrica olha de (+x,+z); na tela, +x desce para a direita e +z desce para a esquerda.
import { rng, fbm2 } from '../lib/rng.js';

export const FARM = 21; // meia-largura do terreno cercado
export const PLOT = { cx: 1, cz: 1, w: 5.4, d: 3.8, gap: 1.6 };

function plots() {
  const { cx, cz, w, d, gap } = PLOT;
  const g = gap / 2;
  return [
    { crop: 'cana', x0: cx - g - w, z0: cz - g - d, order: [0, 1, 2] },     // topo da tela
    { crop: 'milho', x0: cx + g, z0: cz - g - d, order: [0, 1, 2] },        // direita (Léo colhe na ponta madura)
    { crop: 'cafe', x0: cx - g - w, z0: cz + g, order: [0, 1, 2] },         // esquerda
    { crop: 'mandioca', x0: cx + g, z0: cz + g, order: [1, 0, 2], wet: 0.36 }, // baixo (Ana rega aqui)
  ].map((p) => ({ ...p, w, d, x: p.x0 + w / 2, z: p.z0 + d / 2 }));
}

export function gerarLayout() {
  const E = [];           // entidades
  const paths = new Set(); // células de caminho "x,z" (canto inferior da célula)
  const blocked = [];      // retângulos ocupados [x0,z0,x1,z1] (para espalhar enfeites)
  const add = (k, x, z, o = {}) => { const e = { k, x, z, y: 0, r: 0, s: 1, ...o }; E.push(e); return e; };
  const block = (x0, z0, x1, z1) => blocked.push([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)]);
  const pathRect = (x0, z0, x1, z1) => { for (let x = Math.floor(x0); x < x1; x++) for (let z = Math.floor(z0); z < z1; z++) paths.add(x + ',' + z); };
  const r = rng(2026);

  // ---- caminhos (células de 1 m; os principais têm 2 de largura) ----
  pathRect(-9, 0, FARM + 6, 2);      // eixo casa -> porteira (ao longo de X)
  pathRect(0, -11, 2, 10);           // eixo galpão -> lagoa (ao longo de Z)
  pathRect(2, -9, 10, -8);           // ramal do galinheiro
  pathRect(11, -1, 15, 0);           // frente da barraca
  pathRect(-8, 2, -7, 8);            // ramal do curral
  pathRect(-4, -11, 6, -9);          // pátio do galpão
  pathRect(2, 8, 4, 10);             // chegada à lagoa

  // ---- canteiros e plantas ----
  const PL = plots();
  for (const p of PL) {
    add('canteiro', p.x, p.z, { w: p.w, d: p.d, wet: p.wet || 0, crop: p.crop });
    block(p.x0 - 0.3, p.z0 - 0.3, p.x0 + p.w + 0.3, p.z0 + p.d + 0.3);
    const rows = 4, cols = 6;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const stage = p.order[Math.floor(i / 2)];
      const x = p.x0 + (i + 0.5) * (p.w / cols), z = p.z0 + (j + 0.5) * (p.d / rows);
      add('planta', x, z, { crop: p.crop, stage, r: Math.floor(r() * 4) * 90, s: 0.92 + r() * 0.16 });
    }
    add('plaquinha', p.x0 + p.w + 0.15 - (p.crop === 'cana' || p.crop === 'cafe' ? p.w + 0.3 : 0), p.z0 + p.d + 0.42, { crop: p.crop });
  }
  add('espantalho', 2.6, -2.9, { r: 35 });

  // ---- casa (frente para +X), pomar, galpão, silo ----
  add('casa', -14, 1, { r: 90 }); block(-17.2, -3.2, -8.4, 5.2);
  add('vasoGrande', -8.3, -0.6, {}); add('vasoGrande', -8.3, 2.6, {});
  add('galpao', 1, -15, {}); block(-3, -18.6, 5, -11);
  add('silo', 7.4, -16.2, {}); block(5.6, -18, 9.2, -14.4);
  add('trator', 6.6, -11.3, { r: 150 }); block(5.4, -13, 7.9, -9.6);
  add('fardo', -2.2, -10.4, { r: 10 }); add('fardo', -3.3, -10.5, { r: -6 }); add('fardo', -2.7, -10.45, { y: 0.5, r: 4 });
  add('saca', 3.9, -10.6, { r: 20 }); add('saca', 4.6, -10.8, { r: -30 }); add('lenha', -4.2, -13.6, { r: 90 });
  add('monteFeno', -5.2, -10.2, {});
  block(-6.4, -11.6, -1.5, -9.4);
  const pomar = [['laranjeira', -7.2, -6.4, 1], ['laranjeira', -11.2, -8.6, 2], ['laranjeira', -7.6, -12.2, 1], ['bananeira', -15.6, -6.4, 1], ['bananeira', -17.2, -8.2, 2], ['bananeira', -14.6, -9.4, 2], ['cajueiro', -12.6, -14.2, 1], ['laranjeira', -17.0, -13.0, 2]];
  for (const [k, x, z, v] of pomar) { add(k, x, z, { v, r: v * 70, s: 0.95 + (v % 2) * 0.1 }); block(x - 1.3, z - 1.3, x + 1.3, z + 1.3); }
  add('caixote', -8.9, -7.6, { fill: 'laranja', r: 20 }); add('caixote', -13.4, -7.8, { fill: 'banana', r: -15 });

  // ---- galinheiro com cercado de tela ----
  const G = { x0: 9.6, z0: -12.6, x1: 16.2, z1: -5.6 };
  add('galinheiro', 13.6, -10.4, {}); block(G.x0, G.z0, G.x1, G.z1);
  for (let x = G.x0; x < G.x1 - 0.1; x += 2.2) { add('telaSeg', x + 1.1, G.z0, { r: 0 }); if (!(x > 9 && x < 11.5)) add('telaSeg', x + 1.1, G.z1, { r: 0 }); }
  for (let z = G.z0; z < G.z1 - 0.1; z += (G.z1 - G.z0) / 3) { add('telaSeg', G.x0, z + (G.z1 - G.z0) / 6, { r: 90, len: (G.z1 - G.z0) / 3 }); add('telaSeg', G.x1, z + (G.z1 - G.z0) / 6, { r: 90, len: (G.z1 - G.z0) / 3 }); }
  const hens = [[11.0, -7.4, 'branca', 40, 0], [12.4, -6.8, 'marrom', 200, 1], [14.6, -7.2, 'caramelo', -60, 0], [10.6, -10.2, 'marrom', 120, 1], [15.2, -8.9, 'branca', -120, 1], [11.6, -8.8, 'caramelo', 10, 0], [12.9, -8.0, 'branca', 80, 1]];
  for (const [x, z, cor, rot, peck] of hens) add('galinha', x, z, { cor, peck, r: rot });
  add('galinha', 13.6, -10.4, { cor: 'galo', y: 3.04, r: 60, s: 1.15 });
  for (const [x, z] of [[12.0, -6.3], [12.5, -6.1], [11.7, -6.0], [14.2, -6.6]]) add('pintinho', x, z, { r: r() * 360 });
  add('comedouro', 13.2, -6.9, { r: 20 });

  // ---- curral com vacas ----
  const K = { x0: -18, z0: 8, x1: -6, z1: 18 };
  block(K.x0, K.z0, K.x1, K.z1);
  for (let x = K.x0; x < K.x1 - 0.1; x += 2) { if (!(x >= -9 && x < -7)) add('cercaSeg', x + 1, K.z0, { r: 0 }); add('cercaSeg', x + 1, K.z1, { r: 0 }); }
  for (let z = K.z0; z < K.z1 - 0.1; z += 2) { add('cercaSeg', K.x0, z + 1, { r: 90 }); add('cercaSeg', K.x1, z + 1, { r: 90 }); }
  add('vaca', -13.6, 11.4, { tipo: 'nelore', r: 55 });
  add('vaca', -9.4, 14.6, { tipo: 'malhada', graze: 1, r: -40 });
  add('vaca', -15.2, 15.6, { tipo: 'malhada', r: 120 });
  add('vaca', -10.6, 10.6, { tipo: 'nelore', graze: 1, r: 200 });
  add('cocho', -8.4, 16.6, { r: 0 });
  add('latao', -6.3, 7.3, {}); add('latao', -5.8, 7.6, {}); add('latao', -5.6, 7.1, {});
  add('monteFeno', -16.4, 9.6, { s: 0.9 });

  // ---- lagoa, banco, poço ----
  add('lagoa', 4.6, 13.4, { r: 180 }); block(-0.8, 9.6, 10.2, 17.4);
  add('pato', 3.4, 12.6, { y: 0.07, r: 100 }); add('pato', 5.6, 14.2, { y: 0.07, r: -30 });
  add('banco', -0.9, 10.6, { r: 60 });
  add('poco', 10.6, 6.6, {}); block(9.4, 5.4, 11.8, 7.8);
  add('carrinho', 8.4, 3.3, { r: 120 });
  add('caixote', 0.9, -4.4, { fill: 'milho', r: 12 }); add('caixote', 1.5, -4.9, { fill: 'milho', r: -20 });

  // ---- feira ----
  add('barraca', 13, -2.6, {}); block(10.4, -4.2, 15.6, -0.2);
  add('poste', 9.6, -1.2, { h: 3.3 }); add('poste', 16.4, -1.2, { h: 3.3 });
  add('bandeirinhas', 0, 0, { a: [9.6, 3.25, -1.2], b: [16.4, 3.25, -1.2] });
  add('poste', -8.6, -1.6, { h: 3.2 }); add('poste', -8.6, 3.6, { h: 3.2 });
  add('bandeirinhas', 0, 0, { a: [-8.6, 3.15, -1.6], b: [-8.6, 3.15, 3.6], off: 3 });

  // ---- cerca do terreno + porteira ----
  for (let t = -FARM; t < FARM - 0.1; t += 2) {
    add('cercaSeg', t + 1, -FARM, { r: 0 }); add('cercaSeg', t + 1, FARM, { r: 0 });
    add('cercaSeg', -FARM, t + 1, { r: 90 });
    if (!(t >= -1 && t < 3)) add('cercaSeg', FARM, t + 1, { r: 90 });
  }
  add('porteira', FARM, 1, { r: 90 });

  // ---- mata e enfeites fora/dentro da cerca ----
  const dentro = (x, z) => Math.abs(x) < FARM && Math.abs(z) < FARM;
  const livre = (x, z, m = 0.6) => {
    for (const [a, b2, c, d] of blocked) if (x > a - m && x < c + m && z > b2 - m && z < d + m) return false;
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) if (paths.has(Math.floor(x + dx * m) + ',' + Math.floor(z + dz * m))) return false;
    return true;
  };
  // mata: anel externo (denso nos cantos que aparecem na tela)
  const kinds = ['redonda', 'redonda', 'redonda', 'palmeira', 'ipeA', 'redonda', 'araucaria', 'ipeR'];
  let tries = 0, placed = [];
  while (placed.length < 96 && tries++ < 4000) {
    const x = r.range(-44, 44), z = r.range(-44, 44);
    if (Math.abs(x) < FARM + 2.2 && Math.abs(z) < FARM + 2.2) continue;
    if (z > -1.5 && z < 3.5 && x > FARM) continue; // estrada
    if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 3.0)) continue;
    placed.push([x, z]);
    const kind = kinds[Math.floor(r() * kinds.length)];
    add('arvore', x, z, { kind, v: 1 + Math.floor(r() * 2), r: Math.floor(r() * 4) * 90, s: 0.95 + r() * 0.5 });
  }
  // algumas árvores e arbustos dentro
  for (const [k, x, z, o] of [['arvore', -18.4, 6.4, { kind: 'ipeA', v: 1, s: 1.15 }], ['arvore', 17.8, 15.6, { kind: 'palmeira', v: 2, s: 1.1 }], ['arvore', 18.2, 8.2, { kind: 'redonda', v: 1, s: 1.0 }], ['arvore', 17.6, -16.8, { kind: 'ipeR', v: 1, s: 1.1 }], ['arvore', -4.6, 19.2, { kind: 'palmeira', v: 1, s: 1.0 }]]) { add(k, x, z, o); block(x - 1, z - 1, x + 1, z + 1); }
  let n = 0; tries = 0;
  while (n < 26 && tries++ < 2000) {
    const x = r.range(-FARM + 1, FARM - 1), z = r.range(-FARM + 1, FARM - 1);
    if (!livre(x, z, 1.0)) continue;
    const t = r();
    if (t < 0.5) add('arbusto', x, z, { v: 1 + Math.floor(r() * 3), r: Math.floor(r() * 4) * 90, s: 0.8 + r() * 0.5 });
    else add('pedra', x, z, { v: 1 + Math.floor(r() * 2), r: Math.floor(r() * 4) * 90, s: 0.8 + r() * 0.6 });
    block(x - 0.5, z - 0.5, x + 0.5, z + 0.5); n++;
  }
  // capim e flores (instanciados)
  n = 0; tries = 0;
  while (n < 420 && tries++ < 6000) {
    const x = r.range(-34, 34), z = r.range(-34, 34);
    if (dentro(x, z) && !livre(x, z, 0.35)) continue;
    const clump = fbm2(x * 0.18, z * 0.18, 9) > 0.48;
    if (!clump && r() < 0.6) continue;
    const t = r();
    if (t < 0.55) add('tufo', x, z, { r: r() * 360, s: 0.8 + r() * 0.7 });
    else add('flor', x, z, { cor: ['flowerA', 'flowerB', 'flowerC', 'clothYellow'][Math.floor(r() * 4)], r: r() * 360, s: 0.8 + r() * 0.6 });
    n++;
  }
  return { E, paths, blocked, plots: PL };
}

// máscara de vizinhança de uma célula de caminho: N(−z)=1, L(+x)=2, S(+z)=4, O(−x)=8
export function mascara(paths, x, z) {
  return (paths.has(x + ',' + (z - 1)) ? 1 : 0) | (paths.has(x + 1 + ',' + z) ? 2 : 0) | (paths.has(x + ',' + (z + 1)) ? 4 : 0) | (paths.has(x - 1 + ',' + z) ? 8 : 0);
}

// Onde ficam os três avatares em cada tomada.
export const AVATARES = {
  A: [
    { outfit: 'ana', anim: 'regar', t: 0.3, x: 3.3, z: 1.4, r: 8 },        // regando a mandioca
    { outfit: 'leo', anim: 'colher', t: 0.1, x: 6.35, z: 0.72, r: 172 },   // colhendo milho
    { outfit: 'bia', anim: 'andar', t: 0.14, x: -4.6, z: 0.9, r: 90 },     // caminhando da casa
  ],
  B: [
    { outfit: 'ana', anim: 'regar', t: 0.3, x: -4.35, z: 6.05, r: 172 },   // regando as mudas de café
    { outfit: 'leo', anim: 'colher', t: 0.1, x: -1.1, z: 6.1, r: 176 },    // colhendo café maduro
    { outfit: 'bia', anim: 'andar', t: 0.14, x: 1.4, z: 8.3, r: -90 },     // câmera atrás dela, rumo ao curral e à casa
  ],
};
