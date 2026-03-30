const { Branch } = require('../models')

exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll()
    res.json({ branches })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}