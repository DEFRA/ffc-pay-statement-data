const sendUnpublished = require('./send-unpublished')
const { ORGANISATION, CALCULATION } = require('./types')

const publish = async () => {
  await sendUnpublished(ORGANISATION)
  await sendUnpublished(CALCULATION)
}

module.exports = publish
