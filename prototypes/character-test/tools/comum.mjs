// Utilidades comuns aos scripts Node da bancada.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const require = createRequire(import.meta.url);

export const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const repo = path.resolve(raiz, '../..');
export const cfg = JSON.parse(fs.readFileSync(path.join(raiz, 'config/bench.json'), 'utf8'));
export const cache = path.join(raiz, 'node_modules/.cache/bancada'); // temporários (fora do git)

// O Chromium headless desta máquina já expõe WebGL2 por software sem opções;
// as flags só deixam isso explícito em outras máquinas sem GPU.
export const GL_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

export function playwright() {
  return require('playwright');
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.wasm': 'application/wasm',
  '.png': 'image/png', '.glb': 'model/gltf-binary', '.pck': 'application/octet-stream', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.webm': 'video/webm', '.gif': 'image/gif', '.map': 'application/json',
};

// Servidor estático mínimo (sem cabeçalhos especiais: os dois builds não precisam de COOP/COEP).
// onRequest(urlPath, bytes) é chamado a cada arquivo servido (usado nas medições).
export function servir(dir, porta = 0, { onRequest = null, silencioso = true } = {}) {
  const base = path.resolve(dir);
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(base, p);
    if (!file.startsWith(base) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('não encontrado');
      if (!silencioso) console.log('404', p);
      return;
    }
    const buf = fs.readFileSync(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'content-length': buf.length, 'cache-control': 'no-store' });
    res.end(buf);
    if (onRequest) onRequest(p, buf.length);
    if (!silencioso) console.log('200', p, buf.length);
  });
  return new Promise((resolve) => server.listen(porta, '127.0.0.1', () => resolve({ server, porta: server.address().port, url: `http://127.0.0.1:${server.address().port}/`, fechar: () => new Promise((r) => server.close(r)) })));
}

export function copiarPasta(de, para) {
  fs.rmSync(para, { recursive: true, force: true });
  fs.mkdirSync(para, { recursive: true });
  fs.cpSync(de, para, { recursive: true });
}
