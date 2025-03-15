const express = require('express');
const auth = require('../middlewares/auth');
const followController = require('../controllers/followController');

const router = express.Router();

// Tất cả routes đều yêu cầu xác thực
router.use(auth.protect);

router.get('/my-follows', followController.getMyFollows);
router.post('/manga/:mangaId', followController.followManga);
router.delete('/manga/:mangaId', followController.unfollowManga);
router.patch('/manga/:mangaId/notifications', followController.toggleNotifications);

module.exports = router;