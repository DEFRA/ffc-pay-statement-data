const validateUpdate = (update, type) => {
  const schema = require(`./${type}/schema`)
  const validationResult = schema.validate(update, { abortEarly: false })
  if (validationResult.error) {
    throw new Error(`Statement content is invalid, ${validationResult.error.message}`)
  }
}

module.exports = validateUpdate
