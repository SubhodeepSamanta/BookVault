const { sequelize } = require('../config/db')
const User = require('./User')
const Book = require('./Book')
const Borrow = require('./Borrow')
const Fine = require('./Fine')
const Reservation = require('./Reservation')
const Review = require('./Review')
const Pickup = require('./Pickup')
const Notification = require('./Notification')
const ReadingProgress = require('./ReadingProgress')
const Announcement = require('./Announcement')
const Branch = require('./Branch')

// USER ASSOCIATIONS
User.hasMany(Borrow, { foreignKey: 'user_id' })
Borrow.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(Fine, { foreignKey: 'user_id' })
Fine.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(Reservation, { foreignKey: 'user_id' })
Reservation.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(Review, { foreignKey: 'user_id' })
Review.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(Pickup, { foreignKey: 'user_id' })
Pickup.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(Notification, { foreignKey: 'user_id' })
Notification.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(ReadingProgress, { foreignKey: 'user_id' })
ReadingProgress.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(Announcement, { foreignKey: 'admin_id', as: 'announcements' })
Announcement.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' })

// BOOK ASSOCIATIONS
Book.hasMany(Borrow, { foreignKey: 'book_id' })
Borrow.belongsTo(Book, { foreignKey: 'book_id' })

Book.hasMany(Reservation, { foreignKey: 'book_id' })
Reservation.belongsTo(Book, { foreignKey: 'book_id' })

Book.hasMany(Review, { foreignKey: 'book_id' })
Review.belongsTo(Book, { foreignKey: 'book_id' })

Book.hasMany(Pickup, { foreignKey: 'book_id' })
Pickup.belongsTo(Book, { foreignKey: 'book_id' })

Book.hasMany(ReadingProgress, { foreignKey: 'book_id' })
ReadingProgress.belongsTo(Book, { foreignKey: 'book_id' })

// OTHER ASSOCIATIONS
Borrow.hasOne(Fine, { foreignKey: 'borrow_id' })
Fine.belongsTo(Borrow, { foreignKey: 'borrow_id' })

Branch.hasMany(Pickup, { foreignKey: 'branch_id' })
Pickup.belongsTo(Branch, { foreignKey: 'branch_id' })

module.exports = {
  sequelize,
  User,
  Book,
  Borrow,
  Fine,
  Reservation,
  Review,
  Pickup,
  Notification,
  ReadingProgress,
  Announcement,
  Branch
}
