// Roteiro fixo da "Demonstração": faz cada ação uma vez, pelos mesmos comandos que um toque faz.
// Como a simulação é determinística, o roteiro acontece sempre nos mesmos passos, com qualquer conjunto de arte.
// "espera" descreve o que tem de mudar nos contadores quando a ação termina (a ferramenta de verificação confere):
//   mais: { contador: variação }      igual: { contador: valor final }

export const ROTEIRO = [
  { tocar: 'poco', legenda: 'Tirar água no poço', acao: 'tirarAgua', espera: { mais: { agua: 3 } } },
  { tocar: 'canteiro2', legenda: 'Plantar milho', acao: 'plantar', espera: { igual: { canteiro2: 'semeado' } } },
  { tocar: 'canteiro2', legenda: 'Regar o canteiro', acao: 'regar', espera: { mais: { agua: -1 }, igual: { 'canteiro2.molhado': true } } },
  { quando: (m) => m.objetos.ninho.ovos > 0, tocar: 'ninho', legenda: 'Pegar o ovo', acao: 'pegarOvo', espera: { mais: { 'mao.ovo': 1, 'ninho.ovos': -1 } } },
  { tocar: 'celeiro', legenda: 'Guardar no celeiro', acao: 'guardar', espera: { mais: { 'celeiro.ovo': 1, 'mao.ovo': -1 } } },
  { tocar: 'arvore', legenda: 'Colher uma laranja', acao: 'colherFruta', espera: { mais: { 'mao.laranja': 1 } } },
  { quando: (m) => m.objetos.vaca.estado === 'esperandoOrdenha', tocar: 'vaca', legenda: 'Ordenhar a vaca', acao: 'ordenhar', espera: { mais: { 'mao.leite': 1 }, igual: { 'vaca.leitePronto': false } } },
  { ir: 'canteiro2', legenda: 'Voltar ao canteiro' },
  { quando: (m) => m.objetos.canteiro2.estado === 'pronto', tocar: 'canteiro2', legenda: 'Colher o milho', acao: 'colher', espera: { mais: { 'mao.milho': 1 }, igual: { canteiro2: 'vazio' } } },
];

export class Roteiro {
  constructor() {
    this.i = 0; this.andando = false; this.fim = false; this.fimEm = -1;
    this.legenda = ROTEIRO[0].legenda;
    this.marcas = []; // um registro por item do roteiro: { i, legenda, acao, de, ate, antes, depois, espera, falhou }
    this.ini = null;
  }
  // chamar ANTES de mundo.passo()
  passo(m) {
    if (this.fim) return;
    const p = m.personagem, e = ROTEIRO[this.i];
    if (!this.andando) {
      if (!p.livre()) return;
      if (e.quando && !e.quando(m)) { this.legenda = e.legenda + ' (esperando)'; return; }
      this.ini = { passo: m.n, concluidas: p.concluidas, antes: m.contadores() };
      const d = e.ir ? m.ir(e.ir) : m.tocar(e.tocar);
      this.ini.acao = d.acao;
      this.legenda = e.legenda; this.andando = true;
      return;
    }
    const terminou = p.concluidas > this.ini.concluidas;
    if (terminou || p.livre()) {
      // "ir" termina quando ele para; uma ação só vale se o número de ações concluídas subiu
      this.marcas.push({ i: this.i, legenda: e.legenda, acao: e.acao || null, comandada: this.ini.acao, de: this.ini.passo, ate: m.n, antes: this.ini.antes, depois: m.contadores(), espera: e.espera || null, falhou: !e.ir && (!terminou || this.ini.acao !== e.acao) });
      this.i++; this.andando = false;
      if (this.i >= ROTEIRO.length) { this.fim = true; this.fimEm = m.n; this.legenda = 'Fim da demonstração'; } else this.legenda = ROTEIRO[this.i].legenda;
    }
  }
}
