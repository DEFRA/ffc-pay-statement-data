const Joi = require('joi')
const mqConfig = require('./message')
const dbConfig = require('./database')
const publishingConfig = require('./publishing')

const schema = Joi.object({
  env: Joi.string().valid('development', 'test', 'production').default('development')
})

const config = {
  env: process.env.NODE_ENV
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

const value = result.value

value.isDev = value.env === 'development'
value.isTest = value.env === 'test'
value.isProd = value.env === 'production'
value.dataTopic = mqConfig.dataTopic
value.dbConfig = dbConfig
value.publishingConfig = publishingConfig

module.exports = value
