const express = require('express')
const router = express.Router()
const reservationController = require('../controllers/reservationController')
const { verifyToken } = require('../middleware/auth')

router.post('/', verifyToken, reservationController.joinWaitlist)
router.delete('/:id', verifyToken, reservationController.cancelReservation)
router.get('/my', verifyToken, reservationController.getMyReservations)

module.exports = router
