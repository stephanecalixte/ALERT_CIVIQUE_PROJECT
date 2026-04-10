const fs = require('fs');
const path = require('path');
const Video = require('../models/video');
const { UPLOAD_DIR } = require('../config/multer');

// Upload d'une vidéo
const uploadVideo = async (req, res) => {
  try {
    console.log('📥 Received video upload request');
    
    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ error: 'Aucune vidéo envoyée' });
    }

    const { userId, livestreamId } = req.body;
    
    // Vérifier que le fichier a bien été sauvegardé
    const filePath = path.join(UPLOAD_DIR, req.file.filename);
    const fileExists = fs.existsSync(filePath);
    
    if (!fileExists) {
      console.error('❌ File not saved properly:', filePath);
      return res.status(500).json({ error: 'Erreur lors de la sauvegarde du fichier' });
    }
    
    const fileStats = fs.statSync(filePath);
    console.log('✅ File saved successfully:', {
      path: filePath,
      size: fileStats.size,
      filename: req.file.filename
    });
    
    // Générer l'URL publique
    const protocol = req.protocol === 'https' ? 'https' : 'http';
    const videoUrl = `${protocol}://${req.get('host')}/videos/${req.file.filename}`;
    
    const video = new Video({
      filename: req.file.filename,
      originalName: req.file.originalname || 'video.mp4',
      url: videoUrl,
      size: req.file.size,
      mimeType: req.file.mimetype,
      userId: userId || 'unknown',
      livestreamId: livestreamId ? parseInt(livestreamId) : null
    });
    
    await video.save();
    
    console.log(`✅ Video saved to database: ${video.videoId}`);
    
    res.json({
      success: true,
      videoId: video.videoId,
      url: videoUrl,
      filename: req.file.filename,
      size: req.file.size,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    // Nettoyer le fichier en cas d'erreur
    if (req.file && req.file.filename) {
      const filePath = path.join(UPLOAD_DIR, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted partial file: ${req.file.filename}`);
      }
    }
    res.status(500).json({ 
      error: 'Erreur lors de l\'upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Récupérer toutes les vidéos
const getVideos = async (req, res) => {
  try {
    const { userId, limit = 50 } = req.query;
    let query = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    const videos = await Video.find(query)
      .sort({ uploadedAt: -1 })
      .limit(parseInt(limit));
      
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des vidéos' });
  }
};

// Récupérer une vidéo par ID
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findOne({ videoId: req.params.videoId });
    if (!video) {
      return res.status(404).json({ error: 'Vidéo non trouvée' });
    }
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la vidéo' });
  }
};

// Supprimer une vidéo
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOne({ videoId: req.params.videoId });
    if (!video) {
      return res.status(404).json({ error: 'Vidéo non trouvée' });
    }
    
    // Supprimer le fichier physique
    const filePath = path.join(UPLOAD_DIR, video.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted video file: ${video.filename}`);
    }
    
    // Supprimer l'entrée de la base de données
    await Video.deleteOne({ videoId: req.params.videoId });
    
    res.json({ success: true, message: 'Vidéo supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la vidéo' });
  }
};

module.exports = {
  uploadVideo,
  getVideos,
  getVideoById,
  deleteVideo
};