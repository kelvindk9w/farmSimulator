// O personagem: anda até um ponto (contornando obstáculos), vira para o objeto e executa a ação.
// Estados internos: parado | andando | virando | agindo | celeiro (entrar, guardar e sair).
import { PASSO, limitar, difAngulo, girarPara, rumoPara } from './util.js';
import { ACOES, PASSADA, VELOCIDADE, CELEIRO, ITENS, TIPOS } from './contrato.js';
import { Navegacao } from './caminho.js';
import { Poco } from './objetos.js';

const GIRO = 10; // rad/s
const ACEL = 9, FREIO = 9; // unidades/s²
const CORRER_ACIMA_DE = 3.6; // trechos mais longos que isto são feitos correndo
// nome do estado entregue à arte para cada ação
const ESTADO_DA_ACAO = { plantar: 'plantar', regar: 'regar', colher: 'colher', tirarAgua: 'girarManivela', ordenhar: 'ordenhar', pegarOvo: 'pegarOvo', colherFruta: 'colherFruta' };

export class Personagem {
  constructor(ini) {
    this.x = ini.x; this.z = ini.z; this.rumo = ini.rumo || 0;
    this.estado = 'parado'; this.sub = null; this.tEstado = 0; this.tSub = 0;
    this.vel = 0; this.modo = 'andar'; this.fase = 0;
    this.plano = null; // { alvo, acao } ou { chao: [x, z] }
    this.rota = null; // { pontos, i, rumoFinal }
    this.acao = null; // { nome, alvo, t, dur, efeito, feito }
    this.fila = null; // comando recebido durante uma ação: é atendido quando ela terminar
    this.agua = 0;
    this.carga = Object.fromEntries(ITENS.map((i) => [i, 0]));
    this.carregando = false; // caixote nas mãos (a caminho do celeiro)
    this.visivel = true;
    this.depositou = false;
    this.concluidas = 0; // ações terminadas (o roteiro e os testes acompanham este número)
  }

  livre() { return this.estado === 'parado' && !this.fila; }
  temCarga() { return ITENS.some((i) => this.carga[i] > 0); }

  // cmd: { alvo: id, acao: nome | null }  ou  { chao: [x, z] }
  comandar(m, cmd) {
    if (this.estado === 'agindo' || this.estado === 'celeiro') { this.fila = cmd; return; }
    if (this.plano && this.plano.acao === 'guardar') m.objetos.celeiro.fechar(); // desistiu do celeiro no meio do caminho
    this._planejar(m, cmd);
  }

  _planejar(m, cmd) {
    let dest, olhar = null;
    if (cmd.chao) dest = cmd.chao; else ({ dest, olhar } = m.pontoDeAcao(m.objetos[cmd.alvo], cmd.acao));
    const pontos = m.nav.rota(this.x, this.z, dest[0], dest[1]);
    const comp = Navegacao.comprimento(this.x, this.z, pontos);
    this.plano = cmd;
    this.carregando = cmd.acao === 'guardar' && this.temCarga();
    this.modo = !this.carregando && comp > CORRER_ACIMA_DE ? 'correr' : 'andar';
    this.rota = { pontos, i: 0, rumoFinal: olhar ? rumoPara(dest[0], dest[1], olhar[0], olhar[1]) : null };
    this.estado = comp < 0.03 ? 'virando' : 'andando';
    this.tEstado = 0;
  }

  // teclado: soltou a direção. Freia e para logo adiante, no rumo em que já ia (só vale para quem anda pelo chão).
  frear(m) {
    if (this.estado !== 'andando' || !this.plano.chao) return;
    const [tx, tz] = this.rota.pontos[this.rota.i], d = Math.hypot(tx - this.x, tz - this.z);
    const f = Math.min(d, (this.vel * this.vel) / (2 * FREIO) + 0.03);
    this._planejar(m, { chao: d > 0 ? [this.x + ((tx - this.x) / d) * f, this.z + ((tz - this.z) / d) * f] : [this.x, this.z] });
  }

  _parar() { this.estado = 'parado'; this.sub = null; this.plano = null; this.rota = null; this.vel = 0; this.tEstado = 0; this.carregando = false; }

  passo(m) {
    this.tEstado += PASSO;
    switch (this.estado) {
      case 'parado':
        if (this.fila) { const c = this.fila; this.fila = null; this._planejar(m, c); }
        break;
      case 'andando': this._andar(m); break;
      case 'virando': {
        const alvo = this.rota.rumoFinal;
        if (alvo === null || this.rumo === alvo) this._chegou(m); else this.rumo = girarPara(this.rumo, alvo, GIRO * PASSO);
        break;
      }
      case 'agindo': this._agir(m); break;
      case 'celeiro': this._celeiro(m); break;
      default: break;
    }
  }

