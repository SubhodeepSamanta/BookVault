const express = require('express')
const router = express.Router()
const reviewController = require('../controllers/reviewController')
const { verifyToken } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/role')
const { body } = require('express-validator')

router.post('/', [
  verifyToken,
  body('bookId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 })
], reviewController.createReview)

router.get('/book/:bookId', reviewController.getBookReviews)
router.delete('/:id', verifyToken, requireAdmin, reviewController.deleteReview)

module.exports = router
