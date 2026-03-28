const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Fine = sequelize.define('Fine', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  borrow_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0.00 },
  paid: { type: DataTypes.BOOLEAN, defaultValue: false },
  paid_at: { type: DataTypes.DATE, allowNull: true },
  txn_id: { type: DataTypes.STRING(100), allowNull: true }
}, {
  tableName: 'fines',
  timestamps: true,
  underscored: true
})

module.exports = Fine
