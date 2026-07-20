# Studio Administrativo de Assets

O Studio está disponível em `/admin/assets` apenas para contas cujo JWT possua
`app_metadata.duif_role = "admin"`. Esconder o link não concede acesso: a rota, as políticas de
Storage, as RPCs e a Edge Function verificam o papel novamente.

## Bootstrap do mantenedor

No Supabase Dashboard, abra **Authentication → Users → [usuário] → App metadata** e grave:

```json
{ "duif_role": "admin" }
```

Depois, a pessoa precisa sair e entrar novamente (ou renovar a sessão) para obter um JWT novo.
Não use `user_metadata` para esse papel e não o defina pelo navegador.

## Publicação

1. Abra o ateliê e crie um rascunho com uma chave estável, tipo, arquivo e autoria.
2. Use `alt_text_key` para arte informativa; a chave já precisa existir em `pt-BR` e `en-US`.
   Para arte decorativa, marque a opção correspondente; ela será entregue com `alt=""`.
3. Publique somente depois de revisar o preview, os dados técnicos e os usos listados.

O arquivo chega primeiro ao bucket privado `duif-asset-staging`. A Edge Function confere assinatura,
MIME, tamanho, dimensões, proporção postal e metadados; só então o copia para o bucket público
`duif-assets` em um caminho versionado e imutável. Falhas removem o objeto público recém-criado e
mantêm a versão anterior ativa.

Versões publicadas e arquivadas não são editadas. Para corrigir uma arte, crie outra versão;
versões arquivadas podem ser restauradas. A versão ativa não pode ser arquivada sem uma substituta.

## Operação

As migrations criam os buckets e as políticas. Para disponibilizar o boundary de publicação no
projeto configurado, execute:

```sh
supabase functions deploy asset-studio
```

Ela usa apenas `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`, fornecidas pelo
ambiente Supabase. A service-role nunca vai para o cliente. O manifesto de runtime lê apenas versões
ativas; assets empacotados continuam funcionando com os mesmos fallbacks CSS.
