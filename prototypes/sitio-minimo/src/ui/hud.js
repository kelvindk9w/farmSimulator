// Interface em HTML por cima da tela: contadores, linha de dica, botões e os avisos "+1 milho" que sobem.
import { ITENS, NOME_ITEM, AGUA_MAX } from '../jogo/contrato.js';

const COR_ITEM = { milho: '#f4c532', leite: '#ffffff', ovo: '#f6e7cf', laranja: '#f58d27' };
const el = (tag, cls, texto) => { const e = document.createElement(tag); if (cls) e.className = cls; if (texto !== undefined) e.textContent = texto; return e; };

export class Hud {
  constructor(raiz) {
    this.raiz = raiz;
    raiz.replaceChildren();
    this.topo = el('div', 'topo');
    const cont = el('div', 'contadores');
    // regador: três gotas
    this.agua = el('div', 'chip'); this.agua.append(el('b', '', 'Regador'));
    this.gotas = []; for (let i = 0; i < AGUA_MAX; i++) { const g = el('span', 'gota'); this.gotas.push(g); this.agua.append(g); }
    this.aguaNum = el('span', '', '0/3'); this.agua.append(this.aguaNum);
    // o que ele carrega e o que há no celeiro: um número por item
    const lista = (titulo) => {
      const chip = el('div', 'chip'); chip.append(el('b', '', titulo));
      const nums = {};
      for (const i of ITENS) { const s = el('span', 'item zero'); const b = el('span', 'bola'); b.style.background = COR_ITEM[i]; const n = el('span', '', '0'); s.append(b, el('span', '', NOME_ITEM[i]), n); s.title = NOME_ITEM[i]; chip.append(s); nums[i] = [s, n]; }
      return [chip, nums];
    };
    [this.mao, this.maoNum] = lista('Na mão');
    [this.celeiro, this.celeiroNum] = lista('Celeiro');
    cont.append(this.agua, this.mao, this.celeiro);
    const bot = el('div', 'botoes');
    this.btDemo = el('button', '', 'Demonstração'); this.btDemo.type = 'button';
    this.btArte = el('button', '', 'Arte'); this.btArte.type = 'button';
    this.btZoom = el('button', '', 'Ver de perto'); this.btZoom.type = 'button';
    bot.append(this.btDemo, this.btArte, this.btZoom);
    this.topo.append(cont, bot);
    this.rodape = el('div', 'rodape');
    this.dica = el('div', 'dica', '');
    this.rodape.append(this.dica);
    this.camada = el('div', 'rotulos');
    raiz.append(this.camada, this.topo, this.rodape);
    this.rotulos = [];
    this._txt = {};
  }

  _por(e, chave, texto) { if (this._txt[chave] !== texto) { this._txt[chave] = texto; e.textContent = texto; } }

  // c = mundo.contadores()
  contadores(c) {
    this.gotas.forEach((g, i) => g.classList.toggle('cheia', i < c.agua));
    this._por(this.aguaNum, 'agua', `${c.agua}/${c.aguaMax}`);
    for (const i of ITENS) {
      for (const [prefixo, nums] of [['mao.', this.maoNum], ['celeiro.', this.celeiroNum]]) {
        const v = c[prefixo + i], [s, n] = nums[i];
        this._por(n, prefixo + i, String(v)); s.classList.toggle('zero', v === 0);
      }
    }
  }
  definirDica(texto, previa = false) { this._por(this.dica, 'dica', texto); this.dica.classList.toggle('previa', previa); this.dica.style.visibility = texto ? '' : 'hidden'; }
  definirDemo(ligada) { this.btDemo.classList.toggle('ligado', ligada); this._por(this.btDemo, 'demo', ligada ? 'Parar demonstração' : 'Demonstração'); }
  definirArte(rotulo) { this._por(this.btArte, 'arte', 'Arte: ' + rotulo); }
  definirZoom(perto) { this._por(this.btZoom, 'zoom', perto ? 'Ver tudo' : 'Ver de perto'); }

  // espaço que a interface ocupa em cima e embaixo (px), para a câmera enquadrar o sítio no que sobra
  margens() {
    if (document.body.classList.contains('sem-hud')) return { cima: 6, baixo: 6, esq: 6, dir: 6 };
    const t = this.topo.getBoundingClientRect(), r = this.rodape.getBoundingClientRect();
    return { cima: Math.round(t.bottom) + 6, baixo: Math.round(innerHeight - r.top) + 6, esq: 6, dir: 6 };
  }

  // aviso que nasce num ponto do mundo e sobe (animado pelos passos da simulação, não pelo relógio)
  aviso(texto, x, y, z, passo, cor) {
    const e = el('div', 'rotulo', texto);
    if (cor) e.style.background = cor;
    this.camada.append(e);
    // avisos que nascem juntos no mesmo ponto não ficam um em cima do outro
    const juntos = this.rotulos.filter((r) => r.passo === passo && r.x === x && r.z === z).length;
    this.rotulos.push({ e, x, y: y + juntos * 0.42, z, passo });
  }
  anel(px, py) { const a = el('div', 'anel'); a.style.left = px + 'px'; a.style.top = py + 'px'; this.camada.append(a); a.addEventListener('animationend', () => a.remove()); }
  // reposiciona os avisos; chamar a cada quadro
  avisos(passo, cena) {
    const p = [0, 0];
    for (let i = this.rotulos.length - 1; i >= 0; i--) {
      const r = this.rotulos[i], idade = passo - r.passo;
      if (idade > 80 || idade < 0) { r.e.remove(); this.rotulos.splice(i, 1); continue; }
      const k = Math.min(1, idade / 80), sobe = 1 - (1 - k) * (1 - k);
      cena.paraTela(r.x, r.y + sobe * 0.9, r.z, p);
      const escala = idade < 8 ? 0.6 + 0.5 * (idade / 8) : 1.1 - 0.1 * Math.min(1, (idade - 8) / 6);
      r.e.style.transform = `translate(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px) translate(-50%, -100%) scale(${escala.toFixed(3)})`;
      r.e.style.opacity = idade < 60 ? '1' : (1 - (idade - 60) / 20).toFixed(2);
    }
  }
  limparAvisos() { for (const r of this.rotulos) r.e.remove(); this.rotulos.length = 0; }
}
