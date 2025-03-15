const helmet = require('helmet');
const cors = require('cors');
const express = require('express');

module.exports = (app) => {
  // Bảo vệ headers
  app.use(helmet());

  // CORS config
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));

  // Giới hạn kích thước request
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
};