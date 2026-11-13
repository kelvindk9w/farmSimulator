// A tela de carregando, a parte que vem com o main.js. A tela em si, a barra, as dicas e o erro estão no index.html
// (para aparecer antes de o main.js chegar) e são mandados por window.__carga. Daqui a barra anda conforme chegam as
// coisas de que a primeira cena precisa:
//   - as páginas de arte (render/atlas.js) que o primeiro quadro pediu: chão, personagem, construções, ícones...;
//   - as molduras da interface (dist/molduras/) que o CSS usa nos elementos à vista.
// Quando tudo chegou e a cena já foi desenhada com a arte de verdade, a tela some (com um fade, depois do tempo mínimo).
// Se uma página ou moldura falha, a tela troca a barra por "Não deu para carregar. Toque para tentar de novo.".
// No modo #teste (as ferramentas) a tela sai na hora: quem decide o que baixar é a ferramenta.

const CHEGOU = 0.35; // o main.js chegou e montou o jogo: a barra já está aqui
const MAXIMO_MS = 20000; // a arte que demorar mais do que isso chega depois (até lá, a figura de reserva)

const carga = () => window.__carga || null;

// a tela sai na hora, sem fade (a lista de erros dos dados precisa ficar à vista)
export function sumirCarga() { const c = carga(); if (c) c.sumir(); }
// o jogo não conseguiu começar: a tela mostra o erro e o toque recarrega
export function falhouCarga(e) { const c = carga(); if (c) c.erro(String((e && e.message) || e || '')); }

// as molduras que o CSS usa nos elementos à vista dentro de el (border-image e fundo); cada uma é baixada de novo por
// um Image() só para saber quando chegou (o navegador entrega a mesma imagem, já pedida pelo CSS)
function moldurasAVista(el) {
  const urls = new Set();
  for (const e of [el, ...el.querySelectorAll('*')]) {
    if (!e.getClientRects().length) continue;
    const s = getComputedStyle(e);
    for (const v of [s.borderImageSource, s.backgroundImage]) {
      if (!v || v === 'none') continue;
      for (const m of v.matchAll(/url\("?([^")]+)"?\)/g)) if (/\/molduras\//.test(m[1])) urls.add(m[1]);
    }
  }
  return [...urls].map((u) => {
    const r = { url: u, pronta: false, falhou: false }, i = new Image();
    i.onload = () => { r.pronta = true; };
    i.onerror = () => { r.falhou = true; };
    i.src = u;
    return r;
  });
}

// chamada depois de o laço do jogo começar (o primeiro quadro pede as páginas de arte que vai usar)
export function acompanharCarga({ atlas, ui, teste }) {
  const c = carga();
  if (!c) return;
  if (teste) { c.sumir(); return; }
  c.andar(CHEGOU);
  const desde = performance.now();
  let molduras = null, prontoHa = 0;
  function olhar() {
    if (c.falhou) return;
    // (este quadro vem depois do quadro do jogo: o requestAnimationFrame dele foi pedido antes)
    if (!molduras) molduras = moldurasAVista(ui);
    const paginas = atlas.paginas.filter((p) => p.estado !== 'nao');
    const ruim = paginas.find((p) => p.estado === 'falhou') || molduras.find((m) => m.falhou);
    if (ruim) { c.erro('não chegou ' + (ruim.arquivo || ruim.url)); return; }
    const total = paginas.length + molduras.length;
    const prontas = paginas.filter((p) => p.estado === 'pronta').length + molduras.filter((m) => m.pronta).length;
    c.andar(CHEGOU + (1 - CHEGOU) * 0.95 * (total ? prontas / total : 1));
    // tudo chegou: espera um quadro desenhado com a arte de verdade (o seguinte ao último que chegou) e sai
    prontoHa = prontas === total ? prontoHa + 1 : 0;
    if (prontoHa >= 2 || performance.now() - desde > MAXIMO_MS) { c.pronto(); return; }
    requestAnimationFrame(olhar);
  }
  requestAnimationFrame(olhar);
}
