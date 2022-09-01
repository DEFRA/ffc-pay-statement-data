const db = require('../../data')

const updatePublished = async (calculationId, transaction) => {
  await db.calculation.update({ published: new Date() }, { where: { calculationId }, transaction })
}

module.exports = updatePublished
