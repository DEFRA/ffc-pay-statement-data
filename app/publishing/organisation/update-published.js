const db = require('../../data')

const updatePublished = async (transaction) => {
  await db.organisation.update({ published: new Date() }, { transaction })
}

module.exports = updatePublished
