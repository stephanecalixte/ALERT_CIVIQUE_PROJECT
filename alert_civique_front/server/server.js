const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alert-civique';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Message Schema
const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  text: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'alert', 'system'],
    default: 'text'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);

// User Schema
const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Store connected users with their socket IDs
const connectedUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id} from ${socket.handshake.address}`);

  // Handle user connection
  socket.on('userConnect', async (userData) => {
    try {
      console.log('📝 User data received:', userData);

      // Validate user data
      if (!userData || !userData.userId || !userData.userName) {
        console.error('❌ Invalid user data:', userData);
        return;
      }

      // Update or create user
      let user = await User.findOne({ id: userData.userId });
      if (!user) {
        user = new User({
          id: userData.userId,
          name: userData.userName,
          isOnline: true
        });
      } else {
        user.isOnline = true;
        user.lastSeen = new Date();
      }
      await user.save();

      // Store socket mapping
      connectedUsers.set(userData.userId, socket.id);
      socket.userId = userData.userId;

      // ✅ CORRECTION BUG 1 : renvoyer les infos utilisateur au client
      socket.emit('userInfo', {
        id: user.id,
        name: user.name
      });

      // Notify other users
      socket.broadcast.emit('userConnected', {
        id: user.id,
        name: user.name
      });

      console.log(`✅ User ${userData.userName} (${userData.userId}) connected`);
    } catch (error) {
      console.error('❌ Error handling user connection:', error);
    }
  });

  // Handle message history request
  socket.on('getMessageHistory', async () => {
    try {
      const messages = await Message.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .sort({ createdAt: 1 });

      socket.emit('messageHistory', messages);
      console.log(`📜 Sent ${messages.length} messages to client ${socket.id}`);
    } catch (error) {
      console.error('❌ Error fetching message history:', error);
      socket.emit('messageHistory', []);
    }
  });

  // Handle new message
  socket.on('sendMessage', async (messageData) => {
    try {
      // Validate message data
      if (!messageData || !messageData.text || !messageData.sender) {
        console.error('❌ Invalid message data:', messageData);
        return;
      }

      // Save message to database
      const message = new Message({
        ...messageData,
        createdAt: new Date()
      });
      await message.save();

      // Broadcast to all connected clients
      io.emit('newMessage', messageData);

      console.log(`💬 Message from ${messageData.sender}: ${messageData.text.substring(0, 50)}`);
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  });

  // Handle alert message
  socket.on('sendAlert', async (alertData) => {
    try {
      console.log('🚨 Alert received:', alertData);

      const alertMessage = {
        id: Date.now().toString(),
        text: `🚨 ALERTE: ${alertData.text}`,
        sender: 'Sécurité Civile',
        senderId: 'alert_system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'alert'
      };

      // Save alert to database
      const message = new Message(alertMessage);
      await message.save();

      // Broadcast alert to all clients
      io.emit('alertMessage', alertData);

      console.log(`🚨 Alert sent: ${alertData.text} (Priority: ${alertData.priority || 'medium'})`);
    } catch (error) {
      console.error('❌ Error sending alert:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    try {
      if (socket.userId) {
        // Update user status
        await User.findOneAndUpdate(
          { id: socket.userId },
          {
            isOnline: false,
            lastSeen: new Date()
          }
        );

        // Get user data for notification
        const user = await User.findOne({ id: socket.userId });
        if (user) {
          socket.broadcast.emit('userDisconnected', {
            id: user.id,
            name: user.name
          });
        }

        connectedUsers.delete(socket.userId);
        console.log(`👋 User ${socket.userId} disconnected`);
      }
    } catch (error) {
      console.error('❌ Error handling disconnect:', error);
    }
  });
});

// ========== REST API ENDPOINTS ==========

// Get all messages (last 100)
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Get online users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({ isOnline: true });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Get all users (online and offline)
app.get('/api/users/all', async (req, res) => {
  try {
    const users = await User.find().sort({ lastSeen: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Send alert via REST API
app.post('/api/alert', async (req, res) => {
  try {
    const { text, priority = 'medium' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Alert text is required' });
    }

    const alertData = { text, priority };

    // Emit alert through socket
    io.emit('alertMessage', alertData);

    // Save alert message
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
});

// Delete all messages (admin)
app.delete('/api/messages', async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ success: true, message: 'All messages deleted' });
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ error: 'Error deleting messages' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    connectedUsers: connectedUsers.size,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Alert Civique Server',
    version: '1.0.0',
    endpoints: {
      websocket: 'ws://localhost:9091',
      rest: {
        messages: 'GET /api/messages',
        users: 'GET /api/users',
        alert: 'POST /api/alert',
        health: 'GET /health'
      }
    }
  });
});

const PORT = process.env.PORT || 9091;

server.listen(PORT, () => {
  console.log(`\n🚀 ========================================`);
  console.log(`🚀 Alert Civique Server Started`);
  console.log(`🚀 ========================================`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔌 Socket.IO: http://localhost:${PORT}`);
  console.log(`🌐 REST API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`✅ MongoDB: ${MONGODB_URI}`);
  console.log(`🚀 ========================================\n`);
});