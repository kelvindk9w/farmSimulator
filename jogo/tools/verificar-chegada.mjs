// Confere a chegada do jogo novo (o começo humilde) no jogo montado, num Chromium sem janela, com cliques e toques de
// verdade: ela entra pela porteira de costas para a câmera, com a trouxa, até perto do Seu Tonho; no fim do caminho
// ela fala primeiro, em dois balões com o nome e o retrato dela (neutro, depois alegre, quando "+6 sementes de
// alface" sai da trouxa); depois ele acena e dá as boas-vindas; o botão "Pular" fica no canto e o balão fica
// escondido enquanto ela anda; pular (botão ou toque no chão) termina a cena na hora, e nada fica preso; no jogo de
// verdade (sem #teste) a cena começa sozinha (parada na porteira enquanto a tela de carregando estiver à vista) e
// não volta depois de gravar. Também a fazenda do começo: casa e poço velhos, caixote, baú, cerca de arame, sem
// celeiro, banca nem quadro; e a gravação de antes (testes/gravacoes) abrindo com a fazenda de antes, com a pergunta
// da versão de teste (uma vez só: "Agora não" deixa a fazenda de antes; "Sim" começa o jogo novo). Em 1280x720
// (mouse) e 844x390 (celular deitado, dedo). Fotos h-*.jpg (a chegada quadro a quadro). Termina com "Tudo certo." ou
// com a lista das falhas.
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
  if (opc.antes) await ctx.addInitScript(opc.antes);
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
// (a foto do balão como está, sem desenhar de novo: o desenho andaria a fala)
const retrato = async (pg, nome) => { await esperar(150); await pg.screenshot({ path: path.join(capturas, nome), type: 'jpeg', quality: 84 }); };
const cena = (pg) => J(pg, () => {
  const j = window.__jogo, m = j.mundo, C = m.comeco, p = m.personagem, loc = m.locais.fazenda, b = document.querySelector('.pular-chegada');
  const balao = document.querySelector('.balao'), quem = balao && balao.querySelector('.quem'), rosto = quem && quem.querySelector('canvas');
  return {
    chegada: !!C.chegada, chegou: C.chegou, x: p.x, z: p.z, rumo: p.rumo, fila: p.fila.length,
    dentro: loc.ehPropria(Math.floor(p.x), Math.floor(p.z)), acenou: !!C.acenouEm, falou: !!(C.chegada && C.chegada.falou),
    pular: !!b && !!b.offsetParent, balao: !!balao && !balao.hidden && getComputedStyle(balao).visibility !== 'hidden',
    fala: balao ? balao.querySelector('.fala').textContent : '', quem: quem ? quem.textContent : '', rosto: rosto ? rosto.dataset.chave : '',
    sementes: j.cena.part.textos.some((t) => t.t >= 0 && /^\+6 sementes de alface$/.test(t.texto)),
  };
});
const NOME = 'Rosa', FALA1 = /^Vim tentar a vida aqui\.$/, FALA2 = /^Trouxe minha enxada e umas sementes para começar\.$/, BOAS = /bem-vinda/i;
// desenha (no modo #teste, cada desenho anda 1 s das falas) até a fala casar com "re"; devolve as falas vistas, em ordem
async function falasAte(pg, re, max = 12) {
  const vistas = [];
  for (let k = 0; k < max; k++) {
    const c = await cena(pg);
    if (c.balao && (!vistas.length || vistas[vistas.length - 1].fala !== c.fala)) vistas.push({ fala: c.fala, quem: c.quem, rosto: c.rosto, sementes: c.sementes });
    if (re.test(c.fala)) break;
    await J(pg, () => window.__jogo.desenhar());
  }
  return vistas;
}
// a ordem certa: as duas falas dela (nome e retrato dela; as sementes saem da trouxa com a segunda), depois as boas-vindas dele
function conferirFalas(vistas, onde) {
  const i1 = vistas.findIndex((v) => FALA1.test(v.fala)), i2 = vistas.findIndex((v) => FALA2.test(v.fala)), i3 = vistas.findIndex((v) => BOAS.test(v.fala));
  const resumo = vistas.map((v) => `${v.quem}/${v.rosto}: ${v.fala.slice(0, 30)}`).join(' | ');
  if (!confere(i1 >= 0 && i2 > i1 && i3 > i2, `${onde}: ela fala primeiro (dois balões) e o Seu Tonho responde (veio ${resumo})`)) return;
  confere(vistas[i1].quem === NOME && vistas[i1].rosto === 'retrato/personagem', `${onde}: o primeiro balão é dela, com o nome e o retrato neutro (${vistas[i1].quem}, ${vistas[i1].rosto})`);
  confere(vistas[i2].quem === NOME && vistas[i2].rosto === 'retrato/personagem-alegre' && vistas[i2].sementes, `${onde}: no segundo, o retrato alegre e "+6 sementes de alface" saindo da trouxa (${vistas[i2].rosto}, sementes ${vistas[i2].sementes})`);
  confere(vistas[i3].quem === 'Seu Tonho' && vistas[i3].rosto === 'retrato/seu-tonho-alegre', `${onde}: as boas-vindas com o nome e o retrato alegre dele (${vistas[i3].quem}, ${vistas[i3].rosto})`);
}
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
  confere(r.ok && r.dados.seg > 7 && r.dados.seg < 14, `a cena começa e dura alguns segundos (veio ${JSON.stringify(r)})`);
  await J(pg, () => window.__jogo.seguir());
  let c = await cena(pg);
  confere(c.chegada && !c.dentro, 'ela começa do lado de fora da cerca');
  confere(c.pular, 'o botão "Pular" aparece no canto');
  confere(!c.balao, 'o balão fica escondido enquanto ela anda');
  confere(Math.abs(Math.cos(c.rumo) + 1) < 0.2, `ela entra de costas para a câmera, andando para o fundo (rumo ${c.rumo.toFixed(2)})`);
  igual(await J(pg, () => window.__jogo.guia().tipo), null, 'durante a cena, nenhuma seta');
  // quadro a quadro (0,5 s cada)
  let viuFala = false, viuAceno = false, k = 0;
  for (; k < 32 && (await cena(pg)).chegada; k++) {
    await foto(pg, `h-1280-chegada-${String(k).padStart(2, '0')}.jpg`);
    await J(pg, () => window.__jogo.avancar(0.5));
    c = await cena(pg);
    if (!c.falou && !viuFala) confere(!c.acenou, `andando, o Seu Tonho ainda não acena (quadro ${k})`);
    if (c.falou && !viuFala) {
      viuFala = true;
      confere(c.dentro && !c.acenou, 'no fim do caminho, dentro da cerca, ela fala primeiro (ele ainda não acenou)');
      await J(pg, () => window.__jogo.desenhar());
      c = await cena(pg);
      confere(c.balao && c.quem === NOME && c.rosto === 'retrato/personagem' && FALA1.test(c.fala), `o balão dela: nome, retrato e a primeira fala (veio ${c.quem}, ${c.rosto}: "${c.fala}")`);
      await retrato(pg, 'h-1280-fala-dela-1.jpg');
      await J(pg, () => window.__jogo.desenhar());
      c = await cena(pg);
      confere(c.balao && c.quem === NOME && c.rosto === 'retrato/personagem-alegre' && FALA2.test(c.fala) && c.sementes, `o segundo balão dela, alegre, com "+6 sementes de alface" saindo da trouxa (veio ${c.rosto}: "${c.fala}", sementes ${c.sementes})`);
      await retrato(pg, 'h-1280-fala-dela-2.jpg');
    }
    if (c.acenou && !viuAceno) {
      viuAceno = true;
      confere(viuFala, 'o Seu Tonho acena depois da fala dela');
      await J(pg, () => window.__jogo.desenhar());
      c = await cena(pg);
      confere(c.balao && BOAS.test(c.fala) && c.quem === 'Seu Tonho' && c.rosto === 'retrato/seu-tonho-alegre', `com o aceno vêm as boas-vindas dele, com o retrato alegre (veio ${c.quem}, ${c.rosto}: "${c.fala.slice(0, 80)}")`);
      await retrato(pg, 'h-1280-boas-vindas.jpg');
    }
  }
  confere(viuFala, 'ela falou');
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
  conferirFalas(await falasAte(pg, BOAS), 'pulando');
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
  for (k = 0; k < 32 && (await cena(pg)).chegada; k++) {
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
  console.log('a tela de carregando: a chegada espera parada na porteira e só anda quando a tela some');
  // (a ferramenta segura a tela: <html data-carregando> fica e o evento "jogo-carregou" não passa até ela soltar)
  a = await abrir(1280, 720, {
    endereco: '', arte: false,
    antes: () => {
      window.__segurar = true;
      window.addEventListener('jogo-carregou', (e) => { if (window.__segurar) e.stopImmediatePropagation(); }, true);
      // (o script entra antes de existir o <html>: marca assim que ele aparecer)
      const marcar = () => {
        const h = document.documentElement;
        if (!h) return false;
        h.dataset.carregando = '1';
        new MutationObserver(() => { if (window.__segurar && !h.dataset.carregando) h.dataset.carregando = '1'; }).observe(h, { attributes: true, attributeFilter: ['data-carregando'] });
        return true;
      };
      if (!marcar()) new MutationObserver((_, o) => { if (marcar()) o.disconnect(); }).observe(document, { childList: true });
    },
  }); pg = a.pg;
  await esperar(300);
  const naPorteira = await J(pg, () => { const p = window.__jogo.mundo.personagem; return [p.x, p.z]; });
  await esperar(2500);
  c = await cena(pg);
  confere(c.chegada && !c.dentro && Math.hypot(c.x - naPorteira[0], c.z - naPorteira[1]) < 0.01 && !c.acenou, `com a tela de carregando, ela espera parada do lado de fora (em ${c.x.toFixed(2)}, ${c.z.toFixed(2)})`);
  await J(pg, () => { window.__segurar = false; delete document.documentElement.dataset.carregando; window.dispatchEvent(new Event('jogo-carregou')); });
  await esperar(1200);
  c = await cena(pg);
  confere(c.chegada && Math.hypot(c.x - naPorteira[0], c.z - naPorteira[1]) > 1, 'a tela sumiu: ela entra');
  await pg.waitForFunction(() => window.__jogo.mundo.comeco.chegou, null, { timeout: 15000 }).catch(() => {});
  confere((await cena(pg)).chegou, 'e a cena acaba sozinha');
  semErros(a, 'tela de carregando');
  await a.ctx.close();

  // =====================================================================================================
  console.log('a gravação de antes (feita pelo código de antes do começo humilde): abre a fazenda de antes, sem a cena;');
  console.log('  a versão de teste pergunta uma vez se quer o começo novo ("Agora não" fica com a de antes; "Sim" começa de novo)');
  const velha = fs.readFileSync(path.join(raiz, 'testes', 'gravacoes', 'antes-nivel-5.json'), 'utf8');
  async function abrirVelha() {
    const ctxV = await nav.newContext({ viewport: { width: 1280, height: 720 } });
    await ctxV.addInitScript((t) => { if (!sessionStorage.getItem('velha')) { localStorage.setItem('fazenda.jogo.v1', t); sessionStorage.setItem('velha', '1'); } }, velha);
    const pv = await ctxV.newPage(), erros = [];
    pv.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
    pv.on('pageerror', (e) => erros.push('exceção: ' + e.message));
    await pv.goto(srv.url);
    await pv.waitForFunction(() => window.__jogo && window.__jogo.pronto !== undefined, null, { timeout: 20000 });
    return { ctx: ctxV, pg: pv, erros };
  }
  const pergunta = (pg) => J(pg, () => {
    const d = document.querySelector('.subida.dialogo');
    if (!d) return null;
    const b = (k) => { const e = d.querySelector(`[data-k="${k}"]`); return e ? e.textContent : null; };
    return { texto: d.textContent, sim: b('sim'), nao: b('nao') };
  });
  const fazenda = (pg) => J(pg, () => { const m = window.__jogo.mundo, t = (id) => (m.locais.fazenda.porId[id] || {}).tipo || null; return { nivel: m.progresso.nivel, humilde: m.comeco.humilde, chegada: !!m.comeco.chegada, pular: !!document.querySelector('.pular-chegada'), casa: t('casa'), poco: t('poco'), banca: t('banca'), celeiro: t('celeiro'), quadro: t('quadro-de-pedidos'), vizinho: t('vizinho'), bau: t('bau-da-casa') }; });
  const DE_ANTES = { nivel: 5, humilde: false, chegada: false, pular: false, casa: 'casa', poco: 'poco', banca: 'banca', celeiro: 'celeiro', quadro: 'quadro-de-pedidos', vizinho: null, bau: null };
  let v = await abrirVelha();
  await v.pg.waitForSelector('.subida.dialogo', { timeout: 15000 }).catch(() => {});
  igual(await fazenda(v.pg), DE_ANTES, 'a gravação de antes abre com casa, poço, celeiro, banca e quadro prontos, sem a cena e sem o começo humilde');
  let q = await pergunta(v.pg);
  confere(q && /Esta versão tem um começo novo\. Quer começar de novo para ver\?/.test(q.texto) && /a fazenda deste aparelho será apagada/.test(q.texto) && q.sim === 'Sim, começar de novo' && q.nao === 'Agora não',
    `a versão de teste pergunta se quer o começo novo, avisando que a fazenda será apagada (veio ${JSON.stringify(q)})`);
  await v.pg.screenshot({ path: path.join(capturas, 'h-1280-pergunta-comeco-novo.jpg'), type: 'jpeg', quality: 84 });
  let bt = await centroDe(v.pg, '.subida.dialogo [data-k="nao"]');
  await v.pg.mouse.click(bt.x, bt.y);
  await esperar(300);
  confere(!(await pergunta(v.pg)), '"Agora não" fecha a pergunta');
  igual(await fazenda(v.pg), DE_ANTES, '"Agora não": a fazenda de antes continua como estava');
  await v.pg.screenshot({ path: path.join(capturas, 'h-1280-gravacao-de-antes.jpg'), type: 'jpeg', quality: 84 });
  await v.pg.reload();
  await v.pg.waitForFunction(() => window.__jogo && window.__jogo.pronto !== undefined, null, { timeout: 20000 });
  await esperar(1500);
  confere(!(await pergunta(v.pg)), 'aberta de novo, não pergunta outra vez (pergunta uma vez só)');
  igual(await fazenda(v.pg), DE_ANTES, 'e a fazenda de antes continua');
  confere(v.erros.length === 0, `gravação de antes ("Agora não"): erro no console: ${v.erros.slice(0, 3).join(' | ')}`);
  await v.ctx.close();
  // "Sim": a fazenda deste aparelho é apagada e começa o jogo novo, com a chegada
  v = await abrirVelha();
  await v.pg.waitForSelector('.subida.dialogo', { timeout: 15000 }).catch(() => {});
  bt = await centroDe(v.pg, '.subida.dialogo [data-k="sim"]');
  await v.pg.mouse.click(bt.x, bt.y);
  await esperar(500);
  confere(!(await pergunta(v.pg)), '"Sim" fecha a pergunta');
  let f2 = await fazenda(v.pg);
  confere(f2.nivel === 1 && f2.humilde && f2.casa === 'casa-velha' && f2.banca === 'caixote-de-venda' && f2.vizinho === 'vizinho' && !f2.celeiro && !f2.quadro && f2.chegada && f2.pular,
    `"Sim, começar de novo": a fazenda nova do começo humilde, com a cena da chegada (veio ${JSON.stringify(f2)})`);
  const avisosV = await J(v.pg, () => window.__jogo.avisos());
  confere(!avisosV.some((t) => /fora por/.test(t)), `e nenhum aviso da fazenda apagada (o "que bom te ver" da volta) fica na tela (veio ${JSON.stringify(avisosV)})`);
  await v.pg.screenshot({ path: path.join(capturas, 'h-1280-comeco-novo-sim.jpg'), type: 'jpeg', quality: 84 });
  await v.pg.waitForFunction(() => window.__jogo.mundo.comeco.chegou, null, { timeout: 20000 }).catch(() => {});
  await v.pg.reload();
  await v.pg.waitForFunction(() => window.__jogo && window.__jogo.pronto !== undefined, null, { timeout: 20000 });
  await esperar(1500);
  f2 = await fazenda(v.pg);
  confere(!(await pergunta(v.pg)) && f2.humilde && f2.nivel === 1 && !f2.chegada, `aberta de novo, é a fazenda nova, sem pergunta e sem a cena (veio ${JSON.stringify(f2)})`);
  confere(v.erros.length === 0, `gravação de antes ("Sim"): erro no console: ${v.erros.slice(0, 3).join(' | ')}`);
  await v.ctx.close();
} catch (err) {
  falhas.push('a verificação parou: ' + (err && err.stack ? err.stack.split('\n').slice(0, 3).join(' ') : err));
}
await nav.close();
await srv.fechar();
console.log(`\n${feitos} conferências.`);
if (falhas.length) { console.log(`${falhas.length} falha(s):`); for (const f of falhas) console.log(' - ' + f); process.exit(1); }
console.log('Tudo certo.');
