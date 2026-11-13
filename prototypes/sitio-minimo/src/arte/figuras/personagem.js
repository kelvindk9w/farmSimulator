// Personagem do conjunto "figuras": uma figura 2D desenhada pelo Codex, posta em pé dentro da cena 3D.
// Não há modelo nem esqueleto: é um cartão com a imagem, e a animação é a troca de quadros de um atlas
// (texturas/montar-atlas.mjs). O cartão fica sempre de frente para a câmera, que é fixa; para onde a personagem
// olha decide qual desenho aparece (de frente ou de costas) e se ele vai espelhado.
// O que este visual ainda não mostra está em NOTAS.md: ela não segura nada e não há partículas.
import * as THREE from 'three';
import { Visual } from '../registro.js';
import { sombra } from '../contorno/kit.js';
import ATLAS from './atlas.json';

const RAD = Math.PI / 180, GIRO = 45 * RAD, ELEV = 35.264 * RAD; // os da câmera (src/cena/cena.js)
const ALTURA_NA_TELA = 2.3; // altura da personagem em pé, medida na tela, em unidades de mundo
const K = ALTURA_NA_TELA / ATLAS.emPe; // unidades na tela por ponto do atlas
const [CW, CH] = ATLAS.casa, Q = ATLAS.quadros;
// O cartão fica em pé no mundo, e não deitado no plano da tela: assim ele se esconde atrás das coisas do mesmo jeito
// que um objeto de verdade (a parede que está atrás dela não passa na frente da cabeça). Visto de cima, um cartão em
// pé parece mais baixo; por isso a altura é esticada por 1 / cos(elevação), e na tela a figura sai na proporção do desenho.
const LARGURA = CW * K, ALTURA = (CH * K) / Math.cos(ELEV);
const TRABALHO = new Set(['plantar', 'regar', 'colher', 'pegarOvo', 'ordenhar']);
const PARADA_ABAIXO_DE = 0.45; // unidades por segundo (ela anda a 2,2 e corre a 3,9)

// a textura é baixada na primeira vez que o conjunto é usado, e vale para todas as trocas de arte seguintes
let textura = null;
const carga = { atlas: 'nao' }; // 'nao' | 'carregando' | 'pronto' | 'falhou'
function carregar() {
  if (textura) return textura;
  textura = new THREE.Texture();
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.repeat.set(CW / ATLAS.largura, CH / ATLAS.altura);
  carga.atlas = 'carregando';
  const img = new Image();
  img.onload = () => { textura.image = img; textura.needsUpdate = true; carga.atlas = 'pronto'; };
  img.onerror = () => { carga.atlas = 'falhou'; console.warn('conjunto "figuras": a imagem da personagem não carregou; ela fica invisível'); };
  img.src = './' + ATLAS.arquivo;
  return textura;
}

class PersonagemFigura extends Visual {
  constructor() {
    super('personagem');
    this.carga = carga;
    const geo = new THREE.PlaneGeometry(LARGURA, ALTURA);
    // o ponto de apoio do desenho (entre os pés) fica na origem
    geo.translate((CW / 2 - ATLAS.apoio[0]) * K, ((CH / 2 - ATLAS.apoio[1]) * K) / Math.cos(ELEV), 0);
    const mat = new THREE.MeshBasicMaterial({ map: carregar(), transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    mat.userData.proprio = true;
    this.cartao = new THREE.Mesh(geo, mat);
    this.cartao.renderOrder = 3; // depois das manchas de sombra do chão, que também são transparentes
    this.prumo = new THREE.Group(); // desfaz o giro da raiz: o cartão olha sempre para a câmera
    this.prumo.add(this.cartao);
    this.raiz.add(sombra(0.4, 0.4), this.prumo);
    this.frente = true; this.direita = false; this.quadro = -1;
  }

  atualizar(dt) {
    super.atualizar(dt);
    const d = this.dados, e = this.estado;
    this.raiz.visible = d.visivel !== false && e !== 'dentro';
    if (!this.raiz.visible) return;
    const rumo = this.raiz.rotation.y;
    this.prumo.rotation.y = GIRO - rumo;
    // para onde ela olha, na tela: +X vai para baixo e para a direita, +Z para baixo e para a esquerda.
    // A folga evita que o desenho fique trocando quando o rumo está bem na divisa.
    const fx = Math.sin(rumo), fz = Math.cos(rumo), praCa = fx + fz, praDireita = fx - fz, folga = this.primeira ? 0 : 0.2;
    if (praCa > folga) this.frente = true; else if (praCa < -folga) this.frente = false;
    if (praDireita > folga) this.direita = true; else if (praDireita < -folga) this.direita = false;

    let quadro, deFrente = this.frente, pulo = 0, respiro = 0;
    // Só mostra a passada enquanto ela anda de fato: quando freia para parar, ou espera a porta do celeiro, a lógica
    // ainda diz "andar" com a velocidade quase zero, e o quadro congelado deixava a figura parada de perna aberta.
    if ((e === 'andar' || e === 'correr') && (d.vel === undefined || d.vel > PARADA_ABAIXO_DE)) {
      const f = (((d.fase || 0) % 1) + 1) % 1; // um ciclo do desenho (dois passos) por unidade de fase
      quadro = (deFrente ? Q.andarFrente : Q.andarCostas)[Math.min(5, Math.floor(f * 6))];
    } else if (TRABALHO.has(e) && d.t > 0.12 && (d.p === undefined || d.p < 0.93)) {
      deFrente = true; // só há o desenho de frente dela abaixada
      quadro = Q.trabalhar[Math.floor(d.t * 5) % Q.trabalhar.length];
    } else {
      quadro = (deFrente ? Q.paradaFrente : Q.paradaCostas)[0];
      if (e === 'girarManivela' || e === 'colherFruta') pulo = 0.035 * Math.abs(Math.sin((d.t || 0) * 5)); // um balanço, enquanto não há desenho próprio
      else if (e === 'parado') respiro = 0.012 * Math.sin(this.tempo * 2.4);
    }
    // o desenho de frente olha para a esquerda de quem vê; o de costas, para a direita
    const espelhar = deFrente ? this.direita : !this.direita;
    this.cartao.scale.set(espelhar ? -1 : 1, 1 + respiro, 1);
    this.cartao.position.y = pulo;
    if (quadro !== this.quadro) {
      this.quadro = quadro;
      const col = quadro % ATLAS.colunas, lin = Math.floor(quadro / ATLAS.colunas);
      textura.offset.set((col * CW) / ATLAS.largura, 1 - ((lin + 1) * CH) / ATLAS.altura);
    }
    this.cartao.visible = carga.atlas === 'pronto';
  }
}

export const personagem = () => new PersonagemFigura();
