require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const AppError = require('./utils/AppError');
const errorHandler = require('./middlewares/errorHandler');
const chapterRoutes = require('./routes/chapterRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const commentRoutes = require('./routes/commentRoutes');
const security = require('./middlewares/security');
const logger = require('./middlewares/logger');
const { apiLimiter } = require('./middlewares/rateLimiter');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const mangaRoutes = require('./routes/mangaRoutes');
const userRoutes = require('./routes/userRoutes');
const followRoutes = require('./routes/followRoutes');
const mangadexRoutes = require('./routes/mangadexRoutes');

const app = express();

// Middleware
app.use(helmet());
const allowedOrigins = [
  'http://localhost:3000',
  'https://yourdomain.com',
  // Thêm các domain khác nếu cần
];

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100 // giới hạn 100 request từ mỗi IP
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/manga', mangaRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/mangadex', mangadexRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Manga API' });
});

// Error handling
app.all('*', (req, res, next) => {
  next(new AppError(`Không tìm thấy ${req.originalUrl} trên server này!`, 404));
});

app.use(errorHandler);

// Thêm middleware cho định tuyến tĩnh với cache
app.use('/static', express.static(path.join(__dirname, 'public'), {
  maxAge: '1d', // Cache 1 ngày
  setHeaders: function (res, path) {
    if (path.endsWith('.jpg') || path.endsWith('.png') || path.endsWith('.gif')) {
      // Cache hình ảnh lâu hơn
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 giờ
    }
  }
}));

// Khởi động server và kết nối database
const startServer = async () => {
  try {
    await connectDB(); // Đợi kết nối database thành công
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`);
    });
  } catch (error) {
    console.error('Không thể khởi động server:', error);
    process.exit(1);
  }
};

startServer();

// Thêm xử lý lỗi global nhưng không tắt server
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Error:');
  console.error(err.name, err.message);
  console.error(err.stack);
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Error:');
  console.error(err.name, err.message);
  console.error(err.stack);
});