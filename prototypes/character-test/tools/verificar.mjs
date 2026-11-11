// Teste automático de entrada nas quatro variantes, em tempo real (sem o modo "passo"):
// teclado (WASD/setas, Shift, Espaço, C, X, Z) e toque (alavanca + botões na tela, com dois dedos).
// Confere a animação, a direção e a velocidade (em unidades por segundo de simulação).
// Uso: node tools/verificar.mjs
import { cfg, playwright, GL_ARGS } from './comum.mjs';
import { VARIANTES, conferirBuilds, subirServidores, abrir } from './variantes.mjs';

const { chromium } = playwright();
conferirBuilds();
const servidores = await subirServidores();
const browser = await chromium.launch({ args: GL_ARGS });
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
let falhas = 0;

async function testar(v) {
  const linhas = [];
  const ok = (cond, texto) => { linhas.push(`${cond ? '  ok  ' : ' FALHA'} ${texto}`); if (!cond) falhas++; };
  const info = (a) => (v.motor === 'three' ? a.page.evaluate(() => window.__bench.info()) : a.page.evaluate(() => window.__benchInfo));
  // espera até a condição valer (a simulação roda devagar no servidor, então nada de tempos fixos)
  const ate = async (a, cond, ms = 6000) => { const t0 = Date.now(); let i; do { i = await info(a); if (i && cond(i)) return i; await dormir(40); } while (Date.now() - t0 < ms); return i; };
  const velocidade = async (a) => { const p = await info(a); await dormir(350); const q = await info(a); return Math.hypot(q.x - p.x, q.z - p.z) / ((q.frame - p.frame) * cfg.step); };
  const perto = (x, alvo) => Math.abs(x - alvo) < alvo * 0.03;

  // ---------- teclado ----------
  let a = await abrir(browser, servidores, v, { largura: 800, altura: 500, params: { info: 1 } });
  const k = a.page.keyboard;
  await a.page.mouse.click(400, 200); // garante o foco na tela do jogo
  let i = await ate(a, (s) => s.anim === 'idle');
  ok(i.anim === 'idle', `começa parado (${i.anim})`);

  await k.down('KeyD');
  i = await ate(a, (s) => s.anim === 'walk' && s.dir === 'E');
  const vAndar = await velocidade(a);
  ok(i.anim === 'walk' && i.dir === 'E', `tecla D: andar para L (${i.anim} ${i.dir})`);
  ok(perto(vAndar, cfg.movement.walkSpeed), `velocidade de andar ${vAndar.toFixed(3)} (esperado ${cfg.movement.walkSpeed})`);
  await k.down('ShiftLeft');
  i = await ate(a, (s) => s.anim === 'run');
  ok(i.anim === 'run', `Shift: correr (${i.anim})`);
  // mede a corrida voltando para o outro lado, para não bater no limite da área
  await k.up('KeyD'); await k.down('KeyA');
  await ate(a, (s) => s.anim === 'run' && s.dir === 'W');
  const vCorrer = await velocidade(a);
  ok(perto(vCorrer, cfg.movement.runSpeed), `velocidade de correr ${vCorrer.toFixed(3)} (esperado ${cfg.movement.runSpeed})`);
  await k.up('ShiftLeft'); await k.up('KeyA');
  i = await ate(a, (s) => s.anim === 'idle');
  ok(i.anim === 'idle', `soltar: parar (${i.anim})`);

  for (const [teclas, dir] of [[['ArrowUp'], 'N'], [['ArrowUp', 'ArrowRight'], 'NE'], [['KeyS', 'KeyD'], 'SE'], [['ArrowDown'], 'S'], [['KeyS', 'KeyA'], 'SW'], [['ArrowLeft'], 'W'], [['KeyW', 'KeyA'], 'NW']]) {
    for (const t of teclas) await k.down(t);
    i = await ate(a, (s) => s.anim === 'walk' && s.dir === dir, 3000);
    ok(i.anim === 'walk' && i.dir === dir, `${teclas.join('+')}: andar para ${dir} (${i.anim} ${i.dir})`);
    for (const t of teclas) await k.up(t);
  }
  await ate(a, (s) => s.anim === 'idle');

  await k.press('Space');
  i = await ate(a, (s) => s.anim === 'jump', 3000);
  ok(i.anim === 'jump', `Espaço: pular (${i.anim})`);
  i = await ate(a, (s) => s.anim === 'idle');
  ok(i.anim === 'idle', `depois do pulo volta a ficar parado (${i.anim})`);
  for (const [tecla, anim, nome] of [['KeyC', 'crouch', 'agachar'], ['KeyX', 'sit', 'sentar'], ['KeyZ', 'lie', 'deitar']]) {
    await k.press(tecla);
    i = await ate(a, (s) => s.anim === anim, 3000);
    await dormir(700);
    const depois = await info(a);
    ok(i.anim === anim && depois.anim === anim, `${tecla.slice(3)}: ${nome} e fica (${i.anim}, ${depois.anim})`);
    await k.down('KeyW');
    i = await ate(a, (s) => s.anim === 'walk', 3000);
    ok(i.anim === 'walk', `tecla de movimento levanta de "${nome}" (${i.anim})`);
    await k.up('KeyW');
    await ate(a, (s) => s.anim === 'idle');
  }
  await k.press('KeyC'); await ate(a, (s) => s.anim === 'crouch', 3000);
  await k.press('KeyC'); i = await ate(a, (s) => s.anim === 'idle', 3000);
  ok(i.anim === 'idle', `C de novo: levanta (${i.anim})`);
  if (a.erros.length) ok(false, 'erros no console: ' + a.erros.join(' | '));
  await a.fechar();

  // ---------- toque ----------
  a = await abrir(browser, servidores, v, { largura: 390, altura: 760, dsf: 2, contexto: { hasTouch: true, isMobile: true }, params: { info: 1 } });
  const cdp = await a.ctx.newCDPSession(a.page);
  const toque = (type, pontos) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pontos.map(([x, y, id]) => ({ x, y, id, radiusX: 8, radiusY: 8, force: 1 })) });
  // onde ficam a alavanca e os botões (px de CSS)
  const pos = v.motor === 'three'
    ? await a.page.evaluate(() => {
      const c = (e) => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
      const o = { manche: [...c(document.querySelector('.manche')), document.querySelector('.manche').getBoundingClientRect().width / 2] };
      for (const b of document.querySelectorAll('.acoes button')) o[b.dataset.acao] = c(b);
      const [modo, visual, demo] = [...document.querySelectorAll('.topo-dir button')].map(c);
      return { ...o, modo, visual, demo };
    })
    : await a.page.evaluate(() => { const o = {}; for (const [id, r] of Object.entries(window.__benchBotoes)) o[id] = id === 'manche' ? r : [r[0] + r[2] / 2, r[1] + r[3] / 2]; return o; });
  const tocar = async (id, dedo = 5) => { await toque('touchStart', [[pos[id][0], pos[id][1], dedo]]); await dormir(60); await toque('touchEnd', []); };
  const [mx, my, mr] = pos.manche;

  await toque('touchStart', [[mx, my, 1]]);
  await toque('touchMove', [[mx + mr * 0.9, my, 1]]);
  i = await ate(a, (s) => s.anim === 'walk' && s.dir === 'E');
  ok(i.anim === 'walk' && i.dir === 'E', `alavanca para a direita: andar para L (${i.anim} ${i.dir})`);
  // segundo dedo aperta "Correr" sem soltar a alavanca
  await toque('touchStart', [[mx + mr * 0.9, my, 1], [pos.run[0], pos.run[1], 2]]);
  await dormir(60);
  await toque('touchMove', [[mx + mr * 0.9, my, 1]]); // no protocolo, um ponto que some da lista é um dedo que saiu
  i = await ate(a, (s) => s.anim === 'run');
  ok(i.anim === 'run', `segundo dedo em "Correr" com a alavanca segura: correr (${i.anim})`);
  await toque('touchMove', [[mx - mr * 0.65, my + mr * 0.65, 1]]);
  i = await ate(a, (s) => s.dir === 'SW', 3000);
  ok(i.dir === 'SW', `alavanca para baixo-esquerda: direção SO (${i.dir})`);
  await toque('touchEnd', []);
  i = await ate(a, (s) => s.anim === 'idle');
  ok(i.anim === 'idle', `soltar a alavanca: parar (${i.anim})`);
  await tocar('run'); // desliga o "Correr"

  for (const [id, anim, nome] of [['jump', 'jump', 'Pular'], ['crouch', 'crouch', 'Agachar'], ['sit', 'sit', 'Sentar'], ['lie', 'lie', 'Deitar']]) {
    if (id !== 'jump') { // levanta do estado anterior com um toque na alavanca
      await toque('touchStart', [[mx, my - mr * 0.9, 1]]); await ate(a, (s) => s.anim === 'walk', 3000); await toque('touchEnd', []); await ate(a, (s) => s.anim === 'idle');
    }
    await tocar(id);
    i = await ate(a, (s) => s.anim === anim, 3000);
    ok(i.anim === anim, `botão "${nome}": ${anim} (${i.anim})`);
    if (id === 'jump') await ate(a, (s) => s.anim === 'idle');
  }
  await toque('touchStart', [[mx, my - mr * 0.9, 1]]);
  i = await ate(a, (s) => s.anim === 'walk', 3000);
  ok(i.anim === 'walk', `alavanca levanta de "Deitar" (${i.anim})`);
  await toque('touchEnd', []);

  const antes = (await info(a)).visual;
  await tocar('visual');
  i = await ate(a, (s) => s.visual !== antes, 5000);
  ok(i.visual !== antes, `botão "Trocar visual": visual ${antes} -> ${i.visual}`);
  await tocar('demo');
  i = await ate(a, (s) => s.label !== '', 3000);
  ok(i.label !== '', `botão "Demonstração": roteiro ligado (legenda "${i.label}")`);
  await tocar('demo');

  // troca de modo pela tela
  const outro = VARIANTES.find((o) => o.motor === v.motor && o.modo !== v.modo).nome;
  if (v.motor === 'godot') await a.page.evaluate(() => { window.__benchVariante = null; });
  await tocar('modo');
  let nome = null;
  try {
    if (v.motor === 'three') { await a.page.waitForFunction((n) => window.__bench && window.__bench.ready && window.__bench.variant === n, outro, { timeout: 20000 }); nome = await a.page.evaluate(() => window.__bench.variant); }
    else { await a.page.waitForFunction(() => window.__benchVariante, null, { timeout: 20000 }); nome = await a.page.evaluate(() => window.__benchVariante); }
  } catch { /* fica null */ }
  ok(nome === outro, `botão de modo: passa para "${outro}" (${nome})`);
  if (a.erros.length) ok(false, 'erros no console: ' + a.erros.join(' | '));
  await a.fechar();
  console.log(`\n${v.nome}\n${linhas.join('\n')}`);
}

try {
  for (const v of VARIANTES) await testar(v);
} finally {
  await browser.close();
  await servidores.fechar();
}
console.log(falhas ? `\n${falhas} verificações falharam.` : '\nTudo certo nas quatro variantes.');
process.exitCode = falhas ? 1 : 0;
