# Segmented travel and weather operations

Milestone 55 stores authoritative route detail in `delivery_route_segments`. Client code must consume only `deliveries.travel_weather_summary`; the segment table, forecast cache, regional cells and interpolated coordinates have no authenticated grants.

`weather-travel-resolver` is invoked every três horas. Configure `duif_project_url` e `duif_weather_resolver_cron_secret` no Vault; o segundo deve ter exatamente o mesmo valor de `WEATHER_RESOLVER_CRON_SECRET` nos secrets da Edge Function. Gere pelo menos 32 bytes aleatórios por ambiente (por exemplo, `openssl rand -hex 32`) e nunca reutilize a `service_role` nesse canal. Configure também `OPEN_METEO_BASE_URL` e, para uso comercial, um `OPEN_METEO_API_KEY` aprovado. Em um protótipo não comercial, o endpoint público sem chave pode ser habilitado explicitamente com `OPEN_METEO_ALLOW_PUBLIC_ENDPOINT=true`; mantenha esse segredo como `false` em uso comercial. Se configuração, autenticação, timeout, validação ou provedor falharem, os snapshots virtuais existentes continuam autoritativos e a viagem segue normalmente.

Para rotacionar a credencial, atualize primeiro `WEATHER_RESOLVER_CRON_SECRET` e imediatamente depois `duif_weather_resolver_cron_secret`. Publique a função com JWT desabilitado somente para esse endpoint; ela continua protegida pelo cabeçalho `X-Duif-Cron-Secret`. Após validar uma resposta `200` e cache `openMeteo`, remova do Vault o antigo `duif_service_role_key` se ele não tiver outro consumidor.

Quando o provedor falha, a resposta administrativa agrega somente categorias seguras em `failureReasons`: URL inválida, erro HTTP, timeout, indisponibilidade, payload inválido ou falha ao aplicar o forecast. Logs não incluem URL, célula, payload ou credenciais.

The database cron always resolves due segments, even when the Edge Function is unavailable. The Edge Function adds provider forecasts and then invokes the same idempotent resolver. Forecast writes affect only planned segments whose start is in the future. Started and completed segment snapshots are immutable by contract.

Open-Meteo data is attributed under CC BY 4.0 in provider-backed UI. Cache rows older than 30 days are removed by the resolver; completed delivery segments remain as versioned journey history.

## Daylight rules v2

Deliveries created after the daylight-v2 migration retain weather segments but use an astronomical
sunrise/sunset calculation for the virtual fallback and for live night-speed changes. The database
records private `delivery_route_daylight_windows`, checks active journeys every minute, and only
changes the active or future portion of a v2 journey. Completed segments remain immutable; journeys
created under rules version 1 are deliberately not migrated.

The map and travel-status UI show the current astronomical light at the mascot position. The weather
snapshot remains the source for weather category and attribution, so a stale forecast daylight value
cannot make the UI report night after sunrise. The timezone-boundary catalog is imported through
`supabase/admin/import_timezone_boundaries.sql`; its geometry stays server-only.

## Release and production validation

A Git push or Vercel deployment does not apply Supabase migrations or publish Edge Functions. Apply
the database changes first, then publish the resolver so its RPC dependencies already exist:

```sh
supabase db push --linked
supabase functions deploy weather-travel-resolver \
  --project-ref zeuzkzfefulpqafchcsy \
  --no-verify-jwt
```

Invoke the asynchronous resolver with `select public.invoke_weather_travel_edge_function();`, then
inspect the returned request in `net._http_response`. A healthy provider-backed execution has HTTP
`200`, `applied > 0`, `failed = 0`, `circuitOpen = false`, and `fallback = false`. Confirm that recent
rows in `weather_forecast_cache` use `source = 'openMeteo'`. Production was validated on 2026-08-24
with three applied forecasts and no provider failure or fallback.
