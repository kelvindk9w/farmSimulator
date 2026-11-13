// O que cada frente liga aos eventos de um mundo quando ele entra em uso (jogo novo, gravação aberta, importação).
// Em vez de editar retorno.js ou main.js, a frente chama no seu próprio arquivo de interface:
//   aoInstalarMundo((mundo, ctx) => { mundo.eventos.ouvir('construiu', (d) => ...); })
//   ctx = { tutorial, hud }
// main.js chama ligarFrentes() logo depois de ligarRetorno(), a cada mundo instalado.
export const AO_INSTALAR = [];
export function aoInstalarMundo(f) { AO_INSTALAR.push(f); }
export function ligarFrentes(m, ctx) { for (const f of AO_INSTALAR) f(m, ctx); }
