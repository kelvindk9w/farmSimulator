// Teclado e controle remoto de TV: setas ou WASD andam, Shift corre, Espaço ou Enter agem na casa destacada à frente,
// Q e E (ou 1 a 9) trocam o modo, + e - dão zoom, Esc fecha o que estiver aberto, cancela a fila ou abre o menu.
import { J } from '../contexto.js';
import { foco } from './foco.js';
import { modosEmOrdem } from '../nucleo/registro.js';
import { painelAberto, fecharPainel, abrirPainel } from '../ui/paineis/registro.js';
import { subidaAberta, fecharSubida } from '../ui/subida.js';
import { tela } from '../plataforma/tela.js';
import { som } from '../plataforma/som.js';

const DIR = { ArrowUp: 0, KeyW: 0, ArrowDown: 1, KeyS: 1, ArrowLeft: 2, KeyA: 2, ArrowRight: 3, KeyD: 3 };
const SETA = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
const ATALHO = { KeyL: 'loja', KeyB: 'mochila', KeyM: 'missoes', KeyC: 'config' };
const VOLTAR = new Set(['Escape', 'BrowserBack', 'GoBack']);

export function ligarTeclado(entrada) {
  const apertada = [false, false, false, false]; // cima, baixo, esquerda, direita
  let correr = false, rumando = false;
  const cmd = { tipo: 'rumar', dx: 0, dz: 0, forca: 1, correr: false };

  function rumo() {
    const sx = (apertada[3] ? 1 : 0) - (apertada[2] ? 1 : 0), sy = (apertada[1] ? 1 : 0) - (apertada[0] ? 1 : 0);
    if (!sx && !sy) { if (rumando) { rumando = false; J.mundo.comando({ tipo: 'frear' }); } return; }
    // na tela, direita é +X-Z e baixo é +X+Z: as diagonais das setas seguem as fileiras de casas
    cmd.dx = sx + sy; cmd.dz = sy - sx; cmd.correr = correr; cmd.forca = 1;
    rumando = true;
    J.mundo.comando(cmd);
  }
  function soltarTudo() { apertada.fill(false); correr = false; rumo(); J.mundo.comando({ tipo: 'correr', ligado: false }); }

  window.addEventListener('keydown', (e) => {
    som.destravar();
    const alvo = e.target, digitando = alvo && (alvo.tagName === 'TEXTAREA' || alvo.tagName === 'INPUT');
    const voltar = VOLTAR.has(e.key) || e.keyCode === 461 || e.keyCode === 10009;
    if (digitando) { if (voltar) { e.preventDefault(); alvo.blur(); } return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // painel, tela de subida ou menu: as setas andam pelos botões
    if (subidaAberta() || painelAberto() || foco.menu) {
      if (SETA[e.code]) { e.preventDefault(); foco.mover(SETA[e.code][0], SETA[e.code][1]); return; }
      if (voltar || (e.code === 'Backspace') || (foco.menu && e.code === 'Tab')) { e.preventDefault(); if (!fecharSubida() && !fecharPainel()) foco.sairDoMenu(); return; }
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') {
        // o botão focado recebe o clique do próprio navegador; sem foco, o primeiro botão ganha o foco
        const a = document.activeElement;
        if (!a || a.tagName !== 'BUTTON') { e.preventDefault(); foco.mover(0, 1); }
        return;
      }
      if (e.code === 'Tab') return; // o navegador anda pelo foco
      return;
    }

    if (e.code in DIR) { e.preventDefault(); J.meio = 'teclas'; entrada.usouTeclas(); if (!apertada[DIR[e.code]]) { apertada[DIR[e.code]] = true; rumo(); } return; }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { if (!correr) { correr = true; J.mundo.comando({ tipo: 'correr', ligado: true }); if (rumando) rumo(); } return; }
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); if (!e.repeat) { J.meio = 'teclas'; entrada.usouTeclas(); J.mundo.comando({ tipo: 'agir' }); } return; }
    if (e.repeat) return;
    if (e.code === 'KeyQ' || e.code === 'KeyE') { J.mundo.comando({ tipo: 'trocarModo', passo: e.code === 'KeyQ' ? -1 : 1 }); som.tocar('toque'); return; }
    if (/^Digit[1-9]$/.test(e.code)) { const md = modosEmOrdem().filter((x) => !x.disponivel || x.disponivel(J.mundo))[+e.code.slice(5) - 1]; if (md) { J.mundo.comando({ tipo: 'escolherModo', modo: md.id }); som.tocar('toque'); } return; }
    if (e.code === 'Equal' || e.code === 'NumpadAdd') { entrada.zoom(1.2); return; }
    if (e.code === 'Minus' || e.code === 'NumpadSubtract') { entrada.zoom(1 / 1.2); return; }
    if (ATALHO[e.code]) { abrirPainel(ATALHO[e.code]); return; }
    if (e.code === 'KeyF') { tela.alternarTelaCheia(); return; }
    if (e.code === 'Tab') { e.preventDefault(); soltarTudo(); foco.entrarNoMenu(); return; }
    if (voltar || e.code === 'Backspace') {
      e.preventDefault();
      const p = J.mundo.personagem;
      // com tarefas na fila, voltar cancela; sem nada, abre o menu (os botões da tela)
      if (p.fila.length || p.tarefa) { J.mundo.comando({ tipo: 'cancelar' }); som.tocar('fechar'); } else { soltarTudo(); foco.entrarNoMenu(); }
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.code in DIR) { if (apertada[DIR[e.code]]) { apertada[DIR[e.code]] = false; rumo(); } return; }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { correr = false; J.mundo.comando({ tipo: 'correr', ligado: false }); if (rumando) rumo(); }
  });
  window.addEventListener('blur', soltarTudo);
  return { soltarTudo };
}
