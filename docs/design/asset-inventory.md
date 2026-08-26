# Inventário mestre de assets

> Snapshot editorial: 25 de agosto de 2026. Este documento não substitui o Official Asset
> Registry nem autoriza produção, publicação ou remoção de arquivos.

## Escopo, fontes e classificação

O inventário cruza as migrations do Registry, o manifest tipado em `src/game/assets.ts`, os
arquivos em `public/assets`, referências JSX/CSS, catálogos funcionais, regras do produto,
documentação de design e todo o roadmap. O banco Supabase local foi usado apenas para conferir o
estado materializado das migrations. Ele não representa produção.

Classificações possíveis: `ativo-verificado`, `ativo-revisar`, `referenciado-ausente`,
`arquivo-sem-referência`, `placeholder-aceitável`, `placeholder-substituir`,
`planejado-aprovado`, `planejado-indefinido`, `arquivado` e `candidato-a-remoção`.

Resumo auditado:

- `landmark.christTheRedeemer.artwork` é o primeiro marco produzido: WebP transparente de
  256×256 e 12.772 bytes, registrado como `landmarkArtwork` e integrado ao mapa;
- `landmark.masp.artwork` é um WebP transparente de 256×256 e 15.720 bytes registrado como
  `landmarkArtwork` e integrado ao catálogo autoritativo;
- `postcard.landmark.christTheRedeemer.front` possui arte WebP 3:2 de 1200×800 e 138.302 bytes em
  `public/assets/postcards/landmarks/`, publicado no Registry e concedido permanentemente no
  desbloqueio do Cristo Redentor;
- `postcard.landmark.masp.front` possui arte WebP 3:2 de 1200×800 e 202.524 bytes no mesmo
  diretório, publicado no Registry e concedido permanentemente no desbloqueio do MASP;

- 68 identidades no Registry local: 66 com versão ativa e duas somente arquivadas;
- 66 versões ativas apontam para arquivos presentes após a correção idempotente das quatro
  referências de prestígio;
- 69 arquivos visuais de runtime em `public/assets`, além de fontes e sentinelas de diretório;
- nenhuma chave duplicada em `assetKeys`; identidades funcionais como item ativo e avatar usam os
  tipos genéricos `equipmentIcon` e `nestArtwork` do Registry;
- `.DS_Store` é um órfão conhecido; nada foi removido nesta auditoria.

### Correções entregues e inconsistências que exigem decisão

1. A auditoria encontrou versões ativas locais das quatro bordas apontando para
   `/assets/prestige/generated/*-v2.webp`, arquivos ausentes. A migration corretiva
   `20260825145000_fix_prestige_border_asset_paths.sql` arquiva essas versões e ativa uma nova
   versão para `/assets/prestige/*.webp`, sem alterar arquivos ou históricos. A aplicação em
   produção continua pertencendo ao processo operacional.
2. `postalMark.routeDoodle` e `currency.icon.stamp` estão arquivados. O primeiro ainda possui
   arquivo histórico; o segundo não. Nenhum dos dois deve voltar ao manifest sem decisão.
3. Os PNGs PWA de 512 px excedem o orçamento genérico de 300 KB e o Apple touch icon mede
   161×163, apesar de a documentação esperar 180×180. São ativos de boot, fora do Registry, e
   precisam de revisão específica, não de remoção automática.
4. `.DS_Store` está em `public/assets` e seria copiado para o build. É candidato a remoção numa
   execução posterior autorizada.
5. O Registry local registra 12.212 bytes para `postcard.base.front`, mas a migration e o arquivo
   presente registram 156.788 bytes. O manifest materializado deve ser corrigido somente após
   conferir produção.

## Inventário do Registry

As dimensões e pesos abaixo são dos arquivos versionados no repositório. “Código” inclui a chave
tipada, catálogo ou componente consumidor. Assets decorativos usam `alt=""`; os demais dependem
das traduções do Registry. A origem predominante é o slice raster ilustrado do DUIF; quando a
autoria/licença não está individualizada, a ação recomendada é completar essa ficha antes da
próxima versão.

