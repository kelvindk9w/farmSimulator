// A entrada do jogador: toque e mouse, teclado e controle remoto, controle de videogame. Tudo vira comandos do mundo.
// Aqui fica também o que é comum: o alvo destacado (sob o cursor ou à frente da personagem), com o contorno dourado
// quando há uma ação para ele e o balãozinho da ação (ui/acoes.js), a linha de dica, o desenho do botão de agir e o zoom.
import { J } from '../contexto.js';
import { ligarToque } from './toque.js';
import { ligarTeclado } from './teclado.js';
import { ligarControle } from './controle.js';
import { ligarFileira } from './fileira.js';
import { ligarAgir } from './agir.js';
import { foco } from './foco.js';
import { alvoDaFrente } from '../nucleo/sistemas/personagem.js';
import { acoesDoAlvo } from '../nucleo/sistemas/acoes.js';
import { acoesUi, iconeDaOpcao, fraseDaOpcao } from '../ui/acoes.js';
import { trocarIcone } from '../ui/dom.js';

const DOURADO = '#ffe07a', BRANCO = '#ffffff';

export function ligarEntrada(hud) {
  const cena = J.cena, cam = cena.cam;
  const frente = { x: 0, z: 0, entidade: undefined };
  let relogio = 0, some = 0, guardar = 0;
  const cursor = { x: -1, z: -1, entidade: null }; // o que o mouse ou o dedo aponta
  let ok = false; // o alvo destacado tem uma ação que dá agora (o contorno fica dourado)
  const icAgir = hud.agir && hud.agir.querySelector('canvas');

  const entrada = {
    usouTeclas() { cursor.x = -1; cursor.entidade = null; },
    usouPonteiro() {},
    // casa ou entidade apontada pelo ponteiro; "depois" segundos até sumir sozinha (toque)
    destacar(x, z, entidade, depois = 0) {
      if (depois > 0) { some = depois; return; }
      some = 0; cursor.x = x; cursor.z = z; cursor.entidade = entidade; relogio = 0;
    },
    zoom(fator, direto) { cam.zoomEm(fator, cam.w / 2, cam.h / 2, !!direto); entrada.guardarZoom(); },
    // o zoom escolhido fica guardado (como fração do zoom padrão da tela)
    guardarZoom() { guardar = 0.8; },
    lerControle: null,

    atualizar(dt) {
      const m = J.mundo, d = cena.destaque;
      if (entrada.lerControle) entrada.lerControle(dt);
      entrada.fileira.atualizar(dt); // segurar numa casa do campo: a fileira toda
      entrada.agir.atualizar(dt); // segurar o botão de agir num alvo com várias ações: a roda
      if (guardar > 0) { guardar -= dt; if (guardar <= 0) { J.prefs.zoom = +(cam.alvoE / cam.base).toFixed(3); J.gravarPrefs(); } }
      if (some > 0) { some -= dt; if (some <= 0) { cursor.x = -1; cursor.entidade = null; } }
      // o destaque: com a roda aberta, o alvo dela; nas teclas, a casa à frente dela; no ponteiro, a casa apontada
      let x = -1, z = -1, ent = null;
      const R = acoesUi.rodaAberta && acoesUi.rodaAlvo;
      if (R) { if (R.entidade !== undefined && R.entidade !== null) ent = R.entidade; else { x = R.x; z = R.z; } }
      else if (J.meio === 'teclas' && !foco.menu) { alvoDaFrente(m, frente); if (frente.entidade !== undefined) ent = frente.entidade; else if (m.local.dentro(frente.x, frente.z)) { x = frente.x; z = frente.z; } }
      else if (cursor.entidade !== null) ent = cursor.entidade;
      else if (cursor.x >= 0 && m.local.dentro(cursor.x, cursor.z)) { x = cursor.x; z = cursor.z; }
      d.x = x; d.z = z; d.entidade = ent;
      d.cor = ok || R ? DOURADO : BRANCO;
      // a ação do alvo, o balão e a dica: umas vezes por segundo
      relogio -= dt;
      if (relogio > 0) return;
      relogio = 0.2;
      let texto = '';
      d.casas = null;
      const alvo = ent !== null ? { entidade: ent } : x >= 0 ? { x, z } : null;
      const opcoes = alvo ? acoesDoAlvo(m, alvo) : null, o = opcoes && opcoes[0];
      ok = !!(o && o.ok);
      if (o) texto = fraseDaOpcao(o, m.dados);
      if (o && o.ok && o.casas) d.casas = o.casas; // ferramenta com área: todas as casas que a ação alcança ficam marcadas
      acoesUi.apontar(alvo, opcoes);
      texto = entrada.fileira.dica(texto, m, x, z, ent);
      hud.dica(texto);
      // o botão de agir: o desenho da ação do alvo à frente dela (é nele que o botão age)
      if (icAgir && !hud.agir.hidden) {
        let oa = o;
        if (J.meio !== 'teclas' || R) { alvoDaFrente(m, frente); oa = acoesDoAlvo(m, frente.entidade !== undefined ? { entidade: frente.entidade } : { x: frente.x, z: frente.z })[0]; }
        trocarIcone(icAgir, oa && oa.ok ? iconeDaOpcao(oa, frente.entidade !== undefined ? { entidade: frente.entidade } : { x: frente.x, z: frente.z }) : 'ui/mao');
      }
    },
  };
  entrada.fileira = ligarFileira(entrada, hud);
  entrada.agir = ligarAgir(entrada, hud);
  ligarToque(entrada, hud);
  ligarTeclado(entrada);
  entrada.lerControle = ligarControle(entrada);
  return entrada;
}
