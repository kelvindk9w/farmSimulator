// O que o campo de plantação marca no chão, numa camada da cena (render/cena.js: registrarCamada):
//   a fileira que o dedo (ou o botão) está segurando: a fileira toda de leve e, na cor da ação, as casas que entram
//   na fila quando soltar;
//   a fileira que o tutorial aponta (cena.seta.casas, do guia): as casas que pedem o mesmo, piscando devagar.
import { registrarCamada, COR_DA_ACAO } from './cena.js';

// o que a entrada (entrada/fileira.js) está mostrando: { ligada, casas: [[x, z]...], alvo: [[x, z, acao]...], molha }
export const FILEIRA = { ligada: false, casas: null, alvo: null, molha: null };

function losango(g, cam, x, z, S, folga) {
  const cx = cam.telaX(x + 0.5, z + 0.5), cy = cam.telaY(x + 0.5, 0, z + 0.5), ux = 0.70711 * S * (1 - folga), uy = 0.408248 * S * (1 - folga);
  g.moveTo(cx, cy - uy); g.lineTo(cx + ux, cy); g.lineTo(cx, cy + uy); g.lineTo(cx - ux, cy); g.closePath();
}
const TRACO = 'rgba(58,36,18,.6)';

registrarCamada('chao', (g, cam, m, S, cena) => {
  const F = FILEIRA;
  g.lineJoin = 'round';
  if (F.ligada && F.casas) {
    // a fileira toda: contorno claro
    g.beginPath();
    for (const [x, z] of F.casas) losango(g, cam, x, z, S, 0.1);
    g.lineWidth = Math.max(2, 0.05 * S); g.strokeStyle = 'rgba(255,255,255,.6)'; g.stroke();
    // as que entram na fila: claras, com o contorno branco (e a cor da ação por dentro, menos na enxada, que some na terra)
    if (F.alvo && F.alvo.length) {
      const acao = F.alvo[0][2], cor = acao === 'arar' ? '#fff3d6' : COR_DA_ACAO[acao] || '#ffffff', pulso = 0.5 + 0.5 * Math.sin(cena.tempo * 7);
      g.beginPath();
      for (const [x, z] of F.alvo) losango(g, cam, x, z, S, 0.1 - 0.04 * pulso);
      g.globalAlpha = 0.42 + 0.12 * pulso; g.fillStyle = cor; g.fill(); g.globalAlpha = 1;
      g.lineWidth = Math.max(3.5, 0.085 * S); g.strokeStyle = TRACO; g.stroke();
      g.lineWidth = Math.max(2, 0.05 * S); g.strokeStyle = '#ffffff'; g.stroke();
      if (F.molha && F.molha.length) {
        g.beginPath();
        for (const [x, z] of F.molha) losango(g, cam, x, z, S, 0.2);
        g.globalAlpha = 0.22; g.fillStyle = cor; g.fill(); g.globalAlpha = 1;
      }
    }
    return;
  }
  const s = cena.seta;
  if (s.ligada && s.casas && s.casas.length > 1) {
    const pulso = 0.5 + 0.5 * Math.sin(cena.tempo * 3.2);
    g.beginPath();
    for (const [x, z] of s.casas) losango(g, cam, x, z, S, 0.1);
    g.globalAlpha = 0.2 + 0.16 * pulso; g.fillStyle = '#ffe07a'; g.fill(); g.globalAlpha = 1;
    g.lineWidth = Math.max(2.5, 0.06 * S); g.strokeStyle = TRACO; g.stroke();
    g.lineWidth = Math.max(1.5, 0.035 * S); g.strokeStyle = '#ffe07a'; g.stroke();
  }
});
