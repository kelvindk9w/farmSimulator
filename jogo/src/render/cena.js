// O quadro do jogo: chão (blocos guardados), marcas no chão (fila de tarefas, casa destacada, anel do toque), entidades,
// plantas e personagem ordenados por profundidade (x + z), avisos sobre as plantas (sede, pronta) e partículas.
// Só desenha o que está na tela, e nada é alocado por quadro.
import { Camera, KX, KY, KA } from './camera.js';
import { Chao, COR_DO_CEU } from './chao.js';
import { Particulas } from './particulas.js';
import { figuraDeReserva, desenharReserva, quadrosDaReserva, E0, TRACO } from './reserva.js';
import { TIPOS } from '../nucleo/registro.js';
import { visualDaPersonagem } from '../nucleo/sistemas/personagem.js';
import { estadoDaPlanta, estagioDaPlanta } from '../nucleo/sistemas/lavoura.js';

const MAX = 1200; // figuras num quadro
const ENT = 0, PLANTA = 1, PERS = 2, SOLTA = 3;
export const COR_DA_ACAO = { arar: '#c98a45', semear: '#74b83a', regar: '#4aa9e6', colher: '#f6c12c', encher: '#4aa9e6', vender: '#f6c12c', guardar: '#f6e3b5', pegar: '#f6e3b5' }; // (as frentes acrescentam as suas)
// o que as frentes desenham a mais, cada uma no seu arquivo: registrarCamada('chao' | 'cima', (g, cam, mundo, S, cena, dt) => ...)
//   'chao' = rente ao chão, depois das marcas e antes das figuras; 'cima' = por cima de tudo, depois dos avisos das plantas
//   'fundo' = logo depois do chão, antes das marcas (calçamento, o piso do celeiro por dentro)
export const CAMADAS = { fundo: [], chao: [], cima: [] };
export function registrarCamada(onde, f) { CAMADAS[onde].push(f); }
// estado visual da personagem sem peça própria no catálogo: usa a de um gesto parecido
export const GESTO_PARECIDO = {};
// figuras soltas que entram na ordem de profundidade junto com as construções e a personagem (bichos passeando):
//   SOLTAS.push((mundo, cena, dt) → lista de { x, z, raio (da sombra, em casas), desenhar(g, cena, sx, sy, S) })
// a lista pode ser a mesma a cada quadro (quem a mantém é a frente dona); o que está fora da tela não é desenhado
export const SOLTAS = [];
// o que uma camada desenha por cima de tudo e recebe toque (a etiqueta de um lote): (mundo, px, py, cena) → id da entidade | null
export const ALVOS_DE_CIMA = [];
const PASSADA = { andar: true, correr: true, carregar: true }; // estados em que os quadros seguem o passo, não o relógio
const FOLGA = 0.25; // folga para a figura não ficar trocando de lado quando o rumo está na divisa

export class Cena {
  constructor(canvas, atlas) {
    this.cv = canvas;
    this.g = canvas.getContext('2d', { alpha: false });
    this.atlas = atlas;
    this.cam = new Camera();
    this.chao = new Chao();
    this.part = new Particulas();
    this.itens = [];
    for (let i = 0; i < MAX; i++) this.itens.push({ prof: 0, tipo: 0, ref: null, x: 0, z: 0, i: 0, b: 0 });
    this.ordem = new Int16Array(MAX);
    this.conta = new Int32Array(2400); // gavetas da ordenação por profundidade
    this.pontos = []; // o que não pode ficar escondido atrás de árvore ou construção: a personagem e as casas-alvo
    for (let i = 0; i < 4; i++) this.pontos.push({ sx: 0, y0: 0, y1: 0, meia: 0, prof: 0 });
    this.nPontos = 0;
    this.n = 0;
    this.v = { chave: '', quadro: 0, fase: 0, espelhar: false, variante: 0 };
    this.pv = { x: 0, z: 0, rumo: 0, vel: 0, fase: 0, estado: 'parada', t: 0, p: 0, acao: null };
    this.pers = { frente: true, direita: false, primeira: true, resolvido: {} };
    this.destaque = { x: -1, z: -1, entidade: null, cor: '#ffffff', casas: null }; // casa ou entidade sob o cursor ou à frente dela (casas = todas as que a ação alcança)
    this.seta = { ligada: false, x: 0, z: 0, alto: 0 }; // seta do tutorial sobre um ponto do mundo
    this.mostrarFila = true;
    this.tempo = 0;
    this.caixa = [0, 0, 0, 0];
    this.chaves = { cultura: {} }; // textos das chaves de peça, montados uma vez só
  }

