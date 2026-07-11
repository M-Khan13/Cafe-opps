const express = require('express')
const { generateTasks, validateTasks } = require('../utils/ai')
const Task = require('../models/Task')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// POST /api/tasks  — admin creates/assigns a task
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, assignedTo, suggestedRole } = req.body
    if (!title) return res.status(400).json({ error: 'title required' })

    const task = await Task.create({
      title,
      assignedTo: assignedTo || null,
      suggestedRole: suggestedRole || '',
      cafeId: req.user.cafeId
    })
    res.status(201).json(task)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/tasks  — admin sees all tasks
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const tasks = await Task.find({ cafeId: req.user.cafeId })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name')
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/tasks/mine  — staff sees only their own tasks
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id, cafeId: req.user.cafeId })
      .sort({ createdAt: -1 })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/tasks/:id  — staff marks own task done
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, cafeId: req.user.cafeId })
    if (!task) return res.status(404).json({ error: 'not found' })

    // ownership guard: staff can only update a task assigned to them
    if (req.user.role !== 'admin' && String(task.assignedTo) !== req.user.id)
      return res.status(403).json({ error: 'not your task' })

    if (req.body.status) task.status = req.body.status
    await task.save()
    res.json(task)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/tasks/generate  — admin: goal -> LLM -> validated task list (NOT saved)
router.post('/generate', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { goal } = req.body
    if (!goal) return res.status(400).json({ error: 'goal required' })

    const raw = await generateTasks(goal)
    const result = validateTasks(raw)

    if (!result.valid)
      return res.status(422).json({ error: 'AI output failed validation', detail: result.error })

    res.json({ tasks: result.tasks })   // clean, safe, ready for admin to review
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
