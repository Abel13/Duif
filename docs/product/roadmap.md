# Roadmap ativo

Este arquivo é a única fonte para sequência, escopo, decisões pendentes e estado do trabalho atual.
As etapas anteriores estão preservadas no [histórico do roadmap](../history/roadmap-milestones-1-55.md).
Procedimentos de deploy pertencem a [Operações](../operations/release.md), não ao roadmap.

## Estado atual

- Concluídas localmente: equipamentos funcionais, identidades de skills e níveis de voo.
- Próxima etapa: revisar e aprovar a documentação de `Planejamento e produção do catálogo visual`.
- Demais etapas abaixo: planejadas, com pendências explícitas em cada seção.

## Equipamentos funcionais, mochilas e prévia de loadout

**Estado:** Concluída localmente. Catálogo, economia, loadout, durabilidade e integração climática
foram implementados; publicação permanece um procedimento operacional separado.

**Objetivo:**

Introduce manually selected functional equipment with understandable tradeoffs and no premium
gameplay advantage.

**Inclui:**

- physical inventory instances for equipment whose durability or reservation state can differ;
- one copy reserved by at most one traveling mascot at a time;
- manually equipped loadouts and a compact `Atual` versus `Com alteração` graph for speed,
  protection, and slots; simulation never consumes uses;
- strongest-only resolution when multiple items mitigate the same condition, with no same-category
  stacking;
- condition-based durability: at most one use per journey and only when the selected item actually
  reduces a penalty;
- zero-use equipment remaining owned but inactive, with manual full repair using Seeds for less
  than replacement cost;
- permanent backpacks with no durability and a dedicated worn position: small `+1 slot/-5%`,
  medium `+2/-10%`, and large `+3/-15%`;
- backpack cosmetics that may later cost Crystals without changing capacity or speed;
- basic functional equipment bought with Seeds, improved functional variants earned through play,
  and visual variants available through progression, events, or the future cosmetic shop;
- equipment activating only when it improves the resolved outcome; for example, a lantern is not
  consumed when Lume's night ability already provides the stronger applicable effect.

**Fora de escopo:**

- automatic loadout selection, Crystal-purchased functional advantage, repair timers, equipment
  trading, stat rerolls, or stacking several mitigators for the same condition.

**Decisões entregues:**

- três mochilas permanentes por `150/350/700` Sementes e cinco utilitários de 10 usos por 200;
- reparo integral de utilitário esgotado por 80 Sementes;
- uma posição de mochila e uma utilitária, com instância exclusiva por mascote;
- proteção expressa como penalidade climática efetivamente evitada, sem escala abstrata;
- acessórios legados convertidos em instâncias cosméticas ocultas e não equipadas.
- perigos térmicos baseados em temperatura real e efeitos multifatoriais declarativos por utilitário.

**Critérios de sucesso:**

- ownership, reservation, activation, durability, and repair are backend-authoritative;
- the preview matches the dispatched modifier snapshot;
- every route remains possible without purchasing or equipping an optional item.

## Identidades de skills e domínio contextual

**Estado:** Concluída localmente. Identidades, progressão, resolução contextual, migração e
explicações de viagem são autoritativas e versionadas.

**Objetivo:**

Give Nuvem, Trovão, Pipoca, and Lume distinct travel identities through one innate trait, two fixed
skills, and one player-chosen individual skill per mascot.

**Inclui:**

- traits that are permanent and do not level;
- fixed and individual skills with levels 1–10 and accumulated thresholds
  `0, 40, 100, 190, 320, 500, 740, 1050, 1450, 1950` XP;
- XP only when the skill's condition actually participates in a completed journey, generally 8–20
  XP according to duration/intensity, with multiple genuinely activated skills allowed to train;
- individual-skill choice at mascot level 5 from three visible options and a modifier graph;
- one free individual-skill change before mascot level 10, then a permanent choice with no Crystal
  respec;
- **Nuvem**, safe long-route carrier: `Rota Segura`, `Rota Longa`, `Memória Postal`; individual
  options `Carga Equilibrada`, `Correio de Volta`, or `Olhar Cartográfico`;
- **Trovão**, fast direct-flight carrier: `Voo Direto`, `Despacho Rápido`, `Instinto de Vento
  Cruzado`; individual options `Asa Solar` or `Carga Aerodinâmica`;
- **Pipoca**, explorer and collector: `Achador Curioso` gives a 15% wider discovery corridor,
  `Coisa Brilhante` improves rarity weight, and `Desvio Feliz` widens the corridor further with a
  small speed tradeoff; individual options `Plumas Impermeáveis` or `Primeiro Passeio`;
- **Lume**, referral-unlocked night specialist: `Olhos da Noite`, `Vigília Noturna`, and `Voo
  Silencioso`; individual options `Memória Lunar`, `Carga Noturna`, or `Guardiã da Madrugada`;
- linear, visible effect growth to each skill's explicit maximum, never a permanent species XP
  multiplier.

**Fora de escopo:**

- manual training, random skill rolls, paid skills, paid respec, hidden bonuses, damage/failure
  mechanics, or species-exclusive collection content.

**Decisões entregues:** XP contextual por duração, janela anti-farming, coeficientes climáticos,
`Desvio Feliz` sem alterar a linha do mapa, migração idempotente e aposentadoria compensatória de
`Arrancada Urbana` e `Caminho d'Água`.

**Critérios de sucesso:**

- each mascot has a recognizable advantage without becoming universally optimal;
- skill XP and effects are auditable, snapshotted, capped, and explained in the trip result;
- every discovery remains obtainable with any mascot even when Pipoca obtains it more efficiently.

## Níveis de voo, rotas familiares e bordas de prestígio

**Estado:** Concluída localmente. Progressão, alcance, capacidade, familiaridade canônica e bordas
de prestígio foram implementados; publicação permanece operacional.

**Objetivo:**

Connect each mascot's flight level to distance, natural capacity, familiar-route efficiency, and
long-term visual prestige without introducing a hard progression cap.

**Inclui:**

- the existing flight XP formula `ceil(100 × level^1.35)` for every next level, continuing above
  level 20;
- functional unlocks ending at level 20 while numeric progression continues indefinitely;
- approved maximum one-way distance and natural slots:
  `L1 25km/3`, `L2 50/3`, `L3 100/3`, `L4 180/3`, `L5 300/4`, `L6 500/4`,
  `L7 800/4`, `L8 1200/4`, `L9 1800/4`, `L10 2500/5`, `L11 3500/5`,
  `L12 4500/5`, `L13 6000/5`, `L14 7500/5`, `L15 9000/6`, `L16 11000/6`,
  `L17 13000/6`, `L18 15500/6`, `L19 18000/6`, `L20 20050/7`;
- level 20 reaching the full practical world range without requiring equipment;
- per-mascot familiarity keyed by persistent origin/destination identities, not fragile decimal
  coordinate equality; both directions share the same pair history;
- familiarity counted only after completion: New `0–2`, Known `3–7`, Familiar `8–19`, Mastered
  `20+`, granting `0%`, `+2%`, `+4%`, and `+6%` speed respectively;
- no familiarity decay;
- visual level borders every ten levels after functional progression, with initial art coverage at
  levels 20, 30, 40, and 50; higher mascots retain the highest available border until new assets
  are published, then resolve them retroactively by minimum level.

**Fora de escopo:**

- functional unlocks above level 20, an actual level cap, paid level acceleration, equipment that
  unlocks otherwise unreachable world routes, or familiarity shared across all mascots.

