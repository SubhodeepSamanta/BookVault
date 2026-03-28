const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  ref_id: { type: DataTypes.INTEGER, allowNull: true },
  ref_type: { type: DataTypes.STRING(50), allowNull: true }
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true
})

module.exports = Notification
