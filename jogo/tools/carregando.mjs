// O fundo da tela de carregando (arte/carregando/fundo.png, a ilustração feita no Codex) vai para dist/carregando/
// como WebP dentro de um .js, porque a hospedagem de teste só aceita .html, .js, .json e .png (ARQUITETURA.md) e um
// PNG deste desenho pesa 4 a 6 vezes mais que o WebP com a mesma cara. Dois tamanhos:
//   carregando/fundo.js     a imagem inteira (computador, tablet)
//   carregando/fundo-m.js   pela metade (qualidade "leve": celular fraco e TV)
// Cada arquivo só chama window.__carga.fundo("data:image/webp;base64,...") (a parte de cima do index.html).
// Reaproveita o que já está lá se a imagem não mudou.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const QUALIDADE = 76; // WebP: 1672 x 941 fica com uns 90 kB; a metade, com uns 37 kB

export async function montarCarregando(pastaArte, pastaSaida) {
  const origem = path.join(pastaArte, 'carregando', 'fundo.png');
  if (!fs.existsSync(origem)) return { arquivos: [], reaproveitado: false, avisos: ['não há arte/carregando/fundo.png: a tela de carregando fica só com a cor de fundo'] };
  const st = fs.statSync(origem);
  const resumo = crypto.createHash('sha1').update(`v1|${QUALIDADE}|${st.size}|${Math.round(st.mtimeMs)}`).digest('hex').slice(0, 10);
  const arqResumo = path.join(pastaSaida, 'carregando.json');
  if (fs.existsSync(arqResumo)) {
    try {
      const velho = JSON.parse(fs.readFileSync(arqResumo, 'utf8'));
      if (velho.resumo === resumo && velho.arquivos.every((a) => fs.existsSync(path.join(pastaSaida, a.nome)))) return { ...velho, reaproveitado: true, avisos: [] };
    } catch { /* refaz */ }
  }
  fs.rmSync(pastaSaida, { recursive: true, force: true });
  fs.mkdirSync(pastaSaida, { recursive: true });
  const md = await sharp(origem).metadata();
  const arquivos = [];
  for (const [nome, w] of [['fundo.js', md.width], ['fundo-m.js', Math.round(md.width / 2)]]) {
    const webp = await sharp(origem).resize(w, null, { kernel: 'lanczos3' }).webp({ quality: QUALIDADE, effort: 6, smartSubsample: true }).toBuffer();
    const js = `window.__carga&&window.__carga.fundo("data:image/webp;base64,${webp.toString('base64')}");\n`;
    fs.writeFileSync(path.join(pastaSaida, nome), js);
    arquivos.push({ nome, webp: webp.length, js: js.length, l: w, a: Math.round((md.height * w) / md.width) });
  }
  const def = { resumo, arquivos };
  fs.writeFileSync(arqResumo, JSON.stringify(def));
  return { ...def, reaproveitado: false, avisos: [] };
}
