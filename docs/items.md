# Itens e economia de coleção

> Fonte de verdade para tipos de item, propriedade, consumo e origem. Regras de produto gerais
> permanecem em [product-rules.md](./product-rules.md); escopo de implementação fica no
> [roadmap](./roadmap.md).

## Princípios

- Correspondência básica nunca depende de gasto: cartas e cartões oficiais continuam disponíveis.
- Itens cosméticos expressam identidade, não vantagem de rota, XP ou recompensa.
- Um item só é consumido quando a ação transfere uma cópia finita para outra pessoa.
- Itens oficiais usam catálogo controlado, localização e assets aprovados; uploads de usuários não
  fazem parte do modelo.
- A interface deve revelar propriedade, quantidade, origem e consumo antes da confirmação.

## Matriz de itens

| Tipo | Propriedade | Consumível | Pode ser enviado | Origem prevista | Destino ao enviar |
| --- | --- | --- | --- | --- | --- |
| Sementes | Saldo da conta | Sim, ao gastar | Não | Entregas, descobertas, coleções e eventos | Economia da conta |
| Cristais | Saldo premium da conta | Sim, ao gastar | Não | Compra futura e concessões explícitas | Economia da conta |
| Carta | Não é inventário | Não | Sim | Compositor do usuário | Caixa postal do destinatário |
| Cartão oficial | Catálogo, sem quantidade | Não | Sim | Catálogo oficial e eventos | Caixa postal; permanece disponível ao remetente |
| Adesivo | Inventário por cópia | Sim, ao enviar | Sim, de 1 a 3 cópias | Descobertas, eventos, loja futura, correspondência recebida | Inventário do destinatário e registro da correspondência |
| Selo padrão | Concedido a todos | Não | Aplicado, não transferido | Conta inicial | Snapshot visual na correspondência |
| Selo personalizado | Cosmético de propriedade | Não | Aplicado, não transferido | Descobertas, eventos, loja futura, correspondência recebida | Snapshot visual na correspondência |
| Carimbo padrão | Concedido a todos | Não | Aplicado, não transferido | Conta inicial | Snapshot visual na correspondência |
| Carimbo personalizado | Cosmético de propriedade | Não | Aplicado, não transferido | Descobertas, eventos, loja futura, correspondência recebida | Snapshot visual na correspondência |
| Lembrança / souvenir | Inventário por cópia | Regra futura | Não por enquanto | Descobertas e eventos | Coleção do dono |
| Material | Inventário por quantidade | Regra futura | Não por enquanto | Descobertas | Coleção do dono |
| Insígnia | Conquista de conta | Não | Não | Marcos e eventos | Perfil / álbum |

## Fontes de obtenção

### Moedas

Sementes são a moeda comum obtida ao jogar e poderão recompensar trabalhos postais. Cristais são
a moeda premium futura, restrita à expressão visual e social. Nenhuma das duas pode ser enviada
entre jogadores, comprar XP ou melhorar atributos, alcance, carga, descobertas ou velocidade.

### Caminho e descobertas

Rotas podem conceder adesivos, lembranças, materiais e itens sazonais. A concessão precisa ser
determinística e autoritativa; a coleta é idempotente. Itens de rota nunca dependem de pagamento.

### Eventos

Eventos podem conceder cartões oficiais temáticos, adesivos, selos e carimbos cosméticos. Eventos
não devem exigir compras para permitir correspondência básica nem criar poder de progresso.

### Correspondência recebida

Quando a Milestone 52 estiver implementada, cada adesivo anexado a uma correspondência é
transferido para o inventário do destinatário. Selos e carimbos aplicados são apenas apresentação
persistida da carta: não transferem propriedade.

### Loja futura

A loja poderá vender itens cosméticos oficiais, incluindo selos e carimbos personalizados, e
eventualmente coleções de adesivos. Ela não venderá cartas, cartões necessários para envio,
vantagem de rota, XP, drops aleatórios pagos ou acesso social.

Preços, moedas, pagamento e limites de compra permanecem fora de escopo até uma milestone de
economia aprovada.

## Regras de envio

### Carta

Uma carta exige texto válido, um selo e um carimbo. Selo e carimbo são sempre selecionados de
propriedades elegíveis do remetente, com os padrões como fallback permanente.

### Cartão oficial

Um cartão usa uma variante oficial do catálogo e pode receber mensagem curta no verso. Não
consome o cartão nem cria uma unidade nova no inventário; o destinatário recebe a peça na caixa
postal.

### Adesivos

O remetente seleciona de uma a três cópias que possui. A operação deve validar saldo e consumir
uma cópia de cada seleção de forma atômica; o destinatário recebe as mesmas cópias no inventário.
O registro da correspondência preserva quais adesivos foram enviados mesmo após mudanças futuras
no catálogo.

## Estados e transparência na interface

- Catálogo: item oficial que pode ser escolhido sem pertencer ao inventário.
- Possuído: item permanente ou quantidade disponível do jogador.
- Aplicado: item visual escolhido para uma correspondência, sem transferência.
- Anexado: cópia de inventário que será transferida e consumida ao envio.
- Recebido: cópia adicionada ao inventário após entrega da correspondência.

O compositor precisa informar o consumo antes da confirmação, por exemplo: “Serão enviados 2
adesivos do seu inventário”. Não deve prometer uma transferência antes do backend confirmar a
operação.

## Limites atuais

- Sem troca direta entre jogadores fora da correspondência.
- Sem presentes, conversão de duplicatas, crafting, mercado secundário ou reembolso.
- Sem arte, texto ou imagens criadas por jogadores.
- Sem itens que alterem velocidade, probabilidade de descoberta, XP ou acesso a rotas.
