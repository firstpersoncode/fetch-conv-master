const logger = require('../lib/logger')

logger.info('Starting server...')
require('../../server/main').listen(6501, () => {
  logger.success('Server is running at http://localhost:6501')
})
