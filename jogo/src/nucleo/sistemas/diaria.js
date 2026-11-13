// O presente do dia (missoes.json → diaria): sete presentes que avançam por DIA JOGADO. Quem falta um dia continua de
// onde parou: nada zera, não há contador de sequência nem aviso de perda. O presente espera na caixa de correio
// até o jogador abrir (comando abrirPresente); nada abre sozinho.
// O dia sai do relógio do mundo (injetado) mais o fuso do aparelho, que a plataforma passa pelo comando "fuso":
// a lógica não lê relógio nenhum.
import { registrarSistema, registrarEvento } from '../registro.js';
import { progressoDe, resolver, entregar } from '../premios.js';

const DIA_MS = 86400000;
// o número do dia de hoje no fuso do jogador (dias inteiros desde 1970)
export const diaDoMundo = (m) => Math.floor((m.agora + (m.diaria ? m.diaria.fuso : 0) * 60000) / DIA_MS);
const dias = (m) => progressoDe(m.dados).dias;

// há um presente esperando hoje?
export function temPresente(m) {
  const D = m.diaria;
  return dias(m).length > 0 && (D.ultimoDia === null || diaDoMundo(m) > D.ultimoDia);
}

// para o painel: os dias da volta atual
//   { tem, completa, voltas, abertos, dias: [{ dia, recompensa, estado: 'aberto' | 'hoje' | 'amanha' | 'depois' }] }
// "completa": o sétimo acabou de ser aberto (o cartão fica todo marcado até o dia seguinte)
export function estadoDaDiaria(m) {
  const D = m.diaria, L = dias(m), tem = temPresente(m), completa = !tem && D.proximo === 0 && D.abertos > 0;
  return {
    tem, completa, voltas: D.voltas, abertos: D.abertos,
    dias: L.map((d, i) => ({
      dia: i + 1,
      recompensa: resolver(m, d.recompensa, D.voltas - (completa ? 1 : 0) === 0 ? d.primeiraVolta : null),
      estado: completa || i < D.proximo ? 'aberto' : i === D.proximo ? (tem ? 'hoje' : 'amanha') : 'depois',
    })),
  };
}

// o relógio do aparelho voltou muito (dia trocado à mão): o presente não fica preso num dia que não vem mais
function conferir(m) {
  const D = m.diaria, dia = diaDoMundo(m);
  if (D.ultimoDia !== null && dia < D.ultimoDia - 1) D.ultimoDia = dia;
  if (temPresente(m) && D.avisado !== dia) { D.avisado = dia; m.eventos.emitir('presenteChegou', { dia: D.proximo + 1 }); }
}

registrarEvento('presenteChegou', { campos: ['dia'] });
// uma recompensa que não é de nível, de missão nem de conquista: classe "diaria", "convidado" ou "amigo"
registrarEvento('recompensa', { campos: ['classe', 'dia', 'recompensa'] });

registrarSistema({
  id: 'diaria',
  iniciar(m) { m.diaria = { fuso: 0, proximo: 0, voltas: 0, ultimoDia: null, abertos: 0, avisado: null }; },
  segundo: conferir,
  ausencia: conferir,
  comandos: {
    // a plataforma diz quantos minutos o relógio do aparelho está à frente do relógio universal (Brasília: -180)
    fuso(m, c) {
      const v = Math.round(Number(c.minutos));
      if (!Number.isFinite(v) || v < -900 || v > 900) return { ok: false, motivo: 'fuso-invalido' };
      m.diaria.fuso = v;
      conferir(m);
      return { ok: true, dados: { minutos: v } };
    },
    abrirPresente(m) {
      const D = m.diaria, L = dias(m);
      if (!L.length) return { ok: false, motivo: 'sem-presente' };
      if (!temPresente(m)) return { ok: false, motivo: 'presente-amanha' };
      const i = D.proximo < L.length ? D.proximo : 0;
      const premio = resolver(m, L[i].recompensa, D.voltas === 0 ? L[i].primeiraVolta : null);
      D.ultimoDia = diaDoMundo(m);
      D.proximo = (i + 1) % L.length;
      if (D.proximo === 0) D.voltas++;
      D.abertos++;
      entregar(m, premio, 'diaria');
      const d = { classe: 'diaria', id: 'dia-' + (i + 1), dia: i + 1, n: 1, recompensa: premio };
      m.eventos.emitir('resgatou', d);
      m.eventos.emitir('recompensa', d);
      return { ok: true, dados: d };
    },
  },
  salvar(m) { const D = m.diaria; return { fuso: D.fuso, proximo: D.proximo, voltas: D.voltas, ultimoDia: D.ultimoDia, abertos: D.abertos }; },
  carregar(m, d) {
    const D = m.diaria, n = dias(m).length;
    D.fuso = Number.isFinite(d.fuso) ? Math.max(-900, Math.min(900, Math.round(d.fuso))) : 0;
    D.proximo = n > 0 && d.proximo > 0 ? Math.floor(d.proximo) % n : 0;
    D.voltas = d.voltas > 0 ? Math.floor(d.voltas) : 0;
    D.ultimoDia = Number.isFinite(d.ultimoDia) ? Math.floor(d.ultimoDia) : null;
    D.abertos = d.abertos > 0 ? Math.floor(d.abertos) : 0;
  },
});
