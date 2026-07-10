insert into public.profiles (
  id,
  auth_user_id,
  mock_key,
  display_name,
  home_latitude,
  home_longitude,
  home_label_key,
  postal_base_street,
  postal_base_neighborhood,
  postal_base_city,
  postal_base_state,
  postal_base_country
) values
  ('00000000-0000-4000-8000-000000000001', null, 'player-current', 'Abel', -23.5505, -46.6333, 'locations.saoPaulo', 'Rua das Cartas', 'Centro Postal', 'Sao Paulo', 'SP', 'Brasil'),
  ('00000000-0000-4000-8000-000000000101', null, 'friend-lisbon', 'Lia', 38.7223, -9.1393, 'locations.lisbon', 'Rua dos Azulejos', 'Alfama', 'Lisboa', 'Lisboa', 'Portugal'),
  ('00000000-0000-4000-8000-000000000102', null, 'friend-curitiba', 'Caio', -25.4284, -49.2733, 'locations.curitiba', 'Rua das Araucarias', 'Batel', 'Curitiba', 'PR', 'Brasil'),
  ('00000000-0000-4000-8000-000000000103', null, 'friend-toronto', 'Mina', 43.6532, -79.3832, 'locations.toronto', 'Maple Letter Street', 'Harbourfront', 'Toronto', 'ON', 'Canada')
on conflict (mock_key) do update set
  display_name = excluded.display_name,
  home_latitude = excluded.home_latitude,
  home_longitude = excluded.home_longitude,
  home_label_key = excluded.home_label_key,
  postal_base_street = excluded.postal_base_street,
  postal_base_neighborhood = excluded.postal_base_neighborhood,
  postal_base_city = excluded.postal_base_city,
  postal_base_state = excluded.postal_base_state,
  postal_base_country = excluded.postal_base_country,
  updated_at = now();

