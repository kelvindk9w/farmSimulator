// Mede o que dá para medir nesta máquina. Uso: npm run medir  (depois de npm run build)
//   - tamanho do que o navegador baixa (pasta dist/): bruto, gzip e brotli;
//   - chamadas de desenho e triângulos da cena inteira, com cada conjunto de arte: no começo e o pico durante a demonstração.
// Não mede quadros por segundo: aqui o WebGL roda em software e o número não diria nada sobre um celular.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { abrirNavegador, abrirPagina, TELAS, dist } from './comum.mjs';

const kb = (n) => (n / 1024).toFixed(1).padStart(7) + ' KB';
console.log('Download (pasta dist/)');
let tot = [0, 0, 0];
for (const nome of fs.readdirSync(dist).sort().filter((n) => fs.statSync(path.join(dist, n)).isFile())) { // as imagens-alvo de dist/alvos/ ficam de fora: só baixam a pedido
  const buf = fs.readFileSync(path.join(dist, nome));
  const g = zlib.gzipSync(buf, { level: 9 }).length, b = zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length;
  tot = [tot[0] + buf.length, tot[1] + g, tot[2] + b];
  console.log(`  ${nome.padEnd(12)} bruto ${kb(buf.length)}   gzip ${kb(g)}   brotli ${kb(b)}`);
}
console.log(`  ${'total'.padEnd(12)} bruto ${kb(tot[0])}   gzip ${kb(tot[1])}   brotli ${kb(tot[2])}`);

const amb = await abrirNavegador();
try {
  console.log('\nDesenho da cena inteira (tela 1280 x 720, enquadramento "tudo")');
  for (const c of ['codigo', 'molde', 'brinquedo', 'lowpoly', 'contorno', 'figuras', 'pintado', ...(process.env.CONJUNTOS_EXTRA || '').split(',').filter(Boolean)]) {
    const { pagina, contexto } = await abrirPagina(amb, `passo,demo,tudo,arte-${c}`, TELAS.paisagem);
    const r = await pagina.evaluate(() => {
      const S = window.__sitio, ini = S.estatisticas();
      // ler um pixel obriga o desenho a terminar antes de seguir: sem isso os quadros se acumulam na fila do WebGL em
      // software e a página seguinte demora mais que o limite para abrir
      const gl = S.cena.renderer.getContext(), px = new Uint8Array(4);
      let pico = { ...ini }, em = 0, picoTri = { ...ini }, emTri = 0;
      for (let n = 10; n <= 1800; n += 10) {
        S.avancarAte(n);
        const e = S.estatisticas();
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        if (e.chamadas > pico.chamadas) { pico = e; em = n; }
        if (e.triangulos > picoTri.triangulos) { picoTri = e; emTri = n; }
      }
      return { ini, pico, em, picoTri, emTri };
    });
    const sombra = (e) => (e.naSombra ? ` (${e.triangulos - e.naSombra} da cena + ${e.naSombra} da passada do mapa de sombra)` : '');
    console.log(`  conjunto "${c}":  no começo ${r.ini.chamadas} chamadas de desenho e ${r.ini.triangulos} triângulos${sombra(r.ini)};  pico na demonstração: ${r.pico.chamadas} chamadas (aos ${(r.em / 60).toFixed(1)} s) e ${r.picoTri.triangulos} triângulos${sombra(r.picoTri)} (aos ${(r.emTri / 60).toFixed(1)} s)`);
    await contexto.close();
  }
  // um celular com 3 pixels por ponto, para ver o limite de 2 funcionando
  const { pagina, contexto } = await abrirPagina(amb, 'passo', { ...TELAS.celularRetrato, deviceScaleFactor: 3 });
  const px = await pagina.evaluate(() => { const c = document.getElementById('tela'); return { w: c.width, h: c.height, css: [innerWidth, innerHeight], dpr: devicePixelRatio }; });
  console.log(`\nTela de celular em pé ${px.css.join(' x ')} com ${px.dpr} pixels por ponto: a tela de desenho tem ${px.w} x ${px.h} pixels (limite de 2 pixels por ponto).`);
  await contexto.close();
} finally { await amb.fechar(); }
