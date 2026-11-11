# Simulador da economia e do ritmo de progressão

Ferramenta pequena e determinística para testar, antes de programar o jogo, se as tabelas da economia entregam o ritmo desejado: nem "zerar" em dois dias, nem ficar sem jogo em um ou dois meses. O documento de desenho que usa estes números é `docs/economia/economia-e-progressao.md`.

## Requisitos

Python 3 com a biblioteca padrão. Não há dependências. Rode sempre com `python3 -I` (modo isolado).

## Como rodar

```bash
cd tools/economy-sim

# 1) Exporta as tabelas derivadas (preços, XP, custos, desbloqueios por nível)
python3 -I exportar_tabelas.py

# 2) Simula todas as personas por 180 dias (cerca de 1 minuto)
python3 -I simular.py

# Cenário "só o conteúdo do MVP" (teto no nível 30)
python3 -I simular.py --somente-mvp --dias 90 --personas casual,regular,engajado

# Só algumas personas, menos dias, sem gravar arquivos
python3 -I simular.py --personas regular,engajado --dias 30 --sem-arquivos

# Testar um parâmetro sem editar o arquivo (pode repetir --definir)
python3 -I simular.py --definir pedidos.tvexp=1.3 --definir acelerar.max_por_dia=40 --sem-arquivos

# Recalibrar a curva de XP para as metas de ritmo (imprime a sugestão; --gravar aplica)
python3 -I calibrar.py
```

`python3 -I simular.py --ajuda` lista todas as opções.

## Arquivos

| Arquivo | O que é |
|---|---|
| `dados/conteudo.json` | O conteúdo desbloqueável: culturas, árvores, animais, construções, receitas e recursos, com nível, tempo, insumos e a marca `mvp`. É aqui que se acrescenta conteúdo novo. |
| `dados/parametros.json` | Regras e coeficientes: curva de XP, fórmulas de preço e XP, quadro de pedidos, feira, armazém, terra, vila, missões, calendário, maestria, anúncios, loja, passe, mutirão e tempos de ação do jogador simulado. Cada bloco tem um campo `_nota` explicando a regra. |
| `dados/personas.json` | Os perfis simulados: horários e duração das sessões, quanto gira culturas curtas, anúncios por dia, pagamentos e ajuda de amigos. |
| `economia.py` | Carrega os dados e deriva as tabelas (preço base, XP, custos, desbloqueios). Sem aleatoriedade. |
| `exportar_tabelas.py` | Grava `saida/tabelas/*.csv` (para o código do jogo importar) e `saida/tabelas.md` (para o documento). |
| `simular.py` | A simulação. Grava `saida/resultados.md` e `saida/serie_diaria.csv` (uma linha por persona e por dia). Com `--somente-mvp`, grava `resultados_mvp.md` e `serie_diaria_mvp.csv`. |
| `calibrar.py` | Ajusta os expoentes da curva de XP por ponto fixo para bater as metas (primeira sessão, D7 e D30 do regular; dia do teto do engajado). |

## O que a simulação faz

Cada persona é um jogador automático que joga nas horas marcadas, com um orçamento de tempo por ação (plantar 1,2 s, colher 1 s, entregar pedido 5 s etc.). Em cada sessão ele, nesta ordem: coleta o que ficou pronto, entrega os pedidos que consegue, calcula o que falta para os pedidos abertos e para um pequeno estoque de cada produto, põe receitas na fila, alimenta os animais, planta (primeiro o que falta, depois a cultura mais longa que fica pronta até a próxima sessão), compra o que desbloqueou e passa na feira. Se não há mais nada a fazer, espera o próximo temporizador ou joga um minijogo; esse tempo de espera é o indicador "sessão sem nada útil".

O relógio longo corre entre as sessões: culturas, animais, árvores e filas de produção continuam, e o que fica pronto espera o jogador.

Regras de decisão que importam para ler os resultados:

