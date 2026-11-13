// Confere os animais de trabalho e de estimação no jogo montado, num Chromium sem janela, com clique, dedo, teclado e
// controle de verdade: 1280x720 (mouse, teclado e controle de videogame) e 844x390 (celular deitado, toque).
// Joga de ponta a ponta:
//   o gato e o cachorro pela aba "Animais" da loja; eles seguem e sentam; o afago (corações), o mimo do dia, o
//   segundo afago sem mimo, o dia seguinte com mimo de novo; gravar e abrir;
//   o boi velho do Seu Tonho (nível 4): a baia pronta cumpre a missão e ele chega com o arado simples; o modo "Arado";
//   segurar o dedo (o mouse) no campo do começo marca a fileira do boi (6 casas) antes de soltar; a segunda fileira com
//   um toque (no computador, Espaço); doze casas cumprem a missão; sem trato, três casas; com trato, o toque na ponta
//   de uma fileira quase feita vai pela coluna (o lado com mais casas), quatro fileiras de cinco e uma arrastando o
//   dedo; o arado de ferro (10 casas); gravar e abrir;
//   o jumento, a carroça e o barril: o botão (tecla J), o barril cheio no poço, regar o campo todo sem voltar ao poço,
//   colher até o cesto passar para a carroça, gravar e abrir, vender tudo na banca; segurar o dedo na fileira do campo
//   com o boi;
//   o cavalo e a sela: o botão (tecla H, controle, botão do estábulo), a viagem longa montada sem gastar fôlego, apear
//   e colher; montar pelas teclas; gravar e abrir.
// Confere as missões "companheiro", "baia-do-boi", "boi-de-arado", "jumento", "barril" e "cavalo"; o que o Seu Tonho explica; os
// tamanhos mínimos (texto de 14 px, botão de 44 px); que os botões e contadores desta frente não encostam em nada do
// HUD nem saem da tela; e que não há erro no console. As fotos vão para a pasta de capturas (JPEG).
//   JOGO_DIST=dist-f JOGO_CAPTURAS=capturas-f JOGO_PORTA=8106 node tools/verificar-trabalho.mjs   (monte antes)
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
    const ev = [];
    j.mundo.eventos.ouvir('*', (d, tipo) => { ev.push({ tipo, d: d && typeof d === 'object' ? { ...d } : {} }); if (ev.length > 6000) ev.splice(0, 2000); });
    window.__t = {
      eventos(tipo) { return ev.filter((e) => e.tipo === tipo).map((e) => e.d); },
      limpar() { ev.length = 0; },
      de(tipo) { const e = achar(tipo); return e ? { id: e.id, x: e.x, z: e.z, l: e.l, p: e.p, nivel: e.nivel || 1 } : null; },
      tem(item) { const P = j.mundo.posses; return (P.bolsa[item] || 0) + (P.celeiro.itens[item] || 0) + (P.cesto.itens[item] || 0) + (P.ferramentas[item] ? 1 : 0) + (P.recipientes.includes(item) ? 1 : 0); },
      noCesto() { let n = 0; for (const k in j.mundo.posses.cesto.itens) n += j.mundo.posses.cesto.itens[k]; return n; },
      ouro() { return j.mundo.posses.ouro; },
      dar(itens) { const m = j.mundo; for (const k in itens) { const t = m.dados.itens[k].tipo, onde = t === 'colheita' || t === 'produto' ? m.posses.celeiro.itens : m.posses.bolsa; onde[k] = (onde[k] || 0) + itens[k]; } },
      // as missões do vizinho até "ate" (sem ela) ficam cumpridas
      missoes(ate) { const m = j.mundo, L = m.dados.missoes.vizinho.map((x) => x.id); m.missoes.feitas = L.slice(0, L.indexOf(ate)); m.missoes.de = null; m.missoes.conta = 0; },
      missao() { const s = j.estado(); return s.missao ? s.missao.id : null; },
      feita(id) { return j.mundo.missoes.feitas.includes(id); },
      nivel(n) { const m = j.mundo; m.progresso.nivel = n; m.progresso.xp = m.dados.niveis.limiar[n] + 10; },
      terreno() {
        const m = j.mundo, loc = m.locais.fazenda;
        for (const l of ['lote-1', 'lote-2']) m.comando({ tipo: 'comprarLote', lote: l });
        for (const e of [...loc.entidades]) if (['mato', 'toco', 'pedra', 'mata'].includes(e.tipo) && loc.propria[loc.i(e.x, e.z)]) { loc.tirar(e.id); m.terras.limpos.push(loc.i(e.x, e.z)); }
        m.eventos.emitir('chaoMudou', { tudo: true, local: loc.id });
      },
      serve(x, z) { const loc = j.mundo.locais.fazenda, i = loc.dentro(x, z) ? loc.i(x, z) : -1; return i >= 0 && loc.propria[i] === 1 && loc.chao[i] === 0 && !loc.ocupa[i] && !loc.plantas[i] && !loc.entidadeEm(x, z); },
      // retângulos l x p de grama livre (com uma casa de folga em volta), do mais perto de (cx, cz) ao mais longe
      livres(l, p, cx, cz) {
        const loc = j.mundo.locais.fazenda, out = [];
        for (let z = 1; z <= loc.p - p - 1; z++) for (let x = 1; x <= loc.l - l - 1; x++) {
          let ok = true;
          for (let dz = -1; dz < p + 1 && ok; dz++) for (let dx = -1; dx < l + 1 && ok; dx++) if (!this.serve(x + dx, z + dz)) ok = false;
          if (ok) out.push([x, z]);
        }
        return out.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cz) - Math.hypot(b[0] - cx, b[1] - cz));
      },
      // ergue e amplia pelo comando (a obra é da frente de construir; aqui interessa o que vem depois)
      erguer(tipo) {
        const m = j.mundo, d = m.dados.construcoes[tipo], p = m.personagem;
        for (const [x, z] of this.livres(d.casas[0], d.casas[1], p.x, p.z).slice(0, 60)) { const r = m.comando({ tipo: 'construir', id: tipo, x, z, jaJa: true, quieto: true }); if (r.ok) { j.pular((d.obraSeg || 0) + 1); j.avancar(0.2); return this.de(tipo); } }
        return null;
      },
      ampliar(tipo) { const e = achar(tipo), r = j.mundo.comando({ tipo: 'ampliar', entidade: e.id }); if (!r.ok) return r.motivo; j.pular(30000); j.avancar(0.2); return achar(tipo).nivel; },
      fala() { const b = document.querySelector('#ui .balao.avulsa'); return b && !b.hidden ? b.textContent : ''; },
      vistos() { return [...j.mundo.animais.vistos]; },
      trab() { return window.__trabalho.estado(); },
      T() { const T = j.mundo.trabalho; return { aCavalo: T.aCavalo, levando: T.levando, montada: T.montada, viagem: T.viagem, carroca: { ...T.carroca }, barril: T.barril, cavalgado: T.cavalgado, tMontada: T.tMontada }; },
      p() { const p = j.mundo.personagem; return { x: p.x, z: p.z, folego: p.folego, max: j.mundo.dados.regras.folego.max, fila: [p.tarefa, ...p.fila].filter(Boolean).map((t) => t.acao || t.tipo) }; },
      modo() { return j.mundo.modo.id; },
      bichos() {
        const m = j.mundo, p = m.personagem;
        return m.locais.fazenda.entidades.filter((e) => e.tipo === 'bicho' || e.tipo === 'bichoDeTrabalho').map((e) => ({ id: e.id, animal: e.animal, especie: e.especie, figura: e.figura, tipo: e.tipo, x: e.x + 0.5, z: e.z + 0.5, estado: e.estado, barril: !!e.barril, dist: Math.hypot(e.x + 0.5 - p.x, e.z + 0.5 - p.z) }));
      },
      animal(especie) { const a = j.mundo.animais.lista.find((x) => x.especie === especie); return a ? { id: a.id, tratado: !!a.tratado, mimoDia: a.mimoDia, abrigo: a.abrigo } : null; },
      chao(casas) { const loc = j.mundo.locais.fazenda; return casas.map(([x, z]) => loc.chao[z * loc.l + x]); },
      plantas(casas) { const s = j.estado().plantas; return casas.map(([x, z]) => { const q = s.find((pl) => pl.x === x && pl.z === z); return q ? q.estado : null; }); },
      // ponto da janela para tocar a casa (x, z): o centro dela, ou perto, onde nada fica na frente
      // (árvore, mato e pedra na frente não tapam: a entrada passa o toque para a casa de trás)
      pontoDaCasa(x, z) {
        const m = j.mundo, cam = j.cena.cam;
        j.olhar(x + 0.5, z + 0.5);
        let quem = '';
        for (const [ox, oz] of [[0.5, 0.5], [0.35, 0.35], [0.65, 0.65], [0.3, 0.7], [0.7, 0.3], [0.5, 0.2], [0.5, 0.8], [0.2, 0.5], [0.8, 0.5]]) {
          const q = j.naTela(x + ox, z + oz), n = document.elementFromPoint(q.x, q.y), id = j.cena.entidadeEm(m, cam.cssX(x + ox, z + oz), cam.cssY(x + ox, 0, z + oz));
          if ((id === null || window.__trabalho.obstaculo(id)) && n && n.id === 'tela') return q;
          quem = id || (n ? n.className || n.id : 'nada');
        }
        return { quem };
      },
      // ponto da janela onde o toque cai na entidade (tenta algumas alturas)
      pontoDaEntidade(id) {
        const m = j.mundo, e = m.local.porId[id], cam = j.cena.cam;
        if (!e) return null;
        j.olhar(e.x + e.l / 2, e.z + e.p / 2);
        for (const alto of [0.35, 0.6, 0.2, 0.9, 1.3]) {
          const x = e.x + e.l / 2, z = e.z + e.p / 2, q = j.naTela(x, z, alto), n = document.elementFromPoint(q.x, q.y);
          if (j.cena.entidadeEm(m, cam.cssX(x, z), cam.cssY(x, alto, z)) === id && n && n.id === 'tela') return q;
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
        for (const b of corpo.querySelectorAll('button, .abr-extra, .oferta')) { if (b.scrollWidth > b.clientWidth + 2) ruins.push(`"${b.textContent.slice(0, 24)}" não cabe (${b.scrollWidth} em ${b.clientWidth})`); }
        return ruins.join('; ');
      },
      // os botões e contadores desta frente no HUD: dentro da tela, do tamanho mínimo e sem encostar em nada
      hud() {
        const raiz = j.hud.raiz, ruins = [], vis = (n) => !n.closest('[hidden]') && n.getClientRects().length > 0;
        const meus = [...raiz.querySelectorAll('.bt.trab, .chip.trab-carga, .chip.trab-agua, button[data-modo="arado"]')].filter(vis);
        const outros = [...raiz.querySelectorAll('button, .chip, .balao, .dica, .agir')].filter((n) => vis(n) && !meus.some((x) => x === n || x.contains(n) || n.contains(x)) && !(n.closest('.balao') && n.closest('.balao') !== n));
        const nome = (n) => n.dataset.k || n.dataset.modo || n.className;
        const cruza = (r, q) => Math.min(r.right, q.right) - Math.max(r.left, q.left) > 1 && Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top) > 1;
        for (const n of meus) {
          const r = n.getBoundingClientRect();
          if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) ruins.push(`"${nome(n)}" sai da tela`);
          if (n.tagName === 'BUTTON' && (r.width < 43.5 || r.height < 43.5)) ruins.push(`"${nome(n)}" tem ${Math.round(r.width)}x${Math.round(r.height)}`);
          for (const s of n.querySelectorAll('span')) if (vis(s) && s.textContent.trim() && parseFloat(getComputedStyle(s).fontSize) < 14) ruins.push(`texto de ${getComputedStyle(s).fontSize} em "${nome(n)}"`);
          const partes = [n, ...[...n.querySelectorAll('.tecla')].filter(vis)];
          for (const o of outros) for (const pt of partes) if (cruza(pt.getBoundingClientRect(), o.getBoundingClientRect())) ruins.push(`"${nome(n)}${pt === n ? '' : ' (letra)'}" encosta em "${nome(o)}"`);
        }
        for (let a = 0; a < meus.length; a++) for (let b = a + 1; b < meus.length; b++) if (cruza(meus[a].getBoundingClientRect(), meus[b].getBoundingClientRect())) ruins.push(`"${nome(meus[a])}" encosta em "${nome(meus[b])}"`);
        return { ruins, meus: meus.map(nome) };
      },
      chip(sel) { const c = j.hud.raiz.querySelector(sel); return c && !c.hidden && c.getClientRects().length ? { texto: c.textContent, fonte: parseFloat(getComputedStyle(c.querySelector('span')).fontSize), cheio: c.classList.contains('cheio') } : null; },
      visivel(sel) { const b = document.querySelector(sel); return !!b && !b.closest('[hidden]') && b.getClientRects().length > 0; },
      folegoVisivel() { const c = j.hud.raiz.querySelector('.chip.folego'); return !!c && getComputedStyle(c).display !== 'none' && c.getClientRects().length > 0; },
      dica() { const d = j.hud.raiz.querySelector('.dica'); return d ? d.textContent : ''; },
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
// dedo de verdade (CDP): um ponto é um toque; vários, um arrasto
async function dedo(cdp, pontos, pausa = 30) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pontos[0][0], y: pontos[0][1], id: 1 }] });
  for (let i = 1; i < pontos.length; i++) { await esperar(pausa); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pontos[i][0], y: pontos[i][1], id: 1 }] }); }
  await esperar(pausa);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await esperar(40);
}

