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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alert-civique')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Message Schema
const messageSchema = new mongoose.Schema({
  id: String,
  text: String,
  sender: String,
  senderId: String,
  timestamp: String,
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
  id: String,
  name: String,
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

// Store connected users
const connectedUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user connection
  socket.on('userConnect', async (userData) => {
    try {
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

      // Notify other users
      socket.broadcast.emit('userConnected', {
        id: user.id,
        name: user.name
      });

      console.log(`User ${userData.userName} connected`);
    } catch (error) {
      console.error('Error handling user connection:', error);
    }
  });

  // Handle message history request
  socket.on('getMessageHistory', async () => {
    try {
      const messages = await Message.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .sort({ createdAt: 1 }); // Re-sort to ascending

      socket.emit('messageHistory', messages);
    } catch (error) {
      console.error('Error fetching message history:', error);
    }
  });

  // Handle new message
  socket.on('sendMessage', async (messageData) => {
    try {
      // Save message to database
      const message = new Message(messageData);
      await message.save();

      // Broadcast to all connected clients
      io.emit('newMessage', messageData);

      console.log(`Message from ${messageData.sender}: ${messageData.text}`);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Handle alert message
  socket.on('sendAlert', async (alertData) => {
    try {
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

      console.log(`Alert sent: ${alertData.text}`);
    } catch (error) {
      console.error('Error sending alert:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    try {
      // Find user by socket id
      let disconnectedUser = null;
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUser = userId;
          connectedUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUser) {
        // Update user status
        await User.findOneAndUpdate(
          { id: disconnectedUser },
          { isOnline: false, lastSeen: new Date() }
        );

        // Get user data for notification
        const user = await User.findOne({ id: disconnectedUser });
        if (user) {
          socket.broadcast.emit('userDisconnected', {
            id: user.id,
            name: user.name
          });
        }

        console.log(`User ${disconnectedUser} disconnected`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// API Routes
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({ isOnline: true });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.post('/api/alert', async (req, res) => {
  try {
    const { text, priority = 'medium' } = req.body;

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
    res.status(500).json({ error: 'Error sending alert' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready`);
});
