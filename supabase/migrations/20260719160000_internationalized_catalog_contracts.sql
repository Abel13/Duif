create type public.catalog_status as enum ('draft', 'active', 'archived');

create table public.official_translation_keys (
  translation_key text primary key,
  has_pt_br boolean not null default true,
  has_en_us boolean not null default true,
  created_at timestamptz not null default now(),
  constraint official_translation_keys_complete_check check (has_pt_br and has_en_us),
  constraint official_translation_keys_format_check
    check (translation_key ~ '^[a-z][A-Za-z0-9]*(\.[a-zA-Z][A-Za-z0-9]*)+$')
);

alter table public.official_translation_keys enable row level security;
create policy "Official translation keys are publicly readable"
  on public.official_translation_keys for select using (true);
revoke insert, update, delete on public.official_translation_keys from anon, authenticated;

insert into public.official_translation_keys (translation_key) values
  ('species.carrierPigeon'), ('species.messengerFalcon'), ('species.mailDuck'),
  ('archetypes.suggestedNames.nuvem'), ('archetypes.suggestedNames.trovao'),
  ('archetypes.suggestedNames.pipoca'),
  ('traits.steadyRoute.name'), ('traits.steadyRoute.description'),
  ('traits.directFlight.name'), ('traits.directFlight.description'),
  ('traits.curiousFinder.name'), ('traits.curiousFinder.description'),
  ('equipment.canvasPostalBag.name'), ('equipment.canvasPostalBag.description'),
  ('equipment.blueRouteScarf.name'), ('equipment.blueRouteScarf.description'),
  ('equipment.flightGoggles.name'), ('equipment.flightGoggles.description'),
  ('equipment.urgentBadge.name'), ('equipment.urgentBadge.description'),
  ('equipment.travelCap.name'), ('equipment.travelCap.description'),
  ('equipment.featherCharm.name'), ('equipment.featherCharm.description'),
  ('equipment.smallSatchel.name'), ('equipment.smallSatchel.description'),
  ('skills.longRoute.name'), ('skills.longRoute.description'),
  ('skills.softLanding.name'), ('skills.softLanding.description'),
  ('skills.quickDispatch.name'), ('skills.quickDispatch.description'),
  ('skills.crosswindInstinct.name'), ('skills.crosswindInstinct.description'),
  ('skills.shinyThing.name'), ('skills.shinyThing.description'),
  ('skills.happyDetour.name'), ('skills.happyDetour.description'),
  ('appearance.nuvemPortrait'), ('appearance.trovaoPortrait'), ('appearance.pipocaPortrait'),
  ('correspondence.letter.name'), ('correspondence.letter.description'),
  ('correspondence.postcard.name'), ('correspondence.postcard.description'),
  ('correspondence.sticker.name'), ('correspondence.sticker.description'),
  ('correspondence.smallGift.name'), ('correspondence.smallGift.description'),
  ('rewards.items.wornRouteStamp.name'), ('rewards.items.wornRouteStamp.description'),
  ('rewards.items.blueAirmailLabel.name'), ('rewards.items.blueAirmailLabel.description'),
  ('rewards.items.goldenCompassPin.name'), ('rewards.items.goldenCompassPin.description'),
  ('map.rewards.londrinaPostcard.name'), ('map.rewards.londrinaPostcard.description'),
  ('map.rewards.cambeSouvenir.name'), ('map.rewards.cambeSouvenir.description'),
  ('map.rewards.rolandiaBadge.name'), ('map.rewards.rolandiaBadge.description'),
  ('map.rewards.arapongasMaterial.name'), ('map.rewards.arapongasMaterial.description'),
  ('map.rewards.apucaranaStamp.name'), ('map.rewards.apucaranaStamp.description'),
  ('map.rewards.maringaEvent.name'), ('map.rewards.maringaEvent.description'),
  ('locations.londrina'), ('locations.cambe'), ('locations.rolandia'),
  ('locations.arapongas'), ('locations.apucarana'), ('locations.maringa'),
  ('inventory.sources.routeReward')
on conflict (translation_key) do nothing;

alter table public.mascot_templates rename column mock_key to catalog_key;
alter table public.mascot_templates rename column name to suggested_name_key;
alter table public.mascot_templates alter column suggested_name_key drop not null;
alter table public.mascot_templates alter column species_key drop not null;
alter table public.mascot_templates add column status public.catalog_status not null default 'draft';
update public.mascot_templates set
  suggested_name_key = case catalog_key
    when 'mascot-nuvem' then 'archetypes.suggestedNames.nuvem'
    when 'mascot-trovao' then 'archetypes.suggestedNames.trovao'
    when 'mascot-pipoca' then 'archetypes.suggestedNames.pipoca'
    else null end,
  status = case when catalog_key in ('mascot-nuvem', 'mascot-trovao', 'mascot-pipoca')
    then 'active'::public.catalog_status else 'archived'::public.catalog_status end;

alter table public.correspondence_options rename column mock_key to catalog_key;
alter table public.correspondence_options alter column name_key drop not null;
alter table public.correspondence_options alter column description_key drop not null;
alter table public.correspondence_options add column status public.catalog_status not null default 'draft';
update public.correspondence_options set status = case when active then 'active'::public.catalog_status else 'archived'::public.catalog_status end;
alter table public.correspondence_options drop column active;

alter table public.reward_items rename column mock_key to catalog_key;
alter table public.reward_items alter column name_key drop not null;
alter table public.reward_items alter column description_key drop not null;
alter table public.reward_items add column status public.catalog_status not null default 'draft';
update public.reward_items set status = 'active';