| Chave oficial | Tipo · versão/estado | Arquivo · formato · dimensão · peso | Código e superfícies | Texto/fallback | Qualidade, dependência e ação | Classe |
|---|---|---|---|---|---|---|
| `activeItem.firstJourneyBoost` | equipmentIcon · v1 ativa | `items/active/first-journey-boost.webp` · WebP · 192² · 9.4 KB | item ativo, inventário/recompensa | tradução do item; cartão CSS | coerente; documentar autoria | ativo-verificado |
| `collectible.firstJourneyStamp` | collectibleThumbnail · v1 ativa | `tutorial/stamps/first-journey.webp` · WebP · 256² · 16 KB | tutorial e Álbum | nome do selo; raridade/texto | aprovado no tutorial; preservar | ativo-verificado |
| `currency.icon.crystal` | currencyIcon · v2 ativa; v1 arquivada | `currency/crystal.svg` · SVG 64² · 818 B | saldos, loja | decorativo; valor textual | linguagem vetorial de UI já aprovada | ativo-verificado |
| `currency.icon.seed` | currencyIcon · v1 ativa | `currency/seed.svg` · SVG 64² · 727 B | saldos, loja | decorativo; valor textual | linguagem vetorial de UI já aprovada | ativo-verificado |
| `currency.icon.stamp` | currencyIcon · v1 arquivada | arquivo histórico ausente | nenhum consumidor atual | valor textual | confirmar retenção do registro | arquivado |
| `equipment.functional.largeBackpack` | equipmentIcon · v1 ativa | `equipment/functional/large-backpack.webp` · 192² · 5.6 KB | equipamento/loja/loadout | nome/descrição; cartão CSS | funcional e leve | ativo-verificado |
| `equipment.functional.mediumBackpack` | equipmentIcon · v1 ativa | `equipment/functional/medium-backpack.webp` · 192² · 4.1 KB | equipamento/loja/loadout | nome/descrição; cartão CSS | funcional e leve | ativo-verificado |
| `equipment.functional.raincoat` | equipmentIcon · v1 ativa | `equipment/functional/raincoat.webp` · 192² · 5.3 KB | equipamento/loja/clima | nome/descrição; cartão CSS | funcional e leve | ativo-verificado |
| `equipment.functional.routeLantern` | equipmentIcon · v1 ativa | `equipment/functional/route-lantern.webp` · 192² · 5.3 KB | equipamento/loja/clima | nome/descrição; cartão CSS | funcional e leve | ativo-verificado |
| `equipment.functional.smallBackpack` | equipmentIcon · v1 ativa | `equipment/functional/small-backpack.webp` · 192² · 4.3 KB | equipamento/loja/loadout | nome/descrição; cartão CSS | funcional e leve | ativo-verificado |
| `equipment.functional.windGoggles` | equipmentIcon · v1 ativa | `equipment/functional/wind-goggles.webp` · 192² · 4.8 KB | equipamento/loja/clima | nome/descrição; cartão CSS | funcional e leve | ativo-verificado |
| `equipment.icon.blueRouteScarf` | equipmentIcon · v1 ativa | `equipment/icons/blue-route-scarf.webp` · 192² · 8.1 KB | inventário/equipamento | nome/raridade; silhueta CSS | slice atual; revisar somente em conjunto | ativo-verificado |
| `equipment.icon.canvasPostalBag` | equipmentIcon · v1 ativa | `equipment/icons/canvas-postal-bag.webp` · 192² · 9.6 KB | inventário/equipamento | nome/raridade; silhueta CSS | slice atual | ativo-verificado |
| `equipment.icon.featherCharm` | equipmentIcon · v1 ativa | `equipment/icons/feather-charm.webp` · 192² · 5.7 KB | inventário/equipamento | nome/raridade; silhueta CSS | slice atual | ativo-verificado |
| `equipment.icon.flightGoggles` | equipmentIcon · v1 ativa | `equipment/icons/flight-goggles.webp` · 192² · 8.5 KB | inventário/equipamento | nome/raridade; silhueta CSS | slice atual | ativo-verificado |
| `equipment.icon.smallSatchel` | equipmentIcon · v1 ativa | `equipment/icons/small-satchel.webp` · 192² · 8.0 KB | inventário/equipamento | nome/raridade; silhueta CSS | slice atual | ativo-verificado |
| `equipment.icon.travelCap` | equipmentIcon · v1 ativa | `equipment/icons/travel-cap.webp` · 192² · 7.8 KB | inventário/equipamento | nome/raridade; silhueta CSS | slice atual | ativo-verificado |
| `equipment.icon.urgentBadge` | equipmentIcon · v1 ativa | `equipment/icons/urgent-badge.webp` · 192² · 8.5 KB | inventário/equipamento | nome/raridade; silhueta CSS | slice atual | ativo-verificado |
| `jobs.artwork.postalBoard` | shopArtwork · v1 ativa | `jobs/postal-board.webp` · 256² · 30.8 KB | quadro de trabalhos | alt traduzido; papel CSS | adequado; manter | ativo-verificado |
| `map.control.destination` | mapControl · v1 ativa | `map/controls/destination.webp` · 256² · 8.1 KB | controle de destino | rótulo real; botão CSS | legível; manter | ativo-verificado |
| `map.control.mascot` | mapControl · v1 ativa | `map/controls/mascot.webp` · 256² · 8.5 KB | controle do mascote | rótulo real; botão CSS | legível; manter | ativo-verificado |
| `map.control.origin` | mapControl · v1 ativa | `map/controls/origin.webp` · 256² · 11.2 KB | controle de origem | rótulo real; botão CSS | legível; manter | ativo-verificado |
| `map.control.overview` | mapControl · v1 ativa | `map/controls/overview.webp` · 256² · 11.8 KB | visão geral do mapa | rótulo real; botão CSS | legível; manter | ativo-verificado |
| `map.pin.destination` | mapPin · v1 ativa | `map/pins/destination.webp` · 256² · 10.3 KB | marcador de destino | label do mapa; pin CSS | verificar colisão em zoom baixo | ativo-verificado |
| `map.pin.nest` | mapPin · v1 ativa | `map/pins/nest.webp` · 256² · 12.4 KB | marcador do Ninho | label do mapa; pin CSS | verificar colisão em zoom baixo | ativo-verificado |
| `mascot.portrait.aurora` | mascotPortrait · v1 ativa | `friends/mascots/aurora.webp` · 512² · 58.3 KB | amigo/listas/mapa | nome do mascote; cores CSS | bom slice público | ativo-verificado |
| `mascot.portrait.bento` | mascotPortrait · v1 ativa | `mascots/public/bento.webp` · 256² · 7.5 KB | visitante/perfil público | nome; cores CSS | baixa resolução para perfil grande | ativo-revisar |
| `mascot.portrait.lume` | mascotPortrait · v1 ativa | `mascots/portraits/lume.webp` · 640² · 111.3 KB | perfil, seleção, mapa | nome; cores CSS | dentro do orçamento | ativo-verificado |
| `mascot.portrait.maple` | mascotPortrait · v1 ativa | `friends/mascots/maple.webp` · 256² · 5.8 KB | amigo/listas/mapa | nome; cores CSS | baixa resolução para perfil grande | ativo-revisar |
| `mascot.portrait.nuvem` | mascotPortrait · v1 ativa | `mascots/portraits/nuvem.webp` · 640² · 60.8 KB | perfil, seleção, mapa | nome; cores CSS | aprovado | ativo-verificado |
| `mascot.portrait.oliva` | mascotPortrait · v1 ativa | `mascots/public/oliva.webp` · 256² · 5.3 KB | visitante/perfil público | nome; cores CSS | baixa resolução para perfil grande | ativo-revisar |
| `mascot.portrait.pipoca` | mascotPortrait · v1 ativa | `mascots/portraits/pipoca.webp` · 640² · 65.3 KB | perfil, seleção, mapa | nome; cores CSS | aprovado | ativo-verificado |
| `mascot.portrait.trovao` | mascotPortrait · v1 ativa | `mascots/portraits/trovao.webp` · 640² · 69.3 KB | perfil, seleção, mapa | nome; cores CSS | aprovado | ativo-verificado |
| `navigation.icon.collection` | navigationIcon · v1 ativa | `navigation/collection.webp` · 160² · 8.3 KB | menu inferior | label/aria real; botão CSS | aprovado | ativo-verificado |
| `navigation.icon.friends` | navigationIcon · v1 ativa | `navigation/friends.webp` · 160² · 7.0 KB | menu inferior | label/aria real; botão CSS | aprovado | ativo-verificado |
| `navigation.icon.map` | navigationIcon · v1 ativa | `navigation/map.webp` · 160² · 6.3 KB | menu inferior | label/aria real; botão CSS | aprovado | ativo-verificado |
| `navigation.icon.nest` | navigationIcon · v1 ativa | `navigation/nest.webp` · 160² · 7.4 KB | menu inferior | label/aria real; botão CSS | aprovado | ativo-verificado |
| `navigation.icon.shop` | navigationIcon · v1 ativa | `navigation/shop.webp` · 160² · 6.8 KB | menu inferior | label/aria real; botão CSS | aprovado | ativo-verificado |
| `nest.artwork.mailbox` | nestArtwork · v1 ativa | `nest/mailbox.webp` · 480×640 · 45.7 KB | Ninho/Caixa Postal | decorativo; papel CSS | aprovado | ativo-verificado |
| `nest.artwork.mascotRoost` | nestArtwork · v1 ativa | `nest/mascot-roost.webp` · 480×640 · 57.3 KB | Ninho/mascotes | decorativo; papel CSS | aprovado | ativo-verificado |
| `nest.artwork.profileNook` | nestArtwork · v1 ativa | `nest/profile-nook.webp` · 480×640 · 51.5 KB | Ninho/perfil | decorativo; papel CSS | aprovado | ativo-verificado |
| `postalMark.postalCancel` | postalMark · v1 ativa | `textures/postal-cancel-mark.webp` · 256² · 6.7 KB | correspondência/carimbo | decorativo; CSS | aprovado | ativo-verificado |
| `postalMark.routeDoodle` | postalMark · v1 arquivada | `textures/route-doodle-mark.webp` · 256² · 3.8 KB | somente histórico | decorativo | arquivo sem manifest ativo; preservar até revisão | arquivado |
| `postcard.base.front` | postcardArtwork · v1 ativa | `postcards/duif-base.webp` · 900×600 · 156.8 KB no arquivo; 12.2 KB no Registry local | compositor, caixa postal, Álbum | alt traduzido; cartão CSS | metadado local divergente; conferir produção | ativo-revisar |
| `postcard.inaugural.front` | postcardArtwork · v1 ativa | `tutorial/postcards/inaugural-front.webp` · 1024×683 · 151 KB | tutorial e Álbum | alt traduzido; cartão CSS | aprovado | ativo-verificado |
| `prestige.border.firstHorizon` | prestigeBorder · v3 ativa; v1–2 arquivadas/ausentes | `prestige/first-horizon.webp` · 512² · 49.3 KB | retratos com prestígio | descrição acessível; sem borda | referência corrigida; validar após release | ativo-verificado |
| `prestige.border.letterSky` | prestigeBorder · v3 ativa; v1–2 arquivadas/ausentes | `prestige/letter-sky.webp` · 512² · 56.4 KB | retratos com prestígio | descrição acessível; sem borda | referência corrigida; validar após release | ativo-verificado |
| `prestige.border.nestAmongStars` | prestigeBorder · v3 ativa; v1–2 arquivadas/ausentes | `prestige/nest-among-stars.webp` · 512² · 59.4 KB | retratos com prestígio | descrição acessível; sem borda | referência corrigida; validar após release | ativo-verificado |
| `prestige.border.routeAtlas` | prestigeBorder · v3 ativa; v1–2 arquivadas/ausentes | `prestige/route-atlas.webp` · 512² · 55.9 KB | retratos com prestígio | descrição acessível; sem borda | referência corrigida; validar após release | ativo-verificado |
| `profile.avatar.defaultSilhouette` | nestArtwork · v1 ativa | `profile/default-silhouette.webp` · 256² · 6.5 KB | perfil/Ninho | alt traduzido; iniciais CSS | neutro e funcional | ativo-verificado |
| `reward.thumbnail.atlanticBadge` | rewardThumbnail · v1 ativa | `items/thumbnails/atlantic-badge.webp` · 256² · 16.9 KB | descoberta/coleção | nome/raridade; cartão CSS | slice atual | ativo-verificado |
| `reward.thumbnail.blueAirmailLabel` | rewardThumbnail · v1 ativa | `items/thumbnails/blue-airmail-label.webp` · 256² · 16.4 KB | descoberta/coleção | nome/raridade; cartão CSS | slice atual | ativo-verificado |
| `reward.thumbnail.goldenCompassPin` | rewardThumbnail · v1 ativa | `items/thumbnails/golden-compass-pin.webp` · 256² · 15.0 KB | descoberta/coleção | nome/raridade; cartão CSS | slice atual | ativo-verificado |
| `reward.thumbnail.wornRouteStamp` | rewardThumbnail · v1 ativa | `items/thumbnails/worn-route-stamp.webp` · 256² · 16.5 KB | descoberta/coleção | nome/raridade; cartão CSS | slice atual | ativo-verificado |
| `shop.thumbnail.airmailProfileRibbon` | shopArtwork · v1 ativa | `shop/thumbnails/airmail-profile-ribbon.webp` · 256² · 7.1 KB | loja/perfil | nome/descrição; cartão CSS | mock comercial; revisar antes de venda real | ativo-revisar |
| `shop.thumbnail.blueEnvelopeSticker` | shopArtwork · v1 ativa | `shop/thumbnails/blue-envelope-sticker.webp` · 256² · 6.2 KB | loja/adesivos | nome/descrição; cartão CSS | mock comercial | ativo-revisar |
| `shop.thumbnail.brassNestPlaque` | shopArtwork · v1 ativa | `shop/thumbnails/brass-nest-plaque.webp` · 256² · 6.9 KB | loja/Ninho | nome/descrição; cartão CSS | mock comercial | ativo-revisar |
| `shop.thumbnail.coastalTownPostcard` | shopArtwork · v1 ativa | `shop/thumbnails/coastal-town-postcard.webp` · 256² · 7.6 KB | loja/cartões | nome/descrição; cartão CSS | miniatura não substitui arte 3:2 | placeholder-substituir |
| `shop.thumbnail.crimsonCourierScarf` | shopArtwork · v1 ativa | `shop/thumbnails/crimson-courier-scarf.webp` · 256² · 6.2 KB | loja/equipamento | nome/descrição; cartão CSS | mock comercial | ativo-revisar |
| `shop.thumbnail.lanternFestivalPostcard` | shopArtwork · v1 ativa | `shop/thumbnails/lantern-festival-postcard.webp` · 256² · 10.5 KB | loja/cartões | nome/descrição; cartão CSS | miniatura não substitui arte 3:2 | placeholder-substituir |
| `shop.thumbnail.meadowPostCap` | shopArtwork · v1 ativa | `shop/thumbnails/meadow-post-cap.webp` · 256² · 5.7 KB | loja/equipamento | nome/descrição; cartão CSS | mock comercial | ativo-revisar |
| `shop.thumbnail.sunnyRouteSticker` | shopArtwork · v1 ativa | `shop/thumbnails/sunny-route-sticker.webp` · 256² · 4.3 KB | loja/adesivos | nome/descrição; cartão CSS | mock comercial | ativo-revisar |
| `stamp.default.front` | collectibleThumbnail · v1 ativa | `stamps/duif-default.webp` · 172×256 · 23.5 KB | compositor/correspondência | alt traduzido; selo CSS | aprovado | ativo-verificado |
| `texture.postalPaperWash` | texture · v1 ativa | `textures/postal-paper-wash.webp` · 512² · 20.8 KB | fundos postais | decorativo; cor CSS | aprovado | ativo-verificado |

