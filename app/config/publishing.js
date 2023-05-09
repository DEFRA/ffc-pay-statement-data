const Joi = require('joi')

const schema = Joi.object({
  dataPublishingMaxBatchSize: Joi.number().default(250)
})

const config = {
  dataPublishingMaxBatchSize: process.env.DATA_PUBLISHING_MAX_BATCH_SIZE
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The publishing config is invalid. ${result.error.message}`)
}

module.exports = result.value
