-- The minimum-detail IBGE meshes can contain degenerate micro-polygons. Preserve
-- every valid polygonal component while removing zero-area shells deterministically.
update public.brazil_state_boundaries
set geometry=extensions.st_multi(extensions.st_collectionextract(
  extensions.st_makevalid(geometry),3
))
where not extensions.st_isvalid(geometry);

alter table public.brazil_state_boundaries
  add constraint brazil_state_boundaries_valid_geometry
  check(extensions.st_isvalid(geometry));
