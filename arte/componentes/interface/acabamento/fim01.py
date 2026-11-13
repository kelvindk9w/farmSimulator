import sys, json, pickle
sys.path.insert(0, '/root/arte-codex/ferramentas')
from nove import *
FIN = '/root/arte-codex/interface-final'
s = pickle.load(open(FIN + '/_lote01.pkl', 'rb'))
meta = json.load(open(FIN + '/_meta.json')) if __import__('os').path.exists(FIN + '/_meta.json') else {}
for nome, (pc, f) in s.items():
    pc = achatar_miolo(pc)
    out, f2 = finalizar(pc, f)
    salvar(out, f'{FIN}/{nome}.png')
    meta[nome] = dict(fatias=f2, origem='interface-pecas-01/paineis.png')
    print(nome, out.shape[1], 'x', out.shape[0], f2)
    if nome == 'painel':
        m = miolo(out)
        mold = out.copy()
        mold[m, 3] = 0
        salvar(mold, f'{FIN}/painel-moldura.png')
        meta['painel-moldura'] = dict(fatias=f2, origem='interface-pecas-01/paineis.png (painel sem o miolo)')
        fundo = out.copy()
        suave = ndimage.gaussian_filter(m.astype(np.float32), 0.6)
        fundo[:, :, 3] = np.clip(suave * 255 * 1.0, 0, 255) * (out[:, :, 3] / 255.0)
        # a cor do fundo é a do miolo (sem a moldura escura vazando pela borda suave)
        cor = out[out.shape[0] // 2, out.shape[1] // 2, :3]
        borda = (suave > 0) & (~m)
        fundo[borda, :3] = cor
        fundo = aparar(fundo)
        ff = arredondar3(achar_fatias(fundo))
        fundo = uniformizar(fundo, ff, meio_px=24)
        salvar(fundo, f'{FIN}/painel-fundo.png')
        meta['painel-fundo'] = dict(fatias=ff, origem='interface-pecas-01/paineis.png (miolo do painel)')
        print('painel-fundo', fundo.shape[1], 'x', fundo.shape[0], ff)
json.dump(meta, open(FIN + '/_meta.json', 'w'), indent=1)
