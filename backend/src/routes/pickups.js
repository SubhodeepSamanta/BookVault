const express = require('express')
const router = express.Router()
const pickupController = require('../controllers/pickupController')
const { verifyToken } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/role')

router.post('/', verifyToken, pickupController.schedulePickup)
router.get('/my', verifyToken, pickupController.getMyPickups)
router.put('/:id/cancel', verifyToken, pickupController.cancelPickup)
router.put('/:id/status', verifyToken, requireAdmin, pickupController.updatePickupStatus)
router.put('/:id/collect', verifyToken, requireAdmin, pickupController.markCollected)
router.get('/all', verifyToken, requireAdmin, pickupController.getAllPickups)

module.exports = router
