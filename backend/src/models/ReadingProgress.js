const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const ReadingProgress = sequelize.define('ReadingProgress', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  book_id: { type: DataTypes.INTEGER, allowNull: false },
  percent: { 
    type: DataTypes.TINYINT, 
    defaultValue: 0,
    validate: { min: 0, max: 100 } 
  },
  pages_read: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'reading_progress',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'book_id']
    }
  ]
})

module.exports = ReadingProgress
