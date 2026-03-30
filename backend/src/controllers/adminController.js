const { Book, User, Borrow, Fine, Review, Announcement, Branch, sequelize } = require('../models')
const { Op } = require('sequelize')

exports.getDashboardStats = async (req, res) => {
  try {
    console.log('[Diagnostics] Starting Admin Stats Aggregation...');
    
    // 1. Core Counts
    const totalBooks = await Book.count();
    const activeMembers = await User.count({ where: { role: 'student', status: 'active' } });
    const activeBorrows = await Borrow.count({ where: { status: 'active' } });
    const overdueCount = await Borrow.count({ where: { status: 'overdue' } });
    const collectedFines = await Fine.sum('amount', { where: { paid: true } }) || 0;
    const pendingPickupsCount = await Borrow.count({ where: { status: 'reserved' } });
    const totalReviews = await Review.count();
    
    // 2. Averages
    const avgRatingRes = await Review.findAll({
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg']],
      raw: true
    });
    const avgRating = Number(avgRatingRes[0]?.avg || 0).toFixed(1);

    // 3. Lists
    const recentBorrows = await Borrow.findAll({
      limit: 8,
      order: [['created_at', 'DESC']],
      include: [
        { model: Book, attributes: ['title'] },
        { model: User, attributes: ['name'] }
      ]
    });

    const pendingPickups = await Borrow.findAll({
      where: { status: 'reserved' },
      limit: 10,
      include: [
        { model: Book, attributes: ['title', 'cover_image', 'cover_bg', 'cover_accent', 'cover_text'] },
        { model: User, attributes: ['name', 'card_id'] },
        { model: Branch, attributes: ['name'] }
      ]
    });

    const unpaidFines = await Fine.findAll({
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
    });

    const announcements = await Announcement.findAll({ 
      where: { is_active: true }, 
      order: [['created_at', 'DESC']], 
      limit: 3 
    });

    // 4. Distribution
    const genreData = await Book.findAll({
      attributes: ['genre', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['genre'],
      raw: true
    });

    const statsResponse = {
      totalBooks: Number(totalBooks),
      activeMembers: Number(activeMembers),
      activeBorrows: Number(activeBorrows),
      overdueCount: Number(overdueCount),
      collectedFines: Number(collectedFines),
      pendingPickupsCount: Number(pendingPickupsCount),
      totalReviews: Number(totalReviews),
      avgRating: avgRating,
      recentBorrows,
      pendingPickups,
      unpaidFines,
      announcements,
      genreStats: genreData.map(g => ({
        genre: g.genre || 'Unspecified',
        count: Number(g.count || 0)
      }))
    };

    console.log('[Diagnostics] Stats Aggregation Complete.');
    res.json(statsResponse);
  } catch (err) {
    console.error('[CRITICAL ERROR] Admin Stats Pipeline Failed:', err);
    res.status(500).json({ error: err.message });
  }
}

// ... existing helper methods ...
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
      order: [['created_at', 'DESC']]
    })

    res.json({
      users: rows,
      total: count,
      pages: Math.ceil(count / limit)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body
    await User.update({ status }, { where: { id: req.params.id } })
    res.json({ message: 'User status updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
