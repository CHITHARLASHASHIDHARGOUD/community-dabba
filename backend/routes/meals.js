const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate, createMealSchema, updateMealSchema, parseFormData } = require('../validators/mealValidators');

router.get('/', mealController.getMeals);

router.post(
  '/',
  protect,
  upload.single('image'),
  parseFormData,
  validate(createMealSchema),
  mealController.createMeal
);

router.get('/my', protect, mealController.getMyMeals);

router.get('/:id', mealController.getMealById);

router.put(
  '/:id',
  protect,
  upload.single('image'),
  parseFormData,
  validate(updateMealSchema),
  mealController.updateMeal
);

router.delete('/:id', protect, mealController.deleteMeal);

module.exports = router;
