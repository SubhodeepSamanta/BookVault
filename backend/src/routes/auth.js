const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { verifyToken } = require('../middleware/auth')
const { body } = require('express-validator')

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], authController.register)

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login)

router.get('/me', verifyToken, authController.getMe)

module.exports = router
