const { Sequelize } = require('sequelize')

let sequelize

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' 
      ? console.log : false,
    pool: {
      max: 5, min: 0, acquire: 30000, idle: 10000
    }
  })
} else {
  const sslConfig = process.env.DB_SSL === 'true' ? {
    ssl: {
      rejectUnauthorized: false // Default to false for ease of setup, but allow CA
    }
  } : {}

  if (process.env.DB_CA_PATH) {
    const fs = require('fs')
    try {
      sslConfig.ssl.ca = fs.readFileSync(process.env.DB_CA_PATH)
      sslConfig.ssl.rejectUnauthorized = true
    } catch (err) {
      console.warn('Could not read CA file, falling back to rejectUnauthorized: false')
    }
  }

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      dialectOptions: sslConfig,
      logging: process.env.NODE_ENV === 'development'
        ? console.log : false,
      pool: {
        max: 5, min: 0, acquire: 30000, idle: 10000
      }
    }
  )
}

module.exports = { sequelize }
