// Serve a pasta montada para jogar no navegador:  node tools/servir.mjs [pasta] [porta]
// Sem argumentos: a pasta de JOGO_DIST (padrão dist) na porta de JOGO_PORTA (padrão 8091). Porta ocupada: usa uma livre.
import path from 'node:path';
import { raiz, servir, pastaDist } from './comum.mjs';

const pasta = process.argv[2] ? path.resolve(raiz, process.argv[2]) : pastaDist, porta = Number(process.argv[3] || process.env.JOGO_PORTA) || 8091;
let s;
try { s = await servir(pasta, porta); } catch (e) { if (e.code !== 'EADDRINUSE') throw e; s = await servir(pasta, 0); console.log(`A porta ${porta} está ocupada; usei outra.`); }
console.log(`Servindo ${pasta} em ${s.url}  (Ctrl+C para parar). Para o modo de teste: ${s.url}#teste`);