**Decisões entregues:** nível de voo controla somente benefícios do mascote; Reputação Postal
permanece separada. Rotas usam cidades e missões canônicas, históricos ambíguos não contam, e as
quatro bordas independentes são selecionáveis após o primeiro desbloqueio automático.

**Critérios de sucesso:**

- all route-range, slot, familiarity, XP, and border resolution is backend-authoritative and
  versioned;
- progression beyond available border art never blocks travel or leveling;
- a coordinate refresh cannot silently erase familiarity with a persistent destination.

## Planejamento e produção do catálogo visual

**Estado:** Catálogo em revisão, com primeiros lotes autorizados e integrados. Cristo Redentor,
MASP, Garganta do Diabo e Machu Picchu possuem o par completo de Lugar Memorável; os 27 selos
territoriais brasileiros e os cartões urbanos de Manhuaçu, Londrina, Nova Friburgo e Hong Kong
estão produzidos. Os demais cartões e Lugares Memoráveis permanecem propostas e exigem
autorização própria.

**Objetivo:**

Consolidar a infraestrutura já entregue em `Real Asset Pipeline`, `Art Direction Asset Slice`,
`Official Asset Registry` e `Administrative Asset Studio` num inventário revisável, mapear toda a
dívida existente e aprovar a fila editorial antes de qualquer nova produção visual.

**Inclui:**

- inventário único de todos os assets utilizados, provisórios, ausentes, duplicados, arquivados e
  planejados, ligado às chaves estáveis do Official Asset Registry;
- catálogo regional com cidades priorizadas por Ninhos de produção quando a fonte for autorizada,
  todas as capitais brasileiras, cartões urbanos e selos permanentes propostos;
- catálogo nominal de 50 marcos mundiais específicos, com cobertura geográfica equilibrada,
  coordenadas públicas, composição, alt text e revisão editorial, sem priorização por cidades de
  usuários;
- produção pareada obrigatória de cada Lugar Memorável: sticker transparente do mapa e frente de
  cartão postal 3:2, desbloqueada permanentemente na primeira passagem elegível;
- classificação de cada lacuna por superfície, etapa dependente, impacto para o jogador,
  frequência de exibição, tamanho necessário, locale, estado e prioridade;
- auditoria visual das telas atuais para identificar placeholders, fallbacks inadequados, estilos
  inconsistentes, imagens ausentes, baixa resolução, recortes ruins e referências obsoletas;
- matriz de cobertura por família: mascotes, retratos, mapas, correspondências, selos, carimbos,
  cartões, adesivos, equipamentos, recompensas, loja, eventos, medalhas, prestígio, clima e UI;
- orçamento explícito de produção e peso por etapa antes que novas funcionalidades dependentes
  de arte sejam aprovadas para implementação;
- definição documental de lotes de produção pequenos e priorizados; a criação, otimização,
  publicação e integração desses lotes pertencem a uma execução posterior explicitamente
  autorizada;
- brief padronizado por asset com objetivo, contexto de uso, direção visual, composição, paleta,
  dimensões, área segura, transparência, variantes, texto alternativo e referências permitidas;
- definição do formato por função: WebP/AVIF para ilustrações rasterizadas e texturas, Phosphor para
  affordances convencionais e SVG somente quando a linguagem vetorial fizer parte do sistema já
  aprovado, sem introduzir ornamentos vetoriais que destoem da arte ilustrada;
- processo rastreável de criação, revisão visual em contexto real, ajustes, otimização, validação de
  acessibilidade, aprovação e publicação usando o Administrative Asset Studio existente;
- versionamento sem sobrescrever arquivos históricos, com ativação, rollback e fallback oficial
  por chave estável;
- páginas de verificação que mostrem cada asset nos tamanhos e superfícies reais em mobile e
  desktop, incluindo fundos claros, escuros, mapa e recortes circulares quando aplicável;
- critérios objetivos para resolução, proporção, tamanho de arquivo, transparência, área segura,
  legibilidade, contraste, autoria, licença e consistência com a linguagem postal ilustrada;
- relatório de cobertura e fila de produção atualizado por lote, sem transformar o roadmap em um
  gerenciador duplicado de arquivos;
- remoção segura de referências e arquivos experimentais não publicados que não serão usados,
  preservando versões históricas efetivamente referenciadas;
- documentação do fluxo operacional para que novos eventos, cartões ou recompensas possam planejar
  sua demanda visual antes da implementação funcional.

**Fora de escopo:**

- redesenhar a identidade visual do DUIF, substituir automaticamente todos os assets existentes,
  criar arte sem brief aprovado, introduzir uma nova biblioteca de ícones, publicar rascunhos em
  produção ou implementar as funcionalidades que apenas dependem dos assets planejados;
- usar SVG como solução padrão para ilustrações detalhadas, adicionar assets grandes sem orçamento
  ou manter arquivos sem chave, origem, licença e superfície de uso conhecidas;
- reimplementar o Registry, o manifest, o Asset Studio ou o pipeline técnico já concluído;
- durante a fase documental atual: gerar, editar, remover ou publicar imagens; alterar Registry,
  manifest, banco, frontend, mapa, desbloqueios ou fazer deploy.

**Decisões pendentes antes da implementação:**

- quem aprova direção visual, conteúdo, acessibilidade e publicação final de cada lote?
- qual é a capacidade real de produção por semana ou ciclo e quais ferramentas/fontes de arte serão
  autorizadas?
- quais assets atuais são placeholders aceitáveis e quais devem ser tratados como defeitos de
  produção imediatos?
- qual será a prioridade entre dívida visual atual, cartões postais, medalhas de evento, bordas de
  prestígio, clima sazonal e conteúdo futuro?
- quais limites máximos de arquivo e dimensões serão adotados por família além dos orçamentos gerais
  já documentados?
- quais superfícies exigem variantes próprias e quais podem reutilizar o mesmo asset com recorte ou
  responsividade?
- o acompanhamento da fila viverá no Asset Studio, em documento operacional ou em ferramenta
  externa; qual será a fonte única do estado de produção?
- quais verificações visuais poderão ser automatizadas e quais exigirão aprovação humana em
  dispositivos reais?
- como registrar autoria, licença e uso de geração assistida para cada versão publicada?

**Critérios de sucesso:**

- a fase documental termina somente quando os três catálogos em `docs/design` forem revisados e
  suas decisões pendentes tiverem responsáveis claros;
- todo asset ativo ou planejado possui chave, estado, origem conhecida ou lacuna explícita,
  superfícies, requisitos técnicos e prioridade rastreáveis;
- nenhuma etapa dependente de arte inicia sem catálogo mínimo, briefs aprovados e capacidade de
  produção identificada;
- os primeiros lotes eliminam referências quebradas e placeholders prioritários antes de ampliar o
  volume de conteúdo;
- numa execução futura, assets aprovados serão verificados nas superfícies reais, versionados e
  publicados pelo fluxo existente sem sobrescrever referências históricas;
- o orçamento de download e a legibilidade mobile não pioram com a substituição de placeholders;
- arquivos descartados e referências mortas não permanecem no repositório ou no manifest ativo.

## Encontros locais, segurança de amizade e moderação

**Estado:** Planned; discovery and privacy rules approved, moderation operations unresolved.

**Objetivo:**

Replace world-wide postal-traffic tracking with bounded local encounters that can lead to safe,
intentional friendship requests.

**Inclui:**

- other players' mascots visible only in relation to the viewing player's current mascot or nest;
- local eligibility resolved by the backend around that anchor, never by an arbitrary world-map
  viewport, camera pan, searched city, or guessed coordinate;
