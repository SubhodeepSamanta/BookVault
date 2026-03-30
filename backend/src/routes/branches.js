const express = require('express')
const router = express.Router()
const branchController = require('../controllers/branchController')
const { verifyToken } = require('../middleware/auth')

router.get('/', verifyToken, branchController.getAllBranches)

module.exports = router
