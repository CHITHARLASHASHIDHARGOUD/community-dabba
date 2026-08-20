const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createFeedback,
  getFeedbackForUser,
  getMyFeedback,
} = require('../controllers/feedbackController');

router.post('/', protect, createFeedback);
router.get('/user/:userId', getFeedbackForUser);
router.get('/my', protect, getMyFeedback);

module.exports = router;
