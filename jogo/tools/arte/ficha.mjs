#!/usr/bin/env node
// Escreve arte/jogo/ficha-animacoes.md a partir do que já foi medido (arte/jogo/folhas/medidas-animacoes.json),
// das notas de cada folha (arte/jogo/notas-animacoes.json) e do catálogo. Rode depois de cada entrega:
//   node jogo/tools/arte/ficha.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const ler = (p, vazio) => (fs.existsSync(path.join(RAIZ, p)) ? JSON.parse(fs.readFileSync(path.join(RAIZ, p), 'utf8')) : vazio);
const medidas = ler('arte/jogo/folhas/medidas-animacoes.json', {});
const notas = ler('arte/jogo/notas-animacoes.json', { folhas: {}, modelos: {}, geral: [] });
const catalogo = { ...ler('jogo/arte/catalogo/personagem.json', { pecas: {} }).pecas, ...ler('jogo/arte/catalogo/animais.json', { pecas: {} }).pecas };

// A lista pedida, em ordem de prioridade: [título, [ações da figura]]
const duas = (base, acoes) => acoes.flatMap((a) => [`${base}/${a}-frente`, `${base}/${a}-costas`]);
const LISTA = [
  ['1. Personagem: movimento e lavoura', duas('personagem', ['parada', 'andar', 'correr', 'enxadar', 'semear', 'regar', 'colher', 'carregar', 'manivela'])],
  ['2. Galinha e vaca', [...duas('animal/galinha', ['parada', 'andar', 'ciscar']), ...duas('animal/vaca', ['parada', 'andar', 'pastar'])]],
  ['3. Personagem: trato e ofícios', duas('personagem', ['ordenhar', 'alimentar', 'martelar', 'colher-fruta', 'tosquiar', 'machado', 'picareta'])],
  ['4. Outros bichos e montaria', [
    ...duas('animal/ovelha', ['parada', 'andar']), ...duas('animal/ovelha-tosquiada', ['parada', 'andar']),
    ...duas('animal/boi', ['parado', 'puxar']), ...duas('animal/cavalo', ['parado', 'andar', 'galope']), ...duas('personagem', ['montada-andar', 'montada-galope']),
    ...duas('animal/jumento', ['parado', 'andar', 'andar-barril']), ...duas('animal/cachorro', ['parada', 'andar', 'sentado']), ...duas('animal/gato', ['parada', 'andar', 'sentado']),
  ]],
  ['5. Acréscimos da coordenação: bichos especiais e Seu Tonho', [
    ...duas('animal/cao-boiadeiro', ['parada', 'andar', 'sentado']), ...duas('animal/gato-siames', ['parada', 'andar', 'sentado']),
    ...duas('animal/cavalo-mangalarga', ['parado', 'andar', 'galope']), ...duas('personagem', ['montada-mangalarga-andar', 'montada-mangalarga-galope']),
    'animal/seu-tonho/parado-frente',
  ]],
  ['6. Acréscimos da frente de terras', duas('personagem', ['foice', 'plantar-muda'])],
];

