// Reprodução curta de um defeito que o jogador automático achou (não conserta nada: só mostra).
//   node tools/bot/repro-cercada.mjs
// Plantar muda não confere se fecha o caminho (a obra confere: "fecha-caminho"). Com mato a leste e a oeste da casa
// onde ela está, uma muda ao norte e outra ao sul a deixam trancada numa casa só: todo toque longe dá "sem-caminho".
// Ela só sai roçando o mato do lado; a árvore não se arranca. (No jogo do bot, perfil casual, isso aconteceu no lote
// novo, cheio de mato, quando ela plantou as bananeiras da missão "bananal" em volta de onde estava.)
import path from 'node:path';
import { raiz, lerDados, conferirDados } from '../comum.mjs';
import { Mundo } from './jogo.mjs';

const { dados } = conferirDados(lerDados(path.join(raiz, 'dados')));
const m = new Mundo(dados, { agora: Date.UTC(2026, 0, 5, 12) });
m.progresso.nivel = 7;
const loc = m.locais.fazenda, P = m.personagem;
const passos = (seg) => { for (let i = 0; i < seg * 60; i++) m.passo(); };
const tocar = (x, z, modo, semente) => { m.comando({ tipo: 'escolherModo', modo, semente }); return m.comando({ tipo: 'tocarCasa', x: x + 0.5, z: z + 0.5 }); };
// uma casa de grama com grama em volta, perto dela
let alvo = null;
for (let z = 2; z < loc.p - 2 && !alvo; z++) for (let x = 2; x < loc.l - 2 && !alvo; x++) {
  const livre = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]].every(([dx, dz]) => { const i = loc.i(x + dx, z + dz); return loc.propria[i] === 1 && loc.chao[i] === 0 && !loc.ocupa[i] && !loc.plantas[i]; });
  if (livre && Math.hypot(x - P.x, z - P.z) < 12) alvo = [x, z];
}
if (!alvo) { console.log('não achei grama livre para montar o cenário'); process.exit(0); }
const [x, z] = alvo;
// o mato dos lados (o lote novo vem assim; aqui ele é posto à mão)
for (const dx of [-1, 1]) loc.por({ id: `mato-repro-${dx}`, tipo: 'mato', x: x + dx, z, v: 2, l: 1, p: 1 });
m.posses.bolsa['muda-bananeira'] = 2;
tocar(x, z, 'mao'); passos(15);
const r1 = tocar(x, z - 1, 'semear', 'muda-bananeira'); passos(5);
tocar(x, z, 'mao'); passos(5);
const r2 = tocar(x, z + 1, 'semear', 'muda-bananeira'); passos(5);
const faltas = []; m.eventos.ouvir('faltou', (d) => faltas.push(d.motivo));
const casa = dados.terras.pontos.personagem;
tocar(Math.floor(casa[0]), Math.floor(casa[1]), 'mao'); passos(15);
console.log(`muda ao norte: ${JSON.stringify(r1)}; muda ao sul: ${JSON.stringify(r2)} (casa ${x},${z}, mato a leste e a oeste)`);
console.log(`ela está em ${P.x.toFixed(2)},${P.z.toFixed(2)}; mandada andar até ${casa}: ${faltas.length ? 'falhou (' + faltas.join(', ') + ')' : 'andou'}`);
