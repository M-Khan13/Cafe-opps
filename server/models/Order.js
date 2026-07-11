const mongoose = require('mongoose')

// each line item is a snapshot of the menu item at order time
const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name:       { type: String, required: true },   // copied at order time
  price:      { type: Number, required: true },   // copied at order time
  qty:        { type: Number, required: true, min: 1 }
}, { _id: false })

const orderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, min: 1, max: 10 },
  items:       { type: [orderItemSchema], required: true },
  status:      { type: String, enum: ['new', 'preparing', 'served'], default: 'new' },
  placedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cafeId:      { type: String, required: true }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)