# Roadmap ativo

Este arquivo é a única fonte para sequência, escopo, decisões pendentes e estado do trabalho atual.
As Milestones 1–55 estão preservadas no [histórico do roadmap](../history/roadmap-milestones-1-55.md).
Procedimentos de deploy pertencem a [Operações](../operations/release.md), não ao roadmap.

## Estado atual

- Milestones 1–55: concluídas.
- Próxima etapa: planejar a Milestone 56 e aprovar suas decisões pendentes antes de implementar.
- Milestones 57–62: planejadas, com pendências explícitas abaixo.

## Milestone 56 — Equipamentos funcionais, mochilas e prévia de loadout

**Estado:** Next planned milestone; equipment principles approved, catalog economy unresolved. Plan
and approve the unresolved decisions below before implementation.

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

**Decisões pendentes antes da implementação:**

- the launch equipment catalog beyond backpacks and the conceptual raincoat/lantern examples;
- durability per item, Seed prices, repair prices, unlock sources, and inventory presentation for
  many instances;
- equipment positions other than the dedicated backpack position and the exact meaning of the
  preview's protection scale.

**Critérios de sucesso:**

- ownership, reservation, activation, durability, and repair are backend-authoritative;
- the preview matches the dispatched modifier snapshot;
- every route remains possible without purchasing or equipping an optional item.

## Milestone 57 — Identidades de skills e domínio contextual

**Estado:** Planned; identities and progression framework approved, some coefficients and triggers
remain unresolved.

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
  Cruzado`; individual options `Asa Solar`, `Arrancada Urbana`, or `Carga Aerodinâmica`;
- **Pipoca**, explorer and collector: `Achador Curioso` gives a 15% wider discovery corridor,
  `Coisa Brilhante` improves rarity weight, and `Desvio Feliz` widens the corridor further with a
  small speed tradeoff; individual options `Plumas Impermeáveis`, `Caminho d'Água`, or `Primeiro
  Passeio`;
- **Lume**, referral-unlocked night specialist: `Olhos da Noite`, `Vigília Noturna`, and `Voo
  Silencioso`; individual options `Memória Lunar`, `Carga Noturna`, or `Guardiã da Madrugada`;
- linear, visible effect growth to each skill's explicit maximum, never a permanent species XP
  multiplier.

**Fora de escopo:**

- manual training, random skill rolls, paid skills, paid respec, hidden bonuses, damage/failure
  mechanics, or species-exclusive collection content.

**Decisões pendentes antes da implementação:**

- exact XP awarded for every trigger and anti-farming rules for repeated trivial routes;
- final coefficients for several fixed and individual skills, including every climate threshold;
- whether `Desvio Feliz` changes path geometry or only the discovery corridor and calculated time;
- localized copy, icons, animation cues, and migration behavior for existing mascot skills.

**Critérios de sucesso:**

- each mascot has a recognizable advantage without becoming universally optimal;
- skill XP and effects are auditable, snapshotted, capped, and explained in the trip result;
- every discovery remains obtainable with any mascot even when Pipoca obtains it more efficiently.

## Milestone 58 — Níveis de voo, rotas familiares e bordas de prestígio

**Estado:** Planned; primary curves and unlock table approved, account-level unlocks unresolved.

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

**Decisões pendentes antes da implementação:**

- exact non-capacity unlocks at each level from 1–20 and their relationship to Reputação Postal;
- border art, titles, accessibility presentation, and whether border selection is automatic or
  player-selectable after unlock;
- route-identity migration for existing destinations and dynamically generated job locations.

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

- discovery taxonomy, launch illustrations/text, regional coverage, duplicate behavior, and exact
  rarity/drop tables;
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