insert into public.mascot_templates (
  id,
  mock_key,
  name,
  species_key,
  base_level,
  base_xp,
  next_level_xp,
  attributes,
  trait,
  equipment,
  skills,
  appearance
) values
  (
    '00000000-0000-4000-8000-000000000201',
    'mascot-nuvem',
    'Nuvem',
    'species.carrierPigeon',
    3,
    180,
    260,
    '{"speed":7,"stamina":8,"orientation":9,"luck":6}'::jsonb,
    '{"id":"trait-steady-route","nameKey":"traits.steadyRoute.name","descriptionKey":"traits.steadyRoute.description","effect":"deliveryReward"}'::jsonb,
    '[{"id":"equipment-nuvem-canvas-bag","nameKey":"equipment.canvasPostalBag.name","type":"bag","rarity":"common","equipped":true,"descriptionKey":"equipment.canvasPostalBag.description","iconAssetPath":"/assets/equipment/icons/canvas-postal-bag.webp"},{"id":"equipment-nuvem-blue-scarf","nameKey":"equipment.blueRouteScarf.name","type":"scarf","rarity":"uncommon","equipped":true,"descriptionKey":"equipment.blueRouteScarf.description","iconAssetPath":"/assets/equipment/icons/blue-route-scarf.webp"}]'::jsonb,
    '[{"id":"skill-nuvem-long-route","nameKey":"skills.longRoute.name","descriptionKey":"skills.longRoute.description","level":2},{"id":"skill-nuvem-soft-landing","nameKey":"skills.softLanding.name","descriptionKey":"skills.softLanding.description","level":1}]'::jsonb,
    '{"primaryColor":"#f7f1e3","accentColor":"#6f91a8","portraitPlaceholderKey":"appearance.nuvemPortrait","portraitAssetPath":"/assets/mascots/portraits/nuvem.webp"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    'mascot-trovao',
    'Trovão',
    'species.messengerFalcon',
    4,
    220,
    320,
    '{"speed":10,"stamina":5,"orientation":8,"luck":5}'::jsonb,
    '{"id":"trait-direct-flight","nameKey":"traits.directFlight.name","descriptionKey":"traits.directFlight.description","effect":"fastReturn"}'::jsonb,
    '[{"id":"equipment-trovao-flight-goggles","nameKey":"equipment.flightGoggles.name","type":"goggles","rarity":"rare","equipped":true,"descriptionKey":"equipment.flightGoggles.description","iconAssetPath":"/assets/equipment/icons/flight-goggles.webp"},{"id":"equipment-trovao-red-badge","nameKey":"equipment.urgentBadge.name","type":"badge","rarity":"uncommon","equipped":true,"descriptionKey":"equipment.urgentBadge.description","iconAssetPath":"/assets/equipment/icons/urgent-badge.webp"},{"id":"equipment-trovao-travel-cap","nameKey":"equipment.travelCap.name","type":"cap","rarity":"common","equipped":false,"descriptionKey":"equipment.travelCap.description","iconAssetPath":"/assets/equipment/icons/travel-cap.webp"}]'::jsonb,
    '[{"id":"skill-trovao-quick-dispatch","nameKey":"skills.quickDispatch.name","descriptionKey":"skills.quickDispatch.description","level":3},{"id":"skill-trovao-crosswind","nameKey":"skills.crosswindInstinct.name","descriptionKey":"skills.crosswindInstinct.description","level":2}]'::jsonb,
    '{"primaryColor":"#8b5e3c","accentColor":"#a44a3f","portraitPlaceholderKey":"appearance.trovaoPortrait","portraitAssetPath":"/assets/mascots/portraits/trovao.webp"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000203',
    'mascot-pipoca',
    'Pipoca',
    'species.mailDuck',
    2,
    95,
    180,
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

insert into public.player_mascots (
  id,
  owner_profile_id,
  template_id,
  mock_key,
  name,
  level,
  xp,
  next_level_xp,
  attributes,
  trait,
  equipment,
  skills,
  appearance
)
select
  template.id,
  '00000000-0000-4000-8000-000000000001',
  template.id,
  template.mock_key,
  template.name,
  template.base_level,
  template.base_xp,
  template.next_level_xp,
  template.attributes,
  template.trait,
  template.equipment,
  template.skills,
  template.appearance
from public.mascot_templates as template
where template.mock_key in ('mascot-nuvem', 'mascot-trovao', 'mascot-pipoca')
on conflict (mock_key) do update set
  name = excluded.name,
  level = excluded.level,
  xp = excluded.xp,
  next_level_xp = excluded.next_level_xp,
  attributes = excluded.attributes,
  trait = excluded.trait,
  equipment = excluded.equipment,
  skills = excluded.skills,
  appearance = excluded.appearance,
  updated_at = now();

insert into public.mascot_templates (
  id,
  mock_key,
  name,
  species_key,
  base_level,
  base_xp,
  next_level_xp,
  attributes,
  trait,
  equipment,
  skills,
  appearance
) values
  (
    '00000000-0000-4000-8000-000000000204',
    'friend-mascot-aurora',
    'Aurora',
    'species.mailDuck',
    3,
    0,
    240,
    '{"speed":5,"stamina":7,"orientation":6,"luck":9}'::jsonb,
    '{"id":"trait-friend-aurora","nameKey":"traits.curiousFinder.name","descriptionKey":"traits.curiousFinder.description","effect":"rareFind"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"primaryColor":"#fff8e8","accentColor":"#7a8f68","portraitPlaceholderKey":"appearance.friendAuroraPortrait","portraitAssetPath":"/assets/friends/mascots/aurora.webp"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000205',
    'friend-mascot-brisa',
    'Brisa',
    'species.carrierPigeon',
    2,
    0,
    180,
    '{"speed":6,"stamina":7,"orientation":8,"luck":6}'::jsonb,
    '{"id":"trait-friend-brisa","nameKey":"traits.steadyRoute.name","descriptionKey":"traits.steadyRoute.description","effect":"deliveryReward"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"primaryColor":"#f7f1e3","accentColor":"#6f91a8","portraitPlaceholderKey":"appearance.friendBrisaPortrait","portraitAssetPath":"/assets/friends/mascots/brisa.webp"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000206',
    'friend-mascot-tico',
    'Tico',
    'species.carrierPigeon',
    4,
    0,
    320,
    '{"speed":7,"stamina":8,"orientation":7,"luck":5}'::jsonb,
    '{"id":"trait-friend-tico","nameKey":"traits.steadyRoute.name","descriptionKey":"traits.steadyRoute.description","effect":"deliveryReward"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"primaryColor":"#e8ddc7","accentColor":"#8b5e3c","portraitPlaceholderKey":"appearance.friendTicoPortrait","portraitAssetPath":"/assets/friends/mascots/tico.webp"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000207',
    'friend-mascot-atlas',
    'Atlas',
    'species.messengerFalcon',
    5,
    0,
    420,
    '{"speed":10,"stamina":6,"orientation":8,"luck":5}'::jsonb,
    '{"id":"trait-friend-atlas","nameKey":"traits.directFlight.name","descriptionKey":"traits.directFlight.description","effect":"fastReturn"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"primaryColor":"#8b5e3c","accentColor":"#a44a3f","portraitPlaceholderKey":"appearance.friendAtlasPortrait","portraitAssetPath":"/assets/friends/mascots/atlas.webp"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000208',
    'friend-mascot-luma',
    'Luma',
    'species.mailDuck',
    2,
    0,
    180,
    '{"speed":5,"stamina":7,"orientation":6,"luck":8}'::jsonb,
    '{"id":"trait-friend-luma","nameKey":"traits.curiousFinder.name","descriptionKey":"traits.curiousFinder.description","effect":"rareFind"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"primaryColor":"#fff8e8","accentColor":"#c49a4a","portraitPlaceholderKey":"appearance.friendLumaPortrait","portraitAssetPath":"/assets/friends/mascots/luma.webp"}'::jsonb
  )
on conflict (mock_key) do update set
  name = excluded.name,
  species_key = excluded.species_key,
  base_level = excluded.base_level,
  next_level_xp = excluded.next_level_xp,
  attributes = excluded.attributes,
  trait = excluded.trait,
  equipment = excluded.equipment,
  skills = excluded.skills,
  appearance = excluded.appearance;

insert into public.player_mascots (
  id,
  owner_profile_id,
  template_id,
  mock_key,
  name,
  level,
  xp,
  next_level_xp,
  attributes,
  trait,
  equipment,
  skills,
  appearance
) values
  (
    '00000000-0000-4000-8000-000000000204',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000204',
    'friend-mascot-aurora',
    'Aurora',
    3,
    0,
    240,
    '{"speed":5,"stamina":7,"orientation":6,"luck":9}'::jsonb,
    '{"id":"trait-friend-aurora","nameKey":"traits.curiousFinder.name","descriptionKey":"traits.curiousFinder.description","effect":"rareFind"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"primaryColor":"#fff8e8","accentColor":"#7a8f68","portraitPlaceholderKey":"appearance.friendAuroraPortrait","portraitAssetPath":"/assets/friends/mascots/aurora.webp"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000205',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000205',
    'friend-mascot-brisa',
    'Brisa',
    2,
    0,
    180,
    '{"speed":6,"stamina":7,"orientation":8,"luck":6}'::jsonb,
    '{"id":"trait-friend-brisa","nameKey":"traits.steadyRoute.name","descriptionKey":"traits.steadyRoute.description","effect":"deliveryReward"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"primaryColor":"#f7f1e3","accentColor":"#6f91a8","portraitPlaceholderKey":"appearance.friendBrisaPortrait","portraitAssetPath":"/assets/friends/mascots/brisa.webp"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000206',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000206',
    'friend-mascot-tico',
    'Tico',
    4,
    0,
    320,
    '{"speed":7,"stamina":8,"orientation":7,"luck":5}'::jsonb,
    '{"id":"trait-friend-tico","nameKey":"traits.steadyRoute.name","descriptionKey":"traits.steadyRoute.description","effect":"deliveryReward"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"primaryColor":"#e8ddc7","accentColor":"#8b5e3c","portraitPlaceholderKey":"appearance.friendTicoPortrait","portraitAssetPath":"/assets/friends/mascots/tico.webp"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000207',
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000207',
    'friend-mascot-atlas',
    'Atlas',
    5,
    0,
    420,
    '{"speed":10,"stamina":6,"orientation":8,"luck":5}'::jsonb,
    '{"id":"trait-friend-atlas","nameKey":"traits.directFlight.name","descriptionKey":"traits.directFlight.description","effect":"fastReturn"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"primaryColor":"#8b5e3c","accentColor":"#a44a3f","portraitPlaceholderKey":"appearance.friendAtlasPortrait","portraitAssetPath":"/assets/friends/mascots/atlas.webp"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000208',
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000208',
    'friend-mascot-luma',
    'Luma',
    2,
    0,
    180,
    '{"speed":5,"stamina":7,"orientation":6,"luck":8}'::jsonb,
    '{"id":"trait-friend-luma","nameKey":"traits.curiousFinder.name","descriptionKey":"traits.curiousFinder.description","effect":"rareFind"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"primaryColor":"#fff8e8","accentColor":"#c49a4a","portraitPlaceholderKey":"appearance.friendLumaPortrait","portraitAssetPath":"/assets/friends/mascots/luma.webp"}'::jsonb
  )
on conflict (mock_key) do update set
  name = excluded.name,
  level = excluded.level,
  xp = excluded.xp,
  next_level_xp = excluded.next_level_xp,
  attributes = excluded.attributes,
  trait = excluded.trait,
  equipment = excluded.equipment,
  skills = excluded.skills,
  appearance = excluded.appearance,
  updated_at = now();

insert into public.friendships (
  id,
  requester_profile_id,
  addressee_profile_id,
  mock_key,
  status,
  friendship_level,
  exchange_count,
  favorite_note_key
) values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000101', 'friendship-lia', 'accepted', 4, 18, 'friends.lia.note'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000102', 'friendship-caio', 'accepted', 2, 7, 'friends.caio.note'),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000103', 'friendship-mina', 'accepted', 5, 24, 'friends.mina.note')
on conflict (mock_key) do update set
  status = excluded.status,
  friendship_level = excluded.friendship_level,
  exchange_count = excluded.exchange_count,
  favorite_note_key = excluded.favorite_note_key,
  updated_at = now();

