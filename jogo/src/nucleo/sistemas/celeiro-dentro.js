// O celeiro por dentro (M2): entrar e sair, e o espaço do celeiro, que vem dos móveis montados lá dentro.
//
// O local "celeiro" (m.locais.celeiro) é criado por construcao.js: piso do tamanho que o nível do celeiro dá, uma
// soleira de duas casas na frente (a porta) e os móveis do começo. Aqui fica o que acontece nele:
//   entrar { jaJa }   a personagem vai até a porta do celeiro e entra (jaJa: na hora, para ferramentas e testes)
//   sair { jaJa }     vai até a soleira e sai; pisar na soleira já é sair
//   empurrar a porta com as teclas, o controle ou a alavanca (andar contra ela por um instante) também entra
// Evento: mudouDeLocal { de, para }.
//
// O que cada móvel guarda (construcoes.json: "guarda" e "capacidade") não disputa lugar com os outros:
//   produtos     prateleiras: é o limite de m.posses.celeiro (colheita e produto), o mesmo que o M1 usava
//   materiais    baús: madeira, pedra, tábua, prego, embalagem e ração (estão em m.posses.bolsa)
//   ferramentas  suportes: as que estão fora do cinto
// Sem nenhum móvel pronto de um tipo, vale a capacidade inicial de regras.json (celeiro.capacidade).
// Produto não entra em celeiro cheio (o aviso diz a saída); material nunca se perde: passou do que os baús
// guardam, o jogo só avisa que falta baú.
import { registrarSistema, registrarAcao, TIPOS } from '../registro.js';
import { PASSO } from '../util.js';
import './celeiro.js';
import { comportamento, defDe, estaPronta, valorDe, construcoesDe, faltaDaObra, planejadas, DESENHO } from './construcao.js';
import { noCeleiro, listaDeFerramentas } from './posses.js';
import { registrarGuia } from '../guia.js';

// ---------- o que cada móvel guarda ----------
const EH = {
  produtos: (it) => it.tipo === 'colheita' || it.tipo === 'produto',
  materiais: (it) => it.tipo === 'material' || it.tipo === 'embalagem' || it.tipo === 'racao',
  ferramentas: (it) => it.tipo === 'ferramenta',
};
export const GUARDAS = ['produtos', 'materiais', 'ferramentas'];
// em que móvel o item fica: 'produtos' | 'materiais' | 'ferramentas' | null (semente, muda e roupa andam com ela)
export function guardaDoItem(m, id) {
  const it = m.dados.itens[id];
  if (!it) return null;
  for (const g of GUARDAS) if (EH[g](it)) return g;
  return null;
}
// os móveis prontos que guardam "guarda", na ordem em que foram montados
export function moveisDe(m, guarda, out = []) {
  out.length = 0;
  for (const e of m.construcao.todas) {
    if (e.local !== 'celeiro' || !estaPronta(e)) continue;
    const d = defDe(m, e.tipo);
    if (d && d.guarda === guarda) out.push(e);
  }
  return out;
}
const lista = [];
// O estoque de produtos é o das prateleiras do celeiro (só com o celeiro pronto na fazenda: no começo humilde ele
// ainda não existe) mais o que as construções da fazenda guardam ("guarda" e "capacidade" em construcoes.json: o baú
// ao lado da casa, a casa reformada). Sem nada disso, vale a capacidade inicial de regras.json.
const celeiroPronto = (m) => m.construcao.todas.some((e) => e.tipo === 'celeiro' && e.local === 'fazenda' && estaPronta(e));
function soma(m, guarda, menos) {
  let n = 0, tem = false;
  if (guarda !== 'produtos' || celeiroPronto(m)) for (const e of moveisDe(m, guarda, lista)) { if (e === menos) continue; tem = true; n += valorDe(m, e, 'capacidade') || 0; }
  for (const e of m.construcao.todas) {
    if (e.local !== 'fazenda' || e === menos || !estaPronta(e)) continue;
    const d = defDe(m, e.tipo);
    if (d && d.tipo !== 'movel' && d.guarda === guarda) { tem = true; n += valorDe(m, e, 'capacidade') || 0; }
  }
  return tem ? n : m.dados.regras.celeiro.capacidade;
}
export const capacidadeDe = (m, guarda) => soma(m, guarda, null);
export function ocupacaoDe(m, guarda) {
  if (guarda === 'produtos') return noCeleiro(m);
  if (guarda === 'ferramentas') return listaDeFerramentas(m, 'suporte').length;
  let n = 0;
  const B = m.posses.bolsa, I = m.dados.itens;
  for (const k in B) if (I[k] && EH.materiais(I[k])) n += B[k];
  return n;
}
export const espacoPara = (m, guarda) => capacidadeDe(m, guarda) - ocupacaoDe(m, guarda);
// quão cheio está este móvel, de 0 a 1: os primeiros montados enchem primeiro (a prateleira mostra vazia, meia ou cheia)
export function enchimento(m, e) {
  const def = defDe(m, e.tipo);
  if (!def || !def.guarda || !estaPronta(e)) return 0;
  let antes = 0;
  for (const o of moveisDe(m, def.guarda, lista)) { if (o === e) break; antes += valorDe(m, o, 'capacidade') || 0; }
  const cap = valorDe(m, e, 'capacidade') || 1;
  return Math.max(0, Math.min(1, (ocupacaoDe(m, def.guarda) - antes) / cap));
}
// o limite do estoque do celeiro é o das prateleiras (e o do baú do começo, e o da casa reformada)
export function acertarCapacidade(m) { if (m.posses && m.construcao) m.posses.celeiro.capacidade = capacidadeDe(m, 'produtos'); }

