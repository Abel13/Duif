# Documentação DUIF

Este diretório usa poucas fontes canônicas. Antes de criar um documento novo, atualize a fonte correspondente abaixo e faça links para ela.

## Fontes de verdade

- [Roadmap](./roadmap.md): estado de cada milestone, escopo aprovado, próxima sequência e histórico.
- [Regras de produto](./product-rules.md): regras vigentes de jogo, privacidade, inventário, correspondência, progressão e monetização.
- [Produto](./product.md): visão, fantasia do jogador e loop principal; não é um segundo roadmap.
- [Itens e economia de coleção](./items.md): tipos de item, origem, propriedade, consumo e transferência.
- [Decisões técnicas](./technical-decisions.md): arquitetura, segurança, testes e decisões duráveis.
- [Schema do backend](./backend-schema.md): modelo Supabase local, contratos e limites de acesso.
- [Prontidão de produção](./production-readiness.md): procedimento de deploy e verificação.

## Guias especializados

- [Assets](./assets.md) e [estúdio administrativo](./asset-studio.md)
- [GeoNames](./geonames.md)
- [Internacionalização](./internationalization.md)
- [Direção visual](./visual-direction.md) e [tipografia](./typography.md)
- [Performance](./performance.md), [XP](./xp-system.md) e [reset de dados](./player-data-reset.md)

## Regra de manutenção

Documentos históricos explicam decisões anteriores; eles não substituem as fontes acima. Uma milestone só é implementada quando o roadmap é atualizado após commit e validação local. Deploy remoto é registrado em `production-readiness.md`, nunca inferido do estado local.
