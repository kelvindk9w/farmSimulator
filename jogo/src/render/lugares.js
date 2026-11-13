// O desenho dos lugares das ferramentas no sítio (a lógica está em nucleo/sistemas/lugares.js):
//   o regador velho no chão, ao lado do poço (com ele no cinto, o lugar fica vazio: nem figura, nem sombra);
//   a enxada velha escorada na estaca do canto do campo (com ela no cinto, fica só a estaca).
// Peças: "objeto/regador-no-chao" e "objeto/enxada-escorada" (a estaca com a enxada; o apoio é o pé da estaca).
// Falta a estaca sozinha ("objeto/estaca-do-campo"): até ela chegar, vale o mourão da cerca ("objeto/mourao") baixinho.
// Sem as peças no catálogo (ou enquanto a página não chega), vale a mais parecida, montada aqui: o ícone
// "icone/regador-velho" pequeno, assentado no chão, e o ícone "icone/enxada-velha" com o cabo encostado no mourão.
// Quando a peça da estaca chegar ao catálogo (jogo/arte/catalogo), ela passa a valer sozinha: nada a trocar aqui.
import { TIPOS } from '../nucleo/registro.js';
import { DESENHO, TIPO_DO_LUGAR, estaNoLugar } from '../nucleo/sistemas/lugares.js';
import { figuraDeReserva, desenharReserva } from './reserva.js';
import { KY } from './camera.js';

const PECA = { regador: 'objeto/regador-no-chao', enxada: 'objeto/enxada-escorada', estaca: 'objeto/estaca-do-campo' };
const QUASE = { regador: 'icone/regador-velho', enxada: 'icone/enxada-velha', estaca: 'objeto/mourao' };
// a estaca fica no canto de trás da casa do lugar (o canto do campo), um tico para dentro
const PONTA_DA_ESTACA = 0.12;

const NADA = () => {};
const funcaoDe = (m, e) => m.dados.itens[e.item].funcao;

function peca(g, cena, chave, sx, sy, S) {
  if (!cena.atlas.desenhar(g, chave, 0, sx, sy, S, false)) desenharReserva(g, figuraDeReserva(chave, 0, 1, 1, 0), sx, sy, S, false);
}

// o regador no chão: a peça própria no centro da casa, ou o ícone pequeno com o fundo assentado no chão
function desenharRegador(g, cena, m, e, sx, sy, S) {
  if (cena.atlas.pronta(PECA.regador)) { peca(g, cena, PECA.regador, sx, sy, S); return; }
  const f = 0.5, k = (S * f) / 128; // o ícone tem 128 pontos; o fundo da lata fica 54 pontos abaixo do centro
  peca(g, cena, QUASE.regador, sx + 0.04 * S, sy - 50 * k, S * f);
}

// a estaca do canto do campo e, se ela estiver no lugar, a enxada escorada
function desenharEnxada(g, cena, m, e, sx, sy, S) {
  const tem = estaNoLugar(m, e);
  // o pé da estaca: o canto de trás da casa (na tela, logo acima do centro), um tico para dentro
  const px = sx, py = sy - (1 - 2 * PONTA_DA_ESTACA) * KY * S;
  if (tem && cena.atlas.pronta(PECA.enxada)) { peca(g, cena, PECA.enxada, px, py, S); return; }
  if (cena.atlas.pronta(PECA.estaca)) peca(g, cena, PECA.estaca, px, py, S);
  else peca(g, cena, QUASE.estaca, px, py, S * 0.6); // o mourão baixinho: a altura da estaca de "objeto/enxada-escorada"
  if (!tem) return;
  // o ícone da enxada já é inclinado: a ponta do cabo (112, 20) encosta no alto da estaca; a lâmina cai no chão à esquerda
  const f = 0.45, k = (S * f) / 128, topoX = px - 0.03 * S, topoY = py - 0.3 * S;
  peca(g, cena, QUASE.enxada, topoX - 48 * k, topoY + 44 * k, S * f);
}

// o catálogo em uso (main.js liga ao abrir o jogo): para saber se a peça própria já existe
let atlas = null;
export function ligarLugares(a) { atlas = a; }

// a chave da figura vale para o toque (a caixa da figura): a peça própria, se houver; senão, a mais parecida
DESENHO.lugar = (m, e, v) => {
  const qual = funcaoDe(m, e) === 'regador' ? 'regador' : 'enxada';
  v.chave = atlas && atlas.tem(PECA[qual]) ? PECA[qual] : QUASE[qual];
  if (qual === 'regador') v.desenhar = estaNoLugar(m, e) ? desenharRegador : NADA;
  else v.desenhar = desenharEnxada;
};
// a sombra: só a do regador no chão (a estaca e a enxada são finas)
TIPOS[TIPO_DO_LUGAR].sombra = (m, e) => (funcaoDe(m, e) === 'regador' && estaNoLugar(m, e) ? 0.22 : 0);
