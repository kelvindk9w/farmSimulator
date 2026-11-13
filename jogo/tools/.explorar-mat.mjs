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
  const foto = async (n) => { await esperar(450); await pg.screenshot({ path: path.join(SAIDA, `exp-${w}-${n}.jpg`), type: 'jpeg', quality: 84 }); };
  await pg.evaluate(() => { const j = window.__jogo; j.comando({ tipo: 'atalhoDeTeste', nivel: 4 }); j.fecharSubida(); const m = j.mundo; m.progresso.nivel = 5; m.progresso.xp = m.dados.niveis.limiar[5] + 10;
    const p = m.personagem; let ok = false; for (let r = 3; r < 14 && !ok; r++) for (let dz = -r; dz <= r && !ok; dz++) for (let dx = -r; dx <= r && !ok; dx++) { const x = Math.floor(p.x) + dx, z = Math.floor(p.z) + dz; ok = j.comando({ tipo: 'construir', id: 'bancada-de-carpintaria', x, z, jaJa: true, quieto: true }).ok; }
    j.pular(600); j.avancar(0.5); window.__bancada = ok; for (const k in m.posses.bolsa) delete m.posses.bolsa[k]; Object.assign(m.posses.bolsa, { tabua: 2, prego: 3, fibra: 1, madeira: 1 }); m.posses.ferramentas['machado-velho'] = { onde: 'cinto', agua: 0, usos: 0, vez: 0 }; m.posses.ouro = 3000; j.abrirPainel('construir', { categoria: 'abrigo' }); j.desenhar(); });
  await foto('custo');
  await pg.evaluate(() => { document.querySelector('[data-k="onde-galinheiro"]').click(); });
  await foto('cartao');
  await pg.evaluate(() => { document.querySelector('[data-k="chip-tabua"]').click(); });
  await foto('cartao-tabua');
  await pg.evaluate(() => { document.querySelector('[data-k="chip-prego"]').click(); });
  await foto('cartao-prego');
  // madeira: Mostrar
  await pg.evaluate(() => { const j = window.__jogo; j.fecharSubida(); j.fecharPainel(); });
  await pg.evaluate(() => { const j = window.__jogo; const D = j.mundo; });
  await pg.evaluate(() => { const j = window.__jogo; j.abrirPainel('construir', { categoria: 'util' }); });
  await foto('util');
  await pg.evaluate(() => { const j = window.__jogo; j.fecharPainel(); j.mundo.eventos.emitir('faltou', { motivo: 'falta-material', dados: { item: 'pedra', precisa: 8, tem: 0, falta: 8 } }); j.desenhar(); });
  await foto('tonho');
  await pg.evaluate(() => { const j = window.__jogo; j.mundo.eventos.emitir('subiuDeNivel', { nivel: 7, recompensa: { ouro: 110, itens: { tabua: 5, prego: 10 } }, liberou: [] }); j.desenhar(); });
  await esperar(2600); await foto('nivel');
  await pg.evaluate(() => { const j = window.__jogo; j.fecharSubida(); });
  await esperar(7000);
  await pg.evaluate(() => { const j = window.__jogo; j.mundo.eventos.emitir('missaoConcluida', { id: 'ovos', titulo: 'Os ovos', recompensa: { xp: 25, ouro: 60, itens: { tabua: 6 } } }); j.desenhar(); });
  await foto('aviso');
  console.log('avisos', await pg.evaluate(() => [...document.querySelectorAll('.avisos > *')].map((e) => e.textContent).join(' | ')));
  await pg.evaluate(() => { const j = window.__jogo; const m = j.mundo; m.missoes.feitas = m.dados.missoes.vizinho.slice(0, 24).map((x) => x.id); m.missoes.de = null; m.missoes.conta = 0; j.abrirPainel('missoes'); });
  await foto('missoes');
  console.log(w, erros);
  await ctx.close();
}
await nav.close(); await srv.fechar();
