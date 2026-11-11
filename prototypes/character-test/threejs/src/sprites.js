// Leitura tolerante do sprites.json do pacote 2D.
// O contrato diz O QUE o arquivo traz, mas não os nomes das chaves; por isso aceitamos alguns
// sinônimos (inglês/português) e, no que faltar, caímos nos valores do contrato (config "sprites").

const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

function pick(obj, ...names) {
  if (!obj || typeof obj !== 'object') return undefined;
  const keys = Object.keys(obj);
  for (const n of names) { const k = keys.find((kk) => norm(kk) === norm(n)); if (k !== undefined) return obj[k]; }
  return undefined;
}
function par(v, a, b, c, d) { // número, [x, y] ou objeto -> [x, y]
  if (typeof v === 'number') return [v, v];
  if (Array.isArray(v) && v.length >= 2) return [+v[0], +v[1]];
  if (v && typeof v === 'object') { const x = pick(v, a, b, 'x', 'w'), y = pick(v, c, d, 'y', 'h'); if (x !== undefined && y !== undefined) return [+x, +y]; }
  return null;
}
const DIR_ALIAS = {
  s: 'S', sul: 'S', south: 'S', frente: 'S', se: 'SE', sudeste: 'SE', southeast: 'SE', e: 'E', l: 'E', leste: 'E', east: 'E', perfil: 'E',
  ne: 'NE', nordeste: 'NE', northeast: 'NE', n: 'N', norte: 'N', north: 'N', costas: 'N',
  sw: 'SW', so: 'SW', sudoeste: 'SW', w: 'W', o: 'W', oeste: 'W', west: 'W', nw: 'NW', no: 'NW', noroeste: 'NW',
};
export const MIRROR = { SW: 'SE', W: 'E', NW: 'NE', SE: 'SW', E: 'W', NE: 'NW' };

export function normalizeSpriteMeta(raw, sp, animCfg) {
  const avisos = [];
  const cell = par(pick(raw, 'cell', 'cellSize', 'celula', 'tamanhoDaCelula', 'tamanhoCelula', 'frameSize', 'quadro'), 'width', 'largura', 'height', 'altura') || (avisos.push('tamanho da célula'), sp.cell);
  const anchor = par(pick(raw, 'anchor', 'ancora', 'pontoDeApoio', 'apoio', 'pivot', 'origin', 'origem'), 'x', 'x', 'y', 'y') || (avisos.push('ponto de apoio'), sp.anchor);
  let dirs = pick(raw, 'directions', 'direcoes', 'ordemDasDirecoes', 'dirs', 'rows', 'linhas');
  if (Array.isArray(dirs)) dirs = dirs.map((d) => DIR_ALIAS[norm(typeof d === 'object' ? pick(d, 'name', 'nome', 'id') : d)]).filter(Boolean);
  if (!Array.isArray(dirs) || !dirs.length) { avisos.push('ordem das direções'); dirs = sp.directions; }
  const ppu = +pick(raw, 'pixelsPerUnit', 'pixelsPorUnidade') || sp.pixelsPerUnit;

  let anims = pick(raw, 'animations', 'animacoes', 'anims');
  if (Array.isArray(anims)) anims = Object.fromEntries(anims.map((a) => [pick(a, 'name', 'nome', 'id'), a]));
  const animations = {};
  for (const name of Object.keys(animCfg)) {
    const a = pick(anims, name) || {};
    if (!pick(anims, name)) avisos.push(`animação "${name}"`);
    const d = sp.defaults[name] || {};
    const loop = pick(a, 'loop', 'repete', 'repetir', 'repeat', 'ciclo');
    animations[name] = {
      file: pick(a, 'file', 'arquivo', 'image', 'imagem', 'src') || `sprites/${name}.png`,
      frames: +pick(a, 'frames', 'quadros', 'frameCount', 'numeroDeQuadros', 'count') || null, // null = deduz da largura da imagem
      fps: +pick(a, 'fps', 'quadrosPorSegundo', 'frameRate', 'fpsSugerido') || d.fps || 8,
      loop: typeof loop === 'boolean' ? loop : animCfg[name].loop,
    };
  }
  if (avisos.length) console.warn('[bancada] sprites.json sem ' + avisos.join(', ') + ': usando os valores do contrato');
  return { cell, anchor, directions: dirs, pixelsPerUnit: ppu, animations };
}

// direção de tela (N, NE, ...) -> linha da folha + espelhar?
export function rowFor(meta, dirName) {
  let row = meta.directions.indexOf(dirName);
  if (row >= 0) return { row, flip: false };
  row = meta.directions.indexOf(MIRROR[dirName]);
  if (row >= 0) return { row, flip: true };
  return { row: 0, flip: false };
}

// quadro da animação no instante t (segundos desde que ela começou)
export function frameAt(a, t) {
  const i = Math.floor(t * a.fps + 1e-6);
  return a.loop ? ((i % a.frames) + a.frames) % a.frames : Math.min(a.frames - 1, Math.max(0, i));
}
