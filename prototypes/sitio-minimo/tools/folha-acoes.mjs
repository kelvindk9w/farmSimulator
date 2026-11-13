// Folha de contato com um quadro do meio de cada uma das oito interações, para um conjunto de arte qualquer.
// (tools/capturar.mjs faz esta mesma folha, com os mesmos quadros, só para os conjuntos "codigo", "molde" e "brinquedo".)
// Uso: node tools/folha-acoes.mjs <conjunto> [saida.png]      (antes: npm run build)
//   sem a saída, grava capturas/acoes-<conjunto>.png
import path from 'node:path';
import { abrirNavegador, abrirPagina, folhaDeContato, capturas } from './comum.mjs';
import { Mundo } from '../src/jogo/mundo.js';
import { Roteiro } from '../src/jogo/roteiro.js';

const conjunto = process.argv[2];
if (!conjunto) { console.error('Uso: node tools/folha-acoes.mjs <conjunto> [saida.png]'); process.exit(1); }
const saida = process.argv[3] || path.join(capturas, `acoes-${conjunto}.png`);

// linha do tempo da demonstração (só lógica): em que passo o personagem está em cada estado
const m = new Mundo(), r = new Roteiro(), linha = [];
for (let n = 0; n < 2400; n++) {
  r.passo(m); m.passo();
  linha.push({ n: m.n, e: m.personagem.visual().estado });
  if (r.fim && m.n > r.fimEm + 60) break;
}
// primeiro trecho contínuo de pelo menos 10 passos no estado "e": o passo em que ele começa
function comeco(e) {
  let de = -1;
  for (const x of linha) {
    if (x.e === e) { if (de < 0) de = x.n; } else if (de >= 0) { if (x.n - de >= 10) return de; de = -1; }
  }
  if (de < 0) throw new Error(`a demonstração não passa pelo estado "${e}"`);
  return de;
}
const noTempo = (e, t) => comeco(e) + Math.round(t * 60);
const quadros = [
  { passo: noTempo('girarManivela', 2.0), rotulo: 'Poço: tirar água' },
  { passo: noTempo('plantar', 0.84), rotulo: 'Canteiro: plantar' },
  { passo: noTempo('regar', 1.0), rotulo: 'Canteiro: regar' },
  { passo: noTempo('pegarOvo', 0.62), rotulo: 'Ninho: pegar o ovo' },
  { passo: comeco('dentro') - 24, rotulo: 'Celeiro: entrar para guardar' },
  { passo: noTempo('colherFruta', 1.16), rotulo: 'Laranjeira: colher' },
  { passo: noTempo('ordenhar', 1.4), rotulo: 'Vaca: ordenhar' },
  { passo: noTempo('colher', 0.92), rotulo: 'Canteiro: colher o milho' },
];

const amb = await abrirNavegador();
try {
  const { pagina, erros } = await abrirPagina(amb, `passo,demo,sem-hud,arte-${conjunto}`, { width: 900, height: 900, deviceScaleFactor: 1 });
  const arte = await pagina.evaluate(() => window.__sitio.info().conjunto);
  if (arte !== conjunto) throw new Error(`o jogo abriu com o conjunto "${arte}", não com "${conjunto}" (ele está registrado?)`);
  await folhaDeContato(amb, pagina, { quadros, foco: 'personagem', seguir: true, meia: 1.95, escala: 165, lado: 420, colunas: 4, titulo: `Sítio mínimo: um quadro do meio de cada interação (conjunto de arte "${conjunto}")`, saida });
  console.log('ok', path.relative(process.cwd(), saida), 'passos:', quadros.map((q) => q.passo).join(', '));
  if (erros.length) { console.log('ERROS:\n' + erros.join('\n')); process.exitCode = 1; }
} finally { await amb.fechar(); }