// ---------- os móveis: figura conforme o que guardam, e só saem se o que guardam couber no resto ----------
const CHAVES = {};
const chaves = (id) => CHAVES[id] || (CHAVES[id] = { vazia: 'objeto/' + id, meia: 'objeto/' + id + '-meia', cheia: 'objeto/' + id + '-cheia', vazio: 'objeto/' + id + '-vazio' });
const DO_MOVEL = {
  aoPronta: acertarCapacidade,
  aoTirar: acertarCapacidade,
  podeTirar(m, e) {
    const g = defDe(m, e.tipo).guarda;
    // produto e ferramenta precisam caber no que fica; material nunca trava (o limite do baú é só um aviso)
    if (g === 'ferramentas' ? ocupacaoDe(m, g) > 0 && moveisDe(m, g, lista).length <= 1 : g === 'produtos' && ocupacaoDe(m, g) > soma(m, g, e)) return { ok: false, motivo: 'movel-em-uso', dados: { construcao: e.tipo, guarda: g } };
    return { ok: true };
  },
};
const VISUAL = {
  produtos(m, e, v) { const f = enchimento(m, e), c = chaves(e.tipo); v.chave = f <= 0 ? c.vazia : f < 0.6 ? c.meia : c.cheia; },
  ferramentas(m, e, v) { if (!(enchimento(m, e) > 0)) v.chave = chaves(e.tipo).vazio; }, // as ferramentas fora do cinto aparecem penduradas
};
function ligarMoveis(m) {
  for (const def of Object.values(m.dados.construcoes)) {
    if (def.tipo !== 'movel' || !def.guarda) continue;
    // é no suporte que a personagem busca, sozinha, a ferramenta que não está no cinto (personagem.js procura "suporte" no local)
    comportamento(def.id, { ...DO_MOVEL, visual: VISUAL[def.guarda] || null, ...(def.guarda === 'ferramentas' ? { suporte: true } : null) });
  }
}

