const getUnpublishedCalculations = require('./get-unpublished-calculations')
const getFundingsByCalculationId = require('./get-fundings-by-calculation-id')

const getUnpublished = async (transaction) => {
  const calculations = await getUnpublishedCalculations(transaction)

  const unpublished = []

  for (const calculation of calculations) {
    const fundings = await getFundingsByCalculationId(calculation.calculationId, transaction)
    unpublished.push({
      ...calculation,
      fundings
    })
  }

  return unpublished
}

module.exports = getUnpublished
