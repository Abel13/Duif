insert into public.official_translation_keys(translation_key) values
  ('friends.levels.newCorrespondents'),
  ('friends.levels.frequentCorrespondents'),
  ('friends.levels.postalFriends'),
  ('friends.levels.routeCompanions'),
  ('friends.levels.lastingBond'),
  ('friends.seals.newCorrespondents.alt'),
  ('friends.seals.frequentCorrespondents.alt'),
  ('friends.seals.postalFriends.alt'),
  ('friends.seals.routeCompanions.alt'),
  ('friends.seals.lastingBond.alt'),
  ('friends.cyclesProgress'),
  ('friends.maxBond'),
  ('friends.noMascots')
on conflict do nothing;

insert into public.official_assets(asset_key,asset_type) values
  ('friendship.seal.newCorrespondents','collectibleThumbnail'),
  ('friendship.seal.frequentCorrespondents','collectibleThumbnail'),
  ('friendship.seal.postalFriends','collectibleThumbnail'),
  ('friendship.seal.routeCompanions','collectibleThumbnail'),
  ('friendship.seal.lastingBond','collectibleThumbnail')
on conflict do nothing;

insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
select a.id,1,'packaged','active',v.path,'image/webp',256,256,v.bytes,v.alt,false,'DUIF · OpenAI ImageGen',
  jsonb_build_object('kind','collectibleThumbnail','family','friendshipSeal','level',v.level,'provenance',jsonb_build_object('tool','OpenAI ImageGen','origin','AI-assisted original illustration'))
from (values
  ('friendship.seal.newCorrespondents','/assets/friendship/new-correspondents.webp',13738,'friends.seals.newCorrespondents.alt',1),
  ('friendship.seal.frequentCorrespondents','/assets/friendship/frequent-correspondents.webp',12702,'friends.seals.frequentCorrespondents.alt',2),
  ('friendship.seal.postalFriends','/assets/friendship/postal-friends.webp',14142,'friends.seals.postalFriends.alt',3),
  ('friendship.seal.routeCompanions','/assets/friendship/route-companions.webp',12928,'friends.seals.routeCompanions.alt',4),
  ('friendship.seal.lastingBond','/assets/friendship/lasting-bond.webp',14854,'friends.seals.lastingBond.alt',5)
) v(key,path,bytes,alt,level)
join public.official_assets a on a.asset_key=v.key
where not exists(select 1 from public.official_asset_versions e where e.asset_id=a.id);
