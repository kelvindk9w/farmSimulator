// Refaz todas as imagens de capturas/ a partir dos moldes (código) e das pastas de texturas/.
// Todo conjunto encontrado em texturas/ entra na comparação e ganha uma imagem própria; os marcados com
// "uso": "teste" ficam de fora e servem só para a imagem de UV.
// Uso: node scripts/capturar.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { abrirPagina, raiz } from './navegador.mjs';
import { listarConjuntos } from './lib/conjuntos.mjs';

const dir = path.join(raiz, 'capturas');
fs.mkdirSync(dir, { recursive: true });
const cfg = JSON.parse(fs.readFileSync(path.join(raiz, 'config/molde.json'), 'utf8'));
const conjuntos = listarConjuntos(raiz);
const normais = conjuntos.filter((c) => !c.teste), teste = conjuntos.find((c) => c.teste);
if (!normais.length) throw new Error('nenhum conjunto em texturas/: rode antes "node scripts/gerar-texturas.mjs"');

const { browser, page } = await abrirPagina();

async function salvar(nome, shot, opts) {
  const t0 = Date.now();
  const meta = await page.evaluate(([n, o]) => window.MT.shot(n, o), [shot, opts]);
  await page.setViewportSize({ width: Math.ceil(meta.width), height: Math.ceil(meta.height) });
  const buf = await page.screenshot({ type: 'png' });
  const out = await sharp(buf).png({ compressionLevel: 9, effort: 10 }).toBuffer(); // recompressão sem perda
  const arquivo = path.join(dir, nome);
  fs.writeFileSync(arquivo, out.length < buf.length ? out : buf);
  const m = await sharp(arquivo).metadata();
  console.log(`capturas/${nome}  ${m.width}x${m.height}  ${(fs.statSync(arquivo).size / 1048576).toFixed(2)} MB  ${Date.now() - t0} ms`);
}

// 1. a comparação: molde puro e cada conjunto, lado a lado, com a mesma câmera
const letra = (i) => String.fromCharCode(97 + i);
const paineis = [
  { estado: 'molde', titulo: '(a) Molde sem textura', legenda: 'Só a forma, feita em código, num cinza único. As linhas finas marcam as arestas e os quadros de porta e janela.' },
  ...normais.map((c, i) => ({ estado: c.pasta, titulo: `(${letra(i + 1)}) Texturas "${c.def.nome}"`, legenda: `${c.def.descricao} Pasta texturas/${c.pasta}/.` })),
];
await salvar('molde-x-textura.png', 'comparacao', {
  paineis,
  titulo: 'Molde × textura',
  sub: 'A mesma cena, vista pela câmera do jogo, uma vez por acabamento. Os moldes 3D são feitos em código; as imagens 2D (parede, telhado, madeira, porta, janela, grama, terra arada) vêm de uma pasta. As texturas daqui são provisórias, pintadas por código.',
  rodape: `De ${paineis[1].titulo.slice(0, 3)} para ${paineis[paineis.length - 1].titulo.slice(0, 3)} a geometria e o código não mudam: só muda a pasta de imagens que é lida. A luz e as sombras são calculadas pelo jogo; não estão pintadas nas texturas.`,
});

// 2. uma imagem maior por estado
await salvar('estado-molde.png', 'estado', { estado: 'molde', w: 2400, h: 1560 });
for (const c of normais) await salvar(`estado-${c.pasta}.png`, 'estado', { estado: c.pasta, w: 2400, h: 1560 });

// 3. os moldes com o xadrez numerado
if (teste) {
  const d = cfg.densidade.unidadesDeMundoPorRepeticao;
  const br = (v) => v.toLocaleString('pt-BR');
  await salvar('molde-uv.png', 'uv', {
    conjunto: teste.pasta,
    titulo: 'Moldes com xadrez numerado (teste de UV)',
    sub: `Cada cor é um slot de material. Nos slots que repetem, uma repetição (16 casas, com a borda rosa em volta) cobre ${br(d)} × ${br(d)} unidades de mundo, então cada casa mede ${br(d / 4)} unidade em qualquer face: casas do mesmo tamanho em todas as faces querem dizer densidade igual. Os números crescem no sentido de U (para a direita) e de V (para cima); número em pé e legível quer dizer imagem na posição certa. Os três moldes estão na mesma escala.`,
    vistas: [
      {
        titulo: 'Vistos pela câmera do jogo',
        legendas: {
          casa: 'Parede: V para cima. Telhado: V sobe a água, do beiral para a cumeeira. Postes: V para cima; assoalho e viga: V ao longo do comprimento (números deitados). Porta e janelas: a imagem inteira, uma vez.',
          celeiro: 'Tábuas da parede: V para cima. Porta dupla: duas folhas com a mesma imagem; a da direita é espelhada de propósito (números ao contrário).',
          canteiro: 'Borda: V ao longo de cada tábua. Terra: vista de cima.',
        },
      },
      { titulo: 'Vistos por trás (câmera girada 180°)', giro: 225, legendas: { casa: 'Fundo e lateral esquerda: sem porta nem janela neste molde.', celeiro: 'Fundo e lateral esquerda.', canteiro: 'Igual dos quatro lados.' } },
    ],
  });
}

// 4. as imagens 2D de cada conjunto, em ladrilho 2x2
await salvar('texturas-2x2.png', 'texturas', {
  conjuntos: normais.map((c) => c.pasta),
  titulo: 'As imagens 2D de cada conjunto',
  sub: 'As que repetem aparecem em ladrilho 2 × 2 (quatro cópias encostadas), para mostrar que a emenda não aparece. Porta e janela são imagens únicas; o quadriculado é a parte transparente.',
});

await browser.close();
