// Confere a chegada do jogo novo (o começo humilde) no jogo montado, num Chromium sem janela, com cliques e toques de
// verdade: ela entra pela porteira de costas para a câmera, com a trouxa, até perto do Seu Tonho; ele acena quando ela
// passa da cerca e dá as boas-vindas; o botão "Pular" fica no canto e o balão do vizinho só aparece depois do aceno;
// pular (botão ou toque no chão) termina a cena na hora, e nada fica preso; no jogo de verdade (sem #teste) a cena
// começa sozinha e não volta depois de gravar. Também a fazenda do começo: casa e poço velhos, caixote, baú, cerca de
// arame, sem celeiro, banca nem quadro; e a gravação de antes (testes/gravacoes) abrindo com a fazenda de antes. Em
// 1280x720 (mouse) e 844x390 (celular deitado, dedo). Fotos h-*.jpg (a chegada quadro a quadro). Termina com
// "Tudo certo." ou com a lista das falhas.
//   JOGO_DIST=dist-x JOGO_CAPTURAS=capturas-x node tools/verificar-chegada.mjs     (monte antes: npm run build)
import fs from 'node:fs';
import path from 'node:path';
import { raiz, servir, abrirNavegador, esperar, pastaDist, pastaCapturas } from './comum.mjs';

const dist = pastaDist, capturas = pastaCapturas;
if (!fs.existsSync(path.join(dist, 'index.html'))) { console.error(`Não achei ${path.relative(raiz, dist)}/index.html: rode "npm run build" antes.`); process.exit(2); }
fs.mkdirSync(capturas, { recursive: true });

const falhas = [];
let feitos = 0;
function confere(cond, texto) { feitos++; if (cond) return true; falhas.push(texto); console.log('  ✗ ' + texto); return false; }
const igual = (a, b, texto) => confere(JSON.stringify(a) === JSON.stringify(b), `${texto} (esperava ${JSON.stringify(b)}, veio ${JSON.stringify(a)})`);

const srv = await servir(dist, Number(process.env.JOGO_PORTA) || 0);
const nav = await abrirNavegador();

async function abrir(w, h, opc = {}) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: opc.dpr || 1, hasTouch: !!opc.toque, isMobile: !!opc.toque });
  const pg = await ctx.newPage();
  const erros = [];
  pg.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  pg.on('pageerror', (e) => erros.push('exceção: ' + e.message));
  await pg.goto(srv.url + (opc.endereco === undefined ? '#teste' : opc.endereco));
  await pg.waitForFunction(() => window.__jogo && window.__jogo.pronto !== undefined, null, { timeout: 20000 });
  if (!(await pg.evaluate(() => window.__jogo.pronto))) throw new Error('o jogo não começou');
  if (opc.arte !== false) {
    await pg.evaluate(() => window.__jogo.baixarArte());
    await pg.waitForFunction(() => window.__jogo.arteBaixada(), null, { timeout: 30000 });
  }
  return { ctx, pg, erros, w, h };
}
const semErros = (a, onde) => confere(a.erros.length === 0, `${onde}: erro no console: ${a.erros.slice(0, 3).join(' | ')}`);
const J = (pg, f, arg) => pg.evaluate(f, arg);
// (no modo #teste o desenho anda a fala do vizinho 1 s por chamada: aqui desenha-se sem andar o relógio dela)
const foto = async (pg, nome) => { await J(pg, () => window.__jogo.desenhar()); await esperar(150); await pg.screenshot({ path: path.join(capturas, nome), type: 'jpeg', quality: 84 }); };
const cena = (pg) => J(pg, () => {
  const j = window.__jogo, m = j.mundo, C = m.comeco, p = m.personagem, loc = m.locais.fazenda, b = document.querySelector('.pular-chegada');
  const balao = document.querySelector('.balao');
  return {
    chegada: !!C.chegada, chegou: C.chegou, x: p.x, z: p.z, rumo: p.rumo, fila: p.fila.length,
    dentro: loc.ehPropria(Math.floor(p.x), Math.floor(p.z)), acenou: !!C.acenouEm,
    pular: !!b && !!b.offsetParent, balao: !!balao && !balao.hidden && getComputedStyle(balao).visibility !== 'hidden',
    fala: balao ? balao.textContent : '',
  };
});
async function centroDe(pg, seletor) {
  const r = await pg.evaluate((s) => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, seletor);
  if (!r) confere(false, `não achei "${seletor}" na tela`);
  return r || { x: 5, y: 5 };
}
async function toqueCDP(cdp, tipo, x, y) { await cdp.send('Input.dispatchTouchEvent', { type: tipo, touchPoints: tipo === 'touchEnd' ? [] : [{ x, y, id: 1 }] }); }
async function dedo(cdp, x, y) { await toqueCDP(cdp, 'touchStart', x, y); await esperar(40); await toqueCDP(cdp, 'touchEnd'); await esperar(60); }

