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

// Import routes
const authRoutes = require('./routes/authRoutes');
const mangaRoutes = require('./routes/mangaRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
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
app.use('/api/manga', mangaRoutes);
app.use('/api/users', userRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Manga API' });
});

// Error handling
app.all('*', (req, res, next) => {
  next(new AppError(`Không tìm thấy ${req.originalUrl} trên server này!`, 404));
});

app.use(errorHandler);

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