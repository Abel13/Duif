-- Publish the reviewed raster replacements without mutating historical Registry rows.

insert into public.official_assets(asset_key,asset_type) values
  ('nest.artwork.availableJobs','nestArtwork')
on conflict(asset_key) do nothing;

update public.official_asset_versions version
set status='archived'
from public.official_assets asset
where asset.id=version.asset_id
  and version.status='active'
  and asset.asset_key in (
    'shop.thumbnail.sunnyRouteSticker','shop.thumbnail.lanternFestivalPostcard',
    'shop.thumbnail.coastalTownPostcard','shop.thumbnail.brassNestPlaque',
    'shop.thumbnail.blueEnvelopeSticker','shop.thumbnail.airmailProfileRibbon',
    'reward.thumbnail.wornRouteStamp','reward.thumbnail.goldenCompassPin',
    'reward.thumbnail.blueAirmailLabel','reward.thumbnail.atlanticBadge',
    'mascot.portrait.aurora','mascot.portrait.maple','mascot.portrait.bento',
    'mascot.portrait.oliva','currency.icon.seed','currency.icon.crystal'
  );

update public.official_assets
set asset_type='postcardArtwork'
where asset_key in (
  'shop.thumbnail.lanternFestivalPostcard',
  'shop.thumbnail.coastalTownPostcard'
);

insert into public.official_asset_versions(
  asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,
  alt_text_key,is_decorative,author,metadata
)
select asset.id,entry.version,'packaged','active',entry.path,'image/webp',
  entry.width,entry.height,entry.bytes,entry.alt_key,entry.decorative,'DUIF',entry.metadata
from (values
  ('shop.thumbnail.sunnyRouteSticker',2,'/assets/shop/thumbnails/sunny-route-sticker.webp',256,256,8888,'shop.items.sunnyRouteSticker.name',false,jsonb_build_object('background','transparent','kind','shopArtwork','format','sticker')),
  ('shop.thumbnail.lanternFestivalPostcard',2,'/assets/shop/thumbnails/lantern-festival-postcard.webp',1200,800,257772,'shop.items.lanternFestivalPostcard.name',false,jsonb_build_object('aspectRatio','3:2','kind','postcardArtwork')),
  ('shop.thumbnail.coastalTownPostcard',2,'/assets/shop/thumbnails/coastal-town-postcard.webp',1200,800,202726,'shop.items.coastalTownPostcard.name',false,jsonb_build_object('aspectRatio','3:2','kind','postcardArtwork')),
  ('shop.thumbnail.brassNestPlaque',2,'/assets/shop/thumbnails/brass-nest-plaque.webp',256,256,17400,'shop.items.brassNestPlaque.name',false,jsonb_build_object('background','transparent','kind','shopArtwork','format','nestOrnament')),
  ('shop.thumbnail.blueEnvelopeSticker',2,'/assets/shop/thumbnails/blue-envelope-sticker.webp',256,256,15206,'shop.items.blueEnvelopeSticker.name',false,jsonb_build_object('background','transparent','kind','shopArtwork','format','sticker')),
  ('shop.thumbnail.airmailProfileRibbon',2,'/assets/shop/thumbnails/airmail-profile-ribbon.webp',256,256,13792,'shop.items.airmailProfileRibbon.name',false,jsonb_build_object('background','transparent','kind','shopArtwork','format','profileFrame')),
  ('reward.thumbnail.wornRouteStamp',2,'/assets/items/thumbnails/worn-route-stamp.webp',256,256,18194,'rewards.items.wornRouteStamp.name',false,jsonb_build_object('background','transparent','kind','rewardThumbnail','format','stamp')),
  ('reward.thumbnail.goldenCompassPin',2,'/assets/items/thumbnails/golden-compass-pin.webp',256,256,13846,'rewards.items.goldenCompassPin.name',false,jsonb_build_object('background','transparent','kind','rewardThumbnail','format','stamp','rarity','rare')),
  ('reward.thumbnail.blueAirmailLabel',2,'/assets/items/thumbnails/blue-airmail-label.webp',256,256,15038,'rewards.items.blueAirmailLabel.name',false,jsonb_build_object('background','transparent','kind','rewardThumbnail','format','stamp','rarity','rare')),
  ('reward.thumbnail.atlanticBadge',2,'/assets/items/thumbnails/atlantic-badge.webp',256,256,23718,'map.rewards.rolandiaBadge.name',false,jsonb_build_object('background','transparent','kind','rewardThumbnail','format','stamp','rarity','rare')),
  ('mascot.portrait.aurora',2,'/assets/mascots/portraits/aurora.webp',512,512,58288,'species.carrierPigeon',false,jsonb_build_object('kind','mascotPortrait','centralized',true)),
  ('mascot.portrait.maple',2,'/assets/mascots/portraits/maple.webp',640,640,59548,'species.mailDuck',false,jsonb_build_object('kind','mascotPortrait','centralized',true)),
  ('mascot.portrait.bento',2,'/assets/mascots/portraits/bento.webp',640,640,67542,'species.messengerFalcon',false,jsonb_build_object('kind','mascotPortrait','centralized',true)),
  ('mascot.portrait.oliva',2,'/assets/mascots/portraits/oliva.webp',640,640,59122,'species.mailDuck',false,jsonb_build_object('kind','mascotPortrait','centralized',true)),
  ('nest.artwork.availableJobs',1,'/assets/nest/available-jobs.webp',480,640,81312,'postalJobs.artworkAlt',false,jsonb_build_object('kind','nestArtwork','surface','availableJobs'))
) entry(asset_key,version,path,width,height,bytes,alt_key,decorative,metadata)
join public.official_assets asset on asset.asset_key=entry.asset_key
where not exists(
  select 1 from public.official_asset_versions existing
  where existing.asset_id=asset.id and existing.version=entry.version
);

update public.reward_items
set rarity='rare'
where catalog_key='reward-blue-airmail-label';

update public.reward_items
set rarity='rare',thumbnail_asset_key='reward.thumbnail.atlanticBadge'
where catalog_key='reward-rolandia-badge';

update public.route_reward_points
set inventory_category='stamps'
where reward_item_id in (
  select id from public.reward_items
  where catalog_key in ('reward-blue-airmail-label','reward-golden-compass-pin','reward-rolandia-badge')
);

update public.inventory_items inventory
set rarity=reward.rarity,
    category=case
      when reward.catalog_key in ('reward-worn-route-stamp','reward-blue-airmail-label','reward-golden-compass-pin','reward-rolandia-badge')
        then 'stamps'::public.inventory_category
      else inventory.category
    end,
    thumbnail_asset_key=reward.thumbnail_asset_key
from public.reward_items reward
where reward.id=inventory.reward_item_id
  and reward.catalog_key in ('reward-worn-route-stamp','reward-blue-airmail-label','reward-golden-compass-pin','reward-rolandia-badge');
