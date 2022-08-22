const db = require('../../data')

const updatePublished = async (sbi, transaction) => {
  await db.organisation.update({ published: new Date() }, { where: { sbi }, transaction })
}

module.exports = updatePublished
