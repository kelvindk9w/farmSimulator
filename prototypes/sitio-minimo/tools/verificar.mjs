// Verificação automática do protótipo. Uso: npm run verificar  (depois de npm run build)
// 1. confere a pasta dist/ (só .html, .js, .json e .png; nada de "?" nos endereços);
// 2. roda a verificação da lógica (tools/simular.mjs);
// 3. no navegador, em modo passo, roda a demonstração inteira com cada conjunto de arte e confere que cada ação
//    terminou com a mudança esperada nos contadores e que os dois conjuntos passaram pelos mesmos estados;
// 4. troca a arte no meio da demonstração (tudo de uma vez, um tipo só, e pelo botão "Arte") e confere que o jogo não muda;
// 5. comanda o jogo por toques e cliques de verdade (tela de celular em pé e deitada, e mouse).
// Não mede quadros por segundo: nesta máquina o WebGL roda em software.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { abrirNavegador, abrirPagina, TELAS, dist, raiz } from './comum.mjs';

let falhas = 0;
const ok = (cond, texto, detalhe = '') => { console.log(`  ${cond ? 'ok  ' : 'FALHOU'} ${texto}${!cond && detalhe ? '\n         ' + detalhe : ''}`); if (!cond) falhas++; return cond; };
const titulo = (t) => console.log('\n' + t);
// CONJUNTOS_EXTRA=nome1,nome2 acrescenta conjuntos em teste sem mexer neste arquivo (todo conjunto registrado tem de estar na lista)
const CONJUNTOS = ['codigo', 'molde', 'brinquedo', 'lowpoly', 'contorno', 'figuras', 'pintado', ...(process.env.CONJUNTOS_EXTRA || '').split(',').filter(Boolean)];
const INICIAL = JSON.parse(fs.readFileSync(path.join(raiz, 'config/arte.json'), 'utf8')).padrao; // o conjunto que abre quando o endereço não pede outro
const LIMITE_DEMO = 30 * 60; // a demonstração tem de caber em 30 s
const S = (f, ...a) => `(${f})(...${JSON.stringify(a)})`;

