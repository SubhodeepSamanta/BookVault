const { Borrow, Fine } = require('../models')
const { Op } = require('sequelize')

const FINE_RATE = parseFloat(
  process.env.FINE_RATE_PER_DAY || '2.00')

// Calculate fine amount for a borrow record
function calculateFine(dueDate) {
  const now = new Date()
  const due = new Date(dueDate)
  if (now <= due) return 0
  const msPerDay = 1000 * 60 * 60 * 24
  const daysOverdue = Math.ceil((now - due) / msPerDay)
  return parseFloat((daysOverdue * FINE_RATE).toFixed(2))
}

// Called by cron job every night at midnight
// Finds all active borrows past due date,
// marks them overdue, creates/updates fine records
async function processOverdueBorrows() {
  const now = new Date()

  const overdue = await Borrow.findAll({
    where: {
      status: { [Op.in]: ['active','overdue'] },
      due_date: { [Op.lt]: now },
      returned_at: null
    }
  })

  let processed = 0
  for (const borrow of overdue) {
    // Mark borrow as overdue
    await borrow.update({ status: 'overdue' })

    // Create or update fine
    const amount = calculateFine(borrow.due_date)
    const [fine, created] = await Fine.findOrCreate({
      where: { borrow_id: borrow.id },
      defaults: {
        borrow_id: borrow.id,
        user_id: borrow.user_id,
        amount
      }
    })
    if (!created && !fine.paid) {
      await fine.update({ amount })
    }
    processed++
  }

  console.log(`Fine job: processed ${processed} overdue borrows.`)
  return processed
}

module.exports = { calculateFine, processOverdueBorrows }
