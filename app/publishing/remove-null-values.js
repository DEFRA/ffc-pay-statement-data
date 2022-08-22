const removeNullProperties = (obj) => {
  return JSON.parse(JSON.stringify(obj, (_key, value) => (value === null ? undefined : value)))
}

module.exports = removeNullProperties
