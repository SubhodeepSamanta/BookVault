const express = require('express')
const router = express.Router()
const borrowController = require('../controllers/borrowController')
const { verifyToken } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/role')

router.post('/', verifyToken, borrowController.reserveForPickup)
router.get('/my', verifyToken, borrowController.getMyBorrows)
router.get('/all', verifyToken, requireAdmin, borrowController.getAllBorrows)

// Lifecycle Actions
router.put('/:id/confirm-pickup', verifyToken, requireAdmin, borrowController.confirmPickup)
router.put('/:id/request-extension', verifyToken, borrowController.requestExtension)
router.put('/:id/approve-extension', verifyToken, requireAdmin, borrowController.approveExtension)
router.put('/:id/schedule-return', verifyToken, borrowController.scheduleReturn)
router.put('/:id/confirm-return', verifyToken, requireAdmin, borrowController.confirmReturn)

router.post('/batch-restock', verifyToken, requireAdmin, borrowController.batchRestockExpired)

module.exports = router

