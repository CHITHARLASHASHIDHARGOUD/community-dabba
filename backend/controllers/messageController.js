const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { createNotification } = require('./notificationController');

const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate('participants', 'name avatar')
      .populate('meal', 'title images')
      .sort({ lastMessageAt: -1 })
      .lean();

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({ conversation: req.params.id });

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, recipientId, content, mealId } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    if (content.trim().length > 5000) {
      return res.status(400).json({ message: 'Message must be under 5000 characters' });
    }

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      if (!conversation.participants.some(p => p.toString() === req.user.id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (recipientId) {
      conversation = await Conversation.findOne({
        participants: { $all: [req.user.id, recipientId] },
        meal: mealId || null,
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user.id, recipientId],
          meal: mealId || undefined,
        });
      }
    } else {
      return res.status(400).json({ message: 'conversationId or recipientId required' });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      content,
    });

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .lean();

    const io = req.app.get('io');
    if (io) {
      const otherParticipant = conversation.participants.find(
        (p) => p.toString() !== req.user.id.toString()
      );

      io.to(`user:${otherParticipant.toString()}`).emit('receive-message', {
        conversationId: conversation._id,
        message: populatedMessage,
      });

      const senderUser = await require('../models/User').findById(req.user.id).select('name');
      await createNotification(
        otherParticipant.toString(),
        'new_message',
        'New Message',
        `You have a new message from ${senderUser?.name || 'someone'}`,
        { conversationId: conversation._id }
      );
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId, mealId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'recipientId is required' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, recipientId] },
      meal: mealId || null,
    })
      .populate('participants', 'name avatar')
      .populate('meal', 'title images')
      .lean();

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, recipientId],
        meal: mealId || undefined,
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar')
        .populate('meal', 'title images')
        .lean();
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getOrCreateConversation,
};
