begin;

\ir player_fixtures.sql

update public.profiles
set home_longitude=179.99
where id='00000000-0000-4000-8000-000000000001';

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);

do $$
declare
  first_payload jsonb;
  repeated_payload jsonb;
  replacement jsonb;
  longitude double precision;
begin
  first_payload:=public.postal_job_offer_payload('00000000-0000-4000-8000-000000000203');
  repeated_payload:=public.postal_job_offer_payload('00000000-0000-4000-8000-000000000203');
  longitude:=(first_payload#>>'{offer,destination_longitude}')::double precision;

  if longitude < -180 or longitude >= 180 then
    raise exception 'Generated longitude was not normalized: %',longitude;
  end if;
  if first_payload#>>'{offer,id}' is distinct from repeated_payload#>>'{offer,id}' then
    raise exception 'Reading an existing offer must be idempotent';
  end if;

  for replacement_number in 1..3 loop
    replacement:=public.replace_postal_job_offer('00000000-0000-4000-8000-000000000203');
    if (replacement->>'replacementsRemaining')::integer <> 3-replacement_number then
      raise exception 'Replacement count did not advance';
    end if;
  end loop;

  begin
    perform public.replace_postal_job_offer('00000000-0000-4000-8000-000000000203');
    raise exception 'A fourth replacement was accepted';
  exception when sqlstate '22023' then null;
  end;

  begin
    perform public.postal_job_offer_payload('00000000-0000-4000-8000-000000000204');
    raise exception 'A mascot owned by another profile was accepted';
  exception when sqlstate '42501' then null;
  end;
end;
$$;

reset role;
update public.postal_job_cycles
set completed_at=now()
where profile_id='00000000-0000-4000-8000-000000000001'
  and mascot_id='00000000-0000-4000-8000-000000000203'
  and completed_at is null;
update public.profiles
set home_longitude=-179.99
where id='00000000-0000-4000-8000-000000000001';

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);

do $$
declare payload jsonb; longitude double precision;
begin
  payload:=public.postal_job_offer_payload('00000000-0000-4000-8000-000000000203');
  longitude:=(payload#>>'{offer,destination_longitude}')::double precision;
  if longitude < -180 or longitude >= 180 then
    raise exception 'Negative dateline longitude was not normalized: %',longitude;
  end if;
end;
$$;

reset role;
do $$
declare
  payload jsonb;
  previous_keys text[];
  offered_key text;
  iteration integer;
begin
  perform set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
  update public.postal_job_cycles
  set completed_at=now()
  where profile_id='00000000-0000-4000-8000-000000000001'
    and mascot_id='00000000-0000-4000-8000-000000000203'
    and completed_at is null;

  for iteration in 1..9 loop
    select coalesce(array_agg(template_catalog_key),array[]::text[]) into previous_keys
    from (
      select offer.template_catalog_key
      from public.postal_job_offers offer
      join public.postal_job_cycles cycle on cycle.id=offer.cycle_id
      where cycle.mascot_id='00000000-0000-4000-8000-000000000203'
      order by offer.created_at desc,offer.id desc limit 8
    ) recent;
    payload:=public.postal_job_offer_payload('00000000-0000-4000-8000-000000000203');
    offered_key:=payload#>>'{offer,template_catalog_key}';
    if offered_key=any(previous_keys) then
      raise exception 'offer % repeated one of the eight most recent templates',offered_key;
    end if;
    update public.postal_job_cycles
    set completed_at=now()
    where profile_id='00000000-0000-4000-8000-000000000001'
      and mascot_id='00000000-0000-4000-8000-000000000203'
      and completed_at is null;
  end loop;
end;
$$;

select set_config('request.jwt.claim.sub','',true);
do $$
begin
  perform public.postal_job_offer_payload('00000000-0000-4000-8000-000000000203');
  raise exception 'An unauthenticated offer request was accepted';
exception when sqlstate '28000' then null;
end;
$$;

rollback;
