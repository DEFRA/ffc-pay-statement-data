const db = require('../../data')

const { publishingConfig } = require('../../config')

const getUnpublished = async (transaction) => {
  return db.organisation.findAll({
    lock: true,
    skipLocked: true,
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
    attributes: ['sbi', 'addressLine1', 'addressLine2', 'addressLine3', 'city', 'county', 'postcode', 'emailAddress', 'frn', 'name', 'updated'],
    raw: true,
    transaction
  })
}

module.exports = getUnpublished
