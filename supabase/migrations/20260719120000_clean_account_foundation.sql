drop function if exists public.claim_current_profile();

create table public.player_data_reset_audit (
  id bigint generated always as identity primary key,
  environment text not null,
  project_ref text not null,
  operator_label text not null,
  backup_identifier text not null,
  deleted_counts jsonb not null,
  executed_at timestamptz not null default now(),
  constraint player_data_reset_audit_environment_check
    check (environment in ('local', 'remote'))
);

alter table public.player_data_reset_audit enable row level security;

comment on table public.player_data_reset_audit is
  'Append-only audit written by the administrative player-data reset runbook.';

revoke all on public.player_data_reset_audit from anon, authenticated;
