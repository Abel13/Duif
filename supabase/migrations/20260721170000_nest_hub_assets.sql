create or replace function public.validate_official_asset_version()
returns trigger language plpgsql set search_path = public as $$
declare selected_type public.official_asset_type; max_bytes integer; max_dimension integer;
begin
  select asset_type into selected_type from public.official_assets where id = new.asset_id;
  if selected_type is null then raise exception 'Unknown official asset' using errcode = '23503'; end if;
  if jsonb_typeof(new.metadata) <> 'object' or new.metadata ->> 'kind' <> selected_type::text then raise exception 'Asset metadata does not match its type' using errcode = '23514'; end if;
  if (selected_type='currencyIcon' and new.mime_type<>'image/svg+xml') or (selected_type<>'currencyIcon' and new.mime_type<>'image/webp') then raise exception 'Asset MIME type does not match its type' using errcode='23514'; end if;
  max_bytes := case selected_type when 'mascotPortrait' then 153600 when 'postcardArtwork' then 262144 when 'nestArtwork' then 81920 when 'navigationIcon' then 30720 when 'currencyIcon' then 15360 when 'texture' then 81920 else 61440 end;
  max_dimension := case selected_type when 'mascotPortrait' then 640 when 'postcardArtwork' then 1600 when 'nestArtwork' then 640 when 'texture' then 512 when 'navigationIcon' then 160 when 'currencyIcon' then 128 when 'equipmentIcon' then 192 else 256 end;
  if new.byte_size>max_bytes or new.width>max_dimension or new.height>max_dimension then raise exception 'Asset exceeds its runtime budget' using errcode='23514'; end if;
  if selected_type='postcardArtwork' and new.width*2<>new.height*3 then raise exception 'Postcard artwork must use a 3:2 ratio' using errcode='23514'; end if;
  if not new.is_decorative and not public.translation_key_is_official(new.alt_text_key) then raise exception 'Asset alt text is not fully translated' using errcode='23514'; end if;
  return new;
end $$;

insert into public.official_assets(asset_key, asset_type) values
  ('nest.artwork.profileNook','nestArtwork'),
  ('nest.artwork.mascotRoost','nestArtwork'),
  ('nest.artwork.mailbox','nestArtwork')
on conflict (asset_key) do nothing;

with versions(asset_key,path,bytes) as (values
  ('nest.artwork.profileNook','/assets/nest/profile-nook.webp',51464),
  ('nest.artwork.mascotRoost','/assets/nest/mascot-roost.webp',57304),
  ('nest.artwork.mailbox','/assets/nest/mailbox.webp',45744)
)
insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
select asset.id,1,'packaged','active',versions.path,'image/webp',480,640,versions.bytes,null,true,'DUIF',jsonb_build_object('kind','nestArtwork')
from versions join public.official_assets asset using(asset_key)
where not exists (select 1 from public.official_asset_versions current where current.asset_id=asset.id and current.version=1);
