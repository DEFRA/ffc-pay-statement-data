const db = require('../data')
const getPrimaryKeyValue = require('./get-primary-key-value')
const sendMessage = require('./send-message')
const removeDefunctValues = require('./remove-defunct-values')
const validateUpdate = require('./validate-update')

const sendUpdates = async (type) => {
  const getUnpublished = require(`./${type}/get-unpublished`)
  const updatePublished = require(`./${type}/update-published`)
  const transaction = await db.sequelize.transaction()
  try {
    const outstanding = await getUnpublished(transaction)
    for (const unpublished of outstanding) {
      const sanitizedUpdate = removeDefunctValues(unpublished)
      const isValid = validateUpdate(sanitizedUpdate, type)
      if (isValid) {
        await sendMessage(sanitizedUpdate, type)
        const primaryKey = getPrimaryKeyValue(unpublished, type)
        await updatePublished(primaryKey, transaction)
      }
    }
    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

module.exports = sendUpdates
