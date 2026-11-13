// O atalho da versão de teste: sobe de nível de uma vez (uma tela só), dá ouro e material, grava.
import test from 'node:test';
import assert from 'node:assert/strict';
import { novoMundo, ouvirTudo } from './apoio.mjs';
import { ATALHO } from '../src/nucleo/sistemas/atalho-de-teste.js';

test('atalho de teste sobe direto para o nível, com um único aviso de subida, e dá ouro', () => {
  const m = novoMundo(), ev = ouvirTudo(m), ouro = m.posses.ouro, alvo = Math.min(5, m.dados.niveis.max);
  const r = m.comando({ tipo: 'atalhoDeTeste', nivel: alvo });
  assert.equal(r.ok, true);
  assert.equal(m.progresso.nivel, alvo);
  assert.equal(m.posses.ouro, ouro + ATALHO.ouro);
  assert.equal(ev.de('subiuDeNivel').length, 1);
  assert.equal(m.comando({ tipo: 'atalhoDeTeste', nivel: 1 }).motivo, 'ja-passou');
  const n = m.constructor.carregar(m.dados, JSON.parse(JSON.stringify(m.salvar())), { agora: m.agora });
  assert.equal(n.progresso.nivel, alvo);
  assert.equal(n.atalhoDeTeste.usado, 1);
});

test('só ouro e material não mexe no nível', () => {
  const m = novoMundo(), nivel = m.progresso.nivel;
  assert.equal(m.comando({ tipo: 'atalhoDeTeste', nivel: 0, soMaterial: true }).ok, true);
  assert.equal(m.progresso.nivel, nivel);
});
