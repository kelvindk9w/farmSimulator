# Acabamento das peças da interface (molduras de 9 fatias e peças fixas).
# Escala: 3 px da imagem = 1 px do CSS no celular deitado (844 x 390).
import numpy as np
from PIL import Image
from scipy import ndimage

ESC = 3  # px da imagem por px do CSS


def carregar(caminho):
    return np.array(Image.open(caminho).convert('RGBA')).astype(np.float32)


def limpar(a):
    """alfa quase zero vira zero; quase cheio vira cheio; sem cor escondida no transparente."""
    a = a.copy()
    al = a[:, :, 3]
    al[al < 10] = 0
    al[al >= 248] = 255
    a[al == 0, :3] = 0
    return a


def partes(a, limiar=40):
    lab, n = ndimage.label(a[:, :, 3] > limiar, structure=np.ones((3, 3)))
    objs = ndimage.find_objects(lab)
    areas = ndimage.sum(np.ones(lab.shape), lab, range(1, n + 1))
    lst = [dict(id=i + 1, area=int(areas[i]), y0=objs[i][0].start, y1=objs[i][0].stop,
                x0=objs[i][1].start, x1=objs[i][1].stop) for i in range(n)]
    lst.sort(key=lambda p: -p['area'])
    return lab, lst


def recortar(a, lab, p, folga=3, juntar=None):
    """Recorta a parte p (e as partes da lista juntar), com a meia-transparência da borda."""
    ids = {p['id']} | set(q['id'] for q in (juntar or []))
    m = np.isin(lab, list(ids))
    m = ndimage.binary_dilation(m, iterations=folga)
    b = a.copy()
    b[~m] = 0
    ys, xs = np.where(b[:, :, 3] > 0)
    return b[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def caixa(a, limiar=8):
    ys, xs = np.where(a[:, :, 3] > limiar)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def aparar(a, limiar=8, margem=0):
    x0, y0, x1, y1 = caixa(a, limiar)
    b = a[y0:y1, x0:x1]
    if margem:
        b = np.pad(b, ((margem, margem), (margem, margem), (0, 0)))
    return b


def para_img(a):
    return Image.fromarray(np.clip(np.round(a), 0, 255).astype(np.uint8), 'RGBA')


def redimensionar(a, w, h):
    """Redimensiona com alfa pré-multiplicado (sem halo escuro nas bordas)."""
    pm = a.copy()
    pm[:, :, :3] *= pm[:, :, 3:4] / 255.0
    im = Image.fromarray(np.clip(np.round(pm), 0, 255).astype(np.uint8), 'RGBA')
    # Image.resize em RGBA já trata premultiplicado internamente? Não: fazemos por canal.
    chans = [np.array(Image.fromarray(np.clip(np.round(pm[:, :, c]), 0, 255).astype(np.uint8), 'L')
                      .resize((w, h), Image.LANCZOS)).astype(np.float32) for c in range(4)]
    out = np.stack(chans, axis=2)
    al = np.maximum(out[:, :, 3:4], 1e-3)
    out[:, :, :3] = np.where(out[:, :, 3:4] > 0, out[:, :, :3] * 255.0 / al, 0)
    return limpar(np.clip(out, 0, 255))


def escala_altura(a, h):
    H, W = a.shape[:2]
    return redimensionar(a, max(1, round(W * h / H)), h)


def escala_fator(a, f):
    H, W = a.shape[:2]
    return redimensionar(a, max(1, round(W * f)), max(1, round(H * f)))


def espelhar(a, lado='esquerda'):
    """Simetria da esquerda para a direita: a metade esquerda espelhada vira a direita."""
    H, W = a.shape[:2]
    b = a.copy()
    meio = W // 2
    if lado == 'esquerda':
        esq = a[:, :meio]
        b[:, W - meio:] = esq[:, ::-1]
    else:
        dir_ = a[:, W - meio:]
        b[:, :meio] = dir_[:, ::-1]
    return b


def perfil(a):
    """Alfa e luminância suavizados, para comparar colunas e linhas."""
    lum = a[:, :, 0] * 0.3 + a[:, :, 1] * 0.59 + a[:, :, 2] * 0.11
    lum = lum * a[:, :, 3] / 255.0
    return np.stack([a[:, :, 3], lum], axis=2)


def achar_fatias(a, tol=20.0, folga=3, faixa=None):
    """Acha onde os cantos acabam: a partir de onde as colunas (linhas) ficam iguais à do meio."""
    H, W = a.shape[:2]
    p = ndimage.uniform_filter(perfil(a), size=(3, 3, 1))
    xc, yc = W // 2, H // 2
    col = p[:, xc]
    row = p[yc, :]

    def dif_col(x):
        return np.percentile(np.abs(p[:, x] - col).max(axis=1), 99)

    def dif_row(y):
        return np.percentile(np.abs(p[y, :] - row).max(axis=1), 99)

    l = xc
    while l > 0 and dif_col(l - 1) < tol:
        l -= 1
    r = xc
    while r < W - 1 and dif_col(r + 1) < tol:
        r += 1
    t = yc
    while t > 0 and dif_row(t - 1) < tol:
        t -= 1
    b = yc
    while b < H - 1 and dif_row(b + 1) < tol:
        b += 1
    return dict(topo=t + folga if t > 0 else 0, esquerda=l + folga if l > 0 else 0,
                direita=(W - 1 - r) + folga if r < W - 1 else 0, baixo=(H - 1 - b) + folga if b < H - 1 else 0)


def arredondar3(f):
    return {k: int(np.ceil(v / 3.0) * 3) for k, v in f.items()}


def uniformizar(a, f, meio_px=None, so=None):
    """Deixa o meio igual ao longo do comprimento: as colunas do meio viram a coluna central e as
    linhas do meio viram a linha central. Se meio_px, encolhe o meio para esse tamanho."""
    H, W = a.shape[:2]
    b = a.copy()
    t, r, bo, l = f['topo'], f['direita'], f['baixo'], f['esquerda']
    if so in (None, 'h') and W - l - r > 0:
        xc = l + (W - l - r) // 2
        b[:, l:W - r] = b[:, xc:xc + 1]
    if so in (None, 'v') and H - t - bo > 0:
        yc = t + (H - t - bo) // 2
        b[t:H - bo, :] = b[yc:yc + 1, :]
    if meio_px:
        mw = meio_px if (so in (None, 'h')) else None
        mh = meio_px if (so in (None, 'v')) else None
        if mw and W - l - r > mw:
            b = np.concatenate([b[:, :l], b[:, l:l + mw], b[:, W - r:]], axis=1)
        H2, W2 = b.shape[:2]
        if mh and H2 - t - bo > mh:
            b = np.concatenate([b[:t], b[t:t + mh], b[H2 - bo:]], axis=0)
    return b


def nove_fatias_html(arq, f, larg_css, alt_css, fill=True):
    return (f"border-style:solid;border-width:{f['topo']//ESC}px {f['direita']//ESC}px {f['baixo']//ESC}px {f['esquerda']//ESC}px;"
            f"border-image:url({arq}) {f['topo']} {f['direita']} {f['baixo']} {f['esquerda']}{' fill' if fill else ''} / "
            f"{f['topo']//ESC}px {f['direita']//ESC}px {f['baixo']//ESC}px {f['esquerda']//ESC}px stretch;"
            f"width:{larg_css}px;height:{alt_css}px;box-sizing:border-box;")


def esticar(a, f, w, h):
    """Simula o border-image (stretch) para a folha de contato: monta a peça em w x h px da imagem."""
    H, W = a.shape[:2]
    t, r, b, l = f['topo'], f['direita'], f['baixo'], f['esquerda']
    out = np.zeros((h, w, 4), np.float32)
    xs = [(0, l, 0, l), (l, W - r, l, w - r), (W - r, W, w - r, w)]
    ys = [(0, t, 0, t), (t, H - b, t, h - b), (H - b, H, h - b, h)]
    for (sy0, sy1, dy0, dy1) in ys:
        for (sx0, sx1, dx0, dx1) in xs:
            if sy1 <= sy0 or sx1 <= sx0 or dy1 <= dy0 or dx1 <= dx0:
                continue
            pedaco = a[sy0:sy1, sx0:sx1]
            if pedaco.shape[:2] != (dy1 - dy0, dx1 - dx0):
                pedaco = redimensionar(pedaco, dx1 - dx0, dy1 - dy0) if min(pedaco.shape[:2]) > 1 else \
                    np.array(para_img(pedaco).resize((dx1 - dx0, dy1 - dy0), Image.NEAREST)).astype(np.float32)
            out[dy0:dy1, dx0:dx1] = pedaco
    return out


def salvar(a, caminho):
    para_img(limpar(a)).save(caminho, optimize=True)


def miolo(a, tol=38):
    """Máscara do miolo creme ligado ao centro (inclui os brilhos claros do miolo)."""
    H, W = a.shape[:2]
    c = a[H // 2, W // 2, :3]
    d = np.sqrt(((a[:, :, :3] - c) ** 2).sum(axis=2))
    lum = a[:, :, :3] @ np.array([0.3, 0.59, 0.11])
    lumc = float(c @ np.array([0.3, 0.59, 0.11]))
    ok = ((d < tol) | (lum > lumc - 4)) & (a[:, :, 3] > 200)
    lab, n = ndimage.label(ok)
    return lab == lab[H // 2, W // 2]


def finalizar(pc, f, meio=24, so=None):
    f = arredondar3(f)
    out = uniformizar(pc, f, meio_px=meio, so=so)
    return out, f


def achatar_miolo(a, tol=30, cor=None):
    """Alisa o miolo: os pixels perto da cor do miolo viram a mediana dele (some a textura que faz emenda).
    Os brilhos mais claros e o contorno ficam como estão."""
    H, W = a.shape[:2]
    m = miolo(a)
    if cor is None:
        cor = np.median(a[m][:, :3], axis=0)
    d = np.sqrt(((a[:, :, :3] - cor) ** 2).sum(axis=2))
    alvo = m & (d < tol)
    b = a.copy()
    b[alvo, :3] = cor
    # pixels de transição perto do miolo: mistura suave para não ficar degrau
    perto = ndimage.binary_dilation(alvo, iterations=1) & ~alvo & (d < tol * 1.6)
    b[perto, :3] = (b[perto, :3] + cor) / 2
    return b


def ordenar(ps, n, passo=80):
    """As n maiores partes, em ordem de leitura (linhas de cima para baixo, da esquerda para a direita)."""
    sel = ps[:n]
    sel.sort(key=lambda p: (round(((p['y0'] + p['y1']) / 2) / passo), p['x0']))
    return sel


def achar_fatias_forma(a, tol=20.0, folga=3):
    """Como achar_fatias, mas compara só a forma (alfa e onde há contorno escuro), não a cor:
    serve para peças com degradê no meio."""
    lum = a[:, :, :3] @ np.array([0.3, 0.59, 0.11])
    escuro = ((lum < 45) & (a[:, :, 3] > 128)).astype(np.float32) * 80
    escuro = ndimage.gaussian_filter(escuro, 1.5)
    b = a.copy()
    b[:, :, 0] = escuro; b[:, :, 1] = escuro; b[:, :, 2] = escuro
    return achar_fatias(b, tol=tol, folga=folga)


def borda_brilho(a):
    """Largura do brilho em volta (do começo da tinta até o contorno escuro), na linha e coluna do meio."""
    H, W = a.shape[:2]
    cheio = a[:, :, 3] >= 250
    x = int(np.argmax(cheio[H // 2, :]))
    y = int(np.argmax(cheio[:, W // 2]))
    return x, y


def achatar_linhas(a, tol=28, x0=None, x1=None):
    """Alisa cada linha do miolo com a cor do meio daquela linha (some a textura e fica o degradê vertical)."""
    H, W = a.shape[:2]
    xc = W // 2
    b = a.copy()
    cor = a[:, xc, :3]  # cor do meio em cada linha
    d = np.sqrt(((a[:, :, :3] - cor[:, None, :]) ** 2).sum(axis=2))
    ok = (d < tol) & (a[:, :, 3] > 200)
    lab, n = ndimage.label(ok)
    m = lab == lab[H // 2, xc]
    b[m, :3] = np.broadcast_to(cor[:, None, :], (H, W, 3))[m]
    return b
