-- Keep the economy in one authoritative migration: a faster early flight curve,
-- a larger official-job catalog, and per-mascot offer history.

create or replace function public.progression_next_level_xp(curve text, current_level integer)
returns integer language sql immutable set search_path=public as $$
  select case curve
    when 'reputation' then ceil(150*power(current_level::numeric,1.45))::integer
    when 'mascot' then case current_level
      when 1 then 34 when 2 then 85 when 3 then 147 when 4 then 216 when 5 then 293
      when 6 then 375 when 7 then 463 when 8 then 558 when 9 then 662 when 10 then 780
      when 11 then 915 when 12 then 1076 when 13 then 1274 when 14 then 1524 when 15 then 1847
      when 16 then 2268 when 17 then 2819 when 18 then 3541 when 19 then 4483 when 20 then 5707
      else ceil(100*power(current_level::numeric,1.35))::integer
    end
    when 'skill' then case current_level
      when 1 then 40 when 2 then 60 when 3 then 90 when 4 then 130 when 5 then 180
      when 6 then 240 when 7 then 310 when 8 then 400 when 9 then 500 else 500
    end
  end
$$;

-- Convert persisted mascot state from the old implied total into the new curve.
-- This only changes flight-level representation; no reward ledger is touched.
do $$
declare pet record; legacy_total integer; resolved_level integer; resolved_xp integer; level_index integer;
begin
  for pet in select id,level,xp from public.player_mascots for update loop
    legacy_total:=pet.xp;
    if pet.level>1 then
      for level_index in 1..pet.level-1 loop
        legacy_total:=legacy_total+ceil(100*power(level_index::numeric,1.35))::integer;
      end loop;
    end if;
    resolved_level:=1;
    resolved_xp:=legacy_total;
    while resolved_xp>=public.progression_next_level_xp('mascot',resolved_level) loop
      resolved_xp:=resolved_xp-public.progression_next_level_xp('mascot',resolved_level);
      resolved_level:=resolved_level+1;
    end loop;
    update public.player_mascots
    set level=resolved_level,xp=resolved_xp,next_level_xp=public.progression_next_level_xp('mascot',resolved_level),updated_at=now()
    where id=pet.id;
  end loop;

  -- Starter level and XP are intentional archetype values. Keep them intact
  -- while preventing the displayed next target from being below current XP.
  update public.mascot_templates
  set next_level_xp=greatest(public.progression_next_level_xp('mascot',base_level),base_xp+1)
  where status='active';
end $$;

insert into public.official_postal_job_templates
  (catalog_key,contact_catalog_key,title_key,description_key,cargo_key,min_mascot_level,max_mascot_level,min_distance_km,max_distance_km,cargo_slots,seed_reward,mascot_xp,sort_order)