- removal of the ability to browse or follow other players' mascots flying anywhere in the world;
- encounter visibility enabled by default, with an explained profile privacy toggle to opt out;
- a sanitized public profile opened from a locally encountered mascot: nickname, mascot and level,
  approximate city/country, Postal Reputation, and player-selected official showcase only;
- friendship requests without a daily product limit, while retaining idempotency, one pending
  request per pair, and technical burst protection;
- a seven-day retry cooldown after refusal;
- separate report and block actions: blocking immediately hides both players and prevents requests,
  while reporting alone does not hide or punish automatically;
- individual human/admin review of every report, using controlled categories, optional explanation,
  a snapshot of the public profile, encounter context, and prior decisions without revealing the
  reporter;
- no free-text public biography initially;
- five friendship levels based mainly on reciprocal correspondence cycles, without decay, purchase,
  or gameplay rewards: New Correspondents, Frequent Correspondents, Postal Friends, Route
  Companions, and Lasting Bond;
- unfriending preserves private history locally but a later re-add starts friendship level 1;
  blocking hides history and level from the blocked player;
- surprise protection: an accepted friend's approaching mascot and sender identity remain hidden
  from the recipient until correspondence is opened.

**Fora de escopo:**

- global traffic browsing, exact distance, exact coordinates, live trails, chat, public bios,
  automatic friendship, friend rewards, report-count auto-punishment, or automatic suspension.

**Decisões pendentes antes da implementação:**

- the encounter radius/frequency, result limit, refresh cadence, and behavior when the player's own
  mascot is traveling far from its nest;
- whether the anchor is the selected mascot, every owned mascot, the nest, or a priority order when
  several are simultaneously eligible;
- report categories, evidence retention, moderator roles, service targets, appeals, policy text,
  notification copy, and legal/operational requirements;
- exact reciprocal-cycle thresholds for each friendship level and treatment of legacy friends.

**Critérios de sucesso:**

- moving or searching the camera cannot enumerate mascots outside the authorized local anchor;
- clients never receive global active-delivery datasets, exact nests, or reusable private route
  endpoints;
- report and block remain independent, auditable operations with no punishment based only on report
  volume.

## Ninho visitável, público e para amigos

**Estado:** Planejada; a fantasia, a tela cheia e a separação de visibilidade foram aprovadas. O
modelo editorial, os limites de composição e a matriz final de privacidade ainda precisam de
revisão antes da implementação.

**Objetivo:**

Transformar o Ninho em um espaço pessoal ilustrado e visitável, customizável pelo dono em tela
cheia, que expresse a história dos mascotes sem revelar localização, correspondência ou inventário
privado. Visitantes desconhecidos e amigos aceitos recebem visões diferentes da mesma cena,
sempre determinadas pelo backend.

**Inclui:**

- uma experiência full screen própria para visualizar e editar o Ninho, preservando acesso claro
  para voltar às superfícies principais da aplicação;
- customização do cenário completo por meio de assets oficiais possuídos ou liberados:
  - background;
  - piso ou base visual quando o tema exigir;
  - móveis e objetos decorativos;
  - retratos oficiais dos mascotes;
  - lembranças de viagens, cartões, selos, medalhas, troféus e descobertas elegíveis;
  - pontos de destaque para itens especiais de eventos;
- nenhuma imagem enviada pelo usuário nesta etapa; “foto do mascote” significa retrato oficial do
  mascote ou composição produzida pelo próprio jogo;
- um documento de cena backend-authoritative com versão, tema, background, itens, ordem de
  camadas, posição, escala, rotação permitida, variante responsiva e regras de visibilidade;
- validação autoritativa de posse, elegibilidade, quantidade, limites de escala, área segura e
  orçamento máximo de objetos antes de salvar ou publicar uma composição;
- edição exclusiva do dono, com arrastar, selecionar, mover entre camadas, remover da cena,
  restaurar e pré-visualizar as três perspectivas sem consumir nem excluir o item possuído;
- salvamento explícito com rascunho privado e versão publicada estável, impedindo que visitantes
  vejam uma composição parcialmente editada;
- três níveis de visibilidade para a cena e seus itens elegíveis:
  - `owner`: visível somente ao dono durante edição ou uso privado;
  - `friends`: visível ao dono e a amizades aceitas;
  - `public`: visível também por contratos públicos sanitizados já autorizados;
- um padrão seguro em que novos itens entram como `owner` até o jogador escolher outra
  visibilidade; alterar amizade, bloquear alguém ou tornar o Ninho privado tem efeito imediato na
  leitura, sem reescrever a composição;
- a resposta pública contém somente o documento visual sanitizado necessário para renderizar a
  cena; não inclui inventário completo, IDs internos sensíveis, coordenadas, caixa postal,
  correspondências, rotas, horários, saldos ou itens ocultos;
- acesso de amigos condicionado à amizade ainda aceita; desfazer amizade rebaixa imediatamente a
  pessoa à visão pública disponível, e bloqueio remove todo acesso entre as partes;
- integração futura com o perfil público sanitizado e a lista de amigos, sem criar uma forma de
  enumerar Ninhos desconhecidos pelo mapa ou por busca arbitrária;
- o mesmo conjunto publicado de itens nas duas experiências responsivas, com duas composições
  persistidas:
  - `mobile`, vertical e pensada para toque;
  - `desktop`, horizontal e com maior área de respiro;
- visibilidade, posse, identidade e conteúdo do item são compartilhados entre as variantes; apenas
  posição, escala, rotação e camada podem variar;
- quando apenas uma variante tiver sido organizada, gerar uma composição inicial determinística
  para a outra, mantê-la como rascunho e pedir revisão do dono antes de publicá-la;
- safe areas e âncoras normalizadas em vez de coordenadas fixas de pixels, preservando composição
  entre larguras, densidades e barras do navegador;
- itens ocultos de uma audiência não deixam informação clicável, alt text, hotspot ou payload
  residual; a composição restante mantém layout próprio, sem revelar o contorno do item oculto;
- acessibilidade com ordem de leitura editorial separada da ordem visual, nome/descrição dos itens,
  navegação por teclado, seleção visível, zoom de interface e alternativa estática para qualquer
  transição;
- carregamento progressivo e orçamento por cena, com miniaturas na edição e assets finais apenas
  quando necessários; falhas individuais usam fallback sem invalidar o Ninho inteiro;
- versionamento de assets por chave oficial, preservando versões históricas quando uma composição
  publicada depender delas;
- prévia do dono para `Público`, `Amigos` e `Somente eu`, usando o mesmo contrato sanitizado que
  será entregue a cada audiência;
- registro auditável de publicação e mudanças de visibilidade, sem expor ao visitante o histórico
  de edições.

**Superfícies previstas:**

- dono: entrada principal pelo Ninho, alternando entre modo de visita e modo de edição;
- amigo aceito: ação `Visitar Ninho` no perfil/lista de amigos, sujeita à privacidade;
- não amigo autorizado: ação no perfil público sanitizado, somente quando a descoberta desse
  perfil já for permitida pelas regras de encontros;
- compartilhamento externo por URL pública não faz parte da primeira versão.

**Dependências:**

- `Planejamento e produção do catálogo visual`, para inventário, briefs, backgrounds, objetos,
  lembranças e orçamentos reais;
- `Encontros locais, segurança de amizade e moderação`, para audiência pública, amizade, bloqueio,
  relatório e perfil sanitizado;
