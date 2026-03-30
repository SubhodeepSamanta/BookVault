require('dotenv').config()
const { Sequelize } = require('sequelize')

let sequelize

const useIndividual = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

if (useIndividual) {
  console.log('Using individual DB fields. Target Database:', process.env.DB_NAME);
  const sslConfig = process.env.DB_SSL === 'true' ? {
    ssl: {
      rejectUnauthorized: false
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
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    }
  )
} else if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL connection string.');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  })
} else {
  console.error('No database configuration found! Set DB_NAME etc. or DATABASE_URL.');
  process.exit(1);
}

module.exports = { sequelize }
