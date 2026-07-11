const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  assignedTo:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status:        { type: String, enum: ['pending', 'done'], default: 'pending' },
  suggestedRole: { type: String, default: '' },   // hint from AI, e.g. "barista"
  cafeId:        { type: String, required: true }
}, { timestamps: true })

module.exports = mongoose.model('Task', taskSchema)