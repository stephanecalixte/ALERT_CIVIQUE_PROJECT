const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
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
app.use(express.urlencoded({ extended: true }));

// ============ CONFIGURATION UPLOAD VIDÉOS ============
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuration multer pour les vidéos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format vidéo non supporté. Utilisez MP4, MOV, ou AVI.'));
    }
  }
});

// ============ MONGODB CONNECTION ============
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alert-civique';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ============ SCHEMAS ============

// Message Schema (existant)
const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  sender: { type: String, required: true },
  senderId: { type: String, required: true },
  timestamp: { type: String, required: true },
  type: { type: String, enum: ['text', 'alert', 'system'], default: 'text' },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// User Schema (existant)
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Video Schema (NOUVEAU)
const videoSchema = new mongoose.Schema({
  videoId: { type: String, unique: true, default: () => uuidv4() },
  filename: String,
  originalName: String,
  url: String,
  size: Number,
  mimeType: String,
  userId: String,
  livestreamId: Number,
  duration: Number,
  uploadedAt: { type: Date, default: Date.now }
});

const Video = mongoose.model('Video', videoSchema);

// LiveStream Schema (NOUVEAU)
const liveStreamSchema = new mongoose.Schema({
  livestreamId: { type: Number, unique: true },
  userId: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
  duration: Number,
  facing: String,
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  videoUrl: String,
  videoId: String,
  createdAt: { type: Date, default: Date.now }
});

const LiveStream = mongoose.model('LiveStream', liveStreamSchema);

// Store connected users with their socket IDs
const connectedUsers = new Map();

// ============ SOCKET.IO HANDLING ============
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id} from ${socket.handshake.address}`);

  // Handle user connection
  socket.on('userConnect', async (userData) => {
    try {
      console.log('📝 User data received:', userData);

      if (!userData || !userData.userId || !userData.userName) {
        console.error('❌ Invalid user data:', userData);
        return;
      }

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

      connectedUsers.set(userData.userId, socket.id);
      socket.userId = userData.userId;

      socket.emit('userInfo', {
        id: user.id,
        name: user.name
      });

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
      if (!messageData || !messageData.text || !messageData.sender) {
        console.error('❌ Invalid message data:', messageData);
        return;
      }

      const message = new Message({
        ...messageData,
        createdAt: new Date()
      });
      await message.save();

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

      const message = new Message(alertMessage);
      await message.save();

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
        await User.findOneAndUpdate(
          { id: socket.userId },
          { isOnline: false, lastSeen: new Date() }
        );

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

// ============ REST API ENDPOINTS ============

// --- Messages (existants) ---
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(100);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({ isOnline: true });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.get('/api/users/all', async (req, res) => {
  try {
    const users = await User.find().sort({ lastSeen: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.post('/api/alert', async (req, res) => {
  try {
    const { text, priority = 'medium' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Alert text is required' });
    }

    const alertData = { text, priority };
    io.emit('alertMessage', alertData);

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

app.delete('/api/messages', async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ success: true, message: 'All messages deleted' });
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ error: 'Error deleting messages' });
  }
});

// --- Vidéos (NOUVEAUX) ---
app.post('/api/upload/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune vidéo envoyée' });
    }

    const { userId, livestreamId } = req.body;
    const videoUrl = `${req.protocol}://${req.get('host')}/videos/${req.file.filename}`;
    
    const video = new Video({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: videoUrl,
      size: req.file.size,
      mimeType: req.file.mimetype,
      userId: userId,
      livestreamId: livestreamId ? parseInt(livestreamId) : null
    });
    
    await video.save();
    
    console.log(`✅ Vidéo uploadée: ${req.file.filename}`);
    
    res.json({
      success: true,
      videoId: video.videoId,
      url: videoUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadedAt: -1 }).limit(50);
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des vidéos' });
  }
});

app.get('/api/videos/:videoId', async (req, res) => {
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
});

