-- RLS limits delivery rows to their sender and receiver.
grant select on public.deliveries to authenticated;
