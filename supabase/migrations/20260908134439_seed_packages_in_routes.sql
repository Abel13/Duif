-- Seed Packages in Routes
-- Sistema determinístico para conceder Sementes durante viagens

-- 1. Catálogo de pacotes de sementes
create table public.seed_package_catalog (
  id uuid primary key default gen_random_uuid(),
  catalog_key text unique not null,
  name_key text not null,
  description_key text not null,
  asset_key text,
  seed_quantity integer not null check (seed_quantity > 0),
  base_chance_percent numeric(5,2) not null check (base_chance_percent between 0 and 100),
  tier integer not null check (tier between 1 and 5),
  min_distance_km numeric(10,2) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  sort_order integer not null default 0
);

create index seed_package_catalog_status_idx on public.seed_package_catalog(status) where status = 'active';
create index seed_package_catalog_tier_idx on public.seed_package_catalog(tier);

alter table public.seed_package_catalog enable row level security;

-- Catálogo inicial: 5 tiers de pacotes
insert into public.seed_package_catalog(catalog_key, name_key, description_key, seed_quantity, base_chance_percent, tier, min_distance_km, sort_order) values
('seed-package-minimum', 'seedPackages.minimum.name', 'seedPackages.minimum.description', 5, 8.00, 1, 0, 1),
('seed-package-small', 'seedPackages.small.name', 'seedPackages.small.description', 15, 5.00, 2, 25, 2),
('seed-package-medium', 'seedPackages.medium.name', 'seedPackages.medium.description', 30, 3.00, 3, 100, 3),
('seed-package-large', 'seedPackages.large.name', 'seedPackages.large.description', 60, 1.50, 4, 300, 4),
('seed-package-treasure', 'seedPackages.treasure.name', 'seedPackages.treasure.description', 100, 0.50, 5, 1000, 5);

-- 2. Oportunidades de pacotes por entrega
create table public.delivery_seed_package_opportunities (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  opportunity_index integer not null check (opportunity_index >= 0),
  segment_index integer not null check (segment_index >= 0),
  catalog_version integer not null,
  eligible_packages jsonb not null,
  mascot_luck_snapshot integer not null check (mascot_luck_snapshot >= 0 and mascot_luck_snapshot <= 100),
  seed_value text not null,
  result_package_key text,
  result_seed_quantity integer check (result_seed_quantity > 0),
  result_calculated_at timestamptz,
  created_at timestamptz not null default now(),
  
  constraint delivery_seed_package_opportunities_unique 
    unique(delivery_id, opportunity_index)
);

create index delivery_seed_package_opportunities_delivery_idx 
  on public.delivery_seed_package_opportunities(delivery_id);
create index delivery_seed_package_opportunities_result_idx 
  on public.delivery_seed_package_opportunities(delivery_id, result_package_key) 
  where result_package_key is not null;

alter table public.delivery_seed_package_opportunities enable row level security;

-- 3. Cooldowns de rota para anti-farming
create table public.seed_package_route_cooldowns (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  mascot_id uuid not null references public.player_mascots(id) on delete cascade,
  origin_key text not null,
  destination_key text not null,
  last_package_found_at timestamptz not null,
  created_at timestamptz not null default now(),
  
  constraint seed_package_route_cooldowns_unique 
    unique(mascot_id, origin_key, destination_key)
);

create index seed_package_route_cooldowns_mascot_idx 
  on public.seed_package_route_cooldowns(mascot_id, last_package_found_at);
create index seed_package_route_cooldowns_check_idx 
  on public.seed_package_route_cooldowns(mascot_id, origin_key, destination_key);

alter table public.seed_package_route_cooldowns enable row level security;

-- 4. Ledger de concessões (idempotência)
create table public.seed_package_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  delivery_id uuid not null,
  opportunity_id uuid not null references public.delivery_seed_package_opportunities(id) on delete cascade,
  package_catalog_key text not null,
  seed_quantity integer not null check (seed_quantity > 0),
  credited_at timestamptz not null default now(),
  
  constraint seed_package_ledger_opportunity_unique unique(opportunity_id)
);

create index seed_package_ledger_profile_idx on public.seed_package_ledger(profile_id, credited_at);
create index seed_package_ledger_delivery_idx on public.seed_package_ledger(delivery_id);

alter table public.seed_package_ledger enable row level security;

-- Funções auxiliares

-- Verifica se uma rota está em cooldown
create or replace function public.check_seed_package_cooldown(
  target_mascot_id uuid,
  origin_canonical_key text,
  destination_canonical_key text
)
returns boolean language plpgsql security definer set search_path=public as $$
declare
  last_found timestamptz;
begin
  select last_package_found_at into last_found
  from public.seed_package_route_cooldowns
  where mascot_id = target_mascot_id
    and origin_key = origin_canonical_key
    and destination_key = destination_canonical_key;
  
  -- Se não existe ou passou 24h, não está em cooldown
  return (last_found is null or now() - last_found > interval '24 hours');
