// Objetos parados do sítio: canteiro, poço, celeiro, laranjeira e ninho. Cada um é uma máquina de estados.
// Todos têm a mesma forma:
//   passo(m)            avança 1/60 s
//   acaoPossivel(m)     o que um toque faria agora: { acao: nome | null, texto }
//   aoIniciar/aoEfeito/aoTerminar(nome, m)   chamados pelo personagem durante a ação
//   visual()            { estado, ...dados } entregue à arte (ver CONTRATO-DE-ARTE.md)
import { PASSO, TAU, suave, janela } from './util.js';
import { TEMPOS, AGUA_MAX, TIRAR_AGUA, CELEIRO, ITENS } from './contrato.js';

class Base {
  constructor(id, def) { this.id = id; this.tipo = def.tipo; this.nome = def.nome; this.x = def.x; this.z = def.z; this.giro = def.giro || 0; this.acao = null; }
  // "acao" é o MESMO objeto que o personagem avança ({ nome, alvo, t, dur, efeito, feito }): os dois ficam no mesmo instante
  aoIniciar(nome, m, acao) { this.acao = acao; }
  aoEfeito() {}
  aoTerminar() { this.acao = null; }
  _acaoVisual() { const a = this.acao; return a ? { nome: a.nome, t: a.t, dur: a.dur, p: a.t / a.dur, feito: a.feito } : null; }
}

// ---------------- Canteiro ----------------
const PROXIMO = { semeado: 'broto', broto: 'crescendo', crescendo: 'pronto' };
export class Canteiro extends Base {
  constructor(id, def) { super(id, def); this.estado = 'vazio'; this.t = 0; this.molhado = false; }
  passo() {
    const dur = TEMPOS.canteiro[this.estado];
    if (dur && this.molhado) {
      this.t += PASSO;
      if (this.t >= dur) { this.estado = PROXIMO[this.estado]; this.t = 0; }
    }
  }
  falta() { // segundos até ficar pronto (com o canteiro molhado)
    let s = 0, e = this.estado;
    while (TEMPOS.canteiro[e]) { s += TEMPOS.canteiro[e] - (e === this.estado ? this.t : 0); e = PROXIMO[e]; }
    return s;
  }
  acaoPossivel(m) {
    if (this.estado === 'vazio') return { acao: 'plantar', texto: `${this.nome}: plantar milho` };
    if (this.estado === 'pronto') return { acao: 'colher', texto: `${this.nome}: colher o milho` };
    if (!this.molhado) {
      if (m.personagem.agua > 0) return { acao: 'regar', texto: `${this.nome}: regar (gasta 1 de água)` };
      return { acao: null, texto: `${this.nome}: precisa de água, e o regador está vazio. Tire água no poço.` };
    }
    return { acao: null, texto: `${this.nome}: milho crescendo, faltam ${Math.ceil(this.falta())} s` };
  }
  aoEfeito(nome, m) {
    if (nome === 'plantar') { this.estado = 'semeado'; this.t = 0; this.molhado = false; }
    else if (nome === 'regar') { this.molhado = true; m.personagem.agua -= 1; m.avisar({ tipo: 'agua', n: -1, de: this.id }); }
    else if (nome === 'colher') { this.estado = 'vazio'; this.t = 0; this.molhado = false; m.ganhar('milho', 1, this.id); }
  }
  visual() {
    const dur = TEMPOS.canteiro[this.estado];
    return { estado: this.estado, molhado: this.molhado, t: this.t, p: dur ? this.t / dur : 0, acao: this._acaoVisual() };
  }
}

// ---------------- Poço ----------------
export class Poco extends Base {
  constructor(id, def) { super(id, def); this.estado = 'ocioso'; }
  passo() {}
  acaoPossivel(m) {
    const a = m.personagem.agua;
    if (a >= AGUA_MAX) return { acao: null, texto: `${this.nome}: o regador já está cheio (${a}/${AGUA_MAX})` };
    return { acao: 'tirarAgua', texto: `${this.nome}: tirar água (regador ${a}/${AGUA_MAX})` };
  }
  aoIniciar(nome, m, acao) { super.aoIniciar(nome, m, acao); this.estado = 'tirando'; }
  aoEfeito(nome, m) { const antes = m.personagem.agua; m.personagem.agua = AGUA_MAX; m.avisar({ tipo: 'agua', n: AGUA_MAX - antes, de: this.id }); }
  aoTerminar() { super.aoTerminar(); this.estado = 'ocioso'; }
  // Coreografia de "tirar água" em função do tempo da ação (a mesma conta serve ao personagem e ao poço).
  static coreografia(t) {
    const K = TIRAR_AGUA, fimGiro = K.alcanca + K.gira;
    const sobe = suave((t - K.alcanca) / K.gira);
    const cai = Math.min(1, Math.max(0, (t - K.despejaAte) / K.solta)) ** 2;
    return {
      angulo: K.voltas * TAU * (sobe - cai), // manivela (radianos); volta girando solta no fim
      balde: sobe - cai, // 0 = no fundo, 1 = no alto
      despejo: janela(t, K.despejaDe, K.despejaAte, 0.22, 0.2), // 0..1: balde virado, água caindo no regador
      maos: janela(t, 0.12, fimGiro + 0.18, 0.25, 0.22), // 0..1: mãos na manivela
    };
  }
  visual() {
    const a = this.acao;
    return { estado: this.estado, t: a ? a.t : 0, acao: this._acaoVisual(), ...(a ? Poco.coreografia(a.t) : { angulo: 0, balde: 0, despejo: 0, maos: 0 }) };
  }
}

