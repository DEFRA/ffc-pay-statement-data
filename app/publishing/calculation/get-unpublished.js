const db = require('../../data')

const getUnpublished = async (transaction) => {
  const calculations = await db.calculation.findAll({
    where: {
      [db.Sequelize.Op.or]: [
        {
          published: null
        },
        {
          published: { [db.Sequelize.Op.lt]: db.sequelize.col('updated') }
        }
      ]
    },
    include: [{
      model: db.funding,
      as: 'fundings',
      attributes: ['calculationId', 'fundingCode', 'areaClaimed', 'rate']
    }],
    attributes: ['calculationId', ['calculationId', 'calculationReference'], 'sbi', 'frn', 'calculationDate', 'invoiceNumber', 'scheme', 'updated'],
    nest: true,
    // raw: true,
    transaction
  })

  return calculations.map(x => x.get({ plain: true }))
}

module.exports = getUnpublished
