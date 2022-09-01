const removeNullProperties = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) => ((value === null || key.endsWith('Id')) ? undefined : value)))
}

module.exports = removeNullProperties