- **Compras**: o jogador poupa. Construções e animais vêm primeiro; terra, árvores e terceira vaga só usam o que sobra depois de reservar o custo das compras anteriores ainda pendentes; armazém e vila ficam por último.
- **Peças de reforma** (tábuas, escrituras, ferramentas) são tratadas como um único saldo, porque no desenho o jogador fixa uma meta e as peças vão para ela.
- **Armazém cheio**: o excedente é vendido na banca pelo preço base, sem XP. Cada venda forçada libera a compra de uma ampliação.
- **Pagantes**: gastam cash em vagas de produção, em peças que faltam para terra e vagas, e em concluir temporizadores de construções, respeitando o orçamento diário do perfil e o teto diário de acelerações.
- **Mutirão**: nas sessões de ajudantes, amigos colhem, plantam, coletam, alimentam e põem na fila; não entregam pedidos, não compram nada e o XP dessas ações não vai para o dono. Se o armazém enche durante a visita, o excedente é vendido na banca, como se o dono tivesse a venda automática ligada.

## Como ler a saída

- **Nível por dia**: nível ao fim dos dias 1, 3, 7, 14, 30, 60, 90, 120 e 180; o dia em que a persona chega ao teto de conteúdo (nível 60); e o dia em que alcançaria o teto se ele subir 2 níveis por mês com o conteúdo mensal (`geral.cadencia_niveis_por_mes`).
- **Saldo de moedas** e **dias de renda**: saldo dividido pela renda média dos últimos 7 dias. Acima de uns 5 dias, as moedas estão sobrando (faltam sumidouros).
- **Saldo de cash** e gasto em reais do perfil.
- **Metas de longo prazo**: estágios da vila concluídos e estrelas de maestria.
- **Indicadores de ociosidade**, por janela de dias:
  - *Sessão sem nada útil*: parte do tempo de sessão em que não havia ação disponível no próprio sítio.
  - *Giro de cultura curta*: tempo gasto plantando e colhendo culturas de minutos dentro da sessão.
  - *Canteiro parado*: parte do tempo em que o canteiro está vazio ou com a colheita pronta esperando o jogador.
  - *Uso das construções*: parte do tempo em que há produção em andamento.
  - *Bloqueios de armazém*: vezes por dia em que não coube nem vendendo excedente.
  - *Compras à espera de moedas*: itens desbloqueados que o jogador ainda não pôde pagar.
- **Fontes de XP, destino das moedas e fluxo de cash**, acumulados no período.

## Limites do modelo

- O jogador automático é disciplinado e joga todos os dias nos mesmos horários. Jogadores reais faltam dias e erram; o ritmo real tende a ser mais lento que o simulado, nunca mais rápido para o mesmo tempo de jogo.
- Não simula eventos, liga de cooperativas, álbum de coleções nem a trilha gratuita do passe. Esses sistemas dão recompensas adicionais; ao ligá-los, é preciso rodar de novo e, se preciso, recalibrar.
- A restauração da vila é cobrada só em moedas e tempo de obra; no jogo ela também pede produtos.
- A compressão por pagamento vale para as políticas de gasto descritas em `dados/personas.json`.
- Os resultados dependem pouco da semente dos pedidos (`--semente`), mas dependem: trate diferenças de 2 ou 3 dias no dia do teto como ruído.

## Fluxo de trabalho recomendado

1. Edite `dados/conteudo.json` ou `dados/parametros.json`.
2. `python3 -I exportar_tabelas.py` e confira se nenhum nível ficou sem desbloqueio e se nenhuma receita usa insumo de nível mais alto (o programa acusa).
3. `python3 -I simular.py` e compare com as metas do documento.
4. Se o ritmo saiu das metas, rode `python3 -I calibrar.py` e avalie a curva sugerida antes de gravar. O método oscila cerca de 0,1 nos expoentes de uma volta para outra: use a sugestão como ponto de partida, arredonde e confirme com `simular.py` (a curva em uso foi fechada assim, à mão, depois da sugestão).
5. Copie `saida/resultados.md` para o documento quando os números mudarem.