## Arquivos fora do Registry

| Arquivo/identidade | Referência e uso | Estado | Ação recomendada |
|---|---|---|---|
| `icons/icon-192.png` | manifest PWA · 192² · 75.5 KB | ativo-verificado | manter |
| `icons/icon-512.png` | manifest PWA · 512² · 513.4 KB | ativo-revisar | reotimizar em lote próprio |
| `icons/icon-maskable-512.png` | manifest PWA · 512² · 305.3 KB | ativo-revisar | validar área segura e orçamento |
| `icons/apple-touch-icon.png` | HTML/iOS · 161×163 · 54.5 KB | ativo-revisar | produzir export exato 180² após brief |
| cinco arquivos `.woff2` em `fonts/` | `@font-face` de boot e escrita postal | ativo-verificado | manter fora do Registry |
| `.gitkeep` em quatro diretórios | preservação estrutural, não vai ao manifest visual | placeholder-aceitável | manter ou remover só com limpeza autorizada |
| `public/assets/.DS_Store` | nenhuma referência; copiado pelo build | candidato-a-remoção | remover em mudança posterior explícita |
| `textures/route-doodle-mark.webp` | versão arquivada ainda presente | arquivado | preservar até política histórica ser aprovada |

## Cobertura e dívida por família

“Inferido” significa que uma tela ou contrato já pede representação visual, mas não que o asset
esteja aprovado. Toda linha nova inferida permanece `proposta`.

