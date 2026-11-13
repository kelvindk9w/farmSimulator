// Os registros do jogo. Cada funcionalidade nova entra por aqui, no seu próprio arquivo, sem editar arquivo alheio:
//   registrarSistema  estado e regras (lavoura, banca, níveis...)
//   registrarAcao     o que a personagem faz num alvo (arar, regar, vender...)
//   registrarTipo     tipos de entidade do terreno (poço, celeiro, árvore, animal...)
//   registrarModo     botões da barra de modo (mão, enxada, semear, regar...)
//   registrarAutomatico  o que o modo "mão" faz sozinho numa casa (regar o que tem sede, colher o que está pronto...)
// Os contratos de cada um estão em docs/jogo/ARQUITETURA.md.

export const SISTEMAS = []; // na ordem de registro (é a ordem de iniciar, do passo e de carregar)
export const ACOES = {};
export const TIPOS = {};
export const MODOS = {};
export const AUTOMATICOS = [];

function unico(mapa, id, o, oque) {
  if (!id) throw new Error(`${oque} sem id`);
  if (mapa[id] && mapa[id] !== o) throw new Error(`${oque} "${id}" registrado duas vezes`);
}

// { id, iniciar(mundo), passo(mundo), segundo(mundo), ausencia(mundo, seg), comandos: { nome(mundo, args) }, salvar(mundo), carregar(mundo, dados) }
export function registrarSistema(s) {
  if (SISTEMAS.some((x) => x.id === s.id)) throw new Error(`sistema "${s.id}" registrado duas vezes`);
  SISTEMAS.push(s);
  return s;
}

// { id, ferramenta, dur, efeitoEm, estadoVisual, pode(mundo, alvo, args) → { ok, motivo, dados, limpar }, aoEfeito(mundo, alvo, args) }
//   alvo = { x, z } (uma casa) ou { entidade } (uma entidade do local da personagem)
//   ferramenta = função da ferramenta que tem de estar no cinto ("enxada", "regador"); sem ela, a personagem busca no celeiro
//   dur e efeitoEm em segundos; regras.json pode trocar a duração (campo acoes.<id>)
export function registrarAcao(a) {
  unico(ACOES, a.id, a, 'ação');
  ACOES[a.id] = { dur: 0.8, efeitoEm: null, estadoVisual: 'trabalhar', ferramenta: null, pode: () => ({ ok: true }), ...a };
  return ACOES[a.id];
}

// { tipo, casas: [l, p], bloqueia, pontos: { ficar: [[dx, dz], ...] }, acaoPossivel(mundo, e) → { acao, texto, dados, args },
//   visual(mundo, e) → { chave, quadro | fase, espelhar, extras } }
export function registrarTipo(t) {
  unico(TIPOS, t.tipo, t, 'tipo de entidade');
  TIPOS[t.tipo] = { casas: [1, 1], bloqueia: true, pontos: null, acaoPossivel: () => ({ acao: null, texto: null }), visual: (m, e) => ({ chave: 'objeto/' + e.tipo }), ...t };
  return TIPOS[t.tipo];
}

// { id, ordem, ferramenta, acaoNaCasa(mundo, x, z) → { acao, args, texto, dados, falta } | null, disponivel(mundo) }
//   acao = id de uma ação registrada; sem "acao", "texto" é o código do motivo (ui/textos.js faz a frase)
export function registrarModo(m) {
  unico(MODOS, m.id, m, 'modo');
  MODOS[m.id] = { ordem: 50, acaoNaCasa: () => null, ...m };
  return MODOS[m.id];
}
export function modosEmOrdem() { return Object.values(MODOS).sort((a, b) => a.ordem - b.ordem); }

// fn(mundo, x, z) → { acao, args, texto } | null. O modo "mão" pergunta a cada um, na ordem de registro.
export function registrarAutomatico(fn) { AUTOMATICOS.push(fn); }
