const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const { verifyToken } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/role')

router.get('/stats', verifyToken, requireAdmin, adminController.getDashboardStats)
router.get('/users', verifyToken, requireAdmin, adminController.getAllUsers)
router.put('/users/:id/status', verifyToken, requireAdmin, adminController.updateUserStatus)

module.exports = router
