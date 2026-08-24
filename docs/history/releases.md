# Histórico de releases

> Registro factual e datado. Procedimentos vigentes pertencem a
> [operations/release.md](../operations/release.md).

## 2026-08-24 — Viagens segmentadas e clima

- Migrations climáticas e `weather-travel-resolver` publicados no projeto Supabase identificado.
- Autenticação do cron migrada para segredo dedicado, sem `service_role` no cabeçalho HTTP.
- Open-Meteo validado em produção com três forecasts aplicados, `failed = 0`, circuit breaker
  fechado e sem fallback.
- Resolver de progresso unificado e persistência do forecast corrigida por migration posterior.

## 2026-08-19 — Auditoria inicial do projeto remoto

- A inspeção vinculada retornou HTTP `403` por falta de privilégio de plataforma.
- Nenhuma migration, importação, função, configuração Auth ou reset remoto foi alterado nessa auditoria.
