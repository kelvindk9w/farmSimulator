// Confere o jogo montado (dist/) num Chromium sem janela, com cliques, toques e teclas de verdade:
//   1280x720 (computador: mouse e teclado), 844x390 (celular deitado, toque) e 390x844 (celular em pé, girado).
// Joga o começo (arar, semear, encher o regador, regar, avançar o relógio, colher, vender, comprar), confere a tela
// de subida de nível, os painéis, o foco pelas setas, gravar e recarregar, exportar e importar, e que não há erro
// no console. Grava as capturas em capturas/ (JPEG). Termina com "Tudo certo." ou com a lista das falhas.
//   node tools/verificar.mjs            (monte antes: npm run build)
//   JOGO_DIST=dist-x JOGO_CAPTURAS=capturas-x node tools/verificar.mjs   (outra pasta montada, outras capturas)
import fs from 'node:fs';
import path from 'node:path';
import { raiz, servir, abrirNavegador, esperar, pastaDist, pastaCapturas } from './comum.mjs';

const dist = pastaDist, capturas = pastaCapturas;
if (!fs.existsSync(path.join(dist, 'index.html'))) { console.error(`Não achei ${path.relative(raiz, dist)}/index.html: rode "npm run build" antes.`); process.exit(2); }
fs.mkdirSync(capturas, { recursive: true });

const falhas = [];
let feitos = 0;
function confere(cond, texto) { feitos++; if (cond) return true; falhas.push(texto); console.log('  ✗ ' + texto); return false; }
const igual = (a, b, texto) => confere(a === b, `${texto} (esperava ${JSON.stringify(b)}, veio ${JSON.stringify(a)})`);

const srv = await servir(dist);
const nav = await abrirNavegador();

// abre o jogo num contexto novo (gravação vazia); devolve a página e os erros de console
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
  await pg.waitForFunction(() => window.__jogo.arteBaixada(), null, { timeout: 20000 });
  await pg.evaluate(() => window.__jogo.desenhar());
  await esperar(250);
}
const J = (pg, f, arg) => pg.evaluate(f, arg);
const estado = (pg) => pg.evaluate(() => window.__jogo.estado());
const ateParar = async (pg) => { const s = await pg.evaluate(() => window.__jogo.ateParar(240)); if (s < 0) falhas.push('a personagem não parou em 240 s'); await pg.evaluate(() => window.__jogo.desenhar()); return s; };
const foto = async (pg, nome) => { await pg.evaluate(() => window.__jogo.desenhar()); await esperar(350); await pg.screenshot({ path: path.join(capturas, nome), type: 'jpeg', quality: 82 }); };

// ponto da janela de uma casa ou de uma entidade; confere que o toque cai no canvas (nada da interface por cima)
async function pontoDaCasa(pg, x, z) {
  const p = await pg.evaluate(([x, z]) => { const p = window.__jogo.naTela(x + 0.5, z + 0.5); const e = document.elementFromPoint(p.x, p.y); return { ...p, livre: !!e && e.id === 'tela', quem: e ? e.className || e.id : 'nada' }; }, [x, z]);
  confere(p.livre, `a casa (${x}, ${z}) devia estar livre para o toque, mas há "${p.quem}" por cima`);
  return p;
}
async function pontoDaEntidade(pg, id) {
  const p = await pg.evaluate((id) => { const p = window.__jogo.daEntidade(id, 0.7); const e = document.elementFromPoint(p.x, p.y); return { ...p, livre: !!e && e.id === 'tela', quem: e ? e.className || e.id : 'nada' }; }, id);
  confere(p.livre, `"${id}" devia estar livre para o toque, mas há "${p.quem}" por cima`);
  return p;
}
// centro de um elemento da interface, na janela
async function centroDe(pg, seletor) {
  const r = await pg.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, seletor);
  if (!r) { falhas.push(`não achei "${seletor}" na tela`); return { x: 5, y: 5 }; }
  return r;
}
// toque com dedo de verdade (CDP): pontos = [[x, y], ...]; um só ponto é um toque; vários, um arrasto
async function dedo(cdp, pontos, pausa = 30) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pontos[0][0], y: pontos[0][1], id: 1 }] });
  for (let i = 1; i < pontos.length; i++) { await esperar(pausa); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pontos[i][0], y: pontos[i][1], id: 1 }] }); }
  await esperar(pausa);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await esperar(40);
}

