const express = require('express');
const router = express.Router();
const mangadexController = require('../controllers/mangadexController');

// API lấy danh sách manga
router.get('/search', mangadexController.searchManga);

// API lấy chi tiết manga
router.get('/manga/:mangaId', mangadexController.getMangaDetail);

// API lấy danh sách chapter của manga
router.get('/manga/:mangaId/chapters', mangadexController.getMangaChapters);

// API lấy chi tiết chapter
router.get('/chapter/:chapterId', mangadexController.getChapterDetail);

// API lấy các trang của chapter
router.get('/chapter/:chapterId/pages', mangadexController.getChapterPages);

// Thêm routes mới
router.get('/vietnamese', mangadexController.getAllVietnameseManga);
router.get('/vietnamese/search', mangadexController.searchVietnameseManga);

module.exports = router; 