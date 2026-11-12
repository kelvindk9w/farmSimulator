// Personagem do conjunto "codigo": o avatar articulado de tools/visual-refs (esqueleto de 17 ossos, uma malha),
// com as poses de lá (parado, andar, correr, regar, carregar) e as que faltavam (plantar, colher o milho, girar a
// manivela, ordenhar, pegar o ovo, colher a laranja). A fase da passada e o tempo de cada ação vêm da lógica;
// aqui só se decide a pose. As mãos vão até os pontos de mão do objeto (manivela, úbere, ovo, fruta) por
// cinemática inversa de dois ossos, e os objetos de mão (regador, caixote, banquinho...) são malhas próprias.
import { Visual } from '../registro.js';
import { ESCALA_PERSONAGEM } from '../../jogo/contrato.js';
import { THREE, C, mix, shade, estilo, construtor, materialProprio, sombra, Borrifo, TAU, GRAUS, limitar, suave, rampa, janela, amortecer, acaso } from './base.js';
import { criarAvatar, OUTFITS, BONES, BONE_INDEX } from '../../../../../tools/visual-refs/src/avatar/rig.js';
import { POSES, lerpPose, cenarioPose } from '../../../../../tools/visual-refs/src/avatar/poses.js';
import { caixote } from '../../../../../tools/visual-refs/src/models/buildings.js';
import { latao } from '../../../../../tools/visual-refs/src/models/props.js';

// O visual é o da "Ana" de tools/visual-refs, trocando o chapéu de palha por um lenço: vista de cima pela câmera
// isométrica, a aba larga do chapéu tapava os braços e as mãos sempre que ela se inclinava para trabalhar.
const VISUAL = { ...OUTFITS.ana, hat: 'lenco', hatColor: 'clothRed' };
const ASSENTO = 0.27; // altura do banquinho (unidades do avatar)
const PALMA = new THREE.Vector3(0, -0.05, 0.012); // da munheca até o meio da palma

// ---------------- poses ----------------
// Uma pose é { osso: [rx, ry, rz] em graus, lift, sentado (0..1), avanca (desloca o corpo para a frente) }.
// Convenção do avatar: olha para +Z; +X é o lado ESQUERDO dele; rx negativo leva braço/perna para a frente;
// joelho dobra com rx positivo e cotovelo com rx negativo; tronco e cabeça inclinam para a frente com rx positivo.
function pose(mud = {}) {
  const p = {
    root: [0, 0, 0], hips: [0, 0, 0], spine: [0, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0], head: [0, 0, 0], lift: 0, sentado: 0, avanca: 0,
    upperArmL: [0, 0, 7], upperArmR: [0, 0, -7], lowerArmL: [-10, 0, 0], lowerArmR: [-10, 0, 0], handL: [0, 0, 0], handR: [0, 0, 0],
    upperLegL: [0, 0, 2], upperLegR: [0, 0, -2], lowerLegL: [0, 0, 0], lowerLegR: [0, 0, 0], footL: [0, 0, 0], footR: [0, 0, 0],
  };
  return Object.assign(p, mud);
}
const limpa = (p) => { delete p.props; delete p.ground; delete p.seat; return p; };
const misturar = (a, b, t) => (t <= 0 ? a : t >= 1 ? b : lerpPose(a, b, t));
// interpola uma lista [[t, pose], ...] com arrancada e chegada suaves
function chaves(t, lista) {
  if (t <= lista[0][0]) return lista[0][1];
  for (let i = 1; i < lista.length; i++) if (t <= lista[i][0]) return lerpPose(lista[i - 1][1], lista[i][1], suave((t - lista[i - 1][0]) / (lista[i][0] - lista[i - 1][0])));
  return lista[lista.length - 1][1];
}

const EM_PE = pose();
function poseParado(tempo) {
  const p = limpa(POSES.parado((tempo / 2.6) % 1));
  const olha = Math.sin(tempo * 0.5) * 0.6 + Math.sin(tempo * 0.23 + 1) * 0.4;
  p.head[1] += 9 * olha; p.chest[1] += 3 * olha; p.hips[2] += 1.2 * Math.sin(tempo * 0.4); p.spine[2] -= 1.2 * Math.sin(tempo * 0.4);
  p.sentado = 0; p.avanca = 0;
  return p;
}
// As passadas de tools/visual-refs balançam as pernas em senoide: o pé de apoio anda para trás mais depressa no meio
// do apoio do que nas pontas e por isso escorrega no chão. Aqui a fase é entortada para o pé de apoio recuar quase
// em linha reta (FIRMEZA 1 = reta perfeita, mas a troca de perna fica seca; 0 = senoide original).
const FIRMEZA = 0.8;
function passoFirme(f) {
  const u = (((f - 0.25) % 1) + 1) % 1, f1 = u + 0.25;
  const g = u < 0.5 ? 0.5 - Math.asin(1 - 4 * u) / TAU : 1 + Math.asin(4 * u - 3) / TAU;
  return (f1 + FIRMEZA * (g - f1)) % 1;
}
const BRACOS_DE_CAIXA = { upperArmL: [-38, 0, 2], upperArmR: [-38, 0, -2], lowerArmL: [-64, 0, -30], lowerArmR: [-64, 0, 30] };

