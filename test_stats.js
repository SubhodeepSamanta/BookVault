require('dotenv').config({ path: './backend/.env' })
const { Book, User, Borrow, Fine, Review, Announcement, Branch, sequelize } = require('./backend/src/models')
const { Op } = require('sequelize')

async function test() {
  try {
    console.log("Starting Promise.all...")
    const results = await Promise.all([
      Book.count(),
      User.count({ where: { role: 'student', status: 'active' } }),
      Borrow.count({ where: { status: 'active' } }),
      Borrow.count({ where: { status: 'overdue' } }),
      Fine.sum('amount', { where: { paid: false } }),
      Fine.sum('amount', { where: { paid: true } }),
      Borrow.count({ where: { status: 'reserved' } }),
      Review.count(),
      Review.findAll({
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg']]
      }),
      Borrow.findAll({
        limit: 8,
        order: [['created_at', 'DESC']],
        include: [
          { model: Book, attributes: ['title'] },
          { model: User, attributes: ['name'] }
        ]
      }),
      Borrow.findAll({
        where: { status: 'reserved' },
        limit: 10,
        include: [
          { model: Book, attributes: ['title', 'cover_image', 'cover_bg', 'cover_accent', 'cover_text'] },
          { model: User, attributes: ['name', 'card_id'] },
          { model: Branch, attributes: ['name'] }
        ]
      }),
      Fine.findAll({
        where: { paid: false },
        limit: 5,
        include: [
          { 
            model: Borrow, 
            attributes: ['id'],
            include: [{ model: Book, attributes: ['title'] }] 
          },
          { model: User, attributes: ['name'] }
        ]
      }),
      Announcement.findAll({ where: { is_active: true }, order: [['created_at', 'DESC']], limit: 3 }),
      Book.findAll({
        attributes: ['genre', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['genre']
      })
    ])
    console.log("Promise.all completed successfully.")
    
    const [
      totalBooks, activeMembers, activeBorrows, overdueCount,
      outstandingFines, collectedFines, pendingPickupsCount,
      totalReviews, avgRatingData, recentBorrows, pendingPickups,
      unpaidFines, announcements, genreData
    ] = results

    console.log("Attempting formatting...")
    const stats = {
      totalBooks: Number(totalBooks || 0),
      activeMembers: Number(activeMembers || 0),
      activeBorrows: Number(activeBorrows || 0),
      overdueCount: Number(overdueCount || 0),
      outstandingFines: Number(Number(outstandingFines || 0).toFixed(2)),
      collectedFines: Number(Number(collectedFines || 0).toFixed(2)),
      pendingPickupsCount: Number(pendingPickupsCount || 0),
      totalReviews: Number(totalReviews || 0),
      avgRating: Number(Number(avgRatingData[0]?.get('avg') || 0).toFixed(1)),
      recentBorrows: recentBorrows || [],
      pendingPickups: pendingPickups || [],
      unpaidFines: unpaidFines || [],
      announcements: announcements || [],
      genreStats: genreData || []
    }
    console.log("Stats formatted:", JSON.stringify(stats, null, 2))
    process.exit(0)
  } catch (err) {
    console.error("CRASH DETECTED:", err)
    process.exit(1)
  }
}

test()
