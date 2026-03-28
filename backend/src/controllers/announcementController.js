const { Announcement, User } = require('../models')
const { validationResult } = require('express-validator')

exports.getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      where: { is_active: true },
      include: [{ model: User, as: 'admin', attributes: ['name'] }],
      order: [['created_at', 'DESC']]
    })
    res.json({ announcements })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      include: [{ model: User, as: 'admin', attributes: ['name'] }],
      order: [['created_at', 'DESC']]
    })
    res.json({ announcements })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.createAnnouncement = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { title, body } = req.body
    const announcement = await Announcement.create({
      title,
      body,
      admin_id: req.user.id
    })
    res.status(201).json({ announcement })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.toggleAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id)
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' })
    
    await announcement.update({ is_active: !announcement.is_active })
    res.json({ announcement })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id)
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' })
    await announcement.destroy()
    res.json({ message: 'Deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