end;
$$;

-- Credita pacotes de sementes na coleta
create or replace function public.credit_seed_packages(delivery_id_param uuid)
returns void language plpgsql security definer set search_path=public,auth as $$
declare
  opp record;
  is_cooldown_ok boolean;
  delivery_rec public.deliveries;
  origin_label text;
  dest_label text;
begin
  -- Buscar dados da entrega
  select * into delivery_rec from public.deliveries where id = delivery_id_param;
  if delivery_rec.id is null then
    return;
  end if;
  
  origin_label := delivery_rec.origin_label_key;
  dest_label := delivery_rec.destination_label_key;
  
  -- Para cada oportunidade com resultado
  for opp in 
    select 
      o.*,
      delivery_rec.sender_profile_id as profile_id,
      delivery_rec.mascot_id as mascot_id
    from public.delivery_seed_package_opportunities o
    where o.delivery_id = delivery_id_param
      and o.result_package_key is not null
  loop
    -- Verificar cooldown
    is_cooldown_ok := public.check_seed_package_cooldown(
      opp.mascot_id,
      origin_label,
      dest_label
    );
    
    if not is_cooldown_ok then
      continue; -- pular esta oportunidade (em cooldown)
    end if;
    
    -- Creditar no ledger (idempotente)
    insert into public.seed_package_ledger(
      profile_id,
      delivery_id,
      opportunity_id,
      package_catalog_key,
      seed_quantity
    )
    values(
      opp.profile_id,
      delivery_id_param,
      opp.id,
      opp.result_package_key,
      opp.result_seed_quantity
    )
    on conflict(opportunity_id) do nothing;
    
    if found then
      -- Creditar no saldo
      insert into public.profile_seed_balances(profile_id, quantity)
      values(opp.profile_id, opp.result_seed_quantity)
      on conflict(profile_id) do update
      set quantity = profile_seed_balances.quantity + excluded.quantity,
          updated_at = now();
      
      -- Atualizar cooldown
      insert into public.seed_package_route_cooldowns(
        profile_id,
        mascot_id,
        origin_key,
        destination_key,
        last_package_found_at
      )
      values(
        opp.profile_id,
        opp.mascot_id,
        origin_label,
        dest_label,
        now()
      )
      on conflict(mascot_id, origin_key, destination_key) do update
      set last_package_found_at = now();
    end if;
  end loop;
end;
$$;

-- View para métricas e análise
create or replace view public.seed_package_metrics as
select
  date_trunc('day', o.created_at) as day,
  c.tier,
  c.catalog_key,
  c.name_key,
  count(*) as total_opportunities,
  count(o.result_package_key) as packages_found,
  round(100.0 * count(o.result_package_key) / nullif(count(*), 0), 2) as find_rate_percent,
  round(avg(o.mascot_luck_snapshot), 0) as avg_luck,
  sum(o.result_seed_quantity) as total_seeds_awarded
from public.delivery_seed_package_opportunities o
left join public.seed_package_catalog c on c.catalog_key = o.result_package_key
group by 1, 2, 3, 4
order by 1 desc, 2;

-- Políticas RLS
create policy "Catalog is readable by authenticated users" 
  on public.seed_package_catalog for select 
  to authenticated using (status = 'active');

create policy "Users read own opportunities" 
  on public.delivery_seed_package_opportunities for select 
  to authenticated using (
    exists (
      select 1 from public.deliveries d
      where d.id = delivery_id 
        and d.sender_profile_id = (select id from public.profiles where auth_user_id = auth.uid())
    )
  );

create policy "Users read own cooldowns" 
  on public.seed_package_route_cooldowns for select 
  to authenticated using (
    profile_id = (select id from public.profiles where auth_user_id = auth.uid())
  );

create policy "Users read own ledger" 
  on public.seed_package_ledger for select 
  to authenticated using (
    profile_id = (select id from public.profiles where auth_user_id = auth.uid())
  );

-- Revogar permissões de anon
revoke all on table public.seed_package_catalog from anon;
revoke all on table public.delivery_seed_package_opportunities from anon;
revoke all on table public.seed_package_route_cooldowns from anon;
revoke all on table public.seed_package_ledger from anon;

-- Comentários
comment on table public.seed_package_catalog is 'Catálogo versionado de pacotes de sementes encontráveis em rotas';
comment on table public.delivery_seed_package_opportunities is 'Oportunidades de encontrar pacotes geradas por entrega (snapshot imutável)';
comment on table public.seed_package_route_cooldowns is 'Registro de cooldown por mascote e par de destinos (anti-farming 24h)';
comment on table public.seed_package_ledger is 'Ledger de concessões de sementes por pacotes (garante idempotência)';
