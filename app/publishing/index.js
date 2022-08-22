const sendUnpublished = require('./send-unpublished')
const { organisation, calculation } = require('./types')

const publish = async () => {
  await Promise.all([
    sendUnpublished(organisation),
    sendUnpublished(calculation)
  ])
}

module.exports = publish
