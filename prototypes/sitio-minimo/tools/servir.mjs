// Servidor estático simples para abrir o build no navegador (ou no celular, na mesma rede).
// Uso: node tools/servir.mjs [pasta] [porta] [--rede]      (padrão: dist 8090)
//   --rede  escuta em todas as interfaces (para abrir do celular); sem isso, só em 127.0.0.1
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.gif': 'image/gif', '.webm': 'video/webm' };

// usado também pelas outras ferramentas (porta 0 = qualquer porta livre)
export function servir(pasta, porta = 0, host = '127.0.0.1') {
  const base = path.resolve(pasta);
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(base, p);
    if (!file.startsWith(base) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('não encontrado'); return; }
    const buf = fs.readFileSync(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'content-length': buf.length, 'cache-control': 'no-cache' });
    res.end(buf);
  });
  return new Promise((ok) => srv.listen(porta, host, () => ok({ srv, porta: srv.address().port, url: `http://127.0.0.1:${srv.address().port}/`, fechar: () => new Promise((f) => srv.close(f)) })));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const rede = args.includes('--rede');
  const [pasta = 'dist', porta = '8090'] = args.filter((a) => !a.startsWith('--'));
  if (!fs.existsSync(pasta)) { console.error(`A pasta "${pasta}" não existe. Rode "npm run build" antes.`); process.exit(1); }
  const s = await servir(pasta, +porta, rede ? '0.0.0.0' : '127.0.0.1');
  console.log(`Servindo ${path.resolve(pasta)}`);
  console.log(`  http://localhost:${s.porta}/`);
  if (rede) for (const lista of Object.values(os.networkInterfaces())) for (const i of lista) if (i.family === 'IPv4' && !i.internal) console.log(`  http://${i.address}:${s.porta}/`);
  console.log('Ctrl+C para parar.');
}
