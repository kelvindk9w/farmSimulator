#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Simulacao deterministica da economia e do ritmo de progressao.

Uso:  python3 -I simular.py            (todas as personas, 180 dias)
      python3 -I simular.py --ajuda    (opcoes)

Somente biblioteca padrao. O gerador pseudoaleatorio (pedidos do quadro) usa
semente fixa: a mesma entrada produz sempre a mesma saida.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import argparse
import csv
import json
import math
import random
from collections import defaultdict

import economia as E

DIA = 1440.0
JANELAS = [(1, 7), (8, 30), (31, 90), (91, 180)]


class Sim(object):
    def __init__(self, eco, persona, semente=20261111):
        self.e = eco
        self.P = eco.P
        self.p = persona
        self.rng = random.Random(semente)
        self.A = dict((k, v / 60.0) for k, v in self.P["acoes_seg"].items() if not k.startswith("_"))
        ini = self.P["inicio"]
        self.t = 0.0
        self.fim = 0.0
        self.prox_inicio = 0.0
        self.ajudante = False
        self.fc = 1.0  # fator de custo de tempo (0 durante a coleta do caseiro)
        self.nivel = 1
        self.xp = 0.0
        self.xp_tot = 0.0
        self.moedas = float(ini["moedas"])
        self.cash = float(ini["cash"])
        self.pecas = 0
        self.inv = defaultdict(int)
        self.n_arm = {"silo": 0, "celeiro": 0}
        self.cap = {"silo": ini["silo"], "celeiro": ini["celeiro"]}
        self.amp = {"silo": 0, "celeiro": 0}
        self.pico = {"silo": 0.0, "celeiro": 0.0}
        self.forcadas = {"silo": 0, "celeiro": 0}
        # canteiro: [cultura|None, pronto_em, giro_curto, livre_desde]
        self.plots = [[None, 0.0, False, 0.0] for _ in range(ini["canteiros"])]
        self.arv = []   # [id, pronto_em]
        self.ani = []   # [id, pronto_em|None]
        self.bld = {}   # id -> dict
        self.terras_n = 0
        self.lotes_ani = defaultdict(int)
        self.arv_n = defaultdict(int)
        self.vila_n = 0
        self.vila_livre_em = 0.0
        self.festa_semana = -1
        self.festa_cotas = 0
        self.pedidos = []
        self.cont_pedidos = 0
        self.maestria_h = defaultdict(float)
        self.estrelas = defaultdict(int)
        self.want = {}
        self.prio = {}
        self.livre = {}
        self.pos_pedidos = {}
        self.inprog = {}
        self._pools = None
        self._pools_sig = None
        self.feira_k = -1
        self.dia = 0
        self.dia_teto = None
        self.t_nivel = {1: 0.0}
        self.nivel_primeira_sessao = None
        self.cal_idx = 0
        self.frac_cash = 0.0
        self.passe_ativo = False
        self.caseiro = False
        self.caseiro_usado_hoje = False
        # contadores diarios
        self.zera_dia()
        # estatisticas acumuladas por dia (listas)
        self.serie = []
        self.xp_fonte = defaultdict(float)
        self.moeda_fonte = defaultdict(float)
        self.moeda_sumid = defaultdict(float)
        self.cash_fonte = defaultdict(float)
        self.cash_sumid = defaultdict(float)
        self.st = defaultdict(float)  # tempo: sessao, ocioso, giro, mini ; capacidade
        self.renda7 = []

    # ------------------------------------------------------------ utilidades
    def zera_dia(self):
        self.d_ped = 0
        self.d_colh = 0
        self.d_prod = 0
        self.d_moedas = 0.0
        self.d_xp = 0.0
        self.d_acel = 0
        self.d_acel_cash = 0.0
        self.d_bloq = 0
        self.d_mini = 0
        self.d_ads = defaultdict(int)
        self.d_ads_total = 0
        self.d_pendentes = 0
        self.d_baus_ajuda = 0

    def add_xp(self, q, fonte):
        if q <= 0:
            return
        if self.ajudante and fonte in ("colheita", "producao", "maestria"):
            # o que o ajudante colhe e coleta vai para o dono, mas o XP da acao nao: o ajudante ganha a diaria
            self.st["xp_nao_creditado_ajudante"] += q
            return
        self.xp += q
        self.xp_tot += q
        self.d_xp += q
        self.xp_fonte[fonte] += q
        e = self.e
        while self.xp >= e.xp_prox(self.nivel):
            self.xp -= e.xp_prox(self.nivel)
            self.nivel += 1
            self.subiu_nivel()

    def subiu_nivel(self):
        r = self.P["nivel_recompensa"]
        self.ganha(r["mult_tv"] * self.e.tv(self.nivel), "nivel")
        self.ganha_cash(E.faixa(r["cash_por_faixa"], self.nivel), "nivel")
        self.pecas += r["pecas"]
        self._pools_sig = None
        self.t_nivel[self.nivel] = self.t
        if self.dia_teto is None and self.nivel >= self.e.teto:
            self.dia_teto = self.dia + 1

    def ganha(self, q, fonte):
        self.moedas += q
        self.d_moedas += q
        self.moeda_fonte[fonte] += q

    def gasta(self, q, sumidouro):
        self.moedas -= q
        self.moeda_sumid[sumidouro] += q

    def ganha_cash(self, q, fonte):
        if q:
            self.cash += q
            self.cash_fonte[fonte] += q

    def gasta_cash(self, q, sumidouro):
        self.cash -= q
        self.cash_sumid[sumidouro] += q

    def entra(self, item, q):
        self.inv[item] += q
        arm = self.e.itens[item]["armazem"]
        self.n_arm[arm] += q
        oc = self.n_arm[arm] / float(self.cap[arm])
        if oc > self.pico[arm]:
            self.pico[arm] = oc

    def sai(self, item, q):
        self.inv[item] -= q
        self.n_arm[self.e.itens[item]["armazem"]] -= q

    def cabe(self, arm, q):
        return self.n_arm[arm] + q <= self.cap[arm]

    def bonus(self, item):
        return 1.0 + self.P["maestria"]["bonus_valor_por_estrela"] * self.estrelas.get(item, 0)

    def maestria(self, item, horas):
        m = self.P["maestria"]
        self.maestria_h[item] += horas
        it = self.e.itens[item]
        total = m["horas_5_estrelas"].get(it["tipo"])
        if not total:
            return
        s = self.estrelas[item]
        while s < 5 and self.maestria_h[item] >= m["fracoes"][s] * total:
            s += 1
            self.estrelas[item] = s
            self.add_xp(m["xp_por_estrela_x_nivel_item"] * it["nivel"] * s, "maestria")
            if s == 3:
                self.ganha_cash(m["cash_estrela3"], "maestria")
            elif s == 5:
                self.ganha_cash(m["cash_estrela5"], "maestria")

    def tem_tempo(self, custo):
        return self.t + custo * self.fc <= self.fim + 1e-9

    def anuncio_disponivel(self, ponto):
        if self.nivel < self.P["anuncios"]["desde_nivel"] or self.ajudante:
            return False
        for a in self.P["anuncios"]["pontos"]:
            if a["id"] == ponto:
                if self.d_ads[ponto] >= a["max_dia"]:
                    return False
                if self.passe_ativo and self.P["loja"]["passe"]["anuncio_sem_assistir"]:
                    return True
                return self.d_ads_total < self.p.get("anuncios_dia", 0)
        return False

    def usa_anuncio(self, ponto):
        self.d_ads[ponto] += 1
        if not (self.passe_ativo and self.P["loja"]["passe"]["anuncio_sem_assistir"]):
            self.d_ads_total += 1
            self.st["anuncios"] += 1

    # ------------------------------------------------------- armazem / banca
    def liberar_espaco(self, arm, n):
        """Vende excedente na banca (piso) para abrir espaco. True se couber depois."""
        a = self.P["armazem"]
        alvo = int(self.cap[arm] * a["vender_ate_ocupacao"])
        itens = self.e.itens
        self.forcadas[arm] += 1
        self.st["vendas_forcadas"] += 1
        cands = []
        for i, q in self.inv.items():
            if q > 0 and itens[i]["armazem"] == arm:
                livre = min(q, self.pos_pedidos.get(i, q))
                if livre > 0:
                    cands.append((livre, i))
        cands.sort(reverse=True)
        for livre, i in cands:
            excesso = self.n_arm[arm] - alvo
            if excesso <= 0:
                break
            q = min(livre, excesso)
            self.sai(i, q)
            if i in self.pos_pedidos:
                self.pos_pedidos[i] -= q
            if i in self.livre:
                self.livre[i] = max(0, self.livre[i] - q)
            self.ganha(q * itens[i]["valor"] * self.bonus(i) * self.P["banca"]["mult_moedas"], "banca")
            self.t += self.A["vender_banca"] * self.fc
            self.st["vendas_banca"] += 1
        return self.cabe(arm, n)

    # ------------------------------------------------------------- coletas
    def coletar_construcoes(self):
        agiu = False
        c = self.A["coletar_produto"]
        rec_t = self.e.receitas
        for bid, b in self.bld.items():
            q = b["q"]
            while q and q[0][1] <= self.t:
                if not self.tem_tempo(c):
                    return agiu
                rec = rec_t[q[0][0]]
                if not self.cabe("celeiro", rec["saida"]):
                    if not self.liberar_espaco("celeiro", rec["saida"]):
                        self.d_bloq += 1
                        break
                q.pop(0)
                self.entra(rec["id"], rec["saida"])
                self.add_xp(rec["xp"], "producao")
                self.maestria(rec["id"], rec["tempo_min"] / 60.0)
                b["feitos"] += rec["saida"]
                self.d_prod += 1
                self.t += c * self.fc
                agiu = True
        return agiu

    def coletar_animais(self):
        agiu = False
        c = self.A["coletar_animal"]
        for an in self.ani:
            if an[1] is not None and an[1] <= self.t:
                if not self.tem_tempo(c):
                    return agiu
                a = self.e.animais[an[0]]
                if not self.cabe("celeiro", 1):
                    if not self.liberar_espaco("celeiro", 1):
                        self.d_bloq += 1
                        break
                self.st["ani_ocioso"] += self.t - an[1]
                an[1] = None
                an[2] = self.t
                self.entra(a["produto"], 1)
                self.add_xp(a["xp"], "colheita")
                self.maestria(a["produto"], a["ciclo_min"] / 60.0)
                self.d_prod += 1
                self.t += c * self.fc
                agiu = True
        return agiu

    def colher(self):
        agiu = False
        c = self.A["colher"]
        cult = self.e.culturas
        for pl in self.plots:
            if pl[0] is not None and pl[1] <= self.t:
                if not self.tem_tempo(c):
                    return agiu
                cu = cult[pl[0]]
                if not self.cabe("silo", cu["rend"]):
                    if not self.liberar_espaco("silo", cu["rend"]):
                        self.d_bloq += 1
                        break
                self.st["plot_ocioso"] += self.t - pl[1]
                if pl[2]:
                    self.st["giro"] += c * self.fc
                self.entra(cu["id"], cu["rend"])
                self.add_xp(cu["xp"], "colheita")
                self.maestria(cu["id"], cu["tempo_min"] / 60.0)
                self.d_colh += 1
                pl[0] = None
                pl[2] = False
                pl[3] = self.t
                self.t += c * self.fc
                agiu = True
        return agiu

    def colher_arvores(self):
        agiu = False
        c = self.A["colher_arvore"]
        for tr in self.arv:
            if tr[1] <= self.t:
                if not self.tem_tempo(c):
                    return agiu
                a = self.e.arvores[tr[0]]
                if not self.cabe("silo", a["rend"]):
                    if not self.liberar_espaco("silo", a["rend"]):
                        self.d_bloq += 1
                        break
                self.entra(a["fruta"], a["rend"])
                self.add_xp(a["xp"], "colheita")
                self.maestria(a["fruta"], a["ciclo_min"] / 60.0)
                self.d_colh += 1
                tr[1] = self.t + a["ciclo_min"]
                self.t += c * self.fc
                agiu = True
        return agiu

    # --------------------------------------------------------------- pedidos
    def produzivel(self, iid, memo):
        if iid in memo:
            return memo[iid]
        it = self.e.itens[iid]
        tp = it["tipo"]
        ok = False
        if it["nivel"] <= self.nivel:
            if tp == "cultura":
                ok = True
            elif tp == "fruta":
                ok = self.arv_n.get(it["arvore"], 0) > 0
            elif tp == "animal":
                ok = self.lotes_ani.get(it["animal"], 0) > 0 and self.produzivel(self.e.animais[it["animal"]]["racao"], memo)
            else:
                b = self.bld.get(it["construcao"])
                if b is not None:
                    memo[iid] = False
                    ok = all(self.produzivel(i, memo) for i in self.e.receitas[iid]["insumos"])
        memo[iid] = ok
        return ok

    def pools(self):
        sig = (self.nivel, len(self.bld), len(self.ani), len(self.arv))
        if sig != self._pools_sig:
            memo = {}
            pools = {"cultura": [], "fruta": [], "animal": [], "processado": []}
            for iid, it in self.e.itens.items():
                if it["pedido"] and self.produzivel(iid, memo):
                    pools[it["tipo"]].append(iid)
            for k in pools:
                pools[k].sort()
            self._pools = pools
            self._pools_sig = sig
            alvo = self.P["bot"]["estoque_alvo_processado"]
            lst = sorted(pools["processado"], key=lambda i: -self.e.itens[i]["nivel"])
            self._alvos = [(i, alvo if self.e.receitas[i]["tempo_min"] < 180 else 1) for i in lst]
        return self._pools

    def qmax(self, iid):
        """Maior quantidade de um item numa linha de pedido: cai quando o item demora mais para sair."""
        it = self.e.itens[iid]
        tp = it["tipo"]
        if tp == "cultura":
            T = self.e.culturas[iid]["tempo_min"]
        elif tp == "fruta":
            T = self.e.arvores[it["arvore"]]["ciclo_min"]
        elif tp == "animal":
            T = self.e.animais[it["animal"]]["ciclo_min"]
        else:
            T = self.e.receitas[iid]["tempo_min"]
        return E.faixa(self.P["pedidos"]["qmax"][tp], T)

    def gerar_pedido(self):
        p = self.P["pedidos"]
        rng = self.rng
        itens = self.e.itens
        pools = self.pools()
        pesos_l = E.faixa(p["linhas_por_nivel"], self.nivel)
        x = rng.random()
        n = 1
        ac = 0.0
        for k, w in enumerate(pesos_l):
            ac += w
            if x <= ac:
                n = k + 1
                break
        tv = self.e.tv(self.nivel) * rng.uniform(p["variacao"][0], p["variacao"][1])
        alvo = tv / n
        usados = set()
        for sl in self.pedidos:
            if sl["ordem"] is not None:
                for i, _q in sl["ordem"]["linhas"]:
                    usados.add(i)
        qmax = self.qmax
        linhas = []
        for _ in range(n):
            cats = [c for c in ("cultura", "fruta", "animal", "processado") if pools[c]]
            if not cats:
                break
            # so entram itens cujo lote maximo vale ao menos 40% da linha
            cand_cat = {}
            for c in cats:
                lst = [i for i in pools[c] if i not in usados and itens[i]["valor"] * qmax(i) >= 0.4 * alvo]
                if lst:
                    cand_cat[c] = lst
            if not cand_cat:
                for c in cats:
                    lst = [i for i in pools[c] if i not in usados]
                    if lst:
                        # o mais valioso da categoria
                        cand_cat[c] = [max(lst, key=lambda i: itens[i]["valor"])]
                if not cand_cat:
                    break
            tot = sum(p["pesos_categoria"][c] for c in cand_cat)
            x = rng.random() * tot
            ac = 0.0
            cat = None
            for c in ("cultura", "fruta", "animal", "processado"):
                if c in cand_cat:
                    ac += p["pesos_categoria"][c]
                    cat = c
                    if x <= ac:
                        break
            cand = cand_cat[cat]
            if rng.random() < p["vies_estoque"]:
                em = [i for i in cand if self.inv.get(i, 0) > 0]
                if em:
                    cand = em
            pesos = [1.0 + (p["peso_novidade"] if self.nivel - itens[i]["nivel"] <= p["janela_novidade_niveis"] else 0.0) for i in cand]
            x = rng.random() * sum(pesos)
            ac = 0.0
            item = cand[-1]
            for i, w in zip(cand, pesos):
                ac += w
                if x <= ac:
                    item = i
                    break
            q = int(round(alvo / itens[item]["valor"]))
            q = max(1, min(qmax(item), q))
            linhas.append((item, q))
            usados.add(item)
        valor = sum(itens[i]["valor"] * q for i, q in linhas)
        return dict(linhas=linhas, valor=valor, xp=max(1, int(round(p["mult_xp"] * valor))), criado=self.t)

    def repor_pedidos(self):
        n = self.e.vagas_pedidos(self.nivel)
        while len(self.pedidos) < n:
            self.pedidos.append(dict(ordem=None, livre_em=self.t))
        for s in self.pedidos:
            if s["ordem"] is None and s["livre_em"] <= self.t:
                s["ordem"] = self.gerar_pedido()

    def entregar(self):
        agiu = False
        c = self.A["entregar_pedido"]
        p = self.P["pedidos"]
        itens = self.e.itens
        inv = self.inv
        for s in self.pedidos:
            o = s["ordem"]
            if o is None:
                continue
            if all(inv.get(i, 0) >= q for i, q in o["linhas"]):
                if not self.tem_tempo(c):
                    return agiu
                moedas = 0.0
                for i, q in o["linhas"]:
                    self.sai(i, q)
                    moedas += q * itens[i]["valor"] * self.bonus(i)
                moedas *= p["mult_moedas"]
                self.ganha(moedas, "pedidos")
                if self.anuncio_disponivel("dobrar_pedido"):
                    self.usa_anuncio("dobrar_pedido")
                    self.ganha(moedas, "anuncios")
                self.add_xp(o["xp"], "pedidos")
                self.cont_pedidos += 1
                self.d_ped += 1
                if self.cont_pedidos % p["pecas_a_cada_pedidos"] == 0:
                    self.pecas += 1
                s["ordem"] = None
                s["livre_em"] = self.t + self.e.espera_pedido(self.nivel)
                self.t += c * self.fc
                agiu = True
            elif self.t - o["criado"] > p["descartar_apos_min"]:
                s["ordem"] = None
                s["livre_em"] = self.t + p["mult_espera_descarte"] * self.e.espera_pedido(self.nivel)
                self.st["descartes"] += 1
        return agiu

    # ---------------------------------------------------------- planejamento
    def planejar(self):
        e = self.e
        itens = e.itens
        receitas = e.receitas
        avail = dict((k, v) for k, v in self.inv.items() if v > 0)
        inprog = defaultdict(int)
        for pl in self.plots:
            if pl[0] is not None:
                inprog[pl[0]] += e.culturas[pl[0]]["rend"]
        for b in self.bld.values():
            for r, _ in b["q"]:
                inprog[r] += receitas[r]["saida"]
        for an in self.ani:
            if an[1] is not None:
                inprog[e.animais[an[0]]["produto"]] += 1
        for tr in self.arv:
            if tr[1] <= self.t + 120:
                a = e.arvores[tr[0]]
                inprog[a["fruta"]] += a["rend"]
        self.inprog = dict(inprog)
        want = defaultdict(int)
        prio = {}

        def req(item, q, rank):
            a = avail.get(item, 0)
            if a > 0:
                u = a if a < q else q
                avail[item] = a - u
                q -= u
                if q <= 0:
                    return
            a = inprog.get(item, 0)
            if a > 0:
                u = a if a < q else q
                inprog[item] = a - u
                q -= u
                if q <= 0:
                    return
            want[item] += q
            if item not in prio:
                prio[item] = rank
            it = itens[item]
            tp = it["tipo"]
            if tp == "processado" or tp == "racao":
                rec = receitas[item]
                nb = -(-q // rec["saida"])
                for inp, qi in rec["insumos"].items():
                    req(inp, qi * nb, rank)
            elif tp == "animal":
                req(e.animais[it["animal"]]["racao"], q, rank)

        ordens = [s["ordem"] for s in self.pedidos if s["ordem"] is not None]
        ordens.sort(key=lambda o: o["criado"])
        rank = 0
        for o in ordens:
            for item, q in o["linhas"]:
                req(item, q, rank)
            rank += 1
        self.pos_pedidos = dict(avail)
        bot = self.P["bot"]
        cab = defaultdict(int)
        for an in self.ani:
            cab[an[0]] += 1
        for aid, n in cab.items():
            a = e.animais[aid]
            req(a["produto"], int(math.ceil(n * bot["estoque_alvo_animal_por_cabeca"])), 100)
            req(a["racao"], int(math.ceil(n * bot["estoque_alvo_racao_por_cabeca"])), 101)
        self.pools()
        rank = 200
        for item, alvo in self._alvos:
            req(item, alvo, rank)
            rank += 1
        self.want = want
        self.prio = prio
        self.livre = avail

    # -------------------------------------------------------------- producao
    def enfileirar(self):
        agiu = False
        c = self.A["enfileirar"]
        want, prio, inv = self.want, self.prio, self.inv
        receitas = self.e.receitas
        for bid, b in self.bld.items():
            if b["pronto_em"] > self.t:
                continue
            livres = b["vagas"] + b["extra"] + (self.P["loja"]["passe"]["vaga_extra_fila"] if self.passe_ativo else 0) - len(b["q"])
            if livres <= 0:
                continue
            cands = [r for r in self.e.construcoes[bid]["receitas"] if want.get(r, 0) > 0]
            if not cands:
                continue
            cands.sort(key=lambda r: prio.get(r, 999))
            for rid in cands:
                rec = receitas[rid]
                baixa = prio.get(rid, 999) >= 100
                while livres > 0 and want.get(rid, 0) > 0:
                    if baixa:
                        ok = all(self.pos_pedidos.get(i, 0) >= q and inv.get(i, 0) >= q for i, q in rec["insumos"].items())
                    else:
                        ok = all(inv.get(i, 0) >= q for i, q in rec["insumos"].items())
                    if not ok:
                        break
                    if not self.tem_tempo(c):
                        return agiu
                    for i, q in rec["insumos"].items():
                        self.sai(i, q)
                        if i in self.pos_pedidos:
                            self.pos_pedidos[i] = max(0, self.pos_pedidos[i] - q)
                    ini = max(self.t, b["q"][-1][1]) if b["q"] else self.t
                    b["q"].append([rid, ini + rec["tempo_min"]])
                    self.st["bld_ocupado"] += rec["tempo_min"]
                    want[rid] -= rec["saida"]
                    livres -= 1
                    self.t += c * self.fc
                    agiu = True
        return agiu

    def alimentar(self):
        agiu = False
        c = self.A["alimentar"]
        want, inv = self.want, self.inv
        for an in self.ani:
            if an[1] is None:
                a = self.e.animais[an[0]]
                if want.get(a["produto"], 0) <= 0:
                    continue
                if inv.get(a["racao"], 0) <= 0:
                    continue
                if not self.tem_tempo(c):
                    return agiu
                self.sai(a["racao"], 1)
                self.st["ani_ocioso"] += self.t - an[2]
                an[1] = self.t + a["ciclo_min"]
                want[a["produto"]] -= 1
                self.t += c * self.fc
                agiu = True
        return agiu

    def plantar_um(self, pl, cid, giro):
        c = self.A["plantar"]
        if not self.tem_tempo(c):
            return False
        cu = self.e.culturas[cid]
        if self.moedas < cu["semente"]:
            cu = self.e.culturas["milho"]  # milho nunca trava: semente de graca se faltar moeda
            if self.moedas >= cu["semente"]:
                self.gasta(cu["semente"], "sementes")
        else:
            self.gasta(cu["semente"], "sementes")
        self.st["plot_ocioso"] += self.t - pl[3]
        pl[0] = cu["id"]
        pl[1] = self.t + cu["tempo_min"]
        pl[2] = giro
        if giro:
            self.st["giro"] += c * self.fc
        self.t += c * self.fc
        return True

    def curta_que_cabe(self):
        """Maior cultura que ainda da para colher dentro desta sessao (deixando tempo para replantar tudo)."""
        resta = self.fim - self.t
        reserva = len(self.plots) * (self.A["colher"] + self.A["plantar"]) + 0.3
        melhor = None
        desejada = None
        if self.p.get("giro_modo") == "mais_rapida":
            return self.e.culturas["milho"] if 1.0 <= resta - reserva else None
        for cu in self._cult_lib:
            if cu["tempo_min"] <= resta - reserva:
                if melhor is None or cu["tempo_min"] > melhor["tempo_min"]:
                    melhor = cu
                if self.want.get(cu["id"], 0) > 0 and (desejada is None or self.prio.get(cu["id"], 999) < self.prio.get(desejada["id"], 999)):
                    desejada = cu
        return desejada or melhor

    def cultura_de_intervalo(self):
        """Cultura para deixar plantada ate a proxima sessao: a mais longa que fica pronta a tempo.
        Se ja ha muito dela no silo, aceita outra que ocupe ao menos metade do intervalo."""
        limite = self.P["bot"]["limite_estoque_cultura_padrao"]
        gap = self.prox_inicio - self.t + 5.0
        cabem = [cu for cu in self._cult_lib if cu["tempo_min"] <= gap]
        if not cabem:
            return "milho"
        cabem.sort(key=lambda cu: -cu["tempo_min"])
        maior = cabem[0]
        for cu in cabem:
            if cu["tempo_min"] < 0.5 * maior["tempo_min"]:
                break
            if self.inv.get(cu["id"], 0) + self.inprog.get(cu["id"], 0) <= limite:
                return cu["id"]
        return maior["id"]

    def plantar(self):
        livres = [(i, pl) for i, pl in enumerate(self.plots) if pl[0] is None]
        if not livres:
            return False
        agiu = False
        want, prio = self.want, self.prio
        itens = self.e.itens
        cult = self.e.culturas
        self._cult_lib = [cu for cu in cult.values() if cu["nivel"] <= self.nivel]
        frac = 0.0 if self.ajudante else self.p.get("ciclos_curtos", 0.0)
        n_giro = int(math.ceil(frac * len(self.plots)))
        # 1) canteiros de giro: cultura curta que cabe na sessao (de preferencia uma que esteja em falta)
        normais = []
        for i, pl in livres:
            if i < n_giro:
                cu = self.curta_que_cabe()
                if cu is not None:
                    if not self.plantar_um(pl, cu["id"], True):
                        return agiu
                    self.inprog[cu["id"]] = self.inprog.get(cu["id"], 0) + cu["rend"]
                    if want.get(cu["id"], 0) > 0:
                        want[cu["id"]] -= cu["rend"]
                    agiu = True
                    continue
            normais.append(pl)
        # 2) demais canteiros: primeiro o que falta para pedidos e estoques, depois a cultura de intervalo
        lista = sorted((prio.get(i, 999), i) for i, q in want.items() if q > 0 and itens[i]["tipo"] == "cultura" and itens[i]["nivel"] <= self.nivel)
        k = 0
        for _, cid in lista:
            rend = cult[cid]["rend"]
            n = -(-want[cid] // rend)
            while n > 0 and k < len(normais):
                if not self.plantar_um(normais[k], cid, False):
                    return agiu
                self.inprog[cid] = self.inprog.get(cid, 0) + rend
                want[cid] -= rend
                agiu = True
                k += 1
                n -= 1
        while k < len(normais):
            cid = self.cultura_de_intervalo()
            if not self.plantar_um(normais[k], cid, False):
                return agiu
            self.inprog[cid] = self.inprog.get(cid, 0) + cult[cid]["rend"]
            agiu = True
            k += 1
        return agiu

    # --------------------------------------------------------------- compras
    def reserva_moedas(self):
        maior = 1
        for cu in self.e.culturas.values():
            if cu["nivel"] <= self.nivel and cu["semente"] > maior:
                maior = cu["semente"]
        return self.P["bot"]["reserva_sementes_ciclos"] * len(self.plots) * maior

    def comprar(self):
        """Compras do dono. Classes de prioridade: 0 = construcoes e animais (capacidade de producao),
        1 = terra, arvores e 3a vaga, 2 = armazem, 3 = vila e festa. Uma classe so gasta o que sobra
        depois de reservar o custo das compras pendentes das classes anteriores (o jogador poupa)."""
        e = self.e
        L = self.nivel
        cands = []
        for b in e.construcoes.values():
            if b["nivel"] <= L and b["id"] not in self.bld:
                cands.append((0, b["custo"], 0, "constr", b["id"]))
        for a in e.animais.values():
            k = self.lotes_ani[a["id"]]
            if k < len(a["lotes"]) and a["lotes"][k]["nivel"] <= L:
                cands.append((0, a["lotes"][k]["custo"], 0, "animal", a["id"]))
        pecas_terra = 0
        if self.terras_n < len(e.terras):
            tr = e.terras[self.terras_n]
            if tr["nivel"] <= L:
                cands.append((1, tr["custo"], tr["escrituras"], "terra", None))
                pecas_terra = tr["escrituras"]
        for a in e.arvores.values():
            tem = self.arv_n[a["id"]]
            perm = 0
            for lt in a["lotes"]:
                if lt["nivel"] <= L:
                    perm += lt["qtd"]
            if tem < perm:
                ac = 0
                for lt in a["lotes"]:
                    ac += lt["qtd"]
                    if tem < ac:
                        cands.append((1, lt["custo_unit"], 0, "arvore", a["id"]))
                        break
        for bid, b in self.bld.items():
            c = e.construcoes[bid]
            if b["vagas"] == self.P["vagas_producao"]["iniciais"] and L >= c["vaga3_nivel"]:
                cands.append((1, c["vaga3_custo"], c["vaga3_ferramentas"], "vaga3", bid))
        a = self.P["armazem"]
        for arm in ("silo", "celeiro"):
            if self.forcadas[arm] >= a["ampliar_apos_vendas_forcadas"]:
                custo, tab = e.custo_ampliacao(self.amp[arm] + 1)
                cands.append((2, custo, tab, "armazem", arm))
        v = self.P["vila"]
        if self.vila_n < len(e.vila):
            st = e.vila[self.vila_n]
            if st["nivel"] <= L and self.vila_livre_em <= self.t:
                cands.append((3, st["custo"], 0, "vila", None))
        elif L >= v["festa_semanal_desde_nivel"]:
            if self.dia // 7 != self.festa_semana:
                self.festa_semana = self.dia // 7
                self.festa_cotas = 0
            if self.festa_cotas < v["festa_cotas_semana"]:
                cands.append((3, E.bonito(v["festa_mult_ref_cota"] * e.ref(min(L, e.teto))), 0, "festa_vila", None))
        if not cands:
            self.d_pendentes = 0
            return False
        cands.sort()
        agiu = False
        reserva = self.reserva_moedas()
        pend = 0
        comprometido = 0.0      # custo das pendencias das classes anteriores
        comp_classe = 0.0
        classe_atual = 0
        pg = self.p.get("pagamento") or {}
        for classe, custo, pecas, tipo, ref in cands:
            if classe != classe_atual:
                comprometido += comp_classe
                comp_classe = 0.0
                classe_atual = classe
            # pecas: a terra tem preferencia; armazem e vagas usam o que sobra
            pecas_livres = self.pecas if tipo == "terra" else self.pecas - pecas_terra
            if pecas_livres < pecas and pg.get("compra_pecas") and tipo in ("terra", "vaga3") and self.moedas - reserva - comprometido >= custo:
                falta = pecas - pecas_livres
                preco = falta * self.P["loja"]["peca_cash"]
                if self.cash >= preco:
                    self.gasta_cash(preco, "pecas")
                    self.pecas += falta
                    pecas_livres += falta
            if pecas_livres < pecas:
                self.st["falta_pecas"] += 1
                continue
            if self.moedas - reserva - comprometido < custo:
                pend += 1
                if classe <= 1:
                    comp_classe += custo
                continue
            if not self.tem_tempo(self.A["comprar"]):
                break
            self.gasta(custo, tipo)
            self.pecas -= pecas
            if tipo == "terra":
                pecas_terra = 0
            self.t += self.A["comprar"] * self.fc
            agiu = True
            self._pools_sig = None
            if tipo == "constr":
                self.bld[ref] = dict(vagas=self.P["vagas_producao"]["iniciais"], extra=0, q=[], feitos=0,
                                     pronto_em=self.t + e.construcoes[ref]["construcao_min"], desde=self.t)
            elif tipo == "animal":
                lt = e.animais[ref]["lotes"][self.lotes_ani[ref]]
                self.lotes_ani[ref] += 1
                for _ in range(lt["qtd"]):
                    self.ani.append([ref, None, self.t])
            elif tipo == "terra":
                tr = e.terras[self.terras_n]
                self.terras_n += 1
                for _ in range(tr["canteiros"]):
                    self.plots.append([None, 0.0, False, self.t])
            elif tipo == "arvore":
                a2 = e.arvores[ref]
                self.arv_n[ref] += 1
                self.arv.append([ref, self.t + a2["maturacao_min"]])
            elif tipo == "vaga3":
                self.bld[ref]["vagas"] += 1
            elif tipo == "armazem":
                self.amp[ref] += 1
                self.cap[ref] += a["passo"]
                self.pico[ref] = self.n_arm[ref] / float(self.cap[ref])
                self.forcadas[ref] = 0
            elif tipo == "vila":
                st = e.vila[self.vila_n]
                self.vila_n += 1
                self.vila_livre_em = self.t + st["obra_min"]
                self.add_xp(st["xp"], "vila")
                self.ganha_cash(st["cash"], "vila")
                if self.vila_n >= v["caseiro_no_estagio"]:
                    self.caseiro = True
            elif tipo == "festa_vila":
                self.festa_cotas += 1
                self.add_xp(v["festa_cota_mult_tv_xp"] * e.tv(L), "vila")
                if self.festa_cotas == v["festa_cotas_semana"]:
                    self.ganha_cash(v["festa_cash"], "vila")
        self.d_pendentes = pend
        return agiu

    # ----------------------------------------------------------------- feira
    def feira(self):
        f = self.P["feira"]
        if self.nivel < 3:
            return False
        k = int(self.t // f["reabastece_min"])
        if k == self.feira_k:
            return False
        if not self.tem_tempo(self.A["feira"]):
            return False
        self.feira_k = k
        agiu = False
        itens = self.e.itens
        melhor = None
        mv = 0
        for i, q in self.livre.items():
            if q > 0 and itens[i]["pedido"]:
                qq = min(q, self.inv.get(i, 0), f["fregues_qtd"])
                v = qq * itens[i]["valor"]
                if v > mv:
                    mv = v
                    melhor = (i, qq)
        if melhor:
            i, q = melhor
            self.sai(i, q)
            self.livre[i] -= q
            if i in self.pos_pedidos:
                self.pos_pedidos[i] = max(0, self.pos_pedidos[i] - q)
            self.ganha(mv * self.bonus(i) * f["fregues_mult_moedas"], "feira")
            self.add_xp(mv * f["fregues_mult_xp"], "feira")
            self.st["fregueses"] += 1
            self.t += self.A["feira"] * self.fc
            agiu = True
        # oferta de insumo bruto: um item bruto sorteado; compra se for necessario para um pedido
        pools = self.pools()
        brutos = pools["cultura"] + pools["fruta"] + pools["animal"]
        if brutos:
            i = brutos[self.rng.randrange(len(brutos))]
            if self.want.get(i, 0) > 0 and self.prio.get(i, 999) < 100:
                q = min(f["oferta_qtd"], self.want[i])
                custo = q * itens[i]["valor"] * f["oferta_mult_preco"]
                arm = itens[i]["armazem"]
                if self.moedas - self.reserva_moedas() >= custo and self.cabe(arm, q) and self.tem_tempo(self.A["feira"]):
                    self.gasta(custo, "feira")
                    self.entra(i, q)
                    self.want[i] -= q
                    self.t += self.A["feira"] * self.fc
                    agiu = True
        return agiu

    # ------------------------------------------------------- cash e anuncios
    def acelerar_fila(self, b, minutos):
        for it in b["q"]:
            it[1] -= minutos

    def usar_cash_e_anuncios(self):
        agiu = False
        vp = self.P["vagas_producao"]
        # vagas por maestria da construcao (caminho gratis) ou por cash
        for bid, b in self.bld.items():
            if b["extra"] == 0 and b["feitos"] >= vp["vaga4_maestria_itens"]:
                b["extra"] = 1
                b["extra_gratis"] = 1
            elif b["extra"] == 1 and b["feitos"] >= vp["vaga5_maestria_itens"]:
                b["extra"] = 2
        if self.bld:
            # compra de vaga com cash: a construcao mais usada primeiro
            ordem = sorted(self.bld.items(), key=lambda kv: -kv[1]["feitos"])
            for bid, b in ordem:
                if b["vagas"] < 3 or b["pronto_em"] > self.t:
                    continue
                if b["extra"] == 0 and self.cash >= vp["vaga4_cash"]:
                    self.gasta_cash(vp["vaga4_cash"], "vagas")
                    b["extra"] = 1
                    agiu = True
                elif b["extra"] == 1 and self.p.get("pagamento") and self.cash >= vp["vaga5_cash"]:
                    self.gasta_cash(vp["vaga5_cash"], "vagas")
                    b["extra"] = 2
                    agiu = True
        # anuncio: acelerar 20 min a fila com mais tempo restante
        for a in self.P["anuncios"]["pontos"]:
            if a["id"] == "acelerar":
                while self.anuncio_disponivel("acelerar"):
                    alvo = None
                    resta = 5.0
                    for b in self.bld.values():
                        if b["q"] and b["q"][0][1] - self.t > resta:
                            resta = b["q"][0][1] - self.t
                            alvo = b
                    if alvo is None:
                        break
                    self.usa_anuncio("acelerar")
                    self.acelerar_fila(alvo, min(a["minutos"], resta))
                    agiu = True
        # cash: concluir temporizadores (teto diario)
        pg = self.p.get("pagamento")
        if pg and pg.get("acelerar_cash_dia", 0) > 0:
            ac = self.P["acelerar"]
            while self.d_acel < ac["max_por_dia"]:
                alvo = None
                resta = 10.0
                tipo = None
                for b in self.bld.values():
                    if b["pronto_em"] - self.t > resta:
                        resta = b["pronto_em"] - self.t
                        alvo = b
                        tipo = "obra"
                    if b["q"] and b["q"][0][1] - self.t > resta:
                        resta = b["q"][0][1] - self.t
                        alvo = b
                        tipo = "fila"
                if alvo is None:
                    break
                preco = self.e.preco_acelerar(resta)
                if preco > self.cash or self.d_acel_cash + preco > pg["acelerar_cash_dia"]:
                    break
                self.gasta_cash(preco, "acelerar")
                self.d_acel += 1
                self.d_acel_cash += preco
                self.st["min_acelerados"] += resta
                if tipo == "obra":
                    alvo["pronto_em"] = self.t
                else:
                    self.acelerar_fila(alvo, resta)
                agiu = True
        return agiu

    # -------------------------------------------------------------- sessoes
    def proximo_evento(self):
        t = self.t
        m = None
        for pl in self.plots:
            if pl[0] is not None and pl[1] > t and (m is None or pl[1] < m):
                m = pl[1]
        for b in self.bld.values():
            if b["pronto_em"] > t and (m is None or b["pronto_em"] < m):
                m = b["pronto_em"]
            for it in b["q"]:
                if it[1] > t:
                    if m is None or it[1] < m:
                        m = it[1]
                    break
        for an in self.ani:
            if an[1] is not None and an[1] > t and (m is None or an[1] < m):
                m = an[1]
        for tr in self.arv:
            if tr[1] > t and (m is None or tr[1] < m):
                m = tr[1]
        if not self.ajudante:
            for s in self.pedidos:
                if s["ordem"] is None and s["livre_em"] > t and (m is None or s["livre_em"] < m):
                    m = s["livre_em"]
            if self.nivel >= 3:
                f = self.P["feira"]["reabastece_min"]
                prox = (math.floor(t / f) + 1) * f
                if m is None or prox < m:
                    m = prox
        return m

    def minijogar(self, espera):
        """Usa tempo de espera em minijogos (se houver tentativas). Devolve minutos usados."""
        mj = self.P["minijogos"]
        if self.ajudante or self.nivel < mj["desde_nivel"]:
            return 0.0
        usado = 0.0
        limite = min(self.p.get("minijogos_dia", 0), mj["gratis_por_dia"])
        while espera - usado >= mj["dur_min"]:
            if self.d_mini >= limite:
                if self.anuncio_disponivel("minijogo_extra"):
                    self.usa_anuncio("minijogo_extra")
                else:
                    break
            self.d_mini += 1
            tv = self.e.tv(self.nivel)
            self.ganha(mj["mult_tv_moedas"] * tv, "minijogos")
            self.add_xp(mj["mult_tv_xp"] * tv, "minijogos")
            usado += mj["dur_min"]
        self.st["mini"] += usado
        return usado

    def sessao(self, t0, dur, prox_inicio, ajudante):
        self.ajudante = ajudante
        self.fim = t0 + dur
        self.prox_inicio = prox_inicio
        self.t = t0 + self.A["abertura_sessao"]
        if not ajudante:
            self.st["sessao"] += dur
        self.planejar()
        if not ajudante:
            self.repor_pedidos()
            if self.anuncio_disponivel("bau_do_dia"):
                self.usa_anuncio("bau_do_dia")
                for a in self.P["anuncios"]["pontos"]:
                    if a["id"] == "bau_do_dia":
                        self.ganha(a["moedas_tv"] * self.e.tv(self.nivel), "anuncios")
                        self.pecas += a["pecas"]
                        self.ganha_cash(a["cash"], "anuncios")
            usa_caseiro = self.passe_ativo and self.P["loja"]["passe"]["caseiro"]
            if not usa_caseiro and self.caseiro and not self.caseiro_usado_hoje:
                usa_caseiro = True
                self.caseiro_usado_hoje = True
            if usa_caseiro:
                self.fc = 0.0
                self.coletar_construcoes()
                self.coletar_animais()
                self.colher()
                self.colher_arvores()
                self.fc = 1.0
        guarda = 0
        while self.t < self.fim - 1e-9:
            guarda += 1
            if guarda > 4000:
                break
            agiu = self.coletar_construcoes()
            agiu = self.coletar_animais() or agiu
            agiu = self.colher() or agiu
            agiu = self.colher_arvores() or agiu
            if not ajudante:
                agiu = self.entregar() or agiu
                self.repor_pedidos()
            self.planejar()
            if not ajudante:
                agiu = self.usar_cash_e_anuncios() or agiu
            agiu = self.enfileirar() or agiu
            agiu = self.alimentar() or agiu
            agiu = self.plantar() or agiu
            if not ajudante:
                agiu = self.comprar() or agiu
                agiu = self.feira() or agiu
            if not agiu:
                tn = self.proximo_evento()
                if tn is None or tn >= self.fim:
                    resto = self.fim - self.t
                    usado = self.minijogar(resto)
                    if not ajudante:
                        self.st["ocioso"] += resto - usado
                    self.t = self.fim
                    break
                espera = tn - self.t
                usado = self.minijogar(espera)
                if not ajudante:
                    self.st["ocioso"] += espera - usado
                self.t = tn

    # ------------------------------------------------------------------ dias
    def fim_do_dia(self, d):
        P = self.P
        e = self.e
        L = self.nivel
        tv = e.tv(L)
        # missoes diarias
        m = P["missoes"]
        if L >= m["desde_nivel"]:
            feitas = 0
            metas = [(self.d_ped, m["meta_pedidos"]), (self.d_colh, m["meta_colheitas"]), (self.d_prod, m["meta_producao"])]
            for feito, (base, por_nivel, teto) in metas:
                if feito >= min(teto, base + por_nivel * L):
                    feitas += 1
                    self.add_xp(m["mult_tv_xp"] * tv, "missoes")
                    self.ganha(m["mult_tv"] * tv, "missoes")
            self.st["missoes"] += feitas
            if feitas == 3:
                self.add_xp(m["bau_mult_tv_xp"] * tv, "missoes")
                self.ganha(m["bau_mult_tv"] * tv, "missoes")
                self.ganha_cash(m["bau_cash"], "missoes")
                self.pecas += m["bau_pecas"]
        # calendario de retorno
        cal = P["calendario"]
        lista = cal["primeira_volta"] if self.cal_idx < 7 else cal["voltas_seguintes"]
        r = lista[self.cal_idx % 7]
        self.cal_idx += 1
        if "moedas_tv" in r:
            self.ganha(r["moedas_tv"] * tv, "calendario")
        if "cash" in r:
            self.ganha_cash(r["cash"], "calendario")
        if "pecas" in r:
            self.pecas += r["pecas"]
        # conquistas / colecoes (gotejamento)
        for a, b, v in P["conquistas"]["cash_por_dia"]:
            if a <= d + 1 <= b:
                self.frac_cash += v
        if self.frac_cash >= 1.0:
            q = int(self.frac_cash)
            self.frac_cash -= q
            self.ganha_cash(q, "conquistas")
        # diaria de ajudante (o perfil ajudou no sitio de amigos)
        nb = self.p.get("diaria_baus", 0)
        if nb and d + 1 >= self.p.get("ajudantes_desde_dia", 1):
            mu = P["mutirao"]
            nb = min(nb, mu["baus_por_dia"])
            self.add_xp(nb * mu["bau_mult_tv_xp"] * tv, "diaria")
            self.ganha(nb * mu["bau_mult_tv"] * tv, "diaria")
        # passe (trilha gratis para todos a partir do lancamento; premium para quem paga)
        pg = self.p.get("pagamento")
        ps = P["loja"]["passe"]
        if self.passe_ativo:
            self.frac_passe = getattr(self, "frac_passe", 0.0) + ps["premium_cash_total"] / float(ps["dias"])
            q = int(self.frac_passe)
            self.frac_passe -= q
            self.ganha_cash(q, "passe")
            self.frac_pecas = getattr(self, "frac_pecas", 0.0) + ps["premium_pecas_total"] / float(ps["dias"])
            q = int(self.frac_pecas)
            self.frac_pecas -= q
            self.pecas += q
        # decoracao (sumidouro cosmetico)
        dec = self.p.get("decoracao_pct", 0.0) * self.d_moedas
        if dec > 0 and self.moedas - self.reserva_moedas() >= dec:
            self.gasta(dec, "decoracao")
        # serie diaria
        self.renda7.append(self.d_moedas)
        if len(self.renda7) > 7:
            self.renda7.pop(0)
        renda = sum(self.renda7) / len(self.renda7)
        cap_plot = len(self.plots) * DIA
        self.serie.append(dict(
            dia=d + 1, nivel=L, xp_total=int(self.xp_tot), moedas=int(self.moedas), cash=int(self.cash),
            pecas=self.pecas, pedidos=self.d_ped, xp_dia=int(self.d_xp), moedas_dia=int(self.d_moedas),
            canteiros=len(self.plots), construcoes=len(self.bld), animais=len(self.ani), arvores=len(self.arv),
            vila=self.vila_n, estrelas=sum(self.estrelas.values()),
            sessao_min=self.st["sessao"], ocioso_min=self.st["ocioso"], giro_min=self.st["giro"], mini_min=self.st["mini"],
            plot_ocioso=self.st["plot_ocioso"], bld_ocupado=self.st["bld_ocupado"],
            cap_bld=sum(1 for b in self.bld.values()) * DIA, cap_plot=cap_plot,
            bloqueios=self.d_bloq, pendentes=self.d_pendentes,
            dias_de_renda=(self.moedas / renda) if renda > 0 else 0.0,
            cap_silo=self.cap["silo"], cap_celeiro=self.cap["celeiro"],
            anuncios=self.st["anuncios"], acel=self.d_acel, min_acel=self.st["min_acelerados"],
        ))
        self.zera_dia()
        self.pico["silo"] = self.n_arm["silo"] / float(self.cap["silo"])
        self.pico["celeiro"] = self.n_arm["celeiro"] / float(self.cap["celeiro"])
        self.caseiro_usado_hoje = False
        self.forcadas = {"silo": 0, "celeiro": 0}

    def rodar(self, dias):
        p = self.p
        pg = p.get("pagamento") or {}
        for d in range(dias):
            self.dia = d
            base = d * DIA
            # compras em dinheiro real
            if pg:
                if pg.get("pacote_inicial_dia") == d + 1:
                    pi = self.P["loja"]["pacote_inicial"]
                    self.ganha_cash(pi["cash"], "compra")
                    self.pecas += pi["pecas"]
                    self.st["gasto_brl"] += pi["preco_brl"]
                if pg.get("passe") and d + 1 >= pg.get("passe_desde_dia", 1):
                    if (d + 1 - pg.get("passe_desde_dia", 1)) % self.P["loja"]["passe"]["dias"] == 0:
                        self.st["gasto_brl"] += self.P["loja"]["passe"]["preco_brl"]
                    self.passe_ativo = True
                if pg.get("cash_mensal") and d % 30 == (pg.get("pacote_inicial_dia", 1) % 30):
                    self.ganha_cash(pg["cash_mensal"], "compra")
                    self.st["gasto_brl"] += self.preco_de(pg["cash_mensal"])
            ev = []
            for i, (h, dur) in enumerate(p["sessoes"]):
                if d == 0 and i == 0:
                    dur = p.get("primeira_sessao_min", dur)
                ev.append((base + h * 60.0, dur, False))
            if p.get("ajudantes") and d + 1 >= p.get("ajudantes_desde_dia", 1):
                for h, dur in p["ajudantes"]:
                    ev.append((base + h * 60.0, dur, True))
            ev.sort()
            prox_dia = (d + 1) * DIA + p["sessoes"][0][0] * 60.0
            for i, (t0, dur, aj) in enumerate(ev):
                prox = ev[i + 1][0] if i + 1 < len(ev) else prox_dia
                self.sessao(t0, dur, prox, aj)
                if self.nivel_primeira_sessao is None and not aj:
                    self.nivel_primeira_sessao = self.nivel
                    self.t_primeira = t0
            self.fim_do_dia(d)
        return self

    def preco_de(self, cash):
        """Preco em R$ do menor conjunto de pacotes que entrega `cash` (aproximacao gulosa)."""
        pac = sorted(self.P["loja"]["pacotes"], key=lambda x: -x["cash"])
        total = 0.0
        resto = cash
        for pk in pac:
            while resto >= pk["cash"]:
                total += pk["preco_brl"]
                resto -= pk["cash"]
        if resto > 0:
            total += pac[-1]["preco_brl"] * resto / float(pac[-1]["cash"])
        return total


# ---------------------------------------------------------------- relatorios
def janela(serie, chave, a, b):
    """Diferenca de um contador acumulado entre o fim do dia a-1 e o fim do dia b."""
    fim = serie[min(b, len(serie)) - 1][chave]
    ini = serie[a - 2][chave] if a >= 2 else 0.0
    return fim - ini


def resumo(sim, marcos):
    s = sim.serie
    out = dict(id=sim.p["id"], nome=sim.p["nome"], dia_teto=sim.dia_teto, marcos={}, janelas=[])
    for m in marcos:
        if m <= len(s):
            r = s[m - 1]
            out["marcos"][m] = dict(nivel=r["nivel"], moedas=r["moedas"], cash=r["cash"], vila=r["vila"],
                                    estrelas=r["estrelas"], canteiros=r["canteiros"], construcoes=r["construcoes"],
                                    dias_de_renda=r["dias_de_renda"], xp_dia=r["xp_dia"], pedidos=r["pedidos"])
    for a, b in JANELAS:
        if a > len(s):
            continue
        b2 = min(b, len(s))
        nd = b2 - a + 1
        sess = janela(s, "sessao_min", a, b)
        cap_plot = sum(r["cap_plot"] for r in s[a - 1:b2])
        cap_bld = sum(r["cap_bld"] for r in s[a - 1:b2])
        out["janelas"].append(dict(
            a=a, b=b2,
            ocioso=janela(s, "ocioso_min", a, b) / sess if sess else 0.0,
            giro=janela(s, "giro_min", a, b) / sess if sess else 0.0,
            mini=janela(s, "mini_min", a, b) / sess if sess else 0.0,
            plot_ocioso=janela(s, "plot_ocioso", a, b) / cap_plot if cap_plot else 0.0,
            bld_uso=janela(s, "bld_ocupado", a, b) / cap_bld if cap_bld else 0.0,
            pedidos_dia=sum(r["pedidos"] for r in s[a - 1:b2]) / float(nd),
            bloqueios_dia=sum(r["bloqueios"] for r in s[a - 1:b2]) / float(nd),
            pendentes=sum(r["pendentes"] for r in s[a - 1:b2]) / float(nd),
            dias_de_renda=sum(r["dias_de_renda"] for r in s[a - 1:b2]) / float(nd),
            xp_dia=sum(r["xp_dia"] for r in s[a - 1:b2]) / float(nd),
            moedas_dia=sum(r["moedas_dia"] for r in s[a - 1:b2]) / float(nd),
            anuncios_dia=janela(s, "anuncios", a, b) / float(nd),
        ))
    tx = sum(sim.xp_fonte.values()) or 1.0
    out["xp_fonte"] = dict((k, v / tx) for k, v in sim.xp_fonte.items())
    tm = sum(sim.moeda_fonte.values()) or 1.0
    out["moeda_fonte"] = dict((k, v / tm) for k, v in sim.moeda_fonte.items())
    out["moeda_sumid"] = dict((k, v / tm) for k, v in sim.moeda_sumid.items())
    out["moedas_ganhas"] = tm
    out["cash_fonte"] = dict(sim.cash_fonte)
    out["cash_sumid"] = dict(sim.cash_sumid)
    out["gasto_brl"] = sim.st["gasto_brl"]
    out["estrelas_total"] = 5 * sum(1 for i in sim.e.itens.values() if i["tipo"] != "racao")
    out["vila_total"] = len(sim.e.vila)
    out["primeira_sessao"] = getattr(sim, "nivel_primeira_sessao", None)
    # teto movel: o conteudo mensal sobe o teto em N niveis a cada 30 dias depois do lancamento
    cad = sim.P["geral"]["cadencia_niveis_por_mes"]
    out["dia_teto_movel"] = None
    for r in s:
        if r["nivel"] >= sim.e.teto + cad * (r["dia"] // 30):
            out["dia_teto_movel"] = r["dia"]
            break
    out["nivel_final"] = s[-1]["nivel"]
    out["t_nivel"] = dict(sim.t_nivel)
    out["t_primeira"] = getattr(sim, "t_primeira", 0.0)
    return out


def fmt_int(x):
    return ("%d" % round(x)).replace(",", ".") if abs(x) < 1000 else "{:,}".format(int(round(x))).replace(",", ".")


def pct(x):
    return ("%.0f%%" % (100.0 * x))


def d1(x):
    """Uma casa decimal, com virgula."""
    return ("%.1f" % x).replace(".", ",")


def tabela_md(resumos, marcos, teto):
    L = []
    L.append("### Nível por dia\n")
    L.append("| Persona | " + " | ".join("D%d" % m for m in marcos) + " | Dia do teto (nv %d) | Dia em que alcança o teto com conteúdo mensal |" % teto)
    L.append("|---|" + "---:|" * (len(marcos) + 2))
    for r in resumos:
        L.append("| %s | " % r["nome"] + " | ".join(str(r["marcos"][m]["nivel"]) if m in r["marcos"] else "–" for m in marcos)
                 + " | %s | %s |" % (r["dia_teto"] if r["dia_teto"] else "não chega", r["dia_teto_movel"] if r["dia_teto_movel"] else "não alcança"))
    L.append("")
    L.append("### Saldo de moedas por dia (e quantos dias de renda ele representa no D30/D90/D180)\n")
    L.append("| Persona | " + " | ".join("D%d" % m for m in marcos) + " | Dias de renda D30 / D90 / D180 |")
    L.append("|---|" + "---:|" * (len(marcos) + 1))
    for r in resumos:
        dr = " / ".join(d1(r["marcos"][m]["dias_de_renda"]) if m in r["marcos"] else "–" for m in (30, 90, 180))
        L.append("| %s | " % r["nome"] + " | ".join(fmt_int(r["marcos"][m]["moedas"]) if m in r["marcos"] else "–" for m in marcos) + " | %s |" % dr)
    L.append("")
    L.append("### Saldo de cash por dia\n")
    L.append("| Persona | " + " | ".join("D%d" % m for m in marcos) + " | Gasto em R$ no período |")
    L.append("|---|" + "---:|" * (len(marcos) + 1))
    for r in resumos:
        L.append("| %s | " % r["nome"] + " | ".join(fmt_int(r["marcos"][m]["cash"]) if m in r["marcos"] else "–" for m in marcos)
                 + " | %s |" % (("%.2f" % r["gasto_brl"]).replace(".", ",")))
    L.append("")
    L.append("### Metas de longo prazo (estágios da vila e estrelas de maestria)\n")
    L.append("| Persona | Vila D30 | Vila D90 | Vila D180 | Estrelas D30 | Estrelas D90 | Estrelas D180 |")
    L.append("|---|---:|---:|---:|---:|---:|---:|")
    for r in resumos:
        def g(m, k):
            return str(r["marcos"][m][k]) if m in r["marcos"] else "–"
        L.append("| %s | %s/%d | %s/%d | %s/%d | %s/%d | %s/%d | %s/%d |" % (
            r["nome"], g(30, "vila"), r["vila_total"], g(90, "vila"), r["vila_total"], g(180, "vila"), r["vila_total"],
            g(30, "estrelas"), r["estrelas_total"], g(90, "estrelas"), r["estrelas_total"], g(180, "estrelas"), r["estrelas_total"]))
    L.append("")
    L.append("### Indicadores de ociosidade e de válvulas, por janela de dias\n")
    L.append("| Persona | Dias | Sessão sem nada útil | Giro de cultura curta | Minijogos | Canteiro parado | Uso das construções | Pedidos/dia | XP/dia | Moedas/dia | Bloqueios de armazém/dia | Compras à espera de moedas | Saldo em dias de renda | Anúncios/dia |")
    L.append("|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|")
    for r in resumos:
        for j in r["janelas"]:
            L.append("| %s | %d–%d | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s |" % (
                r["nome"], j["a"], j["b"], pct(j["ocioso"]), pct(j["giro"]), pct(j["mini"]), pct(j["plot_ocioso"]),
                pct(j["bld_uso"]), d1(j["pedidos_dia"]), fmt_int(j["xp_dia"]), fmt_int(j["moedas_dia"]),
                d1(j["bloqueios_dia"]), d1(j["pendentes"]), d1(j["dias_de_renda"]), d1(j["anuncios_dia"])))
    L.append("")
    L.append("### De onde vem o XP e para onde vão as moedas (acumulado no período)\n")
    fontes = ["pedidos", "producao", "colheita", "feira", "missoes", "vila", "maestria", "minijogos", "diaria"]
    L.append("| Persona | " + " | ".join("XP: " + f for f in fontes) + " |")
    L.append("|---|" + "---:|" * len(fontes))
    for r in resumos:
        L.append("| %s | " % r["nome"] + " | ".join(pct(r["xp_fonte"].get(f, 0.0)) for f in fontes) + " |")
    L.append("")
    sums = ["constr", "terra", "animal", "arvore", "vaga3", "armazem", "vila", "festa_vila", "sementes", "feira", "decoracao"]
    L.append("| Persona | Moedas ganhas | " + " | ".join(sums) + " | Total gasto |")
    L.append("|---|---:|" + "---:|" * (len(sums) + 1))
    for r in resumos:
        tot = sum(r["moeda_sumid"].values())
        L.append("| %s | %s | " % (r["nome"], fmt_int(r["moedas_ganhas"])) + " | ".join(pct(r["moeda_sumid"].get(f, 0.0)) for f in sums) + " | %s |" % pct(tot))
    L.append("")
    L.append("### Cash: fontes gratuitas e usos (acumulado no período)\n")
    cf = ["nivel", "missoes", "calendario", "conquistas", "vila", "maestria", "anuncios", "passe", "compra"]
    cs = ["vagas", "acelerar", "pecas"]
    L.append("| Persona | " + " | ".join("+" + f for f in cf) + " | " + " | ".join("−" + f for f in cs) + " |")
    L.append("|---|" + "---:|" * (len(cf) + len(cs)))
    for r in resumos:
        L.append("| %s | " % r["nome"] + " | ".join(fmt_int(r["cash_fonte"].get(f, 0)) for f in cf) + " | "
                 + " | ".join(fmt_int(r["cash_sumid"].get(f, 0)) for f in cs) + " |")
    L.append("")
    return "\n".join(L)


def rodar_persona(eco, persona, dias, semente):
    sim = Sim(eco, persona, semente)
    # primeira sessao isolada para registrar o nivel ao fim dela
    sim.rodar(dias)
    return sim


def main(argv=None):
    ap = argparse.ArgumentParser(description="Simula as personas contra as tabelas da economia.", add_help=False)
    ap.add_argument("--ajuda", "-h", action="help", help="mostra esta ajuda")
    ap.add_argument("--dias", type=int, default=None, help="dias simulados (padrao: parametros.json)")
    ap.add_argument("--personas", default="", help="ids separados por virgula (padrao: todas)")
    ap.add_argument("--somente-mvp", action="store_true", help="simula apenas o conteudo do MVP (teto no nivel 30)")
    ap.add_argument("--semente", type=int, default=20261111, help="semente do gerador de pedidos")
    ap.add_argument("--saida", default=os.path.join(E.BASE, "saida"), help="pasta de saida")
    ap.add_argument("--sem-arquivos", action="store_true", help="nao grava arquivos; so imprime")
    ap.add_argument("--definir", action="append", default=[], metavar="caminho=valor",
                    help="sobrescreve um parametro, ex.: --definir curva_xp.a=9.5 (pode repetir)")
    args = ap.parse_args(argv)

    P = E.carregar_json("parametros.json")
    for d in args.definir:
        caminho, valor = d.split("=", 1)
        no = P
        partes = caminho.split(".")
        for k in partes[:-1]:
            no = no[k]
        no[partes[-1]] = json.loads(valor)
    eco = E.Economia(parametros=P, somente_mvp=args.somente_mvp)
    dias = args.dias or P["geral"]["dias"]
    marcos = [m for m in P["geral"]["marcos_dias"] if m <= dias]
    personas = E.carregar_json("personas.json")["personas"]
    if args.personas:
        ids = args.personas.split(",")
        personas = [p for p in personas if p["id"] in ids]
    resumos = []
    sims = []
    for p in personas:
        sim = rodar_persona(eco, p, dias, args.semente)
        sims.append(sim)
        resumos.append(resumo(sim, marcos))
    md = tabela_md(resumos, marcos, eco.teto)
    print(md)
    if not args.sem_arquivos:
        if not os.path.isdir(args.saida):
            os.makedirs(args.saida)
        suf = "_mvp" if args.somente_mvp else ""
        with open(os.path.join(args.saida, "resultados%s.md" % suf), "w", encoding="utf-8") as f:
            f.write("# Resultados da simulação%s\n\n" % (" (somente conteúdo do MVP)" if args.somente_mvp else ""))
            f.write("Gerado por `simular.py` com semente %d, %d dias. Não edite à mão.\n\n" % (args.semente, dias))
            f.write(md)
        with open(os.path.join(args.saida, "serie_diaria%s.csv" % suf), "w", encoding="utf-8", newline="") as f:
            w = None
            for sim in sims:
                for r in sim.serie:
                    linha = dict(persona=sim.p["id"])
                    linha.update(r)
                    for k, v in list(linha.items()):
                        if isinstance(v, float):
                            linha[k] = round(v, 2)
                    if w is None:
                        w = csv.DictWriter(f, fieldnames=list(linha.keys()))
                        w.writeheader()
                    w.writerow(linha)
    return resumos


if __name__ == "__main__":
    main()
