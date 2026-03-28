const { Review, Book, User, Borrow } = require('../models')
const { validationResult } = require('express-validator')

exports.createReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body
    const book = await Book.findByPk(bookId)
    if (!book) return res.status(404).json({ error: 'Book not found' })

    const hasBorrowed = await Borrow.findOne({
      where: { user_id: req.user.id, book_id: bookId }
    })
    if (!hasBorrowed) {
      return res.status(403).json({ error: 'You must borrow this book before reviewing it.' })
    }

    const existingReview = await Review.findOne({
      where: { user_id: req.user.id, book_id: bookId }
    })
    if (existingReview) return res.status(400).json({ error: 'Already reviewed.' })

    const review = await Review.create({
      user_id: req.user.id,
      book_id: bookId,
      rating,
      comment
    })

    res.status(201).json({ review })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params
    const reviews = await Review.findAll({
      where: { book_id: bookId },
      include: [{ model: User, attributes: ['name', 'avatar'] }],
      order: [['created_at', 'DESC']]
    })

    const count = reviews.length
    const avg = count > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
      : 0

    res.json({ reviews, avg_rating: parseFloat(avg), count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id)
    if (!review) return res.status(404).json({ error: 'Review not found' })
    await review.destroy()
    res.json({ message: 'Review deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
