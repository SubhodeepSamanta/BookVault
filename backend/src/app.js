const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')

const app = express()

// CORS — allow frontend dev + production URLs
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// HTTP logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Serve uploaded files statically
app.use('/uploads', express.static(
  path.join(__dirname, '../uploads')))

// Health check — Render pings this
app.get('/health', (req, res) => {
  res.json({ status: 'ok', 
    timestamp: new Date().toISOString() })
})

// Mount all routers
app.use('/api/auth',          require('./routes/auth'))
app.use('/api/books',         require('./routes/books'))
app.use('/api/borrows',       require('./routes/borrows'))
app.use('/api/reservations',  require('./routes/reservations'))
app.use('/api/reviews',       require('./routes/reviews'))
app.use('/api/pickups',       require('./routes/pickups'))
app.use('/api/fines',         require('./routes/fines'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/progress',      require('./routes/progress'))
app.use('/api/announcements', require('./routes/announcements'))
app.use('/api/admin',         require('./routes/admin'))
app.use('/api/branches',      require('./routes/branches'))

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  })
})

module.exports = app
