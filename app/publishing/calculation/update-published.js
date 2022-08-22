const db = require('../../data')

const updatePublished = async (transaction) => {
  await db.calculation.update({ published: new Date() }, { transaction })
}

module.exports = updatePublished
