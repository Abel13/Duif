# DUIF authentication email templates

Standalone HTML templates for Supabase Authentication. The source language is `pt-BR`; matching
`en-US` files are kept ready for a future localized Send Email Hook.

## Dashboard mapping

| Supabase template | File | Suggested subject (`pt-BR` / `en-US`) |
| --- | --- | --- |
| Confirm sign up | `confirm-signup.html` | `Confirme seu endereço postal no DUIF` / `Confirm your DUIF postal address` |
| Invite user | `invite-user.html` | `Você recebeu um convite para o DUIF` / `You have been invited to DUIF` |
| Magic link or OTP | `magic-link-or-otp.html` | `Seu acesso postal ao DUIF` / `Your postal sign-in to DUIF` |
| Change email address | `change-email-address.html` | `Confirme seu novo e-mail no DUIF` / `Confirm your new DUIF email` |
| Reset password | `reset-password.html` | `Redefina sua senha do DUIF` / `Reset your DUIF password` |
| Reauthentication | `reauthentication.html` | `Código de segurança do DUIF` / `Your DUIF security code` |

Paste the HTML from the selected locale into Authentication → Email Templates. Production uses
`pt-BR` until a Send Email Hook selects a locale from trusted account metadata. Do not choose a
template based on an untrusted URL parameter.

The templates use Supabase variables exactly as supplied by Auth:

- `{{ .ConfirmationURL }}` for action links;
- `{{ .Token }}` for one-time codes;
- `{{ .NewEmail }}` for the requested new address;
- `{{ .SiteURL }}` for the hosted DUIF icon.

Keep the production Site URL and redirect allowlist accurate. Always send test messages for all
six actions after changing SMTP, domain, or templates.
