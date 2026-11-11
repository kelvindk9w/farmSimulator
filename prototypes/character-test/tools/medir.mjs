// Mede as quatro variantes no Chromium sem tela e grava medidas.json (+ a tabela do README).
//   - o que o navegador precisa baixar para começar (bruto, gzip, brotli), motor e arte separados
//   - tempo da navegação até o primeiro quadro desenhado (cache frio, servidor local)
//   - chamadas de desenho e triângulos por quadro; memória de textura das folhas de sprites
// ATENÇÃO: os tempos saem de renderização por software num servidor; NÃO são desempenho de celular.
// Uso: node tools/medir.mjs [--rodadas=5]
import { createHash } from 'node:crypto';
import zlib from 'node:zlib';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { raiz, cfg, cache, playwright, GL_ARGS } from './comum.mjs';
import { VARIANTES, PASTAS, conferirBuilds, subirServidores, abrir } from './variantes.mjs';

const rodadas = +((process.argv.find((a) => a.startsWith('--rodadas=')) || '').slice(10) || 5);
const TELA = { largura: 800, altura: 450, dsf: 1 };
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- tamanhos comprimidos (com cache, o brotli do .wasm demora) ----------
fs.mkdirSync(cache, { recursive: true });
const arqCache = path.join(cache, 'compressao.json');
const memo = fs.existsSync(arqCache) ? JSON.parse(fs.readFileSync(arqCache, 'utf8')) : {};
function tamanhos(arquivo) {
  const buf = fs.readFileSync(arquivo);
  const h = createHash('sha1').update(buf).digest('hex');
  if (!memo[h]) {
    memo[h] = {
      raw: buf.length,
      gzip: zlib.gzipSync(buf, { level: 9 }).length,
      brotli: zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11, [zlib.constants.BROTLI_PARAM_LGWIN]: 24, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length } }).length,
    };
    fs.writeFileSync(arqCache, JSON.stringify(memo));
  }
  return memo[h];
}
const soma = (lista) => lista.reduce((s, a) => ({ raw: s.raw + a.raw, gzip: s.gzip + a.gzip, brotli: s.brotli + a.brotli }), { raw: 0, gzip: 0, brotli: 0 });
// "motor" = página + código/runtime; "arte" = modelos, folhas, JSON e, no Godot, o .pck (que também leva os scripts do projeto)
const grupo = (motor, p) => (motor === 'three' ? (p.startsWith('/assets/') ? 'arte' : 'motor') : (p.endsWith('.pck') ? 'arte' : 'motor'));
const mediana = (v) => { const o = [...v].sort((a, b) => a - b); return o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2; };

conferirBuilds();
const { chromium } = playwright();
let pedidos = [];
const servidores = await subirServidores((motor, p, n) => pedidos.push({ motor, p, n }));
const browser = await chromium.launch({ args: GL_ARGS });
const resultado = {
  gerado: new Date().toISOString(),
  aviso: 'Tempos medidos no Chromium sem tela, com WebGL por software (sem placa de vídeo), num servidor, com os arquivos vindos de 127.0.0.1 sem compressão. Servem para comparar as variantes entre si nesta máquina; NÃO são desempenho de celular.',
  ambiente: {}, metodo: { rodadas, tela: `${TELA.largura}x${TELA.altura} @${TELA.dsf}x`, primeiroQuadro: 'performance.now() logo após o primeiro quadro desenhado (contexto novo a cada rodada, cache vazio)', desenho: 'no passo 131 do roteiro (andando), sem a interface por cima' },
  variantes: {},
};

