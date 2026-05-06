onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const original = record.original()

  if (
    record.getString('title') !== original.getString('title') ||
    record.getString('description') !== original.getString('description')
  ) {
    $app
      .logger()
      .info('Ticket title/description updated, vector should be re-embedded', 'ticketId', record.id)
  }

  e.next()
}, 'tickets')
