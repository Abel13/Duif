begin;

do $$
declare
  pack_definition text := pg_get_functiondef('public.purchase_christmas_postcard_pack(uuid)'::regprocedure);
  individual_definition text := pg_get_functiondef('public.purchase_seasonal_postcard(text,uuid)'::regprocedure);
begin
  if (select count(*) from public.official_postcards where catalog_key like 'postcard-seasonal-%') <> 11 then
    raise exception 'expected eleven seasonal postcards';
  end if;
  if exists (
    select 1 from public.official_postcards
    where catalog_key in (
      'postcard-seasonal-christmas-cottage', 'postcard-seasonal-christmas-table', 'postcard-seasonal-christmas-mailbox',
      'postcard-seasonal-newyear-beach', 'postcard-seasonal-newyear-andes', 'postcard-seasonal-newyear-buenos-aires'
    ) and name_key not like 'officialPostcards.%'
  ) then
    raise exception 'seasonal postcard labels were not corrected';
  end if;
  if (select count(*) from public.official_asset_versions version_row join public.official_assets asset on asset.id = version_row.asset_id where asset.asset_key in (
    'postcard.seasonal.christmasCottage.front', 'postcard.seasonal.christmasTable.front', 'postcard.seasonal.christmasMailbox.front',
    'postcard.seasonal.newYearBeach.front', 'postcard.seasonal.newYearAndes.front', 'postcard.seasonal.newYearBuenosAires.front'
  ) and version_row.version = 2 and version_row.status = 'active') <> 6 then
    raise exception 'corrected postcard assets need active replacement versions';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.seasonal_postcard_individual_purchases'::regclass) then
    raise exception 'individual postcard purchases require RLS';
  end if;
  if position('balance < 100' in pack_definition) = 0 or position('balance < 10' in individual_definition) = 0 then
    raise exception 'seasonal postcard prices are incorrect';
  end if;
end $$;

rollback;
