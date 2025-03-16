const express = require('express');
const router = express.Router();
const mangadexController = require('../controllers/mangadexController');

// Routes cho MangaDex API
router.get('/search', mangadexController.searchManga);
router.get('/manga/:id', mangadexController.getMangaById);
router.get('/manga/:id/chapters', mangadexController.getChapters);
router.get('/chapter/:id', mangadexController.getChapterById);
router.get('/chapter/:id/pages', mangadexController.getChapterPages);
router.get('/latest', mangadexController.getLatestManga);
router.get('/popular', mangadexController.getPopularManga);
router.get('/manga/:id', mangadexController.getMangaDetails);
router.get('/manga/:mangaId/chapters', mangadexController.getMangaChapters);
router.get('/chapter/:chapterId', mangadexController.getChapterDetails);

// Route để kiểm tra kết nối với MangaDex API
router.get('/check', mangadexController.checkMangaDexAPI);

// Thêm routes mới
router.get('/vietnamese', mangadexController.getAllVietnameseManga);
router.get('/vietnamese/search', mangadexController.searchVietnameseManga);

module.exports = router; 