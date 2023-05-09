const getUnpublishedCalculations = require('./get-unpublished-calculations')
const getFundingsForCalculation = require('./get-fundings-for-calculation')

const getUnpublished = async (transaction) => {
  const calculations = await getUnpublishedCalculations(transaction)

  const unpublished = []

  for (const calculation of calculations) {
    const fundings = await getFundingsForCalculation(calculation.calculationId, transaction)
    unpublished.push({
      ...calculation,
      fundings
    })
  }

  return unpublished
}

module.exports = getUnpublished
