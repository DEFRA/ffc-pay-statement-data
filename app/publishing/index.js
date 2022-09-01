const sendUpdates = require('./send-updates')
const { ORGANISATION, CALCULATION } = require('./types')

const publish = async () => {
  await Promise.all([
    sendUpdates(ORGANISATION),
    sendUpdates(CALCULATION)
  ])
}

module.exports = publish
