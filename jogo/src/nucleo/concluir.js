// Coisas com relógio que o jogador pode concluir na hora com cash: obra, fila de indústria, muda crescendo
// (a lista do que vale está em regras.json, campo concluir.vale). Cada frente registra aqui o seu tipo, no seu
// próprio arquivo; a conta do preço, o comando "concluir" e a interface são do sistema de cash (sistemas/cash.js).
//
//   registrarConcluivel({
//     tipo,                      "obra" | "fila" | "muda" (o mesmo nome de regras.concluir.vale)
//     falta(mundo, alvo),        segundos que faltam; 0 = nada a concluir
//     terminar(mundo, alvo),     deixa pronto agora (sem cobrar: quem cobra é o comando "concluir")
//     nome(mundo, alvo),         texto curto para a pergunta ("a obra do galinheiro")
//   })
//   alvo = o que identifica a coisa naquele tipo (uma entidade, uma casa, uma vaga de fila...)

export const CONCLUIVEIS = {};

export function registrarConcluivel(c) {
  if (!c || !c.tipo) throw new Error('concluível sem tipo');
  if (CONCLUIVEIS[c.tipo] && CONCLUIVEIS[c.tipo] !== c) throw new Error(`concluível "${c.tipo}" registrado duas vezes`);
  CONCLUIVEIS[c.tipo] = { nome: () => '', ...c };
  return CONCLUIVEIS[c.tipo];
}
