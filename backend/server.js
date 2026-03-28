require('dotenv').config()
const app = require('./src/app')
const { sequelize } = require('./src/config/db')
const { seedDatabase } = require('./src/config/seed')
const fineJob = require('./src/jobs/fineJob')

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await sequelize.authenticate()
    console.log('Database connected.')
    
    // sync all models — alter:true is safe for 
    // development and minor changes in production
    await sequelize.sync({ alter: true })
    console.log('Models synced.')
    
    // seed admin + branches + sample books on first run
    await seedDatabase()
    
    // start nightly fine calculation job
    fineJob.start()
    
    app.listen(PORT, () => {
      console.log(`BookVault API running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Startup failed:', err)
    process.exit(1)
  }
}

start()
