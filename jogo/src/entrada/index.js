// A entrada do jogador: toque e mouse, teclado e controle remoto, controle de videogame. Tudo vira comandos do mundo.
// Aqui fica também o que é comum: a casa destacada (sob o cursor ou à frente da personagem), a linha de dica e o zoom.
import { J } from '../contexto.js';
import { ligarToque } from './toque.js';
import { ligarTeclado } from './teclado.js';
import { ligarControle } from './controle.js';
import { ligarFileira } from './fileira.js';
import { foco } from './foco.js';
import { alvoDaFrente, descreverCasa, descreverEntidade } from '../nucleo/sistemas/personagem.js';
import { frase, fraseDaAcao } from '../ui/textos.js';

export function ligarEntrada(hud) {
  const cena = J.cena, cam = cena.cam;
  const frente = { x: 0, z: 0, entidade: undefined };
  let relogio = 0, some = 0, guardar = 0;
  const cursor = { x: -1, z: -1, entidade: null }; // o que o mouse ou o dedo aponta

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
      if (guardar > 0) { guardar -= dt; if (guardar <= 0) { J.prefs.zoom = +(cam.alvoE / cam.base).toFixed(3); J.gravarPrefs(); } }
      if (some > 0) { some -= dt; if (some <= 0) { cursor.x = -1; cursor.entidade = null; } }
      // o destaque: nas teclas, a casa à frente dela; no ponteiro, a casa apontada
      let x = -1, z = -1, ent = null;
      if (J.meio === 'teclas' && !foco.menu) { alvoDaFrente(m, frente); if (frente.entidade !== undefined) ent = frente.entidade; else if (m.local.dentro(frente.x, frente.z)) { x = frente.x; z = frente.z; } }
      else if (cursor.entidade !== null) ent = cursor.entidade;
      else if (cursor.x >= 0 && m.local.dentro(cursor.x, cursor.z)) { x = cursor.x; z = cursor.z; }
      d.x = x; d.z = z; d.entidade = ent;
      d.cor = J.meio === 'teclas' ? '#ffe07a' : '#ffffff';
      // a dica: umas vezes por segundo
      relogio -= dt;
      if (relogio > 0) return;
      relogio = 0.2;
      let texto = '';
      d.casas = null;
      if (ent !== null || x >= 0) {
        const q = ent !== null ? descreverEntidade(m, ent) : descreverCasa(m, x, z);
        if (q) texto = q.acao ? fraseDaAcao(q.acao, q.dados, m.dados) : frase(q.texto, q.dados, m.dados);
        if (q && q.acao && q.casas) d.casas = q.casas; // ferramenta com área: todas as casas que a ação alcança ficam marcadas
      }
      texto = entrada.fileira.dica(texto, m, x, z, ent);
      hud.dica(texto);
    },
  };
  entrada.fileira = ligarFileira(entrada, hud);
  ligarToque(entrada, hud);
  ligarTeclado(entrada);
  entrada.lerControle = ligarControle(entrada);
  return entrada;
}
