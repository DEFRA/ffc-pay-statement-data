const db = require('../../data')

const getUnpublished = async (transaction) => {
  return db.organisation.findAll({ where: { published: null }, raw: true, transaction })
}

module.exports = getUnpublished
