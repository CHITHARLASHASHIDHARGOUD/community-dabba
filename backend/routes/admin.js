const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getDashboardStats,
  getPublicStats,
  getUsersOverTime,
  getMealsOverTime,
  getRequestStats,
  getCategoryStats,
  getTopDonors,
} = require('../controllers/adminController');

router.get('/stats/public', getPublicStats);
router.get('/stats', protect, admin, getDashboardStats);
router.get('/analytics/users', protect, admin, getUsersOverTime);
router.get('/analytics/meals', protect, admin, getMealsOverTime);
router.get('/analytics/requests', protect, admin, getRequestStats);
router.get('/analytics/categories', protect, admin, getCategoryStats);
router.get('/leaderboard', protect, admin, getTopDonors);

module.exports = router;
