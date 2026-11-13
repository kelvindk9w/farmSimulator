// A tela: tamanho do palco, celular em pé (o palco gira 90° e os toques são corrigidos) e tela cheia.
const palco = () => document.getElementById('palco');

export const tela = {
  w: 0, h: 0, emPe: false,
  aoMudar: null,

  // mede a janela e ajusta o palco; devolve true se algo mudou
  medir() {
    const W = window.innerWidth, H = window.innerHeight;
    // só gira em aparelho de toque: uma janela estreita no computador fica como está
    const toque = (navigator.maxTouchPoints || 0) > 0 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    const emPe = toque && H > W * 1.05;
    const w = emPe ? H : W, h = emPe ? W : H;
    if (w === this.w && h === this.h && emPe === this.emPe) return false;
    this.w = w; this.h = h; this.emPe = emPe;
    document.body.classList.toggle('em-pe', emPe);
    const p = palco();
    p.style.width = w + 'px'; p.style.height = h + 'px';
    return true;
  },
  ligar() {
    const mudou = () => { if (this.medir() && this.aoMudar) this.aoMudar(); };
    window.addEventListener('resize', mudou);
    window.addEventListener('orientationchange', () => setTimeout(mudou, 120));
    document.addEventListener('fullscreenchange', () => { setTimeout(mudou, 60); if (this.aoMudar) this.aoMudar(); });
    this.medir();
  },

  // ponto da janela (clientX, clientY) → ponto do palco; com o palco girado, x e y trocam
  doPalco(cx, cy, out) {
    if (this.emPe) { out.x = cy; out.y = window.innerWidth - cx; } else { out.x = cx; out.y = cy; }
    return out;
  },
  // o contrário: ponto do palco → ponto da janela (as ferramentas de teste tocam em pontos da janela)
  daJanela(px, py, out) {
    if (this.emPe) { out.x = window.innerWidth - py; out.y = px; } else { out.x = px; out.y = py; }
    return out;
  },

  // tela cheia: só funciona dentro de um toque ou clique; navegador que não deixa, não deixa
  emTelaCheia() { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
  podeTelaCheia() { const e = document.documentElement; return !!(e.requestFullscreen || e.webkitRequestFullscreen); },
  alternarTelaCheia() {
    try {
      if (this.emTelaCheia()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      const e = document.documentElement, pedir = e.requestFullscreen || e.webkitRequestFullscreen;
      if (!pedir) return;
      const r = pedir.call(e, { navigationUI: 'hide' });
      const deitar = () => { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch { /* sem trava de orientação */ } };
      if (r && r.then) r.then(deitar).catch(() => {}); else deitar();
    } catch { /* sem tela cheia */ }
  },
};