// --- Live Streams (NOUVEAUX) ---
app.post('/api/livestream/start', async (req, res) => {
  try {
    const { userId, facing } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }
    
    const count = await LiveStream.countDocuments();
    const livestreamId = count + 1;
    
    const liveStream = new LiveStream({
      livestreamId,
      userId,
      facing: facing || 'back',
      startedAt: new Date(),
      status: 'active'
    });
    
    await liveStream.save();
    
    console.log(`✅ Live stream démarré: ${livestreamId} pour user ${userId}`);
    
    res.json({
      success: true,
      livestreamId,
      startedAt: liveStream.startedAt
    });
  } catch (error) {
    console.error('❌ Error starting stream:', error);
    res.status(500).json({ error: 'Erreur lors du démarrage du stream' });
  }
});

app.post('/api/livestream/end', async (req, res) => {
  try {
    const { livestreamId, endedAt, duration } = req.body;
    
    const liveStream = await LiveStream.findOneAndUpdate(
      { livestreamId },
      {
        endedAt: new Date(endedAt || Date.now()),
        duration: duration || 0,
        status: 'ended'
      },
      { new: true }
    );
    
    if (!liveStream) {
      return res.status(404).json({ error: 'Stream non trouvé' });
    }
    
    console.log(`✅ Live stream terminé: ${livestreamId}`);
    
    res.json({
      success: true,
      liveStream
    });
  } catch (error) {
    console.error('❌ Error ending stream:', error);
    res.status(500).json({ error: 'Erreur lors de l\'arrêt du stream' });
  }
});

app.post('/api/livestream/update', async (req, res) => {
  try {
    const { livestreamId, videoUrl, videoId } = req.body;
    
    const liveStream = await LiveStream.findOneAndUpdate(
      { livestreamId },
      { videoUrl, videoId },
      { new: true }
    );
    
    if (!liveStream) {
      return res.status(404).json({ error: 'Stream non trouvé' });
    }
    
    res.json({
      success: true,
      liveStream
    });
  } catch (error) {
    console.error('❌ Error updating stream:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

app.get('/api/livestream/list', async (req, res) => {
  try {
    const streams = await LiveStream.find().sort({ createdAt: -1 }).limit(50);
    res.json(streams);
  } catch (error) {
    console.error('Error listing streams:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des streams' });
  }
});

app.get('/api/livestream/:livestreamId', async (req, res) => {
  try {
    const stream = await LiveStream.findOne({ livestreamId: parseInt(req.params.livestreamId) });
    if (!stream) {
      return res.status(404).json({ error: 'Stream non trouvé' });
    }
    res.json(stream);
  } catch (error) {
    console.error('Error fetching stream:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du stream' });
  }
});

// Servir les vidéos statiquement
app.use('/videos', express.static(UPLOAD_DIR));

// Health check amélioré
app.get('/health', (req, res) => {
  const uploadDirExists = fs.existsSync(UPLOAD_DIR);
  const videosCount = uploadDirExists ? fs.readdirSync(UPLOAD_DIR).length : 0;
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    connectedUsers: connectedUsers.size,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uploadDir: uploadDirExists ? 'ready' : 'missing',
    videosCount: videosCount
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Alert Civique Server',
    version: '2.0.0',
    endpoints: {
      chat: {
        websocket: 'ws://localhost:9091',
        messages: 'GET /api/messages',
        users: 'GET /api/users',
        alert: 'POST /api/alert'
      },
      video: {
        upload: 'POST /api/upload/video',
        videos: 'GET /api/videos',
        videoById: 'GET /api/videos/:videoId'
      },
      livestream: {
        start: 'POST /api/livestream/start',
        end: 'POST /api/livestream/end',
        update: 'POST /api/livestream/update',
        list: 'GET /api/livestream/list',
        get: 'GET /api/livestream/:livestreamId'
      },
      health: 'GET /health'
    }
  });
});

// Port
const PORT = process.env.PORT || 9091;

server.listen(PORT, () => {
  console.log(`\n🚀 ========================================`);
  console.log(`🚀 Alert Civique Server Started`);
  console.log(`🚀 ========================================`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔌 Socket.IO: http://localhost:${PORT}`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api`);
  console.log(`📹 Video Upload: http://localhost:${PORT}/api/upload/video`);
  console.log(`🎥 Videos: http://localhost:${PORT}/videos/`);
  console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
  console.log(`✅ MongoDB: ${MONGODB_URI}`);
  console.log(`🚀 ========================================\n`);
});