// Simulação da bancada: movimento em 8 direções + máquina de estados das animações.
// É a MESMA lógica nas quatro variantes (godot/scripts/sim.gd é a tradução linha a linha deste arquivo).
// Anda em passos fixos (config "step", 1/60 s), então o modo demonstração é determinístico.

const HOLD = ['crouch', 'sit', 'lie']; // poses que ficam no último quadro até outra tecla

export class Sim {
  // durations: duração de cada animação NESTA rota (3D: do clipe; 2D: quadros / fps)
  constructor(cfg, iso, durations) {
    this.cfg = cfg; this.iso = iso; this.dt = cfg.step;
    // animação que faltar no arquivo de arte ganha a duração do contrato, para a simulação não travar nela
    this.dur = {};
    for (const [n, d] of Object.entries(cfg.sprites.defaults)) this.dur[n] = durations[n] > 0 ? durations[n] : d.frames / d.fps;
    this.serial = 0; // muda toda vez que uma animação (re)começa; nunca volta a zero
    this.reset({ e: 0, n: 0, dir: 'S' });
  }

  reset(start) {
    const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    [this.x, this.z] = this.iso.enToWorld(start.e, start.n);
    this.dir = Math.max(0, DIRS.indexOf(start.dir));
    this.yawDeg = this.iso.dirYawDeg(this.dir);
    this.mode = 'loco';
    this.vx = 0; this.vz = 0;
    this.frame = 0;
    this._play('idle', 0, 0); // fade 0 = corte seco (reinício)
  }

  _play(name, fade, start = 0) {
    this.anim = name; this.animTime = start; this.animFade = fade; this.animStart = start; this.serial++;
  }

  _loco(k, run, fade) {
    const M = this.cfg.movement;
    const want = k < 0 ? 'idle' : run ? 'run' : 'walk';
    if (k >= 0) {
      this.dir = k;
      const [dx, dz] = this.iso.dirVec(k);
      const sp = run ? M.runSpeed : M.walkSpeed;
      this.x += dx * sp * this.dt; this.z += dz * sp * this.dt;
    }
    if (want !== this.anim) {
      let start = 0;
      const ciclo = (a) => a === 'walk' || a === 'run';
      // entre andar e correr mantém a fase da passada
      if (ciclo(want) && ciclo(this.anim) && this.dur[this.anim] > 0) start = ((this.animTime / this.dur[this.anim]) % 1) * this.dur[want];
      this._play(want, fade ?? this.cfg.animations[want].fade, start);
    }
  }

  // inp: { mx, my (-1..1, y para cima na tela), run (bool), press ('jump' | 'crouch' | 'sit' | 'lie' | null) }
  step(inp) {
    const cfg = this.cfg, M = cfg.movement, dt = this.dt;
    let k = -1;
    if (Math.hypot(inp.mx, inp.my) > M.deadzone) k = ((Math.round(Math.atan2(inp.mx, inp.my) / (Math.PI / 4)) % 8) + 8) % 8;

    if (this.mode === 'jump') {
      this.x += this.vx * dt; this.z += this.vz * dt;
      if (this.animTime >= this.dur.jump - 1e-6) { this.mode = 'loco'; this._loco(k, inp.run); }
    } else if (HOLD.includes(this.mode)) {
      if (k >= 0 || inp.press === this.mode || inp.press === 'jump') { this.mode = 'loco'; this._loco(k, inp.run, cfg.standUpFade); }
      else if (HOLD.includes(inp.press)) { this.mode = inp.press; this._play(inp.press, cfg.animations[inp.press].fade); }
    } else if (inp.press === 'jump') {
      this.mode = 'jump';
      this.vx = 0; this.vz = 0;
      if (k >= 0) {
        this.dir = k;
        const [dx, dz] = this.iso.dirVec(k);
        const sp = inp.run ? M.runSpeed : M.walkSpeed;
        this.vx = dx * sp; this.vz = dz * sp;
      }
      this._play('jump', cfg.animations.jump.fade);
    } else if (HOLD.includes(inp.press)) {
      this.mode = inp.press; this._play(inp.press, cfg.animations[inp.press].fade);
    } else {
      this._loco(k, inp.run);
    }

    // limites: fica dentro da área visível em qualquer formato de tela
    let [e, n] = this.iso.worldToEn(this.x, this.z);
    e = Math.max(-M.limitE, Math.min(M.limitE, e)); n = Math.max(-M.limitN, Math.min(M.limitN, n));
    [this.x, this.z] = this.iso.enToWorld(e, n);

    // giro suave (só a rota 3D usa; no 2D a direção troca de uma vez)
    const alvo = this.iso.dirYawDeg(this.dir);
    const dif = ((((alvo - this.yawDeg) % 360) + 540) % 360) - 180;
    const max = M.turnDegPerSec * dt;
    this.yawDeg += Math.max(-max, Math.min(max, dif));

    this.animTime += dt;
    this.frame++;
  }
}

// Roteiro fixo da demonstração: devolve a entrada de cada passo.
export class Demo {
  constructor(cfg) {
    this.steps = cfg.demo.steps; this.start = cfg.demo.start;
    this.total = this.steps.reduce((s, p) => s + p.frames, 0);
    this.reset();
  }
  reset() { this.i = 0; this.f = 0; this.label = this.steps[0].label || ''; }
  // true quando o roteiro acabou e vai recomeçar (quem chama reinicia a simulação)
  get ended() { return this.i >= this.steps.length; }
  next() {
    const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const p = this.steps[this.i];
    const inp = { mx: 0, my: 0, run: !!p.run, press: this.f === 0 ? p.press || null : null };
    if (p.move) { const a = (DIRS.indexOf(p.move) * Math.PI) / 4; inp.mx = Math.sin(a); inp.my = Math.cos(a); }
    this.label = p.label || '';
    if (++this.f >= p.frames) { this.f = 0; this.i++; }
    return inp;
  }
}
