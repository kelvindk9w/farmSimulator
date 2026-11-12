// Vaca e galinhas: máquinas de estados com passeio dentro de uma área, em passos fixos.
import { PASSO, limitar, difAngulo, girarPara, localParaMundo } from './util.js';
import { PASSADA, VELOCIDADE, TEMPOS, TIPOS } from './contrato.js';

// Anda em direção a (tx, tz) virando aos poucos. Devolve true ao chegar.
// "fase" soma a distância andada (e o giro no lugar) em ciclos de passada, para a arte não deixar o pé escorregar.
function seguir(b, tx, tz, velMax, giroMax, acel, passada, raioGiro) {
  const dx = tx - b.x, dz = tz - b.z, dist = Math.hypot(dx, dz);
  if (dist < 0.04) { b.x = tx; b.z = tz; b.vel = 0; return true; }
  const alvo = Math.atan2(dx, dz), antes = b.rumo;
  b.rumo = girarPara(b.rumo, alvo, giroMax * PASSO);
  const erro = Math.abs(difAngulo(b.rumo, alvo));
  const v = erro > (dist < 0.8 ? 0.18 : 0.6) ? 0 : velMax * Math.min(1, 0.3 + dist / 0.5);
  b.vel += limitar(v - b.vel, -acel * 2 * PASSO, acel * PASSO);
  const anda = Math.min(b.vel * PASSO, dist);
  if (erro < 0.18) { b.x += (dx / dist) * anda; b.z += (dz / dist) * anda; } else { b.x += Math.sin(b.rumo) * anda; b.z += Math.cos(b.rumo) * anda; }
  b.fase += (anda + Math.abs(difAngulo(antes, b.rumo)) * raioGiro) / passada;
  return false;
}

// ---------------- Vaca ----------------
const GIRO_VACA = 1.25; // rad/s
export class Vaca {
  constructor(id, def, sitio) {
    this.id = id; this.tipo = 'vaca'; this.nome = def.nome;
    this.x = def.x; this.z = def.z; this.rumo = def.rumo || 0;
    this.estado = 'parada'; // parada | pastando | andando | indoOrdenha | virando | esperandoOrdenha | ordenhada
    this.t = 0; this.dur = 1.6; this.vel = 0; this.fase = 0;
    this.tx = this.x; this.tz = this.z;
    this.leiteEm = TEMPOS.leite.primeiro; this.leitePronto = false;
    this.acao = null;
    const p = sitio.pasto;
    this.area = { x0: p.x0 + p.folga, z0: p.z0 + p.folga, x1: p.x1 - p.folga, z1: p.z1 - p.folga };
    this.ordenha = p.ordenha;
  }
  _entrar(estado, dur = 0) { this.estado = estado; this.t = 0; this.dur = dur; }
  _passear(m) {
    const a = this.area, s = m.sorteio;
    for (let i = 0; i < 6; i++) {
      this.tx = s.entre(a.x0, a.x1); this.tz = s.entre(a.z0, a.z1);
      if (Math.hypot(this.tx - this.x, this.tz - this.z) > 1.0) break;
    }
    this._entrar('andando');
  }
  passo(m) {
    this.t += PASSO;
    if (!this.leitePronto) { this.leiteEm -= PASSO; if (this.leiteEm <= 0) this.leitePronto = true; }
    const andar = (tx, tz) => seguir(this, tx, tz, VELOCIDADE.vaca, GIRO_VACA, 0.9, PASSADA.vaca, 0.5);
    switch (this.estado) {
      case 'parada': case 'pastando':
        this.vel = 0;
        if (this.leitePronto && this.t > 0.5) { this._entrar('indoOrdenha'); break; }
        if (this.t >= this.dur) {
          const r = m.sorteio.prox();
          if (this.estado === 'parada') { if (r < 0.5) this._entrar('pastando', m.sorteio.entre(3, 5.5)); else if (r < 0.88) this._passear(m); else this._entrar('parada', m.sorteio.entre(1, 2)); }
          else if (r < 0.6) this._passear(m); else this._entrar('parada', m.sorteio.entre(1.2, 2.5));
        }
        break;
      case 'andando':
        if (this.leitePronto) { this._entrar('indoOrdenha'); break; }
        if (andar(this.tx, this.tz)) this._entrar('parada', m.sorteio.entre(1.2, 2.5));
        break;
      case 'indoOrdenha':
        if (andar(this.ordenha.x, this.ordenha.z)) this._entrar('virando');
        break;
      case 'virando': {
        const antes = this.rumo;
        this.rumo = girarPara(this.rumo, this.ordenha.rumo, GIRO_VACA * PASSO);
        this.fase += (Math.abs(difAngulo(antes, this.rumo)) * 0.5) / PASSADA.vaca;
        if (this.rumo === this.ordenha.rumo) this._entrar('esperandoOrdenha');
        break;
      }
      default: break; // esperandoOrdenha e ordenhada: fica parada
    }
  }
  acaoPossivel() {
    if (this.estado === 'esperandoOrdenha') return { acao: 'ordenhar', texto: `${this.nome}: ordenhar` };
    if (this.estado === 'ordenhada') return { acao: null, texto: `${this.nome}: sendo ordenhada` };
    if (this.leitePronto) return { acao: null, texto: `${this.nome}: o leite está pronto, ela está indo para o ponto de ordenha` };
    return { acao: null, texto: `${this.nome}: leite pronto em ${Math.ceil(this.leiteEm)} s` };
  }
  aoIniciar(nome, m, acao) { this.acao = acao; this._entrar('ordenhada'); }
  aoEfeito(nome, m) { this.leitePronto = false; this.leiteEm = TEMPOS.leite.depois; m.ganhar('leite', 1, this.id); }
  aoTerminar() { this.acao = null; this._entrar('parada', 1.5); }
  visual() {
    const e = this.estado === 'indoOrdenha' || this.estado === 'virando' ? 'andando' : this.estado;
    const a = this.acao;
    return {
      estado: e, rumo: this.rumo, vel: this.vel, fase: this.fase, t: this.t, leitePronto: this.leitePronto,
      leite: this.leitePronto ? 1 : 1 - Math.max(0, this.leiteEm) / TEMPOS.leite.depois,
      acao: a ? { nome: a.nome, t: a.t, dur: a.dur, p: a.t / a.dur, feito: a.feito } : null,
    };
  }
}

