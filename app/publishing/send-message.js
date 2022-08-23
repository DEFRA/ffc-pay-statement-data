const config = require('../config')
const { MessageSender } = require('ffc-messaging')
const createMessage = require('./create-message')
const removeDefunctValues = require('./remove-defunct-values')
const util = require('util')

const sendMessage = async (body, type) => {
  const sanitizedBody = removeDefunctValues(body)
  const message = createMessage(sanitizedBody, type)
  const sender = new MessageSender(config.dataTopic)
  await sender.sendMessage(message)
  await sender.closeConnection()
  console.log(`Sent ${type} data`, util.inspect(sanitizedBody, false, null, true))
}

module.exports = sendMessage
