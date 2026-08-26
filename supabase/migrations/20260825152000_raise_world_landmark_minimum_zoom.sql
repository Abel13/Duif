-- Keep world landmarks out of broad regional views. Existing unlocks are preserved;
-- this changes only their presentation metadata.
update public.world_landmark_catalog
set minimum_zoom=8
where catalog_key='landmark.christ-the-redeemer'
  and minimum_zoom<8;