  _andar(m) {
    const r = this.rota, P = r.pontos;
    let [tx, tz] = P[r.i];
    let resto = Math.hypot(tx - this.x, tz - this.z);
    for (let k = r.i; k < P.length - 1; k++) resto += Math.hypot(P[k + 1][0] - P[k][0], P[k + 1][1] - P[k][1]);
    const alvoRumo = Math.atan2(tx - this.x, tz - this.z);
    const erro = Math.abs(difAngulo(this.rumo, alvoRumo));
    this.rumo = girarPara(this.rumo, alvoRumo, GIRO * PASSO);
    // velocidade: acelera, freia para parar no ponto, e segura o passo enquanto ainda está virando
    const vmax = VELOCIDADE[this.modo];
    let vAlvo = Math.min(vmax, Math.max(0.5, Math.sqrt(2 * FREIO * resto)));
    if (erro > 1.2) vAlvo = Math.min(vAlvo, 0.3); else if (erro > 0.5) vAlvo = Math.min(vAlvo, vmax * 0.55);
    this.vel += limitar(vAlvo - this.vel, -FREIO * 1.6 * PASSO, ACEL * PASSO);
    let anda = this.vel * PASSO;
    this.fase += anda / PASSADA[this.modo];
    if (this.plano.acao === 'guardar' && resto < 1.7) m.objetos.celeiro.abrir(); // a porta começa a abrir antes de ele chegar
    while (anda > 0) {
      [tx, tz] = P[r.i];
      const dx = tx - this.x, dz = tz - this.z, d = Math.hypot(dx, dz);
      if (d <= anda) {
        this.x = tx; this.z = tz; anda -= d; r.i++;
        if (r.i >= P.length) { this.vel = 0; this.estado = 'virando'; this.tEstado = 0; return; }
      } else { this.x += (dx / d) * anda; this.z += (dz / d) * anda; anda = 0; }
    }
  }

  // anda em linha reta até um ponto (usado para entrar e sair do celeiro). Devolve true ao chegar.
  _reto(dest, vmax) {
    const dx = dest[0] - this.x, dz = dest[1] - this.z, d = Math.hypot(dx, dz);
    if (d < 0.02) { this.x = dest[0]; this.z = dest[1]; this.vel = 0; return true; }
    this.rumo = girarPara(this.rumo, Math.atan2(dx, dz), GIRO * PASSO);
    const vAlvo = Math.min(vmax, Math.max(0.5, Math.sqrt(2 * FREIO * d)));
    this.vel += limitar(vAlvo - this.vel, -FREIO * 1.6 * PASSO, ACEL * PASSO);
    const anda = Math.min(d, this.vel * PASSO);
    this.x += (dx / d) * anda; this.z += (dz / d) * anda;
    this.fase += anda / PASSADA.andar;
    return false;
  }

  _chegou(m) {
    const p = this.plano;
    this.rota = null; this.vel = 0;
    if (!p || p.chao || !p.acao) { this._parar(); return; }
    if (p.acao === 'guardar') { this.estado = 'celeiro'; this.sub = 'esperarPorta'; this.tEstado = 0; m.objetos.celeiro.abrir(); return; }
    const o = m.objetos[p.alvo], d = o.acaoPossivel(m);
    if (d.acao !== p.acao) { m.dica = d.texto; this._parar(); return; } // a situação mudou no caminho
    this.acao = { nome: p.acao, alvo: p.alvo, t: 0, dur: ACOES[p.acao].dur, efeito: ACOES[p.acao].efeito, feito: false };
    o.aoIniciar(p.acao, m, this.acao);
    this.estado = 'agindo'; this.tEstado = 0;
  }

  _agir(m) {
    const a = this.acao, o = m.objetos[a.alvo];
    a.t += PASSO;
    if (!a.feito && a.t >= a.efeito) { a.feito = true; o.aoEfeito(a.nome, m); }
    if (a.t >= a.dur) {
      o.aoTerminar(a.nome, m);
      this.acao = null; this.concluidas++;
      m.registrar(a.nome, a.alvo);
      this._parar();
    }
  }

  _celeiro(m) {
    const c = m.objetos.celeiro, P = TIPOS.celeiro.pontos;
    const porta = m.local(c, P.porta), dentro = m.local(c, P.dentro);
    switch (this.sub) {
      case 'esperarPorta': if (c.abertura >= 0.8) this.sub = 'entrando'; break;
      case 'entrando': if (this._reto(dentro, VELOCIDADE.andar * 0.9)) { this.sub = 'dentro'; this.tSub = 0; this.visivel = false; } break;
      case 'dentro':
        this.tSub += PASSO;
        if (!this.depositou && this.tSub >= CELEIRO.deposito) { this.depositou = true; m.guardar(); this.carregando = false; }
        if (this.tSub >= CELEIRO.dentro) { this.sub = 'saindo'; this.visivel = true; this.rumo = rumoPara(dentro[0], dentro[1], porta[0], porta[1]); }
        break;
      case 'saindo':
        if (this._reto(porta, VELOCIDADE.andar)) { c.fechar(); this.depositou = false; this.concluidas++; m.registrar('guardar', 'celeiro'); this._parar(); }
        break;
      default: break;
    }
  }

  // o item que aparece no caixote: o que ele mais tem na mão
  itemPrincipal() { let melhor = null; for (const i of ITENS) if (this.carga[i] > 0 && (!melhor || this.carga[i] > this.carga[melhor])) melhor = i; return melhor; }

  visual() {
    const a = this.acao;
    let estado = 'parado';
    if (this.estado === 'andando') estado = this.modo;
    else if (this.estado === 'agindo') estado = ESTADO_DA_ACAO[a.nome];
    else if (this.estado === 'celeiro') estado = this.sub === 'dentro' ? 'dentro' : this.sub === 'esperarPorta' ? 'parado' : 'andar';
    const d = {
      estado, rumo: this.rumo, vel: this.vel, fase: this.fase, carregando: this.carregando, visivel: this.visivel,
      item: this.itemPrincipal(), agua: this.agua, alvo: a ? a.alvo : this.plano ? this.plano.alvo || null : null,
      t: a ? a.t : this.tEstado, dur: a ? a.dur : 0, p: a ? a.t / a.dur : 0, efeito: a ? a.efeito : 0, feito: a ? a.feito : false,
    };
    if (a && a.nome === 'tirarAgua') Object.assign(d, Poco.coreografia(a.t));
    return d;
  }
}
