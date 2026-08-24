# Release e prontidão de produção

Este é o procedimento canônico para validar e publicar o DUIF. Estado de produto pertence ao
[roadmap](../product/roadmap.md) e eventos datados ao [histórico de releases](../history/releases.md).

## Princípios

- Sucesso local não implica deploy remoto.
- Push no Git ou deploy na Vercel não aplica migrations, publica Edge Functions nem configura secrets.
- Sempre confira o projeto Supabase vinculado e a lista remota de migrations antes de escrever.
- Reset de dados nunca faz parte de release; use o [runbook específico](./player-data-reset.md).

## Validação local

```sh
npm test
npm run build
scripts/verify-production-readiness.sh \
  --db-url "postgresql://postgres:postgres@127.0.0.1:56322/postgres"
git diff --check
```

Todos os testes SQL de prontidão são transacionais e terminam com `ROLLBACK`.

## Publicação do backend

1. Confira o projeto vinculado e `supabase migration list --linked`.
2. Aplique migrations pendentes com `supabase db push --linked`.
3. Publique somente as Edge Functions alteradas ou afetadas por novas dependências.
4. Para o clima, configure `WEATHER_RESOLVER_CRON_SECRET` na função e o mesmo valor em
   `duif_weather_resolver_cron_secret` no Vault.
5. Publique o resolver climático com:

```sh
supabase functions deploy weather-travel-resolver \
  --project-ref zeuzkzfefulpqafchcsy \
  --no-verify-jwt
```

Os runbooks de [assets](./asset-studio.md), [GeoNames](./geonames.md) e
[viagens/clima](./segmented-travel-weather.md) contêm verificações próprias.

## Configuração da aplicação

- Configure redirects HTTPS, PKCE, SMTP e templates localizados.
- Preserve rotação de refresh token, duração de JWT e rate limits.
- Use `VITE_DUIF_REQUIRE_PWA_INSTALL=true` somente no ambiente web de produção.
- Nunca coloque `service_role`, credenciais de banco ou secrets de cron em variáveis Vite.

## Verificação pós-deploy

- Execute os fluxos essenciais de conta, onboarding, envio, viagem, coleta e administração.
- Verifique logs e erros seguros das Edge Functions alteradas.
- Para Open-Meteo, exija HTTP `200`, `applied > 0`, `failed = 0`, `circuitOpen = false`,
  `fallback = false` e cache recente com `source = 'openMeteo'`.
- Registre data, migration head e resultado em [history/releases.md](../history/releases.md).

## Recuperação

Não improvise rollback destrutivo. Preserve migrations aplicadas, crie correções posteriores e use
os runbooks especializados. Operações sobre dados de jogadores exigem alvo allowlisted, backup e
aprovação explícita.
