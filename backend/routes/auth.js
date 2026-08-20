const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, updateProfileSchema } = require('../validators/authValidators');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

router.get('/me', protect, authController.getMe);
router.put('/me', protect, validate(updateProfileSchema), authController.updateProfile);
router.put('/me/password', protect, authController.changePassword);

module.exports = router;
