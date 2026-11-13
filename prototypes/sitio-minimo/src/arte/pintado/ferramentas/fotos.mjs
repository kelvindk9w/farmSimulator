// Fotos de trabalho do conjunto "pintado", tiradas com as peças de tools/comum.mjs (nenhuma ferramenta comum foi mudada).
// Uso (na pasta prototypes/sitio-minimo, depois de "npm run build"):
//   node src/arte/pintado/ferramentas/fotos.mjs acoes    [saida.png]   um quadro do meio de cada uma das oito interações
//   node src/arte/pintado/ferramentas/fotos.mjs perto    [saida.png]   cada objeto de perto, no estado da imagem-alvo
//   node src/arte/pintado/ferramentas/fotos.mjs estagios [saida.png]   o canteiro em cada fase do milho
//   node src/arte/pintado/ferramentas/fotos.mjs retrato  [saida.png]   a tela de um celular em pé
// CONJUNTO=brinquedo (ou outro) tira as mesmas fotos de outro conjunto, para comparar.
import path from 'node:path';
import fs from 'node:fs';
import { abrirNavegador, abrirPagina, folhaDeContato, montarFolha, TELAS, capturas } from '../../../../tools/comum.mjs';
import { Mundo } from '../../../jogo/mundo.js';
import { Roteiro } from '../../../jogo/roteiro.js';

const [modo = 'acoes', saidaPedida] = process.argv.slice(2);
const conjunto = process.env.CONJUNTO || 'pintado';
fs.mkdirSync(capturas, { recursive: true });
const saida = saidaPedida || path.join(capturas, { acoes: `acoes-${conjunto}.png`, perto: `perto-${conjunto}.png`, estagios: `estagios-${conjunto}.png`, retrato: `celular-retrato-${conjunto}.png` }[modo]);
const QUADRADA = { width: 900, height: 900, deviceScaleFactor: 1 };

// passo da demonstração em que cada ação está no meio (a lógica é determinística: roda aqui, sem navegador)
function passosDasAcoes() {
  const m = new Mundo(), r = new Roteiro(), linha = [];
  for (let n = 0; n < 2400; n++) { r.passo(m); m.passo(); linha.push({ n: m.n, e: m.personagem.visual().estado }); if (r.fim && m.n > r.fimEm + 60) break; }
  const trecho = (e) => { let de = -1; for (const x of linha) { if (x.e === e) { if (de < 0) de = x.n; } else if (de >= 0) { if (x.n - de >= 10) return [de, x.n - 1]; de = -1; } } return null; };
  const noTempo = (e, t) => trecho(e)[0] + Math.round(t * 60);
  return [
    { passo: noTempo('girarManivela', 2.0), rotulo: 'Poço: tirar água' },
    { passo: noTempo('plantar', 0.84), rotulo: 'Canteiro: plantar' },
    { passo: noTempo('regar', 1.0), rotulo: 'Canteiro: regar' },
    { passo: noTempo('pegarOvo', 0.62), rotulo: 'Ninho: pegar o ovo' },
    { passo: trecho('dentro')[0] - 24, rotulo: 'Celeiro: entrar para guardar' },
    { passo: noTempo('colherFruta', 1.16), rotulo: 'Laranjeira: colher' },
    { passo: noTempo('ordenhar', 1.4), rotulo: 'Vaca: ordenhar' },
    { passo: noTempo('colher', 0.92), rotulo: 'Canteiro: colher o milho' },
  ];
}

