// Confere a frente de progresso no jogo montado, num Chromium sem janela, com cliques, toques e teclas de verdade:
// a caixa de correio e o presente do dia (com o relógio avançando para os dias seguintes), uma conquista ganha
// jogando e recebida, o convite copiado e aberto numa fazenda nova (#convite-...), a foto da fazenda, a compra
// simulada de cash, uma roupa comprada e vestida, um relógio concluído com cash, o caderno do vizinho e o nome da
// fazenda. Em 1280x720 (mouse e teclado) e 844x390 (celular deitado, toque). Confere também que não há erro no
// console. Grava as capturas d-*.jpg e termina com "Tudo certo." ou com a lista das falhas.
//   JOGO_DIST=dist-d JOGO_CAPTURAS=capturas-d node tools/verificar-progresso.mjs      (monte antes: npm run build)
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
const DIA = 86400;

async function abrir(w, h, opc = {}) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: opc.dpr || 1, hasTouch: !!opc.toque, isMobile: !!opc.toque });
  try { await ctx.grantPermissions(['clipboard-read', 'clipboard-write']); } catch { /* navegador sem essa permissão */ }
  const pg = await ctx.newPage();
  const erros = [];
  pg.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  pg.on('pageerror', (e) => erros.push('exceção: ' + e.message));
  await pg.goto(srv.url + (opc.endereco || '#teste'));
  await pronto(pg);
  return { ctx, pg, erros, w, h };
}
async function pronto(pg) {
  await pg.waitForFunction(() => window.__jogo && window.__jogo.pronto !== undefined, null, { timeout: 20000 });
  const ok = await pg.evaluate(() => window.__jogo.pronto);
  if (!ok) throw new Error('o jogo não começou: ' + (await pg.evaluate(() => document.querySelector('.erro') && document.querySelector('.erro').textContent)));
  await pg.evaluate(() => window.__jogo.baixarArte());
  await pg.waitForFunction(() => window.__jogo.arteBaixada(), null, { timeout: 20000 });
  await pg.waitForFunction(() => !!window.__jogo.progresso, null, { timeout: 5000 });
  await pg.evaluate(() => window.__jogo.desenhar());
  await esperar(250);
}
const J = (pg, f, arg) => pg.evaluate(f, arg);
const estado = (pg) => pg.evaluate(() => window.__jogo.estado());
const desenhar = async (pg) => { await pg.evaluate(() => window.__jogo.desenhar()); await esperar(90); };
const foto = async (pg, nome, espera = 350) => { await pg.evaluate(() => window.__jogo.desenhar()); await esperar(espera); await pg.screenshot({ path: path.join(capturas, nome), type: 'jpeg', quality: 84 }); };
const semErros = (a, onde) => confere(a.erros.length === 0, `${onde}: erro no console: ${a.erros.slice(0, 3).join(' | ')}`);

