// Entrada: teclado (WASD/setas, Shift, Espaço, C, X, Z) e toque (alavanca + botões na tela).
const KEYS = {
  KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  ShiftLeft: 'run', ShiftRight: 'run',
};
const PRESS = { Space: 'jump', KeyC: 'crouch', KeyX: 'sit', KeyZ: 'lie' };

export class Input {
  constructor(hud) {
    this.down = new Set();
    this.queue = []; // ações apertadas, uma por passo da simulação
    this.stick = { x: 0, y: 0 };
    this.runLatch = false; // botão "Correr" da tela (liga/desliga)

    addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (KEYS[e.code]) { this.down.add(KEYS[e.code]); e.preventDefault(); }
      else if (PRESS[e.code]) { if (!e.repeat) this.queue.push(PRESS[e.code]); e.preventDefault(); }
    });
    addEventListener('keyup', (e) => { if (KEYS[e.code]) this.down.delete(KEYS[e.code]); });
    addEventListener('blur', () => { this.down.clear(); this.stick.x = this.stick.y = 0; });

    // alavanca
    const base = hud.stick, knob = hud.knob;
    let id = null;
    const move = (e) => {
      const r = base.getBoundingClientRect(), R = r.width / 2;
      let x = (e.clientX - (r.left + R)) / R, y = (e.clientY - (r.top + R)) / R;
      const m = Math.hypot(x, y);
      if (m > 1) { x /= m; y /= m; }
      this.stick.x = x; this.stick.y = -y;
      knob.style.transform = `translate(${x * R * 0.55}px, ${y * R * 0.55}px)`;
    };
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null; this.stick.x = this.stick.y = 0; knob.style.transform = '';
    };
    base.addEventListener('pointerdown', (e) => { id = e.pointerId; base.setPointerCapture(id); move(e); e.preventDefault(); });
    base.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e); });
    base.addEventListener('pointerup', end);
    base.addEventListener('pointercancel', end);

    // botões de ação
    for (const b of hud.actionButtons) {
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const a = b.dataset.acao;
        if (a === 'run') { this.runLatch = !this.runLatch; b.classList.toggle('ligado', this.runLatch); } else this.queue.push(a);
      });
    }
  }

  sample() {
    const d = this.down;
    let mx = (d.has('right') ? 1 : 0) - (d.has('left') ? 1 : 0), my = (d.has('up') ? 1 : 0) - (d.has('down') ? 1 : 0);
    if (!mx && !my) { mx = this.stick.x; my = this.stick.y; }
    return { mx, my, run: d.has('run') || this.runLatch, press: this.queue.shift() || null };
  }
}
