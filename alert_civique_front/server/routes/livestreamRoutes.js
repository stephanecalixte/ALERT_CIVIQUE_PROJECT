const express = require('express');
const router = express.Router();
const livestreamController = require('../controllers/livestreamController');

// Routes des live streams
router.post('/livestream/start', livestreamController.startStream);
router.post('/livestream/end', livestreamController.endStream);
router.post('/livestream/update', livestreamController.updateStream);
router.get('/livestream/list', livestreamController.listStreams);
router.get('/livestream/active/:userId', livestreamController.getActiveStream);
router.get('/livestream/:livestreamId', livestreamController.getStreamById);

module.exports = router;