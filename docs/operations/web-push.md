# Operação de Web Push (loop postal)

DUIF envia avisos pelo **VAPID direto** (sem provedor terceirizado). O banco enfileira eventos
idempotentes; a Edge Function `push-dispatch` entrega via Web Push.

## Secrets

Configure no Vault e nos secrets da função:

| Vault / Edge | Uso |
|---|---|
| `duif_project_url` | URL do projeto (já usada por outros crons) |
| `duif_push_dispatch_cron_secret` | Mesmo valor de `PUSH_DISPATCH_CRON_SECRET` (≥ 32 bytes) |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Par VAPID (`npx web-push generate-vapid-keys`) |
| `VAPID_SUBJECT` | Ex.: `mailto:ops@duif.app` |

No cliente (Vercel / `.env`), exponha **somente** a chave pública:

```sh
VITE_VAPID_PUBLIC_KEY=...
```

Nunca publique a chave privada em variáveis `VITE_*`.

## Cron

`duif-push-dispatch` roda a cada minuto: `enqueue_postal_push_events` e depois
`POST /functions/v1/push-dispatch` com `X-Duif-Cron-Secret`. A função tem `verify_jwt = false` e
permanece protegida pelo segredo dedicado.

## Publicação

```sh
supabase db push --linked
supabase functions deploy push-dispatch --project-ref <ref>
```

Rotacione VAPID gerando um novo par, atualizando Edge + `VITE_VAPID_PUBLIC_KEY`, e pedindo novo
opt-in nos aparelhos (subscriptions antigas deixam de validar).

## Privacidade

Payloads usam só título/corpo genéricos e deep links `/mailbox`, `/map` ou `/nest`. Remetente
surpresa, texto da carta, coordenadas e trilha nunca entram na notificação.
