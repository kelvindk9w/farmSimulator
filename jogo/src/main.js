// O jogo no navegador: junta dados, mundo, desenho, interface, entrada, gravação e som, e roda o laço.
// A lógica (src/nucleo) anda em passos fixos de 1/60 s; o desenho acompanha a tela.
// Endereço com #teste: o relógio só anda quando a ferramenta manda (window.__jogo.avancar).
import bruto from 'virtual:dados';
import defAtlas from 'virtual:atlas';
import './nucleo/sistemas/index.js';
import './ui/paineis/index.js';
import { PASSO } from './nucleo/util.js';
import { prepararDados, listarProblemas } from './nucleo/dados.js';
import { Mundo } from './nucleo/mundo.js';
import { ocupada } from './nucleo/sistemas/personagem.js';
import { estadoDaPlanta } from './nucleo/sistemas/lavoura.js';
import { missaoAtual } from './nucleo/sistemas/missoes.js';
import { guiaDaMissao } from './nucleo/guia.js';
import { noCesto } from './nucleo/sistemas/posses.js';
import { ARADA } from './nucleo/local.js';
import { Atlas } from './render/atlas.js';
import { Cena } from './render/cena.js';
import { prepararReserva } from './render/reserva.js';
import { limitar } from './nucleo/util.js';
import { J, PREFS_PADRAO } from './contexto.js';
import { el, prepararIcones, repintarIcones } from './ui/dom.js';
import { T } from './ui/textos.js';
import { criarHud } from './ui/hud.js';
import { prepararAvisos, avisar, avisosNaTela, avisosEmEspera } from './ui/avisos.js';
import { prepararSubida, subidaAberta, fecharSubida } from './ui/subida.js';
import { criarTutorial } from './ui/tutorial.js';
import { ligarRetorno } from './ui/retorno.js';
import { prepararPaineis, abrirPainel, fecharPainel, painelAberto, atualizarPainel } from './ui/paineis/registro.js';
import { ligarEntrada } from './entrada/index.js';
import { foco } from './entrada/foco.js';
import { gravacao } from './plataforma/gravacao.js';
import { tela } from './plataforma/tela.js';
import { som } from './plataforma/som.js';

const ui = document.getElementById('ui'), canvas = document.getElementById('tela');
const erros = [];
function telaDeErro(texto) { const e = el('div', 'erro', texto); ui.append(e); }
window.addEventListener('error', (e) => { erros.push(String(e.message || e)); });
window.addEventListener('unhandledrejection', (e) => { erros.push('promessa: ' + String((e.reason && e.reason.message) || e.reason)); });

