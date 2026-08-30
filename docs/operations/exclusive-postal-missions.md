# Missões exclusivas diárias

O cron `duif-exclusive-mission-generator` chama a Edge Function
`exclusive-mission-generator` às 03:10 UTC (00:10 em São Paulo). A função expira ofertas com
sete dias, prepara novas ofertas idempotentemente, e gera no máximo 20 narrativas por execução.

Configure no Vault `duif_project_url` e `duif_exclusive_mission_cron_secret`. O segundo deve ser
igual a `EXCLUSIVE_MISSION_CRON_SECRET` da Edge Function, ter pelo menos 32 bytes aleatórios e ser
rotacionado primeiro no secret da função e depois no Vault. Configure `OPENAI_API_KEY` somente
como secret da função; ela nunca deve aparecer em `VITE_*`, no banco ou em logs. Opcionalmente,
`OPENAI_EXCLUSIVE_MISSION_MODEL` substitui o padrão `gpt-5.6-luna`.

A função usa Responses com `store: false`, não envia coordenadas do ninho e registra somente
contagens e códigos de falha. Se a OpenAI estiver indisponível, recusar a solicitação ou devolver
um schema inválido, uma narrativa localizada determinística é publicada para o primeiro destino
validado. O banco sempre escolhe as cidades GeoNames candidatas e revalida alcance, capacidade,
propriedade e expiração no despacho.

Para validar uma execução, publique primeiro a migration e depois a função:

```sh
supabase db push --linked
supabase functions deploy exclusive-mission-generator --no-verify-jwt
```

Em seguida, execute `select public.invoke_exclusive_postal_mission_edge_function();` e inspecione
`net._http_response`. Uma resposta saudável informa `generated`; `fallbacks` maior que zero mantém
as missões jogáveis, mas indica indisponibilidade ou validação rejeitada da geração por IA.
