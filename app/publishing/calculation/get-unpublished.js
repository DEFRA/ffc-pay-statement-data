const db = require('../../data')

const { publishingConfig } = require('../../config')

const getUnpublished = async (transaction) => {
  let calculations
  try {
    calculations = await db.calculation.findAll({
      // lock: true,
      // skipLocked: true,
      limit: publishingConfig.dataPublishingMaxBatchSize,
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
        // lock: true,
        // skipLocked: true,
        limit: publishingConfig.dataPublishingMaxBatchSize,
        model: db.funding,
        as: 'fundings',
        attributes: ['calculationId', 'fundingCode', 'areaClaimed', 'rate']
      }],
      attributes: ['calculationId', ['calculationId', 'calculationReference'], 'sbi', 'frn', 'calculationDate', 'invoiceNumber', 'scheme', 'updated'],
      nest: true,
      transaction
    })
  } catch (e) {
    console.log(e)
  }

  return calculations.map(x => x.get({ plain: true }))
}

module.exports = getUnpublished
