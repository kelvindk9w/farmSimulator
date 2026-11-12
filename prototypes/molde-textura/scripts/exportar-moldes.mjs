// Exporta cada molde como moldes/<nome>.glb (geometria, UV e slots de material por nome; sem texturas).
// A exportação usa o GLTFExporter do three.js, que precisa do navegador.
import fs from 'node:fs';
import path from 'node:path';
import { abrirPagina, raiz } from './navegador.mjs';

const { browser, page } = await abrirPagina();
const dir = path.join(raiz, 'moldes');
fs.mkdirSync(dir, { recursive: true });
for (const nome of await page.evaluate(() => window.MT.moldes())) {
  const b64 = await page.evaluate((n) => window.MT.exportarGLB(n), nome);
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(path.join(dir, `${nome}.glb`), buf);
  console.log(`moldes/${nome}.glb  ${buf.length} bytes`);
}
await browser.close();
