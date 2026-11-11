// Folhas do personagem (D) e folha de sprites em 8 direções (C1).
import { setPalette, C } from '../lib/palette.js';
import { resetMat } from '../lib/builder.js';
import { Estudio } from '../avatar/estudio.js';
import { POSES, ANIMS, quadro } from '../avatar/poses.js';
import { OUTFITS, BONES } from '../avatar/rig.js';

const K = '#4a2f1b';
export const CSS_FOLHA = `
body{margin:0;background:#f6efe2;font-family:Inter,'Liberation Sans',sans-serif;color:${K}}
.pg{padding:34px 40px 30px;box-sizing:border-box}
h1{font-size:40px;font-weight:900;margin:0 0 4px;letter-spacing:-.01em}
.sub{font-size:19px;font-weight:600;opacity:.78;margin:0 0 22px;max-width:1500px;line-height:1.35}
.cell{background:#fffaf0;border:2px solid #e3d5bb;border-radius:14px;overflow:hidden;position:relative}
.cell canvas{display:block}
.lbl{font-size:17px;font-weight:800}
.small{font-size:14.5px;font-weight:600;opacity:.75;line-height:1.3}
.hd{font-size:15px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.6;text-align:center}
.tag{display:inline-block;font-size:13.5px;font-weight:800;border-radius:999px;padding:3px 10px;border:2px solid ${K}}
.tag.r{background:#c9efd3}.tag.m{background:#ffd9a8}
.note{background:#fff;border:2px solid ${K};border-radius:14px;padding:14px 18px;font-size:16.5px;font-weight:600;line-height:1.42}
.note b{font-weight:900}
`;

function pagina(titulo, sub, w) {
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
  let st = document.getElementById('folha-css');
  if (!st) { st = document.createElement('style'); st.id = 'folha-css'; document.head.appendChild(st); }
  st.textContent = CSS_FOLHA;
  const pg = document.createElement('div');
  pg.className = 'pg'; pg.style.width = w + 'px';
  pg.innerHTML = `<h1>${titulo}</h1><p class="sub">${sub}</p>`;
  document.body.appendChild(pg);
  return pg;
}
const div = (cls, html = '', style = '') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; if (style) d.style.cssText = style; return d; };
const dpr = () => window.devicePixelRatio || 1;
// renderiza já na resolução física (css * dpr) e exibe no tamanho css
function fig(est, opt, cw, ch) {
  const k = dpr();
  const c = est.render({ ...opt, w: Math.round(cw * k), h: Math.round(ch * k), ppu: opt.ppu * k });
  c.style.width = cw + 'px'; c.style.height = ch + 'px';
  return c;
}

const VISTAS = [['Frente', 0], ['Diagonal', 45], ['Lado', 90], ['Costas', 180]];
const LISTA_POSES = [
  ['Parado', () => POSES.parado(0)],
  ['Andar', () => POSES.andar(0.14)],
  ['Correr', () => POSES.correr(0.14)],
  ['Pular', () => POSES.pular(0.56)],
  ['Agachar', () => POSES.agachado()],
  ['Sentar', () => POSES.sentado(), [{ type: 'banquinho' }]],
  ['Deitar', () => POSES.deitado(), [{ type: 'esteira' }]],
  ['Regar', () => POSES.regar(0.25)],
  ['Colher', () => POSES.colher(0.12)],
  ['Carregar caixa', () => POSES.carregar(0.14)],
];

// ---------- D1: poses x 4 vistas ----------
export function folhaPoses(o = {}) {
  setPalette('base'); resetMat();
  const W = 1920;
  const pg = pagina('Folha do personagem — poses em 4 vistas',
    'O mesmo modelo 3D (um esqueleto de 17 juntas) em todas as poses pedidas. Cada pose é só um conjunto de rotações das juntas; as 4 vistas saem de graça girando a câmera.', W);
  const est = new Estudio();
  const cw = 190, ch = 232, ppu = 93;
  const grid = div('', '', 'display:grid;grid-template-columns:1fr 1fr;gap:10px 34px');
  for (let col = 0; col < 2; col++) {
    const bloco = div('', '', `display:grid;grid-template-columns:118px repeat(4,${cw}px);gap:8px 8px;align-items:center`);
    bloco.appendChild(div(''));
    for (const [n] of VISTAS) bloco.appendChild(div('hd', n));
    for (let i = 0; i < 5; i++) {
      const [nome, fn, extras] = LISTA_POSES[col * 5 + i];
      bloco.appendChild(div('lbl', nome));
      for (const [, yaw] of VISTAS) {
        const c = div('cell');
        c.appendChild(fig(est, { outfit: o.outfit || 'ana', pose: fn(), yaw, ppu, extras: extras || [], chao: 0.88, elev: 12 }, cw, ch));
        bloco.appendChild(c);
      }
    }
    grid.appendChild(bloco);
  }
  pg.appendChild(grid);
  return { width: W, height: Math.ceil(pg.getBoundingClientRect().height) };
}

