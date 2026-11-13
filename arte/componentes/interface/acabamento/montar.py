# Copia as peças finais para o repositório, escreve componentes.json e faz a folha de contato.
import sys, json, os, shutil
sys.path.insert(0, '/root/arte-codex/ferramentas')
from nove import *
from PIL import ImageDraw, ImageFont

FIN = '/root/arte-codex/interface-final'
REPO = '/home/user/farmSimulator'
DEST = f'{REPO}/arte/componentes/interface'
JOGO = f'{REPO}/jogo/arte/interface/molduras'
meta = json.load(open(FIN + '/_meta.json'))

# Uso de cada peça e tamanho no celular (px do CSS), para o json e para a folha.
USO = {
    'painel': ('Fundo de todos os painéis (loja, presente, mochila, construir, subiu de nível).', 'livre', 'largura e altura', 'normal'),
    'painel-moldura': ('Só a moldura do painel, sem miolo: para pôr por cima de outro fundo.', 'livre', 'largura e altura', 'normal'),
    'painel-fundo': ('Só o miolo creme do painel: área de dentro (atrás das abas e dos cartões).', 'livre', 'largura e altura', 'normal'),
    'menu-lista': ('Lista que desce do botão Menu; o biquinho fica no canto de cima, à direita.', 'livre', 'largura e altura', 'normal'),
    'balao': ('Balão do vizinho (retrato, título, fala e barra vão por cima, no HTML).', 'livre (~95 de altura)', 'largura e altura', 'normal'),
    'pilula': ('Pílula do HUD (ouro, cash, cesto, água, experiência) e de recompensa.', '36 de altura', 'só largura', 'normal'),
    'aviso': ('Aviso curto (toast) do alto da tela; o visto e o texto vão por cima.', '28 de altura', 'só largura', 'normal'),
    'cabecalho': ('Tábua do título do painel ("Presente do dia"), com os dois pregos.', '45 de altura', 'só largura', 'normal'),
    'botao-verde': ('Botão de ação principal e de preço em ouro (Comprar, Receber, Continuar).', '43 de altura (até ~55)', 'largura e altura', 'normal, apertado, desativado'),
    'botao-turquesa': ('Botão de preço em cash.', '43 de altura', 'largura e altura', 'normal, apertado'),
    'botao-marrom': ('Botão travado ("Nível 6").', '43 de altura', 'largura e altura', 'normal'),
    'botao-hud': ('Botão quadrado do HUD (Mochila, Loja, Construir, Menu) e da barra de ferramentas; também o botão creme de ação secundária.', '55 a 70', 'largura e altura', 'normal, apertado, selecionado'),
    'aba': ('Aba da loja; a selecionada é aberta embaixo e encosta no miolo do painel.', '43 de altura', 'largura e altura', 'normal, selecionada'),
    'cartao-item': ('Cartão de item da loja.', 'livre (~125 de altura)', 'largura e altura', 'normal, travado'),
    'cartao-dia': ('Cartão do dia do presente; o "hoje" tem brilho para fora (use border-image-outset).', 'livre (~150 de altura)', 'largura e altura', 'aberto, hoje, futuro, especial'),
    'barra-moldura': ('Trilho da barra de progresso (experiência, missão, produção).', '17 de altura', 'só largura', 'normal'),
    'barra-enchimento': ('Parte cheia da barra, por cima do trilho (dourada = experiência, verde = missão).', '12 de altura', 'só largura', 'dourado, verde'),
    'faixa-nivel': ('Fita vermelha "Subiu de nível!" sem texto; o texto vai por cima no HTML.', '78 de altura', 'só largura', 'normal'),
    'botao-fechar': ('Botão vermelho redondo de fechar (com o X desenhado).', '42 a 60', 'tamanho fixo', 'normal, apertado'),
    'selo-nivel': ('Selo do nível sem número (o número vai por cima no HTML).', '46 no HUD, 120 na tela de nível', 'tamanho fixo', 'normal'),
    'botao-agir': ('Botão redondo de agir; o ícone (ui/mao, ui/enxada...) vai por cima.', '85', 'tamanho fixo', 'normal, apertado'),
    'bolinha-contador': ('Bolinha azul do contador (o número vai por cima).', '20 a 24', 'tamanho fixo', 'normal'),
    'bolinha-novidade': ('Bolinha vermelha de novidade.', '12 a 16', 'tamanho fixo', 'normal'),
    'alavanca-base': ('Base da alavanca virtual; o miolo já vem meio transparente.', '110', 'tamanho fixo', 'normal'),
    'alavanca-pino': ('Pino da alavanca virtual.', '46', 'tamanho fixo', 'normal'),
    'raios': ('Raios de sol atrás do selo na tela de nível; o centro dos raios é o centro da imagem (gira pelo CSS).', '~400', 'tamanho fixo', 'normal'),
}


