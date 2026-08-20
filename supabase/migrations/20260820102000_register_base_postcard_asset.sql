insert into public.official_assets(asset_key,asset_type)
values('postcard.base.front','postcardArtwork') on conflict(asset_key) do nothing;

update public.official_asset_versions v set status='archived'
from public.official_assets a where a.id=v.asset_id and a.asset_key='postcard.base.front' and v.status='active';

insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author)
select a.id,1,'packaged','active','/assets/postcards/duif-base.webp','image/webp',900,600,156788,'officialPostcards.base.name',false,'DUIF'
from public.official_assets a where a.asset_key='postcard.base.front';
