const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  logout,
  logoutAll
} = require('../controllers/auth/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);

module.exports = router;
