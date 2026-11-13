import sys, json
sys.path.insert(0, '/root/arte-codex/ferramentas')
from nove import *
FIN = '/root/arte-codex/interface-final'
a = limpar(carregar('/root/arte-codex/interface-pecas-01/paineis.png'))
lab, ps = partes(a)
# ordem por área: painel, menu, balão, pílula, aviso
nomes = ['painel', 'menu-lista', 'balao', 'pilula', 'aviso']
fat = {'painel': 0.92, 'menu-lista': 0.80, 'balao': 1.0, 'pilula': 108 / 134, 'aviso': 84 / 96}
saida = {}
for nome, p in zip(nomes, ps[:5]):
    pc = recortar(a, lab, p)
    pc = escala_fator(pc, fat[nome])
    if nome == 'menu-lista':
        orig = pc.copy()
        pc = espelhar(pc)
        # o biquinho fica só à direita: devolve a faixa de cima do original (acima do corpo)
        x0, y0, x1, y1 = caixa(orig)
        # topo do corpo = primeira linha em que a coluna 1/4 da largura tem tinta
        col = orig[:, orig.shape[1] // 4, 3]
        topo_corpo = int(np.argmax(col > 128))
        W = orig.shape[1]
        reg = slice(0, topo_corpo + 14)
        pc[reg, W // 2:] = orig[reg, W // 2:]
    else:
        pc = espelhar(pc)
    f = achar_fatias(pc)
    saida[nome] = (pc, f)
    print(nome, pc.shape[1], 'x', pc.shape[0], f)
np.save(FIN + '/_lote01.npy', np.array([0]))
import pickle
pickle.dump(saida, open(FIN + '/_lote01.pkl', 'wb'))
