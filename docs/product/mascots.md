# Mascotes

Ao criar a conta, o jogador escolhe um dos três arquétipos iniciais pela espécie e dá um nome
ao mascote. Nuvem, Trovão e Pipoca são as sugestões de nome em português. Os três iniciais são
exclusivos dessa escolha. Lume, a coruja, é exclusiva da recompensa por cinco indicações
qualificadas, conforme as [regras do produto](./rules.md).

## Compra de mascotes

Cada conta pode ter um único exemplar de cada mascote do catálogo, independentemente do nome
escolhido pelo jogador. Ao adquirir o mascote por qualquer meio, a loja deve indicá-lo como já
adquirido. O servidor deve garantir que tentativas repetidas ou simultâneas de compra resultem
em, no máximo, um exemplar e uma única cobrança de Sementes.

Aurora é a primeira mascote da loja. Os demais entrarão gradualmente, à medida que
seus arquétipos forem definidos.

| Mascote | Preço previsto | Definição |
| --- | --- | --- |
| Aurora | 500 Sementes | Pássaro-azul-do-leste, com arquétipo próprio |
| Maple | 500 Sementes | Preço provisório até a definição do arquétipo |
| Bento | 500 Sementes | Preço provisório até a definição do arquétipo |
| Oliva | 500 Sementes | Preço provisório até a definição do arquétipo |

## Aurora

Aurora é um pássaro-azul-do-leste com arquétipo próprio. Sua especialidade é observar o caminho
durante o dia para identificar oportunidades e se orientar em rotas familiares.
Ela chega ao Ninho no nível 1, com velocidade 7, resistência 6, orientação 9 e sorte 7.

| Tipo | Nome | Efeito | Evolução |
| --- | --- | --- | --- |
| Característica inata | Olhos do Horizonte | Com luz do dia e boa visibilidade, Aurora identifica oportunidades um pouco além do corredor normal da rota. | Bônus pequeno e fixo, sem níveis. |
| Habilidade fixa | Leitura do Céu | Em trechos diurnos com céu limpo, Aurora mantém um ritmo de voo ligeiramente melhor. | Evolui pelo uso nesses trechos. |
| Habilidade fixa | Caminho Atento | Durante o dia, Aurora recebe um pequeno bônus de orientação em caminhos que já percorreu algumas vezes. | Evolui ao praticar rotas familiares. |

À noite ou com baixa visibilidade, os três bônus ficam inativos. Aurora continua podendo viajar
normalmente. Sua resistência é moderada, por isso ela sente mais os efeitos naturais das rotas
longas e mantém um ritmo menos consistente que Nuvem nessas viagens.

### Habilidade individual

O jogador escolhe uma das três habilidades abaixo no nível 5 de Aurora e pode trocá-la
gratuitamente uma vez antes do nível 10. Ao atingir o nível 10, a escolha é definitiva, conforme
as [regras de progressão](./progression.md). Todas exigem luz do dia e boa visibilidade.

| Habilidade | Efeito |
| --- | --- |
| Olhar de Forrageira | Aumenta ligeiramente a chance de encontrar um pacote de Sementes em cada oportunidade elegível. O tipo de pacote encontrado continua determinando seu valor. |
| Memória do Ninho | Reduz ligeiramente o tempo de retorno por um caminho em que Aurora já concluiu pelo menos três viagens. |
| Olhar de Pioneira | Na primeira viagem de Aurora a um destino, aumenta ligeiramente a chance de encontrar um colecionável no trajeto. |

A habilidade escolhida ganha XP quando seu efeito participa de uma viagem concluída.

### Balanceamento

Os bônus abaixo valem apenas nas condições descritas para cada efeito. A progressão é linear
do nível 1 ao 10 **da habilidade**. Olhos do Horizonte tem valor fixo.
Boa visibilidade inclui céu limpo, parcialmente nublado e nublado. A velocidade acompanha
as condições do trecho. Os achados usam a previsão de cada trecho registrada no despacho.

| Efeito | Bônus por nível da habilidade | Teto |
| --- | --- | --- |
| Olhos do Horizonte | Fixo desde o início | +5% no raio do corredor de descoberta |
| Leitura do Céu | +0,5% na velocidade do trecho | +5% |
| Caminho Atento | +0,5% no raio do corredor após três viagens concluídas por Aurora no caminho | +5% |
| Olhar de Forrageira | +1% relativo na chance de pacote por oportunidade elegível | +10% relativo |
| Memória do Ninho | +0,8% na velocidade do trecho de retorno | +8% |
| Olhar de Pioneira | +1% relativo na chance de colecionável por oportunidade elegível | +10% relativo |

Quando Olhos do Horizonte e Caminho Atento se aplicam juntos, os acréscimos somam até 10%
do raio original. Leitura do Céu e Memória do Ninho também se somam sobre a velocidade do
trecho, até 13% no retorno. Os limites gerais da viagem continuam valendo.

Para os achados, aplica-se o bônus sobre a chance da oportunidade depois dos modificadores
normais, respeitando o teto do sorteio. Por exemplo, com chance de pacote de 20% após o cálculo
de sorte, Olhar de Forrageira no nível 10 eleva a chance para 22%. O valor do pacote segue
o sorteio normal.

Olhar de Pioneira abre uma única oportunidade na primeira viagem comum de Aurora ao destino.
Na ida, considera cartões, lembranças, insígnias e selos em trechos diurnos de boa visibilidade,
fora do corredor já ampliado e até 125% do raio normal do ponto. Entre os elegíveis, escolhe
o mais próximo da rota e desempata pela chave de catálogo. A chance-base de 20% chega a
20,2% no nível 1 e a 22% no nível 10. O sorteio exige ao menos um candidato.

## Nuvem

Species: Pombo-correio

### Personality

Calm, observant, and reliable. Nuvem is the safest choice for important deliveries and rarely gets distracted during a route.

### Suggested Gameplay Identity

- balanced starter mascot;
- stable travel performance;
- good orientation;
- dependable for long routes.

## Trovão

Species: Falcão-mensageiro

### Personality

Fast, bold, and impatient. Trovão likes direct routes and has a strong instinct for reaching the destination quickly.

### Suggested Gameplay Identity

- fastest starter mascot;
- lower stamina balance;
- strong for urgent deliveries;
- slightly higher chance of risky route events.

## Pipoca

Species: Pato-correio

### Personality

Curious, cheerful, and easily distracted. Pipoca often finds unusual objects during trips and brings back small surprises.

### Suggested Gameplay Identity

- slower starter mascot;
- higher luck;
- better chance to find collectibles;
- good for casual item-hunting routes.
