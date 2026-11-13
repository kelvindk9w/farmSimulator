// Confere o campo de plantação no jogo montado, num Chromium sem janela, com mouse, teclado e toque de verdade:
//   1280x720 (computador: mouse e teclado) e 844x390 (celular deitado, toque).
// O campo inicial aparece e o guia marca a primeira fileira; segurar o mouse (ou o dedo) numa casa do campo mostra a
// fileira e, ao soltar, ara a fileira toda; segurar Espaço semeia a fileira à frente; segurar o botão de agir da tela
// ara a fileira à frente; mexer o dedo cancela; regar, colher e vender fileira por fileira; colheu, segue campo;
// arar a grama do lado aumenta o campo; gravar e recarregar a página guarda o campo; nada pequeno demais; nenhum erro
// no console. Grava as fotos (JPEG) do campo vazio, da primeira fileira, do campo meio arado e meio plantado com parte
// molhada, do campo todo pronto, depois da colheita e aumentado. Termina com "Tudo certo." ou com a lista das falhas.
//   JOGO_DIST=dist-g JOGO_CAPTURAS=capturas-g JOGO_PORTA=8107 node tools/verificar-campo.mjs   (monte antes)
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

const srv = await servir(dist, Number(process.env.JOGO_PORTA) || 0).catch(() => servir(dist)); // porta ocupada: qualquer uma livre
const nav = await abrirNavegador();
const SEGURAR = 750; // ms segurando (o jogo pede 0,45 s)

async function abrir(w, h, opc = {}) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: opc.dpr || 1, hasTouch: !!opc.toque, isMobile: !!opc.toque });
  const pg = await ctx.newPage();
  const erros = [];
  pg.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  pg.on('pageerror', (e) => erros.push('exceção: ' + e.message));
  await pg.goto(srv.url + '#teste');
  await pronto(pg);
  return { ctx, pg, erros, w, h };
}
async function pronto(pg) {
  await pg.waitForFunction(() => window.__jogo && window.__jogo.pronto !== undefined, null, { timeout: 20000 });
  const ok = await pg.evaluate(() => window.__jogo.pronto);
  if (!ok) throw new Error('o jogo não começou: ' + (await pg.evaluate(() => document.querySelector('.erro') && document.querySelector('.erro').textContent)));
  await pg.evaluate(() => window.__jogo.baixarArte());
  await pg.waitForFunction(() => window.__jogo.arteBaixada(), null, { timeout: 30000 });
  await pg.evaluate(() => window.__jogo.desenhar());
  await esperar(250);
}
const J = (pg, f, arg) => pg.evaluate(f, arg);
const estado = (pg) => pg.evaluate(() => window.__jogo.estado());
const dica = (pg) => pg.evaluate(() => window.__jogo.hud.dicaEl.textContent);
const ateParar = async (pg) => { const s = await pg.evaluate(() => window.__jogo.ateParar(600)); if (s < 0) falhas.push('a personagem não parou em 600 s'); return s; };
// fecha a tela de subida de nível (uma por nível) e os painéis, e olha para o campo
const olharCampo = (pg) => J(pg, () => { const j = window.__jogo; for (let k = 0; k < 20 && j.subidaAberta(); k++) j.fecharSubida(); j.fecharPainel(); j.olhar(27, 53.6); });
const foto = async (pg, nome, desenhar = true) => { if (desenhar) await pg.evaluate(() => window.__jogo.desenhar()); await esperar(350); await pg.screenshot({ path: path.join(capturas, nome), type: 'jpeg', quality: 84 }); };
const comando = (pg, c) => J(pg, (c) => window.__jogo.comando(c), c);
// o campo, casa por casa: { campo, aradas, plantas, molhadas, prontas, sede }
const campo = (pg) => J(pg, () => {
  const m = window.__jogo.mundo, loc = m.local, C = m.dados.terras.campo, out = { campo: 0, aradas: 0, grama: 0, plantas: 0, molhadas: 0, prontas: 0, sede: 0 };
  for (let z = C[1]; z < C[3]; z++) for (let x = C[0]; x < C[2]; x++) {
    const i = z * loc.l + x, c = loc.chao[i], pl = loc.plantas[i];
    if (c === 6) out.campo++; else if (c === 1) out.aradas++; else if (c === 0) out.grama++;
    if (pl) { out.plantas++; if (pl.secaEm > m.agora) out.molhadas++; const e = window.__jogo.estado().plantas.find((p) => p.x === x && p.z === z); if (e && e.estado === 'pronta') out.prontas++; if (e && e.estado === 'sede') out.sede++; }
  }
  return out;
});
const fileiraEm = (pg, z, t) => J(pg, ([z, t]) => { const m = window.__jogo.mundo, loc = m.local, C = m.dados.terras.campo; let n = 0; for (let x = C[0]; x < C[2]; x++) { const i = z * loc.l + x; if (t === 'arada' ? loc.chao[i] === 1 : t === 'plantada' ? !!loc.plantas[i] : loc.chao[i] === 6) n++; } return n; }, [z, t]);