values
  ('job-farol-mare','job-contact-farol','postalJobs.templates.farolMare.title','postalJobs.templates.farolMare.description','postalJobs.cargo.lens',1,4,5,15,1,20,30,101),
  ('job-farol-oleo','job-contact-farol','postalJobs.templates.farolOleo.title','postalJobs.templates.farolOleo.description','postalJobs.cargo.lens',1,4,5,15,1,20,30,102),
  ('job-farol-sino','job-contact-farol','postalJobs.templates.farolSino.title','postalJobs.templates.farolSino.description','postalJobs.cargo.signal',1,4,5,15,1,20,30,103),
  ('job-farol-caderno','job-contact-farol','postalJobs.templates.farolCaderno.title','postalJobs.templates.farolCaderno.description','postalJobs.cargo.lens',1,4,5,15,1,20,30,104),
  ('job-farol-bandeiras','job-contact-farol','postalJobs.templates.farolBandeiras.title','postalJobs.templates.farolBandeiras.description','postalJobs.cargo.signal',1,4,5,15,1,20,30,105),
  ('job-farol-lanterna','job-contact-farol','postalJobs.templates.farolLanterna.title','postalJobs.templates.farolLanterna.description','postalJobs.cargo.lens',1,4,5,15,1,20,30,106),
  ('job-farol-registro','job-contact-farol','postalJobs.templates.farolRegistro.title','postalJobs.templates.farolRegistro.description','postalJobs.cargo.signal',1,4,5,15,1,20,30,107),
  ('job-farol-fosforos','job-contact-farol','postalJobs.templates.farolFosforos.title','postalJobs.templates.farolFosforos.description','postalJobs.cargo.lens',1,4,5,15,1,20,30,108),
  ('job-farol-postal','job-contact-farol','postalJobs.templates.farolPostal.title','postalJobs.templates.farolPostal.description','postalJobs.cargo.signal',1,4,5,15,1,20,30,109),
  ('job-farol-espelho','job-contact-farol','postalJobs.templates.farolEspelho.title','postalJobs.templates.farolEspelho.description','postalJobs.cargo.lens',1,4,5,15,1,20,30,110),
  ('job-horta-composto','job-contact-horta','postalJobs.templates.hortaComposto.title','postalJobs.templates.hortaComposto.description','postalJobs.cargo.seeds',1,4,5,15,2,20,30,111),
  ('job-horta-regadores','job-contact-horta','postalJobs.templates.hortaRegadores.title','postalJobs.templates.hortaRegadores.description','postalJobs.cargo.seedlings',1,4,5,15,2,20,30,112),
  ('job-horta-fitas','job-contact-horta','postalJobs.templates.hortaFitas.title','postalJobs.templates.hortaFitas.description','postalJobs.cargo.seeds',1,4,5,15,2,20,30,113),
  ('job-horta-calendario','job-contact-horta','postalJobs.templates.hortaCalendario.title','postalJobs.templates.hortaCalendario.description','postalJobs.cargo.seedlings',1,4,5,15,2,20,30,114),
  ('job-horta-placas','job-contact-horta','postalJobs.templates.hortaPlacas.title','postalJobs.templates.hortaPlacas.description','postalJobs.cargo.seeds',1,4,5,15,2,20,30,115),
  ('job-horta-cestos','job-contact-horta','postalJobs.templates.hortaCestos.title','postalJobs.templates.hortaCestos.description','postalJobs.cargo.seedlings',1,4,5,15,2,20,30,116),
  ('job-horta-bulbos','job-contact-horta','postalJobs.templates.hortaBulbos.title','postalJobs.templates.hortaBulbos.description','postalJobs.cargo.seeds',1,4,5,15,2,20,30,117),
  ('job-horta-estufa','job-contact-horta','postalJobs.templates.hortaEstufa.title','postalJobs.templates.hortaEstufa.description','postalJobs.cargo.seedlings',1,4,5,15,2,20,30,118),
  ('job-horta-cartas','job-contact-horta','postalJobs.templates.hortaCartas.title','postalJobs.templates.hortaCartas.description','postalJobs.cargo.seeds',1,4,5,15,2,20,30,119),
  ('job-horta-sombra','job-contact-horta','postalJobs.templates.hortaSombra.title','postalJobs.templates.hortaSombra.description','postalJobs.cargo.seedlings',1,4,5,15,2,20,30,120),
  ('job-estacao-bilhetes','job-contact-estacao','postalJobs.templates.estacaoBilhetes.title','postalJobs.templates.estacaoBilhetes.description','postalJobs.cargo.timetable',5,9,15,45,2,50,75,201),
  ('job-estacao-apitos','job-contact-estacao','postalJobs.templates.estacaoApitos.title','postalJobs.templates.estacaoApitos.description','postalJobs.cargo.signals',5,9,15,45,3,50,75,202),
  ('job-estacao-etiquetas','job-contact-estacao','postalJobs.templates.estacaoEtiquetas.title','postalJobs.templates.estacaoEtiquetas.description','postalJobs.cargo.timetable',5,9,15,45,2,50,75,203),
  ('job-estacao-lanternas','job-contact-estacao','postalJobs.templates.estacaoLanternas.title','postalJobs.templates.estacaoLanternas.description','postalJobs.cargo.signals',5,9,15,45,3,50,75,204),
  ('job-estacao-chaves','job-contact-estacao','postalJobs.templates.estacaoChaves.title','postalJobs.templates.estacaoChaves.description','postalJobs.cargo.timetable',5,9,15,45,2,50,75,205),
  ('job-estacao-chegadas','job-contact-estacao','postalJobs.templates.estacaoChegadas.title','postalJobs.templates.estacaoChegadas.description','postalJobs.cargo.signals',5,9,15,45,3,50,75,206),
  ('job-estacao-medidas','job-contact-estacao','postalJobs.templates.estacaoMedidas.title','postalJobs.templates.estacaoMedidas.description','postalJobs.cargo.timetable',5,9,15,45,2,50,75,207),
  ('job-estacao-rotas','job-contact-estacao','postalJobs.templates.estacaoRotas.title','postalJobs.templates.estacaoRotas.description','postalJobs.cargo.signals',5,9,15,45,3,50,75,208),
  ('job-estacao-sinos','job-contact-estacao','postalJobs.templates.estacaoSinos.title','postalJobs.templates.estacaoSinos.description','postalJobs.cargo.timetable',5,9,15,45,2,50,75,209),
  ('job-estacao-selos','job-contact-estacao','postalJobs.templates.estacaoSelos.title','postalJobs.templates.estacaoSelos.description','postalJobs.cargo.signals',5,9,15,45,3,50,75,210),
  ('job-estacao-conexoes','job-contact-estacao','postalJobs.templates.estacaoConexoes.title','postalJobs.templates.estacaoConexoes.description','postalJobs.cargo.timetable',5,9,15,45,2,50,75,211),
  ('job-estacao-vagao','job-contact-estacao','postalJobs.templates.estacaoVagao.title','postalJobs.templates.estacaoVagao.description','postalJobs.cargo.signals',5,9,15,45,3,50,75,212),
  ('job-estacao-achados','job-contact-estacao','postalJobs.templates.estacaoAchados.title','postalJobs.templates.estacaoAchados.description','postalJobs.cargo.timetable',5,9,15,45,2,50,75,213),
  ('job-estacao-relogio','job-contact-estacao','postalJobs.templates.estacaoRelogio.title','postalJobs.templates.estacaoRelogio.description','postalJobs.cargo.signals',5,9,15,45,3,50,75,214),
  ('job-estacao-cadastros','job-contact-estacao','postalJobs.templates.estacaoCadastros.title','postalJobs.templates.estacaoCadastros.description','postalJobs.cargo.timetable',5,9,15,45,2,50,75,215),
  ('job-estacao-faixa','job-contact-estacao','postalJobs.templates.estacaoFaixa.title','postalJobs.templates.estacaoFaixa.description','postalJobs.cargo.signals',5,9,15,45,3,50,75,216),
  ('job-estacao-servico','job-contact-estacao','postalJobs.templates.estacaoServico.title','postalJobs.templates.estacaoServico.description','postalJobs.cargo.timetable',5,9,15,45,2,50,75,217),
  ('job-estacao-estojo','job-contact-estacao','postalJobs.templates.estacaoEstojo.title','postalJobs.templates.estacaoEstojo.description','postalJobs.cargo.signals',5,9,15,45,3,50,75,218),
  ('job-biblioteca-atlas','job-contact-biblioteca','postalJobs.templates.bibliotecaAtlas.title','postalJobs.templates.bibliotecaAtlas.description','postalJobs.cargo.maps',5,9,15,45,3,50,75,301),
  ('job-biblioteca-fichas','job-contact-biblioteca','postalJobs.templates.bibliotecaFichas.title','postalJobs.templates.bibliotecaFichas.description','postalJobs.cargo.folios',5,9,15,45,3,50,75,302),
  ('job-biblioteca-lupa','job-contact-biblioteca','postalJobs.templates.bibliotecaLupa.title','postalJobs.templates.bibliotecaLupa.description','postalJobs.cargo.maps',5,9,15,45,3,50,75,303),
  ('job-biblioteca-consulta','job-contact-biblioteca','postalJobs.templates.bibliotecaConsulta.title','postalJobs.templates.bibliotecaConsulta.description','postalJobs.cargo.folios',5,9,15,45,3,50,75,304),
  ('job-biblioteca-emprestimos','job-contact-biblioteca','postalJobs.templates.bibliotecaEmprestimos.title','postalJobs.templates.bibliotecaEmprestimos.description','postalJobs.cargo.maps',5,9,15,45,3,50,75,305),
  ('job-biblioteca-marcadores','job-contact-biblioteca','postalJobs.templates.bibliotecaMarcadores.title','postalJobs.templates.bibliotecaMarcadores.description','postalJobs.cargo.folios',5,9,15,45,3,50,75,306),
  ('job-biblioteca-indice','job-contact-biblioteca','postalJobs.templates.bibliotecaIndice.title','postalJobs.templates.bibliotecaIndice.description','postalJobs.cargo.maps',5,9,15,45,3,50,75,307),
  ('job-biblioteca-restauro','job-contact-biblioteca','postalJobs.templates.bibliotecaRestauro.title','postalJobs.templates.bibliotecaRestauro.description','postalJobs.cargo.folios',5,9,15,45,3,50,75,308),
  ('job-biblioteca-rotas','job-contact-biblioteca','postalJobs.templates.bibliotecaRotas.title','postalJobs.templates.bibliotecaRotas.description','postalJobs.cargo.maps',5,9,15,45,3,50,75,309),
  ('job-biblioteca-pergaminhos','job-contact-biblioteca','postalJobs.templates.bibliotecaPergaminhos.title','postalJobs.templates.bibliotecaPergaminhos.description','postalJobs.cargo.folios',5,9,15,45,3,50,75,310),
  ('job-biblioteca-estantes','job-contact-biblioteca','postalJobs.templates.bibliotecaEstantes.title','postalJobs.templates.bibliotecaEstantes.description','postalJobs.cargo.maps',5,9,15,45,3,50,75,311),
  ('job-biblioteca-doacoes','job-contact-biblioteca','postalJobs.templates.bibliotecaDoacoes.title','postalJobs.templates.bibliotecaDoacoes.description','postalJobs.cargo.folios',5,9,15,45,3,50,75,312),
  ('job-biblioteca-leitura','job-contact-biblioteca','postalJobs.templates.bibliotecaLeitura.title','postalJobs.templates.bibliotecaLeitura.description','postalJobs.cargo.maps',5,9,15,45,3,50,75,313),
  ('job-biblioteca-cartas','job-contact-biblioteca','postalJobs.templates.bibliotecaCartas.title','postalJobs.templates.bibliotecaCartas.description','postalJobs.cargo.folios',5,9,15,45,3,50,75,314),
  ('job-biblioteca-selo','job-contact-biblioteca','postalJobs.templates.bibliotecaSelo.title','postalJobs.templates.bibliotecaSelo.description','postalJobs.cargo.maps',5,9,15,45,3,50,75,315),
  ('job-biblioteca-guia','job-contact-biblioteca','postalJobs.templates.bibliotecaGuia.title','postalJobs.templates.bibliotecaGuia.description','postalJobs.cargo.folios',5,9,15,45,3,50,75,316),
  ('job-biblioteca-envelopes','job-contact-biblioteca','postalJobs.templates.bibliotecaEnvelopes.title','postalJobs.templates.bibliotecaEnvelopes.description','postalJobs.cargo.maps',5,9,15,45,3,50,75,317),
  ('job-biblioteca-arquivo','job-contact-biblioteca','postalJobs.templates.bibliotecaArquivo.title','postalJobs.templates.bibliotecaArquivo.description','postalJobs.cargo.folios',5,9,15,45,3,50,75,318),
  ('job-oficina-correias','job-contact-oficina','postalJobs.templates.oficinaCorreias.title','postalJobs.templates.oficinaCorreias.description','postalJobs.cargo.parts',10,null,45,100,3,100,150,401),
  ('job-oficina-tipos','job-contact-oficina','postalJobs.templates.oficinaTipos.title','postalJobs.templates.oficinaTipos.description','postalJobs.cargo.ink',10,null,45,100,4,100,150,402),
  ('job-oficina-ferramentas','job-contact-oficina','postalJobs.templates.oficinaFerramentas.title','postalJobs.templates.oficinaFerramentas.description','postalJobs.cargo.parts',10,null,45,100,3,100,150,403),
  ('job-oficina-gravura','job-contact-oficina','postalJobs.templates.oficinaGravura.title','postalJobs.templates.oficinaGravura.description','postalJobs.cargo.ink',10,null,45,100,4,100,150,404),
  ('job-oficina-parafusos','job-contact-oficina','postalJobs.templates.oficinaParafusos.title','postalJobs.templates.oficinaParafusos.description','postalJobs.cargo.parts',10,null,45,100,3,100,150,405),
  ('job-oficina-carbono','job-contact-oficina','postalJobs.templates.oficinaCarbono.title','postalJobs.templates.oficinaCarbono.description','postalJobs.cargo.ink',10,null,45,100,4,100,150,406),
  ('job-observatorio-calendario','job-contact-observatorio','postalJobs.templates.observatorioCalendario.title','postalJobs.templates.observatorioCalendario.description','postalJobs.cargo.charts',10,null,45,100,4,100,150,501),
  ('job-observatorio-diario','job-contact-observatorio','postalJobs.templates.observatorioDiario.title','postalJobs.templates.observatorioDiario.description','postalJobs.cargo.lenses',10,null,45,100,4,100,150,502),
  ('job-observatorio-suporte','job-contact-observatorio','postalJobs.templates.observatorioSuporte.title','postalJobs.templates.observatorioSuporte.description','postalJobs.cargo.charts',10,null,45,100,4,100,150,503),
  ('job-observatorio-laminas','job-contact-observatorio','postalJobs.templates.observatorioLaminas.title','postalJobs.templates.observatorioLaminas.description','postalJobs.cargo.lenses',10,null,45,100,4,100,150,504),
  ('job-observatorio-selo','job-contact-observatorio','postalJobs.templates.observatorioSelo.title','postalJobs.templates.observatorioSelo.description','postalJobs.cargo.charts',10,null,45,100,4,100,150,505),
  ('job-observatorio-aurora','job-contact-observatorio','postalJobs.templates.observatorioAurora.title','postalJobs.templates.observatorioAurora.description','postalJobs.cargo.lenses',10,null,45,100,4,100,150,506)
