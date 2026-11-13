// O fôlego: ela corre nos trechos longos enquanto há fôlego; sem fôlego volta a andar (nunca mais devagar que isso)
// e recupera, também andando. Anda com aceleração e freio.
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, ateParar, ouvirTudo, pular } from './apoio.mjs';

test('trecho curto ela anda; trecho longo ela corre e gasta fôlego', () => {
  const m = novoMundo(), p = m.personagem, R = m.dados.regras;
  m.comando({ tipo: 'irPara', x: 12.5, z: 11.5 });
  let correu = false, vmax = 0;
  while (p.fila.length || p.rota) { m.passo(); correu = correu || p.correndo; vmax = Math.max(vmax, p.vel); }
  assert.equal(correu, false);
  assert.ok(vmax <= R.andar + 1e-9);
  assert.equal(p.folego, R.folego.max);

  m.comando({ tipo: 'irPara', x: 18.5, z: 18.5 });
  vmax = 0;
  while (p.fila.length || p.rota) { m.passo(); correu = correu || p.correndo; vmax = Math.max(vmax, p.vel); }
  assert.equal(correu, true);
  assert.ok(vmax > R.andar * 1.5 && vmax <= R.correr + 1e-9);
  assert.ok(p.folego < R.folego.max);
});

test('ela acelera ao sair e freia ao chegar (não dá tranco)', () => {
  const m = novoMundo(), p = m.personagem;
  m.comando({ tipo: 'irPara', x: 10.5, z: 16.5 });
  m.passo(); m.passo();
  const v1 = p.vel;
  assert.ok(v1 > 0 && v1 < 1, 'começa devagar');
  let anterior = v1, maiorSalto = 0, ultima = 0;
  while (p.rota) { m.passo(); maiorSalto = Math.max(maiorSalto, Math.abs(p.vel - anterior)); if (p.rota) ultima = p.vel; anterior = p.vel; }
  assert.ok(ultima < 1.2, `chega devagar (vinha a ${ultima.toFixed(2)})`);
  assert.equal(p.vel, 0);
});

test('sem fôlego ela cansa, volta ao passo normal (nunca mais devagar) e recupera andando', () => {
  const m = novoMundo((b) => { b.regras.folego = { max: 10, gastoPorSeg: 20, recuperaAndando: 4, recuperaParado: 10 }; }), p = m.personagem, R = m.dados.regras, ev = ouvirTudo(m);
  m.comando({ tipo: 'rumar', dx: 1, dz: 0, correr: true });
  // corre pelo caminho até cansar
  p.x = 5.5; p.z = 9.5;
  let k = 0;
  while (!p.cansada && k++ < 600) m.passo();
  assert.equal(p.cansada, true);
  assert.equal(ev.de('cansou').length, 1);
  assert.equal(p.folego, 0);
  // meio segundo depois já está no passo de andar, nem mais nem menos
  m.avancar(0.5);
  assert.equal(p.correndo, false);
  assert.ok(Math.abs(p.vel - R.andar) < 0.05, `cansada anda a ${p.vel.toFixed(2)} (andar = ${R.andar})`);
  assert.ok(p.folego > 0, 'recupera andando');
  // com um quarto do fôlego de volta, corre de novo
  let voltou = false;
  for (k = 0; k < 600 && !voltou; k++) { m.passo(); voltou = p.correndo; }
  assert.equal(voltou, true);
  assert.ok(p.folego >= R.folego.max * 0.2);
  m.comando({ tipo: 'frear' });
});

test('parada o fôlego volta mais depressa; o tempo fora do jogo também recupera', () => {
  const m = novoMundo(), p = m.personagem, F = m.dados.regras.folego;
  p.folego = 0; p.cansada = true;
  m.avancar(2);
  assert.ok(Math.abs(p.folego - F.recuperaParado * 2) < 0.5);
  p.folego = 0; p.cansada = true;
  pular(m, 3600);
  assert.equal(p.folego, F.max);
  assert.equal(p.cansada, false);
});

test('teclas, controle e alavanca: anda na direção, desliza no que esbarra e para ao soltar', () => {
  const m = novoMundo(), p = m.personagem, cel = m.local.porId.celeiro;
  m.comando({ tipo: 'rumar', dx: 0, dz: 1 });
  m.avancar(1);
  assert.ok(p.z > 11.5 && Math.abs(p.x - 10.5) < 1e-6);
  m.comando({ tipo: 'frear' });
  m.avancar(0.5);
  assert.equal(p.vel, 0);
  // contra o celeiro, na diagonal: não entra nele, mas escorrega de lado
  p.x = cel.x + 1.5; p.z = cel.z + cel.p + 0.6;
  const x0 = p.x;
  m.comando({ tipo: 'rumar', dx: 0.7, dz: -0.7 });
  m.avancar(1);
  assert.ok(p.z >= cel.z + cel.p, 'não entra na construção');
  assert.ok(p.x > x0 + 0.5, 'desliza ao longo da parede');
  m.comando({ tipo: 'frear' });
  ateParar(m);
});
