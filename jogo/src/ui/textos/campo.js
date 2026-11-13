// Os textos do campo de plantação (terra de plantio, fileira). Entram na tabela T de ui/textos.js.
import { T, numero } from '../textos.js';

Object.assign(T.dicaDoModo, {
  enxada: 'Toque ou arraste no campo para arar (na grama, o campo cresce). Segure numa casa: a fileira toda.',
  semear: 'Toque ou arraste na terra arada para semear. Segure numa casa: a fileira toda.',
  regar: 'Toque ou arraste nas plantas com sede para regar. Segure numa casa: a fileira toda.',
});

Object.assign(T.motivos, {
  'campo-sem-sulco': () => 'Campo de plantação: passe a enxada antes de semear',
  'fileira-em-dia': () => 'Nada para fazer nesta fileira agora',
  'fora-do-campo': () => 'Isto não é campo de plantação',
});

// o verbo de cada ação na fileira (as ações das outras frentes caem no "fazer")
const VERBO = { arar: 'arar', semear: 'semear', regar: 'regar', colher: 'colher', ararComBoi: 'o boi arar' };
const casas = (n) => (n === 1 ? '1 casa' : `${numero(n)} casas`);

T.campo = {
  // a linha de dica, com o dedo ou o cursor numa casa do campo
  segure: (n) => `segure: a fileira (${numero(n)})`,
  segureTecla: (n) => `segure o botão: a fileira (${numero(n)})`,
  // segurando, antes de soltar
  solte: (acao, n) => `Solte para ${VERBO[acao] || 'fazer'} ${casas(n)} da fileira`,
  // deu certo
  feito: (acao, n) => `${casas(n)} na fila`,
};
