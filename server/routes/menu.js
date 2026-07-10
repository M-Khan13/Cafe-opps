const express = require('express')
const MenuItem = require('../models/MenuItem')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/menu  — both roles read (only their own cafe's items)
router.get('/', requireAuth, async (req, res) => {
  try {
    const items = await MenuItem.find({ cafeId: req.user.cafeId })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/menu  — admin adds an item
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, price, category, available } = req.body
    if (!name || price == null)
      return res.status(400).json({ error: 'name and price required' })

    const item = await MenuItem.create({
      name, price, category, available,
      cafeId: req.user.cafeId          // from token, not client
    })
    res.status(201).json(item)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/menu/:id  — admin edits / toggles availability
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, cafeId: req.user.cafeId },   // scoped to cafe
      req.body,
      { new: true, runValidators: true }
    )
    if (!item) return res.status(404).json({ error: 'not found' })
    res.json(item)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/menu/:id  — admin removes an item
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findOneAndDelete({ _id: req.params.id, cafeId: req.user.cafeId })
    if (!item) return res.status(404).json({ error: 'not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router