// ---------- D2: ciclos quadro a quadro ----------
export function folhaCiclos(o = {}) {
  setPalette('base'); resetMat();
  const W = 1920;
  const pg = pagina('Folha do personagem — animações quadro a quadro',
    'Quadros tirados das animações do esqueleto. Em 3D o jogo guarda só as rotações-chave (poucos KB) e interpola o resto; em 2D cada quadro abaixo teria de virar um desenho, em cada direção.', W);
  const est = new Estudio();
  const linhas = [
    ['Andar', 'andar', 90, 'lado', 'ana'], ['Andar', 'andar', 45, 'diagonal', 'ana'], ['Correr', 'correr', 90, 'lado', 'leo'],
    ['Pular', 'pular', 90, 'lado', 'bia'], ['Regar', 'regar', 60, 'diagonal', 'ana'], ['Colher', 'colher', 60, 'diagonal', 'leo'],
    ['Deitar', 'deitar', 90, 'lado', 'bia'],
  ];
  const cw = 208, ch = 226, ppu = 88;
  for (const [nome, anim, yaw, vista, outfit] of linhas) {
    const a = ANIMS[anim];
    const row = div('', '', `display:grid;grid-template-columns:150px repeat(8,${cw}px);gap:6px;align-items:center;margin-bottom:8px`);
    row.appendChild(div('', `<div class="lbl">${nome}</div><div class="small">${a.frames} quadros · ${vista}<br>${a.loop ? 'em ciclo' : 'toca uma vez'}</div>`));
    for (let i = 0; i < a.frames; i++) {
      const c = div('cell');
      const big = anim === 'deitar' || anim === 'pular';
      c.appendChild(fig(est, { outfit, pose: quadro(anim, i), yaw, ppu: big ? ppu * 0.86 : ppu, chao: 0.9, elev: 12 }, cw, ch));
      c.appendChild(div('small', String(i + 1), 'position:absolute;left:8px;top:5px;font-weight:800'));
      row.appendChild(c);
    }
    pg.appendChild(row);
  }
  return { width: W, height: Math.ceil(pg.getBoundingClientRect().height) };
}

