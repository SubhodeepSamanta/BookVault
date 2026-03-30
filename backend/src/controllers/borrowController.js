const { Borrow, Book, User, Fine, Notification } = require('../models')
const { Op } = require('sequelize')
const { calculateFine } = require('../services/fineService')
const { notifyNextInQueue } = require('../services/queueService')

exports.reserveForPickup = async (req, res) => {
  try {
    const { bookId, pickupDate, pickupTime, branchId } = req.body

    // Input Validation
    if (!bookId || !pickupDate || !pickupTime || !branchId) {
       return res.status(400).json({ error: 'Missing required reservation fields (bookId, pickupDate, pickupTime, branchId).' })
    }
    
    // 1. Check for max active/reserved borrowings (limit 3)
    const activeCount = await Borrow.count({
      where: { 
        user_id: req.user.id, 
        status: { [Op.in]: ['reserved', 'active', 'overdue'] } 
      }
    })
    if (activeCount >= 3) {
      return res.status(400).json({ error: 'Reservation Limit Reached: You can have a maximum of 3 active or reserved books simultaneously.' })
    }

    // 2. Check for overdue books
    const overdueCount = await Borrow.count({
      where: { 
        user_id: req.user.id, 
        status: 'overdue' 
      }
    })
    if (overdueCount > 0) {
      return res.status(400).json({ error: 'Account Restricted: Please return your overdue volumes before making new reservations.' })
    }

    const book = await Book.findByPk(bookId)
    if (!book) return res.status(404).json({ error: 'Book not found' })
    if (book.available_copies === 0) {
      return res.status(400).json({ error: 'No copies available. Join the waitlist instead.' })
    }

    const existingBorrow = await Borrow.findOne({
      where: { user_id: req.user.id, book_id: bookId, status: { [Op.in]: ['reserved', 'active', 'overdue'] } }
    })
    if (existingBorrow) {
      return res.status(400).json({ error: 'You already have an active request for this book.' })
    }

    const duration = parseInt(process.env.BORROW_DURATION_DAYS || 14)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + duration)

    const borrow = await Borrow.create({
      user_id: req.user.id,
      book_id: parseInt(bookId),
      due_date: dueDate,
      status: 'reserved',
      pickupDate: pickupDate,
      pickupTimeSlot: pickupTime,
      branchId: parseInt(branchId)
    })

    // Decr on reservation logic
    await book.decrement('available_copies', { by: 1 })

    const formattedDate = new Date(pickupDate).toLocaleDateString()
    await Notification.create({
      user_id: req.user.id,
      type: 'book_reserved',
      message: `You have reserved "${book.title}" for pickup. Please collect it on ${formattedDate}.`,
      ref_id: borrow.id,
      ref_type: 'borrow'
    })

    res.status(201).json({ borrow, message: 'Book reserved for pickup. Please collect it at the scheduled time.' })
  } catch (err) {
    console.error('RESERVE_ERROR_FULL:', err);
    res.status(500).json({ error: err.message || 'Server encountered an error during reservation.' })
  }
}

exports.confirmPickup = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, { include: [Book] })
    if (!borrow) return res.status(404).json({ error: 'Record not found' })
    if (borrow.status !== 'reserved') return res.status(400).json({ error: 'Only reserved books can be confirmed for pickup' })

    await borrow.update({
      status: 'active',
      borrowed_at: new Date()
    })

    await Notification.create({
      user_id: borrow.user_id,
      type: 'pickup_confirmed',
      message: `Your pickup for "${borrow.Book.title}" has been confirmed. Enjoy your reading!`,
      ref_id: borrow.id,
      ref_type: 'borrow'
    })

    res.json({ message: 'Pickup confirmed. Book is now active.', borrow })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.batchRestockExpired = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const expired = await Borrow.findAll({
      where: {
        status: 'reserved',
        pickup_date: { [Op.lt]: today }
      },
      include: [Book]
    })

    let count = 0
    for (const b of expired) {
      await b.update({ status: 'cancelled' })
      await b.Book.increment('available_copies', { by: 1 })
      
      await Notification.create({
        user_id: b.user_id,
        type: 'reservation_expired',
        message: `Your reservation for "${b.Book.title}" has expired and the copy has been restocked.`,
        ref_id: b.id,
        ref_type: 'borrow'
      })
      count++
    }

    res.json({ message: `${count} expired reservations restocked.`, restockedCount: count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, { include: [Book] })
    if (!borrow) return res.status(404).json({ error: 'Borrow record not found' })
    if (borrow.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' })
    if (borrow.status === 'returned') return res.status(400).json({ error: 'Book already returned' })

    await borrow.update({
      returned_at: new Date(),
      status: 'returned'
    })

    const book = borrow.Book
    await book.increment('available_copies', { by: 1 })

    const fineAmt = calculateFine(borrow.due_date)
    if (fineAmt > 0) {
      await Fine.findOrCreate({
        where: { borrow_id: borrow.id },
        defaults: { user_id: borrow.user_id, amount: fineAmt }
      })
      await Notification.create({
        user_id: borrow.user_id,
        type: 'fine_added',
        message: `Late return fine of ₹${fineAmt.toFixed(2)} added to your account for "${book.title}".`,
        ref_id: borrow.id,
        ref_type: 'borrow'
      })
    }

    await notifyNextInQueue(book.id)

    res.json({ message: 'Book returned successfully.', fine: fineAmt })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getMyBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Book, attributes: ['id', 'title', 'author', 'cover_image', 'cover_bg', 'cover_accent', 'cover_text', 'genre'] }],
      order: [['created_at', 'DESC']]
    })
    res.json({ borrows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getAllBorrows = async (req, res) => {
  try {
    let { status, page = 1, limit = 20 } = req.query
    page = parseInt(page)
    limit = parseInt(limit)
    const offset = (page - 1) * limit

    const where = {}
    if (status) where.status = status

    const { count, rows } = await Borrow.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, attributes: ['name', 'email', 'card_id'] },
        { model: Book, attributes: ['title', 'author'] }
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
