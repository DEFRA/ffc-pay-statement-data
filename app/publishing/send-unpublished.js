const db = require('../data')
const getPrimaryKey = require('./get-primary-key')
const sendMessage = require('./send-message')

const sendUnpublished = async (type) => {
  const getUnpublished = require(`./${type.name}/get-unpublished`)
  const updatePublished = require(`./${type.name}/update-published`)
  const transaction = await db.sequelize.transaction()
  try {
    const outstanding = await getUnpublished(transaction)
    for (const unpublished of outstanding) {
      await sendMessage(unpublished, type.name)
      const primaryKey = getPrimaryKey(unpublished, type.primaryKey)
      await updatePublished(primaryKey, transaction)
      console.log(`Sent ${type} data`, unpublished)
    }
    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

module.exports = sendUnpublished
