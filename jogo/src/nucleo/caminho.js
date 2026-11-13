// Caminho da personagem: A* na malha do local (8 vizinhos, sem cortar quina), depois alisado em trechos retos.
// O movimento é contínuo: a rota é uma lista de pontos [x, z] no chão, e quem anda segue de ponto em ponto.

const RAIO = 0.22; // folga do corpo da personagem para o lado
const R2 = Math.SQRT2;
const DX = [1, -1, 0, 0, 1, 1, -1, -1], DZ = [0, 0, 1, -1, 1, -1, 1, -1];

// memória reaproveitada entre buscas (uma busca não aloca por casa)
let cap = 0, G = null, VEIO = null, VEZ = null, FECHADO = null, vez = 0;
const HEAP = [], HEAPF = [];

function preparar(n) {
  if (n > cap) { cap = n; G = new Float32Array(n); VEIO = new Int32Array(n); VEZ = new Int32Array(n); FECHADO = new Int32Array(n); vez = 0; }
  vez++;
  HEAP.length = 0; HEAPF.length = 0;
}
function por(i, f) {
  let k = HEAP.length;
  HEAP.push(i); HEAPF.push(f);
  while (k > 0) {
    const pai = (k - 1) >> 1;
    if (HEAPF[pai] <= f) break;
    HEAP[k] = HEAP[pai]; HEAPF[k] = HEAPF[pai]; k = pai;
  }
  HEAP[k] = i; HEAPF[k] = f;
}
function tirar() {
  const topo = HEAP[0], ui = HEAP.pop(), uf = HEAPF.pop(), n = HEAP.length;
  if (n > 0) {
    let k = 0;
    for (;;) {
      let c = 2 * k + 1;
      if (c >= n) break;
      if (c + 1 < n && HEAPF[c + 1] < HEAPF[c]) c++;
      if (HEAPF[c] >= uf) break;
      HEAP[k] = HEAP[c]; HEAPF[k] = HEAPF[c]; k = c;
    }
    HEAP[k] = ui; HEAPF[k] = uf;
  }
  return topo;
}

// o corpo cabe no ponto (x, z)?
export function cabe(local, x, z) {
  return local.andavel(Math.floor(x - RAIO), Math.floor(z - RAIO)) && local.andavel(Math.floor(x + RAIO), Math.floor(z - RAIO))
    && local.andavel(Math.floor(x - RAIO), Math.floor(z + RAIO)) && local.andavel(Math.floor(x + RAIO), Math.floor(z + RAIO));
}

// dá para ir em linha reta de A até B sem esbarrar?
export function visivel(local, ax, az, bx, bz) {
  const d = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(d / 0.2));
  for (let k = 1; k <= n; k++) {
    const t = k / n;
    if (!cabe(local, ax + (bx - ax) * t, az + (bz - az) * t)) return false;
  }
  return true;
}

// Menor caminho de (x0, z0) até (x1, z1): lista de pontos [x, z] (sem o começo, com o fim), ou null se não há caminho.
export function acharCaminho(local, x0, z0, x1, z1) {
  const L = local.l;
  const ax = Math.floor(x0), az = Math.floor(z0), bx = Math.floor(x1), bz = Math.floor(z1);
  if (!local.andavel(bx, bz)) return null;
  if ((ax === bx && az === bz) || visivel(local, x0, z0, x1, z1)) return [[x1, z1]];
  if (!local.dentro(ax, az)) return null;
  preparar(L * local.p);
  const ini = az * L + ax, fim = bz * L + bx;
  G[ini] = 0; VEIO[ini] = -1; VEZ[ini] = vez;
  por(ini, 0);
  let achou = false;
  while (HEAP.length) {
    const u = tirar();
    if (FECHADO[u] === vez) continue;
    FECHADO[u] = vez;
    if (u === fim) { achou = true; break; }
    const ux = u % L, uz = (u - ux) / L, gu = G[u];
    for (let d = 0; d < 8; d++) {
      const vx = ux + DX[d], vz = uz + DZ[d];
      if (!local.andavel(vx, vz)) continue;
      if (d >= 4 && (!local.andavel(ux + DX[d], uz) || !local.andavel(ux, uz + DZ[d]))) continue; // não corta quina
      const v = vz * L + vx;
      if (FECHADO[v] === vez) continue;
      const g = gu + (d >= 4 ? R2 : 1);
      if (VEZ[v] === vez && G[v] <= g) continue;
      G[v] = g; VEIO[v] = u; VEZ[v] = vez;
      const hx = Math.abs(vx - bx), hz = Math.abs(vz - bz);
      por(v, g + (hx + hz) + (R2 - 2) * Math.min(hx, hz));
    }
  }
  if (!achou) return null;
  // centros das casas do caminho, do começo ao fim; o último ponto é o destino exato
  const pts = [];
  for (let u = fim; u !== ini; u = VEIO[u]) { const ux = u % L; pts.push([ux + 0.5, (u - ux) / L + 0.5]); }
  pts.reverse();
  pts[pts.length - 1] = [x1, z1];
  // alisa: de cada ponto, vai direto ao mais distante que dá para ver
  const rota = [];
  let px = x0, pz = z0, i = 0;
  while (i < pts.length) {
    let j = pts.length - 1;
    while (j > i && !visivel(local, px, pz, pts[j][0], pts[j][1])) j--;
    rota.push(pts[j]);
    px = pts[j][0]; pz = pts[j][1];
    i = j + 1;
  }
  return rota;
}

export function comprimento(x0, z0, rota, de = 0) {
  let s = 0, x = x0, z = z0;
  for (let k = de; k < rota.length; k++) { s += Math.hypot(rota[k][0] - x, rota[k][1] - z); x = rota[k][0]; z = rota[k][1]; }
  return s;
}
