// As pinturas das texturas provisórias. Cada função devolve uma Tela pronta.
// Regras seguidas aqui (as mesmas do pedido de arte): vista de frente e chapada, luz por igual,
// sem sombra projetada, sem perspectiva. Onde há volume (telha, sulco) o claro e o escuro são simétricos,
// para não sugerir de que lado vem a luz — a luz e as sombras de verdade ficam por conta do jogo.
import { Tela, hex, mix, vezes, limitar, degrau, sorte, sequencia, fbm, ruido, tintaDoNumero } from './raster.mjs';

const mod = (a, n) => ((a % n) + n) % n;
const T = 512; // lado das texturas que repetem, em pixels
const DOIS_PI = Math.PI * 2;

// ---------- paredes ----------

// Reboco caiado: branco quente com manchas largas e marcas de pincel bem leves.
export function reboco({ claro = '#f4efe4', escuro = '#e0d6c2' } = {}) {
  const a = hex(claro), b = hex(escuro);
  return new Tela(T, T).preencher((u, v) => {
    const manchas = fbm(u, v, 3, 3, 4, 11);
    const pincel = fbm(u, v, 5, 36, 3, 12);
    const grao = fbm(u, v, 96, 96, 2, 13);
    const c = mix(a, b, limitar(1.5 * (manchas - 0.5) + 0.5 + 0.5 * (pincel - 0.5)));
    return vezes(c, 0.975 + 0.05 * grao);
  });
}

// Ripas deitadas pintadas (parede de tábua horizontal): uma linha escura na base de cada ripa e uma emenda por fiada.
export function ripasDeitadas({ cor = '#edd58f', linha = '#a98c48', fiadas = 8 } = {}) {
  const base = hex(cor), escuro = hex(linha);
  return new Tela(T, T).preencher((u, v) => {
    const t = v * fiadas, fiada = mod(Math.floor(t), fiadas), fy = t - Math.floor(t);
    let c = vezes(base, 0.95 + 0.09 * sorte(fiada, 0, 61));
    c = vezes(c, 0.95 + 0.1 * fbm(u + sorte(fiada, 1, 61), v, 3, 160, 2, 62)); // veio ao longo da ripa
    const emenda = Math.abs(mod(u - sorte(fiada, 2, 61) + 0.5, 1) - 0.5) * T;
    c = mix(c, escuro, 0.55 * degrau(1.8, 0.6, emenda));
    return mix(c, escuro, 0.9 * degrau(0.1, 0.04, fy));
  });
}

// ---------- telhados ----------

// Telha de barro em colunas que descem a água; a ponta de baixo de cada telha é arredondada.
export function telhaDeBarro({ tons = ['#b5512c', '#c26138', '#a84726', '#cc6e42'], fundo = '#63270f', colunas = 8, fiadas = 4 } = {}) {
  const cores = tons.map(hex), escuro = hex(fundo);
  return new Tela(T, T).preencher((u, v) => {
    const cx = u * colunas, col = Math.floor(cx), fx = cx - col;
    const arco = 1 - (2 * fx - 1) ** 2;
    const t = v * fiadas + 0.16 * arco;
    const fiada = mod(Math.floor(t), fiadas), fy = t - Math.floor(t);
    let c = cores[Math.floor(sorte(col, fiada, 21) * cores.length)];
    c = vezes(c, 0.93 + 0.14 * sorte(col, fiada, 22));
    c = vezes(c, 0.9 + 0.2 * fbm(u, v, 32, 32, 3, 23));
    c = vezes(c, 0.8 + 0.24 * Math.sin(Math.PI * fx) ** 0.7); // lombo claro e laterais escuras, igual dos dois lados
    const canal = degrau(0.09, 0.03, Math.min(fx, 1 - fx));
    const ponta = degrau(0.075, 0.025, fy);
    return mix(c, escuro, 0.85 * Math.max(canal, ponta));
  });
}

