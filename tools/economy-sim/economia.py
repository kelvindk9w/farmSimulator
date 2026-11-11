# -*- coding: utf-8 -*-
"""Carrega os dados (dados/*.json) e deriva as tabelas da economia.

Somente biblioteca padrao do Python 3. Nao ha aleatoriedade aqui: as tabelas
saem sempre iguais para os mesmos arquivos de entrada.
"""
import json
import math
import os

BASE = os.path.dirname(os.path.abspath(__file__))


def carregar_json(nome, pasta=None):
    caminho = os.path.join(pasta or os.path.join(BASE, "dados"), nome)
    with open(caminho, encoding="utf-8") as f:
        return json.load(f)


def bonito(x):
    """Arredonda para dois algarismos significativos (precos 'redondos')."""
    if x <= 0:
        return 0
    if x < 10:
        return int(round(x))
    mag = 10 ** (int(math.floor(math.log10(x))) - 1)
    return int(round(x / mag) * mag)


def faixa(tabela, nivel):
    """tabela = [[nivel_min, valor], ...] crescente; devolve o valor vigente."""
    v = tabela[0][1]
    for n, val in tabela:
        if nivel >= n:
            v = val
        else:
            break
    return v


class Economia(object):
    def __init__(self, parametros=None, conteudo=None, pasta=None, somente_mvp=False):
        self.P = parametros or carregar_json("parametros.json", pasta)
        self.C = conteudo or carregar_json("conteudo.json", pasta)
        self.somente_mvp = somente_mvp
        self.teto = self.P["geral"]["nivel_teto"]
        if somente_mvp:
            # cenario "so o conteudo do MVP": descarta tudo que nao e mvp e corta o teto
            self.teto = self.P["geral"]["nivel_teto_mvp"]
            self.C = dict(self.C)
            for chave in ("culturas", "arvores", "animais", "construcoes", "receitas", "recursos"):
                self.C[chave] = [x for x in self.C[chave] if x.get("mvp")]
        self._xp_cache = {}
        self._derivar()
        if somente_mvp:
            self.terras = [t for t in self.terras if t["nivel"] <= self.teto]
            self.vila = [s for s in self.vila if s["nivel"] <= self.teto]

    # ------------------------------------------------------------------ niveis
    def xp_prox(self, nivel):
        """XP necessario para sair do nivel `nivel` e chegar ao seguinte.

        Curva por trechos de potencia, continua: comeca em a * L^e0 e troca de
        expoente em cada [nivel_inicio, expoente] de curva_xp.trechos. Acima do
        teto de conteudo (niveis de mestre) cada nivel custa pos_teto_mult vezes o
        ultimo nivel do teto, mais pos_teto_incremento por nivel.
        """
        v = self._xp_cache.get(nivel)
        if v is not None:
            return v
        c = self.P["curva_xp"]
        n = min(nivel, self.teto)
        x = c["a"]
        trechos = c["trechos"]
        for i, (ini, exp) in enumerate(trechos):
            fim = trechos[i + 1][0] if i + 1 < len(trechos) else None
            ate = n if fim is None or n < fim else fim
            if ate > ini:
                x *= (float(ate) / ini) ** exp
            if fim is None or n < fim:
                break
        if nivel > self.teto:
            x *= c["pos_teto_mult"] * (1.0 + c["pos_teto_incremento"] * (nivel - self.teto - 1))
        v = max(1, bonito(x))
        self._xp_cache[nivel] = v
        return v

    def xp_acumulado(self, nivel):
        """XP total para chegar ao nivel `nivel` partindo do nivel 1."""
        return sum(self.xp_prox(n) for n in range(1, nivel))

    def ref(self, nivel):
        c = self.P["custos"]
        return c["c0"] * nivel ** c["cexp"]

    def tv(self, nivel):
        p = self.P["pedidos"]
        return p["tv0"] * nivel ** p["tvexp"]

    def vagas_pedidos(self, nivel):
        return faixa(self.P["pedidos"]["vagas"], nivel)

    def espera_pedido(self, nivel):
        p = self.P["pedidos"]
        return min(p["espera_max_min"], p["espera_base_min"] + p["espera_por_nivel_min"] * nivel)

    def preco_acelerar(self, minutos):
        a = self.P["acelerar"]
        if minutos <= a["gratis_ate_min"]:
            return 0
        return int(math.ceil(a["k"] * minutos ** a["exp"] - 1e-9))

    # ---------------------------------------------------------------- derivacao
    def _derivar(self):
        P, C = self.P, self.C
        itens = {}
        self.culturas, self.arvores, self.animais = {}, {}, {}
        self.construcoes, self.receitas = {}, {}

        pc = P["cultura"]
        for c in C["culturas"]:
            T = c["tempo_min"]
            rend = c.get("rend", pc["rend"])
            G = pc["g0"] * T ** pc["gexp"]
            d = dict(c)
            d.update(rend=rend,
                     valor=max(1, int(round(G / rend))),
                     semente=max(1, int(round(pc["frac_semente"] * G))),
                     xp=max(1, int(round(pc["x0"] * T ** pc["xexp"]))))
            self.culturas[c["id"]] = d
            itens[c["id"]] = dict(id=c["id"], nome=c["nome"], tipo="cultura", valor=d["valor"],
                                  nivel=c["nivel"], pedido=True, mvp=c["mvp"], armazem="silo")

        pa = P["arvore"]
        lotes_arv = P["arvores_lotes"]["lotes"]
        for a in C["arvores"]:
            H = a["ciclo_min"]
            G = pa["mult_valor"] * pc["g0"] * H ** pc["gexp"]
            d = dict(a)
            d.update(valor=max(1, int(round(G / a["rend"]))),
                     xp=max(1, int(round(pa["x0"] * H ** pa["xexp"]))),
                     lotes=[dict(nivel=a["nivel"] + dn, qtd=q) for dn, q in lotes_arv])
            for i, lt in enumerate(d["lotes"]):
                lt["custo_unit"] = bonito(P["custos"]["mult_arvore"] * self.ref(lt["nivel"]) * (1 + 0.5 * i))
            self.arvores[a["id"]] = d
            itens[a["fruta"]] = dict(id=a["fruta"], nome=a["fruta_nome"], tipo="fruta", valor=d["valor"],
                                     nivel=a["nivel"], pedido=True, mvp=a["mvp"], armazem="silo", arvore=a["id"])

        # receitas e animais dependem uns dos outros (racao -> animal -> queijo...): resolve por recursao
        rec_por_id = dict((r["id"], r) for r in C["receitas"])
        ani_por_prod = dict((a["produto"], a) for a in C["animais"])
        pr, pan = P["receita"], P["animal"]
        valor_cache = {}

        def valor_de(iid):
            if iid in itens:
                return itens[iid]["valor"]
            if iid in valor_cache:
                return valor_cache[iid]
            if iid in rec_por_id:
                r = rec_por_id[iid]
                soma = sum(valor_de(i) * q for i, q in r["insumos"].items())
                v = (pr["mult_insumos"] * soma + pr["r0"] * r["tempo_min"] ** pr["rexp"]) / r["saida"]
            elif iid in ani_por_prod:
                a = ani_por_prod[iid]
                v = valor_de(a["racao"]) + pan["a0"] * a["ciclo_min"] ** pan["aexp"]
            else:
                raise KeyError("item sem origem: %s" % iid)
            v = max(1, int(round(v)))
            valor_cache[iid] = v
            return v

        for a in C["animais"]:
            d = dict(a)
            d.update(valor=valor_de(a["produto"]),
                     xp=max(1, int(round(pan["x0"] * a["ciclo_min"] ** pan["xexp"]))))
            d["lotes"] = [dict(l) for l in a["lotes"]]
            for lt in d["lotes"]:
                lt["custo"] = bonito(P["custos"]["mult_lote_animal"] * self.ref(lt["nivel"]))
            self.animais[a["id"]] = d
            itens[a["produto"]] = dict(id=a["produto"], nome=a["produto_nome"], tipo="animal", valor=d["valor"],
                                       nivel=a["nivel"], pedido=True, mvp=a["mvp"], armazem="celeiro", animal=a["id"])

        for b in C["construcoes"]:
            d = dict(b)
            d["custo"] = bonito(P["custos"]["mult_construcao"] * self.ref(b["nivel"]))
            d["vaga3_nivel"] = b["nivel"] + P["custos"]["vaga3_nivel_apos"]
            d["vaga3_custo"] = bonito(P["custos"]["mult_vaga3"] * self.ref(d["vaga3_nivel"]))
            d["vaga3_ferramentas"] = P["custos"]["vaga3_ferramentas"]
            d["receitas"] = []
            self.construcoes[b["id"]] = d

        for r in C["receitas"]:
            d = dict(r)
            eh_racao = bool(r.get("racao"))
            d.update(valor=valor_de(r["id"]),
                     xp=max(1, int(round(pr["x0"] * r["tempo_min"] ** pr["xexp"]))),
                     racao=eh_racao)
            self.receitas[r["id"]] = d
            self.construcoes[r["construcao"]]["receitas"].append(r["id"])
            itens[r["id"]] = dict(id=r["id"], nome=r["nome"], tipo="racao" if eh_racao else "processado",
                                  valor=d["valor"], nivel=r["nivel"], pedido=not eh_racao, mvp=r["mvp"],
                                  armazem="celeiro", construcao=r["construcao"])
        self.itens = itens

        # terras
        t = P["terras"]
        self.terras = []
        pad = t["padrao_canteiros"]
        for k, nv in enumerate(t["niveis"], start=1):
            self.terras.append(dict(k=k, nivel=nv,
                                    custo=bonito(P["custos"]["mult_terra"] * self.ref(nv)),
                                    escrituras=t["escrituras_base"] + k,
                                    canteiros=pad[(k - 1) % len(pad)]))

        # vila
        v = P["vila"]
        self.vila = []
        for s in range(1, v["estagios"] + 1):
            nv = int(round(v["nivel_inicial"] + v["passo_nivel"] * (s - 1)))
            self.vila.append(dict(s=s, nivel=nv,
                                  custo=bonito(P["custos"]["mult_vila"] * self.ref(nv)),
                                  obra_min=int(round(v["obra_min_base"] * s ** v["obra_min_exp"])),
                                  xp=bonito(v["pct_xp"] * self.xp_prox(nv)), cash=v["cash"]))

        # checagens de consistencia
        for r in self.receitas.values():
            for i in r["insumos"]:
                if itens[i]["nivel"] > r["nivel"]:
                    raise ValueError("receita %s (nv %d) usa %s (nv %d)" % (r["id"], r["nivel"], i, itens[i]["nivel"]))
            if self.construcoes[r["construcao"]]["nivel"] > r["nivel"]:
                raise ValueError("receita %s antes da construcao" % r["id"])
        for a in self.animais.values():
            if itens[a["racao"]]["nivel"] > a["nivel"]:
                raise ValueError("racao de %s desbloqueia depois do animal" % a["id"])

    # ------------------------------------------------------------ armazenagem
    def custo_ampliacao(self, j):
        a = self.P["armazem"]
        return bonito(a["s0"] * j ** a["sexp"]), a["tabuas_base"] + a["tabuas_por_ampliacao"] * j

    # ------------------------------------------------------------- desbloqueios
    def desbloqueios_por_nivel(self):
        """nivel -> lista de textos (para a tabela do documento)."""
        d = {}

        def add(n, txt):
            d.setdefault(n, []).append(txt)

        for c in self.culturas.values():
            add(c["nivel"], "Cultura: %s" % c["nome"])
        for a in self.arvores.values():
            add(a["nivel"], "Árvore: %s" % a["nome"])
        for a in self.animais.values():
            for i, lt in enumerate(a["lotes"]):
                if i == 0:
                    add(lt["nivel"], "%s (%d %s)" % (a["abrigo"], lt["qtd"], a.get("nome_plural", a["nome"].lower())))
                else:
                    add(lt["nivel"], "%s +%d" % (a["abrigo"], lt["qtd"]))
        for b in self.construcoes.values():
            add(b["nivel"], "Construção: %s" % b["nome"])
        for r in self.receitas.values():
            add(r["nivel"], "Receita: %s" % r["nome"])
        for t in self.terras:
            add(t["nivel"], "Terra %d (+%d canteiro%s)" % (t["k"], t["canteiros"], "s" if t["canteiros"] > 1 else ""))
        for s in self.vila:
            add(s["nivel"], "Vila: estágio %d" % s["s"])
        ant = None
        for n, q in self.P["pedidos"]["vagas"]:
            if ant is not None:
                add(n, "Quadro de pedidos: %d vagas" % q)
            ant = q
        for r in self.C["recursos"]:
            add(r["nivel"], "Recurso: %s" % r["nome"])
        return d
