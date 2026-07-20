create unique index account_onboarding_display_name_unique_idx
  on public.account_onboarding (lower(display_name))
  where display_name is not null;

comment on index public.account_onboarding_display_name_unique_idx is
  'Reserves normalized player display names case-insensitively during onboarding.';
