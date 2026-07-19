const express = require('express')
const Order = require('../models/Order')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// POST /api/orders  — staff (or admin) places an order
router.post('/', requireAuth, async (req, res) => {
  try {
    const { tableNumber, items } = req.body
    if (!tableNumber || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'tableNumber and items required' })

    const order = await Order.create({
      tableNumber,
      items,
      placedBy: req.user.id,
      cafeId: req.user.cafeId
    })
    const populated = await order.populate('placedBy', 'name')
    req.app.get('io').emit('order:new', populated)

    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/orders  — admin sees the live feed (newest first)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ cafeId: req.user.cafeId })
      .sort({ createdAt: -1 })
      .populate('placedBy', 'name')
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/orders/:id  — admin moves status
const FLOW = { new: 'preparing', preparing: 'served' }
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    if (!['new', 'preparing', 'served'].includes(status))
      return res.status(400).json({ error: 'invalid status' })

    const order = await Order.findOne({ _id: req.params.id, cafeId: req.user.cafeId })
    if (!order) return res.status(404).json({ error: 'not found' })

    // guard: only allow forward transitions
    if (FLOW[order.status] !== status)
      return res.status(400).json({ error: `cannot go ${order.status} → ${status}` })

    order.status = status
    await order.save()
    const populated = await order.populate('placedBy', 'name')
    req.app.get('io').emit('order:update', populated)
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router