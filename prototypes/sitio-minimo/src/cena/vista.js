// Vista: liga cada entidade da lógica ao seu visual. É o único lugar que conhece os dois lados.
// A cada passo: lê "visual()" da entidade, põe a raiz no lugar (posição e giro) e chama definirEstado + atualizar.
// Também faz a ponte entre visuais: entrega ao personagem os pontos do objeto em que ele está mexendo
// (para a mão ir até a manivela, o úbere, a fruta...) e entrega ao objeto a posição das mãos do personagem.
import * as THREE from 'three';
import { criarVisual, conferirVisual, listarConjuntos, temVisual } from '../arte/registro.js';

export class Vista {
  // config: { padrao: 'codigo', porTipo: { tipo: conjunto } }  (config/arte.json)
  constructor(cena, mundo, config) {
    this.cena = cena; this.mundo = mundo;
    this.conjuntoPorTipo = {};
    this.entidades = [];
    const sitio = mundo.sitio;
    const fixo = (id, tipo) => ({ id, tipo, def: {}, ler: () => ({ estado: 'normal' }), pos: () => [0, 0, 0] });
    this.entidades.push(fixo('chao', 'chao'), fixo('cerca', 'cerca'));
    for (const [id, o] of Object.entries(mundo.objetos)) this.entidades.push({ id, tipo: o.tipo, def: sitio.objetos[id], ler: () => o.visual(), pos: () => [o.x, o.z, o.rumo !== undefined ? o.rumo : o.giro || 0] });
    const p = mundo.personagem;
    this.personagem = { id: 'personagem', tipo: 'personagem', def: {}, ler: () => p.visual(), pos: () => [p.x, p.z, p.rumo] };
    this.entidades.push(this.personagem);
    this.porId = new Map(this.entidades.map((e) => [e.id, e]));
    // um conjunto pode não ter todos os tipos: o que faltar fica com o conjunto padrão
    for (const e of this.entidades) { const c = (config.porTipo && config.porTipo[e.tipo]) || config.padrao; this.conjuntoPorTipo[e.tipo] = temVisual(c, e.tipo) ? c : config.padrao; }
    for (const e of this.entidades) this._criar(e);
    this._maos = { D: new THREE.Vector3(), E: new THREE.Vector3() };
    this._alvo = {};
  }

  _criar(e) {
    if (e.visual) e.visual.descartar();
    e.visual = criarVisual(this.conjuntoPorTipo[e.tipo], e.tipo, { id: e.id, tipo: e.tipo, def: e.def, sitio: this.mundo.sitio });
    this.cena.arte.add(e.visual.raiz);
  }

  // troca a arte de um tipo (ou de todos) na hora, sem recarregar e sem mexer na lógica
  definirConjuntoDoTipo(tipo, conjunto) {
    if (this.conjuntoPorTipo[tipo] === conjunto || !temVisual(conjunto, tipo)) return; // se o conjunto não tem este tipo, fica como está
    this.conjuntoPorTipo[tipo] = conjunto;
    for (const e of this.entidades) if (e.tipo === tipo) this._criar(e);
    this.atualizar(0);
  }
  definirConjunto(conjunto) { for (const tipo of Object.keys(this.conjuntoPorTipo)) this.definirConjuntoDoTipo(tipo, conjunto); }
  // nome do conjunto em uso se todos os tipos usam o mesmo; senão 'misto'
  conjuntoAtual() { const s = new Set(Object.values(this.conjuntoPorTipo)); return s.size === 1 ? [...s][0] : 'misto'; }
  proximoConjunto() { const l = listarConjuntos(), a = this.conjuntoAtual(); return l[(l.indexOf(a) + 1) % l.length]; }
  // problemas de contrato de todos os visuais em uso
  problemas() { const out = []; for (const e of this.entidades) for (const p of conferirVisual(e.tipo, e.visual)) out.push(`${e.id} (${e.visual.conjunto}): ${p}`); return out; }

  _um(e, dt, extra) {
    const v = e.visual, d = e.ler(), [x, z, giro] = e.pos();
    v.raiz.position.set(x, 0, z);
    v.raiz.rotation.y = giro;
    if (extra) Object.assign(d, extra);
    v.definirEstado(d.estado, d);
    v.atualizar(dt);
    if (v.fimDoQuadro) v.fimDoQuadro();
    return d;
  }

  // chamar depois de cada passo da lógica (dt = 1/60) e depois de trocar a arte (dt = 0)
  atualizar(dt) {
    const pers = this.mundo.personagem, alvoId = pers.acao ? pers.acao.alvo : null;
    const vp = this.personagem.visual;
    // mãos do personagem no mundo (do quadro anterior), para o objeto em que ele mexe
    let maos = null;
    if (alvoId && vp.pontos.maoD) {
      vp.raiz.updateMatrixWorld(true);
      maos = { D: this._maos.D.copy(vp.pontos.maoD).applyMatrix4(vp.raiz.matrixWorld), E: this._maos.E.copy(vp.pontos.maoE).applyMatrix4(vp.raiz.matrixWorld) };
    }
    for (const e of this.entidades) if (e !== this.personagem) this._um(e, dt, e.id === alvoId ? { maos } : null);
    // pontos do objeto-alvo no mundo, para o personagem
    let alvoPontos = null;
    const idAlvo = alvoId || (pers.plano && pers.plano.alvo) || null;
    if (idAlvo && this.porId.has(idAlvo)) {
      const va = this.porId.get(idAlvo).visual;
      va.raiz.updateMatrixWorld(true);
      alvoPontos = {};
      for (const [n, p] of Object.entries(va.pontos)) alvoPontos[n] = (this._alvo[n] || (this._alvo[n] = new THREE.Vector3())).copy(p).applyMatrix4(va.raiz.matrixWorld);
    }
    this._um(this.personagem, dt, { alvoPontos });
  }
}
