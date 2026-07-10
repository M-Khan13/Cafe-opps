require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('./models/User')

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)

  const email = 'owner@cafe.com'
  const exists = await User.findOne({ email })
  if (exists) {
    console.log('admin already exists')
    return process.exit(0)
  }

  const passwordHash = await bcrypt.hash('admin123', 10)
  await User.create({
    name: 'Cafe Owner',
    email,
    passwordHash,
    role: 'admin',
    jobTitle: 'Owner',
    cafeId: 'cafe1'
  })

  console.log('admin seeded:', email, '/ admin123')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })