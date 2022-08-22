const db = require('../data')
const sendMessage = require('./send-message')

const sendUnpublished = async (type) => {
  const getUnpublished = require(`./${type}/get-unpublished`)
  const updatePublished = require(`./${type}/update-published`)
  const transaction = await db.sequelize.transaction()
  try {
    const outstanding = await getUnpublished(transaction)
    for (const unpublished of outstanding) {
      await sendMessage(unpublished, type)
      await updatePublished(transaction)
      console.log(`Sent ${type} data`, unpublished)
    }
    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

module.exports = sendUnpublished