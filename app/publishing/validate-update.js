const util = require('util')

const validateUpdate = (update, type) => {
  const schema = require(`./${type}/schema`)
  const validationResult = schema.validate(update, { abortEarly: false })
  if (validationResult.error) {
    console.log(`${type} dataset is invalid, ${validationResult.error.message}`, util.inspect(update, false, null, true))
    return false
  }
  return true
}

module.exports = validateUpdate
