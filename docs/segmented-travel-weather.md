# Segmented travel and weather operations

Milestone 55 stores authoritative route detail in `delivery_route_segments`. Client code must consume only `deliveries.travel_weather_summary`; the segment table, forecast cache, regional cells and interpolated coordinates have no authenticated grants.

`weather-travel-resolver` is invoked every três horas. Configure os segredos Vault `duif_project_url` e `duif_service_role_key` para o agendador, além de `OPEN_METEO_BASE_URL` e, para uso comercial, um `OPEN_METEO_API_KEY` aprovado para a função. Em um protótipo não comercial, o endpoint público sem chave pode ser habilitado explicitamente com `OPEN_METEO_ALLOW_PUBLIC_ENDPOINT=true`; mantenha esse segredo como `false` em uso comercial. Se configuração, timeout, validação ou provedor falharem, os snapshots virtuais existentes continuam autoritativos e a viagem segue normalmente.

The database cron always resolves due segments, even when the Edge Function is unavailable. The Edge Function adds provider forecasts and then invokes the same idempotent resolver. Forecast writes affect only planned segments whose start is in the future. Started and completed segment snapshots are immutable by contract.

Open-Meteo data is attributed under CC BY 4.0 in provider-backed UI. Cache rows older than 30 days are removed by the resolver; completed delivery segments remain as versioned journey history.