const nomePlano = (k) => k.replace(/^animal\//, 'animal-').replace(/\//g, '-');
let prontas = 0, pendentes = 0, faltam = 0;
let txt = `# Ficha das animações (personagem e bichos)

Gerada por \`node jogo/tools/arte/ficha.mjs\`; não edite à mão. As notas de cada folha ficam em \`arte/jogo/notas-animacoes.json\`.

- **Pronta**: está no catálogo e passou na conferência por código e no olho.
- **Pendente**: está no catálogo (o jogo já usa), mas tem um defeito anotado e merece ser refeita.
- **Falta**: ainda não foi pedida ou não chegou a um desenho aproveitável; o jogo usa a figura de reserva.

Como é feito: o pedido (\`arte/jogo/pedidos/<nome>.md\`) vai ao Codex com a cena de estilo e a folha de modelo da figura; a folha crua fica fora do repositório (\`/root/arte-codex/anim-*\`); \`jogo/tools/arte/folha.mjs\` separa os quadros, limpa, põe na escala, alinha, grava a peça em \`jogo/arte/\`, a entrada no catálogo, a tira e a animação de conferência em \`arte/jogo/folhas/\`.

## Folhas de modelo

| Figura | Arquivo | Pedido | Nota |
|---|---|---|---|
`;
for (const [nome, m] of Object.entries(notas.modelos || {})) txt += `| ${nome} | \`arte/jogo/modelos/${m.arquivo}\` | \`${m.pedido}\` | ${m.nota || ''} |\n`;

for (const [titulo, chaves] of LISTA) {
  txt += `\n## ${titulo}\n\n| Chave | Estado | Quadros | Casa | Apoio | qps | Rodadas | Pedido | Nota |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const k of chaves) {
    const c = catalogo[k], n = (notas.folhas || {})[k] || {}, m = medidas[k];
    if (!c) { faltam++; txt += `| \`${k}\` | Falta | | | | | ${n.rodadas || ''} | ${n.pedido ? `\`${n.pedido}\`` : ''} | ${n.nota || ''} |\n`; continue; }
    const estado = n.estado === 'pendente' ? 'Pendente' : 'Pronta'; if (estado === 'Pronta') prontas++; else pendentes++;
    const q = m && m.desenhos !== c.quadros ? `${c.quadros} (${m.desenhos} desenhos)` : `${c.quadros}`;
    txt += `| \`${k}\` | ${estado} | ${q} | ${c.casa.join('x')} | ${c.apoio.join(',')} | ${c.qps} | ${n.rodadas || 1} | ${n.pedido ? `\`${n.pedido}\`` : ''} | ${n.nota || ''} |\n`;
  }
}
const fora = Object.keys(catalogo).filter((k) => !LISTA.some(([, ch]) => ch.includes(k)));
if (fora.length) {
  txt += '\n## Outras peças no catálogo\n\n| Chave | Quadros | Casa | Nota |\n|---|---|---|---|\n';
  for (const k of fora) txt += `| \`${k}\` | ${catalogo[k].quadros} | ${catalogo[k].casa.join('x')} | ${((notas.folhas || {})[k] || {}).nota || ''} |\n`;
}

txt += '\n## Como cada folha foi preparada\n\nA folha crua de cada chave e as opções passadas a `folha.mjs` (para refazer igual):\n\n| Chave | Folha crua | Opções | Altura entre quadros | Avisos |\n|---|---|---|---|---|\n';
for (const k of Object.keys(medidas).sort()) {
  const m = medidas[k]; if (!catalogo[k]) continue;
  const op = Object.entries(m.opcoes || {}).filter(([c]) => c !== 'chave').map(([c, v]) => (v === true ? `--${c}` : `--${c} ${v}`)).join(' ');
  txt += `| \`${k}\` | \`${m.crua}\` (${m.cruaTamanho.join('x')}) | \`${op}\` | ${m.variacaoAltura}% | ${(m.avisos || []).length ? m.avisos.join('; ') : ''} |\n`;
}

if ((notas.geral || []).length) txt += `\n## Decisões e observações\n\n${notas.geral.map((g) => `- ${g}`).join('\n')}\n`;
txt += `\n## Resumo\n\n${prontas} prontas, ${pendentes} pendentes (no catálogo, com defeito anotado) e ${faltam} em falta, de ${prontas + pendentes + faltam} folhas da lista.\n`;
txt += `\nAs tiras de conferência (\`arte/jogo/folhas/<nome>.png\`: os quadros lado a lado, a linha do chão, o ponto de apoio e todos os quadros sobrepostos) e as animações (\`.gif\`) têm o nome da chave com hífens, por exemplo \`${nomePlano('personagem/andar-frente')}.png\`.\n`;
fs.writeFileSync(path.join(RAIZ, 'arte/jogo/ficha-animacoes.md'), txt);
console.log(`ficha escrita: ${prontas} prontas, ${pendentes} pendentes, ${faltam} em falta`);
