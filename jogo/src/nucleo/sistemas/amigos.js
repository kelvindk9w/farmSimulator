// Amigos: o convite e o compartilhar (missoes.json → convite, compartilhar; cada um com "ligado").
// Cada fazenda tem um código de convite; o endereço do jogo com #convite-<codigo> leva o código a quem abre.
//   usarConvite { codigo }   quem abre o jogo pela primeira vez com um convite ganha o presente de convidado (espera no correio)
//   receberConvite           abre esse presente
//   amigoChegou { codigo }   um amigo convidado chegou ao nível pedido: fica um presente esperando (até "limite" amigos)
//   receberDeAmigo           abre um presente de amigo
//   compartilhar { modo }    o jogador copiou o convite ou a foto da fazenda: um agrado pequeno, uma vez por dia
//   nomearFazenda { nome }   o nome aparece na foto e no convite
// Não há servidor: ninguém avisa este jogo de que o amigo chegou. A lógica (amigoChegou) está pronta para quando
// houver; até lá, só o botão de teste do painel a chama. Nada aqui publica em nome do jogador, e nada do jogo
// depende de convidar.
import { registrarSistema, registrarEvento } from '../registro.js';
import { resumo } from '../util.js';
import { progressoDe, resolver, entregar, temPremio } from '../premios.js';
import { diaDoMundo } from './diaria.js';

const LETRAS = 'abcdefghjkmnpqrstuvwxyz23456789'; // sem i, l, o, 0 e 1, que se confundem ao ler em voz alta
const TAMANHO = 6, NOME_MAX = 24;