// Ardósia: placas retangulares em fiadas desencontradas.
export function ardosia({ tons = ['#5d6670', '#6b7580', '#79838d', '#646a7a', '#5f6f6c'], fundo = '#2c3138', colunas = 6, fiadas = 8 } = {}) {
  const cores = tons.map(hex), escuro = hex(fundo);
  return new Tela(T, T).preencher((u, v) => {
    const t = v * fiadas, fiada = mod(Math.floor(t), fiadas), fy = t - Math.floor(t);
    const cx = u * colunas + (fiada % 2) * 0.5, col = mod(Math.floor(cx), colunas), fx = cx - Math.floor(cx);
    let c = cores[Math.floor(sorte(col, fiada, 71) * cores.length)];
    c = vezes(c, 0.92 + 0.16 * sorte(col, fiada, 72));
    c = vezes(c, 0.9 + 0.2 * fbm(u, v, 24, 48, 3, 73));
    const lado = degrau(2.6, 0.8, Math.min(fx, 1 - fx) * (T / colunas));
    const base = degrau(3.4, 1.0, fy * (T / fiadas));
    return mix(c, escuro, 0.9 * Math.max(lado, base));
  });
}

// ---------- madeira ----------

// Tábuas em pé (o veio acompanha V). `larguras` em pixels, somando 512.
export function tabuas({ tons, fresta, larguras = [60, 68, 62, 66, 58, 70, 64, 64], veio = 1, nos = [], semente = 31 }) {
  const a = hex(tons[0]), b = hex(tons[1]), escuro = hex(fresta);
  const bordas = [0];
  for (const w of larguras) bordas.push(bordas[bordas.length - 1] + w);
  if (bordas[bordas.length - 1] !== T) throw new Error('as larguras das tábuas precisam somar 512');
  const tela = new Tela(T, T).preencher((u, v) => {
    const x = u * T;
    let i = 0;
    while (x >= bordas[i + 1]) i++;
    const w = larguras[i], fx = (x - bordas[i]) / w;
    const sobe = sorte(i, 0, semente) * 7;
    let c = vezes(mix(a, b, sorte(i, 1, semente)), 0.93 + 0.14 * sorte(i, 2, semente));
    const ondas = fbm(u, v + sobe, 48, 2, 3, semente + 1);
    const fios = fbm(u, v + sobe, 256, 3, 2, semente + 2);
    c = vezes(c, 1 - veio * (0.2 * (ondas - 0.5) + 0.16 * (fios - 0.5)));
    return mix(c, escuro, degrau(3.4, 1.2, Math.min(fx, 1 - fx) * w));
  });
  for (const [i, fx, v] of nos) { // nós da madeira
    const x = bordas[i] + fx * larguras[i], y = v * T;
    tela.elipse(x, y, 6.5, 10, escuro, 0.35).elipse(x, y, 4.2, 6.5, escuro, 0.55).elipse(x, y, 1.8, 2.8, escuro, 0.8);
  }
  return tela;
}

// ---------- chão ----------

// Grama vista de cima: manchas de tom e folhinhas espalhadas para todos os lados.
export function grama({ tons, folhas = 3000, flores = 0, coresDasFlores = [], semente = 41 }) {
  const [escuro, medio, claro] = tons.map(hex);
  const tela = new Tela(T, T).preencher((u, v) => {
    const largo = fbm(u, v, 5, 5, 4, semente), fino = fbm(u, v, 28, 28, 3, semente + 1);
    const t = limitar(0.5 + 0.9 * (largo - 0.5) + 0.6 * (fino - 0.5));
    return t < 0.5 ? mix(escuro, medio, t * 2) : mix(medio, claro, t * 2 - 1);
  });
  const r = sequencia(semente + 2);
  for (let i = 0; i < folhas; i++) {
    const x = r() * T, y = r() * T, comp = 6 + r() * 9, ang = r() * DOIS_PI;
    const cor = r() < 0.5 ? mix(medio, claro, 0.5 + 0.5 * r()) : mix(medio, escuro, 0.4 + 0.6 * r());
    tela.traco(x, y, x + Math.cos(ang) * comp, y + Math.sin(ang) * comp, 2.4, 0.7, cor, 0.6);
  }
  const corFlor = coresDasFlores.map(hex);
  for (let i = 0; i < flores; i++) {
    const x = r() * T, y = r() * T, cor = corFlor[Math.floor(r() * corFlor.length)];
    tela.disco(x, y, 2.6 + r() * 1.2, cor, 0.95);
  }
  return tela;
}

