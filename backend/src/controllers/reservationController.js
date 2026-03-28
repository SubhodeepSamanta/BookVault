const { Reservation, Book, Notification } = require('../models')
const { Op } = require('sequelize')
const { validationResult } = require('express-validator')

exports.joinWaitlist = async (req, res) => {
  try {
    const { bookId } = req.body
    const book = await Book.findByPk(bookId)
    if (!book) return res.status(404).json({ error: 'Book not found' })

    const activeRes = await Reservation.findOne({
      where: {
        user_id: req.user.id,
        book_id: bookId,
        status: { [Op.in]: ['waiting', 'notified'] }
      }
    })
    if (activeRes) return res.status(400).json({ error: 'You already have an active reservation for this book.' })

    const { Borrow } = require('../models')
    const activeBorrow = await Borrow.findOne({
      where: { user_id: req.user.id, book_id: bookId, status: { [Op.in]: ['active', 'overdue'] } }
    })
    if (activeBorrow) return res.status(400).json({ error: 'You already have an active borrow of this book.' })

    const queueLength = await Reservation.count({
      where: { book_id: bookId, status: { [Op.in]: ['waiting', 'notified'] } }
    })

    const reservation = await Reservation.create({
      user_id: req.user.id,
      book_id: bookId,
      status: 'waiting',
      queue_pos: queueLength + 1
    })

    await Notification.create({
      user_id: req.user.id,
      type: 'reservation_joined',
      message: `You are #${reservation.queue_pos} in the queue for "${book.title}".`,
      ref_id: reservation.id,
      ref_type: 'reservation'
    })

    res.status(201).json({ reservation })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id)
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' })
    if (reservation.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })
    if (!['waiting', 'notified'].includes(reservation.status)) {
      return res.status(400).json({ error: 'Cannot cancel this reservation' })
    }

    await reservation.update({ status: 'expired' })

    await Reservation.decrement('queue_pos', {
      where: {
        book_id: reservation.book_id,
        queue_pos: { [Op.gt]: reservation.queue_pos },
        status: 'waiting'
      }
    })

    res.json({ message: 'Reservation cancelled.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Book, attributes: ['title', 'author', 'cover_image', 'cover_bg', 'cover_accent', 'cover_text'] }],
      order: [['created_at', 'DESC']]
    })
    res.json({ reservations })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