  redimensionar(w, h, dpr) {
    const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
    if (this.cv.width !== W || this.cv.height !== H) { this.cv.width = W; this.cv.height = H; }
    this.cam.ajustar(w, h, dpr);
  }

  chaveDaCultura(id, estagio) {
    const c = this.chaves.cultura[id] || (this.chaves.cultura[id] = []);
    return c[estagio] || (c[estagio] = 'cultura/' + id + '-' + estagio);
  }

  // qual peça mostra a personagem neste estado e lado; resolve uma vez e guarda
  _pecaDaPersonagem(estado, lado) {
    const R = this.pers.resolvido, k = estado + (lado ? '|c' : '|f');
    if (R[k]) return R[k];
    const A = this.atlas, dir = lado ? 'costas' : 'frente';
    const tenta = [[estado, dir]];
    if (estado === 'correr' || estado === 'carregar') tenta.push(['andar', dir]);
    if (GESTO_PARECIDO[estado]) tenta.push([estado, 'frente'], [GESTO_PARECIDO[estado], dir], [GESTO_PARECIDO[estado], 'frente']);
    if (!PASSADA[estado] && estado !== 'parada') tenta.push([estado, 'frente'], ['trabalhar', dir], ['trabalhar', 'frente']);
    let achou = null;
    for (const [e, d] of tenta) if (A.tem('personagem/' + e + '-' + d)) { achou = { chave: 'personagem/' + e + '-' + d, deFrente: d === 'frente', reserva: false, estado: e }; break; }
    if (!achou && !PASSADA[estado] && A.tem('personagem/parada-' + dir)) achou = { chave: 'personagem/parada-' + dir, deFrente: !lado, reserva: false, estado: 'parada' };
    if (!achou) achou = { chave: 'personagem/' + (PASSADA[estado] ? 'andar' : estado) + '-' + dir, deFrente: !lado, reserva: true, estado: PASSADA[estado] ? 'andar' : estado };
    R[k] = achou;
    return achou;
  }

