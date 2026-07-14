const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const { signToken } = require('../utils/token')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })

    res.json({ token: signToken(user), user: safeUser(user) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/staff  — admin creates a staff account
router.post('/staff', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, jobTitle } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ error: 'missing fields' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ error: 'email already used' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name, email, passwordHash,
      role: 'staff',
      jobTitle: jobTitle || '',
      cafeId: req.user.cafeId
    })

    res.status(201).json({ user: safeUser(user) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// never send passwordHash back to the client
function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, jobTitle: user.jobTitle, cafeId: user.cafeId }
}
// GET /api/auth/staff  — admin lists all staff in their cafe (for assignment dropdown)
router.get('/staff', requireAuth, requireAdmin, async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff', cafeId: req.user.cafeId })
      .select('name jobTitle')      // only what the dropdown needs
    res.json(staff)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router