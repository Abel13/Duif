-- RLS continues to restrict reads to the authenticated owner's ledger entries.
grant select on public.seed_package_ledger to authenticated;
