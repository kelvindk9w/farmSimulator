// Gera as imagens e o vídeo da pasta capturas/. Uso: npm run capturas  (depois de npm run build)
//   capturas/cena-paisagem.png        o sítio inteiro, tela deitada, conjunto "codigo"
//   capturas/cena-molde.png           o mesmo instante com o conjunto "molde"
//   capturas/celular-retrato.png      tela de celular em pé (como abre: de perto, acompanhando o personagem)
//   capturas/celular-retrato-tudo.png tela de celular em pé, vendo o sítio inteiro
//   capturas/celular-paisagem.png     tela de celular deitada
//   capturas/acoes-codigo.png         um quadro do meio de cada interação
//   capturas/acoes-molde.png          os mesmos quadros com o conjunto "molde"
//   capturas/folhas/*.png             uma folha de contato por animação (vários instantes lado a lado)
//   capturas/demonstracao.webm        a demonstração inteira (30 quadros por segundo, menos de 30 s)
//   capturas/demonstracao-de-perto.webm  a mesma demonstração de perto, com a câmera acompanhando o personagem
// As de cima são do conjunto "codigo" (e "molde"). Do conjunto "brinquedo", que é o que abre:
//   capturas/cena-brinquedo.png       o sítio inteiro, tela deitada
//   capturas/celular-retrato-brinquedo.png  tela de celular em pé, como abre
//   capturas/acoes-brinquedo.png      os mesmos quadros de cada interação
//   capturas/comparacao-estilo-a.png  a imagem de referência do estilo (esquerda) e o jogo na mesma câmera (direita)
//   capturas/folhas/*-brinquedo.png   galinha, vaca e personagem andando
//   capturas/demonstracao-brinquedo.webm  a demonstração de perto
// Opções: --sem-video (pula os vídeos, que são a parte demorada), --so-video, --so-brinquedo (só o que é do conjunto "brinquedo").
// Tudo é tirado em modo passo: a ferramenta manda a simulação andar e fotografa, então o resultado não depende
// da velocidade desta máquina (aqui o WebGL roda em software).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { abrirNavegador, abrirPagina, folhaDeContato, TELAS, capturas, raiz } from './comum.mjs';
import { Mundo } from '../src/jogo/mundo.js';
import { Roteiro } from '../src/jogo/roteiro.js';

const semVideo = process.argv.includes('--sem-video'), soVideo = process.argv.includes('--so-video'), soBrinquedo = process.argv.includes('--so-brinquedo');
const quer = (conjunto) => !soBrinquedo || conjunto === 'brinquedo';
const REFERENCIA = path.resolve(raiz, '../../arte/estilo/rodada-01/estilo-a.png'); // a imagem do Codex que o conjunto "brinquedo" imita
fs.mkdirSync(path.join(capturas, 'folhas'), { recursive: true });
const rel = (p) => path.relative(process.cwd(), p);

// ---------- linha do tempo (só lógica): em que passo cada coisa acontece ----------
function linhaDoTempo(comDemo, passos) {
  const m = new Mundo(), r = comDemo ? new Roteiro() : null, linha = [];
  for (let n = 0; n < passos; n++) {
    if (r) r.passo(m);
    m.passo();
    const p = m.personagem.visual(), o = {};
    for (const id of ['vaca', 'galinha1', 'galinha2', 'celeiro']) o[id] = m.objetos[id].visual().estado;
    linha.push({ n: m.n, e: p.estado, t: p.t || 0, vel: p.vel || 0, carregando: !!p.carregando, ...o });
    if (r && r.fim && m.n > r.fimEm + 60) break;
  }
  return { linha, fimEm: r ? r.fimEm : -1 };
}
// primeiro trecho contínuo em que cond(x) vale por pelo menos "min" passos: devolve [de, ate]
function trecho(linha, cond, min = 1, aPartirDe = 0) {
  let de = -1;
  for (const x of linha) {
    if (x.n < aPartirDe) continue;
    if (cond(x)) { if (de < 0) de = x.n; } else if (de >= 0) { if (x.n - de >= min) return [de, x.n - 1]; de = -1; }
  }
  return de >= 0 && linha[linha.length - 1].n - de >= min ? [de, linha[linha.length - 1].n] : null;
}
const espalhar = ([de, ate], n) => Array.from({ length: n }, (_, i) => Math.round(de + ((ate - de) * i) / Math.max(1, n - 1)));
const rot = (n) => `${(n / 60).toFixed(2)} s`;

const demo = linhaDoTempo(true, 2400), livre = linhaDoTempo(false, 1800);
const acao = (e) => trecho(demo.linha, (x) => x.e === e, 10);
const noTempo = (e, t) => { const tr = acao(e); return tr[0] + Math.round(t * 60); };
const dentro = acao('dentro');

