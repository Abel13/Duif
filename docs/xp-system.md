# Sistema de XP

Status: definição de produto aprovada. A persistência, as concessões e as telas autoritativas serão implementadas no Milestone 49.

## Princípio

O DUIF separa três progressões para não transformar toda atividade em uma única barra:

| Progressão | Pertence a | Evolui por |
| --- | --- | --- |
| Reputação Postal | conta do jogador | jogar, descobrir e participar |
| XP de voo | mascote individual | concluir viagens |
| XP de skill | uma skill de um mascote | praticar a condição daquela skill |

O jogador evolui por jogar; o mascote, por viajar; e a skill, por ser praticada.

## Reputação Postal

Reputação Postal é a progressão geral da conta. Ela desbloqueia sistemas e expressão social, como amigos, cartões postais, presentes, coleções, decoração e expansões do ninho, slots, cosméticos de perfil, eventos sazonais e outros recursos sociais. Ela não compra poder nem substitui a evolução do mascote.

`XP de Reputação = conclusão + ações + descobertas + marcos`

| Ação | XP |
| --- | ---: |
| Concluir qualquer viagem | 10 |
| Enviar carta ou cartão postal | 15 |
| Enviar presente | 20 |
| Primeiro destino | 25 |
| Primeiro país ou região | 50 |
| Lembrança comum, rara ou especial | 10 / 30 / 50 |
| Subir nível de mascote | 30 |
| Completar coleção | 150 |
| Primeira interação com amigo | 25 |
| Receber resposta | 30 |
| Concluir rota especial | 50 |
| Participar de evento sazonal | 40 |

A curva recomendada é `XP para o próximo nível = 150 × nível^1,45`. Referências: nível 1, 150 XP; 5, 1.545 XP; 10, 4.230 XP; 20, 11.520 XP; 50, 43.650 XP.

## XP de voo do mascote

Cada mascote evolui separadamente. Seu XP influencia nível, vínculo, pequenos marcos visuais, Alcance de Voo, capacidade futura de carga e acesso a rotas mais longas.

Para uma entrega completa, `distância total` inclui ida e volta (`distanceKm × 2`). A fórmula base, igual para qualquer espécie, é:

`XP base = 15 + distância total em km^0,8 × 6`

| Distância total | XP aproximado |
| --- | ---: |
| 1 km | 21 |
| 5 km | 37 |
| 10 km | 53 |
| 50 km | 152 |
| 100 km | 254 |
| 500 km | 880 |
| 1.000 km | 1.522 |

Os bônus são situacionais e acumulam multiplicativamente quando aplicáveis: primeiro destino `×1,25`, primeiro país ou região `×1,50`, rota especial `×1,20`, afinidade contextual `×1,10`, evento sazonal `×1,20` e ida e volta concluídas `×1,10`.

`XP final do mascote = XP base × multiplicadores aplicáveis`

A curva recomendada é `XP para o próximo nível = 100 × nível^1,35`. Referências: nível 1, 100 XP; 5, 880 XP; 10, 2.240 XP; 20, 5.700 XP; 50, 19.700 XP.

### Alcance de Voo

`Alcance de Voo = 5 × nível^2 km`

Referências: nível 1, 5 km; 5, 125 km; 10, 500 km; 20, 2.000 km; 40, 8.000 km. Quando uma rota exceder o alcance, o jogo orienta o jogador a fazer viagens menores para fortalecê-lo.

## Espécie e afinidade

Espécie, arquétipo, traços e skills nunca recebem um multiplicador permanente de XP. A escolha do mascote deve refletir afeto e estilo de viagem, não a forma objetivamente mais rápida de evoluir.

Cada afinidade aplicável vale `×1,10`: urbana (mesma cidade), longa distância (acima de 50 km), noturna, costeira ou social (carta para amigo). As regras de coexistência serão resolvidas no Milestone 49 para impedir que afinidades virem um bônus permanente esperado. Quando a mesma identidade puder ser expressa por tempo de viagem ou descoberta, essa alternativa é preferível a XP adicional.

Pombo, andorinha, coruja, gaivota e papagaio são direções de identidade futuras: equilibrado, rápido, cuidadoso, costeiro e social. Os arquétipos atuais preservam seus próprios traços e modificadores de viagem; esta definição não altera seus efeitos já implementados.

## XP de skills

Uma skill só recebe XP quando a viagem ativa uma condição ligada a ela. Não há XP automático para todas as skills em toda viagem.

| Gatilho | XP de skill |
| --- | ---: |
| Condição leve | 5 |
| Condição normal | 10 |
| Condição forte | 20 |
| Marco especial | 40 |

Exemplos: Despacho Rápido em envio urgente ou curto; Instinto de Vento Cruzado em desvios; Encontrador de Lembranças ao encontrar uma lembrança; foco de rota longa, sentido noturno, deslize costeiro e trilha social nas respectivas condições. A curva é `XP para o próximo nível = 60 × nível^1,4`, limitada ao nível 10 no MVP.

Cada espécie deverá começar com duas skills fixas e uma individual. A biblioteca de skills e os gatilhos exatos continuam uma etapa posterior de balanceamento. Em particular, os efeitos atuais de viagem não mudam: `Despacho Rápido` segue reduzindo preparo em 5% por nível, até 20%.

## Resultado da viagem e guardrails

Após a coleta, o resumo deve separar claramente Reputação Postal, XP de voo do mascote e XP das skills acionadas. Repetir a coleta nunca pode conceder XP novamente.

Não há XP pago, conversão de Cristais em XP, medidor de energia, combustível obrigatório ou equipamento/cosmético que gere vantagem universal de farm. A autoridade da fórmula, dos marcos, das afinidades, dos níveis e das concessões pertence ao backend.
