// O mapa: monta o local "fazenda" a partir de terras.json. A área inicial é do jogador; o resto é terra à venda,
// dividida em lotes (cada um com a sua placa) e coberta de mato, pedras, tocos e árvores.
// Comprar lote e limpar a terra entram no M3; aqui o mapa já nasce grande e os lotes já existem.
import { registrarSistema, registrarTipo } from '../registro.js';
import { Local, CAMINHO } from '../local.js';
import { acaso } from '../util.js';

const NATUREZA_PADRAO = { mata: 0.035, mato: 0.05, pedra: 0.018, toco: 0.012 };

// enfeites da terra à venda: bloqueiam, e um dia serão limpos com ferramenta (rendem madeira, pedra e fibra)
for (const tipo of ['mata', 'mato', 'pedra', 'toco']) {
  registrarTipo({
    tipo, casas: [1, 1], bloqueia: true,
    acaoPossivel: () => ({ acao: null, texto: 'terra-a-venda' }),
    visual: (m, e) => ({ chave: 'objeto/' + tipo, variante: e.v }),
  });
}
registrarTipo({
  tipo: 'placa', casas: [1, 1], bloqueia: true,
  acaoPossivel: (m, e) => { const l = loteDe(m, e.lote); return { acao: null, texto: 'lote-a-venda', dados: { preco: l ? l.preco : 0, nivel: l ? l.nivel : 1, nome: l ? l.nome || l.id : '' } }; },
  visual: () => ({ chave: 'objeto/placa' }),
});

export const loteDe = (m, id) => m.dados.terras.lotes.find((l) => l.id === id) || null;

function marcar(loc, a, campo, valor) {
  for (let z = Math.max(0, a[1]); z < Math.min(loc.p, a[3]); z++) for (let x = Math.max(0, a[0]); x < Math.min(loc.l, a[2]); x++) loc[campo][z * loc.l + x] = valor;
}

registrarSistema({
  id: 'terras',
  iniciar(m) {
    const T = m.dados.terras;
    const loc = m.locais.fazenda = new Local('fazenda', T.largura, T.profundidade);
    m.terras = { lotes: [] }; // lotes já comprados
    marcar(loc, T.inicial, 'propria', 1);
    for (const c of T.caminhos) marcar(loc, c, 'chao', CAMINHO);
    for (const tipo of ['casa', 'celeiro', 'poco', 'banca']) {
      const p = T.pontos[tipo];
      if (p) loc.por({ id: tipo, tipo, x: Math.round(p[0]), z: Math.round(p[1]) });
    }
    loc.entrada = T.pontos.personagem ? [T.pontos.personagem[0], T.pontos.personagem[1]] : [T.inicial[0] + 0.5, T.inicial[1] + 0.5];
    // uma placa por lote, na casa do lote mais perto da área inicial
    const cx = (T.inicial[0] + T.inicial[2]) / 2, cz = (T.inicial[1] + T.inicial[3]) / 2;
    for (const l of T.lotes) {
      const a = l.area, px = Math.max(a[0], Math.min(a[2] - 1, Math.round(l.placa ? l.placa[0] : cx))), pz = Math.max(a[1], Math.min(a[3] - 1, Math.round(l.placa ? l.placa[1] : cz)));
      if (loc.dentro(px, pz) && !loc.ocupa[loc.i(px, pz)] && !loc.propria[loc.i(px, pz)]) loc.por({ id: 'placa-' + l.id, tipo: 'placa', x: px, z: pz, lote: l.id });
    }
    // natureza: sorteio fixo por casa (não entra na gravação; sempre nasce igual)
    const N = { ...NATUREZA_PADRAO, ...T.natureza };
    const tipos = Object.keys(N).filter((k) => N[k] > 0 && ['mata', 'mato', 'pedra', 'toco'].includes(k));
    for (let z = 0; z < loc.p; z++) for (let x = 0; x < loc.l; x++) {
      const i = loc.i(x, z);
      if (loc.propria[i] || loc.ocupa[i] || loc.chao[i] === CAMINHO) continue;
      let r = acaso(x, z, 11);
      for (const t of tipos) {
        if (r < N[t]) { loc.por({ id: `${t}-${x}-${z}`, tipo: t, x, z, v: Math.floor(acaso(x, z, 23) * 4) }); break; }
        r -= N[t];
      }
    }
  },
  salvar(m) { return { lotes: [...m.terras.lotes] }; },
  carregar(m, d) { m.terras.lotes = Array.isArray(d.lotes) ? d.lotes.filter((id) => loteDe(m, id)) : []; },
});
