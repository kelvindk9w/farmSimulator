// Bancada de teste do personagem — Three.js. Um app, dois modos:
//   ?modo=3d  GLB com esqueleto (padrão)      ?modo=2d  folhas de sprites
// Outros parâmetros: demo=1 (roteiro fixo), visual=N (visual inicial), ui=0 (esconde os controles),
// hud=0 (esconde tudo o que fica por cima da cena), passo=1 (a simulação só anda quando a ferramenta de captura manda: window.__bench.stepTo(n)).
import cfg from '../../config/bench.json';
import { Iso, DIRS } from './iso.js';
import { Sim, Demo } from './sim.js';
import { Input } from './input.js';
import { Hud } from './ui.js';

const P = new URLSearchParams(location.search);
const modo = (P.get('modo') || '3d').toLowerCase() === '2d' ? '2d' : '3d';
const passo = P.get('passo') === '1';
let demoOn = P.has('demo') && P.get('demo') !== '0';

const bench = window.__bench = { ready: false, variant: null, firstFrameMs: null, error: null };

async function main() {
  const canvas = document.getElementById('tela');
  const hud = new Hud(document.getElementById('hud'), { mostrarControles: P.get('ui') !== '0' });
  if (P.get('hud') === '0') document.getElementById('hud').style.display = 'none';
  const iso = new Iso(cfg.camera);
  // cada modo é um módulo carregado sob demanda: o 2D não baixa o código nem os arquivos do 3D, e vice-versa
  const { View } = modo === '2d' ? await import('./view2d.js') : await import('./view3d.js');
  bench.variant = View.label;
  hud.setLabel(View.label);
  hud.btMode.textContent = modo === '2d' ? 'Ver em 3D' : 'Ver em 2D';

  const view = new View();
  await view.init(canvas, cfg, iso, 'assets/');
  let look = Math.max(0, +(P.get('visual') || 0) | 0) % view.lookCount;
  await view.setLook(look);
  hud.setLook(view.lookLabel(look));

  const sim = new Sim(cfg, iso, view.durations);
  const demo = new Demo(cfg);
  const input = new Input(hud);
  let demoFrame = 0; // passos de demonstração já dados; continua contando quando o roteiro recomeça
  const restart = () => { sim.reset(demoOn ? demo.start : { e: 0, n: 0, dir: 'S' }); demo.reset(); hud.setDemo(demoOn); hud.setCaption(demoOn ? 'Demonstração · ' + demo.label : ''); };
  restart();

  const stepOnce = () => {
    let inp;
    if (demoOn) {
      if (demo.ended) restart();
      inp = demo.next();
      hud.setCaption('Demonstração · ' + demo.label);
      demoFrame++;
    } else inp = input.sample();
    sim.step(inp);
    view.step(sim, cfg.step);
  };

  const resize = () => view.resize(innerWidth, innerHeight, Math.min(devicePixelRatio || 1, 2));
  addEventListener('resize', resize);
  resize();

  // botões
  hud.btMode.addEventListener('click', () => { const q = new URLSearchParams(location.search); q.set('modo', modo === '2d' ? '3d' : '2d'); q.delete('visual'); location.search = q.toString(); });
  let trocando = false;
  hud.btLook.addEventListener('click', async () => {
    if (trocando) return;
    trocando = true;
    try { look = (look + 1) % view.lookCount; await view.setLook(look); hud.setLook(view.lookLabel(look)); } catch (e) { hud.setLook('falhou: ' + e.message); }
    trocando = false;
  });
  hud.btDemo.addEventListener('click', () => { demoOn = !demoOn; demoFrame = 0; restart(); });

  // laço principal: passos fixos de simulação, um desenho por quadro do navegador
  let last = performance.now(), acc = 0, shown = 0, t0 = last;
  const tick = (now) => {
    requestAnimationFrame(tick);
    if (!passo) {
      acc += Math.min(0.1, (now - last) / 1000);
      let n = 0;
      while (acc >= cfg.step && n < 6) { stepOnce(); acc -= cfg.step; n++; }
      if (n === 6) acc = 0;
    }
    last = now;
    view.render(sim);
    if (bench.firstFrameMs === null) {
      // força a GPU a terminar o primeiro quadro antes de marcar o tempo
      const gl = view.renderer.getContext();
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
      bench.firstFrameMs = performance.now();
      bench.ready = true;
      hud.setMessage('');
    }
    shown++;
    if (now - t0 >= 500 && !passo) { // no modo captura a linha de números fica de fora (muda a cada execução)
      const s = view.stats();
      hud.setStats(`${Math.round((shown * 1000) / (now - t0))} qps · ${s.drawCalls} chamadas de desenho · ${s.triangles.toLocaleString('pt-BR')} triângulos`);
      shown = 0; t0 = now;
    }
  };
  requestAnimationFrame(tick);

  // ganchos para as ferramentas de captura e medição
  Object.assign(bench, {
    demoTotal: demo.total,
    info: () => ({ frame: demoOn ? demoFrame : sim.frame, anim: sim.anim, animTime: +sim.animTime.toFixed(4), dir: DIRS[sim.dir], x: +sim.x.toFixed(4), z: +sim.z.toFixed(4), label: demoOn ? demo.label : '', visual: look }),
    stepTo: (n) => { while (demoFrame < n) stepOnce(); view.render(sim); return bench.info(); },
    stats: () => view.stats(),
    setLook: async (i) => { look = i % view.lookCount; await view.setLook(look); hud.setLook(view.lookLabel(look)); view.render(sim); },
  });
}

main().catch((e) => {
  console.error(e);
  bench.error = String(e && e.message || e);
  const m = document.querySelector('.mensagem');
  if (m) { m.textContent = 'Erro ao carregar: ' + bench.error; m.style.display = ''; }
});
