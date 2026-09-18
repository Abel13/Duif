-- Expiring an offered/accepted exclusive mission used to violate the table
-- checks because they required copy and destination to be null whenever status
-- was not offered/accepted/departed. Expired rows must keep published payload.

alter table public.exclusive_postal_missions
  drop constraint if exists exclusive_postal_missions_check;
alter table public.exclusive_postal_missions
  drop constraint if exists exclusive_postal_missions_check1;

alter table public.exclusive_postal_missions
  add constraint exclusive_postal_missions_copy_by_status_check check (
    (status = 'pending' and copy is null)
    or (status in ('offered', 'accepted', 'departed') and copy is not null)
    or (status = 'expired')
  );

alter table public.exclusive_postal_missions
  add constraint exclusive_postal_missions_destination_by_status_check check (
    (
      status = 'pending'
      and destination_geoname_id is null
      and destination_name is null
      and destination_country_code is null
      and destination_latitude is null
      and destination_longitude is null
      and distance_km is null
    )
    or (
      status in ('offered', 'accepted', 'departed')
      and destination_geoname_id is not null
      and destination_name is not null
      and destination_country_code is not null
      and destination_latitude is not null
      and destination_longitude is not null
      and distance_km is not null
    )
    or (status = 'expired')
  );
