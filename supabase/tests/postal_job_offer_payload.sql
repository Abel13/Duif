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

select set_config('request.jwt.claim.sub','',true);
do $$
begin
  perform public.postal_job_offer_payload('00000000-0000-4000-8000-000000000203');
  raise exception 'An unauthenticated offer request was accepted';
exception when sqlstate '28000' then null;
end;
$$;

rollback;
