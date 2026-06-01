const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
  livestreamId: { type: Number, unique: true },
  userId: { type: String, required: true, index: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
  duration: Number,
  facing: String,
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  videoUrl: String,
  videoId: String,
  createdAt: { type: Date, default: Date.now }
});

// Ajouter des index
liveStreamSchema.index({ userId: 1, status: 1 });
liveStreamSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LiveStream', liveStreamSchema);