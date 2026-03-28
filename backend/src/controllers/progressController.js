const { ReadingProgress, Book, Borrow } = require('../models')
const { Op } = require('sequelize')
const { validationResult } = require('express-validator')

exports.upsertProgress = async (req, res) => {
  try {
    const { bookId, percent, pages_read } = req.body
    
    // Check if user has borrowed it
    const hasBorrowed = await Borrow.findOne({
      where: { user_id: req.user.id, book_id: bookId }
    })
    if (!hasBorrowed) {
      return res.status(403).json({ error: 'You can only track progress for books you have borrowed.' })
    }

    const [progress, created] = await ReadingProgress.findOrCreate({
      where: { user_id: req.user.id, book_id: bookId },
      defaults: { percent, pages_read }
    })

    if (!created) {
      await progress.update({ percent, pages_read })
    }

    res.json({ progress })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getMyProgress = async (req, res) => {
  try {
    const progress = await ReadingProgress.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Book, attributes: ['title', 'author', 'cover_image', 'pages'] }]
    })
    res.json({ progress })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
