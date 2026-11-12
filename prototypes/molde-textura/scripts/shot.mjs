// Ferramenta de iteração: renderiza um "shot" e salva o PNG.
// Uso: node scripts/shot.mjs <shot> <saida.png> ['{"estado":"molde"}']
import { abrirPagina, fotografar } from './navegador.mjs';

const [nome, saida, json] = process.argv.slice(2);
const { browser, page } = await abrirPagina();
const t0 = Date.now();
const meta = await fotografar(page, nome, json ? JSON.parse(json) : {}, saida);
console.log('ok', saida, JSON.stringify({ ...meta, ms: Date.now() - t0 }));
await browser.close();
