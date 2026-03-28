const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Reservation = sequelize.define('Reservation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  book_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { 
    type: DataTypes.ENUM('waiting', 'notified', 'claimed', 'expired'), 
    defaultValue: 'waiting' 
  },
  queue_pos: { type: DataTypes.INTEGER, allowNull: false },
  notified_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'reservations',
  timestamps: true,
  underscored: true
})

module.exports = Reservation
