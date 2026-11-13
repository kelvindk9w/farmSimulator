// Leva as molduras da interface (arte/interface/molduras/*.png: 9 fatias e peças fixas, 3 px da imagem = 1 px do CSS
// no celular) para dist/molduras/, em dois tamanhos:
//   molduras/<nome>.png     inteira, recomprimida sem perda (a imagem fica igual, o arquivo menor)
//   molduras/m/<nome>.png   pela metade (qualidade "leve": celular fraco e TV; um quarto da memória)
// Os raios de sol (fundo da tela de nível) são um borrão de brilho: entram com 2/3 do tamanho (e 1/3 na leve).
// O CSS acha as fatias de cada tamanho em src/ui/estilo/pecas.js. Reaproveita o que já está lá se nada mudou.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const MENOR = { 'raios.png': 600 }; // lado da versão inteira (a meia é a metade disto)

export async function montarMolduras(pastaArte, pastaSaida) {
  const de = path.join(pastaArte, 'interface', 'molduras');
  if (!fs.existsSync(de)) return { arquivos: 0, inteira: 0, meia: 0, reaproveitado: false, avisos: ['não há arte/interface/molduras: a interface usa só cores'] };
  const nomes = fs.readdirSync(de).filter((f) => f.endsWith('.png')).sort();
  const h = crypto.createHash('sha1');
  h.update('v2');
  for (const f of nomes) { const st = fs.statSync(path.join(de, f)); h.update(`${f}|${st.size}|${Math.round(st.mtimeMs)}`); }
  const resumo = h.digest('hex').slice(0, 10), arqResumo = path.join(pastaSaida, 'molduras.json');
  if (fs.existsSync(arqResumo)) {
    try {
      const velho = JSON.parse(fs.readFileSync(arqResumo, 'utf8'));
      if (velho.resumo === resumo && nomes.every((f) => fs.existsSync(path.join(pastaSaida, f)) && fs.existsSync(path.join(pastaSaida, 'm', f)))) return { ...velho, reaproveitado: true, avisos: [] };
    } catch { /* refaz */ }
  }
  fs.rmSync(pastaSaida, { recursive: true, force: true });
  fs.mkdirSync(path.join(pastaSaida, 'm'), { recursive: true });
  let inteira = 0, meia = 0;
  const png = { compressionLevel: 9, effort: 10, adaptiveFiltering: true };
  for (const f of nomes) {
    const buf = fs.readFileSync(path.join(de, f)), md = await sharp(buf).metadata();
    const lado = MENOR[f], w = lado || md.width, hh = lado ? Math.round((md.height * lado) / md.width) : md.height;
    const a = await (lado ? sharp(buf).resize(w, hh, { kernel: 'lanczos3' }) : sharp(buf)).png(png).toBuffer();
    // a meia: lados arredondados (o CSS usa as fatias de pecas.js já divididas pelo mesmo fator)
    const b = await sharp(buf).resize(Math.round(w / 2), Math.round(hh / 2), { kernel: 'lanczos3' }).png(png).toBuffer();
    fs.writeFileSync(path.join(pastaSaida, f), a);
    fs.writeFileSync(path.join(pastaSaida, 'm', f), b);
    inteira += a.length; meia += b.length;
  }
  const def = { resumo, arquivos: nomes.length, inteira, meia };
  fs.writeFileSync(arqResumo, JSON.stringify(def));
  return { ...def, reaproveitado: false, avisos: [] };
}
