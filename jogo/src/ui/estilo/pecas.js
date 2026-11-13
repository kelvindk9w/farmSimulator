// As peças da interface aprovada (arte/componentes/interface/componentes.json): o tamanho de cada imagem e as fatias.
// A montagem (tools/molduras.mjs) põe cada uma em dist/molduras/ inteira e em dist/molduras/m/ pela metade.
// Aqui viram variáveis do CSS: --m-<peça> (a imagem) e --f-<peça> (as fatias, em px da imagem). Na qualidade "leve"
// (body.leve) as duas apontam para a metade. Escala: 3 px da imagem = 1 px do CSS no celular deitado.
//   mold('pilula', '18px')   → as regras de border-image de uma moldura de 9 fatias (a largura das bordas, no CSS)
//   fixa('selo-nivel')       → o fundo de uma peça fixa (estica por igual, sem fatias)

// nome: [largura, altura, fatia de cima, direita, baixo, esquerda] (fatias em px da imagem inteira)
const NOVE = {
  painel: [192, 195, 84, 84, 87, 84],
  'painel-moldura': [192, 195, 84, 84, 87, 84],
  'painel-fundo': [124, 118, 48, 51, 48, 51],
  'menu-lista': [183, 159, 81, 108, 54, 51],
  balao: [156, 153, 63, 66, 66, 66],
  pilula: [132, 109, 54, 54, 54, 54],
  aviso: [114, 86, 43, 45, 42, 45], // (43 em cima, e não 45: sobra uma linha no meio, e o aviso de duas linhas estica)
  cabecalho: [797, 136, 66, 84, 66, 84],
  'botao-verde-normal': [132, 130, 54, 54, 45, 54],
  'botao-verde-apertado': [132, 130, 54, 54, 45, 54],
  'botao-verde-desativado': [132, 130, 54, 54, 45, 54],
  'botao-turquesa-normal': [132, 130, 54, 54, 45, 54],
  'botao-turquesa-apertado': [132, 130, 54, 54, 45, 54],
  'botao-marrom': [132, 130, 54, 54, 45, 54],
  'botao-hud-normal': [156, 238, 84, 66, 66, 66],
  'botao-hud-apertado': [156, 238, 84, 66, 66, 66],
  'botao-hud-selecionado': [156, 238, 84, 66, 66, 66],
  'aba-normal': [132, 128, 48, 54, 12, 54],
  'aba-selecionada': [132, 128, 48, 54, 12, 54],
  'cartao-item-normal': [144, 147, 63, 60, 60, 60],
  'cartao-item-travado': [144, 147, 63, 60, 60, 60],
  'cartao-dia-aberto': [120, 177, 54, 48, 99, 48],
  'cartao-dia-futuro': [120, 177, 54, 48, 99, 48],
  'cartao-dia-especial': [120, 177, 54, 48, 99, 48],
  'cartao-dia-hoje': [162, 231, 81, 69, 126, 69],
  'barra-moldura': [78, 51, 24, 27, 24, 27],
  'barra-enchimento-dourado': [66, 36, 18, 21, 18, 21],
  'barra-enchimento-verde': [66, 36, 18, 21, 18, 21],
  'faixa-nivel': [744, 235, 117, 360, 117, 360],
};
const FIXAS = ['botao-fechar-normal', 'botao-fechar-apertado', 'selo-nivel', 'botao-agir-normal', 'botao-agir-apertado', 'bolinha-contador', 'bolinha-novidade', 'alavanca-base', 'alavanca-pino', 'raios'];

// as fatias da imagem pela metade (a montagem arredonda os lados; as fatias seguem o mesmo fator)
// (arredondadas para baixo e sempre com pelo menos 1 px no meio: sem o meio, o navegador não pinta o recheio da peça)
function meia([w, h, t, d, b, e]) {
  const W = Math.round(w / 2), H = Math.round(h / 2);
  const par = (x, y, total) => { x = Math.floor(x); y = Math.floor(y); while (x + y > total - 1) { if (x >= y) x--; else y--; } return [x, y]; };
  const [t2, b2] = par(t * H / h, b * H / h, H), [e2, d2] = par(e * W / w, d * W / w, W);
  return [t2, d2, b2, e2];
}

export function variaveis() {
  const inteira = [], leve = [];
  for (const [nome, p] of Object.entries(NOVE)) {
    inteira.push(`--m-${nome}:url(molduras/${nome}.png);--f-${nome}:${p.slice(2).join(' ')} fill;`);
    leve.push(`--m-${nome}:url(molduras/m/${nome}.png);--f-${nome}:${meia(p).join(' ')} fill;`);
  }
  for (const nome of FIXAS) { inteira.push(`--m-${nome}:url(molduras/${nome}.png);`); leve.push(`--m-${nome}:url(molduras/m/${nome}.png);`); }
  return `:root{${inteira.join('')}}\nbody.leve{${leve.join('')}}\n`;
}

// moldura de 9 fatias; larguras = a largura das bordas da imagem no CSS ("18px" ou "28px 22px 22px 22px")
export const mold = (nome, larguras) => `border-style:solid;border-color:transparent;background:none;box-shadow:none;border-image-source:var(--m-${nome});border-image-slice:var(--f-${nome});border-image-width:${larguras};border-image-outset:0;border-image-repeat:stretch;`;
// troca só a imagem (estado da mesma família: normal, apertado, desativado...)
export const img = (nome) => `border-image-source:var(--m-${nome});`;
export const fixa = (nome) => `background:var(--m-${nome}) center/contain no-repeat;`;
