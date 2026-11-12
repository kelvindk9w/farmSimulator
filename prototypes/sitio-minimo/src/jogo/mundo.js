// O mundo: junta os objetos, o personagem e as regras. Só lógica: passo fixo de 1/60 s, determinístico, sem desenho.
// Quem desenha lê "visual()" de cada entidade; quem comanda chama tocar(id) / tocarChao(x, z).
import { Sorteio, localParaMundo, resumo } from './util.js';
import { TIPOS, ITENS, AGUA_MAX } from './contrato.js';
import { SITIO } from './sitio.js';
import { Navegacao } from './caminho.js';
import { Canteiro, Poco, Celeiro, Arvore, Ninho } from './objetos.js';
import { Vaca, Galinha } from './animais.js';
import { Personagem } from './personagem.js';

const CLASSES = { canteiro: Canteiro, poco: Poco, celeiro: Celeiro, arvore: Arvore, ninho: Ninho, vaca: Vaca, galinha: Galinha };

export class Mundo {
  constructor(sitio = SITIO, semente = 20261112) {
    this.sitio = sitio;
    this.n = 0; // passos já dados
    this.sorteio = new Sorteio(semente);
    this.nav = new Navegacao(sitio);
    this.objetos = {};
    for (const [id, def] of Object.entries(sitio.objetos)) this.objetos[id] = new CLASSES[def.tipo](id, def, sitio);
    this.personagem = new Personagem(sitio.inicio);
    this.eventos = []; // avisos para a interface (quem lê, esvazia): { tipo, ... }
    this.registro = []; // ações concluídas: { passo, acao, alvo, contadores }
    this.dica = 'Toque num objeto ou no chão.';
  }

  // avança 1/60 s
  passo() {
    this.personagem.passo(this);
    for (const id in this.objetos) this.objetos[id].passo(this);
    this.n++;
  }

  // ---- comandos (o mesmo caminho para o dedo, o mouse e o roteiro) ----
  _alvo(id) { const o = this.objetos[id]; return o && o.tipo === 'galinha' ? this.objetos.ninho : o; }
  // o que um toque em "id" faria agora, sem fazer nada
  descrever(id) { const o = this._alvo(id); return o ? o.acaoPossivel(this) : { acao: null, texto: '' }; }
  // toque num objeto: o personagem vai até ele e faz o que couber no estado atual
  tocar(id) {
    const o = this._alvo(id);
    if (!o) return { acao: null, texto: '' };
    const d = o.acaoPossivel(this);
    this.dica = d.texto;
    this.personagem.comandar(this, { alvo: o.id, acao: d.acao });
    return d;
  }
  // vai até o objeto sem fazer nada (usado pelo roteiro para esperar ao lado)
  ir(id) { const o = this._alvo(id); this.personagem.comandar(this, { alvo: o.id, acao: null }); return { acao: null, texto: '' }; }
  // toque no chão: anda até lá (ou até o ponto livre mais próximo)
  tocarChao(x, z) {
    const p = this.nav.ajustar(x, z);
    if (!p) { this.dica = 'Não dá para ir até aí.'; return null; }
    this.dica = 'Andando até o ponto tocado.';
    this.personagem.comandar(this, { chao: p });
    return p;
  }

  // ---- pontos ----
  local(o, p) { return localParaMundo(o.x, o.z, o.giro || 0, p[0], p[2]); }
  // onde o personagem para e para onde olha, para agir sobre o objeto "o"
  pontoDeAcao(o, acao) {
    const P = TIPOS[o.tipo].pontos;
    if (o.tipo === 'celeiro') return { dest: this.local(o, P.porta), olhar: this.local(o, P.soleira) };
    if (o.tipo === 'vaca') {
      if (acao === 'ordenhar') return { dest: localParaMundo(o.x, o.z, o.rumo, P.ficar[0], P.ficar[2]), olhar: localParaMundo(o.x, o.z, o.rumo, P.olhar[0], P.olhar[2]) };
      return { dest: [...this.nav.porteiraFora], olhar: [o.x, o.z] }; // sem ordenha: olha a vaca da porteira
    }
    return { dest: this.local(o, P.ficar), olhar: this.local(o, P.olhar) };
  }
  // caixas de toque de cada objeto, em coordenadas de mundo: [{ id, min: [x,y,z], max: [x,y,z] }]
  alvosDeToque() {
    const out = [];
    for (const id in this.objetos) {
      const o = this.objetos[id], t = TIPOS[o.tipo].toque;
      if (!t) continue;
      const [w, h, d, des = [0, 0, 0]] = t;
      const r = o.rumo || 0, c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r));
      const hx = (w * c + d * s) / 2, hz = (w * s + d * c) / 2;
      out.push({ id, min: [o.x + des[0] - hx, 0, o.z + des[2] - hz], max: [o.x + des[0] + hx, h, o.z + des[2] + hz] });
    }
    return out;
  }

  // ---- regras chamadas pelas entidades ----
  avisar(ev) { this.eventos.push(ev); }
  ganhar(item, n, de) { this.personagem.carga[item] += n; this.eventos.push({ tipo: 'item', item, n, de }); }
  guardar() {
    const c = this.personagem.carga, e = this.objetos.celeiro.estoque, itens = {};
    for (const i of ITENS) if (c[i] > 0) { e[i] += c[i]; itens[i] = c[i]; c[i] = 0; }
    this.eventos.push({ tipo: 'guardou', itens, de: 'celeiro' });
  }
  registrar(acao, alvo) { this.registro.push({ passo: this.n, acao, alvo, contadores: this.contadores() }); }

  // ---- leitura ----
  contadores() {
    const p = this.personagem, o = this.objetos, c = { agua: p.agua, aguaMax: AGUA_MAX };
    for (const i of ITENS) { c['mao.' + i] = p.carga[i]; c['celeiro.' + i] = o.celeiro.estoque[i]; }
    for (const id in o) if (o[id].tipo === 'canteiro') { c[id] = o[id].estado; c[id + '.molhado'] = o[id].molhado; }
    c['ninho.ovos'] = o.ninho.ovos; c['arvore.maduras'] = o.arvore.maduras; c['vaca.leitePronto'] = o.vaca.leitePronto;
    return c;
  }
  // retrato completo do estado (texto) e o seu resumo: iguais em duas execuções = mesma simulação
  retrato() {
    return JSON.stringify({ n: this.n, s: this.sorteio.a, p: this.personagem, o: this.objetos }, (k, v) => {
      if (typeof v === 'number') return Math.round(v * 1e6) / 1e6;
      if (k === 'area' || k === 'ordenha' || k === 'ninho' && v && v.r) return undefined; // constantes da planta
      return v;
    });
  }
  resumo() { return resumo(this.retrato()); }
}
