const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notificationController')
const { verifyToken } = require('../middleware/auth')

router.get('/', verifyToken, notificationController.getMyNotifications)
router.put('/read-all', verifyToken, notificationController.markAllRead)
router.put('/:id/read', verifyToken, notificationController.markOneRead)

module.exports = router
