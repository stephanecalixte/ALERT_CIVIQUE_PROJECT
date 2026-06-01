const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const videoSchema = new mongoose.Schema({
  videoId: { type: String, unique: true, default: () => uuidv4() },
  filename: { type: String, required: true },
  originalName: String,
  url: { type: String, required: true },
  size: Number,
  mimeType: String,
  userId: String,
  livestreamId: Number,
  duration: Number,
  thumbnailUrl: String,
  uploadedAt: { type: Date, default: Date.now }
});

// Ajouter des index pour les recherches
videoSchema.index({ userId: 1, uploadedAt: -1 });
videoSchema.index({ livestreamId: 1 });

module.exports = mongoose.model('Video', videoSchema);