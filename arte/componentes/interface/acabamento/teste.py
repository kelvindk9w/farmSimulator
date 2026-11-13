# Gera as páginas de teste (tela do jogo e loja) com as peças em border-image, a partir de componentes.json.
import json, os
REPO = '/home/user/farmSimulator'
DEST = f'{REPO}/arte/componentes/interface'
T = f'{DEST}/teste'
os.makedirs(T, exist_ok=True)
d = json.load(open(f'{DEST}/componentes.json'))
P = d['pecas']
J = '../../../../jogo/arte'  # da pasta teste/ até jogo/arte

css = []
for nome, e in P.items():
    if e['tipo'] == '9 fatias':
        f, b = e['fatias'], e['borda_css']
        fora = f" / {e['fora_css']['y']}px {e['fora_css']['x']}px" if 'fora_css' in e else ''
        css.append(f".n-{nome}{{border-style:solid;border-color:transparent;border-image:url(../{nome}.png) {f['topo']} {f['direita']} {f['baixo']} {f['esquerda']} fill / "
                   f"{b['topo']}px {b['direita']}px {b['baixo']}px {b['esquerda']}px{fora} stretch;}}")
    else:
        css.append(f".f-{nome}{{background:url(../{nome}.png) center/contain no-repeat;}}")
CSS_PECAS = '\n'.join(css)

