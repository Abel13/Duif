# Referral invitation function

Set `REFERRAL_INVITE_SIGNING_SECRET` to a random value of at least 32 characters before serving or deploying this function. The secret signs the opaque invitation payload and must be shared by every deployment serving the same database.

For local development, place the secret in an ignored environment file and serve the functions with `supabase functions serve --env-file <path>`. For a linked remote project, configure it with `supabase secrets set REFERRAL_INVITE_SIGNING_SECRET=...` before deploying. Never commit the secret or reuse it across unrelated environments.

The browser calls `resolve` without authentication and uses `issue`, `rotate`, and `capture` with the authenticated Supabase session. The function does not return an inviter's profile, location, email, or invitee list.
