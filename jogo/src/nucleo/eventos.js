// Avisos da lógica para quem quiser ouvir (interface, som, partículas, missões, conquistas, jogador automático).
// A lógica nunca chama a interface: ela emite, e quem ouve decide o que fazer.
export class Eventos {
  constructor() { this.porTipo = {}; this.gerais = []; }

  // ouvir('colheu', fn) ou ouvir('*', fn) para todos; devolve a função que desliga
  ouvir(tipo, fn) {
    const lista = tipo === '*' ? this.gerais : (this.porTipo[tipo] || (this.porTipo[tipo] = []));
    lista.push(fn);
    return () => { const i = lista.indexOf(fn); if (i >= 0) lista.splice(i, 1); };
  }

  emitir(tipo, dados) {
    const l = this.porTipo[tipo];
    if (l) for (let i = 0; i < l.length; i++) l[i](dados, tipo);
    const g = this.gerais;
    for (let i = 0; i < g.length; i++) g[i](dados, tipo);
  }
}
