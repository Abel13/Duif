insert into public.official_translation_keys(translation_key)
values('send.postalFinishing.defaultStamp') on conflict(translation_key) do nothing;

insert into public.official_assets(asset_key,asset_type)
values('stamp.default.front','collectibleThumbnail') on conflict(asset_key) do nothing;

update public.official_asset_versions v set status='archived'
from public.official_assets a where a.id=v.asset_id and a.asset_key='stamp.default.front' and v.status='active';

insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author)
select a.id,1,'packaged','active','/assets/stamps/duif-default.webp','image/webp',172,256,23532,'send.postalFinishing.defaultStamp',false,'DUIF'
from public.official_assets a where a.asset_key='stamp.default.front';