  // ---------- o quadro ----------
  desenhar(m, dt, orcamentoDoChao = 3) {
    const g = this.g, cam = this.cam, loc = m.local, S = cam.S, W = this.cv.width, H = this.cv.height;
    this.tempo += dt;
    cam.preparar();
    this.part.atualizar(dt);
    this.chao.desenhar(g, cam, m, dt, orcamentoDoChao);
    for (let k = 0; k < CAMADAS.fundo.length; k++) CAMADAS.fundo[k](g, cam, m, S, this, dt);

    this._marcasNoChao(g, cam, m, loc, S);
    for (let k = 0; k < CAMADAS.chao.length; k++) CAMADAS.chao[k](g, cam, m, S, this, dt);
    this.part.desenharNoChao(g, cam);

    // junta o que aparece
    let n = 0;
    const itens = this.itens, hx = S, hy = S;
    const E = loc.entidades;
    for (let k = 0; k < E.length && n < MAX - 2; k++) {
      const e = E[k], cx = e.x + e.l / 2, cz = e.z + e.p / 2, sx = cam.telaX(cx, cz), sy = cam.telaY(cx, 0, cz), meia = ((e.l + e.p) / 2) * KX * S + hx;
      if (TIPOS[e.tipo].plano) continue; // rente ao chão (calçamento): quem desenha é a camada de fundo da sua frente
      if (sx + meia < 0 || sx - meia > W || sy + ((e.l + e.p) / 2) * KY * S + hy < 0 || sy - 5 * S > H) continue;
      const it = itens[n++]; it.tipo = ENT; it.ref = e; it.x = cx; it.z = cz; it.prof = cx + cz;
    }
    const PL = loc.plantadas, L = loc.l;
    for (let k = 0; k < PL.length && n < MAX - 2; k++) {
      const i = PL[k], x = i % L, z = (i - x) / L, sx = cam.telaX(x + 0.5, z + 0.5), sy = cam.telaY(x + 0.5, 0, z + 0.5);
      if (sx + hx < 0 || sx - hx > W || sy + hy < 0 || sy - 2 * S > H) continue;
      const it = itens[n++]; it.tipo = PLANTA; it.ref = loc.plantas[i]; it.x = x + 0.5; it.z = z + 0.5; it.prof = x + z + 1; it.i = i;
    }
    for (let f = 0; f < SOLTAS.length; f++) {
      const L = SOLTAS[f](m, this, dt);
      for (let k = 0; L && k < L.length && n < MAX - 2; k++) {
        const s = L[k], sx = cam.telaX(s.x, s.z), sy = cam.telaY(s.x, 0, s.z);
        if (sx + 2 * hx < 0 || sx - 2 * hx > W || sy + hy < 0 || sy - 3 * S > H) continue;
        const it = itens[n++]; it.tipo = SOLTA; it.ref = s; it.x = s.x; it.z = s.z; it.prof = s.x + s.z;
      }
    }
    const pv = visualDaPersonagem(m, this.pv);
    { const it = itens[n++]; it.tipo = PERS; it.ref = null; it.x = pv.x; it.z = pv.z; it.prof = pv.x + pv.z + 0.02; }
    // ordena por profundidade em gavetas de 1/8 de casa (linear: o mapa tem mais de mil figuras)
    const o = this.ordem, C = this.conta, esc = Math.min(8, (C.length - 2) / (loc.l + loc.p + 2)), NB = Math.ceil((loc.l + loc.p + 2) * esc) + 1;
    for (let b = 0; b <= NB; b++) C[b] = 0;
    for (let k = 0; k < n; k++) { let b = (itens[k].prof * esc) | 0; if (b < 0) b = 0; else if (b >= NB) b = NB - 1; itens[k].b = b; C[b + 1]++; }
    for (let b = 1; b <= NB; b++) C[b] += C[b - 1];
    for (let k = 0; k < n; k++) o[C[itens[k].b]++] = k;
    this.n = n;
    this._pontosDeInteresse(cam, m, pv, S);

    // sombras primeiro (ficam todas no chão), depois as figuras
    g.fillStyle = 'rgba(34, 52, 20, 0.22)';
    g.beginPath();
    for (let k = 0; k < n; k++) {
      const it = itens[o[k]];
      const sx = cam.telaX(it.x, it.z), sy = cam.telaY(it.x, 0, it.z);
      let r;
      if (it.tipo === ENT) r = Math.min(it.ref.l, it.ref.p) * 0.52 * S * (it.ref.l + it.ref.p > 2 ? 1.05 : 0.6);
      else if (it.tipo === PERS) r = 0.34 * S;
      else if (it.tipo === SOLTA) r = it.ref.raio * S;
      else continue;
      g.moveTo(sx + r, sy); g.ellipse(sx, sy + 0.04 * S, r, r * 0.55, 0, 0, 6.2832);
    }
    g.fill();

    for (let k = 0; k < n; k++) {
      const it = itens[o[k]], sx = cam.telaX(it.x, it.z), sy = cam.telaY(it.x, 0, it.z);
      if (it.tipo === ENT) {
        const e = it.ref, v = this.v;
        v.quadro = 0; v.espelhar = false; v.variante = 0; v.desenhar = null;
        TIPOS[e.tipo].visual(m, e, v);
        // o que está na frente da personagem ou de uma casa-alvo fica meio transparente (some e volta com suavidade)
        const alvo = this._tapa(it, e, v, sx, sy, S) ? 0.38 : 1;
        e.va = e.va === undefined ? alvo : e.va + (alvo - e.va) * Math.min(1, dt * 9 + (dt === 0 ? 1 : 0));
        if (e.va < 0.985) g.globalAlpha = e.va;
        if (v.desenhar) v.desenhar(g, this, m, e, sx, sy, S); // o tipo desenha a si mesmo (obra, cerca em trechos, camadas): v.chave continua valendo para a caixa do toque
        else if (!this.atlas.desenhar(g, v.chave, v.quadro, sx, sy, S, v.espelhar)) desenharReserva(g, figuraDeReserva(v.chave, 0, e.l, e.p, v.variante), sx, sy, S, v.espelhar);
        g.globalAlpha = 1;
      } else if (it.tipo === PLANTA) {
        const pl = it.ref, chave = this.chaveDaCultura(pl.cultura, estagioDaPlanta(m, pl));
        if (!this.atlas.desenhar(g, chave, 0, sx, sy, S, false)) desenharReserva(g, figuraDeReserva(chave), sx, sy, S, false);
      } else if (it.tipo === SOLTA) it.ref.desenhar(g, this, sx, sy, S);
      else this._personagem(g, cam, pv, sx, sy, S);
    }

    this._avisosDasPlantas(g, cam, m, S);
    for (let k = 0; k < CAMADAS.cima.length; k++) CAMADAS.cima[k](g, cam, m, S, this, dt);
    this.part.desenhar(g, cam);
    if (this.seta.ligada) this._seta(g, cam, S);
  }

