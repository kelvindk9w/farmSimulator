// Peças comuns das ferramentas que abrem o protótipo num navegador sem janela (Chromium via Playwright).
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { servir } from './servir.mjs';

export const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const dist = path.join(raiz, 'dist');
export const capturas = path.join(raiz, 'capturas');
export const TELAS = {
  paisagem: { width: 1280, height: 720, deviceScaleFactor: 1 },
  celularRetrato: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  celularPaisagem: { width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

// Playwright já vem instalado na máquina; não entra no package.json.
export function playwright() { return createRequire(import.meta.url)('playwright'); }

export async function abrirNavegador() {
  if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('dist/ não existe: rode "npm run build" antes');
  const servidor = await servir(dist, 0);
  const navegador = await playwright().chromium.launch();
  return { servidor, navegador, fechar: async () => { await navegador.close(); await servidor.fechar(); } };
}

// abre uma página do protótipo; hash = opções ("passo,arte-molde"); devolve a página já pronta
export async function abrirPagina(amb, hash = '', tela = TELAS.paisagem, extra = {}) {
  const contexto = await amb.navegador.newContext({ viewport: { width: tela.width, height: tela.height }, deviceScaleFactor: tela.deviceScaleFactor || 1, isMobile: !!tela.isMobile, hasTouch: !!tela.hasTouch, ...extra });
  const pagina = await contexto.newPage();
  const erros = [];
  pagina.on('pageerror', (e) => erros.push(String(e && e.stack || e)));
  pagina.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  await pagina.goto(amb.servidor.url + (hash ? '#' + hash : ''));
  await pagina.waitForFunction(() => window.__sitio && (window.__sitio.pronto || window.__sitio.erro), null, { timeout: 60000 });
  const erro = await pagina.evaluate(() => window.__sitio.erro);
  if (erro) throw new Error('o protótipo não iniciou: ' + erro + '\n' + erros.join('\n'));
  return { pagina, contexto, erros };
}

// Folha de contato: vários instantes da simulação lado a lado, com a câmera presa num ponto.
//   quadros: [{ passo, rotulo }]   foco: [x, y, z] | id de objeto | 'personagem' (lido no primeiro quadro)
//   meia: meio lado do recorte, em unidades de mundo   escala: px de CSS por unidade   lado: px de cada célula na folha
//   seguir: a câmera acompanha o foco a cada quadro   alturaDoFoco: altura do centro do recorte quando o foco é um objeto
// A página tem de estar no modo "#passo" (a simulação só anda quando mandamos).
export async function folhaDeContato(amb, pagina, { quadros, foco = 'personagem', meia = 1.7, escala = 110, lado = 300, colunas = 0, titulo = '', saida, seguir = false, alturaDoFoco = 1.0 }) {
  const tela = pagina.viewportSize();
  const corte = Math.min(Math.round(meia * escala), Math.floor(Math.min(tela.width, tela.height) / 2) - 2);
  const celulas = [];
  let preso = false;
  for (const q of quadros) {
    await pagina.evaluate((n) => window.__sitio.avancarAte(n), q.passo);
    if (!preso || seguir) { await pagina.evaluate(([f, e, a]) => window.__sitio.fixar(f, e, a), [foco, escala, alturaDoFoco]); preso = true; } else await pagina.evaluate(() => window.__sitio.estatisticas());
    const buf = await pagina.screenshot({ clip: { x: tela.width / 2 - corte, y: tela.height / 2 - corte, width: corte * 2, height: corte * 2 } });
    celulas.push({ rotulo: q.rotulo ?? String(q.passo), img: buf });
  }
  await pagina.evaluate(() => window.__sitio.fixar(null));
  await montarFolha(celulas, { lado, colunas, titulo, saida });
  return saida;
}

// Monta uma folha (grade de imagens com um rótulo em cada uma) num PNG só, com o sharp.
//   celulas: [{ rotulo, img: Buffer PNG }]
export async function montarFolha(celulas, { lado = 300, colunas = 0, titulo = '', saida }) {
  const sharp = createRequire(import.meta.url)('sharp');
  const col = colunas || Math.min(celulas.length, 6), linhas = Math.ceil(celulas.length / col), vao = 4, topo = titulo ? 30 : 0;
  const W = col * (lado + vao) + vao, H = topo + linhas * (lado + vao) + vao;
  const xml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const pecas = [];
  let rotulos = '';
  for (let i = 0; i < celulas.length; i++) {
    const x = vao + (i % col) * (lado + vao), y = topo + vao + Math.floor(i / col) * (lado + vao);
    pecas.push({ input: await sharp(celulas[i].img).resize(lado, lado, { fit: 'cover' }).png().toBuffer(), left: x, top: y });
    const r = xml(celulas[i].rotulo || ''), larg = Math.round(r.length * 7.4 + 14);
    if (r) rotulos += `<rect x="${x + 4}" y="${y + 4}" width="${larg}" height="20" rx="6" fill="#fff9ec" fill-opacity="0.86"/><text x="${x + 11}" y="${y + 19}" font-family="DejaVu Sans, Arial, sans-serif" font-size="13" font-weight="bold" fill="#3a2a1c">${r}</text>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${titulo ? `<text x="10" y="21" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold" fill="#3a2a1c">${xml(titulo)}</text>` : ''}${rotulos}</svg>`;
  pecas.push({ input: Buffer.from(svg), left: 0, top: 0 });
  await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } }).composite(pecas).png({ compressionLevel: 9 }).toFile(saida);
  return saida;
}
