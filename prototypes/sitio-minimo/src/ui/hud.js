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
    // teste de estilos: o medidor de desempenho e a imagem-alvo do conjunto de arte atual (os dois ficam depois dos três
    // botões de sempre, para a ordem deles não mudar)
    this.btMedidor = el('button', '', 'Medidor'); this.btMedidor.type = 'button';
    this.btAlvo = el('button', '', 'Ver alvo'); this.btAlvo.type = 'button'; this.btAlvo.hidden = true;
    bot.append(this.btDemo, this.btArte, this.btZoom, this.btMedidor, this.btAlvo);
    this.topo.append(cont, bot);
    this.medidor = el('div', 'chip medidor'); this.medidor.hidden = true;
    this.medidorQps = el('span', '', ''); this.medidorCena = el('span', '', '');
    this.medidor.append(this.medidorQps, this.medidorCena);
    this.rodape = el('div', 'rodape');
    this.dica = el('div', 'dica', '');
    // a imagem-alvo divide a tela com o jogo: embaixo dele na tela em pé, à direita na tela deitada; tocar nela fecha
    this.alvo = el('div', 'alvo'); this.alvo.hidden = true;
    this.alvoImg = el('img'); this.alvoImg.alt = 'Imagem-alvo do estilo';
    this.alvo.append(el('b', '', 'O alvo deste estilo (toque para fechar)'), this.alvoImg);
    this.rodape.append(this.alvo, this.medidor, this.dica);
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
  // medidor: m = { qps, menor, pior (ms), chamadas, triangulos } ou null para esconder
  definirMedidor(m) {
    this.medidor.hidden = !m; this.btMedidor.classList.toggle('ligado', !!m);
    if (!m) return;
    this._por(this.medidorQps, 'qps', m.qps === null ? 'Medindo…' : `${m.qps} quadros por segundo (menor: ${m.menor}; pior quadro: ${m.pior} ms)`);
    this._por(this.medidorCena, 'cena', `${m.chamadas} chamadas de desenho · ${m.triangulos >= 10000 ? Math.round(m.triangulos / 1000) + ' mil' : m.triangulos} triângulos`);
  }
  // imagem-alvo do conjunto atual: endereco = arquivo da imagem, ou null quando o conjunto não tem alvo
  definirAlvo(endereco) { this.enderecoDoAlvo = endereco || null; this.btAlvo.hidden = !endereco; if (!endereco) this.mostrarAlvo(false); else if (!this.alvo.hidden) this.alvoImg.src = endereco; }
  mostrarAlvo(mostra) {
    const m = !!(mostra && this.enderecoDoAlvo);
    if (m) this.alvoImg.src = this.enderecoDoAlvo; // só baixa a imagem quando alguém pede para ver
    this.alvo.hidden = !m; this.raiz.classList.toggle('com-alvo', m); this.btAlvo.classList.toggle('ligado', m); this._por(this.btAlvo, 'alvo', m ? 'Fechar alvo' : 'Ver alvo');
  }

  // espaço que a interface ocupa em cima e embaixo (px), para a câmera enquadrar o sítio no que sobra
  margens() {
    if (document.body.classList.contains('sem-hud')) return { cima: 6, baixo: 6, esq: 6, dir: 6 };
    const t = this.topo.getBoundingClientRect(), r = this.rodape.getBoundingClientRect();
    // com a imagem-alvo aberta na tela deitada, o jogo fica com a parte da tela à esquerda dela
    const a = !this.alvo.hidden && getComputedStyle(this.alvo).position === 'fixed' ? this.alvo.getBoundingClientRect() : null;
    return { cima: Math.round(t.bottom) + 6, baixo: Math.round(innerHeight - r.top) + 6, esq: 6, dir: a ? Math.round(innerWidth - a.left) + 6 : 6 };
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
