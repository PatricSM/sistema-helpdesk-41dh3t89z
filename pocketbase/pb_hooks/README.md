# PocketBase Hooks

Scripts JS executados pelo PocketBase no servidor. O runtime é Goja (ES5+
algumas extensões), não Node — não há `npm`, `import`, async/await
nativo, nem `fetch` global. Use `require()` e a API global `$app`.

## Como o PocketBase carrega

- Todos os arquivos `*.pb.js` deste diretório são carregados no startup.
- Nomes começando com `_` (ex.: `_helpers.pb.js`) são utilitários
  carregados primeiro pela ordem alfabética.
- Para recarregar sem reiniciar: `pocketbase serve --hooksWatch`.

## Arquivos

| Arquivo | Eventos | O que faz |
|---|---|---|
| `_helpers.pb.js` | módulo | `createNotification`, `getSetting`, `findMatchingAssignmentRule`, `findSlaPolicyForPriority`, `addMinutesIso` |
| `tickets.pb.js` | `tickets` | `before/after create`, `before/after update`: aplica SLA, auto-assignment, notifica assignee/requester, marca `resolution_at` quando vira `resolved` |
| `comments.pb.js` | `comments` | `after create`: marca `first_response_at` no ticket quando staff responde publicamente; notifica requester (público) ou assignee (interno) |
| `auto_close.pb.js` | cron | `0 3 * * *`: fecha chamados resolvidos há mais de N dias (N vem de `settings['general'].auto_close_resolved_after_days`, padrão 7) |

## Pontos de atenção

1. **Idempotência**: `tickets.pb.js` checa `!ticket.get('first_response_at')` antes de setar para evitar sobrescrever.
2. **Falhas silenciosas**: notificações usam `try/catch` e não bloqueiam o evento original. Logam em `console.error`.
3. **Loop de notificações**: ao notificar, NÃO criamos notificação para o autor da ação (`if (requester !== authorId)` etc.).
4. **`team` em assignment_rules**: por enquanto serve só de referência informativa. Para auto-rotação de membros do time, adicione lógica em `findMatchingAssignmentRule` lendo `team_members`.
5. **`auth` no contexto**: `e.auth` contém o usuário autenticado da request — usado para detectar mudanças feitas pelo próprio requester (não notificá-lo de mudança que ele mesmo fez).

## Setup local

```bash
cd pocketbase
./pocketbase serve --hooksWatch
```

Os hooks recarregam automaticamente ao salvar.

## Testando

1. Crie um ticket com prioridade `high` → `sla_response_due` deve ser preenchido conforme SLA policy ativa.
2. Crie uma assignment_rule (priority=high → assign_to_user=X). Crie outro ticket priority=high → assignee = X automaticamente.
3. Como staff, comente publicamente em um ticket → `first_response_at` é setado, requester recebe notificação.
4. Mude status para `resolved` → `resolution_at` é setado, requester é notificado.
