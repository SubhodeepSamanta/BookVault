const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Book = sequelize.define('Book', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  author: { type: DataTypes.STRING(255), allowNull: false },
  isbn: { type: DataTypes.STRING(20), unique: true, allowNull: true },
  genre: { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
  cover_image: { type: DataTypes.STRING(255), allowNull: true },
  cover_bg: { type: DataTypes.STRING(20) },
  cover_accent: { type: DataTypes.STRING(20) },
  cover_text: { type: DataTypes.STRING(20) },
  total_copies: { type: DataTypes.INTEGER, defaultValue: 1 },
  available_copies: { type: DataTypes.INTEGER, defaultValue: 1 },
  published_year: { type: DataTypes.INTEGER },
  pages: { type: DataTypes.INTEGER },
  language: { type: DataTypes.STRING(50), defaultValue: 'English' },
  gutenberg_url: { type: DataTypes.STRING(255), allowNull: true },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'books',
  timestamps: true,
  underscored: true
})

module.exports = Book
