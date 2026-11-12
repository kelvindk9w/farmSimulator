# Vida real e mecânicas do sítio

Pesquisa de como as coisas funcionam num sítio de verdade (foco no Brasil, sítio pequeno e agricultura familiar) e proposta de como isso vira jogo sem ficar pesado. Aqui não há código nem preços: a economia nova tem plano próprio em `docs/planejamento/economia-da-simulacao.md`, escrito em paralelo. O capítulo 12 liga os dois documentos.

**Como ler.** Cada capítulo tem duas partes. "Na vida real" traz só o que foi pesquisado, com a etiqueta da fonte ao lado (por exemplo [G1]); a lista de fontes fica no fim do capítulo. "No jogo" é proposta minha de adaptação. O que não consegui confirmar aparece escrito como **não confirmado**.

**Dois avisos.**

- Neste ambiente não foi possível abrir as páginas. Os números vieram dos resumos da busca e do texto da Wikipédia. Às vezes o resumo junta várias páginas, então a ligação entre um número e o endereço exato pode estar imprecisa. Antes de usar um número em material público, abra a fonte e confira.
- Todo número de jogo (minutos, usos, quantidades) é exemplo, para mostrar a ideia. Onde este documento e o plano de economia derem números diferentes, vale o do plano de economia, e o valor final sai do simulador em `tools/economy-sim/`.

## 1. Resumo em uma página

O pedido foi: simulação de verdade, mas sem ser hardcore. A proposta inteira cabe numa frase: **mostrar o caminho real das coisas (buscar, fazer, levar, guardar) e perdoar os erros.**

1. **Todo objeto existe e tem lugar.** Balde, cesta, regador, enxada e caixa ficam em ganchos ou num canto, e a silhueta marca o lugar vazio. O personagem carrega uma coisa por vez. Nada aparece do nada.
2. **O jogador escolhe o objetivo; o personagem faz o caminho real.** Um toque na vaca e ele busca o balde e o banquinho sozinho antes de ordenhar. A lógica da vida real aparece na tela sem virar dez toques, e funciona no controle da TV. (O dono já decidiu assim; o passo a passo fica só para o tutorial.)
3. **Cadeias de três passos: produzir, levar, preparar na bancada.** Ovos: ninho → cesta → cartela de 12. Leite: vaca → balde → 2 garrafas. O produto solto (ovo avulso, balde de leite) também pode ser vendido, por menos.
4. **Um medidor só por bicho: bem-estar.** Comida e água em dia, produção cheia. Faltou comida ou água, metade. Nenhum bicho morre.
5. **Vida útil contada em usos, não em relógio.** A ferramenta gasta a cada uso e passa a render menos (não some). O bicho para de produzir depois de tantos ovos ou ordenhas, e o jogador escolhe o destino dele. Nada envelhece nem estraga com o jogo fechado.
6. **Três réguas de tempo**, porque uma só não serve: rotina (1 dia de sítio = 20 minutos), crescimento (5 semanas reais = 1 minuto, alongando para o que é demorado) e vida útil (em usos). Capítulo 2.
7. **Cinco culturas e uma árvore:** milho, alface, feijão, tomate, mandioca e laranjeira. Cada uma ensina uma coisa diferente (capítulo 3). A planta sem água espera com um ícone de gota; não morre.
8. **Vaca só com curral pronto** (cerca, porteira, cocho, bebedouro, sombra). Galinha pede menos: ninho, comedouro e bebedouro. Na primeira versão a porteira abre e fecha sozinha quando o personagem passa.
9. **Armazém por dentro como cena separada, numa malha, na segunda versão.** Maior por dentro do que por fora; a capacidade é o que se vê (cada ampliação é um móvel novo). Até lá o personagem entra pela porta e some, como no protótipo, e a bancada e os ganchos ficam do lado de fora.
10. **Escala: 1 metro = 1 unidade, com um fator por categoria.** Coisa pequena cresce, coisa grande fica igual ou encolhe, e o que o personagem usa acompanha o personagem. A tabela está no capítulo 9 e em `escala.json`.

**Primeira versão (recomendação).** O nível "leve" de cada sistema (capítulo 8): sítio começando só com grama, objetos com lugar, a cadeia dos ovos (que resolve o "pegar o ovo não faz nada"), a cadeia do leite, o bem-estar, o curral com porteira e um desgaste simples das ferramentas. A ordem de construção, uma coisa por vez, já está nas etapas 1 a 4 do plano de economia.

**Fica para depois:** armazém por dentro, idade e ciclo completo dos bichos, pintinho e bezerro, esterco virando adubo, saúde e remédio, frango de corte, produto que perde o frescor, pragas, clima.

**Um esclarecimento sobre "vender para a granja".** Na vida real a galinha que bota ovo e o frango de carne são aves diferentes. O frango é criado só para carne, por 42 dias (granja) ou 85 dias no mínimo (caipira), e não bota [G6]. A poedeira velha é vendida como "galinha de descarte". No jogo, então, são duas coisas separadas: a galinha que chega ao fim da vida produtiva (o dono já decidiu as três saídas: ficar de estimação, vender ao frigorífico ou vender a um fazendeiro) e, mais tarde, "criar frango" como outro produto. Recomendo que a venda aconteça fora da tela.

## 2. A regra do tempo

Na vida real os tempos vão de um dia (um ovo) a anos (uma laranjeira). Uma conversão única não funciona: se 1 dia real valesse 20 minutos, o milho de 90 dias levaria 30 horas. Por isso a proposta usa três réguas.

| Régua | Para quê | Regra |
|---|---|---|
| Rotina | O que se repete todo dia: botar ovo, ordenhar, comer, beber | 1 dia de sítio = 20 minutos de jogo |
| Crescimento | O que acontece uma vez por ciclo: planta crescer, filhote virar adulto, esterco curtir | minutos = (semanas reais ÷ 5) elevado a 2,5; mínimo de 1 minuto, teto de 48 horas |
| Vida útil | Quanto dura uma ferramenta ou um bicho | Contada em usos e produções, nunca em relógio |

A régua do crescimento em palavras: **5 semanas de vida real viram 1 minuto; cada vez que o tempo real dobra, o tempo de jogo fica quase 6 vezes maior.** Assim o que é rápido cabe numa sessão e o que é demorado vira "plante e volte depois". O resultado é arredondado para os degraus de tempo que a economia já usa. Exemplo da conta: o milho-verde leva 75 dias, ou 10,7 semanas; 10,7 ÷ 5 = 2,14; 2,14 elevado a 2,5 dá 6,7 minutos.

| Coisa | Na vida real | Pela regra | Sugestão | Economia hoje |
|---|---|---:|---|---|
| Alface (já no canteiro) | 35 dias [C3] | 1 min | 1 min | não existe |
| Milho-verde | 75 dias [C1] | 7 min | 5 a 8 min | 1 min |
| Feijão, milho seco | 85 a 95 dias [C1][C5] | 11 min | 10 min | feijão 3 min |
| Tomate, até a 1ª colheita | 75 a 80 dias [C4] | 8 min | 8 min, e depois mais 3 colheitas de 3 em 3 min | 20 min |
| Mandioca | 8 a 14 meses [C6] | 2 h a 9 h | 4 h | 8 min |
| Laranja, de uma safra à outra | 1 ano [C7] | 6 h | 6 h | 2 h |
| Laranjeira, da muda à 1ª fruta | 2 a 3 anos [C7] | 33 h a 91 h | 24 h a 48 h (teto) | 4 h |
| Ovo | quase 1 por dia no auge [G1] | rotina | 20 min | 20 min |
| Pintinho até botar | 18 a 24 semanas [G1][G2] | 32 min (para 20 semanas) | 30 min | não existe |
| Frango caipira até a venda | 85 dias ou mais [G6] | 9 min | 10 min | não existe |
| Ordenha | 2 por dia [V3] | rotina: 10 min | 30 min a 1 h | 1 h |
| Vaca prenhe até a cria | 280 dias [V2] | 3 h | 2 h a 4 h de descanso | não existe |
| Bezerra até virar vaca | 24 a 33 meses [V2] | 33 h a 76 h | 24 h a 48 h (teto) | não existe |
| Esterco curtindo | 60 a 90 dias [V8] | 4 a 11 min | 10 min | não existe |

Três observações.

- **A regra inverte a vida real de propósito.** No sítio o ovo sai todo dia e a alface leva um mês; no jogo a alface sai em 1 minuto e o ovo em 20. Planta é para "plantar e ver crescer" dentro da sessão; rotina de bicho é motivo para voltar.
- **A ordenha foge da régua da rotina.** Pela regra seria a cada 10 minutos. A sugestão é de 30 minutos a 1 hora (adaptação minha), porque a ordenha tem mais passos e o leite vale mais.
- **A ordem da vida real não bate com a da economia de hoje.** A economia escolheu os tempos pela ordem em que as culturas são liberadas (milho 1 min, feijão 3, mandioca 8, tomate 20). Pela vida real, a mandioca é a mais demorada e o tomate fica perto do milho. Fica como decisão para o plano de economia; o simulador tem a palavra final. Uma saída para o começo não arrastar: as três primeiras colheitas de milho saem em 1 minuto ("semente adiantada").

