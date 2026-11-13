# Plano do jogo (primeira versão jogável)

Este arquivo é a fonte de verdade do que estamos construindo. Quem for trabalhar no jogo (gente ou agente) lê este arquivo e `ARQUITETURA.md` antes de começar. O que está aqui vale sobre os documentos antigos de `docs/planejamento/` e `docs/economia/` quando houver diferença; eles continuam valendo como pesquisa e como ponto de partida dos números.

## O pedido do dono do projeto (13 de novembro de 2026)

- O protótipo `prototypes/sitio-minimo` foi um **rascunho que validou o visual**: figuras 2D desenhadas pelo Codex, estilo desenho com contorno (`arte/estilo/rodada-03/var-2-contorno.png`), personagem em `arte/estilo/rodada-04/`. Agora é para fazer **o jogo**.
- Jogo de **simulação de fazenda que não cansa**: tem parte manual e parte que se automatiza com o tempo (animais de trabalho, máquinas, projetos). Não é hardcore, não delira e não dificulta demais. Baseado na vida real, simplificado.
- **Tela cheia**, mundo grande (não um quadradinho), câmera acompanhando a personagem. **No celular, deitado.** Também navegador, TV (controle remoto) e, depois, lojas.
- Vida útil longa: não se zera em semanas. A base do dia 1 tem de ser muito boa; conteúdo novo vem depois.
- Lavoura do jeito certo: pegar a ferramenta, preparar o terreno, plantar, encher o regador no poço, regar, colher. O campo é um **terreno livre que se expande**, não canteiros fixos. Lá na frente, trator; antes dele, **boi com arado**. A plantação é um **campo de plantação** de verdade: uma área grande e contínua de terra, com fileiras e sulcos, ao lado do terreiro, e não canteirinhos soltos (pedido do dono em 13/11/2026).
- **Celeiro grande em que se entra**, com ferramentas de lavoura e de trato, e **prateleiras que o jogador monta**. Começa básico e vai sendo construído, comprado, ampliado.
- **Bancada de carpintaria** para construir galinheiro, curral e o resto.
- Animais em três famílias: **de produção** (galinha, vaca, ovelha... sempre geram um produto), **de trabalho** (boi de arado, cavalo, jumento: ajudam ou aceleram), **de estimação** (cachorro, gato... e cavalos especiais).
- Produtos viram matéria-prima de **indústrias** dentro da fazenda (laticínio e afins).
- **Barra de fôlego**: corre por um tempo, cansa, anda, recupera.
- Duas moedas: **ouro** (do jogo) e **cash** (comprado; também vem aos poucos em recompensas). Cash não pode ser "pagar para ganhar": compra principalmente cosméticos, alguns aditivos e animais especiais. Nem pouco ouro (trava), nem ouro demais (acaba rápido).
- Sempre: **tutorial** a cada mecânica nova; **animação de recompensa** ao subir de nível e ao conquistar algo; recompensa **diária**, de **marco**, por **compartilhar e convidar** (redes sociais ficam para depois).
- Arte: toda animação nasce de uma **folha de modelo** (personagem, cada bicho, cada interação). A referência é criada no Codex e **já entra no jogo**; o dono valida depois e pede ajustes.
- A personagem atual está "engessada": melhorar a animação.
- Pesquisar jogos de referência (inspirar, nunca copiar), o que os jogadores elogiam e reclamam, e os processos reais da fazenda.

## Regras do jogo (decididas; os números ficam em `jogo/dados/`)

