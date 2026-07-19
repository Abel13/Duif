insert into public.profiles (
  id, auth_user_id, display_name, home_latitude, home_longitude, home_label_key,
  postal_base_street, postal_base_neighborhood, postal_base_city, postal_base_state,
  postal_base_country
) values
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Sender', -23.3045, -51.1696, 'locations.londrina', '', '', 'Londrina', 'Paraná', 'Brasil'),
  ('00000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000101', 'Recipient', -23.4205, -51.9333, 'locations.maringa', '', '', 'Maringá', 'Paraná', 'Brasil'),
  ('00000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000000102', 'Third party', -25.4, -49.2, 'locations.curitiba', '', '', 'Curitiba', 'Paraná', 'Brasil');

insert into public.player_mascots (
  id, owner_profile_id, template_id, name, level, xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
)
select '00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000001',
  id, 'Player mascot', base_level, base_xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
from public.mascot_templates where catalog_key = 'mascot-pipoca';

insert into public.player_mascots (
  id, owner_profile_id, template_id, name, level, xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
)
select '00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000101',
  id, 'Friend mascot', base_level, base_xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
from public.mascot_templates where catalog_key = 'mascot-nuvem';
