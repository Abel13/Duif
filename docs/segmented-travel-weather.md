# Segmented travel and weather operations

Milestone 55 stores authoritative route detail in `delivery_route_segments`. Client code must consume only `deliveries.travel_weather_summary`; the segment table, forecast cache, regional cells and interpolated coordinates have no authenticated grants.

`weather-travel-resolver` is invoked every três horas. Configure `duif_project_url` e `duif_weather_resolver_cron_secret` no Vault; o segundo deve ter exatamente o mesmo valor de `WEATHER_RESOLVER_CRON_SECRET` nos secrets da Edge Function. Gere pelo menos 32 bytes aleatórios por ambiente (por exemplo, `openssl rand -hex 32`) e nunca reutilize a `service_role` nesse canal. Configure também `OPEN_METEO_BASE_URL` e, para uso comercial, um `OPEN_METEO_API_KEY` aprovado. Em um protótipo não comercial, o endpoint público sem chave pode ser habilitado explicitamente com `OPEN_METEO_ALLOW_PUBLIC_ENDPOINT=true`; mantenha esse segredo como `false` em uso comercial. Se configuração, autenticação, timeout, validação ou provedor falharem, os snapshots virtuais existentes continuam autoritativos e a viagem segue normalmente.

Para rotacionar a credencial, atualize primeiro `WEATHER_RESOLVER_CRON_SECRET` e imediatamente depois `duif_weather_resolver_cron_secret`. Publique a função com JWT desabilitado somente para esse endpoint; ela continua protegida pelo cabeçalho `X-Duif-Cron-Secret`. Após validar uma resposta `200` e cache `openMeteo`, remova do Vault o antigo `duif_service_role_key` se ele não tiver outro consumidor.

The database cron always resolves due segments, even when the Edge Function is unavailable. The Edge Function adds provider forecasts and then invokes the same idempotent resolver. Forecast writes affect only planned segments whose start is in the future. Started and completed segment snapshots are immutable by contract.

Open-Meteo data is attributed under CC BY 4.0 in provider-backed UI. Cache rows older than 30 days are removed by the resolver; completed delivery segments remain as versioned journey history.
