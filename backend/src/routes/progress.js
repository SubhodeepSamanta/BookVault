const express = require('express')
const router = express.Router()
const progressController = require('../controllers/progressController')
const { verifyToken } = require('../middleware/auth')
const { body } = require('express-validator')

router.post('/', [
  verifyToken,
  body('bookId').notEmpty(),
  body('percent').isInt({ min: 0, max: 100 })
], progressController.upsertProgress)

router.get('/my', verifyToken, progressController.getMyProgress)

module.exports = router
