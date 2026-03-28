const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Borrow = sequelize.define('Borrow', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  book_id: { type: DataTypes.INTEGER, allowNull: false },
  borrowed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  due_date: { type: DataTypes.DATE, allowNull: false },
  returned_at: { type: DataTypes.DATE, allowNull: true },
  status: { 
    type: DataTypes.ENUM('active', 'returned', 'overdue'), 
    defaultValue: 'active' 
  }
}, {
  tableName: 'borrows',
  timestamps: true,
  underscored: true
})

module.exports = Borrow
