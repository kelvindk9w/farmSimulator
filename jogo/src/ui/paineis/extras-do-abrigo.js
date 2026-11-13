// Botões que outras frentes põem no painel de um abrigo (o estábulo ganha "Ir a cavalo" e "Levar o jumento").
// Arquivo neutro, sem dependências: o painel do abrigo lê a lista; quem tem um botão a oferecer dá push nela.
//   EXTRAS_DO_ABRIGO.push((mundo, entidadeDoAbrigo) => [{ id, texto, icone, ligado, dica, aoClicar() }] | null)
//     texto    o que o botão diz                  icone   chave de ícone (opcional)
//     ligado   true = o botão aparece "ativo"      dica    linha pequena embaixo (opcional)
//     aoClicar o que o toque faz (o painel se atualiza depois)
export const EXTRAS_DO_ABRIGO = [];

// todos os botões que valem para este abrigo agora (lista nova a cada chamada; vazia se ninguém tem nada a oferecer)
export function extrasDoAbrigo(mundo, entidade) {
  const out = [];
  for (const f of EXTRAS_DO_ABRIGO) { const r = f(mundo, entidade); if (r) for (const b of r) if (b) out.push(b); }
  return out;
}
