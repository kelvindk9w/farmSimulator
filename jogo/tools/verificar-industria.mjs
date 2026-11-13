// Confere as indústrias e o quadro de pedidos no jogo montado, num Chromium sem janela, com clique, dedo e teclado
// de verdade: 1280x720 (mouse e teclado) e 844x390 (celular deitado, toque).
// Joga de ponta a ponta: constrói a bancada, serra 4 tábuas (fila, espera, retirar pelo painel e pelo toque), tira da
// fila e muda a ordem, abre a terceira vaga com ouro (bancada) e com cash (moinho), mói fubá e ração, termina uma
// receita com cash, assa um bolo de fubá, embala uma dúzia, entrega um pedido, troca outro, vê a espera, fecha e volta
// horas depois, grava e recarrega. Confere os tamanhos mínimos (texto de 14 px, botão de 44 px), que nada vaza dos
// painéis e que não há erro no console. As fotos vão para a pasta de capturas (JPEG).
//   JOGO_DIST=dist-c JOGO_CAPTURAS=capturas-c JOGO_PORTA=8103 node tools/verificar-industria.mjs   (monte antes)
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
    window.__i = {
      de(tipo) { const e = j.mundo.construcao.todas.find((o) => o.tipo === tipo); return e ? { id: e.id, x: e.x, z: e.z, l: e.l, p: e.p, obra: e.obraAte > 0, nivel: e.nivel || 1 } : null; },
      ind(tipo) { const e = j.mundo.construcao.todas.find((o) => o.tipo === tipo), st = e && j.mundo.industria.de[e.id]; return { fila: st ? [...st.fila] : [], fazendo: !!(st && st.inicio), saida: st ? [...st.saida] : [] }; },
      tem(item) { const P = j.mundo.posses; return (P.bolsa[item] || 0) + (P.celeiro.itens[item] || 0) + (P.cesto.itens[item] || 0); },
      // põe itens no estoque como se tivessem sido colhidos ou comprados: colheita e produto no celeiro, o resto na bolsa
      dar(itens) { const m = j.mundo; for (const k in itens) { const t = m.dados.itens[k].tipo, onde = t === 'colheita' || t === 'produto' ? m.posses.celeiro.itens : m.posses.bolsa; onde[k] = (onde[k] || 0) + itens[k]; } m.eventos.emitir('verificou', {}); },
      // as missões do vizinho até "ate" (sem ela) ficam cumpridas; com "so", todas menos essa
      missoes(ate, so) { const m = j.mundo, L = m.dados.missoes.vizinho.map((x) => x.id); m.missoes.feitas = so ? L.filter((x) => x !== so) : L.slice(0, L.indexOf(ate)); m.missoes.de = null; m.missoes.conta = 0; },
      nivel(n, menos = 0) { const m = j.mundo; m.progresso.nivel = n; m.progresso.xp = m.dados.niveis.limiar[n] + (menos ? m.dados.niveis.limiar[n + 1] - m.dados.niveis.limiar[n] - menos : 0); },
      pedidos() { return JSON.parse(JSON.stringify(j.mundo.pedidos.vagas.map((v) => (v.pedido ? { ...v.pedido } : null)))); },
      serve(x, z) { const loc = j.mundo.local, i = loc.dentro(x, z) ? loc.i(x, z) : -1; return i >= 0 && loc.propria[i] === 1 && loc.chao[i] === 0 && !loc.ocupa[i] && !loc.plantas[i] && !loc.entidadeEm(x, z); },
      // retângulos l × p de grama livre (com uma casa de folga em volta), do mais perto de (cx, cz) ao mais longe
      livres(l, p, cx, cz) {
        const loc = j.mundo.local, out = [];
        for (let z = 1; z <= loc.p - p - 1; z++) for (let x = 1; x <= loc.l - l - 1; x++) {
          let ok = true;
          for (let dz = -1; dz < p + 1 && ok; dz++) for (let dx = -1; dx < l + 1 && ok; dx++) if (!this.serve(x + dx, z + dz)) ok = false;
          if (ok) out.push([x, z]);
        }
        return out.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cz) - Math.hypot(b[0] - cx, b[1] - cz));
      },
      // ergue uma construção pelo comando (as obras são da frente de construir; aqui interessa o que vem depois)
      erguer(tipo, perto) {
        const m = j.mundo, d = m.dados.construcoes[tipo];
        for (const [x, z] of this.livres(d.casas[0], d.casas[1], perto[0], perto[1]).slice(0, 40)) { const r = m.comando({ tipo: 'construir', id: tipo, x, z, jaJa: true, quieto: true }); if (r.ok) { j.pular((d.obraSeg || 0) + 1); j.avancar(0.2); return this.de(tipo); } }
        return null;
      },
      // texto menor que 14 px e botão menor que 44 px dentro de "raiz"
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
        for (const n of corpo.querySelectorAll('.oferta, .ped-bilhete, .ind-fazendo, .ind-espera, .ind-vaga, .ind-pronto, .ind-dica')) { if (n.scrollWidth > n.clientWidth + 2) ruins.push(`"${n.className}" não cabe na largura (${n.scrollWidth} em ${n.clientWidth}): ${n.textContent.slice(0, 30)}`); }
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

