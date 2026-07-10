create type public.delivery_status as enum (
  'available',
  'preparing',
  'outbound',
  'delivered',
  'returning',
  'returned',
  'completed'
);

create type public.correspondence_type as enum (
  'letter',
  'postcard',
  'sticker',
  'smallGift'
);

create type public.reward_rarity as enum (
  'common',
  'uncommon',
  'rare'
);

create type public.inventory_category as enum (
  'equipment',
  'stamps',
  'keepsakes',
  'routeMarks'
);

create table public.profiles (
  id uuid primary key,
  auth_user_id uuid unique,
  mock_key text unique,
  display_name text not null,
  home_latitude double precision not null,
  home_longitude double precision not null,
  home_label_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mascot_templates (
  id uuid primary key,
  mock_key text not null unique,
  name text not null,
  species_key text not null,
  base_level integer not null default 1 check (base_level > 0),
  base_xp integer not null default 0 check (base_xp >= 0),
  next_level_xp integer not null check (next_level_xp > 0),
  attributes jsonb not null,
  trait jsonb not null,
  equipment jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  appearance jsonb not null,
  created_at timestamptz not null default now()
);

create table public.player_mascots (
  id uuid primary key,
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid not null references public.mascot_templates(id),
  mock_key text unique,
  name text not null,
  level integer not null check (level > 0),
  xp integer not null default 0 check (xp >= 0),
  next_level_xp integer not null check (next_level_xp > 0),
  attributes jsonb not null,
  trait jsonb not null,
  equipment jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  appearance jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.friendships (
  id uuid primary key,
  requester_profile_id uuid not null references public.profiles(id) on delete cascade,
  addressee_profile_id uuid not null references public.profiles(id) on delete cascade,
  mock_key text unique,
  status text not null default 'accepted' check (status in ('pending', 'accepted', 'blocked')),
  friendship_level integer not null default 1 check (friendship_level > 0),
  exchange_count integer not null default 0 check (exchange_count >= 0),
  favorite_note_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friendships_not_self check (requester_profile_id <> addressee_profile_id),
  constraint friendships_pair_unique unique (requester_profile_id, addressee_profile_id)
);

create table public.correspondence_options (
  id uuid primary key,
  mock_key text not null unique,
  type public.correspondence_type not null,
  name_key text not null,
  description_key text not null,
  active boolean not null default true,
  sort_order integer not null default 0
);

create table public.deliveries (
  id uuid primary key,
  mock_key text unique,
  sender_profile_id uuid not null references public.profiles(id),
  receiver_profile_id uuid not null references public.profiles(id),
  mascot_id uuid not null references public.player_mascots(id),
  correspondence_option_id uuid references public.correspondence_options(id),
  origin_latitude double precision not null,
  origin_longitude double precision not null,
  origin_label_key text not null,
  destination_latitude double precision not null,
  destination_longitude double precision not null,
  destination_label_key text not null,
  distance_km numeric(10, 2) not null check (distance_km >= 0),
  animal_speed_kmh numeric(10, 2) not null check (animal_speed_kmh > 0),
  outbound_start_at timestamptz not null,
  outbound_arrival_at timestamptz not null,
  return_start_at timestamptz,
  return_arrival_at timestamptz,
  status public.delivery_status not null,
  reward_seed text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deliveries_outbound_order check (outbound_arrival_at >= outbound_start_at),
  constraint deliveries_return_order check (
    return_start_at is null
    or return_arrival_at is null
    or return_arrival_at >= return_start_at
  )
);

create table public.reward_items (
  id uuid primary key,
  mock_key text not null unique,
  name_key text not null,
  description_key text not null,
  rarity public.reward_rarity not null,
  thumbnail_asset_path text
);

create table public.delivery_rewards (
  id uuid primary key,
  mock_key text unique,
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  reward_item_id uuid not null references public.reward_items(id),
  xp_gained integer not null check (xp_gained >= 0),
  collected_at timestamptz,
  created_at timestamptz not null default now(),
  constraint delivery_rewards_delivery_unique unique (delivery_id)
);

create table public.inventory_items (
  id uuid primary key,
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  reward_item_id uuid references public.reward_items(id),
  mock_key text unique,
  name_key text not null,
  description_key text not null,
  rarity public.reward_rarity not null,
  category public.inventory_category not null,
  source_key text,
  thumbnail_asset_path text,
  equipped boolean not null default false,
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index profiles_auth_user_id_idx on public.profiles(auth_user_id);
create index player_mascots_owner_profile_id_idx on public.player_mascots(owner_profile_id);
create index friendships_requester_profile_id_idx on public.friendships(requester_profile_id);
create index friendships_addressee_profile_id_idx on public.friendships(addressee_profile_id);
create index deliveries_sender_profile_id_idx on public.deliveries(sender_profile_id);
create index deliveries_receiver_profile_id_idx on public.deliveries(receiver_profile_id);
create index deliveries_mascot_id_idx on public.deliveries(mascot_id);
create index delivery_rewards_delivery_id_idx on public.delivery_rewards(delivery_id);
create index inventory_items_owner_profile_id_idx on public.inventory_items(owner_profile_id);

alter table public.profiles enable row level security;
alter table public.player_mascots enable row level security;
alter table public.friendships enable row level security;
alter table public.deliveries enable row level security;
alter table public.delivery_rewards enable row level security;
alter table public.inventory_items enable row level security;

create policy "Profiles are readable by their owner"
  on public.profiles
  for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy "Mascots are readable by their owner"
  on public.player_mascots
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = player_mascots.owner_profile_id
        and profiles.auth_user_id = auth.uid()
    )
  );

create policy "Friendships are readable by participants"
  on public.friendships
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.auth_user_id = auth.uid()
        and profiles.id in (friendships.requester_profile_id, friendships.addressee_profile_id)
    )
  );

create policy "Deliveries are readable by participants"
  on public.deliveries
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.auth_user_id = auth.uid()
        and profiles.id in (deliveries.sender_profile_id, deliveries.receiver_profile_id)
    )
  );

create policy "Delivery rewards are readable by delivery participants"
  on public.delivery_rewards
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.deliveries
      join public.profiles
        on profiles.id in (deliveries.sender_profile_id, deliveries.receiver_profile_id)
      where deliveries.id = delivery_rewards.delivery_id
        and profiles.auth_user_id = auth.uid()
    )
  );

create policy "Inventory items are readable by their owner"
  on public.inventory_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = inventory_items.owner_profile_id
        and profiles.auth_user_id = auth.uid()
    )
  );