| Família | Existentes / ativos | Pendências explicitamente planejadas | Necessidade inferida pela tela | Prioridade · etapa | Custo | Bloqueio e decisão |
|---|---:|---|---|---|---|---|
| Mascotes e retratos | 8 / 8 | variantes futuras conforme catálogo | versões maiores de Bento, Maple e Oliva (`proposta`) | alta · perfis/mapa | médio | aprovar padrão de recorte e autoria |
| Equipamentos | 14 / 14 | novos itens funcionais/eventuais | estados danificado/reparando (`proposta`) | média · equipamentos | médio | decidir reutilização ou variante |
| Recompensas e itens | 7 / 7 | itens de evento, materiais, Sementes | estados de duplicata/consumo (`proposta`) | alta · eventos/descobertas | alto | taxonomia funcional antes do brief |
| Navegação | 5 / 5 | nenhum asset novo aprovado | tutorial de menus reutiliza ícones atuais | baixa · tutorial complementar | baixo | nenhuma decisão visual |
| Mapa e controles | 6 / 6 | 50 Lugares Memoráveis como stickers ilustrados e fichas futuras | estados de colisão/desbloqueio (`proposta`) | alta · catálogo mundial | alto | briefs, fidelidade cultural e leitura em tamanho mínimo |
| Ninho | 3 / 3 | backgrounds, móveis, objetos, molduras e lembranças para o Ninho visitável | estados vazios e variantes responsivas do editor (`proposta`) | alta · Ninho visitável | alto | catálogo, orçamento da cena e matriz de privacidade |
| Cartas, cartões, selos, carimbos e adesivos | 6 / 6 | cartões urbanos/eventuais, selos regionais e um cartão 3:2 para cada Lugar Memorável | cartões do Cristo e MASP ainda ausentes; acabamentos adicionais (`proposta`) | alta · catálogos regional/mundial | alto | briefs, licenças e catálogo |
| Loja | 9 / 9 | arte comercial final após economia | duas miniaturas de cartão não são frentes 3:2 | média · loja | alto | catálogo/precificação não finais |
| Perfil | 1 / 1 | cosméticos futuros | avatar padrão em maior resolução (`proposta`) | baixa · perfil | baixo | decidir se necessário |
| Prestígio | 4 / 4 | níveis futuros após N50 | validar a correção de caminhos após release | média · M58 | baixo | aplicar migration pelo processo operacional |
| Clima e estações | 0 / 0 | apresentação sazonal/climática prevista | ícones convencionais Phosphor já bastam; overlays (`proposta`) | média · clima | médio | decidir se ilustração agrega valor |
| Eventos e medalhas | 0 / 0 | destinos, cargas, cartões e medalhas exclusivos | pódio/estado encerrado (`proposta`) | alta · eventos | alto | regras do evento e quantidade por edição |
| Pacotes de Sementes | 0 / 0 | pacote encontrável respeitando sorte | raridade/abertura (`proposta`) | média · pacotes de Sementes | médio | probabilidades e tipos de pacote |
| Diário e descobertas | 4 / 4 genéricos | Diário movido ao fim da fila | taxonomia e grande volume (`proposta`) | baixa · Diário | alto | retorno insuficiente; aguardar catálogo |
| Cartões com foto | 0 / 0 | moldura 3:2 e estados de processamento | erro/moderação/privacidade (`proposta`) | média · cartão com foto | médio | política, consentimento e upload seguro |