const amb = await abrirNavegador();
try {
  if (modo === 'acoes') {
    const { pagina, erros } = await abrirPagina(amb, `passo,demo,sem-hud,arte-${conjunto}`, QUADRADA);
    await folhaDeContato(amb, pagina, { quadros: passosDasAcoes(), foco: 'personagem', seguir: true, meia: 1.95, escala: 165, lado: 420, colunas: 4, titulo: `Sítio mínimo: um quadro do meio de cada interação (conjunto de arte "${conjunto}")`, saida });
    if (erros.length) console.log('ERROS:\n' + erros.join('\n'));
  } else if (modo === 'retrato') {
    const { pagina, erros } = await abrirPagina(amb, `passo,arte-${conjunto}`, TELAS.celularRetrato);
    await pagina.evaluate(() => window.__sitio.avancarAte(300));
    await pagina.screenshot({ path: saida });
    if (erros.length) console.log('ERROS:\n' + erros.join('\n'));
  } else {
    const { pagina, erros } = await abrirPagina(amb, `passo,sem-hud,arte-${conjunto}`, QUADRADA);
    const ler = () => pagina.evaluate(() => { const s = window.__sitio; return { info: s.info(), obj: s.objetos() }; });
    const andar = (n) => pagina.evaluate((k) => { const s = window.__sitio; s.avancarAte(s.info().passo + k); }, n);
    const ate = async (nome, cond, max = 60 * 90) => { for (let n = 0; n <= max; n += 20) { const e = await ler(); if (cond(e)) return e; await andar(20); } throw new Error('o sítio não chegou a: ' + nome); };
    const tocar = (id) => pagina.evaluate((i) => window.__sitio.tocar(i), id);
    const livre = (e) => e.info.estado === 'parado';
    const celulas = [];
    const foto = async (rotulo, foco, escala, altura = 1, meia = 280) => {
      await pagina.evaluate(([f, e, a]) => window.__sitio.fixar(f, e, a), [foco, escala, altura]);
      celulas.push({ rotulo, img: await pagina.screenshot({ clip: { x: 450 - meia, y: 450 - meia, width: meia * 2, height: meia * 2 } }) });
    };
    if (modo === 'estagios') {
      const C = 'canteiro2', f = (r) => foto(r, C, 190, 0.7);
      await andar(30); await f('vazio');
      await tocar('poco'); await andar(20); await ate('regador cheio', (e) => e.info.contadores.agua === 3 && livre(e));
      await tocar(C); await andar(20); await ate('semeado', (e) => e.obj[C].estado === 'semeado' && livre(e));
      await f('semeado (terra seca)');
      await tocar(C); await andar(20); await ate('regado', (e) => e.info.contadores[C + '.molhado'] === true && livre(e));
      await f('semeado (terra molhada)');
      await ate('broto', (e) => e.obj[C].estado === 'broto'); await andar(60); await f('broto (começo)'); await andar(240); await f('broto (fim)');
      await ate('crescendo', (e) => e.obj[C].estado === 'crescendo'); await andar(60); await f('crescendo (começo)'); await andar(300); await f('crescendo (fim)');
      await ate('pronto', (e) => e.obj[C].estado === 'pronto'); await andar(120); await f('pronto');
      await montarFolha(celulas, { lado: 420, colunas: 4, titulo: `Canteiro: as fases do milho (conjunto de arte "${conjunto}")`, saida });
    } else {
      // o mesmo estado da comparação com a imagem-alvo (tools/comparar.mjs)
      await tocar('canteiro1'); await andar(20); await ate('canteiro 1 semeado', (e) => e.obj.canteiro1.estado === 'semeado' && livre(e));
      await tocar('poco'); await andar(20); await ate('regador cheio', (e) => e.info.contadores.agua === 3 && livre(e));
      await tocar('canteiro2'); await andar(20); await ate('canteiro 2 semeado', (e) => e.obj.canteiro2.estado === 'semeado' && livre(e));
      await tocar('canteiro2'); await andar(20); await ate('canteiro 2 regado', (e) => e.info.contadores['canteiro2.molhado'] === true && livre(e));
      await ate('milho pronto e ovo no ninho', (e) => e.obj.canteiro2.estado === 'pronto' && e.info.contadores['ninho.ovos'] > 0 && livre(e));
      await andar(120);
      // escala 186 px por unidade: mais perto do que o jogo chega num celular (62 px de CSS e no máximo 2 pixels de tela por ponto = 124)
      await foto('celeiro', 'celeiro', 92, 2.0); await foto('laranjeira', 'arvore', 105, 2.2); await foto('poço', 'poco', 150, 1.3); await foto('vaca', 'vaca', 186, 0.8);
      await foto('personagem', 'personagem', 186, 0.85, 200); await foto('galinha branca', 'galinha1', 186, 0.3, 140); await foto('galinha caramelo', 'galinha2', 186, 0.3, 140); await foto('ninho', 'ninho', 186, 0.2, 140);
      await foto('canteiro semeado', 'canteiro1', 186, 0.3, 240); await foto('canteiro com milho pronto', 'canteiro2', 170, 0.9); await foto('cerca e barranco', [5.2, 0.2, -1.6], 150); await foto('caminho, grama e barranco', [1.5, 0, 4.2], 110);
      await montarFolha(celulas, { lado: 420, colunas: 4, titulo: `Cada objeto de perto (conjunto de arte "${conjunto}")`, saida });
    }
    if (erros.length) console.log('ERROS:\n' + erros.join('\n'));
  }
  console.log('gravou', path.relative(process.cwd(), saida));
} finally { await amb.fechar(); }