1. **Tempo**: relógio de verdade. Plantas, animais e máquinas contam o tempo mesmo com o jogo fechado. Nada morre, nada se perde por ausência: a planta sem água espera, o animal sem trato produz a metade.
2. **Terreno**: malha de casas de 1 unidade. A fazenda começa com uma área própria e compra lotes vizinhos. Terra nova vem com mato, pedras e tocos para limpar (rende madeira, pedra e fibra).
3. **Lavoura**: enxada (grama → terra arada), semear (1 semente por casa), regar (regador com N regas, enchido no poço), crescer por estágios (cada estágio pede a terra molhada; seca, a planta espera), colher (vai para o cesto da personagem). **O campo**: a fazenda já começa com um campo de plantação demarcado (terra de plantio, sem grama); terra arada uma vez vira campo para sempre: depois da colheita a casa volta a ser terra de plantio (pede o arado de novo, não vira grama), então o campo não some. Arar grama limpa aumenta o campo. Trabalha-se por fileiras: à mão casa a casa (arrastando), com o boi cinco casas por passada, com o trator (futuro) várias fileiras. Adubo e pragas ficam para depois. **Escada de alívio da rega**, cada degrau chegando antes de o campo cansar: regador maior → regador que molha várias casas → barril de água na carroça do jumento (leva o "poço" ao campo) → irrigação fixa por setor. Dobrar o campo não pode dobrar os toques nem as viagens ao poço.
4. **Carga**: a personagem leva um cesto com limite; cheio, esvazia no celeiro ou vende na banca. Recipientes maiores, carrinho e jumento com carroça aumentam a carga.
5. **Ferramentas**: são objetos. Ficam no suporte do celeiro; a personagem leva poucas no cinto. **Um toque faz a cadeia toda**: se a ferramenta não está no cinto, ela vai buscar sozinha (custa tempo, não toques). Desgaste leve, sem quebrar no meio (regra do plano de economia antigo).
6. **Fôlego**: correr gasta, andar e parar recuperam. Trajeto longo é feito correndo enquanto houver fôlego. Cavalo dispensa o fôlego. Limites: sem fôlego ela volta ao andar normal (nunca mais devagar, nunca para); recupera em poucos segundos, também andando; a barra some da tela quando está cheia; o fôlego nunca é vendido nem reposto com cash; nenhuma tarefa da fazenda gasta fôlego.
7. **Celeiro**: de fora, guarda e entrega com um toque. Por dentro é uma cena própria: o jogador monta prateleiras (a capacidade vem delas), vê as ferramentas no suporte e amplia o piso.
8. **Construir**: na bancada de carpintaria, com ouro e materiais (madeira, tábua, pedra, prego), usando direto o que está no celeiro. O jogador escolhe o lugar no terreno e **pode mudar de lugar depois**, sem custo. O miolo do começo é compacto (casa, poço, celeiro, banca e primeiro campo a poucos segundos um do outro): distância não pode virar espera.
9. **Animais de produção**: a vaga é da construção, o bicho é do mercado. Comem e bebem; produzem em ciclo; produto é recolhido com a ferramenta certa (mão ou caixa, balde, tesoura). Fim da vida produtiva: fica de estimação (com custo), vende ao frigorífico ou a um fazendeiro (decisão já tomada).
10. **Animais de trabalho**: boi com arado ara várias casas de uma vez; cavalo é montaria (mais rápido, sem fôlego); jumento com carroça carrega muito. **De estimação**: seguem a personagem; efeito cosmético e um mimo pequeno por dia.
11. **Indústrias**: construções com receitas, fila e relógio (embalar, moinho, laticínio, cozinha...). O jogador cancela e reordena a fila; item não iniciado devolve os ingredientes.
12. **Vender**: banca na porteira (sempre compra, preço base), quadro de pedidos (paga mais e dá experiência), vizinho (tarefas do começo). Mercado entre jogadores só no futuro.
13. **Progresso**: experiência e níveis liberam coisas; missões do vizinho conduzem o começo e ensinam (uma mecânica por vez, curtas, dá para reler; nunca mandam gastar cash); conquistas com marcos. **Recompensa diária**: 7 presentes que avançam a cada dia jogado; quem falta um dia continua de onde parou. **Convite**: presente para os dois quando o amigo joga de verdade. **Compartilhar**: foto da fazenda, com um agrado pequeno e limitado por dia, que se desliga por configuração onde a loja ou a rede social proibir. Prêmio bom é o que não sai da lavoura: enfeite, cosmético, um pouco de cash, material de obra.
14. **Cash**: tempo (concluir relógio), cosméticos, animais especiais de estimação, vagas de fila (que também se compram com ouro). Nada de útil é exclusivo do cash. Nunca: produção maior, ferramenta melhor, conserto, espaço exclusivo, fôlego. Sem sorteio pago e sem anúncio forçado. Na versão de teste a compra é simulada e avisada na tela.
15. **Controles**: toque (tocar = ir e agir; arrastar = andar como alavanca; pinça = zoom), teclado (setas/WASD, Espaço age, Shift corre), controle de videogame e controle remoto de TV (direcional anda, OK age, foco nos painéis). O jogador escolhe o esquema no celular ("só toque", "alavanca com botão de ação", "os dois") e o tamanho dos botões; a casa que vai receber a ação fica marcada antes de a ação acontecer; a cadeia de um toque aparece na tela e qualquer toque a interrompe; nada importante encosta na borda (área segura do aparelho); o zoom escolhido fica guardado.