alter table public.route_reward_points rename column mock_key to catalog_key;
alter table public.route_reward_points rename column region_label to region_label_key;
alter table public.route_reward_points alter column title_key drop not null;
alter table public.route_reward_points alter column description_key drop not null;
alter table public.route_reward_points alter column region_label_key drop not null;
alter table public.route_reward_points add column status public.catalog_status not null default 'draft';
update public.route_reward_points set
  region_label_key = case catalog_key
    when 'route-reward-londrina-postcard' then 'locations.londrina'
    when 'route-reward-cambe-souvenir' then 'locations.cambe'
    when 'route-reward-rolandia-badge' then 'locations.rolandia'
    when 'route-reward-arapongas-material' then 'locations.arapongas'
    when 'route-reward-apucarana-stamp' then 'locations.apucarana'
    when 'route-reward-maringa-event' then 'locations.maringa'
    else null end,
  status = case when active then 'active'::public.catalog_status else 'archived'::public.catalog_status end;
alter table public.route_reward_points drop column active;

alter table public.profiles drop column mock_key;
alter table public.player_mascots drop column mock_key;
alter table public.friendships drop column mock_key;
alter table public.deliveries drop column mock_key;
alter table public.delivery_rewards drop column mock_key;
alter table public.inventory_items drop column mock_key;

alter table public.inventory_items add column delivery_reward_id uuid unique references public.delivery_rewards(id);

alter table public.mascot_templates enable row level security;
alter table public.correspondence_options enable row level security;
alter table public.reward_items enable row level security;

create policy "Active mascot archetypes are publicly readable"
  on public.mascot_templates for select using (status = 'active');
create policy "Active correspondence options are publicly readable"
  on public.correspondence_options for select using (status = 'active');
create policy "Active reward items are publicly readable"
  on public.reward_items for select using (status = 'active');
drop policy if exists "Route reward points are readable by authenticated players"
  on public.route_reward_points;
create policy "Active route reward points are readable by authenticated players"
  on public.route_reward_points for select to authenticated using (status = 'active');

create or replace function public.translation_key_is_official(candidate text)
returns boolean language sql stable set search_path = public as $$
  select candidate is not null and exists (
    select 1 from public.official_translation_keys
    where translation_key = candidate and has_pt_br and has_en_us
  );
$$;

create or replace function public.json_translation_keys_are_official(payload jsonb)
returns boolean language plpgsql stable set search_path = public as $$
declare
  entry record;
  item jsonb;
begin
  if payload is null then return false; end if;
  if jsonb_typeof(payload) = 'object' then
    for entry in select key, value from jsonb_each(payload) loop
      if entry.key in ('nameKey', 'descriptionKey', 'portraitPlaceholderKey') then
        if jsonb_typeof(entry.value) <> 'string'
          or not public.translation_key_is_official(entry.value #>> '{}') then return false; end if;
      elsif jsonb_typeof(entry.value) in ('object', 'array')
        and not public.json_translation_keys_are_official(entry.value) then return false;
      end if;
    end loop;
  elsif jsonb_typeof(payload) = 'array' then
    for item in select value from jsonb_array_elements(payload) loop
      if not public.json_translation_keys_are_official(item) then return false; end if;
    end loop;
  end if;
  return true;
end;
$$;

create or replace function public.validate_official_catalog_row()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status <> 'active' then return new; end if;
  if tg_table_name = 'mascot_templates' then
    if not public.translation_key_is_official(new.species_key)
      or not public.translation_key_is_official(new.suggested_name_key)
      or not public.json_translation_keys_are_official(new.trait)
      or not public.json_translation_keys_are_official(new.equipment)
      or not public.json_translation_keys_are_official(new.skills)
      or not public.json_translation_keys_are_official(new.appearance) then
      raise exception 'Active mascot archetype has incomplete translations' using errcode = '23514';
    end if;
  elsif tg_table_name = 'correspondence_options' then
    if not public.translation_key_is_official(new.name_key) or not public.translation_key_is_official(new.description_key) then
      raise exception 'Active correspondence has incomplete translations' using errcode = '23514';
    end if;
  elsif tg_table_name = 'reward_items' then
    if not public.translation_key_is_official(new.name_key) or not public.translation_key_is_official(new.description_key) then
      raise exception 'Active reward has incomplete translations' using errcode = '23514';
    end if;
  elsif tg_table_name = 'route_reward_points' then
    if not public.translation_key_is_official(new.title_key)
      or not public.translation_key_is_official(new.description_key)
      or not public.translation_key_is_official(new.region_label_key) then
      raise exception 'Active route point has incomplete translations' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create trigger validate_mascot_template_translations before insert or update on public.mascot_templates
for each row execute function public.validate_official_catalog_row();
create trigger validate_correspondence_translations before insert or update on public.correspondence_options
for each row execute function public.validate_official_catalog_row();
create trigger validate_reward_translations before insert or update on public.reward_items
for each row execute function public.validate_official_catalog_row();
create trigger validate_route_point_translations before insert or update on public.route_reward_points
for each row execute function public.validate_official_catalog_row();

create or replace function public.set_official_catalog_status(entity_type text, entity_id uuid, next_status public.catalog_status)
returns void language plpgsql security definer set search_path = public as $$
begin
  if entity_type = 'mascotTemplate' then update public.mascot_templates set status = next_status where id = entity_id;
  elsif entity_type = 'correspondenceOption' then update public.correspondence_options set status = next_status where id = entity_id;
  elsif entity_type = 'rewardItem' then update public.reward_items set status = next_status where id = entity_id;
  elsif entity_type = 'routeRewardPoint' then update public.route_reward_points set status = next_status where id = entity_id;
  else raise exception 'Unknown catalog entity type' using errcode = '22023'; end if;
  if not found then raise exception 'Catalog entity not found' using errcode = '22023'; end if;
end;
$$;
revoke all on function public.set_official_catalog_status(text, uuid, public.catalog_status) from public;