  // a personagem, a casa destacada, a casa da tarefa em curso e o alvo da seta do tutorial
  _pontosDeInteresse(cam, m, pv, S) {
    const P = this.pontos, p = m.personagem, d = this.destaque;
    let n = 0;
    const casa = (x, z) => { const q = P[n++]; q.sx = cam.telaX(x + 0.5, z + 0.5); const y = cam.telaY(x + 0.5, 0, z + 0.5); q.y0 = y - 0.75 * S; q.y1 = y + 0.2 * S; q.meia = 0.5 * S; q.prof = x + z + 1; };
    { const q = P[n++]; q.sx = cam.telaX(pv.x, pv.z); const y = cam.telaY(pv.x, 0, pv.z); q.y0 = y - 2.1 * S; q.y1 = y; q.meia = 0.36 * S; q.prof = pv.x + pv.z; }
    if (d.entidade === null && d.x >= 0) casa(d.x, d.z);
    if (p.tarefa && p.tarefa.tipo === 'agir' && p.tarefa.entidade === undefined) casa(p.tarefa.x, p.tarefa.z);
    if (this.seta.ligada && this.seta.alto < 1.2) casa(Math.floor(this.seta.x), Math.floor(this.seta.z));
    this.nPontos = n;
  }

  // esta entidade está na frente de algum ponto de interesse e o desenho dela passa por cima dele?
  _tapa(it, e, v, sx, sy, S) {
    const P = this.pontos, c = this.caixa;
    let temCaixa = false;
    for (let k = 0; k < this.nPontos; k++) {
      const q = P[k];
      if (it.prof < q.prof + 0.4 || Math.abs(sx - q.sx) > 5 * S) continue;
      if (!temCaixa) {
        if (!this.atlas.pronta(v.chave) || !this.atlas.caixa(v.chave, v.quadro, sx, sy, S, c)) {
          const f = figuraDeReserva(v.chave, 0, e.l, e.p, v.variante), kk = S / E0, mg = 0.5 * S;
          c[0] = sx - f.ax * kk + mg; c[1] = sy - f.ay * kk + mg; c[2] = sx + (f.cv.width - f.ax) * kk - mg; c[3] = sy + (f.cv.height - f.ay) * kk - mg * 0.4;
        }
        const dx = (c[2] - c[0]) * 0.16; c[0] += dx; c[2] -= dx; c[1] += (c[3] - c[1]) * 0.1; // a borda da figura é quase toda vazia
        temCaixa = true;
      }
      if (q.sx + q.meia > c[0] && q.sx - q.meia < c[2] && q.y1 > c[1] && q.y0 < c[3]) return true;
    }
    return false;
  }

  _personagem(g, cam, pv, sx, sy, S) {
    const P = this.pers;
    // para onde ela olha, na tela: +X desce para a direita, +Z desce para a esquerda
    const fx = Math.sin(pv.rumo), fz = Math.cos(pv.rumo), praCa = fx + fz, praDireita = fx - fz, folga = P.primeira ? 0 : FOLGA;
    P.primeira = false;
    if (praCa > folga) P.frente = true; else if (praCa < -folga) P.frente = false;
    if (praDireita > folga) P.direita = true; else if (praDireita < -folga) P.direita = false;
    const peca = this._pecaDaPersonagem(pv.estado, !P.frente);
    // o desenho de frente anda para a esquerda de quem vê; o de costas, para a direita
    const espelhar = peca.deFrente ? P.direita : !P.direita;
    const def = peca.reserva ? null : this.atlas.peca(peca.chave);
    const nq = def ? def.q.length : quadrosDaReserva(peca.chave);
    let quadro = 0, respiro = 1;
    if (PASSADA[peca.estado]) { const f = pv.fase - Math.floor(pv.fase); quadro = Math.min(nq - 1, Math.floor(f * nq)); }
    else if (peca.estado === 'parada') { if (nq > 1) quadro = Math.floor(this.tempo * ((def && def.qps) || 6)) % nq; else if (pv.estado === 'parada') respiro = 1 + 0.012 * Math.sin(this.tempo * 2.4); else respiro = 1 - 0.05 * Math.abs(Math.sin(pv.t * 7)); }
    else if (nq > 1) quadro = def && def.laco === false ? Math.min(nq - 1, Math.floor(pv.p * nq)) : Math.floor(pv.t * ((def && def.qps) || 6)) % nq;
    if (peca.reserva || !this.atlas.desenhar(g, peca.chave, quadro, sx, sy, S, espelhar, respiro)) desenharReserva(g, figuraDeReserva(peca.chave, quadro), sx, sy, S, espelhar, respiro);
  }

