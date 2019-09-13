
const wpr = require('./index')

/* global test */
test('Get expiration for nitra.ai', async () => {
  await wpr.start('record')

  // start play or record
  await wpr.stop()
}, 30000)
