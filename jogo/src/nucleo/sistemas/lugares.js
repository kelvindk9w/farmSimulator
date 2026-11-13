// Os lugares das ferramentas no sítio: a enxada velha escorada na estaca do canto do campo, o regador velho no chão ao
// lado do poço (dados/terras.json "lugares": { item: [x, z] }). Ferramenta com lugar que não está no cinto fica nele
// (posses: onde = 'lugar') e aparece desenhada ali; a personagem vai buscar sozinha quando uma ação pede
// (personagem.js: ondeBuscar) ou quando o jogador escolhe na barra o modo dela (Enxada, Regar). Uma vez pega, a
// ferramenta fica no cinto: não há volta obrigatória depois de usar. O regador pego no lugar já vai ao poço encher.
//
// Cada lugar é uma entidade da fazenda que NÃO bloqueia nada e não é gravada (é refeita ao abrir o jogo):
//   { id: 'lugar:<item>', tipo: 'lugarDeFerramenta', x, z, item }
// Com a ferramenta no cinto, o lugar fica vazio (o da enxada mostra só a estaca) e o toque passa por ele.
// Construção posta em cima, caminho ou terra arada: o lugar muda para a casa de grama livre mais perto do ponto dos dados
// (confere ao carregar e a cada segundo). O desenho (render/lugares.js) preenche DESENHO.lugar.
import { registrarSistema, registrarTipo } from '../registro.js';
import { GRAMA } from '../local.js';
import { ferramentaNoCinto, lugarDaFerramenta, idDoLugar } from './posses.js';
import { filaTem } from './personagem.js';
import { registrarGuia } from '../guia.js';

export const TIPO_DO_LUGAR = 'lugarDeFerramenta';
// (m, e, v): o desenho ajusta a chave da figura e o jeito de pintar; a lógica não sabe como a ferramenta é pintada
export const DESENHO = { lugar: null };

const funcaoDe = (m, e) => m.dados.itens[e.item].funcao;
// a ferramenta deste lugar está nele agora?
export const estaNoLugar = (m, e) => { const f = m.posses.ferramentas[e.item]; return !!f && f.onde === 'lugar'; };
// dá para pegar: está no lugar e ela não leva outra da mesma função no cinto (aí o toque passa pela figura)
const pegavel = (m, e) => estaNoLugar(m, e) && !ferramentaNoCinto(m, funcaoDe(m, e));

// ela para ao lado da figura, de qualquer lado
const AO_LADO = [[1.15, 0.5], [-0.15, 0.5], [0.5, 1.15], [0.5, -0.15]];
registrarTipo({
  tipo: TIPO_DO_LUGAR, casas: [1, 1], bloqueia: false, semVeu: true, altura: 0.9, // (altura da seta do tutorial: a figura é baixinha)
  semToque: (m, e) => !pegavel(m, e),
  pontos: { ficar: AO_LADO },
  acaoPossivel(m, e) {
    if (!pegavel(m, e)) return { acao: null, texto: null };
    if (filaTem(m, 'pegarFerramenta')) return { acao: null, texto: 'na-fila' };
    return { acao: 'pegarFerramenta', args: { funcao: funcaoDe(m, e), item: e.item }, dados: { item: e.item, lugar: true } };
  },
  visual(m, e, v) {
    v.chave = funcaoDe(m, e) === 'regador' ? 'objeto/regador-no-chao' : 'objeto/enxada-escorada'; v.variante = 0;
    if (DESENHO.lugar) DESENHO.lugar(m, e, v);
    return v;
  },
});

// a casa (x, z) serve de lugar: terra dela, grama, sem nada bloqueando, sem construção (nem rente ao chão) e sem outro lugar
function serve(m, loc, x, z, quem) {
  if (!loc.ehPropria(x, z)) return false;
  const i = loc.i(x, z);
  if (loc.ocupa[i] !== 0 || loc.chao[i] !== GRAMA) return false;
  for (const e of m.construcao.todas) if (e.local === loc.id && x >= e.x && x < e.x + e.l && z >= e.z && z < e.z + e.p) return false;
  for (const e of loc.entidades) if (e.tipo === TIPO_DO_LUGAR && e !== quem && e.x === x && e.z === z) return false;
  return true;
}
// a casa de grama livre mais perto do ponto dos dados (até 8 casas); sem nenhuma, fica no ponto
function casaDoLugar(m, loc, item, quem) {
  const [px, pz] = lugarDaFerramenta(m, item);
  if (serve(m, loc, px, pz, quem)) return [px, pz];
  let melhor = null, dm = Infinity;
  for (let r = 1; r <= 8 && !melhor; r++) for (let z = pz - r; z <= pz + r; z++) for (let x = px - r; x <= px + r; x++) {
    if (Math.max(Math.abs(x - px), Math.abs(z - pz)) !== r || !serve(m, loc, x, z, quem)) continue;
    const d = Math.hypot(x - px, z - pz);
    if (d < dm) { dm = d; melhor = [x, z]; }
  }
  return melhor || [px, pz];
}
// põe (ou confere) a entidade do lugar de cada ferramenta que tem lugar
function arrumar(m) {
  const loc = m.locais.fazenda, L = m.dados.terras.lugares || {};
  if (!loc) return;
  for (const item in L) {
    if (!m.dados.itens[item]) continue;
    const id = idDoLugar(item), e = loc.porId[id];
    if (e && e.x === L[item][0] && e.z === L[item][1] && serve(m, loc, e.x, e.z, e)) continue; // no ponto dos dados e livre: nada a fazer
    const [x, z] = casaDoLugar(m, loc, item, e);
    if (e && e.x === x && e.z === z) continue;
    if (e) loc.tirar(id);
    loc.por({ id, tipo: TIPO_DO_LUGAR, x, z, item });
  }
}
// a entidade do lugar da ferramenta (ou null)
export const entidadeDoLugar = (m, item) => (m.locais.fazenda && m.locais.fazenda.porId[idDoLugar(item)]) || null;

// o regador pego no lugar dele vai já ao poço encher (se não estiver cheio e não houver ida ao poço na fila)
function encherDepois(m, d) {
  const it = m.dados.itens[d.item], f = m.posses.ferramentas[d.item], p = m.personagem;
  if (!d.lugar || !it || it.funcao !== 'regador' || !f || f.agua >= it.capacidade || filaTem(m, 'encher')) return;
  const loc = m.locais[p.local];
  let poco = null, dm = Infinity;
  for (const e of loc.entidades) if (e.tipo === 'poco' || e.tipo === 'poco-velho') { const dd = Math.hypot(e.x + 1 - p.x, e.z + 1 - p.z); if (dd < dm) { dm = dd; poco = e; } }
  if (poco) p.fila.unshift({ tipo: 'agir', acao: 'encher', entidade: poco.id, args: null, auto: true });
}

registrarSistema({
  id: 'lugares',
  iniciar(m) {
    arrumar(m);
    m.eventos.ouvir('carregou', () => arrumar(m));
    m.eventos.ouvir('pegouFerramenta', (d) => encherDepois(m, d));
  },
  segundo(m) { arrumar(m); },
});

// a missão de encher o regador: com ele no lugar dele, a seta aponta o regador no chão (pegar já leva ao poço)
registrarGuia('encheu', (m, f, out) => {
  if (ferramentaNoCinto(m, 'regador')) return null;
  for (const item in m.dados.terras.lugares || {}) {
    const e = entidadeDoLugar(m, item);
    if (e && m.dados.itens[item].funcao === 'regador' && pegavel(m, e)) { out.tipo = 'entidade'; out.id = e.id; return out; }
  }
  return null;
});
