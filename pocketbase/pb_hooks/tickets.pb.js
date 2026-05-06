/// <reference path="../pb_data/types.d.ts" />

/**
 * Hooks da coleção tickets:
 * - onRecordBeforeCreateRequest: aplica SLA policy (sla_response_due / sla_resolution_due)
 * - onRecordAfterCreateRequest: aplica assignment rules + notifica assignee
 * - onRecordBeforeUpdateRequest: detecta mudança de assignee/status para snapshots
 * - onRecordAfterUpdateRequest: notifica assignee/requester sobre mudanças
 */

onRecordBeforeCreateRequest((e) => {
  const helpers = require(`${__hooks}/_helpers.pb.js`)
  const ticket = e.record

  const priority = ticket.get('priority')
  if (priority) {
    const policy = helpers.findSlaPolicyForPriority($app, priority)
    if (policy) {
      const responseMin = policy.get('response_time_min')
      const resolutionMin = policy.get('resolution_time_min')
      const now = new Date().toISOString()
      if (responseMin && !ticket.get('sla_response_due')) {
        ticket.set('sla_response_due', helpers.addMinutesIso(now, responseMin))
      }
      if (resolutionMin && !ticket.get('sla_resolution_due')) {
        ticket.set('sla_resolution_due', helpers.addMinutesIso(now, resolutionMin))
      }
    }
  }

  e.next()
}, 'tickets')

onRecordAfterCreateRequest((e) => {
  const helpers = require(`${__hooks}/_helpers.pb.js`)
  const ticket = e.record

  // Aplicar regra de assignment (se nenhum assignee já estiver definido)
  if (!ticket.get('assignee')) {
    const rule = helpers.findMatchingAssignmentRule($app, ticket)
    if (rule) {
      const userId = rule.get('assign_to_user')
      if (userId) {
        try {
          ticket.set('assignee', userId)
          $app.save(ticket)
        } catch (err) {
          console.error('auto-assignment failed:', err)
        }
      }
      // Notar: assign_to_team é referência informativa por enquanto
      // (a UI exibe; auto-rotação por time precisaria de algoritmo extra)
    }
  }

  // Notificar assignee
  const assignee = ticket.get('assignee')
  if (assignee && assignee !== ticket.get('requester')) {
    helpers.createNotification($app, {
      recipient: assignee,
      kind: 'ticket_assigned',
      title: `Novo chamado atribuído: ${ticket.get('title')}`,
      body: ticket.get('description')?.slice(0, 200),
      ticket: ticket.id,
    })
  }

  e.next()
}, 'tickets')

onRecordBeforeUpdateRequest((e) => {
  const ticket = e.record
  // Snapshot dos campos antigos via originalCopy() — disponível em onAfter
  // através de e.record.original() se necessário.
  e.next()
}, 'tickets')

onRecordAfterUpdateRequest((e) => {
  const helpers = require(`${__hooks}/_helpers.pb.js`)
  const ticket = e.record
  const original = ticket.original()
  if (!original) {
    e.next()
    return
  }

  const oldAssignee = original.get('assignee')
  const newAssignee = ticket.get('assignee')
  const oldStatus = original.get('status')
  const newStatus = ticket.get('status')
  const requester = ticket.get('requester')

  // Notificar novo assignee se mudou
  if (newAssignee && newAssignee !== oldAssignee) {
    helpers.createNotification($app, {
      recipient: newAssignee,
      kind: 'ticket_assigned',
      title: `Chamado atribuído a você: ${ticket.get('title')}`,
      body: ticket.get('description')?.slice(0, 200),
      ticket: ticket.id,
    })
  }

  // Notificar requester sobre mudança de status (exceto se ele mesmo mudou)
  const auth = e.auth
  if (newStatus !== oldStatus && requester && (!auth || auth.id !== requester)) {
    const statusLabel = {
      open: 'Aberto',
      in_progress: 'Em andamento',
      resolved: 'Resolvido',
      closed: 'Fechado',
    }
    helpers.createNotification($app, {
      recipient: requester,
      kind: 'ticket_status_changed',
      title: `Chamado atualizado: ${ticket.get('title')}`,
      body: `Status alterado para "${statusLabel[newStatus] || newStatus}".`,
      ticket: ticket.id,
    })
  }

  // Quando muda para resolved, marcar resolution_at se ainda não tem
  if (newStatus === 'resolved' && oldStatus !== 'resolved' && !ticket.get('resolution_at')) {
    try {
      ticket.set('resolution_at', new Date().toISOString())
      $app.save(ticket)
    } catch (err) {
      console.error('failed to set resolution_at:', err)
    }
  }

  e.next()
}, 'tickets')
