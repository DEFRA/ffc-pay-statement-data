const db = require('../../data')

const getUnpublished = async (transaction) => {
  const calculations = await db.calculation.findAll({
    where: { published: null },
    include: [{ model: db.funding, as: 'fundings', attributes: ['calculationId', 'fundingCode', 'areaClaimed', 'rate'] }],
    nest: true,
    transaction
  })
  return calculations.map(x => x.get({ plain: true }))
}

module.exports = getUnpublished
