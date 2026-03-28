const { Notification } = require('../models')

async function createNotification(
  userId, type, message, refId = null, refType = null) {
  return Notification.create({
    user_id: userId, type, message,
    ref_id: refId, ref_type: refType
  })
}

module.exports = { createNotification }
