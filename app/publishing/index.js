const sendUnpublished = require('./send-unpublished')
const { ORGANISATION, CALCULATION } = require('./types')

const publish = async () => {
  await Promise.all([
    sendUnpublished(ORGANISATION),
    sendUnpublished(CALCULATION)
  ])
}

module.exports = publish
