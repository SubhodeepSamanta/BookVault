const express = require('express')
const router = express.Router()
const borrowController = require('../controllers/borrowController')
const { verifyToken } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/role')

router.post('/', verifyToken, borrowController.borrowBook)
router.put('/:id/return', verifyToken, borrowController.returnBook)
router.get('/my', verifyToken, borrowController.getMyBorrows)
router.get('/all', verifyToken, requireAdmin, borrowController.getAllBorrows)

module.exports = router
