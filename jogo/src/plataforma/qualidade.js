// Qualidade da imagem: "nitida" baixa as páginas de arte inteiras; "leve" baixa as de metade do tamanho
// (um quarto da memória e do peso). A escolha vale ao abrir o jogo: trocar no meio pediria baixar tudo de novo.
//
// No automático, é leve em TV, em aparelho de pouca memória e em tela de celular; nítida no resto.
// Nada disto foi medido em aparelho de verdade ainda: os limites abaixo são um palpite cuidadoso.

const TV = /\b(TV|AFT[A-Z0-9]+|SmartTV|SMART-TV|Tizen|Web0S|webOS|BRAVIA|CrKey|GoogleTV|HbbTV|Roku)\b/i;

export function ehTV() {
  try { return TV.test(navigator.userAgent || ''); } catch { return false; }
}

// "leve" | "nitida" para este aparelho
export function qualidadeAutomatica() {
  try {
    if (ehTV()) return 'leve';
    const memoria = navigator.deviceMemory; // em GB; só alguns navegadores dizem
    if (memoria && memoria <= 4) return 'leve';
    const toque = (navigator.maxTouchPoints || 0) > 0;
    const lado = Math.max(screen.width || 0, screen.height || 0); // em pontos de CSS
    if (toque && lado > 0 && lado <= 950) return 'leve'; // celular (tablet e computador passam disso)
    return 'nitida';
  } catch {
    return 'leve';
  }
}

// pref = "auto" | "nitida" | "leve" (o que o jogador escolheu nas configurações)
export function qualidadeDaImagem(pref) {
  return pref === 'nitida' || pref === 'leve' ? pref : qualidadeAutomatica();
}
