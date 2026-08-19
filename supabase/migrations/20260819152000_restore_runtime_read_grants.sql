-- RLS decides which rows are visible; these grants restore the runtime's ability
-- to issue the reads guarded by those policies after a local database rebuild.
grant select on public.profiles to authenticated;
grant select on public.official_assets, public.official_asset_versions to anon, authenticated;
