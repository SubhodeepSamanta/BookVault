const { Notification } = require('../models')

exports.getMyNotifications = async (req, res) => {
  try {
    const { rows: notifications, count: total } = await Notification.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 50
    })

    const unreadCount = await Notification.count({
      where: { user_id: req.user.id, is_read: false }
    })

    res.json({ notifications, unreadCount, total })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.markAllRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    )
    res.json({ message: 'All marked as read.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.markOneRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id)
    if (!notification) return res.status(404).json({ error: 'Notification not found' })
    if (notification.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })

    await notification.update({ is_read: true })
    res.json({ notification })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
