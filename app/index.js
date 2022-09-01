require('./insights').setup()
require('log-timestamp')
const publish = require('./publishing')

module.exports = (async () => {
  console.log('Ready to publish data')
  await publish()
  console.log('All outstanding valid datasets published')
})()
