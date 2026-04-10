const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  sender: { type: String, required: true },
  senderId: { type: String, required: true },
  timestamp: { type: String, required: true },
  type: { type: String, enum: ['text', 'alert', 'system'], default: 'text' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);