// ---------- 1. pasta dist ----------
titulo('Pasta dist/');
{
  const arquivos = [];
  const andar = (p) => { for (const e of fs.readdirSync(p, { withFileTypes: true })) { const q = path.join(p, e.name); if (e.isDirectory()) andar(q); else arquivos.push(path.relative(dist, q)); } };
  if (ok(fs.existsSync(path.join(dist, 'index.html')), 'dist/index.html existe (rode "npm run build" antes)')) {
    andar(dist);
    const ruins = arquivos.filter((a) => !/\.(html|js|json|png)$/.test(a));
    ok(ruins.length === 0, `só há arquivos .html, .js, .json e .png (${arquivos.join(', ')})`, 'fora do permitido: ' + ruins.join(', '));
    const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
    const enderecos = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
    ok(enderecos.every((e) => !e.includes('?') && !/^https?:/.test(e)), `index.html só aponta para arquivos locais, sem "?" (${enderecos.join(', ')})`);
    const js = arquivos.filter((a) => a.endsWith('.js')).map((a) => fs.readFileSync(path.join(dist, a), 'utf8')).join('\n');
    ok(!/serviceWorker\.register|\balert\(|\bconfirm\(/.test(js), 'o código não usa alert, confirm nem service worker');
    ok(!/\.glb\b/.test(js), 'o código não carrega arquivos .glb');
  }
}

// ---------- 2. lógica ----------
titulo('Lógica (tools/simular.mjs)');
{
  const r = spawnSync(process.execPath, [path.join(raiz, 'tools', 'simular.mjs')], { encoding: 'utf8' });
  const linhas = (r.stdout || '').split('\n').filter((l) => /^\s+(ok|FALHOU)/.test(l));
  ok(r.status === 0, `a verificação da lógica passou (${linhas.filter((l) => /^\s+ok/.test(l)).length} conferências)`, (r.stdout || '').split('\n').filter((l) => /FALHOU/.test(l)).join(' | ') + (r.stderr || ''));
}

if (!fs.existsSync(path.join(dist, 'index.html'))) { console.log('\nSem dist/ não dá para continuar.'); process.exit(1); }
const amb = await abrirNavegador();
const todosErros = [];
try {
  // ---------- 3. a demonstração com cada conjunto ----------
  // roda até o fim, guardando a cada meio segundo o resumo do estado do jogo e os estados entregues à arte
  const rodarDemo = async (pagina, aoPasso = async () => {}) => {
    const trilha = [], problemasNoCaminho = [];
    let info = null;
    for (let n = 30; n <= 2400; n += 30) {
      await aoPasso(n);
      info = await pagina.evaluate((k) => window.__sitio.avancarAte(k), n);
      const linha = await pagina.evaluate(() => {
        const S = window.__sitio, ids = ['personagem', ...Object.keys(S.objetos())];
        return { resumo: S.resumo(), arte: ids.map((id) => id + ':' + S.visual(id).estado).join(' '), problemas: S.problemasDeArte() };
      });
      for (const p of linha.problemas) if (!problemasNoCaminho.includes(p)) problemasNoCaminho.push(p);
      trilha.push({ passo: n, resumo: linha.resumo, arte: linha.arte });
      if (info.demo && info.demo.fim && n >= info.demo.fimEm + 30) break;
    }
    const fim = await pagina.evaluate(() => ({ marcas: window.__sitio.marcas(), registro: window.__sitio.registro(), contadores: window.__sitio.info().contadores, problemas: window.__sitio.problemasDeArte(), stats: window.__sitio.estatisticas() }));
    fim.problemas = [...new Set([...problemasNoCaminho, ...fim.problemas])];
    return { trilha, info, ...fim };
  };
  const res = {};
  for (const c of CONJUNTOS) {
    titulo(`Demonstração com o conjunto de arte "${c}" (modo passo)`);
    const { pagina, contexto, erros } = await abrirPagina(amb, `passo,demo,tudo,arte-${c}`);
    const ini = await pagina.evaluate(() => ({ conjunto: window.__sitio.info().conjunto, problemas: window.__sitio.problemasDeArte(), stats: window.__sitio.estatisticas() }));
    ok(ini.conjunto === c, `a página abriu com o conjunto "${c}" (pedido pelo "#arte-${c}")`, 'abriu com ' + ini.conjunto);
    ok(ini.problemas.length === 0, 'todos os visuais cumprem o contrato de arte (funções, estados e pontos de jogo)', JSON.stringify(ini.problemas));
    const r = res[c] = await rodarDemo(pagina);
    r.stats0 = ini.stats;
    ok(!!(r.info.demo && r.info.demo.fim), `a demonstração chegou ao fim (${r.marcas.length} itens)`);
    ok(r.info.demo.fimEm <= LIMITE_DEMO, `a demonstração dura ${(r.info.demo.fimEm / 60).toFixed(1)} s (limite: 30 s)`);
    for (const m of r.marcas) {
      const difs = [];
      if (m.falhou) difs.push('a ação não foi concluída');
      for (const [k, d] of Object.entries((m.espera && m.espera.mais) || {})) if (m.depois[k] - m.antes[k] !== d) difs.push(`${k}: esperava ${d > 0 ? '+' : ''}${d}, veio ${m.depois[k] - m.antes[k]}`);
      for (const [k, d] of Object.entries((m.espera && m.espera.igual) || {})) if (m.depois[k] !== d) difs.push(`${k}: esperava ${d}, veio ${m.depois[k]}`);
      const esp = m.espera ? Object.entries({ ...(m.espera.mais || {}), ...(m.espera.igual || {}) }).map(([k, d]) => `${k} ${typeof d === 'number' ? (d > 0 ? '+' + d : d) : '= ' + d}`).join(', ') : 'só anda';
      ok(difs.length === 0, `${String(m.de).padStart(4)} -> ${String(m.ate).padStart(4)}  ${m.legenda}  [${esp}]`, difs.join('; '));
    }
    const acoes = r.registro.map((x) => x.acao);
    for (const a of ['tirarAgua', 'plantar', 'regar', 'pegarOvo', 'guardar', 'colherFruta', 'ordenhar', 'colher']) ok(acoes.includes(a), `a ação "${a}" aparece no registro de ações concluídas`);
    ok(r.contadores['celeiro.ovo'] === 1 && r.contadores['mao.ovo'] === 0, 'o ovo foi guardado: saiu da mão e entrou no estoque do celeiro');
    ok(r.problemas.length === 0, 'nenhum visual saiu do contrato durante a demonstração (conferido a cada meio segundo)', JSON.stringify(r.problemas));
    ok(erros.length === 0, 'nenhum erro no console', erros.join(' | '));
    console.log(`       desenho da cena inteira no começo: ${ini.stats.chamadas} chamadas de desenho, ${ini.stats.triangulos} triângulos`);
    todosErros.push(...erros);
    await contexto.close();
  }

  // cada conjunto é comparado com o primeiro da lista
  for (const outro of CONJUNTOS.slice(1)) {
    titulo(`Os conjuntos "${CONJUNTOS[0]}" e "${outro}" passam pelos mesmos estados`);
    const a = res[CONJUNTOS[0]], b = res[outro];
    ok(a.trilha.length === b.trilha.length, `mesmo número de pontos de conferência (${a.trilha.length}, um a cada meio segundo)`);
    const n = Math.min(a.trilha.length, b.trilha.length);
    let difResumo = -1, difArte = -1;
    for (let i = 0; i < n; i++) { if (difResumo < 0 && a.trilha[i].resumo !== b.trilha[i].resumo) difResumo = i; if (difArte < 0 && a.trilha[i].arte !== b.trilha[i].arte) difArte = i; }
    ok(difResumo < 0, `o resumo do estado do jogo é idêntico nos ${n} pontos (último: ${a.trilha[n - 1].resumo})`, difResumo >= 0 ? `primeira diferença no passo ${a.trilha[difResumo].passo}` : '');
    ok(difArte < 0, 'os estados entregues aos visuais (personagem e os 9 objetos) são idênticos nos mesmos pontos', difArte >= 0 ? `passo ${a.trilha[difArte].passo}: ${a.trilha[difArte].arte}  x  ${b.trilha[difArte].arte}` : '');
    ok(JSON.stringify(a.marcas.map((m) => [m.de, m.ate])) === JSON.stringify(b.marcas.map((m) => [m.de, m.ate])), 'cada item do roteiro começa e termina no mesmo passo');
    ok(JSON.stringify(a.registro) === JSON.stringify(b.registro), 'o registro de ações (passo, ação, alvo, contadores) é idêntico');
    const vistos = new Set(); for (const t of a.trilha) for (const p of t.arte.split(' ')) vistos.add(p.replace(/^[^:]*\d?:/, (s) => s.replace(/\d+:$/, ':')));
    console.log('       estados vistos: ' + [...vistos].sort().join(', '));
  }

  // ---------- 4. troca de arte com o jogo andando ----------
  titulo('Troca de arte no meio da demonstração (sem recarregar)');
  {
    const { pagina, contexto, erros } = await abrirPagina(amb, 'passo,demo,tudo');
    const ref = res.codigo;
    const abriu = await pagina.evaluate(() => window.__sitio.info().conjunto);
    ok(abriu === INICIAL, `sem "#arte-..." no endereço, a página abre com o conjunto "${INICIAL}" (config/arte.json)`, 'abriu com ' + abriu);
    await pagina.evaluate(() => { window.__marca = Math.random(); });
    const marca = await pagina.evaluate(() => window.__marca);
    const trocas = [];
    const r = await rodarDemo(pagina, async (n) => {
      if (n === 300) trocas.push(['tudo para molde', await pagina.evaluate(() => window.__sitio.definirArte('molde'))]);
      if (n === 780) trocas.push(['só a vaca para codigo', await pagina.evaluate(() => { window.__sitio.definirArte('codigo', 'vaca'); return JSON.stringify(window.__sitio.conjuntos()); })]);
      if (n === 1110) { await pagina.click('#hud .botoes button:nth-child(2)'); trocas.push(['botão "Arte"', await pagina.evaluate(() => window.__sitio.info().conjunto + ' / ' + document.querySelector('#hud .botoes button:nth-child(2)').textContent)]); }
      if (n === 1410) { await pagina.evaluate(() => { location.hash = 'passo,demo,tudo,arte-molde'; }); await pagina.waitForFunction(() => window.__sitio.info().conjunto === 'molde'); trocas.push(['"#arte-molde" no endereço', 'molde']); }
      if (n === 1560) trocas.push(['tudo para brinquedo (a luz e a sombra do conjunto voltam junto)', await pagina.evaluate(() => window.__sitio.definirArte('brinquedo'))]);
    });
    for (const [o, v] of trocas) console.log(`       troca: ${o} -> ${v}`);
    ok(trocas.length === 5 && trocas[0][1] === 'molde' && trocas[4][1] === 'brinquedo', 'a arte foi trocada cinco vezes durante a demonstração (tudo, um tipo, botão, endereço, de volta ao "brinquedo")');
    ok(/"vaca":"codigo"/.test(trocas[1][1]) && /"galinha":"molde"/.test(trocas[1][1]), 'a troca de um tipo só mudou só aquele tipo (vaca em "codigo", o resto em "molde")', trocas[1][1]);
    ok(await pagina.evaluate(() => window.__marca) === marca, 'a página não recarregou');
    ok(r.trilha.length === ref.trilha.length && r.trilha.every((t, i) => t.resumo === ref.trilha[i].resumo), 'o estado do jogo ficou idêntico ao da demonstração sem trocas, em todos os pontos');
    ok(JSON.stringify(r.registro) === JSON.stringify(ref.registro), 'o registro de ações é o mesmo');
    ok(r.problemas.length === 0, 'nenhum visual fora do contrato depois das trocas', JSON.stringify(r.problemas));
    ok(erros.length === 0, 'nenhum erro no console', erros.join(' | '));
    todosErros.push(...erros);
    await contexto.close();
  }

  // ---------- 5. toques e cliques de verdade ----------
  // (modo passo: o toque comanda, e a ferramenta faz o tempo andar)
  const esperar = async (pagina, cond, max = 900) => {
    const n0 = (await pagina.evaluate(() => window.__sitio.info())).passo;
    for (let n = n0 + 20; n <= n0 + max; n += 20) { const i = await pagina.evaluate((k) => window.__sitio.avancarAte(k), n); if (cond(i)) return i; }
    return await pagina.evaluate(() => window.__sitio.info());
  };
  const livre = (i) => i.estado === 'parado';
  const pontoDe = async (pagina, id) => {
    // procura, em volta do centro da caixa de toque, um ponto da tela em que o toque cai mesmo nesse objeto
    return await pagina.evaluate((alvo) => {
      const S = window.__sitio, c = S.telaDe(alvo);
      for (const [dx, dy] of [[0, 0], [0, -12], [0, 12], [-12, 0], [12, 0], [-20, -20], [20, -20], [0, -30], [0, 30]]) if (S.objetoEm(c[0] + dx, c[1] + dy) === alvo) return [c[0] + dx, c[1] + dy];
      return null;
    }, id);
  };

  for (const [nome, tela, hash] of [['celular em pé (390 x 844), toques', TELAS.celularRetrato, 'passo,tudo'], ['celular deitado (844 x 390), toques', TELAS.celularPaisagem, 'passo,tudo'], ['computador (1280 x 720), cliques do mouse', TELAS.paisagem, 'passo']]) {
    titulo('Comandos de verdade: ' + nome);
    const { pagina, contexto, erros } = await abrirPagina(amb, hash, tela);
    const toque = async (x, y) => { if (tela.hasTouch) await pagina.touchscreen.tap(x, y); else await pagina.mouse.click(x, y); };
    const tocarEm = async (id) => { const p = await pontoDe(pagina, id); if (!p) return false; await toque(p[0], p[1]); return true; };
    const cabe = await pagina.evaluate(() => { const b = document.querySelector('#hud .botoes').getBoundingClientRect(), d = document.querySelector('#hud .dica').getBoundingClientRect(); return b.right <= innerWidth + 1 && b.left >= -1 && d.right <= innerWidth + 1 && d.bottom <= innerHeight + 1 && document.documentElement.scrollWidth <= innerWidth; });
    ok(cabe, 'os botões e a linha de dica cabem na tela, sem rolagem');
    let i0 = await pagina.evaluate(() => window.__sitio.info());
    // chão: anda até lá
    const chao = await pagina.evaluate(() => { const S = window.__sitio, alvo = [1.2, 1.4], t = S.telaDoChao(alvo[0], alvo[1]); return { alvo, t, livre: S.objetoEm(t[0], t[1]) === null }; });
    await toque(chao.t[0], chao.t[1]);
    let i = await esperar(pagina, (k) => livre(k) && k.passo > i0.passo + 20);
    ok(chao.livre && Math.hypot(i.x - chao.alvo[0], i.z - chao.alvo[1]) < 0.25, `toque no chão: o personagem andou até lá (parou em ${i.x.toFixed(2)}, ${i.z.toFixed(2)}; alvo ${chao.alvo.join(', ')})`);
    // poço: tira água
    ok(await tocarEm('poco'), 'o toque no poço cai no poço');
    i = await esperar(pagina, (k) => livre(k) && k.contadores.agua === 3);
    ok(i.contadores.agua === 3, `toque no poço: tirou água (regador ${i.contadores.agua}/3)`);
    // canteiro 1: planta; outro toque: rega
    ok(await tocarEm('canteiro1'), 'o toque no canteiro 1 cai no canteiro 1');
    i = await esperar(pagina, (k) => livre(k) && k.contadores.canteiro1 === 'semeado');
    ok(i.contadores.canteiro1 === 'semeado', `toque no canteiro vazio: plantou (canteiro 1 = ${i.contadores.canteiro1})`);
    await tocarEm('canteiro1');
    i = await esperar(pagina, (k) => livre(k) && k.contadores['canteiro1.molhado'] === true);
    ok(i.contadores['canteiro1.molhado'] === true && i.contadores.agua === 2, `toque no canteiro semeado: regou (molhado = ${i.contadores['canteiro1.molhado']}, regador ${i.contadores.agua}/3)`);
    // ninho: pega o ovo; celeiro: guarda
    await esperar(pagina, (k) => k.contadores['ninho.ovos'] > 0, 1200);
    ok(await tocarEm('ninho'), 'o toque no ninho cai no ninho');
    i = await esperar(pagina, (k) => livre(k) && k.contadores['mao.ovo'] === 1);
    ok(i.contadores['mao.ovo'] === 1, `toque no ninho com ovo: pegou o ovo (na mão: ${i.contadores['mao.ovo']})`);
    ok(await tocarEm('celeiro'), 'o toque no celeiro cai no celeiro');
    i = await esperar(pagina, (k) => livre(k) && k.contadores['celeiro.ovo'] === 1, 1200);
    const porta = await esperar(pagina, () => false, 80);
    const celeiro = await pagina.evaluate(() => window.__sitio.objetos().celeiro.estado);
    ok(i.contadores['celeiro.ovo'] === 1 && i.contadores['mao.ovo'] === 0, `toque no celeiro: entrou, guardou e saiu (celeiro.ovo = ${i.contadores['celeiro.ovo']}, na mão ${i.contadores['mao.ovo']})`);
    ok(celeiro === 'fechado', `a porta do celeiro fechou depois que ele saiu (estado: ${celeiro})`, String(porta.passo));
    if (tela.hasTouch) {
      // de perto, arrastar o dedo move a câmera e não comanda o personagem
      await pagina.evaluate(() => window.__sitio.definirModo('perto'));
      const antes = await pagina.evaluate(() => ({ i: window.__sitio.info(), cam: window.__sitio.telaDoChao(0, 0) }));
      const cdp = await contexto.newCDPSession(pagina);
      const cx = tela.width / 2, cy = tela.height / 2;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
      for (let k = 1; k <= 6; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - 15 * k, y: cy + 8 * k }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      const depois = await pagina.evaluate(() => ({ i: window.__sitio.avancarAte(window.__sitio.info().passo + 5), cam: window.__sitio.telaDoChao(0, 0) }));
      ok(depois.i.estado === 'parado' && Math.hypot(depois.cam[0] - antes.cam[0], depois.cam[1] - antes.cam[1]) > 30, `arrastar o dedo (modo "de perto") moveu a câmera ${Math.hypot(depois.cam[0] - antes.cam[0], depois.cam[1] - antes.cam[1]).toFixed(0)} px e não comandou o personagem`);
    }
    // botões: "Arte" troca o conjunto; "Demonstração" começa o roteiro
    const bt = async (n) => { const b = await pagina.locator(`#hud .botoes button:nth-child(${n})`).boundingBox(); await toque(b.x + b.width / 2, b.y + b.height / 2); };
    const volta = [await pagina.evaluate(() => window.__sitio.info().conjunto)];
    for (let k = 0; k < CONJUNTOS.length + 1; k++) { await bt(2); volta.push(await pagina.evaluate(() => window.__sitio.info().conjunto)); }
    const arte = volta[volta.length - 1];
    ok(volta[0] === INICIAL && volta[CONJUNTOS.length] === INICIAL && new Set(volta).size === CONJUNTOS.length && arte !== INICIAL, `botão "Arte": passa pelos ${CONJUNTOS.length} conjuntos e volta ao primeiro (${volta.join(' > ')})`);
    await bt(1);
    const demo = await pagina.evaluate(() => window.__sitio.info());
    ok(!!demo.demo && demo.passo === 0, 'botão "Demonstração": recomeçou o sítio e ligou o roteiro');
    const meio = await pagina.evaluate(() => window.__sitio.avancarAte(400));
    ok(meio.contadores.agua === 3 && meio.conjunto === arte, `a demonstração anda com a arte que estava escolhida ("${arte}")`);
    ok(erros.length === 0, 'nenhum erro no console', erros.join(' | '));
    todosErros.push(...erros);
    await contexto.close();
  }

  // ---------- 5b. teclado: setas andam na direção da tela, Espaço age no que está perto ----------
  titulo('Teclado (computador, 1280 x 720)');
  {
    const { pagina, contexto, erros } = await abrirPagina(amb, 'passo', TELAS.paisagem);
    const info = () => pagina.evaluate(() => window.__sitio.info());
    const anda = (n) => pagina.evaluate((k) => window.__sitio.avancarAte(window.__sitio.info().passo + k), n);
    const dica = () => pagina.evaluate(() => document.querySelector('#hud .dica').textContent);
    const quadroParado = () => pagina.evaluate(() => { const v = window.__sitio.visual('personagem'); return !('quadro' in v) || v.quadro === 12 || v.quadro === 13; });
    ok((await dica()).includes('setas'), `num computador a primeira dica fala das teclas ("${await dica()}")`);
    // as quatro setas: cada uma anda para o seu lado da tela, e ao soltar ele para
    const LADOS = { ArrowRight: [1, -1, 'para a direita'], ArrowUp: [-1, -1, 'para cima'], ArrowLeft: [-1, 1, 'para a esquerda'], ArrowDown: [1, 1, 'para baixo'] };
    for (const [tecla, [sx, sz, nome]] of Object.entries(LADOS)) {
      const a = await info(), ta = await pagina.evaluate(() => window.__sitio.telaDoChao(...window.__sitio.posicao('personagem').slice(0, 2)));
      await pagina.keyboard.down(tecla);
      const m = await anda(30);
      await pagina.keyboard.up(tecla);
      const f = await anda(40), tf = await pagina.evaluate(() => window.__sitio.telaDoChao(...window.__sitio.posicao('personagem').slice(0, 2)));
      const naTela = [tf[0] - ta[0], tf[1] - ta[1]], certo = tecla === 'ArrowRight' ? naTela[0] > 30 : tecla === 'ArrowLeft' ? naTela[0] < -30 : tecla === 'ArrowUp' ? naTela[1] < -15 : naTela[1] > 15;
      ok(m.estado === 'andando' && m.arte === 'andar' && certo && Math.sign(f.x - a.x) !== -sx && Math.sign(f.z - a.z) !== -sz, `seta ${nome}: andou ${nome} na tela (${naTela.map((v) => v.toFixed(0)).join(', ')} px)`);
      const g = await anda(20);
      ok(f.estado === 'parado' && g.x === f.x && g.z === f.z && await quadroParado(), `soltou a seta: parou em menos de 40 passos, na figura parada (${f.x.toFixed(2)}, ${f.z.toFixed(2)})`);
    }
    // seta presa: esbarra no poço e na beira do terreno sem atravessar nada, e não fica andando no lugar
    await pagina.keyboard.down('ArrowRight');
    let perto = 9, fora = 0, ult = null;
    for (let k = 0; k < 24; k++) { ult = await anda(15); perto = Math.min(perto, Math.hypot(ult.x - 4.3, ult.z - 1.7)); if (Math.abs(ult.x) > 5.16 || Math.abs(ult.z) > 5.16) fora++; }
    await pagina.keyboard.up('ArrowRight');
    await anda(40);
    ok(perto >= 0.8 + 0.28 && fora === 0 && ult.estado === 'parado', `seta presa para a direita: desviou do poço (chegou a ${perto.toFixed(2)} do centro; o raio com a folga é 1,10), não saiu do terreno e parou na cerca (${ult.x.toFixed(2)}, ${ult.z.toFixed(2)})`);
    // Espaço perto do poço: a dica avisa o que vai acontecer, e ele vai e tira água
    await pagina.keyboard.down('ArrowDown'); await anda(50); await pagina.keyboard.up('ArrowDown'); await anda(40);
    const antes = await dica();
    await pagina.keyboard.press('Space');
    let i = await esperar(pagina, (k) => livre(k) && k.contadores.agua === 3);
    ok(antes.startsWith('Espaço: Poço') && i.contadores.agua === 3, `Espaço perto do poço: a dica dizia "${antes}" e ele tirou água (regador ${i.contadores.agua}/3)`);
    // pelo teclado não se entra no pasto: de frente para a porteira, para cima + direita (reto para o fundo) para na porteira
    // (o caminho até lá é mandado direto: na tela, esse pedaço de chão fica atrás da caixa de toque do poço)
    await pagina.evaluate(() => window.__sitio.tocarChao(2.9, -0.4));
    i = await esperar(pagina, (k) => livre(k) && Math.hypot(k.x - 2.9, k.z + 0.4) < 0.3);
    await pagina.keyboard.down('ArrowUp'); await pagina.keyboard.down('ArrowRight');
    let fundo = 9;
    for (let k = 0; k < 12; k++) { const j = await anda(15); fundo = Math.min(fundo, j.z); }
    await pagina.keyboard.up('ArrowUp'); await pagina.keyboard.up('ArrowRight');
    const fim = await anda(40);
    ok(Math.hypot(i.x - 2.9, i.z + 0.4) < 0.3 && fundo > -1.52 && fundo < -1.2 && fim.estado === 'parado', `de frente para a porteira, andando para o fundo: parou na porteira e não entrou no pasto (z mínimo ${fundo.toFixed(2)}; a cerca fica em -1,80)`);
    // durante a demonstração o teclado não comanda
    await pagina.evaluate(() => window.__sitio.demonstrar(true));
    await pagina.keyboard.down('ArrowLeft');
    const d1 = await anda(200);
    await pagina.keyboard.up('ArrowLeft');
    const semTecla = await (async () => { const o = await abrirPagina(amb, 'passo,demo', TELAS.paisagem); const r = await o.pagina.evaluate(() => window.__sitio.avancarAte(200)); await o.contexto.close(); return r; })();
    ok(!!d1.demo && d1.x === semTecla.x && d1.z === semTecla.z, 'durante a demonstração a seta apertada não muda nada');
    ok(erros.length === 0, 'nenhum erro no console', erros.join(' | '));
    todosErros.push(...erros);
    await contexto.close();
  }

  // ---------- 6. tempo real (sem modo passo) ----------
  titulo('Tempo real (o laço normal do jogo, sem modo passo)');
  {
    const { pagina, contexto, erros } = await abrirPagina(amb, 'demo', TELAS.celularRetrato);
    await pagina.waitForFunction(() => window.__sitio.info().passo >= 120, null, { timeout: 60000 });
    const i = await pagina.evaluate(() => window.__sitio.info());
    ok(i.passo >= 120 && !!i.demo && i.modo === 'perto', `com "#demo" numa tela de celular em pé a demonstração anda sozinha e a câmera começa de perto (passo ${i.passo}, modo ${i.modo})`);
    ok(erros.length === 0, 'nenhum erro no console', erros.join(' | '));
    await contexto.close();
  }
} finally { await amb.fechar(); }

console.log(falhas ? `\n${falhas} FALHA(S).` : '\nTudo certo.');
process.exit(falhas ? 1 : 0);
