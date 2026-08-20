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
| Cartão oficial desbloqueável | Catálogo desbloqueado, sem quantidade | Não | Sim | Base permanente, passagem por cidade e missões de evento | Caixa postal; permanece disponível ao remetente |
| Cartão de arte paga | Inventário por cópia | Sim, ao enviar | Sim | Pacotes futuros da loja | Caixa postal do destinatário |
| Adesivo | Inventário por cópia | Sim, ao enviar | Sim, de 1 a 3 cópias | Descobertas, eventos, loja futura, correspondência recebida | Inventário do destinatário e registro da correspondência |
| Selo padrão | Concedido a todos | Não | Aplicado, não transferido | Conta inicial | Snapshot visual na correspondência |
| Selo personalizado | Cosmético de propriedade | Não | Aplicado, não transferido | Descobertas, eventos, loja futura, correspondência recebida | Snapshot visual na correspondência |
| Carimbo padrão | Concedido a todos | Não | Aplicado, não transferido | Conta inicial | Snapshot visual na correspondência |
| Carimbo personalizado | Cosmético de propriedade | Não | Aplicado, não transferido | Descobertas, eventos, loja futura, correspondência recebida | Snapshot visual na correspondência |
| Mochila funcional | Instância reservável | Não | Não | Progressão, missão ou compra futura com Sementes | Equipamento do dono |
| Equipamento com durabilidade | Instância e usos próprios | Sim, ao ativar sua proteção | Não | Progressão, missão ou compra futura com Sementes | Equipamento do dono |
| Lanche Revigorante | Inventário por quantidade | Sim, ao confirmar partida | Não | Rotas, trabalhos postais e compra futura com Sementes | Modificador da viagem; não ocupa slot |
| Lembrança / souvenir | Inventário por cópia | Regra futura | Não por enquanto | Descobertas e eventos | Coleção do dono |
| Material | Inventário por quantidade | Regra futura | Não por enquanto | Descobertas | Coleção do dono |
| Insígnia | Conquista de conta | Não | Não | Marcos e eventos | Perfil / álbum |

## Fontes de obtenção

### Moedas

Sementes são a moeda comum obtida ao jogar e poderão recompensar trabalhos postais. Elas podem
comprar consumíveis e equipamento funcional básico aprovados, sempre mantendo o loop completo
viável sem compra. Cristais são a moeda premium futura, restrita à expressão visual e social.
Nenhuma moeda pode ser enviada entre jogadores ou comprar XP; Cristais nunca compram atributos,
alcance, carga, descobertas ou velocidade.

### Caminho e descobertas

Rotas podem conceder adesivos, lembranças, materiais, Lanches Revigorantes e itens sazonais. A
concessão precisa ser determinística e autoritativa; o achado permanece pendente até o retorno e a
coleta é idempotente. Itens de rota nunca dependem de pagamento.

### Eventos

Eventos podem conceder cartões oficiais temáticos, adesivos, selos e carimbos cosméticos. Eventos
não devem exigir compras para permitir correspondência básica nem criar poder de progresso.

### Correspondência recebida

Cada adesivo enviado é removido autoritativamente do saldo do remetente, fica em custódia durante o
trecho de ida e entra no saldo do destinatário somente após a chegada. Selos e carimbos aplicados
são apenas apresentação persistida da correspondência: não transferem propriedade.

### Loja futura

A loja poderá vender itens cosméticos oficiais, incluindo selos e carimbos personalizados, e
eventualmente coleções de adesivos e pacotes de cartões de arte paga. A economia gratuita poderá
oferecer com Sementes equipamento funcional básico e Lanches Revigorantes depois do balanceamento.
Cristais não venderão vantagem de rota, XP, drops aleatórios pagos ou acesso social.

Preços, moedas, pagamento e limites de compra permanecem fora de escopo até uma milestone de
economia aprovada.

## Regras de envio

### Carta

Uma carta exige texto válido, um selo e um carimbo. Selo e carimbo são sempre selecionados de
propriedades elegíveis do remetente, com os padrões como fallback permanente.

### Cartão oficial

Um cartão desbloqueável usa uma variante oficial do catálogo e pode receber mensagem curta no
verso. O cartão-base é permanente para todos; cartões de cidade são desbloqueados quando um
mascote passa pela cidade e cartões de evento por sua missão. Eles não são consumidos. Uma futura
arte de cartão paga é uma categoria diferente, comprada em cópias finitas (por exemplo, pacotes),
e consome uma cópia ao enviar. Quantidade, preço e tamanho dos pacotes ainda não estão aprovados.

### Adesivos

O remetente seleciona de uma a três cópias que possui, podendo repetir um design. A operação valida
e consome a quantidade agrupada de forma atômica; o destinatário recebe as mesmas cópias após a
chegada. A correspondência de adesivos usa um slot, independentemente de conter uma, duas ou três
cópias.
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
- Sem itens pagos com Cristais que alterem velocidade, probabilidade de descoberta, XP, carga ou
  acesso a rotas. Consumíveis e equipamentos funcionais obtidos no jogo ou com Sementes obedecem
  às Milestones 56 e 59.