BASE = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden}
body{font:800 16px/1.15 system-ui,"Inter","DejaVu Sans",sans-serif;color:#4a2a12;
 background:#73b23f;background-image:radial-gradient(circle at 20% 30%,#86c24c 0 8%,transparent 9%),radial-gradient(circle at 70% 60%,#86c24c 0 6%,transparent 7%),
 radial-gradient(circle at 45% 80%,#64a335 0 7%,transparent 8%),linear-gradient(135deg,#7dbb45,#66a838);background-size:300px 300px,260px 260px,340px 340px,100% 100%}
.terra{position:absolute;left:30%;top:18%;width:300px;height:170px;background:#c98d57;transform:skewX(-30deg) rotate(8deg);opacity:.9;border-radius:6px}
.ab{position:absolute}
.lin{display:flex;align-items:center}
.ic{display:block;object-fit:contain}
.num{font-size:19px;font-variant-numeric:tabular-nums}
.branco{color:#fff;paint-order:stroke fill;-webkit-text-stroke:4px #3a1f0c}
"""

TELA = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Teste: tela do jogo</title><style>{BASE}
{CSS_PECAS}
.pil{{height:36px;border-width:6px;padding:0 12px 0 2px;gap:4px}}
.hudbt{{width:55px;height:55px;border-width:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}}
.hudbt img{{width:40px;height:40px}}
.ferr{{width:69px;height:69px;border-width:8px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;position:relative;padding-top:1px}}
.ferr img{{width:38px;height:38px}}
.ferr span{{font-size:15px;margin-top:-2px}}
.desk{{display:none}}
@media (min-width:1000px){{.desk{{display:flex}}}}
</style></head><body>
<div class="terra"></div>
<!-- canto de cima, à esquerda -->
<div class="ab lin n-pilula pil" style="left:30px;top:9px;width:184px;padding-left:24px;gap:6px">
  <div class="n-barra-moldura" style="width:90px;height:17px;border-width:3px;position:relative">
    <div class="n-barra-enchimento-dourado" style="position:absolute;left:0;top:-1px;width:36%;height:12px;border-width:2px"></div></div>
  <span class="num">15/40</span></div>
<div class="ab f-selo-nivel lin" style="left:6px;top:4px;width:46px;height:47px;justify-content:center"><span class="branco" style="font-size:26px;margin-top:-2px">2</span></div>
<div class="ab lin" style="left:222px;top:9px;gap:6px"><div class="lin n-pilula pil"><img class="ic" src="{J}/icones/ouro.png" width="30" height="30"><span class="num">320</span></div>
<div class="lin n-pilula pil" style="padding-right:4px"><img class="ic" src="{J}/icones/cash.png" width="30" height="30"><span class="num" style="margin-right:6px">12</span><img class="ic" src="{J}/interface/mais.png" width="28" height="28"></div></div>
<div class="ab lin" style="left:12px;top:52px;gap:6px"><div class="lin n-pilula pil"><img class="ic" src="{J}/icones/cesto-de-palha.png" width="30" height="30"><span class="num">4/12</span></div>
<div class="lin n-pilula pil"><img class="ic" src="{J}/interface/regar.png" width="30" height="30"><span class="num">3/4</span></div></div>
<!-- aviso curto -->
<div class="ab lin n-aviso" style="left:50%;transform:translateX(-50%);top:56px;height:28px;border-width:4px;padding:0 12px 0 4px;gap:5px;white-space:nowrap">
  <img class="ic" src="{J}/interface/certo.png" width="22" height="22"><span style="font-size:16px">Missão cumprida: Regar</span></div>
<!-- botões do alto, à direita -->
<div class="ab lin" style="right:8px;top:6px;gap:4px">
  <div class="hudbt n-botao-hud-normal desk"><img src="{J}/interface/correio.png"></div>
  <div class="hudbt n-botao-hud-normal desk"><img src="{J}/interface/missoes.png"></div>
  <div class="hudbt n-botao-hud-normal desk"><img src="{J}/interface/minha-fazenda.png"></div>
  <div class="hudbt n-botao-hud-normal desk"><img src="{J}/interface/config.png"></div>
  <div class="hudbt n-botao-hud-normal desk"><img src="{J}/interface/tela-cheia.png"></div>
  <div class="hudbt n-botao-hud-normal"><img src="{J}/interface/mochila.png"></div>
  <div class="hudbt n-botao-hud-normal"><img src="{J}/interface/loja.png"></div>
  <div class="hudbt n-botao-hud-normal"><img src="{J}/icones/martelo.png"></div>
  <div class="hudbt n-botao-hud-apertado"><img src="{J}/interface/menu.png" style="width:30px;height:26px;margin-top:2px"><span style="font-size:13px;margin-top:-1px">Menu</span>
    <div class="ab f-bolinha-novidade" style="right:-6px;top:-6px;width:16px;height:16px"></div></div>
</div>
<!-- balão do vizinho -->
<div class="ab lin n-balao" style="right:8px;top:68px;width:272px;height:96px;border-width:7px;padding:2px 8px 2px 4px;gap:8px">
  <div style="width:62px;height:62px;border-radius:50%;border:4px solid #e8913a;box-shadow:0 0 0 2px #3a1f0c;overflow:hidden;background:#9fd3f0;flex:none">
    <img src="{J}/retratos/seu-tonho.png" style="width:62px;height:62px;margin:-2px 0 0 -4px"></div>
  <div style="flex:1">
    <div style="font-size:19px">Milho</div>
    <div style="font-size:14px;line-height:1.15">Liberou o milho!<br>Colha 8 espigas.</div>
    <div class="lin" style="gap:4px;margin-top:3px">
      <div class="n-barra-moldura" style="width:110px;height:16px;border-width:3px;position:relative">
        <div class="n-barra-enchimento-verde" style="position:absolute;left:0;top:-1px;width:38%;height:11px;border-width:2px"></div></div>
      <img class="ic" src="{J}/icones/milho.png" width="22" height="22"><span style="font-size:16px">3/8</span></div>
  </div>
</div>
<!-- barra de ferramentas -->
<div class="ab lin" style="left:50%;transform:translateX(-50%);bottom:8px;gap:5px">
  <div class="ferr n-botao-hud-normal"><img src="{J}/interface/mao.png"><span>Mão</span></div>
  <div class="ferr n-botao-hud-selecionado"><img src="{J}/interface/enxada.png"><span class="branco" style="-webkit-text-stroke-width:3px">Enxada</span></div>
  <div class="ferr n-botao-hud-normal"><img src="{J}/interface/semear.png"><span>Semear</span></div>
  <div class="ferr n-botao-hud-normal"><img src="{J}/interface/regar.png"><span>Regar</span>
    <div class="ab f-bolinha-contador lin" style="right:-7px;top:-8px;width:24px;height:25px;justify-content:center"><span class="branco" style="font-size:13px;-webkit-text-stroke-width:3px">3</span></div></div>
</div>
<!-- alavanca e botão de agir -->
<div class="ab f-alavanca-base" style="left:16px;bottom:20px;width:110px;height:111px"></div>
<div class="ab f-alavanca-pino" style="left:48px;bottom:52px;width:46px;height:47px"></div>
<div class="ab f-botao-agir-normal lin" style="right:16px;bottom:16px;width:85px;height:87px;justify-content:center"><img src="{J}/interface/mao.png" width="54" height="54"></div>
</body></html>
"""

CARTOES = [
    ('canteiro-de-flores', 'Canteiro de flores', 'verde', 'ouro', '150'),
    ('bandeirinhas-de-festa', 'Bandeirinhas de festa', 'turquesa', 'cash', '60'),
    ('porteira', 'Porteira', 'verde', 'ouro', '30'),
    ('espantalho', 'Espantalho', 'marrom', None, 'Nível 6'),
    ('caminho-de-pedra', 'Caminho de pedra', 'verde', 'ouro', '10'),
    ('fonte-de-pedra', 'Fonte de pedra', 'turquesa', 'cash', '180'),
]
ABAS = [('icones/semente-milho', 'Sementes'), ('icones/martelo', 'Ferramentas'), ('icones/madeira', 'Materiais'),
        ('icones/ovo', 'Animais'), ('objetos/canteiro-de-flores', 'Enfeites'), ('icones/cash', 'Cash')]


def cartao(obj, nome, cor, moeda, preco):
    trav = cor == 'marrom'
    bt = 'botao-marrom' if trav else f'botao-{cor}-normal'
    ic = f'<img class="ic" src="{J}/icones/{moeda}.png" width="26" height="26">' if moeda else ''
    return f"""<div class="card n-cartao-item-{'travado' if trav else 'normal'}" style="position:relative">
  <img src="{J}/objetos/{obj}.png" class="item" style="{'filter:grayscale(1) opacity(.55)' if trav else ''}">
  <div class="nome" style="{'color:#8a7c70' if trav else ''}">{nome}</div>
  <div class="preco lin n-{bt}">{ic}<span class="branco">{preco}</span></div>
  {f'<img class="ab" src="{J}/interface/cadeado.png" style="right:8px;top:6px;width:28px;height:28px">' if trav else ''}
</div>"""


abas = ''.join(f"""<div class="aba lin n-aba-{'selecionada' if n == 'Enfeites' else 'normal'}" style="{'height:46px;margin-top:-3px' if n == 'Enfeites' else ''}"><img class="ic" src="{J}/{i}.png" width="26" height="26"><span>{n}</span></div>""" for i, n in ABAS)

LOJA = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Teste: loja</title><style>{BASE}
{CSS_PECAS}
.veu{{position:absolute;inset:0;background:rgba(20,30,10,.5)}}
.painel{{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(716px,96vw);height:min(368px,95vh);border-width:10px;padding:2px 4px 6px;display:flex;flex-direction:column}}
.topo{{height:44px;border-width:6px;margin:-4px -2px 0;padding:0 50px 0 8px;gap:8px}}
.pil{{height:32px;border-width:5px;padding:0 12px 0 2px;gap:4px}}
.abas{{display:flex;gap:3px;margin-top:3px;padding:0 4px;align-items:flex-end;height:43px}}
.aba{{flex:1;height:42px;border-width:6px;gap:4px;justify-content:center;font-size:14px;white-space:nowrap;padding:0 2px}}
.area{{flex:1;min-height:0;border-width:4px;margin-top:-2px;padding:6px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:6px}}
.card{{min-height:0;overflow:hidden;border-width:6px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:2px 6px 6px}}
.card .item{{height:44px;max-width:90%;object-fit:contain;margin-bottom:auto;margin-top:2px}}
.card .nome{{font-size:14px;margin:0 0 3px;white-space:nowrap}}
.preco{{width:100%;height:38px;flex:none;border-width:6px;justify-content:center;gap:6px;font-size:20px}}
</style></head><body>
<div class="terra"></div><div class="veu"></div>
<div class="painel n-painel">
  <div class="topo lin n-cabecalho"><img class="ic" src="{J}/interface/loja.png" width="38" height="38"><span style="font-size:23px;color:#4a2a12">Loja</span>
    <div style="flex:1"></div>
    <div class="lin n-pilula pil"><img class="ic" src="{J}/icones/ouro.png" width="26" height="26"><span class="num" style="font-size:17px">1.250</span></div>
    <div class="lin n-pilula pil"><img class="ic" src="{J}/icones/cash.png" width="26" height="26"><span class="num" style="font-size:17px">35</span></div>
  </div>
  <div class="ab f-botao-fechar-normal" style="right:-10px;top:-12px;width:46px;height:47px"></div>
  <div class="abas">{abas}</div>
  <div class="area n-painel-fundo">{''.join(cartao(*c) for c in CARTOES)}</div>
</div>
</body></html>
"""

open(f'{T}/tela.html', 'w').write(TELA)
open(f'{T}/loja.html', 'w').write(LOJA)
print('ok')
