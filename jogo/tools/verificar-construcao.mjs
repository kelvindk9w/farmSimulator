// Confere a frente de construir no jogo montado, num Chromium sem janela, com cliques, toques e teclas de verdade:
// abrir o catálogo, escolher o lugar da bancada (setas, mouse ou dedo), ver a obra nascer e ficar pronta; colocar o
// galinheiro e mudá-lo de lugar; guardar e recolocar um enfeite; pintar cerca arrastando, pôr porteira e calçamento;
// entrar no celeiro, montar uma prateleira, guardar o cesto com um toque, sair; a mochila por móvel; a gravação.
// Em 1280x720 (mouse e teclado) e em 844x390 (celular deitado, dedo). O ouro, o nível e os materiais vêm do gancho
// de teste (window.__jogo.mundo). Termina com "Tudo certo." ou com a lista das falhas.
//   JOGO_DIST=dist-x JOGO_CAPTURAS=capturas-x node tools/verificar-construcao.mjs     (monte antes: npm run build)
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

async function pronto(pg) {
  await pg.waitForFunction(() => window.__jogo && window.__jogo.pronto !== undefined, null, { timeout: 20000 });
  if (!(await pg.evaluate(() => window.__jogo.pronto))) throw new Error('o jogo não começou: ' + (await pg.evaluate(() => document.querySelector('.erro') && document.querySelector('.erro').textContent)));
  await pg.evaluate(() => window.__jogo.baixarArte());
  await pg.waitForFunction(() => window.__jogo.arteBaixada(), null, { timeout: 20000 });
  // ajudas desta verificação, do lado da página (só leem o mundo; quem joga são os toques)
  await pg.evaluate(() => {
    const j = window.__jogo;
    window.__c = {
      modo() { return j.J.colocacao ? j.J.colocacao() : null; },
      // a base do fantasma, em casas
      base() { const md = this.modo(), d = md && md.id ? j.mundo.dados.construcoes[md.id] : null; return !d ? [1, 1] : md.giro && d.gira ? [d.casas[1], d.casas[0]] : d.casas; },
      de(tipo) { return j.mundo.construcao.todas.filter((e) => e.tipo === tipo).map((e) => ({ id: e.id, x: e.x, z: e.z, l: e.l, p: e.p, local: e.local, obra: e.obraAte > 0, giro: e.giro || 0 })); },
      guardadas(tipo) { return j.mundo.construcao.guardadas[tipo] || 0; },
      local() { return j.mundo.personagem.local; },
      porta() { const e = j.mundo.construcao.todas.find((o) => o.tipo === 'celeiro'); return [e.x + e.l / 2, e.z + e.p + 0.5]; },
      // o ponto (x, z) do mundo está numa parte da tela onde o dedo alcança o chão (fora da barra e do HUD)?
      aVista(x, z) { const cam = j.cena.cam, sx = cam.cssX(x, z), sy = cam.cssY(x, 0, z); return sx > 70 && sx < cam.w - 70 && sy > 96 && sy < cam.h - 96; },
      // nenhuma figura (uma construção alta na frente) tapa o toque nas casas deste retângulo?
      descoberto(x, z, l, p) {
        const m = j.mundo, cam = j.cena.cam;
        for (let dz = 0; dz < p; dz++) for (let dx = 0; dx < l; dx++) for (const alto of [0, 0.5]) if (j.cena.entidadeEm(m, cam.cssX(x + dx + 0.5, z + dz + 0.5), cam.cssY(x + dx + 0.5, alto, z + dz + 0.5)) !== null) return false;
        return true;
      },
      serve(x, z) { const loc = j.mundo.local, i = loc.dentro(x, z) ? loc.i(x, z) : -1; return i >= 0 && loc.propria[i] === 1 && loc.chao[i] === (loc.interior ? 4 : 0) && !loc.ocupa[i] && !loc.plantas[i] && !loc.entidadeEm(x, z); },
      // retângulos l × p de chão livre (com folga em volta), do mais perto de (cx, cz) ao mais longe; soAVista = só os que cabem na tela agora
      livres(l, p, cx, cz, folga = 1, soAVista = false) {
        const loc = j.mundo.local, out = [];
        for (let z = 0; z <= loc.p - p; z++) for (let x = 0; x <= loc.l - l; x++) {
          let ok = true;
          for (let dz = -folga; dz < p + folga && ok; dz++) for (let dx = -folga; dx < l + folga && ok; dx++) if (!this.serve(x + dx, z + dz)) ok = false;
          if (ok && (!soAVista || (this.aVista(x + 0.5, z + 0.5) && this.aVista(x + l - 0.5, z + p - 0.5) && this.aVista(x + l - 0.5, z + 0.5) && this.aVista(x + 0.5, z + p - 0.5) && this.descoberto(x, z, l, p)))) out.push([x, z]);
        }
        return out.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cz) - Math.hypot(b[0] - cx, b[1] - cz));
      },
      textoPequeno(raiz) {
        const ruins = [];
        for (const n of raiz.querySelectorAll('*')) {
          if (n.closest('[hidden]') || !n.getClientRects().length) continue;
          const temTexto = [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
          if (temTexto && parseFloat(getComputedStyle(n).fontSize) < 14) ruins.push(`texto de ${getComputedStyle(n).fontSize} em "${n.textContent.trim().slice(0, 24)}"`);
          if (n.tagName === 'BUTTON') { const r = n.getBoundingClientRect(); if (r.width < 44 || r.height < 44) ruins.push(`botão de ${Math.round(r.width)}x${Math.round(r.height)} (${n.className})`); }
        }
        return ruins;
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
async function dedo(cdp, pontos, pausa = 30) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pontos[0][0], y: pontos[0][1], id: 1 }] });
  for (let i = 1; i < pontos.length; i++) { await esperar(pausa); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pontos[i][0], y: pontos[i][1], id: 1 }] }); }
  await esperar(pausa);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await esperar(40);
}
// do ponto a ao ponto b, com paradas no meio (o dedo não pula)
const caminho = (a, b, n = 6) => Array.from({ length: n + 1 }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);

