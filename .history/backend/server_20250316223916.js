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

// Thêm cấu hình CORS đầy đủ hơn
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Đăng ký routes - XÓA dòng const routes = require('./routes') và thêm các route sau
// Đăng ký với prefix /api trước
app.use('/api/auth', authRoutes);
app.use('/api/manga', mangaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mangadex', mangadexRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/follows', followRoutes);

// Đồng thời đăng ký không có prefix /api để tương thích ngược
app.use('/auth', authRoutes);
app.use('/manga', mangaRoutes);
app.use('/mangadex', mangadexRoutes);
app.use('/chapters', chapterRoutes);

// Routes
// app.use('/', routes); // Sử dụng routes đã được định nghĩa ở routes/index.js

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
      console.log(`CORS cho phép: ${['http://localhost:3000', 'http://127.0.0.1:3000'].join(', ')}`);
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

// Serve static files trong production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Kết nối MongoDB thành công');
  })
  .catch((err) => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// Thêm middleware để log tất cả các request đến server
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

module.exports = app;