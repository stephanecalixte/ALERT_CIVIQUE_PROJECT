const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { upload } = require('../config/multer');

// Routes des vidéos
router.post('/upload/video', upload.single('video'), videoController.uploadVideo);
router.get('/videos', videoController.getVideos);
router.get('/videos/:videoId', videoController.getVideoById);
router.delete('/videos/:videoId', videoController.deleteVideo);

module.exports = router;