// A tela de subida de nível é hoje uma variante da tela de recompensa (ui/recompensa.js). Este arquivo guarda os
// nomes que o resto do jogo já usava: "subida aberta" quer dizer qualquer tela que cobre o jogo e pega as setas
// (recompensa ou pergunta), e fechar fecha a que estiver na frente.
import { prepararRecompensa, recompensaAberta, fecharRecompensa, mostrarRecompensa } from './recompensa.js';
import { dialogoAberto, fecharDialogo } from './dialogo.js';

export function prepararSubida(ui) { prepararRecompensa(ui); }
export const subidaAberta = () => dialogoAberto() || recompensaAberta();
export function fecharSubida() { return fecharDialogo() || fecharRecompensa(); }
// d = o evento subiuDeNivel: { nivel, recompensa, liberou }
export function mostrarSubida(d) { mostrarRecompensa({ tipo: 'nivel', numero: d.nivel, recompensa: d.recompensa, liberou: d.liberou }); }