- Registry e manifest oficiais para todas as identidades visuais publicáveis;
- catálogo autoritativo de itens possuídos, recompensas, cartões, medalhas e prestígio.

**Fora de escopo:**

- localização exata do Ninho, planta baseada na casa real, endereço, clima deduzido da residência,
  rota privada ou presença em tempo real do jogador;
- uploads de fotos, desenhos, textos livres, placas editáveis ou qualquer conteúdo público criado
  pelo usuário;
- chat, recados, livro de visitas, reações, curtidas, contagem pública de visitas, ranking de
  decoração ou feed de Ninhos;
- visita simultânea, avatares controláveis, multiplayer em tempo real, física, iluminação 3D,
  canvas pesado ou editor sem limites;
- compra de espaço funcional, bônus de gameplay pela decoração, acesso ao inventário alheio ou
  transferência de itens durante uma visita;
- composições com conjuntos diferentes de itens por dispositivo; mobile e desktop reorganizam a
  mesma seleção publicada.

**Decisões pendentes antes da implementação:**

- o Ninho inteiro terá uma visibilidade-base com exceções por item, ou cada item exigirá sempre uma
  escolha explícita? Como comunicar isso sem tornar a edição burocrática?
- quais categorias podem ser públicas, quais podem ser apenas de amigos e quais devem permanecer
  sempre privadas, especialmente medalhas de evento, cartões recebidos e lembranças associadas a
  outra pessoa?
- cartões e lembranças mostrarão somente a frente oficial ou também metadados como cidade, data e
  mascote? Conteúdo de correspondência deve continuar sempre excluído;
- quantos objetos simultâneos cada variante suporta no primeiro lançamento e quais limites mudam
  por classe de dispositivo?
- quais transformações cada família permite: escala livre dentro de limites, rotação discreta,
  espelhamento ou encaixe em pontos predeterminados?
- o background é uma peça única ou pode combinar parede, piso e janela? Quantas camadas estruturais
  justificam o custo de assets e a complexidade do editor?
- haverá um mascote principal presente na cena, vários mascotes no Ninho ou apenas retratos? Como
  representar mascotes viajando sem revelar sua viagem a visitantes?
- visitantes verão sempre a versão publicada mais recente ou o dono poderá manter versões
  sazonais salvas e alternar entre elas?
- amigos poderão denunciar o Ninho diretamente mesmo sem texto ou upload? Quais categorias e
  evidências o fluxo de moderação deverá armazenar?
- qual será a política para itens que perdem elegibilidade, são arquivados no Registry ou passam a
  ter restrição editorial depois de publicados?
- o fallback automático entre mobile e desktop pode ser publicado pelo dono sem editar, ou a
  revisão das duas variantes será obrigatória?
- haverá prévia de tamanho intermediário para tablets ou apenas interpolação segura entre as duas
  composições aprovadas?

**Critérios de sucesso:**

- dono, amigo aceito e visitante público recebem apenas os itens autorizados para sua audiência;
- bloquear, desfazer amizade ou restringir o Ninho revoga acesso imediatamente e não depende de
  cache inseguro no cliente;
- nenhuma resposta de visita permite inferir coordenada, correspondência, inventário oculto ou
  atividade em tempo real;
- uma mesma seleção de itens produz composições legíveis e intencionais em mobile e desktop sem
  rolagem horizontal, sobreposição acidental ou elementos inalcançáveis;
- edição incompleta nunca substitui a versão publicada, e salvamentos repetidos são idempotentes;
- somente assets possuídos, elegíveis, versionados e dentro dos limites podem ser publicados;
- a cena continua utilizável com asset ausente, conexão lenta, movimento reduzido e navegação por
  teclado;
- o editor mantém desempenho aceitável no orçamento mobile aprovado e não carrega assets ocultos
  para a audiência atual.

## Push notifications e privacidade de entregas

**Estado:** Planned; notification moments are approved, platform/provider operations unresolved.

**Objetivo:**

Notify players about meaningful asynchronous postal moments without revealing a surprise sender,
private content, precise location, or route information on a device lock screen.

**Inclui:**

- explicit notification permission education and opt-in after the player has experienced the core
  loop, never as a blocking onboarding permission wall;
- Web Push subscription registration per installation, revocation, expiry cleanup, and
  backend-authoritative ownership;
- localized notifications for correspondence arrival, remaining return-preparation time, confirmed
  return departure, mascot return ready for collection, invitation qualification/reward, and
  selected future event reminders;
- arrival copy that says only that correspondence arrived and how long the mascot may prepare its
  return; sender and contents remain hidden until the player opens the correspondence in DUIF;
- deep links that restore the authenticated PWA and route to the authorized in-app surface without
  embedding secrets or private content in the URL;
- per-category preferences, quiet hours, duplicate suppression, retry/idempotency keys, invalid
  subscription cleanup, and an auditable delivery log with limited retention;
- an in-app fallback whenever push is unavailable, denied, expired, or fails.

**Fora de escopo:**

- mandatory notification permission, SMS, WhatsApp, email marketing, notification ads, exact route
  coordinates, sender names on surprise arrivals, correspondence text in payloads, or third-party
  behavioral targeting.

**Decisões pendentes antes da implementação:**

- push provider versus direct VAPID Web Push, key custody/rotation, Edge Function or worker shape,
  scheduler, quotas, and production domains;
- exact trigger timing, quiet-hour defaults/time-zone changes, retry policy, log retention, and
  notification preference taxonomy;
- iOS installed-PWA support matrix, browser-specific UX, multi-device behavior, and whether opening
  one device dismisses notifications on others;
- consent copy, privacy-policy updates, observability, abuse limits, and production runbooks.

**Critérios de sucesso:**

- no push payload or lock-screen copy reveals the surprise sender, content, exact nest, or route;
- retries cannot create duplicate user-visible notifications for the same event;
- unsubscribed, denied, or invalid installations do not block gameplay or in-app notifications;
- deep links re-check the authenticated user's authorization before showing any correspondence.

## Atmosfera sazonal e efeitos climáticos

**Estado:** Planned; visual direction and performance boundaries approved, final asset catalog unresolved.

**Objetivo:**

Give each journey a stronger sense of season, time, and weather through lightweight illustrated
effects that preserve map readability, accessibility, and mobile performance.

**Inclui:**

- four stable seasonal treatments derived from the current authoritative segment: spring flowers
  and soft greens, warm golden summer light, autumn leaves and earth tones, and cool winter frost;
- current-condition overlays for rain, snow, fog, storms, clear nights, dawn, and dusk, without
  revealing future forecasts or private route details;
- a dark night map with restrained stars and a readable glow around the selected mascot;
- small condition effects around the selected mascot, including wind, droplets, snow, and a visual
  indication when equipped protection is mitigating a penalty;
- transform/opacity-only CSS or SVG animation, with no heavy canvas particle engine;
- a strict animated-element budget, reduced intensity on mobile, lazy loading of only the active
  effect assets, and automatic cleanup when the segment changes;
- complete reduced-motion behavior that replaces movement with a static seasonal or weather frame;
- shared visual tokens so the map, travel-status modal, and current-condition modal present the
  same season, time, weather, and mitigation state.

**Fora de escopo:**

- gameplay modifier changes, new weather providers, climate-specific full mascot animation sets,
  forecast previews, map recoloring per crossed region, cargo damage, route failure, 3D weather,
  audio ambience, or a general-purpose seasonal event system.

**Decisões pendentes antes da implementação:**

