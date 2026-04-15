const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true },
  text:      { type: String, required: true },
  sender:    { type: String, required: true },
  senderId:  { type: String, required: true },
  timestamp: { type: String, required: true },
  type:      { type: String, enum: ['text', 'alert', 'system', 'report'], default: 'text' },
  alertType: { type: String, default: null },
  // Salle géographique : ex. "fr_75", "us_CA", "global"
  room:      { type: String, default: 'global', index: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);