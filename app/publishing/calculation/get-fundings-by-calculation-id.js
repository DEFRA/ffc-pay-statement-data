const db = require('../../data')

const getFundingsByCalculationId = async (calculationId, transaction) => {
  const fundings = await db.funding.findAll({
    where: {
      calculationId
    },
    attributes: ['calculationId', 'fundingCode', 'areaClaimed', 'rate'],
    raw: true,
    transaction
  })

  return fundings
}

module.exports = getFundingsByCalculationId
