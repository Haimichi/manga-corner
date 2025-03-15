const express = require('express');
const router = express.Router();
const mangadexController = require('../controllers/mangadexController');

// Route tìm kiếm manga
router.get('/search', mangadexController.searchManga);

// Route lấy chi tiết manga
router.get('/manga/:id', mangadexController.getMangaDetails);

// Route lấy danh sách chapter
router.get('/manga/:id/chapters', mangadexController.getMangaChapters);

// Route lấy nội dung chapter
router.get('/chapter/:id', mangadexController.getChapterContent);

module.exports = router; 