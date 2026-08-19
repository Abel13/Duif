-- Run with: psql "$DATABASE_URL" -v admin_email='maintainer@example.com' -f supabase/admin/grant_admin_role.sql
-- This is an operator-only script. It intentionally changes app_metadata, never user_metadata.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('duif_role', 'admin'),
    updated_at = now()
where lower(email) = lower(:'admin_email')
returning id, email, raw_app_meta_data;
