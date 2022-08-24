const createMessage = (body, type) => {
  return {
    body: {
      ...body,
      type
    },
    type: `uk.gov.pay.statement.data.${type}`,
    source: 'ffc-pay-statement-data'
  }
}

module.exports = createMessage
