const { Fine, Borrow, Book, User, Notification } = require('../models')
const { validationResult } = require('express-validator')

exports.getMyFines = async (req, res) => {
  try {
    const fines = await Fine.findAll({
      where: { user_id: req.user.id },
      include: [
        { 
          model: Borrow, 
          attributes: ['id', 'due_date', 'status'],
          include: [{ 
            model: Book, 
            attributes: ['id', 'title', 'author', 'cover_image', 'cover_bg', 'cover_accent', 'cover_text'] 
          }] 
        }
      ],
      order: [['created_at', 'DESC']]
    })

    const totalOutstanding = fines
      .filter(f => !f.paid)
      .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0)
    
    const totalPaid = fines
      .filter(f => f.paid)
      .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0)

    res.json({ 
      fines, 
      totalOutstanding: parseFloat(totalOutstanding.toFixed(2)), 
      totalPaid: parseFloat(totalPaid.toFixed(2)) 
    })
  } catch (err) {
    console.error('getMyFines Error:', err)
    res.status(500).json({ error: err.message })
  }
}

exports.initiatePayment = async (req, res) => {
  try {
    const fine = await Fine.findByPk(req.params.id)
    if (!fine) return res.status(404).json({ error: 'Fine not found' })
    if (fine.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })
    if (fine.paid) return res.status(400).json({ error: 'Fine already paid' })

    res.json({
      upiId: 'bookvault@upi',
      reference: `FINE-${fine.id}-BV`,
      amount: parseFloat(fine.amount).toFixed(2),
      expiresAt: Date.now() + 1800000 // 30 mins
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.confirmPayment = async (req, res) => {
  try {
    const fine = await Fine.findByPk(req.params.id)
    if (!fine) return res.status(404).json({ error: 'Fine not found' })
    if (fine.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })
    if (fine.paid) return res.status(400).json({ error: 'Fine already paid' })

    const txnId = 'TXN' + Math.floor(10000000 + Math.random() * 90000000) + 'BV'
    
    await fine.update({
      paid: true,
      paid_at: new Date(),
      txn_id: txnId
    })

    await Notification.create({
      user_id: req.user.id,
      type: 'fine_paid',
      message: `Fine of ₹${parseFloat(fine.amount).toFixed(2)} paid. Transaction ID: ${txnId}`,
      ref_id: fine.id,
      ref_type: 'fine'
    })

    res.json({ 
      message: 'Payment confirmed.', 
      txnId, 
      paidAt: fine.paid_at,
      fine // Return full updated fine record
    })
  } catch (err) {
    console.error('confirmPayment Error:', err)
    res.status(500).json({ error: err.message })
  }
}

exports.getAllFines = async (req, res) => {
  try {
    let { paid, page = 1, limit = 20 } = req.query
    page = parseInt(page)
    limit = parseInt(limit)
    const offset = (page - 1) * limit

    const where = {}
    if (paid !== undefined) where.paid = paid === 'true'

    const { count, rows } = await Fine.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, attributes: ['name', 'email', 'card_id'] },
        { 
          model: Borrow, 
          include: [{ model: Book, attributes: ['title', 'author'] }] 
        }
      ]
    })

    res.json({
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      limit
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.adminMarkPaid = async (req, res) => {
  try {
    const fine = await Fine.findByPk(req.params.id)
    if (!fine) return res.status(404).json({ error: 'Fine not found' })
    
    const txnId = 'MANUAL-' + Math.floor(10000000 + Math.random() * 90000000) + 'BV'
    await fine.update({
      paid: true,
      paid_at: new Date(),
      txn_id: txnId
    })

    res.json({ fine })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.waiveFine = async (req, res) => {
  try {
    const fine = await Fine.findByPk(req.params.id)
    if (!fine) return res.status(404).json({ error: 'Fine not found' })
    await fine.destroy()
    res.json({ message: 'Fine waived.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.issueCustomFine = async (req, res) => {
  try {
    const { borrowId, userId, amount, reason } = req.body
    
    if (!borrowId || !userId || !amount || !reason) {
      return res.status(400).json({ error: 'Missing required fields (borrowId, userId, amount, reason).' })
    }

    let fine = await Fine.findOne({ where: { borrow_id: borrowId } })
    const issueAmount = parseFloat(amount)

    if (fine) {
      // Append to existing fine
      const newAmount = parseFloat(fine.amount) + issueAmount
      const newReason = fine.reason 
        ? `${fine.reason} | Custom: ${reason}` 
        : `Custom: ${reason}`
      
      await fine.update({
        amount: newAmount,
        reason: newReason,
        // But for simplicity in this library, we'll just increment.
      })
    } else {
      fine = await Fine.create({
        borrow_id: borrowId,
        user_id: userId,
        amount: issueAmount,
        reason: `Custom: ${reason}`
      })
    }

    // Notify user
    await Notification.create({
      user_id: userId,
      type: 'fine_issued',
      message: `A custom fine of ₹${issueAmount} has been issued for your return. Reason: ${reason}`,
      ref_id: fine.id,
      ref_type: 'fine'
    })

    res.json({ 
      message: 'Custom fine issued successfully.', 
      fine 
    })
  } catch (err) {
    console.error('issueCustomFine Error:', err)
    res.status(500).json({ error: err.message })
  }
}
