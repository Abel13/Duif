-- RLS already limits rows to the owning profile; PostgREST also requires the table privilege.
grant select on public.inventory_items to authenticated;