// ---------- D3: visuais (cosméticos) no mesmo corpo ----------
export function folhaVisuais(o = {}) {
  setPalette('base'); resetMat();
  const W = 1920;
  const pg = pagina('Folha do personagem — um corpo, vários visuais',
    'Chapéu, cabelo, tom de pele, roupa e calçado são peças presas ao MESMO esqueleto. Um visual novo é uma peça pequena de geometria ou só uma troca de cor, e já funciona em todas as animações.', W);
  const est = new Estudio();
  const top = div('', '', 'display:grid;grid-template-columns:250px 250px 250px 1fr;gap:12px;margin-bottom:14px;align-items:stretch');
  const mk = (opt, cw, ch, label, small) => {
    const c = div('cell');
    c.appendChild(fig(est, opt, cw, ch));
    c.appendChild(div('', `<div class="lbl">${label}</div><div class="small">${small || ''}</div>`, 'padding:0 12px 10px;text-align:center'));
    return c;
  };
  top.appendChild(mk({ outfit: 'base', pose: POSES.parado(0), yaw: 20, ppu: 150, chao: 0.9 }, 246, 290, 'Corpo base', 'sem roupas nem cabelo'));
  top.appendChild(mk({ outfit: 'base', pose: POSES.parado(0), yaw: 20, ppu: 150, chao: 0.9, bones: true }, 246, 290, 'Esqueleto único', `${BONES.length - 1} juntas + raiz`));
  top.appendChild(mk({ outfit: 'base', pose: POSES.andar(0.14), yaw: 90, ppu: 150, chao: 0.9, bones: true }, 246, 290, 'As juntas giram', 'a malha acompanha'));
  top.appendChild(div('note', `
    <b>Como os cosméticos funcionam em 3D</b><br>
    • <b>Encaixes:</b> cabeça (cabelo, chapéu, lenço, capuz), tronco (camisa, jardineira, colete, capa, mochila, lenço de pescoço), pernas (calça ou bermuda), pés (bota, galocha, tênis) e mãos (ferramentas).<br>
    • <b>Só cor:</b> tom de pele, cor do cabelo e cor das roupas não ocupam espaço em disco: são cores por vértice trocadas na hora.<br>
    • <b>Peça nova:</b> um chapéu ou uma mochila são algumas dezenas a poucas centenas de triângulos (poucos KB), feitos uma vez.<br>
    • <b>Animações:</b> nenhuma é refeita. Os 6 visuais abaixo usam exatamente as mesmas 10 animações.<br>
    • <b>Em 2D:</b> cada visual exigiria redesenhar todos os quadros de todas as direções (ver README, Opção C).
    ${o.m ? `<div style="margin-top:10px;padding-top:10px;border-top:2px dashed #cdbb9c"><b>Medido neste protótipo:</b> a Ana tem ${o.m.tri} triângulos; malha + esqueleto pesam ${o.m.malha} KB e as 10 animações juntas, ${o.m.anim} KB (arquivo glTF otimizado e compactado). Os outros visuais pesam de ${o.m.min} a ${o.m.max} KB cada, e as animações não se repetem.</div>` : ''}`));
  pg.appendChild(top);
  const nomes = ['ana', 'leo', 'bia', 'junino', 'boiadeira', 'chuva'];
  const desc = {
    ana: 'chapéu de palha · coque · jardineira jeans · bota', leo: 'boné · cabelo curto · camiseta · bermuda · tênis', bia: 'lenço · tranças · jardineira rosa · galocha',
    junino: 'chapéu de palha · bigode · remendos · lenço', boiadeira: 'chapéu de couro · rabo de cavalo · colete · cinto', chuva: 'capa com capuz · cacheado · mochila · galocha',
  };
  const poses2 = [POSES.andar(0.14), POSES.colher(0.9), POSES.carregar(0.14), POSES.correr(0.14), POSES.regar(0.25), POSES.agachado()];
  const cw = 298, ch = 330;
  const r1 = div('', '', `display:grid;grid-template-columns:repeat(6,${cw}px);gap:10px;margin-bottom:10px`);
  nomes.forEach((n) => r1.appendChild(mk({ outfit: n, pose: POSES.parado(0), yaw: 18, ppu: 170, chao: 0.9 }, cw - 4, ch, OUTFITS[n].nome, desc[n])));
  pg.appendChild(r1);
  const r2 = div('', '', `display:grid;grid-template-columns:repeat(6,${cw}px);gap:10px`);
  nomes.forEach((n, i) => r2.appendChild(mk({ outfit: n, pose: poses2[i], yaw: i % 2 ? 130 : 55, ppu: 128, chao: 0.9 }, cw - 4, 250, ['Andando', 'Colhendo (de costas)', 'Carregando caixa', 'Correndo (de costas)', 'Regando', 'Agachado (de costas)'][i], 'mesma animação, outro visual')));
  pg.appendChild(r2);
  return { width: W, height: Math.ceil(pg.getBoundingClientRect().height) };
}

// ---------- C1: folha de sprites 8 direções x ciclo de caminhada ----------
export const DIRECOES = [
  // nome, seta, yaw no estúdio (0 = olhando para a câmera), espelho de (índice) ou null
  ['Sul (frente)', '↓', 0, null],
  ['Sudeste', '↘', 45, null],
  ['Leste (lado)', '→', 90, null],
  ['Nordeste', '↗', 135, null],
  ['Norte (costas)', '↑', 180, null],
  ['Noroeste', '↖', 225, 3],
  ['Oeste (lado)', '←', 270, 2],
  ['Sudoeste', '↙', 315, 1],
];
export function espelhar(c) {
  const o = document.createElement('canvas'); o.width = c.width; o.height = c.height;
  const x = o.getContext('2d'); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(c, 0, 0);
  o.style.width = c.style.width; o.style.height = c.style.height;
  return o;
}
export const ELEV_SPRITE = 35.264;

