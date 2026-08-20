const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, userController.getUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/status', protect, admin, userController.blockUser);
router.patch('/:id/verify', protect, admin, userController.verifyUser);

module.exports = router;
