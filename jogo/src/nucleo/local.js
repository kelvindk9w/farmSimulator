// Um local do mundo (a fazenda, o celeiro por dentro...): malha de casas de 1 unidade, tipo de chão, de quem é a terra,
// o que ocupa cada casa e a lista de entidades. A personagem está em um local por vez.
import { TIPOS } from './registro.js';

export const GRAMA = 0, ARADA = 1, CAMINHO = 2;

export class Local {
  constructor(id, largura, profundidade) {
    this.id = id;
    this.l = largura; // casas em X
    this.p = profundidade; // casas em Z
    const n = largura * profundidade;
    this.chao = new Uint8Array(n); // GRAMA | ARADA | CAMINHO
    this.propria = new Uint8Array(n); // 1 = terra do jogador (só nela se anda e se trabalha)
    this.ocupa = new Int32Array(n); // 0 = livre; senão, o número da entidade que bloqueia a casa
    this.plantas = new Array(n).fill(null); // o que a lavoura plantou em cada casa
    this.plantadas = []; // índices das casas com planta (para percorrer sem varrer o mapa)
    this.entidades = []; // todas, na ordem de criação
    this.porId = {};
    this.porNum = [null]; // número → entidade (o número 0 é "ninguém")
    this.entrada = [0.5, 0.5]; // onde a personagem aparece ao entrar
    this.versao = 0; // sobe a cada entidade posta ou tirada (o desenho refaz as suas listas quando muda)
  }

  dentro(x, z) { return x >= 0 && z >= 0 && x < this.l && z < this.p; }
  i(x, z) { return z * this.l + x; }
  chaoEm(x, z) { return this.dentro(x, z) ? this.chao[z * this.l + x] : -1; }
  ehPropria(x, z) { return this.dentro(x, z) && this.propria[z * this.l + x] === 1; }
  // dá para pisar: dentro do mapa, em terra própria e sem construção em cima
  andavel(x, z) {
    if (x < 0 || z < 0 || x >= this.l || z >= this.p) return false;
    const i = z * this.l + x;
    return this.propria[i] === 1 && this.ocupa[i] === 0;
  }
  // a entidade que bloqueia a casa, ou null
  entidadeEm(x, z) { return this.dentro(x, z) ? this.porNum[this.ocupa[z * this.l + x]] || null : null; }

  // e = { id, tipo, x, z, ... }: x e z são o canto de menor X e Z da base; o tamanho vem do tipo (ou de e.l, e.p)
  por(e) {
    const t = TIPOS[e.tipo];
    if (!t) throw new Error(`tipo de entidade desconhecido: "${e.tipo}"`);
    if (this.porId[e.id]) throw new Error(`entidade "${e.id}" repetida no local "${this.id}"`);
    if (!e.l) e.l = t.casas[0];
    if (!e.p) e.p = t.casas[1];
    e.num = this.porNum.length;
    this.porNum.push(e);
    this.porId[e.id] = e;
    this.entidades.push(e);
    this.versao++;
    if (t.bloqueia) for (let z = e.z; z < e.z + e.p; z++) for (let x = e.x; x < e.x + e.l; x++) if (this.dentro(x, z)) this.ocupa[this.i(x, z)] = e.num;
    return e;
  }

  tirar(id) {
    const e = this.porId[id];
    if (!e) return null;
    for (let z = e.z; z < e.z + e.p; z++) for (let x = e.x; x < e.x + e.l; x++) if (this.dentro(x, z) && this.ocupa[this.i(x, z)] === e.num) this.ocupa[this.i(x, z)] = 0;
    this.porNum[e.num] = null;
    delete this.porId[id];
    this.entidades.splice(this.entidades.indexOf(e), 1);
    this.versao++;
    return e;
  }

  // a área [x0, z0, x1, z1) está toda dentro do mapa, em terra própria e sem nada em cima?
  areaLivre(x0, z0, x1, z1) {
    for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) if (!this.andavel(x, z)) return false;
    return true;
  }
}
