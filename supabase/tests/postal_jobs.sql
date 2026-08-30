begin;

do $$
begin
  if (select count(*) from public.official_postal_job_templates where status='active') <> 80 then
    raise exception 'expected eighty active postal job templates';
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
  if (select count(*) from public.official_postal_job_templates where status='active' and min_mascot_level=1 and max_mascot_level=4) <> 24
    or (select count(*) from public.official_postal_job_templates where status='active' and min_mascot_level=5 and max_mascot_level=9) <> 40
    or (select count(*) from public.official_postal_job_templates where status='active' and min_mascot_level=10 and max_mascot_level is null) <> 16
  then raise exception 'postal job catalog bands are not 24/40/16'; end if;

  if (select array_agg(public.progression_next_level_xp('mascot',level) order by level) from generate_series(1,20) as levels(level))
      <> array[34,85,147,216,293,375,463,558,662,780,915,1076,1274,1524,1847,2268,2819,3541,4483,5707] then
    raise exception 'mascot early progression curve is invalid';
  end if;
  if public.progression_next_level_xp('mascot',20) <> ceil(100*power(20::numeric,1.35))::integer
    or public.progression_next_level_xp('mascot',21) <> ceil(100*power(21::numeric,1.35))::integer then
    raise exception 'mascot curve no longer connects to the legacy formula';
  end if;
end;
$$;

do $$
declare level_value integer:=1; xp_value integer:=0; jobs integer:=0; reward integer;
begin
  while level_value<10 loop
    reward:=case when level_value<=4 then 30 else 75 end;
    xp_value:=xp_value+reward; jobs:=jobs+1;
    while xp_value>=public.progression_next_level_xp('mascot',level_value) loop
      xp_value:=xp_value-public.progression_next_level_xp('mascot',level_value);
      level_value:=level_value+1;
    end loop;
  end loop;
  if jobs<>48 then raise exception 'a neutral mascot reached level 10 in % jobs, expected 48',jobs; end if;
end;
$$;

do $$
declare sample record; legacy_total integer; resolved_level integer; resolved_xp integer; rebuilt_total integer; level_index integer;
begin
  for sample in select * from (values (1,0),(9,220),(37,1000)) as samples(level,xp) loop
    legacy_total:=sample.xp;
    for level_index in 1..sample.level-1 loop
      legacy_total:=legacy_total+ceil(100*power(level_index::numeric,1.35))::integer;
    end loop;

    resolved_level:=1; resolved_xp:=legacy_total;
    while resolved_xp>=public.progression_next_level_xp('mascot',resolved_level) loop
      resolved_xp:=resolved_xp-public.progression_next_level_xp('mascot',resolved_level);
      resolved_level:=resolved_level+1;
    end loop;

    rebuilt_total:=resolved_xp;
    for level_index in 1..resolved_level-1 loop
      rebuilt_total:=rebuilt_total+public.progression_next_level_xp('mascot',level_index);
    end loop;
    if rebuilt_total<>legacy_total or resolved_xp>=public.progression_next_level_xp('mascot',resolved_level) then
      raise exception 'legacy mascot progress was not represented exactly for level %',sample.level;
    end if;
  end loop;
end;
$$;

rollback;
