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

// Notification Socket.IO → diffuse à tous les admins connectés
router.post('/livestream/notify', (req, res) => {
  const { event, data } = req.body;
  if (!event) return res.status(400).json({ error: 'event requis' });
  const io = req.app.get('io');
  if (io) io.emit(event, data || {});
  res.json({ ok: true });
});

module.exports = router;