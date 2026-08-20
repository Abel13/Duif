-- RLS defines which active catalog rows are visible, while the table grant
-- allows PostgREST's public roles to execute that read in the first place.
grant select on public.correspondence_options to anon, authenticated;
