// Confere o jogo montado (dist/) num Chromium sem janela, com cliques, toques e teclas de verdade:
//   1280x720 (computador: mouse e teclado), 844x390 (celular deitado, toque) e 390x844 (celular em pé, girado).
// Joga o começo (arar, semear, encher o regador, regar, avançar o relógio, colher, vender, comprar), confere a tela
// de subida de nível, os painéis, o foco pelas setas, gravar e recarregar, exportar e importar, e que não há erro
// no console. No fim, abre o jogo sem #teste para conferir a tela de carregando (aparece, anda com rede lenta, some
// sozinha, não deixa nada por cima, o erro quando o main.js não chega; fotos carga-*.jpg).
// Grava as capturas em capturas/ (JPEG). Termina com "Tudo certo." ou com a lista das falhas.
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
  const r = await pg.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); const r = e.getBoundingClientRect(); /* painel mais alto que a tela: rola até o botão */ return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, seletor);
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

// ---------- a tela de carregando (index.html e src/ui/carregando.js): o jogo aberto sem #teste ----------
// opc.segurar: o main.js só chega quando chamar solta(); opc.atraso(url) = ms de espera de cada arquivo (rede lenta);
// opc.falhar: o main.js não chega
async function abrirCarga(w, h, opc = {}) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: !!opc.toque, isMobile: !!opc.toque });
  const pg = await ctx.newPage();
  const erros = [];
  pg.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  pg.on('pageerror', (e) => erros.push('exceção: ' + e.message));
  let solta = () => {};
  const segura = opc.segurar ? new Promise((r) => { solta = r; }) : null;
  await pg.route('**/*', async (r) => {
    const u = r.request().url().slice(srv.url.length);
    if (u === 'main.js' && opc.falhar && !pg.__deixar) return r.abort();
    if (u === 'main.js' && segura) await segura;
    const ms = opc.atraso ? opc.atraso(u) : 0;
    if (ms) await esperar(ms);
    return r.continue();
  });
  // o andar da barra, de 100 em 100 ms, e o evento de quando a tela sai
  await ctx.addInitScript(() => {
    window.__amostras = [];
    window.addEventListener('jogo-carregou', () => { window.__carregouEm = performance.now(); });
    const olhar = () => { const b = document.querySelector('#carga .carga-barra'); if (b) window.__amostras.push(+b.getAttribute('aria-valuenow')); if (!window.__carregouEm) setTimeout(olhar, 100); };
    setTimeout(olhar, 30);
  });
  await pg.goto(srv.url, { waitUntil: 'commit' });
  await pg.waitForSelector('#carga', { timeout: 10000 });
  return { ctx, pg, erros, solta, w, h };
}
const carga = (pg) => pg.evaluate(() => {
  const c = document.getElementById('carga');
  if (!c) return null;
  const r = c.getBoundingClientRect(), b = c.querySelector('.carga-barra'), i = b.querySelector('i'), d = c.querySelector('.carga-dica');
  return {
    cobre: r.left <= 0 && r.top <= 0 && r.right >= innerWidth && r.bottom >= innerHeight && getComputedStyle(c).opacity === '1',
    placa: c.querySelector('.carga-placa').textContent, versao: c.querySelector('.carga-versao').textContent, dica: d.textContent,
    dicaAlta: d.getBoundingClientRect().height, barraAlta: b.getBoundingClientRect().height, placaLarga: c.querySelector('.carga-placa').getBoundingClientRect().width,
    valor: +b.getAttribute('aria-valuenow'), enchida: i.getBoundingClientRect().width / b.getBoundingClientRect().width,
    fundo: c.classList.contains('com-fundo'), qual: window.__cargaFundo, atributo: document.documentElement.dataset.carregando,
    erro: !c.querySelector('.carga-erro').hidden ? c.querySelector('.carga-erro').textContent.replace(/\s+/g, ' ').trim() : null,
    erroAlto: c.querySelector('.carga-erro').getBoundingClientRect().height,
  };
});

