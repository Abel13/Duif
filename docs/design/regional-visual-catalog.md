# Catálogo visual regional proposto

> Proposta editorial para revisão — 25 de agosto de 2026. Nenhuma chave, arte ou regra abaixo
> existe no runtime até uma autorização posterior.

## Fonte e prioridade

A prioridade final deve começar pelas cidades de todos os perfis de produção que concluíram o
Ninho durante o alfa, sem publicar quantidade de usuários, nomes ou o perfil que originou a
prioridade. Uma leitura autorizada e anonimizada forneceu quatro GeoName IDs, sem nomes de perfis
ou contagens. Esses IDs formam o primeiro grupo editorial; dados do Supabase local, fixtures e
exemplos do produto não foram usados para ampliar a lista.

Depois das cidades com Ninhos, entram as capitais restantes em ordem decrescente da população do
snapshot GeoNames local. O GeoName ID é a identidade de deduplicação; grafia visível não cria uma
segunda cidade. População serve apenas para ordenação editorial e deverá ser atualizada junto ao
catálogo GeoNames antes da produção.

## Contrato editorial futuro

- cartões postais representam cidades, eventos, comemorações ou outras coleções editoriais; a
  prioridade por Ninhos ativos se aplica somente aos cartões de cidade;
- cartão urbano: `postcard.city.<geoname-id>.front`, WebP 3:2, recomendado 1024×683, até 180 KB;
- selos representam estados/regiões, eventos, comemorações ou séries postais; não são uma versão
  pequena do cartão da cidade;
- selo territorial permanente: `stamp.region.<country-code>.<region-code>.front`, WebP
  transparente, recomendado 256×256, até 60 KB;
- marcos não pertencem ao catálogo regional e não seguem cidades com usuários; são pontos
  extremamente conhecidos mundialmente, mantidos no catálogo independente de marcos;
- desbloqueios futuros, ainda não implementados: cartão após visita concluída à cidade; selo após
  visita concluída a qualquer destino da UF;
- uma cidade produz um cartão próprio, mas reutiliza o selo da UF;
- toda arte exige brief, origem/licença registradas, alt text pt-BR/en-US e validação nas telas
  reais antes de publicação.

## Cidades com Ninhos em produção

**Estado: fonte recebida e anonimizada.** As quatro cidades têm a mesma prioridade de produto; a
ordem abaixo é apenas editorial. Nenhuma contagem ou associação com perfis foi preservada.

| Cidade · região · GeoName ID | Coordenada pública | Chave futura do cartão | Tema, composição e referência permitida | Alt text preliminar | Prioridade/status |
|---|---|---|---|---|---|
| Manhuaçu · Minas Gerais · Brasil · `3457952` | -20.25806, -42.03361 | `postcard.city.3457952.front` | cartão: relevo da Zona da Mata, cafezais, luz de serra e arquitetura urbana sem eleger propriedade privada | Manhuaçu ilustrada entre montanhas e cafezais da Zona da Mata | produzido/ativo |
| Londrina · Paraná · Brasil · `3458449` | -23.31028, -51.16278 | `postcard.city.3458449.front` | cartão: Lago Igapó, terra vermelha, café e horizonte urbano | Londrina ilustrada junto ao Lago Igapó, com terra vermelha e cafezais | produzido/ativo |
| Nova Friburgo · Rio de Janeiro · Brasil · `3456166` | -22.28194, -42.53111 | `postcard.city.3456166.front` | cartão: serra, neblina, flores e casario visto em conjunto | Nova Friburgo ilustrada entre montanhas, neblina e flores | produzido/ativo |
| Hong Kong · Hong Kong · `1819729` | 22.27832, 114.17469 | `postcard.city.1819729.front` | cartão: Victoria Harbour, relevo, ferry genérico sem marca e densidade vertical | Porto e horizonte vertical de Hong Kong vistos entre as montanhas | produzido/ativo · revisão cultural concluída |

O primeiro lote foi concluído para as quatro cidades. Cada cartão é desbloqueado uma única vez
quando uma viagem não tutorial termina no destino canônico `city:<GeoName ID>`; nomes e
coordenadas aproximadas não são aceitos como prova da visita.

## Capitais brasileiras

