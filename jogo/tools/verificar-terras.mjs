// Confere a frente das terras no jogo montado, num Chromium sem janela, com cliques, toques e teclas de verdade:
// comprar ferramentas na loja e limpar mato, toco e pedra; comprar um lote pela placa (com a pergunta na página),
// andar nele, plantar uma bananeira, avançar o relógio e colher; regar com o regador de área; gastar e consertar
// uma ferramenta. Em 1280x720 (mouse e teclado) e em 844x390 (celular deitado, dedo). O ouro e o nível vêm do
// gancho de teste (window.__jogo.mundo). Termina com "Tudo certo." ou com a lista das falhas.
//   JOGO_DIST=dist-x JOGO_CAPTURAS=capturas-x node tools/verificar-terras.mjs     (monte antes: npm run build)
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
    const j = window.__jogo, V = [[1, 0], [-1, 0], [0, 1], [0, -1]], NATUREZA = { mato: 1, toco: 1, pedra: 1, mata: 1 };
    window.__t = {
      // o toque no meio da casa (x, z) chega nela? (a figura de uma construção na frente, ou uma etiqueta, tapam)
      visivel(x, z) {
        const m = j.mundo, cam = j.cena.cam;
        j.olhar(x + 0.5, z + 0.5);
        const id = j.cena.entidadeEm(m, cam.cssX(x + 0.5, z + 0.5), cam.cssY(x + 0.5, 0, z + 0.5)), o = id ? m.local.porId[id] : null;
        return !o || o === m.local.entidadeEm(x, z) || !!NATUREZA[o.tipo];
      },
      // obstáculos de um tipo em terra própria, à vista e com um lado aonde ela chega, do mais perto da personagem ao mais longe
      obst(tipo, soCom) {
        const m = j.mundo, loc = m.local, p = m.personagem, al = this.alcance();
        return loc.entidades.filter((e) => e.tipo === tipo && loc.ehPropria(e.x, e.z) && V.some(([dx, dz]) => loc.dentro(e.x + dx, e.z + dz) && al[loc.i(e.x + dx, e.z + dz)]) && (!soCom || V.some(([dx, dz]) => { const o = loc.entidadeEm(e.x + dx, e.z + dz); return o && o.tipo === tipo; })))
          .sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z)).filter((e) => this.visivel(e.x, e.z)).map((e) => ({ id: e.id, x: e.x, z: e.z }));
      },
      quantos(tipo) { const loc = j.mundo.local; return loc.entidades.filter((e) => e.tipo === tipo && loc.ehPropria(e.x, e.z)).length; },
      tem(id) { return !!j.mundo.local.porId[id]; },
      ent(id) { const e = j.mundo.local.porId[id]; return e ? { x: e.x, z: e.z, tipo: e.tipo, dano: e.dano || 0 } : null; },
      planta(x, z) { const e = j.estado().plantas.find((p) => p.x === x && p.z === z); return e ? e.estado : null; },
      arvores() { return j.mundo.arvores.todas.map((e) => ({ id: e.id, x: e.x, z: e.z, arvore: e.arvore })); },
      // as casas aonde a personagem chega andando (pelos quatro lados)
      alcance() {
        const loc = j.mundo.local, p = j.mundo.personagem, visto = new Uint8Array(loc.l * loc.p), fila = [[Math.floor(p.x), Math.floor(p.z)]];
        visto[loc.i(fila[0][0], fila[0][1])] = 1;
        for (let k = 0; k < fila.length; k++) for (const [dx, dz] of V) { const x = fila[k][0] + dx, z = fila[k][1] + dz; if (loc.andavel(x, z) && !visto[loc.i(x, z)]) { visto[loc.i(x, z)] = 1; fila.push([x, z]); } }
        return visto;
      },
      // uma casa de grama livre e à vista do retângulo, a mais perto de (x, z), aonde a personagem chega; com
      // "folga", sem nada nas quatro casas vizinhas (para a árvore plantada ali não fechar a passagem)
      livre(a, x, z, folga) {
        const loc = j.mundo.local, todas = [], al = this.alcance();
        for (let cz = a[1]; cz < a[3]; cz++) for (let cx = a[0]; cx < a[2]; cx++) {
          if (al[loc.i(cx, cz)] && loc.ehPropria(cx, cz) && loc.chao[loc.i(cx, cz)] === 0 && !loc.plantas[loc.i(cx, cz)] && (!folga || V.every(([dx, dz]) => loc.andavel(cx + dx, cz + dz)))) todas.push([cx, cz]);
        }
        todas.sort((p, q) => Math.hypot(p[0] - x, p[1] - z) - Math.hypot(q[0] - x, q[1] - z));
        return todas.find((c) => this.visivel(c[0], c[1])) || null;
      },
      // mato, toco ou pedra do retângulo, à vista: com "fechado", um que ela ainda não alcança (longe de onde chega);
      // sem, o que está na beirada do que ela alcança, mais perto de (x, z)
      doLote(a, x, z, fechado) {
        const loc = j.mundo.local, al = this.alcance();
        const perto = (e, r) => { for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (loc.dentro(e.x + dx, e.z + dz) && al[loc.i(e.x + dx, e.z + dz)]) return true; return false; };
        const todos = loc.entidades.filter((e) => (e.tipo === 'mato' || e.tipo === 'toco' || e.tipo === 'pedra') && e.x >= a[0] && e.x < a[2] && e.z >= a[1] && e.z < a[3] && loc.ehPropria(e.x, e.z)
          && (fechado ? !perto(e, 2) : V.some(([dx, dz]) => loc.dentro(e.x + dx, e.z + dz) && al[loc.i(e.x + dx, e.z + dz)])));
        todos.sort((p, q) => Math.hypot(p.x - x, p.z - z) - Math.hypot(q.x - x, q.z - z));
        const e = todos.find((o) => this.visivel(o.x, o.z));
        return e ? { id: e.id, x: e.x, z: e.z, tipo: e.tipo } : null;
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

// o cenário inteiro, com o ponteiro da vez (mouse ou dedo); "f" = prefixo das fotos
async function cenario(a, f) {
  const { pg, cdp } = a, comDedo = !!cdp;
  const J = (fn, arg) => pg.evaluate(fn, arg);
  const tocarXY = async (x, y) => { if (comDedo) await dedo(cdp, [[x, y]]); else await pg.mouse.click(x, y); await esperar(50); };
  const foto = async (nome) => { await J(() => window.__jogo.desenhar()); await esperar(350); await pg.screenshot({ path: path.join(capturas, `${f}-${nome}.jpg`), type: 'jpeg', quality: 84 }); };
  const ateParar = async () => { const s = await J(() => window.__jogo.ateParar(400)); if (s < 0) confere(false, 'a personagem não parou em 400 s'); await J(() => window.__jogo.desenhar()); return s; };
  const mundo = (fn, arg) => J(fn, arg);
  // toca num elemento da interface (rola o painel até ele aparecer)
  async function tocarEm(seletor, obrigatorio = true) {
    const r = await J((s) => { const e = document.querySelector(s); if (!e || e.hidden) return null; e.scrollIntoView({ block: 'center', inline: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, seletor);
    if (!r) { if (obrigatorio) confere(false, `não achei "${seletor}" na tela`); return false; }
    await esperar(60);
    const r2 = await J((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, seletor);
    await tocarXY(r2.x, r2.y);
    return true;
  }
  // toca numa casa ou numa entidade do mundo, com a câmera olhando para lá; confere que o toque cai no canvas
  async function pontoDoMundo(x, z, alto = 0) {
    await J(([x, z]) => window.__jogo.olhar(x, z), [x, z]);
    const p = await J(([x, z, alto]) => { const p = window.__jogo.naTela(x, z, alto); const e = document.elementFromPoint(p.x, p.y); return { ...p, livre: !!e && e.id === 'tela', quem: e ? e.className || e.id : 'nada' }; }, [x, z, alto]);
    confere(p.livre, `(${x}, ${z}) devia estar livre para o toque, mas há "${p.quem}" por cima`);
    return p;
  }
  const tocarCasa = async (x, z) => { const p = await pontoDoMundo(x + 0.5, z + 0.5); await tocarXY(p.x, p.y); };
  const tocarEntidade = async (id, alto = 0.5) => { const e = await J((id) => window.__t.ent(id), id); if (!e) { confere(false, `não há "${id}" no mapa`); return; } const p = await pontoDoMundo(e.x + 0.5, e.z + 0.5, alto); await tocarXY(p.x, p.y); };
  const fecharPainel = async () => { if (comDedo) await tocarEm('.veu .fechar'); else await pg.keyboard.press('Escape'); await esperar(80); };
  async function comprar(aba, item) {
    if ((await J(() => window.__jogo.painelAberto())) !== 'loja') await tocarEm('.topo-dir [data-painel="loja"]');
    await tocarEm(`[data-k="aba-${aba}"]`);
    const antes = await J(() => window.__jogo.mundo.posses.ouro);
    await tocarEm(`.oferta[data-item="${item}"] [data-k="c1-${item}"]`);
    confere((await J(() => window.__jogo.mundo.posses.ouro)) < antes, `a loja vende "${item}" com um toque`);
  }

  // ---- começo: ouro e nível pelo gancho de teste
  await mundo(() => { const m = window.__jogo.mundo; m.posses.ouro = 60000; m.progresso.nivel = 12; m.progresso.xp = m.dados.niveis.limiar[12] + 100; });
  igual(await J(() => !!document.querySelector('.modo[data-modo="limpar"]') && document.querySelector('.modo[data-modo="limpar"]').hidden), true, 'sem ferramenta de limpar, o botão "Limpar" não aparece');

  // ---- comprar a foice e roçar: um toque no mato faz a cadeia (busca a foice no celeiro, vai e roça)
  await comprar('ferramentas', 'foice-de-ferro');
  await foto('loja-ferramentas');
  await fecharPainel();
  igual(await J(() => document.querySelector('.modo[data-modo="limpar"]').hidden), false, 'com a foice, o botão "Limpar" aparece');
  let matos = await J(() => window.__t.obst('mato', true));
  confere(matos.length > 0, 'há mato com vizinho de mato em terra própria');
  const nMato = await J(() => window.__t.quantos('mato'));
  await tocarCasa(matos[0].x, matos[0].z);
  confere(await J(() => window.__jogo.estado().personagem.fila >= 1 || window.__jogo.ocupada()), 'o toque no mato (modo mão) enfileira a limpeza');
  await ateParar();
  confere(!(await J((id) => window.__t.tem(id), matos[0].id)), 'o mato tocado saiu');
  confere((await J(() => window.__t.quantos('mato'))) <= nMato - 2, 'a foice de ferro leva o mato vizinho na mesma passada');
  igual(await J(() => window.__jogo.estado().noCesto), 0, 'a fibra não ocupa o cesto da colheita');
  igual(await J(() => window.__jogo.estado().ferramentas['foice-de-ferro'].onde), 'cinto', 'ela buscou a foice no suporte do celeiro');

  // ---- modo limpar: arrastar pinta vários de uma vez
  await tocarEm('.modo[data-modo="limpar"]');
  igual(await J(() => window.__jogo.estado().modo.id), 'limpar', 'o botão escolhe o modo limpar');
  matos = await J(() => window.__t.obst('mato'));
  const fileira = matos.filter((e) => e.z === matos[0].z && Math.abs(e.x - matos[0].x) <= 3).sort((p, q) => p.x - q.x);
  const alvos = fileira.length >= 2 ? fileira : matos.slice(0, 2);
  await J(([x, z]) => window.__jogo.olhar(x, z), [alvos[0].x + 0.5, alvos[0].z + 0.5]);
  const pts = [];
  for (const e of alvos) { const p = await J(([x, z]) => window.__jogo.naTela(x + 0.5, z + 0.5), [e.x, e.z]); pts.push([p.x, p.y]); }
  if (comDedo) await dedo(cdp, [pts[0], ...pts.flatMap((p, i) => (i ? [[(pts[i - 1][0] + p[0]) / 2, (pts[i - 1][1] + p[1]) / 2], p] : [])), pts[pts.length - 1]]);
  else { await pg.mouse.move(pts[0][0], pts[0][1]); await pg.mouse.down(); for (const p of pts) await pg.mouse.move(p[0], p[1], { steps: 6 }); await pg.mouse.up(); }
  await esperar(80);
  confere(await J(() => window.__jogo.estado().personagem.fila >= 1 || window.__jogo.ocupada()), 'arrastar no modo limpar enfileira a limpeza');
  await foto('limpar-arrastando');
  await ateParar();
  confere((await J((ids) => ids.filter((id) => window.__t.tem(id)).length, alvos.map((e) => e.id))) === 0, 'todo o mato pintado saiu');

  // ---- machado e picareta: toco e pedra pedem mais de um golpe, num toque só
  await comprar('ferramentas', 'machado-de-ferro');
  await comprar('ferramentas', 'picareta-de-ferro');
  await fecharPainel();
  await tocarEm('.modo[data-modo="mao"]');
  const toco = (await J(() => window.__t.obst('toco')))[0], pedra = (await J(() => window.__t.obst('pedra')))[0];
  if (!confere(!!toco && !!pedra, 'há toco e pedra à vista em terra própria')) return;
  await tocarCasa(toco.x, toco.z);
  // para no meio dos golpes, para a foto da barra
  await J((id) => { const j = window.__jogo; for (let k = 0; k < 6000 && !(window.__t.ent(id) && window.__t.ent(id).dano > 0); k++) j.mundo.passo(); for (let k = 0; k < 20; k++) j.mundo.passo(); }, toco.id);
  confere(((await J((id) => window.__t.ent(id), toco.id)) || {}).dano > 0, 'o primeiro golpe não derruba o toco (ele pede mais de um)');
  await foto('toco-golpes');
  await ateParar();
  confere(!(await J((id) => window.__t.tem(id), toco.id)), 'o toco saiu com um toque só');
  await tocarCasa(pedra.x, pedra.z);
  await ateParar();
  confere(!(await J((id) => window.__t.tem(id), pedra.id)), 'a pedra saiu');
  let e = await J(() => window.__jogo.estado());
  confere(e.bolsa.madeira >= 2 && e.bolsa.pedra >= 2, 'madeira e pedra foram para a bolsa');
  igual(e.noCesto, 0, 'material não trava o cesto');

  // ---- comprar o lote pela placa
  const placa = await J(() => window.__t.ent('placa-lote-1'));
  if (!confere(!!placa, 'o lote 1 tem placa no mapa')) return;
  confere(await J(([x, z]) => window.__t.visivel(x, z), [placa.x, placa.z]), 'a placa do lote 1 não nasce escondida atrás de uma construção');
  await J(([x, z]) => window.__jogo.olhar(x, z), [placa.x - 1.5, placa.z + 3.5]);
  await foto('lotes-no-mapa');
  await tocarEntidade('placa-lote-1', 0.6);
  igual(await J(() => window.__jogo.painelAberto()), 'terras', 'o toque na placa abre o painel das terras');
  // a etiqueta do preço, em cima da placa, também recebe o toque
  await fecharPainel();
  igual(await J(() => window.__jogo.painelAberto()), null, 'o painel das terras fecha');
  await tocarEntidade('placa-lote-1', 1.95);
  igual(await J(() => window.__jogo.painelAberto()), 'terras', 'o toque na etiqueta do preço também abre o painel das terras');
  confere(await J(() => { const c = document.querySelector('.oferta.lote'); return !!c && c.dataset.lote === 'lote-1' && /800/.test(c.textContent); }), 'o lote da placa vem primeiro, com o preço');
  confere(await J(() => !!document.querySelector('.oferta.lote.exige, .oferta.lote.nivel')), 'os lotes que ainda não dá para comprar aparecem travados');
  await foto('painel-terras');
  if (!comDedo) {
    // teclado: as setas andam pelos botões e o Esc fecha
    await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('ArrowRight');
    confere(await J(() => document.activeElement && document.activeElement.tagName === 'BUTTON' && !!document.activeElement.closest('.veu')), 'as setas andam pelos botões do painel das terras');
    await pg.keyboard.press('Escape');
    igual(await J(() => window.__jogo.painelAberto()), null, 'Esc fecha o painel das terras');
    await tocarEntidade('placa-lote-1', 0.6);
  }
  const ouroAntes = await J(() => window.__jogo.mundo.posses.ouro);
  await tocarEm('[data-k="lote-lote-1"]');
  confere(await J(() => !!document.querySelector('.dialogo')), 'a compra pergunta antes, na própria página');
  igual(await J(() => window.__jogo.mundo.posses.ouro), ouroAntes, 'antes do sim, nada foi gasto');
  await foto('pergunta-do-lote');
  await tocarEm('.dialogo [data-k="sim"]');
  await esperar(120);
  e = await J(() => { const m = window.__jogo.mundo; return { lotes: [...m.terras.lotes], ouro: m.posses.ouro, placa: window.__t.tem('placa-lote-1'), propria: m.local.ehPropria(30, 35), painel: window.__jogo.painelAberto(), avisos: window.__jogo.avisos() }; });
  confere(e.lotes.includes('lote-1'), 'o lote 1 foi comprado');
  igual(e.ouro, ouroAntes - 800, 'o preço do lote saiu do ouro');
  igual(e.placa, false, 'a placa some');
  igual(e.propria, true, 'a terra do lote passou a ser própria');
  igual(e.painel, null, 'o painel sai da frente para a festa');
  confere(e.avisos.some((t) => /Pasto do Fundo/.test(t)), 'o aviso comemora a terra nova');
  await J(() => { const j = window.__jogo; j.olhar(32, 39); });
  await foto('lote-comprado');

  // ---- o lote vem tomado de mato: o que está fechado explica o que fazer; limpa-se da beirada para dentro
  const LOTE = [24, 30, 40, 44], ABRIR = [31, 37, 40, 44];
  const fundo = await J((a) => window.__t.doLote(a, 30, 34, true), LOTE);
  if (confere(!!fundo, 'no lote recém-comprado há mato fechado por outros obstáculos')) {
    await tocarCasa(fundo.x, fundo.z);
    await ateParar();
    confere(await J(() => window.__jogo.avisos().some((t) => /limpe antes/i.test(t))), 'o toque no que está fechado diz para limpar antes o caminho');
    confere(await J((id) => window.__t.tem(id), fundo.id), 'o que está fechado fica onde está');
  }
  let abertos = 0;
  for (let k = 0; k < 14; k++) {
    const o = await J((a) => window.__t.doLote(a, 35, 40), ABRIR);
    if (!o) break;
    await tocarCasa(o.x, o.z);
    await ateParar();
    if (!(await J((id) => window.__t.tem(id), o.id))) abertos++;
  }
  confere(abertos >= 4, `da beirada para dentro, o lote vai abrindo (saíram ${abertos} obstáculos)`);
  await J(() => window.__jogo.olhar(35, 40));
  await foto('lote-abrindo');

  // ---- andar no lote novo
  const casa = await J((a) => window.__t.livre(a, 34, 39), ABRIR);
  if (!confere(!!casa, 'há casa livre e à vista no lote novo')) return;
  await tocarCasa(casa[0], casa[1]);
  await ateParar();
  e = await J(() => window.__jogo.estado().personagem);
  confere(Math.hypot(e.x - casa[0] - 0.5, e.z - casa[1] - 0.5) < 0.6, 'ela anda até o lote novo');

  // ---- plantar uma bananeira no lote, avançar o relógio e colher
  await comprar('sementes', 'muda-bananeira');
  await fecharPainel();
  await tocarEm('.modo[data-modo="semear"]');
  await tocarEm('.semente[data-semente="muda-bananeira"]');
  igual(await J(() => window.__jogo.estado().modo.semente), 'muda-bananeira', 'a muda aparece na barra de sementes e pode ser escolhida');
  const lugar = await J((a) => window.__t.livre(a, 35, 40, true), ABRIR);
  if (!confere(!!lugar, 'há lugar para a bananeira no lote novo')) return;
  await J(([x, z]) => window.__jogo.olhar(x, z), [lugar[0] + 0.5, lugar[1] + 0.5]);
  await esperar(400);
  await foto('muda-casas-permitidas');
  await tocarCasa(lugar[0], lugar[1]);
  await ateParar();
  let arvores = await J(() => window.__t.arvores());
  if (!igual(arvores.length, 1, 'a bananeira foi plantada')) return;
  confere(arvores[0].x === lugar[0] && arvores[0].z === lugar[1], 'na casa tocada');
  igual(await J(() => window.__jogo.estado().bolsa['muda-bananeira'] || 0), 0, 'a muda saiu da bolsa');
  await tocarEm('.modo[data-modo="mao"]');
  await tocarEntidade(arvores[0].id, 0.4);
  confere(await J(() => window.__jogo.avisos().some((t) => /crescendo/i.test(t))), 'o toque na muda diz quanto falta');
  await J(() => { window.__jogo.pular(4 * 3600 + 2 * 3600 + 60); window.__jogo.avancar(1.2); });
  await esperar(250); // (o aviso junta as árvores que deram fruta ao mesmo tempo antes de sair)
  confere(await J(() => window.__jogo.avisos().some((t) => /fruta/i.test(t))), 'na volta, o jogo avisa que a árvore deu fruta');
  await J(([x, z]) => window.__jogo.olhar(x, z), [lugar[0] + 0.5, lugar[1] - 0.5]);
  await foto('arvore-com-fruta');
  await tocarEntidade(arvores[0].id, 1.2);
  await ateParar();
  igual((await J(() => window.__jogo.estado().cesto)).banana, 3, 'a colheita da bananeira foi para o cesto');
  igual((await J(() => window.__t.arvores())).length, 1, 'a árvore continua lá para a próxima safra');

  // ---- regador de área: comprar os degraus até o de crivo; uma rega molha três casas em linha
  // (o regador velho ficou no suporte enquanto ela limpava: um toque no poço traz ele de volta ao cinto)
  await tocarEm('.modo[data-modo="mao"]');
  await tocarEntidade('poco', 0.7);
  await ateParar();
  igual(await J(() => window.__jogo.estado().ferramentas['regador-velho'].onde), 'cinto', 'para encher, ela busca o regador no suporte sozinha');
  for (const id of ['regador-de-lata', 'regador-grande', 'regador-de-crivo']) await comprar('ferramentas', id);
  await fecharPainel();
  confere(await J(() => window.__jogo.avisos().some((t) => /suporte/i.test(t))), 'a troca de ferramenta é avisada (a velha vai para o suporte)');
  igual(await J(() => window.__jogo.estado().ferramentas['regador-de-crivo'].onde), 'cinto', 'o regador novo toma o lugar do velho no cinto');
  const CAMPO = [[26, 51], [27, 51], [28, 51]];
  await tocarEm('.modo[data-modo="enxada"]');
  for (const [x, z] of CAMPO) await tocarCasa(x, z);
  await ateParar();
  await tocarEm('.modo[data-modo="semear"]');
  await tocarEm('.semente[data-semente="semente-alface"]');
  for (const [x, z] of CAMPO) await tocarCasa(x, z);
  await ateParar();
  await tocarEm('.modo[data-modo="mao"]');
  await tocarEntidade('poco', 0.7);
  await ateParar();
  const agua = await J(() => window.__jogo.estado().ferramentas['regador-de-crivo'].agua);
  igual(agua, 16, 'o regador de crivo enche no poço');
  await tocarEm('.modo[data-modo="regar"]');
  if (!comDedo) {
    const p = await pontoDoMundo(27.5, 51.5);
    await pg.mouse.move(p.x, p.y, { steps: 3 });
    await esperar(450);
    igual(await J(() => (window.__jogo.cena.destaque.casas || []).length), 3, 'antes do toque, as três casas que a rega alcança ficam marcadas');
    confere(await J(() => /3 casas/.test(document.querySelector('.dica').textContent)), 'a dica diz que a rega molha 3 casas');
    await foto('rega-de-area');
  }
  await tocarCasa(27, 51);
  await ateParar();
  igual(await J(() => window.__jogo.estado().ferramentas['regador-de-crivo'].agua), agua - 1, 'três casas, uma rega só');
  igual(JSON.stringify(await J((c) => c.map(([x, z]) => window.__t.planta(x, z)), CAMPO)), JSON.stringify(['crescendo', 'crescendo', 'crescendo']), 'as três casas ficaram regadas');

  // ---- desgaste e conserto: perto do fim avisa, gasta rende menos (não quebra), e o conserto é um toque
  igual(await J(() => document.querySelector('.chip.conserto').hidden), true, 'sem ferramenta gasta, o aviso de conserto não aparece');
  await mundo(() => { const m = window.__jogo.mundo; m.posses.ferramentas['foice-de-ferro'].usos = m.dados.itens['foice-de-ferro'].usos - 2; });
  await tocarEm('.modo[data-modo="mao"]');
  for (let k = 0; k < 2; k++) {
    const mt = (await J(() => window.__t.obst('mato')))[0];
    if (!mt) { confere(false, 'faltou mato para gastar a foice'); break; }
    await tocarCasa(mt.x, mt.z);
    await ateParar();
    if (k === 0) confere(await J(() => window.__jogo.avisos().some((t) => /quase gasta/i.test(t))), 'antes de gastar, o jogo avisa');
  }
  await esperar(1200);
  confere(await J(() => { const c = document.querySelector('.chip.conserto'); return !c.hidden && c.classList.contains('gasta'); }), 'com a foice gasta, o aviso de conserto aparece no alto da tela');
  confere(await J(() => window.__jogo.avisos().some((t) => /gasta/i.test(t))), 'o jogo diz que a ferramenta ficou gasta');
  // gasta, ela ainda trabalha
  const outro = (await J(() => window.__t.obst('mato')))[0];
  if (outro) { await tocarCasa(outro.x, outro.z); await ateParar(); confere(!(await J((id) => window.__t.tem(id), outro.id)), 'gasta, a foice ainda roça (não quebra)'); }
  await J(() => window.__jogo.seguir());
  await foto('aviso-de-conserto');
  await tocarEm('.chip.conserto');
  igual(await J(() => window.__jogo.painelAberto()), 'ferramentas', 'o aviso abre o painel das ferramentas');
  await foto('painel-ferramentas');
  const antesDoConserto = await J(() => window.__jogo.mundo.posses.ouro);
  await tocarEm('[data-k="conserto-foice-de-ferro"]');
  igual(await J(() => window.__jogo.mundo.posses.ouro), antesDoConserto - 150, 'o conserto custa o ouro dos dados');
  confere(await J(() => !document.querySelector('[data-k="conserto-foice-de-ferro"]')), 'consertada, o botão de conserto some');
  // nada pequeno demais nos painéis desta frente
  const pequenos = await J(() => {
    const ruins = [];
    for (const n of document.querySelectorAll('.veu *')) {
      if (n.closest('[hidden]') || !n.offsetParent) continue;
      const temTexto = [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
      if (temTexto && parseFloat(getComputedStyle(n).fontSize) < 14) ruins.push(`texto de ${getComputedStyle(n).fontSize} em "${n.textContent.trim().slice(0, 20)}"`);
      if (n.tagName === 'BUTTON') { const r = n.getBoundingClientRect(); if (r.width < 44 || r.height < 44) ruins.push(`botão de ${Math.round(r.width)}x${Math.round(r.height)} (${n.className})`); }
    }
    const c = document.querySelector('.veu .cartao').getBoundingClientRect();
    if (c.left < 0 || c.top < 0 || c.right > innerWidth || c.bottom > innerHeight) ruins.push('o painel não cabe na tela');
    return ruins;
  });
  confere(pequenos.length === 0, 'painel das ferramentas: ' + pequenos.slice(0, 4).join('; '));
  await fecharPainel();
  await esperar(1200);
  igual(await J(() => document.querySelector('.chip.conserto').hidden), true, 'consertada, o aviso some');

  // ---- a aba "Terras" da loja leva ao painel dos lotes; gravar e recarregar traz tudo de volta
  await tocarEm('.topo-dir [data-painel="loja"]');
  await tocarEm('[data-k="aba-terras"]');
  igual(await J(() => window.__jogo.painelAberto()), 'terras', 'a aba "Terras" da loja abre o painel dos lotes');
  confere(await J(() => !!document.querySelector('.oferta.lote.comprado')), 'o lote comprado aparece como seu');
  const medidas = await J(() => {
    const ruins = [];
    for (const n of document.querySelectorAll('.veu *')) {
      if (n.closest('[hidden]') || !n.offsetParent) continue;
      const temTexto = [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
      if (temTexto && parseFloat(getComputedStyle(n).fontSize) < 14) ruins.push(`texto de ${getComputedStyle(n).fontSize} em "${n.textContent.trim().slice(0, 20)}"`);
      if (n.tagName === 'BUTTON') { const r = n.getBoundingClientRect(); if (r.width < 44 || r.height < 44) ruins.push(`botão de ${Math.round(r.width)}x${Math.round(r.height)} (${n.className})`); }
    }
    return ruins;
  });
  confere(medidas.length === 0, 'painel das terras: ' + medidas.slice(0, 4).join('; '));
  await fecharPainel();
  await J(() => window.__jogo.gravar());
  const gravado = await J(() => { const m = window.__jogo.mundo; return { lotes: m.terras.lotes.length, limpos: m.terras.limpos.length, arvores: m.arvores.todas.length, ouro: m.posses.ouro, matos: window.__t.quantos('mato') }; });
  await pg.reload();
  await pronto(pg);
  const voltou = await J(() => { const m = window.__jogo.mundo; return { lotes: m.terras.lotes.length, limpos: m.terras.limpos.length, arvores: m.arvores.todas.length, ouro: m.posses.ouro, matos: window.__t.quantos('mato'), placa: window.__t.tem('placa-lote-1'), propria: m.local.ehPropria(30, 35), gasta: !document.querySelector('.chip.conserto') || document.querySelector('.chip.conserto').hidden }; });
  igual(JSON.stringify({ ...voltou, placa: undefined, propria: undefined, gasta: undefined }), JSON.stringify(gravado), 'recarregar traz o lote, a terra limpa, a árvore e o ouro');
  confere(!voltou.placa && voltou.propria, 'recarregado, o lote continua comprado e sem placa');
  confere(a.erros.length === 0, `${f}: erro no console: ${a.erros.slice(0, 3).join(' | ')}`);
}

try {
  console.log('1280x720, mouse e teclado');
  let a = await abrir(1280, 720);
  await cenario(a, 'e-pc');
  await a.ctx.close();

  console.log('844x390, celular deitado, toque');
  a = await abrir(844, 390, { toque: true, dpr: 2 });
  await cenario(a, 'e-cel');
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