def familia_de(nome):
    for k in sorted(USO, key=len, reverse=True):
        if nome == k or nome.startswith(k + '-'):
            return k
    return nome


ORDEM = ['painel', 'painel-moldura', 'painel-fundo', 'menu-lista', 'balao', 'pilula', 'aviso', 'cabecalho',
         'botao-verde-normal', 'botao-verde-apertado', 'botao-verde-desativado', 'botao-turquesa-normal',
         'botao-turquesa-apertado', 'botao-marrom', 'botao-hud-normal', 'botao-hud-apertado', 'botao-hud-selecionado',
         'aba-normal', 'aba-selecionada', 'cartao-item-normal', 'cartao-item-travado', 'cartao-dia-aberto',
         'cartao-dia-hoje', 'cartao-dia-futuro', 'cartao-dia-especial', 'barra-moldura', 'barra-enchimento-dourado',
         'barra-enchimento-verde', 'faixa-nivel', 'botao-fechar-normal', 'botao-fechar-apertado', 'selo-nivel',
         'botao-agir-normal', 'botao-agir-apertado', 'bolinha-contador', 'bolinha-novidade', 'alavanca-base',
         'alavanca-pino', 'raios']


def montar_json(icones):
    os.makedirs(DEST, exist_ok=True)
    os.makedirs(JOGO, exist_ok=True)
    pecas = {}
    for nome in ORDEM:
        m = meta[nome]
        arq = f'{FIN}/{nome}.png'
        im = Image.open(arq)
        W, H = im.size
        fam = familia_de(nome)
        uso, tam, estica, estados = USO[fam]
        e = dict(arquivo=f'{nome}.png', largura=W, altura=H, tipo='9 fatias' if m['tipo'] == 'nove' else 'fixa',
                 familia=fam, estados_da_familia=estados, uso=uso, tamanho_no_celular_css=tam, estica=estica,
                 apoio=[W // 2, H // 2], casas=None)
        if m['tipo'] == 'nove':
            f = m['fatias']
            fat = dict(topo=f['topo'], direita=f['direita'], baixo=f['baixo'], esquerda=f['esquerda'])
            e['fatias'] = fat
            e['borda_css'] = {k: v // ESC for k, v in fat.items()}
            fora = m.get('fora')
            css = (f"border-style: solid; border-color: transparent; "
                   f"border-image: url(molduras/{nome}.png) {fat['topo']} {fat['direita']} {fat['baixo']} {fat['esquerda']} fill / "
                   f"{fat['topo']//ESC}px {fat['direita']//ESC}px {fat['baixo']//ESC}px {fat['esquerda']//ESC}px")
            if fora:
                e['fora'] = dict(x=fora['x'], y=fora['y'])
                e['fora_css'] = dict(x=fora['x'] // ESC, y=fora['y'] // ESC)
                css += f" / {fora['y']//ESC}px {fora['x']//ESC}px"
            css += ' stretch;'
            e['css'] = css
            if estica == 'só largura':
                e['altura_css'] = round(H / ESC)
        else:
            e['tamanho_css'] = [round(W / ESC), round(H / ESC)]
            e['css'] = f"background: url(molduras/{nome}.png) center / contain no-repeat;"
        e['origem'] = m['origem']
        pecas[nome] = e
        shutil.copy(arq, f'{DEST}/{nome}.png')
        shutil.copy(arq, f'{JOGO}/{nome}.png')
    doc = {
        'escala': '3 px da imagem = 1 px do CSS no celular deitado (844 x 390). Fatia de 84 px na imagem = borda de 28 px no CSS.',
        'pasta_no_jogo': 'jogo/arte/interface/molduras/',
        'como_usar_9_fatias': ('border-image com "fill" e "stretch": os quatro cantos ficam como estão, os lados e o miolo esticam. '
                               'border-image-width = fatias / 3. A espessura de border-width (o que empurra o conteúdo) pode ser menor que '
                               'border-image-width; use padding para afastar o texto da moldura. Peças "só largura" (pílula, aviso, botões '
                               'compridos, barra, fita) têm a altura certa em altura_css: use essa altura.'),
        'estados': 'Os estados de uma família (normal, apertado, desativado...) têm o mesmo tamanho e as mesmas fatias: troque só o url().',
        'margem': 'Molduras sem margem transparente (a borda da imagem é a borda da peça). Peças fixas aparadas rente ao desenho.',
        'pecas': pecas,
        'icones': icones,
    }
    json.dump(doc, open(f'{DEST}/componentes.json', 'w'), indent=1, ensure_ascii=False)
    return pecas


def folha(pecas, icones):
    fonte = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
    fonteb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
    LARG = 1800
    blocos = []
    for nome in ORDEM:
        e = pecas[nome]
        a = carregar(f'{FIN}/{nome}.png')
        itens = [a]
        if e['tipo'] == '9 fatias':
            f = meta[nome]['fatias']
            W, H = e['largura'], e['altura']
            if e['estica'] == 'só largura':
                itens.append(esticar(a, f, min(W * 2, W + 500), H))
            else:
                fora = meta[nome].get('fora', {'x': 0, 'y': 0})
                itens.append(esticar(a, f, max(W, 2 * f['esquerda'] + 2 * f['direita'] + 120), max(H, int((f['topo'] + f['baixo']) * 1.4))))
        S = 0.6 if nome != 'raios' else 0.3
        itens = [redimensionar(it, max(1, round(it.shape[1] * S)), max(1, round(it.shape[0] * S))) for it in itens]
        txt = nome + (f"  [{e['fatias']['topo']} {e['fatias']['direita']} {e['fatias']['baixo']} {e['fatias']['esquerda']}]" if e['tipo'] == '9 fatias' else '  (fixa)')
        blocos.append((txt, itens))
    # ícones
    ics = []
    for k in icones:
        ics.append((k, carregar(f"{REPO}/jogo/arte/{icones[k]['arquivo']}")))
    # layout em linhas
    PAD = 18
    lin = []; x = PAD; alto = 0; linhas = []
    for txt, itens in blocos:
        w = sum(i.shape[1] for i in itens) + PAD * (len(itens) - 1)
        w = max(w, len(txt) * 9)
        h = max(i.shape[0] for i in itens) + 26
        if x + w > LARG - PAD and lin:
            linhas.append((lin, alto)); lin = []; x = PAD; alto = 0
        lin.append((x, txt, itens)); x += w + PAD * 2; alto = max(alto, h)
    if lin:
        linhas.append((lin, alto))
    H_ic = 128 + 30
    porlinha = (LARG - PAD) // 150
    n_ic_lin = (len(ics) + porlinha - 1) // porlinha
    total = 50 + sum(a + PAD for _, a in linhas) + 50 + n_ic_lin * (H_ic + PAD) + PAD
    bg = Image.new('RGBA', (LARG, total), (206, 200, 186, 255))
    d = ImageDraw.Draw(bg)
    d.text((PAD, 12), 'Interface: molduras de 9 fatias (cada uma sozinha e esticada) e peças fixas. Escala: 3 px = 1 px do CSS no celular.', font=fonteb, fill=(60, 40, 25))
    y = 50
    for lin, alto in linhas:
        for x0, txt, itens in lin:
            d.text((x0, y), txt, font=fonte, fill=(50, 35, 20))
            xx = x0
            for it in itens:
                bg.alpha_composite(para_img(it), (xx, y + 22)); xx += it.shape[1] + PAD
        y += alto + PAD
    d.text((PAD, y + 10), 'Ícones (catálogo do jogo, 128 x 128): novos e redesenhados nesta etapa, e os que já existiam e continuam iguais.', font=fonteb, fill=(60, 40, 25))
    y += 50
    for i, (k, a) in enumerate(ics):
        cx = PAD + (i % porlinha) * 150; cy = y + (i // porlinha) * (H_ic + PAD)
        bg.alpha_composite(para_img(a), (cx, cy))
        tag = k + (' *' if icones[k].get('nesta_etapa') else '')
        d.text((cx, cy + 130), tag, font=fonte, fill=(50, 35, 20))
    bg.convert('RGB').save(f'{DEST}/folha-de-contato.png', optimize=True)
    print('folha', bg.size)


if __name__ == '__main__':
    icones = json.load(open(FIN + '/_icones.json')) if os.path.exists(FIN + '/_icones.json') else {}
    p = montar_json(icones)
    folha(p, icones)
    print(len(p), 'peças')
