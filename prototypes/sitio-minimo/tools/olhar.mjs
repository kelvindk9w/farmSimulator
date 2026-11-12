// Ferramenta de trabalho: tira uma foto do protótipo num passo qualquer.
// Uso: node tools/olhar.mjs <saida.png> [hash] [passo] [tela] [x,z,meiaLargura para recorte opcional]
import { abrirNavegador, abrirPagina, TELAS } from './comum.mjs';
const [saida, hash = 'passo', passo = '0', tela = 'paisagem'] = process.argv.slice(2);
const amb = await abrirNavegador();
try {
  const { pagina, erros } = await abrirPagina(amb, hash, TELAS[tela]);
  const info = await pagina.evaluate((n) => window.__sitio.avancarAte(n), +passo);
  await pagina.screenshot({ path: saida });
  console.log(JSON.stringify(info));
  console.log('problemas de arte:', JSON.stringify(await pagina.evaluate(() => window.__sitio.problemasDeArte())));
  console.log('estatisticas:', JSON.stringify(await pagina.evaluate(() => window.__sitio.estatisticas())));
  if (erros.length) console.log('ERROS:\n' + erros.join('\n'));
} finally { await amb.fechar(); }
