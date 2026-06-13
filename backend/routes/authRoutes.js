const express = require('express');
const { loginUser, logoutUser, getMe, updatePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;