  _losango(g, cam, x, z, S, folga) {
    const cx = cam.telaX(x + 0.5, z + 0.5), cy = cam.telaY(x + 0.5, 0, z + 0.5), ux = KX * S * (1 - folga), uy = KY * S * (1 - folga);
    g.moveTo(cx, cy - uy); g.lineTo(cx + ux, cy); g.lineTo(cx, cy + uy); g.lineTo(cx - ux, cy); g.closePath();
  }

  _marcasNoChao(g, cam, m, loc, S) {
    const p = m.personagem;
    g.lineJoin = 'round';
    // fila de tarefas: cada casa prometida fica marcada com a cor da ação
    if (this.mostrarFila && (p.fila.length || p.tarefa)) {
      for (let k = -1; k < p.fila.length; k++) {
        const t = k < 0 ? p.tarefa : p.fila[k];
        if (!t) continue;
        const cor = COR_DA_ACAO[t.acao] || '#ffffff';
        g.beginPath();
        if (t.tipo === 'andar') { const sx = cam.telaX(t.x, t.z), sy = cam.telaY(t.x, 0, t.z); g.ellipse(sx, sy, 0.2 * S, 0.115 * S, 0, 0, 6.2832); }
        else if (t.entidade !== undefined) { const e = loc.porId[t.entidade]; if (!e) continue; const sx = cam.telaX(e.x + e.l / 2, e.z + e.p / 2), sy = cam.telaY(e.x + e.l / 2, 0, e.z + e.p / 2), r = ((e.l + e.p) / 2) * 0.62 * S; g.ellipse(sx, sy, r, r * 0.577, 0, 0, 6.2832); }
        else this._losango(g, cam, t.x, t.z, S, 0.16);
        g.globalAlpha = 0.32; g.fillStyle = cor; g.fill();
        g.globalAlpha = 0.95; g.lineWidth = Math.max(2, 0.05 * S); g.strokeStyle = cor; g.stroke();
      }
      g.globalAlpha = 1;
    }
    // casa ou entidade destacada
    const d = this.destaque;
    if (d.entidade !== null || d.x >= 0) {
      const pulso = 0.5 + 0.5 * Math.sin(this.tempo * 6);
      g.beginPath();
      if (d.entidade !== null) { const e = loc.porId[d.entidade]; if (e) { const sx = cam.telaX(e.x + e.l / 2, e.z + e.p / 2), sy = cam.telaY(e.x + e.l / 2, 0, e.z + e.p / 2), r = ((e.l + e.p) / 2) * (0.66 + 0.03 * pulso) * S; g.ellipse(sx, sy, r, r * 0.577, 0, 0, 6.2832); } }
      else this._losango(g, cam, d.x, d.z, S, 0.05 - 0.03 * pulso);
      g.lineWidth = Math.max(3, 0.075 * S); g.strokeStyle = 'rgba(58,36,18,.6)'; g.stroke();
      g.lineWidth = Math.max(1.5, 0.04 * S); g.strokeStyle = d.cor; g.stroke();
    }
  }