insert into public.correspondence_options (
  id,
  mock_key,
  type,
  name_key,
  description_key,
  sort_order
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

insert into public.deliveries (
  id,
  mock_key,
  sender_profile_id,
  receiver_profile_id,
  mascot_id,
  correspondence_option_id,
  origin_latitude,
  origin_longitude,
  origin_label_key,
  destination_latitude,
  destination_longitude,
  destination_label_key,
  distance_km,
  animal_speed_kmh,
  outbound_start_at,
  outbound_arrival_at,
  return_start_at,
  return_arrival_at,
  status,
  reward_seed
) values (
  '00000000-0000-4000-8000-000000000501',
  'delivery-nuvem-lisbon',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000401',
  -23.5505,
  -46.6333,
  'locations.saoPaulo',
  38.7223,
  -9.1393,
  'locations.lisbon',
  7946,
  62,
  '2026-07-08T12:00:00.000Z',
  '2026-07-08T18:00:00.000Z',
  '2026-07-08T18:30:00.000Z',
  '2026-07-09T00:30:00.000Z',
  'returning',
  'nuvem-lisbon-welcome-letter'
)
on conflict (mock_key) do update set
  status = excluded.status,
  reward_seed = excluded.reward_seed,
  updated_at = now();

insert into public.reward_items (
  id,
  mock_key,
  name_key,
  description_key,
  rarity,
  thumbnail_asset_path
) values
  ('00000000-0000-4000-8000-000000000601', 'reward-worn-route-stamp', 'rewards.items.wornRouteStamp.name', 'rewards.items.wornRouteStamp.description', 'common', '/assets/items/thumbnails/worn-route-stamp.webp'),
  ('00000000-0000-4000-8000-000000000602', 'reward-blue-airmail-label', 'rewards.items.blueAirmailLabel.name', 'rewards.items.blueAirmailLabel.description', 'uncommon', '/assets/items/thumbnails/blue-airmail-label.webp'),
  ('00000000-0000-4000-8000-000000000603', 'reward-golden-compass-pin', 'rewards.items.goldenCompassPin.name', 'rewards.items.goldenCompassPin.description', 'rare', '/assets/items/thumbnails/golden-compass-pin.webp')
on conflict (mock_key) do update set
  name_key = excluded.name_key,
  description_key = excluded.description_key,
  rarity = excluded.rarity,
  thumbnail_asset_path = excluded.thumbnail_asset_path;

insert into public.delivery_rewards (
  id,
  mock_key,
  delivery_id,
  reward_item_id,
  xp_gained,
  collected_at
) values (
  '00000000-0000-4000-8000-000000000701',
  'reward-delivery-nuvem-lisbon',
  '00000000-0000-4000-8000-000000000501',
  '00000000-0000-4000-8000-000000000603',
  40,
  null
)
on conflict (mock_key) do update set
  reward_item_id = excluded.reward_item_id,
  xp_gained = excluded.xp_gained,
  collected_at = excluded.collected_at;

insert into public.inventory_items (
  id,
  owner_profile_id,
  reward_item_id,
  mock_key,
  name_key,
  description_key,
  rarity,
  category,
  source_key,
  thumbnail_asset_path,
  equipped,
  collected_at
) values
  ('00000000-0000-4000-8000-000000000801', '00000000-0000-4000-8000-000000000001', null, 'inventory-canvas-postal-bag', 'equipment.canvasPostalBag.name', 'equipment.canvasPostalBag.description', 'common', 'equipment', 'inventory.sources.starterKit', '/assets/equipment/icons/canvas-postal-bag.webp', true, '2026-07-01T10:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000802', '00000000-0000-4000-8000-000000000001', null, 'inventory-blue-route-scarf', 'equipment.blueRouteScarf.name', 'equipment.blueRouteScarf.description', 'uncommon', 'equipment', 'inventory.sources.starterKit', '/assets/equipment/icons/blue-route-scarf.webp', true, '2026-07-01T10:10:00.000Z'),
  ('00000000-0000-4000-8000-000000000803', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000601', 'inventory-worn-route-stamp', 'rewards.items.wornRouteStamp.name', 'rewards.items.wornRouteStamp.description', 'common', 'stamps', 'inventory.sources.routeReward', '/assets/items/thumbnails/worn-route-stamp.webp', false, '2026-07-03T12:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000804', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000602', 'inventory-blue-airmail-label', 'rewards.items.blueAirmailLabel.name', 'rewards.items.blueAirmailLabel.description', 'uncommon', 'routeMarks', 'inventory.sources.routeReward', '/assets/items/thumbnails/blue-airmail-label.webp', false, '2026-07-04T12:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000805', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000603', 'inventory-golden-compass-pin', 'rewards.items.goldenCompassPin.name', 'rewards.items.goldenCompassPin.description', 'rare', 'keepsakes', 'inventory.sources.longRouteFind', '/assets/items/thumbnails/golden-compass-pin.webp', false, '2026-07-05T12:00:00.000Z')
on conflict (mock_key) do update set
  reward_item_id = excluded.reward_item_id,
  name_key = excluded.name_key,
  description_key = excluded.description_key,
  rarity = excluded.rarity,
  category = excluded.category,
  source_key = excluded.source_key,
  thumbnail_asset_path = excluded.thumbnail_asset_path,
  equipped = excluded.equipped,
  collected_at = excluded.collected_at;
