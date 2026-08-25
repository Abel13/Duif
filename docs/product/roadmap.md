# Roadmap ativo

Este arquivo é a única fonte para sequência, escopo, decisões pendentes e estado do trabalho atual.
As Milestones 1–55 estão preservadas no [histórico do roadmap](../history/roadmap-milestones-1-55.md).
Procedimentos de deploy pertencem a [Operações](../operations/release.md), não ao roadmap.

## Estado atual

- Milestones 1–58: concluídas localmente.
- Próxima etapa: planejar e aprovar as decisões pendentes da Milestone 59.
- Milestones 59–65: planejadas, com pendências explícitas abaixo.

## Milestone 56 — Equipamentos funcionais, mochilas e prévia de loadout

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

## Milestone 57 — Identidades de skills e domínio contextual

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

## Milestone 58 — Níveis de voo, rotas familiares e bordas de prestígio

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

## Milestone 59 — Diário de viagem, descobertas e consumíveis

**Estado:** Planned; collection roles approved, content catalog and drop tables unresolved.

**Objetivo:**

Turn route findings into a permanent per-mascot travel journal and a controlled source of useful
consumables without confusing discoveries with inventory items or official postcards.

**Inclui:**

- `Diário de Viagem` inside each mascot profile rather than a new primary Album surface;
- permanent discovery records containing official illustration, localized description, approximate
  region, mascot, date, and rarity;
- initial rarities Common, Uncommon, and Rare; `Special` describes event/mission origin rather than
  a fourth superior rarity;
- discoveries never occupying travel slots and never being consumed;
- permanent non-consumable findings are unique per player; if a resolved finding is already owned
  or pending in another delivery, nothing is granted, with no reroll or substitute compensation;
- a discovery optionally unlocking a related permanent official postcard while remaining a
  distinct journal record;
- the permanent simple base postcard, city postcards unlocked when a mascot passes through that
  city, and event postcards unlocked by their mission;
- paid postcard art modeled as finite consumable copies in future packs, while unlocked official
  postcards remain permanent;
- `Lanche Revigorante` found on routes, granted by jobs, and later purchasable with Seeds: common
  `+5%` and uncommon/special `+10%`, one per journey, selected and consumed at confirmed dispatch,
  occupying no slot and affecting outbound and return within the global speed cap;
- found snacks remaining pending delivery rewards and entering inventory only at final collection;
- the tutorial's `Impulso da Primeira Viagem` remaining a separate automatic, non-inventory
  modifier despite using related acceleration visual language.

**Fora de escopo:**

- player-uploaded journal art, exclusive discoveries obtainable only by Pipoca, Crystal-purchased
  route power, consuming unlocked city/event postcards, or activating found items before return.

**Decisões pendentes antes da implementação:**

- discovery taxonomy, launch illustrations/text, regional coverage, and exact rarity/drop tables;
- how city passage is determined for long route segments and how retroactive city unlocks work;
- snack stack limits, Seed prices, job quantities, event variants, and whether the `+10%` version
  should be named `Especial` or receive a different product name;
- the precise visual distinction between a snack modifier and the tutorial-only boost.

**Critérios de sucesso:**

- journal records, postcard unlocks, pending findings, inventory grants, and snack consumption are
  separate and idempotent backend operations;
- collection cannot grant a found snack or other reward twice;
- the UI never implies that a permanent discovery record occupies inventory or travel capacity.

## Milestone 60 — Encontros locais, segurança de amizade e moderação

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

## Milestone 61 — Push notifications e privacidade de entregas

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

## Milestone 62 — Atmosfera sazonal e efeitos climáticos

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

- season, day/night, and weather always match the selected segment snapshot from Milestone 55;
- routes, markers, labels, zoom controls, and active-map tools remain readable in every condition;
- mobile rendering remains responsive and loads no inactive seasonal or weather asset;
- reduced-motion mode contains no looping particles or flashes;
- changing or reconnecting during a segment produces the same deterministic visual state without
  changing authoritative travel timing or rewards.

## Milestone 63 — Eventos postais encadeados e destinos mundiais

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
  primeira conclusão elegível e integrados ao modelo permanente de cartões da M59;
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
  preferências e regras de privacidade da M61.

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

## Milestone 64 — Tutorial dos menus inferiores

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
- como a etapa de Coleção deve se comportar quando a M59 ainda não estiver implementada ou quando o
  jogador não possuir nenhum item além das recompensas iniciais?
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

## Milestone 65 — Pacotes de Sementes encontrados em rota

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
