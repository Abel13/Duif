# Catálogo editorial de Lugares Memoráveis

> Catálogo editorial iniciado em 25 de agosto de 2026. Entradas marcadas como ativas foram
> aprovadas e integradas; as demais continuam propostas sem autorização automática de produção.

## Status consolidado e fontes de verdade

Lugares Memoráveis são uma família própria de descobertas mundiais. Não pertencem ao catálogo
regional, não são definidos pelas cidades com Ninhos e não acompanham os lotes de cartões urbanos.
A seleção considera reconhecimento internacional, localização pública verificável, representação
cultural responsável e leitura no mapa — nunca a distribuição de jogadores ou cidades de um lote
de cartões.

| Dado | Fonte de verdade |
|---|---|
| Comportamento, desbloqueio, privacidade e recompensas | [regras do produto](../product/rules.md#lugares-memoráveis) |
| Chaves, versões e assets publicados no runtime | Official Asset Registry |
| Seleção editorial, candidatos, briefs e revisão cultural | este catálogo |
| Arquivos existentes, dimensões e dívida visual | [inventário mestre](asset-inventory.md) |
| Estado e ordem das iniciativas de produto | [roadmap](../product/roadmap.md#planejamento-e-produção-do-catálogo-visual) |

As 50 entradas catalogadas estão ativas, cada uma com seu par de assets WebP, proveniência no
Official Asset Registry e validação visual de fidelidade, legibilidade e ausência de texto ou marcas.

Cada Lugar Memorável aprovado exige o par completo: um sticker ilustrado transparente para o mapa
e a frente 3:2 de seu cartão postal permanente. O detalhe dos itens publicados, candidatos,
prioridades e revisões obrigatórias permanece neste documento.

## Princípios

A seleção contém pontos específicos, reconhecíveis e verificáveis, distribuídos entre América do
Sul (9), América do Norte/Central (8), Europa (10), África (9), Ásia (10) e Oceania (4). A
distribuição evita transformar Europa e América do Norte no padrão dominante e mantém equilíbrio
entre referências naturais, culturais e arquitetônicas.

As coordenadas são pontos públicos editoriais com precisão suficiente para revisão de catálogo,
não limites de propriedade. Antes de integrar qualquer entrada, conferir o ponto contra uma fonte
geográfica aberta atual, a licença da referência e eventuais restrições de representação. A
seleção é independente de cidades com Ninhos, densidade de usuários, cartões postais e selos. Um
marco só entra quando o ponto possui reconhecimento internacional forte e uma localização
específica verificável.

Contrato de asset: `landmark.<slug>.artwork`, WebP transparente, até 256×256 e 60 KB. Cada entrada
também exige `postcard.landmark.<slug>.front`, WebP 3:2, antes de ser considerada completa. A
referência visual permitida é uma descrição, Wikimedia Commons com licença compatível, acervo
público ou página oficial para pesquisa factual — nunca autorização para copiar uma fotografia.
Assets publicados seguem a [política operacional de assets](assets.md#política-operacional-aprovada)
(geração assistida, titularidade DUIF).

## Direção visual: marco como sticker ilustrado

Cada marco deve parecer um sticker ilustrado pertencente ao mesmo caderno postal do DUIF, e não
uma fotografia recortada, um ícone vetorial genérico ou uma miniatura realista. “Sticker” descreve
a apresentação visual no mapa; não transforma o marco em adesivo de correspondência, recompensa
consumível ou item de inventário.

Direção obrigatória:

- ilustração rasterizada com textura suave, contornos orgânicos e paleta postal já usada pela
  aplicação;
- silhueta principal imediatamente reconhecível, simplificando elementos secundários sem
  descaracterizar o ponto real;
- recorte externo irregular e intencional, envolvido por uma borda clara de papel adesivo;
- uma sombra curta, opaca e discreta pode separar o sticker do mapa, sem glassmorphism, brilho,
  neon ou volume 3D;
- fundo transparente fora da borda do sticker, exportado em WebP; nenhuma nova ilustração de marco
  será produzida em SVG;
- composição frontal ou em três quartos, escolhida pela leitura da silhueta, sem moldura quadrada,
  cartão retangular, legenda incorporada ou fotografia ao fundo;
- detalhes grossos o suficiente para sobreviver no tamanho mínimo do mapa; janelas, esculturas,
  folhagem e texturas pequenas podem ser agrupadas em massas visuais;
- cores e materiais preservam a identidade do marco, mas recebem harmonização com papel, tinta,
  azul postal, vermelho postal e tons naturais do DUIF;
- nenhuma pessoa identificável, marca comercial, logotipo, interface, placa publicitária ou texto
  ilegível dentro da arte;
- monumentos religiosos, culturais e lugares sagrados exigem representação respeitosa, sem
  caricatura, personagens fantasiosos ou decoração que altere seu significado;
- a área segura deve manter a ilustração e a borda completamente dentro do arquivo, sem corte em
  zoom, seleção, foco ou telas de alta densidade.

Especificação preliminar:

- arquivo final: WebP transparente, espaço quadrado de 256×256 px, máximo de 60 KB;
- conteúdo principal dentro de aproximadamente 184×184 px centrais, permitindo ornamentos altos
  apenas quando necessários à silhueta;
- borda clara equivalente a aproximadamente 5–8% da largura visível do marco;
- variante única por marco: o mesmo asset serve ao mapa e à ficha, sem criar uma identidade visual
  diferente em tamanhos menores;
- no mapa, CSS pode aplicar somente escala, sombra e estados de foco/seleção; não deve reconstruir
  ou recolorir a ilustração;
- na ficha informativa, o sticker aparece maior sobre papel do DUIF, acompanhado de nome e texto
  em HTML traduzido, nunca gravados na imagem.

Cada brief futuro deverá mostrar o marco em pelo menos quatro contextos: tamanho mínimo no mapa,
zoom de descoberta, ficha informativa e fundo noturno/sazonal. A aprovação precisa confirmar
silhueta, fidelidade, respeito cultural, transparência, borda inteira, contraste e coerência com os
assets atuais antes de publicar a versão no Registry.

## Proposta nominal de 50 Lugares Memoráveis

Todas as entradas usam raio fixo de **25 km** quando publicadas. As não marcadas como ativas
permanecem `proposta-em-revisão`.

| # | Chave proposta · marco | Local · coordenada pública | Categoria · justificativa e descrição | Referência e composição sugerida | Alt text preliminar | Prioridade |
|---:|---|---|---|---|---|---|
| 1 | `landmark.christ-the-redeemer` · Cristo Redentor · **ativo** | Rio de Janeiro, RJ, Brasil · -22.95192, -43.21049 | cultural · ícone brasileiro em paisagem singular; monumento no alto do Corcovado | sticker oficial em aquarela e tinta; silhueta, base do Corcovado e vegetação contida | Sticker ilustrado do Cristo Redentor sobre o Corcovado | produzido |
| 2 | `landmark.masp` · MASP · **ativo** | São Paulo, SP, Brasil · -23.56142, -46.65588 | arquitetônico · museu de reconhecimento internacional e vão livre marcante na Avenida Paulista | aquarela e tinta; volume suspenso, pilares vermelhos e vão livre, sem marcas de exposições | Sticker ilustrado do MASP com sua estrutura vermelha e vão livre | ativo no catálogo autoritativo |
| 3 | `landmark.iguazu-devils-throat` · Garganta do Diabo · **ativo** | Foz do Iguaçu, Paraná, Brasil/Argentina · -25.69526, -54.43667 | natural · catarata transfronteiriça excepcional; grande arco de quedas e névoa | sticker oficial em aquarela e tinta; água em ferradura, mata e névoa | Sticker ilustrado da Garganta do Diabo cercada pela Mata Atlântica | produzido |
| 4 | `landmark.machu-picchu` · Machu Picchu · **ativo** | Cusco, Peru · -13.16314, -72.54496 | cultural · sítio andino de alcance mundial; terraços e montanhas | sticker oficial respeitoso em aquarela e tinta; terraços em diagonal e Huayna Picchu | Sticker ilustrado de Machu Picchu com terraços e montanhas andinas | produzido |
| 5 | `landmark.salar-de-uyuni` · Salar de Uyuni · **ativo** | Potosí, Bolívia · -20.13378, -67.48913 | natural · paisagem mineral mundialmente reconhecida; horizonte espelhado e hexágonos de sal | ilustração original assistida por IA, validada contra o brief; ilha de cactos distante e reflexo | Sticker ilustrado do Salar de Uyuni | produzido |
| 6 | `landmark.perito-moreno-glacier` · Glaciar Perito Moreno · **ativo** | Santa Cruz, Argentina · -50.49673, -73.13766 | natural · massa glacial acessível e distinta; parede azul sobre lago | ilustração original assistida por IA, validada contra o brief; gelo frontal, lago e montanhas | Sticker ilustrado do Glaciar Perito Moreno | produzido |
| 7 | `landmark.torres-del-paine` · Torres del Paine · **ativo** | Magallanes, Chile · -50.94231, -73.40679 | natural · silhueta montanhosa inequívoca; três torres sobre lago | ilustração original assistida por IA, validada contra o brief; torres e lago turquesa | Sticker ilustrado das Torres del Paine | produzido |
| 8 | `landmark.angel-falls` · Salto Ángel · **ativo** | Bolívar, Venezuela · 5.96749, -62.53511 | natural · queda d’água de reconhecimento mundial em tepui; fio d’água de grande altura | ilustração original assistida por IA, validada contra o brief; tepui vertical, queda e floresta | Sticker ilustrado do Salto Ángel | produzido |
| 9 | `landmark.ahu-tongariki` · Ahu Tongariki · **ativo** | Ilha de Páscoa, Valparaíso, Chile · -27.12587, -109.27670 | cultural · conjunto específico de moais; quinze figuras diante do oceano | ilustração original assistida por IA, validada contra o brief; silhuetas alinhadas e amanhecer | Sticker ilustrado de Ahu Tongariki | produzido |
| 10 | `landmark.statue-of-liberty` · Estátua da Liberdade · **ativo** | Nova York, Estados Unidos · 40.68925, -74.04450 | cultural · símbolo histórico de migração; estátua na ilha | NPS e acervo público; estátua, pedestal e porto | Estátua da Liberdade sobre sua ilha no porto de Nova York | média |
| 11 | `landmark.golden-gate-bridge` · Golden Gate Bridge · **ativo** | São Francisco, Califórnia, Estados Unidos · 37.81993, -122.47826 | arquitetônico · ponte de silhueta forte; vãos sobre neblina | autoridade pública e imagens licenciadas; duas torres e névoa | Ponte Golden Gate atravessando a entrada da baía | média |
| 12 | `landmark.grand-canyon-mather-point` · Mather Point · **ativo** | Arizona, Estados Unidos · 36.05914, -112.10936 | natural · ponto específico do Grand Canyon; camadas rochosas profundas | NPS/acervo público; mirante sem pessoas e cânion estratificado | Camadas rochosas do Grand Canyon vistas de Mather Point | média |
| 13 | `landmark.chichen-itza-kukulkan` · Pirâmide de Kukulcán · **ativo** | Yucatán, México · 20.68294, -88.56865 | cultural · monumento maia específico; pirâmide escalonada | INAH/UNESCO para fatos; frontal, vegetação baixa, sem efeitos fantasiosos | Pirâmide escalonada de Kukulcán em Chichén Itzá | alta |
| 14 | `landmark.teotihuacan-sun-pyramid` · Pirâmide do Sol · **ativo** | Estado do México, México · 19.69250, -98.84383 | cultural · centro mesoamericano distinto; pirâmide e avenida | INAH/UNESCO; vista oblíqua com pirâmide e montanhas | Pirâmide do Sol e avenida de Teotihuacán | média |
| 15 | `landmark.niagara-horseshoe-falls` · Horseshoe Falls · **ativo** | Ontário, Canadá/NY, Estados Unidos · 43.07727, -79.07414 | natural · catarata transfronteiriça específica; arco de água e névoa | parques oficiais; ferradura, rio e névoa | Queda em ferradura das Cataratas do Niágara | média |
| 16 | `landmark.miraflores-locks` · Eclusas de Miraflores · **ativo** | Cidade do Panamá, Panamá · 9.00525, -79.59034 | arquitetônico · engenharia interoceânica específica; navio atravessando eclusas | autoridade do canal; câmaras, água e cargueiro genérico sem marca | Eclusas de Miraflores conduzindo um navio pelo canal | média |
| 17 | `landmark.tikal-temple-one` · Templo I de Tikal · **ativo** | Petén, Guatemala · 17.22204, -89.62370 | cultural · cidade maia na floresta; templo emergindo da copa | UNESCO e imagens licenciadas; pirâmide alta, praça e mata | Templo I de Tikal elevando-se sobre a floresta | média |
| 18 | `landmark.eiffel-tower` · Torre Eiffel · **ativo** | Paris, França · 48.85837, 2.29448 | arquitetônico · silhueta mundialmente legível; torre de ferro sobre jardim | acervos diurnos licenciados; evitar iluminação noturna protegida; torre e árvores | Torre Eiffel vista acima dos jardins de Paris | média |
| 19 | `landmark.colosseum` · Coliseu · **ativo** | Roma, Lácio, Itália · 41.89021, 12.49223 | arquitetônico · anfiteatro histórico específico; arcos e ruína | parque arqueológico/UNESCO; três níveis de arcos, pinheiros discretos | Arcos antigos do Coliseu em Roma | média |
| 20 | `landmark.alhambra-comares` · Alhambra · **ativo** | Granada, Andaluzia, Espanha · 37.17608, -3.58814 | arquitetônico · conjunto palaciano histórico singular; muralhas entre colina e serra | UNESCO e acervos licenciados; muralhas, Torre de Comares e Sierra Nevada | Muralhas e torres de Alhambra sobre a colina de Granada | média |
| 21 | `landmark.elizabeth-tower` · Elizabeth Tower · **ativo** | Londres, Inglaterra, Reino Unido · 51.50073, -0.12463 | arquitetônico · relógio cívico reconhecível; torre junto ao Parlamento | UK Parliament/acervos licenciados; torre, relógio e Tâmisa | Torre do relógio Elizabeth junto ao rio Tâmisa | média |
| 22 | `landmark.acropolis-parthenon` · Partenon da Acrópole · **ativo** | Atenas, Ática, Grécia · 37.97153, 23.72673 | cultural · referência clássica específica; colunas sobre colina | UNESCO/acervos abertos; colunas, rocha e oliveira | Colunas do Partenon no alto da Acrópole de Atenas | média |
| 23 | `landmark.neuschwanstein-castle` · Castelo de Neuschwanstein · **ativo** | Baviera, Alemanha · 47.55757, 10.74980 | arquitetônico · castelo histórico de silhueta distinta; torres em paisagem alpina | administração bávara/imagens licenciadas; castelo, floresta e Alpes | Castelo de Neuschwanstein entre floresta e montanhas | baixa |
| 24 | `landmark.charles-bridge` · Ponte Carlos · **ativo** | Praga, Chéquia · 50.08648, 14.41143 | cultural · travessia histórica específica; arcos e torres sobre rio | patrimônio municipal/imagens licenciadas; ponte, rio e telhados | Ponte Carlos atravessando o rio diante das torres de Praga | baixa |
| 25 | `landmark.mont-saint-michel` · Mont-Saint-Michel · **ativo** | Normandia, França · 48.63606, -1.51146 | arquitetônico · ilha-abacial de contorno único; maré e vila vertical | UNESCO e imagens licenciadas; ilha inteira, água e céu | Abadia e vila do Mont-Saint-Michel cercadas pela maré | média |
| 26 | `landmark.matterhorn` · Matterhorn · **ativo** | Valais, Suíça/Itália · 45.97657, 7.65845 | natural · pico de geometria singular; montanha acima de lago alpino | cartografia e imagens abertas; pirâmide rochosa, neve e lago | Pico triangular do Matterhorn acima de um lago alpino | baixa |
| 27 | `landmark.stonehenge` · Stonehenge · **ativo** | Wiltshire, Inglaterra, Reino Unido · 51.17888, -1.82622 | cultural · círculo megalítico específico; pedras sobre planície | English Heritage/imagens licenciadas; círculo completo e gramado | Círculo de pedras de Stonehenge sobre a planície | média |
| 28 | `landmark.giza-great-pyramid` · Grande Pirâmide de Gizé · **ativo** | Gizé, Egito · 29.97923, 31.13420 | cultural · monumento antigo fundamental; pirâmides e deserto | UNESCO/Ministério de Antiguidades; pirâmide principal e duas secundárias | Grande Pirâmide de Gizé erguida sobre o deserto | alta |
| 29 | `landmark.table-mountain` · Table Mountain · **ativo** | Cidade do Cabo, Western Cape, África do Sul · -33.96282, 18.40984 | natural · montanha de topo plano junto à cidade; perfil inequívoco | parque nacional e imagens licenciadas; topo plano, baía e fynbos | Table Mountain acima da Cidade do Cabo e da baía | alta |
| 30 | `landmark.victoria-falls-devils-cataract` · Cataratas Vitória · **ativo** | Livingstone/Victoria Falls, Zâmbia/Zimbábue · -17.92430, 25.85720 | natural · grande queda transfronteiriça; cortina d’água e névoa | UNESCO/parques; vista ampla, floresta e arco-íris discreto | Cortina de água das Cataratas Vitória envolta em névoa | alta |
| 31 | `landmark.kilimanjaro-uhuru-peak` · Pico Uhuru · **ativo** | Kilimanjaro, Tanzânia · -3.06742, 37.35563 | natural · teto da África e destino específico; cume sobre savana | parque nacional/UNESCO; cume nevado e acácia distante | Cume do Kilimanjaro elevando-se além da savana | média |
| 32 | `landmark.hassan-ii-mosque` · Mesquita Hassan II · **ativo** | Casablanca, Marrocos · 33.60847, -7.63267 | arquitetônico · edifício costeiro específico; minarete sobre Atlântico | fonte oficial para fatos e imagens licenciadas; revisão religiosa respeitosa | Minarete da Mesquita Hassan II junto ao oceano | baixa/revisão cultural |
| 33 | `landmark.lalibela-bete-giyorgis` · Bete Giyorgis · **ativo** | Lalibela, Amhara, Etiópia · 12.03172, 39.04115 | cultural · igreja monolítica específica; cruz escavada na rocha | UNESCO e imagens licenciadas; vista superior, rocha e caminho | Igreja de Bete Giyorgis escavada em forma de cruz na rocha | alta/revisão cultural |
| 34 | `landmark.great-mosque-djenne` · Grande Mesquita de Djenné · **ativo** | Mopti, Mali · 13.90536, -4.55500 | arquitetônico · arquitetura de terra singular; fachada com torres | UNESCO e imagens licenciadas; revisão religiosa e comunitária | Fachada de terra da Grande Mesquita de Djenné | média/revisão cultural |
| 35 | `landmark.avenue-of-baobabs` · Avenida dos Baobás · **ativo** | Menabe, Madagascar · -20.25099, 44.41976 | natural · alinhamento botânico específico; árvores monumentais em estrada | área protegida/imagens licenciadas; corredor de baobás ao entardecer | Baobás monumentais alinhados ao longo de uma estrada | média |
| 36 | `landmark.great-zimbabwe` · Grande Zimbábue · **ativo** | Masvingo, Zimbábue · -20.26750, 30.93382 | cultural · complexo histórico africano essencial; muralhas curvas de pedra | UNESCO e imagens licenciadas; grande recinto, torre cônica e colinas | Muralhas de pedra do Grande Zimbábue entre colinas | alta |
| 37 | `landmark.great-wall-badaling` · Grande Muralha em Badaling · **ativo** | Pequim, China · 40.35494, 116.00605 | cultural · trecho específico e verificável; muralha sobre cristas | UNESCO e fontes oficiais; torres e linha serpenteante | Grande Muralha seguindo as cristas montanhosas de Badaling | alta |
| 38 | `landmark.taj-mahal` · Taj Mahal · **ativo** | Agra, Uttar Pradesh, Índia · 27.17514, 78.04214 | arquitetônico · mausoléu de simetria emblemática; mármore e jardim | UNESCO e imagens licenciadas; eixo frontal, espelho d’água e ciprestes | Taj Mahal refletido no espelho d’água de seu jardim | alta |
| 39 | `landmark.fushimi-inari-senbon-torii` · Senbon Torii · **ativo** | Kyoto, Japão · 34.96714, 135.77267 | cultural · caminho específico de portais; sequência vermelha na floresta | santuário/fontes licenciadas; revisão religiosa, sem personagens | Caminho de portais torii atravessando a floresta de Kyoto | média/revisão cultural |
| 40 | `landmark.angkor-wat` · Angkor Wat · **ativo** | Siem Reap, Camboja · 13.41248, 103.86699 | cultural · complexo monumental singular; torres refletidas | UNESCO/APSARA e imagens licenciadas; torres, fosso e palmeiras | Torres de Angkor Wat refletidas na água | alta |
| 41 | `landmark.borobudur` · Borobudur · **ativo** | Java Central, Indonésia · -7.60787, 110.20375 | cultural · monumento budista específico; estupas e vulcões | UNESCO e imagens licenciadas; revisão religiosa respeitosa | Estupas de Borobudur diante das montanhas de Java | alta/revisão cultural |
| 42 | `landmark.potala-palace` · Palácio de Potala · **ativo** | Lhasa, Tibete, China · 29.65782, 91.11686 | arquitetônico · conjunto mundialmente reconhecido de silhueta única; palácio sobre colina | UNESCO e imagens licenciadas; revisão política/cultural | Palácio de Potala erguido sobre a colina em Lhasa | baixa/revisão sensível |
| 43 | `landmark.forbidden-city-meridian-gate` · Portão Meridiano · **ativo** | Pequim, China · 39.91273, 116.39709 | arquitetônico · entrada específica do complexo imperial; muralhas e telhados | UNESCO/Palace Museum; composição frontal sem multidão | Portão Meridiano e telhados da Cidade Proibida | média |
| 44 | `landmark.himeji-castle` · Castelo de Himeji · **ativo** | Hyogo, Japão · 34.83945, 134.69390 | arquitetônico · castelo preservado de silhueta clara; volumes brancos | UNESCO e imagens licenciadas; castelo, cerejeira sem excesso sazonal | Castelo branco de Himeji acima de suas muralhas | média |
| 45 | `landmark.halong-bay-thien-cung` · Baía de Hạ Long · **ativo** | Quảng Ninh, Vietnã · 20.91010, 107.18390 | natural · ponto específico entre carstes; ilhas calcárias e água | UNESCO e imagens licenciadas; barcos genéricos sem marca e penhascos | Ilhas calcárias emergindo das águas da Baía de Hạ Long | média |
| 46 | `landmark.bagan-ananda-temple` · Templo Ananda · **ativo** | Bagan, Myanmar · 21.17116, 94.86754 | cultural · templo específico em planície arqueológica; cúpula dourada | UNESCO e imagens licenciadas; revisão política/religiosa | Templo Ananda entre os monumentos da planície de Bagan | baixa/revisão sensível |
| 47 | `landmark.twelve-apostles` · Twelve Apostles · **ativo** | Victoria, Austrália · -38.66588, 143.10449 | natural · conjunto costeiro específico; pilares calcários diante de falésias | Parks Victoria e imagens licenciadas; pilares, mar e falésia sem infraestrutura | Pilares rochosos dos Twelve Apostles diante da costa australiana | média |
| 48 | `landmark.uluru` · Uluru · **ativo** | Northern Territory, Austrália · -25.34443, 131.03688 | natural · monólito e lugar sagrado; rocha no deserto | Parks Australia; consulta cultural obrigatória e respeito a restrições de imagem | Uluru elevando-se sobre a planície do deserto | alta/revisão cultural |
| 49 | `landmark.heart-reef` · Heart Reef · **ativo** | Queensland, Austrália · -19.77515, 149.24754 | natural · formação específica na Grande Barreira; recife em forma de coração | parque marinho/UNESCO; vista aérea estilizada sem operador turístico | Pequeno recife em forma de coração nas águas azuis | média |
| 50 | `landmark.milford-sound-mitre-peak` · Mitre Peak · **ativo** | Southland, Nova Zelândia · -44.67161, 167.92563 | natural · fiorde específico e pico reconhecível; montanha sobre água escura | DOC/Te Wahipounamu e imagens licenciadas | Mitre Peak refletido nas águas de Milford Sound | média |

## Comportamento dos lugares implementados

- Todos os 50 lugares são desbloqueados durante a passagem de uma nova rota não tutorial a até 25 km.
- O marco só aparece para o jogador depois do desbloqueio; antes disso não há silhueta, pista ou
  contagem que revele sua posição.
- Tocar no marco abre uma ficha informativa editorial, sem expor coordenadas privadas de rotas.
- O mapa renderiza o marco somente quando o zoom comporta a imagem inteira e o mecanismo de
  colisão encontra espaço. Não há agrupamento, pilha, contador ou sobreposição.
- Os lugares publicados usam zoom mínimo 8, mantendo os stickers fora de visões continentais e
  estaduais.
- Se dois Lugares Memoráveis competirem pelo mesmo espaço, prioridade visual determinística escolhe um; o
  outro aparece em zoom posterior.
- O asset é ornamental e não concede bônus funcional por si só.
- A primeira passagem também deve liberar o cartão postal oficial permanente do lugar. Essa
  concessão é única por perfil e não consome o cartão ao enviá-lo.

## Pares visuais publicados

| Lugar Memorável | Sticker do mapa | Cartão postal permanente |
|---|---|---|
| Cristo Redentor | `landmark.christTheRedeemer.artwork` · ativo | `postcard.landmark.christTheRedeemer.front` · ativo e concedido no desbloqueio |
| MASP | `landmark.masp.artwork` · ativo | `postcard.landmark.masp.front` · ativo e concedido no desbloqueio |
| Garganta do Diabo | `landmark.iguazuDevilsThroat.artwork` · ativo | `postcard.landmark.iguazuDevilsThroat.front` · ativo e concedido no desbloqueio |
| Machu Picchu | `landmark.machuPicchu.artwork` · ativo | `postcard.landmark.machuPicchu.front` · ativo e concedido no desbloqueio |

Todo brief contempla os dois assets. O sticker privilegia silhueta e leitura entre
40–56 px; o cartão usa composição horizontal 3:2 adequada à inspeção e ao envio postal.

## Revisão concluída

Os 50 marcos passaram por revisão visual do par de assets, verificação técnica de dimensões e
tamanho e teste local do catálogo, da descoberta e da concessão idempotente do cartão.
