// Os sistemas do jogo, na ordem em que iniciam. Funcionalidade nova = arquivo novo + uma linha aqui.
import './terras.js';
import './posses.js';
import './niveis.js';
import './construcao.js'; // antes da personagem: ao carregar, o celeiro por dentro já existe quando ela é posta
import './personagem.js';
import './lavoura.js';
import './poco.js';
import './banca.js';
import './celeiro.js';
import './lugares.js'; // o lugar das ferramentas no sítio (a enxada na estaca do campo, o regador ao lado do poço)
import './loja.js';
import './missoes.js';
import './celeiro-dentro.js'; // frente de construir: entrar e sair do celeiro, e o espaço que vem dos móveis (depois da personagem e das missões)
// frente das terras: comprar lote, limpar a terra, desgaste e conserto, árvores frutíferas e o aspersor
import './lotes.js';
import './limpeza.js';
import './desgaste.js';
import './arvores.js';
import './aspersor.js';
// frente de progresso: conquistas, presente do dia, amigos, guarda-roupa, cash e o correio (o que espera para abrir)
import './conquistas.js';
import './diaria.js';
import './amigos.js';
import './roupas.js';
import './cash.js';
import './correio.js';
// frente dos animais: a base comum (compra, abrigo, cocho e bebedouro, ciclo com ausência) e os de produção
import './animais.js'; // depois de construcao.js e de cash.js (troca ENTREGAS.animal)
import './producao.js';
// frente das indústrias e dos pedidos: receitas com fila (bancadas, moinho, cozinha, laticínio) e o quadro de pedidos
import './industria.js'; // depois de construcao.js, de loja.js e de cash.js
import './pedidos.js'; // depois de industria.js (o quadro só pede receita de indústria pronta)
// frente dos animais de trabalho e de estimação: boi de arado, cavalo, jumento com carroça e barril; cachorro e gato
import './trabalho.js'; // depois de animais.js, de loja.js, de lavoura.js e de poco.js
import './estimacao.js';
// o começo humilde: o Seu Tonho na fazenda, a chegada, a cerca e as reformas (depois de trabalho.js: soma à figura dela)
import './comeco.js';
// versão de teste: atalho para o dono pular de nível (sai quando o jogo for para a loja)
import './atalho-de-teste.js';
