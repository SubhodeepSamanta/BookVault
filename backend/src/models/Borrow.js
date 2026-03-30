const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Borrow = sequelize.define('Borrow', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  book_id: { type: DataTypes.INTEGER, allowNull: false },
  borrowed_at: { type: DataTypes.DATE, allowNull: true }, // Set when physically picked up
  due_date: { type: DataTypes.DATE, allowNull: false },
  returned_at: { type: DataTypes.DATE, allowNull: true },
  
  // Reservation & Physical Logistics
  pickupDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'pickup_date' },
  pickupTimeSlot: { type: DataTypes.STRING(30), allowNull: true, field: 'pickup_time_slot' },
  returnDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'return_date' },
  returnTimeSlot: { type: DataTypes.STRING(30), allowNull: true, field: 'return_time_slot' },
  branchId: { type: DataTypes.INTEGER, allowNull: true, field: 'branch_id' },

  status: { 
    type: DataTypes.ENUM('reserved', 'active', 'returned', 'overdue', 'cancelled'), 
    defaultValue: 'reserved' 
  },

  // Extension Tracking
  extensionStatus: { 
    type: DataTypes.ENUM('none', 'requested', 'approved', 'rejected'), 
    defaultValue: 'none',
    field: 'extension_status'
  },
  hasExtended: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false,
    field: 'has_extended'
  },

  // Return Tracking (Physical Handover)
  returnStatus: { 
    type: DataTypes.ENUM('none', 'scheduled', 'returned'), 
    defaultValue: 'none',
    field: 'return_status'
  },
  
  adminNote: { 
    type: DataTypes.TEXT, 
    allowNull: true,
    field: 'admin_note'
  }

}, {
  tableName: 'borrows',
  timestamps: true,
  underscored: true
})

module.exports = Borrow
