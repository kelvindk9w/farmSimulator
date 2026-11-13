// Os balões em cima das indústrias e do quadro de pedidos, no terreno:
//   indústria fazendo   o ícone do produto dentro de um anel que se enche com o andamento
//   indústria pronta    o ícone do produto num balão que brilha e pula (há o que retirar)
//   indústria parada    nada
//   quadro de pedidos   a prancheta brilhando quando algum pedido já pode ser entregue
// É uma camada 'cima' da cena. Custo por quadro: uma conta de andamento por indústria (são poucas); a lista de
// quem tem balão só se refaz quando o lugar muda, e os pedidos prontos são contados duas vezes por segundo.
import { registrarCamada, COR_DA_ACAO, GESTO_PARECIDO } from './cena.js';
import { TRACO } from './reserva.js';
import { pintarIconeDeReserva } from './icones.js';
import { TIPOS } from '../nucleo/registro.js';
import { ehIndustria, visaoDaIndustria } from '../nucleo/sistemas/industria.js';
import { QUADRO, pedidosProntos } from '../nucleo/sistemas/pedidos.js';

COR_DA_ACAO.retirarProduto = '#f6c12c';
GESTO_PARECIDO.entregar = 'colher'; // o gesto de retirar o produto: ela estende a mão, como na colheita

const DUAS_PI = 6.2832;
const visao = { estado: 'parada', item: null, fracao: 0 }, vis = { chave: '', quadro: 0, espelhar: false, variante: 0, desenhar: null }, caixa = [0, 0, 0, 0];
const chaves = {}; // 'icone/<item>', montado uma vez por item
let lista = [], listaDe = null, nLista = -1, idade = 0, prontos = 0, relogio = 0, tempo = 0;

// quem pode ter balão neste lugar (refeita quando o lugar ou o número de entidades muda, e de tempos em tempos)
function alvos(m, dt) {
  const E = m.local.entidades;
  idade += dt;
  if (listaDe !== m.local || nLista !== E.length || idade > 2 || dt === 0) {
    listaDe = m.local; nLista = E.length; idade = 0; lista.length = 0;
    for (let k = 0; k < E.length; k++) { const e = E[k]; if (e.tipo === QUADRO || ehIndustria(m, e)) lista.push(e); }
  }
  return lista;
}

// um ícone do catálogo (ou a figura de reserva) encaixado numa caixa de lado t com centro em (cx, cy)
function icone(g, A, chave, cx, cy, t, dados) {
  const p = A.peca(chave);
  if (p && A.pronta(chave)) {
    const k = Math.min(t / p.casa[0], t / p.casa[1]);
    A.desenhar(g, chave, 0, cx - t / 2 + (t - p.casa[0] * k) / 2 + p.apoio[0] * k, cy - t / 2 + (t - p.casa[1] * k) / 2 + p.apoio[1] * k, k * p.e, false);
  } else { g.save(); g.translate(cx - t / 2, cy - t / 2); pintarIconeDeReserva(g, chave, t, dados); g.restore(); }
}

function balao(g, cam, cena, m, e, S, chave, fracao, pronta) {
  const cx = e.x + e.l / 2, cz = e.z + e.p / 2, sx = cam.telaX(cx, cz), chao = cam.telaY(cx, 0, cz);
  const r = Math.max(17 * cam.dpr, 0.42 * S), W = cena.cv.width, H = cena.cv.height;
  // o alto da figura: pela caixa da peça no catálogo; sem ela, pela altura do tipo
  let topo = cam.telaY(cx, TIPOS[e.tipo].altura || 1.6 + Math.min(e.l, e.p) * 0.5, cz);
  vis.quadro = 0; vis.variante = 0; vis.desenhar = null;
  TIPOS[e.tipo].visual(m, e, vis);
  if (cena.atlas.pronta(vis.chave) && cena.atlas.caixa(vis.chave, vis.quadro, sx, chao, S, caixa)) topo = caixa[1] + (caixa[3] - caixa[1]) * 0.06;
  // com a seta do tutorial em cima desta construção, o balão desce para a seta apontar para ele (e não tapá-lo)
  const seta = cena.seta;
  let base = topo - r * 1.15;
  if (seta && seta.ligada && Math.abs(seta.x - cx) < 0.05 && Math.abs(seta.z - cz) < 0.05) base = Math.max(base, cam.telaY(cx, seta.alto, cz) + r * 1.45);
  const pulo = pronta ? Math.abs(Math.sin(tempo * 3.2)) * r * 0.28 : 0, sy = base - pulo;
  if (sx < -r * 2 || sx > W + r * 2 || sy < -r * 2 || sy > H + r * 2) return;
  g.lineJoin = 'round';
  if (pronta) {
    // o brilho de "tem coisa pronta": um halo que respira
    const a = 0.5 + 0.5 * Math.sin(tempo * 4.4);
    g.beginPath(); g.arc(sx, sy, r * (1.34 + 0.14 * a), 0, DUAS_PI); g.fillStyle = `rgba(255, 216, 74, ${0.32 + 0.22 * a})`; g.fill();
  }
  // o bico e o corpo do balão
  g.lineWidth = Math.max(2, r * 0.13); g.strokeStyle = TRACO; g.fillStyle = pronta ? '#fff3c4' : '#fff9ec';
  g.beginPath(); g.moveTo(sx - r * 0.34, sy + r * 0.86); g.lineTo(sx, sy + r * 1.42); g.lineTo(sx + r * 0.34, sy + r * 0.86); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.arc(sx, sy, r, 0, DUAS_PI); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(sx - r * 0.3, sy + r * 0.9); g.lineTo(sx, sy + r * 1.3); g.lineTo(sx + r * 0.3, sy + r * 0.9); g.closePath(); g.fill(); // (tapa o traço entre o corpo e o bico)
  if (!pronta) {
    // o anel do andamento: trilho claro e o trecho já feito em verde
    g.lineWidth = r * 0.17; g.lineCap = 'round';
    g.beginPath(); g.arc(sx, sy, r * 0.82, 0, DUAS_PI); g.strokeStyle = '#eadcbb'; g.stroke();
    if (fracao > 0.005) { g.beginPath(); g.arc(sx, sy, r * 0.82, -Math.PI / 2, -Math.PI / 2 + DUAS_PI * Math.min(1, fracao)); g.strokeStyle = '#41a85c'; g.stroke(); }
    g.lineCap = 'butt';
  }
  icone(g, cena.atlas, chave, sx, sy, r * (pronta ? 1.5 : 1.16), m.dados);
}

registrarCamada('cima', (g, cam, m, S, cena, dt) => {
  if (!m.industria) return;
  const L = alvos(m, dt);
  if (!L.length) return;
  tempo += dt; relogio -= dt;
  if (relogio <= 0 || dt === 0) { relogio = 0.5; prontos = pedidosProntos(m); }
  for (let k = 0; k < L.length; k++) {
    const e = L[k];
    if (e.obraAte > 0) continue;
    if (e.tipo === QUADRO) { if (prontos > 0) balao(g, cam, cena, m, e, S, 'ui/pedidos', 0, true); continue; }
    const v = visaoDaIndustria(m, e, visao);
    if (v.estado === 'parada' || !v.item) continue;
    balao(g, cam, cena, m, e, S, chaves[v.item] || (chaves[v.item] = 'icone/' + v.item), v.fracao, v.estado === 'pronta');
  }
});
