// O que as partes do jogo no navegador compartilham: o mundo em uso, os dados, o desenho e as preferências.
// main.js preenche; interface e entrada só leem (e chamam J.mundo.comando).
export const PREFS_PADRAO = { som: true, esquema: 'os-dois', botoes: 'normal', zoom: 0 };

export const J = {
  dados: null, // o que prepararDados() devolveu
  mundo: null, // troca ao importar ou recomeçar: ninguém guarda a referência, todos leem J.mundo
  cena: null,
  atlas: null,
  teste: false, // #teste: o relógio só anda quando a ferramenta manda
  toque: false, // o aparelho tem tela de toque
  prefs: { ...PREFS_PADRAO },
  gravarPrefs() {},
  gravarLogo() {}, // pede uma gravação no fim deste quadro
  trocarMundo() {}, // (obj | null): carrega uma gravação importada ou recomeça do zero
  meio: 'mouse', // o último jeito de jogar usado: 'toque' | 'mouse' | 'teclas'
};