// centro de um elemento da interface, na janela (rola o painel até ele aparecer)
async function centroDe(pg, seletor) {
  const r = await pg.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; if (e.scrollIntoView) e.scrollIntoView({ block: 'center', inline: 'nearest' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, seletor);
  if (!r) { confere(false, `não achei "${seletor}" na tela`); return { x: 5, y: 5 }; }
  return r;
}
async function dedo(cdp, x, y) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
  await esperar(30);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await esperar(60);
}
// nada pequeno demais na tela: texto de 14 px para cima e botões de 44 px para cima
const pequenos = (pg) => J(pg, () => {
  const ruins = [];
  for (const n of document.querySelectorAll('#ui *')) {
    if (n.closest('[hidden]') || !n.offsetParent) continue;
    const temTexto = [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
    if (temTexto && parseFloat(getComputedStyle(n).fontSize) < 14) ruins.push(`texto de ${getComputedStyle(n).fontSize} em "${n.textContent.trim().slice(0, 20)}"`);
    if (n.tagName === 'BUTTON') { const r = n.getBoundingClientRect(); if (r.width < 44 || r.height < 44) ruins.push(`botão de ${Math.round(r.width)}x${Math.round(r.height)} (${n.className})`); }
  }
  return ruins;
});
// o cartão do painel (ou da tela de recompensa) cabe na janela e não vaza para os lados
const cabe = (pg, seletor) => J(pg, (s) => { const c = document.querySelector(s); if (!c) return false; const r = c.getBoundingClientRect(); return r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5; }, seletor);
const semVazar = (pg) => J(pg, () => { const c = document.querySelector('.veu .corpo'); return !!c && c.textContent.length > 20 && c.scrollWidth <= c.clientWidth + 1; });
const P = (pg, f) => pg.evaluate((nome) => window.__jogo.progresso[nome](), f);
const CAMPO = [[26, 51], [27, 51], [28, 51], [26, 52], [27, 52], [28, 52]];

let convite = '';
try {
  // =====================================================================================================
  console.log('1280x720, mouse e teclado');
  let a = await abrir(1280, 720);
  let pg = a.pg;
  const clicarEm = async (seletor) => { const c = await centroDe(pg, seletor); await pg.mouse.click(c.x, c.y); await esperar(70); await desenhar(pg); };
  const subida = () => J(pg, () => window.__jogo.subidaAberta());
  // a tela de recompensa aberta: do tipo certo, com o baú, os prêmios e o foco no botão; fecha com Enter
  async function recompensa(tipo, arquivo, extra) {
    await esperar(120);
    const r = await J(pg, () => { const e = document.querySelector('.subida.recompensa'); if (!e) return null; const b = e.querySelector('[data-k="continuar"]'); return { classe: e.className, bau: !!e.querySelector('.bau .aberto') && !!e.querySelector('.bau .fechado'), premios: e.querySelectorAll('.premios .item').length, foco: document.activeElement === b, botao: b ? b.textContent : '', texto: e.textContent, avisos: document.querySelectorAll('.avisos .aviso').length }; });
    if (!confere(!!r, `a tela de recompensa "${tipo}" abre`)) return;
    confere(r.classe.includes('tipo-' + tipo), `a tela de recompensa é a do tipo "${tipo}" (veio "${r.classe}")`);
    confere(r.bau, `recompensa "${tipo}": tem o baú fechado e o aberto`);
    confere(r.premios >= 1, `recompensa "${tipo}": mostra os prêmios`);
    confere(r.foco && /receber/i.test(r.botao), `recompensa "${tipo}": o botão "Receber" já tem o foco`);
    igual(r.avisos, 0, `recompensa "${tipo}": nenhum aviso por cima`);
    if (extra) confere(extra.test(r.texto), `recompensa "${tipo}": o texto traz ${extra} (veio "${r.texto.slice(0, 80)}")`);
    if (arquivo) { await esperar(1500); await pg.screenshot({ path: path.join(capturas, arquivo), type: 'jpeg', quality: 84 }); }
    confere(await J(pg, () => { const c = document.querySelector('.recompensa .bau .aberto'); return !!c && getComputedStyle(c).opacity === '1'; }) || !arquivo, `recompensa "${tipo}": o baú abre`);
    await pg.keyboard.press('Enter');
    await esperar(120);
    confere(!(await subida()), `Enter fecha a tela de recompensa "${tipo}"`);
    await desenhar(pg);
  }

  // ---- ao entrar: nada cobre o jogo; a caixa de correio aparece com o ponto
  let e = await estado(pg);
  confere(!(await subida()), 'ao entrar no jogo nenhuma janela abre sozinha');
  confere(await J(pg, () => { const b = document.querySelector('.topo-dir [data-k="correio"]'); return !!b && !b.hidden && !!b.querySelector('.ponto'); }), 'a caixa de correio aparece no HUD com o ponto (há presente do dia)');
  confere(await J(pg, () => { const b = document.querySelector('.topo-dir [data-painel="fazenda"]'); return !!b && !!b.querySelector('.ponto') && !b.querySelector('.ponto').hidden; }), 'o botão "Minha fazenda" mostra o ponto de "tem prêmio"');
  igual((await P(pg, 'correio')).map((c) => c.classe).join(','), 'diaria', 'no correio de uma fazenda nova só há o presente do dia');

  // ---- joga um pouco: ara seis casas com o mouse (a conquista "Terra arada" conta o evento)
  await J(pg, () => window.__jogo.olhar(27.5, 52));
  await clicarEm('.modo[data-modo="enxada"]');
  for (const [x, z] of CAMPO) { const p = await J(pg, ([x, z]) => window.__jogo.naTela(x + 0.5, z + 0.5), [x, z]); await pg.mouse.click(p.x, p.y); }
  await J(pg, () => { window.__jogo.ateParar(240); window.__jogo.seguir(); });
  igual((await estado(pg)).aradas, 6, 'seis casas aradas');
  igual((await P(pg, 'conquistas')).find((c) => c.id === 'terra-arada').valor, 6, 'a conquista "Terra arada" contou as seis casas');

  // ---- o presente do dia pela caixa de correio
  const antes1 = await estado(pg);
  await clicarEm('.topo-dir [data-k="correio"]');
  await recompensa('presente', 'd-01-recompensa-presente.jpg', /Dia 1/);
  e = await estado(pg);
  const dia1 = (await P(pg, 'diaria')).dias[0].recompensa;
  confere(Object.keys(dia1.itens).every((k) => (e.bolsa[k] || 0) + (e.celeiro[k] || 0) > (antes1.bolsa[k] || 0) + (antes1.celeiro[k] || 0)) || e.ouro > antes1.ouro || e.cash > antes1.cash, 'o presente do dia 1 entra nas posses');
  confere(await J(pg, () => document.querySelector('.topo-dir [data-k="correio"]').hidden), 'aberto o presente, a caixa de correio some do HUD');
  confere(!(await J(pg, () => window.__jogo.comando({ tipo: 'abrirPresente' }).ok)), 'o presente de hoje não abre duas vezes');

  // ---- "Minha fazenda" e o painel do presente do dia
  await clicarEm('.topo-dir [data-painel="fazenda"]');
  igual(await J(pg, () => window.__jogo.painelAberto()), 'fazenda', 'o botão do HUD abre "Minha fazenda"');
  confere(await semVazar(pg), 'o painel "Minha fazenda" tem conteúdo e não vaza para os lados');
  igual(await J(pg, () => document.querySelectorAll('.atalhos .atalho').length), 6, '"Minha fazenda" tem os seis atalhos');
  await foto(pg, 'd-02-minha-fazenda.jpg');
  // setas e Enter: o foco anda pelos atalhos e abre o escolhido
  await J(pg, () => document.querySelector('[data-k="ir-conquistas"]').focus());
  await pg.keyboard.press('ArrowRight');
  igual(await J(pg, () => document.activeElement && document.activeElement.dataset.k), 'ir-presentes', 'a seta para a direita leva o foco ao atalho vizinho');
  await pg.keyboard.press('Enter');
  await esperar(120);
  igual(await J(pg, () => window.__jogo.painelAberto()), 'presentes', 'Enter no atalho abre o painel do presente do dia');
  igual(await J(pg, () => document.querySelectorAll('.cartela .dia').length), 7, 'a cartela mostra os sete dias');
  confere(await J(pg, () => document.querySelector('.cartela .dia[data-dia="1"]').classList.contains('aberto') && document.querySelector('.cartela .dia[data-dia="2"]').classList.contains('amanha') && !document.querySelector('[data-k="abrir-presente"]')), 'dia 1 aberto, dia 2 para amanhã, e nada para abrir hoje');
  confere(await J(pg, () => !/sequ[êe]ncia|perde[ru]/i.test(document.querySelector('.veu .corpo').textContent.replace('não perde nada', ''))), 'o painel não fala em sequência nem em perda');

  // ---- o dia seguinte: o relógio avança e o presente 2 espera (sem abrir sozinho)
  await J(pg, (s) => window.__jogo.pular(s), DIA);
  await desenhar(pg);
  confere(!(await subida()), 'no dia seguinte nada abre sozinho');
  confere(await J(pg, () => document.querySelector('.cartela .dia[data-dia="2"]').classList.contains('hoje') && !!document.querySelector('[data-k="abrir-presente"]')), 'no dia seguinte o dia 2 é o de hoje e o botão de abrir aparece');
  await foto(pg, 'd-03-presente-do-dia.jpg');
  const ouro2 = (await estado(pg)).ouro;
  await clicarEm('[data-k="abrir-presente"]');
  await recompensa('presente', null, /Dia 2/);
  e = await estado(pg);
  confere(e.ouro > ouro2, `o presente do dia 2 dá ouro (tinha ${ouro2}, ficou com ${e.ouro})`);
  // faltar um dia não zera: dois dias depois, o presente é o do dia 3
  await J(pg, (s) => window.__jogo.pular(s), 2 * DIA);
  await desenhar(pg);
  igual((await P(pg, 'diaria')).dias.map((d) => d.estado).join(','), 'aberto,aberto,hoje,depois,depois,depois,depois', 'depois de faltar um dia a cartela continua de onde parou');
  await J(pg, () => document.querySelector('[data-k="abrir-presente"]').focus());
  await pg.keyboard.press('Enter');
  await recompensa('presente', null, /Dia 3/);

  // ---- a conquista "Todo dia" (três presentes abertos) ficou pronta: aviso, ponto, painel e a tela de recompensa
  confere(await J(pg, () => window.__jogo.avisos().some((t) => /conquista/i.test(t))), 'ao alcançar o marco aparece o aviso da conquista');
  igual((await P(pg, 'conquistas'))[0].id, 'todo-dia', 'a conquista pronta para receber vem em primeiro na lista');
  await clicarEm('.veu [data-k="voltar"]');
  igual(await J(pg, () => window.__jogo.painelAberto()), 'fazenda', 'o botão de voltar leva de volta a "Minha fazenda"');
  confere(await J(pg, () => !!document.querySelector('[data-k="receber-conquistas"]') && !!document.querySelector('[data-k="ir-conquistas"] .ponto')), '"Minha fazenda" mostra o prêmio de conquista para receber');
  await clicarEm('[data-k="receber-conquistas"]');
  igual(await J(pg, () => window.__jogo.painelAberto()), 'conquistas', 'o botão leva ao painel das conquistas');
  confere(await J(pg, () => { const c = document.querySelector('.conquista[data-id="todo-dia"]'); return !!c && c.classList.contains('pronta') && !!c.querySelector('[data-k="receber-todo-dia"]') && !!c.querySelector('.barra') && c.querySelectorAll('.pe .item').length >= 1; }), 'a conquista pronta mostra a barra, o prêmio e o botão de receber');
  confere(await J(pg, () => { const c = document.querySelector('.conquista[data-id="terra-arada"]'); return !!c && /6\s*\/\s*100/.test(c.textContent) && !c.querySelector('button'); }), 'a conquista em andamento mostra quanto falta (6 / 100) e não tem botão');
  confere(await semVazar(pg), 'o painel das conquistas não vaza para os lados');
  await foto(pg, 'd-04-conquistas.jpg');
  const antesC = await estado(pg);
  await clicarEm('[data-k="receber-todo-dia"]');
  await recompensa('conquista', 'd-05-recompensa-conquista.jpg', /presentes do dia/i);
  e = await estado(pg);
  const premioC = await J(pg, () => window.__jogo.dados.bruto.missoes.conquistas.find((c) => c.id === 'todo-dia').recompensas[0]);
  igual(e.ouro - antesC.ouro, premioC.ouro || 0, 'receber a conquista dá o ouro do marco');
  igual(e.cash - antesC.cash, premioC.cash || 0, 'receber a conquista dá o cash do marco');
  confere(await J(pg, () => { const c = document.querySelector('.conquista[data-id="todo-dia"]'); return !!c && !c.classList.contains('pronta') && !c.querySelector('button') && /1 de/.test(c.querySelector('.marcos').textContent); }), 'depois de receber, a conquista mostra o marco seguinte');
  confere(await J(pg, () => { const a = document.activeElement; return !!a && !!a.closest('.veu'); }), 'fechada a recompensa, o foco volta para o painel');
  confere(!(await J(pg, () => window.__jogo.comando({ tipo: 'receberConquista', id: 'todo-dia' }).ok)), 'o mesmo marco não se recebe duas vezes');
  await pg.keyboard.press('Escape');
  igual(await J(pg, () => window.__jogo.painelAberto()), null, 'Esc fecha o painel');
  confere(await J(pg, () => document.querySelector('.topo-dir [data-painel="fazenda"] .ponto').hidden), 'sem nada para receber, o ponto do botão some');

  // ---- o nome da fazenda
  await clicarEm('.topo-dir [data-painel="fazenda"]');
  await pg.fill('#nome-da-fazenda', 'Sítio <b>Boa Vista</b>');
  await clicarEm('[data-k="guardar-nome"]');
  igual((await P(pg, 'amigos')).nome, 'Sítio b Boa Vista /b', 'o nome da fazenda fica guardado (sem sinais de marcação)');
  await pg.fill('#nome-da-fazenda', 'Sítio Boa Vista');
  await pg.focus('#nome-da-fazenda');
  await pg.keyboard.press('Enter');
  await desenhar(pg);
  igual((await P(pg, 'amigos')).nome, 'Sítio Boa Vista', 'Enter no campo guarda o nome');

  // ---- amigos: o convite copiado, o amigo simulado e a foto
  await clicarEm('[data-k="ir-amigos"]');
  igual(await J(pg, () => window.__jogo.painelAberto()), 'amigos', 'o atalho abre o painel dos amigos');
  const am = await P(pg, 'amigos');
  convite = am.codigo;
  confere(/^[a-z0-9]{6}$/.test(convite), `a fazenda tem um código de convite (${convite})`);
  const textoConvite = await J(pg, () => document.querySelector('#texto-do-convite').value);
  confere(textoConvite.includes('#convite-' + convite) && textoConvite.includes('Sítio Boa Vista'), 'o texto do convite traz o link com o código e o nome da fazenda');
  confere(/^https?:\/\/[^#\s]+#convite-[a-z0-9]+$/.test(textoConvite.split(' ').pop()), 'o link do convite é o endereço do jogo com #convite-<código>');
  await clicarEm('[data-k="copiar-convite"]');
  confere(await J(pg, () => { const n = document.querySelector('#nota-do-convite'); return !!n && !n.hidden && /copiado/i.test(n.textContent); }), 'copiar o convite avisa que copiou');
  let colado = null;
  try { colado = await J(pg, () => navigator.clipboard.readText()); } catch { colado = null; }
  if (colado === null) console.log('  (este navegador não deixa a ferramenta ler a área de transferência; confiro só o aviso)');
  else igual(colado, textoConvite, 'o texto do convite foi para a área de transferência');
  confere(await semVazar(pg), 'o painel dos amigos não vaza para os lados');
  await foto(pg, 'd-06-amigos.jpg');
  // sem servidor: o botão de teste simula a chegada de um amigo
  const cashAmigo = (await estado(pg)).cash;
  await clicarEm('[data-k="simular-amigo"]');
  igual((await P(pg, 'amigos')).aReceber, 1, 'o amigo simulado deixa um presente esperando');
  confere(await J(pg, () => !document.querySelector('.topo-dir [data-k="correio"]').hidden), 'com o presente do amigo, a caixa de correio volta ao HUD');
  igual((await estado(pg)).cash, cashAmigo, 'o presente do amigo não entra sozinho nas posses');
  await clicarEm('[data-k="receber-amigo"]');
  await recompensa('amigo', null, /amigo/i);
  igual((await estado(pg)).cash - cashAmigo, am.porAmigo.cash, 'o presente por amigo dá o cash dos dados');
  // a foto da fazenda: imagem na tela, texto copiado e o agrado de ouro uma vez por dia
  const ouroFoto = (await estado(pg)).ouro;
  await clicarEm('[data-k="tirar-foto"]');
  await esperar(250);
  const f = await J(pg, () => { const i = document.querySelector('#foto-da-fazenda'); return { src: i.src.slice(0, 22), w: i.naturalWidth, h: i.naturalHeight, visivel: !i.closest('[hidden]'), texto: document.querySelector('#texto-da-foto').value }; });
  confere(f.src.startsWith('data:image/jpeg') && f.w >= 800 && f.h >= 400 && f.visivel, `a foto da fazenda aparece na tela (${f.w}x${f.h})`);
  confere(f.texto.includes('#convite-' + convite), 'o texto para mandar com a foto traz o link');
  igual((await estado(pg)).ouro - ouroFoto, am.compartilhar.recompensa.ouro, 'mostrar a fazenda rende o agrado de ouro');
  fs.writeFileSync(path.join(capturas, 'd-07-foto-da-fazenda.jpg'), Buffer.from((await J(pg, () => document.querySelector('#foto-da-fazenda').src)).split(',')[1], 'base64'));
  await clicarEm('[data-k="tirar-foto"]');
  igual((await estado(pg)).ouro - ouroFoto, am.compartilhar.recompensa.ouro, 'o agrado da foto é um só por dia');
  await foto(pg, 'd-08-amigos-foto.jpg');

  // ---- loja de cash: aviso de teste, pergunta com o preço, compra simulada
  await clicarEm('.veu [data-k="voltar"]');
  await clicarEm('[data-k="ir-cash"]');
  igual(await J(pg, () => window.__jogo.painelAberto()), 'cash', 'o atalho abre a loja de cash');
  confere(await J(pg, () => /nenhuma cobrança é feita/i.test(document.querySelector('.aviso-de-teste').textContent)), 'a loja de cash avisa: versão de teste, nenhuma cobrança é feita');
  confere(await J(pg, () => document.querySelectorAll('.oferta.pacote').length >= 3 && /R\$\s*\d+,\d\d/.test(document.querySelector('.oferta.pacote button').textContent)), 'os pacotes mostram o preço em reais');
  confere(await J(pg, () => { const s = document.querySelector('.veu header .saldo'); return /\d/.test(s.textContent); }), 'o cabeçalho mostra o saldo de cash');
  confere(await J(pg, () => { const v = document.querySelector('.vagas .vaga .precos'); return !!v && v.querySelectorAll('.preco').length === 2; }), 'a vaga de fila mostra os dois preços (ouro e cash)');
  confere(await semVazar(pg), 'a loja de cash não vaza para os lados');
  await foto(pg, 'd-09-loja-de-cash.jpg');
  const cashLoja = (await estado(pg)).cash, pacote = await J(pg, () => window.__jogo.dados.bruto.loja.cash.pacotes[0]);
  await clicarEm(`[data-k="pacote-${pacote.id}"]`);
  confere(await J(pg, () => { const d = document.querySelector('.subida.dialogo'); return !!d && /R\$/.test(d.textContent) && /nenhuma cobrança/i.test(d.textContent) && document.activeElement === d.querySelector('[data-k="nao"]'); }), 'a compra pergunta antes, com o preço e o aviso de teste, e o foco começa no "não"');
  await foto(pg, 'd-10-pergunta-de-compra.jpg');
  await pg.keyboard.press('Escape');
  await esperar(80);
  confere(!(await subida()) && (await estado(pg)).cash === cashLoja, 'Esc fecha a pergunta sem comprar');
  await clicarEm(`[data-k="pacote-${pacote.id}"]`);
  await pg.keyboard.press('ArrowRight');
  igual(await J(pg, () => document.activeElement && document.activeElement.dataset.k), 'sim', 'na pergunta, a seta leva o foco ao "sim"');
  await pg.keyboard.press('Enter');
  await recompensa('compra', 'd-11-recompensa-compra.jpg', /nenhuma cobrança/i);
  igual((await estado(pg)).cash - cashLoja, pacote.cash, 'a compra simulada põe o cash do pacote no saldo');

  // ---- concluir um relógio com cash (um relógio de teste, do tipo que regras.json deixa concluir)
  await J(pg, () => window.__jogo.progresso.relogioDeTeste(1800));
  await desenhar(pg);
  const preco = await J(pg, () => { const b = document.querySelector('[data-k="concluir-teste"]'); return b && !b.hidden ? b.textContent : null; });
  confere(preco !== null && /Concluir\s*\d+/.test(preco), `o botão de concluir aparece com o preço (veio "${preco}")`);
  const cashConc = (await estado(pg)).cash;
  await clicarEm('[data-k="concluir-teste"]');
  confere(await J(pg, () => { const d = document.querySelector('.subida.dialogo'); return !!d && /concluir/i.test(d.textContent) && /\d+ de cash/.test(d.textContent); }), 'concluir pergunta antes, mostrando o preço em cash');
  await foto(pg, 'd-12-pergunta-de-concluir.jpg');
  await clicarEm('.dialogo [data-k="sim"]');
  e = await estado(pg);
  confere(cashConc - e.cash >= 1, `concluir gasta cash (gastou ${cashConc - e.cash})`);
  confere(await J(pg, () => { const b = document.querySelector('[data-k="concluir-teste"]'); return !b || b.hidden; }), 'concluído o relógio, o botão some');
  confere(await J(pg, () => window.__jogo.avisos().some((t) => /pronto/i.test(t))), 'concluir avisa que ficou pronto');
  // faltando pouco, é de graça e não pergunta
  await J(pg, () => window.__jogo.progresso.relogioDeTeste(20));
  await desenhar(pg);
  confere(await J(pg, () => /grátis/i.test(document.querySelector('[data-k="concluir-teste"]').textContent)), 'faltando pouco, o botão de concluir diz "grátis"');
  const cashGratis = (await estado(pg)).cash;
  await clicarEm('[data-k="concluir-teste"]');
  confere(!(await subida()) && (await estado(pg)).cash === cashGratis, 'concluir de graça não pergunta nem gasta');

  // ---- guarda-roupa: provar, comprar com cash, vestir, tirar; o que não tem desenho fica "em breve"
  await clicarEm('.veu [data-k="voltar"]');
  await clicarEm('[data-k="ir-guarda-roupa"]');
  igual(await J(pg, () => window.__jogo.painelAberto()), 'guarda-roupa', 'o atalho abre o guarda-roupa');
  const roupas = [].concat(...(await P(pg, 'roupas')).map((g) => g.itens));
  const alvo = roupas.filter((p) => p.pronto && !p.tem && p.cash > 0 && p.liberado).sort((x, y) => x.cash - y.cash)[0];
  confere(!!alvo, 'há uma roupa pronta para comprar com cash');
  const semDesenho = roupas.find((p) => !p.pronto);
  if (semDesenho) {
    await clicarEm(`[data-k="peca-${semDesenho.id}"]`);
    confere(await J(pg, () => /em breve/i.test(document.querySelector('.prova .acao').textContent) && !document.querySelector('.prova .acao button')), `a peça sem desenho (${semDesenho.id}) aparece como "em breve" e não se vende`);
  }
  const cashRoupa = (await estado(pg)).cash;
  await clicarEm(`[data-k="peca-${alvo.id}"]`);
  await esperar(400);
  confere(await J(pg, () => { const c = document.querySelector('.prova canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n > 4000; }), 'a prova mostra a personagem com a peça escolhida');
  await foto(pg, 'd-13-guarda-roupa.jpg');
  await clicarEm('[data-k="comprar-cash"]');
  confere(await J(pg, () => { const d = document.querySelector('.subida.dialogo'); return !!d && /de cash/.test(d.textContent); }), 'comprar roupa com cash pergunta antes, com o preço');
  await clicarEm('.dialogo [data-k="sim"]');
  await esperar(300); await desenhar(pg);
  e = await estado(pg);
  igual(cashRoupa - e.cash, alvo.cash, 'a roupa custa o cash da oferta');
  igual(e.bolsa[alvo.id], 1, 'a roupa comprada é dela');
  igual(await P(pg, 'vestida'), alvo.id, 'a roupa comprada já fica vestida na personagem');
  confere(await J(pg, () => { const j = window.__jogo, p = j.atlas.pecas['personagem/parada-frente']; return !!p && j.atlas.paginas[p.q[0][0]].grupo === 'personagem-vestida'; }), 'a personagem do jogo passa a ser desenhada com a roupa (folhas com a cor trocada)');
  confere(await J(pg, () => !!document.querySelector('[data-k="tirar"]')), 'vestindo a peça, o botão vira "Tirar"');
  await clicarEm('[data-k="tirar"]');
  igual(await P(pg, 'vestida'), '', 'tirar devolve a roupa de sempre');
  await clicarEm('[data-k="vestir"]');
  igual(await P(pg, 'vestida'), alvo.id, 'vestir de novo funciona');
  confere(await semVazar(pg), 'o guarda-roupa não vaza para os lados');
  await foto(pg, 'd-14-guarda-roupa-vestida.jpg');
  // roupa de ouro: com o nível e o ouro, compra-se sem cash
  const deOuro = roupas.filter((p) => p.pronto && p.ouro > 0).sort((x, y) => x.ouro - y.ouro)[0];
  if (deOuro) {
    await clicarEm(`[data-k="peca-${deOuro.id}"]`);
    if (!deOuro.liberado) confere(await J(pg, () => /n[íi]vel/i.test(document.querySelector('.prova .acao').textContent) && !document.querySelector('.prova .acao button')), `a roupa de ouro (${deOuro.id}) diz o nível que a libera`);
    await J(pg, ([n, o]) => { const m = window.__jogo.mundo; m.progresso.nivel = Math.max(m.progresso.nivel, n); m.posses.ouro += o; m.eventos.emitir('informou', { motivo: '' }); }, [deOuro.nivel, deOuro.ouro]);
    await desenhar(pg);
    const ouroR = (await estado(pg)).ouro;
    await clicarEm('[data-k="comprar-ouro"]');
    e = await estado(pg);
    igual(ouroR - e.ouro, deOuro.ouro, 'a roupa de ouro custa o ouro de itens.json, sem cash');
    confere((await P(pg, 'vestida')).split('+').includes(deOuro.id), 'a roupa de ouro comprada fica vestida');
  }
  await pg.keyboard.press('Escape');
  await J(pg, () => window.__jogo.seguir());
  await foto(pg, 'd-15-personagem-vestida.jpg');

  // ---- o caderno do vizinho
  await clicarEm('.topo-dir [data-painel="fazenda"]');
  await clicarEm('[data-k="ir-caderno"]');
  igual(await J(pg, () => window.__jogo.painelAberto()), 'caderno', 'o atalho abre o caderno do vizinho');
  const cad = await J(pg, () => [...document.querySelectorAll('.licao')].map((l) => ({ id: l.dataset.id, agora: l.classList.contains('agora'), texto: l.textContent, fala: l.querySelector('p').textContent.length })));
  confere(cad.length >= 2 && cad[0].agora && cad.some((l) => l.id === 'preparar-a-terra' && !l.agora), 'o caderno traz a lição de agora e as já dadas');
  confere(cad.every((l) => l.fala > 20 && /Ensina/.test(l.texto)), 'cada lição tem o título, a fala e o que ensina');
  confere(await semVazar(pg), 'o caderno não vaza para os lados');
  await foto(pg, 'd-16-caderno.jpg');
  confere(await J(pg, () => { const D = window.__jogo.dados, cash = { concluiu: 1, comprouCash: 1, comprouComCash: 1, gastouCash: 1 }; return D.missoes.vizinho.every((x) => !cash[x.objetivo.evento]); }), 'nenhuma lição do vizinho pede para gastar cash');
  await pg.keyboard.press('Escape');

  // ---- pela loja de ouro também se chega ao guarda-roupa e à loja de cash
  await clicarEm('.topo-dir [data-painel="loja"]');
  await clicarEm('[data-k="aba-cash"]');
  igual(await J(pg, () => window.__jogo.painelAberto()), 'cash', 'a aba "Cash" da loja leva à loja de cash');
  await clicarEm('.veu [data-k="voltar"]');
  igual(await J(pg, () => window.__jogo.painelAberto()), 'loja', 'de lá, voltar leva de novo à loja');
  await pg.keyboard.press('Escape');

  // ---- gravar e recarregar: tudo continua
  const antesG = { e: await estado(pg), am: await P(pg, 'amigos'), dia: await P(pg, 'diaria'), vest: await P(pg, 'vestida'), conq: (await P(pg, 'conquistas')).find((c) => c.id === 'todo-dia').recebidos };
  await J(pg, () => window.__jogo.gravar());
  await pg.reload();
  await pronto(pg);
  await pg.waitForFunction(() => window.__jogo.progresso.vestida() !== null, null, { timeout: 8000 });
  e = await estado(pg);
  igual(e.cash, antesG.e.cash, 'recarregar traz o cash');
  igual((await P(pg, 'amigos')).nome, antesG.am.nome, 'recarregar traz o nome da fazenda');
  igual((await P(pg, 'amigos')).codigo, antesG.am.codigo, 'recarregar mantém o código de convite');
  igual((await P(pg, 'conquistas')).find((c) => c.id === 'todo-dia').recebidos, antesG.conq, 'recarregar traz as conquistas recebidas');
  igual((await P(pg, 'diaria')).dias.map((d) => d.estado).join(','), antesG.dia.dias.map((d) => d.estado).join(','), 'recarregar traz a cartela do presente do dia');
  igual(await P(pg, 'vestida'), antesG.vest, 'recarregar traz a roupa vestida');
  confere(!(await subida()), 'ao voltar ao jogo nenhuma janela abre sozinha');
  semErros(a, '1280x720');
  await a.ctx.close();

  // =====================================================================================================
  console.log('uma fazenda nova aberta pelo convite (#convite-' + convite + ')');
  a = await abrir(1280, 720, { endereco: '#convite-' + convite });
  pg = a.pg;
  confere(!(await J(pg, () => window.__jogo.subidaAberta())), 'aberto pelo convite, o jogo não abre janela sozinho');
  let am2 = await P(pg, 'amigos');
  igual(am2.convidadoPor, convite, 'a fazenda nova guarda de quem veio o convite');
  igual(am2.presenteDeConvidado, 'espera', 'o presente de boas-vindas espera na caixa de correio');
  confere(am2.codigo !== convite, 'a fazenda nova tem o seu próprio código');
  igual((await P(pg, 'correio')).map((c) => c.classe).join(','), 'convidado,diaria', 'no correio: o presente de boas-vindas e o do dia');
  const antesConv = await estado(pg);
  let c0 = await centroDe(pg, '.topo-dir [data-k="correio"]');
  await pg.mouse.click(c0.x, c0.y);
  await esperar(200);
  confere(await J(pg, () => { const s = document.querySelector('.subida.recompensa'); return !!s && s.classList.contains('tipo-convite') && s.querySelectorAll('.premios .item').length >= 1 && /mais um presente/i.test(s.textContent); }), 'a caixa de correio abre o presente de boas-vindas e diz que há mais um esperando');
  await esperar(1500);
  await pg.screenshot({ path: path.join(capturas, 'd-17-recompensa-convite.jpg'), type: 'jpeg', quality: 84 });
  await pg.keyboard.press('Enter');
  await esperar(150);
  let e2 = await estado(pg);
  igual(e2.cash - antesConv.cash, am2.convidado.cash, 'o presente de boas-vindas dá o cash dos dados');
  confere(Object.keys(am2.convidado.itens).every((k) => (e2.bolsa[k] || 0) + (e2.celeiro[k] || 0) - (antesConv.bolsa[k] || 0) - (antesConv.celeiro[k] || 0) === am2.convidado.itens[k]), 'o presente de boas-vindas dá os itens dos dados');
  await J(pg, () => window.__jogo.gravar());
  await pg.reload();
  await pronto(pg);
  am2 = await P(pg, 'amigos');
  igual(am2.presenteDeConvidado, 'recebido', 'abrir de novo pelo mesmo link não dá o presente outra vez');
  igual((await estado(pg)).cash, e2.cash, 'o cash continua o mesmo depois de recarregar pelo link');
  semErros(a, 'convite');
  await a.ctx.close();

  // =====================================================================================================
  console.log('844x390, celular deitado, toque');
  a = await abrir(844, 390, { toque: true, dpr: 2 });
  pg = a.pg;
  const cdp = await a.ctx.newCDPSession(pg);
  const tocar = async (seletor) => { const c = await centroDe(pg, seletor); await dedo(cdp, c.x, c.y); await desenhar(pg); };
  let ruins = await pequenos(pg);
  confere(ruins.length === 0, 'celular, HUD com a caixa de correio: ' + ruins.slice(0, 4).join('; '));
  const sobre = await J(pg, () => {
    const nomes = ['.topo-esq', '.topo-dir', '.balao', '.modos', '.alavanca:not(.solta)', '.agir', '.linha-info'], cx = [];
    for (const s of nomes) { const e = document.querySelector(s); if (e && !e.hidden && e.offsetParent) { const r = e.getBoundingClientRect(); if (r.width > 0) cx.push([s, r]); } }
    const ruins = [];
    for (const [s, r] of cx) if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) ruins.push(`${s} sai da tela`);
    for (let i = 0; i < cx.length; i++) for (let k = i + 1; k < cx.length; k++) { const a = cx[i][1], b = cx[k][1]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) ruins.push(`${cx[i][0]} em cima de ${cx[k][0]}`); }
    return ruins;
  });
  confere(sobre.length === 0, 'celular, HUD com a caixa de correio e "Minha fazenda": ' + sobre.join('; '));
  await foto(pg, 'd-20-celular-hud.jpg');
  // a recompensa no celular: cabe na tela, o toque no botão fecha
  await tocar('.topo-dir [data-k="correio"]');
  await esperar(1500);
  confere(await J(pg, () => !!document.querySelector('.subida.recompensa.tipo-presente')), 'no celular, o toque na caixa de correio abre o presente');
  confere(await cabe(pg, '.recompensa .cartao'), 'a tela de recompensa cabe na tela do celular');
  ruins = await pequenos(pg);
  confere(ruins.length === 0, 'celular, tela de recompensa: ' + ruins.slice(0, 4).join('; '));
  await pg.screenshot({ path: path.join(capturas, 'd-21-celular-recompensa.jpg'), type: 'jpeg', quality: 84 });
  await tocar('.recompensa [data-k="continuar"]');
  confere(!(await J(pg, () => window.__jogo.subidaAberta())), 'no celular, o toque em "Receber" fecha a recompensa');
  // para as fotos do celular: três dias de presente (a conquista fica pronta), cash e um amigo esperando
  await J(pg, (DIA) => { const j = window.__jogo; j.pular(DIA); j.comando({ tipo: 'abrirPresente' }); j.pular(DIA); j.comando({ tipo: 'abrirPresente' }); j.pular(DIA); j.comando({ tipo: 'comprarCash', pacote: j.dados.bruto.loja.cash.pacotes[1].id }); j.comando({ tipo: 'amigoChegou', codigo: 'amigo1' }); j.comando({ tipo: 'nomearFazenda', nome: 'Sítio Boa Vista' }); }, DIA);
  for (let k = 0; k < 6 && (await J(pg, () => window.__jogo.subidaAberta())); k++) { await pg.keyboard.press('Enter'); await esperar(100); }
  await desenhar(pg);
  // cada painel: abre pelo toque, cabe na tela, não vaza, nada pequeno demais
  await tocar('.topo-dir [data-painel="fazenda"]');
  const paineis = [['fazenda', null, 'd-22-celular-minha-fazenda.jpg'], ['conquistas', 'ir-conquistas', 'd-23-celular-conquistas.jpg'], ['presentes', 'ir-presentes', 'd-24-celular-presente-do-dia.jpg'], ['amigos', 'ir-amigos', 'd-25-celular-amigos.jpg'], ['cash', 'ir-cash', 'd-26-celular-loja-de-cash.jpg'], ['guarda-roupa', 'ir-guarda-roupa', 'd-27-celular-guarda-roupa.jpg'], ['caderno', 'ir-caderno', 'd-28-celular-caderno.jpg']];
  for (const [id, atalho, arquivo] of paineis) {
    if (atalho) { await tocar(`[data-k="${atalho}"]`); }
    igual(await J(pg, () => window.__jogo.painelAberto()), id, `no celular, o toque abre o painel "${id}"`);
    if (id === 'guarda-roupa') { await tocar('.peca:not(.em-breve)'); await esperar(400); }
    confere(await cabe(pg, '.veu .cartao'), `o painel "${id}" cabe na tela do celular`);
    confere(await semVazar(pg), `no celular, o painel "${id}" não vaza para os lados`);
    ruins = await pequenos(pg);
    confere(ruins.length === 0, `celular, painel "${id}": ` + ruins.slice(0, 4).join('; '));
    await J(pg, () => { const c = document.querySelector('.veu .corpo'); if (c) c.scrollTop = 0; });
    await foto(pg, arquivo);
    if (id === 'cash') {
      // a pergunta de compra no celular
      await tocar('.oferta.pacote button');
      confere(await cabe(pg, '.dialogo .cartao'), 'a pergunta de compra cabe na tela do celular');
      ruins = await pequenos(pg);
      confere(ruins.length === 0, 'celular, pergunta de compra: ' + ruins.slice(0, 4).join('; '));
      await pg.screenshot({ path: path.join(capturas, 'd-29-celular-pergunta.jpg'), type: 'jpeg', quality: 84 });
      await tocar('.dialogo [data-k="nao"]');
      confere(!(await J(pg, () => window.__jogo.subidaAberta())), 'no celular, "Agora não" fecha a pergunta');
    }
    if (atalho) await tocar('.veu [data-k="voltar"]');
  }
  // receber a conquista pelo toque
  await tocar('[data-k="receber-conquistas"]');
  await tocar('.conquista.pronta button');
  await esperar(1500);
  confere(await J(pg, () => !!document.querySelector('.subida.recompensa.tipo-conquista')), 'no celular, o toque em "Receber" abre a recompensa da conquista');
  confere(await cabe(pg, '.recompensa .cartao'), 'a recompensa da conquista cabe na tela do celular');
  await pg.screenshot({ path: path.join(capturas, 'd-30-celular-recompensa-conquista.jpg'), type: 'jpeg', quality: 84 });
  await tocar('.recompensa [data-k="continuar"]');
  // tocar fora fecha o painel
  await dedo(cdp, 6, 200);
  igual(await J(pg, () => window.__jogo.painelAberto()), null, 'tocar fora do painel fecha');
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
