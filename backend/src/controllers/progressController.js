const { ReadingProgress, Book, Borrow } = require('../models')
const { Op } = require('sequelize')
const { validationResult } = require('express-validator')

exports.upsertProgress = async (req, res) => {
  try {
    const { bookId, pages_read } = req.body
    
    // Check if user has borrowed it
    const borrow = await Borrow.findOne({
      where: { 
        user_id: req.user.id, 
        book_id: bookId,
        returned_at: null // Must be active loan
      },
      include: [{ model: Book }]
    })

    if (!borrow) {
      return res.status(403).json({ error: 'You can only track progress for books you have currently borrowed.' })
    }

    const totalPages = borrow.Book.pages || 100 // Fallback
    const percent = Math.min(100, Math.round((pages_read / totalPages) * 100))

    const [progress, created] = await ReadingProgress.findOrCreate({
      where: { user_id: req.user.id, book_id: bookId },
      defaults: { percent, pages_read }
    })

    if (!created) {
      await progress.update({ percent, pages_read })
    }

    // Fetch updated progress with Book details to return to frontend
    const updatedProgress = await ReadingProgress.findOne({
      where: { id: progress.id },
      include: [{ model: Book, attributes: ['title', 'author', 'cover_image', 'pages'] }]
    })

    res.json({ progress: updatedProgress })
  } catch (err) {
    console.error('upsertProgress Error:', err)
    res.status(500).json({ error: err.message })
  }
}

exports.getMyProgress = async (req, res) => {
  try {
    const progress = await ReadingProgress.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Book, attributes: ['id', 'title', 'author', 'cover_image', 'pages'] }],
      order: [['updated_at', 'DESC']]
    })
    res.json({ progress })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
