const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { 
  updateProfileValidator, 
  updatePasswordValidator 
} = require('../middlewares/validators/userValidator');

const router = express.Router();

// Protect all routes after this middleware
router.use(auth.protect);

router.get('/profile', userController.getProfile);
router.patch(
  '/profile',
  userController.uploadUserAvatar,
  userController.resizeUserAvatar,
  updateProfileValidator,
  validate,
  userController.updateProfile
);

router.patch(
  '/password',
  updatePasswordValidator,
  validate,
  userController.updatePassword
);

router.get('/reading-history', userController.getReadingHistory);
router.post('/reading-history', userController.updateReadingHistory);

router.patch(
  '/notifications',
  userController.updateNotificationSettings
);

module.exports = router;