// as ações do jogador, com o ponteiro da vez (mouse ou dedo)
function jogador(a, prefixo) {
  const { pg, cdp } = a;
  const J = (f, arg) => pg.evaluate(f, arg);
  const quadro = async (ms = 90) => { await J(() => window.__jogo.desenhar()); await esperar(ms); };
  const tocarXY = async (x, y) => { if (cdp) await dedo(cdp, x, y); else await pg.mouse.click(x, y); await esperar(70); };
  const foto = async (nome, comAvisos = false) => { if (!comAvisos) await pg.waitForFunction(() => window.__jogo.avisos().length === 0, null, { timeout: 9000 }).catch(() => {}); await J(() => window.__jogo.desenhar()); await esperar(380); await pg.screenshot({ path: path.join(capturas, `${prefixo}-${nome}.jpg`), type: 'jpeg', quality: 84 }); };
  const painel = () => J(() => window.__jogo.painelAberto());
  const tem = (item) => J((k) => window.__i.tem(k), item);
  const ind = (tipo) => J((t) => window.__i.ind(t), tipo);
  const avisos = () => J(() => window.__jogo.avisos());
  const avisou = async (re, texto) => { const l = await avisos(); confere(l.some((t) => re.test(t)), `${texto} (avisos: ${l.join(' | ') || 'nenhum'})`); };
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
  // toca numa construção do terreno (a câmera vai até ela antes)
  async function tocarConstrucao(tipo, alto = 0.5) {
    const e = await J((t) => window.__i.de(t), tipo);
    if (!confere(!!e, `a construção "${tipo}" existe`)) return;
    await J(([x, z]) => window.__jogo.olhar(x, z), [e.x + e.l / 2, e.z + e.p / 2]);
    const p = await J(([id, alto]) => { const p = window.__jogo.daEntidade(id, alto), n = document.elementFromPoint(p.x, p.y); return { ...p, livre: !!n && n.id === 'tela', quem: n ? n.className || n.id : 'nada' }; }, [e.id, alto]);
    confere(p.livre, `"${tipo}" devia estar livre para o toque, mas há "${p.quem}" por cima`);
    await tocarXY(p.x, p.y);
    await quadro();
  }
  const ateParar = async () => { const s = await J(() => window.__jogo.ateParar(300)); if (s < 0) confere(false, 'a personagem não parou em 300 s'); await quadro(); return s; };
  const fecharPainel = async () => { if ((await painel()) === null) return; if (cdp) await tocarEm('.veu .fechar'); else { await pg.keyboard.press('Escape'); await quadro(); } };
  // telas de recompensa (prêmio de missão, subida de nível, presente): fecha as que houver
  async function fecharTelas() {
    for (let k = 0; k < 8 && (await J(() => !!document.querySelector('.subida:not(.dialogo)'))); k++) {
      await esperar(700);
      const b = await J(() => { const n = document.querySelector('.subida:not(.dialogo) .cartao > .bt, .subida:not(.dialogo) button'); if (!n) return null; n.scrollIntoView({ block: 'center' }); const r = n.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return { x, y, livre: !!e && (e === n || n.contains(e)) }; });
      if (b && b.livre) await tocarXY(b.x, b.y); else await J(() => window.__jogo.fecharSubida());
      await quadro(200);
    }
  }
  const tamanhos = async (onde, seletor = '.veu') => { const r = await J((s) => window.__i.pequenos(s), seletor); confere(r.length === 0, `${onde}: ${r.slice(0, 5).join('; ')}`); const c = await J(() => window.__i.cabe()); if (seletor === '.veu') confere(!c, `${onde}: ${c}`); };
  return { pg, cdp, J, quadro, tocarXY, foto, painel, tem, ind, avisos, avisou, tocarEm, tocarConstrucao, ateParar, fecharPainel, fecharTelas, tamanhos };
}
const semErros = (a, onde) => confere(a.erros.length === 0, `${onde}: erro no console: ${a.erros.slice(0, 3).join(' | ')}`);

