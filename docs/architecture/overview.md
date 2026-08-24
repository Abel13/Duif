# Visão geral da arquitetura

DUIF é uma PWA em React e TypeScript, com Vite no frontend, Supabase como backend autoritativo e
MapLibre para o mapa postal. O cliente consome contratos públicos sanitizados; mutações de gameplay,
economia, progressão e privacidade são validadas no backend.

## Componentes

- `src/app`: composição e rotas.
- `src/components`: UI reutilizável, componentes de mascote, mapa e layout.
- `src/game`: tipos, regras puras e contratos do domínio.
- `src/integrations/supabase`: adaptadores autenticados e mapeamento do banco.
- `src/pages`: orquestração das telas.
- `supabase/migrations`: evolução imutável do schema e dos RPCs.
- `supabase/functions`: integrações administrativas e jobs externos.

## Fontes relacionadas

- [Backend e privacidade](./backend.md)
- [Decisões técnicas](./technical-decisions.md)
- [Internacionalização](./internationalization.md)
- [Desempenho](./performance.md)
- [Release](../operations/release.md)