async function telaDeCarregando() {
  // 1. aparece na hora (o main.js ainda não chegou), com o fundo, a placa, a versão, a barra e uma dica; a barra anda sozinha até uns 30%
  for (const [w, h, toque] of [[844, 390, true], [1280, 720, false], [1920, 1080, false]]) {
    const t = await abrirCarga(w, h, { toque, segurar: true });
    await t.pg.waitForFunction(() => document.querySelector('#carga.com-fundo'), null, { timeout: 10000 }).catch(() => {});
    await esperar(900);
    let c = await carga(t.pg);
    confere(c && c.cobre, `${w}x${h}: a tela de carregando aparece antes do main.js e cobre a tela`);
    if (!c) { await t.ctx.close(); continue; }
    igual(c.placa, 'Fazenda', `${w}x${h}: a placa diz o nome do jogo`);
    igual(c.versao, 'Versão de teste', `${w}x${h}: a linha da versão de teste`);
    confere(c.dica.length > 10, `${w}x${h}: mostra uma dica (veio "${c.dica}")`);
    confere(c.fundo, `${w}x${h}: o fundo desenhado chegou`);
    igual(c.qual, toque ? 'carregando/fundo-m.js' : 'carregando/fundo.js', `${w}x${h}: o fundo ${toque ? 'leve (celular)' : 'inteiro'}`);
    igual(c.atributo, '1', `${w}x${h}: o <html> marca data-carregando enquanto a tela está à vista`);
    const a1 = c.valor;
    await esperar(800);
    c = await carga(t.pg);
    confere(a1 > 0 && c.valor > a1 && c.valor <= 30, `${w}x${h}: enquanto o main.js baixa, a barra anda devagar até uns 30% (veio ${a1}% e depois ${c.valor}%)`);
    // a foto com a barra pela metade
    await t.pg.evaluate(() => window.__carga.andar(0.5));
    await esperar(600);
    c = await carga(t.pg);
    confere(Math.abs(c.enchida - 0.5) < 0.06, `${w}x${h}: com 50%, a barra fica pela metade (veio ${(c.enchida * 100).toFixed(0)}%)`);
    const esc = Math.max(1, Math.min(w / 1100, h / 560, 2.4));
    confere(c.placaLarga >= 290 * esc && c.barraAlta >= 26 * esc, `${w}x${h}: a placa e a barra crescem com a tela (placa ${c.placaLarga.toFixed(0)} px, barra ${c.barraAlta.toFixed(0)} px)`);
    await t.pg.screenshot({ path: path.join(capturas, `carga-${w}x${h}.jpg`), type: 'jpeg', quality: 86 });
    // o main.js chega: a barra passa dos 35% e a tela some sozinha, com tudo da primeira cena carregado
    t.solta();
    await t.pg.waitForFunction(() => !document.getElementById('carga'), null, { timeout: 25000 }).catch(() => {});
    const fim = await t.pg.evaluate(() => ({
      foi: !document.getElementById('carga'), evento: window.__carregouEm || 0, atributo: document.documentElement.dataset.carregando,
      arte: window.__jogo && window.__jogo.atlas.paginas.filter((p) => p.estado !== 'nao').every((p) => p.estado === 'pronta'),
      por: [[0.5, 0.5], [0.05, 0.05], [0.95, 0.05], [0.05, 0.95], [0.95, 0.95]].map(([x, y]) => { const e = document.elementFromPoint(innerWidth * x, innerHeight * y); return e ? (e.closest('#carga') ? 'carga' : e.id || e.className || e.tagName) : 'nada'; }),
    }));
    confere(fim.foi, `${w}x${h}: a tela de carregando some sozinha depois que o main.js chega`);
    confere(fim.arte, `${w}x${h}: quando ela some, a arte que a primeira cena pediu já chegou`);
    confere(fim.evento > 0 && fim.atributo === undefined, `${w}x${h}: ao sumir, tira o data-carregando e avisa com o evento "jogo-carregou"`);
    confere(!fim.por.includes('carga') && fim.por[0] === 'tela', `${w}x${h}: nada da tela de carregando fica por cima do jogo (no meio e nos cantos: ${fim.por.join(', ')})`);
    semErros(t, `tela de carregando ${w}x${h}`);
    await t.ctx.close();
  }

  // 2. rede lenta: a barra anda conforme o que chega (o main.js, depois as páginas de arte e as molduras) e a tela fica pelo menos 0,8 s
  const lenta = await abrirCarga(1280, 720, { atraso: (u) => (u === 'main.js' ? 1500 : /^arte\//.test(u) ? 300 + ((u.length * 37) % 600) : /^molduras\//.test(u) ? 150 : 0) });
  await lenta.pg.waitForFunction(() => !document.getElementById('carga'), null, { timeout: 30000 }).catch(() => {});
  const r = await lenta.pg.evaluate(() => ({ foi: !document.getElementById('carga'), amostras: window.__amostras, em: window.__carregouEm || 0 }));
  const passos = [...new Set(r.amostras)];
  confere(r.foi, 'rede lenta: a tela some sozinha');
  confere(passos.filter((v) => v > 0 && v <= 30).length >= 3 && passos.filter((v) => v > 35 && v < 100).length >= 2 && passos.includes(100),
    `rede lenta: a barra anda aos poucos até 30% e depois conforme chega a arte, até 100% (passou por ${passos.join(', ')})`);
  confere(r.amostras.every((v, i) => !i || v >= r.amostras[i - 1]), 'rede lenta: a barra nunca volta');
  semErros(lenta, 'tela de carregando, rede lenta');
  await lenta.ctx.close();
  // rede rápida: não pisca (fica uns 0,8 s) e não segura além disso
  const rapida = await abrirCarga(1280, 720);
  await rapida.pg.waitForFunction(() => !document.getElementById('carga'), null, { timeout: 20000 }).catch(() => {});
  const em = await rapida.pg.evaluate(() => window.__carregouEm || 0);
  confere(em >= 800 && em < 6000, `rede rápida: a tela fica pelo menos 0,8 s e sai logo depois (saiu com ${(em / 1000).toFixed(2)} s)`);
  semErros(rapida, 'tela de carregando, rede rápida');
  await rapida.ctx.close();

  // 3. o main.js não chega: a tela troca a barra pelo aviso, e o toque recarrega (desta vez dá certo)
  const ruim = await abrirCarga(844, 390, { toque: true, falhar: true });
  await ruim.pg.waitForSelector('#carga .carga-erro:not([hidden])', { timeout: 10000 }).catch(() => {});
  await esperar(400);
  const ce = await carga(ruim.pg);
  igual(ce && ce.erro, 'Não deu para carregar. Toque para tentar de novo.', 'sem o main.js, a tela diz que não deu para carregar');
  confere(ce && ce.erroAlto >= 44, `o aviso de erro tem pelo menos 44 px de altura para o toque (veio ${ce && ce.erroAlto.toFixed(0)})`);
  await ruim.pg.screenshot({ path: path.join(capturas, 'carga-erro.jpg'), type: 'jpeg', quality: 86 });
  ruim.pg.__deixar = true;
  await ruim.pg.touchscreen.tap(422, 120);
  await ruim.pg.waitForFunction(() => window.__jogo && window.__jogo.pronto && !document.getElementById('carga'), null, { timeout: 20000 }).catch(() => {});
  confere(await ruim.pg.evaluate(() => !!(window.__jogo && window.__jogo.pronto) && !document.getElementById('carga')), 'o toque no aviso de erro recarrega a página, e o jogo abre');
  await ruim.ctx.close();
}

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

  // ---- no começo humilde a primeira missão é conversar com o Seu Tonho: um clique nele
  if (e.missao.id === 'falar-com-tonho') {
    await J(pg, () => { const v = window.__jogo.mundo.local.porId.vizinho; window.__jogo.olhar(v.x + 0.5, v.z + 0.5); });
    const tonho = await J(pg, () => window.__jogo.daEntidade('vizinho', 0.9));
    await pg.mouse.click(tonho.x, tonho.y);
    await ateParar(pg);
    igual((await estado(pg)).missao.id, 'preparar-a-terra', 'o clique no Seu Tonho é a conversa, e vem a missão de arar');
  }

  // ---- arar: um clique em cada casa do campo (a ação de uma casa do campo é arar: ela pega a enxada sozinha)
  await J(pg, () => window.__jogo.olhar(27.5, 52));
  confere(await J(pg, () => !document.querySelector('.modo[data-modo]') && !!document.querySelector('.vaga-mao')), 'embaixo fica a vaga "Na mão", sem a barra de modos');
  // o mouse em cima de uma casa do campo: o contorno fica dourado e o balãozinho mostra a enxada em cima dela
  const pc = await pontoDaCasa(pg, 26, 51);
  await pg.mouse.move(pc.x, pc.y);
  await esperar(450);
  await J(pg, () => window.__jogo.desenhar());
  const bal = await J(pg, () => { const b = document.querySelector('.balao-acao'), r = b.getBoundingClientRect(); return { visivel: !b.hidden, chave: b.querySelector('canvas').dataset.chave, cor: window.__jogo.cena.destaque.cor, x: r.left + r.width / 2, baixo: r.bottom }; });
  confere(bal.visivel, 'o mouse numa casa do campo mostra o balãozinho da ação');
  confere(/enxada/.test(bal.chave || ''), `o balãozinho do campo mostra a enxada (veio "${bal.chave}")`);
  igual(bal.cor, '#ffe07a', 'a casa com ação fica com o contorno dourado');
  confere(Math.abs(bal.x - pc.x) < 30 && bal.baixo < pc.y + 4, 'o balãozinho fica em cima da casa apontada');
  for (const [x, z] of CAMPO) await clicarCasa(x, z);
  confere((await estado(pg)).personagem.fila >= 5, 'os cliques nas casas enfileiram as tarefas');
  confere(await J(pg, () => !document.querySelector('.fila').hidden), 'a fila de tarefas aparece na tela');
  await ateParar(pg);
  e = await estado(pg);
  igual(e.aradas, 6, 'seis casas aradas');
  igual(e.missao.id, 'plantar-alface', 'a missão de arar foi cumprida e veio a de plantar');
  igual(e.modo.id, 'mao', 'por dentro, o jogo fica sempre no jeito "mão" (a ação vem do alvo)');

  // ---- semear: a vaga mostra a semente na mão e a conta; um clique em cada casa arada planta o que está na mão
  const vg = await J(pg, () => { const v = document.querySelector('.vaga-mao'); return { chave: v.querySelector('canvas').dataset.chave, texto: v.textContent.replace(/\s+/g, ' ').trim() }; });
  const naMao = (vg.chave || '').replace(/^icone\//, '');
  confere(/^semente-/.test(naMao) && e.bolsa[naMao] > 0, `a vaga mostra uma semente da bolsa (veio "${vg.chave}")`);
  confere(vg.texto.includes('×' + e.bolsa[naMao]), `a vaga mostra quantas há (${vg.texto})`);
  const pa = await pontoDaCasa(pg, 26, 51);
  await pg.mouse.move(pa.x, pa.y);
  await esperar(450);
  confere(await J(pg, (it) => { const b = document.querySelector('.balao-acao'); return !b.hidden && b.querySelector('canvas').dataset.chave === 'icone/' + it; }, naMao), 'na terra arada, o balãozinho mostra a semente da mão');
  for (const [x, z] of CAMPO) await clicarCasa(x, z);
  await ateParar(pg);
  e = await estado(pg);
  igual(e.plantas.length, 6, 'seis casas semeadas');
  confere(e.plantas.every((p) => p.estado === 'sede'), 'planta recém-semeada pede água');
  const resta = e.bolsa[naMao] || 0, vg2 = await J(pg, () => document.querySelector('.vaga-mao').textContent);
  confere(resta > 0 ? vg2.includes('×' + resta) : !vg2.includes('×' + (vg.texto.match(/×(\d+)/) || [])[1]), `a conta da vaga acompanha as sementes gastas (ficou "${vg2}")`);

  // ---- encher o regador no poço e regar (a ação de uma planta com sede é regar); a água acaba e é preciso voltar ao poço
  const poco = await pontoDaEntidade(pg, 'poco');
  await pg.mouse.click(poco.x, poco.y);
  await ateParar(pg);
  e = await estado(pg);
  const regador = Object.keys(e.ferramentas).find((k) => /regador/.test(k));
  const cabe = await J(pg, (k) => window.__jogo.dados.itens[k].capacidade, regador);
  igual(e.ferramentas[regador].agua, cabe, 'o regador enche no poço');
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
  // a tela de subida de nível, quando aparece: confere, fotografa (só a primeira) e fecha com Enter
  let subiu = false;
  async function telaDeSubida() {
    for (let k = 0; k < 6 && (await J(pg, () => window.__jogo.subidaAberta())); k++) {
      await esperar(900);
      if (!subiu) await pg.screenshot({ path: path.join(capturas, '04-subida-de-nivel.jpg'), type: 'jpeg', quality: 82 });
      subiu = true;
      confere(await J(pg, () => /n[íi]vel/i.test(document.querySelector('.subida').textContent) && !!document.querySelector('.subida .numero')), 'a tela de subida mostra o nível novo');
      confere(await J(pg, () => document.querySelectorAll('.avisos .aviso').length === 0), 'com a tela de subida aberta, nenhum aviso aparece por cima dela');
      await pg.keyboard.press('Enter');
      await esperar(120);
    }
    confere(!(await J(pg, () => window.__jogo.subidaAberta())), 'Enter fecha a tela de subida de nível');
    confere(await J(pg, () => document.querySelectorAll('.avisos .aviso:not(.sai)').length <= 2), 'nunca há mais de dois avisos empilhados');
  }
  await telaDeSubida();
  if (!subiu) console.log('  (o nível 2 não veio na colheita; confiro depois da venda e da compra)');

  // ---- vender na banca
  const ouroAntes = (await estado(pg)).ouro;
  await J(pg, () => window.__jogo.seguir());
  await J(pg, () => { const e = window.__jogo.mundo.local.porId.banca; window.__jogo.olhar(e.x + 1.5, e.z - 2); });
  const banca = await pontoDaEntidade(pg, 'banca');
  await pg.mouse.click(banca.x, banca.y);
  await ateParar(pg);
  // (no começo humilde a "banca" é o caixote: ela põe o cesto nele e quem passa leva, uma coisa de cada vez)
  if (await J(pg, () => window.__jogo.mundo.local.porId.banca.tipo === 'caixote-de-venda')) await J(pg, () => window.__jogo.avancar(8));
  e = await estado(pg);
  confere(e.ouro > ouroAntes, `vender na banca dá ouro (tinha ${ouroAntes}, ficou com ${e.ouro})`);
  igual(e.noCesto, 0, 'o cesto fica vazio depois da venda');
  await telaDeSubida();

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
  await telaDeSubida();
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

  // ---- a vaga "Na mão" com duas sementes: os números e Q/E trocam o que vai na mão
  const outra = await J(pg, () => {
    const j = window.__jogo, D = j.dados, m = j.mundo;
    const id = Object.keys(D.culturaDaSemente).find((s) => D.itens[s] && D.itens[s].compra && D.culturas[D.culturaDaSemente[s]].nivel <= m.progresso.nivel && !(m.posses.bolsa[s] > 0));
    if (!id) return null;
    if (!j.comando({ tipo: 'comprar', item: id, n: 2 }).ok) m.posses.bolsa[id] = 2; // (sem ouro: põe na bolsa direto)
    return id;
  });
  confere(!!outra, 'há uma segunda semente para pôr na mão');
  const lista = await J(pg, () => { const j = window.__jogo; return Object.keys(j.estado().bolsa).filter((s) => j.estado().bolsa[s] > 0 && j.dados.culturaDaSemente[s]); });
  const naMaoAgora = async () => (await J(pg, () => document.querySelector('.vaga-mao canvas').dataset.chave)).replace(/^icone\//, '');
  await pg.keyboard.press('Digit2');
  await J(pg, () => window.__jogo.desenhar());
  const segunda = await naMaoAgora();
  confere(segunda !== naMao && lista.includes(segunda), `a tecla 2 põe a segunda semente na mão (veio "${segunda}")`);
  await pg.keyboard.press('KeyQ');
  await J(pg, () => window.__jogo.desenhar());
  igual(await naMaoAgora(), naMao, 'Q volta para a semente anterior');
  await pg.keyboard.press('KeyE');
  await J(pg, () => window.__jogo.desenhar());
  igual(await naMaoAgora(), segunda, 'E passa para a próxima');
  igual((await estado(pg)).modo.semente, segunda, 'a escolha da vaga fica no mundo (vai na gravação)');

  // ---- menu pelo teclado (TV): Tab leva o foco à vaga, Enter abre a fileira das sementes, as setas andam, Enter escolhe,
  //      Esc volta
  await pg.keyboard.press('Tab');
  confere(await J(pg, () => window.__jogo.medidas().menu), 'Tab abre o menu (foco nos botões da tela)');
  confere(await J(pg, () => document.activeElement && document.activeElement.classList.contains('vaga-mao')), 'no menu, o foco começa na vaga "Na mão"');
  await pg.keyboard.press('Enter');
  await esperar(60);
  confere(await J(pg, () => !document.querySelector('.lista-mao').hidden && document.querySelectorAll('.lista-mao .carta-mao[data-item]').length >= 2 && !!document.querySelector('.lista-mao [data-k="comprar-sementes"]')), 'Enter na vaga abre a fileira com as sementes e o "Comprar"');
  confere(await J(pg, () => document.activeElement && document.activeElement.classList.contains('ativo')), 'na fileira, o foco começa na semente que está na mão');
  await foto(pg, '02b-vaga-aberta.jpg');
  // a outra semente: a seta para o lado e Enter
  const ordem = await J(pg, () => [...document.querySelectorAll('.lista-mao .carta-mao[data-item]')].map((b) => b.dataset.item));
  await pg.keyboard.press(ordem.indexOf(naMao) < ordem.indexOf(segunda) ? 'ArrowLeft' : 'ArrowRight');
  igual(await J(pg, () => document.activeElement && document.activeElement.dataset.item), naMao, 'a seta leva o foco à outra semente');
  await pg.keyboard.press('Enter');
  await esperar(60);
  igual(await naMaoAgora(), naMao, 'Enter na semente focada põe ela na mão');
  confere(await J(pg, () => document.querySelector('.lista-mao').hidden), 'escolher fecha a fileira');
  confere(await J(pg, () => window.__jogo.medidas().menu && document.activeElement && document.activeElement.classList.contains('vaga-mao')), 'depois de escolher, o foco volta para a vaga');
  // Esc fecha a fileira sem trocar, e Esc de novo sai do menu
  await pg.keyboard.press('Enter');
  await esperar(60);
  await pg.keyboard.press('Escape');
  confere(await J(pg, () => document.querySelector('.lista-mao').hidden), 'Esc fecha a fileira da vaga');
  igual(await naMaoAgora(), naMao, 'fechar a fileira não troca o que está na mão');
  await pg.keyboard.press('Escape');
  confere(!(await J(pg, () => window.__jogo.medidas().menu)), 'Esc sai do menu');
  // com o mouse: o "Comprar" da fileira abre a loja na aba das sementes
  await clicarEm('.vaga-mao');
  confere(await J(pg, () => !document.querySelector('.lista-mao').hidden), 'o clique na vaga abre a fileira');
  await clicarEm('.lista-mao [data-k="comprar-sementes"]');
  igual(await J(pg, () => window.__jogo.painelAberto()), 'loja', 'o "Comprar" da fileira abre a loja');
  confere(await J(pg, () => !!document.querySelector('.veu [data-k="aba-sementes"].ativo') && !!document.querySelector('.veu .oferta[data-item^="semente-"]')), 'a loja abre na aba das sementes');
  await pg.keyboard.press('Escape');
  // o clique fora da fileira fecha (e não vira ordem para ela)
  await clicarEm('.vaga-mao');
  const filaAntes = (await estado(pg)).personagem.fila;
  const livre = await pontoDaCasa(pg, 30, 50);
  await pg.mouse.click(livre.x, livre.y);
  confere(await J(pg, () => document.querySelector('.lista-mao').hidden), 'o clique fora da fileira fecha');
  confere(!(await estado(pg)).personagem.ocupada && (await estado(pg)).personagem.fila === filaAntes, 'o clique que fechou a fileira não vira ordem');
  // sem sementes na bolsa, a vaga vira "Comprar sementes" e abre a loja
  const guardadas = await J(pg, () => { const B = window.__jogo.mundo.posses.bolsa, g = {}; for (const k in B) if (window.__jogo.dados.culturaDaSemente[k] || /^muda-/.test(k)) { g[k] = B[k]; delete B[k]; } window.__jogo.desenhar(); return g; });
  confere(await J(pg, () => { const v = document.querySelector('.vaga-mao'); return v.classList.contains('vazia') && /comprar sementes/i.test(v.textContent) && v.querySelector('canvas').dataset.chave === 'ui/comprar-sementes'; }), 'sem sementes, a vaga vira "Comprar sementes"');
  await clicarEm('.vaga-mao');
  igual(await J(pg, () => window.__jogo.painelAberto()), 'loja', 'sem sementes, a vaga abre a loja');
  await pg.keyboard.press('Escape');
  await J(pg, (g) => { Object.assign(window.__jogo.mundo.posses.bolsa, g); window.__jogo.desenhar(); }, guardadas);

  // ---- teclado: Espaço age na casa à frente dela (sem escolher ferramenta: a casa do campo se ara), com o contorno
  //      dourado nela e o desenho da ação no botão de agir
  await J(pg, () => { const j = window.__jogo; j.comando({ tipo: 'irPara', x: 30.5, z: 51.6 }); j.ateParar(); });
  await pg.keyboard.down('ArrowLeft'); await J(pg, () => window.__jogo.avancar(0.25)); await pg.keyboard.up('ArrowLeft');
  await esperar(300);
  await J(pg, () => window.__jogo.desenhar());
  const fr = await J(pg, () => { const j = window.__jogo, p = j.mundo.personagem, x = Math.floor(p.x + Math.sin(p.rumo) * 0.85), z = Math.floor(p.z + Math.cos(p.rumo) * 0.85), d = j.cena.destaque; return { x, z, dx: d.x, dz: d.z, cor: d.cor, agir: !document.querySelector('.agir').hidden, ic: document.querySelector('.agir canvas') && document.querySelector('.agir canvas').dataset.chave }; });
  confere(fr.dx === fr.x && fr.dz === fr.z, `nas teclas, o destaque fica na casa à frente dela (${fr.x}, ${fr.z}; veio ${fr.dx}, ${fr.dz})`);
  confere(await J(pg, ([x, z]) => window.__jogo.mundo.local.chao[z * window.__jogo.mundo.local.l + x] === 6, [fr.x, fr.z]), `a casa à frente dela é do campo, sem arar (${fr.x}, ${fr.z})`);
  igual(fr.cor, '#ffe07a', 'a casa à frente, com ação, fica com o contorno dourado');
  confere(fr.agir && /enxada/.test(fr.ic || ''), `nas teclas aparece o botão de agir com o desenho da ação (veio "${fr.ic}")`);
  const aradasAntes = (await estado(pg)).aradas;
  await pg.keyboard.press('Space');
  await ateParar(pg);
  igual((await estado(pg)).aradas, aradasAntes + 1, 'Espaço ara a casa destacada à frente dela');

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
    const nomes = ['.topo-esq', '.topo-dir', '.balao', '.vaga-mao', '.alavanca:not(.solta)', '.agir', '.linha-info'], cx = [];
    for (const s of nomes) { const e = document.querySelector(s); if (e && !e.hidden && e.offsetParent) { const r = e.getBoundingClientRect(); if (r.width > 0) cx.push([s, r]); } }
    const ruins = [];
    for (const [s, r] of cx) if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) ruins.push(`${s} sai da tela`);
    for (let i = 0; i < cx.length; i++) for (let k = i + 1; k < cx.length; k++) { const a = cx[i][1], b = cx[k][1]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) ruins.push(`${cx[i][0]} em cima de ${cx[k][0]}`); }
    return ruins;
  });
  confere(sobre.length === 0, 'celular deitado: ' + sobre.join('; '));
  await foto(pg, '05-celular-deitado.jpg');

  // toque numa casa do campo: com o dedo encostado aparece o balãozinho da ação (a enxada); a ação vem ao soltar
  await J(pg, () => window.__jogo.olhar(27.5, 52));
  let c, p = await pontoDaCasa(pg, 27, 52);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p.x, y: p.y, id: 1 }] });
  await esperar(220); // (menos que o tempo de segurar: segurando, o campo faz a fileira inteira)
  await J(pg, () => window.__jogo.desenhar());
  const bt = await J(pg, () => { const b = document.querySelector('.balao-acao'); return { visivel: !b.hidden, chave: b.querySelector('canvas').dataset.chave, fila: window.__jogo.estado().personagem.fila, ocupada: window.__jogo.ocupada() }; });
  confere(bt.visivel && /enxada/.test(bt.chave || ''), `com o dedo encostado no campo, aparece o balãozinho da enxada (veio ${bt.visivel ? bt.chave : 'nada'})`);
  confere(!bt.ocupada && bt.fila === 0, 'com o dedo ainda encostado, nada acontece');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await esperar(60);
  await ateParar(pg);
  igual((await estado(pg)).aradas, 1, 'soltar o dedo na casa do campo ara');
  // arrastar a partir de uma casa do campo repete a ação dela nas casas por onde o dedo passa
  await J(pg, () => window.__jogo.olhar(27.5, 52));
  const de = await pontoDaCasa(pg, 26, 51), ate = await pontoDaCasa(pg, 28, 51), caminho = [];
  for (let k = 0; k <= 8; k++) caminho.push([de.x + ((ate.x - de.x) * k) / 8, de.y + ((ate.y - de.y) * k) / 8]);
  await dedo(cdp, caminho);
  confere((await estado(pg)).personagem.fila + 1 >= 3, 'arrastar o dedo no campo enfileira as casas por onde passa');
  await ateParar(pg);
  igual((await estado(pg)).aradas, 4, 'as três casas pintadas ficam aradas');
  // arrastar por cima de plantas prontas não colhe (colher é só no toque): o arrasto vira alavanca
  await J(pg, () => {
    const j = window.__jogo, m = j.mundo, D = j.dados, B = m.posses.bolsa;
    const s = Object.keys(B).find((k) => B[k] > 0 && D.culturaDaSemente[k]) || 'semente-rabanete';
    if (!(B[s] >= 3)) B[s] = 3;
    j.comando({ tipo: 'naMao', item: s });
    for (const [x, z] of [[26, 51], [27, 51], [28, 51]]) j.comando({ tipo: 'agirNoAlvo', x, z });
    j.ateParar();
    const reg = Object.keys(m.posses.ferramentas).find((k) => /regador/.test(k));
    m.posses.ferramentas[reg].agua = D.itens[reg].capacidade || 6;
    for (const [x, z] of [[26, 51], [27, 51], [28, 51]]) { m.posses.ferramentas[reg].agua = Math.max(m.posses.ferramentas[reg].agua, 3); j.comando({ tipo: 'agirNoAlvo', x, z }); j.ateParar(); }
    j.pular(Math.max(...Object.values(D.culturas).map((c) => c.tempoSeg)) + 5);
    j.olhar(27.5, 52);
  });
  let e2 = await estado(pg);
  const prontas = e2.plantas.filter((q) => q.estado === 'pronta' && q.z === 51).length, cesto0 = Object.values(e2.cesto).reduce((a, b) => a + b, 0);
  igual(prontas, 3, 'três plantas prontas para o teste do arrasto');
  {
    const de2 = await pontoDaCasa(pg, 26, 51), ate2 = await pontoDaCasa(pg, 28, 51);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: de2.x, y: de2.y, id: 1 }] });
    for (let k = 1; k <= 8; k++) { await esperar(25); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: de2.x + ((ate2.x - de2.x) * k) / 8, y: de2.y + ((ate2.y - de2.y) * k) / 8, id: 1 }] }); }
    confere(await J(pg, () => !document.querySelector('.alavanca.solta').hidden), 'arrastar a partir de uma planta pronta mostra a alavanca (anda, não colhe)');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await J(pg, () => window.__jogo.avancar(1));
    await ateParar(pg);
  }
  e2 = await estado(pg);
  igual(e2.plantas.filter((q) => q.estado === 'pronta' && q.z === 51).length, 3, 'o arrasto por cima das plantas prontas não colhe nenhuma');
  igual(Object.values(e2.cesto).reduce((a, b) => a + b, 0), cesto0, 'nada entra no cesto com o arrasto');
  await J(pg, () => window.__jogo.olhar(27.5, 52));
  p = await pontoDaCasa(pg, 27, 51);
  await dedo(cdp, [[p.x, p.y]]);
  await ateParar(pg);
  e2 = await estado(pg);
  igual(e2.plantas.filter((q) => q.estado === 'pronta' && q.z === 51).length, 2, 'um toque na planta pronta colhe só ela');
  // arrastar a partir da grama anda como alavanca
  const grama = await J(pg, () => {
    const j = window.__jogo, m = j.mundo, loc = m.local, p = m.personagem;
    for (let r = 2; r < 8; r++) for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
      const x = Math.floor(p.x) + dx, z = Math.floor(p.z) + dz;
      if (!loc.dentro(x, z) || loc.chao[z * loc.l + x] !== 0 || loc.entidadeEm(x, z)) continue;
      let perto = false; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (loc.dentro(x + a, z + b) && loc.chao[(z + b) * loc.l + x + a] !== 0) perto = true;
      if (!perto) return [x, z];
    }
    return null;
  });
  await J(pg, () => window.__jogo.seguir());
  const g0 = grama ? await pontoDaCasa(pg, grama[0], grama[1]) : { x: 420, y: 200 };
  const p0 = (await estado(pg)).personagem;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: g0.x, y: g0.y, id: 1 }] });
  for (let k = 1; k <= 6; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: g0.x + k * 10, y: g0.y, id: 1 }] }); await esperar(15); }
  confere(await J(pg, () => !document.querySelector('.alavanca.solta').hidden), 'arrastar a partir da grama mostra a alavanca solta');
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
  await J(pg, () => { const j = window.__jogo; j.comando({ tipo: 'irPara', x: 30.5, z: 53.5 }); j.ateParar(); j.comando({ tipo: 'rumar', dx: -1, dz: 0 }); j.avancar(0.2); j.comando({ tipo: 'frear' }); j.desenhar(); });
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
  c = await centroDe(pg, '.vaga-mao');
  await dedo(cdp, [[c.x, c.y]]);
  confere(await J(pg, () => { const l = document.querySelector('.lista-mao'); if (l.hidden) return document.querySelector('.veu') !== null; const r = l.getBoundingClientRect(); return r.width > 0 && r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1; }), 'em pé, o toque na vaga girada abre a fileira (ou a loja), dentro da tela');
  await J(pg, () => { window.__jogo.acoes.fecharLista(); window.__jogo.fecharPainel(); });
  p = await pontoDaCasa(pg, 27, 52);
  await dedo(cdp, [[p.x, p.y]]);
  await ateParar(pg);
  e = await estado(pg);
  igual(e.aradas, 1, 'em pé, o toque cai na casa certa (coordenadas corrigidas)');
  semErros(a, '390x844');
  await a.ctx.close();

  // =====================================================================================================
  console.log('tela de carregando (o jogo aberto sem #teste): 844x390, 1280x720, 1920x1080, rede lenta e erro');
  await telaDeCarregando();
} catch (err) {
  falhas.push('a verificação parou: ' + (err && err.stack ? err.stack.split('\n').slice(0, 3).join(' ') : err));
  console.log('  ✗ ' + falhas[falhas.length - 1]);
}

await nav.close();
await srv.fechar();
console.log(`\n${feitos} conferências, ${falhas.length} falha(s). Capturas em ${path.relative(process.cwd(), capturas) || '.'}/`);
if (falhas.length) { console.log('\nFalhas:\n' + falhas.map((f) => ' - ' + f).join('\n')); process.exit(1); }
console.log('Tudo certo.');
