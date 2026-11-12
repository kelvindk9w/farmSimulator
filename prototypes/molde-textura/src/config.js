// Configuração compartilhada pelos moldes e pela página de renderização.
import molde from '../config/molde.json';

export const SLOTS = Object.keys(molde.slots);
export const SLOTS_QUE_REPETEM = SLOTS.filter((s) => molde.slots[s].repete);
export const DENSIDADE = molde.densidade.unidadesDeMundoPorRepeticao; // unidades de mundo por repetição de UV
export const FOLGA = molde.folgaDosQuadros; // distância dos quadros de porta e janela até a parede
export default molde;