async function pontoDaCasa(pg, x, z) {
  const p = await pg.evaluate(([x, z]) => { const p = window.__jogo.naTela(x + 0.5, z + 0.5); const e = document.elementFromPoint(p.x, p.y); return { ...p, livre: !!e && e.id === 'tela', quem: e ? e.className || e.id : 'nada' }; }, [x, z]);
  confere(p.livre, `a casa (${x}, ${z}) devia estar livre para o toque, mas há "${p.quem}" por cima`);
  return p;
}
async function centroDe(pg, seletor) {
  const r = await pg.evaluate((s) => { const e = document.querySelector(s); if (!e || e.hidden || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, seletor);
  if (!r) { falhas.push(`não achei "${seletor}" na tela`); return { x: 5, y: 5 }; }
  return r;
}
async function toqueCDP(cdp, tipo, x, y) { await cdp.send('Input.dispatchTouchEvent', { type: tipo, touchPoints: tipo === 'touchEnd' ? [] : [{ x, y, id: 1 }] }); }
async function dedo(cdp, x, y) { await toqueCDP(cdp, 'touchStart', x, y); await esperar(40); await toqueCDP(cdp, 'touchEnd'); await esperar(60); }
// põe a personagem de pé em (x, z) olhando para +Z (a casa da frente é a de baixo dela): atalho do teste
const posicionar = (pg, x, z) => J(pg, ([x, z]) => { const p = window.__jogo.mundo.personagem; p.x = x; p.z = z; p.rumo = 0; p.rota = null; window.__jogo.desenhar(); }, [x, z]);
const semErros = (a, onde) => confere(a.erros.length === 0, `${onde}: erro no console: ${a.erros.slice(0, 3).join(' | ')}`);

// as fileiras 50 a 53 aradas, 50 e 51 semeadas de alface, a 50 toda regada e a 51 em parte (o "meio a meio" das fotos)
async function meioAMeio(pg) {
  await J(pg, () => { window.__jogo.mundo.posses.bolsa['semente-alface'] = 60; });
  await comando(pg, { tipo: 'escolherModo', modo: 'enxada' });
  for (const z of [50, 51, 52, 53]) if ((await fileiraEm(pg, z, 'arada')) < 6) { await comando(pg, { tipo: 'fileira', x: 24, z }); await ateParar(pg); }
  await comando(pg, { tipo: 'escolherModo', modo: 'semear', semente: 'semente-alface' });
  for (const z of [50, 51]) if ((await fileiraEm(pg, z, 'plantada')) < 6) { await comando(pg, { tipo: 'fileira', x: 24, z }); await ateParar(pg); }
  for (const z of [50, 50, 51]) {
    await comando(pg, { tipo: 'tocarEntidade', id: 'poco' }); await ateParar(pg);
    await comando(pg, { tipo: 'escolherModo', modo: 'regar' });
    const r = await comando(pg, { tipo: 'fileira', x: 24, z }); if (r.ok) await ateParar(pg);
  }
}
// o campo todo arado, plantado e regado (com quantas idas ao poço forem precisas), e o relógio adiante: tudo pronto
const regadorCheio = (pg) => J(pg, () => { const j = window.__jogo, f = j.mundo.posses.ferramentas, k = Object.keys(f).find((id) => /regador/.test(id)); return !k || f[k].agua >= j.dados.itens[k].capacidade; });
async function campoTodoPronto(pg) {
  await J(pg, () => { window.__jogo.mundo.posses.bolsa['semente-alface'] = 60; });
  await comando(pg, { tipo: 'escolherModo', modo: 'enxada' });
  for (let z = 50; z < 58; z++) if ((await fileiraEm(pg, z, 'arada')) < 6) { await comando(pg, { tipo: 'fileira', x: 24, z }); await ateParar(pg); }
  await comando(pg, { tipo: 'escolherModo', modo: 'semear', semente: 'semente-alface' });
  for (let z = 50; z < 58; z++) if ((await fileiraEm(pg, z, 'plantada')) < 6) { await comando(pg, { tipo: 'fileira', x: 24, z }); await ateParar(pg); }
  await comando(pg, { tipo: 'escolherModo', modo: 'regar' });
  for (let volta = 0; volta < 40 && (await campo(pg)).sede > 0; volta++) {
    if (!(await regadorCheio(pg))) { await comando(pg, { tipo: 'tocarEntidade', id: 'poco' }); await ateParar(pg); }
    const z = await J(pg, () => { const j = window.__jogo; const p = j.estado().plantas.find((q) => q.estado === 'sede'); return p ? p.z : 50; });
    const r = await comando(pg, { tipo: 'fileira', x: 24, z }); if (r.ok) await ateParar(pg);
  }
  await J(pg, () => window.__jogo.pular(3600));
}
// colhe fileira por fileira no modo mão, vendendo na banca quando o cesto enche
async function colherTudo(pg) {
  await comando(pg, { tipo: 'escolherModo', modo: 'mao' });
  for (let volta = 0; volta < 60 && (await campo(pg)).plantas > 0; volta++) {
    const z = await J(pg, () => { const p = window.__jogo.estado().plantas.find((q) => q.estado === 'pronta'); return p ? p.z : 50; });
    const r = await comando(pg, { tipo: 'fileira', x: 24, z }); if (r.ok) await ateParar(pg);
    if ((await estado(pg)).noCesto >= 6) { await comando(pg, { tipo: 'tocarEntidade', id: 'banca' }); await ateParar(pg); }
  }
}

try {
  // =====================================================================================================
  console.log('1280x720, mouse e teclado');
  let a = await abrir(1280, 720), pg = a.pg;
  let c = await campo(pg);
  igual(c, { campo: 48, aradas: 0, grama: 0, plantas: 0, molhadas: 0, prontas: 0, sede: 0 }, 'a fazenda começa com o campo de 48 casas, todo sem sulco');
  igual(await J(pg, () => window.__jogo.dados.terras.pontos.lavoura), [24, 50], 'o ponto da lavoura é o canto da primeira fileira');
  await olharCampo(pg);
  await pg.mouse.click(...Object.values(await centroDe(pg, '.modo[data-modo="enxada"]')));
  await esperar(80);
  igual((await estado(pg)).modo.id, 'enxada', 'o clique escolhe a enxada');
  let g = await J(pg, () => window.__jogo.guia());
  confere(g.tipo === 'casa' && g.z === 50 && g.casas && g.casas.length === 6, `o guia aponta a primeira fileira (z = 50) com as 6 casas (veio ${JSON.stringify(g)})`);
  await esperar(400); // a seta do tutorial se acerta umas vezes por segundo
  confere(await J(pg, () => window.__jogo.cena.seta.ligada && (window.__jogo.cena.seta.casas || []).length === 6), 'a seta do tutorial marca as 6 casas da fileira');
  await olharCampo(pg);
  await foto(pg, 'g-1280-1-campo-vazio.jpg');
  // a dica: numa casa do campo, segurar faz a fileira
  let p = await pontoDaCasa(pg, 26, 50);
  await pg.mouse.move(p.x, p.y); await esperar(450);
  confere(/segure/i.test(await dica(pg)), `com o cursor no campo, a linha de dica ensina a segurar (veio "${await dica(pg)}")`);
  // segurar o mouse numa casa do campo: a fileira aparece; soltar enfileira a fileira toda
  await pg.mouse.down(); await esperar(SEGURAR);
  confere(/solte/i.test(await dica(pg)), `segurando, a dica diz o que acontece ao soltar (veio "${await dica(pg)}")`);
  igual((await estado(pg)).personagem.fila, 0, 'segurando, nada entra na fila ainda');
  await foto(pg, 'g-1280-2-segurando.jpg', false);
  await pg.mouse.up(); await esperar(80);
  confere((await estado(pg)).personagem.fila >= 5, 'soltar põe a fileira toda na fila');
  await ateParar(pg);
  igual(await fileiraEm(pg, 50, 'arada'), 6, 'a primeira fileira ficou arada');
  igual((await estado(pg)).missao.id, 'plantar-alface', 'a primeira fileira cumpre a missão de arar');
  await olharCampo(pg);
  await esperar(1800);
  await olharCampo(pg);
  await foto(pg, 'g-1280-3-primeira-fileira.jpg');
  // segurar Espaço com ela de frente para a fileira: semeia a fileira toda
  await pg.mouse.click(...Object.values(await centroDe(pg, '.modo[data-modo="semear"]')));
  await J(pg, () => { window.__jogo.mundo.posses.bolsa['semente-alface'] = 60; window.__jogo.comando({ tipo: 'escolherModo', modo: 'semear', semente: 'semente-alface' }); });
  await posicionar(pg, 26.5, 49.5);
  await pg.keyboard.down('Space'); await esperar(SEGURAR);
  confere(/solte/i.test(await dica(pg)), `segurando Espaço, a dica diz o que acontece ao soltar (veio "${await dica(pg)}")`);
  await pg.keyboard.up('Space'); await esperar(80);
  await ateParar(pg);
  igual(await fileiraEm(pg, 50, 'plantada'), 6, 'segurar Espaço semeou a fileira toda');
  // mexer o mouse segurando cancela
  await comando(pg, { tipo: 'escolherModo', modo: 'enxada' });
  await olharCampo(pg);
  p = await pontoDaCasa(pg, 26, 55);
  await pg.mouse.move(p.x, p.y); await pg.mouse.down(); await esperar(SEGURAR);
  await pg.mouse.move(p.x + 60, p.y + 30, { steps: 4 }); await pg.mouse.up(); await esperar(80);
  igual(await fileiraEm(pg, 55, 'arada') <= 2, true, 'arrastar depois de segurar não ara a fileira toda (vira o arrasto de sempre)');
  await J(pg, () => window.__jogo.comando({ tipo: 'cancelar' }));
  await ateParar(pg);
  // meio arado, meio plantado, parte molhada
  await meioAMeio(pg);
  c = await campo(pg);
  confere(c.aradas >= 24 && c.plantas >= 12 && c.molhadas >= 1 && c.molhadas < c.plantas && c.campo >= 18, `campo meio a meio (veio ${JSON.stringify(c)})`);
  await J(pg, () => window.__jogo.seguir());
  await olharCampo(pg);
  await esperar(1800);
  await olharCampo(pg);
  await foto(pg, 'g-1280-4-meio-a-meio.jpg');
  // tudo pronto
  await campoTodoPronto(pg);
  c = await campo(pg);
  igual([c.plantas, c.prontas], [48, 48], 'o campo todo plantado e pronto para colher');
  await olharCampo(pg);
  await esperar(1800);
  await olharCampo(pg);
  await foto(pg, 'g-1280-5-pronto.jpg');
  // na mão, segurar mostra a colheita da fileira; mexer cancela
  await comando(pg, { tipo: 'escolherModo', modo: 'mao' });
  p = await pontoDaCasa(pg, 27, 57);
  await pg.mouse.move(p.x, p.y); await pg.mouse.down(); await esperar(SEGURAR);
  confere(/solte para colher 6/i.test(await dica(pg)), `na mão, segurar mostra a colheita da fileira (veio "${await dica(pg)}")`);
  await pg.mouse.move(p.x + 80, p.y + 40, { steps: 5 }); await pg.mouse.up(); await esperar(80);
  igual((await estado(pg)).personagem.fila, 0, 'mexer o mouse cancelou a fileira');
  await olharCampo(pg);
  // colher tudo, fileira por fileira
  await colherTudo(pg);
  c = await campo(pg);
  igual([c.campo, c.plantas, c.grama], [48, 0, 0], 'colheu: as 48 casas seguem campo (nada volta a ser grama)');
  await olharCampo(pg);
  await esperar(1800);
  await olharCampo(pg);
  await foto(pg, 'g-1280-6-colhido.jpg');
  // a enxada na grama colada no campo: o campo cresce
  await comando(pg, { tipo: 'escolherModo', modo: 'enxada' });
  await olharCampo(pg);
  // uma fileira nova na grama da frente (z = 58), arrastando o mouse; e três casas atrás (z = 49), com cliques
  p = await pontoDaCasa(pg, 24, 58);
  const q = await pontoDaCasa(pg, 29, 58);
  await pg.mouse.move(p.x, p.y); await pg.mouse.down(); await pg.mouse.move(q.x, q.y, { steps: 12 }); await pg.mouse.up();
  for (const [x, z] of [[25, 49], [26, 49], [27, 49]]) { p = await pontoDaCasa(pg, x, z); await pg.mouse.click(p.x, p.y); await esperar(30); }
  await ateParar(pg);
  const fora = await J(pg, () => { const loc = window.__jogo.mundo.local; return [[24, 58], [25, 58], [26, 58], [27, 58], [28, 58], [29, 58], [25, 49], [26, 49], [27, 49]].filter(([x, z]) => loc.chao[z * loc.l + x] === 1).length; });
  igual(fora, 9, 'a grama arada do lado do campo virou terra arada (o campo cresceu: uma fileira nova e um pedaço de outra)');
  igual(await J(pg, () => window.__jogo.mundo.comando({ tipo: 'fileira', x: 26, z: 58 }).motivo), 'fileira-em-dia', 'a fileira nova é fileira do campo (arada toda: nada a arar)');
  await olharCampo(pg);
  await esperar(1800);
  await olharCampo(pg);
  await foto(pg, 'g-1280-7-maior.jpg');
  // gravar e recarregar: o campo volta igual
  const antes = await campo(pg), est = await estado(pg);
  await J(pg, () => window.__jogo.gravar());
  await pg.reload(); await pronto(pg);
  igual(await campo(pg), antes, 'recarregou a página: o campo voltou igual');
  igual((await estado(pg)).aradas, est.aradas, 'recarregou: a terra arada de fora do retângulo também voltou');
  confere(/"formato":2/.test(await J(pg, () => JSON.stringify(window.__jogo.mundo.salvar().sistemas.lavoura))), 'a gravação leva o formato novo da lavoura');
  semErros(a, '1280x720');
  await a.ctx.close();

  // =====================================================================================================
  console.log('844x390, celular deitado, toque');
  a = await abrir(844, 390, { toque: true, dpr: 2 });
  pg = a.pg;
  const cdp = await a.ctx.newCDPSession(pg);
  igual((await campo(pg)).campo, 48, 'no celular também começa com o campo');
  await olharCampo(pg);
  let b = await centroDe(pg, '.modo[data-modo="enxada"]');
  await dedo(cdp, b.x, b.y);
  igual((await estado(pg)).modo.id, 'enxada', 'o toque no botão escolhe a enxada');
  await esperar(400);
  await olharCampo(pg);
  await foto(pg, 'g-844-1-campo-vazio.jpg');
  // segurar o dedo numa casa do campo: a fileira aparece; soltar ara a fileira toda
  p = await pontoDaCasa(pg, 27, 50);
  await toqueCDP(cdp, 'touchStart', p.x, p.y); await esperar(SEGURAR);
  confere(/solte/i.test(await dica(pg)), `segurando o dedo, a dica diz o que acontece ao soltar (veio "${await dica(pg)}")`);
  await foto(pg, 'g-844-2-segurando.jpg', false);
  await toqueCDP(cdp, 'touchEnd'); await esperar(80);
  await ateParar(pg);
  igual(await fileiraEm(pg, 50, 'arada'), 6, 'o dedo seguro arou a primeira fileira');
  await olharCampo(pg);
  await esperar(1800);
  await olharCampo(pg);
  await foto(pg, 'g-844-3-primeira-fileira.jpg');
  // segurar o botão de agir da tela, de frente para a segunda fileira
  await posicionar(pg, 26.5, 50.5);
  b = await centroDe(pg, '.agir');
  await toqueCDP(cdp, 'touchStart', b.x, b.y); await esperar(SEGURAR);
  await toqueCDP(cdp, 'touchEnd'); await esperar(80);
  await ateParar(pg);
  igual(await fileiraEm(pg, 51, 'arada'), 6, 'segurar o botão de agir arou a fileira da frente');
  // um toque curto continua sendo uma casa só
  p = await pontoDaCasa(pg, 27, 52);
  await dedo(cdp, p.x, p.y); await ateParar(pg);
  igual(await fileiraEm(pg, 52, 'arada'), 1, 'um toque curto ara uma casa só');
  await meioAMeio(pg);
  await J(pg, () => window.__jogo.seguir());
  await olharCampo(pg);
  await esperar(1800);
  await olharCampo(pg);
  await foto(pg, 'g-844-4-meio-a-meio.jpg');
  await campoTodoPronto(pg);
  await olharCampo(pg);
  await esperar(1800);
  await olharCampo(pg);
  await foto(pg, 'g-844-5-pronto.jpg');
  await colherTudo(pg);
  c = await campo(pg);
  igual([c.campo, c.plantas], [48, 0], 'no celular, colheu e segue campo');
  await olharCampo(pg);
  await esperar(1800);
  await olharCampo(pg);
  await foto(pg, 'g-844-6-colhido.jpg');
  await comando(pg, { tipo: 'escolherModo', modo: 'enxada' });
  await olharCampo(pg);
  // o dedo arrasta pela grama da frente (z = 58): uma fileira nova
  {
    const pts = [];
    for (let x = 24; x <= 29; x += 0.5) pts.push(await J(pg, ([x]) => window.__jogo.naTela(x + 0.5, 58.5), [x]));
    await toqueCDP(cdp, 'touchStart', pts[0].x, pts[0].y);
    for (const t of pts.slice(1)) { await esperar(25); await toqueCDP(cdp, 'touchMove', t.x, t.y); }
    await esperar(30); await toqueCDP(cdp, 'touchEnd'); await esperar(60);
  }
  await ateParar(pg);
  igual(await J(pg, () => { const loc = window.__jogo.mundo.local; let n = 0; for (let x = 24; x < 30; x++) if (loc.chao[58 * loc.l + x] === 1) n++; return n; }), 6, 'no celular, o dedo arrastando na grama do lado abriu uma fileira nova');
  await olharCampo(pg);
  await esperar(1800);
  await olharCampo(pg);
  await foto(pg, 'g-844-7-maior.jpg');
  // nada pequeno demais: texto de 14 px para cima e botões de 44 px para cima
  const pequenos = await J(pg, () => {
    const ruins = [];
    for (const n of document.querySelectorAll('#ui *')) {
      if (n.closest('[hidden]') || !n.offsetParent) continue;
      const temTexto = [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
      if (temTexto && parseFloat(getComputedStyle(n).fontSize) < 14) ruins.push(`texto de ${getComputedStyle(n).fontSize} em "${n.textContent.trim().slice(0, 20)}"`);
      if (n.tagName === 'BUTTON') { const r = n.getBoundingClientRect(); if (r.width < 44 || r.height < 44) ruins.push(`botão de ${Math.round(r.width)}x${Math.round(r.height)} (${n.className})`); }
    }
    return ruins;
  });
  confere(pequenos.length === 0, 'celular deitado: ' + pequenos.slice(0, 4).join('; '));
  semErros(a, '844x390');
  await a.ctx.close();
} catch (err) {
  falhas.push('a verificação parou: ' + (err && err.stack ? err.stack.split('\n').slice(0, 3).join(' ') : err));
  console.log('  ✗ ' + falhas[falhas.length - 1]);
}

await nav.close();
await srv.fechar();
console.log(`\n${feitos} conferências, ${falhas.length} falha(s). Capturas em ${path.relative(process.cwd(), capturas) || '.'}/`);
if (falhas.length) { console.log('\nFalhas:\n' + falhas.map((f) => ' - ' + f).join('\n')); process.exit(1); }
console.log('Tudo certo.');
