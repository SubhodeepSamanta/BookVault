const { Borrow, Book, User, Fine, Notification, Branch } = require('../models')
const { Op } = require('sequelize')

// Helper for date calculation
const getFutureDate = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

/**
 * 1. Reserve Books for Pickup (User)
 * Can handle one or multiple book IDs (up to 3 total active/reserved)
 */
exports.reserveForPickup = async (req, res) => {
  try {
    const { bookIds, bookId, pickupDate, pickupTime, branchId } = req.body
    let ids = bookIds || bookId || []
    if (!Array.isArray(ids)) ids = [ids]

    if (!ids.length || !pickupDate || !pickupTime || !branchId) {
      return res.status(400).json({ error: 'Missing required logistics fields.' })
    }

    // Check account standing (Overdue books block new reservations)
    const overdueCount = await Borrow.count({ where: { user_id: req.user.id, status: 'overdue' } })
    if (overdueCount > 0) {
      return res.status(400).json({ error: 'Account Restricted: Please return overdue volumes first.' })
    }

    // Check total limit (max 3 active/reserved)
    const currentActive = await Borrow.count({ 
      where: { user_id: req.user.id, status: { [Op.in]: ['reserved', 'active', 'overdue'] } } 
    })
    
    if (currentActive + ids.length > 3) {
      return res.status(400).json({ error: `Limit Exceeded: You can only have 3 active books. You currently have ${currentActive}.` })
    }

    const createdBorrows = []
    for (const bId of ids) {
      const book = await Book.findByPk(bId)
      if (!book || book.available_copies <= 0) continue

      const borrow = await Borrow.create({
        user_id: req.user.id,
        book_id: bId,
        status: 'reserved',
        pickupDate,
        pickupTimeSlot: pickupTime,
        branchId,
        due_date: getFutureDate(14) // Placeholder until confirmed
      })
      
      await book.decrement('available_copies', { by: 1 })
      createdBorrows.push(borrow)
    }

    if (createdBorrows.length === 0) {
      return res.status(400).json({ error: 'No items were eligible for reservation (Stock/ID issue).' })
    }

    await Notification.create({
      user_id: req.user.id,
      type: 'book_reserved',
      message: `${createdBorrows.length} volume(s) queued for pickup on ${new Date(pickupDate).toLocaleDateString()}.`,
      ref_type: 'borrow'
    })

    res.status(201).json({ borrows: createdBorrows, message: 'Logistics queue updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * 2. Confirm Pickup (Admin)
 * Starts the 14-day countdown
 */
exports.confirmPickup = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, { include: [Book] })
    if (!borrow || borrow.status !== 'reserved') {
      return res.status(400).json({ error: 'Invalid or missing reservation.' })
    }

    const duration = 14
    const dueDate = getFutureDate(duration)

    await borrow.update({
      status: 'active',
      borrowed_at: new Date(),
      due_date: dueDate
    })

    await Notification.create({
      user_id: borrow.user_id,
      type: 'pickup_confirmed',
      message: `Pickup confirmed for "${borrow.Book.title}". Due date set to ${dueDate.toLocaleDateString()}.`,
      ref_id: borrow.id,
      ref_type: 'borrow'
    })

    res.json({ message: 'Collection recorded. Countdown started.', borrow })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * 3. Request Extension (User)
 * One-time 14-day extension request
 */
exports.requestExtension = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id)
    if (!borrow || borrow.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })
    
    if (borrow.hasExtended) return res.status(400).json({ error: 'Renewal limit reached for this volume.' })
    if (borrow.status !== 'active' && borrow.status !== 'overdue') return res.status(400).json({ error: 'Only active loans can be extended.' })

    await borrow.update({ extensionStatus: 'requested' })

    res.json({ message: 'Renewal request submitted to archives.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * 4. Approve Extension (Admin)
 */
exports.approveExtension = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, { include: [Book] })
    if (!borrow) return res.status(404).json({ error: 'Record not found' })

    const newDueDate = new Date(borrow.due_date)
    newDueDate.setDate(newDueDate.getDate() + 14)

    await borrow.update({
      due_date: newDueDate,
      hasExtended: true,
      extensionStatus: 'approved'
    })

    await Notification.create({
      user_id: borrow.user_id,
      type: 'extension_approved',
      message: `Extension approved for "${borrow.Book.title}". New due date: ${newDueDate.toLocaleDateString()}.`,
      ref_id: borrow.id,
      ref_type: 'borrow'
    })

    res.json({ message: 'Extension finalized.', borrow })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * 5. Schedule Return (User)
 */
exports.scheduleReturn = async (req, res) => {
  try {
    const { returnDate, returnTime, branchId } = req.body
    const borrow = await Borrow.findByPk(req.params.id)
    
    if (!borrow || borrow.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })

    await borrow.update({
      returnStatus: 'scheduled',
      returnDate,
      returnTimeSlot: returnTime,
      branchId: branchId || borrow.branchId
    })

    res.json({ message: 'Return logistics scheduled.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * 6. Confirm Return (Admin)
 * Finishes the lifecycle and restocks inventory
 */
exports.confirmReturn = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, { include: [Book] })
    if (!borrow) return res.status(404).json({ error: 'Record not found' })

    await borrow.update({
      status: 'returned',
      returnStatus: 'returned',
      returned_at: new Date()
    })

    await borrow.Book.increment('available_copies', { by: 1 })

    await Notification.create({
      user_id: borrow.user_id,
      type: 'return_confirmed',
      message: `Archives updated: "${borrow.Book.title}" has been successfully returned.`,
      ref_id: borrow.id,
      ref_type: 'borrow'
    })

    res.json({ message: 'Inventory restocked. Lifecycle complete.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Existing Methods (Standardized)
 */
exports.getMyBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Book, attributes: ['id', 'title', 'author', 'cover_image', 'cover_bg', 'cover_accent', 'cover_text', 'genre', 'pages', 'available_copies', 'total_copies'] },
        { model: Branch, attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']]
    })
    res.json({ borrows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getAllBorrows = async (req, res) => {
  try {
    let { status, extensionStatus, returnStatus, page = 1, limit = 50 } = req.query
    const where = {}
    if (status) where.status = status
    if (extensionStatus) where.extensionStatus = extensionStatus
    if (returnStatus) where.returnStatus = returnStatus

    const borrows = await Borrow.findAll({
      where,
      include: [
        { model: User, attributes: ['name', 'email', 'card_id'] },
        { model: Book, attributes: ['id', 'title', 'author', 'available_copies', 'total_copies'] },
        { model: Branch, attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']]
    })

    res.json({ data: borrows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.batchRestockExpired = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const expired = await Borrow.findAll({
      where: { status: 'reserved', pickupDate: { [Op.lt]: today } },
      include: [Book]
    })

    for (const b of expired) {
      await b.update({ status: 'cancelled' })
      await b.Book.increment('available_copies', { by: 1 })
    }

    res.json({ message: `${expired.length} expired reservations restocked.` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
