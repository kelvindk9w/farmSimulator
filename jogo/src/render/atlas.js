// O catálogo de arte em uso: o build junta as peças em páginas (dist/arte/<grupo>-<n>-<resumo>.png) e descreve
// cada quadro em atlas.json. Cada grupo só é baixado quando uma peça dele é pedida pela primeira vez.
// Peça que não existe (ou cuja página ainda não chegou) é desenhada pela figura de reserva (reserva.js).

export class Atlas {
  // def = { paginas: [{ arquivo, grupo, l, a }], pecas: { chave: { g, e, casa, apoio, qps, laco, q: [[pagina, x, y, w, h, dx, dy], ...] } } }
  constructor(def, base = './') {
    this.def = def || { paginas: [], pecas: {} };
    this.base = base;
    this.paginas = this.def.paginas.map((p) => ({ ...p, estado: 'nao', img: null, meia: null }));
    this.pecas = this.def.pecas;
    this.aoCarregar = null; // chamado quando uma página chega (a interface redesenha os ícones)
    this.falhas = [];
  }

  tem(chave) { return !!this.pecas[chave]; }
  peca(chave) { return this.pecas[chave] || null; }

  // pede as páginas do grupo da peça; devolve true se a peça já pode ser desenhada
  pronta(chave) {
    const p = this.pecas[chave];
    if (!p) return false;
    let ok = true;
    for (let i = 0; i < p.q.length; i++) {
      const pg = this.paginas[p.q[i][0]];
      if (pg.estado === 'nao') this._baixarGrupo(pg.grupo);
      if (pg.estado !== 'pronta') ok = false;
    }
    return ok;
  }

  _baixarGrupo(grupo) {
    for (const pg of this.paginas) {
      if (pg.grupo !== grupo || pg.estado !== 'nao') continue;
      pg.estado = 'carregando';
      const img = new Image();
      img.onload = () => {
        pg.img = img; pg.estado = 'pronta';
        // metade do tamanho, para a figura não serrilhar quando o zoom é pequeno
        try {
          const c = document.createElement('canvas');
          c.width = Math.max(1, img.width >> 1); c.height = Math.max(1, img.height >> 1);
          const g = c.getContext('2d');
          g.imageSmoothingQuality = 'high';
          g.drawImage(img, 0, 0, c.width, c.height);
          pg.meia = c;
        } catch (e) { pg.meia = null; }
        if (this.aoCarregar) this.aoCarregar(grupo);
      };
      img.onerror = () => { pg.estado = 'falhou'; this.falhas.push(pg.arquivo); console.warn('arte: a página ' + pg.arquivo + ' não carregou; as peças dela usam a figura de reserva'); };
      img.src = this.base + pg.arquivo;
    }
  }
  // baixa já todos os grupos (as ferramentas de captura esperam por isso)
  baixarTudo() { for (const pg of this.paginas) this._baixarGrupo(pg.grupo); }
  tudoPronto() { return this.paginas.every((p) => p.estado === 'pronta' || p.estado === 'falhou'); }

  // Desenha o quadro "quadro" da peça com o ponto de apoio em (sx, sy). S = pontos do canvas por unidade de mundo.
  // Devolve false se a peça não existe ou ainda não chegou (quem chama usa a reserva).
  desenhar(g, chave, quadro, sx, sy, S, espelhar, escalaY = 1) {
    const p = this.pecas[chave];
    if (!p) return false;
    const n = p.q.length, f = p.q[quadro < 0 ? 0 : quadro >= n ? n - 1 : quadro | 0], pg = this.paginas[f[0]];
    if (pg.estado !== 'pronta') { if (pg.estado === 'nao') this._baixarGrupo(pg.grupo); return false; }
    const k = S / p.e; // pontos do canvas por ponto da peça
    const meia = k <= 0.55 && pg.meia;
    const src = meia ? pg.meia : pg.img, d = meia ? 0.5 : 1;
    const dx = (f[5] - p.apoio[0]) * k, dy = (f[6] - p.apoio[1]) * k * escalaY, w = f[3] * k, h = f[4] * k * escalaY;
    if (espelhar) {
      g.save(); g.translate(sx, sy); g.scale(-1, 1);
      g.drawImage(src, f[1] * d, f[2] * d, f[3] * d, f[4] * d, dx, dy, w, h);
      g.restore();
    } else g.drawImage(src, f[1] * d, f[2] * d, f[3] * d, f[4] * d, sx + dx, sy + dy, w, h);
    return true;
  }

  // a caixa do quadro na tela, para saber se um toque caiu na figura: preenche out = [x0, y0, x1, y1]
  caixa(chave, quadro, sx, sy, S, out) {
    const p = this.pecas[chave];
    if (!p) return null;
    const f = p.q[Math.min(p.q.length - 1, Math.max(0, quadro | 0))], k = S / p.e;
    out[0] = sx + (f[5] - p.apoio[0]) * k; out[1] = sy + (f[6] - p.apoio[1]) * k; out[2] = out[0] + f[3] * k; out[3] = out[1] + f[4] * k;
    return out;
  }
}
