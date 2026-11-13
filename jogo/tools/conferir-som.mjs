// Confere os sons de src/plataforma/som.js sem ouvir: toca cada um num contexto de áudio fora da tela
// (Chromium sem janela) e mede pico, volume médio e duração. Acusa som mudo, estourado ou comprido demais.
//   node tools/conferir-som.mjs
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exigir = createRequire(import.meta.url);
const esbuild = exigir('esbuild');
const { chromium } = exigir('playwright'); // já vem instalado na máquina

const pacote = await esbuild.build({
  entryPoints: [path.join(raiz, 'src/plataforma/som.js')],
  bundle: true, format: 'iife', globalName: 'Som', write: false,
});
const codigo = pacote.outputFiles[0].text;

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.addScriptTag({ content: codigo });
const medidas = await pagina.evaluate(async () => {
  const saida = [];
  const TAXA = 44100, SEG = 2;
  for (const nome of Object.keys(Som.SONS)) {
    const c = new OfflineAudioContext(1, TAXA * SEG, TAXA);
    Som.SONS[nome](c, c.destination, 0.01);
    const d = (await c.startRendering()).getChannelData(0);
    let pico = 0, soma = 0, fim = 0, ruim = false;
    for (let i = 0; i < d.length; i++) {
      const v = Math.abs(d[i]);
      if (!Number.isFinite(v)) { ruim = true; break; }
      if (v > pico) pico = v;
      soma += v * v;
      if (v > 0.002) fim = i;
    }
    const dur = fim / TAXA;
    saida.push({ nome, pico, medio: Math.sqrt(soma / Math.max(1, fim)), dur, ruim });
  }
  return { sons: saida, eventos: Som.POR_EVENTO };
});
await navegador.close();

let falhas = 0;
console.log('som           pico   médio  duração');
for (const m of medidas.sons) {
  const problemas = [];
  if (m.ruim) problemas.push('valor inválido');
  if (m.pico < 0.04) problemas.push('quase mudo');
  if (m.pico > 0.75) problemas.push('alto demais');
  if (m.dur > 1.3) problemas.push('comprido demais');
  if (m.dur < 0.03) problemas.push('curto demais');
  if (problemas.length) falhas++;
  console.log(`${m.nome.padEnd(12)}  ${m.pico.toFixed(2)}   ${m.medio.toFixed(3)}  ${m.dur.toFixed(2)} s  ${problemas.length ? 'FALHA: ' + problemas.join(', ') : 'ok'}`);
}
for (const [evento, nome] of Object.entries(medidas.eventos)) {
  if (!medidas.sons.some((m) => m.nome === nome)) { falhas++; console.log(`FALHA: o evento "${evento}" pede o som "${nome}", que não existe`); }
}
console.log(falhas ? `${falhas} problema(s).` : 'Sons conferidos.');
process.exit(falhas ? 1 : 0);