on conflict (catalog_key) do update set
  title_key=excluded.title_key,description_key=excluded.description_key,cargo_key=excluded.cargo_key,
  min_mascot_level=excluded.min_mascot_level,max_mascot_level=excluded.max_mascot_level,
  min_distance_km=excluded.min_distance_km,max_distance_km=excluded.max_distance_km,cargo_slots=excluded.cargo_slots,
  seed_reward=excluded.seed_reward,mascot_xp=excluded.mascot_xp,sort_order=excluded.sort_order,status='active';

create or replace function public.postal_job_offer_payload(target_mascot_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare me uuid; pet public.player_mascots; cycle public.postal_job_cycles; offer public.postal_job_offers; template public.official_postal_job_templates; bearing double precision; angular double precision; lat double precision; lon double precision;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select profile.id into me from public.profiles profile where profile.auth_user_id=auth.uid();
  select mascot.* into pet from public.player_mascots mascot where mascot.id=target_mascot_id and mascot.owner_profile_id=me for update;
  if pet.id is null then raise exception 'Mascot not found' using errcode='42501'; end if;
  select job_cycle.* into cycle from public.postal_job_cycles job_cycle where job_cycle.profile_id=me and job_cycle.mascot_id=pet.id and job_cycle.completed_at is null for update;
  if cycle.id is null then insert into public.postal_job_cycles(profile_id,mascot_id) values(me,pet.id) returning * into cycle; end if;
  select job_offer.* into offer from public.postal_job_offers job_offer where job_offer.cycle_id=cycle.id and job_offer.status in ('offered','accepted') for update;
  if offer.id is null then
    select candidate.* into template from public.official_postal_job_templates candidate
      where candidate.status='active' and pet.level>=candidate.min_mascot_level and (candidate.max_mascot_level is null or pet.level<=candidate.max_mascot_level)
        and candidate.catalog_key not in (
          select recent.template_catalog_key from public.postal_job_offers recent
          join public.postal_job_cycles recent_cycle on recent_cycle.id=recent.cycle_id
          where recent_cycle.mascot_id=pet.id
          order by recent.created_at desc,recent.id desc limit 8
        )
      order by md5(candidate.catalog_key||cycle.id::text) limit 1;
    if template.catalog_key is null then
      select candidate.* into template from public.official_postal_job_templates candidate
        where candidate.status='active' and pet.level>=candidate.min_mascot_level and (candidate.max_mascot_level is null or pet.level<=candidate.max_mascot_level)
        order by md5(candidate.catalog_key||cycle.id::text) limit 1;
    end if;
    if template.catalog_key is null then raise exception 'No postal job is available' using errcode='22023'; end if;
    bearing:=radians((('x'||substr(md5(cycle.id::text||template.catalog_key),1,8))::bit(32)::bigint % 360 + 360) % 360);
    angular:=((template.min_distance_km+template.max_distance_km)/2)/6371;
    select degrees(asin(sin(radians(profile.home_latitude))*cos(angular)+cos(radians(profile.home_latitude))*sin(angular)*cos(bearing))) into lat from public.profiles profile where profile.id=me;
    select degrees(radians(profile.home_longitude)+atan2(sin(bearing)*sin(angular)*cos(radians(profile.home_latitude)),cos(angular)-sin(radians(profile.home_latitude))*sin(radians(lat)))) into lon from public.profiles profile where profile.id=me;
    lon:=mod((lon+540)::numeric,360::numeric)::double precision-180;
    insert into public.postal_job_offers(cycle_id,template_catalog_key,destination_latitude,destination_longitude,distance_km)
      values(cycle.id,template.catalog_key,lat,lon,round(((template.min_distance_km+template.max_distance_km)/2)::numeric,2)) returning * into offer;
  end if;
  select selected.* into template from public.official_postal_job_templates selected where selected.catalog_key=offer.template_catalog_key;
  return jsonb_build_object('offer',to_jsonb(offer),'template',to_jsonb(template),'replacementsRemaining',3-cycle.replacement_count);
end $$;

revoke all on function public.postal_job_offer_payload(uuid) from public,anon;
grant execute on function public.postal_job_offer_payload(uuid) to authenticated;
