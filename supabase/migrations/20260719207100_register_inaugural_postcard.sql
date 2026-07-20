create or replace function public.validate_official_asset_version()
returns trigger language plpgsql set search_path = public as $$
declare selected_type public.official_asset_type; max_bytes integer; max_dimension integer;
begin
  select asset_type into selected_type from public.official_assets where id=new.asset_id;
  if selected_type is null then raise exception 'Unknown official asset' using errcode='23503'; end if;
  if jsonb_typeof(new.metadata)<>'object' or new.metadata->>'kind'<>selected_type::text then raise exception 'Asset metadata does not match its type' using errcode='23514'; end if;
  if new.source='packaged' and ((selected_type='currencyIcon' and new.mime_type<>'image/svg+xml') or (selected_type<>'currencyIcon' and new.mime_type<>'image/webp')) then raise exception 'Asset MIME type does not match its type' using errcode='23514'; end if;
  max_bytes:=case selected_type when 'mascotPortrait' then 153600 when 'navigationIcon' then 30720 when 'currencyIcon' then 15360 when 'texture' then 81920 when 'postcardArtwork' then 184320 else 61440 end;
  max_dimension:=case selected_type when 'postcardArtwork' then 1024 when 'mascotPortrait' then 640 when 'texture' then 512 when 'navigationIcon' then 160 when 'currencyIcon' then 128 when 'equipmentIcon' then 192 else 256 end;
  if new.byte_size>max_bytes or new.width>max_dimension or new.height>max_dimension then raise exception 'Asset exceeds its runtime budget' using errcode='23514'; end if;
  if not new.is_decorative and not public.translation_key_is_official(new.alt_text_key) then raise exception 'Asset alt text is not fully translated' using errcode='23514'; end if;
  return new;
end $$;

insert into public.official_translation_keys(translation_key) values
 ('tutorial.locations.nest'),('tutorial.locations.station'),('tutorial.locations.route'),
 ('tutorial.rewards.inauguralPostcard.name'),('tutorial.rewards.inauguralPostcard.description'),
 ('tutorial.rewards.firstRouteStamp.name'),('tutorial.rewards.firstRouteStamp.description') on conflict (translation_key) do nothing;

insert into public.official_assets(asset_key,asset_type) values
 ('postcard.inaugural.front','postcardArtwork'),('collectible.firstJourneyStamp','collectibleThumbnail') on conflict(asset_key) do nothing;
insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
select a.id,1,'packaged','active',v.path,'image/webp',v.width,v.height,v.bytes,v.alt,false,'DUIF',jsonb_build_object('kind',a.asset_type::text)
from (values
 ('postcard.inaugural.front','/assets/tutorial/postcards/inaugural-front.webp',1024,683,154572,'tutorial.rewards.inauguralPostcard.name'),
 ('collectible.firstJourneyStamp','/assets/tutorial/stamps/first-journey.webp',256,256,15988,'tutorial.rewards.firstRouteStamp.name')
) as v(key,path,width,height,bytes,alt) join public.official_assets a on a.asset_key=v.key
where not exists(select 1 from public.official_asset_versions x where x.asset_id=a.id);

update public.reward_items set thumbnail_asset_key=case catalog_key when 'reward-tutorial-inaugural-postcard' then 'postcard.inaugural.front' when 'reward-tutorial-first-route-stamp' then 'collectible.firstJourneyStamp' else thumbnail_asset_key end;
update public.inventory_items i set thumbnail_asset_key=r.thumbnail_asset_key from public.reward_items r where r.id=i.reward_item_id and r.catalog_key in ('reward-tutorial-inaugural-postcard','reward-tutorial-first-route-stamp');