Todas as linhas têm status `proposta`; nenhuma está aprovada para produção. “Referência” significa
tema de pesquisa permitido, não autorização para copiar fotografia ou obra de terceiro.

| Ordem | Cidade · UF · GeoName ID | População GeoNames · coordenada pública | Chave futura do cartão | Tema, composição e referência permitida | Alt text preliminar | Prioridade/status |
|---:|---|---|---|---|---|---|
| 1 | São Paulo · SP · `3448439` | 12.400.232 · -23.54750, -46.63611 | `postcard.city.3448439.front` | cartão: skyline urbano, avenida arborizada e ipês | Ilustração postal de São Paulo com avenida, arquitetura urbana e ipês | produzido/ativo |
| 2 | Rio de Janeiro · RJ · `3451190` | 6.747.815 · -22.90642, -43.18223 | `postcard.city.3451190.front` | cartão: baía, Pão de Açúcar e calçadão | Cartão ilustrado do Rio entre montanhas, baía e calçadão | produzido/ativo |
| 3 | Belo Horizonte · MG · `3470127` | 2.721.564 · -19.92083, -43.93778 | `postcard.city.3470127.front` | cartão: Serra do Curral, horizonte urbano, ipês e jabuticabeiras | Vista postal de Belo Horizonte diante da Serra do Curral | produzido/ativo |
| 4 | Salvador · BA · `3450554` | 2.711.840 · -12.97563, -38.49096 | `postcard.city.3450554.front` | cartão: casario, elevador urbano e Baía de Todos-os-Santos | Casario colorido de Salvador voltado para a baía | produzido/ativo |
| 5 | Fortaleza · CE · `3399415` | 2.400.000 · -3.71722, -38.54306 | `postcard.city.3399415.front` | cartão: orla, jangadas e luz costeira | Orla ilustrada de Fortaleza com jangada e céu luminoso | produzido/ativo |
| 6 | Manaus · AM · `3663517` | 2.219.580 · -3.10194, -60.02500 | `postcard.city.3663517.front` | cartão: encontro das águas, porto e floresta | Manaus entre o porto, os rios de cores diferentes e a floresta | produzido/ativo |
| 7 | Brasília · DF · `3469058` | 2.207.718 · -15.77972, -47.92972 | `postcard.city.3469058.front` | cartão: eixo monumental e céu do cerrado | Horizonte de Brasília sob céu amplo e ipês do cerrado | produzido/ativo |
| 8 | Curitiba · PR · `3464975` | 1.948.626 · -25.42778, -49.27306 | `postcard.city.3464975.front` | cartão: araucárias, parques e horizonte urbano | Curitiba ilustrada entre parques e araucárias | produzido/ativo |
| 9 | Recife · PE · `3390760` | 1.653.461 · -8.05389, -34.88111 | `postcard.city.3390760.front` | cartão: pontes, rios e casario | Pontes e casario do Recife refletidos nos rios | produzido/ativo |
| 10 | Goiânia · GO · `3462377` | 1.536.097 · -16.67861, -49.25389 | `postcard.city.3462377.front` | cartão: art déco, parques e pequi | Arquitetura art déco de Goiânia cercada por árvores do cerrado | produzido/ativo |
| 11 | Belém · PA · `3405870` | 1.499.641 · -1.45583, -48.50444 | `postcard.city.3405870.front` | cartão: mercado ribeirinho, mangueiras e baía | Belém ilustrada entre mangueiras, mercado e baía | produzido/ativo |
| 12 | Porto Alegre · RS · `3452925` | 1.488.252 · -30.03283, -51.23019 | `postcard.city.3452925.front` | cartão: Guaíba, cais e pôr do sol | Pôr do sol no Guaíba diante de Porto Alegre | produzido/ativo |
| 13 | Maceió · AL · `3395981` | 1.031.597 · -9.66583, -35.73528 | `postcard.city.3395981.front` | cartão: piscinas naturais, jangadas e coqueiros | Jangada nas águas claras diante da orla de Maceió | produzido/ativo |
| 14 | São Luís · MA · `3388368` | 917.237 · -2.52972, -44.30278 | `postcard.city.3388368.front` | cartão: azulejos, telhados e baía | Fachadas azulejadas de São Luís junto à baía | produzido/ativo |
| 15 | Campo Grande · MS · `3467747` | 906.092 · -20.44278, -54.64639 | `postcard.city.3467747.front` | cartão: ipês, parques e araras | Araras e ipês em uma paisagem urbana de Campo Grande | produzido/ativo |
| 16 | Natal · RN · `3394023` | 896.708 · -5.79500, -35.20944 | `postcard.city.3394023.front` | cartão: dunas, estuário e mar | Dunas e mar emoldurando a cidade de Natal | produzido/ativo |
| 17 | Teresina · PI · `3386496` | 871.126 · -5.08917, -42.80194 | `postcard.city.3386496.front` | cartão: encontro dos rios, ponte e árvores | Encontro dos rios e paisagem verde de Teresina | produzido/ativo |
| 18 | João Pessoa · PB · `3397277` | 817.511 · -7.11500, -34.86306 | `postcard.city.3397277.front` | cartão: falésias, costa e mata atlântica | Falésias e mata atlântica na costa de João Pessoa | produzido/ativo |
| 19 | Aracaju · SE · `3471872` | 664.908 · -10.91111, -37.07167 | `postcard.city.3471872.front` | cartão: orla, rio Sergipe e cajueiros | Orla de Aracaju entre rio, mangue e cajueiros | produzido/ativo |
| 20 | Cuiabá · MT · `3465038` | 618.124 · -15.59611, -56.09667 | `postcard.city.3465038.front` | cartão: casario, cerrado e portal do Pantanal | Cuiabá ilustrada entre casario, cerrado e céu do Pantanal | produzido/ativo |
| 21 | Porto Velho · RO · `3662762` | 548.952 · -8.76194, -63.90389 | `postcard.city.3662762.front` | cartão: rio Madeira, porto e floresta | Porto Velho às margens do rio Madeira e da floresta | produzido/ativo |
| 22 | Macapá · AP · `3396016` | 512.902 · 0.03889, -51.06639 | `postcard.city.3396016.front` | cartão: linha do Equador, estuário e orla | Macapá junto ao rio sob a linha simbólica do Equador | produzido/ativo |
| 23 | Florianópolis · SC · `3463237` | 508.826 · -27.59667, -48.54917 | `postcard.city.3463237.front` | cartão: ilha, baía, dunas e pesca | Ilha de Florianópolis com mar, dunas e barcos de pesca | produzido/ativo |
| 24 | Boa Vista · RR · `3664980` | 419.652 · 2.81972, -60.67333 | `postcard.city.3664980.front` | cartão: rio Branco, lavrado e traçado radial | Boa Vista junto ao rio e ao lavrado de Roraima | produzido/ativo |
| 25 | Rio Branco · AC · `3662574` | 419.452 · -9.97472, -67.81000 | `postcard.city.3662574.front` | cartão: rio Acre, passarelas e floresta | Rio Branco ilustrada entre o rio Acre e a floresta | produzido/ativo |
| 26 | Vitória · ES · `3444924` | 312.656 · -20.31944, -40.33778 | `postcard.city.3444924.front` | cartão: ilha, morros e baía | Ilha de Vitória cercada por morros e águas da baía | produzido/ativo |
| 27 | Palmas · TO · `3474574` | 306.296 · -10.16745, -48.32766 | `postcard.city.3474574.front` | cartão: lago, cerrado e pôr do sol | Palmas diante do lago sob o pôr do sol do cerrado | produzido/ativo |

## Regras de deduplicação e revisão

- Se uma cidade de Ninho também for capital, ela ocupa uma única linha pelo GeoName ID e sobe na
  prioridade; não se cria segunda chave.
- Mudanças de nome ou coordenada do catálogo não alteram a identidade nem desbloqueios históricos.
- Referências arquitetônicas, culturais, indígenas, religiosas e de artesanato exigem revisão
  editorial e de direitos antes do brief.
- O selo deve representar a UF inteira e não apenas sua capital. Não utilizar brasões oficiais,
  marcas de turismo ou grafismos tradicionais sem autorização.
- Antes do lote piloto, ainda é necessário aprovar: primeira cidade/região entre as quatro,
  responsável editorial, referências licenciadas e critérios de fidelidade geográfica.
