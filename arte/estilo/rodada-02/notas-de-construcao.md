# Notas de construção

Guias para modelagem com poucas peças e materiais lisos. Cores abaixo são uma paleta sugerida a partir das referências, não amostras exatas de todos os pixels renderizados. Use materiais foscos, luz principal acima à esquerda e sombras suaves. Una peças estáticas quando conveniente; mantenha separadas portas, manivela e partes animadas.

- **Personagem:** cabeça esférica levemente achatada; tronco em caixa arredondada; braços e pernas em cápsulas; mãos ovais com uma cápsula para o polegar; botas em caixas arredondadas; cabelo como uma calota e uma esfera para o coque; lenço como faixa e dois pequenos volumes. Altura total aproximada de três cabeças. Pele `#B97538`, cabelo `#3E291E`, lenço `#D83C27`, camiseta `#E6AD20`, jardineira `#287CAA`, botas `#704126`.
- **Vaca:** corpo em cápsula horizontal; cabeça em caixa arredondada; focinho oval; quatro cilindros grossos para pernas e cascos curtos; orelhas ovais; dois cones arredondados para chifres; úbere em esfera achatada com quatro cilindros curtos; rabo em curva simples com tufo oval. Manchas grandes por áreas de material ou máscara lisa, sem relevo. Creme `#FFF1D3`, manchas `#352E28`, focinho e úbere `#EE9993`, chifres `#E6CF96`, cascos `#4A3828`.
- **Galinha:** corpo ovoide, cabeça esférica, duas asas ovais achatadas, cauda de dois ou três volumes grossos, bico em cone arredondado, crista de três pequenas esferas unidas; pernas curtas e pés simples. Mesma geometria nas duas cores. Branco `#FFF1D4`, caramelo `#CA862C`, bico e pés `#EDA519`, crista `#D83B28`, olhos `#29251F`. Ninho: anel baixo com 8–12 cápsulas curvas grossas, palha `#DDA52E`; ovo: esfera alongada `#FFF3DA`.
- **Celeiro:** caixa principal e prisma triangular no frontão; painéis largos sem textura de madeira; duas caixas finas arredondadas para portas, travessas diagonais em barras; duas placas inclinadas no telhado com telhas em meias cápsulas grossas e repetidas; base em barras arredondadas. Portas com pivôs nas bordas externas. Madeira `#A96025`, madeira clara `#C98535`, telhado `#DC5425`, portas `#438E42`, travessas `#FFF0C6`, base `#C6BB95`, interior `#302216`.
- **Poço:** anel cilíndrico grosso, dividido em poucos blocos grandes; dois postes cilíndricos; duas placas inclinadas e poucas telhas arredondadas; eixo e manivela em cilindros; corda em curva de seção circular; balde em tronco de cone com alça curva. Pedra `#B9B397`, madeira `#945526`, telhado `#DC5425`, corda `#BF964F`, água `#2CB7D1`, balde `#AEB5AF`.
- **Cerca:** postes em cápsulas verticais com base plana, duas barras horizontais por vão. Trecho reto: três postes e quatro barras; canto: três postes e quatro barras em eixos perpendiculares. Madeira `#B5792B`, faces iluminadas `#D99735`.
- **Laranjeira:** tronco em cilindro afunilado, poucas raízes grossas opcionais; copa de quatro ou cinco esferas deformadas e sobrepostas; laranjas em esferas e hastes curtas. Tronco `#865026`, copa `#5FAF28`, copa clara `#83C532`, laranjas `#F5A117`.
- **Canteiro:** caixa baixa arredondada, três faixas largas em cápsulas achatadas para sulcos; sementes ou montinhos em pequenas semiesferas, sem grãos minúsculos. Terra `#874622`, sulcos `#A85C2B`, sementes `#E4B34D`. Reutilizar a mesma base nos cinco estados.
- **Milho:** caule cilíndrico; três ou quatro folhas largas por planta feitas de cápsulas achatadas e afuniladas; uma ou duas espigas em cápsulas amarelas com duas folhas de palha verdes. Sem modelar grão por grão. Brotos `#6FAB30`, folhas `#64A82D`, hastes `#83B83A`, espigas `#F1C331`, palha `#7CAF32`.
- **Regador:** corpo em caixa arredondada ou cilindro; bico em cilindro inclinado; crivo em disco; alça em arco grosso. Metal pintado `#4B9EA7`, bordas `#73BEC0`.
- **Balde de leite:** tronco de cone aberto com parede grossa, aro simples e alça semicircular. Metal fosco `#B6BFBA`, sombra `#87958F`, leite `#FFF2D8`.
- **Banquinho de ordenha:** assento em cilindro achatado e três pernas em cilindros grossos levemente inclinados. Madeira `#B67B37`, topo `#CF9650`.
- **Caixote:** base e laterais em poucas caixas arredondadas; duas tábuas largas por lateral e quatro cantoneiras, sem pregos modelados. Versão cheia reutiliza espigas simplificadas. Madeira `#B67B37`, bordas `#D39950`, milho `#F1C331`, palha `#7CAF32`.
- **Garrafa:** corpo cilíndrico, ombro arredondado, gargalo curto e tampa em cilindro. Vidro opaco estilizado `#D9E8DB`, leite `#FFF2DC`, tampa `#4E9EB9`. Evitar transparência e reflexos realistas no jogo.

