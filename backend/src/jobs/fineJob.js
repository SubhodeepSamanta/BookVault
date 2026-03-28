const cron = require('node-cron')
const { processOverdueBorrows } = require('../services/fineService')
const { expireStaleReservations } = require('../services/queueService')

// Runs every day at midnight (00:00)
const job = cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Running nightly jobs...')
  try {
    await processOverdueBorrows()
    await expireStaleReservations()
    console.log('[CRON] Nightly jobs complete.')
  } catch (err) {
    console.error('[CRON] Job failed:', err)
  }
}, { scheduled: false }) // start() called in server.js

module.exports = job
