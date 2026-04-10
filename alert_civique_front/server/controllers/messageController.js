const Message = require('../models/message');
const User = require('../models/user');

// Récupérer tous les messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(100);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
};

// Récupérer tous les utilisateurs en ligne
const getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({ isOnline: true });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Récupérer tous les utilisateurs (historique)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ lastSeen: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Envoyer une alerte
const sendAlert = async (req, res) => {
  try {
    const { text, priority = 'medium' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Alert text is required' });
    }

    const alertData = { text, priority };
    
    // L'alerte sera envoyée via socket dans le routeur
    res.locals.alertData = alertData;

    const alertMessage = new Message({
      id: Date.now().toString(),
      text: `🚨 ALERTE: ${text}`,
      sender: 'Sécurité Civile',
      senderId: 'alert_system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'alert'
    });
    await alertMessage.save();

    res.json({ success: true, message: 'Alert sent successfully' });
  } catch (error) {
    console.error('Error sending alert:', error);
    res.status(500).json({ error: 'Error sending alert' });
  }
};

// Supprimer tous les messages
const deleteAllMessages = async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ success: true, message: 'All messages deleted' });
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ error: 'Error deleting messages' });
  }
};

module.exports = {
  getMessages,
  getOnlineUsers,
  getAllUsers,
  sendAlert,
  deleteAllMessages
};