// ---------------- Galinha ----------------
const GIRO_GALINHA = 7; // rad/s
export class Galinha {
  constructor(id, def, sitio) {
    this.id = id; this.tipo = 'galinha'; this.nome = def.nome; this.variante = def.variante || 'branca'; this.poedeira = !!def.poedeira;
    this.x = def.x; this.z = def.z; this.rumo = def.rumo || 0;
    this.estado = 'parada'; // parada | andando | bicando | batendoAsas | indoAoNinho | botando | saindoDoNinho | fugindo
    this.t = 0; this.dur = this.poedeira ? 0.6 : 1.1; this.vel = 0; this.fase = 0;
    this.tx = this.x; this.tz = this.z; this.descanso = 0;
    this.area = sitio.terreiro;
    const n = sitio.objetos.ninho;
    this.ninho = { x: n.x, z: n.z, r: TIPOS.ninho.raio + 0.25 };
    this.acao = null;
  }
  _entrar(estado, dur = 0) { this.estado = estado; this.t = 0; this.dur = dur; }
  // o trecho até (x, z) fica dentro do terreiro e longe do ninho?
  _serve(x, z) {
    const a = this.area, n = this.ninho;
    if (x < a.x0 || x > a.x1 || z < a.z0 || z > a.z1) return false;
    const dx = x - this.x, dz = z - this.z, l2 = dx * dx + dz * dz;
    const u = l2 > 0 ? limitar(((n.x - this.x) * dx + (n.z - this.z) * dz) / l2, 0, 1) : 0;
    return Math.hypot(this.x + dx * u - n.x, this.z + dz * u - n.z) > n.r;
  }
  _ciscar(m) {
    const s = m.sorteio;
    for (let i = 0; i < 8; i++) {
      const a = s.entre(-Math.PI, Math.PI), d = s.entre(0.6, 1.7);
      const x = this.x + Math.sin(a) * d, z = this.z + Math.cos(a) * d;
      if (this._serve(x, z)) { this.tx = x; this.tz = z; this._entrar('andando'); return; }
    }
    this._entrar('parada', 0.8);
  }
  passo(m) {
    this.t += PASSO;
    if (this.descanso > 0) this.descanso -= PASSO;
    const ninho = m.objetos.ninho, p = m.personagem;
    const andar = (tx, tz, v = VELOCIDADE.galinha) => seguir(this, tx, tz, v, GIRO_GALINHA, 6, PASSADA.galinha, 0.07);
    const solta = this.estado === 'parada' || this.estado === 'andando' || this.estado === 'bicando' || this.estado === 'batendoAsas';
    // susto: o personagem passou perto demais
    if (solta && p.visivel && this.descanso <= 0) {
      const dx = this.x - p.x, dz = this.z - p.z, d = Math.hypot(dx, dz);
      if (d < 0.8) {
        const k = 1.4 / (d || 1), a = this.area;
        let x = limitar(this.x + (d ? dx : 1) * k, a.x0, a.x1), z = limitar(this.z + dz * k, a.z0, a.z1);
        if (!this._serve(x, z)) { x = limitar(this.x - dz * k, a.x0, a.x1); z = limitar(this.z + dx * k, a.z0, a.z1); }
        if (this._serve(x, z)) { this.tx = x; this.tz = z; this._entrar('fugindo'); this.descanso = 1.6; }
      }
    }
    // hora de botar: a poedeira larga o que está fazendo e vai para o ninho
    if (this.poedeira && solta && this.estado !== 'batendoAsas' && ninho.horaDeBotar()) { ninho.ocupado = true; this._entrar('indoAoNinho'); }
    switch (this.estado) {
      case 'parada':
        this.vel = 0;
        if (this.t >= this.dur) {
          const r = m.sorteio.prox();
          if (r < 0.46) this._ciscar(m); else if (r < 0.86) this._entrar('bicando', 1.35); else this._entrar('batendoAsas', 0.95);
        }
        break;
      case 'andando': if (andar(this.tx, this.tz)) this._entrar(m.sorteio.prox() < 0.6 ? 'bicando' : 'parada', m.sorteio.entre(0.5, 1.35)); if (this.estado === 'bicando') this.dur = 1.35; break;
      case 'bicando': case 'batendoAsas': this.vel = 0; if (this.t >= this.dur) this._entrar('parada', m.sorteio.entre(0.4, 1.3)); break;
      case 'fugindo': if (andar(this.tx, this.tz, VELOCIDADE.galinhaFugindo)) this._entrar('parada', m.sorteio.entre(0.5, 1.0)); break;
      case 'indoAoNinho': if (andar(this.ninho.x, this.ninho.z)) this._entrar('botando', TEMPOS.ovo.botando); break;
      case 'botando':
        this.vel = 0;
        if (this.t >= this.dur) {
          // desce do ninho pelo lado do terreiro que tem mais espaço
          const a = this.area, cx = (a.x0 + a.x1) / 2, cz = (a.z0 + a.z1) / 2, d = Math.hypot(cx - this.x, cz - this.z) || 1;
          this.tx = this.x + ((cx - this.x) / d) * 1.0; this.tz = this.z + ((cz - this.z) / d) * 1.0;
          this._entrar('saindoDoNinho');
        }
        break;
      case 'saindoDoNinho':
        if (andar(this.tx, this.tz)) this._entrar('parada', 0.6);
        // o ovo aparece quando ela já saiu de cima
        if (ninho.ocupado && Math.hypot(this.x - this.ninho.x, this.z - this.ninho.z) > 0.42) ninho.botou();
        break;
      default: break;
    }
  }
  acaoPossivel(m) { return m.objetos.ninho.acaoPossivel(m); }
  visual() {
    const e = this.estado === 'indoAoNinho' || this.estado === 'saindoDoNinho' ? 'andando' : this.estado;
    const noNinho = this.estado === 'botando' ? 1 : this.estado === 'indoAoNinho' || this.estado === 'saindoDoNinho' ? limitar(1 - (Math.hypot(this.x - this.ninho.x, this.z - this.ninho.z) - 0.12) / 0.3, 0, 1) : 0;
    return { estado: e, rumo: this.rumo, vel: this.vel, fase: this.fase, t: this.t, dur: this.dur, p: this.dur > 0 ? Math.min(1, this.t / this.dur) : 0, noNinho, variante: this.variante };
  }
}