## Pendências aprovadas versus propostas

Já aprovadas documentalmente: auditoria completa; cartões urbanos 3:2; selos permanentes por
estado/região; catálogo de 50 marcos; assets específicos de eventos; pacotes de Sementes; cartão
com foto; planejamento de backgrounds e objetos oficiais para o Ninho visitável; preservação de
históricos; produção em lotes pequenos após aprovação humana.

Ainda propostas: aumentar retratos públicos; ilustrar estados vazios; criar overlays climáticos;
criar variantes de dano; criar arte adicional para pódio, duplicatas ou processamento. Essas
necessidades não entram em produção sem decisão explícita.

## Ordem recomendada para uma produção futura

1. Auditar o Registry de produção e resolver somente as referências quebradas comprovadas.
2. Fechar o brief e produzir um cartão-piloto para uma das quatro cidades prioritárias.
3. Validar o cartão em compositor, caixa postal e Álbum nos tamanhos reais; selos territoriais e
   marcos mundiais seguem lotes independentes.
4. Produzir os ativos indispensáveis à próxima funcionalidade explicitamente autorizada.
5. Tratar dívida de baixa resolução e loja somente depois dos fluxos de maior impacto.
6. Manter Diário e expansão massiva de descobertas no fim da fila.

Decisões ainda necessárias: responsáveis pela aprovação; capacidade por ciclo; fonte e licença de
cada referência; limites finais por família; primeira cidade entre Manhuaçu, Londrina, Nova
Friburgo e Hong Kong; primeiro lote de marcos; variantes realmente necessárias; e local único de
acompanhamento do estado editorial.
