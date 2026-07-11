require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', require('./routes/auth'))
const { requireAuth, requireAdmin } = require('./middleware/auth')
app.use('/api/menu', require('./routes/menu'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/tasks', require('./routes/tasks'))

app.get('/api/me', requireAuth, (req, res) => res.json({ user: req.user }))
app.get('/api/admin-only', requireAuth, requireAdmin, (req, res) => res.json({ secret: 'admins see this' }))

app.get('/', (req, res) => res.json({ ok: true }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('mongo connected')
    app.listen(process.env.PORT, () =>
      console.log(`server on ${process.env.PORT}`))
  })
  .catch(err => console.error('mongo error', err))