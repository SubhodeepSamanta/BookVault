const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  book_id: { type: DataTypes.INTEGER, allowNull: false },
  rating: { 
    type: DataTypes.TINYINT, 
    allowNull: false,
    validate: { min: 1, max: 5 } 
  },
  comment: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'reviews',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'book_id']
    }
  ]
})

module.exports = Review
