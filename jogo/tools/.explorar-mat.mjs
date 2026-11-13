// (exploração temporária: apagar depois)
import path from 'node:path';
import { servir, abrirNavegador, esperar, pastaDist } from './comum.mjs';
const SAIDA = process.env.SAIDA;
const srv = await servir(pastaDist), nav = await abrirNavegador();
for (const [w, h] of [[844, 390], [1280, 720]]) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, hasTouch: w < 900, isMobile: w < 900 });
  const pg = await ctx.newPage();
  const erros = []; pg.on('pageerror', (e) => erros.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  await pg.goto(srv.url + '#teste');
  await pg.waitForFunction(() => window.__jogo && window.__jogo.pronto !== undefined, null, { timeout: 20000 });
  await pg.evaluate(() => window.__jogo.baixarArte()); await pg.waitForFunction(() => window.__jogo.arteBaixada(), null, { timeout: 20000 });
  await pg.evaluate(() => { const m = window.__jogo.mundo; m.posses.ouro = 3000; m.progresso.nivel = 5; m.progresso.xp = m.dados.niveis.limiar[5] + 10; m.eventos.emitir('usouAtalhoDeTeste', { nivel: 5 }); Object.assign(m.posses.bolsa, { tabua: 2, prego: 3, fibra: 1 }); window.__jogo.abrirPainel('construir', { categoria: 'abrigo' }); window.__jogo.desenhar(); });
  await esperar(600);
  await pg.screenshot({ path: path.join(SAIDA, `exp-${w}-construir.jpg`), type: 'jpeg', quality: 84 });
  await pg.evaluate(() => { window.__jogo.abrirPainel('construir', { id: 'reforma:caixote-de-venda' }); window.__jogo.desenhar(); });
  await esperar(500);
  await pg.screenshot({ path: path.join(SAIDA, `exp-${w}-reforma.jpg`), type: 'jpeg', quality: 84 });
  console.log(w, erros);
  await ctx.close();
}
await nav.close(); await srv.fechar();
