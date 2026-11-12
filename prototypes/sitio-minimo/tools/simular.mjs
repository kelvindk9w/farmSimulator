// Roda SÓ a lógica (sem navegador, sem arte): confere a planta do sítio e executa o roteiro da demonstração.
// Uso: node tools/simular.mjs [--quieto]
// Sai com código 1 se algo falhar. É a prova de que as regras do jogo não dependem de desenho.
import { Mundo } from '../src/jogo/mundo.js';
import { Roteiro, ROTEIRO } from '../src/jogo/roteiro.js';
import { SITIO } from '../src/jogo/sitio.js';
import { TIPOS } from '../src/jogo/contrato.js';
import { FOLGA, Navegacao } from '../src/jogo/caminho.js';
import { localParaMundo } from '../src/jogo/util.js';

const quieto = process.argv.includes('--quieto');
let falhas = 0;
const ok = (cond, texto) => { if (!cond) falhas++; if (!cond || !quieto) console.log(`${cond ? '  ok  ' : ' FALHA'} ${texto}`); };

// ---------- planta ----------
export function conferirPlanta() {
  const m = new Mundo();
  const pontos = { inicio: [SITIO.inicio.x, SITIO.inicio.z], porteira: m.nav.porteiraFora };
  for (const [id, o] of Object.entries(m.objetos)) {
    if (o.tipo === 'galinha') continue;
    if (o.tipo === 'vaca') { const p = SITIO.pasto.ordenha, F = TIPOS.vaca.pontos.ficar; pontos[id] = localParaMundo(p.x, p.z, p.rumo, F[0], F[2]); continue; }
    pontos[id] = m.pontoDeAcao(o, 'x').dest;
  }
  for (const [id, p] of Object.entries(pontos)) ok(!m.nav.bloqueado(p[0], p[1], FOLGA) && Math.abs(p[0]) <= m.nav.lim && Math.abs(p[1]) <= m.nav.lim, `ponto de parada de "${id}" (${p[0].toFixed(2)}, ${p[1].toFixed(2)}) está livre e dentro do terreno`);
  // todo par de pontos tem caminho, e nenhum trecho corta obstáculo
  const ids = Object.keys(pontos);
  let pares = 0, retos = 0, ruins = [];
  for (const a of ids) for (const b of ids) {
    if (a === b) continue;
    const rota = m.nav.rota(...pontos[a], ...pontos[b]);
    let [x, z] = pontos[a], limpo = true;
    for (const [px, pz] of rota) { if (!m.nav.livre(x, z, px, pz)) limpo = false; x = px; z = pz; }
    pares++; if (rota.length === 1) retos++;
    if (!limpo) ruins.push(`${a}->${b}`);
  }
  ok(ruins.length === 0, `caminhos entre os ${ids.length} pontos de parada: ${pares} pares, ${retos} em linha reta, ${pares - retos} com desvio${ruins.length ? '; cortam obstáculo: ' + ruins.join(', ') : ''}`);
  return { pontos, m };
}

// ---------- roteiro ----------
export function rodarRoteiro({ limite = 60 * 90 } = {}) {
  const m = new Mundo(), r = new Roteiro();
  while (!r.fim && m.n < limite) { r.passo(m); m.passo(); m.eventos.length = 0; }
  return { m, r };
}

export function conferirMarca(k) {
  const erros = [];
  if (k.falhou) erros.push(`a ação não aconteceu (comandada: ${k.comandada})`);
  const e = k.espera || {};
  for (const [c, d] of Object.entries(e.mais || {})) if (k.depois[c] - k.antes[c] !== d) erros.push(`${c}: esperava variação ${d > 0 ? '+' : ''}${d}, foi de ${k.antes[c]} para ${k.depois[c]}`);
  for (const [c, v] of Object.entries(e.igual || {})) if (k.depois[c] !== v) erros.push(`${c}: esperava ${v}, ficou ${k.depois[c]}`);
  return erros;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Planta do sítio');
  conferirPlanta();
  console.log('\nRoteiro da demonstração (só lógica)');
  const { m, r } = rodarRoteiro();
  ok(r.fim, `o roteiro chegou ao fim (${r.marcas.length}/${ROTEIRO.length} itens) em ${m.n} passos = ${(m.n / 60).toFixed(1)} s`);
  for (const k of r.marcas) {
    const erros = conferirMarca(k);
    ok(erros.length === 0, `${String(k.de).padStart(5)} -> ${String(k.ate).padStart(5)}  (${((k.ate - k.de) / 60).toFixed(1).padStart(4)} s)  ${k.legenda}${erros.length ? ': ' + erros.join('; ') : ''}`);
  }
  // determinismo: duas execuções dão o mesmo retrato
  const b = rodarRoteiro();
  ok(m.resumo() === b.m.resumo(), `duas execuções terminam no mesmo estado (resumo ${m.resumo()})`);
  // toque no chão dentro do pasto e dentro de um obstáculo é desviado
  const n = new Navegacao(SITIO);
  const c = SITIO.objetos.celeiro, v = SITIO.pasto.ordenha;
  ok(n.ajustar(v.x, v.z) !== null && !n.dentroDoPasto(...n.ajustar(v.x, v.z)), 'toque no chão dentro do pasto leva à porteira');
  ok(n.ajustar(c.x, c.z + 1) !== null && !n.bloqueado(...n.ajustar(c.x, c.z + 1)), 'toque "dentro" do celeiro leva a um ponto livre ao lado');
  console.log(falhas ? `\n${falhas} verificações falharam.` : '\nTudo certo na lógica.');
  process.exitCode = falhas ? 1 : 0;
}
