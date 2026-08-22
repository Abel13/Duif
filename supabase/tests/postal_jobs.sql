begin;

do $$
begin
  if (select count(*) from public.official_postal_job_templates where status='active') <> 12 then
    raise exception 'expected twelve active postal job templates';
  end if;
  if exists (select 1 from public.official_postal_job_templates where cargo_slots not between 1 and 4) then
    raise exception 'postal job cargo contract is invalid';
  end if;
  if not exists (select 1 from pg_proc where pronamespace='public'::regnamespace and proname='dispatch_postal_job') then
    raise exception 'postal job dispatch RPC is missing';
  end if;
  if not exists (select 1 from pg_proc where pronamespace='public'::regnamespace and proname='credit_postal_job_seeds') then
    raise exception 'postal seed credit trigger function is missing';
  end if;
  if exists (select 1 from public.official_postal_job_templates where mascot_xp not in (30,75,150)) then
    raise exception 'postal job mascot XP contract is invalid';
  end if;
  if exists (
    select 1 from public.official_postal_job_templates
    group by min_mascot_level, coalesce(max_mascot_level, 100)
    having count(*) < 4
  ) then raise exception 'each job level band requires four unique templates'; end if;
end;
$$;

rollback;