## 3. Cultivo

### Na vida real

- **Canteiro:** cerca de 1 m de largura, 5 a 10 m de comprimento, 15 a 20 cm de altura, com corredor de uns 50 cm [C8].
- **Milho:** semente direto na terra. Cerca de 75 dias para milho-verde e 90 para o grão seco. Leva adubo no plantio e de novo quando tem 4 a 6 folhas. O mato atrapalha mais nos primeiros 30 a 40 dias. Faltou água na florada, perde: 2 dias de seca tiram cerca de 20% [C1][C2].
- **Alface:** a muda fica uns 30 dias na bandeja e mais uns 35 no canteiro. Raiz rasa, não aguenta seca: rega frequente. Depois de colhida, dura pouco [C3].
- **Tomate:** vai de muda. Precisa de tutor (varas de 2,20 m) e de ser amarrado 15 a 20 dias depois. Começa a dar 75 a 80 dias depois da muda e segue dando por 4 a 6 colheitas. Rega irregular racha o fruto e causa podridão na ponta [C4].
- **Feijão:** 85 a 95 dias (há variedades de 65). Colheita à mão: arrancar o pé, deixar secar e bater para soltar o grão [C5].
- **Mandioca:** planta-se um pedaço do caule (maniva). Colhe-se de 8 a 14 meses depois. Aguenta seca, menos nos 3 primeiros meses. Arrancada, estraga em 2 a 3 dias [C6].
- **Laranjeira:** a muda enxertada começa a dar em 2 a 3 anos e chega à produção cheia no 4º ou 5º. Uma safra por ano (a laranja-pera, de julho a outubro), de 200 a 600 frutas por árvore. Plantio a cada 3 a 5 m na linha [C7].
- **Não confirmado:** quantas regas e de quantos em quantos dias para cada cultura; quanto se perde, em números, plantando sem adubo; que o milho de sítio pequeno costuma depender só da chuva (é o que se sabe em geral, mas não achei fonte).

### Por que estas culturas

| Cultura | Por que entra | O que ensina no jogo |
|---|---|---|
| Milho | Já está no protótipo; é a cara do sítio; vira ração de galinha | O básico: plantar, regar, colher |
| Alface | A mais rápida da horta | Regar (é a que mais pede água) |
| Feijão | Grão seco, guarda por muito tempo | Estocar para pedidos |
| Tomate | Um pé, várias colheitas | Voltar ao mesmo canteiro |
| Mandioca | Lenta e resistente | Plantar e deixar para a próxima sessão |
| Laranjeira | Árvore, não canteiro | Investimento que demora e depois dá sempre |

### No jogo (adaptado)

**Passos manuais.** (1) Capinar o quadrado de grama com a enxada, uma vez só: vira canteiro. (2) Plantar, com a semente do saco. (3) Pegar o regador, encher no poço e regar. (4) Esperar. (5) Colher na caixa. (6) Levar a caixa ao armazém ou à banca.

**O que é pulado:** bandeja de mudas e transplante, adubo de cobertura, capina do mato, pragas, secar e bater o feijão. O tutor do tomate aparece sozinho, só como desenho.

**O que vira melhoria depois:** adubo de esterco curtido (capítulo 5), mangueira, aspersor e gotejamento (cada um tira um passo da rega), segunda rega para alface e tomate.

**Estados do canteiro:** grama → terra pronta → plantado, aguardando rega (ícone de gota) → crescendo → pronto (ícone de colheita) → terra pronta de novo. O relógio do crescimento só anda depois da rega.

**O regador é um objeto.** Mora ao lado do poço. Carrega 3 regas (como no protótipo). O jogador pode largá-lo em qualquer lugar e ele fica ali, com um marcador discreto para ser achado. Quando o jogo fecha, as ferramentas largadas voltam para o lugar, para a sessão seguinte não começar com uma caça ao regador.

**Se o jogador descuidar.** Não regou: a planta espera, não morre. Não colheu: a planta pronta espera. Motivo: na vida real dois dias de seca já custam parte da safra [C2], mas quem joga no celular some por três dias e não pode voltar para um sítio morto. A perda fica para o nível "fundo" (passou muito do ponto, rende 1 a menos).

**Fontes do capítulo**