export function folhaSprites(o = {}) {
  setPalette('base'); resetMat();
  const W = 1920;
  const pg = pagina('Opção C — folha de sprites: 8 direções × 8 quadros de caminhada',
    'Cada célula é uma imagem pronta, pré-renderizada do modelo 3D com a câmera isométrica. Das 8 direções, 5 são renders de verdade e 3 são cópias espelhadas. Tamanho declarado: 128×128 px por quadro (256×256 px para telas de alta densidade).', W);
  const est = new Estudio({ light: 'sprite', shadow: false });
  const cs = 172, ppu = 172 / 2.5; // célula de 2,5 unidades de mundo
  const outfit = o.outfit || 'leo';
  const renders = {};
  const tabela = div('', '', `display:grid;grid-template-columns:292px repeat(8,${cs}px);gap:5px;align-items:center`);
  tabela.appendChild(div(''));
  for (let i = 0; i < 8; i++) tabela.appendChild(div('hd', 'Quadro ' + (i + 1)));
  DIRECOES.forEach(([nome, seta, yaw, mirrorOf], d) => {
    const esp = mirrorOf !== null;
    tabela.appendChild(div('', `<div class="lbl"><span style="display:inline-block;width:30px;font-size:24px">${seta}</span>${nome}</div>
      <div style="margin:5px 0 0 30px"><span class="tag ${esp ? 'm' : 'r'}">${esp ? 'ESPELHADO de ' + DIRECOES[mirrorOf][0].split(' ')[0] : 'RENDER de verdade'}</span></div>`));
    renders[d] = [];
    for (let i = 0; i < 8; i++) {
      let c;
      if (!esp) c = fig(est, { outfit, pose: quadro('andar', i), yaw, ppu, chao: 0.84, elev: ELEV_SPRITE }, cs, cs);
      else c = espelhar(renders[mirrorOf][i]);
      renders[d].push(c);
      const cell = div('cell', '', esp ? 'background:#fff1dd;border-color:#f0c48a' : 'background:#f1fbf3;border-color:#a9dcb6');
      // sombra "de bolha" desenhada em 2D (como um jogo de sprites faria)
      const sh = div('', '', `position:absolute;left:50%;top:84%;width:${cs * 0.34}px;height:${cs * 0.34 * 0.58}px;transform:translate(-50%,-50%);border-radius:50%;background:rgba(40,30,60,.2)`);
      cell.appendChild(sh);
      c.style.position = 'relative';
      cell.appendChild(c);
      tabela.appendChild(cell);
    }
  });
  pg.appendChild(tabela);
  // demonstração do limite do espelhamento
  const k = dpr();
  const demo = div('', '', 'display:grid;grid-template-columns:210px 210px 210px 1fr;gap:12px;margin-top:18px;align-items:stretch');
  const dm = (canvas, label, small, bad) => { const c = div('cell', '', bad ? 'background:#ffe9e4;border-color:#eda292' : ''); c.appendChild(canvas); c.appendChild(div('', `<div class="lbl">${label}</div><div class="small">${small}</div>`, 'padding:0 10px 10px;text-align:center')); return c; };
  const opt = { outfit, pose: POSES.regar(0.25), ppu: 80, chao: 0.86, elev: ELEV_SPRITE };
  const leste = fig(est, { ...opt, yaw: 60 }, 206, 200);
  const oesteCerto = fig(est, { ...opt, yaw: 300 }, 206, 200);
  demo.appendChild(dm(leste, 'Regando para a direita', 'render de verdade', false));
  demo.appendChild(dm(espelhar(leste), 'Esquerda por espelho', 'o regador troca de mão', true));
  demo.appendChild(dm(oesteCerto, 'Esquerda renderizada', 'correto, mas é 1 sprite a mais', false));
  demo.appendChild(div('note', `
    <b>O que esta folha mostra</b><br>
    • Só a caminhada, de um visual: 8 × 8 = <b>64 quadros</b> (40 renderizados + 24 espelhados).<br>
    • O espelhamento economiza 37,5% das imagens, mas <b>inverte tudo que é assimétrico</b>: ferramenta na mão, bolsa a tiracolo, franja de lado, estampa.<br>
    • Para o espelho não trocar o lado da luz, os sprites do personagem usam luz vinda da frente e sombra em elipse; o personagem fica um pouco mais "chapado" que no 3D.<br>
    • O conjunto completo (10 animações, 68 quadros por direção) e o peso em PNG estão medidos no README.`));
  pg.appendChild(demo);
  return { width: W, height: Math.ceil(pg.getBoundingClientRect().height) };
}
