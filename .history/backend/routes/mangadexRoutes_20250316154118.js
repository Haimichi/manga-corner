const express = require('express');
const router = express.Router();
const mangadexController = require('../controllers/mangadexController');

// Route kiểm tra API
router.get('/check', mangadexController.checkMangaDexAPI);

// Routes cho manga mới và phổ biến
router.get('/latest', mangadexController.getLatestManga);
router.get('/popular', mangadexController.getPopularManga);

// Route tìm kiếm
router.get('/search', mangadexController.searchManga);

// Routes cho thông tin manga
router.get('/manga/:id', mangadexController.getMangaDetails);
router.get('/manga/:id/chapters', mangadexController.getMangaChapters);

// Routes cho chapter
router.get('/chapter/:chapterId', mangadexController.getChapterDetails);
router.get('/chapter/:chapterId/pages', mangadexController.getChapterPages);

module.exports = router; 