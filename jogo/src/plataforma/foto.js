// A foto da fazenda: o que a câmera do jogo está mostrando (só o terreno, sem os botões), numa moldura com o nome
// do jogo e o da fazenda. Devolve um endereço de imagem (data:) para pôr num <img>: quem quiser guardar segura o
// dedo na foto ou usa o botão direito. Nada é baixado nem publicado daqui.
const CREME = '#fff9ec', MARROM = '#4a2f1b', VERDE = '#41a85c';

function cantos(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
  g.closePath();
}

// origem = o canvas do jogo; opc = { titulo (nome do jogo), nome (da fazenda), linha (texto pequeno), largura }
export function tirarFoto(origem, opc = {}) {
  try {
    if (!origem || !origem.width || !origem.height) return null;
    const L = Math.min(opc.largura || 1100, 1280), borda = Math.round(L * 0.022), faixa = Math.round(L * 0.085);
    const lf = L - borda * 2, af = Math.round(lf * Math.min(0.62, origem.height / origem.width));
    const c = document.createElement('canvas');
    c.width = L; c.height = af + borda * 2 + faixa;
    const g = c.getContext('2d');
    // a moldura
    g.fillStyle = MARROM; cantos(g, 0, 0, c.width, c.height, borda * 1.6); g.fill();
    g.fillStyle = CREME; cantos(g, borda * 0.3, borda * 0.3, c.width - borda * 0.6, c.height - borda * 0.6, borda * 1.4); g.fill();
    // a fazenda: o meio do que a câmera mostra, cortado na proporção da foto
    const prop = lf / af;
    let sw = origem.width, sh = origem.height;
    if (sw / sh > prop) sw = sh * prop; else sh = sw / prop;
    g.save();
    cantos(g, borda, borda, lf, af, borda * 0.9); g.clip();
    g.imageSmoothingQuality = 'high';
    g.drawImage(origem, (origem.width - sw) / 2, (origem.height - sh) / 2, sw, sh, borda, borda, lf, af);
    g.restore();
    g.lineWidth = Math.max(2, borda * 0.22); g.strokeStyle = MARROM; cantos(g, borda, borda, lf, af, borda * 0.9); g.stroke();
    // a faixa de baixo: o nome da fazenda e o do jogo
    const base = borda + af + faixa * 0.6, fonte = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    g.textBaseline = 'middle';
    g.fillStyle = MARROM; g.textAlign = 'left';
    g.font = `800 ${Math.round(faixa * 0.48)}px ${fonte}`;
    g.fillText(opc.nome || opc.titulo || '', borda * 1.5, base, lf * 0.66);
    g.textAlign = 'right';
    if (opc.nome && opc.titulo) {
      g.fillStyle = VERDE; g.font = `800 ${Math.round(faixa * 0.36)}px ${fonte}`;
      g.fillText(opc.titulo, c.width - borda * 1.5, base - (opc.linha ? faixa * 0.13 : 0), lf * 0.3);
    }
    if (opc.linha) { g.fillStyle = '#8a6a4c'; g.font = `600 ${Math.round(faixa * 0.22)}px ${fonte}`; g.fillText(opc.linha, c.width - borda * 1.5, base + faixa * 0.2, lf * 0.3); }
    return c.toDataURL('image/jpeg', 0.9);
  } catch (e) {
    return null; // navegador que não deixa ler o canvas: quem chama avisa
  }
}

// copia um texto dentro de um clique: tenta a seleção de uma área de texto (se houver) e a área de transferência.
// Devolve true se pelo menos a seleção deu certo; nunca lança erro.
export function copiarTexto(texto, area) {
  let ok = false;
  try { if (area) { area.focus(); area.select(); ok = !!(document.execCommand && document.execCommand('copy')); } } catch { ok = false; }
  try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(texto).then(() => {}, () => {}); ok = true; } } catch { /* fica o texto selecionado */ }
  return ok;
}
// o endereço do jogo com o convite (só "#palavra": letras, dígitos e hífens)
export function enderecoDoConvite(codigo) {
  let base = '';
  try { base = String(location.href).split('#')[0]; } catch { base = ''; }
  return base + '#convite-' + codigo;
}
// o convite que veio no endereço desta página, ou ''
export function conviteDoEndereco() {
  try { const m = /^#(?:teste-)?convite-([a-z0-9]{4,12})$/i.exec(location.hash || ''); return m ? m[1].toLowerCase() : ''; } catch { return ''; }
}
