const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const { signToken } = require('../utils/token')

const router = express.Router()

// POST /api/auth/register  (bootstrap/testing — we'll lock this down later)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, jobTitle, cafeId } = req.body
    if (!name || !email || !password || !cafeId)
      return res.status(400).json({ error: 'missing fields' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ error: 'email already used' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash, role, jobTitle, cafeId })

    res.status(201).json({ token: signToken(user), user: safeUser(user) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

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

// never send passwordHash back to the client
function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, jobTitle: user.jobTitle, cafeId: user.cafeId }
}

module.exports = router