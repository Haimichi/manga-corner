const express = require('express');
const router = express.Router();
const mangadexController = require('../controllers/mangadexController');

// Log đã hiển thị các methods có sẵn trong controller:
// 'searchManga', 'getMangaDetails', 'getMangaChapters', 'getChapterContent',
// 'getAllVietnameseManga', 'searchVietnameseManga', 'getMangaDetail',
// 'getChapterDetail', 'getChapterPages', 'getLatestManga', 'getMangaById',
// 'getChapters', 'getChapterById', 'getPopularManga', 'checkMangaDexAPI',
// 'getChapterDetails'

// Route lấy manga mới nhất
router.get('/latest', mangadexController.getLatestManga);

// Route lấy manga phổ biến
router.get('/popular', mangadexController.getPopularManga);

// Route lấy chi tiết manga theo ID
router.get('/manga/:id', mangadexController.getMangaDetails);

// Route lấy danh sách chapter của manga
router.get('/manga/:id/chapters', mangadexController.getMangaChapters);

// Route lấy thông tin chapter
router.get('/chapter/:id', mangadexController.getChapterDetail);

// Route lấy nội dung chapter
router.get('/chapter/:id/content', mangadexController.getChapterContent);

// Route tìm kiếm manga
router.get('/search', mangadexController.searchManga);

// Route kiểm tra API MangaDex
router.get('/check', mangadexController.checkMangaDexAPI);

module.exports = router; 