- final SVG/texture asset set and whether each effect is packaged or generated from CSS primitives;
- exact dawn and dusk visual windows, effect density per viewport, and the animated-element budget;
- contrast thresholds for every map palette and the fallback behavior for low-power devices;
- whether equipment mitigation receives one shared protective effect or category-specific visuals.

**Critérios de sucesso:**

- season, day/night, and weather always match the selected segment snapshot from `Segmented
  Travel, Weather, And Automatic Adversities`;
- routes, markers, labels, zoom controls, and active-map tools remain readable in every condition;
- mobile rendering remains responsive and loads no inactive seasonal or weather asset;
- reduced-motion mode contains no looping particles or flashes;
- changing or reconnecting during a segment produces the same deterministic visual state without
  changing authoritative travel timing or rewards.

## Eventos postais encadeados e destinos mundiais

**Estado:** Planejada; fantasia central aprovada, regras de participação, classificação e operação
administrativa pendentes.

**Objetivo:**

Criar eventos temporários administráveis em que mascotes transportam itens específicos por uma
sequência de destinos oficiais no mundo, recebem em cada entrega uma resposta com a próxima etapa
e conquistam cartões postais e medalhas exclusivas do evento.

**Inclui:**

- eventos com identidade, descrição, arte, período de inscrição/atividade, regras, estado de
  publicação e conteúdo localizado em `pt-BR` e `en-US`;
- jornadas compostas por etapas versionadas, cada uma associando um destino oficial, o item que
  deve ser entregue, a resposta recebida após a conclusão e a referência da próxima etapa;
- resposta postal autoritativa por etapa, revelada somente após a entrega válida e usada para
  explicar ao jogador para onde o mascote deve seguir;
- suporte a sequências lineares e uma estrutura de dados capaz de receber ramificações futuras,
  sem permitir que o cliente escolha ou antecipe etapas não liberadas;
- pontos de evento persistentes e específicos no mundo, vinculados a cidades GeoNames ou a
  destinos oficiais catalogados, sem depender de nomes ou coordenadas decimais frágeis;
- validação backend-authoritative do evento ativo, etapa liberada, mascote, alcance, capacidade,
  item exigido, destino, prazo e conclusão antes de reservar ou consumir recursos;
- reserva do item no despacho e consumo idempotente somente pela entrega válida, com recuperação
  segura quando uma operação falhar antes da criação da viagem;
- cartões postais oficiais próprios de cada ponto ou etapa, concedidos de forma idempotente após a
  primeira conclusão elegível e integrados ao modelo permanente de cartões de `Diário de viagem,
  descobertas e consumíveis`;
- progresso por jogador e por evento, incluindo etapas disponíveis, em viagem, concluídas,
  respostas abertas, cartões conquistados e encerramento da campanha;
- classificação autoritativa e auditável por evento, com snapshots de resultado, tratamento de
  empates e proteção contra duplicidade, alteração retroativa e manipulação do relógio do cliente;
- medalhas exclusivas e visuais para as primeiras colocações, com catálogo e quantidade definidos
  separadamente por evento, sem bônus funcional;
- resultado da entrega mostrando item entregue, ponto alcançado, resposta recebida, próxima etapa,
  cartão postal desbloqueado e eventual mudança de posição;
- página de evento com período, regras, progresso, próximos objetivos liberados, recompensas e
  classificação pública sanitizada, sem coordenadas privadas ou rotas pessoais;
- histórico de eventos encerrados preservando regras publicadas, conquistas, cartões e medalhas,
  mesmo após novos eventos reutilizarem destinos ou tipos de item;
- criação e gestão pelo painel administrativo: rascunho, conteúdo, etapas, destinos, itens,
  respostas, cartões, medalhas, calendário, critérios de classificação, prévia, validação,
  publicação, encerramento e arquivamento;
- fluxo administrativo com permissões explícitas, auditoria de alterações, revisão antes da
  publicação e bloqueio de edições destrutivas em eventos já iniciados;
- snapshots versionados de regras e conteúdo no início de cada participação/entrega, para que uma
  edição administrativa permitida não reescreva viagens ou resultados históricos;
- contratos para futuras notificações de início, etapa liberada e encerramento, respeitando as
  preferências e regras de privacidade de `Push notifications e privacidade de entregas`.

**Fora de escopo:**

- criação de eventos por jogadores, destinos baseados em coordenadas livres, localização contínua
  do dispositivo, entrega presencial por proximidade física, PvP direto, sabotagem, negociação de
  itens de evento, prêmio funcional para vencedores, edição de resultados sem auditoria ou acesso
  público a rotas privadas;
- conteúdo gerado automaticamente ou respostas livres que não tenham sido revisadas e publicadas
  pelo painel administrativo;
- transformar cartões postais ou medalhas de evento em itens consumíveis, poder de voo, velocidade,
  capacidade, XP adicional ou vantagem em eventos futuros.

**Dúvidas pendentes antes da implementação:**

- participação será automática, por inscrição voluntária ou exigirá selecionar um mascote para o
  evento; um jogador poderá participar com um ou vários mascotes no mesmo evento?
- eventos serão globais, regionais ou poderão usar ambos os formatos; haverá restrição por país,
  idade da conta, nível do mascote ou Reputação Postal?
- a primeira etapa será anunciada diretamente na página do evento ou também chegará como uma
  correspondência inicial enviada por um personagem oficial?
- todas as campanhas de lançamento serão lineares ou o painel já deverá permitir escolhas e
  ramificações; se houver escolha, será possível revisitar caminhos não escolhidos?
- a resposta de uma etapa será sempre carta, poderá variar entre carta/cartão, e precisará ser
  aberta antes que o próximo destino seja liberado?
- quem escreve as respostas: personagens fixos, organizações postais ou perfis próprios de cada
  ponto; quais nome, retrato, assinatura e tom editorial devem aparecer?
- de onde vêm os itens exigidos: kit gratuito do evento, loja por Sementes, descobertas, missões ou
  inventário comum; eles ocupam slots e podem sobrar após o encerramento?
- uma entrega incorreta deve ser bloqueada antes do despacho ou pode chegar ao ponto sem concluir a
  etapa; haverá tentativas, falha, devolução ou reembolso do item?
- cada ponto concede um cartão na primeira visita, em toda conclusão ou somente ao completar uma
  sequência; cartões perdidos poderão ser obtidos após o evento?
- qual será a métrica de classificação por evento: primeiro a terminar, menor tempo de voo,
  quantidade de etapas, pontos ponderados, consistência ou uma combinação configurável?
- o tempo competitivo contará desde a abertura global, desde a inscrição, somente durante voos ou
  incluirá preparo e intervalo entre etapas; como manutenções e indisponibilidade serão tratadas?
- quantas colocações recebem medalhas e como empates serão resolvidos; haverá classificação global,
  regional, por faixa de nível ou divisões separadas?
- jogadores que ingressarem tarde terão o mesmo percurso, uma janela própria ou mecanismos de
  recuperação; quais medidas anti-farming e anti-abuso serão necessárias?
- as habilidades, familiaridade, equipamentos e consumíveis normais participarão integralmente,
  serão normalizados para competição ou variarão conforme a regra de cada evento?
- eventos podem reutilizar pontos, itens, respostas, cartões e medalhas de outros eventos, ou cada
  recompensa visual deve ser exclusiva por definição?
- quais campos poderão ser editados depois da publicação e depois do início; como cancelar,
  prolongar ou corrigir um evento sem invalidar participantes e classificação?
