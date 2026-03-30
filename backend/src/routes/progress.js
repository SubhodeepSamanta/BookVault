const express = require('express')
const router = express.Router()
const progressController = require('../controllers/progressController')
const { verifyToken } = require('../middleware/auth')
const { body } = require('express-validator')

router.post('/', [
  verifyToken,
  body('bookId').notEmpty(),
  body('pages_read').isInt({ min: 0 })
], progressController.upsertProgress)

router.post('/upsert', [
  verifyToken,
  body('bookId').notEmpty(),
  body('pages_read').isInt({ min: 0 })
], progressController.upsertProgress)



router.get('/my', verifyToken, progressController.getMyProgress)

module.exports = router
