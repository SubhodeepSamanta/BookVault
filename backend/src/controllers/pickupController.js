const { Pickup, Book, Branch, User, Borrow, Reservation } = require('../models')
const { Op } = require('sequelize')
const { validationResult } = require('express-validator')

exports.schedulePickup = async (req, res) => {
  try {
    const { bookId, branchId, slotDate, slotTime } = req.body
    
    const book = await Book.findByPk(bookId)
    if (!book) return res.status(404).json({ error: 'Book not found' })
    
    const branch = await Branch.findByPk(branchId)
    if (!branch) return res.status(404).json({ error: 'Branch not found' })

    const eligible = await Borrow.findOne({
      where: { user_id: req.user.id, book_id: bookId, status: { [Op.in]: ['active', 'overdue'] } }
    }) || await Reservation.findOne({
      where: { user_id: req.user.id, book_id: bookId, status: 'notified' }
    })

    if (!eligible) {
      return res.status(403).json({ error: 'You must have an active borrow or notified reservation to schedule a pickup.' })
    }

    const slot = new Date(slotDate)
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 14)
    if (slot > maxDate) {
      return res.status(400).json({ error: 'Pickup can only be scheduled within the next 14 days.' })
    }

    const existing = await Pickup.findOne({
      where: { 
        user_id: req.user.id, 
        book_id: bookId, 
        status: { [Op.in]: ['pending', 'confirmed'] } 
      }
    })
    if (existing) return res.status(400).json({ error: 'You already have a pending or confirmed pickup for this book.' })

    const pickup = await Pickup.create({
      user_id: req.user.id,
      book_id: bookId,
      branch_id: branchId,
      slot_date: slotDate,
      slot_time: slotTime,
      status: 'pending'
    })

    const { Notification } = require('../models')
    await Notification.create({
      user_id: req.user.id,
      type: 'pickup_scheduled',
      message: `Pickup scheduled at ${branch.name} on ${slotDate} at ${slotTime}. Pending confirmation.`,
      ref_id: pickup.id,
      ref_type: 'pickup'
    })

    res.status(201).json({ pickup })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getMyPickups = async (req, res) => {
  try {
    const pickups = await Pickup.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Book, attributes: ['title', 'author', 'cover_image', 'cover_bg', 'cover_accent', 'cover_text'] },
        { model: Branch, attributes: ['name', 'address'] }
      ],
      order: [['slot_date', 'ASC'], ['slot_time', 'ASC']]
    })
    res.json({ pickups })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.cancelPickup = async (req, res) => {
  try {
    const pickup = await Pickup.findByPk(req.params.id)
    if (!pickup) return res.status(404).json({ error: 'Pickup not found' })
    if (pickup.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })
    if (pickup.status !== 'pending') return res.status(400).json({ error: 'Only pending pickups can be cancelled.' })

    await pickup.update({ status: 'rejected' })
    res.json({ message: 'Pickup cancelled.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updatePickupStatus = async (req, res) => {
  try {
    const { status, admin_note } = req.body
    const pickup = await Pickup.findByPk(req.params.id, { include: [Branch] })
    if (!pickup) return res.status(404).json({ error: 'Pickup not found' })

    await pickup.update({ status, admin_note })

    const { Notification } = require('../models')
    if (status === 'confirmed') {
      await Notification.create({
        user_id: pickup.user_id,
        type: 'pickup_confirmed',
        message: `Your pickup at ${pickup.Branch.name} has been confirmed.`,
        ref_id: pickup.id,
        ref_type: 'pickup'
      })
    } else if (status === 'rejected') {
      await Notification.create({
        user_id: pickup.user_id,
        type: 'pickup_rejected',
        message: `Your pickup at ${pickup.Branch.name} was rejected. Note: ${admin_note || 'None'}`,
        ref_id: pickup.id,
        ref_type: 'pickup'
      })
    }

    res.json({ pickup })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getAllPickups = async (req, res) => {
  try {
    let { status, page = 1, limit = 20 } = req.query
    page = parseInt(page)
    limit = parseInt(limit)
    const offset = (page - 1) * limit

    const where = {}
    if (status) where.status = status

    const { count, rows } = await Pickup.findAndCountAll({
      where,
      limit,
      offset,
      order: [['slot_date', 'ASC'], ['slot_time', 'ASC']],
      include: [
        { model: User, attributes: ['name', 'card_id'] },
        { model: Book, attributes: ['title'] },
        { model: Branch, attributes: ['name'] }
      ]
    })

    res.json({
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      limit
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.markCollected = async (req, res) => {
  try {
    const pickup = await Pickup.findByPk(req.params.id)
    if (!pickup) return res.status(404).json({ error: 'Pickup not found' })
    await pickup.update({ status: 'collected' })
    res.json({ pickup })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