function codigoDe(semente) {
  let h = parseInt(resumo('convite:' + semente), 16), g = parseInt(resumo(semente + ':fazenda'), 16), out = '';
  for (let k = 0; k < TAMANHO; k++) { out += LETRAS[(h + g) % LETRAS.length]; h = Math.floor(h / LETRAS.length); g = Math.floor(g / 7); }
  return out;
}
// deixa um código digitado ou vindo do endereço no formato dos códigos (ou devolve '')
export function limparCodigo(texto) {
  const t = String(texto || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return t.length >= 4 && t.length <= 12 ? t : '';
}
function limparNome(texto) {
  return String(texto || '').replace(/[\u0000-\u001f\u007f<>&"'`\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, NOME_MAX).trim();
}

const convite = (m) => progressoDe(m.dados).convite;
// é uma fazenda que ainda não começou? (só ela pode usar um convite)
const fazendaNova = (m) => m.progresso.nivel <= 1 && m.progresso.xp === 0 && (!m.missoes || m.missoes.feitas.length === 0);

// para o painel
//   { ligado, codigo, nome, nivel (que o amigo tem de alcançar), limite, chegaram, aReceber, recebidos, convidadoPor,
//     presenteDeConvidado: 'nao' | 'espera' | 'recebido', porAmigo, convidado (recompensas em números de agora),
//     compartilhar: { ligado, recompensa, ganhouHoje } }
export function estadoDosAmigos(m) {
  const A = m.amigos, C = convite(m), S = progressoDe(m.dados).compartilhar;
  return {
    ligado: C.ligado, codigo: A.codigo, nome: A.nome, nivel: C.nivel, limite: C.limite, chegaram: A.chegaram.length, aReceber: A.aReceber, recebidos: A.recebidos,
    convidadoPor: A.convidadoPor, presenteDeConvidado: A.presente, porAmigo: resolver(m, C.porAmigo), convidado: resolver(m, C.convidado),
    compartilhar: { ligado: S.ligado, recompensa: resolver(m, S.recompensa), ganhouHoje: A.compartilhouDia === diaDoMundo(m) && A.compartilhouN >= S.limitePorDia },
  };
}
// quantos presentes de amigos esperam no correio (o de convidado e os de quem chegou)
export const presentesDeAmigos = (m) => (m.amigos.presente === 'espera' ? 1 : 0) + m.amigos.aReceber;

registrarEvento('compartilhou', { campos: ['modo', 'n'] });
registrarEvento('amigoChegou', { campos: ['codigo', 'n'] });

registrarSistema({
  id: 'amigos',
  iniciar(m) {
    m.amigos = { codigo: codigoDe(String(Math.round(m.agora))), nome: '', convidadoPor: null, presente: 'nao', chegaram: [], aReceber: 0, recebidos: 0, compartilhouDia: null, compartilhouN: 0 };
  },
  comandos: {
    nomearFazenda(m, c) {
      const nome = limparNome(c.nome);
      m.amigos.nome = nome;
      m.eventos.emitir('nomeouFazenda', { nome });
      return { ok: true, dados: { nome } };
    },
    usarConvite(m, c) {
      const A = m.amigos, C = convite(m), codigo = limparCodigo(c.codigo);
      if (!C.ligado) return { ok: false, motivo: 'convite-desligado' };
      if (!codigo) return { ok: false, motivo: 'convite-invalido' };
      if (codigo === A.codigo) return { ok: false, motivo: 'convite-proprio' };
      if (A.convidadoPor) return { ok: false, motivo: 'convite-ja-usado' };
      if (!fazendaNova(m)) return { ok: false, motivo: 'convite-so-no-comeco' };
      A.convidadoPor = codigo;
      A.presente = temPremio(resolver(m, C.convidado)) ? 'espera' : 'recebido';
      m.eventos.emitir('conviteAceito', { codigo });
      return { ok: true, dados: { codigo } };
    },
    receberConvite(m) {
      const A = m.amigos;
      if (A.presente !== 'espera') return { ok: false, motivo: 'sem-presente' };
      const premio = resolver(m, convite(m).convidado);
      A.presente = 'recebido';
      entregar(m, premio, 'convite');
      const d = { classe: 'convite', id: 'convidado', n: 1, recompensa: premio };
      m.eventos.emitir('resgatou', d);
      m.eventos.emitir('recompensa', { ...d, classe: 'convidado' });
      return { ok: true, dados: d };
    },
    amigoChegou(m, c) {
      const A = m.amigos, C = convite(m), codigo = limparCodigo(c.codigo);
      if (!C.ligado) return { ok: false, motivo: 'convite-desligado' };
      if (!codigo || codigo === A.codigo) return { ok: false, motivo: 'convite-invalido' };
      if (A.chegaram.includes(codigo)) return { ok: false, motivo: 'amigo-repetido' };
      if (A.chegaram.length >= C.limite) return { ok: false, motivo: 'convite-limite', dados: { limite: C.limite } };
      A.chegaram.push(codigo);
      A.aReceber++;
      m.eventos.emitir('amigoChegou', { codigo, n: A.chegaram.length });
      return { ok: true, dados: { codigo, n: A.chegaram.length } };
    },
    receberDeAmigo(m) {
      const A = m.amigos;
      if (!(A.aReceber > 0)) return { ok: false, motivo: 'sem-presente' };
      const premio = resolver(m, convite(m).porAmigo);
      A.aReceber--; A.recebidos++;
      entregar(m, premio, 'convite');
      const d = { classe: 'convite', id: 'amigo', n: 1, recompensa: premio, restam: A.aReceber };
      m.eventos.emitir('resgatou', d);
      m.eventos.emitir('recompensa', { ...d, classe: 'amigo' });
      return { ok: true, dados: d };
    },
    compartilhar(m, c) {
      const A = m.amigos, S = progressoDe(m.dados).compartilhar, dia = diaDoMundo(m), modo = c.modo === 'foto' ? 'foto' : 'convite';
      if (A.compartilhouDia !== dia) { A.compartilhouDia = dia; A.compartilhouN = 0; }
      let premio = null;
      if (S.ligado && A.compartilhouN < S.limitePorDia) {
        const r = resolver(m, S.recompensa);
        if (temPremio(r)) { premio = r; A.compartilhouN++; entregar(m, r, 'compartilhar'); }
      }
      m.eventos.emitir('compartilhou', { modo, n: 1, recompensa: premio });
      return { ok: true, dados: { modo, recompensa: premio } };
    },
  },
  salvar(m) { const A = m.amigos; return { ...A, chegaram: [...A.chegaram] }; },
  carregar(m, d) {
    const A = m.amigos, C = convite(m);
    A.codigo = limparCodigo(d.codigo) || A.codigo;
    A.nome = limparNome(d.nome);
    A.convidadoPor = limparCodigo(d.convidadoPor) || null;
    A.presente = A.convidadoPor && d.presente === 'espera' ? 'espera' : A.convidadoPor ? 'recebido' : 'nao';
    A.chegaram = Array.isArray(d.chegaram) ? [...new Set(d.chegaram.map(limparCodigo).filter(Boolean))].slice(0, C.limite) : [];
    A.aReceber = d.aReceber > 0 ? Math.min(Math.floor(d.aReceber), A.chegaram.length) : 0;
    A.recebidos = d.recebidos > 0 ? Math.floor(d.recebidos) : 0;
    A.compartilhouDia = Number.isFinite(d.compartilhouDia) ? d.compartilhouDia : null;
    A.compartilhouN = d.compartilhouN > 0 ? Math.floor(d.compartilhouN) : 0;
  },
});
