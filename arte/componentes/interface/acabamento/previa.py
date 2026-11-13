# previa.py saida.png nome:LxA[,LxA...] ...   (tamanhos em px da imagem)
import sys, json
sys.path.insert(0, '/root/arte-codex/ferramentas')
from nove import *
FIN = '/root/arte-codex/interface-final'
meta = json.load(open(FIN + '/_meta.json'))
itens = []
for arg in sys.argv[2:]:
    nome, tams = arg.split(':')
    a = carregar(f'{FIN}/{nome}.png')
    f = meta[nome]['fatias']
    linha = [a]
    for t in tams.split(','):
        w, h = map(int, t.split('x'))
        linha.append(esticar(a, f, w, h))
    itens.append(linha)
PAD = 20
W = max(sum(x.shape[1] for x in l) + PAD * (len(l) + 1) for l in itens)
H = sum(max(x.shape[0] for x in l) + PAD for l in itens) + PAD
bg = np.zeros((H, W, 4), np.float32); bg[:] = (96, 140, 70, 255)
yy, xx = np.mgrid[0:H, 0:W]; bg[((xx // 24 + yy // 24) % 2) == 0] = (110, 155, 82, 255)
img = para_img(bg)
y = PAD
for l in itens:
    x = PAD
    for p in l:
        img.alpha_composite(para_img(p), (x, y)); x += p.shape[1] + PAD
    y += max(p.shape[0] for p in l) + PAD
img.convert('RGB').save(sys.argv[1])
print(img.size)
