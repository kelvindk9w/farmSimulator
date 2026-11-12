// Ferramenta de trabalho: folha de contato de um trecho da demonstração (ou do jogo parado).
// Uso: node tools/folha.mjs <saida.png> <de> <ate> [n=8] [foco=personagem] [meia=1.7] [escala=110] [hash extra]
//   de, ate: passos da simulação (60 por segundo). foco: 'personagem', id de objeto ou "x,y,z".
//   Variáveis de ambiente: LADO (px de cada quadro), COLUNAS, SEGUIR=1 (a câmera acompanha o foco), SEM_DEMO=1 (jogo parado, sem a demonstração).
import { abrirNavegador, abrirPagina, folhaDeContato } from './comum.mjs';
const [saida, de = '0', ate = '120', n = '8', foco = 'personagem', meia = '1.7', escala = '110', extra = ''] = process.argv.slice(2);
const amb = await abrirNavegador();
try {
  const { pagina, erros } = await abrirPagina(amb, (process.env.SEM_DEMO === '1' ? 'passo,sem-hud' : 'passo,demo,sem-hud') + (extra ? ',' + extra : ''), { width: 900, height: 900, deviceScaleFactor: 1 });
  const quadros = [];
  for (let i = 0; i < +n; i++) { const p = Math.round(+de + ((+ate - +de) * i) / Math.max(1, +n - 1)); quadros.push({ passo: p, rotulo: `${p} (${(p / 60).toFixed(2)} s)` }); }
  const f = foco.includes(',') ? foco.split(',').map(Number) : foco;
  await folhaDeContato(amb, pagina, { quadros, foco: f, meia: +meia, escala: +escala, saida, lado: +(process.env.LADO || 300), colunas: +(process.env.COLUNAS || Math.min(+n, 5)), seguir: process.env.SEGUIR === '1' });
  console.log(JSON.stringify(await pagina.evaluate(() => { const i = window.__sitio.info(); return { passo: i.passo, estado: i.estado, arte: i.arte, demo: i.demo }; })));
  if (erros.length) console.log('ERROS:\n' + erros.join('\n'));
} finally { await amb.fechar(); }
