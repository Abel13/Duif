create or replace function public.generate_postal_friend_code()
returns text language plpgsql volatile set search_path=public,extensions as $$
declare alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; result text := ''; index_value integer;
begin
  for index_value in 1..8 loop
    result := result || substr(alphabet, (get_byte(extensions.gen_random_bytes(1), 0) % length(alphabet)) + 1, 1);
  end loop;
  return result;
end;
$$;

revoke all on function public.generate_postal_friend_code(), public.current_profile_for_postal_friendship() from public;
