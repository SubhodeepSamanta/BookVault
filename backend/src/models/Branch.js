const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Branch = sequelize.define('Branch', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  address: { type: DataTypes.STRING(255) },
  open_time: { type: DataTypes.TIME },
  close_time: { type: DataTypes.TIME }
}, {
  tableName: 'branches',
  timestamps: false
})

module.exports = Branch