try {
  for (const v of VARIANTES) {
    process.stdout.write(`${v.nome}: `);
    const r = { nome: v.nome };
    // --- carga a frio: arquivos e tempo ---
    const tempos = [];
    let arquivos = null;
    for (let k = 0; k < rodadas; k++) {
      pedidos = [];
      const a = await abrir(browser, servidores, v, { ...TELA });
      tempos.push(a.primeiroQuadroMs);
      await dormir(1200); // pega o que ainda for buscado logo depois de começar
      if (a.erros.length) (r.erros ||= []).push(...a.erros);
      if (k === 0) {
        if (v.motor === 'three') resultado.ambiente.webgl ||= await a.page.evaluate(() => { const gl = document.createElement('canvas').getContext('webgl2'); const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); });
        arquivos = pedidos.filter((p) => p.motor === v.motor).map((p) => p.p);
      }
      await a.fechar();
      process.stdout.write('.');
    }
    const unicos = [...new Set(arquivos)];
    const lista = unicos.map((p) => ({ caminho: p.replace(/^\//, ''), grupo: grupo(v.motor, p), ...tamanhos(path.join(PASTAS[v.motor], p)) }));
    r.download = { total: soma(lista), motor: soma(lista.filter((a) => a.grupo === 'motor')), arte: soma(lista.filter((a) => a.grupo === 'arte')), arquivos: lista };
    r.primeiroQuadroMs = { mediana: Math.round(mediana(tempos)), min: Math.round(Math.min(...tempos)), max: Math.round(Math.max(...tempos)), rodadas: tempos.map((t) => Math.round(t)) };

    // --- desenho por quadro e memória ---
    const a = await abrir(browser, servidores, v, { ...TELA, params: { demo: 1, passo: 1, hud: 0 } });
    await a.passoPara(131);
    await dormir(v.motor === 'godot' ? 700 : 0);
    const s = await a.stats();
    r.desenho = { chamadas: s.drawCalls, triangulos: s.triangles };
    if (v.modo === '2d') r.texturas = { folhas: s.sheets, bytes: s.textureBytes };
    if (v.motor === 'three' && v.modo === '3d') { r.modelo = s.character; r.malhaBytes = s.geometryBytes; r.texturas = { bytes: s.textureBytes }; }
    if (v.motor === 'godot') {
      r.godot = { memoriaTextura: s.textureMem, memoriaBuffers: s.bufferMem, memoriaVideo: s.videoMem, objetos: s.objects };
      if (v.modo === '3d') r.modelo = { clips: s.clipes, missing: s.faltando, headBone: s.ossoCabeca, bones: s.ossos, materiaisCorPorVertice: s.materiaisCorPorVertice };
      else r.desenho.canvas = { chamadas: s.canvasDrawCalls, primitivas: s.canvasPrimitives };
    }
    await a.fechar();
    if (v.modo === '2d') { // com a folha da variante B carregada
      const b = await abrir(browser, servidores, v, { ...TELA, params: { demo: 1, passo: 1, hud: 0, visual: 1 } });
      await b.passoPara(131); await dormir(v.motor === 'godot' ? 700 : 0);
      const sb = await b.stats();
      r.texturas.comVarianteB = { folhas: sb.sheets, bytes: sb.textureBytes };
      await b.fechar();
    }
    if (v.motor === 'godot') { // a interface do Godot é desenhada pelo motor: quanto ela acrescenta
      const c = await abrir(browser, servidores, v, { ...TELA, params: { demo: 1, passo: 1 } });
      await c.passoPara(131); await dormir(700);
      const sc = await c.stats();
      r.desenho.comInterface = { chamadas: sc.drawCalls, triangulos: sc.triangles };
      await c.fechar();
    }
    resultado.variantes[v.id] = r;
    console.log(` primeiro quadro ${r.primeiroQuadroMs.mediana} ms · ${(r.download.total.raw / 1024).toFixed(0)} KB · ${r.desenho.chamadas} chamadas · ${r.desenho.triangulos} triângulos`);
  }
  resultado.ambiente.chromium = browser.version();
} finally {
  await browser.close();
  await servidores.fechar();
}

// pacotes do Godot com uma rota só (gerados pelo build, não usados pelo jogo)
for (const [id, arq] of [['godot-3d', 'so-3d.pck'], ['godot-2d', 'so-2d.pck']]) {
  const f = path.join(raiz, 'godot/build/medida', arq);
  if (fs.existsSync(f)) resultado.variantes[id].pckSoDestaRota = tamanhos(f);
}
// arquivos de arte de origem (o que o artista entrega), para referência
const arte = (pasta) => fs.readdirSync(path.join(raiz, 'assets', pasta), { recursive: true }).map((f) => path.join(raiz, 'assets', pasta, f)).filter((f) => fs.statSync(f).isFile()).map((f) => ({ caminho: path.relative(path.join(raiz, 'assets'), f), ...tamanhos(f) }));
resultado.arteDeOrigem = { '3d': arte('3d'), '2d': arte('2d') };
const cpus = os.cpus();
const godotV = process.env.GODOT ? spawnSync(process.env.GODOT, ['--version'], { encoding: 'utf8' }).stdout?.trim() : null;
Object.assign(resultado.ambiente, {
  cpu: `${cpus[0]?.model || '?'} × ${cpus.length}`, sistema: `${os.type()} ${os.release()}`, node: process.version,
  three: JSON.parse(fs.readFileSync(path.join(raiz, 'node_modules/three/package.json'), 'utf8')).version,
  godot: godotV || (fs.existsSync(path.join(raiz, 'godot/build/versao.txt')) ? fs.readFileSync(path.join(raiz, 'godot/build/versao.txt'), 'utf8').trim() : 'ver README'),
});
fs.writeFileSync(path.join(raiz, 'medidas.json'), JSON.stringify(resultado, null, 2) + '\n');

// ---------- tabela para o README ----------
const kb = (n) => (n >= 1000 * 1024 ? (n / 1024 / 1024).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MB' : (n / 1024).toLocaleString('pt-BR', { maximumFractionDigits: n < 10 * 1024 ? 1 : 0 }) + ' KB');
const tres = (t) => `${kb(t.raw)} / ${kb(t.gzip)} / ${kb(t.brotli)}`;
const V = VARIANTES.map((v) => resultado.variantes[v.id]);
const linha = (titulo, f) => `| ${titulo} | ${V.map(f).join(' | ')} |`;
const md = [
  `| | ${VARIANTES.map((v) => v.nome).join(' | ')} |`,
  `|---|${VARIANTES.map(() => '---:').join('|')}|`,
  linha('**Download para começar** (bruto / gzip / brotli)', (r) => `**${tres(r.download.total)}**`),
  linha('— motor e código', (r) => tres(r.download.motor)),
  linha('— arte e dados', (r) => tres(r.download.arte)),
  linha('— arquivos buscados', (r) => String(r.download.arquivos.length)),
  linha('Godot: `.pck` se só esta rota fosse publicada', (r) => (r.pckSoDestaRota ? tres(r.pckSoDestaRota) : '—')),
  linha(`**Primeiro quadro** (mediana de ${rodadas}; mín–máx)`, (r) => `**${r.primeiroQuadroMs.mediana} ms** (${r.primeiroQuadroMs.min}–${r.primeiroQuadroMs.max})`),
  linha('Chamadas de desenho por quadro (só a cena)', (r) => String(r.desenho.chamadas)),
  linha('Triângulos por quadro (só a cena)', (r) => r.desenho.triangulos.toLocaleString('pt-BR')),
  linha('— com a interface do próprio motor', (r) => (r.desenho.comInterface ? `${r.desenho.comInterface.chamadas} chamadas, ${r.desenho.comInterface.triangulos.toLocaleString('pt-BR')} triângulos` : 'interface em HTML (fora da conta)')),
  linha('Memória de textura das folhas (RGBA sem compressão)', (r) => (r.texturas && r.texturas.folhas ? `${kb(r.texturas.bytes)} (${r.texturas.folhas} folhas); ${kb(r.texturas.comVarianteB.bytes)} com a variante B` : (r.malhaBytes ? `sem texturas; malhas: ${kb(r.malhaBytes)}` : 'sem texturas'))),
].join('\n');
const detalhes = VARIANTES.map((v) => {
  const r = resultado.variantes[v.id];
  return `**${v.nome}**\n\n| arquivo | grupo | bruto | gzip | brotli |\n|---|---|---:|---:|---:|\n` + r.download.arquivos.map((a) => `| \`${a.caminho}\` | ${a.grupo} | ${kb(a.raw)} | ${kb(a.gzip)} | ${kb(a.brotli)} |`).join('\n');
}).join('\n\n');
const bloco = `${md}\n\nMedido em ${resultado.gerado.slice(0, 10)} · Chromium ${resultado.ambiente.chromium} sem tela · WebGL: ${resultado.ambiente.webgl} · ${resultado.ambiente.cpu} · Three.js ${resultado.ambiente.three} · Godot ${resultado.ambiente.godot} · tela ${resultado.metodo.tela}.\n\n<details><summary>Arquivos buscados por variante</summary>\n\n${detalhes}\n\n</details>`;
console.log('\n' + md + '\n');
const readme = path.join(raiz, 'README.md');
if (fs.existsSync(readme)) {
  const t = fs.readFileSync(readme, 'utf8');
  const A = '<!-- medidas:inicio -->', B = '<!-- medidas:fim -->';
  if (t.includes(A) && t.includes(B)) { fs.writeFileSync(readme, t.slice(0, t.indexOf(A) + A.length) + '\n' + bloco + '\n' + t.slice(t.indexOf(B))); console.log('README.md atualizado.'); }
}
console.log('medidas.json gravado.');