// Terra arada vista de cima: sulcos ao longo de V, cristas claras e fundos escuros, torrões por cima.
export function terraArada({ fundo, crista, sulcos = 8, palha = 0, corDaPalha = '#d9c27a', semente = 51 }) {
  const a = hex(fundo), b = hex(crista);
  const tela = new Tela(T, T).preencher((u, v) => {
    const tremido = 0.004 * Math.sin(DOIS_PI * (2 * v + 0.3)) + 0.012 * (fbm(u, v, 2, 5, 2, semente) - 0.5);
    const p = 0.5 + 0.5 * Math.cos(DOIS_PI * (u + tremido) * sulcos);
    let c = mix(a, b, p ** 1.3);
    c = vezes(c, 0.8 + 0.4 * fbm(u, v, 40, 40, 3, semente + 1));
    if (ruido(u * 90, v * 90, 90, 90, semente + 2) > 0.87) c = vezes(c, 1.16); // torrões
    return c;
  });
  const r = sequencia(semente + 3), cor = hex(corDaPalha);
  for (let i = 0; i < palha; i++) {
    const x = r() * T, y = r() * T, comp = 5 + r() * 8, ang = r() * DOIS_PI;
    tela.traco(x, y, x + Math.cos(ang) * comp, y + Math.sin(ang) * comp, 1.6, 1.0, cor, 0.7);
  }
  return tela;
}

// ---------- porta e janela (imagem única, com transparência onde não há peça) ----------

// Porta de tábuas com batente, três travessas e puxador do lado direito; cantos de cima arredondados.
export function portaDeTabuas({ batente = '#1d5a96', folha = '#2f7fc4', folhaEscura = '#266aa8', travessa = '#3b8ed6', ferro = '#25272d' } = {}) {
  const W = 512, H = 1024, B = 38, R = 44;
  const cb = hex(batente), cf = hex(folha), ce = hex(folhaEscura), ct = hex(travessa), linha = vezes(cb, 0.78);
  const tela = new Tela(W, H, { repete: false }).preencher((u, v) => {
    const x = u * W, y = v * H;
    const dx = Math.max(R - x, x - (W - R), 0), dy = Math.max(y - (H - R), 0);
    const a = dx > 0 && dy > 0 && dx * dx + dy * dy > R * R ? 0 : 1;
    let c;
    if (x < B || x > W - B || y > H - B) c = cb;
    else if (x < B + 5 || x > W - B - 5 || y > H - B - 5) c = linha;
    else {
      const fx = ((x - B) / (W - 2 * B)) * 5, i = Math.floor(fx), f = fx - i;
      c = vezes(mix(cf, ce, 0.7 * sorte(i, 0, 81)), 0.95 + 0.1 * fbm(u, v + sorte(i, 1, 81), 40, 3, 2, 82));
      c = mix(c, linha, 0.85 * degrau(0.04, 0.012, Math.min(f, 1 - f)));
      for (const yc of [0.14, 0.5, 0.86]) {
        const d = Math.abs(y - yc * H);
        if (d < 36) c = d > 31 ? linha : ct;
      }
    }
    return [c[0], c[1], c[2], a];
  });
  const px = W - B - 52, py = H / 2, cz = hex(ferro);
  tela.disco(px, py, 21, cz).disco(px, py, 14, hex('#565a63')).disco(px, py, 7, cz);
  return tela;
}

// Porta de celeiro: tábuas pintadas com moldura, travessa e escoras brancas, tranca do lado direito. Sem transparência.
export function portaComEscoras({ tabua = '#9a3024', tabuaEscura = '#7d251b', branco = '#f2efe6', ferro = '#25272d' } = {}) {
  const W = 512, H = 1024, B = 46;
  const ca = hex(tabua), ce = hex(tabuaEscura), cw = hex(branco), linha = hex('#c9c3b4');
  const distancia = (x, y, x0, y0, x1, y1) => { // distância do ponto ao segmento
    const t = limitar(((x - x0) * (x1 - x0) + (y - y0) * (y1 - y0)) / ((x1 - x0) ** 2 + (y1 - y0) ** 2));
    return Math.hypot(x - (x0 + t * (x1 - x0)), y - (y0 + t * (y1 - y0)));
  };
  const tela = new Tela(W, H, { repete: false }).preencher((u, v) => {
    const x = u * W, y = v * H;
    const fx = u * 5, i = Math.floor(fx), f = fx - i;
    let c = vezes(mix(ca, ce, 0.6 * sorte(i, 0, 91)), 0.95 + 0.1 * fbm(u, v + sorte(i, 1, 91), 40, 3, 2, 92));
    c = mix(c, vezes(ce, 0.6), 0.85 * degrau(0.04, 0.012, Math.min(f, 1 - f)));
    // distância até a peça branca mais próxima (negativa = dentro dela)
    const moldura = Math.min(x, W - x, y, H - y) - B;
    const travessa = Math.abs(y - H / 2) - B / 2;
    const escoras = Math.min(distancia(x, y, B, B, W - B, H / 2), distancia(x, y, B, H / 2, W - B, H - B)) - B / 2;
    const d = Math.min(moldura, travessa, escoras);
    if (d < 0) c = d > -4 ? linha : cw;
    return [c[0], c[1], c[2], 1];
  });
  const cz = hex(ferro);
  for (let k = 0; k < 60; k++) tela.disco(W - B - 78 + k, H / 2, 9, cz); // tranca
  tela.disco(W - B - 78, H / 2, 15, cz);
  return tela;
}

