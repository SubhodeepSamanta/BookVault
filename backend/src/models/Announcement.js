const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Announcement = sequelize.define('Announcement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  admin_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'announcements',
  timestamps: true,
  underscored: true
})

module.exports = Announcement
