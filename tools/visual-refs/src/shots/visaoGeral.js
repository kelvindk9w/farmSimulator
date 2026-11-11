// F: visão geral (folha de contato) com miniaturas legendadas de todas as imagens.
export async function visaoGeral(o = {}) {
  const W = 1920;
  document.body.innerHTML = '';
  document.body.style.cssText = 'margin:0;background:#f6efe2;font-family:Inter,sans-serif;color:#4a2f1b';
  const pg = document.createElement('div');
  pg.style.cssText = `width:${W}px;padding:34px 40px 34px;box-sizing:border-box`;
  pg.innerHTML = `<h1 style="font-size:44px;font-weight:900;margin:0 0 4px">Referências visuais — visão geral</h1>
    <p style="font-size:19.5px;font-weight:600;opacity:.78;margin:0 0 8px;line-height:1.35;max-width:1700px">${o.sub || ''}</p>`;
  const loads = [];
  for (const g of o.grupos) {
    const h = document.createElement('div');
    h.style.cssText = 'margin:22px 0 10px;display:flex;align-items:baseline;gap:14px;border-top:3px solid #4a2f1b;padding-top:12px';
    h.innerHTML = `<span style="font-size:27px;font-weight:900">${g.titulo}</span><span style="font-size:17.5px;font-weight:600;opacity:.75">${g.nota || ''}</span>`;
    pg.appendChild(h);
    const row = document.createElement('div');
    const gap = 18, avail = W - 80;
    // linha "justificada": a altura é escolhida para as miniaturas ocuparem a largura toda
    const somaAspecto = g.itens.reduce((t, it) => t + it.w / it.h, 0);
    const hh = Math.min(g.alturaMax || 460, Math.floor((avail - gap * (g.itens.length - 1)) / somaAspecto));
    row.style.cssText = `display:flex;gap:${gap}px;align-items:flex-start`;
    for (const it of g.itens) {
      const card = document.createElement('div');
      const ww = Math.floor((hh * it.w) / it.h);
      card.style.cssText = `width:${ww}px`;
      const img = new Image();
      img.style.cssText = `display:block;height:${hh}px;width:${ww}px;border-radius:12px;border:3px solid #4a2f1b;box-shadow:0 5px 0 rgba(58,36,20,.25);box-sizing:border-box;background:#fff`;
      loads.push(new Promise((res, rej) => { img.onload = () => (img.decode ? img.decode().then(res, res) : res()); img.onerror = () => rej(new Error('falha ao carregar ' + it.url)); }));
      img.src = it.url;
      card.appendChild(img);
      const t = document.createElement('div');
      t.style.cssText = 'margin-top:10px';
      t.innerHTML = `<div style="font-size:17.5px;font-weight:900;line-height:1.2">${it.titulo}</div><div style="font-size:15px;font-weight:600;opacity:.78;line-height:1.3;margin-top:3px">${it.legenda}</div><div style="font-size:12px;font-weight:700;opacity:.5;margin-top:4px;font-family:'JetBrains Mono',monospace;overflow-wrap:anywhere">${it.arquivo}</div>`;
      card.appendChild(t);
      row.appendChild(card);
    }
    pg.appendChild(row);
  }
  document.body.appendChild(pg);
  await Promise.all(loads);
  return { width: W, height: Math.ceil(pg.getBoundingClientRect().height) };
}
