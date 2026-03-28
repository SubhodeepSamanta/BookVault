const { Reservation, Notification } = require('../models')
const { Op } = require('sequelize')

// When a book is returned, notify the next
// person in the reservation queue
async function notifyNextInQueue(bookId) {
  const next = await Reservation.findOne({
    where: { book_id: bookId, status: 'waiting' },
    order: [['queue_pos', 'ASC']]
  })

  if (!next) return null

  await next.update({
    status: 'notified',
    notified_at: new Date()
  })

  // Create in-app notification
  await Notification.create({
    user_id: next.user_id,
    type: 'reservation_ready',
    message: 'A copy of your reserved book is now available! You have 48 hours to borrow or schedule a pickup.',
    ref_id: next.id,
    ref_type: 'reservation'
  })

  return next
}

// Expire reservations older than 48hrs
// after being notified (called by cron job)
async function expireStaleReservations() {
  const cutoff = new Date(
    Date.now() - 48 * 60 * 60 * 1000)

  const stale = await Reservation.findAll({
    where: {
      status: 'notified',
      notified_at: { [Op.lt]: cutoff }
    }
  })

  for (const r of stale) {
    await r.update({ status: 'expired' })
    // Re-queue: notify next person
    await notifyNextInQueue(r.book_id)
  }

  return stale.length
}

module.exports = { notifyNextInQueue, expireStaleReservations }
