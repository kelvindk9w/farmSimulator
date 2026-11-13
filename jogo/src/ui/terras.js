// O retorno da frente das terras na interface: os textos, o desenho no mapa, o que cada evento mostra (lote comprado,
// terra limpa, fruta, ferramenta gasta) e o aviso de conserto no HUD. Tudo se liga a cada mundo instalado.
import './textos/terras.js';
import { ROTULOS, mostrarAreaDoAspersor } from '../render/terras.js';
import { aoInstalarMundo } from './ligacoes.js';
import { el, botao, por } from './dom.js';
import { T } from './textos.js';
import { J } from '../contexto.js';
import { avisar } from './avisos.js';
import { ICONE_DA_ACAO } from './hud.js';
import { abrirPainel, painelAberto } from './paineis/registro.js';
import { INFO_DA_OFERTA } from './paineis/loja.js';
import { itensGastando } from '../nucleo/sistemas/desgaste.js';
import { arvoresComFruta } from '../nucleo/sistemas/arvores.js';
import { TIPO_DO_ASPERSOR, casasDoAspersor } from '../nucleo/sistemas/aspersor.js';
import { som } from '../plataforma/som.js';

ROTULOS.lote = T.terras.rotulo;
Object.assign(ICONE_DA_ACAO, { rocar: 'icone/foice-velha', cortar: 'icone/machado-velho', quebrar: 'icone/picareta-velha', colherFruta: 'ui/mao', plantarMuda: (t) => 'icone/' + t.args.muda });

// na loja: a muda diz quanto demora e quanto dá; o regador de área, quantas casas molha
INFO_DA_OFERTA.push((m, it) => {
  const D = m.dados;
  if (it.tipo === 'muda') { const a = D.arvores[D.arvoreDaMuda[it.id]]; return a ? T.loja.arvore(a, D.itens[a.fruto]) : null; }
  if (it.funcao === 'regador' && it.area > 1) return `${T.loja.capacidadeRegador(it.capacidade)}, ${T.loja.area(it.area)}`;
  return null;
});

const VERDE = '#d9ffb0', DOURADO = '#ffe07a';
const GRAVA_LOGO = { limpou: 1, consertou: 1, plantou: 1 }; // (a compra do lote e a colheita já gravam: são "comprou" e "colheu")

// ---------- o aviso de conserto no HUD: aparece só quando alguma ferramenta está gasta ou quase ----------
let chip = null, contaChip = null;
function prepararChip(hud) {
  if (chip || !hud || !hud.raiz) return;
  const linha = hud.raiz.querySelector('.topo-esq .linha:last-child');
  if (!linha) return;
  chip = botao({ icone: 'icone/martelo', tamanho: 22, classe: 'chip conserto', rotulo: T.ferramentas.abrir, aoClicar: () => { som.tocar('toque'); abrirPainel('ferramentas'); } });
  contaChip = el('span', '', T.ferramentas.aviso(1));
  chip.append(contaChip);
  chip.dataset.k = 'conserto';
  chip.hidden = true;
  linha.append(chip);
}
function atualizarChip() {
  if (!chip || !J.mundo) return;
  const lista = itensGastando(J.mundo), some = lista.length === 0;
  if (chip.hidden !== some) chip.hidden = some;
  if (some) return;
  por(contaChip, T.ferramentas.aviso(lista.length));
  const gasta = lista.some((g) => g.gasta);
  if (chip._gasta !== gasta) { chip._gasta = gasta; chip.classList.toggle('gasta', gasta); }
}
// confere uma vez por segundo (o desgaste anda devagar; nada disto precisa ir no quadro)
setInterval(() => { if (!document.hidden) atualizarChip(); }, 1000);

