const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  getOrCreateConversation,
} = require('../controllers/messageController');

router.get('/conversations', protect, getConversations);
router.get('/conversations/:id', protect, getMessages);
router.post('/', protect, sendMessage);
router.post('/conversations', protect, getOrCreateConversation);

module.exports = router;
