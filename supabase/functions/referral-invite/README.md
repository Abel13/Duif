# Referral invitation function

Set `REFERRAL_INVITE_SIGNING_SECRET` to a random value of at least 32 characters before serving or deploying this function. The secret signs the opaque invitation payload and must be shared by every deployment serving the same database.

The browser calls `resolve` without authentication and uses `issue`, `rotate`, and `capture` with the authenticated Supabase session. The function does not return an inviter's profile, location, email, or invitee list.
