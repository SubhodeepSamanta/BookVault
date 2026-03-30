const { Book, User, Borrow, Fine, Review, Announcement, Branch, sequelize } = require('../models')
const { Op } = require('sequelize')

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalBooks,
      activeMembers,
      activeBorrows,
      overdueCount,
      outstandingFines,
      collectedFines,
      pendingPickupsCount,
      totalReviews,
      avgRatingData,
      recentBorrows,
      pendingPickups,
      unpaidFines,
      announcements,
      genreData
    ] = await Promise.all([
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

    res.json({
      totalBooks: totalBooks || 0,
      activeMembers: activeMembers || 0,
      activeBorrows: activeBorrows || 0,
      overdueCount: overdueCount || 0,
      outstandingFines: parseFloat((outstandingFines || 0).toFixed(2)),
      collectedFines: parseFloat((collectedFines || 0).toFixed(2)),
      pendingPickupsCount: pendingPickupsCount || 0,
      totalReviews: totalReviews || 0,
      avgRating: parseFloat((avgRatingData[0]?.dataValues.avg || 0).toFixed(1)),
      recentBorrows: recentBorrows || [],
      pendingPickups: pendingPickups || [],
      unpaidFines: unpaidFines || [],
      announcements: announcements || [],
      genreStats: genreData || []
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    let { status, search, page = 1, limit = 50 } = req.query
    page = parseInt(page)
    limit = parseInt(limit)
    const offset = (page - 1) * limit

    const where = { role: 'student' }
    if (status) where.status = status
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { card_id: { [Op.like]: `%${search}%` } }
      ]
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    })

    const results = await Promise.all(rows.map(async (user) => {
      const activeBorrows = await Borrow.count({ where: { user_id: user.id, status: { [Op.in]: ['active', 'overdue'] } } })
      const totalFine = await Fine.sum('amount', { where: { user_id: user.id, paid: false } })
      return {
        ...user.toJSON(),
        activeBorrowCount: activeBorrows,
        totalFineAmount: parseFloat((totalFine || 0).toFixed(2))
      }
    }))

    res.json({
      data: results,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      limit
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot deactivate yourself' })

    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    await user.update({ status: newStatus })
    
    res.json({ user: { id: user.id, status: user.status } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
