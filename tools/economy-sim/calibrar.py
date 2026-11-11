#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ajusta a curva de XP (curva_xp em parametros.json) para bater as metas de ritmo.

Uso:  python3 -I calibrar.py            (imprime a curva sugerida; nao grava nada)
      python3 -I calibrar.py --gravar   (grava a curva em dados/parametros.json)

Metodo: ponto fixo. Roda as personas, le quanto XP cada uma acumulou nos dias-meta
e resolve, trecho a trecho, o expoente que faz o XP acumulado da curva coincidir
com esse total no nivel-meta. Repete algumas vezes, porque mudar a curva muda um
pouco o ritmo de desbloqueios (e portanto o XP ganho por dia).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import argparse
import copy
import json

import economia as E
import simular as S

# (persona, dia, nivel-meta fracionario). dia 0 = fim da primeira sessao.
# A primeira meta define a escala 'a'; cada uma das seguintes define o expoente de um trecho.
METAS = [
    ("regular", 0, 5.1),
    ("regular", 7, 16.6),
    ("regular", 30, 30.2),
    ("engajado", 96, 60.0),
]
QUEBRAS = [1, 4, 16, 30]      # inicio de cada trecho; o ultimo vai ate o teto
E0 = 1.8                      # expoente do primeiro trecho (fixo); 'a' absorve a escala


def acumulado(a, trechos, nivel_frac, teto):
    """XP acumulado ate o nivel fracionario, sem arredondamento."""
    def xp(n):
        x = a
        for i, (ini, exp) in enumerate(trechos):
            fim = trechos[i + 1][0] if i + 1 < len(trechos) else None
            ate = n if fim is None or n < fim else fim
            if ate > ini:
                x *= (float(ate) / ini) ** exp
            if fim is None or n < fim:
                break
        return x
    cheio = int(nivel_frac)
    return sum(xp(n) for n in range(1, cheio)) + (nivel_frac - cheio) * xp(cheio)


def resolver(a, trechos, k, alvo_xp, nivel_frac, teto):
    """Bissecao no expoente do trecho k para acumulado(nivel_frac) == alvo_xp."""
    lo, hi = 0.5, 6.0
    for _ in range(60):
        mid = 0.5 * (lo + hi)
        t = copy.deepcopy(trechos)
        t[k][1] = mid
        if acumulado(a, t, nivel_frac, teto) > alvo_xp:
            hi = mid
        else:
            lo = mid
    return 0.5 * (lo + hi)


def medir(P, personas):
    eco = E.Economia(parametros=P)
    xp = {}
    for pid, dias in (("regular", 30), ("engajado", max(m[1] for m in METAS if m[0] == "engajado"))):
        p = [x for x in personas if x["id"] == pid][0]
        sim = S.Sim(eco, p)
        sim.rodar(1)
        # XP ao fim da primeira sessao: reexecuta so ela
        sim0 = S.Sim(eco, p)
        h, dur = p["sessoes"][0]
        dur = p.get("primeira_sessao_min", dur)
        sim0.sessao(h * 60.0, dur, p["sessoes"][1][0] * 60.0, False)
        xp[(pid, 0)] = sim0.xp_tot
        sim = S.Sim(eco, p).rodar(dias)
        for r in sim.serie:
            xp[(pid, r["dia"])] = r["xp_total"]
        xp[(pid, "nivel")] = dict((r["dia"], r["nivel"]) for r in sim.serie)
        xp[(pid, "teto")] = sim.dia_teto
    return xp


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument("--ajuda", "-h", action="help")
    ap.add_argument("--gravar", action="store_true", help="grava a curva calibrada em dados/parametros.json")
    ap.add_argument("--voltas", type=int, default=6)
    args = ap.parse_args()
    P = E.carregar_json("parametros.json")
    personas = E.carregar_json("personas.json")["personas"]
    teto = P["geral"]["nivel_teto"]
    trechos = [[q, E0 if i == 0 else 2.5] for i, q in enumerate(QUEBRAS)]
    atual = P["curva_xp"]["trechos"]
    if [t[0] for t in atual] == QUEBRAS:
        trechos = copy.deepcopy(atual)
    a = P["curva_xp"]["a"]
    for volta in range(args.voltas):
        P["curva_xp"]["a"] = a
        P["curva_xp"]["trechos"] = trechos
        xp = medir(P, personas)
        nv_r = xp[("regular", "nivel")]
        print("volta %d: a=%.2f trechos=%s | regular 1a sessao XP=%d, D1 nv %d, D7 nv %d, D30 nv %d | engajado teto no dia %s"
              % (volta, a, [[q, round(e, 2)] for q, e in trechos], xp[("regular", 0)], nv_r[1], nv_r[7], nv_r[30], xp[("engajado", "teto")]))
        if volta == args.voltas - 1:
            break
        novo = copy.deepcopy(trechos)
        # 'a' pelo alvo da primeira sessao
        base = acumulado(1.0, novo, METAS[0][2], teto)
        a_novo = xp[(METAS[0][0], 0)] / base
        a = 0.5 * a + 0.5 * a_novo
        for k in range(1, len(QUEBRAS)):
            pid, dia, nv = METAS[k]
            e = resolver(a, novo, k, xp[(pid, dia)], nv, teto)
            novo[k][1] = 0.5 * trechos[k][1] + 0.5 * e
        trechos = novo
    a = round(a, 1)
    trechos = [[q, round(e, 2)] for q, e in trechos]
    print("\nCurva sugerida: a = %s ; trechos = %s" % (a, json.dumps(trechos)))
    if args.gravar:
        caminho = os.path.join(E.BASE, "dados", "parametros.json")
        with open(caminho, encoding="utf-8") as f:
            txt = f.read()
        import re
        txt = re.sub(r'("curva_xp": \{.*?"a": )[0-9.]+', lambda m: m.group(1) + str(a), txt, count=1, flags=re.S)
        txt = re.sub(r'("curva_xp": \{.*?"trechos": )\[\[.*?\]\]', lambda m: m.group(1) + json.dumps(trechos), txt, count=1, flags=re.S)
        with open(caminho, "w", encoding="utf-8") as f:
            f.write(txt)
        print("gravado em", caminho)


if __name__ == "__main__":
    main()