// ---------- o celeiro visto de fora: a figura do seu nível, de porta aberta quando ela chega perto ----------
export const celeiroDe = (m) => m.construcao.todas.find((e) => e.tipo === 'celeiro' && e.local === 'fazenda') || null;
// o ponto diante da porta, na fazenda (o mesmo onde ela para para guardar o cesto)
// ela está na fazenda, perto o bastante da porta para a interface oferecer "Entrar"?
export const PERTO_DA_PORTA = 4.5;
export function pertoDaPorta(m) { const p = m.personagem, e = celeiroDe(m); return !!e && p.local === 'fazenda' && !(e.obraAte > 0) && !!m.locais.celeiro && Math.hypot(p.x - (e.x + e.l / 2), p.z - (e.z + e.p + 0.5)) <= PERTO_DA_PORTA; }
export function portaDoCeleiro(m, out = [0, 0]) { const e = celeiroDe(m); if (!e) return null; out[0] = e.x + e.l / 2; out[1] = e.z + e.p + 0.5; return out; }
const pt = [0, 0], DO_CELEIRO = [];
const NA_PORTA = { guardar: 1, pegar: 1, pegarFerramenta: 1, entrarNoCeleiro: 1 };
if (TIPOS.celeiro) {
  TIPOS.celeiro.visual = (m, e, v) => {
    const p = m.personagem, n = e.nivel || 1;
    const aberto = p.local === 'fazenda' && ((p.acao && NA_PORTA[p.acao.id]) || Math.hypot(p.x - (e.x + e.l / 2), p.z - (e.z + e.p + 0.5)) < 1.6);
    const c = DO_CELEIRO[n] || (DO_CELEIRO[n] = { f: 'objeto/celeiro' + (n > 1 ? '-' + n : ''), a: 'objeto/celeiro' + (n > 1 ? '-' + n : '') + '-aberto' });
    v.chave = aberto ? c.a : c.f; v.variante = 0;
    if (DESENHO.visual) DESENHO.visual(m, e, v);
    return v;
  };
  // sem nada para guardar nem para pegar, o toque no celeiro é entrar
  const antes = TIPOS.celeiro.acaoPossivel;
  TIPOS.celeiro.acaoPossivel = (m, e) => {
    const r = antes(m, e);
    return r && !r.acao && r.texto === 'celeiro-vazio' && m.locais.celeiro && e.local === 'fazenda' ? { acao: 'entrarNoCeleiro', dados: {} } : r;
  };
}

// ---------- entrar e sair ----------
function passar(m, para, x, z, rumo) {
  const p = m.personagem, de = p.local;
  p.local = para; p.x = x; p.z = z; p.rumo = rumo; p.vel = 0; p.rota = null; p.fila.length = 0; p.rumando = false;
  if (m.celeiroDentro) m.celeiroDentro.empurra = 0;
  m.eventos.emitir('mudouDeLocal', { de, para });
}
function entrarJa(m) {
  const loc = m.locais.celeiro;
  if (!loc || m.personagem.local === 'celeiro') return false;
  passar(m, 'celeiro', loc.entrada[0], loc.entrada[1], Math.PI); // de costas para a porta, olhando para o fundo
  return true;
}
// a casa livre mais perto do ponto diante da porta (alguém pode ter posto um enfeite bem ali)
function sairJa(m) {
  const p = m.personagem, faz = m.locais.fazenda;
  if (p.local !== 'celeiro') return false;
  const porta = portaDoCeleiro(m, pt) || m.dados.terras.pontos.personagem || [1, 1];
  let x = porta[0], z = porta[1];
  if (!faz.andavel(Math.floor(x), Math.floor(z))) {
    let melhor = Infinity;
    for (let r = 1; r < 8 && melhor === Infinity; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
      const cx = Math.floor(porta[0]) + dx, cz = Math.floor(porta[1]) + dz, d = Math.hypot(cx + 0.5 - porta[0], cz + 0.5 - porta[1]);
      if (faz.andavel(cx, cz) && d < melhor) { melhor = d; x = cx + 0.5; z = cz + 0.5; }
    }
  }
  p.acao = null; p.tarefa = null;
  passar(m, 'fazenda', x, z, 0); // de frente para a câmera, de costas para o celeiro
  return true;
}
registrarAcao({
  id: 'entrarNoCeleiro', dur: 0.35, efeitoEm: 0.25, estadoVisual: 'parada',
  pode: (m) => (m.locais.celeiro && m.personagem.local === 'fazenda' ? { ok: true } : { ok: false, motivo: 'nao-da' }),
  aoEfeito(m) { entrarJa(m); },
});
// o que ainda está na fila é de outro lugar: larga tudo e põe só esta tarefa (a ação em curso termina antes)
function soEsta(m, t) {
  const p = m.personagem;
  p.fila.length = 0; p.rumando = false;
  if (p.tarefa && !p.acao) { p.tarefa = null; p.rota = null; }
  p.fila.push(t);
  return { ok: true };
}

