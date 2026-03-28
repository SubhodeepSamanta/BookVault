const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Pickup = sequelize.define('Pickup', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  book_id: { type: DataTypes.INTEGER, allowNull: false },
  branch_id: { type: DataTypes.INTEGER, allowNull: false },
  slot_date: { type: DataTypes.DATEONLY, allowNull: false },
  slot_time: { type: DataTypes.STRING(30), allowNull: false },
  status: { 
    type: DataTypes.ENUM('pending', 'confirmed', 'rejected', 'collected'), 
    defaultValue: 'pending' 
  },
  admin_note: { type: DataTypes.STRING(255), allowNull: true }
}, {
  tableName: 'pickups',
  timestamps: true,
  underscored: true
})

module.exports = Pickup
