// O botão de agir (Espaço ou Enter, o A do controle, o botão redondo da tela): age no alvo à frente dela.
//   - alvo com uma ação: age na hora, e segurar numa casa do campo faz a fileira (entrada/fileira.js);
//   - alvo com mais de uma ação (o curral, a indústria com produto pronto): apertar e soltar faz a principal; segurar
//     abre a roda de ações (ui/acoes.js), que as setas percorrem. O foco cai na roda só depois de soltar o botão
//     (assim o soltar não "clica" no botão focado).
import { J } from '../contexto.js';
import { alvoDaFrente } from '../nucleo/sistemas/personagem.js';
import { acoesDoAlvo } from '../nucleo/sistemas/acoes.js';
import { acoesUi, pedeRoda } from '../ui/acoes.js';
import { som } from '../plataforma/som.js';

const SEGURAR = 0.45; // segundos segurando até a roda abrir (o mesmo tempo da fileira)

export function ligarAgir(entrada, hud) {
  const frente = { x: 0, z: 0, entidade: undefined };
  const st = { origem: null, t: 0, alvo: null, opcoes: null, abriu: null };

  function alvoAgora() {
    const m = J.mundo;
    alvoDaFrente(m, frente);
    return frente.entidade !== undefined ? { entidade: frente.entidade } : { x: frente.x, z: frente.z };
  }
  function agirNaFrente() {
    const r = J.mundo.comando({ tipo: 'agirNoAlvo', frente: true });
    if (!r.ok && r.motivo && r.motivo !== 'na-fila') som.tocar('erro');
    return r;
  }

  const api = {
    apertou(origem) {
      J.meio = 'teclas'; entrada.usouTeclas();
      if (acoesUi.rodaAberta) acoesUi.fecharRoda();
      const colocando = document.body.classList.contains('colocando'); // (escolhendo o lugar de uma construção: agir confirma)
      const alvo = alvoAgora(), opcoes = !colocando && alvo.entidade !== undefined ? acoesDoAlvo(J.mundo, alvo) : null;
      if (opcoes && pedeRoda(opcoes)) { st.origem = origem; st.t = 0; st.alvo = alvo; st.opcoes = opcoes; st.abriu = null; return; } // espera: soltar = a principal; segurar = a roda
      st.origem = null;
      entrada.fileira.apertou(origem); // segurar numa casa do campo: a fileira (antes de agir: guarda a ação de agora)
      agirNaFrente();
    },
    soltou(origem) {
      if (st.abriu === origem) { st.abriu = null; if (origem !== 'botao') acoesUi.focarRoda(); return; } // (no dedo, sem foco: ele toca no botão da roda)
      if (st.origem === origem) { st.origem = null; agirNaFrente(); return; }
      entrada.fileira.soltou(origem);
    },
    cancelar(origem) {
      if (!origem || st.origem === origem) st.origem = null;
      if (!origem || st.abriu === origem) st.abriu = null;
      entrada.fileira.cancelar(origem);
    },
    atualizar(dt) {
      if (!st.origem) return;
      st.t += dt;
      if (st.t < SEGURAR) return;
      const origem = st.origem;
      st.origem = null;
      if (acoesUi.abrirRoda(st.alvo, st.opcoes, false)) st.abriu = origem;
      else agirNaFrente();
    },
  };

  // o botão redondo da tela (esquema com alavanca, e nas teclas): o mesmo, com o dedo
  const b = hud.agir;
  if (b) {
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); som.destravar(); api.apertou('botao'); });
    b.addEventListener('pointerup', () => api.soltou('botao'));
    b.addEventListener('pointercancel', () => api.cancelar('botao'));
    b.addEventListener('pointerleave', () => { if (st.origem === 'botao') api.soltou('botao'); else api.cancelar('botao'); });
  }
  window.addEventListener('blur', () => api.cancelar());
  return api;
}
