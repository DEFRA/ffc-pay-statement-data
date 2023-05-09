const db = require('../../data')

const getFundingsByCalculationId = async (calculationId, transaction) => {
  return db.funding.findAll({
    lock: true,
    skipLocked: true,
    where: {
      calculationId
    },
    attributes: ['calculationId', 'fundingCode', 'areaClaimed', 'rate'],
    raw: true,
    transaction
  })
}

module.exports = getFundingsByCalculationId
