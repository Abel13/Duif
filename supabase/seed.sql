-- Official, player-independent catalog data only.
-- Player accounts and progress must never be added to this seed.

insert into public.mascot_templates (
  id, mock_key, name, species_key, base_level, base_xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
) values
  (
    '00000000-0000-4000-8000-000000000201', 'mascot-nuvem', 'Nuvem',
    'species.carrierPigeon', 3, 180, 260,
    '{"speed":7,"stamina":8,"orientation":9,"luck":6}'::jsonb,
    '{"id":"trait-steady-route","nameKey":"traits.steadyRoute.name","descriptionKey":"traits.steadyRoute.description","effect":"deliveryReward"}'::jsonb,
    '[{"id":"equipment-nuvem-canvas-bag","nameKey":"equipment.canvasPostalBag.name","type":"bag","rarity":"common","equipped":true,"descriptionKey":"equipment.canvasPostalBag.description","iconAssetPath":"/assets/equipment/icons/canvas-postal-bag.webp"},{"id":"equipment-nuvem-blue-scarf","nameKey":"equipment.blueRouteScarf.name","type":"scarf","rarity":"uncommon","equipped":true,"descriptionKey":"equipment.blueRouteScarf.description","iconAssetPath":"/assets/equipment/icons/blue-route-scarf.webp"}]'::jsonb,
    '[{"id":"skill-nuvem-long-route","nameKey":"skills.longRoute.name","descriptionKey":"skills.longRoute.description","level":2},{"id":"skill-nuvem-soft-landing","nameKey":"skills.softLanding.name","descriptionKey":"skills.softLanding.description","level":1}]'::jsonb,
    '{"primaryColor":"#f7f1e3","accentColor":"#6f91a8","portraitPlaceholderKey":"appearance.nuvemPortrait","portraitAssetPath":"/assets/mascots/portraits/nuvem.webp"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000202', 'mascot-trovao', 'Trovão',
    'species.messengerFalcon', 4, 220, 320,
    '{"speed":10,"stamina":5,"orientation":8,"luck":5}'::jsonb,
    '{"id":"trait-direct-flight","nameKey":"traits.directFlight.name","descriptionKey":"traits.directFlight.description","effect":"fastReturn"}'::jsonb,
    '[{"id":"equipment-trovao-flight-goggles","nameKey":"equipment.flightGoggles.name","type":"goggles","rarity":"rare","equipped":true,"descriptionKey":"equipment.flightGoggles.description","iconAssetPath":"/assets/equipment/icons/flight-goggles.webp"},{"id":"equipment-trovao-red-badge","nameKey":"equipment.urgentBadge.name","type":"badge","rarity":"uncommon","equipped":true,"descriptionKey":"equipment.urgentBadge.description","iconAssetPath":"/assets/equipment/icons/urgent-badge.webp"},{"id":"equipment-trovao-travel-cap","nameKey":"equipment.travelCap.name","type":"cap","rarity":"common","equipped":false,"descriptionKey":"equipment.travelCap.description","iconAssetPath":"/assets/equipment/icons/travel-cap.webp"}]'::jsonb,
    '[{"id":"skill-trovao-quick-dispatch","nameKey":"skills.quickDispatch.name","descriptionKey":"skills.quickDispatch.description","level":3},{"id":"skill-trovao-crosswind","nameKey":"skills.crosswindInstinct.name","descriptionKey":"skills.crosswindInstinct.description","level":2}]'::jsonb,
    '{"primaryColor":"#8b5e3c","accentColor":"#a44a3f","portraitPlaceholderKey":"appearance.trovaoPortrait","portraitAssetPath":"/assets/mascots/portraits/trovao.webp"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000203', 'mascot-pipoca', 'Pipoca',
    'species.mailDuck', 2, 95, 180,
    '{"speed":5,"stamina":7,"orientation":6,"luck":10}'::jsonb,
    '{"id":"trait-curious-finder","nameKey":"traits.curiousFinder.name","descriptionKey":"traits.curiousFinder.description","effect":"rareFind"}'::jsonb,
    '[{"id":"equipment-pipoca-feather-charm","nameKey":"equipment.featherCharm.name","type":"charm","rarity":"rare","equipped":true,"descriptionKey":"equipment.featherCharm.description","iconAssetPath":"/assets/equipment/icons/feather-charm.webp"},{"id":"equipment-pipoca-small-satchel","nameKey":"equipment.smallSatchel.name","type":"bag","rarity":"common","equipped":true,"descriptionKey":"equipment.smallSatchel.description","iconAssetPath":"/assets/equipment/icons/small-satchel.webp"}]'::jsonb,
    '[{"id":"skill-pipoca-shiny-thing","nameKey":"skills.shinyThing.name","descriptionKey":"skills.shinyThing.description","level":2},{"id":"skill-pipoca-detour","nameKey":"skills.happyDetour.name","descriptionKey":"skills.happyDetour.description","level":1}]'::jsonb,
    '{"primaryColor":"#fff8e8","accentColor":"#c49a4a","portraitPlaceholderKey":"appearance.pipocaPortrait","portraitAssetPath":"/assets/mascots/portraits/pipoca.webp"}'::jsonb
  )
on conflict (mock_key) do update set
  name = excluded.name,
  species_key = excluded.species_key,
  base_level = excluded.base_level,
  base_xp = excluded.base_xp,
  next_level_xp = excluded.next_level_xp,
  attributes = excluded.attributes,
  trait = excluded.trait,
  equipment = excluded.equipment,
  skills = excluded.skills,
  appearance = excluded.appearance;

insert into public.correspondence_options (
  id, mock_key, type, name_key, description_key, sort_order
) values
  ('00000000-0000-4000-8000-000000000401', 'correspondence-letter', 'letter', 'correspondence.letter.name', 'correspondence.letter.description', 1),
  ('00000000-0000-4000-8000-000000000402', 'correspondence-postcard', 'postcard', 'correspondence.postcard.name', 'correspondence.postcard.description', 2),
  ('00000000-0000-4000-8000-000000000403', 'correspondence-sticker', 'sticker', 'correspondence.sticker.name', 'correspondence.sticker.description', 3),
  ('00000000-0000-4000-8000-000000000404', 'correspondence-small-gift', 'smallGift', 'correspondence.smallGift.name', 'correspondence.smallGift.description', 4)
on conflict (mock_key) do update set
  type = excluded.type,
  name_key = excluded.name_key,
  description_key = excluded.description_key,
  sort_order = excluded.sort_order;

insert into public.reward_items (
  id, mock_key, name_key, description_key, rarity, thumbnail_asset_path
) values
  ('00000000-0000-4000-8000-000000000601', 'reward-worn-route-stamp', 'rewards.items.wornRouteStamp.name', 'rewards.items.wornRouteStamp.description', 'common', '/assets/items/thumbnails/worn-route-stamp.webp'),
  ('00000000-0000-4000-8000-000000000602', 'reward-blue-airmail-label', 'rewards.items.blueAirmailLabel.name', 'rewards.items.blueAirmailLabel.description', 'uncommon', '/assets/items/thumbnails/blue-airmail-label.webp'),
  ('00000000-0000-4000-8000-000000000603', 'reward-golden-compass-pin', 'rewards.items.goldenCompassPin.name', 'rewards.items.goldenCompassPin.description', 'rare', '/assets/items/thumbnails/golden-compass-pin.webp')
on conflict (mock_key) do update set
  name_key = excluded.name_key,
  description_key = excluded.description_key,
  rarity = excluded.rarity,
  thumbnail_asset_path = excluded.thumbnail_asset_path;