// plantar: mão no saco de sementes, arma o braço e lança em arco sobre o canteiro
const PLANTAR = {
  saco: pose({ hips: [0, 6, 0], chest: [4, 16, 0], head: [10, 14, 0], upperLegL: [-8, 0, 4], lowerLegL: [12, 0, 0], upperLegR: [6, 0, -4], lowerLegR: [6, 0, 0], upperArmL: [-22, 0, 10], lowerArmL: [-72, 0, -26], upperArmR: [-32, 0, 26], lowerArmR: [-84, 0, 24] }),
  arma: pose({ hips: [-2, -10, 0], spine: [-3, -6, 0], chest: [-4, -20, 0], head: [10, 22, 0], upperLegL: [-14, 0, 4], lowerLegL: [18, 0, 0], upperLegR: [10, 0, -4], lowerLegR: [14, 0, 0], footR: [-8, 0, 0], upperArmL: [-22, 0, 10], lowerArmL: [-72, 0, -26], upperArmR: [34, 0, -24], lowerArmR: [-58, 0, 0] }),
  lanca: pose({ hips: [10, 10, 0], spine: [8, 6, 0], chest: [10, 22, 0], head: [8, -14, 0], upperLegL: [-30, 0, 4], lowerLegL: [34, 0, 0], footL: [-4, 0, 0], upperLegR: [16, 0, -4], lowerLegR: [14, 0, 0], footR: [-24, 0, 0], upperArmL: [-22, 0, 10], lowerArmL: [-72, 0, -26], upperArmR: [-84, 0, 6], lowerArmR: [-10, 0, 0] }),
  segue: pose({ hips: [8, 14, 0], spine: [6, 8, 0], chest: [8, 30, 0], head: [10, -18, 0], upperLegL: [-26, 0, 4], lowerLegL: [30, 0, 0], footL: [-4, 0, 0], upperLegR: [14, 0, -4], lowerLegR: [12, 0, 0], footR: [-20, 0, 0], upperArmL: [-22, 0, 10], lowerArmL: [-72, 0, -26], upperArmR: [-46, 0, 36], lowerArmR: [-34, 0, 0] }),
  fim: pose({ chest: [2, 6, 0], head: [8, 0, 0], upperArmL: [-22, 0, 10], lowerArmL: [-72, 0, -26], upperArmR: [-10, 0, -6], lowerArmR: [-24, 0, 0] }),
};
function posePlantar(t) { return chaves(t, [[0, EM_PE], [0.3, PLANTAR.saco], [0.52, PLANTAR.arma], [0.8, PLANTAR.lanca], [1.05, PLANTAR.segue], [1.32, PLANTAR.fim], [1.6, EM_PE]]); }

// colher o milho: alcança a espiga, firma, puxa para baixo e levanta a espiga no alto
const COLHER = {
  alcanca: pose({ hips: [20, -4, 0], spine: [14, 0, 0], chest: [8, -8, 0], head: [-16, 6, 0], upperLegL: [-32, 0, 4], lowerLegL: [38, 0, 0], footL: [-6, 0, 0], upperLegR: [8, 0, -4], lowerLegR: [18, 0, 0], footR: [-24, 0, 0], upperArmR: [-82, 0, -4], lowerArmR: [-14, 0, 0], upperArmL: [-58, 0, 6], lowerArmL: [-36, 0, 0] }),
  puxa: pose({ hips: [26, -6, 0], spine: [18, 0, 0], chest: [10, -12, 0], head: [-10, 8, 0], upperLegL: [-44, 0, 4], lowerLegL: [62, 0, 0], footL: [-16, 0, 0], upperLegR: [4, 0, -4], lowerLegR: [34, 0, 0], footR: [-34, 0, 0], upperArmR: [-58, 0, -4], lowerArmR: [-40, 0, 0], upperArmL: [-40, 0, 8], lowerArmL: [-50, 0, 0], lift: 0 }),
  mostra: pose({ hips: [-5, 0, 0], spine: [-4, 0, 0], chest: [-4, 8, 0], head: [-20, -14, 0], upperLegL: [-6, 0, 4], lowerLegL: [8, 0, 0], upperLegR: [4, 0, -4], lowerLegR: [4, 0, 0], footL: [16, 0, 0], footR: [16, 0, 0], upperArmR: [-158, 0, -16], lowerArmR: [-18, 0, 0], upperArmL: [14, 0, 40], lowerArmL: [-98, 0, -46] }),
  mostra2: pose({ hips: [-2, 0, 0], spine: [-2, 0, 0], chest: [-2, 6, 0], head: [-16, -12, 0], upperLegL: [-8, 0, 4], lowerLegL: [14, 0, 0], upperLegR: [2, 0, -4], lowerLegR: [10, 0, 0], upperArmR: [-146, 0, -18], lowerArmR: [-30, 0, 0], upperArmL: [14, 0, 40], lowerArmL: [-98, 0, -46] }),
};
function poseColher(t) { return chaves(t, [[0, EM_PE], [0.42, COLHER.alcanca], [0.6, COLHER.alcanca], [0.95, COLHER.puxa], [1.17, COLHER.mostra], [1.4, COLHER.mostra2], [1.7, EM_PE]]); }

