// Segurar para a fileira: o dedo (ou o mouse) parado numa casa do campo de plantação (com o boi, também na grama
// encostada no campo: a fileira do boi, até o limite do arado, no eixo com mais casas para arar), ou o botão de agir
// seguro (Espaço ou Enter, o A do controle, o botão de agir da tela; vale a casa à frente dela), mostra a fileira toda
// marcada no chão com o que vai para a fila; soltar confirma (comando "agirNoAlvo" com fileira), mexer o dedo cancela.
// A ação da fileira é a natural da casa segurada (arar, plantar o que está na mão ou regar: nucleo/sistemas/acoes.js).
// A linha de dica avisa, numa casa do campo, que segurar faz a fileira.
import { J } from '../contexto.js';
import { fileiraNatural } from '../nucleo/sistemas/acoes.js';
import { alvoDaFrente } from '../nucleo/sistemas/personagem.js';
import { FILEIRA } from '../render/campo.js';
import { T } from '../ui/textos.js';
import '../ui/textos/campo.js';
import { som } from '../plataforma/som.js';

const SEGURAR = 0.45; // segundos segurando até a fileira aparecer

export function ligarFileira(entrada, hud) {
  const st = { origem: null, x: -1, z: -1, t: 0, prev: null, recalc: 0, modo: null };
  const frente = { x: 0, z: 0, entidade: undefined };

  function limpar() {
    st.origem = null; st.prev = null;
    FILEIRA.ligada = false; FILEIRA.casas = FILEIRA.alvo = FILEIRA.molha = null;
  }
  function mostrar() {
    const f = fileiraNatural(J.mundo, st.x, st.z, st.modo);
    st.prev = f;
    FILEIRA.ligada = !!f && f.n > 0;
    FILEIRA.casas = f ? f.casas : null; FILEIRA.alvo = f ? f.alvo : null; FILEIRA.molha = f ? f.molha : null;
  }

  const api = {
    // começou a segurar: o dedo na casa (x, z); as teclas e os botões, na casa à frente dela
    apertou(origem, x, z) {
      limpar();
      if (origem !== 'dedo') {
        alvoDaFrente(J.mundo, frente);
        if (frente.entidade !== undefined) return;
        x = frente.x; z = frente.z;
      }
      const f = fileiraNatural(J.mundo, x, z);
      if (!f) return; // casa sem fileira (fora do campo; na grama, só com o boi): segurar não faz nada
      // (o modo fica o de agora: nas teclas, a primeira casa entra na fila logo depois, e a ação dela muda)
      st.origem = origem; st.x = x; st.z = z; st.t = 0; st.recalc = 0; st.modo = f.modo;
    },
    cancelar(origem) { if (!origem || st.origem === origem) limpar(); },
    // soltou: com a fileira à mostra, manda o comando e devolve true (o toque comum não acontece)
    soltou(origem) {
      if (!st.origem || st.origem !== origem) return false;
      const f = FILEIRA.ligada ? st.prev : null, x = st.x, z = st.z, modo = st.modo;
      limpar();
      if (!f || !f.n) return false;
      const r = J.mundo.comando({ tipo: 'agirNoAlvo', x, z, fileira: true, modo });
      som.tocar(r.ok ? 'toque' : 'erro');
      J.cena.part.anel(x + 0.5, z + 0.5, r.ok ? '#ffffff' : '#ffb39a');
      return true;
    },
    segurando: () => FILEIRA.ligada,
    // a cada quadro (entrada/index.js)
    atualizar(dt) {
      if (!st.origem) return;
      st.t += dt;
      if (st.t < SEGURAR) return;
      st.recalc -= dt;
      if (st.recalc > 0) return;
      st.recalc = 0.25; // a fila anda enquanto se segura: a conta se refaz umas vezes por segundo
      const antes = FILEIRA.ligada;
      mostrar();
      if (!antes && FILEIRA.ligada) {
        som.tocar('toque');
        try { if (navigator.vibrate) navigator.vibrate(12); } catch { /* sem vibrar */ }
      }
    },
    // a linha de dica: segurando, o que acontece ao soltar; numa casa do campo, que segurar faz a fileira toda
    dica(texto, m, x, z, ent) {
      if (FILEIRA.ligada && st.prev) return T.campo.solte(st.prev.acao, st.prev.n);
      if (ent !== null || x < 0) return texto;
      const f = fileiraNatural(m, x, z);
      if (!f || f.n < 2) return texto;
      const extra = J.meio === 'teclas' ? T.campo.segureTecla(f.n) : T.campo.segure(f.n);
      return texto ? `${texto} · ${extra}` : extra;
    },
  };

  // (o botão de agir da tela chega aqui por entrada/agir.js)
  window.addEventListener('blur', () => api.cancelar());
  return api;
}
