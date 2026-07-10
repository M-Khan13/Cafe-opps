const mongoose = require('mongoose')

const menuItemSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  price:     { type: Number, required: true, min: 0 },
  category:  { type: String, default: 'other' },
  available: { type: Boolean, default: true },
  cafeId:    { type: String, required: true }
}, { timestamps: true })

module.exports = mongoose.model('MenuItem', menuItemSchema)