try {
  // =====================================================================================================
  console.log('1280x720, mouse e teclado');
  let a = await abrir(1280, 720);
  let o = jogador(a, 'c'), { pg, J } = o;
  await o.fecharTelas();

  // ---- antes do nível 3, o toque no quadro explica que ele abre depois
  await o.tocarConstrucao('quadro-de-pedidos');
  igual(await o.painel(), null, 'antes do nível 3 o quadro não abre');
  await o.avisou(/quadro de pedidos abre no nível 3/i, 'o toque no quadro fechado diz em que nível ele abre');
  await o.foto('01-quadro-fechado', true);

  // ---- começo: nível 12, ouro, cash e materiais pelo gancho de teste; a missão da vez é construir a bancada
  await J(() => { const m = window.__jogo.mundo; window.__i.nivel(12); m.posses.ouro = 9000; m.posses.cash = 40; window.__i.dar({ madeira: 20, tabua: 30, prego: 40, pedra: 30 }); window.__i.missoes('bancada-de-carpintaria'); window.__jogo.avancar(1.2); });
  await o.quadro();
  igual(await J(() => window.__jogo.estado().missao.id), 'bancada-de-carpintaria', 'a missão da vez é construir a bancada');

  // ---- construir a bancada pela interface: catálogo, escolher o lugar com as setas, Enter, ela martela, a obra anda
  await o.tocarEm('.topo-dir [data-painel="construir"]');
  igual(await o.painel(), 'construir', 'o botão do HUD abre o catálogo de construir');
  await o.tocarEm('[data-k="aba-industria"]');
  await o.tocarEm('.oferta[data-item="bancada-de-carpintaria"] [data-k="c-bancada-de-carpintaria"]');
  let md = await J(() => window.__jogo.J.colocacao());
  if (confere(!!md && md.id === 'bancada-de-carpintaria', 'escolher a bancada liga o modo de escolher o lugar')) {
    const eu = await J(() => window.__jogo.estado().personagem);
    const lugares = await J(([x, z]) => window.__i.livres(2, 1, x, z).slice(0, 6), [eu.x, eu.z + 2]);
    for (const [tx, tz] of lugares) {
      md = await J(() => window.__jogo.J.colocacao());
      for (let k = Math.abs(tx - md.x); k > 0; k--) await pg.keyboard.press(tx > md.x ? 'ArrowRight' : 'ArrowLeft');
      for (let k = Math.abs(tz - md.z); k > 0; k--) await pg.keyboard.press(tz > md.z ? 'ArrowDown' : 'ArrowUp');
      await o.quadro();
      md = await J(() => window.__jogo.J.colocacao());
      if (md && md.ok) break;
    }
    confere(md && md.ok, 'há um lugar bom para a bancada perto dela');
    await pg.keyboard.press('Enter');
    await o.quadro();
    await o.ateParar();
    await J(() => { window.__jogo.pular(21); window.__jogo.avancar(0.3); });
    await o.quadro();
  }
  let banc = await J(() => window.__i.de('bancada-de-carpintaria'));
  if (!confere(!!banc && !banc.obra, 'a bancada de carpintaria fica pronta')) throw new Error('sem bancada não há o que conferir');
  await o.fecharTelas();
  igual(await J(() => window.__jogo.estado().missao.id), 'tabuas', 'com a bancada pronta, a missão da vez é serrar tábuas');
  igual(await J(() => window.__jogo.guia().tipo), 'entidade', 'o guia da missão aponta a bancada');

  // ---- o painel da bancada: duas abas, a dica do Seu Tonho, a receita com o que tem e o que precisa
  await o.tocarConstrucao('bancada-de-carpintaria', 0.3);
  igual(await o.painel(), 'industria', 'o toque na bancada pronta abre o painel dela');
  igual(await J(() => document.querySelector('.veu header .titulo').textContent), 'Bancada de carpintaria', 'o painel leva o nome da construção');
  confere(await J(() => !!document.querySelector('[data-k="ind-aba-produzir"].ativo') && !!document.querySelector('[data-k="ind-aba-construir"]')), 'a bancada tem as abas Produzir (aberta) e Construir');
  igual(await J(() => (document.querySelector('.ind-dica') || { dataset: {} }).dataset.dica), 'fila', 'na primeira vez o Seu Tonho explica como pôr uma receita na fila');
  const mad0 = await o.tem('madeira'); // (a obra da bancada gastou 6 das 20)
  igual(mad0, 14, 'a obra da bancada gastou 6 madeiras');
  confere(await J((tem) => { const c = document.querySelector('.ind-receita[data-receita="tabua"]'); return !!c && /Tábua/.test(c.textContent) && /20 s/.test(c.textContent) && /Madeira/.test(c.textContent) && c.textContent.includes(tem + '/2') && !!c.querySelector('.ind-ficha.tem'); }, mad0), 'a receita da tábua mostra o tempo e a madeira (tem 14, precisa 2) em verde');
  confere(await J(() => { const b = document.querySelector('[data-k="fazer-tabua"]'); return !b.classList.contains('sem') && b.classList.contains('alvo-tutorial'); }), 'o botão Fazer da tábua está aceso e marcado pela missão');
  confere(await J(() => !!document.querySelector('.veu [data-k="mover"]')), 'o painel oferece "Mudar de lugar"');
  confere(await J(() => document.querySelectorAll('.ind-vaga:not(.trancada)').length === 2 && /0 de 2 vagas/.test(document.querySelector('.ind').textContent)), 'a fila começa com 2 vagas livres');
  await o.tamanhos('painel da bancada');
  await o.foto('02-bancada-produzir');
  // a aba Construir é o catálogo da frente de construir, dentro do mesmo painel
  await o.tocarEm('[data-k="ind-aba-construir"]');
  confere(await J(() => !!document.querySelector('.ind-construir .cons') && !!document.querySelector('.ind-construir .oferta')), 'a aba Construir mostra o catálogo dentro do painel da bancada');
  await o.tamanhos('aba Construir da bancada');
  await o.foto('03-bancada-construir');
  await o.tocarEm('[data-k="ind-aba-produzir"]');
  confere(await J(() => !!document.querySelector('[data-k="fazer-tabua"]')), 'voltar para a aba Produzir traz as receitas de volta');

  // ---- pôr na fila: os ingredientes saem, a primeira anda no relógio, a segunda espera, a terceira não cabe
  await o.tocarEm('[data-k="fazer-tabua"]');
  igual(await o.tem('madeira'), mad0 - 2, 'pôr a tábua na fila gasta 2 madeiras');
  confere(await J(() => !!document.querySelector('.ind-fazendo[data-receita="tabua"] .barra') && /falta 20 s/.test(document.querySelector('.ind-falta').textContent)), 'a receita em curso aparece com barra e tempo que falta');
  igual(await J(() => (document.querySelector('.ind-dica') || { dataset: {} }).dataset.dica), 'retirar', 'com a primeira receita na fila, a dica passa a ser a de esperar e retirar');
  await o.tocarEm('[data-k="fazer-tabua"]');
  igual((await o.ind('bancada-de-carpintaria')).fila.length, 2, 'a segunda tábua entra na fila');
  confere(await J(() => document.querySelectorAll('.ind-espera').length === 1 && /Espera a vez/.test(document.querySelector('.ind-espera').textContent) && /2 de 2 vagas/.test(document.querySelector('.ind').textContent)), 'a segunda espera a vez e a fila mostra 2 de 2 vagas');
  confere(await J(() => document.querySelector('[data-k="fazer-tabua"]').classList.contains('sem')), 'com a fila cheia o botão Fazer apaga');
  await o.tocarEm('[data-k="fazer-tabua"]');
  igual(await o.tem('madeira'), mad0 - 4, 'com a fila cheia nada é gasto');
  await o.avisou(/fila está cheia/i, 'o jogo explica que a fila está cheia');
  await J(() => window.__jogo.avancar(5));
  await esperar(450);
  confere(await J(() => /falta 15 s/.test(document.querySelector('.ind-falta').textContent)), 'o tempo que falta anda com o relógio');
  confere(await J(() => { const t = document.querySelector('.ind-anda .barra i').style.transform; const v = parseFloat((t.match(/scaleX\(([\d.]+)\)/) || [])[1]); return v > 0.2 && v < 0.3; }), 'a barra mostra um quarto do caminho aos 5 de 20 segundos');
  confere(await J(() => { const b = document.querySelector('[data-k="concluir"]'); return !!b && !b.hidden && /Terminar agora/.test(b.textContent); }), 'há o botão Terminar agora na receita em curso');
  await o.tamanhos('fila da bancada');
  await o.foto('04-bancada-fila');

  // ---- tirar da fila devolve os ingredientes
  await o.tocarEm('[data-k="dica-ok"]');
  igual(await J(() => (document.querySelector('.ind-dica') || { dataset: {} }).dataset.dica), 'cancelar', 'depois do "Entendi", vem a dica de tirar da fila e mudar a ordem');
  await o.tocarEm('[data-k="cancelar-1"]');
  igual(await o.tem('madeira'), mad0 - 2, 'tirar da fila a que esperava devolve as 2 madeiras');
  igual((await o.ind('bancada-de-carpintaria')).fila.length, 1, 'a fila fica com uma receita');
  await o.avisou(/ingredientes voltaram/i, 'o jogo avisa que os ingredientes voltaram');

  // ---- a terceira vaga, com ouro
  confere(await J(() => { const v = document.querySelector('.ind-vaga.trancada'); return !!v && /Vaga a mais/.test(v.textContent) && /1\.000/.test(v.querySelector('[data-k="vaga-ouro"]').textContent) && /15/.test(v.querySelector('[data-k="vaga-cash"]').textContent); }), 'a vaga trancada mostra o cadeado e os dois preços (1.000 de ouro ou 15 de cash)');
  igual(await J(() => (document.querySelector('.ind-dica') || { dataset: {} }).dataset.dica), 'vaga', 'o Seu Tonho explica a vaga a mais');
  await o.foto('05-bancada-vaga-trancada');
  const ouro0 = await J(() => window.__jogo.mundo.posses.ouro);
  await o.tocarEm('[data-k="vaga-ouro"]');
  confere(await J(() => { const d = document.querySelector('.dialogo'); return !!d && /1\.000 de ouro/.test(d.textContent) && !!d.querySelector('[data-k="sim"]') && !!d.querySelector('[data-k="nao"]'); }), 'abrir a vaga pergunta antes, mostrando o preço');
  await o.tamanhos('pergunta da vaga', '.dialogo');
  await o.foto('06-pergunta-da-vaga');
  await o.tocarEm('.dialogo [data-k="sim"]');
  igual(await J(() => window.__jogo.mundo.posses.ouro), ouro0 - 1000, 'a terceira vaga custa 1.000 de ouro');
  confere(await J(() => /1 de 3 vagas/.test(document.querySelector('.ind').textContent)), 'a fila passa a ter 3 vagas');
  confere(await J(() => !document.querySelector('.ind-dica')), 'depois de abrir a vaga, o Seu Tonho não repete as dicas');

  // ---- três na fila, esperar, retirar pelo painel
  await o.tocarEm('[data-k="fazer-tabua"]');
  await o.tocarEm('[data-k="fazer-tabua"]');
  igual((await o.ind('bancada-de-carpintaria')).fila.length, 3, 'três tábuas na fila');
  confere(await J(() => !!document.querySelector('[data-k="descer-1"]') && !!document.querySelector('[data-k="subir-2"]') && !document.querySelector('[data-k="subir-1"]')), 'as que esperam têm os botões de mudar a ordem (a que está sendo feita não)');
  await o.foto('07-bancada-tres-na-fila');
  const xp0 = await J(() => window.__jogo.mundo.progresso.xp), tab0 = await o.tem('tabua');
  await J(() => window.__jogo.avancar(16));
  await o.quadro(200);
  confere(await J(() => { const p = document.querySelector('.ind-pronto'); return !!p && /Tábua/.test(p.textContent) && /×1/.test(p.textContent) && !!p.querySelector('[data-k="retirar"]'); }), 'a tábua pronta aparece em "Pronto para retirar"');
  await o.foto('08-bancada-pronto');
  await o.tocarEm('[data-k="retirar"]');
  igual(await o.tem('tabua'), tab0 + 1, 'Retirar tudo põe a tábua no estoque');
  igual(await J(() => window.__jogo.mundo.progresso.xp), xp0 + 1, 'retirar dá a experiência da receita');
  igual(await J(() => window.__jogo.estado().missao.conta), 1, 'a tábua retirada conta para a missão');
  await o.avisou(/\+1 × tábua/i, 'o jogo mostra o que foi retirado');

  // ---- teclado: as setas andam pelos botões, Enter faz, Esc fecha
  await J(() => document.querySelector('[data-k="fazer-tabua"]').focus());
  await pg.keyboard.press('Enter');
  await o.quadro();
  igual((await o.ind('bancada-de-carpintaria')).fila.length, 3, 'Enter no botão focado põe outra tábua na fila');
  igual(await J(() => document.activeElement && document.activeElement.dataset.k), 'fazer-tabua', 'o foco continua no botão depois de refazer o painel');
  const focoK = () => J(() => (document.activeElement && document.activeElement.closest('.veu') && (document.activeElement.dataset.k || document.activeElement.className)) || '');
  for (let k = 0; k < 4 && !/^cancelar-/.test(await focoK()); k++) await pg.keyboard.press('ArrowRight');
  for (let k = 0; k < 3 && (await focoK()) !== 'cancelar-2'; k++) await pg.keyboard.press('ArrowDown');
  igual(await focoK(), 'cancelar-2', 'com as setas se chega ao botão de tirar da fila');
  await pg.keyboard.press('ArrowLeft');
  igual(await focoK(), 'subir-2', 'a seta para a esquerda vai ao botão de passar para a frente');
  await pg.keyboard.press('Enter');
  await o.quadro();
  igual(await focoK(), 'descer-1', 'depois de passar para a frente, o foco acompanha a receita (na seta que sobrou, não no X)');
  await pg.keyboard.press('ArrowRight');
  igual(await focoK(), 'cancelar-1', 'e a seta para a direita chega ao botão de tirar essa da fila');
  await pg.keyboard.press('Enter');
  await o.quadro();
  igual((await o.ind('bancada-de-carpintaria')).fila.length, 2, 'Enter no botão focado tira a receita da fila');
  const k0 = await focoK();
  confere(!!k0, 'depois de tirar da fila, o foco continua dentro do painel');
  await pg.keyboard.press('ArrowDown');
  const k1 = await focoK();
  confere(!!k1 && k1 !== k0, `a seta para baixo leva o foco a outro botão do painel (de "${k0}" para "${k1}")`);
  await pg.keyboard.press('Tab');
  const k2 = await focoK();
  confere(!!k2 && k2 !== k1, `Tab anda pelos botões do painel (de "${k1}" para "${k2}")`);
  await pg.keyboard.press('Escape');
  igual(await o.painel(), null, 'Esc fecha o painel da indústria');

  // ---- no terreno: o balão do que está sendo feito e o balão do que ficou pronto; o toque retira direto
  await J(([x, z]) => window.__jogo.olhar(x, z), [banc.x + 1, banc.z + 0.5]);
  await o.foto('09-balao-fazendo');
  await J(() => window.__jogo.avancar(21));
  await o.quadro(200);
  igual((await o.ind('bancada-de-carpintaria')).saida.length, 1, 'a segunda tábua ficou pronta e espera na saída');
  await o.avisou(/Tábua: ficou pronto/i, 'o jogo avisa que a receita ficou pronta');
  await o.foto('10-balao-pronto');
  igual(await J(() => window.__jogo.estado().modo.id), 'mao', 'ela está no modo mão');
  await o.tocarConstrucao('bancada-de-carpintaria', 0.3);
  igual(await o.painel(), null, 'no modo mão, o toque na bancada com coisa pronta não abre o painel');
  confere(await J(() => window.__jogo.ocupada()), 'ela vai até a bancada retirar');
  await o.ateParar();
  igual(await o.tem('tabua'), tab0 + 2, 'o toque retira a tábua pronta');
  await J(() => window.__jogo.avancar(21));
  await o.tocarConstrucao('bancada-de-carpintaria', 0.3);
  await o.ateParar();
  igual(await o.tem('tabua'), tab0 + 3, 'a terceira tábua também sai com um toque');
  // sem nada pronto, o toque abre o painel; a quarta tábua fica pronta com o jogo fechado
  await o.tocarConstrucao('bancada-de-carpintaria', 0.3);
  igual(await o.painel(), 'industria', 'sem nada pronto, o toque abre o painel');
  await o.tocarEm('[data-k="fazer-tabua"]');
  await J(() => window.__jogo.pular(30));
  await o.quadro(200);
  await o.tocarEm('[data-k="retirar"]');
  igual(await o.tem('tabua'), tab0 + 4, 'a quarta tábua ficou pronta com o jogo fechado e foi retirada');
  await esperar(500);
  confere(await J(() => !!document.querySelector('.subida:not(.dialogo)')), 'a missão das tábuas dá o prêmio (a picareta) numa tela de recompensa');
  await o.fecharTelas();
  confere(await J(() => window.__jogo.estado().feitas.includes('tabuas')), 'a missão "tabuas" foi cumprida com 4 tábuas');
  await o.fecharPainel();

  // ---- o moinho: fubá e ração, a terceira vaga com cash, mudar a ordem, terminar agora, tirar a que está sendo feita
  await J(() => { window.__i.missoes(null, 'moinho'); window.__i.dar({ milho: 12 }); });
  const moinho = await J((p) => window.__i.erguer('moinho', p), [banc.x, banc.z + 4]);
  if (!confere(!!moinho && !moinho.obra, 'o moinho foi erguido e está pronto')) throw new Error('sem moinho');
  await o.fecharTelas();
  await o.tocarConstrucao('moinho', 0.6);
  igual(await o.painel(), 'industria', 'o toque no moinho abre o painel dele');
  confere(await J(() => !document.querySelector('[data-k="ind-aba-construir"]')), 'só a bancada de carpintaria tem a aba Construir');
  confere(await J(() => { const t = document.querySelector('.ind-receita.travada[data-receita="polvilho"]'); return !!t && /Nível 18/.test(t.textContent) && !t.querySelector('button'); }), 'a receita de nível maior aparece esmaecida, com "Nível 18" e sem botão');
  confere(await J(() => document.querySelector('[data-k="fazer-fuba"]').classList.contains('alvo-tutorial')), 'a missão do moinho marca o botão do fubá');
  await o.tamanhos('painel do moinho');
  await o.foto('11-moinho');
  const cash0 = await J(() => window.__jogo.mundo.posses.cash);
  await o.tocarEm('[data-k="vaga-cash"]');
  confere(await J(() => /15 de cash/.test((document.querySelector('.dialogo') || { textContent: '' }).textContent)), 'abrir a vaga com cash pergunta antes, mostrando o preço');
  await o.tocarEm('.dialogo [data-k="sim"]');
  igual(await J(() => window.__jogo.mundo.posses.cash), cash0 - 15, 'a terceira vaga do moinho custa 15 de cash');
  await o.tocarEm('[data-k="fazer-fuba"]');
  await o.tocarEm('[data-k="fazer-racao"]');
  await o.tocarEm('[data-k="fazer-fuba"]');
  igual(JSON.stringify((await o.ind('moinho')).fila), '["fuba","racao","fuba"]', 'fubá, ração e fubá na fila');
  igual(await o.tem('milho'), 3, 'as três receitas gastaram 9 milhos');
  await o.tocarEm('[data-k="descer-1"]');
  igual(JSON.stringify((await o.ind('moinho')).fila), '["fuba","fuba","racao"]', 'a seta para baixo passa a ração para trás');
  await o.tocarEm('[data-k="subir-2"]');
  igual(JSON.stringify((await o.ind('moinho')).fila), '["fuba","racao","fuba"]', 'a seta para cima traz a ração de volta para a frente');
  await o.foto('12-moinho-fila');
  // terminar agora: 2 minutos custam cash, e o jogo pergunta antes
  await o.tocarEm('[data-k="concluir"]');
  confere(await J(() => { const d = document.querySelector('.dialogo'); return !!d && /Fubá/.test(d.textContent) && !!d.querySelector('[data-k="sim"]'); }), 'Terminar agora pergunta antes, com o nome da receita e o preço');
  await o.foto('13-terminar-agora');
  await o.tocarEm('.dialogo [data-k="sim"]');
  const st1 = await o.ind('moinho');
  confere(st1.saida.length === 1 && st1.saida[0] === 'fuba' && st1.fila.length === 2 && st1.fazendo, 'o fubá fica pronto na hora e a ração começa');
  confere((await J(() => window.__jogo.mundo.posses.cash)) < cash0 - 15, 'terminar agora gasta cash');
  // tirar da fila a que está sendo feita: pergunta, devolve os ingredientes e a seguinte começa
  await J(() => window.__jogo.avancar(30));
  await o.tocarEm('[data-k="cancelar-0"]');
  confere(await J(() => /tempo que já passou se perde/.test((document.querySelector('.dialogo') || { textContent: '' }).textContent)), 'tirar a que está sendo feita avisa que o tempo passado se perde');
  await o.foto('14-pergunta-de-tirar');
  await o.tocarEm('.dialogo [data-k="sim"]');
  igual(await o.tem('milho'), 6, 'os 3 milhos da ração voltam');
  igual(JSON.stringify((await o.ind('moinho')).fila), '["fuba"]', 'fica o fubá, que começa a ser feito');
  await o.tocarEm('[data-k="fazer-racao"]');
  await o.fecharPainel();

  // ---- fechar e voltar horas depois: gravar, recarregar, pular 3 horas; tudo pronto, na ordem, esperando na saída
  await J(() => window.__jogo.gravar());
  const antes = await J(() => JSON.stringify({ ind: window.__jogo.mundo.salvar().sistemas.industria, ped: window.__jogo.mundo.salvar().sistemas.pedidos }));
  await pg.reload();
  await pronto(pg);
  igual(await J(() => JSON.stringify({ ind: window.__jogo.mundo.salvar().sistemas.industria, ped: window.__jogo.mundo.salvar().sistemas.pedidos })), antes, 'recarregar a página traz as filas, as saídas e os pedidos como estavam');
  await J(() => { window.__jogo.pular(3 * 3600); window.__jogo.avancar(1.2); });
  await o.quadro(200);
  igual(JSON.stringify(await o.ind('moinho')), '{"fila":[],"fazendo":false,"saida":["fuba","fuba","racao"]}', 'três horas depois as duas receitas estão prontas, na ordem, junto com a que já esperava');
  await J(([x, z]) => window.__jogo.olhar(x, z), [moinho.x + 1.5, moinho.z + 1.5]);
  await o.foto('15-de-volta-horas-depois');
  await o.tocarConstrucao('moinho', 0.6);
  await o.ateParar();
  igual(await o.tem('fuba'), 2, 'o toque no moinho retira os 2 fubás');
  igual(await o.tem('racao'), 2, 'e as 2 rações');
  confere(await J(() => window.__jogo.estado().feitas.includes('moinho')), 'a missão "moinho" foi cumprida com 2 fubás');
  await o.fecharTelas();

  // ---- a cozinha: bolo de fubá (fubá do moinho e ovos)
  await J(() => { window.__i.missoes(null, 'cozinha'); window.__i.dar({ ovo: 14 }); });
  const cozinha = await J((p) => window.__i.erguer('cozinha', p), [banc.x + 4, banc.z + 4]);
  if (confere(!!cozinha && !cozinha.obra, 'a cozinha foi erguida e está pronta')) {
    await o.tocarConstrucao('cozinha', 0.6);
    igual(await o.painel(), 'industria', 'o toque na cozinha abre o painel dela');
    confere(await J(() => { const c = document.querySelector('.ind-receita[data-receita="bolo-de-fuba"]'); return !!c && /2\/2/.test(c.textContent) && /14\/2/.test(c.textContent) && /10 min/.test(c.textContent); }), 'o bolo de fubá mostra fubá 2/2, ovo 14/2 e 10 min');
    confere(await J(() => { const c = document.querySelector('.ind-receita[data-receita="salada"]'); return !!c && !!c.querySelector('.ind-ficha.falta') && c.querySelector('[data-k="fazer-salada"]').classList.contains('sem'); }), 'receita sem ingrediente mostra o que falta em vermelho e o botão apagado');
    await o.tamanhos('painel da cozinha');
    await o.foto('16-cozinha');
    await o.tocarEm('[data-k="fazer-salada"]');
    await o.avisou(/Falta (alface|tomate): tem 0 de/i, 'tocar em Fazer sem ingrediente diz o que falta');
    await o.tocarEm('[data-k="fazer-bolo-de-fuba"]');
    igual(await o.tem('fuba'), 0, 'o bolo gasta os 2 fubás');
    await J(() => { window.__jogo.pular(601); window.__jogo.avancar(0.2); });
    await o.quadro(200);
    await o.tocarEm('[data-k="retirar"]');
    igual(await o.tem('bolo-de-fuba'), 1, 'dez minutos depois, o bolo de fubá vai para o estoque');
    confere(await J(() => window.__jogo.estado().feitas.includes('cozinha')), 'a missão "cozinha" foi cumprida');
    await o.fecharTelas();
    await o.fecharPainel();
  }

  // ---- a bancada de embalar: uma dúzia de ovos (a cartela vem da loja)
  await J(() => window.__i.missoes(null, 'embalar'));
  igual(await J(() => window.__jogo.comando({ tipo: 'comprar', item: 'cartela-vazia', n: 1 }).ok), true, 'a loja vende a cartela vazia');
  const embalar = await J((p) => window.__i.erguer('bancada-de-embalar', p), [banc.x - 3, banc.z + 3]);
  if (confere(!!embalar && !embalar.obra, 'a bancada de embalar foi erguida e está pronta')) {
    await o.tocarConstrucao('bancada-de-embalar', 0.3);
    igual(await o.painel(), 'industria', 'o toque na bancada de embalar abre o painel dela');
    await o.foto('17-embalar');
    await o.tocarEm('[data-k="fazer-duzia-de-ovos"]');
    igual(await o.tem('ovo'), 0, 'a dúzia gasta 12 ovos');
    await J(() => window.__jogo.avancar(21));
    await o.quadro(200);
    await o.tocarEm('[data-k="retirar"]');
    igual(await o.tem('duzia-de-ovos'), 1, 'a dúzia de ovos vai para o estoque');
    confere(await J(() => window.__jogo.estado().feitas.includes('embalar')), 'a missão "embalar" foi cumprida');
    await o.fecharTelas();
    await o.fecharPainel();
  }

  // ---- o laticínio: queijo minas (pede o curral; o leite vem das vacas, aqui pelo gancho de teste)
  await J(() => { const m = window.__jogo.mundo; m.posses.ouro += 12000; window.__i.dar({ tabua: 40, madeira: 10, prego: 60, pedra: 24, leite: 2 }); window.__i.missoes(null, 'queijo'); });
  const curral = await J((p) => window.__i.erguer('curral', p), [banc.x, banc.z]);
  const lat = curral && (await J((p) => window.__i.erguer('laticinio', p), [banc.x, banc.z]));
  if (confere(!!lat && !lat.obra, 'o curral e o laticínio foram erguidos')) {
    await o.fecharTelas();
    await o.tocarConstrucao('laticinio', 0.6);
    igual(await o.painel(), 'industria', 'o toque no laticínio abre o painel dele');
    confere(await J(() => { const c = document.querySelector('.ind-receita[data-receita="queijo-minas"]'); return !!c && /2\/2/.test(c.textContent) && /30 min/.test(c.textContent) && c.querySelector('[data-k="fazer-queijo-minas"]').classList.contains('alvo-tutorial'); }), 'o queijo minas mostra leite 2/2, 30 min e o botão marcado pela missão');
    await o.tamanhos('painel do laticínio');
    await o.tocarEm('[data-k="fazer-queijo-minas"]');
    igual(await o.tem('leite'), 0, 'o queijo gasta os 2 leites');
    confere(await J(() => { const b = document.querySelector('[data-k="concluir"]'); return !!b && /Terminar agora/.test(b.textContent) && /\d/.test(b.textContent) && /falta 30 min/.test(document.querySelector('.ind-falta').textContent); }), 'a receita de 30 minutos mostra o tempo e o preço em cash de terminar agora');
    await o.foto('17b-laticinio');
    await J(() => { window.__jogo.pular(1801); window.__jogo.avancar(0.2); });
    await o.quadro(200);
    await o.tocarEm('[data-k="retirar"]');
    igual(await o.tem('queijo-minas'), 1, 'meia hora depois, o queijo minas vai para o estoque');
    confere(await J(() => window.__jogo.estado().feitas.includes('queijo')), 'a missão "queijo" foi cumprida');
    await o.fecharTelas();
    await o.fecharPainel();
  }

  // ---- o quadro de pedidos: bilhetes, entregar, trocar, a espera
  await J(() => { window.__i.missoes(null, 'primeiro-pedido'); window.__jogo.avancar(0.6); });
  igual(await J(() => { const g = window.__jogo.guia(); return g && g.tipo + ':' + g.id; }), 'entidade:quadro-de-pedidos', 'na missão do primeiro pedido, o guia aponta o quadro');
  await o.tocarConstrucao('quadro-de-pedidos');
  igual(await o.painel(), 'pedidos', 'no nível certo, o toque no quadro abre os pedidos');
  igual(await J(() => (document.querySelector('.ind-dica') || { dataset: {} }).dataset.dica), 'quadro', 'na primeira vez o Seu Tonho explica o quadro');
  let peds = await J(() => window.__i.pedidos());
  igual(peds.filter(Boolean).length, 4, 'no nível 12 o quadro tem 4 pedidos');
  confere(await J(() => document.querySelectorAll('.ped-bilhete[data-vaga]').length === 4 && /nível 15/.test(document.querySelector('.ped-bilhete.trancada').textContent)), 'cada pedido é um bilhete, e a vaga trancada diz o nível que a abre');
  confere(await J((p) => { const b = document.querySelector('.ped-bilhete[data-vaga="0"]'), nomes = window.__jogo.dados.bruto.pedidos.clientes; return nomes.some((c) => c.id === p.cliente && b.textContent.includes(c.nome)) && b.textContent.includes(String(p.ouro).replace(/\B(?=(\d{3})+(?!\d))/g, '.')) && !!b.querySelector('.ped-linha.falta') && b.querySelector('[data-k="entregar-0"]').classList.contains('sem'); }, peds[0]), 'o bilhete mostra quem pede, o que paga, o que falta em vermelho e o Entregar apagado');
  confere(await J(() => /troca grátis/i.test(document.querySelector('.ped-troca').textContent)), 'o quadro avisa que há uma troca grátis');
  await o.tamanhos('quadro de pedidos');
  await o.foto('18-quadro');
  await o.tocarEm('[data-k="entregar-0"]');
  await o.avisou(/Falta .+ para este pedido: tem \d+ de \d+/i, 'entregar sem ter tudo diz o que falta');
  // com tudo em mãos, o bilhete acende e a entrega paga ouro e experiência
  await J((p) => window.__i.dar(p.itens), peds[0]);
  await o.quadro(200);
  confere(await J(() => { const b = document.querySelector('.ped-bilhete[data-vaga="0"]'); return b.classList.contains('pode') && !b.querySelector('.ped-linha.falta') && !b.querySelector('[data-k="entregar-0"]').classList.contains('sem') && b.querySelector('[data-k="entregar-0"]').classList.contains('alvo-tutorial'); }), 'com tudo em mãos o bilhete acende e a missão marca o Entregar');
  igual(await J(() => window.__jogo.guia().tipo), 'entidade', 'com um pedido completo, o guia da missão aponta o quadro');
  await o.foto('19-quadro-pode-entregar');
  const ouro1 = await J(() => window.__jogo.mundo.posses.ouro), xp1 = await J(() => window.__jogo.mundo.progresso.xp);
  await o.tocarEm('[data-k="entregar-0"]');
  // (a missão do primeiro pedido também paga: 30 de ouro e 12 de experiência)
  igual(await J(() => window.__jogo.mundo.posses.ouro), ouro1 + peds[0].ouro + 30, 'a entrega paga o ouro do bilhete');
  igual(await J(() => window.__jogo.mundo.progresso.xp), xp1 + peds[0].xp + 12, 'e a experiência do bilhete');
  for (const k in peds[0].itens) igual(await o.tem(k), 0, `o pedido leva ${k}`);
  confere(await J(() => window.__jogo.estado().feitas.includes('primeiro-pedido')), 'a missão "primeiro-pedido" foi cumprida');
  await o.fecharTelas();
  confere(await J(() => { const b = document.querySelector('.ped-bilhete[data-vaga="0"]'); return b.classList.contains('espera') && /Pedido novo em/.test(b.textContent) && /1 h 20 min|45 min/.test(b.textContent); }), 'a vaga entregue mostra quanto falta para o pedido novo (45 min no nível 12)');
  igual(await J(() => (document.querySelector('.ind-dica') || { dataset: {} }).dataset.dica), 'entregar', 'depois da primeira entrega o Seu Tonho explica a espera e a troca');
  await o.avisou(/Pedido entregue/i, 'o jogo avisa que o pedido foi entregue');
  await o.foto('20-quadro-entregue');
  await o.tocarEm('[data-k="dica-ok"]');
  // trocar: a troca grátis traz outro na hora; a seguinte deixa a vaga esperando o dobro
  await o.tocarEm('[data-k="trocar-1"]');
  confere(await J(() => /troca grátis/i.test((document.querySelector('.dialogo') || { textContent: '' }).textContent)), 'trocar pergunta antes e diz que a troca grátis traz outro na hora');
  await o.tamanhos('pergunta da troca', '.dialogo');
  await o.foto('21-pergunta-de-troca');
  await o.tocarEm('.dialogo [data-k="sim"]');
  const novos = await J(() => window.__i.pedidos());
  confere(!!novos[1] && JSON.stringify(Object.keys(novos[1].itens)) !== JSON.stringify(Object.keys(peds[1].itens)), 'a troca grátis traz na hora um pedido de outra coisa');
  confere(await J(() => /Próxima troca grátis em (23 h 60 min|24 h|1 dia)/i.test(document.querySelector('.ped-troca').textContent)), 'o quadro diz quando volta a troca grátis');
  await o.tocarEm('[data-k="trocar-2"]');
  confere(await J(() => /fica vazia por 1 h 30 min/.test((document.querySelector('.dialogo') || { textContent: '' }).textContent)), 'sem a troca grátis, a pergunta diz quanto a vaga fica vazia (o dobro da espera)');
  await o.tocarEm('.dialogo [data-k="sim"]');
  confere(await J(() => document.querySelector('.ped-bilhete[data-vaga="2"]').classList.contains('espera')), 'a vaga trocada sem a grátis fica esperando');
  await o.foto('22-quadro-espera');
  // a espera não se pula com cash; passa com o relógio, mesmo com o jogo fechado
  igual(await J(() => window.__jogo.comando({ tipo: 'concluir', relogio: 'pedido', alvo: 0 }).ok), false, 'a espera do pedido não se pula com cash');
  await J(() => { window.__jogo.pular(46 * 60); window.__jogo.avancar(1.2); });
  await o.quadro(300);
  peds = await J(() => window.__i.pedidos());
  confere(!!peds[0] && !peds[2], 'depois de 46 minutos a vaga entregue tem pedido novo, e a trocada (90 min) ainda espera');
  await o.fecharPainel();
  // o balão em cima do quadro quando há pedido que dá para entregar
  await J((p) => window.__i.dar(p.itens), peds[0]);
  const q = await J(() => window.__i.de('quadro-de-pedidos'));
  await J(([x, z]) => window.__jogo.olhar(x, z), [q.x + 0.5, q.z + 0.5]);
  await o.foto('23-balao-do-quadro');

  // ---- gravar e recarregar no fim: tudo igual
  await J(() => window.__jogo.gravar());
  const fim = await J(() => JSON.stringify({ ind: window.__jogo.mundo.salvar().sistemas.industria, ped: window.__jogo.mundo.salvar().sistemas.pedidos, ouro: window.__jogo.mundo.posses.ouro }));
  await pg.reload();
  await pronto(pg);
  igual(await J(() => JSON.stringify({ ind: window.__jogo.mundo.salvar().sistemas.industria, ped: window.__jogo.mundo.salvar().sistemas.pedidos, ouro: window.__jogo.mundo.posses.ouro })), fim, 'gravar e recarregar traz as indústrias, os pedidos e o ouro');
  confere(await J(() => window.__i.de('moinho').nivel === 2 && window.__i.de('bancada-de-carpintaria').nivel === 2), 'as vagas a mais continuam abertas depois de recarregar');
  semErros(a, '1280x720');
  await a.ctx.close();

  // =====================================================================================================
  console.log('844x390, celular deitado, toque');
  a = await abrir(844, 390, { toque: true, dpr: 2 });
  o = jogador(a, 'c-cel'); ({ pg, J } = o);
  await o.fecharTelas();
  // nível 6, a um ponto de experiência do nível 7; a bancada já está de pé; a missão da vez é serrar tábuas
  await J(() => { const m = window.__jogo.mundo; window.__i.nivel(6); m.posses.ouro = 3000; m.posses.cash = 30; window.__i.dar({ madeira: 12, tabua: 10, prego: 10, pedra: 10 }); window.__i.missoes('tabuas'); window.__jogo.avancar(1.2); });
  const eu = await J(() => window.__jogo.estado().personagem);
  banc = await J((p) => window.__i.erguer('bancada-de-carpintaria', p), [eu.x, eu.z + 2]);
  if (!confere(!!banc && !banc.obra, 'celular: a bancada foi erguida')) throw new Error('sem bancada no celular');
  await J(() => { window.__i.nivel(6, 1); window.__jogo.avancar(0.3); });
  await o.fecharTelas();
  igual(await J(() => window.__jogo.estado().nivel), 6, 'celular: começa no nível 6, a um ponto do 7');
  await o.tocarConstrucao('bancada-de-carpintaria', 0.3);
  igual(await o.painel(), 'industria', 'celular: o dedo na bancada abre o painel');
  await o.tamanhos('celular, painel da bancada');
  await o.foto('01-bancada');
  await o.tocarEm('[data-k="fazer-tabua"]');
  await o.tocarEm('[data-k="fazer-tabua"]');
  igual((await o.ind('bancada-de-carpintaria')).fila.length, 2, 'celular: o dedo no Fazer põe duas tábuas na fila');
  await J(() => window.__jogo.avancar(4));
  await esperar(400);
  await o.tamanhos('celular, fila da bancada');
  await o.foto('02-bancada-fila');
  await o.tocarEm('[data-k="dica-ok"]');
  await J(() => document.querySelector('.veu .corpo').scrollTo(0, 0));
  await o.foto('03-bancada-fila-sem-dica');
  await o.tocarEm('[data-k="ind-aba-construir"]');
  confere(await J(() => !!document.querySelector('.ind-construir .oferta')), 'celular: a aba Construir mostra o catálogo');
  await o.tamanhos('celular, aba Construir');
  await o.foto('04-bancada-construir');
  await o.tocarEm('[data-k="ind-aba-produzir"]');
  await o.fecharPainel();
  igual(await o.painel(), null, 'celular: o botão de fechar fecha o painel');
  // os balões no terreno e o toque que retira; a experiência da tábua leva ao nível 7, que libera as receitas do moinho
  await J(([x, z]) => window.__jogo.olhar(x, z), [banc.x + 1, banc.z + 0.5]);
  await o.foto('05-balao-fazendo');
  await J(() => window.__jogo.avancar(17));
  await o.quadro(200);
  await o.foto('06-balao-pronto');
  const tabCel = await o.tem('tabua');
  await o.tocarConstrucao('bancada-de-carpintaria', 0.3);
  await o.ateParar();
  // (a subida para o nível 7 também dá tábuas de prêmio: por isso "pelo menos uma a mais")
  confere((await o.tem('tabua')) >= tabCel + 1 && (await o.ind('bancada-de-carpintaria')).saida.length === 0, 'celular: o dedo na bancada retira a tábua pronta');
  await esperar(2600); // (os itens da lista entram um a um)
  confere(await J(() => { const s = document.querySelector('.subida:not(.dialogo)'); return !!s && /Fubá/.test(s.textContent) && /Ração/.test(s.textContent); }), 'a tela de subida para o nível 7 mostra as receitas novas (fubá e ração)');
  await pg.screenshot({ path: path.join(capturas, 'c-cel-07-subida-com-receitas.jpg'), type: 'jpeg', quality: 84 });
  confere(await J(() => { const s = document.querySelector('.subida:not(.dialogo)'); return (s.textContent.match(/Ração/g) || []).length === 1; }), 'a ração aparece uma vez só na lista do que o nível liberou');
  await o.fecharTelas();
  igual(await J(() => window.__jogo.estado().nivel), 7, 'celular: chegou ao nível 7');

  // o quadro no celular: 3 vagas no nível 7; entregar e trocar com o dedo
  await o.tocarConstrucao('quadro-de-pedidos');
  igual(await o.painel(), 'pedidos', 'celular: o dedo no quadro abre os pedidos');
  peds = await J(() => window.__i.pedidos());
  igual(peds.filter(Boolean).length, 3, 'celular: no nível 7 o quadro tem 3 pedidos');
  await o.tamanhos('celular, quadro de pedidos');
  await o.foto('08-quadro');
  await J((p) => window.__i.dar(p.itens), peds[0]);
  await o.quadro(200);
  await o.tocarEm('[data-k="dica-ok"]');
  await o.foto('09-quadro-pode-entregar');
  const ouro2 = await J(() => window.__jogo.mundo.posses.ouro);
  await o.tocarEm('[data-k="entregar-0"]');
  igual(await J(() => window.__jogo.mundo.posses.ouro), ouro2 + peds[0].ouro, 'celular: o dedo no Entregar paga o pedido');
  await o.fecharTelas();
  await o.tocarEm('[data-k="trocar-1"]');
  confere(await J(() => !!document.querySelector('.dialogo [data-k="sim"]')), 'celular: trocar pergunta antes');
  await o.tamanhos('celular, pergunta da troca', '.dialogo');
  await o.foto('10-pergunta-de-troca');
  await o.tocarEm('.dialogo [data-k="sim"]');
  await o.tocarEm('[data-k="dica-ok"]', false);
  await J(() => document.querySelector('.veu .corpo').scrollTo(0, 0));
  await o.tamanhos('celular, quadro com espera');
  await o.foto('11-quadro-espera');
  await o.fecharPainel();
  semErros(a, '844x390');
  await a.ctx.close();
} catch (e) {
  falhas.push('a verificação parou: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' ') : e));
  console.log('  ✗ ' + falhas[falhas.length - 1]);
}

await nav.close();
await srv.fechar();
console.log(`\n${feitos} conferências, ${falhas.length} falha(s). Fotos em ${path.relative(raiz, capturas)}/.`);
if (falhas.length) { for (const f of falhas) console.log(' - ' + f); process.exitCode = 1; } else console.log('Tudo certo.');
