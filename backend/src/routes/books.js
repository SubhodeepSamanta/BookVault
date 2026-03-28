const express = require('express')
const router = express.Router()
const bookController = require('../controllers/bookController')
const { verifyToken } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/role')
const { uploadSingle } = require('../middleware/upload')
const { body } = require('express-validator')

router.get('/', bookController.getAllBooks)
router.get('/featured', bookController.getFeaturedBook)
router.get('/:id', bookController.getBookById)

router.post('/', [
  verifyToken, 
  requireAdmin,
  uploadSingle,
  body('title').notEmpty().withMessage('Title is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('total_copies').isInt({ min: 1 }).withMessage('Total copies must be at least 1')
], bookController.createBook)

router.put('/:id', [
  verifyToken, 
  requireAdmin,
  uploadSingle
], bookController.updateBook)

router.delete('/:id', verifyToken, requireAdmin, bookController.deleteBook)

module.exports = router
