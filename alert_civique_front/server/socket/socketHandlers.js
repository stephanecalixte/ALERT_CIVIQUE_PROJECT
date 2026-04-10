const User = require('../models/user');
const Message = require('../models/message');

const connectedUsers = new Map();

const handleSocketConnection = (io, socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

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
      console.log(`🚨 Alert sent: ${alertData.text}`);
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
};

const getConnectedUsers = () => connectedUsers;
const getConnectedUsersCount = () => connectedUsers.size;

module.exports = { handleSocketConnection, getConnectedUsers, getConnectedUsersCount };