As vistas geradas são referências visuais, não projeções técnicas derivadas de uma malha única. Para produzir o jogo, defina uma única malha e materiais por objeto e derive dela as demais vistas.

## Entrega e conferência

Todas as imagens foram produzidas com a ferramenta image_gen integrada e conferidas visualmente. São PNGs nativos de **1672 × 941 pixels**, sem ampliação. Foi pedida a maior resolução nativa em 16:9; a ferramenta retornou esta resolução, aproximadamente 16:9 (não exatamente). O controle disponível não permitiu impor uma dimensão maior.

| Arquivo | Tentativas |
|---|---:|
| cena-a.png | 1 |
| folha-personagem.png | 2 |
| folha-vaca.png | 1 |
| folha-galinha.png | 1 |
| folha-construcoes.png | 2 |
| folha-plantio.png | 2 |

### Diferenças e limites observados

- **Todas:** proporção ligeiramente diferente de 16:9. As folhas apresentam leve variação de iluminação no fundo creme, em vez de uma cor matematicamente uniforme. Não identifiquei texto, números, setas, logotipo ou marca d'água visível. As formas permitem uma interpretação em primitivas simples; não são malhas 3D prontas.
- **cena-a.png:** disposição geral e estados foram mantidos, mas câmera, distâncias e dimensões relativas não são uma reprodução exata da captura. O milho foi reduzido a poucas plantas grossas. O personagem ainda tem aparência bastante jovem. O balde do poço não fica claramente legível nesta vista.
- **folha-personagem.png:** mãos corrigidas na segunda tentativa, sem dedos separados. O rosto continua mais infantil do que o adulto solicitado. Proporções próximas de três cabeças, sem garantia dimensional exata entre projeções.
- **folha-vaca.png:** quatro vistas e cabeça presentes, sem coleira ou sino. A distribuição geral das manchas é compatível, mas seus contornos não coincidem perfeitamente entre vistas. Há discreta granulação de superfície, dispensável na modelagem.
- **folha-galinha.png:** oito vistas, ninho vazio, ninho com um ovo e ovo separado presentes. O volume da cauda visto por trás está mais simplificado que no perfil; requer escolher uma única geometria ao modelar.
- **folha-construcoes.png:** câmera isométrica corrigida na segunda tentativa. A largura aparente das portas e alguns detalhes do telhado variam levemente entre celeiro fechado e aberto. O ângulo dos itens não é numericamente idêntico ao da câmera do protótipo. A corda enrolada deve ser simplificada no modelo para evitar muitas peças.
- **folha-plantio.png:** cinco estágios e oito objetos presentes; garrafa corrigida para opaca e fosca. Altura e inclinação da câmera variam ligeiramente entre os objetos. Há leve granulação na laranja; ignore-a e use uma esfera lisa. O regador final é azul `#299FD0`; a garrafa é marfim `#F2E5C4` com tampa azul `#299FD0`.

O arquivo prompts-de-geracao.md registra o conjunto de instruções usado e as correções.
