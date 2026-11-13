# lote.py <config.json>: corta, põe na escala, espelha, acha as fatias (iguais na família), alisa e grava.
import sys, json, os
sys.path.insert(0, '/root/arte-codex/ferramentas')
from nove import *
FIN = '/root/arte-codex/interface-final'
cfg = json.load(open(sys.argv[1]))
meta = json.load(open(FIN + '/_meta.json')) if os.path.exists(FIN + '/_meta.json') else {}
pecas = {}
for fonte in cfg:
    a = limpar(carregar('/root/arte-codex/' + fonte['arquivo']))
    lab, ps = partes(a)
    sel = ordenar(ps, len(fonte['pecas']), fonte.get('passo', 80))
    for p, c in zip(sel, fonte['pecas']):
        nome = c['nome']
        if nome == '-':
            continue
        pc = recortar(a, lab, p, folga=c.get('folga', 3))
        pc = escala_fator(pc, c['fator'])
        if c.get('espelhar', True):
            pc = espelhar(pc)
        if c.get('tipo') == 'fixa':
            pc = aparar(pc, 1, margem=c.get('margem', 8))
            salvar(pc, f'{FIN}/{nome}.png')
            meta[nome] = dict(tipo='fixa', origem=fonte['arquivo'])
            print(nome, pc.shape[1], 'x', pc.shape[0], 'fixa')
            continue
        if c.get('achatar'):
            pc = achatar_miolo(pc, tol=c.get('tol_achatar', 30))
        if c.get('achatar_linhas'):
            pc = achatar_linhas(pc, tol=c.get('tol_achatar', 28))
        brilho = (0, 0)
        if c.get('brilho'):
            brilho = borda_brilho(pc)
        f = (achar_fatias_forma if c.get('forma') else achar_fatias)(pc, tol=c.get('tol', 20.0))
        pecas[nome] = dict(pc=pc, f=f, c=c, fonte=fonte['arquivo'], brilho=brilho)
# famílias: fatias iguais (as maiores), descontado o brilho de fora
familias = {}
for nome, d in pecas.items():
    familias.setdefault(d['c'].get('familia', nome), []).append(nome)
for fam, nomes in familias.items():
    # mesmo tamanho na família (sem contar o brilho de fora): todos vão para o tamanho do primeiro
    alvo = None
    for n in nomes:
        d = pecas[n]; bx, by = d['brilho']; H, W = d['pc'].shape[:2]
        nucleo = (W - 2 * bx, H - 2 * by)
        if alvo is None:
            alvo = nucleo
        elif nucleo != alvo:
            if max(abs(nucleo[0] - alvo[0]) / alvo[0], abs(nucleo[1] - alvo[1]) / alvo[1]) < 0.04:
                d['pc'] = redimensionar(d['pc'], alvo[0] + 2 * bx, alvo[1] + 2 * by)
                print(f'  {n}: {nucleo} -> {alvo} (igual à família)')
            else:
                print(f'  AVISO {n}: tamanho {nucleo} diferente da família {alvo}')
    F = {}
    for k in ['topo', 'direita', 'baixo', 'esquerda']:
        F[k] = max(pecas[n]['f'][k] - (pecas[n]['brilho'][1] if k in ('topo', 'baixo') else pecas[n]['brilho'][0]) for n in nomes)
    F = arredondar3(F)
    if pecas[nomes[0]]['c'].get('fatias'):
        F = dict(pecas[nomes[0]]['c']['fatias'])
    so = pecas[nomes[0]]['c'].get('so')
    # meio: o menor que todos têm
    meio_w = min(pecas[n]['pc'].shape[1] - F['esquerda'] - F['direita'] - 2 * pecas[n]['brilho'][0] for n in nomes)
    meio_h = min(pecas[n]['pc'].shape[0] - F['topo'] - F['baixo'] - 2 * pecas[n]['brilho'][1] for n in nomes)
    meio = max(2, min(24, meio_w, meio_h if so != 'h' else 24))
    for n in nomes:
        d = pecas[n]; bx, by = d['brilho']
        # o brilho de fora conta como fatia a mais; arredonda o brilho para múltiplo de 3
        bx3, by3 = int(np.ceil(bx / 3) * 3), int(np.ceil(by / 3) * 3)
        pc = d['pc']
        if bx3 != bx or by3 != by:
            pc = np.pad(pc, ((by3 - by, by3 - by), (bx3 - bx, bx3 - bx), (0, 0)))
        f = {'topo': F['topo'] + by3, 'baixo': F['baixo'] + by3, 'esquerda': F['esquerda'] + bx3, 'direita': F['direita'] + bx3}
        out = pc if so == 'nenhum' else uniformizar(pc, f, meio_px=meio, so=so)
        if so == 'h':
            # alturas iguais na família: a menor
            pass
        salvar(out, f'{FIN}/{n}.png')
        meta[n] = dict(tipo='nove', fatias=f, origem=d['fonte'], familia=fam)
        if bx3 or by3:
            meta[n]['fora'] = dict(x=bx3, y=by3)
        print(f'{n:28s} {out.shape[1]:4d} x {out.shape[0]:4d}  {f}' + (f'  brilho {bx3},{by3}' if bx3 or by3 else ''))
json.dump(meta, open(FIN + '/_meta.json', 'w'), indent=1)