- [C1] Milho, ciclo e adubação (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1098805/1/Producaomilho.pdf ; milho-verde: https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1132153/1/CultivoMilhoVerdeIrrigadoBaixadaMaranhense.pdf
- [C2] Milho, mato e seca: https://www.agrolink.com.br/noticias/as-plantas-daninhas-interferem-na-linha-de-plantio-do-milho-_517583.html ; https://aegro.com.br/tags/deficit-hidrico-no-milho/
- [C3] Alface (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1092024/1/Alface-Crespa.2018.pdf ; seca: https://www.correiobraziliense.com.br/cbradar/aprenda-a-cultivar-em-casa-a-hortalica-mais-antiga-do-mundo/ ; depois de colhida: https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1126596/1/COMH-07-Hortalicas-folhosas-2020-08-11.pdf
- [C4] Tomate (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1020432/1/INT1202015.pdf ; https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/492069/1/832.pdf ; tutor: https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/360222/1/CPATC-CIR.-TEC.-14-99.pdf ; rega irregular: https://www.agrolink.com.br/culturas/tomate/informacoes-da-cultura/fitossanidade/como-controlar-doencas-fisiologicas-no-tomate-_488317.html
- [C5] Feijão (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/992459/1/catalogoFeijao-12jun2013.pdf ; colheita: https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1125542/1/08.pdf ; variedade de 65 dias: https://revistacultivar.com.br/noticias/cultivo-superprecoce-de-feijao-contribui-para-produtividade-e-resistencia-a-pragas
- [C6] Mandioca: https://goias.gov.br/agricultura/wp-content/uploads/sites/50/2021/03/CARTILHACULTIVODEMANDIOCA-fa2.pdf ; seca (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1133613/1/Recomendacao-tecnica-do-manejo-de-irrigacao-Circular-tecnica-51.pdf ; depois de colhida: https://periodicos.iftm.edu.br/index.php/inova/article/download/920/426/6980
- [C7] Laranjeira: https://www.em.com.br/emfoco/?p=43809 ; https://www.correiobraziliense.com.br/cbradar/como-plantar-laranjas-em-casa-e-colher-o-ano-inteiro/ ; espaçamento: https://aegro.com.br/blog/laranja-valencia/ ; safra: https://aegro.com.br/blog/producao-de-laranja-pera/
- [C8] Canteiro (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1128574/1/PreparoCanteirosCultivoHortalicas.pdf ; corredor: https://www.ecycle.com.br/curso-de-hortas-organicas-aula-1-conheca-principios-saiba-como-planejar-uma-guia-agricultura-casa-alimentacao-saudavel-pdicas-hortalica-agrotoxico-fertilizante-pesticida-sol-composteira-solo-rotacao-c/

## 4. Galinha

### Na vida real

- **Do ovo à galinha:** o ovo choca em 21 dias. O pintinho nasce com 37 a 40 g e precisa de calor (28 a 32 °C) nos primeiros 15 dias [G2][G3][G5]. A franga começa a botar entre a 18ª e a 24ª semana [G1][G2].
- **Postura:** o auge vem por volta da 27ª à 31ª semana, com 86 a 88% de postura (quase um ovo por dia). Depois cai devagar. Uma poedeira colonial melhorada produz até as 90 semanas e soma cerca de 345 ovos [G1]. Em granja, o lote é descartado por volta das 72 semanas [G3]. A caipira comum bota bem menos: 50 a 80 ovos por ano; as melhoradas, de 150 a 220 [G2]. Uma galinha pode viver de 5 a 10 anos [G3].
- **Poedeira e frango são aves diferentes.** O frango de granja vai para o abate com cerca de 42 dias e 2 kg; o caipira, com 85 dias no mínimo [G6].
- **Comida e água:** 115 a 120 g de ração por dia. Água: de 120 a 160 ml por dia, o dobro no calor (a origem dessa tabela é **não confirmada**) [G4].
- **Casa:** dentro do galinheiro, até 7 aves por m²; no terreiro, pelo menos 0,5 m² por ave. Um ninho de 30 × 35 cm para cada 4 ou 5 galinhas. Poleiro de 40 a 60 cm do chão, com uns 25 cm por ave [G7].
- **Ovos:** recolher várias vezes ao dia (em granja, a cada 2 horas). Não lavar, porque a água tira a proteção natural da casca; limpar a seco. Guardar na sombra [G8]. Classificação por peso: médio (38 a 48 g), grande (48 a 58 g), extra (58 a 68 g) e jumbo (acima de 68 g). Fora da geladeira, a 26,5 °C, a qualidade excelente dura só 6 dias; a 7 °C, até 30 dias [G9]. Vende-se em cartela de 12 e em bandeja de 30 (medidas e fontes no capítulo 9).
- **Saúde:** piolhos, ácaros e vermes; vacinas contra Marek (no 1º dia), Newcastle e bouba [G3][G5].
- **Não confirmado:** altura da galinha e tamanho do ovo em centímetros; quanto dura a troca de penas; prazo legal de validade do ovo.

### No jogo (adaptado)

**A cadeia do ovo** (o pedido do dono, passo a passo):

1. O personagem pega a **cesta** no gancho (o plano de economia chama de caixa de ovos). Cabem 12 ovos.
2. Passa pelos ninhos; cada toque num ninho põe os ovos na cesta.
3. Leva a cesta à **bancada**.
4. Pega uma **cartela vazia** da pilha e encaixa os ovos: 12 ovos viram 1 cartela.
5. A cartela vai para a prateleira e depois para a venda. Ovo avulso também vende, direto da cesta, por menos.

**O que é pulado:** limpar, pesar e classificar os ovos. **Modo automático, um degrau por vez:** cesta de 30 → ninho com calha que junta os ovos numa caixa → máquina de encartelar → caseiro que faz a ronda. Cada degrau tira um passo; fazer à mão continua possível. A bandeja de 30 pode entrar como melhoria para pedidos grandes.

**Bem-estar.** Uma carinha por galinha (contente, ou com fome ou sede), conferida na hora de botar: há ração no comedouro? Há água no bebedouro? Com as duas, 1 ovo por ciclo. Faltando comida ou água, 1 ovo a cada 2 ciclos; nunca zero. Voltaram a comida e a água, ela volta ao normal no ciclo seguinte. O comedouro guarda várias porções e cada ciclo gasta uma (o plano de economia fala em 2 milhos ou 1 ração por ovo). O bebedouro é enchido com o regador, o mesmo do canteiro, e dura alguns ciclos.

**Estados dos bichos** (valem para a galinha e para a vaca):

| Estado | Como aparece | O que muda | Quando entra |
|---|---|---|---|
| Fome | Comedouro ou cocho vazio | Baixa o bem-estar: produz metade | Primeira versão |
| Sede | Bebedouro vazio | Baixa o bem-estar: produz metade | Primeira versão |
| Saúde | Bicho indisposto, com ícone de remédio | Produz metade até ser tratado; não piora nem mata | Segunda versão |
| Idade | Filhote, adulto, fim da vida produtiva | Filhote ainda não produz; no fim da vida produtiva, para de produzir | Segunda versão |

**Idade (segunda versão).** Pintinho → franga → poedeira → fim da vida produtiva. O pintinho custa pouco e leva uns 30 minutos para botar (o plano de economia propõe 6 horas; ver o capítulo 12); a galinha pronta custa mais. A vida produtiva é contada em ovos: cerca de 300 (na vida real, 345 [G1]). O jogo avisa antes. Chegando lá, ela para de botar e o jogador escolhe uma das três saídas que o dono já definiu: ficar de estimação (não produz, mas continua comendo e bebendo), vender ao frigorífico ou vender a um fazendeiro vizinho. Chocar ovos fica para o nível "fundo".

**Estrutura.** Leve: até 3 galinhas soltas no terreiro, com ninho, comedouro e bebedouro, como no protótipo (na vida real um ninho serve 4 ou 5 galinhas [G7]). Para ter mais, o galinheiro fechado com poleiro, que no plano de economia tem 6 e depois 9 vagas.

**Se o jogador descuidar.** Sem comida ou água: metade dos ovos, nunca morte. Ovo não recolhido: o ninho guarda até 3 e a galinha para de botar até alguém recolher. Motivo: no sítio o ovo é recolhido várias vezes ao dia [G8]; o ninho cheio é um jeito leve de lembrar disso.

**Fontes do capítulo**

- [G1] Poedeira colonial Embrapa 051: https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1169446/1/Poedeira-Colonial-Embrapa-051-ValdirAvila.pdf ; https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1076928/1/Manual051web.pdf
- [G2] Galinha caipira (Sebrae): https://sebrae.com.br/Sebrae/Portal%20Sebrae/UFs/RN/Anexos/Cartilha_Criacao_de_Aves_Caipiras.pdf ; (Incaper): https://biblioteca.incaper.es.gov.br/digital/bitstream/item/2506/1/I-SICT-PIBIT-008-1.pdf
- [G3] Wikipédia: https://pt.wikipedia.org/wiki/Galinha ; https://en.wikipedia.org/wiki/Chicken ; https://en.wikipedia.org/wiki/Poultry_farming
- [G4] Ração (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/443258/1/itav020.pdf ; água (manual de linhagem comercial, tabela de origem não confirmada): https://edisciplinas.usp.br/pluginfile.php/5354269/mod_resource/content/1/Manual%20de%20Manejo%20Hy-Line%20W36%20%282020%29.pdf
- [G5] Incubação (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1084803/1/CIRC85.pdf ; calor do pintinho (Emater-DF): https://emater.df.gov.br/wp-content/uploads/2018/06/Folder_manejo_avicultura_autor.pdf ; vacinas (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1099813/1/FolderManejosanitario.pdf ; peso ao nascer: https://avinews.com/pt-br/qualidade-de-pintinho/
- [G6] Frango de granja: https://en.wikipedia.org/wiki/Broiler ; https://www.band.com.br/agro/noticias/frango-nao-tem-hormonio-e-cresceram-apos-melhoramento-genetico-202505181338 ; frango colonial (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/434572/1/Recomendacoes-tecnicas-para-a-producao-abate-processamento-e-comercializacao-de-frangos-de-corte-coloniais.pdf
- [G7] Galinheiro (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1099811/1/FolderAviario.pdf ; https://www.agrolink.com.br/noticias/galinheiro-na-agricultura-familiar--confira-o-passo-a-passo-para-construir-a-estrutura_517710.html
- [G8] Ovos, coleta e limpeza (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1175543/1/CP-03-24-Cartilha-OvoLimpo-13-mai-2025.pdf ; https://www.tribunapr.com.br/noticias/curitiba-regiao/ovo-com-casca-suja-comprar-ou-fugir-embrapa-explica/amp/
- [G9] Ovos, classificação: https://en.wikipedia.org/wiki/Chicken_egg_sizes ; duração: https://avinews.com/pt-br/voce-sabe-como-determinar-a-vida-de-prateleira-dos-ovos-e-seus-derivados/

## 5. Vaca

### Na vida real

- **Ciclo:** o bezerro nasce com uns 43 kg e 76 cm de altura [V1]. A novilha tem a primeira cria entre 24 meses (holandesa bem tratada) e 33 meses (média medida em vacas girolando). A gestação dura cerca de 280 dias. A vaca só dá leite depois de parir. Ordenha-se por uns 305 dias, com o auge entre 40 e 60 dias depois do parto; depois ela "seca" e descansa uns 60 dias antes da cria seguinte. Dá uma cria a cada 12 a 14 meses [V2].
- **Vida produtiva:** em teoria até 10 lactações; entre as vacas holandesas dos Estados Unidos a média fica abaixo de 3. A girolando, raça que responde por cerca de 80% do leite brasileiro, chega ao auge aos 8 anos e produz até os 15 [V2].
- **Litros:** a média do Brasil em 2025 foi de 2.499 litros por vaca no ano, cerca de 6,8 por dia (conta minha); no Sul, 4,3 mil por ano. Fazenda especializada passa de 12 litros por dia. No campo se fala em "vaca de 10 litros" e "vaca de 30 litros" [V4].
- **Ordenha à mão, passo a passo:** separar o material; deixar o bezerro mamar um pouco para o leite descer; amarrar a vaca; sentar no banquinho; tirar os 3 primeiros jatos numa caneca de fundo preto (grumos indicam mastite); limpar e secar as tetas; ordenhar no balde; coar ao despejar no latão; passar iodo nas tetas; levar o leite para o frio; lavar tudo. Duas vezes por dia, com umas 12 horas de intervalo [V3].
- **O que derruba a produção:** falta de água (uma vaca de 500 kg em lactação bebe uns 50 litros por dia, até o dobro no calor); calor (perdas de 10% a 21%); mastite (até 3 litros a menos por dia); comida fraca [V5].
- **Depois da ordenha:** coar e esfriar a 4 °C em até 3 horas; o leite cru fica no máximo 48 horas na propriedade. A pasteurização lenta é a 62 a 65 °C por 30 minutos; pasteurizado, o leite dura cerca de 7 dias na geladeira (número de texto de divulgação, **não confirmado**). A venda de leite cru direto ao consumidor é proibida no Brasil desde 1969 [V6].
- **Estrutura:** curral de espera com 2,0 m² por vaca e sombra; bebedouro para 40 litros ou mais por vaca por dia; cocho com mais de 0,6 m por vaca; cerca com arame na altura do peito (telas de 1,00 a 1,20 m, mourões a cada 2 m); porteira de madeira dura, de uma ou duas folhas [V7].
- **Esterco:** uma vaca de 500 kg produz uns 50 kg de dejetos por dia. Fica pronto (curtido) em 60 a 90 dias: acinzentado, seco, quase sem cheiro. Vai de 2 a 8 kg por m² de canteiro. Esterco fresco faz mal à horta [V8].
- **Não confirmado:** quantos minutos leva a ordenha manual de uma vaca; litros por ordenha; medida padrão de porteira; prazo legal de validade do leite.

### No jogo (adaptado)

**A cadeia do leite** (o pedido do dono, passo a passo):

1. O personagem pega o **balde** e o **banquinho** no gancho do curral.
2. Entra pela porteira, senta ao lado da vaca e ordenha. O balde enche.
3. Leva o balde à **bancada**.
4. Coa e engarrafa: **1 balde = 2 garrafas** (precisa de 2 garrafas vazias). Na vida real uma vaca comum de sítio dá de 3 a 5 litros por ordenha (conta minha, a partir de [V4]), o que encheria de 3 a 5 garrafas de 1 litro; o jogo fica com 2, como no exemplo do dono, para a conta ser simples.
5. As garrafas vão para o canto frio e depois para a venda. O balde cheio também pode ser vendido direto ao laticínio, por menos.

**O que é pulado:** teste da caneca, limpeza das tetas, iodo, lavar o material, pasteurizar. A lei do leite cru é ignorada: é um jogo. **Modo automático, um degrau por vez:** latão (leva 4 baldes de uma vez) → ordenhadeira de balde ao pé, que existe de verdade [V3] → máquina de engarrafar → caseiro.

**Bem-estar.** Igual ao da galinha, conferido na hora da ordenha: comida no cocho e água no bebedouro (levada do poço no balde). Com as duas, o balde rende 2 garrafas. Faltando comida ou água, o balde vem pela metade: 1 garrafa. No nível "médio", sombra e uma escovada rendem a 3ª garrafa, e de vez em quando a vaca fica indisposta e pede um remédio (até lá, rende metade).

**Ciclo e idade (segunda versão).** Na primeira versão a vaca é comprada adulta e dá leite sempre. Depois: a cada 80 ordenhas (exemplo) ela descansa de 2 a 4 horas e volta com um bezerro, que o jogador vende. Depois de 5 lactações (as 400 ordenhas do plano de economia) ela seca de vez, e valem as mesmas três saídas da galinha: estimação, frigorífico ou fazendeiro. Criar a bezerra até virar vaca (24 a 48 horas) é nível "fundo".

**Curral e porteira.** A vaca só pode ser comprada com o curral pronto: cerca, porteira, cocho, bebedouro e sombra. Tamanho sugerido: 6 × 5 u para 2 vacas (capítulo 9). O personagem abre a porteira ao chegar e fecha ao passar; não há risco de fuga na primeira versão. Esquecer a porteira aberta e a vaca ir comer a horta é evento para o nível "médio".

**Esterco como adubo (projeto futuro).** Montes aparecem no curral (até 3; no começo não atrapalham nada). O personagem recolhe com pá e carrinho de mão, leva à esterqueira, espera curtir (10 minutos pela regra) e ensaca. Um saco no canteiro dá 1 unidade a mais na colheita. Fecha o círculo: milho → ração → vaca → esterco → milho.

**Se o jogador descuidar.** Sem comida ou água: metade do leite, nunca doença grave nem morte. Não ordenhou: a vaca espera. Motivo: no sítio a ordenha tem hora certa, duas vezes por dia [V3]; cobrar isso obrigaria o jogador a ter horário.

**Fontes do capítulo**

- [V1] Bezerro ao nascer (UDESC): https://www.udesc.br/arquivos/cav/id_cpmenu/1281/andre_dias_15670862900614_1281.pdf
- [V2] Ciclo: https://en.wikipedia.org/wiki/Dairy_cattle ; https://docs.ufpr.br/~freitasjaf/artigos/manejogeral.pdf ; primeira cria da holandesa: https://www.agrolink.com.br/colunistas/manejo-da-femea-na-propriedade-leiteira--parte-2---do-nascimento-ao-primeiro-parto-_385544.html ; girolando (Embrapa): https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/532745/1/APIIdadeaoprimeiropartoeintervalodepartosdecincogruposgeneticosHolandesxGirnoBrasil.pdf ; https://pt.wikipedia.org/wiki/Girolando
- [V3] Ordenha (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1063391/1/Agreste.pdf ; https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1080124/1/FFC17001.pdf ; https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/595601/1/100-recomendacoes-para-o-bom-desempenho-da-atividade-leiteira.pdf ; https://pt.wikipedia.org/wiki/Ordenha
- [V4] Litros por vaca: https://www.agrolink.com.br/noticias/producao-de-leite-bate-recorde-mesmo-com-reducao-de-vacas-ordenhadas_519368.html ; (Embrapa) https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/921738/1/Quantos-sao-os-produtores-de-leite-no-Brasil.pdf
- [V5] Água e calor (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/65941/1/EstresseTermico-S-32-08.pdf ; https://www.agrolink.com.br/colunistas/o-estresse-termico-parte-4--principais-efeitos-em-bovinos-leiteiros_385134.html ; mastite (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/942831/1/Mastite-e-qualidade-do-leite.pdf ; comida: https://docs.ufpr.br/~freitasjaf/artigos/manejogeral.pdf
- [V6] Leite depois da ordenha (Instrução Normativa 77/2018): https://wikisda.agricultura.gov.br/dipoa_baselegal/in_77-2018_criterios_produção_coleta_transporte_leite.pdf ; pasteurização: https://www.infoescola.com/saude/processos-de-pasteurizacao-do-leite/ ; leite cru: https://olhardigital.com.br/2025/10/25/ciencia-e-espaco/beber-leite-cru-e-perigoso-saiba-o-que-dizem-os-especialistas/
- [V7] Curral e cocho (Embrapa): https://ainfo.cnptia.embrapa.br/digital/bitstream/doc/1169411/1/Sistemas-de-producao-vacas-em-lactacao-em-confinamento.pdf ; https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/862792/1/Conforto-e-bem-estar-para-bovinos-leiteiros.pdf ; cerca: https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/348285/1/CPAFAP2001Contencaoanimal.pdf ; https://www.belgo.com.br/wp-content/uploads/2023/01/manual_cercas_instalacoes.pdf ; porteira: https://pt.wikipedia.org/wiki/Porteira
- [V8] Esterco (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/596058/1/Dejetos-em-vez-de-problema-solucao.pdf ; https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1005405/1/p.8589.pdf ; https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/758609/4/ct65.pdf ; esterqueira (Pesagro-RJ): https://www.rj.gov.br/pesagro/sites/default/files/arquivos_paginas/04.%20Esterqueira%20para%20dejetos%20bovinos.pdf ; esterco fresco: https://www.correiobraziliense.com.br/cbradar/perigos-do-esterco-fresco-na-horta-como-curtir/

## 6. Armazém

### Na vida real

- **Os nomes:** celeiro é a construção que guarda grãos, feno e ferramentas; silo guarda grão solto, a granel [A1]; paiol é o depósito do milho em espiga, ventilado e protegido de ratos, onde o milho termina de secar [A2].
- **Grão seco:** guardado com 12,5 a 13,5% de umidade, em sacos sobre estrados de 10 cm, afastados da parede. Milho seco bem guardado dura de 6 meses a 1 ano [A2].
- **O que estraga rápido:** alface [C3], mandioca (2 a 3 dias) [C6], ovo fora do fresco [G9], leite fora do frio [V6]. Conclusão minha: o celeiro de verdade guarda o que é seco; o que é fresco sai logo para a venda ou vai para o frio.
- **Galpão:** pé-direito de pelo menos 3 m; um galpão rústico anunciado tinha 10 × 6 m [A3]. A colheita anda em caixas plásticas de uns 45 litros (55 × 36 × 30 cm), com 15 a 20 kg cada [A4].
- **Não confirmado:** tamanho típico de celeiro de sítio pequeno; medidas de estante; largura de corredor.

### No jogo (adaptado)

**Primeiro, a porta; depois, o lado de dentro.** Na primeira versão o armazém funciona como no protótipo: o personagem entra pela porta, some e o produto está guardado. O lado de dentro chega na segunda versão (no plano de economia, é o "armazém grande" da etapa 8).

**Cena separada.** O personagem chega à porta, a tela troca e ele aparece dentro. Três motivos: por dentro o armazém pode ser maior do que por fora (por fora ele precisa ser pequeno para sobrar terreno); a cena de dentro tem poucos objetos, o que ajuda o celular fraco; e a troca de cena é simples de usar no controle da TV.

**Cada coisa no seu canto**, seguindo a vida real:

| Canto | O que guarda | Na vida real |
|---|---|---|
| Estrados | Sacos de milho, feijão e ração | Sacos fora do chão [A2] |
| Prateleiras | Caixas de colheita, cartelas de ovos | Caixas de 45 litros [A4] |
| Canto frio | Garrafas de leite (tanque com água fria; depois, geladeira) | Leite a 4 °C [V6] |
| Pilha de vazios | Cartelas e garrafas vazias | — |
| Bancada | Encartelar, engarrafar, consertar | — |

**Capacidade é o que se vê.** Cada móvel guarda um tanto, e cada ampliação da economia vira um móvel novo lá dentro. A economia antiga tinha dois estoques (silo para a colheita, celeiro para os produtos); o plano novo junta os dois num armazém só, dividido por prateleiras, e esta proposta segue assim.

**Organizar, sem obrigar.** O produto se arruma sozinho no móvel certo; quem quiser escolhe onde fica cada móvel na malha (é o "expandir e organizar" do pedido). Arrumar caixa por caixa, com um pequeno prêmio para quem organiza bem, fica para o nível "fundo".

**Bancada e ganchos do lado de fora.** Ferramenta e bancada são usadas o tempo todo; trocar de cena para pegar a enxada cansaria. Sugestão: uma varanda encostada no depósito, com a bancada e os ganchos à vista. O lado de dentro fica para o estoque e, mais tarde, para as máquinas. O tamanho do interior no capítulo 9 já conta com uma bancada lá dentro.

**Se o jogador descuidar.** Armazém cheio: o excedente é vendido na hora, como a economia já define; nunca trava. Nada estraga na primeira versão. Mais tarde, o frescor pode entrar só como prêmio (produto fresco vale um pouco mais por algumas horas), nunca como lixo.

**Fontes do capítulo**

- [A1] Celeiro e silo: https://pt.wikipedia.org/wiki/Celeiro ; https://pt.wikipedia.org/wiki/Silo
- [A2] Grãos e paiol (Embrapa): https://ainfo.cnptia.embrapa.br/digital/bitstream/item/53115/1/Armazenamento.pdf ; https://ainfo.cnptia.embrapa.br/digital/bitstream/item/41748/1/Armazem-milho.pdf ; https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/476408/1/Milhoespiga.pdf ; duração: https://aegro.com.br/blog/armazenar-milho-2025/
- [A3] Galpão: https://www.canalrural.com.br/aves-e-suinos/criacao-de-galinhas-exige-galpao-orientado-no-sentido-leste-oeste-e-manejo-adequado/ ; https://www.mfrural.com.br/detalhe/244671/galpao-rustico-de-costaneira
- [A4] Caixas: https://www.telhanorte.com.br/caixa-para-mercado-45-litros-preto-arthi-1414143/p ; (Embrapa) https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/942556/1/ct1071.pdf

## 7. Ferramentas e recipientes

### Na vida real

- **Regador:** de 0,5 a 10 litros; o de 10 litros tem de 50 a 59 cm com o bico [F1].
- **Balde:** os de casa vão de 7 a 20 litros; o de leite, galvanizado, de 12 litros, tem 30 cm de boca [F2]. Para ordenha manual, a recomendação é balde semiaberto de 10 litros [V3].
- **Carrinho de mão:** caçamba de 50 a 80 litros; o de 60 litros pesa de 15 a 17 kg [F3].
- **Por tarefa:** horta: enxada, regador e caixa de colheita [F4][A4]. Ordenha: balde, banquinho, caneca de fundo preto, coador e latão [V3]. Ovos: cesta ou bandeja que se possa limpar [G8].
- **Cuidado:** enxada afiada e guardada longe da umidade [F4].
- **Vida útil: não confirmado.** Não achei tabela pública de duração de ferramenta manual. Só existe regra para máquina (trator: 10 anos), com perda de valor igual a cada ano [F4]. A vida útil no jogo é número de jogo, sem base real.

### No jogo (adaptado)

| Objeto | Para quê | Onde mora | Carrega | Como o desgaste aparece |
|---|---|---|---|---|
| Enxada | Abrir canteiro | Gancho | — | Cega: precisa de mais um golpe |
| Regador | Regar; dar água às galinhas | Ao lado do poço | 3 regas por carga | Vaza: 2 regas em vez de 3 |
| Caixa de colheita | Colher e levar | Pilha na varanda | Uma colheita de alguns canteiros | Racha: leva um terço a menos |
| Cesta (caixa de ovos) | Recolher ovos | Gancho | 12 ovos | Fura: leva 8 |
| Balde | Ordenhar; levar água | Gancho do curral | 1 ordenha | Amassa: derrama um pouco no caminho |
| Banquinho | Ordenhar | Junto do balde | — | Não gasta |
| Cartela | Embalar 12 ovos | Pilha de vazios | 12 ovos | Um uso: vai embora com a venda |
| Garrafa | Embalar 1 litro | Pilha de vazios | 1 litro | Um uso (ou volta vazia) |
| Pá e carrinho de mão | Esterco; várias caixas de uma vez (futuro) | Ao lado do curral | 1 ou 2 caixas | Roda dura: anda devagar |

Quantos usos cada ferramenta aguenta, quanto custa e quanto custa o conserto estão na seção 4 do plano de economia (por exemplo, caixa de ovos: 100 viagens; balde: 150 ordenhas). A contribuição daqui é o desenho: o desgaste tem de aparecer no objeto e no resultado, de um jeito que lembre a vida real.

**Regras.**

1. **Lugar marcado.** Cada ferramenta tem gancho ou canto; a silhueta mostra o que está faltando.
2. **Uma coisa por vez nas mãos.** É o que dá sentido à caixa, à cesta e, mais tarde, ao carrinho.
3. **O personagem busca sozinho.** O jogador toca no objetivo (o ninho, a vaca, o canteiro); se falta a ferramenta, o personagem vai buscar antes. Os passos de "fazer" pedem toque; os de "ir buscar", não.
4. **Largar no chão é permitido.** O objeto fica onde foi largado, com marcador, e volta ao lugar quando o jogo fecha.
5. **Gasta, mas não some.** Três aparências (nova, usada, gasta). A ferramenta gasta rende um terço a menos até ser consertada ou trocada. Nunca quebra no meio de uma tarefa.
6. **Compra chega pela porteira.** O que o jogador compra aparece numa caixa na entrada do sítio, e o personagem leva para o lugar.

**Fontes do capítulo**

- [F1] Regador: https://en.wikipedia.org/wiki/Watering_can ; https://www.petz.com.br/produto/regador-policamp-10-litros-cores-sortidas
- [F2] Balde: https://pt.wikipedia.org/wiki/Balde ; https://www.magazineluiza.com.br/busca/balde+leite/
- [F3] Carrinho de mão: https://www.aecweb.com.br/produto/carrinho-caixa-quadrada-60-l/51629
- [F4] Cuidado com a enxada: https://www.correiobraziliense.com.br/cbradar/conheca-as-ferramentas-essenciais-para-cuidar-da-sua-horta-em-casa/ ; perda de valor de máquinas: https://cti.ufpel.edu.br/siepe/arquivos/2021/EN_02658.pdf

## 8. Três níveis de profundidade

| Sistema | Leve (primeira versão) | Médio (segunda versão) | Fundo (se o jogo pedir) |
|---|---|---|---|
| Cultivo | Capinar, plantar, 1 rega, colher na caixa; planta espera pela água | Regas diferentes por cultura; adubo de esterco; mato em canteiro parado; mangueira | Chuva e seca; pragas; passar do ponto; irrigação automática |
| Galinha | Até 3 soltas, com ninho, comedouro e bebedouro; bem-estar; cesta → bancada → cartela | Galinheiro com poleiro; pintinho; vida produtiva em ovos e as três saídas; remédio | Chocar ovos; frango de corte; ovo por tamanho; doenças e vacinas |
| Vaca | Curral com porteira; bem-estar; balde → bancada → garrafas | Descanso e bezerro; vida produtiva em ordenhas e as três saídas; sombra e escova; remédio; esterco | Criar a bezerra; mastite; queijo e pasteurização; raças de 10 e de 30 litros |
| Armazém | Entra pela porta e some; bancada e ganchos na varanda; cheio, vende o excedente | Cena de dentro com móveis; capacidade = móveis; jogador posiciona; frescor como prêmio | Caixa por caixa; validade de verdade |
| Ferramentas | Objeto com lugar; personagem busca sozinho; desgaste simples; cartela e garrafa | Consertar ou trocar; ferramenta melhor carrega mais; carrinho de mão | Fabricar ferramenta; ferrugem se ficar na chuva |

**Recomendação.** Fazer o "leve" inteiro antes de qualquer item do "médio". Os três pedidos que ficam para a segunda versão (armazém por dentro, idade dos bichos e esterco) dependem de as cadeias básicas estarem gostosas de jogar; e a idade mexe com compra, venda e apego do jogador ao bicho, o que merece teste antes.

## 9. Escala

### A regra

**1 metro de verdade = 1 unidade do mundo (1 u).** Essa é a base e vale para o chão: distâncias, terreno, curral. Cada categoria de coisa tem um fator, e a conta é sempre a mesma: **medida no jogo = medida real × fator.**

O princípio dos fatores: coisa pequena cresce (senão some na tela do celular), coisa grande fica igual ou encolhe (senão toma o terreno), e o que o personagem pega ou usa acompanha o tamanho do personagem.

| Categoria | Fator | Por quê |
|---|---:|---|
| Chão e distâncias (terreno, curral, terreiro, vão da porteira) | 1,0 | É a base |
| Personagem | 1,176 | O personagem do protótipo tem 2,0 u; o adulto real, 1,70 m [E1] |
| Na medida do corpo (porta, cama, prateleira, bancada, banquinho, cabo de ferramenta, carrinho) | 1,2 | Tem de casar com o personagem |
| Objeto de mão (balde, regador, caixa, cesta, cartela, garrafa) | 1,5 | Precisa ser reconhecido na mão dele, em tela pequena |
| Miudeza (ovo) | 2,5 | Sem isso vira um ponto |
| Bicho grande (vaca, cocho) | 1,1 | Já é grande; só um toque de desenho |
| Bicho pequeno (galinha, ninho, poleiro) | 2,2 | Galinha em tamanho real ficaria minúscula ao lado do personagem |
| Filhote | bezerro 1,3; pintinho 3,0 | Um pouco mais que a mãe, para aparecer |
| Canteiro | 1,8 (corredor 1,4) | É alvo de toque: precisa caber o dedo e a planta |
| Planta de canteiro | baixa 2,0; alta 0,7 | Todas ficam entre 0,5 e 1,6 u, para aparecer sem esconder o personagem |
| Árvore | altura 1,0; copa 0,65 | A copa encolhe para não tapar o terreno |
| Construção pequena usada por fora (poço, galinheiro) | 1,2 | O personagem mexe nela de perto |
| Construção grande vista por fora (paiol, celeiro, armazém) | 0,6 | Encolhe para sobrar terreno; por dentro é outra cena |
| Interior do armazém | 1,25 | Uma casa da malha = 1 m de piso = 1,25 u |
| Altura de cerca e porteira | 0,85 | Mais baixa, para não esconder os bichos |

### A tabela

A coluna "Situação" diz se a medida real tem fonte: **confirmada**, **parcial** (a fonte dá uma faixa, um caso só ou parte da medida) ou **estimativa** (número meu, sem fonte). A coluna "Protótipo hoje" mostra o que já existe em `prototypes/sitio-minimo/`, para comparar.

| Coisa | Medida real (m) | Fator | No jogo (u) | Protótipo hoje (u) | Situação | Nota |
|---|---|---:|---|---|---|---|
| Pessoa adulta | altura 1,70 | 1,176 | 2,00 | 2,00 | confirmada [E1] | IBGE mediu 1,707 m (homens) e 1,588 m (mulheres). Fator = 2,0 ÷ 1,70. |
| Galinha | altura 0,40 | 2,2 | 0,88 | 0,90 | estimativa | Altura real é estimativa; só o peso (1,9 a 3 kg) tem fonte. |
| Pintinho | altura 0,08 | 3,0 | 0,24 | — | estimativa | Altura real é estimativa; nasce com 37 a 40 g. |
| Vaca leiteira | altura no ombro 1,40; comprimento 2,10 | 1,1 | 1,54 × 2,31 | 1,52 × 2,30 | parcial [E2] | Holandesa 1,45 a 1,65 m; Jersey 1,15 a 1,20 m; 1,40 m é um meio-termo. Comprimento é estimativa. |
| Bezerro ao nascer | altura no ombro 0,76 | 1,3 | 0,99 | — | confirmada [E3] | Medida de bezerros holandeses. |
| Canteiro (um quadrado) | lado 1,00 | 1,8 | 1,80 | 1,80 | confirmada [E4] | Real: 1 m de largura por 5 a 10 m de comprimento. O jogo usa quadrados e aumenta para caber o dedo e a planta. |
| Canteiro, altura da terra | altura 0,18 | 1,0 | 0,18 | — | confirmada [E4] | 15 a 20 cm. |
| Corredor entre canteiros | largura 0,50 | 1,4 | 0,70 | 0,70 | parcial [E5] | A fonte é um curso de horta, não uma norma. |
| Pé de alface | largura 0,25 | 2,0 | 0,50 | — | estimativa | Planta baixa cresce para aparecer. |
| Pé de milho | altura 2,20 | 0,7 | 1,54 | — | parcial [E6] | A fonte diz que chega a 2,5 m e cita variedade com cerca de 2,20 m. Planta alta encolhe para não esconder o personagem. |
| Tomateiro no tutor | altura 2,20 | 0,7 | 1,54 | — | parcial [E7] | A fonte dá varas de 2,20 m para o tutor. |
| Pé de mandioca | altura 2,00 | 0,7 | 1,40 | — | estimativa |  |
| Laranjeira adulta, altura | altura 4,00 | 1,0 | 4,00 | 4,00 | parcial [E8] | 4 m é estimativa de árvore de pomar; a fonte diz que, solta, ela chega a 9 a 10 m. A fruta fica a 2,05 u, no alcance da mão. |
| Laranjeira adulta, copa | largura 4,00 | 0,65 | 2,60 | 2,60 | parcial [E9] | Deduzido do espaçamento de 3 a 5 m entre plantas. Encolhe para não tapar o terreno. |
| Poço cavado à mão | largura por fora 1,35; altura da mureta 0,70 | 1,2 | 1,62 × 0,84 | 1,65 × 0,80 | parcial [E10] | A fonte dá 0,90 m ou mais por dentro. Parede e mureta são estimativa. |
| Ninho | largura 0,30; profundidade 0,35 | 2,2 | 0,66 × 0,77 | 0,76 × 0,76 | confirmada [E11] | Acompanha o fator da galinha. |
| Poleiro | altura do chão 0,50 | 2,2 | 1,10 | — | confirmada [E12] | 40 a 60 cm. |
| Galinheiro pequeno (6 galinhas) | largura 2,00; profundidade 1,50; altura 1,80 | 1,2 | 2,40 × 1,80 × 2,16 | — | estimativa [E11] | Pela regra de 7 aves por m² bastaria 1 m²; 2,0 × 1,5 m é estimativa de galinheiro de quintal. |
| Terreiro cercado (6 galinhas) | largura 3,00; profundidade 2,80 | 1,0 | 3,00 × 2,80 | 3,00 × 2,80 | parcial [E11] | Mínimo real: 0,5 m² por ave (3 m² para 6). O jogo dá mais chão porque a galinha é desenhada maior. |
| Curral pequeno (2 vacas) | largura 6,00; profundidade 5,00 | 1,0 | 6,00 × 5,00 | — | estimativa [E13] | As fontes só dão o mínimo de 2,0 a 2,2 m² por vaca no curral de espera. O pasto do protótipo (1 vaca) tem 3,6 × 3,4 u. |
| Cerca do curral | altura 1,20 | 0,85 | 1,02 | — | parcial [E14] | Telas de 1,00 a 1,20 m; arame na altura do peito do animal. Mais baixa no jogo para não esconder os bichos. |
| Cerca do curral, mourões | distância entre mourões 2,00 | 1,0 | 2,00 | — | parcial [E14] | Indicação de fabricante. |
| Porteira do curral | largura 2,00 | 1,0 | 2,00 | 1,30 | estimativa [E15] | Não achei medida padrão; a única referência é uma entrada de 3 m com duas folhas. Altura igual à da cerca. |
| Cocho (2 vacas) | comprimento 1,40 | 1,1 | 1,54 | — | parcial [E16] | A fonte diz que 0,5 a 0,6 m por vaca é pouco; usei 0,7 m por vaca. |
| Banquinho de ordenha | altura 0,28 | 1,2 | 0,34 | 0,34 | estimativa |  |
| Depósito pequeno, por fora (paiol) | largura 6,00; profundidade 5,00 | 0,6 | 3,60 × 3,00 | 3,60 × 3,00 | estimativa [E17] | Encolhe por fora para sobrar terreno. Única referência real: galpão rústico anunciado com 10 × 6 m. |
| Depósito médio, por fora (celeiro) | largura 8,00; profundidade 6,00 | 0,6 | 4,80 × 3,60 | — | estimativa [E17] |  |
| Depósito grande, por fora (armazém grande) | largura 10,00; profundidade 8,00 | 0,6 | 6,00 × 4,80 | — | estimativa [E17] |  |
| Porta do depósito | largura 1,40; altura 2,05 | 1,2 | 1,68 × 2,46 | 1,70 × 2,45 | estimativa | Acompanha o personagem de 2,0 u, não a parede. |
| Armazém por dentro, altura | pé-direito 3,00 | 1,2 | 3,60 | — | confirmada [E18] | Pelo menos 3 m. |
| Uma casa da malha do interior | lado 1,00 | 1,25 | 1,25 | — | estimativa | Regra de desenho: 1 m de piso = 1 casa de 1,25 u. |
| Armazém por dentro, inicial (6 × 5 casas) | largura 6,00; profundidade 5,00 | 1,25 | 7,50 × 6,25 | — | estimativa | Cabem 4 prateleiras, 2 estrados, bancada, canto frio e pilha de vazios, com miolo livre de 4 × 3 casas. |
| Armazém por dentro, ampliado (8 × 6 casas) | largura 8,00; profundidade 6,00 | 1,25 | 10,00 × 7,50 | — | estimativa |  |
| Armazém por dentro, completo (10 × 8 casas) | largura 10,00; profundidade 8,00 | 1,25 | 12,50 × 10,00 | — | estimativa |  |
| Corredor para o personagem andar | largura mínima 1,00 | 1,25 | 1,25 | — | estimativa | Uma casa. O personagem com a caixa nas mãos ocupa cerca de 1,0 u. |
| Cama de solteiro | largura 0,88; comprimento 1,88; altura até o colchão 0,55 | 1,2 | 1,06 × 2,26 × 0,66 | — | parcial [E19] | Colchão padrão de 88 × 188 cm; altura de 55 a 65 cm segundo um guia de compra. O personagem de 2,0 u cabe deitado. |
| Prateleira (estante) | largura 1,00; profundidade 0,40; altura 1,70 | 1,2 | 1,20 × 0,48 × 2,04 | — | estimativa | Altura limitada pelo alcance da mão do personagem (2,05 u). |
| Estrado para sacos | lado 1,00; altura 0,10 | 1,2 | 1,20 × 0,12 | — | parcial [E20] | Só a altura (10 cm do chão) tem fonte. |
| Bancada de trabalho | altura 0,85; comprimento 2,00; profundidade 0,60 | 1,2 | 1,02 × 2,40 × 0,72 | — | parcial [E21] | Fontes dão 0,82 a 1,00 m de altura. Fica na altura das mãos do personagem (1,0 u). Tampo é estimativa. |
| Balde de 12 litros | boca 0,305; altura 0,29 | 1,5 | 0,46 × 0,44 | — | confirmada [E22] | Medida de anúncio de balde galvanizado. |
| Regador de 10 litros | comprimento com o bico 0,55; altura 0,35 | 1,5 | 0,83 × 0,53 | — | confirmada [E23] | Lojas: 50 a 59 cm de comprimento, 32 a 40 cm de altura. |
| Cesta ou caixa de recolher ovos | largura 0,35 | 1,5 | 0,53 | — | estimativa |  |
| Caixa de colheita | comprimento 0,55; largura 0,36; altura 0,30 | 1,5 | 0,83 × 0,54 × 0,45 | — | confirmada [E24] | Caixa plástica de 45 litros. |
| Cartela de 12 ovos | comprimento 0,28; largura 0,10 | 1,5 | 0,42 × 0,15 | — | parcial [E25] | Medida de um modelo de plástico. |
| Bandeja de 30 ovos | lado 0,29 | 1,5 | 0,44 | — | parcial [E26] | Anúncios de bandeja de papelão: 29 a 29,3 cm de lado. |
| Garrafa de leite de 1 litro | altura 0,27; largura 0,09 | 1,5 | 0,41 × 0,14 | — | confirmada [E27] | Lojas: 25 a 32 cm de altura, 8 a 9,5 cm de largura. |
| Ovo | comprimento 0,057 | 2,5 | 0,14 | — | estimativa | Medida estimada; só o peso (48 a 68 g) tem fonte. |
| Carrinho de mão de 60 litros | comprimento da caçamba 0,73; largura da caçamba 0,56 | 1,2 | 0,88 × 0,67 | — | confirmada [E28] |  |
| Enxada | comprimento do cabo 1,50 | 1,2 | 1,80 | — | estimativa |  |

O arquivo `docs/planejamento/escala.json` traz as mesmas medidas, uma por linha (por isso tem mais linhas do que a tabela), com os campos `real_m`, `fator` e `jogo_unidades`, além de `categoria`, `situacao_medida_real`, `fonte`, `prototipo_unidades` e `nota`. Para mudar a escala de uma categoria, troca-se o fator e refaz-se a conta.

**A calculadora, em duas contas.** Do real para o jogo: multiplicar pelo fator (uma porta de 2,05 m × 1,2 = 2,46 u). Do jogo para o real: dividir (um curral de 6 u ÷ 1,0 = 6 m). Para uma coisa nova, basta escolher a categoria.

**Medidas reais não confirmadas** (na tabela aparecem como estimativa): altura da galinha e do pintinho; tamanho do ovo; largura padrão de porteira; mureta do poço; estante; largura de corredor; tamanho típico de galinheiro e de celeiro de sítio pequeno; altura da laranjeira de pomar. Também não achei medida da caixa de papelão de 30 dúzias de ovos, que por isso ficou fora da tabela.

### O armazém por dentro

O interior é desenhado numa malha de casas de 1,25 u. Um móvel de 1,2 u cabe numa casa com folga, e o personagem (cerca de 1,0 u de largura com a caixa nas mãos) passa por um corredor de uma casa. Exemplo do tamanho inicial, 6 × 5 casas:

```
P P P P F V     P = prateleira      F = canto frio
E . . . . B     E = estrado         V = pilha de vazios
E . . . . B     B = bancada (2 casas)
. . . . . .     . = chão livre
. . D D . .     D = porta (1,7 u)
```

| Armazém por dentro | Casas | Medida (u) | Cabe |
|---|---|---|---|
| Inicial | 6 × 5 | 7,5 × 6,25 | 6 móveis de estoque (4 prateleiras e 2 estrados), bancada, canto frio e pilha de vazios |
| Ampliado | 8 × 6 | 10,0 × 7,5 | Cerca de 12 móveis de estoque e 1 máquina |
| Completo | 10 × 8 | 12,5 × 10,0 | Cerca de 20 móveis, com uma ilha de prateleiras no meio, e 2 máquinas |

Por fora o prédio continua pequeno: 3,6 × 3,0 u (o do protótipo, que no plano de economia é o paiol), 4,8 × 3,6 u (celeiro) e 6,0 × 4,8 u (armazém grande). O tamanho inicial por dentro bate com as "6 vagas de chão" do plano de economia.

A altura por dentro é de 3,6 u (3 m reais [E18]) e a prateleira vai até 2,04 u, no limite do alcance da mão do personagem (2,05 u). O protótipo inteiro tem hoje 11 × 11 u, então o interior inicial cabe na tela com folga.

**Fontes do capítulo**

- [E1] Altura de adultos no Brasil (IBGE, POF 2008-2009, via Wikipédia): https://en.wikipedia.org/wiki/Human_height_by_country
- [E2] Altura de vacas holandesas (Wikipédia; a da Jersey está na página Jersey_cattle do mesmo site): https://en.wikipedia.org/wiki/Holstein_Friesian
- [E3] Bezerro holandês ao nascer (UDESC): https://www.udesc.br/arquivos/cav/id_cpmenu/1281/andre_dias_15670862900614_1281.pdf
- [E4] Canteiro de hortaliças (Embrapa Meio-Norte): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1128574/1/PreparoCanteirosCultivoHortalicas.pdf
- [E5] Corredor entre canteiros (eCycle, curso de horta): https://www.ecycle.com.br/curso-de-hortas-organicas-aula-1-conheca-principios-saiba-como-planejar-uma-guia-agricultura-casa-alimentacao-saudavel-pdicas-hortalica-agrotoxico-fertilizante-pesticida-sol-composteira-solo-rotacao-c/
- [E6] Altura do pé de milho (Wikipédia): https://pt.wikipedia.org/wiki/Milho
- [E7] Tutor do tomateiro (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/360222/1/CPATC-CIR.-TEC.-14-99.pdf
- [E8] Altura da laranjeira solta (Wikipédia): https://en.wikipedia.org/wiki/Orange_(fruit)
- [E9] Espaçamento de laranjeiras (Aegro): https://aegro.com.br/blog/laranja-valencia/
- [E10] Poço escavado à mão (ANA): https://progestao.ana.gov.br/destaque-superior/eventos/oficinas-de-intercambio-1/outorga/sao-luis-2019/pocos-para-captacao-das-aguas-subterraneas_ana_-fabricio-cardoso.pdf
- [E11] Ninho e lotação do aviário (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1099811/1/FolderAviario.pdf
- [E12] Poleiro e paredes do galinheiro (Agrolink): https://www.agrolink.com.br/noticias/galinheiro-na-agricultura-familiar--confira-o-passo-a-passo-para-construir-a-estrutura_517710.html
- [E13] Área por vaca no curral de espera (Embrapa): https://ainfo.cnptia.embrapa.br/digital/bitstream/doc/1169411/1/Sistemas-de-producao-vacas-em-lactacao-em-confinamento.pdf
- [E14] Telas e mourões de cerca (manual de fabricante): https://www.belgo.com.br/wp-content/uploads/2023/01/manual_cercas_instalacoes.pdf
- [E15] Exemplo de porteira de 3 m com duas folhas (Canal Rural): https://www.canalrural.com.br/alem-do-agro/?p=9036
- [E16] Espaço de cocho por vaca (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/862792/1/Conforto-e-bem-estar-para-bovinos-leiteiros.pdf
- [E17] Anúncio de galpão rústico de 10 × 6 m (MF Rural): https://www.mfrural.com.br/detalhe/244671/galpao-rustico-de-costaneira
- [E18] Pé-direito de galpão (Canal Rural): https://www.canalrural.com.br/aves-e-suinos/criacao-de-galinhas-exige-galpao-orientado-no-sentido-leste-oeste-e-manejo-adequado/
- [E19] Medidas de cama de solteiro (guia de tamanhos; altura em https://www.mercadolivre.com.br/blog/o-que-eu-preciso-saber-para-compra-uma-cama): https://planner5d.com/blog/pt/tamanhos-de-cama/
- [E20] Estrado para sacaria (Embrapa): https://ainfo.cnptia.embrapa.br/digital/bitstream/item/53115/1/Armazenamento.pdf
- [E21] Altura de bancada para trabalho em pé (Omni Calculator): https://www.omnicalculator.com/pt/dia-a-dia/calculadora-altura-de-mesa
- [E22] Balde galvanizado de 12 litros (anúncio de loja): https://www.magazineluiza.com.br/busca/balde+leite/
- [E23] Regador de 10 litros (anúncio de loja): https://www.petz.com.br/produto/regador-policamp-10-litros-cores-sortidas
- [E24] Caixa plástica de 45 litros (anúncio de loja): https://www.telhanorte.com.br/caixa-para-mercado-45-litros-preto-arthi-1414143/p
- [E25] Cartela plástica de 12 ovos (comparativo de produtos): https://br.my-best.com/20899
- [E26] Bandeja de 30 ovos (anúncio de loja): https://www.skroutz.eu/s/61376573/paper-egg-trays-30-chicken-eggs-150-pieces-natural-color-m-l.html
- [E27] Garrafa de vidro de 1 litro (anúncio de loja): https://www.casasbahia.com.br/kit-4-garrafas-agua-suco-leite-home-co-vidro-1-litro-25x9x9cm-transparente-com-tampa/p/1582479561
- [E28] Carrinho de mão de 60 litros (AECweb): https://www.aecweb.com.br/produto/carrinho-caixa-quadrada-60-l/51629

## 10. O sítio começa só com grama

O jogador recebe um terreno de grama com um poço velho, uma banca na entrada e um kit: enxada, saco de sementes de milho, regador e uma caixa. A sequência sugerida:

1. Capinar um quadrado: nasce o primeiro canteiro.
2. Plantar, buscar água no poço, regar, esperar, colher na caixa.
3. Vender a primeira caixa na banca da entrada. Com o dinheiro, o segundo canteiro.
4. Construir o primeiro depósito (o paiol do plano de economia), com a varanda, os ganchos e a bancada. As ferramentas ganham lugar.
5. Montar o terreiro: ninho, comedouro, bebedouro. Chegam as galinhas, a cesta e as cartelas.
6. Cercar o curral, pôr a porteira, o cocho e o bebedouro. Chega a vaca, com balde e banquinho.
7. Plantar a primeira laranjeira.

Cada passo entrega um objeto novo e uma tarefa nova, uma de cada vez. O plano de economia põe a galinha antes do depósito (ela chega já na primeira sessão); as duas ordens funcionam, e a dele vale, porque foi feita com a conta de moedas.

## 11. Perguntas em aberto

**Já decidido pelo dono** (registrado no plano de economia em 12 de novembro de 2026; este documento segue):

- O gramado vazio pode ter o poço velho e a banca desde o início.
- Um toque faz a cadeia toda; o passo a passo fica só para o tutorial.
- Bicho no fim da vida produtiva: o jogador escolhe entre ficar de estimação (não produz, mas continua custando ração, água e trato), vender ao frigorífico ou vender a um fazendeiro.

**Em aberto**, cada pergunta com a minha recomendação:

1. **A venda ao frigorífico aparece na tela?** *Recomendo:* não. O caminhão chega, o bicho sai pela porteira e pronto; nunca mostrar abate.
2. **Bancada e ganchos dentro ou fora do armazém?** *Recomendo:* fora, numa varanda; dentro fica o estoque.
3. **Quando os bichos passam a ter idade?** *Recomendo:* na segunda versão, com a vida contada em ovos e ordenhas e aviso antes do fim.
4. **Frango de corte entra?** *Recomendo:* depois, como criação separada da poedeira.
5. **Bicho com fome ou sede: o que o jogador vê?** *Recomendo:* o resultado menor na mão (balde pela metade, 1 garrafa), além da carinha. O plano de economia propõe dobrar o tempo do ciclo; a conta é a mesma, mas o balde pela metade se enxerga.
6. **As ferramentas quebram?** *Recomendo:* gastam e rendem menos, mas não somem nem quebram no meio da tarefa; conserto barato.
7. **O produto estraga?** *Recomendo:* não na primeira versão; depois, frescor só como prêmio.
8. **Garrafa e cartela são compradas a cada uso?** *Recomendo:* cartela vai embora com a venda; garrafa volta vazia. A decisão final é do plano de economia.
9. **A porteira pode ficar aberta?** *Recomendo:* não na primeira versão; ela fecha sozinha.
10. **Quando entra o armazém por dentro?** *Recomendo:* na segunda versão, com os produtos se arrumando sozinhos e o jogador livre para mudar os móveis de lugar.
11. **Os tempos de cultivo seguem a ordem da vida real?** Mandioca lenta, tomate perto do milho. *Recomendo:* testar no simulador; se as metas de ritmo aguentarem, a mandioca vira a cultura de "plante e volte depois".
12. **Qual é a primeira cultura?** *Recomendo:* milho, como no protótipo e no plano de economia; alface entra logo depois, como a cultura rápida que ensina a regar.
13. **A casa do personagem (e a cama) entra no jogo?** A cama está na tabela de escala porque foi pedida, mas nenhum sistema daqui usa a casa. *Recomendo:* deixar para quando houver motivo (guardar roupa, dormir para passar a noite).
14. **Dia, noite e clima?** *Recomendo:* não agora; é muita informação para o começo.

## 12. Ligação com o plano de economia

O plano em `docs/planejamento/economia-da-simulacao.md` marcou com **[vida real]** os números que esperavam esta pesquisa. As respostas:

| Marca no plano de economia | Na vida real | Comentário |
|---|---|---|
| 1 ordenha = 1 balde = 2 garrafas | Vaca comum: 6,8 a 10 litros por dia [V4], em 2 ordenhas [V3], ou 3 a 5 litros por ordenha (conta minha). Balde de 10 a 12 litros [F2] | "1 ordenha = 1 balde" é fiel. "2 garrafas" é simplificação; o fiel seria de 3 a 5 garrafas de 1 litro |
| Ordenha em 2,7 s | Tempo real por vaca: **não confirmado** | É a duração da animação do protótipo; nada a ajustar |
| Vida produtiva de 300 ovos | 345 ovos na poedeira colonial melhorada [G1] | Fiel |
| Vida produtiva de 400 ordenhas | Cerca de 610 por lactação (305 dias × 2) [V2][V3]; com 3 a 10 lactações, de 1.800 a 6.100 (conta minha) | É número de jogo, mas a proporção com a galinha está certa: no relógio a vaca dura 4 vezes mais (400 h contra 100 h), e na vida real também produz por um tempo umas 4 vezes maior (conta minha: 5 lactações contra 70 semanas de postura) |
| Pintinho vira galinha em 6 h; bezerra vira vaca em 24 h | 18 a 24 semanas [G1][G2]; 24 a 33 meses [V2]. A bezerra leva de 4 a 8 vezes mais | A proporção de 1 para 4 está dentro da real. Pela régua do capítulo 2 seriam 30 min e 24 a 48 h; um pintinho mais rápido deixa o jogador ver o bicho crescer na mesma sessão |
| 1 balde de água a cada 3 ordenhas | Uns 50 litros por dia, até o dobro no calor [V5]: 5 baldes de 10 litros por dia, 2 a 3 por ordenha (conta minha) | Bem mais leve que a vida real, e pode ficar assim: carregar água não é a parte divertida |
| 1 esterco a cada 3 ordenhas | Uns 50 kg por dia [V8], perto de um carrinho de mão de 60 litros [F3] por vaca por dia, ou 1 a cada 2 ordenhas (conta minha) | Está perto do real, se 1 esterco for 1 carrinho |
| Adubo pronto em 2 h | 60 a 90 dias para curtir [V8] | Pela régua do capítulo 2 seriam de 4 a 11 min; 2 h é escolha de ritmo. Misturar palha ao esterco: **não confirmado** (não pesquisei) |
| Capacidade dos recipientes | Regador até 10 litros [F1]; caixa de 45 litros leva 15 a 20 kg [A4]; carrinho de 60 litros [F3]; cartela de 12 e bandeja de 30 [E25][E26] | Regas e unidades por recipiente são números de jogo; a ordem de tamanho está certa. Pelas medidas do capítulo 9, o carrinho real leva 1 ou 2 caixas, não 4 |
| Entrega de animal em 30 min e 2 h | Não pesquisei transporte de animais | Número de jogo |

**Onde os dois documentos diferem**, para decidir:

- **Tempos de cultivo.** O plano de economia mantém os tempos atuais; o capítulo 2 daqui mostra a ordem da vida real.
- **Nomes.** Lá: caixa de ovos, cesto de palha, caixote de feira, paiol. Aqui: cesta, caixa de colheita, depósito pequeno. Vale o nome de lá.
- **Água da galinha.** Aqui o bebedouro é enchido com o regador; lá a água só aparece para a vaca, no balde.
- **Números de capacidade, vida útil e preço.** Valem os de lá; os daqui são exemplo.
