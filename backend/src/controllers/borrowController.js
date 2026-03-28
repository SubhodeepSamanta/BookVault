const { Borrow, Book, User, Fine, Notification } = require('../models')
const { Op } = require('sequelize')
const { calculateFine } = require('../services/fineService')
const { notifyNextInQueue } = require('../services/queueService')
const { validationResult } = require('express-validator')

exports.borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body
    const book = await Book.findByPk(bookId)
    
    if (!book) return res.status(404).json({ error: 'Book not found' })
    if (book.available_copies === 0) {
      return res.status(400).json({ error: 'No copies available. Join the waitlist instead.' })
    }

    const existingBorrow = await Borrow.findOne({
      where: { user_id: req.user.id, book_id: bookId, status: { [Op.in]: ['active', 'overdue'] } }
    })
    if (existingBorrow) {
      return res.status(400).json({ error: 'You already have an active borrow for this book.' })
    }

    const duration = parseInt(process.env.BORROW_DURATION_DAYS || 14)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + duration)

    const borrow = await Borrow.create({
      user_id: req.user.id,
      book_id: bookId,
      due_date: dueDate,
      status: 'active'
    })

    await book.decrement('available_copies', { by: 1 })

    await Notification.create({
      user_id: req.user.id,
      type: 'book_borrowed',
      message: `You have borrowed "${book.title}". Due back by ${dueDate.toLocaleDateString()}.`,
      ref_id: borrow.id,
      ref_type: 'borrow'
    })

    res.status(201).json({ borrow, message: 'Book borrowed.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, { include: [Book] })
    if (!borrow) return res.status(404).json({ error: 'Borrow record not found' })
    if (borrow.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })
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
        defaults: { user_id: req.user.id, amount: fineAmt }
      })
      await Notification.create({
        user_id: req.user.id,
        type: 'fine_added',
        message: `Late return fine of ₹${fineAmt.toFixed(2)} added to your account for "${book.title}".`,
        ref_id: borrow.id,
        ref_type: 'borrow'
      })
    }

    await notifyNextInQueue(book.id)

    res.json({ message: 'Book returned.', fine: fineAmt })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getMyBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Book, attributes: ['title', 'author', 'cover_image', 'cover_bg', 'cover_accent', 'cover_text'] }],
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
