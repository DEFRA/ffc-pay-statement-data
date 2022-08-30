const Joi = require('joi')
const { ORGANISATION } = require('../types')

module.exports = Joi.object({
  name: Joi.string().required(),
  sbi: Joi.number().integer().min(105000000).max(999999999).required(),
  frn: Joi.number().integer().min(1000000000).max(9999999999).required(),
  addressLine1: Joi.string().optional(),
  addressLine2: Joi.string().optional(),
  addressLine3: Joi.string().optional(),
  city: Joi.string().optional(),
  county: Joi.string().optional(),
  postcode: Joi.string().required(),
  emailAddress: Joi.string().email().optional(),
  updated: Joi.date().required(),
  type: Joi.string().allow(ORGANISATION)
})
