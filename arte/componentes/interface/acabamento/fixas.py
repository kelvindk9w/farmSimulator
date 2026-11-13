# Peças fixas: só mudam de tamanho por igual. Os estados de uma peça ficam no mesmo quadro, centrados.
import sys, json, os
sys.path.insert(0, '/root/arte-codex/ferramentas')
from nove import *
FIN = '/root/arte-codex/interface-final'
meta = json.load(open(FIN + '/_meta.json'))

def pegar(arquivo, n, passo):
    a = limpar(carregar('/root/arte-codex/' + arquivo))
    lab, ps = partes(a)
    return a, lab, ordenar(ps, n, passo)

def gravar_familia(nomes_pcs, origem, lado=None):
    """Põe os estados no mesmo quadro (o maior), centrados pela caixa; lado = tamanho final do quadrado."""
    W = max(p.shape[1] for _, p in nomes_pcs); H = max(p.shape[0] for _, p in nomes_pcs)
    for nome, p in nomes_pcs:
        h, w = p.shape[:2]
        q = np.zeros((H, W, 4), np.float32)
        y0 = (H - h) // 2; x0 = (W - w) // 2
        q[y0:y0 + h, x0:x0 + w] = p
        salvar(q, f'{FIN}/{nome}.png')
        meta[nome] = dict(tipo='fixa', origem=origem, familia=nomes_pcs[0][0].rsplit('-', 1)[0] if len(nomes_pcs) > 1 else nome)
        print(f'{nome:24s} {W} x {H}')

# lote 05: fechar (normal, apertado), selo; agir (normal, apertado), contador
a, lab, s = pegar('interface-pecas-05/redondos.png', 6, 200)
def corta(i, fator):
    return aparar(escala_fator(recortar(a, lab, s[i]), fator), 1, margem=3)
fx = 180 / 352
gravar_familia([('botao-fechar-normal', corta(0, fx)), ('botao-fechar-apertado', corta(1, fx))], 'interface-pecas-05/redondos.png')
gravar_familia([('selo-nivel', corta(2, 360 / 429))], 'interface-pecas-05/redondos.png')
fa = 255 / 416
gravar_familia([('botao-agir-normal', corta(3, fa)), ('botao-agir-apertado', corta(4, fa))], 'interface-pecas-05/redondos.png')
gravar_familia([('bolinha-contador', corta(5, 72 / 232))], 'interface-pecas-05/redondos.png')

# lote 07: alavanca (base, pino, bolinha de novidade)
a, lab, s = pegar('interface-pecas-07/alavanca.png', 3, 400)
s.sort(key=lambda p: p['x0'])
base = corta(0, 330 / 584)
# o miolo creme da base fica meio transparente (a alavanca parada não tampa a fazenda)
m = miolo(base)
suave = ndimage.gaussian_filter(m.astype(np.float32), 0.8)
base[:, :, 3] = base[:, :, 3] * (1 - 0.45 * suave)
gravar_familia([('alavanca-base', base)], 'interface-pecas-07/alavanca.png (miolo com 55% de opacidade)')
gravar_familia([('alavanca-pino', corta(1, 138 / 255))], 'interface-pecas-07/alavanca.png')
gravar_familia([('bolinha-novidade', corta(2, 48 / 158))], 'interface-pecas-07/alavanca.png')

# raios: quadrado centrado no centro da imagem crua (o centro dos raios)
r = limpar(carregar('/root/arte-codex/interface-pecas-07/raios.png'))
lab, ps = partes(r, 4)
r[lab != ps[0]['id']] = 0  # só a parte grande (sai a poeira solta)
H, W = r.shape[:2]
ys, xs = np.where(r[:, :, 3] > 0)
cy, cx = H // 2, W // 2
raio = int(max(cy - ys.min(), ys.max() - cy, cx - xs.min(), xs.max() - cx)) + 2
q = r[cy - raio:cy + raio, cx - raio:cx + raio]
q = redimensionar(q, 900, 900)
salvar(q, f'{FIN}/raios.png')
meta['raios'] = dict(tipo='fixa', origem='interface-pecas-07/raios.png', centro=[450, 450])
print('raios 900 x 900, centro dos raios no centro da imagem; corte', 2 * raio)
json.dump(meta, open(FIN + '/_meta.json', 'w'), indent=1)