- quais papéis administrativos poderão criar, revisar, publicar, encerrar e corrigir eventos; será
  exigida aprovação por uma segunda pessoa para publicação e alteração competitiva?
- quais prévias, fixtures de teste, simulação completa da campanha e validações de acessibilidade/
  localização serão obrigatórias no painel antes da publicação?
- por quanto tempo serão mantidos logs de ranking e auditoria, como contestar resultados e qual será
  o procedimento para desclassificação ou restauração de um participante?

**Critérios de sucesso:**

- nenhuma etapa, resposta, cartão, medalha ou posição pode ser concedida duas vezes por repetição de
  RPC, reconexão, coleta repetida ou relógio adulterado do cliente;
- o despacho só consome/reserva o item depois que o backend confirma evento, etapa, destino,
  mascote, capacidade e prazo, sem efeitos colaterais quando a validação falhar;
- cada resposta recebida corresponde exatamente à versão da etapa concluída e libera somente o
  próximo destino permitido pelas regras snapshotadas;
- eventos publicados podem ser executados do início ao fim a partir do painel administrativo sem
  migration específica ou deploy de cliente para cada novo conteúdo;
- encerramento e correções preservam um histórico auditável, resultados reproduzíveis e recompensas
  já legítimas;
- páginas públicas de evento e classificação não revelam coordenadas precisas, trajetos privados,
  conteúdo postal fechado ou outros dados não autorizados dos jogadores.

## Tutorial dos menus inferiores

**Estado:** Planejada; superfícies e princípios aprovados, sequência e momento de ativação pendentes.

**Objetivo:**

Complementar o tutorial inicial apresentando os cinco menus inferiores da navegação principal e
explicando, dentro do contexto do jogo, quando usar `Ninho`, `Coleção`, `Mapa`, `Amigos` e `Loja`.

**Inclui:**

- continuação do onboarding após o jogador concluir a primeira viagem e chegar ao Ninho, sem
  repetir as etapas já aprendidas de criação do perfil, escolha do mascote ou envio tutorial;
- apresentação sequencial dos cinco itens reais da barra inferior, usando destaque ancorado no
  próprio componente em vez de uma cópia visual desconectada da navegação;
- explicação curta e localizada para cada destino:
  - `Ninho`: cuidar dos mascotes, acompanhar progressão, equipamentos e habilidades;
  - `Coleção`: consultar descobertas, cartões postais, adesivos e recompensas permanentes;
  - `Mapa`: acompanhar viagens, condições, encontros e entregas prontas para coleta;
  - `Amigos`: administrar amizades e escolher destinatários para correspondências;
  - `Loja`: adquirir itens disponíveis com as moedas do jogo, sem insinuar compra obrigatória;
- cada etapa combina nome, ícone existente, uma frase de função e uma ação como `Continuar`,
  `Explorar agora` ou `Pular tutorial`;
- navegação opcional até a página explicada, com retorno seguro à sequência e sem perda do estado
  quando o jogador recarregar, fechar a PWA ou usar o botão Voltar;
- progresso persistente por perfil com versão do tutorial, etapa atual, conclusão, descarte e data,
  permitindo acrescentar ou revisar menus no futuro sem reabrir indevidamente uma versão concluída;
- abertura manual posterior pela Ajuda ou pelo perfil para rever o tutorial completo, sem alterar o
  estado de conclusão nem conceder recompensas novamente;
- destaque responsivo que acompanha a posição real da barra inferior, respeita áreas seguras do
  dispositivo, nunca fica sob outro modal e não provoca rolagem horizontal;
- foco inicial controlado, ordem de teclado previsível, fechamento por Escape quando permitido,
  texto acessível associado ao item destacado e navegação utilizável por leitor de tela;
- transições curtas somente com opacity/transform e apresentação completamente estática quando
  `prefers-reduced-motion` estiver ativo;
- telemetria estritamente funcional e agregada para saber em qual etapa o tutorial é abandonado,
  sem registrar conteúdo postal, coordenadas ou comportamento detalhado do jogador;
- traduções completas em `pt-BR` e `en-US`, usando os mesmos nomes e ícones dos menus reais;
- testes que protejam o vínculo entre a ordem do tutorial e a configuração autoritativa da barra,
  evitando explicações obsoletas quando um item mudar de posição ou disponibilidade.

**Fora de escopo:**

- redesenhar a barra inferior, adicionar novos menus, bloquear recursos até o tutorial terminar,
  simular dados inexistentes, exigir visita a todas as páginas, repetir o tutorial a cada sessão ou
  usar mascotes/ponteiros animados que prejudiquem acessibilidade e desempenho;
- ensinar em profundidade todas as funções internas de cada página; recursos complexos continuam
  com ajuda contextual própria no primeiro uso;
- apresentar a Loja como etapa de monetização obrigatória, criar oferta promocional ou conceder
  vantagem paga durante o tutorial.

**Dúvidas pendentes antes da implementação:**

- o tutorial deve começar imediatamente ao terminar a primeira viagem, na primeira entrada no
  Ninho depois disso ou por meio de um convite/banner que o jogador confirma?
- a ordem deve seguir fisicamente a barra (`Ninho`, `Coleção`, `Mapa`, `Amigos`, `Loja`) ou seguir o
  fluxo recomendado de jogo, começando por Mapa ou Amigos?
- `Explorar agora` deve abrir cada página e exigir uma ação simples antes de continuar, ou a
  explicação deve permanecer toda sobre o Ninho?
- o jogador poderá pular a sequência inteira desde a primeira etapa ou somente avançar/fechar e
  retomá-la depois?
- haverá uma pequena recompensa exclusivamente educativa pela conclusão; se houver, qual item,
  moeda ou cosmético não criará pressão para executar o tutorial?
- a Loja deve aparecer no tutorial inicial ou somente depois de o jogador obter Sementes e entender
  a economia básica?
- como a etapa de Coleção deve se comportar antes de `Diário de viagem, descobertas e consumíveis`
  ou quando o jogador não possuir nenhum item além das recompensas iniciais?
- a Ajuda que permite rever o tutorial ficará no perfil, em configurações ou em um futuro centro de
  ajuda compartilhado?
- quais eventos mínimos de telemetria são realmente necessários e qual será o período de retenção?

**Critérios de sucesso:**

- ao terminar ou pular o tutorial, o jogador consegue identificar a finalidade principal dos cinco
  menus sem que nenhuma página ou função fique bloqueada;
- o destaque sempre aponta para o item real e visível da navegação, inclusive em telas pequenas,
  orientação alterada e dispositivos com safe area;
- recarregar, fechar ou navegar durante a sequência retoma a etapa correta de forma idempotente;
- concluir uma versão não faz o tutorial reaparecer automaticamente, enquanto a revisão manual
  permanece disponível;
- leitores de tela e navegação por teclado recebem a mesma informação e controle que a apresentação
  visual;
- nenhuma etapa usa texto hardcoded, revela dados privados ou depende de animação para ser
  compreendida.

## Pacotes de Sementes encontrados em rota

**Estado:** Planejada; conceito e autoridade aprovados, probabilidades, quantidades e limites
pendentes.

**Objetivo:**

Permitir que mascotes encontrem pacotes de Sementes durante viagens, com chances influenciadas pela
sorte do mascote, resultado determinístico e proteção contra repetição ou farming.

**Inclui:**

- catálogo versionado de pacotes de Sementes com chave estável, nome, descrição, arte, quantidade,
  peso-base, requisitos e estado de publicação;
