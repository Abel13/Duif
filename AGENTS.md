# AGENTS.md

## Papel deste arquivo

Este arquivo contém somente regras estáveis para agentes que trabalham no DUIF. Consulte
[`docs/README.md`](docs/README.md) antes de alterar produto, arquitetura, design ou operação. Estado,
sequência e escopo de trabalho pertencem exclusivamente ao roadmap.

## Projeto

DUIF é uma PWA de aventura postal social. Jogadores cuidam de animais mensageiros que transportam
cartas, cartões, adesivos e itens, viajam pelo mapa, fazem descobertas e retornam ao ninho.

Implemente somente o recurso solicitado. Não amplie o produto por inferência.

## Stack

- React e TypeScript;
- Vite;
- CSS Modules;
- React Router;
- MapLibre no mapa;
- Framer Motion somente quando a animação agregar valor;
- Phosphor Icons para affordances convencionais.

Não introduza dependências sem justificar.

## Organização do código

```text
src/
  app/
  components/
    ui/
    mascot/
    map/
    layout/
  game/
  i18n/
    locales/
  integrations/
    supabase/
  pages/
  styles/
```

- Mantenha componentes pequenos e focados.
- Extraia funções visuais/comportamentais repetidas para componentes compartilhados.
- Coloque regras puras e tipos de domínio em `src/game`, não nas páginas.
- Páginas orquestram dados e layout; adaptadores Supabase ficam em `src/integrations/supabase`.
- Mutações autoritativas exigem autorização e validação no backend.
- Preserve fallbacks mock explícitos quando o contrato atual exigir, sem misturá-los a dados autenticados.

## Produto e privacidade

- Consulte [regras do produto](docs/product/rules.md) para comportamento vinculante.
- Não exponha coordenadas precisas, trilhas privadas, conteúdo postal fechado ou dados de outro jogador.
- Não adicione pagamentos, chat, trading, uploads irrestritos ou multiplayer em tempo real sem escopo aprovado.
- Não crie persistence, RPC, economia ou catálogo fora do recurso solicitado.

## Design

- Consulte [direção visual](docs/design/visual-direction.md), [tipografia](docs/design/typography.md)
  e [assets](docs/design/assets.md).
- Preserve a linguagem de caderno postal ilustrado; evite UI genérica de SaaS.
- Use tokens CSS existentes e assets oficiais por chaves estáveis.
- Não use emojis como iconografia, glassmorphism, neon, gradientes pesados ou botões padrão do navegador.
- Prefira HTML/CSS, SVG e assets WebP/AVIF leves; não use canvas pesado ou Three.js para UI estática.

## Mobile e acessibilidade

- Projete mobile first; desktop amplia a mesma experiência.
- Evite rolagem horizontal e mantenha ações principais alcançáveis.
- Use HTML semântico, botões reais, foco visível e alvos confortáveis.
- Não dependa somente de cor; forneça texto alternativo útil.
- Respeite movimento reduzido e preserve legibilidade sobre o mapa.

## Internacionalização

- `pt-BR` é o locale padrão e `en-US` o secundário.
- Todo texto visível vem das traduções, sem strings hardcoded em JSX.
- Identificadores de código e chaves de tradução permanecem em inglês.
- Consulte [internacionalização](docs/architecture/internationalization.md).

## Desempenho

- Não anime propriedades de layout quando transform e opacity resolverem.
- Não carregue assets grandes ou efeitos inativos sem necessidade.
- Preserve code splitting e lazy loading existentes.
- Consulte [desempenho](docs/architecture/performance.md).

## Banco e arquivos

- Migrations aplicadas são imutáveis; correções usam migration posterior.
- Preserve alterações não relacionadas do usuário em worktrees sujos.
- Use `apply_patch` para edições manuais.
- Prefira `rg` para busca.
- Nunca execute reset destrutivo ou operação remota sem autorização explícita e alvo validado.
- Runbooks operacionais estão em [`docs/operations`](docs/operations/release.md).

## Qualidade

Antes de concluir uma implementação:

- execute testes TypeScript relevantes;
- execute o build;
- execute suites SQL proporcionais ao risco;
- execute `git diff --check`;
- remova imports e arquivos não usados;
- descreva mudanças, validações e pendências com clareza.

## Regra de planejamento

Consulte [o roadmap ativo](docs/product/roadmap.md) somente quando o usuário pedir planejamento ou
próxima etapa. O roadmap não concede autorização automática para implementar, publicar, resetar,
commitar ou fazer push.
