const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Routes des messages
router.get('/messages', messageController.getMessages);
router.get('/users', messageController.getOnlineUsers);
router.get('/users/all', messageController.getAllUsers);
router.post('/alert', messageController.sendAlert);
router.delete('/messages', messageController.deleteAllMessages);

module.exports = router;
