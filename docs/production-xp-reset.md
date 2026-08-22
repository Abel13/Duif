# Reset único da progressão XP v2

Este procedimento é uma operação administrativa única; ele **não** é uma migration e nunca deve
ser executado automaticamente por deploy.

## Pré-requisitos

1. Identifique explicitamente o `project_ref` de produção e confirme que o backup está disponível.
2. Pause o deploy e aguarde `select count(*) from public.deliveries where status <> 'completed';`
   retornar `0`.
3. Faça uma contagem de `profile_postal_progression`, `player_mascots`,
   `mascot_skill_progression` e `delivery_progression_awards` para o registro de auditoria.

## Transação

Execute no SQL Editor do projeto confirmado, trocando os dois valores de auditoria. Não use em
outro projeto.

```sql
begin;

do $$
begin
  if exists (select 1 from public.deliveries where status <> 'completed') then
    raise exception 'XP reset requires zero active deliveries';
  end if;
end;
$$;

insert into public.postal_progression_reset_audits(
  project_ref, actor_label, profile_count, mascot_count, skill_count, award_count
)
select
  'CONFIRMED_PROJECT_REF', 'CONFIRMED_OPERATOR',
  (select count(*)::integer from public.profile_postal_progression),
  (select count(*)::integer from public.player_mascots),
  (select count(*)::integer from public.mascot_skill_progression),
  (select count(*)::integer from public.delivery_progression_awards);

delete from public.delivery_progression_awards;
delete from public.mascot_skill_progression;

update public.profile_postal_progression
set level = 1, xp = 0, next_level_xp = 150, updated_at = now();

update public.player_mascots mascot
set level = template.base_level,
    xp = template.base_xp,
    next_level_xp = template.next_level_xp,
    updated_at = now()
from public.mascot_templates template
where template.id = mascot.template_id;

commit;
```

## Verificação

Confirme que não há awards ou skills, que a auditoria foi registrada e que os valores de cada
mascote correspondem ao seu template. Entregas concluídas não devem ser reprocessadas; apenas
coletas futuras usam a progressão v2.
