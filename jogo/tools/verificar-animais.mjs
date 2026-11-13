// Confere os animais de produção no jogo montado, num Chromium sem janela, com clique, dedo, teclado e controle de
// verdade: 1280x720 (mouse, teclado e controle de videogame) e 844x390 (celular deitado, toque).
// Joga de ponta a ponta: a aba "Animais" da loja ainda sem abrigo; o galinheiro, duas galinhas, cocho e bebedouro, a
// espera, recolher os ovos (no abrigo e no balão), vender na banca; o curral, duas vacas pelo painel, ordenhar, o balde
// cheio, recolher pelo botão do painel; o aprisco, três ovelhas, a tesoura que falta (comprada pelo atalho), a tosquia
// e a ovelha pelada; fechar e voltar horas depois; gravar e recarregar; ampliar o galinheiro; o fim da vida produtiva
// com as três saídas. Confere os tamanhos mínimos (texto de 14 px, botão de 44 px), que nada vaza dos painéis e que
// não há erro no console. As fotos vão para a pasta de capturas (JPEG).
//   JOGO_DIST=dist-b JOGO_CAPTURAS=capturas-b JOGO_PORTA=8102 node tools/verificar-animais.mjs   (monte antes)
// Termina com "Tudo certo." ou com a lista das falhas.
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

let srv;
try { srv = await servir(dist, Number(process.env.JOGO_PORTA) || 0); } catch { srv = await servir(dist, 0); }
const nav = await abrirNavegador();

async function pronto(pg) {
  await pg.waitForFunction(() => window.__jogo && window.__jogo.pronto !== undefined, null, { timeout: 20000 });
  if (!(await pg.evaluate(() => window.__jogo.pronto))) throw new Error('o jogo não começou: ' + (await pg.evaluate(() => document.querySelector('.erro') && document.querySelector('.erro').textContent)));
  await pg.evaluate(() => window.__jogo.baixarArte());
  await pg.waitForFunction(() => window.__jogo.arteBaixada(), null, { timeout: 20000 });
  // ajudas desta verificação, do lado da página (leem o mundo e preparam o estoque; quem joga são os toques)
  await pg.evaluate(() => {
    const j = window.__jogo;
    const achar = (tipo) => j.mundo.construcao.todas.find((o) => o.tipo === tipo) || null;
    window.__a = {
      de(tipo) { const e = achar(tipo); return e ? { id: e.id, x: e.x, z: e.z, l: e.l, p: e.p, nivel: e.nivel || 1, obra: e.obraAte > 0, amplia: e.ampliaAte > 0 } : null; },
      tem(item) { const P = j.mundo.posses; return (P.bolsa[item] || 0) + (P.celeiro.itens[item] || 0) + (P.cesto.itens[item] || 0) + (P.ferramentas[item] ? 1 : 0) + (P.recipientes.includes(item) ? 1 : 0); },
      cesto(item) { return j.mundo.posses.cesto.itens[item] || 0; },
      ouro() { return j.mundo.posses.ouro; },
      // põe itens no estoque como se tivessem sido colhidos ou comprados: colheita e produto no celeiro, o resto na bolsa
      dar(itens) { const m = j.mundo; for (const k in itens) { const t = m.dados.itens[k].tipo, onde = t === 'colheita' || t === 'produto' ? m.posses.celeiro.itens : m.posses.bolsa; onde[k] = (onde[k] || 0) + itens[k]; } },
      // as missões do vizinho até "ate" (sem ela) ficam cumpridas; com "so", todas menos essa
      missoes(ate, so) { const m = j.mundo, L = m.dados.missoes.vizinho.map((x) => x.id); m.missoes.feitas = so ? L.filter((x) => x !== so) : L.slice(0, L.indexOf(ate)); m.missoes.de = null; m.missoes.conta = 0; },
      missao() { const s = j.estado(); return s.missao ? s.missao.id : null; },
      nivel(n) { const m = j.mundo; m.progresso.nivel = n; m.progresso.xp = m.dados.niveis.limiar[n] + 10; },
      // os dois primeiros lotes comprados e a terra própria limpa (espaço para o curral e o aprisco)
      terreno() {
        const m = j.mundo, loc = m.locais.fazenda;
        for (const l of ['lote-1', 'lote-2']) m.comando({ tipo: 'comprarLote', lote: l });
        for (const e of [...loc.entidades]) if (['mato', 'toco', 'pedra', 'mata'].includes(e.tipo) && loc.propria[loc.i(e.x, e.z)]) { loc.tirar(e.id); m.terras.limpos.push(loc.i(e.x, e.z)); }
        m.eventos.emitir('chaoMudou', { tudo: true, local: loc.id });
      },
      serve(x, z) { const loc = j.mundo.local, i = loc.dentro(x, z) ? loc.i(x, z) : -1; return i >= 0 && loc.propria[i] === 1 && loc.chao[i] === 0 && !loc.ocupa[i] && !loc.plantas[i] && !loc.entidadeEm(x, z); },
      livres(l, p, cx, cz) {
        const loc = j.mundo.local, out = [];
        for (let z = 1; z <= loc.p - p - 1; z++) for (let x = 1; x <= loc.l - l - 1; x++) {
          let ok = true;
          for (let dz = -1; dz < p + 1 && ok; dz++) for (let dx = -1; dx < l + 1 && ok; dx++) if (!this.serve(x + dx, z + dz)) ok = false;
          if (ok) out.push([x, z]);
        }
        return out.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cz) - Math.hypot(b[0] - cx, b[1] - cz));
      },
      // ergue uma construção pelo comando (a obra é da frente de construir; aqui interessa o que vem depois)
      erguer(tipo) {
        const m = j.mundo, d = m.dados.construcoes[tipo], p = m.personagem;
        for (const [x, z] of this.livres(d.casas[0], d.casas[1], p.x, p.z).slice(0, 60)) { const r = m.comando({ tipo: 'construir', id: tipo, x, z, jaJa: true, quieto: true }); if (r.ok) { j.pular((d.obraSeg || 0) + 1); j.avancar(0.2); return this.de(tipo); } }
        return null;
      },
      bichos(tipo) { const m = j.mundo, e = achar(tipo); return e ? m.animais.lista.filter((a) => a.abrigo === e.id).map((a) => ({ id: a.id, especie: a.especie, pronto: a.pronto || 0, produzidos: a.produzidos || 0, fim: a.fim || '', tratado: !!a.tratado })) : []; },
      trato(tipo) { const e = achar(tipo), s = e ? j.mundo.animais.abrigos[e.id] || {} : {}; return { cocho: s.cocho || 0, bebedouro: s.bebedouro || 0 }; },
      fila() { const p = j.mundo.personagem; return [p.tarefa, ...p.fila].filter(Boolean).map((t) => t.acao || t.tipo); },
      fala() { const b = document.querySelector('#ui .balao.avulsa'); return b && !b.hidden ? b.textContent : ''; },
      // o ponto da tela onde o toque cai na construção (ou num balão dela): tenta algumas alturas
      ponto(tipo) {
        const m = j.mundo, e = achar(tipo), cam = j.cena.cam;
        if (!e) return null;
        j.olhar(e.x + e.l / 2, e.z + e.p / 2);
        for (const alto of [0.5, 0.9, 0.3, 1.4]) {
          const x = e.x + e.l / 2, z = e.z + e.p / 2, id = j.cena.entidadeEm(m, cam.cssX(x, z), cam.cssY(x, alto, z)), p = j.naTela(x, z, alto), n = document.elementFromPoint(p.x, p.y);
          if (id === e.id && n && n.id === 'tela') return p;
        }
        return null;
      },
      // texto menor que 14 px e botão menor que 44 px dentro de "seletor"
      pequenos(seletor) {
        const raiz = document.querySelector(seletor), ruins = [];
        if (!raiz) return ['não achei ' + seletor];
        for (const n of raiz.querySelectorAll('*')) {
          if (n.closest('[hidden]') || !n.getClientRects().length) continue;
          const temTexto = [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
          if (temTexto && parseFloat(getComputedStyle(n).fontSize) < 14) ruins.push(`texto de ${getComputedStyle(n).fontSize} em "${n.textContent.trim().slice(0, 24)}"`);
          if (n.tagName === 'BUTTON') { const r = n.getBoundingClientRect(); if (r.width < 43.5 || r.height < 43.5) ruins.push(`botão de ${Math.round(r.width)}x${Math.round(r.height)} (${n.dataset.k || n.className})`); }
        }
        return ruins;
      },
      // o cartão do painel cabe na tela e nada vaza para os lados
      cabe() {
        const c = document.querySelector('.veu .cartao'), corpo = document.querySelector('.veu .corpo');
        if (!c) return 'sem painel';
        const r = c.getBoundingClientRect(), ruins = [];
        if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) ruins.push(`o cartão sai da tela (${Math.round(r.left)}, ${Math.round(r.top)}, ${Math.round(r.right)}, ${Math.round(r.bottom)})`);
        if (corpo.scrollWidth > corpo.clientWidth + 1) ruins.push(`o painel vaza para os lados (${corpo.scrollWidth} em ${corpo.clientWidth})`);
        for (const n of corpo.querySelectorAll('.oferta, .abr-topo, .abr-medida, .abr-aviso, .abr-comprar, .abr-saida, .abr-fim-topo')) { if (n.scrollWidth > n.clientWidth + 2) ruins.push(`"${n.className}" não cabe na largura (${n.scrollWidth} em ${n.clientWidth}): ${n.textContent.slice(0, 30)}`); }
        for (const b of corpo.querySelectorAll('button')) { if (b.scrollWidth > b.clientWidth + 2) ruins.push(`o texto do botão "${b.textContent.slice(0, 24)}" não cabe (${b.scrollWidth} em ${b.clientWidth})`); }
        return ruins.join('; ');
      },
    };
    j.desenhar();
  });
  await esperar(250);
}
async function abrir(w, h, opc = {}) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: opc.dpr || 1, hasTouch: !!opc.toque, isMobile: !!opc.toque });
  const pg = await ctx.newPage();
  const erros = [];
  pg.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  pg.on('pageerror', (e) => erros.push('exceção: ' + e.message));
  await pg.goto(srv.url + '#teste');
  await pronto(pg);
  return { ctx, pg, erros, w, h, cdp: opc.toque ? await ctx.newCDPSession(pg) : null };
}
async function dedo(cdp, x, y) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
  await esperar(30);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await esperar(40);
}

