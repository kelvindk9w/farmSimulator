// Confere jogo/dados/*.json do jeito que o jogo vai ler e lista os problemas:  node tools/validar.mjs
import path from 'node:path';
import '../src/nucleo/sistemas/index.js';
import { raiz, lerDados, conferirDados } from './comum.mjs';
import { Mundo } from '../src/nucleo/mundo.js';
import { missaoPossivel } from '../src/nucleo/sistemas/missoes.js';
import { ofertasDaLoja } from '../src/nucleo/sistemas/loja.js';

const bruto = lerDados(path.join(raiz, 'dados'));
const { dados, problemas, texto } = conferirDados(bruto);
if (texto) console.log(texto);
const graves = problemas.filter((p) => p.grave).length;
if (graves) { console.log(`\n${graves} erro(s): o jogo não começa com estes dados.`); process.exit(1); }
const m = new Mundo(dados, { agora: 0 });
if (m.terras.aviso) console.log('aviso terras.json: ' + m.terras.aviso);
const lista = dados.missoes.vizinho, valem = lista.filter((x) => missaoPossivel(m, x));
console.log(`\nDados em ordem (${problemas.length} aviso(s)).`);
console.log(`Mapa ${dados.terras.largura}x${dados.terras.profundidade}, ${m.locais.fazenda.entidades.length} entidades, ${dados.terras.lotes.length} lotes.`);
console.log(`Missões do vizinho: ${valem.length} de ${lista.length} valem nesta versão: ${valem.map((x) => x.id).join(', ')}`);
console.log(`Ficam para depois: ${lista.filter((x) => !valem.includes(x)).map((x) => `${x.id} (${x.objetivo.evento})`).join(', ') || 'nenhuma'}`);
console.log('Loja de ouro no nível 1: ' + ofertasDaLoja(m).map((a) => `${a.nome}: ${a.ofertas.map((o) => o.item + (o.liberado ? '' : ' [nível ' + o.nivel + ']')).join(', ')}`).join(' | '));
