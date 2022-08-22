require('./insights').setup()
require('log-timestamp')
const publish = require('./publishing')

module.exports = (async () => {
  console.log('Ready to process data')
  await publish()
})()