try {
  // =====================================================================================================
  console.log('1280x720: a fazenda do começo e a chegada inteira, quadro a quadro');
  let a = await abrir(1280, 720), pg = a.pg;
  const f = await J(pg, () => { const m = window.__jogo.mundo, t = (id) => (m.locais.fazenda.porId[id] || {}).tipo || null; return { casa: t('casa'), poco: t('poco'), banca: t('banca'), bau: t('bau-da-casa'), celeiro: t('celeiro'), quadro: t('quadro-de-pedidos'), vizinho: t('vizinho'), cerca: m.comeco.cerca && m.comeco.cerca.tipo }; });
  igual(f, { casa: 'casa-velha', poco: 'poco-velho', banca: 'caixote-de-venda', bau: 'bau-da-casa', celeiro: null, quadro: null, vizinho: 'vizinho', cerca: 'cerca-de-arame' }, 'a fazenda do começo: casa e poço velhos, caixote, baú, cerca de arame e o Seu Tonho; sem celeiro nem quadro');
  igual(await J(pg, () => window.__jogo.mundo.comeco.chegada), null, 'no modo #teste a cena não começa sozinha');
  const r = await J(pg, () => window.__jogo.comando({ tipo: 'comecarChegada' }));
  confere(r.ok && r.dados.seg > 3 && r.dados.seg < 9, `a cena começa e dura alguns segundos (veio ${JSON.stringify(r)})`);
  await J(pg, () => window.__jogo.seguir());
  let c = await cena(pg);
  confere(c.chegada && !c.dentro, 'ela começa do lado de fora da cerca');
  confere(c.pular, 'o botão "Pular" aparece no canto');
  confere(!c.balao, 'o balão do vizinho fica escondido até ele acenar');
  confere(Math.abs(Math.cos(c.rumo) + 1) < 0.2, `ela entra de costas para a câmera, andando para o fundo (rumo ${c.rumo.toFixed(2)})`);
  igual(await J(pg, () => window.__jogo.guia().tipo), null, 'durante a cena, nenhuma seta');
  // quadro a quadro (0,5 s cada)
  let viuAceno = false, k = 0;
  for (; k < 24 && (await cena(pg)).chegada; k++) {
    await foto(pg, `h-1280-chegada-${String(k).padStart(2, '0')}.jpg`);
    await J(pg, () => window.__jogo.avancar(0.5));
    c = await cena(pg);
    if (c.acenou && !viuAceno) {
      viuAceno = true;
      await J(pg, () => window.__jogo.desenhar());
      c = await cena(pg);
      confere(c.dentro, 'o Seu Tonho acena quando ela passa da cerca');
      confere(c.balao && /bem-vinda/i.test(c.fala), `com o aceno vêm as boas-vindas no balão (veio "${c.fala.slice(0, 80)}")`);
    }
  }
  confere(viuAceno, 'o Seu Tonho acenou');
  c = await cena(pg);
  confere(!c.chegada && c.chegou, `a cena acabou sozinha (${k} quadros)`);
  confere(!c.pular, 'acabada a cena, o botão "Pular" some');
  igual(await J(pg, () => { const g = window.__jogo.guia(); return g.tipo + ':' + g.id; }), 'entidade:vizinho', 'acabada a cena, a seta aponta o Seu Tonho');
  await foto(pg, 'h-1280-chegada-fim.jpg');
  // e o primeiro clique de verdade já vale: no Seu Tonho, conversa
  await J(pg, () => { const v = window.__jogo.mundo.local.porId.vizinho; window.__jogo.olhar(v.x + 0.5, v.z + 0.5); });
  const t = await J(pg, () => window.__jogo.daEntidade('vizinho', 0.9));
  await pg.mouse.click(t.x, t.y);
  await J(pg, () => window.__jogo.ateParar(30));
  igual(await J(pg, () => window.__jogo.mundo.comeco.conversas), 1, 'o clique no Seu Tonho é conversa');
  await J(pg, () => window.__jogo.seguir());
  semErros(a, '1280x720');
  await a.ctx.close();

  // =====================================================================================================
  console.log('1280x720: pular pelo botão e pelo clique no chão');
  a = await abrir(1280, 720); pg = a.pg;
  await J(pg, () => { window.__jogo.comando({ tipo: 'comecarChegada' }); window.__jogo.avancar(1); window.__jogo.desenhar(); });
  await esperar(100);
  const bp = await centroDe(pg, '.pular-chegada');
  await pg.mouse.click(bp.x, bp.y);
  await esperar(100);
  c = await cena(pg);
  confere(!c.chegada && c.chegou && !c.pular, 'o botão "Pular" termina a cena na hora');
  await J(pg, () => window.__jogo.desenhar());
  c = await cena(pg);
  confere(c.balao && /bem-vinda/i.test(c.fala), 'pulando, as boas-vindas aparecem do mesmo jeito');
  igual(await J(pg, () => window.__jogo.mundo.comando({ tipo: 'comecarChegada' }).ok), false, 'a cena não volta');
  await a.ctx.close();
  a = await abrir(1280, 720); pg = a.pg;
  await J(pg, () => { window.__jogo.comando({ tipo: 'comecarChegada' }); window.__jogo.avancar(1); window.__jogo.seguir(); });
  const chao = await J(pg, () => window.__jogo.naTela(35.5, 53.5));
  await pg.mouse.click(chao.x, chao.y);
  await esperar(80);
  c = await cena(pg);
  confere(!c.chegada && c.chegou && c.fila === 0, 'um clique no chão termina a cena (e não manda andar)');
  // (acabada a cena ela pula para o fim do caminho e a câmera vai junto: o ponto na tela muda)
  await J(pg, () => window.__jogo.seguir());
  const chao2 = await J(pg, () => window.__jogo.naTela(35.5, 53.5));
  await pg.mouse.click(chao2.x, chao2.y);
  await J(pg, () => window.__jogo.ateParar(30));
  c = await cena(pg);
  confere(Math.hypot(c.x - 35.5, c.z - 53.5) < 1.5, `o clique seguinte já anda (ela está em ${c.x.toFixed(1)}, ${c.z.toFixed(1)}; modo ${JSON.stringify(await J(pg, () => window.__jogo.mundo.modo))})`);
  semErros(a, '1280x720 (pular)');
  await a.ctx.close();

  // =====================================================================================================
  console.log('844x390, celular deitado, dedo');
  a = await abrir(844, 390, { toque: true, dpr: 2 }); pg = a.pg;
  const cdp = await a.ctx.newCDPSession(pg);
  await J(pg, () => { window.__jogo.comando({ tipo: 'comecarChegada' }); window.__jogo.seguir(); });
  for (k = 0; k < 24 && (await cena(pg)).chegada; k++) {
    if (k % 2 === 0) await foto(pg, `h-844-chegada-${String(k).padStart(2, '0')}.jpg`);
    // o botão "Pular" não pode ficar em cima de nada da interface
    if (k === 1) confere(await J(pg, () => { const b = document.querySelector('.pular-chegada'); if (!b) return false; const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); const cruza = [...document.querySelectorAll('#ui .bt.agir, #ui .alavanca, #ui .balao')].filter((o) => o.offsetParent).some((o) => { const q = o.getBoundingClientRect(); return q.left < r.right && r.left < q.right && q.top < r.bottom && r.top < q.bottom; }); return r.right <= innerWidth && r.bottom <= innerHeight && (e === b || b.contains(e)) && !cruza; }), 'no celular, o "Pular" fica inteiro na tela, livre para o dedo e sem tapar o botão de agir, a alavanca nem o balão');
    await J(pg, () => window.__jogo.avancar(0.5));
  }
  await foto(pg, 'h-844-chegada-fim.jpg');
  confere((await cena(pg)).chegou, 'no celular a cena também acaba sozinha');
  await a.ctx.close();
  a = await abrir(844, 390, { toque: true, dpr: 2 }); pg = a.pg;
  const cdp2 = await a.ctx.newCDPSession(pg);
  await J(pg, () => { window.__jogo.comando({ tipo: 'comecarChegada' }); window.__jogo.avancar(0.5); window.__jogo.desenhar(); });
  await esperar(100);
  const bp2 = await centroDe(pg, '.pular-chegada');
  await dedo(cdp2, bp2.x, bp2.y);
  c = await cena(pg);
  confere(!c.chegada && c.chegou && !c.pular, 'o dedo no "Pular" termina a cena');
  semErros(a, '844x390');
  void cdp;
  await a.ctx.close();

  // =====================================================================================================
  console.log('o jogo de verdade (sem #teste): a cena começa sozinha, acaba, e não volta depois de gravar');
  a = await abrir(1280, 720, { endereco: '', arte: false }); pg = a.pg;
  await esperar(300);
  c = await cena(pg);
  confere(c.chegada || c.chegou, 'a cena da chegada começa sozinha no jogo novo');
  confere(c.chegada ? c.pular : true, 'com o botão "Pular"');
  await pg.waitForFunction(() => window.__jogo.mundo.comeco.chegou, null, { timeout: 15000 }).catch(() => {});
  c = await cena(pg);
  confere(c.chegou && !c.chegada && !c.pular, 'e acaba sozinha em poucos segundos');
  await J(pg, () => window.__jogo.gravar());
  await pg.reload();
  await pg.waitForFunction(() => window.__jogo && window.__jogo.pronto !== undefined, null, { timeout: 20000 });
  await esperar(300);
  c = await cena(pg);
  confere(!c.chegada && !c.pular, 'aberto de novo, a cena não volta');
  semErros(a, 'jogo de verdade');
  await a.ctx.close();

  // =====================================================================================================
  console.log('a gravação de antes (feita pelo código de antes do começo humilde): abre a fazenda de antes, sem a cena');
  const velha = fs.readFileSync(path.join(raiz, 'testes', 'gravacoes', 'antes-nivel-5.json'), 'utf8');
  const ctxV = await nav.newContext({ viewport: { width: 1280, height: 720 } });
  await ctxV.addInitScript((t) => { if (!sessionStorage.getItem('velha')) { localStorage.setItem('fazenda.jogo.v1', t); sessionStorage.setItem('velha', '1'); } }, velha);
  const pv = await ctxV.newPage(), errosV = [];
  pv.on('console', (m) => { if (m.type() === 'error') errosV.push(m.text()); });
  pv.on('pageerror', (e) => errosV.push('exceção: ' + e.message));
  await pv.goto(srv.url);
  await pv.waitForFunction(() => window.__jogo && window.__jogo.pronto !== undefined, null, { timeout: 20000 });
  await esperar(600);
  igual(await J(pv, () => { const m = window.__jogo.mundo, t = (id) => (m.locais.fazenda.porId[id] || {}).tipo || null; return { nivel: m.progresso.nivel, humilde: m.comeco.humilde, chegada: !!m.comeco.chegada, pular: !!document.querySelector('.pular-chegada'), casa: t('casa'), poco: t('poco'), banca: t('banca'), celeiro: t('celeiro'), quadro: t('quadro-de-pedidos'), vizinho: t('vizinho'), bau: t('bau-da-casa') }; }),
    { nivel: 5, humilde: false, chegada: false, pular: false, casa: 'casa', poco: 'poco', banca: 'banca', celeiro: 'celeiro', quadro: 'quadro-de-pedidos', vizinho: null, bau: null },
    'a gravação de antes abre com casa, poço, celeiro, banca e quadro prontos, sem a cena e sem o começo humilde');
  await pv.screenshot({ path: path.join(capturas, 'h-1280-gravacao-de-antes.jpg'), type: 'jpeg', quality: 84 });
  confere(errosV.length === 0, `gravação de antes: erro no console: ${errosV.slice(0, 3).join(' | ')}`);
  await ctxV.close();
} catch (err) {
  falhas.push('a verificação parou: ' + (err && err.stack ? err.stack.split('\n').slice(0, 3).join(' ') : err));
}
await nav.close();
await srv.fechar();
console.log(`\n${feitos} conferências.`);
if (falhas.length) { console.log(`${falhas.length} falha(s):`); for (const f of falhas) console.log(' - ' + f); process.exit(1); }
console.log('Tudo certo.');