// ---------- o guia das missões de construir e de montar ----------
const um = (v) => (Array.isArray(v) ? v[0] : v);
function guiaDeConstruir(m, f, out) {
  const id = um(f.construcao), def = id && defDe(m, id), p = m.personagem;
  if (!def || def.inicial) return null;
  const obra = construcoesDe(m, id).find((e) => !estaPronta(e));
  if (obra) { out.tipo = 'esperar'; out.seg = faltaDaObra(m, obra); return out; }
  if (planejadas(m).some((a) => a.id === id)) { out.tipo = null; return out; } // ela já está indo martelar
  if (def.onde === 'celeiro' && p.local !== 'celeiro') {
    // de longe, a seta mostra o celeiro; chegando à porta, mostra o botão de entrar (a interface o registra como "porta-do-celeiro")
    const c = celeiroDe(m);
    if (!c) return null;
    if (pertoDaPorta(m)) { out.tipo = 'painel'; out.painel = 'porta-do-celeiro'; out.item = null; } else { out.tipo = 'entidade'; out.id = c.id; }
    return out;
  }
  if (def.onde === 'fazenda' && p.local === 'celeiro') { const loc = m.locais.celeiro; out.tipo = 'casa'; out.x = loc.porta[0]; out.z = loc.porta[1]; return out; }
  out.tipo = 'painel'; out.painel = 'construir'; out.item = id;
  return out;
}
registrarGuia('construiu', guiaDeConstruir);
registrarGuia('montou', guiaDeConstruir);

// ---------- o sistema ----------
registrarSistema({
  id: 'celeiroDentro',
  iniciar(m) {
    m.celeiroDentro = { empurra: 0, avisou: -Infinity };
    ligarMoveis(m);
    acertarCapacidade(m);
    // o celeiro que fica pronto (no começo humilde ele se constrói), a reforma e a construção guardada mudam o estoque
    for (const ev of ['construiu', 'reformou', 'trocouConstrucao', 'guardouConstrucao', 'recolocou']) m.eventos.ouvir(ev, () => acertarCapacidade(m));
    // material nunca se perde; se passou do que os baús guardam, avisa (de vez em quando) que falta baú
    m.eventos.ouvir('ganhouItem', (d) => {
      const S = m.celeiroDentro;
      if (guardaDoItem(m, d.item) !== 'materiais' || espacoPara(m, 'materiais') >= 0 || m.agora - S.avisou < 60000) return;
      S.avisou = m.agora;
      m.eventos.emitir('informou', { motivo: 'bau-cheio', dados: { tem: ocupacaoDe(m, 'materiais'), cabe: capacidadeDe(m, 'materiais') } });
    });
  },

  passo(m) {
    const p = m.personagem, S = m.celeiroDentro, loc = m.locais[p.local];
    if (loc.interior) { if (p.z >= loc.piso[1] + 0.3) sairJa(m); return; } // pisou na soleira: saiu
    // empurrar a porta: andar de frente contra ela (teclas, controle, alavanca) por um instante; de lado, ela só
    // escorrega pela parede, como em qualquer construção
    if (!p.rumando || !(p.dz < -0.92) || !m.locais.celeiro) { S.empurra = 0; return; }
    const porta = portaDoCeleiro(m, pt);
    if (porta && Math.abs(p.x - porta[0]) < 1 && p.z > porta[1] - 0.55 && p.z < porta[1] + 0.3) { S.empurra += PASSO; if (S.empurra >= 0.3) entrarJa(m); } else S.empurra = 0;
  },

  comandos: {
    entrar(m, c) {
      const p = m.personagem, cel = celeiroDe(m);
      if (!m.locais.celeiro || !cel) return { ok: false, motivo: 'nao-existe' };
      if (p.local === 'celeiro') return { ok: true, repetida: true };
      if (c.jaJa) { p.acao = null; p.tarefa = null; entrarJa(m); return { ok: true }; }
      return soEsta(m, { tipo: 'agir', acao: 'entrarNoCeleiro', entidade: cel.id });
    },
    sair(m, c) {
      const p = m.personagem, loc = m.locais[p.local];
      if (!loc.interior) return { ok: true, repetida: true };
      if (c.jaJa) { sairJa(m); return { ok: true }; }
      return soEsta(m, { tipo: 'andar', x: loc.porta[0] + 1, z: loc.piso[1] + 0.5 });
    },
  },

  salvar() { return { v: 1 }; },
  // a personagem (carregada antes) pode ter ficado num ponto do celeiro que não existe mais; e o limite do estoque
  // é o dos móveis que a gravação trouxe
  carregar(m) {
    const p = m.personagem, loc = m.locais[p.local];
    if (loc.interior && !(loc.andavel(Math.floor(p.x), Math.floor(p.z)) && p.z < loc.piso[1])) { p.x = loc.entrada[0]; p.z = loc.entrada[1]; }
    acertarCapacidade(m);
  },
});
