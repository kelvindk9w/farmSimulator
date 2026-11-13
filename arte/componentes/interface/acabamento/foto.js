// Tira as fotos do teste: tela e loja, em 844x390 (celular, densidade 2) e 1280x720 (computador, densidade 1).
const { chromium } = require('playwright');
(async () => {
  const T = '/home/user/farmSimulator/arte/componentes/interface/teste';
  const b = await chromium.launch();
  for (const [w, h, dpr] of [[844, 390, 2], [1280, 720, 1]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
    for (const nome of ['tela', 'loja']) {
      await p.goto('file://' + T + '/' + nome + '.html');
      await p.waitForLoadState('networkidle');
      await p.screenshot({ path: `${T}/${nome}-${w}x${h}.png` });
    }
    await p.close();
  }
  await b.close();
  console.log('fotos ok');
})();