function comecar() {
  // ---------- dados ----------
  const { dados, problemas } = prepararDados(bruto);
  const graves = problemas.filter((p) => p.grave);
  if (problemas.length) console.info('dados do jogo:\n' + listarProblemas(problemas));
  if (graves.length) { telaDeErro(T.erroDeDados + '\n\n' + listarProblemas(graves)); window.__jogo = { pronto: false, erros, problemas }; return; }
  J.dados = dados;
  J.teste = location.hash === '#teste';
  J.toque = (navigator.maxTouchPoints || 0) > 0 || !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  J.prefs = { ...PREFS_PADRAO, ...gravacao.lerPrefs() };
  if (!['toque', 'alavanca', 'os-dois'].includes(J.prefs.esquema)) J.prefs.esquema = PREFS_PADRAO.esquema;
  J.gravarPrefs = () => { gravacao.gravarPrefs(J.prefs); hud.aplicarPrefs(); };
  som.ligar(!!J.prefs.som);
  window.addEventListener('pointerdown', () => som.destravar(), true); // o áudio só começa dentro de um gesto

  // ---------- arte e desenho ----------
  const atlas = J.atlas = new Atlas(defAtlas, './');
  prepararReserva(dados);
  prepararIcones(atlas, dados);
  atlas.aoCarregar = () => repintarIcones();
  const cena = J.cena = new Cena(canvas, atlas);
  const cam = cena.cam;

  // ---------- o mundo: a gravação deste aparelho, ou uma fazenda nova ----------
  let mundo = null, gravacaoRuim = false;
  const guardado = gravacao.ler();
  if (guardado) {
    try { mundo = Mundo.carregar(dados, guardado); } catch (e) { console.warn('a gravação não abriu: ' + e.message); gravacao.guardarRuim(); gravacaoRuim = true; }
  }
  if (!mundo) mundo = new Mundo(dados, { agora: Date.now() });
  J.mundo = mundo;

  // ---------- interface ----------
  prepararPaineis(ui);
  const hud = criarHud(ui);
  prepararAvisos(ui);
  prepararSubida(ui);
  const tutorial = criarTutorial(ui, hud);
  const deitar = el('div', 'aviso deitar', T.deitar); deitar.hidden = true; ui.append(deitar);
  let deitarAte = 0;

  // ---------- tela: tamanho, celular em pé, resolução ----------
  const dprMax = Math.min(window.devicePixelRatio || 1, 2);
  let reducao = 1, tudoDeNovo = true; // tudoDeNovo: refaz o chão inteiro no próximo quadro
  function redimensionar() {
    cena.redimensionar(tela.w, tela.h, Math.max(1, dprMax * reducao));
    if (J.prefs.zoom > 0 && !cam.mexeuNoZoom) { cam.mexeuNoZoom = true; cam.E = cam.alvoE = limitar(cam.base * J.prefs.zoom, cam.minE, cam.maxE); }
    tudoDeNovo = true;
    if (tela.emPe) { deitar.hidden = false; deitarAte = 4; }
  }
  tela.aoMudar = redimensionar;
  tela.ligar();
  redimensionar();
  hud.aplicarPrefs();

  // ---------- gravação ----------
  let pedido = false, relogioGravar = 0, semGravar = false;
  function gravarAgora() {
    if (!J.mundo) return false;
    const ok = gravacao.gravar(J.mundo.salvar());
    if (!ok && !semGravar && gravacao.disponivel) console.warn('não deu para gravar agora');
    semGravar = !ok;
    return ok;
  }
  J.gravarLogo = () => { pedido = true; };

  const ORDENS = { tocarCasa: 1, tocarEntidade: 1, irPara: 1, rumar: 1, agir: 1 };
  // põe um mundo em uso: liga o retorno e o som aos eventos dele e leva a câmera até a personagem
  function instalar(m) {
    J.mundo = m;
    ligarRetorno(m, tutorial);
    som.ouvir(m.eventos);
    const loc = m.local, p = m.personagem;
    cam.limites = [0, 0, loc.l, loc.p];
    cam.seguindo = true; cam.pular(p.x, p.z);
    // depois de arrastar a tela, a câmera volta a seguir quando o jogador dá uma ordem (toque num alvo, teclas,
    // controle, alavanca); pintar casas com o dedo não conta, para o chão não fugir debaixo dele
    const mandar = m.comando.bind(m);
    m.comando = (c) => { if (ORDENS[c.tipo] && !c.arrasto && !cam.fixa) cam.seguindo = true; return mandar(c); };
    cena.chao.sujarTudo(); tudoDeNovo = true;
    if (!J.teste) m.acertarRelogio(Date.now()); // o tempo fora do jogo se resolve aqui
  }
  // importar (obj) ou recomeçar (null); lança erro com frase se a gravação não servir
  J.trocarMundo = (obj) => {
    const m = obj ? Mundo.carregar(dados, obj) : new Mundo(dados, { agora: J.teste && J.mundo ? J.mundo.agora : Date.now() });
    instalar(m);
    gravarAgora();
  };
  instalar(mundo);
  if (gravacaoRuim) avisar(T.gravacaoRuim, '', 7000);
  if (!gravacao.disponivel) avisar(T.config.semGravacao, '', 7000);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) gravarAgora();
    else if (!J.teste) J.mundo.acertarRelogio(Date.now());
  });
  window.addEventListener('pagehide', gravarAgora);

  const entrada = ligarEntrada(hud);

  // ---------- o laço ----------
  let ultimo = 0, acumulado = 0, relogioSinc = 0, parou = false;
  let somaDt = 0, nDt = 0, quadros = 0, fps = 60, calma = 3; // medida do quadro, para reduzir a resolução se estiver lento
  function quadro(t) {
    if (parou) return;
    requestAnimationFrame(quadro);
    let dt = ultimo ? (t - ultimo) / 1000 : 0;
    ultimo = t;
    if (!(dt > 0)) dt = 0;
    const longo = dt > 0.25;
    if (longo) dt = 0.25;
    try {
      const m = J.mundo;
      if (!J.teste) {
        acumulado += dt;
        let n = 0;
        while (acumulado >= PASSO && n < 6) { m.passo(); acumulado -= PASSO; n++; }
        if (acumulado >= PASSO) acumulado = 0; // quadro lento demais: o relógio se acerta logo abaixo, sem simular o atraso
        relogioSinc += dt;
        if (relogioSinc > 1) { relogioSinc = 0; const agora = Date.now(); if (agora - m.agora > 400) m.acertarRelogio(agora); }
        relogioGravar += dt;
        if ((pedido && relogioGravar > 1) || relogioGravar > 10) { relogioGravar = 0; pedido = false; gravarAgora(); }
      }
      const p = m.personagem;
      cam.animar(dt);
      cam.seguir(p.x, p.z, dt);
      entrada.atualizar(dt);
      cena.desenhar(m, dt, tudoDeNovo ? 0 : 3);
      tudoDeNovo = false;
      hud.atualizar();
      tutorial.atualizar(dt);
      atualizarPainel();
      if (deitarAte > 0) { deitarAte -= dt; if (deitarAte <= 0) deitar.hidden = true; }

      // resolução: se a média dos quadros passa de 24 ms, desenha com menos pontos (nunca abaixo de 1 por ponto de CSS)
      quadros++;
      if (calma > 0) calma -= dt;
      else if (!longo && !document.hidden) {
        somaDt += dt; nDt++;
        if (nDt >= 90) {
          const media = somaDt / nDt;
          fps = 1 / media; somaDt = 0; nDt = 0;
          if (!J.teste && media > 0.024 && dprMax * reducao > 1.01) { reducao = Math.max(1 / dprMax, reducao * 0.8); calma = 2; redimensionar(); }
        }
      }
    } catch (e) {
      parou = true;
      erros.push(String(e && e.stack ? e.stack : e));
      console.error(e);
      telaDeErro(T.erroDoJogo + '\n\n' + String(e && e.message ? e.message : e));
    }
  }
  requestAnimationFrame(quadro);

  // ---------- ganchos para as ferramentas (verificar, capturas) ----------
  const pt = { x: 0, y: 0 };
  window.__jogo = {
    pronto: true, erros, dados, cena, atlas, J, hud,
    get mundo() { return J.mundo; },
    get teste() { return J.teste; },
    comando: (c) => J.mundo.comando(c),
    // avança o relógio passo a passo (modo #teste)
    avancar(seg) { const m = J.mundo; for (let k = Math.round(seg * 60); k > 0; k--) m.passo(); return m.agora; },
    // pula o relógio de uma vez, como quem fecha o jogo e volta depois
    pular(seg) { return J.mundo.acertarRelogio(J.mundo.agora + seg * 1000); },
    // avança até a personagem ficar sem ter o que fazer; devolve os segundos passados (-1 se não parou)
    ateParar(max = 180) { const m = J.mundo; let n = 0; while (ocupada(m) && n < max * 60) { m.passo(); n++; } return ocupada(m) ? -1 : n / 60; },
    ocupada: () => ocupada(J.mundo),
    desenhar() { cam.seguir(J.mundo.personagem.x, J.mundo.personagem.z, 1); cena.desenhar(J.mundo, 0, 0); hud.atualizar(); tutorial.atualizar(1); atualizarPainel(); },
    // ponto da janela onde aparece o ponto (x, y, z) do mundo: é onde a ferramenta toca de verdade
    naTela(x, z, y = 0) { cam.preparar(); tela.daJanela(cam.cssX(x, z), cam.cssY(x, y, z), pt); return { x: pt.x, y: pt.y }; },
    daEntidade(id, alto = 0.6) { const e = J.mundo.local.porId[id]; if (!e) return null; return this.naTela(e.x + e.l / 2, e.z + e.p / 2, alto); },
    // olhar prende a câmera num ponto (nem as ordens a soltam) até chamar seguir()
    olhar(x, z) { cam.seguindo = false; cam.fixa = true; cam.pular(x, z); this.desenhar(); },
    seguir() { cam.fixa = false; cam.seguindo = true; cam.pular(J.mundo.personagem.x, J.mundo.personagem.z); this.desenhar(); },
    gravar: gravarAgora,
    exportar: () => gravacao.exportar(J.mundo.salvar()),
    abrirPainel, fecharPainel, painelAberto, subidaAberta, fecharSubida,
    avisos: () => [...avisosNaTela(), ...avisosEmEspera()], // os que estão na tela e os que esperam a vez
    avisosNaTela,
    guia: () => ({ ...guiaDaMissao(J.mundo) }),
    medidas: () => ({ w: tela.w, h: tela.h, emPe: tela.emPe, dpr: cam.dpr, E: cam.E, fps: Math.round(fps), quadros, blocosDoChao: cena.chao.pintados, figuras: cena.n, menu: foco.menu }),
    arteBaixada: () => atlas.tudoPronto(),
    baixarArte: () => atlas.baixarTudo(),
    estado() {
      const m = J.mundo, P = m.posses, p = m.personagem, loc = m.local, a = missaoAtual(m);
      const plantas = loc.plantadas.map((i) => ({ x: i % loc.l, z: Math.floor(i / loc.l), cultura: loc.plantas[i].cultura, estado: estadoDaPlanta(m, loc.plantas[i]) }));
      let aradas = 0;
      for (let i = 0; i < loc.chao.length; i++) if (loc.chao[i] === ARADA) aradas++;
      return {
        agora: m.agora, nivel: m.progresso.nivel, xp: m.progresso.xp, ouro: P.ouro, cash: P.cash,
        cesto: { ...P.cesto.itens }, noCesto: noCesto(m), bolsa: { ...P.bolsa }, celeiro: { ...P.celeiro.itens },
        ferramentas: JSON.parse(JSON.stringify(P.ferramentas)), modo: { ...m.modo },
        personagem: { x: p.x, z: p.z, rumo: p.rumo, folego: p.folego, fila: p.fila.length, ocupada: ocupada(m) },
        missao: a ? { id: a.missao.id, conta: a.conta, n: a.n, esperaNivel: a.esperaNivel } : null, feitas: [...m.missoes.feitas],
        plantas, aradas,
      };
    },
  };
}

try { comecar(); } catch (e) {
  erros.push(String(e && e.stack ? e.stack : e));
  console.error(e);
  telaDeErro(T.erroDoJogo + '\n\n' + String(e && e.message ? e.message : e));
  window.__jogo = { pronto: false, erros };
}
