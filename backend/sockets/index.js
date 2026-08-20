const jwt = require('jsonwebtoken');
const User = require('../models/User');

const onlineUsers = new Map();

const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    socket.join(`user:${userId}`);

    socket.on('join', (room) => {
      if (typeof room === 'string' && room.startsWith('user:')) {
        socket.join(room);
      }
    });

    socket.on('typing', (data) => {
      const { recipientId, conversationId } = data;
      if (!recipientId || !conversationId) return;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing', {
          conversationId,
          userId,
        });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
    });
  });
};

module.exports = {
  setupSocket,
  onlineUsers,
};