// girar a manivela: pernas afastadas, corpo que vai e volta com a volta da manivela
const MANIVELA = pose({ hips: [6, 0, 0], spine: [5, 0, 0], chest: [4, 0, 0], head: [-8, 0, 0], upperLegL: [-18, 0, 5], lowerLegL: [22, 0, 0], footL: [-4, 0, 0], upperLegR: [10, 0, -5], lowerLegR: [14, 0, 0], footR: [-18, 0, 0], upperArmL: [-62, 0, 2], lowerArmL: [-42, 0, 0], upperArmR: [-62, 0, -2], lowerArmR: [-42, 0, 0] });
function poseManivela(t, d, dur) {
  const w = janela(t, 0, dur, 0.28, 0.3), a = d.angulo || 0, m = d.maos || 0;
  if (w <= 0) return EM_PE;
  const p = Object.assign({}, misturar(EM_PE, MANIVELA, w));
  const vai = Math.sin(a - 0.55) * m, sobe = Math.cos(a - 0.4) * m; // o corpo acompanha a mão com um pouco de atraso
  // depois de girar, segura a manivela e olha a água cair no regador, que está à esquerda dele
  const v = janela(t, 1.62, 2.5, 0.24, 0.24);
  p.hips = [p.hips[0] + 4 * vai, 5 * v, 0]; p.spine = [p.spine[0] + 4 * vai, 0, 0]; p.chest = [p.chest[0] + 3 * vai - 2 * sobe, 10 * v, 0]; p.head = [p.head[0] - 7 * vai + 4 * v, 30 * v, 0];
  p.upperLegL = [p.upperLegL[0] - 3 * vai, 0, 5]; p.lowerLegL = [p.lowerLegL[0] + 6 * vai - 5 * sobe, 0, 0];
  return p;
}

// ordenhar: sentado no banquinho, inclinado para a vaca, mãos alternando
const SENTADO = pose({ sentado: 1, hips: [6, 0, 0], spine: [18, 0, 0], chest: [12, 0, 0], head: [-8, 0, 0], upperLegL: [-82, 0, 20], upperLegR: [-82, 0, -20], lowerLegL: [80, 0, 0], lowerLegR: [80, 0, 0], footL: [2, 0, 0], footR: [2, 0, 0], upperArmL: [-58, 0, 6], upperArmR: [-58, 0, -6], lowerArmL: [-34, 0, 0], lowerArmR: [-34, 0, 0] });
const MEIO_SENTADO = pose({ sentado: 0.3, hips: [26, 0, 0], spine: [10, 0, 0], chest: [4, 0, 0], head: [-14, 0, 0], upperLegL: [-64, 0, 12], upperLegR: [-64, 0, -12], lowerLegL: [88, 0, 0], lowerLegR: [88, 0, 0], footL: [-20, 0, 0], footR: [-20, 0, 0], upperArmL: [-20, 0, 12], upperArmR: [-20, 0, -12], lowerArmL: [-30, 0, 0], lowerArmR: [-30, 0, 0] });
const COM_BALDE = pose({ chest: [0, -8, 0], head: [6, -14, 0], upperArmR: [-14, 0, -12], lowerArmR: [-26, 0, 0], upperArmL: [0, 0, 8] });
function poseOrdenhar(t, efeito, dur) {
  const p = chaves(t, [[0, EM_PE], [0.24, MEIO_SENTADO], [0.5, SENTADO], [efeito - 0.02, SENTADO], [efeito + 0.2, MEIO_SENTADO], [dur - 0.06, COM_BALDE], [dur, COM_BALDE]]);
  if (t > 0.5 && t < efeito) { // balança de leve no ritmo das mãos
    const s = Math.sin((t - 0.5) * TAU * 2.6);
    return Object.assign({}, p, { chest: [12 + 1.5 * s, 3 * s, 0], head: [-8 - 2 * s, -4 * s, 0], spine: [18, 2 * s, 0] });
  }
  return p;
}

// pegar o ovo: ajoelha num joelho só, estica o braço até o ninho e levanta olhando o ovo
const OVO = {
  desce: pose({ avanca: 0.1, hips: [16, 0, 0], spine: [24, 0, 0], chest: [16, -6, 0], head: [-22, 0, 0], upperLegL: [-112, 0, 8], lowerLegL: [112, 0, 0], footL: [-16, 0, 0], upperLegR: [12, 0, -4], lowerLegR: [62, 0, 0], footR: [58, 0, 0], upperArmR: [-78, 0, -4], lowerArmR: [-12, 0, 0], upperArmL: [-46, 0, 10], lowerArmL: [-46, 0, -10] }),
  olha: pose({ hips: [0, 0, 0], chest: [0, -6, 0], head: [14, -12, 0], upperLegL: [-6, 0, 3], lowerLegL: [8, 0, 0], upperArmR: [-52, 0, 8], lowerArmR: [-98, 0, 0], upperArmL: [-6, 0, 12], lowerArmL: [-20, 0, 0] }),
  olha2: pose({ hips: [0, 0, 0], chest: [-2, -6, 0], head: [10, -12, 0], lift: 0, footL: [10, 0, 0], footR: [10, 0, 0], upperArmR: [-60, 0, 8], lowerArmR: [-100, 0, 0], upperArmL: [-6, 0, 14], lowerArmL: [-24, 0, 0] }),
};
function poseOvo(t) { return chaves(t, [[0, EM_PE], [0.46, OVO.desce], [0.8, OVO.desce], [1.06, OVO.olha2], [1.2, OVO.olha], [1.4, EM_PE]]); }

