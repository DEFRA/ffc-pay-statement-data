const db = require('../../data')

const getUnpublished = async (transaction) => {
  return db.calculation.findAll({ where: { published: null }, include: [{ model: db.funding, as: 'fundings' }], nest: true, raw: true, transaction })
}

module.exports = getUnpublished