// ---------------- Celeiro ----------------
export class Celeiro extends Base {
  constructor(id, def) { super(id, def); this.estado = 'fechado'; this.abertura = 0; this.estoque = Object.fromEntries(ITENS.map((i) => [i, 0])); this.t = 0; }
  passo() {
    this.t += PASSO;
    if (this.estado === 'abrindo') { this.abertura = Math.min(1, this.abertura + PASSO / CELEIRO.abrir); if (this.abertura >= 1) { this.estado = 'aberto'; this.t = 0; } }
    else if (this.estado === 'fechando') { this.abertura = Math.max(0, this.abertura - PASSO / CELEIRO.fechar); if (this.abertura <= 0) { this.estado = 'fechado'; this.t = 0; } }
  }
  abrir() { if (this.estado === 'fechado' || this.estado === 'fechando') { this.estado = 'abrindo'; this.t = 0; } }
  fechar() { if (this.estado === 'aberto' || this.estado === 'abrindo') { this.estado = 'fechando'; this.t = 0; } }
  acaoPossivel(m) {
    const c = m.personagem.carga, tem = ITENS.filter((i) => c[i] > 0).map((i) => `${c[i]} ${i}`);
    return { acao: 'guardar', texto: tem.length ? `${this.nome}: entrar e guardar ${tem.join(', ')}` : `${this.nome}: entrar (não há nada na mão para guardar)` };
  }
  visual() { return { estado: this.estado, abertura: this.abertura, t: this.t, estoque: this.estoque }; }
}

// ---------------- Laranjeira ----------------
export class Arvore extends Base {
  constructor(id, def) {
    super(id, def);
    this.estado = 'ociosa';
    this.frutas = [1, 1, 0]; // uma vaga por fruta: 1 = madura
    this.iCresce = 2; // vaga da fruta que está crescendo (-1 = árvore cheia)
    this.matura = 0.35; // 0..1: quanto essa fruta já cresceu
    this.alvo = -1; // vaga que está sendo colhida
  }
  get maduras() { return this.frutas.reduce((s, f) => s + f, 0); }
  passo() {
    if (this.iCresce >= 0) {
      this.matura += PASSO / TEMPOS.laranja;
      if (this.matura >= 1) { this.frutas[this.iCresce] = 1; this.matura = 0; this.iCresce = this.frutas.indexOf(0); }
    }
  }
  acaoPossivel() {
    if (this.maduras > 0) return { acao: 'colherFruta', texto: `${this.nome}: colher uma laranja (${this.maduras} madura${this.maduras > 1 ? 's' : ''})` };
    return { acao: null, texto: `${this.nome}: laranjas amadurecendo, faltam ${Math.ceil((1 - this.matura) * TEMPOS.laranja)} s` };
  }
  aoIniciar(nome, m, acao) { super.aoIniciar(nome, m, acao); this.estado = 'colhendo'; this.alvo = this.frutas.indexOf(1); }
  aoEfeito(nome, m) {
    this.frutas[this.alvo] = 0;
    if (this.iCresce < 0) { this.iCresce = this.alvo; this.matura = 0; }
    m.ganhar('laranja', 1, this.id);
  }
  aoTerminar() { super.aoTerminar(); this.estado = 'ociosa'; this.alvo = -1; }
  visual() { return { estado: this.estado, frutas: this.frutas, matura: this.matura, crescendo: this.iCresce, alvo: this.alvo, acao: this._acaoVisual() }; }
}

// ---------------- Ninho ----------------
export class Ninho extends Base {
  constructor(id, def) { super(id, def); this.estado = 'vazio'; this.ovos = 0; this.ovoEm = TEMPOS.ovo.primeiro; this.ocupado = false; this.chamou = false; }
  passo() {
    if (this.ovos === 0 && !this.ocupado && !this.acao && this.ovoEm > 0) this.ovoEm -= PASSO;
    this.estado = this.ovos > 0 ? 'comOvo' : 'vazio';
  }
  // a galinha poedeira pergunta se é hora de ir botar
  horaDeBotar() { return this.ovos === 0 && !this.ocupado && !this.acao && this.ovoEm <= 0; }
  botou() { this.ovos = 1; this.ocupado = false; this.ovoEm = TEMPOS.ovo.depois; this.estado = 'comOvo'; }
  acaoPossivel() {
    if (this.ocupado) return { acao: null, texto: `${this.nome}: a galinha está botando` };
    if (this.ovos > 0) return { acao: 'pegarOvo', texto: `${this.nome}: pegar o ovo` };
    return { acao: null, texto: `${this.nome}: vazio, a galinha bota em uns ${Math.max(1, Math.ceil(this.ovoEm + 3))} s` };
  }
  aoEfeito(nome, m) { this.ovos = 0; this.estado = 'vazio'; m.ganhar('ovo', 1, this.id); }
  visual() { return { estado: this.estado, ovos: this.ovos, ocupado: this.ocupado, acao: this._acaoVisual() }; }
}
