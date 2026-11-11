// Servidor estático simples para abrir os builds no navegador (ou no celular, na mesma rede).
// Uso: node tools/servir.mjs <pasta> [porta] [--rede]
//   --rede  escuta em todas as interfaces (para abrir do celular); sem isso, só em 127.0.0.1
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import fs from 'node:fs';

const args = process.argv.slice(2);
const rede = args.includes('--rede');
const [pasta, porta = '8080'] = args.filter((a) => !a.startsWith('--'));
if (!pasta || !fs.existsSync(pasta)) { console.error('Uso: node tools/servir.mjs <pasta> [porta] [--rede]'); process.exit(1); }
const base = path.resolve(pasta);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.wasm': 'application/wasm', '.png': 'image/png', '.glb': 'model/gltf-binary', '.pck': 'application/octet-stream', '.css': 'text/css; charset=utf-8', '.gif': 'image/gif', '.webm': 'video/webm' };

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(base, p);
  if (!file.startsWith(base) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('não encontrado'); return; }
  const buf = fs.readFileSync(file);
  res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'content-length': buf.length, 'cache-control': 'no-cache' });
  res.end(buf);
}).listen(+porta, rede ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`Servindo ${base}`);
  console.log(`  http://localhost:${porta}/`);
  if (rede) for (const lista of Object.values(os.networkInterfaces())) for (const i of lista) if (i.family === 'IPv4' && !i.internal) console.log(`  http://${i.address}:${porta}/`);
  console.log('Ctrl+C para parar.');
});
