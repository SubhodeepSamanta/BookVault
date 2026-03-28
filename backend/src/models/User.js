const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true,
    autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false,
    unique: true,
    validate: { isEmail: true } },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('student','admin'),
    defaultValue: 'student' },
  card_id: { type: DataTypes.STRING(20), unique: true },
  avatar: { type: DataTypes.STRING(255), allowNull: true },
  status: { type: DataTypes.ENUM('active','inactive'),
    defaultValue: 'active' },
}, { tableName: 'users', timestamps: true,
  underscored: true })

module.exports = User
