const User    = require('../models/user');
const Message = require('../models/message');

const connectedUsers = new Map(); // userId → { socketId, room }

const handleSocketConnection = (io, socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // ── Connexion utilisateur avec région géographique ─────────────────────────
  // userData : { userId, userName, region? }
  // region   : code de salle ex. "fr_75", "in_MH", "us_CA", "global"
  socket.on('userConnect', async (userData) => {
    if (!userData || !userData.userId || !userData.userName) {
      console.error('❌ Invalid user data:', userData);
      return;
    }

    const room = userData.region || 'global';
    socket.join(room);
    if (room !== 'global') socket.join('global');
    socket.userId = userData.userId;
    socket.room   = room;

    // Émettre userInfo immédiatement, sans attendre la DB
    socket.emit('userInfo', { id: userData.userId, name: userData.userName, room });

    // Persistance MongoDB en arrière-plan (non bloquante)
    try {
      let user = await User.findOne({ id: userData.userId });
      if (!user) {
        user = new User({ id: userData.userId, name: userData.userName, isOnline: true });
      } else {
        user.isOnline = true;
        user.lastSeen = new Date();
      }
      await user.save();
      connectedUsers.set(userData.userId, { socketId: socket.id, room });
      socket.to(room).to('global').emit('userConnected', { id: user.id, name: user.name });
      console.log(`✅ User ${userData.userName} connected → room [${room}]`);
    } catch (error) {
      console.error('❌ Error persisting user (non-bloquant):', error);
      connectedUsers.set(userData.userId, { socketId: socket.id, room });
      socket.to(room).to('global').emit('userConnected', { id: userData.userId, name: userData.userName });
    }
  });

  // ── Historique des messages (filtré par salle) ────────────────────────────
  socket.on('getMessageHistory', async () => {
    try {
      const room = socket.room || 'global';
      // Admin (room: 'global') voit tous les messages toutes salles confondues
      // Citoyen régional voit sa salle + global
      const roomQuery = room === 'global' ? {} : { room: { $in: [room, 'global'] } };
      const messages = (await Message.find(roomQuery)
        .sort({ createdAt: -1 })
        .limit(100)
        .lean())
        .reverse();

      socket.emit('messageHistory', messages);
      console.log(`📜 Sent ${messages.length} messages to [${room}] → ${socket.id}`);
    } catch (error) {
      console.error('❌ Error fetching message history:', error);
      socket.emit('messageHistory', []);
    }
  });

  // ── Envoi d'un message texte (broadcast dans la salle) ────────────────────
  socket.on('sendMessage', async (messageData) => {
    try {
      if (!messageData || !messageData.text || !messageData.sender) {
        console.error('❌ Invalid message data:', messageData);
        return;
      }

      const room = socket.room || 'global';
      const message = new Message({ ...messageData, room, createdAt: new Date() });
      await message.save();

      // Diffuser dans la salle régionale ET global (Socket.IO déduplique les destinataires)
      io.to(room).to('global').emit('newMessage', { ...messageData, room });
      console.log(`💬 [${room}] ${messageData.sender}: ${messageData.text.substring(0, 50)}`);
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  });

  // ── Alerte d'urgence (broadcast dans la salle) ────────────────────────────
  socket.on('sendAlert', async (alertData) => {
    try {
      const room = socket.room || 'global';
      const alertMessage = {
        id:        Date.now().toString(),
        text:      `🚨 ALERTE: ${alertData.text}`,
        sender:    'Sécurité Civile',
        senderId:  'alert_system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type:      'alert',
        room,
      };
      const message = new Message(alertMessage);
      await message.save();

      // Les alertes sont diffusées à TOUS les connectés (pas de filtre par salle)
      io.emit('alertMessage', alertData);
      console.log(`🚨 [${room}] Alert: ${alertData.text}`);
    } catch (error) {
      console.error('❌ Error sending alert:', error);
    }
  });

  // ── Vider le chat (admin uniquement) ─────────────────────────────────────
  socket.on('clearChat', async () => {
    try {
      await Message.deleteMany({});
      console.log(`🗑️ Chat cleared by ${socket.userId}`);
      io.emit('chatCleared');
    } catch (error) {
      console.error('❌ Error clearing chat:', error);
    }
  });

  // ── Déconnexion ──────────────────────────────────────────────────────────
  socket.on('disconnect', async () => {
    try {
      if (socket.userId) {
        await User.findOneAndUpdate(
          { id: socket.userId },
          { isOnline: false, lastSeen: new Date() }
        );
        const user = await User.findOne({ id: socket.userId });
        if (user) {
          const room = socket.room || 'global';
          socket.to(room).to('global').emit('userDisconnected', { id: user.id, name: user.name });
        }
        connectedUsers.delete(socket.userId);
        console.log(`👋 User ${socket.userId} disconnected from [${socket.room}]`);
      }
    } catch (error) {
      console.error('❌ Error handling disconnect:', error);
    }
  });
};

const getConnectedUsers      = () => connectedUsers;
const getConnectedUsersCount = () => connectedUsers.size;

module.exports = { handleSocketConnection, getConnectedUsers, getConnectedUsersCount };