const CAMPO = [[26, 51], [27, 51], [28, 51], [26, 52], [27, 52], [28, 52]];
const semErros = (a, onde) => confere(a.erros.length === 0, `${onde}: erro no console: ${a.erros.slice(0, 3).join(' | ')}`);

try {
  // =====================================================================================================
  console.log('1280x720, mouse e teclado');
  let a = await abrir(1280, 720);
  let pg = a.pg;
  const clicarCasa = async (x, z) => { const p = await pontoDaCasa(pg, x, z); await pg.mouse.click(p.x, p.y); };
  const clicarEm = async (seletor) => { const c = await centroDe(pg, seletor); await pg.mouse.click(c.x, c.y); await esperar(60); };

  let e = await estado(pg);
  igual(e.nivel, 1, 'começa no nível 1');
  confere(e.missao && e.missao.id, 'há uma missão do vizinho no começo');
  confere(await J(pg, () => !document.querySelector('.balao').hidden && document.querySelector('.balao').textContent.length > 20), 'o balão do vizinho aparece com a fala');
  confere(await J(pg, () => { const m = window.__jogo.medidas(); return m.figuras > 20 && m.blocosDoChao > 4; }), 'o mundo é desenhado (chão em blocos e figuras)');
  await foto(pg, '01-comeco.jpg');

  // ---- arar: botão da enxada e seis casas, com o mouse
  await J(pg, () => window.__jogo.olhar(27.5, 52));
  await clicarEm('.modo[data-modo="enxada"]');
  igual((await estado(pg)).modo.id, 'enxada', 'o clique no botão escolhe o modo enxada');
  for (const [x, z] of CAMPO) await clicarCasa(x, z);
  confere((await estado(pg)).personagem.fila >= 5, 'os cliques nas casas enfileiram as tarefas');
  confere(await J(pg, () => !document.querySelector('.fila').hidden), 'a fila de tarefas aparece na tela');
  await ateParar(pg);
  e = await estado(pg);
  igual(e.aradas, 6, 'seis casas aradas');
  igual(e.missao.id, 'plantar-alface', 'a missão de arar foi cumprida e veio a de plantar');

  // ---- semear
  await clicarEm('.modo[data-modo="semear"]');
  confere(await J(pg, () => !document.querySelector('.sementes').hidden && document.querySelectorAll('.semente').length >= 1), 'no modo semear aparecem as sementes da bolsa');
  for (const [x, z] of CAMPO) await clicarCasa(x, z);
  await ateParar(pg);
  e = await estado(pg);
  igual(e.plantas.length, 6, 'seis casas semeadas');
  confere(e.plantas.every((p) => p.estado === 'sede'), 'planta recém-semeada pede água');

  // ---- encher o regador no poço e regar; a água acaba e é preciso voltar ao poço
  const poco = await pontoDaEntidade(pg, 'poco');
  await pg.mouse.click(poco.x, poco.y);
  await ateParar(pg);
  e = await estado(pg);
  const regador = Object.keys(e.ferramentas).find((k) => /regador/.test(k));
  const cabe = await J(pg, (k) => window.__jogo.dados.itens[k].capacidade, regador);
  igual(e.ferramentas[regador].agua, cabe, 'o regador enche no poço');
  await pg.keyboard.press('Digit1');
  igual((await estado(pg)).modo.id, 'mao', 'a tecla 1 escolhe o modo mão');
  for (const [x, z] of CAMPO) await clicarCasa(x, z);
  // lavoura em andamento: para no meio de uma rega para a captura
  await J(pg, () => { const j = window.__jogo; for (let k = 0; k < 2400 && !(j.mundo.personagem.acao && j.mundo.personagem.acao.id === 'regar' && j.mundo.personagem.acao.feito && j.estado().plantas.filter((p) => p.estado === 'crescendo').length >= 2); k++) j.mundo.passo(); j.seguir(); });
  await esperar(160);
  await pg.screenshot({ path: path.join(capturas, '02-lavoura.jpg'), type: 'jpeg', quality: 82 });
  await ateParar(pg);
  e = await estado(pg);
  if (cabe < 6) {
    igual(e.plantas.filter((p) => p.estado === 'crescendo').length, cabe, `com ${cabe} regas no regador, só ${cabe} plantas ficam regadas`);
    confere(await J(pg, () => window.__jogo.avisos().some((t) => /regador/i.test(t) && /po[çc]o/i.test(t))), 'o aviso do regador vazio manda ir ao poço');
    await J(pg, () => window.__jogo.olhar(27.5, 52));
    const p2 = await pontoDaEntidade(pg, 'poco');
    await pg.mouse.click(p2.x, p2.y);
    for (const [x, z] of CAMPO) await clicarCasa(x, z);
    await ateParar(pg);
    e = await estado(pg);
  }
  igual(e.plantas.filter((p) => p.estado === 'crescendo').length, 6, 'as seis plantas ficam regadas e crescendo');

  // ---- teclado: andar com as setas e correr com Shift (o relógio só anda quando a ferramenta manda)
  const antes = (await estado(pg)).personagem;
  await pg.keyboard.down('ArrowRight');
  await J(pg, () => window.__jogo.avancar(0.6));
  await pg.keyboard.up('ArrowRight');
  await J(pg, () => window.__jogo.avancar(0.3));
  const depois = (await estado(pg)).personagem;
  confere(Math.hypot(depois.x - antes.x, depois.z - antes.z) > 0.6, 'a seta para a direita anda com a personagem');
  confere(depois.x - antes.x > 0.2 && depois.z - antes.z < -0.2, 'seta para a direita anda para a direita da tela (+X, -Z)');

  // ---- avançar o relógio: a planta cresce com o tempo, mesmo com o jogo "fechado"
  const tempo = await J(pg, () => Math.max(...Object.values(window.__jogo.dados.culturas).filter((c) => c.id === 'alface').map((c) => c.tempoSeg)));
  await J(pg, (s) => window.__jogo.pular(s + 5), tempo);
  e = await estado(pg);
  igual(e.plantas.filter((p) => p.estado === 'pronta').length, 6, 'depois do tempo da cultura as seis plantas estão prontas');
  confere(await J(pg, () => window.__jogo.avisos().some((t) => /pront/i.test(t))), 'na volta de uma ausência aparece o resumo (plantas prontas)');

  // ---- colher (modo mão) e a tela de subida de nível
  await J(pg, () => window.__jogo.olhar(27.5, 52));
  for (const [x, z] of CAMPO) await clicarCasa(x, z);
  await ateParar(pg);
  e = await estado(pg);
  igual(e.cesto.alface, 6, 'seis alfaces no cesto');
  igual(e.plantas.length, 0, 'as casas colhidas ficam sem planta');
  let subiu = await J(pg, () => window.__jogo.subidaAberta());
  if (!subiu) {
    // se os números da economia ainda não deram o nível 2 aqui, vende antes e olha de novo
    console.log('  (o nível 2 não veio na colheita; confiro depois da venda)');
  } else {
    await esperar(900);
    await pg.screenshot({ path: path.join(capturas, '04-subida-de-nivel.jpg'), type: 'jpeg', quality: 82 });
    confere(await J(pg, () => /n[íi]vel/i.test(document.querySelector('.subida').textContent) && !!document.querySelector('.subida .numero')), 'a tela de subida mostra o nível novo');
    await pg.keyboard.press('Enter');
    await esperar(80);
    confere(!(await J(pg, () => window.__jogo.subidaAberta())), 'Enter fecha a tela de subida de nível');
  }

  // ---- vender na banca
  const ouroAntes = (await estado(pg)).ouro;
  await J(pg, () => window.__jogo.seguir());
  await J(pg, () => { const e = window.__jogo.mundo.local.porId.banca; window.__jogo.olhar(e.x + 1.5, e.z - 2); });
  const banca = await pontoDaEntidade(pg, 'banca');
  await pg.mouse.click(banca.x, banca.y);
  await ateParar(pg);
  e = await estado(pg);
  confere(e.ouro > ouroAntes, `vender na banca dá ouro (tinha ${ouroAntes}, ficou com ${e.ouro})`);
  igual(e.noCesto, 0, 'o cesto fica vazio depois da venda');
  if (!subiu) {
    subiu = await J(pg, () => window.__jogo.subidaAberta());
    if (subiu) { await esperar(900); await pg.screenshot({ path: path.join(capturas, '04-subida-de-nivel.jpg'), type: 'jpeg', quality: 82 }); await pg.keyboard.press('Enter'); await esperar(80); }
  }
  if (await J(pg, () => window.__jogo.subidaAberta())) { await pg.keyboard.press('Enter'); await esperar(80); }

  // ---- comprar na loja: abre pelo botão, compra com o mouse e com o teclado, fecha com Esc
  await clicarEm('.topo-dir [data-painel="loja"]');
  igual(await J(pg, () => window.__jogo.painelAberto()), 'loja', 'o botão abre a loja');
  await foto(pg, '03-loja.jpg');
  const semAntes = (await estado(pg)).bolsa['semente-alface'] || 0, ouroLoja = (await estado(pg)).ouro;
  await clicarEm('.oferta[data-item="semente-alface"] [data-k="c1-semente-alface"]');
  e = await estado(pg);
  igual((e.bolsa['semente-alface'] || 0) - semAntes, 1, 'comprar dá uma semente');
  confere(e.ouro < ouroLoja, 'comprar gasta ouro');
  // foco pelas setas dentro do painel: o botão focado compra com Enter
  await J(pg, () => document.querySelector('[data-k="c1-semente-alface"]').focus());
  await pg.keyboard.press('ArrowRight');
  const focado = await J(pg, () => document.activeElement && document.activeElement.dataset.k);
  igual(focado, 'c5-semente-alface', 'a seta para a direita leva o foco ao botão vizinho da loja');
  const ouroAntesDoEnter = e.ouro, precoDaSemente = await J(pg, () => window.__jogo.dados.itens['semente-alface'].compra);
  await pg.keyboard.press('Enter');
  await esperar(60);
  e = await estado(pg);
  igual(ouroAntesDoEnter - e.ouro, 5 * precoDaSemente, 'Enter no botão focado compra cinco sementes (uma vez só)');
  confere((e.bolsa['semente-alface'] || 0) - semAntes >= 6, 'as sementes compradas vão para a bolsa');
  igual(await J(pg, () => document.activeElement && document.activeElement.dataset.k), 'c5-semente-alface', 'o foco continua no botão depois da compra');
  await pg.keyboard.press('Escape');
  igual(await J(pg, () => window.__jogo.painelAberto()), null, 'Esc fecha o painel');
  confere((await estado(pg)).feitas.includes('comprar-sementes') || (await estado(pg)).missao.id !== 'comprar-sementes', 'a missão de comprar sementes foi cumprida');
  if (!subiu) { subiu = await J(pg, () => window.__jogo.subidaAberta()); if (subiu) { await esperar(900); await pg.screenshot({ path: path.join(capturas, '04-subida-de-nivel.jpg'), type: 'jpeg', quality: 82 }); } }
  if (await J(pg, () => window.__jogo.subidaAberta())) { await pg.keyboard.press('Enter'); await esperar(80); }
  e = await estado(pg);
  confere(subiu, `a tela de subida de nível apareceu no começo do jogo (nível ${e.nivel}, ${e.xp} de experiência)`);
  confere(e.nivel >= 2, 'o começo do jogo leva ao nível 2');

  // ---- os outros painéis
  for (const id of ['missoes', 'mochila', 'config']) {
    await clicarEm(`.topo-dir [data-painel="${id}"]`);
    igual(await J(pg, () => window.__jogo.painelAberto()), id, `o botão abre o painel "${id}"`);
    confere(await J(pg, () => { const c = document.querySelector('.veu .corpo'); return c && c.textContent.length > 20 && c.scrollWidth <= c.clientWidth + 1; }), `o painel "${id}" tem conteúdo e não vaza para os lados`);
    if (id !== 'config') { await clicarEm('.veu .fechar'); igual(await J(pg, () => window.__jogo.painelAberto()), null, `o botão de fechar fecha o painel "${id}"`); }
  }
  // configurações: som, esquema, recomeçar com confirmação na própria página, exportar e importar
  await clicarEm('[data-k="som-false"]');
  igual(await J(pg, () => window.__jogo.J.prefs.som), false, 'a opção de som desliga');
  await clicarEm('[data-k="som-true"]');
  await clicarEm('[data-k="botoes-grande"]');
  confere(await J(pg, () => document.body.classList.contains('grande')), 'a opção de botões grandes muda a interface');
  await clicarEm('[data-k="botoes-normal"]');
  await clicarEm('[data-k="abre-recomecar"]');
  confere(await J(pg, () => !!document.querySelector('[data-k="sim"]') && !!document.querySelector('[data-k="nao"]')), 'recomeçar pede confirmação na própria página');
  const antesDoNao = await estado(pg);
  await clicarEm('[data-k="nao"]');
  e = await estado(pg);
  confere(e.ouro === antesDoNao.ouro && e.aradas === antesDoNao.aradas && e.feitas.length === antesDoNao.feitas.length, 'responder "não" mantém a fazenda');
  await clicarEm('[data-k="abre-exportar"]');
  const texto = await J(pg, () => document.querySelector('.veu textarea').value);
  confere(/^FAZENDA1\./.test(texto) && texto.length > 200, 'exportar mostra o texto da fazenda');
  const antesDeImportar = await estado(pg);
  await J(pg, () => { window.__jogo.comando({ tipo: 'comprar', item: 'semente-alface', n: 1 }); });
  await clicarEm('[data-k="abre-importar"]');
  await pg.fill('#importar-texto', 'isto não é uma gravação');
  await clicarEm('[data-k="carregar"]');
  confere(await J(pg, () => { const n = document.querySelector('#nota-config'); return n && !n.hidden && n.textContent.length > 10; }), 'importar um texto errado avisa e não muda nada');
  await pg.fill('#importar-texto', texto);
  await clicarEm('[data-k="carregar"]');
  e = await estado(pg);
  igual(e.ouro, antesDeImportar.ouro, 'importar o texto exportado traz o ouro de volta');
  igual(JSON.stringify(e.bolsa), JSON.stringify(antesDeImportar.bolsa), 'importar traz a bolsa de volta');
  await pg.keyboard.press('Escape');

  // ---- menu pelo teclado (TV): Tab leva o foco aos botões, as setas andam, Enter escolhe, Esc volta
  await pg.keyboard.press('Tab');
  confere(await J(pg, () => window.__jogo.medidas().menu), 'Tab abre o menu (foco nos botões da tela)');
  await pg.keyboard.press('ArrowRight');
  await pg.keyboard.press('Enter');
  await esperar(60);
  const modoDepois = (await estado(pg)).modo.id;
  confere(modoDepois !== 'mao', `no menu, seta e Enter trocam o modo (ficou "${modoDepois}")`);
  await pg.keyboard.press('Escape');
  confere(!(await J(pg, () => window.__jogo.medidas().menu)), 'Esc sai do menu');
  await pg.keyboard.press('KeyQ');
  igual((await estado(pg)).modo.id, 'mao', 'Q volta ao modo anterior');
  // Espaço age na casa à frente dela
  await J(pg, () => { const j = window.__jogo; j.comando({ tipo: 'irPara', x: 30.5, z: 53.5 }); j.ateParar(); j.comando({ tipo: 'escolherModo', modo: 'enxada' }); });
  await pg.keyboard.down('ArrowLeft'); await J(pg, () => window.__jogo.avancar(0.25)); await pg.keyboard.up('ArrowLeft');
  const aradasAntes = (await estado(pg)).aradas;
  await pg.keyboard.press('Space');
  await ateParar(pg);
  igual((await estado(pg)).aradas, aradasAntes + 1, 'Espaço ara a casa destacada à frente dela');
  await pg.keyboard.press('Digit1');

  // ---- gravar e recarregar
  await J(pg, () => window.__jogo.gravar());
  const gravado = await estado(pg);
  await pg.reload();
  await pronto(pg);
  e = await estado(pg);
  igual(e.ouro, gravado.ouro, 'recarregar a página traz o ouro gravado');
  igual(e.nivel, gravado.nivel, 'recarregar traz o nível');
  igual(e.aradas, gravado.aradas, 'recarregar traz a terra arada');
  igual(JSON.stringify(e.feitas), JSON.stringify(gravado.feitas), 'recarregar traz as missões cumpridas');
  igual(JSON.stringify(e.bolsa), JSON.stringify(gravado.bolsa), 'recarregar traz a bolsa');
  semErros(a, '1280x720');
  await a.ctx.close();

  // =====================================================================================================
  console.log('844x390, celular deitado, toque');
  a = await abrir(844, 390, { toque: true, dpr: 2 });
  pg = a.pg;
  let cdp = await a.ctx.newCDPSession(pg);
  igual(await J(pg, () => window.__jogo.medidas().emPe), false, 'deitado: o palco não gira');
  confere(await J(pg, () => !document.querySelector('.alavanca').hidden && !document.querySelector('.agir').hidden), 'no toque, a alavanca e o botão de ação aparecem (esquema "os dois")');
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
  // as peças do HUD não ficam umas em cima das outras nem saem da tela
  const sobre = await J(pg, () => {
    const nomes = ['.topo-esq', '.topo-dir', '.balao', '.modos', '.alavanca:not(.solta)', '.agir', '.linha-info'], cx = [];
    for (const s of nomes) { const e = document.querySelector(s); if (e && !e.hidden && e.offsetParent) { const r = e.getBoundingClientRect(); if (r.width > 0) cx.push([s, r]); } }
    const ruins = [];
    for (const [s, r] of cx) if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) ruins.push(`${s} sai da tela`);
    for (let i = 0; i < cx.length; i++) for (let k = i + 1; k < cx.length; k++) { const a = cx[i][1], b = cx[k][1]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) ruins.push(`${cx[i][0]} em cima de ${cx[k][0]}`); }
    return ruins;
  });
  confere(sobre.length === 0, 'celular deitado: ' + sobre.join('; '));
  await foto(pg, '05-celular-deitado.jpg');

  // toque no botão de modo e toque numa casa
  await J(pg, () => window.__jogo.olhar(27.5, 52));
  let c = await centroDe(pg, '.modo[data-modo="enxada"]');
  await dedo(cdp, [[c.x, c.y]]);
  igual((await estado(pg)).modo.id, 'enxada', 'o toque no botão escolhe a enxada');
  let p = await pontoDaCasa(pg, 27, 52);
  await dedo(cdp, [[p.x, p.y]]);
  await ateParar(pg);
  igual((await estado(pg)).aradas, 1, 'um toque na casa ara');
  // arrastar com a enxada pinta as casas
  await J(pg, () => window.__jogo.olhar(27.5, 52));
  const de = await pontoDaCasa(pg, 26, 51), ate = await pontoDaCasa(pg, 28, 51), caminho = [];
  for (let k = 0; k <= 8; k++) caminho.push([de.x + ((ate.x - de.x) * k) / 8, de.y + ((ate.y - de.y) * k) / 8]);
  await dedo(cdp, caminho);
  confere((await estado(pg)).personagem.fila + 1 >= 3, 'arrastar o dedo com a enxada enfileira as casas por onde passa');
  await ateParar(pg);
  igual((await estado(pg)).aradas, 4, 'as três casas pintadas ficam aradas');
  // no modo mão, arrastar o dedo anda como alavanca
  c = await centroDe(pg, '.modo[data-modo="mao"]');
  await dedo(cdp, [[c.x, c.y]]);
  const p0 = (await estado(pg)).personagem;
  await J(pg, () => window.__jogo.seguir());
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 420, y: 200, id: 1 }] });
  for (let k = 1; k <= 6; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 420 + k * 10, y: 200, id: 1 }] }); await esperar(15); }
  confere(await J(pg, () => !document.querySelector('.alavanca.solta').hidden), 'arrastar no modo mão mostra a alavanca solta');
  await J(pg, () => window.__jogo.avancar(0.7));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await J(pg, () => window.__jogo.avancar(0.3));
  const p1 = (await estado(pg)).personagem;
  confere(p1.x - p0.x > 0.4 && p1.z - p0.z < -0.4, 'arrastar para a direita anda para a direita da tela');
  confere(!p1.ocupada, 'soltar o dedo para a personagem');
  // pinça: dois dedos se afastando aproximam a câmera
  const z0 = await J(pg, () => window.__jogo.medidas().E);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 380, y: 200, id: 1 }, { x: 460, y: 200, id: 2 }] });
  for (let k = 1; k <= 6; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 380 - k * 12, y: 200, id: 1 }, { x: 460 + k * 12, y: 200, id: 2 }] }); await esperar(15); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await esperar(100);
  const z1 = await J(pg, () => window.__jogo.medidas().E);
  confere(z1 > z0 * 1.3, `a pinça dá zoom (de ${z0.toFixed(1)} para ${z1.toFixed(1)})`);
  await esperar(1100);
  confere(await J(pg, () => window.__jogo.J.prefs.zoom > 1.2), 'o zoom escolhido fica guardado nas preferências');
  // botão de ação: age na casa à frente dela
  await J(pg, () => { const j = window.__jogo; j.comando({ tipo: 'irPara', x: 30.5, z: 53.5 }); j.ateParar(); j.comando({ tipo: 'rumar', dx: -1, dz: 0 }); j.avancar(0.2); j.comando({ tipo: 'frear' }); j.comando({ tipo: 'escolherModo', modo: 'enxada' }); j.desenhar(); });
  const ar0 = (await estado(pg)).aradas;
  c = await centroDe(pg, '.agir');
  await dedo(cdp, [[c.x, c.y]]);
  await ateParar(pg);
  igual((await estado(pg)).aradas, ar0 + 1, 'o botão de ação ara a casa à frente dela');
  // painel no celular: cabe na tela e fecha tocando fora
  c = await centroDe(pg, '.topo-dir [data-painel="loja"]');
  await dedo(cdp, [[c.x, c.y]]);
  igual(await J(pg, () => window.__jogo.painelAberto()), 'loja', 'o toque abre a loja no celular');
  confere(await J(pg, () => { const r = document.querySelector('.veu .cartao').getBoundingClientRect(); return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; }), 'o painel da loja cabe na tela do celular');
  await dedo(cdp, [[6, 200]]);
  igual(await J(pg, () => window.__jogo.painelAberto()), null, 'tocar fora do painel fecha');
  semErros(a, '844x390');
  await a.ctx.close();

  // =====================================================================================================
  console.log('390x844, celular em pé (o jogo gira)');
  a = await abrir(390, 844, { toque: true, dpr: 2 });
  pg = a.pg;
  cdp = await a.ctx.newCDPSession(pg);
  const med = await J(pg, () => window.__jogo.medidas());
  confere(med.emPe && med.w === 844 && med.h === 390, `em pé o palco gira e fica deitado (veio ${med.w}x${med.h}, emPe=${med.emPe})`);
  await foto(pg, '06-celular-em-pe.jpg');
  confere(await J(pg, () => { const d = document.querySelector('.deitar'); return document.body.classList.contains('em-pe') && !!d; }), 'em pé aparece o aviso para deitar o celular');
  await J(pg, () => window.__jogo.olhar(27.5, 52));
  c = await centroDe(pg, '.modo[data-modo="enxada"]');
  await dedo(cdp, [[c.x, c.y]]);
  igual((await estado(pg)).modo.id, 'enxada', 'em pé, o toque no botão girado escolhe a enxada');
  p = await pontoDaCasa(pg, 27, 52);
  await dedo(cdp, [[p.x, p.y]]);
  await ateParar(pg);
  e = await estado(pg);
  igual(e.aradas, 1, 'em pé, o toque cai na casa certa (coordenadas corrigidas)');
  semErros(a, '390x844');
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
