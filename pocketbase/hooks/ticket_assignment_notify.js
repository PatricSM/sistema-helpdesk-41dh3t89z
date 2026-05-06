onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const original = record.original()

  if (
    record.getString('assignee') !== original.getString('assignee') &&
    record.getString('assignee')
  ) {
    $app
      .logger()
      .info('Ticket assigned', 'ticketId', record.id, 'assignee', record.getString('assignee'))
  }

  e.next()
}, 'tickets')
