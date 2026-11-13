// Monta as imagens do teste: (1) hoje no jogo x montagem com a figura do Codex; (2) GIF da figura andando sobre a foto do jogo;
// (3) folha com o que o Codex entregou. São MONTAGENS sobre fotos do jogo, não o jogo rodando.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const sharp = createRequire('/home/user/farmSimulator/prototypes/sitio-minimo/package.json')('sharp');
const S = process.argv[2], OUT = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });
const med = JSON.parse(fs.readFileSync(`${S}/medida.json`, 'utf8'));
const D = 2; // pixels do aparelho por ponto
const ALT = 178 * D; // altura da figura na tela, em pixels do aparelho
const texto = (w, h, t, tam = 38, cor = '#3a2a1a') => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><text x="${w / 2}" y="${h / 2 + tam * 0.35}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="${tam}" font-weight="700" fill="${cor}">${t}</text></svg>`);

// apara uma figura, devolve o buffer na altura pedida e o ponto de apoio (entre os pés)
async function figura(arq, altura, espelhar = false) {
  const ap = await (espelhar ? sharp(arq).flop() : sharp(arq)).trim({ threshold: 1 }).png().toBuffer();
  const m = await sharp(ap).metadata(), k = altura / m.height;
  const buf = await sharp(ap).resize(Math.round(m.width * k), altura).png().toBuffer();
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let sx = 0, n = 0; // centro dos pés: o oitavo de baixo
  for (let y = Math.round(info.height * 0.88); y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 40) { sx += x; n++; }
  return { buf, w: info.width, h: info.height, px: Math.round(sx / n), py: Math.round(info.height * 0.965) };
}
const sombra = (w, h) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}" fill="#35520c" fill-opacity="0.42"/></svg>`);
// cola a figura numa foto com os pés em (x, y), em pixels do aparelho
const colar = (fig, x, y) => [
  { input: sombra(Math.round(fig.h * 0.42), Math.round(fig.h * 0.13)), left: Math.round(x - fig.h * 0.21), top: Math.round(y - fig.h * 0.065) },
  { input: fig.buf, left: Math.round(x - fig.px), top: Math.round(y - fig.py) },
];

const sem = `${S}/jogo-sem-personagem.png`, com = `${S}/jogo-com-3d.png`;
const frente = await figura('/root/arte-codex/sprite-01/personagem-frente.png', ALT);
const px = med.pe[0] * D, py = med.pe[1] * D;
const montada = await sharp(sem).composite(colar(frente, px, py)).png().toBuffer();
fs.writeFileSync(`${S}/montada.png`, montada);

// (1) lado a lado: em cima a cena inteira, embaixo de perto
{
  const W = 1672, F = 80, V = 24;
  const perto = { left: Math.round(px - 760), top: Math.round(py - 640), width: 1520, height: 860 };
  const HC = Math.round(941), HP = Math.round((860 / 1520) * W);
  const pecas = [];
  const cols = [[com, 'Hoje no jogo: personagem 3D do conjunto "contorno"'], [montada, 'Montagem: a figura do Codex colada na foto do jogo']];
  let x = 0;
  for (const [img, rot] of cols) {
    pecas.push({ input: texto(W, F, rot), left: x, top: 0 });
    pecas.push({ input: await sharp(img).resize(W, HC).png().toBuffer(), left: x, top: F });
    pecas.push({ input: await sharp(img).extract(perto).resize(W, HP).png().toBuffer(), left: x, top: F + HC + V });
    x += W + V;
  }
  await sharp({ create: { width: x - V, height: F + HC + V + HP, channels: 3, background: '#fff8ec' } }).composite(pecas).jpeg({ quality: 88 }).toFile(`${OUT}/personagem-no-jogo.jpg`);
}

// (2) GIF: a figura andando sobre a foto do jogo (2 ciclos de 6 quadros)
{
  const q = []; for (let i = 1; i <= 6; i++) q.push(await figura(`${S}/andando/quadro-${i}.png`, ALT, true)); // espelhada: anda para a direita de quem olha
  const rec = { left: 430 * D, top: 180 * D, width: 620 * D, height: 440 * D };
  const fundo = await sharp(sem).extract(rec).png().toBuffer();
  const N = 12, ini = [640, 385], passo = [14, 8.1]; // da porta do celeiro para o meio do terreiro, por um trecho sem nada na frente
  const LW = 930, LH = Math.round((rec.height / rec.width) * LW), FA = 44;
  const quadros = [];
  for (let i = 0; i < N; i++) {
    const x = (ini[0] + passo[0] * i) * D - rec.left, y = (ini[1] + passo[1] * i) * D - rec.top;
    const cena = await sharp(fundo).composite(colar(q[i % 6], x, y)).resize(LW, LH).png().toBuffer();
    quadros.push(await sharp({ create: { width: LW, height: LH + FA, channels: 3, background: '#fff8ec' } }).composite([{ input: cena, left: 0, top: 0 }, { input: texto(LW, FA, 'Montagem: figura 2D do Codex andando sobre a foto do jogo', 24), left: 0, top: LH }]).png().toBuffer());
  }
  await sharp(quadros, { join: { animated: true } }).gif({ delay: new Array(N).fill(110), loop: 0, effort: 8 }).toFile(`${OUT}/personagem-andando.gif`);
  const tira = []; for (const [k, i] of [0, 4, 8, 11].entries()) tira.push({ input: await sharp(quadros[i]).resize(620).png().toBuffer(), left: k * 630, top: 0 });
  const mh = Math.round(((LH + FA) / LW) * 620);
  await sharp({ create: { width: 630 * 4 - 10, height: mh, channels: 3, background: '#ffffff' } }).composite(tira).jpeg({ quality: 85 }).toFile(`${S}/andando-tira.jpg`);
}

// (3) o que o Codex entregou: frente, costas e os seis quadros
{
  const A = 520, M = 30, itens = [];
  for (const f of ['/root/arte-codex/sprite-01/personagem-frente.png', '/root/arte-codex/sprite-01/personagem-costas.png']) itens.push(await figura(f, A));
  for (let i = 1; i <= 6; i++) itens.push(await figura(`${S}/andando/quadro-${i}.png`, A));
  const F = 70; let x = M; const pecas = [];
  itens.forEach((it, i) => { pecas.push({ input: it.buf, left: x, top: F + M }); x += it.w + M + (i === 1 ? 50 : 0); });
  const larg = x;
  const w01 = itens[0].w + itens[1].w + M;
  pecas.push({ input: texto(w01, F, 'Parada: frente e costas', 30), left: M, top: 6 });
  pecas.push({ input: texto(larg - w01 - 3 * M - 50, F, 'Andando: os seis quadros, na ordem', 30), left: M + w01 + M + 50, top: 6 });
  await sharp({ create: { width: larg, height: F + A + 2 * M, channels: 3, background: '#e9e4d8' } }).composite(pecas).jpeg({ quality: 88 }).toFile(`${OUT}/personagem-do-codex.jpg`);
}
for (const f of fs.readdirSync(OUT)) console.log(f, (fs.statSync(`${OUT}/${f}`).size / 1e6).toFixed(2), 'MB');