const amb = await abrirNavegador();
try {
  if (!soVideo) {
    // ---------- telas inteiras ----------
    const PASSO_DA_FOTO = 300; // jogo parado há 5 s: vaca pastando, galinha no ninho
    for (const [arquivo, hash, tela, conjunto] of [
      ['cena-paisagem.png', 'passo,tudo', TELAS.paisagem, 'codigo'], ['cena-molde.png', 'passo,tudo', TELAS.paisagem, 'molde'],
      ['celular-retrato.png', 'passo', TELAS.celularRetrato, 'codigo'], ['celular-retrato-tudo.png', 'passo,tudo', TELAS.celularRetrato, 'codigo'], ['celular-paisagem.png', 'passo', TELAS.celularPaisagem, 'codigo'],
      ['cena-brinquedo.png', 'passo,tudo', TELAS.paisagem, 'brinquedo'], ['celular-retrato-brinquedo.png', 'passo', TELAS.celularRetrato, 'brinquedo'],
    ]) {
      if (!quer(conjunto)) continue;
      const { pagina, contexto } = await abrirPagina(amb, `${hash},arte-${conjunto}`, tela);
      await pagina.evaluate((n) => window.__sitio.avancarAte(n), PASSO_DA_FOTO);
      await pagina.screenshot({ path: path.join(capturas, arquivo) });
      await contexto.close();
      console.log('ok', rel(path.join(capturas, arquivo)));
    }

    // ---------- a referência do estilo e o jogo na mesma câmera, lado a lado ----------
    if (fs.existsSync(REFERENCIA)) {
      const sharp = createRequire(import.meta.url)('sharp');
      const { pagina, contexto } = await abrirPagina(amb, 'passo,sem-hud,tudo,arte-brinquedo', { width: 1920, height: 1080, deviceScaleFactor: 1 });
      const jogo = await pagina.screenshot();
      await contexto.close();
      const ref = await sharp(REFERENCIA).resize(1920, 1080, { fit: 'fill' }).toBuffer(), saida = path.join(capturas, 'comparacao-estilo-a.png');
      await sharp({ create: { width: 3860, height: 1080, channels: 3, background: '#ffffff' } }).composite([{ input: ref, left: 0, top: 0 }, { input: jogo, left: 1940, top: 0 }]).png().toFile(saida);
      console.log('ok', rel(saida));
    } else console.log('sem a imagem de referência (' + rel(REFERENCIA) + '): comparacao-estilo-a.png não foi refeita');

    // ---------- um quadro do meio de cada interação, em cada conjunto ----------
    const quadros = [
      { passo: noTempo('girarManivela', 2.0), rotulo: 'Poço: tirar água' },
      { passo: noTempo('plantar', 0.84), rotulo: 'Canteiro: plantar' },
      { passo: noTempo('regar', 1.0), rotulo: 'Canteiro: regar' },
      { passo: noTempo('pegarOvo', 0.62), rotulo: 'Ninho: pegar o ovo' },
      { passo: dentro[0] - 24, rotulo: 'Celeiro: entrar para guardar' },
      { passo: noTempo('colherFruta', 1.16), rotulo: 'Laranjeira: colher' },
      { passo: noTempo('ordenhar', 1.4), rotulo: 'Vaca: ordenhar' },
      { passo: noTempo('colher', 0.92), rotulo: 'Canteiro: colher o milho' },
    ];
    for (const c of ['codigo', 'molde', 'brinquedo']) {
      if (!quer(c)) continue;
      const { pagina, contexto } = await abrirPagina(amb, `passo,demo,sem-hud,arte-${c}`, { width: 900, height: 900, deviceScaleFactor: 1 });
      const saida = path.join(capturas, `acoes-${c}.png`);
      await folhaDeContato(amb, pagina, { quadros, foco: 'personagem', seguir: true, meia: 1.95, escala: 165, lado: 420, colunas: 4, titulo: `Sítio mínimo: um quadro do meio de cada interação (conjunto de arte "${c}")`, saida });
      await contexto.close();
      console.log('ok', rel(saida));
    }

    // ---------- uma folha por animação (conjunto "codigo"; as dos bichos e do andar também no "brinquedo") ----------
    let folhas = [];
    const F = (nome, tit, quadrosDe, foco, meia, escala, opt = {}) => folhas.push({ nome, tit, quadrosDe, foco, meia, escala, ...opt });
    for (const [e, nome, tit, n] of [['girarManivela', 'poco-tirar-agua', 'Poço: tirar água', 12], ['plantar', 'canteiro-plantar', 'Canteiro: plantar milho', 8], ['regar', 'canteiro-regar', 'Canteiro: regar', 8], ['pegarOvo', 'ninho-pegar-ovo', 'Ninho: pegar o ovo', 8], ['colherFruta', 'laranjeira-colher', 'Laranjeira: colher uma laranja', 12], ['ordenhar', 'vaca-ordenhar', 'Vaca: ordenhar', 12], ['colher', 'canteiro-colher', 'Canteiro: colher o milho', 8]]) {
      F(nome, tit, espalhar(acao(e), n), 'personagem', e === 'colherFruta' ? 2.0 : 1.75, e === 'colherFruta' ? 170 : 190);
    }
    // celeiro: da porta abrindo até ela fechar de novo
    const abre = trecho(demo.linha, (x) => x.celeiro !== 'fechado', 30);
    const porta = [-3.2, 1.0, -1.9];
    F('celeiro-guardar', 'Celeiro: a porta abre, ele entra, some, sai e a porta fecha', espalhar([abre[0], abre[1] + 6], 12), porta, 2.5, 130);
    // andar carregando e correr: um ciclo e meio de passada
    const corre = trecho(demo.linha, (x) => x.e === 'correr' && x.vel > 3.7, 50), leva = trecho(demo.linha, (x) => x.e === 'andar' && x.carregando && x.vel > 1.5, 40);
    F('personagem-correr', 'Personagem: correr (ciclo de passada)', espalhar([corre[0] + 4, corre[0] + 4 + 44], 12), 'personagem', 1.3, 230, { seguir: true });
    F('personagem-carregar', 'Personagem: andar carregando o caixote', espalhar([leva[0] + 4, leva[0] + 4 + 48], 12), 'personagem', 1.3, 230, { seguir: true });
    // bichos, com o jogo parado (sem demonstração)
    const L = livre.linha;
    const pasta = trecho(L, (x) => x.vaca === 'pastando', 60), vAnda = trecho(L, (x) => x.vaca === 'andando', 40);
    F('vaca-parada-e-pastando', 'Vaca: parada (respira, rabo, orelhas) e depois pastando', espalhar([Math.max(2, pasta[0] - 60), pasta[0] + 200], 12), 'vaca', 1.7, 180, { livre: true, seguir: true });
    F('vaca-andando', 'Vaca: andando até o ponto de ordenha (o sinal de leite pronto em cima)', espalhar([vAnda[0] + 10, vAnda[0] + 10 + 70], 12), 'vaca', 1.7, 180, { livre: true, seguir: true });
    const asas = trecho(L, (x) => x.galinha1 === 'batendoAsas', 20), bota = trecho(L, (x) => x.galinha1 === 'botando', 60);
    const qualBica = trecho(L, (x) => x.galinha2 === 'bicando', 40), gAnda = trecho(L, (x) => x.galinha2 === 'andando', 40);
    F('galinha-bater-asas', 'Galinha: bater de asas', espalhar([asas[0] + 2, asas[1] + 4], 12), 'galinha1', 0.75, 400, { livre: true, alturaDoFoco: 0.35 });
    F('galinha-botar', 'Galinha: sobe no ninho, bota o ovo e desce', espalhar([bota[0] - 50, bota[1] + 60], 12), 'ninho', 1.0, 300, { livre: true, alturaDoFoco: 0.35 });
    F('galinha-bicar', 'Galinha: bicar o chão', espalhar([qualBica[0] - 6, qualBica[0] + 70], 12), 'galinha2', 0.75, 400, { livre: true, seguir: true, alturaDoFoco: 0.35 });
    F('galinha-andar', 'Galinha: andar', espalhar([gAnda[0] + 6, gAnda[0] + 6 + 33], 12), 'galinha2', 0.75, 400, { livre: true, seguir: true, alturaDoFoco: 0.35 });
    // canteiro: as fases do milho (na demonstração, depois de regado)
    const rega = acao('regar'), colhe = acao('colher');
    F('canteiro-fases', 'Canteiro: vazio, semeado, molhado (mais escuro), broto, crescendo e pronto', [acao('plantar')[0] - 4, rega[0] - 2, rega[1] + 20, rega[1] + 300, rega[1] + 520, rega[1] + 760, rega[1] + 980, colhe[0] - 2], [0.3, 0.6, 4.3], 1.6, 190);

    // andar sem carregar nada (só no conjunto "brinquedo", que não tinha folha do andar simples)
    const anda = trecho(demo.linha, (x) => x.e === 'andar' && !x.carregando && x.vel > 1.5, 40);
    const doBrinquedo = folhas.filter((f) => /^(galinha|vaca|personagem)-/.test(f.nome)).map((f) => ({ ...f, nome: f.nome + '-brinquedo', conjunto: 'brinquedo' }));
    if (anda) doBrinquedo.push({ nome: 'personagem-andar-brinquedo', tit: 'Personagem: andar (ciclo de passada)', quadrosDe: espalhar([anda[0] + 4, anda[0] + 4 + 48], 12), foco: 'personagem', meia: 1.3, escala: 230, seguir: true, conjunto: 'brinquedo' });
    folhas = [...folhas.map((f) => ({ ...f, conjunto: 'codigo' })), ...doBrinquedo].filter((f) => quer(f.conjunto));
    for (const f of folhas) if (f.conjunto === 'brinquedo') f.tit += ' (conjunto "brinquedo")';

    // a simulação só anda para a frente: tira as folhas na ordem do primeiro quadro; quem precisa voltar no tempo abre outra página
    const paginas = {}, andou = {};
    const abrir = (f) => abrirPagina(amb, (f.livre ? 'passo,sem-hud' : 'passo,demo,sem-hud') + ',arte-' + f.conjunto, { width: 900, height: 900, deviceScaleFactor: 1 });
    for (const f of folhas.sort((a, b) => a.quadrosDe[0] - b.quadrosDe[0])) {
      const chave = (f.livre ? 'livre' : 'demo') + ':' + f.conjunto;
      if (paginas[chave] && f.quadrosDe[0] < andou[chave]) { await paginas[chave].contexto.close(); paginas[chave] = null; }
      if (!paginas[chave]) paginas[chave] = await abrir(f);
      const { pagina } = paginas[chave];
      const saida = path.join(capturas, 'folhas', f.nome + '.png');
      let foco = f.foco;
      if (typeof foco === 'string' && f.alturaDoFoco !== undefined && !f.seguir) { await pagina.evaluate((n) => window.__sitio.avancarAte(n), f.quadrosDe[0]); const p = await pagina.evaluate((id) => window.__sitio.posicao(id), foco); foco = [p[0], f.alturaDoFoco, p[1]]; }
      await folhaDeContato(amb, pagina, { quadros: f.quadrosDe.map((n) => ({ passo: n, rotulo: rot(n) })), foco, seguir: !!f.seguir, alturaDoFoco: f.alturaDoFoco, meia: f.meia, escala: f.escala, lado: f.quadrosDe.length > 8 ? 300 : 330, colunas: f.quadrosDe.length > 8 ? 6 : 4, titulo: f.tit, saida });
      andou[chave] = f.quadrosDe[f.quadrosDe.length - 1];
      console.log('ok', rel(saida));
    }
    for (const k in paginas) if (paginas[k]) await paginas[k].contexto.close();
  }

  // ---------- vídeos da demonstração: o sítio inteiro e de perto, com a câmera acompanhando o personagem ----------
  if (!semVideo) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sitio-minimo-video-')); // fora do repositório
    const ultimo = Math.min(demo.fimEm + 30, 30 * 60 - 12); // 30 quadros por segundo: um quadro a cada 2 passos
    for (const [modo, nome, conjunto] of [['tudo', 'demonstracao.webm', 'codigo'], ['perto', 'demonstracao-de-perto.webm', 'codigo'], ['perto', 'demonstracao-brinquedo.webm', 'brinquedo']]) {
      if (!quer(conjunto)) continue;
      fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
      const { pagina, contexto } = await abrirPagina(amb, `passo,demo,${modo},arte-${conjunto}`, { width: 960, height: 540, deviceScaleFactor: 1 });
      let k = 0;
      for (let n = 0; n <= ultimo; n += 2, k++) {
        await pagina.evaluate((p) => window.__sitio.avancarAte(p), n);
        await pagina.screenshot({ path: path.join(tmp, String(k).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 93 });
        if (k % 150 === 0) console.log(`   vídeo ${nome}: quadro ${k} de ${Math.floor(ultimo / 2) + 1}`);
      }
      await contexto.close();
      const saida = path.join(capturas, nome);
      const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(tmp, '%05d.jpg'), '-c:v', 'libvpx', '-b:v', '1400k', '-crf', '12', '-pix_fmt', 'yuv420p', '-an', saida], { encoding: 'utf8' });
      if (r.status !== 0) { console.log('ffmpeg falhou:', r.stderr || r.error); process.exitCode = 1; }
      else console.log('ok', rel(saida), `${k} quadros = ${(k / 30).toFixed(1)} s, ${(fs.statSync(saida).size / 1024).toFixed(0)} KB`);
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  }
} finally { await amb.fechar(); }
