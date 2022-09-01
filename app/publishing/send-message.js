const config = require('../config')
const { MessageSender } = require('ffc-messaging')
const createMessage = require('./create-message')
const util = require('util')

const sendMessage = async (body, type) => {
  const message = createMessage(body, type)
  const sender = new MessageSender(config.dataTopic)
  await sender.sendMessage(message)
  await sender.closeConnection()
  console.log(`Sent ${type} data`, util.inspect(body, false, null, true))
}

module.exports = sendMessage
