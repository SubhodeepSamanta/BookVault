const express = require('express')
const router = express.Router()
const announcementController = require('../controllers/announcementController')
const { verifyToken } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/role')
const { body } = require('express-validator')

router.get('/', announcementController.getActiveAnnouncements)
router.get('/all', verifyToken, requireAdmin, announcementController.getAllAnnouncements)

router.post('/', [
  verifyToken,
  requireAdmin,
  body('title').notEmpty(),
  body('body').notEmpty()
], announcementController.createAnnouncement)

router.put('/:id/toggle', verifyToken, requireAdmin, announcementController.toggleAnnouncement)
router.delete('/:id', verifyToken, requireAdmin, announcementController.deleteAnnouncement)

module.exports = router
