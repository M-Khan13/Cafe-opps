require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', require('./routes/auth'))

app.get('/', (req, res) => res.json({ ok: true }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('mongo connected')
    app.listen(process.env.PORT, () =>
      console.log(`server on ${process.env.PORT}`))
  })
  .catch(err => console.error('mongo error', err))