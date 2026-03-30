const express = require('express')
const router = express.Router()
const fineController = require('../controllers/fineController')
const { verifyToken } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/role')

router.get('/my', verifyToken, fineController.getMyFines)
router.post('/:id/pay', verifyToken, fineController.initiatePayment)
router.put('/:id/confirm', verifyToken, fineController.confirmPayment)
router.get('/all', verifyToken, requireAdmin, fineController.getAllFines)
router.post('/custom', verifyToken, requireAdmin, fineController.issueCustomFine)
router.put('/:id/admin-pay', verifyToken, requireAdmin, fineController.adminMarkPaid)
router.delete('/:id/waive', verifyToken, requireAdmin, fineController.waiveFine)

module.exports = router
