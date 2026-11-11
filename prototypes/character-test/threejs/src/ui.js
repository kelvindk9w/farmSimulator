// Interface sobre a tela (HTML): rótulo da variante, botões e controles de toque. Textos em português.
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else e.setAttribute(k, v); }
  e.append(...kids);
  return e;
};

export class Hud {
  constructor(root, { mostrarControles = true } = {}) {
    this.root = root;
    this.label = el('div', { class: 'rotulo', id: 'rotulo' });
    this.statsLine = el('div', { class: 'linha' });
    this.help = el('div', { class: 'linha ajuda', text: 'WASD ou setas: andar · Shift: correr · Espaço: pular · C: agachar · X: sentar · Z: deitar' });
    this.caption = el('div', { class: 'legenda' });
    const topo = el('div', { class: 'canto topo-esq' }, this.label, this.caption, this.statsLine, this.help);

    this.btMode = el('button', { type: 'button' });
    this.btLook = el('button', { type: 'button', text: 'Trocar visual' });
    this.btDemo = el('button', { type: 'button', text: 'Demonstração' });
    this.lookName = el('div', { class: 'linha direita' });
    const dir = el('div', { class: 'canto topo-dir' }, el('div', { class: 'fila' }, this.btMode, this.btLook, this.btDemo), this.lookName);

    this.knob = el('div', { class: 'pino' });
    this.stick = el('div', { class: 'manche', 'aria-label': 'Alavanca de movimento' }, this.knob);
    const acoes = [['run', 'Correr'], ['lie', 'Deitar'], ['sit', 'Sentar'], ['crouch', 'Agachar'], ['jump', 'Pular']];
    this.actionButtons = acoes.map(([a, t]) => el('button', { type: 'button', 'data-acao': a, class: 'acao acao-' + a, text: t }));
    this.actions = el('div', { class: 'acoes' }, ...this.actionButtons);

    this.message = el('div', { class: 'mensagem', text: 'Carregando…' });
    root.append(topo, dir, this.stick, this.actions, this.message);
    root.classList.add(mostrarControles ? 'com-controles' : 'sem-controles');
  }
  setLabel(t) { this.label.textContent = t; document.title = t + ' · teste de personagem'; }
  setStats(t) { this.statsLine.textContent = t; }
  setLook(t) { this.lookName.textContent = 'Visual: ' + t; }
  setCaption(t) { this.caption.textContent = t; this.caption.style.display = t ? '' : 'none'; }
  setMessage(t) { this.message.textContent = t; this.message.style.display = t ? '' : 'none'; }
  setDemo(on) { this.btDemo.classList.toggle('ligado', on); }
}