// o cenário inteiro, com o ponteiro da vez; "f" = prefixo das fotos
async function cenario(a, f) {
  const { pg, cdp } = a, comDedo = !!cdp;
  const J = (fn, arg) => pg.evaluate(fn, arg);
  const A = (nome, ...args) => pg.evaluate(([n, xs]) => window.__t[n](...xs), [nome, args]);
  const quadro = async (ms = 90) => { await J(() => window.__jogo.desenhar()); await esperar(ms); };
  const tocarXY = async (x, y) => { if (cdp) await dedo(cdp, [[x, y]]); else await pg.mouse.click(x, y); await esperar(60); };
  let nFoto = 0;
  const foto = async (nome, comAvisos = false) => {
    if (!comAvisos) await pg.waitForFunction(() => window.__jogo.avisosNaTela().length === 0, null, { timeout: 7000 }).catch(() => {});
    await quadro(380);
    const h = await A('hud');
    confere(h.ruins.length === 0, `${f} ${nome}: ${h.ruins.slice(0, 4).join('; ')}`);
    await pg.screenshot({ path: path.join(capturas, `${f}-${String(++nFoto).padStart(2, '0')}-${nome}.jpg`), type: 'jpeg', quality: 84 });
  };
  const painel = () => J(() => window.__jogo.painelAberto());
  const avisos = () => J(() => window.__jogo.avisos());
  const ateParar = async (max = 400) => { const s = await J((x) => window.__jogo.ateParar(x), max); if (s < 0) confere(false, `a personagem não parou em ${max} s (fila: ${(await A('p')).fila.join(', ')})`); await quadro(); return s; };
  const avancar = async (seg) => { await J((s) => window.__jogo.avancar(s), seg); };
  const pular = async (seg) => { await J((s) => { window.__jogo.pular(s); window.__jogo.avancar(0.2); }, seg); await quadro(); };
  const seguir = () => J(() => window.__jogo.seguir());
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
    for (let i = 0; i < 60; i++) {
      const at = await J(() => { const e = document.activeElement; return e && e.dataset ? e.dataset.k || '' : ''; });
      if (at === k) { await pg.keyboard.press('Enter'); await quadro(); return true; }
      await pg.keyboard.press('Tab');
    }
    confere(false, `o Tab não chegou no botão "${k}"`);
    return false;
  }
  const apertar = (k) => (comDedo ? tocarEm(`.veu [data-k="${k}"]`) : teclar(k));
  const fecharPainel = async () => {
    for (let k = 0; k < 3 && (await painel()) !== null; k++) { if (comDedo) await tocarEm('.veu .fechar'); else await pg.keyboard.press('Escape'); await quadro(); }
    confere((await painel()) === null, 'o painel fecha (X ou Esc)');
  };
  async function fecharTelas() {
    for (let k = 0; k < 8 && (await J(() => !!document.querySelector('.subida:not(.dialogo)'))); k++) {
      await esperar(700);
      const b = await J(() => { const n = document.querySelector('.subida:not(.dialogo) .cartao > .bt, .subida:not(.dialogo) button'); if (!n) return null; const r = n.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return { x, y, livre: !!e && (e === n || n.contains(e)) }; });
      if (b && b.livre) await tocarXY(b.x, b.y); else await J(() => window.__jogo.fecharSubida());
      await quadro(200);
    }
  }
  const tamanhos = async (onde) => { const r = await A('pequenos', '.veu'); confere(r.length === 0, `${onde}: ${r.slice(0, 5).join('; ')}`); const c = await A('cabe'); confere(!c, `${onde}: ${c}`); };
  async function tocarCasa(x, z) {
    const q = await A('pontoDaCasa', x, z);
    if (!confere(!q.quem, `a casa (${x}, ${z}) fica livre para o toque (na frente: ${q.quem})`)) return false;
    await tocarXY(q.x, q.y);
    return true;
  }
  async function arrastarCasas(casas) {
    const pts = [];
    for (const [x, z] of casas) { const q = await A('pontoDaCasa', x, z); if (q.quem) { confere(false, `a casa (${x}, ${z}) fica livre para o arrasto (na frente: ${q.quem})`); return; } pts.push([q.x, q.y]); }
    // a câmera fica parada no meio do arrasto: os pontos são calculados com ela olhando a primeira casa
    const q0 = await J(([x, z, cs]) => { const j = window.__jogo; j.olhar(x + 0.5, z + 0.5); return cs.map(([cx, cz]) => j.naTela(cx + 0.5, cz + 0.5)); }, [casas[0][0], casas[0][1], casas]);
    const lista = q0.map((q) => [q.x, q.y]);
    if (cdp) await dedo(cdp, lista, 60);
    else { await pg.mouse.move(lista[0][0], lista[0][1]); await pg.mouse.down(); for (const p of lista.slice(1)) { await pg.mouse.move(p[0], p[1], { steps: 5 }); await esperar(40); } await pg.mouse.up(); }
    await esperar(80);
  }
  // segurar o dedo (o botão do mouse) parado na casa (x, z); "durante" roda ainda segurando, antes de soltar
  async function segurarCasa(x, z, durante, ms = 750) {
    const q = await A('pontoDaCasa', x, z);
    if (!confere(!q.quem, `a casa (${x}, ${z}) fica livre para segurar o dedo (na frente: ${q.quem})`)) return false;
    if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: q.x, y: q.y, id: 1 }] });
    else { await pg.mouse.move(q.x, q.y); await esperar(60); await pg.mouse.down(); }
    await esperar(ms);
    if (durante) await durante();
    if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    else await pg.mouse.up();
    await esperar(80);
    await quadro();
    return true;
  }
  async function tocarEntidade(id, nome) {
    const q = await A('pontoDaEntidade', id);
    if (!confere(!!q, `o toque chega em ${nome || id} (nada na frente)`)) return false;
    await tocarXY(q.x, q.y);
    await quadro();
    return true;
  }
  const tocarEstabulo = async () => { const e = await A('de', 'estabulo'); return tocarEntidade(e.id, 'o estábulo'); };
  // comprar pelo botão do cartão (bicho na aba "Animais", item na loja); fecha a tela de prêmio, se a compra cumpriu missão
  async function comprar(seletor) {
    await tocarEm(seletor);
    await fecharTelas();
    await avancar(0.3);
    await quadro();
  }
  async function abrirAbaAnimais() {
    if ((await painel()) !== 'loja' && (await painel()) !== 'animais') await tocarEm('.topo-dir [data-painel="loja"]');
    if ((await painel()) === 'loja') await tocarEm('[data-k="aba-animais"]');
    igual(await painel(), 'animais', 'a aba "Animais" da loja abre o painel dos bichos');
  }
  // a fala do Seu Tonho; se ele ainda está dizendo outra, a nossa espera a vez (uma fala dura uns 12 s)
  const esperarFala = async (re, onde, chave) => {
    let ok = await pg.waitForFunction((r) => new RegExp(r, 'i').test(window.__t.fala()), re.source, { timeout: 4000 }).then(() => true).catch(() => false);
    if (!ok && chave && (await A('vistos')).includes(chave)) ok = await pg.waitForFunction((r) => new RegExp(r, 'i').test(window.__t.fala()), re.source, { timeout: 30000 }).then(() => true).catch(() => false);
    confere(ok, `o Seu Tonho explica ${onde} (fala: "${await A('fala')}")`);
  };
  // um controle de videogame de mentira: o jogo lê navigator.getGamepads() a cada quadro
  const controle = async (b) => { await J((i) => { window.__pad.buttons[i].pressed = true; window.__pad.buttons[i].value = 1; }, b); await esperar(140); await J((i) => { window.__pad.buttons[i].pressed = false; window.__pad.buttons[i].value = 0; }, b); await esperar(140); };
  async function instalarControle() {
    if (comDedo) return;
    await J(() => {
      const pad = { connected: true, id: 'controle de teste', buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0] };
      Object.defineProperty(navigator, 'getGamepads', { value: () => [pad], configurable: true });
      window.__pad = pad;
      window.dispatchEvent(new Event('gamepadconnected'));
    });
  }
  async function recarregar() {
    await J(() => window.__jogo.gravar());
    await pg.reload();
    await pronto(pg);
    await instalarControle();
    await avancar(0.5);
    await quadro(200);
  }

  // ================= começo: terra, ouro, materiais e o estábulo de três baias =================
  await J(() => {
    const t = window.__t, m = window.__jogo.mundo;
    m.posses.ouro = 400000; m.posses.cash = 50;
    t.nivel(16); t.terreno();
    t.dar({ madeira: 120, tabua: 300, prego: 400, pedra: 120, fibra: 60, racao: 40, 'semente-alface': 60 });
    t.missoes('companheiro');
  });
  await quadro();
  await instalarControle();
  const banc = await A('erguer', 'bancada-de-carpintaria');
  const est = await A('erguer', 'estabulo');
  if (!confere(!!banc && !!est, 'a bancada e o estábulo ficam prontos')) return;
  igual(await A('ampliar', 'estabulo'), 2, 'a segunda baia do estábulo fica pronta');
  igual(await A('ampliar', 'estabulo'), 3, 'a terceira baia do estábulo fica pronta');
  await fecharTelas();
  await J(() => window.__t.limpar());

  // ================= o gato e o cachorro =================
  igual(await A('missao'), 'companheiro', 'a missão da vez é a do companheiro');
  await abrirAbaAnimais();
  confere(await J(() => { const c = document.querySelector('.oferta.animal[data-item="gato"]'); return !!c && !!c.querySelector('[data-k="comprar-gato"]') && /600/.test(c.textContent); }), 'o gato está na aba "Animais", com o preço e o botão de comprar');
  await tamanhos('aba Animais');
  await J(() => { const c = document.querySelector('.oferta.animal[data-item="gato"]'); if (c) c.scrollIntoView({ block: 'center' }); });
  await foto('loja-animais');
  await comprar('.oferta[data-item="gato"] [data-k="comprar-gato"]');
  await comprar('.oferta[data-item="cachorro"] [data-k="comprar-cachorro"]');
  await fecharPainel();
  await fecharTelas();
  confere(await A('feita', 'companheiro'), 'comprar o gato cumpre a missão "companheiro"');
  await esperarFala(/carinho/, 'o afago', 'trabalho:afago');
  confere((await A('vistos')).includes('trabalho:afago'), 'a explicação do afago fica marcada como vista');
  let pets = (await A('bichos')).filter((b) => b.tipo === 'bicho');
  confere(pets.length === 2 && pets.every((b) => b.dist < 3), `o gato e o cachorro aparecem ao lado dela (${pets.map((b) => `${b.especie} a ${b.dist.toFixed(1)}`).join(', ')})`);
  // ela anda; eles vão atrás e sentam quando ela para
  const p0 = await A('p');
  const longe = (await A('livres', 1, 1, p0.x + 7, p0.z + 2))[0];
  await tocarCasa(longe[0], longe[1]);
  await ateParar();
  await avancar(4);
  pets = (await A('bichos')).filter((b) => b.tipo === 'bicho');
  confere(pets.every((b) => b.dist < 3.3 && b.estado === 'sentado'), `eles a seguem e sentam (${pets.map((b) => `${b.especie}: ${b.estado} a ${b.dist.toFixed(1)}`).join(', ')})`);
  await seguir();
  await foto('bichos-sentados-com-mimo');
  // o afago
  const gato = await A('animal', 'gato'), cao = await A('animal', 'cachorro');
  const sementes = () => J(() => { const P = window.__jogo.mundo.posses.bolsa; return ['semente-milho', 'semente-feijao', 'semente-alface'].reduce((n, k) => n + (P[k] || 0), 0); });
  const s0 = await sementes();
  await tocarEntidade('bicho:' + gato.id, 'o gato');
  await ateParar();
  await seguir();
  await esperar(150);
  await foto('afago-e-mimo', true);
  igual((await A('eventos', 'afagou')).length, 1, 'tocar no gato faz um carinho');
  const mimo = (await A('eventos', 'ganhouMimo'))[0];
  confere(!!mimo && mimo.animal === 'gato' && (await sementes()) === s0 + mimo.n, `o primeiro afago do dia dá o mimo e ele vai para o estoque (${JSON.stringify(mimo)})`);
  confere((await avisos()).some((x) => /trouxe/.test(x)), `um aviso diz o que o gato trouxe (avisos: ${(await avisos()).join(' | ')})`);
  await tocarEntidade('bicho:' + gato.id, 'o gato');
  await ateParar();
  confere((await A('eventos', 'afagou')).length === 2 && (await A('eventos', 'ganhouMimo')).length === 1, 'o segundo afago do dia é só carinho');
  await tocarEntidade('bicho:' + cao.id, 'o cachorro');
  await ateParar();
  igual((await A('eventos', 'ganhouMimo')).length, 2, 'o cachorro também dá o mimo dele');
  await pular(24 * 3600);
  await tocarEntidade('bicho:' + gato.id, 'o gato');
  await ateParar();
  igual((await A('eventos', 'ganhouMimo')).length, 3, 'no dia seguinte, o afago dá mimo de novo');
  // gravar e abrir
  await recarregar();
  pets = (await A('bichos')).filter((b) => b.tipo === 'bicho');
  confere(pets.length === 2 && pets.every((b) => b.dist < 3), 'depois de abrir de novo, os dois estão ao lado dela');
  confere(typeof (await A('animal', 'gato')).mimoDia === 'number', 'o dia do último mimo fica gravado');
  await tocarEntidade('bicho:' + gato.id, 'o gato');
  await ateParar();
  igual((await A('eventos', 'ganhouMimo')).length, 0, 'depois de abrir, o mimo de hoje já foi');

  // ================= o boi velho do Seu Tonho e o arado simples (nível 4) =================
  // a missão "baia-do-boi": o estábulo já está de pé, então ela se cumpre sozinha e o boi chega com o arado
  await J(() => { window.__t.missoes('baia-do-boi'); window.__t.limpar(); });
  await avancar(1.5);
  await fecharTelas();
  confere(await A('feita', 'baia-do-boi'), 'com o estábulo de pé, a missão "baia-do-boi" se cumpre');
  confere(!!(await A('animal', 'boi')), 'o boi velho do Seu Tonho chega ao estábulo');
  igual(await A('tem', 'arado'), 1, 'o boi vem com o arado simples');
  igual(await A('missao'), 'boi-de-arado', 'a missão da vez é a do boi de arado');
  let boi = (await A('trab')).boi;
  confere(!!boi && boi.tratado && boi.casas === 6, `o boi chega tratado (cocho e bebedouro cheios) e ara até 6 casas (${JSON.stringify(boi)})`);
  confere(await A('visivel', 'button[data-modo="arado"]'), 'com o boi e o arado, o modo "Arado" aparece na barra');
  await tocarEm('button[data-modo="arado"]');
  igual(await A('modo'), 'arado', 'o botão "Arado" escolhe o modo');
  await esperarFala(/fileira inteira, até 6 casas/, 'o boi de arado', 'trabalho:boi');
  // a primeira fileira do campo do começo: segurar o dedo (o mouse) marca a fileira do boi antes de soltar
  const C = await J(() => window.__jogo.dados.terras.campo); // [x0, z0, x1, z1]
  const linha = (z) => Array.from({ length: C[2] - C[0] }, (_, k) => [C[0] + k, z]);
  const doBoi = async () => (await A('eventos', 'arou')).filter((x) => x.com === 'boi').length;
  const passadas = () => J(() => { const p = window.__jogo.mundo.personagem; return [p.tarefa, ...p.fila].filter((t) => t && t.acao === 'ararComBoi').map((t) => ({ dir: t.args.dir, casas: t.args.casas, janela: !!t.args.janela })); });
  await segurarCasa(C[0] + 2, C[1], async () => {
    confere(/Solte para o boi arar 6 casas/.test(await A('dica')), `segurando, a dica diz que o boi ara as 6 casas da fileira ("${await A('dica')}")`);
    igual((await A('p')).fila.length, 0, 'segurando, nada entra na fila ainda');
    await foto('fileira-do-boi-marcada', true);
  });
  let pas = await passadas();
  confere(pas.length === 1 && pas[0].casas.length === 6 && pas[0].casas.every(([, z]) => z === C[1]), `soltar põe a fileira inteira do boi na fila, ao longo da fileira (${JSON.stringify(pas)})`);
  // no meio da passada: o boi puxa o arado, a personagem conduz
  for (let k = 0; k < 200 && (await doBoi()) < 3; k++) await avancar(0.25);
  await seguir();
  await foto('boi-puxando', true);
  await ateParar();
  await fecharTelas();
  igual((await A('chao', linha(C[1]))).join(''), '111111', 'o boi arou a primeira fileira inteira');
  // a segunda fileira: no celular, um toque curto; no computador, Espaço de frente para ela (dá no mesmo: a fileira toda)
  if (comDedo) await tocarCasa(C[0], C[1] + 1);
  else {
    await J(([x, z]) => { const p = window.__jogo.mundo.personagem; p.x = x; p.z = z; p.rumo = 0; p.rota = null; }, [C[0] + 2.5, C[1] + 0.5]);
    await quadro();
    await pg.keyboard.press('Space');
    await quadro();
  }
  pas = await passadas();
  confere(pas.length === 1 && pas[0].casas.length === 6 && pas[0].casas.every(([, z]) => z === C[1] + 1), `${comDedo ? 'um toque' : 'Espaço'} na segunda fileira põe a fileira inteira na fila (${JSON.stringify(pas)})`);
  await ateParar();
  await fecharTelas();
  igual((await A('chao', linha(C[1] + 1))).join(''), '111111', 'o boi arou a segunda fileira inteira');
  igual(await doBoi(), 12, 'o boi arou as 12 casas do campo do começo');
  confere(await A('feita', 'boi-de-arado'), 'doze casas com o boi cumprem a missão "boi-de-arado"');
  await seguir();
  await foto('campo-do-comeco-arado-pelo-boi');

  // ================= um campo de 6 x 6: sem trato, três casas; a passada pega o lado com mais casas =================
  await J(() => { const m = window.__jogo.mundo, a = m.animais.lista.find((x) => x.especie === 'boi'), s = m.animais.abrigos[a.abrigo]; s.cocho = 0; s.bebedouro = 0; a.tratado = false; window.__t.limpar(); });
  boi = (await A('trab')).boi;
  confere(!boi.tratado && boi.casas === 3, `com o cocho e o bebedouro vazios, o boi ara só três casas por passada (${JSON.stringify(boi)})`);
  // o campo de plantação já demarcado na grama perto dela (a fileira do boi para na beira dele)
  const p1 = await A('p');
  const [x0, z0] = (await A('livres', 6, 6, p1.x + 3, p1.z + 3))[0];
  const fileira = (z) => Array.from({ length: 6 }, (_, k) => [x0 + k, z]);
  const coluna = (x) => Array.from({ length: 6 }, (_, k) => [x, z0 + k]);
  const campo = [];
  for (let z = z0; z < z0 + 6; z++) campo.push(...fileira(z));
  await J((casas) => { const m = window.__jogo.mundo, loc = m.locais.fazenda; for (const [x, z] of casas) loc.chao[z * loc.l + x] = 6; m.eventos.emitir('chaoMudou', { tudo: true, local: loc.id }); }, campo);
  // antes de confirmar, as casas da passada ficam marcadas (no mouse, ao passar por cima)
  if (!comDedo) {
    const q = await A('pontoDaCasa', x0, z0);
    await pg.mouse.move(q.x, q.y);
    await esperar(450);
    igual(await J(() => (window.__jogo.cena.destaque.casas || []).length), 3, 'passando o mouse no campo, as três casas da passada ficam marcadas');
    confere(/Arar 3 casas com o boi/.test(await A('dica')), `a dica diz o que o toque faz ("${await A('dica')}")`);
    await pg.screenshot({ path: path.join(capturas, `${f}-${String(++nFoto).padStart(2, '0')}-casas-marcadas-sem-trato.jpg`), type: 'jpeg', quality: 84 });
  }
  await tocarCasa(x0, z0);
  await quadro();
  confere((await A('p')).fila.includes('ararComBoi'), 'o toque no campo põe a passada do boi na fila');
  await ateParar();
  igual((await A('chao', fileira(z0))).join(''), '111666', 'sem trato, a passada ara três casas da fileira');
  // o trato: cocho e bebedouro pelo painel do estábulo
  await tocarEstabulo();
  igual(await painel(), 'abrigo', 'o painel do estábulo abre');
  confere(await J(() => { const b = document.querySelector('.veu [data-k="extra-arar"]'); const d = b && b.closest('.abr-extra'); return !!b && !!d && /sem trato/i.test(d.textContent); }), 'o botão "Arar com o boi" avisa que, sem trato, ele trabalha pela metade');
  await apertar('encher-cocho');
  await apertar('encher-bebedouro');
  await tamanhos('estábulo com o boi');
  await foto('estabulo-com-o-boi');
  await fecharPainel();
  await ateParar();
  await fecharTelas();
  boi = (await A('trab')).boi;
  confere(boi.tratado && boi.casas === 6, `com cocho e bebedouro, o boi volta a arar até seis casas (${JSON.stringify(boi)})`);
  if ((await A('modo')) !== 'arado') await tocarEm('button[data-modo="arado"]');
  // na ponta da primeira fileira restam 3 casas; na coluna da ponta, 6: o toque ali vai pela coluna
  await tocarCasa(x0 + 5, z0);
  // as outras cinco fileiras (5 casas: a da coluna já está prometida): quatro toques e uma arrastando o dedo
  for (let z = z0 + 1; z < z0 + 5; z++) await tocarCasa(x0, z);
  await arrastarCasas([[x0, z0 + 5], [x0 + 1, z0 + 5]]);
  pas = (await passadas()).map((t) => ({ dir: t.dir, n: t.casas.length, janela: t.janela }));
  confere(pas.length === 6 && pas[0].dir === 1 && pas[0].n === 6 && pas.slice(1, 5).every((t) => t.dir === 0 && t.n === 5 && t.janela) && pas[5].dir === 0 && pas[5].n === 5 && !pas[5].janela,
    `seis passadas na fila: a coluna da ponta (6), quatro fileiras (5) e a do arrasto, para a direita (${JSON.stringify(pas)})`);
  await ateParar();
  await fecharTelas();
  igual((await A('chao', coluna(x0 + 5))).join(''), '111111', 'a coluna da ponta ficou arada inteira (era o lado com mais casas)');
  igual((await A('chao', fileira(z0))).join(''), '111661', 'na primeira fileira ficam só as duas casas do meio');
  igual(await doBoi(), 34, 'o boi arou 3 + 6 + 25 casas');
  igual((await A('chao', campo)).filter((c) => c === 1).length, 34, 'o campo fica arado (fora as duas casas do meio da primeira fileira)');
  await seguir();
  await foto('campo-arado-pelo-boi');
  // o arado de ferro (nível 12): a fileira do boi vai até 10 casas
  await tocarEm('.topo-dir [data-painel="loja"]');
  if ((await painel()) === 'loja') await tocarEm('[data-k="aba-ferramentas"]');
  await comprar('[data-k="c1-arado-de-ferro"]');
  igual(await A('tem', 'arado-de-ferro'), 1, 'a loja vende o arado de ferro');
  await fecharPainel();
  await fecharTelas();
  igual((await A('trab')).boi.casas, 10, 'com o arado de ferro, o boi ara até dez casas por passada');
  // gravar e abrir: a terra arada, a missão e o arado de ferro ficam
  await recarregar();
  igual((await A('chao', campo)).filter((c) => c === 1).length, 34, 'depois de abrir de novo, a terra continua arada');
  igual((await A('trab')).boi.casas, 10, 'e o boi continua com o arado de ferro');
  await J(() => window.__jogo.comando({ tipo: 'escolherModo', modo: 'mao' }));

  // ================= o jumento, a carroça e o barril =================
  await J(() => window.__t.missoes('jumento'));
  await fecharTelas();
  await abrirAbaAnimais();
  await comprar('.oferta[data-item="jumento"] [data-k="comprar-jumento"]');
  await fecharPainel();
  await fecharTelas();
  confere(await A('feita', 'jumento'), 'comprar o jumento cumpre a missão "jumento"');
  confere(!(await A('visivel', '[data-k="levar-jumento"]')), 'sem a carroça, o botão do jumento não aparece');
  await tocarEstabulo();
  await apertar('extra-jumento-falta');
  igual(await painel(), 'loja', '"Comprar a carroça" abre a loja');
  await comprar('[data-k="c1-carroca"]');
  igual(await A('tem', 'carroca'), 1, 'a loja vende a carroça');
  await J(() => window.__t.missoes('barril'));
  await fecharTelas();
  await comprar('[data-k="c1-barril-de-agua"]');
  igual(await A('tem', 'barril-de-agua'), 1, 'a loja vende o barril de água');
  await fecharPainel();
  await fecharTelas();
  confere(await A('feita', 'barril'), 'comprar o barril cumpre a missão "barril"');
  confere(await A('visivel', '[data-k="levar-jumento"]'), 'com jumento e carroça, o botão do jumento aparece no alto');
  if (comDedo) await tocarEm('[data-k="levar-jumento"]'); else { await pg.keyboard.press('KeyJ'); await quadro(); }
  confere((await A('T')).levando, comDedo ? 'tocar no botão leva o jumento' : 'a tecla J leva o jumento');
  await esperarFala(/vai atrás de você com a carroça/, 'o jumento', 'trabalho:jumento');
  confere(await J(() => document.querySelector('[data-k="levar-jumento"]').classList.contains('ativo')), 'ligado, o botão do jumento fica marcado');
  const jum = await A('trab');
  const capC = jum.jumento.capacidade, capB = jum.jumento.barril.capacidade;
  confere(capC === (jum.jumento.tratado ? 150 : 75) && capB === (jum.jumento.tratado ? 400 : 200), `a carroça leva ${capC} e o barril ${capB} (tratado: ${jum.jumento.tratado})`);
  // o barril: tocar no poço com o jumento junto
  await tocarEntidade('poco', 'o poço');
  await ateParar();
  await fecharTelas();
  igual((await A('T')).barril, capB, 'tocar no poço com o jumento junto enche o barril');
  await esperarFala(/regador secar/, 'o barril cheio', 'trabalho:barril-cheio');
  const chipAgua = await A('chip', '.chip.trab-agua');
  confere(!!chipAgua && chipAgua.fonte >= 14 && new RegExp(`${capB}/${capB}`).test(chipAgua.texto), `o HUD mostra a água do barril (${JSON.stringify(chipAgua)})`);
  confere((await A('bichos')).some((b) => b.especie === 'jumento' && b.barril && b.dist < 4), 'o jumento vai junto, com o barril na carroça');
  // plantar o campo (pelo comando: plantar é da frente do campo) e regar tudo pelo toque, sem voltar ao poço
  const plantadas = campo.filter((c, k) => k !== 3 && k !== 4); // (as duas casas do meio da primeira fileira, sem arar)
  await J((casas) => { const m = window.__jogo.mundo; m.comando({ tipo: 'escolherModo', modo: 'semear', semente: 'semente-alface' }); for (const [x, z] of casas) m.comando({ tipo: 'tocarCasa', x: x + 0.5, z: z + 0.5 }); }, plantadas);
  await ateParar();
  igual((await A('plantas', plantadas)).filter((s) => s === 'sede').length, 34, 'as 34 casas aradas ficam plantadas com alface, com sede');
  await J(() => window.__t.limpar());
  await tocarEm('button[data-modo="regar"]');
  for (const [x, z] of plantadas) await tocarCasa(x, z);
  await avancar(14);
  await seguir();
  await foto('regando-com-o-barril', true);
  await ateParar();
  await fecharTelas();
  const enchidas = await A('eventos', 'encheu');
  confere(enchidas.length >= 5 && enchidas.every((x) => x.doBarril), `o regador se enche no barril, no meio do campo, sem ir ao poço (${enchidas.filter((x) => x.doBarril).length} no barril, ${enchidas.filter((x) => !x.doBarril).length} no poço)`);
  igual((await A('plantas', plantadas)).filter((s) => s === 'sede').length, 0, 'o campo todo fica regado');
  confere((await A('T')).barril < capB, 'a água do barril baixa');
  // colher até o cesto passar para a carroça
  await pular(70);
  await J(() => window.__jogo.comando({ tipo: 'escolherModo', modo: 'mao' }));
  const colher = plantadas.slice(0, 28); // a última fileira fica para depois (o cavalo)
  for (const [x, z] of colher) await tocarCasa(x, z);
  await ateParar();
  await fecharTelas();
  const cargas = await A('eventos', 'carregouCarroca');
  const T1 = await A('T');
  const naCarroca = Object.values(T1.carroca).reduce((n, v) => n + v, 0), noCesto = await A('noCesto');
  confere(cargas.length >= 1 && naCarroca > 0, `o cesto cheio passa para a carroça (${cargas.length} vez(es), ${naCarroca} na carroça)`);
  igual(naCarroca + noCesto, 28, 'nada se perde: carroça + cesto = 28 alfaces');
  const chipCarga = await A('chip', '.chip.trab-carga');
  confere(!!chipCarga && chipCarga.fonte >= 14 && chipCarga.texto === `${naCarroca}/${capC}`, `o HUD mostra a carga da carroça (${JSON.stringify(chipCarga)})`);
  await seguir();
  await foto('carroca-carregada');
  // gravar e abrir: o jumento, a carroça e o barril voltam
  await recarregar();
  const T2 = await A('T');
  confere(T2.levando && JSON.stringify(T2.carroca) === JSON.stringify(T1.carroca) && T2.barril === T1.barril, `depois de abrir de novo, a carga e a água continuam (${JSON.stringify(T2)})`);
  await avancar(5);
  confere((await A('bichos')).some((b) => b.especie === 'jumento' && b.dist < 4.5), `e o jumento continua junto (${JSON.stringify((await A('bichos')).filter((b) => b.especie === 'jumento').map((b) => b.dist.toFixed(1)))})`);
  // vender tudo na banca: cesto e carroça
  const ouro0 = await A('ouro');
  await tocarEntidade('banca', 'a banca');
  await ateParar();
  await fecharTelas();
  const preco = await J(() => window.__jogo.dados.itens.alface.venda);
  igual((await A('ouro')) - ouro0, 28 * preco, 'a banca vende o cesto e a carroça juntos');
  confere(Object.keys((await A('T')).carroca).length === 0 && (await A('noCesto')) === 0, 'a carroça e o cesto ficam vazios');
  await quadro(250);
  confere(!(await A('chip', '.chip.trab-carga')), 'com a carroça vazia, o HUD esconde a carga');
  await foto('vendeu-tudo', true);
  // segurar o dedo (o mouse) na fileira do campo, no modo Arado: o boi ara a fileira toda
  if (!comDedo) {
    const colhidas = colher.filter(([, z]) => z === z0 + 2);
    const campoAgora = await A('chao', colhidas);
    if (campoAgora.every((c) => c === 6)) {
      await tocarEm('button[data-modo="arado"]');
      const q = await A('pontoDaCasa', colhidas[2][0], colhidas[2][1]);
      await pg.mouse.move(q.x, q.y); await pg.mouse.down(); await esperar(900); await pg.mouse.up(); await quadro();
      await ateParar();
      igual((await A('chao', colhidas)).join(''), '111111', 'segurando o mouse na fileira colhida, o boi ara a fileira toda (a beira do campo para a fileira, mesmo com o arado de ferro)');
    } else console.log(`  (a casa colhida não voltou a ser campo (chão: ${campoAgora.join('')}): pulei a fileira com o boi)`);
    await J(() => window.__jogo.comando({ tipo: 'escolherModo', modo: 'mao' }));
  }

  // ================= o cavalo e a sela =================
  await J(() => window.__t.missoes('cavalo'));
  await fecharTelas();
  await abrirAbaAnimais();
  await comprar('.oferta[data-item="cavalo"] [data-k="comprar-cavalo"]');
  await fecharPainel();
  await fecharTelas();
  confere((await avisos()).some((x) => /Falta a sela/.test(x)), `um aviso diz que falta a sela (avisos: ${(await avisos()).join(' | ')})`);
  await tocarEstabulo();
  await apertar('extra-cavalo-falta');
  igual(await painel(), 'loja', '"Comprar a sela" abre a loja');
  await comprar('[data-k="c1-sela"]');
  igual(await A('tem', 'sela'), 1, 'a loja vende a sela');
  await fecharPainel();
  await fecharTelas();
  confere(await A('visivel', '[data-k="ir-a-cavalo"]'), 'com cavalo e sela, o botão "ir a cavalo" aparece no alto');
  // o painel do estábulo com os três bichos de trabalho
  await tocarEstabulo();
  confere(await J(() => ['extra-arar', 'extra-cavalo', 'extra-jumento'].every((k) => !!document.querySelector(`.veu [data-k="${k}"]`))), 'o painel do estábulo tem "Arar com o boi", "Ir a cavalo" e o jumento');
  await tamanhos('estábulo com os três');
  await J(() => { const b = document.querySelector('.veu .abr-extras'); if (b) b.scrollIntoView({ block: 'center' }); });
  await foto('estabulo-com-os-tres');
  // longe da última fileira, a pé (com o cavalo desligado)
  const ultima = plantadas.slice(28);
  const pLonge = (await A('livres', 1, 1, ultima[0][0] - 16, ultima[0][1] - 10))[0];
  if (comDedo) {
    // no celular: "Ir a cavalo" pelo botão do estábulo
    await apertar('extra-cavalo');
    confere((await A('T')).aCavalo, '"Ir a cavalo" no painel do estábulo liga o cavalo');
    await fecharPainel();
    await tocarEm('[data-k="ir-a-cavalo"]');
    confere(!(await A('T')).aCavalo, 'tocar no botão do alto desliga o cavalo');
  } else await fecharPainel();
  await J(([x, z]) => window.__jogo.comando({ tipo: 'irPara', x: x + 0.5, z: z + 0.5 }), pLonge);
  await ateParar();
  await quadro(200);
  if (comDedo) await tocarEm('[data-k="ir-a-cavalo"]'); else { await pg.keyboard.press('KeyH'); await quadro(); }
  confere((await A('T')).aCavalo, comDedo ? 'tocar no botão liga "ir a cavalo"' : 'a tecla H liga "ir a cavalo"');
  await esperarFala(/viagem longa/, 'o cavalo', 'trabalho:cavalo');
  // a viagem: tocar numa alface pronta lá longe
  // (um pouco cansada, para ver a barra de fôlego sumir montada)
  await J(() => { window.__t.limpar(); window.__jogo.mundo.personagem.folego = 40; });
  await esperar(250);
  confere(await A('folegoVisivel'), 'cansada e a pé, a barra de fôlego aparece');
  const pAntes = await A('p');
  await tocarCasa(ultima[0][0], ultima[0][1]);
  let montou = false, folegoMin = pAntes.folego, fotografou = false;
  for (let k = 0; k < 80; k++) {
    await avancar(0.25);
    const T = await A('T'), p = await A('p');
    folegoMin = Math.min(folegoMin, p.folego);
    if (T.montada) {
      montou = true;
      if (!fotografou && T.tMontada > 0.6) {
        fotografou = true;
        await seguir(); await esperar(300);
        confere(!(await A('folegoVisivel')), 'montada, a barra de fôlego some');
        await foto('a-cavalo', true);
      }
    }
    if (!T.viagem && montou) break;
  }
  await ateParar();
  await fecharTelas();
  const T3 = await A('T'), pDepois = await A('p');
  confere(montou, 'a viagem longa é feita a cavalo');
  confere(folegoMin >= pAntes.folego - 0.01, `a cavalo, o fôlego não baixa (${pAntes.folego} → ${folegoMin.toFixed(1)})`);
  const vel = T3.cavalgado / Math.max(0.01, T3.tMontada), tratado = (await A('trab')).cavalo.tratado;
  confere(tratado ? vel > 6 : vel > 4, `montada, ela anda a ${vel.toFixed(1)} casas/s (cavalo ${tratado ? 'tratado: 7' : 'sem trato: o passo dela correndo'})`);
  confere(!T3.montada, 'chegou, ela apeia sozinha');
  confere((await A('eventos', 'colheu')).length >= 1, 'apeou e colheu a alface');
  confere(await A('feita', 'cavalo'), 'a viagem a cavalo cumpre a missão "cavalo"');
  const cav = (await A('bichos')).find((b) => b.especie === 'cavalo');
  confere(!!cav && cav.dist < 2, `o cavalo espera do lado dela (${cav ? cav.dist.toFixed(1) : 'sumiu'})`);
  await esperar(250);
  confere(await J(() => !document.getElementById('ui').classList.contains('a-cavalo')), 'a pé de novo, a barra de fôlego volta a valer');
  confere(Math.hypot(pDepois.x - pAntes.x, pDepois.z - pAntes.z) > 8, 'ela cruzou o terreno');
  await seguir();
  await foto('apeou-e-colheu');
  if (!comDedo) {
    // pelas teclas: depois de umas casas seguidas, monta; soltou, apeia
    let andou = 0;
    for (const k of ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']) {
      await J(() => window.__t.limpar());
      const a0 = await A('p');
      await pg.keyboard.down(k);
      await esperar(80);
      await avancar(3.6);
      const a1 = await A('p'), mt = (await A('T')).montada;
      await pg.keyboard.up(k);
      await esperar(80);
      await avancar(0.4);
      andou = Math.hypot(a1.x - a0.x, a1.z - a0.z);
      if (andou > 7.5) { confere(mt && (await A('eventos', 'montouNoCavalo')).length === 1, `segurando a seta ${k}, ela monta no caminho (andou ${andou.toFixed(1)} casas)`); confere(!(await A('T')).montada, 'soltou a seta, ela apeia'); break; }
    }
    confere(andou > 7.5, `as setas levam a personagem longe o bastante para montar (andou ${andou.toFixed(1)})`);
    // o controle: Y abre o menu, o direcional vai até o botão do cavalo, A aperta
    await quadro(200);
    await controle(3);
    for (let k = 0; k < 24; k++) {
      const d = await J(() => { const a = document.activeElement, b = document.querySelector('[data-k="ir-a-cavalo"]'); if (!a || !b) return null; if (a === b) return 'ok'; const r = a.getBoundingClientRect(), q = b.getBoundingClientRect(), dx = q.left + q.width / 2 - (r.left + r.width / 2), dy = q.top + q.height / 2 - (r.top + r.height / 2); return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 15 : 14) : dy > 0 ? 13 : 12; });
      if (d === 'ok' || d === null) break;
      await controle(d);
    }
    confere(await J(() => document.activeElement === document.querySelector('[data-k="ir-a-cavalo"]')), 'o direcional do controle chega no botão do cavalo');
    await controle(0);
    confere(!(await A('T')).aCavalo, 'o A do controle desliga "ir a cavalo"');
    await controle(0);
    confere((await A('T')).aCavalo, 'e liga de novo');
    await controle(1);
  }
  // gravar e abrir: o cavalo continua ligado
  await recarregar();
  confere((await A('T')).aCavalo && (await A('T')).levando, 'depois de abrir de novo, "ir a cavalo" e o jumento continuam ligados');
  await quadro(250);
  confere(await J(() => document.querySelector('[data-k="ir-a-cavalo"]').classList.contains('ativo') && document.querySelector('[data-k="levar-jumento"]').classList.contains('ativo')), 'os dois botões aparecem marcados');
  await avancar(0.5);
  await seguir();
  await foto('fim-tudo-ligado');
  confere(a.erros.length === 0, `${f}: erro no console: ${a.erros.slice(0, 3).join(' | ')}`);
}

try {
  console.log('1280x720, mouse, teclado e controle');
  let a = await abrir(1280, 720);
  await cenario(a, 'f-pc');
  await a.ctx.close();

  console.log('844x390, celular deitado, toque');
  a = await abrir(844, 390, { toque: true, dpr: 2 });
  await cenario(a, 'f-cel');
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
