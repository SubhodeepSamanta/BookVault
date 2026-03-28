const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { validationResult } = require('express-validator')

const generateCardId = async () => {
  const year = new Date().getFullYear()
  let cardId
  let exists = true
  
  while (exists) {
    const random = Math.floor(Math.random() * 90000) + 10000 // 5-digit
    cardId = `BV-${year}-${random}`
    const user = await User.findOne({ where: { card_id: cardId } })
    if (!user) exists = false
  }
  return cardId
}

exports.register = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { name, email, password } = req.body
    
    const existing = await User.findOne({ where: { email } })
    if (existing) return res.status(400).json({ error: 'Email already registered' })

    const hashedPassword = await bcrypt.hash(password, 12)
    const cardId = await generateCardId()

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      card_id: cardId,
      role: 'student'
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, cardId: user.card_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        card_id: user.card_id
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })

    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    if (user.status === 'inactive') return res.status(403).json({ error: 'Account deactivated' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, cardId: user.card_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        card_id: user.card_id,
        avatar: user.avatar
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
