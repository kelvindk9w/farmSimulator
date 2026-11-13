// MONTAGEM (não é o jogo rodando): fotografa o jogo no conjunto "contorno" sem a personagem 3D e cola por cima a figura 2D do Codex.
// Uso: node montagem.mjs <pasta de saída>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { abrirNavegador, abrirPagina } from '/home/user/farmSimulator/prototypes/sitio-minimo/tools/comum.mjs';
const sharp = createRequire('/home/user/farmSimulator/prototypes/sitio-minimo/package.json')('sharp');
const S = process.argv[2];
const TELA = { width: 1672, height: 941, deviceScaleFactor: 2 };
const amb = await abrirNavegador();
let com, sem, pe, info;
try {
  const { pagina, erros } = await abrirPagina(amb, 'passo,sem-hud,tudo,arte-contorno', TELA);
  const ler = () => pagina.evaluate(() => { const s = window.__sitio; return { info: s.info(), obj: s.objetos() }; });
  const andar = (n) => pagina.evaluate((k) => { const s = window.__sitio; s.avancarAte(s.info().passo + k); }, n);
  const ate = async (nome, cond, max = 60 * 90) => { for (let n = 0; n <= max; n += 20) { const e = await ler(); if (cond(e)) return e; await andar(20); } throw new Error('não chegou a: ' + nome); };
  const tocar = (id) => pagina.evaluate((i) => window.__sitio.tocar(i), id);
  const livre = (e) => e.info.estado === 'parado';
  await tocar('canteiro1'); await andar(20); await ate('c1', (e) => e.obj.canteiro1.estado === 'semeado' && livre(e));
  await tocar('poco'); await andar(20); await ate('agua', (e) => e.info.contadores.agua === 3 && livre(e));
  await tocar('canteiro2'); await andar(20); await ate('c2', (e) => e.obj.canteiro2.estado === 'semeado' && livre(e));
  await tocar('canteiro2'); await andar(20); await ate('regado', (e) => e.info.contadores['canteiro2.molhado'] === true && livre(e));
  await ate('pronto', (e) => e.obj.canteiro2.estado === 'pronto' && e.info.contadores['ninho.ovos'] > 0 && livre(e));
  await andar(120);
  com = await pagina.screenshot();
  info = await pagina.evaluate(() => {
    const s = window.__sitio, [x, z] = s.posicao('personagem');
    const v = s.visual('personagem');
    const chaves = Object.keys(v).slice(0, 30);
    // esconde a personagem 3D (o primeiro Object3D que o visual guardar)
    let raiz = null; for (const k of Object.keys(v)) { const o = v[k]; if (o && o.isObject3D) { raiz = o; break; } }
    if (raiz) raiz.visible = false;
    s.estatisticas(); // redesenha
    return { pe: s.telaDoChao(x, z), eixoX: s.telaDoChao(x + 1, z), eixoZ: s.telaDoChao(x, z + 1), escala: s.info().escala, chaves, escondeu: !!raiz };
  });
  sem = await pagina.screenshot();
  console.log(JSON.stringify(info), 'erros:', erros.length);
} finally { await amb.fechar(); }
fs.writeFileSync(`${S}/jogo-com-3d.png`, com); fs.writeFileSync(`${S}/jogo-sem-personagem.png`, sem);
// onde estava a personagem 3D: a diferença entre as duas fotos
const a = await sharp(com).raw().toBuffer({ resolveWithObject: true }), b = await sharp(sem).raw().toBuffer();
const W = a.info.width, H = a.info.height, C = a.info.channels; let x0 = W, x1 = 0, y0 = H, y1 = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * C; if (Math.abs(a.data[i] - b[i]) + Math.abs(a.data[i + 1] - b[i + 1]) + Math.abs(a.data[i + 2] - b[i + 2]) > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
console.log('personagem 3D na foto: x', x0, x1, 'y', y0, y1, 'altura', y1 - y0);
fs.writeFileSync(`${S}/medida.json`, JSON.stringify({ caixa: [x0, y0, x1, y1], pe: info.pe, eixoX: info.eixoX, eixoZ: info.eixoZ, escala: info.escala, W, H }));
