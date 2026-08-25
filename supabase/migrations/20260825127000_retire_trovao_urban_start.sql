-- Retire Urban Start without rewriting historical delivery snapshots.
create table public.mascot_retired_skill_transfers (
  mascot_id uuid primary key references public.player_mascots(id) on delete cascade,
  source_skill_id text not null check(source_skill_id='skill-trovao-urban-start'),
  source_total_xp integer not null check(source_total_xp>=0),
  prior_free_change_used boolean not null default false,
  target_skill_id text check(target_skill_id in ('skill-trovao-solar-wing','skill-trovao-aerodynamic-load')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
alter table public.mascot_retired_skill_transfers enable row level security;
create policy "players read own retired skill transfers" on public.mascot_retired_skill_transfers for select using (
  mascot_id in(select id from public.player_mascots where owner_profile_id=public.current_profile_id())
);

insert into public.mascot_retired_skill_transfers(mascot_id,source_skill_id,source_total_xp,prior_free_change_used)
select p.id,'skill-trovao-urban-start',
  (case coalesce(progress.level,1) when 1 then 0 when 2 then 40 when 3 then 100 when 4 then 190 when 5 then 320 when 6 then 500 when 7 then 740 when 8 then 1050 when 9 then 1450 else 1950 end)+coalesce(progress.xp,0),
  coalesce(choice.free_change_used,false)
from public.player_mascots p
join public.mascot_templates template on template.id=p.template_id and template.catalog_key='mascot-trovao'
left join public.mascot_individual_skill_choices choice on choice.mascot_id=p.id
left join public.mascot_skill_progression progress on progress.mascot_id=p.id and progress.skill_id='skill-trovao-urban-start'
where choice.skill_id='skill-trovao-urban-start' or progress.mascot_id is not null
on conflict(mascot_id) do nothing;

delete from public.mascot_individual_skill_choices choice using public.mascot_retired_skill_transfers transfer
where choice.mascot_id=transfer.mascot_id and choice.skill_id='skill-trovao-urban-start' and transfer.resolved_at is null;

update public.mascot_templates set skills=(select coalesce(jsonb_agg(item order by ordinal),'[]'::jsonb) from jsonb_array_elements(skills) with ordinality entries(item,ordinal) where item->>'id'<>'skill-trovao-urban-start')
where catalog_key='mascot-trovao';
update public.player_mascots p set skills=(select coalesce(jsonb_agg(item order by ordinal),'[]'::jsonb) from jsonb_array_elements(p.skills) with ordinality entries(item,ordinal) where item->>'id'<>'skill-trovao-urban-start'),updated_at=now()
where exists(select 1 from public.mascot_templates template where template.id=p.template_id and template.catalog_key='mascot-trovao');

create or replace function public.resolve_retired_urban_start_transfer(target_mascot_id uuid,target_skill_id text)
returns void language plpgsql security definer set search_path=public,auth as $$
declare pet public.player_mascots; transfer public.mascot_retired_skill_transfers; target public.mascot_skill_progression; total_xp integer; target_total integer; resolved_level integer; resolved_xp integer;
begin
  if target_skill_id not in ('skill-trovao-solar-wing','skill-trovao-aerodynamic-load') then raise exception 'Invalid transfer target' using errcode='22023'; end if;
  select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=public.current_profile_id() for update;
  if pet.id is null then raise exception 'Mascot not found' using errcode='42501'; end if;
  if not exists(select 1 from jsonb_array_elements(pet.skills) item where item->>'id'=target_skill_id and item->>'category'='individual') then raise exception 'Invalid transfer target' using errcode='22023'; end if;
  select * into transfer from public.mascot_retired_skill_transfers where mascot_id=pet.id for update;
  if transfer.mascot_id is null then raise exception 'No pending transfer' using errcode='22023'; end if;
  if transfer.resolved_at is not null then
    if transfer.target_skill_id=target_skill_id then return; end if;
    raise exception 'Transfer already resolved' using errcode='22023';
  end if;
  select * into target from public.mascot_skill_progression where mascot_id=pet.id and skill_id=target_skill_id for update;
  target_total:=(case coalesce(target.level,1) when 1 then 0 when 2 then 40 when 3 then 100 when 4 then 190 when 5 then 320 when 6 then 500 when 7 then 740 when 8 then 1050 when 9 then 1450 else 1950 end)+coalesce(target.xp,0);
  total_xp:=target_total+transfer.source_total_xp;
  resolved_level:=case when total_xp>=1950 then 10 when total_xp>=1450 then 9 when total_xp>=1050 then 8 when total_xp>=740 then 7 when total_xp>=500 then 6 when total_xp>=320 then 5 when total_xp>=190 then 4 when total_xp>=100 then 3 when total_xp>=40 then 2 else 1 end;
  resolved_xp:=total_xp-(case resolved_level when 1 then 0 when 2 then 40 when 3 then 100 when 4 then 190 when 5 then 320 when 6 then 500 when 7 then 740 when 8 then 1050 when 9 then 1450 else 1950 end);
  insert into public.mascot_skill_progression(mascot_id,skill_id,level,xp,next_level_xp) values(pet.id,target_skill_id,resolved_level,resolved_xp,public.m57_skill_next_level_xp(resolved_level))
  on conflict(mascot_id,skill_id) do update set level=excluded.level,xp=excluded.xp,next_level_xp=excluded.next_level_xp,updated_at=now();
  insert into public.mascot_individual_skill_choices(mascot_id,skill_id,free_change_used) values(pet.id,target_skill_id,transfer.prior_free_change_used)
  on conflict(mascot_id) do update set skill_id=excluded.skill_id,free_change_used=excluded.free_change_used,selected_at=now();
  update public.mascot_retired_skill_transfers set target_skill_id=resolve_retired_urban_start_transfer.target_skill_id,resolved_at=now() where mascot_id=pet.id;
end $$;
revoke all on function public.resolve_retired_urban_start_transfer(uuid,text) from public,anon;
grant execute on function public.resolve_retired_urban_start_transfer(uuid,text) to authenticated;

create or replace function public.get_mascot_skill_state(target_mascot_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare pet public.player_mascots; chosen public.mascot_individual_skill_choices; migration public.mascot_skill_migration_state; retired public.mascot_retired_skill_transfers; result jsonb; targets jsonb:='[]'::jsonb; item jsonb; target_total integer; projected_total integer; projected_level integer;
begin
  select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=public.current_profile_id();
  if pet.id is null then raise exception 'Mascot not found' using errcode='42501'; end if;
  select * into chosen from public.mascot_individual_skill_choices where mascot_id=pet.id;
  select * into migration from public.mascot_skill_migration_state where mascot_id=pet.id;
  select * into retired from public.mascot_retired_skill_transfers where mascot_id=pet.id and resolved_at is null;
  select coalesce(jsonb_agg(skill || jsonb_build_object('level',coalesce(p.level,1),'xp',coalesce(p.xp,0),'nextLevelXp',coalesce(p.next_level_xp,public.m57_skill_next_level_xp(coalesce(p.level,1))),'isSelected',case when skill->>'category'='individual' then skill->>'id'=chosen.skill_id else true end) order by skill->>'id'),'[]'::jsonb)
    into result from jsonb_array_elements(pet.skills) skill left join public.mascot_skill_progression p on p.mascot_id=pet.id and p.skill_id=skill->>'id';
  if retired.mascot_id is not null then
    for item in select value from jsonb_array_elements(pet.skills) where value->>'id' in ('skill-trovao-solar-wing','skill-trovao-aerodynamic-load') loop
      select (case coalesce(level,1) when 1 then 0 when 2 then 40 when 3 then 100 when 4 then 190 when 5 then 320 when 6 then 500 when 7 then 740 when 8 then 1050 when 9 then 1450 else 1950 end)+coalesce(xp,0) into target_total from public.mascot_skill_progression where mascot_id=pet.id and skill_id=item->>'id';
      projected_total:=coalesce(target_total,0)+retired.source_total_xp;
      projected_level:=case when projected_total>=1950 then 10 when projected_total>=1450 then 9 when projected_total>=1050 then 8 when projected_total>=740 then 7 when projected_total>=500 then 6 when projected_total>=320 then 5 when projected_total>=190 then 4 when projected_total>=100 then 3 when projected_total>=40 then 2 else 1 end;
      targets:=targets||jsonb_build_array(jsonb_build_object('skillId',item->>'id','level',projected_level,'xp',projected_total-(case projected_level when 1 then 0 when 2 then 40 when 3 then 100 when 4 then 190 when 5 then 320 when 6 then 500 when 7 then 740 when 8 then 1050 when 9 then 1450 else 1950 end),'nextLevelXp',public.m57_skill_next_level_xp(projected_level)));
    end loop;
  end if;
  return jsonb_build_object('mascotId',pet.id,'mascotLevel',pet.level,'skills',result,'chosenSkillId',chosen.skill_id,'freeChangeUsed',coalesce(chosen.free_change_used,false),'migrationPending',pet.skills @> '[{"id":"skill-nuvem-postal-memory"}]'::jsonb and migration.soft_landing_target is null,'pendingTransfer',case when retired.mascot_id is null then null else jsonb_build_object('kind','urbanStartRetired','sourceSkillId',retired.source_skill_id,'sourceTotalXp',retired.source_total_xp,'targets',targets) end);
end $$;

