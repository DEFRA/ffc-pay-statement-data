const db = require('../data')

const getPrimaryKey = (object, type) => {
  return object[db[type].primaryKeyAttributes[0]]
}

module.exports = getPrimaryKey