// colher a laranja: de frente para a câmera, estica o braço direito para cima e para o lado (a cabeça grande do
// boneco esconderia a mão se ela subisse reta), na ponta dos pés; puxa duas vezes, a fruta solta e ele a joga para o alto
const FRUTA = {
  prepara: pose({ hips: [4, 0, 0], spine: [2, 0, 0], chest: [0, -10, 0], head: [-20, -24, 0], upperLegL: [-20, 0, 3], upperLegR: [-20, 0, -3], lowerLegL: [36, 0, 0], lowerLegR: [36, 0, 0], footL: [-14, 0, 0], footR: [-14, 0, 0], upperArmR: [-20, 0, -40], lowerArmR: [-70, 0, 0], upperArmL: [8, 0, 16], lowerArmL: [-24, 0, 0] }),
  estica: pose({ hips: [-2, 0, -3], spine: [-3, 0, -4], chest: [-4, -8, -7], head: [-20, -26, 8], upperLegL: [2, 0, 3], upperLegR: [2, 0, -3], lowerLegL: [2, 0, 0], lowerLegR: [2, 0, 0], footL: [40, 0, 0], footR: [40, 0, 0], upperArmR: [-10, 0, -150], lowerArmR: [-12, 0, 0], upperArmL: [10, 0, 34], lowerArmL: [-22, 0, 0] }),
  puxa: pose({ hips: [6, 0, 2], spine: [4, 0, 3], chest: [2, -8, 5], head: [-20, -26, 4], upperLegL: [-30, 0, 4], upperLegR: [-30, 0, -4], lowerLegL: [56, 0, 0], lowerLegR: [56, 0, 0], footL: [-24, 0, 0], footR: [-24, 0, 0], upperArmR: [-10, 0, -125], lowerArmR: [-45, 0, 0], upperArmL: [-10, 0, 26], lowerArmL: [-40, 0, 0] }),
  recua: pose({ hips: [-6, 0, 0], spine: [-4, 0, 0], chest: [-2, 0, 0], head: [6, -6, 0], upperLegL: [-16, 0, 4], upperLegR: [10, 0, -4], lowerLegL: [34, 0, 0], lowerLegR: [22, 0, 0], footL: [-14, 0, 0], footR: [-26, 0, 0], upperArmR: [-58, 0, 4], lowerArmR: [-86, 0, 0], upperArmL: [-26, 0, 48], lowerArmL: [-30, 0, 0] }),
  joga: pose({ head: [-16, -4, 0], chest: [-3, 0, 0], footL: [14, 0, 0], footR: [14, 0, 0], upperArmR: [-78, 0, 2], lowerArmR: [-58, 0, 0], upperArmL: [-4, 0, 16], lowerArmL: [-22, 0, 0] }),
  pega: pose({ hips: [2, 0, 0], head: [10, -6, 0], upperLegL: [-8, 0, 3], upperLegR: [-8, 0, -3], lowerLegL: [14, 0, 0], lowerLegR: [14, 0, 0], footL: [-6, 0, 0], footR: [-6, 0, 0], upperArmR: [-46, 0, 4], lowerArmR: [-80, 0, 0], upperArmL: [-4, 0, 12], lowerArmL: [-20, 0, 0] }),
};
const puxaoDaFruta = (t) => 0.45 * janela(t, 0.8, 1.02, 0.1, 0.1) + janela(t, 1.04, 1.34, 0.2, 0.02); // o mesmo ritmo que a árvore usa
function poseFruta(t) {
  if (t < 0.76) return chaves(t, [[0, EM_PE], [0.24, FRUTA.prepara], [0.7, FRUTA.estica], [0.76, FRUTA.estica]]);
  if (t < 1.3) return lerpPose(FRUTA.estica, FRUTA.puxa, puxaoDaFruta(t));
  return chaves(t, [[1.3, FRUTA.puxa], [1.5, FRUTA.recua], [1.68, FRUTA.joga], [1.92, FRUTA.pega], [2.2, EM_PE]]);
}

// ---------------- aplicar a pose e alcançar com as mãos ----------------
const _m = new THREE.Matrix4(), _inv = new THREE.Matrix4(), _c = new THREE.Vector3();
const _S = new THREE.Vector3(), _E = new THREE.Vector3(), _H = new THREE.Vector3(), _T = new THREE.Vector3(), _P = new THREE.Vector3(), _D = new THREE.Vector3(), _O = new THREE.Vector3();
const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _a = new THREE.Vector3(), _b = new THREE.Vector3();

function aplicar(av, p) {
  for (const [nome] of BONES) { const r = p[nome] || [0, 0, 0]; av.bones[BONE_INDEX[nome]].rotation.set(r[0] * GRAUS, r[1] * GRAUS, r[2] * GRAUS, 'XYZ'); }
  av.root.position.set(0, 0, p.avanca || 0);
  av.group.updateMatrixWorld(true);
  // apoia no chão: o ponto mais baixo das caixas de cada osso; sentado, só o quadril e as coxas contam
  _inv.copy(av.group.matrixWorld).invert();
  let pe = Infinity, banco = Infinity;
  for (const nome in av.probes) {
    const cx = av.probes[nome], senta = nome === 'hips' || nome.startsWith('upperLeg');
    _m.multiplyMatrices(_inv, av.bones[BONE_INDEX[nome]].matrixWorld);
    for (let i = 0; i < 8; i++) {
      _c.set(i & 1 ? cx.max.x : cx.min.x, i & 2 ? cx.max.y : cx.min.y, i & 4 ? cx.max.z : cx.min.z).applyMatrix4(_m);
      if (_c.y < pe) pe = _c.y;
      if (senta && _c.y < banco) banco = _c.y;
    }
  }
  const s = p.sentado || 0;
  av.root.position.y = -pe * (1 - s) + (-banco + ASSENTO) * s + (p.lift || 0);
  av.group.updateMatrixWorld(true);
}

