// O mundo: todo o estado do jogo e o relógio. Só lógica: passo fixo de 1/60 s, sem desenho.
// Cada sistema registrado (nucleo/sistemas) guarda o seu estado aqui dentro e responde aos seus comandos.
import { PASSO_MS, Sorteio } from './util.js';
import { Eventos } from './eventos.js';
import { SISTEMAS } from './registro.js';

export const VERSAO = 1; // formato da gravação; mudou o formato, sobe o número e entra uma migração em migrar()
const OK = Object.freeze({ ok: true });

export class Mundo {
  // dados: o que prepararDados() devolveu.  opc: { agora (ms), semente }
  constructor(dados, opc = {}) {
    this.dados = dados;
    this.agora = opc.agora || 0; // relógio do jogo, em ms; quem injeta é quem chama (jogo: relógio de verdade; teste: à mão)
    this.n = 0; // passos já dados
    this.sorteio = new Sorteio(opc.semente === undefined ? 20261113 : opc.semente);
    this.eventos = new Eventos();
    this.locais = {};
    this.comandos = {};
    this._passo = []; this._segundo = [];
    for (const s of SISTEMAS) {
      if (s.comandos) for (const k in s.comandos) {
        if (this.comandos[k]) throw new Error(`comando "${k}" definido por dois sistemas`);
        this.comandos[k] = s.comandos[k];
      }
      if (s.passo) this._passo.push(s);
      if (s.segundo) this._segundo.push(s);
    }
    for (const s of SISTEMAS) if (s.iniciar) s.iniciar(this);
  }

  // avança 1/60 s
  passo() {
    this.agora += PASSO_MS;
    const p = this._passo;
    for (let i = 0; i < p.length; i++) p[i].passo(this);
    this.n++;
    if (this.n % 60 === 0) { const s = this._segundo; for (let i = 0; i < s.length; i++) s[i].segundo(this); }
  }
  // avança "seg" segundos passo a passo (testes e ferramentas)
  avancar(seg) { for (let k = Math.round(seg * 60); k > 0; k--) this.passo(); }

  // Pula o relógio para "agora" (ms) sem simular passo a passo: cada sistema resolve a ausência por conta.
  // É o que roda ao abrir o jogo e quando a página volta de um tempo escondida. Devolve os segundos pulados.
  acertarRelogio(agora) {
    const seg = (agora - this.agora) / 1000;
    if (!(seg > 0)) return 0;
    this.agora = agora;
    for (const s of SISTEMAS) if (s.ausencia) s.ausencia(this, seg);
    this.eventos.emitir('relogioAcertado', { seg });
    return seg;
  }

  // Toda entrada do jogador passa por aqui. Devolve { ok, motivo, dados }: "motivo" é um código (ui/textos.js faz a frase).
  comando(c) {
    const f = this.comandos[c.tipo];
    if (!f) return { ok: false, motivo: 'comando-desconhecido', dados: { tipo: c.tipo } };
    return f(this, c) || OK;
  }

  get local() { return this.locais[this.personagem.local]; }

  salvar() {
    const sistemas = {};
    for (const s of SISTEMAS) if (s.salvar) sistemas[s.id] = s.salvar(this);
    return { versao: VERSAO, agora: Math.round(this.agora), sorteio: this.sorteio.a, sistemas };
  }

  // refaz o mundo a partir de uma gravação; lança erro com mensagem clara se ela não servir
  static carregar(dados, obj, opc = {}) {
    obj = migrar(obj);
    const m = new Mundo(dados, { ...opc, agora: obj.agora });
    m.sorteio.a = obj.sorteio >>> 0;
    for (const s of SISTEMAS) if (s.carregar && obj.sistemas[s.id] !== undefined) s.carregar(m, obj.sistemas[s.id]);
    m.eventos.emitir('carregou', {});
    return m;
  }
}

// traz uma gravação antiga para o formato atual
export function migrar(obj) {
  if (!obj || typeof obj !== 'object' || typeof obj.versao !== 'number' || !obj.sistemas) throw new Error('gravação inválida: não é uma gravação deste jogo');
  if (obj.versao > VERSAO) throw new Error(`gravação de uma versão mais nova (${obj.versao}) do que este jogo entende (${VERSAO})`);
  // if (obj.versao === 1) { ...; obj.versao = 2; }   ← as migrações entram aqui, uma por versão
  return obj;
}
