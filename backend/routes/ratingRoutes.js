const express = require('express');
const ratingController = require('../controllers/ratingController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router({ mergeParams: true });

router.get('/', ratingController.getMangaRatings);

router.use(auth.protect);
router.post('/', ratingController.createRating);

module.exports = router; 