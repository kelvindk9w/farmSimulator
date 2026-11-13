// Apoio das ferramentas: ler e conferir os dados, servir dist/ e abrir o Chromium sem janela.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { prepararDados, listarProblemas } from '../src/nucleo/dados.js';

export const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// várias frentes montam e verificam ao mesmo tempo na mesma pasta: cada uma escolhe a sua saída
//   JOGO_DIST=dist-animais npm run build     (padrão: dist)
//   JOGO_CAPTURAS=capturas-animais           (padrão: capturas)
export const pastaDist = path.resolve(raiz, process.env.JOGO_DIST || 'dist');
export const pastaCapturas = path.resolve(raiz, process.env.JOGO_CAPTURAS || 'capturas');
// a montagem apaga o que houver na pasta de saída: só aceita nomes "dist" ou "dist-alguma-coisa"
if (!/^dist(-[\w.-]+)?$/.test(path.basename(pastaDist))) { console.error(`JOGO_DIST="${process.env.JOGO_DIST}": a pasta de saída tem de se chamar dist ou dist-alguma-coisa.`); process.exit(2); }
const OBRIGATORIOS = ['regras', 'itens', 'culturas', 'terras', 'niveis', 'missoes', 'loja'];

// lê todos os .json da pasta; com criarProvisorios, um arquivo obrigatório que falta nasce de testes/dados com a
// marca "_provisorio": true (nunca se escreve por cima de um arquivo que não tenha a marca)
export function lerDados(pasta, opc = {}) {
  if (opc.criarProvisorios) {
    fs.mkdirSync(pasta, { recursive: true });
    for (const nome of OBRIGATORIOS) {
      const arq = path.join(pasta, nome + '.json');
      if (fs.existsSync(arq)) continue;
      const base = JSON.parse(fs.readFileSync(path.join(raiz, 'testes/dados', nome + '.json'), 'utf8'));
      fs.writeFileSync(arq, JSON.stringify({ _provisorio: true, ...base }, null, 2) + '\n');
      console.log(`dados: ${nome}.json não existia; criei um provisório ("_provisorio": true)`);
    }
  }
  const bruto = {};
  for (const f of fs.readdirSync(pasta).sort()) {
    if (!f.endsWith('.json')) continue;
    try { bruto[f.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(pasta, f), 'utf8')); } catch (e) { bruto[f.slice(0, -5)] = { _erro: e.message }; console.log(`dados: ${f} não é um JSON válido (${e.message})`); }
  }
  return bruto;
}
export function conferirDados(bruto) {
  const r = prepararDados(bruto);
  for (const k in bruto) if (bruto[k] && bruto[k]._erro) r.problemas.unshift({ grave: OBRIGATORIOS.includes(k), arquivo: k + '.json', texto: 'JSON inválido: ' + bruto[k]._erro });
  return { dados: r.dados, problemas: r.problemas, texto: listarProblemas(r.problemas) };
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png' };
// serve uma pasta em 127.0.0.1; porta 0 = qualquer porta livre. Devolve { url, porta, fechar }
export function servir(pasta, porta = 0) {
  const srv = http.createServer((req, res) => {
    let caminho = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    if (caminho.endsWith('/')) caminho += 'index.html';
    const arq = path.join(pasta, path.normalize(caminho));
    if (!arq.startsWith(pasta) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('não achei ' + caminho); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(arq)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(arq).pipe(res);
  });
  return new Promise((ok, falha) => {
    srv.once('error', falha);
    srv.listen(porta, '127.0.0.1', () => ok({ porta: srv.address().port, url: `http://127.0.0.1:${srv.address().port}/`, fechar: () => new Promise((r) => srv.close(r)) }));
  });
}

// o Playwright vem da máquina (não é dependência do jogo)
export async function abrirNavegador() {
  let playwright;
  const req = createRequire(import.meta.url);
  for (const de of [undefined, '/opt/node-tools/node_modules', process.env.NODE_PATH].filter((x, i) => i === 0 || x)) {
    try { playwright = de ? createRequire(de + '/')('playwright') : req('playwright'); break; } catch { /* tenta o próximo */ }
  }
  if (!playwright) throw new Error('não achei o Playwright nesta máquina (npm i -g playwright, ou NODE_PATH apontando para ele)');
  return playwright.chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
}
export const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