// gira o osso para que o ponto "de" (no mundo) vá parar na direção do ponto "para"
function mirar(osso, de, para) {
  _O.setFromMatrixPosition(osso.matrixWorld);
  _a.copy(de).sub(_O).normalize(); _b.copy(para).sub(_O).normalize();
  _qa.setFromUnitVectors(_a, _b);
  osso.parent.getWorldQuaternion(_qb);
  // local' = pai^-1 * giro * pai * local
  osso.quaternion.premultiply(_qb).premultiply(_qa).premultiply(_qb.invert());
  osso.updateMatrixWorld(true);
}
// Cinemática inversa de dois ossos: leva a palma da mão até "alvo" (no mundo). peso 0..1 mistura com a pose.
function alcancar(av, lado, alvo, peso) {
  if (peso <= 0.002) return;
  const cima = av.bones[BONE_INDEX['upperArm' + lado]], baixo = av.bones[BONE_INDEX['lowerArm' + lado]], mao = av.bones[BONE_INDEX['hand' + lado]];
  _S.setFromMatrixPosition(cima.matrixWorld); _E.setFromMatrixPosition(baixo.matrixWorld); _H.copy(PALMA).applyMatrix4(mao.matrixWorld);
  const l1 = _S.distanceTo(_E), l2 = _E.distanceTo(_H);
  _T.copy(_H).lerp(alvo, peso);
  _D.copy(_T).sub(_S);
  const d = limitar(_D.length(), Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
  _D.normalize();
  // o cotovelo fica do lado em que a pose o deixou
  _P.copy(_E).sub(_S); _P.addScaledVector(_D, -_P.dot(_D));
  if (_P.lengthSq() < 1e-8) _P.set(0, -1, 0).addScaledVector(_D, _D.y); // braço esticado: cotovelo para baixo
  _P.normalize();
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  _P.multiplyScalar(h).addScaledVector(_D, a).add(_S); // novo cotovelo
  _T.copy(_S).addScaledVector(_D, d); // alvo ao alcance
  mirar(cima, _E, _P);
  _H.copy(PALMA).applyMatrix4(mao.matrixWorld);
  mirar(baixo, _H, _T);
}

// ---------------- objetos de mão ----------------
function fazerObjetos(material) {
  const E = estilo();
  const feito = (desenhar, semente = 11) => { const b = construtor(semente); desenhar(b); const m = new THREE.Mesh(b.build(), material); if (E && E.aoCriar) E.aoCriar(m); return m; };
  const emprestado = (tipo) => { const m = cenarioPose(tipo); m.material = material; return m; };
  const caixa = (recheio) => feito((b) => {
    if (recheio === 'laranja' || recheio === 'milho') { caixote(b, { p: [0, -0.16, 0], s: 0.9 }, recheio); return; }
    caixote(b, { p: [0, -0.16, 0], s: 0.9 }, null);
    b.group({ p: [0, -0.16, 0], s: 0.9 }, () => {
      if (recheio === 'ovo') { b.box(0.52, 0.1, 0.34, C.hay, { p: [0, 0.12, 0], jit: 0.06 }); for (let i = 0; i < 3; i++) b.sph(0.07, 7, 5, '#fff6e4', { p: [-0.16 + i * 0.16, 0.26, (i % 2 ? -0.05 : 0.05)], s: [1, 1.25, 1], smooth: true }); }
      else for (const x of [-0.13, 0.13]) latao(b, { p: [x, 0.04, 0], s: 0.62 });
    });
  });
  const o = {
    regador: emprestado('regador'), banquinho: emprestado('banquinho'), espiga: emprestado('espiga'),
    caixaMilho: caixa('milho'), caixaLeite: caixa('leite'), caixaOvo: caixa('ovo'), caixaLaranja: caixa('laranja'),
    saco: feito((b) => { // saquinho de sementes; origem na boca
      b.blob(0.105, 1, C.sack, { p: [0, -0.1, 0], s: [1, 1.15, 0.85], jit: 0.05, grad: mix(C.sack, C.white, 0.3), rough: 0.1 });
      b.cyl(0.075, 0.062, 0.05, 7, C.sackDark, { p: [0, -0.02, 0], open: true });
      b.cyl(0.066, 0.066, 0.012, 7, C.cornEar, { p: [0, 0.012, 0] });
      b.box(0.1, 0.07, 0.01, C.cornLeaf, { p: [0, -0.14, 0.09] });
    }),
    balde: feito((b) => { // balde de leite; origem no fundo
      b.cyl(0.19, 0.145, 0.25, 9, C.metal, { grad: C.metalLight, open: true });
      b.cyl(0.18, 0.137, 0.25, 9, C.metalDark, { s: [-1, 1, 1], open: true });
      b.cyl(0.145, 0.145, 0.012, 9, C.metalDark, {});
      b.cyl(0.196, 0.19, 0.03, 9, C.metalDark, { p: [0, 0.22, 0], open: true });
      b.tube([[-0.19, 0.24, 0], [-0.14, 0.33, 0.02], [0, 0.37, 0.03], [0.14, 0.33, 0.02], [0.19, 0.24, 0]], 0.012, 4, C.metalDark, {});
    }),
    leite: feito((b) => b.cyl(1, 1, 0.01, 9, '#ffffff', {})), // a superfície do leite dentro do balde
    ovo: feito((b) => b.sph(0.07, 8, 6, '#fff6e4', { s: [1, 1.28, 1], smooth: true, grad: '#ffffff' })),
    laranja: feito((b) => { b.ico(0.104, 1, C.orange, { smooth: true, grad: mix(C.orange, '#ffd27a', 0.5) }); b.leaf(0.12, 0.07, 40, C.orangeLeafLight, { p: [0, 0.09, 0], r: [70, 40, 0], steps: 2 }); }),
  };
  if (E && E.objetosDeMao) for (const n in E.objetosDeMao) if (o[n]) o[n] = feito(E.objetosDeMao[n]); // outro conjunto veste os mesmos objetos
  return o;
}
const CAIXA_DO_ITEM = { milho: 'caixaMilho', leite: 'caixaLeite', ovo: 'caixaOvo', laranja: 'caixaLaranja' };

// ---------------- o visual ----------------
export function personagem() {
  const v = new Visual('personagem');
  const E = estilo();
  const av = E && E.avatar ? E.avatar() : criarAvatar(VISUAL);
  av.mesh.material.userData.proprio = true;
  av.group.scale.setScalar(ESCALA_PERSONAGEM);
  const matObj = materialProprio();
  const obj = fazerObjetos(matObj), esc = {};
  for (const n in obj) { obj[n].visible = false; av.group.add(obj[n]); esc[n] = 0; }
  const mancha = sombra(0.44, 0.36);
  v.raiz.add(av.group, mancha);
  const gotas = new Borrifo(30, C.water, 0.03, { g: 9, vida: 0.7, chao: 0.2 });
  const sementes = new Borrifo(10, C.cornEar, 0.034, { g: 13, vida: 0.75, chao: 0.21 });
  const leite = new Borrifo(8, '#ffffff', 0.022, { g: 8, vida: 0.2 });
  v.raiz.add(gotas.mesh, sementes.mesh, leite.mesh);

  const osso = (n) => av.bones[BONE_INDEX[n]];
  const palma = { D: new THREE.Vector3(), E: new THREE.Vector3() }; // no mundo
  const alvoMao = { D: new THREE.Vector3(), E: new THREE.Vector3() }, peso = { D: 0, E: 0 };
  const guardado = { D: new THREE.Vector3(), E: new THREE.Vector3(), tem: false };
  const paraGrupo = (w, out) => av.group.worldToLocal(out.copy(w));
  const _t1 = new THREE.Vector3(), _t2 = new THREE.Vector3(), _t3 = new THREE.Vector3(), frente = new THREE.Vector3(), direita = new THREE.Vector3();
  let mostrada = EM_PE, de = EM_PE, mistura = 1, durMistura = 0.15, tAntes = 0, restoGota = 0, puxao = -1, escuro = 1;
  const lerPalmas = () => { av.group.updateMatrixWorld(true); palma.D.copy(PALMA).applyMatrix4(osso('handR').matrixWorld); palma.E.copy(PALMA).applyMatrix4(osso('handL').matrixWorld); };
  // põe um objeto de mão num ponto do mundo (ou na palma), com giro próprio no espaço do avatar
  const por = (n, mundo, rx = 0, ry = 0, rz = 0) => { paraGrupo(mundo, obj[n].position); obj[n].rotation.set(rx, ry, rz); };

  v.atualizar = (dt) => {
    v.tempo += dt;
    const d = v.dados, e = v.estado, t = d.t || 0, A = d.alvoPontos || null;
    v.raiz.visible = d.visivel !== false && e !== 'dentro';
    if (!v.raiz.visible) { for (const n in esc) { esc[n] = 0; obj[n].visible = false; } gotas.limpar(); return; }
    v.raiz.updateMatrixWorld(true);
    frente.set(0, 0, 1).transformDirection(v.raiz.matrixWorld); direita.set(-1, 0, 0).transformDirection(v.raiz.matrixWorld);

    // 1) a pose do estado
    let P; const quer = {}; peso.D = 0; peso.E = 0;
    const andando = e === 'andar' || e === 'correr';
    if (andando) {
      const f = passoFirme(d.fase || 0), vel = d.vel || 0;
      if (d.carregando) P = misturar(Object.assign(poseParado(v.tempo), BRACOS_DE_CAIXA), limpa(POSES.carregar(f)), limitar(vel / 0.7));
      else {
        const anda = limpa(POSES.andar(f)), corre = e === 'correr' ? rampa(vel, 2.2, 3.0) : 0;
        P = misturar(poseParado(v.tempo), corre > 0 ? misturar(anda, limpa(POSES.correr(f)), corre) : anda, limitar(vel / 0.8));
      }
    } else if (e === 'plantar') P = posePlantar(t);
    else if (e === 'regar') {
      const k = janela(t, 0.25, 1.55, 0.32, 0.3);
      P = misturar(EM_PE, limpa(POSES.regar(Math.asin(2 * k - 1) / TAU)), janela(t, 0, d.dur, 0.3, 0.32));
      const varre = 9 * Math.sin(((t - 0.45) * TAU) / 1.0) * k;
      P = Object.assign({}, P, { chest: [P.chest[0], P.chest[1] + varre, 0], hips: [P.hips[0], P.hips[1] + varre * 0.3, 0] });
    } else if (e === 'colher') P = poseColher(t);
    else if (e === 'girarManivela') P = poseManivela(t, d, d.dur);
    else if (e === 'ordenhar') P = poseOrdenhar(t, d.efeito, d.dur);
    else if (e === 'pegarOvo') P = poseOvo(t);
    else if (e === 'colherFruta') P = poseFruta(t);
    else P = d.carregando ? Object.assign(poseParado(v.tempo), BRACOS_DE_CAIXA) : poseParado(v.tempo);

    // 2) passa de um estado para o outro sem tranco
    if (v.primeira) { mistura = 1; } else if (v.trocou) { de = mostrada; mistura = 0; durMistura = andando ? 0.12 : e === 'parado' ? 0.22 : 0.16; }
    if (mistura < 1) { mistura = Math.min(1, mistura + dt / durMistura); P = misturar(de, P, suave(mistura)); }
    mostrada = P;
    aplicar(av, P);
    lerPalmas();

    // 3) mãos nos pontos do objeto
    if (v.trocou) guardado.tem = false;
    if (e === 'plantar') { peso.D = janela(t, 0.1, 0.44, 0.16, 0.1); alvoMao.D.copy(palma.E).addScaledVector(frente, 0.02); alvoMao.D.y += 0.06; }
    else if (e === 'colher' && A) {
      if (!d.feito) { guardado.D.copy(A.espiga); guardado.tem = true; }
      peso.D = rampa(t, 0.14, 0.42) * (1 - rampa(t, 0.95, 1.1)); alvoMao.D.copy(guardado.tem ? guardado.D : A.espiga);
    } else if (e === 'girarManivela' && A) {
      // as duas mãos na manivela; o regador pula da mão para a borda do poço e, no fim, de volta
      peso.D = peso.E = janela(t, 0.08, 2.5, 0.24, 0.24);
      alvoMao.D.copy(A.manivela).addScaledVector(direita, 0.07); alvoMao.E.copy(A.manivela).addScaledVector(direita, -0.07);
      const vai = rampa(t, 0.04, 0.36) * (1 - rampa(t, 2.46, 2.76));
      _t1.copy(A.borda); _t1.y += 0.2 * ESCALA_PERSONAGEM; // a origem do regador é a alça
      guardado.E.copy(palma.D).lerp(_t1, vai); guardado.E.y += 0.45 * Math.sin(Math.PI * vai); guardado.tem = true;
    } else if (e === 'ordenhar' && A) {
      const w = rampa(t, 0.3, 0.56) * (1 - rampa(t, d.efeito - 0.06, d.efeito + 0.14)), f = (t - 0.5) * TAU * 2.6;
      // cada mão desce depressa (puxa) e sobe devagar, uma depois da outra
      const curso = (x) => { const u = ((x / TAU) % 1 + 1) % 1; return u < 0.35 ? -suave(u / 0.35) : -1 + suave((u - 0.35) / 0.65); };
      for (const [L, s, fase] of [['D', 1, 0], ['E', -1, Math.PI]]) { alvoMao[L].copy(A.ubere).addScaledVector(direita, s * 0.075); alvoMao[L].y += 0.02 + 0.085 * curso(f + fase) * (t > 0.5 ? 1 : 0); peso[L] = w; }
      const batida = Math.floor(Math.max(0, f) / Math.PI);
      if (w > 0.9 && batida !== puxao && t > 0.56) { // um jato de leite a cada puxão
        puxao = batida; const m = batida % 2 ? alvoMao.E : alvoMao.D;
        for (let k = 0; k < 3; k++) { v.raiz.worldToLocal(_t3.copy(m)); leite.emitir(_t3.x, _t3.y - 0.05 - k * 0.03, _t3.z, 0, -1.6 - k * 0.2, 0, 1, 0.16 + k * 0.02); }
      }
      // depois de ordenhar, a mão direita vai buscar o balde
      const busca = janela(t, d.efeito + 0.02, d.efeito + 0.3, 0.14, 0.1);
      if (busca > 0 && t > d.efeito) { peso.D = busca; alvoMao.D.copy(A.balde); alvoMao.D.y += 0.4; }
    } else if (e === 'pegarOvo' && A) {
      peso.D = rampa(t, 0.2, 0.52) * (1 - rampa(t, 0.8, 0.98)); alvoMao.D.copy(A.ovo); alvoMao.D.y += 0.03;
    } else if (e === 'colherFruta' && A) {
      if (!d.feito) { guardado.D.copy(A.fruta); guardado.tem = true; }
      peso.D = rampa(t, 0.3, 0.72) * (1 - rampa(t, 1.3, 1.44)); alvoMao.D.copy(guardado.tem ? guardado.D : A.fruta); alvoMao.D.y -= 0.03;
    }
    alcancar(av, 'R', alvoMao.D, peso.D); alcancar(av, 'L', alvoMao.E, peso.E);
    lerPalmas();
    v.pontos.maoD.copy(v.raiz.worldToLocal(_t1.copy(palma.D))); v.pontos.maoE.copy(v.raiz.worldToLocal(_t1.copy(palma.E)));

    // 4) objetos de mão: quais aparecem e onde ficam
    const inclina = (P.chest ? P.chest[1] : 0) * 0.5 * GRAUS;
    if (d.carregando && d.item) {
      const n = CAIXA_DO_ITEM[d.item]; quer[n] = 1;
      _t1.copy(palma.D).add(palma.E).multiplyScalar(0.5).addScaledVector(frente, 0.075); _t1.y += 0.05; por(n, _t1, 0, inclina, 0);
    }
    if (e === 'regar') {
      const k = janela(t, 0.25, 1.55, 0.32, 0.3), tomba = (14 + 34 * k) * GRAUS;
      quer.regador = t < d.dur - 0.12 ? 1 : 0; por('regador', palma.D, tomba, -8 * GRAUS, 0);
      if (k > 0.5 && dt > 0) { // a água sai do bico e cai no canteiro
        obj.regador.updateMatrixWorld(true);
        const bico = v.raiz.worldToLocal(obj.regador.localToWorld(_t1.set(0, 0.035, 0.4))), antes = v.raiz.worldToLocal(obj.regador.localToWorld(_t2.set(0, -0.06, 0.26)));
        _t3.copy(bico).sub(antes).normalize();
        restoGota += dt * 38;
        while (restoGota >= 1) { restoGota -= 1; const n = gotas.conta; gotas.emitir(bico.x + (acaso(n) - 0.5) * 0.07, bico.y, bico.z, _t3.x * 1.3 + (acaso(n + 1) - 0.5) * 0.5, _t3.y * 1.3 + 0.2, _t3.z * 1.3 + (acaso(n + 2) - 0.5) * 0.4, 0.8 + acaso(n + 3) * 0.6); }
      }
    } else if (e === 'girarManivela' && guardado.tem) {
      quer.regador = t < d.dur - 0.08 ? 1 : 0; por('regador', guardado.E, 0, -Math.PI * 0.6, 0);
    } else if (e === 'plantar') {
      quer.saco = t < d.dur - 0.16 ? 1 : 0; _t1.copy(palma.E); _t1.y += 0.03; por('saco', _t1);
      for (let i = 0; i < 8; i++) { // as sementes saem da mão no meio do lançamento
        const ti = 0.62 + i * 0.022;
        if (tAntes < ti && t >= ti) { v.raiz.worldToLocal(_t2.copy(palma.D)); sementes.emitir(_t2.x, _t2.y, _t2.z, (i - 3.5) * 0.2 + 0.5, 0.5 + acaso(i) * 0.5, 1.5 + (i % 4) * 0.42, 1, 0.75); }
      }
    } else if (e === 'colher') {
      quer.espiga = d.feito && t < d.dur - 0.16 ? 1 : 0; por('espiga', palma.D, -0.5, 0, 0);
    } else if (e === 'ordenhar' && A) {
      quer.banquinho = t < d.dur - 0.3 ? 1 : 0; obj.banquinho.position.set(0, 0, -0.02); obj.banquinho.rotation.set(0, 0, 0);
      quer.balde = t > 0.12 && t < d.dur - 0.08 ? 1 : 0; quer.leite = quer.balde;
      const leva = rampa(t, d.efeito + 0.12, d.efeito + 0.36); // no fim ele levanta com o balde na mão
      _t1.copy(A.balde); _t2.copy(palma.D); _t2.y -= 0.46; _t1.lerp(_t2, leva); por('balde', _t1);
      const cheio = rampa(t, 0.6, d.efeito); obj.leite.position.copy(obj.balde.position); obj.leite.position.y += 0.03 + 0.15 * cheio; obj.leite.rotation.set(0, 0, 0);
      obj.leite.userData.raio = 0.14 + 0.04 * cheio;
    } else if (e === 'pegarOvo') {
      quer.ovo = d.feito && t < d.dur - 0.14 ? 1 : 0; _t1.copy(palma.D); _t1.y += 0.02; por('ovo', _t1);
    } else if (e === 'colherFruta') {
      quer.laranja = d.feito && t < d.dur - 0.14 ? 1 : 0;
      _t1.copy(palma.D); _t1.y += 0.03 + 0.5 * Math.max(0, Math.sin(Math.PI * limitar((t - 1.62) / 0.34))); // joga para o alto e pega de volta
      por('laranja', _t1, 0, t * 6, 0);
    }
    for (const n in obj) {
      esc[n] = v.primeira ? (quer[n] || 0) : amortecer(esc[n], quer[n] || 0, quer[n] ? 22 : 16, dt);
      obj[n].visible = esc[n] > 0.03;
      const s = Math.max(0.001, esc[n]);
      if (n === 'leite') obj[n].scale.set(s * (obj[n].userData.raio || 0.14), s, s * (obj[n].userData.raio || 0.14)); else obj[n].scale.setScalar(s);
    }
    gotas.passo(dt); sementes.passo(dt); leite.passo(dt);
    tAntes = e === 'plantar' ? t : 0;
    if (e !== 'ordenhar') puxao = -1;

    // 5) sombra no chão e escuro ao entrar no celeiro
    v.raiz.worldToLocal(_t1.setFromMatrixPosition(osso('hips').matrixWorld));
    mancha.position.set(_t1.x * 0.6, 0.03, _t1.z * 0.6);
    let alvoEscuro = 1;
    if (A && A.soleira && A.dentro) { // quanto ele já passou da soleira, a caminho do ponto lá dentro
      _t1.setFromMatrixPosition(v.raiz.matrixWorld).sub(A.soleira); _t2.copy(A.dentro).sub(A.soleira);
      const fundo = _t1.dot(_t2) / _t2.lengthSq(), lado = _t1.addScaledVector(_t2, -fundo).length();
      if (lado < 1.0) alvoEscuro = 1 - 0.6 * limitar((fundo + 0.15) / 0.75);
    }
    escuro = v.primeira ? alvoEscuro : amortecer(escuro, alvoEscuro, 18, dt);
    av.mesh.material.color.setScalar(escuro); matObj.color.setScalar(escuro);
    mancha.visible = escuro > 0.95;
  };
  const descartar = v.descartar.bind(v);
  v.descartar = () => { descartar(); av.skeleton.dispose(); };
  return v;
}
