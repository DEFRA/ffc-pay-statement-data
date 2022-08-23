const db = require('../../data')

const getUnpublished = async (transaction) => {
  const calculations = await db.calculation.findAll({
    where: { published: null },
    include: [{ model: db.funding, as: 'fundings', attributes: ['calculationId', 'fundingCode', 'areaClaimed', 'rate'] }],
    attributes: ['calculationId', ['calculationId', 'calculationReference'], 'sbi', 'calculationDate', 'invoiceNumber', 'scheme', 'updated'],
    nest: true,
    transaction
  })
  return calculations.map(x => x.get({ plain: true }))
}

module.exports = getUnpublished