// o cenário inteiro, com o ponteiro da vez; "f" = prefixo das fotos
async function cenario(a, f) {
  const { pg, cdp } = a, comDedo = !!cdp;
  const J = (fn, arg) => pg.evaluate(fn, arg);
  const A = (nome, ...args) => pg.evaluate(([n, xs]) => window.__a[n](...xs), [nome, args]);
  const quadro = async (ms = 90) => { await J(() => window.__jogo.desenhar()); await esperar(ms); };
  const tocarXY = async (x, y) => { if (cdp) await dedo(cdp, x, y); else await pg.mouse.click(x, y); await esperar(70); };
  let nFoto = 0;
  const foto = async (nome, comAvisos = false) => {
    if (!comAvisos) await pg.waitForFunction(() => window.__jogo.avisosNaTela().length === 0, null, { timeout: 7000 }).catch(() => {});
    await quadro(380);
    await pg.screenshot({ path: path.join(capturas, `${f}-${String(++nFoto).padStart(2, '0')}-${nome}.jpg`), type: 'jpeg', quality: 84 });
  };
  const painel = () => J(() => window.__jogo.painelAberto());
  const avisos = () => J(() => window.__jogo.avisos());
  const ateParar = async () => { const s = await J(() => window.__jogo.ateParar(400)); if (s < 0) confere(false, 'a personagem não parou em 400 s'); await quadro(); return s; };
  const pular = async (seg) => { await J((s) => { window.__jogo.pular(s); window.__jogo.avancar(0.2); }, seg); await quadro(); };
  // toca num elemento da interface (rola o painel até ele aparecer) e confere que nada está por cima dele
  async function tocarEm(seletor, obrigatorio = true) {
    const achou = await J((s) => { const e = document.querySelector(s); if (!e || e.hidden || e.closest('[hidden]')) return false; if (e.closest('.corpo')) e.scrollIntoView({ block: 'center', inline: 'center' }); return true; }, seletor);
    if (!achou) { if (obrigatorio) confere(false, `não achei "${seletor}" na tela`); return false; }
    await esperar(60);
    const r = await J((s) => { const n = document.querySelector(s), r = n.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return { x, y, livre: !!e && (e === n || n.contains(e)), quem: e ? e.className || e.id : 'nada' }; }, seletor);
    confere(r.livre, `"${seletor}" devia receber o toque, mas há "${r.quem}" por cima`);
    await tocarXY(r.x, r.y);
    await quadro();
    return true;
  }
  // no computador, os botões do painel vão pelo teclado (Tab até o botão, Enter); no celular, pelo dedo
  async function teclar(k) {
    for (let i = 0; i < 45; i++) {
      const at = await J(() => { const e = document.activeElement; return e && e.dataset ? e.dataset.k || '' : ''; });
      if (at === k) { await pg.keyboard.press('Enter'); await quadro(); return true; }
      await pg.keyboard.press('Tab');
    }
    confere(false, `o Tab não chegou no botão "${k}"`);
    return false;
  }
  const apertar = (k) => (comDedo ? tocarEm(`.veu [data-k="${k}"]`) : teclar(k));
  const fecharPainel = async () => { if ((await painel()) === null) return; if (comDedo) await tocarEm('.veu .fechar'); else await pg.keyboard.press('Escape'); await quadro(); };
  // telas de recompensa (prêmio de missão, subida de nível): fecha as que houver
  async function fecharTelas() {
    for (let k = 0; k < 8 && (await J(() => !!document.querySelector('.subida:not(.dialogo)'))); k++) {
      await esperar(700);
      const b = await J(() => { const n = document.querySelector('.subida:not(.dialogo) .cartao > .bt, .subida:not(.dialogo) button'); if (!n) return null; const r = n.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return { x, y, livre: !!e && (e === n || n.contains(e)) }; });
      if (b && b.livre) await tocarXY(b.x, b.y); else await J(() => window.__jogo.fecharSubida());
      await quadro(200);
    }
  }
  const tamanhos = async (onde) => { const r = await A('pequenos', '.veu'); confere(r.length === 0, `${onde}: ${r.slice(0, 5).join('; ')}`); const c = await A('cabe'); confere(!c, `${onde}: ${c}`); };
  // toca na construção do terreno (a câmera vai até ela antes)
  async function tocarAbrigo(tipo) {
    const p = await A('ponto', tipo);
    if (!confere(!!p, `o toque chega no ${tipo} (nada na frente dele)`)) return false;
    await tocarXY(p.x, p.y);
    await quadro();
    return true;
  }
  async function tocarEntidade(id, alto = 0.6) {
    const p = await J(([id, alto]) => { const j = window.__jogo, e = j.mundo.local.porId[id]; j.olhar(e.x + e.l / 2, e.z + e.p / 2); const p = j.daEntidade(id, alto), n = document.elementFromPoint(p.x, p.y); return { ...p, livre: !!n && n.id === 'tela' }; }, [id, alto]);
    confere(p.livre, `"${id}" devia estar livre para o toque`);
    await tocarXY(p.x, p.y);
    await quadro();
  }
  // a roda de ações (o alvo com mais de uma ação): as opções dela, a principal primeiro; null = fechada
  const roda = () => J(() => (window.__jogo.acoes.rodaAberta ? [...document.querySelectorAll('.roda-acoes .bt-roda')].map((b) => b.dataset.opcao) : null));
  // escolhe uma opção da roda aberta (depois do tempo em que o clique fantasma do toque não vale)
  async function naRoda(id) { await esperar(450); return tocarEm(`.roda-acoes [data-opcao="${id}"]`); }
  // toca no abrigo e, se a roda abrir, escolhe "Abrir": o painel
  async function abrirAbrigo(tipo, onde) {
    if (!(await tocarAbrigo(tipo))) return;
    const r = await roda();
    if (r) { confere(r.includes('abrir'), `${onde}: a roda tem "Abrir" (${r.join(', ')})`); await naRoda('abrir'); }
  }
  // o abrigo com coisa pronta: o toque abre a roda (a ação e "Abrir") e a principal faz a ação, sem painel
  async function principalDoAbrigo(tipo, esperado, onde) {
    if (!(await tocarAbrigo(tipo))) return;
    const r = await roda();
    if (confere(!!r, `${onde}: o toque abre a roda de ações`)) { igual(r[0], esperado, `${onde}: a principal da roda é a ação certa`); await naRoda(r[0]); }
  }
  // põe a personagem de pé num lado livre do abrigo, de frente para ele (teclado e controle agem no que está à frente)
  const deFrentePara = (id) => J((id) => {
    const j = window.__jogo, m = j.mundo, loc = m.local, e = loc.porId[id], p = m.personagem, lados = [];
    for (let x = e.x; x < e.x + e.l; x++) { lados.push([x, e.z - 1, 0, 1]); lados.push([x, e.z + e.p, 0, -1]); }
    for (let z = e.z; z < e.z + e.p; z++) { lados.push([e.x - 1, z, 1, 0]); lados.push([e.x + e.l, z, -1, 0]); }
    for (const [x, z, dx, dz] of lados) if (loc.dentro(x, z) && loc.andavel(x, z) && !loc.entidadeEm(x, z)) { p.x = x + 0.5; p.z = z + 0.5; p.rumo = Math.atan2(dx, dz); p.rota = null; p.vel = 0; j.seguir(); return [x, z]; }
    return null;
  }, id);
  const segurarTecla = async (k, ms = 700) => { await pg.keyboard.down(k); await esperar(ms); await pg.keyboard.up(k); await quadro(120); };
  const segurarBotao = async (b, ms = 700) => { await J((i) => { window.__pad.buttons[i].pressed = true; window.__pad.buttons[i].value = 1; }, b); await esperar(ms); await J((i) => { window.__pad.buttons[i].pressed = false; window.__pad.buttons[i].value = 0; }, b); await esperar(160); };
  async function abrirAbaAnimais() {
    if ((await painel()) !== 'loja' && (await painel()) !== 'animais') await tocarEm('.topo-dir [data-painel="loja"]');
    if ((await painel()) === 'loja') await tocarEm('[data-k="aba-animais"]');
    igual(await painel(), 'animais', 'a aba "Animais" da loja abre o painel dos bichos');
  }
  const vender = async () => { const antes = await A('ouro'); await tocarEntidade('banca'); await ateParar(); await fecharTelas(); return (await A('ouro')) - antes; };

  // ================= começo: terra, ouro e materiais pelo gancho de teste (no começo humilde, também o que um
  // jogador do nível 16 já teria: celeiro, quadro, banca e as reformas, como no atalho de teste) =================
  await J(() => { const a = window.__a; window.__jogo.mundo.posses.ouro = 120000; a.nivel(16); a.terreno(); a.nivel(7); window.__jogo.mundo.eventos.emitir('usouAtalhoDeTeste', { nivel: 16 }); window.__jogo.mundo.posses.ouro = 90000; a.dar({ madeira: 80, tabua: 160, prego: 260, pedra: 60, fibra: 60 }); a.missoes('galinheiro'); });
  await quadro();
  if (!comDedo) {
    // um controle de videogame de mentira: o jogo lê navigator.getGamepads() a cada quadro
    await J(() => {
      const pad = { connected: true, id: 'controle de teste', buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0] };
      Object.defineProperty(navigator, 'getGamepads', { value: () => [pad], configurable: true });
      window.__pad = pad;
      window.dispatchEvent(new Event('gamepadconnected'));
    });
  }
  const controle = async (b) => { await J((i) => { window.__pad.buttons[i].pressed = true; window.__pad.buttons[i].value = 1; }, b); await esperar(140); await J((i) => { window.__pad.buttons[i].pressed = false; window.__pad.buttons[i].value = 0; }, b); await esperar(140); };

  // ---- a aba "Animais" da loja, ainda sem galinheiro e no nível 7: a galinha pede o abrigo, vaca e ovelha travadas
  await abrirAbaAnimais();
  confere(await J(() => { const c = document.querySelector('.oferta.animal[data-item="galinha"]'); return !!c && /Galinheiro/i.test(c.textContent) && !!c.querySelector('[data-k="construir-galinha"]') && /80/.test(c.textContent) && !!c.querySelector('canvas.ic'); }), 'a galinha mostra a figura, o preço e que precisa do galinheiro (com o atalho para construir)');
  confere(await J(() => { const c = document.querySelector('.oferta.animal.travada[data-item="vaca"]'); return !!c && /nível 9/i.test(c.textContent) && !c.querySelector('button'); }), 'a vaca aparece travada, com o nível que libera');
  await tamanhos('aba Animais (sem abrigo)');
  await foto('loja-animais-sem-abrigo');
  await tocarEm('[data-k="construir-galinha"]');
  igual(await painel(), 'construir', '"Construir" na galinha leva ao catálogo de construir');
  confere(await J(() => !!document.querySelector('.veu .oferta[data-item="galinheiro"]')), 'o catálogo mostra o galinheiro');
  await fecharPainel();

  // ---- a seta do guia num passo que pede a aba "Animais" (a missão do companheiro): a loja, a aba e o cartão do bicho
  await J(() => { window.__a.nivel(16); window.__a.missoes(null, 'companheiro'); });
  await fecharTelas();
  igual(await A('missao'), 'companheiro', 'a missão da vez é a do companheiro');
  const marcado = (s) => J((q) => { const e = document.querySelector(q); return !!e && e.classList.contains('alvo-tutorial'); }, s);
  await quadro(700);
  confere(await marcado('.topo-dir [data-painel="loja"]'), 'a seta do guia aponta o botão da loja (o painel dos bichos não tem botão próprio)');
  await tocarEm('.topo-dir [data-painel="loja"]'); await quadro(700);
  confere(await marcado('[data-k="aba-animais"]'), 'com a loja aberta, a seta aponta a aba "Animais"');
  await tocarEm('[data-k="aba-animais"]'); await quadro(700);
  const alvoNaAba = await J(() => { const b = document.querySelector('.oferta.animal .alvo-tutorial'); return b ? b.closest('.oferta').dataset.item : null; });
  confere(!!alvoNaAba && (await J((id) => window.__jogo.mundo.dados.animais[id].familia, alvoNaAba)) === 'estimacao', `na aba "Animais", a seta aponta um bicho de estimação (${alvoNaAba})`);
  await fecharPainel();
  await J(() => { window.__a.missoes('galinheiro'); window.__a.nivel(7); });
  await fecharTelas();

  // ---- o galinheiro (pelo comando: a obra é da frente de construir) e o nível de quem já tem bancada
  await J(() => window.__a.nivel(16));
  const banc = await A('erguer', 'bancada-de-carpintaria');
  const gal = await A('erguer', 'galinheiro');
  if (!confere(!!banc && !!gal, 'a bancada e o galinheiro ficam prontos')) return;
  await fecharTelas();
  igual(await A('missao'), 'galinhas', 'com o galinheiro pronto, a missão da vez é a das galinhas');
  confere((await A('tem', 'milho')) >= 12, 'a missão do galinheiro deu milho');

  // ---- comprar duas galinhas pela aba da loja
  const ouro0 = await A('ouro');
  await abrirAbaAnimais();
  await tocarEm('.oferta[data-item="galinha"] [data-k="comprar-galinha"]');
  await tocarEm('.oferta[data-item="galinha"] [data-k="comprar-galinha"]');
  igual((await A('bichos', 'galinheiro')).length, 2, 'dois toques em "Comprar" põem duas galinhas no galinheiro');
  igual(ouro0 - (await A('ouro')), 160, 'cada galinha custa 80 de ouro');
  confere(await J(() => /Você tem 2/.test(document.querySelector('.oferta[data-item="galinha"]').textContent)), 'o cartão da galinha diz quantas você tem');
  await fecharPainel();
  await fecharTelas();
  igual(await A('missao'), 'trato', 'a missão das galinhas fica cumprida e vem a do trato');
  await quadro(300);
  confere(/Bicho novo/.test(await A('fala')), `o Seu Tonho explica o bicho novo (fala: "${await A('fala')}")`);
  await J(([x, z]) => window.__jogo.olhar(x, z), [gal.x + 1.5, gal.z + 1.5]);
  await J(() => window.__jogo.avancar(0)); await quadro(600);
  const soltas = await J(() => window.__bichos().filter((b) => b.especie === 'galinha'));
  confere(soltas.length === 2 && soltas.every((b) => !b.fora && !b.cercado), 'as duas galinhas aparecem soltas em volta do galinheiro');
  confere(soltas.every((b) => !(b.x > gal.x && b.x < gal.x + gal.l && b.z > gal.z && b.z < gal.z + gal.p)), 'nenhuma galinha fica em cima do galinheiro');
  const baloes0 = await J(() => window.__baloes().map((b) => b.icone));
  confere(baloes0.includes('icone/milho') && baloes0.includes('icone/gota'), `o balão do galinheiro pede milho e água (balões: ${baloes0.join(', ')})`);
  await foto('galinhas-e-baloes', true);

  // ---- o painel do galinheiro: cocho, bebedouro, as galinhas, comprar mais, ampliar
  // (no celular, o toque é numa galinha solta: vale como tocar no galinheiro)
  let abriu = false;
  if (comDedo) {
    const p = await J(([gid]) => { const j = window.__jogo, m = j.mundo, cam = j.cena.cam; for (const b of window.__bichos()) { if (b.abrigo !== gid) continue; const id = j.cena.entidadeEm(m, cam.cssX(b.x, b.z), cam.cssY(b.x, 0.25, b.z)), q = j.naTela(b.x, b.z, 0.25), n = document.elementFromPoint(q.x, q.y); if (id === gid && n && n.id === 'tela') return q; } return null; }, [gal.id]);
    if (confere(!!p, 'há uma galinha solta onde o dedo alcança')) {
      // o dedo na galinha vale o galinheiro: com fome e sede, abre a roda (dar comida é a principal) e não age sozinho
      const fila0 = (await A('fila')).length;
      await tocarXY(p.x, p.y); await quadro();
      let r = await roda();
      confere(!!r && r[0] === 'abastecerCocho' && r.includes('abastecerBebedouro') && r.includes('abrir'), `tocar numa galinha solta abre a roda do galinheiro: comida (a principal), água e abrir (veio ${JSON.stringify(r)})`);
      igual((await A('fila')).length, fila0, 'abrir a roda não manda ela fazer nada');
      const rr = await J(() => { const R = [...document.querySelectorAll('.roda-acoes .bt-roda')].map((b) => b.getBoundingClientRect()), pr = document.querySelector('.roda-acoes .principal .roda-circ').getBoundingClientRect(), ou = document.querySelector('.roda-acoes .bt-roda:not(.principal) .roda-circ').getBoundingClientRect(); return { dentro: R.every((q) => q.left >= 0 && q.top >= 0 && q.right <= innerWidth && q.bottom <= innerHeight), grandes: R.every((q) => q.width >= 44 && q.height >= 44), maior: pr.width > ou.width }; });
      confere(rr.dentro && rr.grandes && rr.maior, `os botões da roda cabem na tela, têm 44 px ou mais, e a principal é maior (${JSON.stringify(rr)})`);
      confere(await J(() => { const c = document.querySelector('.vaga-mao canvas').dataset.chave; return !/semente/.test(c) && /×/.test(document.querySelector('.vaga-mao').textContent); }), 'com a roda do galinheiro aberta, a vaga mostra a comida que ela vai dar e quanto há');
      await foto('roda-do-galinheiro');
      // tocar fora fecha a roda, e esse toque não vira ordem
      const fora = await J(() => { const j = window.__jogo, m = j.mundo, loc = m.local, p = m.personagem; for (let r = 3; r < 9; r++) for (let dx = -r; dx <= r; dx++) { const x = Math.floor(p.x) + dx, z = Math.floor(p.z) + r; if (loc.dentro(x, z) && loc.andavel(x, z) && !loc.entidadeEm(x, z)) { const q = j.naTela(x + 0.5, z + 0.5), n = document.elementFromPoint(q.x, q.y); if (n && n.id === 'tela') return q; } } return null; });
      if (fora) { await esperar(450); await tocarXY(fora.x, fora.y); await quadro(); confere(!(await roda()), 'tocar fora da roda fecha a roda'); igual((await A('fila')).length, fila0, 'o toque que fechou a roda não vira ordem'); confere(!(await J(() => window.__jogo.ocupada())), 'nem anda'); }
      await tocarXY(p.x, p.y); await quadro();
      r = await roda();
      if (r) await naRoda('abrir');
      abriu = (await painel()) === 'abrigo';
      confere(abriu, '"Abrir" na roda abre o painel do galinheiro');
    }
  }
  if (!abriu) await abrirAbrigo('galinheiro', 'o galinheiro com fome');
  igual(await painel(), 'abrigo', 'tocar no galinheiro abre o painel do abrigo');
  const ab = await J(() => { const v = document.querySelector('.veu'); return { titulo: v.querySelector('header .titulo').textContent, topo: v.querySelector('.abr-topo') ? v.querySelector('.abr-topo').textContent : '', cartoes: v.querySelectorAll('.abr-bicho').length, cocho: !!v.querySelector('[data-k="encher-cocho"]'), bebedouro: !!v.querySelector('[data-k="encher-bebedouro"]'), alvo: !!v.querySelector('[data-k="encher-cocho"].alvo-tutorial'), comprar: !!v.querySelector('[data-k="comprar-galinha"]'), ampliar: !!v.querySelector('[data-k="ampliar"]'), mover: !!v.querySelector('[data-k="mover"]') }; });
  igual(ab.titulo, 'Galinheiro', 'o painel tem o nome do abrigo');
  confere(/2 de 4 vagas/.test(ab.topo), `o painel diz as vagas ("${ab.topo}")`);
  confere(ab.cartoes === 2 && ab.cocho && ab.bebedouro && ab.comprar && ab.ampliar && ab.mover, `o painel traz as galinhas, o cocho, o bebedouro, comprar, ampliar e mudar de lugar (${JSON.stringify(ab)})`);
  confere(ab.alvo, 'a missão do trato marca o botão de encher o cocho');
  await tamanhos('painel do galinheiro');
  await foto('painel-do-galinheiro');
  if (!comDedo) {
    // as setas andam pelos botões; o controle também
    const antes = await J(() => document.activeElement && document.activeElement.dataset.k);
    await pg.keyboard.press('ArrowDown'); await quadro();
    const depois = await J(() => { const e = document.activeElement; return e && e.closest('.veu') ? e.dataset.k || e.className : null; });
    confere(!!depois && depois !== antes, `a seta para baixo leva o foco a outro botão do painel (de "${antes}" para "${depois}")`);
    const antesC = await J(() => document.activeElement && (document.activeElement.dataset.k || document.activeElement.className));
    await controle(13);
    const depoisC = await J(() => { const e = document.activeElement; return e && e.closest('.veu') ? e.dataset.k || e.className : null; });
    confere(!!depoisC && depoisC !== antesC, `o direcional do controle anda pelos botões do painel (de "${antesC}" para "${depoisC}")`);
  }
  await apertar('encher-cocho');
  await apertar('encher-bebedouro');
  confere((await A('fila')).filter((x) => /abastecer/.test(x)).length === 2, `"Encher" do cocho e do bebedouro vão para a fila dela (fila: ${(await A('fila')).join(', ')})`);
  await quadro();
  const apagados = await J(() => ['cocho', 'bebedouro'].map((k) => { const b = document.querySelector(`[data-k="encher-${k}"]`); return b ? (b.disabled ? 'apagado' : 'aceso') : 'sumiu'; }).join(', '));
  igual(apagados, 'apagado, apagado', 'os dois botões de encher ficam apagados enquanto ela vai');
  igual(await painel(), 'abrigo', 'o painel continua aberto depois de "Encher"');
  if (!comDedo) { await controle(1); igual(await painel(), null, 'o botão B do controle fecha o painel'); } else await fecharPainel();
  await ateParar();
  await fecharTelas();
  const t1 = await A('trato', 'galinheiro');
  confere(t1.cocho >= 10 && t1.bebedouro >= 10, `cocho e bebedouro ficam cheios (${JSON.stringify(t1)})`);
  igual(await A('missao'), 'ovos', 'encher os dois cumpre a missão do trato');
  confere((await A('bichos', 'galinheiro')).every((b) => b.tratado), 'as galinhas comem e bebem na hora');
  confere((await A('tem', 'caixa-de-ovos')) >= 1, 'a missão do trato deu a caixa de ovos');
  await quadro(300);
  confere(/comida e água/i.test(await A('fala')) || /Bicho novo/.test(await A('fala')), `o Seu Tonho explica o trato (fala: "${await A('fala')}")`);
  await foto('trato-feito', true);

  // ---- esperar: dois ciclos de 20 min, dois ovos por galinha; recolher no abrigo (computador) ou no balão (celular)
  await pular(2 * 1200 + 5);
  igual((await A('bichos', 'galinheiro')).reduce((n, b) => n + b.pronto, 0), 4, 'em 40 minutos, duas galinhas tratadas botam quatro ovos');
  await J(([x, z]) => window.__jogo.olhar(x, z), [gal.x + 1.5, gal.z + 1.5]);
  const baloes1 = await J(() => window.__baloes());
  confere(baloes1.some((b) => b.icone === 'icone/ovo'), `o balão do galinheiro mostra o ovo (balões: ${baloes1.map((b) => b.icone).join(', ')})`);
  await foto('ovos-prontos', true);
  if (comDedo) {
    const b = baloes1.find((x) => x.icone === 'icone/ovo');
    const livre = await J(([x, y]) => { const n = document.elementFromPoint(x, y); return !!n && n.id === 'tela'; }, [b.x, b.y]);
    confere(livre, 'o balão do ovo está livre para o toque');
    await tocarXY(b.x, b.y);
    await quadro();
    const r = await roda();
    if (confere(!!r, 'o toque no balão do ovo abre a roda do galinheiro')) { igual(r[0], 'recolherOvo', 'a principal da roda do galinheiro com ovo é pegar os ovos'); await naRoda(r[0]); }
  } else await principalDoAbrigo('galinheiro', 'recolherOvo', 'o galinheiro com ovo');
  await quadro();
  igual(await painel(), null, 'pegar os ovos pela roda não abre o painel');
  await ateParar();
  await fecharTelas();
  igual(await A('cesto', 'ovo'), 4, 'os quatro ovos vão para a caixa de ovos');
  igual(await A('missao'), 'prateleira', 'recolher quatro ovos cumpre a missão dos ovos');
  const chip = await J(() => { const c = document.querySelector('.chip.recipiente[data-produto="ovo"]'); return c && !c.hidden ? { texto: c.textContent, fonte: parseFloat(getComputedStyle(c.querySelector('span')).fontSize) } : null; });
  confere(!!chip && chip.texto === '4/12' && chip.fonte >= 14, `o HUD mostra a caixa de ovos: 4/12 (${JSON.stringify(chip)})`);
  await foto('ovos-recolhidos', true);
  const ganhou = await vender();
  const precoOvo = await J(() => window.__jogo.mundo.dados.itens.ovo.venda);
  confere(ganhou >= 4 * precoOvo && (await A('cesto', 'ovo')) === 0, `os ovos se vendem na banca (+${ganhou} de ouro)`);
  confere(await J(() => document.querySelector('.chip.recipiente[data-produto="ovo"]').hidden), 'com a caixa vazia, o HUD esconde a caixa de ovos');

  // ================= o curral, as vacas e o balde =================
  await J(() => window.__a.missoes('curral'));
  const cur = await A('erguer', 'curral');
  if (!confere(!!cur, 'o curral fica pronto')) return;
  await fecharTelas();
  igual(await A('missao'), 'leite', 'com o curral, a missão da vez é a do leite (e ela deu ração e balde)');
  await tocarAbrigo('curral');
  igual(await painel(), 'abrigo', 'tocar no curral abre o painel do abrigo');
  confere(await J(() => /Ainda não mora ninguém/.test(document.querySelector('.veu .corpo').textContent)), 'o curral vazio diz para comprar uma vaca');
  await apertar('comprar-vaca');
  await apertar('comprar-vaca');
  igual((await A('bichos', 'curral')).length, 2, '"Comprar vaca" no painel do curral põe duas vacas');
  confere(await J(() => /Não há vaga/.test(document.querySelector('.veu .abr-comprar').textContent) && !document.querySelector('[data-k="comprar-vaca"]')), 'com o curral cheio, o painel diz que não há vaga');
  await apertar('encher-cocho');
  await apertar('encher-bebedouro');
  await tamanhos('painel do curral');
  await foto('painel-do-curral');
  await fecharPainel();
  await ateParar();
  await fecharTelas();
  const t2 = await A('trato', 'curral');
  confere(t2.cocho > 0 && t2.bebedouro > 0, `o cocho e o bebedouro do curral ficam servidos (${JSON.stringify(t2)})`);
  await J(([x, z]) => window.__jogo.olhar(x, z), [cur.x + 3, cur.z + 2.5]);
  await J(() => window.__jogo.avancar(0)); await quadro(800);
  const vacas = await J(() => window.__bichos().filter((b) => b.especie === 'vaca'));
  confere(vacas.length === 2 && vacas.every((b) => b.cercado && b.x > cur.x + 0.5 && b.x < cur.x + cur.l - 0.5 && b.z > cur.z + 0.5 && b.z < cur.z + cur.p - 0.5), `as vacas ficam dentro do curral (${vacas.map((b) => `${b.x.toFixed(1)},${b.z.toFixed(1)}`).join(' / ')})`);
  await foto('vacas-no-curral', true);
  await pular(3600 + 5);
  if (!comDedo) {
    // teclado e controle: de frente para o curral, o contorno dourado fica nele e o botão de agir mostra o leite; segurar
    // Espaço abre a roda, as setas andam por ela, Esc fecha sem fazer nada; segurar o A do controle abre, o A escolhe
    const lado = await deFrentePara(cur.id);
    if (confere(!!lado, 'há um lado livre do curral para ficar de frente')) {
      await segurarTecla('Space');
      let r = await roda();
      confere(!!r && r[0] === 'ordenhar' && r.includes('abrir'), `segurar Espaço de frente para o curral abre a roda: ordenhar (a principal) e abrir (veio ${JSON.stringify(r)})`);
      igual(await J(() => document.activeElement && document.activeElement.dataset.opcao), 'ordenhar', 'soltar o Espaço deixa o foco na principal da roda');
      const dt = await J((id) => { const d = window.__jogo.cena.destaque, a = document.querySelector('.agir'); return { ent: d.entidade, cor: d.cor, agir: !a.hidden, ic: a.querySelector('canvas').dataset.chave }; }, cur.id);
      confere(dt.ent === cur.id && dt.cor === '#ffe07a', `no teclado, o curral à frente fica com o contorno dourado (${JSON.stringify(dt)})`);
      confere(dt.agir && dt.ic === 'icone/leite', `o botão de agir mostra o desenho da ordenha (veio "${dt.ic}")`);
      await foto('roda-no-teclado');
      await pg.keyboard.press('ArrowRight'); await quadro();
      const foc = await J(() => document.activeElement && document.activeElement.dataset.opcao);
      confere(!!foc && foc !== 'ordenhar', `a seta leva o foco a outra ação da roda (veio "${foc}")`);
      await pg.keyboard.press('Escape'); await quadro();
      confere(!(await roda()), 'Esc fecha a roda');
      igual((await A('fila')).length, 0, 'fechar a roda não faz nada');
      igual((await A('bichos', 'curral')).reduce((n, b) => n + b.pronto, 0), 2, 'o leite segue esperando');
      await segurarBotao(0);
      r = await roda();
      confere(!!r && r[0] === 'ordenhar', `segurar o A do controle abre a roda (veio ${JSON.stringify(r)})`);
      await controle(0);
      confere(!(await roda()), 'o A escolhe a ação focada e a roda fecha');
    } else await principalDoAbrigo('curral', 'ordenhar', 'o curral com leite');
  } else await principalDoAbrigo('curral', 'ordenhar', 'o curral com leite');
  igual(await painel(), null, 'com leite pronto, a principal ordenha (sem abrir o painel)');
  await ateParar();
  await fecharTelas();
  igual(await A('cesto', 'leite'), 2, 'as duas ordenhas vão para o balde');
  igual(await A('missao'), 'queijo', 'duas ordenhas cumprem a missão do leite');
  confere(await J(() => { const c = document.querySelector('.chip.recipiente[data-produto="leite"]'); return !!c && !c.hidden && c.textContent === '2/2' && c.classList.contains('cheio'); }), 'o HUD mostra o balde cheio: 2/2');
  // o balde cheio: o toque abre o painel, que explica; vender esvazia; o botão do painel recolhe
  await pular(3600 + 5);
  await abrirAbrigo('curral', 'o curral com o balde cheio');
  igual(await painel(), 'abrigo', 'com o balde cheio, o toque no curral abre o painel (ordenhar não está na roda)');
  confere(await J(() => { const v = document.querySelector('.veu .abr-aviso'); return !!v && /Balde está cheio/i.test(v.textContent); }), 'o painel diz que o balde está cheio e o que fazer');
  confere(await J(() => document.querySelector('[data-k="recolher"]').classList.contains('sem')), 'o botão de ordenhar fica apagado com o balde cheio');
  await tamanhos('painel do curral (balde cheio)');
  await foto('balde-cheio');
  await fecharPainel();
  await vender();
  igual(await A('cesto', 'leite'), 0, 'o leite se vende na banca');
  await abrirAbrigo('curral', 'o curral com leite');
  if ((await painel()) === 'abrigo') await apertar('recolher');
  igual(await painel(), null, 'ordenhar pelo botão do painel fecha o painel');
  await ateParar();
  igual(await A('cesto', 'leite'), 2, 'ordenhar pelo painel enche o balde de novo');
  await vender();

  // ================= o aprisco, as ovelhas e a tesoura =================
  await J(() => { window.__a.missoes(null, 'ovelhas'); window.__a.dar({ racao: 30 }); });
  const apr = await A('erguer', 'aprisco');
  if (!confere(!!apr, 'o aprisco fica pronto')) return;
  await fecharTelas();
  await abrirAbaAnimais();
  for (let k = 0; k < 3; k++) await tocarEm('.oferta[data-item="ovelha"] [data-k="comprar-ovelha"]');
  igual((await A('bichos', 'aprisco')).length, 3, 'a aba da loja vende três ovelhas para o aprisco');
  confere(await J(() => { const c = document.querySelector('.oferta[data-item="ovelha"]'); return !!c && !!c.querySelector('[data-k="ver-ovelha"]'); }), 'com o aprisco cheio, a ovelha leva ao aprisco (onde está a ampliação)');
  await fecharPainel();
  await abrirAbrigo('aprisco', 'o aprisco com fome');
  igual(await painel(), 'abrigo', 'tocar no aprisco (e "Abrir", quando vem a roda) abre o painel');
  await apertar('encher-cocho');
  await apertar('encher-bebedouro');
  await fecharPainel();
  await ateParar();
  await fecharTelas();
  await pular(4 * 3600 + 5);
  igual((await A('bichos', 'aprisco')).reduce((n, b) => n + b.pronto, 0), 3, 'em 4 horas a lã das três ovelhas cresce');
  confere((await A('tem', 'tesoura-de-tosquia')) === 0, '(sem tesoura ainda)');
  await abrirAbrigo('aprisco', 'o aprisco sem tesoura');
  igual(await painel(), 'abrigo', 'sem tesoura, o toque no aprisco abre o painel (tosquiar não está na roda)');
  confere(await J(() => { const v = document.querySelector('.veu .abr-aviso'); return !!v && /tesoura/i.test(v.textContent) && !!v.querySelector('[data-k="ir-comprar"]'); }), 'o painel diz que falta a tesoura e oferece comprar na loja');
  await tamanhos('painel do aprisco (sem tesoura)');
  await foto('aprisco-sem-tesoura');
  await apertar('ir-comprar');
  igual(await painel(), 'loja', '"Comprar na loja" abre a loja');
  await tocarEm('[data-k="c1-tesoura-de-tosquia"]');
  igual(await A('tem', 'tesoura-de-tosquia'), 1, 'a loja vende a tesoura de tosquia');
  await fecharPainel();
  if (!comDedo) {
    // apertar e soltar o Espaço (sem segurar) de frente para o aprisco faz a principal direto, sem a roda
    if (await deFrentePara(apr.id)) {
      await pg.keyboard.press('Space'); await quadro();
      confere(!(await roda()), 'o Espaço curto não abre a roda');
      confere((await A('fila')).some((x) => /tosquiar/.test(x)) || (await J(() => window.__jogo.mundo.personagem.acao && window.__jogo.mundo.personagem.acao.id === 'tosquiar')), `o Espaço curto faz a principal: tosquiar (fila: ${(await A('fila')).join(', ')})`);
    } else await principalDoAbrigo('aprisco', 'tosquiar', 'o aprisco com lã');
  } else await principalDoAbrigo('aprisco', 'tosquiar', 'o aprisco com lã');
  igual(await painel(), null, 'com a tesoura, a principal tosquia (sem abrir o painel)');
  await ateParar();
  await fecharTelas();
  igual(await A('cesto', 'la'), 3, 'a lã das três ovelhas vai para o cesto');
  confere(await J(() => window.__jogo.mundo.missoes.feitas.includes('ovelhas')), 'três tosquias cumprem a missão das ovelhas');
  await J(([x, z]) => window.__jogo.olhar(x, z), [apr.x + 2.5, apr.z + 2]);
  await J(() => window.__jogo.avancar(0)); await quadro(500);
  const peladas = await J(() => window.__bichos().filter((b) => b.especie === 'ovelha'));
  confere(peladas.length === 3 && peladas.every((b) => b.figura === 'ovelha-tosquiada'), `as ovelhas tosquiadas aparecem peladas (${peladas.map((b) => b.figura).join(', ')})`);
  await foto('ovelhas-tosquiadas', true);
  await vender();

  // ================= fechar e voltar horas depois =================
  await pular(5 * 3600);
  await quadro(200);
  const volta = (await avisos()).join(' | ');
  confere(/Os bichos trabalharam/.test(volta), `na volta, um aviso diz o que os bichos fizeram (avisos: ${volta || 'nenhum'})`);
  await foto('volta-horas-depois', true);

  // ================= gravar e recarregar =================
  const foto1 = await J(() => { const m = window.__jogo.mundo; return JSON.stringify({ lista: m.animais.lista.map((a) => [a.id, a.especie, a.abrigo, a.pronto, a.produzidos, a.fim || '']), abrigos: m.animais.abrigos, vistos: [...m.animais.vistos].sort() }); });
  await J(() => window.__jogo.gravar());
  await pg.reload();
  await pronto(pg);
  const foto2 = await J(() => { const m = window.__jogo.mundo; return JSON.stringify({ lista: m.animais.lista.map((a) => [a.id, a.especie, a.abrigo, a.pronto, a.produzidos, a.fim || '']), abrigos: m.animais.abrigos, vistos: [...m.animais.vistos].sort() }); });
  igual(foto2, foto1, 'recarregar traz os bichos, o que está pronto, o cocho, o bebedouro e o que o Seu Tonho já explicou');
  confere(JSON.parse(foto2).vistos.length >= 4, 'as explicações do Seu Tonho ficam gravadas (não se repetem)');
  // recolhe o que juntou e vende (para a caixa de ovos não encher no fim de vida)
  for (const t of ['galinheiro', 'curral', 'aprisco']) { await tocarAbrigo(t); const r = await roda(); if (r) await naRoda(r[0]); if ((await painel()) !== null) await fecharPainel(); await ateParar(); await fecharTelas(); }
  await vender();

  // ================= ampliar o galinheiro (o comando é da frente de construir; o botão é deste painel) =================
  await abrirAbrigo('galinheiro', 'o galinheiro para ampliar');
  igual(await painel(), 'abrigo', 'o painel do galinheiro abre');
  await apertar('comprar-galinha');
  await apertar('comprar-galinha');
  igual((await A('bichos', 'galinheiro')).length, 4, '"Comprar galinha" no painel completa as quatro vagas');
  confere(await J(() => /Não há vaga/.test(document.querySelector('.veu .abr-comprar').textContent)), 'com as vagas cheias, o painel manda ampliar');
  await apertar('ampliar');
  confere((await A('de', 'galinheiro')).amplia, '"Ampliar" começa a obra do galinheiro');
  confere(await J(() => !!document.querySelector('.veu .cons-obra') && !!document.querySelector('.veu [data-k="concluir"]')), 'durante a obra, o painel mostra o relógio e "Concluir"');
  await tamanhos('painel do galinheiro (ampliando)');
  await foto('ampliando');
  await fecharPainel();
  await pular(900 + 5);
  igual((await A('de', 'galinheiro')).nivel, 2, 'depois do tempo da obra, o galinheiro passa a ter 8 vagas');

  // ================= o fim da vida produtiva =================
  const gs = (await A('bichos', 'galinheiro')).map((b) => b.id);
  await J(([ids]) => {
    const m = window.__jogo.mundo, a = window.__a;
    for (const b of m.animais.lista) if (ids.includes(b.id)) { const k = ids.indexOf(b.id); b.produzidos = k < 3 ? 299 : 275; b.avisou = k < 3; }
    a.dar({ milho: 30 });
    const e = m.construcao.todas.find((o) => o.tipo === 'galinheiro');
    m.comando({ tipo: 'encherCocho', entidade: e.id }); m.comando({ tipo: 'encherBebedouro', entidade: e.id });
  }, [gs]);
  await ateParar();
  await fecharTelas();
  await pular(1200 + 5);
  const fins = await A('bichos', 'galinheiro');
  confere(fins.filter((b) => b.fim === 'espera').length === 3, `três galinhas chegam ao fim da vida produtiva e param (${fins.map((b) => b.fim || '-').join(', ')})`);
  await quadro(300);
  const falaFim = await A('fala'), avFim = (await avisos()).join(' | ');
  confere(/velhinha|descansar|parou/i.test(falaFim + avFim), `o fim (e o fim chegando) é avisado (fala: "${falaFim}", avisos: ${avFim})`);
  await J(([x, z]) => window.__jogo.olhar(x, z), [gal.x + 1.5, gal.z + 1.5]);
  confere((await J(() => window.__baloes().map((b) => b.icone))).includes('ui/relogio'), 'o balão do galinheiro mostra que um bicho espera o destino');
  await foto('fim-de-vida-balao', true);
  await tocarAbrigo('galinheiro'); // a principal da roda recolhe os últimos ovos
  { const r = await roda(); if (r) await naRoda(r[0]); if ((await painel()) !== null) await fecharPainel(); }
  await ateParar(); await fecharTelas();
  await abrirAbrigo('galinheiro', 'o galinheiro no fim de vida');
  igual(await painel(), 'abrigo', 'o painel do galinheiro abre');
  confere(await J(() => document.querySelectorAll('.veu .abr-bicho.fim').length === 3), 'o painel mostra as três galinhas paradas');
  confere(await J(() => /Só mais/.test(document.querySelector('.veu .abr-bicho:not(.fim)') ? document.querySelector('.veu .abr-grade, .veu .abr-bichos').textContent : '')), 'a galinha quase no fim avisa quantos ovos faltam');
  await tamanhos('painel do galinheiro (fim de vida)');
  await foto('painel-fim-de-vida');
  // 1: fica de estimação
  await apertar('destino-' + gs[0]);
  confere(await J(() => !!document.querySelector('.veu .abr-fim') && document.querySelectorAll('.veu .abr-saida').length === 3), 'a tela do destino tem as três saídas');
  await tamanhos('tela do destino');
  await foto('tela-do-destino');
  await apertar('destino-estimacao');
  igual((await A('bichos', 'galinheiro')).find((b) => b.id === gs[0]).fim, 'estimacao', '"Ficar com ela" deixa a galinha de estimação');
  confere(await J((id) => !!document.querySelector(`.veu .abr-bicho.estimacao[data-animal="${id}"]`), gs[0]), 'o cartão diz que ela é de estimação');
  // 2: frigorífico (com a pergunta), 3: "decidir depois" e depois fazendeiro
  let ouroAntes = await A('ouro');
  await apertar('destino-' + gs[1]);
  await apertar('destino-frigorifico');
  confere(await J(() => !!document.querySelector('.subida.dialogo')), 'vender pergunta antes');
  await foto('pergunta-de-venda');
  if (comDedo) await tocarEm('.subida.dialogo [data-k="sim"]'); else await teclar('sim');
  igual((await A('ouro')) - ouroAntes, 25, 'o frigorífico paga 25 pela galinha');
  confere(!(await A('bichos', 'galinheiro')).some((b) => b.id === gs[1]), 'a galinha vendida sai do galinheiro');
  await apertar('destino-' + gs[2]);
  await apertar('depois');
  confere(await J(() => !document.querySelector('.veu .abr-fim')), '"Decidir depois" volta ao painel sem mudar nada');
  igual((await A('bichos', 'galinheiro')).find((b) => b.id === gs[2]).fim, 'espera', 'a galinha continua esperando o destino');
  ouroAntes = await A('ouro');
  await apertar('destino-' + gs[2]);
  await apertar('destino-fazendeiro');
  if (comDedo) await tocarEm('.subida.dialogo [data-k="sim"]'); else await teclar('sim');
  igual((await A('ouro')) - ouroAntes, 35, 'o fazendeiro paga 35 pela galinha');
  igual((await A('bichos', 'galinheiro')).length, 2, 'ficam a de estimação e a que ainda produz');
  await foto('depois-do-destino');
  await fecharPainel();

  // ---- bicho de trabalho no painel do abrigo (o estábulo e o boi são da frente de trabalho): um de cada basta
  await J(() => { window.__jogo.mundo.posses.ouro += 20000; window.__a.dar({ tabua: 40, pedra: 20, prego: 40 }); });
  const est = await A('erguer', 'estabulo');
  if (confere(!!est, 'o estábulo fica pronto')) {
    await J(() => window.__jogo.mundo.comando({ tipo: 'comprarAnimal', animal: 'boi' }));
    igual((await A('bichos', 'estabulo')).filter((b) => b.especie === 'boi').length, 1, 'há um boi no estábulo');
    await J((id) => window.__jogo.abrirPainel('abrigo', { entidade: id }), est.id); await quadro(400);
    confere(await J(() => !!document.querySelector('.veu .abr-bicho') && !document.querySelector('.veu [data-k="comprar-boi"]')), 'com um boi no estábulo, o painel não vende outro');
    const cartaoDoBoi = await J(() => { const c = document.querySelector('.veu .abr-bicho'); return c ? { fome: c.classList.contains('fome'), texto: c.textContent } : null; });
    confere(!cartaoDoBoi.fome || /trabalha pela metade/.test(cartaoDoBoi.texto), `o boi sem trato "trabalha pela metade", não "produz" (${cartaoDoBoi.texto})`);
    await fecharPainel();
    await abrirAbaAnimais();
    confere(await J(() => { const c = document.querySelector('.oferta.animal[data-item="boi"]'); return !!c && /um basta/.test(c.textContent) && !c.querySelector('[data-k="comprar-boi"]'); }), 'na loja, o cartão do boi diz que um basta e não vende outro');
    await fecharPainel();
  }
  confere(a.erros.length === 0, `${f}: erro no console: ${a.erros.slice(0, 3).join(' | ')}`);
}

try {
  console.log('1280x720, mouse, teclado e controle');
  let a = await abrir(1280, 720);
  await cenario(a, 'b-pc');
  await a.ctx.close();

  console.log('844x390, celular deitado, toque');
  a = await abrir(844, 390, { toque: true, dpr: 2 });
  await cenario(a, 'b-cel');
  await a.ctx.close();
} catch (err) {
  falhas.push('a verificação parou: ' + (err && err.stack ? err.stack.split('\n').slice(0, 4).join(' ') : err));
  console.log('  ✗ ' + falhas[falhas.length - 1]);
}

await nav.close();
await srv.fechar();
console.log(`\n${feitos} conferências, ${falhas.length} falha(s). Capturas em ${path.relative(process.cwd(), capturas) || '.'}/`);
if (falhas.length) { console.log('\nFalhas:\n' + falhas.map((x) => ' - ' + x).join('\n')); process.exit(1); }
console.log('Tudo certo.');
