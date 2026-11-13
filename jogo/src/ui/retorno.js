// O retorno do que acontece no mundo: partículas, textos que sobem, avisos e a tela de subida de nível.
// Liga-se aos eventos de um mundo (e de novo quando o mundo é trocado por uma gravação importada).
import { J } from '../contexto.js';
import { T, frase, numero, tempo } from './textos.js';
import { avisar } from './avisos.js';
import { mostrarSubida } from './subida.js';
import { sujarPainel } from './paineis/registro.js';
import { estadoDaPlanta } from '../nucleo/sistemas/lavoura.js';

const DOURADO = '#ffe07a', AZUL = '#bfe6ff', VERDE = '#d9ffb0';
const GRAVA_LOGO = { comprou: 1, vendeuTudo: 1, colheu: 1, guardou: 1, pegou: 1, subiuDeNivel: 1, missaoConcluida: 1, pegouFerramenta: 1, socorro: 1 };

// quantas plantas estão prontas e quantas com sede (para o resumo da volta)
export function contarPlantas(m) {
  let prontas = 0, sede = 0;
  for (const id in m.locais) { const loc = m.locais[id]; for (const i of loc.plantadas) { const e = estadoDaPlanta(m, loc.plantas[i]); if (e === 'pronta') prontas++; else if (e === 'sede') sede++; } }
  return { prontas, sede };
}

export function ligarRetorno(m, tutorial) {
  const cena = J.cena, part = cena.part, D = m.dados, ev = m.eventos;
  const centro = (id) => { const e = m.local.porId[id]; return e ? [e.x + e.l / 2, e.z + e.p / 2] : [m.personagem.x, m.personagem.z]; };

  ev.ouvir('*', (d, tipo) => { sujarPainel(); if (GRAVA_LOGO[tipo]) J.gravarLogo(); });
  ev.ouvir('chaoMudou', (d) => { if (d.tudo) cena.chao.sujarTudo(); else cena.chao.sujar(d.x, d.z); });
  ev.ouvir('carregou', () => cena.chao.sujarTudo());

  ev.ouvir('faltou', (d) => { const t = frase(d.motivo, d.dados, D); if (t) avisar(t); });
  ev.ouvir('informou', (d) => { const t = frase(d.motivo, d.dados, D); if (t) avisar(t); });
  ev.ouvir('cansou', () => avisar(T.hud.cansada));

  ev.ouvir('arou', (d) => part.terra(d.x, d.z, 12));
  ev.ouvir('plantou', (d) => part.terra(d.x, d.z, 5));
  ev.ouvir('regou', (d) => part.regar(d.x, d.z));
  ev.ouvir('amadureceu', (d) => part.brilho(d.x + 0.5, 0.5, d.z + 0.5, 8));
  ev.ouvir('colheu', (d) => { part.folhas(d.x, d.z); part.texto(T.ganhos.colheu(d, D), d.x + 0.5, 0.9, d.z + 0.5, VERDE); });
  ev.ouvir('encheu', (d) => { const c = centro(d.entidade); part.espirrar(c[0], c[1]); part.texto(T.ganhos.encheu(d), c[0], 1.7, c[1], AZUL); });
  ev.ouvir('vendeuTudo', (d) => { const c = centro(d.entidade); part.brilho(c[0], 1.2, c[1], 12); part.texto(T.ganhos.vendeu(d), c[0], 1.9, c[1], DOURADO); });
  ev.ouvir('guardou', (d) => { const c = centro(d.entidade); part.texto(T.ganhos.guardou(d), c[0], 2.6, c[1] + 1.5); });
  ev.ouvir('pegou', (d) => { const c = centro(d.entidade); part.texto(T.ganhos.pegou(d), c[0], 2.6, c[1] + 1.5); });
  ev.ouvir('pegouFerramenta', (d) => avisar(T.ganhos.pegouFerramenta(d, D), 'bom'));
  ev.ouvir('ganhouXp', (d) => { const p = m.personagem; part.texto(T.ganhos.xp(d.n), p.x, 1.9, p.z, '#fff2a8'); });
  ev.ouvir('ganhouOuro', (d) => { if (d.origem !== 'banca') { const p = m.personagem; part.texto(`+${numero(d.n)} ${T.hud.ouro.toLowerCase()}`, p.x, 2.3, p.z, DOURADO); } });
  ev.ouvir('comprou', (d) => avisar(T.ganhos.comprou(d, D), 'bom'));
  ev.ouvir('socorro', (d) => avisar(T.ganhos.socorro(d, D), 'bom', 5000));
  ev.ouvir('missaoConcluida', (d) => { avisar(T.ganhos.missao(d), 'bom', 3600); if (tutorial) tutorial.concluiu(); });
  ev.ouvir('subiuDeNivel', (d) => mostrarSubida(d));

  // de volta depois de um tempo fora: um resumo curto, sem janela
  ev.ouvir('relogioAcertado', (d) => {
    if (!(d.seg >= 60)) return;
    const n = contarPlantas(m);
    avisar(T.ganhos.volta(d.seg, n), 'bom', 6000);
  });
}
export { tempo };