// Janela com moldura em arco, quatro vidros e peitoril mais largo que a moldura (as sobras são transparentes).
export function janelaEmArco({ moldura = '#1d5a96', caixilho = '#2f7fc4', peitoril = '#d9d3c6', vidro = ['#a9cde0', '#cfe5ef'] } = {}) {
  const W = 512;
  const cm = hex(moldura), cc = hex(caixilho), cp = hex(peitoril), v0 = hex(vidro[0]), v1 = hex(vidro[1]);
  const topo = (x, recuo) => 432 + 50 * (1 - ((x - 256) / 200) ** 2) - recuo; // arco de cima
  return new Tela(W, W, { repete: false }).preencher((u, v) => {
    const x = u * W, y = v * W;
    if (y >= 40 && y < 86 && x >= 20 && x <= 492) return [...(y < 47 ? vezes(cp, 0.82) : cp), 1];
    if (x < 56 || x > 456 || y < 86 || y > topo(x, 0)) return [0, 0, 0, 0];
    if (x < 82 || x > 430 || y < 112 || y > topo(x, 26)) return [...cm, 1];
    if (x < 96 || x > 416 || y < 126 || y > topo(x, 40) || Math.abs(x - 256) < 9 || Math.abs(y - 270) < 9) return [...cc, 1];
    return [...mix(v0, v1, limitar((y - 126) / 330)), 1];
  });
}

// Janela reta de moldura branca, seis vidros, com cornija e peitoril mais largos (as sobras são transparentes).
export function janelaDeMolduraBranca({ branco = '#f2efe6', linha = '#c9c3b4', vidro = ['#3f5468', '#587289'] } = {}) {
  const W = 512;
  const cw = hex(branco), cl = hex(linha), v0 = hex(vidro[0]), v1 = hex(vidro[1]);
  return new Tela(W, W, { repete: false }).preencher((u, v) => {
    const x = u * W, y = v * W;
    if (x >= 36 && x <= 476 && ((y >= 36 && y < 78) || (y >= 440 && y < 484))) return [...(y < 42 || (y >= 440 && y < 446) ? cl : cw), 1];
    if (x < 68 || x > 444 || y < 78 || y >= 440) return [0, 0, 0, 0];
    const dentro = x > 96 && x < 416 && y > 104 && y < 414;
    if (!dentro) return [...(x > 92 && x < 420 && y > 100 && y < 418 ? cl : cw), 1];
    if (Math.abs(x - 256) < 7 || Math.abs(y - 207) < 7 || Math.abs(y - 311) < 7) return [...cw, 1];
    return [...mix(v0, v1, limitar((y - 104) / 310)), 1];
  });
}

// ---------- teste de UV ----------

// Xadrez numerado: os números crescem da esquerda para a direita e de baixo para cima (o sentido de U e de V).
// A borda marca onde a imagem termina; num slot que repete ela desenha a grade das repetições.
export function xadrezNumerado({ colunas = 4, linhas = 4, largura = T, altura = T, cores, tinta = '#1c1c1c', borda = '#d81b60' }) {
  const a = hex(cores[0]), b = hex(cores[1]), ct = hex(tinta), cb = hex(borda);
  const P = 1 / 11; // tamanho de um ponto da fonte, em frações da casa
  return new Tela(largura, altura, { repete: false }).preencher((u, v) => {
    const x = u * largura, y = v * altura;
    if (x < 5 || x > largura - 5 || y < 5 || y > altura - 5) return cb;
    const cx = u * colunas, cy = v * linhas, i = Math.floor(cx), j = Math.floor(cy);
    const n = String(j * colunas + i + 1);
    const larg = (n.length * 6 - 1) * P, alt = 7 * P;
    const tx = (cx - i - (1 - larg) / 2) / P, ty = (1 - (cy - j) - (1 - alt) / 2) / P;
    if (tintaDoNumero(n, tx, ty)) return ct;
    return (i + j) % 2 ? a : b;
  });
}
