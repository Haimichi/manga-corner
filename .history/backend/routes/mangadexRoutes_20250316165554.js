const express = require('express');
const router = express.Router();
const mangadexController = require('../controllers/mangadexController');

// Route kiểm tra API
router.get('/check', mangadexController.checkMangaDexAPI);

// Route lấy manga mới nhất
router.get('/latest', mangadexController.getLatestManga);

// Route lấy manga phổ biến
router.get('/popular', mangadexController.getPopularManga);

// Route tìm kiếm
router.get('/search', mangadexController.searchManga);

// Routes cho thông tin manga
router.get('/manga/:id', mangadexController.getMangaDetails);
router.get('/manga/:id/chapters', mangadexController.getMangaChapters);

// Routes cho chapter
router.get('/chapter/:id', mangadexController.getChapter);

module.exports = router; 