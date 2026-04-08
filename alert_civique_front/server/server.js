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
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// ============ CONFIGURATION UPLOAD VIDÉOS ============
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'videos');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`📁 Created upload directory: ${UPLOAD_DIR}`);
}

// Configuration multer pour les vidéos avec meilleure gestion des erreurs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Vérifier que le dossier existe toujours
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Gérer le cas où originalname est undefined
    const originalName = file.originalname || 'video.mp4';
    const ext = path.extname(originalName);
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
    // Support plus de formats vidéo
    const allowedTypes = [
      'video/mp4', 
      'video/mpeg', 
      'video/quicktime', 
      'video/x-msvideo',
      'video/3gpp',
      'video/x-matroska',
      'video/webm'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
      err.message = `Format vidéo non supporté: ${file.mimetype}. Utilisez MP4, MOV, 3GP, ou AVI.`;
      cb(err);
    }
  }
});

// ============ MONGODB CONNECTION ============
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alert-civique';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
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

// Video Schema (amélioré)
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

// Ajouter un index pour les recherches
videoSchema.index({ userId: 1, uploadedAt: -1 });
videoSchema.index({ livestreamId: 1 });

const Video = mongoose.model('Video', videoSchema);

// LiveStream Schema (amélioré)
const liveStreamSchema = new mongoose.Schema({
  livestreamId: { type: Number, unique: true },
  userId: { type: String, required: true, index: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
  duration: Number,
  facing: String,
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  videoUrl: String,
  videoId: String,
  createdAt: { type: Date, default: Date.now }
});

// Ajouter des index
liveStreamSchema.index({ userId: 1, status: 1 });
liveStreamSchema.index({ createdAt: -1 });

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

// --- Vidéos (amélioré avec meilleure gestion des erreurs) ---
app.post('/api/upload/video', upload.single('video'), async (req, res) => {
  try {
    console.log('📥 Received video upload request');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
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
      filename: req.file.filename,
      originalName: req.file.originalname
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
    console.log(`🔗 Public URL: ${videoUrl}`);
    
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
});

app.get('/api/videos', async (req, res) => {
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

app.delete('/api/videos/:videoId', async (req, res) => {
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
});

// --- Live Streams (amélioré) ---
app.post('/api/livestream/start', async (req, res) => {
  try {
    const { userId, facing } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }

    // Vérifier s'il y a déjà un stream actif pour cet utilisateur
    const existingStream = await LiveStream.findOne({ userId, status: 'active' });
    if (existingStream) {
      console.log(`⚠️ User ${userId} already has an active stream: ${existingStream.livestreamId}`);
      return res.json({
        success: true,
        livestreamId: existingStream.livestreamId,
        startedAt: existingStream.startedAt,
        existing: true
      });
    }

    // Générer un nouvel ID unique
    const lastStream = await LiveStream.findOne().sort({ livestreamId: -1 });
    const livestreamId = lastStream ? lastStream.livestreamId + 1 : 1;

    const liveStream = new LiveStream({
      livestreamId,
      userId,
      facing: facing || 'back',
      startedAt: new Date(),
      status: 'active'
    });

    await liveStream.save();

    console.log(`✅ Live stream started: ${livestreamId} for user ${userId}`);

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

    if (!livestreamId) {
      return res.status(400).json({ error: 'livestreamId requis' });
    }

    const liveStream = await LiveStream.findOneAndUpdate(
      { livestreamId },
      {
        endedAt: endedAt ? new Date(endedAt) : new Date(),
        duration: duration || 0,
        status: 'ended'
      },
      { new: true }
    );

    if (!liveStream) {
      return res.status(404).json({ error: 'Stream non trouvé' });
    }

    console.log(`✅ Live stream ended: ${livestreamId} for user ${liveStream.userId}`);

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

    if (!livestreamId) {
      return res.status(400).json({ error: 'livestreamId requis' });
    }

    const liveStream = await LiveStream.findOneAndUpdate(
      { livestreamId },
      { videoUrl, videoId },
      { new: true }
    );

    if (!liveStream) {
      return res.status(404).json({ error: 'Stream non trouvé' });
    }

    console.log(`✅ Live stream updated: ${livestreamId} with video ${videoId}`);

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
    const { userId, status, limit = 50 } = req.query;
    let query = {};

    if (userId) query.userId = userId;
    if (status) query.status = status;

    const streams = await LiveStream.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(streams);
  } catch (error) {
    console.error('Error listing streams:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des streams' });
  }
});

app.get('/api/livestream/active/:userId', async (req, res) => {
  try {
    const stream = await LiveStream.findOne({
      userId: req.params.userId,
      status: 'active'
    });

    if (!stream) {
      return res.status(404).json({ error: 'Aucun stream actif trouvé' });
    }

    res.json(stream);
  } catch (error) {
    console.error('Error fetching active stream:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du stream actif' });
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

// Servir les vidéos statiquement avec configuration CORS
app.use('/videos', express.static(UPLOAD_DIR, {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }
}));

// Health check amélioré
app.get('/health', (req, res) => {
  const uploadDirExists = fs.existsSync(UPLOAD_DIR);
  let videosCount = 0;
  let uploadDirSize = 0;
  
  if (uploadDirExists) {
    try {
      const files = fs.readdirSync(UPLOAD_DIR);
      videosCount = files.length;
      
      // Calculer la taille totale du dossier
      files.forEach(file => {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = fs.statSync(filePath);
        uploadDirSize += stats.size;
      });
    } catch (error) {
      console.error('Error reading upload directory:', error);
    }
  }
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connectedUsers: connectedUsers.size,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uploadDir: uploadDirExists ? 'ready' : 'missing',
    videosCount: videosCount,
    uploadDirSize: `${(uploadDirSize / (1024 * 1024)).toFixed(2)} MB`,
    memoryUsage: process.memoryUsage()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Alert Civique Server',
    version: '2.1.0',
    description: 'Serveur pour l\'application Alert Civique avec support vidéo',
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
        videoById: 'GET /api/videos/:videoId',
        deleteVideo: 'DELETE /api/videos/:videoId'
      },
      livestream: {
        start: 'POST /api/livestream/start',
        end: 'POST /api/livestream/end',
        update: 'POST /api/livestream/update',
        list: 'GET /api/livestream/list',
        active: 'GET /api/livestream/active/:userId',
        get: 'GET /api/livestream/:livestreamId'
      },
      system: {
        health: 'GET /health',
        root: 'GET /'
      }
    },
    documentation: 'Pour utiliser l\'API vidéo, envoyez un fichier multipart/form-data avec le champ "video"'
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.path,
    method: req.method
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Fichier trop volumineux. Maximum 100MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: err.message 
  });
});

// Port
const PORT = process.env.PORT || 9091;

server.listen(PORT, '0.0.0.0', () => {
  // Récupère l'IP locale pour l'afficher (utile pour les vrais appareils)
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const localIps = [];
  for (const iface of Object.values(nets)) {
    for (const net of iface) {
      if (net.family === 'IPv4' && !net.internal) {
        localIps.push(net.address);
      }
    }
  }

  console.log(`\n🚀 ========================================`);
  console.log(`🚀 Alert Civique Server Started`);
  console.log(`🚀 ========================================`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🖥️  Émulateur Android : http://10.0.2.2:${PORT}`);
  console.log(`📱 Vrais appareils   : http://<IP_CI-DESSOUS>:${PORT}`);
  localIps.forEach(ip => console.log(`   → http://${ip}:${PORT}`));
  console.log(`📹 Video Upload: /api/upload/video`);
  console.log(`🎥 Videos: /videos/`);
  console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
  console.log(`✅ MongoDB: ${MONGODB_URI}`);
  console.log(`🚀 ========================================\n`);
});

// Gestion de l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(async () => {
    console.log('✅ Server closed');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});