## O que entra na primeira versão jogável

| Bloco | Conteúdo mínimo |
|---|---|
| Mundo | Fazenda grande com área inicial e lotes para comprar; poço, banca, celeiro básico, casa; câmera que segue; zoom; tela cheia; celular deitado |
| Lavoura | 6 a 8 culturas em faixas de tempo de 1 min a algumas horas; enxada, sementes, regador, cesto |
| Árvores | 3 frutíferas (muda → adulta → safra que se repete) |
| Produção | Galinha (ovo), vaca (leite), ovelha (lã), com abrigo, cocho, bebedouro e ferramentas |
| Trabalho e estimação | Boi com arado, cavalo de montaria; cachorro e gato |
| Indústria | Bancada de embalar, moinho, laticínio, cozinha |
| Construção | Bancada de carpintaria; colocar construções no terreno; prateleiras e ampliação do celeiro |
| Economia | Ouro e cash; loja; banca; quadro de pedidos; compra de lotes |
| Progresso | Níveis com tela de subida; missões do vizinho como tutorial; conquistas; recompensa diária; compartilhar e convidar; loja de cash com cosméticos |
| Base | Progresso gravado no aparelho o tempo todo (sem botão de salvar), em formato que atravessa atualizações, com cópia de segurança por texto e aviso de que a fazenda mora naquele aparelho; relógio na ausência, com resumo simpático na volta; desempenho medido; testes automáticos e um jogador automático que mede o ritmo, o tempo só andando e as viagens ao poço |

## O que a pesquisa de jogadores mudou

`docs/pesquisa/jogadores-e-referencias.md` (quase 16 mil avaliações de 17 jogos) trouxe nove propostas; todas entraram nas regras acima (fôlego leve, escada da rega, mudar construção de lugar, fila que se cancela, diária sem corrente, convite que premia quando o amigo joga, vaga de fila também com ouro, escolha de controles, gravação contínua). Uma diferença para a proposta original: o dono pediu recompensa por compartilhar, então ela fica, pequena e desligável, até a política de cada loja e rede ser lida no original. Antes de abrir compra de verdade, a fazenda precisa de cópia de segurança fora do aparelho (código de transferência ou conta).

## Marcos

1. **M1, o chão**: motor, mundo grande, personagem andando com fôlego, câmera, tela cheia, celular deitado, gravação. Lavoura completa com poço, banca, ouro, loja de sementes, níveis e as primeiras missões.
2. **M2, o sítio**: celeiro por dentro, prateleiras, ferramentas no suporte, bancada de carpintaria, galinhas e vacas, embalar, pedidos.
3. **M3, a fazenda**: árvores, ovelhas, indústrias, lotes e limpeza de terra, boi com arado, cavalo.
4. **M4, o jogo**: conquistas, diária, convite, loja de cash, cosméticos, estimação, sons, acabamento e ajuste do ritmo com o jogador automático.

Cada marco termina com: testes passando, o jogador automático rodando, publicação no link de teste e gravação no repositório.

## Como o trabalho se divide

- Coordenação, integração, testes e publicação: sessão principal.
- Pesquisa de jogadores e referências: `docs/pesquisa/`.
- Economia e conteúdo (números em `jogo/dados/`, explicação em `docs/jogo/economia.md`).
- Arte no Codex: folhas de modelo e peças em `arte/jogo/`, prontas para o jogo em `jogo/arte/`.
- Código: `jogo/`, conforme `ARQUITETURA.md`.
