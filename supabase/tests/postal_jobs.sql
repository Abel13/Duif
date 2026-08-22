begin;

do $$
begin
  if (select count(*) from public.official_postal_job_templates where status='active') <> 6 then
    raise exception 'expected six active postal job templates';
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
end;
$$;

rollback;