  // gota azul sobre a planta com sede; brilho sobre a que está pronta
  _avisosDasPlantas(g, cam, m, S) {
    const itens = this.itens, o = this.ordem, n = this.n, r = Math.max(7 * cam.dpr, 0.17 * S), pula = Math.abs(Math.sin(this.tempo * 3.2));
    g.lineJoin = 'round';
    for (let k = 0; k < n; k++) {
      const it = itens[o[k]];
      if (it.tipo !== PLANTA) continue;
      const e = estadoDaPlanta(m, it.ref);
      if (e === 'crescendo') continue;
      const cultura = m.dados.culturas[it.ref.cultura], alto = e === 'pronta' ? 1.25 : 0.55 + 0.5 * (estagioDaPlanta(m, it.ref) / cultura.estagios);
      const sx = cam.telaX(it.x, it.z), sy = cam.telaY(it.x, alto, it.z) - (e === 'pronta' ? pula * r * 0.5 : 0);
      if (e === 'sede') {
        g.beginPath(); g.arc(sx, sy, r * 1.15, 0, 6.2832); g.fillStyle = '#fff9ec'; g.fill(); g.lineWidth = Math.max(1.5, r * 0.18); g.strokeStyle = TRACO; g.stroke();
        g.beginPath(); g.moveTo(sx, sy - r * 0.75); g.bezierCurveTo(sx + r * 0.75, sy, sx + r * 0.6, sy + r * 0.7, sx, sy + r * 0.7); g.bezierCurveTo(sx - r * 0.6, sy + r * 0.7, sx - r * 0.75, sy, sx, sy - r * 0.75);
        g.fillStyle = '#4aa9e6'; g.fill();
      } else {
        const R = r * 1.25;
        g.beginPath();
        for (let q = 0; q < 8; q++) { const a = -Math.PI / 2 + (q * Math.PI) / 4, rr = q % 2 ? R * 0.42 : R; if (q) g.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); else g.moveTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); }
        g.closePath(); g.fillStyle = '#ffd84a'; g.fill(); g.lineWidth = Math.max(1.5, r * 0.2); g.strokeStyle = TRACO; g.stroke();
      }
    }
  }

  // a seta do tutorial: em cima do alvo; se o alvo está fora da tela, fica na borda apontando para ele
  _seta(g, cam, S) {
    const s = this.seta, W = this.cv.width, H = this.cv.height, a = Math.max(14 * cam.dpr, 0.3 * S), pulo = (10 + 8 * Math.abs(Math.sin(this.tempo * 4))) * cam.dpr;
    const tx = cam.telaX(s.x, s.z), ty = cam.telaY(s.x, s.alto, s.z), mx = 70 * cam.dpr, my0 = 110 * cam.dpr, my1 = 150 * cam.dpr;
    const fora = tx < mx || tx > W - mx || ty < my0 || ty > H - my1;
    g.save();
    if (!fora) g.translate(tx, ty - pulo);
    else {
      const cx = W / 2, cy = H / 2, ang = Math.atan2(ty - cy, tx - cx);
      g.translate(Math.max(mx, Math.min(W - mx, tx)) - Math.cos(ang) * pulo, Math.max(my0, Math.min(H - my1, ty)) - Math.sin(ang) * pulo);
      g.rotate(ang - Math.PI / 2);
    }
    g.beginPath(); g.moveTo(0, 0); g.lineTo(-a * 0.8, -a); g.lineTo(-a * 0.32, -a); g.lineTo(-a * 0.32, -a * 2); g.lineTo(a * 0.32, -a * 2); g.lineTo(a * 0.32, -a); g.lineTo(a * 0.8, -a); g.closePath();
    g.fillStyle = '#ffd84a'; g.fill(); g.lineWidth = Math.max(2, a * 0.16); g.lineJoin = 'round'; g.strokeStyle = TRACO; g.stroke();
    g.restore();
  }

  // a entidade cuja figura está sob o ponto (pontos de CSS), a mais da frente; null se não há
  entidadeEm(m, cx, cy) {
    const cam = this.cam, loc = m.local, S = cam.S, px = cx * cam.dpr, py = cy * cam.dpr, c = this.caixa, v = this.v;
    let melhor = null, prof = -Infinity;
    for (let k = 0; k < ALVOS_DE_CIMA.length; k++) { const id = ALVOS_DE_CIMA[k](m, px, py, this); if (id) return id; }
    for (const e of loc.entidades) {
      const x = e.x + e.l / 2, z = e.z + e.p / 2, sx = cam.telaX(x, z), sy = cam.telaY(x, 0, z);
      if (Math.abs(sx - px) > 4 * S || py > sy + 2.5 * S || py < sy - 5 * S || TIPOS[e.tipo].plano) continue; // (o calçamento não tapa o toque no chão)
      v.quadro = 0; v.variante = 0;
      TIPOS[e.tipo].visual(m, e, v);
      if (!this.atlas.caixa(v.chave, 0, sx, sy, S, c) || !this.atlas.pronta(v.chave)) {
        const f = figuraDeReserva(v.chave, 0, e.l, e.p, v.variante), k = S / E0, mg = 0.5 * S; // a reserva tem margem em volta
        c[0] = sx - f.ax * k + mg; c[1] = sy - f.ay * k + mg; c[2] = sx + (f.cv.width - f.ax) * k - mg; c[3] = sy + (f.cv.height - f.ay) * k - mg * 0.4;
      }
      const dx = (c[2] - c[0]) * 0.1;
      if (px < c[0] + dx || px > c[2] - dx || py < c[1] || py > c[3]) continue;
      if (x + z > prof) { prof = x + z; melhor = e; }
    }
    return melhor ? melhor.id : null;
  }
}
export { COR_DO_CEU };
