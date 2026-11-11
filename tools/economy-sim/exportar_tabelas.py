#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Exporta as tabelas derivadas da economia.

Uso:  python3 -I exportar_tabelas.py

Le dados/conteudo.json e dados/parametros.json, aplica as formulas de economia.py
e grava:
  saida/tabelas/*.csv   (uma tabela por arquivo, para o codigo do jogo importar)
  saida/tabelas.md      (as mesmas tabelas em Markdown, para o documento)
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import csv

import economia as E


def tempo(m):
    if m < 1:
        return "%d s" % round(m * 60)
    if m < 60:
        return ("%g min" % m).replace(".", ",")
    h = m / 60.0
    if h < 48 and abs(h - round(h)) < 1e-9:
        return "%d h" % round(h)
    if h < 24:
        return "%d h %02d" % (int(h), round((h - int(h)) * 60))
    return ("%g h" % round(h, 1)).replace(".", ",")


def n(x):
    return "{:,}".format(int(round(x))).replace(",", ".")


def escreve_csv(pasta, nome, cab, linhas):
    with open(os.path.join(pasta, nome), "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(cab)
        for l in linhas:
            w.writerow(l)


def md_tabela(cab, linhas, alinh=None):
    out = ["| " + " | ".join(cab) + " |"]
    out.append("|" + "|".join((alinh[i] if alinh else "---") for i in range(len(cab))) + "|")
    for l in linhas:
        out.append("| " + " | ".join(str(x) for x in l) + " |")
    return "\n".join(out) + "\n"


def main():
    eco = E.Economia()
    P = eco.P
    pasta = os.path.join(E.BASE, "saida", "tabelas")
    if not os.path.isdir(pasta):
        os.makedirs(pasta)
    md = ["# Tabelas da economia (geradas)\n",
          "Geradas por `exportar_tabelas.py` a partir de `dados/conteudo.json` e `dados/parametros.json`. Não edite à mão.\n"]
    D, E_ = "---:", "---"

    # ----------------------------------------------------------------- niveis
    desb = eco.desbloqueios_por_nivel()
    linhas_csv, linhas_md = [], []
    ac = 0
    for L in range(1, eco.teto + 6):
        xp = eco.xp_prox(L)
        cash = E.faixa(P["nivel_recompensa"]["cash_por_faixa"], L) if L >= 2 else 0
        moedas = E.bonito(P["nivel_recompensa"]["mult_tv"] * eco.tv(L)) if L >= 2 else 0
        linhas_csv.append([L, xp, ac, int(round(eco.tv(L))), eco.vagas_pedidos(L), round(eco.espera_pedido(L), 1), moedas, cash,
                           " ; ".join(desb.get(L, []))])
        linhas_md.append([L if L <= eco.teto else "%d (mestre %d)" % (L, L - eco.teto), n(xp), n(ac), n(moedas), cash,
                          "; ".join(desb.get(L, [])) or ("—" if L <= eco.teto else "conteúdo mensal")])
        ac += xp
    escreve_csv(pasta, "niveis.csv", ["nivel", "xp_para_o_proximo", "xp_acumulado", "valor_alvo_pedido", "vagas_pedidos",
                                      "espera_pedido_min", "moedas_ao_chegar", "cash_ao_chegar", "desbloqueios"], linhas_csv)
    md.append("\n## Níveis: XP, recompensas e desbloqueios\n")
    md.append(md_tabela(["Nível", "XP para o próximo", "XP acumulado", "Moedas ao chegar", "Cash ao chegar", "Desbloqueia"], linhas_md,
                        [D, D, D, D, D, E_]))

    # --------------------------------------------------------------- culturas
    cs = sorted(eco.culturas.values(), key=lambda c: c["nivel"])
    cab = ["Cultura", "Nível", "Tempo", "Semente (moedas/canteiro)", "Rende (un./canteiro)", "Preço base (moedas/un.)",
           "XP por canteiro", "Lucro por canteiro", "Fase"]
    linhas = [[c["nome"], c["nivel"], tempo(c["tempo_min"]), c["semente"], c["rend"], c["valor"], c["xp"],
               c["rend"] * c["valor"] - c["semente"], "MVP" if c["mvp"] else "Lançamento"] for c in cs]
    escreve_csv(pasta, "culturas.csv", ["id", "nome", "nivel", "tempo_min", "semente", "rendimento", "preco_base", "xp", "mvp"],
                [[c["id"], c["nome"], c["nivel"], c["tempo_min"], c["semente"], c["rend"], c["valor"], c["xp"], int(c["mvp"])] for c in cs])
    md.append("\n## Culturas\n")
    md.append(md_tabela(cab, linhas, [E_, D, D, D, D, D, D, D, E_]))

    # ---------------------------------------------------------------- arvores
    ar = sorted(eco.arvores.values(), key=lambda a: a["nivel"])
    cab = ["Árvore", "Fruta", "Nível", "Amadurece em", "Colheita a cada", "Rende (un.)", "Preço base (moedas/un.)", "XP por colheita",
           "Mudas liberadas (nível: qtd × custo)", "Fase"]
    linhas = [[a["nome"], a["fruta_nome"], a["nivel"], tempo(a["maturacao_min"]), tempo(a["ciclo_min"]), a["rend"], a["valor"], a["xp"],
               "; ".join("nv %d: %d × %s" % (l["nivel"], l["qtd"], n(l["custo_unit"])) for l in a["lotes"]),
               "MVP" if a["mvp"] else "Lançamento"] for a in ar]
    escreve_csv(pasta, "arvores.csv", ["id", "nome", "fruta", "nivel", "maturacao_min", "ciclo_min", "rendimento", "preco_base", "xp",
                                       "lotes_nivel_qtd_custo", "mvp"],
                [[a["id"], a["nome"], a["fruta"], a["nivel"], a["maturacao_min"], a["ciclo_min"], a["rend"], a["valor"], a["xp"],
                  ";".join("%d:%d:%d" % (l["nivel"], l["qtd"], l["custo_unit"]) for l in a["lotes"]), int(a["mvp"])] for a in ar])
    md.append("\n## Árvores frutíferas\n")
    md.append(md_tabela(cab, linhas, [E_, E_, D, D, D, D, D, D, E_, E_]))

    # ---------------------------------------------------------------- animais
    an = sorted(eco.animais.values(), key=lambda a: a["nivel"])
    cab = ["Animal", "Abrigo", "Nível", "Produto", "Ciclo", "Come (1 por ciclo)", "Preço base do produto", "XP por coleta",
           "Lotes (nível: qtd, custo)", "Fase"]
    linhas = [[a["nome"], a["abrigo"], a["nivel"], a["produto_nome"], tempo(a["ciclo_min"]), eco.itens[a["racao"]]["nome"], a["valor"], a["xp"],
               "; ".join("nv %d: +%d, %s" % (l["nivel"], l["qtd"], n(l["custo"])) for l in a["lotes"]),
               "MVP" if a["mvp"] else "Lançamento"] for a in an]
    escreve_csv(pasta, "animais.csv", ["id", "nome", "abrigo", "nivel", "produto", "ciclo_min", "racao", "preco_base_produto", "xp",
                                       "lotes_nivel_qtd_custo", "mvp"],
                [[a["id"], a["nome"], a["abrigo"], a["nivel"], a["produto"], a["ciclo_min"], a["racao"], a["valor"], a["xp"],
                  ";".join("%d:%d:%d" % (l["nivel"], l["qtd"], l["custo"]) for l in a["lotes"]), int(a["mvp"])] for a in an])
    md.append("\n## Animais\n")
    md.append(md_tabela(cab, linhas, [E_, E_, D, E_, D, E_, D, D, E_, E_]))

    # ------------------------------------------------------------ construcoes
    bs = sorted(eco.construcoes.values(), key=lambda b: b["nivel"])
    vp = P["vagas_producao"]
    cab = ["Construção", "Nível", "Custo (moedas)", "Obra", "Receitas", "3ª vaga (nível, moedas, ferramentas)", "4ª e 5ª vagas", "Fase"]
    linhas = [[b["nome"], b["nivel"], n(b["custo"]), tempo(b["construcao_min"]), len(b["receitas"]),
               "nv %d, %s, %d" % (b["vaga3_nivel"], n(b["vaga3_custo"]), b["vaga3_ferramentas"]),
               "%d e %d cash, ou %s e %s itens feitos" % (vp["vaga4_cash"], vp["vaga5_cash"], n(vp["vaga4_maestria_itens"]), n(vp["vaga5_maestria_itens"])),
               "MVP" if b["mvp"] else "Lançamento"] for b in bs]
    escreve_csv(pasta, "construcoes.csv", ["id", "nome", "nivel", "custo", "construcao_min", "vaga3_nivel", "vaga3_custo", "vaga3_ferramentas", "mvp"],
                [[b["id"], b["nome"], b["nivel"], b["custo"], b["construcao_min"], b["vaga3_nivel"], b["vaga3_custo"], b["vaga3_ferramentas"], int(b["mvp"])] for b in bs])
    md.append("\n## Construções de processamento\n")
    md.append(md_tabela(cab, linhas, [E_, D, D, D, D, E_, E_, E_]))

    # ---------------------------------------------------------------- receitas
    ordem_b = dict((b["id"], i) for i, b in enumerate(bs))
    rs = sorted(eco.receitas.values(), key=lambda r: (ordem_b[r["construcao"]], r["nivel"]))
    cab = ["Construção", "Receita", "Nível", "Tempo", "Insumos", "Sai", "Custo dos insumos", "Preço base (moedas/un.)", "XP por fornada", "Fase"]
    linhas = []
    for r in rs:
        ins = ", ".join("%d %s" % (q, eco.itens[i]["nome"].lower()) for i, q in r["insumos"].items())
        custo = sum(eco.itens[i]["valor"] * q for i, q in r["insumos"].items())
        linhas.append([eco.construcoes[r["construcao"]]["nome"], r["nome"] + (" (ração, não entra em pedidos)" if r["racao"] else ""),
                       r["nivel"], tempo(r["tempo_min"]), ins, r["saida"], custo, r["valor"], r["xp"], "MVP" if r["mvp"] else "Lançamento"])
    escreve_csv(pasta, "receitas.csv", ["id", "nome", "construcao", "nivel", "tempo_min", "insumos", "saida", "preco_base", "xp", "racao", "mvp"],
                [[r["id"], r["nome"], r["construcao"], r["nivel"], r["tempo_min"],
                  ";".join("%s:%d" % (i, q) for i, q in r["insumos"].items()), r["saida"], r["valor"], r["xp"], int(r["racao"]), int(r["mvp"])] for r in rs])
    md.append("\n## Receitas\n")
    md.append(md_tabela(cab, linhas, [E_, E_, D, D, E_, D, D, D, D, E_]))

    # ------------------------------------------------------------------ terras
    cab = ["Expansão", "Nível", "Moedas", "Escrituras", "Canteiros novos", "Canteiros no total"]
    tot = P["inicio"]["canteiros"]
    linhas = []
    for t in eco.terras:
        tot += t["canteiros"]
        linhas.append([t["k"], t["nivel"], n(t["custo"]), t["escrituras"], t["canteiros"], tot])
    escreve_csv(pasta, "terras.csv", ["expansao", "nivel", "moedas", "escrituras", "canteiros_novos", "canteiros_total"],
                [[l[0], l[1], eco.terras[i]["custo"], l[3], l[4], l[5]] for i, l in enumerate(linhas)])
    md.append("\n## Expansões de terra\n")
    md.append(md_tabela(cab, linhas, [D] * 6))

    # ---------------------------------------------------------------- armazem
    a = P["armazem"]
    cab = ["Ampliação", "Capacidade depois", "Moedas", "Tábuas", "Tábuas acumuladas"]
    linhas = []
    cap = P["inicio"]["silo"]
    act = 0
    for j in range(1, 25):
        custo, tab = eco.custo_ampliacao(j)
        cap += a["passo"]
        act += tab
        linhas.append([j, cap, n(custo), tab, act])
    escreve_csv(pasta, "armazem.csv", ["ampliacao", "capacidade", "moedas", "tabuas", "tabuas_acumuladas"],
                [[l[0], l[1], eco.custo_ampliacao(l[0])[0], l[3], l[4]] for l in linhas])
    md.append("\n## Ampliações do silo e do celeiro (mesma tabela para os dois)\n")
    md.append(md_tabela(cab, linhas, [D] * 5))

    # -------------------------------------------------------------------- vila
    cab = ["Estágio", "Nível", "Moedas", "Obra", "XP", "Cash"]
    linhas = [[s["s"], s["nivel"], n(s["custo"]), tempo(s["obra_min"]), n(s["xp"]), s["cash"]] for s in eco.vila]
    escreve_csv(pasta, "vila.csv", ["estagio", "nivel", "moedas", "obra_min", "xp", "cash"],
                [[s["s"], s["nivel"], s["custo"], s["obra_min"], s["xp"], s["cash"]] for s in eco.vila])
    md.append("\n## Restauração do sítio e da vila\n")
    md.append(md_tabela(cab, linhas, [D] * 6))

    # ------------------------------------------------------- pedidos por nivel
    cab = ["Nível", "Vagas no quadro", "Valor-alvo do pedido (TV)", "Moedas do pedido (≈)", "XP do pedido (≈)", "Espera da vaga após entrega",
           "Pedidos para um nível (≈)"]
    p = P["pedidos"]
    linhas = []
    for L in (1, 3, 5, 8, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60):
        tv = eco.tv(L)
        linhas.append([L, eco.vagas_pedidos(L), n(tv), n(p["mult_moedas"] * tv), n(p["mult_xp"] * tv), tempo(round(eco.espera_pedido(L), 1)),
                       "%.0f" % (eco.xp_prox(L) / (p["mult_xp"] * tv))])
    md.append("\n## Quadro de pedidos por nível\n")
    md.append(md_tabela(cab, linhas, [D] * 7))

    # ----------------------------------------------------------------- acelerar
    cab = ["Tempo restante", "Cash", "Equivalente em R$ (10 cash = R$ 1)", "Cash por hora"]
    linhas = []
    for m in (1, 5, 10, 20, 30, 60, 120, 240, 480, 720, 1440, 2880):
        c = eco.preco_acelerar(m)
        linhas.append([tempo(m), c, ("%.2f" % (c / 10.0)).replace(".", ","), ("%.1f" % (c / (m / 60.0))).replace(".", ",")])
    escreve_csv(pasta, "acelerar.csv", ["minutos", "cash"], [[m, eco.preco_acelerar(m)] for m in (1, 2, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 360, 480, 720, 960, 1440, 2160, 2880)])
    md.append("\n## Preço de concluir um temporizador\n")
    md.append(md_tabela(cab, linhas, [D] * 4))

    # ------------------------------------------------------------------ itens
    its = sorted(eco.itens.values(), key=lambda i: (i["nivel"], i["id"]))
    escreve_csv(pasta, "itens.csv", ["id", "nome", "tipo", "nivel", "preco_base", "armazem", "entra_em_pedidos", "mvp"],
                [[i["id"], i["nome"], i["tipo"], i["nivel"], i["valor"], i["armazem"], int(i["pedido"]), int(i["mvp"])] for i in its])

    with open(os.path.join(E.BASE, "saida", "tabelas.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))

    # resumo no terminal + checagens
    vazios = [L for L in range(1, eco.teto + 1) if not desb.get(L)]
    print("tabelas gravadas em", pasta)
    print("niveis sem desbloqueio:", vazios or "nenhum")
    print("conteudo: %d culturas, %d arvores, %d animais, %d construcoes, %d receitas, %d expansoes de terra, %d estagios de vila"
          % (len(eco.culturas), len(eco.arvores), len(eco.animais), len(eco.construcoes), len(eco.receitas), len(eco.terras), len(eco.vila)))
    mvp = lambda d: sum(1 for x in d.values() if x["mvp"])
    print("no MVP: %d culturas, %d arvores, %d animais, %d construcoes, %d receitas"
          % (mvp(eco.culturas), mvp(eco.arvores), mvp(eco.animais), mvp(eco.construcoes), mvp(eco.receitas)))
    print("XP acumulado ate o nivel 30: %s ; ate o 60: %s" % (n(eco.xp_acumulado(30)), n(eco.xp_acumulado(60))))


if __name__ == "__main__":
    main()