// o cenário inteiro, com o ponteiro da vez (mouse ou dedo); "f" = prefixo das fotos
async function cenario(a, f) {
  const { pg, cdp } = a, comDedo = !!cdp;
  const J = (fn, arg) => pg.evaluate(fn, arg);
  const tocarXY = async (x, y) => { if (comDedo) await dedo(cdp, [[x, y]]); else await pg.mouse.click(x, y); await esperar(60); };
  const arrastarXY = async (pts) => {
    if (comDedo) await dedo(cdp, pts);
    else { await pg.mouse.move(pts[0][0], pts[0][1]); await pg.mouse.down(); for (const p of pts.slice(1)) await pg.mouse.move(p[0], p[1], { steps: 3 }); await pg.mouse.up(); }
    await esperar(80);
  };
  const quadro = async () => { await J(() => window.__jogo.desenhar()); await esperar(60); };
  const foto = async (nome) => { await J(() => window.__jogo.desenhar()); await esperar(350); await pg.screenshot({ path: path.join(capturas, `${f}-${nome}.jpg`), type: 'jpeg', quality: 84 }); };
  const ateParar = async () => { const s = await J(() => window.__jogo.ateParar(400)); if (s < 0) confere(false, 'a personagem não parou em 400 s'); await J(() => window.__jogo.desenhar()); return s; };
  const modo = () => J(() => window.__c.modo());
  const de = (tipo) => J((t) => window.__c.de(t), tipo);
  const painel = () => J(() => window.__jogo.painelAberto());
  // toca num elemento da interface (rola o painel até ele aparecer)
  async function tocarEm(seletor, obrigatorio = true) {
    const tem = await J((s) => { const e = document.querySelector(s); if (!e || e.hidden || e.closest('[hidden]')) return false; if (e.closest('.corpo')) e.scrollIntoView({ block: 'center', inline: 'center' }); return true; }, seletor);
    if (!tem) { if (obrigatorio) confere(false, `não achei "${seletor}" na tela`); return false; }
    await esperar(60);
    const r = await J((s) => { const r = document.querySelector(s).getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return { x, y, livre: !!e && (e === document.querySelector(s) || document.querySelector(s).contains(e)), quem: e ? e.className || e.id : 'nada' }; }, seletor);
    confere(r.livre, `"${seletor}" devia receber o toque, mas há "${r.quem}" por cima`);
    await tocarXY(r.x, r.y);
    return true;
  }
  // o ponto da tela onde está (x, z) do mundo; com "olhar", a câmera vai para lá antes
  async function ponto(x, z, alto = 0, olhar = true) {
    if (olhar) await J(([x, z]) => window.__jogo.olhar(x, z), [x, z]);
    const p = await J(([x, z, alto]) => { const p = window.__jogo.naTela(x, z, alto); const e = document.elementFromPoint(p.x, p.y); return { ...p, livre: !!e && (e.id === 'tela' || e.classList.contains('cons-toque')), quem: e ? e.className || e.id : 'nada' }; }, [x, z, alto]);
    confere(p.livre, `(${x}, ${z}) devia estar livre para o toque, mas há "${p.quem}" por cima`);
    return p;
  }
  const tocarCasa = async (x, z) => { const p = await ponto(x + 0.5, z + 0.5); await tocarXY(p.x, p.y); };
  const tocarConstrucao = async (e, alto = 0.4) => { const p = await ponto(e.x + e.l / 2, e.z + e.p / 2, alto); await tocarXY(p.x, p.y); };
  const fecharPainel = async () => { if (comDedo) await tocarEm('.veu .fechar'); else await pg.keyboard.press('Escape'); await esperar(80); };
  async function abrirCatalogo(aba) {
    if ((await painel()) !== 'construir') await tocarEm('.topo-dir [data-painel="construir"]');
    igual(await painel(), 'construir', 'o botão do HUD abre o catálogo de construir');
    if (aba) await tocarEm(`[data-k="aba-${aba}"]`);
  }
  // escolhe uma construção no catálogo: o painel fecha e o fantasma aparece
  async function escolher(aba, id) {
    await abrirCatalogo(aba);
    await tocarEm(`.oferta[data-item="${id}"] [data-k="c-${id}"]`);
    await quadro();
    const md = await modo();
    confere(!!md && md.id === id && (await painel()) === null, `escolher "${id}" fecha o painel e liga o modo de escolher o lugar`);
    return md;
  }
  // leva o fantasma até a casa (tx, tz): com as setas, com um clique ou arrastando com o dedo
  async function levar(tx, tz, meio) {
    const md = await modo(), cs = await J(() => window.__c.base());
    if (meio === 'teclas') {
      for (let k = Math.abs(tx - md.x); k > 0; k--) await pg.keyboard.press(tx > md.x ? 'ArrowRight' : 'ArrowLeft');
      for (let k = Math.abs(tz - md.z); k > 0; k--) await pg.keyboard.press(tz > md.z ? 'ArrowDown' : 'ArrowUp');
    } else {
      const t = await ponto(tx + cs[0] / 2, tz + cs[1] / 2, 0, false);
      // (arrasta a partir do fantasma quando ele está na tela; se a câmera foi para longe dele, basta tocar no lugar)
      if (meio === 'arrasto' && (await J(([x, z]) => window.__c.aVista(x, z), [md.x + cs[0] / 2, md.z + cs[1] / 2]))) { const g = await ponto(md.x + cs[0] / 2, md.z + cs[1] / 2, 0, false); await arrastarXY(caminho([g.x, g.y], [t.x, t.y])); } else await tocarXY(t.x, t.y);
    }
    await quadro();
    const d = await modo();
    confere(!!d && d.x === tx && d.z === tz, `o fantasma vai para (${tx}, ${tz}) ${meio === 'teclas' ? 'com as setas' : meio === 'arrasto' ? 'arrastado' : 'com o toque'} (está em ${d ? d.x + ', ' + d.z : 'lugar nenhum'})`);
  }
  const confirmar = async (comTecla) => { if (comTecla) await pg.keyboard.press('Enter'); else await tocarEm('.cons-barra [data-k="confirmar"]'); await quadro(); };
  // um lugar livre e à vista para a base do fantasma, perto dele
  // (se não há nenhum na tela, a câmera vai até o mais perto; "base" troca a base do fantasma por outra, [l, p])
  async function lugar(folga = 1, salto = 0, base = null) {
    await quadro(); await quadro();
    const md = await modo(), cs = base || (await J(() => window.__c.base()));
    const busca = (x, z, soAVista) => J(([l, p, x, z, folga, v]) => window.__c.livres(l, p, x, z, folga, v), [cs[0], cs[1], x, z, folga, soAVista]);
    let l = await busca(md.x, md.z, true);
    if (l.length > salto) return l[salto];
    for (const q of (await busca(md.x, md.z, false)).slice(0, 12)) {
      await J(([x, z]) => window.__jogo.olhar(x, z), [q[0] + cs[0] / 2, q[1] + cs[1] / 2]);
      l = await busca(q[0], q[1], true);
      if (l.length > salto) return l[salto];
    }
    return null;
  }

  // ---- começo: ouro, nível e materiais pelo gancho de teste
  await J(() => { const m = window.__jogo.mundo; m.posses.ouro = 60000; m.progresso.nivel = 12; m.progresso.xp = m.dados.niveis.limiar[12] + 100; Object.assign(m.posses.bolsa, { madeira: 40, tabua: 50, prego: 60, pedra: 30, fibra: 20 }); });
  await quadro();

  // ---- o catálogo: categorias, o que falta, o que está travado
  await abrirCatalogo('industria');
  for (const k of ['abrigo', 'industria', 'armazem', 'util', 'cerca', 'decoracao']) confere(await J((k) => !!document.querySelector(`[data-k="aba-${k}"]`), k), `o catálogo tem a aba "${k}"`);
  confere(await J(() => { const o = document.querySelector('.oferta[data-item="bancada-de-carpintaria"]'); return !!o && /120/.test(o.textContent) && /40\/6/.test(o.textContent) && !o.querySelector('.bt').classList.contains('sem'); }), 'a bancada mostra o preço (120 de ouro, madeira 40/6) e dá para escolher');
  confere(await J(() => { const o = document.querySelector('.oferta[data-item="moinho"]'); return !!o && /Precisa da bancada/.test(o.textContent) && o.querySelector('.bt').classList.contains('sem'); }), 'sem a bancada, o moinho diz que precisa dela');
  confere(await J(() => /Comece pela bancada/.test(document.querySelector('.cons').textContent)), 'sem bancada, o catálogo diz por onde começar');
  let ruins = await J(() => window.__c.textoPequeno(document.querySelector('.veu')));
  confere(ruins.length === 0, 'catálogo (indústrias): ' + ruins.slice(0, 4).join('; '));
  await foto('catalogo-industrias');
  await tocarEm('[data-k="aba-abrigo"]');
  confere(await J(() => { const t = document.querySelectorAll('.cons-oferta.travada'); return t.length >= 1 && [...t].every((o) => /Nível \d+/.test(o.textContent) && !o.querySelector('button')); }), 'o que o nível não libera aparece travado, com o nível');
  await foto('catalogo-abrigos');
  if (!comDedo) {
    await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('ArrowRight');
    confere(await J(() => document.activeElement && document.activeElement.tagName === 'BUTTON' && !!document.activeElement.closest('.veu')), 'as setas andam pelos botões do catálogo');
    await pg.keyboard.press('Escape');
    igual(await painel(), null, 'Esc fecha o catálogo');
  }

  // ---- a bancada: escolher o lugar, cancelar, lugar ruim, confirmar; ela anda, martela e a obra nasce
  let md = await escolher('industria', 'bancada-de-carpintaria');
  confere(await J(() => document.body.classList.contains('colocando') && !!document.querySelector('.cons-barra [data-k="confirmar"]') && !!document.querySelector('.cons-barra [data-k="cancelar"]')), 'Confirmar e Cancelar ficam à vista');
  confere(md.ok, 'o fantasma nasce num lugar que serve, perto dela');
  ruins = await J(() => window.__c.textoPequeno(document.querySelector('.cons-modo')));
  confere(ruins.length === 0, 'barra de escolher o lugar: ' + ruins.slice(0, 4).join('; '));
  if (comDedo) await tocarEm('.cons-barra [data-k="cancelar"]'); else await pg.keyboard.press('Escape');
  await quadro();
  confere((await modo()) === null && (await de('bancada-de-carpintaria')).length === 0 && !(await J(() => document.body.classList.contains('colocando'))), 'cancelar sai do modo sem construir nada');
  md = await escolher('industria', 'bancada-de-carpintaria');
  // em cima do celeiro não serve: casas vermelhas, o motivo escrito e o Confirmar apagado
  const cel = (await de('celeiro'))[0];
  if (comDedo) { const g = await ponto(md.x + 1, md.z + 0.5, 0, false); const t = await J(([x, z]) => window.__jogo.naTela(x, z), [cel.x + 2, cel.z + 2]); await arrastarXY(caminho([g.x, g.y], [Math.max(60, Math.min(a.w - 60, t.x)), Math.max(110, Math.min(a.h - 110, t.y))], 8)); for (let k = 0; k < 30 && (await modo()).ok; k++) await esperar(100); } else await levar(cel.x + 1, cel.z + 1, 'teclas');
  await quadro();
  let ruim = await modo();
  if (ruim.ok && comDedo) { await levar(cel.x + 1, cel.z + 1, 'toque'); ruim = await modo(); }
  confere(!ruim.ok && !!ruim.motivo, 'em cima do celeiro o lugar não serve');
  confere(await J(() => document.querySelector('.cons-barra [data-k="confirmar"]').classList.contains('sem') && !!document.querySelector('.cons-info .ruim')), 'lugar ruim: o Confirmar apaga e a barra diz o motivo');
  await foto('lugar-ruim');
  await confirmar(!comDedo);
  confere((await modo()) !== null && (await de('bancada-de-carpintaria')).length === 0, 'confirmar num lugar ruim não constrói');
  // de volta para perto dela, num lugar bom
  const eu = await J(() => window.__jogo.estado().personagem);
  if (comDedo) { await J(([x, z]) => window.__jogo.olhar(x, z), [eu.x, eu.z + 2]); const p0 = await J(([x, z]) => window.__jogo.naTela(x, z), [eu.x, eu.z + 2.5]); await tocarXY(p0.x, p0.y); }
  else { const q = await J(([x, z]) => window.__c.livres(2, 1, x, z, 1)[0], [eu.x, eu.z + 2]); await levar(q[0], q[1], 'teclas'); }
  let alvo = await lugar(1);
  if (!confere(!!alvo, 'há um lugar livre e à vista para a bancada')) return;
  await levar(alvo[0], alvo[1], comDedo ? 'arrasto' : 'teclas');
  confere((await modo()).ok, 'o lugar escolhido para a bancada serve');
  await foto('bancada-fantasma');
  const ouro0 = await J(() => window.__jogo.mundo.posses.ouro);
  await confirmar(!comDedo);
  confere((await modo()) === null, 'confirmar encerra o modo');
  confere(await J(() => window.__jogo.ocupada()), 'depois de confirmar, ela vai até lá');
  // para no meio das marteladas, para a foto
  await J(() => { const j = window.__jogo, p = j.mundo.personagem; for (let k = 0; k < 6000 && !(p.acao && p.acao.id === 'colocarConstrucao'); k++) j.mundo.passo(); for (let k = 0; k < 12; k++) j.mundo.passo(); });
  confere(await J(() => { const p = window.__jogo.mundo.personagem; return !!p.acao && p.acao.id === 'colocarConstrucao'; }), 'ela martela no lugar da obra');
  await foto('martelando');
  await ateParar();
  let banc = (await de('bancada-de-carpintaria'))[0];
  if (!confere(!!banc && banc.obra && banc.x === alvo[0] && banc.z === alvo[1], 'a obra da bancada nasce no lugar escolhido')) return;
  igual(await J(() => window.__jogo.mundo.posses.ouro), ouro0 - 120, 'a bancada custa 120 de ouro');
  igual(await J(() => window.__jogo.mundo.posses.bolsa.madeira), 34, 'e 6 de madeira');
  await J(([x, z]) => window.__jogo.olhar(x, z), [banc.x + 1, banc.z + 0.5]);
  await foto('bancada-em-obra');
  // o toque na obra abre o cartão com o relógio
  await tocarConstrucao(banc);
  igual(await painel(), 'construcao', 'o toque na obra abre o cartão dela');
  confere(await J(() => !!document.querySelector('.cons-obra') && /Falta/.test(document.querySelector('.cons-falta').textContent)), 'o cartão da obra mostra quanto falta');
  await foto('cartao-da-obra');
  await fecharPainel();
  await J(() => { window.__jogo.pular(21); window.__jogo.avancar(0.2); });
  await quadro();
  banc = (await de('bancada-de-carpintaria'))[0];
  confere(!banc.obra, 'passado o tempo, a bancada fica pronta');
  confere(await J(() => window.__jogo.avisos().some((t) => /Bancada de carpintaria: obra concluída/.test(t))), 'o jogo avisa que a bancada ficou pronta');
  await foto('bancada-pronta');
  // o toque na bancada pronta abre um painel (o da indústria, quando existe) com "Mudar de lugar"
  await tocarConstrucao(banc);
  confere((await painel()) !== null, 'o toque na bancada pronta abre um painel');
  confere(await J(() => !!document.querySelector('.veu [data-k="mover"]')), 'o painel da bancada oferece "Mudar de lugar"');
  await fecharPainel();

  // ---- o galinheiro: lugar com o clique (ou arrastando), obra de um minuto
  await J(() => window.__jogo.seguir());
  md = await escolher('abrigo', 'galinheiro');
  alvo = await lugar(1);
  if (!confere(!!alvo, 'há um lugar livre e à vista para o galinheiro')) return;
  await levar(alvo[0], alvo[1], comDedo ? 'arrasto' : 'toque');
  await foto('galinheiro-fantasma');
  await confirmar(false);
  await ateParar();
  let gal = (await de('galinheiro'))[0];
  if (!confere(!!gal && gal.obra && gal.x === alvo[0], 'a obra do galinheiro nasce no lugar escolhido')) return;
  await J(() => { window.__jogo.pular(30); window.__jogo.avancar(0.2); });
  await J(([x, z]) => window.__jogo.olhar(x, z), [gal.x + 1.5, gal.z + 1.5]);
  await foto('galinheiro-em-obra');
  await J(() => { window.__jogo.pular(31); window.__jogo.avancar(0.2); });
  confere(!(await de('galinheiro'))[0].obra, 'o galinheiro fica pronto');
  await foto('galinheiro-pronto');

  // ---- mudar de lugar: "Mudar coisas de lugar", tocar no galinheiro, escolher o lugar novo
  await J(() => window.__jogo.seguir());
  await abrirCatalogo();
  await tocarEm('[data-k="arrumar"]');
  await quadro();
  igual(((await modo()) || {}).tipo, 'arrumar', '"Mudar coisas de lugar" liga o modo de arrumar');
  await tocarConstrucao(gal, 0.6);
  await quadro();
  md = await modo();
  if (!confere(!!md && md.tipo === 'mover' && md.id === 'galinheiro', 'no modo de arrumar, o toque pega o galinheiro')) return;
  alvo = await lugar(1, 3);
  if (!alvo) alvo = await lugar(1, 0);
  if (!confere(!!alvo, 'há outro lugar livre para o galinheiro')) return;
  await levar(alvo[0], alvo[1], comDedo ? 'arrasto' : 'toque');
  await foto('mudando-o-galinheiro');
  await confirmar(false);
  const gal2 = (await de('galinheiro'))[0];
  confere(gal2.x === alvo[0] && gal2.z === alvo[1] && !gal2.obra, 'o galinheiro muda de lugar na hora, sem obra de novo');
  igual(((await modo()) || {}).tipo, 'arrumar', 'depois de mudar, continua no modo de arrumar');
  await tocarEm('.cons-barra [data-k="cancelar"]');
  await quadro();
  igual(await modo(), null, '"Pronto" encerra o modo de arrumar');

  // ---- enfeite: colocar, guardar pelo cartão, recolocar sem pagar, mudar pelo cartão
  await J(() => window.__jogo.seguir());
  md = await escolher('decoracao', 'canteiro-de-flores');
  confere(md.seq, 'enfeite sem obra entra no modo de colocar vários');
  alvo = await lugar(1);
  await levar(alvo[0], alvo[1], comDedo ? 'toque' : 'teclas');
  if (!comDedo) await confirmar(true);
  igual(((await modo()) || {}).postas, 1, 'um toque (ou Enter) coloca um canteiro e o modo continua');
  await tocarEm('.cons-barra [data-k="cancelar"]');
  await ateParar();
  let cant = (await de('canteiro-de-flores'))[0];
  if (!confere(!!cant && !cant.obra, 'o canteiro aparece pronto')) return;
  await tocarConstrucao(cant, 0.2);
  igual(await painel(), 'construcao', 'o toque no canteiro abre o cartão dele');
  confere(await J(() => !!document.querySelector('.veu [data-k="mover"]') && !!document.querySelector('.veu [data-k="guardar"]')), 'o cartão do enfeite oferece "Mudar de lugar" e "Guardar"');
  ruins = await J(() => window.__c.textoPequeno(document.querySelector('.veu')));
  confere(ruins.length === 0, 'cartão da construção: ' + ruins.slice(0, 4).join('; '));
  await foto('cartao-do-canteiro');
  await tocarEm('.veu [data-k="guardar"]');
  await quadro();
  confere((await de('canteiro-de-flores')).length === 0 && (await J(() => window.__c.guardadas('canteiro-de-flores'))) === 1, 'guardar tira o canteiro do mapa e põe no depósito');
  await J(() => window.__jogo.seguir());
  await abrirCatalogo('decoracao');
  confere(await J(() => /guardada: 1/.test(document.querySelector('.oferta[data-item="canteiro-de-flores"]').textContent)), 'o catálogo mostra o canteiro guardado');
  await foto('catalogo-guardada');
  const ouro1 = await J(() => window.__jogo.mundo.posses.ouro);
  await escolher('decoracao', 'canteiro-de-flores');
  alvo = await lugar(1);
  await levar(alvo[0], alvo[1], 'toque');
  if (!comDedo) await confirmar(false);
  await tocarEm('.cons-barra [data-k="cancelar"]', false);
  await ateParar();
  cant = (await de('canteiro-de-flores'))[0];
  confere(!!cant && (await J(() => window.__jogo.mundo.posses.ouro)) === ouro1 && (await J(() => window.__c.guardadas('canteiro-de-flores'))) === 0, 'recolocar o que estava guardado não custa nada');
  await tocarConstrucao(cant, 0.2);
  await tocarEm('.veu [data-k="mover"]');
  await quadro();
  md = await modo();
  confere(!!md && md.tipo === 'mover' && md.id === 'canteiro-de-flores' && (await painel()) === null, '"Mudar de lugar" fecha o cartão e liga o fantasma');
  alvo = await lugar(1, 2);
  await levar(alvo[0], alvo[1], comDedo ? 'arrasto' : 'teclas');
  await confirmar(!comDedo);
  const cant2 = (await de('canteiro-de-flores'))[0];
  confere(cant2.x === alvo[0] && cant2.z === alvo[1] && (await modo()) === null, 'o canteiro muda de lugar');

  // ---- cerca: arrastar pinta várias; porteira gira; calçamento com toques
  await J(() => window.__jogo.seguir());
  md = await escolher('cerca', 'cerca-de-madeira');
  await quadro();
  // uma fileira de quatro casas livres, à vista
  const fila4 = (await lugar(1, 0, [4, 1])) || (await lugar(0, 0, [4, 1]));
  if (!confere(!!fila4, 'há uma fileira livre e à vista para a cerca')) return;
  const ouro2 = await J(() => window.__jogo.mundo.posses.ouro);
  const pA = await ponto(fila4[0] + 0.5, fila4[1] + 0.5, 0, false), pB = await ponto(fila4[0] + 3.5, fila4[1] + 0.5, 0, false);
  await arrastarXY(caminho([pA.x, pA.y], [pB.x, pB.y], 9));
  await quadro();
  igual(((await modo()) || {}).postas, 4, 'arrastar pela fileira coloca quatro trechos de cerca');
  await foto('cerca-pintando');
  await tocarEm('.cons-barra [data-k="cancelar"]');
  await ateParar();
  const cercas = await de('cerca-de-madeira');
  igual(cercas.length, 4, 'as quatro cercas ficam no mapa');
  igual(await J(() => window.__jogo.mundo.posses.ouro), ouro2 - 60, 'cada trecho custa 15 de ouro');
  confere(await J((c) => c.every((e) => !window.__jogo.mundo.local.andavel(e.x, e.z)), cercas), 'cerca bloqueia a passagem');
  // a porteira, na ponta da fileira
  md = await escolher('cerca', 'porteira');
  if (comDedo) await tocarEm('.cons-barra [data-k="girar"]'); else await pg.keyboard.press('KeyR');
  await quadro();
  igual((await modo()).giro, 1, 'a porteira gira (botão Girar ou tecla R)');
  if (comDedo) await tocarEm('.cons-barra [data-k="girar"]'); else await pg.keyboard.press('KeyR');
  await quadro();
  alvo = await lugar(0);
  if (!confere(!!alvo, 'há lugar livre e à vista para a porteira')) return;
  await levar(alvo[0], alvo[1], 'toque');
  if (!comDedo) await confirmar(false);
  await tocarEm('.cons-barra [data-k="cancelar"]', false);
  await ateParar();
  const port = (await de('porteira'))[0];
  if (!confere(!!port && port.x === alvo[0] && port.z === alvo[1], 'a porteira fica no lugar escolhido')) return;
  confere(await J((e) => window.__jogo.mundo.local.andavel(e.x, e.z) && window.__jogo.mundo.local.andavel(e.x + 1, e.z), port), 'porteira não bloqueia');
  // calçamento: três toques, três pedras
  md = await escolher('cerca', 'caminho-de-pedra');
  const pedras = await lugar(0, 0, [3, 1]);
  if (!confere(!!pedras, 'há três casas livres e à vista para o calçamento')) return;
  for (let k = 0; k < 3; k++) { await levar(pedras[0] + k, pedras[1], 'toque'); if (!comDedo) await confirmar(false); }
  igual(((await modo()) || {}).postas, 3, 'três toques colocam três pedras de calçamento');
  await tocarEm('.cons-barra [data-k="cancelar"]');
  await ateParar();
  igual((await de('caminho-de-pedra')).length, 3, 'as três pedras ficam no mapa');
  confere(await J((q) => window.__jogo.mundo.local.andavel(q[0], q[1]), pedras), 'calçamento não bloqueia');
  await J(([x, z]) => window.__jogo.olhar(x, z), [fila4[0] + 2, fila4[1] + 1]);
  await foto('cerca-porteira-calcamento');

  // ---- o celeiro: um toque guarda o cesto; o botão "Entrar" leva para dentro
  await J(() => { const m = window.__jogo.mundo; m.posses.cesto.itens = { alface: 5 }; });
  const celeiro = (await de('celeiro'))[0];
  await tocarConstrucao(celeiro, 1.0);
  await ateParar();
  igual(await J(() => window.__jogo.estado().celeiro.alface), 5, 'um toque no celeiro continua guardando o cesto');
  igual(await J(() => window.__c.local()), 'fazenda', 'guardar o cesto não é entrar');
  await J(() => window.__jogo.seguir());
  await quadro(); await esperar(120);
  confere(await J(() => { const b = document.querySelector('.cons-porta'); return !!b && !b.hidden && /Entrar/.test(b.textContent); }), 'perto do celeiro aparece o botão "Entrar"');
  ruins = await J(() => window.__c.textoPequeno(document.querySelector('.cons-porta').parentNode).filter((t) => /cons-porta|Entrar/.test(t)));
  confere(ruins.length === 0, 'botão Entrar: ' + ruins.join('; '));
  await foto('celeiro-entrar');
  if (comDedo) await tocarEm('.cons-porta');
  else {
    // teclado e controle remoto: "voltar" abre o menu e o foco já cai no botão da porta
    await pg.keyboard.press('Escape');
    await esperar(200);
    igual(await J(() => document.activeElement && document.activeElement.dataset.k), 'porta-do-celeiro', 'com o menu aberto perto da porta, o foco cai no botão "Entrar"');
    await pg.keyboard.press('Enter');
  }
  await ateParar();
  igual(await J(() => window.__c.local()), 'celeiro', '"Entrar" leva a personagem para dentro do celeiro');
  await quadro(); await esperar(150);
  const dentro = await J(() => { const m = window.__jogo.mundo, loc = m.local, cam = window.__jogo.cena.cam; return { piso: loc.piso, limites: [...cam.limites], moveis: loc.entidades.map((e) => e.tipo).sort(), menu: document.body.classList.contains('menu') }; });
  confere(dentro.limites[2] === dentro.piso[0] + 0 || dentro.limites[2] >= dentro.piso[0], 'a câmera passa a valer para o celeiro por dentro');
  confere(['bau', 'prateleira-simples', 'suporte-de-ferramentas'].every((t) => dentro.moveis.includes(t)), 'lá dentro estão a prateleira, o baú e o suporte do começo');
  confere(!dentro.menu, 'depois de entrar, as setas voltam a andar com ela');
  await foto('celeiro-por-dentro');
  // andar lá dentro com o toque
  const antes = await J(() => window.__jogo.estado().personagem);
  await tocarCasa(1, 2);
  await ateParar();
  const depois = await J(() => window.__jogo.estado().personagem);
  confere(Math.hypot(depois.x - 1.5, depois.z - 2.5) < 0.8 && Math.hypot(depois.x - antes.x, depois.z - antes.z) > 1, 'lá dentro o toque no piso leva a personagem');

  // ---- montar outra prateleira lá dentro
  await J(() => window.__jogo.seguir());
  await abrirCatalogo();
  confere(await J(() => document.querySelector('.aba.ativo').dataset.k === 'aba-armazem'), 'lá dentro, o catálogo abre nos móveis do celeiro');
  await foto('catalogo-moveis');
  await tocarEm('[data-k="aba-abrigo"]');
  confere(await J(() => { const o = document.querySelector('.oferta[data-item="curral"]'); return !!o && /Só lá fora/.test(o.textContent) && o.querySelector('.bt').classList.contains('sem'); }), 'lá dentro, as construções da fazenda dizem que são lá fora');
  md = await escolher('armazem', 'prateleira-simples');
  alvo = await lugar(0);
  if (!confere(!!alvo, 'há lugar para a prateleira dentro do celeiro')) return;
  await levar(alvo[0], alvo[1], comDedo ? 'arrasto' : 'teclas');
  confere((await modo()).ok, 'o lugar da prateleira serve');
  await foto('prateleira-fantasma');
  await confirmar(!comDedo);
  await ateParar();
  let prats = await de('prateleira-simples');
  igual(prats.length, 2, 'a prateleira nova nasce (em obra) dentro do celeiro');
  confere(prats.some((e) => e.obra && e.local === 'celeiro'), 'ela começa em obra');
  igual(await J(() => window.__jogo.mundo.posses.celeiro.capacidade), 60, 'em obra, a prateleira ainda não guarda nada');
  await foto('prateleira-em-obra');
  await J(() => { window.__jogo.pular(31); window.__jogo.avancar(0.2); });
  igual(await J(() => window.__jogo.mundo.posses.celeiro.capacidade), 120, 'montada, o celeiro passa a guardar 120 produtos');
  await foto('prateleira-montada');

  // ---- a mochila mostra o celeiro por móvel
  await tocarEm('.topo-dir [data-painel="mochila"]');
  const moch = await J(() => document.querySelector('.veu').textContent);
  confere(/Produtos nas prateleiras\s*5\/120/.test(moch) && /Materiais nos baús\s*\d+\/300/.test(moch) && /Ferramentas no suporte/.test(moch), 'a mochila mostra produtos, materiais e ferramentas, cada um com a sua ocupação');
  ruins = await J(() => window.__c.textoPequeno(document.querySelector('.veu')));
  confere(ruins.length === 0, 'mochila: ' + ruins.slice(0, 4).join('; '));
  await foto('mochila');
  await fecharPainel();

  // ---- sair: o botão "Sair" (dedo) ou andar até a soleira (teclas)
  if (comDedo) { await J(() => window.__jogo.seguir()); await quadro(); await esperar(120); confere(await J(() => { const b = document.querySelector('.cons-porta'); return !!b && !b.hidden && /Sair/.test(b.textContent); }), 'lá dentro o botão da porta vira "Sair"'); await tocarEm('.cons-porta'); await ateParar(); }
  else {
    const en = await J(() => window.__jogo.mundo.local.entrada);
    await tocarCasa(Math.floor(en[0]), Math.floor(en[1]));
    await ateParar();
    await pg.keyboard.down('ArrowDown'); await pg.keyboard.down('ArrowLeft');
    await J(() => window.__jogo.avancar(1.5));
    await pg.keyboard.up('ArrowDown'); await pg.keyboard.up('ArrowLeft');
  }
  igual(await J(() => window.__c.local()), 'fazenda', comDedo ? '"Sair" leva de volta para a fazenda' : 'andar com as setas até a soleira sai do celeiro');
  const fora = await J(() => { const p = window.__jogo.estado().personagem, q = window.__c.porta(), cam = window.__jogo.cena.cam; return { d: Math.hypot(p.x - q[0], p.z - q[1]), l: cam.limites[2] }; });
  confere(fora.d < 1.6, 'ela sai na frente da porta do celeiro');
  confere(fora.l > 30, 'a câmera volta a valer para a fazenda');
  await foto('saiu-do-celeiro');

  // ---- celeiro cheio: o aviso mostra a saída
  await J(() => { const m = window.__jogo.mundo; m.posses.celeiro.itens = { alface: 120 }; m.posses.cesto.itens = { alface: 3 }; });
  await tocarConstrucao(celeiro, 1.0);
  await ateParar();
  await esperar(150);
  confere(await J(() => window.__jogo.avisos().some((t) => /prateleira/i.test(t))), 'celeiro cheio: o aviso diz para vender ou montar outra prateleira');
  await foto('celeiro-cheio');
  await J(() => { const m = window.__jogo.mundo; m.posses.celeiro.itens = { alface: 70 }; m.posses.cesto.itens = {}; });

  // ---- a loja leva ao catálogo
  await tocarEm('.topo-dir [data-painel="loja"]');
  await tocarEm('[data-k="aba-construir"]');
  igual(await painel(), 'construir', 'a aba "Construir" da loja abre o catálogo');
  await fecharPainel();

  // ---- gravar e recarregar: tudo no lugar, e abrir dentro do celeiro também funciona
  await J(() => window.__jogo.gravar());
  const resumo = () => J(() => { const m = window.__jogo.mundo, c = window.__c; return JSON.stringify({ banc: c.de('bancada-de-carpintaria'), gal: c.de('galinheiro'), cercas: c.de('cerca-de-madeira').length, port: c.de('porteira'), pedras: c.de('caminho-de-pedra').length, prats: c.de('prateleira-simples').length, cap: m.posses.celeiro.capacidade, ouro: m.posses.ouro }); });
  const gravado = await resumo();
  await pg.reload();
  await pronto(pg);
  igual(await resumo(), gravado, 'recarregar traz as construções, a prateleira e o ouro');
  await J(() => window.__jogo.comando({ tipo: 'entrar', jaJa: true }));
  await J(() => window.__jogo.gravar());
  await pg.reload();
  await pronto(pg);
  igual(await J(() => window.__c.local()), 'celeiro', 'a gravação feita dentro do celeiro abre lá dentro');
  await J(() => window.__jogo.seguir());
  await foto('abriu-dentro-do-celeiro');
  await J(() => window.__jogo.comando({ tipo: 'sair', jaJa: true }));
  await J(() => window.__jogo.seguir());
  await foto('fazenda-construida');
  confere(a.erros.length === 0, `${f}: erro no console: ${a.erros.slice(0, 3).join(' | ')}`);
}

try {
  console.log('1280x720, mouse e teclado');
  let a = await abrir(1280, 720);
  await cenario(a, 'a-pc');
  await a.ctx.close();

  console.log('844x390, celular deitado, toque');
  a = await abrir(844, 390, { toque: true, dpr: 2 });
  await cenario(a, 'a-cel');
  await a.ctx.close();
} catch (err) {
  falhas.push('a verificação parou: ' + (err && err.stack ? err.stack.split('\n').slice(0, 4).join(' ') : err));
  console.log('  ✗ ' + falhas[falhas.length - 1]);
}

await nav.close();
await srv.fechar();
console.log(`\n${feitos} conferências, ${falhas.length} falha(s). Capturas em ${path.relative(process.cwd(), capturas) || '.'}/`);
if (falhas.length) { console.log('\nFalhas:\n' + falhas.map((f) => ' - ' + f).join('\n')); process.exit(1); }
console.log('Tudo certo.');
