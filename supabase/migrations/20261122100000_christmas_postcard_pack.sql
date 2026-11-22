-- Seasonal, seed-funded postcard collection. Availability is resolved server-side from the private nest.
create table public.seasonal_postcard_pack_purchases (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  season_year integer not null check (season_year >= 2026),
  request_id uuid not null,
  purchased_at timestamptz not null default now(),
  primary key (profile_id, season_year),
  unique (profile_id, request_id)
);
alter table public.seasonal_postcard_pack_purchases enable row level security;
revoke all on public.seasonal_postcard_pack_purchases from public, anon, authenticated;

insert into public.official_translation_keys(translation_key) values
 ('officialPostcards.christmasTree.name'),('officialPostcards.christmasFeast.name'),('officialPostcards.christmasGifts.name'),('officialPostcards.christmasCarols.name'),('officialPostcards.christmasSleigh.name'),
 ('officialPostcards.christmasTree.description'),('officialPostcards.christmasFeast.description'),('officialPostcards.christmasGifts.description'),('officialPostcards.christmasCarols.description'),('officialPostcards.christmasSleigh.description'),
 ('officialPostcards.christmasTree.alt'),('officialPostcards.christmasFeast.alt'),('officialPostcards.christmasGifts.alt'),('officialPostcards.christmasCarols.alt'),('officialPostcards.christmasSleigh.alt')
on conflict do nothing;

insert into public.official_assets(asset_key,asset_type) values
 ('postcard.seasonal.christmasTree.front','postcardArtwork'),('postcard.seasonal.christmasFeast.front','postcardArtwork'),('postcard.seasonal.christmasGifts.front','postcardArtwork'),('postcard.seasonal.christmasCarols.front','postcardArtwork'),('postcard.seasonal.christmasSleigh.front','postcardArtwork')
on conflict do nothing;
insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
select asset.id,1,'packaged','active',v.path,'image/webp',1023,682,v.bytes,v.alt_key,false,'DUIF · OpenAI ImageGen',jsonb_build_object('kind','postcardArtwork','seasonal','christmas','provenance',jsonb_build_object('tool','OpenAI ImageGen','origin','AI-assisted original illustration'))
from (values
 ('postcard.seasonal.christmasTree.front','/assets/postcards/seasonal/christmas-tree.webp',183898,'officialPostcards.christmasTree.alt'),
 ('postcard.seasonal.christmasFeast.front','/assets/postcards/seasonal/christmas-feast.webp',179900,'officialPostcards.christmasFeast.alt'),
 ('postcard.seasonal.christmasGifts.front','/assets/postcards/seasonal/christmas-gifts.webp',183196,'officialPostcards.christmasGifts.alt'),
 ('postcard.seasonal.christmasCarols.front','/assets/postcards/seasonal/christmas-carols.webp',162580,'officialPostcards.christmasCarols.alt'),
 ('postcard.seasonal.christmasSleigh.front','/assets/postcards/seasonal/christmas-sleigh.webp',172972,'officialPostcards.christmasSleigh.alt')
) v(asset_key,path,bytes,alt_key) join public.official_assets asset on asset.asset_key=v.asset_key
on conflict(asset_id,version) do nothing;

insert into public.official_postcards(catalog_key,name_key,description_key,artwork_asset_key,availability,status,sort_order) values
 ('postcard-seasonal-christmas-tree','officialPostcards.christmasTree.name','officialPostcards.christmasTree.description','postcard.seasonal.christmasTree.front','paid','active',900),
 ('postcard-seasonal-christmas-feast','officialPostcards.christmasFeast.name','officialPostcards.christmasFeast.description','postcard.seasonal.christmasFeast.front','paid','active',901),
 ('postcard-seasonal-christmas-gifts','officialPostcards.christmasGifts.name','officialPostcards.christmasGifts.description','postcard.seasonal.christmasGifts.front','paid','active',902),
 ('postcard-seasonal-christmas-carols','officialPostcards.christmasCarols.name','officialPostcards.christmasCarols.description','postcard.seasonal.christmasCarols.front','paid','active',903),
 ('postcard-seasonal-christmas-sleigh','officialPostcards.christmasSleigh.name','officialPostcards.christmasSleigh.description','postcard.seasonal.christmasSleigh.front','paid','active',904)
on conflict(catalog_key) do nothing;

create or replace function public.purchase_christmas_postcard_pack(request_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare actor uuid:=public.current_profile_id(); balance integer; zone text; local_date date; season integer; card_key text;
begin
 if actor is null then raise exception 'Authentication required' using errcode='28000'; end if;
 select public.postal_timezone_at(home_latitude,home_longitude) into zone from public.profiles where id=actor;
 local_date:=(now() at time zone coalesce(zone,'UTC'))::date;
 if extract(month from local_date) not in (12,1) or (extract(month from local_date)=1 and extract(day from local_date)>6) then raise exception 'Christmas collection unavailable' using errcode='22023'; end if;
 season:=case when extract(month from local_date)=12 then extract(year from local_date)::int else extract(year from local_date)::int-1 end;
 if exists(select 1 from public.seasonal_postcard_pack_purchases where profile_id=actor and request_id=purchase_christmas_postcard_pack.request_id) then return jsonb_build_object('idempotent',true); end if;
 if exists(select 1 from public.seasonal_postcard_pack_purchases where profile_id=actor and season_year=season) then raise exception 'Christmas collection already purchased' using errcode='P0001'; end if;
 insert into public.profile_seed_balances(profile_id,quantity) values(actor,0) on conflict do nothing;
 select quantity into balance from public.profile_seed_balances where profile_id=actor for update;
 if balance<10 then raise exception 'Insufficient Seeds' using errcode='P0001'; end if;
 update public.profile_seed_balances set quantity=quantity-10,updated_at=now() where profile_id=actor;
 foreach card_key in array array['postcard-seasonal-christmas-tree','postcard-seasonal-christmas-feast','postcard-seasonal-christmas-gifts','postcard-seasonal-christmas-carols','postcard-seasonal-christmas-sleigh','postcard-seasonal-christmas-cottage','postcard-seasonal-christmas-table','postcard-seasonal-christmas-mailbox','postcard-seasonal-newyear-beach','postcard-seasonal-newyear-andes','postcard-seasonal-newyear-buenos-aires'] loop
   insert into public.profile_postcard_unlocks(profile_id,postcard_catalog_key,source,unlocked_at) values(actor,card_key,'shop',now()) on conflict do nothing;
   insert into public.profile_postcard_balances(profile_id,postcard_catalog_key,quantity,updated_at) values(actor,card_key,1,now()) on conflict(profile_id,postcard_catalog_key) do update set quantity=profile_postcard_balances.quantity+1,updated_at=now();
 end loop;
 insert into public.seasonal_postcard_pack_purchases(profile_id,season_year,request_id) values(actor,season,request_id);
 return jsonb_build_object('idempotent',false,'seedBalance',balance-10,'seasonYear',season);
end $$;
revoke all on function public.purchase_christmas_postcard_pack(uuid) from public,anon;
grant execute on function public.purchase_christmas_postcard_pack(uuid) to authenticated;