- oportunidades de encontro determinadas pelo backend a partir da viagem e de seus segmentos,
  nunca por relógio, aleatoriedade ou repetição de requisições do cliente;
- sorte do mascote snapshotada no despacho e aplicada por uma fórmula explícita à probabilidade de
  encontro, com limites mínimo e máximo definidos pelo catálogo de regras;
- sorte alterando somente a chance de encontrar um pacote, salvo decisão posterior explícita sobre
  tamanho ou quantidade;
- seed autoritativa por entrega e oportunidade, produzindo sempre o mesmo resultado em reconexões,
  recálculos climáticos, reabertura do mapa e coleta repetida;
- distribuição por faixas de distância ou segmentos elegíveis, com limite por viagem e proteção
  para que dividir artificialmente uma rota não crie mais tentativas;
- requisitos mínimos de duração e/ou distância e janela anti-farming por mascote e par de destinos;
- pacote encontrado persistido como recompensa pendente da entrega, sem adicionar Sementes ao saldo
  antes do mascote retornar e a viagem ser coletada;
- concessão financeira idempotente na coleta, usando o ledger autoritativo de Sementes e uma chave
  única por entrega, oportunidade e pacote;
- pacotes sendo recompensas quantitativas e repetíveis, separados de descobertas, cartões,
  cosméticos e outros itens permanentes que não admitem duplicata;
- indicação visual no corredor lógico da rota quando a descoberta já puder ser revelada, sem
  expor coordenadas privadas nem permitir que interação visual altere o resultado;
- resultado da viagem informando pacote, quantidade de Sementes, chance resolvida, influência da
  sorte e eventual supressão por limite anti-farming;
- prévia explicando que pacotes podem ser encontrados e que sorte melhora a chance, sem revelar o
  resultado já seedado ou prometer uma recompensa;
- métricas agregadas para comparar taxa esperada e observada por pacote, faixa de sorte, distância e
  versão das regras, sem registrar rotas ou coordenadas pessoais;
- configuração futura pelo painel administrativo de catálogo, período, pesos, quantidades e limites,
  com validação e auditoria, sem exigir migration para ajustes de balanceamento publicados.

**Fora de escopo:**

- comprar sorte, pagar para refazer um sorteio, encontrar Crystals pelo mesmo sistema, clicar
  repetidamente no mapa para gerar tentativas, conceder antes da coleta, converter automaticamente
  achados permanentes duplicados em Sementes ou permitir que o cliente informe sua própria sorte;
- alterar uma recompensa já materializada quando probabilidades, clima, equipamento ou catálogo
  forem atualizados;
- negociar pacotes, enviá-los como correspondência ou armazená-los como item consumível separado do
  saldo, salvo decisão futura explícita.

**Dúvidas pendentes antes da implementação:**

- quais pacotes existirão no lançamento e quantas Sementes cada um concederá?
- qual será a chance-base de cada pacote e como os pesos entre tamanhos serão resolvidos quando uma
  oportunidade resultar em encontro?
- qual é a escala autoritativa atual de sorte dos mascotes e qual fórmula a converterá em aumento de
  chance sem tornar mascotes sortudos obrigatórios?
- sorte aumentará apenas a chance total, como recomendado, ou também poderá influenciar o tamanho do
  pacote encontrado?
- oportunidades serão calculadas por distância total, por segmento, por duração ou por uma
  combinação; qual será a unidade mínima e o teto por viagem?
- quais serão a duração/distância mínima, a janela anti-farming e o limite por mascote, rota ou
  jogador?
- viagens de ida e volta compartilharão o mesmo conjunto de oportunidades ou cada trecho poderá
  encontrar pacotes independentemente?
- missões, tutorial e eventos poderão usar a mesma tabela de encontros ou precisarão de regras e
  limites próprios?
- o achado será revelado assim que o segmento for concluído, apenas quando aparecer no mapa ou
  somente no resultado final da viagem?
- se o jogador não abrir o mapa durante a viagem, o pacote será coletado automaticamente no retorno,
  permanecerá pendente ou exigirá alguma ação posterior?
- a prévia mostrará uma faixa numérica de chance, apenas uma classificação como baixa/média/alta ou
  somente a explicação qualitativa da sorte?
- quais campos poderão ser ajustados em um catálogo já ativo sem alterar oportunidades previamente
  materializadas?

**Critérios de sucesso:**

- a mesma entrega e oportunidade sempre produzem o mesmo resultado, independentemente de cliente,
  reconexão, atualização climática ou quantidade de chamadas;
- nenhuma coleta, trigger ou RPC repetida concede as mesmas Sementes duas vezes;
- a probabilidade efetiva pode ser reconstruída a partir da versão de regras, chance-base e sorte
  snapshotada;
- sorte melhora uma chance de maneira limitada e explicável, sem garantir pacote nem ultrapassar o
  teto aprovado;
- rotas artificialmente repetidas ou divididas não criam oportunidades além dos limites definidos;
- o saldo só muda depois da coleta válida e permanece conciliável com o ledger;
- testes determinísticos cobrem ausência e presença de encontro, limites de sorte, distribuição de
  pacotes, anti-farming, concorrência e idempotência.

## Diário de viagem, descobertas e consumíveis

**Estado:** Planejada e adiada até a conclusão de `Planejamento e produção do catálogo visual`;
catálogo de conteúdo e tabelas de obtenção pendentes.

**Objetivo:**

Transformar achados de rota em um diário permanente por mascote e em uma fonte controlada de
consumíveis úteis, sem confundir descobertas com inventário ou cartões postais oficiais.

**Inclui:**

- `Diário de Viagem` dentro do perfil de cada mascote, em vez de uma nova superfície primária no
  menu inferior;
- registros permanentes contendo ilustração oficial, descrição localizada, região aproximada,
  mascote, data e raridade;
- raridades iniciais Comum, Incomum e Rara; `Especial` identifica origem de evento ou missão, não
  uma quarta raridade superior;
- descobertas que nunca ocupam slots de viagem e nunca são consumidas;
- achados permanentes e não consumíveis únicos por jogador; se o resultado já estiver possuído ou
  pendente em outra entrega, nada é concedido, sem novo sorteio ou compensação;
- descoberta que pode desbloquear um cartão postal permanente relacionado sem deixar de existir
  como registro distinto no Diário;
- cartão-base simples permanente, cartões de cidade desbloqueados pela passagem do mascote e
  cartões de evento desbloqueados pela respectiva missão;
- artes pagas de cartão modeladas futuramente como cópias consumíveis finitas, enquanto cartões
  oficiais desbloqueados permanecem permanentes;
- `Lanche Revigorante` encontrado em rotas, concedido por trabalhos e futuramente comprado com
  Sementes: comum `+5%` e incomum/especial `+10%`, um por viagem, selecionado e consumido no despacho
  confirmado, sem ocupar slot e afetando ida e volta dentro do teto global de velocidade;
- lanches encontrados permanecendo como recompensa pendente e entrando no inventário somente na
  coleta final;
- `Impulso da Primeira Viagem` do tutorial permanecendo um modificador automático e separado do
  inventário, apesar da linguagem visual relacionada à aceleração.

**Fora de escopo:**

- arte de Diário enviada por jogadores, descobertas exclusivas apenas para Pipoca, poder de rota
  comprado com Crystals, consumo de cartões de cidade/evento desbloqueados ou uso de itens
  encontrados antes do retorno;
- iniciar produção em massa de ilustrações antes de `Planejamento e produção do catálogo visual`
  aprovar catálogo mínimo, briefs, prioridades e capacidade de produção.

