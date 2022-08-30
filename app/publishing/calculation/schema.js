const Joi = require('joi')
const { CALCULATION } = require('../types')

module.exports = Joi.object({
  calculationReference: Joi.number().required(),
  sbi: Joi.number().integer().min(105000000).max(999999999).required(),
  frn: Joi.number().integer().min(1000000000).max(9999999999).required(),
  calculationDate: Joi.date().required(),
  invoiceNumber: Joi.string().required(),
  scheme: Joi.string().required(),
  fundings: Joi.array().items(Joi.object({
    fundingCode: Joi.string().required(),
    areaClaimed: Joi.number().required(),
    rate: Joi.number().required()
  })),
  updated: Joi.date().required(),
  type: Joi.string().allow(CALCULATION)
})
