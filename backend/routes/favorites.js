const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  toggleFavorite,
  getMyFavorites,
  isFavorited,
} = require('../controllers/favoriteController');

router.post('/:mealId', protect, toggleFavorite);
router.get('/', protect, getMyFavorites);
router.get('/check/:mealId', protect, isFavorited);

module.exports = router;
