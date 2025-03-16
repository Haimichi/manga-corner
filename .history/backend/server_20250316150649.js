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
const cookieParser = require('cookie-parser');
const auth = require('./middlewares/auth');

// Import routes
const authRoutes = require('./routes/authRoutes');
const mangaRoutes = require('./routes/mangaRoutes');
const userRoutes = require('./routes/userRoutes');
const followRoutes = require('./routes/followRoutes');
const mangadexRoutes = require('./routes/mangadexRoutes');

const app = express();

// Cấu hình CORS đầy đủ
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://manga-corner.vercel.app',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  // Thêm các domain frontend khác nếu cần
];

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Middleware bảo mật
app.use(helmet({
  contentSecurityPolicy: false, // Tắt CSP để tránh lỗi với các resources bên ngoài
  crossOriginEmbedderPolicy: false
}));

// Middleware cơ bản
app.use(express.json({ limit: '10mb' })); // Tăng giới hạn payload
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Cấu hình cookie-parser
app.use(cookieParser());

// Thêm middleware logging cho request
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body).substring(0, 200) + (JSON.stringify(req.body).length > 200 ? '...' : ''));
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // giới hạn 100 request từ mỗi IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Quá nhiều request, vui lòng thử lại sau.' }
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mangadex/latest', mangadexRoutes);
app.use('/api/mangadex/popular', mangadexRoutes);

// Middleware bảo vệ các routes còn lại
app.use(auth.protect);

// Các routes cần xác thực
app.use('/api/manga', mangaRoutes);
app.use('/api/user', userRoutes);
app.use('/api/follow', followRoutes);
app.use('/', chapterRoutes);
app.use('/', ratingRoutes);
app.use('/', commentRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Manga API', status: 'running' });
});

// Route CORS test
app.get('/api/cors-test', (req, res) => {
  res.json({ 
    message: 'CORS is working correctly',
    clientOrigin: req.headers.origin || 'No origin header',
    timestamp: new Date().toISOString()
  });
});

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

// Error handling middleware - 404 Not Found
app.all('*', (req, res, next) => {
  next(new AppError(`Không tìm thấy ${req.originalUrl} trên server này!`, 404));
});

// Error handler
app.use(errorHandler);

// Khởi động server và kết nối database
const startServer = async () => {
  try {
    await connectDB(); // Đợi kết nối database thành công
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`);
      console.log(`CORS cho phép: ${allowedOrigins.join(', ')}`);
      console.log(`Môi trường: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Không thể khởi động server:', error);
    process.exit(1);
  }
};

startServer();

// Xử lý lỗi bất đồng bộ không bắt được
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Error:');
  console.error(err.name, err.message);
  console.error(err.stack);
});

// Xử lý ngoại lệ không bắt được
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Error:');
  console.error(err.name, err.message);
  console.error(err.stack);
});