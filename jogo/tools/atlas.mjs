// Junta as peças do catálogo de arte (arte/catalogo/<grupo>.json) em páginas de atlas, uma ou mais por grupo.
// Cada peça é uma tira de quadros lado a lado, todos do tamanho da "casa"; aqui cada quadro perde a borda vazia
// e vai para a página com 2 pontos de folga. O jogo recebe a descrição em atlas.json (formato em src/render/atlas.js).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const LADO = 2048, FOLGA = 2;

function resumoDe(partes) { const h = crypto.createHash('sha1'); for (const p of partes) h.update(p); return h.digest('hex').slice(0, 10); }

// lê os catálogos; devolve { grupos: { nome: { escala, pecas } }, entradas (para o resumo), avisos }
export function lerCatalogos(pastaArte) {
  const grupos = {}, entradas = [], avisos = [];
  const pasta = path.join(pastaArte, 'catalogo');
  if (!fs.existsSync(pasta)) return { grupos, entradas, avisos };
  for (const f of fs.readdirSync(pasta).filter((x) => x.endsWith('.json')).sort()) {
    const nome = f.slice(0, -5);
    let cat;
    try { cat = JSON.parse(fs.readFileSync(path.join(pasta, f), 'utf8')); } catch (e) { avisos.push(`catálogo ${f}: JSON inválido (${e.message}); grupo ignorado`); continue; }
    if (!cat || typeof cat.pecas !== 'object') { avisos.push(`catálogo ${f}: falta "pecas"; grupo ignorado`); continue; }
    const pecas = {};
    for (const [chave, p] of Object.entries(cat.pecas)) {
      const arq = path.join(pastaArte, p.arquivo || '');
      if (!p.arquivo || !fs.existsSync(arq)) { avisos.push(`${chave}: o arquivo "${p.arquivo}" não existe (o jogo usa a figura de reserva)`); continue; }
      if (!(Array.isArray(p.casa) && p.casa[0] > 0 && p.casa[1] > 0) || !Array.isArray(p.apoio)) { avisos.push(`${chave}: faltam "casa" e "apoio"; peça ignorada`); continue; }
      const st = fs.statSync(arq);
      entradas.push(`${chave}|${JSON.stringify(p)}|${st.size}|${Math.round(st.mtimeMs)}`);
      pecas[chave] = { ...p, quadros: p.quadros >= 1 ? Math.round(p.quadros) : 1, caminho: arq };
    }
    grupos[nome] = { escala: cat.escala > 0 ? cat.escala : 128, pecas };
    entradas.push(`grupo|${nome}|${cat.escala}`);
  }
  return { grupos, entradas, avisos };
}

// caixa do que não é transparente num quadro (dados RGBA); null se o quadro é vazio
function caixaDoQuadro(dados, larg, x0, cw, ch) {
  let xa = cw, ya = ch, xb = -1, yb = -1;
  for (let y = 0; y < ch; y++) {
    const linha = (y * larg + x0) * 4 + 3;
    for (let x = 0; x < cw; x++) if (dados[linha + x * 4] > 6) { if (x < xa) xa = x; if (x > xb) xb = x; if (y < ya) ya = y; if (y > yb) yb = y; }
  }
  return xb < 0 ? null : { x: xa, y: ya, w: xb - xa + 1, h: yb - ya + 1 };
}