aoInstalarMundo((m, ctx) => {
  const cena = J.cena, part = cena.part, D = m.dados, ev = m.eventos;
  prepararChip(ctx && ctx.hud);
  atualizarChip();

  ev.ouvir('*', (d, tipo) => { if (GRAVA_LOGO[tipo]) J.gravarLogo(); });
  // o toque na placa pede o painel das terras; quem abre é a ligação geral de "pediuPainel" (interface de construir).
  // Se ela não estiver ligada, abre daqui (espera um instante para não abrir duas vezes).
  ev.ouvir('pediuPainel', (d) => { if (d.painel === 'terras') queueMicrotask(() => { if (painelAberto() !== 'terras') abrirPainel('terras', d.arg); }); });

  // lote comprado: festa em cima da terra nova
  ev.ouvir('comprou', (d) => {
    if (!d.lote) return;
    const a = d.area || [d.x, d.z, d.x + 1, d.z + 1], cx = (a[0] + a[2]) / 2, cz = (a[1] + a[3]) / 2;
    for (let k = 0; k < 14; k++) { const x = a[0] + ((k * 37) % 100) / 100 * (a[2] - a[0]), z = a[1] + ((k * 61) % 100) / 100 * (a[3] - a[1]); part.brilho(x, 0.6, z, 5); }
    part.brilho(d.x + 0.5, 1.2, d.z + 0.5, 14);
    part.texto(T.terras.festa(d), cx, 1.6, cz, DOURADO); // (o aviso do alto da tela é o de "comprou": T.ganhos.comprou)
  });

  // limpar: lascas, e o material que entrou na bolsa sobe do lugar
  ev.ouvir('golpeou', (d) => part.terra(d.x, d.z, 6));
  ev.ouvir('limpou', (d) => {
    if (d.obstaculo === 'mato') part.folhas(d.x, d.z); else part.terra(d.x, d.z, 14);
    const t = T.ganhos.limpou(d, D);
    if (t) part.texto(t, d.x + 0.5, 0.9, d.z + 0.5, VERDE);
  });

  // árvores
  let frutas = 0, relogioFrutas = 0;
  ev.ouvir('deuFruta', (d) => {
    if (d.local === m.local.id) part.brilho(d.x + 0.5, 2.2, d.z + 0.5, 10);
    // várias árvores dão fruta juntas (na volta de uma ausência): um aviso só
    frutas++;
    clearTimeout(relogioFrutas);
    relogioFrutas = setTimeout(() => { avisar(T.ganhos.deuFruta(Math.max(frutas, arvoresComFruta(m))), 'bom', 4200); frutas = 0; }, 60);
  });
  ev.ouvir('arvoreCresceu', (d) => { part.brilho(d.x + 0.5, 1.6, d.z + 0.5, 14); avisar(T.ganhos.arvoreCresceu(d, D), 'bom'); });

  // ferramentas: a nova que toma o lugar da velha, o aviso antes de gastar, a gasta e o conserto
  ev.ouvir('ganhouItem', (d) => {
    const it = D.itens[d.item];
    if (!it || it.tipo !== 'ferramenta') return;
    const F = m.posses.ferramentas, f = F[d.item];
    if (!f || f.onde !== 'cinto') return;
    let velha = null;
    for (const id in F) if (id !== d.item && D.itens[id].funcao === it.funcao && F[id].onde === 'suporte' && (!velha || D.itens[id].degrau > D.itens[velha].degrau)) velha = id;
    if (velha) avisar(T.ganhos.trocou(d.item, velha, D), 'bom', 4200);
  });
  ev.ouvir('ferramentaGastando', (d) => { avisar(T.ganhos.gastando(d, D), '', 4200); atualizarChip(); });
  ev.ouvir('ferramentaGasta', (d) => { avisar(T.ganhos.gasta(d, D), '', 4800); atualizarChip(); });
  ev.ouvir('consertou', (d) => { avisar(T.ganhos.consertou(d, D), 'bom'); const p = m.personagem; part.brilho(p.x, 1.4, p.z, 10); atualizarChip(); });
  ev.ouvir('carregou', atualizarChip);

  // aspersor: a área regada fica à mostra por uns segundos quando ele é colocado, mudado de lugar ou a obra acaba
  const area = (d) => { if (d.construcao === TIPO_DO_ASPERSOR && d.entidade) mostrarAreaDoAspersor(d.entidade, 7); };
  for (const tipo of ['comecouObra', 'moveuConstrucao', 'recolocou']) ev.ouvir(tipo, area);
  ev.ouvir('construiu', (d) => { if (d.construcao !== TIPO_DO_ASPERSOR) return; area(d); const e = m.local.porId[d.entidade]; avisar(T.ganhos.aspersor(e ? casasDoAspersor(m, m.local, e.x, e.z).length : 24), 'bom', 4200); });
});
