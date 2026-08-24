# Progressão e XP

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

A curva recomendada é `XP para o próximo nível = 150 × nível^1,45`. Referências: nível 1, 150 XP; 5, 1.545 XP; 10, 4.230 XP; 20, 11.520 XP; 50, 43.650 XP. O objetivo de produto é que um jogador recorrente leve aproximadamente seis meses para alcançar o nível 20 de Reputação Postal; frequência esperada, XP diário e telemetria de calibração ainda precisam ser definidos antes de tratar essa duração como comprovada.

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

A curva aprovada é `XP para o próximo nível = ceil(100 × nível^1,35)`. Ela continua crescendo
depois do nível 20; não existe hard cap. São necessários aproximadamente 45.752 XP acumulados para
chegar ao nível 20. A progressão funcional termina nesse nível e, acima dele, o número continua
subindo para conceder apenas bordas visuais publicadas a cada dez níveis.

### Alcance de Voo e capacidade natural

| Nível | Distância máxima de ida | Slots naturais |
| ---: | ---: | ---: |
| 1 | 25 km | 3 |
| 2 | 50 km | 3 |
| 3 | 100 km | 3 |
| 4 | 180 km | 3 |
| 5 | 300 km | 4 |
| 6 | 500 km | 4 |
| 7 | 800 km | 4 |
| 8 | 1.200 km | 4 |
| 9 | 1.800 km | 4 |
| 10 | 2.500 km | 5 |
| 11 | 3.500 km | 5 |
| 12 | 4.500 km | 5 |
| 13 | 6.000 km | 5 |
| 14 | 7.500 km | 5 |
| 15 | 9.000 km | 6 |
| 16 | 11.000 km | 6 |
| 17 | 13.000 km | 6 |
| 18 | 15.500 km | 6 |
| 19 | 18.000 km | 6 |
| 20 | 20.050 km | 7 |

No nível 20, qualquer destino prático do mundo já deve estar acessível sem equipamento. Mochilas
podem aumentar slots com penalidade de velocidade, mas nenhum equipamento desbloqueia uma região
que a progressão normal torne inacessível.

## Espécie e afinidade

Espécie, arquétipo, traços e skills nunca recebem um multiplicador permanente de XP. A escolha do mascote deve refletir afeto e estilo de viagem, não a forma objetivamente mais rápida de evoluir.

Cada afinidade aplicável vale `×1,10`: urbana (mesma cidade), longa distância (acima de 50 km), noturna, costeira ou social (carta para amigo). As regras de coexistência impedem que afinidades virem um bônus permanente esperado. Quando a mesma identidade puder ser expressa por tempo de viagem ou descoberta, essa alternativa é preferível a XP adicional.

As identidades aprovadas são Nuvem para segurança/carga/rotas longas, Trovão para velocidade,
Pipoca para exploração e Lume, a coruja de indicação, para viagens noturnas. Espécies futuras podem
explorar identidades costeiras ou sociais sem conceder multiplicadores universais de XP. A adoção
dos novos efeitos exige um novo snapshot de modificadores e não recalcula viagens antigas.

## XP de skills

Uma skill só recebe XP quando sua condição participa de uma viagem concluída. Não há treinamento
manual nem XP automático para todas as skills. Uma viagem pode treinar mais de uma skill quando
cada uma tiver sido realmente ativada.

| Nível da skill | XP acumulado |
| ---: | ---: |
| 1 | 0 |
| 2 | 40 |
| 3 | 100 |
| 4 | 190 |
| 5 | 320 |
| 6 | 500 |
| 7 | 740 |
| 8 | 1.050 |
| 9 | 1.450 |
| 10 | 1.950 |

Uma ativação deve conceder aproximadamente 8–20 XP conforme duração e intensidade. O valor exato
por gatilho e os controles contra repetição de rotas triviais permanecem pendentes no [roadmap](./roadmap.md).
Os efeitos crescem linearmente: um teto de 10% equivale normalmente a 1% por nível; 15%, a 1,5%;
mitigação de 50%, a 5%; e redução de 20%, a 2%. Efeitos de raridade alteram o peso da chance-base,
nunca pontos percentuais diretos nem garantia de recompensa rara.

Cada espécie possui um traço inato sem nível, duas skills fixas e uma skill individual escolhida no
nível 5 do mascote. Há uma troca individual gratuita antes do nível 10 do mascote; depois disso a
escolha é definitiva e não pode ser refeita com Cristais. A biblioteca aprovada e suas pendências
estão no [roadmap ativo](./roadmap.md).

## Familiaridade de rota

Familiaridade pertence a cada mascote e usa identidades persistentes de origem e destino; não
depende de coordenadas decimais exatamente iguais. Ida e volta do mesmo par compartilham histórico,
e somente viagens concluídas contam.

| Estado | Percursos concluídos | Bônus de velocidade |
| --- | ---: | ---: |
| Nova | 0–2 | 0% |
| Conhecida | 3–7 | +2% |
| Familiar | 8–19 | +4% |
| Dominada | 20+ | +6% |

A familiaridade não decai. Skills de memória podem ampliar contextualmente esse benefício sem
ultrapassar o limite global de velocidade efetiva entre 60% e 125% da velocidade-base.

## Resultado da viagem e guardrails

Após a coleta, o resumo deve separar claramente Reputação Postal, XP de voo do mascote e XP das skills acionadas. Repetir a coleta nunca pode conceder XP novamente.

Não há XP pago, conversão de Cristais em XP, medidor de energia, combustível obrigatório ou equipamento/cosmético que gere vantagem universal de farm. A autoridade da fórmula, dos marcos, das afinidades, dos níveis e das concessões pertence ao backend.