// monta as páginas em pastaSaida (dist/arte) e devolve a descrição; reaproveita o que já está lá se nada mudou
export async function montarAtlas(pastaArte, pastaSaida) {
  const { grupos, entradas, avisos } = lerCatalogos(pastaArte);
  const resumo = resumoDe(['v3', ...entradas]);
  const arqDef = path.join(pastaSaida, 'atlas.json');
  if (fs.existsSync(arqDef)) {
    try {
      const velho = JSON.parse(fs.readFileSync(arqDef, 'utf8'));
      if (velho.resumo === resumo && velho.paginas.every((p) => fs.existsSync(path.join(pastaSaida, '..', p.arquivo)))) return { def: velho, avisos, reaproveitado: true };
    } catch { /* refaz */ }
  }
  fs.rmSync(pastaSaida, { recursive: true, force: true });
  fs.mkdirSync(pastaSaida, { recursive: true });
  const def = { resumo, paginas: [], pecas: {} };

  for (const [grupo, G] of Object.entries(grupos)) {
    // 1. recorta os quadros
    const quadros = [];
    for (const [chave, p] of Object.entries(G.pecas)) {
      let img;
      try { img = await sharp(p.caminho).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); } catch (e) { avisos.push(`${chave}: não deu para ler "${p.arquivo}" (${e.message})`); continue; }
      const { data, info } = img, cw = p.casa[0], ch = p.casa[1];
      if (info.width < cw * p.quadros || info.height < ch) { avisos.push(`${chave}: a imagem tem ${info.width}x${info.height}, menor que ${p.quadros} quadros de ${cw}x${ch}; peça ignorada`); continue; }
      const peca = def.pecas[chave] = { g: grupo, e: G.escala, casa: [cw, ch], apoio: [p.apoio[0], p.apoio[1]], qps: p.qps > 0 ? p.qps : 8, laco: p.laco !== false, q: [] };
      for (let i = 0; i < p.quadros; i++) {
        const c = caixaDoQuadro(data, info.width, i * cw, cw, ch) || { x: 0, y: 0, w: 1, h: 1 };
        const q = [0, 0, 0, c.w, c.h, c.x, c.y];
        peca.q.push(q);
        quadros.push({ q, w: c.w, h: c.h, origem: { dados: data, larg: info.width, x: i * cw + c.x, y: c.y } });
      }
    }
    // 2. arruma em prateleiras, dos mais altos para os mais baixos
    quadros.sort((a, b) => b.h - a.h || b.w - a.w);
    const paginas = [];
    let pg = null, x = 0, y = 0, alto = 0;
    const nova = () => { pg = { itens: [], l: 0, a: 0 }; paginas.push(pg); x = FOLGA; y = FOLGA; alto = 0; };
    nova();
    for (const f of quadros) {
      if (f.w + 2 * FOLGA > LADO || f.h + 2 * FOLGA > LADO) { avisos.push(`um quadro de ${f.w}x${f.h} não cabe numa página de ${LADO}: fica de fora`); f.q[3] = f.q[4] = 1; continue; }
      if (x + f.w + FOLGA > LADO) { x = FOLGA; y += alto + FOLGA; alto = 0; }
      if (y + f.h + FOLGA > LADO) nova();
      f.px = x; f.py = y; f.pagina = pg;
      pg.itens.push(f);
      x += f.w + FOLGA; alto = Math.max(alto, f.h);
      pg.l = Math.max(pg.l, f.px + f.w + FOLGA); pg.a = Math.max(pg.a, f.py + f.h + FOLGA);
    }
    // 3. pinta e grava cada página
    for (const p of paginas) {
      if (!p.itens.length) continue;
      const buf = Buffer.alloc(p.l * p.a * 4);
      for (const f of p.itens) {
        const o = f.origem;
        for (let yy = 0; yy < f.h; yy++) {
          const de = ((o.y + yy) * o.larg + o.x) * 4;
          o.dados.copy(buf, ((f.py + yy) * p.l + f.px) * 4, de, de + f.w * 4);
        }
      }
      const png = await sharp(buf, { raw: { width: p.l, height: p.a, channels: 4 } }).png({ compressionLevel: 9, effort: 7 }).toBuffer();
      const nome = `${grupo}-${paginas.indexOf(p) + 1}-${resumoDe([png])}.png`;
      fs.writeFileSync(path.join(pastaSaida, nome), png);
      const indice = def.paginas.length;
      def.paginas.push({ arquivo: 'arte/' + nome, grupo, l: p.l, a: p.a });
      for (const f of p.itens) { f.q[0] = indice; f.q[1] = f.px; f.q[2] = f.py; }
    }
  }
  fs.writeFileSync(arqDef, JSON.stringify(def));
  return { def, avisos, reaproveitado: false };
}