**Decisões pendentes antes da implementação:**

- taxonomia das descobertas, ilustrações/textos de lançamento, cobertura regional e tabelas exatas
  de raridade e obtenção;
- como a passagem por cidade será determinada em segmentos longos e como funcionarão desbloqueios
  retroativos;
- limites de estoque dos lanches, preços em Sementes, quantidades em trabalhos, variantes de evento
  e nome final da versão de `+10%`;
- distinção visual precisa entre um lanche do inventário e o impulso exclusivo do tutorial;
- qual catálogo mínimo aprovado em `Planejamento e produção do catálogo visual` justifica
  implementar o Diário sem voltar a criar uma fila visual desproporcional ao retorno para o
  jogador.

**Critérios de sucesso:**

- registros do Diário, cartões desbloqueados, achados pendentes, concessões ao inventário e consumo
  de lanches são operações separadas e idempotentes;
- a coleta não concede duas vezes um lanche ou outra recompensa;
- a interface nunca sugere que um registro permanente ocupa inventário ou capacidade de viagem;
- nenhuma descoberta entra no catálogo funcional sem asset final aprovado e publicado pelo fluxo
  definido em `Planejamento e produção do catálogo visual`.

## Cartões postais com foto

**Estado:** Planejada; experiência principal aprovada, origem das imagens, moderação e retenção
pendentes.

**Objetivo:**

Permitir que o jogador envie um cartão postal cuja frente use uma foto escolhida por ele no lugar
de uma mensagem textual, preservando acabamento postal, surpresa, privacidade e segurança.

**Inclui:**

- uma variante explícita de cartão postal `photo`, separada dos cartões oficiais ilustrados e sem
  substituir ou alterar seus catálogos e saldos;
- escolha mutuamente exclusiva no fluxo de composição: foto ou mensagem textual, conforme a regra
  aprovada, sem manter texto oculto junto da imagem;
- captura ou seleção de imagem somente após consentimento claro do remetente e explicação de quem
  poderá vê-la, por quanto tempo será mantida e como poderá ser denunciada ou removida;
- upload direto para armazenamento privado por URL assinada e escopo temporário, sem transportar o
  arquivo bruto pelo cliente ou por RPCs de banco;
- validação autoritativa de formato, tamanho, dimensões, integridade, propriedade e estado de
  moderação antes de permitir o despacho;
- normalização no servidor com correção de orientação, remoção de EXIF e outros metadados,
  redimensionamento, compressão e geração de uma versão final no enquadramento aprovado do cartão;
- prévia de recorte 3:2 dentro do cartão real, com controles acessíveis de posição e zoom, sem
  permitir que conteúdo importante fique sob selo, carimbo ou área segura;
- snapshot persistente da versão processada, dimensões, hash, proprietário, consentimento,
  moderação e acabamento postal usado no envio;
- acesso à foto limitado ao remetente, destinatário autorizado e equipe de moderação, usando URLs
  assinadas de curta duração e revalidação de sessão;
- surpresa preservada: a notificação e a listagem fechada não revelam miniatura, remetente ou
  conteúdo antes da abertura autorizada;
- visualização na Caixa Postal como cartão, com fallback seguro quando a imagem estiver em análise,
  indisponível, removida ou não puder ser carregada;
- denúncia vinculada à correspondência recebida, bloqueio do remetente, ocultação imediata para o
  denunciante e fila administrativa auditável para análise e remoção;
- remoção administrativa capaz de revogar acesso à imagem sem apagar a evidência mínima necessária
  à auditoria, sem reescrever outros dados da entrega;
- estados claros de upload, processamento, análise, aprovado, rejeitado, cancelado e removido, sem
  criar uma entrega enquanto a imagem ainda não estiver elegível;
- limpeza idempotente de uploads abandonados e derivados órfãos, com política de retenção separada
  para conteúdo entregue, removido e evidência de moderação;
- traduções completas, texto alternativo fornecido pelo remetente ou fallback acessível neutro e
  controles utilizáveis por teclado e leitor de tela;
- métricas operacionais restritas a volume, falhas, tempo de processamento/moderação, denúncias e
  remoções, sem analisar ou reutilizar o conteúdo das fotos para publicidade ou treinamento.

**Fora de escopo:**

- galeria pública, feed de fotos, descoberta por usuários desconhecidos, comentários, curtidas,
  marcações, reconhecimento facial, localização por metadados, filtros sociais, edição avançada,
  vídeos, GIFs animados, arquivos RAW ou envio de múltiplas imagens no mesmo cartão;
- tornar a foto um asset oficial reutilizável, publicá-la no Asset Studio, vendê-la, negociá-la ou
  permitir que outro jogador a encaminhe;
- despacho antes da aprovação exigida, acesso por URL pública permanente ou confiança exclusiva em
  validação/moderação feita no dispositivo.

**Dúvidas pendentes antes da implementação:**

- a primeira versão aceitará câmera, galeria ou ambas; quais navegadores e PWAs móveis precisam de
  suporte específico?
- quais formatos de entrada serão aceitos e quais limites de bytes, pixels, proporção e duração de
  upload serão adotados?
- a moderação será automática antes do envio, humana, híbrida ou baseada em análise posterior; qual
  provedor, política, custo e tempo máximo são aceitáveis?
- o remetente poderá escrever texto alternativo livre; como esse texto será moderado e qual fallback
  será mostrado quando não houver descrição?
- haverá uma moldura oficial única, escolha entre molduras desbloqueadas ou uso da arte de um cartão
  oficial como base para a foto?
- cartões com foto serão gratuitos, consumirão uma cópia de cartão, Sementes, Crystals ou terão um
  limite por período?
- qual idade mínima, consentimento, política de conteúdo, termos de uso e aviso de direitos sobre a
  imagem serão necessários antes do upload?
- por quanto tempo a foto entregue ficará disponível ao remetente e destinatário; exclusão da conta,
  desfazer amizade ou bloqueio devem removê-la de quais superfícies?
- o destinatário poderá apagar somente da própria Caixa Postal sem remover a cópia do remetente?
- qual evidência deve ser preservada após denúncia ou remoção, por quanto tempo e com quais papéis
  administrativos autorizados?
- a foto será moderada novamente se regras ou modelos de segurança mudarem?
- a funcionalidade será liberada para todos, por Reputação Postal, por evento, por teste controlado
  ou somente após histórico mínimo de amizade?
- como tratar uma aprovação que expira ou é revogada entre a revisão final e a confirmação do
  despacho?

**Critérios de sucesso:**

- nenhuma foto pode ser enviada, aberta ou reutilizada por alguém que não seja remetente,
  destinatário autorizado ou moderador em atividade auditada;
- arquivos publicados não contêm EXIF, coordenadas ou metadados originais e respeitam orçamento de
  resolução e download mobile;
- upload repetido, reconexão ou confirmação duplicada não cria arquivos órfãos, múltiplas cobranças
  nem mais de uma correspondência;
- conteúdo rejeitado ou removido nunca aparece por fallback de cache, URL antiga, miniatura ou
  snapshot do cliente;
- denúncia e bloqueio funcionam sem exigir que o destinatário continue visualizando a imagem;
- a ausência de texto não quebra leitores, prévias, listagem, carimbo, selo, resposta ou histórico
  da correspondência;
- testes cobrem autorização, URLs expiradas, EXIF, formatos inválidos, processamento, moderação,
  remoção, bloqueio, retenção, movimento reduzido e layouts mobile.
